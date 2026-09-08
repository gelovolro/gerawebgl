import test, { afterEach }                 from 'node:test';
import assert                              from 'node:assert/strict';
import * as WebGLContextConstants          from '../../../core/constants/webgl-context.js';
import { WebGLContext }                    from '../../../core/webgl-context.js';
import { withFakeBrowserWebGLEnvironment } from '../../helpers/fake-browser-webgl-environment.mjs';

class WebGLContextTestFixtures {
    // Canvas display sizes, used by resize tests
    static DISPLAY_WIDTH  = 321;
    static DISPLAY_HEIGHT = 181;

    // Fractional pixel ratio, used to check rounding of both buffer dimensions
    static FRACTIONAL_DEVICE_PIXEL_RATIO = 1.5;
    static EXPECTED_SCALED_WIDTH         = 481;
    static EXPECTED_SCALED_HEIGHT        = 271;

    // Window size and pixel ratio, used by the 'fitToWindow' test
    static WINDOW_WIDTH                  = 801;
    static WINDOW_HEIGHT                 = 601;
    static HIGH_DEVICE_PIXEL_RATIO       = 2;
    static EXPECTED_WINDOW_BUFFER_WIDTH  = 1602;
    static EXPECTED_WINDOW_BUFFER_HEIGHT = 1202;

    // Pixel ratio below one, used to check the minimum buffer size
    static LOW_DEVICE_PIXEL_RATIO = 0.5;

    // Distinct components, used to check clear color argument order
    static UPDATED_CLEAR_COLOR = Object.freeze([0.2, 0.4, 0.6, 0.8]);

    // Component names, used to check color validation errors
    static COLOR_COMPONENT_NAMES = Object.freeze(['red', 'green', 'blue', 'alpha']);

    // Non-boolean values, used by depth-test and resize option tests
    static INVALID_BOOLEAN_VALUES = Object.freeze([undefined, null, 0, 1, 'true', {}, []]);

    // Invalid clear color components, grouped by the expected error type
    static INVALID_COLOR_TYPE_VALUES  = Object.freeze([undefined, null, '0.5', true, {}, [], Number.NaN]);
    static INVALID_COLOR_RANGE_VALUES = Object.freeze([-0.1, 1.1, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY]);

    static createFixture(environment) {
        const canvas              = environment.createCanvas();
        const renderingContext    = canvas.context;
        const contextRequests     = [];
        const enabledCapabilities = [];
        const depthFuncCalls      = [];
        const clearColorCalls     = [];
        const viewportCalls       = [];
        const clearCalls          = [];
        const originalGetContext  = canvas.getContext.bind(canvas);

        canvas.getContext = (type) => {
            contextRequests.push(type);
            return originalGetContext(type);
        };

        renderingContext.enable     = (capability) => { enabledCapabilities.push(capability); };
        renderingContext.depthFunc  = (comparison) => { depthFuncCalls.push(comparison); };
        renderingContext.clearColor = (...components) => { clearColorCalls.push(components); };
        renderingContext.viewport   = (...dimensions) => { viewportCalls.push(dimensions); };
        renderingContext.clear      = (mask) => { clearCalls.push(mask); };

        const webglContext = new WebGLContext(canvas);

        return {
            canvas,
            renderingContext,
            webglContext,
            contextRequests,
            enabledCapabilities,
            depthFuncCalls,
            clearColorCalls,
            viewportCalls,
            clearCalls
        };
    }

    static assertInvalidColorValues(environment, invalidValues, expectedErrorName, expectedMessageSuffix) {
        WebGLContext.setDefaultClearColor(...WebGLContextTestFixtures.UPDATED_CLEAR_COLOR);

        WebGLContextTestFixtures.COLOR_COMPONENT_NAMES.forEach((componentName, componentIndex) => {
            invalidValues.forEach((invalidValue) => {
                const components = [...WebGLContextConstants.WEBGL_CONTEXT_DEFAULT_CLEAR_COLOR];
                components[componentIndex] = invalidValue;

                const actualCall    = () => WebGLContext.setDefaultClearColor(...components);
                const expectedError = {
                    name    : expectedErrorName,
                    message : `Color component "${componentName}" ${expectedMessageSuffix}`
                };

                assert.throws(actualCall, expectedError);

                const fixture = WebGLContextTestFixtures.createFixture(environment);
                assert.deepEqual(fixture.clearColorCalls, [WebGLContextTestFixtures.UPDATED_CLEAR_COLOR]);
            });
        });
    }
}

// Restore the class settings, even when a test fails
afterEach(() => {
    WebGLContext.setDefaultClearColor(...WebGLContextConstants.WEBGL_CONTEXT_DEFAULT_CLEAR_COLOR);
    WebGLContext.setDepthTestEnabled(WebGLContextConstants.WEBGL_CONTEXT_DEFAULTS.ENABLE_DEPTH_TEST);
});

test("'WebGLContext' constructor should request WebGL2 and initialize the default state", () => {
    withFakeBrowserWebGLEnvironment((environment) => {
        // Arrange
        const expectedDefaults = WebGLContextConstants.WEBGL_CONTEXT_DEFAULTS;
        const expectedColor    = WebGLContextConstants.WEBGL_CONTEXT_DEFAULT_CLEAR_COLOR;

        // Act
        const fixture = WebGLContextTestFixtures.createFixture(environment);

        // Assert
        assert.deepEqual(fixture.contextRequests, [expectedDefaults.CONTEXT_TYPE]);
        assert.equal(fixture.webglContext.context, fixture.renderingContext);
        assert.deepEqual(fixture.enabledCapabilities, [fixture.renderingContext.DEPTH_TEST]);
        assert.deepEqual(fixture.depthFuncCalls, [fixture.renderingContext.LEQUAL]);
        assert.deepEqual(fixture.clearColorCalls, [expectedColor]);
        assert.deepEqual(fixture.viewportCalls, []);
        assert.deepEqual(fixture.clearCalls, []);
    });
});

test("'WebGLContext' constructor should reject values that are not canvas elements", () => {
    withFakeBrowserWebGLEnvironment(() => {
        // Arrange
        const invalidCanvases = [undefined, null, {}, [], 'canvas', false, 0];
        const expectedError   = {
            name    : 'TypeError',
            message : 'WebGLContext constructor expects an HTMLCanvasElement.'
        };

        // Act & Assert
        invalidCanvases.forEach((canvas) => assert.throws(() => new WebGLContext(canvas), expectedError));
    });
});

test("'WebGLContext' constructor should reject an unavailable WebGL2 context", () => {
    withFakeBrowserWebGLEnvironment((environment) => {
        // Arrange
        const canvas = environment.createCanvas();
        canvas.context = null;

        const expectedError = {
            name    : 'Error',
            message : 'WebGL2 is not supported in this browser.'
        };

        // Act
        const actualCall = () => new WebGLContext(canvas);

        // Assert
        assert.throws(actualCall, expectedError);
        assert.deepEqual(environment.enabledCapabilities, []);
    });
});

test("'WebGLContext.resizeToDisplaySize' should reject invalid options without resizing", () => {
    withFakeBrowserWebGLEnvironment((environment) => {
        // Arrange
        const fixture        = WebGLContextTestFixtures.createFixture(environment);
        const expectedWidth  = fixture.canvas.width;
        const expectedHeight = fixture.canvas.height;
        const invalidOptions = [null, [], true, 0, 'options', () => {}];
        const expectedError  = {
            name    : 'TypeError',
            message : 'WebGLContext.resizeToDisplaySize expects an options object or undefined.'
        };

        fixture.canvas.clientWidth = WebGLContextTestFixtures.DISPLAY_WIDTH;

        // Act & Assert
        invalidOptions.forEach((options) => {
            assert.throws(() => fixture.webglContext.resizeToDisplaySize(options), expectedError);
            assert.equal(fixture.canvas.width, expectedWidth);
            assert.equal(fixture.canvas.height, expectedHeight);
            assert.deepEqual(fixture.viewportCalls, []);
        });
    });
});

test("'WebGLContext.resizeToDisplaySize' should reject a non-boolean 'fitToWindow' option", () => {
    withFakeBrowserWebGLEnvironment((environment) => {
        // Arrange
        const fixture        = WebGLContextTestFixtures.createFixture(environment);
        const expectedWidth  = fixture.canvas.width;
        const expectedHeight = fixture.canvas.height;
        const invalidValues  = WebGLContextTestFixtures.INVALID_BOOLEAN_VALUES;
        const expectedError  = {
            name    : 'TypeError',
            message : 'WebGLContext.resizeToDisplaySize option `fitToWindow` must be a boolean.'
        };

        fixture.canvas.clientWidth = WebGLContextTestFixtures.DISPLAY_WIDTH;

        // Act & Assert
        invalidValues.forEach((fitToWindow) => {
            assert.throws(() => fixture.webglContext.resizeToDisplaySize({ fitToWindow }), expectedError);
            assert.equal(fixture.canvas.width, expectedWidth);
            assert.equal(fixture.canvas.height, expectedHeight);
            assert.deepEqual(fixture.viewportCalls, []);
        });
    });
});

test("'WebGLContext.resizeToDisplaySize' should use the canvas size when window fitting is not enabled", () => {
    withFakeBrowserWebGLEnvironment((environment) => {
        // Arrange
        const fixture        = WebGLContextTestFixtures.createFixture(environment);
        const expectedWidth  = fixture.canvas.width;
        const expectedHeight = fixture.canvas.height;
        const validOptions   = [undefined, {}, { fitToWindow: false }, Object.create(null)];

        // Act & Assert
        validOptions.forEach((options) => {
            const actualIsResized = fixture.webglContext.resizeToDisplaySize(options);
            assert.equal(actualIsResized, false);
            assert.equal(fixture.canvas.width, expectedWidth);
            assert.equal(fixture.canvas.height, expectedHeight);
            assert.deepEqual(fixture.viewportCalls, []);
        });
    });
});

test("'WebGLContext.resizeToDisplaySize' should scale the canvas size and round down to whole pixels", () => {
    withFakeBrowserWebGLEnvironment((environment) => {
        // Arrange
        const fixture        = WebGLContextTestFixtures.createFixture(environment);
        const expectedWidth  = WebGLContextTestFixtures.EXPECTED_SCALED_WIDTH;
        const expectedHeight = WebGLContextTestFixtures.EXPECTED_SCALED_HEIGHT;
        const expectedOrigin = WebGLContextConstants.WEBGL_CONTEXT_VIEWPORT_ORIGIN;

        fixture.canvas.clientWidth          = WebGLContextTestFixtures.DISPLAY_WIDTH;
        fixture.canvas.clientHeight         = WebGLContextTestFixtures.DISPLAY_HEIGHT;
        environment.window.devicePixelRatio = WebGLContextTestFixtures.FRACTIONAL_DEVICE_PIXEL_RATIO;

        // Act
        const actualIsResized = fixture.webglContext.resizeToDisplaySize();

        // Assert
        assert.equal(actualIsResized, true);
        assert.equal(fixture.canvas.width, expectedWidth);
        assert.equal(fixture.canvas.height, expectedHeight);
        assert.deepEqual(fixture.viewportCalls, [[expectedOrigin.X, expectedOrigin.Y, expectedWidth, expectedHeight]]);
    });
});

test("'WebGLContext.resizeToDisplaySize' should use the window size when requested", () => {
    withFakeBrowserWebGLEnvironment((environment) => {
        // Arrange
        const fixture        = WebGLContextTestFixtures.createFixture(environment);
        const expectedWidth  = WebGLContextTestFixtures.EXPECTED_WINDOW_BUFFER_WIDTH;
        const expectedHeight = WebGLContextTestFixtures.EXPECTED_WINDOW_BUFFER_HEIGHT;
        const expectedOrigin = WebGLContextConstants.WEBGL_CONTEXT_VIEWPORT_ORIGIN;

        environment.window.innerWidth       = WebGLContextTestFixtures.WINDOW_WIDTH;
        environment.window.innerHeight      = WebGLContextTestFixtures.WINDOW_HEIGHT;
        environment.window.devicePixelRatio = WebGLContextTestFixtures.HIGH_DEVICE_PIXEL_RATIO;

        // Act
        const actualIsResized = fixture.webglContext.resizeToDisplaySize({ fitToWindow: true });

        // Assert
        assert.equal(actualIsResized, true);
        assert.equal(fixture.canvas.width, expectedWidth);
        assert.equal(fixture.canvas.height, expectedHeight);
        assert.deepEqual(fixture.viewportCalls, [[expectedOrigin.X, expectedOrigin.Y, expectedWidth, expectedHeight]]);
    });
});

test("'WebGLContext.resizeToDisplaySize' should use the fallback pixel ratio when the browser value is missing or zero", () => {
    const fallbackPixelRatios = [undefined, 0];

    fallbackPixelRatios.forEach((pixelRatio) => {
        withFakeBrowserWebGLEnvironment((environment) => {
            // Arrange
            const fixture        = WebGLContextTestFixtures.createFixture(environment);
            const expectedWidth  = WebGLContextTestFixtures.DISPLAY_WIDTH;
            const expectedHeight = WebGLContextTestFixtures.DISPLAY_HEIGHT;
            const expectedOrigin = WebGLContextConstants.WEBGL_CONTEXT_VIEWPORT_ORIGIN;

            fixture.canvas.clientWidth          = expectedWidth;
            fixture.canvas.clientHeight         = expectedHeight;
            environment.window.devicePixelRatio = pixelRatio;

            // Act
            const actualIsResized = fixture.webglContext.resizeToDisplaySize();

            // Assert
            assert.equal(actualIsResized, true);
            assert.equal(fixture.canvas.width, expectedWidth);
            assert.equal(fixture.canvas.height, expectedHeight);
            assert.deepEqual(fixture.viewportCalls, [[expectedOrigin.X, expectedOrigin.Y, expectedWidth, expectedHeight]]);
        });
    });
});

test("'WebGLContext.resizeToDisplaySize' should resize when only the width changes", () => {
    withFakeBrowserWebGLEnvironment((environment) => {
        // Arrange
        const fixture        = WebGLContextTestFixtures.createFixture(environment);
        const expectedWidth  = WebGLContextTestFixtures.DISPLAY_WIDTH;
        const expectedHeight = fixture.canvas.height;
        const expectedOrigin = WebGLContextConstants.WEBGL_CONTEXT_VIEWPORT_ORIGIN;

        fixture.canvas.clientWidth = expectedWidth;

        // Act
        const actualIsResized = fixture.webglContext.resizeToDisplaySize();

        // Assert
        assert.equal(actualIsResized, true);
        assert.equal(fixture.canvas.width, expectedWidth);
        assert.equal(fixture.canvas.height, expectedHeight);
        assert.deepEqual(fixture.viewportCalls, [[expectedOrigin.X, expectedOrigin.Y, expectedWidth, expectedHeight]]);
    });
});

test("'WebGLContext.resizeToDisplaySize' should resize when only the height changes", () => {
    withFakeBrowserWebGLEnvironment((environment) => {
        // Arrange
        const fixture        = WebGLContextTestFixtures.createFixture(environment);
        const expectedWidth  = fixture.canvas.width;
        const expectedHeight = WebGLContextTestFixtures.DISPLAY_HEIGHT;
        const expectedOrigin = WebGLContextConstants.WEBGL_CONTEXT_VIEWPORT_ORIGIN;

        fixture.canvas.clientHeight = expectedHeight;

        // Act
        const actualIsResized = fixture.webglContext.resizeToDisplaySize();

        // Assert
        assert.equal(actualIsResized, true);
        assert.equal(fixture.canvas.width, expectedWidth);
        assert.equal(fixture.canvas.height, expectedHeight);
        assert.deepEqual(fixture.viewportCalls, [[expectedOrigin.X, expectedOrigin.Y, expectedWidth, expectedHeight]]);
    });
});

test("'WebGLContext.resizeToDisplaySize' should keep each drawing buffer dimension at least one pixel", () => {
    // Arrange
    const minimumDimension  = WebGLContextConstants.WEBGL_CONTEXT_DRAWING_BUFFER.MIN_DIMENSION;
    const defaultPixelRatio = WebGLContextConstants.WEBGL_CONTEXT_DEFAULTS.DEVICE_PIXEL_RATIO;
    const displaySizes      = [
        // Zero display width
        [
            0,
            WebGLContextTestFixtures.DISPLAY_HEIGHT,
            defaultPixelRatio,
            minimumDimension,
            WebGLContextTestFixtures.DISPLAY_HEIGHT
        ],
        // Zero display height
        [
            WebGLContextTestFixtures.DISPLAY_WIDTH,
            0,
            defaultPixelRatio,
            WebGLContextTestFixtures.DISPLAY_WIDTH,
            minimumDimension
        ],
        // Both display dimensions are zero
        [
            0,
            0,
            defaultPixelRatio,
            minimumDimension,
            minimumDimension
        ],
        // Both scaled dimensions round down to zero
        [
            minimumDimension,
            minimumDimension,
            WebGLContextTestFixtures.LOW_DEVICE_PIXEL_RATIO,
            minimumDimension,
            minimumDimension
        ]
    ];

    displaySizes.forEach(([cssWidth, cssHeight, pixelRatio, expectedWidth, expectedHeight]) => {
        withFakeBrowserWebGLEnvironment((environment) => {
            // Also arrange
            const fixture        = WebGLContextTestFixtures.createFixture(environment);
            const expectedOrigin = WebGLContextConstants.WEBGL_CONTEXT_VIEWPORT_ORIGIN;

            fixture.canvas.clientWidth          = cssWidth;
            fixture.canvas.clientHeight         = cssHeight;
            environment.window.devicePixelRatio = pixelRatio;

            // Act
            const actualIsResized = fixture.webglContext.resizeToDisplaySize();

            // Assert
            assert.equal(actualIsResized, true);
            assert.equal(fixture.canvas.width, expectedWidth);
            assert.equal(fixture.canvas.height, expectedHeight);
            assert.deepEqual(fixture.viewportCalls, [[expectedOrigin.X, expectedOrigin.Y, expectedWidth, expectedHeight]]);
        });
    });
});

test("'WebGLContext.resizeToDisplaySize' should leave the viewport unchanged when the drawing buffer already matches", () => {
    withFakeBrowserWebGLEnvironment((environment) => {
        // Arrange
        const fixture        = WebGLContextTestFixtures.createFixture(environment);
        const expectedWidth  = WebGLContextTestFixtures.DISPLAY_WIDTH;
        const expectedHeight = WebGLContextTestFixtures.DISPLAY_HEIGHT;
        const expectedOrigin = WebGLContextConstants.WEBGL_CONTEXT_VIEWPORT_ORIGIN;

        fixture.canvas.clientWidth  = expectedWidth;
        fixture.canvas.clientHeight = expectedHeight;

        // Act
        const firstIsResized  = fixture.webglContext.resizeToDisplaySize();
        const secondIsResized = fixture.webglContext.resizeToDisplaySize();

        // Assert
        assert.equal(firstIsResized, true);
        assert.equal(secondIsResized, false);
        assert.equal(fixture.canvas.width, expectedWidth);
        assert.equal(fixture.canvas.height, expectedHeight);
        assert.deepEqual(fixture.viewportCalls, [[expectedOrigin.X, expectedOrigin.Y, expectedWidth, expectedHeight]]);
    });
});

test("'WebGLContext.clear' should clear both buffers without resetting the clear color", () => {
    withFakeBrowserWebGLEnvironment((environment) => {
        // Arrange
        const expectedColor = WebGLContextTestFixtures.UPDATED_CLEAR_COLOR;
        WebGLContext.setDefaultClearColor(...expectedColor);

        const fixture      = WebGLContextTestFixtures.createFixture(environment);
        const expectedMask = fixture.renderingContext.COLOR_BUFFER_BIT | fixture.renderingContext.DEPTH_BUFFER_BIT;

        // Act
        fixture.webglContext.clear();

        // Assert
        assert.deepEqual(fixture.clearCalls, [expectedMask]);
        assert.deepEqual(fixture.clearColorCalls, [expectedColor]);
    });
});

test("'WebGLContext.setDefaultClearColor' should apply a new color only to future contexts", () => {
    withFakeBrowserWebGLEnvironment((environment) => {
        // Arrange
        const initialColor   = WebGLContextConstants.WEBGL_CONTEXT_DEFAULT_CLEAR_COLOR;
        const updatedColor   = WebGLContextTestFixtures.UPDATED_CLEAR_COLOR;
        const initialFixture = WebGLContextTestFixtures.createFixture(environment);

        // Act
        WebGLContext.setDefaultClearColor(...updatedColor);
        const updatedFixture = WebGLContextTestFixtures.createFixture(environment);

        // Assert
        assert.deepEqual(initialFixture.clearColorCalls, [initialColor]);
        assert.deepEqual(updatedFixture.clearColorCalls, [updatedColor]);
        assert.deepEqual(WebGLContextConstants.WEBGL_CONTEXT_DEFAULT_CLEAR_COLOR, [0.0, 0.0, 0.0, 1.0]);
    });
});

test("'WebGLContext.setDefaultClearColor' should accept both component boundaries", () => {
    withFakeBrowserWebGLEnvironment((environment) => {
        // Arrange
        const boundaryColors = [
            [0.0, 1.0, 0.0, 1.0],
            [1.0, 0.0, 1.0, 0.0]
        ];

        // Act & Assert
        boundaryColors.forEach((expectedColor) => {
            WebGLContext.setDefaultClearColor(...expectedColor);
            const fixture = WebGLContextTestFixtures.createFixture(environment);
            assert.deepEqual(fixture.clearColorCalls, [expectedColor]);
        });
    });
});

test("'WebGLContext.setDefaultClearColor' should reject non-numeric components and 'NaN' without changing the default", () => {
    withFakeBrowserWebGLEnvironment((environment) => {
        // Arrange
        const invalidValues         = WebGLContextTestFixtures.INVALID_COLOR_TYPE_VALUES;
        const expectedErrorName     = 'TypeError';
        const expectedMessageSuffix = 'must be a valid number.';

        // Act & Assert
        WebGLContextTestFixtures.assertInvalidColorValues(environment, invalidValues, expectedErrorName, expectedMessageSuffix);
    });
});

test("'WebGLContext.setDefaultClearColor' should reject out-of-range components without changing the default", () => {
    withFakeBrowserWebGLEnvironment((environment) => {
        // Arrange
        const invalidValues         = WebGLContextTestFixtures.INVALID_COLOR_RANGE_VALUES;
        const expectedErrorName     = 'RangeError';
        const expectedMessageSuffix = 'must be in the range [0, 1].';

        // Act & Assert
        WebGLContextTestFixtures.assertInvalidColorValues(environment, invalidValues, expectedErrorName, expectedMessageSuffix);
    });
});

test("'WebGLContext.setDepthTestEnabled' should disable depth testing only for future contexts", () => {
    withFakeBrowserWebGLEnvironment((environment) => {
        // Arrange
        const initialFixture = WebGLContextTestFixtures.createFixture(environment);
        const expectedColor  = WebGLContextConstants.WEBGL_CONTEXT_DEFAULT_CLEAR_COLOR;

        // Act
        WebGLContext.setDepthTestEnabled(false);
        const updatedFixture = WebGLContextTestFixtures.createFixture(environment);

        // Assert
        assert.deepEqual(initialFixture.enabledCapabilities, [initialFixture.renderingContext.DEPTH_TEST]);
        assert.deepEqual(initialFixture.depthFuncCalls, [initialFixture.renderingContext.LEQUAL]);
        assert.deepEqual(updatedFixture.enabledCapabilities, []);
        assert.deepEqual(updatedFixture.depthFuncCalls, []);
        assert.deepEqual(updatedFixture.clearColorCalls, [expectedColor]);
    });
});

test("'WebGLContext.setDepthTestEnabled' should allow depth testing to be enabled again", () => {
    withFakeBrowserWebGLEnvironment((environment) => {
        // Arrange
        WebGLContext.setDepthTestEnabled(false);
        const initialFixture = WebGLContextTestFixtures.createFixture(environment);

        // Act
        WebGLContext.setDepthTestEnabled(true);
        const updatedFixture = WebGLContextTestFixtures.createFixture(environment);

        // Assert
        assert.deepEqual(initialFixture.enabledCapabilities, []);
        assert.deepEqual(initialFixture.depthFuncCalls, []);
        assert.deepEqual(updatedFixture.enabledCapabilities, [updatedFixture.renderingContext.DEPTH_TEST]);
        assert.deepEqual(updatedFixture.depthFuncCalls, [updatedFixture.renderingContext.LEQUAL]);
    });
});

test("'WebGLContext.setDepthTestEnabled' should reject non-boolean values without changing the setting", () => {
    withFakeBrowserWebGLEnvironment((environment) => {
        // Arrange
        const initialStates = [false, true];
        const invalidValues = WebGLContextTestFixtures.INVALID_BOOLEAN_VALUES;
        const expectedError = {
            name    : 'TypeError',
            message : 'setDepthTestEnabled expects a boolean value.'
        };

        // Act & Assert
        initialStates.forEach((initialState) => {
            WebGLContext.setDepthTestEnabled(initialState);

            invalidValues.forEach((invalidValue) => {
                assert.throws(() => WebGLContext.setDepthTestEnabled(invalidValue), expectedError);

                const fixture                = WebGLContextTestFixtures.createFixture(environment);
                const expectedCapabilities   = initialState ? [fixture.renderingContext.DEPTH_TEST] : [];
                const expectedDepthFunctions = initialState ? [fixture.renderingContext.LEQUAL] : [];
                assert.deepEqual(fixture.enabledCapabilities, expectedCapabilities);
                assert.deepEqual(fixture.depthFuncCalls, expectedDepthFunctions);
            });
        });
    });
});

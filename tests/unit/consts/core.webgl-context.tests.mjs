import test                       from 'node:test';
import assert                     from 'node:assert/strict';
import * as WebGLContextConstants from '../../../core/constants/webgl-context.js';

test("'WebGLContext' constants objects should be frozen", () => {
    // Arrange
    const constantsObjects = [
        WebGLContextConstants.WEBGL_CONTEXT_DEFAULTS,
        WebGLContextConstants.WEBGL_CONTEXT_VIEWPORT_ORIGIN,
        WebGLContextConstants.WEBGL_CONTEXT_DRAWING_BUFFER,
        WebGLContextConstants.WEBGL_CONTEXT_COLOR_LIMITS,
        WebGLContextConstants.WEBGL_CONTEXT_DEFAULT_CLEAR_COLOR
    ];

    // Act & Assert
    constantsObjects.forEach((constantsObject) => assert.equal(Object.isFrozen(constantsObject), true));
});

test("'WebGLContext' default constants should keep existing values", () => {
    // Arrange
    const actualConstants = WebGLContextConstants.WEBGL_CONTEXT_DEFAULTS;

    // Act & Assert
    assert.equal(actualConstants.CONTEXT_TYPE, 'webgl2');
    assert.equal(actualConstants.DEVICE_PIXEL_RATIO, 1);
    assert.equal(actualConstants.ENABLE_DEPTH_TEST, true);
});

test("'WebGLContext' viewport origin constants should keep existing values", () => {
    // Arrange
    const actualConstants = WebGLContextConstants.WEBGL_CONTEXT_VIEWPORT_ORIGIN;

    // Act & Assert
    assert.equal(actualConstants.X, 0);
    assert.equal(actualConstants.Y, 0);
});

test("'WebGLContext' drawing buffer constants should keep existing values", () => {
    // Arrange
    const actualConstants = WebGLContextConstants.WEBGL_CONTEXT_DRAWING_BUFFER;

    // Act & Assert
    assert.equal(actualConstants.MIN_DIMENSION, 1);
});

test("'WebGLContext' color component limits should keep existing values", () => {
    // Arrange
    const actualConstants = WebGLContextConstants.WEBGL_CONTEXT_COLOR_LIMITS;

    // Act & Assert
    assert.equal(actualConstants.MIN_COMPONENT, 0.0);
    assert.equal(actualConstants.MAX_COMPONENT, 1.0);
});

test("'WebGLContext' default clear color should keep existing values", () => {
    // Arrange
    const expectedColor = [0.0, 0.0, 0.0, 1.0];

    // Act
    const actualColor = WebGLContextConstants.WEBGL_CONTEXT_DEFAULT_CLEAR_COLOR;

    // Assert
    assert.deepEqual(actualColor, expectedColor);
});

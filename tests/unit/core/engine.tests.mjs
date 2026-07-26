import test                                from 'node:test';
import assert                              from 'node:assert/strict';
import { Engine, createEngine }            from '../../../core/engine/engine.js';
import { WebGLContext }                    from '../../../core/webgl-context.js';
import { Renderer }                        from '../../../core/render/renderer.js';
import { Scene }                           from '../../../core/scene/scene.js';
import { Camera }                          from '../../../core/scene/camera.js';
import { PerspectiveCamera }               from '../../../core/scene/perspective-camera.js';
import { Mesh }                            from '../../../core/scene/mesh.js';
import { VertexColorMaterial }             from '../../../core/material/vertex-color-material.js';
import { withFakeBrowserWebGLEnvironment } from '../../helpers/fake-browser-webgl-environment.mjs';
import { EngineTestFactory }               from '../../helpers/engine-test-factory.mjs';
import * as EngineConstants                from '../../../core/constants/engine.js';

test("'Engine' constructor should reject missing or invalid canvas", () => {
    withFakeBrowserWebGLEnvironment(() => {
        // Arrange
        const invalidCanvasValues = [undefined, null, {}, []];

        // Act & Assert
        invalidCanvasValues.forEach((invalidCanvas) => assert.throws(() => new Engine(invalidCanvas), /expects an HTMLCanvasElement/));
    });
});

test("'Engine' constructor should reject the invalid options object", () => {
    withFakeBrowserWebGLEnvironment((environment) => {
        // Arrange
        const canvas               = environment.createCanvas();
        const invalidOptionsValues = [null, [], 'options'];

        // Act & Assert
        invalidOptionsValues.forEach((options) => assert.throws(() => new Engine(canvas, options), /expects an options object/));
    });
});

test("'Engine' constructor should reject invalid 'fieldOfViewRadians'", () => {
    withFakeBrowserWebGLEnvironment((environment) => {
        // Arrange
        const canvas                    = environment.createCanvas();
        const invalidFieldOfViewRadians = ['1', 0, -1];

        // Act & Assert
        invalidFieldOfViewRadians.forEach((fieldOfViewRadians) => {
            assert.throws(() => new Engine(canvas, { fieldOfViewRadians }), /fieldOfViewRadians` must be a positive number/);
        });
    });
});

test("'Engine' constructor should reject invalid 'near' and 'far'", () => {
    withFakeBrowserWebGLEnvironment((environment) => {
        // Arrange
        const canvas         = environment.createCanvas();
        const invalidOptions = [
            { near : '0.1' },
            { far  : '100' },
            { near :  0 },
            { far  :  0 },
            { near :  2, far: 1 }
        ];

        // Act & Assert
        invalidOptions.forEach((options) => assert.throws(() => new Engine(canvas, options), /near` and `far` must be positive numbers and near < far/));
    });
});

test("'Engine' constructor should reject invalid 'initialCameraZ'", () => {
    withFakeBrowserWebGLEnvironment((environment) => {
        // Arrange
        const canvas = environment.createCanvas();

        // Act & Assert
        assert.throws(() => new Engine(canvas, { initialCameraZ: '5' }), /initialCameraZ` must be a number/);
    });
});

test("'Engine' constructor should reject invalid 'fitToWindow'", () => {
    withFakeBrowserWebGLEnvironment((environment) => {
        // Arrange
        const canvas = environment.createCanvas();

        // Act & Assert
        assert.throws(() => new Engine(canvas, { fitToWindow: 'true' }), /fitToWindow` must be a boolean/);
    });
});

test("'Engine' constructor should accept valid canvas and options", () => {
    withFakeBrowserWebGLEnvironment((environment) => {
        // Arrange
        const canvas  = environment.createCanvas();
        const options = {
            fieldOfViewRadians : Math.PI / 3,
            near               : 0.5,
            far                : 250,
            initialCameraZ     : 12,
            fitToWindow        : true
        };

        // Act
        const engine = new Engine(canvas, options);

        // Assert
        assert.ok(engine instanceof Engine);
    });
});

test("'Engine' constructor should use the default options, when the options are omitted", () => {
    withFakeBrowserWebGLEnvironment((environment) => {
        // Arrange
        const canvas = environment.createCanvas();

        // Act
        const engine = new Engine(canvas);

        // Assert
        assert.equal(engine.camera.position.z, EngineConstants.ENGINE_CAMERA_DEFAULTS.INITIAL_CAMERA_Z);
    });
});

test("'Engine' constructor should create: context, renderer, scene and camera", () => {
    withFakeBrowserWebGLEnvironment(() => {
        // Arrange
        const engine = EngineTestFactory.createEngine();

        // Act
        const context  = engine.context;
        const renderer = engine.renderer;
        const scene    = engine.scene;
        const camera   = engine.camera;

        // Assert
        assert.ok(context instanceof WebGLContext);
        assert.ok(renderer instanceof Renderer);
        assert.ok(scene instanceof Scene);
        assert.ok(camera instanceof Camera);
    });
});

test("'Engine' constructor should apply the custom initial camera z position", () => {
    withFakeBrowserWebGLEnvironment(() => {
        // Arrange
        const initialCameraZ = 7;

        // Act
        const engine = EngineTestFactory.createEngine({ initialCameraZ });

        // Assert
        assert.equal(engine.camera.position.z, initialCameraZ);
    });
});

test("'Engine' getters should return the created engine components", () => {
    withFakeBrowserWebGLEnvironment(() => {
        // Arrange
        const engine = EngineTestFactory.createEngine();

        // Act
        const context               = engine.context;
        const webglRenderingContext = engine.webglRenderingContext;
        const renderer              = engine.renderer;
        const scene                 = engine.scene;
        const camera                = engine.camera;

        // Assert
        assert.ok(context instanceof WebGLContext);
        assert.ok(webglRenderingContext instanceof WebGL2RenderingContext);
        assert.equal(webglRenderingContext, context.context);
        assert.ok(renderer instanceof Renderer);
        assert.ok(scene instanceof Scene);
        assert.ok(camera instanceof Camera);
    });
});

test("'Engine.createBoxMesh' should reject the invalid options object", () => {
    withFakeBrowserWebGLEnvironment(() => {
        // Arrange
        const engine               = EngineTestFactory.createEngine();
        const invalidOptionsValues = [null, [], 'options'];

        // Act & Assert
        invalidOptionsValues.forEach((options) => assert.throws(() => engine.createBoxMesh(options), /expects an options object/));
    });
});

test("'Engine.createBoxMesh' should reject the invalid size", () => {
    withFakeBrowserWebGLEnvironment(() => {
        // Arrange
        const engine          = EngineTestFactory.createEngine();
        const invalidBoxSizes = [0, -1, '1'];

        // Act & Assert
        invalidBoxSizes.forEach((size) => assert.throws(() => engine.createBoxMesh({ size }), /option `size` must be a positive number/));
    });
});

test("'Engine.createBoxMesh' should reject the invalid material", () => {
    withFakeBrowserWebGLEnvironment(() => {
        // Arrange
        const engine = EngineTestFactory.createEngine();

        // Act & Assert
        assert.throws(() => engine.createBoxMesh({ material: {} }), /material` must be a `Material` instance/);
    });
});

test("'Engine.createBoxMesh' should create a mesh with the default material", () => {
    withFakeBrowserWebGLEnvironment(() => {
        // Arrange
        const engine = EngineTestFactory.createEngine();

        // Act
        const mesh = engine.createBoxMesh();

        // Assert
        assert.ok(mesh instanceof Mesh);
        assert.ok(mesh.material instanceof VertexColorMaterial);
        assert.equal(mesh.ownsGeometry, true);
        assert.equal(mesh.ownsMaterial, true);
    });
});

test("'Engine.createBoxMesh' should create a mesh with the user-provided material", () => {
    withFakeBrowserWebGLEnvironment(() => {
        // Arrange
        const engine   = EngineTestFactory.createEngine();
        const boxSize  = 2;
        const material = new VertexColorMaterial(engine.webglRenderingContext);

        // Act
        const mesh = engine.createBoxMesh({ size: boxSize, material });

        // Assert
        assert.ok(mesh instanceof Mesh);
        assert.equal(mesh.material, material);
        assert.equal(mesh.ownsGeometry, true);
        assert.equal(mesh.ownsMaterial, false);
    });
});

test("'Engine.render' should delegate to 'Renderer.render' with scene, camera and resize options", () => {
    withFakeBrowserWebGLEnvironment(() => {
        // Arrange
        const engine                    = EngineTestFactory.createEngine({ fitToWindow: true });
        const renderArgs                = [];
        const firstRenderCallIndex      = 0;
        const sceneArgumentIndex        = 0;
        const cameraArgumentIndex       = 1;
        const optionsArgumentIndex      = 2;
        const expectedRenderCallsLength = 1;
        const expectedRenderOptions     = { fitToWindow: true };

        // Act
        engine.renderer.render = (...args) => renderArgs.push(args);
        engine.render();

        // Assert
        assert.equal(renderArgs.length, expectedRenderCallsLength);
        assert.equal(renderArgs[firstRenderCallIndex][sceneArgumentIndex], engine.scene);
        assert.equal(renderArgs[firstRenderCallIndex][cameraArgumentIndex], engine.camera);
        assert.deepEqual(renderArgs[firstRenderCallIndex][optionsArgumentIndex], expectedRenderOptions);
    });
});

test("'Engine.render' should pass the 'fitToWindow' value from the 'Engine' options", () => {
    withFakeBrowserWebGLEnvironment(() => {
        // Arrange
        const engine               = EngineTestFactory.createEngine({ fitToWindow: false });
        const renderArgs           = [];
        const firstRenderCallIndex = 0;
        const optionsArgumentIndex = 2;
        const expectedFitToWindow  = false;

        // Act
        engine.renderer.render = (...args) => renderArgs.push(args);
        engine.render();

        // Assert
        assert.equal(renderArgs[firstRenderCallIndex][optionsArgumentIndex].fitToWindow, expectedFitToWindow);
    });
});

test("'Engine.start' should reject the invalid frame callback", () => {
    withFakeBrowserWebGLEnvironment(() => {
        // Arrange
        const engine               = EngineTestFactory.createEngine();
        const invalidFrameCallback = 'not a function';

        // Act & Assert
        assert.throws(() => engine.start(invalidFrameCallback), /expects a function callback or undefined/);
    });
});

test("'Engine.start' should start the 'requestAnimationFrame' loop and store the frame callback", () => {
    withFakeBrowserWebGLEnvironment((environment) => {
        // Arrange
        let callbackEngine                  = null;
        const engine                        = EngineTestFactory.createEngine();
        const firstFrameIndex               = 0;
        const firstFrameTimeMs              = 1000;
        const expectedRequestedFramesLength = 2;
        const frameCallback                 = (deltaTimeSeconds, engineTimeSeconds, callbackArgumentEngine) => callbackEngine = callbackArgumentEngine;

        // Act
        engine.start(frameCallback);
        environment.runAnimationFrame(environment.requestedFrames[firstFrameIndex], firstFrameTimeMs);

        // Assert
        assert.equal(environment.requestedFrames.length, expectedRequestedFramesLength);
        assert.equal(callbackEngine, engine);
    });
});

test("'Engine.start' should run without a frame callback", () => {
    withFakeBrowserWebGLEnvironment((environment) => {
        // Arrange
        let renderCount                     = 0;
        const engine                        = EngineTestFactory.createEngine();
        const firstFrameIndex               = 0;
        const firstFrameTimeMs              = 1000;
        const renderCountIncrement          = 1;
        const expectedRenderCount           = 1;
        const expectedRequestedFramesLength = 2;

        // Act
        engine.renderer.render = () => { renderCount += renderCountIncrement; };
        engine.start();
        environment.runAnimationFrame(environment.requestedFrames[firstFrameIndex], firstFrameTimeMs);

        // Assert
        assert.equal(renderCount, expectedRenderCount);
        assert.equal(environment.requestedFrames.length, expectedRequestedFramesLength);
    });
});

test("'Engine.start' should not schedule a second frame, when already running", () => {
    withFakeBrowserWebGLEnvironment((environment) => {
        // Arrange
        const engine                        = EngineTestFactory.createEngine();
        const expectedRequestedFramesLength = 1;

        // Act
        engine.start();
        engine.start(() => {});

        // Assert
        assert.equal(environment.requestedFrames.length, expectedRequestedFramesLength);
    });
});

test("'Engine.stop' should do nothing, when the engine is not running", () => {
    withFakeBrowserWebGLEnvironment((environment) => {
        // Arrange
        const engine                 = EngineTestFactory.createEngine();
        const expectedCanceledFrames = [];

        // Act
        engine.stop();

        // Assert
        assert.deepEqual(environment.canceledFrames, expectedCanceledFrames);
    });
});

test("'Engine.stop' should cancel the active animation frame", () => {
    withFakeBrowserWebGLEnvironment((environment) => {
        // Arrange
        const firstFrameIndex = 0;
        const engine          = EngineTestFactory.createEngine();

        // Act
        engine.start();
        const frameIdToCancel = environment.requestedFrames[firstFrameIndex];
        engine.stop();

        // Assert
        assert.deepEqual(environment.canceledFrames, [frameIdToCancel]);
    });
});

test("'Engine.stop' should allow the engine to start again", () => {
    withFakeBrowserWebGLEnvironment((environment) => {
        // Arrange
        const engine                        = EngineTestFactory.createEngine();
        const firstFrameIndex               = 0;
        const secondFrameIndex              = 1;
        const expectedRequestedFramesLength = 2;

        // Act
        engine.start();
        engine.stop();
        engine.start();

        // Assert
        assert.equal(environment.requestedFrames.length, expectedRequestedFramesLength);
        assert.notEqual(environment.requestedFrames[firstFrameIndex], environment.requestedFrames[secondFrameIndex]);
    });
});

test("'Engine.setCamera' should reject the invalid camera", () => {
    withFakeBrowserWebGLEnvironment(() => {
        // Arrange
        const engine = EngineTestFactory.createEngine();

        // Act & Assert
        assert.throws(() => engine.setCamera({}), /expects a `Camera` instance/);
    });
});

test("'Engine.setCamera' should accept the camera-derived instance and update the active camera", () => {
    withFakeBrowserWebGLEnvironment(() => {
        // Arrange
        const engine = EngineTestFactory.createEngine();
        const camera = new PerspectiveCamera(Math.PI / 3, 1, 0.1, 100);

        // Act
        engine.setCamera(camera);

        // Assert
        assert.equal(engine.camera, camera);
    });
});


test("'Engine' animation frame should update time, call frame callback, render and request next frame", () => {
    withFakeBrowserWebGLEnvironment((environment) => {
        // Arrange
        let renderCount                     = 0;
        const engine                        = EngineTestFactory.createEngine();
        const callbackCalls                 = [];
        const firstFrameIndex               = 0;
        const secondFrameIndex              = 1;
        const firstCallbackIndex            = 0;
        const secondCallbackIndex           = 1;
        const firstFrameTimeMs              = 1000;
        const secondFrameTimeMs             = 1250;
        const renderCountIncrement          = 1;
        const expectedDeltaTimeSeconds      = [0, 0.25];
        const expectedEngineTimeSeconds     = [0, 0.25];
        const expectedRenderCount           = 2;
        const expectedRequestedFramesLength = 3;

        // Act
        engine.renderer.render = () => { renderCount += renderCountIncrement; };
        engine.start((deltaTimeSeconds, engineTimeSeconds, callbackEngine) => callbackCalls.push({ deltaTimeSeconds, engineTimeSeconds, callbackEngine }));
        environment.runAnimationFrame(environment.requestedFrames[firstFrameIndex], firstFrameTimeMs);
        environment.runAnimationFrame(environment.requestedFrames[secondFrameIndex], secondFrameTimeMs);

        // Assert
        assert.deepEqual(callbackCalls.map((call) => call.deltaTimeSeconds), expectedDeltaTimeSeconds);
        assert.deepEqual(callbackCalls.map((call) => call.engineTimeSeconds), expectedEngineTimeSeconds);
        assert.equal(callbackCalls[firstCallbackIndex].callbackEngine, engine);
        assert.equal(callbackCalls[secondCallbackIndex].callbackEngine, engine);
        assert.equal(renderCount, expectedRenderCount);
        assert.equal(environment.requestedFrames.length, expectedRequestedFramesLength);
    });
});

test("'Engine' animation frame should stop before render, when the frame callback stops the engine", () => {
    withFakeBrowserWebGLEnvironment((environment) => {
        // Arrange
        let renderCount                     = 0;
        const engine                        = EngineTestFactory.createEngine();
        const firstFrameIndex               = 0;
        const firstFrameTimeMs              = 1000;
        const renderCountIncrement          = 1;
        const expectedRenderCount           = 0;
        const expectedRequestedFramesLength = 1;

        // Act
        engine.renderer.render = () => { renderCount += renderCountIncrement; };
        engine.start((deltaTimeSeconds, engineTimeSeconds, callbackEngine) => callbackEngine.stop());

        const frameToCancel = environment.requestedFrames[firstFrameIndex];
        environment.runAnimationFrame(frameToCancel, firstFrameTimeMs);

        // Assert
        assert.equal(renderCount, expectedRenderCount);
        assert.equal(environment.requestedFrames.length, expectedRequestedFramesLength);
        assert.deepEqual(environment.canceledFrames, [frameToCancel]);
    });
});

test("'createEngine' should return an 'Engine' instance and pass canvas and options to constructor", () => {
    withFakeBrowserWebGLEnvironment((environment) => {
        // Arrange
        const canvas  = environment.createCanvas();
        const options = { initialCameraZ: 9 };

        // Act
        const engine = createEngine(canvas, options);

        // Assert
        assert.ok(engine instanceof Engine);
        assert.equal(engine.camera.position.z, options.initialCameraZ);
    });
});

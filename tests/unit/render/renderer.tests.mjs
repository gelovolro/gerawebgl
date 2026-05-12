import test                                from 'node:test';
import assert                              from 'node:assert/strict';
import { Renderer }                        from '../../../core/render/renderer.js';
import { Scene }                           from '../../../core/scene/scene.js';
import { Mesh }                            from '../../../core/scene/mesh.js';
import { BoxGeometry }                     from '../../../core/geometry/box-geometry.js';
import { VertexColorMaterial }             from '../../../core/material/vertex-color-material.js';
import { DirectionalLight }                from '../../../core/light/directional-light.js';
import { AmbientLight }                    from '../../../core/light/ambient-light.js';
import { withFakeBrowserWebGLEnvironment } from '../../helpers/fake-browser-webgl-environment.mjs';
import { RendererTestFactory }             from '../../helpers/renderer-test-factory.mjs';
import {
    PRIMITIVE_TRIANGLES,
    PRIMITIVE_LINES,
    PRIMITIVE_LINE_STRIP,
    PRIMITIVE_LINE_LOOP,
    PRIMITIVE_POINTS
} from '../../../core/geometry/geometry.js';

test("'Renderer' constructor should reject invalid WebGL context", () => {
    // Arrange
    const invalidContextValues = [undefined, null, {}, []];

    // Act & Assert
    invalidContextValues.forEach((invalidContext) => assert.throws(() => new Renderer(invalidContext), /expects a WebGLContext instance/));
});

test("'Renderer.render' should reject invalid scene", () => {
    withFakeBrowserWebGLEnvironment((environment) => {
        // Arrange
        const renderer           = RendererTestFactory.createRenderer(environment);
        const camera             = RendererTestFactory.createCamera();
        const invalidSceneValues = [undefined, null, {}, []];

        // Act & Assert
        invalidSceneValues.forEach((scene) => assert.throws(() => renderer.render(scene, camera), /expects a `Scene` instance/));
    });
});

test("'Renderer.render' should reject invalid camera", () => {
    withFakeBrowserWebGLEnvironment((environment) => {
        // Arrange
        const renderer            = RendererTestFactory.createRenderer(environment);
        const scene               = new Scene();
        const invalidCameraValues = [undefined, null, {}, []];

        // Act & Assert
        invalidCameraValues.forEach((camera) => assert.throws(() => renderer.render(scene, camera), /expects a `Camera` derived-instance/));
    });
});

test("'Renderer.render' should render an empty scene with a valid camera", () => {
    withFakeBrowserWebGLEnvironment((environment) => {
        // Arrange
        const renderer = RendererTestFactory.createRenderer(environment);
        const camera   = RendererTestFactory.createCamera();
        const scene    = new Scene();

        // Act & Assert
        assert.doesNotThrow(() => renderer.render(scene, camera));
    });
});

test("'Renderer.render' should skip values that are not 'Object3D' instances", () => {
    withFakeBrowserWebGLEnvironment((environment) => {
        // Arrange
        const fixture                 = RendererTestFactory.createRendererFixture(environment);
        const camera                  = RendererTestFactory.createCamera();
        const scene                   = new Scene();
        const nonObject3DValue        = {};
        const expectedDrawCallsLength = 0;

        // Act
        scene.traverse = (callback) => { callback(nonObject3DValue); };
        fixture.renderer.render(scene, camera);
        const actualDrawCallsLength = environment.drawCalls.length;

        // Assert
        assert.equal(actualDrawCallsLength, expectedDrawCallsLength);
    });
});

test("'Renderer.render' should draw one opaque mesh", () => {
    withFakeBrowserWebGLEnvironment((environment) => {
        // Arrange
        const fixture                 = RendererTestFactory.createRendererFixture(environment);
        const camera                  = RendererTestFactory.createCamera();
        const geometry                = new BoxGeometry(fixture.renderingContext);
        const material                = new VertexColorMaterial(fixture.renderingContext);
        const mesh                    = new Mesh(geometry, material);
        const scene                   = new Scene();
        const firstDrawCallIndex      = 0;
        const expectedDrawCallsLength = 1;
        const expectedDrawIndexCount  = 36;
        const expectedDrawOffsetBytes = 0;
        const expectedDrawMode        = fixture.renderingContext.TRIANGLES;
        const expectedDrawIndexType   = fixture.renderingContext.UNSIGNED_SHORT;

        // Act
        scene.add(mesh);
        fixture.renderer.render(scene, camera);
        const actualDrawCall = environment.drawCalls[firstDrawCallIndex];

        // Assert
        assert.equal(environment.drawCalls.length, expectedDrawCallsLength);
        assert.equal(actualDrawCall.mode, expectedDrawMode);
        assert.equal(actualDrawCall.count, expectedDrawIndexCount);
        assert.equal(actualDrawCall.type, expectedDrawIndexType);
        assert.equal(actualDrawCall.offset, expectedDrawOffsetBytes);
    });
});

test("'Renderer.render' should pass world matrix to material apply when requested", () => {
    withFakeBrowserWebGLEnvironment((environment) => {
        // Arrange
        const fixture                  = RendererTestFactory.createRendererFixture(environment);
        const camera                   = RendererTestFactory.createCamera();
        const material                 = RendererTestFactory.createWorldMatrixTrackingMaterial(fixture.renderingContext);
        const mesh                     = RendererTestFactory.createPrimitiveMeshWithMaterial(fixture.renderingContext, PRIMITIVE_TRIANGLES, material);
        const scene                    = new Scene();
        const firstApplyCallIndex      = 0;
        const expectedApplyCallsLength = 1;
        const expectedIsFloat32Array   = true;

        // Act
        scene.add(mesh);
        fixture.renderer.render(scene, camera);
        const actualApplyCallsLength   = material.applyCalls.length;
        const actualApplyCall          = material.applyCalls[firstApplyCallIndex];
        const actualIsFinalMatrixArray = actualApplyCall.finalMatrix instanceof Float32Array;

        // Assert
        assert.equal(actualApplyCallsLength, expectedApplyCallsLength);
        assert.equal(actualIsFinalMatrixArray, expectedIsFloat32Array);
        assert.equal(actualApplyCall.worldMatrix, mesh.worldMatrix);
    });
});

test("'Renderer.render' should pass normal matrix to material apply when requested", () => {
    withFakeBrowserWebGLEnvironment((environment) => {
        // Arrange
        const fixture                  = RendererTestFactory.createRendererFixture(environment);
        const camera                   = RendererTestFactory.createCamera();
        const material                 = RendererTestFactory.createNormalMatrixTrackingMaterial(fixture.renderingContext);
        const mesh                     = RendererTestFactory.createPrimitiveMeshWithMaterial(fixture.renderingContext, PRIMITIVE_TRIANGLES, material);
        const scene                    = new Scene();
        const firstApplyCallIndex      = 0;
        const expectedApplyCallsLength = 1;
        const expectedIsFloat32Array   = true;

        // Act
        scene.add(mesh);
        fixture.renderer.render(scene, camera);
        const actualApplyCallsLength             = material.applyCalls.length;
        const actualApplyCall                    = material.applyCalls[firstApplyCallIndex];
        const actualIsFinalMatrixArray           = actualApplyCall.finalMatrix instanceof Float32Array;
        const actualIsWorldInverseTransposeArray = actualApplyCall.worldInverseTransposeMatrix instanceof Float32Array;

        // Assert
        assert.equal(actualApplyCallsLength, expectedApplyCallsLength);
        assert.equal(actualIsFinalMatrixArray, expectedIsFloat32Array);
        assert.equal(actualApplyCall.worldMatrix, mesh.worldMatrix);
        assert.equal(actualIsWorldInverseTransposeArray, expectedIsFloat32Array);
    });
});

test("'Renderer.render' should pass camera position to material apply when requested", () => {
    withFakeBrowserWebGLEnvironment((environment) => {
        // Arrange
        const fixture                  = RendererTestFactory.createRendererFixture(environment);
        const camera                   = RendererTestFactory.createCamera();
        const scene                    = new Scene();
        const material                 = RendererTestFactory.createCameraPositionTrackingMaterial(fixture.renderingContext);
        const mesh                     = RendererTestFactory.createPrimitiveMeshWithMaterial(fixture.renderingContext, PRIMITIVE_TRIANGLES, material);
        const firstApplyCallIndex      = 0;
        const cameraPositionX          = 2;
        const cameraPositionY          = 3;
        const cameraPositionZ          = 4;
        const expectedApplyCallsLength = 1;
        const expectedIsFloat32Array   = true;

        camera.position.set(cameraPositionX, cameraPositionY, cameraPositionZ);
        const expectedCameraPositionX = camera.position.x;
        const expectedCameraPositionY = camera.position.y;
        const expectedCameraPositionZ = camera.position.z;

        // Act
        scene.add(mesh);
        fixture.renderer.render(scene, camera);
        const actualApplyCallsLength             = material.applyCalls.length;
        const actualApplyCall                    = material.applyCalls[firstApplyCallIndex];
        const actualIsFinalMatrixArray           = actualApplyCall.finalMatrix instanceof Float32Array;
        const actualIsWorldInverseTransposeArray = actualApplyCall.worldInverseTransposeMatrix instanceof Float32Array;
        const actualIsCameraPositionArray        = actualApplyCall.cameraPosition instanceof Float32Array;

        // Assert
        assert.equal(actualApplyCallsLength, expectedApplyCallsLength);
        assert.equal(actualIsFinalMatrixArray, expectedIsFloat32Array);
        assert.equal(actualApplyCall.worldMatrix, mesh.worldMatrix);
        assert.equal(actualIsWorldInverseTransposeArray, expectedIsFloat32Array);
        assert.equal(actualIsCameraPositionArray, expectedIsFloat32Array);
        assert.equal(actualApplyCall.cameraPosition[0], expectedCameraPositionX);
        assert.equal(actualApplyCall.cameraPosition[1], expectedCameraPositionY);
        assert.equal(actualApplyCall.cameraPosition[2], expectedCameraPositionZ);
    });
});

test("'Renderer.render' should pass active lights to directional light material", () => {
    withFakeBrowserWebGLEnvironment((environment) => {
        // Arrange
        const fixture                           = RendererTestFactory.createRendererFixture(environment);
        const camera                            = RendererTestFactory.createCamera();
        const material                          = RendererTestFactory.createTrackingDirectionalLightMaterial(fixture.renderingContext);
        const mesh                              = RendererTestFactory.createPrimitiveMeshWithMaterial(fixture.renderingContext, PRIMITIVE_TRIANGLES, material);
        const scene                             = new Scene();
        const directionalLight                  = new DirectionalLight();
        const ambientLight                      = new AmbientLight();
        const lightDirection                    = new Float32Array([1, 2, 3]);
        const firstLightDirectionCallIndex      = 0;
        const firstDirectionalStrengthCallIndex = 0;
        const firstAmbientStrengthCallIndex     = 0;
        const expectedLightDirectionCallsLength = 1;
        const expectedDirectionalCallsLength    = 1;
        const expectedAmbientCallsLength        = 1;
        const expectedApplyCallsLength          = 1;
        const expectedDrawCallsLength           = 1;
        const expectedDirectionalStrength       = 2.0;
        const expectedAmbientStrength           = 0.35;
        const expectedIsFloat32Array            = true;

        // Act
        directionalLight.setDirection(lightDirection);
        directionalLight.setStrength(expectedDirectionalStrength);
        ambientLight.setStrength(expectedAmbientStrength);
        scene.add(ambientLight);
        scene.add(directionalLight);
        scene.add(mesh);
        fixture.renderer.render(scene, camera);

        const actualLightDirectionCallsLength = material.lightDirectionCalls.length;
        const actualDirectionalCallsLength    = material.directionalStrengthCalls.length;
        const actualAmbientCallsLength        = material.ambientStrengthCalls.length;
        const actualApplyCallsLength          = material.applyCalls.length;
        const actualDrawCallsLength           = environment.drawCalls.length;
        const actualLightDirection            = material.lightDirectionCalls[firstLightDirectionCallIndex];
        const actualLightDirectionValues      = Array.from(actualLightDirection);
        const expectedLightDirectionValues    = Array.from(directionalLight.getDirection());
        const actualDirectionalStrength       = material.directionalStrengthCalls[firstDirectionalStrengthCallIndex];
        const actualAmbientStrength           = material.ambientStrengthCalls[firstAmbientStrengthCallIndex];
        const actualIsLightDirectionArray     = actualLightDirection instanceof Float32Array;

        // Assert
        assert.equal(actualLightDirectionCallsLength, expectedLightDirectionCallsLength);
        assert.equal(actualDirectionalCallsLength, expectedDirectionalCallsLength);
        assert.equal(actualAmbientCallsLength, expectedAmbientCallsLength);
        assert.equal(actualApplyCallsLength, expectedApplyCallsLength);
        assert.equal(actualDrawCallsLength, expectedDrawCallsLength);
        assert.equal(actualIsLightDirectionArray, expectedIsFloat32Array);
        assert.deepEqual(actualLightDirectionValues, expectedLightDirectionValues);
        assert.equal(actualDirectionalStrength, expectedDirectionalStrength);
        assert.equal(actualAmbientStrength, expectedAmbientStrength);
    });
});

test("'Renderer.render' should render the directional light material without active lights", () => {
    withFakeBrowserWebGLEnvironment((environment) => {
        // Arrange
        const fixture                          = RendererTestFactory.createRendererFixture(environment);
        const scene                            = new Scene();
        const camera                           = RendererTestFactory.createCamera();
        const material                         = RendererTestFactory.createTrackingDirectionalLightMaterial(fixture.renderingContext);
        const mesh                             = RendererTestFactory.createPrimitiveMeshWithMaterial(fixture.renderingContext, PRIMITIVE_TRIANGLES, material);
        const expectedLightDirectionCalls      = 0;
        const expectedDirectionalStrengthCalls = 0;
        const expectedAmbientStrengthCalls     = 0;
        const expectedApplyCallsLength         = 1;
        const expectedDrawCallsLength          = 1;

        // Act
        scene.add(mesh);
        fixture.renderer.render(scene, camera);
        const actualLightDirectionCalls      = material.lightDirectionCalls.length;
        const actualDirectionalStrengthCalls = material.directionalStrengthCalls.length;
        const actualAmbientStrengthCalls     = material.ambientStrengthCalls.length;
        const actualApplyCallsLength         = material.applyCalls.length;
        const actualDrawCallsLength          = environment.drawCalls.length;

        // Assert
        assert.equal(actualLightDirectionCalls, expectedLightDirectionCalls);
        assert.equal(actualDirectionalStrengthCalls, expectedDirectionalStrengthCalls);
        assert.equal(actualAmbientStrengthCalls, expectedAmbientStrengthCalls);
        assert.equal(actualApplyCallsLength, expectedApplyCallsLength);
        assert.equal(actualDrawCallsLength, expectedDrawCallsLength);
    });
});

test("'Renderer.render' should enable blending for transparent mesh", () => {
    withFakeBrowserWebGLEnvironment((environment) => {
        // Arrange
        const fixture                 = RendererTestFactory.createRendererFixture(environment);
        const camera                  = RendererTestFactory.createCamera();
        const mesh                    = RendererTestFactory.createPrimitiveMesh(fixture.renderingContext, PRIMITIVE_TRIANGLES);
        const scene                   = new Scene();
        const transparentOpacity      = 0.5;
        const firstBlendFuncCallIndex = 0;
        const firstDepthMaskCallIndex = 0;
        const expectedDrawCallsLength = 1;
        const expectedDepthMaskValue  = false;
        const expectedBlendEnabled    = true;
        const expectedBlendCapability = fixture.renderingContext.BLEND;
        const expectedBlendFuncCall   = {
            sourceFactor      : fixture.renderingContext.SRC_ALPHA,
            destinationFactor : fixture.renderingContext.ONE_MINUS_SRC_ALPHA
        };

        // Act
        scene.add(mesh);
        mesh.material.setOpacity(transparentOpacity);
        fixture.renderer.render(scene, camera);
        const actualDrawCallsLength = environment.drawCalls.length;
        const actualBlendEnabled    = environment.enabledCapabilities.includes(expectedBlendCapability);
        const actualBlendFuncCall   = environment.blendFuncCalls[firstBlendFuncCallIndex];
        const actualDepthMaskValue  = environment.depthMaskCalls[firstDepthMaskCallIndex];

        // Assert
        assert.equal(actualDrawCallsLength, expectedDrawCallsLength);
        assert.equal(actualBlendEnabled, expectedBlendEnabled);
        assert.deepEqual(actualBlendFuncCall, expectedBlendFuncCall);
        assert.equal(actualDepthMaskValue, expectedDepthMaskValue);
    });
});

test("'Renderer.render' should skip a disposed mesh", () => {
    withFakeBrowserWebGLEnvironment((environment) => {
        // Arrange
        const fixture                 = RendererTestFactory.createRendererFixture(environment);
        const camera                  = RendererTestFactory.createCamera();
        const geometry                = new BoxGeometry(fixture.renderingContext);
        const material                = new VertexColorMaterial(fixture.renderingContext);
        const mesh                    = new Mesh(geometry, material);
        const scene                   = new Scene();
        const expectedDrawCallsLength = 0;

        // Act
        scene.add(mesh);
        mesh.dispose();
        fixture.renderer.render(scene, camera);
        const actualDrawCallsLength = environment.drawCalls.length;

        // Assert
        assert.equal(actualDrawCallsLength, expectedDrawCallsLength);
    });
});

test("'Renderer.render' should throw for unknown geometry primitive", () => {
    withFakeBrowserWebGLEnvironment((environment) => {
        // Arrange
        const unknownPrimitive = 'unknown_primitive';
        const fixture          = RendererTestFactory.createRendererFixture(environment);
        const camera           = RendererTestFactory.createCamera();
        const mesh             = RendererTestFactory.createUnknownPrimitiveMesh(fixture.renderingContext, unknownPrimitive);
        const scene            = new Scene();

        // Act
        scene.add(mesh);
        const actualCall = () => fixture.renderer.render(scene, camera);

        // Assert
        assert.throws(actualCall, /unknown geometry primitive/);
    });
});

test("'Renderer.render' should draw wireframe mesh with line indices", () => {
    withFakeBrowserWebGLEnvironment((environment) => {
        // Arrange
        const fixture                 = RendererTestFactory.createRendererFixture(environment);
        const camera                  = RendererTestFactory.createCamera();
        const geometry                = new BoxGeometry(fixture.renderingContext);
        const material                = new VertexColorMaterial(fixture.renderingContext);
        const mesh                    = new Mesh(geometry, material);
        const scene                   = new Scene();
        const firstDrawCallIndex      = 0;
        const expectedDrawCallsLength = 1;
        const expectedDrawOffsetBytes = 0;
        const expectedDrawMode        = fixture.renderingContext.LINES;
        const expectedDrawIndexCount  = geometry.getIndexCount(true);
        const expectedDrawIndexType   = geometry.getIndexComponentType(true);

        // Act
        material.setWireframeEnabled(true);
        scene.add(mesh);
        fixture.renderer.render(scene, camera);
        const actualDrawCall = environment.drawCalls[firstDrawCallIndex];

        // Assert
        assert.equal(environment.drawCalls.length, expectedDrawCallsLength);
        assert.equal(actualDrawCall.mode, expectedDrawMode);
        assert.equal(actualDrawCall.count, expectedDrawIndexCount);
        assert.equal(actualDrawCall.type, expectedDrawIndexType);
        assert.equal(actualDrawCall.offset, expectedDrawOffsetBytes);
    });
});

test("'Renderer.render' should map line primitive to WebGL line mode", () => {
    withFakeBrowserWebGLEnvironment((environment) => {
        // Arrange
        const fixture                 = RendererTestFactory.createRendererFixture(environment);
        const camera                  = RendererTestFactory.createCamera();
        const scene                   = new Scene();
        const mesh                    = RendererTestFactory.createPrimitiveMesh(fixture.renderingContext, PRIMITIVE_LINES);
        const firstDrawCallIndex      = 0;
        const expectedDrawCallsLength = 1;
        const expectedDrawMode        = fixture.renderingContext.LINES;

        // Act
        scene.add(mesh);
        fixture.renderer.render(scene, camera);
        const actualDrawCall = environment.drawCalls[firstDrawCallIndex];

        // Assert
        assert.equal(environment.drawCalls.length, expectedDrawCallsLength);
        assert.equal(actualDrawCall.mode, expectedDrawMode);
    });
});

test("'Renderer.render' should map line strip primitive to WebGL line strip mode", () => {
    withFakeBrowserWebGLEnvironment((environment) => {
        // Arrange
        const fixture                 = RendererTestFactory.createRendererFixture(environment);
        const camera                  = RendererTestFactory.createCamera();
        const scene                   = new Scene();
        const mesh                    = RendererTestFactory.createPrimitiveMesh(fixture.renderingContext, PRIMITIVE_LINE_STRIP);
        const firstDrawCallIndex      = 0;
        const expectedDrawCallsLength = 1;
        const expectedDrawMode        = fixture.renderingContext.LINE_STRIP;

        // Act
        scene.add(mesh);
        fixture.renderer.render(scene, camera);
        const actualDrawCall = environment.drawCalls[firstDrawCallIndex];

        // Assert
        assert.equal(environment.drawCalls.length, expectedDrawCallsLength);
        assert.equal(actualDrawCall.mode, expectedDrawMode);
    });
});

test("'Renderer.render' should map line loop primitive to WebGL line loop mode", () => {
    withFakeBrowserWebGLEnvironment((environment) => {
        // Arrange
        const fixture                 = RendererTestFactory.createRendererFixture(environment);
        const camera                  = RendererTestFactory.createCamera();
        const mesh                    = RendererTestFactory.createPrimitiveMesh(fixture.renderingContext, PRIMITIVE_LINE_LOOP);
        const scene                   = new Scene();
        const firstDrawCallIndex      = 0;
        const expectedDrawCallsLength = 1;
        const expectedDrawMode        = fixture.renderingContext.LINE_LOOP;

        // Act
        scene.add(mesh);
        fixture.renderer.render(scene, camera);
        const actualDrawCall = environment.drawCalls[firstDrawCallIndex];

        // Assert
        assert.equal(environment.drawCalls.length, expectedDrawCallsLength);
        assert.equal(actualDrawCall.mode, expectedDrawMode);
    });
});

test("'Renderer.render' should map point primitive to WebGL point mode", () => {
    withFakeBrowserWebGLEnvironment((environment) => {
        // Arrange
        const fixture                 = RendererTestFactory.createRendererFixture(environment);
        const camera                  = RendererTestFactory.createCamera();
        const mesh                    = RendererTestFactory.createPrimitiveMesh(fixture.renderingContext, PRIMITIVE_POINTS);
        const scene                   = new Scene();
        const firstDrawCallIndex      = 0;
        const expectedDrawCallsLength = 1;
        const expectedDrawMode        = fixture.renderingContext.POINTS;

        // Act
        scene.add(mesh);
        fixture.renderer.render(scene, camera);
        const actualDrawCall = environment.drawCalls[firstDrawCallIndex];

        // Assert
        assert.equal(environment.drawCalls.length, expectedDrawCallsLength);
        assert.equal(actualDrawCall.mode, expectedDrawMode);
    });
});

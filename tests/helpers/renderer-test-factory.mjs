import { Renderer }                 from '../../core/render/renderer.js';
import { WebGLContext }             from '../../core/webgl-context.js';
import { PerspectiveCamera }        from '../../core/scene/perspective-camera.js';
import { Mesh }                     from '../../core/scene/mesh.js';
import { VertexColorMaterial }      from '../../core/material/vertex-color-material.js';
import { DirectionalLightMaterial } from '../../core/material/directional-light-material.js';
import { ShaderProgram }            from '../../core/shader/shader-program.js';
import {
    Geometry,
    PRIMITIVE_LINES,
    PRIMITIVE_TRIANGLES
} from '../../core/geometry/geometry.js';

const TRACKING_DIRECTIONAL_LIGHT_VERTEX_SHADER_SOURCE = `#version 300 es
precision mediump float;
layout(location = 0) in vec3 a_position;
uniform mat4 u_matrix;

void main() {
    gl_Position = u_matrix * vec4(a_position, 1.0);
}
`;

const TRACKING_DIRECTIONAL_LIGHT_FRAGMENT_SHADER_SOURCE = `#version 300 es
precision mediump float;
out vec4 outColor;

void main() {
    outColor = vec4(1.0);
}
`;

class WorldMatrixTrackingMaterial extends VertexColorMaterial {
    constructor(renderingContext) {
        super(renderingContext);
        this.applyCalls = [];
    }

    apply(finalMatrix, worldMatrix) {
        this.applyCalls.push({ finalMatrix, worldMatrix });
    }
}

class NormalMatrixTrackingMaterial extends VertexColorMaterial {
    constructor(renderingContext) {
        super(renderingContext);
        this.applyCalls = [];
    }

    apply(finalMatrix, worldMatrix, worldInverseTransposeMatrix) {
        this.applyCalls.push({ finalMatrix, worldMatrix, worldInverseTransposeMatrix });
    }
}

class TrackingDirectionalLightMaterial extends DirectionalLightMaterial {
    constructor(renderingContext) {
        const shaderProgram = new ShaderProgram(
            renderingContext,
            TRACKING_DIRECTIONAL_LIGHT_VERTEX_SHADER_SOURCE,
            TRACKING_DIRECTIONAL_LIGHT_FRAGMENT_SHADER_SOURCE
        );

        super(renderingContext, shaderProgram);
        this.lightDirectionCalls      = [];
        this.directionalStrengthCalls = [];
        this.ambientStrengthCalls     = [];
        this.applyCalls               = [];
    }

    setLightDirection(direction) {
        if (this.lightDirectionCalls) {
            this.lightDirectionCalls.push(direction);
        }

        super.setLightDirection(direction);
    }

    setDirectionalStrength(strength) {
        this.directionalStrengthCalls.push(strength);
        super.setDirectionalStrength(strength);
    }

    setAmbientStrength(strength) {
        this.ambientStrengthCalls.push(strength);
        super.setAmbientStrength(strength);
    }

    apply(finalMatrix, worldMatrix, worldInverseTransposeMatrix, cameraPosition) {
        this.applyCalls.push({ finalMatrix, worldMatrix, worldInverseTransposeMatrix, cameraPosition });
        super.apply(finalMatrix, worldMatrix, worldInverseTransposeMatrix, cameraPosition);
    }
}

class CameraPositionTrackingMaterial extends VertexColorMaterial {
    constructor(renderingContext) {
        super(renderingContext);
        this.applyCalls = [];
    }

    apply(finalMatrix, worldMatrix, worldInverseTransposeMatrix, cameraPosition) {
        this.applyCalls.push({ finalMatrix, worldMatrix, worldInverseTransposeMatrix, cameraPosition });
    }
}

export class RendererTestFactory {
    static createRenderer(environment) {
        return RendererTestFactory.createRendererFixture(environment).renderer;
    }

    static createRendererFixture(environment) {
        const canvas           = environment.createCanvas();
        const webglContext     = new WebGLContext(canvas);
        const renderer         = new Renderer(webglContext);
        const renderingContext = webglContext.context;

        return {
            renderer,
            webglContext,
            renderingContext
        };
    }

    static createCamera() {
        return new PerspectiveCamera(Math.PI / 3, 1, 0.1, 100);
    }

    static createPrimitiveMesh(renderingContext, primitive) {
        const material = new VertexColorMaterial(renderingContext);
        return RendererTestFactory.createPrimitiveMeshWithMaterial(renderingContext, primitive, material);
    }

    static createPrimitiveMeshWithMaterial(renderingContext, primitive, material) {
        const positions = new Float32Array([
            0, 0, 0,
            1, 0, 0,
            0, 1, 0
        ]);

        const colors = new Float32Array([
            1, 0, 0,
            0, 1, 0,
            0, 0, 1
        ]);

        const indices = primitive === PRIMITIVE_TRIANGLES
            ? new Uint16Array([0, 1, 2])
            : new Uint16Array([0, 1]);

        const geometry = new Geometry(
            renderingContext,
            positions,
            colors,
            indices,
            indices,
            null,
            null,
            {
                solidPrimitive     : primitive,
                wireframePrimitive : primitive
            }
        );

        return new Mesh(geometry, material);
    }

    static createWorldMatrixTrackingMaterial(renderingContext) {
        return new WorldMatrixTrackingMaterial(renderingContext);
    }

    static createNormalMatrixTrackingMaterial(renderingContext) {
        return new NormalMatrixTrackingMaterial(renderingContext);
    }

    static createCameraPositionTrackingMaterial(renderingContext) {
        return new CameraPositionTrackingMaterial(renderingContext);
    }

    static createTrackingDirectionalLightMaterial(renderingContext) {
        return new TrackingDirectionalLightMaterial(renderingContext);
    }

    static createUnknownPrimitiveMesh(renderingContext, unknownPrimitive) {
        const mesh = RendererTestFactory.createPrimitiveMesh(renderingContext, PRIMITIVE_LINES);
        mesh.geometry.getPrimitive = (wireframe) => (wireframe ? PRIMITIVE_LINES : unknownPrimitive);
        return mesh;
    }
}

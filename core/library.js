import { WebGLContext }         from './webgl-context.js';
import { Matrix4 }              from './math/matrix4.js';
import { Vector3 }              from './math/vector3.js';
import { CameraMath }           from './math/camera-math.js';
import { Geometry }             from './geometry/geometry.js';
import { BoxGeometry }          from './geometry/box-geometry.js';
import { ShaderProgram }        from './shader/shader-program.js';
import { Material }             from './material/material.js';
import { BasicMaterial }        from './material/basic-material.js';
import { Object3D }             from './scene/object3d.js';
import { Mesh }                 from './scene/mesh.js';
import { Scene }                from './scene/scene.js';
import { PerspectiveCamera }    from './scene/camera.js';
import { Renderer }             from './render/renderer.js';
import { Engine, createEngine } from './engine/engine.js';

/**
 * Main public API namespace.
 *
 * Suggested usage:
 *
 * ```js
 * import { GeraWebGL } from './gerawebgl.js';
 * const engine = GeraWebGL.createEngine(canvas);
 * ```
 *
 * @namespace
 */
export const GeraWebGL = Object.freeze({
    Engine,
    createEngine,

    // High-level building blocks:
    WebGLContext,
    Renderer,
    Scene,
    PerspectiveCamera,
    Object3D,
    Mesh,

    // Grouped namespaces:
    Math: Object.freeze({
        Matrix4,
        Vector3,
        CameraMath
    }),

    Geometries: Object.freeze({
        Geometry,
        BoxGeometry
    }),

    Materials: Object.freeze({
        Material,
        BasicMaterial
    }),

    // Low-level access (shaders, manual uniforms/attributes):
    LowLevel: Object.freeze({
        ShaderProgram
    })
});

export default GeraWebGL;

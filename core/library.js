import { WebGLContext }             from './webgl-context.js';
import { Matrix4 }                  from './math/matrix4.js';
import { Vector3 }                  from './math/vector3.js';
import { CameraMath }               from './math/camera-math.js';
import { Geometry }                 from './geometry/geometry.js';
import { BoxGeometry }              from './geometry/box-geometry.js';
import { ShaderProgram }            from './shader/shader-program.js';
import { Material }                 from './material/material.js';
import { VertexColorMaterial }      from './material/vertex-color-material.js';
import { SolidColorMaterial }       from './material/solid-color-material.js';
import { TexturedMaterial }         from './material/textured-material.js';
import { NormalMaterial }           from './material/normal-material.js';
import { DirectionalLightMaterial } from './material/directional-light-material.js';
import { LambertMaterial }          from './material/lambert-material.js';
import { PhongMaterial }            from './material/phong-material.js';
import { Texture2D }                from './texture/texture2d.js';
import { Object3D }                 from './scene/object3d.js';
import { Mesh }                     from './scene/mesh.js';
import { Scene }                    from './scene/scene.js';
import { Camera }                   from './scene/camera.js';
import { PerspectiveCamera }        from './scene/perspective-camera.js';
import { Renderer }                 from './render/renderer.js';
import { Engine, createEngine }     from './engine/engine.js';

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
    Camera,
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

    Textures: Object.freeze({
        Texture2D
    }),

    Materials: Object.freeze({
        Material,
        VertexColorMaterial,
        SolidColorMaterial,
        TexturedMaterial,
        NormalMaterial,
        DirectionalLightMaterial,
        LambertMaterial,
        PhongMaterial
    }),

    // Low-level access (shaders, manual uniforms/attributes):
    LowLevel: Object.freeze({
        ShaderProgram
    })
});

export default GeraWebGL;

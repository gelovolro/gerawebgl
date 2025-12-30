import { WebGLContext }             from './webgl-context.js';
import { Matrix4 }                  from './math/matrix4.js';
import { Vector3 }                  from './math/vector3.js';
import { CameraMath }               from './math/camera-math.js';
import { Geometry }                 from './geometry/geometry.js';
import { CustomGeometry }           from './geometry/custom-geometry.js';
import { BoxGeometry }              from './geometry/box-geometry.js';
import { PlaneGeometry }            from './geometry/plane-geometry.js';
import { SphereGeometry }           from './geometry/sphere-geometry.js';
import { TorusGeometry }            from './geometry/torus-geometry.js';
import { ConeGeometry }             from './geometry/cone-geometry.js';
import { PyramidGeometry }          from './geometry/pyramid-geometry.js';
import { HeightmapGeometry }        from './geometry/heightmap-geometry.js';
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
import { OrthographicCamera }       from './scene/orthographic-camera.js';
import { FirstPersonCamera }        from './scene/first-person-camera.js';
import { ThirdPersonCamera }        from './scene/third-person-camera.js';
import { Renderer }                 from './render/renderer.js';
import { Engine, createEngine }     from './engine/engine.js';
import { FpsCounter }               from './debug/fps-counter.js';
import { ObjMtlLoader }             from './loader/obj-mtl-loader.js';
import { OrbitControls }            from './controls/orbit-controls.js';
import { KeyboardControls }         from './controls/keyboard-controls.js';
import { FirstPersonControls }      from './controls/first-person-controls.js';
import { ThirdPersonControls }      from './controls/third-person-controls.js';
import { Raycaster }                from './interaction/raycaster.js';

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
    OrthographicCamera,
    FirstPersonCamera,
    ThirdPersonCamera,
    Object3D,
    Mesh,
    Raycaster,

    // Grouped namespaces:
    Math: Object.freeze({
        Matrix4,
        Vector3,
        CameraMath
    }),

    Geometries: Object.freeze({
        Geometry,
        BoxGeometry,
        PlaneGeometry,
        SphereGeometry,
        TorusGeometry,
        ConeGeometry,
        PyramidGeometry,
        CustomGeometry,
        HeightmapGeometry
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

    Controls: Object.freeze({
        OrbitControls,
        KeyboardControls,
        ThirdPersonControls,
        FirstPersonControls
    }),

    Loaders: Object.freeze({
        ObjMtlLoader
    }),

    Debug: Object.freeze({
        FpsCounter
    }),

    // Low-level access (shaders, manual uniforms/attributes):
    LowLevel: Object.freeze({
        ShaderProgram
    })
});

export default GeraWebGL;

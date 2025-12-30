# Gera WebGL library.

I first developed my own WebGL library (based on v1.0) back in 2014. Now I’ve decided to revisit those ideas, explore what WebGL 2.0 offers, and rebuild everything from scratch. The project is named in memory of my cat, who died in 2017.

- **API reference (JSDoc):** https://gelovolro.github.io/gerawebgl/
- **Materials demo:** https://gelovolro.github.io/gerawebgl/demo/materials.html
- **Geometries demo:** https://gelovolro.github.io/gerawebgl/demo/geometries.html
- **OBJ/MTL loader demo:** https://gelovolro.github.io/gerawebgl/demo/obj-mtl-demo.html
- **Character controls demo (WASD, sprinting, jumping, mouse look, bobbing, 1st/3rd person camera):** https://gelovolro.github.io/gerawebgl/demo/character-controls.html
- **Heightmap terrain generation demo:** https://gelovolro.github.io/gerawebgl/demo/heightmap-terrain-demo.html

## Quick start

```js
import { GeraWebGL } from './gerawebgl.js';

const canvas = document.querySelector('#glcanvas');
const engine = GeraWebGL.createEngine(canvas);
const cube   = engine.createBoxMesh({ size: 1.0 });
engine.scene.add(cube);

engine.start((delta) => {
    cube.rotation.x += delta;
    cube.rotation.y += delta * 0.7;
});
```

## API levels

### High-level

High-level modules are for "get something on screen fast":

- `Engine` (scene + camera + renderer + render loop)
- Scene objects      : `Scene`, `Object3D`, `Mesh`, `Camera`, `PerspectiveCamera`, `OrthographicCamera`, `FirstPersonCamera`, `ThirdPersonCamera`
- Built-in geometry  : `CustomGeometry`, `BoxGeometry`, `PlaneGeometry`, `SphereGeometry`, `ConeGeometry`, `TorusGeometry`, `PyramidGeometry`, `HeightmapGeometry` (all of them support segmentation)
- Built-in materials : `SolidColorMaterial`, `VertexColorMaterial`, `TexturedMaterial`, `NormalMaterial`, `DirectionalLightMaterial`, `LambertMaterial`, `PhongMaterial`
- Controls           : `OrbitControls`, `KeyboardControls`, `FirstPersonControls`, `ThirdPersonControls`
- Loader             : `ObjMtlLoader`
- Debugging          : `FpsCounter`

Example:

```js
const engine = GeraWebGL.createEngine(canvas);
const cube   = engine.createBoxMesh({ size: 1.0 });
engine.scene.add(cube);
```

### Low-level

Low-level modules are for custom shaders and direct WebGL control. Example:

```js
import GeraWebGL from './gerawebgl.js';

const canvas       = document.querySelector('#glcanvas');
const engine       = GeraWebGL.createEngine(canvas);
const webglContext = engine.webglRenderingContext;

const VERTEX_SHADER_SOURCE = `#version 300 es
precision mediump float;
layout(location = 0) in vec3 a_position;
layout(location = 1) in vec3 a_color;
uniform mat4 u_matrix;
out vec3 v_color;

void main() {
    gl_Position = u_matrix * vec4(a_position, 1.0);
    v_color = a_color;
}
`;

const FRAGMENT_SHADER_SOURCE = `#version 300 es
precision mediump float;
in vec3 v_color;
out vec4 outColor;
uniform float u_time;

void main() {
    float pulse = 0.5 + 0.5 * sin(u_time);
    outColor = vec4(v_color * pulse, 1.0);
}
`;

class TestMaterial extends GeraWebGL.Materials.Material {
    constructor(webglContext) {
        const program = new GeraWebGL.LowLevel.ShaderProgram(
            webglContext,
            VERTEX_SHADER_SOURCE,
            FRAGMENT_SHADER_SOURCE
        );

        super(webglContext, program, { ownsShaderProgram: true });
    }

    apply(matrix4) {
        this.shaderProgram.setMatrix4('u_matrix', matrix4);
        this.shaderProgram.setFloat('u_time', performance.now() * 0.001);
    }
}

const geometry = new GeraWebGL.Geometries.BoxGeometry(webglContext, 1.0);
const material = new TestMaterial(webglContext);
const cube     = new GeraWebGL.Mesh(geometry, material);
engine.scene.add(cube);
engine.start((delta) => cube.rotation.y += delta);
```

## Materials

### VertexColorMaterial

Uses per-vertex colors provided by geometry (`a_color`).

### SolidColorMaterial

Uniform color for the whole mesh:

```js
const material = new GeraWebGL.Materials.SolidColorMaterial(webglContext, {
    color: new Float32Array([0.2, 0.9, 0.3]),
});
```

### TexturedMaterial

Texture + UVs:

```js
const texture = new GeraWebGL.Textures.Texture2D(webglContext);
await texture.loadFromUrl('./assets/test1.jpg');

const material = new GeraWebGL.Materials.TexturedMaterial(webglContext, {
  texture,
  ownsTexture: false,
  textureUnitIndex: 0,
});
```

## BoxGeometry colors contract

`BoxGeometry` accepts `options.colors` as a `Float32Array` with one of these exact lengths:

- **3**  => uniform RGB for the whole cube.
- **18** => per-face RGB (6 faces * 3 components).
- **72** => per-vertex RGB (24 vertices * 3 components).

Face order for the **18-length** buffer is: **Front, Back, Top, Bottom, Right, Left**.

## Build & run demo:

```bash
# Restore the dependencies:
npm install

# Building project and serving the demo:
npm run build # or npm run build:all
npm run demo:serve

# Or using a single command:
npm run build:all-and-serve-demo
```

## Working with linting:

```bash
# Check:
npx eslint core

# Fixing:
npx eslint core --fix
```

## Docs generation commands:

```bash
npm run docs:build
npm run docs:serve
npm run docs:build-and-serve
```

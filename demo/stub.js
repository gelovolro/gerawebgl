import { WebGLContext } from '../core/webgl-context.js';
import { Renderer } from '../core/render/renderer.js';
import { Scene } from '../core/scene/scene.js';
import { PerspectiveCamera } from '../core/scene/camera.js';
import { BoxGeometry } from '../core/geometry/box-geometry.js';
import { BasicMaterial } from '../core/material/basic-material.js';
import { Mesh } from '../core/scene/mesh.js';

/** @type {HTMLCanvasElement | null} */
const canvas = document.getElementById('glcanvas');

if (!canvas) {
    throw new Error('Canvas element with id "glcanvas" not found.');
}

const webglContext = new WebGLContext(canvas);
const renderer     = new Renderer(webglContext);
const scene        = new Scene();

/** @type {WebGL2RenderingContext} */
const gl = webglContext.context;

const camera = new PerspectiveCamera(
    Math.PI / 4, // 45 degrees
    canvas.width / canvas.height,
    0.1,
    100.0
);

const boxGeometry = new BoxGeometry(gl, 1.0);
const material    = new BasicMaterial(gl);
const cube        = new Mesh(boxGeometry, material);

cube.position.z = -3.0;
scene.add(cube);

/** @type {HTMLButtonElement | null} */
const wireframeToggleButton = document.getElementById('wireframeToggleButton');

if (!wireframeToggleButton) {
    throw new Error('Button with id "wireframeToggleButton" not found.');
}

/**
 * Updates the label of the wireframe toggle button.
 */
function updateWireframeButtonLabel() {
    const isWireframeEnabled = material.isWireframeEnabled();
    wireframeToggleButton.textContent = isWireframeEnabled
        ? 'Wireframe: ON'
        : 'Wireframe: OFF';
}

wireframeToggleButton.addEventListener('click', () => {
    material.toggleWireframe();
    updateWireframeButtonLabel();
});

// Инициализируем подпись кнопки в соответствии с текущим состоянием.
updateWireframeButtonLabel();

let lastTimestamp  = performance.now();
let rotationSpeedX = Math.PI / 4;
let rotationSpeedY = Math.PI / 3;

function renderFrame(currentTimestamp) {
    const deltaMilliseconds = currentTimestamp - lastTimestamp;
    lastTimestamp           = currentTimestamp;

    const deltaSeconds = deltaMilliseconds / 1000.0;

    cube.rotation.x += rotationSpeedX * deltaSeconds;
    cube.rotation.y += rotationSpeedY * deltaSeconds;

    renderer.render(scene, camera);

    window.requestAnimationFrame(renderFrame);
}

window.requestAnimationFrame(renderFrame);

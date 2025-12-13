import {
    WebGLContext,
    Renderer,
    Scene,
    PerspectiveCamera,
    Mesh,
    BoxGeometry,
    BasicMaterial
} from './gerawebgl.js';

const canvas = document.getElementById('glcanvas');

if (!(canvas instanceof HTMLCanvasElement)) {
    throw new Error('Canvas element with id "glcanvas" not found.');
}

const contextWrapper = new WebGLContext(canvas);
const renderer       = new Renderer(contextWrapper);
const scene          = new Scene();
const camera         = new PerspectiveCamera(
    Math.PI / 4,
    1.0,
    0.1,
    100.0
);

const geometry = new BoxGeometry(contextWrapper.context, 1.0);
const material = new BasicMaterial(contextWrapper.context);
const cube     = new Mesh(geometry, material);
scene.add(cube);
camera.position.z = 5.0;

const wireframeToggleButton = document.getElementById('wireframeToggleButton');

if (!wireframeToggleButton) {
    throw new Error('Button with id "wireframeToggleButton" not found.');
}

function updateWireframeButtonLabel() {
    const isWireframeEnabled = material.isWireframeEnabled();
    wireframeToggleButton.textContent = isWireframeEnabled
        ? 'Wireframe: ON'
        : 'Wireframe: OFF';
}

if (wireframeToggleButton instanceof HTMLButtonElement) {
    wireframeToggleButton.addEventListener('click', () => {
        const wireframeEnabled = material.isWireframeEnabled();
        material.setWireframeEnabled(!wireframeEnabled);
        updateWireframeButtonLabel();
    });
}

let lastTimeSeconds = 0;

function renderFrame(timeMs) {
    const currentTimeSeconds = timeMs * 0.001;
    const deltaTime          = currentTimeSeconds - lastTimeSeconds;
    lastTimeSeconds          = currentTimeSeconds;
    cube.rotation.x          += deltaTime;
    cube.rotation.y          += deltaTime * 0.7;
    renderer.render(scene, camera);
    window.requestAnimationFrame(renderFrame);
}

window.requestAnimationFrame(renderFrame);

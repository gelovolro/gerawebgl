import { WebGLContext } from '../core/webgl-context.js';

/** @type {HTMLCanvasElement|null} */
const canvas = document.getElementById('glcanvas');

if (!canvas) {
    throw new Error('Canvas element with id "glcanvas" not found.');
}

const webglContext = new WebGLContext(canvas);

function renderFrame() {
    webglContext.resizeToDisplaySize();
    webglContext.clear();
    requestAnimationFrame(renderFrame);
}

renderFrame();

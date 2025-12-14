import {
    WebGLContext,
    Renderer,
    Scene,
    PerspectiveCamera,
    Mesh,
    BoxGeometry,
    BasicMaterial
} from './gerawebgl.js';

/**
 * Demo application that renders a rotating cube and provides UI controls.
 */
class DemoApp {
    /** @type {HTMLCanvasElement} */
    #canvas;

    /** @type {WebGLContext} */
    #contextWrapper;

    /** @type {Renderer} */
    #renderer;

    /** @type {Scene} */
    #scene;

    /** @type {PerspectiveCamera} */
    #camera;

    /** @type {Mesh} */
    #cube;

    /** @type {HTMLButtonElement} */
    #wireframeToggleButton;

    /** @type {HTMLButtonElement} */
    #recreateMeshButton;

    /** @type {number} */
    #recreateCount = 0;

    /** @type {number} */
    #lastTimeSeconds = 0;

    /**
     * @param {HTMLCanvasElement} canvas                - Canvas used for rendering.
     * @param {HTMLButtonElement} wireframeToggleButton - Button that toggles wireframe mode.
     * @param {HTMLButtonElement} recreateMeshButton    - Button that recreates the cube and disposes old resources.
     */
    constructor(canvas, wireframeToggleButton, recreateMeshButton) {
        this.#canvas                = canvas;
        this.#wireframeToggleButton = wireframeToggleButton;
        this.#recreateMeshButton    = recreateMeshButton;
        this.#contextWrapper        = new WebGLContext(this.#canvas);
        this.#renderer              = new Renderer(this.#contextWrapper);
        this.#scene                 = new Scene();
        this.#camera                = new PerspectiveCamera(Math.PI / 4, 1.0, 0.1, 100.0);
        this.#camera.position.z     = 5.0;
        this.#cube                  = this.#createCube();
        this.#scene.add(this.#cube);
        this.#bindUI();
        this.#updateWireframeButtonLabel();
    }

    /**
     * Starts the render loop.
     */
    start() {
        window.requestAnimationFrame((timeMs) => this.#renderFrame(timeMs));
    }

    /**
     * @returns {Mesh}
     * @private
     */
    #createCube() {
        const geometry = new BoxGeometry(this.#contextWrapper.context, 1.0);
        const material = new BasicMaterial(this.#contextWrapper.context);
        return new Mesh(geometry, material);
    }

    /**
     * @private
     */
    #bindUI() {
        this.#wireframeToggleButton.addEventListener('click', () => {
            const material = this.#cube.material;
            material.setWireframeEnabled(!material.isWireframeEnabled());
            this.#updateWireframeButtonLabel();
        });

        this.#recreateMeshButton.addEventListener('click', () => {
            this.#recreateCube();
        });
    }

    /**
     * @private
     */
    #recreateCube() {
        const wasWireframeEnabled = this.#cube.material.isWireframeEnabled();
        this.#scene.remove(this.#cube);
        this.#cube.dispose();
        this.#cube = this.#createCube();
        this.#cube.material.setWireframeEnabled(wasWireframeEnabled);
        this.#scene.add(this.#cube);
        this.#recreateCount += 1;
        this.#recreateMeshButton.textContent = `Recreate mesh (dispose test): ${this.#recreateCount}`;
        this.#updateWireframeButtonLabel();
    }

    /**
     * @private
     */
    #updateWireframeButtonLabel() {
        const isWireframeEnabled = this.#cube.material.isWireframeEnabled();
        this.#wireframeToggleButton.textContent = isWireframeEnabled
            ? 'Wireframe: ON'
            : 'Wireframe: OFF';
    }

    /**
     * @param {number} timeMs
     * @private
     */
    #renderFrame(timeMs) {
        const currentTimeSeconds = timeMs * 0.001;
        const deltaTime          = currentTimeSeconds - this.#lastTimeSeconds;
        this.#lastTimeSeconds    = currentTimeSeconds;
        this.#cube.rotation.x    += deltaTime;
        this.#cube.rotation.y    += deltaTime * 0.7;
        this.#renderer.render(this.#scene, this.#camera);
        window.requestAnimationFrame((nextTimeMs) => this.#renderFrame(nextTimeMs));
    }
}

const canvas                = document.getElementById('glcanvas');
const wireframeToggleButton = document.getElementById('wireframeToggleButton');
const recreateMeshButton    = document.getElementById('recreateMeshButton');

if (!(canvas instanceof HTMLCanvasElement)) {
    throw new Error('Canvas element with id "glcanvas" not found.');
}

if (!(wireframeToggleButton instanceof HTMLButtonElement)) {
    throw new Error('Button with id "wireframeToggleButton" not found.');
}

if (!(recreateMeshButton instanceof HTMLButtonElement)) {
    throw new Error('Button with id "recreateMeshButton" not found.');
}

const app = new DemoApp(canvas, wireframeToggleButton, recreateMeshButton);
app.start();

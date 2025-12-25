import GeraWebGL from './gerawebgl.js';

/**
 * Canvas element id used by the OBJ/MTL demo.
 *
 * @type {string}
 */
const CANVAS_ELEMENT_ID = 'glcanvas';

/**
 * Wireframe toggle button id.
 *
 * @type {string}
 */
const WIREFRAME_TOGGLE_BUTTON_ID = 'wireframeToggleButton';

/**
 * Reset view button id.
 *
 * @type {string}
 */
const RESET_VIEW_BUTTON_ID = 'resetViewButton';

/**
 * Status label element id.
 *
 * @type {string}
 */
const STATUS_LABEL_ID = 'statusLabel';

/**
 * OBJ asset URL.
 *
 * @type {string}
 */
const OBJ_URL = './assets/mtl-example-model/wooden_tower.obj';

/**
 * MTL asset URL.
 *
 * @type {string}
 */
const MTL_URL = './assets/mtl-example-model/wooden_tower.mtl';

/**
 * Wireframe label prefix.
 *
 * @type {string}
 */
const WIREFRAME_LABEL_PREFIX = 'Wireframe: ';

/**
 * Wireframe label, when enabled.
 *
 * @type {string}
 */
const WIREFRAME_LABEL_ON = 'ON';

/**
 * Wireframe label, when disabled.
 *
 * @type {string}
 */
const WIREFRAME_LABEL_OFF = 'OFF';

/**
 * Status label while loading.
 *
 * @type {string}
 */
const STATUS_LOADING = 'Loading model...';

/**
 * Status label, when loaded.
 *
 * @type {string}
 */
const STATUS_READY = '3D model was loaded & is ready';

/**
 * Status label, when loading fails.
 *
 * @type {string}
 */
const STATUS_ERROR = 'Failed to load OBJ/MTL';

/**
 * Orbit controls initial distance.
 *
 * @type {number}
 */
const ORBIT_DISTANCE = 15.0;

/**
 * Orbit controls minimum distance.
 *
 * @type {number}
 */
const ORBIT_MIN_DISTANCE = 2.0;

/**
 * Orbit controls maximum distance.
 *
 * @type {number}
 */
const ORBIT_MAX_DISTANCE = 50.0;

/**
 * Initial azimuth angle for orbit controls.
 *
 * @type {number}
 */
const ORBIT_AZIMUTH_RADIANS = 0.7;

/**
 * Initial polar angle for orbit controls.
 *
 * @type {number}
 */
const ORBIT_POLAR_RADIANS = -0.6;

/**
 * Rotation speed for the loaded model.
 *
 * @type {number}
 */
const MODEL_ROTATION_SPEED = 0.35;

/**
 * Boolean flag for wireframe state.
 *
 * @type {boolean}
 */
const DEFAULT_WIREFRAME_STATE = false;

/**
 * Vertical offset applied to the loaded model root.
 *
 * @type {number}
 */
const LOADED_MODEL_Y_OFFSET = -5.5;

/**
 * Demo application that renders an OBJ/MTL model and provides UI for wireframe toggle and view reset.
 */
class DemoApp {
    /**
     * Canvas element used by the demo.
     *
     * @type {HTMLCanvasElement}
     * @private
     */
    #canvas;

    /**
     * Wireframe toggle button.
     *
     * @type {HTMLButtonElement}
     * @private
     */
    #wireframeButton;

    /**
     * Reset view button.
     *
     * @type {HTMLButtonElement}
     * @private
     */
    #resetButton;

    /**
     * Status label element.
     *
     * @type {HTMLElement}
     * @private
     */
    #statusLabel;

    /**
     * Engine instance used by the demo.
     *
     * @type {GeraWebGL.Engine}
     * @private
     */
    #engine;

    /**
     * Orbit controls instance used by the demo.
     *
     * @type {GeraWebGL.Controls.OrbitControls}
     * @private
     */
    #orbitControls;

    /**
     * OBJ/MTL loader instance used by the demo.
     *
     * @type {GeraWebGL.Loaders.ObjMtlLoader}
     * @private
     */
    #loader;

    /**
     * Current wireframe enabled state.
     *
     * @type {boolean}
     * @private
     */
    #wireframeEnabled = DEFAULT_WIREFRAME_STATE;

    /**
     * Loaded root object returned by the loader (added to the scene).
     *
     * @type {GeraWebGL.Object3D | null}
     * @private
     */
    #loadedRoot = null;

    /**
     * Loaded meshes returned by the loader (used for wireframe toggle).
     *
     * @type {Array<GeraWebGL.Mesh>}
     * @private
     */
    #loadedMeshes = [];

    /**
     * @param {HTMLCanvasElement} canvas          - Canvas element.
     * @param {HTMLButtonElement} wireframeButton - Wireframe toggle button.
     * @param {HTMLButtonElement} resetButton     - Reset view button.
     * @param {HTMLElement} statusLabel           - Status label element.
     */
    constructor(canvas, wireframeButton, resetButton, statusLabel) {
        this.#canvas          = canvas;
        this.#wireframeButton = wireframeButton;
        this.#resetButton     = resetButton;
        this.#statusLabel     = statusLabel;
        this.#updateStatus(this.#statusLabel, STATUS_LOADING);

        this.#engine        = GeraWebGL.createEngine(this.#canvas, { fitToWindow: true });
        this.#orbitControls = this.#createOrbitControls(this.#engine.camera, this.#canvas);
        this.#loader        = new GeraWebGL.Loaders.ObjMtlLoader(this.#engine.webglRenderingContext);
        this.#updateWireframeLabel(this.#wireframeButton, this.#wireframeEnabled);
        this.#bindUI();
        this.#loadModel();
    }

    /**
     * Starts the `requestAnimationFrame` render loop.
     */
    start() {
        this.#engine.start((deltaTime) => {
            this.#onFrame(deltaTime);
        });
    }

    /**
     * Creates orbit controls with the default configuration.
     *
     * @param {GeraWebGL.Camera} camera  - Active camera.
     * @param {HTMLCanvasElement} canvas - Canvas element.
     * @returns {GeraWebGL.Controls.OrbitControls}
     * @private
     */
    #createOrbitControls(camera, canvas) {
        return new GeraWebGL.Controls.OrbitControls(camera, canvas, {
            distance       : ORBIT_DISTANCE,
            minDistance    : ORBIT_MIN_DISTANCE,
            maxDistance    : ORBIT_MAX_DISTANCE,
            azimuthRadians : ORBIT_AZIMUTH_RADIANS,
            polarRadians   : ORBIT_POLAR_RADIANS
        });
    }

    /**
     * Updates the wireframe button label.
     *
     * @param {HTMLButtonElement} button - Wireframe button.
     * @param {boolean} enabled          - Current state.
     * @private
     */
    #updateWireframeLabel(button, enabled) {
        button.textContent = WIREFRAME_LABEL_PREFIX + (enabled ? WIREFRAME_LABEL_ON : WIREFRAME_LABEL_OFF);
    }

    /**
     * Updates the status label text.
     *
     * @param {HTMLElement} label - Status label element.
     * @param {string} text       - New text.
     * @private
     */
    #updateStatus(label, text) {
        label.textContent = text;
    }

    /**
     * Binds UI handlers.
     *
     * @private
     */
    #bindUI() {
        this.#wireframeButton.addEventListener('click', () => {
            this.#toggleWireframe();
        });

        this.#resetButton.addEventListener('click', () => {
            this.#resetView();
        });
    }

    /**
     * Loads OBJ/MTL model asynchronously and adds it to the scene.
     *
     * @private
     */
    #loadModel() {
        (async () => {
            try {
                const result                 = await this.#loader.loadFromUrls({ objUrl: OBJ_URL, mtlUrl: MTL_URL });
                this.#loadedRoot             = result.root;
                this.#loadedMeshes           = result.meshes;
                this.#loadedRoot.position.y += LOADED_MODEL_Y_OFFSET;
                this.#engine.scene.add(this.#loadedRoot);
                this.#updateStatus(this.#statusLabel, STATUS_READY);
            } catch (error) {
                console.error(error);
                this.#updateStatus(this.#statusLabel, STATUS_ERROR);
            }
        })();
    }

    /**
     * Toggles wireframe state and applies it to all loaded meshes.
     *
     * @private
     */
    #toggleWireframe() {
        this.#wireframeEnabled = !this.#wireframeEnabled;
        this.#updateWireframeLabel(this.#wireframeButton, this.#wireframeEnabled);
        this.#loadedMeshes.forEach((mesh) => mesh.material.setWireframeEnabled(this.#wireframeEnabled));
    }

    /**
     * Resets orbit controls to the default configuration.
     *
     * @private
     */
    #resetView() {
        this.#orbitControls.dispose();
        this.#orbitControls = this.#createOrbitControls(this.#engine.camera, this.#canvas);
    }

    /**
     * Per-frame update callback.
     *
     * @param {number} deltaTime - Time since last frame in seconds.
     * @private
     */
    #onFrame(deltaTime) {
        if (this.#loadedRoot) {
            this.#loadedRoot.rotation.y += deltaTime * MODEL_ROTATION_SPEED;
        }

        this.#orbitControls.update();
    }
}

window.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById(CANVAS_ELEMENT_ID);

    if (!(canvas instanceof HTMLCanvasElement)) {
        throw new Error('Canvas element not found.');
    }

    const wireframeButton = document.getElementById(WIREFRAME_TOGGLE_BUTTON_ID);
    const resetButton     = document.getElementById(RESET_VIEW_BUTTON_ID);
    const statusLabel     = document.getElementById(STATUS_LABEL_ID);

    if (!(wireframeButton instanceof HTMLButtonElement)) {
        throw new Error('Wireframe toggle button not found.');
    }

    if (!(resetButton instanceof HTMLButtonElement)) {
        throw new Error('Reset view button not found.');
    }

    if (!(statusLabel instanceof HTMLElement)) {
        throw new Error('Status label not found.');
    }

    const app = new DemoApp(canvas, wireframeButton, resetButton, statusLabel);
    app.start();
});

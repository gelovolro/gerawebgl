import GeraWebGL from './gerawebgl.js';

/**
 * Canvas element id used by the demo.
 *
 * @type {string}
 */
const CANVAS_ELEMENT_ID = 'glcanvas';

/**
 * Button element id, that toggles wireframe mode.
 *
 * @type {string}
 */
const WIREFRAME_TOGGLE_BUTTON_ID = 'wireframeToggleButton';

/**
 * Button element id, that recreates the mesh (dispose test).
 *
 * @type {string}
 */
const RECREATE_MESH_BUTTON_ID = 'recreateMeshButton';

/**
 * Default cube size used by `createBoxMesh`.
 *
 * @type {number}
 */
const CUBE_SIZE = 1.0;

/**
 * Cube rotation speed around the X axis (radians per second).
 *
 * @type {number}
 */
const ROTATION_SPEED_X = 1.0;

/**
 * Cube rotation speed around the Y axis (radians per second).
 *
 * @type {number}
 */
const ROTATION_SPEED_Y = 0.7;

/**
 * Initial value for recreate counter.
 *
 * @type {number}
 */
const RECREATE_COUNT_INITIAL_VALUE = 0;

/**
 * Increment value for recreate counter.
 *
 * @type {number}
 */
const RECREATE_COUNT_INCREMENT = 1;

/**
 * Label used when wireframe is enabled.
 *
 * @type {string}
 */
const WIREFRAME_ON_LABEL = 'Wireframe: ON';

/**
 * Label used when wireframe is disabled.
 *
 * @type {string}
 */
const WIREFRAME_OFF_LABEL = 'Wireframe: OFF';

/**
 * Prefix used in the `recreate mesh` button label.
 *
 * @type {string}
 */
const RECREATE_MESH_BUTTON_LABEL_PREFIX = 'Recreate mesh (dispose test): ';

/**
 * Demo application, that renders a scene.
 */
class DemoApp {
    /**
     * Engine instance used by the demo.
     *
     * @type {Engine}
     * @private
     */
    #engine;

    /**
     * Currently rendered cube mesh.
     *
     * @type {Mesh}
     * @private
     */
    #cube;

    /**
     * Button that toggles wireframe mode.
     *
     * @type {HTMLButtonElement}
     * @private
     */
    #wireframeToggleButton;

    /**
     * Button, that recreates the cube (dispose test).
     *
     * @type {HTMLButtonElement}
     * @private
     */
    #recreateMeshButton;

    /**
     * How many times the mesh has been recreated.
     *
     * @type {number}
     * @private
     */
    #recreateCount = RECREATE_COUNT_INITIAL_VALUE;

    /**
     * @param {HTMLCanvasElement} canvas                - Canvas used for rendering.
     * @param {HTMLButtonElement} wireframeToggleButton - Button, that toggles wireframe mode.
     * @param {HTMLButtonElement} recreateMeshButton    - Button, that recreates the cube and disposes old resources.
     */
    constructor(canvas, wireframeToggleButton, recreateMeshButton) {
        this.#wireframeToggleButton = wireframeToggleButton;
        this.#recreateMeshButton    = recreateMeshButton;
        this.#engine                = GeraWebGL.createEngine(canvas);
        this.#cube                  = this.#createCube();
        this.#engine.scene.add(this.#cube);
        this.#bindUI();
        this.#updateWireframeButtonLabel();
    }

    /**
     * Starts the requestAnimationFrame render loop.
     */
    start() {
        this.#engine.start((deltaTimeSeconds) => {
            this.#cube.rotation.x += deltaTimeSeconds * ROTATION_SPEED_X;
            this.#cube.rotation.y += deltaTimeSeconds * ROTATION_SPEED_Y;
        });
    }

    /**
     * Creates a new cube mesh using `Engine.createBoxMesh`.
     *
     * @returns {Mesh}
     * @private
     */
    #createCube() {
        return this.#engine.createBoxMesh({ size: CUBE_SIZE });
    }

    /**
     * Binds UI events for wireframe toggle and mesh recreation.
     *
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
     * Recreates the cube mesh and disposes the old one.
     * Preserves the current wireframe state.
     *
     * @private
     */
    #recreateCube() {
        const wasWireframeEnabled = this.#cube.material.isWireframeEnabled();
        this.#engine.scene.remove(this.#cube);
        this.#cube.dispose();
        this.#cube = this.#createCube();
        this.#cube.material.setWireframeEnabled(wasWireframeEnabled);
        this.#engine.scene.add(this.#cube);
        this.#recreateCount += RECREATE_COUNT_INCREMENT;
        this.#recreateMeshButton.textContent = `${RECREATE_MESH_BUTTON_LABEL_PREFIX}${this.#recreateCount}`;
        this.#updateWireframeButtonLabel();
    }

    /**
     * Updates the wireframe toggle button label to match the current material state.
     *
     * @private
     */
    #updateWireframeButtonLabel() {
        const isWireframeEnabled = this.#cube.material.isWireframeEnabled();
        this.#wireframeToggleButton.textContent = isWireframeEnabled
            ? WIREFRAME_ON_LABEL
            : WIREFRAME_OFF_LABEL;
    }
}

const canvas                = document.getElementById(CANVAS_ELEMENT_ID);
const wireframeToggleButton = document.getElementById(WIREFRAME_TOGGLE_BUTTON_ID);
const recreateMeshButton    = document.getElementById(RECREATE_MESH_BUTTON_ID);

if (!(canvas instanceof HTMLCanvasElement)) {
    throw new Error(`Canvas element with id "${CANVAS_ELEMENT_ID}" not found.`);
}

if (!(wireframeToggleButton instanceof HTMLButtonElement)) {
    throw new Error(`Button with id "${WIREFRAME_TOGGLE_BUTTON_ID}" not found.`);
}

if (!(recreateMeshButton instanceof HTMLButtonElement)) {
    throw new Error(`Button with id "${RECREATE_MESH_BUTTON_ID}" not found.`);
}

const app = new DemoApp(canvas, wireframeToggleButton, recreateMeshButton);
app.start();

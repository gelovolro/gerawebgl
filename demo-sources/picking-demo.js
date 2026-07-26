import GeraWebGL from './gerawebgl.js';

/**
 * Canvas element id used by the picking demo.
 *
 * @type {string}
 */
const CANVAS_ELEMENT_ID = 'glcanvas';

/**
 * Hovered name value element id.
 *
 * @type {string}
 */
const HOVERED_NAME_VALUE_ID = 'hoveredNameValue';

/**
 * Hovered distance value element id.
 *
 * @type {string}
 */
const HOVERED_DISTANCE_VALUE_ID = 'hoveredDistanceValue';

/**
 * Selected name value element id.
 *
 * @type {string}
 */
const SELECTED_NAME_VALUE_ID = 'selectedNameValue';

/**
 * Selected position value element id.
 *
 * @type {string}
 */
const SELECTED_POSITION_VALUE_ID = 'selectedPositionValue';

/**
 * Selected rotation value element id.
 *
 * @type {string}
 */
const SELECTED_ROTATION_VALUE_ID = 'selectedRotationValue';

/**
 * Selected scale value element id.
 *
 * @type {string}
 */
const SELECTED_SCALE_VALUE_ID = 'selectedScaleValue';

/**
 * Clear selection button element id.
 *
 * @type {string}
 */
const CLEAR_SELECTION_BUTTON_ID = 'clearSelectionButton';

/**
 * Pointer move event name.
 *
 * @type {string}
 */
const POINTER_MOVE_EVENT = 'pointermove';

/**
 * Pointer leave event name.
 *
 * @type {string}
 */
const POINTER_LEAVE_EVENT = 'pointerleave';

/**
 * Pointer click event name.
 *
 * @type {string}
 */
const POINTER_CLICK_EVENT = 'click';

/**
 * Placeholder label, when no item is hovered or selected.
 *
 * @type {string}
 */
const LABEL_NONE = 'None';

/**
 * Placeholder label for unavailable numeric values.
 *
 * @type {string}
 */
const LABEL_UNAVAILABLE = '-';

/**
 * Mesh label prefix.
 *
 * @type {string}
 */
const MESH_LABEL_PREFIX = 'Cube ';

/**
 * Error message for missing canvas element.
 *
 * @type {string}
 */
const ERROR_MISSING_CANVAS = 'Missing canvas element.';

/**
 * Error message for wrong canvas element type.
 *
 * @type {string}
 */
const ERROR_WRONG_CANVAS_TYPE = 'Canvas element must be an HTMLCanvasElement.';

/**
 * Error message for missing hovered name element.
 *
 * @type {string}
 */
const ERROR_MISSING_HOVERED_NAME = 'Missing hovered name element.';

/**
 * Error message for missing hovered distance element.
 *
 * @type {string}
 */
const ERROR_MISSING_HOVERED_DISTANCE = 'Missing hovered distance element.';

/**
 * Error message for missing selected name element.
 *
 * @type {string}
 */
const ERROR_MISSING_SELECTED_NAME = 'Missing selected name element.';

/**
 * Error message for missing selected position element.
 *
 * @type {string}
 */
const ERROR_MISSING_SELECTED_POSITION = 'Missing selected position element.';

/**
 * Error message for missing selected rotation element.
 *
 * @type {string}
 */
const ERROR_MISSING_SELECTED_ROTATION = 'Missing selected rotation element.';

/**
 * Error message for missing selected scale element.
 *
 * @type {string}
 */
const ERROR_MISSING_SELECTED_SCALE = 'Missing selected scale element.';

/**
 * Error message for missing clear selection button.
 *
 * @type {string}
 */
const ERROR_MISSING_CLEAR_BUTTON = 'Missing clear selection button.';

/**
 * Error message for wrong DOM element type.
 *
 * @type {string}
 */
const ERROR_WRONG_ELEMENT_TYPE_PREFIX = 'Wrong element type for id: ';

/**
 * Number of cubes per side.
 *
 * @type {number}
 */
const GRID_SIZE = 5;

/**
 * Cube spacing along the grid.
 *
 * @type {number}
 */
const GRID_SPACING = 1.6;

/**
 * Zero component constant.
 *
 * @type {number}
 */
const ZERO_COMPONENT = 0.0;

/**
 * Cube size.
 *
 * @type {number}
 */
const CUBE_SIZE = 1.0;

/**
 * Grid center divisor.
 *
 * @type {number}
 */
const GRID_CENTER_DIVISOR = 2.0;

/**
 * Grid index offset for centering.
 *
 * @type {number}
 */
const GRID_INDEX_OFFSET = 1;

/**
 * Base camera height.
 *
 * @type {number}
 */
const CAMERA_HEIGHT = 6.0;

/**
 * Orbit controls distance.
 *
 * @type {number}
 */
const ORBIT_DISTANCE = 10.0;

/**
 * Orbit controls min distance.
 *
 * @type {number}
 */
const ORBIT_MIN_DISTANCE = 4.0;

/**
 * Orbit controls max distance.
 *
 * @type {number}
 */
const ORBIT_MAX_DISTANCE = 16.0;

/**
 * Orbit controls rotation speed.
 *
 * @type {number}
 */
const ORBIT_ROTATION_SPEED = 1.0;

/**
 * Orbit controls zoom speed.
 *
 * @type {number}
 */
const ORBIT_ZOOM_SPEED = 1.0;

/**
 * NDC range scale.
 *
 * @type {number}
 */
const NDC_SCALE = 2.0;

/**
 * NDC offset.
 *
 * @type {number}
 */
const NDC_OFFSET = -1.0;

/**
 * NDC Y axis flip multiplier.
 *
 * @type {number}
 */
const NDC_Y_FLIP = -1.0;

/**
 * Initial mouse NDC x value.
 *
 * @type {number}
 */
const MOUSE_NDC_X_INITIAL = 0.0;

/**
 * Initial mouse NDC y value.
 *
 * @type {number}
 */
const MOUSE_NDC_Y_INITIAL = 0.0;

/**
 * Base cube color.
 *
 * @type {Float32Array}
 */
const BASE_COLOR = new Float32Array([0.2, 0.55, 0.9]);

/**
 * Red channel index.
 *
 * @type {number}
 */
const COLOR_INDEX_RED = 0;

/**
 * Green channel index.
 *
 * @type {number}
 */
const COLOR_INDEX_GREEN = 1;

/**
 * Blue channel index.
 *
 * @type {number}
 */
const COLOR_INDEX_BLUE = 2;

/**
 * Color variation scale for the grid.
 *
 * @type {number}
 */
const COLOR_VARIATION_SCALE = 0.45;

/**
 * Hover highlight color.
 *
 * @type {Float32Array}
 */
const HOVER_COLOR = new Float32Array([1.0, 0.8, 0.35]);

/**
 * Selection highlight color.
 *
 * @type {Float32Array}
 */
const SELECTED_COLOR = new Float32Array([1.0, 0.15, 0.15]);

/**
 * Numeric format precision for distances.
 *
 * @type {number}
 */
const DISTANCE_DECIMALS = 3;

/**
 * Numeric format precision for transform values.
 *
 * @type {number}
 */
const TRANSFORM_DECIMALS = 2;

/**
 * Vector formatting prefix.
 *
 * @type {string}
 */
const VECTOR_PREFIX = '[';

/**
 * Vector formatting suffix.
 *
 * @type {string}
 */
const VECTOR_SUFFIX = ']';

/**
 * Vector formatting separator.
 *
 * @type {string}
 */
const VECTOR_SEPARATOR = ', ';

/**
 * Index of the first element.
 *
 * @type {number}
 */
const FIRST_INDEX = 0;

/**
 * Index increment step.
 *
 * @type {number}
 */
const INDEX_STEP = 1;

/**
 * Ownership flag, meshes should not own shared geometry.
 *
 * @type {boolean}
 */
const OWN_GEOMETRY = false;

/**
 * Ownership flag, meshes own their materials.
 *
 * @type {boolean}
 */
const OWN_MATERIAL = true;

/**
 * Raycast options used by the demo.
 *
 * @type {{recursive: boolean, filter: Function | null, sort: boolean}}
 */
const RAYCAST_OPTIONS = {
    recursive : true,
    filter    : null,
    sort      : true
};

/**
 * FPS counter DOM update interval in milliseconds.
 *
 * @type {number}
 */
const FPS_COUNTER_UPDATE_INTERVAL_MS = 250;

/**
 * FPS counter smoothing factor.
 *
 * @type {number}
 */
const FPS_COUNTER_SMOOTHING_FACTOR = 0.15;

/**
 * FPS threshold considered `good`.
 *
 * @type {number}
 */
const FPS_COUNTER_GOOD_FPS_THRESHOLD = 55;

/**
 * FPS threshold considered `ok`.
 *
 * @type {number}
 */
const FPS_COUNTER_OK_FPS_THRESHOLD = 30;

/**
 * Zoom slider element id.
 *
 * @type {string}
 */
const ZOOM_SLIDER_ID = 'zoomSlider';

/**
 * Zoom value label element id.
 *
 * @type {string}
 */
const ZOOM_VALUE_ID = 'zoomValue';

/**
 * Zoom slider minimum distance.
 *
 * @type {number}
 */
const ZOOM_MIN_DISTANCE = ORBIT_MIN_DISTANCE;

/**
 * Zoom slider maximum distance.
 *
 * @type {number}
 */
const ZOOM_MAX_DISTANCE = ORBIT_MAX_DISTANCE;

/**
 * Zoom slider step size.
 *
 * @type {number}
 */
const ZOOM_STEP = 0.1;

/**
 * Decimal precision used to display the zoom values.
 *
 * @type {number}
 */
const ZOOM_DECIMALS = 2;

/**
 * Input event name for range sliders.
 *
 * @type {string}
 */
const ZOOM_INPUT_EVENT = 'input';

/**
 * Error message for missing zoom slider element.
 *
 * @type {string}
 */
const ERROR_MISSING_ZOOM_SLIDER = 'Missing zoom slider element.';

/**
 * Error message for missing zoom value label element.
 *
 * @type {string}
 */
const ERROR_MISSING_ZOOM_VALUE = 'Missing zoom value element.';

/**
 * Application controller for the picking demo.
 */
class DemoApp {

    /**
     * Target canvas element.
     *
     * @type {HTMLCanvasElement}
     * @private
     */
    #canvas;

    /**
     * Rendering engine instance.
     *
     * @type {GeraWebGL.Engine}
     * @private
     */
    #engine;

    /**
     * Raycaster instance used for picking.
     *
     * @type {GeraWebGL.Raycaster}
     * @private
     */
    #raycaster;

    /**
     * Orbit controls instance.
     *
     * @type {GeraWebGL.Controls.OrbitControls | null}
     * @private
     */
    #orbitControls = null;

    /**
     * Mouse coordinates in normalized device coordinates.
     *
     * @type {{x: number, y: number}}
     * @private
     */
    #mouseNdc;

    /**
     * Map of meshes to their UI labels.
     *
     * @type {Map<GeraWebGL.Mesh, string>}
     * @private
     */
    #meshLabels;

    /**
     * Stored original material state for each mesh.
     *
     * @type {Map<GeraWebGL.Mesh, {color: Float32Array, opacity: number}>}
     * @private
     */
    #materialState;

    /**
     * Currently hovered mesh.
     *
     * @type {GeraWebGL.Mesh | null}
     * @private
     */
    #hoveredMesh = null;

    /**
     * Currently selected mesh.
     *
     * @type {GeraWebGL.Mesh | null}
     * @private
     */
    #selectedMesh = null;

    /**
     * Hovered name value label element.
     *
     * @type {HTMLElement}
     * @private
     */
    #hoveredNameValue;

    /**
     * Hovered distance value label element.
     *
     * @type {HTMLElement}
     * @private
     */
    #hoveredDistanceValue;

    /**
     * Selected name value label element.
     *
     * @type {HTMLElement}
     * @private
     */
    #selectedNameValue;

    /**
     * Selected position value label element.
     *
     * @type {HTMLElement}
     * @private
     */
    #selectedPositionValue;

    /**
     * Selected rotation value label element.
     *
     * @type {HTMLElement}
     * @private
     */
    #selectedRotationValue;

    /**
     * Selected scale value label element.
     *
     * @type {HTMLElement}
     * @private
     */
    #selectedScaleValue;

    /**
     * Clear selection button element.
     *
     * @type {HTMLButtonElement}
     * @private
     */
    #clearSelectionButton;

    /**
     * FPS counter instance.
     *
     * @type {GeraWebGL.Debug.FpsCounter}
     * @private
     */
    #fpsCounter;

    /**
     * Zoom slider input element.
     *
     * @type {HTMLInputElement}
     * @private
     */
    #zoomSlider;

    /**
     * Zoom value label element.
     *
     * @type {HTMLElement}
     * @private
     */
    #zoomValue;

    /**
     * Creates the demo app and initializes the scene.
     */
    constructor() {
        this.#canvas        = DemoApp.#getCanvas();
        this.#engine        = GeraWebGL.createEngine(this.#canvas, { fitToWindow: true });
        this.#raycaster     = new GeraWebGL.Raycaster();
        this.#mouseNdc      = { x: MOUSE_NDC_X_INITIAL, y: MOUSE_NDC_Y_INITIAL };
        this.#meshLabels    = new Map();
        this.#materialState = new Map();
        this.#setupCamera();
        this.#setupScene();
        this.#bindUI();
        this.#bindEvents();
        this.#setupZoomSlider();

        this.#fpsCounter = new GeraWebGL.Debug.FpsCounter({
            updateIntervalMs : FPS_COUNTER_UPDATE_INTERVAL_MS,
            smoothingFactor  : FPS_COUNTER_SMOOTHING_FACTOR,
            goodFpsThreshold : FPS_COUNTER_GOOD_FPS_THRESHOLD,
            okFpsThreshold   : FPS_COUNTER_OK_FPS_THRESHOLD
        });

        document.body.appendChild(this.#fpsCounter.domElement);
    }

    /**
     * Starts the render loop.
     */
    start() {
        this.#engine.start((deltaSeconds) => this.#onFrame(deltaSeconds));
    }

    /**
     * Per-frame update callback.
     *
     * @param {number} deltaSeconds - Delta time since last frame in seconds.
     * @private
     */
    #onFrame(deltaSeconds) {
        this.#fpsCounter.update(deltaSeconds);

        if (this.#orbitControls) {
            this.#orbitControls.update(deltaSeconds);
        }

        this.#updateZoomUI();
    }

    /**
     * Sets up camera and orbit controls.
     *
     * @private
     */
    #setupCamera() {
        const camera = this.#engine.camera;
        camera.position.set(ZERO_COMPONENT, CAMERA_HEIGHT, ORBIT_DISTANCE);

        this.#orbitControls = new GeraWebGL.Controls.OrbitControls(camera, this.#canvas, {
            distance      : ORBIT_DISTANCE,
            minDistance   : ORBIT_MIN_DISTANCE,
            maxDistance   : ORBIT_MAX_DISTANCE,
            rotationSpeed : ORBIT_ROTATION_SPEED,
            zoomSpeed     : ORBIT_ZOOM_SPEED
        });

        this.#orbitControls.update();
    }

    /**
     * Builds a grid of cubes with per-cell color variation.
     *
     * @private
     */
    #setupScene() {
        const webglContext    = this.#engine.webglRenderingContext;
        const geometry        = new GeraWebGL.Geometries.BoxGeometry(webglContext, { size: CUBE_SIZE });
        const gridCenterIndex = (GRID_SIZE - GRID_INDEX_OFFSET) / GRID_CENTER_DIVISOR;
        let meshIndex         = FIRST_INDEX;

        for (let row = FIRST_INDEX; row < GRID_SIZE; row += INDEX_STEP) {
            for (let column = FIRST_INDEX; column < GRID_SIZE; column += INDEX_STEP) {
                const material = new GeraWebGL.Materials.SolidColorMaterial(webglContext, {
                    color: DemoApp.#createGridColor(column, row, GRID_SIZE - GRID_INDEX_OFFSET)
                });

                const mesh = new GeraWebGL.Mesh(geometry, material, {
                    ownsGeometry : OWN_GEOMETRY,
                    ownsMaterial : OWN_MATERIAL
                });

                mesh.position.set(
                    (column - gridCenterIndex) * GRID_SPACING,
                    ZERO_COMPONENT,
                    (row - gridCenterIndex) * GRID_SPACING
                );

                this.#engine.scene.add(mesh);
                this.#meshLabels.set(mesh, `${MESH_LABEL_PREFIX}${meshIndex}`);
                this.#materialState.set(mesh, {
                    color   : new Float32Array(material.color),
                    opacity : material.opacity
                });

                meshIndex += INDEX_STEP;
            }
        }
    }

    /**
     * Binds and initializes the UI panel elements.
     *
     * @private
     */
    #bindUI() {
        this.#hoveredNameValue      = DemoApp.#getRequiredElementById(HOVERED_NAME_VALUE_ID, HTMLElement, ERROR_MISSING_HOVERED_NAME);
        this.#hoveredDistanceValue  = DemoApp.#getRequiredElementById(HOVERED_DISTANCE_VALUE_ID, HTMLElement, ERROR_MISSING_HOVERED_DISTANCE);
        this.#selectedNameValue     = DemoApp.#getRequiredElementById(SELECTED_NAME_VALUE_ID, HTMLElement, ERROR_MISSING_SELECTED_NAME);
        this.#selectedPositionValue = DemoApp.#getRequiredElementById(SELECTED_POSITION_VALUE_ID, HTMLElement, ERROR_MISSING_SELECTED_POSITION);
        this.#selectedRotationValue = DemoApp.#getRequiredElementById(SELECTED_ROTATION_VALUE_ID, HTMLElement, ERROR_MISSING_SELECTED_ROTATION);
        this.#selectedScaleValue    = DemoApp.#getRequiredElementById(SELECTED_SCALE_VALUE_ID, HTMLElement, ERROR_MISSING_SELECTED_SCALE);
        this.#clearSelectionButton  = DemoApp.#getRequiredElementById(CLEAR_SELECTION_BUTTON_ID, HTMLButtonElement, ERROR_MISSING_CLEAR_BUTTON);
        this.#zoomSlider            = DemoApp.#getRequiredElementById(ZOOM_SLIDER_ID, HTMLInputElement, ERROR_MISSING_ZOOM_SLIDER);
        this.#zoomValue             = DemoApp.#getRequiredElementById(ZOOM_VALUE_ID, HTMLElement, ERROR_MISSING_ZOOM_VALUE);
        this.#resetHoverUI();
        this.#resetSelectionUI();
    }

    /**
     * Attaches pointer and button event handlers.
     *
     * @private
     */
    #bindEvents() {
        this.#canvas.addEventListener(POINTER_MOVE_EVENT, (event) => this.#handlePointerMove(event));
        this.#canvas.addEventListener(POINTER_LEAVE_EVENT, () => this.#setHoveredMesh(null, null));
        this.#canvas.addEventListener(POINTER_CLICK_EVENT, (event) => this.#handlePointerClick(event));
        this.#clearSelectionButton.addEventListener(POINTER_CLICK_EVENT, () => this.#setSelectedMesh(null));
        this.#zoomSlider.addEventListener(ZOOM_INPUT_EVENT, () => this.#handleZoomSliderInput());
    }

    /**
     * Handles pointer movement, updates hover highlight and hover UI.
     *
     * @param {PointerEvent} event - Pointer event.
     * @private
     */
    #handlePointerMove(event) {
        DemoApp.#updateMouseNdcFromEvent(event, this.#canvas, this.#mouseNdc);

        const intersections = this.#raycaster.raycast(
            this.#engine.scene,
            this.#engine.camera,
            this.#mouseNdc,
            RAYCAST_OPTIONS
        );

        const hit = intersections.length > FIRST_INDEX ? intersections[FIRST_INDEX] : null;
        this.#setHoveredMesh(hit ? hit.object : null, hit);
    }

    /**
     * Handles pointer click, updates selection highlight and selection UI.
     *
     * @param {PointerEvent} event - Pointer event.
     * @private
     */
    #handlePointerClick(event) {
        DemoApp.#updateMouseNdcFromEvent(event, this.#canvas, this.#mouseNdc);

        const intersections = this.#raycaster.raycast(
            this.#engine.scene,
            this.#engine.camera,
            this.#mouseNdc,
            RAYCAST_OPTIONS
        );

        const hit = intersections.length > FIRST_INDEX ? intersections[FIRST_INDEX] : null;

        if (hit) {
            this.#setSelectedMesh(hit.object);
        }
    }

    /**
     * Applies hover state to the given mesh and updates hover UI.
     *
     * @param {GeraWebGL.Mesh | null} mesh - Hovered mesh.
     * @param {Object | null} hit          - Intersection data.
     * @private
     */
    #setHoveredMesh(mesh, hit) {
        if (mesh === this.#hoveredMesh) {
            this.#updateHoverUI(hit);
            return;
        }

        if (this.#hoveredMesh && this.#hoveredMesh !== this.#selectedMesh) {
            this.#restoreMaterial(this.#hoveredMesh);
        }

        this.#hoveredMesh = mesh;

        if (this.#hoveredMesh && this.#hoveredMesh !== this.#selectedMesh) {
            this.#applyHighlight(this.#hoveredMesh, HOVER_COLOR);
        }

        this.#updateHoverUI(hit);
    }

    /**
     * Applies selection state to the given mesh and updates selection UI.
     *
     * @param {GeraWebGL.Mesh | null} mesh - Selected mesh.
     * @private
     */
    #setSelectedMesh(mesh) {
        if (mesh === this.#selectedMesh) {
            return;
        }

        const previousSelected = this.#selectedMesh;
        this.#selectedMesh     = mesh;

        if (previousSelected) {
            if (previousSelected === this.#hoveredMesh) {
                this.#applyHighlight(previousSelected, HOVER_COLOR);
            } else {
                this.#restoreMaterial(previousSelected);
            }
        }

        if (this.#selectedMesh) {
            this.#applyHighlight(this.#selectedMesh, SELECTED_COLOR);
        }

        this.#updateSelectionUI();
    }

    /**
     * Applies a highlight color to the given mesh.
     *
     * @param {GeraWebGL.Mesh} mesh - Target mesh.
     * @param {Float32Array} color  - Highlight color.
     * @private
     */
    #applyHighlight(mesh, color) {
        mesh.material.setColor(color);
    }

    /**
     * Restores the mesh material state recorded during scene setup.
     *
     * @param {GeraWebGL.Mesh} mesh - Target mesh.
     * @private
     */
    #restoreMaterial(mesh) {
        const state = this.#materialState.get(mesh);

        if (!state) {
            return;
        }

        mesh.material.setColor(state.color);
        mesh.material.setOpacity(state.opacity);
    }

    /**
     * Updates hover UI based on the given raycast hit.
     *
     * @param {Object | null} hit - Intersection data.
     * @private
     */
    #updateHoverUI(hit) {
        if (!this.#hoveredMesh || !hit) {
            this.#resetHoverUI();
            return;
        }

        const label = this.#meshLabels.get(this.#hoveredMesh) || LABEL_NONE;
        this.#hoveredNameValue.textContent     = label;
        this.#hoveredDistanceValue.textContent = DemoApp.#formatNumber(hit.distance, DISTANCE_DECIMALS);
    }

    /**
     * Resets hover UI to the `no hover` state.
     *
     * @private
     */
    #resetHoverUI() {
        this.#hoveredNameValue.textContent     = LABEL_NONE;
        this.#hoveredDistanceValue.textContent = LABEL_UNAVAILABLE;
    }

    /**
     * Updates selection UI based on the current selected mesh.
     *
     * @private
     */
    #updateSelectionUI() {
        if (!this.#selectedMesh) {
            this.#resetSelectionUI();
            return;
        }

        const label = this.#meshLabels.get(this.#selectedMesh) || LABEL_NONE;
        this.#selectedNameValue.textContent     = label;
        this.#selectedPositionValue.textContent = DemoApp.#formatVector(this.#selectedMesh.position , TRANSFORM_DECIMALS);
        this.#selectedRotationValue.textContent = DemoApp.#formatVector(this.#selectedMesh.rotation , TRANSFORM_DECIMALS);
        this.#selectedScaleValue.textContent    = DemoApp.#formatVector(this.#selectedMesh.scale    , TRANSFORM_DECIMALS);
        this.#clearSelectionButton.disabled     = false;
    }

    /**
     * Resets selection UI to the `no selection` state.
     *
     * @private
     */
    #resetSelectionUI() {
        this.#selectedNameValue.textContent     = LABEL_NONE;
        this.#selectedPositionValue.textContent = LABEL_UNAVAILABLE;
        this.#selectedRotationValue.textContent = LABEL_UNAVAILABLE;
        this.#selectedScaleValue.textContent    = LABEL_UNAVAILABLE;
        this.#clearSelectionButton.disabled     = true;
    }

    /**
     * Returns the canvas element used by the demo.
     *
     * @returns {HTMLCanvasElement} - Canvas element instance.
     * @throws {Error}              - Thrown, when the canvas element is missing.
     * @throws {TypeError}          - Thrown, when the canvas element has an unexpected type.
     * @private
     */
    static #getCanvas() {
        const canvas = document.getElementById(CANVAS_ELEMENT_ID);

        if (!canvas) {
            throw new Error(ERROR_MISSING_CANVAS);
        }

        if (!(canvas instanceof HTMLCanvasElement)) {
            throw new TypeError(ERROR_WRONG_CANVAS_TYPE);
        }

        return canvas;
    }

    /**
     * Returns required DOM element by id and validates its constructor.
     *
     * @template {HTMLElement} T
     * @param {string} id                      - DOM element id to look up via `document.getElementById`.
     * @param {new (...args: any[]) => T} ctor - Expected constructor used to validate the found element.
     * @param {string} missingMessage          - Error message, when element is missing.
     * @returns {T}                            - The found DOM element cast to the expected type `T`.
     * @throws {Error}                         - Thrown, when the element is missing.
     * @throws {TypeError}                     - Thrown, when the element has an unexpected type.
     * @private
     */
    static #getRequiredElementById(id, ctor, missingMessage) {
        const element = document.getElementById(id);

        if (!element) {
            throw new Error(missingMessage);
        }

        if (!(element instanceof ctor)) {
            throw new TypeError(ERROR_WRONG_ELEMENT_TYPE_PREFIX + id);
        }

        return element;
    }

    /**
     * Formats a number with fixed decimals.
     *
     * @param {number} value    - Numeric value to format.
     * @param {number} decimals - Decimal places.
     * @returns {string}        - Formatted numeric string or the unavailable placeholder.
     * @private
     */
    static #formatNumber(value, decimals) {
        if (typeof value !== 'number' || !Number.isFinite(value)) {
            return LABEL_UNAVAILABLE;
        }

        return value.toFixed(decimals);
    }

    /**
     * Formats a Vector3-like object into a [x, y, z] string.
     *
     * @param {{x: number, y: number, z: number}} vector - Vector to format.
     * @param {number} decimals                          - Decimal places.
     * @returns {string}                                 - Formatted vector string or the unavailable placeholder.
     * @private
     */
    static #formatVector(vector, decimals) {
        if (!vector) {
            return LABEL_UNAVAILABLE;
        }

        const formattedX = DemoApp.#formatNumber(vector.x, decimals);
        const formattedY = DemoApp.#formatNumber(vector.y, decimals);
        const formattedZ = DemoApp.#formatNumber(vector.z, decimals);
        return `${VECTOR_PREFIX}${formattedX}${VECTOR_SEPARATOR}${formattedY}${VECTOR_SEPARATOR}${formattedZ}${VECTOR_SUFFIX}`;
    }

    /**
     * Updates the normalized device coordinates from a pointer event.
     *
     * @param {PointerEvent} event                 - Pointer event.
     * @param {HTMLCanvasElement} canvas           - Target canvas.
     * @param {{x: number, y: number}} outMouseNdc - Output object to mutate.
     * @private
     */
    static #updateMouseNdcFromEvent(event, canvas, outMouseNdc) {
        const rect      = canvas.getBoundingClientRect();
        const relativeX = (event.clientX - rect.left) / rect.width;
        const relativeY = (event.clientY - rect.top) / rect.height;
        outMouseNdc.x   = (relativeX * NDC_SCALE) + NDC_OFFSET;
        outMouseNdc.y   = ((relativeY * NDC_SCALE) + NDC_OFFSET) * NDC_Y_FLIP;
    }

    /**
     * Creates a color variation for a grid cell.
     *
     * @param {number} columnIndex - Column index.
     * @param {number} rowIndex    - Row index.
     * @param {number} maxIndex    - Max index used for normalization.
     * @returns {Float32Array}     - RGB color as a Float32Array.
     * @private
     */
    static #createGridColor(columnIndex, rowIndex, maxIndex) {
        const normalizedX = columnIndex / maxIndex;
        const normalizedZ = rowIndex / maxIndex;

        const red   = BASE_COLOR[COLOR_INDEX_RED] + (normalizedX * COLOR_VARIATION_SCALE);
        const green = BASE_COLOR[COLOR_INDEX_GREEN] + (normalizedZ * COLOR_VARIATION_SCALE);
        const blue  = BASE_COLOR[COLOR_INDEX_BLUE] - ((normalizedX + normalizedZ) * (COLOR_VARIATION_SCALE / GRID_CENTER_DIVISOR));
        return new Float32Array([red, green, blue]);
    }

    /**
     * Configures the zoom slider to control the orbit distance.
     *
     * @returns {void}
     * @private
     */
    #setupZoomSlider() {
        if (!this.#orbitControls) {
            return;
        }

        this.#zoomSlider.min  = String(ZOOM_MIN_DISTANCE);
        this.#zoomSlider.max  = String(ZOOM_MAX_DISTANCE);
        this.#zoomSlider.step = String(ZOOM_STEP);

        const distance         = this.#orbitControls.distance;
        const zoomUiValue      = ZOOM_MIN_DISTANCE + ZOOM_MAX_DISTANCE - distance;
        this.#zoomSlider.value = String(zoomUiValue);
        this.#updateZoomUI();
    }

    /**
     * Handles the zoom slider changes and updates the orbit distance.
     *
     * @returns {void}
     * @private
     */
    #handleZoomSliderInput() {
        if (!this.#orbitControls) {
            return;
        }

        const zoomUiValue = Number.parseFloat(this.#zoomSlider.value);

        if (!Number.isFinite(zoomUiValue)) {
            return;
        }

        const distance = ZOOM_MIN_DISTANCE + ZOOM_MAX_DISTANCE - zoomUiValue;
        this.#orbitControls.setDistance(distance);
        this.#orbitControls.update();
        this.#updateZoomUI();
    }

    /**
     * Updates the zoom UI label from current orbit distance.
     *
     * @returns {void}
     * @private
     */
    #updateZoomUI() {
        if (!this.#orbitControls) {
            this.#zoomValue.textContent = LABEL_UNAVAILABLE;
            return;
        }

        const distance              = this.#orbitControls.distance;
        const zoomUiValue           = ZOOM_MIN_DISTANCE + ZOOM_MAX_DISTANCE - distance;
        this.#zoomSlider.value      = String(zoomUiValue);
        this.#zoomValue.textContent = DemoApp.#formatNumber(zoomUiValue, ZOOM_DECIMALS);
    }
}

const app = new DemoApp();
app.start();

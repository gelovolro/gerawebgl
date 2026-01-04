import GeraWebGL from './gerawebgl.js';

/**
 * Canvas element id used by the demo.
 *
 * @type {string}
 */
const CANVAS_ELEMENT_ID = 'glcanvas';

/**
 * Speed slider element id.
 *
 * @type {string}
 */
const SPEED_SLIDER_ID = 'speedSlider';

/**
 * Speed value label element id.
 *
 * @type {string}
 */
const SPEED_VALUE_ID = 'speedValue';

/**
 * T slider element id.
 *
 * @type {string}
 */
const T_SLIDER_ID = 'tSlider';

/**
 * T value label element id.
 *
 * @type {string}
 */
const T_VALUE_ID = 'tValue';

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
 * Show path checkbox element id.
 *
 * @type {string}
 */
const SHOW_PATH_CHECKBOX_ID = 'showPathCheckbox';

/**
 * Show debug line checkbox element id.
 *
 * @type {string}
 */
const SHOW_DEBUG_CHECKBOX_ID = 'showDebugCheckbox';

/**
 * Input event name.
 *
 * @type {string}
 */
const INPUT_EVENT_NAME = 'input';

/**
 * Change event name.
 *
 * @type {string}
 */
const CHANGE_EVENT_NAME = 'change';

/**
 * Default clear color.
 *
 * @type {Float32Array}
 */
const CLEAR_COLOR = new Float32Array([0.03, 0.04, 0.07]);

/**
 * Clear color red index.
 *
 * @type {number}
 */
const CLEAR_COLOR_RED_INDEX = 0;

/**
 * Clear color green index.
 *
 * @type {number}
 */
const CLEAR_COLOR_GREEN_INDEX = 1;

/**
 * Clear color blue index.
 *
 * @type {number}
 */
const CLEAR_COLOR_BLUE_INDEX = 2;

/**
 * Clear color alpha component.
 *
 * @type {number}
 */
const CLEAR_COLOR_ALPHA = 1.0;

/**
 * Camera distance for orbit controls.
 *
 * @type {number}
 */
const CAMERA_DISTANCE = 7.0;

/**
 * Orbit controls min distance.
 *
 * @type {number}
 */
const CAMERA_MIN_DISTANCE = 3.0;

/**
 * Orbit controls max distance.
 *
 * @type {number}
 */
const CAMERA_MAX_DISTANCE = 12.0;

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
 * Default movement speed.
 *
 * @type {number}
 */
const DEFAULT_SPEED = 0.2;

/**
 * Minimum speed slider value.
 *
 * @type {number}
 */
const MIN_SPEED = 0.0;

/**
 * Maximum speed slider value.
 *
 * @type {number}
 */
const MAX_SPEED = 1.0;

/**
 * Speed slider step value.
 *
 * @type {number}
 */
const SPEED_STEP = 0.01;

/**
 * T slider minimum.
 *
 * @type {number}
 */
const MIN_T = 0.0;

/**
 * T slider maximum.
 *
 * @type {number}
 */
const MAX_T = 1.0;

/**
 * T slider step value.
 *
 * @type {number}
 */
const T_STEP = 0.001;

/**
 * Zoom slider step value.
 *
 * @type {number}
 */
const ZOOM_STEP = 0.1;

/**
 * Number of points in the point cloud.
 *
 * @type {number}
 */
const POINT_COUNT = 80;

/**
 * Point cloud spread along X/Z axes.
 *
 * @type {number}
 */
const POINT_SPREAD = 5.0;

/**
 * Point cloud spread along Y axis.
 *
 * @type {number}
 */
const POINT_HEIGHT = 2.0;

/**
 * Random offset used to center random values.
 *
 * @type {number}
 */
const RANDOM_CENTER_OFFSET = 0.5;

/**
 * Default point size in pixels.
 *
 * @type {number}
 */
const DEFAULT_POINT_SIZE = 8.0;

/**
 * Point color.
 *
 * @type {Float32Array}
 */
const POINT_COLOR = new Float32Array([0.86, 0.92, 1.0]);

/**
 * Path sample count for curve to polyline conversion.
 *
 * @type {number}
 */
const PATH_SAMPLE_SEGMENTS = 120;

/**
 * Thin path color.
 *
 * @type {Float32Array}
 */
const PATH_COLOR = new Float32Array([0.45, 0.85, 1.0]);

/**
 * Debug line color.
 *
 * @type {Float32Array}
 */
const DEBUG_LINE_COLOR = new Float32Array([1.0, 0.45, 0.35]);

/**
 * Debug line width.
 *
 * @type {number}
 */
const DEBUG_LINE_WIDTH = 0.12;

/**
 * Debug line radial segment count.
 *
 * @type {number}
 */
const DEBUG_LINE_RADIAL_SEGMENTS = 10;

/**
 * Moving object size.
 *
 * @type {number}
 */
const MOVING_OBJECT_SIZE = 0.25;

/**
 * Moving object color.
 *
 * @type {Float32Array}
 */
const MOVING_OBJECT_COLOR = new Float32Array([1.0, 0.95, 0.6]);

/**
 * Path control point coordinates.
 *
 * @type {number[][]}
 */
const PATH_CONTROL_COORDS = [
    [-2.6 , 0.0  , -1.2 ],
    [-1.2 , 0.8  , 2.4  ],
    [1.6  , 0.4  , 2.0  ],
    [2.4  , -0.6 , -0.4 ],
    [0.0  , -0.4 , -2.6 ],
    [-2.2 , 0.6  , -2.0 ]
];

/**
 * Coordinate index for X component.
 *
 * @type {number}
 */
const COORD_X_INDEX = 0;

/**
 * Coordinate index for Y component.
 *
 * @type {number}
 */
const COORD_Y_INDEX = 1;

/**
 * Coordinate index for Z component.
 *
 * @type {number}
 */
const COORD_Z_INDEX = 2;

/**
 * Cap type for tube geometry.
 *
 * @type {string}
 */
const CAP_TYPE_NONE = 'none';

/**
 * Fraction digits for UI labels.
 *
 * @type {number}
 */
const UI_FRACTION_DIGITS = 2;

/**
 * Fraction digits for zoom label.
 *
 * @type {number}
 */
const ZOOM_FRACTION_DIGITS = 1;

/**
 * Indicates, that UI checkbox is checked.
 *
 * @type {boolean}
 */
const DEFAULT_SHOW_PATH = true;

/**
 * Indicates, that debug line is shown.
 *
 * @type {boolean}
 */
const DEFAULT_SHOW_DEBUG = true;

/**
 * How often FPS counter UI is refreshed (ms).
 *
 * @type {number}
 */
const FPS_COUNTER_UPDATE_INTERVAL_MS = 250;

/**
 * Exponential smoothing factor used by the FPS counter.
 * Higher values react faster, but fluctuate more.
 *
 * @type {number}
 */
const FPS_COUNTER_SMOOTHING_FACTOR = 0.15;

/**
 * FPS value considered `good` (styling threshold).
 *
 * @type {number}
 */
const FPS_COUNTER_GOOD_FPS_THRESHOLD = 55;

/**
 * FPS value considered `ok` (styling threshold).
 *
 * @type {number}
 */
const FPS_COUNTER_OK_FPS_THRESHOLD = 30;

/**
 * Error message for missing canvas.
 *
 * @type {string}
 */
const ERROR_MISSING_CANVAS = 'Canvas element not found.';

/**
 * Error message for missing speed slider.
 *
 * @type {string}
 */
const ERROR_MISSING_SPEED_SLIDER = 'Speed slider element not found.';

/**
 * Error message for missing speed label.
 *
 * @type {string}
 */
const ERROR_MISSING_SPEED_VALUE = 'Speed value element not found.';

/**
 * Error message for missing t slider.
 *
 * @type {string}
 */
const ERROR_MISSING_T_SLIDER = 'T slider element not found.';

/**
 * Error message for missing t label.
 *
 * @type {string}
 */
const ERROR_MISSING_T_VALUE = 'T value element not found.';

/**
 * Error message for missing zoom slider.
 *
 * @type {string}
 */
const ERROR_MISSING_ZOOM_SLIDER = 'Zoom slider element not found.';

/**
 * Error message for missing zoom label.
 *
 * @type {string}
 */
const ERROR_MISSING_ZOOM_VALUE = 'Zoom value element not found.';

/**
 * Error message for missing show path checkbox.
 *
 * @type {string}
 */
const ERROR_MISSING_SHOW_PATH = 'Show path checkbox not found.';

/**
 * Error message for missing show debug checkbox.
 *
 * @type {string}
 */
const ERROR_MISSING_SHOW_DEBUG = 'Show debug checkbox not found.';

/**
 * Demo application, that renders a path animation with the points.
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
     * Speed slider element.
     *
     * @type {HTMLInputElement}
     * @private
     */
    #speedSlider;

    /**
     * Speed value label element.
     *
     * @type {HTMLElement}
     * @private
     */
    #speedValue;

    /**
     * T slider element.
     *
     * @type {HTMLInputElement}
     * @private
     */
    #tSlider;

    /**
     * T value label element.
     *
     * @type {HTMLElement}
     * @private
     */
    #tValue;

    /**
     * Zoom slider element.
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
     * Show path checkbox element.
     *
     * @type {HTMLInputElement}
     * @private
     */
    #showPathCheckbox;

    /**
     * Show debug checkbox element.
     *
     * @type {HTMLInputElement}
     * @private
     */
    #showDebugCheckbox;

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
     * FPS counter overlay displayed by the demo.
     *
     * @type {GeraWebGL.Debug.FpsCounter}
     * @private
     */
    #fpsCounter;

    /**
     * Thin path line object.
     *
     * @type {GeraWebGL.Line}
     * @private
     */
    #pathLine;

    /**
     * Debug thick line object.
     *
     * @type {GeraWebGL.Line}
     * @private
     */
    #debugLine;

    /**
     * Path instance used for animation.
     *
     * @type {GeraWebGL.Math.Path3D}
     * @private
     */
    #path;

    /**
     * Moving mesh object.
     *
     * @type {GeraWebGL.Mesh}
     * @private
     */
    #mover;

    /**
     * Current normalized t parameter.
     *
     * @type {number}
     * @private
     */
    #currentT = MIN_T;

    /**
     * Current speed value.
     *
     * @type {number}
     * @private
     */
    #speedValueCurrent = DEFAULT_SPEED;

    /**
     * Temporary vector for path sampling.
     *
     * @type {GeraWebGL.Math.Vector3}
     * @private
     */
    #tempPosition = new GeraWebGL.Math.Vector3();

    constructor() {
        this.#canvas            = DemoApp.#getRequiredElementById(CANVAS_ELEMENT_ID, HTMLCanvasElement, ERROR_MISSING_CANVAS);
        this.#speedSlider       = DemoApp.#getRequiredElementById(SPEED_SLIDER_ID, HTMLInputElement, ERROR_MISSING_SPEED_SLIDER);
        this.#speedValue        = DemoApp.#getRequiredElementById(SPEED_VALUE_ID, HTMLElement, ERROR_MISSING_SPEED_VALUE);
        this.#tSlider           = DemoApp.#getRequiredElementById(T_SLIDER_ID, HTMLInputElement, ERROR_MISSING_T_SLIDER);
        this.#tValue            = DemoApp.#getRequiredElementById(T_VALUE_ID, HTMLElement, ERROR_MISSING_T_VALUE);
        this.#zoomSlider        = DemoApp.#getRequiredElementById(ZOOM_SLIDER_ID, HTMLInputElement, ERROR_MISSING_ZOOM_SLIDER);
        this.#zoomValue         = DemoApp.#getRequiredElementById(ZOOM_VALUE_ID, HTMLElement, ERROR_MISSING_ZOOM_VALUE);
        this.#showPathCheckbox  = DemoApp.#getRequiredElementById(SHOW_PATH_CHECKBOX_ID, HTMLInputElement, ERROR_MISSING_SHOW_PATH);
        this.#showDebugCheckbox = DemoApp.#getRequiredElementById(SHOW_DEBUG_CHECKBOX_ID, HTMLInputElement, ERROR_MISSING_SHOW_DEBUG);

        this.#engine        = GeraWebGL.createEngine(this.#canvas, { initialCameraZ: CAMERA_DISTANCE, fitToWindow: true });
        this.#orbitControls = new GeraWebGL.Controls.OrbitControls(this.#engine.camera, this.#canvas, {
            distance      : CAMERA_DISTANCE,
            minDistance   : CAMERA_MIN_DISTANCE,
            maxDistance   : CAMERA_MAX_DISTANCE,
            rotationSpeed : ORBIT_ROTATION_SPEED,
            zoomSpeed     : ORBIT_ZOOM_SPEED
        });

        this.#fpsCounter = new GeraWebGL.Debug.FpsCounter({
            updateIntervalMs : FPS_COUNTER_UPDATE_INTERVAL_MS,
            smoothingFactor  : FPS_COUNTER_SMOOTHING_FACTOR,
            goodFpsThreshold : FPS_COUNTER_GOOD_FPS_THRESHOLD,
            okFpsThreshold   : FPS_COUNTER_OK_FPS_THRESHOLD
        });

        document.body.appendChild(this.#fpsCounter.domElement);
        this.#configureWebglState();
        this.#configureScene();
        this.#configureUiDefaults();
        this.#bindUiEvents();
    }

    /**
     * Starts the animation loop.
     */
    start() {
        this.#engine.start((deltaTimeSeconds) => {
            this.#onFrame(deltaTimeSeconds);
        });
    }

    /**
     * Configures the WebGL clear state.
     *
     * @private
     */
    #configureWebglState() {
        const webglContext = this.#engine.webglRenderingContext;
        webglContext.clearColor(
            CLEAR_COLOR[CLEAR_COLOR_RED_INDEX],
            CLEAR_COLOR[CLEAR_COLOR_GREEN_INDEX],
            CLEAR_COLOR[CLEAR_COLOR_BLUE_INDEX],
            CLEAR_COLOR_ALPHA
        );
    }

    /**
     * Builds the scene content.
     *
     * @private
     */
    #configureScene() {
        const webglContext   = this.#engine.webglRenderingContext;
        const pointPositions = DemoApp.#createPointCloud(POINT_COUNT, POINT_SPREAD, POINT_HEIGHT);
        const pointsGeometry = new GeraWebGL.Geometries.PointsGeometry(webglContext, { positions: pointPositions });
        const pointsMaterial = new GeraWebGL.Materials.PointsMaterial(webglContext, {
            pointSize : DEFAULT_POINT_SIZE,
            color     : POINT_COLOR
        });

        const points = new GeraWebGL.Points(pointsGeometry, pointsMaterial);
        this.#engine.scene.add(points);

        const controlPoints = DemoApp.#createControlPoints();
        const curve         = new GeraWebGL.Math.CatmullRomCurve3(controlPoints, { closed: true });
        const pathPoints    = curve.getPoints(PATH_SAMPLE_SEGMENTS);
        this.#path          = new GeraWebGL.Math.Path3D(pathPoints, { loop: true });

        const pathMaterial = new GeraWebGL.Materials.SolidColorMaterial(webglContext, { color: PATH_COLOR });
        const pathGeometry = new GeraWebGL.Geometries.PolylineGeometry(webglContext, {
            positions : pathPoints,
            loop      : true
        });

        this.#pathLine = new GeraWebGL.Line(pathGeometry, pathMaterial);
        this.#engine.scene.add(this.#pathLine);

        const debugMaterial = new GeraWebGL.Materials.SolidColorMaterial(webglContext, { color: DEBUG_LINE_COLOR });
        const debugGeometry = new GeraWebGL.Geometries.TubeLineGeometry(webglContext, {
            positions      : pathPoints,
            width          : DEBUG_LINE_WIDTH,
            radialSegments : DEBUG_LINE_RADIAL_SEGMENTS,
            closed         : true,
            capType        : CAP_TYPE_NONE
        });

        this.#debugLine = new GeraWebGL.Line(debugGeometry, debugMaterial);
        this.#engine.scene.add(this.#debugLine);

        const moverMaterial = new GeraWebGL.Materials.SolidColorMaterial(webglContext, { color: MOVING_OBJECT_COLOR });
        const moverGeometry = new GeraWebGL.Geometries.BoxGeometry(webglContext, { size: MOVING_OBJECT_SIZE });
        this.#mover         = new GeraWebGL.Mesh(moverGeometry, moverMaterial);
        this.#engine.scene.add(this.#mover);
        this.#orbitControls.update();
    }

    /**
     * Initializes the UI control defaults.
     *
     * @private
     */
    #configureUiDefaults() {
        this.#speedSlider.min   = String(MIN_SPEED);
        this.#speedSlider.max   = String(MAX_SPEED);
        this.#speedSlider.step  = String(SPEED_STEP);
        this.#speedSlider.value = String(DEFAULT_SPEED);
        DemoApp.#updateLabel(this.#speedValue, DEFAULT_SPEED, UI_FRACTION_DIGITS);

        this.#tSlider.min   = String(MIN_T);
        this.#tSlider.max   = String(MAX_T);
        this.#tSlider.step  = String(T_STEP);
        this.#tSlider.value = String(MIN_T);
        DemoApp.#updateLabel(this.#tValue, MIN_T, UI_FRACTION_DIGITS);

        this.#zoomSlider.min  = String(CAMERA_MIN_DISTANCE);
        this.#zoomSlider.max  = String(CAMERA_MAX_DISTANCE);
        this.#zoomSlider.step = String(ZOOM_STEP);
        this.#syncZoomUi();

        this.#showPathCheckbox.checked  = DEFAULT_SHOW_PATH;
        this.#showDebugCheckbox.checked = DEFAULT_SHOW_DEBUG;
        this.#updatePathVisibility();
    }

    /**
     * Binds UI events.
     *
     * @private
     */
    #bindUiEvents() {
        this.#showPathCheckbox.addEventListener(CHANGE_EVENT_NAME, () => this.#updatePathVisibility());
        this.#showDebugCheckbox.addEventListener(CHANGE_EVENT_NAME, () => this.#updatePathVisibility());
        this.#speedSlider.addEventListener(INPUT_EVENT_NAME, () => this.#handleSpeedInput());
        this.#tSlider.addEventListener(INPUT_EVENT_NAME, () => this.#handleTInput());
        this.#zoomSlider.addEventListener(INPUT_EVENT_NAME, () => this.#handleZoomInput());
    }

    /**
     * Per-frame update handler.
     *
     * @param {number} deltaTimeSeconds - Frame delta time in seconds.
     * @private
     */
    #onFrame(deltaTimeSeconds) {
        this.#orbitControls.update(deltaTimeSeconds);
        this.#currentT = DemoApp.#wrap01(this.#currentT + (deltaTimeSeconds * this.#speedValueCurrent));
        this.#path.getPointAt(this.#currentT, this.#tempPosition);

        this.#mover.position.set(this.#tempPosition.x, this.#tempPosition.y, this.#tempPosition.z);
        DemoApp.#updateLabel(this.#tValue, this.#currentT, UI_FRACTION_DIGITS);
        this.#tSlider.value = String(this.#currentT);

        this.#syncZoomUi();
        this.#fpsCounter.update(deltaTimeSeconds);
    }

    /**
     * Handles speed slider changes.
     *
     * @private
     */
    #handleSpeedInput() {
        const value = Number.parseFloat(this.#speedSlider.value);

        if (!Number.isFinite(value)) {
            return;
        }

        this.#speedValueCurrent = value;
        DemoApp.#updateLabel(this.#speedValue, value, UI_FRACTION_DIGITS);
    }

    /**
     * Handles t slider changes.
     *
     * @private
     */
    #handleTInput() {
        const value = Number.parseFloat(this.#tSlider.value);

        if (!Number.isFinite(value)) {
            return;
        }

        this.#currentT = value;
        DemoApp.#updateLabel(this.#tValue, value, UI_FRACTION_DIGITS);
    }

    /**
     * Handles zoom slider changes.
     *
     * @private
     */
    #handleZoomInput() {
        const zoomUiValue = Number.parseFloat(this.#zoomSlider.value);

        if (!Number.isFinite(zoomUiValue)) {
            return;
        }

        const distance = CAMERA_MIN_DISTANCE + CAMERA_MAX_DISTANCE - zoomUiValue;
        this.#orbitControls.setDistance(distance);
        DemoApp.#updateLabel(this.#zoomValue, zoomUiValue, ZOOM_FRACTION_DIGITS);
    }

    /**
     * Synchronizes zoom slider and label from orbit controls.
     *
     * @private
     */
    #syncZoomUi() {
        const distance         = this.#orbitControls.distance;
        const zoomUiValue      = CAMERA_MIN_DISTANCE + CAMERA_MAX_DISTANCE - distance;
        this.#zoomSlider.value = String(zoomUiValue);
        DemoApp.#updateLabel(this.#zoomValue, zoomUiValue, ZOOM_FRACTION_DIGITS);
    }

    /**
     * Shows or hides an object in the scene.
     *
     * @param {GeraWebGL.Object3D} object3d - Object to toggle.
     * @param {boolean} shouldShow          - Whether to show the object.
     * @throws {TypeError} When inputs are invalid.
     * @private
     */
    #setObjectVisibility(object3d, shouldShow) {
        if (!(object3d instanceof GeraWebGL.Object3D)) {
            throw new TypeError('`setObjectVisibility` expects an Object3D instance.');
        }

        if (typeof shouldShow !== 'boolean') {
            throw new TypeError('`setObjectVisibility` expects `shouldShow` as a boolean.');
        }

        const inScene = this.#engine.scene.children.includes(object3d);

        if (shouldShow && !inScene) {
            this.#engine.scene.add(object3d);
        }

        if (!shouldShow && inScene) {
            this.#engine.scene.remove(object3d);
        }
    }

    /**
     * Wraps t period into [0..1].
     *
     * @param {number} value - Input value.
     * @returns {number}
     * @throws {TypeError} When value is not a finite number.
     * @private
     */
    static #wrap01(value) {
        if (typeof value !== 'number' || !Number.isFinite(value)) {
            throw new TypeError('`wrap01` expects a finite number.');
        }

        const wrapped = value - Math.floor(value);
        return wrapped < MIN_T ? wrapped + MAX_T : wrapped;
    }

    /**
     * Creates a random point cloud.
     *
     * @param {number} count  - Number of points.
     * @param {number} spread - Spread along X/Z.
     * @param {number} height - Spread along Y.
     * @returns {GeraWebGL.Math.Vector3[]}
     * @throws {TypeError}  When inputs are invalid.
     * @throws {RangeError} When count is negative.
     * @private
     */
    static #createPointCloud(count, spread, height) {
        if (typeof count !== 'number' || !Number.isFinite(count)) {
            throw new TypeError('`createPointCloud` expects `count` as a finite number.');
        }

        if (!Number.isInteger(count) || count < 0) {
            throw new RangeError('`createPointCloud` expects `count` as a non-negative integer.');
        }

        if (typeof spread !== 'number' || !Number.isFinite(spread)) {
            throw new TypeError('`createPointCloud` expects `spread` as a finite number.');
        }

        if (typeof height !== 'number' || !Number.isFinite(height)) {
            throw new TypeError('`createPointCloud` expects `height` as a finite number.');
        }

        const points = [];

        for (let index = 0; index < count; index += 1) {
            const x = (Math.random() - RANDOM_CENTER_OFFSET) * spread;
            const y = (Math.random() - RANDOM_CENTER_OFFSET) * height;
            const z = (Math.random() - RANDOM_CENTER_OFFSET) * spread;
            points.push(new GeraWebGL.Math.Vector3(x, y, z));
        }

        return points;
    }

    /**
     * Builds control points for the curve.
     *
     * @returns {GeraWebGL.Math.Vector3[]}
     * @private
     */
    static #createControlPoints() {
        return PATH_CONTROL_COORDS.map((coords) => new GeraWebGL.Math.Vector3(
            coords[COORD_X_INDEX],
            coords[COORD_Y_INDEX],
            coords[COORD_Z_INDEX]
        ));
    }

    /**
     * Updates a label with a numeric value.
     *
     * @param {HTMLElement} element   - Target element.
     * @param {number} value          - Value to display.
     * @param {number} fractionDigits - Number of digits after decimal.
     * @throws {TypeError} When inputs are invalid.
     * @private
     */
    static #updateLabel(element, value, fractionDigits) {
        if (!(element instanceof HTMLElement)) {
            throw new TypeError('`updateLabel` expects `element` as an HTMLElement.');
        }

        if (typeof value !== 'number' || !Number.isFinite(value)) {
            throw new TypeError('`updateLabel` expects `value` as a finite number.');
        }

        if (typeof fractionDigits !== 'number' || !Number.isFinite(fractionDigits)) {
            throw new TypeError('`updateLabel` expects `fractionDigits` as a finite number.');
        }

        element.textContent = value.toFixed(fractionDigits);
    }

    /**
     * Gets a required DOM element by id.
     *
     * @template {HTMLElement} T
     * @param {string} elementId                      - Element id.
     * @param {new (...args: any[]) => T} elementType - Expected element type.
     * @param {string} errorMessage                   - Error message for missing element.
     * @returns {T}
     * @private
     */
    static #getRequiredElementById(elementId, elementType, errorMessage) {
        const element = document.getElementById(elementId);

        if (!(element instanceof elementType)) {
            throw new Error(errorMessage);
        }

        return element;
    }

    /**
     * Syncs path and debug line visibility from UI state.
     *
     * @private
     */
    #updatePathVisibility() {
        const showPath  = this.#showPathCheckbox.checked;
        const showDebug = showPath && this.#showDebugCheckbox.checked;
        this.#setObjectVisibility(this.#pathLine, showPath);
        this.#setObjectVisibility(this.#debugLine, showDebug);
    }
}

const demoApp = new DemoApp();
demoApp.start();

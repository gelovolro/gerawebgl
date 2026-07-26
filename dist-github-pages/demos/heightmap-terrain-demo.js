import GeraWebGL from './gerawebgl.js';

/**
 * Canvas element id used by the heightmap terrain demo.
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
 * Upload heightmap button id.
 *
 * @type {string}
 */
const UPLOAD_BUTTON_ID = 'uploadHeightmapButton';

/**
 * Reset heightmap button id.
 *
 * @type {string}
 */
const RESET_BUTTON_ID = 'resetHeightmapButton';

/**
 * Hidden file input id.
 *
 * @type {string}
 */
const FILE_INPUT_ID = 'heightmapFileInput';

/**
 * Detail (LOD) slider id (HTML keeps legacy naming).
 *
 * @type {string}
 */
const DETAIL_SLIDER_ID = 'complexitySlider';

/**
 * Detail value label id (HTML keeps legacy naming).
 *
 * @type {string}
 */
const DETAIL_VALUE_LABEL_ID = 'complexityValueLabel';

/**
 * Heightmap source label id.
 *
 * @type {string}
 */
const SOURCE_LABEL_ID = 'heightmapSourceLabel';

/**
 * File input accept filter: any image type supported by the browser.
 *
 * @type {string}
 */
const FILE_ACCEPT_IMAGE = 'image/*';

/**
 * DOM event name: click.
 *
 * @type {string}
 */
const EVENT_CLICK = 'click';

/**
 * DOM event name: input.
 *
 * @type {string}
 */
const EVENT_INPUT = 'input';

/**
 * DOM event name: change.
 *
 * @type {string}
 */
const EVENT_CHANGE = 'change';

/**
 * Common prefix for demo errors.
 *
 * @type {string}
 */
const ERROR_PREFIX = 'HeightmapTerrainDemo: ';

/**
 * Error message used, when a required DOM element is missing.
 *
 * @type {string}
 */
const ERROR_MISSING_ELEMENT_PREFIX = ERROR_PREFIX + 'Missing required element with id: ';

/**
 * Error message used, when a required element has a wrong type.
 *
 * @type {string}
 */
const ERROR_WRONG_ELEMENT_TYPE_PREFIX = ERROR_PREFIX + 'Element has an unexpected type for id: ';

/**
 * Error message used, when the `DemoApp` constructor receives invalid arguments.
 *
 * @type {string}
 */
const ERROR_INVALID_ARGS = ERROR_PREFIX + 'DemoApp expects a plain object with required DOM elements.';

/**
 * Error message used, when heightmap file loading fails.
 *
 * @type {string}
 */
const ERROR_HEIGHTMAP_LOAD_FAILED = ERROR_PREFIX + 'Failed to load heightmap image from the selected file.';

/**
 * Error message used, when the 2D canvas context is unavailable.
 *
 * @type {string}
 */
const ERROR_CANVAS_CONTEXT = ERROR_PREFIX + 'Failed to acquire a 2D canvas context.';

/**
 * Error message used, when orbit controls receive invalid camera.
 *
 * @type {string}
 */
const ERROR_ORBIT_CAMERA = ERROR_PREFIX + 'Expected a `Camera` instance for orbit controls.';

/**
 * Error message used, when orbit controls receive invalid canvas.
 *
 * @type {string}
 */
const ERROR_ORBIT_CANVAS = ERROR_PREFIX + 'Expected a `HTMLCanvasElement` for orbit controls.';

/**
 * Shared integer zero used for indexing, loop starts and `empty` checks to avoid magic numbers.
 *
 * @type {number}
 */
const ZERO_INTEGER_VALUE = 0;

/**
 * Shared integer one used for loop steps, non-zero guards and `power-of-two` math to avoid magic numbers.
 *
 * @type {number}
 */
const ONE_INTEGER_VALUE = 1;

/**
 * Shared floating-point zero used in numeric clamping and normalized math to avoid magic numbers.
 *
 * @type {number}
 */
const ZERO_FLOAT_VALUE = 0.0;

/**
 * Shared floating-point one used in numeric clamping and normalized math to avoid magic numbers.
 *
 * @type {number}
 */
const ONE_FLOAT_VALUE = 1.0;

/**
 * Slider range minimum.
 *
 * @type {number}
 */
const SLIDER_MIN = 0;

/**
 * Slider range maximum.
 *
 * @type {number}
 */
const SLIDER_MAX = 100;

/**
 * Slider step.
 *
 * @type {number}
 */
const SLIDER_STEP = 1;

/**
 * Minimum power-of-two exponent for terrain segments: 2^3 = 8.
 *
 * @type {number}
 */
const SEGMENTS_EXPONENT_MIN = 3;

/**
 * Maximum power-of-two exponent for terrain segments: 2^8 = 256.
 *
 * @type {number}
 */
const SEGMENTS_EXPONENT_MAX = 8;

/**
 * Default slider value that maps to 2^7 = 128 segments.
 *
 * @type {number}
 */
const DEFAULT_DETAIL_SLIDER_VALUE = 80;

/**
 * Default wireframe state.
 *
 * @type {boolean}
 */
const DEFAULT_WIREFRAME_ENABLED = false;

/**
 * Default heightmap resolution (procedural mode), in pixels.
 *
 * @type {number}
 */
const DEFAULT_HEIGHTMAP_SIZE_PX = 256;

/**
 * Default terrain size (width/depth) in world units.
 *
 * @type {number}
 */
const DEFAULT_TERRAIN_SIZE = 2.0;

/**
 * Default height scale applied to heightmap values.
 *
 * @type {number}
 */
const DEFAULT_HEIGHT_SCALE = 0.7;

/**
 * Default height offset applied to all vertices.
 *
 * @type {number}
 */
const DEFAULT_HEIGHT_OFFSET = 0.0;

/**
 * Default heightmap sampling mode for geometry generation.
 *
 * @type {string}
 */
const DEFAULT_SAMPLING_MODE = GeraWebGL.Geometries.HeightmapGeometry.Sampling.BILINEAR;

/**
 * Flip V axis, when sampling heightmap.
 *
 * @type {boolean}
 */
const DEFAULT_FLIP_Y = true;

/**
 * FPS counter update interval in milliseconds.
 *
 * @type {number}
 */
const FPS_COUNTER_UPDATE_INTERVAL_MS = 250;

/**
 * FPS counter exponential smoothing factor.
 *
 * @type {number}
 */
const FPS_COUNTER_SMOOTHING_FACTOR = 0.15;

/**
 * FPS counter `good` threshold.
 *
 * @type {number}
 */
const FPS_COUNTER_GOOD_FPS_THRESHOLD = 50;

/**
 * FPS counter `ok` threshold.
 *
 * @type {number}
 */
const FPS_COUNTER_OK_FPS_THRESHOLD = 30;

/**
 * Orbit controls target X.
 *
 * @type {number}
 */
const ORBIT_TARGET_X = 0.0;

/**
 * Orbit controls target Y.
 *
 * @type {number}
 */
const ORBIT_TARGET_Y = 0.0;

/**
 * Orbit controls target Z.
 *
 * @type {number}
 */
const ORBIT_TARGET_Z = 0.0;

/**
 * Orbit controls distance.
 *
 * @type {number}
 */
const ORBIT_DISTANCE = 4.0;

/**
 * Orbit controls min distance.
 *
 * @type {number}
 */
const ORBIT_MIN_DISTANCE = 0.8;

/**
 * Orbit controls max distance.
 *
 * @type {number}
 */
const ORBIT_MAX_DISTANCE = 30.0;

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
 * Orbit controls default azimuth (yaw) angle in radians.
 *
 * @type {number}
 */
const ORBIT_AZIMUTH_RADIANS = 0.8;

/**
 * Orbit controls default polar (pitch) angle in radians.
 *
 * @type {number}
 */
const ORBIT_POLAR_RADIANS = -0.6;

/**
 * Terrain diffuse color.
 *
 * @type {Float32Array}
 */
const TERRAIN_COLOR = new Float32Array([0.20, 0.80, 0.30]);

/**
 * Terrain directional light direction (world space).
 *
 * @type {Float32Array}
 */
const TERRAIN_LIGHT_DIRECTION = new Float32Array([0.5, 1.0, 0.35]);

/**
 * Terrain ambient strength multiplier.
 *
 * @type {number}
 */
const TERRAIN_AMBIENT_STRENGTH = 0.35;

/**
 * Terrain specular color.
 *
 * @type {Float32Array}
 */
const TERRAIN_SPECULAR_COLOR = new Float32Array([1.0, 1.0, 1.0]);

/**
 * Terrain specular strength multiplier.
 *
 * @type {number}
 */
const TERRAIN_SPECULAR_STRENGTH = 0.08;

/**
 * Terrain specular shininess exponent.
 *
 * @type {number}
 */
const TERRAIN_SHININESS = 20.0;

/**
 * Text label used, when wireframe is enabled.
 *
 * @type {string}
 */
const TEXT_WIREFRAME_ON = 'Wireframe: ON';

/**
 * Text label used, when wireframe is disabled.
 *
 * @type {string}
 */
const TEXT_WIREFRAME_OFF = 'Wireframe: OFF';

/**
 * Text label for the default built-in (procedural) heightmap source.
 *
 * @type {string}
 */
const TEXT_SOURCE_PROCEDURAL = 'Source: Procedural';

/**
 * Detail label prefix.
 *
 * @type {string}
 */
const TEXT_DETAIL_PREFIX = 'LOD: ';

/**
 * Detail label separator between X/Z segment counts.
 *
 * @type {string}
 */
const TEXT_DETAIL_SEPARATOR = ' x ';

/**
 * Heightmap source type discriminator: procedural.
 *
 * @type {string}
 */
const SOURCE_KIND_PROCEDURAL = 'procedural';

/**
 * Heightmap source type discriminator: file.
 *
 * @type {string}
 */
const SOURCE_KIND_FILE = 'file';

/**
 * Empty string constant.
 *
 * @type {string}
 */
const EMPTY_STRING = '';

/**
 * Procedural heightmap complexity in [0..1] range.
 *
 * @type {number}
 */
const PROCEDURAL_COMPLEXITY_NORMALIZED = 0.35;

/**
 * Default procedural noise seed.
 *
 * @type {number}
 */
const DEFAULT_NOISE_SEED = 1337;

/**
 * 2π constant.
 *
 * @type {number}
 */
const TWO_PI = Math.PI * 2.0;

/**
 * Base wave frequency used by procedural heightmap generator.
 *
 * @type {number}
 */
const BASE_WAVE_FREQUENCY = 2.0;

/**
 * Procedural: frequency scale factor (added to base frequency).
 *
 * @type {number}
 */
const PROC_FREQUENCY_SCALE = 6.0;

/**
 * Procedural: base contribution scale for waves.
 *
 * @type {number}
 */
const PROC_WAVE_SCALE = 0.25;

/**
 * Procedural: base height offset (to remap waves into 0..1 range).
 *
 * @type {number}
 */
const PROC_BASE_OFFSET = 0.5;

/**
 * Heightmap pixel channels per pixel (RGBA).
 *
 * @type {number}
 */
const CHANNELS_PER_PIXEL = 4;

/**
 * Max 8-bit channel value.
 *
 * @type {number}
 */
const CHANNEL_MAX = 255;

/**
 * Red channel index within RGBA pixel.
 *
 * @type {number}
 */
const RED_CHANNEL_INDEX = 0;

/**
 * Green channel index within RGBA pixel.
 *
 * @type {number}
 */
const GREEN_CHANNEL_INDEX = 1;

/**
 * Blue channel index within RGBA pixel.
 *
 * @type {number}
 */
const BLUE_CHANNEL_INDEX = 2;

/**
 * Alpha channel index within RGBA pixel.
 *
 * @type {number}
 */
const ALPHA_CHANNEL_INDEX = 3;

/**
 * Canvas tag name used to extract ImageData from an HTMLImageElement.
 *
 * @type {string}
 */
const CANVAS_TAG_NAME = 'canvas';

/**
 * Canvas 2D context name.
 *
 * @type {string}
 */
const CANVAS_CONTEXT_2D = '2d';

/**
 * Text shown while heightmap is being processed.
 *
 * @type {string}
 */
const TEXT_PROCESSING_HEIGHTMAP = 'Processing heightmap...';

/**
 * Text shown after heightmap has been loaded and mesh rebuilt.
 *
 * @type {string}
 */
const TEXT_HEIGHTMAP_LOADED = 'Heightmap loaded';

/**
 * Zoom slider element id.
 *
 * @type {string}
 */
const ZOOM_SLIDER_ID = 'zoomSlider';

/**
 * Element id used to display current zoom slider value.
 *
 * @type {string}
 */
const ZOOM_VALUE_ELEMENT_ID = 'zoomValue';

/**
 * Fraction digits for the zoom label.
 *
 * @type {number}
 */
const ZOOM_LABEL_FRACTION_DIGITS = 1;

/**
 * Zoom slider step.
 *
 * @type {number}
 */
const ZOOM_SLIDER_STEP = 0.1;

/**
 * Offset applied to the terrain mesh transform.
 *
 * @type {number}
 */
const TERRAIN_MESH_Y_OFFSET = 0.5;

/**
 * Constructor arguments for {@link DemoApp}.
 *
 * All fields are required and must be valid DOM elements of the expected type.
 *
 * @typedef {Object} DemoAppArgs
 *
 * @property {HTMLCanvasElement} canvas - Canvas element used as the WebGL rendering surface and as an input target for controls.
 *
 * @property {HTMLButtonElement} wireframeToggleButton - Button, that toggles wireframe mode for the terrain material.
 *
 * @property {HTMLButtonElement} uploadButton - Button, that triggers the heightmap file selection dialog.
 *
 * @property {HTMLButtonElement} resetButton - Button, that resets the heightmap source back to the built-in procedural heightmap.
 *
 * @property {HTMLInputElement} fileInput - File input used to load a custom heightmap image from disk.
 *
 * @property {HTMLInputElement} complexitySlider - LOD slider, that controls the terrain segment count (`power-of-two` mapping).
 *
 * @property {HTMLElement} complexityValueLabel - UI label, that displays the current LOD in a human-readable form (e.g. `LOD: 128x128`).
 *
 * @property {HTMLElement} sourceLabel - UI label, that displays the heightmap source/status.
 *
 * @property {HTMLInputElement} zoomSlider - Zoom slider, that controls {@link GeraWebGL.Controls.OrbitControls} distance.
 *
 * @property {HTMLElement} zoomValueElement - UI element, that displays the current zoom slider value.
 */

/**
 * Demo application: heightmap terrain with LOD slider, file upload, wireframe and orbit controls.
 */
class DemoApp {

    /**
     * Canvas element used as the WebGL rendering surface and as the input target for camera controls (mouse/touch events).
     *
     * @type {HTMLCanvasElement}
     * @private
     */
    #canvas;

    /**
     * UI button, that toggles wireframe rendering for the terrain material.
     *
     * @type {HTMLButtonElement}
     * @private
     */
    #wireframeToggleButton;

    /**
     * UI button, that opens the hidden file input dialog for selecting a heightmap image.
     *
     * @type {HTMLButtonElement}
     * @private
     */
    #uploadButton;

    /**
     * UI button, that resets the heightmap source back to the built-in procedural heightmap.
     *
     * @type {HTMLButtonElement}
     * @private
     */
    #resetButton;

    /**
     * Hidden file input used to select a custom heightmap image from disk.
     * The demo reads the selected file into `ImageData` and rebuilds the mesh.
     *
     * @type {HTMLInputElement}
     * @private
     */
    #fileInput;

    /**
     * UI slider controlling terrain level-of-detail (LOD).
     * Its numeric value is mapped to a `power-of-two` segment count for `HeightmapGeometry`.
     *
     * @type {HTMLInputElement}
     * @private
     */
    #detailSlider;

    /**
     * UI element showing a human-readable representation of the current LOD, e.g. `LOD: 128x128`.
     *
     * @type {HTMLElement}
     * @private
     */
    #detailValueLabel;

    /**
     * UI element showing the current heightmap source/status text.
     *
     * @type {HTMLElement}
     * @private
     */
    #sourceLabel;

    /**
     * GeraWebGL engine instance, that owns the WebGL context, the scene, the camera.
     *
     * @type {GeraWebGL.Engine}
     * @private
     */
    #engine;

    /**
     * `OrbitControls` instance used to rotate/zoom/pan the camera around a target point.
     *
     * @type {GeraWebGL.Controls.OrbitControls}
     * @private
     */
    #orbitControls;

    /**
     * FPS counter overlay used for debugging and performance monitoring.
     *
     * @type {GeraWebGL.Debug.FpsCounter}
     * @private
     */
    #fpsCounter;

    /**
     * Current terrain mesh attached to the scene.
     *
     * @type {GeraWebGL.Mesh | null}
     * @private
     */
    #terrainMesh = null;

    /**
     * Current `HeightmapGeometry` used by the terrain mesh.
     *
     * @type {GeraWebGL.Geometries.HeightmapGeometry | null}
     * @private
     */
    #terrainGeometry = null;

    /**
     * Material used to render the terrain.
     *
     * @type {GeraWebGL.Materials.PhongMaterial}
     * @private
     */
    #terrainMaterial;

    /**
     * Current wireframe mode state used by the terrain material.
     *
     * @type {boolean}
     * @private
     */
    #isWireframeEnabled = DEFAULT_WIREFRAME_ENABLED;

    /**
     * Heightmap pixel data used to generate `HeightmapGeometry`.
     *
     * @type {ImageData | null}
     * @private
     */
    #heightmapImageData = null;

    /**
     * Cached numeric value from the LOD slider.
     *
     * @type {number}
     * @private
     */
    #detailSliderValue = DEFAULT_DETAIL_SLIDER_VALUE;

    /**
     * Segment count used by the currently built terrain geometry.
     *
     * @type {number}
     * @private
     */
    #currentSegments = 0;

    /**
     * Flag indicating, that the terrain must be rebuilt.
     *
     * @type {boolean}
     * @private
     */
    #isTerrainRebuildRequested = false;

    /**
     * Throttling flag for the LOD slider input handler.
     *
     * @type {boolean}
     * @private
     */
    #isSliderUpdateScheduled = false;

    /**
     * Seed value used for procedural heightmap generation.
     *
     * @type {number}
     * @private
     */
    #noiseSeed = DEFAULT_NOISE_SEED;

    /**
     * UI state flag used after loading a heightmap from a file.
     *
     * @type {boolean}
     * @private
     */
    #shouldShowHeightmapLoadedMessage = false;

    /**
     * Current heightmap source kind discriminator.
     *
     * @type {string}
     * @private
     */
    #sourceKind = SOURCE_KIND_PROCEDURAL;

    /**
     * Name of the selected heightmap file.
     *
     * @type {string | null}
     * @private
     */
    #sourceFileName = null;

    /**
     * UI slider controlling camera zoom in addition to the mouse wheel.
     *
     * @type {HTMLInputElement}
     * @private
     */
    #zoomSlider;

    /**
     * UI element showing the current zoom slider numeric value.
     *
     * @type {HTMLElement}
     * @private
     */
    #zoomValueElement;

    /**
     * @param {DemoAppArgs} args - Required DOM elements and UI controls used by the demo.
     * @throws {TypeError} When required arguments are missing or have unexpected types.
     */
    constructor(args) {
        if (args === null || typeof args !== 'object' || Array.isArray(args)) {
            throw new TypeError(ERROR_INVALID_ARGS);
        }

        const {
            canvas,
            wireframeToggleButton,
            uploadButton,
            resetButton,
            fileInput,
            complexitySlider,
            complexityValueLabel,
            sourceLabel,
            zoomSlider,
            zoomValueElement
        } = args;

        if (!(canvas instanceof HTMLCanvasElement)
            || !(wireframeToggleButton instanceof HTMLButtonElement)
            || !(uploadButton instanceof HTMLButtonElement)
            || !(resetButton instanceof HTMLButtonElement)
            || !(fileInput instanceof HTMLInputElement)
            || !(complexitySlider instanceof HTMLInputElement)
            || !(complexityValueLabel instanceof HTMLElement)
            || !(sourceLabel instanceof HTMLElement)
            || !(zoomSlider instanceof HTMLInputElement)
            || !(zoomValueElement instanceof HTMLElement)
        ) {
            throw new TypeError(ERROR_INVALID_ARGS);
        }

        this.#canvas                = canvas;
        this.#wireframeToggleButton = wireframeToggleButton;
        this.#uploadButton          = uploadButton;
        this.#resetButton           = resetButton;
        this.#fileInput             = fileInput;
        this.#detailSlider          = complexitySlider;
        this.#detailValueLabel      = complexityValueLabel;
        this.#sourceLabel           = sourceLabel;
        this.#zoomSlider            = zoomSlider;
        this.#zoomValueElement      = zoomValueElement;
        this.#engine                = GeraWebGL.createEngine(this.#canvas, { fitToWindow: false });

        const webglContext    = this.#engine.webglRenderingContext;
        this.#orbitControls   = this.#createOrbitControls(this.#engine.camera, this.#canvas);
        this.#terrainMaterial = new GeraWebGL.Materials.PhongMaterial(webglContext, {
            color            : TERRAIN_COLOR,
            lightDirection   : TERRAIN_LIGHT_DIRECTION,
            ambientStrength  : TERRAIN_AMBIENT_STRENGTH,
            specularColor    : TERRAIN_SPECULAR_COLOR,
            specularStrength : TERRAIN_SPECULAR_STRENGTH,
            shininess        : TERRAIN_SHININESS
        });

        this.#fpsCounter = new GeraWebGL.Debug.FpsCounter({
            updateIntervalMs : FPS_COUNTER_UPDATE_INTERVAL_MS,
            smoothingFactor  : FPS_COUNTER_SMOOTHING_FACTOR,
            goodFpsThreshold : FPS_COUNTER_GOOD_FPS_THRESHOLD,
            okFpsThreshold   : FPS_COUNTER_OK_FPS_THRESHOLD
        });

        document.body.appendChild(this.#fpsCounter.domElement);
        this.#applyInitialUiState();
        this.#attachUiHandlers();
        this.#setProceduralHeightmapAsCurrent();
        this.#requestTerrainRebuild();
    }

    /**
     * Starts the `requestAnimationFrame` render loop.
     */
    initialize() {
        this.#engine.start((deltaSeconds) => {
            this.#fpsCounter.update(deltaSeconds);
            this.#orbitControls.update();

            if (this.#isTerrainRebuildRequested) {
                this.#isTerrainRebuildRequested = false;
                this.#rebuildTerrain();
            }
        });
    }

    /**
     * @param {GeraWebGL.Camera} camera            - Camera instance, that will be controlled by orbit interactions (rotate/zoom/pan).
     * @param {HTMLCanvasElement} canvas           - Canvas element used as the input surface for mouse/touch events.
     * @returns {GeraWebGL.Controls.OrbitControls} - Configured `OrbitControls` instance bound to the provided camera and canvas.
     * @private
     */
    #createOrbitControls(camera, canvas) {
        if (!(camera instanceof GeraWebGL.Camera)) {
            throw new TypeError(ERROR_ORBIT_CAMERA);
        }

        if (!(canvas instanceof HTMLCanvasElement)) {
            throw new TypeError(ERROR_ORBIT_CANVAS);
        }

        const controls = new GeraWebGL.Controls.OrbitControls(camera, canvas, {
            targetX        : ORBIT_TARGET_X,
            targetY        : ORBIT_TARGET_Y,
            targetZ        : ORBIT_TARGET_Z,
            distance       : ORBIT_DISTANCE,
            minDistance    : ORBIT_MIN_DISTANCE,
            maxDistance    : ORBIT_MAX_DISTANCE,
            rotationSpeed  : ORBIT_ROTATION_SPEED,
            zoomSpeed      : ORBIT_ZOOM_SPEED,
            azimuthRadians : ORBIT_AZIMUTH_RADIANS,
            polarRadians   : ORBIT_POLAR_RADIANS
        });

        controls.update();
        return controls;
    }

    /**
     * @private
     */
    #applyInitialUiState() {
        this.#wireframeToggleButton.textContent = this.#isWireframeEnabled ? TEXT_WIREFRAME_ON : TEXT_WIREFRAME_OFF;
        this.#detailSlider.min   = String(SLIDER_MIN);
        this.#detailSlider.max   = String(SLIDER_MAX);
        this.#detailSlider.step  = String(SLIDER_STEP);
        this.#detailSlider.value = String(this.#detailSliderValue);
        this.#fileInput.accept   = FILE_ACCEPT_IMAGE;

        this.#updateDetailLabel();
        this.#sourceLabel.textContent = TEXT_SOURCE_PROCEDURAL;
        this.#zoomSlider.min  = String(ORBIT_MIN_DISTANCE);
        this.#zoomSlider.max  = String(ORBIT_MAX_DISTANCE);
        this.#zoomSlider.step = String(ZOOM_SLIDER_STEP);
        this.#syncZoomUIFromControls();
    }

    /**
     * @private
     */
    #attachUiHandlers() {
        this.#wireframeToggleButton.addEventListener(EVENT_CLICK, () => {
            this.#isWireframeEnabled = !this.#isWireframeEnabled;
            this.#wireframeToggleButton.textContent = this.#isWireframeEnabled ? TEXT_WIREFRAME_ON : TEXT_WIREFRAME_OFF;
            this.#terrainMaterial.setWireframeEnabled(this.#isWireframeEnabled);
        });

        this.#uploadButton.addEventListener(EVENT_CLICK, () => this.#fileInput.click());
        this.#resetButton.addEventListener(EVENT_CLICK,  () => {
            this.#setProceduralHeightmapAsCurrent();
            this.#requestTerrainRebuild();
        });

        this.#fileInput.addEventListener(EVENT_CHANGE, async () => {
            const files = this.#fileInput.files;

            if (!files || files.length === ZERO_INTEGER_VALUE) {
                return;
            }

            const file                    = files[ZERO_INTEGER_VALUE];
            this.#fileInput.value         = EMPTY_STRING;
            this.#sourceLabel.textContent = TEXT_PROCESSING_HEIGHTMAP;

            try {
                const imageData          = await DemoApp.#loadImageDataFromFile(file);
                this.#heightmapImageData = imageData;
                this.#sourceKind         = SOURCE_KIND_FILE;
                this.#sourceFileName     = file.name;
                this.#currentSegments    = ZERO_INTEGER_VALUE;
                this.#shouldShowHeightmapLoadedMessage = true;
                this.#requestTerrainRebuild();
            } catch (error) {
                console.error(error);

                this.#setProceduralHeightmapAsCurrent();
                this.#currentSegments = ZERO_INTEGER_VALUE;
                this.#shouldShowHeightmapLoadedMessage = false;
                this.#requestTerrainRebuild();
            }
        });

        this.#detailSlider.addEventListener(EVENT_INPUT, () => {
            const nextValue = Number(this.#detailSlider.value);

            if (!Number.isFinite(nextValue)) {
                return;
            }

            this.#detailSliderValue = DemoApp.#clampNumber(nextValue, SLIDER_MIN, SLIDER_MAX);
            this.#updateDetailLabel();

            if (!this.#isSliderUpdateScheduled) {
                this.#isSliderUpdateScheduled = true;
                requestAnimationFrame(() => {
                    this.#isSliderUpdateScheduled = false;
                    this.#requestTerrainRebuild();
                });
            }
        });

        this.#zoomSlider.addEventListener(EVENT_INPUT, () => this.#onZoomSliderInput());
    }

    /**
     * @private
     */
    #updateDetailLabel() {
        const segments = DemoApp.#segmentsFromSlider(this.#detailSliderValue);
        this.#detailValueLabel.textContent = TEXT_DETAIL_PREFIX + String(segments) + TEXT_DETAIL_SEPARATOR + String(segments);
    }

    /**
     * @private
     */
    #requestTerrainRebuild() {
        this.#isTerrainRebuildRequested = true;
    }

    /**
     * @private
     */
    #rebuildTerrain() {
        if (!(this.#heightmapImageData instanceof ImageData)) {
            this.#setProceduralHeightmapAsCurrent();
        }

        if (!(this.#heightmapImageData instanceof ImageData)) {
            return;
        }

        const segments      = DemoApp.#segmentsFromSlider(this.#detailSliderValue);
        const shouldRebuild = (segments !== this.#currentSegments) || (this.#terrainGeometry === null);

        if (!shouldRebuild) {
            return;
        }

        this.#currentSegments = segments;

        if (this.#terrainMesh) {
            this.#engine.scene.remove(this.#terrainMesh);
            this.#terrainMesh = null;
        }

        if (this.#terrainGeometry) {
            this.#terrainGeometry.dispose();
            this.#terrainGeometry = null;
        }

        this.#terrainGeometry = new GeraWebGL.Geometries.HeightmapGeometry(
            this.#engine.webglRenderingContext,
            this.#heightmapImageData,
            {
                width        : DEFAULT_TERRAIN_SIZE,
                depth        : DEFAULT_TERRAIN_SIZE,
                heightScale  : DEFAULT_HEIGHT_SCALE,
                heightOffset : DEFAULT_HEIGHT_OFFSET,
                segmentsX    : segments,
                segmentsZ    : segments,
                isWireframe  : this.#isWireframeEnabled,
                flipY        : DEFAULT_FLIP_Y,
                sampling     : DEFAULT_SAMPLING_MODE
            }
        );

        this.#terrainMesh = new GeraWebGL.Mesh(this.#terrainGeometry, this.#terrainMaterial);
        this.#terrainMesh.position.y -= TERRAIN_MESH_Y_OFFSET;
        this.#engine.scene.add(this.#terrainMesh);

        if (this.#shouldShowHeightmapLoadedMessage) {
            this.#sourceLabel.textContent          = TEXT_HEIGHTMAP_LOADED;
            this.#shouldShowHeightmapLoadedMessage = false;
        }
    }

    /**
     * @private
     */
    #setProceduralHeightmapAsCurrent() {
        this.#sourceKind               = SOURCE_KIND_PROCEDURAL;
        this.#sourceFileName           = null;
        this.#sourceLabel.textContent  = TEXT_SOURCE_PROCEDURAL;
        this.#noiseSeed               += ONE_INTEGER_VALUE;

        this.#heightmapImageData = DemoApp.#generateProceduralHeightmapImageData(
            DEFAULT_HEIGHTMAP_SIZE_PX,
            DEFAULT_HEIGHTMAP_SIZE_PX,
            PROCEDURAL_COMPLEXITY_NORMALIZED
        );
    }

    /**
     * Handles the zoom slider changes and applies them to `OrbitControls`.
     *
     * @private
     */
    #onZoomSliderInput() {
        const zoomUiValue = Number.parseFloat(this.#zoomSlider.value);

        if (!Number.isFinite(zoomUiValue)) {
            return;
        }

        const distance = ORBIT_MIN_DISTANCE + ORBIT_MAX_DISTANCE - zoomUiValue;
        this.#orbitControls.setDistance(distance);
        this.#orbitControls.update();
        this.#syncZoomUIFromControls();
    }

    /**
     * Synchronizes zoom UI (slider + value) from the current `OrbitControls` state.
     *
     * @private
     */
    #syncZoomUIFromControls() {
        if (!this.#orbitControls || !this.#zoomSlider || !this.#zoomValueElement) {
            return;
        }

        const distance                     = this.#orbitControls.distance;
        const zoomUiValue                  = ORBIT_MIN_DISTANCE + ORBIT_MAX_DISTANCE - distance;
        this.#zoomSlider.value             = String(zoomUiValue);
        this.#zoomValueElement.textContent = zoomUiValue.toFixed(ZOOM_LABEL_FRACTION_DIGITS);
    }

    /**
     * @param {number} sliderValue - Raw slider value.
     * @returns {number}           - Segment count (power of two), guaranteed to be at `least 1`.
     * @private
     */
    static #segmentsFromSlider(sliderValue) {
        const fallback = (ONE_INTEGER_VALUE << SEGMENTS_EXPONENT_MIN);

        if (typeof sliderValue !== 'number' || !Number.isFinite(sliderValue)) {
            return fallback;
        }

        const clampedSliderValue = DemoApp.#clampNumber(sliderValue, SLIDER_MIN, SLIDER_MAX) / SLIDER_MAX;
        const exponentValue      = SEGMENTS_EXPONENT_MIN + ((SEGMENTS_EXPONENT_MAX - SEGMENTS_EXPONENT_MIN) * clampedSliderValue);
        const roundedExponent    = Math.round(exponentValue);
        return Math.max(ONE_INTEGER_VALUE, (ONE_INTEGER_VALUE << roundedExponent));
    }

    /**
     * Clamps a numeric value into the inclusive range [min .. max].
     *
     * @param {number} value - Input number to clamp.
     * @param {number} min   - Lower bound.
     * @param {number} max   - Upper bound.
     * @returns {number}     - The clamped value within [min .. max].
     * @private
     */
    static #clampNumber(value, min, max) {
        return Math.min(max, Math.max(min, value));
    }

    /**
     * Loads a heightmap image from a local {@link File} and returns its pixel buffer as {@link ImageData}.
     *
     * @param {File} file            - Local image file to decode.
     * @returns {Promise<ImageData>} - Promise, that resolves with the image pixels in RGBA format.
     * @throws {TypeError} When `file` is not a {@link File} instance.
     * @private
     */
    static async #loadImageDataFromFile(file) {
        if (!(file instanceof File)) {
            throw new TypeError(ERROR_HEIGHTMAP_LOAD_FAILED);
        }

        const image = await DemoApp.#loadImageFromFile(file);
        return DemoApp.#extractImageDataFromImage(image);
    }

    /**
     * Loads an image from a local {@link File} by creating a temporary object.
     *
     * @param {File} file                   - Local file expected to contain an image.
     * @returns {Promise<HTMLImageElement>} - Promise that resolves with a decoded {@link HTMLImageElement} on successful load.
     * @private
     */
    static #loadImageFromFile(file) {
        return new Promise((resolve, reject) => {
            const url   = URL.createObjectURL(file);
            const image = new Image();

            image.onload = () => {
                URL.revokeObjectURL(url);
                resolve(image);
            };

            image.onerror = () => {
                URL.revokeObjectURL(url);
                reject(new Error(ERROR_HEIGHTMAP_LOAD_FAILED));
            };

            image.src = url;
        });
    }

    /**
     * Extracts raw pixel data from an already decoded {@link HTMLImageElement}.
     *
     * @param {HTMLImageElement} image - Decoded image element to read pixels from (its width/height define the output size).
     * @returns {ImageData}            - RGBA pixel buffer with the same dimensions as the input image.
     * @throws {Error} When the browser can't provide the 2D canvas rendering context.
     * @private
     */
    static #extractImageDataFromImage(image) {
        const canvas  = document.createElement(CANVAS_TAG_NAME);
        const context = canvas.getContext(CANVAS_CONTEXT_2D);

        if (!context) {
            throw new Error(ERROR_CANVAS_CONTEXT);
        }

        canvas.width  = image.width;
        canvas.height = image.height;
        context.drawImage(image, ZERO_INTEGER_VALUE, ZERO_INTEGER_VALUE);
        return context.getImageData(ZERO_INTEGER_VALUE, ZERO_INTEGER_VALUE, image.width, image.height);
    }

    /**
     * Generates a grayscale procedural heightmap as {@link ImageData} (RGBA),
     * where `R=G=B` represent the height value in the normalized range [0..255].
     *
     * @param {number} widthPx              - Target heightmap width in pixels. Values are floored and clamped to `at least 1`.
     * @param {number} heightPx             - Target heightmap height in pixels. Values are floored and clamped to `at least 1`.
     * @param {number} complexityNormalized - Complexity factor in the [0.0..1.0] range, that affects the wave frequency.
     * @returns {ImageData}                 - RGBA image data containing a grayscale heightmap (R=G=B=height, A=255).
     * @private
     */
    static #generateProceduralHeightmapImageData(widthPx, heightPx, complexityNormalized) {
        const width       = Math.max(ONE_INTEGER_VALUE, Math.floor(widthPx));
        const height      = Math.max(ONE_INTEGER_VALUE, Math.floor(heightPx));
        const imageData   = new ImageData(width, height);
        const data        = imageData.data;
        const frequency   = BASE_WAVE_FREQUENCY + (complexityNormalized * PROC_FREQUENCY_SCALE);
        const widthDenom  = Math.max(ONE_INTEGER_VALUE, (width - ONE_INTEGER_VALUE));
        const heightDenom = Math.max(ONE_INTEGER_VALUE, (height - ONE_INTEGER_VALUE));

        for (let y = ZERO_INTEGER_VALUE; y < height; y += ONE_INTEGER_VALUE) {
            const v = y / heightDenom;

            for (let x = ZERO_INTEGER_VALUE; x < width; x += ONE_INTEGER_VALUE) {
                const u           = x / widthDenom;
                const waveX       = Math.sin(u * TWO_PI * frequency);
                const waveY       = Math.cos(v * TWO_PI * frequency);
                const base        = ((waveX + waveY) * PROC_WAVE_SCALE) + PROC_BASE_OFFSET;
                const heightValue = DemoApp.#clampToUnitRange(base);
                const channel     = Math.round(heightValue * CHANNEL_MAX);
                const pixelBase   = ((y * width) + x) * CHANNELS_PER_PIXEL;
                data[pixelBase + RED_CHANNEL_INDEX]   = channel;
                data[pixelBase + GREEN_CHANNEL_INDEX] = channel;
                data[pixelBase + BLUE_CHANNEL_INDEX]  = channel;
                data[pixelBase + ALPHA_CHANNEL_INDEX] = CHANNEL_MAX;
            }
        }

        return imageData;
    }

    /**
     * Clamps a numeric value into the normalized unit range [0.0 .. 1.0].
     *
     * @param {number} value - Input numeric value to be constrained to the unit range.
     * @returns {number}     - A finite number within [0.0 .. 1.0], returns `0.0` for non-finite inputs.
     * @private
     */
    static #clampToUnitRange(value) {
        if (typeof value !== 'number' || !Number.isFinite(value)) {
            return ZERO_FLOAT_VALUE;
        }

        return Math.max(ZERO_FLOAT_VALUE, Math.min(ONE_FLOAT_VALUE, value));
    }
}

/**
 * @template {HTMLElement} T
 * @param {string} id                      - DOM element id to look up via `document.getElementById`.
 * @param {new (...args: any[]) => T} ctor - Expected constructor (type guard) used to validate the found element.
 * @returns {T}                            - The found DOM element cast to the expected type `T`.
 */
function getRequiredElementById(id, ctor) {
    const element = document.getElementById(id);

    if (!element) {
        throw new Error(ERROR_MISSING_ELEMENT_PREFIX + id);
    }

    if (!(element instanceof ctor)) {
        throw new TypeError(ERROR_WRONG_ELEMENT_TYPE_PREFIX + id);
    }

    return element;
}

const app = new DemoApp({
    canvas                : getRequiredElementById(CANVAS_ELEMENT_ID, HTMLCanvasElement),
    wireframeToggleButton : getRequiredElementById(WIREFRAME_TOGGLE_BUTTON_ID, HTMLButtonElement),
    uploadButton          : getRequiredElementById(UPLOAD_BUTTON_ID, HTMLButtonElement),
    resetButton           : getRequiredElementById(RESET_BUTTON_ID, HTMLButtonElement),
    fileInput             : getRequiredElementById(FILE_INPUT_ID, HTMLInputElement),
    complexitySlider      : getRequiredElementById(DETAIL_SLIDER_ID, HTMLInputElement),
    complexityValueLabel  : getRequiredElementById(DETAIL_VALUE_LABEL_ID, HTMLElement),
    sourceLabel           : getRequiredElementById(SOURCE_LABEL_ID, HTMLElement),
    zoomSlider            : getRequiredElementById(ZOOM_SLIDER_ID, HTMLInputElement),
    zoomValueElement      : getRequiredElementById(ZOOM_VALUE_ELEMENT_ID, HTMLElement)
});

app.initialize();

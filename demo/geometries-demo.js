import GeraWebGL from './gerawebgl.js';

/**
 * Canvas element id used by the geometries demo.
 *
 * @type {string}
 */
const CANVAS_ELEMENT_ID = 'glcanvas';

/**
 * Geometry select element id.
 *
 * @type {string}
 */
const GEOMETRY_SELECT_ID = 'geometrySelect';

/**
 * Segments slider element id.
 *
 * @type {string}
 */
const SEGMENTS_SLIDER_ID = 'segmentsSlider';

/**
 * Element id used to display the current segments slider value.
 *
 * @type {string}
 */
const SEGMENTS_VALUE_ELEMENT_ID = 'segmentsValue';

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
 * Button element id, that toggles wireframe mode.
 *
 * @type {string}
 */
const WIREFRAME_TOGGLE_BUTTON_ID = 'wireframeToggleButton';

/**
 * Wireframe button label prefix.
 *
 * @type {string}
 */
const WIREFRAME_BUTTON_LABEL_PREFIX = 'Wireframe: ';

/**
 * Wireframe enabled label.
 *
 * @type {string}
 */
const WIREFRAME_BUTTON_LABEL_ON = 'ON';

/**
 * Wireframe disabled label.
 *
 * @type {string}
 */
const WIREFRAME_BUTTON_LABEL_OFF = 'OFF';

/**
 * Default selected geometry type.
 *
 * @type {string}
 */
const DEFAULT_GEOMETRY_TYPE = 'box';

/**
 * Default segments slider value.
 *
 * @type {number}
 */
const DEFAULT_SEGMENTS = 8;

/**
 * Orbit controls initial distance.
 *
 * @type {number}
 */
const ORBIT_DISTANCE = 7.0;

/**
 * Orbit controls minimum allowed distance.
 *
 * @type {number}
 */
const ORBIT_MIN_DISTANCE = 1.5;

/**
 * Orbit controls maximum allowed distance.
 *
 * @type {number}
 */
const ORBIT_MAX_DISTANCE = 12.0;

/**
 * FPS counter update interval.
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
 * FPS threshold for `good` state.
 *
 * @type {number}
 */
const FPS_COUNTER_GOOD_FPS_THRESHOLD = 55;

/**
 * FPS threshold for `ok` state.
 *
 * @type {number}
 */
const FPS_COUNTER_OK_FPS_THRESHOLD = 30;

/**
 * First character index in a string.
 *
 * @type {number}
 */
const FIRST_CHAR_INDEX = 0;

/**
 * Start index for the rest of string slice.
 *
 * @type {number}
 */
const REST_SLICE_START_INDEX = 1;

/**
 * Requested clear color (RGB).
 *
 * @type {Float32Array}
 */
const CLEAR_COLOR = new Float32Array([0.05, 0.06, 0.08]);

/**
 * Utility that clamps a number to [min..max].
 *
 * @param {number} value - Value to clamp.
 * @param {number} min   - Lower bound.
 * @param {number} max   - Upper bound.
 * @returns {number}     - Clamped value.
 */
function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

/**
 * Geometry configuration for demo UI limits and mapping to actual geometry options.
 *
 * @typedef {Object} DemoGeometryConfig
 * @property {number} minSegments - Minimum slider value.
 * @property {number} maxSegments - Maximum slider value.
 * @property {(webglContext: WebGL2RenderingContext, segments: number) => GeraWebGL.Geometry} factory
 * - Geometry factory for the selected type.
 */

/**
 * Creates a box geometry for the demo.
 *
 * @param {WebGL2RenderingContext} webglContext - WebGL context.
 * @param {number} segments                     - Demo segments value.
 * @returns {GeraWebGL.Geometries.BoxGeometry}  - Created geometry.
 */
function createBoxGeometry(webglContext, segments) {
    return new GeraWebGL.Geometries.BoxGeometry(webglContext, {
        width          : 1.4,
        height         : 1.4,
        depth          : 1.4,
        widthSegments  : segments,
        heightSegments : segments,
        depthSegments  : segments
    });
}

/**
 * Creates a plane geometry for the demo.
 *
 * @param {WebGL2RenderingContext} webglContext  - WebGL context.
 * @param {number} segments                      - Demo segments value.
 * @returns {GeraWebGL.Geometries.PlaneGeometry} - Created geometry.
 */
function createPlaneGeometry(webglContext, segments) {
    return new GeraWebGL.Geometries.PlaneGeometry(webglContext, {
        width          : 2.0,
        height         : 2.0,
        widthSegments  : segments,
        heightSegments : segments
    });
}

/**
 * Creates a sphere geometry for the demo (slightly elongated to show `width/height/depth` support).
 *
 * @param {WebGL2RenderingContext} webglContext   - WebGL context.
 * @param {number} segments                       - Demo segments value.
 * @returns {GeraWebGL.Geometries.SphereGeometry} - Created geometry.
 */
function createSphereGeometry(webglContext, segments) {
    const widthSegments  = clamp(segments * 2, 3, 256);
    const heightSegments = clamp(segments, 2, 256);
    const diameter       = 1.6;

    return new GeraWebGL.Geometries.SphereGeometry(webglContext, {
        width          : diameter,
        height         : diameter,
        depth          : diameter,
        widthSegments  : widthSegments,
        heightSegments : heightSegments
    });
}

/**
 * Creates a torus geometry for the demo.
 *
 * @param {WebGL2RenderingContext} webglContext  - WebGL context.
 * @param {number} segments                      - Demo segments value.
 * @returns {GeraWebGL.Geometries.TorusGeometry} - Created geometry.
 */
function createTorusGeometry(webglContext, segments) {
    const tubularSegments = clamp(segments * 2, 3, 512);
    const radialSegments  = clamp(segments, 3, 256);

    return new GeraWebGL.Geometries.TorusGeometry(webglContext, {
        width           : 1.8,
        height          : 0.6,
        tubularSegments : tubularSegments,
        radialSegments  : radialSegments
    });
}

/**
 * Creates a cone geometry for the demo.
 *
 * @param {WebGL2RenderingContext} webglContext - WebGL context.
 * @param {number} segments                     - Demo segments value.
 * @returns {GeraWebGL.Geometries.ConeGeometry} - Created geometry.
 */
function createConeGeometry(webglContext, segments) {
    const radialSegments = clamp(segments * 2, 3, 512);
    const heightSegments = clamp(Math.floor(segments / 2), 1, 256);
    const baseDiameter   = 1.5;

    return new GeraWebGL.Geometries.ConeGeometry(webglContext, {
        width          : baseDiameter,
        depth          : baseDiameter,
        height         : 2.0,
        radialSegments : radialSegments,
        heightSegments : heightSegments,
        capped         : true
    });
}

/**
 * Creates a pyramid geometry for the demo.
 *
 * @param {WebGL2RenderingContext} webglContext    - WebGL context.
 * @param {number} segments                        - Demo segments value.
 * @returns {GeraWebGL.Geometries.PyramidGeometry} - Created geometry.
 */
function createPyramidGeometry(webglContext, segments) {
    const baseSegments   = clamp(Math.floor(segments / 2), 1, 128);
    const heightSegments = clamp(Math.floor(segments / 2), 1, 128);

    return new GeraWebGL.Geometries.PyramidGeometry(webglContext, {
        width          : 1.8,
        depth          : 1.2,
        height         : 2.0,
        widthSegments  : baseSegments,
        depthSegments  : baseSegments,
        heightSegments : heightSegments,
        capped         : true
    });
}

/**
 * Demo geometry registry.
 *
 * @type {Record<string, DemoGeometryConfig>}
 */
const DEMO_GEOMETRIES = {
    box : {
        minSegments : 1,
        maxSegments : 24,
        factory     : createBoxGeometry
    },
    plane : {
        minSegments : 1,
        maxSegments : 96,
        factory     : createPlaneGeometry
    },
    sphere : {
        minSegments : 2,
        maxSegments : 64,
        factory     : createSphereGeometry
    },
    torus : {
        minSegments : 3,
        maxSegments : 64,
        factory     : createTorusGeometry
    },
    cone : {
        minSegments : 2,
        maxSegments : 64,
        factory     : createConeGeometry
    },
    pyramid : {
        minSegments : 2,
        maxSegments : 64,
        factory     : createPyramidGeometry
    }
};

/**
 * Demo application, that allows switching geometry types and changing segmentation.
 */
class GeometriesDemoApp {

    /**
     * Engine instance used by the demo.
     *
     * @type {GeraWebGL.Engine}
     * @private
     */
    #engine;

    /**
     * Orbit controls for camera navigation.
     *
     * @type {GeraWebGL.Controls.OrbitControls}
     * @private
     */
    #orbitControls;

    /**
     * Mesh instance currently displayed in the scene.
     *
     * @type {GeraWebGL.Mesh}
     * @private
     */
    #mesh;

    /**
     * Shared material instance used by the demo.
     *
     * @type {GeraWebGL.Materials.NormalMaterial}
     * @private
     */
    #sharedNormalMaterial;

    /**
     * Geometry select element.
     *
     * @type {HTMLSelectElement}
     * @private
     */
    #geometrySelect;

    /**
     * Segments slider element.
     *
     * @type {HTMLInputElement}
     * @private
     */
    #segmentsSlider;

    /**
     * Segments value element.
     *
     * @type {HTMLElement}
     * @private
     */
    #segmentsValueElement;

    /**
     * Zoom slider element.
     *
     * @type {HTMLInputElement}
     * @private
     */
    #zoomSlider;

    /**
     * Zoom value element.
     *
     * @type {HTMLElement}
     * @private
     */
    #zoomValueElement;

    /**
     * Wireframe toggle button.
     *
     * @type {HTMLButtonElement}
     * @private
     */
    #wireframeToggleButton;

    /**
     * FPS counter instance.
     *
     * @type {GeraWebGL.Debug.FpsCounter}
     * @private
     */
    #fpsCounter;

    /**
     * Populates geometry select with available demo geometries.
     *
     * @private
     */
    #populateGeometrySelectOptions() {
        if (!this.#geometrySelect) {
            return;
        }

        this.#geometrySelect.textContent = '';

        for (const [type] of Object.entries(DEMO_GEOMETRIES)) {
            const option       = document.createElement('option');
            option.value       = type;
            option.textContent = `Geometry: ${type.charAt(FIRST_CHAR_INDEX).toUpperCase() + type.slice(REST_SLICE_START_INDEX)}`;
            this.#geometrySelect.appendChild(option);
        }
    }

    /**
     * Whether wireframe mode is enabled.
     *
     * @type {boolean}
     * @private
     */
    #isWireframeEnabled = false;

    /**
     * Whether a mesh rebuild is scheduled.
     *
     * @type {boolean}
     * @private
     */
    #isMeshRebuildRequested = false;

    /**
     * Creates the demo app and initializes the scene.
     */
    constructor() {
        const canvas = GeometriesDemoApp.#getCanvas();
        this.#engine = GeraWebGL.createEngine(canvas);
        this.#engine.webglRenderingContext.clearColor(CLEAR_COLOR[0], CLEAR_COLOR[1], CLEAR_COLOR[2], 1.0);
        this.#setupCamera(canvas);
        this.#bindUI();
        this.#setupScene();

        this.#fpsCounter = new GeraWebGL.Debug.FpsCounter({
            updateIntervalMs : FPS_COUNTER_UPDATE_INTERVAL_MS,
            smoothingFactor  : FPS_COUNTER_SMOOTHING_FACTOR,
            goodFpsThreshold : FPS_COUNTER_GOOD_FPS_THRESHOLD,
            okFpsThreshold   : FPS_COUNTER_OK_FPS_THRESHOLD
        });

        document.body.appendChild(this.#fpsCounter.domElement);
    }

    /**
     * Starts the requestAnimationFrame render loop.
     */
    start() {
        this.#engine.start((deltaTimeSeconds) => {
            this.#onFrame(deltaTimeSeconds);
        });
    }

    /**
     * Per-frame update callback.
     *
     * @param {number} deltaTimeSeconds - Delta time since last frame.
     * @private
     */
    #onFrame(deltaTimeSeconds) {
        this.#fpsCounter.update(deltaTimeSeconds);

        if (this.#orbitControls) {
            this.#orbitControls.update(deltaTimeSeconds);
        }

        if (this.#isMeshRebuildRequested) {
            this.#isMeshRebuildRequested = false;
            this.#replaceMesh(true);
        }
    }

    /**
     * Sets up camera and orbit controls.
     *
     * @param {HTMLCanvasElement} canvas - Target canvas.
     * @private
     */
    #setupCamera(canvas) {
        const camera = this.#engine.camera;
        camera.position.set(0.0, 0.0, ORBIT_DISTANCE);

        this.#orbitControls = new GeraWebGL.Controls.OrbitControls(camera, canvas, {
            distance      : ORBIT_DISTANCE,
            minDistance   : ORBIT_MIN_DISTANCE,
            maxDistance   : ORBIT_MAX_DISTANCE,
            rotationSpeed : 1.0,
            zoomSpeed     : 1.0
        });

        this.#orbitControls.update();
    }

    /**
     * Handles zoom slider input and applies it to `OrbitControls` distance.
     *
     * @private
     */
    #onZoomSliderChanged() {
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

        const distance         = this.#orbitControls.distance;
        const zoomUiValue      = ORBIT_MIN_DISTANCE + ORBIT_MAX_DISTANCE - distance;
        this.#zoomSlider.value = String(zoomUiValue);
        this.#zoomValueElement.textContent = zoomUiValue.toFixed(ZOOM_LABEL_FRACTION_DIGITS);
    }

    /**
     * Initializes scene content: `mesh + shared` resources.
     *
     * @private
     */
    #setupScene() {
        const webglContext         = this.#engine.webglRenderingContext;
        this.#sharedNormalMaterial = new GeraWebGL.Materials.NormalMaterial(webglContext);
        this.#applyWireframeStateToSharedMaterial();
        this.#mesh = this.#createMesh();
        this.#engine.scene.add(this.#mesh);
    }

    /**
     * Replaces the current mesh instance.
     *
     * @param {boolean} preserveTransform - Whether to preserve previous mesh transform.
     * @private
     */
    #replaceMesh(preserveTransform) {
        const previousMesh = this.#mesh;

        if (!previousMesh) {
            this.#mesh = this.#createMesh();
            this.#engine.scene.add(this.#mesh);
            return;
        }

        const transformSnapshot = preserveTransform
            ? GeometriesDemoApp.#captureTransform(previousMesh)
            : null;

        this.#engine.scene.remove(previousMesh);
        previousMesh.dispose();
        this.#mesh = this.#createMesh();

        if (transformSnapshot) {
            GeometriesDemoApp.#applyTransform(this.#mesh, transformSnapshot);
        }

        this.#engine.scene.add(this.#mesh);
    }

    /**
     * Creates a mesh based on current UI state.
     *
     * @returns {GeraWebGL.Mesh} - New mesh instance.
     * @private
     */
    #createMesh() {
        const webglContext = this.#engine.webglRenderingContext;
        const type         = this.#geometrySelect.value;
        const segments     = Number(this.#segmentsSlider.value);

        let config = DEMO_GEOMETRIES[type];

        if (!config) {
            const firstType = Object.keys(DEMO_GEOMETRIES)[0];
            config = DEMO_GEOMETRIES[firstType];

            if (config && this.#geometrySelect) {
                this.#geometrySelect.value = firstType;
            }
        }

        if (!config) {
            throw new RangeError('Geometries demo internal error: `DEMO_GEOMETRIES` registry is empty.');
        }

        const geometry = config.factory(webglContext, segments);

        return new GeraWebGL.Mesh(geometry, this.#sharedNormalMaterial, {
            ownsGeometry: true,
            ownsMaterial: false
        });
    }

    /**
     * Applies current wireframe state to the shared material.
     *
     * @private
     */
    #applyWireframeStateToSharedMaterial() {
        this.#sharedNormalMaterial.setWireframeEnabled(this.#isWireframeEnabled);
    }

    /**
     * Updates wireframe button label.
     *
     * @private
     */
    #updateWireframeButtonLabel() {
        this.#wireframeToggleButton.textContent = WIREFRAME_BUTTON_LABEL_PREFIX + (this.#isWireframeEnabled ? WIREFRAME_BUTTON_LABEL_ON : WIREFRAME_BUTTON_LABEL_OFF);
    }

    /**
     * Updates segments UI label.
     *
     * @private
     */
    #updateSegmentsValueLabel() {
        this.#segmentsValueElement.textContent = String(this.#segmentsSlider.value);
    }

    /**
     * Applies geometry-specific segment limits to the slider.
     *
     * @param {string} type - Geometry type string.
     * @private
     */
    #syncSegmentsSliderLimits(type) {
        let config = DEMO_GEOMETRIES[type];

        if (!config) {
            const firstType = Object.keys(DEMO_GEOMETRIES)[0];
            config = DEMO_GEOMETRIES[firstType];

            if (config && this.#geometrySelect) {
                this.#geometrySelect.value = firstType;
            }
        }

        if (!config) {
            throw new RangeError('Geometries demo internal error: `DEMO_GEOMETRIES` registry is empty.');
        }

        const previousValue      = Number(this.#segmentsSlider.value);
        this.#segmentsSlider.min = String(config.minSegments);
        this.#segmentsSlider.max = String(config.maxSegments);

        const clampedValue = clamp(previousValue, config.minSegments, config.maxSegments);
        this.#segmentsSlider.value = String(clampedValue);
        this.#updateSegmentsValueLabel();
    }

    /**
     * Schedules a mesh rebuild on the next animation frame.
     *
     * @private
     */
    #requestMeshRebuild() {
        this.#isMeshRebuildRequested = true;
    }

    /**
     * Binds UI elements to application state.
     *
     * @private
     */
    #bindUI() {
        this.#geometrySelect        = document.getElementById(GEOMETRY_SELECT_ID);
        this.#segmentsSlider        = document.getElementById(SEGMENTS_SLIDER_ID);
        this.#segmentsValueElement  = document.getElementById(SEGMENTS_VALUE_ELEMENT_ID);
        this.#wireframeToggleButton = document.getElementById(WIREFRAME_TOGGLE_BUTTON_ID);
        this.#zoomSlider            = document.getElementById(ZOOM_SLIDER_ID);
        this.#zoomValueElement      = document.getElementById(ZOOM_VALUE_ELEMENT_ID);

        if (!(this.#geometrySelect instanceof HTMLSelectElement)) {
            throw new Error(`Select element with id ${GEOMETRY_SELECT_ID} - not found.`);
        }

        if (!(this.#segmentsSlider instanceof HTMLInputElement)) {
            throw new Error(`Range slider with id ${SEGMENTS_SLIDER_ID} - not found.`);
        }

        if (!(this.#wireframeToggleButton instanceof HTMLButtonElement)) {
            throw new Error(`Button with id ${WIREFRAME_TOGGLE_BUTTON_ID} - not found.`);
        }

        if (!(this.#zoomSlider instanceof HTMLInputElement)) {
            throw new Error(`Range slider with id ${ZOOM_SLIDER_ID} - not found.`);
        }

        if (!(this.#segmentsValueElement instanceof HTMLElement)) {
            throw new Error(`Element with id ${SEGMENTS_VALUE_ELEMENT_ID} - not found.`);
        }

        if (!(this.#zoomValueElement instanceof HTMLElement)) {
            throw new Error(`Element with id ${ZOOM_VALUE_ELEMENT_ID} - not found.`);
        }

        this.#populateGeometrySelectOptions();
        this.#geometrySelect.value  = DEFAULT_GEOMETRY_TYPE;

        if (!DEMO_GEOMETRIES[this.#geometrySelect.value]) {
            this.#geometrySelect.selectedIndex = 0;
        }

        this.#segmentsSlider.value = String(DEFAULT_SEGMENTS);
        this.#syncSegmentsSliderLimits(this.#geometrySelect.value);
        this.#updateSegmentsValueLabel();
        this.#updateWireframeButtonLabel();
        this.#syncZoomUIFromControls();

        this.#geometrySelect.addEventListener('change', () => {
            this.#syncSegmentsSliderLimits(this.#geometrySelect.value);
            this.#requestMeshRebuild();
        });

        this.#segmentsSlider.addEventListener('input', () => {
            this.#updateSegmentsValueLabel();
            this.#requestMeshRebuild();
        });

        this.#wireframeToggleButton.addEventListener('click', () => {
            this.#isWireframeEnabled = !this.#isWireframeEnabled;
            this.#applyWireframeStateToSharedMaterial();
            this.#updateWireframeButtonLabel();
        });

        this.#zoomSlider.addEventListener('input', () => {
            this.#onZoomSliderChanged();
        });
    }

    /**
     * Returns canvas element instance.
     *
     * @returns {HTMLCanvasElement} - Canvas element used by the demo.
     * @private
     */
    static #getCanvas() {
        const canvas = document.getElementById(CANVAS_ELEMENT_ID);

        if (!canvas) {
            throw new Error('Geometries demo: canvas element not found.');
        }

        return canvas;
    }

    static #captureTransform(object) {
        return {
            position : { x : object.position.x, y : object.position.y, z : object.position.z },
            rotation : { x : object.rotation.x, y : object.rotation.y, z : object.rotation.z },
            scale    : { x : object.scale.x,    y : object.scale.y,    z : object.scale.z }
        };
    }

    static #applyTransform(object, snapshot) {
        object.position.set(snapshot.position.x, snapshot.position.y, snapshot.position.z);
        object.rotation.set(snapshot.rotation.x, snapshot.rotation.y, snapshot.rotation.z);
        object.scale.set(snapshot.scale.x, snapshot.scale.y, snapshot.scale.z);
    }
}

const app = new GeometriesDemoApp();
app.start();

import { WebGLContext }        from '../webgl-context.js';
import { Renderer }            from '../render/renderer.js';
import { Scene }               from '../scene/scene.js';
import { Camera }              from '../scene/camera.js';
import { PerspectiveCamera }   from '../scene/perspective-camera.js';
import { Mesh }                from '../scene/mesh.js';
import { BoxGeometry }         from '../geometry/box-geometry.js';
import { Material }            from '../material/material.js';
import { VertexColorMaterial } from '../material/vertex-color-material.js';

/**
 * Default camera vertical field of view, in radians.
 * Used when `EngineOptions.fieldOfViewRadians` is not provided.
 *
 * @type {number}
 */
const DEFAULT_FIELD_OF_VIEW_RADIANS = Math.PI / 4;

/**
 * Default near clipping plane distance.
 * Used when `EngineOptions.near` is not provided.
 *
 * @type {number}
 */
const DEFAULT_NEAR = 0.1;

/**
 * Default far clipping plane distance.
 * Used when `EngineOptions.far` is not provided.
 *
 * @type {number}
 */
const DEFAULT_FAR = 100.0;

/**
 * Default initial camera position on the Z axis.
 * Used when `EngineOptions.initialCameraZ` is not provided.
 *
 * @type {number}
 */
const DEFAULT_INITIAL_CAMERA_Z = 5.0;

/**
 * Converts milliseconds to seconds. Used to compute time values.
 *
 * @type {number}
 */
const MILLISECONDS_TO_SECONDS = 0.001;

/**
 * Default box size used by `Engine.createBoxMesh()`.
 * Used when `createBoxMesh options.size` is not provided.
 *
 * @type {number}
 */
const DEFAULT_BOX_SIZE = 1.0;

/**
 * Minimal allowed box size for `Engine.createBoxMesh()`.
 *
 * @type {number}
 */
const MIN_BOX_SIZE = 0;

/**
 * `requestAnimationFrame` id reset value.
 * Zero means - no frame scheduled.
 *
 * @type {number}
 */
const ENGINE_ANIMATION_FRAME_ID_RESET_VALUE = 0;

/**
 * Engine time fields reset/uninitialized value (seconds).
 * Used as a sentinel to detect the first frame.
 *
 * @type {number}
 */
const ENGINE_TIME_SECONDS_RESET_VALUE = 0;

/**
 * Initial camera aspect ratio used during `Engine` construction.
 * Real aspect ratio is updated on first render based on canvas size.
 *
 * @type {number}
 */
const INITIAL_CAMERA_ASPECT_RATIO = 1.0;

/**
 * Exclusive lower bound for numeric parameters.
 *
 * @type {number}
 */
const MIN_EXCLUSIVE_NUMBER = 0;

/**
 * Options used by `createEngine` and `Engine`.
 *
 * @typedef {Object} EngineOptions
 * @property {number}  [fieldOfViewRadians=Math.PI / 4] - Vertical field of view in radians.
 * @property {number}  [near = 0.1]                     - Near clipping plane.
 * @property {number}  [far  = 100.0]                   - Far clipping plane.
 * @property {number}  [initialCameraZ = 5.0]           - Initial camera position on the Z axis.
 * @property {boolean} [fitToWindow    = false]         - When true, the engine will render using `window.innerWidth/innerHeight` as the canvas size source.
 */

/**
 * Per-frame callback invoked by `Engine.start`.
 *
 * @callback EngineFrameCallback
 * @param {number} deltaTimeSeconds - Time passed since previous frame, in seconds.
 * @param {number} timeSeconds      - Time since engine start, in seconds.
 * @param {Engine} engine           - Current engine instance.
 */

/**
 * Options used by `Engine.createBoxMesh`.
 *
 * Ownership rule: if `material` is provided by the user, created `Mesh` must NOT own it.
 *
 * @typedef {Object} CreateBoxMeshOptions
 * @property {number}   [size = 1.0] - Edge length of the box.
 * @property {Material} [material]   - Optional material instance (shared).
 */

/**
 * High-level convenience wrapper, that bundles the most common building blocks.
 */
export class Engine {

    /**
     * WebGL context wrapper used by the engine.
     *
     * @type {WebGLContext}
     * @private
     */
    #contextWrapper;

    /**
     * Renderer instance used to draw the scene.
     *
     * @type {Renderer}
     * @private
     */
    #renderer;

    /**
     * Root scene node used by the engine.
     *
     * @type {Scene}
     * @private
     */
    #scene;

    /**
     * Active camera used by the engine renderer.
     *
     * @type {Camera}
     * @private
     */
    #camera;

    /**
     * When true, the engine uses the browser window size as the render target size source.
     * This is passed to the renderer via resize options on each frame.
     *
     * @type {boolean}
     * @private
     */
    #fitToWindow;

    /**
     * Indicates whether the `requestAnimationFrame` loop is currently running.
     *
     * @type {boolean}
     * @private
     */
    #isRunning = false;

    /**
     * Stores the active requestAnimationFrame id.
     * A reset value (usually `0`) indicates, that no frame is currently scheduled.
     *
     * @type {number}
     * @private
     */
    #requestAnimationFrameId = ENGINE_ANIMATION_FRAME_ID_RESET_VALUE;

    /**
     * Timestamp (in seconds) of the previous frame.
     * Used to compute deltaTimeSeconds.
     *
     * @type {number}
     * @private
     */
    #lastTimeSeconds = ENGINE_TIME_SECONDS_RESET_VALUE;

    /**
     * Start timestamp (in seconds) of the engine loop.
     * Used to compute `engineTimeSeconds`.
     *
     * @type {number}
     * @private
     */
    #startTimeSeconds = ENGINE_TIME_SECONDS_RESET_VALUE;

    /**
     * Optional per-frame callback invoked by `Engine.start(callback)`.
     *
     * @type {EngineFrameCallback | null}
     * @private
     */
    #frameCallback = null;

    /**
     * Cached resize options object passed to the renderer.
     * Reused between frames to avoid unnecessary allocations.
     *
     * @type {{ fitToWindow: boolean }}
     * @private
     */
    #resizeOptions = { fitToWindow: false };

    /**
     * @param {HTMLCanvasElement} canvas - Canvas used for rendering.
     * @param {EngineOptions} [options]  - Engine options.
     */
    constructor(canvas, options = {}) {
        if (!(canvas instanceof HTMLCanvasElement)) {
            throw new TypeError('Engine expects an HTMLCanvasElement.');
        }

        if (options === null || typeof options !== 'object' || Array.isArray(options)) {
            throw new TypeError('Engine expects an options object (plain object).');
        }

        const {
            fieldOfViewRadians = DEFAULT_FIELD_OF_VIEW_RADIANS,
            near               = DEFAULT_NEAR,
            far                = DEFAULT_FAR,
            initialCameraZ     = DEFAULT_INITIAL_CAMERA_Z,
            fitToWindow        = false
        } = options;

        if (typeof fieldOfViewRadians !== 'number' || fieldOfViewRadians <= MIN_EXCLUSIVE_NUMBER) {
            throw new RangeError('Engine option `fieldOfViewRadians` must be a positive number.');
        }

        if (typeof near   !== 'number'
            || typeof far !== 'number'
            || near <= MIN_EXCLUSIVE_NUMBER
            || far  <= MIN_EXCLUSIVE_NUMBER
            || near >= far) {
            throw new RangeError('Engine options `near` and `far` must be positive numbers and near < far.');
        }

        if (typeof initialCameraZ !== 'number') {
            throw new TypeError('Engine option `initialCameraZ` must be a number.');
        }

        if (typeof fitToWindow !== 'boolean') {
            throw new TypeError('Engine option `fitToWindow` must be a boolean.');
        }

        this.#fitToWindow       = fitToWindow;
        this.#contextWrapper    = new WebGLContext(canvas);
        this.#renderer          = new Renderer(this.#contextWrapper);
        this.#scene             = new Scene();
        this.#camera            = new PerspectiveCamera(fieldOfViewRadians, INITIAL_CAMERA_ASPECT_RATIO, near, far); // default camera type
        this.#camera.position.z = initialCameraZ;
    }

    /** @returns {WebGLContext} */
    get context() {
        return this.#contextWrapper;
    }

    /** @returns {WebGL2RenderingContext} */
    get webglRenderingContext() {
        return this.#contextWrapper.context;
    }

    /** @returns {Renderer} */
    get renderer() {
        return this.#renderer;
    }

    /** @returns {Scene} */
    get scene() {
        return this.#scene;
    }

    /** @returns {Camera} */
    get camera() {
        return this.#camera;
    }

    /**
     * Creates a box mesh using: `BoxGeometry` + `VertexColorMaterial` by default.
     *
     * Ownership rules: geometry is created internally => mesh owns geometry.
     * Material: if not provided then Mesh owns created `VertexColorMaterial`,
     * if provided then Mesh does NOT own the material (shared user resource).
     *
     * @param {CreateBoxMeshOptions} [options] - Box mesh options.
     * @returns {Mesh}
     */
    createBoxMesh(options = {}) {
        if (options === null || typeof options !== 'object' || Array.isArray(options)) {
            throw new TypeError('`Engine.createBoxMesh` expects an options object (plain object).');
        }

        const { size = DEFAULT_BOX_SIZE, material } = options;

        if (typeof size !== 'number' || size <= MIN_BOX_SIZE) {
            throw new RangeError('`Engine.createBoxMesh` option `size` must be a positive number.');
        }

        if (material !== undefined && !(material instanceof Material)) {
            throw new TypeError('`Engine.createBoxMesh` option `material` must be a `Material` instance.');
        }

        const geometry           = new BoxGeometry(this.webglRenderingContext, {size});
        const isUserMaterial     = material !== undefined;
        const usedMaterial       = isUserMaterial ? material : new VertexColorMaterial(this.webglRenderingContext);
        const meshOwnershipFlags = { ownsGeometry: true, ownsMaterial: !isUserMaterial };
        return new Mesh(geometry, usedMaterial, meshOwnershipFlags);
    }

    /**
     * Renders a single frame.
     */
    render() {
        this.#resizeOptions.fitToWindow = this.#fitToWindow;
        this.#renderer.render(this.#scene, this.#camera, this.#resizeOptions);
    }

    /**
     * Starts the `requestAnimationFrame` loop.
     *
     * @param {EngineFrameCallback} [frameCallback] - Optional per-frame callback.
     */
    start(frameCallback) {
        if (frameCallback !== undefined && typeof frameCallback !== 'function') {
            throw new TypeError('Engine.start expects a function callback or undefined.');
        }

        if (this.#isRunning) {
            return;
        }

        this.#isRunning               = true;
        this.#frameCallback           = frameCallback || null;
        this.#lastTimeSeconds         = ENGINE_TIME_SECONDS_RESET_VALUE;
        this.#startTimeSeconds        = ENGINE_TIME_SECONDS_RESET_VALUE;
        this.#requestAnimationFrameId = window.requestAnimationFrame((timeMs) => this.#renderFrame(timeMs));
    }

    /**
     * Stops the `requestAnimationFrame` loop.
     */
    stop() {
        if (!this.#isRunning) {
            return;
        }

        window.cancelAnimationFrame(this.#requestAnimationFrameId);
        this.#requestAnimationFrameId = ENGINE_ANIMATION_FRAME_ID_RESET_VALUE;
        this.#isRunning               = false;
        this.#frameCallback           = null;
    }

    /**
     * Sets the active camera used by the engine renderer.
     *
     * @param {Camera} camera - New active camera instance.
     */
    setCamera(camera) {
        if (!(camera instanceof Camera)) {
            throw new TypeError('`Engine.setCamera` expects a `Camera` instance (including the derived types).');
        }

        this.#camera = camera;
    }

    /**
     * @param {number} timeMs - `requestAnimationFrame` timestamp in milliseconds.
     * @private
     */
    #renderFrame(timeMs) {
        const timeSeconds = timeMs * MILLISECONDS_TO_SECONDS;

        if (this.#startTimeSeconds === ENGINE_TIME_SECONDS_RESET_VALUE) {
            this.#startTimeSeconds = timeSeconds;
            this.#lastTimeSeconds  = timeSeconds;
        }

        const engineTimeSeconds = timeSeconds - this.#startTimeSeconds;
        const deltaTimeSeconds  = timeSeconds - this.#lastTimeSeconds;
        this.#lastTimeSeconds   = timeSeconds;

        if (this.#frameCallback) {
            this.#frameCallback(deltaTimeSeconds, engineTimeSeconds, this);
        }

        if (!this.#isRunning) {
            return;
        }

        this.render();
        this.#requestAnimationFrameId = window.requestAnimationFrame((nextTimeMs) => this.#renderFrame(nextTimeMs));
    }
}

/**
 * Factory function for `Engine`.
 *
 * @param {HTMLCanvasElement} canvas - Canvas used for rendering.
 * @param {EngineOptions} [options]  - Engine options.
 * @returns {Engine}
 */
export function createEngine(canvas, options) {
    return new Engine(canvas, options);
}

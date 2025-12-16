import { WebGLContext }      from '../webgl-context.js';
import { Renderer }          from '../render/renderer.js';
import { Scene }             from '../scene/scene.js';
import { PerspectiveCamera } from '../scene/camera.js';
import { Mesh }              from '../scene/mesh.js';
import { BoxGeometry }       from '../geometry/box-geometry.js';
import { BasicMaterial }     from '../material/basic-material.js';

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
 * requestAnimationFrame id reset value.
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
 * Initial camera aspect ratio used during Engine construction.
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
 * Options used by Engine.createBoxMesh.
 *
 * @typedef {Object} CreateBoxMeshOptions
 * @property {number} [size = 1.0]      - Edge length of the box.
 * @property {BasicMaterial} [material] - Optional material instance.
 */

/**
 * High-level convenience wrapper that bundles the most common building blocks.
 */
export class Engine {

    /**
     * Wrapper around the underlying WebGL2 rendering context.
     * Owns resize logic and provides access to raw `WebGL2RenderingContext` via `.context`.
     *
     * @type {WebGLContext}
     * @private
     */
    #contextWrapper;

    /**
     * High-level scene renderer.
     * Responsible for drawing the current scene using the current camera.
     *
     * @type {Renderer}
     * @private
     */
    #renderer;

    /**
     * Root scene graph node.
     *
     * @type {Scene}
     * @private
     */
    #scene;

    /**
     * Main camera used by the engine render loop.
     *
     * @type {PerspectiveCamera}
     * @private
     */
    #camera;

    /**
     * When true, the engine will resize the canvas to match the browser window.
     *
     * @type {boolean}
     * @private
     */
    #fitToWindow;

    /**
     * Indicates whether the requestAnimationFrame loop is running.
     *
     * @type {boolean}
     * @private
     */
    #isRunning = false;

    /**
     * Current requestAnimationFrame id.
     * Reset value means "not scheduled".
     *
     * @type {number}
     * @private
     */
    #requestAnimationFrameId = ENGINE_ANIMATION_FRAME_ID_RESET_VALUE;

    /**
     * Previous frame timestamp in seconds (performance.now() / 1000).
     * Reset value means "not initialized".
     *
     * @type {number}
     * @private
     */
    #lastTimeSeconds = ENGINE_TIME_SECONDS_RESET_VALUE;

    /**
     * First frame timestamp in seconds.
     * Used to compute time since engine start.
     *
     * @type {number}
     * @private
     */
    #startTimeSeconds = ENGINE_TIME_SECONDS_RESET_VALUE;

    /**
     * Optional callback executed every frame.
     *
     * @type {EngineFrameCallback | null}
     * @private
     */
    #frameCallback = null;

    /**
     * Reused resize options object passed to `Renderer.render()`.
     * Avoids allocating a new object on every frame.
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
            throw new RangeError('Engine options "near" and "far" must be positive numbers and near < far.');
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
        this.#camera            = new PerspectiveCamera(fieldOfViewRadians, INITIAL_CAMERA_ASPECT_RATIO, near, far);
        this.#camera.position.z = initialCameraZ;
    }

    /**
     * @returns {WebGLContext}
     */
    get context() {
        return this.#contextWrapper;
    }

    /**
     * Returns the underlying WebGL2RenderingContext.
     *
     * @returns {WebGL2RenderingContext}
     */
    get webglRenderingContext() {
        return this.#contextWrapper.context;
    }

    /**
     * @returns {Renderer}
     */
    get renderer() {
        return this.#renderer;
    }

    /**
     * @returns {Scene}
     */
    get scene() {
        return this.#scene;
    }

    /**
     * @returns {PerspectiveCamera}
     */
    get camera() {
        return this.#camera;
    }

    /**
     * Creates a box mesh using: BoxGeometry + BasicMaterial.
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

        if (material !== undefined && !(material instanceof BasicMaterial)) {
            throw new TypeError('`Engine.createBoxMesh` option `material` must be a `BasicMaterial` instance.');
        }

        const geometry     = new BoxGeometry(this.webglRenderingContext, size);
        const usedMaterial = material || new BasicMaterial(this.webglRenderingContext);
        return new Mesh(geometry, usedMaterial);
    }

    /**
     * Renders a single frame.
     */
    render() {
        this.#resizeOptions.fitToWindow = this.#fitToWindow;
        this.#renderer.render(this.#scene, this.#camera, this.#resizeOptions);
    }

    /**
     * Starts the requestAnimationFrame loop.
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
     * Stops the requestAnimationFrame loop.
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
     * @param {number} timeMs
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
 * Factory function for Engine.
 *
 * @param {HTMLCanvasElement} canvas - Canvas used for rendering.
 * @param {EngineOptions} [options]  - Engine options.
 * @returns {Engine}
 */
export function createEngine(canvas, options) {
    return new Engine(canvas, options);
}

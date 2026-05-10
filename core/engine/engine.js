import { WebGLContext }        from '../webgl-context.js';
import { Renderer }            from '../render/renderer.js';
import { Scene }               from '../scene/scene.js';
import { Camera }              from '../scene/camera.js';
import { PerspectiveCamera }   from '../scene/perspective-camera.js';
import { Mesh }                from '../scene/mesh.js';
import { BoxGeometry }         from '../geometry/box-geometry.js';
import { Material }            from '../material/material.js';
import { VertexColorMaterial } from '../material/vertex-color-material.js';
import * as EngineConstants    from '../constants/engine.js';

/**
 * Options used by `createEngine` and `Engine`.
 *
 * @typedef {Object} EngineOptions
 * @property {number}  [fieldOfViewRadians = Math.PI / 4] - Vertical field of view in radians.
 * @property {number}  [near = 0.1]                       - Near clipping plane.
 * @property {number}  [far  = 100.0]                     - Far clipping plane.
 * @property {number}  [initialCameraZ = 5.0]             - Initial camera position on the Z axis.
 * @property {boolean} [fitToWindow    = false]           - When true, the engine will render using `window.innerWidth/innerHeight` as the canvas size source.
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
 * High-level wrapper that creates and connects common rendering building blocks.
 *
 * Engine owns the WebGL context wrapper, renderer, scene and default camera.
 * It also provides a small render loop based on `requestAnimationFrame`.
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
     * Stores the active `requestAnimationFrame` id.
     * A reset value (usually `0`) indicates, that no frame is currently scheduled.
     *
     * @type {number}
     * @private
     */
    #requestAnimationFrameId = EngineConstants.ENGINE_STATE_RESET.ANIMATION_FRAME_ID;

    /**
     * Timestamp (in seconds) of the previous frame.
     * Used to compute deltaTimeSeconds.
     *
     * @type {number}
     * @private
     */
    #lastTimeSeconds = EngineConstants.ENGINE_STATE_RESET.TIME_SECONDS;

    /**
     * Start timestamp (in seconds) of the engine loop.
     * Used to compute `engineTimeSeconds`.
     *
     * @type {number}
     * @private
     */
    #startTimeSeconds = EngineConstants.ENGINE_STATE_RESET.TIME_SECONDS;

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
    #resizeOptions = { fitToWindow: EngineConstants.ENGINE_CANVAS_DEFAULTS.FIT_TO_WINDOW };

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
            fieldOfViewRadians = EngineConstants.ENGINE_CAMERA_DEFAULTS.FIELD_OF_VIEW_RADIANS,
            near               = EngineConstants.ENGINE_CAMERA_DEFAULTS.NEAR_CLIPPING_PLANE,
            far                = EngineConstants.ENGINE_CAMERA_DEFAULTS.FAR_CLIPPING_PLANE,
            initialCameraZ     = EngineConstants.ENGINE_CAMERA_DEFAULTS.INITIAL_CAMERA_Z,
            fitToWindow        = EngineConstants.ENGINE_CANVAS_DEFAULTS.FIT_TO_WINDOW
        } = options;

        if (typeof fieldOfViewRadians !== 'number' || fieldOfViewRadians <= EngineConstants.ENGINE_VALIDATION_LIMITS.MIN_NUMBER_EXCLUSIVE) {
            throw new RangeError('Engine option `fieldOfViewRadians` must be a positive number.');
        }

        if (typeof near   !== 'number'
            || typeof far !== 'number'
            || near <= EngineConstants.ENGINE_VALIDATION_LIMITS.MIN_NUMBER_EXCLUSIVE
            || far  <= EngineConstants.ENGINE_VALIDATION_LIMITS.MIN_NUMBER_EXCLUSIVE
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
        this.#camera            = new PerspectiveCamera(fieldOfViewRadians, EngineConstants.ENGINE_CAMERA_DEFAULTS.INITIAL_CAMERA_ASPECT_RATIO, near, far); // default camera type
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

        const { size = EngineConstants.ENGINE_HELPER_DEFAULTS.BOX_SIZE, material } = options;

        if (typeof size !== 'number' || size <= EngineConstants.ENGINE_VALIDATION_LIMITS.MIN_BOX_SIZE_EXCLUSIVE) {
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
        this.#lastTimeSeconds         = EngineConstants.ENGINE_STATE_RESET.TIME_SECONDS;
        this.#startTimeSeconds        = EngineConstants.ENGINE_STATE_RESET.TIME_SECONDS;
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
        this.#requestAnimationFrameId = EngineConstants.ENGINE_STATE_RESET.ANIMATION_FRAME_ID;
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
        const timeSeconds = timeMs * EngineConstants.ENGINE_TIME.MILLISECONDS_TO_SECONDS;

        if (this.#startTimeSeconds === EngineConstants.ENGINE_STATE_RESET.TIME_SECONDS) {
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

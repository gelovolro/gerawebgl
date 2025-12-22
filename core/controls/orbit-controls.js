import { Camera }  from '../scene/camera.js';
import { Vector3 } from '../math/vector3.js';

/**
 * Default target X component.
 *
 * @type {number}
 */
const DEFAULT_TARGET_X = 0.0;

/**
 * Default target Y component.
 *
 * @type {number}
 */
const DEFAULT_TARGET_Y = 0.0;

/**
 * Default target Z component.
 *
 * @type {number}
 */
const DEFAULT_TARGET_Z = 0.0;

/**
 * Default orbit distance from the target.
 *
 * @type {number}
 */
const DEFAULT_DISTANCE = 6.0;

/**
 * Default minimum orbit distance.
 *
 * @type {number}
 */
const DEFAULT_MIN_DISTANCE = 0.1;

/**
 * Default maximum orbit distance.
 *
 * @type {number}
 */
const DEFAULT_MAX_DISTANCE = 1000.0;

/**
 * Default azimuth (yaw) angle in radians.
 *
 * @type {number}
 */
const DEFAULT_AZIMUTH_RADIANS = 0.7;

/**
 * Default roll (Z rotation).
 *
 * @type {number}
 */
const DEFAULT_CAMERA_ROLL_RADIANS = 0.0;

/**
 * Default polar (pitch) angle in radians.
 *
 * @type {number}
 */
const DEFAULT_POLAR_RADIANS = -0.6;

/**
 * Minimum allowed polar angle (pitch) in radians.
 * This avoids reaching `+/- 90` degrees, where the controls become unstable.
 *
 * @type {number}
 */
const DEFAULT_MIN_POLAR_RADIANS = -1.5;

/**
 * Maximum allowed polar angle (pitch) in radians.
 * This avoids reaching `+/-` 90 degrees, where the controls become unstable.
 *
 * @type {number}
 */
const DEFAULT_MAX_POLAR_RADIANS = 1.5;

/**
 * Default rotation speed multiplier.
 *
 * @type {number}
 */
const DEFAULT_ROTATION_SPEED = 1.0;

/**
 * Default zoom speed multiplier.
 *
 * @type {number}
 */
const DEFAULT_ZOOM_SPEED = 1.0;

/**
 * The mouse button id used for rotation.
 *
 * @type {number}
 */
const ROTATE_BUTTON = 0;

/**
 * Radial rotation change per pixel, in radians.
 *
 * @type {number}
 */
const ROTATION_RADIANS_PER_PIXEL = 0.005;

/**
 * Wheel delta multiplier that is applied to the orbit distance.
 *
 * @type {number}
 */
const WHEEL_DISTANCE_MULTIPLIER = 0.01;

/**
 * `wheel` event listener options.
 * Using `passive: false` allows calling `event.preventDefault()` to stop page scrolling.
 *
 * @type {{ passive: boolean }}
 */
const WHEEL_LISTENER_OPTIONS = { passive: false };

/**
 * Pointer capture is used only for a single pointer at a time.
 * This value indicates that no pointer is currently captured.
 *
 * @type {number}
 */
const POINTER_ID_RESET_VALUE = -1;

/**
 * Orbit controller, that rotates a camera around a target point.
 *
 * Controls:
 * - Mouse left drag: orbit (yaw/pitch).
 * - Mouse wheel: zoom (distance).
 *
 * Notes:
 * - This class modifies camera local `position` and `rotation`.
 * - View matrix is still computed by the camera (inverse of its TRS transform).
 */
export class OrbitControls {

    /**
     * Controlled camera instance.
     *
     * @type {Camera}
     * @private
     */
    #camera;

    /**
     * DOM element that receives pointer/wheel input (usually the canvas).
     *
     * @type {HTMLElement}
     * @private
     */
    #element;

    /**
     * Orbit target (point in world space that the camera looks at).
     *
     * Changing the returned vector via `.target.x = ...` will automatically mark controls as dirty.
     *
     * @type {Vector3}
     * @private
     */
    #target;

    /**
     * Orbit distance from the target.
     *
     * @type {number}
     * @private
     */
    #distance;

    /**
     * Minimum orbit distance.
     *
     * @type {number}
     * @private
     */
    #minDistance;

    /**
     * Maximum orbit distance.
     *
     * @type {number}
     * @private
     */
    #maxDistance;

    /**
     * Azimuth angle (yaw) in radians.
     *
     * @type {number}
     * @private
     */
    #azimuthRadians;

    /**
     * Polar angle (pitch) in radians.
     *
     * @type {number}
     * @private
     */
    #polarRadians;

    /**
     * Minimum allowed polar angle (pitch) in radians.
     *
     * @type {number}
     * @private
     */
    #minPolarRadians;

    /**
     * Maximum allowed polar angle (pitch) in radians.
     *
     * @type {number}
     * @private
     */
    #maxPolarRadians;

    /**
     * Rotation speed multiplier.
     *
     * @type {number}
     * @private
     */
    #rotationSpeed;

    /**
     * Zoom speed multiplier.
     *
     * @type {number}
     * @private
     */
    #zoomSpeed;

    /**
     * True when controls need to recompute camera transform.
     *
     * @type {boolean}
     * @private
     */
    #isDirty = true;

    /**
     * Captured pointer id used during dragging.
     *
     * @type {number}
     * @private
     */
    #capturedPointerId = POINTER_ID_RESET_VALUE;

    /**
     * Previous pointer X position in client pixels.
     *
     * @type {number}
     * @private
     */
    #previousPointerX = 0;

    /**
     * Previous pointer Y position in client pixels.
     *
     * @type {number}
     * @private
     */
    #previousPointerY = 0;

    /**
     * Cached pointerdown handler reference used for `removeEventListener`.
     *
     * @type {function(PointerEvent): void}
     * @private
     */
    #onPointerDown;

    /**
     * Cached pointermove handler reference used for `removeEventListener`.
     *
     * @type {function(PointerEvent): void}
     * @private
     */
    #onPointerMove;

    /**
     * Cached pointerup handler reference used for `removeEventListener`.
     *
     * @type {function(PointerEvent): void}
     * @private
     */
    #onPointerUp;

    /**
     * Cached wheel handler reference used for `removeEventListener`.
     *
     * @type {function(WheelEvent): void}
     * @private
     */
    #onWheel;

    /**
     * Cached contextmenu handler reference used for `removeEventListener`.
     *
     * @type {function(MouseEvent): void}
     * @private
     */
    #onContextMenu;

    /**
     * @param {Camera}      camera                         - Controlled camera instance.
     * @param {HTMLElement} element                        - DOM element that receives input (usually the canvas).
     * @param {Object}      [options]                      - Orbit options (plain object).
     * @param {number}      [options.targetX=0]            - Orbit target X component.
     * @param {number}      [options.targetY=0]            - Orbit target Y component.
     * @param {number}      [options.targetZ=0]            - Orbit target Z component.
     * @param {number}      [options.distance=6]           - Orbit distance from the target.
     * @param {number}      [options.minDistance=0.1]      - Minimum orbit distance.
     * @param {number}      [options.maxDistance=1000]     - Maximum orbit distance.
     * @param {number}      [options.azimuthRadians=0.7]   - Initial yaw angle in radians.
     * @param {number}      [options.polarRadians=-0.6]    - Initial pitch angle in radians.
     * @param {number}      [options.minPolarRadians=-1.5] - Minimum pitch angle in radians.
     * @param {number}      [options.maxPolarRadians=1.5]  - Maximum pitch angle in radians.
     * @param {number}      [options.rotationSpeed=1.0]    - Rotation speed multiplier.
     * @param {number}      [options.zoomSpeed=1.0]        - Zoom speed multiplier.
     */
    constructor(camera, element, options = {}) {
        if (!(camera instanceof Camera)) {
            throw new TypeError('`OrbitControls` expects `camera` as a `Camera` derived-instance.');
        }

        if (!(element instanceof HTMLElement)) {
            throw new TypeError('`OrbitControls` expects `element` as an `HTMLElement`.');
        }

        if (options === null || typeof options !== 'object' || Array.isArray(options)) {
            throw new TypeError('`OrbitControls` expects `options` as a plain object.');
        }

        const {
            targetX         = DEFAULT_TARGET_X,
            targetY         = DEFAULT_TARGET_Y,
            targetZ         = DEFAULT_TARGET_Z,
            distance        = DEFAULT_DISTANCE,
            minDistance     = DEFAULT_MIN_DISTANCE,
            maxDistance     = DEFAULT_MAX_DISTANCE,
            azimuthRadians  = DEFAULT_AZIMUTH_RADIANS,
            polarRadians    = DEFAULT_POLAR_RADIANS,
            minPolarRadians = DEFAULT_MIN_POLAR_RADIANS,
            maxPolarRadians = DEFAULT_MAX_POLAR_RADIANS,
            rotationSpeed   = DEFAULT_ROTATION_SPEED,
            zoomSpeed       = DEFAULT_ZOOM_SPEED
        } = options;

        if (   typeof targetX !== 'number'
            || typeof targetY !== 'number'
            || typeof targetZ !== 'number') {
            throw new TypeError('`OrbitControls` options: `targetX/Y/Z` must be numbers.');
        }

        if (typeof distance       !== 'number'
            || typeof minDistance !== 'number'
            || typeof maxDistance !== 'number') {
            throw new TypeError('`OrbitControls` options: `distance/minDistance/maxDistance` must be numbers.');
        }

        if (distance <= 0 || minDistance <= 0 || maxDistance <= 0) {
            throw new RangeError('`OrbitControls` options: `distance/minDistance/maxDistance` must be positive numbers.');
        }

        if (minDistance > maxDistance) {
            throw new RangeError('`OrbitControls` options: `minDistance` must be less or equal to `maxDistance`.');
        }

        if (typeof azimuthRadians     !== 'number'
            || typeof polarRadians    !== 'number'
            || typeof minPolarRadians !== 'number'
            || typeof maxPolarRadians !== 'number') {
            throw new TypeError('`OrbitControls` options: angle values must be numbers.');
        }

        if (minPolarRadians > maxPolarRadians) {
            throw new RangeError('`OrbitControls` options: `minPolarRadians` must be less or equal to `maxPolarRadians`.');
        }

        if (typeof rotationSpeed !== 'number' || rotationSpeed <= 0) {
            throw new RangeError('`OrbitControls` options: `rotationSpeed` must be a positive number.');
        }

        if (typeof zoomSpeed !== 'number' || zoomSpeed <= 0) {
            throw new RangeError('`OrbitControls` options: `zoomSpeed` must be a positive number.');
        }

        this.#camera          = camera;
        this.#element         = element;
        this.#target          = new Vector3(targetX, targetY, targetZ, () => this.#markDirty());
        this.#distance        = OrbitControls.#clamp(distance, minDistance, maxDistance);
        this.#minDistance     = minDistance;
        this.#maxDistance     = maxDistance;
        this.#azimuthRadians  = azimuthRadians;
        this.#polarRadians    = OrbitControls.#clamp(polarRadians, minPolarRadians, maxPolarRadians);
        this.#minPolarRadians = minPolarRadians;
        this.#maxPolarRadians = maxPolarRadians;
        this.#rotationSpeed   = rotationSpeed;
        this.#zoomSpeed       = zoomSpeed;

        // Disable browser gestures on touch devices for the given element:
        this.#element.style.touchAction = 'none';

        this.#onPointerDown  = (event) => this.#handlePointerDown(event);
        this.#onPointerMove  = (event) => this.#handlePointerMove(event);
        this.#onPointerUp    = (event) => this.#handlePointerUp(event);
        this.#onWheel        = (event) => this.#handleWheel(event);
        this.#onContextMenu  = (event) => event.preventDefault();

        this.#element.addEventListener('pointerdown' , this.#onPointerDown);
        window.addEventListener('pointermove'        , this.#onPointerMove);
        window.addEventListener('pointerup'          , this.#onPointerUp);
        this.#element.addEventListener('wheel'       , this.#onWheel, WHEEL_LISTENER_OPTIONS);
        this.#element.addEventListener('contextmenu' , this.#onContextMenu);
    }

    /**
     * Orbit target (the point camera looks at).
     *
     * @returns {Vector3} - Mutable target vector (changes mark controls as dirty).
     */
    get target() {
        return this.#target;
    }

    /**
     * Current orbit distance.
     *
     * @returns {number} - Distance value in world units.
     */
    get distance() {
        return this.#distance;
    }

    /**
     * Sets orbit target components.
     *
     * @param {number} x - Target X component.
     * @param {number} y - Target Y component.
     * @param {number} z - Target Z component.
     */
    setTarget(x, y, z) {
        if (typeof x !== 'number' || typeof y !== 'number' || typeof z !== 'number') {
            throw new TypeError('`OrbitControls.setTarget` expects numeric `x/y/z` components.');
        }

        this.#target.set(x, y, z);
        this.#markDirty();
    }

    /**
     * Replaces the controlled camera.
     *
     * @param {Camera} camera - New controlled camera instance.
     */
    setCamera(camera) {
        if (!(camera instanceof Camera)) {
            throw new TypeError('`OrbitControls.setCamera` expects a `Camera` derived-instance.');
        }

        this.#camera = camera;
        this.#markDirty();
    }

    /**
     * Applies the current orbit state to the camera (position + rotation).
     */
    update() {
        if (this.#isDirty !== true) {
            return;
        }

        const target     = this.#target;
        const distance   = this.#distance;
        const azimuth    = this.#azimuthRadians;
        const polar      = this.#polarRadians;
        const cosPolar   = Math.cos(polar);
        const sinPolar   = Math.sin(polar);
        const sinAzimuth = Math.sin(azimuth);
        const cosAzimuth = Math.cos(azimuth);
        const cameraX    = target.x + (sinAzimuth * cosPolar * distance);
        const cameraY    = target.y - (sinPolar * distance);
        const cameraZ    = target.z + (cosAzimuth * cosPolar * distance);
        const camera     = this.#camera;

        camera.position.set(cameraX, cameraY, cameraZ);
        camera.rotation.set(polar, azimuth, DEFAULT_CAMERA_ROLL_RADIANS);
        this.#isDirty = false;
    }

    /**
     * Sets orbit distance (useful for UI sliders).
     *
     * @param {number} distance - New distance value.
     */
    setDistance(distance) {
        if (!Number.isFinite(distance)) {
            return;
        }

        this.#distance = OrbitControls.#clamp(distance, this.#minDistance, this.#maxDistance);
        this.#markDirty();
    }

    /**
     * Disposes the controller by removing all event listeners.
     */
    dispose() {
        this.#element.removeEventListener('pointerdown' , this.#onPointerDown);
        window.removeEventListener('pointermove'        , this.#onPointerMove);
        window.removeEventListener('pointerup'          , this.#onPointerUp);
        this.#element.removeEventListener('wheel'       , this.#onWheel, WHEEL_LISTENER_OPTIONS);
        this.#element.removeEventListener('contextmenu' , this.#onContextMenu);
        this.#capturedPointerId = POINTER_ID_RESET_VALUE;
    }

    /**
     * @private
     */
    #markDirty() {
        this.#isDirty = true;
    }

    /**
     * @param {PointerEvent} event - Pointer event.
     * @private
     */
    #handlePointerDown(event) {
        if (event.button !== ROTATE_BUTTON) {
            return;
        }

        if (this.#capturedPointerId !== POINTER_ID_RESET_VALUE) {
            return;
        }

        this.#capturedPointerId = event.pointerId;
        this.#previousPointerX  = event.clientX;
        this.#previousPointerY  = event.clientY;
        this.#element.setPointerCapture(event.pointerId);
        event.preventDefault();
    }

    /**
     * @param {PointerEvent} event - Pointer event.
     * @private
     */
    #handlePointerMove(event) {
        if (event.pointerId !== this.#capturedPointerId) {
            return;
        }

        const deltaX = event.clientX - this.#previousPointerX;
        const deltaY = event.clientY - this.#previousPointerY;
        this.#previousPointerX = event.clientX;
        this.#previousPointerY = event.clientY;

        const rotationStep    = ROTATION_RADIANS_PER_PIXEL * this.#rotationSpeed;
        this.#azimuthRadians -= deltaX * rotationStep;
        this.#polarRadians   -= deltaY * rotationStep;
        this.#polarRadians    = OrbitControls.#clamp(
            this.#polarRadians,
            this.#minPolarRadians,
            this.#maxPolarRadians
        );

        this.#markDirty();
        event.preventDefault();
    }

    /**
     * @param {PointerEvent} event - Pointer event.
     * @private
     */
    #handlePointerUp(event) {
        if (event.pointerId !== this.#capturedPointerId) {
            return;
        }

        this.#capturedPointerId = POINTER_ID_RESET_VALUE;
        event.preventDefault();
    }

    /**
     * @param {WheelEvent} event - Wheel event.
     * @private
     */
    #handleWheel(event) {
        const delta = event.deltaY;

        if (typeof delta !== 'number') {
            return;
        }

        const distanceDelta = delta * this.#zoomSpeed * WHEEL_DISTANCE_MULTIPLIER;
        const nextDistance  = this.#distance + distanceDelta;
        this.#distance = OrbitControls.#clamp(nextDistance, this.#minDistance, this.#maxDistance);
        this.#markDirty();
        event.preventDefault();
    }

    /**
     * @param {number} value - Value to clamp.
     * @param {number} min   - Inclusive lower bound.
     * @param {number} max   - Inclusive upper bound.
     * @returns {number}     - Clamped value.
     * @private
     */
    static #clamp(value, min, max) {
        if (value < min) {
            return min;
        }

        if (value > max) {
            return max;
        }

        return value;
    }
}

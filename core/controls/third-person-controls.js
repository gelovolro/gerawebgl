import { Object3D }          from '../scene/object3d.js';
import { ThirdPersonCamera } from '../scene/third-person-camera.js';
import { KeyboardControls }  from './keyboard-controls.js';

/**
 * Default camera follow distance.
 *
 * @type {number}
 */
const DEFAULT_DISTANCE = 6.0;

/**
 * Default camera look-at height offset from the target.
 *
 * @type {number}
 */
const DEFAULT_TARGET_HEIGHT = 1.4;

/**
 * Default camera roll in radians.
 *
 * @type {number}
 */
const DEFAULT_CAMERA_ROLL_RADIANS = 0.0;

/**
 * Lower bound for positive-only checks (must be `> 0`).
 *
 * @type {number}
 */
const MINIMUM_POSITIVE_VALUE = 0;

/**
 * Default controls class name.
 *
 * @type {string}
 */
const DEFAULT_CONTROLS_NAME = 'ThirdPersonControls';

/**
 * Per-frame movement intent derived from input.
 *
 * @typedef {Object} MovementData
 * @property {number} moveX
 * @property {number} moveZ
 * @property {boolean} isMoving
 * @property {number} speed
 */

/**
 * Derived camera state computed for the current frame.
 *
 * @typedef {Object} CameraState
 * @property {number} azimuthRadians
 * @property {number} polarRadians
 * @property {number} bobbingOffset
 * @property {number} bobbingPitch
 */

/**
 * Options used by {@link ThirdPersonControls}.
 *
 * @typedef {Object} ThirdPersonControlsOptions
 * @property {number} [distance = 6.0]     - Camera follow distance.
 * @property {number} [targetHeight = 1.4] - Look-at height offset from the target.
 */

/**
 * Third-person camera controller with mouse orbit rotation and keyboard movement.
 */
export class ThirdPersonControls extends KeyboardControls {

    /**
     * Camera follow distance.
     *
     * @type {number}
     * @private
     */
    #distance;

    /**
     * Look-at height offset from the target.
     *
     * @type {number}
     * @private
     */
    #targetHeight;

    /**
     * @param {ThirdPersonCamera} camera                                       - Controlled third-person camera.
     * @param {Object3D} target                                                - Target object, that the camera follows.
     * @param {HTMLElement} element                                            - DOM element, that receives pointer input.
     * @param {(KeyboardControlsOptions|ThirdPersonControlsOptions)} [options] - Optional controls configuration.
     */
    constructor(camera, target, element, options = {}) {
        if (options === null || typeof options !== 'object' || Array.isArray(options)) {
            throw new TypeError('`ThirdPersonControls` expects `options` as a plain object.');
        }

        if (!(camera instanceof ThirdPersonCamera)) {
            throw new TypeError('`ThirdPersonControls` expects `camera` as a `ThirdPersonCamera` instance.');
        }

        if (!(target instanceof Object3D)) {
            throw new TypeError('`ThirdPersonControls` expects `target` as an `Object3D` instance.');
        }

        if (!(element instanceof HTMLElement)) {
            throw new TypeError('`ThirdPersonControls` expects `element` as an `HTMLElement`.');
        }

        const {
            distance     = DEFAULT_DISTANCE,
            targetHeight = DEFAULT_TARGET_HEIGHT
        } = options;

        if (typeof distance !== 'number' || distance <= MINIMUM_POSITIVE_VALUE) {
            throw new RangeError('`ThirdPersonControls` expects `distance` as a positive number.');
        }

        if (typeof targetHeight !== 'number') {
            throw new TypeError('`ThirdPersonControls` expects `targetHeight` as a number.');
        }

        super(camera, target, element, options, {
            cameraConstructor : ThirdPersonCamera,
            controlsName      : DEFAULT_CONTROLS_NAME,
            bobbingMode       : ThirdPersonCamera.Modes.BOBBING
        });

        this.#distance     = distance;
        this.#targetHeight = targetHeight;
    }

    /**
     * @override
     * @param {Object3D} target       - Controlled target.
     * @param {MovementData} movement - Movement data.
     * @param {number} azimuthRadians - Current yaw angle in radians.
     */
    updateTargetRotation(target, movement, azimuthRadians) {
        if (!(target instanceof Object3D)) {
            throw new TypeError('`ThirdPersonControls.updateTargetRotation` expects `target` as an `Object3D` instance.');
        }

        KeyboardControls.assertMovementData(movement);

        if (typeof azimuthRadians !== 'number') {
            throw new TypeError('`ThirdPersonControls.updateTargetRotation` expects `azimuthRadians` as a number.');
        }

        if (!movement.isMoving) {
            return;
        }

        const rotationY   = Math.atan2(movement.moveX, movement.moveZ);
        target.rotation.y = rotationY;
    }

    /**
     * @override
     * @param {MovementData} movement    - Movement data.
     * @param {CameraState} cameraState  - Derived camera state.
     * @param {ThirdPersonCamera} camera - Controlled camera.
     * @param {Object3D} target          - Controlled target.
     */
    applyCameraTransform(movement, cameraState, camera, target) {
        KeyboardControls.assertMovementData(movement);
        KeyboardControls.assertCameraState(cameraState);

        if (!(camera instanceof ThirdPersonCamera)) {
            throw new TypeError('`ThirdPersonControls.applyCameraTransform` expects `camera` as a `ThirdPersonCamera` instance.');
        }

        if (!(target instanceof Object3D)) {
            throw new TypeError('`ThirdPersonControls.applyCameraTransform` expects `target` as an `Object3D` instance.');
        }

        const targetPosition = target.position;
        const targetX        = targetPosition.x;
        const targetY        = targetPosition.y + this.#targetHeight;
        const targetZ        = targetPosition.z;

        const cosPolar   = Math.cos(cameraState.polarRadians);
        const sinPolar   = Math.sin(cameraState.polarRadians);
        const sinAzimuth = Math.sin(cameraState.azimuthRadians);
        const cosAzimuth = Math.cos(cameraState.azimuthRadians);

        const cameraX = targetX + (sinAzimuth * cosPolar * this.#distance);
        const cameraY = targetY - (sinPolar * this.#distance) + cameraState.bobbingOffset;
        const cameraZ = targetZ + (cosAzimuth * cosPolar * this.#distance);

        camera.position.set(cameraX, cameraY, cameraZ);
        camera.rotation.set(
            cameraState.polarRadians + cameraState.bobbingPitch,
            cameraState.azimuthRadians,
            DEFAULT_CAMERA_ROLL_RADIANS
        );
    }
}

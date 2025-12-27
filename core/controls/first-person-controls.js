import { Object3D }          from '../scene/object3d.js';
import { FirstPersonCamera } from '../scene/first-person-camera.js';
import { KeyboardControls }  from './keyboard-controls.js';

/**
 * Default eye height above the target for first-person camera.
 *
 * @type {number}
 */
const DEFAULT_EYE_HEIGHT = 1.6;

/**
 * Default camera polar (pitch) in radians for first-person view.
 *
 * @type {number}
 */
const DEFAULT_FIRST_PERSON_POLAR_RADIANS = 0.0;

/**
 * Default minimum pitch angle in radians for first-person view.
 *
 * @type {number}
 */
const DEFAULT_FIRST_PERSON_MIN_POLAR_RADIANS = -1.35;

/**
 * Default maximum pitch angle in radians for first-person view.
 *
 * @type {number}
 */
const DEFAULT_FIRST_PERSON_MAX_POLAR_RADIANS = 1.35;

/**
 * Default camera roll in radians.
 *
 * @type {number}
 */
const DEFAULT_CAMERA_ROLL_RADIANS = 0.0;

/**
 * Default controls class name.
 *
 * @type {string}
 */
const DEFAULT_CONTROLS_NAME = 'FirstPersonControls';

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
 * Options used by {@link FirstPersonControls}.
 *
 * @typedef {Object} FirstPersonControlsOptions
 * @property {number} [eyeHeight = 1.6] - Eye height above the target.
 */

/**
 * First-person camera controller with mouse look and keyboard movement.
 */
export class FirstPersonControls extends KeyboardControls {

    /**
     * Eye height above the target.
     *
     * @type {number}
     * @private
     */
    #eyeHeight;

    /**
     * @param {FirstPersonCamera} camera                                       - Controlled first-person camera.
     * @param {Object3D} target                                                - Target object, that the camera follows.
     * @param {HTMLElement} element                                            - DOM element, that receives pointer input.
     * @param {(KeyboardControlsOptions|FirstPersonControlsOptions)} [options] - Optional controls configuration.
     */
    constructor(camera, target, element, options = {}) {
        if (options === null || typeof options !== 'object' || Array.isArray(options)) {
            throw new TypeError('`FirstPersonControls` expects `options` as a plain object.');
        }

        if (!(camera instanceof FirstPersonCamera)) {
            throw new TypeError('`FirstPersonControls` expects `camera` as a `FirstPersonCamera` instance.');
        }

        if (!(target instanceof Object3D)) {
            throw new TypeError('`FirstPersonControls` expects `target` as an `Object3D` instance.');
        }

        if (!(element instanceof HTMLElement)) {
            throw new TypeError('`FirstPersonControls` expects `element` as an `HTMLElement`.');
        }

        const {
            eyeHeight       = DEFAULT_EYE_HEIGHT,
            polarRadians    = DEFAULT_FIRST_PERSON_POLAR_RADIANS,
            minPolarRadians = DEFAULT_FIRST_PERSON_MIN_POLAR_RADIANS,
            maxPolarRadians = DEFAULT_FIRST_PERSON_MAX_POLAR_RADIANS
        } = options;

        if (typeof eyeHeight !== 'number' || eyeHeight <= 0) {
            throw new RangeError('`FirstPersonControls` expects `eyeHeight` as a positive number.');
        }

        if (typeof polarRadians !== 'number') {
            throw new TypeError('`FirstPersonControls` expects `polarRadians` as a number.');
        }

        if (typeof minPolarRadians !== 'number' || typeof maxPolarRadians !== 'number') {
            throw new TypeError('`FirstPersonControls` expects `minPolarRadians` and `maxPolarRadians` as numbers.');
        }

        if (minPolarRadians > maxPolarRadians) {
            throw new RangeError('`FirstPersonControls` expects `minPolarRadians` to be <= `maxPolarRadians`.');
        }

        super(camera, target, element, {
            ...options,
            polarRadians,
            minPolarRadians,
            maxPolarRadians
        }, {
            cameraConstructor : FirstPersonCamera,
            controlsName      : DEFAULT_CONTROLS_NAME,
            bobbingMode       : FirstPersonCamera.Modes.BOBBING
        });

        this.#eyeHeight = eyeHeight;
    }

    /**
     * @override
     * @param {Object3D} target       - Controlled target.
     * @param {MovementData} movement - Movement data.
     * @param {number} azimuthRadians - Current yaw angle in radians.
     */
    updateTargetRotation(target, movement, azimuthRadians) {
        if (!(target instanceof Object3D)) {
            throw new TypeError('`FirstPersonControls.updateTargetRotation` expects `target` as an `Object3D` instance.');
        }

        KeyboardControls.assertMovementData(movement);

        if (typeof azimuthRadians !== 'number') {
            throw new TypeError('`FirstPersonControls.updateTargetRotation` expects `azimuthRadians` as a number.');
        }

        target.rotation.y = azimuthRadians;
    }

    /**
     * @override
     * @param {MovementData} movement    - Movement data.
     * @param {CameraState} cameraState  - Derived camera state.
     * @param {FirstPersonCamera} camera - Controlled camera.
     * @param {Object3D} target          - Controlled target.
     */
    applyCameraTransform(movement, cameraState, camera, target) {
        KeyboardControls.assertMovementData(movement);
        KeyboardControls.assertCameraState(cameraState);

        if (!(camera instanceof FirstPersonCamera)) {
            throw new TypeError('`FirstPersonControls.applyCameraTransform` expects `camera` as a `FirstPersonCamera` instance.');
        }

        if (!(target instanceof Object3D)) {
            throw new TypeError('`FirstPersonControls.applyCameraTransform` expects `target` as an `Object3D` instance.');
        }

        const targetPosition = target.position;

        camera.position.set(
            targetPosition.x,
            targetPosition.y + this.#eyeHeight + cameraState.bobbingOffset,
            targetPosition.z
        );

        camera.rotation.set(
            cameraState.polarRadians + cameraState.bobbingPitch,
            cameraState.azimuthRadians,
            DEFAULT_CAMERA_ROLL_RADIANS
        );
    }
}

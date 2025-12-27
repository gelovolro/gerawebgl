import { Camera }   from '../scene/camera.js';
import { Object3D } from '../scene/object3d.js';

/**
 * Default ground Y position for movement and jumping.
 *
 * @type {number}
 */
const DEFAULT_GROUND_Y = 0.0;

/**
 * Default camera azimuth (yaw) in radians.
 *
 * @type {number}
 */
const DEFAULT_AZIMUTH_RADIANS = 0.0;

/**
 * Default camera polar (pitch) in radians.
 *
 * @type {number}
 */
const DEFAULT_POLAR_RADIANS = -0.35;

/**
 * Default minimum pitch angle in radians.
 *
 * @type {number}
 */
const DEFAULT_MIN_POLAR_RADIANS = -1.25;

/**
 * Default maximum pitch angle in radians.
 *
 * @type {number}
 */
const DEFAULT_MAX_POLAR_RADIANS = 0.55;

/**
 * Default rotation speed multiplier.
 *
 * @type {number}
 */
const DEFAULT_ROTATION_SPEED = 1.0;

/**
 * Default walking speed in world units per second.
 *
 * @type {number}
 */
const DEFAULT_MOVE_SPEED = 3.0;

/**
 * Default running speed multiplier.
 *
 * @type {number}
 */
const DEFAULT_RUN_SPEED_MULTIPLIER = 1.8;

/**
 * Default jump speed (vertical velocity).
 *
 * @type {number}
 */
const DEFAULT_JUMP_SPEED = 4.2;

/**
 * Default gravity acceleration magnitude (positive value).
 *
 * @type {number}
 */
const DEFAULT_GRAVITY_ACCELERATION = 9.8;

/**
 * Rotation change per pixel, in radians.
 *
 * @type {number}
 */
const ROTATION_RADIANS_PER_PIXEL = 0.005;

/**
 * Default walking bobbing height.
 *
 * @type {number}
 */
const DEFAULT_BOBBING_AMPLITUDE_WALK = 0.05;

/**
 * Default running bobbing height.
 *
 * @type {number}
 */
const DEFAULT_BOBBING_AMPLITUDE_RUN = 0.09;

/**
 * Default walking bobbing speed (radians per second).
 *
 * @type {number}
 */
const DEFAULT_BOBBING_FREQUENCY_WALK = 9.0;

/**
 * Default running bobbing speed (radians per second).
 *
 * @type {number}
 */
const DEFAULT_BOBBING_FREQUENCY_RUN = 13.0;

/**
 * Default bobbing pitch amplitude in radians.
 *
 * @type {number}
 */
const DEFAULT_BOBBING_PITCH_AMPLITUDE_RADIANS = 0.02;

/**
 * Primary pointer button id used for rotating the camera.
 *
 * @type {number}
 */
const ROTATE_POINTER_BUTTON = 0;

/**
 * Pointer capture reset value.
 *
 * @type {number}
 */
const POINTER_ID_RESET_VALUE = -1;

/**
 * Key action: move forward.
 *
 * @type {string}
 */
const ACTION_FORWARD = 'forward';

/**
 * Key action: move backward.
 *
 * @type {string}
 */
const ACTION_BACKWARD = 'backward';

/**
 * Key action: move left.
 *
 * @type {string}
 */
const ACTION_LEFT = 'left';

/**
 * Key action: move right.
 *
 * @type {string}
 */
const ACTION_RIGHT = 'right';

/**
 * Key action: run (left shift).
 *
 * @type {string}
 */
const ACTION_RUN = 'run';

/**
 * Key action: jump (space).
 *
 * @type {string}
 */
const ACTION_JUMP = 'jump';

/**
 * Key action registry.
 *
 * @type {{ FORWARD: string, BACKWARD: string, LEFT: string, RIGHT: string, RUN: string, JUMP: string }}
 */
const ACTIONS = Object.freeze({
    FORWARD  : ACTION_FORWARD,
    BACKWARD : ACTION_BACKWARD,
    LEFT     : ACTION_LEFT,
    RIGHT    : ACTION_RIGHT,
    RUN      : ACTION_RUN,
    JUMP     : ACTION_JUMP
});

/**
 * `KeyboardEvent.code` values used by the controls.
 *
 * @type {{ FORWARD: string, BACKWARD: string, LEFT: string, RIGHT: string, RUN: string, JUMP: string }}
 */
const KEY_CODES = Object.freeze({
    FORWARD  : 'KeyW',
    BACKWARD : 'KeyS',
    LEFT     : 'KeyA',
    RIGHT    : 'KeyD',
    RUN      : 'ShiftLeft',
    JUMP     : 'Space'
});

/**
 * Keyboard event type: `keydown`.
 *
 * @type {string}
 */
const EVENT_KEYDOWN = 'keydown';

/**
 * Keyboard event type: `keyup`.
 *
 * @type {string}
 */
const EVENT_KEYUP = 'keyup';

/**
 * Pointer event type: `pointerdown`.
 *
 * @type {string}
 */
const EVENT_POINTERDOWN = 'pointerdown';

/**
 * Pointer event type: `pointermove`.
 *
 * @type {string}
 */
const EVENT_POINTERMOVE = 'pointermove';

/**
 * Pointer event type: `pointerup`.
 *
 * @type {string}
 */
const EVENT_POINTERUP = 'pointerup';

/**
 * Context menu event type.
 *
 * @type {string}
 */
const EVENT_CONTEXT_MENU = 'contextmenu';

/**
 * Window blur event type.
 *
 * @type {string}
 */
const EVENT_WINDOW_BLUR = 'blur';

/**
 * Touch action CSS value used to disable browser gestures.
 *
 * @type {string}
 */
const TOUCH_ACTION_NONE = 'none';

/**
 * Input vector component for forward motion.
 *
 * @type {number}
 */
const INPUT_FORWARD = 1;

/**
 * Input vector component for backward motion.
 *
 * @type {number}
 */
const INPUT_BACKWARD = -1;

/**
 * No movement input value.
 *
 * @type {number}
 */
const INPUT_NONE = 0;

/**
 * Default movement speed scale (no sprint).
 *
 * @type {number}
 */
const SPEED_SCALE_DEFAULT = 1;

/**
 * Non-zero epsilon used for normalization checks.
 *
 * @type {number}
 */
const INPUT_EPSILON = 0.0001;

/**
 * Start index for loops.
 *
 * @type {number}
 */
const LOOP_START_INDEX = 0;

/**
 * Index increment value for loops.
 *
 * @type {number}
 */
const LOOP_INDEX_INCREMENT = 1;

/**
 * Inclusive lower bound for non-negative values.
 *
 * @type {number}
 */
const MINIMUM_NON_NEGATIVE_VALUE = 0;

/**
 * Lower bound for positive-only checks (must be `> 0`).
 *
 * @type {number}
 */
const MINIMUM_POSITIVE_VALUE = 0;

/**
 * Empty string length used for non-empty checks.
 *
 * @type {number}
 */
const EMPTY_STRING_LENGTH = 0;

/**
 * `KeyboardEvent.key` fallback values used by the controls.
 *
 * @type {KeyValues}
 */
const KEY_VALUES = Object.freeze({
    FORWARD  : 'w',
    BACKWARD : 's',
    LEFT     : 'a',
    RIGHT    : 'd',
    RUN      : 'shift',
    JUMP     : ' ',
    SPACEBAR : 'spacebar'
});

/**
 * Options used by {@link KeyboardControls}.
 *
 * @typedef {Object} KeyboardControlsOptions
 * @property {number} [groundY = 0.0]                       - Ground height for jumping and landing.
 * @property {number} [azimuthRadians = 0]                  - Initial yaw angle in radians.
 * @property {number} [polarRadians = -0.35]                - Initial pitch angle in radians.
 * @property {number} [minPolarRadians = -1.25]             - Minimum pitch angle in radians.
 * @property {number} [maxPolarRadians = 0.55]              - Maximum pitch angle in radians.
 * @property {number} [rotationSpeed = 1.0]                 - Mouse rotation speed multiplier.
 * @property {number} [moveSpeed = 3.0]                     - Walking speed in world units per second.
 * @property {number} [runSpeedMultiplier = 1.8]            - Speed multiplier when running (Shift).
 * @property {number} [jumpSpeed = 4.2]                     - Jump velocity.
 * @property {number} [gravity = 9.8]                       - Gravity acceleration magnitude.
 * @property {number} [bobbingAmplitudeWalk = 0.05]         - Camera bobbing height while walking.
 * @property {number} [bobbingAmplitudeRun = 0.09]          - Camera bobbing height while running.
 * @property {number} [bobbingFrequencyWalk = 9.0]          - Bobbing angular speed while walking.
 * @property {number} [bobbingFrequencyRun = 13.0]          - Bobbing angular speed while running.
 * @property {number} [bobbingPitchAmplitudeRadians = 0.02] - Camera pitch bobbing amplitude.
 */

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
 * `KeyboardEvent.key` fallback values used by the controls.
 *
 * @typedef {Object} KeyValues
 * @property {string} FORWARD  - Forward key value.
 * @property {string} BACKWARD - Backward key value.
 * @property {string} LEFT     - Left key value.
 * @property {string} RIGHT    - Right key value.
 * @property {string} RUN      - Run key value.
 * @property {string} JUMP     - Jump key value (space).
 * @property {string} SPACEBAR - Deprecated legacy key value for space.
 */

/**
 * Shared `keyboard + pointer` controls for character cameras.
 */
export class KeyboardControls {

    /**
     * Controlled camera instance.
     *
     * @type {Camera}
     * @private
     */
    #camera;

    /**
     * Controlled target object (player).
     *
     * @type {Object3D}
     * @private
     */
    #target;

    /**
     * DOM element, that receives pointer input (usually the canvas).
     *
     * @type {HTMLElement}
     * @private
     */
    #element;

    /**
     * Controls class name for error messages.
     *
     * @type {string}
     * @private
     */
    #controlsName;

    /**
     * Required camera constructor for validation.
     *
     * @type {Function}
     * @private
     */
    #cameraConstructor;

    /**
     * Camera mode value, that enables bobbing.
     *
     * @type {string | null}
     * @private
     */
    #bobbingMode;

    /**
     * Ground Y coordinate for landing.
     *
     * @type {number}
     * @private
     */
    #groundY;

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
     * Minimum allowed polar angle in radians.
     *
     * @type {number}
     * @private
     */
    #minPolarRadians;

    /**
     * Maximum allowed polar angle in radians.
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
     * Base movement speed (walking).
     *
     * @type {number}
     * @private
     */
    #moveSpeed;

    /**
     * Running speed multiplier.
     *
     * @type {number}
     * @private
     */
    #runSpeedMultiplier;

    /**
     * Jump velocity.
     *
     * @type {number}
     * @private
     */
    #jumpSpeed;

    /**
     * Gravity acceleration magnitude.
     *
     * @type {number}
     * @private
     */
    #gravity;

    /**
     * Current vertical velocity.
     *
     * @type {number}
     * @private
     */
    #verticalVelocity = INPUT_NONE;

    /**
     * True when the target is grounded.
     *
     * @type {boolean}
     * @private
     */
    #isGrounded = true;

    /**
     * Camera bobbing height while walking.
     *
     * @type {number}
     * @private
     */
    #bobbingAmplitudeWalk;

    /**
     * Camera bobbing height while running.
     *
     * @type {number}
     * @private
     */
    #bobbingAmplitudeRun;

    /**
     * Camera bobbing angular speed while walking.
     *
     * @type {number}
     * @private
     */
    #bobbingFrequencyWalk;

    /**
     * Camera bobbing angular speed while running.
     *
     * @type {number}
     * @private
     */
    #bobbingFrequencyRun;

    /**
     * Camera pitch bobbing amplitude in radians.
     *
     * @type {number}
     * @private
     */
    #bobbingPitchAmplitude;

    /**
     * Current bobbing phase in radians.
     *
     * @type {number}
     * @private
     */
    #bobbingPhase = INPUT_NONE;

    /**
     * Current camera bobbing offset.
     *
     * @type {number}
     * @private
     */
    #bobbingOffset = INPUT_NONE;

    /**
     * Action states map.
     *
     * @type {Map<string, boolean>}
     * @private
     */
    #actionStates = new Map();

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
    #previousPointerX = INPUT_NONE;

    /**
     * Previous pointer Y position in client pixels.
     *
     * @type {number}
     * @private
     */
    #previousPointerY = INPUT_NONE;

    /**
     * True when input listeners are enabled.
     *
     * @type {boolean}
     * @private
     */
    #isEnabled = true;

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
     * Cached keydown handler reference used for `removeEventListener`.
     *
     * @type {function(KeyboardEvent): void}
     * @private
     */
    #onKeyDown;

    /**
     * Cached keyup handler reference used for `removeEventListener`.
     *
     * @type {function(KeyboardEvent): void}
     * @private
     */
    #onKeyUp;

    /**
     * Cached contextmenu handler reference used for `removeEventListener`.
     *
     * @type {function(MouseEvent): void}
     * @private
     */
    #onContextMenu;

    /**
     * Cached blur handler reference used for `removeEventListener`.
     *
     * @type {function(): void}
     * @private
     */
    #onBlur;

    /**
     * @param {Camera} camera                                     - Controlled camera.
     * @param {Object3D} target                                   - Target object, that the camera follows.
     * @param {HTMLElement} element                               - DOM element, that receives pointer input.
     * @param {KeyboardControlsOptions} [options]                 - Optional controls configuration.
     * @param {Object} [config]                                   - Internal configuration for derived controls.
     * @param {Function} [config.cameraConstructor = Camera]      - Expected camera constructor for validation.
     * @param {string} [config.controlsName = 'KeyboardControls'] - Controls class name for error messages.
     * @param {(string|null)} [config.bobbingMode = null]         - Camera mode, that enables bobbing (or null to disable).
     */
    constructor(camera, target, element, options = {}, config = {}) {
        if (options === null || typeof options !== 'object' || Array.isArray(options)) {
            throw new TypeError('`KeyboardControls` expects `options` as a plain object.');
        }

        const {
            cameraConstructor = Camera,
            controlsName      = 'KeyboardControls',
            bobbingMode       = null
        } = config;

        if (typeof cameraConstructor !== 'function') {
            throw new TypeError('`KeyboardControls` expects `cameraConstructor` as a function.');
        }

        if (typeof controlsName !== 'string' || controlsName.length === 0) {
            throw new TypeError('`KeyboardControls` expects `controlsName` as a non-empty string.');
        }

        if (!(camera instanceof cameraConstructor)) {
            throw new TypeError(`\`${controlsName}\` expects \`camera\` as a \`${cameraConstructor.name}\` instance.`);
        }

        if (!(target instanceof Object3D)) {
            throw new TypeError(`\`${controlsName}\` expects \`target\` as an \`Object3D\` instance.`);
        }

        if (!(element instanceof HTMLElement)) {
            throw new TypeError(`\`${controlsName}\` expects \`element\` as an \`HTMLElement\`.`);
        }

        if (bobbingMode !== null && typeof bobbingMode !== 'string') {
            throw new TypeError('`KeyboardControls` expects `bobbingMode` as a string or null.');
        }

        const {
            groundY                      = DEFAULT_GROUND_Y,
            azimuthRadians               = DEFAULT_AZIMUTH_RADIANS,
            polarRadians                 = DEFAULT_POLAR_RADIANS,
            minPolarRadians              = DEFAULT_MIN_POLAR_RADIANS,
            maxPolarRadians              = DEFAULT_MAX_POLAR_RADIANS,
            rotationSpeed                = DEFAULT_ROTATION_SPEED,
            moveSpeed                    = DEFAULT_MOVE_SPEED,
            runSpeedMultiplier           = DEFAULT_RUN_SPEED_MULTIPLIER,
            jumpSpeed                    = DEFAULT_JUMP_SPEED,
            gravity                      = DEFAULT_GRAVITY_ACCELERATION,
            bobbingAmplitudeWalk         = DEFAULT_BOBBING_AMPLITUDE_WALK,
            bobbingAmplitudeRun          = DEFAULT_BOBBING_AMPLITUDE_RUN,
            bobbingFrequencyWalk         = DEFAULT_BOBBING_FREQUENCY_WALK,
            bobbingFrequencyRun          = DEFAULT_BOBBING_FREQUENCY_RUN,
            bobbingPitchAmplitudeRadians = DEFAULT_BOBBING_PITCH_AMPLITUDE_RADIANS
        } = options;

        if (typeof groundY !== 'number') {
            throw new TypeError(`\`${controlsName}\` expects \`groundY\` as a number.`);
        }

        if (typeof azimuthRadians !== 'number' || typeof polarRadians !== 'number') {
            throw new TypeError(`\`${controlsName}\` expects \`azimuthRadians\` and \`polarRadians\` as numbers.`);
        }

        if (typeof minPolarRadians !== 'number' || typeof maxPolarRadians !== 'number') {
            throw new TypeError(`\`${controlsName}\` expects \`minPolarRadians\` and \`maxPolarRadians\` as numbers.`);
        }

        if (minPolarRadians > maxPolarRadians) {
            throw new RangeError(`\`${controlsName}\` expects \`minPolarRadians\` to be <= \`maxPolarRadians\`.`);
        }

        if (typeof rotationSpeed !== 'number' || rotationSpeed <= MINIMUM_POSITIVE_VALUE) {
            throw new RangeError(`\`${controlsName}\` expects \`rotationSpeed\` as a positive number.`);
        }

        if (typeof moveSpeed !== 'number' || moveSpeed <= MINIMUM_POSITIVE_VALUE) {
            throw new RangeError(`\`${controlsName}\` expects \`moveSpeed\` as a positive number.`);
        }

        if (typeof runSpeedMultiplier !== 'number' || runSpeedMultiplier <= MINIMUM_POSITIVE_VALUE) {
            throw new RangeError(`\`${controlsName}\` expects \`runSpeedMultiplier\` as a positive number.`);
        }

        if (typeof jumpSpeed !== 'number' || jumpSpeed <= MINIMUM_POSITIVE_VALUE) {
            throw new RangeError(`\`${controlsName}\` expects \`jumpSpeed\` as a positive number.`);
        }

        if (typeof gravity !== 'number' || gravity <= MINIMUM_POSITIVE_VALUE) {
            throw new RangeError(`\`${controlsName}\` expects \`gravity\` as a positive number.`);
        }

        if (typeof bobbingAmplitudeWalk !== 'number' || bobbingAmplitudeWalk < MINIMUM_NON_NEGATIVE_VALUE) {
            throw new RangeError(`\`${controlsName}\` expects \`bobbingAmplitudeWalk\` as a non-negative number.`);
        }

        if (typeof bobbingAmplitudeRun !== 'number' || bobbingAmplitudeRun < MINIMUM_NON_NEGATIVE_VALUE) {
            throw new RangeError(`\`${controlsName}\` expects \`bobbingAmplitudeRun\` as a non-negative number.`);
        }

        if (typeof bobbingFrequencyWalk !== 'number' || bobbingFrequencyWalk <= MINIMUM_POSITIVE_VALUE) {
            throw new RangeError(`\`${controlsName}\` expects \`bobbingFrequencyWalk\` as a positive number.`);
        }

        if (typeof bobbingFrequencyRun !== 'number' || bobbingFrequencyRun <= MINIMUM_POSITIVE_VALUE) {
            throw new RangeError(`\`${controlsName}\` expects \`bobbingFrequencyRun\` as a positive number.`);
        }

        if (typeof bobbingPitchAmplitudeRadians !== 'number' || bobbingPitchAmplitudeRadians < MINIMUM_NON_NEGATIVE_VALUE) {
            throw new RangeError(`\`${controlsName}\` expects \`bobbingPitchAmplitudeRadians\` as a non-negative number.`);
        }

        this.#camera                 = camera;
        this.#target                 = target;
        this.#element                = element;
        this.#controlsName           = controlsName;
        this.#cameraConstructor      = cameraConstructor;
        this.#bobbingMode            = bobbingMode;
        this.#groundY                = groundY;
        this.#azimuthRadians         = azimuthRadians;
        this.#polarRadians           = KeyboardControls.#clamp(polarRadians, minPolarRadians, maxPolarRadians);
        this.#minPolarRadians        = minPolarRadians;
        this.#maxPolarRadians        = maxPolarRadians;
        this.#rotationSpeed          = rotationSpeed;
        this.#moveSpeed              = moveSpeed;
        this.#runSpeedMultiplier     = runSpeedMultiplier;
        this.#jumpSpeed              = jumpSpeed;
        this.#gravity                = gravity;
        this.#bobbingAmplitudeWalk   = bobbingAmplitudeWalk;
        this.#bobbingAmplitudeRun    = bobbingAmplitudeRun;
        this.#bobbingFrequencyWalk   = bobbingFrequencyWalk;
        this.#bobbingFrequencyRun    = bobbingFrequencyRun;
        this.#bobbingPitchAmplitude  = bobbingPitchAmplitudeRadians;

        this.#element.style.touchAction = TOUCH_ACTION_NONE;
        this.#initActionStates();
        this.#onPointerDown = (event) => this.#handlePointerDown(event);
        this.#onPointerMove = (event) => this.#handlePointerMove(event);
        this.#onPointerUp   = (event) => this.#handlePointerUp(event);
        this.#onKeyDown     = (event) => this.#handleKeyDown(event);
        this.#onKeyUp       = (event) => this.#handleKeyUp(event);
        this.#onContextMenu = (event) => event.preventDefault();
        this.#onBlur        = ()      => this.#resetInputStates();
        this.#addEventListeners();
    }

    /**
     * Updates the controlled camera and target based on input and time delta.
     *
     * @param {number} deltaSeconds - Time delta in seconds.
     */
    update(deltaSeconds) {
        if (typeof deltaSeconds !== 'number' || Number.isFinite(deltaSeconds) !== true) {
            throw new TypeError(`\`${this.#controlsName}.update\` expects \`deltaSeconds\` as a finite number.`);
        }

        const movement = this.#computeMovement(deltaSeconds);
        this.#applyMovement(movement, deltaSeconds);

        const cameraState = this.#computeCameraState(deltaSeconds, movement.isMoving);
        this.applyCameraTransform(movement, cameraState, this.#camera, this.#target);
    }

    /**
     * Enables or disables input listeners without destroying the controls.
     *
     * @param {boolean} enabled - True to enable input, false to disable.
     */
    setEnabled(enabled) {
        if (typeof enabled !== 'boolean') {
            throw new TypeError(`\`${this.#controlsName}.setEnabled\` expects \`enabled\` as a boolean.`);
        }

        if (this.#isEnabled === enabled) {
            return;
        }

        this.#isEnabled = enabled;

        if (enabled) {
            this.#addEventListeners();
            return;
        }

        this.#removeEventListeners();
        this.#capturedPointerId = POINTER_ID_RESET_VALUE;
        this.#resetInputStates();
    }

    /**
     * Replaces the controlled camera.
     *
     * @param {Camera} camera - New controlled camera instance.
     */
    setCamera(camera) {
        if (!(camera instanceof this.#cameraConstructor)) {
            throw new TypeError(`\`${this.#controlsName}.setCamera\` expects a \`${this.#cameraConstructor.name}\` instance.`);
        }

        this.#camera = camera;
    }

    /**
     * Replaces the target object.
     *
     * @param {Object3D} target - New target object.
     */
    setTarget(target) {
        if (!(target instanceof Object3D)) {
            throw new TypeError(`\`${this.#controlsName}.setTarget\` expects an \`Object3D\` instance.`);
        }

        this.#target = target;
    }

    /**
     * Disposes the controller by removing all event listeners.
     */
    dispose() {
        this.#removeEventListeners();
        this.#capturedPointerId = POINTER_ID_RESET_VALUE;
        this.#resetInputStates();
        this.#isEnabled = false;
    }

    /**
     * Updates target rotation based on movement and orientation.
     *
     * @param {Object3D} target       - Controlled target.
     * @param {MovementData} movement - Movement data.
     * @param {number} azimuthRadians - Current yaw angle in radians.
     */
    updateTargetRotation(target, movement, azimuthRadians) {
        if (!(target instanceof Object3D)) {
            throw new TypeError(`\`${this.#controlsName}.updateTargetRotation\` expects \`target\` as an \`Object3D\` instance.`);
        }

        KeyboardControls.assertMovementData(movement, `${this.#controlsName}.updateTargetRotation`);

        if (typeof azimuthRadians !== 'number') {
            throw new TypeError(`\`${this.#controlsName}.updateTargetRotation\` expects \`azimuthRadians\` as a number.`);
        }
    }

    /**
     * Applies camera transforms for the active camera type.
     *
     * @param {MovementData} movement   - Movement data.
     * @param {CameraState} cameraState - Derived camera state.
     * @param {Camera} camera           - Controlled camera.
     * @param {Object3D} target         - Controlled target.
     */
    applyCameraTransform(movement, cameraState, camera, target) {
        KeyboardControls.assertMovementData(movement   , `${this.#controlsName}.applyCameraTransform`);
        KeyboardControls.assertCameraState(cameraState , `${this.#controlsName}.applyCameraTransform`);

        if (!(camera instanceof this.#cameraConstructor)) {
            throw new TypeError(`\`${this.#controlsName}.applyCameraTransform\` expects \`camera\` as a \`${this.#cameraConstructor.name}\` instance.`);
        }

        if (!(target instanceof Object3D)) {
            throw new TypeError(`\`${this.#controlsName}.applyCameraTransform\` expects \`target\` as an \`Object3D\` instance.`);
        }

        throw new Error('`KeyboardControls.applyCameraTransform` must be implemented in a derived class.');
    }

    /**
     * Initializes action state registry.
     *
     * @private
     */
    #initActionStates() {
        const actionValues = Object.values(ACTIONS);

        for (let index = LOOP_START_INDEX; index < actionValues.length; index += LOOP_INDEX_INCREMENT) {
            this.#actionStates.set(actionValues[index], false);
        }
    }

    /**
     * Clears all action states.
     *
     * @private
     */
    #resetInputStates() {
        const entries = this.#actionStates.entries();

        for (const [action] of entries) {
            this.#actionStates.set(action, false);
        }
    }

    /**
     * Adds input event listeners.
     *
     * @private
     */
    #addEventListeners() {
        this.#element.addEventListener(EVENT_POINTERDOWN, this.#onPointerDown);
        window.addEventListener(EVENT_POINTERMOVE, this.#onPointerMove);
        window.addEventListener(EVENT_POINTERUP, this.#onPointerUp);
        window.addEventListener(EVENT_KEYDOWN, this.#onKeyDown);
        window.addEventListener(EVENT_KEYUP, this.#onKeyUp);

        this.#element.addEventListener(EVENT_CONTEXT_MENU, this.#onContextMenu);
        window.addEventListener(EVENT_WINDOW_BLUR, this.#onBlur);
    }

    /**
     * Removes input event listeners.
     *
     * @private
     */
    #removeEventListeners() {
        this.#element.removeEventListener(EVENT_POINTERDOWN, this.#onPointerDown);
        window.removeEventListener(EVENT_POINTERMOVE, this.#onPointerMove);
        window.removeEventListener(EVENT_POINTERUP, this.#onPointerUp);
        window.removeEventListener(EVENT_KEYDOWN, this.#onKeyDown);
        window.removeEventListener(EVENT_KEYUP, this.#onKeyUp);

        this.#element.removeEventListener(EVENT_CONTEXT_MENU, this.#onContextMenu);
        window.removeEventListener(EVENT_WINDOW_BLUR, this.#onBlur);
    }

    /**
     * Computes movement intent from the current action states.
     *
     * @param {number} deltaSeconds - Time delta in seconds.
     * @returns {MovementData}
     * @private
     */
    #computeMovement(deltaSeconds) {
        const forwardInput = this.#getActionValue(ACTIONS.FORWARD, ACTIONS.BACKWARD);
        const rightInput   = this.#getActionValue(ACTIONS.RIGHT, ACTIONS.LEFT);
        const inputLength  = Math.hypot(forwardInput, rightInput);
        const isMoving     = inputLength > INPUT_EPSILON;
        const speedScale   = this.#actionStates.get(ACTIONS.RUN) ? this.#runSpeedMultiplier : SPEED_SCALE_DEFAULT;
        const speed        = this.#moveSpeed * speedScale * deltaSeconds;

        if (!isMoving) {
            return {
                moveX    : INPUT_NONE,
                moveZ    : INPUT_NONE,
                isMoving : false,
                speed    : speed
            };
        }

        const normalizedForward = forwardInput / inputLength;
        const normalizedRight   = rightInput / inputLength;
        const yawSin            = Math.sin(this.#azimuthRadians);
        const yawCos            = Math.cos(this.#azimuthRadians);
        const forwardX          = -yawSin;
        const forwardZ          = -yawCos;
        const rightX            = yawCos;
        const rightZ            = -yawSin;
        const moveX             = (forwardX * normalizedForward + rightX * normalizedRight) * speed;
        const moveZ             = (forwardZ * normalizedForward + rightZ * normalizedRight) * speed;

        return {
            moveX,
            moveZ,
            isMoving : true,
            speed    : speed
        };
    }

    /**
     * Applies movement and jump physics to the target.
     *
     * @param {MovementData} movement - Movement data.
     * @param {number} deltaSeconds   - Time delta in seconds.
     * @private
     */
    #applyMovement(movement, deltaSeconds) {
        KeyboardControls.assertMovementData(movement, `${this.#controlsName}.#applyMovement`);

        if (typeof deltaSeconds !== 'number' || Number.isFinite(deltaSeconds) !== true) {
            throw new TypeError(`\`${this.#controlsName}.#applyMovement\` expects \`deltaSeconds\` as a finite number.`);
        }

        const targetPosition = this.#target.position;
        targetPosition.x += movement.moveX;
        targetPosition.z += movement.moveZ;
        this.updateTargetRotation(this.#target, movement, this.#azimuthRadians);

        if (this.#actionStates.get(ACTIONS.JUMP) && this.#isGrounded) {
            this.#verticalVelocity = this.#jumpSpeed;
            this.#isGrounded = false;
        }

        if (!this.#isGrounded) {
            this.#verticalVelocity -= this.#gravity * deltaSeconds;
            targetPosition.y += this.#verticalVelocity * deltaSeconds;

            if (targetPosition.y <= this.#groundY) {
                targetPosition.y       = this.#groundY;
                this.#verticalVelocity = INPUT_NONE;
                this.#isGrounded       = true;
            }
        }
    }

    /**
     * Computes bobbing offsets and pitch for the current frame.
     *
     * @param {number} deltaSeconds - Time delta in seconds.
     * @param {boolean} isMoving    - True when target is moving.
     * @returns {CameraState}
     * @private
     */
    #computeCameraState(deltaSeconds, isMoving) {
        if (typeof deltaSeconds !== 'number' || Number.isFinite(deltaSeconds) !== true) {
            throw new TypeError(`\`${this.#controlsName}.#computeCameraState\` expects \`deltaSeconds\` as a finite number.`);
        }

        if (typeof isMoving !== 'boolean') {
            throw new TypeError(`\`${this.#controlsName}.#computeCameraState\` expects \`isMoving\` as a boolean.`);
        }

        let bobbingOffset = INPUT_NONE;
        let bobbingPitch  = INPUT_NONE;

        if (this.#bobbingMode && this.#camera.mode === this.#bobbingMode && isMoving) {
            const isRunning = this.#actionStates.get(ACTIONS.RUN);
            const frequency = isRunning ? this.#bobbingFrequencyRun : this.#bobbingFrequencyWalk;
            const amplitude = isRunning ? this.#bobbingAmplitudeRun : this.#bobbingAmplitudeWalk;
            this.#bobbingPhase  += frequency * deltaSeconds;
            this.#bobbingOffset  = Math.sin(this.#bobbingPhase) * amplitude;
            bobbingOffset        = this.#bobbingOffset;
            bobbingPitch         = Math.sin(this.#bobbingPhase) * this.#bobbingPitchAmplitude;
        } else {
            this.#bobbingPhase  = INPUT_NONE;
            this.#bobbingOffset = INPUT_NONE;
        }

        return {
            azimuthRadians : this.#azimuthRadians,
            polarRadians   : this.#polarRadians,
            bobbingOffset,
            bobbingPitch
        };
    }

    /**
     * Returns a signed input value based on forward/backward action states.
     *
     * @param {string} positiveAction - Action mapped to `+1`.
     * @param {string} negativeAction - Action mapped to `-1`.
     * @returns {number}              - Input value in range [-1, 1].
     * @private
     */
    #getActionValue(positiveAction, negativeAction) {
        const positive = this.#actionStates.get(positiveAction) ? INPUT_FORWARD  : INPUT_NONE;
        const negative = this.#actionStates.get(negativeAction) ? INPUT_BACKWARD : INPUT_NONE;
        return positive + negative;
    }

    /**
     * @param {PointerEvent} event - Pointer event.
     * @private
     */
    #handlePointerDown(event) {
        if (event === null || typeof event !== 'object') {
            throw new TypeError(`\`${this.#controlsName}.#handlePointerDown\` expects \`event\` as an object.`);
        }

        if (event.button !== ROTATE_POINTER_BUTTON) {
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
        if (event === null || typeof event !== 'object') {
            throw new TypeError(`\`${this.#controlsName}.#handlePointerMove\` expects \`event\` as an object.`);
        }

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
        this.#polarRadians    = KeyboardControls.#clamp(
            this.#polarRadians,
            this.#minPolarRadians,
            this.#maxPolarRadians
        );

        event.preventDefault();
    }

    /**
     * @param {PointerEvent} event - Pointer event.
     * @private
     */
    #handlePointerUp(event) {
        if (event === null || typeof event !== 'object') {
            throw new TypeError(`\`${this.#controlsName}.#handlePointerUp\` expects \`event\` as an object.`);
        }

        if (event.pointerId !== this.#capturedPointerId) {
            return;
        }

        this.#capturedPointerId = POINTER_ID_RESET_VALUE;
        event.preventDefault();
    }

    /**
     * @param {KeyboardEvent} event - Keyboard event.
     * @private
     */
    #handleKeyDown(event) {
        if (event === null || typeof event !== 'object') {
            throw new TypeError(`\`${this.#controlsName}.#handleKeyDown\` expects \`event\` as an object.`);
        }

        const action = KeyboardControls.#mapEventToAction(event);

        if (!action) {
            return;
        }

        this.#actionStates.set(action, true);
        event.preventDefault();
    }

    /**
     * @param {KeyboardEvent} event - Keyboard event.
     * @private
     */
    #handleKeyUp(event) {
        if (event === null || typeof event !== 'object') {
            throw new TypeError(`\`${this.#controlsName}.#handleKeyUp\` expects \`event\` as an object.`);
        }

        const action = KeyboardControls.#mapEventToAction(event);

        if (!action) {
            return;
        }

        this.#actionStates.set(action, false);
        event.preventDefault();
    }

    /**
     * Maps keyboard events to action constants.
     *
     * @param {KeyboardEvent} event - Keyboard event.
     * @returns {string | null}     - Action id or null if not mapped.
     * @private
     */
    static #mapEventToAction(event) {
        if (event === null || typeof event !== 'object') {
            throw new TypeError('`KeyboardControls.#mapEventToAction` expects `event` as an object.');
        }

        if (typeof event.code === 'string' && event.code.length > EMPTY_STRING_LENGTH) {
            return KeyboardControls.#mapCodeToAction(event.code);
        }

        if (typeof event.key === 'string' && event.key.length > EMPTY_STRING_LENGTH) {
            return KeyboardControls.#mapKeyToAction(event.key);
        }

        return null;
    }

    /**
     * Maps `KeyboardEvent.key` values to actions.
     *
     * @param {string} key      - `KeyboardEvent.key` value.
     * @returns {string | null} - Action id or null, if not mapped.
     * @private
     */
    static #mapKeyToAction(key) {
        if (typeof key !== 'string') {
            throw new TypeError('`KeyboardControls.#mapKeyToAction` expects `key` as a string.');
        }

        switch (key.toLowerCase()) {
            case KEY_VALUES.FORWARD:
                return ACTIONS.FORWARD;

            case KEY_VALUES.BACKWARD:
                return ACTIONS.BACKWARD;

            case KEY_VALUES.LEFT:
                return ACTIONS.LEFT;

            case KEY_VALUES.RIGHT:
                return ACTIONS.RIGHT;

            case KEY_VALUES.RUN:
                return ACTIONS.RUN;

            case KEY_VALUES.JUMP:
            case KEY_VALUES.SPACEBAR:
                return ACTIONS.JUMP;

            default:
                return null;
        }
    }

    /**
     * Maps `KeyboardEvent.code` values to actions.
     *
     * @param {string} code - KeyboardEvent.code value.
     * @returns {string | null}
     * @private
     */
    static #mapCodeToAction(code) {
        if (typeof code !== 'string') {
            throw new TypeError('`KeyboardControls.#mapCodeToAction` expects `code` as a string.');
        }

        switch (code) {
            case KEY_CODES.FORWARD:
                return ACTIONS.FORWARD;

            case KEY_CODES.BACKWARD:
                return ACTIONS.BACKWARD;

            case KEY_CODES.LEFT:
                return ACTIONS.LEFT;

            case KEY_CODES.RIGHT:
                return ACTIONS.RIGHT;

            case KEY_CODES.RUN:
                return ACTIONS.RUN;

            case KEY_CODES.JUMP:
                return ACTIONS.JUMP;

            default:
                return null;
        }
    }

    /**
     * @param {number} value - Value to clamp.
     * @param {number} min   - Inclusive lower bound.
     * @param {number} max   - Inclusive upper bound.
     * @returns {number}     - Clamped value.
     * @private
     */
    static #clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }

    /**
     * @param {unknown} movement - Candidate movement data.
     * @param {string} context   - Error message context.
     * @returns {void}
     * @throws {TypeError} When `movement` does not match {@link MovementData}.
     */
    static assertMovementData(movement, context) {
        if (movement === null || typeof movement !== 'object' || Array.isArray(movement)) {
            throw new TypeError(`\`${context}\` expects \`movement\` as an object.`);
        }

        if (typeof movement.moveX !== 'number' || typeof movement.moveZ !== 'number') {
            throw new TypeError(`\`${context}\` expects \`movement.moveX\` and \`movement.moveZ\` as numbers.`);
        }

        if (typeof movement.isMoving !== 'boolean') {
            throw new TypeError(`\`${context}\` expects \`movement.isMoving\` as a boolean.`);
        }

        if (typeof movement.speed !== 'number') {
            throw new TypeError(`\`${context}\` expects \`movement.speed\` as a number.`);
        }
    }

    /**
     * @param {unknown} cameraState - Candidate camera state.
     * @param {string} context      - Error message context.
     * @returns {void}
     * @throws {TypeError} When `cameraState` does not match {@link CameraState}.
     */
    static assertCameraState(cameraState, context) {
        if (cameraState === null || typeof cameraState !== 'object' || Array.isArray(cameraState)) {
            throw new TypeError(`\`${context}\` expects \`cameraState\` as an object.`);
        }

        if (typeof cameraState.azimuthRadians !== 'number' || typeof cameraState.polarRadians !== 'number') {
            throw new TypeError(`\`${context}\` expects \`cameraState.azimuthRadians\` and \`cameraState.polarRadians\` as numbers.`);
        }

        if (typeof cameraState.bobbingOffset !== 'number' || typeof cameraState.bobbingPitch !== 'number') {
            throw new TypeError(`\`${context}\` expects \`cameraState.bobbingOffset\` and \`cameraState.bobbingPitch\` as numbers.`);
        }
    }
}

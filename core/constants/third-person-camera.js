import * as MathConstants         from './math.js';
import * as PersonCameraConstants from './person-camera.js';

// Perspective projection defaults
export const THIRD_PERSON_CAMERA_DEFAULTS = Object.freeze({
    FIELD_OF_VIEW_RADIANS : Math.PI / 4,
    ASPECT_RATIO          : MathConstants.MATH_COMMON_VALUES.UNIT,
    NEAR                  : 0.1,
    FAR                   : 200.0,
    MODE                  : PersonCameraConstants.PERSON_CAMERA_MODES.NORMAL
});

// Public validation errors
export const THIRD_PERSON_CAMERA_ERRORS = Object.freeze({
    OPTIONS_TYPE        : '`ThirdPersonCamera` expects `options` as a plain object.',
    FIELD_OF_VIEW_TYPE  : '`ThirdPersonCamera` expects `fieldOfViewRadians` as a number.',
    ASPECT_RATIO_TYPE   : '`ThirdPersonCamera` expects `aspectRatio` as a number.',
    NEAR_TYPE           : '`ThirdPersonCamera` expects `near` as a number.',
    FAR_TYPE            : '`ThirdPersonCamera` expects `far` as a number.',
    FIELD_OF_VIEW_RANGE : '`ThirdPersonCamera` expects `0 < fieldOfViewRadians < Math.PI`.',
    ASPECT_RATIO_RANGE  : '`ThirdPersonCamera` expects `aspectRatio` to be a positive number.',
    CLIPPING_PLANES     : '`ThirdPersonCamera` expects `0 < near < far`.',
    MODE                : '`ThirdPersonCamera` expects `mode` to be a valid value from `ThirdPersonCamera.Modes`.',
    SET_MODE            : '`ThirdPersonCamera.setMode` expects a valid mode from `ThirdPersonCamera.Modes`.',
    SET_ASPECT_TYPE     : '`ThirdPersonCamera.setAspectRatio` expects `aspectRatio` as a number.',
    SET_ASPECT_RANGE    : '`ThirdPersonCamera.setAspectRatio` expects a positive number.'
});

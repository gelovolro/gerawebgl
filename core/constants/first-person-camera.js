import * as MathConstants         from './math.js';
import * as PersonCameraConstants from './person-camera.js';

// Perspective projection defaults
export const FIRST_PERSON_CAMERA_DEFAULTS = Object.freeze({
    FIELD_OF_VIEW_RADIANS : Math.PI / 4,
    ASPECT_RATIO          : MathConstants.MATH_COMMON_VALUES.UNIT,
    NEAR                  : 0.1,
    FAR                   : 200.0,
    MODE                  : PersonCameraConstants.PERSON_CAMERA_MODES.NORMAL
});

// Public validation errors
export const FIRST_PERSON_CAMERA_ERRORS = Object.freeze({
    OPTIONS_TYPE        : '`FirstPersonCamera` expects `options` as a plain object.',
    FIELD_OF_VIEW_TYPE  : '`FirstPersonCamera` expects `fieldOfViewRadians` as a number.',
    ASPECT_RATIO_TYPE   : '`FirstPersonCamera` expects `aspectRatio` as a number.',
    NEAR_TYPE           : '`FirstPersonCamera` expects `near` as a number.',
    FAR_TYPE            : '`FirstPersonCamera` expects `far` as a number.',
    FIELD_OF_VIEW_RANGE : '`FirstPersonCamera` expects `0 < fieldOfViewRadians < Math.PI`.',
    ASPECT_RATIO_RANGE  : '`FirstPersonCamera` expects `aspectRatio` to be a positive number.',
    CLIPPING_PLANES     : '`FirstPersonCamera` expects `0 < near < far`.',
    MODE                : '`FirstPersonCamera` expects `mode` to be a valid value from `FirstPersonCamera.Modes`.',
    SET_MODE            : '`FirstPersonCamera.setMode` expects a valid mode from `FirstPersonCamera.Modes`.',
    SET_ASPECT_TYPE     : '`FirstPersonCamera.setAspectRatio` expects `aspectRatio` as a number.',
    SET_ASPECT_RANGE    : '`FirstPersonCamera.setAspectRatio` expects a positive number.'
});

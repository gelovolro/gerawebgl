// Default camera values used by engine startup
export const ENGINE_CAMERA_DEFAULTS = Object.freeze({
    FIELD_OF_VIEW_RADIANS       : Math.PI / 4,
    NEAR_CLIPPING_PLANE         : 0.1,
    FAR_CLIPPING_PLANE          : 100.0,
    INITIAL_CAMERA_Z            : 5.0,
    INITIAL_CAMERA_ASPECT_RATIO : 1.0
});

// Default canvas options used by engine startup
export const ENGINE_CANVAS_DEFAULTS = Object.freeze({ FIT_TO_WINDOW: false });

// Default values used by engine helper methods
export const ENGINE_HELPER_DEFAULTS = Object.freeze({ BOX_SIZE: 1.0 });

// Lower bounds used by engine input validation
export const ENGINE_VALIDATION_LIMITS = Object.freeze({
    MIN_BOX_SIZE_EXCLUSIVE : 0,
    MIN_NUMBER_EXCLUSIVE   : 0
});

// Engine time unit conversion values
export const ENGINE_TIME = Object.freeze({ MILLISECONDS_TO_SECONDS: 0.001 });

// Default values used to reset engine runtime state
export const ENGINE_STATE_RESET = Object.freeze({
    ANIMATION_FRAME_ID : 0,
    TIME_SECONDS       : 0
});

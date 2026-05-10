// Default camera parameters used by engine during initialization
export const ENGINE_CAMERA_DEFAULTS = Object.freeze({
    FIELD_OF_VIEW_RADIANS       : Math.PI / 4,
    NEAR_CLIPPING_PLANE         : 0.1,
    FAR_CLIPPING_PLANE          : 100.0,
    INITIAL_CAMERA_Z            : 5.0,
    INITIAL_CAMERA_ASPECT_RATIO : 1.0
});

// Default values for engine helper methods
export const ENGINE_HELPER_DEFAULTS = Object.freeze({
    BOX_SIZE : 1.0
});

// Validation thresholds used by engine input checks
export const ENGINE_VALIDATION_LIMITS = Object.freeze({
    MIN_BOX_SIZE_EXCLUSIVE : 0,
    MIN_NUMBER_EXCLUSIVE   : 0
});

// Time conversion constants used by the animation loop
export const ENGINE_TIME = Object.freeze({
    MILLISECONDS_TO_SECONDS : 0.001
});

// Initial and reset values for engine runtime state
export const ENGINE_STATE_RESET = Object.freeze({
    ANIMATION_FRAME_ID : 0,
    TIME_SECONDS       : 0
});

// Default canvas behavior used during engine initialization
export const ENGINE_CANVAS_DEFAULTS = Object.freeze({
    FIT_TO_WINDOW : false
});

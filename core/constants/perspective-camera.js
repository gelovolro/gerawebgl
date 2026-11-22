// Projection cache defaults
export const PERSPECTIVE_CAMERA_DEFAULTS = Object.freeze({ DIRTY: true });

// Public validation errors
export const PERSPECTIVE_CAMERA_ERRORS = Object.freeze({
    FIELD_OF_VIEW_TYPE  : '`PerspectiveCamera` expects `fieldOfViewRadians` as a number.',
    ASPECT_RATIO_TYPE   : '`PerspectiveCamera` expects `aspectRatio` as a number.',
    NEAR_TYPE           : '`PerspectiveCamera` expects `near` as a number.',
    FAR_TYPE            : '`PerspectiveCamera` expects `far` as a number.',
    FIELD_OF_VIEW_RANGE : '`PerspectiveCamera` expects `0 < fieldOfViewRadians < Math.PI`.',
    ASPECT_RATIO_RANGE  : '`PerspectiveCamera` expects a positive `aspect ratio`.',
    CLIPPING_PLANES     : '`PerspectiveCamera` expects `0 < near < far`.',
    SET_ASPECT_TYPE     : '`PerspectiveCamera.setAspectRatio` expects `aspectRatio` as a number.',
    SET_ASPECT_RANGE    : '`PerspectiveCamera.setAspectRatio` expects a positive number.'
});

import * as MathConstants from './math.js';

// Orthographic camera defaults
export const ORTHOGRAPHIC_CAMERA_DEFAULTS = Object.freeze({
    VIEW_SIZE    : null,
    ASPECT_RATIO : MathConstants.MATH_COMMON_VALUES.UNIT,
    DIRTY        : true
});

// View-size calculations
export const ORTHOGRAPHIC_CAMERA_VALUES = Object.freeze({
    MINIMUM_VIEW_SIZE : MathConstants.MATH_COMMON_VALUES.ZERO,
    HALF_MULTIPLIER   : 0.5
});

// Optional camera configuration key
export const ORTHOGRAPHIC_CAMERA_OPTION_KEYS = Object.freeze({ VIEW_SIZE: 'viewSize' });

// Public validation and projection errors
export const ORTHOGRAPHIC_CAMERA_ERRORS = Object.freeze({
    OPTIONS_ARRAY        : '`OrthographicCamera` expects options as a plain object, not an array.',
    OPTIONS_TYPE         : '`OrthographicCamera` expects options as a plain object.',
    BOUNDS_TYPE          : '`OrthographicCamera` expects numeric arguments in bounds mode.',
    BOUNDS_WIDTH         : '`OrthographicCamera` expects `left !== right`.',
    BOUNDS_HEIGHT        : '`OrthographicCamera` expects `bottom !== top`.',
    BOUNDS_DEPTH         : '`OrthographicCamera` expects `near < far`.',
    VIEW_SIZE_TYPE       : '`OrthographicCamera` expects numeric arguments in view-size mode.',
    VIEW_SIZE            : '`OrthographicCamera` expects `viewSize` to be a positive number.',
    ASPECT_RATIO         : '`OrthographicCamera` expects `aspectRatio` to be a positive number.',
    VIEW_SIZE_DEPTH      : '`OrthographicCamera` expects `near < far`.',
    VIEW_SIZE_EXTENTS    : '`OrthographicCamera` expects finite view-size bounds.',
    SET_ASPECT_TYPE      : '`OrthographicCamera.setAspectRatio` expects `aspectRatio` as a number.',
    SET_ASPECT_RANGE     : '`OrthographicCamera.setAspectRatio` expects `aspectRatio` to be a positive number.',
    PROJECTION_NONFINITE : '`OrthographicCamera.getProjectionMatrix` expects a finite projection matrix.'
});

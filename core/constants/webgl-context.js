// Default context type, pixel ratio and depth-test state, used by 'WebGLContext'
export const WEBGL_CONTEXT_DEFAULTS = Object.freeze({
    CONTEXT_TYPE       : 'webgl2',
    DEVICE_PIXEL_RATIO : 1,
    ENABLE_DEPTH_TEST  : true
});

// Viewport origin, used when resizing the canvas drawing buffer
export const WEBGL_CONTEXT_VIEWPORT_ORIGIN = Object.freeze({
    X : 0,
    Y : 0
});

// Minimum drawing buffer size in pixels, used when the display size is too small
export const WEBGL_CONTEXT_DRAWING_BUFFER = Object.freeze({ MIN_DIMENSION: 1 });

// Inclusive clear color component limits, used by 'WebGLContext'
export const WEBGL_CONTEXT_COLOR_LIMITS = Object.freeze({
    MIN_COMPONENT : 0.0,
    MAX_COMPONENT : 1.0
});

// Initial clear color, used before 'WebGLContext.setDefaultClearColor' is called
export const WEBGL_CONTEXT_DEFAULT_CLEAR_COLOR = Object.freeze([0.0, 0.0, 0.0, 1.0]);

// Draw call constants, used by renderer
export const RENDERER_DRAW = Object.freeze({
    INDEX_BUFFER_OFFSET_BYTES : 0
});

// Opacity thresholds, used by renderer state switching
export const RENDERER_OPACITY = Object.freeze({
    OPAQUE_THRESHOLD : 1.0
});

// 'Material.apply' argument count thresholds
export const RENDERER_MATERIAL_APPLY_PARAM_COUNTS = Object.freeze({
    WORLD_MATRIX            : 2,
    WORLD_INVERSE_TRANSPOSE : 3,
    CAMERA_POSITION         : 4
});

// Traversal constants, used by renderer light search
export const RENDERER_TRAVERSAL = Object.freeze({
    STACK_EMPTY_LENGTH     : 0,
    CHILD_LOOP_START_INDEX : 0,
    CHILD_LOOP_INCREMENT   : 1
});

// Renderer error messages
export const RENDERER_ERRORS = Object.freeze({
    UNKNOWN_PRIMITIVE : 'Renderer received an unknown geometry primitive.'
});

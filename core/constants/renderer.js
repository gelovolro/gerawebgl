// Default index-buffer offset, used by renderer draw calls
export const RENDERER_DRAW = Object.freeze({ INDEX_BUFFER_OFFSET_BYTES: 0 });

// Opacity cutoff, used to treat a material as fully opaque
export const RENDERER_OPACITY = Object.freeze({ OPAQUE_THRESHOLD: 1.0 });

// Expected 'Material.apply' argument counts
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

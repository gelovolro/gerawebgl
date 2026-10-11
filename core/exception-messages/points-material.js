// Validation and resource messages used by 'PointsMaterial'
export const POINTS_MATERIAL_EXCEPTION_MESSAGES = Object.freeze({
    OPTIONS_OBJECT     : '`PointsMaterial` expects an options object (plain object).',
    COLOR_TYPE         : '`PointsMaterial.setColor` expects a number[] or `Float32Array`.',
    COLOR_LENGTH       : '`PointsMaterial.setColor` expects exactly 3 components [red, green, blue].',
    POINT_SIZE_TYPE    : '`PointsMaterial.setPointSize` expects a finite number.',
    POINT_SIZE_RANGE   : '`PointsMaterial.setPointSize` expects a positive size.',
    VERTEX_COLORS_TYPE : '`PointsMaterial.setUseVertexColors` expects a boolean.'
});

// Supported height sampling modes, used by 'HeightmapGeometry'
export const HEIGHTMAP_SAMPLING = Object.freeze({
    NEAREST  : 'nearest',
    BILINEAR : 'bilinear'
});

// Default options, used by 'HeightmapGeometry'
export const HEIGHTMAP_DEFAULTS = Object.freeze({
    WIDTH           : 1.0,
    DEPTH           : 1.0,
    HEIGHT_SCALE    : 1.0,
    HEIGHT_OFFSET   : 0.0,
    SEGMENTS_X      : 1,
    SEGMENTS_Z      : 1,
    WIREFRAME_STATE : false,
    FLIP_Y          : true,
    SAMPLING        : HEIGHTMAP_SAMPLING.NEAREST,
    TERRAIN_COLOR   : new Float32Array([0.18, 0.65, 0.28])
});

// Minimum accepted counts and values, used by 'HeightmapGeometry'
export const HEIGHTMAP_LIMITS = Object.freeze({
    MIN_SEGMENT_COUNT          : 1,
    MIN_POSITIVE_VALUE         : 0,
    MIN_REQUIRED_STRING_LENGTH : 1
});

// Buffer layout and geometry construction values, used by 'HeightmapGeometry'
export const HEIGHTMAP_LAYOUT = Object.freeze({
    BYTES_PER_PIXEL         : 4,
    RED_CHANNEL_OFFSET      : 0,
    MAX_CHANNEL_VALUE       : 255,
    CANVAS_TAG_NAME         : 'canvas',
    CANVAS_CONTEXT_2D       : '2d',
    SOURCE_IMAGE_DATA_FIELD : 'imageData',
    SEGMENTS_X_OPTION_NAME  : 'segmentsX',
    SEGMENTS_Z_OPTION_NAME  : 'segmentsZ',
    IMAGE_CROSS_ORIGIN_ANON : 'anonymous'
});

// Validation and resource error messages, used by 'HeightmapGeometry'
export const HEIGHTMAP_ERRORS = Object.freeze({
    OPTIONS_PLAIN_OBJECT : 'HeightmapGeometry expects options as a plain object.',
    WEBGL_CONTEXT        : 'HeightmapGeometry expects webglContext as a WebGL2RenderingContext.',
    HEIGHTMAP_IMAGE_DATA : 'HeightmapGeometry expects heightmapImageData as an ImageData instance or a HeightmapSource with imageData.',
    SIZE_VALUES          : 'HeightmapGeometry expects width and depth as positive numbers.',
    HEIGHT_SCALE_VALUE   : 'HeightmapGeometry expects heightScale as a positive number.',
    HEIGHT_OFFSET_VALUE  : 'HeightmapGeometry expects heightOffset as a finite number.',
    COLORS_BUFFER        : 'HeightmapGeometry expects colors as a Float32Array.',
    FLIP_Y_VALUE         : 'HeightmapGeometry expects flipY as a boolean.',
    WIREFRAME_VALUE      : 'HeightmapGeometry expects isWireframe as a boolean.',
    SAMPLING_VALUE       : 'HeightmapGeometry expects sampling to be a supported string value.',
    LOAD_URL             : 'HeightmapGeometry.loadFromUrl expects url as a non-empty string.',
    LOAD_OPTIONS         : 'HeightmapGeometry.loadFromUrl expects options as a plain object.',
    CANVAS_CONTEXT       : 'HeightmapGeometry.loadFromUrl failed to acquire a 2D canvas context.',
    LOAD_IMAGE_PREFIX    : 'Failed to load the heightmap image: '
});

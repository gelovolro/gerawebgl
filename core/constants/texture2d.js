import { MATH_COMMON_VALUES } from './math.js';

// Mipmap generation policies, used by 'Texture2D'
export const TEXTURE2D_MIPMAP_POLICIES = Object.freeze({
    NONE   : 0,
    ALWAYS : 1,
    AUTO   : 2
});

// Initial upload orientation and mipmap policy
export const TEXTURE2D_DEFAULTS = Object.freeze({
    FLIP_Y        : true,
    MIPMAP_POLICY : TEXTURE2D_MIPMAP_POLICIES.AUTO
});

// Supported cross-origin modes for image requests
export const TEXTURE2D_CROSS_ORIGIN = Object.freeze({
    ANONYMOUS       : 'anonymous',
    USE_CREDENTIALS : 'use-credentials'
});

// Dimensions of the placeholder texture, used before an image has loaded
export const TEXTURE2D_PLACEHOLDER = Object.freeze({
    WIDTH  : 1,
    HEIGHT : 1
});

// Mipmap level, border and boolean values passed to WebGL
export const TEXTURE2D_UPLOAD = Object.freeze({
    BASE_MIPMAP_LEVEL : 0,
    BORDER            : 0,
    TRUE_AS_INTEGER   : 1,
    FALSE_AS_INTEGER  : 0
});

// Minimum accepted texture unit index and URL length
export const TEXTURE2D_LIMITS = Object.freeze({
    MIN_TEXTURE_UNIT_INDEX : MATH_COMMON_VALUES.ZERO,
    MIN_URL_LENGTH         : 1
});

// Magenta RGBA pixel uploaded while the image is loading
export const TEXTURE2D_PLACEHOLDER_PIXEL = new Uint8Array([255, 0, 255, 255]);

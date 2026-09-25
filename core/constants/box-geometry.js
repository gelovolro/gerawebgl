import { GEOMETRY_LAYOUT, GEOMETRY_DIRECTIONS } from './geometry.js';

// Default options, used by 'BoxGeometry'
export const BOX_DEFAULTS = Object.freeze({
    SIZE          : 1.0,
    SEGMENT_COUNT : 1
});

// Buffer layout and geometry construction values, used by 'BoxGeometry'
export const BOX_LAYOUT = Object.freeze({
    FACE_COUNT             : 6,
    COLORS_PER_FACE_LENGTH : 6 * GEOMETRY_LAYOUT.COLOR_COMPONENT_COUNT
});

// Minimum accepted counts and values, used by 'BoxGeometry'
export const BOX_LIMITS = Object.freeze({ MIN_SEGMENT_COUNT: 1 });

// Face axes and option names, in the existing front, back, top, bottom, right and left order
export const BOX_FACES = Object.freeze([
    // Front (+Z)
    Object.freeze({
        axisU          : GEOMETRY_DIRECTIONS.POSITIVE_X,
        axisV          : GEOMETRY_DIRECTIONS.POSITIVE_Y,
        normal         : GEOMETRY_DIRECTIONS.POSITIVE_Z,
        fixedDimension : 'depth',
        sizeU          : 'width',
        sizeV          : 'height',
        segmentsU      : 'widthSegments',
        segmentsV      : 'heightSegments'
    }),

    // Back (-Z)
    Object.freeze({
        axisU          : GEOMETRY_DIRECTIONS.NEGATIVE_X,
        axisV          : GEOMETRY_DIRECTIONS.POSITIVE_Y,
        normal         : GEOMETRY_DIRECTIONS.NEGATIVE_Z,
        fixedDimension : 'depth',
        sizeU          : 'width',
        sizeV          : 'height',
        segmentsU      : 'widthSegments',
        segmentsV      : 'heightSegments'
    }),

    // Top (+Y)
    Object.freeze({
        axisU          : GEOMETRY_DIRECTIONS.POSITIVE_X,
        axisV          : GEOMETRY_DIRECTIONS.NEGATIVE_Z,
        normal         : GEOMETRY_DIRECTIONS.POSITIVE_Y,
        fixedDimension : 'height',
        sizeU          : 'width',
        sizeV          : 'depth',
        segmentsU      : 'widthSegments',
        segmentsV      : 'depthSegments'
    }),

    // Bottom (-Y)
    Object.freeze({
        axisU          : GEOMETRY_DIRECTIONS.POSITIVE_X,
        axisV          : GEOMETRY_DIRECTIONS.POSITIVE_Z,
        normal         : GEOMETRY_DIRECTIONS.NEGATIVE_Y,
        fixedDimension : 'height',
        sizeU          : 'width',
        sizeV          : 'depth',
        segmentsU      : 'widthSegments',
        segmentsV      : 'depthSegments'
    }),

    // Right (+X)
    Object.freeze({
        axisU          : GEOMETRY_DIRECTIONS.NEGATIVE_Z,
        axisV          : GEOMETRY_DIRECTIONS.POSITIVE_Y,
        normal         : GEOMETRY_DIRECTIONS.POSITIVE_X,
        fixedDimension : 'width',
        sizeU          : 'depth',
        sizeV          : 'height',
        segmentsU      : 'depthSegments',
        segmentsV      : 'heightSegments'
    }),

    // Left (-X)
    Object.freeze({
        axisU          : GEOMETRY_DIRECTIONS.POSITIVE_Z,
        axisV          : GEOMETRY_DIRECTIONS.POSITIVE_Y,
        normal         : GEOMETRY_DIRECTIONS.NEGATIVE_X,
        fixedDimension : 'width',
        sizeU          : 'depth',
        sizeV          : 'height',
        segmentsU      : 'depthSegments',
        segmentsV      : 'heightSegments'
    })
]);

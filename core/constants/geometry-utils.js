import { GEOMETRY_LAYOUT } from './geometry.js';

export {
    GEOMETRY_COLOR_INDEXES,
    GEOMETRY_TRIANGLE_INDEXES,
    GEOMETRY_DEFAULT_VERTEX_COLOR
} from './geometry.js';

// RGB-component count and automatic buffer length, used by 'GeometryUtils'
export const GEOMETRY_COLORS = Object.freeze({
    COMPONENT_COUNT : GEOMETRY_LAYOUT.COLOR_COMPONENT_COUNT,
    AUTO_LENGTH     : 0
});

// Index limits and iteration values, used by 'GeometryUtils'
export const GEOMETRY_INDICES = Object.freeze({
    MAX_UINT16_INDEX_VALUE           : 0xffff,
    VERTEX_COUNT_TO_MAX_INDEX_OFFSET : 1,
    MIN_VERTEX_COUNT                 : 0,
    FIRST_VERTEX_INDEX               : 0,
    SEQUENTIAL_INDEX_INCREMENT       : 1,
    TRIANGLE_INDEX_STRIDE            : GEOMETRY_LAYOUT.TRIANGLE_INDEX_COUNT
});

// Separator between vertex indexes in an undirected edge key
export const GEOMETRY_EDGE_KEY_SEPARATOR = ',';

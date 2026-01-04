import { Vector3 } from '../math/vector3.js';
import { Geometry, PRIMITIVE_LINES, PRIMITIVE_TRIANGLES }           from './geometry.js';
import { createIndexArray, createWireframeIndicesFromSolidIndices } from './geometry-utils.js';

/**
 * Number of components per position.
 *
 * @type {number}
 */
const POSITION_COMPONENT_COUNT = 3;

/**
 * Offset for X component in position triplet.
 *
 * @type {number}
 */
const POSITION_X_OFFSET = 0;

/**
 * Offset for Y component in position triplet.
 *
 * @type {number}
 */
const POSITION_Y_OFFSET = 1;

/**
 * Offset for Z component in position triplet.
 *
 * @type {number}
 */
const POSITION_Z_OFFSET = 2;

/**
 * Minimum point count for a tube line.
 *
 * @type {number}
 */
const MIN_POINT_COUNT = 2;

/**
 * Default radius for the tube line.
 *
 * @type {number}
 */
const DEFAULT_RADIUS = 0.05;

/**
 * Default tube width (when specified, overrides the radius).
 *
 * @type {null}
 */
const DEFAULT_WIDTH = null;

/**
 * Default radial segments.
 *
 * @type {number}
 */
const DEFAULT_RADIAL_SEGMENTS = 8;

/**
 * Minimum radial segments for a tube.
 *
 * @type {number}
 */
const MIN_RADIAL_SEGMENTS = 3;

/**
 * Default closed flag.
 *
 * @type {boolean}
 */
const DEFAULT_CLOSED = false;

/**
 * Cap type: no caps.
 *
 * @type {string}
 */
const CAP_TYPE_NONE = 'none';

/**
 * Cap type: flat caps.
 *
 * @type {string}
 */
const CAP_TYPE_FLAT = 'flat';

/**
 * Default cap type.
 *
 * @type {string}
 */
const DEFAULT_CAP_TYPE = CAP_TYPE_NONE;

/**
 * Error message for invalid cap type.
 *
 * @type {string}
 */
const ERROR_INVALID_CAP_TYPE = `\`TubeLineGeometry\` expects \`capType\` to be "${CAP_TYPE_NONE}" or "${CAP_TYPE_FLAT}".`;

/**
 * Offset used to compute radius from width.
 *
 * @type {number}
 */
const WIDTH_TO_RADIUS_DIVISOR = 2;

/**
 * Two PI constant.
 *
 * @type {number}
 */
const TWO_PI = Math.PI * 2;

/**
 * Small epsilon used for vector normalization.
 *
 * @type {number}
 */
const NORMALIZE_EPSILON = 1e-8;

/**
 * Up axis used for frame generation.
 *
 * @type {number}
 */
const UP_AXIS_X = 0;

/**
 * Up axis used for frame generation.
 *
 * @type {number}
 */
const UP_AXIS_Y = 1;

/**
 * Up axis used for frame generation.
 *
 * @type {number}
 */
const UP_AXIS_Z = 0;

/**
 * Fallback axis X component used, when tangent is parallel to up axis.
 *
 * @type {number}
 */
const FALLBACK_AXIS_X = 1;

/**
 * Fallback axis Y component used, when tangent is parallel to up axis.
 *
 * @type {number}
 */
const FALLBACK_AXIS_Y = 0;

/**
 * Fallback axis Z component used, when tangent is parallel to up axis.
 *
 * @type {number}
 */
const FALLBACK_AXIS_Z = 0;

/**
 * Secondary fallback axis X component.
 *
 * @type {number}
 */
const SECOND_FALLBACK_AXIS_X = 0;

/**
 * Secondary fallback axis Y component.
 *
 * @type {number}
 */
const SECOND_FALLBACK_AXIS_Y = 0;

/**
 * Secondary fallback axis Z component.
 *
 * @type {number}
 */
const SECOND_FALLBACK_AXIS_Z = 1;

/**
 * Default zero value.
 *
 * @type {number}
 */
const ZERO_VALUE = 0;

/**
 * One value.
 *
 * @type {number}
 */
const ONE_VALUE = 1;

/**
 * Two value.
 *
 * @type {number}
 */
const TWO_VALUE = 2;

/**
 * Options used by `TubeLineGeometry`.
 *
 * @typedef {Object} TubeLineGeometryOptions
 * @property {Vector3[]} positions          - Path positions.
 * @property {number} [radius = 0.05]       - Tube radius.
 * @property {number | null} [width = null] - Optional tube width (overrides the radius).
 * @property {number} [radialSegments = 8]  - Radial segment count.
 * @property {boolean} [closed = false]     - Whether to close the tube.
 * @property {string} [capType = 'none']    - Cap type (none|flat).
 */

/**
 * Geometry for thick debug lines (tube around the polyline).
 */
export class TubeLineGeometry extends Geometry {

    /**
     * @param {WebGL2RenderingContext} webglContext - WebGL2 rendering context.
     * @param {TubeLineGeometryOptions} options     - Tube geometry options.
     * @throws {TypeError}  When inputs are invalid.
     * @throws {RangeError} When numeric inputs are out of range.
     */
    constructor(webglContext, options = {}) {
        if (options === null || typeof options !== 'object' || Array.isArray(options)) {
            throw new TypeError('`TubeLineGeometry` expects options as a plain object.');
        }

        const {
            positions,
            radius         = DEFAULT_RADIUS,
            width          = DEFAULT_WIDTH,
            radialSegments = DEFAULT_RADIAL_SEGMENTS,
            closed         = DEFAULT_CLOSED,
            capType        = DEFAULT_CAP_TYPE
        } = options;

        if (!Array.isArray(positions)) {
            throw new TypeError('`TubeLineGeometry` expects `positions` as an array of `Vector3`.');
        }

        if (positions.length < MIN_POINT_COUNT) {
            throw new RangeError('`TubeLineGeometry` expects at least the 2 points.');
        }

        for (const point of positions) {
            if (!(point instanceof Vector3)) {
                throw new TypeError('`TubeLineGeometry` expects all positions to be the `Vector3` instances.');
            }
        }

        if (typeof radius !== 'number' || !Number.isFinite(radius) || radius <= ZERO_VALUE) {
            throw new RangeError('`TubeLineGeometry` expects `radius` as a positive number.');
        }

        if (width !== null && (typeof width !== 'number' || !Number.isFinite(width) || width <= ZERO_VALUE)) {
            throw new RangeError('`TubeLineGeometry` expects `width` as a positive number or null.');
        }

        if (!Number.isInteger(radialSegments) || radialSegments < MIN_RADIAL_SEGMENTS) {
            throw new RangeError('`TubeLineGeometry` expects `radialSegments` as an `integer >= 3`.');
        }

        if (typeof closed !== 'boolean') {
            throw new TypeError('`TubeLineGeometry` expects `closed` as a boolean.');
        }

        if (capType !== CAP_TYPE_NONE && capType !== CAP_TYPE_FLAT) {
            throw new RangeError(ERROR_INVALID_CAP_TYPE);
        }

        const resolvedRadius   = width !== null ? (width / WIDTH_TO_RADIUS_DIVISOR) : radius;
        const baseVertexCount  = positions.length * radialSegments;
        const addCaps          = capType === CAP_TYPE_FLAT && !closed;
        const extraCapVertices = addCaps ? TWO_VALUE : ZERO_VALUE;
        const totalVertexCount = baseVertexCount + extraCapVertices;
        const positionsBuffer  = new Float32Array(totalVertexCount * POSITION_COMPONENT_COUNT);

        TubeLineGeometry.#writeRingPositions(positionsBuffer, positions, radialSegments, resolvedRadius, closed);

        if (addCaps) {
            TubeLineGeometry.#writeCapCenters(positionsBuffer, positions, baseVertexCount);
        }

        const indices          = TubeLineGeometry.#buildIndices(positions.length, radialSegments, closed, addCaps, baseVertexCount);
        const wireframeIndices = createWireframeIndicesFromSolidIndices(totalVertexCount, indices);

        super(
            webglContext,
            positionsBuffer,
            null,
            indices,
            wireframeIndices,
            null,
            null,
            {
                solidPrimitive     : PRIMITIVE_TRIANGLES,
                wireframePrimitive : PRIMITIVE_LINES
            }
        );
    }

    /**
     * @param {Float32Array} buffer   - Output positions buffer.
     * @param {Vector3[]} positions   - Input path positions.
     * @param {number} radialSegments - Radial segment count.
     * @param {number} radius         - Tube radius.
     * @param {boolean} closed        - Whether path is closed.
     * @private
     */
    static #writeRingPositions(buffer, positions, radialSegments, radius, closed) {
        const pointCount = positions.length;

        for (let index = ZERO_VALUE; index < pointCount; index += ONE_VALUE) {
            const previousIndex = TubeLineGeometry.#getPreviousIndex(index, pointCount, closed);
            const nextIndex     = TubeLineGeometry.#getNextIndex(index, pointCount, closed);
            const tangent       = TubeLineGeometry.#computeTangent(positions[previousIndex], positions[nextIndex]);
            const normal        = TubeLineGeometry.#computeNormal(tangent);
            const binormal      = TubeLineGeometry.#computeBinormal(tangent, normal);
            const ringBase      = index * radialSegments;
            const point         = positions[index];

            for (let segmentIndex = ZERO_VALUE; segmentIndex < radialSegments; segmentIndex += ONE_VALUE) {
                const angle       = TWO_PI * (segmentIndex / radialSegments);
                const cosAngle    = Math.cos(angle);
                const sinAngle    = Math.sin(angle);
                const offsetX     = (normal.x * cosAngle + binormal.x * sinAngle) * radius;
                const offsetY     = (normal.y * cosAngle + binormal.y * sinAngle) * radius;
                const offsetZ     = (normal.z * cosAngle + binormal.z * sinAngle) * radius;
                const vertexIndex = ringBase + segmentIndex;
                const baseIndex   = vertexIndex * POSITION_COMPONENT_COUNT;
                buffer[baseIndex + POSITION_X_OFFSET] = point.x + offsetX;
                buffer[baseIndex + POSITION_Y_OFFSET] = point.y + offsetY;
                buffer[baseIndex + POSITION_Z_OFFSET] = point.z + offsetZ;
            }
        }
    }

    /**
     * @param {Float32Array} buffer    - Output positions buffer.
     * @param {Vector3[]} positions    - Input path positions.
     * @param {number} baseVertexCount - Base vertex count before caps.
     * @private
     */
    static #writeCapCenters(buffer, positions, baseVertexCount) {
        const startBaseIndex = baseVertexCount * POSITION_COMPONENT_COUNT;
        const endBaseIndex   = (baseVertexCount + ONE_VALUE) * POSITION_COMPONENT_COUNT;
        const startPoint     = positions[ZERO_VALUE];
        const endPoint       = positions[positions.length - ONE_VALUE];

        buffer[startBaseIndex + POSITION_X_OFFSET] = startPoint.x;
        buffer[startBaseIndex + POSITION_Y_OFFSET] = startPoint.y;
        buffer[startBaseIndex + POSITION_Z_OFFSET] = startPoint.z;
        buffer[endBaseIndex + POSITION_X_OFFSET]   = endPoint.x;
        buffer[endBaseIndex + POSITION_Y_OFFSET]   = endPoint.y;
        buffer[endBaseIndex + POSITION_Z_OFFSET]   = endPoint.z;
    }

    /**
     * @param {number} pointCount      - Number of path points.
     * @param {number} radialSegments  - Radial segment count.
     * @param {boolean} closed         - Whether path is closed.
     * @param {boolean} addCaps        - Whether caps are added.
     * @param {number} baseVertexCount - Base vertex count before caps.
     * @returns {Uint16Array | Uint32Array}
     * @private
     */
    static #buildIndices(pointCount, radialSegments, closed, addCaps, baseVertexCount) {
        const segmentCount = closed ? pointCount : (pointCount - ONE_VALUE);
        const indices      = [];

        for (let segmentIndex = ZERO_VALUE; segmentIndex < segmentCount; segmentIndex += ONE_VALUE) {
            const ringStart     = segmentIndex * radialSegments;
            const nextRingStart = ((segmentIndex + ONE_VALUE) % pointCount) * radialSegments;

            for (let radialIndex = ZERO_VALUE; radialIndex < radialSegments; radialIndex += ONE_VALUE) {
                const nextRadialIndex = (radialIndex + ONE_VALUE) % radialSegments;
                const groupA          = ringStart + radialIndex;
                const groupB          = ringStart + nextRadialIndex;
                const groupC          = nextRingStart + radialIndex;
                const groupD          = nextRingStart + nextRadialIndex;
                indices.push(groupA, groupC, groupB);
                indices.push(groupB, groupC, groupD);
            }
        }

        if (addCaps) {
            const startCenterIndex = baseVertexCount;
            const endCenterIndex   = baseVertexCount + ONE_VALUE;
            const startRingStart   = ZERO_VALUE;
            const endRingStart     = (pointCount - ONE_VALUE) * radialSegments;

            for (let radialIndex = ZERO_VALUE; radialIndex < radialSegments; radialIndex += ONE_VALUE) {
                const nextRadialIndex = (radialIndex + ONE_VALUE) % radialSegments;
                const startA          = startRingStart + radialIndex;
                const startB          = startRingStart + nextRadialIndex;
                indices.push(startCenterIndex, startB, startA);

                const endA = endRingStart + radialIndex;
                const endB = endRingStart + nextRadialIndex;
                indices.push(endCenterIndex, endA, endB);
            }
        }

        return createIndexArray(baseVertexCount + (addCaps ? TWO_VALUE : ZERO_VALUE), indices);
    }

    /**
     * @param {number} index   - Current index.
     * @param {number} count   - Total count.
     * @param {boolean} closed - Whether path is closed.
     * @returns {number}
     * @private
     */
    static #getPreviousIndex(index, count, closed) {
        if (index > ZERO_VALUE) {
            return index - ONE_VALUE;
        }

        return closed ? (count - ONE_VALUE) : index;
    }

    /**
     * @param {number} index   - Current index.
     * @param {number} count   - Total count.
     * @param {boolean} closed - Whether path is closed.
     * @returns {number}
     * @private
     */
    static #getNextIndex(index, count, closed) {
        if (index < count - ONE_VALUE) {
            return index + ONE_VALUE;
        }

        return closed ? ZERO_VALUE : index;
    }

    /**
     * @param {Vector3} pointA - Start point.
     * @param {Vector3} pointB - End point.
     * @returns {Vector3}
     * @private
     */
    static #computeTangent(pointA, pointB) {
        const deltaX = pointB.x - pointA.x;
        const deltaY = pointB.y - pointA.y;
        const deltaZ = pointB.z - pointA.z;
        const length = Math.sqrt((deltaX * deltaX) + (deltaY * deltaY) + (deltaZ * deltaZ));

        if (length <= NORMALIZE_EPSILON) {
            return new Vector3(ZERO_VALUE, ONE_VALUE, ZERO_VALUE);
        }

        return new Vector3(deltaX / length, deltaY / length, deltaZ / length);
    }

    /**
     * @param {Vector3} tangent - Tangent direction.
     * @returns {Vector3}
     * @private
     */
    static #computeNormal(tangent) {
        let normalX = (tangent.y * UP_AXIS_Z) - (tangent.z * UP_AXIS_Y);
        let normalY = (tangent.z * UP_AXIS_X) - (tangent.x * UP_AXIS_Z);
        let normalZ = (tangent.x * UP_AXIS_Y) - (tangent.y * UP_AXIS_X);
        let length = Math.sqrt((normalX * normalX) + (normalY * normalY) + (normalZ * normalZ));

        if (length <= NORMALIZE_EPSILON) {
            normalX = (tangent.y * FALLBACK_AXIS_Z) - (tangent.z * FALLBACK_AXIS_Y);
            normalY = (tangent.z * FALLBACK_AXIS_X) - (tangent.x * FALLBACK_AXIS_Z);
            normalZ = (tangent.x * FALLBACK_AXIS_Y) - (tangent.y * FALLBACK_AXIS_X);
            length  = Math.sqrt((normalX * normalX) + (normalY * normalY) + (normalZ * normalZ));
        }

        if (length <= NORMALIZE_EPSILON) {
            normalX = (tangent.y * SECOND_FALLBACK_AXIS_Z) - (tangent.z * SECOND_FALLBACK_AXIS_Y);
            normalY = (tangent.z * SECOND_FALLBACK_AXIS_X) - (tangent.x * SECOND_FALLBACK_AXIS_Z);
            normalZ = (tangent.x * SECOND_FALLBACK_AXIS_Y) - (tangent.y * SECOND_FALLBACK_AXIS_X);
            length  = Math.sqrt((normalX * normalX) + (normalY * normalY) + (normalZ * normalZ));
        }

        if (length <= NORMALIZE_EPSILON) {
            return new Vector3(ONE_VALUE, ZERO_VALUE, ZERO_VALUE);
        }

        return new Vector3(normalX / length, normalY / length, normalZ / length);
    }

    /**
     * @param {Vector3} tangent - Tangent direction.
     * @param {Vector3} normal  - Normal vector.
     * @returns {Vector3}
     * @private
     */
    static #computeBinormal(tangent, normal) {
        const binormalX = (tangent.y * normal.z) - (tangent.z * normal.y);
        const binormalY = (tangent.z * normal.x) - (tangent.x * normal.z);
        const binormalZ = (tangent.x * normal.y) - (tangent.y * normal.x);
        const length    = Math.sqrt((binormalX * binormalX) + (binormalY * binormalY) + (binormalZ * binormalZ));

        if (length <= NORMALIZE_EPSILON) {
            return new Vector3(ZERO_VALUE, ZERO_VALUE, ZERO_VALUE);
        }

        return new Vector3(binormalX / length, binormalY / length, binormalZ / length);
    }
}

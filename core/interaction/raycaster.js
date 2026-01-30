import { Matrix4 } from '../math/matrix4.js';
import { Scene }   from '../scene/scene.js';
import { Camera }  from '../scene/camera.js';
import { Mesh }    from '../scene/mesh.js';

/**
 * Base value for boolean defaults.
 *
 * @type {boolean}
 */
const DEFAULT_RECURSIVE = true;

/**
 * Default filter value.
 *
 * @type {null}
 */
const DEFAULT_FILTER = null;

/**
 * Default sorting flag for raycast results.
 *
 * @type {boolean}
 */
const DEFAULT_SORT = true;

/**
 * Minimum NDC value for the near plane.
 *
 * @type {number}
 */
const NDC_NEAR = -1.0;

/**
 * Maximum NDC value for the far plane.
 *
 * @type {number}
 */
const NDC_FAR = 1.0;

/**
 * Clip-space `W component` for unprojection.
 *
 * @type {number}
 */
const CLIP_W = 1.0;

/**
 * Zero component value.
 *
 * @type {number}
 */
const ZERO_COMPONENT = 0.0;

/**
 * One component value.
 *
 * @type {number}
 */
const ONE_COMPONENT = 1.0;

/**
 * Matrix element indices for the 4x4 matrices.
 *
 * @type {number}
 */
const MATRIX_INDEX_00 = 0;
const MATRIX_INDEX_01 = 1;
const MATRIX_INDEX_02 = 2;
const MATRIX_INDEX_03 = 3;
const MATRIX_INDEX_10 = 4;
const MATRIX_INDEX_11 = 5;
const MATRIX_INDEX_12 = 6;
const MATRIX_INDEX_13 = 7;
const MATRIX_INDEX_20 = 8;
const MATRIX_INDEX_21 = 9;
const MATRIX_INDEX_22 = 10;
const MATRIX_INDEX_23 = 11;
const MATRIX_INDEX_30 = 12;
const MATRIX_INDEX_31 = 13;
const MATRIX_INDEX_32 = 14;
const MATRIX_INDEX_33 = 15;

/**
 * Loop start index.
 *
 * @type {number}
 */
const LOOP_START_INDEX = 0;

/**
 * Loop increment value.
 *
 * @type {number}
 */
const LOOP_INCREMENT = 1;

/**
 * Index for X component in arrays.
 *
 * @type {number}
 */
const VECTOR_INDEX_X = 0;

/**
 * Index for Y component in arrays.
 *
 * @type {number}
 */
const VECTOR_INDEX_Y = 1;

/**
 * Index for Z component in arrays.
 *
 * @type {number}
 */
const VECTOR_INDEX_Z = 2;

/**
 * Range array index: min.
 *
 * @type {number}
 */
const RANGE_MIN_INDEX = 0;

/**
 * Range array index: max.
 *
 * @type {number}
 */
const RANGE_MAX_INDEX = 1;

/**
 * Minimum ray parameter value.
 *
 * @type {number}
 */
const RAY_T_MIN = 0.0;

/**
 * Maximum ray parameter initial value.
 *
 * @type {number}
 */
const RAY_T_MAX_INIT = Number.POSITIVE_INFINITY;

/**
 * Epsilon used for ray direction checks.
 *
 * @type {number}
 */
const RAY_DIRECTION_EPSILON = 1e-8;

/**
 * Inverse numerator used in direction inverse computations.
 *
 * @type {number}
 */
const INVERSE_DIRECTION_NUMERATOR = 1.0;

/**
 * Component key for X.
 *
 * @type {string}
 */
const COMPONENT_X = 'x';

/**
 * Component key for Y.
 *
 * @type {string}
 */
const COMPONENT_Y = 'y';

/**
 * Component key for Z.
 *
 * @type {string}
 */
const COMPONENT_Z = 'z';

/**
 * Intersection object key.
 *
 * @type {string}
 */
const INTERSECTION_OBJECT_KEY = 'object';

/**
 * Intersection distance key.
 *
 * @type {string}
 */
const INTERSECTION_DISTANCE_KEY = 'distance';

/**
 * Intersection point key.
 *
 * @type {string}
 */
const INTERSECTION_POINT_KEY = 'point';

/**
 * Raycast options key: recursive.
 *
 * @type {string}
 */
const OPTION_RECURSIVE_KEY = 'recursive';

/**
 * Raycast options key: filter.
 *
 * @type {string}
 */
const OPTION_FILTER_KEY = 'filter';

/**
 * Raycast options key: sort.
 *
 * @type {string}
 */
const OPTION_SORT_KEY = 'sort';

/**
 * Mouse NDC key: x.
 *
 * @type {string}
 */
const MOUSE_NDC_X_KEY = 'x';

/**
 * Mouse NDC key: y.
 *
 * @type {string}
 */
const MOUSE_NDC_Y_KEY = 'y';

/**
 * Error message: invalid scene.
 *
 * @type {string}
 */
const ERROR_SCENE_TYPE = '`Raycaster.raycast` expects scene as a `Scene` instance.';

/**
 * Error message: invalid camera.
 *
 * @type {string}
 */
const ERROR_CAMERA_TYPE = '`Raycaster.raycast` expects camera as a `Camera` instance.';

/**
 * Error message: invalid mouse ndc object.
 *
 * @type {string}
 */
const ERROR_MOUSE_NDC_TYPE = '`Raycaster.raycast` expects `mouseNdc` as an object with numeric x/y.';

/**
 * Error message: invalid options object.
 *
 * @type {string}
 */
const ERROR_OPTIONS_TYPE = '`Raycaster.raycast` expects options as a plain object.';

/**
 * Error message: invalid recursive option.
 *
 * @type {string}
 */
const ERROR_OPTION_RECURSIVE_TYPE = '`Raycaster.raycast` option recursive must be a boolean.';

/**
 * Error message: invalid filter option.
 *
 * @type {string}
 */
const ERROR_OPTION_FILTER_TYPE = '`Raycaster.raycast` option filter must be a function or null.';

/**
 * Error message: invalid sort option.
 *
 * @type {string}
 */
const ERROR_OPTION_SORT_TYPE = '`Raycaster.raycast` option sort must be a boolean.';

/**
 * Error message: invalid unproject W component.
 *
 * @type {string}
 */
const ERROR_UNPROJECT_W_ZERO = '`Raycaster.raycast` failed to unproject, `W component` is zero.';

/**
 * @typedef {Object} RaycastPoint
 * @property {number} x - X coordinate.
 * @property {number} y - Y coordinate.
 * @property {number} z - Z coordinate.
 */

/**
 * @typedef {Object} Intersection
 * @property {Mesh} object        - Intersected mesh.
 * @property {number} distance    - Distance from ray origin to the intersection point.
 * @property {RaycastPoint} point - Intersection point in world space.
 */

/**
 * @typedef {Object} RaycastOptions
 * @property {boolean} [recursive=true]                     - When true, traverses all descendants of the scene.
 * @property {function(Mesh): boolean | null} [filter=null] - Optional mesh filter.
 * @property {boolean} [sort=true]                          - When true, sorts intersections by distance.
 */

/**
 * @typedef {Object} Ray
 * @property {RaycastPoint} origin    - Ray origin in world space.
 * @property {RaycastPoint} direction - Normalized ray direction in world space.
 */

/**
 * Raycaster performs raycasting against scene meshes using their local AABB.
 */
export class Raycaster {
    /**
     * Performs a raycast against the given scene and returns intersections.
     *
     * @param {Scene} scene                     - Scene to query.
     * @param {Camera} camera                   - Camera used to build the ray.
     * @param {{x: number, y: number}} mouseNdc - Mouse coordinates in NDC space [-1..1].
     * @param {RaycastOptions} [options]        - Optional raycast settings.
     * @returns {Intersection[]}                - Intersection list.
     */
    raycast(scene, camera, mouseNdc, options = {}) {
        if (!(scene instanceof Scene)) {
            throw new TypeError(ERROR_SCENE_TYPE);
        }

        if (!(camera instanceof Camera)) {
            throw new TypeError(ERROR_CAMERA_TYPE);
        }

        if (mouseNdc === null || typeof mouseNdc !== 'object' || Array.isArray(mouseNdc)) {
            throw new TypeError(ERROR_MOUSE_NDC_TYPE);
        }

        if (typeof mouseNdc[MOUSE_NDC_X_KEY] !== 'number' || typeof mouseNdc[MOUSE_NDC_Y_KEY] !== 'number') {
            throw new TypeError(ERROR_MOUSE_NDC_TYPE);
        }

        if (options === null || typeof options !== 'object' || Array.isArray(options)) {
            throw new TypeError(ERROR_OPTIONS_TYPE);
        }

        const recursive  = OPTION_RECURSIVE_KEY in options ? options[OPTION_RECURSIVE_KEY] : DEFAULT_RECURSIVE;
        const filter     = OPTION_FILTER_KEY in options ? options[OPTION_FILTER_KEY] : DEFAULT_FILTER;
        const shouldSort = OPTION_SORT_KEY in options ? options[OPTION_SORT_KEY] : DEFAULT_SORT;

        if (typeof recursive !== 'boolean') {
            throw new TypeError(ERROR_OPTION_RECURSIVE_TYPE);
        }

        if (filter !== null && typeof filter !== 'function') {
            throw new TypeError(ERROR_OPTION_FILTER_TYPE);
        }

        if (typeof shouldSort !== 'boolean') {
            throw new TypeError(ERROR_OPTION_SORT_TYPE);
        }

        scene.updateWorldMatrix({ parentWorldMatrix: null });

        const viewMatrix                  = camera.getViewMatrix();
        const projectionMatrix            = camera.getProjectionMatrix();
        const viewProjectionMatrix        = Matrix4.multiply(projectionMatrix, viewMatrix);
        const inverseViewProjectionMatrix = Matrix4.invert(viewProjectionMatrix);
        const ray = Raycaster.#createRay(inverseViewProjectionMatrix, mouseNdc[MOUSE_NDC_X_KEY], mouseNdc[MOUSE_NDC_Y_KEY]);
        const intersections = [];

        if (recursive) {
            scene.traverse((object) => Raycaster.#collectIntersection(object, ray, filter, intersections));
        } else {
            const children = scene.children;

            for (let index = LOOP_START_INDEX; index < children.length; index += LOOP_INCREMENT) {
                Raycaster.#collectIntersection(children[index], ray, filter, intersections);
            }
        }

        if (shouldSort) {
            intersections.sort((left, right) => left[INTERSECTION_DISTANCE_KEY] - right[INTERSECTION_DISTANCE_KEY]);
        }

        return intersections;
    }

    /**
     * @param {Object} object                - Scene object.
     * @param {Object} ray                   - Ray data with origin/direction.
     * @param {Function | null} filter       - Optional mesh filter.
     * @param {Intersection[]} intersections - Output array.
     * @private
     */
    static #collectIntersection(object, ray, filter, intersections) {
        if (!(object instanceof Mesh)) {
            return;
        }

        if (object.isDisposed) {
            return;
        }

        if (filter && filter(object) === false) {
            return;
        }

        const geometry           = object.geometry;
        const boundingBoxMin     = geometry.getBoundingBoxMin();
        const boundingBoxMax     = geometry.getBoundingBoxMax();
        const inverseWorldMatrix = Matrix4.invert(object.worldMatrix);
        const localOrigin        = Raycaster.#transformPoint(inverseWorldMatrix, ray.origin, ONE_COMPONENT);
        const localDirection     = Raycaster.#transformPoint(inverseWorldMatrix, ray.direction, ZERO_COMPONENT);
        const hitDistance        = Raycaster.#intersectRayAabb(localOrigin, localDirection, boundingBoxMin, boundingBoxMax);

        if (hitDistance === null) {
            return;
        }

        const localPoint = {
            [COMPONENT_X] : localOrigin[COMPONENT_X] + (localDirection[COMPONENT_X] * hitDistance),
            [COMPONENT_Y] : localOrigin[COMPONENT_Y] + (localDirection[COMPONENT_Y] * hitDistance),
            [COMPONENT_Z] : localOrigin[COMPONENT_Z] + (localDirection[COMPONENT_Z] * hitDistance)
        };

        const worldPoint = Raycaster.#transformPoint(object.worldMatrix, localPoint, ONE_COMPONENT);
        const distance   = Raycaster.#distanceBetween(ray.origin, worldPoint);

        intersections.push({
            [INTERSECTION_OBJECT_KEY]   : object,
            [INTERSECTION_DISTANCE_KEY] : distance,
            [INTERSECTION_POINT_KEY]    : worldPoint
        });
    }

    /**
     * @param {Float32Array} inverseViewProjectionMatrix - Inverse view-projection matrix.
     * @param {number} ndcX                              - Normalized device coordinate X.
     * @param {number} ndcY                              - Normalized device coordinate Y.
     * @returns {Ray}                                    - Ray with origin and direction in world space.
     * @private
     */
    static #createRay(inverseViewProjectionMatrix, ndcX, ndcY) {
        const nearPoint = Raycaster.#unproject(inverseViewProjectionMatrix, ndcX, ndcY, NDC_NEAR);
        const farPoint  = Raycaster.#unproject(inverseViewProjectionMatrix, ndcX, ndcY, NDC_FAR);
        const direction = Raycaster.#normalizeVector({
            [COMPONENT_X] : farPoint[COMPONENT_X] - nearPoint[COMPONENT_X],
            [COMPONENT_Y] : farPoint[COMPONENT_Y] - nearPoint[COMPONENT_Y],
            [COMPONENT_Z] : farPoint[COMPONENT_Z] - nearPoint[COMPONENT_Z]
        });

        return {
            origin: nearPoint,
            direction
        };
    }

    /**
     * @param {Float32Array} matrix - Inverse view-projection matrix.
     * @param {number} ndcX         - NDC x.
     * @param {number} ndcY         - NDC y.
     * @param {number} ndcZ         - NDC z.
     * @returns {RaycastPoint}      - Unprojected point in world space.
     * @private
     */
    static #unproject(matrix, ndcX, ndcY, ndcZ) {
        // Build the clip-space position from NDC coordinates:
        const clipX = ndcX;
        const clipY = ndcY;
        const clipZ = ndcZ;
        const clipW = CLIP_W;

        // Compute world-space (homogeneous) using the inverse view-projection matrix:
        const worldX = (matrix[MATRIX_INDEX_00] * clipX)
            + (matrix[MATRIX_INDEX_10] * clipY)
            + (matrix[MATRIX_INDEX_20] * clipZ)
            + (matrix[MATRIX_INDEX_30] * clipW);

        const worldY = (matrix[MATRIX_INDEX_01] * clipX)
            + (matrix[MATRIX_INDEX_11] * clipY)
            + (matrix[MATRIX_INDEX_21] * clipZ)
            + (matrix[MATRIX_INDEX_31] * clipW);

        const worldZ = (matrix[MATRIX_INDEX_02] * clipX)
            + (matrix[MATRIX_INDEX_12] * clipY)
            + (matrix[MATRIX_INDEX_22] * clipZ)
            + (matrix[MATRIX_INDEX_32] * clipW);

        const worldW = (matrix[MATRIX_INDEX_03] * clipX)
            + (matrix[MATRIX_INDEX_13] * clipY)
            + (matrix[MATRIX_INDEX_23] * clipZ)
            + (matrix[MATRIX_INDEX_33] * clipW);

        if (worldW === ZERO_COMPONENT) {
            throw new Error(ERROR_UNPROJECT_W_ZERO);
        }

        // Compute the `reciprocal W` value for perspective divide:
        const inverseW = ONE_COMPONENT / worldW;

        return {
            [COMPONENT_X] : worldX * inverseW,
            [COMPONENT_Y] : worldY * inverseW,
            [COMPONENT_Z] : worldZ * inverseW
        };
    }

    /**
     * @param {Float32Array} matrix - Matrix to apply.
     * @param {RaycastPoint} point  - Point to transform.
     * @param {number} wComponent   - Homogeneous W component (1 for points, 0 for vectors).
     * @returns {RaycastPoint}      - Transformed (x, y, z) after applying the 4x4 matrix with the given `W component`.
     * @private
     */
    static #transformPoint(matrix, point, wComponent) {
        const x = point[COMPONENT_X];
        const y = point[COMPONENT_Y];
        const z = point[COMPONENT_Z];

        return {
            [COMPONENT_X]: (matrix[MATRIX_INDEX_00] * x)
                + (matrix[MATRIX_INDEX_10] * y)
                + (matrix[MATRIX_INDEX_20] * z)
                + (matrix[MATRIX_INDEX_30] * wComponent),

            [COMPONENT_Y]: (matrix[MATRIX_INDEX_01] * x)
                + (matrix[MATRIX_INDEX_11] * y)
                + (matrix[MATRIX_INDEX_21] * z)
                + (matrix[MATRIX_INDEX_31] * wComponent),

            [COMPONENT_Z]: (matrix[MATRIX_INDEX_02] * x)
                + (matrix[MATRIX_INDEX_12] * y)
                + (matrix[MATRIX_INDEX_22] * z)
                + (matrix[MATRIX_INDEX_32] * wComponent)
        };
    }

    /**
     * @param {RaycastPoint} vector - Vector to normalize.
     * @returns {RaycastPoint}      - Normalized vector, returns zero vector when input length is zero.
     * @private
     */
    static #normalizeVector(vector) {
        const x      = vector[COMPONENT_X];
        const y      = vector[COMPONENT_Y];
        const z      = vector[COMPONENT_Z];
        const length = Math.sqrt((x * x) + (y * y) + (z * z));

        if (length === ZERO_COMPONENT) {
            return {
                [COMPONENT_X] : ZERO_COMPONENT,
                [COMPONENT_Y] : ZERO_COMPONENT,
                [COMPONENT_Z] : ZERO_COMPONENT
            };
        }

        const inverseLength = ONE_COMPONENT / length;

        return {
            [COMPONENT_X] : x * inverseLength,
            [COMPONENT_Y] : y * inverseLength,
            [COMPONENT_Z] : z * inverseLength
        };
    }

    /**
     * @param {RaycastPoint} origin    - Ray origin in local space.
     * @param {RaycastPoint} direction - Ray direction in local space.
     * @param {Float32Array} min       - AABB minimum.
     * @param {Float32Array} max       - AABB maximum.
     * @returns {number | null}        - Intersection distance parameter along the ray direction, null when the ray misses the AABB.
     * @private
     */
    static #intersectRayAabb(origin, direction, min, max) {
        // Initialize the running ray-AABB intersection interval:
        let tMin = RAY_T_MIN;
        let tMax = RAY_T_MAX_INIT;

        // Extract ray origin components:
        const originX = origin[COMPONENT_X];
        const originY = origin[COMPONENT_Y];
        const originZ = origin[COMPONENT_Z];

        // Extract ray direction components:
        const directionX = direction[COMPONENT_X];
        const directionY = direction[COMPONENT_Y];
        const directionZ = direction[COMPONENT_Z];

        // Extract AABB bounds components:
        const minX = min[VECTOR_INDEX_X];
        const minY = min[VECTOR_INDEX_Y];
        const minZ = min[VECTOR_INDEX_Z];
        const maxX = max[VECTOR_INDEX_X];
        const maxY = max[VECTOR_INDEX_Y];
        const maxZ = max[VECTOR_INDEX_Z];

        // Compute the ray intersection range for the X axis slab:
        const rangeX = Raycaster.#getAxisRange(originX, directionX, minX, maxX);

        // No overlap with the X slab, so no intersection with the AABB:
        if (!rangeX) {
            return null;
        }

        // Intersect the running interval with the X slab interval:
        tMin = Math.max(tMin, rangeX[RANGE_MIN_INDEX]);
        tMax = Math.min(tMax, rangeX[RANGE_MAX_INDEX]);

        // If entry exceeds exit, the slabs do not overlap, so no intersection:
        if (tMin > tMax) {
            return null;
        }

        // The same, but for Y:
        const rangeY = Raycaster.#getAxisRange(originY, directionY, minY, maxY);

        if (!rangeY) {
            return null;
        }

        tMin = Math.max(tMin, rangeY[RANGE_MIN_INDEX]);
        tMax = Math.min(tMax, rangeY[RANGE_MAX_INDEX]);

        if (tMin > tMax) {
            return null;
        }

        // The same, but for Z:
        const rangeZ = Raycaster.#getAxisRange(originZ, directionZ, minZ, maxZ);

        if (!rangeZ) {
            return null;
        }

        tMin = Math.max(tMin, rangeZ[RANGE_MIN_INDEX]);
        tMax = Math.min(tMax, rangeZ[RANGE_MAX_INDEX]);

        if (tMin > tMax) {
            return null;
        }

        if (tMax < RAY_T_MIN) {
            return null;
        }

        return tMin >= RAY_T_MIN ? tMin : tMax;
    }

    /**
     * @param {number} origin     - Ray origin component.
     * @param {number} direction  - Ray direction component.
     * @param {number} min        - AABB min component.
     * @param {number} max        - AABB max component.
     * @returns {number[] | null} - Two-element array for this axis slab, or null if the ray misses the slab.
     * @private
     */
    static #getAxisRange(origin, direction, min, max) {
        if (Math.abs(direction) < RAY_DIRECTION_EPSILON) {
            return (origin < min || origin > max) ? null : [RAY_T_MIN, RAY_T_MAX_INIT];
        }

        const inverseDirection = INVERSE_DIRECTION_NUMERATOR / direction;
        let axisEntry          = (min - origin) * inverseDirection;
        let axisExit           = (max - origin) * inverseDirection;

        if (axisEntry > axisExit) {
            const tempValue = axisEntry;
            axisEntry       = axisExit;
            axisExit        = tempValue;
        }

        return [axisEntry, axisExit];
    }

    /**
     * @param {RaycastPoint} from - Start point.
     * @param {RaycastPoint} to   - End point.
     * @returns {number}          - Euclidean distance between the two points.
     * @private
     */
    static #distanceBetween(from, to) {
        const deltaX = to[COMPONENT_X] - from[COMPONENT_X];
        const deltaY = to[COMPONENT_Y] - from[COMPONENT_Y];
        const deltaZ = to[COMPONENT_Z] - from[COMPONENT_Z];
        return Math.sqrt((deltaX * deltaX) + (deltaY * deltaY) + (deltaZ * deltaZ));
    }
}

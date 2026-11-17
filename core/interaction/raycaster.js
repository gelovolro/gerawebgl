import * as RaycasterConstants       from '../constants/raycaster.js';
import { MATH_COMMON_VALUES }        from '../constants/math.js';
import { ECMASCRIPT_TYPEOF_RESULTS } from '../constants/ecmascript-types.js';
import { Matrix4 }                   from '../math/matrix4.js';
import { Scene }                     from '../scene/scene.js';
import { Camera }                    from '../scene/camera.js';
import { Mesh }                      from '../scene/mesh.js';

/**
 * @typedef {Object} RaycastPoint
 * @property {number} x - X coordinate.
 * @property {number} y - Y coordinate.
 * @property {number} z - Z coordinate.
 */

/**
 * @typedef {Object} Intersection
 * @property {Mesh} object        - Intersected mesh.
 * @property {number} distance    - Distance from the ray origin to the hit point.
 * @property {RaycastPoint} point - Intersection point in world space.
 */

/**
 * @typedef {Object} RaycastOptions
 * @property {boolean} [recursive=true]                     - Whether to traverse descendants.
 * @property {function(Mesh): boolean | null} [filter=null] - Optional mesh filter.
 * @property {boolean} [sort=true]                          - Whether to sort hits by distance.
 */

/**
 * @typedef {Object} Ray
 * @property {RaycastPoint} origin    - Ray origin in world space.
 * @property {RaycastPoint} direction - Normalized ray direction in world space.
 */

/**
 * Tests ray intersections against the local axis-aligned bounding boxes of scene meshes.
 */
export class Raycaster {
    /**
     * Casts a ray through a point in normalized device coordinates.
     *
     * @param {Scene} scene                     - Scene to query.
     * @param {Camera} camera                   - Camera defining the ray.
     * @param {{x: number, y: number}} mouseNdc - Normalized device coordinates.
     * @param {RaycastOptions} [options]        - Raycast options.
     * @returns {Intersection[]}                - Bounding-box intersections.
     */
    raycast(scene, camera, mouseNdc, options = {}) {
        const { recursive, filter, sort } = Raycaster.#validateArguments(scene, camera, mouseNdc, options);

        if (!Number.isFinite(mouseNdc.x) || !Number.isFinite(mouseNdc.y)) {
            return [];
        }

        scene.updateWorldMatrix({ parentWorldMatrix: null });

        const viewProjectionMatrix = Matrix4.multiply(camera.getProjectionMatrix(), camera.getViewMatrix());
        const inverseMatrix        = Matrix4.invert(viewProjectionMatrix);
        const ray                  = Raycaster.#createRay(inverseMatrix, mouseNdc.x, mouseNdc.y);
        const intersections        = [];

        if (ray.direction.x === MATH_COMMON_VALUES.ZERO &&
            ray.direction.y === MATH_COMMON_VALUES.ZERO &&
            ray.direction.z === MATH_COMMON_VALUES.ZERO) {
            return [];
        }

        if (recursive) {
            scene.traverse((object) => Raycaster.#collectIntersection(object, ray, filter, intersections));
        } else {
            for (const object of scene.children) {
                Raycaster.#collectIntersection(object, ray, filter, intersections);
            }
        }

        if (sort) {
            intersections.sort((left, right) => left.distance - right.distance);
        }

        return intersections;
    }

    /**
     * Validates raycast input and resolves its default options.
     *
     * @param {Scene} scene            - Scene argument.
     * @param {Camera} camera          - Camera argument.
     * @param {Object} mouseNdc        - Mouse coordinates.
     * @param {RaycastOptions} options - Raycast options.
     * @returns {RaycastOptions}       - Validated option values.
     * @private
     */
    static #validateArguments(scene, camera, mouseNdc, options) {
        const errors = RaycasterConstants.RAYCASTER_ERRORS;
        const types  = ECMASCRIPT_TYPEOF_RESULTS;

        if (!(scene instanceof Scene)) {
            throw new TypeError(errors.SCENE_TYPE);
        }

        if (!(camera instanceof Camera)) {
            throw new TypeError(errors.CAMERA_TYPE);
        }

        if (mouseNdc === null
            || typeof mouseNdc !== types.OBJECT
            || Array.isArray(mouseNdc)
            || typeof mouseNdc.x !== types.NUMBER
            || typeof mouseNdc.y !== types.NUMBER) {
            throw new TypeError(errors.MOUSE_NDC_TYPE);
        }

        if (options === null || typeof options !== types.OBJECT || Array.isArray(options)) {
            throw new TypeError(errors.OPTIONS_TYPE);
        }

        const optionsPrototype = Object.getPrototypeOf(options);

        if (optionsPrototype !== Object.prototype && optionsPrototype !== null) {
            throw new TypeError(errors.OPTIONS_TYPE);
        }

        const defaults   = RaycasterConstants.RAYCASTER_DEFAULTS;
        const optionKeys = RaycasterConstants.RAYCASTER_OPTION_KEYS;
        const recursive  = optionKeys.RECURSIVE in options ? options[optionKeys.RECURSIVE] : defaults.RECURSIVE;
        const filter     = optionKeys.FILTER in options ? options[optionKeys.FILTER] : defaults.FILTER;
        const sort       = optionKeys.SORT in options ? options[optionKeys.SORT] : defaults.SORT;

        if (typeof recursive !== types.BOOLEAN) {
            throw new TypeError(errors.RECURSIVE_TYPE);
        }

        if (filter !== null && typeof filter !== types.FUNCTION) {
            throw new TypeError(errors.FILTER_TYPE);
        }

        if (typeof sort !== types.BOOLEAN) {
            throw new TypeError(errors.SORT_TYPE);
        }

        return { recursive, filter, sort };
    }

    /**
     * Collects an intersection if the object is an eligible mesh and its bounds are hit.
     *
     * @param {Object} object          - Scene graph node.
     * @param {Ray} ray                - Ray in world space.
     * @param {Function | null} filter - Optional mesh filter.
     * @param {Intersection[]} output  - Intersection results.
     * @returns {void}
     * @private
     */
    static #collectIntersection(object, ray, filter, output) {
        if (!(object instanceof Mesh) || object.isDisposed || (filter && filter(object) === false)) {
            return;
        }

        const geometry           = object.geometry;
        const boundingBoxMin     = geometry.getBoundingBoxMin();
        const boundingBoxMax     = geometry.getBoundingBoxMax();
        const inverseWorldMatrix = Matrix4.invert(object.worldMatrix);
        const localOrigin        = Raycaster.#transformPoint(inverseWorldMatrix, ray.origin, RaycasterConstants.RAYCASTER_NDC.W);
        const localDirection     = Raycaster.#transformPoint(inverseWorldMatrix, ray.direction, MATH_COMMON_VALUES.ZERO);
        const parameter          = Raycaster.#intersectRayAabb(
            localOrigin,
            localDirection,
            boundingBoxMin,
            boundingBoxMax
        );

        if (parameter === null) {
            return;
        }

        const localPoint = {
            x : localOrigin.x + (localDirection.x * parameter),
            y : localOrigin.y + (localDirection.y * parameter),
            z : localOrigin.z + (localDirection.z * parameter)
        };

        const worldPoint = Raycaster.#transformPoint(object.worldMatrix, localPoint, RaycasterConstants.RAYCASTER_NDC.W);

        output.push({
            object,
            distance : Raycaster.#distanceBetween(ray.origin, worldPoint),
            point    : worldPoint
        });
    }

    /**
     * Creates a world-space ray from the near and far clip planes.
     *
     * @param {Float32Array} inverseMatrix - Inverse view-projection matrix.
     * @param {number} ndcX                - Horizontal NDC coordinate.
     * @param {number} ndcY                - Vertical NDC coordinate.
     * @returns {Ray}                      - Ray with normalized direction.
     * @private
     */
    static #createRay(inverseMatrix, ndcX, ndcY) {
        const ndc       = RaycasterConstants.RAYCASTER_NDC;
        const nearPoint = Raycaster.#unproject(inverseMatrix, ndcX, ndcY, ndc.NEAR);
        const farPoint  = Raycaster.#unproject(inverseMatrix, ndcX, ndcY, ndc.FAR);
        const direction = Raycaster.#normalizeVector({
            x : farPoint.x - nearPoint.x,
            y : farPoint.y - nearPoint.y,
            z : farPoint.z - nearPoint.z
        });

        return { origin: nearPoint, direction };
    }

    /**
     * Converts clip-space coordinates into a world-space point.
     *
     * @param {Float32Array} matrix - Inverse view-projection matrix.
     * @param {number} ndcX         - Horizontal NDC coordinate.
     * @param {number} ndcY         - Vertical NDC coordinate.
     * @param {number} ndcZ         - Depth NDC coordinate.
     * @returns {RaycastPoint}      - Unprojected point.
     * @private
     */
    static #unproject(matrix, ndcX, ndcY, ndcZ) {
        const indexes = RaycasterConstants.RAYCASTER_MATRIX_INDEXES;
        const clipW   = RaycasterConstants.RAYCASTER_NDC.W;
        const point   = { x: ndcX, y: ndcY, z: ndcZ };
        const world   = Raycaster.#transformPoint(matrix, point, clipW);

        const worldW = (matrix[indexes.WX] * ndcX)
            + (matrix[indexes.WY] * ndcY)
            + (matrix[indexes.WZ] * ndcZ)
            + (matrix[indexes.WW] * clipW);

        if (worldW === MATH_COMMON_VALUES.ZERO) {
            throw new Error(RaycasterConstants.RAYCASTER_ERRORS.UNPROJECT_W_ZERO);
        }

        const inverseW = RaycasterConstants.RAYCASTER_RAY.INVERSE_NUMERATOR / worldW;

        return {
            x : world.x * inverseW,
            y : world.y * inverseW,
            z : world.z * inverseW
        };
    }

    /**
     * Multiplies a point or direction by a column-major transformation matrix.
     *
     * @param {Float32Array} matrix - Transformation matrix.
     * @param {RaycastPoint} point  - Source point.
     * @param {number} w            - Homogeneous component.
     * @returns {RaycastPoint}      - Transformed point.
     * @private
     */
    static #transformPoint(matrix, point, w) {
        const indexes = RaycasterConstants.RAYCASTER_MATRIX_INDEXES;

        return {
            x : (matrix[indexes.XX] * point.x) + (matrix[indexes.XY] * point.y)
                + (matrix[indexes.XZ] * point.z) + (matrix[indexes.XW] * w),

            y : (matrix[indexes.YX] * point.x) + (matrix[indexes.YY] * point.y)
                + (matrix[indexes.YZ] * point.z) + (matrix[indexes.YW] * w),

            z : (matrix[indexes.ZX] * point.x) + (matrix[indexes.ZY] * point.y)
                + (matrix[indexes.ZZ] * point.z) + (matrix[indexes.ZW] * w)
        };
    }

    /**
     * Returns a normalized direction, or zero for a degenerate ray.
     *
     * @param {RaycastPoint} vector - Direction vector.
     * @returns {RaycastPoint}      - Normalized vector.
     * @private
     */
    static #normalizeVector(vector) {
        const length = Math.sqrt((vector.x * vector.x) + (vector.y * vector.y) + (vector.z * vector.z));

        if (length === MATH_COMMON_VALUES.ZERO) {
            return {
                x : MATH_COMMON_VALUES.ZERO,
                y : MATH_COMMON_VALUES.ZERO,
                z : MATH_COMMON_VALUES.ZERO
            };
        }

        const inverseLength = RaycasterConstants.RAYCASTER_RAY.INVERSE_NUMERATOR / length;

        return {
            x : vector.x * inverseLength,
            y : vector.y * inverseLength,
            z : vector.z * inverseLength
        };
    }

    /**
     * Intersects a local-space ray with a local axis-aligned bounding box.
     *
     * @param {RaycastPoint} origin    - Local ray origin.
     * @param {RaycastPoint} direction - Local ray direction.
     * @param {Float32Array} min       - Minimum bounds.
     * @param {Float32Array} max       - Maximum bounds.
     * @returns {number | null}        - Ray parameter or null when the bounds are missed.
     * @private
     */
    static #intersectRayAabb(origin, direction, min, max) {
        const ray = RaycasterConstants.RAYCASTER_RAY;
        let entry = ray.MIN_PARAMETER;
        let exit  = ray.MAX_PARAMETER;

        for (const axis of RaycasterConstants.RAYCASTER_AXES) {
            const range = Raycaster.#getAxisRange(
                origin[axis.name],
                direction[axis.name],
                min[axis.index],
                max[axis.index]
            );

            if (range === null) {
                return null;
            }

            entry = Math.max(entry, range.entry);
            exit  = Math.min(exit, range.exit);

            if (entry > exit) {
                return null;
            }
        }

        return entry;
    }

    /**
     * Returns the entry and exit parameters for a single AABB slab.
     *
     * @param {number} origin                          - Ray origin on one axis.
     * @param {number} direction                       - Ray direction on that axis.
     * @param {number} min                             - Minimum bound.
     * @param {number} max                             - Maximum bound.
     * @returns {{entry: number, exit: number} | null} - Slab interval or null.
     * @private
     */
    static #getAxisRange(origin, direction, min, max) {
        const ray = RaycasterConstants.RAYCASTER_RAY;

        if (Math.abs(direction) < ray.DIRECTION_EPSILON) {
            return (origin < min || origin > max)
                ? null
                : { entry: ray.MIN_PARAMETER, exit: ray.MAX_PARAMETER };
        }

        const inverseDirection = ray.INVERSE_NUMERATOR / direction;
        const first            = (min - origin) * inverseDirection;
        const second           = (max - origin) * inverseDirection;

        return first > second
            ? { entry: second, exit: first }
            : { entry: first, exit: second };
    }

    /**
     * Returns the world-space distance from the ray origin to the intersection.
     *
     * @param {RaycastPoint} from - Ray origin.
     * @param {RaycastPoint} to   - Intersection point.
     * @returns {number}          - Euclidean distance.
     * @private
     */
    static #distanceBetween(from, to) {
        const deltaX = to.x - from.x;
        const deltaY = to.y - from.y;
        const deltaZ = to.z - from.z;
        return Math.sqrt((deltaX * deltaX) + (deltaY * deltaY) + (deltaZ * deltaZ));
    }
}

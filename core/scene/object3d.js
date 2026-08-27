import * as MathConstants     from '../constants/math.js';
import * as Object3DConstants from '../constants/object3d.js';
import { Matrix4 }            from '../math/matrix4.js';
import { Vector3 }            from '../math/vector3.js';

/**
 * Base class for scene graph objects.
 *
 * Stores local transformation and parent-child relations.
 */
export class Object3D {
    /**
     * Local position relative to the parent.
     *
     * @type {Vector3}
     */
    #position;

    /**
     * Local Euler rotation relative to the parent, in radians.
     *
     * @type {Vector3}
     */
    #rotation;

    /**
     * Local scale relative to the parent.
     *
     * @type {Vector3}
     */
    #scale;

    /**
     * Parent object in the scene graph.
     *
     * @type {Object3D | null}
     */
    #parent;

    /**
     * Child objects in the scene graph.
     *
     * @type {Object3D[]}
     */
    #children;

    /**
     * Cached local transformation matrix.
     *
     * Rebuilt only when position, rotation or scale changes.
     *
     * @type {Float32Array}
     */
    #localMatrix;

    /**
     * Cached world transformation matrix.
     *
     * Rebuilt when the local transformation, parent relation or an ancestor's world transformation changes.
     *
     * @type {Float32Array}
     */
    #worldMatrix;

    /**
     * Indicates that the cached local matrix must be rebuilt.
     *
     * @type {boolean}
     */
    #isLocalMatrixDirty = true;

    /**
     * Indicates that the cached world matrix must be rebuilt.
     *
     * @type {boolean}
     */
    #isWorldMatrixDirty = true;

    /**
     * Creates an Object3D with the default local transformation.
     */
    constructor() {
        this.#parent      = null;
        this.#children    = [];
        this.#localMatrix = new Float32Array(MathConstants.MATH_LAYOUT.MATRIX_4X4_ELEMENT_COUNT);
        this.#worldMatrix = new Float32Array(MathConstants.MATH_LAYOUT.MATRIX_4X4_ELEMENT_COUNT);

        // Initialize both cached matrices to identity before the first update.
        // This keeps them valid until their first transformation is computed.
        Object3D.#setIdentityMatrix(this.#localMatrix);
        Object3D.#setIdentityMatrix(this.#worldMatrix);

        // Initialize the default local transformation.
        // Changes to these vectors invalidate the cached matrices, so they are recomputed on the next update.
        this.#position = Vector3.createZero(() => this.#markTransformDirty());
        this.#rotation = Vector3.createZero(() => this.#markTransformDirty());
        this.#scale    = Vector3.createUnitScale(() => this.#markTransformDirty());
    }

    /**
     * @returns {Vector3} - Local position relative to the parent.
     */
    get position() {
        return this.#position;
    }

    /**
     * @returns {Vector3} - Local Euler rotation relative to the parent, in radians.
     */
    get rotation() {
        return this.#rotation;
    }

    /**
     * @returns {Vector3} - Local scale relative to the parent.
     */
    get scale() {
        return this.#scale;
    }

    /**
     * @returns {Object3D | null} - Parent object or null for a root object.
     */
    get parent() {
        return this.#parent;
    }

    /**
     * @returns {Object3D[]} - Child objects.
     */
    get children() {
        return this.#children;
    }

    /**
     * @returns {Float32Array} - Cached world transformation matrix.
     */
    get worldMatrix() {
        return this.#worldMatrix;
    }

    /**
     * Attaches a child to this object.
     *
     * Reparents the child when it already belongs to another parent.
     *
     * @param {Object3D} child - Child object to attach.
     * @throws {TypeError}     - If the child is not an Object3D instance.
     */
    add(child) {
        if (!(child instanceof Object3D)) {
            throw new TypeError('Object3D.add expects an Object3D instance.');
        }

        if (child.#parent === this) {
            return;
        }

        if (child.#parent) {
            child.#parent.remove(child);
        }

        child.#parent = this;
        child.#isWorldMatrixDirty = true;
        this.#children.push(child);
    }

    /**
     * Detaches a child from this object.
     *
     * Does nothing when the child is not attached.
     *
     * @param {Object3D} child - Child object to detach.
     * @throws {TypeError}     - If the child is not an Object3D instance.
     */
    remove(child) {
        if (!(child instanceof Object3D)) {
            throw new TypeError('Object3D.remove expects an Object3D instance.');
        }

        const index = this.#children.indexOf(child);

        if (index === Object3DConstants.OBJECT3D_CHILDREN.NOT_FOUND_INDEX) {
            return;
        }

        this.#children.splice(index, Object3DConstants.OBJECT3D_CHILDREN.SINGLE_REMOVE_COUNT);
        child.#parent = null;
        child.#isWorldMatrixDirty = true;
    }

    /**
     * Updates world matrices for this object and its descendants.
     *
     * @param {Float32Array | null | Object} inputMatrix            - Parent world matrix or options object.
     * @param {Float32Array | null} [inputMatrix.parentWorldMatrix] - Parent world matrix override, or null for the root.
     * @returns {void}
     * @throws {TypeError} - If the resolved parent world matrix is invalid.
     */
    updateWorldMatrix(inputMatrix) {
        let resolvedParentWorldMatrix = inputMatrix;

        if (inputMatrix !== null && typeof inputMatrix === 'object' && !(inputMatrix instanceof Float32Array)) {
            resolvedParentWorldMatrix = ('parentWorldMatrix' in inputMatrix)
                ? inputMatrix.parentWorldMatrix
                : null;
        }

        if (resolvedParentWorldMatrix !== null && !(resolvedParentWorldMatrix instanceof Float32Array)) {
            throw new TypeError('`Object3D.updateWorldMatrix` expects `Float32Array` or null.');
        }

        this.#updateWorldMatrixRecursive(resolvedParentWorldMatrix, false);
    }

    /**
     * Visits this object and all descendants in depth-first order.
     *
     * @param {function(Object3D): void} callback - Visitor callback.
     * @throws {TypeError}                        - If the callback is not a function.
     */
    traverse(callback) {
        if (typeof callback !== 'function') {
            throw new TypeError('Object3D.traverse expects a function callback.');
        }

        callback(this);

        for (let index = 0; index < this.#children.length; index += 1) {
            this.#children[index].traverse(callback);
        }
    }

    /**
     * Marks the cached local and world matrices for recomputation.
     *
     * @private
     */
    #markTransformDirty() {
        this.#isLocalMatrixDirty = true;
        this.#isWorldMatrixDirty = true;
    }

    /**
     * Updates the cached world matrix and propagates changes to descendants.
     *
     * @param {Float32Array | null} parentWorldMatrix - Parent world matrix, or null for the root.
     * @param {boolean} parentWorldDirty              - Whether the parent world matrix changed in this update pass.
     * @private
     */
    #updateWorldMatrixRecursive(parentWorldMatrix, parentWorldDirty) {
        if (this.#isLocalMatrixDirty) {
            this.#updateLocalMatrix();
            this.#isLocalMatrixDirty = false;
            this.#isWorldMatrixDirty = true;
        }

        const shouldUpdateWorld = this.#isWorldMatrixDirty || parentWorldDirty;

        if (shouldUpdateWorld) {
            if (parentWorldMatrix !== null) {
                Matrix4.multiplyTo(this.#worldMatrix, parentWorldMatrix, this.#localMatrix);
            } else {
                this.#worldMatrix.set(this.#localMatrix);
            }

            this.#isWorldMatrixDirty = false;
        }

        for (let index = 0; index < this.#children.length; index += 1) {
            this.#children[index].#updateWorldMatrixRecursive(this.#worldMatrix, shouldUpdateWorld);
        }
    }

    /**
     * Rebuilds the cached local transformation matrix.
     *
     * @private
     */
    #updateLocalMatrix() {
        Matrix4.writeTransformationTo(
            this.#localMatrix,
            this.#position.x,
            this.#position.y,
            this.#position.z,
            this.#rotation.x,
            this.#rotation.y,
            this.#rotation.z,
            this.#scale.x,
            this.#scale.y,
            this.#scale.z
        );
    }

    /**
     * Writes an identity matrix into an existing buffer.
     *
     * Used to keep matrix caches valid before the first update.
     *
     * @param {Float32Array} out - Output 4x4 matrix buffer.
     * @private
     */
    static #setIdentityMatrix(out) {
        out.fill(MathConstants.MATH_MATRIX_VALUES.ZERO);
        out[0]  = MathConstants.MATH_MATRIX_VALUES.UNIT;
        out[5]  = MathConstants.MATH_MATRIX_VALUES.UNIT;
        out[10] = MathConstants.MATH_MATRIX_VALUES.UNIT;
        out[15] = MathConstants.MATH_MATRIX_VALUES.UNIT;
    }
}

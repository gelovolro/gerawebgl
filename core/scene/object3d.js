import { Matrix4 } from '../math/matrix4.js';
import { Vector3 } from '../math/vector3.js';

/** @type {number} */
const CHILD_NOT_FOUND_INDEX = -1;

/** @type {number} */
const SINGLE_CHILD_REMOVE_COUNT = 1;

/** @type {number} */
const MATRIX_4x4_ELEMENT_COUNT = 16;

/**
 * Base class for all objects that live in a scene graph.
 * Stores position, rotation, scale and parent/children relations.
 */
export class Object3D {
    /** @type {Vector3} */
    #position;

    /** @type {Vector3} */
    #rotation;

    /** @type {Vector3} */
    #scale;

    /** @type {Object3D | null} */
    #parent;

    /** @type {Object3D[]} */
    #children;

    /** @type {Float32Array} */
    #localMatrix;

    /** @type {Float32Array} */
    #worldMatrix;

    /** @type {boolean} */
    #isLocalMatrixDirty = true;

    /** @type {boolean} */
    #isWorldMatrixDirty = true;

    constructor() {
        this.#parent   = null;
        this.#children = [];

        this.#localMatrix = new Float32Array(MATRIX_4x4_ELEMENT_COUNT);
        this.#worldMatrix = new Float32Array(MATRIX_4x4_ELEMENT_COUNT);
        Object3D.#setIdentityMatrix(this.#localMatrix);
        Object3D.#setIdentityMatrix(this.#worldMatrix);

        this.#position = Vector3.createZero(() => this.#markTransformDirty());
        this.#rotation = Vector3.createZero(() => this.#markTransformDirty());
        this.#scale    = Vector3.createUnitScale(() => this.#markTransformDirty());
    }

    /** @returns {Vector3} */
    get position() {
        return this.#position;
    }

    /** @returns {Vector3} */
    get rotation() {
        return this.#rotation;
    }

    /** @returns {Vector3} */
    get scale() {
        return this.#scale;
    }

    /** @returns {Object3D | null} */
    get parent() {
        return this.#parent;
    }

    /** @returns {Object3D[]} */
    get children() {
        return this.#children;
    }

    /** @returns {Float32Array} */
    get worldMatrix() {
        return this.#worldMatrix;
    }

    /**
     * @param {Object3D} child - Child node to attach to this object (reparented, if it already has a parent).
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
     * @param {Object3D} child - Child node to detach from this object (no-op if the child is not attached here).
     */
    remove(child) {
        if (!(child instanceof Object3D)) {
            throw new TypeError('Object3D.remove expects an Object3D instance.');
        }

        const index = this.#children.indexOf(child);

        if (index === CHILD_NOT_FOUND_INDEX) {
            return;
        }

        this.#children.splice(index, SINGLE_CHILD_REMOVE_COUNT);
        child.#parent = null;
        child.#isWorldMatrixDirty = true;
    }

    /**
     * Updates world matrices.
     *
     * @param {Float32Array | null | Object} inputMatrix            - Parent world matrix or options object.
     * @param {Float32Array | null} [inputMatrix.parentWorldMatrix] - Parent world matrix override (root, when null).
     * @returns {void}
     * @throws {TypeError} When inputs are invalid.
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
     * @param {function(Object3D): void} callback - Visitor function called for this object and all descendants (depth-first).
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

    /** @private */
    #markTransformDirty() {
        this.#isLocalMatrixDirty = true;
        this.#isWorldMatrixDirty = true;
    }

    /**
     * @param {Float32Array | null} parentWorldMatrix - Parent world matrix, or null for the root.
     * @param {boolean} parentWorldDirty              - Whether the parent world matrix was recomputed in this update pass.
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
     * Recomputes local matrix into existing buffer (no allocations).
     *
     * @private
     */
    #updateLocalMatrix() {
        const positionX = this.#position.x;
        const positionY = this.#position.y;
        const positionZ = this.#position.z;

        const rotationX = this.#rotation.x;
        const rotationY = this.#rotation.y;
        const rotationZ = this.#rotation.z;

        const scaleX = this.#scale.x;
        const scaleY = this.#scale.y;
        const scaleZ = this.#scale.z;

        const cosX = Math.cos(rotationX);
        const sinX = Math.sin(rotationX);
        const cosY = Math.cos(rotationY);
        const sinY = Math.sin(rotationY);
        const cosZ = Math.cos(rotationZ);
        const sinZ = Math.sin(rotationZ);

        // Rotation matrix, R = Rz * Ry * Rx:
        const rot00 = cosZ * cosY;
        const rot01 = (cosZ * sinY * sinX) - (sinZ * cosX);
        const rot02 = (cosZ * sinY * cosX) + (sinZ * sinX);

        const rot10 = sinZ * cosY;
        const rot11 = (sinZ * sinY * sinX) + (cosZ * cosX);
        const rot12 = (sinZ * sinY * cosX) - (cosZ * sinX);

        const rot20 = -sinY;
        const rot21 = cosY * sinX;
        const rot22 = cosY * cosX;
        const out   = this.#localMatrix;

        // X axis:
        out[0] = rot00 * scaleX;
        out[1] = rot10 * scaleX;
        out[2] = rot20 * scaleX;
        out[3] = 0;

        // Y axis:
        out[4] = rot01 * scaleY;
        out[5] = rot11 * scaleY;
        out[6] = rot21 * scaleY;
        out[7] = 0;

        // Z axis:
        out[8]  = rot02 * scaleZ;
        out[9]  = rot12 * scaleZ;
        out[10] = rot22 * scaleZ;
        out[11] = 0;

        // Translation:
        out[12] = positionX;
        out[13] = positionY;
        out[14] = positionZ;
        out[15] = 1;
    }

    /**
     * @param {Float32Array} out - Output 4x4 matrix buffer that will be overwritten with the identity matrix.
     * @private
     */
    static #setIdentityMatrix(out) {
        for (let index = 0; index < MATRIX_4x4_ELEMENT_COUNT; index += 1) {
            out[index] = 0;
        }

        out[0]  = 1;
        out[5]  = 1;
        out[10] = 1;
        out[15] = 1;
    }
}

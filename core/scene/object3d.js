import { Matrix4 } from '../math/matrix4.js';

/** @type {number} */
const CHILD_NOT_FOUND_INDEX = -1;

/** @type {number} */
const SINGLE_CHILD_REMOVE_COUNT = 1;

/**
 * Base class for all objects that live in a scene graph.
 * Stores position, rotation, scale and parent/children relations.
 */
export class Object3D {
    /** @type {{ x: number, y: number, z: number }} */
    #position;

    /** @type {{ x: number, y: number, z: number }} */
    #rotation;

    /** @type {{ x: number, y: number, z: number }} */
    #scale;

    /** @type {Object3D | null} */
    #parent;

    /** @type {Object3D[]} */
    #children;

    /**
     * Local transform matrix of this object (position/rotation/scale relative to its parent).
     * @type {Float32Array}
     */
    #localMatrix;

    /**
     * World transform matrix of this object (relative to the scene origin).
     * @type {Float32Array}
     */
    #worldMatrix;

    /**
     * Creates a new transform node with position, rotation and scale.
     */
    constructor() {
        this.#position    = { x: 0, y: 0, z: 0 };
        this.#rotation    = { x: 0, y: 0, z: 0 };
        this.#scale       = { x: 1, y: 1, z: 1 };
        this.#parent      = null;
        this.#children    = [];
        this.#localMatrix = Matrix4.createIdentity();
        this.#worldMatrix = Matrix4.createIdentity();
    }

    /**
     * @returns {{ x: number, y: number, z: number }} - Local position of this object.
     */
    get position() {
        return this.#position;
    }

    /**
     * @returns {{ x: number, y: number, z: number }} - Local rotation of this object in radians.
     */
    get rotation() {
        return this.#rotation;
    }

    /**
     * @returns {{ x: number, y: number, z: number }} - Local scale of this object.
     */
    get scale() {
        return this.#scale;
    }

    /**
     * @returns {Object3D | null}
     */
    get parent() {
        return this.#parent;
    }

    /**
     * @returns {Object3D[]}
     */
    get children() {
        return this.#children;
    }

    /**
     * @returns {Float32Array} - World transform matrix of this object.
     */
    get worldMatrix() {
        return this.#worldMatrix;
    }

    /**
     * Adds a child object to this object.
     *
     * @param {Object3D} child - Child object to attach to this node in the scene graph.
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
        this.#children.push(child);
    }

    /**
     * Removes a child from this object.
     *
     * @param {Object3D} child - Child object to detach from this node in the scene graph.
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
    }

    /**
     * Updates the world matrix of this object and all its descendants.
     *
     * @param {Float32Array | null} parentWorldMatrix - World matrix of the parent object, or null for the root node.
     */
    updateWorldMatrix(parentWorldMatrix) {
        if (parentWorldMatrix !== null && !(parentWorldMatrix instanceof Float32Array)) {
            throw new TypeError('Object3D.updateWorldMatrix expects a Float32Array or null.');
        }

        this.#updateLocalMatrix();

        const newWorldMatrix = parentWorldMatrix !== null
            ? Matrix4.multiply(parentWorldMatrix, this.#localMatrix)
            : this.#localMatrix;

        this.#worldMatrix.set(newWorldMatrix);

        for (let index = 0; index < this.#children.length; index += 1) {
            this.#children[index].updateWorldMatrix(this.#worldMatrix);
        }
    }

    /**
     * Called for each Object3D in the hierarchy.
     *
     * @callback Object3DVisitor
     * @param {Object3D} object - Current object in the traversal.
     */

    /**
     * Traverses this object and all its descendants.
     *
     * @param {Object3DVisitor} callback - Function called for this object and each of its children in depth-first order.
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
     * Recomputes the local matrix from position, rotation and scale.
     *
     * @private
     */
    #updateLocalMatrix() {
        const translation = Matrix4.createTranslation(
            this.#position.x,
            this.#position.y,
            this.#position.z
        );

        const rotationX = Matrix4.createRotationX(this.#rotation.x);
        const rotationY = Matrix4.createRotationY(this.#rotation.y);
        const rotationZ = Matrix4.createRotationZ(this.#rotation.z);
        const scale     = Matrix4.createScale(
            this.#scale.x,
            this.#scale.y,
            this.#scale.z
        );

        this.#localMatrix = Matrix4.multiplyMany(
            translation,
            rotationZ,
            rotationY,
            rotationX,
            scale
        );
    }
}

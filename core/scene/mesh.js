import { Object3D } from './object3d.js';
import { Geometry } from '../geometry/geometry.js';
import { Material } from '../material/material.js';

/**
 * Default ownership flag for geometry.
 * When true, `Mesh.dispose()` disposes geometry.
 *
 * @type {boolean}
 */
const DEFAULT_OWNS_GEOMETRY = true;

/**
 * Default ownership flag for material.
 * When true, `Mesh.dispose()` disposes material.
 *
 * @type {boolean}
 */
const DEFAULT_OWNS_MATERIAL = true;

/**
 * Ownership options for Mesh.
 *
 * @typedef {Object} MeshOwnershipOptions
 * @property {boolean} [ownsGeometry = true] - When true, `Mesh.dispose()` disposes geometry.
 * @property {boolean} [ownsMaterial = true] - When true, `Mesh.dispose()` disposes material.
 */

/**
 * Renderable object that combines geometry and material.
 */
export class Mesh extends Object3D {

    /**
     * Geometry used by this mesh (vertex/index buffers, VAO).
     *
     * @type {Geometry}
     * @private
     */
    #geometry;

    /**
     * Material used by this mesh (shader program + render state + uniforms).
     *
     * @type {Material}
     * @private
     */
    #material;

    /**
     * When true, `Mesh.dispose()` will dispose the geometry. Use false for shared geometries.
     *
     * @type {boolean}
     * @private
     */
    #ownsGeometry;

    /**
     * When true, `Mesh.dispose()` will dispose the material.
     * Use false when material (and its textures) is shared between meshes.
     *
     * @type {boolean}
     * @private
     */
    #ownsMaterial;

    /**
     * Indicates whether this mesh has been disposed. Disposed meshes should not be rendered.
     *
     * @type {boolean}
     * @private
     */
    #isDisposed = false;

    /**
     * @param {Geometry} geometry                       - Geometry, that provides vertex and index buffers for this mesh.
     * @param {Material} material                       - Material, that defines how the geometry should be shaded and rendered.
     * @param {MeshOwnershipOptions} [ownershipOptions] - Ownership flags for geometry/material.
     */
    constructor(geometry, material, ownershipOptions = {}) {
        super();

        if (!(geometry instanceof Geometry)) {
            throw new TypeError('Mesh constructor expects a Geometry instance.');
        }

        if (!(material instanceof Material)) {
            throw new TypeError('Mesh constructor expects a Material instance.');
        }

        if (ownershipOptions === null || typeof ownershipOptions !== 'object' || Array.isArray(ownershipOptions)) {
            throw new TypeError('Mesh constructor expects `ownershipOptions` as a plain object.');
        }

        const {
            ownsGeometry = DEFAULT_OWNS_GEOMETRY,
            ownsMaterial = DEFAULT_OWNS_MATERIAL
        } = ownershipOptions;

        if (typeof ownsGeometry !== 'boolean') {
            throw new TypeError('Mesh constructor option `ownsGeometry` must be a boolean.');
        }

        if (typeof ownsMaterial !== 'boolean') {
            throw new TypeError('Mesh constructor option `ownsMaterial` must be a boolean.');
        }

        this.#geometry     = geometry;
        this.#material     = material;
        this.#ownsGeometry = ownsGeometry;
        this.#ownsMaterial = ownsMaterial;
    }

    /**
     * Releases GPU resources owned by this mesh (geometry and/or material).
     * After dispose, the mesh can remain as a scene object, but it should not be rendered.
     * Important ownership rule, if `ownsMaterial=false`, `Mesh.dispose()` must NOT dispose the material (and its textures).
     */
    dispose() {
        if (this.#isDisposed) {
            return;
        }

        if (this.#ownsGeometry) {
            this.#geometry.dispose();
        }

        if (this.#ownsMaterial) {
            this.#material.dispose();
        }

        this.#isDisposed = true;
    }

    /**
     * @returns {Geometry}
     */
    get geometry() {
        return this.#geometry;
    }

    /**
     * @returns {Material}
     */
    get material() {
        return this.#material;
    }

    /**
     * @returns {boolean}
     */
    get ownsGeometry() {
        return this.#ownsGeometry;
    }

    /**
     * @returns {boolean}
     */
    get ownsMaterial() {
        return this.#ownsMaterial;
    }

    /**
     * @returns {boolean}
     */
    get isDisposed() {
        return this.#isDisposed;
    }
}

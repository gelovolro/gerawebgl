import { Object3D } from './object3d.js';
import { Geometry } from '../geometry/geometry.js';
import { Material } from '../material/material.js';

/**
 * Renderable object that combines geometry and material.
 */
export class Mesh extends Object3D {
    /** @type {Geometry} */
    #geometry;

    /** @type {Material} */
    #material;

    /**
     * @param {Geometry} geometry - Geometry that provides vertex and index buffers for this mesh.
     * @param {Material} material - Material that defines how the geometry should be shaded and rendered.
     */
    constructor(geometry, material) {
        super();

        if (!(geometry instanceof Geometry)) {
            throw new TypeError('Mesh constructor expects a Geometry instance.');
        }

        if (!(material instanceof Material)) {
            throw new TypeError('Mesh constructor expects a Material instance.');
        }

        this.#geometry = geometry;
        this.#material = material;
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
}

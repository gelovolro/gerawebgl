import { Mesh }     from './mesh.js';
import { Geometry } from '../geometry/geometry.js';
import { Material } from '../material/material.js';

/**
 * Renderable line object.
 */
export class Line extends Mesh {
    /**
     * @param {Geometry} geometry - Line geometry.
     * @param {Material} material - Line material.
     * @throws {TypeError} When geometry or material are invalid.
     */
    constructor(geometry, material) {
        if (!(geometry instanceof Geometry)) {
            throw new TypeError('`Line` expects a `Geometry` instance.');
        }

        if (!(material instanceof Material)) {
            throw new TypeError('`Line` expects a `Material` instance.');
        }

        super(geometry, material);
    }
}

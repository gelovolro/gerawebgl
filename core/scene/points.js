import { Mesh }     from './mesh.js';
import { Geometry } from '../geometry/geometry.js';
import { Material } from '../material/material.js';

/**
 * Renderable point cloud object.
 */
export class Points extends Mesh {
    /**
     * @param {Geometry} geometry - Point geometry.
     * @param {Material} material - Points material.
     * @throws {TypeError} When geometry or material are invalid.
     */
    constructor(geometry, material) {
        if (!(geometry instanceof Geometry)) {
            throw new TypeError('`Points` expects a `Geometry` instance.');
        }

        if (!(material instanceof Material)) {
            throw new TypeError('`Points` expects a `Material` instance.');
        }

        super(geometry, material);
    }
}

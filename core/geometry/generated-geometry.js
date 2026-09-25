import { Geometry } from './geometry.js';

/**
 * CPU buffers returned by a geometry generator.
 *
 * @typedef {Object} GeneratedGeometryData
 * @property {Float32Array} positions                     - Vertex positions.
 * @property {Float32Array | null} colors                 - Optional vertex colors.
 * @property {Uint16Array | Uint32Array} indicesSolid     - Solid primitive indexes.
 * @property {Uint16Array | Uint32Array} indicesWireframe - Wireframe indexes.
 * @property {Float32Array | null} uvs                    - Optional texture coordinates.
 * @property {Float32Array | null} normals                - Optional vertex normals.
 * @property {Object} [primitiveOptions]                  - Solid and wireframe primitive overrides.
 */

/**
 * Base class for geometries that generate their buffers from constructor arguments.
 * Subclasses implement the static `createGeometryData` method.
 * GPU resources and their lifetime are managed by `Geometry`.
 *
 * @abstract
 */
export class GeneratedGeometry extends Geometry {
    /**
     * @param {WebGL2RenderingContext} webglContext - WebGL2 rendering context.
     * @param {...*} args                           - Arguments passed to the subclass generator.
     */
    constructor(webglContext, ...args) {
        const data = new.target.createGeometryData(...args);

        super(
            webglContext,
            data.positions,
            data.colors,
            data.indicesSolid,
            data.indicesWireframe,
            data.uvs,
            data.normals,
            data.primitiveOptions
        );
    }

    /**
     * Generates CPU buffers before any GPU resources are created.
     * Subclasses define their own input arguments.
     *
     * @returns {GeneratedGeometryData} - Buffers passed to `Geometry`.
     * @throws {Error} When a subclass has not implemented the generator.
     * @abstract
     * @protected
     */
    static createGeometryData() {
        throw new Error('GeneratedGeometry.createGeometryData must be implemented by a subclass.');
    }
}

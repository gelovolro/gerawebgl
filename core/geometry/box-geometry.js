import { Geometry } from './geometry.js';

/** @type {number} */
const DEFAULT_BOX_SIZE = 1.0;

/** @type {number} */
const BOX_HALF_SIZE_DIVISOR = 2.0;

/**
 * Box geometry centered at the origin.
 */
export class BoxGeometry extends Geometry {
    /**
     * @param {WebGL2RenderingContext} webglContext - WebGL2 rendering context used to create and manage GPU resources.
     * @param {number} size - Edge length of the box.
     */
    constructor(webglContext, size = DEFAULT_BOX_SIZE) {
        if (typeof size !== 'number' || size <= 0) {
            throw new RangeError('BoxGeometry expects a positive size.');
        }

        const halfSize = size / BOX_HALF_SIZE_DIVISOR;

        /* eslint-disable indent */
        const positions = new Float32Array([
            // Front face
            -halfSize, -halfSize,  halfSize, // 0
             halfSize, -halfSize,  halfSize, // 1
             halfSize,  halfSize,  halfSize, // 2
            -halfSize,  halfSize,  halfSize, // 3

            // Back face
            -halfSize, -halfSize, -halfSize, // 4
             halfSize, -halfSize, -halfSize, // 5
             halfSize,  halfSize, -halfSize, // 6
            -halfSize,  halfSize, -halfSize  // 7
        ]);
        /* eslint-enable indent */

        const colors = new Float32Array([
            // Front vertices (0-3) - red
            1.0, 0.0, 0.0,
            1.0, 0.0, 0.0,
            1.0, 0.0, 0.0,
            1.0, 0.0, 0.0,

            // Back vertices (4-7) - blue
            0.0, 0.0, 1.0,
            0.0, 0.0, 1.0,
            0.0, 0.0, 1.0,
            0.0, 0.0, 1.0
        ]);

        const indicesSolid = new Uint16Array([
            // Front face
            0, 1, 2,
            2, 3, 0,

            // Back face
            5, 4, 7,
            7, 6, 5,

            // Top face
            3, 2, 6,
            6, 7, 3,

            // Bottom face
            4, 5, 1,
            1, 0, 4,

            // Right face
            1, 5, 6,
            6, 2, 1,

            // Left face
            4, 0, 3,
            3, 7, 4
        ]);

        const indicesWireframe = new Uint16Array([
            // Front face edges
            0, 1,
            1, 2,
            2, 3,
            3, 0,

            // Back face edges
            4, 5,
            5, 6,
            6, 7,
            7, 4,

            // Side edges
            0, 4,
            1, 5,
            2, 6,
            3, 7
        ]);

        super(webglContext, positions, colors, indicesSolid, indicesWireframe);
    }
}

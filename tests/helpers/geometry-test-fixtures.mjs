import * as GeometryTestConstants from '../test-constants/geometry.js';
import { Vector3 }                from '../../core/math/vector3.js';

export class GeometryTestImageData {
    constructor(data, width, height) {
        this.data   = data;
        this.width  = width;
        this.height = height;
    }
}

export class GeometryTestFixtures {
    // Buffer components and attribute locations in the existing geometry contract
    static COLOR_ATTRIBUTE         = 1;
    static NORMAL_ATTRIBUTE        = 3;
    static SOLID_BUFFER_OFFSET     = -2;
    static WIREFRAME_BUFFER_OFFSET = -1;
    static FLOAT_TOLERANCE         = 1e-6;

    static createColor() {
        return new Float32Array(GeometryTestConstants.GEOMETRY_UNIFORM_COLOR_FIXTURE);
    }

    static createPoints() {
        return [new Vector3(0, 0, 0), new Vector3(1, 0, 0), new Vector3(1, 1, 0)];
    }

    static createCustomOptions() {
        return {
            positions : new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]),
            indices   : [0, 1, 2]
        };
    }

    static createImageData() {
        // Four different heights expose flipped sampling and interpolation errors
        const width  = 2;
        const height = 2;
        const pixels = new Uint8ClampedArray([
            0,   0,   0,   255,
            64,  64,  64,  255,
            128, 128, 128, 255,
            255, 255, 255, 255
        ]);

        return new GeometryTestImageData(pixels, width, height);
    }

    static createFixture(environment, GeometryClass, args) {
        const renderingContext = environment.createCanvas().context;
        const uploads          = [];
        const attributes       = [];
        const createdBuffers   = [];
        const deletedBuffers   = [];
        const createdArrays    = [];
        const deletedArrays    = [];
        const originalBuffer   = renderingContext.createBuffer.bind(renderingContext);
        const originalArray    = renderingContext.createVertexArray.bind(renderingContext);

        renderingContext.createBuffer = () => {
            const buffer = originalBuffer();
            createdBuffers.push(buffer);
            return buffer;
        };

        renderingContext.createVertexArray = () => {
            const array = originalArray();
            createdArrays.push(array);
            return array;
        };

        renderingContext.bufferData          = (target, data, usage) => { uploads.push({ target, data, usage }); };
        renderingContext.vertexAttribPointer = (...values) => { attributes.push(values); };
        renderingContext.deleteBuffer        = (buffer) => { deletedBuffers.push(buffer); };
        renderingContext.deleteVertexArray   = (array) => { deletedArrays.push(array); };

        const geometry = GeometryTestFixtures.#createGeometry(GeometryClass, renderingContext, args);

        return {
            geometry,
            renderingContext,
            uploads,
            attributes,
            createdBuffers,
            deletedBuffers,
            createdArrays,
            deletedArrays
        };
    }

    static #createGeometry(GeometryClass, renderingContext, args) {
        const originalImage = Object.getOwnPropertyDescriptor(globalThis, 'ImageData');
        Object.defineProperty(globalThis, 'ImageData', { value: GeometryTestImageData, configurable: true });
        let geometry = null;

        try {
            geometry = new GeometryClass(renderingContext, ...args);
        } finally {
            if (originalImage) {
                Object.defineProperty(globalThis, 'ImageData', originalImage);
            } else {
                delete globalThis.ImageData;
            }
        }

        return geometry;
    }
}

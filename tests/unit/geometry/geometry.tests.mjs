import test                                from 'node:test';
import assert                              from 'node:assert/strict';
import { Geometry }                        from '../../../core/geometry/geometry.js';
import { GeometryTestFixtures }            from '../../helpers/geometry-test-fixtures.mjs';
import { withFakeBrowserWebGLEnvironment } from '../../helpers/fake-browser-webgl-environment.mjs';
import { SUPPORTED_PRIMITIVES }            from '../../../core/constants/geometry.js';

class GeometryValidationTestFixtures {
    static createArguments() {
        return [
            new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]),
            null,
            new Uint16Array([0, 1, 2]),
            new Uint16Array([0, 1]),
            null,
            null,
            null
        ];
    }

    static createInvalidArguments() {
        return [
            {
                index   : 0,
                value   : [],
                message : 'Geometry expects positions as Float32Array.'
            },

            {
                index   : 1,
                value   : [],
                message : 'Geometry expects colors as Float32Array or null.'
            },

            {
                index   : 2,
                value   : [],
                message : 'Geometry expects indices as Uint16Array or Uint32Array.'
            },

            {
                index   : 3,
                value   : [],
                message : 'Geometry expects indices as Uint16Array or Uint32Array.'
            },

            {
                index   : 4,
                value   : [],
                message : 'Geometry expects uvs as Float32Array or null.'
            },

            {
                index   : 5,
                value   : [],
                message : 'Geometry expects normals as Float32Array or null.'
            },

            {
                index   : 6,
                value   : [],
                message : 'Geometry expects options as a plain object or null.'
            },

            {
                index   : 6,
                value   : 'options',
                message : 'Geometry expects options as a plain object or null.'
            },

            {
                index   : 6,
                value   : { solidPrimitive: 1 },
                message : 'Geometry expects the primitive options to use known primitive constants.'
            },

            {
                index   : 6,
                value   : { wireframePrimitive: 'unknown' },
                message : 'Geometry expects the primitive options to use known primitive constants.'
            }
        ];
    }

    static createInvalidLengths() {
        return [
            {
                index   : 0,
                value   : new Float32Array(2),
                message : 'Geometry positions length must be a multiple of POSITION_COMPONENT_COUNT.'
            },

            {
                index   : 1,
                value   : new Float32Array(2),
                message : 'Geometry colors length must be a multiple of COLOR_COMPONENT_COUNT.'
            },

            {
                index   : 1,
                value   : new Float32Array(3),
                message : 'Geometry colors vertex count must match positions vertex count.'
            },

            {
                index   : 4,
                value   : new Float32Array(1),
                message : 'Geometry uvs length must be a multiple of UV_COMPONENT_COUNT.'
            },

            {
                index   : 4,
                value   : new Float32Array(2),
                message : 'Geometry uvs vertex count must match positions vertex count.'
            },

            {
                index   : 5,
                value   : new Float32Array(2),
                message : 'Geometry normals length must be a multiple of NORMAL_COMPONENT_COUNT.'
            },

            {
                index   : 5,
                value   : new Float32Array(3),
                message : 'Geometry normals vertex count must match positions vertex count.'
            },

            {
                index   : 2,
                value   : new Uint16Array(2),
                message : 'Geometry solid indices length must be a multiple of TRIANGLE_INDEX_COMPONENT_COUNT.'
            },

            {
                index   : 3,
                value   : new Uint16Array(1),
                message : 'Geometry wireframe indices length must be a multiple of LINE_INDEX_COMPONENT_COUNT.'
            }
        ];
    }
}

test("'Geometry' should reject an invalid rendering context before creating resources", () => {
    withFakeBrowserWebGLEnvironment(() => {
        // Arrange
        const args          = GeometryValidationTestFixtures.createArguments();
        const expectedError = { name: 'TypeError', message: 'Geometry expects a WebGL2RenderingContext.' };

        // Act & Assert
        assert.throws(() => new Geometry(null, ...args), expectedError);
    });
});

for (const [name, createCases, errorName] of [
    ['argument types', GeometryValidationTestFixtures.createInvalidArguments, 'TypeError'],
    ['buffer lengths', GeometryValidationTestFixtures.createInvalidLengths, 'Error']
]) {
    test(`'Geometry' should reject invalid ${name} before allocating GPU buffers`, () => {
        withFakeBrowserWebGLEnvironment((environment) => {
            // Arrange
            const renderingContext = environment.createCanvas().context;
            const cases            = createCases();
            const expectedCalls    = [];
            const actualCalls      = [];
            renderingContext.createVertexArray = () => { actualCalls.push('createVertexArray'); };

            // Act & Assert
            cases.forEach(({ index, value, message }) => {
                const args          = GeometryValidationTestFixtures.createArguments();
                const expectedError = { name: errorName, message };
                args[index] = value;
                assert.throws(() => new Geometry(renderingContext, ...args), expectedError);
                assert.deepEqual(actualCalls, expectedCalls);
            });
        });
    });
}

test("'Geometry' should require at least two indices for line strips and loops", () => {
    withFakeBrowserWebGLEnvironment((environment) => {
        // Arrange
        const solidIndicesArgumentIndex     = 2;
        const primitiveOptionsArgumentIndex = 6;
        const renderingContext              = environment.createCanvas().context;
        const primitives                    = ['line_strip', 'line_loop'];
        const expectedError                 = { name: 'Error', message: 'Geometry solid indices length must be at least 2.' };

        primitives.forEach((primitive) => {
            // Also arrange
            const args                          = GeometryValidationTestFixtures.createArguments();
            args[solidIndicesArgumentIndex]     = new Uint16Array([0]);
            args[primitiveOptionsArgumentIndex] = { solidPrimitive: primitive };

            // Act & Assert
            assert.throws(() => new Geometry(renderingContext, ...args), expectedError);
        });
    });
});

test("'Geometry' should reject primitive names without an index validation rule", () => {
    withFakeBrowserWebGLEnvironment((environment) => {
        // Arrange
        const primitiveOptionsArgumentIndex = 6;
        const primitive                     = 'unsupported';
        const renderingContext              = environment.createCanvas().context;
        const args                          = GeometryValidationTestFixtures.createArguments();
        const expectedError                 = { name: 'Error', message : 'Geometry expects the primitive options to use known primitive constants.' };
        args[primitiveOptionsArgumentIndex] = { solidPrimitive: primitive };
        SUPPORTED_PRIMITIVES.add(primitive);

        try {
            // Act & Assert
            assert.throws(() => new Geometry(renderingContext, ...args), expectedError);
        } finally {
            SUPPORTED_PRIMITIVES.delete(primitive);
        }
    });
});

test("'Geometry' should report failures to allocate each GPU resource type", () => {
    withFakeBrowserWebGLEnvironment((environment) => {
        // Arrange
        const cases = [
            {
                method      : 'createVertexArray',
                failureCall : 1,
                message     : 'Failed to create vertex array object (VAO).'
            },

            {
                method      : 'createBuffer',
                failureCall : 1,
                message     : 'Failed to create ARRAY_BUFFER.'
            },

            {
                method      : 'createBuffer',
                failureCall : 2,
                message     : 'Failed to create ELEMENT_ARRAY_BUFFER.'
            }
        ];

        // Act & Assert
        cases.forEach(({ method, failureCall, message }) => {
            const renderingContext = environment.createCanvas().context;
            const args             = GeometryValidationTestFixtures.createArguments();
            const expectedError    = { name: 'Error', message };
            let callCount          = 0;

            renderingContext[method] = () => {
                callCount += 1;
                return callCount === failureCall ? null : {};
            };

            assert.throws(() => new Geometry(renderingContext, ...args), expectedError);
        });
    });
});

test("'Geometry' should preserve optional buffers, index types and resource disposal", () => {
    withFakeBrowserWebGLEnvironment((environment) => {
        // Arrange
        const args = GeometryValidationTestFixtures.createArguments();
        args[1]    = new Float32Array([1, 0, 0, 0, 1, 0, 0, 0, 1]);
        args[2]    = new Uint32Array([0, 1, 2]);
        args[3]    = new Uint32Array([0, 1]);
        args[4]    = new Float32Array([0, 0, 1, 0, 0, 1]);
        args[5]    = new Float32Array([0, 0, 1, 0, 0, 1, 0, 0, 1]);

        const expectedAttributes = [[0, 3], [1, 3], [2, 2], [3, 3]];
        const expectedError      = { name: 'Error', message: 'Geometry has been disposed and can no longer be used.' };

        // Act
        const fixture = GeometryTestFixtures.createFixture(environment, Geometry, args);
        fixture.geometry.dispose();
        fixture.geometry.dispose();

        // Assert
        assert.deepEqual(fixture.attributes.map(([location, count]) => [location, count]), expectedAttributes);
        assert.deepEqual(fixture.deletedBuffers, fixture.createdBuffers);
        assert.deepEqual(fixture.deletedArrays, fixture.createdArrays);

        const operations = [
            () => fixture.geometry.bind(),
            () => fixture.geometry.bindIndexBuffer(false),
            () => fixture.geometry.getIndexCount(false),
            () => fixture.geometry.getIndexComponentType(false),
            () => fixture.geometry.getPrimitive(false),
            () => fixture.geometry.getBoundingBoxMin(),
            () => fixture.geometry.getBoundingBoxMax()
        ];

        operations.forEach((operation) => assert.throws(operation, expectedError));
    });
});

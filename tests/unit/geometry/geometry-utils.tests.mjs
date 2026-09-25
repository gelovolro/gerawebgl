import * as GeometryTestConstants from '../../test-constants/geometry.js';
import test                       from 'node:test';
import assert                     from 'node:assert/strict';
import * as MathTestConstants     from '../../test-constants/math.js';
import { GeometryUtils }          from '../../../core/geometry/geometry-utils.js';

class GeometryUtilsTestFixtures {
    // Vertex counts on both sides of the 'Uint16Array' capacity boundary
    static MAX_UINT16_VERTEX_COUNT = 65536;
    static MIN_UINT32_VERTEX_COUNT = 65537;

    // Largest 16-bit index and first index that needs 32 bits
    static MAX_UINT16_INDEX_VALUE = 65535;
    static FIRST_UINT32_INDEX     = 65536;

    // Distinct RGB components, used to check color order and repetition
    static COLOR_VERTEX_COUNT = 3;
    static PER_VERTEX_COLORS  = Object.freeze([
        0.25, 0.5, 0.75,
        1.0,  0.0, 0.5,
        0.75, 1.0, 0.25
    ]);

    // Two triangles sharing an edge in opposite directions
    static WIREFRAME_VERTEX_COUNT = 4;
    static SOLID_INDICES          = Object.freeze([2, 0, 1, 2, 1, 3]);
    static WIREFRAME_INDICES      = Object.freeze([0, 2, 0, 1, 1, 2, 1, 3, 2, 3]);
}

test("'GeometryUtils.createColorsFromSpec' should repeat a uniform RGB color for every vertex without changing the input", () => {
    // Arrange
    const vertexCount    = GeometryUtilsTestFixtures.COLOR_VERTEX_COUNT;
    const colors         = new Float32Array(GeometryTestConstants.GEOMETRY_UNIFORM_COLOR_FIXTURE);
    const originalColors = colors.slice();
    const expectedColors = new Float32Array([
        0.25, 0.5, 0.75,
        0.25, 0.5, 0.75,
        0.25, 0.5, 0.75
    ]);

    // Act
    const actualColors = GeometryUtils.createColorsFromSpec(vertexCount, colors);

    // Assert
    assert.deepEqual(actualColors, expectedColors);
    assert.notEqual(actualColors.buffer, colors.buffer);
    assert.deepEqual(colors, originalColors);
});

test("'GeometryUtils.createColorsFromSpec' should copy a uniform color even for a single vertex", () => {
    // Arrange
    const vertexCount    = 1;
    const colors         = new Float32Array(GeometryTestConstants.GEOMETRY_UNIFORM_COLOR_FIXTURE);
    const expectedColors = colors.slice();

    // Act
    const actualColors = GeometryUtils.createColorsFromSpec(vertexCount, colors);

    // Assert
    assert.deepEqual(actualColors, expectedColors);
    assert.notEqual(actualColors.buffer, colors.buffer);
});

test("'GeometryUtils.createColorsFromSpec' should return the original per-vertex color view", () => {
    // Arrange
    const vertexCount     = GeometryUtilsTestFixtures.COLOR_VERTEX_COUNT;
    const colorStartIndex = 1;
    const colorEndIndex   = -1;
    const colorStorage    = new Float32Array([0.0, ...GeometryUtilsTestFixtures.PER_VERTEX_COLORS, 0.0]);
    const colors          = colorStorage.subarray(colorStartIndex, colorEndIndex);
    const originalColors  = colorStorage.slice();

    // Act
    const actualColors = GeometryUtils.createColorsFromSpec(vertexCount, colors);

    // Assert
    assert.equal(actualColors, colors);
    assert.deepEqual(colorStorage, originalColors);
});

test("'GeometryUtils.createColorsFromSpec' should use an explicit buffer length when repeating a uniform color", () => {
    // Arrange
    const vertexCount    = 2;
    const colors         = new Float32Array(GeometryTestConstants.GEOMETRY_UNIFORM_COLOR_FIXTURE);
    const expectedColors = new Float32Array([
        0.25, 0.5, 0.75,
        0.25, 0.5, 0.75,
        0.0,  0.0, 0.0
    ]);

    // Act
    const actualColors = GeometryUtils.createColorsFromSpec(vertexCount, colors, expectedColors.length);

    // Assert
    assert.deepEqual(actualColors, expectedColors);
});

test("'GeometryUtils.createColorsFromSpec' should use an explicit length when accepting per-vertex colors", () => {
    // Arrange
    const vertexCount = GeometryUtilsTestFixtures.COLOR_VERTEX_COUNT;
    const colors      = new Float32Array([0.25, 0.5, 0.75, 1.0, 0.0, 0.5]);

    // Act
    const actualColors = GeometryUtils.createColorsFromSpec(vertexCount, colors, colors.length);

    // Assert
    assert.equal(actualColors, colors);
});

test("'GeometryUtils.createColorsFromSpec' should detect the buffer length when the explicit length is zero or negative", () => {
    // Arrange
    const vertexCount    = GeometryUtilsTestFixtures.COLOR_VERTEX_COUNT;
    const colors         = new Float32Array(GeometryUtilsTestFixtures.PER_VERTEX_COLORS);
    const automaticSizes = [0, -1];

    // Act & Assert
    automaticSizes.forEach((expectedLength) => {
        assert.equal(GeometryUtils.createColorsFromSpec(vertexCount, colors, expectedLength), colors);
    });
});

test("'GeometryUtils.createColorsFromSpec' should handle zero vertices for uniform and empty per-vertex colors", () => {
    // Arrange
    const vertexCount  = 0;
    const uniformColor = new Float32Array(GeometryTestConstants.GEOMETRY_UNIFORM_COLOR_FIXTURE);
    const emptyColors  = new Float32Array();

    // Act
    const actualUniformColors   = GeometryUtils.createColorsFromSpec(vertexCount, uniformColor);
    const actualPerVertexColors = GeometryUtils.createColorsFromSpec(vertexCount, emptyColors);

    // Assert
    assert.deepEqual(actualUniformColors, emptyColors);
    assert.equal(actualPerVertexColors, emptyColors);
});

test("'GeometryUtils.createColorsFromSpec' should reject colors that are not a 'Float32Array'", () => {
    // Arrange
    const vertexCount   = GeometryUtilsTestFixtures.COLOR_VERTEX_COUNT;
    const invalidColors = [undefined, null, [], {}, 'colors', 1, new Float64Array(), new Uint8Array()];
    const expectedError = {
        name    : 'TypeError',
        message : 'GeometryUtils.createColorsFromSpec expects colors as a Float32Array.'
    };

    // Act & Assert
    invalidColors.forEach((colors) => assert.throws(() => GeometryUtils.createColorsFromSpec(vertexCount, colors), expectedError));
});

test("'GeometryUtils.createColorsFromSpec' should reject color lengths that are neither uniform nor per-vertex", () => {
    // Arrange
    const vertexCount    = GeometryUtilsTestFixtures.COLOR_VERTEX_COUNT;
    const invalidLengths = [0, 1, 2, 4, 8, 10];
    const expectedError  = {
        name    : 'TypeError',
        message : 'GeometryUtils.createColorsFromSpec expects colors length to be 3 (uniform) or 9 (per-vertex).'
    };

    // Act & Assert
    invalidLengths.forEach((length) => {
        const colors = new Float32Array(length);
        assert.throws(() => GeometryUtils.createColorsFromSpec(vertexCount, colors), expectedError);
    });
});

test("'GeometryUtils.createColorsFromSpec' should report an explicit expected length when rejecting colors", () => {
    // Arrange
    const vertexCount    = GeometryUtilsTestFixtures.COLOR_VERTEX_COUNT;
    const colors         = new Float32Array(GeometryUtilsTestFixtures.PER_VERTEX_COLORS);
    const expectedLength = 6;
    const expectedError  = {
        name    : 'TypeError',
        message : 'GeometryUtils.createColorsFromSpec expects colors length to be 3 (uniform) or 6 (per-vertex).'
    };

    // Act
    const actualCall = () => GeometryUtils.createColorsFromSpec(vertexCount, colors, expectedLength);

    // Assert
    assert.throws(actualCall, expectedError);
});

test("'GeometryUtils.createIndexArray' should use 'Uint16Array' up to and including its vertex count boundary", () => {
    // Arrange
    const vertexCounts = [
        GeometryUtilsTestFixtures.MAX_UINT16_VERTEX_COUNT - 1,
        GeometryUtilsTestFixtures.MAX_UINT16_VERTEX_COUNT
    ];

    vertexCounts.forEach((vertexCount) => {
        // Also arrange
        const indices         = [0, vertexCount - 1, 1];
        const originalIndices = [...indices];
        const expectedIndices = new Uint16Array(indices);

        // Act
        const actualIndices = GeometryUtils.createIndexArray(vertexCount, indices);

        // Assert
        assert.deepEqual(actualIndices, expectedIndices);
        assert.deepEqual(indices, originalIndices);
    });
});

test("'GeometryUtils.createIndexArray' should preserve the first index that requires 'Uint32Array'", () => {
    // Arrange
    const vertexCount     = GeometryUtilsTestFixtures.MIN_UINT32_VERTEX_COUNT;
    const indices         = [GeometryUtilsTestFixtures.FIRST_UINT32_INDEX, 0, GeometryUtilsTestFixtures.MAX_UINT16_INDEX_VALUE];
    const originalIndices = [...indices];
    const expectedIndices = new Uint32Array(indices);

    // Act
    const actualIndices = GeometryUtils.createIndexArray(vertexCount, indices);

    // Assert
    assert.deepEqual(actualIndices, expectedIndices);
    assert.deepEqual(indices, originalIndices);
});

test("'GeometryUtils.createIndexArray' should choose the array type from the vertex count even for an empty index list", () => {
    // Arrange
    const boundaryCases = [
        [0, new Uint16Array()],
        [GeometryUtilsTestFixtures.MAX_UINT16_VERTEX_COUNT, new Uint16Array()],
        [GeometryUtilsTestFixtures.MIN_UINT32_VERTEX_COUNT, new Uint32Array()]
    ];

    // Act & Assert
    boundaryCases.forEach(([vertexCount, expectedIndices]) => {
        assert.deepEqual(GeometryUtils.createIndexArray(vertexCount, []), expectedIndices);
    });
});

test("'GeometryUtils.createIndexArray' should reject inputs that are not ordinary arrays", () => {
    // Arrange
    const vertexCount    = GeometryUtilsTestFixtures.WIREFRAME_VERTEX_COUNT;
    const invalidIndices = [undefined, null, {}, 'indices', 1, new Uint16Array(), new Uint32Array()];
    const expectedError  = {
        name    : 'TypeError',
        message : 'GeometryUtils.createIndexArray expects indices as an array of numbers.'
    };

    // Act & Assert
    invalidIndices.forEach((indices) => assert.throws(() => GeometryUtils.createIndexArray(vertexCount, indices), expectedError));
});

test("'GeometryUtils.createSequentialIndexArray' should return an empty 'Uint16Array' for zero vertices", () => {
    // Arrange
    const vertexCount     = 0;
    const expectedIndices = new Uint16Array();

    // Act
    const actualIndices = GeometryUtils.createSequentialIndexArray(vertexCount);

    // Assert
    assert.deepEqual(actualIndices, expectedIndices);
});

test("'GeometryUtils.createSequentialIndexArray' should include every index from zero to the last vertex", () => {
    // Arrange
    const expectedBuffers = [new Uint16Array([0]), new Uint16Array([0, 1, 2, 3])];

    // Act & Assert
    expectedBuffers.forEach((expectedIndices) => {
        const actualIndices = GeometryUtils.createSequentialIndexArray(expectedIndices.length);
        assert.deepEqual(actualIndices, expectedIndices);
    });
});

test("'GeometryUtils.createSequentialIndexArray' should select the correct type on both sides of the 16-bit boundary", () => {
    // Arrange
    const boundaryCases = [
        [GeometryUtilsTestFixtures.MAX_UINT16_VERTEX_COUNT - 1, Uint16Array],
        [GeometryUtilsTestFixtures.MAX_UINT16_VERTEX_COUNT    , Uint16Array],
        [GeometryUtilsTestFixtures.MIN_UINT32_VERTEX_COUNT    , Uint32Array]
    ];

    boundaryCases.forEach(([vertexCount, ExpectedArray]) => {
        // Act
        const actualIndices = GeometryUtils.createSequentialIndexArray(vertexCount);

        // Assert
        assert.equal(actualIndices instanceof ExpectedArray, true);
        assert.equal(actualIndices.length, vertexCount);
        actualIndices.forEach((vertexIndex, position) => assert.equal(vertexIndex, position));
    });
});

test("'GeometryUtils.createSequentialIndexArray' should reject non-numeric and non-finite vertex counts", () => {
    // Arrange
    const invalidCounts = [undefined, null, '3', true, {}, [], ...MathTestConstants.MATH_NON_FINITE_VALUES];
    const expectedError = {
        name    : 'TypeError',
        message : 'GeometryUtils.createSequentialIndexArray expects vertexCount as a finite number.'
    };

    // Act & Assert
    invalidCounts.forEach((vertexCount) => assert.throws(() => GeometryUtils.createSequentialIndexArray(vertexCount), expectedError));
});

test("'GeometryUtils.createSequentialIndexArray' should reject negative and fractional vertex counts", () => {
    // Arrange
    const invalidCounts = [-1, -0.5, 0.5, 1.5];
    const expectedError = {
        name    : 'RangeError',
        message : 'GeometryUtils.createSequentialIndexArray expects vertexCount as a non-negative integer.'
    };

    // Act & Assert
    invalidCounts.forEach((vertexCount) => assert.throws(() => GeometryUtils.createSequentialIndexArray(vertexCount), expectedError));
});

test("'GeometryUtils.createWireframeIndicesFromSolidIndices' should deduplicate shared edges for both supported input types", () => {
    const arrayTypes = [Uint16Array, Uint32Array];

    arrayTypes.forEach((IndexArray) => {
        // Arrange
        const vertexCount     = GeometryUtilsTestFixtures.WIREFRAME_VERTEX_COUNT;
        const solidIndices    = new IndexArray(GeometryUtilsTestFixtures.SOLID_INDICES);
        const originalIndices = solidIndices.slice();
        const expectedIndices = new Uint16Array(GeometryUtilsTestFixtures.WIREFRAME_INDICES);

        // Act
        const actualIndices = GeometryUtils.createWireframeIndicesFromSolidIndices(vertexCount, solidIndices);

        // Assert
        assert.deepEqual(actualIndices, expectedIndices);
        assert.deepEqual(solidIndices, originalIndices);
        assert.notEqual(actualIndices.buffer, solidIndices.buffer);
    });
});

test("'GeometryUtils.createWireframeIndicesFromSolidIndices' should keep each edge once for repeated and reversed triangles", () => {
    // Arrange
    const vertexCount     = 3;
    const solidIndices    = new Uint16Array([2, 0, 1, 2, 0, 1, 1, 0, 2]);
    const expectedIndices = new Uint16Array([0, 2, 0, 1, 1, 2]);

    // Act
    const actualIndices = GeometryUtils.createWireframeIndicesFromSolidIndices(vertexCount, solidIndices);

    // Assert
    assert.deepEqual(actualIndices, expectedIndices);
});

test("'GeometryUtils.createWireframeIndicesFromSolidIndices' should keep distinct edges whose concatenated digits match", () => {
    // Arrange

    // Vertex indexes start at zero, so index 234 requires at least 235 vertices
    const vertexCount = 235;

    // String keys identify edges to avoid the duplicates.
    // Without a separator, edges [1, 234] and [12, 34] both become '1234'.
    // Vertices 5 and 6 complete the two triangles.
    const solidIndices = new Uint16Array([
        1, 234, 5,
        12, 34, 6
    ]);

    // Each pair represents one edge, with the smaller vertex index first.
    // Keep all three edges from each triangle in their traversal order.
    const expectedIndices = new Uint16Array([
        // Edges of triangle [1, 234, 5]
        1, 234,
        5, 234,
        1, 5,

        // Edges of triangle [12, 34, 6]
        12, 34,
        6 , 34,
        6 , 12
    ]);

    // Act
    const actualIndices = GeometryUtils.createWireframeIndicesFromSolidIndices(vertexCount, solidIndices);

    // Assert
    assert.deepEqual(actualIndices, expectedIndices);
});

test("'GeometryUtils.createWireframeIndicesFromSolidIndices' should preserve indices that require 'Uint32Array'", () => {
    // Arrange
    const vertexCount     = GeometryUtilsTestFixtures.MIN_UINT32_VERTEX_COUNT;
    const highIndex       = GeometryUtilsTestFixtures.FIRST_UINT32_INDEX;
    const solidIndices    = new Uint32Array([highIndex, 0, 1]);
    const originalIndices = solidIndices.slice();
    const expectedIndices = new Uint32Array([0, highIndex, 0, 1, 1, highIndex]);

    // Act
    const actualIndices = GeometryUtils.createWireframeIndicesFromSolidIndices(vertexCount, solidIndices);

    // Assert
    assert.deepEqual(actualIndices, expectedIndices);
    assert.deepEqual(solidIndices, originalIndices);
});

test("'GeometryUtils.createWireframeIndicesFromSolidIndices' should return an empty buffer for either empty input type", () => {
    // Arrange
    const vertexCount     = 0;
    const emptyInputs     = [new Uint16Array(), new Uint32Array()];
    const expectedIndices = new Uint16Array();

    // Act & Assert
    emptyInputs.forEach((indices) => {
        assert.deepEqual(GeometryUtils.createWireframeIndicesFromSolidIndices(vertexCount, indices), expectedIndices);
    });
});

test("'GeometryUtils.createWireframeIndicesFromSolidIndices' should reject unsupported index inputs", () => {
    // Arrange
    const vertexCount    = GeometryUtilsTestFixtures.WIREFRAME_VERTEX_COUNT;
    const invalidIndices = [undefined, null, [], {}, 'indices', 1, new Int16Array(), new Uint8Array(), new Float32Array()];
    const expectedError  = {
        name    : 'TypeError',
        message : 'GeometryUtils.createWireframeIndicesFromSolidIndices expects indices as Uint16Array or Uint32Array.'
    };

    // Act & Assert
    invalidIndices.forEach((indices) => {
        assert.throws(() => GeometryUtils.createWireframeIndicesFromSolidIndices(vertexCount, indices), expectedError);
    });
});

test("'GeometryUtils.normalizeSegmentCount' should floor valid counts and accept the minimum", () => {
    // Arrange
    const minimumCount = 3;
    const optionName   = 'radialSegments';
    const geometryName = 'ConeGeometry';
    const cases        = [[3, 3], [3.9, 3], [5.5, 5]];

    // Act & Assert
    cases.forEach(([value, expectedCount]) => {
        assert.equal(GeometryUtils.normalizeSegmentCount(value, optionName, minimumCount, geometryName), expectedCount);
    });
});

test("'GeometryUtils.normalizeSegmentCount' should reject non-numeric and non-finite counts", () => {
    // Arrange
    const minimumCount  = 3;
    const optionName    = 'radialSegments';
    const geometryName  = 'ConeGeometry';
    const invalidCounts = [undefined, null, '3', true, {}, [], ...MathTestConstants.MATH_NON_FINITE_VALUES];
    const expectedError = {
        name    : 'TypeError',
        message : 'ConeGeometry expects radialSegments as a finite number.'
    };

    // Act & Assert
    invalidCounts.forEach((value) => {
        assert.throws(() => GeometryUtils.normalizeSegmentCount(value, optionName, minimumCount, geometryName), expectedError);
    });
});

test("'GeometryUtils.normalizeSegmentCount' should report the supplied minimum and geometry name", () => {
    // Arrange
    const minimumCount  = 2;
    const optionName    = 'heightSegments';
    const geometryName  = 'SphereGeometry';
    const invalidCounts = [-1, 0, 1, 1.9];
    const expectedError = {
        name    : 'RangeError',
        message : 'SphereGeometry expects heightSegments to be >= 2.'
    };

    // Act & Assert
    invalidCounts.forEach((value) => {
        assert.throws(() => GeometryUtils.normalizeSegmentCount(value, optionName, minimumCount, geometryName), expectedError);
    });
});

test("'GeometryUtils.appendGridTriangleIndices' should append both winding orders with a vertex offset", () => {
    // Arrange
    const columnSegments = 2;
    const rowSegments    = 1;
    const vertexOffset   = 5;
    const existingIndex  = 99;
    const cases          = [
        {
            reverse         : false,
            expectedIndices : [99, 5, 8, 6, 6, 8, 9, 6, 9, 7, 7, 9, 10]
        },
        {
            reverse         : true,
            expectedIndices : [99, 5, 6, 8, 6, 9, 8, 6, 7, 9, 7, 10, 9]
        }
    ];

    cases.forEach(({ reverse, expectedIndices }) => {
        // Also arrange
        const actualIndices = [existingIndex];
        // Act
        GeometryUtils.appendGridTriangleIndices(actualIndices, columnSegments, rowSegments, vertexOffset, reverse);
        // Assert
        assert.deepEqual(actualIndices, expectedIndices);
    });
});

test("'GeometryUtils.appendGridTriangleIndices' should leave indices unchanged for an empty grid", () => {
    // Arrange
    const dimensions      = [[0, 2], [2, 0]];
    const expectedIndices = [3, 4, 5];

    dimensions.forEach(([columnSegments, rowSegments]) => {
        // Also arrange
        const actualIndices = [...expectedIndices];
        // Act
        GeometryUtils.appendGridTriangleIndices(actualIndices, columnSegments, rowSegments);
        // Assert
        assert.deepEqual(actualIndices, expectedIndices);
    });
});

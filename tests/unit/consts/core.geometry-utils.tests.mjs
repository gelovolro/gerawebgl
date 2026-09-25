import test                        from 'node:test';
import assert                      from 'node:assert/strict';
import * as GeometryUtilsConstants from '../../../core/constants/geometry-utils.js';

test("'GeometryUtils' constants objects should be frozen", () => {
    // Arrange
    const expectedIsFrozen = true;
    const constantsObjects = [
        GeometryUtilsConstants.GEOMETRY_COLORS,
        GeometryUtilsConstants.GEOMETRY_COLOR_INDEXES,
        GeometryUtilsConstants.GEOMETRY_INDICES,
        GeometryUtilsConstants.GEOMETRY_TRIANGLE_INDEXES,
        GeometryUtilsConstants.GEOMETRY_DEFAULT_VERTEX_COLOR
    ];

    // Act & Assert
    constantsObjects.forEach((constantsObject) => assert.equal(Object.isFrozen(constantsObject), expectedIsFrozen));
});

test("'GeometryUtils' color constants should keep the RGB layout and automatic length", () => {
    // Arrange
    const expectedComponentCount = 3;
    const expectedAutoLength     = 0;

    // Act
    const actualConstants = GeometryUtilsConstants.GEOMETRY_COLORS;

    // Assert
    assert.equal(actualConstants.COMPONENT_COUNT, expectedComponentCount);
    assert.equal(actualConstants.AUTO_LENGTH, expectedAutoLength);
});

test("'GeometryUtils' color indexes should follow the RGB component order", () => {
    // Arrange
    const expectedRedIndex   = 0;
    const expectedGreenIndex = 1;
    const expectedBlueIndex  = 2;

    // Act
    const actualConstants = GeometryUtilsConstants.GEOMETRY_COLOR_INDEXES;

    // Assert
    assert.equal(actualConstants.RED, expectedRedIndex);
    assert.equal(actualConstants.GREEN, expectedGreenIndex);
    assert.equal(actualConstants.BLUE, expectedBlueIndex);
});

test("'GeometryUtils' index constants should keep existing values", () => {
    // Arrange
    const expectedMaxUint16IndexValue         = 0xffff;
    const expectedVertexCountToMaxIndexOffset = 1;
    const expectedMinVertexCount              = 0;
    const expectedFirstVertexIndex            = 0;
    const expectedSequentialIndexIncrement    = 1;
    const expectedTriangleIndexStride         = 3;

    // Act
    const actualConstants = GeometryUtilsConstants.GEOMETRY_INDICES;

    // Assert
    assert.equal(actualConstants.MAX_UINT16_INDEX_VALUE, expectedMaxUint16IndexValue);
    assert.equal(actualConstants.VERTEX_COUNT_TO_MAX_INDEX_OFFSET, expectedVertexCountToMaxIndexOffset);
    assert.equal(actualConstants.MIN_VERTEX_COUNT, expectedMinVertexCount);
    assert.equal(actualConstants.FIRST_VERTEX_INDEX, expectedFirstVertexIndex);
    assert.equal(actualConstants.SEQUENTIAL_INDEX_INCREMENT, expectedSequentialIndexIncrement);
    assert.equal(actualConstants.TRIANGLE_INDEX_STRIDE, expectedTriangleIndexStride);
});

test("'GeometryUtils' triangle indexes should address all three vertices in order", () => {
    // Arrange
    const expectedFirstIndex  = 0;
    const expectedSecondIndex = 1;
    const expectedThirdIndex  = 2;

    // Act
    const actualConstants = GeometryUtilsConstants.GEOMETRY_TRIANGLE_INDEXES;

    // Assert
    assert.equal(actualConstants.FIRST, expectedFirstIndex);
    assert.equal(actualConstants.SECOND, expectedSecondIndex);
    assert.equal(actualConstants.THIRD, expectedThirdIndex);
});

test("'GeometryUtils' edge key separator should keep its existing value", () => {
    // Arrange
    const expectedSeparator = ',';

    // Act
    const actualSeparator = GeometryUtilsConstants.GEOMETRY_EDGE_KEY_SEPARATOR;

    // Assert
    assert.equal(actualSeparator, expectedSeparator);
});

test("'GeometryUtils' default vertex color should keep existing components", () => {
    // Arrange
    const expectedColor = [1.0, 1.0, 1.0];

    // Act
    const actualColor = GeometryUtilsConstants.GEOMETRY_DEFAULT_VERTEX_COLOR;

    // Assert
    assert.deepEqual(actualColor, expectedColor);
});

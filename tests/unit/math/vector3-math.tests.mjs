import test                                from 'node:test';
import assert                              from 'node:assert/strict';
import { Vector3Math }                     from '../../../core/math/vector3-math.js';
import { Vector3 }                         from '../../../core/math/vector3.js';
import { MATH_COMMON_VALUES, MATH_LAYOUT } from '../../../core/constants/math.js';
import * as MathTestConstants              from '../../test-constants/math.js';
import { TestConstants }                   from '../../helpers/test-constants.js';

class Vector3MathTestFixtures {
    static UNDEFINED_VALUE         = undefined;
    static VECTOR3_FORMAT          = 'vector3';
    static FLOAT32_FORMAT          = 'float32';
    static SCALE_FACTOR            = -2;
    static LERP_FACTOR             = 0.25;
    static EXTRAPOLATION_FACTOR    = 2;
    static CLAMP_MINIMUM           = -1;
    static CLAMP_MAXIMUM           = 6;
    static REVERSED_CLAMP_MINIMUM  = 5;
    static REVERSED_CLAMP_MAXIMUM  = -1;
    static COMPARISON_EPSILON      = 1;
    static NEGATIVE_EPSILON        = -1;
    static BELOW_DEFAULT_EPSILON   = 5e-7;
    static ABOVE_DEFAULT_EPSILON   = 2e-6;
    static BELOW_NORMALIZE_MINIMUM = 1e-9;
    static ABOVE_NORMALIZE_MINIMUM = 1e-6;
    static EXPECTED_NOTIFICATIONS  = 3;
    static EXPECTED_LENGTH         = Math.sqrt((3 * 3) + (-4 * -4) + (12 * 12));
    static EXPECTED_DISTANCE       = Math.sqrt((5 * 5) + (-9 * -9) + (5 * 5));
    static FORMATS                 = Object.freeze([this.VECTOR3_FORMAT, this.FLOAT32_FORMAT]);
    static FIRST_COMPONENTS        = Object.freeze([3, -4, 12]);
    static SECOND_COMPONENTS       = Object.freeze([-2, 5, 7]);
    static EXPECTED_ADD            = Object.freeze([1, 1, 19]);
    static EXPECTED_SUB            = Object.freeze([5, -9, 5]);
    static EXPECTED_SCALE          = Object.freeze([-6, 8, -24]);
    static EXPECTED_NORMALIZE      = Object.freeze([3 / 13, -4 / 13, 12 / 13]);
    static EXPECTED_CROSS          = Object.freeze([-88, -45, 7]);
    static EXPECTED_LERP           = Object.freeze([1.75, -1.75, 10.75]);
    static EXPECTED_EXTRAPOLATION  = Object.freeze([-7, 14, 2]);
    static EXPECTED_CLAMP          = Object.freeze([3, -1, 6]);
    static EXPECTED_REVERSED_CLAMP = Object.freeze([5, 5, 5]);
    static ZERO_COMPONENTS         = Object.freeze([0, 0, 0]);
    static UNIT_X_COMPONENTS       = Object.freeze([1, 0, 0]);
    static EQUAL_COMPONENTS        = Object.freeze([1, 1, 1]);
    static BEYOND_X_COMPONENTS     = Object.freeze([2, 0, 0]);
    static BEYOND_Y_COMPONENTS     = Object.freeze([0, 2, 0]);
    static BEYOND_Z_COMPONENTS     = Object.freeze([0, 0, 2]);
    static INVALID_VECTOR_LENGTHS  = Object.freeze([0, 1, 2, 4, 5]);
    static INVALID_VECTOR_VALUES   = Object.freeze([undefined, null, false, 0, 'vector', {}, [], new Float64Array(MATH_LAYOUT.VECTOR3_ELEMENT_COUNT)]);
    static INVALID_SCALAR_TYPES    = Object.freeze([undefined, null, true, '1', {}, [], Object(1)]);
    static EXPECTED_DOT            = this.FIRST_COMPONENTS.reduce(
        (sum, component, index) => sum + component * this.SECOND_COMPONENTS[index],
        MATH_COMMON_VALUES.ZERO
    );

    static createVector(components, format = this.VECTOR3_FORMAT) {
        return format === this.FLOAT32_FORMAT
            ? new Float32Array(components)
            : new Vector3(...components);
    }

    static createOutput(format = this.VECTOR3_FORMAT) {
        return this.createVector(this.ZERO_COMPONENTS, format);
    }

    static getComponents(vector) {
        return vector instanceof Vector3
            ? [vector.x, vector.y, vector.z]
            : Array.from(vector);
    }

    static assertVectorApproximatelyEquals(actualVector, expectedComponents) {
        const actualComponents = this.getComponents(actualVector);
        assert.equal(actualComponents.length, MATH_LAYOUT.VECTOR3_ELEMENT_COUNT);

        actualComponents.forEach((actualComponent, index) => {
            const expectedComponent = expectedComponents[index];
            const difference        = Math.abs(actualComponent - expectedComponent);

            assert.ok(
                difference <= TestConstants.DEFAULT_EPSILON_VALUE,
                `Component ${index}: expected ${expectedComponent}, received ${actualComponent}.`
            );
        });
    }

    static createInvalidScalars() {
        return [...this.INVALID_SCALAR_TYPES, ...MathTestConstants.MATH_NON_FINITE_VALUES];
    }

    static createVectorArgumentCases() {
        const first  = this.createVector(this.FIRST_COMPONENTS);
        const second = this.createVector(this.SECOND_COMPONENTS);
        const output = this.createOutput();

        return [
            { method: 'add',          argument: 'outputVector', call: (value) => Vector3Math.add(value, first, second) },
            { method: 'add',          argument: 'firstVector',  call: (value) => Vector3Math.add(output, value, second) },
            { method: 'add',          argument: 'secondVector', call: (value) => Vector3Math.add(output, first, value) },
            { method: 'sub',          argument: 'outputVector', call: (value) => Vector3Math.sub(value, first, second) },
            { method: 'sub',          argument: 'firstVector',  call: (value) => Vector3Math.sub(output, value, second) },
            { method: 'sub',          argument: 'secondVector', call: (value) => Vector3Math.sub(output, first, value) },
            { method: 'scale',        argument: 'outputVector', call: (value) => Vector3Math.scale(value, first, this.SCALE_FACTOR) },
            { method: 'scale',        argument: 'inputVector',  call: (value) => Vector3Math.scale(output, value, this.SCALE_FACTOR) },
            { method: 'length',       argument: 'inputVector',  call: (value) => Vector3Math.length(value) },
            { method: 'distance',     argument: 'firstVector',  call: (value) => Vector3Math.distance(value, second) },
            { method: 'distance',     argument: 'secondVector', call: (value) => Vector3Math.distance(first, value) },
            { method: 'normalize',    argument: 'outputVector', call: (value) => Vector3Math.normalize(value, first) },
            { method: 'normalize',    argument: 'inputVector',  call: (value) => Vector3Math.normalize(output, value) },
            { method: 'dot',          argument: 'firstVector',  call: (value) => Vector3Math.dot(value, second) },
            { method: 'dot',          argument: 'secondVector', call: (value) => Vector3Math.dot(first, value) },
            { method: 'cross',        argument: 'outputVector', call: (value) => Vector3Math.cross(value, first, second) },
            { method: 'cross',        argument: 'firstVector',  call: (value) => Vector3Math.cross(output, value, second) },
            { method: 'cross',        argument: 'secondVector', call: (value) => Vector3Math.cross(output, first, value) },
            { method: 'lerp',         argument: 'outputVector', call: (value) => Vector3Math.lerp(value, first, second, this.LERP_FACTOR) },
            { method: 'lerp',         argument: 'startVector',  call: (value) => Vector3Math.lerp(output, value, second, this.LERP_FACTOR) },
            { method: 'lerp',         argument: 'endVector',    call: (value) => Vector3Math.lerp(output, first, value, this.LERP_FACTOR) },
            { method: 'clamp',        argument: 'outputVector', call: (value) => Vector3Math.clamp(value, first, this.CLAMP_MINIMUM, this.CLAMP_MAXIMUM) },
            { method: 'clamp',        argument: 'inputVector',  call: (value) => Vector3Math.clamp(output, value, this.CLAMP_MINIMUM, this.CLAMP_MAXIMUM) },
            { method: 'approxEquals', argument: 'firstVector',  call: (value) => Vector3Math.approxEquals(value, second) },
            { method: 'approxEquals', argument: 'secondVector', call: (value) => Vector3Math.approxEquals(first, value) }
        ];
    }
}

test("'Vector3Math.add' should add all components of 'Vector3' and 'Float32Array' vectors", () => {
    for (const format of Vector3MathTestFixtures.FORMATS) {
        // Arrange
        const expectedComponents = Vector3MathTestFixtures.EXPECTED_ADD;
        const first              = Vector3MathTestFixtures.createVector(Vector3MathTestFixtures.FIRST_COMPONENTS, format);
        const second             = Vector3MathTestFixtures.createVector(Vector3MathTestFixtures.SECOND_COMPONENTS, format);
        const output             = Vector3MathTestFixtures.createOutput(format);

        // Act
        const actualResult = Vector3Math.add(output, first, second);

        // Assert
        assert.equal(actualResult, output);
        Vector3MathTestFixtures.assertVectorApproximatelyEquals(actualResult, expectedComponents);
    }
});

test("'Vector3Math.sub' should subtract all components of 'Vector3' and 'Float32Array' vectors", () => {
    for (const format of Vector3MathTestFixtures.FORMATS) {
        // Arrange
        const expectedComponents = Vector3MathTestFixtures.EXPECTED_SUB;
        const first              = Vector3MathTestFixtures.createVector(Vector3MathTestFixtures.FIRST_COMPONENTS, format);
        const second             = Vector3MathTestFixtures.createVector(Vector3MathTestFixtures.SECOND_COMPONENTS, format);
        const output             = Vector3MathTestFixtures.createOutput(format);

        // Act
        const actualResult = Vector3Math.sub(output, first, second);

        // Assert
        assert.equal(actualResult, output);
        Vector3MathTestFixtures.assertVectorApproximatelyEquals(actualResult, expectedComponents);
    }
});

test("'Vector3Math.scale' should scale all components for both vector formats", () => {
    for (const format of Vector3MathTestFixtures.FORMATS) {
        // Arrange
        const expectedComponents = Vector3MathTestFixtures.EXPECTED_SCALE;
        const scalar             = Vector3MathTestFixtures.SCALE_FACTOR;
        const input              = Vector3MathTestFixtures.createVector(Vector3MathTestFixtures.FIRST_COMPONENTS, format);
        const output             = Vector3MathTestFixtures.createOutput(format);

        // Act
        const actualResult = Vector3Math.scale(output, input, scalar);

        // Assert
        assert.equal(actualResult, output);
        Vector3MathTestFixtures.assertVectorApproximatelyEquals(actualResult, expectedComponents);
    }
});

test("'Vector3Math.length' should calculate the Euclidean length for both vector formats", () => {
    for (const format of Vector3MathTestFixtures.FORMATS) {
        // Arrange
        const expectedLength = Vector3MathTestFixtures.EXPECTED_LENGTH;
        const input          = Vector3MathTestFixtures.createVector(Vector3MathTestFixtures.FIRST_COMPONENTS, format);

        // Act
        const actualLength = Vector3Math.length(input);

        // Assert
        assert.equal(actualLength, expectedLength);
    }
});

test("'Vector3Math.distance' should calculate the Euclidean distance for both vector formats", () => {
    for (const format of Vector3MathTestFixtures.FORMATS) {
        // Arrange
        const expectedDistance = Vector3MathTestFixtures.EXPECTED_DISTANCE;
        const first            = Vector3MathTestFixtures.createVector(Vector3MathTestFixtures.FIRST_COMPONENTS, format);
        const second           = Vector3MathTestFixtures.createVector(Vector3MathTestFixtures.SECOND_COMPONENTS, format);

        // Act
        const actualDistance = Vector3Math.distance(first, second);

        // Assert
        assert.equal(actualDistance, expectedDistance);
    }
});

test("'Vector3Math.normalize' should normalize vectors in both formats", () => {
    for (const format of Vector3MathTestFixtures.FORMATS) {
        // Arrange
        const expectedComponents = Vector3MathTestFixtures.EXPECTED_NORMALIZE;
        const input              = Vector3MathTestFixtures.createVector(Vector3MathTestFixtures.FIRST_COMPONENTS, format);
        const output             = Vector3MathTestFixtures.createOutput(format);

        // Act
        const actualResult = Vector3Math.normalize(output, input);

        // Assert
        assert.equal(actualResult, output);
        Vector3MathTestFixtures.assertVectorApproximatelyEquals(actualResult, expectedComponents);
        assert.ok(Math.abs(Vector3Math.length(actualResult) - MATH_COMMON_VALUES.UNIT) <= TestConstants.DEFAULT_EPSILON_VALUE);
    }
});

test("'Vector3Math.normalize' should return zero for zero and near-zero vectors", () => {
    for (const format of Vector3MathTestFixtures.FORMATS) {
        // Arrange
        const expectedComponents = Vector3MathTestFixtures.ZERO_COMPONENTS;
        const tinyLength         = Vector3MathTestFixtures.BELOW_NORMALIZE_MINIMUM;
        const zeroInput          = Vector3MathTestFixtures.createVector(expectedComponents, format);
        const tinyInput          = Vector3MathTestFixtures.createVector([tinyLength, MATH_COMMON_VALUES.ZERO, MATH_COMMON_VALUES.ZERO], format);
        const zeroOutput         = Vector3MathTestFixtures.createOutput(format);
        const tinyOutput         = Vector3MathTestFixtures.createOutput(format);

        // Act
        const actualZero = Vector3Math.normalize(zeroOutput, zeroInput);
        const actualTiny = Vector3Math.normalize(tinyOutput, tinyInput);

        // Assert
        Vector3MathTestFixtures.assertVectorApproximatelyEquals(actualZero, expectedComponents);
        Vector3MathTestFixtures.assertVectorApproximatelyEquals(actualTiny, expectedComponents);
    }
});

test("'Vector3Math.normalize' should use the minimum threshold inclusively", () => {
    // Arrange
    const expectedZero   = Vector3MathTestFixtures.ZERO_COMPONENTS;
    const expectedUnit   = Vector3MathTestFixtures.UNIT_X_COMPONENTS;
    const belowThreshold = Vector3MathTestFixtures.BELOW_NORMALIZE_MINIMUM;
    const aboveThreshold = Vector3MathTestFixtures.ABOVE_NORMALIZE_MINIMUM;
    const threshold      = MathTestConstants.VECTOR3_MATH_EXPECTED_TOLERANCES.MIN_NORMALIZE_LENGTH;
    const thresholdInput = new Vector3(threshold, MATH_COMMON_VALUES.ZERO, MATH_COMMON_VALUES.ZERO);
    const aboveInput     = new Vector3(aboveThreshold, MATH_COMMON_VALUES.ZERO, MATH_COMMON_VALUES.ZERO);
    const belowInput     = new Vector3(belowThreshold, MATH_COMMON_VALUES.ZERO, MATH_COMMON_VALUES.ZERO);

    // Act
    const actualAtThreshold    = Vector3Math.normalize(new Vector3(), thresholdInput);
    const actualBelowThreshold = Vector3Math.normalize(new Vector3(), belowInput);
    const actualAboveThreshold = Vector3Math.normalize(new Vector3(), aboveInput);

    // Assert
    Vector3MathTestFixtures.assertVectorApproximatelyEquals(actualAtThreshold, expectedZero);
    Vector3MathTestFixtures.assertVectorApproximatelyEquals(actualBelowThreshold, expectedZero);
    Vector3MathTestFixtures.assertVectorApproximatelyEquals(actualAboveThreshold, expectedUnit);
});

test("'Vector3Math.dot' should compute dot product for both vector formats", () => {
    for (const format of Vector3MathTestFixtures.FORMATS) {
        // Arrange
        const expectedDot = Vector3MathTestFixtures.EXPECTED_DOT;
        const first       = Vector3MathTestFixtures.createVector(Vector3MathTestFixtures.FIRST_COMPONENTS, format);
        const second      = Vector3MathTestFixtures.createVector(Vector3MathTestFixtures.SECOND_COMPONENTS, format);

        // Act
        const actualDot = Vector3Math.dot(first, second);

        // Assert
        assert.equal(actualDot, expectedDot);
    }
});

test("'Vector3Math.cross' should compute the cross product for both vector formats", () => {
    for (const format of Vector3MathTestFixtures.FORMATS) {
        // Arrange
        const expectedComponents = Vector3MathTestFixtures.EXPECTED_CROSS;
        const first              = Vector3MathTestFixtures.createVector(Vector3MathTestFixtures.FIRST_COMPONENTS, format);
        const second             = Vector3MathTestFixtures.createVector(Vector3MathTestFixtures.SECOND_COMPONENTS, format);
        const output             = Vector3MathTestFixtures.createOutput(format);

        // Act
        const actualResult = Vector3Math.cross(output, first, second);

        // Assert
        assert.equal(actualResult, output);
        Vector3MathTestFixtures.assertVectorApproximatelyEquals(actualResult, expectedComponents);
    }
});

test("'Vector3Math.lerp' should interpolate all components for both vector formats", () => {
    for (const format of Vector3MathTestFixtures.FORMATS) {
        // Arrange
        const expectedComponents = Vector3MathTestFixtures.EXPECTED_LERP;
        const factor             = Vector3MathTestFixtures.LERP_FACTOR;
        const first              = Vector3MathTestFixtures.createVector(Vector3MathTestFixtures.FIRST_COMPONENTS, format);
        const second             = Vector3MathTestFixtures.createVector(Vector3MathTestFixtures.SECOND_COMPONENTS, format);
        const output             = Vector3MathTestFixtures.createOutput(format);

        // Act
        const actualResult = Vector3Math.lerp(output, first, second, factor);

        // Assert
        assert.equal(actualResult, output);
        Vector3MathTestFixtures.assertVectorApproximatelyEquals(actualResult, expectedComponents);
    }
});

test("'Vector3Math.lerp' should preserve extrapolation outside the nominal interval", () => {
    // Arrange
    const expectedComponents = Vector3MathTestFixtures.EXPECTED_EXTRAPOLATION;
    const factor             = Vector3MathTestFixtures.EXTRAPOLATION_FACTOR;
    const first              = Vector3MathTestFixtures.createVector(Vector3MathTestFixtures.FIRST_COMPONENTS);
    const second             = Vector3MathTestFixtures.createVector(Vector3MathTestFixtures.SECOND_COMPONENTS);
    const output             = new Vector3();

    // Act
    const actualResult = Vector3Math.lerp(output, first, second, factor);

    // Assert
    Vector3MathTestFixtures.assertVectorApproximatelyEquals(actualResult, expectedComponents);
});

test("'Vector3Math.clamp' should clamp individual components for both vector formats", () => {
    for (const format of Vector3MathTestFixtures.FORMATS) {
        // Arrange
        const expectedComponents = Vector3MathTestFixtures.EXPECTED_CLAMP;
        const minimum            = Vector3MathTestFixtures.CLAMP_MINIMUM;
        const maximum            = Vector3MathTestFixtures.CLAMP_MAXIMUM;
        const input              = Vector3MathTestFixtures.createVector(Vector3MathTestFixtures.FIRST_COMPONENTS, format);
        const output             = Vector3MathTestFixtures.createOutput(format);

        // Act
        const actualResult = Vector3Math.clamp(output, input, minimum, maximum);

        // Assert
        assert.equal(actualResult, output);
        Vector3MathTestFixtures.assertVectorApproximatelyEquals(actualResult, expectedComponents);
    }
});

test("'Vector3Math.clamp' should preserve reversed-bound behavior", () => {
    // Arrange
    const expectedComponents = Vector3MathTestFixtures.EXPECTED_REVERSED_CLAMP;
    const minimum            = Vector3MathTestFixtures.REVERSED_CLAMP_MINIMUM;
    const maximum            = Vector3MathTestFixtures.REVERSED_CLAMP_MAXIMUM;
    const input              = Vector3MathTestFixtures.createVector(Vector3MathTestFixtures.FIRST_COMPONENTS);
    const output             = new Vector3();

    // Act
    const actualResult = Vector3Math.clamp(output, input, minimum, maximum);

    // Assert
    Vector3MathTestFixtures.assertVectorApproximatelyEquals(actualResult, expectedComponents);
});

test("'Vector3Math.approxEquals' should accept equal vectors in both formats", () => {
    for (const format of Vector3MathTestFixtures.FORMATS) {
        // Arrange
        const first  = Vector3MathTestFixtures.createVector(Vector3MathTestFixtures.FIRST_COMPONENTS, format);
        const second = Vector3MathTestFixtures.createVector(Vector3MathTestFixtures.FIRST_COMPONENTS, format);

        // Act
        const actualResult = Vector3Math.approxEquals(first, second);

        // Assert
        assert.equal(actualResult, true);
    }
});

test("'Vector3Math.approxEquals' should use default epsilon with explicit undefined", () => {
    // Arrange
    const missingEpsilon = Vector3MathTestFixtures.UNDEFINED_VALUE;
    const near           = new Vector3(Vector3MathTestFixtures.BELOW_DEFAULT_EPSILON, MATH_COMMON_VALUES.ZERO, MATH_COMMON_VALUES.ZERO);
    const far            = new Vector3(Vector3MathTestFixtures.ABOVE_DEFAULT_EPSILON, MATH_COMMON_VALUES.ZERO, MATH_COMMON_VALUES.ZERO);
    const first          = new Vector3();

    // Act
    const actualNear = Vector3Math.approxEquals(first, near, missingEpsilon);
    const actualFar  = Vector3Math.approxEquals(first, far, missingEpsilon);

    // Assert
    assert.equal(actualNear, true);
    assert.equal(actualFar, false);
});

test("'Vector3Math.approxEquals' should check every component and accept inclusive tolerance", () => {
    // Arrange
    const epsilon  = Vector3MathTestFixtures.COMPARISON_EPSILON;
    const beyondX  = Vector3MathTestFixtures.createVector(Vector3MathTestFixtures.BEYOND_X_COMPONENTS);
    const beyondY  = Vector3MathTestFixtures.createVector(Vector3MathTestFixtures.BEYOND_Y_COMPONENTS);
    const beyondZ  = Vector3MathTestFixtures.createVector(Vector3MathTestFixtures.BEYOND_Z_COMPONENTS);
    const boundary = new Vector3(...Vector3MathTestFixtures.EQUAL_COMPONENTS);
    const zero     = new Vector3();

    // Act
    const actualBoundary = Vector3Math.approxEquals(zero, boundary, epsilon);
    const actualX        = Vector3Math.approxEquals(zero, beyondX, epsilon);
    const actualY        = Vector3Math.approxEquals(zero, beyondY, epsilon);
    const actualZ        = Vector3Math.approxEquals(zero, beyondZ, epsilon);

    // Assert
    assert.equal(actualBoundary, true);
    assert.equal(actualX, false);
    assert.equal(actualY, false);
    assert.equal(actualZ, false);
});

test("'Vector3Math.approxEquals' should retain negative-epsilon behavior", () => {
    // Arrange
    const epsilon = Vector3MathTestFixtures.NEGATIVE_EPSILON;
    const first   = new Vector3();
    const second  = new Vector3();

    // Act
    const actualResult = Vector3Math.approxEquals(first, second, epsilon);

    // Assert
    assert.equal(actualResult, false);
});

test("'Vector3Math' binary operations should allow the output to alias either input", () => {
    // Arrange
    const operations = [
        { method: 'add'  , expected: Vector3MathTestFixtures.EXPECTED_ADD   },
        { method: 'sub'  , expected: Vector3MathTestFixtures.EXPECTED_SUB   },
        { method: 'cross', expected: Vector3MathTestFixtures.EXPECTED_CROSS }
    ];

    // Act & Assert
    for (const format of Vector3MathTestFixtures.FORMATS) {
        for (const { method, expected } of operations) {
            const first       = Vector3MathTestFixtures.createVector(Vector3MathTestFixtures.FIRST_COMPONENTS, format);
            const second      = Vector3MathTestFixtures.createVector(Vector3MathTestFixtures.SECOND_COMPONENTS, format);
            const resultFirst = Vector3Math[method](first, first, second);
            assert.equal(resultFirst, first);
            Vector3MathTestFixtures.assertVectorApproximatelyEquals(resultFirst, expected);

            const anotherFirst  = Vector3MathTestFixtures.createVector(Vector3MathTestFixtures.FIRST_COMPONENTS, format);
            const anotherSecond = Vector3MathTestFixtures.createVector(Vector3MathTestFixtures.SECOND_COMPONENTS, format);
            const resultSecond  = Vector3Math[method](anotherSecond, anotherFirst, anotherSecond);
            assert.equal(resultSecond, anotherSecond);
            Vector3MathTestFixtures.assertVectorApproximatelyEquals(resultSecond, expected);
        }
    }
});

test("'Vector3Math' unary operations should support an in-place output", () => {
    for (const format of Vector3MathTestFixtures.FORMATS) {
        // Arrange
        const inputScale     = Vector3MathTestFixtures.createVector(Vector3MathTestFixtures.FIRST_COMPONENTS, format);
        const inputNormalize = Vector3MathTestFixtures.createVector(Vector3MathTestFixtures.FIRST_COMPONENTS, format);
        const inputClamp     = Vector3MathTestFixtures.createVector(Vector3MathTestFixtures.FIRST_COMPONENTS, format);

        // Act
        const scaled     = Vector3Math.scale(inputScale, inputScale, Vector3MathTestFixtures.SCALE_FACTOR);
        const normalized = Vector3Math.normalize(inputNormalize, inputNormalize);
        const clamped    = Vector3Math.clamp(inputClamp, inputClamp, Vector3MathTestFixtures.CLAMP_MINIMUM, Vector3MathTestFixtures.CLAMP_MAXIMUM);

        // Assert
        assert.equal(scaled, inputScale);
        assert.equal(normalized, inputNormalize);
        assert.equal(clamped, inputClamp);
        Vector3MathTestFixtures.assertVectorApproximatelyEquals(scaled, Vector3MathTestFixtures.EXPECTED_SCALE);
        Vector3MathTestFixtures.assertVectorApproximatelyEquals(normalized, Vector3MathTestFixtures.EXPECTED_NORMALIZE);
        Vector3MathTestFixtures.assertVectorApproximatelyEquals(clamped, Vector3MathTestFixtures.EXPECTED_CLAMP);
    }
});

test("'Vector3Math.lerp' should support either input as the output", () => {
    for (const format of Vector3MathTestFixtures.FORMATS) {
        // Arrange
        const expectedComponents = Vector3MathTestFixtures.EXPECTED_LERP;
        const factor             = Vector3MathTestFixtures.LERP_FACTOR;
        const start              = Vector3MathTestFixtures.createVector(Vector3MathTestFixtures.FIRST_COMPONENTS, format);
        const end                = Vector3MathTestFixtures.createVector(Vector3MathTestFixtures.SECOND_COMPONENTS, format);
        const anotherStart       = Vector3MathTestFixtures.createVector(Vector3MathTestFixtures.FIRST_COMPONENTS, format);
        const anotherEnd         = Vector3MathTestFixtures.createVector(Vector3MathTestFixtures.SECOND_COMPONENTS, format);

        // Act
        const actualStart = Vector3Math.lerp(start, start, end, factor);
        const actualEnd   = Vector3Math.lerp(anotherEnd, anotherStart, anotherEnd, factor);

        // Assert
        assert.equal(actualStart, start);
        assert.equal(actualEnd, anotherEnd);
        Vector3MathTestFixtures.assertVectorApproximatelyEquals(actualStart, expectedComponents);
        Vector3MathTestFixtures.assertVectorApproximatelyEquals(actualEnd, expectedComponents);
    }
});

test("'Vector3Math' mutations should notify 'Vector3' observers once per operation", () => {
    // Arrange
    let   actualNotifications   = MATH_COMMON_VALUES.ZERO;
    const expectedNotifications = Vector3MathTestFixtures.EXPECTED_NOTIFICATIONS;
    const first                 = Vector3MathTestFixtures.createVector(Vector3MathTestFixtures.FIRST_COMPONENTS);
    const second                = Vector3MathTestFixtures.createVector(Vector3MathTestFixtures.SECOND_COMPONENTS);
    const output                = new Vector3();
    output.setOnChange(() => actualNotifications += MATH_COMMON_VALUES.UNIT);

    // Act
    Vector3Math.add(output, first, second);
    Vector3Math.sub(output, first, second);
    Vector3Math.cross(output, first, second);

    // Assert
    assert.equal(actualNotifications, expectedNotifications);
});

test("'Vector3Math' operations should accept mixed 'Vector3' and 'Float32Array' arguments", () => {
    // Arrange
    const first  = Vector3MathTestFixtures.createVector(Vector3MathTestFixtures.FIRST_COMPONENTS);
    const second = Vector3MathTestFixtures.createVector(Vector3MathTestFixtures.SECOND_COMPONENTS, Vector3MathTestFixtures.FLOAT32_FORMAT);
    const output = Vector3MathTestFixtures.createOutput(Vector3MathTestFixtures.FLOAT32_FORMAT);

    // Act
    const actualAdd   = Vector3Math.add(output, first, second);
    const actualDot   = Vector3Math.dot(first, second);
    const actualCross = Vector3Math.cross(new Vector3(), second, first);

    // Assert
    assert.equal(actualAdd, output);
    Vector3MathTestFixtures.assertVectorApproximatelyEquals(actualAdd, Vector3MathTestFixtures.EXPECTED_ADD);
    assert.equal(actualDot, Vector3MathTestFixtures.EXPECTED_DOT);
    Vector3MathTestFixtures.assertVectorApproximatelyEquals(actualCross, Vector3MathTestFixtures.EXPECTED_CROSS.map(value => -value));
});

test("'Vector3Math' should reject unsupported vector values in all argument positions", () => {
    // Arrange
    const invalidValues = Vector3MathTestFixtures.INVALID_VECTOR_VALUES;
    const scenarios     = Vector3MathTestFixtures.createVectorArgumentCases();

    // Act & Assert
    scenarios.forEach(({ method, argument, call }) => {
        invalidValues.forEach((invalidVector) => {
            const expectedMessage = `\`Vector3Math\` expects \`${argument}\` as Vector3 or Float32Array.`;

            assert.throws(() => call(invalidVector), {
                name    : 'TypeError',
                message : expectedMessage
            }, `${method}: ${argument}`);
        });
    });
});

test("'Vector3Math' should reject incorrect 'Float32Array' lengths in every argument position", () => {
    // Arrange
    const expectedMessage = '`Vector3Math` expects Float32Array(3) vectors.';
    const scenarios       = Vector3MathTestFixtures.createVectorArgumentCases();
    const invalidLengths  = Vector3MathTestFixtures.INVALID_VECTOR_LENGTHS;

    // Act & Assert
    scenarios.forEach(({ method, argument, call }) => {
        invalidLengths.forEach((length) => {
            const invalidVector = new Float32Array(length);

            assert.throws(() => call(invalidVector), {
                name    : 'RangeError',
                message : expectedMessage
            }, `${method}: ${argument}`);
        });
    });
});

test("'Vector3Math.scale' should reject non-finite and non-numeric scalars", () => {
    // Arrange
    const expectedMessage = '`Vector3Math.scale` expects `scalar` as a finite number.';
    const input           = Vector3MathTestFixtures.createVector(Vector3MathTestFixtures.FIRST_COMPONENTS);
    const invalidScalars  = Vector3MathTestFixtures.createInvalidScalars();
    const output          = new Vector3();

    // Act & Assert
    invalidScalars.forEach((scalar) => {
        assert.throws(() => Vector3Math.scale(output, input, scalar), {
            name    : 'TypeError',
            message : expectedMessage
        });
    });
});

test("'Vector3Math.lerp' should reject non-finite and non-numeric interpolation factors", () => {
    // Arrange
    const expectedMessage = '`Vector3Math.lerp` expects `interpolationFactor` as a finite number.';
    const first           = Vector3MathTestFixtures.createVector(Vector3MathTestFixtures.FIRST_COMPONENTS);
    const second          = Vector3MathTestFixtures.createVector(Vector3MathTestFixtures.SECOND_COMPONENTS);
    const invalidScalars  = Vector3MathTestFixtures.createInvalidScalars();
    const output          = new Vector3();

    // Act & Assert
    invalidScalars.forEach((factor) => {
        assert.throws(() => Vector3Math.lerp(output, first, second, factor), {
            name    : 'TypeError',
            message : expectedMessage
        });
    });
});

test("'Vector3Math.clamp' should reject invalid minimum and maximum bounds independently", () => {
    // Arrange
    const expectedMessage = '`Vector3Math.clamp` expects `min` and `max` as finite numbers.';
    const input           = Vector3MathTestFixtures.createVector(Vector3MathTestFixtures.FIRST_COMPONENTS);
    const invalidScalars  = Vector3MathTestFixtures.createInvalidScalars();
    const output          = new Vector3();

    // Act & Assert
    invalidScalars.forEach((bound) => {
        assert.throws(() => Vector3Math.clamp(output, input, bound, Vector3MathTestFixtures.CLAMP_MAXIMUM), {
            name    : 'TypeError',
            message : expectedMessage
        });

        assert.throws(() => Vector3Math.clamp(output, input, Vector3MathTestFixtures.CLAMP_MINIMUM, bound), {
            name    : 'TypeError',
            message : expectedMessage
        });
    });
});

test("'Vector3Math.approxEquals' should reject non-finite and non-numeric tolerances", () => {
    // Arrange
    const expectedMessage = '`Vector3Math.approxEquals` expects `epsilon` as a finite number.';
    const invalidScalars  = Vector3MathTestFixtures.createInvalidScalars().filter(value => value !== undefined);
    const first           = Vector3MathTestFixtures.createVector(Vector3MathTestFixtures.FIRST_COMPONENTS);
    const second          = Vector3MathTestFixtures.createVector(Vector3MathTestFixtures.SECOND_COMPONENTS);

    // Act & Assert
    invalidScalars.forEach((epsilon) => {
        assert.throws(() => Vector3Math.approxEquals(first, second, epsilon), {
            name    : 'TypeError',
            message : expectedMessage
        });
    });
});

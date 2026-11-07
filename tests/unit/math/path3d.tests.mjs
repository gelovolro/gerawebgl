import test                                from 'node:test';
import assert                              from 'node:assert/strict';
import { Path3D }                          from '../../../core/math/path3d.js';
import { Vector3 }                         from '../../../core/math/vector3.js';
import { MATH_COMMON_VALUES, MATH_LAYOUT } from '../../../core/constants/math.js';
import { TestConstants }                   from '../../helpers/test-constants.js';
import * as MathTestConstants              from '../../test-constants/math.js';

class Path3DTestFixtures {
    static UNDEFINED_VALUE              = undefined;
    static MIDDLE_PARAMETER             = 0.5;
    static THREE_QUARTER_PARAMETER      = 0.75;
    static OPEN_SEGMENT_KNOT            = 3 / 7;
    static BELOW_MINIMUM_PARAMETER      = -0.25;
    static ABOVE_MAXIMUM_PARAMETER      = 1.25;
    static BELOW_TANGENT_THRESHOLD      = 1e-10;
    static ABOVE_TANGENT_THRESHOLD      = 1e-6;
    static EXPECTED_OPEN_LENGTH         = 7;
    static EXPECTED_CLOSED_LENGTH       = 12;
    static EXPECTED_SINGLE_LENGTH       = 13;
    static EXPECTED_LOOP_STATE          = true;
    static EXPECTED_OPEN_MIDDLE_POINT   = Object.freeze([3, 0.5, 0]);
    static EXPECTED_SINGLE_MIDDLE_POINT = Object.freeze([2.5, 4, 9]);
    static EXPECTED_CLOSED_MIDDLE_POINT = Object.freeze([3, 3, 0]);
    static EXPECTED_CLOSED_WRAP_POINT   = Object.freeze([1.8, 2.4, 0]);
    static EXPECTED_AFTER_ZERO_SEGMENT  = Object.freeze([1.5, 0, 0]);
    static EXPECTED_FLOAT32_ENDPOINT    = Object.freeze([1.4, 0, 0]);
    static EXPECTED_FIRST_TANGENT       = Object.freeze([1, 0, 0]);
    static EXPECTED_SECOND_TANGENT      = Object.freeze([0, 1, 0]);
    static EXPECTED_CLOSING_TANGENT     = Object.freeze([-3 / 5, -4 / 5, 0]);
    static EXPECTED_SINGLE_TANGENT      = Object.freeze([3 / 13, 4 / 13, 12 / 13]);
    static EXPECTED_ZERO_VECTOR         = Object.freeze([0, 0, 0]);
    static INVALID_POINT_CONTAINERS     = Object.freeze([undefined, null, {}, 'points', new Vector3()]);
    static INVALID_OPTIONS              = Object.freeze([null, false, 1, 'loop', []]);
    static INVALID_LOOP_FLAGS           = Object.freeze([null, 0, 1, 'true', [], {}]);
    static INVALID_PARAMETER_TYPES      = Object.freeze([null, undefined, true, '0.5', {}, []]);

    static OPEN_POINT_COMPONENTS = Object.freeze([
        Object.freeze([0, 0, 0]),
        Object.freeze([3, 0, 0]),
        Object.freeze([3, 4, 0])
    ]);

    static CLOSED_POINT_COMPONENTS = Path3DTestFixtures.OPEN_POINT_COMPONENTS;

    static SINGLE_SEGMENT_COMPONENTS = Object.freeze([
        Object.freeze([1, 2, 3]),
        Object.freeze([4, 6, 15])
    ]);

    static createPoints(components) {
        return components.map(([x, y, z]) => new Vector3(x, y, z));
    }

    static createPath(points = this.createPoints(this.OPEN_POINT_COMPONENTS), options = {}) {
        return new Path3D(points, options);
    }

    static createClosedPath() {
        return this.createPath(this.createPoints(this.CLOSED_POINT_COMPONENTS), { loop: true });
    }

    static createSingleSegmentPath() {
        return this.createPath(this.createPoints(this.SINGLE_SEGMENT_COMPONENTS));
    }

    static createInvalidParameters() {
        return [
            ...this.INVALID_PARAMETER_TYPES,
            ...MathTestConstants.MATH_NON_FINITE_VALUES
        ];
    }

    static createInvalidOutputs() {
        return [
            null,
            {},
            [],
            'vector',
            new Float32Array(MATH_LAYOUT.VECTOR3_ELEMENT_COUNT)
        ];
    }

    static assertVectorApproximatelyEquals(actualVector, expectedComponents) {
        assert.ok(actualVector instanceof Vector3);
        assert.equal(expectedComponents.length, MATH_LAYOUT.VECTOR3_ELEMENT_COUNT);

        [actualVector.x, actualVector.y, actualVector.z].forEach((actualComponent, index) => {
            const expectedComponent = expectedComponents[index];
            const actualDifference  = Math.abs(actualComponent - expectedComponent);

            assert.ok(
                actualDifference <= TestConstants.DEFAULT_EPSILON_VALUE,
                `Vector component at index ${index} differs: ${actualComponent}, expected ${expectedComponent}.`
            );
        });
    }
}

test("'Path3D' constructor should initialize an open path with two control points", () => {
    // Arrange
    const expectedLoopState = MathTestConstants.PATH3D_EXPECTED_DEFAULTS.LOOP;
    const expectedLength    = Path3DTestFixtures.EXPECTED_SINGLE_LENGTH;
    const controlPoints     = Path3DTestFixtures.createPoints(Path3DTestFixtures.SINGLE_SEGMENT_COMPONENTS);

    // Act
    const actualPath = Path3DTestFixtures.createPath(controlPoints);

    // Assert
    assert.ok(actualPath instanceof Path3D);
    assert.equal(actualPath.loop, expectedLoopState);
    assert.equal(actualPath.points.length, controlPoints.length);
    assert.equal(actualPath.totalLength, expectedLength);
});

test("'Path3D' constructor should include the closing segment for a looped path", () => {
    // Arrange
    const expectedLoopState = Path3DTestFixtures.EXPECTED_LOOP_STATE;
    const expectedLength    = Path3DTestFixtures.EXPECTED_CLOSED_LENGTH;

    // Act
    const actualPath = Path3DTestFixtures.createClosedPath();

    // Assert
    assert.equal(actualPath.loop, expectedLoopState);
    assert.equal(actualPath.totalLength, expectedLength);
});

test("'Path3D' constructor should copy the point array without cloning its vectors", () => {
    // Arrange
    const firstPointIndex    = MATH_COMMON_VALUES.ZERO;
    const controlPoints      = Path3DTestFixtures.createPoints(Path3DTestFixtures.OPEN_POINT_COMPONENTS);
    const expectedPointCount = controlPoints.length;
    const originalFirstPoint = controlPoints[firstPointIndex];

    // Act
    const actualPath = Path3DTestFixtures.createPath(controlPoints);
    controlPoints.pop();

    // Assert
    assert.notEqual(actualPath.points, controlPoints);
    assert.equal(actualPath.points.length, expectedPointCount);
    assert.equal(actualPath.points[firstPointIndex], originalFirstPoint);
});

test("'Path3D' constructor should accept explicit undefined options and loop defaults", () => {
    // Arrange
    const expectedLoopState = MathTestConstants.PATH3D_EXPECTED_DEFAULTS.LOOP;
    const missingOptions    = Path3DTestFixtures.UNDEFINED_VALUE;
    const missingLoop       = Path3DTestFixtures.UNDEFINED_VALUE;
    const controlPoints     = Path3DTestFixtures.createPoints(Path3DTestFixtures.OPEN_POINT_COMPONENTS);

    // Act
    const actualDefaultPath = Path3DTestFixtures.createPath(controlPoints, missingOptions);
    const actualLoopPath    = Path3DTestFixtures.createPath(controlPoints, { loop: missingLoop });

    // Assert
    assert.equal(actualDefaultPath.loop, expectedLoopState);
    assert.equal(actualLoopPath.loop, expectedLoopState);
});

test("'Path3D' constructor should reject non-array point containers", () => {
    // Arrange
    const expectedMessage   = '`Path3D` expects `points` as an array of `Vector3`.';
    const invalidContainers = Path3DTestFixtures.INVALID_POINT_CONTAINERS;

    // Act & Assert
    invalidContainers.forEach((points) => {
        assert.throws(() => new Path3D(points), {
            name    : 'TypeError',
            message : expectedMessage
        });
    });
});

test("'Path3D' constructor should reject fewer than two control points", () => {
    // Arrange
    const expectedMessage    = '`Path3D` expects at least two points.';
    const insufficientPoints = [[], [new Vector3()]];

    // Act & Assert
    insufficientPoints.forEach((points) => {
        assert.throws(() => new Path3D(points), {
            name    : 'RangeError',
            message : expectedMessage
        });
    });
});

test("'Path3D' constructor should reject non-'Vector3' control points", () => {
    // Arrange
    const expectedMessage    = '`Path3D` expects all points to be `Vector3` instances.';
    const invalidPoints      = [undefined, null, 0, {}, [0, 0, 0]];
    const invalidControlSets = invalidPoints.map((invalidPoint) => [new Vector3(), invalidPoint]);

    // Act & Assert
    invalidControlSets.forEach((controlPoints) => {
        assert.throws(() => new Path3D(controlPoints), {
            name    : 'TypeError',
            message : expectedMessage
        });
    });
});

test("'Path3D' constructor should reject invalid option containers", () => {
    // Arrange
    const expectedMessage = '`Path3D` expects options as a plain object.';
    const invalidOptions  = Path3DTestFixtures.INVALID_OPTIONS;
    const controlPoints   = Path3DTestFixtures.createPoints(Path3DTestFixtures.OPEN_POINT_COMPONENTS);

    // Act & Assert
    invalidOptions.forEach((options) => {
        assert.throws(() => Path3DTestFixtures.createPath(controlPoints, options), {
            name    : 'TypeError',
            message : expectedMessage
        });
    });
});

test("'Path3D' constructor should reject non-boolean loop flags", () => {
    // Arrange
    const expectedMessage   = '`Path3D` option `loop` must be a boolean.';
    const invalidLoopValues = Path3DTestFixtures.INVALID_LOOP_FLAGS;
    const controlPoints     = Path3DTestFixtures.createPoints(Path3DTestFixtures.OPEN_POINT_COMPONENTS);

    // Act & Assert
    invalidLoopValues.forEach((loop) => {
        assert.throws(() => Path3DTestFixtures.createPath(controlPoints, { loop }), {
            name    : 'TypeError',
            message : expectedMessage
        });
    });
});

test("'Path3D.getPointAt' should interpolate all coordinates of a single segment", () => {
    // Arrange
    const expectedComponents = Path3DTestFixtures.EXPECTED_SINGLE_MIDDLE_POINT;
    const parameter          = Path3DTestFixtures.MIDDLE_PARAMETER;
    const actualPath         = Path3DTestFixtures.createSingleSegmentPath();
    const output             = new Vector3();

    // Act
    const actualPoint = actualPath.getPointAt(parameter, output);

    // Assert
    assert.equal(actualPoint, output);
    Path3DTestFixtures.assertVectorApproximatelyEquals(actualPoint, expectedComponents);
});

test("'Path3D.getPointAt' should interpolate by distance across unequal segment lengths", () => {
    // Arrange
    const expectedLength     = Path3DTestFixtures.EXPECTED_OPEN_LENGTH;
    const expectedComponents = Path3DTestFixtures.EXPECTED_OPEN_MIDDLE_POINT;
    const parameter          = Path3DTestFixtures.MIDDLE_PARAMETER;
    const actualPath         = Path3DTestFixtures.createPath();

    // Act
    const actualPoint = actualPath.getPointAt(parameter);

    // Assert
    assert.equal(actualPath.totalLength, expectedLength);
    Path3DTestFixtures.assertVectorApproximatelyEquals(actualPoint, expectedComponents);
});

test("'Path3D.getPointAt' should preserve both endpoints and exact segment knots", () => {
    // Arrange
    const expectedPoints   = Path3DTestFixtures.OPEN_POINT_COMPONENTS;
    const segmentKnot      = Path3DTestFixtures.OPEN_SEGMENT_KNOT;
    const firstPointIndex  = MATH_COMMON_VALUES.ZERO;
    const secondPointIndex = MATH_COMMON_VALUES.UNIT;
    const lastPointIndex   = expectedPoints.length - MATH_COMMON_VALUES.UNIT;
    const actualPath       = Path3DTestFixtures.createPath();

    // Act
    const firstPoint = actualPath.getPointAt(MATH_COMMON_VALUES.ZERO);
    const knotPoint  = actualPath.getPointAt(segmentKnot);
    const lastPoint  = actualPath.getPointAt(MATH_COMMON_VALUES.UNIT);

    // Assert
    Path3DTestFixtures.assertVectorApproximatelyEquals(firstPoint, expectedPoints[firstPointIndex]);
    Path3DTestFixtures.assertVectorApproximatelyEquals(knotPoint, expectedPoints[secondPointIndex]);
    Path3DTestFixtures.assertVectorApproximatelyEquals(lastPoint, expectedPoints[lastPointIndex]);
});

test("'Path3D.getPointAt' should clamp parameters outside an open path", () => {
    // Arrange
    const expectedPoints  = Path3DTestFixtures.OPEN_POINT_COMPONENTS;
    const firstPointIndex = MATH_COMMON_VALUES.ZERO;
    const lastPointIndex  = expectedPoints.length - MATH_COMMON_VALUES.UNIT;
    const belowMinimum    = Path3DTestFixtures.BELOW_MINIMUM_PARAMETER;
    const aboveMaximum    = Path3DTestFixtures.ABOVE_MAXIMUM_PARAMETER;
    const actualPath      = Path3DTestFixtures.createPath();

    // Act
    const firstPoint = actualPath.getPointAt(belowMinimum);
    const lastPoint  = actualPath.getPointAt(aboveMaximum);

    // Assert
    Path3DTestFixtures.assertVectorApproximatelyEquals(firstPoint, expectedPoints[firstPointIndex]);
    Path3DTestFixtures.assertVectorApproximatelyEquals(lastPoint, expectedPoints[lastPointIndex]);
});

test("'Path3D.getPointAt' should wrap negative and oversized parameters on a looped path", () => {
    // Arrange
    const expectedWrapPoint  = Path3DTestFixtures.EXPECTED_CLOSED_WRAP_POINT;
    const expectedStart      = Path3DTestFixtures.CLOSED_POINT_COMPONENTS[MATH_COMMON_VALUES.ZERO];
    const expectedKnot       = Path3DTestFixtures.CLOSED_POINT_COMPONENTS[MATH_COMMON_VALUES.UNIT];
    const negativeParameter  = Path3DTestFixtures.BELOW_MINIMUM_PARAMETER;
    const oversizedParameter = Path3DTestFixtures.ABOVE_MAXIMUM_PARAMETER;
    const actualPath         = Path3DTestFixtures.createClosedPath();

    // Act
    const negativePoint  = actualPath.getPointAt(negativeParameter);
    const oversizedPoint = actualPath.getPointAt(oversizedParameter);
    const closingPoint   = actualPath.getPointAt(MATH_COMMON_VALUES.UNIT);

    // Assert
    Path3DTestFixtures.assertVectorApproximatelyEquals(negativePoint, expectedWrapPoint);
    Path3DTestFixtures.assertVectorApproximatelyEquals(oversizedPoint, expectedKnot);
    Path3DTestFixtures.assertVectorApproximatelyEquals(closingPoint, expectedStart);
});

test("'Path3D.getPointAt' should interpolate the middle of a looped path", () => {
    // Arrange
    const expectedComponents = Path3DTestFixtures.EXPECTED_CLOSED_MIDDLE_POINT;
    const parameter          = Path3DTestFixtures.MIDDLE_PARAMETER;
    const actualPath         = Path3DTestFixtures.createClosedPath();

    // Act
    const actualPoint = actualPath.getPointAt(parameter);

    // Assert
    Path3DTestFixtures.assertVectorApproximatelyEquals(actualPoint, expectedComponents);
});

test("'Path3D.getPointAt' should reuse the supplied output and allocate distinct defaults", () => {
    // Arrange
    const parameter  = Path3DTestFixtures.MIDDLE_PARAMETER;
    const actualPath = Path3DTestFixtures.createSingleSegmentPath();
    const output     = new Vector3();

    // Act
    const firstPoint  = actualPath.getPointAt(parameter, output);
    const secondPoint = actualPath.getPointAt(parameter);
    const thirdPoint  = actualPath.getPointAt(parameter);

    // Assert
    assert.equal(firstPoint, output);
    assert.notEqual(firstPoint, secondPoint);
    assert.notEqual(secondPoint, thirdPoint);
    Path3DTestFixtures.assertVectorApproximatelyEquals(secondPoint, Path3DTestFixtures.EXPECTED_SINGLE_MIDDLE_POINT);
});

test("'Path3D.getPointAt' should return the first point for a zero-length path", () => {
    // Arrange
    const expectedZero  = MATH_COMMON_VALUES.ZERO;
    const repeatedPoint = new Vector3(2, 3, 4);
    const controlPoints = [repeatedPoint, new Vector3(2, 3, 4)];
    const actualPath    = Path3DTestFixtures.createPath(controlPoints);
    const output        = new Vector3();

    // Act
    const actualPoint = actualPath.getPointAt(Path3DTestFixtures.MIDDLE_PARAMETER, output);

    // Assert
    assert.equal(actualPoint, output);
    assert.equal(actualPath.totalLength, expectedZero);
    Path3DTestFixtures.assertVectorApproximatelyEquals(actualPoint, [repeatedPoint.x, repeatedPoint.y, repeatedPoint.z]);
});

test("'Path3D.getPointAt' should handle a zero-length segment before a nonzero segment", () => {
    // Arrange
    const expectedMidpoint = Path3DTestFixtures.EXPECTED_AFTER_ZERO_SEGMENT;
    const expectedStart    = Path3DTestFixtures.EXPECTED_ZERO_VECTOR;
    const controlPoints    = Path3DTestFixtures.createPoints([[0, 0, 0], [0, 0, 0], [3, 0, 0]]);
    const actualPath       = Path3DTestFixtures.createPath(controlPoints);

    // Act
    const startPoint  = actualPath.getPointAt(MATH_COMMON_VALUES.ZERO);
    const middlePoint = actualPath.getPointAt(Path3DTestFixtures.MIDDLE_PARAMETER);

    // Assert
    Path3DTestFixtures.assertVectorApproximatelyEquals(startPoint, expectedStart);
    Path3DTestFixtures.assertVectorApproximatelyEquals(middlePoint, expectedMidpoint);
});

test("'Path3D.getPointAt' should stay near the endpoint despite Float32 length rounding", () => {
    // Arrange
    const expectedEnd   = Path3DTestFixtures.EXPECTED_FLOAT32_ENDPOINT;
    const controlPoints = Path3DTestFixtures.createPoints([[0, 0, 0], [0.7, 0, 0], [1.4, 0, 0]]);
    const actualPath    = Path3DTestFixtures.createPath(controlPoints);

    // Act
    const actualPoint = actualPath.getPointAt(MATH_COMMON_VALUES.UNIT);

    // Assert
    Path3DTestFixtures.assertVectorApproximatelyEquals(actualPoint, expectedEnd);
});

test("'Path3D.getPointAt' should reject non-numeric and non-finite parameters", () => {
    // Arrange
    const expectedMessage   = '`Path3D.getPointAt` expects `pathParameter` as a finite number.';
    const actualPath        = Path3DTestFixtures.createPath();
    const invalidParameters = Path3DTestFixtures.createInvalidParameters();

    // Act & Assert
    invalidParameters.forEach((parameter) => {
        assert.throws(() => actualPath.getPointAt(parameter), {
            name    : 'TypeError',
            message : expectedMessage
        });
    });
});

test("'Path3D.getPointAt' should reject invalid output vectors", () => {
    // Arrange
    const expectedMessage = '`Path3D.getPointAt` expects `out` as a `Vector3`.';
    const actualPath      = Path3DTestFixtures.createPath();
    const invalidOutputs  = Path3DTestFixtures.createInvalidOutputs();

    // Act & Assert
    invalidOutputs.forEach((output) => {
        assert.throws(() => actualPath.getPointAt(Path3DTestFixtures.MIDDLE_PARAMETER, output), {
            name    : 'TypeError',
            message : expectedMessage
        });
    });
});

test("'Path3D.getTangentAt' should return normalized directions across an open path", () => {
    // Arrange
    const expectedFirst  = Path3DTestFixtures.EXPECTED_FIRST_TANGENT;
    const expectedSecond = Path3DTestFixtures.EXPECTED_SECOND_TANGENT;
    const parameter      = Path3DTestFixtures.MIDDLE_PARAMETER;
    const segmentKnot    = Path3DTestFixtures.OPEN_SEGMENT_KNOT;
    const actualPath     = Path3DTestFixtures.createPath();

    // Act
    const firstTangent  = actualPath.getTangentAt(MATH_COMMON_VALUES.ZERO);
    const knotTangent   = actualPath.getTangentAt(segmentKnot);
    const middleTangent = actualPath.getTangentAt(parameter);
    const lastTangent   = actualPath.getTangentAt(MATH_COMMON_VALUES.UNIT);

    // Assert
    Path3DTestFixtures.assertVectorApproximatelyEquals(firstTangent, expectedFirst);
    Path3DTestFixtures.assertVectorApproximatelyEquals(knotTangent, expectedFirst);
    Path3DTestFixtures.assertVectorApproximatelyEquals(middleTangent, expectedSecond);
    Path3DTestFixtures.assertVectorApproximatelyEquals(lastTangent, expectedSecond);
});

test("'Path3D.getTangentAt' should normalize a three-dimensional segment direction", () => {
    // Arrange
    const expectedComponents = Path3DTestFixtures.EXPECTED_SINGLE_TANGENT;
    const parameter          = Path3DTestFixtures.MIDDLE_PARAMETER;
    const actualPath         = Path3DTestFixtures.createSingleSegmentPath();
    const output             = new Vector3();

    // Act
    const actualTangent = actualPath.getTangentAt(parameter, output);
    const actualLength  = Math.hypot(actualTangent.x, actualTangent.y, actualTangent.z);

    // Assert
    assert.equal(actualTangent, output);
    Path3DTestFixtures.assertVectorApproximatelyEquals(actualTangent, expectedComponents);
    assert.ok(Math.abs(actualLength - MATH_COMMON_VALUES.UNIT) <= TestConstants.DEFAULT_EPSILON_VALUE);
});

test("'Path3D.getTangentAt' should wrap the closing segment and seam of a looped path", () => {
    // Arrange
    const expectedClosing  = Path3DTestFixtures.EXPECTED_CLOSING_TANGENT;
    const expectedFirst    = Path3DTestFixtures.EXPECTED_FIRST_TANGENT;
    const belowMinimum     = Path3DTestFixtures.BELOW_MINIMUM_PARAMETER;
    const closingParameter = Path3DTestFixtures.THREE_QUARTER_PARAMETER;
    const actualPath       = Path3DTestFixtures.createClosedPath();

    // Act
    const closingTangent  = actualPath.getTangentAt(closingParameter);
    const negativeTangent = actualPath.getTangentAt(belowMinimum);
    const seamTangent     = actualPath.getTangentAt(MATH_COMMON_VALUES.UNIT);

    // Assert
    Path3DTestFixtures.assertVectorApproximatelyEquals(closingTangent, expectedClosing);
    Path3DTestFixtures.assertVectorApproximatelyEquals(negativeTangent, expectedClosing);
    Path3DTestFixtures.assertVectorApproximatelyEquals(seamTangent, expectedFirst);
});

test("'Path3D.getTangentAt' should clamp out-of-range parameters on an open path", () => {
    // Arrange
    const expectedFirst = Path3DTestFixtures.EXPECTED_FIRST_TANGENT;
    const expectedLast  = Path3DTestFixtures.EXPECTED_SECOND_TANGENT;
    const belowMinimum  = Path3DTestFixtures.BELOW_MINIMUM_PARAMETER;
    const aboveMaximum  = Path3DTestFixtures.ABOVE_MAXIMUM_PARAMETER;
    const actualPath    = Path3DTestFixtures.createPath();

    // Act
    const firstTangent = actualPath.getTangentAt(belowMinimum);
    const lastTangent  = actualPath.getTangentAt(aboveMaximum);

    // Assert
    Path3DTestFixtures.assertVectorApproximatelyEquals(firstTangent, expectedFirst);
    Path3DTestFixtures.assertVectorApproximatelyEquals(lastTangent, expectedLast);
});

test("'Path3D.getTangentAt' should return zero for coincident control points", () => {
    // Arrange
    const repeatedPoint = new Vector3(2, 3, 4);
    const controlPoints = [repeatedPoint, new Vector3(2, 3, 4)];
    const actualPath    = Path3DTestFixtures.createPath(controlPoints);
    const expectedZero  = Path3DTestFixtures.EXPECTED_ZERO_VECTOR;
    const output        = new Vector3(MATH_COMMON_VALUES.UNIT, MATH_COMMON_VALUES.UNIT, MATH_COMMON_VALUES.UNIT);

    // Act
    const actualTangent = actualPath.getTangentAt(Path3DTestFixtures.MIDDLE_PARAMETER, output);

    // Assert
    assert.equal(actualTangent, output);
    Path3DTestFixtures.assertVectorApproximatelyEquals(actualTangent, expectedZero);
});

test("'Path3D.getTangentAt' should return zero for a segment below the normalization threshold", () => {
    // Arrange
    const expectedZero  = Path3DTestFixtures.EXPECTED_ZERO_VECTOR;
    const tinyDistance  = Path3DTestFixtures.BELOW_TANGENT_THRESHOLD;
    const controlPoints = [new Vector3(), new Vector3(tinyDistance, MATH_COMMON_VALUES.ZERO, MATH_COMMON_VALUES.ZERO)];
    const actualPath    = Path3DTestFixtures.createPath(controlPoints);

    // Act
    const actualTangent = actualPath.getTangentAt(Path3DTestFixtures.MIDDLE_PARAMETER);

    // Assert
    Path3DTestFixtures.assertVectorApproximatelyEquals(actualTangent, expectedZero);
});

test("'Path3D.getTangentAt' should normalize a segment above the normalization threshold", () => {
    // Arrange
    const expectedTangent = Path3DTestFixtures.EXPECTED_FIRST_TANGENT;
    const smallDistance   = Path3DTestFixtures.ABOVE_TANGENT_THRESHOLD;
    const controlPoints   = [new Vector3(), new Vector3(smallDistance, MATH_COMMON_VALUES.ZERO, MATH_COMMON_VALUES.ZERO)];
    const actualPath      = Path3DTestFixtures.createPath(controlPoints);

    // Act
    const actualTangent = actualPath.getTangentAt(Path3DTestFixtures.MIDDLE_PARAMETER);

    // Assert
    Path3DTestFixtures.assertVectorApproximatelyEquals(actualTangent, expectedTangent);
});

test("'Path3D.getTangentAt' should allocate distinct output vectors when omitted", () => {
    // Arrange
    const parameter  = Path3DTestFixtures.MIDDLE_PARAMETER;
    const actualPath = Path3DTestFixtures.createSingleSegmentPath();

    // Act
    const firstTangent  = actualPath.getTangentAt(parameter);
    const secondTangent = actualPath.getTangentAt(parameter);

    // Assert
    assert.notEqual(firstTangent, secondTangent);
    Path3DTestFixtures.assertVectorApproximatelyEquals(firstTangent, Path3DTestFixtures.EXPECTED_SINGLE_TANGENT);
});

test("'Path3D.getTangentAt' should reject non-numeric and non-finite parameters", () => {
    // Arrange
    const expectedMessage   = '`Path3D.getTangentAt` expects `pathParameter` as a finite number.';
    const actualPath        = Path3DTestFixtures.createPath();
    const invalidParameters = Path3DTestFixtures.createInvalidParameters();

    // Act & Assert
    invalidParameters.forEach((parameter) => {
        assert.throws(() => actualPath.getTangentAt(parameter), {
            name    : 'TypeError',
            message : expectedMessage
        });
    });
});

test("'Path3D.getTangentAt' should reject invalid output vectors", () => {
    // Arrange
    const expectedMessage = '`Path3D.getTangentAt` expects `out` as a `Vector3`.';
    const actualPath      = Path3DTestFixtures.createPath();
    const invalidOutputs  = Path3DTestFixtures.createInvalidOutputs();

    // Act & Assert
    invalidOutputs.forEach((output) => {
        assert.throws(() => actualPath.getTangentAt(Path3DTestFixtures.MIDDLE_PARAMETER, output), {
            name    : 'TypeError',
            message : expectedMessage
        });
    });
});

test("'Path3D' should support closed paths with two control points", () => {
    // Arrange
    const controlPoints  = Path3DTestFixtures.createPoints(Path3DTestFixtures.SINGLE_SEGMENT_COMPONENTS);
    const expectedLength = Path3DTestFixtures.EXPECTED_SINGLE_LENGTH * controlPoints.length;
    const actualPath     = Path3DTestFixtures.createPath(controlPoints, { loop: true });
    const firstIndex     = MATH_COMMON_VALUES.ZERO;
    const secondIndex    = MATH_COMMON_VALUES.UNIT;

    // Act
    const firstPoint  = actualPath.getPointAt(MATH_COMMON_VALUES.ZERO);
    const middlePoint = actualPath.getPointAt(Path3DTestFixtures.MIDDLE_PARAMETER);
    const lastPoint   = actualPath.getPointAt(MATH_COMMON_VALUES.UNIT);

    // Assert
    assert.equal(actualPath.totalLength, expectedLength);
    Path3DTestFixtures.assertVectorApproximatelyEquals(firstPoint, Path3DTestFixtures.SINGLE_SEGMENT_COMPONENTS[firstIndex]);
    Path3DTestFixtures.assertVectorApproximatelyEquals(middlePoint, Path3DTestFixtures.SINGLE_SEGMENT_COMPONENTS[secondIndex]);
    Path3DTestFixtures.assertVectorApproximatelyEquals(lastPoint, Path3DTestFixtures.SINGLE_SEGMENT_COMPONENTS[firstIndex]);
});

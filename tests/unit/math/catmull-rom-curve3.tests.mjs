import test                                from 'node:test';
import assert                              from 'node:assert/strict';
import { CatmullRomCurve3 }                from '../../../core/math/catmull-rom-curve3.js';
import { Curve3 }                          from '../../../core/math/curve3.js';
import { Vector3 }                         from '../../../core/math/vector3.js';
import { MATH_COMMON_VALUES, MATH_LAYOUT } from '../../../core/constants/math.js';
import { TestConstants }                   from '../../helpers/test-constants.js';
import * as MathTestConstants              from '../../test-constants/math.js';

class CatmullRomCurve3TestFixtures {
    static MIDDLE_PARAMETER                = 0.5;
    static FIRST_KNOT                      = 1 / 3;
    static SECOND_KNOT                     = 2 / 3;
    static CLOSED_KNOT                     = 0.25;
    static BELOW_TANGENT_THRESHOLD         = 1e-10;
    static BELOW_MINIMUM_PARAMETER         = -0.5;
    static ABOVE_MAXIMUM_PARAMETER         = 1.5;
    static TANGENT_BELOW_MINIMUM_PARAMETER = -0.25;
    static TANGENT_ABOVE_MAXIMUM_PARAMETER = 1.25;

    static OPEN_POINT_COMPONENTS = Object.freeze([
        Object.freeze([0, 0, 0]),
        Object.freeze([2, 4, -2]),
        Object.freeze([4, 0, 2]),
        Object.freeze([7, -1, 5])
    ]);

    static CLOSED_POINT_COMPONENTS = Object.freeze([
        Object.freeze([0, 0, 0]),
        Object.freeze([2, 0, 0]),
        Object.freeze([2, 2, 0]),
        Object.freeze([0, 2, 0])
    ]);

    static INVALID_POINT_CONTAINERS     = Object.freeze([undefined, null, {}, 'points', new Vector3()]);
    static INVALID_OPTIONS              = Object.freeze([null, false, 1, 'closed', []]);
    static INVALID_CLOSED_FLAGS         = Object.freeze([null, 0, 1, 'true', [], {}]);
    static INVALID_PARAMETER_TYPES      = Object.freeze([null, undefined, true, '0.5', {}, []]);
    static EXPECTED_CLOSED_MIDPOINT     = Object.freeze([1, -0.25, 0]);
    static EXPECTED_CLOSED_SEAM_TANGENT = Object.freeze([Math.SQRT1_2, -Math.SQRT1_2, 0]);
    static EXPECTED_MIDDLE_POINT        = Object.freeze([2.9375, 2.3125, -0.3125]);

    /* eslint-disable indent */
    static EXPECTED_MIDDLE_TANGENT = Object.freeze([
         0.25017379216558444,
        -0.7171648708746754,
         0.6504518596305195
    ]);

    static EXPECTED_OPEN_START_TANGENT  = Object.freeze([
         2 / Math.sqrt(24),
         4 / Math.sqrt(24),
        -2 / Math.sqrt(24)
    ]);

    static EXPECTED_OPEN_END_TANGENT = Object.freeze([
         3 / Math.sqrt(19),
        -1 / Math.sqrt(19),
         3 / Math.sqrt(19)
    ]);
    /* eslint-enable indent */

    static createPoints(components) {
        return components.map(([x, y, z]) => new Vector3(x, y, z));
    }

    static createOpenPoints() {
        return this.createPoints(this.OPEN_POINT_COMPONENTS);
    }

    static createClosedPoints() {
        return this.createPoints(this.CLOSED_POINT_COMPONENTS);
    }

    static createCurve(points = this.createOpenPoints(), options = {}) {
        return new CatmullRomCurve3(points, options);
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

test("'CatmullRomCurve3' constructor should accept two control points and inherit from 'Curve3'", () => {
    // Arrange
    const expectedClosed = false;
    const controlPoints  = [new Vector3(), new Vector3(2, 4, 6)];

    // Act
    const actualCurve = CatmullRomCurve3TestFixtures.createCurve(controlPoints);

    // Assert
    assert.ok(actualCurve instanceof CatmullRomCurve3);
    assert.ok(actualCurve instanceof Curve3);
    assert.equal(actualCurve.closed, expectedClosed);
    assert.equal(actualCurve.points.length, controlPoints.length);
});

test("'CatmullRomCurve3' constructor should copy the control point array without cloning the vectors", () => {
    // Arrange
    const controlPoints      = CatmullRomCurve3TestFixtures.createOpenPoints();
    const expectedPointCount = controlPoints.length;
    const firstPointIndex    = MATH_COMMON_VALUES.ZERO;
    const lastPointIndex     = expectedPointCount - MATH_COMMON_VALUES.UNIT;
    const firstOriginalPoint = controlPoints[firstPointIndex];

    // Act
    const actualCurve = CatmullRomCurve3TestFixtures.createCurve(controlPoints);
    controlPoints.pop();

    // Assert
    assert.notEqual(actualCurve.points, controlPoints);
    assert.equal(actualCurve.points.length, expectedPointCount);
    assert.equal(actualCurve.points[firstPointIndex], firstOriginalPoint);
    assert.ok(actualCurve.points[lastPointIndex] instanceof Vector3);
});

test("'CatmullRomCurve3' constructor should accept closed curves and an explicit undefined option", () => {
    // Arrange
    const controlPoints = CatmullRomCurve3TestFixtures.createClosedPoints();
    const noOptions     = undefined;
    const defaultClosed = undefined;

    // Act
    const actualOpenCurve   = CatmullRomCurve3TestFixtures.createCurve(controlPoints, noOptions);
    const actualClosedCurve = CatmullRomCurve3TestFixtures.createCurve(controlPoints, { closed: true });
    const explicitDefault   = CatmullRomCurve3TestFixtures.createCurve(controlPoints, { closed: defaultClosed });

    // Assert
    assert.equal(actualOpenCurve.closed, false);
    assert.equal(actualClosedCurve.closed, true);
    assert.equal(explicitDefault.closed, false);
});

test("'CatmullRomCurve3' constructor should reject non-array control point containers", () => {
    // Arrange
    const invalidContainers = CatmullRomCurve3TestFixtures.INVALID_POINT_CONTAINERS;
    const expectedMessage   = '`CatmullRomCurve3` expects `points` as an array of `Vector3`.';

    // Act & Assert
    invalidContainers.forEach((points) => {
        assert.throws(() => new CatmullRomCurve3(points), {
            name    : 'TypeError',
            message : expectedMessage
        });
    });
});

test("'CatmullRomCurve3' constructor should reject fewer than two control points", () => {
    // Arrange
    const invalidContainers = [[], [new Vector3()]];
    const expectedMessage   = '`CatmullRomCurve3` expects at least two control points.';

    // Act & Assert
    invalidContainers.forEach((points) => {
        assert.throws(() => new CatmullRomCurve3(points), {
            name    : 'RangeError',
            message : expectedMessage
        });
    });
});

test("'CatmullRomCurve3' constructor should reject non-'Vector3' control points", () => {
    // Arrange
    const invalidPoints      = [undefined, null, 0, {}, [0, 0, 0]];
    const invalidControlSets = invalidPoints.map((invalidPoint) => [new Vector3(), invalidPoint]);
    const expectedMessage    = '`CatmullRomCurve3` expects all points to be `Vector3` instances.';

    // Act & Assert
    invalidControlSets.forEach((controlPoints) => {
        assert.throws(() => new CatmullRomCurve3(controlPoints), {
            name    : 'TypeError',
            message : expectedMessage
        });
    });
});

test("'CatmullRomCurve3' constructor should reject invalid option containers", () => {
    // Arrange
    const invalidOptions  = CatmullRomCurve3TestFixtures.INVALID_OPTIONS;
    const expectedMessage = '`CatmullRomCurve3` expects options as a plain object.';

    // Act & Assert
    invalidOptions.forEach((options) => {
        assert.throws(() => CatmullRomCurve3TestFixtures.createCurve(undefined, options), {
            name    : 'TypeError',
            message : expectedMessage
        });
    });
});

test("'CatmullRomCurve3' constructor should reject non-boolean closed flags", () => {
    // Arrange
    const invalidClosedValues = CatmullRomCurve3TestFixtures.INVALID_CLOSED_FLAGS;
    const expectedMessage     = '`CatmullRomCurve3` option `closed` must be a boolean.';

    // Act & Assert
    invalidClosedValues.forEach((closed) => {
        assert.throws(() => CatmullRomCurve3TestFixtures.createCurve(undefined, { closed }), {
            name    : 'TypeError',
            message : expectedMessage
        });
    });
});

test("'CatmullRomCurve3.getPoint' should return the endpoints and exact interior control points of an open curve", () => {
    // Arrange
    const expectedPoints   = CatmullRomCurve3TestFixtures.OPEN_POINT_COMPONENTS;
    const actualCurve      = CatmullRomCurve3TestFixtures.createCurve();
    const controlPoints    = actualCurve.points;
    const firstPointIndex  = MATH_COMMON_VALUES.ZERO;
    const secondPointIndex = firstPointIndex + MATH_COMMON_VALUES.UNIT;
    const thirdPointIndex  = secondPointIndex + MATH_COMMON_VALUES.UNIT;
    const lastPointIndex   = controlPoints.length - MATH_COMMON_VALUES.UNIT;
    const firstKnot        = CatmullRomCurve3TestFixtures.FIRST_KNOT;
    const secondKnot       = CatmullRomCurve3TestFixtures.SECOND_KNOT;

    // Act
    const firstPoint  = actualCurve.getPoint(MATH_COMMON_VALUES.ZERO);
    const secondPoint = actualCurve.getPoint(firstKnot);
    const thirdPoint  = actualCurve.getPoint(secondKnot);
    const lastPoint   = actualCurve.getPoint(MATH_COMMON_VALUES.UNIT);

    // Assert
    CatmullRomCurve3TestFixtures.assertVectorApproximatelyEquals(firstPoint, expectedPoints[firstPointIndex]);
    CatmullRomCurve3TestFixtures.assertVectorApproximatelyEquals(secondPoint, expectedPoints[secondPointIndex]);
    CatmullRomCurve3TestFixtures.assertVectorApproximatelyEquals(thirdPoint, expectedPoints[thirdPointIndex]);
    CatmullRomCurve3TestFixtures.assertVectorApproximatelyEquals(lastPoint, expectedPoints[lastPointIndex]);
    assert.notEqual(firstPoint, controlPoints[firstPointIndex]);
    assert.notEqual(lastPoint, controlPoints[lastPointIndex]);
});

test("'CatmullRomCurve3.getPoint' should interpolate every coordinate on a curved segment", () => {
    // Arrange
    const parameter          = CatmullRomCurve3TestFixtures.MIDDLE_PARAMETER;
    const expectedComponents = CatmullRomCurve3TestFixtures.EXPECTED_MIDDLE_POINT;
    const actualCurve        = CatmullRomCurve3TestFixtures.createCurve();
    const output             = new Vector3();

    // Act
    const actualPoint = actualCurve.getPoint(parameter, output);

    // Assert
    assert.equal(actualPoint, output);
    CatmullRomCurve3TestFixtures.assertVectorApproximatelyEquals(actualPoint, expectedComponents);
});

test("'CatmullRomCurve3.getPoint' should clamp the parameter below zero and above one", () => {
    // Arrange
    const expectedPoints        = CatmullRomCurve3TestFixtures.OPEN_POINT_COMPONENTS;
    const belowMinimumParameter = CatmullRomCurve3TestFixtures.BELOW_MINIMUM_PARAMETER;
    const aboveMaximumParameter = CatmullRomCurve3TestFixtures.ABOVE_MAXIMUM_PARAMETER;
    const actualCurve           = CatmullRomCurve3TestFixtures.createCurve();
    const firstPointIndex       = MATH_COMMON_VALUES.ZERO;
    const lastPointIndex        = expectedPoints.length - MATH_COMMON_VALUES.UNIT;

    // Act
    const actualFirstPoint = actualCurve.getPoint(belowMinimumParameter);
    const actualLastPoint  = actualCurve.getPoint(aboveMaximumParameter);

    // Assert
    CatmullRomCurve3TestFixtures.assertVectorApproximatelyEquals(actualFirstPoint, expectedPoints[firstPointIndex]);
    CatmullRomCurve3TestFixtures.assertVectorApproximatelyEquals(actualLastPoint, expectedPoints[lastPointIndex]);
});

test("'CatmullRomCurve3.getPoint' should close the curve and wrap its control points", () => {
    // Arrange
    const expectedMidpoint = CatmullRomCurve3TestFixtures.EXPECTED_CLOSED_MIDPOINT;
    const expectedPoints   = CatmullRomCurve3TestFixtures.CLOSED_POINT_COMPONENTS;
    const controlPoints    = CatmullRomCurve3TestFixtures.createClosedPoints();
    const actualCurve      = CatmullRomCurve3TestFixtures.createCurve(controlPoints, { closed: true });
    const firstKnot        = CatmullRomCurve3TestFixtures.CLOSED_KNOT;
    const middleParameter  = firstKnot * CatmullRomCurve3TestFixtures.MIDDLE_PARAMETER;
    const firstPointIndex  = MATH_COMMON_VALUES.ZERO;
    const secondPointIndex = MATH_COMMON_VALUES.UNIT;

    // Act
    const middlePoint = actualCurve.getPoint(middleParameter);
    const secondPoint = actualCurve.getPoint(firstKnot);
    const lastPoint   = actualCurve.getPoint(MATH_COMMON_VALUES.UNIT);

    // Assert
    CatmullRomCurve3TestFixtures.assertVectorApproximatelyEquals(middlePoint, expectedMidpoint);
    CatmullRomCurve3TestFixtures.assertVectorApproximatelyEquals(secondPoint, expectedPoints[secondPointIndex]);
    CatmullRomCurve3TestFixtures.assertVectorApproximatelyEquals(lastPoint, expectedPoints[firstPointIndex]);
});

test("'CatmullRomCurve3.getPoint' should support a closed curve with two control points", () => {
    // Arrange
    const controlPointComponents = [
        [0, 0,  0],
        [4, 2, -2]
    ];

    const controlPoints    = CatmullRomCurve3TestFixtures.createPoints(controlPointComponents);
    const actualCurve      = CatmullRomCurve3TestFixtures.createCurve(controlPoints, { closed: true });
    const middleParameter  = CatmullRomCurve3TestFixtures.MIDDLE_PARAMETER;
    const firstPointIndex  = MATH_COMMON_VALUES.ZERO;
    const secondPointIndex = MATH_COMMON_VALUES.UNIT;

    // Act
    const firstPoint   = actualCurve.getPoint(MATH_COMMON_VALUES.ZERO);
    const middlePoint  = actualCurve.getPoint(middleParameter);
    const closingPoint = actualCurve.getPoint(MATH_COMMON_VALUES.UNIT);

    // Assert
    CatmullRomCurve3TestFixtures.assertVectorApproximatelyEquals(firstPoint, controlPointComponents[firstPointIndex]);
    CatmullRomCurve3TestFixtures.assertVectorApproximatelyEquals(middlePoint, controlPointComponents[secondPointIndex]);
    CatmullRomCurve3TestFixtures.assertVectorApproximatelyEquals(closingPoint, controlPointComponents[firstPointIndex]);
});

test("'CatmullRomCurve3.getPoint' should reject non-numeric and non-finite parameters", () => {
    // Arrange
    const actualCurve       = CatmullRomCurve3TestFixtures.createCurve();
    const invalidParameters = CatmullRomCurve3TestFixtures.createInvalidParameters();
    const expectedMessage   = '`CatmullRomCurve3.getPoint` expects `curveParameter` as a finite number.';

    // Act & Assert
    invalidParameters.forEach((parameter) => {
        assert.throws(() => actualCurve.getPoint(parameter), {
            name    : 'TypeError',
            message : expectedMessage
        });
    });
});

test("'CatmullRomCurve3.getPoint' should reject invalid output vectors", () => {
    // Arrange
    const actualCurve   = CatmullRomCurve3TestFixtures.createCurve();
    const invalidValues = CatmullRomCurve3TestFixtures.createInvalidOutputs();
    const expectedError = '`CatmullRomCurve3.getPoint` expects `out` as a Vector3.';

    // Act & Assert
    invalidValues.forEach((output) => {
        assert.throws(() => actualCurve.getPoint(CatmullRomCurve3TestFixtures.MIDDLE_PARAMETER, output), {
            name    : 'TypeError',
            message : expectedError
        });
    });
});

test("'CatmullRomCurve3.getTangent' should return a normalized three-dimensional direction", () => {
    // Arrange
    const actualCurve        = CatmullRomCurve3TestFixtures.createCurve();
    const parameter          = CatmullRomCurve3TestFixtures.MIDDLE_PARAMETER;
    const expectedComponents = CatmullRomCurve3TestFixtures.EXPECTED_MIDDLE_TANGENT;
    const expectedUnitLength = MATH_COMMON_VALUES.UNIT;
    const output             = new Vector3();

    // Act
    const actualTangent = actualCurve.getTangent(parameter, output);
    const actualLength  = Math.hypot(actualTangent.x, actualTangent.y, actualTangent.z);

    // Assert
    assert.equal(actualTangent, output);
    CatmullRomCurve3TestFixtures.assertVectorApproximatelyEquals(actualTangent, expectedComponents);
    assert.ok(Math.abs(actualLength - expectedUnitLength) <= TestConstants.DEFAULT_EPSILON_VALUE);
});

test("'CatmullRomCurve3.getTangent' should use the start and end segment directions on an open curve", () => {
    // Arrange
    const actualCurve   = CatmullRomCurve3TestFixtures.createCurve();
    const expectedStart = CatmullRomCurve3TestFixtures.EXPECTED_OPEN_START_TANGENT;
    const expectedEnd   = CatmullRomCurve3TestFixtures.EXPECTED_OPEN_END_TANGENT;

    // Act
    const firstTangent = actualCurve.getTangent(MATH_COMMON_VALUES.ZERO);
    const lastTangent  = actualCurve.getTangent(MATH_COMMON_VALUES.UNIT);

    // Assert
    CatmullRomCurve3TestFixtures.assertVectorApproximatelyEquals(firstTangent, expectedStart);
    CatmullRomCurve3TestFixtures.assertVectorApproximatelyEquals(lastTangent, expectedEnd);
});

test("'CatmullRomCurve3.getTangent' should clamp out-of-range parameters", () => {
    // Arrange
    const expectedStart = CatmullRomCurve3TestFixtures.EXPECTED_OPEN_START_TANGENT;
    const expectedEnd   = CatmullRomCurve3TestFixtures.EXPECTED_OPEN_END_TANGENT;
    const belowMinimum  = CatmullRomCurve3TestFixtures.TANGENT_BELOW_MINIMUM_PARAMETER;
    const aboveMaximum  = CatmullRomCurve3TestFixtures.TANGENT_ABOVE_MAXIMUM_PARAMETER;
    const actualCurve   = CatmullRomCurve3TestFixtures.createCurve();

    // Act
    const firstTangent = actualCurve.getTangent(belowMinimum);
    const lastTangent  = actualCurve.getTangent(aboveMaximum);

    // Assert
    CatmullRomCurve3TestFixtures.assertVectorApproximatelyEquals(firstTangent, expectedStart);
    CatmullRomCurve3TestFixtures.assertVectorApproximatelyEquals(lastTangent, expectedEnd);
});

test("'CatmullRomCurve3.getTangent' should produce matching directions at a closed curve seam", () => {
    // Arrange
    const expectedTangent = CatmullRomCurve3TestFixtures.EXPECTED_CLOSED_SEAM_TANGENT;
    const controlPoints   = CatmullRomCurve3TestFixtures.createClosedPoints();
    const actualCurve     = CatmullRomCurve3TestFixtures.createCurve(controlPoints, { closed: true });

    // Act
    const firstTangent = actualCurve.getTangent(MATH_COMMON_VALUES.ZERO);
    const lastTangent  = actualCurve.getTangent(MATH_COMMON_VALUES.UNIT);

    // Assert
    CatmullRomCurve3TestFixtures.assertVectorApproximatelyEquals(firstTangent, expectedTangent);
    CatmullRomCurve3TestFixtures.assertVectorApproximatelyEquals(lastTangent, expectedTangent);
});

test("'CatmullRomCurve3.getTangent' should return zero for coincident control points", () => {
    // Arrange
    const expectedZero  = [MATH_COMMON_VALUES.ZERO, MATH_COMMON_VALUES.ZERO, MATH_COMMON_VALUES.ZERO];
    const repeatedPoint = new Vector3(2, 3, 4);
    const controlPoints = [repeatedPoint, new Vector3(2, 3, 4)];
    const actualCurve   = CatmullRomCurve3TestFixtures.createCurve(controlPoints);
    const output        = new Vector3(1, 1, 1);

    // Act
    const actualTangent = actualCurve.getTangent(CatmullRomCurve3TestFixtures.MIDDLE_PARAMETER, output);

    // Assert
    assert.equal(actualTangent, output);
    CatmullRomCurve3TestFixtures.assertVectorApproximatelyEquals(actualTangent, expectedZero);
});

test("'CatmullRomCurve3.getTangent' should return zero below the normalization threshold", () => {
    // Arrange
    const expectedZero                = [MATH_COMMON_VALUES.ZERO, MATH_COMMON_VALUES.ZERO, MATH_COMMON_VALUES.ZERO];
    const belowNormalizationThreshold = CatmullRomCurve3TestFixtures.BELOW_TANGENT_THRESHOLD;
    const controlPoints               = [new Vector3(), new Vector3(belowNormalizationThreshold, 0, 0)];
    const actualCurve                 = CatmullRomCurve3TestFixtures.createCurve(controlPoints);

    // Act
    const actualTangent = actualCurve.getTangent(MATH_COMMON_VALUES.ZERO);

    // Assert
    CatmullRomCurve3TestFixtures.assertVectorApproximatelyEquals(actualTangent, expectedZero);
});

test("'CatmullRomCurve3.getTangent' should reject non-numeric and non-finite parameters", () => {
    // Arrange
    const expectedMessage   = '`CatmullRomCurve3.getTangent` expects `curveParameter` as a finite number.';
    const actualCurve       = CatmullRomCurve3TestFixtures.createCurve();
    const invalidParameters = CatmullRomCurve3TestFixtures.createInvalidParameters();

    // Act & Assert
    invalidParameters.forEach((parameter) => {
        assert.throws(() => actualCurve.getTangent(parameter), {
            name    : 'TypeError',
            message : expectedMessage
        });
    });
});

test("'CatmullRomCurve3.getTangent' should reject invalid output vectors", () => {
    // Arrange
    const expectedError = '`CatmullRomCurve3.getTangent` expects `out` as a Vector3.';
    const actualCurve   = CatmullRomCurve3TestFixtures.createCurve();
    const invalidValues = CatmullRomCurve3TestFixtures.createInvalidOutputs();

    // Act & Assert
    invalidValues.forEach((output) => {
        assert.throws(() => actualCurve.getTangent(CatmullRomCurve3TestFixtures.MIDDLE_PARAMETER, output), {
            name    : 'TypeError',
            message : expectedError
        });
    });
});

test("'CatmullRomCurve3' should expose inherited 'Curve3' sampling methods", () => {
    // Arrange
    const expectedPoint   = CatmullRomCurve3TestFixtures.EXPECTED_MIDDLE_POINT;
    const expectedTangent = CatmullRomCurve3TestFixtures.EXPECTED_MIDDLE_TANGENT;
    const actualCurve     = CatmullRomCurve3TestFixtures.createCurve();
    const parameter       = CatmullRomCurve3TestFixtures.MIDDLE_PARAMETER;
    const outPoint        = new Vector3();
    const outTangent      = new Vector3();

    // Act
    const actualPoint   = actualCurve.getPointAt(parameter, outPoint);
    const actualTangent = actualCurve.getTangentAt(parameter, outTangent);

    // Assert
    assert.equal(actualPoint, outPoint);
    assert.equal(actualTangent, outTangent);
    CatmullRomCurve3TestFixtures.assertVectorApproximatelyEquals(actualPoint, expectedPoint);
    CatmullRomCurve3TestFixtures.assertVectorApproximatelyEquals(actualTangent, expectedTangent);
});

test("'CatmullRomCurve3.getPoints' should sample a complete closed curve with separate outputs", () => {
    // Arrange
    const controlPoints   = CatmullRomCurve3TestFixtures.createClosedPoints();
    const actualCurve     = CatmullRomCurve3TestFixtures.createCurve(controlPoints, { closed: true });
    const sampleSegments  = controlPoints.length;
    const firstPointIndex = MATH_COMMON_VALUES.ZERO;
    const lastPointIndex  = sampleSegments;
    const expectedFirst   = CatmullRomCurve3TestFixtures.CLOSED_POINT_COMPONENTS[firstPointIndex];

    // Act & Assert
    const actualPoints = actualCurve.getPoints(sampleSegments);
    assert.equal(actualPoints.length, sampleSegments + MATH_COMMON_VALUES.UNIT);

    CatmullRomCurve3TestFixtures.assertVectorApproximatelyEquals(actualPoints[firstPointIndex], expectedFirst);
    CatmullRomCurve3TestFixtures.assertVectorApproximatelyEquals(actualPoints[lastPointIndex], expectedFirst);

    assert.notEqual(actualPoints[firstPointIndex], actualPoints[lastPointIndex]);
    assert.equal(new Set(actualPoints).size, actualPoints.length);
});

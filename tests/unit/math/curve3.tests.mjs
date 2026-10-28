import test                   from 'node:test';
import assert                 from 'node:assert/strict';
import { Curve3 }             from '../../../core/math/curve3.js';
import { Vector3 }            from '../../../core/math/vector3.js';
import { MATH_COMMON_VALUES } from '../../../core/constants/math.js';
import * as MathTestConstants from '../../test-constants/math.js';

// Minimal concrete curve used to exercise the abstract 'Curve3' contract
class LinearCurve3 extends Curve3 {
    constructor() {
        super();
        this.pointCalls   = [];
        this.tangentCalls = [];
    }

    getPoint(parameter, out = new Vector3()) {
        this.pointCalls.push({ parameter, out });
        return out.set(parameter, parameter * Curve3TestFixtures.Y_MULTIPLIER, -parameter);
    }

    getTangent(parameter, out = new Vector3()) {
        this.tangentCalls.push({ parameter, out });

        return out.set(
            MATH_COMMON_VALUES.UNIT,
            Curve3TestFixtures.Y_MULTIPLIER,
            -MATH_COMMON_VALUES.UNIT
        );
    }
}

class Curve3TestFixtures {
    static Y_MULTIPLIER     = 2;
    static SAMPLE_SEGMENTS  = 4;
    static MIDDLE_PARAMETER = 0.5;
    static INNER_PARAMETER  = 0.25;
    static INVALID_TYPES    = Object.freeze([null, true, '4', {}, [], Object(4)]);
    static INVALID_COUNTS   = Object.freeze([0, -1, -4, 0.5, 1.5, 4.25]);

    static createCurve() {
        return new LinearCurve3();
    }

    static assertPoint(point, parameter) {
        assert.ok(point instanceof Vector3);
        assert.deepEqual([point.x, point.y, point.z], [parameter, parameter * this.Y_MULTIPLIER, -parameter]);
    }
}

test("'Curve3' constructor should reject direct instantiation", () => {
    // Arrange
    const actualCall = () => new Curve3();

    // Act & Assert
    assert.throws(actualCall, { message: '`Curve3` is abstract and must be subclassed.' });
});

test("'Curve3' constructor should allow a concrete subclass", () => {
    // Arrange & Act
    const actualCurve = Curve3TestFixtures.createCurve();

    // Assert
    assert.ok(actualCurve instanceof Curve3);
});

test("'Curve3' abstract sampling methods should reject missing implementations", () => {
    // Arrange
    class IncompleteCurve3 extends Curve3 {}
    const actualCurve      = new IncompleteCurve3();
    const out              = new Vector3();

    // Act & Assert
    assert.throws(() => actualCurve.getPoint(Curve3TestFixtures.MIDDLE_PARAMETER), {
        message: '`Curve3.getPoint` must be implemented in subclasses.'
    });

    assert.throws(() => actualCurve.getPoint(Curve3TestFixtures.MIDDLE_PARAMETER, out), Error);
    assert.throws(() => actualCurve.getTangent(Curve3TestFixtures.MIDDLE_PARAMETER), {
        message: '`Curve3.getTangent` must be implemented in subclasses.'
    });

    assert.throws(() => actualCurve.getTangent(Curve3TestFixtures.MIDDLE_PARAMETER, out), Error);
});

test("'Curve3.getPointAt' should forward the parameter and supplied output vector", () => {
    // Arrange
    const actualCurve = Curve3TestFixtures.createCurve();
    const parameter   = Curve3TestFixtures.INNER_PARAMETER;
    const out         = new Vector3();

    // Act
    const actualPoint = actualCurve.getPointAt(parameter, out);

    // Assert
    assert.equal(actualPoint, out);
    assert.deepEqual(actualCurve.pointCalls, [{ parameter, out }]);
    Curve3TestFixtures.assertPoint(actualPoint, parameter);
});

test("'Curve3.getTangentAt' should forward the parameter and supplied output vector", () => {
    // Arrange
    const actualCurve = Curve3TestFixtures.createCurve();
    const parameter   = Curve3TestFixtures.MIDDLE_PARAMETER;
    const out         = new Vector3();

    // Act
    const actualTangent = actualCurve.getTangentAt(parameter, out);

    // Assert
    assert.equal(actualTangent, out);
    assert.deepEqual(actualCurve.tangentCalls, [{ parameter, out }]);
    assert.deepEqual(
        [actualTangent.x, actualTangent.y, actualTangent.z],
        [MATH_COMMON_VALUES.UNIT, Curve3TestFixtures.Y_MULTIPLIER, -MATH_COMMON_VALUES.UNIT]
    );
});

test("'Curve3.getPointAt' and 'getTangentAt' should allocate an output vector when omitted", () => {
    // Arrange
    const actualCurve    = Curve3TestFixtures.createCurve();
    const parameter      = Curve3TestFixtures.MIDDLE_PARAMETER;
    const firstCallIndex = 0;

    // Act
    const actualPoint   = actualCurve.getPointAt(parameter);
    const actualTangent = actualCurve.getTangentAt(parameter);

    // Assert
    assert.ok(actualPoint instanceof Vector3);
    assert.ok(actualTangent instanceof Vector3);
    assert.notEqual(actualPoint, actualTangent);
    assert.equal(actualPoint, actualCurve.pointCalls[firstCallIndex].out);
    assert.equal(actualTangent, actualCurve.tangentCalls[firstCallIndex].out);
    Curve3TestFixtures.assertPoint(actualPoint, parameter);
});

test("'Curve3.getPoints' should sample evenly, include both endpoints and create separate output vectors", () => {
    // Arrange
    const expectedParameters = [0, 0.25, 0.5, 0.75, 1];
    const actualCurve        = Curve3TestFixtures.createCurve();

    // Act
    const actualPoints = actualCurve.getPoints(Curve3TestFixtures.SAMPLE_SEGMENTS);

    // Assert
    assert.equal(actualPoints.length, Curve3TestFixtures.SAMPLE_SEGMENTS + MATH_COMMON_VALUES.UNIT);
    assert.deepEqual(actualCurve.pointCalls.map(({ parameter }) => parameter), expectedParameters);

    actualPoints.forEach((point, index) => {
        Curve3TestFixtures.assertPoint(point, expectedParameters[index]);
        assert.equal(point, actualCurve.pointCalls[index].out);
    });

    assert.equal(new Set(actualPoints).size, actualPoints.length);
});

test("'Curve3.getPoints' should sample the default number of segments", () => {
    // Arrange
    const actualCurve          = Curve3TestFixtures.createCurve();
    const expectedSegmentCount = MathTestConstants.CURVE3_EXPECTED_DEFAULT_SEGMENT_COUNT;
    const firstPointIndex      = MATH_COMMON_VALUES.ZERO;
    const lastPointIndex       = expectedSegmentCount;

    // Act
    const actualPoints = actualCurve.getPoints();

    // Assert
    assert.equal(actualPoints.length, expectedSegmentCount + MATH_COMMON_VALUES.UNIT);
    Curve3TestFixtures.assertPoint(actualPoints[firstPointIndex], MATH_COMMON_VALUES.ZERO);
    Curve3TestFixtures.assertPoint(actualPoints[lastPointIndex], MATH_COMMON_VALUES.UNIT);
    assert.equal(actualCurve.pointCalls.length, actualPoints.length);
});

test("'Curve3.getPoints' should allow one segment and explicit undefined to select the default", () => {
    // Arrange
    const actualCurve          = Curve3TestFixtures.createCurve();
    const singleSegmentCount   = MATH_COMMON_VALUES.UNIT;
    const firstPointIndex      = MATH_COMMON_VALUES.ZERO;
    const lastPointIndex       = MATH_COMMON_VALUES.UNIT;
    const defaultSegmentsInput = undefined;

    // Act
    const minimalPoints = actualCurve.getPoints(singleSegmentCount);
    const defaultPoints = actualCurve.getPoints(defaultSegmentsInput);

    // Assert
    assert.equal(minimalPoints.length, singleSegmentCount + MATH_COMMON_VALUES.UNIT);
    Curve3TestFixtures.assertPoint(minimalPoints[firstPointIndex], MATH_COMMON_VALUES.ZERO);
    Curve3TestFixtures.assertPoint(minimalPoints[lastPointIndex], MATH_COMMON_VALUES.UNIT);
    assert.equal(defaultPoints.length, MathTestConstants.CURVE3_EXPECTED_DEFAULT_SEGMENT_COUNT + MATH_COMMON_VALUES.UNIT);
});

test("'Curve3.getPoints' should reject non-numeric and non-finite segment counts", () => {
    // Arrange
    const actualCurve   = Curve3TestFixtures.createCurve();
    const invalidValues = [
        ...Curve3TestFixtures.INVALID_TYPES,
        ...MathTestConstants.MATH_NON_FINITE_VALUES
    ];

    // Act & Assert
    invalidValues.forEach((segments) => {
        assert.throws(() => actualCurve.getPoints(segments), {
            name    : 'TypeError',
            message : '`Curve3.getPoints` expects `segments` as a finite number.'
        });
    });

    assert.equal(actualCurve.pointCalls.length, MATH_COMMON_VALUES.ZERO);
});

test("'Curve3.getPoints' should reject fractional and non-positive segment counts", () => {
    // Arrange
    const actualCurve = Curve3TestFixtures.createCurve();

    // Act & Assert
    Curve3TestFixtures.INVALID_COUNTS.forEach((segments) => {
        assert.throws(() => actualCurve.getPoints(segments), {
            name    : 'RangeError',
            message : 'Curve3.getPoints: `segments` must be a positive integer.'
        });
    });

    assert.equal(actualCurve.pointCalls.length, MATH_COMMON_VALUES.ZERO);
});

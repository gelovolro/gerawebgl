import test                   from 'node:test';
import assert                 from 'node:assert/strict';
import * as MathTestConstants from '../../test-constants/math.js';
import { MATH_COMMON_VALUES } from '../../../core/constants/math.js';
import { CURVE3_SAMPLING }    from '../../../core/constants/curve3.js';

test("'Curve3' sampling constants should be frozen", () => {
    // Act & Assert
    assert.equal(Object.isFrozen(CURVE3_SAMPLING), true);
});

test("'Curve3' sampling constants should preserve the default segment count and reuse common math values", () => {
    // Arrange
    const expectedDefault = MathTestConstants.CURVE3_EXPECTED_DEFAULT_SEGMENT_COUNT;
    const actualConstants = CURVE3_SAMPLING;

    // Act & Assert
    assert.equal(actualConstants.DEFAULT_SEGMENTS, expectedDefault);
    assert.equal(actualConstants.MIN_SEGMENTS, MATH_COMMON_VALUES.UNIT);
    assert.equal(actualConstants.START_INDEX, MATH_COMMON_VALUES.ZERO);
    assert.equal(actualConstants.INDEX_INCREMENT, MATH_COMMON_VALUES.UNIT);
    assert.equal(actualConstants.START_PARAMETER, MATH_COMMON_VALUES.ZERO);
    assert.equal(actualConstants.END_PARAMETER, MATH_COMMON_VALUES.UNIT);
});

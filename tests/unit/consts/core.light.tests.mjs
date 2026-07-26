import test                from 'node:test';
import assert              from 'node:assert/strict';
import * as LightConstants from '../../../core/constants/light.js';

test("'Light' constants objects should be frozen", () => {
    // Arrange
    const actualConstants = [
        LightConstants.LIGHT_DEFAULTS,
        LightConstants.LIGHT_AMBIENT,
        LightConstants.LIGHT_DIRECTIONAL,
        LightConstants.LIGHT_DIRECTIONAL_DEFAULT_DIRECTION,
        LightConstants.LIGHT_DIRECTIONAL_DEFAULT_NORMALIZED_DIRECTION
    ];

    // Act & Assert
    actualConstants.forEach((constants) => assert.equal(Object.isFrozen(constants), true));
});

test("'Light' default constants should keep existing values", () => {
    // Arrange
    const actualConstants = LightConstants.LIGHT_DEFAULTS;

    // Act & Assert
    assert.equal(actualConstants.ENABLED, true);
});

test("'AmbientLight' constants should keep existing values", () => {
    // Arrange
    const actualConstants = LightConstants.LIGHT_AMBIENT;

    // Act & Assert
    assert.equal(actualConstants.DEFAULT_STRENGTH, 0.2);
});

test("'DirectionalLight' scalar constants should keep existing values", () => {
    // Arrange
    const actualConstants = LightConstants.LIGHT_DIRECTIONAL;

    // Act & Assert
    assert.equal(actualConstants.DEFAULT_DIRECTIONAL_STRENGTH, 1.0);
    assert.equal(actualConstants.MIN_DIRECTIONAL_STRENGTH, 0.0);
    assert.equal(actualConstants.MAX_DIRECTIONAL_STRENGTH, 3.0);
    assert.equal(actualConstants.MIN_DIRECTION_LENGTH_SQUARED, 0.0);
    assert.equal(actualConstants.INVERSE_LENGTH_NUMERATOR, 1.0);
    assert.equal(actualConstants.DEFAULT_ROLL_RADIANS, 0.0);
    assert.equal(actualConstants.ASIN_CLAMP_MIN, -1.0);
    assert.equal(actualConstants.ASIN_CLAMP_MAX, 1.0);
});

test("'DirectionalLight' direction constants should keep existing values", () => {
    // Arrange
    const expectedDirection           = [0.5, 0.7, 1.0];
    const expectedDirectionLength     = Math.hypot(0.5, 0.7, 1.0);
    const expectedNormalizedDirection = [
        0.5 / expectedDirectionLength,
        0.7 / expectedDirectionLength,
        1.0 / expectedDirectionLength
    ];

    // Act
    const actualDirection              = LightConstants.LIGHT_DIRECTIONAL_DEFAULT_DIRECTION;
    const actualNormalizedDirection    = LightConstants.LIGHT_DIRECTIONAL_DEFAULT_NORMALIZED_DIRECTION;
    const actualDirectionIsTypedArray  = actualDirection instanceof Float32Array;
    const actualNormalizedIsTypedArray = actualNormalizedDirection instanceof Float32Array;

    // Assert
    assert.deepEqual(actualDirection, expectedDirection);
    assert.deepEqual(actualNormalizedDirection, expectedNormalizedDirection);
    assert.equal(actualDirectionIsTypedArray, false);
    assert.equal(actualNormalizedIsTypedArray, false);
});

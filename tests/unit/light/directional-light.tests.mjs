import test                        from 'node:test';
import assert                      from 'node:assert/strict';
import { TestAssertions }          from '../../helpers/test-assertions.mjs';
import * as LightConstants         from '../../../core/constants/light.js';
import * as LightTestConstants     from '../../test-constants/light.js';
import * as LightExceptionMessages from '../../../core/exception-messages/light.js';
import { DirectionalLight }        from '../../../core/light/directional-light.js';

test("'DirectionalLight' should expose the default strength", () => {
    // Arrange
    const expectedStrength = LightConstants.LIGHT_DIRECTIONAL.DEFAULT_DIRECTIONAL_STRENGTH;

    // Act
    const actualLight    = new DirectionalLight();
    const actualStrength = actualLight.getStrength();

    // Assert
    assert.equal(actualStrength, expectedStrength);
});

test("'DirectionalLight.setStrength' should update and clamp strength", () => {
    // Arrange
    const actualLight = new DirectionalLight();

    // Act
    actualLight.setStrength(2.5);
    const actualNormalStrength = actualLight.getStrength();

    actualLight.setStrength(-1.0);
    const actualMinStrength = actualLight.getStrength();

    actualLight.setStrength(4.0);
    const actualMaxStrength = actualLight.getStrength();

    // Assert
    assert.equal(actualNormalStrength, 2.5);
    assert.equal(actualMinStrength, LightConstants.LIGHT_DIRECTIONAL.MIN_DIRECTIONAL_STRENGTH);
    assert.equal(actualMaxStrength, LightConstants.LIGHT_DIRECTIONAL.MAX_DIRECTIONAL_STRENGTH);
});

test("'DirectionalLight.setStrength' should reject invalid values", () => {
    // Arrange
    const actualLight        = new DirectionalLight();
    const invalidStrengths   = LightTestConstants.LIGHT_INVALID_STRENGTH_VALUES;
    const expectedErrorMatch = LightExceptionMessages.LIGHT_EXCEPTION_MESSAGES.DIRECTIONAL_STRENGTH_TYPE;

    // Act / Assert
    for (const invalidStrength of invalidStrengths) {
        const actualCall = () => actualLight.setStrength(invalidStrength);
        assert.throws(actualCall, { message: expectedErrorMatch });
    }
});

test("'DirectionalLight.setDirection' should reject invalid direction inputs", () => {
    // Arrange
    const actualLight = new DirectionalLight();

    const invalidTypeCall       = () => actualLight.setDirection(LightTestConstants.DIRECTIONAL_LIGHT_INVALID_DIRECTION_OBJECT);
    const invalidLengthCall     = () => actualLight.setDirection(LightTestConstants.DIRECTIONAL_LIGHT_INVALID_DIRECTION_LENGTH);
    const invalidComponentCall  = () => actualLight.setDirection(LightTestConstants.DIRECTIONAL_LIGHT_INVALID_DIRECTION_COMPONENTS);
    const invalidInfinityCall   = () => actualLight.setDirection(new Float32Array(LightTestConstants.DIRECTIONAL_LIGHT_INVALID_DIRECTION_INFINITY));
    const invalidZeroVectorCall = () => actualLight.setDirection(LightTestConstants.DIRECTIONAL_LIGHT_INVALID_ZERO_DIRECTION);

    // Assert
    assert.throws(invalidTypeCall       , { message: LightExceptionMessages.LIGHT_EXCEPTION_MESSAGES.DIRECTION_TYPE });
    assert.throws(invalidLengthCall     , { message: LightExceptionMessages.LIGHT_EXCEPTION_MESSAGES.DIRECTION_COMPONENTS });
    assert.throws(invalidComponentCall  , { message: LightExceptionMessages.LIGHT_EXCEPTION_MESSAGES.DIRECTION_COMPONENTS_FINITE });
    assert.throws(invalidInfinityCall   , { message: LightExceptionMessages.LIGHT_EXCEPTION_MESSAGES.DIRECTION_COMPONENTS_FINITE });
    assert.throws(invalidZeroVectorCall , { message: LightExceptionMessages.LIGHT_EXCEPTION_MESSAGES.DIRECTION_LENGTH });
});

test("'DirectionalLight.getDirection' should return a normalized direction for arrays and Float32Array inputs", () => {
    // Arrange
    const actualLight            = new DirectionalLight();
    const expectedArrayDirection = new Float32Array(LightTestConstants.DIRECTIONAL_LIGHT_ARRAY_NORMALIZED_DIRECTION_FIXTURE);
    const expectedTypedDirection = new Float32Array(LightTestConstants.DIRECTIONAL_LIGHT_TYPED_NORMALIZED_DIRECTION_FIXTURE);

    // Act
    actualLight.setDirection(LightTestConstants.DIRECTIONAL_LIGHT_ARRAY_DIRECTION_FIXTURE);
    actualLight.updateWorldMatrix(null);
    const actualArrayDirection = new Float32Array(actualLight.getDirection());

    actualLight.setDirection(new Float32Array(LightTestConstants.DIRECTIONAL_LIGHT_TYPED_DIRECTION_FIXTURE));
    actualLight.updateWorldMatrix(null);
    const actualTypedDirection = new Float32Array(actualLight.getDirection());

    // Assert
    TestAssertions.assertFloat32ArrayApproximatelyEquals(actualArrayDirection, expectedArrayDirection);
    TestAssertions.assertFloat32ArrayApproximatelyEquals(actualTypedDirection, expectedTypedDirection);
});

test("'DirectionalLight.getDirection' should fall back to the default direction when the world direction is invalid", () => {
    // Arrange
    const actualLight       = new DirectionalLight();
    const expectedDirection = new Float32Array(LightConstants.LIGHT_DIRECTIONAL_DEFAULT_NORMALIZED_DIRECTION);

    // Act
    actualLight.scale.set(0, 0, 0);
    actualLight.updateWorldMatrix(null);
    const actualDirection = actualLight.getDirection();

    // Assert
    TestAssertions.assertFloat32ArrayApproximatelyEquals(actualDirection, expectedDirection);
});

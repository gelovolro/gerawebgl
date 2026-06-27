import test                              from 'node:test';
import assert                            from 'node:assert/strict';
import * as LightConstants               from '../../../core/constants/light.js';
import * as LightExceptionMessages       from '../../../core/exception-messages/light.js';
import { LIGHT_INVALID_STRENGTH_VALUES } from '../../test-constants/light.js';
import { AmbientLight }                  from '../../../core/light/ambient-light.js';

test("'AmbientLight' should expose the default strength", () => {
    // Arrange
    const expectedStrength = LightConstants.LIGHT_AMBIENT.DEFAULT_STRENGTH;

    // Act
    const actualLight    = new AmbientLight();
    const actualStrength = actualLight.getStrength();

    // Assert
    assert.equal(actualStrength, expectedStrength);
});

test("'AmbientLight.setStrength' should update the strength", () => {
    // Arrange
    const actualLight      = new AmbientLight();
    const expectedStrength = 0.75;

    // Act
    actualLight.setStrength(expectedStrength);
    const actualStrength = actualLight.getStrength();

    // Assert
    assert.equal(actualStrength, expectedStrength);
});

test("'AmbientLight.setStrength' should reject invalid values", () => {
    // Arrange
    const actualLight          = new AmbientLight();
    const invalidStrengths     = LIGHT_INVALID_STRENGTH_VALUES;
    const expectedErrorMessage = LightExceptionMessages.LIGHT_EXCEPTION_MESSAGES.AMBIENT_STRENGTH_TYPE;

    // Act / Assert
    for (const invalidStrength of invalidStrengths) {
        const actualCall = () => actualLight.setStrength(invalidStrength);
        assert.throws(actualCall, { message: expectedErrorMessage });
    }
});

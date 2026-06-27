import test                            from 'node:test';
import assert                          from 'node:assert/strict';
import * as LightConstants             from '../../../core/constants/light.js';
import * as LightExceptionMessages     from '../../../core/exception-messages/light.js';
import { LIGHT_INVALID_ENABLED_VALUE } from '../../test-constants/light.js';
import { Light }                       from '../../../core/light/light.js';

// Minimal concrete subclass, used to test the abstract 'Light' base class
class ConcreteLight extends Light {}

test("'Light' constructor should reject direct instantiation", () => {
    // Arrange
    const expectedErrorMessage = LightExceptionMessages.LIGHT_EXCEPTION_MESSAGES.ABSTRACT_CONSTRUCTOR;

    // Act
    const actualCall = () => new Light();

    // Assert
    assert.throws(actualCall, { message: expectedErrorMessage });
});

test("'Light' should be enabled by default", () => {
    // Arrange
    const expectedEnabled = LightConstants.LIGHT_DEFAULTS.ENABLED;

    // Act
    const actualLight   = new ConcreteLight();
    const actualEnabled = actualLight.isEnabled();

    // Assert
    assert.equal(actualEnabled, expectedEnabled);
});

test("'Light.setEnabled' should update the enabled state", () => {
    // Arrange
    const actualLight = new ConcreteLight();

    // Act
    actualLight.setEnabled(false);
    const actualDisabledState = actualLight.isEnabled();

    actualLight.setEnabled(true);
    const actualEnabledState = actualLight.isEnabled();

    // Assert
    assert.equal(actualDisabledState, false);
    assert.equal(actualEnabledState, true);
});

test("'Light.setEnabled' should reject non-boolean values", () => {
    // Arrange
    const actualLight          = new ConcreteLight();
    const invalidEnabled       = LIGHT_INVALID_ENABLED_VALUE;
    const expectedErrorMessage = LightExceptionMessages.LIGHT_EXCEPTION_MESSAGES.ENABLED_TYPE;

    // Act
    const actualCall = () => actualLight.setEnabled(invalidEnabled);

    // Assert
    assert.throws(actualCall, { message: expectedErrorMessage });
});

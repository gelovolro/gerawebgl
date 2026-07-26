import test                        from 'node:test';
import assert                      from 'node:assert/strict';
import * as LightExceptionMessages from '../../../core/exception-messages/light.js';

test("'Light' exception messages object should be frozen", () => {
    // Arrange
    const actualMessages = LightExceptionMessages.LIGHT_EXCEPTION_MESSAGES;

    // Act & Assert
    assert.equal(Object.isFrozen(actualMessages), true);
});

test("'Light' exception messages should keep existing values", () => {
    // Arrange
    const actualMessages = LightExceptionMessages.LIGHT_EXCEPTION_MESSAGES;

    // Act & Assert
    assert.equal(actualMessages.ABSTRACT_CONSTRUCTOR        , '`Light` is an abstract class and cannot be instantiated directly.');
    assert.equal(actualMessages.ENABLED_TYPE                , '`Light.setEnabled` expects a boolean.');
    assert.equal(actualMessages.AMBIENT_STRENGTH_TYPE       , '`AmbientLight.setStrength` expects a finite number.');
    assert.equal(actualMessages.DIRECTION_TYPE              , '`DirectionalLight.setDirection` expects a number[] or `Float32Array`.');
    assert.equal(actualMessages.DIRECTION_COMPONENTS        , '`DirectionalLight.setDirection` expects exactly 3 components.');
    assert.equal(actualMessages.DIRECTION_COMPONENTS_FINITE , '`DirectionalLight.setDirection` expects finite components.');
    assert.equal(actualMessages.DIRECTION_LENGTH            , '`DirectionalLight.setDirection` expects a non-zero direction vector.');
    assert.equal(actualMessages.DIRECTIONAL_STRENGTH_TYPE   , '`DirectionalLight.setStrength` expects a finite number.');
});

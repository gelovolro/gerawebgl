import test   from 'node:test';
import assert from 'node:assert/strict';

import * as DirectionalLightMaterialExceptionMessages
    from '../../../core/exception-messages/directional-light-material.js';

import { DIRECTIONAL_LIGHT_MATERIAL_EXPECTED_EXCEPTION_KEYS }
    from '../../test-constants/directional-light-material.js';

test("'DirectionalLightMaterial' exception messages object should exist and be frozen", () => {
    // Arrange
    const actualMessages = DirectionalLightMaterialExceptionMessages.DIRECTIONAL_LIGHT_MATERIAL_EXCEPTION_MESSAGES;

    // Act & Assert
    assert.equal(typeof actualMessages, 'object');
    assert.equal(Object.isFrozen(actualMessages), true);
});

test("'DirectionalLightMaterial' exception messages should expose all expected keys", () => {
    // Arrange
    const actualMessages = DirectionalLightMaterialExceptionMessages.DIRECTIONAL_LIGHT_MATERIAL_EXCEPTION_MESSAGES;

    // Act & Assert
    for (const expectedKey of DIRECTIONAL_LIGHT_MATERIAL_EXPECTED_EXCEPTION_KEYS) {
        assert.equal(Object.hasOwn(actualMessages, expectedKey), true);
    }
});

test("'DirectionalLightMaterial' exception messages should keep existing values", () => {
    // Arrange
    const actualMessages = DirectionalLightMaterialExceptionMessages.DIRECTIONAL_LIGHT_MATERIAL_EXCEPTION_MESSAGES;

    // Act & Assert
    assert.equal(actualMessages.WEBGL_CONTEXT_TYPE        , '`DirectionalLightMaterial` expects a WebGL2RenderingContext.');
    assert.equal(actualMessages.SHADER_PROGRAM_TYPE       , '`DirectionalLightMaterial` expects a ShaderProgram instance.');
    assert.equal(actualMessages.OWNS_SHADER_PROGRAM_TYPE  , '`DirectionalLightMaterial` option "ownsShaderProgram" must be a boolean.');
    assert.equal(actualMessages.LIGHT_DIRECTION_LENGTH    , '`DirectionalLightMaterial.setLightDirection` expects a non-zero finite vector.');
    assert.equal(actualMessages.AMBIENT_STRENGTH_TYPE     , '`DirectionalLightMaterial.setAmbientStrength` expects a finite number.');
    assert.equal(actualMessages.DIRECTIONAL_STRENGTH_TYPE , '`DirectionalLightMaterial.setDirectionalStrength` expects a finite number.');
    assert.equal(actualMessages.DIRECTIONAL_ENABLED_TYPE  , '`DirectionalLightMaterial.setDirectionalEnabled` expects a boolean.');
    assert.equal(actualMessages.LIGHTING_ENABLED_TYPE     , '`DirectionalLightMaterial.setLightingEnabled` expects a boolean or a finite number.');
    assert.equal(actualMessages.LIGHTING_ENABLED_RANGE    , '`DirectionalLightMaterial.setLightingEnabled` expects a value in [0..1].');
    assert.equal(actualMessages.VECTOR3_TYPE              , '{methodName} expects a number[] or Float32Array.');
    assert.equal(actualMessages.VECTOR3_COMPONENTS        , '{methodName} expects exactly 3 components [x, y, z].');
    assert.equal(actualMessages.VECTOR3_COMPONENTS_FINITE , '{methodName} expects all components to be finite numbers.');
    assert.equal(actualMessages.OPTIONS_OBJECT            , '{methodName} expects an options object (plain object).');
});

test("'DirectionalLightMaterial' exception messages module should not export behavior", () => {
    // Arrange
    const moduleEntries = Object.entries(DirectionalLightMaterialExceptionMessages);

    // Act & Assert
    for (const [exportName, exportedValue] of moduleEntries) {
        assert.notEqual(typeof exportedValue, 'function', `${exportName} should not export behavior`);
    }
});

import test                        from 'node:test';
import assert                      from 'node:assert/strict';
import * as ShaderProgramConstants from '../../../core/constants/shader-program.js';

test("'ShaderProgram' constants objects should be frozen", () => {
    // Arrange
    const expectedIsFrozen = true;
    const constantsObjects = [
        ShaderProgramConstants.SHADER_PROGRAM_LAYOUT,
        ShaderProgramConstants.SHADER_PROGRAM_DEFAULTS,
        ShaderProgramConstants.SHADER_PROGRAM_LIMITS
    ];

    // Act & Assert
    constantsObjects.forEach((constantsObject) => assert.equal(Object.isFrozen(constantsObject), expectedIsFrozen));
});

test("'ShaderProgram' vector sizes should keep the existing component counts", () => {
    // Arrange
    const expectedVector2ElementCount = 2;
    const expectedVector4ElementCount = 4;

    // Act
    const actualLayout = ShaderProgramConstants.SHADER_PROGRAM_LAYOUT;

    // Assert
    assert.equal(actualLayout.VECTOR2_ELEMENT_COUNT, expectedVector2ElementCount);
    assert.equal(actualLayout.VECTOR4_ELEMENT_COUNT, expectedVector4ElementCount);
});

test("'ShaderProgram' defaults should use the first texture unit and disable matrix transposition", () => {
    // Arrange
    const expectedTextureUnitIndex = 0;
    const expectedMatrixTranspose  = false;

    // Act
    const actualDefaults = ShaderProgramConstants.SHADER_PROGRAM_DEFAULTS;

    // Assert
    assert.equal(actualDefaults.TEXTURE_UNIT_INDEX, expectedTextureUnitIndex);
    assert.equal(actualDefaults.MATRIX_TRANSPOSE, expectedMatrixTranspose);
});

test("'ShaderProgram' limits should keep the missing attribute sentinel and minimum texture unit", () => {
    // Arrange
    const expectedMissingAttributeLocation = -1;
    const expectedMinimumTextureUnitIndex  = 0;

    // Act
    const actualLimits = ShaderProgramConstants.SHADER_PROGRAM_LIMITS;

    // Assert
    assert.equal(actualLimits.ATTRIBUTE_LOCATION_NOT_FOUND, expectedMissingAttributeLocation);
    assert.equal(actualLimits.MIN_TEXTURE_UNIT_INDEX, expectedMinimumTextureUnitIndex);
});

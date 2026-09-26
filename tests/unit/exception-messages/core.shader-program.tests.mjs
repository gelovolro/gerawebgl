import test                                  from 'node:test';
import assert                                from 'node:assert/strict';
import { SHADER_PROGRAM_EXCEPTION_MESSAGES } from '../../../core/exception-messages/shader-program.js';

test("'ShaderProgram' exception messages should be frozen", () => {
    // Arrange
    const expectedIsFrozen = true;

    // Act
    const actualIsFrozen = Object.isFrozen(SHADER_PROGRAM_EXCEPTION_MESSAGES);

    // Assert
    assert.equal(actualIsFrozen, expectedIsFrozen);
});

test("'ShaderProgram' validation and fallback messages should keep their existing text", () => {
    // Arrange
    const expectedMessages = {
        CONTEXT_TYPE          : '`ShaderProgram` expects a `WebGL2RenderingContext`.',
        SOURCE_TYPE           : '`ShaderProgram` expects vertex and fragment source as strings.',
        ATTRIBUTE_NAME_TYPE   : '`ShaderProgram.getAttribLocation` expects attribute name as a string.',
        UNIFORM_NAME_TYPE     : '`ShaderProgram.#getUniformLocation` expects a string name.',
        FLOAT_NAME_TYPE       : '`ShaderProgram.setFloat` expects uniform name as a string.',
        FLOAT_VALUE_TYPE      : '`ShaderProgram.setFloat` expects value as a number.',
        INT_NAME_TYPE         : '`ShaderProgram.setInt` expects uniform name as a string.',
        INT_VALUE_TYPE        : '`ShaderProgram.setInt` expects an integer value.',
        TEXTURE_NAME_TYPE     : '`ShaderProgram.setTexture2D` expects uniform name as a string.',
        TEXTURE_TYPE          : '`ShaderProgram.setTexture2D` expects texture as Texture2D.',
        TEXTURE_UNIT_INDEX    : '`ShaderProgram.setTexture2D` expects textureUnitIndex as a non-negative integer.',
        VECTOR2_NAME_TYPE     : '`ShaderProgram.setVector2` expects uniform name as a string.',
        VECTOR2_TYPE          : '`ShaderProgram.setVector2` expects a number[] or Float32Array.',
        VECTOR2_LENGTH        : '`ShaderProgram.setVector2` expects exactly 2 components.',
        VECTOR3_NAME_TYPE     : '`ShaderProgram.setVector3` expects uniform name as a string.',
        VECTOR3_TYPE          : '`ShaderProgram.setVector3` expects a number[] or Float32Array.',
        VECTOR3_LENGTH        : '`ShaderProgram.setVector3` expects exactly 3 components.',
        VECTOR4_NAME_TYPE     : '`ShaderProgram.setVector4` expects uniform name as a string.',
        VECTOR4_TYPE          : '`ShaderProgram.setVector4` expects a number[] or `Float32Array`.',
        VECTOR4_LENGTH        : '`ShaderProgram.setVector4` expects exactly 4 components.',
        MATRIX4_NAME_TYPE     : '`ShaderProgram.setMatrix4` expects uniform name as a string.',
        MATRIX4_TYPE          : '`ShaderProgram.setMatrix4` expects a 4x4 Float32Array.',
        DISPOSED              : '`ShaderProgram` has been disposed and can no longer be used.',
        PROGRAM_CREATION      : 'Failed to create WebGL program.',
        SHADER_CREATION       : 'Failed to create the WebGL shader.',
        UNKNOWN_LINK_ERROR    : 'Unknown program link error',
        UNKNOWN_COMPILE_ERROR : 'Unknown shader compilation error'
    };

    // Act & Assert
    Object.entries(expectedMessages).forEach(([key, expectedMessage]) => {
        assert.equal(SHADER_PROGRAM_EXCEPTION_MESSAGES[key], expectedMessage);
    });
});

test("'ShaderProgram' formatted messages should preserve names and driver logs verbatim", () => {
    // Arrange
    const expectedAttribute = 'Attribute "u_value[0]" not found in shader program.';
    const expectedUniform   = 'Uniform "u_value[0]" not found in shader program.';
    const name              = 'u_value[0]';

    // Preserve '$&' and line breaks in the original error log
    const infoLog              = 'Unexpected token: $&\nShader compilation stopped.';
    const expectedLinkError    = 'Failed to link program: Unexpected token: $&\nShader compilation stopped.';
    const expectedCompileError = 'Failed to compile shader: Unexpected token: $&\nShader compilation stopped.';

    // Act
    const actualAttribute    = SHADER_PROGRAM_EXCEPTION_MESSAGES.ATTRIBUTE_NOT_FOUND(name);
    const actualUniform      = SHADER_PROGRAM_EXCEPTION_MESSAGES.UNIFORM_NOT_FOUND(name);
    const actualLinkError    = SHADER_PROGRAM_EXCEPTION_MESSAGES.PROGRAM_LINK(infoLog);
    const actualCompileError = SHADER_PROGRAM_EXCEPTION_MESSAGES.SHADER_COMPILE(infoLog);

    // Assert
    assert.equal(actualAttribute, expectedAttribute);
    assert.equal(actualUniform, expectedUniform);
    assert.equal(actualLinkError, expectedLinkError);
    assert.equal(actualCompileError, expectedCompileError);
});

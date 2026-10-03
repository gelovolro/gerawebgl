import test                             from 'node:test';
import assert                           from 'node:assert/strict';
import { TEXTURE2D_EXCEPTION_MESSAGES } from '../../../core/exception-messages/texture2d.js';

test("'Texture2D' exception messages should be frozen", () => {
    // Arrange
    const expectedIsFrozen = true;

    // Act
    const actualIsFrozen = Object.isFrozen(TEXTURE2D_EXCEPTION_MESSAGES);

    // Assert
    assert.equal(actualIsFrozen, expectedIsFrozen);
});

test("'Texture2D' validation and resource messages should keep their existing text", () => {
    // Arrange
    const expectedMessages = {
        EXPECTS_WEBGL2_CONTEXT                     : '`Texture2D` expects `WebGL2RenderingContext`.',
        EXPECTS_OPTIONS_OBJECT                     : '`Texture2D` expects options as an object.',
        EXPECTS_FLIPY_BOOLEAN                      : '`Texture2D` expects `options.flipY` as boolean.',
        FAILED_CREATE_TEXTURE                      : 'Failed to create `WebGLTexture`.',
        EXPECTS_WRAP_S_ENUM                        : '`Texture2D` expects `options.wrapS` as the valid WebGL wrap mode.',
        EXPECTS_WRAP_T_ENUM                        : '`Texture2D` expects `options.wrapT` as the valid WebGL wrap mode.',
        EXPECTS_MIN_FILTER_ENUM                    : '`Texture2D` expects `options.minFilter` as the valid WebGL min filter.',
        EXPECTS_MAG_FILTER_ENUM                    : '`Texture2D` expects `options.magFilter` as the valid WebGL mag filter.',
        EXPECTS_MIPMAP_POLICY                      : '`Texture2D` expects `options.mipmapPolicy` as the valid mipmap policy.',
        MIPMAP_POLICY_CONFLICT                     : '`Texture2D` cannot use the mipmap min filter, when mipmap policy is NONE.',
        MIPMAP_AUTO_POT_REQUIRED_FOR_MIPMAP_FILTER : '`Texture2D` cannot apply a mipmap min filter with the auto policy for a `non power-of-two` texture. Use `MIPMAP_POLICY_ALWAYS` or the non-mipmap min filter.',
        EXPECTS_SAMPLER_OPTIONS_OBJECT             : '`Texture2D.setSamplerParams` expects options as an object.',
        EXPECTS_TEXTURE_UNIT_INDEX                 : '`Texture2D.bind` expects `textureUnitIndex` as a non-negative integer.',
        EXPECTS_URL_STRING                         : '`Texture2D.loadFromUrl` expects url as a non-empty string.',
        INSTANCE_DISPOSED                          : '`Texture2D` instance is disposed.',
        EXPECTS_LOAD_OPTIONS_OBJECT                : '`Texture2D.loadFromUrl` expects options as an object.',
        EXPECTS_CROSS_ORIGIN                       : '`Texture2D.loadFromUrl` expects `options.crossOrigin` as `anonymous`, `use-credentials` or null.',
        FAILED_READ_MAX_TEXTURE_UNITS              : 'Failed to read WebGL `MAX_COMBINED_TEXTURE_IMAGE_UNITS`.'
    };

    // Act & Assert
    Object.entries(expectedMessages).forEach(([key, expectedMessage]) => {
        assert.equal(TEXTURE2D_EXCEPTION_MESSAGES[key], expectedMessage);
    });
});

test("'Texture2D' formatted messages should preserve the unit limit and the complete image URL", () => {
    // Arrange
    const maximumIndex  = 7;
    const url           = '/textures/checker.png?label=$&';
    const expectedRange = '`Texture2D.bind` texture unit index is out of range. Max allowed index is 7.';
    const expectedImage = 'Failed to load the texture image: /textures/checker.png?label=$&';

    // Act
    const actualRange = TEXTURE2D_EXCEPTION_MESSAGES.TEXTURE_UNIT_INDEX_OUT_OF_RANGE(maximumIndex);
    const actualImage = TEXTURE2D_EXCEPTION_MESSAGES.FAILED_LOAD_IMAGE(url);

    // Assert
    assert.equal(actualRange, expectedRange);
    assert.equal(actualImage, expectedImage);
});

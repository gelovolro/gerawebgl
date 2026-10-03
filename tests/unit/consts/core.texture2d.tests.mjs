import test                    from 'node:test';
import assert                  from 'node:assert/strict';
import * as Texture2DConstants from '../../../core/constants/texture2d.js';

test("'Texture2D' constants objects should be frozen", () => {
    // Arrange
    const expectedIsFrozen = true;
    const constantsObjects = [
        Texture2DConstants.TEXTURE2D_MIPMAP_POLICIES,
        Texture2DConstants.TEXTURE2D_DEFAULTS,
        Texture2DConstants.TEXTURE2D_CROSS_ORIGIN,
        Texture2DConstants.TEXTURE2D_PLACEHOLDER,
        Texture2DConstants.TEXTURE2D_UPLOAD,
        Texture2DConstants.TEXTURE2D_LIMITS
    ];

    // Act & Assert
    constantsObjects.forEach((constantsObject) => assert.equal(Object.isFrozen(constantsObject), expectedIsFrozen));
});

test("'Texture2D' mipmap policies should keep their existing numeric values", () => {
    // Arrange
    const expectedNone   = 0;
    const expectedAlways = 1;
    const expectedAuto   = 2;

    // Act
    const actualPolicies = Texture2DConstants.TEXTURE2D_MIPMAP_POLICIES;

    // Assert
    assert.equal(actualPolicies.NONE, expectedNone);
    assert.equal(actualPolicies.ALWAYS, expectedAlways);
    assert.equal(actualPolicies.AUTO, expectedAuto);
});

test("'Texture2D' defaults should flip images and select the automatic mipmap policy", () => {
    // Arrange
    const expectedFlipY        = true;
    const expectedMipmapPolicy = 2;

    // Act
    const actualDefaults = Texture2DConstants.TEXTURE2D_DEFAULTS;

    // Assert
    assert.equal(actualDefaults.FLIP_Y, expectedFlipY);
    assert.equal(actualDefaults.MIPMAP_POLICY, expectedMipmapPolicy);
});

test("'Texture2D' cross-origin modes should keep the browser option values", () => {
    // Arrange
    const expectedAnonymous      = 'anonymous';
    const expectedUseCredentials = 'use-credentials';

    // Act
    const actualModes = Texture2DConstants.TEXTURE2D_CROSS_ORIGIN;

    // Assert
    assert.equal(actualModes.ANONYMOUS, expectedAnonymous);
    assert.equal(actualModes.USE_CREDENTIALS, expectedUseCredentials);
});

test("'Texture2D' placeholder dimensions should remain one pixel", () => {
    // Arrange
    const expectedWidth  = 1;
    const expectedHeight = 1;

    // Act
    const actualPlaceholder = Texture2DConstants.TEXTURE2D_PLACEHOLDER;

    // Assert
    assert.equal(actualPlaceholder.WIDTH, expectedWidth);
    assert.equal(actualPlaceholder.HEIGHT, expectedHeight);
});

test("'Texture2D' upload constants should keep the base level, border and WebGL boolean values", () => {
    // Arrange
    const expectedBaseLevel = 0;
    const expectedBorder    = 0;
    const expectedTrue      = 1;
    const expectedFalse     = 0;

    // Act
    const actualUpload = Texture2DConstants.TEXTURE2D_UPLOAD;

    // Assert
    assert.equal(actualUpload.BASE_MIPMAP_LEVEL, expectedBaseLevel);
    assert.equal(actualUpload.BORDER, expectedBorder);
    assert.equal(actualUpload.TRUE_AS_INTEGER, expectedTrue);
    assert.equal(actualUpload.FALSE_AS_INTEGER, expectedFalse);
});

test("'Texture2D' limits should allow the first texture unit and require a non-empty URL", () => {
    // Arrange
    const expectedMinimumUnit      = 0;
    const expectedMinimumUrlLength = 1;

    // Act
    const actualLimits = Texture2DConstants.TEXTURE2D_LIMITS;

    // Assert
    assert.equal(actualLimits.MIN_TEXTURE_UNIT_INDEX, expectedMinimumUnit);
    assert.equal(actualLimits.MIN_URL_LENGTH, expectedMinimumUrlLength);
});

test("'Texture2D' placeholder pixel should remain an opaque magenta Uint8Array", () => {
    // Arrange
    const expectedPixel = new Uint8Array([255, 0, 255, 255]);

    // Act
    const actualPixel = Texture2DConstants.TEXTURE2D_PLACEHOLDER_PIXEL;

    // Assert
    assert.deepEqual(actualPixel, expectedPixel);
});

import test                       from 'node:test';
import assert                     from 'node:assert/strict';
import * as MaterialTestConstants from '../../test-constants/material.js';
import { MaterialTestFixtures }   from '../../helpers/material-test-fixtures.mjs';
import { MtlStandardMaterial }    from '../../../core/material/mtl-standard-material.js';

test("'MtlStandardMaterial' should initialize independent map slots with one owned fallback texture", () => {
    MaterialTestFixtures.withEnvironment((fixture) => {
        // Arrange
        const lastCreatedTextureIndex   = -1;
        const expectedDisabledMapFlag   = 0;
        const expectedEnabledSpecular   = 1;
        const expectedOpticalDensity    = 1;
        const expectedBumpMultiplier    = 1;
        const expectedDisplacementScale = 0.1;
        const expectedMapCount          = MaterialTestConstants.MATERIAL_MAP_CASES.length;
        const expectedConstants         = MaterialTestConstants.MATERIAL_EXPECTED_DEFAULTS;
        const defaultMaterial           = new MtlStandardMaterial(fixture.renderingContext);
        const expectedTexture           = fixture.createdTextures.at(lastCreatedTextureIndex);
        const context                   = fixture.renderingContext;

        // Act
        MaterialTestFixtures.clearCalls(fixture);
        MaterialTestFixtures.apply(defaultMaterial);
        const actualUniforms = MaterialTestFixtures.getUniforms(fixture);

        // Assert
        assert.deepEqual(actualUniforms.get('u_color'), expectedConstants.WHITE);
        assert.deepEqual(actualUniforms.get('u_ambientColor'), expectedConstants.WHITE);
        assert.deepEqual(actualUniforms.get('u_specularColor'), expectedConstants.WHITE);
        assert.deepEqual(actualUniforms.get('u_emissiveColor'), expectedConstants.EMISSIVE);

        assert.equal(actualUniforms.get('u_shininess'), expectedConstants.SHININESS);
        assert.equal(actualUniforms.get('u_specularStrength'), expectedConstants.SPECULAR_STRENGTH);
        assert.equal(actualUniforms.get('u_useSpecular'), expectedEnabledSpecular);
        assert.equal(actualUniforms.get('u_opticalDensity'), expectedOpticalDensity);
        assert.equal(actualUniforms.get('u_bumpMultiplier'), expectedBumpMultiplier);
        assert.equal(actualUniforms.get('u_displacementScale'), expectedDisplacementScale);
        assert.equal(fixture.calls.bindTexture.length, expectedMapCount);

        MaterialTestConstants.MATERIAL_MAP_CASES.forEach(({ sampler, flag, offset, scale, unit }) => {
            assert.equal(actualUniforms.get(sampler), unit);
            assert.equal(actualUniforms.get(flag), expectedDisabledMapFlag);
            assert.deepEqual(actualUniforms.get(offset), expectedConstants.UV_OFFSET);
            assert.deepEqual(actualUniforms.get(scale), expectedConstants.UV_SCALE);
        });

        fixture.calls.bindTexture.forEach((call) => {
            assert.deepEqual(call, [context.TEXTURE_2D, expectedTexture]);
        });
    });
});

test("'MtlStandardMaterial' should apply color and scalar constructor options", () => {
    MaterialTestFixtures.withEnvironment((fixture) => {
        // Arrange
        const expectedOptical          = 1.5;
        const expectedDisabledSpecular = 0;
        const expectedColor            = MaterialTestConstants.MATERIAL_TEST_COLOR;
        const expectedValue            = MaterialTestFixtures.STRENGTH;
        const expectedShine            = MaterialTestFixtures.SHININESS;

        const material = new MtlStandardMaterial(fixture.renderingContext, {
            diffuseColor     : expectedColor,
            ambientColor     : expectedColor,
            specularColor    : new Float32Array(expectedColor),
            emissiveColor    : expectedColor,
            lightDirection   : MaterialTestFixtures.DIRECTION,
            ambientStrength  : expectedValue,
            shininess        : expectedShine,
            specularStrength : expectedValue,
            opticalDensity   : expectedOptical
        });

        // Act
        material.setSpecularEnabled(false);
        material.setBumpMultiplier(expectedValue);
        material.setDisplacementScale(expectedValue);

        MaterialTestFixtures.apply(material);
        const actualUniforms = MaterialTestFixtures.getUniforms(fixture);

        // Assert
        assert.deepEqual(actualUniforms.get('u_color'), expectedColor);
        assert.deepEqual(actualUniforms.get('u_ambientColor'), expectedColor);
        assert.deepEqual(actualUniforms.get('u_specularColor'), expectedColor);
        assert.deepEqual(actualUniforms.get('u_emissiveColor'), expectedColor);

        assert.equal(actualUniforms.get('u_shininess'), expectedShine);
        assert.equal(actualUniforms.get('u_specularStrength'), expectedValue);
        assert.equal(actualUniforms.get('u_opticalDensity'), expectedOptical);
        assert.equal(actualUniforms.get('u_useSpecular'), expectedDisabledSpecular);
        assert.equal(actualUniforms.get('u_bumpMultiplier'), expectedValue);
        assert.equal(actualUniforms.get('u_displacementScale'), expectedValue);

        assert.deepEqual(actualUniforms.get('u_worldMatrix'), MaterialTestFixtures.MATRIX);
        assert.deepEqual(actualUniforms.get('u_cameraPosition'), MaterialTestFixtures.CAMERA_POSITION);
    });
});

for (const mapCase of MaterialTestConstants.MATERIAL_MAP_CASES) {
    test(`'MtlStandardMaterial.${mapCase.method}' should keep its default unit and copy UV overrides`, () => {
        MaterialTestFixtures.withEnvironment((fixture) => {
            // Arrange
            const clearedUvComponent      = 0;
            const expectedEnabledMapFlag  = 1;
            const expectedDisabledMapFlag = 0;
            const expectedOffset          = MaterialTestFixtures.UV_OFFSET;
            const expectedScale           = MaterialTestFixtures.UV_SCALE;
            const material                = new MtlStandardMaterial(fixture.renderingContext);
            const texture                 = MaterialTestFixtures.createTexture(fixture);
            const uvOffset                = Array.from(expectedOffset);
            const uvScale                 = new Float32Array(expectedScale);

            // Act
            material[mapCase.method](texture, { uvOffset, uvScale });
            uvOffset.fill(clearedUvComponent);
            uvScale.fill(clearedUvComponent);

            MaterialTestFixtures.apply(material);
            const actualUniforms = MaterialTestFixtures.getUniforms(fixture);

            // Assert
            assert.equal(actualUniforms.get(mapCase.sampler), mapCase.unit);
            assert.equal(actualUniforms.get(mapCase.flag), expectedEnabledMapFlag);
            assert.deepEqual(actualUniforms.get(mapCase.offset), expectedOffset);
            assert.deepEqual(actualUniforms.get(mapCase.scale), expectedScale);

            MaterialTestConstants.MATERIAL_MAP_CASES.filter((other) => other !== mapCase).forEach((other) => {
                assert.equal(actualUniforms.get(other.sampler), other.unit);
                assert.equal(actualUniforms.get(other.flag), expectedDisabledMapFlag);
            });
        });
    });

    test(`'MtlStandardMaterial.${mapCase.method}' should retain an explicit unit on later replacements`, () => {
        MaterialTestFixtures.withEnvironment((fixture) => {
            // Arrange
            const expectedDisposedState = false;
            const expectedUnit          = MaterialTestFixtures.TEXTURE_UNIT;
            const material              = new MtlStandardMaterial(fixture.renderingContext);
            const first                 = MaterialTestFixtures.createTexture(fixture);
            const second                = MaterialTestFixtures.createTexture(fixture);

            // Act
            material[mapCase.method](first, { textureUnitIndex: expectedUnit });
            material[mapCase.method](second);

            MaterialTestFixtures.apply(material);
            const actualUniforms = MaterialTestFixtures.getUniforms(fixture);

            // Assert
            assert.equal(actualUniforms.get(mapCase.sampler), expectedUnit);
            assert.deepEqual(actualUniforms.get(mapCase.offset), MaterialTestConstants.MATERIAL_EXPECTED_DEFAULTS.UV_OFFSET);
            assert.deepEqual(actualUniforms.get(mapCase.scale), MaterialTestConstants.MATERIAL_EXPECTED_DEFAULTS.UV_SCALE);
            assert.equal(first.isDisposed, expectedDisposedState);
            assert.equal(second.isDisposed, expectedDisposedState);
        });
    });

    test(`'MtlStandardMaterial.${mapCase.method}' should reject invalid settings without changing the map`, () => {
        MaterialTestFixtures.withEnvironment((fixture) => {
            // Arrange
            const expectedDisabledMapFlag = 0;
            const expectedDisposedState   = false;
            const invalidTexture          = null;
            const invalidUnits            = [-1, 0.5, Number.NaN, Number.POSITIVE_INFINITY, '1'];
            const invalidVectors          = [null, {}, [], [1], [1, 2, 3], 'uv'];
            const material                = new MtlStandardMaterial(fixture.renderingContext);
            const texture                 = MaterialTestFixtures.createTexture(fixture);

            // Act & Assert
            assert.throws(() => material[mapCase.method](invalidTexture), {
                name    : 'TypeError',
                message : `\`MtlStandardMaterial.${mapCase.method}\` expects texture as Texture2D.`
            });

            MaterialTestConstants.MATERIAL_INVALID_OPTIONS.forEach((options) => {
                assert.throws(() => material[mapCase.method](texture, options), TypeError);
            });

            invalidUnits.forEach((textureUnitIndex) => {
                assert.throws(() => material[mapCase.method](texture, { textureUnitIndex }), TypeError);
            });

            invalidVectors.forEach((value) => {
                assert.throws(() => material[mapCase.method](texture, { uvOffset: value }), TypeError);
                assert.throws(() => material[mapCase.method](texture, { uvScale: value }), TypeError);
            });

            MaterialTestFixtures.apply(material);
            const actualUniforms = MaterialTestFixtures.getUniforms(fixture);
            assert.equal(actualUniforms.get(mapCase.sampler), mapCase.unit);
            assert.equal(actualUniforms.get(mapCase.flag), expectedDisabledMapFlag);
            assert.equal(texture.isDisposed, expectedDisposedState);
        });
    });
}

test("'MtlStandardMaterial' should reject invalid color and shading updates without changing uniforms", () => {
    MaterialTestFixtures.withEnvironment((fixture) => {
        // Arrange
        const material      = new MtlStandardMaterial(fixture.renderingContext);
        const colorMethods  = ['setAmbientColor', 'setSpecularColor', 'setEmissiveColor'];
        const scalarMethods = ['setShininess', 'setSpecularStrength', 'setOpticalDensity', 'setBumpMultiplier', 'setDisplacementScale'];

        MaterialTestFixtures.apply(material);
        const expectedUniforms = MaterialTestFixtures.getUniforms(fixture);

        // Act & Assert
        colorMethods.forEach((method) => {
            MaterialTestConstants.MATERIAL_INVALID_VECTORS.forEach((value) => {
                assert.throws(() => material[method](value), TypeError);
            });
        });

        scalarMethods.forEach((method) => {
            MaterialTestConstants.MATERIAL_INVALID_NUMBERS.forEach((value) => {
                assert.throws(() => material[method](value), TypeError);
            });
        });

        MaterialTestConstants.MATERIAL_INVALID_BOOLEANS.forEach((value) => {
            assert.throws(() => material.setSpecularEnabled(value), TypeError);
        });

        MaterialTestFixtures.apply(material);
        assert.deepEqual(MaterialTestFixtures.getUniforms(fixture), expectedUniforms);
    });
});

test("'MtlStandardMaterial' should keep instance state independent and leave external map textures alive", () => {
    MaterialTestFixtures.withEnvironment((fixture) => {
        // Arrange
        const expectedDisposedState     = false;
        const expectedDisabledMapFlag   = 0;
        const firstFallbackTextureIndex = -2;
        const first                     = new MtlStandardMaterial(fixture.renderingContext);
        const second                    = new MtlStandardMaterial(fixture.renderingContext);
        const firstFallback             = fixture.createdTextures.at(firstFallbackTextureIndex);
        const texture                   = MaterialTestFixtures.createTexture(fixture);

        // Act
        first.setAmbientColor(MaterialTestConstants.MATERIAL_TEST_COLOR);

        MaterialTestConstants.MATERIAL_MAP_CASES.forEach(({ method }) => {
            first[method](texture, { uvOffset: MaterialTestFixtures.UV_OFFSET });
        });

        // Repeated disposal should not delete the fallback texture again
        first.dispose();
        first.dispose();

        MaterialTestFixtures.apply(second);
        const actualUniforms = MaterialTestFixtures.getUniforms(fixture);

        // Assert
        assert.equal(texture.isDisposed, expectedDisposedState);
        assert.deepEqual(fixture.calls.deleteTexture, [[firstFallback]]);
        assert.deepEqual(actualUniforms.get('u_ambientColor'), MaterialTestConstants.MATERIAL_EXPECTED_DEFAULTS.WHITE);

        MaterialTestConstants.MATERIAL_MAP_CASES.forEach(({ flag, offset }) => {
            assert.equal(actualUniforms.get(flag), expectedDisabledMapFlag);
            assert.deepEqual(actualUniforms.get(offset), MaterialTestConstants.MATERIAL_EXPECTED_DEFAULTS.UV_OFFSET);
        });
    });
});

test("'MtlStandardMaterial' should release its program when fallback texture allocation fails", () => {
    MaterialTestFixtures.withEnvironment((fixture) => {
        // Arrange
        fixture.renderingContext.createTexture = () => null;

        // Act & Assert
        assert.throws(() => new MtlStandardMaterial(fixture.renderingContext), {
            name    : 'Error',
            message : 'Failed to create `WebGLTexture`.'
        });

        const expectedDeletedPrograms = fixture.createdPrograms.map((program) => [program]);
        assert.deepEqual(fixture.calls.deleteProgram, expectedDeletedPrograms);
        assert.deepEqual(fixture.calls.deleteTexture, []);
    });
});

import test                                     from 'node:test';
import assert                                   from 'node:assert/strict';
import * as MaterialTestConstants               from '../../test-constants/material.js';
import { TEXTURED_MATERIAL_EXCEPTION_MESSAGES } from '../../../core/exception-messages/textured-material.js';
import { TexturedMaterial }                     from '../../../core/material/textured-material.js';
import { MaterialTestFixtures }                 from '../../helpers/material-test-fixtures.mjs';

test("'TexturedMaterial' should bind the supplied texture and upload its sampler unit", () => {
    MaterialTestFixtures.withEnvironment((fixture) => {
        // Arrange
        const texture      = MaterialTestFixtures.createTexture(fixture);
        const expectedUnit = MaterialTestFixtures.TEXTURE_UNIT;
        const context      = fixture.renderingContext;
        const material     = new TexturedMaterial(context, { texture, textureUnitIndex: expectedUnit });

        // Act
        MaterialTestFixtures.clearCalls(fixture);
        MaterialTestFixtures.apply(material);

        // Assert
        assert.equal(material.diffuseTexture, texture);
        assert.deepEqual(fixture.calls.useProgram, [[material.shaderProgram.program]]);
        assert.deepEqual(fixture.calls.activeTexture, [[context.TEXTURE0 + expectedUnit]]);
        assert.deepEqual(fixture.calls.bindTexture, [[context.TEXTURE_2D, texture.texture]]);
        assert.equal(MaterialTestFixtures.getUniforms(fixture).get('u_diffuseTexture'), expectedUnit);
    });
});

test("'TexturedMaterial' should preserve external texture and program ownership choices", () => {
    // Arrange
    const ownershipFlags = [false, true];

    ownershipFlags.forEach((ownsTexture) => {
        ownershipFlags.forEach((ownsShaderProgram) => {
            MaterialTestFixtures.withEnvironment((fixture) => {
                // Also arrange
                const texture                 = MaterialTestFixtures.createTexture(fixture);
                const material                = new TexturedMaterial(fixture.renderingContext, { texture, ownsTexture, ownsShaderProgram });
                const program                 = material.shaderProgram;
                const expectedDeletedTextures = ownsTexture ? [[texture.texture]] : [];
                const expectedDeletedPrograms = ownsShaderProgram ? [[program.program]] : [];

                // Act
                material.dispose();
                // Repeated disposal should not delete owned resources again
                material.dispose();

                // Assert
                assert.deepEqual(fixture.calls.deleteTexture, expectedDeletedTextures);
                assert.deepEqual(fixture.calls.deleteProgram, expectedDeletedPrograms);
                assert.equal(texture.isDisposed, ownsTexture);
            });
        });
    });
});

test("'TexturedMaterial' should validate options before creating a program or texture", () => {
    MaterialTestFixtures.withEnvironment((fixture) => {
        // Arrange
        const invalidTexture    = null;
        const invalidContainers = MaterialTestConstants.MATERIAL_INVALID_OPTIONS.filter((value) => !Array.isArray(value));
        const invalidUnits      = [-1, 0.5, Number.NaN, Number.POSITIVE_INFINITY, '1'];
        const expectedOptions   = { name: 'TypeError', message: TEXTURED_MATERIAL_EXCEPTION_MESSAGES.OPTIONS_OBJECT };
        const expectedTexture   = { name: 'TypeError', message: TEXTURED_MATERIAL_EXCEPTION_MESSAGES.TEXTURE_TYPE };
        const expectedUnit      = { name: 'TypeError', message: TEXTURED_MATERIAL_EXCEPTION_MESSAGES.TEXTURE_UNIT_TYPE };

        // Act & Assert
        invalidContainers.forEach((options) => {
            assert.throws(() => new TexturedMaterial(fixture.renderingContext, options), expectedOptions);
        });

        assert.throws(() => new TexturedMaterial(fixture.renderingContext, { texture: invalidTexture }), expectedTexture);

        invalidUnits.forEach((textureUnitIndex) => {
            assert.throws(() => new TexturedMaterial(fixture.renderingContext, { textureUnitIndex }), expectedUnit);
        });

        MaterialTestConstants.MATERIAL_INVALID_BOOLEANS.forEach((value) => {
            assert.throws(() => new TexturedMaterial(fixture.renderingContext, { ownsTexture: value }), TypeError);
            assert.throws(() => new TexturedMaterial(fixture.renderingContext, { ownsShaderProgram: value }), TypeError);
        });

        assert.deepEqual(fixture.createdPrograms, []);
        assert.deepEqual(fixture.createdTextures, []);
    });
});

test("'TexturedMaterial' should preserve the existing acceptance of array option containers", () => {
    MaterialTestFixtures.withEnvironment((fixture) => {
        // Arrange & Act
        const material = new TexturedMaterial(fixture.renderingContext, []);

        // Assert
        assert.equal(material.diffuseTexture.isDisposed, false);
        assert.doesNotThrow(() => material.setDiffuseTexture(material.diffuseTexture, []));
    });
});

test("'TexturedMaterial.setDiffuseTexture' should validate a replacement before releasing the owned texture", () => {
    MaterialTestFixtures.withEnvironment((fixture) => {
        // Arrange
        const invalidTexture        = null;
        const expectedDisposedState = false;
        const material              = new TexturedMaterial(fixture.renderingContext);
        const originalTexture       = material.diffuseTexture;
        const replacement           = MaterialTestFixtures.createTexture(fixture);
        const invalidOptions        = MaterialTestConstants.MATERIAL_INVALID_OPTIONS.filter((value) => !Array.isArray(value));

        // Act & Assert
        assert.throws(() => material.setDiffuseTexture(invalidTexture), TypeError);

        invalidOptions.forEach((options) => {
            assert.throws(() => material.setDiffuseTexture(replacement, options), TypeError);
        });

        MaterialTestConstants.MATERIAL_INVALID_BOOLEANS.forEach((ownsTexture) => {
            assert.throws(() => material.setDiffuseTexture(replacement, { ownsTexture }), TypeError);
        });

        assert.equal(material.diffuseTexture, originalTexture);
        assert.equal(originalTexture.isDisposed, expectedDisposedState);
        assert.deepEqual(fixture.calls.deleteTexture, []);
    });
});

test("'TexturedMaterial.setDiffuseTexture' should release owned replacements but keep borrowed textures alive", () => {
    MaterialTestFixtures.withEnvironment((fixture) => {
        // Arrange
        const ownsReplacementTexture               = true;
        const expectedOwnedTextureDisposedState    = true;
        const expectedBorrowedTextureDisposedState = false;

        const borrowed          = MaterialTestFixtures.createTexture(fixture);
        const replacement       = MaterialTestFixtures.createTexture(fixture);
        const finalTexture      = MaterialTestFixtures.createTexture(fixture);
        const material          = new TexturedMaterial(fixture.renderingContext, { texture: borrowed });
        const replacementHandle = replacement.texture;

        // Act
        material.setDiffuseTexture(replacement, { ownsTexture: ownsReplacementTexture });
        material.setDiffuseTexture(finalTexture);
        material.dispose();

        // Assert
        assert.equal(borrowed.isDisposed, expectedBorrowedTextureDisposedState);
        assert.equal(replacement.isDisposed, expectedOwnedTextureDisposedState);
        assert.equal(finalTexture.isDisposed, expectedBorrowedTextureDisposedState);
        assert.deepEqual(fixture.calls.deleteTexture, [[replacementHandle]]);
    });
});

test("'TexturedMaterial.setDiffuseTexture' should not delete a texture when assigning the same instance", () => {
    // Arrange
    const ownershipFlags = [false, true];

    ownershipFlags.forEach((ownsTexture) => {
        MaterialTestFixtures.withEnvironment((fixture) => {
            // Also arrange
            const material                = new TexturedMaterial(fixture.renderingContext);
            const texture                 = material.diffuseTexture;
            const expectedDeletedTextures = ownsTexture ? [[texture.texture]] : [];
            const expectedDisposedState   = false;

            // Act & Assert
            material.setDiffuseTexture(texture, { ownsTexture });
            MaterialTestFixtures.apply(material);
            assert.equal(texture.isDisposed, expectedDisposedState);
            assert.deepEqual(fixture.calls.deleteTexture, []);

            // Act & Assert
            material.dispose();
            assert.deepEqual(fixture.calls.deleteTexture, expectedDeletedTextures);
        });
    });
});

test("'TexturedMaterial' should release its new program when fallback texture creation fails", () => {
    // Arrange
    const failedTextureCreationResult = null;
    const ownershipFlags              = [false, true];

    ownershipFlags.forEach((ownsShaderProgram) => {
        MaterialTestFixtures.withEnvironment((fixture) => {
            // Also arrange
            fixture.renderingContext.createTexture = () => failedTextureCreationResult;

            // Act & Assert
            assert.throws(() => new TexturedMaterial(fixture.renderingContext, { ownsShaderProgram }), {
                name    : 'Error',
                message : 'Failed to create `WebGLTexture`.'
            });

            const expectedDeletedPrograms = fixture.createdPrograms.map((program) => [program]);
            assert.deepEqual(fixture.calls.deleteProgram, expectedDeletedPrograms);
        });
    });
});

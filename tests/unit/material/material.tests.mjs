import test                            from 'node:test';
import assert                          from 'node:assert/strict';
import { MATERIAL_EXCEPTION_MESSAGES } from '../../../core/exception-messages/material.js';
import { Material }                    from '../../../core/material/material.js';
import { DirectionalLightMaterial }    from '../../../core/material/directional-light-material.js';
import { MaterialTestFixtures }        from '../../helpers/material-test-fixtures.mjs';
import { ShaderProgramTestFixtures }   from '../../helpers/shader-program-test-fixtures.mjs';
import * as MaterialTestConstants      from '../../test-constants/material.js';

for (const { MaterialClass, ownsProgram, applyLength } of MaterialTestFixtures.createCases()) {
    test(`'${MaterialClass.name}' should preserve the shared material state and renderer contract`, () => {
        MaterialTestFixtures.withEnvironment((fixture) => {
            // Arrange
            const expectedOpacity = MaterialTestConstants.MATERIAL_EXPECTED_DEFAULTS.OPACITY;

            // Act
            const material = MaterialTestFixtures.createMaterial(fixture, MaterialClass);

            // Assert
            assert.equal(material instanceof Material, true);
            assert.equal(material.webglContext, fixture.renderingContext);
            assert.equal(material.shaderProgram.program, fixture.createdPrograms.at(-1));
            assert.equal(material.opacity, expectedOpacity);
            assert.equal(material.isTransparent(), false);
            assert.equal(material.isWireframeEnabled(), false);
            assert.equal(material.isDisposed, false);

            if (applyLength !== null) {
                assert.equal(material.apply.length, applyLength);
            }
        });
    });

    test(`'${MaterialClass.name}' should update opacity and wireframe state through the shared API`, () => {
        MaterialTestFixtures.withEnvironment((fixture) => {
            // Arrange
            const expectedOpacity = MaterialTestFixtures.OPACITY;
            const material        = MaterialTestFixtures.createMaterial(fixture, MaterialClass);

            // Act & Assert
            material.setOpacity(expectedOpacity);
            material.setWireframeEnabled(true);
            material.use();
            assert.equal(material.opacity, expectedOpacity);
            assert.equal(material.isTransparent(), true);
            assert.equal(material.isWireframeEnabled(), true);
            assert.deepEqual(fixture.calls.useProgram, [[material.shaderProgram.program]]);

            // Act & Assert
            material.toggleWireframe();
            assert.equal(material.isWireframeEnabled(), false);
        });
    });

    test(`'${MaterialClass.name}' should dispose owned resources once and reject further base operations`, () => {
        MaterialTestFixtures.withEnvironment((fixture) => {
            // Arrange
            const material                = MaterialTestFixtures.createMaterial(fixture, MaterialClass);
            const program                 = material.shaderProgram;
            const expectedDeletedPrograms = ownsProgram ? [[program.program]] : [];
            const expectedDeletedTextures = fixture.createdTextures.map((texture) => [texture]);
            const expectedError           = { name: 'Error', message: MATERIAL_EXCEPTION_MESSAGES.INSTANCE_DISPOSED };
            const operations              = [
                () => material.webglContext,
                () => material.shaderProgram,
                () => material.opacity,
                () => material.setOpacity(MaterialTestFixtures.OPACITY),
                () => material.isTransparent(),
                () => material.use(),
                () => material.setWireframeEnabled(true),
                () => material.toggleWireframe(),
                () => material.isWireframeEnabled()
            ];

            // Act
            material.dispose();
            material.dispose();

            // Assert
            assert.equal(material.isDisposed, true);
            assert.deepEqual(fixture.calls.deleteProgram, expectedDeletedPrograms);
            assert.deepEqual(fixture.calls.deleteTexture, expectedDeletedTextures);

            operations.forEach((operation) => {
                assert.throws(operation, expectedError);
            });

            if (applyLength !== null) {
                assert.throws(() => MaterialTestFixtures.apply(material), expectedError);
            }

            if (!ownsProgram) {
                assert.doesNotThrow(() => program.use());
                program.dispose();
            }
        });
    });
}

test("'Material' should validate constructor arguments before accepting ownership", () => {
    MaterialTestFixtures.withEnvironment((fixture) => {
        // Arrange
        const invalidInstances = [undefined, null, {}, []];
        const expectedContext  = { name: 'TypeError', message: MATERIAL_EXCEPTION_MESSAGES.WEBGL_CONTEXT_TYPE };
        const expectedProgram  = { name: 'TypeError', message: MATERIAL_EXCEPTION_MESSAGES.SHADER_PROGRAM_TYPE };
        const expectedOptions  = { name: 'TypeError', message: MATERIAL_EXCEPTION_MESSAGES.OPTIONS_OBJECT };
        const expectedOwner    = { name: 'TypeError', message: MATERIAL_EXCEPTION_MESSAGES.OWNERSHIP_TYPE };
        const context          = fixture.renderingContext;
        const program          = ShaderProgramTestFixtures.createProgram(fixture);

        // Act & Assert
        invalidInstances.forEach((value) => {
            assert.throws(() => new Material(value, program), expectedContext);
            assert.throws(() => new Material(context, value), expectedProgram);
        });

        MaterialTestConstants.MATERIAL_INVALID_OPTIONS.forEach((options) => {
            assert.throws(() => new Material(context, program, options), expectedOptions);
        });

        MaterialTestConstants.MATERIAL_INVALID_BOOLEANS.forEach((ownsShaderProgram) => {
            assert.throws(() => new Material(context, program, { ownsShaderProgram }), expectedOwner);
        });

        assert.deepEqual(fixture.calls.deleteProgram, []);
        assert.doesNotThrow(() => program.use());
    });
});

test("'Material' should release an explicitly owned program", () => {
    MaterialTestFixtures.withEnvironment((fixture) => {
        // Arrange
        const material                = MaterialTestFixtures.createMaterial(fixture, Material, { ownsShaderProgram: true });
        const expectedDeletedPrograms = [[material.shaderProgram.program]];

        // Act
        material.dispose();

        // Assert
        assert.deepEqual(fixture.calls.deleteProgram, expectedDeletedPrograms);
    });
});

test("'Material.setOpacity' should reject invalid values without changing opacity", () => {
    MaterialTestFixtures.withEnvironment((fixture) => {
        // Arrange
        const invalidRanges   = [-0.1, 1.1];
        const expectedType    = { name: 'TypeError' , message: MATERIAL_EXCEPTION_MESSAGES.OPACITY_TYPE };
        const expectedRange   = { name: 'RangeError', message: MATERIAL_EXCEPTION_MESSAGES.OPACITY_RANGE };
        const material        = MaterialTestFixtures.createMaterial(fixture, Material);
        const expectedOpacity = material.opacity;

        // Act & Assert
        MaterialTestConstants.MATERIAL_INVALID_NUMBERS.forEach((value) => {
            assert.throws(() => material.setOpacity(value), expectedType);
            assert.equal(material.opacity, expectedOpacity);
        });

        invalidRanges.forEach((value) => {
            assert.throws(() => material.setOpacity(value), expectedRange);
            assert.equal(material.opacity, expectedOpacity);
        });
    });
});

test("'Material' should preserve opacity boundaries and wireframe boolean coercion", () => {
    MaterialTestFixtures.withEnvironment((fixture) => {
        // Arrange
        const opacityCases = [[0, true], [1, false]];
        const flagCases    = [[0, false], ['', false], [null, false], ['enabled', true], [{}, true]];
        const material     = MaterialTestFixtures.createMaterial(fixture, Material);

        // Act & Assert
        opacityCases.forEach(([opacity, expectedTransparent]) => {
            material.setOpacity(opacity);
            assert.equal(material.opacity, opacity);
            assert.equal(material.isTransparent(), expectedTransparent);
        });

        flagCases.forEach(([value, expectedEnabled]) => {
            material.setWireframeEnabled(value);
            assert.equal(material.isWireframeEnabled(), expectedEnabled);
        });
    });
});

test("'DirectionalLightMaterial' should leave a borrowed program alive when disposed", () => {
    MaterialTestFixtures.withEnvironment((fixture) => {
        // Arrange
        const material = MaterialTestFixtures.createMaterial(fixture, DirectionalLightMaterial, {}, { ownsShaderProgram: false });
        const program  = material.shaderProgram;

        // Act
        material.dispose();

        // Assert
        assert.deepEqual(fixture.calls.deleteProgram, []);
        assert.doesNotThrow(() => program.use());
    });
});

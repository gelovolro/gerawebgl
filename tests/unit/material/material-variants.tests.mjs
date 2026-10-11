import test                       from 'node:test';
import assert                     from 'node:assert/strict';
import * as MaterialTestConstants from '../../test-constants/material.js';
import { MaterialTestFixtures }   from '../../helpers/material-test-fixtures.mjs';
import { SolidColorMaterial }     from '../../../core/material/solid-color-material.js';
import { PointsMaterial }         from '../../../core/material/points-material.js';
import { LambertMaterial }        from '../../../core/material/lambert-material.js';
import { PhongMaterial }          from '../../../core/material/phong-material.js';
import { MtlStandardMaterial }    from '../../../core/material/mtl-standard-material.js';

for (const { MaterialClass, applyLength } of MaterialTestFixtures.createCases().filter(({ applyLength }) => applyLength !== null)) {
    test(`'${MaterialClass.name}' should upload its transform and opacity`, () => {
        MaterialTestFixtures.withEnvironment((fixture) => {
            // Arrange
            const matrixOnlyApplyParameterCount = 1;
            const expectedOpacity               = MaterialTestFixtures.OPACITY;
            const material                      = MaterialTestFixtures.createMaterial(fixture, MaterialClass);
            material.setOpacity(expectedOpacity);

            // Act
            MaterialTestFixtures.apply(material);
            const actualUniforms = MaterialTestFixtures.getUniforms(fixture);

            // Assert
            assert.deepEqual(actualUniforms.get('u_matrix'), MaterialTestFixtures.MATRIX);
            assert.equal(actualUniforms.get('u_opacity'), expectedOpacity);

            if (applyLength > matrixOnlyApplyParameterCount) {
                assert.deepEqual(actualUniforms.get('u_worldInverseTranspose'), MaterialTestFixtures.MATRIX);
            }
        });
    });
}

for (const MaterialClass of [SolidColorMaterial, PointsMaterial, LambertMaterial, PhongMaterial, MtlStandardMaterial]) {
    test(`'${MaterialClass.name}' should reject invalid option containers before program allocation`, () => {
        MaterialTestFixtures.withEnvironment((fixture) => {
            // Arrange
            const invalidOptions = MaterialTestConstants.MATERIAL_INVALID_OPTIONS;

            // Act & Assert
            invalidOptions.forEach((options) => {
                assert.throws(() => new MaterialClass(fixture.renderingContext, options), TypeError);
            });

            assert.deepEqual(fixture.createdPrograms, []);
            assert.deepEqual(fixture.createdTextures, []);
        });
    });
}

for (const MaterialClass of [SolidColorMaterial, PointsMaterial]) {
    test(`'${MaterialClass.name}' should copy RGB inputs and preserve its per-instance buffer`, () => {
        MaterialTestFixtures.withEnvironment((fixture) => {
            // Arrange
            const blackColorComponent = 0;
            const expectedColor       = new Float32Array(MaterialTestConstants.MATERIAL_TEST_COLOR);
            const expectedDefault     = new Float32Array(MaterialTestConstants.MATERIAL_EXPECTED_DEFAULTS.WHITE);
            const input               = Array.from(expectedColor);
            const first               = new MaterialClass(fixture.renderingContext, { color: input });
            const second              = new MaterialClass(fixture.renderingContext);
            const originalBuffer      = first.color;

            // Act
            input.fill(blackColorComponent);
            first.setColor(expectedColor);
            MaterialTestFixtures.apply(first);

            // Assert
            assert.equal(first.color, originalBuffer);
            assert.notEqual(first.color, expectedColor);
            assert.deepEqual(first.color, expectedColor);
            assert.deepEqual(second.color, expectedDefault);
            assert.deepEqual(MaterialTestFixtures.getUniforms(fixture).get('u_color'), Array.from(expectedColor));
        });
    });

    test(`'${MaterialClass.name}' should reject invalid color containers and lengths`, () => {
        MaterialTestFixtures.withEnvironment((fixture) => {
            // Arrange
            const material      = new MaterialClass(fixture.renderingContext);
            const expectedColor = material.color.slice();

            // Act & Assert
            MaterialTestConstants.MATERIAL_INVALID_VECTORS.forEach((color) => {
                assert.throws(() => material.setColor(color), TypeError);
                assert.deepEqual(material.color, expectedColor);
            });
        });
    });
}

test("'PointsMaterial' should preserve default point settings and upload explicit overrides", () => {
    MaterialTestFixtures.withEnvironment((fixture) => {
        // Arrange
        const expectedPointSize               = MaterialTestFixtures.POINT_SIZE;
        const expectedEnabledVertexColorFlag  = 1;
        const expectedDisabledVertexColorFlag = 0;

        const defaults = new PointsMaterial(fixture.renderingContext);
        const material = new PointsMaterial(fixture.renderingContext, {
            pointSize       : expectedPointSize,
            useVertexColors : true
        });

        // Act & Assert
        MaterialTestFixtures.apply(material);
        assert.equal(defaults.pointSize, MaterialTestConstants.MATERIAL_EXPECTED_DEFAULTS.POINT_SIZE);
        assert.equal(defaults.useVertexColors, false);
        assert.equal(material.pointSize, expectedPointSize);
        assert.equal(material.useVertexColors, true);
        assert.equal(MaterialTestFixtures.getUniforms(fixture).get('u_pointSize'), expectedPointSize);
        assert.equal(MaterialTestFixtures.getUniforms(fixture).get('u_useVertexColor'), expectedEnabledVertexColorFlag);

        // Act & Assert
        material.setUseVertexColors(false);
        MaterialTestFixtures.apply(material);
        assert.equal(material.useVertexColors, false);
        assert.equal(MaterialTestFixtures.getUniforms(fixture).get('u_useVertexColor'), expectedDisabledVertexColorFlag);
    });
});

test("'PointsMaterial' should reject invalid point sizes and vertex color flags without changing state", () => {
    MaterialTestFixtures.withEnvironment((fixture) => {
        // Arrange
        const invalidSizes      = [0, -1];
        const material          = new PointsMaterial(fixture.renderingContext);
        const expectedPointSize = material.pointSize;

        // Act & Assert
        MaterialTestConstants.MATERIAL_INVALID_NUMBERS.forEach((size) => {
            assert.throws(() => material.setPointSize(size), TypeError);
        });

        invalidSizes.forEach((size) => {
            assert.throws(() => material.setPointSize(size), RangeError);
        });

        MaterialTestConstants.MATERIAL_INVALID_BOOLEANS.forEach((value) => {
            assert.throws(() => material.setUseVertexColors(value), TypeError);
        });

        assert.equal(material.pointSize, expectedPointSize);
        assert.equal(material.useVertexColors, false);
    });
});

test("'PhongMaterial' should preserve specular defaults and apply constructor overrides", () => {
    MaterialTestFixtures.withEnvironment((fixture) => {
        // Arrange
        const worldMatrixMultiplier = 2;
        const expectedStrength      = MaterialTestFixtures.STRENGTH;
        const expectedShine         = MaterialTestFixtures.SHININESS;
        const expectedColor         = new Float32Array(MaterialTestConstants.MATERIAL_TEST_COLOR);
        const expectedWorld         = new Float32Array(MaterialTestFixtures.MATRIX.map((value) => value * worldMatrixMultiplier));
        const expectedCamera        = new Float32Array(MaterialTestFixtures.CAMERA_POSITION);
        const defaultMaterial       = new PhongMaterial(fixture.renderingContext);
        const configuredMaterial    = new PhongMaterial(fixture.renderingContext, {
            specularColor    : expectedColor,
            specularStrength : expectedStrength,
            shininess        : expectedShine
        });

        // Act
        configuredMaterial.applyAdditionalUniforms(expectedWorld, expectedCamera);
        const actualUniforms = MaterialTestFixtures.getUniforms(fixture);

        // Assert
        assert.deepEqual(defaultMaterial.specularColor, new Float32Array(MaterialTestConstants.MATERIAL_EXPECTED_DEFAULTS.WHITE));
        assert.equal(defaultMaterial.specularStrength, MaterialTestConstants.MATERIAL_EXPECTED_DEFAULTS.SPECULAR_STRENGTH);
        assert.equal(defaultMaterial.shininess, MaterialTestConstants.MATERIAL_EXPECTED_DEFAULTS.SHININESS);

        assert.deepEqual(configuredMaterial.specularColor, expectedColor);
        assert.notEqual(configuredMaterial.specularColor, expectedColor);
        assert.equal(configuredMaterial.specularStrength, expectedStrength);
        assert.equal(configuredMaterial.shininess, expectedShine);

        assert.deepEqual(actualUniforms.get('u_specularColor'), Array.from(expectedColor));
        assert.equal(actualUniforms.get('u_specularStrength'), expectedStrength);
        assert.equal(actualUniforms.get('u_shininess'), expectedShine);
        assert.deepEqual(actualUniforms.get('u_worldMatrix'), Array.from(expectedWorld));
        assert.deepEqual(actualUniforms.get('u_cameraPosition'), Array.from(expectedCamera));
    });
});

test("'PhongMaterial' should reject invalid specular values without changing existing settings", () => {
    MaterialTestFixtures.withEnvironment((fixture) => {
        // Arrange
        const material         = new PhongMaterial(fixture.renderingContext);
        const expectedColor    = material.specularColor.slice();
        const expectedStrength = material.specularStrength;
        const expectedShine    = material.shininess;

        // Act & Assert
        MaterialTestConstants.MATERIAL_INVALID_VECTORS.forEach((color) => {
            assert.throws(() => material.setSpecularColor(color), TypeError);
        });

        MaterialTestConstants.MATERIAL_INVALID_NUMBERS.forEach((value) => {
            assert.throws(() => material.setSpecularStrength(value), TypeError);
            assert.throws(() => material.setShininess(value), TypeError);
        });

        assert.deepEqual(material.specularColor, expectedColor);
        assert.equal(material.specularStrength, expectedStrength);
        assert.equal(material.shininess, expectedShine);
    });
});

for (const { MaterialClass, options } of [
    { MaterialClass: SolidColorMaterial,  options: { color: [] } },
    { MaterialClass: PointsMaterial,      options: { pointSize: 0 } },
    { MaterialClass: LambertMaterial,     options: { lightDirection: [0, 0, 0] } },
    { MaterialClass: PhongMaterial,       options: { shininess: Number.NaN } },
    { MaterialClass: MtlStandardMaterial, options: { shininess: Number.NaN } }
]) {
    test(`'${MaterialClass.name}' should release every allocation when initialization fails`, () => {
        MaterialTestFixtures.withEnvironment((fixture) => {
            // Act & Assert
            assert.throws(() => new MaterialClass(fixture.renderingContext, options));

            const expectedDeletedPrograms = fixture.createdPrograms.map((program) => [program]);
            const expectedDeletedTextures = fixture.createdTextures.map((texture) => [texture]);
            const emptyProgramCount       = 0;

            assert.notEqual(fixture.createdPrograms.length, emptyProgramCount);
            assert.deepEqual(fixture.calls.deleteProgram, expectedDeletedPrograms);
            assert.deepEqual(fixture.calls.deleteTexture, expectedDeletedTextures);
        });
    });
}

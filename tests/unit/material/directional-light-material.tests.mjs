import test                                              from 'node:test';
import assert                                            from 'node:assert/strict';
import { MATH_NON_FINITE_VALUES }                        from '../../test-constants/math.js';
import * as MaterialTestConstants                        from '../../test-constants/material.js';
import { DIRECTIONAL_LIGHT_MATERIAL_EXCEPTION_MESSAGES } from '../../../core/exception-messages/directional-light-material.js';
import { DirectionalLightMaterial }                      from '../../../core/material/directional-light-material.js';
import { MaterialTestFixtures }                          from '../../helpers/material-test-fixtures.mjs';
import { ShaderProgramTestFixtures }                     from '../../helpers/shader-program-test-fixtures.mjs';
import { TestConstants }                                 from '../../helpers/test-constants.js';

for (const { MaterialClass } of MaterialTestFixtures.createDirectionalCases()) {
    test(`'${MaterialClass.name}' should normalize lighting settings and upload their current values`, () => {
        MaterialTestFixtures.withEnvironment((fixture) => {
            // Arrange
            const material          = MaterialTestFixtures.createMaterial(fixture, MaterialClass);
            const expectedColor     = new Float32Array(MaterialTestConstants.MATERIAL_TEST_COLOR);
            const expectedDirection = new Float32Array(MaterialTestFixtures.UNIT_DIRECTION);
            const expectedStrength  = MaterialTestFixtures.STRENGTH;
            const expectedOpacity   = MaterialTestFixtures.OPACITY;

            // Act
            material.setColor(expectedColor);
            material.setLightDirection(MaterialTestFixtures.DIRECTION);
            material.setAmbientStrength(expectedStrength);
            material.setDirectionalStrength(expectedStrength);
            material.setLightingEnabled(false);
            material.setOpacity(expectedOpacity);
            MaterialTestFixtures.apply(material);

            // Assert
            assert.deepEqual(material.color, expectedColor);
            assert.deepEqual(material.lightDirection, expectedDirection);
            assert.equal(material.ambientStrength, expectedStrength);
            assert.equal(material.directionalStrength, expectedStrength);
            assert.equal(material.getDirectionalStrength(), expectedStrength);
            assert.equal(material.isLightingEnabled(), false);

            const actualUniforms = MaterialTestFixtures.getUniforms(fixture);
            assert.deepEqual(actualUniforms.get('u_color'), Array.from(expectedColor));
            assert.deepEqual(actualUniforms.get('u_lightDirection'), Array.from(expectedDirection));
            assert.equal(actualUniforms.get('u_ambientStrength'), expectedStrength);
            assert.equal(actualUniforms.get('u_directionalStrength'), expectedStrength);
            assert.equal(actualUniforms.get('u_lightingEnabled'), 0);
            assert.equal(actualUniforms.get('u_opacity'), expectedOpacity);
            assert.deepEqual(actualUniforms.get('u_matrix'), MaterialTestFixtures.MATRIX);
            assert.deepEqual(actualUniforms.get('u_worldInverseTranspose'), MaterialTestFixtures.MATRIX);
        });
    });
}

test("'DirectionalLightMaterial' should apply every supplied constructor setting", () => {
    MaterialTestFixtures.withEnvironment((fixture) => {
        // Arrange
        const expectedColor    = MaterialTestConstants.MATERIAL_TEST_COLOR;
        const expectedStrength = MaterialTestFixtures.STRENGTH;
        const options          = {
            color               : expectedColor,
            lightDirection      : MaterialTestFixtures.DIRECTION,
            ambientStrength     : expectedStrength,
            directionalStrength : expectedStrength,
            lightingEnabled     : true
        };

        // Act
        const material = MaterialTestFixtures.createMaterial(fixture, DirectionalLightMaterial, options);

        // Assert
        assert.deepEqual(material.color, new Float32Array(expectedColor));
        assert.deepEqual(material.lightDirection, new Float32Array(MaterialTestFixtures.UNIT_DIRECTION));
        assert.equal(material.ambientStrength, expectedStrength);
        assert.equal(material.directionalStrength, expectedStrength);
        assert.equal(material.isLightingEnabled(), true);
    });
});

test("'DirectionalLightMaterial' should validate its context, program, options and ownership flag", () => {
    MaterialTestFixtures.withEnvironment((fixture) => {
        // Arrange
        const context         = fixture.renderingContext;
        const program         = ShaderProgramTestFixtures.createProgram(fixture);
        const invalidContexts = [undefined, null, {}, []];
        const expectedContext = { name: 'TypeError', message: DIRECTIONAL_LIGHT_MATERIAL_EXCEPTION_MESSAGES.WEBGL_CONTEXT_TYPE };
        const expectedProgram = { name: 'TypeError', message: DIRECTIONAL_LIGHT_MATERIAL_EXCEPTION_MESSAGES.SHADER_PROGRAM_TYPE };
        const expectedOwner   = { name: 'TypeError', message: DIRECTIONAL_LIGHT_MATERIAL_EXCEPTION_MESSAGES.OWNS_SHADER_PROGRAM_TYPE };
        const expectedOptions = { name: 'TypeError', message: '`DirectionalLightMaterial` expects an options object (plain object).' };

        // Act & Assert
        invalidContexts.forEach((value) => {
            assert.throws(() => new DirectionalLightMaterial(value, program), expectedContext);
            assert.throws(() => new DirectionalLightMaterial(context, value), expectedProgram);
        });

        MaterialTestConstants.MATERIAL_INVALID_OPTIONS.forEach((options) => {
            assert.throws(() => new DirectionalLightMaterial(context, program, options), expectedOptions);
            assert.throws(() => new DirectionalLightMaterial(context, program, {}, options), expectedOptions);
        });

        MaterialTestConstants.MATERIAL_INVALID_BOOLEANS.forEach((ownsShaderProgram) => {
            assert.throws(() => new DirectionalLightMaterial(context, program, {}, { ownsShaderProgram }), expectedOwner);
        });

        assert.deepEqual(fixture.calls.deleteProgram, []);
    });
});

test("'DirectionalLightMaterial' should release only owned programs when initialization fails", () => {
    // Arrange
    const ownershipCases = [false, true];

    ownershipCases.forEach((ownsShaderProgram) => {
        MaterialTestFixtures.withEnvironment((fixture) => {
            // Also arrange
            const shaderProgram           = ShaderProgramTestFixtures.createProgram(fixture);
            const expectedDeletedPrograms = ownsShaderProgram ? [[shaderProgram.program]] : [];
            const options                 = { color: [] };
            const expectedError           = { name: 'TypeError', message: '`DirectionalLightMaterial.setColor` expects exactly 3 components [x, y, z].' };

            // Act & Assert

            /* eslint-disable indent */
            assert.throws(() => new DirectionalLightMaterial(
                    fixture.renderingContext,
                    shaderProgram,
                    options,
                    { ownsShaderProgram }
                ), expectedError
            );
            /* eslint-enable indent */

            assert.deepEqual(fixture.calls.deleteProgram, expectedDeletedPrograms);
        });
    });
});

test("'DirectionalLightMaterial.assertVector3' should preserve method names in validation errors", () => {
    // Arrange
    const methodName    = 'custom$&method';
    const expectedError = { name: 'TypeError', message: 'custom$&method expects a number[] or Float32Array.' };

    // Act & Assert
    assert.throws(() => DirectionalLightMaterial.assertVector3(methodName, null), expectedError);
});

test("'DirectionalLightMaterial' should reject invalid vectors without changing its buffers", () => {
    MaterialTestFixtures.withEnvironment((fixture) => {
        // Arrange
        const material          = MaterialTestFixtures.createMaterial(fixture, DirectionalLightMaterial);
        const expectedColor     = material.color.slice();
        const expectedDirection = material.lightDirection.slice();
        const invalidVectors    = [...MaterialTestConstants.MATERIAL_INVALID_VECTORS];

        // Non-finite values are placed in each component to check every validation branch
        MATH_NON_FINITE_VALUES.forEach((value) => {
            invalidVectors.push(
                [value, 1, 1],
                [1, value, 1],
                [1, 1, value]
            );
        });

        // Act & Assert
        invalidVectors.forEach((vector) => {
            assert.throws(() => material.setColor(vector), TypeError);
            assert.throws(() => material.setLightDirection(vector), TypeError);
            assert.deepEqual(material.color, expectedColor);
            assert.deepEqual(material.lightDirection, expectedDirection);
        });
    });
});

test("'DirectionalLightMaterial.setLightDirection' should reject zero and unrepresentable squared lengths", () => {
    MaterialTestFixtures.withEnvironment((fixture) => {
        // Arrange
        const material          = MaterialTestFixtures.createMaterial(fixture, DirectionalLightMaterial);
        const expectedDirection = material.lightDirection.slice();
        const invalidDirections = [[0, 0, 0], [Number.MAX_VALUE, 0, 0], [Number.MIN_VALUE, 0, 0]];
        const expectedError     = { name: 'TypeError', message: DIRECTIONAL_LIGHT_MATERIAL_EXCEPTION_MESSAGES.LIGHT_DIRECTION_LENGTH };

        // Act & Assert
        invalidDirections.forEach((direction) => {
            assert.throws(() => material.setLightDirection(direction), expectedError);
            assert.deepEqual(material.lightDirection, expectedDirection);
        });
    });
});

test("'DirectionalLightMaterial' should keep vector buffers independent between instances", () => {
    MaterialTestFixtures.withEnvironment((fixture) => {
        // Arrange
        const expectedDirectionLength = 1;
        const first                   = MaterialTestFixtures.createMaterial(fixture, DirectionalLightMaterial);
        const second                  = MaterialTestFixtures.createMaterial(fixture, DirectionalLightMaterial);
        const expectedColor           = second.color.slice();
        const input                   = new Float32Array(MaterialTestFixtures.DIRECTION);
        const originalInput           = input.slice();

        // Act
        first.setColor(MaterialTestConstants.MATERIAL_TEST_COLOR);
        first.setLightDirection(input);

        // Assert
        assert.notEqual(first.color, second.color);
        assert.notEqual(first.lightDirection, second.lightDirection);
        assert.deepEqual(second.color, expectedColor);
        assert.deepEqual(input, originalInput);
        assert.ok(Math.abs(Math.hypot(...first.lightDirection) - expectedDirectionLength) < TestConstants.DEFAULT_EPSILON_VALUE);
    });
});

test("'DirectionalLightMaterial' should preserve strengths after invalid numeric updates", () => {
    MaterialTestFixtures.withEnvironment((fixture) => {
        // Arrange
        const material            = MaterialTestFixtures.createMaterial(fixture, DirectionalLightMaterial);
        const expectedAmbient     = material.ambientStrength;
        const expectedDirectional = material.directionalStrength;

        // Act & Assert
        MaterialTestConstants.MATERIAL_INVALID_NUMBERS.forEach((value) => {
            assert.throws(() => material.setAmbientStrength(value), TypeError);
            assert.throws(() => material.setDirectionalStrength(value), TypeError);
            assert.equal(material.ambientStrength, expectedAmbient);
            assert.equal(material.directionalStrength, expectedDirectional);
        });
    });
});

test("'DirectionalLightMaterial' should preserve directional toggling and fractional lighting", () => {
    MaterialTestFixtures.withEnvironment((fixture) => {
        // Arrange
        const material      = MaterialTestFixtures.createMaterial(fixture, DirectionalLightMaterial);
        const invalidRanges = [-0.1, 1.1];
        const strengthCases = [[false, 0], [true, 1]];
        const lightingCases = [
            [false, 0,    false],
            [true , 1,    true],
            [0    , 0,    false],
            [0.5  , 0.5,  false],
            [0.75 , 0.75, true],
            [1    , 1,    true]
        ];

        // Act & Assert
        strengthCases.forEach(([enabled, expectedStrength]) => {
            material.setDirectionalEnabled(enabled);
            assert.equal(material.directionalStrength, expectedStrength);
        });

        lightingCases.forEach(([value, expectedUniform, expectedEnabled]) => {
            material.setLightingEnabled(value);
            MaterialTestFixtures.apply(material);
            assert.equal(material.isLightingEnabled(), expectedEnabled);
            assert.equal(MaterialTestFixtures.getUniforms(fixture).get('u_lightingEnabled'), expectedUniform);
        });

        MaterialTestConstants.MATERIAL_INVALID_BOOLEANS.forEach((value) => {
            assert.throws(() => material.setDirectionalEnabled(value), TypeError);
        });

        MaterialTestConstants.MATERIAL_INVALID_NUMBERS.filter((value) => typeof value !== 'boolean').forEach((value) => {
            assert.throws(() => material.setLightingEnabled(value), TypeError);
        });

        invalidRanges.forEach((value) => {
            assert.throws(() => material.setLightingEnabled(value), RangeError);
        });
    });
});

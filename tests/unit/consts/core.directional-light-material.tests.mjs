import test                                   from 'node:test';
import assert                                 from 'node:assert/strict';
import * as DirectionalLightMaterialConstants from '../../../core/constants/directional-light-material.js';

test("'DirectionalLightMaterial' constants objects should be frozen", () => {
    // Arrange
    const actualConstants = [
        DirectionalLightMaterialConstants.DIRECTIONAL_LIGHT_MATERIAL_ATTRIBUTES,
        DirectionalLightMaterialConstants.DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS,
        DirectionalLightMaterialConstants.DIRECTIONAL_LIGHT_MATERIAL_DEFAULT_COLOR,
        DirectionalLightMaterialConstants.DIRECTIONAL_LIGHT_MATERIAL_LIGHTING
    ];

    // Act & Assert
    actualConstants.forEach((constants) => assert.equal(Object.isFrozen(constants), true));
});

test("'DirectionalLightMaterial' attribute constants should keep existing values", () => {
    // Arrange
    const actualConstants = DirectionalLightMaterialConstants.DIRECTIONAL_LIGHT_MATERIAL_ATTRIBUTES;

    // Act & Assert
    assert.equal(actualConstants.POSITION_LOCATION, 0);
    assert.equal(actualConstants.NORMAL_LOCATION, 3);
});

test("'DirectionalLightMaterial' uniform constants should keep existing values", () => {
    // Arrange
    const actualConstants = DirectionalLightMaterialConstants.DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS;

    // Act & Assert
    assert.equal(actualConstants.FINAL_MATRIX, 'u_matrix');
    assert.equal(actualConstants.WORLD_INVERSE_TRANSPOSE_MATRIX, 'u_worldInverseTranspose');
    assert.equal(actualConstants.WORLD_MATRIX, 'u_worldMatrix');
    assert.equal(actualConstants.COLOR, 'u_color');
    assert.equal(actualConstants.LIGHT_DIRECTION, 'u_lightDirection');
    assert.equal(actualConstants.CAMERA_POSITION, 'u_cameraPosition');
    assert.equal(actualConstants.AMBIENT_STRENGTH, 'u_ambientStrength');
    assert.equal(actualConstants.DIRECTIONAL_STRENGTH, 'u_directionalStrength');
    assert.equal(actualConstants.LIGHTING_ENABLED, 'u_lightingEnabled');
    assert.equal(actualConstants.OPACITY, 'u_opacity');
});

test("'DirectionalLightMaterial' default color should keep existing value as a plain frozen array", () => {
    // Arrange
    const actualColor = DirectionalLightMaterialConstants.DIRECTIONAL_LIGHT_MATERIAL_DEFAULT_COLOR;

    // Act & Assert
    assert.deepEqual(actualColor, [0.85, 0.85, 0.85]);
    assert.equal(actualColor instanceof Float32Array, false);
});

test("'DirectionalLightMaterial' lighting constants should keep existing values", () => {
    // Arrange
    const actualConstants = DirectionalLightMaterialConstants.DIRECTIONAL_LIGHT_MATERIAL_LIGHTING;

    // Act & Assert
    assert.equal(actualConstants.DEFAULT_LIGHTING_ENABLED, 1.0);
    assert.equal(actualConstants.FLOAT_FALSE, 0.0);
    assert.equal(actualConstants.FLOAT_TRUE, 1.0);
    assert.equal(actualConstants.MIN_LIGHTING_ENABLED, 0.0);
    assert.equal(actualConstants.MAX_LIGHTING_ENABLED, 1.0);
    assert.equal(actualConstants.LIGHTING_ENABLED_THRESHOLD, 0.5);
    assert.equal(DirectionalLightMaterialConstants.DIRECTIONAL_LIGHT_MATERIAL_VECTOR3_ELEMENT_COUNT, 3);
});

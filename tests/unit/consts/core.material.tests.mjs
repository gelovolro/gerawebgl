import test                              from 'node:test';
import assert                            from 'node:assert/strict';
import * as MaterialConstants            from '../../../core/constants/material.js';
import * as DirectionalMaterialConstants from '../../../core/constants/directional-light-material.js';
import * as VertexColorMaterialConstants from '../../../core/constants/vertex-color-material.js';
import * as SolidColorMaterialConstants  from '../../../core/constants/solid-color-material.js';
import * as NormalMaterialConstants      from '../../../core/constants/normal-material.js';
import * as PointsMaterialConstants      from '../../../core/constants/points-material.js';
import * as TexturedMaterialConstants    from '../../../core/constants/textured-material.js';
import * as LambertMaterialConstants     from '../../../core/constants/lambert-material.js';
import * as PhongMaterialConstants       from '../../../core/constants/phong-material.js';
import * as MtlMaterialConstants         from '../../../core/constants/mtl-standard-material.js';
import * as GeometryConstants            from '../../../core/constants/geometry.js';
import { MATERIAL_MAP_CASES }            from '../../test-constants/material.js';

test("'Material' shared constants should preserve attribute locations, uniform names and opacity limits", () => {
    // Arrange
    const expectedAttributes = { POSITION: 0, COLOR: 1, UV: 2, NORMAL: 3 };
    const expectedOpacity    = { MIN: 0, MAX: 1, DEFAULT: 1 };
    const expectedFlags      = { FALSE: 0, TRUE: 1 };
    const expectedUniforms   = {
        MATRIX            : 'u_matrix',
        COLOR             : 'u_color',
        OPACITY           : 'u_opacity',
        SPECULAR_COLOR    : 'u_specularColor',
        SPECULAR_STRENGTH : 'u_specularStrength',
        SHININESS         : 'u_shininess'
    };

    // Act & Assert
    assert.deepEqual(MaterialConstants.MATERIAL_ATTRIBUTES, expectedAttributes);
    assert.deepEqual(MaterialConstants.MATERIAL_OPACITY, expectedOpacity);
    assert.deepEqual(MaterialConstants.MATERIAL_BOOLEAN_FLOATS, expectedFlags);
    assert.deepEqual(MaterialConstants.MATERIAL_UNIFORMS, expectedUniforms);
    assert.equal(MaterialConstants.MATERIAL_DEFAULT_COLOR, GeometryConstants.GEOMETRY_DEFAULT_VERTEX_COLOR);
});

test("'Material' constant groups and nested map descriptors should be frozen", () => {
    // Arrange
    const modules = [
        MaterialConstants,
        DirectionalMaterialConstants,
        VertexColorMaterialConstants,
        SolidColorMaterialConstants,
        NormalMaterialConstants,
        PointsMaterialConstants,
        TexturedMaterialConstants,
        LambertMaterialConstants,
        PhongMaterialConstants,
        MtlMaterialConstants
    ];

    // Act & Assert
    modules.forEach((module) => {
        Object.values(module).filter((value) => typeof value === 'object').forEach((group) => {
            assert.equal(Object.isFrozen(group), true);

            Object.values(group).filter((value) => typeof value === 'object').forEach((nested) => {
                assert.equal(Object.isFrozen(nested), true);
            });
        });
    });
});

test("'MtlStandardMaterial' descriptors should associate each map with its own slot and uniforms", () => {
    // Arrange
    const expectedCount = MATERIAL_MAP_CASES.length;
    const descriptors   = MtlMaterialConstants.MTL_STANDARD_MATERIAL_MAPS;

    // Act & Assert
    assert.equal(descriptors.length, expectedCount);

    MATERIAL_MAP_CASES.forEach((expected, index) => {
        const actual = descriptors[index];
        assert.equal(actual.CONTEXT, `\`MtlStandardMaterial.${expected.method}\``);
        assert.equal(actual.TEXTURE_UNIT, expected.unit);
        assert.equal(actual.SAMPLER, expected.sampler);
        assert.equal(actual.UV_OFFSET, expected.offset);
        assert.equal(actual.UV_SCALE, expected.scale);
        assert.equal(actual.ENABLED, expected.flag);
    });
});

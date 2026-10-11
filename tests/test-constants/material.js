import { MATH_NON_FINITE_VALUES } from './math.js';

// Invalid containers shared by material constructors and texture map setters
export const MATERIAL_INVALID_OPTIONS = Object.freeze([null, [], false, 1, 'options', () => {}]);

// Invalid numeric settings shared by opacity, lighting and shading tests
export const MATERIAL_INVALID_NUMBERS = Object.freeze(['1', null, false, ...MATH_NON_FINITE_VALUES]);

// Invalid boolean settings shared by ownership and lighting tests
export const MATERIAL_INVALID_BOOLEANS = Object.freeze([null, 0, 1, 'true', {}, []]);

// Invalid vector containers and lengths shared by material color tests
export const MATERIAL_INVALID_VECTORS = Object.freeze([
    Object.freeze({ x: 1, y: 0, z: 0 }),
    'rgb',
    Object.freeze([]),
    Object.freeze([1, 0]),
    Object.freeze([1, 0, 0, 1])
]);

// Distinct components reveal swapped RGB values and incorrect vector uploads
export const MATERIAL_TEST_COLOR = Object.freeze([0.25, 0.5, 0.75]);

// Expected initial state is independent of the production constants
export const MATERIAL_EXPECTED_DEFAULTS = Object.freeze({
    OPACITY              : 1,
    POINT_SIZE           : 6,
    SHININESS            : 16,
    SPECULAR_STRENGTH    : 1,
    AMBIENT_STRENGTH     : 0.2,
    DIRECTIONAL_STRENGTH : 1,
    LIGHTING_ENABLED     : 1,
    WHITE                : Object.freeze([1, 1, 1]),
    DIFFUSE              : Object.freeze([0.85, 0.85, 0.85]),
    EMISSIVE             : Object.freeze([0, 0, 0]),
    UV_OFFSET            : Object.freeze([0, 0]),
    UV_SCALE             : Object.freeze([1, 1])
});

// Explicit texture map expectations keep the tests independent of map descriptors
export const MATERIAL_MAP_CASES = Object.freeze([
    Object.freeze({ method: 'setDiffuseMap',      sampler: 'u_diffuseMap',      flag: 'u_useDiffuseMap',      offset: 'u_diffuseUvOffset',      scale: 'u_diffuseUvScale',      unit: 0 }),
    Object.freeze({ method: 'setAmbientMap',      sampler: 'u_ambientMap',      flag: 'u_useAmbientMap',      offset: 'u_ambientUvOffset',      scale: 'u_ambientUvScale',      unit: 1 }),
    Object.freeze({ method: 'setSpecularMap',     sampler: 'u_specularMap',     flag: 'u_useSpecularMap',     offset: 'u_specularUvOffset',     scale: 'u_specularUvScale',     unit: 2 }),
    Object.freeze({ method: 'setAlphaMap',        sampler: 'u_alphaMap',        flag: 'u_useAlphaMap',        offset: 'u_alphaUvOffset',        scale: 'u_alphaUvScale',        unit: 3 }),
    Object.freeze({ method: 'setBumpMap',         sampler: 'u_bumpMap',         flag: 'u_useBumpMap',         offset: 'u_bumpUvOffset',         scale: 'u_bumpUvScale',         unit: 4 }),
    Object.freeze({ method: 'setDisplacementMap', sampler: 'u_displacementMap', flag: 'u_useDisplacementMap', offset: 'u_displacementUvOffset', scale: 'u_displacementUvScale', unit: 5 }),
    Object.freeze({ method: 'setReflectionMap',   sampler: 'u_reflectionMap',   flag: 'u_useReflectionMap',   offset: 'u_reflectionUvOffset',   scale: 'u_reflectionUvScale',   unit: 6 })
]);

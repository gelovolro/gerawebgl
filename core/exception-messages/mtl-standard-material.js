// Validation and resource messages used by 'MtlStandardMaterial'
export const MTL_STANDARD_MATERIAL_EXCEPTION_MESSAGES = Object.freeze({
    OPTIONS_OBJECT                    : '`MtlStandardMaterial` expects an options object (plain object).',
    SHININESS_TYPE                    : '`MtlStandardMaterial.setShininess` expects a finite number.',
    SPECULAR_STRENGTH_TYPE            : '`MtlStandardMaterial.setSpecularStrength` expects a finite number.',
    SPECULAR_ENABLED_TYPE             : '`MtlStandardMaterial.setSpecularEnabled` expects a boolean.',
    OPTICAL_DENSITY_TYPE              : '`MtlStandardMaterial.setOpticalDensity` expects a finite number.',
    BUMP_MULTIPLIER_TYPE              : '`MtlStandardMaterial.setBumpMultiplier` expects a finite number.',
    DISPLACEMENT_SCALE_TYPE           : '`MtlStandardMaterial.setDisplacementScale` expects a finite number.',
    EXPECTS_TEXTURE_SUFFIX            : ' expects texture as Texture2D.',
    EXPECTS_OPTIONS_OBJECT_SUFFIX     : ' expects options as a plain object.',
    EXPECTS_TEXTURE_UNIT_INDEX_SUFFIX : ' expects options.textureUnitIndex as a non-negative integer.',
    EXPECTS_VECTOR2_TYPE_SUFFIX       : ' expects a number[] or Float32Array.',
    EXPECTS_VECTOR2_COMPONENTS_SUFFIX : ' expects exactly 2 components.',
    EXPECTS_VECTOR3_COMPONENTS_SUFFIX : ' expects exactly 3 components.'
});

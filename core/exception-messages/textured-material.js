// Validation and resource messages used by 'TexturedMaterial'
export const TEXTURED_MATERIAL_EXCEPTION_MESSAGES = Object.freeze({
    OPTIONS_OBJECT             : 'TexturedMaterial expects options as an object.',
    TEXTURE_TYPE               : '`TexturedMaterial` expects `options.texture` as `Texture2D`.',
    TEXTURE_UNIT_TYPE          : '`TexturedMaterial` expects `options.textureUnitIndex` as a non-negative integer.',
    TEXTURE_OWNERSHIP_TYPE     : '`TexturedMaterial` expects `options.ownsTexture` as boolean.',
    PROGRAM_OWNERSHIP_TYPE     : '`TexturedMaterial` expects `options.ownsShaderProgram` as boolean.',
    REPLACEMENT_TEXTURE_TYPE   : '`TexturedMaterial.setDiffuseTexture` expects texture as `Texture2D`.',
    REPLACEMENT_OPTIONS_OBJECT : '`TexturedMaterial.setDiffuseTexture` expects options as an object.',
    REPLACEMENT_OWNERSHIP_TYPE : '`TexturedMaterial.setDiffuseTexture` expects options.ownsTexture as boolean.'
});

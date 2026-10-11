import * as SharedMaterialConstants from '../constants/material.js';

// Validation and resource messages used by 'Material'
export const MATERIAL_EXCEPTION_MESSAGES = Object.freeze({
    WEBGL_CONTEXT_TYPE  : 'Material expects a WebGL2RenderingContext.',
    OPTIONS_OBJECT      : 'Material expects an options object (plain object).',
    OWNERSHIP_TYPE      : 'Material option "ownsShaderProgram" must be a boolean.',
    SHADER_PROGRAM_TYPE : 'Material expects a ShaderProgram instance.',
    OPACITY_TYPE        : '`Material.setOpacity` expects a finite number.',
    OPACITY_RANGE       : `Material.setOpacity expects a value in [${SharedMaterialConstants.MATERIAL_OPACITY.MIN}..${SharedMaterialConstants.MATERIAL_OPACITY.MAX}].`,
    INSTANCE_DISPOSED   : 'Material has been disposed and can no longer be used.'
});

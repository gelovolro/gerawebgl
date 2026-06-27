export const DIRECTIONAL_LIGHT_MATERIAL_EXCEPTION_MESSAGES = Object.freeze({
    WEBGL_CONTEXT_TYPE        : '`DirectionalLightMaterial` expects a WebGL2RenderingContext.',
    SHADER_PROGRAM_TYPE       : '`DirectionalLightMaterial` expects a ShaderProgram instance.',
    OWNS_SHADER_PROGRAM_TYPE  : '`DirectionalLightMaterial` option "ownsShaderProgram" must be a boolean.',
    LIGHT_DIRECTION_LENGTH    : '`DirectionalLightMaterial.setLightDirection` expects a non-zero finite vector.',
    AMBIENT_STRENGTH_TYPE     : '`DirectionalLightMaterial.setAmbientStrength` expects a finite number.',
    DIRECTIONAL_STRENGTH_TYPE : '`DirectionalLightMaterial.setDirectionalStrength` expects a finite number.',
    DIRECTIONAL_ENABLED_TYPE  : '`DirectionalLightMaterial.setDirectionalEnabled` expects a boolean.',
    LIGHTING_ENABLED_TYPE     : '`DirectionalLightMaterial.setLightingEnabled` expects a boolean or a finite number.',
    LIGHTING_ENABLED_RANGE    : '`DirectionalLightMaterial.setLightingEnabled` expects a value in [0..1].',
    VECTOR3_TYPE              : '{methodName} expects a number[] or Float32Array.',
    VECTOR3_COMPONENTS        : '{methodName} expects exactly 3 components [x, y, z].',
    VECTOR3_COMPONENTS_FINITE : '{methodName} expects all components to be finite numbers.',
    OPTIONS_OBJECT            : '{methodName} expects an options object (plain object).'
});

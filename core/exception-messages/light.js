export const LIGHT_EXCEPTION_MESSAGES = Object.freeze({
    ABSTRACT_CONSTRUCTOR        : '`Light` is an abstract class and cannot be instantiated directly.',
    ENABLED_TYPE                : '`Light.setEnabled` expects a boolean.',
    AMBIENT_STRENGTH_TYPE       : '`AmbientLight.setStrength` expects a finite number.',
    DIRECTION_TYPE              : '`DirectionalLight.setDirection` expects a number[] or `Float32Array`.',
    DIRECTION_COMPONENTS        : '`DirectionalLight.setDirection` expects exactly 3 components.',
    DIRECTION_COMPONENTS_FINITE : '`DirectionalLight.setDirection` expects finite components.',
    DIRECTION_LENGTH            : '`DirectionalLight.setDirection` expects a non-zero direction vector.',
    DIRECTIONAL_STRENGTH_TYPE   : '`DirectionalLight.setStrength` expects a finite number.'
});

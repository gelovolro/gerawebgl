import * as MaterialConstants       from '../constants/directional-light-material.js';
import { ShaderProgram }            from '../shader/shader-program.js';
import { DirectionalLightMaterial } from './directional-light-material.js';

/**
 * Specular color uniform name.
 *
 * @type {string}
 */
const SPECULAR_COLOR_UNIFORM_NAME = 'u_specularColor';

/**
 * Specular strength uniform name.
 *
 * @type {string}
 */
const SPECULAR_STRENGTH_UNIFORM_NAME = 'u_specularStrength';

/**
 * Shininess uniform name (specular exponent).
 *
 * @type {string}
 */
const SHININESS_UNIFORM_NAME = 'u_shininess';

/**
 * Default specular color (RGB).
 *
 * @type {Float32Array}
 */
const DEFAULT_SPECULAR_COLOR = new Float32Array([1.0, 1.0, 1.0]);

/**
 * Default specular strength multiplier.
 *
 * @type {number}
 */
const DEFAULT_SPECULAR_STRENGTH = 1.0;

/**
 * Default shininess exponent.
 *
 * @type {number}
 */
const DEFAULT_SHININESS = 16.0;

/**
 * GLSL vertex shader source code.
 *
 * Requires:
 * - position attribute at location 0
 * - normal attribute at location 3
 *
 * @type {string}
 */
const VERTEX_SHADER_SOURCE = `#version 300 es
precision mediump float;
layout(location = ${MaterialConstants.DIRECTIONAL_LIGHT_MATERIAL_ATTRIBUTES.POSITION_LOCATION}) in vec3 a_position;
layout(location = ${MaterialConstants.DIRECTIONAL_LIGHT_MATERIAL_ATTRIBUTES.NORMAL_LOCATION}) in vec3 a_normal;
uniform mat4 ${MaterialConstants.DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.FINAL_MATRIX};
uniform mat4 ${MaterialConstants.DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.WORLD_MATRIX};
uniform mat4 ${MaterialConstants.DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.WORLD_INVERSE_TRANSPOSE_MATRIX};
out vec3 v_worldPosition;
out vec3 v_normal;

void main() {
    gl_Position     = ${MaterialConstants.DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.FINAL_MATRIX} * vec4(a_position, 1.0);
    v_worldPosition = (${MaterialConstants.DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.WORLD_MATRIX} * vec4(a_position, 1.0)).xyz;
    v_normal        = (${MaterialConstants.DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.WORLD_INVERSE_TRANSPOSE_MATRIX} * vec4(a_normal, 0.0)).xyz;
}
`;

/**
 * GLSL fragment shader source code.
 *
 * Implements classic Phong lighting: `ambient + diffuse + specular`.
 *
 * @type {string}
 */
const FRAGMENT_SHADER_SOURCE = `#version 300 es
precision mediump float;
in vec3 v_worldPosition;
in vec3 v_normal;
uniform vec3  ${MaterialConstants.DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.COLOR};
uniform vec3  ${SPECULAR_COLOR_UNIFORM_NAME};
uniform vec3  ${MaterialConstants.DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.LIGHT_DIRECTION};
uniform vec3  ${MaterialConstants.DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.CAMERA_POSITION};
uniform float ${MaterialConstants.DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.AMBIENT_STRENGTH};
uniform float ${MaterialConstants.DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.DIRECTIONAL_STRENGTH};
uniform float ${MaterialConstants.DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.LIGHTING_ENABLED};
uniform float ${SPECULAR_STRENGTH_UNIFORM_NAME};
uniform float ${SHININESS_UNIFORM_NAME};
uniform float ${MaterialConstants.DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.OPACITY};
out vec4 outColor;

void main() {
    vec3 surface_normal = normalize(v_normal);

    if (!gl_FrontFacing) {
        surface_normal = -surface_normal;
    }

    vec3 light_direction     = normalize(${MaterialConstants.DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.LIGHT_DIRECTION});
    vec3 view_direction      = normalize(${MaterialConstants.DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.CAMERA_POSITION} - v_worldPosition);
    float lighting_enabled   = ${MaterialConstants.DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.LIGHTING_ENABLED};
    float diffuse_intensity  = max(dot(surface_normal, light_direction), 0.0) * ${MaterialConstants.DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.DIRECTIONAL_STRENGTH};
    float specular_intensity = 0.0;

    if (diffuse_intensity > 0.0) {
        vec3 reflection_direction = reflect(-light_direction, surface_normal);
        float specular_base       = max(dot(view_direction, reflection_direction), 0.0);
        specular_intensity        = pow(specular_base, ${SHININESS_UNIFORM_NAME});
    }

    vec3 ambient  = ${MaterialConstants.DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.COLOR} * ${MaterialConstants.DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.AMBIENT_STRENGTH};
    vec3 diffuse  = ${MaterialConstants.DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.COLOR} * (diffuse_intensity * lighting_enabled);
    vec3 specular = ${SPECULAR_COLOR_UNIFORM_NAME}
        * (specular_intensity * ${SPECULAR_STRENGTH_UNIFORM_NAME}
        * ${MaterialConstants.DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.DIRECTIONAL_STRENGTH} * lighting_enabled);

    vec3 rgb = ambient + diffuse + specular;
    outColor = vec4(rgb, ${MaterialConstants.DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.OPACITY});
}
`;

/**
 * Options used by `PhongMaterial`.
 *
 * @typedef {Object} PhongMaterialOptions
 * @property {Float32Array | number[]} [color]          - Diffuse RGB color [red, green, blue] in [0..1] range.
 * @property {Float32Array | number[]} [lightDirection] - Directional light direction (world space), normalized internally.
 * @property {number} [ambientStrength]                 - Ambient term multiplier.
 * @property {Float32Array | number[]} [specularColor]  - Specular RGB color [red, green, blue] in [0..1] range.
 * @property {number} [specularStrength]                - Specular term multiplier.
 * @property {number} [shininess]                       - Shininess exponent for specular highlight.
 */

/**
 * Phong material with one directional light.
 *
 * This material expects geometry to provide normals at attribute `location 3`.
 */
export class PhongMaterial extends DirectionalLightMaterial {

    /**
     * Specular color (RGB).
     *
     * @type {Float32Array}
     * @private
     */
    #specularColor = new Float32Array(MaterialConstants.DIRECTIONAL_LIGHT_MATERIAL_VECTOR3_ELEMENT_COUNT);

    /**
     * Specular strength multiplier.
     *
     * @type {number}
     * @private
     */
    #specularStrength = DEFAULT_SPECULAR_STRENGTH;

    /**
     * Shininess exponent (specular power).
     *
     * @type {number}
     * @private
     */
    #shininess = DEFAULT_SHININESS;

    /**
     * Creates a new `PhongMaterial`.
     *
     * @param {WebGL2RenderingContext} webglContext - WebGL2 rendering context, used to compile shaders.
     * @param {PhongMaterialOptions} [options]      - Material options.
     */
    constructor(webglContext, options = {}) {
        if (options === null || typeof options !== 'object' || Array.isArray(options)) {
            throw new TypeError('`PhongMaterial` expects an options object (plain object).');
        }

        const shaderProgram = new ShaderProgram(webglContext, VERTEX_SHADER_SOURCE, FRAGMENT_SHADER_SOURCE);
        super(webglContext, shaderProgram, options, { ownsShaderProgram: true });
        this.#specularColor.set(DEFAULT_SPECULAR_COLOR);
        this.#specularStrength = DEFAULT_SPECULAR_STRENGTH;
        this.#shininess        = DEFAULT_SHININESS;

        const { specularColor, specularStrength, shininess } = options;

        if (specularColor !== undefined) {
            this.setSpecularColor(specularColor);
        }

        if (specularStrength !== undefined) {
            this.setSpecularStrength(specularStrength);
        }

        if (shininess !== undefined) {
            this.setShininess(shininess);
        }
    }

    /**
     * Uploads Phong-specific uniforms (world matrix, camera position and specular settings).
     *
     * @param {Float32Array} worldMatrix    - World matrix.
     * @param {Float32Array} cameraPosition - Camera position, world space.
     * @protected
     */
    applyAdditionalUniforms(worldMatrix, cameraPosition) {
        this.shaderProgram.setMatrix4(MaterialConstants.DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.WORLD_MATRIX    , worldMatrix);
        this.shaderProgram.setVector3(MaterialConstants.DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS.CAMERA_POSITION , cameraPosition);
        this.shaderProgram.setVector3(SPECULAR_COLOR_UNIFORM_NAME  , this.#specularColor);
        this.shaderProgram.setFloat(SPECULAR_STRENGTH_UNIFORM_NAME , this.#specularStrength);
        this.shaderProgram.setFloat(SHININESS_UNIFORM_NAME         , this.#shininess);
    }

    /**
     * Sets the specular RGB-color.
     *
     * @param {Float32Array | number[]} color - [red, green, blue] in [0..1] range.
     */
    setSpecularColor(color) {
        DirectionalLightMaterial.assertVector3('`PhongMaterial.setSpecularColor`', color);
        this.#specularColor[0] = color[0];
        this.#specularColor[1] = color[1];
        this.#specularColor[2] = color[2];
    }

    /**
     * Sets specular strength multiplier.
     *
     * @param {number} value - Specular multiplier.
     */
    setSpecularStrength(value) {
        if (typeof value !== 'number' || !Number.isFinite(value)) {
            throw new TypeError('`PhongMaterial.setSpecularStrength` expects a finite number.');
        }

        this.#specularStrength = value;
    }

    /**
     * Sets shininess exponent for the specular highlight.
     *
     * @param {number} value - Shininess exponent.
     */
    setShininess(value) {
        if (typeof value !== 'number' || !Number.isFinite(value)) {
            throw new TypeError('`PhongMaterial.setShininess` expects a finite number.');
        }

        this.#shininess = value;
    }

    /**
     * Returns the internal specular color buffer.
     *
     * @returns {Float32Array}
     */
    get specularColor() {
        return this.#specularColor;
    }

    /**
     * @returns {number} Specular strength multiplier.
     */
    get specularStrength() {
        return this.#specularStrength;
    }

    /**
     * @returns {number} Shininess exponent.
     */
    get shininess() {
        return this.#shininess;
    }
}

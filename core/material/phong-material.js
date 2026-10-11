import * as SharedMaterialConstants          from '../constants/material.js';
import * as DirectionalMaterialConstants     from '../constants/directional-light-material.js';
import * as MaterialConstants                from '../constants/phong-material.js';
import { ECMASCRIPT_TYPEOF_RESULTS }         from '../constants/ecmascript-types.js';
import { PHONG_MATERIAL_EXCEPTION_MESSAGES } from '../exception-messages/phong-material.js';
import { DirectionalLightMaterial }          from './directional-light-material.js';
import { ShaderProgram }                     from '../shader/shader-program.js';

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
    #specularColor = new Float32Array(DirectionalMaterialConstants.DIRECTIONAL_LIGHT_MATERIAL_VECTOR3_ELEMENT_COUNT);

    /**
     * Specular strength multiplier.
     *
     * @type {number}
     * @private
     */
    #specularStrength = SharedMaterialConstants.MATERIAL_SPECULAR_DEFAULTS.STRENGTH;

    /**
     * Shininess exponent (specular power).
     *
     * @type {number}
     * @private
     */
    #shininess = SharedMaterialConstants.MATERIAL_SPECULAR_DEFAULTS.SHININESS;

    /**
     * Creates a new `PhongMaterial`.
     *
     * @param {WebGL2RenderingContext} webglContext - WebGL2 rendering context, used to compile shaders.
     * @param {PhongMaterialOptions} [options]      - Material options.
     */
    constructor(webglContext, options = {}) {
        if (options === null || typeof options !== ECMASCRIPT_TYPEOF_RESULTS.OBJECT || Array.isArray(options)) {
            throw new TypeError(PHONG_MATERIAL_EXCEPTION_MESSAGES.OPTIONS_OBJECT);
        }

        const sources       = MaterialConstants.PHONG_MATERIAL_SHADERS;
        const shaderProgram = new ShaderProgram(webglContext, sources.VERTEX, sources.FRAGMENT);

        super(webglContext, shaderProgram, options, {
            ownsShaderProgram: SharedMaterialConstants.MATERIAL_DEFAULTS.OWNS_GENERATED_SHADER_PROGRAM
        });

        try {
            this.#initialize(options);
        } catch (error) {
            shaderProgram.dispose();
            throw error;
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
        const shaderProgram  = this.shaderProgram;
        const lightUniforms  = DirectionalMaterialConstants.DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS;
        const sharedUniforms = SharedMaterialConstants.MATERIAL_UNIFORMS;

        shaderProgram.setMatrix4(lightUniforms.WORLD_MATRIX, worldMatrix);
        shaderProgram.setVector3(lightUniforms.CAMERA_POSITION, cameraPosition);
        shaderProgram.setVector3(sharedUniforms.SPECULAR_COLOR, this.#specularColor);
        shaderProgram.setFloat(sharedUniforms.SPECULAR_STRENGTH, this.#specularStrength);
        shaderProgram.setFloat(sharedUniforms.SHININESS, this.#shininess);
    }

    /**
     * Sets the specular RGB-color.
     *
     * @param {Float32Array | number[]} color - [red, green, blue] in [0..1] range.
     */
    setSpecularColor(color) {
        DirectionalLightMaterial.assertVector3(MaterialConstants.PHONG_MATERIAL_COLOR_CONTEXT, color);
        this.#specularColor.set(color);
    }

    /**
     * Sets specular strength multiplier.
     *
     * @param {number} value - Specular multiplier.
     */
    setSpecularStrength(value) {
        if (typeof value !== ECMASCRIPT_TYPEOF_RESULTS.NUMBER || !Number.isFinite(value)) {
            throw new TypeError(PHONG_MATERIAL_EXCEPTION_MESSAGES.SPECULAR_STRENGTH_TYPE);
        }

        this.#specularStrength = value;
    }

    /**
     * Sets shininess exponent for the specular highlight.
     *
     * @param {number} value - Shininess exponent.
     */
    setShininess(value) {
        if (typeof value !== ECMASCRIPT_TYPEOF_RESULTS.NUMBER || !Number.isFinite(value)) {
            throw new TypeError(PHONG_MATERIAL_EXCEPTION_MESSAGES.SHININESS_TYPE);
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

    /**
     * Applies the initial settings after the shader program has been created.
     *
     * @param {PhongMaterialOptions} options - Initial material settings.
     * @private
     */
    #initialize(options) {
        this.#specularColor.set(SharedMaterialConstants.MATERIAL_DEFAULT_COLOR);

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
}

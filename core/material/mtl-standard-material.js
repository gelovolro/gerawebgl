import * as SharedMaterialConstants                 from '../constants/material.js';
import * as DirectionalMaterialConstants            from '../constants/directional-light-material.js';
import * as MaterialConstants                       from '../constants/mtl-standard-material.js';
import { ECMASCRIPT_TYPEOF_RESULTS }                from '../constants/ecmascript-types.js';
import { MTL_STANDARD_MATERIAL_EXCEPTION_MESSAGES } from '../exception-messages/mtl-standard-material.js';
import { ShaderProgram }                            from '../shader/shader-program.js';
import { Texture2D }                                from '../texture/texture2d.js';
import { DirectionalLightMaterial }                 from './directional-light-material.js';

/**
 * Options used by `MtlStandardMaterial`.
 *
 * @typedef {Object} MtlStandardMaterialOptions
 * @property {Float32Array | number[]} [diffuseColor]   - Diffuse RGB color in [0..1] range.
 * @property {Float32Array | number[]} [ambientColor]   - Ambient RGB color in [0..1] range.
 * @property {Float32Array | number[]} [specularColor]  - Specular RGB color in [0..1] range.
 * @property {Float32Array | number[]} [emissiveColor]  - Emissive RGB color in [0..1] range.
 * @property {Float32Array | number[]} [lightDirection] - Directional light direction (world space).
 * @property {number} [ambientStrength]                 - Ambient strength multiplier.
 * @property {number} [shininess]                       - Specular exponent.
 * @property {number} [specularStrength]                - Specular strength multiplier.
 * @property {number} [opticalDensity]                  - Optical density used for reflection blending.
 */

/**
 * Texture map setter options.
 *
 * @typedef {Object} MtlStandardMaterialMapOptions
 * @property {number} [textureUnitIndex]          - Texture unit index.
 * @property {Float32Array | number[]} [uvOffset] - UV-offset vector.
 * @property {Float32Array | number[]} [uvScale]  - UV-scale vector.
 */

/**
 * Material for MTL assets with multiple texture maps and Phong lighting.
 */
export class MtlStandardMaterial extends DirectionalLightMaterial {

    /**
     * Placeholder texture shared by map slots until a texture is assigned.
     * External map textures remain owned by the caller.
     *
     * @type {Texture2D}
     * @private
     */
    #fallbackTexture;

    /**
     * Per-instance texture references, UV buffers and map usage flags.
     * The descriptors are shared, but mutable map state is never shared.
     *
     * @type {Object[]}
     * @private
     */
    #maps;

    /**
     * Ambient color.
     *
     * @type {Float32Array}
     * @private
     */
    #ambientColor = new Float32Array(SharedMaterialConstants.MATERIAL_DEFAULT_COLOR);

    /**
     * Specular color.
     *
     * @type {Float32Array}
     * @private
     */
    #specularColor = new Float32Array(SharedMaterialConstants.MATERIAL_DEFAULT_COLOR);

    /**
     * Emissive color.
     *
     * @type {Float32Array}
     * @private
     */
    #emissiveColor = new Float32Array(MaterialConstants.MTL_STANDARD_MATERIAL_DEFAULTS.EMISSIVE_COLOR);

    /**
     * Shininess exponent.
     *
     * @type {number}
     * @private
     */
    #shininess = SharedMaterialConstants.MATERIAL_SPECULAR_DEFAULTS.SHININESS;

    /**
     * Specular strength multiplier.
     *
     * @type {number}
     * @private
     */
    #specularStrength = SharedMaterialConstants.MATERIAL_SPECULAR_DEFAULTS.STRENGTH;

    /**
     * Flag, controlling the specular lighting.
     *
     * @type {boolean}
     * @private
     */
    #specularEnabled = true;

    /**
     * Optical density value.
     *
     * @type {number}
     * @private
     */
    #opticalDensity = MaterialConstants.MTL_STANDARD_MATERIAL_DEFAULTS.OPTICAL_DENSITY;

    /**
     * Bump multiplier.
     *
     * @type {number}
     * @private
     */
    #bumpMultiplier = MaterialConstants.MTL_STANDARD_MATERIAL_DEFAULTS.BUMP_MULTIPLIER;

    /**
     * Displacement scale factor.
     *
     * @type {number}
     * @private
     */
    #displacementScale = MaterialConstants.MTL_STANDARD_MATERIAL_DEFAULTS.DISPLACEMENT_SCALE;

    /**
     * Creates a material with its own program and fallback texture.
     *
     * @param {WebGL2RenderingContext} webglContext  - WebGL2 rendering context.
     * @param {MtlStandardMaterialOptions} [options] - Material settings.
     */
    constructor(webglContext, options = {}) {
        if (options === null || typeof options !== ECMASCRIPT_TYPEOF_RESULTS.OBJECT || Array.isArray(options)) {
            throw new TypeError(MTL_STANDARD_MATERIAL_EXCEPTION_MESSAGES.OPTIONS_OBJECT);
        }

        const { diffuseColor, lightDirection, ambientStrength } = options;

        const sources       = MaterialConstants.MTL_STANDARD_MATERIAL_SHADERS;
        const shaderProgram = new ShaderProgram(webglContext, sources.VERTEX, sources.FRAGMENT);
        const lightOptions  = {
            color : diffuseColor || SharedMaterialConstants.MATERIAL_DEFAULT_COLOR,
            lightDirection,
            ambientStrength
        };

        super(webglContext, shaderProgram, lightOptions, {
            ownsShaderProgram: SharedMaterialConstants.MATERIAL_DEFAULTS.OWNS_GENERATED_SHADER_PROGRAM
        });

        try {
            this.#initialize(webglContext, options);
        } catch (error) {
            this.#fallbackTexture?.dispose();
            super.dispose();
            throw error;
        }
    }

    /**
     * Uploads the material-specific uniforms in the existing order.
     *
     * @param {Float32Array} worldMatrix    - World matrix.
     * @param {Float32Array} cameraPosition - Camera position.
     * @protected
     */
    applyAdditionalUniforms(worldMatrix, cameraPosition) {
        const shaderProgram = this.shaderProgram;
        const uniforms      = DirectionalMaterialConstants.DIRECTIONAL_LIGHT_MATERIAL_UNIFORMS;
        shaderProgram.setMatrix4(uniforms.WORLD_MATRIX, worldMatrix);
        shaderProgram.setVector3(uniforms.CAMERA_POSITION, cameraPosition);

        this.#applyShadingUniforms(shaderProgram);
        this.#applySurfaceUniforms(shaderProgram);
        this.#applyUvTransforms(shaderProgram);
        this.#applyMapFlags(shaderProgram);
        this.#applyTextures(shaderProgram);
    }

    /**
     * Sets the ambient color.
     *
     * @param {Float32Array | number[]} color - RGB color in [0..1] range.
     */
    setAmbientColor(color) {
        MtlStandardMaterial.#assertVector3(MaterialConstants.MTL_STANDARD_MATERIAL_CONTEXTS.AMBIENT_COLOR, color);
        this.#ambientColor.set(color);
    }

    /**
     * Sets the specular color.
     *
     * @param {Float32Array | number[]} color - RGB color in [0..1] range.
     */
    setSpecularColor(color) {
        MtlStandardMaterial.#assertVector3(MaterialConstants.MTL_STANDARD_MATERIAL_CONTEXTS.SPECULAR_COLOR, color);
        this.#specularColor.set(color);
    }

    /**
     * Sets the emissive color.
     *
     * @param {Float32Array | number[]} color - RGB color in [0..1] range.
     */
    setEmissiveColor(color) {
        MtlStandardMaterial.#assertVector3(MaterialConstants.MTL_STANDARD_MATERIAL_CONTEXTS.EMISSIVE_COLOR, color);
        this.#emissiveColor.set(color);
    }

    /**
     * Sets the shininess exponent.
     *
     * @param {number} value - Shininess exponent.
     */
    setShininess(value) {
        if (typeof value !== ECMASCRIPT_TYPEOF_RESULTS.NUMBER || !Number.isFinite(value)) {
            throw new TypeError(MTL_STANDARD_MATERIAL_EXCEPTION_MESSAGES.SHININESS_TYPE);
        }

        this.#shininess = value;
    }

    /**
     * Sets the specular strength multiplier.
     *
     * @param {number} value - Specular strength.
     */
    setSpecularStrength(value) {
        if (typeof value !== ECMASCRIPT_TYPEOF_RESULTS.NUMBER || !Number.isFinite(value)) {
            throw new TypeError(MTL_STANDARD_MATERIAL_EXCEPTION_MESSAGES.SPECULAR_STRENGTH_TYPE);
        }

        this.#specularStrength = value;
    }

    /**
     * Enables or disables specular term.
     *
     * @param {boolean} enabled - Specular usage flag.
     */
    setSpecularEnabled(enabled) {
        if (typeof enabled !== ECMASCRIPT_TYPEOF_RESULTS.BOOLEAN) {
            throw new TypeError(MTL_STANDARD_MATERIAL_EXCEPTION_MESSAGES.SPECULAR_ENABLED_TYPE);
        }

        this.#specularEnabled = enabled;
    }

    /**
     * Sets optical density value.
     *
     * @param {number} value - Optical density.
     */
    setOpticalDensity(value) {
        if (typeof value !== ECMASCRIPT_TYPEOF_RESULTS.NUMBER || !Number.isFinite(value)) {
            throw new TypeError(MTL_STANDARD_MATERIAL_EXCEPTION_MESSAGES.OPTICAL_DENSITY_TYPE);
        }

        this.#opticalDensity = value;
    }

    /**
     * Sets bump multiplier value.
     *
     * @param {number} value - Bump multiplier.
     */
    setBumpMultiplier(value) {
        if (typeof value !== ECMASCRIPT_TYPEOF_RESULTS.NUMBER || !Number.isFinite(value)) {
            throw new TypeError(MTL_STANDARD_MATERIAL_EXCEPTION_MESSAGES.BUMP_MULTIPLIER_TYPE);
        }

        this.#bumpMultiplier = value;
    }

    /**
     * Sets displacement scale.
     *
     * @param {number} value - Displacement scale factor.
     */
    setDisplacementScale(value) {
        if (typeof value !== ECMASCRIPT_TYPEOF_RESULTS.NUMBER || !Number.isFinite(value)) {
            throw new TypeError(MTL_STANDARD_MATERIAL_EXCEPTION_MESSAGES.DISPLACEMENT_SCALE_TYPE);
        }

        this.#displacementScale = value;
    }

    /**
     * Sets a diffuse texture and its UV-transform.
     *
     * @param {Texture2D} texture                       - Diffuse texture.
     * @param {MtlStandardMaterialMapOptions} [options] - Map options.
     */
    setDiffuseMap(texture, options = {}) {
        this.#setMap(MaterialConstants.MTL_STANDARD_MATERIAL_MAP_INDEXES.DIFFUSE, texture, options);
    }

    /**
     * Sets an ambient texture and its UV-transform.
     *
     * @param {Texture2D} texture                       - Ambient texture.
     * @param {MtlStandardMaterialMapOptions} [options] - Map options.
     */
    setAmbientMap(texture, options = {}) {
        this.#setMap(MaterialConstants.MTL_STANDARD_MATERIAL_MAP_INDEXES.AMBIENT, texture, options);
    }

    /**
     * Sets a specular texture and its UV-transform.
     *
     * @param {Texture2D} texture                       - Specular texture.
     * @param {MtlStandardMaterialMapOptions} [options] - Map options.
     */
    setSpecularMap(texture, options = {}) {
        this.#setMap(MaterialConstants.MTL_STANDARD_MATERIAL_MAP_INDEXES.SPECULAR, texture, options);
    }

    /**
     * Sets an alpha texture and its UV-transform.
     *
     * @param {Texture2D} texture                       - Alpha texture.
     * @param {MtlStandardMaterialMapOptions} [options] - Map options.
     */
    setAlphaMap(texture, options = {}) {
        this.#setMap(MaterialConstants.MTL_STANDARD_MATERIAL_MAP_INDEXES.ALPHA, texture, options);
    }

    /**
     * Sets a bump texture and its UV-transform.
     *
     * @param {Texture2D} texture                       - Bump texture.
     * @param {MtlStandardMaterialMapOptions} [options] - Map options.
     */
    setBumpMap(texture, options = {}) {
        this.#setMap(MaterialConstants.MTL_STANDARD_MATERIAL_MAP_INDEXES.BUMP, texture, options);
    }

    /**
     * Sets a displacement texture and its UV-transform.
     *
     * @param {Texture2D} texture                       - Displacement texture.
     * @param {MtlStandardMaterialMapOptions} [options] - Map options.
     */
    setDisplacementMap(texture, options = {}) {
        this.#setMap(MaterialConstants.MTL_STANDARD_MATERIAL_MAP_INDEXES.DISPLACEMENT, texture, options);
    }

    /**
     * Sets a reflection texture and its UV-transform.
     *
     * @param {Texture2D} texture                       - Reflection texture.
     * @param {MtlStandardMaterialMapOptions} [options] - Map options.
     */
    setReflectionMap(texture, options = {}) {
        this.#setMap(MaterialConstants.MTL_STANDARD_MATERIAL_MAP_INDEXES.REFLECTION, texture, options);
    }

    /**
     * Releases the fallback texture and program, leaving external maps intact.
     */
    dispose() {
        if (this.isDisposed) {
            return;
        }

        this.#fallbackTexture.dispose();
        super.dispose();
    }

    /**
     * Allocates per-map state and applies the initial shading options.
     *
     * @param {WebGL2RenderingContext} webglContext - Texture allocation context.
     * @param {MtlStandardMaterialOptions} options  - Initial material settings.
     * @private
     */
    #initialize(webglContext, options) {
        this.#fallbackTexture = new Texture2D(webglContext);

        this.#maps = MaterialConstants.MTL_STANDARD_MATERIAL_MAPS.map((descriptor) => ({
            descriptor,
            texture          : this.#fallbackTexture,
            textureUnitIndex : descriptor.TEXTURE_UNIT,
            uvOffset         : new Float32Array(MaterialConstants.MTL_STANDARD_MATERIAL_DEFAULTS.UV_OFFSET),
            uvScale          : new Float32Array(MaterialConstants.MTL_STANDARD_MATERIAL_DEFAULTS.UV_SCALE),
            enabled          : false
        }));

        this.#applyOptions(options);
    }

    /**
     * Applies initial colors and optional specular settings.
     *
     * @param {MtlStandardMaterialOptions} options - Initial material settings.
     * @private
     */
    #applyOptions(options) {
        const { ambientColor, specularColor, emissiveColor, shininess, specularStrength, opticalDensity } = options;

        this.setAmbientColor(ambientColor   || SharedMaterialConstants.MATERIAL_DEFAULT_COLOR);
        this.setSpecularColor(specularColor || SharedMaterialConstants.MATERIAL_DEFAULT_COLOR);
        this.setEmissiveColor(emissiveColor || MaterialConstants.MTL_STANDARD_MATERIAL_DEFAULTS.EMISSIVE_COLOR);

        if (shininess !== undefined) {
            this.setShininess(shininess);
        }

        if (specularStrength !== undefined) {
            this.setSpecularStrength(specularStrength);
        }

        if (opticalDensity !== undefined) {
            this.setOpticalDensity(opticalDensity);
        }
    }

    /**
     * Uploads colors and specular settings without creating temporary buffers.
     *
     * @param {ShaderProgram} shaderProgram - Active material program.
     * @private
     */
    #applyShadingUniforms(shaderProgram) {
        const uniforms       = MaterialConstants.MTL_STANDARD_MATERIAL_UNIFORMS;
        const sharedUniforms = SharedMaterialConstants.MATERIAL_UNIFORMS;
        const floatFlags     = SharedMaterialConstants.MATERIAL_BOOLEAN_FLOATS;
        shaderProgram.setVector3(uniforms.AMBIENT_COLOR, this.#ambientColor);
        shaderProgram.setVector3(sharedUniforms.SPECULAR_COLOR, this.#specularColor);
        shaderProgram.setVector3(uniforms.EMISSIVE_COLOR, this.#emissiveColor);
        shaderProgram.setFloat(sharedUniforms.SPECULAR_STRENGTH, this.#specularStrength);
        shaderProgram.setFloat(sharedUniforms.SHININESS, this.#shininess);
        shaderProgram.setFloat(uniforms.SPECULAR_ENABLED, this.#specularEnabled ? floatFlags.TRUE : floatFlags.FALSE);
    }

    /**
     * Uploads optical and surface detail settings.
     *
     * @param {ShaderProgram} shaderProgram - Active material program.
     * @private
     */
    #applySurfaceUniforms(shaderProgram) {
        const uniforms = MaterialConstants.MTL_STANDARD_MATERIAL_UNIFORMS;
        shaderProgram.setFloat(uniforms.OPTICAL_DENSITY, this.#opticalDensity);
        shaderProgram.setFloat(uniforms.BUMP_MULTIPLIER, this.#bumpMultiplier);
        shaderProgram.setFloat(uniforms.DISPLACEMENT_SCALE, this.#displacementScale);
    }

    /**
     * Uploads each map's independent UV buffers.
     *
     * @param {ShaderProgram} shaderProgram - Active material program.
     * @private
     */
    #applyUvTransforms(shaderProgram) {
        for (const map of this.#maps) {
            shaderProgram.setVector2(map.descriptor.UV_OFFSET, map.uvOffset);
            shaderProgram.setVector2(map.descriptor.UV_SCALE, map.uvScale);
        }
    }

    /**
     * Uploads the enabled flag for every texture map.
     *
     * @param {ShaderProgram} shaderProgram - Active material program.
     * @private
     */
    #applyMapFlags(shaderProgram) {
        const floatFlags = SharedMaterialConstants.MATERIAL_BOOLEAN_FLOATS;

        for (const map of this.#maps) {
            shaderProgram.setFloat(map.descriptor.ENABLED, map.enabled ? floatFlags.TRUE : floatFlags.FALSE);
        }
    }

    /**
     * Binds all map textures in their established sampler order.
     *
     * @param {ShaderProgram} shaderProgram - Active material program.
     * @private
     */
    #applyTextures(shaderProgram) {
        for (const map of this.#maps) {
            shaderProgram.setTexture2D(map.descriptor.SAMPLER, map.texture, map.textureUnitIndex);
        }
    }

    /**
     * Validates a replacement before changing any map state.
     * Omitted texture units preserve the slot's current assignment.
     *
     * @param {number} index                          - Map slot index.
     * @param {Texture2D} texture                     - Externally owned texture.
     * @param {MtlStandardMaterialMapOptions} options - Map settings.
     * @private
     */
    #setMap(index, texture, options) {
        const map     = this.#maps[index];
        const context = map.descriptor.CONTEXT;

        if (!(texture instanceof Texture2D)) {
            throw new TypeError(context + MTL_STANDARD_MATERIAL_EXCEPTION_MESSAGES.EXPECTS_TEXTURE_SUFFIX);
        }

        if (options === null || typeof options !== ECMASCRIPT_TYPEOF_RESULTS.OBJECT || Array.isArray(options)) {
            throw new TypeError(context + MTL_STANDARD_MATERIAL_EXCEPTION_MESSAGES.EXPECTS_OPTIONS_OBJECT_SUFFIX);
        }

        const settings = MtlStandardMaterial.#resolveMapOptions(context, options, map.textureUnitIndex);

        map.texture          = texture;
        map.textureUnitIndex = settings.textureUnitIndex;
        map.enabled          = true;
        map.uvOffset.set(settings.uvOffset);
        map.uvScale.set(settings.uvScale);
    }

    /**
     * Resolves a map's texture unit and UV transforms.
     *
     * @param {string} context                        - Method name for errors.
     * @param {MtlStandardMaterialMapOptions} options - Map settings.
     * @param {number} defaultTextureUnit             - Current texture unit.
     * @returns {MtlStandardMaterialMapOptions}       - Validated map settings.
     * @private
     */
    static #resolveMapOptions(context, options, defaultTextureUnit) {
        const {
            textureUnitIndex = defaultTextureUnit,
            uvOffset         = MaterialConstants.MTL_STANDARD_MATERIAL_DEFAULTS.UV_OFFSET,
            uvScale          = MaterialConstants.MTL_STANDARD_MATERIAL_DEFAULTS.UV_SCALE
        } = options;

        if (!Number.isInteger(textureUnitIndex) || textureUnitIndex < SharedMaterialConstants.MATERIAL_TEXTURE_UNITS.MIN) {
            throw new TypeError(context + MTL_STANDARD_MATERIAL_EXCEPTION_MESSAGES.EXPECTS_TEXTURE_UNIT_INDEX_SUFFIX);
        }

        const contexts = MaterialConstants.MTL_STANDARD_MATERIAL_CONTEXTS;
        MtlStandardMaterial.#assertVector2(context + contexts.UV_OFFSET, uvOffset);
        MtlStandardMaterial.#assertVector2(context + contexts.UV_SCALE, uvScale);
        return { textureUnitIndex, uvOffset, uvScale };
    }

    /**
     * Validates the `vector2` arrays.
     *
     * @param {string} context                - Error context.
     * @param {Float32Array | number[]} value - Vector to validate.
     * @returns {void}
     * @private
     */
    static #assertVector2(context, value) {
        if (!Array.isArray(value) && !(value instanceof Float32Array)) {
            throw new TypeError(context + MTL_STANDARD_MATERIAL_EXCEPTION_MESSAGES.EXPECTS_VECTOR2_TYPE_SUFFIX);
        }

        if (value.length !== MaterialConstants.MTL_STANDARD_MATERIAL_DEFAULTS.UV_OFFSET.length) {
            throw new TypeError(context + MTL_STANDARD_MATERIAL_EXCEPTION_MESSAGES.EXPECTS_VECTOR2_COMPONENTS_SUFFIX);
        }
    }

    /**
     * Validates the `vector3` arrays.
     *
     * @param {string} context                - Error context.
     * @param {Float32Array | number[]} value - Vector to validate.
     * @returns {void}
     * @private
     */
    static #assertVector3(context, value) {
        if (!Array.isArray(value) && !(value instanceof Float32Array)) {
            throw new TypeError(context + MTL_STANDARD_MATERIAL_EXCEPTION_MESSAGES.EXPECTS_VECTOR2_TYPE_SUFFIX);
        }

        if (value.length !== DirectionalMaterialConstants.DIRECTIONAL_LIGHT_MATERIAL_VECTOR3_ELEMENT_COUNT) {
            throw new TypeError(context + MTL_STANDARD_MATERIAL_EXCEPTION_MESSAGES.EXPECTS_VECTOR3_COMPONENTS_SUFFIX);
        }
    }
}

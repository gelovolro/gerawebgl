import { ECMASCRIPT_TYPEOF_RESULTS } from '../../constants/ecmascript-types.js';
import { LambertMaterial }           from '../../material/lambert-material.js';
import { PhongMaterial }             from '../../material/phong-material.js';
import { VertexColorMaterial }       from '../../material/vertex-color-material.js';
import { MtlStandardMaterial }       from '../../material/mtl-standard-material.js';
import { MtlTextureCache }           from './mtl-texture-cache.js';

/**
 * Default texture unit index.
 *
 * @type {number}
 */
const DEFAULT_TEXTURE_UNIT_INDEX = 0;

/**
 * Default opacity for materials.
 *
 * @type {number}
 */
const DEFAULT_OPACITY = 1.0;

/**
 * Default ambient strength for MTL materials.
 *
 * @type {number}
 */
const DEFAULT_AMBIENT_STRENGTH = 0.2;

/**
 * Number of components for RGB color.
 *
 * @type {number}
 */
const COLOR_COMPONENT_COUNT = 3;

/**
 * Default diffuse color for materials (white color).
 *
 * @type {Float32Array}
 */
const DEFAULT_DIFFUSE_COLOR = new Float32Array([1.0, 1.0, 1.0]);

/**
 * Default shininess, when `Ns` is missing.
 *
 * @type {number}
 */
const DEFAULT_SHININESS = 16.0;

/**
 * Default specular strength multiplier.
 *
 * @type {number}
 */
const DEFAULT_SPECULAR_STRENGTH = 1.0;

/**
 * Default optical density value.
 *
 * @type {number}
 */
const DEFAULT_OPTICAL_DENSITY = 1.0;

/**
 * Minimum shininess value.
 *
 * @type {number}
 */
const MIN_SHININESS = 1.0;

/**
 * Maximum shininess value.
 *
 * @type {number}
 */
const MAX_SHININESS = 128.0;

/**
 * Zero value, used for the numeric comparisons.
 *
 * @type {number}
 */
const ZERO_VALUE = 0;

/**
 * Epsilon used, when checking for near-zero ambient colors.
 *
 * @type {number}
 */
const AMBIENT_COLOR_EPSILON = 0.0001;

/**
 * Index, used to reference the first element in arrays.
 *
 * @type {number}
 */
const FIRST_INDEX = 0;

/**
 * Index, used to reference the second element in arrays.
 *
 * @type {number}
 */
const SECOND_INDEX = 1;

/**
 * Index, used to reference the third element in arrays.
 *
 * @type {number}
 */
const THIRD_INDEX = 2;

/**
 * Texture unit offset for diffuse map.
 *
 * @type {number}
 */
const TEXTURE_UNIT_DIFFUSE = 0;

/**
 * Texture unit offset for ambient map.
 *
 * @type {number}
 */
const TEXTURE_UNIT_AMBIENT = 1;

/**
 * Texture unit offset for specular map.
 *
 * @type {number}
 */
const TEXTURE_UNIT_SPECULAR = 2;

/**
 * Texture unit offset for alpha map.
 *
 * @type {number}
 */
const TEXTURE_UNIT_ALPHA = 3;

/**
 * Texture unit offset for bump map.
 *
 * @type {number}
 */
const TEXTURE_UNIT_BUMP = 4;

/**
 * Texture unit offset for displacement map.
 *
 * @type {number}
 */
const TEXTURE_UNIT_DISPLACEMENT = 5;

/**
 * Texture unit offset for reflection map.
 *
 * @type {number}
 */
const TEXTURE_UNIT_REFLECTION = 6;

/**
 * Texture unit range offset for map slots.
 *
 * @type {number}
 */
const MAX_TEXTURE_UNIT_OFFSET = TEXTURE_UNIT_REFLECTION;

/**
 * Error message for invalid WebGL context.
 *
 * @type {string}
 */
const ERROR_WEBGL_CONTEXT_TYPE = '`ObjMaterialFactory` expects a `WebGL2RenderingContext`.';

/**
 * Error message for invalid options.
 *
 * @type {string}
 */
const ERROR_OPTIONS_TYPE = '`ObjMaterialFactory` expects options as a plain object.';

/**
 * Error message for invalid texture unit index.
 *
 * @type {string}
 */
const ERROR_TEXTURE_UNIT_INDEX_TYPE = '`ObjMaterialFactory` expects `textureUnitIndex` as a non-negative integer.';

/**
 * Error message for invalid default color.
 *
 * @type {string}
 */
const ERROR_DEFAULT_COLOR_TYPE = '`ObjMaterialFactory` expects `defaultColor` as `number[]` or `Float32Array`.';

/**
 * Error message for invalid default color length.
 *
 * @type {string}
 */
const ERROR_DEFAULT_COLOR_LENGTH = '`ObjMaterialFactory` expects `defaultColor` to have 3 components.';

/**
 * Error message for invalid texture cache.
 *
 * @type {string}
 */
const ERROR_TEXTURE_CACHE_TYPE = '`ObjMaterialFactory` expects `textureCache` as `MtlTextureCache`.';

/**
 * Error message for invalid textures output.
 *
 * @type {string}
 */
const ERROR_TEXTURES_OUTPUT_TYPE = '`ObjMaterialFactory.createMaterial` expects `textures` as an array.';

/**
 * Error message for insufficient texture units.
 *
 * @type {string}
 */
const ERROR_TEXTURE_UNITS_LIMIT = '`ObjMaterialFactory` cannot allocate texture units for MTL maps. Increase available texture units or reduce the number of maps.';

/**
 * Type definition for options used by `ObjMaterialFactory`.
 *
 * @typedef {Object} ObjMaterialFactoryOptions
 * @property {number} [textureUnitIndex = 0]          - Texture unit index for the textured materials.
 * @property {Float32Array | number[]} [defaultColor] - Default diffuse color.
 * @property {MtlTextureCache} [textureCache]         - Optional shared texture cache.
 */

/**
 * Type definition for resolved texture URLs.
 *
 * @typedef {Object} ObjMaterialTextureUrls
 * @property {string | null} diffuse      - Diffuse map URL.
 * @property {string | null} ambient      - Ambient map URL.
 * @property {string | null} specular     - Specular map URL.
 * @property {string | null} alpha        - Alpha map URL.
 * @property {string | null} bump         - Bump map URL.
 * @property {string | null} displacement - Displacement map URL.
 * @property {string | null} reflection   - Reflection map URL.
 */

/**
 * Factory, that creates the engine materials from the parsed MTL data.
 */
export class ObjMaterialFactory {

    /**
     * WebGL2 rendering context used to create the materials.
     *
     * @type {WebGL2RenderingContext}
     * @private
     */
    #webglContext;

    /**
     * Texture unit index, used for the textured materials.
     *
     * @type {number}
     * @private
     */
    #textureUnitIndex;

    /**
     * Default diffuse color used, when no material info is available.
     *
     * @type {Float32Array}
     * @private
     */
    #defaultColor = new Float32Array(DEFAULT_DIFFUSE_COLOR);

    /**
     * Texture cache, used for loading the textures.
     *
     * @type {MtlTextureCache}
     * @private
     */
    #textureCache;

    /**
     * @param {WebGL2RenderingContext} webglContext - WebGL2 rendering context.
     * @param {ObjMaterialFactoryOptions} [options] - Factory options.
     * @throws {TypeError} When the inputs are invalid.
     */
    constructor(webglContext, options = {}) {
        if (!(webglContext instanceof WebGL2RenderingContext)) {
            throw new TypeError(ERROR_WEBGL_CONTEXT_TYPE);
        }

        if (options === null || typeof options !== ECMASCRIPT_TYPEOF_RESULTS.OBJECT || Array.isArray(options)) {
            throw new TypeError(ERROR_OPTIONS_TYPE);
        }

        const {
            textureUnitIndex = DEFAULT_TEXTURE_UNIT_INDEX,
            defaultColor,
            textureCache
        } = options;

        if (!Number.isInteger(textureUnitIndex) || textureUnitIndex < ZERO_VALUE) {
            throw new TypeError(ERROR_TEXTURE_UNIT_INDEX_TYPE);
        }

        if (defaultColor !== undefined) {
            if (!Array.isArray(defaultColor) && !(defaultColor instanceof Float32Array)) {
                throw new TypeError(ERROR_DEFAULT_COLOR_TYPE);
            }

            if (defaultColor.length !== COLOR_COMPONENT_COUNT) {
                throw new TypeError(ERROR_DEFAULT_COLOR_LENGTH);
            }

            this.#defaultColor.set(defaultColor);
        }

        if (textureCache !== undefined && !(textureCache instanceof MtlTextureCache)) {
            throw new TypeError(ERROR_TEXTURE_CACHE_TYPE);
        }

        this.#webglContext     = webglContext;
        this.#textureUnitIndex = textureUnitIndex;
        this.#textureCache     = textureCache || new MtlTextureCache(webglContext);
    }

    /**
     * Creates a material instance, based on MTL data.
     *
     * @param {Object | null} definition                  - Parsed material definition.
     * @param {ObjMaterialTextureUrls | null} textureUrls - Resolved texture URLs.
     * @param {Array} textures                            - Output list of created textures.
     * @param {boolean} [useVertexColors = false]         - Whether the vertex colors are available.
     * @returns {Promise<LambertMaterial | PhongMaterial | VertexColorMaterial | MtlStandardMaterial>} - Promise, that resolves with the created material instance, based on the parsed MTL definition and the available inputs.
     * @throws {TypeError} When textures output is invalid.
     */
    async createMaterial(definition, textureUrls, textures, useVertexColors = false) {
        if (!Array.isArray(textures)) {
            throw new TypeError(ERROR_TEXTURES_OUTPUT_TYPE);
        }

        const opacity = definition ? definition.opacity : DEFAULT_OPACITY;

        if (definition && this.#requiresStandardMaterial(definition, textureUrls)) {
            this.#assertTextureUnitsAvailable(definition, textureUrls);

            const ambientColor = ObjMaterialFactory.#resolveAmbientColor(definition);
            const material     = new MtlStandardMaterial(this.#webglContext, {
                diffuseColor    : definition.diffuseColor,
                ambientColor    : ambientColor,
                specularColor   : definition.specularColor,
                emissiveColor   : definition.emissiveColor,
                ambientStrength : DEFAULT_AMBIENT_STRENGTH
            });

            material.setOpacity(opacity);
            material.setShininess(ObjMaterialFactory.#clampShininess(definition.specularExponent));
            material.setSpecularStrength(DEFAULT_SPECULAR_STRENGTH);
            material.setOpticalDensity(definition.opticalDensity ?? DEFAULT_OPTICAL_DENSITY);
            material.setSpecularEnabled(ObjMaterialFactory.#isSpecularEnabled(definition));

            if (textureUrls && definition.diffuseMap && textureUrls.diffuse) {
                const texture = await this.#textureCache.getTexture(textureUrls.diffuse, textures, {
                    clamp : definition.diffuseMap.clamp
                });

                material.setDiffuseMap(texture, {
                    textureUnitIndex : this.#textureUnitIndex + TEXTURE_UNIT_DIFFUSE,
                    uvOffset         : definition.diffuseMap.offset,
                    uvScale          : definition.diffuseMap.scale
                });
            }

            if (textureUrls && definition.ambientMap && textureUrls.ambient) {
                const texture = await this.#textureCache.getTexture(textureUrls.ambient, textures, {
                    clamp : definition.ambientMap.clamp
                });

                material.setAmbientMap(texture, {
                    textureUnitIndex : this.#textureUnitIndex + TEXTURE_UNIT_AMBIENT,
                    uvOffset         : definition.ambientMap.offset,
                    uvScale          : definition.ambientMap.scale
                });
            }

            if (textureUrls && definition.specularMap && textureUrls.specular) {
                const texture = await this.#textureCache.getTexture(textureUrls.specular, textures, {
                    clamp : definition.specularMap.clamp
                });

                material.setSpecularMap(texture, {
                    textureUnitIndex : this.#textureUnitIndex + TEXTURE_UNIT_SPECULAR,
                    uvOffset         : definition.specularMap.offset,
                    uvScale          : definition.specularMap.scale
                });
            }

            if (textureUrls && definition.alphaMap && textureUrls.alpha) {
                const texture = await this.#textureCache.getTexture(textureUrls.alpha, textures, {
                    clamp : definition.alphaMap.clamp
                });

                material.setAlphaMap(texture, {
                    textureUnitIndex : this.#textureUnitIndex + TEXTURE_UNIT_ALPHA,
                    uvOffset         : definition.alphaMap.offset,
                    uvScale          : definition.alphaMap.scale
                });
            }

            if (textureUrls && definition.bumpMap && textureUrls.bump) {
                const texture = await this.#textureCache.getTexture(textureUrls.bump, textures, {
                    clamp : definition.bumpMap.clamp
                });

                material.setBumpMap(texture, {
                    textureUnitIndex : this.#textureUnitIndex + TEXTURE_UNIT_BUMP,
                    uvOffset         : definition.bumpMap.offset,
                    uvScale          : definition.bumpMap.scale
                });

                material.setBumpMultiplier(definition.bumpMap.bumpMultiplier);
            }

            if (textureUrls && definition.displacementMap && textureUrls.displacement) {
                const texture = await this.#textureCache.getTexture(textureUrls.displacement, textures, {
                    clamp : definition.displacementMap.clamp
                });

                material.setDisplacementMap(texture, {
                    textureUnitIndex : this.#textureUnitIndex + TEXTURE_UNIT_DISPLACEMENT,
                    uvOffset         : definition.displacementMap.offset,
                    uvScale          : definition.displacementMap.scale
                });
            }

            if (textureUrls && definition.reflectionMap && textureUrls.reflection) {
                const texture = await this.#textureCache.getTexture(textureUrls.reflection, textures, {
                    clamp : definition.reflectionMap.clamp
                });

                material.setReflectionMap(texture, {
                    textureUnitIndex : this.#textureUnitIndex + TEXTURE_UNIT_REFLECTION,
                    uvOffset         : definition.reflectionMap.offset,
                    uvScale          : definition.reflectionMap.scale
                });
            }

            return material;
        }

        if (useVertexColors && !this.#hasSpecularInfo(definition)) {
            const material = new VertexColorMaterial(this.#webglContext);
            material.setOpacity(opacity);
            return material;
        }

        if (this.#hasSpecularInfo(definition)) {
            const diffuseColor  = definition ? definition.diffuseColor : this.#defaultColor;
            const specularColor = definition ? definition.specularColor : new Float32Array(COLOR_COMPONENT_COUNT);
            const shininess     = ObjMaterialFactory.#clampShininess(definition ? definition.specularExponent : null);
            const material      = new PhongMaterial(this.#webglContext, {
                color : diffuseColor,
                specularColor,
                shininess
            });

            material.setOpacity(opacity);
            return material;
        }

        if (definition) {
            const material = new LambertMaterial(this.#webglContext, { color: definition.diffuseColor });
            material.setOpacity(opacity);
            return material;
        }

        const fallbackMaterial = new LambertMaterial(this.#webglContext, { color: this.#defaultColor });
        fallbackMaterial.setOpacity(opacity);
        return fallbackMaterial;
    }

    /**
     * Determines whether the material has the specular data.
     *
     * @param {Object | null} definition - Parsed material definition.
     * @returns {boolean}                - True, when the definition contains the specular exponent or the non-zero specular color.
     * @private
     */
    #hasSpecularInfo(definition) {
        if (!definition) {
            return false;
        }

        if (definition.specularExponent !== null) {
            return true;
        }

        const specular = definition.specularColor;
        return Boolean(specular && (specular[FIRST_INDEX] > ZERO_VALUE
            || specular[SECOND_INDEX] > ZERO_VALUE
            || specular[THIRD_INDEX] > ZERO_VALUE));
    }

    /**
     * Resolves the ambient color, applying fallback to diffuse the color, when needed.
     *
     * @param {Object} definition                - Parsed material definition.
     * @returns {Float32Array | number[] | null} - Resolved ambient color.
     * @private
     */
    static #resolveAmbientColor(definition) {
        if (!definition) {
            return null;
        }

        if (definition.ambientMap) {
            return definition.ambientColor;
        }

        if (ObjMaterialFactory.#isColorNearZero(definition.ambientColor)) {
            return null;
        }

        return definition.ambientColor;
    }

    /**
     * Checks whether a color is effectively zero.
     *
     * @param {Float32Array | number[] | null} color - Color input.
     * @returns {boolean}                            - True, when color is missing or near zero.
     * @private
     */
    static #isColorNearZero(color) {
        if (!color || typeof color.length !== ECMASCRIPT_TYPEOF_RESULTS.NUMBER || color.length < COLOR_COMPONENT_COUNT) {
            return true;
        }

        return Math.abs(color[FIRST_INDEX])  <= AMBIENT_COLOR_EPSILON
            && Math.abs(color[SECOND_INDEX]) <= AMBIENT_COLOR_EPSILON
            && Math.abs(color[THIRD_INDEX])  <= AMBIENT_COLOR_EPSILON;
    }

    /**
     * Clamps the shininess value into the allowed range.
     *
     * @param {number | null} value - Specular exponent.
     * @returns {number}            - Clamped shininess value within the allowed range (falls back to the default, when input is invalid).
     * @private
     */
    static #clampShininess(value) {
        if (typeof value !== ECMASCRIPT_TYPEOF_RESULTS.NUMBER || !Number.isFinite(value)) {
            return DEFAULT_SHININESS;
        }

        return Math.min(Math.max(value, MIN_SHININESS), MAX_SHININESS);
    }

    /**
     * Determines if the material should be rendered with the standard MTL material.
     *
     * @param {Object} definition                         - Parsed material definition.
     * @param {ObjMaterialTextureUrls | null} textureUrls - Resolved texture URLs.
     * @returns {boolean}                                 - True, when the standard MTL material is required.
     * @private
     */
    #requiresStandardMaterial(definition, textureUrls) {
        if (!definition) {
            return false;
        }

        const hasMaps = Boolean(definition.diffuseMap
            || definition.ambientMap
            || definition.specularMap
            || definition.alphaMap
            || definition.bumpMap
            || definition.displacementMap
            || definition.reflectionMap);

        const hasIllumination = definition.illuminationModel !== null;
        const hasSpecular     = this.#hasSpecularInfo(definition);

        if (hasMaps || hasIllumination || hasSpecular) {
            return true;
        }

        return Boolean(textureUrls && textureUrls.diffuse);
    }

    /**
     * Checks if specular lighting should be enabled.
     *
     * @param {Object} definition - Parsed material definition.
     * @returns {boolean}         - True when specular should be enabled.
     * @private
     */
    static #isSpecularEnabled(definition) {
        if (!definition || definition.illuminationModel === null) {
            return true;
        }

        return definition.illuminationModel >= SECOND_INDEX;
    }

    /**
     * Ensures texture units are available for all required maps.
     *
     * @param {Object} definition                         - Parsed material definition.
     * @param {ObjMaterialTextureUrls | null} textureUrls - Resolved texture URLs.
     * @returns {void}
     * @throws {Error} When available texture units are insufficient.
     * @private
     */
    #assertTextureUnitsAvailable(definition, textureUrls) {
        const maxUnits = this.#webglContext.getParameter(this.#webglContext.MAX_COMBINED_TEXTURE_IMAGE_UNITS);

        if (!Number.isInteger(maxUnits) || maxUnits <= ZERO_VALUE) {
            throw new Error(ERROR_TEXTURE_UNITS_LIMIT);
        }

        const usesDiffuse      = Boolean(textureUrls && definition.diffuseMap && textureUrls.diffuse);
        const usesAmbient      = Boolean(textureUrls && definition.ambientMap && textureUrls.ambient);
        const usesSpecular     = Boolean(textureUrls && definition.specularMap && textureUrls.specular);
        const usesAlpha        = Boolean(textureUrls && definition.alphaMap && textureUrls.alpha);
        const usesBump         = Boolean(textureUrls && definition.bumpMap && textureUrls.bump);
        const usesDisplacement = Boolean(textureUrls && definition.displacementMap && textureUrls.displacement);
        const usesReflection   = Boolean(textureUrls && definition.reflectionMap && textureUrls.reflection);
        let maxOffset          = ZERO_VALUE;

        if (usesDiffuse) {
            maxOffset = Math.max(maxOffset, TEXTURE_UNIT_DIFFUSE);
        }

        if (usesAmbient) {
            maxOffset = Math.max(maxOffset, TEXTURE_UNIT_AMBIENT);
        }

        if (usesSpecular) {
            maxOffset = Math.max(maxOffset, TEXTURE_UNIT_SPECULAR);
        }

        if (usesAlpha) {
            maxOffset = Math.max(maxOffset, TEXTURE_UNIT_ALPHA);
        }

        if (usesBump) {
            maxOffset = Math.max(maxOffset, TEXTURE_UNIT_BUMP);
        }

        if (usesDisplacement) {
            maxOffset = Math.max(maxOffset, TEXTURE_UNIT_DISPLACEMENT);
        }

        if (usesReflection) {
            maxOffset = Math.max(maxOffset, TEXTURE_UNIT_REFLECTION);
        }

        if (maxOffset > MAX_TEXTURE_UNIT_OFFSET) {
            throw new Error(ERROR_TEXTURE_UNITS_LIMIT);
        }

        const highestUnitIndex = this.#textureUnitIndex + maxOffset;

        if (highestUnitIndex >= maxUnits) {
            throw new Error(ERROR_TEXTURE_UNITS_LIMIT);
        }
    }
}

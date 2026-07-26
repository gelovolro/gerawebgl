import { ECMASCRIPT_TYPEOF_RESULTS } from '../../constants/ecmascript-types.js';
import { MaterialNameNormalizer }    from './material-name-normalizer.js';

/**
 * Token, that starts a comment line in MTL files.
 *
 * @type {string}
 */
const COMMENT_TOKEN = '#';

/**
 * MTL token for new material declaration.
 *
 * @type {string}
 */
const MTL_NEW_MATERIAL_TOKEN = 'newmtl';

/**
 * MTL token for diffuse color.
 *
 * @type {string}
 */
const MTL_DIFFUSE_COLOR_TOKEN = 'Kd';

/**
 * MTL token for ambient color.
 *
 * @type {string}
 */
const MTL_AMBIENT_COLOR_TOKEN = 'Ka';

/**
 * MTL token for specular color.
 *
 * @type {string}
 */
const MTL_SPECULAR_COLOR_TOKEN = 'Ks';

/**
 * MTL token for emissive color.
 *
 * @type {string}
 */
const MTL_EMISSIVE_COLOR_TOKEN = 'Ke';

/**
 * MTL token for specular exponent.
 *
 * @type {string}
 */
const MTL_SPECULAR_EXPONENT_TOKEN = 'Ns';

/**
 * MTL token for optical density.
 *
 * @type {string}
 */
const MTL_OPTICAL_DENSITY_TOKEN = 'Ni';

/**
 * MTL token for illumination model.
 *
 * @type {string}
 */
const MTL_ILLUMINATION_MODEL_TOKEN = 'illum';

/**
 * MTL token for diffuse texture map.
 *
 * @type {string}
 */
const MTL_DIFFUSE_MAP_TOKEN = 'map_Kd';

/**
 * MTL token for ambient texture map.
 *
 * @type {string}
 */
const MTL_AMBIENT_MAP_TOKEN = 'map_Ka';

/**
 * MTL token for specular texture map.
 *
 * @type {string}
 */
const MTL_SPECULAR_MAP_TOKEN = 'map_Ks';

/**
 * MTL token for alpha texture map.
 *
 * @type {string}
 */
const MTL_ALPHA_MAP_TOKEN = 'map_d';

/**
 * MTL token for bump map.
 *
 * @type {string}
 */
const MTL_BUMP_MAP_TOKEN = 'bump';

/**
 * Alternate MTL token for bump map.
 *
 * @type {string}
 */
const MTL_BUMP_MAP_ALT_TOKEN = 'map_Bump';

/**
 * Additional lowercase MTL token for the bump map.
 *
 * @type {string}
 */
const MTL_BUMP_MAP_LOWER_TOKEN = 'map_bump';

/**
 * MTL token for displacement map.
 *
 * @type {string}
 */
const MTL_DISPLACEMENT_MAP_TOKEN = 'disp';

/**
 * MTL token for reflection map.
 *
 * @type {string}
 */
const MTL_REFLECTION_MAP_TOKEN = 'refl';

/**
 * MTL token for opacity.
 *
 * @type {string}
 */
const MTL_OPACITY_TOKEN = 'd';

/**
 * MTL token for transparency.
 *
 * @type {string}
 */
const MTL_TRANSPARENCY_TOKEN = 'Tr';

/**
 * MTL map option for scaling.
 *
 * @type {string}
 */
const MTL_MAP_OPTION_SCALE = '-s';

/**
 * MTL map option for offset.
 *
 * @type {string}
 */
const MTL_MAP_OPTION_OFFSET = '-o';

/**
 * MTL map option for clamping.
 *
 * @type {string}
 */
const MTL_MAP_OPTION_CLAMP = '-clamp';

/**
 * MTL map option for bump multiplier.
 *
 * @type {string}
 */
const MTL_MAP_OPTION_BUMP_MULTIPLIER = '-bm';

/**
 * MTL map option for the U-blending.
 *
 * @type {string}
 */
const MTL_MAP_OPTION_BLENDU = '-blendu';

/**
 * MTL map option for the V-blending.
 *
 * @type {string}
 */
const MTL_MAP_OPTION_BLENDV = '-blendv';

/**
 * MTL map option for the image channel.
 *
 * @type {string}
 */
const MTL_MAP_OPTION_IMFCHAN = '-imfchan';

/**
 * MTL map option for base and gain.
 *
 * @type {string}
 */
const MTL_MAP_OPTION_MM = '-mm';

/**
 * MTL map option for the texture resolution.
 *
 * @type {string}
 */
const MTL_MAP_OPTION_TEXRES = '-texres';

/**
 * MTL map option for the texture type.
 *
 * @type {string}
 */
const MTL_MAP_OPTION_TYPE = '-type';

/**
 * Default offset for the texture map options.
 *
 * @type {Float32Array}
 */
const DEFAULT_MAP_OFFSET = new Float32Array([0.0, 0.0]);

/**
 * Default scale for the texture map options.
 *
 * @type {Float32Array}
 */
const DEFAULT_MAP_SCALE = new Float32Array([1.0, 1.0]);

/**
 * Default clamp flag for the texture maps.
 *
 * @type {boolean}
 */
const DEFAULT_MAP_CLAMP = false;

/**
 * Default bump multiplier value.
 *
 * @type {number}
 */
const DEFAULT_BUMP_MULTIPLIER = 1.0;

/**
 * Token, representing the `on` value in map options.
 *
 * @type {string}
 */
const CLAMP_ON_TOKEN = 'on';

/**
 * Token, representing the `off` value in map options.
 *
 * @type {string}
 */
const CLAMP_OFF_TOKEN = 'off';

/**
 * Token for numeric value `1`.
 *
 * @type {string}
 */
const CLAMP_ON_NUMERIC_TOKEN = '1';

/**
 * Token for numeric value `0`.
 *
 * @type {string}
 */
const CLAMP_OFF_NUMERIC_TOKEN = '0';

/**
 * Count of vector components for scale/offset map options (UV only).
 *
 * @type {number}
 */
const MTL_MAP_UV_COMPONENTS = 2;

/**
 * Optional third component for scale/offset map options.
 *
 * @type {number}
 */
const MTL_MAP_OPTIONAL_VECTOR_COMPONENTS = 1;

/**
 * Count of components for the blend options.
 *
 * @type {number}
 */
const MTL_MAP_BLEND_COMPONENTS = 1;

/**
 * Count of components for the image channel option.
 *
 * @type {number}
 */
const MTL_MAP_IMFCHAN_COMPONENTS = 1;

/**
 * Count of components for the base/gain option.
 *
 * @type {number}
 */
const MTL_MAP_MM_COMPONENTS = 2;

/**
 * Count of components for the texture resolution option.
 *
 * @type {number}
 */
const MTL_MAP_TEXRES_COMPONENTS = 1;

/**
 * Count of components for the type option.
 *
 * @type {number}
 */
const MTL_MAP_TYPE_COMPONENTS = 1;

/**
 * Count of scalar components for map options like `-clamp` and `-bm`.
 *
 * @type {number}
 */
const MTL_MAP_SCALAR_COMPONENTS = 1;

/**
 * Number of components for the RGB-color.
 *
 * @type {number}
 */
const COLOR_COMPONENT_COUNT = 3;

/**
 * Default opacity for materials.
 *
 * @type {number}
 */
const DEFAULT_OPACITY = 1.0;

/**
 * Default diffuse color for materials (white).
 *
 * @type {Float32Array}
 */
const DEFAULT_DIFFUSE_COLOR = new Float32Array([1.0, 1.0, 1.0]);

/**
 * Default specular color for materials.
 *
 * @type {Float32Array}
 */
const DEFAULT_SPECULAR_COLOR = new Float32Array([0.0, 0.0, 0.0]);

/**
 * Default ambient color for materials.
 *
 * @type {Float32Array}
 */
const DEFAULT_AMBIENT_COLOR = new Float32Array([0.0, 0.0, 0.0]);

/**
 * Default emissive color for materials.
 *
 * @type {Float32Array}
 */
const DEFAULT_EMISSIVE_COLOR = new Float32Array([0.0, 0.0, 0.0]);

/**
 * Zero value used for numeric comparisons.
 *
 * @type {number}
 */
const ZERO_VALUE = 0;

/**
 * Empty string constant.
 *
 * @type {string}
 */
const EMPTY_STRING = '';

/**
 * Space separator, used to join the split-tokens back into the names.
 *
 * @type {string}
 */
const SPACE_SEPARATOR = ' ';

/**
 * Regular expression used to split the MTL lines by whitespace.
 *
 * @type {RegExp}
 */
const LINE_SPLIT_REGEX = /\s+/u;

/**
 * Regular expression used to split the MTL text into lines.
 *
 * @type {RegExp}
 */
const LINE_BREAK_REGEX = /\r?\n/u;

/**
 * Regular expression for validating numeric map tokens.
 *
 * @type {RegExp}
 */
const MAP_FLOAT_TOKEN_REGEX = /^[+-]?(?:\d+\.?\d*|\d*\.?\d+)(?:[eE][+-]?\d+)?$/u;

/**
 * Hyphen separator sign.
 *
 * @type {string}
 */
const HYPHEN_SEPARATOR = '-';

/**
 * Token, used to wrap quoted paths.
 *
 * @type {string}
 */
const QUOTE_TOKEN = '"';

/**
 * Index value used, when a substring search fails.
 *
 * @type {number}
 */
const NOT_FOUND_INDEX = -1;

/**
 * Index used to reference the first element in arrays.
 *
 * @type {number}
 */
const FIRST_INDEX = 0;

/**
 * Index used to reference the second element in arrays.
 *
 * @type {number}
 */
const SECOND_INDEX = 1;

/**
 * Index used to reference the third element in arrays.
 *
 * @type {number}
 */
const THIRD_INDEX = 2;

/**
 * Index used to reference the fourth element in arrays.
 *
 * @type {number}
 */
const FOURTH_INDEX = 3;

/**
 * Decimal radix for integer parsing.
 *
 * @type {number}
 */
const DECIMAL_RADIX = 10;

/**
 * Error message for invalid MTL text input.
 *
 * @type {string}
 */
const ERROR_MTL_TEXT_TYPE = '`MtlParser.parse` expects `mtlText` as a string.';

/**
 * Parsed MTL material definition.
 *
 * @typedef {Object} ParsedMtlMaterial
 * @property {string} name                                - Material name.
 * @property {Float32Array} diffuseColor                  - Diffuse RGB color.
 * @property {Float32Array} ambientColor                  - Ambient RGB color (parsed-only).
 * @property {Float32Array} specularColor                 - Specular RGB color.
 * @property {Float32Array} emissiveColor                 - Emissive RGB color (parsed-only).
 * @property {ParsedMtlTextureMap | null} diffuseMap      - Diffuse texture data, if any.
 * @property {ParsedMtlTextureMap | null} ambientMap      - Ambient texture data (parsed-only).
 * @property {ParsedMtlTextureMap | null} specularMap     - Specular texture data (parsed-only).
 * @property {ParsedMtlTextureMap | null} alphaMap        - Alpha texture data (parsed-only).
 * @property {ParsedMtlTextureMap | null} bumpMap         - Bump texture data (parsed-only).
 * @property {ParsedMtlTextureMap | null} displacementMap - Displacement texture data (parsed-only).
 * @property {ParsedMtlTextureMap | null} reflectionMap   - Reflection texture data (parsed-only).
 * @property {number | null} specularExponent             - Specular exponent (Ns).
 * @property {number | null} opticalDensity               - Optical density (parsed-only).
 * @property {number | null} illuminationModel            - Illumination model (parsed-only).
 * @property {number} opacity                             - Opacity multiplier.
 */

/**
 * Parsed MTL texture map data.
 *
 * @typedef {Object} ParsedMtlTextureMap
 * @property {string} path           - Texture path.
 * @property {Float32Array} offset   - UV offset as `[u, v]`.
 * @property {Float32Array} scale    - UV scale as `[u, v]`.
 * @property {boolean} clamp         - True when clamping is enabled.
 * @property {number} bumpMultiplier - Bump multiplier value.
 */

/**
 * Parser for the MTL material libraries.
 */
export class MtlParser {

    /**
     * Parses the MTL text into the material definitions.
     *
     * @param {string} mtlText                   - MTL file contents.
     * @returns {Map<string, ParsedMtlMaterial>} - Map of parsed materials keyed by the material name.
     * @throws {TypeError} When mtlText is not a string.
     */
    parse(mtlText) {
        if (typeof mtlText !== ECMASCRIPT_TYPEOF_RESULTS.STRING) {
            throw new TypeError(ERROR_MTL_TEXT_TYPE);
        }

        const materials     = new Map();
        const lines         = mtlText.split(LINE_BREAK_REGEX);
        let currentMaterial = null;

        for (const line of lines) {
            const trimmed = line.trim();

            if (!trimmed || trimmed.startsWith(COMMENT_TOKEN)) {
                continue;
            }

            const parts   = trimmed.split(LINE_SPLIT_REGEX);
            const keyword = parts[FIRST_INDEX];

            switch (keyword) {
                case MTL_NEW_MATERIAL_TOKEN: {
                    const rawName = parts.slice(SECOND_INDEX).join(SPACE_SEPARATOR);
                    const name = rawName ? MaterialNameNormalizer.normalize(rawName) : EMPTY_STRING;

                    if (!name) {
                        currentMaterial = null;
                        break;
                    }

                    currentMaterial = {
                        name,
                        diffuseColor      : new Float32Array(DEFAULT_DIFFUSE_COLOR),
                        ambientColor      : new Float32Array(DEFAULT_AMBIENT_COLOR),
                        specularColor     : new Float32Array(DEFAULT_SPECULAR_COLOR),
                        emissiveColor     : new Float32Array(DEFAULT_EMISSIVE_COLOR),
                        diffuseMap        : null,
                        ambientMap        : null,
                        specularMap       : null,
                        alphaMap          : null,
                        bumpMap           : null,
                        displacementMap   : null,
                        reflectionMap     : null,
                        specularExponent  : null,
                        opticalDensity    : null,
                        illuminationModel : null,
                        opacity           : DEFAULT_OPACITY
                    };

                    materials.set(name, currentMaterial);
                    break;
                }

                case MTL_AMBIENT_COLOR_TOKEN: {
                    if (!currentMaterial) {
                        break;
                    }

                    const color = MtlParser.#parseFloatTriplet(parts, COLOR_COMPONENT_COUNT);
                    currentMaterial.ambientColor.set(color);
                    break;
                }

                case MTL_DIFFUSE_COLOR_TOKEN: {
                    if (!currentMaterial) {
                        break;
                    }

                    const color = MtlParser.#parseFloatTriplet(parts, COLOR_COMPONENT_COUNT);
                    currentMaterial.diffuseColor.set(color);
                    break;
                }

                case MTL_SPECULAR_COLOR_TOKEN: {
                    if (!currentMaterial) {
                        break;
                    }

                    const color = MtlParser.#parseFloatTriplet(parts, COLOR_COMPONENT_COUNT);
                    currentMaterial.specularColor.set(color);
                    break;
                }

                case MTL_EMISSIVE_COLOR_TOKEN: {
                    if (!currentMaterial) {
                        break;
                    }

                    const color = MtlParser.#parseFloatTriplet(parts, COLOR_COMPONENT_COUNT);
                    currentMaterial.emissiveColor.set(color);
                    break;
                }

                case MTL_SPECULAR_EXPONENT_TOKEN: {
                    if (!currentMaterial) {
                        break;
                    }

                    currentMaterial.specularExponent = MtlParser.#parseFloatValue(parts[SECOND_INDEX]);
                    break;
                }

                case MTL_OPTICAL_DENSITY_TOKEN: {
                    if (!currentMaterial) {
                        break;
                    }

                    currentMaterial.opticalDensity = MtlParser.#parseFloatValue(parts[SECOND_INDEX]);
                    break;
                }

                case MTL_ILLUMINATION_MODEL_TOKEN: {
                    if (!currentMaterial) {
                        break;
                    }

                    const illumValue = Number.parseInt(parts[SECOND_INDEX], DECIMAL_RADIX);
                    currentMaterial.illuminationModel = Number.isFinite(illumValue) ? illumValue : null;
                    break;
                }

                case MTL_DIFFUSE_MAP_TOKEN: {
                    if (!currentMaterial) {
                        break;
                    }

                    const mapData = MtlParser.#parseMtlMapLine(trimmed);
                    currentMaterial.diffuseMap = mapData;
                    break;
                }

                case MTL_AMBIENT_MAP_TOKEN: {
                    if (!currentMaterial) {
                        break;
                    }

                    const mapData = MtlParser.#parseMtlMapLine(trimmed);
                    currentMaterial.ambientMap = mapData;
                    break;
                }

                case MTL_SPECULAR_MAP_TOKEN: {
                    if (!currentMaterial) {
                        break;
                    }

                    const mapData = MtlParser.#parseMtlMapLine(trimmed);
                    currentMaterial.specularMap = mapData;
                    break;
                }

                case MTL_ALPHA_MAP_TOKEN: {
                    if (!currentMaterial) {
                        break;
                    }

                    const mapData = MtlParser.#parseMtlMapLine(trimmed);
                    currentMaterial.alphaMap = mapData;
                    break;
                }

                case MTL_BUMP_MAP_TOKEN:
                case MTL_BUMP_MAP_ALT_TOKEN:
                case MTL_BUMP_MAP_LOWER_TOKEN: {
                    if (!currentMaterial) {
                        break;
                    }

                    const mapData = MtlParser.#parseMtlMapLine(trimmed);
                    currentMaterial.bumpMap = mapData;
                    break;
                }

                case MTL_DISPLACEMENT_MAP_TOKEN: {
                    if (!currentMaterial) {
                        break;
                    }

                    const mapData = MtlParser.#parseMtlMapLine(trimmed);
                    currentMaterial.displacementMap = mapData;
                    break;
                }

                case MTL_REFLECTION_MAP_TOKEN: {
                    if (!currentMaterial) {
                        break;
                    }

                    const mapData = MtlParser.#parseMtlMapLine(trimmed);
                    currentMaterial.reflectionMap = mapData;
                    break;
                }

                case MTL_OPACITY_TOKEN: {
                    if (!currentMaterial) {
                        break;
                    }

                    const value = MtlParser.#parseFloatValue(parts[SECOND_INDEX]);

                    if (value !== null) {
                        currentMaterial.opacity = value;
                    }

                    break;
                }

                case MTL_TRANSPARENCY_TOKEN: {
                    if (!currentMaterial) {
                        break;
                    }

                    const value = MtlParser.#parseFloatValue(parts[SECOND_INDEX]);

                    if (value !== null) {
                        currentMaterial.opacity = DEFAULT_OPACITY - value;
                    }

                    break;
                }

                default:
                    break;
            }
        }

        return materials;
    }

    /**
     * Parses a float triplet from line parts.
     *
     * @param {string[]} parts  - Line parts.
     * @param {number} expected - Expected component count.
     * @returns {number[]}      - Array of parsed float components, returns zeros when values are missing.
     * @private
     */
    static #parseFloatTriplet(parts, expected) {
        if (parts.length <= expected) {
            return [ZERO_VALUE, ZERO_VALUE, ZERO_VALUE];
        }

        return [
            Number.parseFloat(parts[SECOND_INDEX]),
            Number.parseFloat(parts[THIRD_INDEX]),
            Number.parseFloat(parts[FOURTH_INDEX])
        ];
    }

    /**
     * Parses a float value from string.
     *
     * @param {string} value    - String value.
     * @returns {number | null} - Parsed finite float value, or `null` when the input is empty or not a finite number.
     * @private
     */
    static #parseFloatValue(value) {
        if (!value) {
            return null;
        }

        const parsed = Number.parseFloat(value);
        return Number.isFinite(parsed) ? parsed : null;
    }

    /**
     * Parses the texture map line and extracts the file path.
     *
     * @param {string} line                  - Full `map_*` line.
     * @returns {ParsedMtlTextureMap | null} - Parsed texture map data, or null when no path is found.
     * @private
     */
    static #parseMtlMapLine(line) {
        if (typeof line !== ECMASCRIPT_TYPEOF_RESULTS.STRING) {
            return null;
        }

        let sanitized      = line;
        const commentIndex = sanitized.indexOf(COMMENT_TOKEN);

        if (commentIndex !== NOT_FOUND_INDEX) {
            sanitized = sanitized.slice(FIRST_INDEX, commentIndex);
        }

        sanitized = sanitized.trim();

        if (!sanitized) {
            return null;
        }

        const tokens = MtlParser.#splitTokens(sanitized);

        if (tokens.length <= SECOND_INDEX) {
            return null;
        }

        const mapData = MtlParser.#createDefaultTextureMap();
        let index     = SECOND_INDEX;

        while (index < tokens.length) {
            const token = tokens[index];

            if (token.startsWith(HYPHEN_SEPARATOR)) {
                switch (token) {
                    case MTL_MAP_OPTION_SCALE:
                        index = MtlParser.#consumeMapVectorOption(mapData.scale, tokens, index, DEFAULT_MAP_SCALE);
                        break;

                    case MTL_MAP_OPTION_OFFSET:
                        index = MtlParser.#consumeMapVectorOption(mapData.offset, tokens, index, DEFAULT_MAP_OFFSET);
                        break;

                    case MTL_MAP_OPTION_CLAMP:
                        mapData.clamp = MtlParser.#parseClampToken(tokens[index + SECOND_INDEX]);
                        index += MTL_MAP_SCALAR_COMPONENTS + SECOND_INDEX;
                        break;

                    case MTL_MAP_OPTION_BUMP_MULTIPLIER:
                        mapData.bumpMultiplier = MtlParser.#parseFloatValue(tokens[index + SECOND_INDEX]) ?? DEFAULT_BUMP_MULTIPLIER;
                        index += MTL_MAP_SCALAR_COMPONENTS + SECOND_INDEX;
                        break;

                    case MTL_MAP_OPTION_BLENDU:
                    case MTL_MAP_OPTION_BLENDV:
                        index += MTL_MAP_BLEND_COMPONENTS + SECOND_INDEX;
                        break;

                    case MTL_MAP_OPTION_IMFCHAN:
                        index += MTL_MAP_IMFCHAN_COMPONENTS + SECOND_INDEX;
                        break;

                    case MTL_MAP_OPTION_MM:
                        index += MTL_MAP_MM_COMPONENTS + SECOND_INDEX;
                        break;

                    case MTL_MAP_OPTION_TEXRES:
                        index += MTL_MAP_TEXRES_COMPONENTS + SECOND_INDEX;
                        break;

                    case MTL_MAP_OPTION_TYPE:
                        index += MTL_MAP_TYPE_COMPONENTS + SECOND_INDEX;
                        break;

                    default:
                        index += SECOND_INDEX;
                        break;
                }

                continue;
            }

            const rawPath = tokens.slice(index).join(SPACE_SEPARATOR);
            const path    = MtlParser.#normalizeQuotedPath(rawPath);

            if (!path) {
                return null;
            }

            mapData.path = path;
            return mapData;
        }

        return null;
    }

    /**
     * Splits the line into tokens, while respecting the quotes.
     *
     * @param {string} line - Line to split.
     * @returns {string[]}  - Tokenized line parts with quotes preserved as a single token.
     * @private
     */
    static #splitTokens(line) {
        const tokens     = [];
        let currentToken = EMPTY_STRING;
        let inQuotes     = false;

        for (const char of line) {
            if (char === QUOTE_TOKEN) {
                inQuotes = !inQuotes;
                continue;
            }

            if (!inQuotes && LINE_SPLIT_REGEX.test(char)) {
                if (currentToken) {
                    tokens.push(currentToken);
                    currentToken = EMPTY_STRING;
                }

                continue;
            }

            currentToken += char;
        }

        if (currentToken) {
            tokens.push(currentToken);
        }

        return tokens;
    }

    /**
     * Creates a default texture map definition.
     *
     * @returns {ParsedMtlTextureMap} - Parsed texture map object with defaults.
     * @private
     */
    static #createDefaultTextureMap() {
        return {
            path           : EMPTY_STRING,
            offset         : new Float32Array(DEFAULT_MAP_OFFSET),
            scale          : new Float32Array(DEFAULT_MAP_SCALE),
            clamp          : DEFAULT_MAP_CLAMP,
            bumpMultiplier : DEFAULT_BUMP_MULTIPLIER
        };
    }

    /**
     * Applies the vector map option to the target array.
     *
     * @param {Float32Array} target   - Target vector array.
     * @param {string[]} tokens       - Parsed tokens.
     * @param {number} startIndex     - Index of the first component.
     * @param {Float32Array} fallback - Fallback vector.
     * @returns {void}
     * @private
     */
    static #applyMapVector(target, tokens, startIndex, fallback) {
        const x = MtlParser.#parseMapFloatToken(tokens[startIndex], fallback[FIRST_INDEX]);
        const y = MtlParser.#parseMapFloatToken(tokens[startIndex + SECOND_INDEX], fallback[SECOND_INDEX]);
        target[FIRST_INDEX]  = x;
        target[SECOND_INDEX] = y;
    }

    /**
     * Consumes map vector options (scale/offset), handling the optional third component.
     *
     * @param {Float32Array} target   - Target vector array.
     * @param {string[]} tokens       - Parsed tokens.
     * @param {number} optionIndex    - Index of the option token.
     * @param {Float32Array} fallback - Fallback vector.
     * @returns {number}              - Next index to continue parsing.
     * @private
     */
    static #consumeMapVectorOption(target, tokens, optionIndex, fallback) {
        const startIndex = optionIndex + SECOND_INDEX;
        MtlParser.#applyMapVector(target, tokens, startIndex, fallback);

        let nextIndex    = startIndex + MTL_MAP_UV_COMPONENTS;
        const thirdToken = tokens[nextIndex];

        if (MtlParser.#isNumericToken(thirdToken) && tokens.length > nextIndex + SECOND_INDEX) {
            nextIndex += MTL_MAP_OPTIONAL_VECTOR_COMPONENTS;
        }

        return nextIndex;
    }

    /**
     * Parses a float token for map options.
     *
     * @param {string} token    - Token value.
     * @param {number} fallback - Fallback value.
     * @returns {number}        - Parsed float value or fallback.
     * @private
     */
    static #parseMapFloatToken(token, fallback) {
        if (!MtlParser.#isNumericToken(token)) {
            return fallback;
        }

        const parsed = Number.parseFloat(token);
        return Number.isFinite(parsed) ? parsed : fallback;
    }

    /**
     * Checks if the token is a numeric value.
     *
     * @param {string} token - Token value.
     * @returns {boolean}    - True when token is numeric.
     * @private
     */
    static #isNumericToken(token) {
        if (typeof token !== ECMASCRIPT_TYPEOF_RESULTS.STRING) {
            return false;
        }

        return MAP_FLOAT_TOKEN_REGEX.test(token);
    }

    /**
     * Parses clamp option token.
     *
     * @param {string} token - Clamp option token.
     * @returns {boolean}    - True when clamp should be enabled.
     * @private
     */
    static #parseClampToken(token) {
        if (!token) {
            return DEFAULT_MAP_CLAMP;
        }

        const normalized = token.toLowerCase();

        if (normalized === CLAMP_ON_TOKEN || normalized === CLAMP_ON_NUMERIC_TOKEN) {
            return true;
        }

        if (normalized === CLAMP_OFF_TOKEN || normalized === CLAMP_OFF_NUMERIC_TOKEN) {
            return false;
        }

        return DEFAULT_MAP_CLAMP;
    }

    /**
     * Normalizes a quoted path string.
     *
     * @param {string} path - Path token.
     * @returns {string}    - Normalized path without the wrapping quotes.
     * @private
     */
    static #normalizeQuotedPath(path) {
        if (typeof path !== ECMASCRIPT_TYPEOF_RESULTS.STRING) {
            return EMPTY_STRING;
        }

        let normalized = path.trim();

        if (normalized.startsWith(QUOTE_TOKEN) && normalized.endsWith(QUOTE_TOKEN) && normalized.length > SECOND_INDEX) {
            normalized = normalized.slice(SECOND_INDEX, normalized.length - SECOND_INDEX);
        }

        return normalized.trim();
    }
}

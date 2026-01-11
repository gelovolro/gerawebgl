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
 * Count of vector components for scale/offset map options.
 *
 * @type {number}
 */
const MTL_MAP_VECTOR_COMPONENTS = 3;

/**
 * Count of scalar components for map options like `-clamp` and `-bm`.
 *
 * @type {number}
 */
const MTL_MAP_SCALAR_COMPONENTS = 1;

/**
 * Number of components for RGB color.
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
 * String literal for typeof checks.
 *
 * @type {string}
 */
const TYPEOF_STRING = 'string';

/**
 * Error message for invalid MTL text input.
 *
 * @type {string}
 */
const ERROR_MTL_TEXT_TYPE = '`MtlParser.parse` expects `mtlText` as a string.';

/**
 * Parsed MTL material definition.
 *
 * NOTE: The following fields are parsed, but not applied yet by the material factory:
 * `ambientMap`, `specularMap`, `alphaMap`, `bumpMap`, `displacementMap`, `reflectionMap`, `opticalDensity`, `illuminationModel`.
 *
 * @typedef {Object} ParsedMtlMaterial
 * @property {string} name                     - Material name.
 * @property {Float32Array} diffuseColor       - Diffuse RGB color.
 * @property {Float32Array} ambientColor       - Ambient RGB color (parsed-only).
 * @property {Float32Array} specularColor      - Specular RGB color.
 * @property {Float32Array} emissiveColor      - Emissive RGB color (parsed-only).
 * @property {string | null} diffuseMap        - Diffuse texture path, if any.
 * @property {string | null} ambientMap        - Ambient texture path (parsed-only).
 * @property {string | null} specularMap       - Specular texture path (parsed-only).
 * @property {string | null} alphaMap          - Alpha texture path (parsed-only).
 * @property {string | null} bumpMap           - Bump texture path (parsed-only).
 * @property {string | null} displacementMap   - Displacement texture path (parsed-only).
 * @property {string | null} reflectionMap     - Reflection texture path (parsed-only).
 * @property {number | null} specularExponent  - Specular exponent (Ns).
 * @property {number | null} opticalDensity    - Optical density (parsed-only).
 * @property {number | null} illuminationModel - Illumination model (parsed-only).
 * @property {number} opacity                  - Opacity multiplier.
 */

/**
 * Parser for MTL material libraries.
 */
export class MtlParser {

    /**
     * Parses MTL text into material definitions.
     *
     * @param {string} mtlText                   - MTL file contents.
     * @returns {Map<string, ParsedMtlMaterial>} - Map of parsed materials keyed by the material name.
     * @throws {TypeError} When mtlText is not a string.
     */
    parse(mtlText) {
        if (typeof mtlText !== TYPEOF_STRING) {
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
                    const name = parts.slice(SECOND_INDEX).join(SPACE_SEPARATOR);

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

                    const mapPath = MtlParser.#parseMtlMapLine(trimmed);
                    currentMaterial.diffuseMap = mapPath || null;
                    break;
                }

                case MTL_AMBIENT_MAP_TOKEN: {
                    if (!currentMaterial) {
                        break;
                    }

                    const mapPath = MtlParser.#parseMtlMapLine(trimmed);
                    currentMaterial.ambientMap = mapPath || null;
                    break;
                }

                case MTL_SPECULAR_MAP_TOKEN: {
                    if (!currentMaterial) {
                        break;
                    }

                    const mapPath = MtlParser.#parseMtlMapLine(trimmed);
                    currentMaterial.specularMap = mapPath || null;
                    break;
                }

                case MTL_ALPHA_MAP_TOKEN: {
                    if (!currentMaterial) {
                        break;
                    }

                    const mapPath = MtlParser.#parseMtlMapLine(trimmed);
                    currentMaterial.alphaMap = mapPath || null;
                    break;
                }

                case MTL_BUMP_MAP_TOKEN:
                case MTL_BUMP_MAP_ALT_TOKEN: {
                    if (!currentMaterial) {
                        break;
                    }

                    const mapPath = MtlParser.#parseMtlMapLine(trimmed);
                    currentMaterial.bumpMap = mapPath || null;
                    break;
                }

                case MTL_DISPLACEMENT_MAP_TOKEN: {
                    if (!currentMaterial) {
                        break;
                    }

                    const mapPath = MtlParser.#parseMtlMapLine(trimmed);
                    currentMaterial.displacementMap = mapPath || null;
                    break;
                }

                case MTL_REFLECTION_MAP_TOKEN: {
                    if (!currentMaterial) {
                        break;
                    }

                    const mapPath = MtlParser.#parseMtlMapLine(trimmed);
                    currentMaterial.reflectionMap = mapPath || null;
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
     * Parses a texture map line and extracts a file path.
     *
     * @param {string} line - Full `map_*` line.
     * @returns {string}    - Extracted texture path from the `map_*` line, returns an empty string when not found.
     * @private
     */
    static #parseMtlMapLine(line) {
        if (typeof line !== TYPEOF_STRING) {
            return EMPTY_STRING;
        }

        let sanitized      = line;
        const commentIndex = sanitized.indexOf(COMMENT_TOKEN);

        if (commentIndex !== NOT_FOUND_INDEX) {
            sanitized = sanitized.slice(FIRST_INDEX, commentIndex);
        }

        sanitized = sanitized.trim();

        if (!sanitized) {
            return EMPTY_STRING;
        }

        const tokens = MtlParser.#splitTokens(sanitized);

        if (tokens.length <= SECOND_INDEX) {
            return EMPTY_STRING;
        }

        let index = SECOND_INDEX;

        while (index < tokens.length) {
            const token = tokens[index];

            if (token.startsWith(HYPHEN_SEPARATOR)) {
                switch (token) {
                    case MTL_MAP_OPTION_SCALE:
                    case MTL_MAP_OPTION_OFFSET:
                        index += MTL_MAP_VECTOR_COMPONENTS + SECOND_INDEX;
                        break;

                    case MTL_MAP_OPTION_CLAMP:
                    case MTL_MAP_OPTION_BUMP_MULTIPLIER:
                        index += MTL_MAP_SCALAR_COMPONENTS + SECOND_INDEX;
                        break;

                    default:
                        index += SECOND_INDEX;
                        break;
                }

                continue;
            }

            return tokens.slice(index).join(SPACE_SEPARATOR);
        }

        return EMPTY_STRING;
    }

    /**
     * Splits a line into tokens, while respecting the quotes.
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
}

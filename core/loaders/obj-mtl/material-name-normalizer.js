import { ECMASCRIPT_TYPEOF_RESULTS } from '../../constants/ecmascript-types.js';

/**
 * Carriage return regex for sanitizing the material names.
 *
 * @type {RegExp}
 */
const CARRIAGE_RETURN_REGEX = /\r+/gu;

/**
 * Whitespace regex for collapsing the repeated spaces.
 *
 * @type {RegExp}
 */
const WHITESPACE_REGEX = /\s+/gu;

/**
 * Quote token for the wrapped names.
 *
 * @type {string}
 */
const QUOTE_TOKEN = '"';

/**
 * Backslash regex for the separator normalization.
 *
 * @type {RegExp}
 */
const BACKSLASH_REGEX = /\\/gu;

/**
 * Forward slash separator token.
 *
 * @type {string}
 */
const PATH_SEPARATOR = '/';

/**
 * Empty string constant.
 *
 * @type {string}
 */
const EMPTY_STRING = '';

/**
 * Index used to reference the second element in arrays.
 *
 * @type {number}
 */
const SECOND_INDEX = 1;

/**
 * Space separator token.
 *
 * @type {string}
 */
const SPACE_SEPARATOR = ' ';

/**
 * Error message for invalid material name input.
 *
 * @type {string}
 */
const ERROR_MATERIAL_NAME_TYPE = '`MaterialNameNormalizer.normalize` expects `name` as a string.';

/**
 * Normalizes the material names between the OBJ/MTL inputs.
 */
export class MaterialNameNormalizer {

    /**
     * Normalizes a material name by: trimming, unquoting, collapsing spaces and fixing separators.
     *
     * @param {string} name - Raw material name input.
     * @returns {string}    - Normalized material name.
     * @throws {TypeError} When name is not a string.
     */
    static normalize(name) {
        if (typeof name !== ECMASCRIPT_TYPEOF_RESULTS.STRING) {
            throw new TypeError(ERROR_MATERIAL_NAME_TYPE);
        }

        let normalized = name.replace(CARRIAGE_RETURN_REGEX, EMPTY_STRING).trim();

        if (normalized.startsWith(QUOTE_TOKEN) && normalized.endsWith(QUOTE_TOKEN) && normalized.length > SECOND_INDEX) {
            normalized = normalized.slice(SECOND_INDEX, normalized.length - SECOND_INDEX);
        }

        normalized = normalized.replace(BACKSLASH_REGEX, PATH_SEPARATOR);
        normalized = normalized.replace(WHITESPACE_REGEX, SPACE_SEPARATOR).trim();
        return normalized;
    }
}

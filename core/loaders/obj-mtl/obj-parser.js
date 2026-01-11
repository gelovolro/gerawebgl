/**
 * Token, that starts a comment line in OBJ files.
 *
 * @type {string}
 */
const COMMENT_TOKEN = '#';

/**
 * OBJ token for vertex positions.
 *
 * @type {string}
 */
const OBJ_VERTEX_TOKEN = 'v';

/**
 * OBJ token for texture coordinates.
 *
 * @type {string}
 */
const OBJ_TEXCOORD_TOKEN = 'vt';

/**
 * OBJ token for vertex normals.
 *
 * @type {string}
 */
const OBJ_NORMAL_TOKEN = 'vn';

/**
 * OBJ token for face definitions.
 *
 * @type {string}
 */
const OBJ_FACE_TOKEN = 'f';

/**
 * OBJ token for material library reference.
 *
 * @type {string}
 */
const OBJ_MATERIAL_LIB_TOKEN = 'mtllib';

/**
 * OBJ token for material assignment.
 *
 * @type {string}
 */
const OBJ_USE_MATERIAL_TOKEN = 'usemtl';

/**
 * OBJ token for object declaration.
 *
 * @type {string}
 */
const OBJ_OBJECT_TOKEN = 'o';

/**
 * OBJ token for group declaration.
 *
 * @type {string}
 */
const OBJ_GROUP_TOKEN = 'g';

/**
 * OBJ token for smoothing groups.
 *
 * @type {string}
 */
const OBJ_SMOOTHING_TOKEN = 's';

/**
 * Separator, used between vertex attributes in face definitions.
 *
 * @type {string}
 */
const OBJ_FACE_ATTRIBUTE_SEPARATOR = '/';

/**
 * Default material name used, when OBJ has no `usemtl` statement.
 *
 * @type {string}
 */
const DEFAULT_MATERIAL_NAME = 'default';

/**
 * Default object name used, when OBJ has no `o` statement.
 *
 * @type {string}
 */
const DEFAULT_OBJECT_NAME = 'default';

/**
 * Default group name used, when OBJ has no `g` statement.
 *
 * @type {string}
 */
const DEFAULT_GROUP_NAME = 'default';

/**
 * Space separator, used to join the split tokens back into the names.
 *
 * @type {string}
 */
const SPACE_SEPARATOR = ' ';

/**
 * Empty string constant.
 *
 * @type {string}
 */
const EMPTY_STRING = '';

/**
 * Regular expression used to split the OBJ lines by whitespace.
 *
 * @type {RegExp}
 */
const LINE_SPLIT_REGEX = /\s+/u;

/**
 * Regular expression used to split the OBJ text into the lines.
 *
 * @type {RegExp}
 */
const LINE_BREAK_REGEX = /\r?\n/u;

/**
 * Quote token for the wrapped names.
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
 * String literal for the typeof checks.
 *
 * @type {string}
 */
const TYPEOF_STRING = 'string';

/**
 * Face requires at least the `3 vertices`.
 *
 * @type {number}
 */
const FACE_MIN_VERTEX_COUNT = 3;

/**
 * Number of components for position vectors.
 *
 * @type {number}
 */
const POSITION_COMPONENT_COUNT = 3;

/**
 * Number of components for UV vectors.
 *
 * @type {number}
 */
const UV_COMPONENT_COUNT = 2;

/**
 * Number of components for normal vectors.
 *
 * @type {number}
 */
const NORMAL_COMPONENT_COUNT = 3;

/**
 * Number of components for RGB color.
 *
 * @type {number}
 */
const COLOR_COMPONENT_COUNT = 3;

/**
 * Start index for vertex color components in `v` lines.
 *
 * @type {number}
 */
const COLOR_START_INDEX = POSITION_COMPONENT_COUNT + SECOND_INDEX;

/**
 * Default smoothing group value for `s off`.
 *
 * @type {number}
 */
const DEFAULT_SMOOTHING_GROUP = 0;

/**
 * Token value, representing smoothing disabled.
 *
 * @type {string}
 */
const SMOOTHING_OFF_TOKEN = 'off';

/**
 * Token value, representing smoothing enabled.
 *
 * @type {string}
 */
const SMOOTHING_ON_TOKEN = 'on';

/**
 * Vertex index offset for OBJ.
 *
 * @type {number}
 */
const OBJ_INDEX_OFFSET = 1;

/**
 * Value indicating, that an OBJ index is not provided.
 *
 * @type {number}
 */
const OBJ_INDEX_NOT_PROVIDED = -1;

/**
 * Value for zero indices (invalid in the OBJ indexing).
 *
 * @type {number}
 */
const OBJ_INDEX_ZERO = 0;

/**
 * Decimal radix for integer parsing.
 *
 * @type {number}
 */
const DECIMAL_RADIX = 10;

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
 * Index, used to reference the fourth element in arrays.
 *
 * @type {number}
 */
const FOURTH_INDEX = 3;

/**
 * Index, of the first face vertex in fan triangulation.
 *
 * @type {number}
 */
const FAN_FIRST_VERTEX_INDEX = 0;

/**
 * Offset to access the next vertex in a face.
 *
 * @type {number}
 */
const NEXT_FACE_VERTEX_OFFSET = 1;

/**
 * Separator for the material chunk keys.
 *
 * @type {string}
 */
const CHUNK_KEY_SEPARATOR = '::';

/**
 * Error message, when a face vertex is missing the position index.
 *
 * @type {string}
 */
const ERROR_MISSING_POSITION_INDEX = 'OBJ face vertex is missing the position index.';

/**
 * Error message for invalid OBJ text input.
 *
 * @type {string}
 */
const ERROR_OBJ_TEXT_TYPE = '`ObjParser.parse` expects `objText` as a string.';

/**
 * Default vertex color (white color).
 *
 * @type {number[]}
 */
const DEFAULT_VERTEX_COLOR = [1.0, 1.0, 1.0];

/**
 * Type definition for the parsed OBJ face vertex.
 *
 * @typedef {Object} ObjFaceVertex
 * @property {number} positionIndex - Position index (zero-based).
 * @property {number} uvIndex       - UV index (zero-based, or -1).
 * @property {number} normalIndex   - Normal index (zero-based, or -1).
 */

/**
 * Type definition for the parsed OBJ material chunk.
 *
 * @typedef {Object} ObjMaterialChunk
 * @property {string} materialName         - Material name.
 * @property {number} smoothingGroup       - Smoothing group number (0 = off).
 * @property {ObjFaceVertex[][]} triangles - Triangulated faces (each triangle has 3 vertices).
 */

/**
 * Type definition for the parsed OBJ group.
 *
 * @typedef {Object} ObjParsedGroup
 * @property {string} name                            - Group name.
 * @property {ObjMaterialChunk[]} materialChunks      - Material chunks in this group.
 * @property {Map<string, ObjMaterialChunk>} chunkMap - Map of chunk keys.
 */

/**
 * Type definition for the parsed OBJ object.
 *
 * @typedef {Object} ObjParsedObject
 * @property {string} name                          - Object name.
 * @property {ObjParsedGroup[]} groups              - Group list.
 * @property {Map<string, ObjParsedGroup>} groupMap - Map of groups.
 */

/**
 * Parsed OBJ data.
 *
 * @typedef {Object} ObjParsedData
 * @property {string[]} materialLibraries - List of MTL library file names.
 * @property {number[]} positions         - Flat positions array.
 * @property {number[]} uvs               - Flat UV array.
 * @property {number[]} normals           - Flat normal array.
 * @property {number[]} colors            - Flat vertex color array.
 * @property {boolean} hasVertexColors    - True when vertex colors are provided.
 * @property {ObjParsedObject[]} objects  - Parsed objects.
 */

/**
 * Parses the OBJ text into the structured data for further processing.
 */
export class ObjParser {

    /**
     * Parsed positions array.
     *
     * @type {number[]}
     * @private
     */
    #positions = [];

    /**
     * Parsed UV array.
     *
     * @type {number[]}
     * @private
     */
    #uvs = [];

    /**
     * Parsed normals array.
     *
     * @type {number[]}
     * @private
     */
    #normals = [];

    /**
     * Parsed vertex colors array.
     *
     * @type {number[]}
     * @private
     */
    #colors = [];

    /**
     * Parsed material library references.
     *
     * @type {string[]}
     * @private
     */
    #materialLibraries = [];

    /**
     * Parsed objects.
     *
     * @type {ObjParsedObject[]}
     * @private
     */
    #objects = [];

    /**
     * Flag indicating whether any vertex colors are present.
     *
     * @type {boolean}
     * @private
     */
    #hasVertexColors = false;

    /**
     * Current object being populated.
     *
     * @type {ObjParsedObject | null}
     * @private
     */
    #currentObject = null;

    /**
     * Current group being populated.
     *
     * @type {ObjParsedGroup | null}
     * @private
     */
    #currentGroup = null;

    /**
     * Current material name.
     *
     * @type {string}
     * @private
     */
    #currentMaterialName = DEFAULT_MATERIAL_NAME;

    /**
     * Current smoothing group.
     *
     * @type {number}
     * @private
     */
    #currentSmoothingGroup = DEFAULT_SMOOTHING_GROUP;

    /**
     * Parses the OBJ text into structured data.
     *
     * @param {string} objText  - OBJ file contents.
     * @returns {ObjParsedData} - Parsed OBJ data including geometry arrays, material libraries, and `object/group/chunk` structure.
     * @throws {TypeError} When `objText` is not a string.
     */
    parse(objText) {
        if (typeof objText !== TYPEOF_STRING) {
            throw new TypeError(ERROR_OBJ_TEXT_TYPE);
        }

        this.#resetState();
        const lines = objText.split(LINE_BREAK_REGEX);

        for (const line of lines) {
            this.#parseLine(line);
        }

        return {
            materialLibraries : this.#materialLibraries,
            positions         : this.#positions,
            uvs               : this.#uvs,
            normals           : this.#normals,
            colors            : this.#hasVertexColors ? this.#colors : [],
            hasVertexColors   : this.#hasVertexColors,
            objects           : this.#objects
        };
    }

    /**
     * Resets the internal parsing state.
     *
     * @returns {void}
     * @private
     */
    #resetState() {
        this.#positions             = [];
        this.#uvs                   = [];
        this.#normals               = [];
        this.#colors                = [];
        this.#materialLibraries     = [];
        this.#objects               = [];
        this.#hasVertexColors       = false;
        this.#currentMaterialName   = DEFAULT_MATERIAL_NAME;
        this.#currentSmoothingGroup = DEFAULT_SMOOTHING_GROUP;
        this.#currentObject         = this.#getOrCreateObject(DEFAULT_OBJECT_NAME);
        this.#currentGroup          = this.#getOrCreateGroup(this.#currentObject, DEFAULT_GROUP_NAME);
        this.#getOrCreateMaterialChunk(this.#currentGroup, this.#currentMaterialName, this.#currentSmoothingGroup);
    }

    /**
     * Parses a single OBJ line.
     *
     * @param {string} line - Input line.
     * @returns {void}
     * @private
     */
    #parseLine(line) {
        const trimmed = line.trim();

        if (!trimmed || trimmed.startsWith(COMMENT_TOKEN)) {
            return;
        }

        const parts   = trimmed.split(LINE_SPLIT_REGEX);
        const keyword = parts[FIRST_INDEX];

        switch (keyword) {
            case OBJ_VERTEX_TOKEN:
                this.#parseVertex(parts);
                break;

            case OBJ_TEXCOORD_TOKEN:
                this.#parseUv(parts);
                break;

            case OBJ_NORMAL_TOKEN:
                this.#parseNormal(parts);
                break;

            case OBJ_MATERIAL_LIB_TOKEN:
                this.#parseMaterialLibrary(trimmed);
                break;

            case OBJ_USE_MATERIAL_TOKEN:
                this.#parseUseMaterial(parts);
                break;

            case OBJ_OBJECT_TOKEN:
                this.#parseObject(parts);
                break;

            case OBJ_GROUP_TOKEN:
                this.#parseGroup(parts);
                break;

            case OBJ_SMOOTHING_TOKEN:
                this.#parseSmoothing(parts);
                break;

            case OBJ_FACE_TOKEN:
                this.#parseFace(parts);
                break;

            default:
                break;
        }
    }

    /**
     * Parses a vertex position (and optional vertex color).
     *
     * @param {string[]} parts - Split line parts.
     * @returns {void}
     * @private
     */
    #parseVertex(parts) {
        const position = ObjParser.#parseFloatTriplet(parts, POSITION_COMPONENT_COUNT);
        this.#positions.push(...position);

        if (parts.length >= (COLOR_START_INDEX + COLOR_COMPONENT_COUNT)) {
            if (!this.#hasVertexColors) {
                this.#hasVertexColors = true;
                this.#fillMissingColors();
            }

            const color = ObjParser.#parseFloatTripletFromOffset(parts, COLOR_START_INDEX);
            this.#colors.push(...color);
            return;
        }

        if (this.#hasVertexColors) {
            const defaultColor = ObjParser.#getDefaultVertexColor();
            this.#colors.push(...defaultColor);
        }
    }

    /**
     * Parses a UV coordinate.
     *
     * @param {string[]} parts - Split line parts.
     * @returns {void}
     * @private
     */
    #parseUv(parts) {
        const uv = ObjParser.#parseFloatPair(parts);
        this.#uvs.push(...uv);
    }

    /**
     * Parses a vertex normal.
     *
     * @param {string[]} parts - Split line parts.
     * @returns {void}
     * @private
     */
    #parseNormal(parts) {
        const normal = ObjParser.#parseFloatTriplet(parts, NORMAL_COMPONENT_COUNT);
        this.#normals.push(...normal);
    }

    /**
     * Parses `mtllib` line and stores all referenced files.
     *
     * @param {string} line - Full line text.
     * @returns {void}
     * @private
     */
    #parseMaterialLibrary(line) {
        const tokens = ObjParser.#splitTokens(line);

        if (tokens.length <= SECOND_INDEX) {
            return;
        }

        const libraries = tokens.slice(SECOND_INDEX);

        for (const library of libraries) {
            if (library) {
                this.#materialLibraries.push(library);
            }
        }
    }

    /**
     * Parses `usemtl` line and sets current material.
     *
     * @param {string[]} parts - Split line parts.
     * @returns {void}
     * @private
     */
    #parseUseMaterial(parts) {
        const materialName        = parts.slice(SECOND_INDEX).join(SPACE_SEPARATOR) || DEFAULT_MATERIAL_NAME;
        this.#currentMaterialName = materialName;
        this.#getOrCreateMaterialChunk(this.#currentGroup, this.#currentMaterialName, this.#currentSmoothingGroup);
    }

    /**
     * Parses `o` line and sets current object.
     *
     * @param {string[]} parts - Split line parts.
     * @returns {void}
     * @private
     */
    #parseObject(parts) {
        const objectName    = parts.slice(SECOND_INDEX).join(SPACE_SEPARATOR) || DEFAULT_OBJECT_NAME;
        this.#currentObject = this.#getOrCreateObject(objectName);
        this.#currentGroup  = this.#getOrCreateGroup(this.#currentObject, DEFAULT_GROUP_NAME);
        this.#getOrCreateMaterialChunk(this.#currentGroup, this.#currentMaterialName, this.#currentSmoothingGroup);
    }

    /**
     * Parses `g` line and sets current group.
     *
     * @param {string[]} parts - Split line parts.
     * @returns {void}
     * @private
     */
    #parseGroup(parts) {
        const groupName    = parts.slice(SECOND_INDEX).join(SPACE_SEPARATOR) || DEFAULT_GROUP_NAME;
        this.#currentGroup = this.#getOrCreateGroup(this.#currentObject, groupName);
        this.#getOrCreateMaterialChunk(this.#currentGroup, this.#currentMaterialName, this.#currentSmoothingGroup);
    }

    /**
     * Parses the smoothing group line.
     *
     * @param {string[]} parts - Split line parts.
     * @returns {void}
     * @private
     */
    #parseSmoothing(parts) {
        const smoothingValue = parts[SECOND_INDEX] || SMOOTHING_OFF_TOKEN;

        if (smoothingValue === SMOOTHING_OFF_TOKEN || smoothingValue === String(DEFAULT_SMOOTHING_GROUP)) {
            this.#currentSmoothingGroup = DEFAULT_SMOOTHING_GROUP;
        } else if (smoothingValue === SMOOTHING_ON_TOKEN) {
            this.#currentSmoothingGroup = OBJ_INDEX_OFFSET;
        } else {
            const parsed = Number.parseInt(smoothingValue, DECIMAL_RADIX);
            this.#currentSmoothingGroup = Number.isFinite(parsed) ? parsed : OBJ_INDEX_OFFSET;
        }

        this.#getOrCreateMaterialChunk(this.#currentGroup, this.#currentMaterialName, this.#currentSmoothingGroup);
    }

    /**
     * Parses a face line and appends the triangles to current chunk.
     *
     * @param {string[]} parts - Face line parts.
     * @returns {void}
     * @throws {Error} When position index is missing.
     * @private
     */
    #parseFace(parts) {
        const faceVertices = parts.slice(SECOND_INDEX);

        if (faceVertices.length < FACE_MIN_VERTEX_COUNT) {
            return;
        }

        const vertices = faceVertices.map((vertex) => this.#resolveFaceVertex(vertex));
        const chunk    = this.#getOrCreateMaterialChunk(this.#currentGroup, this.#currentMaterialName, this.#currentSmoothingGroup);

        for (let index = SECOND_INDEX; index < vertices.length - NEXT_FACE_VERTEX_OFFSET; index += NEXT_FACE_VERTEX_OFFSET) {
            const firstVertex  = vertices[FAN_FIRST_VERTEX_INDEX];
            const secondVertex = vertices[index];
            const thirdVertex  = vertices[index + NEXT_FACE_VERTEX_OFFSET];
            chunk.triangles.push([firstVertex, secondVertex, thirdVertex]);
        }
    }

    /**
     * Resolves a face vertex definition into the indices.
     *
     * @param {string} vertexData - Face vertex string.
     * @returns {ObjFaceVertex}   - Resolved face vertex indices.
     * @throws {Error} When position index is missing.
     * @private
     */
    #resolveFaceVertex(vertexData) {
        const indices       = vertexData.split(OBJ_FACE_ATTRIBUTE_SEPARATOR);
        const positionIndex = ObjParser.#parseIndex(indices[FIRST_INDEX], this.#positions.length / POSITION_COMPONENT_COUNT);
        const uvIndex       = ObjParser.#parseIndex(indices[SECOND_INDEX], this.#uvs.length / UV_COMPONENT_COUNT);
        const normalIndex   = ObjParser.#parseIndex(indices[THIRD_INDEX], this.#normals.length / NORMAL_COMPONENT_COUNT);

        if (positionIndex === OBJ_INDEX_NOT_PROVIDED) {
            throw new Error(ERROR_MISSING_POSITION_INDEX);
        }

        return {
            positionIndex,
            uvIndex,
            normalIndex
        };
    }

    /**
     * Creates or returns a parsed object entry.
     *
     * @param {string} name       - Object name.
     * @returns {ObjParsedObject} - Existing or newly created object entry for the given name.
     * @private
     */
    #getOrCreateObject(name) {
        const targetName = name || DEFAULT_OBJECT_NAME;
        const existing = this.#objects.find((object) => object.name === targetName);

        if (existing) {
            return existing;
        }

        const object = {
            name     : targetName,
            groups   : [],
            groupMap : new Map()
        };

        this.#objects.push(object);
        return object;
    }

    /**
     * Creates or returns a parsed group entry.
     *
     * @param {ObjParsedObject} object - Target object.
     * @param {string} name            - Group name.
     * @returns {ObjParsedGroup}       - Existing or newly created group entry for the given name within the object.
     * @private
     */
    #getOrCreateGroup(object, name) {
        const targetName = name || DEFAULT_GROUP_NAME;

        if (object.groupMap.has(targetName)) {
            return object.groupMap.get(targetName);
        }

        const group = {
            name           : targetName,
            materialChunks : [],
            chunkMap       : new Map()
        };

        object.groups.push(group);
        object.groupMap.set(targetName, group);
        return group;
    }

    /**
     * Creates or returns a material chunk for a group.
     *
     * @param {ObjParsedGroup} group  - Target group.
     * @param {string} materialName   - Material name.
     * @param {number} smoothingGroup - Smoothing group.
     * @returns {ObjMaterialChunk}    - Existing or newly created material chunk for the material name and the smoothing group.
     * @private
     */
    #getOrCreateMaterialChunk(group, materialName, smoothingGroup) {
        const materialKey = materialName || DEFAULT_MATERIAL_NAME;
        const key         = materialKey + CHUNK_KEY_SEPARATOR + String(smoothingGroup);

        if (group.chunkMap.has(key)) {
            return group.chunkMap.get(key);
        }

        const chunk = {
            materialName : materialKey,
            smoothingGroup,
            triangles    : []
        };

        group.materialChunks.push(chunk);
        group.chunkMap.set(key, chunk);
        return chunk;
    }

    /**
     * Fills missing colors with defaults for already parsed vertices.
     *
     * @returns {void}
     * @private
     */
    #fillMissingColors() {
        const vertexCount  = this.#positions.length / POSITION_COMPONENT_COUNT;
        const defaultColor = ObjParser.#getDefaultVertexColor();

        for (let index = this.#colors.length / COLOR_COMPONENT_COUNT; index < vertexCount; index += NEXT_FACE_VERTEX_OFFSET) {
            this.#colors.push(...defaultColor);
        }
    }

    /**
     * Parses the OBJ index string into the zero-based index.
     *
     * @param {string} value     - OBJ index string.
     * @param {number} maxLength - Maximum element count.
     * @returns {number}         - Zero-based index, resolved from the OBJ indexing rules, or `-1`, when missing/invalid.
     * @private
     */
    static #parseIndex(value, maxLength) {
        if (!value) {
            return OBJ_INDEX_NOT_PROVIDED;
        }

        const indexValue = Number.parseInt(value, DECIMAL_RADIX);

        if (maxLength === DEFAULT_SMOOTHING_GROUP) {
            return OBJ_INDEX_NOT_PROVIDED;
        }

        if (Number.isNaN(indexValue) || indexValue === OBJ_INDEX_ZERO) {
            return OBJ_INDEX_NOT_PROVIDED;
        }

        if (indexValue > DEFAULT_SMOOTHING_GROUP) {
            return indexValue - OBJ_INDEX_OFFSET;
        }

        return maxLength + indexValue;
    }

    /**
     * Parses the float triplet from the line parts.
     *
     * @param {string[]} parts  - Line parts.
     * @param {number} expected - Expected component count.
     * @returns {number[]}      - Parsed float triplet `[x, y, z]` (returns zeros, when components are missing).
     * @private
     */
    static #parseFloatTriplet(parts, expected) {
        if (parts.length <= expected) {
            return [DEFAULT_SMOOTHING_GROUP, DEFAULT_SMOOTHING_GROUP, DEFAULT_SMOOTHING_GROUP];
        }

        return [
            Number.parseFloat(parts[SECOND_INDEX]),
            Number.parseFloat(parts[THIRD_INDEX]),
            Number.parseFloat(parts[FOURTH_INDEX])
        ];
    }

    /**
     * Parses the float pair from the line parts.
     *
     * @param {string[]} parts - Line parts.
     * @returns {number[]}     - Parsed float pair `[u, v]` (returns zeros, when components are missing).
     * @private
     */
    static #parseFloatPair(parts) {
        if (parts.length <= THIRD_INDEX) {
            return [DEFAULT_SMOOTHING_GROUP, DEFAULT_SMOOTHING_GROUP];
        }

        return [
            Number.parseFloat(parts[SECOND_INDEX]),
            Number.parseFloat(parts[THIRD_INDEX])
        ];
    }

    /**
     * Parses the float triplet starting from a specific offset.
     *
     * @param {string[]} parts - Line parts.
     * @param {number} offset  - Offset index for the first component.
     * @returns {number[]}     - Parsed float triplet starting at `offset` (returns zeros, when components are missing).
     * @private
     */
    static #parseFloatTripletFromOffset(parts, offset) {
        if (parts.length <= (offset + THIRD_INDEX)) {
            return [DEFAULT_SMOOTHING_GROUP, DEFAULT_SMOOTHING_GROUP, DEFAULT_SMOOTHING_GROUP];
        }

        return [
            Number.parseFloat(parts[offset]),
            Number.parseFloat(parts[offset + SECOND_INDEX]),
            Number.parseFloat(parts[offset + THIRD_INDEX])
        ];
    }

    /**
     * Splits a line into tokens, while respecting quotes.
     *
     * @param {string} line - Line to split.
     * @returns {string[]}  - Tokenized line parts with the quoted substrings, preserved as single tokens.
     * @private
     */
    static #splitTokens(line) {
        let sanitized      = line;
        const commentIndex = sanitized.indexOf(COMMENT_TOKEN);

        if (commentIndex !== NOT_FOUND_INDEX) {
            sanitized = sanitized.slice(FIRST_INDEX, commentIndex);
        }

        sanitized = sanitized.trim();

        if (!sanitized) {
            return [];
        }

        const tokens     = [];
        let currentToken = EMPTY_STRING;
        let inQuotes     = false;

        for (const char of sanitized) {
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
     * Returns default vertex color (white).
     *
     * @returns {number[]} - Default vertex color triplet (the white color).
     * @private
     */
    static #getDefaultVertexColor() {
        return DEFAULT_VERTEX_COLOR;
    }
}

import { CustomGeometry }     from '../geometry/custom-geometry.js';
import { Mesh }               from '../scene/mesh.js';
import { Object3D }           from '../scene/object3d.js';
import { SolidColorMaterial } from '../material/solid-color-material.js';
import { TexturedMaterial }   from '../material/textured-material.js';
import { Texture2D }          from '../texture/texture2d.js';

/**
 * Token, that starts a comment line in OBJ/MTL files.
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
 * MTL token for transparency (inverse opacity).
 *
 * @type {string}
 */
const MTL_TRANSPARENCY_TOKEN = 'Tr';

/**
 * Separator used between vertex attributes in face definitions.
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
 * Default UV coordinates, when missing in OBJ data.
 *
 * @type {number[]}
 */
const DEFAULT_UV = [0.0, 0.0];

/**
 * Default normal vector used as placeholder.
 *
 * @type {number[]}
 */
const DEFAULT_NORMAL = [0.0, 0.0, 1.0];

/**
 * Empty string constant.
 *
 * @type {string}
 */
const EMPTY_STRING = '';

/**
 * Hyphen separator sign.
 *
 * @type {string}
 */
const HYPHEN_SEPARATOR = '-';

/**
 * Default base URL, used for resolving relative assets.
 *
 * @type {string}
 */
const DEFAULT_BASE_URL = EMPTY_STRING;

/**
 * Space separator, used to join split tokens back into paths/names.
 *
 * @type {string}
 */
const SPACE_SEPARATOR = ' ';

/**
 * Path separator for URL detection and slicing.
 *
 * @type {string}
 */
const PATH_SEPARATOR = '/';

/**
 * Regular expression used to split OBJ/MTL lines by whitespace.
 *
 * @type {RegExp}
 */
const LINE_SPLIT_REGEX = /\s+/u;

/**
 * Matches backslash characters in paths.
 *
 * @type {RegExp}
 */
const BACKSLASH_REGEX = /\\/gu;

/**
 * Regex used to detect absolute URLs.
 *
 * @type {RegExp}
 */
const ABSOLUTE_URL_REGEX = /^[a-zA-Z][a-zA-Z\d+.-]*:/u;

/**
 * Token, used to wrap quoted paths.
 *
 * @type {string}
 */
const QUOTE_TOKEN = '"';

/**
 * Backslash path separator.
 *
 * @type {string}
 */
const BACKSLASH_SEPARATOR = '\\';

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
 * Face requires at least 3 vertices.
 *
 * @type {number}
 */
const FACE_MIN_VERTEX_COUNT = 3;

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
 * Value for zero indices (invalid in OBJ indexing).
 *
 * @type {number}
 */
const OBJ_INDEX_ZERO = 0;

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
 * Index of the first face vertex in fan triangulation.
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
 * Offset used, when slicing to a base URL.
 *
 * @type {number}
 */
const BASE_PATH_SLICE_OFFSET = 1;

/**
 * Number of components for RGB color.
 *
 * @type {number}
 */
const COLOR_COMPONENT_COUNT = 3;

/**
 * Index positions used in float triplets (X).
 *
 * @type {number}
 */
const COMPONENT_INDEX_X = 0;

/**
 * Index positions used in float triplets (Y).
 *
 * @type {number}
 */
const COMPONENT_INDEX_Y = 1;

/**
 * Index positions used in float triplets (Z).
 *
 * @type {number}
 */
const COMPONENT_INDEX_Z = 2;

/**
 * Value used for zero comparisons.
 *
 * @type {number}
 */
const ZERO_VALUE = 0;

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
 * Index value used, when a substring search fails.
 *
 * @type {number}
 */
const NOT_FOUND_INDEX = -1;

/**
 * Separator for unique vertex keys.
 *
 * @type {string}
 */
const VERTEX_KEY_SEPARATOR = '|';

/**
 * Error message, when a face vertex is missing position index.
 *
 * @type {string}
 */
const ERROR_MISSING_POSITION_INDEX = 'OBJ face vertex is missing position index.';

/**
 * Decimal radix for integer parsing.
 *
 * @type {number}
 */
const DECIMAL_RADIX = 10;

/**
 * Options used by `ObjMtlLoader`.
 *
 * @typedef {Object} ObjMtlLoaderOptions
 * @property {number} [textureUnitIndex=0]            - Texture unit index for textured materials.
 * @property {Float32Array | number[]} [defaultColor] - Default diffuse color.
 */

/**
 * Options used by `ObjMtlLoader.loadFromUrls`.
 *
 * @typedef {Object} ObjMtlLoadFromUrlsOptions
 * @property {string} objUrl           - URL to the OBJ file.
 * @property {string} [mtlUrl]         - Optional URL to the MTL file.
 * @property {string} [baseUrl]        - Base URL for resolving relative references.
 * @property {string} [textureBaseUrl] - Base URL for resolving texture paths.
 */

/**
 * Options used by `ObjMtlLoader.loadFromFiles`.
 *
 * @typedef {Object} ObjMtlLoadFromFilesOptions
 * @property {File} objFile                      - OBJ file.
 * @property {Map<string, File>} [mtlFiles]      - Map of MTL files by normalized path/name.
 * @property {Map<string, string>} [assetUrlMap] - Map of asset blob URLs by normalized path/name.
 * @property {string} [baseUrl]                  - Base URL for resolving relative references.
 * @property {string} [textureBaseUrl]           - Base URL for resolving texture paths.
 */

/**
 * Parsed MTL material definition.
 *
 * @typedef {Object} ParsedMtlMaterial
 * @property {string} name                     - Material name.
 * @property {Float32Array} diffuseColor       - Diffuse RGB color.
 * @property {Float32Array} ambientColor       - Ambient RGB color.
 * @property {Float32Array} specularColor      - Specular RGB color.
 * @property {Float32Array} emissiveColor      - Emissive RGB color.
 * @property {string | null} diffuseMap        - Diffuse texture path, if any.
 * @property {string | null} ambientMap        - Ambient texture path, if any.
 * @property {string | null} specularMap       - Specular texture path, if any.
 * @property {string | null} alphaMap          - Alpha texture path, if any.
 * @property {string | null} bumpMap           - Bump texture path, if any.
 * @property {string | null} displacementMap   - Displacement texture path, if any.
 * @property {string | null} reflectionMap     - Reflection texture path, if any.
 * @property {number | null} specularExponent  - Specular exponent (Ns).
 * @property {number | null} opticalDensity    - Optical density (Ni).
 * @property {number | null} illuminationModel - Illumination model (illum).
 * @property {number} opacity                  - Opacity multiplier.
 */

/**
 * Parsed OBJ group data.
 *
 * @typedef {Object} ObjGroupData
 * @property {string} materialName           - Material name.
 * @property {number[]} positions            - Flat positions array.
 * @property {number[]} uvs                  - Flat UV array.
 * @property {number[]} normals              - Flat normal array.
 * @property {number[]} indices              - Solid indices.
 * @property {Map<string, number>} vertexMap - Map from vertex key to index.
 * @property {boolean} hasUvs                - True, when any UVs were parsed.
 * @property {boolean} needsNormals          - True, when normals need to be generated.
 */

/**
 * Result returned by `ObjMtlLoader.loadFromUrls`.
 *
 * @typedef {Object} ObjMtlLoadResult
 * @property {Object3D} root                                          - Root object containing all meshes.
 * @property {Mesh[]} meshes                                          - Loaded meshes.
 * @property {CustomGeometry[]} geometries                            - Created geometries.
 * @property {Array<SolidColorMaterial | TexturedMaterial>} materials - Created materials.
 * @property {Texture2D[]} textures                                   - Textures created by the loader.
 */

/**
 * Loader for OBJ/MTL assets.
 */
export class ObjMtlLoader {

    /**
     * WebGL2 rendering context used to create GPU resources.
     *
     * @type {WebGL2RenderingContext}
     * @private
     */
    #webglContext;

    /**
     * Texture unit index for textured materials.
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
     * Cache of loaded textures by URL.
     *
     * @type {Map<string, Texture2D>}
     * @private
     */
    #textureCache = new Map();

    /**
     * @param {WebGL2RenderingContext} webglContext - WebGL2 rendering context.
     * @param {ObjMtlLoaderOptions} [options]       - Loader options.
     */
    constructor(webglContext, options = {}) {
        if (!(webglContext instanceof WebGL2RenderingContext)) {
            throw new TypeError('`ObjMtlLoader` expects a `WebGL2RenderingContext`.');
        }

        if (options === null || typeof options !== 'object' || Array.isArray(options)) {
            throw new TypeError('`ObjMtlLoader` expects options as a plain object.');
        }

        const {
            textureUnitIndex = DEFAULT_TEXTURE_UNIT_INDEX,
            defaultColor
        } = options;

        if (!Number.isInteger(textureUnitIndex) || textureUnitIndex < ZERO_VALUE) {
            throw new TypeError('`ObjMtlLoader` expects `textureUnitIndex` as a non-negative integer.');
        }

        if (defaultColor !== undefined) {
            if (!Array.isArray(defaultColor) && !(defaultColor instanceof Float32Array)) {
                throw new TypeError('`ObjMtlLoader` expects `defaultColor` as `number[]` or `Float32Array`.');
            }

            if (defaultColor.length !== COLOR_COMPONENT_COUNT) {
                throw new TypeError('`ObjMtlLoader` expects `defaultColor` to have 3 components.');
            }

            this.#defaultColor.set(defaultColor);
        }

        this.#webglContext     = webglContext;
        this.#textureUnitIndex = textureUnitIndex;
    }

    /**
     * Loads OBJ/MTL assets from URLs and creates meshes.
     *
     * @param {ObjMtlLoadFromUrlsOptions} options - Load options.
     * @returns {Promise<ObjMtlLoadResult>}
     */
    async loadFromUrls(options = {}) {
        if (options === null || typeof options !== 'object' || Array.isArray(options)) {
            throw new TypeError('`ObjMtlLoader.loadFromUrls` expects options as a plain object.');
        }

        const {
            objUrl,
            mtlUrl,
            baseUrl = DEFAULT_BASE_URL,
            textureBaseUrl
        } = options;

        if (typeof objUrl !== 'string') {
            throw new TypeError('`ObjMtlLoader.loadFromUrls` expects `objUrl` as a string.');
        }

        if (mtlUrl !== undefined && typeof mtlUrl !== 'string') {
            throw new TypeError('`ObjMtlLoader.loadFromUrls` expects `mtlUrl` as a string, when provided.');
        }

        if (typeof baseUrl !== 'string') {
            throw new TypeError('`ObjMtlLoader.loadFromUrls` expects `baseUrl` as a string.');
        }

        if (textureBaseUrl !== undefined && typeof textureBaseUrl !== 'string') {
            throw new TypeError('`ObjMtlLoader.loadFromUrls` expects `textureBaseUrl` as a string, when provided.');
        }

        const objText         = await ObjMtlLoader.#fetchText(objUrl);
        const objData         = ObjMtlLoader.#parseObj(objText);
        const resolvedBaseUrl = baseUrl || ObjMtlLoader.#getBasePath(objUrl);
        const mtlLibraries    = mtlUrl ? [mtlUrl] : objData.materialLibraries;
        const mtlData         = new Map();

        if (mtlLibraries.length > ZERO_VALUE) {
            const mtlBaseUrl = baseUrl || resolvedBaseUrl;

            for (const library of mtlLibraries) {
                if (!library) {
                    continue;
                }

                const resolvedMtlUrl = mtlUrl
                    ? (ABSOLUTE_URL_REGEX.test(library) || library.startsWith(PATH_SEPARATOR) || library.startsWith(mtlBaseUrl)
                        ? library : ObjMtlLoader.#resolvePath(mtlBaseUrl, library))
                    : ObjMtlLoader.#resolvePath(resolvedBaseUrl, library);

                const mtlText   = await ObjMtlLoader.#fetchText(resolvedMtlUrl);
                const parsedMtl = ObjMtlLoader.#parseMtl(mtlText);

                for (const [name, material] of parsedMtl.entries()) {
                    mtlData.set(name, material);
                }
            }
        }

        const resolvedTextureBase = textureBaseUrl || resolvedBaseUrl;
        return this.#buildMeshes(objData, mtlData, resolvedTextureBase);
    }

    /**
     * Loads OBJ/MTL assets from local `File` objects.
     *
     * @param {ObjMtlLoadFromFilesOptions} options - Load options.
     * @returns {Promise<ObjMtlLoadResult>}
     */
    async loadFromFiles(options = {}) {
        if (options === null || typeof options !== 'object' || Array.isArray(options)) {
            throw new TypeError('`ObjMtlLoader.loadFromFiles` expects options as a plain object.');
        }

        const {
            objFile,
            mtlFiles = new Map(),
            assetUrlMap,
            baseUrl  = DEFAULT_BASE_URL,
            textureBaseUrl
        } = options;

        if (!(objFile instanceof File)) {
            throw new TypeError('`ObjMtlLoader.loadFromFiles` expects `objFile` as `File`.');
        }

        if (!(mtlFiles instanceof Map)) {
            throw new TypeError('`ObjMtlLoader.loadFromFiles` expects `mtlFiles` as `Map`, when provided.');
        }

        if (assetUrlMap !== undefined && !(assetUrlMap instanceof Map)) {
            throw new TypeError('`ObjMtlLoader.loadFromFiles` expects `assetUrlMap` as `Map`, when provided.');
        }

        if (typeof baseUrl !== 'string') {
            throw new TypeError('`ObjMtlLoader.loadFromFiles` expects `baseUrl` as a string.');
        }

        if (textureBaseUrl !== undefined && typeof textureBaseUrl !== 'string') {
            throw new TypeError('`ObjMtlLoader.loadFromFiles` expects `textureBaseUrl` as a string, when provided.');
        }

        const objText         = await objFile.text();
        const objData         = ObjMtlLoader.#parseObj(objText);
        const resolvedBaseUrl = baseUrl || DEFAULT_BASE_URL;
        const mtlData         = new Map();

        for (const library of objData.materialLibraries) {
            const mtlFile = ObjMtlLoader.#getFileFromMap(mtlFiles, library);

            if (!mtlFile) {
                continue;
            }

            const mtlText   = await mtlFile.text();
            const parsedMtl = ObjMtlLoader.#parseMtl(mtlText);

            for (const [name, material] of parsedMtl.entries()) {
                mtlData.set(name, material);
            }
        }

        const resolvedTextureBase = textureBaseUrl || resolvedBaseUrl;
        return this.#buildMeshes(objData, mtlData, resolvedTextureBase, assetUrlMap);
    }

    /**
     * Fetches text content by URL.
     *
     * @param {string} url - URL to fetch.
     * @returns {Promise<string>}
     * @private
     */
    static async #fetchText(url) {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Failed to fetch resource: ${url}`);
        }

        return response.text();
    }

    /**
     * Parses OBJ text into structured data.
     *
     * @param {string} objText - OBJ file contents.
     * @returns {{ materialLibraries: string[], groups: Map<string, ObjGroupData> }}
     * @private
     */
    static #parseObj(objText) {
        const positions         = [];
        const uvs               = [];
        const normals           = [];
        const materialLibraries = [];
        const groups            = new Map();
        let currentMaterial     = DEFAULT_MATERIAL_NAME;
        ObjMtlLoader.#getOrCreateGroup(groups, currentMaterial);

        const lines = objText.split(/\r?\n/u);

        for (const line of lines) {
            const trimmed = line.trim();

            if (!trimmed || trimmed.startsWith(COMMENT_TOKEN)) {
                continue;
            }

            const parts   = trimmed.split(LINE_SPLIT_REGEX);
            const keyword = parts[FIRST_INDEX];

            switch (keyword) {
                case OBJ_VERTEX_TOKEN: {
                    const vertex = ObjMtlLoader.#parseFloatTriplet(parts, POSITION_COMPONENT_COUNT);
                    positions.push(...vertex);
                    break;
                }

                case OBJ_TEXCOORD_TOKEN: {
                    const uv = ObjMtlLoader.#parseFloatPair(parts);
                    uvs.push(...uv);
                    break;
                }

                case OBJ_NORMAL_TOKEN: {
                    const normal = ObjMtlLoader.#parseFloatTriplet(parts, NORMAL_COMPONENT_COUNT);
                    normals.push(...normal);
                    break;
                }

                case OBJ_MATERIAL_LIB_TOKEN: {
                    const libName = parts.slice(SECOND_INDEX).join(SPACE_SEPARATOR);

                    if (libName) {
                        materialLibraries.push(libName);
                    }

                    break;
                }

                case OBJ_USE_MATERIAL_TOKEN: {
                    const materialName = parts.slice(SECOND_INDEX).join(SPACE_SEPARATOR) || DEFAULT_MATERIAL_NAME;
                    currentMaterial    = materialName;
                    ObjMtlLoader.#getOrCreateGroup(groups, currentMaterial);
                    break;
                }

                case OBJ_FACE_TOKEN: {
                    ObjMtlLoader.#parseFace(parts, positions, uvs, normals, groups.get(currentMaterial));
                    break;
                }

                default:
                    break;
            }
        }

        return { materialLibraries, groups };
    }

    /**
     * Parses MTL text into material definitions.
     *
     * @param {string} mtlText - MTL file contents.
     * @returns {Map<string, ParsedMtlMaterial>}
     * @private
     */
    static #parseMtl(mtlText) {
        const materials     = new Map();
        const lines         = mtlText.split(/\r?\n/u);
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

                    const color = ObjMtlLoader.#parseFloatTriplet(parts, COLOR_COMPONENT_COUNT);
                    currentMaterial.ambientColor.set(color);
                    break;
                }

                case MTL_DIFFUSE_COLOR_TOKEN: {
                    if (!currentMaterial) {
                        break;
                    }

                    const color = ObjMtlLoader.#parseFloatTriplet(parts, COLOR_COMPONENT_COUNT);
                    currentMaterial.diffuseColor.set(color);
                    break;
                }

                case MTL_SPECULAR_COLOR_TOKEN: {
                    if (!currentMaterial) {
                        break;
                    }

                    const color = ObjMtlLoader.#parseFloatTriplet(parts, COLOR_COMPONENT_COUNT);
                    currentMaterial.specularColor.set(color);
                    break;
                }

                case MTL_EMISSIVE_COLOR_TOKEN: {
                    if (!currentMaterial) {
                        break;
                    }

                    const color = ObjMtlLoader.#parseFloatTriplet(parts, COLOR_COMPONENT_COUNT);
                    currentMaterial.emissiveColor.set(color);
                    break;
                }

                case MTL_SPECULAR_EXPONENT_TOKEN: {
                    if (!currentMaterial) {
                        break;
                    }

                    currentMaterial.specularExponent = ObjMtlLoader.#parseFloatValue(parts[SECOND_INDEX]);
                    break;
                }

                case MTL_OPTICAL_DENSITY_TOKEN: {
                    if (!currentMaterial) {
                        break;
                    }

                    currentMaterial.opticalDensity = ObjMtlLoader.#parseFloatValue(parts[SECOND_INDEX]);
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

                    const mapPath = ObjMtlLoader.#parseMtlMapLine(trimmed);
                    currentMaterial.diffuseMap = mapPath || null;
                    break;
                }

                case MTL_AMBIENT_MAP_TOKEN: {
                    if (!currentMaterial) {
                        break;
                    }

                    const mapPath = ObjMtlLoader.#parseMtlMapLine(trimmed);
                    currentMaterial.ambientMap = mapPath || null;
                    break;
                }

                case MTL_SPECULAR_MAP_TOKEN: {
                    if (!currentMaterial) {
                        break;
                    }

                    const mapPath = ObjMtlLoader.#parseMtlMapLine(trimmed);
                    currentMaterial.specularMap = mapPath || null;
                    break;
                }

                case MTL_ALPHA_MAP_TOKEN: {
                    if (!currentMaterial) {
                        break;
                    }

                    const mapPath = ObjMtlLoader.#parseMtlMapLine(trimmed);
                    currentMaterial.alphaMap = mapPath || null;
                    break;
                }

                case MTL_BUMP_MAP_TOKEN:
                case MTL_BUMP_MAP_ALT_TOKEN: {
                    if (!currentMaterial) {
                        break;
                    }

                    const mapPath = ObjMtlLoader.#parseMtlMapLine(trimmed);
                    currentMaterial.bumpMap = mapPath || null;
                    break;
                }

                case MTL_DISPLACEMENT_MAP_TOKEN: {
                    if (!currentMaterial) {
                        break;
                    }

                    const mapPath = ObjMtlLoader.#parseMtlMapLine(trimmed);
                    currentMaterial.displacementMap = mapPath || null;
                    break;
                }

                case MTL_REFLECTION_MAP_TOKEN: {
                    if (!currentMaterial) {
                        break;
                    }

                    const mapPath = ObjMtlLoader.#parseMtlMapLine(trimmed);
                    currentMaterial.reflectionMap = mapPath || null;
                    break;
                }

                case MTL_OPACITY_TOKEN: {
                    if (!currentMaterial) {
                        break;
                    }

                    const value = ObjMtlLoader.#parseFloatValue(parts[SECOND_INDEX]);

                    if (value !== null) {
                        currentMaterial.opacity = value;
                    }

                    break;
                }

                case MTL_TRANSPARENCY_TOKEN: {
                    if (!currentMaterial) {
                        break;
                    }

                    const value = ObjMtlLoader.#parseFloatValue(parts[SECOND_INDEX]);

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
     * Creates meshes for parsed OBJ/MTL data.
     *
     * @param {{ groups: Map<string, ObjGroupData> }} objData - Parsed OBJ data.
     * @param {Map<string, ParsedMtlMaterial>} mtlData        - Parsed MTL data.
     * @param {string} textureBaseUrl                         - Base URL for textures.
     * @param {Map<string, string>} [assetUrlMap]             - Asset URL override map.
     * @returns {Promise<ObjMtlLoadResult>}
     * @private
     */
    async #buildMeshes(objData, mtlData, textureBaseUrl, assetUrlMap) {
        const root       = new Object3D();
        const meshes     = [];
        const geometries = [];
        const materials  = [];
        const textures   = [];

        for (const group of objData.groups.values()) {
            if (group.indices.length === ZERO_VALUE) {
                continue;
            }

            const materialDefinition = mtlData.get(group.materialName) || null;
            const positions          = new Float32Array(group.positions);
            const hasTexture         = Boolean(materialDefinition && materialDefinition.diffuseMap);
            const uvs                = (group.hasUvs || hasTexture) ? new Float32Array(group.uvs) : null;
            const normals            = group.needsNormals
                ? ObjMtlLoader.#generateNormals(positions, group.indices)
                : new Float32Array(group.normals);

            const geometry = new CustomGeometry(this.#webglContext, {
                positions,
                indices : group.indices,
                uvs,
                normals
            });

            const material = await this.#createMaterial(materialDefinition, textureBaseUrl, textures, assetUrlMap);
            const mesh     = new Mesh(geometry, material);
            root.add(mesh);
            meshes.push(mesh);
            geometries.push(geometry);
            materials.push(material);
        }

        return {
            root,
            meshes,
            geometries,
            materials,
            textures
        };
    }

    /**
     * Creates a material instance based on MTL data.
     *
     * @param {ParsedMtlMaterial | null} definition - Parsed material definition.
     * @param {string} textureBaseUrl               - Base URL used for resolving textures.
     * @param {Texture2D[]} textures                - Output list of created textures.
     * @param {Map<string, string>} [assetUrlMap]   - Asset URL override map.
     * @returns {Promise<SolidColorMaterial | TexturedMaterial>}
     * @private
     */
    async #createMaterial(definition, textureBaseUrl, textures, assetUrlMap) {
        const opacity = definition ? definition.opacity : DEFAULT_OPACITY;

        if (definition && definition.diffuseMap) {
            const textureUrl = ObjMtlLoader.#resolveAssetUrl(textureBaseUrl, definition.diffuseMap, assetUrlMap);
            const texture    = await this.#getTexture(textureUrl, textures);
            const material   = new TexturedMaterial(this.#webglContext, {
                texture,
                ownsTexture      : false,
                textureUnitIndex : this.#textureUnitIndex
            });

            material.setOpacity(opacity);
            return material;
        }

        const color    = definition ? definition.diffuseColor : this.#defaultColor;
        const material = new SolidColorMaterial(this.#webglContext, { color });
        material.setOpacity(opacity);
        return material;
    }

    /**
     * Returns cached or newly loaded texture.
     *
     * @param {string} url         - Texture URL.
     * @param {Texture2D[]} output - Output list of created textures.
     * @returns {Promise<Texture2D>}
     * @private
     */
    async #getTexture(url, output) {
        if (this.#textureCache.has(url)) {
            return this.#textureCache.get(url);
        }

        const texture = new Texture2D(this.#webglContext);
        await texture.loadFromUrl(url);
        this.#textureCache.set(url, texture);
        output.push(texture);
        return texture;
    }

    /**
     * Parses a face and appends data to the current group.
     *
     * @param {string[]} parts     - Face line parts.
     * @param {number[]} positions - Source positions.
     * @param {number[]} uvs       - Source uvs.
     * @param {number[]} normals   - Source normals.
     * @param {ObjGroupData} group - Target group data.
     * @private
     */
    static #parseFace(parts, positions, uvs, normals, group) {
        const faceVertices = parts.slice(SECOND_INDEX);

        if (faceVertices.length < FACE_MIN_VERTEX_COUNT) {
            return;
        }

        const vertexIndices = faceVertices.map((vertex) => ObjMtlLoader.#resolveFaceVertex(vertex, positions, uvs, normals, group));

        for (let index = SECOND_INDEX; index < vertexIndices.length - NEXT_FACE_VERTEX_OFFSET; index += NEXT_FACE_VERTEX_OFFSET) {
            const firstIndex  = vertexIndices[FAN_FIRST_VERTEX_INDEX];
            const secondIndex = vertexIndices[index];
            const thirdIndex  = vertexIndices[index + NEXT_FACE_VERTEX_OFFSET];
            group.indices.push(firstIndex, secondIndex, thirdIndex);
        }
    }

    /**
     * Resolves a face vertex and appends data to group buffers.
     *
     * @param {string} vertexData  - Face vertex string.
     * @param {number[]} positions - Source positions.
     * @param {number[]} uvs       - Source uvs.
     * @param {number[]} normals   - Source normals.
     * @param {ObjGroupData} group - Target group data.
     * @returns {number}           - Index of the resolved vertex.
     * @private
     */
    static #resolveFaceVertex(vertexData, positions, uvs, normals, group) {
        const indices       = vertexData.split(OBJ_FACE_ATTRIBUTE_SEPARATOR);
        const positionIndex = ObjMtlLoader.#parseIndex(indices[FIRST_INDEX]  , positions.length / POSITION_COMPONENT_COUNT);
        const uvIndex       = ObjMtlLoader.#parseIndex(indices[SECOND_INDEX] , uvs.length / UV_COMPONENT_COUNT);
        const normalIndex   = ObjMtlLoader.#parseIndex(indices[THIRD_INDEX]  , normals.length / NORMAL_COMPONENT_COUNT);

        if (positionIndex === OBJ_INDEX_NOT_PROVIDED) {
            throw new Error(ERROR_MISSING_POSITION_INDEX);
        }

        const vertexKey = ObjMtlLoader.#buildVertexKey(positionIndex, uvIndex, normalIndex);

        if (group.vertexMap.has(vertexKey)) {
            return group.vertexMap.get(vertexKey);
        }

        const vertexIndex = group.positions.length / POSITION_COMPONENT_COUNT;
        group.vertexMap.set(vertexKey, vertexIndex);
        ObjMtlLoader.#appendPosition(positions, positionIndex, group.positions);
        ObjMtlLoader.#appendUv(uvs, uvIndex, group);
        ObjMtlLoader.#appendNormal(normals, normalIndex, group);
        return vertexIndex;
    }

    /**
     * Parses an OBJ index string into a zero-based index.
     *
     * @param {string} value     - OBJ index string.
     * @param {number} maxLength - Maximum element count.
     * @returns {number}
     * @private
     */
    static #parseIndex(value, maxLength) {
        if (!value) {
            return OBJ_INDEX_NOT_PROVIDED;
        }

        const indexValue = Number.parseInt(value, DECIMAL_RADIX);

        if (maxLength === ZERO_VALUE) {
            return OBJ_INDEX_NOT_PROVIDED;
        }

        if (Number.isNaN(indexValue) || indexValue === OBJ_INDEX_ZERO) {
            return OBJ_INDEX_NOT_PROVIDED;
        }

        if (indexValue > ZERO_VALUE) {
            return indexValue - OBJ_INDEX_OFFSET;
        }

        return maxLength + indexValue;
    }

    /**
     * Appends a position to the target buffer.
     *
     * @param {number[]} sourcePositions - Source positions.
     * @param {number} index             - Position index.
     * @param {number[]} target          - Target positions buffer.
     * @private
     */
    static #appendPosition(sourcePositions, index, target) {
        const baseIndex = index * POSITION_COMPONENT_COUNT;
        target.push(
            sourcePositions[baseIndex + COMPONENT_INDEX_X],
            sourcePositions[baseIndex + COMPONENT_INDEX_Y],
            sourcePositions[baseIndex + COMPONENT_INDEX_Z]
        );
    }

    /**
     * Appends a UV to the target buffer.
     *
     * @param {number[]} sourceUvs - Source UVs.
     * @param {number} index       - UV index.
     * @param {ObjGroupData} group - Group data.
     * @private
     */
    static #appendUv(sourceUvs, index, group) {
        if (index !== OBJ_INDEX_NOT_PROVIDED && index >= ZERO_VALUE && (index * UV_COMPONENT_COUNT) < sourceUvs.length) {
            const baseIndex = index * UV_COMPONENT_COUNT;
            group.uvs.push(sourceUvs[baseIndex + COMPONENT_INDEX_X], sourceUvs[baseIndex + COMPONENT_INDEX_Y]);
            group.hasUvs = true;
            return;
        }

        group.uvs.push(DEFAULT_UV[COMPONENT_INDEX_X], DEFAULT_UV[COMPONENT_INDEX_Y]);
    }

    /**
     * Appends a normal to the target buffer.
     *
     * @param {number[]} sourceNormals - Source normals.
     * @param {number} index           - Normal index.
     * @param {ObjGroupData} group     - Group data.
     * @private
     */
    static #appendNormal(sourceNormals, index, group) {
        if (index !== OBJ_INDEX_NOT_PROVIDED && index >= ZERO_VALUE && (index * NORMAL_COMPONENT_COUNT) < sourceNormals.length) {
            const baseIndex = index * NORMAL_COMPONENT_COUNT;
            group.normals.push(
                sourceNormals[baseIndex + COMPONENT_INDEX_X],
                sourceNormals[baseIndex + COMPONENT_INDEX_Y],
                sourceNormals[baseIndex + COMPONENT_INDEX_Z]
            );

            return;
        }

        group.needsNormals = true;
        group.normals.push(DEFAULT_NORMAL[COMPONENT_INDEX_X], DEFAULT_NORMAL[COMPONENT_INDEX_Y], DEFAULT_NORMAL[COMPONENT_INDEX_Z]);
    }

    /**
     * Generates vertex normals, when missing.
     *
     * @param {Float32Array} positions - Vertex positions.
     * @param {number[]} indices       - Triangle indices.
     * @returns {Float32Array}
     * @private
     */
    static #generateNormals(positions, indices) {
        const normalBuffer = new Float32Array(positions.length);

        for (let index = ZERO_VALUE; index < indices.length; index += NORMAL_COMPONENT_COUNT) {
            const indexA = indices[index + COMPONENT_INDEX_X] * POSITION_COMPONENT_COUNT;
            const indexB = indices[index + COMPONENT_INDEX_Y] * POSITION_COMPONENT_COUNT;
            const indexC = indices[index + COMPONENT_INDEX_Z] * POSITION_COMPONENT_COUNT;

            const ax = positions[indexA + COMPONENT_INDEX_X];
            const ay = positions[indexA + COMPONENT_INDEX_Y];
            const az = positions[indexA + COMPONENT_INDEX_Z];
            const bx = positions[indexB + COMPONENT_INDEX_X];
            const by = positions[indexB + COMPONENT_INDEX_Y];
            const bz = positions[indexB + COMPONENT_INDEX_Z];
            const cx = positions[indexC + COMPONENT_INDEX_X];
            const cy = positions[indexC + COMPONENT_INDEX_Y];
            const cz = positions[indexC + COMPONENT_INDEX_Z];

            const abx = bx - ax;
            const aby = by - ay;
            const abz = bz - az;
            const acx = cx - ax;
            const acy = cy - ay;
            const acz = cz - az;

            const nx = (aby * acz) - (abz * acy);
            const ny = (abz * acx) - (abx * acz);
            const nz = (abx * acy) - (aby * acx);

            normalBuffer[indexA + COMPONENT_INDEX_X] += nx;
            normalBuffer[indexA + COMPONENT_INDEX_Y] += ny;
            normalBuffer[indexA + COMPONENT_INDEX_Z] += nz;
            normalBuffer[indexB + COMPONENT_INDEX_X] += nx;
            normalBuffer[indexB + COMPONENT_INDEX_Y] += ny;
            normalBuffer[indexB + COMPONENT_INDEX_Z] += nz;
            normalBuffer[indexC + COMPONENT_INDEX_X] += nx;
            normalBuffer[indexC + COMPONENT_INDEX_Y] += ny;
            normalBuffer[indexC + COMPONENT_INDEX_Z] += nz;
        }

        for (let index = ZERO_VALUE; index < normalBuffer.length; index += NORMAL_COMPONENT_COUNT) {
            const nx     = normalBuffer[index + COMPONENT_INDEX_X];
            const ny     = normalBuffer[index + COMPONENT_INDEX_Y];
            const nz     = normalBuffer[index + COMPONENT_INDEX_Z];
            const length = Math.hypot(nx, ny, nz);

            if (length > ZERO_VALUE) {
                normalBuffer[index + COMPONENT_INDEX_X] = nx / length;
                normalBuffer[index + COMPONENT_INDEX_Y] = ny / length;
                normalBuffer[index + COMPONENT_INDEX_Z] = nz / length;
            }
        }

        return normalBuffer;
    }

    /**
     * Builds a unique vertex key from indices.
     *
     * @param {number} positionIndex - Position index.
     * @param {number} uvIndex       - UV index.
     * @param {number} normalIndex   - Normal index.
     * @returns {string}
     * @private
     */
    static #buildVertexKey(positionIndex, uvIndex, normalIndex) {
        return String(positionIndex)
            + VERTEX_KEY_SEPARATOR + String(uvIndex)
            + VERTEX_KEY_SEPARATOR + String(normalIndex);
    }

    /**
     * Creates or returns a group entry for a material.
     *
     * @param {Map<string, ObjGroupData>} groups - Group map.
     * @param {string} materialName              - Material name.
     * @returns {ObjGroupData}
     * @private
     */
    static #getOrCreateGroup(groups, materialName) {
        if (groups.has(materialName)) {
            return groups.get(materialName);
        }

        const group = {
            materialName,
            positions    : [],
            uvs          : [],
            normals      : [],
            indices      : [],
            vertexMap    : new Map(),
            hasUvs       : false,
            needsNormals : false
        };

        groups.set(materialName, group);
        return group;
    }

    /**
     * Parses a float triplet from line parts.
     *
     * @param {string[]} parts  - Line parts.
     * @param {number} expected - Expected component count.
     * @returns {number[]}
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
     * Parses a float pair from line parts.
     *
     * @param {string[]} parts - Line parts.
     * @returns {number[]}
     * @private
     */
    static #parseFloatPair(parts) {
        if (parts.length <= THIRD_INDEX) {
            return [ZERO_VALUE, ZERO_VALUE];
        }

        return [
            Number.parseFloat(parts[SECOND_INDEX]),
            Number.parseFloat(parts[THIRD_INDEX])
        ];
    }

    /**
     * Parses a float value from string.
     *
     * @param {string} value - String value.
     * @returns {number | null}
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
     * @returns {string}
     * @private
     */
    static #parseMtlMapLine(line) {
        if (typeof line !== 'string') {
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

        const tokens = ObjMtlLoader.#splitTokens(sanitized);

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
     * Splits a line into tokens while respecting the quotes.
     *
     * @param {string} line - Line to split.
     * @returns {string[]}
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
     * Resolves an asset path using an override map, when provided.
     *
     * @param {string} baseUrl                    - Base URL.
     * @param {string} path                       - Asset path.
     * @param {Map<string, string>} [assetUrlMap] - Asset URL map.
     * @returns {string}
     * @private
     */
    static #resolveAssetUrl(baseUrl, path, assetUrlMap) {
        if (assetUrlMap instanceof Map) {
            const normalized = ObjMtlLoader.#normalizePath(path);

            if (assetUrlMap.has(normalized)) {
                return assetUrlMap.get(normalized);
            }
        }

        const resolved = ObjMtlLoader.#resolvePath(baseUrl, path);

        if (assetUrlMap instanceof Map) {
            const normalizedResolved = ObjMtlLoader.#normalizePath(resolved);

            if (assetUrlMap.has(normalizedResolved)) {
                return assetUrlMap.get(normalizedResolved);
            }
        }

        return resolved;
    }

    /**
     * Resolves a base path from a URL string.
     *
     * @param {string} url - Input URL.
     * @returns {string}
     * @private
     */
    static #getBasePath(url) {
        const lastSlashIndex = url.lastIndexOf(PATH_SEPARATOR);

        if (lastSlashIndex === NOT_FOUND_INDEX) {
            return DEFAULT_BASE_URL;
        }

        return url.slice(FIRST_INDEX, lastSlashIndex + BASE_PATH_SLICE_OFFSET);
    }

    /**
     * Resolves a relative path against a base URL.
     *
     * @param {string} baseUrl - Base URL.
     * @param {string} path    - Path to resolve.
     * @returns {string}
     * @private
     */
    static #resolvePath(baseUrl, path) {
        const normalizedBase = ObjMtlLoader.#normalizePath(baseUrl);
        const normalizedPath = ObjMtlLoader.#normalizePath(path);

        if (!normalizedPath) {
            return normalizedBase;
        }

        if (ABSOLUTE_URL_REGEX.test(normalizedPath) || normalizedPath.startsWith(PATH_SEPARATOR)) {
            return normalizedPath;
        }

        if (!normalizedBase) {
            return normalizedPath;
        }

        if (normalizedBase.endsWith(PATH_SEPARATOR) || normalizedPath.startsWith(PATH_SEPARATOR)) {
            return normalizedBase + normalizedPath;
        }

        return normalizedBase + PATH_SEPARATOR + normalizedPath;
    }

    /**
     * Normalizes a path string by trimming and unquoting.
     *
     * @param {string} path - Input path.
     * @returns {string}
     * @private
     */
    static #normalizePath(path) {
        if (typeof path !== 'string') {
            return EMPTY_STRING;
        }

        let normalized = path.trim();

        if (normalized.startsWith(QUOTE_TOKEN) && normalized.endsWith(QUOTE_TOKEN) && normalized.length > SECOND_INDEX) {
            normalized = normalized.slice(SECOND_INDEX, normalized.length - SECOND_INDEX);
        }

        if (normalized.includes(BACKSLASH_SEPARATOR)) {
            normalized = normalized.replace(BACKSLASH_REGEX, PATH_SEPARATOR);
        }

        return normalized.trim();
    }

    /**
     * Returns a file entry from map using the normalized path or basename.
     *
     * @param {Map<string, File>} fileMap - File map.
     * @param {string} path               - File path.
     * @returns {File | null}
     * @private
     */
    static #getFileFromMap(fileMap, path) {
        if (!fileMap || !path) {
            return null;
        }

        const normalized = ObjMtlLoader.#normalizePath(path);

        if (fileMap.has(normalized)) {
            return fileMap.get(normalized);
        }

        const basenameIndex = normalized.lastIndexOf(PATH_SEPARATOR);
        const basename      = basenameIndex === NOT_FOUND_INDEX
            ? normalized
            : normalized.slice(basenameIndex + BASE_PATH_SLICE_OFFSET);

        if (fileMap.has(basename)) {
            return fileMap.get(basename);
        }

        return null;
    }
}

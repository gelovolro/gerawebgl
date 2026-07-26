import { ECMASCRIPT_TYPEOF_RESULTS } from '../../constants/ecmascript-types.js';
import { Mesh }                      from '../../scene/mesh.js';
import { Points }                    from '../../scene/points.js';
import { Line }                      from '../../scene/line.js';
import { PointsMaterial }            from '../../material/points-material.js';
import { SolidColorMaterial }        from '../../material/solid-color-material.js';
import { ObjGeometryBuilder }        from './obj-geometry-builder.js';
import { ObjMaterialFactory }        from './obj-material-factory.js';
import { ObjParser }                 from './obj-parser.js';
import { MtlParser }                 from './mtl-parser.js';
import { MtlTextureCache }           from './mtl-texture-cache.js';

/**
 * Default texture unit index.
 *
 * @type {number}
 */
const DEFAULT_TEXTURE_UNIT_INDEX = 0;

/**
 * Default diffuse color for materials (white).
 *
 * @type {Float32Array}
 */
const DEFAULT_DIFFUSE_COLOR = new Float32Array([1.0, 1.0, 1.0]);

/**
 * Default opacity for materials.
 *
 * @type {number}
 */
const DEFAULT_OPACITY = 1.0;

/**
 * Empty string constant.
 *
 * @type {string}
 */
const EMPTY_STRING = '';

/**
 * Default base URL, used for resolving relative assets.
 *
 * @type {string}
 */
const DEFAULT_BASE_URL = EMPTY_STRING;

/**
 * Path separator for URL detection and slicing.
 *
 * @type {string}
 */
const PATH_SEPARATOR = '/';

/**
 * Prefix used for relative paths.
 *
 * @type {string}
 */
const DOT_SLASH_PREFIX = './';

/**
 * Backslash path separator.
 *
 * @type {string}
 */
const BACKSLASH_SEPARATOR = '\\';

/**
 * Matches backslash characters in paths.
 *
 * @type {RegExp}
 */
const BACKSLASH_REGEX = /\\/gu;

/**
 * Matches multiple consecutive slashes in a path.
 *
 * @type {RegExp}
 */
const MULTIPLE_SLASHES_REGEX = /\/{2,}/gu;

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
 * Index value used, when a substring search fails.
 *
 * @type {number}
 */
const NOT_FOUND_INDEX = -1;

/**
 * Index used to reference the second element in arrays.
 *
 * @type {number}
 */
const SECOND_INDEX = 1;

/**
 * Offset used, when slicing to a base URL.
 *
 * @type {number}
 */
const BASE_PATH_SLICE_OFFSET = 1;

/**
 * Zero value used for numeric comparisons.
 *
 * @type {number}
 */
const ZERO_VALUE = 0;

/**
 * Number of components for RGB color.
 *
 * @type {number}
 */
const COLOR_COMPONENT_COUNT = 3;

/**
 * Entry type for mesh geometry.
 *
 * @type {string}
 */
const ENTRY_TYPE_MESH = 'mesh';

/**
 * Entry type for point geometry.
 *
 * @type {string}
 */
const ENTRY_TYPE_POINTS = 'points';

/**
 * Entry type for line geometry.
 *
 * @type {string}
 */
const ENTRY_TYPE_LINE = 'line';

/**
 * Error message for invalid WebGL context.
 *
 * @type {string}
 */
const ERROR_WEBGL_CONTEXT_TYPE = '`ObjMtlLoader` expects a `WebGL2RenderingContext`.';

/**
 * Error message for invalid options object.
 *
 * @type {string}
 */
const ERROR_OPTIONS_TYPE = '`ObjMtlLoader` expects options as a plain object.';

/**
 * Error message for invalid texture unit index.
 *
 * @type {string}
 */
const ERROR_TEXTURE_UNIT_INDEX_TYPE = '`ObjMtlLoader` expects `textureUnitIndex` as a non-negative integer.';

/**
 * Error message for invalid default color type.
 *
 * @type {string}
 */
const ERROR_DEFAULT_COLOR_TYPE = '`ObjMtlLoader` expects `defaultColor` as `number[]` or `Float32Array`.';

/**
 * Error message for invalid default color length.
 *
 * @type {string}
 */
const ERROR_DEFAULT_COLOR_LENGTH = '`ObjMtlLoader` expects `defaultColor` to have 3 components.';

/**
 * Error message for invalid load options object.
 *
 * @type {string}
 */
const ERROR_LOAD_OPTIONS_TYPE = '`ObjMtlLoader` expects load options as a plain object.';

/**
 * Error message for invalid objUrl.
 *
 * @type {string}
 */
const ERROR_OBJ_URL_TYPE = '`ObjMtlLoader.loadFromUrls` expects `objUrl` as a string.';

/**
 * Error message for invalid mtlUrl.
 *
 * @type {string}
 */
const ERROR_MTL_URL_TYPE = '`ObjMtlLoader.loadFromUrls` expects `mtlUrl` as a string, when provided.';

/**
 * Error message for invalid baseUrl.
 *
 * @type {string}
 */
const ERROR_BASE_URL_TYPE = '`ObjMtlLoader.loadFromUrls` expects `baseUrl` as a string.';

/**
 * Error message for invalid texture base URL.
 *
 * @type {string}
 */
const ERROR_TEXTURE_BASE_URL_TYPE = '`ObjMtlLoader.loadFromUrls` expects `textureBaseUrl` as a string, when provided.';

/**
 * Error message for invalid objFile.
 *
 * @type {string}
 */
const ERROR_OBJ_FILE_TYPE = '`ObjMtlLoader.loadFromFiles` expects `objFile` as `File`.';

/**
 * Error message for invalid mtlFiles.
 *
 * @type {string}
 */
const ERROR_MTL_FILES_TYPE = '`ObjMtlLoader.loadFromFiles` expects `mtlFiles` as `Map`, when provided.';

/**
 * Error message for invalid assetUrlMap.
 *
 * @type {string}
 */
const ERROR_ASSET_URL_MAP_TYPE = '`ObjMtlLoader.loadFromFiles` expects `assetUrlMap` as `Map`, when provided.';

/**
 * Error message for invalid baseUrl in files loader.
 *
 * @type {string}
 */
const ERROR_FILES_BASE_URL_TYPE = '`ObjMtlLoader.loadFromFiles` expects `baseUrl` as a string.';

/**
 * Error message for invalid textureBaseUrl in files loader.
 *
 * @type {string}
 */
const ERROR_FILES_TEXTURE_BASE_URL_TYPE = '`ObjMtlLoader.loadFromFiles` expects `textureBaseUrl` as a string, when provided.';

/**
 * Warning prefix for missing MTL materials.
 *
 * @type {string}
 */
const WARNING_MTL_MATERIAL_NOT_FOUND_PREFIX = 'MTL material not found for usemtl=';

/**
 * Warning suffix prefix for available materials list.
 *
 * @type {string}
 */
const WARNING_MTL_AVAILABLE_PREFIX = ', available: ';

/**
 * Warning list start token for available materials.
 *
 * @type {string}
 */
const WARNING_MTL_AVAILABLE_START = '[';

/**
 * Warning list end token for available materials.
 *
 * @type {string}
 */
const WARNING_MTL_AVAILABLE_END = ']';

/**
 * Warning separator for available material names.
 *
 * @type {string}
 */
const WARNING_MTL_AVAILABLE_SEPARATOR = ', ';

/**
 * Warning prefix for missing diffuse map URL.
 *
 * @type {string}
 */
const WARNING_MTL_MISSING_DIFFUSE_PREFIX = 'MTL diffuse map URL missing for path=';

/**
 * Warning suffix prefix for texture base URL.
 *
 * @type {string}
 */
const WARNING_MTL_MISSING_DIFFUSE_BASE_PREFIX = ', textureBaseUrl=';

/**
 * Warning prefix for failed MTL loads.
 *
 * @type {string}
 */
const WARNING_MTL_LOAD_FAILED_PREFIX = 'Failed to load MTL: ';

/**
 * Warning prefix for failed MTL load reason.
 *
 * @type {string}
 */
const WARNING_MTL_LOAD_FAILED_REASON_PREFIX = ', reason: ';

/**
 * Warning placeholder for unknown MTL load errors.
 *
 * @type {string}
 */
const WARNING_MTL_LOAD_FAILED_UNKNOWN = 'Unknown error';

/**
 * Maximum number of available materials included in warnings.
 *
 * @type {number}
 */
const WARNING_MTL_AVAILABLE_LIMIT = 5;

/**
 * Warning key separator.
 *
 * @type {string}
 */
const WARNING_KEY_SEPARATOR = '::';

/**
 * Error message, when fetch fails.
 *
 * @type {string}
 */
const ERROR_FETCH_FAILED_PREFIX = 'Failed to fetch resource: ';

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
 * Result returned by `ObjMtlLoader.loadFromUrls`.
 *
 * @typedef {Object} ObjMtlLoadResult
 * @property {Object3D} root               - Root object, containing all meshes.
 * @property {Mesh[]} meshes               - Loaded meshes, points and lines.
 * @property {CustomGeometry[]} geometries - Created geometries.
 * @property {Array<LambertMaterial | PhongMaterial | VertexColorMaterial | PointsMaterial | SolidColorMaterial | MtlStandardMaterial>} materials - Created materials.
 * @property {Texture2D[]} textures        - Textures created by the loader.
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
     * OBJ parser instance.
     *
     * @type {ObjParser}
     * @private
     */
    #objParser;

    /**
     * MTL parser instance.
     *
     * @type {MtlParser}
     * @private
     */
    #mtlParser;

    /**
     * Geometry builder instance.
     *
     * @type {ObjGeometryBuilder}
     * @private
     */
    #geometryBuilder;

    /**
     * Material factory instance.
     *
     * @type {ObjMaterialFactory}
     * @private
     */
    #materialFactory;

    /**
     * Texture cache shared across materials.
     *
     * @type {MtlTextureCache}
     * @private
     */
    #textureCache;

    /**
     * @param {WebGL2RenderingContext} webglContext - WebGL2 rendering context.
     * @param {ObjMtlLoaderOptions} [options]       - Loader options.
     * @throws {TypeError} When inputs are invalid.
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
            defaultColor
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

        this.#webglContext     = webglContext;
        this.#textureUnitIndex = textureUnitIndex;
        this.#textureCache     = new MtlTextureCache(this.#webglContext);
        this.#objParser        = new ObjParser();
        this.#mtlParser        = new MtlParser();
        this.#geometryBuilder  = new ObjGeometryBuilder(this.#webglContext);
        this.#materialFactory  = new ObjMaterialFactory(this.#webglContext, {
            textureUnitIndex : this.#textureUnitIndex,
            defaultColor : this.#defaultColor,
            textureCache : this.#textureCache
        });
    }

    /**
     * Loads the OBJ/MTL assets from URLs and creates the meshes.
     *
     * @param {ObjMtlLoadFromUrlsOptions} options - Load options.
     * @returns {Promise<ObjMtlLoadResult>}
     * @throws {TypeError} When options are invalid.
     */
    async loadFromUrls(options = {}) {
        if (options === null || typeof options !== ECMASCRIPT_TYPEOF_RESULTS.OBJECT || Array.isArray(options)) {
            throw new TypeError(ERROR_LOAD_OPTIONS_TYPE);
        }

        const {
            objUrl,
            mtlUrl,
            baseUrl = DEFAULT_BASE_URL,
            textureBaseUrl
        } = options;

        if (typeof objUrl !== ECMASCRIPT_TYPEOF_RESULTS.STRING) {
            throw new TypeError(ERROR_OBJ_URL_TYPE);
        }

        if (mtlUrl !== undefined && typeof mtlUrl !== ECMASCRIPT_TYPEOF_RESULTS.STRING) {
            throw new TypeError(ERROR_MTL_URL_TYPE);
        }

        if (typeof baseUrl !== ECMASCRIPT_TYPEOF_RESULTS.STRING) {
            throw new TypeError(ERROR_BASE_URL_TYPE);
        }

        if (textureBaseUrl !== undefined && typeof textureBaseUrl !== ECMASCRIPT_TYPEOF_RESULTS.STRING) {
            throw new TypeError(ERROR_TEXTURE_BASE_URL_TYPE);
        }

        const objText         = await ObjMtlLoader.#fetchText(objUrl);
        const objData         = this.#objParser.parse(objText);
        const resolvedBaseUrl = baseUrl || ObjMtlLoader.#getBasePath(objUrl);
        const mtlData         = new Map();
        const mtlBaseUrl      = baseUrl || resolvedBaseUrl;

        if (mtlUrl) {
            const resolvedMtlUrl = ObjMtlLoader.#resolvePath(mtlBaseUrl, mtlUrl);

            try {
                const mtlText   = await ObjMtlLoader.#fetchText(resolvedMtlUrl);
                const parsedMtl = this.#mtlParser.parse(mtlText);

                for (const [name, material] of parsedMtl.entries()) {
                    mtlData.set(name, material);
                }
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : WARNING_MTL_LOAD_FAILED_UNKNOWN;
                console.warn(`${WARNING_MTL_LOAD_FAILED_PREFIX}${resolvedMtlUrl}${WARNING_MTL_LOAD_FAILED_REASON_PREFIX}${errorMessage}`);
            }
        }

        if (!mtlUrl && objData.materialLibraries.length > ZERO_VALUE) {
            for (const library of objData.materialLibraries) {
                if (!library) {
                    continue;
                }

                const resolvedMtlUrl = ObjMtlLoader.#resolvePath(resolvedBaseUrl, library);

                try {
                    const mtlText   = await ObjMtlLoader.#fetchText(resolvedMtlUrl);
                    const parsedMtl = this.#mtlParser.parse(mtlText);

                    for (const [name, material] of parsedMtl.entries()) {
                        mtlData.set(name, material);
                    }
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : WARNING_MTL_LOAD_FAILED_UNKNOWN;
                    console.warn(`${WARNING_MTL_LOAD_FAILED_PREFIX}${resolvedMtlUrl}${WARNING_MTL_LOAD_FAILED_REASON_PREFIX}${errorMessage}`);
                }
            }
        }

        const resolvedTextureBase = textureBaseUrl || resolvedBaseUrl;
        return this.#buildMeshes(objData, mtlData, resolvedTextureBase);
    }

    /**
     * Loads OBJ/MTL assets from the local `File` objects.
     *
     * @param {ObjMtlLoadFromFilesOptions} options - Load options.
     * @returns {Promise<ObjMtlLoadResult>}        - Promise, that resolves with the created scene root and all created assets.
     * @throws {TypeError} When options are invalid.
     */
    async loadFromFiles(options = {}) {
        if (options === null || typeof options !== ECMASCRIPT_TYPEOF_RESULTS.OBJECT || Array.isArray(options)) {
            throw new TypeError(ERROR_LOAD_OPTIONS_TYPE);
        }

        const {
            objFile,
            mtlFiles = new Map(),
            assetUrlMap,
            baseUrl  = DEFAULT_BASE_URL,
            textureBaseUrl
        } = options;

        if (!(objFile instanceof File)) {
            throw new TypeError(ERROR_OBJ_FILE_TYPE);
        }

        if (!(mtlFiles instanceof Map)) {
            throw new TypeError(ERROR_MTL_FILES_TYPE);
        }

        if (assetUrlMap !== undefined && !(assetUrlMap instanceof Map)) {
            throw new TypeError(ERROR_ASSET_URL_MAP_TYPE);
        }

        if (typeof baseUrl !== ECMASCRIPT_TYPEOF_RESULTS.STRING) {
            throw new TypeError(ERROR_FILES_BASE_URL_TYPE);
        }

        if (textureBaseUrl !== undefined && typeof textureBaseUrl !== ECMASCRIPT_TYPEOF_RESULTS.STRING) {
            throw new TypeError(ERROR_FILES_TEXTURE_BASE_URL_TYPE);
        }

        const objText         = await objFile.text();
        const objData         = this.#objParser.parse(objText);
        const resolvedBaseUrl = baseUrl || DEFAULT_BASE_URL;
        const mtlData         = new Map();

        for (const library of objData.materialLibraries) {
            const mtlFile = ObjMtlLoader.#getFileFromMap(mtlFiles, library);

            if (!mtlFile) {
                continue;
            }

            const mtlText   = await mtlFile.text();
            const parsedMtl = this.#mtlParser.parse(mtlText);

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
     * @param {string} url        - URL to fetch.
     * @returns {Promise<string>} - Promise, that resolves with the response body as text.
     * @throws {Error} When the fetch fails.
     * @private
     */
    static async #fetchText(url) {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(ERROR_FETCH_FAILED_PREFIX + url);
        }

        return response.text();
    }

    /**
     * Creates meshes for parsed OBJ/MTL data.
     *
     * @param {Object} objData                    - Parsed OBJ data.
     * @param {Map<string, Object>} mtlData       - Parsed MTL data.
     * @param {string} textureBaseUrl             - Base URL for textures.
     * @param {Map<string, string>} [assetUrlMap] - Asset URL override map.
     * @returns {Promise<ObjMtlLoadResult>}       - Promise, that resolves with the created root object and all created assets.
     * @private
     */
    async #buildMeshes(objData, mtlData, textureBaseUrl, assetUrlMap) {
        const buildResult             = this.#geometryBuilder.build(objData);
        const root                    = buildResult.root;
        const meshes                  = [];
        const geometries              = buildResult.geometries;
        const materials               = [];
        const textures                = [];
        const missingMaterialWarnings = new Set();
        const missingDiffuseWarnings  = new Set();
        const availableMaterials      = Array.from(mtlData.keys());
        const availablePreview        = availableMaterials.slice(ZERO_VALUE, WARNING_MTL_AVAILABLE_LIMIT);

        for (const entry of buildResult.entries) {
            const materialDefinition = mtlData.get(entry.materialName) || null;
            const textureUrls        = ObjMtlLoader.#resolveTextureUrls(materialDefinition, textureBaseUrl, assetUrlMap);

            if (!materialDefinition && !missingMaterialWarnings.has(entry.materialName)) {
                missingMaterialWarnings.add(entry.materialName);
                const availableList = availablePreview.join(WARNING_MTL_AVAILABLE_SEPARATOR);
                console.warn(
                    '%s%s%s%s%s%s',
                    WARNING_MTL_MATERIAL_NOT_FOUND_PREFIX,
                    entry.materialName,
                    WARNING_MTL_AVAILABLE_PREFIX,
                    WARNING_MTL_AVAILABLE_START,
                    availableList,
                    WARNING_MTL_AVAILABLE_END
                );
            }

            if (materialDefinition && materialDefinition.diffuseMap && (!textureUrls || !textureUrls.diffuse)) {
                const warnKey = materialDefinition.diffuseMap.path + WARNING_KEY_SEPARATOR + textureBaseUrl;

                if (!missingDiffuseWarnings.has(warnKey)) {
                    missingDiffuseWarnings.add(warnKey);
                    console.warn(
                        '%s%s%s%s',
                        WARNING_MTL_MISSING_DIFFUSE_PREFIX,
                        materialDefinition.diffuseMap.path,
                        WARNING_MTL_MISSING_DIFFUSE_BASE_PREFIX,
                        textureBaseUrl
                    );
                }
            }

            if (entry.entryType === ENTRY_TYPE_MESH) {
                const material = await this.#materialFactory.createMaterial(
                    materialDefinition,
                    textureUrls,
                    textures,
                    entry.usesVertexColors
                );

                const mesh = new Mesh(entry.geometry, material);
                entry.parent.add(mesh);
                meshes.push(mesh);
                materials.push(material);
                continue;
            }

            if (entry.entryType === ENTRY_TYPE_POINTS) {
                const color    = materialDefinition ? materialDefinition.diffuseColor : this.#defaultColor;
                const material = new PointsMaterial(this.#webglContext, { color });
                material.setOpacity(materialDefinition ? materialDefinition.opacity : DEFAULT_OPACITY);
 
                const points = new Points(entry.geometry, material);
                entry.parent.add(points);
                meshes.push(points);
                materials.push(material);
                continue;
            }

            if (entry.entryType === ENTRY_TYPE_LINE) {
                const color    = materialDefinition ? materialDefinition.diffuseColor : this.#defaultColor;
                const material = new SolidColorMaterial(this.#webglContext, { color });
                material.setOpacity(materialDefinition ? materialDefinition.opacity : DEFAULT_OPACITY);

                const line = new Line(entry.geometry, material);
                entry.parent.add(line);
                meshes.push(line);
                materials.push(material);
            }
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
     * Resolves an asset path using an override map, when provided.
     *
     * @param {string} baseUrl                    - Base URL.
     * @param {string} path                       - Asset path.
     * @param {Map<string, string>} [assetUrlMap] - Asset URL map.
     * @returns {string}                          - Asset URL resolved from `assetUrlMap`, when matched - otherwise resolved against `baseUrl`.
     * @private
     */
    static #resolveAssetUrl(baseUrl, path, assetUrlMap) {
        if (assetUrlMap instanceof Map) {
            const normalized = ObjMtlLoader.#normalizePath(path);

            if (assetUrlMap.has(normalized)) {
                return assetUrlMap.get(normalized);
            }

            const basename = ObjMtlLoader.#getBasename(normalized);

            if (basename && assetUrlMap.has(basename)) {
                return assetUrlMap.get(basename);
            }
        }

        const resolved = ObjMtlLoader.#resolvePath(baseUrl, path);

        if (assetUrlMap instanceof Map) {
            const normalizedResolved = ObjMtlLoader.#normalizePath(resolved);

            if (assetUrlMap.has(normalizedResolved)) {
                return assetUrlMap.get(normalizedResolved);
            }

            const basenameResolved = ObjMtlLoader.#getBasename(normalizedResolved);

            if (basenameResolved && assetUrlMap.has(basenameResolved)) {
                return assetUrlMap.get(basenameResolved);
            }
        }

        return resolved;
    }

    /**
     * Resolves a base path from a URL string.
     *
     * @param {string} url - Input URL.
     * @returns {string}   - Base URL path or an empty string, when no slash is present.
     * @private
     */
    static #getBasePath(url) {
        const lastSlashIndex = url.lastIndexOf(PATH_SEPARATOR);

        if (lastSlashIndex === NOT_FOUND_INDEX) {
            return DEFAULT_BASE_URL;
        }

        return url.slice(ZERO_VALUE, lastSlashIndex + BASE_PATH_SLICE_OFFSET);
    }

    /**
     * Resolves a relative path against a base URL.
     *
     * @param {string} baseUrl - Base URL.
     * @param {string} path    - Path to resolve.
     * @returns {string}       - Resolved URL string, absolute paths are returned as-is - otherwise resolved against `baseUrl`.
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

        const baseForCompare = ObjMtlLoader.#stripDotSlashPrefix(normalizedBase);
        const pathForCompare = ObjMtlLoader.#stripDotSlashPrefix(normalizedPath);

        if (baseForCompare && pathForCompare) {
            const baseWithSeparator = baseForCompare.endsWith(PATH_SEPARATOR)
                ? baseForCompare
                : baseForCompare + PATH_SEPARATOR;

            if (pathForCompare === baseForCompare || pathForCompare.startsWith(baseWithSeparator)) {
                return normalizedPath;
            }
        }

        if (normalizedBase.endsWith(PATH_SEPARATOR) || normalizedPath.startsWith(PATH_SEPARATOR)) {
            return normalizedBase + normalizedPath;
        }

        return normalizedBase + PATH_SEPARATOR + normalizedPath;
    }

    /**
     * Removes a leading `./` prefix from a normalized path.
     *
     * @param {string} path - Normalized path to sanitize.
     * @returns {string}    - Path without a leading `./` prefix.
     * @private
     */
    static #stripDotSlashPrefix(path) {
        if (path.startsWith(DOT_SLASH_PREFIX)) {
            return path.slice(DOT_SLASH_PREFIX.length);
        }

        return path;
    }

    /**
     * Normalizes a path string by: trimming, unquoting and deduplicating the relative slashes.
     *
     * @param {string} path - Input path.
     * @returns {string}    - Normalized path string.
     * @private
     */
    static #normalizePath(path) {
        if (typeof path !== ECMASCRIPT_TYPEOF_RESULTS.STRING) {
            return EMPTY_STRING;
        }

        let normalized = path.trim();

        if (normalized.startsWith(QUOTE_TOKEN) && normalized.endsWith(QUOTE_TOKEN) && normalized.length > SECOND_INDEX) {
            normalized = normalized.slice(SECOND_INDEX, normalized.length - SECOND_INDEX);
        }

        if (normalized.includes(BACKSLASH_SEPARATOR)) {
            normalized = normalized.replace(BACKSLASH_REGEX, PATH_SEPARATOR);
        }

        if (!ABSOLUTE_URL_REGEX.test(normalized) && !normalized.startsWith(PATH_SEPARATOR)) {
            normalized = normalized.replace(MULTIPLE_SLASHES_REGEX, PATH_SEPARATOR);
        }

        return normalized.trim();
    }

    /**
     * Resolves texture URLs for all supported maps.
     *
     * @param {Object | null} definition          - Parsed material definition.
     * @param {string} textureBaseUrl             - Base URL for textures.
     * @param {Map<string, string>} [assetUrlMap] - Asset URL override map.
     * @returns {Object | null}                   - Map of resolved URLs.
     * @private
     */
    static #resolveTextureUrls(definition, textureBaseUrl, assetUrlMap) {
        if (!definition) {
            return null;
        }

        return {
            diffuse : definition.diffuseMap
                ? ObjMtlLoader.#resolveAssetUrl(textureBaseUrl, definition.diffuseMap.path, assetUrlMap)
                : null,

            ambient : definition.ambientMap
                ? ObjMtlLoader.#resolveAssetUrl(textureBaseUrl, definition.ambientMap.path, assetUrlMap)
                : null,

            specular : definition.specularMap
                ? ObjMtlLoader.#resolveAssetUrl(textureBaseUrl, definition.specularMap.path, assetUrlMap)
                : null,

            alpha : definition.alphaMap
                ? ObjMtlLoader.#resolveAssetUrl(textureBaseUrl, definition.alphaMap.path, assetUrlMap)
                : null,

            bump : definition.bumpMap
                ? ObjMtlLoader.#resolveAssetUrl(textureBaseUrl, definition.bumpMap.path, assetUrlMap)
                : null,

            displacement : definition.displacementMap
                ? ObjMtlLoader.#resolveAssetUrl(textureBaseUrl, definition.displacementMap.path, assetUrlMap)
                : null,

            reflection : definition.reflectionMap
                ? ObjMtlLoader.#resolveAssetUrl(textureBaseUrl, definition.reflectionMap.path, assetUrlMap)
                : null
        };
    }

    /**
     * Returns a basename for the path.
     *
     * @param {string} path - Normalized path.
     * @returns {string}    - Basename, or empty string when not available.
     * @private
     */
    static #getBasename(path) {
        if (!path) {
            return EMPTY_STRING;
        }

        const index = path.lastIndexOf(PATH_SEPARATOR);

        if (index === NOT_FOUND_INDEX) {
            return path;
        }

        return path.slice(index + BASE_PATH_SLICE_OFFSET);
    }

    /**
     * Returns a file entry from map using the normalized path or basename.
     *
     * @param {Map<string, File>} fileMap - File map.
     * @param {string} path               - File path.
     * @returns {File | null}             - Matched file entry by normalized path or basename or `null`, when not found.
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

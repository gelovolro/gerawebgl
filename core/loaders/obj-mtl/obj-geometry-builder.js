import { CustomGeometry } from '../../geometry/custom-geometry.js';
import { Object3D }       from '../../scene/object3d.js';

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
 * Value indicating, that an OBJ index is not provided.
 *
 * @type {number}
 */
const OBJ_INDEX_NOT_PROVIDED = -1;

/**
 * Zero value used for numeric comparisons.
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
 * Separator for unique vertex keys.
 *
 * @type {string}
 */
const VERTEX_KEY_SEPARATOR = '|';

/**
 * Index increment for loops.
 *
 * @type {number}
 */
const LOOP_INCREMENT = 1;

/**
 * Error message for invalid WebGL context.
 *
 * @type {string}
 */
const ERROR_WEBGL_CONTEXT_TYPE = '`ObjGeometryBuilder` expects a `WebGL2RenderingContext`.';

/**
 * Error message for invalid parsed data.
 *
 * @type {string}
 */
const ERROR_PARSED_DATA_TYPE = '`ObjGeometryBuilder.build` expects parsed OBJ data as an object.';

/**
 * String literal for typeof checks (object).
 *
 * @type {string}
 */
const TYPEOF_OBJECT = 'object';

/**
 * Type definition for parsed OBJ face vertex.
 *
 * @typedef {Object} ObjFaceVertex
 * @property {number} positionIndex - Position index.
 * @property {number} uvIndex       - UV index.
 * @property {number} normalIndex   - Normal index.
 */

/**
 * Type definition for parsed OBJ material chunk.
 *
 * @typedef {Object} ObjMaterialChunk
 * @property {string} materialName         - Material name.
 * @property {number} smoothingGroup       - Smoothing group (0 = off).
 * @property {ObjFaceVertex[][]} triangles - Triangulated faces.
 */

/**
 * Type definition for parsed OBJ group.
 *
 * @typedef {Object} ObjParsedGroup
 * @property {string} name                       - Group name.
 * @property {ObjMaterialChunk[]} materialChunks - Material chunks in this group.
 */

/**
 * Type definition for parsed OBJ object.
 *
 * @typedef {Object} ObjParsedObject
 * @property {string} name             - Object name.
 * @property {ObjParsedGroup[]} groups - Group list.
 */

/**
 * Parsed OBJ data.
 *
 * @typedef {Object} ObjParsedData
 * @property {number[]} positions        - Flat positions array.
 * @property {number[]} uvs              - Flat UV array.
 * @property {number[]} normals          - Flat normal array.
 * @property {number[]} colors           - Flat vertex color array.
 * @property {boolean} hasVertexColors   - True, when vertex colors are provided.
 * @property {ObjParsedObject[]} objects - Parsed objects.
 */

/**
 * Output entry for mesh creation.
 *
 * @typedef {Object} ObjMeshEntry
 * @property {Object3D} parent          - Parent node for the mesh.
 * @property {CustomGeometry} geometry  - Geometry instance.
 * @property {string} materialName      - Material name used by the chunk.
 * @property {boolean} usesVertexColors - True, when geometry includes vertex colors.
 */

/**
 * Result of building OBJ geometry.
 *
 * @typedef {Object} ObjGeometryBuildResult
 * @property {Object3D} root               - Root object containing all nodes.
 * @property {ObjMeshEntry[]} entries      - Mesh creation entries.
 * @property {CustomGeometry[]} geometries - Created geometries.
 */

/**
 * Builds geometry buffers from parsed OBJ data.
 */
export class ObjGeometryBuilder {

    /**
     * WebGL2 rendering context used to create the geometries.
     *
     * @type {WebGL2RenderingContext}
     * @private
     */
    #webglContext;

    /**
     * @param {WebGL2RenderingContext} webglContext - WebGL2 rendering context.
     * @throws {TypeError} When `webglContext` is not a `WebGL2RenderingContext`.
     */
    constructor(webglContext) {
        if (!(webglContext instanceof WebGL2RenderingContext)) {
            throw new TypeError(ERROR_WEBGL_CONTEXT_TYPE);
        }

        this.#webglContext = webglContext;
    }

    /**
     * Builds the geometry for parsed OBJ data.
     *
     * @param {ObjParsedData} parsedData - Parsed OBJ data.
     * @returns {ObjGeometryBuildResult} - Build result, which is containing the root node, mesh creation entries and created geometries.
     * @throws {TypeError} When `parsedData` is invalid.
     */
    build(parsedData) {
        if (parsedData === null || typeof parsedData !== TYPEOF_OBJECT || Array.isArray(parsedData)) {
            throw new TypeError(ERROR_PARSED_DATA_TYPE);
        }

        const root       = new Object3D();
        const entries    = [];
        const geometries = [];

        for (const objectData of parsedData.objects) {
            const objectNode = new Object3D();
            root.add(objectNode);

            for (const groupData of objectData.groups) {
                const groupNode = new Object3D();
                objectNode.add(groupNode);

                for (const chunk of groupData.materialChunks) {
                    if (!chunk.triangles.length) {
                        continue;
                    }

                    const geometryData     = this.#buildGeometryForChunk(chunk, parsedData);
                    const geometry         = new CustomGeometry(this.#webglContext, geometryData);
                    const usesVertexColors = Boolean(geometryData.colors);

                    entries.push({
                        parent          : groupNode,
                        geometry,
                        materialName    : chunk.materialName,
                        usesVertexColors
                    });

                    geometries.push(geometry);
                }
            }
        }

        return {
            root,
            entries,
            geometries
        };
    }

    /**
     * Builds the geometry data for a material chunk.
     *
     * @param {ObjMaterialChunk} chunk   - Material chunk.
     * @param {ObjParsedData} parsedData - Parsed OBJ data.
     * @returns {Object}                 - Geometry buffers for the chunk.
     * @private
     */
    #buildGeometryForChunk(chunk, parsedData) {
        const positions = [];
        const uvs       = [];
        const normals   = [];
        const colors    = parsedData.hasVertexColors ? [] : null;
        const indices   = [];

        if (chunk.smoothingGroup === ZERO_VALUE) {
            this.#appendFlatGeometry(chunk, parsedData, positions, uvs, normals, colors, indices);
        } else {
            this.#appendSmoothGeometry(chunk, parsedData, positions, uvs, normals, colors, indices);
        }

        return {
            positions : new Float32Array(positions),
            indices,
            uvs       : new Float32Array(uvs),
            normals   : new Float32Array(normals),
            colors    : colors ? new Float32Array(colors) : null
        };
    }

    /**
     * Appends the flat-shaded geometry data.
     *
     * @param {ObjMaterialChunk} chunk    - Material chunk.
     * @param {ObjParsedData} parsedData  - Parsed OBJ data.
     * @param {number[]} positionsOut     - Output positions.
     * @param {number[]} uvsOut           - Output UVs.
     * @param {number[]} normalsOut       - Output normals.
     * @param {number[] | null} colorsOut - Output colors.
     * @param {number[]} indicesOut       - Output indices.
     * @returns {void}                    - Appends the flat-shaded vertex data into the provided output buffers.
     * @private
     */
    #appendFlatGeometry(chunk, parsedData, positionsOut, uvsOut, normalsOut, colorsOut, indicesOut) {
        const positions = parsedData.positions;
        const uvs       = parsedData.uvs;
        const normals   = parsedData.normals;
        const colors    = parsedData.colors;
        let vertexIndex = ZERO_VALUE;

        for (const triangle of chunk.triangles) {
            const faceNormal = this.#computeFaceNormal(triangle, positions);

            for (const vertex of triangle) {
                const positionIndex = vertex.positionIndex;
                const uvIndex       = vertex.uvIndex;
                const normalIndex   = vertex.normalIndex;
                ObjGeometryBuilder.#appendPosition(positions, positionIndex, positionsOut);
                ObjGeometryBuilder.#appendUv(uvs, uvIndex, uvsOut);

                if (normalIndex !== OBJ_INDEX_NOT_PROVIDED) {
                    ObjGeometryBuilder.#appendNormal(normals, normalIndex, normalsOut);
                } else {
                    normalsOut.push(
                        faceNormal[COMPONENT_INDEX_X],
                        faceNormal[COMPONENT_INDEX_Y],
                        faceNormal[COMPONENT_INDEX_Z]
                    );
                }

                if (colorsOut) {
                    ObjGeometryBuilder.#appendColor(colors, positionIndex, colorsOut);
                }

                indicesOut.push(vertexIndex);
                vertexIndex += LOOP_INCREMENT;
            }
        }
    }

    /**
     * Appends the smooth-shaded geometry data.
     *
     * @param {ObjMaterialChunk} chunk    - Material chunk.
     * @param {ObjParsedData} parsedData  - Parsed OBJ data.
     * @param {number[]} positionsOut     - Output positions.
     * @param {number[]} uvsOut           - Output UVs.
     * @param {number[]} normalsOut       - Output normals.
     * @param {number[] | null} colorsOut - Output colors.
     * @param {number[]} indicesOut       - Output indices.
     * @returns {void}                    - Appends the smooth-shaded vertex data into the provided output buffers, reusing the shared vertices, when possible.
     * @private
     */
    #appendSmoothGeometry(chunk, parsedData, positionsOut, uvsOut, normalsOut, colorsOut, indicesOut) {
        const positions         = parsedData.positions;
        const uvs               = parsedData.uvs;
        const normals           = parsedData.normals;
        const colors            = parsedData.colors;
        const vertexMap         = new Map();
        const normalAccumulator = this.#buildNormalAccumulator(chunk, positions);

        for (const triangle of chunk.triangles) {
            for (const vertex of triangle) {
                const key = ObjGeometryBuilder.#buildVertexKey(vertex);

                if (vertexMap.has(key)) {
                    indicesOut.push(vertexMap.get(key));
                    continue;
                }

                const positionIndex = vertex.positionIndex;
                const uvIndex       = vertex.uvIndex;
                const normalIndex   = vertex.normalIndex;
                const nextIndex     = positionsOut.length / POSITION_COMPONENT_COUNT;
                vertexMap.set(key, nextIndex);
                ObjGeometryBuilder.#appendPosition(positions, positionIndex, positionsOut);
                ObjGeometryBuilder.#appendUv(uvs, uvIndex, uvsOut);

                if (normalIndex !== OBJ_INDEX_NOT_PROVIDED) {
                    ObjGeometryBuilder.#appendNormal(normals, normalIndex, normalsOut);
                } else {
                    const smoothNormal = normalAccumulator.get(key) || DEFAULT_NORMAL;
                    normalsOut.push(
                        smoothNormal[COMPONENT_INDEX_X],
                        smoothNormal[COMPONENT_INDEX_Y],
                        smoothNormal[COMPONENT_INDEX_Z]
                    );
                }

                if (colorsOut) {
                    ObjGeometryBuilder.#appendColor(colors, positionIndex, colorsOut);
                }

                indicesOut.push(nextIndex);
            }
        }
    }

    /**
     * Builds a normal accumulator map for smooth shading.
     *
     * @param {ObjMaterialChunk} chunk  - Material chunk.
     * @param {number[]} positions      - Source positions.
     * @returns {Map<string, number[]>} - Map of the `accumulated normalized` normals, keyed by the unique vertex key.
     * @private
     */
    #buildNormalAccumulator(chunk, positions) {
        const accumulators = new Map();

        for (const triangle of chunk.triangles) {
            const faceNormal = this.#computeFaceNormal(triangle, positions);

            for (const vertex of triangle) {
                if (vertex.normalIndex !== OBJ_INDEX_NOT_PROVIDED) {
                    continue;
                }

                const key     = ObjGeometryBuilder.#buildVertexKey(vertex);
                const current = accumulators.get(key) || [ZERO_VALUE, ZERO_VALUE, ZERO_VALUE];
                current[COMPONENT_INDEX_X] += faceNormal[COMPONENT_INDEX_X];
                current[COMPONENT_INDEX_Y] += faceNormal[COMPONENT_INDEX_Y];
                current[COMPONENT_INDEX_Z] += faceNormal[COMPONENT_INDEX_Z];
                accumulators.set(key, current);
            }
        }

        for (const [key, normal] of accumulators.entries()) {
            const length = Math.hypot(normal[COMPONENT_INDEX_X], normal[COMPONENT_INDEX_Y], normal[COMPONENT_INDEX_Z]);

            if (length > ZERO_VALUE) {
                normal[COMPONENT_INDEX_X] /= length;
                normal[COMPONENT_INDEX_Y] /= length;
                normal[COMPONENT_INDEX_Z] /= length;
            }

            accumulators.set(key, normal);
        }

        return accumulators;
    }

    /**
     * Computes a face normal for a triangle.
     *
     * @param {ObjFaceVertex[]} triangle - Triangle vertices.
     * @param {number[]} positions       - Source positions.
     * @returns {number[]}               - Normalized face normal as an `[x, y, z]` array.
     * @private
     */
    #computeFaceNormal(triangle, positions) {
        // Resolving the triangle vertices (A, B, C):
        const vertexA = triangle[FIRST_INDEX];
        const vertexB = triangle[SECOND_INDEX];
        const vertexC = triangle[THIRD_INDEX];

        // Reading the vertex positions (A, B, C) from the flat positions buffer:
        const ax = ObjGeometryBuilder.#getPositionComponent(positions, vertexA.positionIndex, COMPONENT_INDEX_X);
        const ay = ObjGeometryBuilder.#getPositionComponent(positions, vertexA.positionIndex, COMPONENT_INDEX_Y);
        const az = ObjGeometryBuilder.#getPositionComponent(positions, vertexA.positionIndex, COMPONENT_INDEX_Z);
        const bx = ObjGeometryBuilder.#getPositionComponent(positions, vertexB.positionIndex, COMPONENT_INDEX_X);
        const by = ObjGeometryBuilder.#getPositionComponent(positions, vertexB.positionIndex, COMPONENT_INDEX_Y);
        const bz = ObjGeometryBuilder.#getPositionComponent(positions, vertexB.positionIndex, COMPONENT_INDEX_Z);
        const cx = ObjGeometryBuilder.#getPositionComponent(positions, vertexC.positionIndex, COMPONENT_INDEX_X);
        const cy = ObjGeometryBuilder.#getPositionComponent(positions, vertexC.positionIndex, COMPONENT_INDEX_Y);
        const cz = ObjGeometryBuilder.#getPositionComponent(positions, vertexC.positionIndex, COMPONENT_INDEX_Z);

        // Computing the edge vectors (AB and AC):
        const abx = bx - ax;
        const aby = by - ay;
        const abz = bz - az;
        const acx = cx - ax;
        const acy = cy - ay;
        const acz = cz - az;

        // Computing the face normal as a cross product (AB * AC).
        const nx = (aby * acz) - (abz * acy);
        const ny = (abz * acx) - (abx * acz);
        const nz = (abx * acy) - (aby * acx);
        const length = Math.hypot(nx, ny, nz);

        // Normalizing the `normal-vector` (fallbacking to the default normal for degenerate triangles).
        if (length > ZERO_VALUE) {
            return [nx / length, ny / length, nz / length];
        }

        return DEFAULT_NORMAL;
    }

    /**
     * Appends a position to the target buffer.
     *
     * @param {number[]} sourcePositions - Source positions.
     * @param {number} index             - Position index.
     * @param {number[]} target          - Target positions buffer.
     * @returns {void}                   - Appends the referenced position triplet to the target buffer.
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
     * @param {number[]} target    - Target UV buffer.
     * @returns {void}             - Appends the referenced UV pair to the target buffer or the default UV, when missing/invalid.
     * @private
     */
    static #appendUv(sourceUvs, index, target) {
        if (index !== OBJ_INDEX_NOT_PROVIDED && index >= ZERO_VALUE && (index * UV_COMPONENT_COUNT) < sourceUvs.length) {
            const baseIndex = index * UV_COMPONENT_COUNT;
            target.push(sourceUvs[baseIndex + COMPONENT_INDEX_X], sourceUvs[baseIndex + COMPONENT_INDEX_Y]);
            return;
        }

        target.push(DEFAULT_UV[COMPONENT_INDEX_X], DEFAULT_UV[COMPONENT_INDEX_Y]);
    }

    /**
     * Appends a normal to the target buffer.
     *
     * @param {number[]} sourceNormals - Source normals.
     * @param {number} index           - Normal index.
     * @param {number[]} target        - Target normal buffer.
     * @returns {void}                 - Appends the referenced normal triplet to the target buffer or the default normal, when missing/invalid.
     * @private
     */
    static #appendNormal(sourceNormals, index, target) {
        if (index !== OBJ_INDEX_NOT_PROVIDED && index >= ZERO_VALUE && (index * NORMAL_COMPONENT_COUNT) < sourceNormals.length) {
            const baseIndex = index * NORMAL_COMPONENT_COUNT;
            target.push(
                sourceNormals[baseIndex + COMPONENT_INDEX_X],
                sourceNormals[baseIndex + COMPONENT_INDEX_Y],
                sourceNormals[baseIndex + COMPONENT_INDEX_Z]
            );

            return;
        }

        target.push(DEFAULT_NORMAL[COMPONENT_INDEX_X], DEFAULT_NORMAL[COMPONENT_INDEX_Y], DEFAULT_NORMAL[COMPONENT_INDEX_Z]);
    }

    /**
     * Appends a color to the target buffer.
     *
     * @param {number[]} sourceColors - Source colors.
     * @param {number} index          - Color index.
     * @param {number[]} target       - Target colors buffer.
     * @returns {void}                - Appends the referenced RGB triplet to the target buffer.
     * @private
     */
    static #appendColor(sourceColors, index, target) {
        const baseIndex = index * COLOR_COMPONENT_COUNT;
        target.push(
            sourceColors[baseIndex + COMPONENT_INDEX_X],
            sourceColors[baseIndex + COMPONENT_INDEX_Y],
            sourceColors[baseIndex + COMPONENT_INDEX_Z]
        );
    }

    /**
     * Builds a unique vertex key from the indices.
     *
     * @param {ObjFaceVertex} vertex - Face vertex.
     * @returns {string}             - Unique vertex key built from the OBJ indices.
     * @private
     */
    static #buildVertexKey(vertex) {
        return String(vertex.positionIndex)
            + VERTEX_KEY_SEPARATOR + String(vertex.uvIndex)
            + VERTEX_KEY_SEPARATOR + String(vertex.normalIndex);
    }

    /**
     * Reads the position component from the source array.
     *
     * @param {number[]} positions - Source positions.
     * @param {number} index       - Vertex index.
     * @param {number} component   - Component offset.
     * @returns {number}           - Requested position component value for the given vertex index.
     * @private
     */
    static #getPositionComponent(positions, index, component) {
        return positions[(index * POSITION_COMPONENT_COUNT) + component];
    }
}

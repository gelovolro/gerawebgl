import * as SharedMaterialConstants           from '../constants/material.js';
import * as MaterialConstants                 from '../constants/points-material.js';
import { ECMASCRIPT_TYPEOF_RESULTS }          from '../constants/ecmascript-types.js';
import { MATH_COMMON_VALUES, MATH_LAYOUT }    from '../constants/math.js';
import { POINTS_MATERIAL_EXCEPTION_MESSAGES } from '../exception-messages/points-material.js';
import { ShaderProgram }                      from '../shader/shader-program.js';
import { Material }                           from './material.js';

/**
 * Options used by `PointsMaterial`.
 *
 * @typedef {Object} PointsMaterialOptions
 * @property {Float32Array | number[]} [color]   - RGB color [red, green, blue] in [0..1] range.
 * @property {number} [pointSize = 6.0]          - Point size in pixels.
 * @property {boolean} [useVertexColors = false] - When true, uses vertex colors.
 */

/**
 * Material for rendering point clouds.
 */
export class PointsMaterial extends Material {

    /**
     * Current RGB color stored as Float32Array([red, green, blue]).
     *
     * @type {Float32Array}
     * @private
     */
    #color = new Float32Array(SharedMaterialConstants.MATERIAL_DEFAULT_COLOR);

    /**
     * Point size in pixels.
     *
     * @type {number}
     * @private
     */
    #pointSize = MaterialConstants.POINTS_MATERIAL_DEFAULTS.POINT_SIZE;

    /**
     * Flag controlling vertex color usage.
     *
     * @type {boolean}
     * @private
     */
    #useVertexColors = MaterialConstants.POINTS_MATERIAL_DEFAULTS.USE_VERTEX_COLORS;

    /**
     * @param {WebGL2RenderingContext} webglContext - WebGL2 rendering context used to compile shaders.
     * @param {PointsMaterialOptions} [options]     - Material options.
     * @throws {TypeError}                            When inputs are invalid.
     * @throws {RangeError}                           When numeric inputs are out of range.
     */
    constructor(webglContext, options = {}) {
        if (options === null || typeof options !== ECMASCRIPT_TYPEOF_RESULTS.OBJECT || Array.isArray(options)) {
            throw new TypeError(POINTS_MATERIAL_EXCEPTION_MESSAGES.OPTIONS_OBJECT);
        }

        const sources       = MaterialConstants.POINTS_MATERIAL_SHADERS;
        const shaderProgram = new ShaderProgram(webglContext, sources.VERTEX, sources.FRAGMENT);

        super(webglContext, shaderProgram, {
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
     * Applies per-object uniforms.
     *
     * @param {Float32Array} matrix4 - Transformation matrix passed as `u_matrix`.
     */
    apply(matrix4) {
        const shaderProgram = this.shaderProgram;
        const uniforms      = SharedMaterialConstants.MATERIAL_UNIFORMS;
        const pointUniforms = MaterialConstants.POINTS_MATERIAL_UNIFORMS;
        const floatFlags    = SharedMaterialConstants.MATERIAL_BOOLEAN_FLOATS;

        shaderProgram.setMatrix4(uniforms.MATRIX, matrix4);
        shaderProgram.setVector3(uniforms.COLOR, this.#color);
        shaderProgram.setFloat(pointUniforms.POINT_SIZE, this.#pointSize);
        shaderProgram.setFloat(pointUniforms.USE_VERTEX_COLOR, this.#useVertexColors ? floatFlags.TRUE : floatFlags.FALSE);
        shaderProgram.setFloat(uniforms.OPACITY, this.opacity);
    }

    /**
     * Sets the RGB color.
     *
     * @param {Float32Array | number[]} color - [red, green, blue] in [0..1] range.
     * @throws {TypeError}                      When color is invalid.
     */
    setColor(color) {
        if (!Array.isArray(color) && !(color instanceof Float32Array)) {
            throw new TypeError(POINTS_MATERIAL_EXCEPTION_MESSAGES.COLOR_TYPE);
        }

        if (color.length !== MATH_LAYOUT.VECTOR3_ELEMENT_COUNT) {
            throw new TypeError(POINTS_MATERIAL_EXCEPTION_MESSAGES.COLOR_LENGTH);
        }

        this.#color.set(color);
    }

    /**
     * Sets point size in pixels.
     *
     * @param {number} size - Point size (> 0).
     * @throws {TypeError}    When size is not a finite number.
     * @throws {RangeError}   When size is not positive.
     */
    setPointSize(size) {
        if (typeof size !== ECMASCRIPT_TYPEOF_RESULTS.NUMBER || !Number.isFinite(size)) {
            throw new TypeError(POINTS_MATERIAL_EXCEPTION_MESSAGES.POINT_SIZE_TYPE);
        }

        if (size <= MATH_COMMON_VALUES.ZERO) {
            throw new RangeError(POINTS_MATERIAL_EXCEPTION_MESSAGES.POINT_SIZE_RANGE);
        }

        this.#pointSize = size;
    }

    /**
     * Enables or disables vertex colors.
     *
     * @param {boolean} enabled - When true, uses vertex colors.
     * @throws {TypeError}        When enabled is not a boolean.
     */
    setUseVertexColors(enabled) {
        if (typeof enabled !== ECMASCRIPT_TYPEOF_RESULTS.BOOLEAN) {
            throw new TypeError(POINTS_MATERIAL_EXCEPTION_MESSAGES.VERTEX_COLORS_TYPE);
        }

        this.#useVertexColors = enabled;
    }

    /**
     * @returns {Float32Array}
     */
    get color() {
        return this.#color;
    }

    /**
     * @returns {number}
     */
    get pointSize() {
        return this.#pointSize;
    }

    /**
     * @returns {boolean}
     */
    get useVertexColors() {
        return this.#useVertexColors;
    }

    /**
     * Applies the initial settings after the shader program has been created.
     *
     * @param {PointsMaterialOptions} options - Initial material settings.
     * @private
     */
    #initialize(options) {
        const {
            color,
            pointSize       = MaterialConstants.POINTS_MATERIAL_DEFAULTS.POINT_SIZE,
            useVertexColors = MaterialConstants.POINTS_MATERIAL_DEFAULTS.USE_VERTEX_COLORS
        } = options;

        if (color !== undefined) {
            this.setColor(color);
        }

        this.setPointSize(pointSize);
        this.setUseVertexColors(useVertexColors);
    }
}

import * as SharedMaterialConstants                from '../constants/material.js';
import * as MaterialConstants                      from '../constants/solid-color-material.js';
import { ECMASCRIPT_TYPEOF_RESULTS }               from '../constants/ecmascript-types.js';
import { MATH_LAYOUT }                             from '../constants/math.js';
import { SOLID_COLOR_MATERIAL_EXCEPTION_MESSAGES } from '../exception-messages/solid-color-material.js';
import { ShaderProgram }                           from '../shader/shader-program.js';
import { Material }                                from './material.js';

/**
 * Options used by SolidColorMaterial.
 *
 * @typedef {Object} SolidColorMaterialOptions
 * @property {Float32Array | number[]} [color] - RGB color [red, green, blue] in [0..1] range.
 */

/**
 * SolidColorMaterial renders geometry using a single uniform color.
 */
export class SolidColorMaterial extends Material {
    /**
     * Current RGB color stored as Float32Array([red, green, blue]).
     *
     * @type {Float32Array}
     * @private
     */
    #color = new Float32Array(SharedMaterialConstants.MATERIAL_DEFAULT_COLOR);

    /**
     * @param {WebGL2RenderingContext} webglContext - WebGL2 rendering context used to compile shaders.
     * @param {SolidColorMaterialOptions} [options] - Material options.
     */
    constructor(webglContext, options = {}) {
        if (options === null || typeof options !== ECMASCRIPT_TYPEOF_RESULTS.OBJECT || Array.isArray(options)) {
            throw new TypeError(SOLID_COLOR_MATERIAL_EXCEPTION_MESSAGES.OPTIONS_OBJECT);
        }

        const sources       = MaterialConstants.SOLID_COLOR_MATERIAL_SHADERS;
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
     * @param {Float32Array} matrix4 - Transformation matrix passed as u_matrix.
     */
    apply(matrix4) {
        const shaderProgram = this.shaderProgram;
        const uniforms      = SharedMaterialConstants.MATERIAL_UNIFORMS;

        shaderProgram.setMatrix4(uniforms.MATRIX, matrix4);
        shaderProgram.setVector3(uniforms.COLOR, this.#color);
        shaderProgram.setFloat(uniforms.OPACITY, this.opacity);
    }

    /**
     * Sets the RGB color.
     *
     * @param {Float32Array | number[]} color - [red, green, blue] in [0..1] range.
     */
    setColor(color) {
        if (!Array.isArray(color) && !(color instanceof Float32Array)) {
            throw new TypeError(SOLID_COLOR_MATERIAL_EXCEPTION_MESSAGES.COLOR_TYPE);
        }

        if (color.length !== MATH_LAYOUT.VECTOR3_ELEMENT_COUNT) {
            throw new TypeError(SOLID_COLOR_MATERIAL_EXCEPTION_MESSAGES.COLOR_LENGTH);
        }

        this.#color.set(color);
    }

    /**
     * Returns the internal color buffer.
     * Note: returned Float32Array is mutable.
     *
     * @returns {Float32Array}
     */
    get color() {
        return this.#color;
    }

    /**
     * Applies the initial settings after the shader program has been created.
     *
     * @param {SolidColorMaterialOptions} options - Initial material settings.
     * @private
     */
    #initialize(options) {
        const { color } = options;

        if (color !== undefined) {
            this.setColor(color);
        }
    }
}

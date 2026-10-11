import * as SharedMaterialConstants            from '../constants/material.js';
import * as MaterialConstants                  from '../constants/lambert-material.js';
import { ECMASCRIPT_TYPEOF_RESULTS }           from '../constants/ecmascript-types.js';
import { LAMBERT_MATERIAL_EXCEPTION_MESSAGES } from '../exception-messages/lambert-material.js';
import { ShaderProgram }                       from '../shader/shader-program.js';
import { DirectionalLightMaterial }            from './directional-light-material.js';

/**
 * Options used by `LambertMaterial`.
 *
 * @typedef {Object} LambertMaterialOptions
 * @property {Float32Array | number[]} [color]          - Diffuse RGB color [red, green, blue] in [0..1] range.
 * @property {Float32Array | number[]} [lightDirection] - Directional light direction (world space), normalized internally.
 * @property {number} [ambientStrength]                 - Ambient term multiplier.
 */

/**
 * Simple Lambert (diffuse) material with one directional light.
 *
 * This material expects geometry to provide normals at attribute 'location 3'.
 */
export class LambertMaterial extends DirectionalLightMaterial {

    /**
     * Creates a new `LambertMaterial`.
     *
     * @param {WebGL2RenderingContext} webglContext - WebGL2 rendering context used to compile shaders.
     * @param {LambertMaterialOptions} [options]    - Material options.
     */
    constructor(webglContext, options = {}) {
        if (options === null || typeof options !== ECMASCRIPT_TYPEOF_RESULTS.OBJECT || Array.isArray(options)) {
            throw new TypeError(LAMBERT_MATERIAL_EXCEPTION_MESSAGES.OPTIONS_OBJECT);
        }

        const sources       = MaterialConstants.LAMBERT_MATERIAL_SHADERS;
        const shaderProgram = new ShaderProgram(webglContext, sources.VERTEX, sources.FRAGMENT);

        super(webglContext, shaderProgram, options, {
            ownsShaderProgram: SharedMaterialConstants.MATERIAL_DEFAULTS.OWNS_GENERATED_SHADER_PROGRAM
        });
    }
}

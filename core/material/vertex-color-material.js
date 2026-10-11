import * as SharedMaterialConstants from '../constants/material.js';
import * as MaterialConstants       from '../constants/vertex-color-material.js';
import { ShaderProgram }            from '../shader/shader-program.js';
import { Material }                 from './material.js';

/**
 * `VertexColorMaterial` renders geometry using vertex colors.
 */
export class VertexColorMaterial extends Material {
    /**
     * @param {WebGL2RenderingContext} webglContext - WebGL2 rendering context used to compile shaders.
     */
    constructor(webglContext) {
        const sources       = MaterialConstants.VERTEX_COLOR_MATERIAL_SHADERS;
        const shaderProgram = new ShaderProgram(webglContext, sources.VERTEX, sources.FRAGMENT);

        super(webglContext, shaderProgram, {
            ownsShaderProgram: SharedMaterialConstants.MATERIAL_DEFAULTS.OWNS_GENERATED_SHADER_PROGRAM
        });
    }

    /**
     * Applies per-object uniforms.
     *
     * @param {Float32Array} matrix4 - Transformation matrix passed as `u_matrix`.
     */
    apply(matrix4) {
        const shaderProgram = this.shaderProgram;
        const uniforms      = SharedMaterialConstants.MATERIAL_UNIFORMS;
        shaderProgram.setMatrix4(uniforms.MATRIX, matrix4);
        shaderProgram.setFloat(uniforms.OPACITY, this.opacity);
    }
}

import * as SharedMaterialConstants from '../constants/material.js';
import * as MaterialConstants       from '../constants/normal-material.js';
import { ShaderProgram }            from '../shader/shader-program.js';
import { Material }                 from './material.js';

/**
 * `NormalMaterial` visualizes vertex normals as RGB colors.
 * Useful as a diagnostic material to validate normal buffers and attribute bindings.
 */
export class NormalMaterial extends Material {
    /**
     * @param {WebGL2RenderingContext} webglContext - WebGL2 rendering context used to compile shaders.
     */
    constructor(webglContext) {
        const sources       = MaterialConstants.NORMAL_MATERIAL_SHADERS;
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

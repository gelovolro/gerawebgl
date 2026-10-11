import { MATH_COMMON_VALUES }              from '../../core/constants/math.js';
import { Material }                        from '../../core/material/material.js';
import { DirectionalLightMaterial }        from '../../core/material/directional-light-material.js';
import { VertexColorMaterial }             from '../../core/material/vertex-color-material.js';
import { SolidColorMaterial }              from '../../core/material/solid-color-material.js';
import { NormalMaterial }                  from '../../core/material/normal-material.js';
import { PointsMaterial }                  from '../../core/material/points-material.js';
import { TexturedMaterial }                from '../../core/material/textured-material.js';
import { LambertMaterial }                 from '../../core/material/lambert-material.js';
import { PhongMaterial }                   from '../../core/material/phong-material.js';
import { MtlStandardMaterial }             from '../../core/material/mtl-standard-material.js';
import { Texture2D }                       from '../../core/texture/texture2d.js';
import { ShaderProgramTestFixtures }       from './shader-program-test-fixtures.mjs';
import { Texture2DTestFixtures }           from './texture2d-test-fixtures.mjs';
import { withFakeBrowserWebGLEnvironment } from './fake-browser-webgl-environment.mjs';

export class MaterialTestFixtures {
    // Shared render inputs reuse the existing shader fixture values
    static MATRIX          = ShaderProgramTestFixtures.MATRIX4;
    static CAMERA_POSITION = ShaderProgramTestFixtures.VECTOR3;
    static OPACITY         = 0.5;
    static POINT_SIZE      = 12;
    static STRENGTH        = 0.75;
    static SHININESS       = 32;
    static TEXTURE_UNIT    = 7;
    static UV_OFFSET       = Object.freeze([0.25, 0.5]);
    static UV_SCALE        = Object.freeze([2, 3]);
    static DIRECTION       = Object.freeze([3, 4, 0]);
    static UNIT_DIRECTION  = Object.freeze([0.6, 0.8, 0]);

    static createCases() {
        return [
            { MaterialClass: Material,                 ownsProgram: false, applyLength: null },
            { MaterialClass: DirectionalLightMaterial, ownsProgram: true,  applyLength: 4 },
            { MaterialClass: VertexColorMaterial,      ownsProgram: true,  applyLength: 1 },
            { MaterialClass: SolidColorMaterial,       ownsProgram: true,  applyLength: 1 },
            { MaterialClass: NormalMaterial,           ownsProgram: true,  applyLength: 1 },
            { MaterialClass: PointsMaterial,           ownsProgram: true,  applyLength: 1 },
            { MaterialClass: TexturedMaterial,         ownsProgram: true,  applyLength: 1 },
            { MaterialClass: LambertMaterial,          ownsProgram: true,  applyLength: 4 },
            { MaterialClass: PhongMaterial,            ownsProgram: true,  applyLength: 4 },
            { MaterialClass: MtlStandardMaterial,      ownsProgram: true,  applyLength: 4 }
        ];
    }

    static createDirectionalCases() {
        return this.createCases().filter(({ MaterialClass }) => (
            MaterialClass === DirectionalLightMaterial ||
            MaterialClass.prototype instanceof DirectionalLightMaterial
        ));
    }

    static withEnvironment(callback) {
        return withFakeBrowserWebGLEnvironment((environment) => {
            const fixture = ShaderProgramTestFixtures.createFixture(environment);
            this.#addTextureSupport(fixture);
            return callback(fixture);
        });
    }

    static createMaterial(fixture, MaterialClass, options, materialOptions) {
        switch (MaterialClass) {
            case Material:
                return new Material(
                    fixture.renderingContext,
                    ShaderProgramTestFixtures.createProgram(fixture),
                    options
                );

            case DirectionalLightMaterial:
                return new DirectionalLightMaterial(
                    fixture.renderingContext,
                    ShaderProgramTestFixtures.createProgram(fixture),
                    options,
                    materialOptions
                );

            default:
                return new MaterialClass(fixture.renderingContext, options);
        }
    }

    static createTexture(fixture) {
        return new Texture2D(fixture.renderingContext);
    }

    static apply(material) {
        const matrix = new Float32Array(this.MATRIX);
        const camera = new Float32Array(this.CAMERA_POSITION);
        material.apply(matrix, matrix, matrix, camera);
    }

    static clearCalls(fixture) {
        Object.values(fixture.calls).forEach((calls) => { calls.length = MATH_COMMON_VALUES.ZERO; });
        fixture.events.length = MATH_COMMON_VALUES.ZERO;
    }

    static getUniforms(fixture) {
        const uniforms = new Map();

        for (const method of ['uniform1f', 'uniform1i', 'uniform2fv', 'uniform3fv', 'uniform4fv']) {
            for (const [location, value] of fixture.calls[method]) {
                uniforms.set(location.name, ArrayBuffer.isView(value) ? Array.from(value) : value);
            }
        }

        for (const [location, , value] of fixture.calls.uniformMatrix4fv) {
            uniforms.set(location.name, Array.from(value));
        }

        return uniforms;
    }

    static #addTextureSupport(fixture) {
        const context  = fixture.renderingContext;
        const uniforms = Texture2DTestFixtures.WEBGL_ENUMS;

        fixture.createdTextures = [];
        Object.assign(context, uniforms);

        const implementations = {
            createTexture: () => {
                const texture = {};
                fixture.createdTextures.push(texture);
                return texture;
            },

            getParameter: () => Texture2DTestFixtures.MAX_TEXTURE_UNITS
        };

        Texture2DTestFixtures.OBSERVED_METHODS.forEach((method) => {
            fixture.calls[method] = [];

            context[method] = (...args) => {
                fixture.calls[method].push(args);
                fixture.events.push({ method, args });
                return implementations[method]?.(...args);
            };
        });
    }
}

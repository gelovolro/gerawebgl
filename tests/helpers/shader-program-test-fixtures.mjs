import { ShaderProgram } from '../../core/shader/shader-program.js';
import { Texture2D }     from '../../core/texture/texture2d.js';

export class ShaderProgramTestFixtures {
    // Different sources expose swapped vertex and fragment shader arguments
    static VERTEX_SOURCE   = '#version 300 es\nin vec3 a_position;\nvoid main() { gl_Position = vec4(a_position, 1.0); }';
    static FRAGMENT_SOURCE = '#version 300 es\nprecision mediump float;\nout vec4 color;\nvoid main() { color = vec4(1.0); }';

    // Names and values used by lookup and uniform upload tests
    static ATTRIBUTE_NAME     = 'a_position';
    static UNIFORM_NAME       = 'u_value';
    static OTHER_UNIFORM_NAME = 'u_other';
    static FLOAT_VALUE        = 0.75;
    static INT_VALUE          = -3;
    static TEXTURE_UNIT_INDEX = 3;

    // Distinct components expose changes to vector order and matrix storage
    static VECTOR2 = Object.freeze([0.25, 0.5]);
    static VECTOR3 = Object.freeze([0.25, 0.5, 0.75]);
    static VECTOR4 = Object.freeze([0.25, 0.5, 0.75, 1.0]);
    static MATRIX4 = Object.freeze([
        1,   2,  3,  4,
        5,   6,  7,  8,
        9,  10, 11, 12,
        13, 14, 15, 16
    ]);

    // Padding exposes accidental uploads of the entire typed array backing buffer
    static VIEW_PADDING_START = -10;
    static VIEW_PADDING_END   = -20;
    static VIEW_START_INDEX   = 1;
    static VIEW_END_INDEX     = -1;

    // Invalid strings cover both constructor sources and public lookup names
    static INVALID_STRING_VALUES = Object.freeze([undefined, null, false, 0, {}, [], Object('name')]);

    // Context methods observed without changing the shared fake WebGL environment
    static OBSERVED_METHODS = Object.freeze([
        'shaderSource',
        'compileShader',
        'getShaderParameter',
        'getShaderInfoLog',
        'attachShader',
        'linkProgram',
        'getProgramParameter',
        'getProgramInfoLog',
        'deleteShader',
        'deleteProgram',
        'useProgram',
        'getAttribLocation',
        'getUniformLocation',
        'uniform1f',
        'uniform1i',
        'uniform2fv',
        'uniform3fv',
        'uniform4fv',
        'uniformMatrix4fv'
    ]);

    static createFixture(environment) {
        const renderingContext = environment.createCanvas().context;
        const calls            = {};
        const events           = [];
        const createdShaders   = [];
        const createdPrograms  = [];
        const originalShader   = renderingContext.createShader.bind(renderingContext);
        const originalProgram  = renderingContext.createProgram.bind(renderingContext);

        renderingContext.createShader = (type) => {
            const shader = originalShader(type);
            createdShaders.push(shader);
            return shader;
        };

        renderingContext.createProgram = () => {
            const program = originalProgram();
            createdPrograms.push(program);
            return program;
        };

        ShaderProgramTestFixtures.OBSERVED_METHODS.forEach((method) => {
            ShaderProgramTestFixtures.#recordMethod(renderingContext, method, calls, events);
        });

        return { renderingContext, calls, events, createdShaders, createdPrograms };
    }

    static createProgram(fixture, vertexSource = this.VERTEX_SOURCE, fragmentSource = this.FRAGMENT_SOURCE) {
        return new ShaderProgram(fixture.renderingContext, vertexSource, fragmentSource);
    }

    // Returns the texture and its recorded bind calls
    static createTexture(fixture) {
        // Observe the binding call without allocating Texture2D resources in these unit tests
        const texture   = Object.create(Texture2D.prototype);
        const bindCalls = [];

        texture.bind = (textureUnitIndex) => {
            bindCalls.push(textureUnitIndex);
            fixture.events.push({ method: 'bind', args: [textureUnitIndex] });
        };

        return { texture, bindCalls };
    }

    static createVectorCases() {
        return [
            { method: 'setVector2', upload: 'uniform2fv', values: this.VECTOR2, messagePrefix: 'VECTOR2' },
            { method: 'setVector3', upload: 'uniform3fv', values: this.VECTOR3, messagePrefix: 'VECTOR3' },
            { method: 'setVector4', upload: 'uniform4fv', values: this.VECTOR4, messagePrefix: 'VECTOR4' }
        ];
    }

    static createUniformCases(fixture) {
        const { texture } = this.createTexture(fixture);
        return [
            { method: 'getUniformLocation' , args: [], messageKey: 'UNIFORM_NAME_TYPE' },
            { method: 'setFloat'           , args: [this.FLOAT_VALUE], messageKey: 'FLOAT_NAME_TYPE' },
            { method: 'setInt'             , args: [this.INT_VALUE], messageKey: 'INT_NAME_TYPE' },
            { method: 'setVector2'         , args: [this.VECTOR2], messageKey: 'VECTOR2_NAME_TYPE' },
            { method: 'setVector3'         , args: [this.VECTOR3], messageKey: 'VECTOR3_NAME_TYPE' },
            { method: 'setVector4'         , args: [this.VECTOR4], messageKey: 'VECTOR4_NAME_TYPE' },
            { method: 'setMatrix4'         , args: [new Float32Array(this.MATRIX4)], messageKey: 'MATRIX4_NAME_TYPE' },
            { method: 'setTexture2D'       , args: [texture], messageKey: 'TEXTURE_NAME_TYPE' }
        ];
    }

    static #recordMethod(renderingContext, method, calls, events) {
        const originalMethod = renderingContext[method].bind(renderingContext);
        calls[method]        = [];

        renderingContext[method] = (...args) => {
            calls[method].push(args);
            events.push({ method, args });
            return originalMethod(...args);
        };
    }
}

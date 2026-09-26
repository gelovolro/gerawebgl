import test                                  from 'node:test';
import assert                                from 'node:assert/strict';
import { MATH_NON_FINITE_VALUES }            from '../../test-constants/math.js';
import { SHADER_PROGRAM_EXCEPTION_MESSAGES } from '../../../core/exception-messages/shader-program.js';
import { TestConstants }                     from '../../helpers/test-constants.js';
import { ShaderProgram }                     from '../../../core/shader/shader-program.js';
import { ShaderProgramTestFixtures }         from '../../helpers/shader-program-test-fixtures.mjs';
import { withFakeBrowserWebGLEnvironment }   from '../../helpers/fake-browser-webgl-environment.mjs';

test("'ShaderProgram' should compile both sources, link the program and release the shaders", () => {
    withFakeBrowserWebGLEnvironment((environment) => {
        // Arrange
        const fixture = ShaderProgramTestFixtures.createFixture(environment);
        const context = fixture.renderingContext;

        // Act
        const shaderProgram = ShaderProgramTestFixtures.createProgram(fixture);
        const [vertexShader, fragmentShader] = fixture.createdShaders;
        const [expectedProgram]              = fixture.createdPrograms;

        // Assert
        assert.equal(vertexShader.type, context.VERTEX_SHADER);
        assert.equal(fragmentShader.type, context.FRAGMENT_SHADER);
        assert.equal(shaderProgram.program, expectedProgram);

        assert.deepEqual(fixture.calls.shaderSource, [
            [vertexShader   , ShaderProgramTestFixtures.VERTEX_SOURCE],
            [fragmentShader , ShaderProgramTestFixtures.FRAGMENT_SOURCE]
        ]);

        assert.deepEqual(fixture.calls.compileShader, [[vertexShader], [fragmentShader]]);
        assert.deepEqual(fixture.calls.getShaderParameter, [
            [vertexShader   , context.COMPILE_STATUS],
            [fragmentShader , context.COMPILE_STATUS]
        ]);

        assert.deepEqual(fixture.calls.attachShader, [[expectedProgram, vertexShader], [expectedProgram, fragmentShader]]);
        assert.deepEqual(fixture.calls.linkProgram, [[expectedProgram]]);
        assert.deepEqual(fixture.calls.getProgramParameter, [[expectedProgram, context.LINK_STATUS]]);
        assert.deepEqual(fixture.calls.deleteShader, [[vertexShader], [fragmentShader]]);
        assert.deepEqual(fixture.calls.deleteProgram, []);
        assert.deepEqual(fixture.calls.useProgram, []);
    });
});

test("'ShaderProgram' should reject an invalid context before allocating resources", () => {
    withFakeBrowserWebGLEnvironment((environment) => {
        // Arrange
        const expectedError   = { name: 'TypeError', message: SHADER_PROGRAM_EXCEPTION_MESSAGES.CONTEXT_TYPE };
        const invalidContexts = [undefined, null, false, 0, {}, environment.createCanvas()];

        // Act & Assert
        invalidContexts.forEach((context) => {
            assert.throws(() => new ShaderProgram(
                context,
                ShaderProgramTestFixtures.VERTEX_SOURCE,
                ShaderProgramTestFixtures.FRAGMENT_SOURCE
            ), expectedError);
        });
    });
});

test("'ShaderProgram' should reject either invalid source before allocating resources", () => {
    withFakeBrowserWebGLEnvironment((environment) => {
        // Arrange
        const expectedError = { name: 'TypeError', message: SHADER_PROGRAM_EXCEPTION_MESSAGES.SOURCE_TYPE };
        const fixture       = ShaderProgramTestFixtures.createFixture(environment);

        // Act & Assert
        ShaderProgramTestFixtures.INVALID_STRING_VALUES.forEach((source) => {
            assert.throws(() => new ShaderProgram(
                fixture.renderingContext,
                source,
                ShaderProgramTestFixtures.FRAGMENT_SOURCE
            ), expectedError);

            assert.throws(() => new ShaderProgram(
                fixture.renderingContext,
                ShaderProgramTestFixtures.VERTEX_SOURCE,
                source
            ), expectedError);
        });

        assert.deepEqual(fixture.createdShaders, []);
        assert.deepEqual(fixture.createdPrograms, []);
    });
});

test("'ShaderProgram' should pass empty source strings to the WebGL compiler", () => {
    withFakeBrowserWebGLEnvironment((environment) => {
        // Arrange
        const expectedSource = TestConstants.EMPTY_STRING_CHAR;
        const fixture        = ShaderProgramTestFixtures.createFixture(environment);

        // Act
        ShaderProgramTestFixtures.createProgram(fixture, expectedSource, expectedSource);

        // Assert
        const expectedCalls = fixture.createdShaders.map((shader) => [shader, expectedSource]);
        assert.deepEqual(fixture.calls.shaderSource, expectedCalls);
    });
});

['VERTEX_SHADER', 'FRAGMENT_SHADER'].forEach((shaderStage) => {
    test(`'ShaderProgram' should release earlier shaders when '${shaderStage}' cannot be created`, () => {
        withFakeBrowserWebGLEnvironment((environment) => {
            // Arrange
            const expectedError  = { name: 'Error', message: SHADER_PROGRAM_EXCEPTION_MESSAGES.SHADER_CREATION };
            const fixture        = ShaderProgramTestFixtures.createFixture(environment);
            const context        = fixture.renderingContext;
            const originalCreate = context.createShader.bind(context);
            context.createShader = (type) => type === context[shaderStage] ? null : originalCreate(type);

            // Act & Assert
            assert.throws(() => ShaderProgramTestFixtures.createProgram(fixture), expectedError);
            const expectedDeletedShaders = fixture.createdShaders.map((shader) => [shader]);

            assert.deepEqual(fixture.calls.deleteShader, expectedDeletedShaders);
            assert.deepEqual(fixture.createdPrograms, []);
        });
    });

    test(`'ShaderProgram' should report '${shaderStage}' compilation errors and release every allocated shader`, () => {
        // Arrange
        const infoLogs = ['Invalid shader syntax: $&', '', null];

        infoLogs.forEach((infoLog) => {
            withFakeBrowserWebGLEnvironment((environment) => {
                // Also arrange
                const fixture       = ShaderProgramTestFixtures.createFixture(environment);
                const context       = fixture.renderingContext;
                const expectedLog   = infoLog || SHADER_PROGRAM_EXCEPTION_MESSAGES.UNKNOWN_COMPILE_ERROR;
                const expectedError = {
                    name    : 'Error',
                    message : SHADER_PROGRAM_EXCEPTION_MESSAGES.SHADER_COMPILE(expectedLog)
                };

                context.getShaderParameter = (shader) => shader.type !== context[shaderStage];
                context.getShaderInfoLog   = () => infoLog;

                // Act & Assert
                assert.throws(() => ShaderProgramTestFixtures.createProgram(fixture), expectedError);

                // A failing fragment shader is deleted before the earlier vertex shader
                const expectedDeletedShaders = [...fixture.createdShaders].reverse().map((shader) => [shader]);
                assert.deepEqual(fixture.calls.deleteShader, expectedDeletedShaders);
                assert.deepEqual(fixture.createdPrograms, []);
            });
        });
    });
});

test("'ShaderProgram' should release both shaders when a program cannot be created", () => {
    withFakeBrowserWebGLEnvironment((environment) => {
        // Arrange
        const expectedError = { name: 'Error', message: SHADER_PROGRAM_EXCEPTION_MESSAGES.PROGRAM_CREATION };
        const fixture       = ShaderProgramTestFixtures.createFixture(environment);
        fixture.renderingContext.createProgram = () => null;

        // Act & Assert
        assert.throws(() => ShaderProgramTestFixtures.createProgram(fixture), expectedError);
        const expectedDeletedShaders = fixture.createdShaders.map((shader) => [shader]);

        assert.deepEqual(fixture.calls.deleteShader, expectedDeletedShaders);
        assert.deepEqual(fixture.calls.deleteProgram, []);
        assert.deepEqual(fixture.calls.attachShader, []);
    });
});

test("'ShaderProgram' should report link errors and release the program and both shaders", () => {
    // Arrange
    const infoLogs = ['Varying mismatch: $&', '', null];

    infoLogs.forEach((infoLog) => {
        withFakeBrowserWebGLEnvironment((environment) => {
            // Also arrange
            const fixture       = ShaderProgramTestFixtures.createFixture(environment);
            const expectedLog   = infoLog || SHADER_PROGRAM_EXCEPTION_MESSAGES.UNKNOWN_LINK_ERROR;
            const expectedError = {
                name    : 'Error',
                message : SHADER_PROGRAM_EXCEPTION_MESSAGES.PROGRAM_LINK(expectedLog)
            };

            fixture.renderingContext.getProgramParameter = () => false;
            fixture.renderingContext.getProgramInfoLog   = () => infoLog;

            // Act & Assert
            assert.throws(() => ShaderProgramTestFixtures.createProgram(fixture), expectedError);
            const expectedDeletedPrograms = fixture.createdPrograms.map((program) => [program]);
            const expectedDeletedShaders  = fixture.createdShaders.map((shader) => [shader]);

            assert.deepEqual(fixture.calls.deleteProgram, expectedDeletedPrograms);
            assert.deepEqual(fixture.calls.deleteShader, expectedDeletedShaders);
        });
    });
});

test("'ShaderProgram' should preserve unexpected WebGL errors and release allocated resources", () => {
    // Arrange
    const expectedError  = new Error('WebGL operation failed.');
    const failingMethods = ['shaderSource', 'compileShader', 'getShaderParameter', 'attachShader', 'linkProgram', 'getProgramParameter'];

    failingMethods.forEach((method) => {
        withFakeBrowserWebGLEnvironment((environment) => {
            // Also arrange
            const fixture = ShaderProgramTestFixtures.createFixture(environment);
            fixture.renderingContext[method] = () => { throw expectedError; };

            // Act & Assert
            assert.throws(() => ShaderProgramTestFixtures.createProgram(fixture), (error) => error === expectedError);
            const expectedDeletedPrograms = fixture.createdPrograms.map((program) => [program]);
            const expectedDeletedShaders  = fixture.createdShaders.map((shader) => [shader]);

            assert.deepEqual(fixture.calls.deleteProgram, expectedDeletedPrograms);
            assert.deepEqual(fixture.calls.deleteShader, expectedDeletedShaders);
        });
    });
});

test("'ShaderProgram.use' should activate the linked program on every call", () => {
    withFakeBrowserWebGLEnvironment((environment) => {
        // Arrange
        const fixture         = ShaderProgramTestFixtures.createFixture(environment);
        const shaderProgram   = ShaderProgramTestFixtures.createProgram(fixture);
        const expectedProgram = shaderProgram.program;

        // Act
        shaderProgram.use();
        shaderProgram.use();

        // Assert
        assert.deepEqual(fixture.calls.useProgram, [[expectedProgram], [expectedProgram]]);
    });
});

test("'ShaderProgram.getAttribLocation' should return zero and positive locations without caching", () => {
    // Arrange
    const expectedLocations = [0, 3];

    expectedLocations.forEach((expectedLocation) => {
        withFakeBrowserWebGLEnvironment((environment) => {
            // Also arrange
            const fixture       = ShaderProgramTestFixtures.createFixture(environment);
            const shaderProgram = ShaderProgramTestFixtures.createProgram(fixture);
            const expectedName  = ShaderProgramTestFixtures.ATTRIBUTE_NAME;
            const lookupCalls   = [];

            fixture.renderingContext.getAttribLocation = (...args) => {
                lookupCalls.push(args);
                return expectedLocation;
            };

            // Act
            const actualFirstLocation  = shaderProgram.getAttribLocation(expectedName);
            const actualSecondLocation = shaderProgram.getAttribLocation(expectedName);

            // Assert
            assert.equal(actualFirstLocation, expectedLocation);
            assert.equal(actualSecondLocation, expectedLocation);

            // Both lookups should call WebGL with the same arguments, because the attribute locations are not cached
            assert.deepEqual(
                lookupCalls,
                [
                    [shaderProgram.program, expectedName],
                    [shaderProgram.program, expectedName]
                ]
            );
        });
    });
});

test("'ShaderProgram.getAttribLocation' should reject invalid names before querying WebGL", () => {
    withFakeBrowserWebGLEnvironment((environment) => {
        // Arrange
        const expectedError = { name: 'TypeError', message: SHADER_PROGRAM_EXCEPTION_MESSAGES.ATTRIBUTE_NAME_TYPE };
        const fixture       = ShaderProgramTestFixtures.createFixture(environment);
        const shaderProgram = ShaderProgramTestFixtures.createProgram(fixture);

        // Act & Assert
        ShaderProgramTestFixtures.INVALID_STRING_VALUES.forEach((name) => {
            assert.throws(() => shaderProgram.getAttribLocation(name), expectedError);
        });

        assert.deepEqual(fixture.calls.getAttribLocation, []);
    });
});

test("'ShaderProgram.getAttribLocation' should report a missing attribute", () => {
    withFakeBrowserWebGLEnvironment((environment) => {
        // Arrange
        const missingLocation = -1;
        const name            = ShaderProgramTestFixtures.ATTRIBUTE_NAME;
        const expectedError   = { name: 'Error', message: SHADER_PROGRAM_EXCEPTION_MESSAGES.ATTRIBUTE_NOT_FOUND(name) };
        const fixture         = ShaderProgramTestFixtures.createFixture(environment);
        const shaderProgram   = ShaderProgramTestFixtures.createProgram(fixture);
        fixture.renderingContext.getAttribLocation = () => missingLocation;

        // Act & Assert
        assert.throws(() => shaderProgram.getAttribLocation(name), expectedError);
    });
});

test("'ShaderProgram.getUniformLocation' should cache locations by name and share the cache with setters", () => {
    withFakeBrowserWebGLEnvironment((environment) => {
        // Arrange
        const fixture       = ShaderProgramTestFixtures.createFixture(environment);
        const shaderProgram = ShaderProgramTestFixtures.createProgram(fixture);
        const name          = ShaderProgramTestFixtures.UNIFORM_NAME;
        const otherName     = ShaderProgramTestFixtures.OTHER_UNIFORM_NAME;
        const expectedValue = ShaderProgramTestFixtures.FLOAT_VALUE;

        // Act
        const firstLocation  = shaderProgram.getUniformLocation(name);
        const cachedLocation = shaderProgram.getUniformLocation(name);
        const otherLocation  = shaderProgram.getUniformLocation(otherName);

        shaderProgram.setFloat(name, expectedValue);

        // Assert
        assert.equal(cachedLocation, firstLocation);
        assert.notEqual(otherLocation, firstLocation);

        assert.deepEqual(
            fixture.calls.getUniformLocation,
            [
                [shaderProgram.program, name],
                [shaderProgram.program, otherName]
            ]
        );

        assert.deepEqual(
            fixture.calls.uniform1f,
            [
                [firstLocation, expectedValue]
            ]
        );
    });
});

test("'ShaderProgram.getUniformLocation' should keep separate caches for separate program instances", () => {
    withFakeBrowserWebGLEnvironment((environment) => {
        // Arrange
        const fixture       = ShaderProgramTestFixtures.createFixture(environment);
        const firstProgram  = ShaderProgramTestFixtures.createProgram(fixture);
        const secondProgram = ShaderProgramTestFixtures.createProgram(fixture);
        const name          = ShaderProgramTestFixtures.UNIFORM_NAME;

        // Act
        const firstLocation  = firstProgram.getUniformLocation(name);
        const secondLocation = secondProgram.getUniformLocation(name);

        // Assert
        assert.notEqual(firstLocation, secondLocation);
        assert.deepEqual(
            fixture.calls.getUniformLocation,
            [
                [firstProgram.program, name],
                [secondProgram.program, name]
            ]
        );
    });
});

test("'ShaderProgram.getUniformLocation' should retry missing uniforms instead of caching null", () => {
    withFakeBrowserWebGLEnvironment((environment) => {
        // Arrange
        const fixture        = ShaderProgramTestFixtures.createFixture(environment);
        const shaderProgram  = ShaderProgramTestFixtures.createProgram(fixture);
        const name           = ShaderProgramTestFixtures.UNIFORM_NAME;
        const lookupCalls    = [];
        const expectedResult = { program: shaderProgram.program, name };
        const expectedError  = { name: 'Error', message: SHADER_PROGRAM_EXCEPTION_MESSAGES.UNIFORM_NOT_FOUND(name) };

        fixture.renderingContext.getUniformLocation = (...args) => {
            lookupCalls.push(args);
            return null;
        };

        // Act & Assert
        assert.throws(() => shaderProgram.getUniformLocation(name), expectedError);
        assert.throws(() => shaderProgram.getUniformLocation(name), expectedError);
        assert.deepEqual(lookupCalls, [[shaderProgram.program, name], [shaderProgram.program, name]]);

        // Also arrange
        fixture.renderingContext.getUniformLocation = () => expectedResult;

        // Act
        const actualLocation = shaderProgram.getUniformLocation(name);

        // Assert
        assert.equal(actualLocation, expectedResult);
    });
});

test("'ShaderProgram' uniform methods should reject invalid names before uploading values", () => {
    withFakeBrowserWebGLEnvironment((environment) => {
        // Arrange
        const fixture       = ShaderProgramTestFixtures.createFixture(environment);
        const shaderProgram = ShaderProgramTestFixtures.createProgram(fixture);
        const cases         = ShaderProgramTestFixtures.createUniformCases(fixture);
        const eventsBefore  = [...fixture.events];

        // Act & Assert
        cases.forEach(({ method, args, messageKey }) => {
            const expectedError = { name: 'TypeError', message: SHADER_PROGRAM_EXCEPTION_MESSAGES[messageKey] };

            ShaderProgramTestFixtures.INVALID_STRING_VALUES.forEach((name) => {
                assert.throws(() => shaderProgram[method](name, ...args), expectedError);
            });
        });

        assert.deepEqual(fixture.events, eventsBefore);
    });
});

test("'ShaderProgram' uniform methods should stop before uploading when the uniform is missing", () => {
    withFakeBrowserWebGLEnvironment((environment) => {
        // Arrange
        const name          = ShaderProgramTestFixtures.UNIFORM_NAME;
        const expectedError = { name: 'Error', message: SHADER_PROGRAM_EXCEPTION_MESSAGES.UNIFORM_NOT_FOUND(name) };
        const fixture       = ShaderProgramTestFixtures.createFixture(environment);
        const cases         = ShaderProgramTestFixtures.createUniformCases(fixture);
        const shaderProgram = ShaderProgramTestFixtures.createProgram(fixture);
        fixture.renderingContext.getUniformLocation = () => null;

        // Act & Assert
        cases.forEach(({ method, args }) => {
            assert.throws(() => shaderProgram[method](name, ...args), expectedError);
        });

        assert.deepEqual(fixture.calls.uniform1f, []);
        assert.deepEqual(fixture.calls.uniform1i, []);
        assert.deepEqual(fixture.calls.uniform2fv, []);
        assert.deepEqual(fixture.calls.uniform3fv, []);
        assert.deepEqual(fixture.calls.uniform4fv, []);
        assert.deepEqual(fixture.calls.uniformMatrix4fv, []);
    });
});

test("'ShaderProgram.setFloat' should upload numeric values without changing the existing finite-value policy", () => {
    withFakeBrowserWebGLEnvironment((environment) => {
        // Arrange
        const fixture       = ShaderProgramTestFixtures.createFixture(environment);
        const shaderProgram = ShaderProgramTestFixtures.createProgram(fixture);
        const name          = ShaderProgramTestFixtures.UNIFORM_NAME;
        const location      = shaderProgram.getUniformLocation(name);
        const values        = [0, -1, ShaderProgramTestFixtures.FLOAT_VALUE, ...MATH_NON_FINITE_VALUES];
        const expectedCalls = values.map((value) => [location, value]);

        // Act
        values.forEach((value) => shaderProgram.setFloat(name, value));

        // Assert
        assert.deepEqual(fixture.calls.uniform1f, expectedCalls);
    });
});

test("'ShaderProgram.setFloat' should reject non-numeric values before looking up the uniform", () => {
    withFakeBrowserWebGLEnvironment((environment) => {
        // Arrange
        const expectedError = { name: 'TypeError', message: SHADER_PROGRAM_EXCEPTION_MESSAGES.FLOAT_VALUE_TYPE };
        const fixture       = ShaderProgramTestFixtures.createFixture(environment);
        const shaderProgram = ShaderProgramTestFixtures.createProgram(fixture);
        const values        = [undefined, null, true, '1', {}, [], Object(1)];

        // Act & Assert
        values.forEach((value) => {
            assert.throws(() => shaderProgram.setFloat(ShaderProgramTestFixtures.UNIFORM_NAME, value), expectedError);
        });

        assert.deepEqual(fixture.calls.getUniformLocation, []);
        assert.deepEqual(fixture.calls.uniform1f, []);
    });
});

test("'ShaderProgram.setInt' should upload zero, negative and positive integers", () => {
    withFakeBrowserWebGLEnvironment((environment) => {
        // Arrange
        const fixture       = ShaderProgramTestFixtures.createFixture(environment);
        const shaderProgram = ShaderProgramTestFixtures.createProgram(fixture);
        const name          = ShaderProgramTestFixtures.UNIFORM_NAME;
        const location      = shaderProgram.getUniformLocation(name);
        const values        = [0, ShaderProgramTestFixtures.INT_VALUE, 5];
        const expectedCalls = values.map((value) => [location, value]);

        // Act
        values.forEach((value) => shaderProgram.setInt(name, value));

        // Assert
        assert.deepEqual(fixture.calls.uniform1i, expectedCalls);
    });
});

test("'ShaderProgram.setInt' should reject non-integers before looking up the uniform", () => {
    withFakeBrowserWebGLEnvironment((environment) => {
        // Arrange
        const expectedError = { name: 'TypeError', message: SHADER_PROGRAM_EXCEPTION_MESSAGES.INT_VALUE_TYPE };
        const fixture       = ShaderProgramTestFixtures.createFixture(environment);
        const shaderProgram = ShaderProgramTestFixtures.createProgram(fixture);
        const values        = [undefined, null, false, '1', {}, [], 0.5, ...MATH_NON_FINITE_VALUES];

        // Act & Assert
        values.forEach((value) => {
            assert.throws(() => shaderProgram.setInt(ShaderProgramTestFixtures.UNIFORM_NAME, value), expectedError);
        });

        assert.deepEqual(fixture.calls.getUniformLocation, []);
        assert.deepEqual(fixture.calls.uniform1i, []);
    });
});

ShaderProgramTestFixtures.createVectorCases().forEach(({ method, upload, values, messagePrefix }) => {
    test(`'ShaderProgram.${method}' should upload ordinary arrays and typed array views without copying`, () => {
        withFakeBrowserWebGLEnvironment((environment) => {
            // Arrange
            const fixture       = ShaderProgramTestFixtures.createFixture(environment);
            const shaderProgram = ShaderProgramTestFixtures.createProgram(fixture);
            const name          = ShaderProgramTestFixtures.UNIFORM_NAME;
            const location      = shaderProgram.getUniformLocation(name);
            const paddingStart  = ShaderProgramTestFixtures.VIEW_PADDING_START;
            const paddingEnd    = ShaderProgramTestFixtures.VIEW_PADDING_END;
            const storage       = new Float32Array([paddingStart, ...values, paddingEnd]);
            const firstElement  = ShaderProgramTestFixtures.VIEW_START_INDEX;
            const excludedTail  = ShaderProgramTestFixtures.VIEW_END_INDEX;
            const typedView     = storage.subarray(firstElement, excludedTail);
            const arrayValue    = [...values];

            // Act
            shaderProgram[method](name, arrayValue);
            shaderProgram[method](name, typedView);

            // Take the second argument from each upload call, skipping the uniform location
            const [[, actualArray], [, actualView]] = fixture.calls[upload];

            // Assert
            assert.deepEqual(fixture.calls[upload], [[location, arrayValue], [location, typedView]]);
            assert.equal(actualArray, arrayValue);
            assert.equal(actualView, typedView);
            assert.deepEqual(arrayValue, values);
            assert.deepEqual(storage, new Float32Array([paddingStart, ...values, paddingEnd]));
        });
    });

    test(`'ShaderProgram.${method}' should reject unsupported vector storage`, () => {
        withFakeBrowserWebGLEnvironment((environment) => {
            // Arrange
            const expectedError = { name: 'TypeError', message: SHADER_PROGRAM_EXCEPTION_MESSAGES[`${messagePrefix}_TYPE`] };
            const fixture       = ShaderProgramTestFixtures.createFixture(environment);
            const shaderProgram = ShaderProgramTestFixtures.createProgram(fixture);
            const invalidValues = [undefined, null, 'vector', {}, new Float64Array(values), new Int32Array(values)];

            // Act & Assert
            invalidValues.forEach((value) => {
                assert.throws(() => shaderProgram[method](ShaderProgramTestFixtures.UNIFORM_NAME, value), expectedError);
            });

            assert.deepEqual(fixture.calls.getUniformLocation, []);
            assert.deepEqual(fixture.calls[upload], []);
        });
    });

    test(`'ShaderProgram.${method}' should reject shorter and longer vectors`, () => {
        withFakeBrowserWebGLEnvironment((environment) => {
            // Arrange
            const fixture        = ShaderProgramTestFixtures.createFixture(environment);
            const shaderProgram  = ShaderProgramTestFixtures.createProgram(fixture);
            const firstElement   = 0;
            const excludedTail   = -1;
            const extraComponent = 1.0;
            const shorterValue   = values.slice(firstElement, excludedTail);
            const longerValue    = [...values, extraComponent];
            const invalidValues  = [shorterValue, longerValue, new Float32Array(shorterValue), new Float32Array(longerValue)];
            const expectedError  = { name: 'TypeError', message: SHADER_PROGRAM_EXCEPTION_MESSAGES[`${messagePrefix}_LENGTH`] };

            // Act & Assert
            invalidValues.forEach((value) => {
                assert.throws(() => shaderProgram[method](ShaderProgramTestFixtures.UNIFORM_NAME, value), expectedError);
            });

            assert.deepEqual(fixture.calls.getUniformLocation, []);
            assert.deepEqual(fixture.calls[upload], []);
        });
    });
});

test("'ShaderProgram.setMatrix4' should upload the original matrix view without transposing it", () => {
    withFakeBrowserWebGLEnvironment((environment) => {
        // Arrange
        const fixture           = ShaderProgramTestFixtures.createFixture(environment);
        const shaderProgram     = ShaderProgramTestFixtures.createProgram(fixture);
        const name              = ShaderProgramTestFixtures.UNIFORM_NAME;
        const location          = shaderProgram.getUniformLocation(name);
        const paddingStart      = ShaderProgramTestFixtures.VIEW_PADDING_START;
        const paddingEnd        = ShaderProgramTestFixtures.VIEW_PADDING_END;
        const storage           = new Float32Array([paddingStart, ...ShaderProgramTestFixtures.MATRIX4, paddingEnd]);
        const firstElement      = ShaderProgramTestFixtures.VIEW_START_INDEX;
        const excludedTail      = ShaderProgramTestFixtures.VIEW_END_INDEX;
        const matrix            = storage.subarray(firstElement, excludedTail);
        const expectedStorage   = new Float32Array(storage);
        const expectedTranspose = false;

        // Act
        shaderProgram.setMatrix4(name, matrix);
        const [[actualLocation, actualTranspose, actualMatrix]] = fixture.calls.uniformMatrix4fv;

        // Assert
        assert.deepEqual(fixture.calls.uniformMatrix4fv, [[location, expectedTranspose, matrix]]);
        assert.equal(actualLocation, location);
        assert.equal(actualTranspose, expectedTranspose);
        assert.equal(actualMatrix, matrix);
        assert.deepEqual(storage, expectedStorage);
    });
});

test("'ShaderProgram.setMatrix4' should reject unsupported storage and incorrect matrix lengths", () => {
    withFakeBrowserWebGLEnvironment((environment) => {
        // Arrange
        const expectedError = { name: 'TypeError', message: SHADER_PROGRAM_EXCEPTION_MESSAGES.MATRIX4_TYPE };
        const fixture       = ShaderProgramTestFixtures.createFixture(environment);
        const shaderProgram = ShaderProgramTestFixtures.createProgram(fixture);
        const shortLength   = 15;
        const longLength    = 17;
        const invalidValues = [
            undefined, null, {}, ShaderProgramTestFixtures.MATRIX4,
            new Float64Array(ShaderProgramTestFixtures.MATRIX4),
            new Float32Array(shortLength), new Float32Array(longLength)
        ];

        // Act & Assert
        invalidValues.forEach((value) => {
            assert.throws(() => shaderProgram.setMatrix4(ShaderProgramTestFixtures.UNIFORM_NAME, value), expectedError);
        });

        assert.deepEqual(fixture.calls.getUniformLocation, []);
        assert.deepEqual(fixture.calls.uniformMatrix4fv, []);
    });
});

test("'ShaderProgram.setTexture2D' should bind the default or explicit unit before uploading its sampler", () => {
    // Arrange
    const defaultUnit = 0;
    const unitCases   = [
        { args: [], expectedUnit: defaultUnit },
        { args: [undefined], expectedUnit: defaultUnit },
        { args: [defaultUnit], expectedUnit: defaultUnit },
        { args: [ShaderProgramTestFixtures.TEXTURE_UNIT_INDEX], expectedUnit: ShaderProgramTestFixtures.TEXTURE_UNIT_INDEX }
    ];

    unitCases.forEach(({ args, expectedUnit }) => {
        withFakeBrowserWebGLEnvironment((environment) => {
            // Also arrange
            const fixture                = ShaderProgramTestFixtures.createFixture(environment);
            const shaderProgram          = ShaderProgramTestFixtures.createProgram(fixture);
            const { texture, bindCalls } = ShaderProgramTestFixtures.createTexture(fixture);
            const name                   = ShaderProgramTestFixtures.UNIFORM_NAME;
            const location               = shaderProgram.getUniformLocation(name);
            const firstEvent             = 0;

            // Act
            fixture.events.splice(firstEvent);
            shaderProgram.setTexture2D(name, texture, ...args);

            // Assert
            assert.deepEqual(bindCalls, [expectedUnit]);
            assert.deepEqual(fixture.calls.uniform1i, [[location, expectedUnit]]);
            assert.deepEqual(fixture.events, [
                { method: 'bind', args: [expectedUnit] },
                { method: 'uniform1i', args: [location, expectedUnit] }
            ]);
        });
    });
});

test("'ShaderProgram.setTexture2D' should reject objects that are not Texture2D instances", () => {
    withFakeBrowserWebGLEnvironment((environment) => {
        // Arrange
        const expectedError = { name: 'TypeError', message: SHADER_PROGRAM_EXCEPTION_MESSAGES.TEXTURE_TYPE };
        const fixture       = ShaderProgramTestFixtures.createFixture(environment);
        const shaderProgram = ShaderProgramTestFixtures.createProgram(fixture);
        const invalidValues = [undefined, null, false, {}, { bind() {} }];

        // Act & Assert
        invalidValues.forEach((texture) => {
            assert.throws(() => shaderProgram.setTexture2D(ShaderProgramTestFixtures.UNIFORM_NAME, texture), expectedError);
        });

        assert.deepEqual(fixture.calls.getUniformLocation, []);
        assert.deepEqual(fixture.calls.uniform1i, []);
    });
});

test("'ShaderProgram.setTexture2D' should reject invalid units before binding the texture", () => {
    withFakeBrowserWebGLEnvironment((environment) => {
        // Arrange
        const expectedError          = { name: 'TypeError', message: SHADER_PROGRAM_EXCEPTION_MESSAGES.TEXTURE_UNIT_INDEX };
        const invalidUnits           = [null, false, '0', {}, -1, 0.5, ...MATH_NON_FINITE_VALUES];
        const fixture                = ShaderProgramTestFixtures.createFixture(environment);
        const shaderProgram          = ShaderProgramTestFixtures.createProgram(fixture);
        const { texture, bindCalls } = ShaderProgramTestFixtures.createTexture(fixture);

        // Act & Assert
        invalidUnits.forEach((unit) => {
            assert.throws(() => shaderProgram.setTexture2D(ShaderProgramTestFixtures.UNIFORM_NAME, texture, unit), expectedError);
        });

        assert.deepEqual(bindCalls, []);
        assert.deepEqual(fixture.calls.getUniformLocation, []);
        assert.deepEqual(fixture.calls.uniform1i, []);
    });
});

test("'ShaderProgram.setTexture2D' should preserve binding errors without uploading the sampler", () => {
    withFakeBrowserWebGLEnvironment((environment) => {
        // Arrange
        const expectedError = new RangeError('Texture unit is out of range.');
        const fixture       = ShaderProgramTestFixtures.createFixture(environment);
        const shaderProgram = ShaderProgramTestFixtures.createProgram(fixture);
        const { texture }   = ShaderProgramTestFixtures.createTexture(fixture);
        texture.bind = () => { throw expectedError; };

        // Act & Assert
        assert.throws(() => shaderProgram.setTexture2D(ShaderProgramTestFixtures.UNIFORM_NAME, texture), (error) => error === expectedError);
        assert.deepEqual(fixture.calls.getUniformLocation, []);
        assert.deepEqual(fixture.calls.uniform1i, []);
    });
});

test("'ShaderProgram.dispose' should delete the program exactly once", () => {
    withFakeBrowserWebGLEnvironment((environment) => {
        // Arrange
        const fixture         = ShaderProgramTestFixtures.createFixture(environment);
        const shaderProgram   = ShaderProgramTestFixtures.createProgram(fixture);
        const expectedProgram = shaderProgram.program;

        // Act
        shaderProgram.getUniformLocation(ShaderProgramTestFixtures.UNIFORM_NAME);
        shaderProgram.dispose();
        shaderProgram.dispose();

        // Assert
        assert.deepEqual(fixture.calls.deleteProgram, [[expectedProgram]]);
    });
});

test("'ShaderProgram.setTexture2D' should reject disposal during texture binding before looking up the uniform", () => {
    withFakeBrowserWebGLEnvironment((environment) => {
        // Arrange
        const expectedError = { name: 'Error', message: SHADER_PROGRAM_EXCEPTION_MESSAGES.DISPOSED };
        const fixture       = ShaderProgramTestFixtures.createFixture(environment);
        const shaderProgram = ShaderProgramTestFixtures.createProgram(fixture);
        const { texture }   = ShaderProgramTestFixtures.createTexture(fixture);
        texture.bind = () => shaderProgram.dispose();

        // Act & Assert
        assert.throws(() => shaderProgram.setTexture2D(ShaderProgramTestFixtures.UNIFORM_NAME, texture), expectedError);
        assert.deepEqual(fixture.calls.getUniformLocation, []);
        assert.deepEqual(fixture.calls.uniform1i, []);
    });
});

test("'ShaderProgram' should reject every operation after disposal, including cached lookups", () => {
    withFakeBrowserWebGLEnvironment((environment) => {
        // Arrange
        const expectedError = { name: 'Error', message: SHADER_PROGRAM_EXCEPTION_MESSAGES.DISPOSED };
        const fixture       = ShaderProgramTestFixtures.createFixture(environment);
        const shaderProgram = ShaderProgramTestFixtures.createProgram(fixture);
        const name          = ShaderProgramTestFixtures.UNIFORM_NAME;
        const cases         = ShaderProgramTestFixtures.createUniformCases(fixture);

        // Act
        shaderProgram.getUniformLocation(name);
        shaderProgram.dispose();
        const eventsBefore = [...fixture.events];

        // Assert
        assert.throws(() => shaderProgram.program, expectedError);
        assert.throws(() => shaderProgram.use(), expectedError);
        assert.throws(() => shaderProgram.getAttribLocation(ShaderProgramTestFixtures.ATTRIBUTE_NAME), expectedError);
        assert.throws(() => shaderProgram.getAttribLocation(null), expectedError);

        cases.forEach(({ method, args }) => {
            assert.throws(() => shaderProgram[method](name, ...args), expectedError);
            assert.throws(() => shaderProgram[method](null, ...args), expectedError);
        });

        assert.deepEqual(fixture.events, eventsBefore);
    });
});

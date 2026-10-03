import test                             from 'node:test';
import assert                           from 'node:assert/strict';
import { MATH_COMMON_VALUES }           from '../../../core/constants/math.js';
import { MATH_NON_FINITE_VALUES }       from '../../test-constants/math.js';
import { TEXTURE2D_EXCEPTION_MESSAGES } from '../../../core/exception-messages/texture2d.js';
import { TestConstants }                from '../../helpers/test-constants.js';
import * as Texture2DConstants          from '../../../core/constants/texture2d.js';
import { Texture2D }                    from '../../../core/texture/texture2d.js';
import { Texture2DTestFixtures }        from '../../helpers/texture2d-test-fixtures.mjs';

test("'Texture2D' should upload a magenta placeholder and apply the default sampler", async () => {
    await Texture2DTestFixtures.withEnvironment((fixture) => {
        // Arrange
        const expectedSize     = 1;
        const expectedLevel    = 0;
        const expectedBorder   = 0;
        const context          = fixture.renderingContext;
        const expectedPixel    = new Uint8Array([255, 0, 255, 255]);
        const expectedSamplers = Texture2DTestFixtures.createExpectedSamplerCalls(context);

        // Act
        const texture          = Texture2DTestFixtures.createTexture(fixture);
        const [expectedHandle] = fixture.createdTextures;

        // Assert
        assert.equal(texture.texture, expectedHandle);
        assert.equal(texture.width, expectedSize);
        assert.equal(texture.height, expectedSize);
        assert.equal(texture.isLoaded, false);
        assert.equal(texture.isDisposed, false);

        assert.deepEqual(fixture.calls.texImage2D, [[
            context.TEXTURE_2D,
            expectedLevel,
            context.RGBA,
            expectedSize,
            expectedSize,
            expectedBorder,
            context.RGBA,
            context.UNSIGNED_BYTE,
            expectedPixel
        ]]);

        assert.deepEqual(fixture.calls.texParameteri, expectedSamplers);
        assert.deepEqual(fixture.calls.bindTexture, [[context.TEXTURE_2D, texture.texture], [context.TEXTURE_2D, null]]);
        assert.deepEqual(fixture.calls.pixelStorei, []);
        assert.deepEqual(fixture.calls.generateMipmap, []);
        assert.deepEqual(fixture.calls.deleteTexture, []);

        assert.deepEqual(fixture.events.map(({ method }) => method), [
            'createTexture',
            'bindTexture',
            'texImage2D',
            'texParameteri',
            'texParameteri',
            'texParameteri',
            'texParameteri',
            'bindTexture'
        ]);
    });
});

test("'Texture2D' should reject invalid contexts before allocating a texture", async () => {
    await Texture2DTestFixtures.withEnvironment((fixture) => {
        // Arrange
        const invalidContexts = [undefined, null, {}, [], false];
        const expectedError   = { name: 'TypeError', message: TEXTURE2D_EXCEPTION_MESSAGES.EXPECTS_WEBGL2_CONTEXT };

        // Act & Assert
        invalidContexts.forEach((context) => {
            assert.throws(() => new Texture2D(context), expectedError);
        });

        assert.deepEqual(fixture.events, []);
    });
});

test("'Texture2D' should reject invalid option containers and non-boolean flip settings", async () => {
    await Texture2DTestFixtures.withEnvironment((fixture) => {
        // Arrange
        const expectedOptions   = { name: 'TypeError', message: TEXTURE2D_EXCEPTION_MESSAGES.EXPECTS_OPTIONS_OBJECT };
        const expectedFlip      = { name: 'TypeError', message: TEXTURE2D_EXCEPTION_MESSAGES.EXPECTS_FLIPY_BOOLEAN };
        const invalidFlipValues = [null, 0, 1, 'true', {}, []];

        // Act & Assert
        Texture2DTestFixtures.INVALID_OPTIONS.forEach((options) => {
            assert.throws(() => Texture2DTestFixtures.createTexture(fixture, options), expectedOptions);
        });

        invalidFlipValues.forEach((flipY) => {
            assert.throws(() => Texture2DTestFixtures.createTexture(fixture, { flipY }), expectedFlip);
        });

        assert.deepEqual(fixture.events, []);
    });
});

test("'Texture2D' should accept every supported sampler enum during construction and updates", async () => {
    await Texture2DTestFixtures.withEnvironment((fixture) => {
        // Arrange
        const context = fixture.renderingContext;
        const cases   = Texture2DTestFixtures.createSamplerCases(context);

        cases.forEach(({ property, values }) => {
            values.forEach((value) => {
                // Also arrange
                const options       = { [property]: value };
                const expectedCalls = Texture2DTestFixtures.createExpectedSamplerCalls(context, options);

                // Act & Assert
                Texture2DTestFixtures.clearCalls(fixture);
                const texture = Texture2DTestFixtures.createTexture(fixture, options);
                assert.deepEqual(fixture.calls.texParameteri, expectedCalls);

                Texture2DTestFixtures.clearCalls(fixture);
                texture.setSamplerParams(options);
                assert.deepEqual(fixture.calls.texParameteri, expectedCalls);
                assert.deepEqual(fixture.calls.generateMipmap, []);
            });
        });
    });
});

test("'Texture2D' should reject invalid sampler enums before allocation or GPU updates", async () => {
    await Texture2DTestFixtures.withEnvironment((fixture) => {
        // Arrange
        const texture = Texture2DTestFixtures.createTexture(fixture);
        const cases   = Texture2DTestFixtures.createSamplerCases(fixture.renderingContext);

        // Act
        Texture2DTestFixtures.clearCalls(fixture);

        cases.forEach(({ property, messageKey }) => {
            // Null has a defined reset meaning only for 'minFilter'
            const invalidValues = Texture2DTestFixtures.INVALID_ENUMS.filter((value) => property !== 'minFilter' || value !== null);
            const expectedError = { name: 'TypeError', message: TEXTURE2D_EXCEPTION_MESSAGES[messageKey] };

            // Assert
            invalidValues.forEach((value) => {
                const options = { [property]: value };
                assert.throws(() => Texture2DTestFixtures.createTexture(fixture, options), expectedError);
                assert.throws(() => texture.setSamplerParams(options), expectedError);
            });
        });

        // Also assert
        assert.deepEqual(fixture.events, []);
    });
});

test("'Texture2D' should validate mipmap policies and distinguish omitted from explicitly undefined updates", async () => {
    await Texture2DTestFixtures.withEnvironment((fixture) => {
        // Arrange
        const texture       = Texture2DTestFixtures.createTexture(fixture, { mipmapPolicy: undefined, flipY: undefined });
        const invalidValues = [null, -1, 3, '2', false, ...MATH_NON_FINITE_VALUES];
        const expectedError = { name: 'TypeError', message: TEXTURE2D_EXCEPTION_MESSAGES.EXPECTS_MIPMAP_POLICY };

        // Act & Assert
        Texture2DTestFixtures.clearCalls(fixture);

        invalidValues.forEach((mipmapPolicy) => {
            assert.throws(() => Texture2DTestFixtures.createTexture(fixture, { mipmapPolicy }), expectedError);
            assert.throws(() => texture.setSamplerParams({ mipmapPolicy }), expectedError);
        });

        assert.throws(() => texture.setSamplerParams({ mipmapPolicy: undefined }), expectedError);
        assert.deepEqual(fixture.events, []);
    });
});

test("'Texture2D' should reject every mipmap filter with the NONE policy", async () => {
    await Texture2DTestFixtures.withEnvironment((fixture) => {
        // Arrange
        const mipmapPolicy  = Texture2DConstants.TEXTURE2D_MIPMAP_POLICIES.NONE;
        const expectedError = { name: 'TypeError', message: TEXTURE2D_EXCEPTION_MESSAGES.MIPMAP_POLICY_CONFLICT };
        const texture       = Texture2DTestFixtures.createTexture(fixture, { mipmapPolicy });
        const filters       = Texture2DTestFixtures.createMipmapFilters(fixture.renderingContext);

        // Act & Assert
        Texture2DTestFixtures.clearCalls(fixture);

        filters.forEach((minFilter) => {
            assert.throws(() => Texture2DTestFixtures.createTexture(fixture, { mipmapPolicy, minFilter }), expectedError);
            assert.throws(() => texture.setSamplerParams({ minFilter }), expectedError);
        });

        assert.deepEqual(fixture.events, []);
    });
});

test("'Texture2D' should report allocation failure without uploading or deleting a missing handle", async () => {
    await Texture2DTestFixtures.withEnvironment((fixture) => {
        // Arrange
        const expectedError = { name: 'Error', message: TEXTURE2D_EXCEPTION_MESSAGES.FAILED_CREATE_TEXTURE };
        fixture.renderingContext.createTexture = () => null;

        // Act & Assert
        assert.throws(() => Texture2DTestFixtures.createTexture(fixture), expectedError);
        assert.deepEqual(fixture.events, []);
    });
});

test("'Texture2D' should release the allocated handle when placeholder initialization fails", async () => {
    // Arrange
    const failingMethods = ['texImage2D', 'texParameteri'];

    for (const method of failingMethods) {
        await Texture2DTestFixtures.withEnvironment((fixture) => {
            // Also arrange
            const context       = fixture.renderingContext;
            const expectedError = new Error('Placeholder initialization failed.');
            context[method]     = () => { throw expectedError; };

            // Act & Assert
            assert.throws(() => Texture2DTestFixtures.createTexture(fixture), (error) => error === expectedError);

            const [handle] = fixture.createdTextures;
            assert.deepEqual(fixture.calls.deleteTexture, [[handle]]);
            assert.deepEqual(fixture.calls.bindTexture, [[context.TEXTURE_2D, handle], [context.TEXTURE_2D, null]]);
        });
    }
});

test("'Texture2D.bind' should activate the first, intermediate and last available texture units", async () => {
    await Texture2DTestFixtures.withEnvironment((fixture) => {
        // Arrange
        const firstUnit    = 0;
        const context      = fixture.renderingContext;
        const texture      = Texture2DTestFixtures.createTexture(fixture);
        const lastUnit     = Texture2DTestFixtures.MAX_TEXTURE_UNITS - MATH_COMMON_VALUES.UNIT;
        const textureUnits = [firstUnit, Texture2DTestFixtures.TEXTURE_UNIT_INDEX, lastUnit];

        textureUnits.forEach((unit) => {
            // Act
            Texture2DTestFixtures.clearCalls(fixture);
            texture.bind(unit);

            // Assert
            assert.deepEqual(fixture.events, [
                { method: 'getParameter' , args: [context.MAX_COMBINED_TEXTURE_IMAGE_UNITS] },
                { method: 'activeTexture', args: [context.TEXTURE0 + unit] },
                { method: 'bindTexture'  , args: [context.TEXTURE_2D, texture.texture] }
            ]);
        });
    });
});

test("'Texture2D.bind' should reject invalid texture unit indices before reading WebGL state", async () => {
    await Texture2DTestFixtures.withEnvironment((fixture) => {
        // Arrange
        const expectedError = { name: 'TypeError', message: TEXTURE2D_EXCEPTION_MESSAGES.EXPECTS_TEXTURE_UNIT_INDEX };
        const texture       = Texture2DTestFixtures.createTexture(fixture);
        const invalidUnits  = [undefined, null, '0', false, -1, 0.5, ...MATH_NON_FINITE_VALUES];

        // Act & Assert
        Texture2DTestFixtures.clearCalls(fixture);
        invalidUnits.forEach((unit) => assert.throws(() => texture.bind(unit), expectedError));
        assert.deepEqual(fixture.events, []);
    });
});

test("'Texture2D.bind' should reject unavailable units and invalid context limits", async () => {
    await Texture2DTestFixtures.withEnvironment((fixture) => {
        // Arrange
        const firstUnit     = 0;
        const invalidLimits = [undefined, null, '8', 0, -1, 0.5, ...MATH_NON_FINITE_VALUES];
        const context       = fixture.renderingContext;
        const texture       = Texture2DTestFixtures.createTexture(fixture);
        const maximumIndex  = Texture2DTestFixtures.MAX_TEXTURE_UNITS - MATH_COMMON_VALUES.UNIT;
        const expectedRange = { name: 'RangeError', message: TEXTURE2D_EXCEPTION_MESSAGES.TEXTURE_UNIT_INDEX_OUT_OF_RANGE(maximumIndex) };
        const expectedLimit = { name: 'Error', message: TEXTURE2D_EXCEPTION_MESSAGES.FAILED_READ_MAX_TEXTURE_UNITS };

        // Act & Assert
        Texture2DTestFixtures.clearCalls(fixture);
        assert.throws(() => texture.bind(Texture2DTestFixtures.MAX_TEXTURE_UNITS), expectedRange);

        invalidLimits.forEach((limit) => {
            fixture.parameters.set(context.MAX_COMBINED_TEXTURE_IMAGE_UNITS, limit);
            assert.throws(() => texture.bind(firstUnit), expectedLimit);
        });

        assert.deepEqual(fixture.calls.activeTexture, []);
        assert.deepEqual(fixture.calls.bindTexture, []);
    });
});

test("'Texture2D.setSamplerParams' should preserve unspecified values and ignore inherited sampler properties", async () => {
    await Texture2DTestFixtures.withEnvironment((fixture) => {
        // Arrange
        const context        = fixture.renderingContext;
        const initialOptions = { wrapS: context.CLAMP_TO_EDGE, wrapT: context.MIRRORED_REPEAT, minFilter: context.NEAREST, magFilter: context.NEAREST };
        const texture        = Texture2DTestFixtures.createTexture(fixture, initialOptions);
        const expectedCalls  = Texture2DTestFixtures.createExpectedSamplerCalls(context, initialOptions);
        const updates        = [undefined, {}, Object.create({ wrapS: null, wrapT: null, minFilter: undefined, magFilter: null, mipmapPolicy: null })];

        updates.forEach((options) => {
            // Also arrange
            Texture2DTestFixtures.clearCalls(fixture);

            // Act
            texture.setSamplerParams(options);

            // Assert
            assert.deepEqual(fixture.calls.texParameteri, expectedCalls);
            assert.deepEqual(fixture.calls.bindTexture, [[context.TEXTURE_2D, texture.texture], [context.TEXTURE_2D, null]]);
        });
    });
});

test("'Texture2D' should ignore inherited sampler values and accept options without an object prototype", async () => {
    await Texture2DTestFixtures.withEnvironment((fixture) => {
        // Arrange
        const context       = fixture.renderingContext;
        const optionsList   = [Object.create(null), Object.create({ wrapS: null, wrapT: null, minFilter: undefined, magFilter: null })];
        const expectedCalls = Texture2DTestFixtures.createExpectedSamplerCalls(context);

        optionsList.forEach((options) => {
            // Also arrange
            Texture2DTestFixtures.clearCalls(fixture);

            // Act
            Texture2DTestFixtures.createTexture(fixture, options);

            // Assert
            assert.deepEqual(fixture.calls.texParameteri, expectedCalls);
        });
    });
});

test("'Texture2D.setSamplerParams' should reject invalid updates without changing the previous sampler", async () => {
    await Texture2DTestFixtures.withEnvironment((fixture) => {
        // Arrange
        const expectedError  = { name: 'TypeError', message: TEXTURE2D_EXCEPTION_MESSAGES.EXPECTS_SAMPLER_OPTIONS_OBJECT };
        const expectedEnum   = { name: 'TypeError', message: TEXTURE2D_EXCEPTION_MESSAGES.EXPECTS_MAG_FILTER_ENUM };
        const context        = fixture.renderingContext;
        const initialOptions = { wrapS: context.MIRRORED_REPEAT, minFilter: context.NEAREST };
        const texture        = Texture2DTestFixtures.createTexture(fixture, initialOptions);
        const expectedCalls  = Texture2DTestFixtures.createExpectedSamplerCalls(context, initialOptions);

        // Act & Assert
        Texture2DTestFixtures.clearCalls(fixture);

        Texture2DTestFixtures.INVALID_OPTIONS.forEach((options) => {
            assert.throws(() => texture.setSamplerParams(options), expectedError);
        });

        assert.throws(() => texture.setSamplerParams({ wrapS: context.CLAMP_TO_EDGE, minFilter: null, magFilter: null }), expectedEnum);
        assert.deepEqual(fixture.events, []);

        texture.setSamplerParams();
        assert.deepEqual(fixture.calls.texParameteri, expectedCalls);
    });
});

test("'Texture2D' should reset an explicit min filter with null before an image is loaded", async () => {
    await Texture2DTestFixtures.withEnvironment((fixture) => {
        // Arrange
        const context       = fixture.renderingContext;
        const texture       = Texture2DTestFixtures.createTexture(fixture, { minFilter: context.NEAREST });
        const expectedCalls = Texture2DTestFixtures.createExpectedSamplerCalls(context);

        // Act & Assert
        Texture2DTestFixtures.clearCalls(fixture);
        texture.setSamplerParams({ minFilter: null });
        assert.deepEqual(fixture.calls.texParameteri, expectedCalls);

        Texture2DTestFixtures.clearCalls(fixture);
        Texture2DTestFixtures.createTexture(fixture, { minFilter: null });
        assert.deepEqual(fixture.calls.texParameteri, expectedCalls);
    });
});

test("'Texture2D.setSamplerParams' should unbind the texture when a sampler upload fails", async () => {
    await Texture2DTestFixtures.withEnvironment((fixture) => {
        // Arrange
        const expectedError   = new Error('Sampler upload failed.');
        const context         = fixture.renderingContext;
        const texture         = Texture2DTestFixtures.createTexture(fixture);
        context.texParameteri = () => { throw expectedError; };

        // Act & Assert
        Texture2DTestFixtures.clearCalls(fixture);
        assert.throws(() => texture.setSamplerParams(), (error) => error === expectedError);
        assert.deepEqual(fixture.calls.bindTexture, [[context.TEXTURE_2D, texture.texture], [context.TEXTURE_2D, null]]);
        assert.deepEqual(fixture.calls.deleteTexture, []);
    });
});

test("'Texture2D.loadFromUrl' should reject invalid URLs and options before requesting an image", async () => {
    await Texture2DTestFixtures.withEnvironment(async (fixture) => {
        // Arrange
        const expectedUrl     = { name: 'TypeError', message: TEXTURE2D_EXCEPTION_MESSAGES.EXPECTS_URL_STRING };
        const expectedOptions = { name: 'TypeError', message: TEXTURE2D_EXCEPTION_MESSAGES.EXPECTS_LOAD_OPTIONS_OBJECT };
        const expectedOrigin  = { name: 'TypeError', message: TEXTURE2D_EXCEPTION_MESSAGES.EXPECTS_CROSS_ORIGIN };
        const invalidUrls     = [undefined, null, TestConstants.EMPTY_STRING_CHAR, false, 1, {}, [], Object('image.png')];
        const invalidOrigins  = [undefined, TestConstants.EMPTY_STRING_CHAR, 'invalid', true, 1, {}, []];
        const texture         = Texture2DTestFixtures.createTexture(fixture);

        // Act & Assert
        Texture2DTestFixtures.clearCalls(fixture);

        for (const url of invalidUrls) {
            await assert.rejects(texture.loadFromUrl(url), expectedUrl);
        }

        for (const options of Texture2DTestFixtures.INVALID_OPTIONS) {
            await assert.rejects(texture.loadFromUrl(Texture2DTestFixtures.IMAGE_URL, options), expectedOptions);
        }

        for (const crossOrigin of invalidOrigins) {
            await assert.rejects(texture.loadFromUrl(Texture2DTestFixtures.IMAGE_URL, { crossOrigin }), expectedOrigin);
        }

        assert.deepEqual(fixture.images, []);
        assert.deepEqual(fixture.events, []);
    });
});

test("'Texture2D.loadFromUrl' should set cross-origin mode and handlers before starting each image request", async () => {
    // Arrange
    const requests = [
        { options: undefined, expectedOrigin: null },
        { options: { crossOrigin: null }, expectedOrigin: null },
        { options: { crossOrigin: 'anonymous' }, expectedOrigin: 'anonymous' },
        { options: { crossOrigin: 'use-credentials' }, expectedOrigin: 'use-credentials' },
        { options: Object.create({ crossOrigin: 'invalid' }), expectedOrigin: null }
    ];

    for (const { options, expectedOrigin } of requests) {
        await Texture2DTestFixtures.withEnvironment(async (fixture) => {
            // Also arrange
            const expectedSize = 1;
            const texture      = Texture2DTestFixtures.createTexture(fixture);

            // Act & Assert
            Texture2DTestFixtures.clearCalls(fixture);
            const pending   = texture.loadFromUrl(Texture2DTestFixtures.IMAGE_URL, options);
            const [request] = fixture.requests;

            assert.equal(request.url, Texture2DTestFixtures.IMAGE_URL);
            assert.equal(request.crossOrigin, expectedOrigin);
            assert.equal(typeof request.onload, 'function');
            assert.equal(typeof request.onerror, 'function');
            assert.equal(texture.width, expectedSize);
            assert.equal(texture.height, expectedSize);
            assert.equal(texture.isLoaded, false);
            assert.deepEqual(fixture.events, []);

            Texture2DTestFixtures.completeImage(fixture);
            await pending;
            assert.equal(texture.isLoaded, true);
        });
    }
});

test("'Texture2D.loadFromUrl' should upload the decoded image and restore the previous flip setting", async () => {
    // Arrange
    const expectedLevel = 0;
    const flipSettings  = [false, true];

    for (const flipY of flipSettings) {
        for (const previousFlipY of flipSettings) {
            await Texture2DTestFixtures.withEnvironment(async (fixture) => {
                // Also arrange
                const expectedFlip     = Number(flipY);
                const expectedRestored = Number(previousFlipY);
                const context          = fixture.renderingContext;
                const expectedSamplers = Texture2DTestFixtures.createExpectedSamplerCalls(context, { minFilter: context.LINEAR_MIPMAP_LINEAR });
                const texture          = Texture2DTestFixtures.createTexture(fixture, { flipY });

                // Act
                fixture.parameters.set(context.UNPACK_FLIP_Y_WEBGL, previousFlipY);
                Texture2DTestFixtures.clearCalls(fixture);
                const image = await Texture2DTestFixtures.loadImage(fixture, texture);

                // Assert
                assert.equal(texture.width , Texture2DTestFixtures.IMAGE_WIDTH);
                assert.equal(texture.height, Texture2DTestFixtures.IMAGE_HEIGHT);
                assert.equal(texture.isLoaded, true);

                assert.deepEqual(fixture.calls.texImage2D, [[context.TEXTURE_2D, expectedLevel, context.RGBA, context.RGBA, context.UNSIGNED_BYTE, image]]);
                assert.deepEqual(fixture.calls.pixelStorei, [[context.UNPACK_FLIP_Y_WEBGL, expectedFlip], [context.UNPACK_FLIP_Y_WEBGL, expectedRestored]]);
                assert.equal(fixture.parameters.get(context.UNPACK_FLIP_Y_WEBGL), expectedRestored);
                assert.deepEqual(fixture.calls.generateMipmap, [[context.TEXTURE_2D]]);
                assert.deepEqual(fixture.calls.texParameteri, expectedSamplers);
                assert.deepEqual(fixture.calls.bindTexture, [[context.TEXTURE_2D, texture.texture], [context.TEXTURE_2D, null]]);

                assert.deepEqual(fixture.events.map(({ method }) => method), [
                    'getParameter',
                    'bindTexture',
                    'pixelStorei',
                    'texImage2D',
                    'generateMipmap',
                    'texParameteri', // TEXTURE_WRAP_S     , horizontal wrapping mode
                    'texParameteri', // TEXTURE_WRAP_T     , vertical wrapping mode
                    'texParameteri', // TEXTURE_MIN_FILTER , minification filter
                    'texParameteri', // TEXTURE_MAG_FILTER , magnification filter
                    'pixelStorei',
                    'bindTexture'
                ]);
            });
        }
    }
});

test("'Texture2D.loadFromUrl' should preserve creation defaults and inherited flip and policy settings", async () => {
    // Arrange
    const cases = [
        { options: { flipY: undefined, mipmapPolicy: undefined }, expectedFlip: 1, expectedMipmaps: true },
        { options: Object.create({ flipY: false, mipmapPolicy: Texture2DConstants.TEXTURE2D_MIPMAP_POLICIES.NONE }), expectedFlip: 0, expectedMipmaps: false }
    ];

    for (const { options, expectedFlip, expectedMipmaps } of cases) {
        await Texture2DTestFixtures.withEnvironment(async (fixture) => {
            // Also arrange
            const expectedPreviousFlip = 0;
            const context              = fixture.renderingContext;
            const texture              = Texture2DTestFixtures.createTexture(fixture, options);

            // Act
            Texture2DTestFixtures.clearCalls(fixture);
            await Texture2DTestFixtures.loadImage(fixture, texture);

            // Assert
            assert.deepEqual(fixture.calls.pixelStorei, [[context.UNPACK_FLIP_Y_WEBGL, expectedFlip], [context.UNPACK_FLIP_Y_WEBGL, expectedPreviousFlip]]);
            assert.deepEqual(fixture.calls.generateMipmap, expectedMipmaps ? [[context.TEXTURE_2D]] : []);
        });
    }
});

test("'Texture2D.loadFromUrl' should report image errors and allow a later successful request", async () => {
    await Texture2DTestFixtures.withEnvironment(async (fixture) => {
        // Arrange
        const expectedError = { name: 'Error', message: TEXTURE2D_EXCEPTION_MESSAGES.FAILED_LOAD_IMAGE(Texture2DTestFixtures.IMAGE_URL) };
        const texture       = Texture2DTestFixtures.createTexture(fixture);

        // Act
        Texture2DTestFixtures.clearCalls(fixture);
        const pending = texture.loadFromUrl(Texture2DTestFixtures.IMAGE_URL);
        const [image] = fixture.images;
        image.onerror();

        // Assert
        await assert.rejects(pending, expectedError);
        assert.equal(texture.isLoaded, false);
        assert.deepEqual(fixture.events, []);

        await Texture2DTestFixtures.loadImage(fixture, texture);
        assert.equal(texture.isLoaded, true);
        assert.equal(texture.width, Texture2DTestFixtures.IMAGE_WIDTH);
    });
});

test("'Texture2D.loadFromUrl' should restore upload state when a WebGL operation throws", async () => {
    // Arrange
    const failingMethods = ['texImage2D', 'generateMipmap', 'texParameteri'];

    for (const method of failingMethods) {
        await Texture2DTestFixtures.withEnvironment(async (fixture) => {
            // Also arrange
            const expectedFlip     = 0;
            const expectedRestored = 1;
            const expectedError    = new Error('Image upload failed.');
            const context          = fixture.renderingContext;
            const texture          = Texture2DTestFixtures.createTexture(fixture, { flipY: false });
            context[method]        = () => { throw expectedError; };

            // Act
            fixture.parameters.set(context.UNPACK_FLIP_Y_WEBGL, true);
            Texture2DTestFixtures.clearCalls(fixture);
            const pending = texture.loadFromUrl(Texture2DTestFixtures.IMAGE_URL);
            Texture2DTestFixtures.completeImage(fixture);

            // Assert
            await assert.rejects(pending, (error) => error === expectedError);
            assert.deepEqual(fixture.calls.pixelStorei, [[context.UNPACK_FLIP_Y_WEBGL, expectedFlip], [context.UNPACK_FLIP_Y_WEBGL, expectedRestored]]);
            assert.deepEqual(fixture.calls.bindTexture, [[context.TEXTURE_2D, texture.texture], [context.TEXTURE_2D, null]]);
            assert.deepEqual(fixture.calls.deleteTexture, []);
        });
    }
});

// Mipmap generation and automatic minification filters

test("'Texture2D' should generate mipmaps according to each policy and both image dimensions", async () => {
    // Arrange
    const policies = Texture2DConstants.TEXTURE2D_MIPMAP_POLICIES;
    const width    = Texture2DTestFixtures.IMAGE_WIDTH;
    const height   = Texture2DTestFixtures.IMAGE_HEIGHT;
    const nonPower = Texture2DTestFixtures.NON_POWER_OF_TWO_SIZE;
    const cases    = [
        { mipmapPolicy: policies.NONE   , width, height                    , expectedMipmaps: false },
        { mipmapPolicy: policies.ALWAYS , width: nonPower, height: nonPower, expectedMipmaps: true },
        { mipmapPolicy: policies.AUTO   , width, height                    , expectedMipmaps: true },
        { mipmapPolicy: policies.AUTO   , width: nonPower, height          , expectedMipmaps: false },
        { mipmapPolicy: policies.AUTO   , width, height: nonPower          , expectedMipmaps: false },

        // Invalid dimensions exercise the integer and positive-size guards separately
        { mipmapPolicy: policies.AUTO   , width: 0.5, height               , expectedMipmaps: false },
        { mipmapPolicy: policies.AUTO   , width: 0, height                 , expectedMipmaps: false }
    ];

    for (const { mipmapPolicy, width, height, expectedMipmaps } of cases) {
        await Texture2DTestFixtures.withEnvironment(async (fixture) => {
            // Also arrange
            const context           = fixture.renderingContext;
            const texture           = Texture2DTestFixtures.createTexture(fixture, { mipmapPolicy });
            const expectedMinFilter = expectedMipmaps ? context.LINEAR_MIPMAP_LINEAR : context.LINEAR;
            const expectedSamplers  = Texture2DTestFixtures.createExpectedSamplerCalls(context, { minFilter: expectedMinFilter });

            // Act
            Texture2DTestFixtures.clearCalls(fixture);
            await Texture2DTestFixtures.loadImage(fixture, texture, width, height);

            // Assert
            assert.deepEqual(fixture.calls.generateMipmap, expectedMipmaps ? [[context.TEXTURE_2D]] : []);
            assert.deepEqual(fixture.calls.texParameteri, expectedSamplers);
        });
    }
});

test("'Texture2D' should preserve every explicit min filter when generating mipmaps", async () => {
    await Texture2DTestFixtures.withEnvironment(async (fixture) => {
        // Arrange
        const context = fixture.renderingContext;
        const filters = [context.NEAREST, context.LINEAR, ...Texture2DTestFixtures.createMipmapFilters(context)];

        for (const minFilter of filters) {
            // Also arrange
            const expectedCalls = Texture2DTestFixtures.createExpectedSamplerCalls(context, { minFilter });
            const texture       = Texture2DTestFixtures.createTexture(fixture, { minFilter });

            // Act
            Texture2DTestFixtures.clearCalls(fixture);
            await Texture2DTestFixtures.loadImage(fixture, texture);

            // Assert
            assert.deepEqual(fixture.calls.texParameteri, expectedCalls);
            assert.deepEqual(fixture.calls.generateMipmap, [[context.TEXTURE_2D]]);
        }
    });
});

test("'Texture2D' should preserve explicit non-mipmap filters for non-power-of-two images", async () => {
    await Texture2DTestFixtures.withEnvironment(async (fixture) => {
        // Arrange
        const context = fixture.renderingContext;
        const filters = [context.NEAREST, context.LINEAR];

        for (const minFilter of filters) {
            // Also arrange
            const expectedCalls = Texture2DTestFixtures.createExpectedSamplerCalls(context, { minFilter });
            const texture       = Texture2DTestFixtures.createTexture(fixture, { minFilter });

            // Act
            Texture2DTestFixtures.clearCalls(fixture);
            await Texture2DTestFixtures.loadImage(fixture, texture, Texture2DTestFixtures.NON_POWER_OF_TWO_SIZE);

            // Assert
            assert.deepEqual(fixture.calls.texParameteri, expectedCalls);
            assert.deepEqual(fixture.calls.generateMipmap, []);
        }
    });
});

test("'Texture2D' should reject explicit mipmap filters for non-power-of-two images under AUTO", async () => {
    await Texture2DTestFixtures.withEnvironment(async (fixture) => {
        // Arrange
        const expectedFlip  = 1;
        const restoredFlip  = 0;
        const expectedError = { name: 'TypeError', message: TEXTURE2D_EXCEPTION_MESSAGES.MIPMAP_AUTO_POT_REQUIRED_FOR_MIPMAP_FILTER };
        const context       = fixture.renderingContext;
        const filters       = Texture2DTestFixtures.createMipmapFilters(context);

        for (const minFilter of filters) {
            // Also arrange
            const texture = Texture2DTestFixtures.createTexture(fixture, { minFilter });

            // Act
            Texture2DTestFixtures.clearCalls(fixture);
            const pending = texture.loadFromUrl(Texture2DTestFixtures.IMAGE_URL);
            Texture2DTestFixtures.completeImage(fixture, Texture2DTestFixtures.NON_POWER_OF_TWO_SIZE);

            // Assert
            await assert.rejects(pending, expectedError);
            assert.deepEqual(fixture.calls.generateMipmap, []);
            assert.deepEqual(fixture.calls.texParameteri, []);
            assert.deepEqual(fixture.calls.pixelStorei, [[context.UNPACK_FLIP_Y_WEBGL, expectedFlip], [context.UNPACK_FLIP_Y_WEBGL, restoredFlip]]);
            assert.deepEqual(fixture.calls.bindTexture, [[context.TEXTURE_2D, texture.texture], [context.TEXTURE_2D, null]]);
        }
    });
});

test("'Texture2D' should select the automatic min filter again when image dimensions change", async () => {
    await Texture2DTestFixtures.withEnvironment(async (fixture) => {
        // Arrange
        const context          = fixture.renderingContext;
        const texture          = Texture2DTestFixtures.createTexture(fixture);
        const expectedSamplers = Texture2DTestFixtures.createExpectedSamplerCalls(context);

        // Act
        await Texture2DTestFixtures.loadImage(fixture, texture);
        Texture2DTestFixtures.clearCalls(fixture);
        await Texture2DTestFixtures.loadImage(fixture, texture, Texture2DTestFixtures.NON_POWER_OF_TWO_SIZE);

        // Assert
        assert.deepEqual(fixture.calls.generateMipmap, []);
        assert.deepEqual(fixture.calls.texParameteri, expectedSamplers);
        assert.equal(texture.width, Texture2DTestFixtures.NON_POWER_OF_TWO_SIZE);
    });
});

test("'Texture2D.setSamplerParams' should regenerate mipmaps and update the automatic filter on policy changes", async () => {
    await Texture2DTestFixtures.withEnvironment(async (fixture) => {
        // Arrange
        const context  = fixture.renderingContext;
        const policies = Texture2DConstants.TEXTURE2D_MIPMAP_POLICIES;
        const texture  = Texture2DTestFixtures.createTexture(fixture);
        const cases    = [
            { mipmapPolicy: policies.NONE   , expectedMinFilter: context.LINEAR              , expectedMipmaps: false },
            { mipmapPolicy: policies.ALWAYS , expectedMinFilter: context.LINEAR_MIPMAP_LINEAR, expectedMipmaps: true },
            { mipmapPolicy: policies.AUTO   , expectedMinFilter: context.LINEAR_MIPMAP_LINEAR, expectedMipmaps: true }
        ];

        await Texture2DTestFixtures.loadImage(fixture, texture);

        cases.forEach(({ mipmapPolicy, expectedMinFilter, expectedMipmaps }) => {
            // Also arrange
            const expectedCalls = Texture2DTestFixtures.createExpectedSamplerCalls(context, { minFilter: expectedMinFilter });

            // Act
            Texture2DTestFixtures.clearCalls(fixture);
            texture.setSamplerParams({ mipmapPolicy });

            // Assert
            assert.deepEqual(fixture.calls.generateMipmap, expectedMipmaps ? [[context.TEXTURE_2D]] : []);
            assert.deepEqual(fixture.calls.texParameteri, expectedCalls);
        });
    });
});

test("'Texture2D.setSamplerParams' should restore automatic filtering when an explicit min filter is reset after loading", async () => {
    await Texture2DTestFixtures.withEnvironment(async (fixture) => {
        // Arrange
        const context       = fixture.renderingContext;
        const texture       = Texture2DTestFixtures.createTexture(fixture, { minFilter: context.NEAREST });
        const expectedCalls = Texture2DTestFixtures.createExpectedSamplerCalls(context, { minFilter: context.LINEAR_MIPMAP_LINEAR });

        // Act
        await Texture2DTestFixtures.loadImage(fixture, texture);
        Texture2DTestFixtures.clearCalls(fixture);
        texture.setSamplerParams({ minFilter: null });

        // Assert
        assert.deepEqual(fixture.calls.texParameteri, expectedCalls);
        assert.deepEqual(fixture.calls.generateMipmap, [[context.TEXTURE_2D]]);
    });
});

test("'Texture2D.setSamplerParams' should reject a NONE policy conflicting with the retained explicit filter", async () => {
    await Texture2DTestFixtures.withEnvironment((fixture) => {
        // Arrange
        const context       = fixture.renderingContext;
        const minFilter     = context.LINEAR_MIPMAP_LINEAR;
        const texture       = Texture2DTestFixtures.createTexture(fixture, { minFilter });
        const expectedError = { name: 'TypeError', message: TEXTURE2D_EXCEPTION_MESSAGES.MIPMAP_POLICY_CONFLICT };
        const expectedCalls = Texture2DTestFixtures.createExpectedSamplerCalls(context, { minFilter });

        // Act & Assert
        Texture2DTestFixtures.clearCalls(fixture);
        assert.throws(() => texture.setSamplerParams({ mipmapPolicy: Texture2DConstants.TEXTURE2D_MIPMAP_POLICIES.NONE }), expectedError);
        assert.deepEqual(fixture.events, []);
        texture.setSamplerParams();
        assert.deepEqual(fixture.calls.texParameteri, expectedCalls);
    });
});

test("'Texture2D.setSamplerParams' should unbind after rejecting mipmap filtering on a loaded non-power-of-two image", async () => {
    await Texture2DTestFixtures.withEnvironment(async (fixture) => {
        // Arrange
        const expectedError = { name: 'TypeError', message: TEXTURE2D_EXCEPTION_MESSAGES.MIPMAP_AUTO_POT_REQUIRED_FOR_MIPMAP_FILTER };
        const context       = fixture.renderingContext;
        const texture       = Texture2DTestFixtures.createTexture(fixture);

        // Act
        await Texture2DTestFixtures.loadImage(fixture, texture, Texture2DTestFixtures.NON_POWER_OF_TWO_SIZE);
        Texture2DTestFixtures.clearCalls(fixture);

        // Assert
        assert.throws(() => texture.setSamplerParams({ minFilter: context.LINEAR_MIPMAP_LINEAR }), expectedError);
        assert.deepEqual(fixture.calls.bindTexture, [[context.TEXTURE_2D, texture.texture], [context.TEXTURE_2D, null]]);
        assert.deepEqual(fixture.calls.generateMipmap, []);
        assert.deepEqual(fixture.calls.texParameteri, []);
    });
});

// Disposal and instance isolation

test("'Texture2D.dispose' should delete its own texture exactly once", async () => {
    await Texture2DTestFixtures.withEnvironment((fixture) => {
        // Arrange
        const texture = Texture2DTestFixtures.createTexture(fixture);
        const handle  = texture.texture;

        // Act
        Texture2DTestFixtures.clearCalls(fixture);
        texture.dispose();
        texture.dispose();

        // Assert
        assert.equal(texture.isDisposed, true);
        assert.deepEqual(fixture.events, [{ method: 'deleteTexture', args: [handle] }]);
    });
});

test("'Texture2D' should reject every resource access after disposal", async () => {
    await Texture2DTestFixtures.withEnvironment(async (fixture) => {
        // Arrange
        const expectedError = { name: 'Error', message: TEXTURE2D_EXCEPTION_MESSAGES.INSTANCE_DISPOSED };
        const getters       = ['texture', 'width', 'height', 'isLoaded'];
        const texture       = Texture2DTestFixtures.createTexture(fixture);

        // Act
        texture.dispose();
        Texture2DTestFixtures.clearCalls(fixture);

        // Assert
        getters.forEach((property) => assert.throws(() => texture[property], expectedError));
        assert.throws(() => texture.bind(Texture2DTestFixtures.TEXTURE_UNIT_INDEX), expectedError);
        assert.throws(() => texture.setSamplerParams(), expectedError);
        await assert.rejects(texture.loadFromUrl(Texture2DTestFixtures.IMAGE_URL), expectedError);
        assert.deepEqual(fixture.events, []);
        assert.deepEqual(fixture.images, []);
    });
});

test("'Texture2D.loadFromUrl' should not upload an image completed after disposal", async () => {
    await Texture2DTestFixtures.withEnvironment(async (fixture) => {
        // Arrange
        const expectedError = { name: 'Error', message: TEXTURE2D_EXCEPTION_MESSAGES.INSTANCE_DISPOSED };
        const texture       = Texture2DTestFixtures.createTexture(fixture);
        const pending       = texture.loadFromUrl(Texture2DTestFixtures.IMAGE_URL);

        // Act
        texture.dispose();
        Texture2DTestFixtures.clearCalls(fixture);
        Texture2DTestFixtures.completeImage(fixture);

        // Assert
        await assert.rejects(pending, expectedError);
        assert.deepEqual(fixture.events, []);
        assert.equal(texture.isDisposed, true);
    });
});

test("'Texture2D' should keep sampler settings, dimensions and disposal independent between instances", async () => {
    await Texture2DTestFixtures.withEnvironment(async (fixture) => {
        // Arrange
        const context       = fixture.renderingContext;
        const expectedSize  = 1;
        const expectedCalls = Texture2DTestFixtures.createExpectedSamplerCalls(context);
        const first         = Texture2DTestFixtures.createTexture(fixture, { minFilter: context.NEAREST });
        const second        = Texture2DTestFixtures.createTexture(fixture);
        const firstHandle   = first.texture;

        // Act
        await Texture2DTestFixtures.loadImage(fixture, first);
        first.dispose();
        Texture2DTestFixtures.clearCalls(fixture);
        second.setSamplerParams();

        // Assert
        assert.notEqual(firstHandle, second.texture);
        assert.equal(second.width, expectedSize);
        assert.equal(second.height, expectedSize);
        assert.equal(second.isLoaded, false);
        assert.equal(second.isDisposed, false);
        assert.deepEqual(fixture.calls.texParameteri, expectedCalls);
        assert.deepEqual(fixture.calls.bindTexture, [[context.TEXTURE_2D, second.texture], [context.TEXTURE_2D, null]]);
    });
});

import { MATH_COMMON_VALUES } from '../../core/constants/math.js';
import { Texture2D }          from '../../core/texture/texture2d.js';

export class Texture2DTestFixtures {
    // Image request, dimensions and texture units used by the tests
    static IMAGE_URL             = '/textures/checker.png';
    static IMAGE_WIDTH           = 8;
    static IMAGE_HEIGHT          = 4;
    static NON_POWER_OF_TWO_SIZE = 3;
    static MAX_TEXTURE_UNITS     = 8;
    static TEXTURE_UNIT_INDEX    = 3;

    // Invalid option containers are shared by construction, sampler and loading tests
    static INVALID_OPTIONS = Object.freeze([null, [], false, 1, 'options', () => {}]);
    static INVALID_ENUMS   = Object.freeze([undefined, null, false, 'enum', -1, Number.NaN]);

    // WebGL enum values used by the isolated texture context
    static WEBGL_ENUMS = Object.freeze({
        TEXTURE_2D                       : 0x0DE1,
        TEXTURE0                         : 0x84C0,
        RGBA                             : 0x1908,
        UNSIGNED_BYTE                    : 0x1401,
        REPEAT                           : 0x2901,
        CLAMP_TO_EDGE                    : 0x812F,
        MIRRORED_REPEAT                  : 0x8370,
        NEAREST                          : 0x2600,
        LINEAR                           : 0x2601,
        NEAREST_MIPMAP_NEAREST           : 0x2700,
        LINEAR_MIPMAP_NEAREST            : 0x2701,
        NEAREST_MIPMAP_LINEAR            : 0x2702,
        LINEAR_MIPMAP_LINEAR             : 0x2703,
        TEXTURE_MAG_FILTER               : 0x2800,
        TEXTURE_MIN_FILTER               : 0x2801,
        TEXTURE_WRAP_S                   : 0x2802,
        TEXTURE_WRAP_T                   : 0x2803,
        UNPACK_FLIP_Y_WEBGL              : 0x9240,
        MAX_COMBINED_TEXTURE_IMAGE_UNITS : 0x8B4D
    });

    // Calls and their order are recorded before the 'Texture2D' instance is constructed
    static OBSERVED_METHODS = Object.freeze([
        'createTexture',
        'deleteTexture',
        'bindTexture',
        'activeTexture',
        'getParameter',
        'pixelStorei',
        'texImage2D',
        'texParameteri',
        'generateMipmap'
    ]);

    // Keep the browser globals installed until asynchronous image loading has finished
    static async withEnvironment(callback) {
        const originalContext = Object.getOwnPropertyDescriptor(globalThis, 'WebGL2RenderingContext');
        const originalImage   = Object.getOwnPropertyDescriptor(globalThis, 'Image');
        const images          = [];
        const requests        = [];

        class FakeWebGL2RenderingContext {}

        try {
            Object.defineProperty(globalThis, 'WebGL2RenderingContext', {
                configurable : true,
                value        : FakeWebGL2RenderingContext
            });

            Object.defineProperty(globalThis, 'Image', {
                configurable : true,
                value        : this.#createImageConstructor(images, requests)
            });

            const fixture = this.#createFixture(new FakeWebGL2RenderingContext(), images, requests);
            return await callback(fixture);
        } finally {
            this.#restoreGlobal('WebGL2RenderingContext', originalContext);
            this.#restoreGlobal('Image', originalImage);
        }
    }

    static createTexture(fixture, options) {
        return new Texture2D(fixture.renderingContext, options);
    }

    static clearCalls(fixture) {
        Object.values(fixture.calls).forEach((calls) => { calls.length = MATH_COMMON_VALUES.ZERO; });
        fixture.events.length = MATH_COMMON_VALUES.ZERO;
    }

    // Complete the most recent image request without network access or timers
    static completeImage(fixture, width = this.IMAGE_WIDTH, height = this.IMAGE_HEIGHT) {
        const image  = fixture.images.at(-MATH_COMMON_VALUES.UNIT);
        image.width  = width;
        image.height = height;
        image.onload();
        return image;
    }

    static async loadImage(fixture, texture, width = this.IMAGE_WIDTH, height = this.IMAGE_HEIGHT) {
        const pending = texture.loadFromUrl(this.IMAGE_URL);
        const image   = this.completeImage(fixture, width, height);
        await pending;
        return image;
    }

    static createSamplerCases(context) {
        return [
            { property: 'wrapS'    , values: [context.REPEAT, context.CLAMP_TO_EDGE, context.MIRRORED_REPEAT], messageKey: 'EXPECTS_WRAP_S_ENUM' },
            { property: 'wrapT'    , values: [context.REPEAT, context.CLAMP_TO_EDGE, context.MIRRORED_REPEAT], messageKey: 'EXPECTS_WRAP_T_ENUM' },
            { property: 'minFilter', values: [context.NEAREST, context.LINEAR, ...this.createMipmapFilters(context)], messageKey: 'EXPECTS_MIN_FILTER_ENUM' },
            { property: 'magFilter', values: [context.NEAREST, context.LINEAR], messageKey: 'EXPECTS_MAG_FILTER_ENUM' }
        ];
    }

    static createMipmapFilters(context) {
        return [
            context.NEAREST_MIPMAP_NEAREST,
            context.LINEAR_MIPMAP_NEAREST,
            context.NEAREST_MIPMAP_LINEAR,
            context.LINEAR_MIPMAP_LINEAR
        ];
    }

    static createExpectedSamplerCalls(context, options = {}) {
        const {
            wrapS     = context.REPEAT,
            wrapT     = context.REPEAT,
            minFilter = context.LINEAR,
            magFilter = context.LINEAR
        } = options;

        return [
            [context.TEXTURE_2D, context.TEXTURE_WRAP_S, wrapS],
            [context.TEXTURE_2D, context.TEXTURE_WRAP_T, wrapT],
            [context.TEXTURE_2D, context.TEXTURE_MIN_FILTER, minFilter],
            [context.TEXTURE_2D, context.TEXTURE_MAG_FILTER, magFilter]
        ];
    }

    static #createFixture(renderingContext, images, requests) {
        const calls           = {};
        const events          = [];
        const createdTextures = [];
        const parameters      = new Map([
            [this.WEBGL_ENUMS.UNPACK_FLIP_Y_WEBGL, false],
            [this.WEBGL_ENUMS.MAX_COMBINED_TEXTURE_IMAGE_UNITS, this.MAX_TEXTURE_UNITS]
        ]);

        Object.assign(renderingContext, this.WEBGL_ENUMS);

        const implementations = {
            createTexture : () => {
                const texture = {};
                createdTextures.push(texture);
                return texture;
            },

            getParameter : (parameter)        => parameters.get(parameter),
            pixelStorei  : (parameter, value) => parameters.set(parameter, value)
        };

        this.OBSERVED_METHODS.forEach((method) => {
            calls[method] = [];

            renderingContext[method] = (...args) => {
                calls[method].push(args);
                events.push({ method, args });
                return implementations[method]?.(...args);
            };
        });

        return { renderingContext, calls, events, createdTextures, parameters, images, requests };
    }

    static #createImageConstructor(images, requests) {
        return class FakeImage {
            width       = MATH_COMMON_VALUES.ZERO;
            height      = MATH_COMMON_VALUES.ZERO;
            crossOrigin = null;
            onload      = null;
            onerror     = null;

            constructor() {
                images.push(this);
            }

            set src(url) {
                requests.push({ url, crossOrigin: this.crossOrigin, onload: this.onload, onerror: this.onerror });
            }
        };
    }

    static #restoreGlobal(name, descriptor) {
        if (descriptor) {
            Object.defineProperty(globalThis, name, descriptor);
        } else {
            delete globalThis[name];
        }
    }
}

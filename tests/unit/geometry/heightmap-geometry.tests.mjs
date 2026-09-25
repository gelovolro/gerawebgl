import test                                            from 'node:test';
import assert                                          from 'node:assert/strict';
import { HeightmapGeometry }                           from '../../../core/geometry/heightmap-geometry.js';
import { GeometryTestFixtures, GeometryTestImageData } from '../../helpers/geometry-test-fixtures.mjs';
import { withFakeBrowserWebGLEnvironment }             from '../../helpers/fake-browser-webgl-environment.mjs';

class HeightmapLoadTestFixtures {
    static IMAGE_URL = 'heightmap.png';

    static async withEnvironment(callback) {
        let environment = null;

        withFakeBrowserWebGLEnvironment((value) => {
            environment = value;
        });

        const names       = ['WebGL2RenderingContext', 'ImageData', 'Image', 'document'];
        const descriptors = names.map((name) => [name, Object.getOwnPropertyDescriptor(globalThis, name)]);
        const fixture     = HeightmapLoadTestFixtures.#createFixture(environment);
        const replacements = {
            WebGL2RenderingContext : environment.WebGL2RenderingContext,
            ImageData              : GeometryTestImageData,
            Image                  : HeightmapLoadTestFixtures.#createImageClass(fixture),
            document               : { createElement: () => fixture.canvas }
        };

        Object.entries(replacements).forEach(([name, value]) => {
            Object.defineProperty(globalThis, name, { value, configurable: true, writable: true });
        });

        try {
            return await callback(fixture);
        } finally {
            descriptors.forEach(([name, descriptor]) => {
                if (descriptor) {
                    Object.defineProperty(globalThis, name, descriptor);
                } else {
                    delete globalThis[name];
                }
            });
        }
    }

    static #createFixture(environment) {
        const imageData = GeometryTestFixtures.createImageData();
        const images    = [];
        const drawCalls = [];
        const readCalls = [];
        const context   = {
            drawImage(...args) { drawCalls.push(args); },

            getImageData(...args) {
                readCalls.push(args);
                return imageData;
            }
        };

        const canvas  = { width: 0, height: 0, getContext: () => context };
        const fixture = {
            environment,
            canvas,
            images,
            drawCalls,
            readCalls,
            imageData,
            failLoading      : false,
            renderingContext : environment.createCanvas().context
        };

        return fixture;
    }

    static #createImageClass(fixture) {
        return class HeightmapTestImage {
            width  = fixture.imageData.width;
            height = fixture.imageData.height;

            constructor() {
                fixture.images.push(this);
            }

            set src(value) {
                this.source = value;

                queueMicrotask(() => {
                    if (fixture.failLoading) {
                        this.onerror();
                    } else {
                        this.onload();
                    }
                });
            }
        };
    }

}

test("'HeightmapGeometry' should accept an image source wrapper and preserve sampling modes", () => {
    withFakeBrowserWebGLEnvironment((environment) => {
        // Arrange
        const source        = { imageData: GeometryTestFixtures.createImageData() };
        const options       = { segmentsX: 1, segmentsZ: 1 };
        const expectedModes = { NEAREST: 'nearest', BILINEAR: 'bilinear' };
        const expectedCount = 6;

        // Act
        const fixture     = GeometryTestFixtures.createFixture(environment, HeightmapGeometry, [source, options]);
        const actualModes = HeightmapGeometry.Sampling;

        // Assert
        assert.equal(fixture.geometry.getIndexCount(false), expectedCount);
        assert.deepEqual(actualModes, expectedModes);
        assert.equal(Object.isFrozen(actualModes), true);
        fixture.geometry.dispose();
    });
});

test("'HeightmapGeometry' should reject invalid source images and rendering contexts", async () => {
    await HeightmapLoadTestFixtures.withEnvironment(async (fixture) => {
        // Arrange
        const invalidSources = [null, 'image', [], {}, { imageData: {} }];
        const expectedError  = TypeError;

        // Act & Assert
        invalidSources.forEach((source) => assert.throws(() => new HeightmapGeometry(fixture.renderingContext, source), expectedError));
        assert.throws(() => new HeightmapGeometry(null, fixture.imageData), expectedError);
    });
});

test("'HeightmapGeometry' should preserve zero normals when positions collapse to a line", () => {
    withFakeBrowserWebGLEnvironment((environment) => {
        // Arrange
        const imageData       = GeometryTestFixtures.createImageData();
        const collapsedSize   = 1e-200;
        const options         = { width: collapsedSize, depth: collapsedSize, segmentsX: 1, segmentsZ: 1 };
        const expectedNormals = new Float32Array(12);
        const normalAttribute = GeometryTestFixtures.NORMAL_ATTRIBUTE;

        // Act
        const fixture       = GeometryTestFixtures.createFixture(environment, HeightmapGeometry, [imageData, options]);
        const vertexUploads = fixture.uploads.filter(({ target }) => target === fixture.renderingContext.ARRAY_BUFFER);
        const normalIndex   = fixture.attributes.findIndex(([location]) => location === normalAttribute);
        const actualNormals = vertexUploads[normalIndex].data;

        // Assert
        assert.deepEqual(actualNormals, expectedNormals);
        fixture.geometry.dispose();
    });
});

test("'HeightmapGeometry.loadFromUrl' should load pixels and construct terrain with the supplied options", async () => {
    await HeightmapLoadTestFixtures.withEnvironment(async (fixture) => {
        // Arrange
        const options = {
            width        : 2,
            depth        : 4,
            segmentsX    : 1,
            segmentsZ    : 1,
            heightScale  : 2,
            heightOffset : -1,
            isWireframe  : true
        };

        const expectedImageCount  = 1;
        const expectedCrossOrigin = 'anonymous';
        const expectedMin         = new Float32Array([-1, -1, -2]);
        const expectedMax         = new Float32Array([1, 1, 2]);
        const expectedReadCalls   = [[0, 0, 2, 2]];

        // Act
        const geometry = await HeightmapGeometry.loadFromUrl(
            fixture.renderingContext,
            HeightmapLoadTestFixtures.IMAGE_URL,
            options
        );

        // Assert
        assert.equal(fixture.images.length, expectedImageCount);
        assert.equal(fixture.images[0].crossOrigin, expectedCrossOrigin);
        assert.equal(fixture.images[0].source, HeightmapLoadTestFixtures.IMAGE_URL);
        assert.equal(fixture.canvas.width, fixture.imageData.width);
        assert.equal(fixture.canvas.height, fixture.imageData.height);
        assert.deepEqual(fixture.drawCalls, [[fixture.images[0], 0, 0]]);
        assert.deepEqual(fixture.readCalls, expectedReadCalls);
        assert.deepEqual(geometry.getBoundingBoxMin(), expectedMin);
        assert.deepEqual(geometry.getBoundingBoxMax(), expectedMax);
        assert.equal(geometry.isWireframe, true);
        geometry.dispose();
    });
});

test("'HeightmapGeometry.loadFromUrl' should support its default geometry options", async () => {
    await HeightmapLoadTestFixtures.withEnvironment(async (fixture) => {
        // Arrange
        const expectedIsWireframe = false;

        // Act
        const geometry = await HeightmapGeometry.loadFromUrl(fixture.renderingContext, HeightmapLoadTestFixtures.IMAGE_URL);

        // Assert
        assert.equal(geometry.isWireframe, expectedIsWireframe);
        geometry.dispose();
    });
});

test("'HeightmapGeometry.loadFromUrl' should reject invalid inputs before requesting an image", async () => {
    await HeightmapLoadTestFixtures.withEnvironment(async (fixture) => {
        // Arrange
        const invalidUrls    = [null, 1, ''];
        const invalidOptions = [null, [], 'options'];
        const expectedImages = [];

        // Act & Assert
        await assert.rejects(() => HeightmapGeometry.loadFromUrl(null, HeightmapLoadTestFixtures.IMAGE_URL), TypeError);

        for (const url of invalidUrls) {
            await assert.rejects(() => HeightmapGeometry.loadFromUrl(fixture.renderingContext, url), TypeError);
        }

        for (const options of invalidOptions) {
            await assert.rejects(() => HeightmapGeometry.loadFromUrl(fixture.renderingContext, HeightmapLoadTestFixtures.IMAGE_URL, options), TypeError);
        }

        assert.deepEqual(fixture.images, expectedImages);
    });
});

test("'HeightmapGeometry.loadFromUrl' should reject a failed image request", async () => {
    await HeightmapLoadTestFixtures.withEnvironment(async (fixture) => {
        // Arrange
        const expectedError = { name: 'Error', message: 'Failed to load the heightmap image: heightmap.png' };
        fixture.failLoading = true;

        // Act & Assert
        await assert.rejects(() => HeightmapGeometry.loadFromUrl(fixture.renderingContext, HeightmapLoadTestFixtures.IMAGE_URL), expectedError);
        assert.deepEqual(fixture.drawCalls, []);
    });
});

test("'HeightmapGeometry.loadFromUrl' should reject an unavailable canvas context", async () => {
    await HeightmapLoadTestFixtures.withEnvironment(async (fixture) => {
        // Arrange
        const expectedError = { name: 'Error', message: 'HeightmapGeometry.loadFromUrl failed to acquire a 2D canvas context.' };
        fixture.canvas.getContext = () => null;

        // Act & Assert
        await assert.rejects(() => HeightmapGeometry.loadFromUrl(fixture.renderingContext, HeightmapLoadTestFixtures.IMAGE_URL), expectedError);
        assert.deepEqual(fixture.drawCalls, []);
    });
});
test("'HeightmapGeometry' should reverse sampled image rows only when flipY is enabled", () => {
    withFakeBrowserWebGLEnvironment((environment) => {
        // Arrange
        const cases = [
            { flipY: false, expectedHeights: new Float32Array([0, 64 / 255, 128 / 255, 1]) },
            { flipY: true,  expectedHeights: new Float32Array([128 / 255, 1, 0, 64 / 255]) }
        ];

        cases.forEach(({ flipY, expectedHeights }) => {
            // Also arrange
            const imageData              = GeometryTestFixtures.createImageData();
            const options                = { segmentsX: 1, segmentsZ: 1, sampling: 'nearest', flipY };
            const positionComponentCount = 3;
            const heightComponentIndex   = 1;

            // Act
            const fixture       = GeometryTestFixtures.createFixture(environment, HeightmapGeometry, [imageData, options]);
            const positions     = fixture.uploads.find(({ target }) => target === fixture.renderingContext.ARRAY_BUFFER).data;
            const actualHeights = positions.filter((value, index) => index % positionComponentCount === heightComponentIndex);

            // Assert
            assert.deepEqual(actualHeights, expectedHeights);
            fixture.geometry.dispose();
        });
    });
});

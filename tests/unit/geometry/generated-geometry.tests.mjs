import test                                from 'node:test';
import assert                              from 'node:assert/strict';
import { Geometry }                        from '../../../core/geometry/geometry.js';
import { GeneratedGeometry }               from '../../../core/geometry/generated-geometry.js';
import { Vector3 }                         from '../../../core/math/vector3.js';
import { withFakeBrowserWebGLEnvironment } from '../../helpers/fake-browser-webgl-environment.mjs';
import { BoxGeometry }                     from '../../../core/geometry/box-geometry.js';
import { ConeGeometry }                    from '../../../core/geometry/cone-geometry.js';
import { PlaneGeometry }                   from '../../../core/geometry/plane-geometry.js';
import { PyramidGeometry }                 from '../../../core/geometry/pyramid-geometry.js';
import { SphereGeometry }                  from '../../../core/geometry/sphere-geometry.js';
import { TorusGeometry }                   from '../../../core/geometry/torus-geometry.js';
import { CustomGeometry }                  from '../../../core/geometry/custom-geometry.js';
import { PointsGeometry }                  from '../../../core/geometry/points-geometry.js';
import { PolylineGeometry }                from '../../../core/geometry/polyline-geometry.js';
import { TubeLineGeometry }                from '../../../core/geometry/tube-line-geometry.js';
import { HeightmapGeometry }               from '../../../core/geometry/heightmap-geometry.js';
import { GeometryTestFixtures }            from '../../helpers/geometry-test-fixtures.mjs';

class GeneratedGeometryTestFixtures extends GeometryTestFixtures {
    static createCases() {
        return [
            {
                name                       : 'default box',
                GeometryClass              : BoxGeometry,
                createArguments            : () => [],
                expectedVertexCount        : 24,
                expectedSolidCount         : 36,
                expectedWireframeCount     : 60,
                expectedMin                : [-0.5, -0.5, -0.5],
                expectedMax                : [0.5, 0.5, 0.5],
                expectedAttributes         : [[0, 3], [1, 3], [2, 2], [3, 3]],
                expectedSolidPrimitive     : 'triangles',
                expectedWireframePrimitive : 'lines'
            },

            {
                name                       : 'numeric box',
                GeometryClass              : BoxGeometry,
                createArguments            : () => [2],
                expectedVertexCount        : 24,
                expectedSolidCount         : 36,
                expectedWireframeCount     : 60,
                expectedMin                : [-1, -1, -1],
                expectedMax                : [1, 1, 1],
                expectedAttributes         : [[0, 3], [1, 3], [2, 2], [3, 3]],
                expectedSolidPrimitive     : 'triangles',
                expectedWireframePrimitive : 'lines'
            },

            {
                name                       : 'segmented box with face colors',
                GeometryClass              : BoxGeometry,
                createArguments            : () => [{
                    width          : 2,
                    height         : 4,
                    depth          : 6,
                    widthSegments  : 2,
                    heightSegments : 3,
                    depthSegments  : 4,
                    colors         : new Float32Array([1, 0, 0, 0, 1, 0, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 1])
                }],
                expectedVertexCount        : 94,
                expectedSolidCount         : 312,
                expectedWireframeCount     : 384,
                expectedMin                : [-1, -2, -3],
                expectedMax                : [1, 2, 3],
                expectedAttributes         : [[0, 3], [1, 3], [2, 2], [3, 3]],
                expectedSolidPrimitive     : 'triangles',
                expectedWireframePrimitive : 'lines'
            },

            {
                name                       : 'default cone',
                GeometryClass              : ConeGeometry,
                createArguments            : () => [],
                expectedVertexCount        : 52,
                expectedSolidCount         : 144,
                expectedWireframeCount     : 196,
                expectedMin                : [-0.5, -0.75, -0.5],
                expectedMax                : [0.5, 0.75, 0.5],
                expectedAttributes         : [[0, 3], [1, 3], [2, 2], [3, 3]],
                expectedSolidPrimitive     : 'triangles',
                expectedWireframePrimitive : 'lines'
            },

            {
                name                       : 'open cone',
                GeometryClass              : ConeGeometry,
                createArguments            : () => [{
                    width          : 2,
                    height         : 3,
                    depth          : 4,
                    radialSegments : 4,
                    heightSegments : 2,
                    capped         : false,
                    colors         : this.createColor()
                }],
                expectedVertexCount        : 11,
                expectedSolidCount         : 36,
                expectedWireframeCount     : 44,
                expectedMin                : [-1, -1.5, -2],
                expectedMax                : [1, 1.5, 2],
                expectedAttributes         : [[0, 3], [1, 3], [2, 2], [3, 3]],
                expectedSolidPrimitive     : 'triangles',
                expectedWireframePrimitive : 'lines'
            },

            {
                name                       : 'default plane',
                GeometryClass              : PlaneGeometry,
                createArguments            : () => [],
                expectedVertexCount        : 4,
                expectedSolidCount         : 6,
                expectedWireframeCount     : 10,
                expectedMin                : [-0.5, -0.5, 0],
                expectedMax                : [0.5, 0.5, 0],
                expectedAttributes         : [[0, 3], [1, 3], [2, 2], [3, 3]],
                expectedSolidPrimitive     : 'triangles',
                expectedWireframePrimitive : 'lines'
            },

            {
                name                       : 'segmented plane',
                GeometryClass              : PlaneGeometry,
                createArguments            : () => [{ width: 2, height: 4, widthSegments: 2.9, heightSegments: 3.9, colors: this.createColor() }],
                expectedVertexCount        : 12,
                expectedSolidCount         : 36,
                expectedWireframeCount     : 46,
                expectedMin                : [-1, -2, 0],
                expectedMax                : [1, 2, 0],
                expectedAttributes         : [[0, 3], [1, 3], [2, 2], [3, 3]],
                expectedSolidPrimitive     : 'triangles',
                expectedWireframePrimitive : 'lines'
            },

            {
                name                       : 'default pyramid',
                GeometryClass              : PyramidGeometry,
                createArguments            : () => [],
                expectedVertexCount        : 16,
                expectedSolidCount         : 18,
                expectedWireframeCount     : 34,
                expectedMin                : [-0.5, -0.75, -0.5],
                expectedMax                : [0.5, 0.75, 0.5],
                expectedAttributes         : [[0, 3], [1, 3], [2, 2], [3, 3]],
                expectedSolidPrimitive     : 'triangles',
                expectedWireframePrimitive : 'lines'
            },

            {
                name                       : 'open pyramid',
                GeometryClass              : PyramidGeometry,
                createArguments            : () => [{
                    width          : 2,
                    height         : 3,
                    depth          : 4,
                    widthSegments  : 2,
                    depthSegments  : 3,
                    heightSegments : 2,
                    capped         : false,
                    colors         : this.createColor()
                }],
                expectedVertexCount        : 32,
                expectedSolidCount         : 90,
                expectedWireframeCount     : 116,
                expectedMin                : [-1, -1.5, -2],
                expectedMax                : [1, 1.5, 2],
                expectedAttributes         : [[0, 3], [1, 3], [2, 2], [3, 3]],
                expectedSolidPrimitive     : 'triangles',
                expectedWireframePrimitive : 'lines'
            },

            {
                name                       : 'default sphere',
                GeometryClass              : SphereGeometry,
                createArguments            : () => [],
                expectedVertexCount        : 425,
                expectedSolidCount         : 2304,
                expectedWireframeCount     : 2384,
                expectedMin                : [-0.5, -0.5, -0.5],
                expectedMax                : [0.5, 0.5, 0.5],
                expectedAttributes         : [[0, 3], [1, 3], [2, 2], [3, 3]],
                expectedSolidPrimitive     : 'triangles',
                expectedWireframePrimitive : 'lines'
            },

            {
                name                       : 'ellipsoid',
                GeometryClass              : SphereGeometry,
                createArguments            : () => [{ width: 2, height: 4, depth: 6, widthSegments: 4, heightSegments: 2, colors: this.createColor() }],
                expectedVertexCount        : 15,
                expectedSolidCount         : 48,
                expectedWireframeCount     : 60,
                expectedMin                : [-1, -2, -3],
                expectedMax                : [1, 2, 3],
                expectedAttributes         : [[0, 3], [1, 3], [2, 2], [3, 3]],
                expectedSolidPrimitive     : 'triangles',
                expectedWireframePrimitive : 'lines'
            },

            {
                name                       : 'default torus',
                GeometryClass              : TorusGeometry,
                createArguments            : () => [],
                expectedVertexCount        : 561,
                expectedSolidCount         : 3072,
                expectedWireframeCount     : 3168,
                expectedMin                : [-1, -0.25, -1],
                expectedMax                : [1, 0.25, 1],
                expectedAttributes         : [[0, 3], [1, 3], [2, 2], [3, 3]],
                expectedSolidPrimitive     : 'triangles',
                expectedWireframePrimitive : 'lines'
            },

            {
                name                       : 'coarse torus',
                GeometryClass              : TorusGeometry,
                createArguments            : () => [{ width: 2, height: 0.5, radialSegments: 4, tubularSegments: 4, colors: this.createColor() }],
                expectedVertexCount        : 25,
                expectedSolidCount         : 96,
                expectedWireframeCount     : 112,
                expectedMin                : [-1.25, -0.25, -1.25],
                expectedMax                : [1.25, 0.25, 1.25],
                expectedAttributes         : [[0, 3], [1, 3], [2, 2], [3, 3]],
                expectedSolidPrimitive     : 'triangles',
                expectedWireframePrimitive : 'lines'
            },

            {
                name                       : 'custom triangles',
                GeometryClass              : CustomGeometry,
                createArguments            : () => [this.createCustomOptions()],
                expectedVertexCount        : 3,
                expectedSolidCount         : 3,
                expectedWireframeCount     : 6,
                expectedMin                : [0, 0, 0],
                expectedMax                : [1, 1, 0],
                expectedAttributes         : [[0, 3]],
                expectedSolidPrimitive     : 'triangles',
                expectedWireframePrimitive : 'lines'
            },

            {
                name                       : 'custom buffers',
                GeometryClass              : CustomGeometry,
                createArguments            : () => [{
                    ...this.createCustomOptions(),
                    indices          : new Uint32Array([0, 1, 2]),
                    wireframeIndices : new Uint32Array([0, 1, 1, 2, 0, 2]),
                    uvs              : new Float32Array([0, 0, 1, 0, 0, 1]),
                    normals          : new Float32Array([0, 0, 1, 0, 0, 1, 0, 0, 1]),
                    colors           : this.createColor()
                }],
                expectedVertexCount        : 3,
                expectedSolidCount         : 3,
                expectedWireframeCount     : 6,
                expectedMin                : [0, 0, 0],
                expectedMax                : [1, 1, 0],
                expectedAttributes         : [[0, 3], [1, 3], [2, 2], [3, 3]],
                expectedSolidPrimitive     : 'triangles',
                expectedWireframePrimitive : 'lines'
            },

            {
                name                       : 'point cloud',
                GeometryClass              : PointsGeometry,
                createArguments            : () => [{ positions: this.createPoints(), colors: this.createColor() }],
                expectedVertexCount        : 3,
                expectedSolidCount         : 3,
                expectedWireframeCount     : 3,
                expectedMin                : [0, 0, 0],
                expectedMax                : [1, 1, 0],
                expectedAttributes         : [[0, 3], [1, 3]],
                expectedSolidPrimitive     : 'points',
                expectedWireframePrimitive : 'points'
            },

            {
                name                       : 'empty point cloud',
                GeometryClass              : PointsGeometry,
                createArguments            : () => [{ positions: [] }],
                expectedVertexCount        : 0,
                expectedSolidCount         : 0,
                expectedWireframeCount     : 0,
                expectedMin                : [0, 0, 0],
                expectedMax                : [0, 0, 0],
                expectedAttributes         : [[0, 3]],
                expectedSolidPrimitive     : 'points',
                expectedWireframePrimitive : 'points'
            },

            {
                name                       : 'open polyline',
                GeometryClass              : PolylineGeometry,
                createArguments            : () => [{ positions: this.createPoints() }],
                expectedVertexCount        : 3,
                expectedSolidCount         : 3,
                expectedWireframeCount     : 3,
                expectedMin                : [0, 0, 0],
                expectedMax                : [1, 1, 0],
                expectedAttributes         : [[0, 3]],
                expectedSolidPrimitive     : 'line_strip',
                expectedWireframePrimitive : 'line_strip'
            },

            {
                name                       : 'closed polyline',
                GeometryClass              : PolylineGeometry,
                createArguments            : () => [{ positions: this.createPoints(), loop: true, colors: this.createColor() }],
                expectedVertexCount        : 3,
                expectedSolidCount         : 3,
                expectedWireframeCount     : 3,
                expectedMin                : [0, 0, 0],
                expectedMax                : [1, 1, 0],
                expectedAttributes         : [[0, 3], [1, 3]],
                expectedSolidPrimitive     : 'line_loop',
                expectedWireframePrimitive : 'line_loop'
            },

            {
                name                       : 'default tube',
                GeometryClass              : TubeLineGeometry,
                createArguments            : () => [{ positions: this.createPoints() }],
                expectedVertexCount        : 24,
                expectedSolidCount         : 96,
                expectedWireframeCount     : 112,
                expectedMin                : [0, -0.050000001, -0.050000001],
                expectedMax                : [1.05, 1, 0.050000001],
                expectedAttributes         : [[0, 3]],
                expectedSolidPrimitive     : 'triangles',
                expectedWireframePrimitive : 'lines'
            },

            {
                name                       : 'capped tube',
                GeometryClass              : TubeLineGeometry,
                createArguments            : () => [{ positions: this.createPoints(), width: 0.4, radialSegments: 4, capType: 'flat' }],
                expectedVertexCount        : 14,
                expectedSolidCount         : 72,
                expectedWireframeCount     : 72,
                expectedMin                : [0, -0.2, -0.2],
                expectedMax                : [1.2, 1, 0.2],
                expectedAttributes         : [[0, 3]],
                expectedSolidPrimitive     : 'triangles',
                expectedWireframePrimitive : 'lines'
            },

            {
                name                       : 'closed tube',
                GeometryClass              : TubeLineGeometry,
                createArguments            : () => [{ positions: this.createPoints(), closed: true, radialSegments: 4, capType: 'flat' }],
                expectedVertexCount        : 12,
                expectedSolidCount         : 72,
                expectedWireframeCount     : 72,
                expectedMin                : [-0.050000001, -0.035355341, -0.050000001],
                expectedMax                : [1.0353553, 1.05, 0.050000001],
                expectedAttributes         : [[0, 3]],
                expectedSolidPrimitive     : 'triangles',
                expectedWireframePrimitive : 'lines'
            },

            {
                name                       : 'degenerate tube',
                GeometryClass              : TubeLineGeometry,
                createArguments            : () => [{ positions: [new Vector3(0, 0, 0), new Vector3(0, 0, 0)], radialSegments: 3 }],
                expectedVertexCount        : 6,
                expectedSolidCount         : 18,
                expectedWireframeCount     : 24,
                expectedMin                : [-0.043301269, 0, -0.050000001],
                expectedMax                : [0.043301269, 0, 0.025],
                expectedAttributes         : [[0, 3]],
                expectedSolidPrimitive     : 'triangles',
                expectedWireframePrimitive : 'lines'
            },

            {
                name                       : 'default heightmap',
                GeometryClass              : HeightmapGeometry,
                createArguments            : () => [this.createImageData()],
                expectedVertexCount        : 4,
                expectedSolidCount         : 6,
                expectedWireframeCount     : 10,
                expectedMin                : [-0.5, 0, -0.5],
                expectedMax                : [0.5, 1, 0.5],
                expectedAttributes         : [[0, 3], [1, 3], [2, 2], [3, 3]],
                expectedSolidPrimitive     : 'triangles',
                expectedWireframePrimitive : 'lines'
            },

            {
                name                       : 'bilinear heightmap',
                GeometryClass              : HeightmapGeometry,
                createArguments            : () => [this.createImageData(), {
                    segmentsX    : 2,
                    segmentsZ    : 2,
                    sampling     : 'bilinear',
                    flipY        : false,
                    width        : 2,
                    depth        : 4,
                    heightScale  : 2,
                    heightOffset : -1,
                    isWireframe  : true,
                    colors       : this.createColor()
                }],
                expectedVertexCount        : 9,
                expectedSolidCount         : 24,
                expectedWireframeCount     : 32,
                expectedMin                : [-1, -1, -2],
                expectedMax                : [1, 1, 2],
                expectedAttributes         : [[0, 3], [1, 3], [2, 2], [3, 3]],
                expectedSolidPrimitive     : 'triangles',
                expectedWireframePrimitive : 'lines'
            }
        ];
    }
    static assertIndices(fixture, scenario, solid, wire) {
        const geometry        = fixture.geometry;
        const expectedIsValid = true;
        const expectedZero    = 0;

        for (const [wireframe, indices] of [[false, solid], [true, wire]]) {
            const expectedType = indices instanceof Uint32Array
                ? fixture.renderingContext.UNSIGNED_INT
                : fixture.renderingContext.UNSIGNED_SHORT;

            assert.equal(geometry.getIndexComponentType(wireframe), expectedType);

            indices.forEach((index) => {
                assert.equal(Number.isInteger(index), expectedIsValid);
                assert.equal(index >= expectedZero && index < scenario.expectedVertexCount, expectedIsValid);
            });
        }
    }

    static assertAttributes(fixture, scenario) {
        const expectedIsValid = true;
        const expectedZero    = 0;
        const expectedOne     = 1;

        // Attribute order identifies each buffer without relying on optional buffers being present
        const vertexUploads = fixture.uploads.filter((upload) => upload.target === fixture.renderingContext.ARRAY_BUFFER);

        fixture.attributes.forEach(([location, componentCount], index) => {
            const buffer = vertexUploads[index].data;
            assert.equal(buffer instanceof Float32Array, expectedIsValid);
            assert.equal(buffer.length, scenario.expectedVertexCount * componentCount);
            buffer.forEach((value) => assert.equal(Number.isFinite(value), expectedIsValid));

            if (location === GeneratedGeometryTestFixtures.NORMAL_ATTRIBUTE) {
                for (let offset = expectedZero; offset < buffer.length; offset += componentCount) {
                    const components = buffer.subarray(offset, offset + componentCount);
                    const length     = Math.hypot(...components);
                    const tolerance  = GeneratedGeometryTestFixtures.FLOAT_TOLERANCE;
                    assert.equal(Math.abs(length - expectedOne) < tolerance, expectedIsValid);
                }
            }
        });
    }

    static assertColors(fixture, scenario, args) {
        const vertexUploads      = fixture.uploads.filter((upload) => upload.target === fixture.renderingContext.ARRAY_BUFFER);
        const shapeOptions       = scenario.GeometryClass === HeightmapGeometry ? args[1] : args[0];
        const defaultColorShapes = [BoxGeometry, ConeGeometry, PlaneGeometry, PyramidGeometry, SphereGeometry, TorusGeometry];
        let expectedColor        = shapeOptions?.colors;

        if (!expectedColor && defaultColorShapes.includes(scenario.GeometryClass)) {
            expectedColor = new Float32Array([1.0, 1.0, 1.0]);
        } else if (!expectedColor && scenario.GeometryClass === HeightmapGeometry) {
            expectedColor = new Float32Array([0.18, 0.65, 0.28]);
        }

        // Uniform colors must retain their RGB order at every vertex
        const uniformColorLength = 3;

        if (expectedColor?.length === uniformColorLength) {
            const colorAttribute = fixture.attributes.findIndex(([location]) => location === GeneratedGeometryTestFixtures.COLOR_ATTRIBUTE);
            const colors         = vertexUploads[colorAttribute].data;

            colors.forEach((component, index) => {
                assert.equal(component, expectedColor[index % uniformColorLength]);
            });
        }
    }

    static assertBounds(geometry, scenario) {
        const expectedIsValid = true;
        const bounds = [
            [geometry.getBoundingBoxMin(), scenario.expectedMin],
            [geometry.getBoundingBoxMax(), scenario.expectedMax]
        ];

        bounds.forEach(([actual, expected]) => {
            actual.forEach((value, index) => {
                assert.equal(Math.abs(value - expected[index]) < GeneratedGeometryTestFixtures.FLOAT_TOLERANCE, expectedIsValid);
            });
        });
    }

}

// Apply the same public geometry contract to every generator and input variant
for (const scenario of GeneratedGeometryTestFixtures.createCases()) {
    test(`'${scenario.GeometryClass.name}' should preserve the geometry contract for ${scenario.name}`, () => {
        withFakeBrowserWebGLEnvironment((environment) => {
            // Arrange
            const expectedIsValid = true;
            const expectedError   = /Geometry has been disposed/;
            const args            = scenario.createArguments();

            // Act
            const fixture  = GeneratedGeometryTestFixtures.createFixture(environment, scenario.GeometryClass, args);
            const geometry = fixture.geometry;
            const solid    = fixture.uploads.at(GeneratedGeometryTestFixtures.SOLID_BUFFER_OFFSET).data;
            const wire     = fixture.uploads.at(GeneratedGeometryTestFixtures.WIREFRAME_BUFFER_OFFSET).data;

            // Assert
            assert.equal(geometry instanceof Geometry, expectedIsValid);
            assert.equal(geometry instanceof GeneratedGeometry, expectedIsValid);
            assert.equal(geometry.getIndexCount(false), scenario.expectedSolidCount);
            assert.equal(geometry.getIndexCount(true), scenario.expectedWireframeCount);
            assert.equal(geometry.getPrimitive(false), scenario.expectedSolidPrimitive);
            assert.equal(geometry.getPrimitive(true), scenario.expectedWireframePrimitive);
            assert.deepEqual(fixture.attributes.map(([location, size]) => [location, size]), scenario.expectedAttributes);

            GeneratedGeometryTestFixtures.assertIndices(fixture, scenario, solid, wire);
            GeneratedGeometryTestFixtures.assertAttributes(fixture, scenario);
            GeneratedGeometryTestFixtures.assertColors(fixture, scenario, args);
            GeneratedGeometryTestFixtures.assertBounds(geometry, scenario);

            // Repeated disposal must not delete the same GPU resources twice
            geometry.dispose();
            geometry.dispose();

            assert.deepEqual(fixture.deletedBuffers, fixture.createdBuffers);
            assert.deepEqual(fixture.deletedArrays, fixture.createdArrays);
            assert.throws(() => geometry.bind(), expectedError);
        });
    });
}

test("'GeneratedGeometry' should require a subclass generator", () => {
    // Arrange
    const expectedError = {
        name    : 'Error',
        message : 'GeneratedGeometry.createGeometryData must be implemented by a subclass.'
    };

    // Act & Assert
    assert.throws(() => new GeneratedGeometry(null), expectedError);
});

test("'GeneratedGeometry' should dispatch to a subclass static generator exactly once", () => {
    withFakeBrowserWebGLEnvironment((environment) => {
        // Arrange
        const expectedCalls = 1;
        const expectedSize  = 4;
        const expectedMin   = new Float32Array([-2, -2, -2]);
        let actualCalls     = 0;

        class DerivedBoxGeometry extends BoxGeometry {
            static createGeometryData(size) {
                actualCalls += 1;
                return super.createGeometryData(size);
            }
        }

        // Act
        const fixture = GeneratedGeometryTestFixtures.createFixture(environment, DerivedBoxGeometry, [expectedSize]);

        // Assert
        assert.equal(actualCalls, expectedCalls);
        assert.deepEqual(fixture.geometry.getBoundingBoxMin(), expectedMin);
        fixture.geometry.dispose();
    });
});

test("'HeightmapGeometry' should preserve its wireframe hint and bilinear center height", () => {
    withFakeBrowserWebGLEnvironment((environment) => {
        // Arrange
        const imageData           = GeneratedGeometryTestFixtures.createImageData();
        const options             = { segmentsX: 2, segmentsZ: 2, sampling: 'bilinear', flipY: false, isWireframe: true };
        const expectedIsWireframe = true;
        const centerHeightIndex   = 13;
        const expectedHeight      = Math.fround((0 + 64 + 128 + 255) / (4 * 255));

        // Act
        const fixture   = GeneratedGeometryTestFixtures.createFixture(environment, HeightmapGeometry, [imageData, options]);
        const positions = fixture.uploads.find((upload) => upload.target === fixture.renderingContext.ARRAY_BUFFER).data;

        // Assert
        assert.equal(fixture.geometry.isWireframe, expectedIsWireframe);
        assert.equal(positions[centerHeightIndex], expectedHeight);
        fixture.geometry.dispose();
    });
});

// Each constructor must retain its own minimum, even though normalization is shared
for (const scenario of [
    { GeometryClass: BoxGeometry       , optionName: 'widthSegments',  minimumCount: 1 },
    { GeometryClass: ConeGeometry      , optionName: 'radialSegments', minimumCount: 3 },
    { GeometryClass: PlaneGeometry     , optionName: 'widthSegments',  minimumCount: 1 },
    { GeometryClass: PyramidGeometry   , optionName: 'heightSegments', minimumCount: 1 },
    { GeometryClass: SphereGeometry    , optionName: 'heightSegments', minimumCount: 2 },
    { GeometryClass: TorusGeometry     , optionName: 'radialSegments', minimumCount: 3 },
    { GeometryClass: HeightmapGeometry , optionName: 'segmentsX',      minimumCount: 1 }
]) {
    test(`'${scenario.GeometryClass.name}' should retain its segment validation errors`, () => {
        withFakeBrowserWebGLEnvironment((environment) => {
            // Arrange
            const invalidCount = scenario.minimumCount - 1;
            const cases        = [
                {
                    value         : '1',
                    expectedError : {
                        name    : 'TypeError',
                        message : `${scenario.GeometryClass.name} expects ${scenario.optionName} as a finite number.`
                    }
                },

                {
                    value         : invalidCount,
                    expectedError : {
                        name    : 'RangeError',
                        message : `${scenario.GeometryClass.name} expects ${scenario.optionName} to be >= ${scenario.minimumCount}.`
                    }
                }
            ];

            // Act & Assert
            cases.forEach(({ value, expectedError }) => {
                const options = { [scenario.optionName]: value };
                const args    = scenario.GeometryClass === HeightmapGeometry
                    ? [GeneratedGeometryTestFixtures.createImageData(), options]
                    : [options];

                assert.throws(() => {
                    GeneratedGeometryTestFixtures.createFixture(environment, scenario.GeometryClass, args);
                }, expectedError);
            });
        });
    });
}

// Shared validation checks use constructor adapters for the heightmap's extra image argument
for (const GeometryClass of [
    BoxGeometry,
    ConeGeometry,
    PlaneGeometry,
    PyramidGeometry,
    SphereGeometry,
    TorusGeometry,
    CustomGeometry,
    PointsGeometry,
    PolylineGeometry,
    TubeLineGeometry,
    HeightmapGeometry
]) {
    test(`'${GeometryClass.name}' should reject invalid options and buffers`, () => {
        withFakeBrowserWebGLEnvironment((environment) => {
            // Arrange
            const invalidOptions = [null, 'options'];
            const cases          = invalidOptions.map((options) => ({ options, expectedError: TypeError }));
            const basicShapes    = [BoxGeometry, ConeGeometry, PlaneGeometry, PyramidGeometry, SphereGeometry, TorusGeometry];

            if (basicShapes.includes(GeometryClass)) {
                cases.push(
                    { options: { width: '1' }, expectedError: TypeError },
                    { options: { width: Infinity }, expectedError: RangeError },
                    { options: { colors: [] }, expectedError: TypeError }
                );
            } else if (GeometryClass === CustomGeometry) {
                const options = GeneratedGeometryTestFixtures.createCustomOptions();
                cases.push(
                    { options: { ...options, positions: [] }, expectedError: TypeError },
                    { options: { ...options, positions: new Float32Array([0, 1]) }, expectedError: RangeError },
                    { options: { ...options, indices: {} }, expectedError: TypeError },
                    { options: { ...options, wireframeIndices: {} }, expectedError: TypeError },
                    { options: { ...options, colors: [] }, expectedError: TypeError },
                    { options: { ...options, uvs: [] }, expectedError: TypeError },
                    { options: { ...options, normals: [] }, expectedError: TypeError }
                );
            } else if (GeometryClass === HeightmapGeometry) {
                cases.push(
                    { options: { width: 0 }, expectedError: RangeError },
                    { options: { heightScale: 0 }, expectedError: RangeError },
                    { options: { heightOffset: NaN }, expectedError: RangeError },
                    { options: { colors: [] }, expectedError: TypeError },
                    { options: { flipY: 'true' }, expectedError: TypeError },
                    { options: { isWireframe: 'true' }, expectedError: TypeError },
                    { options: { sampling: 1 }, expectedError: TypeError },
                    { options: { sampling: 'unknown' }, expectedError: RangeError }
                );
            } else {
                const positions = GeneratedGeometryTestFixtures.createPoints();
                cases.push(
                    { options: { positions: null }, expectedError: TypeError },
                    { options: { positions: [{}, {}] }, expectedError: TypeError }
                );

                if (GeometryClass !== PointsGeometry) {
                    cases.push({ options: { positions: [] }, expectedError: RangeError });
                }

                if (GeometryClass !== TubeLineGeometry) {
                    cases.push({ options: { positions, colors: [] }, expectedError: TypeError });
                }

                if (GeometryClass === PolylineGeometry) {
                    cases.push({ options: { positions, loop: 'true' }, expectedError: TypeError });
                }

                if (GeometryClass === TubeLineGeometry) {
                    cases.push(
                        { options: { positions, radius: 0 }, expectedError: RangeError },
                        { options: { positions, width: 0 }, expectedError: RangeError },
                        { options: { positions, radialSegments: 2 }, expectedError: RangeError },
                        { options: { positions, radialSegments: 3.5 }, expectedError: RangeError },
                        { options: { positions, closed: 'true' }, expectedError: TypeError },
                        { options: { positions, capType: 'unknown' }, expectedError: RangeError }
                    );
                }
            }

            // Act & Assert
            cases.forEach(({ options, expectedError }) => {
                const args = GeometryClass === HeightmapGeometry
                    ? [GeneratedGeometryTestFixtures.createImageData(), options]
                    : [options];

                assert.throws(() => {
                    GeneratedGeometryTestFixtures.createFixture(environment, GeometryClass, args);
                }, expectedError);
            });
        });
    });
}

test("'BoxGeometry' should repeat each face color for its own segmented vertices", () => {
    withFakeBrowserWebGLEnvironment((environment) => {
        // Arrange
        const options = {
            widthSegments  : 2,
            heightSegments : 3,
            depthSegments  : 4,
            colors         : new Float32Array([
                1, 0, 0,
                0, 1, 0,
                0, 0, 1,
                1, 1, 0,
                0, 1, 1,
                1, 0, 1
            ])
        };

        // Front/back: 3 * 4 vertices; top/bottom: 3 * 5; right/left: 5 * 4.
        const expectedFaceVertexCounts = [12, 12, 15, 15, 20, 20];
        const componentCount           = 3;
        let componentOffset            = 0;

        // Act
        const fixture        = GeneratedGeometryTestFixtures.createFixture(environment, BoxGeometry, [options]);
        const colorAttribute = fixture.attributes.findIndex(([location]) => location === GeneratedGeometryTestFixtures.COLOR_ATTRIBUTE);
        const vertexUploads  = fixture.uploads.filter((upload) => upload.target === fixture.renderingContext.ARRAY_BUFFER);
        const actualColors   = vertexUploads[colorAttribute].data;

        // Assert
        expectedFaceVertexCounts.forEach((vertexCount, faceIndex) => {
            const faceColorOffset = faceIndex * componentCount;
            const expectedColor   = options.colors.subarray(faceColorOffset, faceColorOffset + componentCount);

            for (let vertexIndex = 0; vertexIndex < vertexCount; vertexIndex += 1) {
                assert.deepEqual(actualColors.subarray(componentOffset, componentOffset + componentCount), expectedColor);
                componentOffset += componentCount;
            }
        });

        assert.equal(componentOffset, actualColors.length);
        fixture.geometry.dispose();
    });
});

test("'GeneratedGeometry' should forward every generator argument in order", () => {
    withFakeBrowserWebGLEnvironment((environment) => {
        // Arrange
        const expectedArguments = ['first', { value: 'second' }, 'third'];
        const expectedCalls     = 1;
        const actualArguments   = [];

        class ThreeArgumentGeometry extends BoxGeometry {
            static createGeometryData(first, second, third) {
                actualArguments.push([first, second, third]);
                return super.createGeometryData();
            }
        }

        // Act
        const fixture = GeneratedGeometryTestFixtures.createFixture(environment, ThreeArgumentGeometry, expectedArguments);

        // Assert
        assert.equal(actualArguments.length, expectedCalls);
        assert.deepEqual(actualArguments, [expectedArguments]);
        fixture.geometry.dispose();
    });
});

for (const GeometryClass of [ConeGeometry, SphereGeometry, PyramidGeometry]) {
    test(`'${GeometryClass.name}' should preserve finite buffers for zero dimensions`, () => {
        withFakeBrowserWebGLEnvironment((environment) => {
            // Arrange
            const options          = { width: 0, height: 0, depth: 0 };
            const expectedIsFinite = true;
            const expectedBounds   = new Float32Array([0, 0, 0]);

            // Act
            const fixture = GeneratedGeometryTestFixtures.createFixture(environment, GeometryClass, [options]);

            // Assert
            fixture.uploads.forEach(({ data }) => {
                data.forEach((value) => assert.equal(Number.isFinite(value), expectedIsFinite));
            });

            // Signed zero is equivalent for degenerate bounds
            fixture.geometry.getBoundingBoxMin().forEach((value, index) => assert.equal(Math.abs(value), expectedBounds[index]));
            fixture.geometry.getBoundingBoxMax().forEach((value, index) => assert.equal(Math.abs(value), expectedBounds[index]));
            fixture.geometry.dispose();
        });
    });
}

test("'PyramidGeometry' should orient side normals outward, when its width is negative", () => {
    // Arrange
    const options        = { width: -2, height: 2, depth: 2, capped: false };
    const expectedFrontZ = 2 / Math.sqrt(5);
    const normalZIndex   = 2;
    const tolerance      = GeneratedGeometryTestFixtures.FLOAT_TOLERANCE;

    // Act
    const actualData = PyramidGeometry.createGeometryData(options);

    // Assert
    assert.equal(Math.abs(actualData.normals[normalZIndex] - expectedFrontZ) < tolerance, true);
});

test("'CustomGeometry' should preserve supplied ordinary wireframe indices", () => {
    // Arrange
    const expectedIndices    = new Uint16Array([2, 0, 1, 2]);
    const options            = GeneratedGeometryTestFixtures.createCustomOptions();
    options.wireframeIndices = [2, 0, 1, 2];

    // Act
    const actualData = CustomGeometry.createGeometryData(options);

    // Assert
    assert.deepEqual(actualData.indicesWireframe, expectedIndices);
});

test("'TubeLineGeometry' should retain its fallback frame for a direction whose length overflows", () => {
    // Arrange
    const largeCoordinate = 1e200;
    const options         = { positions: [new Vector3(0, 0, 0), new Vector3(largeCoordinate, 0, 0)] };
    const expectedOrigin  = 0;
    const expectedRadius  = Math.fround(0.05);

    // Act
    const actualData = TubeLineGeometry.createGeometryData(options);

    // Assert
    assert.equal(actualData.positions[0], expectedRadius);
    assert.equal(actualData.positions[1], expectedOrigin);
    assert.equal(actualData.positions[2], expectedOrigin);
    assert.equal(actualData.positions.some(Number.isNaN), false);
});

test("'PlaneGeometry' should retain 32-bit indices, when its grid exceeds the 16-bit vertex range", () => {
    // Arrange
    const segmentCount      = 256;
    const options           = { widthSegments: segmentCount, heightSegments: segmentCount };
    const expectedLastIndex = 66048;
    const expectedIndexType = Uint32Array;

    // Act
    const actualData = PlaneGeometry.createGeometryData(options);

    // Assert
    assert.equal(actualData.indicesSolid instanceof expectedIndexType, true);
    assert.equal(actualData.indicesWireframe instanceof expectedIndexType, true);
    assert.equal(actualData.indicesSolid.at(-1), expectedLastIndex);
});

test("'ConeGeometry' should preserve the apex, cap center and cap triangle order", () => {
    // Arrange
    const options            = { width: 2, height: 2, radialSegments: 4, heightSegments: 1 };
    const apexPositionOffset = 15;
    const capPositionOffset  = 18;
    const apexUvOffset       = 10;
    const capUvOffset        = 12;
    const positionLength     = 3;
    const uvLength           = 2;
    const capIndexCount      = 12;
    const expectedApex       = new Float32Array([0, 1, 0]);
    const expectedCapCenter  = new Float32Array([0, -1, 0]);
    const expectedApexUv     = new Float32Array([0.5, 0]);
    const expectedCapUv      = new Float32Array([0.5, 0.5]);
    const expectedCapIndices = new Uint16Array([6, 8, 7, 6, 9, 8, 6, 10, 9, 6, 11, 10]);

    // Act
    const actualData = ConeGeometry.createGeometryData(options);

    // Assert
    assert.deepEqual(actualData.positions.subarray(apexPositionOffset, apexPositionOffset + positionLength), expectedApex);
    assert.deepEqual(actualData.normals.subarray(apexPositionOffset, apexPositionOffset + positionLength), expectedApex);
    assert.deepEqual(actualData.positions.subarray(capPositionOffset, capPositionOffset + positionLength), expectedCapCenter);
    assert.deepEqual(actualData.normals.subarray(capPositionOffset, capPositionOffset + positionLength), expectedCapCenter);
    assert.deepEqual(actualData.uvs.subarray(apexUvOffset, apexUvOffset + uvLength), expectedApexUv);
    assert.deepEqual(actualData.uvs.subarray(capUvOffset, capUvOffset + uvLength), expectedCapUv);
    assert.deepEqual(actualData.indicesSolid.subarray(-capIndexCount), expectedCapIndices);
});

test("'SphereGeometry' should account for unequal radii when computing vertex normals", () => {
    // Arrange
    const options        = { width: 4, height: 2, depth: 6, widthSegments: 4, heightSegments: 4 };
    const normalOffset   = 15;
    const expectedNormal = [1 / Math.sqrt(5), 2 / Math.sqrt(5), 0];
    const tolerance      = GeneratedGeometryTestFixtures.FLOAT_TOLERANCE;
    const expectedMatch  = true;

    // Act
    const actualData = SphereGeometry.createGeometryData(options);

    // Assert
    expectedNormal.forEach((expected, componentIndex) => {
        const actual = actualData.normals[normalOffset + componentIndex];
        assert.equal(Math.abs(actual - expected) < tolerance, expectedMatch);
    });
});

for (const [GeometryClass, dimensions] of [
    [BoxGeometry,     ['width', 'height', 'depth']],
    [ConeGeometry,    ['width', 'height', 'depth']],
    [PlaneGeometry,   ['width', 'height']],
    [PyramidGeometry, ['width', 'height', 'depth']],
    [SphereGeometry,  ['width', 'height', 'depth']],
    [TorusGeometry,   ['width', 'height']]
]) {
    test(`'${GeometryClass.name}' should validate every dimension independently`, () => {
        // Arrange
        const invalidValues = [
            { value: '1',                      expectedError: TypeError  },
            { value: Number.NaN,               expectedError: RangeError },
            { value: Number.POSITIVE_INFINITY, expectedError: RangeError },
            { value: Number.NEGATIVE_INFINITY, expectedError: RangeError }
        ];

        // Act & Assert
        dimensions.forEach((dimension) => {
            invalidValues.forEach(({ value, expectedError }) => {
                const options = { [dimension]: value };
                assert.throws(() => GeometryClass.createGeometryData(options), expectedError);
            });
        });
    });
}

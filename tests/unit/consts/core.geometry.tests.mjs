import test                         from 'node:test';
import assert                       from 'node:assert/strict';
import * as GeometryConstants       from '../../../core/constants/geometry.js';
import * as BoxGeometryConstants    from '../../../core/constants/box-geometry.js';
import * as ConeGeometryConstants   from '../../../core/constants/cone-geometry.js';
import * as HeightmapConstants      from '../../../core/constants/heightmap-geometry.js';
import * as PlaneGeometryConstants  from '../../../core/constants/plane-geometry.js';
import * as PointsGeometryConstants from '../../../core/constants/points-geometry.js';
import * as PolylineConstants       from '../../../core/constants/polyline-geometry.js';
import * as PyramidConstants        from '../../../core/constants/pyramid-geometry.js';
import * as SphereConstants         from '../../../core/constants/sphere-geometry.js';
import * as TorusConstants          from '../../../core/constants/torus-geometry.js';
import * as TubeLineConstants       from '../../../core/constants/tube-line-geometry.js';

test("'Geometry' shared layout and coordinate constants should preserve buffer formats", () => {
    // Arrange
    const expectedLayout = {
        POSITION_COMPONENT_COUNT : 3,
        NORMAL_COMPONENT_COUNT   : 3,
        COLOR_COMPONENT_COUNT    : 3,
        UV_COMPONENT_COUNT       : 2,
        TRIANGLE_INDEX_COUNT     : 3,
        LINE_INDEX_COUNT         : 2
    };

    const expectedColorIndexes    = { RED: 0, GREEN: 1, BLUE: 2 };
    const expectedUvIndexes       = { U: 0, V: 1 };
    const expectedTriangleIndexes = { FIRST: 0, SECOND: 1, THIRD: 2 };

    // Act & Assert
    assert.deepEqual(GeometryConstants.GEOMETRY_LAYOUT, expectedLayout);
    assert.deepEqual(GeometryConstants.GEOMETRY_COLOR_INDEXES, expectedColorIndexes);
    assert.deepEqual(GeometryConstants.GEOMETRY_UV_INDEXES, expectedUvIndexes);
    assert.deepEqual(GeometryConstants.GEOMETRY_TRIANGLE_INDEXES, expectedTriangleIndexes);
});

test("'Geometry' primitive names should remain available through the original module", async () => {
    // Arrange
    const expectedNames = {
        PRIMITIVE_TRIANGLES  : 'triangles',
        PRIMITIVE_LINES      : 'lines',
        PRIMITIVE_LINE_STRIP : 'line_strip',
        PRIMITIVE_LINE_LOOP  : 'line_loop',
        PRIMITIVE_POINTS     : 'points'
    };

    const expectedSupported = new Set(Object.values(expectedNames));

    // Act
    const actualExports = await import('../../../core/geometry/geometry.js');

    // Assert
    Object.entries(expectedNames).forEach(([name, expected]) => {
        assert.equal(GeometryConstants[name], expected);
        assert.equal(actualExports[name], expected);
    });

    assert.deepEqual(GeometryConstants.SUPPORTED_PRIMITIVES, expectedSupported);
});

test("'Geometry' constant groups and direction arrays should be frozen", () => {
    // Arrange
    const expectedIsFrozen = true;
    const constantModules  = [
        GeometryConstants,
        BoxGeometryConstants,
        ConeGeometryConstants,
        HeightmapConstants,
        PlaneGeometryConstants,
        PointsGeometryConstants,
        PolylineConstants,
        PyramidConstants,
        SphereConstants,
        TorusConstants,
        TubeLineConstants
    ];

    // Act & Assert
    constantModules.forEach((constants) => {
        Object.values(constants).forEach((value) => {
            if (value !== null && typeof value === 'object' && !ArrayBuffer.isView(value) && !(value instanceof Set)) {
                assert.equal(Object.isFrozen(value), expectedIsFrozen);
            }
        });
    });

    Object.values(GeometryConstants.GEOMETRY_DIRECTIONS).forEach((direction) => {
        assert.equal(Object.isFrozen(direction), expectedIsFrozen);
    });

    BoxGeometryConstants.BOX_FACES.forEach((face) => {
        assert.equal(Object.isFrozen(face), expectedIsFrozen);
    });

    Object.values(PyramidConstants.PYRAMID_DIRECTIONS).forEach((direction) => {
        assert.equal(Object.isFrozen(direction), expectedIsFrozen);
    });
});

test("'Geometry' shared default color should remain a white 'Float32Array'", () => {
    // Arrange
    const expectedColor = new Float32Array([1.0, 1.0, 1.0]);

    // Act
    const actualColor = GeometryConstants.DEFAULT_VERTEX_COLOR;

    // Assert
    assert.deepEqual(actualColor, expectedColor);
});

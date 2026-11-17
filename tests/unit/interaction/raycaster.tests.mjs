import test                 from 'node:test';
import assert               from 'node:assert/strict';
import { RAYCASTER_ERRORS } from '../../../core/constants/raycaster.js';
import { Raycaster }        from '../../../core/interaction/raycaster.js';
import { Matrix4 }          from '../../../core/math/matrix4.js';
import { Scene }            from '../../../core/scene/scene.js';
import { Camera }           from '../../../core/scene/camera.js';
import { Mesh }             from '../../../core/scene/mesh.js';
import { Object3D }         from '../../../core/scene/object3d.js';
import { Geometry }         from '../../../core/geometry/geometry.js';
import { Material }         from '../../../core/material/material.js';

class RaycasterTestFixtures {
    static LARGE_COORDINATE           = 1e17;
    static EPSILON                    = 1e-5;
    static EXPECTED_NEAR_DISTANCE     = 3;
    static EMPTY_COLLECTION_LENGTH    = 0;
    static EXPECTED_SINGLE_HIT        = 1;
    static EXPECTED_DOUBLE_HIT        = 2;
    static EXPECTED_ORIGIN_DISTANCE   = 0;
    static FIRST_HIT_INDEX            = 0;
    static INVALID_COORDINATE         = Number.NaN;
    static RIGHT_ANGLE                = Math.PI / 2;
    static SLAB_SEPARATION_ANGLE      = this.RIGHT_ANGLE / 4;
    static UNDEFINED_VALUE            = undefined;
    static INVALID_SCENE_CAMERA_ARGS  = Object.freeze([null, undefined, {}, []]);
    static INVALID_MOUSE_NDC          = Object.freeze([null, undefined, false, 'mouse', [], {}, { x: '0', y: 0 }, { x: 0, y: null }]);
    static INVALID_OPTIONS            = Object.freeze([null, false, 'options', [], 1, new Date(), new Map()]);
    static INVALID_OPTION_TYPES       = Object.freeze([undefined, null, 'true', 1, {}, []]);
    static ENCLOSING_BOUNDS_MIN       = Object.freeze([-2, -2, -2]);
    static ENCLOSING_BOUNDS_MAX       = Object.freeze([2, 2, 2]);
    static ENCLOSING_BOUNDS           = Object.freeze({ min: this.ENCLOSING_BOUNDS_MIN, max: this.ENCLOSING_BOUNDS_MAX });
    static BOX_CENTER_ENCLOSING       = Object.freeze([0, 0, 0.5]);
    static BOX_CENTER_BEHIND          = Object.freeze([0, 0, -5]);
    static BOX_CENTER_POSITIVE_X      = Object.freeze([4, 0, 0]);
    static BOX_CENTER_NEGATIVE_X      = Object.freeze([-4, 0, 0]);
    static BOX_CENTER_POSITIVE_Y      = Object.freeze([0, 4, 0]);
    static BOX_CENTER_NEGATIVE_Y      = Object.freeze([0, -4, 0]);
    static BOX_CENTER_POSITIVE_Z      = Object.freeze([0, 0, 4]);
    static BOX_CENTER_NEGATIVE_Z      = Object.freeze([0, 0, -4]);
    static BOX_CENTER_OFF_AXIS_XZ     = Object.freeze([4, 0, 4]);
    static BOX_CENTER_OFF_AXIS_YZ     = Object.freeze([0, 4, 4]);
    static DEGENERATE_RAY_TRANSLATION = Object.freeze([0, 0, this.LARGE_COORDINATE]);
    static ORIGIN_NDC                 = Object.freeze({ x: 0, y: 0 });
    static BOUNDS_MIN                 = Object.freeze([-1, -1, -1]);
    static BOUNDS_MAX                 = Object.freeze([1, 1, 1]);
    static BOX_CENTER_NEAR            = Object.freeze([0, 0, 3]);
    static BOX_CENTER_FAR             = Object.freeze([0, 0, 6]);
    static BOX_CENTER_OUTSIDE_RAY     = Object.freeze([5, 0, 3]);
    static POINT_NEAR                 = Object.freeze({ x: 0, y: 0, z: 2 });
    static RAY_ORIGIN_POINT           = Object.freeze({ x: 0, y: 0, z: -1 });
    static NAN_MOUSE_NDC              = Object.freeze({ x: this.INVALID_COORDINATE, y: this.ORIGIN_NDC.y });
    static NON_FINITE_MOUSE_NDC       = Object.freeze([
        this.NAN_MOUSE_NDC,
        { x: Number.POSITIVE_INFINITY, y: this.ORIGIN_NDC.y },
        { x: Number.NEGATIVE_INFINITY, y: this.ORIGIN_NDC.y },
        { x: this.ORIGIN_NDC.x, y: Number.NaN },
        { x: this.ORIGIN_NDC.x, y: Number.POSITIVE_INFINITY },
        { x: this.ORIGIN_NDC.x, y: Number.NEGATIVE_INFINITY }
    ]);

    static createCamera(worldMatrix = Matrix4.createIdentity(), projection = Matrix4.createIdentity()) {
        const camera               = new Camera();
        const viewMatrix           = Matrix4.invert(worldMatrix);
        camera.getProjectionMatrix = () => projection;
        camera.getViewMatrix       = () => viewMatrix;
        return camera;
    }

    static createMesh(position = this.BOX_CENTER_NEAR, options = {}) {
        const boundingMin          = new Float32Array(options.min || this.BOUNDS_MIN);
        const boundingMax          = new Float32Array(options.max || this.BOUNDS_MAX);
        const material             = Object.create(Material.prototype);
        const geometry             = Object.create(Geometry.prototype);
        geometry.getBoundingBoxMin = () => boundingMin;
        geometry.getBoundingBoxMax = () => boundingMax;

        const mesh = new Mesh(geometry, material, { ownsGeometry: false, ownsMaterial: false });
        mesh.position.set(...position);

        if (options.disposed === true) {
            mesh.dispose();
        }

        return mesh;
    }

    static createScene(children = [], descendants = []) {
        const scene = new Scene();
        children.forEach((child) => scene.add(child));

        if (descendants.length > this.EMPTY_COLLECTION_LENGTH) {
            const parent = new Object3D();
            descendants.forEach((child) => parent.add(child));
            scene.add(parent);
        }

        return scene;
    }

    static assertPointApproximatelyEquals(actual, expected) {
        Object.keys(expected).forEach((key) => {
            assert.ok(
                Math.abs(actual[key] - expected[key]) <= this.EPSILON,
                `${key}: ${actual[key]}, expected ${expected[key]}`
            );
        });
    }

    static assertThrowsForOption(name, value, expectedMessage) {
        // Arrange
        const scene     = this.createScene();
        const camera    = this.createCamera();
        const raycaster = new Raycaster();

        // Act & Assert
        assert.throws(() => raycaster.raycast(scene, camera, this.ORIGIN_NDC, { [name]: value }), {
            name    : 'TypeError',
            message : expectedMessage
        });
    }
}

test("'Raycaster.raycast' should reject invalid scene and camera arguments", () => {
    // Arrange
    const invalidArgs = RaycasterTestFixtures.INVALID_SCENE_CAMERA_ARGS;
    const scene       = RaycasterTestFixtures.createScene();
    const camera      = RaycasterTestFixtures.createCamera();
    const raycaster   = new Raycaster();

    // Act & Assert
    invalidArgs.forEach((value) => {
        assert.throws(() => raycaster.raycast(value, camera, RaycasterTestFixtures.ORIGIN_NDC), {
            name    : 'TypeError',
            message : RAYCASTER_ERRORS.SCENE_TYPE
        });

        assert.throws(() => raycaster.raycast(scene, value, RaycasterTestFixtures.ORIGIN_NDC), {
            name    : 'TypeError',
            message : RAYCASTER_ERRORS.CAMERA_TYPE
        });
    });
});

test("'Raycaster.raycast' should reject invalid normalized mouse coordinates", () => {
    // Arrange
    const scene     = RaycasterTestFixtures.createScene();
    const camera    = RaycasterTestFixtures.createCamera();
    const raycaster = new Raycaster();

    // Act & Assert
    RaycasterTestFixtures.INVALID_MOUSE_NDC.forEach((mouseNdc) => {
        assert.throws(() => raycaster.raycast(scene, camera, mouseNdc), {
            name    : 'TypeError',
            message : RAYCASTER_ERRORS.MOUSE_NDC_TYPE
        });
    });
});

test("'Raycaster.raycast' should reject invalid options containers", () => {
    // Arrange
    const scene     = RaycasterTestFixtures.createScene();
    const camera    = RaycasterTestFixtures.createCamera();
    const raycaster = new Raycaster();

    // Act & Assert
    RaycasterTestFixtures.INVALID_OPTIONS.forEach((options) => {
        assert.throws(() => raycaster.raycast(scene, camera, RaycasterTestFixtures.ORIGIN_NDC, options), {
            name    : 'TypeError',
            message : RAYCASTER_ERRORS.OPTIONS_TYPE
        });
    });
});

test("'Raycaster.raycast' should validate each explicit option without coercion", () => {
    // Arrange
    const invalidValues = RaycasterTestFixtures.INVALID_OPTION_TYPES;
    const optionErrors  = [
        { name: 'recursive', expectedMessage: RAYCASTER_ERRORS.RECURSIVE_TYPE },
        { name: 'sort'     , expectedMessage: RAYCASTER_ERRORS.SORT_TYPE }
    ];

    // Act & Assert
    for (const { name, expectedMessage } of optionErrors) {
        invalidValues.forEach((value) => RaycasterTestFixtures.assertThrowsForOption(name, value, expectedMessage));
    }

    invalidValues.filter((value) => value !== null).forEach((value) => {
        RaycasterTestFixtures.assertThrowsForOption('filter', value, RAYCASTER_ERRORS.FILTER_TYPE);
    });
});

test("'Raycaster.raycast' should return an empty result for an empty scene", () => {
    // Arrange
    const scene     = RaycasterTestFixtures.createScene();
    const camera    = RaycasterTestFixtures.createCamera();
    const raycaster = new Raycaster();

    // Act
    const intersections = raycaster.raycast(scene, camera, RaycasterTestFixtures.ORIGIN_NDC);

    // Assert
    assert.equal(intersections.length, RaycasterTestFixtures.EMPTY_COLLECTION_LENGTH);
});

test("'Raycaster.raycast' should preserve explicit undefined options", () => {
    // Arrange
    const mesh      = RaycasterTestFixtures.createMesh();
    const scene     = RaycasterTestFixtures.createScene([mesh]);
    const camera    = RaycasterTestFixtures.createCamera();
    const raycaster = new Raycaster();

    // Act
    const defaultIntersections   = raycaster.raycast(scene, camera, RaycasterTestFixtures.ORIGIN_NDC);
    const undefinedIntersections = raycaster.raycast(scene, camera, RaycasterTestFixtures.ORIGIN_NDC, RaycasterTestFixtures.UNDEFINED_VALUE);

    // Assert
    assert.equal(undefinedIntersections.length, RaycasterTestFixtures.EXPECTED_SINGLE_HIT);
    assert.deepEqual(undefinedIntersections, defaultIntersections);
});

test("'Raycaster.raycast' should return no intersections for non-finite coordinates", () => {
    // Arrange
    const mesh      = RaycasterTestFixtures.createMesh();
    const scene     = RaycasterTestFixtures.createScene([mesh]);
    const camera    = RaycasterTestFixtures.createCamera();
    const raycaster = new Raycaster();

    // Act & Assert
    RaycasterTestFixtures.NON_FINITE_MOUSE_NDC.forEach((mouseNdc) => {
        const intersections = raycaster.raycast(scene, camera, mouseNdc);
        assert.deepEqual(intersections, []);
    });
});

test("'Raycaster.raycast' should return the nearest face of a translated bounding box", () => {
    // Arrange
    const expectedPoint    = RaycasterTestFixtures.POINT_NEAR;
    const expectedDistance = RaycasterTestFixtures.EXPECTED_NEAR_DISTANCE;
    const mesh             = RaycasterTestFixtures.createMesh();
    const scene            = RaycasterTestFixtures.createScene([mesh]);
    const camera           = RaycasterTestFixtures.createCamera();
    const raycaster        = new Raycaster();

    // Act
    const intersections = raycaster.raycast(scene, camera, RaycasterTestFixtures.ORIGIN_NDC);

    // Assert
    assert.equal(intersections.length, RaycasterTestFixtures.EXPECTED_SINGLE_HIT);
    assert.equal(intersections[RaycasterTestFixtures.FIRST_HIT_INDEX].object, mesh);
    RaycasterTestFixtures.assertPointApproximatelyEquals(intersections[RaycasterTestFixtures.FIRST_HIT_INDEX].point, expectedPoint);
    assert.ok(Math.abs(intersections[RaycasterTestFixtures.FIRST_HIT_INDEX].distance - expectedDistance) <= RaycasterTestFixtures.EPSILON);
});

test("'Raycaster.raycast' should sort intersections from near to far by default", () => {
    // Arrange
    const farMesh   = RaycasterTestFixtures.createMesh(RaycasterTestFixtures.BOX_CENTER_FAR);
    const nearMesh  = RaycasterTestFixtures.createMesh(RaycasterTestFixtures.BOX_CENTER_NEAR);
    const scene     = RaycasterTestFixtures.createScene([farMesh, nearMesh]);
    const camera    = RaycasterTestFixtures.createCamera();
    const raycaster = new Raycaster();

    // Act
    const intersections = raycaster.raycast(scene, camera, RaycasterTestFixtures.ORIGIN_NDC);

    // Assert
    assert.equal(intersections.length, RaycasterTestFixtures.EXPECTED_DOUBLE_HIT);
    assert.deepEqual(intersections.map((hit) => hit.object), [nearMesh, farMesh]);
});

test("'Raycaster.raycast' should preserve traversal order when sorting is disabled", () => {
    // Arrange
    const farMesh   = RaycasterTestFixtures.createMesh(RaycasterTestFixtures.BOX_CENTER_FAR);
    const nearMesh  = RaycasterTestFixtures.createMesh(RaycasterTestFixtures.BOX_CENTER_NEAR);
    const scene     = RaycasterTestFixtures.createScene([farMesh, nearMesh]);
    const camera    = RaycasterTestFixtures.createCamera();
    const raycaster = new Raycaster();

    // Act
    const intersections = raycaster.raycast(scene, camera, RaycasterTestFixtures.ORIGIN_NDC, { sort: false });

    // Assert
    assert.deepEqual(intersections.map((hit) => hit.object), [farMesh, nearMesh]);
});

test("'Raycaster.raycast' should include direct children without recursive traversal", () => {
    // Arrange
    const mesh      = RaycasterTestFixtures.createMesh();
    const scene     = RaycasterTestFixtures.createScene([mesh]);
    const camera    = RaycasterTestFixtures.createCamera();
    const raycaster = new Raycaster();

    // Act
    const intersections = raycaster.raycast(scene, camera, RaycasterTestFixtures.ORIGIN_NDC, { recursive: false });

    // Assert
    assert.deepEqual(intersections.map((hit) => hit.object), [mesh]);
});

test("'Raycaster.raycast' should traverse descendants only when recursive is enabled", () => {
    // Arrange
    const mesh      = RaycasterTestFixtures.createMesh();
    const scene     = RaycasterTestFixtures.createScene([], [mesh]);
    const camera    = RaycasterTestFixtures.createCamera();
    const raycaster = new Raycaster();

    // Act
    const recursiveHits  = raycaster.raycast(scene, camera, RaycasterTestFixtures.ORIGIN_NDC, { recursive: true });
    const directOnlyHits = raycaster.raycast(scene, camera, RaycasterTestFixtures.ORIGIN_NDC, { recursive: false });

    // Assert
    assert.deepEqual(recursiveHits.map((hit) => hit.object), [mesh]);
    assert.deepEqual(directOnlyHits, []);
});

test("'Raycaster.raycast' should exclude disposed meshes and non-mesh scene nodes", () => {
    // Arrange
    const disposed  = RaycasterTestFixtures.createMesh(RaycasterTestFixtures.BOX_CENTER_NEAR, { disposed: true });
    const valid     = RaycasterTestFixtures.createMesh();
    const scene     = RaycasterTestFixtures.createScene([new Object3D(), disposed, valid]);
    const camera    = RaycasterTestFixtures.createCamera();
    const raycaster = new Raycaster();

    // Act
    const intersections = raycaster.raycast(scene, camera, RaycasterTestFixtures.ORIGIN_NDC);

    // Assert
    assert.deepEqual(intersections.map((hit) => hit.object), [valid]);
});

test("'Raycaster.raycast' should exclude meshes explicitly rejected by the filter", () => {
    // Arrange
    const raycaster = new Raycaster();
    const rejected  = RaycasterTestFixtures.createMesh(RaycasterTestFixtures.BOX_CENTER_FAR);
    const accepted  = RaycasterTestFixtures.createMesh();
    const scene     = RaycasterTestFixtures.createScene([rejected, accepted]);
    const camera    = RaycasterTestFixtures.createCamera();
    const seen      = [];
    const filter    = (mesh) => {
        seen.push(mesh);
        return mesh !== rejected;
    };

    // Act
    const intersections = raycaster.raycast(scene, camera, RaycasterTestFixtures.ORIGIN_NDC, { filter });

    // Assert
    assert.deepEqual(seen, [rejected, accepted]);
    assert.deepEqual(intersections.map((hit) => hit.object), [accepted]);
});

test("'Raycaster.raycast' should accept filter results other than explicit false", () => {
    // Arrange
    const raycaster = new Raycaster();
    const mesh      = RaycasterTestFixtures.createMesh();
    const scene     = RaycasterTestFixtures.createScene([mesh]);
    const camera    = RaycasterTestFixtures.createCamera();

    // Act
    const intersections = raycaster.raycast(
        scene,
        camera,
        RaycasterTestFixtures.ORIGIN_NDC,
        { filter: () => RaycasterTestFixtures.UNDEFINED_VALUE }
    );

    // Assert
    assert.deepEqual(intersections.map((hit) => hit.object), [mesh]);
});

test("'Raycaster.raycast' should miss a translated bounding box outside a parallel ray", () => {
    // Arrange
    const raycaster = new Raycaster();
    const mesh      = RaycasterTestFixtures.createMesh(RaycasterTestFixtures.BOX_CENTER_OUTSIDE_RAY);
    const scene     = RaycasterTestFixtures.createScene([mesh]);
    const camera    = RaycasterTestFixtures.createCamera();

    // Act
    const intersections = raycaster.raycast(scene, camera, RaycasterTestFixtures.ORIGIN_NDC);

    // Assert
    assert.deepEqual(intersections, []);
});

test("'Raycaster.raycast' should miss a bounding box behind the ray origin", () => {
    // Arrange
    const raycaster = new Raycaster();
    const mesh      = RaycasterTestFixtures.createMesh(RaycasterTestFixtures.BOX_CENTER_BEHIND);
    const scene     = RaycasterTestFixtures.createScene([mesh]);
    const camera    = RaycasterTestFixtures.createCamera();

    // Act
    const intersections = raycaster.raycast(scene, camera, RaycasterTestFixtures.ORIGIN_NDC);

    // Assert
    assert.deepEqual(intersections, []);
});

test("'Raycaster.raycast' should return the origin when the ray begins inside the bounds", () => {
    // Arrange
    const expectedPoint = RaycasterTestFixtures.RAY_ORIGIN_POINT;
    const mesh          = RaycasterTestFixtures.createMesh(
        RaycasterTestFixtures.BOX_CENTER_ENCLOSING,
        RaycasterTestFixtures.ENCLOSING_BOUNDS
    );

    const scene     = RaycasterTestFixtures.createScene([mesh]);
    const camera    = RaycasterTestFixtures.createCamera();
    const raycaster = new Raycaster();

    // Act
    const intersections = raycaster.raycast(scene, camera, RaycasterTestFixtures.ORIGIN_NDC);

    // Assert
    assert.equal(intersections.length, RaycasterTestFixtures.EXPECTED_SINGLE_HIT);
    RaycasterTestFixtures.assertPointApproximatelyEquals(intersections[RaycasterTestFixtures.FIRST_HIT_INDEX].point, expectedPoint);
    assert.equal(intersections[RaycasterTestFixtures.FIRST_HIT_INDEX].distance, RaycasterTestFixtures.EXPECTED_ORIGIN_DISTANCE);
});

test("'Raycaster.raycast' should reject a zero homogeneous W component", () => {
    // Arrange
    const swapXWithW = new Float32Array([
        0, 0, 0, 1,
        0, 1, 0, 0,
        0, 0, 1, 0,
        1, 0, 0, 0
    ]);

    const scene     = RaycasterTestFixtures.createScene();
    const camera    = RaycasterTestFixtures.createCamera(Matrix4.createIdentity(), swapXWithW);
    const raycaster = new Raycaster();

    // Act & Assert
    assert.throws(() => raycaster.raycast(scene, camera, RaycasterTestFixtures.ORIGIN_NDC), {
        name    : 'Error',
        message : RAYCASTER_ERRORS.UNPROJECT_W_ZERO
    });
});

test("'Raycaster.raycast' should handle a degenerate ray direction without throwing", () => {
    // Arrange
    const raycaster = new Raycaster();
    const mesh      = RaycasterTestFixtures.createMesh(RaycasterTestFixtures.DEGENERATE_RAY_TRANSLATION);
    const scene     = RaycasterTestFixtures.createScene([mesh]);
    const camera    = RaycasterTestFixtures.createCamera(Matrix4.createTranslation(...RaycasterTestFixtures.DEGENERATE_RAY_TRANSLATION));

    // Act
    const intersections = raycaster.raycast(scene, camera, RaycasterTestFixtures.ORIGIN_NDC);

    // Assert
    assert.deepEqual(intersections, []);
});

test("'Raycaster.raycast' should intersect a ray with a negative axis direction", () => {
    // Arrange
    const raycaster = new Raycaster();
    const rotation  = Matrix4.createRotationY(-RaycasterTestFixtures.RIGHT_ANGLE);
    const camera    = RaycasterTestFixtures.createCamera(rotation);
    const mesh      = RaycasterTestFixtures.createMesh(RaycasterTestFixtures.BOX_CENTER_NEGATIVE_X);
    const scene     = RaycasterTestFixtures.createScene([mesh]);

    // Act
    const intersections = raycaster.raycast(scene, camera, RaycasterTestFixtures.ORIGIN_NDC);

    // Assert
    assert.equal(intersections.length, RaycasterTestFixtures.EXPECTED_SINGLE_HIT);
    assert.equal(intersections[RaycasterTestFixtures.FIRST_HIT_INDEX].object, mesh);
});

test("'Raycaster.raycast' should test each spatial axis independently", () => {
    // Arrange
    const raycaster = new Raycaster();
    const cases     = [
        { world: Matrix4.createRotationY(RaycasterTestFixtures.RIGHT_ANGLE),  position: RaycasterTestFixtures.BOX_CENTER_POSITIVE_X },
        { world: Matrix4.createRotationY(-RaycasterTestFixtures.RIGHT_ANGLE), position: RaycasterTestFixtures.BOX_CENTER_NEGATIVE_X },
        { world: Matrix4.createRotationX(RaycasterTestFixtures.RIGHT_ANGLE),  position: RaycasterTestFixtures.BOX_CENTER_NEGATIVE_Y },
        { world: Matrix4.createRotationX(-RaycasterTestFixtures.RIGHT_ANGLE), position: RaycasterTestFixtures.BOX_CENTER_POSITIVE_Y },
        { world: Matrix4.createIdentity(), position: RaycasterTestFixtures.BOX_CENTER_POSITIVE_Z }
    ];

    // Act
    const results = cases.map(({ world, position }) => {
        const camera = RaycasterTestFixtures.createCamera(world);
        const mesh   = RaycasterTestFixtures.createMesh(position);
        const scene  = RaycasterTestFixtures.createScene([mesh]);
        return raycaster.raycast(scene, camera, RaycasterTestFixtures.ORIGIN_NDC);
    });

    // Assert
    results.forEach((intersections) => assert.equal(intersections.length, RaycasterTestFixtures.EXPECTED_SINGLE_HIT));
});

test("'Raycaster.raycast' should reject off-axis boxes for X, Y and Z slab tests", () => {
    // Arrange
    const raycaster = new Raycaster();
    const cases     = [
        { world: Matrix4.createIdentity(), position: RaycasterTestFixtures.BOX_CENTER_OFF_AXIS_XZ },
        { world: Matrix4.createIdentity(), position: RaycasterTestFixtures.BOX_CENTER_OFF_AXIS_YZ },
        { world: Matrix4.createIdentity(), position: RaycasterTestFixtures.BOX_CENTER_NEGATIVE_Z }
    ];

    // Act
    const results = cases.map(({ world, position }) => {
        const camera = RaycasterTestFixtures.createCamera(world);
        const mesh   = RaycasterTestFixtures.createMesh(position);
        const scene  = RaycasterTestFixtures.createScene([mesh]);
        return raycaster.raycast(scene, camera, RaycasterTestFixtures.ORIGIN_NDC);
    });

    // Assert
    results.forEach((intersections) => assert.deepEqual(intersections, []));
});

test("'Raycaster.raycast' should miss separated slab entry and exit intervals", () => {
    // Arrange
    const raycaster = new Raycaster();
    const rotation  = Matrix4.createRotationY(RaycasterTestFixtures.SLAB_SEPARATION_ANGLE);
    const camera    = RaycasterTestFixtures.createCamera(rotation);
    const mesh      = RaycasterTestFixtures.createMesh(RaycasterTestFixtures.BOX_CENTER_POSITIVE_X);
    const scene     = RaycasterTestFixtures.createScene([mesh]);

    // Act
    const intersections = raycaster.raycast(scene, camera, RaycasterTestFixtures.ORIGIN_NDC);

    // Assert
    assert.deepEqual(intersections, []);
});

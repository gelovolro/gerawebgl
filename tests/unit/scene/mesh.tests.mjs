import test               from 'node:test';
import assert             from 'node:assert/strict';
import * as MeshConstants from '../../../core/constants/mesh.js';
import { Geometry }       from '../../../core/geometry/geometry.js';
import { Material }       from '../../../core/material/material.js';
import { Mesh }           from '../../../core/scene/mesh.js';

class MeshTestFixtures {
    static INITIAL_DISPOSE_CALL_COUNT   = 0;
    static DISPOSE_CALL_COUNT_INCREMENT = 1;
    static TYPE_ERROR_NAME              = TypeError.name;

    static createGeometryDouble() {
        const geometry = Object.create(Geometry.prototype);
        geometry.disposeCallCount = MeshTestFixtures.INITIAL_DISPOSE_CALL_COUNT;
        geometry.dispose = () => geometry.disposeCallCount += MeshTestFixtures.DISPOSE_CALL_COUNT_INCREMENT;
        return geometry;
    }

    static createMaterialDouble() {
        const material = Object.create(Material.prototype);
        material.disposeCallCount = MeshTestFixtures.INITIAL_DISPOSE_CALL_COUNT;
        material.dispose = () => material.disposeCallCount += MeshTestFixtures.DISPOSE_CALL_COUNT_INCREMENT;
        return material;
    }

    static assertThrowsTypeError(actualCall, expectedErrorMatch) {
        assert.throws(actualCall, {
            name    : MeshTestFixtures.TYPE_ERROR_NAME,
            message : expectedErrorMatch
        });
    }
}

test("'Mesh' constructor should reject a non-Geometry instance", () => {
    // Arrange
    const invalidGeometry    = {};
    const actualMaterial     = MeshTestFixtures.createMaterialDouble();
    const expectedErrorMatch = /expects a Geometry instance/;

    // Act
    const actualCall = () => new Mesh(invalidGeometry, actualMaterial);

    // Assert
    MeshTestFixtures.assertThrowsTypeError(actualCall, expectedErrorMatch);
});

test("'Mesh' constructor should reject a non-Material instance", () => {
    // Arrange
    const invalidMaterial    = {};
    const actualGeometry     = MeshTestFixtures.createGeometryDouble();
    const expectedErrorMatch = /expects a Material instance/;

    // Act
    const actualCall = () => new Mesh(actualGeometry, invalidMaterial);

    // Assert
    MeshTestFixtures.assertThrowsTypeError(actualCall, expectedErrorMatch);
});

test("'Mesh' constructor should reject invalid ownership options", () => {
    // Arrange
    const actualGeometry         = MeshTestFixtures.createGeometryDouble();
    const actualMaterial         = MeshTestFixtures.createMaterialDouble();
    const expectedErrorMatch     = /expects `ownershipOptions` as a plain object/;
    const invalidOwnershipValues = [
        null,
        'invalid',
        [],
        new Date(),
        new Map(),
        Object.create({ ownsGeometry: false })
    ];

    // Act & Assert
    for (const invalidOwnershipOptions of invalidOwnershipValues) {
        const actualCall = () => new Mesh(
            actualGeometry,
            actualMaterial,
            invalidOwnershipOptions
        );

        MeshTestFixtures.assertThrowsTypeError(actualCall, expectedErrorMatch);
    }
});

test("'Mesh' constructor should reject non-boolean ownsGeometry option", () => {
    // Arrange
    const invalidOwnsGeometry = 'true';
    const actualGeometry      = MeshTestFixtures.createGeometryDouble();
    const actualMaterial      = MeshTestFixtures.createMaterialDouble();
    const expectedErrorMatch  = /option `ownsGeometry` must be a boolean/;

    // Act
    const actualCall = () => new Mesh(
        actualGeometry,
        actualMaterial,
        { ownsGeometry: invalidOwnsGeometry }
    );

    // Assert
    MeshTestFixtures.assertThrowsTypeError(actualCall, expectedErrorMatch);
});

test("'Mesh' constructor should reject non-boolean ownsMaterial option", () => {
    // Arrange
    const invalidOwnsMaterial = 'true';
    const actualGeometry      = MeshTestFixtures.createGeometryDouble();
    const actualMaterial      = MeshTestFixtures.createMaterialDouble();
    const expectedErrorMatch  = /option `ownsMaterial` must be a boolean/;

    // Act
    const actualCall = () => new Mesh(
        actualGeometry,
        actualMaterial,
        { ownsMaterial: invalidOwnsMaterial }
    );

    // Assert
    MeshTestFixtures.assertThrowsTypeError(actualCall, expectedErrorMatch);
});

test("'Mesh' constructor should keep resources and default ownership options", () => {
    // Arrange
    const expectedGeometry = MeshTestFixtures.createGeometryDouble();
    const expectedMaterial = MeshTestFixtures.createMaterialDouble();

    // Act
    const actualMesh = new Mesh(expectedGeometry, expectedMaterial);

    // Assert
    assert.equal(actualMesh.geometry, expectedGeometry);
    assert.equal(actualMesh.material, expectedMaterial);
    assert.equal(actualMesh.ownsGeometry, MeshConstants.MESH_DEFAULTS.OWNS_GEOMETRY);
    assert.equal(actualMesh.ownsMaterial, MeshConstants.MESH_DEFAULTS.OWNS_MATERIAL);
    assert.equal(actualMesh.isDisposed, false);
});

test("'Mesh' constructor should use default values for omitted ownership options", () => {
    // Arrange
    const actualGeometry = MeshTestFixtures.createGeometryDouble();
    const actualMaterial = MeshTestFixtures.createMaterialDouble();

    // Act
    const actualMesh = new Mesh(actualGeometry, actualMaterial, { ownsGeometry: false });

    // Assert
    assert.equal(actualMesh.ownsGeometry, false);
    assert.equal(actualMesh.ownsMaterial, MeshConstants.MESH_DEFAULTS.OWNS_MATERIAL);
});

test("'Mesh.dispose' should dispose owned resources only once", () => {
    // Arrange
    const expectedCallCount = MeshTestFixtures.DISPOSE_CALL_COUNT_INCREMENT;
    const actualGeometry    = MeshTestFixtures.createGeometryDouble();
    const actualMaterial    = MeshTestFixtures.createMaterialDouble();

    // Act
    const actualMesh = new Mesh(actualGeometry, actualMaterial);
    actualMesh.dispose();
    actualMesh.dispose();

    // Assert
    assert.equal(actualGeometry.disposeCallCount, expectedCallCount);
    assert.equal(actualMaterial.disposeCallCount, expectedCallCount);
    assert.equal(actualMesh.isDisposed, true);
});

test("'Mesh.dispose' should not dispose resources not owned by the mesh", () => {
    // Arrange
    const expectedCallCount = MeshTestFixtures.INITIAL_DISPOSE_CALL_COUNT;
    const actualGeometry    = MeshTestFixtures.createGeometryDouble();
    const actualMaterial    = MeshTestFixtures.createMaterialDouble();

    // Act
    const actualMesh = new Mesh(actualGeometry, actualMaterial,
        { ownsGeometry : false, ownsMaterial : false }
    );

    actualMesh.dispose();

    // Assert
    assert.equal(actualGeometry.disposeCallCount, expectedCallCount);
    assert.equal(actualMaterial.disposeCallCount, expectedCallCount);
    assert.equal(actualMesh.isDisposed, true);
});

test("'Mesh.dispose' should dispose only owned geometry", () => {
    // Arrange
    const actualGeometry = MeshTestFixtures.createGeometryDouble();
    const actualMaterial = MeshTestFixtures.createMaterialDouble();

    // Act
    const actualMesh = new Mesh(actualGeometry, actualMaterial,
        { ownsGeometry : true, ownsMaterial : false }
    );

    actualMesh.dispose();

    // Assert
    assert.equal(actualGeometry.disposeCallCount, MeshTestFixtures.DISPOSE_CALL_COUNT_INCREMENT);
    assert.equal(actualMaterial.disposeCallCount, MeshTestFixtures.INITIAL_DISPOSE_CALL_COUNT);
    assert.equal(actualMesh.isDisposed, true);
});

test("'Mesh.dispose' should dispose only owned material", () => {
    // Arrange
    const actualGeometry = MeshTestFixtures.createGeometryDouble();
    const actualMaterial = MeshTestFixtures.createMaterialDouble();

    // Act
    const actualMesh = new Mesh(actualGeometry, actualMaterial,
        { ownsGeometry : false, ownsMaterial : true }
    );

    actualMesh.dispose();

    // Assert
    assert.equal(actualGeometry.disposeCallCount, MeshTestFixtures.INITIAL_DISPOSE_CALL_COUNT);
    assert.equal(actualMaterial.disposeCallCount, MeshTestFixtures.DISPOSE_CALL_COUNT_INCREMENT);
    assert.equal(actualMesh.isDisposed, true);
});

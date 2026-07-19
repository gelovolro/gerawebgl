import test               from 'node:test';
import assert             from 'node:assert/strict';
import * as MeshConstants from '../../../core/constants/mesh.js';

test("'Mesh' constants object should be frozen", () => {
    // Arrange & Act & Assert
    assert.equal(Object.isFrozen(MeshConstants.MESH_DEFAULTS), true);
});

test("'Mesh' default constants should keep existing values", () => {
    // Arrange
    const actualConstants = MeshConstants.MESH_DEFAULTS;

    // Act & Assert
    assert.equal(actualConstants.OWNS_GEOMETRY, true);
    assert.equal(actualConstants.OWNS_MATERIAL, true);
});

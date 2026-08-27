import test                   from 'node:test';
import assert                 from 'node:assert/strict';
import * as Object3DConstants from '../../../core/constants/object3d.js';

test("'Object3D' constants object should be frozen", () => {
    // Arrange
    const actualConstants = Object3DConstants.OBJECT3D_CHILDREN;

    // Act & Assert
    assert.equal(Object.isFrozen(actualConstants), true);
});

test("'Object3D' child-list constants should keep existing values", () => {
    // Arrange
    const actualConstants   = Object3DConstants.OBJECT3D_CHILDREN;
    const expectedConstants = {
        NOT_FOUND_INDEX     : -1,
        SINGLE_REMOVE_COUNT : 1
    };

    // Act & Assert
    assert.equal(actualConstants.NOT_FOUND_INDEX, expectedConstants.NOT_FOUND_INDEX);
    assert.equal(actualConstants.SINGLE_REMOVE_COUNT, expectedConstants.SINGLE_REMOVE_COUNT);
});

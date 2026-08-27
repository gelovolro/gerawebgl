import test               from 'node:test';
import assert             from 'node:assert/strict';
import { Matrix4 }        from '../../../core/math/matrix4.js';
import { Object3D }       from '../../../core/scene/object3d.js';
import { TestAssertions } from '../../helpers/test-assertions.mjs';

class Object3DTestFixtures {
    static TRANSLATION_X              = 10;
    static TRANSLATION_Y              = 20;
    static TRANSLATION_Z              = 30;
    static CHILD_TRANSLATION_X        = 2;
    static CHILD_TRANSLATION_Y        = 3;
    static CHILD_TRANSLATION_Z        = 4;
    static DEFAULT_POSITION_COMPONENT = 0;
    static DEFAULT_ROTATION_COMPONENT = 0;
    static DEFAULT_SCALE_COMPONENT    = 1;
    static EMPTY_WORLD_MATRIX_OPTIONS = {};
    static INVALID_OBJECT             = {};

    static createExpectedIdentityMatrix() {
        return Matrix4.createIdentity();
    }

    static createExpectedTranslationMatrix(translateX, translateY, translateZ) {
        return Matrix4.createTranslation(translateX, translateY, translateZ);
    }
}

test("'Object3D' constructor should create the default transform and valid identity world matrix", () => {
    // Arrange
    const expectedWorldMatrix = Object3DTestFixtures.createExpectedIdentityMatrix();

    // Act
    const actualObject = new Object3D();

    // Assert
    assert.equal(actualObject.position.x, Object3DTestFixtures.DEFAULT_POSITION_COMPONENT);
    assert.equal(actualObject.position.y, Object3DTestFixtures.DEFAULT_POSITION_COMPONENT);
    assert.equal(actualObject.position.z, Object3DTestFixtures.DEFAULT_POSITION_COMPONENT);

    assert.equal(actualObject.rotation.x, Object3DTestFixtures.DEFAULT_ROTATION_COMPONENT);
    assert.equal(actualObject.rotation.y, Object3DTestFixtures.DEFAULT_ROTATION_COMPONENT);
    assert.equal(actualObject.rotation.z, Object3DTestFixtures.DEFAULT_ROTATION_COMPONENT);

    assert.equal(actualObject.scale.x, Object3DTestFixtures.DEFAULT_SCALE_COMPONENT);
    assert.equal(actualObject.scale.y, Object3DTestFixtures.DEFAULT_SCALE_COMPONENT);
    assert.equal(actualObject.scale.z, Object3DTestFixtures.DEFAULT_SCALE_COMPONENT);

    assert.equal(actualObject.parent, null);
    assert.deepEqual(actualObject.children, []);
    TestAssertions.assertFloat32ArrayApproximatelyEquals(actualObject.worldMatrix, expectedWorldMatrix);
});

test("'Object3D.add' should reject a non-Object3D child", () => {
    // Arrange
    const actualObject       = new Object3D();
    const invalidChild       = Object3DTestFixtures.INVALID_OBJECT;
    const expectedErrorMatch = /expects an Object3D instance/;

    // Act
    const actualCall = () => actualObject.add(invalidChild);

    // Assert
    assert.throws(actualCall, TypeError);
    assert.throws(actualCall, expectedErrorMatch);
});

test("'Object3D.add' should attach a child and ignore the same child when already attached", () => {
    // Arrange
    const actualParent = new Object3D();
    const actualChild  = new Object3D();

    // Act
    actualParent.add(actualChild);
    actualParent.add(actualChild);

    // Assert
    assert.equal(actualChild.parent, actualParent);
    assert.deepEqual(actualParent.children, [actualChild]);
});

test("'Object3D.add' should reparent a child from its previous parent", () => {
    // Arrange
    const previousParent = new Object3D();
    const actualParent   = new Object3D();
    const actualChild    = new Object3D();

    // Act
    previousParent.add(actualChild);
    actualParent.add(actualChild);

    // Assert
    assert.deepEqual(previousParent.children, []);
    assert.deepEqual(actualParent.children, [actualChild]);
    assert.equal(actualChild.parent, actualParent);
});

test("'Object3D.remove' should reject a non-Object3D child", () => {
    // Arrange
    const actualObject       = new Object3D();
    const invalidChild       = Object3DTestFixtures.INVALID_OBJECT;
    const expectedErrorMatch = /expects an Object3D instance/;

    // Act
    const actualCall = () => actualObject.remove(invalidChild);

    // Assert
    assert.throws(actualCall, TypeError);
    assert.throws(actualCall, expectedErrorMatch);
});

test("'Object3D.remove' should ignore a child that is not attached", () => {
    // Arrange
    const actualParent = new Object3D();
    const actualChild  = new Object3D();

    // Act
    actualParent.remove(actualChild);

    // Assert
    assert.equal(actualChild.parent, null);
    assert.deepEqual(actualParent.children, []);
});

test("'Object3D.remove' should detach an attached child", () => {
    // Arrange
    const actualParent = new Object3D();
    const actualChild  = new Object3D();

    // Act
    actualParent.add(actualChild);
    actualParent.remove(actualChild);

    // Assert
    assert.equal(actualChild.parent, null);
    assert.deepEqual(actualParent.children, []);
});

test("'Object3D.updateWorldMatrix' should reject an invalid parent world matrix", () => {
    // Arrange
    const actualObject       = new Object3D();
    const invalidMatrix      = 'invalid';
    const expectedErrorMatch = /expects `Float32Array` or null/;

    // Act
    const actualDirectCall  = () => actualObject.updateWorldMatrix(invalidMatrix);
    const actualOptionsCall = () => actualObject.updateWorldMatrix({ parentWorldMatrix: invalidMatrix });

    // Assert
    assert.throws(actualDirectCall, TypeError);
    assert.throws(actualDirectCall, expectedErrorMatch);
    assert.throws(actualOptionsCall, TypeError);
    assert.throws(actualOptionsCall, expectedErrorMatch);
});

test("'Object3D.updateWorldMatrix' should accept an options object without a parent override", () => {
    // Arrange
    const actualObject   = new Object3D();
    const expectedMatrix = Object3DTestFixtures.createExpectedTranslationMatrix(
        Object3DTestFixtures.TRANSLATION_X,
        Object3DTestFixtures.TRANSLATION_Y,
        Object3DTestFixtures.TRANSLATION_Z
    );

    // Act
    actualObject.position.set(
        Object3DTestFixtures.TRANSLATION_X,
        Object3DTestFixtures.TRANSLATION_Y,
        Object3DTestFixtures.TRANSLATION_Z
    );

    actualObject.updateWorldMatrix(Object3DTestFixtures.EMPTY_WORLD_MATRIX_OPTIONS);

    // Assert
    TestAssertions.assertFloat32ArrayApproximatelyEquals(actualObject.worldMatrix, expectedMatrix);
});

test("'Object3D.updateWorldMatrix' should apply an explicit parent world matrix from options", () => {
    // Arrange
    const parentWorldMatrix = Matrix4.createTranslation(
        Object3DTestFixtures.TRANSLATION_X,
        Object3DTestFixtures.TRANSLATION_Y,
        Object3DTestFixtures.TRANSLATION_Z
    );

    const childLocalMatrix = Matrix4.createTranslation(
        Object3DTestFixtures.CHILD_TRANSLATION_X,
        Object3DTestFixtures.CHILD_TRANSLATION_Y,
        Object3DTestFixtures.CHILD_TRANSLATION_Z
    );

    const expectedMatrix = Matrix4.multiply(
        parentWorldMatrix,
        childLocalMatrix
    );

    const actualObject = new Object3D();

    // Act
    actualObject.position.set(
        Object3DTestFixtures.CHILD_TRANSLATION_X,
        Object3DTestFixtures.CHILD_TRANSLATION_Y,
        Object3DTestFixtures.CHILD_TRANSLATION_Z
    );

    actualObject.updateWorldMatrix({ parentWorldMatrix });

    // Assert
    TestAssertions.assertFloat32ArrayApproximatelyEquals(actualObject.worldMatrix, expectedMatrix);
});

test("'Object3D.updateWorldMatrix' should reuse cached matrices when transforms stay unchanged", () => {
    // Arrange
    const actualObject   = new Object3D();
    const expectedMatrix = Object3DTestFixtures.createExpectedTranslationMatrix(
        Object3DTestFixtures.TRANSLATION_X,
        Object3DTestFixtures.TRANSLATION_Y,
        Object3DTestFixtures.TRANSLATION_Z
    );

    // Act
    actualObject.position.set(
        Object3DTestFixtures.TRANSLATION_X,
        Object3DTestFixtures.TRANSLATION_Y,
        Object3DTestFixtures.TRANSLATION_Z
    );

    actualObject.updateWorldMatrix(null);
    actualObject.updateWorldMatrix(null);

    // Assert
    TestAssertions.assertFloat32ArrayApproximatelyEquals(actualObject.worldMatrix, expectedMatrix);
});

test("'Object3D.updateWorldMatrix' should propagate parent transform changes to clean descendants", () => {
    // Arrange
    const actualParent   = new Object3D();
    const actualChild    = new Object3D();
    const expectedMatrix = Object3DTestFixtures.createExpectedTranslationMatrix(
        Object3DTestFixtures.TRANSLATION_X + Object3DTestFixtures.CHILD_TRANSLATION_X,
        Object3DTestFixtures.TRANSLATION_Y + Object3DTestFixtures.CHILD_TRANSLATION_Y,
        Object3DTestFixtures.TRANSLATION_Z + Object3DTestFixtures.CHILD_TRANSLATION_Z
    );

    // Act
    actualParent.add(actualChild);
    actualChild.position.set(
        Object3DTestFixtures.CHILD_TRANSLATION_X,
        Object3DTestFixtures.CHILD_TRANSLATION_Y,
        Object3DTestFixtures.CHILD_TRANSLATION_Z
    );

    actualParent.updateWorldMatrix(null);

    actualParent.position.set(
        Object3DTestFixtures.TRANSLATION_X,
        Object3DTestFixtures.TRANSLATION_Y,
        Object3DTestFixtures.TRANSLATION_Z
    );

    actualParent.updateWorldMatrix(null);

    // Assert
    TestAssertions.assertFloat32ArrayApproximatelyEquals(actualChild.worldMatrix, expectedMatrix);
});

test("'Object3D.updateWorldMatrix' should update a dirty child when the parent remains unchanged", () => {
    // Arrange
    const actualParent   = new Object3D();
    const actualChild    = new Object3D();
    const expectedMatrix = Object3DTestFixtures.createExpectedTranslationMatrix(
        Object3DTestFixtures.CHILD_TRANSLATION_X,
        Object3DTestFixtures.CHILD_TRANSLATION_Y,
        Object3DTestFixtures.CHILD_TRANSLATION_Z
    );

    // Act
    actualParent.add(actualChild);
    actualParent.updateWorldMatrix(null);
    actualChild.position.set(
        Object3DTestFixtures.CHILD_TRANSLATION_X,
        Object3DTestFixtures.CHILD_TRANSLATION_Y,
        Object3DTestFixtures.CHILD_TRANSLATION_Z
    );

    actualParent.updateWorldMatrix(null);

    // Assert
    TestAssertions.assertFloat32ArrayApproximatelyEquals(actualChild.worldMatrix, expectedMatrix);
});

test("'Object3D.traverse' should reject a non-function callback", () => {
    // Arrange
    const actualObject       = new Object3D();
    const invalidCallback    = Object3DTestFixtures.INVALID_OBJECT;
    const expectedErrorMatch = /expects a function callback/;

    // Act
    const actualCall = () => actualObject.traverse(invalidCallback);

    // Assert
    assert.throws(actualCall, TypeError);
    assert.throws(actualCall, expectedErrorMatch);
});

test("'Object3D.traverse' should visit the hierarchy in depth-first order", () => {
    // Arrange
    const actualRoot       = new Object3D();
    const actualFirstChild = new Object3D();
    const actualGrandchild = new Object3D();
    const actualLastChild  = new Object3D();
    const actualOrder      = [];

    // Act
    actualRoot.add(actualFirstChild);
    actualFirstChild.add(actualGrandchild);
    actualRoot.add(actualLastChild);
    actualRoot.traverse((object) => actualOrder.push(object));

    // Assert
    assert.deepEqual(actualOrder, [
        actualRoot,
        actualFirstChild,
        actualGrandchild,
        actualLastChild
    ]);
});

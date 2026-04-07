import test        from 'node:test';
import assert      from 'node:assert/strict';
import { Vector3 } from '../../core/math/vector3.js';

class Vector3TestFixtures {
    static createChangeCounter() {
        return {
            value: 0,
            onChange() {
                this.value += 1;
            }
        };
    }
}

test('Vector3.createZero should create a zero vector', () => {
    // Arrange
    const expectedComponents = { x: 0, y: 0, z: 0 };

    // Act
    const actualVector = Vector3.createZero();

    // Assert
    assert.equal(actualVector.x, expectedComponents.x);
    assert.equal(actualVector.y, expectedComponents.y);
    assert.equal(actualVector.z, expectedComponents.z);
});

test('Vector3.createUnitScale should create a unit-scale vector', () => {
    // Arrange
    const expectedComponents = { x: 1, y: 1, z: 1 };

    // Act
    const actualVector = Vector3.createUnitScale();

    // Assert
    assert.equal(actualVector.x, expectedComponents.x);
    assert.equal(actualVector.y, expectedComponents.y);
    assert.equal(actualVector.z, expectedComponents.z);
});

test('Vector3.set should update all components and emit exactly one change', () => {
    // Arrange
    const changeCounter = Vector3TestFixtures.createChangeCounter();
    const actualVector  = new Vector3(0, 0, 0, changeCounter.onChange.bind(changeCounter));

    // Act
    const returnedVector = actualVector.set(10, 20, 30);

    // Assert
    assert.equal(returnedVector, actualVector);
    assert.equal(actualVector.x, 10);
    assert.equal(actualVector.y, 20);
    assert.equal(actualVector.z, 30);
    assert.equal(changeCounter.value, 1);
});

test('Vector3 property setters should not emit a change, when the value stays the same', () => {
    // Arrange
    const changeCounter = Vector3TestFixtures.createChangeCounter();
    const actualVector  = new Vector3(1, 2, 3, changeCounter.onChange.bind(changeCounter));
    changeCounter.value = 0;

    // Act
    actualVector.x = 1;
    actualVector.y = 2;
    actualVector.z = 3;

    // Assert
    assert.equal(changeCounter.value, 0);
});

test('Vector3.copyFrom should copy all components from another vector', () => {
    // Arrange
    const sourceVector = new Vector3(4, 5, 6);
    const actualVector = new Vector3();

    // Act
    const returnedVector = actualVector.copyFrom(sourceVector);

    // Assert
    assert.equal(returnedVector, actualVector);
    assert.equal(actualVector.x, 4);
    assert.equal(actualVector.y, 5);
    assert.equal(actualVector.z, 6);
});

test('Vector3.setOnChange should replace the callback and allow null', () => {
    // Arrange
    const firstCounter  = Vector3TestFixtures.createChangeCounter();
    const secondCounter = Vector3TestFixtures.createChangeCounter();
    const actualVector  = new Vector3(0, 0, 0, firstCounter.onChange.bind(firstCounter));
    firstCounter.value  = 0;

    // Act
    actualVector.setOnChange(secondCounter.onChange.bind(secondCounter));
    actualVector.x = 1;
    actualVector.setOnChange(null);
    actualVector.y = 2;

    // Assert
    assert.equal(firstCounter.value, 0);
    assert.equal(secondCounter.value, 1);
});

test('Vector3 constructor should reject a non-function onChange callback', () => {
    // Arrange
    const invalidCallback = 'not-a-function';

    // Act
    const actualCall = () => new Vector3(0, 0, 0, invalidCallback);

    // Assert
    assert.throws(actualCall, /function or null/);
});

test('Vector3.set should reject NaN components', () => {
    // Arrange
    const actualVector = new Vector3();

    // Act
    const actualCall = () => actualVector.set(Number.NaN, 0, 0);

    // Assert
    assert.throws(actualCall, /must be a valid number/);
});

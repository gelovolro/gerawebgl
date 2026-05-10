import test                 from 'node:test';
import assert               from 'node:assert/strict';
import * as EngineConstants from '../../../core/constants/engine.js';

test("'Engine' constants objects should be frozen", () => {
    // Arrange
    const constantsObjects = [
        EngineConstants.ENGINE_CAMERA_DEFAULTS,
        EngineConstants.ENGINE_HELPER_DEFAULTS,
        EngineConstants.ENGINE_VALIDATION_LIMITS,
        EngineConstants.ENGINE_TIME,
        EngineConstants.ENGINE_STATE_RESET,
        EngineConstants.ENGINE_CANVAS_DEFAULTS
    ];

    // Act & Assert
    constantsObjects.forEach((constantsObject) => assert.equal(Object.isFrozen(constantsObject), true));
});

test("'Engine' camera default constants should keep the existing values", () => {
    // Arrange
    const actualConstants = EngineConstants.ENGINE_CAMERA_DEFAULTS;

    // Act & Assert
    assert.equal(actualConstants.FIELD_OF_VIEW_RADIANS, Math.PI / 4);
    assert.equal(actualConstants.NEAR_CLIPPING_PLANE, 0.1);
    assert.equal(actualConstants.FAR_CLIPPING_PLANE, 100.0);
    assert.equal(actualConstants.INITIAL_CAMERA_Z, 5.0);
    assert.equal(actualConstants.INITIAL_CAMERA_ASPECT_RATIO, 1.0);
});

test("'Engine' helper default constants should keep the existing values", () => {
    // Arrange
    const actualConstants = EngineConstants.ENGINE_HELPER_DEFAULTS;

    // Act & Assert
    assert.equal(actualConstants.BOX_SIZE, 1.0);
});

test("'Engine' validation limit constants should keep the existing values", () => {
    // Arrange
    const actualConstants = EngineConstants.ENGINE_VALIDATION_LIMITS;

    // Act & Assert
    assert.equal(actualConstants.MIN_BOX_SIZE_EXCLUSIVE, 0);
    assert.equal(actualConstants.MIN_NUMBER_EXCLUSIVE, 0);
});

test("'Engine' time constants should keep the existing values", () => {
    // Arrange
    const actualConstants = EngineConstants.ENGINE_TIME;

    // Act & Assert
    assert.equal(actualConstants.MILLISECONDS_TO_SECONDS, 0.001);
});

test("'Engine' state reset constants should keep the existing values", () => {
    // Arrange
    const actualConstants = EngineConstants.ENGINE_STATE_RESET;

    // Act & Assert
    assert.equal(actualConstants.ANIMATION_FRAME_ID, 0);
    assert.equal(actualConstants.TIME_SECONDS, 0);
});

test("'Engine' canvas default constants should keep the existing values", () => {
    // Arrange
    const actualConstants = EngineConstants.ENGINE_CANVAS_DEFAULTS;

    // Act & Assert
    assert.equal(actualConstants.FIT_TO_WINDOW, false);
});

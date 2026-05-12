import test                   from 'node:test';
import assert                 from 'node:assert/strict';
import * as RendererConstants from '../../../core/constants/renderer.js';

test("'Renderer' constants objects should be frozen", () => {
    // Arrange
    const constantsObjects = [
        RendererConstants.RENDERER_DRAW,
        RendererConstants.RENDERER_OPACITY,
        RendererConstants.RENDERER_MATERIAL_APPLY_PARAM_COUNTS,
        RendererConstants.RENDERER_TRAVERSAL,
        RendererConstants.RENDERER_ERRORS
    ];

    // Act & Assert
    constantsObjects.forEach((constantsObject) => assert.equal(Object.isFrozen(constantsObject), true));
});

test("'Renderer' draw constants should keep existing values", () => {
    // Arrange
    const actualConstants = RendererConstants.RENDERER_DRAW;

    // Act & Assert
    assert.equal(actualConstants.INDEX_BUFFER_OFFSET_BYTES, 0);
});

test("'Renderer' opacity constants should keep existing values", () => {
    // Arrange
    const actualConstants = RendererConstants.RENDERER_OPACITY;

    // Act & Assert
    assert.equal(actualConstants.OPAQUE_THRESHOLD, 1.0);
});

test("'Renderer' material apply parameter count constants should keep existing values", () => {
    // Arrange
    const actualConstants = RendererConstants.RENDERER_MATERIAL_APPLY_PARAM_COUNTS;

    // Act & Assert
    assert.equal(actualConstants.WORLD_MATRIX, 2);
    assert.equal(actualConstants.WORLD_INVERSE_TRANSPOSE, 3);
    assert.equal(actualConstants.CAMERA_POSITION, 4);
});

test("'Renderer' traversal constants should keep existing values", () => {
    // Arrange
    const actualConstants = RendererConstants.RENDERER_TRAVERSAL;

    // Act & Assert
    assert.equal(actualConstants.STACK_EMPTY_LENGTH, 0);
    assert.equal(actualConstants.CHILD_LOOP_START_INDEX, 0);
    assert.equal(actualConstants.CHILD_LOOP_INCREMENT, 1);
});

test("'Renderer' error constants should keep existing values", () => {
    // Arrange
    const actualConstants = RendererConstants.RENDERER_ERRORS;

    // Act & Assert
    assert.equal(actualConstants.UNKNOWN_PRIMITIVE, 'Renderer received an unknown geometry primitive.');
});

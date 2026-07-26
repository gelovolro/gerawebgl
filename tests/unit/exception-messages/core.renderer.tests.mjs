import test                           from 'node:test';
import assert                         from 'node:assert/strict';
import * as RendererExceptionMessages from '../../../core/exception-messages/renderer.js';

test("'Renderer' exception messages object should be frozen", () => {
    // Arrange
    const actualMessages = RendererExceptionMessages.RENDERER_EXCEPTION_MESSAGES;

    // Act & Assert
    assert.equal(Object.isFrozen(actualMessages), true);
});

test("'Renderer' exception messages should keep existing values", () => {
    // Arrange
    const actualMessages = RendererExceptionMessages.RENDERER_EXCEPTION_MESSAGES;

    // Act & Assert
    assert.equal(actualMessages.UNKNOWN_PRIMITIVE, 'Renderer received an unknown geometry primitive.');
});

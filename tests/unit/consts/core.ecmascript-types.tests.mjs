import test                          from 'node:test';
import assert                        from 'node:assert/strict';
import { ECMASCRIPT_TYPEOF_RESULTS } from '../../../core/constants/ecmascript-types.js';

test("'ECMAScript typeof results' constants should exist", () => {
    // Act & Assert
    assert.ok(ECMASCRIPT_TYPEOF_RESULTS);
});

test("'ECMAScript typeof results' constants object should be frozen", () => {
    // Act & Assert
    assert.equal(Object.isFrozen(ECMASCRIPT_TYPEOF_RESULTS), true);
});

test("'ECMAScript typeof results' constants should keep typeof values", () => {
    // Act & Assert
    assert.equal(ECMASCRIPT_TYPEOF_RESULTS.UNDEFINED, 'undefined');
    assert.equal(ECMASCRIPT_TYPEOF_RESULTS.OBJECT, 'object');
    assert.equal(ECMASCRIPT_TYPEOF_RESULTS.BOOLEAN, 'boolean');
    assert.equal(ECMASCRIPT_TYPEOF_RESULTS.NUMBER, 'number');
    assert.equal(ECMASCRIPT_TYPEOF_RESULTS.BIGINT, 'bigint');
    assert.equal(ECMASCRIPT_TYPEOF_RESULTS.STRING, 'string');
    assert.equal(ECMASCRIPT_TYPEOF_RESULTS.SYMBOL, 'symbol');
    assert.equal(ECMASCRIPT_TYPEOF_RESULTS.FUNCTION, 'function');
});

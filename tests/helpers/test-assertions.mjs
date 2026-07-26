import { existsSync }    from 'node:fs';
import assert            from 'node:assert/strict';
import { TestConstants } from './test-constants.js';

export class TestAssertions {
    static assertFloat32ArrayApproximatelyEquals(actual, expected, epsilon = TestConstants.DEFAULT_EPSILON_VALUE) {
        assert.ok(actual instanceof Float32Array    , 'Expected actual value to be `Float32Array`.');
        assert.ok(expected instanceof Float32Array  , 'Expected expected value to be `Float32Array``.');
        assert.equal(actual.length, expected.length , '`Float32Array` lengths must match.');

        for (let index = 0; index < actual.length; index += 1) {
            const absoluteDelta = Math.abs(actual[index] - expected[index]);
            assert.ok(
                absoluteDelta <= epsilon,
                `Matrix element at index: ${index} - differs: actual = ${actual[index]}, expected = ${expected[index]}, epsilon = ${epsilon}.`
            );
        }
    }

    static assertFileExists(filePath) {
        assert.ok(Boolean(filePath)    , 'File path must be provided.');
        assert.ok(existsSync(filePath) , `Expected file to exist: ${filePath}`);
    }
}

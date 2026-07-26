import test               from 'node:test';
import assert             from 'node:assert/strict';
import path               from 'node:path';
import { NpmTestRunner }  from '../helpers/npm-test-runner.mjs';
import { TestAssertions } from '../helpers/test-assertions.mjs';
import { TestConstants }  from '../helpers/test-constants.js';

class OneShotSmokeCase {
    constructor(scriptName, expectedFiles = []) {
        this.scriptName    = scriptName;
        this.expectedFiles = expectedFiles;
    }
}

class OneShotSmokeSuite {
    static getCases() {
        return [
            new OneShotSmokeCase('deps:check'),
            new OneShotSmokeCase('build:lib:all', [
                'dist/gerawebgl.js',
                'dist/gerawebgl.min.js'
            ]),
            new OneShotSmokeCase('docs:build-locally', [
                'docs/latest-jsdoc-generation/index.html',
                'docs/hld-component-diagrams/dependency-graph.md',
                'docs/hld-component-diagrams/folder-dependency.dot'
            ]),
            new OneShotSmokeCase('build:dist-github-pages', [
                'dist-github-pages/index.html',
                'dist-github-pages/demos/materials.html',
                'dist-github-pages/api/index.html'
            ])
        ];
    }
}

for (const smokeCase of OneShotSmokeSuite.getCases()) {
    test(`One-shot npm smoke: ${smokeCase.scriptName}`, async () => {
        // Arrange
        const expectedFiles = smokeCase.expectedFiles.map((relativePath) => path.join(TestConstants.PROJECT_ROOT, relativePath));
        const awaitedCode   = 0;

        // Act
        const result = await NpmTestRunner.runOneShot(smokeCase.scriptName, TestConstants.PROJECT_ROOT);

        // Assert
        assert.equal(
            result.exitCode,
            awaitedCode,
            [
                `Script "${smokeCase.scriptName}" exited with ${result.exitCode}.`,
                result.stdout,
                result.stderr
            ].join(TestConstants.NEWLINE_CHAR)
        );

        for (const expectedFilePath of expectedFiles) {
            TestAssertions.assertFileExists(expectedFilePath);
        }
    });
}

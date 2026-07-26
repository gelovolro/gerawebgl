import test, { afterEach }                    from 'node:test';
import assert                                 from 'node:assert/strict';
import fs                                     from 'node:fs';
import { DirectProcessRunner, NpmTestRunner } from '../helpers/npm-test-runner.mjs';
import { TestConstants }                      from '../helpers/test-constants.js';

export class ActiveProcessFixture {
    #activeProcess = null;

    set(processInstance) {
        this.#activeProcess = processInstance;
    }

    async stopIfRunning() {
        if (this.#activeProcess) {
            await this.#activeProcess.stop();
            this.#activeProcess = null;
        }
    }
}

export class GithubPagesBuildProbe {
    static isBuildPresent() {
        return fs.existsSync(TestConstants.DIST_GITHUB_PAGES_INDEX_FILE)
            && fs.existsSync(TestConstants.DIST_GITHUB_PAGES_DEMO_FILE)
            && fs.existsSync(TestConstants.DIST_GITHUB_PAGES_API_FILE);
    }

    static async ensureBuildExists() {
        if (GithubPagesBuildProbe.isBuildPresent()) {
            return;
        }

        const awaitedCode = 0;
        const buildResult = await NpmTestRunner.runOneShot(
            'build:dist-github-pages',
            TestConstants.PROJECT_ROOT
        );

        assert.equal(
            buildResult.exitCode,
            awaitedCode,
            [
                'Pre-build for the serve smoke test failed.',
                buildResult.stdout,
                buildResult.stderr
            ].join(TestConstants.NEWLINE_CHAR)
        );
    }
}

const activeProcessFixture = new ActiveProcessFixture();
afterEach(async () => await activeProcessFixture.stopIfRunning());

test("Serve smoke: direct 'http-server' process should start the local GitHub pages site", {
    timeout: TestConstants.DEFAULT_SERVE_SMOKE_TEST_TIMEOUT_MS
}, async () => {

    // Arrange
    const awaitedHttpCode = 200;
    await GithubPagesBuildProbe.ensureBuildExists();
    assert.ok(fs.existsSync(TestConstants.HTTP_SERVER_BIN_PATH), `http-server binary was not found: ${TestConstants.HTTP_SERVER_BIN_PATH}`);

    // Act
    const activeProcess = DirectProcessRunner.start(
        process.execPath,
        [
            TestConstants.HTTP_SERVER_BIN_PATH,
            TestConstants.DIST_GITHUB_PAGES_DIR,
            '-p', TestConstants.DEFAULT_SERVE_PORT,
            TestConstants.DISABLE_HTTP_SERVER_CACHE_CONTROL
        ],
        TestConstants.PROJECT_ROOT,
        TestConstants.DEFAULT_HTTP_SERVER_EXECUTABLE
    );

    activeProcessFixture.set(activeProcess);

    const rootResponse  = await activeProcess.waitUntilHttpOk(`${TestConstants.DEFAULT_SERVE_URL}/`);
    const demosResponse = await activeProcess.waitUntilHttpOk(`${TestConstants.DEFAULT_SERVE_URL}/demos/materials.html`);
    const apiResponse   = await activeProcess.waitUntilHttpOk(`${TestConstants.DEFAULT_SERVE_URL}/api/`);
    const rootHtml      = await rootResponse.text();
    await demosResponse.arrayBuffer();
    await apiResponse.arrayBuffer();

    // Assert
    assert.equal(rootResponse.status  , awaitedHttpCode);
    assert.equal(demosResponse.status , awaitedHttpCode);
    assert.equal(apiResponse.status   , awaitedHttpCode);
    assert.match(rootHtml, /API reference/i);
    assert.match(rootHtml, /materials/i);
});

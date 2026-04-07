import { spawn }                             from 'node:child_process';
import assert                                from 'node:assert/strict';
import { TestConstants, TestProcessSignals } from './test-constants.js';

export class NpmCommandResult {
    constructor(exitCode, stdout, stderr) {
        this.exitCode = exitCode;
        this.stdout   = stdout;
        this.stderr   = stderr;
    }
}

export class RunningChildProcess {
    constructor(childProcess, processName) {
        this.childProcess = childProcess;
        this.processName  = processName;
        this.stdout       = TestConstants.EMPTY_STRING_CHAR;
        this.stderr       = TestConstants.EMPTY_STRING_CHAR;

        if (childProcess.stdout) {
            childProcess.stdout.on('data', (chunk) => this.stdout += String(chunk));
        }

        if (childProcess.stderr) {
            childProcess.stderr.on('data', (chunk) => this.stderr += String(chunk));
        }
    }

    async waitUntilHttpOk(url, timeoutMs = TestConstants.DEFAULT_STARTUP_TIMEOUT_MS) {
        const startTimestamp = Date.now();

        while ((Date.now() - startTimestamp) < timeoutMs) {
            if (this.childProcess.exitCode !== null) {
                throw new Error([
                    `Process "${this.processName}" exited too early with the code ${this.childProcess.exitCode}.`,
                    this.stdout,
                    this.stderr
                ].join(TestConstants.NEWLINE_CHAR));
            }

            try {
                const response = await fetch(url, {
                    signal: AbortSignal.timeout(TestConstants.DEFAULT_HTTP_TIMEOUT_MS)
                });

                if (response.ok) {
                    return response;
                }

                await response.arrayBuffer();
            } catch { }

            await AsyncProcessUtils.delay(TestConstants.DEFAULT_HTTP_POLL_INTERVAL_MS);
        }

        throw new Error([
            `Timed out, while waiting for the 200 HTTP response code from: ${url}`,
            this.stdout,
            this.stderr
        ].join(TestConstants.NEWLINE_CHAR));
    }

    async stop() {
        if (this.childProcess.exitCode !== null) {
            return;
        }

        try {
            this.childProcess.kill(TestProcessSignals.TERMINATE);
        } catch {
            return;
        }

        await Promise.race([
            AsyncProcessUtils.onceProcessClosed(this.childProcess),
            AsyncProcessUtils.delay(TestConstants.DEFAULT_PROCESS_SHUTDOWN_TIMEOUT_MS)
        ]);

        if (this.childProcess.exitCode !== null) {
            return;
        }

        try {
            this.childProcess.kill(TestProcessSignals.KILL);
        } catch {
            return;
        }

        await AsyncProcessUtils.onceProcessClosed(this.childProcess);
    }
}

export class NpmTestRunner {
    static async runOneShot(scriptName, projectRoot) {
        assert.ok(scriptName  , 'Script name must be provided.');
        assert.ok(projectRoot , 'Project root must be provided.');

        return await new Promise((resolve, reject) => {
            const childProcess = spawn(TestConstants.NPM_EXECUTABLE, ['run', scriptName], {
                cwd   : projectRoot,
                stdio : ['ignore', 'pipe', 'pipe']
            });

            let stdout = TestConstants.EMPTY_STRING_CHAR;
            let stderr = TestConstants.EMPTY_STRING_CHAR;
            childProcess.stdout.on('data', (chunk) => stdout += String(chunk));
            childProcess.stderr.on('data', (chunk) => stderr += String(chunk));
            childProcess.on('error', reject);
            childProcess.on('close', (exitCode) => resolve(new NpmCommandResult(exitCode ?? TestConstants.UNKNOWN_EXIT_CODE, stdout, stderr)));
        });
    }
}

export class DirectProcessRunner {
    static start(command, args, projectRoot, processName = command) {
        assert.ok(command             , 'Command must be provided.');
        assert.ok(Array.isArray(args) , 'Args must be provided as an array.');
        assert.ok(projectRoot         , 'Project root must be provided.');

        const childProcess = spawn(command, args, {
            cwd   : projectRoot,
            stdio : ['ignore', 'pipe', 'pipe']
        });

        return new RunningChildProcess(childProcess, processName);
    }
}

export class AsyncProcessUtils {
    static onceProcessClosed(childProcess) {
        return new Promise((resolve) => childProcess.once('close', () => resolve()));
    }

    static delay(timeoutMs) {
        return new Promise((resolve) => setTimeout(resolve, timeoutMs));
    }
}

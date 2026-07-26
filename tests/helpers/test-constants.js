import path              from 'node:path';
import { fileURLToPath } from 'node:url';

const PROJECT_ROOT_VALUE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

export const TestConstants = Object.freeze({
    UNKNOWN_EXIT_CODE                   : -1,
    EMPTY_STRING_CHAR                   : '',
    NEWLINE_CHAR                        : '\n',
    DEFAULT_LOCALHOST_ADDRESS           : '127.0.0.1',
    DEFAULT_SERVE_PORT                  : '9090',
    DEFAULT_SERVE_URL                   : 'http://127.0.0.1:9090',
    DEFAULT_STARTUP_TIMEOUT_MS          : 15000,
    DEFAULT_HTTP_TIMEOUT_MS             : 2000,
    DEFAULT_HTTP_POLL_INTERVAL_MS       : 250,
    DEFAULT_PROCESS_SHUTDOWN_TIMEOUT_MS : 3000,
    DEFAULT_SERVE_SMOKE_TEST_TIMEOUT_MS : 60000,
    DEFAULT_EPSILON_VALUE               : 1e-6,
    DEFAULT_HTTP_SERVER_EXECUTABLE      : 'http-server',
    DIST_GITHUB_PAGES_DIR               : 'dist-github-pages',
    DIST_GITHUB_PAGES_INDEX_FILE        : 'dist-github-pages/index.html',
    DIST_GITHUB_PAGES_DEMO_FILE         : 'dist-github-pages/demos/materials.html',
    DIST_GITHUB_PAGES_API_FILE          : 'dist-github-pages/api/index.html',
    NPM_EXECUTABLE                      : process.platform === 'win32' ? 'npm.cmd' : 'npm',
    DISABLE_HTTP_SERVER_CACHE_CONTROL   : '-c-1',
    PROJECT_ROOT                        : PROJECT_ROOT_VALUE,
    HTTP_SERVER_BIN_PATH                : path.join(PROJECT_ROOT_VALUE, 'node_modules', 'http-server', 'bin', 'http-server')
});

export const TestEnvs = Object.freeze({
    CI       : 'CI',
    NODE_ENV : 'NODE_ENV'
});

export const TestProcessSignals = Object.freeze({
    TERMINATE : 'SIGTERM',
    KILL      : 'SIGKILL'
});

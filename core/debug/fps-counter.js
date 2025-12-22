/**
 * Default label used by the counter header.
 *
 * @type {string}
 */
const DEFAULT_LABEL = 'performance';

/**
 * Default DOM update interval in milliseconds.
 *
 * @type {number}
 */
const DEFAULT_UPDATE_INTERVAL_MS = 250;

/**
 * Default exponential smoothing factor.
 *
 * @type {number}
 */
const DEFAULT_SMOOTHING_FACTOR = 0.15;

/**
 * Minimum allowed update interval.
 *
 * @type {number}
 */
const MIN_UPDATE_INTERVAL_MS = 16;

/**
 * Inclusive lower bound for a [0..1] range value.
 *
 * @type {number}
 */
const MIN_NORMALIZED = 0;

/**
 * Inclusive upper bound for a [0..1] range value.
 *
 * @type {number}
 */
const MAX_NORMALIZED = 1;

/**
 * Default FPS threshold considered `good`.
 *
 * @type {number}
 */
const DEFAULT_GOOD_FPS_THRESHOLD = 55;

/**
 * Default FPS threshold considered `ok`.
 *
 * @type {number}
 */
const DEFAULT_OK_FPS_THRESHOLD = 30;

/**
 * DOM element tag name used by the counter.
 *
 * @type {string}
 */
const DIV_TAG_NAME = 'div';

/**
 * Placeholder text shown before the first measurement.
 *
 * @type {string}
 */
const PLACEHOLDER_TEXT = '--';

/**
 * FPS row label.
 *
 * @type {string}
 */
const FPS_ROW_LABEL = 'FPS';

/**
 * Frame time row label (milliseconds).
 *
 * @type {string}
 */
const FRAME_TIME_ROW_LABEL = 'MS';

/**
 * Amount of milliseconds in one second.
 *
 * @type {number}
 */
const MILLISECONDS_PER_SECOND = 1000;

/**
 * A guard value used by divisions to avoid a zero denominator.
 *
 * @type {number}
 */
const MIN_DENOMINATOR = 1;

/**
 * A numeric constant used for clamping values to a non-negative range.
 *
 * @type {number}
 */
const NON_NEGATIVE_MIN = 0;

/**
 * Initial frame counter value.
 *
 * @type {number}
 */
const INITIAL_FRAMES_SINCE_LAST_UPDATE = 0;

/**
 * Initial accumulated time value.
 *
 * @type {number}
 */
const INITIAL_ACCUMULATED_FRAME_TIME_MS = 0;

/**
 * Frame count increment used for each recorded frame.
 *
 * @type {number}
 */
const FRAMES_INCREMENT = 1;

/**
 * Fallback FPS returned by `FpsCounter#end`, when a value is not yet available.
 *
 * @type {number}
 */
const FPS_FALLBACK_VALUE = 0;

/**
 * Number of digits used by `Number#toFixed` to format frame time values.
 *
 * @type {number}
 */
const FRAME_TIME_DECIMAL_PLACES = 1;

/**
 * Role attribute value for the root element.
 *
 * @type {string}
 */
const ARIA_ROLE_STATUS = 'status';

/**
 * Attribute value used to announce updates politely.
 *
 * @type {string}
 */
const ARIA_LIVE_POLITE = 'polite';

/**
 * Root element CSS class.
 *
 * @type {string}
 */
const ROOT_CLASS = 'gwFpsCounter';

/**
 * Root element state class used, when FPS is in the `good` range.
 *
 * @type {string}
 */
const STATE_CLASS_GOOD = 'gwFpsCounter-good';

/**
 * Root element state class used, when FPS is in the `ok` range.
 *
 * @type {string}
 */
const STATE_CLASS_OK = 'gwFpsCounter-ok';

/**
 * Root element state class used, when FPS is in the `bad` range.
 *
 * @type {string}
 */
const STATE_CLASS_BAD = 'gwFpsCounter-bad';

/**
 * Header CSS class.
 *
 * @type {string}
 */
const HEADER_CLASS = 'gwFpsCounterHeader';

/**
 * Row CSS class.
 *
 * @type {string}
 */
const ROW_CLASS = 'gwFpsCounterRow';

/**
 * Label CSS class.
 *
 * @type {string}
 */
const ROW_LABEL_CLASS = 'gwFpsCounterRowLabel';

/**
 * Value CSS class.
 *
 * @type {string}
 */
const ROW_VALUE_CLASS = 'gwFpsCounterRowValue';

/**
 * Indicates that the counter has not yet computed a value.
 *
 * @type {number}
 */
const UNINITIALIZED_NUMBER = -1;

/**
 * Default flag that enables frame time (ms) display.
 *
 * @type {boolean}
 */
const DEFAULT_SHOW_FRAME_TIME = true;

/**
 * Options used by `FpsCounter`.
 *
 * @typedef {Object} FpsCounterOptions
 * @property {string}  [label = 'Performance']  - Short title shown at the top of the panel.
 * @property {number}  [updateIntervalMs = 250] - DOM refresh interval (ms). Values are computed every frame.
 * @property {number}  [smoothingFactor = 0.15] - Exponential smoothing factor in [0..1].
 * @property {boolean} [showFrameTime = true]   - When true, also shows the average frame time in milliseconds.
 * @property {number}  [goodFpsThreshold = 55]  - FPS value that should be considered `good`.
 * @property {number}  [okFpsThreshold   = 30]  - FPS value that should be considered `ok`.
 */

/**
 * Small DOM-based FPS counter intended for demos and debugging.
 */
export class FpsCounter {

    /**
     * Root DOM element.
     *
     * @type {HTMLElement}
     * @private
     */
    #domElement;

    /**
     * DOM element, that shows the FPS value.
     *
     * @type {HTMLElement}
     * @private
     */
    #fpsValueElement;

    /**
     * DOM element, that shows the frame time value (ms).
     *
     * @type {HTMLElement | null}
     * @private
     */
    #frameTimeValueElement;

    /**
     * DOM refresh interval in milliseconds.
     *
     * @type {number}
     * @private
     */
    #updateIntervalMs;

    /**
     * Exponential smoothing factor in [0..1].
     *
     * @type {number}
     * @private
     */
    #smoothingFactor;

    /**
     * When true, frame time (ms) is displayed.
     *
     * @type {boolean}
     * @private
     */
    #showFrameTime;

    /**
     * FPS value considered `good`.
     *
     * @type {number}
     * @private
     */
    #goodFpsThreshold;

    /**
     * FPS value considered `ok`.
     *
     * @type {number}
     * @private
     */
    #okFpsThreshold;

    /**
     * Frame start timestamp (ms).
     *
     * @type {number}
     * @private
     */
    #frameStartTimeMs = UNINITIALIZED_NUMBER;

    /**
     * Timestamp (ms) of the last DOM refresh.
     *
     * @type {number}
     * @private
     */
    #lastUpdateTimeMs = UNINITIALIZED_NUMBER;

    /**
     * Number of frames since the last DOM refresh.
     *
     * @type {number}
     * @private
     */
    #framesSinceLastUpdate = INITIAL_FRAMES_SINCE_LAST_UPDATE;

    /**
     * Accumulated frame time in milliseconds since the last DOM refresh.
     *
     * @type {number}
     * @private
     */
    #accumulatedFrameTimeMs = INITIAL_ACCUMULATED_FRAME_TIME_MS;

    /**
     * Smoothed FPS value.
     *
     * @type {number}
     * @private
     */
    #smoothedFps = UNINITIALIZED_NUMBER;

    /**
     * Smoothed frame time (ms).
     *
     * @type {number}
     * @private
     */
    #smoothedFrameTimeMs = UNINITIALIZED_NUMBER;

    /**
     * @param {FpsCounterOptions} [options] - Counter options.
     */
    constructor(options = {}) {
        if (options === null || typeof options !== 'object' || Array.isArray(options)) {
            throw new TypeError('`FpsCounter` expects an options object (plain object).');
        }

        const {
            label            = DEFAULT_LABEL,
            updateIntervalMs = DEFAULT_UPDATE_INTERVAL_MS,
            smoothingFactor  = DEFAULT_SMOOTHING_FACTOR,
            showFrameTime    = DEFAULT_SHOW_FRAME_TIME,
            goodFpsThreshold = DEFAULT_GOOD_FPS_THRESHOLD,
            okFpsThreshold   = DEFAULT_OK_FPS_THRESHOLD
        } = options;

        if (typeof label !== 'string') {
            throw new TypeError('`FpsCounter` option `label` must be a string.');
        }

        if (typeof updateIntervalMs !== 'number' || updateIntervalMs < MIN_UPDATE_INTERVAL_MS) {
            throw new RangeError(`\`FpsCounter\` option \`updateIntervalMs\` must be a number >= ${MIN_UPDATE_INTERVAL_MS}.`);
        }

        if (typeof smoothingFactor !== 'number' || smoothingFactor < MIN_NORMALIZED || smoothingFactor > MAX_NORMALIZED) {
            throw new RangeError('`FpsCounter` option `smoothingFactor` must be a number in [0..1].');
        }

        if (typeof showFrameTime !== 'boolean') {
            throw new TypeError('`FpsCounter` option `showFrameTime` must be a boolean.');
        }

        if (typeof goodFpsThreshold !== 'number' || goodFpsThreshold <= NON_NEGATIVE_MIN) {
            throw new RangeError('`FpsCounter` option `goodFpsThreshold` must be a positive number.');
        }

        if (typeof okFpsThreshold !== 'number' || okFpsThreshold <= NON_NEGATIVE_MIN) {
            throw new RangeError('`FpsCounter` option `okFpsThreshold` must be a positive number.');
        }

        if (okFpsThreshold > goodFpsThreshold) {
            throw new RangeError('`FpsCounter` options must satisfy: `okFpsThreshold <= goodFpsThreshold`.');
        }

        if (typeof document === 'undefined') {
            throw new Error('`FpsCounter` requires a browser environment with `document` available.');
        }

        this.#updateIntervalMs = updateIntervalMs;
        this.#smoothingFactor  = smoothingFactor;
        this.#showFrameTime    = showFrameTime;
        this.#goodFpsThreshold = goodFpsThreshold;
        this.#okFpsThreshold   = okFpsThreshold;

        this.#domElement           = document.createElement(DIV_TAG_NAME);
        this.#domElement.className = `${ROOT_CLASS} ${STATE_CLASS_GOOD}`;
        this.#domElement.setAttribute('role'      , ARIA_ROLE_STATUS);
        this.#domElement.setAttribute('aria-live' , ARIA_LIVE_POLITE);

        const headerElement       = document.createElement(DIV_TAG_NAME);
        headerElement.className   = HEADER_CLASS;
        headerElement.textContent = label;
        this.#domElement.appendChild(headerElement);

        const fpsRow          = FpsCounter.#createRow(FPS_ROW_LABEL, PLACEHOLDER_TEXT);
        this.#fpsValueElement = fpsRow.valueElement;
        this.#domElement.appendChild(fpsRow.rowElement);

        if (this.#showFrameTime) {
            const frameTimeRow = FpsCounter.#createRow(FRAME_TIME_ROW_LABEL, PLACEHOLDER_TEXT);
            this.#frameTimeValueElement = frameTimeRow.valueElement;
            this.#domElement.appendChild(frameTimeRow.rowElement);
        } else {
            this.#frameTimeValueElement = null;
        }
    }

    /** @returns {HTMLElement} */
    get domElement() {
        return this.#domElement;
    }

    /**
     * Marks the beginning of a frame.
     */
    begin() {
        this.#frameStartTimeMs = performance.now();
    }

    /**
     * Marks the end of a frame.
     *
     * @returns {number} - Latest smoothed FPS value.
     */
    end() {
        const nowMs            = performance.now();
        const frameStartTimeMs = (this.#frameStartTimeMs === UNINITIALIZED_NUMBER) ? nowMs : this.#frameStartTimeMs;
        const frameTimeMs      = Math.max(NON_NEGATIVE_MIN, nowMs - frameStartTimeMs);

        this.#recordFrame(frameTimeMs, nowMs);
        this.#frameStartTimeMs = nowMs;

        return (this.#smoothedFps === UNINITIALIZED_NUMBER) ? FPS_FALLBACK_VALUE : this.#smoothedFps;
    }

    /**
     * Updates the counter using a known delta time.
     *
     * @param {number} deltaTimeSeconds - Time since previous frame in seconds.
     */
    update(deltaTimeSeconds) {
        if (typeof deltaTimeSeconds !== 'number' || !Number.isFinite(deltaTimeSeconds) || deltaTimeSeconds < NON_NEGATIVE_MIN) {
            throw new TypeError('`FpsCounter.update` expects a non-negative finite number (seconds).');
        }

        const deltaTimeMs = deltaTimeSeconds * MILLISECONDS_PER_SECOND;
        this.#recordFrame(deltaTimeMs, performance.now());
    }

    /**
     * Resets internal counters and UI.
     */
    reset() {
        this.#frameStartTimeMs            = UNINITIALIZED_NUMBER;
        this.#lastUpdateTimeMs            = UNINITIALIZED_NUMBER;
        this.#framesSinceLastUpdate       = INITIAL_FRAMES_SINCE_LAST_UPDATE;
        this.#accumulatedFrameTimeMs      = INITIAL_ACCUMULATED_FRAME_TIME_MS;
        this.#smoothedFps                 = UNINITIALIZED_NUMBER;
        this.#smoothedFrameTimeMs         = UNINITIALIZED_NUMBER;
        this.#fpsValueElement.textContent = PLACEHOLDER_TEXT;

        if (this.#frameTimeValueElement) {
            this.#frameTimeValueElement.textContent = PLACEHOLDER_TEXT;
        }

        this.#applyStateClass(STATE_CLASS_GOOD);
    }

    /**
     * Records a single frame measurement.
     *
     * @param {number} frameTimeMs - Frame time in milliseconds.
     * @param {number} nowMs       - Current timestamp in milliseconds.
     * @private
     */
    #recordFrame(frameTimeMs, nowMs) {
        if (this.#lastUpdateTimeMs === UNINITIALIZED_NUMBER) {
            this.#lastUpdateTimeMs = nowMs;
        }

        this.#framesSinceLastUpdate  += FRAMES_INCREMENT;
        this.#accumulatedFrameTimeMs += frameTimeMs;

        const elapsedMs = nowMs - this.#lastUpdateTimeMs;

        if (elapsedMs < this.#updateIntervalMs) {
            return;
        }

        const fps            = (this.#framesSinceLastUpdate * MILLISECONDS_PER_SECOND) / Math.max(MIN_DENOMINATOR, elapsedMs);
        const avgFrameTimeMs = this.#accumulatedFrameTimeMs / Math.max(MIN_DENOMINATOR, this.#framesSinceLastUpdate);

        this.#smoothedFps            = this.#smoothValue(this.#smoothedFps, fps);
        this.#smoothedFrameTimeMs    = this.#smoothValue(this.#smoothedFrameTimeMs, avgFrameTimeMs);
        this.#updateDom();
        this.#lastUpdateTimeMs       = nowMs;
        this.#framesSinceLastUpdate  = INITIAL_FRAMES_SINCE_LAST_UPDATE;
        this.#accumulatedFrameTimeMs = INITIAL_ACCUMULATED_FRAME_TIME_MS;
    }

    /**
     * @param {number} currentValue - Current smoothed value or `UNINITIALIZED_NUMBER`.
     * @param {number} nextValue    - New measurement.
     * @returns {number}            - Smoothed value computed using exponential moving average.
     * @private
     */
    #smoothValue(currentValue, nextValue) {
        if (currentValue === UNINITIALIZED_NUMBER) {
            return nextValue;
        }

        return currentValue + (nextValue - currentValue) * this.#smoothingFactor;
    }

    /**
     * Updates the UI using current smoothed values.
     *
     * @private
     */
    #updateDom() {
        const fps = this.#smoothedFps;
        const frameTimeMs = this.#smoothedFrameTimeMs;
        this.#fpsValueElement.textContent = String(Math.round(fps));

        if (this.#frameTimeValueElement) {
            this.#frameTimeValueElement.textContent = frameTimeMs.toFixed(FRAME_TIME_DECIMAL_PLACES);
        }

        if (fps >= this.#goodFpsThreshold) {
            this.#applyStateClass(STATE_CLASS_GOOD);
        } else if (fps >= this.#okFpsThreshold) {
            this.#applyStateClass(STATE_CLASS_OK);
        } else {
            this.#applyStateClass(STATE_CLASS_BAD);
        }
    }

    /**
     * Applies one of the state classes to the root element.
     *
     * @param {string} nextStateClass - One of: `STATE_CLASS_GOOD/OK/BAD`.
     * @private
     */
    #applyStateClass(nextStateClass) {
        this.#domElement.classList.remove(STATE_CLASS_GOOD, STATE_CLASS_OK, STATE_CLASS_BAD);
        this.#domElement.classList.add(ROOT_CLASS, nextStateClass);
    }

    /**
     * @param {string} labelText        - Left label string.
     * @param {string} initialValueText - Initial value text.
     * @returns {{ rowElement: HTMLElement, valueElement: HTMLElement }}
     * @private
     */
    static #createRow(labelText, initialValueText) {
        const rowElement     = document.createElement(DIV_TAG_NAME);
        rowElement.className = ROW_CLASS;

        const labelElement       = document.createElement(DIV_TAG_NAME);
        labelElement.className   = ROW_LABEL_CLASS;
        labelElement.textContent = labelText;

        const valueElement       = document.createElement(DIV_TAG_NAME);
        valueElement.className   = ROW_VALUE_CLASS;
        valueElement.textContent = initialValueText;
        rowElement.appendChild(labelElement);
        rowElement.appendChild(valueElement);
        return { rowElement, valueElement };
    }
}

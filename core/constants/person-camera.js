/**
 * Shared operating modes for first-person and third-person cameras.
 *
 * @readonly
 * @enum {number}
 */
export const PERSON_CAMERA_MODES = Object.freeze({
    NORMAL  : 0,
    BOBBING : 1
});

/**
 * Supported camera mode values used for validation.
 *
 * @type {ReadonlyArray<number>}
 */
export const PERSON_CAMERA_ALLOWED_MODES = Object.freeze(
    Object.values(PERSON_CAMERA_MODES)
);

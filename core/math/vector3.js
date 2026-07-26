import * as MathConstants from '../constants/math.js';

/**
 * 3D vector with the observable 'x, y, z' components.
 * Invokes an optional 'onChange' callback, when any component changes.
 */
export class Vector3 {
    /** @type {number} */
    #x;

    /** @type {number} */
    #y;

    /** @type {number} */
    #z;

    /** @type {Function | null} */
    #onChange;

    /**
     * @param {number} [x = 0] - X component.
     * @param {number} [y = 0] - Y component.
     * @param {number} [z = 0] - Z component.
     * @param {Function | null} [onChange = null] - Called, when any component changes.
     */
    constructor(
        x = MathConstants.MATH_VECTOR3_COMPONENTS.ZERO,
        y = MathConstants.MATH_VECTOR3_COMPONENTS.ZERO,
        z = MathConstants.MATH_VECTOR3_COMPONENTS.ZERO,
        onChange = null
    ) {
        if (onChange !== null && typeof onChange !== 'function') {
            throw new TypeError('Vector3 constructor expects `onChange` as a function or null.');
        }

        this.#x = MathConstants.MATH_VECTOR3_COMPONENTS.ZERO;
        this.#y = MathConstants.MATH_VECTOR3_COMPONENTS.ZERO;
        this.#z = MathConstants.MATH_VECTOR3_COMPONENTS.ZERO;
        this.#onChange = onChange;
        this.set(x, y, z);
    }

    /**
     * Creates a new (0, 0, 0) vector.
     *
     * @param {Function | null} [onChange = null] - Optional callback invoked, when the vector changes.
     * @returns {Vector3}                         - New vector with all components set to zero.
     */
    static createZero(onChange = null) {
        return new Vector3(
            MathConstants.MATH_VECTOR3_COMPONENTS.ZERO,
            MathConstants.MATH_VECTOR3_COMPONENTS.ZERO,
            MathConstants.MATH_VECTOR3_COMPONENTS.ZERO,
            onChange
        );
    }

    /**
     * Creates a new (1, 1, 1) vector.
     *
     * This value is commonly used as a unit scale vector.
     *
     * @param {Function | null} [onChange = null] - Optional callback invoked, when the vector changes.
     * @returns {Vector3}                         - New vector with all components set to one.
     */
    static createUnitScale(onChange = null) {
        return new Vector3(
            MathConstants.MATH_VECTOR3_COMPONENTS.UNIT,
            MathConstants.MATH_VECTOR3_COMPONENTS.UNIT,
            MathConstants.MATH_VECTOR3_COMPONENTS.UNIT,
            onChange
        );
    }

    /**
     * @returns {number} - The current X component value.
     */
    get x() {
        return this.#x;
    }

    /**
     * @param {number} value - New X component value.
     */
    set x(value) {
        Vector3.#assertNumber(value, 'x');

        if (value === this.#x) {
            return;
        }

        this.#x = value;
        this.#emitChange();
    }

    /**
     * @returns {number} - The current Y component value.
     */
    get y() {
        return this.#y;
    }

    /**
     * @param {number} value - New Y component value.
     */
    set y(value) {
        Vector3.#assertNumber(value, 'y');

        if (value === this.#y) {
            return;
        }

        this.#y = value;
        this.#emitChange();
    }

    /**
     * @returns {number} - The current Z component value.
     */
    get z() {
        return this.#z;
    }

    /**
     * @param {number} value - New Z component value.
     */
    set z(value) {
        Vector3.#assertNumber(value, 'z');

        if (value === this.#z) {
            return;
        }

        this.#z = value;
        this.#emitChange();
    }

    /**
     * Sets all components at once.
     * Calls onChange at most once.
     *
     * @param {number} x  - New X component value.
     * @param {number} y  - New Y component value.
     * @param {number} z  - New Z component value.
     * @returns {Vector3} - This vector instance (for chaining).
     */
    set(x, y, z) {
        Vector3.#assertNumber(x, 'x');
        Vector3.#assertNumber(y, 'y');
        Vector3.#assertNumber(z, 'z');

        const changed = (x !== this.#x) || (y !== this.#y) || (z !== this.#z);
        this.#x = x;
        this.#y = y;
        this.#z = z;

        if (changed) {
            this.#emitChange();
        }

        return this;
    }

    /**
     * Copies components from another `Vector3`.
     *
     * @param {Vector3} other - Source vector to copy components from.
     * @returns {Vector3}     - This vector instance after copying components from the source vector (for chaining).
     */
    copyFrom(other) {
        if (!(other instanceof Vector3)) {
            throw new TypeError('Vector3.copyFrom expects a Vector3 instance.');
        }

        return this.set(other.x, other.y, other.z);
    }

    /**
     * Sets or clears the 'onChange' callback.
     *
     * @param {Function | null} onChange - Callback invoked, when any component changes or null to disable the change notifications.
     * @returns {Vector3}                - This vector instance (for chaining).
     */
    setOnChange(onChange) {
        if (onChange !== null && typeof onChange !== 'function') {
            throw new TypeError('Vector3.setOnChange expects a function or null.');
        }

        this.#onChange = onChange;
        return this;
    }

    /**
     * Emits the change notification, when a callback is registered.
     *
     * @private
     */
    #emitChange() {
        if (this.#onChange) {
            this.#onChange();
        }
    }

    /**
     * @param {number} value - Value to validate (must be a number and not NaN).
     * @param {string} name  - Component name used in error messages.
     * @private
     */
    static #assertNumber(value, name) {
        if (typeof value !== 'number' || Number.isNaN(value)) {
            throw new TypeError(`Vector3 component "${name}" must be a valid number.`);
        }
    }
}

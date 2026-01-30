import { Object3D }           from '../scene/object3d.js';
import { Line }               from '../scene/line.js';
import { Vector3 }            from '../math/vector3.js';
import { PolylineGeometry }   from '../geometry/polyline-geometry.js';
import { SolidColorMaterial } from '../material/solid-color-material.js';
import { DirectionalLight }   from '../light/directional-light.js';

/**
 * Default visibility state.
 *
 * @type {boolean}
 */
const DEFAULT_VISIBLE = true;

/**
 * Zero value constant.
 *
 * @type {number}
 */
const ZERO_VALUE = 0;

/**
 * Opacity used, when the gizmo is visible.
 *
 * @type {number}
 */
const VISIBLE_OPACITY = 1.0;

/**
 * Opacity used, when the gizmo is hidden.
 *
 * @type {number}
 */
const HIDDEN_OPACITY = 0.0;

/**
 * Position marker half-length.
 *
 * @type {number}
 */
const MARKER_HALF_SIZE = 0.4;

/**
 * Direction arrow length.
 *
 * @type {number}
 */
const ARROW_LENGTH = 2.0;

/**
 * Arrow head length.
 *
 * @type {number}
 */
const ARROW_HEAD_LENGTH = 0.5;

/**
 * Arrow head half-width.
 *
 * @type {number}
 */
const ARROW_HEAD_HALF_WIDTH = 0.25;

/**
 * Marker color (RGB).
 *
 * @type {Float32Array}
 */
const MARKER_COLOR = new Float32Array([0.35, 0.9, 1.0]);

/**
 * Arrow color (RGB).
 *
 * @type {Float32Array}
 */
const ARROW_COLOR = new Float32Array([1.0, 0.9, 0.2]);

/**
 * Error message for the invalid WebGL2 context.
 *
 * @type {string}
 */
const ERROR_WEBGL_CONTEXT_TYPE = '`LightGizmo` expects `WebGL2RenderingContext`.';

/**
 * Error message for the invalid light.
 *
 * @type {string}
 */
const ERROR_LIGHT_TYPE = '`LightGizmo` expects a `DirectionalLight` instance.';

/**
 * Error message for the invalid visibility values.
 *
 * @type {string}
 */
const ERROR_VISIBLE_TYPE = '`LightGizmo.setVisible` expects a boolean.';

/**
 * Visual helper for the directional lights.
 *
 * Note: materials/shaders treat the light direction as a vector pointing `towards` the light,
 * while the gizmo arrow shows the opposite direction (where the light rays travel).
 */
export class LightGizmo extends Object3D {

    /**
     * Target directional light.
     *
     * @type {DirectionalLight}
     * @private
     */
    #light;

    /**
     * Line materials, used by the gizmo.
     *
     * @type {SolidColorMaterial[]}
     * @private
     */
    #materials = [];

    /**
     * Current visibility state.
     *
     * @type {boolean}
     * @private
     */
    #visible = DEFAULT_VISIBLE;

    /**
     * Creates a new LightGizmo instance.
     *
     * @param {WebGL2RenderingContext} webglContext - WebGL2 rendering context.
     * @param {DirectionalLight} light              - Target directional light.
     * @throws {TypeError} When the inputs are invalid.
     */
    constructor(webglContext, light) {
        super();

        if (!(webglContext instanceof WebGL2RenderingContext)) {
            throw new TypeError(ERROR_WEBGL_CONTEXT_TYPE);
        }

        if (!(light instanceof DirectionalLight)) {
            throw new TypeError(ERROR_LIGHT_TYPE);
        }

        this.#light = light;
        this.#buildMarker(webglContext);
        this.#buildArrow(webglContext);
        this.setVisible(DEFAULT_VISIBLE);
    }

    /**
     * Sets gizmo visibility.
     *
     * @param {boolean} visible - Whether the gizmo should be visible.
     * @returns {void}
     * @throws {TypeError} When the visibility flag is invalid.
     */
    setVisible(visible) {
        if (typeof visible !== 'boolean') {
            throw new TypeError(ERROR_VISIBLE_TYPE);
        }

        this.#visible = visible;
        const opacity = this.#visible ? VISIBLE_OPACITY : HIDDEN_OPACITY;

        for (const material of this.#materials) {
            material.setOpacity(opacity);
        }
    }

    /**
     * Returns the target directional light.
     *
     * @returns {DirectionalLight} - The directional light instance, tracked by this gizmo.
     */
    get light() {
        return this.#light;
    }

    /**
     * Builds the position marker lines.
     *
     * @param {WebGL2RenderingContext} webglContext - WebGL2 rendering context.
     * @returns {void}
     * @private
     */
    #buildMarker(webglContext) {
        const markerMaterial = new SolidColorMaterial(webglContext, { color: MARKER_COLOR });
        this.#materials.push(markerMaterial);

        const xStart = new Vector3(-MARKER_HALF_SIZE, ZERO_VALUE, ZERO_VALUE);
        const xEnd   = new Vector3(MARKER_HALF_SIZE, ZERO_VALUE, ZERO_VALUE);
        this.add(this.#createLine(webglContext, markerMaterial, [xStart, xEnd]));

        const yStart = new Vector3(ZERO_VALUE, -MARKER_HALF_SIZE, ZERO_VALUE);
        const yEnd   = new Vector3(ZERO_VALUE, MARKER_HALF_SIZE, ZERO_VALUE);
        this.add(this.#createLine(webglContext, markerMaterial, [yStart, yEnd]));

        const zStart = new Vector3(ZERO_VALUE, ZERO_VALUE, -MARKER_HALF_SIZE);
        const zEnd   = new Vector3(ZERO_VALUE, ZERO_VALUE, MARKER_HALF_SIZE);
        this.add(this.#createLine(webglContext, markerMaterial, [zStart, zEnd]));
    }

    /**
     * Builds the direction arrow lines.
     * The arrow points opposite to the shader light direction (where the light shines),
     * while `DirectionalLight.getDirection()` still returns the `towards light` vector.
     *
     * @param {WebGL2RenderingContext} webglContext - WebGL2 rendering context.
     * @returns {void}
     * @private
     */
    #buildArrow(webglContext) {
        const arrowMaterial = new SolidColorMaterial(webglContext, { color: ARROW_COLOR });
        this.#materials.push(arrowMaterial);

        const shaftStart = new Vector3(ZERO_VALUE, ZERO_VALUE, ZERO_VALUE);
        const shaftEnd   = new Vector3(ZERO_VALUE, ZERO_VALUE, -ARROW_LENGTH);
        this.add(this.#createLine(webglContext, arrowMaterial, [shaftStart, shaftEnd]));

        const headBaseZ = -ARROW_LENGTH + ARROW_HEAD_LENGTH;
        const headLeft  = new Vector3(-ARROW_HEAD_HALF_WIDTH, ZERO_VALUE, headBaseZ);
        const headTip   = new Vector3(ZERO_VALUE, ZERO_VALUE, -ARROW_LENGTH);
        const headRight = new Vector3(ARROW_HEAD_HALF_WIDTH, ZERO_VALUE, headBaseZ);
        this.add(this.#createLine(webglContext, arrowMaterial, [headLeft, headTip, headRight]));
    }

    /**
     * Creates a line mesh from positions and adds it to this gizmo.
     *
     * @param {WebGL2RenderingContext} webglContext - WebGL2 rendering context.
     * @param {SolidColorMaterial} material         - Material to use.
     * @param {Vector3[]} positions                 - Line positions.
     * @returns {Line}
     * @private
     */
    #createLine(webglContext, material, positions) {
        const geometry = new PolylineGeometry(webglContext, { positions });
        return new Line(geometry, material);
    }
}

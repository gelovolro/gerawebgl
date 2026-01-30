import { Object3D }           from '../scene/object3d.js';
import { Line }               from '../scene/line.js';
import { Mesh }               from '../scene/mesh.js';
import { Vector3 }            from '../math/vector3.js';
import { PolylineGeometry }   from '../geometry/polyline-geometry.js';
import { BoxGeometry }        from '../geometry/box-geometry.js';
import { SphereGeometry }     from '../geometry/sphere-geometry.js';
import { SolidColorMaterial } from '../material/solid-color-material.js';

/**
 * Default visibility state.
 *
 * @type {boolean}
 */
const DEFAULT_VISIBLE = true;

/**
 * Opacity used, when the gizmo is hidden.
 *
 * @type {number}
 */
const HIDDEN_OPACITY = 0.0;

/**
 * Opacity, used for pick volumes (always hidden).
 *
 * @type {number}
 */
const PICK_OPACITY = 0.0;

/**
 * Opacity, used for idle axes.
 *
 * @type {number}
 */
const AXIS_IDLE_OPACITY = 1.0;

/**
 * Opacity, used for hovered axes.
 *
 * @type {number}
 */
const AXIS_HOVER_OPACITY = 0.8;

/**
 * Opacity, used for active axes.
 *
 * @type {number}
 */
const AXIS_ACTIVE_OPACITY = 1.0;

/**
 * Opacity, used for inactive axes when hover/active is set.
 *
 * @type {number}
 */
const AXIS_INACTIVE_OPACITY = 0.35;

/**
 * Opacity, used to fully hide axes while another axis is active.
 *
 * @type {number}
 */
const AXIS_HIDDEN_OPACITY_WHEN_ACTIVE = 0.0;

/**
 * Axis length for the gizmo.
 *
 * @type {number}
 */
const AXIS_LENGTH = 2.5;

/**
 * Axis arrow head length.
 *
 * @type {number}
 */
const AXIS_HEAD_LENGTH = 0.45;

/**
 * Axis arrow head half-width.
 *
 * @type {number}
 */
const AXIS_HEAD_HALF_WIDTH = 0.25;

/**
 * Axis pick volume thickness.
 *
 * @type {number}
 */
const AXIS_PICK_THICKNESS = 0.35;

/**
 * Axis pick volume length.
 *
 * @type {number}
 */
const AXIS_PICK_LENGTH = AXIS_LENGTH;

/**
 * Divider used to place pick volumes in the middle of the axis.
 *
 * @type {number}
 */
const AXIS_PICK_CENTER_DIVISOR = 2.0;

/**
 * Zero value constant.
 *
 * @type {number}
 */
const ZERO_VALUE = 0.0;

/**
 * Axis identifier for X.
 *
 * @type {string}
 */
const AXIS_X = 'x';

/**
 * Axis identifier for Y.
 *
 * @type {string}
 */
const AXIS_Y = 'y';

/**
 * Axis identifier for Z.
 *
 * @type {string}
 */
const AXIS_Z = 'z';

/**
 * X axis color (RGB).
 *
 * @type {Float32Array}
 */
const AXIS_X_COLOR = new Float32Array([1.0, 0.4, 0.4]);

/**
 * Y axis color (RGB).
 *
 * @type {Float32Array}
 */
const AXIS_Y_COLOR = new Float32Array([0.4, 1.0, 0.6]);

/**
 * Z axis color (RGB).
 *
 * @type {Float32Array}
 */
const AXIS_Z_COLOR = new Float32Array([0.4, 0.6, 1.0]);

/**
 * Center sphere radius.
 *
 * @type {number}
 */
const CENTER_SPHERE_RADIUS = 0.15;

/**
 * Multiplier, used to convert radius to diameter.
 *
 * @type {number}
 */
const CENTER_SPHERE_DIAMETER_MULTIPLIER = 2.0;

/**
 * Center sphere diameter.
 *
 * @type {number}
 */
const CENTER_SPHERE_DIAMETER = CENTER_SPHERE_RADIUS * CENTER_SPHERE_DIAMETER_MULTIPLIER;

/**
 * Center sphere longitudinal segment count.
 *
 * @type {number}
 */
const CENTER_SPHERE_WIDTH_SEGMENTS = 12;

/**
 * Center sphere latitudinal segment count.
 *
 * @type {number}
 */
const CENTER_SPHERE_HEIGHT_SEGMENTS = 8;

/**
 * Center sphere color (RGB).
 *
 * @type {Float32Array}
 */
const CENTER_SPHERE_COLOR = new Float32Array([1.0, 1.0, 1.0]);

/**
 * Center sphere opacity, when visible.
 *
 * @type {number}
 */
const CENTER_SPHERE_OPACITY = 0.8;

/**
 * Error message for invalid WebGL2 context.
 *
 * @type {string}
 */
const ERROR_WEBGL_CONTEXT_TYPE = '`TransformGizmo` expects a `WebGL2RenderingContext`.';

/**
 * Error message for invalid target object.
 *
 * @type {string}
 */
const ERROR_TARGET_TYPE = '`TransformGizmo` expects an `Object3D` target.';

/**
 * Error message for invalid visibility values.
 *
 * @type {string}
 */
const ERROR_VISIBLE_TYPE = '`TransformGizmo.setVisible` expects a boolean.';

/**
 * Error message for invalid axis values.
 *
 * @type {string}
 */
const ERROR_AXIS_TYPE = '`TransformGizmo.setActiveAxis` expects (x, y, z) or null.';

/**
 * Error message for invalid hovered axis values.
 *
 * @type {string}
 */
const ERROR_HOVER_AXIS_TYPE = '`TransformGizmo.setHoveredAxis` expects (x, y, z) or null.';

/**
 * Error message for invalid mesh values.
 *
 * @type {string}
 */
const ERROR_AXIS_MESH_TYPE = '`TransformGizmo.getAxisForMesh` expects a `Mesh` instance.';

/**
 * Error message for invalid options object.
 *
 * @type {string}
 */
const ERROR_OPTIONS_TYPE = '`TransformGizmo` expects `options` as a plain object.';

/**
 * Unit direction for X axis.
 *
 * @type {number[]}
 */
const AXIS_DIR_X = [1.0, 0.0, 0.0];

/**
 * Unit direction for Y axis.
 *
 * @type {number[]}
 */
const AXIS_DIR_Y = [0.0, 1.0, 0.0];

/**
 * Unit direction for Z axis.
 *
 * @type {number[]}
 */
const AXIS_DIR_Z = [0.0, 0.0, 1.0];

/**
 * Ortho direction for X axis arrow head (drawn in XY plane).
 *
 * @type {number[]}
 */
const AXIS_HEAD_ORTHO_X = AXIS_DIR_Y;

/**
 * Ortho direction for Y axis arrow head (drawn in XY plane).
 *
 * @type {number[]}
 */
const AXIS_HEAD_ORTHO_Y = AXIS_DIR_X;

/**
 * Ortho direction for Z axis arrow head (drawn in XZ plane).
 *
 * @type {number[]}
 */
const AXIS_HEAD_ORTHO_Z = AXIS_DIR_X;

/**
 * Axis-aligned transform gizmo with the pickable axis volumes.
 */
export class TransformGizmo extends Object3D {

    /**
     * Target object, that the gizmo follows.
     *
     * @type {Object3D}
     * @private
     */
    #targetObject;

    /**
     * Materials used by the axis lines.
     *
     * @type {Map<string, SolidColorMaterial>}
     * @private
     */
    #axisMaterials = new Map();

    /**
     * Pick volume materials (hidden).
     *
     * @type {SolidColorMaterial}
     * @private
     */
    #pickMaterial;

    /**
     * Center sphere material.
     *
     * @type {SolidColorMaterial}
     * @private
     */
    #centerMaterial;

    /**
     * Center sphere mesh.
     *
     * @type {Mesh}
     * @private
     */
    #centerMesh;

    /**
     * Axis pick meshes mapped to axis identifiers.
     *
     * @type {Map<Mesh, string>}
     * @private
     */
    #pickMeshAxisMap = new Map();

    /**
     * Current visibility state.
     *
     * @type {boolean}
     * @private
     */
    #visible = DEFAULT_VISIBLE;

    /**
     * Currently active axis (if any).
     *
     * @type {string | null}
     * @private
     */
    #activeAxis = null;

    /**
     * Currently hovered axis (if any).
     *
     * @type {string | null}
     * @private
     */
    #hoveredAxis = null;

    /**
     * Creates a new TransformGizmo instance.
     *
     * @param {WebGL2RenderingContext} webglContext - WebGL2 rendering context.
     * @param {Object3D} targetObject               - Target object to attach the gizmo to.
     * @param {Object} [options]                    - Optional settings (reserved for future use).
     * @throws {TypeError} When inputs are invalid.
     */
    constructor(webglContext, targetObject, options = {}) {
        super();

        if (!(webglContext instanceof WebGL2RenderingContext)) {
            throw new TypeError(ERROR_WEBGL_CONTEXT_TYPE);
        }

        if (!(targetObject instanceof Object3D)) {
            throw new TypeError(ERROR_TARGET_TYPE);
        }

        if (options === null || typeof options !== 'object' || Array.isArray(options)) {
            throw new TypeError(ERROR_OPTIONS_TYPE);
        }

        this.#pickMaterial = new SolidColorMaterial(webglContext, { color: AXIS_X_COLOR });
        this.#pickMaterial.setOpacity(PICK_OPACITY);
        this.#buildAxes(webglContext);
        this.#buildCenterSphere(webglContext);
        this.setTarget(targetObject);
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
        this.#applyAxisVisuals();
    }

    /**
     * Returns current visibility state.
     *
     * @returns {boolean} - The current visibility state of the gizmo.
     */
    isVisible() {
        return this.#visible;
    }

    /**
     * Updates the gizmo target and reparents this object.
     *
     * @param {Object3D} targetObject - Target object to attach the gizmo to.
     * @returns {void}
     * @throws {TypeError} When the target object is invalid.
     */
    setTarget(targetObject) {
        if (!(targetObject instanceof Object3D)) {
            throw new TypeError(ERROR_TARGET_TYPE);
        }

        if (this.parent) {
            this.parent.remove(this);
        }

        this.#targetObject = targetObject;
        this.#targetObject.add(this);
    }

    /**
     * Returns the currently active axis (if set).
     *
     * @returns {string | null} - The currently active axis id (x, y, z) or null, if no axis is active.
     */
    getActiveAxis() {
        return this.#activeAxis;
    }

    /**
     * Sets the active axis identifier.
     *
     * @param {string | null} axis - Axis id (x, y, z) or null.
     * @returns {void}
     * @throws {TypeError} When the axis value is invalid.
     */
    setActiveAxis(axis) {
        if (axis !== null && axis !== AXIS_X && axis !== AXIS_Y && axis !== AXIS_Z) {
            throw new TypeError(ERROR_AXIS_TYPE);
        }

        if (this.#activeAxis !== null && axis !== null && axis !== this.#activeAxis) {
            return;
        }

        this.#activeAxis = axis;
        this.#applyAxisVisuals();
    }

    /**
     * Sets the hovered axis identifier.
     *
     * @param {string | null} axis - Axis id (x, y, z) or null.
     * @returns {void}
     * @throws {TypeError} When the axis value is invalid.
     */
    setHoveredAxis(axis) {
        if (axis !== null && axis !== AXIS_X && axis !== AXIS_Y && axis !== AXIS_Z) {
            throw new TypeError(ERROR_HOVER_AXIS_TYPE);
        }

        if (this.#activeAxis !== null) {
            return;
        }

        this.#hoveredAxis = axis;
        this.#applyAxisVisuals();
    }

    /**
     * Clears hovered/active state and restores the default visuals.
     *
     * @returns {void}
     */
    clearState() {
        this.#hoveredAxis = null;
        this.#activeAxis  = null;
        this.#applyAxisVisuals();
    }

    /**
     * Returns the axis identifier for a pick mesh.
     *
     * @param {Mesh} mesh       - Pick the mesh instance.
     * @returns {string | null} - The axis id (x, y, z) for the provided pick mesh or null, if the mesh is not mapped to an axis.
     * @throws {TypeError} When the mesh input is invalid.
     */
    getAxisForMesh(mesh) {
        if (!(mesh instanceof Mesh)) {
            throw new TypeError(ERROR_AXIS_MESH_TYPE);
        }

        return this.#pickMeshAxisMap.get(mesh) ?? null;
    }

    /**
     * Builds the axes lines and arrow heads.
     *
     * @param {WebGL2RenderingContext} webglContext - WebGL2 rendering context.
     * @returns {void}
     * @private
     */
    #buildAxes(webglContext) {
        this.#buildAxisX(webglContext);
        this.#buildAxisY(webglContext);
        this.#buildAxisZ(webglContext);
    }

    /**
     * Builds the center sphere marker.
     *
     * @param {WebGL2RenderingContext} webglContext - WebGL2 rendering context.
     * @returns {void}
     * @private
     */
    #buildCenterSphere(webglContext) {
        const geometry = new SphereGeometry(webglContext, {
            width          : CENTER_SPHERE_DIAMETER,
            height         : CENTER_SPHERE_DIAMETER,
            depth          : CENTER_SPHERE_DIAMETER,
            widthSegments  : CENTER_SPHERE_WIDTH_SEGMENTS,
            heightSegments : CENTER_SPHERE_HEIGHT_SEGMENTS
        });

        const material = new SolidColorMaterial(webglContext, { color: CENTER_SPHERE_COLOR });
        material.setOpacity(CENTER_SPHERE_OPACITY);

        const mesh           = new Mesh(geometry, material);
        this.#centerMaterial = material;
        this.#centerMesh     = mesh;
        this.add(mesh);
    }

    /**
     * Builds a single axis line, arrow head and pick volume.
     *
     * @param {WebGL2RenderingContext} webglContext - WebGL2 rendering context.
     * @param {string} axis                         - Axis identifier.
     * @param {Float32Array} color                  - Axis color.
     * @param {number[]} dir                        - Unit axis direction (X/Y/Z).
     * @param {number[]} headOrtho                  - Unit orthogonal direction for arrow head width.
     * @returns {void}
     * @private
     */
    #buildAxis(webglContext, axis, color, dir, headOrtho) {
        const material = new SolidColorMaterial(webglContext, { color });
        this.#axisMaterials.set(axis, material);

        // Main axis line:
        const start = new Vector3(ZERO_VALUE, ZERO_VALUE, ZERO_VALUE);
        const end   = new Vector3(
            dir[0] * AXIS_LENGTH,
            dir[1] * AXIS_LENGTH,
            dir[2] * AXIS_LENGTH
        );
        this.add(this.#createLine(webglContext, material, [start, end]));

        // Arrow head (V shape):
        const headBaseLength = AXIS_LENGTH - AXIS_HEAD_LENGTH;

        const headBase = new Vector3(
            dir[0] * headBaseLength,
            dir[1] * headBaseLength,
            dir[2] * headBaseLength
        );

        const headTip = new Vector3(
            dir[0] * AXIS_LENGTH,
            dir[1] * AXIS_LENGTH,
            dir[2] * AXIS_LENGTH
        );

        const headLeft = new Vector3(
            headBase.x + (headOrtho[0] * -AXIS_HEAD_HALF_WIDTH),
            headBase.y + (headOrtho[1] * -AXIS_HEAD_HALF_WIDTH),
            headBase.z + (headOrtho[2] * -AXIS_HEAD_HALF_WIDTH)
        );

        const headRight = new Vector3(
            headBase.x + (headOrtho[0] * AXIS_HEAD_HALF_WIDTH),
            headBase.y + (headOrtho[1] * AXIS_HEAD_HALF_WIDTH),
            headBase.z + (headOrtho[2] * AXIS_HEAD_HALF_WIDTH)
        );

        this.add(this.#createLine(webglContext, material, [headLeft, headTip, headRight]));
        this.#addPickMesh(webglContext, axis);
    }

    #buildAxisX(webglContext) {
        this.#buildAxis(webglContext, AXIS_X, AXIS_X_COLOR, AXIS_DIR_X, AXIS_HEAD_ORTHO_X);
    }

    #buildAxisY(webglContext) {
        this.#buildAxis(webglContext, AXIS_Y, AXIS_Y_COLOR, AXIS_DIR_Y, AXIS_HEAD_ORTHO_Y);
    }

    #buildAxisZ(webglContext) {
        this.#buildAxis(webglContext, AXIS_Z, AXIS_Z_COLOR, AXIS_DIR_Z, AXIS_HEAD_ORTHO_Z);
    }

    /**
     * Adds a pick mesh for the given axis.
     *
     * @param {WebGL2RenderingContext} webglContext - WebGL2 rendering context.
     * @param {string} axis                         - Axis identifier.
     * @returns {void}
     * @private
     */
    #addPickMesh(webglContext, axis) {
        const geometry = new BoxGeometry(webglContext, {
            width  : axis === AXIS_X ? AXIS_PICK_LENGTH : AXIS_PICK_THICKNESS,
            height : axis === AXIS_Y ? AXIS_PICK_LENGTH : AXIS_PICK_THICKNESS,
            depth  : axis === AXIS_Z ? AXIS_PICK_LENGTH : AXIS_PICK_THICKNESS
        });

        const mesh = new Mesh(geometry, this.#pickMaterial, { ownsMaterial: false });

        switch (axis) {
            case AXIS_X:
                mesh.position.x = AXIS_PICK_LENGTH / AXIS_PICK_CENTER_DIVISOR;
                break;
            case AXIS_Y:
                mesh.position.y = AXIS_PICK_LENGTH / AXIS_PICK_CENTER_DIVISOR;
                break;
            case AXIS_Z:
                mesh.position.z = AXIS_PICK_LENGTH / AXIS_PICK_CENTER_DIVISOR;
                break;
            default:
                throw new Error(`Unknown axis: ${axis}`);
        }

        this.add(mesh);
        this.#pickMeshAxisMap.set(mesh, axis);
    }

    /**
     * Creates a line mesh from positions.
     *
     * @param {WebGL2RenderingContext} webglContext - WebGL2 rendering context.
     * @param {SolidColorMaterial} material         - Material to use.
     * @param {Vector3[]} positions                 - Line positions.
     * @returns {Line}                              - A new line object, built from the provided positions and material.
     * @private
     */
    #createLine(webglContext, material, positions) {
        const geometry = new PolylineGeometry(webglContext, { positions });
        return new Line(geometry, material);
    }

    /**
     * Updates the axis materials based on current hover/active state.
     *
     * @returns {void}
     * @private
     */
    #applyAxisVisuals() {
        const isVisible   = this.#visible;
        const activeAxis  = this.#activeAxis;
        const hoveredAxis = this.#hoveredAxis;

        for (const [axis, material] of this.#axisMaterials.entries()) {
            let opacity = HIDDEN_OPACITY;

            if (isVisible) {
                if (activeAxis) {
                    opacity = axis === activeAxis ? AXIS_ACTIVE_OPACITY : AXIS_HIDDEN_OPACITY_WHEN_ACTIVE;
                } else if (hoveredAxis) {
                    opacity = axis === hoveredAxis ? AXIS_HOVER_OPACITY : AXIS_INACTIVE_OPACITY;
                } else {
                    opacity = AXIS_IDLE_OPACITY;
                }
            }

            material.setOpacity(opacity);
        }

        if (this.#centerMesh && this.#centerMaterial) {
            this.#centerMaterial.setOpacity(isVisible ? CENTER_SPHERE_OPACITY : HIDDEN_OPACITY);
        }
    }
}

import { Matrix4 }      from '../math/matrix4.js';
import { Object3D }     from '../scene/object3d.js';
import { Mesh }         from '../scene/mesh.js';
import { Scene }        from '../scene/scene.js';
import { Camera }       from '../scene/camera.js';
import { WebGLContext } from '../webgl-context.js';
import {
    PRIMITIVE_TRIANGLES,
    PRIMITIVE_LINES,
    PRIMITIVE_LINE_STRIP,
    PRIMITIVE_LINE_LOOP,
    PRIMITIVE_POINTS
} from '../geometry/geometry.js';

/**
 * Byte offset passed to `webglRenderingContext.drawElements()` call.
 * Indices always start at the beginning of the currently bound index buffer.
 *
 * @type {number}
 */
const INDEX_BUFFER_OFFSET_BYTES = 0;

/**
 * Element count for a 4x4 matrix stored in a flat array.
 * Used for allocating reusable `Float32Array(16)` buffers.
 *
 * @type {number}
 */
const MATRIX_4x4_ELEMENT_COUNT = 16;

/**
 * Element count for a 3D vector stored in a flat array (x, y, z).
 * Used for allocating reusable `Float32Array(3)` buffers (e.g. camera position).
 *
 * @type {number}
 */
const VECTOR3_ELEMENT_COUNT = 3;

/**
 * Opacity value that is considered fully opaque.
 *
 * @type {number}
 */
const OPAQUE_OPACITY = 1.0;

/**
 * `Material.apply()` parameter count, when it expects: finalMatrix, worldMatrix.
 *
 * @type {number}
 */
const MATERIAL_APPLY_WORLD_MATRIX_PARAM_COUNT = 2;

/**
 * `Material.apply()` parameter count when it expects: finalMatrix, worldMatrix, worldInverseTransposeMatrix.
 *
 * @type {number}
 */
const MATERIAL_APPLY_WORLD_INVERSE_TRANSPOSE_PARAM_COUNT = 3;

/**
 * `Material.apply()` parameter count when it expects:
 * finalMatrix, worldMatrix, worldInverseTransposeMatrix, cameraPosition.
 *
 * @type {number}
 */
const MATERIAL_APPLY_CAMERA_POSITION_PARAM_COUNT = 4;

/**
 * Error message used, when geometry primitive is unknown.
 *
 * @type {string}
 */
const ERROR_UNKNOWN_PRIMITIVE = 'Renderer received an unknown geometry primitive.';

/**
 * Canvas resize options for WebGLContext.resizeToDisplaySize().
 *
 * @typedef {Object} ResizeToDisplaySizeOptions
 * @property {boolean} [fitToWindow] - If true, resizes canvas to match the window size.
 */

/**
 * High-level renderer, that draws a scene from the perspective of a camera.
 * Keeps per-frame allocations minimal (reuse matrices, reuse traversal callback).
 */
export class Renderer {

    /**
     * Wrapper around the underlying WebGL2 rendering context.
     * @type {WebGLContext}
     * @private
     */
    #contextWrapper;

    /**
     * Raw WebGL2 rendering context.
     * @type {WebGL2RenderingContext}
     * @private
     */
    #webglRenderingContext;

    /**
     * Reused buffer for the view-projection matrix.
     * @type {Float32Array}
     * @private
     */
    #viewProjectionMatrix;

    /**
     * Reused buffer for the per-mesh final matrix (viewProjection * world).
     * @type {Float32Array}
     * @private
     */
    #finalMatrix;

    /**
     * Reused buffer for per-mesh inverse world matrix (world ^ -1).
     * Only computed when the current material requires normal-matrix support.
     *
     * @type {Float32Array}
     * @private
     */
    #worldMatrixInverse;

    /**
     * Reused buffer for per-mesh world inverse transpose matrix ((world ^ -1) ^ T).
     * Used for correct normal transformation under non-uniform scale.
     * Only computed when the current material requires normal-matrix support.
     *
     * @type {Float32Array}
     * @private
     */
    #worldInverseTransposeMatrix;

    /**
     * Reused buffer for the camera position of the current frame.
     *
     * @type {Float32Array}
     * @private
     */
    #cameraPosition;

    /**
     * Reference to the view-projection matrix of the current frame.
     * This is a pointer to a reused `Float32Array`.
     *
     * @type {Float32Array}
     * @private
     */
    #frameViewProjectionMatrix;

    /**
     * Reference to the camera position of the current frame.
     * This is a pointer to a reused `Float32Array`.
     *
     * @type {Float32Array}
     * @private
     */
    #frameCameraPosition;

    /**
     * Cached traversal callback to avoid allocating an inline function every frame.
     *
     * @type {function(Object3D): void}
     * @private
     */
    #traverseCallback;

    /**
     * @param {WebGLContext} webglContext - Wrapper around the underlying WebGL2 rendering context.
     */
    constructor(webglContext) {
        if (!(webglContext instanceof WebGLContext)) {
            throw new TypeError('Renderer expects a WebGLContext instance.');
        }

        this.#contextWrapper              = webglContext;
        this.#webglRenderingContext       = webglContext.context;
        this.#viewProjectionMatrix        = new Float32Array(MATRIX_4x4_ELEMENT_COUNT);
        this.#finalMatrix                 = new Float32Array(MATRIX_4x4_ELEMENT_COUNT);
        this.#worldMatrixInverse          = new Float32Array(MATRIX_4x4_ELEMENT_COUNT);
        this.#worldInverseTransposeMatrix = new Float32Array(MATRIX_4x4_ELEMENT_COUNT);
        this.#cameraPosition              = new Float32Array(VECTOR3_ELEMENT_COUNT);
        this.#frameViewProjectionMatrix   = this.#viewProjectionMatrix;
        this.#frameCameraPosition         = this.#cameraPosition;

        // Allocate the traverse callback once (no per-frame function allocations):
        this.#traverseCallback = (x) => this.#renderVisitedObject(x);
    }

    /**
     * Renders the given scene from the point of view of the given camera.
     *
     * @param {Scene} scene                                - Scene graph containing all objects that should be rendered.
     * @param {Camera} camera                              - Camera defining view and projection used for rendering.
     * @param {ResizeToDisplaySizeOptions} [resizeOptions] - Optional canvas resize options.
     */
    render(scene, camera, resizeOptions) {
        if (!(scene instanceof Scene)) {
            throw new TypeError('`Renderer.render` expects a `Scene` instance.');
        }

        if (!(camera instanceof Camera)) {
            throw new TypeError('`Renderer.render` expects a `Camera` derived-instance.');
        }

        const renderingContext = this.#webglRenderingContext;
        this.#contextWrapper.resizeToDisplaySize(resizeOptions);
        this.#contextWrapper.clear();

        const canvas      = renderingContext.canvas;
        const aspectRatio = canvas.width / canvas.height;
        camera.setAspectRatio(aspectRatio);

        const projectionMatrix = camera.getProjectionMatrix();
        const viewMatrix       = camera.getViewMatrix();

        this.#frameViewProjectionMatrix = Matrix4.multiplyTo(
            this.#viewProjectionMatrix,
            projectionMatrix,
            viewMatrix
        );

        const cameraPosition      = camera.position;
        this.#cameraPosition[0]   = cameraPosition.x;
        this.#cameraPosition[1]   = cameraPosition.y;
        this.#cameraPosition[2]   = cameraPosition.z;
        this.#frameCameraPosition = this.#cameraPosition;
        scene.updateWorldMatrix(null);
        scene.traverse(this.#traverseCallback);
    }

    /**
     * Renders a single visited scene node during traversal.
     *
     * @param {Object3D} visitedObject - Visited scene node (only `Mesh` instances are rendered, they're childs from `Object3D`).
     * @private
     */
    #renderVisitedObject(visitedObject) {
        if (!(visitedObject instanceof Object3D)) {
            return;
        }

        if (!(visitedObject instanceof Mesh)) {
            return;
        }

        const mesh = visitedObject;

        if (mesh.isDisposed) {
            return;
        }

        const renderingContext = this.#webglRenderingContext;
        const geometry         = mesh.geometry;
        const material         = mesh.material;
        const worldMatrix      = mesh.worldMatrix;
        Matrix4.multiplyTo(
            this.#finalMatrix,
            this.#frameViewProjectionMatrix,
            worldMatrix
        );

        material.use();
        const materialOpacity = material.opacity;
        const isTransparent   = materialOpacity < OPAQUE_OPACITY;

        if (isTransparent) {
            renderingContext.enable(renderingContext.BLEND);
            renderingContext.blendFunc(renderingContext.SRC_ALPHA, renderingContext.ONE_MINUS_SRC_ALPHA);
            renderingContext.depthMask(false);
        } else {
            renderingContext.disable(renderingContext.BLEND);
            renderingContext.depthMask(true);
        }

        const applyParameterCount = material.apply.length;
        const wantsWorldMatrix    = applyParameterCount >= MATERIAL_APPLY_WORLD_MATRIX_PARAM_COUNT;
        const wantsNormalMatrix   = applyParameterCount >= MATERIAL_APPLY_WORLD_INVERSE_TRANSPOSE_PARAM_COUNT;
        const wantsCameraPosition = applyParameterCount >= MATERIAL_APPLY_CAMERA_POSITION_PARAM_COUNT;

        if (!wantsWorldMatrix) {
            material.apply(this.#finalMatrix);
        } else if (!wantsNormalMatrix) {
            material.apply(this.#finalMatrix, worldMatrix);
        } else {
            Matrix4.invertTo(this.#worldMatrixInverse, worldMatrix);
            Matrix4.transposeTo(this.#worldInverseTransposeMatrix, this.#worldMatrixInverse);

            if (!wantsCameraPosition) {
                material.apply(this.#finalMatrix, worldMatrix, this.#worldInverseTransposeMatrix);
            } else {
                material.apply(this.#finalMatrix, worldMatrix, this.#worldInverseTransposeMatrix, this.#frameCameraPosition);
            }
        }

        geometry.bind();
        const isWireframeEnabled = material.isWireframeEnabled();
        geometry.bindIndexBuffer(isWireframeEnabled);

        const primitive  = geometry.getPrimitive(isWireframeEnabled);
        const mode       = resolvePrimitiveMode(renderingContext, primitive);
        const indexCount = geometry.getIndexCount(isWireframeEnabled);
        renderingContext.drawElements(
            mode,
            indexCount,
            geometry.getIndexComponentType(isWireframeEnabled),
            INDEX_BUFFER_OFFSET_BYTES
        );
    }
}

/**
 * Maps engine primitive constants to the WebGL draw modes.
 *
 * @param {WebGL2RenderingContext} renderingContext - WebGL2 rendering context.
 * @param {string} primitive                        - Geometry primitive name.
 * @returns {number}                                - WebGL draw mode constant.
 */
function resolvePrimitiveMode(renderingContext, primitive) {
    switch (primitive) {
        case PRIMITIVE_TRIANGLES:
            return renderingContext.TRIANGLES;
        case PRIMITIVE_LINES:
            return renderingContext.LINES;
        case PRIMITIVE_LINE_STRIP:
            return renderingContext.LINE_STRIP;
        case PRIMITIVE_LINE_LOOP:
            return renderingContext.LINE_LOOP;
        case PRIMITIVE_POINTS:
            return renderingContext.POINTS;
        default:
            throw new Error(ERROR_UNKNOWN_PRIMITIVE);
    }
}

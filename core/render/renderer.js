import { Matrix4 }           from '../math/matrix4.js';
import { Object3D }          from '../scene/object3d.js';
import { Mesh }              from '../scene/mesh.js';
import { Scene }             from '../scene/scene.js';
import { PerspectiveCamera } from '../scene/camera.js';
import { WebGLContext }      from '../webgl-context.js';

/** @type {number} */
const INDEX_BUFFER_OFFSET_BYTES = 0;

/** @type {number} */
const MATRIX_4x4_ELEMENT_COUNT = 16;

/**
 * Canvas resize options for WebGLContext.resizeToDisplaySize().
 *
 * @typedef {Object} ResizeToDisplaySizeOptions
 * @property {boolean} [fitToWindow] - If true, resizes canvas to match the window size.
 */

/**
 * High-level renderer that draws a scene from the perspective of a camera.
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
     * Reference to the view-projection matrix of the current frame.
     * This is a pointer to a reused Float32Array (no allocations per frame).
     *
     * @type {Float32Array}
     * @private
     */
    #frameViewProjectionMatrix;

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

        this.#contextWrapper            = webglContext;
        this.#webglRenderingContext     = webglContext.context;
        this.#viewProjectionMatrix      = new Float32Array(MATRIX_4x4_ELEMENT_COUNT);
        this.#finalMatrix               = new Float32Array(MATRIX_4x4_ELEMENT_COUNT);
        this.#frameViewProjectionMatrix = this.#viewProjectionMatrix;

        // Allocate the traverse callback once (no per-frame function allocations):
        this.#traverseCallback = (x) => this.#renderVisitedObject(x);
    }

    /**
     * Renders the given scene from the point of view of the given camera.
     *
     * @param {Scene} scene                                - Scene graph containing all objects that should be rendered.
     * @param {PerspectiveCamera} camera                   - Camera defining view and projection used for rendering.
     * @param {ResizeToDisplaySizeOptions} [resizeOptions] - Optional canvas resize options.
     */
    render(scene, camera, resizeOptions) {
        if (!(scene instanceof Scene)) {
            throw new TypeError('Renderer.render expects a Scene instance.');
        }

        if (!(camera instanceof PerspectiveCamera)) {
            throw new TypeError('Renderer.render expects a PerspectiveCamera instance.');
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
        material.apply(this.#finalMatrix);
        geometry.bind();

        const isWireframeEnabled = material.isWireframeEnabled();
        geometry.bindIndexBuffer(isWireframeEnabled);

        const mode       = isWireframeEnabled ? renderingContext.LINES : renderingContext.TRIANGLES;
        const indexCount = geometry.getIndexCount(isWireframeEnabled);

        renderingContext.drawElements(
            mode,
            indexCount,
            renderingContext.UNSIGNED_SHORT,
            INDEX_BUFFER_OFFSET_BYTES
        );
    }
}

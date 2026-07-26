import * as MathConstants             from '../constants/math.js';
import * as RendererConstants         from '../constants/renderer.js';
import * as RendererExceptionMessages from '../exception-messages/renderer.js';
import { Matrix4 }                    from '../math/matrix4.js';
import { Object3D }                   from '../scene/object3d.js';
import { Mesh }                       from '../scene/mesh.js';
import { Scene }                      from '../scene/scene.js';
import { Camera }                     from '../scene/camera.js';
import { WebGLContext }               from '../webgl-context.js';
import { DirectionalLightMaterial }   from '../material/directional-light-material.js';
import { DirectionalLight }           from '../light/directional-light.js';
import { AmbientLight }               from '../light/ambient-light.js';
import {
    PRIMITIVE_TRIANGLES,
    PRIMITIVE_LINES,
    PRIMITIVE_LINE_STRIP,
    PRIMITIVE_LINE_LOOP,
    PRIMITIVE_POINTS
} from '../geometry/geometry.js';

/**
 * Canvas resize options for `WebGLContext.resizeToDisplaySize()`.
 *
 * @typedef {Object} ResizeToDisplaySizeOptions
 * @property {boolean} [fitToWindow] - If true, resizes the canvas to match the window size.
 */

/**
 * High-level renderer that draws a scene from the perspective of a camera.
 * Keeps per-frame allocations minimal by reusing matrices and the traversal callback.
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
     * Reused stack for the light search traversal.
     *
     * @type {Object3D[]}
     * @private
     */
    #lightSearchStack;

    /**
     * Cached active directional light for the current frame.
     *
     * @type {DirectionalLight | null}
     * @private
     */
    #activeDirectionalLight = null;

    /**
     * Cached active ambient light for the current frame.
     *
     * @type {AmbientLight | null}
     * @private
     */
    #activeAmbientLight = null;

    /**
     * @param {WebGLContext} webglContext - Wrapper around the underlying WebGL2 rendering context.
     */
    constructor(webglContext) {
        if (!(webglContext instanceof WebGLContext)) {
            throw new TypeError('Renderer expects a WebGLContext instance.');
        }

        this.#contextWrapper              = webglContext;
        this.#webglRenderingContext       = this.#contextWrapper.context;
        this.#viewProjectionMatrix        = new Float32Array(MathConstants.MATH_LAYOUT.MATRIX_4X4_ELEMENT_COUNT);
        this.#finalMatrix                 = new Float32Array(MathConstants.MATH_LAYOUT.MATRIX_4X4_ELEMENT_COUNT);
        this.#worldMatrixInverse          = new Float32Array(MathConstants.MATH_LAYOUT.MATRIX_4X4_ELEMENT_COUNT);
        this.#worldInverseTransposeMatrix = new Float32Array(MathConstants.MATH_LAYOUT.MATRIX_4X4_ELEMENT_COUNT);
        this.#cameraPosition              = new Float32Array(MathConstants.MATH_LAYOUT.VECTOR3_ELEMENT_COUNT);
        this.#frameViewProjectionMatrix   = this.#viewProjectionMatrix;
        this.#frameCameraPosition         = this.#cameraPosition;
        this.#lightSearchStack            = [];

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

        scene.updateWorldMatrix({ parentWorldMatrix: null });
        this.#findActiveLights(scene);
        scene.traverse(this.#traverseCallback);
    }

    /**
     * Renders a single visited scene node during traversal.
     *
     * Only `Mesh` instances are rendered. Other `Object3D` nodes are skipped.
     *
     * @param {Object3D} visitedObject - Visited scene node.
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

        if (material instanceof DirectionalLightMaterial) {
            if (this.#activeDirectionalLight) {
                material.setLightDirection(this.#activeDirectionalLight.getDirection());
                material.setDirectionalStrength(this.#activeDirectionalLight.getStrength());
            }

            if (this.#activeAmbientLight) {
                material.setAmbientStrength(this.#activeAmbientLight.getStrength());
            }
        }

        material.use();
        const materialOpacity = material.opacity;
        const isTransparent   = materialOpacity < RendererConstants.RENDERER_OPACITY.OPAQUE_THRESHOLD;

        if (isTransparent) {
            renderingContext.enable(renderingContext.BLEND);
            renderingContext.blendFunc(renderingContext.SRC_ALPHA, renderingContext.ONE_MINUS_SRC_ALPHA);
            renderingContext.depthMask(false);
        } else {
            renderingContext.disable(renderingContext.BLEND);
            renderingContext.depthMask(true);
        }

        const applyParameterCount = material.apply.length;
        const wantsWorldMatrix    = applyParameterCount >= RendererConstants.RENDERER_MATERIAL_APPLY_PARAM_COUNTS.WORLD_MATRIX;
        const wantsNormalMatrix   = applyParameterCount >= RendererConstants.RENDERER_MATERIAL_APPLY_PARAM_COUNTS.WORLD_INVERSE_TRANSPOSE;
        const wantsCameraPosition = applyParameterCount >= RendererConstants.RENDERER_MATERIAL_APPLY_PARAM_COUNTS.CAMERA_POSITION;

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
            RendererConstants.RENDERER_DRAW.INDEX_BUFFER_OFFSET_BYTES
        );
    }

    /**
     * Finds the active lights for the current frame.
     *
     * @param {Scene} scene - Scene to search.
     * @returns {void}
     * @private
     */
    #findActiveLights(scene) {
        this.#activeDirectionalLight = null;
        this.#activeAmbientLight     = null;

        const stack  = this.#lightSearchStack;
        stack.length = RendererConstants.RENDERER_TRAVERSAL.STACK_EMPTY_LENGTH;
        stack.push(scene);

        while (
            stack.length > RendererConstants.RENDERER_TRAVERSAL.STACK_EMPTY_LENGTH
            && (this.#activeDirectionalLight === null || this.#activeAmbientLight === null)
        ) {
            const node = stack.pop();

            if (this.#activeDirectionalLight === null
                && node instanceof DirectionalLight
                && node.isEnabled()) {
                this.#activeDirectionalLight = node;
            } else if (this.#activeAmbientLight === null
                && node instanceof AmbientLight
                && node.isEnabled()) {
                this.#activeAmbientLight = node;
            }

            const children = node.children;

            for (
                let index = RendererConstants.RENDERER_TRAVERSAL.CHILD_LOOP_START_INDEX;
                index < children.length;
                index += RendererConstants.RENDERER_TRAVERSAL.CHILD_LOOP_INCREMENT
            ) {
                stack.push(children[index]);
            }
        }
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
            throw new Error(RendererExceptionMessages.RENDERER_EXCEPTION_MESSAGES.UNKNOWN_PRIMITIVE);
    }
}

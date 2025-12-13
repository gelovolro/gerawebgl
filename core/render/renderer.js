import { Matrix4 }           from '../math/matrix4.js';
import { Mesh }              from '../scene/mesh.js';
import { Scene }             from '../scene/scene.js';
import { PerspectiveCamera } from '../scene/camera.js';
import { WebGLContext }      from '../webgl-context.js';

/** @type {number} */
const INDEX_BUFFER_OFFSET_BYTES = 0;

/**
 * High-level renderer, that draws a scene from the perspective of a camera.
 */
export class Renderer {
    /** @type {WebGLContext} */
    #contextWrapper;

    /** @type {WebGL2RenderingContext} */
    #webglRenderingContext;

    /**
     * @param {WebGLContext} webglContext - Wrapper around the underlying WebGL2 rendering context.
     */
    constructor(webglContext) {
        if (!(webglContext instanceof WebGLContext)) {
            throw new TypeError('Renderer expects a WebGLContext instance.');
        }

        this.#contextWrapper        = webglContext;
        this.#webglRenderingContext = webglContext.context;
    }

    /**
     * Renders the given scene from the point of view of the given camera.
     *
     * @param {Scene} scene - Scene graph containing all objects, that should be rendered.
     * @param {PerspectiveCamera} camera - Camera, that defines the view and projection used for rendering.
     */
    render(scene, camera) {
        if (!(scene instanceof Scene)) {
            throw new TypeError('Renderer.render expects a Scene instance.');
        }

        if (!(camera instanceof PerspectiveCamera)) {
            throw new TypeError('Renderer.render expects a PerspectiveCamera instance.');
        }

        const renderingContext = this.#webglRenderingContext;
        this.#contextWrapper.resizeToDisplaySize();
        this.#contextWrapper.clear();

        const canvas      = renderingContext.canvas;
        const aspectRatio = canvas.width / canvas.height;
        camera.setAspectRatio(aspectRatio);

        const projectionMatrix = camera.getProjectionMatrix();
        scene.updateWorldMatrix(null);
        scene.traverse((object3d) => {
            if (!(object3d instanceof Mesh)) {
                return;
            }

            const mesh        = object3d;
            const geometry    = mesh.geometry;
            const material    = mesh.material;
            const world       = mesh.worldMatrix;
            const finalMatrix = Matrix4.multiply(projectionMatrix, world);
            material.use();
            material.apply(finalMatrix);
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
        });
    }
}

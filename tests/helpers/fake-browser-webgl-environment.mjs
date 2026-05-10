const EMPTY_STRING                 = '';
const DEFAULT_WEBGL_CONTEXT_TYPE   = 'webgl2';
const DEFAULT_CANVAS_WIDTH         = 300;
const DEFAULT_CANVAS_HEIGHT        = 150;
const DEFAULT_DEVICE_PIXEL_RATIO   = 1;
const DEFAULT_WINDOW_INNER_WIDTH   = 800;
const DEFAULT_WINDOW_INNER_HEIGHT  = 600;
const INITIAL_ANIMATION_FRAME_ID   = 1;
const ANIMATION_FRAME_ID_INCREMENT = 1;
const DEFAULT_ATTRIBUTE_LOCATION   = 0;

// Numeric values are based on standard WebGL enum constants
const FAKE_WEBGL_CONSTANTS = Object.freeze({
    DEPTH_TEST           : 0x0B71,
    LEQUAL               : 0x0203,
    COLOR_BUFFER_BIT     : 0x4000,
    DEPTH_BUFFER_BIT     : 0x0100,
    ARRAY_BUFFER         : 0x8892,
    ELEMENT_ARRAY_BUFFER : 0x8893,
    STATIC_DRAW          : 0x88E4,
    FLOAT                : 0x1406,
    UNSIGNED_SHORT       : 0x1403,
    UNSIGNED_INT         : 0x1405,
    TRIANGLES            : 0x0004,
    LINES                : 0x0001,
    LINE_STRIP           : 0x0003,
    LINE_LOOP            : 0x0002,
    POINTS               : 0x0000,
    VERTEX_SHADER        : 0x8B31,
    FRAGMENT_SHADER      : 0x8B30,
    COMPILE_STATUS       : 0x8B81,
    LINK_STATUS          : 0x8B82,
    BLEND                : 0x0BE2,
    SRC_ALPHA            : 0x0302,
    ONE_MINUS_SRC_ALPHA  : 0x0303
});

// Runs a callback inside a fake browser/WebGL environment
export function withFakeBrowserWebGLEnvironment(callback) {
    const previousHTMLCanvasElement      = globalThis.HTMLCanvasElement;
    const previousWebGL2RenderingContext = globalThis.WebGL2RenderingContext;
    const previousWindow                 = globalThis.window;
    const animationFrames                = new Map();
    const requestedFrames                = [];
    const canceledFrames                 = [];
    let nextAnimationFrameId             = INITIAL_ANIMATION_FRAME_ID;

    class FakeWebGL2RenderingContext {
        constructor(canvas) {
            this.canvas = canvas;
        }

        DEPTH_TEST           = FAKE_WEBGL_CONSTANTS.DEPTH_TEST;
        LEQUAL               = FAKE_WEBGL_CONSTANTS.LEQUAL;
        COLOR_BUFFER_BIT     = FAKE_WEBGL_CONSTANTS.COLOR_BUFFER_BIT;
        DEPTH_BUFFER_BIT     = FAKE_WEBGL_CONSTANTS.DEPTH_BUFFER_BIT;
        ARRAY_BUFFER         = FAKE_WEBGL_CONSTANTS.ARRAY_BUFFER;
        ELEMENT_ARRAY_BUFFER = FAKE_WEBGL_CONSTANTS.ELEMENT_ARRAY_BUFFER;
        STATIC_DRAW          = FAKE_WEBGL_CONSTANTS.STATIC_DRAW;
        FLOAT                = FAKE_WEBGL_CONSTANTS.FLOAT;
        UNSIGNED_SHORT       = FAKE_WEBGL_CONSTANTS.UNSIGNED_SHORT;
        UNSIGNED_INT         = FAKE_WEBGL_CONSTANTS.UNSIGNED_INT;
        TRIANGLES            = FAKE_WEBGL_CONSTANTS.TRIANGLES;
        LINES                = FAKE_WEBGL_CONSTANTS.LINES;
        LINE_STRIP           = FAKE_WEBGL_CONSTANTS.LINE_STRIP;
        LINE_LOOP            = FAKE_WEBGL_CONSTANTS.LINE_LOOP;
        POINTS               = FAKE_WEBGL_CONSTANTS.POINTS;
        VERTEX_SHADER        = FAKE_WEBGL_CONSTANTS.VERTEX_SHADER;
        FRAGMENT_SHADER      = FAKE_WEBGL_CONSTANTS.FRAGMENT_SHADER;
        COMPILE_STATUS       = FAKE_WEBGL_CONSTANTS.COMPILE_STATUS;
        LINK_STATUS          = FAKE_WEBGL_CONSTANTS.LINK_STATUS;
        BLEND                = FAKE_WEBGL_CONSTANTS.BLEND;
        SRC_ALPHA            = FAKE_WEBGL_CONSTANTS.SRC_ALPHA;
        ONE_MINUS_SRC_ALPHA  = FAKE_WEBGL_CONSTANTS.ONE_MINUS_SRC_ALPHA;

        enable() {}
        disable() {}
        depthFunc() {}
        clearColor() {}
        clear() {}
        viewport() {}
        blendFunc() {}
        depthMask() {}
        bindBuffer() {}
        bufferData() {}
        bindVertexArray() {}
        enableVertexAttribArray() {}
        vertexAttribPointer() {}
        deleteBuffer() {}
        deleteVertexArray() {}
        shaderSource() {}
        compileShader() {}
        attachShader() {}
        linkProgram() {}
        deleteShader() {}
        deleteProgram() {}
        useProgram() {}
        uniform1f() {}
        uniform1i() {}
        uniform2fv() {}
        uniform3fv() {}
        uniform4fv() {}
        uniformMatrix4fv() {}
        drawElements() {}
        createBuffer() { return {}; }
        createVertexArray() { return {}; }
        createShader(type) { return { type }; }
        createProgram() { return {}; }
        getShaderParameter() { return true; }
        getProgramParameter() { return true; }
        getShaderInfoLog() { return EMPTY_STRING; }
        getProgramInfoLog() { return EMPTY_STRING; }
        getAttribLocation() { return DEFAULT_ATTRIBUTE_LOCATION; }
        getUniformLocation(program, name) { return { program, name }; }
    }

    class FakeHTMLCanvasElement {
        constructor() {
            this.width        = DEFAULT_CANVAS_WIDTH;
            this.height       = DEFAULT_CANVAS_HEIGHT;
            this.clientWidth  = DEFAULT_CANVAS_WIDTH;
            this.clientHeight = DEFAULT_CANVAS_HEIGHT;
            this.context      = new FakeWebGL2RenderingContext(this);
        }

        getContext(type) {
            return type === DEFAULT_WEBGL_CONTEXT_TYPE ? this.context : null;
        }
    }

    const fakeWindow = {
        devicePixelRatio : DEFAULT_DEVICE_PIXEL_RATIO,
        innerWidth       : DEFAULT_WINDOW_INNER_WIDTH,
        innerHeight      : DEFAULT_WINDOW_INNER_HEIGHT,

        requestAnimationFrame(callbackFrame) {
            const id = nextAnimationFrameId;
            nextAnimationFrameId += ANIMATION_FRAME_ID_INCREMENT;
            animationFrames.set(id, callbackFrame);
            requestedFrames.push(id);
            return id;
        },

        cancelAnimationFrame(id) {
            canceledFrames.push(id);
            animationFrames.delete(id);
        }
    };

    globalThis.HTMLCanvasElement      = FakeHTMLCanvasElement;
    globalThis.WebGL2RenderingContext = FakeWebGL2RenderingContext;
    globalThis.window                 = fakeWindow;

    const environment = {
        HTMLCanvasElement      : FakeHTMLCanvasElement,
        WebGL2RenderingContext : FakeWebGL2RenderingContext,
        window                 : fakeWindow,
        requestedFrames,
        canceledFrames,

        createCanvas() { return new FakeHTMLCanvasElement(); },

        runAnimationFrame(id, timeMs) {
            const callbackFrame = animationFrames.get(id);
            animationFrames.delete(id);
            callbackFrame(timeMs);
        },

        getAnimationFrameCallback(id) {
            return animationFrames.get(id);
        }
    };

    try {
        return callback(environment);
    } finally {
        if (previousHTMLCanvasElement === undefined) {
            delete globalThis.HTMLCanvasElement;
        } else {
            globalThis.HTMLCanvasElement = previousHTMLCanvasElement;
        }

        if (previousWebGL2RenderingContext === undefined) {
            delete globalThis.WebGL2RenderingContext;
        } else {
            globalThis.WebGL2RenderingContext = previousWebGL2RenderingContext;
        }

        if (previousWindow === undefined) {
            delete globalThis.window;
        } else {
            globalThis.window = previousWindow;
        }
    }
}

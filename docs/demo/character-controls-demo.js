import GeraWebGL from './gerawebgl.js';

/**
 * Canvas element id used by the third-person demo.
 *
 * @type {string}
 */
const CANVAS_ELEMENT_ID = 'glcanvas';

/**
 * Mode toggle button element id.
 *
 * @type {string}
 */
const MODE_TOGGLE_BUTTON_ID = 'modeToggleButton';

/**
 * Camera toggle button element id.
 *
 * @type {string}
 */
const CAMERA_TOGGLE_BUTTON_ID = 'cameraToggleButton';

/**
 * Controls hint element id.
 *
 * @type {string}
 */
const CONTROLS_HINT_ELEMENT_ID = 'controlsHint';

/**
 * Wireframe toggle button element id.
 *
 * @type {string}
 */
const WIREFRAME_TOGGLE_BUTTON_ID = 'wireframeToggleButton';

/**
 * FPS counter update interval in milliseconds.
 *
 * @type {number}
 */
const FPS_COUNTER_UPDATE_INTERVAL_MS = 250;

/**
 * FPS counter smoothing factor.
 *
 * @type {number}
 */
const FPS_COUNTER_SMOOTHING_FACTOR = 0.15;

/**
 * FPS counter good threshold.
 *
 * @type {number}
 */
const FPS_COUNTER_GOOD_FPS_THRESHOLD = 55;

/**
 * FPS counter ok threshold.
 *
 * @type {number}
 */
const FPS_COUNTER_OK_FPS_THRESHOLD = 30;

/**
 * Wireframe label prefix.
 *
 * @type {string}
 */
const WIREFRAME_LABEL_PREFIX = 'Wireframe: ';

/**
 * Wireframe label, when enabled.
 *
 * @type {string}
 */
const WIREFRAME_LABEL_ON = 'ON';

/**
 * Wireframe label, when disabled.
 *
 * @type {string}
 */
const WIREFRAME_LABEL_OFF = 'OFF';

/**
 * Numeric zero constant.
 *
 * @type {number}
 */
const ZERO_VALUE = 0;

/**
 * Numeric one constant.
 *
 * @type {number}
 */
const ONE_VALUE = 1;

/**
 * Numeric two constant.
 *
 * @type {number}
 */
const TWO_VALUE = 2;

/**
 * Numeric half constant.
 *
 * @type {number}
 */
const HALF_VALUE = 0.5;

/**
 * Max color channel value.
 *
 * @type {number}
 */
const COLOR_CHANNEL_MAX = 255;

/**
 * Default camera follow distance.
 *
 * @type {number}
 */
const CAMERA_DISTANCE = 6.8;

/**
 * Default camera target height.
 *
 * @type {number}
 */
const CAMERA_TARGET_HEIGHT = 1.15;

/**
 * Default first-person eye height.
 *
 * @type {number}
 */
const CAMERA_EYE_HEIGHT = 1.6;

/**
 * Default camera polar angle (pitch) in radians.
 *
 * @type {number}
 */
const CAMERA_POLAR_RADIANS = -0.4;

/**
 * Default first-person pitch angle in radians.
 *
 * @type {number}
 */
const FIRST_PERSON_POLAR_RADIANS = 0.0;

/**
 * Default camera minimum pitch angle in radians.
 *
 * @type {number}
 */
const CAMERA_MIN_POLAR_RADIANS = -1.2;

/**
 * Default camera maximum pitch angle in radians.
 *
 * @type {number}
 */
const CAMERA_MAX_POLAR_RADIANS = 0.6;

/**
 * Default first-person minimum pitch angle in radians.
 *
 * @type {number}
 */
const FIRST_PERSON_MIN_POLAR_RADIANS = -1.35;

/**
 * Default first-person maximum pitch angle in radians.
 *
 * @type {number}
 */
const FIRST_PERSON_MAX_POLAR_RADIANS = 1.35;

/**
 * Default camera rotation speed multiplier.
 *
 * @type {number}
 */
const CAMERA_ROTATION_SPEED = 1.2;

/**
 * Player height in world units.
 *
 * @type {number}
 */
const PLAYER_HEIGHT = 1.8;

/**
 * Player width in world units.
 *
 * @type {number}
 */
const PLAYER_WIDTH = 0.7;

/**
 * Player depth in world units.
 *
 * @type {number}
 */
const PLAYER_DEPTH = 0.4;

/**
 * Player starting height.
 *
 * @type {number}
 */
const PLAYER_GROUND_OFFSET = PLAYER_HEIGHT / TWO_VALUE;

/**
 * Player move speed in world units per second.
 *
 * @type {number}
 */
const PLAYER_MOVE_SPEED = 3.6;

/**
 * Player run speed multiplier.
 *
 * @type {number}
 */
const PLAYER_RUN_SPEED_MULTIPLIER = 3.0;

/**
 * Player jump speed.
 *
 * @type {number}
 */
const PLAYER_JUMP_SPEED = 4.6;

/**
 * Gravity acceleration magnitude.
 *
 * @type {number}
 */
const GRAVITY_ACCELERATION = 9.8;

/**
 * Default ground plane size.
 *
 * @type {number}
 */
const GROUND_SIZE = 360.0;

/**
 * Ground segmentation count.
 *
 * @type {number}
 */
const GROUND_SEGMENTS = 180;

/**
 * Skybox cube size.
 *
 * @type {number}
 */
const SKYBOX_SIZE = 820.0;

/**
 * Total number of obstacles.
 *
 * @type {number}
 */
const OBSTACLE_COUNT = 140;

/**
 * Obstacle height offset from ground.
 *
 * @type {number}
 */
const OBSTACLE_BASE_Y = 1.1;

/**
 * Obstacle area margin from the edge of the map.
 *
 * @type {number}
 */
const OBSTACLE_AREA_MARGIN = 16.0;

/**
 * Obstacle position variance for height.
 *
 * @type {number}
 */
const OBSTACLE_HEIGHT_VARIANCE = 1.4;

/**
 * Obstacle random seed for placement.
 *
 * @type {number}
 */
const OBSTACLE_RANDOM_SEED = 2028;

/**
 * Minimum obstacle rotation speed around X axis (radians per second).
 *
 * @type {number}
 */
const OBSTACLE_ROTATION_SPEED_MIN_X = 1.4;

/**
 * Maximum obstacle rotation speed around X axis (radians per second).
 *
 * @type {number}
 */
const OBSTACLE_ROTATION_SPEED_MAX_X = 2.4;

/**
 * Minimum obstacle rotation speed around Y axis (radians per second).
 *
 * @type {number}
 */
const OBSTACLE_ROTATION_SPEED_MIN_Y = 1.6;

/**
 * Maximum obstacle rotation speed around Y axis (radians per second).
 *
 * @type {number}
 */
const OBSTACLE_ROTATION_SPEED_MAX_Y = 2.8;

/**
 * Minimum obstacle rotation speed around Z axis (radians per second).
 *
 * @type {number}
 */
const OBSTACLE_ROTATION_SPEED_MIN_Z = 1.2;

/**
 * Maximum obstacle rotation speed around Z axis (radians per second).
 *
 * @type {number}
 */
const OBSTACLE_ROTATION_SPEED_MAX_Z = 2.2;

/**
 * Skybox texture size (pixels).
 *
 * @type {number}
 */
const SKY_TEXTURE_SIZE = 512;

/**
 * Floor texture size (pixels).
 *
 * @type {number}
 */
const FLOOR_TEXTURE_SIZE = 512;

/**
 * Floor tile count per axis.
 *
 * @type {number}
 */
const FLOOR_TILE_COUNT = 24;

/**
 * Floor grout thickness in pixels.
 *
 * @type {number}
 */
const FLOOR_GROUT_THICKNESS = 4;

/**
 * Random seed for texture generation.
 *
 * @type {number}
 */
const TEXTURE_RANDOM_SEED = 1337;

/**
 * Linear congruential generator multiplier.
 *
 * @type {number}
 */
const LCG_MULTIPLIER = 1664525;

/**
 * Linear congruential generator increment.
 *
 * @type {number}
 */
const LCG_INCREMENT = 1013904223;

/**
 * Linear congruential generator modulus (2 ^ 32).
 *
 * @type {number}
 */
const LCG_MODULUS = TWO_VALUE ** 32;

/**
 * Floor base RGB color.
 *
 * @type {number[]}
 */
const FLOOR_COLOR_BASE = [115, 118, 122];

/**
 * Floor accent RGB color.
 *
 * @type {number[]}
 */
const FLOOR_COLOR_ACCENT = [96, 100, 106];

/**
 * Floor grout RGB color.
 *
 * @type {number[]}
 */
const FLOOR_COLOR_GROUT = [52, 55, 60];

/**
 * Floor color variance multiplier.
 *
 * @type {number}
 */
const FLOOR_COLOR_VARIANCE = 0.15;

/**
 * Sky top RGB color.
 *
 * @type {number[]}
 */
const SKY_COLOR_TOP = [72, 110, 170];

/**
 * Sky bottom RGB color.
 *
 * @type {number[]}
 */
const SKY_COLOR_BOTTOM = [12, 20, 35];

/**
 * Amount of stars to draw on the sky texture.
 *
 * @type {number}
 */
const SKY_STAR_COUNT = 120;

/**
 * Star size in pixels.
 *
 * @type {number}
 */
const SKY_STAR_SIZE = 2;

/**
 * MIME type used for generated textures.
 *
 * @type {string}
 */
const TEXTURE_MIME_TYPE = 'image/png';

/**
 * Half-rotation radians.
 *
 * @type {number}
 */
const HALF_ROTATION_RADIANS = Math.PI / TWO_VALUE;

/**
 * Floor rotation around X axis (to place it on XZ plane).
 *
 * @type {number}
 */
const FLOOR_ROTATION_X = -HALF_ROTATION_RADIANS;

/**
 * Default texture unit index for floor material.
 *
 * @type {number}
 */
const FLOOR_TEXTURE_UNIT_INDEX = 0;

/**
 * Default texture unit index for skybox material.
 *
 * @type {number}
 */
const SKYBOX_TEXTURE_UNIT_INDEX = 1;

/**
 * Light direction vector (normalized).
 *
 * @type {Float32Array}
 */
const LIGHT_DIRECTION = new Float32Array([0.6, 1.0, 0.4]);

/**
 * Player color.
 *
 * @type {Float32Array}
 */
const PLAYER_COLOR = new Float32Array([0.28, 0.82, 0.95]);

/**
 * Obstacle color palette.
 *
 * @type {Float32Array[]}
 */
const OBSTACLE_COLORS = [
    new Float32Array([0.95 , 0.42 , 0.35]),
    new Float32Array([0.75 , 0.58 , 0.92]),
    new Float32Array([0.4  , 0.8  , 0.5]),
    new Float32Array([0.95 , 0.78 , 0.35])
];

/**
 * Obstacle geometry sizes.
 *
 * @type {number}
 */
const OBSTACLE_SIZE = 1.6;

/**
 * Obstacle height multiplier for cones.
 *
 * @type {number}
 */
const OBSTACLE_CONE_HEIGHT = 2.2;

/**
 * Obstacle size multiplier for torus.
 *
 * @type {number}
 */
const OBSTACLE_TORUS_RADIUS = 1.2;

/**
 * Obstacle torus tube radius.
 *
 * @type {number}
 */
const OBSTACLE_TORUS_TUBE_RADIUS = 0.35;

/**
 * Obstacle torus radial segments.
 *
 * @type {number}
 */
const OBSTACLE_TORUS_RADIAL_SEGMENTS = 16;

/**
 * Obstacle torus tubular segments.
 *
 * @type {number}
 */
const OBSTACLE_TORUS_TUBULAR_SEGMENTS = 24;

/**
 * Obstacle cone radial segments.
 *
 * @type {number}
 */
const OBSTACLE_CONE_RADIAL_SEGMENTS = 20;

/**
 * Obstacle cone height segments.
 *
 * @type {number}
 */
const OBSTACLE_CONE_HEIGHT_SEGMENTS = 1;

/**
 * Obstacle pyramid size multiplier.
 *
 * @type {number}
 */
const OBSTACLE_PYRAMID_SIZE = 1.9;

/**
 * Obstacle sphere radius.
 *
 * @type {number}
 */
const OBSTACLE_SPHERE_RADIUS = 1.0;

/**
 * Obstacle sphere segments.
 *
 * @type {number}
 */
const OBSTACLE_SPHERE_SEGMENTS = 24;

/**
 * Camera mode label, when in normal mode.
 *
 * @type {string}
 */
const CAMERA_MODE_LABEL_NORMAL = 'Bobbing: Off';

/**
 * Camera mode label, when in bobbing mode.
 *
 * @type {string}
 */
const CAMERA_MODE_LABEL_BOBBING = 'Bobbing: On';

/**
 * Camera toggle label for third-person view.
 *
 * @type {string}
 */
const CAMERA_TYPE_LABEL_THIRD_PERSON = 'View: Third Person';

/**
 * Camera toggle label for first-person view.
 *
 * @type {string}
 */
const CAMERA_TYPE_LABEL_FIRST_PERSON = 'View: First Person';

/**
 * Camera type label - third person.
 *
 * @type {string}
 */
const CAMERA_TYPE_THIRD_PERSON = 'THIRD_PERSON';

/**
 * Camera type label - first person.
 *
 * @type {string}
 */
const CAMERA_TYPE_FIRST_PERSON = 'FIRST_PERSON';

/**
 * Controls hint text shown in the UI.
 *
 * @type {string}
 */
const CONTROLS_HINT_TEXT = 'WASD move - LMB drag rotate - Shift run - Space jump - Toggle view';

/**
 * Texture smoothing flag for canvas rendering.
 *
 * @type {boolean}
 */
const CANVAS_IMAGE_SMOOTHING = false;

/**
 * Sky star color.
 *
 * @type {string}
 */
const SKY_STAR_COLOR = 'rgba(255, 255, 255, 0.8)';

/**
 * Canvas origin X coordinate.
 *
 * @type {number}
 */
const CANVAS_ORIGIN_X = ZERO_VALUE;

/**
 * Canvas origin Y coordinate.
 *
 * @type {number}
 */
const CANVAS_ORIGIN_Y = ZERO_VALUE;

/**
 * Loop index increment value.
 *
 * @type {number}
 */
const LOOP_INDEX_INCREMENT = ONE_VALUE;

/**
 * Gradient stop start.
 *
 * @type {number}
 */
const GRADIENT_STOP_START = ZERO_VALUE;

/**
 * Gradient stop end.
 *
 * @type {number}
 */
const GRADIENT_STOP_END = ONE_VALUE;

/**
 * RGB array red channel index.
 *
 * @type {number}
 */
const COLOR_INDEX_RED = ZERO_VALUE;

/**
 * RGB array green channel index.
 *
 * @type {number}
 */
const COLOR_INDEX_GREEN = ONE_VALUE;

/**
 * RGB array blue channel index.
 *
 * @type {number}
 */
const COLOR_INDEX_BLUE = TWO_VALUE;

/**
 * DOM tag name for canvas creation.
 *
 * @type {string}
 */
const DOM_TAG_CANVAS = 'canvas';

/**
 * Canvas 2D context id.
 *
 * @type {string}
 */
const CANVAS_CONTEXT_2D = '2d';

/**
 * Rotating obstacle entry.
 *
 * @typedef {Object} RotatingObstacle
 * @property {GeraWebGL.Mesh} mesh
 * @property {number} rotationSpeedX
 * @property {number} rotationSpeedY
 * @property {number} rotationSpeedZ
 */

/**
 * Simple third-person demo application.
 */
class DemoApp {

    /**
     * WebGL engine instance.
     *
     * @type {GeraWebGL.Engine}
     * @private
     */
    #engine;

    /**
     * Third-person camera instance.
     *
     * @type {GeraWebGL.ThirdPersonCamera}
     * @private
     */
    #thirdPersonCamera;

    /**
     * First-person camera instance.
     *
     * @type {GeraWebGL.FirstPersonCamera}
     * @private
     */
    #firstPersonCamera;

    /**
     * Active camera instance.
     *
     * @type {GeraWebGL.Camera}
     * @private
     */
    #activeCamera;

    /**
     * Active camera type label.
     *
     * @type {string}
     * @private
     */
    #activeCameraType = CAMERA_TYPE_THIRD_PERSON;

    /**
     * Third-person controls instance.
     *
     * @type {GeraWebGL.Controls.ThirdPersonControls}
     * @private
     */
    #thirdPersonControls;

    /**
     * First-person controls instance.
     *
     * @type {GeraWebGL.Controls.FirstPersonControls}
     * @private
     */
    #firstPersonControls;

    /**
     * Active controls instance.
     *
     * @type {GeraWebGL.Controls.KeyboardControls}
     * @private
     */
    #activeControls;

    /**
     * Player mesh instance.
     *
     * @type {GeraWebGL.Mesh}
     * @private
     */
    #player;

    /**
     * Ground plane mesh.
     *
     * @type {GeraWebGL.Mesh}
     * @private
     */
    #ground;

    /**
     * Skybox mesh.
     *
     * @type {GeraWebGL.Mesh}
     * @private
     */
    #skybox;

    /**
     * List of obstacle meshes with rotation speeds.
     *
     * @type {Array<{ mesh: GeraWebGL.Mesh, rotationSpeedX: number, rotationSpeedY: number, rotationSpeedZ: number }>}
     * @private
     */
    #obstacles = [];

    /**
     * Mode toggle button element.
     *
     * @type {HTMLButtonElement}
     * @private
     */
    #modeToggleButton;

    /**
     * Camera toggle button element.
     *
     * @type {HTMLButtonElement}
     * @private
     */
    #cameraToggleButton;

    /**
     * Controls hint element.
     *
     * @type {HTMLElement}
     * @private
     */
    #controlsHintElement;

    /**
     * Wireframe toggle button element.
     *
     * @type {HTMLButtonElement}
     * @private
     */
    #wireframeToggleButton;

    /**
     * FPS counter instance.
     *
     * @type {GeraWebGL.Debug.FpsCounter}
     * @private
     */
    #fpsCounter;

    /**
     * Current wireframe state.
     *
     * @type {boolean}
     * @private
     */
    #isWireframeEnabled = false;

    /**
     * Current bobbing state (shared across camera switches).
     *
     * @type {boolean}
     * @private
     */
    #isBobbingEnabled = false;

    /**
     * @param {HTMLCanvasElement} canvas             - Canvas used for rendering.
     * @param {HTMLButtonElement} modeToggleButton   - Button to toggle camera mode.
     * @param {HTMLButtonElement} cameraToggleButton - Button to toggle camera view.
     * @param {HTMLButtonElement} wireframeButton    - Button to toggle wireframe mode.
     * @param {HTMLElement} controlsHintElement      - UI element for controls hint.
     */
    constructor(canvas, modeToggleButton, cameraToggleButton, wireframeButton, controlsHintElement) {
        this.#engine                          = GeraWebGL.createEngine(canvas, { initialCameraZ: CAMERA_DISTANCE });
        this.#modeToggleButton                = modeToggleButton;
        this.#cameraToggleButton              = cameraToggleButton;
        this.#wireframeToggleButton           = wireframeButton;
        this.#controlsHintElement             = controlsHintElement;
        this.#controlsHintElement.textContent = CONTROLS_HINT_TEXT;
    }

    /**
     * Initializes the demo scene and resources.
     *
     * @returns {Promise<void>}
     */
    async initialize() {
        const webglContext      = this.#engine.webglRenderingContext;
        this.#thirdPersonCamera = new GeraWebGL.ThirdPersonCamera();
        this.#firstPersonCamera = new GeraWebGL.FirstPersonCamera();
        this.#applyBobbingState();

        this.#activeCamera = this.#thirdPersonCamera;
        this.#engine.setCamera(this.#activeCamera);

        const floorTextureUrl = DemoApp.#createStoneTextureUrl();
        const skyTextureUrl   = DemoApp.#createSkyTextureUrl();
        const floorTexture    = new GeraWebGL.Textures.Texture2D(webglContext);
        const skyTexture      = new GeraWebGL.Textures.Texture2D(webglContext, { flipY: false });
        await floorTexture.loadFromUrl(floorTextureUrl);
        await skyTexture.loadFromUrl(skyTextureUrl);

        this.#ground = DemoApp.#createGroundMesh(webglContext, floorTexture);
        this.#engine.scene.add(this.#ground);

        this.#skybox = DemoApp.#createSkyboxMesh(webglContext, skyTexture);
        this.#engine.scene.add(this.#skybox);

        this.#player = DemoApp.#createPlayerMesh(webglContext);
        this.#player.position.y = PLAYER_GROUND_OFFSET;
        this.#engine.scene.add(this.#player);

        this.#thirdPersonControls = new GeraWebGL.Controls.ThirdPersonControls(
            this.#thirdPersonCamera,
            this.#player,
            this.#engine.webglRenderingContext.canvas,
            {
                distance           : CAMERA_DISTANCE,
                targetHeight       : CAMERA_TARGET_HEIGHT,
                groundY            : PLAYER_GROUND_OFFSET,
                polarRadians       : CAMERA_POLAR_RADIANS,
                minPolarRadians    : CAMERA_MIN_POLAR_RADIANS,
                maxPolarRadians    : CAMERA_MAX_POLAR_RADIANS,
                rotationSpeed      : CAMERA_ROTATION_SPEED,
                moveSpeed          : PLAYER_MOVE_SPEED,
                runSpeedMultiplier : PLAYER_RUN_SPEED_MULTIPLIER,
                jumpSpeed          : PLAYER_JUMP_SPEED,
                gravity            : GRAVITY_ACCELERATION
            }
        );

        this.#firstPersonControls = new GeraWebGL.Controls.FirstPersonControls(
            this.#firstPersonCamera,
            this.#player,
            this.#engine.webglRenderingContext.canvas,
            {
                eyeHeight          : CAMERA_EYE_HEIGHT,
                groundY            : PLAYER_GROUND_OFFSET,
                polarRadians       : FIRST_PERSON_POLAR_RADIANS,
                minPolarRadians    : FIRST_PERSON_MIN_POLAR_RADIANS,
                maxPolarRadians    : FIRST_PERSON_MAX_POLAR_RADIANS,
                rotationSpeed      : CAMERA_ROTATION_SPEED,
                moveSpeed          : PLAYER_MOVE_SPEED,
                runSpeedMultiplier : PLAYER_RUN_SPEED_MULTIPLIER,
                jumpSpeed          : PLAYER_JUMP_SPEED,
                gravity            : GRAVITY_ACCELERATION
            }
        );

        this.#firstPersonControls.setEnabled(false);
        this.#activeControls = this.#thirdPersonControls;

        this.#obstacles = DemoApp.#createObstacleField(webglContext);
        this.#obstacles.forEach((obstacle) => this.#engine.scene.add(obstacle.mesh));

        this.#fpsCounter = new GeraWebGL.Debug.FpsCounter({
            updateIntervalMs : FPS_COUNTER_UPDATE_INTERVAL_MS,
            smoothingFactor  : FPS_COUNTER_SMOOTHING_FACTOR,
            goodFpsThreshold : FPS_COUNTER_GOOD_FPS_THRESHOLD,
            okFpsThreshold   : FPS_COUNTER_OK_FPS_THRESHOLD
        });

        document.body.appendChild(this.#fpsCounter.domElement);
        this.#bindUI();
        this.#updateModeLabel();
        this.#updateCameraLabel();
        this.#updateWireframeLabel();
    }

    /**
     * Starts the animation loop.
     */
    start() {
        this.#engine.start((deltaSeconds) => {
            this.#onFrame(deltaSeconds);
        });
    }

    /**
     * Per-frame update callback.
     *
     * @param {number} deltaSeconds - Time since last frame in seconds.
     * @private
     */
    #onFrame(deltaSeconds) {
        this.#fpsCounter.update(deltaSeconds);
        this.#activeControls.update(deltaSeconds);
        DemoApp.#updateObstacleRotation(this.#obstacles, deltaSeconds);
        DemoApp.#followCamera(this.#skybox, this.#activeCamera);
    }

    /**
     * Clamps a number to [min..max].
     *
     * @param {number} value
     * @param {number} min
     * @param {number} max
     * @returns {number}
     * @private
     */
    static #clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }

    /**
     * Binds UI interactions.
     *
     * @private
     */
    #bindUI() {
        this.#modeToggleButton.addEventListener('click', () => this.#toggleCameraMode());
        this.#cameraToggleButton.addEventListener('click', () => this.#toggleCameraType());
        this.#wireframeToggleButton.addEventListener('click', () => this.#toggleWireframe());
    }

    /**
     * Toggles wireframe mode and applies it to all materials.
     *
     * @private
     */
    #toggleWireframe() {
        this.#isWireframeEnabled = !this.#isWireframeEnabled;
        this.#applyWireframeState();
        this.#updateWireframeLabel();
    }

    /**
     * Applies the current wireframe state to all scene meshes.
     *
     * @private
     */
    #applyWireframeState() {
        DemoApp.#setMeshWireframe(this.#player, this.#isWireframeEnabled);
        DemoApp.#setMeshWireframe(this.#ground, this.#isWireframeEnabled);
        DemoApp.#setMeshWireframe(this.#skybox, this.#isWireframeEnabled);
        this.#obstacles.forEach((obstacle) => DemoApp.#setMeshWireframe(obstacle.mesh, this.#isWireframeEnabled));
    }

    /**
     * Applies the current bobbing state to the third-person camera.
     *
     * @private
     */
    #applyBobbingState() {
        if (this.#thirdPersonCamera) {
            const nextThirdMode = this.#isBobbingEnabled
                ? GeraWebGL.ThirdPersonCamera.Modes.BOBBING
                : GeraWebGL.ThirdPersonCamera.Modes.NORMAL;

            this.#thirdPersonCamera.setMode(nextThirdMode);
        }

        if (this.#firstPersonCamera) {
            const nextFirstMode = this.#isBobbingEnabled
                ? GeraWebGL.FirstPersonCamera.Modes.BOBBING
                : GeraWebGL.FirstPersonCamera.Modes.NORMAL;

            this.#firstPersonCamera.setMode(nextFirstMode);
        }
    }

    /**
     * Updates the wireframe button label.
     *
     * @private
     */
    #updateWireframeLabel() {
        this.#wireframeToggleButton.textContent = WIREFRAME_LABEL_PREFIX
        + (this.#isWireframeEnabled ? WIREFRAME_LABEL_ON : WIREFRAME_LABEL_OFF);
    }

    /**
     * Toggles camera mode between normal and bobbing.
     *
     * @private
     */
    #toggleCameraMode() {
        this.#isBobbingEnabled = !this.#isBobbingEnabled;
        this.#applyBobbingState();
        this.#updateModeLabel();
    }

    /**
     * Updates the mode button label based on camera mode.
     *
     * @private
     */
    #updateModeLabel() {
        this.#modeToggleButton.disabled    = false;
        this.#modeToggleButton.textContent = this.#isBobbingEnabled
            ? CAMERA_MODE_LABEL_BOBBING
            : CAMERA_MODE_LABEL_NORMAL;
    }

    /**
     * Toggles camera between third-person and first-person views.
     *
     * @private
     */
    #toggleCameraType() {
        const nextType = (this.#activeCameraType === CAMERA_TYPE_THIRD_PERSON)
            ? CAMERA_TYPE_FIRST_PERSON
            : CAMERA_TYPE_THIRD_PERSON;

        this.#setActiveCameraType(nextType);
    }

    /**
     * Updates the active camera and controls for the requested type.
     *
     * @param {string} cameraType - Next camera type.
     * @private
     */
    #setActiveCameraType(cameraType) {
        if (cameraType !== CAMERA_TYPE_THIRD_PERSON && cameraType !== CAMERA_TYPE_FIRST_PERSON) {
            throw new RangeError('`DemoApp` received an unsupported camera type.');
        }

        if (cameraType === this.#activeCameraType) {
            return;
        }

        this.#activeControls.setEnabled(false);

        if (cameraType === CAMERA_TYPE_THIRD_PERSON) {
            this.#activeCamera = this.#thirdPersonCamera;
            this.#thirdPersonControls.setEnabled(true);
            this.#activeControls = this.#thirdPersonControls;
        } else {
            this.#activeCamera = this.#firstPersonCamera;
            this.#firstPersonControls.setEnabled(true);
            this.#activeControls = this.#firstPersonControls;
        }

        this.#activeCameraType = cameraType;
        this.#engine.setCamera(this.#activeCamera);
        this.#activeControls.update(ZERO_VALUE);
        this.#updateModeLabel();
        this.#updateCameraLabel();
        this.#applyBobbingState();
    }

    /**
     * Updates the camera toggle button label.
     *
     * @private
     */
    #updateCameraLabel() {
        this.#cameraToggleButton.textContent = (this.#activeCameraType === CAMERA_TYPE_THIRD_PERSON)
            ? CAMERA_TYPE_LABEL_THIRD_PERSON
            : CAMERA_TYPE_LABEL_FIRST_PERSON;
    }

    /**
     * Creates the player mesh.
     *
     * @param {WebGL2RenderingContext} webglContext - WebGL2 context.
     * @returns {GeraWebGL.Mesh}
     * @private
     */
    static #createPlayerMesh(webglContext) {
        const geometry = new GeraWebGL.Geometries.BoxGeometry(webglContext, {
            width  : PLAYER_WIDTH,
            height : PLAYER_HEIGHT,
            depth  : PLAYER_DEPTH
        });

        const material = new GeraWebGL.Materials.PhongMaterial(webglContext, {
            color          : PLAYER_COLOR,
            lightDirection : LIGHT_DIRECTION
        });

        return new GeraWebGL.Mesh(geometry, material);
    }

    /**
     * Creates the ground mesh with a procedural stone texture.
     *
     * @param {WebGL2RenderingContext} webglContext  - WebGL2 context.
     * @param {GeraWebGL.Textures.Texture2D} texture - Loaded floor texture.
     * @returns {GeraWebGL.Mesh}
     * @private
     */
    static #createGroundMesh(webglContext, texture) {
        const geometry = new GeraWebGL.Geometries.PlaneGeometry(webglContext, {
            width          : GROUND_SIZE,
            height         : GROUND_SIZE,
            widthSegments  : GROUND_SEGMENTS,
            heightSegments : GROUND_SEGMENTS
        });

        const material = new GeraWebGL.Materials.TexturedMaterial(webglContext, {
            texture,
            textureUnitIndex : FLOOR_TEXTURE_UNIT_INDEX,
            ownsTexture      : true
        });

        const mesh      = new GeraWebGL.Mesh(geometry, material);
        mesh.rotation.x = FLOOR_ROTATION_X;
        return mesh;
    }

    /**
     * Creates the skybox mesh.
     *
     * @param {WebGL2RenderingContext} webglContext  - WebGL2 context.
     * @param {GeraWebGL.Textures.Texture2D} texture - Loaded sky texture.
     * @returns {GeraWebGL.Mesh}
     * @private
     */
    static #createSkyboxMesh(webglContext, texture) {
        const geometry = new GeraWebGL.Geometries.BoxGeometry(webglContext, { size: SKYBOX_SIZE });
        const material = new GeraWebGL.Materials.TexturedMaterial(webglContext, {
            texture,
            textureUnitIndex : SKYBOX_TEXTURE_UNIT_INDEX,
            ownsTexture      : true
        });

        return new GeraWebGL.Mesh(geometry, material);
    }

    /**
     * Creates a field of rotating obstacle meshes.
     *
     * @param {WebGL2RenderingContext} webglContext - WebGL2 context.
     * @returns {Array<{ mesh: GeraWebGL.Mesh, rotationSpeedX: number, rotationSpeedY: number, rotationSpeedZ: number }>}
     * @private
     */
    static #createObstacleField(webglContext) {
        const obstacles         = [];
        const geometryFactories = [
            () => new GeraWebGL.Geometries.BoxGeometry(webglContext, { size: OBSTACLE_SIZE }),

            () => new GeraWebGL.Geometries.SphereGeometry(webglContext, {
                radius   : OBSTACLE_SPHERE_RADIUS,
                segments : OBSTACLE_SPHERE_SEGMENTS
            }),

            () => new GeraWebGL.Geometries.TorusGeometry(webglContext, {
                radius          : OBSTACLE_TORUS_RADIUS,
                tubeRadius      : OBSTACLE_TORUS_TUBE_RADIUS,
                radialSegments  : OBSTACLE_TORUS_RADIAL_SEGMENTS,
                tubularSegments : OBSTACLE_TORUS_TUBULAR_SEGMENTS
            }),

            () => new GeraWebGL.Geometries.ConeGeometry(webglContext, {
                width          : OBSTACLE_SIZE,
                height         : OBSTACLE_CONE_HEIGHT,
                radialSegments : OBSTACLE_CONE_RADIAL_SEGMENTS,
                heightSegments : OBSTACLE_CONE_HEIGHT_SEGMENTS
            }),

            () => new GeraWebGL.Geometries.PyramidGeometry(webglContext, { size: OBSTACLE_PYRAMID_SIZE })
        ];

        const seededRandom = DemoApp.#createSeededRandom(OBSTACLE_RANDOM_SEED);
        const halfSize     = GROUND_SIZE / TWO_VALUE;
        const minX         = -halfSize + OBSTACLE_AREA_MARGIN;
        const maxX         = halfSize - OBSTACLE_AREA_MARGIN;
        const minZ         = -halfSize + OBSTACLE_AREA_MARGIN;
        const maxZ         = halfSize - OBSTACLE_AREA_MARGIN;

        for (let index = ZERO_VALUE; index < OBSTACLE_COUNT; index += LOOP_INDEX_INCREMENT) {
            const geometryFactory = geometryFactories[index % geometryFactories.length];
            const geometry        = geometryFactory();
            const material        = new GeraWebGL.Materials.PhongMaterial(webglContext, {
                color          : OBSTACLE_COLORS[index % OBSTACLE_COLORS.length],
                lightDirection : LIGHT_DIRECTION
            });

            const mesh      = new GeraWebGL.Mesh(geometry, material);
            mesh.position.x = DemoApp.#lerp(minX, maxX, seededRandom());
            mesh.position.y = OBSTACLE_BASE_Y + (seededRandom() * OBSTACLE_HEIGHT_VARIANCE);
            mesh.position.z = DemoApp.#lerp(minZ, maxZ, seededRandom());

            obstacles.push({
                mesh,
                rotationSpeedX : DemoApp.#lerp(OBSTACLE_ROTATION_SPEED_MIN_X, OBSTACLE_ROTATION_SPEED_MAX_X, seededRandom()),
                rotationSpeedY : DemoApp.#lerp(OBSTACLE_ROTATION_SPEED_MIN_Y, OBSTACLE_ROTATION_SPEED_MAX_Y, seededRandom()),
                rotationSpeedZ : DemoApp.#lerp(OBSTACLE_ROTATION_SPEED_MIN_Z, OBSTACLE_ROTATION_SPEED_MAX_Z, seededRandom())
            });
        }

        return obstacles;
    }

    /**
     * Updates rotation for all obstacles.
     *
     * @param {RotatingObstacle[]} obstacles - Obstacle data entries.
     * @param {number} deltaSeconds          - Delta time in seconds.
     * @private
     */
    static #updateObstacleRotation(obstacles, deltaSeconds) {
        for (let index = ZERO_VALUE; index < obstacles.length; index += LOOP_INDEX_INCREMENT) {
            const obstacle   = obstacles[index];
            const mesh       = obstacle.mesh;
            mesh.rotation.x += deltaSeconds * obstacle.rotationSpeedX;
            mesh.rotation.y += deltaSeconds * obstacle.rotationSpeedY;
            mesh.rotation.z += deltaSeconds * obstacle.rotationSpeedZ;
        }
    }

    /**
     * Keeps the skybox centered on the camera position.
     *
     * @param {GeraWebGL.Mesh} skybox   - Skybox mesh.
     * @param {GeraWebGL.Camera} camera - Camera instance.
     * @private
     */
    static #followCamera(skybox, camera) {
        skybox.position.set(camera.position.x, camera.position.y, camera.position.z);
    }

    /**
     * Updates mesh material wireframe state, when supported.
     *
     * @param {GeraWebGL.Mesh} mesh - Mesh to update.
     * @param {boolean} enabled     - Wireframe enabled state.
     * @private
     */
    static #setMeshWireframe(mesh, enabled) {
        if (mesh && mesh.material && typeof mesh.material.setWireframeEnabled === 'function') {
            mesh.material.setWireframeEnabled(enabled);
        }
    }

    /**
     * Creates a data URL for the stone floor texture.
     *
     * @returns {string}
     * @private
     */
    static #createStoneTextureUrl() {
        const canvas  = document.createElement(DOM_TAG_CANVAS);
        canvas.width  = FLOOR_TEXTURE_SIZE;
        canvas.height = FLOOR_TEXTURE_SIZE;
        const context = canvas.getContext(CANVAS_CONTEXT_2D);

        if (!context) {
            throw new Error('Failed to create 2D context for floor texture.');
        }

        context.imageSmoothingEnabled = CANVAS_IMAGE_SMOOTHING;
        const seededRandom            = DemoApp.#createSeededRandom(TEXTURE_RANDOM_SEED);
        const tileSize                = FLOOR_TEXTURE_SIZE / FLOOR_TILE_COUNT;
        const groutSize               = FLOOR_GROUT_THICKNESS;
        context.fillStyle             = DemoApp.#rgbToCss(FLOOR_COLOR_GROUT);
        context.fillRect(CANVAS_ORIGIN_X, CANVAS_ORIGIN_Y, FLOOR_TEXTURE_SIZE, FLOOR_TEXTURE_SIZE);

        for (let y = ZERO_VALUE; y < FLOOR_TILE_COUNT; y += LOOP_INDEX_INCREMENT) {
            for (let x = ZERO_VALUE; x < FLOOR_TILE_COUNT; x += LOOP_INDEX_INCREMENT) {
                const isAccent    = seededRandom() > HALF_VALUE;
                const baseColor   = isAccent ? FLOOR_COLOR_ACCENT : FLOOR_COLOR_BASE;
                const color       = DemoApp.#applyColorVariance(baseColor, seededRandom());
                context.fillStyle = DemoApp.#rgbToCss(color);

                const rectX    = (x * tileSize) + groutSize;
                const rectY    = (y * tileSize) + groutSize;
                const rectSize = tileSize - (groutSize * TWO_VALUE);
                context.fillRect(rectX, rectY, rectSize, rectSize);
            }
        }

        return canvas.toDataURL(TEXTURE_MIME_TYPE);
    }

    /**
     * Creates a data URL for the sky texture.
     *
     * @returns {string}
     * @private
     */
    static #createSkyTextureUrl() {
        const canvas  = document.createElement(DOM_TAG_CANVAS);
        canvas.width  = SKY_TEXTURE_SIZE;
        canvas.height = SKY_TEXTURE_SIZE;
        const context = canvas.getContext(CANVAS_CONTEXT_2D);

        if (!context) {
            throw new Error('Failed to create 2D context for sky texture.');
        }

        const gradient = context.createLinearGradient(
            CANVAS_ORIGIN_X,
            CANVAS_ORIGIN_Y,
            CANVAS_ORIGIN_X,
            SKY_TEXTURE_SIZE
        );

        gradient.addColorStop(GRADIENT_STOP_START , DemoApp.#rgbToCss(SKY_COLOR_TOP));
        gradient.addColorStop(GRADIENT_STOP_END   , DemoApp.#rgbToCss(SKY_COLOR_BOTTOM));
        context.fillStyle = gradient;
        context.fillRect(CANVAS_ORIGIN_X, CANVAS_ORIGIN_Y, SKY_TEXTURE_SIZE, SKY_TEXTURE_SIZE);

        const seededRandom = DemoApp.#createSeededRandom(TEXTURE_RANDOM_SEED);
        context.fillStyle  = SKY_STAR_COLOR;

        for (let index = ZERO_VALUE; index < SKY_STAR_COUNT; index += LOOP_INDEX_INCREMENT) {
            const x = Math.floor(seededRandom() * SKY_TEXTURE_SIZE);
            const y = Math.floor(seededRandom() * SKY_TEXTURE_SIZE);
            context.fillRect(x, y, SKY_STAR_SIZE, SKY_STAR_SIZE);
        }

        return canvas.toDataURL(TEXTURE_MIME_TYPE);
    }

    /**
     * Creates a seeded random function.
     *
     * @param {number} seed - Initial seed.
     * @returns {() => number}
     * @private
     */
    static #createSeededRandom(seed) {
        let state = seed >>> ZERO_VALUE;

        return () => {
            state = (state * LCG_MULTIPLIER + LCG_INCREMENT) % LCG_MODULUS;
            return state / LCG_MODULUS;
        };
    }

    /**
     * Linearly interpolates between two values.
     *
     * @param {number} min - Minimum value.
     * @param {number} max - Maximum value.
     * @param {number} t   - Interpolation factor in [0..1].
     * @returns {number}
     * @private
     */
    static #lerp(min, max, t) {
        return min + ((max - min) * t);
    }

    /**
     * Applies variance to a base RGB color.
     *
     * @param {number[]} color - Base color [red, green, blue].
     * @param {number} factor  - Random value in [0..1].
     * @returns {number[]}
     * @private
     */
    static #applyColorVariance(color, factor) {
        const variance = (factor - HALF_VALUE) * FLOOR_COLOR_VARIANCE;
        const scale    = ONE_VALUE + variance;

        return [
            Math.min(COLOR_CHANNEL_MAX, Math.max(ZERO_VALUE, Math.round(color[COLOR_INDEX_RED]   * scale))),
            Math.min(COLOR_CHANNEL_MAX, Math.max(ZERO_VALUE, Math.round(color[COLOR_INDEX_GREEN] * scale))),
            Math.min(COLOR_CHANNEL_MAX, Math.max(ZERO_VALUE, Math.round(color[COLOR_INDEX_BLUE]  * scale)))
        ];
    }

    /**
     * Converts RGB array to CSS color string.
     *
     * @param {number[]} color - RGB array.
     * @returns {string}
     * @private
     */
    static #rgbToCss(color) {
        return `rgb(${color[COLOR_INDEX_RED]}, ${color[COLOR_INDEX_GREEN]}, ${color[COLOR_INDEX_BLUE]})`;
    }
}

window.addEventListener('DOMContentLoaded', async () => {
    const canvas              = document.getElementById(CANVAS_ELEMENT_ID);
    const modeToggleButton    = document.getElementById(MODE_TOGGLE_BUTTON_ID);
    const cameraToggleButton  = document.getElementById(CAMERA_TOGGLE_BUTTON_ID);
    const wireframeButton     = document.getElementById(WIREFRAME_TOGGLE_BUTTON_ID);
    const controlsHintElement = document.getElementById(CONTROLS_HINT_ELEMENT_ID);

    if (!(canvas instanceof HTMLCanvasElement)) {
        throw new Error('Canvas element not found.');
    }

    if (!(modeToggleButton instanceof HTMLButtonElement)) {
        throw new Error('Mode toggle button not found.');
    }

    if (!(cameraToggleButton instanceof HTMLButtonElement)) {
        throw new Error('Camera toggle button not found.');
    }

    if (!(wireframeButton instanceof HTMLButtonElement)) {
        throw new Error('Wireframe toggle button not found.');
    }

    if (!(controlsHintElement instanceof HTMLElement)) {
        throw new Error('Controls hint element not found.');
    }

    const app = new DemoApp(
        canvas,
        modeToggleButton,
        cameraToggleButton,
        wireframeButton,
        controlsHintElement
    );

    await app.initialize();
    app.start();
});

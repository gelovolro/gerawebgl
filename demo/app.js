import GeraWebGL from './gerawebgl.js';

/**
 * Canvas element id used by the demo.
 *
 * @type {string}
 */
const CANVAS_ELEMENT_ID = 'glcanvas';

/**
 * Button element id that toggles wireframe mode.
 *
 * @type {string}
 */
const WIREFRAME_TOGGLE_BUTTON_ID = 'wireframeToggleButton';

/**
 * Select element id that switches material mode.
 *
 * @type {string}
 */
const MATERIAL_MODE_SELECT_ID = 'materialModeSelect';

/**
 * Button element id that recreates the mesh (dispose test).
 *
 * @type {string}
 */
const RECREATE_MESH_BUTTON_ID = 'recreateMeshButton';

/**
 * Range slider element id, that controls material opacity.
 *
 * @type {string}
 */
const OPACITY_SLIDER_ID = 'opacitySlider';

/**
 * Element id used to display the current opacity slider value.
 *
 * @type {string}
 */
const OPACITY_VALUE_ELEMENT_ID = 'opacityValue';

/**
 * Default material opacity.
 *
 * @type {number}
 */
const DEFAULT_MATERIAL_OPACITY = 1.0;

/**
 * Minimum material opacity supported by the demo slider.
 *
 * @type {number}
 */
const MIN_MATERIAL_OPACITY = 0.1;

/**
 * Maximum material opacity.
 *
 * @type {number}
 */
const MAX_MATERIAL_OPACITY = 1.0;

/**
 * Material mode identifier for the normal visualization material.
 *
 * @type {string}
 */
const MATERIAL_MODE_NORMAL = 'NORMAL';

/**
 * Demo texture asset path (served from `docs/demo/`).
 *
 * @type {string}
 */
const DEMO_TEXTURE_ASSET_PATH = './assets/test1.jpg';

/**
 * Default cube size.
 *
 * @type {number}
 */
const CUBE_SIZE = 1.0;

/**
 * Cube rotation speed around the X axis (radians per second).
 *
 * @type {number}
 */
const ROTATION_SPEED_X = 1.0;

/**
 * Cube rotation speed around the Y axis (radians per second).
 *
 * @type {number}
 */
const ROTATION_SPEED_Y = 0.7;

/**
 * Initial value for recreate counter.
 *
 * @type {number}
 */
const RECREATE_COUNT_INITIAL_VALUE = 0;

/**
 * Increment value for recreate counter.
 *
 * @type {number}
 */
const RECREATE_COUNT_INCREMENT = 1;

/**
 * Default WebGL texture unit index used by the demo material.
 *
 * @type {number}
 */
const DEFAULT_TEXTURE_UNIT_INDEX = 0;

/**
 * Default transform component value used for position/rotation.
 *
 * @type {number}
 */
const DEFAULT_TRANSFORM_COMPONENT_ZERO = 0.0;

/**
 * Default transform component value used for scale.
 *
 * @type {number}
 */
const DEFAULT_TRANSFORM_COMPONENT_ONE = 1.0;

/**
 * Label prefix used by the recreate button.
 *
 * @type {string}
 */
const RECREATE_MESH_BUTTON_LABEL_PREFIX = 'Recreate mesh (dispose test): ';

/**
 * Wireframe label used when wireframe is enabled.
 *
 * @type {string}
 */
const WIREFRAME_ON_LABEL = 'Wireframe: ON';

/**
 * Wireframe label used when wireframe is disabled.
 *
 * @type {string}
 */
const WIREFRAME_OFF_LABEL = 'Wireframe: OFF';

/**
 * Label used while texture resources are loading.
 *
 * @type {string}
 */
const MATERIAL_SELECT_LOADING_LABEL = 'Material: Loading texture...';

/**
 * Material mode identifiers.
 *
 * @type {string}
 */
const MATERIAL_MODE_VERTEX_COLOR = 'VERTEX_COLOR';

/**
 * Material mode identifier for the textured material.
 *
 * @type {string}
 */
const MATERIAL_MODE_TEXTURED = 'TEXTURED';

/**
 * Material mode identifier for the solid color material.
 *
 * @type {string}
 */
const MATERIAL_MODE_SOLID_COLOR = 'SOLID_COLOR';

/**
 * Default vertex color used for `VertexColor` mode.
 *
 * @type {Float32Array}
 */
const DEFAULT_VERTEX_COLOR = new Float32Array([0.2, 0.6, 1.0]);

/**
 * Number of color components per vertex (RGB).
 *
 * @type {number}
 */
const COLOR_COMPONENT_COUNT = 3;

/**
 * Number of faces for the demo box geometry.
 * Must match `BoxGeometry` face order: `Front, Back, Top, Bottom, Right, Left`.
 *
 * @type {number}
 */
const BOX_FACE_COUNT = 6;

/**
 * Total component count for per-face color buffer (faces * RGB).
 * For `BoxGeometry`: 6 faces * 3 components = 18.
 *
 * @type {number}
 */
const BOX_PER_FACE_COLORS_LENGTH = BOX_FACE_COUNT * COLOR_COMPONENT_COUNT;

/**
 * Modulo value used to alternate face colors (even/odd faces).
 *
 * @type {number}
 */
const FACE_COLOR_ALTERNATION_MODULO = 2;

/**
 * Remainder value, that represents an `even` face index.
 *
 * @type {number}
 */
const FACE_COLOR_ALTERNATION_EVEN_REMAINDER = 0;

/**
 * Color component index for red channel in an RGB triplet.
 *
 * @type {number}
 */
const COLOR_COMPONENT_INDEX_RED = 0;

/**
 * Color component index for green channel in an RGB triplet.
 *
 * @type {number}
 */
const COLOR_COMPONENT_INDEX_GREEN = 1;

/**
 * Color component index for blue channel in an RGB triplet.
 *
 * @type {number}
 */
const COLOR_COMPONENT_INDEX_BLUE = 2;

/**
 * Demo face color used for alternating per-face visualization, red.
 *
 * @type {Float32Array}
 */
const DEMO_FACE_COLOR_RED = new Float32Array([1.0, 0.0, 0.0]);

/**
 * Demo face color used for alternating per-face visualization, blue.
 *
 * @type {Float32Array}
 */
const DEMO_FACE_COLOR_BLUE = new Float32Array([0.0, 0.0, 1.0]);

/**
 * Default solid color used for SolidColor mode.
 *
 * @type {Float32Array}
 */
const DEFAULT_SOLID_COLOR = new Float32Array([0.2, 0.9, 0.3]);

/**
 * Empty string constant.
 *
 * @type {string}
 */
const EMPTY_STRING = '';

/**
 * Minimal text length considered as `non-empty`.
 *
 * @type {number}
 */
const NON_EMPTY_TEXT_MIN_LENGTH = 1;

/**
 * Material mode identifier for the Phong lighting material.
 *
 * @type {string}
 */
const MATERIAL_MODE_PHONG = 'PHONG';

/**
 * Default directional light direction used by Phong material.
 * Points from above and slightly from the right.
 *
 * @type {Float32Array}
 */
const DEFAULT_LIGHT_DIRECTION = new Float32Array([0.5, 0.7, 1.0]);

/**
 * Default base color used by Phong material.
 *
 * @type {Float32Array}
 */
const DEFAULT_PHONG_COLOR = new Float32Array([0.7, 0.7, 0.7]);

/**
 * Material mode identifier for the Lambert lighting material.
 *
 * @type {string}
 */
const MATERIAL_MODE_LAMBERT = 'LAMBERT';

/**
 * Default base color used by Lambert material.
 *
 * @type {Float32Array}
 */
const DEFAULT_LAMBERT_COLOR = new Float32Array([0.7, 0.7, 0.7]);

/**
 * Default ambient strength used by Phong material.
 *
 * @type {number}
 */
const DEFAULT_PHONG_AMBIENT_STRENGTH = 0.05;

/**
 * Default specular strength used by Phong material.
 *
 * @type {number}
 */
const DEFAULT_PHONG_SPECULAR_STRENGTH = 2.0;

/**
 * Default shininess exponent used by Phong material.
 *
 * @type {number}
 */
const DEFAULT_PHONG_SHININESS = 8.0;

/**
 * Default specular color used by Phong material.
 *
 * @type {Float32Array}
 */
const DEFAULT_PHONG_SPECULAR_COLOR = new Float32Array([1.0, 1.0, 1.0]);

/**
 * Number of fractional digits used when formatting opacity value in the UI.
 *
 * @type {number}
 */
const OPACITY_LABEL_FRACTION_DIGITS = 2;

/**
 * @typedef {Object} Object3DTransformSnapshot
 * @property {{ x: number, y: number, z: number }} position - Position components.
 * @property {{ x: number, y: number, z: number }} rotation - Rotation (radians) components.
 * @property {{ x: number, y: number, z: number }} scale    - Scale components.
 */

/**
 * @typedef {Object} ReplaceCubeOptions
 * @property {boolean} preserveTransform            - When true, keeps cube transform when switching material.
 * @property {boolean} shouldIncrementRecreateCount - When true, increments the recreate counter.
 */

/**
 * Demo application that renders a scene and provides UI for material switching.
 */
class DemoApp {
    /**
     * Engine instance used by the demo.
     *
     * @type {GeraWebGL.Engine}
     * @private
     */
    #engine;

    /**
     * Currently rendered cube mesh.
     *
     * @type {GeraWebGL.Mesh}
     * @private
     */
    #cube;

    /**
     * Button that toggles wireframe mode.
     *
     * @type {HTMLButtonElement}
     * @private
     */
    #wireframeToggleButton;

    /**
     * Select that switches material mode.
     *
     * @type {HTMLSelectElement}
     * @private
     */
    #materialModeSelect;

    /**
     * Button that recreates the cube (dispose test).
     *
     * @type {HTMLButtonElement}
     * @private
     */
    #recreateMeshButton;

    /**
     * Range slider that controls material opacity.
     *
     * @type {HTMLInputElement}
     * @private
     */
    #opacitySlider;

    /**
     * Element used to display current opacity value.
     *
     * @type {HTMLElement}
     * @private
     */
    #opacityValueElement;

    /**
     * Current material opacity value [0..1].
     *
     * @type {number}
     * @private
     */
    #materialOpacity = DEFAULT_MATERIAL_OPACITY;

    /**
     * How many times the mesh has been recreated via the explicit `recreate` button.
     *
     * @type {number}
     * @private
     */
    #recreateCount = RECREATE_COUNT_INITIAL_VALUE;

    /**
     * Wireframe state.
     *
     * @type {boolean}
     * @private
     */
    #isWireframeEnabled = false;

    /**
     * Current material mode.
     *
     * @type {string}
     * @private
     */
    #materialMode = MATERIAL_MODE_VERTEX_COLOR;

    /**
     * Shared VertexColor material.
     *
     * @type {GeraWebGL.Materials.VertexColorMaterial}
     * @private
     */
    #sharedVertexColorMaterial;

    /**
     * Shared SolidColor material.
     *
     * @type {GeraWebGL.Materials.SolidColorMaterial}
     * @private
     */
    #sharedSolidColorMaterial;

    /**
     * Shared texture instance.
     *
     * @type {GeraWebGL.Textures.Texture2D | null}
     * @private
     */
    #sharedTexture = null;

    /**
     * Shared textured material instance.
     *
     * @type {GeraWebGL.Materials.TexturedMaterial | null}
     * @private
     */
    #sharedTexturedMaterial = null;

    /**
     * Shared normal visualization material.
     *
     * @type {GeraWebGL.Materials.NormalMaterial}
     * @private
     */
    #sharedNormalMaterial;

    /**
     * Per-face colors for VertexColor mode (expanded by `BoxGeometry` internally).
     * Stored as `Float32Array` length = 18 (6 faces * 3 RGB).
     *
     * @type {Float32Array}
     * @private
     */
    #vertexModePerFaceColors;

    /**
     * Shared Phong lighting material.
     *
     * @type {GeraWebGL.Materials.PhongMaterial}
     * @private
     */
    #sharedPhongMaterial;

    /**
     * Shared Lambert lighting material.
     *
     * @type {GeraWebGL.Materials.LambertMaterial}
     * @private
     */
    #sharedLambertMaterial;

    /**
     * @param {HTMLCanvasElement} canvas             - Canvas used for rendering.
     * @param {HTMLButtonElement} wireframeButton    - Button, that toggles wireframe mode.
     * @param {HTMLSelectElement} materialModeSelect - Select, that switches material mode.
     * @param {HTMLButtonElement} recreateButton     - Button, that recreates the cube.
     * @param {HTMLInputElement} opacitySlider       - Range slider, that controls material opacity.
     * @param {HTMLElement} opacityValueElement      - Element, that displays the current opacity value.
     */
    constructor(canvas, wireframeButton, materialModeSelect, recreateButton, opacitySlider, opacityValueElement) {
        this.#wireframeToggleButton = wireframeButton;
        this.#materialModeSelect    = materialModeSelect;
        this.#recreateMeshButton    = recreateButton;
        this.#opacitySlider         = opacitySlider;
        this.#opacityValueElement   = opacityValueElement;
        this.#engine                = GeraWebGL.createEngine(canvas);

        const webglContext              = this.#engine.webglRenderingContext;
        this.#sharedVertexColorMaterial = new GeraWebGL.Materials.VertexColorMaterial(webglContext);
        this.#sharedSolidColorMaterial  = new GeraWebGL.Materials.SolidColorMaterial(webglContext, { color: DEFAULT_SOLID_COLOR });
        this.#sharedNormalMaterial      = new GeraWebGL.Materials.NormalMaterial(webglContext);

        this.#sharedPhongMaterial = new GeraWebGL.Materials.PhongMaterial(webglContext, {
            color          : DEFAULT_PHONG_COLOR,
            lightDirection : DEFAULT_LIGHT_DIRECTION
        });

        this.#sharedLambertMaterial = new GeraWebGL.Materials.LambertMaterial(webglContext, {
            color            : DEFAULT_LAMBERT_COLOR,
            lightDirection   : DEFAULT_LIGHT_DIRECTION,
            ambientStrength  : DEFAULT_PHONG_AMBIENT_STRENGTH,
            specularStrength : DEFAULT_PHONG_SPECULAR_STRENGTH,
            shininess        : DEFAULT_PHONG_SHININESS,
            specularColor    : DEFAULT_PHONG_SPECULAR_COLOR
        });

        this.#applyWireframeStateToSharedMaterials();
        this.#vertexModePerFaceColors = DemoApp.#createAlternatingPerFaceColors(
            DEMO_FACE_COLOR_RED,
            DEMO_FACE_COLOR_BLUE
        );

        this.#cube = this.#createCubeForCurrentMode();
        this.#engine.scene.add(this.#cube);
        this.#bindUI();
        this.#updateWireframeButtonLabel();
        this.#updateRecreateButtonLabel();
        this.#materialModeSelect.value = this.#materialMode;
    }

    /**
     * Starts the requestAnimationFrame render loop.
     */
    start() {
        this.#engine.start((deltaTimeSeconds) => {
            this.#onFrame(deltaTimeSeconds);
        });
    }

    /**
     * Per-frame update callback.
     *
     * @param {number} deltaSeconds - Time since last frame in seconds.
     * @private
     */
    #onFrame(deltaSeconds) {
        this.#cube.rotation.x += deltaSeconds * ROTATION_SPEED_X;
        this.#cube.rotation.y += deltaSeconds * ROTATION_SPEED_Y;
    }

    /**
     * Binds UI handlers.
     *
     * @private
     */
    #bindUI() {
        this.#wireframeToggleButton.addEventListener('click', () => {
            this.#toggleWireframe();
        });

        this.#materialModeSelect.addEventListener('change', async () => {
            await this.#onMaterialModeSelectChanged();
        });

        this.#recreateMeshButton.addEventListener('click', async () => {
            await this.#recreateMesh();
        });

        this.#opacitySlider.addEventListener('input', () => {
            this.#onOpacitySliderChanged();
        });
    }

    /**
     * Toggles wireframe mode and applies it to all shared materials.
     *
     * @private
     */

    #toggleWireframe() {
        this.#isWireframeEnabled = !this.#isWireframeEnabled;
        this.#applyWireframeStateToSharedMaterials();
        this.#updateWireframeButtonLabel();
    }

    /**
     * Handles material mode changes via the select.
     *
     * @returns {Promise<void>} - Resolves, when the requested mode is applied, including texture initialization.
     * @private
     */
    async #onMaterialModeSelectChanged() {
        const requestedMode = this.#materialModeSelect.value;

        if (requestedMode === this.#materialMode) {
            return;
        }

        const previousMode = this.#materialMode;

        try {
            await this.#setMaterialMode(requestedMode);
        } catch (error) {
            // Rollback select state, if switching failed.
            this.#materialModeSelect.value = previousMode;
            throw error;
        }
    }

    /**
     * Switches the current material mode.
     *
     * @param {string} mode     - One of: `VERTEX_COLOR | TEXTURED | SOLID_COLOR | NORMAL | PHONG | LAMBERT`.
     * @returns {Promise<void>} - Resolves, when the mode is applied and the cube mesh is replaced.
     * @private
     */
    async #setMaterialMode(mode) {
        if (mode !== MATERIAL_MODE_VERTEX_COLOR
            && mode !== MATERIAL_MODE_TEXTURED
            && mode !== MATERIAL_MODE_SOLID_COLOR
            && mode !== MATERIAL_MODE_NORMAL
            && mode !== MATERIAL_MODE_PHONG
            && mode !== MATERIAL_MODE_LAMBERT) {
            throw new Error(`DemoApp: unknown material mode ${mode}.`);
        }

        if (mode === MATERIAL_MODE_TEXTURED) {
            await this.#withMaterialSelectLocked(async () => {
                await this.#ensureSharedTexturedResources();
            });
        }

        this.#materialMode   = mode;
        const replaceOptions = {
            preserveTransform            : true,
            shouldIncrementRecreateCount : false
        };

        this.#replaceCube(replaceOptions);
    }

    /**
     * Explicit mesh recreation (dispose test).
     *
     * @returns {Promise<void>} - Resolves, when the cube has been recreated.
     * @private
     */
    async #recreateMesh() {
        if (this.#materialMode === MATERIAL_MODE_TEXTURED) {
            await this.#ensureSharedTexturedResources();
        }

        const replaceOptions = {
            preserveTransform            : false,
            shouldIncrementRecreateCount : true
        };

        this.#replaceCube(replaceOptions);
    }

    /**
     * Locks the material select while executing an async action. Used for texture loading.
     *
     * @param {() => Promise<void>} action - Async action to run.
     * @returns {Promise<void>}            - Resolves, when the action completes and the select UI state is restored.
     * @private
     */
    async #withMaterialSelectLocked(action) {
        const previousDisabledState       = this.#materialModeSelect.disabled;
        const selectedIndex               = this.#materialModeSelect.selectedIndex;
        const selectedOption              = this.#materialModeSelect.options[selectedIndex];
        const previousSelectText          = selectedOption?.textContent || EMPTY_STRING;
        this.#materialModeSelect.disabled = true;

        if (selectedOption && previousSelectText.length >= NON_EMPTY_TEXT_MIN_LENGTH) {
            selectedOption.textContent = MATERIAL_SELECT_LOADING_LABEL;
        }

        try {
            await action();
        } finally {
            // Restore UI state:
            if (selectedOption && previousSelectText.length >= NON_EMPTY_TEXT_MIN_LENGTH) {
                selectedOption.textContent = previousSelectText;
            }

            this.#materialModeSelect.disabled = previousDisabledState;
        }
    }

    /**
     * Replaces the current cube with a new cube mesh (based on current mode).
     *
     * @param {ReplaceCubeOptions} options - Replacement behavior.
     * @private
     */
    #replaceCube(options) {
        const { preserveTransform, shouldIncrementRecreateCount } = options;
        const previousCube      = this.#cube;
        const transformSnapshot = preserveTransform
            ? DemoApp.#captureTransform(previousCube)
            : DemoApp.#createDefaultTransform();

        this.#engine.scene.remove(previousCube);
        previousCube.dispose();

        this.#cube = this.#createCubeForCurrentMode();
        DemoApp.#applyTransform(this.#cube, transformSnapshot);
        this.#engine.scene.add(this.#cube);

        if (shouldIncrementRecreateCount) {
            this.#recreateCount += RECREATE_COUNT_INCREMENT;
            this.#updateRecreateButtonLabel();
        }
    }

    /**
     * Creates a cube for the current material mode.
     *
     * @returns {GeraWebGL.Mesh} - New cube mesh instance with per-cube geometry and a shared material.
     * @private
     */
    #createCubeForCurrentMode() {
        const webglContext = this.#engine.webglRenderingContext;
        let material = null;

        switch (this.#materialMode) {
            case MATERIAL_MODE_VERTEX_COLOR:
                material = this.#sharedVertexColorMaterial;
                break;

            case MATERIAL_MODE_SOLID_COLOR:
                material = this.#sharedSolidColorMaterial;
                break;

            case MATERIAL_MODE_TEXTURED:
                if (!this.#sharedTexturedMaterial) {
                    throw new Error('DemoApp: textured mode requested, but textured resources are not initialized.');
                }

                material = this.#sharedTexturedMaterial;
                break;

            case MATERIAL_MODE_NORMAL:
                material = this.#sharedNormalMaterial;
                break;

            case MATERIAL_MODE_PHONG:
                material = this.#sharedPhongMaterial;
                break;

            case MATERIAL_MODE_LAMBERT:
                material = this.#sharedLambertMaterial;
                break;

            default:
                throw new Error(`DemoApp: unknown material mode ${this.#materialMode}.`);
        }

        material.setWireframeEnabled(this.#isWireframeEnabled);

        const geometryColors = (this.#materialMode === MATERIAL_MODE_VERTEX_COLOR)
            ? this.#vertexModePerFaceColors
            : DEFAULT_VERTEX_COLOR;

        const geometry = new GeraWebGL.Geometries.BoxGeometry(
            webglContext,
            { size: CUBE_SIZE, colors: geometryColors }
        );

        return new GeraWebGL.Mesh(
            geometry,
            material,
            { ownsGeometry: true, ownsMaterial: false }
        );
    }

    /**
     * Initializes shared texture/material once.
     *
     * @returns {Promise<void>} - Resolves when resources are ready, rejects if the texture image fails to load.
     * @private
     */
    async #ensureSharedTexturedResources() {
        if (this.#sharedTexturedMaterial) {
            return;
        }

        const webglContext  = this.#engine.webglRenderingContext;
        this.#sharedTexture = new GeraWebGL.Textures.Texture2D(webglContext);
        await this.#sharedTexture.loadFromUrl(DEMO_TEXTURE_ASSET_PATH);

        this.#sharedTexturedMaterial = new GeraWebGL.Materials.TexturedMaterial(
            webglContext,
            {
                texture          : this.#sharedTexture,
                ownsTexture      : false,
                textureUnitIndex : DEFAULT_TEXTURE_UNIT_INDEX
            }
        );

        this.#sharedTexturedMaterial.setWireframeEnabled(this.#isWireframeEnabled);
        this.#sharedTexturedMaterial.setOpacity(this.#materialOpacity);
    }

    /**
     * Applies current wireframe state to all shared materials.
     *
     * @private
     */
    #applyWireframeStateToSharedMaterials() {
        this.#sharedVertexColorMaterial.setWireframeEnabled(this.#isWireframeEnabled);
        this.#sharedSolidColorMaterial.setWireframeEnabled(this.#isWireframeEnabled);
        this.#sharedNormalMaterial.setWireframeEnabled(this.#isWireframeEnabled);
        this.#sharedPhongMaterial.setWireframeEnabled(this.#isWireframeEnabled);
        this.#sharedLambertMaterial.setWireframeEnabled(this.#isWireframeEnabled);

        if (this.#sharedTexturedMaterial) {
            this.#sharedTexturedMaterial.setWireframeEnabled(this.#isWireframeEnabled);
        }
    }

    /**
     * Updates the wireframe button label to match the current wireframe state.
     *
     * @private
     */
    #updateWireframeButtonLabel() {
        this.#wireframeToggleButton.textContent = this.#isWireframeEnabled
            ? WIREFRAME_ON_LABEL
            : WIREFRAME_OFF_LABEL;
    }

    /**
     * Applies current opacity to all shared materials (and optionally the shared textured material).
     *
     * @private
     */
    #applyOpacityToSharedMaterials() {
        this.#sharedVertexColorMaterial.setOpacity(this.#materialOpacity);
        this.#sharedSolidColorMaterial.setOpacity(this.#materialOpacity);
        this.#sharedNormalMaterial.setOpacity(this.#materialOpacity);
        this.#sharedPhongMaterial.setOpacity(this.#materialOpacity);
        this.#sharedLambertMaterial.setOpacity(this.#materialOpacity);

        if (this.#sharedTexturedMaterial) {
            this.#sharedTexturedMaterial.setOpacity(this.#materialOpacity);
        }
    }

    /**
     * Handles opacity slider changes.
     *
     * @private
     */
    #onOpacitySliderChanged() {
        this.#materialOpacity = DemoApp.#parseOpacityValue(this.#opacitySlider.value);
        this.#applyOpacityToSharedMaterials();
        this.#updateOpacityLabel();
    }

    /**
     * Updates opacity value label.
     *
     * @private
     */
    #updateOpacityLabel() {
        this.#opacityValueElement.textContent = this.#materialOpacity.toFixed(OPACITY_LABEL_FRACTION_DIGITS);
    }

    /**
     * Parses and clamps an opacity slider value.
     *
     * @param {string} value - Raw input value.
     * @returns {number}     - Clamped opacity.
     * @private
     */
    static #parseOpacityValue(value) {
        const parsed = Number.parseFloat(value);

        if (!Number.isFinite(parsed)) {
            return DEFAULT_MATERIAL_OPACITY;
        }

        return Math.max(MIN_MATERIAL_OPACITY, Math.min(MAX_MATERIAL_OPACITY, parsed));
    }

    /**
     * Updates the recreate button label to include the current recreate counter.
     *
     * @private
     */
    #updateRecreateButtonLabel() {
        this.#recreateMeshButton.textContent = RECREATE_MESH_BUTTON_LABEL_PREFIX + this.#recreateCount;
    }

    /**
     * Creates an alternating per-face RGB buffer (length = 18).
     * Face order follows BoxGeometry: Front, Back, Top, Bottom, Right, Left.
     *
     * @param {Float32Array} firstFaceColor  - RGB for face 0.
     * @param {Float32Array} secondFaceColor - RGB for face 1.
     * @returns {Float32Array} Per-face RGB buffer (6 faces * 3 RGB).
     * @private
     */
    static #createAlternatingPerFaceColors(firstFaceColor, secondFaceColor) {
        const colors = new Float32Array(BOX_PER_FACE_COLORS_LENGTH);

        for (let faceIndex = 0; faceIndex < BOX_FACE_COUNT; faceIndex += 1) {
            const useFirst  = (faceIndex % FACE_COLOR_ALTERNATION_MODULO) === FACE_COLOR_ALTERNATION_EVEN_REMAINDER;
            const source    = useFirst ? firstFaceColor : secondFaceColor;
            const baseIndex = faceIndex * COLOR_COMPONENT_COUNT;
            colors[baseIndex + COLOR_COMPONENT_INDEX_RED]   = source[COLOR_COMPONENT_INDEX_RED];
            colors[baseIndex + COLOR_COMPONENT_INDEX_GREEN] = source[COLOR_COMPONENT_INDEX_GREEN];
            colors[baseIndex + COLOR_COMPONENT_INDEX_BLUE]  = source[COLOR_COMPONENT_INDEX_BLUE];
        }

        return colors;
    }

    /**
     * Captures transform components from `Object3D`.
     *
     * @param {GeraWebGL.Object3D} object3d - Object to read transform from.
     * @returns {Object3DTransformSnapshot} - Snapshot of position/rotation/scale.
     * @private
     */
    static #captureTransform(object3d) {
        return {
            position : { x: object3d.position.x, y: object3d.position.y, z: object3d.position.z },
            rotation : { x: object3d.rotation.x, y: object3d.rotation.y, z: object3d.rotation.z },
            scale    : { x: object3d.scale.x,    y: object3d.scale.y,    z: object3d.scale.z    }
        };
    }

    /**
     * Creates the default transform snapshot (zero position/rotation, unit scale).
     *
     * @returns {Object3DTransformSnapshot} - Default transform snapshot with zero position/rotation and unit scale.
     * @private
     */
    static #createDefaultTransform() {
        return {
            position : { x: DEFAULT_TRANSFORM_COMPONENT_ZERO, y: DEFAULT_TRANSFORM_COMPONENT_ZERO, z: DEFAULT_TRANSFORM_COMPONENT_ZERO },
            rotation : { x: DEFAULT_TRANSFORM_COMPONENT_ZERO, y: DEFAULT_TRANSFORM_COMPONENT_ZERO, z: DEFAULT_TRANSFORM_COMPONENT_ZERO },
            scale    : { x: DEFAULT_TRANSFORM_COMPONENT_ONE,  y: DEFAULT_TRANSFORM_COMPONENT_ONE,  z: DEFAULT_TRANSFORM_COMPONENT_ONE  }
        };
    }

    /**
     * Applies a transform snapshot to an `Object3D`.
     *
     * @param {GeraWebGL.Object3D} object3d         - Target object.
     * @param {Object3DTransformSnapshot} transform - Snapshot to apply.
     * @private
     */
    static #applyTransform(object3d, transform) {
        object3d.position.x = transform.position.x;
        object3d.position.y = transform.position.y;
        object3d.position.z = transform.position.z;

        object3d.rotation.x = transform.rotation.x;
        object3d.rotation.y = transform.rotation.y;
        object3d.rotation.z = transform.rotation.z;

        object3d.scale.x = transform.scale.x;
        object3d.scale.y = transform.scale.y;
        object3d.scale.z = transform.scale.z;
    }
}

window.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById(CANVAS_ELEMENT_ID);
    const wireframeButton = document.getElementById(WIREFRAME_TOGGLE_BUTTON_ID);
    const materialSelect  = document.getElementById(MATERIAL_MODE_SELECT_ID);
    const recreateButton  = document.getElementById(RECREATE_MESH_BUTTON_ID);
    const opacitySlider   = document.getElementById(OPACITY_SLIDER_ID);
    const opacityValue    = document.getElementById(OPACITY_VALUE_ELEMENT_ID);

    if (!(canvas instanceof HTMLCanvasElement)) {
        throw new Error(`Canvas element with id ${CANVAS_ELEMENT_ID} - not found.`);
    }

    if (!(wireframeButton instanceof HTMLButtonElement)) {
        throw new Error(`Button with id ${WIREFRAME_TOGGLE_BUTTON_ID} - not found.`);
    }

    if (!(materialSelect instanceof HTMLSelectElement)) {
        throw new Error(`Select element with id ${MATERIAL_MODE_SELECT_ID} - not found.`);
    }

    if (!(recreateButton instanceof HTMLButtonElement)) {
        throw new Error(`Button with id ${RECREATE_MESH_BUTTON_ID} - not found.`);
    }

    if (!(opacitySlider instanceof HTMLInputElement)) {
        throw new Error(`Range slider with id ${OPACITY_SLIDER_ID} - not found.`);
    }

    if (!(opacityValue instanceof HTMLElement)) {
        throw new Error(`Opacity value element with id ${OPACITY_VALUE_ELEMENT_ID} - not found.`);
    }

    const app = new DemoApp(canvas, wireframeButton, materialSelect, recreateButton, opacitySlider, opacityValue);
    app.start();
});

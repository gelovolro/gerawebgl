import GeraWebGL from './gerawebgl.js';

/**
 * Canvas element id used by the OBJ/MTL demo.
 *
 * @type {string}
 */
const CANVAS_ELEMENT_ID = 'glcanvas';

/**
 * Wireframe toggle button id.
 *
 * @type {string}
 */
const WIREFRAME_TOGGLE_BUTTON_ID = 'wireframeToggleButton';

/**
 * Reset view button id.
 *
 * @type {string}
 */
const RESET_VIEW_BUTTON_ID = 'resetViewButton';

/**
 * Status label element id.
 *
 * @type {string}
 */
const STATUS_LABEL_ID = 'localStatusLabel';

/**
 * Local folder input element id.
 *
 * @type {string}
 */
const LOCAL_FOLDER_INPUT_ID = 'localFolderInput';

/**
 * Local load button element id.
 *
 * @type {string}
 */
const LOCAL_LOAD_BUTTON_ID = 'localLoadButton';

/**
 * Local status label element id.
 *
 * @type {string}
 */
const LOCAL_STATUS_LABEL_ID = STATUS_LABEL_ID;

/**
 * Local OBJ select element id.
 *
 * @type {string}
 */
const LOCAL_OBJ_SELECT_ID = 'localObjSelect';

/**
 * Local OBJ select row element id.
 *
 * @type {string}
 */
const LOCAL_OBJ_SELECT_ROW_ID = 'localObjSelectRow';

/**
 * OBJ asset URL.
 *
 * @type {string}
 */
const OBJ_URL = './assets/mtl-example-model/wooden_tower.obj';

/**
 * MTL asset URL.
 *
 * @type {string}
 */
const MTL_URL = './assets/mtl-example-model/wooden_tower.mtl';

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
 * Status label while loading.
 *
 * @type {string}
 */
const STATUS_LOADING = 'Loading model...';

/**
 * Status label, when loaded.
 *
 * @type {string}
 */
const STATUS_READY = '3D model was loaded & is ready';

/**
 * Status label, when loading fails.
 *
 * @type {string}
 */
const STATUS_ERROR = 'Failed to load OBJ/MTL';

/**
 * Local status label shown, when waiting for a folder selection.
 *
 * @type {string}
 */
const LOCAL_STATUS_IDLE = 'Select a folder with OBJ/MTL assets.';

/**
 * Local status label while loading from folder.
 *
 * @type {string}
 */
const LOCAL_STATUS_LOADING = 'Loading local model...';

/**
 * Local status label, when a local model is ready.
 *
 * @type {string}
 */
const LOCAL_STATUS_READY = 'Local model was loaded & is ready';

/**
 * Local status label, when an error occurs.
 *
 * @type {string}
 */
const LOCAL_STATUS_ERROR = 'Failed to load local OBJ/MTL';

/**
 * Local status label, when no OBJ files are found.
 *
 * @type {string}
 */
const LOCAL_STATUS_NO_OBJ_FILES = 'No OBJ files found in the selected folder.';

/**
 * Local status label, when folder is ready to load.
 *
 * @type {string}
 */
const LOCAL_STATUS_FOLDER_READY = 'Folder ready. Click `Load from folder`.';

/**
 * Local status label, when folder selection is missing.
 *
 * @type {string}
 */
const LOCAL_STATUS_SELECT_FOLDER = 'Please select a folder with at least one OBJ file.';

/**
 * Local status label, when folder needs to be reselected.
 *
 * @type {string}
 */
const LOCAL_STATUS_RESELECT_FOLDER = 'Please re-select the folder before loading.';

/**
 * Orbit controls initial distance.
 *
 * @type {number}
 */
const ORBIT_DISTANCE = 15.0;

/**
 * Orbit controls minimum distance.
 *
 * @type {number}
 */
const ORBIT_MIN_DISTANCE = 2.0;

/**
 * Orbit controls maximum distance.
 *
 * @type {number}
 */
const ORBIT_MAX_DISTANCE = 50.0;

/**
 * Initial azimuth angle for orbit controls.
 *
 * @type {number}
 */
const ORBIT_AZIMUTH_RADIANS = 0.7;

/**
 * Initial polar angle for orbit controls.
 *
 * @type {number}
 */
const ORBIT_POLAR_RADIANS = -0.6;

/**
 * Rotation speed for the loaded model.
 *
 * @type {number}
 */
const MODEL_ROTATION_SPEED = 0.35;

/**
 * Boolean flag for wireframe state.
 *
 * @type {boolean}
 */
const DEFAULT_WIREFRAME_STATE = false;

/**
 * Vertical offset, applied to the built-in model root.
 *
 * @type {number}
 */
const LOADED_MODEL_Y_OFFSET = -5.5;

/**
 * Vertical offset, applied to local models.
 *
 * @type {number}
 */
const LOCAL_MODEL_Y_OFFSET = 0;

/**
 * How often FPS counter UI is refreshed (ms).
 *
 * @type {number}
 */
const FPS_COUNTER_UPDATE_INTERVAL_MS = 250;

/**
 * Exponential smoothing factor used by the FPS counter.
 * Higher values react faster but fluctuate more.
 *
 * @type {number}
 */
const FPS_COUNTER_SMOOTHING_FACTOR = 0.15;

/**
 * FPS value considered `good` (styling threshold).
 *
 * @type {number}
 */
const FPS_COUNTER_GOOD_FPS_THRESHOLD = 55;

/**
 * FPS value considered `ok` (styling threshold).
 *
 * @type {number}
 */
const FPS_COUNTER_OK_FPS_THRESHOLD = 30;

/**
 * OBJ material library token.
 *
 * @type {string}
 */
const OBJ_MATERIAL_LIB_TOKEN = 'mtllib';

/**
 * Comment token used in OBJ/MTL files.
 *
 * @type {string}
 */
const COMMENT_TOKEN = '#';

/**
 * Local OBJ select row hidden class name.
 *
 * @type {string}
 */
const LOCAL_OBJ_SELECT_HIDDEN_CLASS = 'uiRow--hidden';

/**
 * OBJ file extension.
 *
 * @type {string}
 */
const OBJ_EXTENSION = '.obj';

/**
 * MTL map options for scale.
 *
 * @type {string}
 */
const MTL_MAP_OPTION_SCALE = '-s';

/**
 * MTL map options for offset.
 *
 * @type {string}
 */
const MTL_MAP_OPTION_OFFSET = '-o';

/**
 * MTL map options for clamp.
 *
 * @type {string}
 */
const MTL_MAP_OPTION_CLAMP = '-clamp';

/**
 * MTL map options for bump multiplier.
 *
 * @type {string}
 */
const MTL_MAP_OPTION_BUMP_MULTIPLIER = '-bm';

/**
 * MTL map options vector components count.
 *
 * @type {number}
 */
const MTL_MAP_VECTOR_COMPONENTS = 3;

/**
 * MTL map options scalar components count.
 *
 * @type {number}
 */
const MTL_MAP_SCALAR_COMPONENTS = 1;

/**
 * Line split regex.
 *
 * @type {RegExp}
 */
const LINE_SPLIT_REGEX = /\s+/u;

/**
 * Line break regex.
 *
 * @type {RegExp}
 */
const LINE_BREAK_REGEX = /\r?\n/u;

/**
 * Path separator for normalization.
 *
 * @type {string}
 */
const PATH_SEPARATOR = '/';

/**
 * Quote token for paths.
 *
 * @type {string}
 */
const QUOTE_TOKEN = '"';

/**
 * Backslash token used in paths.
 *
 * @type {string}
 */
const BACKSLASH_TOKEN = '\\';

/**
 * Backslash replacement regex.
 *
 * @type {RegExp}
 */
const BACKSLASH_REGEX = /\\/gu;

/**
 * Prefix for missing MTL file messages.
 *
 * @type {string}
 */
const MISSING_MTL_MESSAGE_PREFIX = 'Missing MTL files: ';

/**
 * Prefix for missing texture messages.
 *
 * @type {string}
 */
const MISSING_TEXTURE_MESSAGE_PREFIX = 'Missing textures: ';

/**
 * Error message for missing canvas element.
 *
 * @type {string}
 */
const ERROR_CANVAS_NOT_FOUND = 'Canvas element not found.';

/**
 * Error message for missing wireframe toggle button.
 *
 * @type {string}
 */
const ERROR_WIREFRAME_BUTTON_NOT_FOUND = 'Wireframe toggle button not found.';

/**
 * Error message for missing reset view button.
 *
 * @type {string}
 */
const ERROR_RESET_BUTTON_NOT_FOUND = 'Reset view button not found.';

/**
 * Error message for missing status label.
 *
 * @type {string}
 */
const ERROR_STATUS_LABEL_NOT_FOUND = 'Status label not found.';

/**
 * Error message for missing local folder input.
 *
 * @type {string}
 */
const ERROR_LOCAL_FOLDER_INPUT_NOT_FOUND = 'Local folder input not found.';

/**
 * Error message for missing local load button.
 *
 * @type {string}
 */
const ERROR_LOCAL_LOAD_BUTTON_NOT_FOUND = 'Local load button not found.';

/**
 * Error message for missing local status label.
 *
 * @type {string}
 */
const ERROR_LOCAL_STATUS_LABEL_NOT_FOUND = 'Local status label not found.';

/**
 * Error message for missing local OBJ select element.
 *
 * @type {string}
 */
const ERROR_LOCAL_OBJ_SELECT_NOT_FOUND = 'Local OBJ select not found.';

/**
 * Error message for missing local OBJ select row element.
 *
 * @type {string}
 */
const ERROR_LOCAL_OBJ_SELECT_ROW_NOT_FOUND = 'Local OBJ select row not found.';

/**
 * DOM change event name.
 *
 * @type {string}
 */
const CHANGE_EVENT = 'change';

/**
 * DOM click event name.
 *
 * @type {string}
 */
const CLICK_EVENT = 'click';

/**
 * DOM content loaded event name.
 *
 * @type {string}
 */
const DOM_CONTENT_LOADED_EVENT = 'DOMContentLoaded';

/**
 * Empty string value.
 *
 * @type {string}
 */
const EMPTY_STRING = '';

/**
 * Space separator.
 *
 * @type {string}
 */
const SPACE_SEPARATOR = ' ';

/**
 * List separator for display messages.
 *
 * @type {string}
 */
const LIST_SEPARATOR = ', ';

/**
 * Tag name used for option elements.
 *
 * @type {string}
 */
const OPTION_ELEMENT_TAG = 'option';

/**
 * String type token.
 *
 * @type {string}
 */
const TYPE_STRING = 'string';

/**
 * Minimum length of a quoted path.
 *
 * @type {number}
 */
const MIN_QUOTED_PATH_LENGTH = 2;

/**
 * Starting index for trimming quotes.
 *
 * @type {number}
 */
const QUOTE_TRIM_START_INDEX = 1;

/**
 * Ending offset for trimming quotes.
 *
 * @type {number}
 */
const QUOTE_TRIM_END_OFFSET = 1;

/**
 * Token count needed for MTL map parsing.
 *
 * @type {number}
 */
const MIN_MTL_MAP_TOKENS = 2;

/**
 * Start index for parsing MTL map file names.
 *
 * @type {number}
 */
const MTL_MAP_FILENAME_START_INDEX = 1;

/**
 * Prefix used by MTL option tokens.
 *
 * @type {string}
 */
const MTL_OPTION_PREFIX = '-';

/**
 * Index increment step.
 *
 * @type {number}
 */
const INDEX_INCREMENT = 1;

/**
 * Count representing zero elements.
 *
 * @type {number}
 */
const ZERO = 0;

/**
 * Count representing one element.
 *
 * @type {number}
 */
const ONE = 1;

/**
 * Index representing `not found`.
 *
 * @type {number}
 */
const NOT_FOUND_INDEX = -1;

/**
 * MTL map keywords parsed by the local upload flow.
 *
 * @type {Set<string>}
 */
const MTL_MAP_TOKENS = new Set([
    'map_Kd',
    'map_Ka',
    'map_Ks',
    'map_d',
    'bump',
    'map_Bump',
    'disp',
    'refl'
]);

/**
 * Demo application, that renders the OBJ/MTL models and provides local upload support.
 */
class ObjMtlDemoApp {

    /**
     * Canvas element used by the demo.
     *
     * @type {HTMLCanvasElement}
     * @private
     */
    #canvas;

    /**
     * Wireframe toggle button.
     *
     * @type {HTMLButtonElement}
     * @private
     */
    #wireframeButton;

    /**
     * Reset view button.
     *
     * @type {HTMLButtonElement}
     * @private
     */
    #resetButton;

    /**
     * Status label element.
     *
     * @type {HTMLElement}
     * @private
     */
    #statusLabel;

    /**
     * Local folder input.
     *
     * @type {HTMLInputElement}
     * @private
     */
    #localFolderInput;

    /**
     * Local load button.
     *
     * @type {HTMLButtonElement}
     * @private
     */
    #localLoadButton;

    /**
     * Local status label.
     *
     * @type {HTMLElement}
     * @private
     */
    #localStatusLabel;

    /**
     * Local OBJ select element.
     *
     * @type {HTMLSelectElement}
     * @private
     */
    #localObjSelect;

    /**
     * Local OBJ select row element.
     *
     * @type {HTMLElement}
     * @private
     */
    #localObjSelectRow;

    /**
     * Engine instance used by the demo.
     *
     * @type {GeraWebGL.Engine}
     * @private
     */
    #engine;

    /**
     * Orbit controls instance used by the demo.
     *
     * @type {GeraWebGL.Controls.OrbitControls}
     * @private
     */
    #orbitControls;

    /**
     * OBJ/MTL loader instance used by the demo.
     *
     * @type {GeraWebGL.Loaders.ObjMtlLoader}
     * @private
     */
    #loader;

    /**
     * FPS counter overlay displayed by the demo.
     *
     * @type {GeraWebGL.Debug.FpsCounter}
     * @private
     */
    #fpsCounter;

    /**
     * Current wireframe enabled state.
     *
     * @type {boolean}
     * @private
     */
    #wireframeEnabled = DEFAULT_WIREFRAME_STATE;

    /**
     * Loaded root object returned by the loader.
     *
     * @type {GeraWebGL.Object3D | null}
     * @private
     */
    #loadedRoot = null;

    /**
     * Loaded meshes returned by the loader.
     *
     * @type {Array<GeraWebGL.Mesh>}
     * @private
     */
    #loadedMeshes = [];

    /**
     * Cached local files map.
     *
     * @type {Map<string, File> | null}
     * @private
     */
    #localFileMap = null;

    /**
     * Cached OBJ file list from local folder selection.
     *
     * @type {File[]}
     * @private
     */
    #localObjFiles = [];

    /**
     * Active blob URLs, created for local loading.
     *
     * @type {string[]}
     * @private
     */
    #activeBlobUrls = [];

    /**
     * @param {HTMLCanvasElement} canvas          - Canvas element.
     * @param {HTMLButtonElement} wireframeButton - Wireframe toggle button.
     * @param {HTMLButtonElement} resetButton     - Reset view button.
     * @param {HTMLElement} statusLabel           - Status label element.
     * @param {HTMLInputElement} localFolderInput - Local folder input element.
     * @param {HTMLButtonElement} localLoadButton - Local load button.
     * @param {HTMLElement} localStatusLabel      - Local status label.
     * @param {HTMLSelectElement} localObjSelect  - Local OBJ select element.
     * @param {HTMLElement} localObjSelectRow     - Local OBJ select row element.
     */
    constructor(
        canvas,
        wireframeButton,
        resetButton,
        statusLabel,
        localFolderInput,
        localLoadButton,
        localStatusLabel,
        localObjSelect,
        localObjSelectRow
    ) {
        this.#canvas            = canvas;
        this.#wireframeButton   = wireframeButton;
        this.#resetButton       = resetButton;
        this.#statusLabel       = statusLabel;
        this.#localFolderInput  = localFolderInput;
        this.#localLoadButton   = localLoadButton;
        this.#localStatusLabel  = localStatusLabel;
        this.#localObjSelect    = localObjSelect;
        this.#localObjSelectRow = localObjSelectRow;
        this.#updateStatus(this.#statusLabel, STATUS_LOADING);
        this.#updateLocalStatus(LOCAL_STATUS_IDLE);

        this.#engine        = GeraWebGL.createEngine(this.#canvas, { fitToWindow: true });
        this.#orbitControls = this.#createOrbitControls(this.#engine.camera, this.#canvas);
        this.#loader        = new GeraWebGL.Loaders.ObjMtlLoader(this.#engine.webglRenderingContext);
        this.#fpsCounter    = new GeraWebGL.Debug.FpsCounter({
            updateIntervalMs : FPS_COUNTER_UPDATE_INTERVAL_MS,
            smoothingFactor  : FPS_COUNTER_SMOOTHING_FACTOR,
            goodFpsThreshold : FPS_COUNTER_GOOD_FPS_THRESHOLD,
            okFpsThreshold   : FPS_COUNTER_OK_FPS_THRESHOLD
        });

        document.body.appendChild(this.#fpsCounter.domElement);
        this.#updateWireframeLabel(this.#wireframeButton, this.#wireframeEnabled);
        this.#bindUI();
        this.#loadBuiltinModel();
    }

    /**
     * Starts the `requestAnimationFrame` render loop.
     */
    start() {
        this.#engine.start((deltaTime) => this.#onFrame(deltaTime));
    }

    /**
     * Creates orbit controls with the default configuration.
     *
     * @param {GeraWebGL.Camera} camera  - Active camera.
     * @param {HTMLCanvasElement} canvas - Canvas element.
     * @returns {GeraWebGL.Controls.OrbitControls}
     * @private
     */
    #createOrbitControls(camera, canvas) {
        return new GeraWebGL.Controls.OrbitControls(camera, canvas, {
            distance       : ORBIT_DISTANCE,
            minDistance    : ORBIT_MIN_DISTANCE,
            maxDistance    : ORBIT_MAX_DISTANCE,
            azimuthRadians : ORBIT_AZIMUTH_RADIANS,
            polarRadians   : ORBIT_POLAR_RADIANS
        });
    }

    /**
     * Updates the wireframe button label.
     *
     * @param {HTMLButtonElement} button - Wireframe button.
     * @param {boolean} enabled          - Current state.
     * @private
     */
    #updateWireframeLabel(button, enabled) {
        button.textContent = WIREFRAME_LABEL_PREFIX + (enabled ? WIREFRAME_LABEL_ON : WIREFRAME_LABEL_OFF);
    }

    /**
     * Updates the status label text.
     *
     * @param {HTMLElement} label - Status label element.
     * @param {string} text       - New text.
     * @private
     */
    #updateStatus(label, text) {
        label.textContent = text;
    }

    /**
     * Updates the local status label text.
     *
     * @param {string} text - New text.
     * @private
     */
    #updateLocalStatus(text) {
        this.#localStatusLabel.textContent = text;
    }

    /**
     * Binds the UI handlers.
     *
     * @private
     */
    #bindUI() {
        this.#wireframeButton.addEventListener(CLICK_EVENT, () => this.#toggleWireframe());
        this.#resetButton.addEventListener(CLICK_EVENT, () => this.#resetView());
        this.#localFolderInput.addEventListener(CHANGE_EVENT, () => this.#handleLocalFolderChange());
        this.#localLoadButton.addEventListener(CLICK_EVENT, () => this.#loadLocalModel());
    }

    /**
     * Loads the built-in OBJ/MTL model and adds it to the scene.
     *
     * @private
     */
    #loadBuiltinModel() {
        (async () => {
            try {
                const result = await this.#loader.loadFromUrls({
                    objUrl : OBJ_URL,
                    mtlUrl : MTL_URL
                });

                this.#applyLoadedResult(result, LOADED_MODEL_Y_OFFSET);
                this.#updateStatus(this.#statusLabel, STATUS_READY);
            } catch (error) {
                console.error(error);
                this.#updateStatus(this.#statusLabel, STATUS_ERROR);
            }
        })();
    }

    /**
     * Handles local folder input changes and updates available OBJ selection.
     *
     * @private
     */
    #handleLocalFolderChange() {
        const files         = Array.from(this.#localFolderInput.files ?? []);
        this.#localFileMap  = this.#buildFileMap(files);
        this.#localObjFiles = files.filter((file) => file.name.toLowerCase().endsWith(OBJ_EXTENSION));
        this.#updateLocalObjSelect();

        if (this.#localObjFiles.length === ZERO) {
            this.#updateLocalStatus(LOCAL_STATUS_NO_OBJ_FILES);
            return;
        }

        this.#updateLocalStatus(LOCAL_STATUS_FOLDER_READY);
    }

    /**
     * Updates the local OBJ select dropdown, based on available OBJ files.
     *
     * @private
     */
    #updateLocalObjSelect() {
        const hasMultiple = this.#localObjFiles.length > ONE;
        this.#localObjSelectRow.classList.toggle(LOCAL_OBJ_SELECT_HIDDEN_CLASS, !hasMultiple);
        this.#localObjSelect.innerHTML = EMPTY_STRING;

        if (!hasMultiple) {
            return;
        }

        for (const file of this.#localObjFiles) {
            const option       = document.createElement(OPTION_ELEMENT_TAG);
            option.value       = file.name;
            option.textContent = file.name;
            this.#localObjSelect.appendChild(option);
        }
    }

    /**
     * Returns the selected OBJ file from the local folder input.
     *
     * @returns {File | null}
     * @private
     */
    #getSelectedObjFile() {
        if (this.#localObjFiles.length === ZERO) {
            return null;
        }

        if (this.#localObjFiles.length === ONE) {
            return this.#localObjFiles[ZERO];
        }

        const selectedName = this.#localObjSelect.value;
        return this.#localObjFiles.find((file) => file.name === selectedName) || this.#localObjFiles[ZERO];
    }

    /**
     * Loads a model from the selected local folder files.
     *
     * @private
     */
    #loadLocalModel() {
        (async () => {
            const objFile = this.#getSelectedObjFile();

            if (!(objFile instanceof File)) {
                this.#updateLocalStatus(LOCAL_STATUS_SELECT_FOLDER);
                return;
            }

            if (!(this.#localFileMap instanceof Map)) {
                this.#updateLocalStatus(LOCAL_STATUS_RESELECT_FOLDER);
                return;
            }

            this.#updateLocalStatus(LOCAL_STATUS_LOADING);

            try {
                const objText           = await objFile.text();
                const requiredLibraries = this.#parseObjMaterialLibraries(objText);
                const requiredMtlFiles  = [];
                const missingMtls       = [];
                const mtlTexts          = [];

                for (const library of requiredLibraries) {
                    const file = this.#findFileInMap(this.#localFileMap, library);

                    if (!file) {
                        missingMtls.push(library);
                        continue;
                    }

                    requiredMtlFiles.push(file);
                    mtlTexts.push(await file.text());
                }

                if (missingMtls.length > ZERO) {
                    this.#updateLocalStatus(`${MISSING_MTL_MESSAGE_PREFIX}${missingMtls.join(LIST_SEPARATOR)}`);
                    return;
                }

                const requiredTextures = new Set();

                for (const text of mtlTexts) {
                    const textures = this.#parseMtlTextureReferences(text);

                    for (const texture of textures) {
                        requiredTextures.add(texture);
                    }
                }

                const missingTextures      = [];
                const requiredTextureFiles = [];

                for (const texture of requiredTextures) {
                    const file = this.#findFileInMap(this.#localFileMap, texture);

                    if (!file) {
                        missingTextures.push(texture);
                        continue;
                    }

                    requiredTextureFiles.push(file);
                }

                if (missingTextures.length > ZERO) {
                    this.#updateLocalStatus(`${MISSING_TEXTURE_MESSAGE_PREFIX}${missingTextures.join(LIST_SEPARATOR)}`);
                    return;
                }

                const assetUrlMap = new Map();
                this.#revokeBlobUrls();
                const requiredFiles = [objFile, ...requiredMtlFiles, ...requiredTextureFiles];

                for (const file of requiredFiles) {
                    const blobUrl = URL.createObjectURL(file);
                    this.#activeBlobUrls.push(blobUrl);
                    this.#addFileUrlToMap(assetUrlMap, file, blobUrl);
                }

                this.#clearLoadedModel();

                const result = await this.#loader.loadFromFiles({
                    objFile,
                    mtlFiles : this.#localFileMap,
                    assetUrlMap
                });

                this.#applyLoadedResult(result, LOCAL_MODEL_Y_OFFSET);
                this.#updateLocalStatus(LOCAL_STATUS_READY);
            } catch (error) {
                console.error(error);
                this.#updateLocalStatus(LOCAL_STATUS_ERROR);
            }
        })();
    }

    /**
     * Applies a loaded model result to the scene.
     *
     * @param {{ root: GeraWebGL.Object3D, meshes: GeraWebGL.Mesh[] }} result - Load result.
     * @param {number} yOffset                                                - Vertical offset.
     * @private
     */
    #applyLoadedResult(result, yOffset) {
        this.#loadedRoot   = result.root;
        this.#loadedMeshes = result.meshes;
        this.#loadedRoot.position.y += yOffset;
        this.#loadedMeshes.forEach((mesh) => mesh.material.setWireframeEnabled(this.#wireframeEnabled));
        this.#engine.scene.add(this.#loadedRoot);
    }

    /**
     * Clears the currently loaded model from the scene.
     *
     * @private
     */
    #clearLoadedModel() {
        if (this.#loadedRoot) {
            this.#engine.scene.remove(this.#loadedRoot);
        }

        this.#loadedRoot   = null;
        this.#loadedMeshes = [];
    }

    /**
     * Revokes the active blob URLs, created for local assets.
     *
     * @private
     */
    #revokeBlobUrls() {
        for (const url of this.#activeBlobUrls) {
            URL.revokeObjectURL(url);
        }

        this.#activeBlobUrls = [];
    }

    /**
     * Builds a normalized file map from a list of files.
     *
     * @param {File[]} files - Input files.
     * @returns {Map<string, File>}
     * @private
     */
    #buildFileMap(files) {
        const fileMap = new Map();

        for (const file of files) {
            if (!(file instanceof File)) {
                continue;
            }

            const normalizedPath = this.#normalizePath(file.webkitRelativePath || file.name);
            const baseName       = this.#getBasename(normalizedPath);

            fileMap.set(normalizedPath, file);

            if (!fileMap.has(baseName)) {
                fileMap.set(baseName, file);
            }
        }

        return fileMap;
    }

    /**
     * Adds a file blob URL to the asset URL map using normalized keys.
     *
     * @param {Map<string, string>} assetUrlMap - Asset URL map.
     * @param {File} file                       - File to map.
     * @param {string} url                      - Blob URL.
     * @private
     */
    #addFileUrlToMap(assetUrlMap, file, url) {
        const normalizedPath = this.#normalizePath(file.webkitRelativePath || file.name);
        const baseName       = this.#getBasename(normalizedPath);
        assetUrlMap.set(normalizedPath, url);

        if (!assetUrlMap.has(baseName)) {
            assetUrlMap.set(baseName, url);
        }
    }

    /**
     * Finds a file in the local file map by path or basename.
     *
     * @param {Map<string, File>} fileMap - File map.
     * @param {string} path               - Requested path.
     * @returns {File | null}
     * @private
     */
    #findFileInMap(fileMap, path) {
        if (!(fileMap instanceof Map) || typeof path !== TYPE_STRING) {
            return null;
        }

        const normalizedPath = this.#normalizePath(path);

        if (fileMap.has(normalizedPath)) {
            return fileMap.get(normalizedPath);
        }

        const baseName = this.#getBasename(normalizedPath);
        return fileMap.get(baseName) || null;
    }

    /**
     * Parses the OBJ text and returns the referenced MTL library names.
     *
     * @param {string} objText - OBJ text content.
     * @returns {string[]}
     * @private
     */
    #parseObjMaterialLibraries(objText) {
        const materialLibraries = [];
        const lines = objText.split(LINE_BREAK_REGEX);

        for (const line of lines) {
            const trimmed = line.trim();

            if (!trimmed || trimmed.startsWith(COMMENT_TOKEN)) {
                continue;
            }

            const parts = trimmed.split(LINE_SPLIT_REGEX);

            if (parts[ZERO] === OBJ_MATERIAL_LIB_TOKEN) {
                const libName = parts.slice(ONE).join(SPACE_SEPARATOR);

                if (libName) {
                    materialLibraries.push(libName);
                }
            }
        }

        return materialLibraries;
    }

    /**
     * Parses the MTL text and returns the referenced texture map paths.
     *
     * @param {string} mtlText - MTL text content.
     * @returns {string[]}
     * @private
     */
    #parseMtlTextureReferences(mtlText) {
        const textures = [];
        const lines    = mtlText.split(LINE_BREAK_REGEX);

        for (const line of lines) {
            const trimmed = line.trim();

            if (!trimmed || trimmed.startsWith(COMMENT_TOKEN)) {
                continue;
            }

            const parts   = trimmed.split(LINE_SPLIT_REGEX);
            const keyword = parts[ZERO];

            if (!MTL_MAP_TOKENS.has(keyword)) {
                continue;
            }

            const mapPath = this.#parseMtlMapLine(trimmed);

            if (mapPath) {
                textures.push(mapPath);
            }
        }

        return textures;
    }

    /**
     * Parses the `map_*` line and extracts the file path.
     *
     * @param {string} line - MTL map line.
     * @returns {string}
     * @private
     */
    #parseMtlMapLine(line) {
        if (typeof line !== TYPE_STRING) {
            return EMPTY_STRING;
        }

        let sanitized      = line;
        const commentIndex = sanitized.indexOf(COMMENT_TOKEN);

        if (commentIndex !== NOT_FOUND_INDEX) {
            sanitized = sanitized.slice(ZERO, commentIndex);
        }

        sanitized = sanitized.trim();

        if (!sanitized) {
            return EMPTY_STRING;
        }

        const tokens = this.#splitTokens(sanitized);

        if (tokens.length < MIN_MTL_MAP_TOKENS) {
            return EMPTY_STRING;
        }

        let index = MTL_MAP_FILENAME_START_INDEX;

        while (index < tokens.length) {
            const token = tokens[index];

            if (token.startsWith(MTL_OPTION_PREFIX)) {
                switch (token) {
                    case MTL_MAP_OPTION_SCALE:
                    case MTL_MAP_OPTION_OFFSET:
                        index += MTL_MAP_VECTOR_COMPONENTS + INDEX_INCREMENT;
                        break;

                    case MTL_MAP_OPTION_CLAMP:
                    case MTL_MAP_OPTION_BUMP_MULTIPLIER:
                        index += MTL_MAP_SCALAR_COMPONENTS + INDEX_INCREMENT;
                        break;

                    default:
                        index += INDEX_INCREMENT;
                        break;
                }

                continue;
            }

            return tokens.slice(index).join(SPACE_SEPARATOR);
        }

        return EMPTY_STRING;
    }

    /**
     * Splits a line into tokens while respecting the quotes.
     *
     * @param {string} line - Input line.
     * @returns {string[]}
     * @private
     */
    #splitTokens(line) {
        const tokens     = [];
        let currentToken = EMPTY_STRING;
        let inQuotes     = false;

        for (const char of line) {
            if (char === QUOTE_TOKEN) {
                inQuotes = !inQuotes;
                continue;
            }

            if (!inQuotes && LINE_SPLIT_REGEX.test(char)) {
                if (currentToken) {
                    tokens.push(currentToken);
                    currentToken = EMPTY_STRING;
                }

                continue;
            }

            currentToken += char;
        }

        if (currentToken) {
            tokens.push(currentToken);
        }

        return tokens;
    }

    /**
     * Normalizes a path string by trimming, unquoting, and replacing separators.
     *
     * @param {string} path - Input path.
     * @returns {string}
     * @private
     */
    #normalizePath(path) {
        if (typeof path !== TYPE_STRING) {
            return EMPTY_STRING;
        }

        let normalized = path.trim();

        if (
            normalized.startsWith(QUOTE_TOKEN)
            && normalized.endsWith(QUOTE_TOKEN)
            && normalized.length >= MIN_QUOTED_PATH_LENGTH
        ) {
            normalized = normalized.slice(QUOTE_TRIM_START_INDEX, normalized.length - QUOTE_TRIM_END_OFFSET);
        }

        if (normalized.includes(BACKSLASH_TOKEN)) {
            normalized = normalized.replace(BACKSLASH_REGEX, PATH_SEPARATOR);
        }

        return normalized.trim();
    }

    /**
     * Returns a basename for a normalized path.
     *
     * @param {string} normalizedPath - Normalized path.
     * @returns {string}
     * @private
     */
    #getBasename(normalizedPath) {
        const lastIndex = normalizedPath.lastIndexOf(PATH_SEPARATOR);

        if (lastIndex === NOT_FOUND_INDEX) {
            return normalizedPath;
        }

        return normalizedPath.slice(lastIndex + INDEX_INCREMENT);
    }

    /**
     * Toggles wireframe state and applies it to all loaded meshes.
     *
     * @private
     */
    #toggleWireframe() {
        this.#wireframeEnabled = !this.#wireframeEnabled;
        this.#updateWireframeLabel(this.#wireframeButton, this.#wireframeEnabled);
        this.#loadedMeshes.forEach((mesh) => mesh.material.setWireframeEnabled(this.#wireframeEnabled));
    }

    /**
     * Resets orbit controls to the default configuration.
     *
     * @private
     */
    #resetView() {
        this.#orbitControls.dispose();
        this.#orbitControls = this.#createOrbitControls(this.#engine.camera, this.#canvas);
    }

    /**
     * Per-frame update callback.
     *
     * @param {number} deltaTime - Time since last frame in seconds.
     * @private
     */
    #onFrame(deltaTime) {
        this.#fpsCounter.update(deltaTime);

        if (this.#loadedRoot) {
            this.#loadedRoot.rotation.y += deltaTime * MODEL_ROTATION_SPEED;
        }

        this.#orbitControls.update();
    }

    /**
     * Runs the demo application from DOM.
     */
    static run() {
        const canvas = document.getElementById(CANVAS_ELEMENT_ID);

        if (!(canvas instanceof HTMLCanvasElement)) {
            throw new Error(ERROR_CANVAS_NOT_FOUND);
        }

        const wireframeButton   = document.getElementById(WIREFRAME_TOGGLE_BUTTON_ID);
        const resetButton       = document.getElementById(RESET_VIEW_BUTTON_ID);
        const statusLabel       = document.getElementById(STATUS_LABEL_ID);
        const localFolderInput  = document.getElementById(LOCAL_FOLDER_INPUT_ID);
        const localLoadButton   = document.getElementById(LOCAL_LOAD_BUTTON_ID);
        const localStatusLabel  = document.getElementById(LOCAL_STATUS_LABEL_ID);
        const localObjSelect    = document.getElementById(LOCAL_OBJ_SELECT_ID);
        const localObjSelectRow = document.getElementById(LOCAL_OBJ_SELECT_ROW_ID);

        if (!(wireframeButton instanceof HTMLButtonElement)) {
            throw new Error(ERROR_WIREFRAME_BUTTON_NOT_FOUND);
        }

        if (!(resetButton instanceof HTMLButtonElement)) {
            throw new Error(ERROR_RESET_BUTTON_NOT_FOUND);
        }

        if (!(statusLabel instanceof HTMLElement)) {
            throw new Error(ERROR_STATUS_LABEL_NOT_FOUND);
        }

        if (!(localFolderInput instanceof HTMLInputElement)) {
            throw new Error(ERROR_LOCAL_FOLDER_INPUT_NOT_FOUND);
        }

        if (!(localLoadButton instanceof HTMLButtonElement)) {
            throw new Error(ERROR_LOCAL_LOAD_BUTTON_NOT_FOUND);
        }

        if (!(localStatusLabel instanceof HTMLElement)) {
            throw new Error(ERROR_LOCAL_STATUS_LABEL_NOT_FOUND);
        }

        if (!(localObjSelect instanceof HTMLSelectElement)) {
            throw new Error(ERROR_LOCAL_OBJ_SELECT_NOT_FOUND);
        }

        if (!(localObjSelectRow instanceof HTMLElement)) {
            throw new Error(ERROR_LOCAL_OBJ_SELECT_ROW_NOT_FOUND);
        }

        const app = new ObjMtlDemoApp(
            canvas,
            wireframeButton,
            resetButton,
            statusLabel,
            localFolderInput,
            localLoadButton,
            localStatusLabel,
            localObjSelect,
            localObjSelectRow
        );

        app.start();
    }
}

window.addEventListener(DOM_CONTENT_LOADED_EVENT, () => ObjMtlDemoApp.run());

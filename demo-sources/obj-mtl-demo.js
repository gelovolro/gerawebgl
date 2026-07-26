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
 * Lighting toggle input id.
 *
 * @type {string}
 */
const LIGHTING_TOGGLE_INPUT_ID = 'lightingToggleInput';

/**
 * Directional light toggle input id.
 *
 * @type {string}
 */
const DIRECTIONAL_LIGHT_TOGGLE_INPUT_ID = 'directionalLightToggleInput';

/**
 * Ambient light toggle input id.
 *
 * @type {string}
 */
const AMBIENT_LIGHT_TOGGLE_INPUT_ID = 'ambientLightToggleInput';

/**
 * Directional strength input id.
 *
 * @type {string}
 */
const DIRECTIONAL_STRENGTH_INPUT_ID = 'directionalStrengthInput';

/**
 * Directional strength label id.
 *
 * @type {string}
 */
const DIRECTIONAL_STRENGTH_LABEL_ID = 'directionalStrengthLabel';

/**
 * Directional strength value label id.
 *
 * @type {string}
 */
const DIRECTIONAL_STRENGTH_VALUE_ID = 'directionalStrengthValue';

/**
 * Ambient strength input id.
 *
 * @type {string}
 */
const AMBIENT_STRENGTH_INPUT_ID = 'ambientStrengthInput';

/**
 * Ambient strength label id.
 *
 * @type {string}
 */
const AMBIENT_STRENGTH_LABEL_ID = 'ambientStrengthLabel';

/**
 * Ambient strength value label id.
 *
 * @type {string}
 */
const AMBIENT_STRENGTH_VALUE_ID = 'ambientStrengthValue';

/**
 * Light gizmo toggle input id.
 *
 * @type {string}
 */
const LIGHT_GIZMO_TOGGLE_INPUT_ID = 'lightGizmoToggleInput';

/**
 * Active lights label element id.
 *
 * @type {string}
 */
const ACTIVE_LIGHTS_LABEL_ID = 'activeLightsLabel';

/**
 * Light position label element id.
 *
 * @type {string}
 */
const LIGHT_POSITION_LABEL_ID = 'lightPositionLabel';

/**
 * Light point label element id.
 *
 * @type {string}
 */
const LIGHT_POINT_LABEL_ID = 'lightPointLabel';

/**
 * Drag axis label element id.
 *
 * @type {string}
 */
const DRAG_AXIS_LABEL_ID = 'dragAxisLabel';

/**
 * Rotate light toggle input id.
 *
 * @type {string}
 */
const ROTATE_LIGHT_TOGGLE_INPUT_ID = 'rotateLightToggleInput';

/**
 * Rotate light toggle label id.
 *
 * @type {string}
 */
const ROTATE_LIGHT_TOGGLE_LABEL_ID = 'rotateLightToggleLabel';

/**
 * Drag light toggle input id.
 *
 * @type {string}
 */
const DRAG_LIGHT_TOGGLE_INPUT_ID = 'dragLightToggleInput';

/**
 * Drag light toggle label id.
 *
 * @type {string}
 */
const DRAG_LIGHT_TOGGLE_LABEL_ID = 'dragLightToggleLabel';

/**
 * Change light point toggle input id.
 *
 * @type {string}
 */
const CHANGE_LIGHT_POINT_TOGGLE_INPUT_ID = 'changeLightPointToggleInput';

/**
 * Change light point toggle label id.
 *
 * @type {string}
 */
const CHANGE_LIGHT_POINT_TOGGLE_LABEL_ID = 'changeLightPointToggleLabel';

/**
 * Model auto-rotation toggle input id.
 *
 * @type {string}
 */
const PAUSE_CAMERA_ROTATION_TOGGLE_INPUT_ID = 'pauseCameraRotationToggleInput';

/**
 * Model auto-rotation toggle label id.
 *
 * @type {string}
 */
const PAUSE_CAMERA_ROTATION_TOGGLE_LABEL_ID = 'pauseCameraRotationToggleLabel';

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
 * Active lights label prefix.
 *
 * @type {string}
 */
const ACTIVE_LIGHTS_LABEL_PREFIX = 'Active lights: ';

/**
 * Active lights label separator.
 *
 * @type {string}
 */
const ACTIVE_LIGHTS_LABEL_SEPARATOR = ' + ';

/**
 * Active lights label shown for the unlit state.
 *
 * @type {string}
 */
const ACTIVE_LIGHTS_LABEL_UNLIT = 'None (unlit)';

/**
 * Active lights label for directional lights.
 *
 * @type {string}
 */
const ACTIVE_LIGHTS_LABEL_DIRECTIONAL = 'DirectionalLight';

/**
 * Active lights label for ambient lights.
 *
 * @type {string}
 */
const ACTIVE_LIGHTS_LABEL_AMBIENT = 'AmbientLight';

/**
 * Directional strength label text.
 *
 * @type {string}
 */
const DIRECTIONAL_STRENGTH_LABEL_TEXT = 'Directional strength';

/**
 * Ambient strength label text.
 *
 * @type {string}
 */
const AMBIENT_STRENGTH_LABEL_TEXT = 'Ambient strength';

/**
 * Light position label prefix.
 *
 * @type {string}
 */
const LIGHT_POSITION_LABEL_PREFIX = 'Light position: ';

/**
 * Light point label prefix.
 *
 * @type {string}
 */
const LIGHT_POINT_LABEL_PREFIX = 'Light point: ';

/**
 * Light position label X prefix.
 *
 * @type {string}
 */
const LIGHT_POSITION_LABEL_X_PREFIX = 'x=';

/**
 * Light position label Y prefix.
 *
 * @type {string}
 */
const LIGHT_POSITION_LABEL_Y_PREFIX = ' y=';

/**
 * Light position label Z prefix.
 *
 * @type {string}
 */
const LIGHT_POSITION_LABEL_Z_PREFIX = ' z=';

/**
 * Drag axis label prefix.
 *
 * @type {string}
 */
const DRAG_AXIS_LABEL_PREFIX = 'Drag axis: ';

/**
 * Drag axis label for X.
 *
 * @type {string}
 */
const DRAG_AXIS_LABEL_X = 'X';

/**
 * Drag axis label for Y.
 *
 * @type {string}
 */
const DRAG_AXIS_LABEL_Y = 'Y';

/**
 * Drag axis label for Z.
 *
 * @type {string}
 */
const DRAG_AXIS_LABEL_Z = 'Z';

/**
 * Drag axis label for "None".
 *
 * @type {string}
 */
const DRAG_AXIS_LABEL_NONE = 'None';

/**
 * Move light toggle label text.
 *
 * @type {string}
 */
const MOVE_LIGHT_LABEL_TEXT = 'Move light';

/**
 * Drag light toggle label text.
 *
 * @type {string}
 */
const DRAG_LIGHT_LABEL_TEXT = 'Drag light (raycast)';

/**
 * Change light point toggle label text.
 *
 * @type {string}
 */
const CHANGE_LIGHT_POINT_LABEL_TEXT = 'Change light point (raycast)';

/**
 * Model auto-rotation toggle label text.
 *
 * @type {string}
 */
const PAUSE_CAMERA_ROTATION_LABEL_TEXT = 'Auto rotate model';

/**
 * Decimal precision used for light position label values.
 *
 * @type {number}
 */
const LIGHT_POSITION_DECIMALS = 2;

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
 * Default lighting enabled state.
 *
 * @type {boolean}
 */
const DEFAULT_LIGHTING_ENABLED = true;

/**
 * Default directional light enabled state.
 *
 * @type {boolean}
 */
const DEFAULT_DIRECTIONAL_LIGHT_ENABLED = true;

/**
 * Default ambient light enabled state.
 *
 * @type {boolean}
 */
const DEFAULT_AMBIENT_LIGHT_ENABLED = true;

/**
 * Minimum directional strength.
 *
 * @type {number}
 */
const DIRECTIONAL_STRENGTH_MIN = 0.0;

/**
 * Maximum directional strength.
 *
 * @type {number}
 */
const DIRECTIONAL_STRENGTH_MAX = 3.0;

/**
 * Directional strength step value.
 *
 * @type {number}
 */
const DIRECTIONAL_STRENGTH_STEP = 0.05;

/**
 * Default directional strength value.
 *
 * @type {number}
 */
const DIRECTIONAL_STRENGTH_DEFAULT = 1.0;

/**
 * Minimum ambient strength.
 *
 * @type {number}
 */
const AMBIENT_STRENGTH_MIN = 0.0;

/**
 * Maximum ambient strength.
 *
 * @type {number}
 */
const AMBIENT_STRENGTH_MAX = 1.0;

/**
 * Ambient strength step value.
 *
 * @type {number}
 */
const AMBIENT_STRENGTH_STEP = 0.01;

/**
 * Default ambient strength value.
 *
 * @type {number}
 */
const AMBIENT_STRENGTH_DEFAULT = 0.2;

/**
 * Default light gizmo visibility.
 *
 * @type {boolean}
 */
const DEFAULT_LIGHT_GIZMO_VISIBLE = false;

/**
 * Default rotate light enabled state.
 *
 * @type {boolean}
 */
const DEFAULT_ROTATE_LIGHT_ENABLED = false;

/**
 * Default drag light enabled state.
 *
 * @type {boolean}
 */
const DEFAULT_DRAG_LIGHT_ENABLED = false;

/**
 * Default change light point enabled state.
 *
 * @type {boolean}
 */
const DEFAULT_CHANGE_LIGHT_POINT_ENABLED = false;

/**
 * Default camera rotation enabled state.
 *
 * @type {boolean}
 */
const DEFAULT_CAMERA_ROTATION_ENABLED = true;

/**
 * Default model auto-rotation enabled state.
 *
 * @type {boolean}
 */
const DEFAULT_MODEL_ROTATION_ENABLED = false;

/**
 * Default directional light position X.
 *
 * @type {number}
 */
const DIRECTIONAL_LIGHT_POSITION_X = 6.0;

/**
 * Default directional light position Y.
 *
 * @type {number}
 */
const DIRECTIONAL_LIGHT_POSITION_Y = 6.0;

/**
 * Default directional light position Z.
 *
 * @type {number}
 */
const DIRECTIONAL_LIGHT_POSITION_Z = 6.0;

/**
 * Default directional light direction.
 *
 * @type {Float32Array}
 */
const DIRECTIONAL_LIGHT_DIRECTION = new Float32Array([0.5, 0.7, 1.0]);

/**
 * Light rotation speed (radians per second).
 *
 * @type {number}
 */
const LIGHT_ROTATION_SPEED = 0.6;

/**
 * Light rotation radius around the model center.
 *
 * @type {number}
 */
const LIGHT_ROTATION_RADIUS = 9.0;

/**
 * Light rotation height relative to the model center.
 *
 * @type {number}
 */
const LIGHT_ROTATION_HEIGHT = 6.0;

/**
 * Light rotation center X.
 *
 * @type {number}
 */
const LIGHT_ROTATION_CENTER_X = 0.0;

/**
 * Light rotation center Y.
 *
 * @type {number}
 */
const LIGHT_ROTATION_CENTER_Y = 0.0;

/**
 * Light rotation center Z.
 *
 * @type {number}
 */
const LIGHT_ROTATION_CENTER_Z = 0.0;

/**
 * Light target marker radius.
 *
 * @type {number}
 */
const LIGHT_TARGET_MARKER_RADIUS = 0.2;

/**
 * Multiplier to convert marker radius to diameter.
 *
 * @type {number}
 */
const LIGHT_TARGET_MARKER_DIAMETER_MULTIPLIER = 2.0;

/**
 * Light target marker diameter.
 *
 * @type {number}
 */
const LIGHT_TARGET_MARKER_DIAMETER = LIGHT_TARGET_MARKER_RADIUS * LIGHT_TARGET_MARKER_DIAMETER_MULTIPLIER;

/**
 * Light target marker longitudinal segment count.
 *
 * @type {number}
 */
const LIGHT_TARGET_MARKER_WIDTH_SEGMENTS = 16;

/**
 * Light target marker latitudinal segment count.
 *
 * @type {number}
 */
const LIGHT_TARGET_MARKER_HEIGHT_SEGMENTS = 12;

/**
 * Light target marker color (RGB).
 *
 * @type {Float32Array}
 */
const LIGHT_TARGET_MARKER_COLOR = new Float32Array([1.0, 0.9, 0.6]);

/**
 * Light target marker opacity when visible.
 *
 * @type {number}
 */
const LIGHT_TARGET_MARKER_OPACITY = 0.8;

/**
 * Light target marker opacity when hidden.
 *
 * @type {number}
 */
const LIGHT_TARGET_MARKER_HIDDEN_OPACITY = 0.0;

/**
 * Decimal precision for strength value labels.
 *
 * @type {number}
 */
const STRENGTH_LABEL_DECIMALS = 2;

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
 * Error message for missing lighting toggle input.
 *
 * @type {string}
 */
const ERROR_LIGHTING_TOGGLE_NOT_FOUND = 'Lighting toggle input not found.';

/**
 * Error message for missing directional light toggle input.
 *
 * @type {string}
 */
const ERROR_DIRECTIONAL_LIGHT_TOGGLE_NOT_FOUND = 'Directional light toggle input not found.';

/**
 * Error message for missing ambient light toggle input.
 *
 * @type {string}
 */
const ERROR_AMBIENT_LIGHT_TOGGLE_NOT_FOUND = 'Ambient light toggle input not found.';

/**
 * Error message for missing directional strength input.
 *
 * @type {string}
 */
const ERROR_DIRECTIONAL_STRENGTH_INPUT_NOT_FOUND = 'Directional strength input not found.';

/**
 * Error message for missing directional strength label.
 *
 * @type {string}
 */
const ERROR_DIRECTIONAL_STRENGTH_LABEL_NOT_FOUND = 'Directional strength label not found.';

/**
 * Error message for missing directional strength value label.
 *
 * @type {string}
 */
const ERROR_DIRECTIONAL_STRENGTH_VALUE_NOT_FOUND = 'Directional strength value label not found.';

/**
 * Error message for missing ambient strength input.
 *
 * @type {string}
 */
const ERROR_AMBIENT_STRENGTH_INPUT_NOT_FOUND = 'Ambient strength input not found.';

/**
 * Error message for missing ambient strength label.
 *
 * @type {string}
 */
const ERROR_AMBIENT_STRENGTH_LABEL_NOT_FOUND = 'Ambient strength label not found.';

/**
 * Error message for missing ambient strength value label.
 *
 * @type {string}
 */
const ERROR_AMBIENT_STRENGTH_VALUE_NOT_FOUND = 'Ambient strength value label not found.';

/**
 * Error message for missing light gizmo toggle input.
 *
 * @type {string}
 */
const ERROR_LIGHT_GIZMO_TOGGLE_NOT_FOUND = 'Light gizmo toggle input not found.';

/**
 * Error message for missing active lights label.
 *
 * @type {string}
 */
const ERROR_ACTIVE_LIGHTS_LABEL_NOT_FOUND = 'Active lights label not found.';

/**
 * Error message for missing light position label.
 *
 * @type {string}
 */
const ERROR_LIGHT_POSITION_LABEL_NOT_FOUND = 'Light position label not found.';

/**
 * Error message for missing light point label.
 *
 * @type {string}
 */
const ERROR_LIGHT_POINT_LABEL_NOT_FOUND = 'Light point label not found.';

/**
 * Error message for missing drag axis label.
 *
 * @type {string}
 */
const ERROR_DRAG_AXIS_LABEL_NOT_FOUND = 'Drag axis label not found.';

/**
 * Error message for missing rotate light toggle input.
 *
 * @type {string}
 */
const ERROR_ROTATE_LIGHT_TOGGLE_NOT_FOUND = 'Rotate light toggle input not found.';

/**
 * Error message for missing rotate light label.
 *
 * @type {string}
 */
const ERROR_ROTATE_LIGHT_LABEL_NOT_FOUND = 'Rotate light label not found.';

/**
 * Error message for missing drag light toggle input.
 *
 * @type {string}
 */
const ERROR_DRAG_LIGHT_TOGGLE_NOT_FOUND = 'Drag light toggle input not found.';

/**
 * Error message for missing drag light label.
 *
 * @type {string}
 */
const ERROR_DRAG_LIGHT_LABEL_NOT_FOUND = 'Drag light label not found.';

/**
 * Error message for missing change light point toggle input.
 *
 * @type {string}
 */
const ERROR_CHANGE_LIGHT_POINT_TOGGLE_NOT_FOUND = 'Change light point toggle input not found.';

/**
 * Error message for missing change light point label.
 *
 * @type {string}
 */
const ERROR_CHANGE_LIGHT_POINT_LABEL_NOT_FOUND = 'Change light point label not found.';

/**
 * Error message for missing pause camera rotation toggle input.
 *
 * @type {string}
 */
const ERROR_PAUSE_CAMERA_ROTATION_TOGGLE_NOT_FOUND = 'Model auto-rotation toggle input not found.';

/**
 * Error message for missing pause camera rotation label.
 *
 * @type {string}
 */
const ERROR_PAUSE_CAMERA_ROTATION_LABEL_NOT_FOUND = 'Model auto-rotation label not found.';

/**
 * Error message for invalid lighting toggle values.
 *
 * @type {string}
 */
const ERROR_LIGHTING_TOGGLE_TYPE = '`ObjMtlDemoApp.#applyLightingToggle` expects a boolean.';

/**
 * Error message for invalid directional light toggle values.
 *
 * @type {string}
 */
const ERROR_DIRECTIONAL_LIGHT_TOGGLE_TYPE = '`ObjMtlDemoApp.#applyDirectionalLightToggle` expects a boolean.';

/**
 * Error message for invalid ambient light toggle values.
 *
 * @type {string}
 */
const ERROR_AMBIENT_LIGHT_TOGGLE_TYPE = '`ObjMtlDemoApp.#applyAmbientLightToggle` expects a boolean.';

/**
 * Error message for invalid directional strength values.
 *
 * @type {string}
 */
const ERROR_DIRECTIONAL_STRENGTH_TYPE = '`ObjMtlDemoApp.#applyDirectionalStrength` expects a finite number.';

/**
 * Error message for invalid directional strength range.
 *
 * @type {string}
 */
const ERROR_DIRECTIONAL_STRENGTH_RANGE = '`ObjMtlDemoApp.#applyDirectionalStrength` expects a value in [0..3].';

/**
 * Error message for invalid ambient strength values.
 *
 * @type {string}
 */
const ERROR_AMBIENT_STRENGTH_TYPE = '`ObjMtlDemoApp.#applyAmbientStrength` expects a finite number.';

/**
 * Error message for invalid ambient strength range.
 *
 * @type {string}
 */
const ERROR_AMBIENT_STRENGTH_RANGE = '`ObjMtlDemoApp.#applyAmbientStrength` expects a value in [0..1].';

/**
 * Error message for invalid light gizmo toggle values.
 *
 * @type {string}
 */
const ERROR_LIGHT_GIZMO_TOGGLE_TYPE = '`ObjMtlDemoApp.#applyLightGizmoToggle` expects a boolean.';

/**
 * Error message for invalid rotate light toggle values.
 *
 * @type {string}
 */
const ERROR_ROTATE_LIGHT_TOGGLE_TYPE = '`ObjMtlDemoApp.#applyLightRotationToggle` expects a boolean.';

/**
 * Error message for invalid drag light toggle values.
 *
 * @type {string}
 */
const ERROR_DRAG_LIGHT_TOGGLE_TYPE = '`ObjMtlDemoApp.#applyLightDragToggle` expects a boolean.';

/**
 * Error message for invalid change light point toggle values.
 *
 * @type {string}
 */
const ERROR_CHANGE_LIGHT_POINT_TOGGLE_TYPE = '`ObjMtlDemoApp.#applyChangeLightPointToggle` expects a boolean.';

/**
 * Error message for invalid pause camera rotation toggle values.
 *
 * @type {string}
 */
const ERROR_PAUSE_CAMERA_ROTATION_TOGGLE_TYPE = '`ObjMtlDemoApp.#applyPauseCameraRotationToggle` expects a boolean.';

/**
 * Error message for missing directional light.
 *
 * @type {string}
 */
const ERROR_DIRECTIONAL_LIGHT_MISSING = 'Directional light is missing.';

/**
 * Error message for invalid checkbox inputs.
 *
 * @type {string}
 */
const ERROR_CHECKBOX_INPUT_TYPE = '`ObjMtlDemoApp.#setCheckboxState` expects a HTMLInputElement and boolean.';

/**
 * Error message for invalid range input updates.
 *
 * @type {string}
 */
const ERROR_RANGE_INPUT_TYPE = '`ObjMtlDemoApp.#setRangeInputValue` expects a HTMLInputElement and finite number.';

/**
 * Error message for invalid pointer events.
 *
 * @type {string}
 */
const ERROR_POINTER_EVENT_TYPE = '`ObjMtlDemoApp` expects a PointerEvent instance.';

/**
 * Error message for invalid canvas elements.
 *
 * @type {string}
 */
const ERROR_POINTER_CANVAS_TYPE = '`ObjMtlDemoApp.#updateMouseNdcFromEvent` expects a HTMLCanvasElement.';

/**
 * Error message for invalid mouse NDC objects.
 *
 * @type {string}
 */
const ERROR_POINTER_NDC_TYPE = '`ObjMtlDemoApp.#updateMouseNdcFromEvent` expects an object with numeric x/y.';

/**
 * Error message for invalid axis identifiers.
 *
 * @type {string}
 */
const ERROR_DRAG_AXIS_TYPE = '`ObjMtlDemoApp.#getAxisDirection` expects axis "x", "y", or "z".';

/**
 * Error message for invalid vector inputs.
 *
 * @type {string}
 */
const ERROR_VECTOR3_TYPE = '`ObjMtlDemoApp` expects a Vector3 instance.';

/**
 * Error message for invalid delta time values.
 *
 * @type {string}
 */
const ERROR_DELTA_TIME_TYPE = '`ObjMtlDemoApp.#updateLightRotation` expects a finite deltaTime value.';

/**
 * Error message for invalid unproject matrix.
 *
 * @type {string}
 */
const ERROR_UNPROJECT_MATRIX_TYPE = '`ObjMtlDemoApp.#unprojectToVector` expects a 4x4 Float32Array matrix.';

/**
 * Error message for invalid unproject W component.
 *
 * @type {string}
 */
const ERROR_UNPROJECT_W_ZERO = '`ObjMtlDemoApp.#unprojectToVector` failed, W component is zero.';

/**
 * Error message for missing transform gizmo.
 *
 * @type {string}
 */
const ERROR_TRANSFORM_GIZMO_MISSING = '`ObjMtlDemoApp` transform gizmo is not initialized.';

/**
 * Error message for missing light target object.
 *
 * @type {string}
 */
const ERROR_LIGHT_TARGET_OBJECT_MISSING = '`ObjMtlDemoApp` light target object is not initialized.';

/**
 * Error message for missing light target gizmo.
 *
 * @type {string}
 */
const ERROR_LIGHT_TARGET_GIZMO_MISSING = '`ObjMtlDemoApp` light target gizmo is not initialized.';

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
 * DOM input event name.
 *
 * @type {string}
 */
const INPUT_EVENT = 'input';

/**
 * DOM click event name.
 *
 * @type {string}
 */
const CLICK_EVENT = 'click';

/**
 * Pointer down event name.
 *
 * @type {string}
 */
const POINTER_DOWN_EVENT = 'pointerdown';

/**
 * Pointer move event name.
 *
 * @type {string}
 */
const POINTER_MOVE_EVENT = 'pointermove';

/**
 * Pointer up event name.
 *
 * @type {string}
 */
const POINTER_UP_EVENT = 'pointerup';

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
 * Boolean type token.
 *
 * @type {string}
 */
const TYPE_BOOLEAN = 'boolean';

/**
 * Number type token.
 *
 * @type {string}
 */
const TYPE_NUMBER = 'number';

/**
 * Pointer listener options for capture phase.
 *
 * @type {AddEventListenerOptions}
 */
const POINTER_CAPTURE_OPTIONS = { capture: true };

/**
 * Matrix element count for 4x4 matrices.
 *
 * @type {number}
 */
const MATRIX_4X4_ELEMENT_COUNT = 16;

/**
 * Matrix index 0,0.
 *
 * @type {number}
 */
const MATRIX_INDEX_00 = 0;

/**
 * Matrix index 0,1.
 *
 * @type {number}
 */
const MATRIX_INDEX_01 = 1;

/**
 * Matrix index 0,2.
 *
 * @type {number}
 */
const MATRIX_INDEX_02 = 2;

/**
 * Matrix index 0,3.
 *
 * @type {number}
 */
const MATRIX_INDEX_03 = 3;

/**
 * Matrix index 1,0.
 *
 * @type {number}
 */
const MATRIX_INDEX_10 = 4;

/**
 * Matrix index 1,1.
 *
 * @type {number}
 */
const MATRIX_INDEX_11 = 5;

/**
 * Matrix index 1,2.
 *
 * @type {number}
 */
const MATRIX_INDEX_12 = 6;

/**
 * Matrix index 1,3.
 *
 * @type {number}
 */
const MATRIX_INDEX_13 = 7;

/**
 * Matrix index 2,0.
 *
 * @type {number}
 */
const MATRIX_INDEX_20 = 8;

/**
 * Matrix index 2,1.
 *
 * @type {number}
 */
const MATRIX_INDEX_21 = 9;

/**
 * Matrix index 2,2.
 *
 * @type {number}
 */
const MATRIX_INDEX_22 = 10;

/**
 * Matrix index 2,3.
 *
 * @type {number}
 */
const MATRIX_INDEX_23 = 11;

/**
 * Matrix index 3,0.
 *
 * @type {number}
 */
const MATRIX_INDEX_30 = 12;

/**
 * Matrix index 3,1.
 *
 * @type {number}
 */
const MATRIX_INDEX_31 = 13;

/**
 * Matrix index 3,2.
 *
 * @type {number}
 */
const MATRIX_INDEX_32 = 14;

/**
 * Matrix index 3,3.
 *
 * @type {number}
 */
const MATRIX_INDEX_33 = 15;

/**
 * Vector element count for 3D vectors.
 *
 * @type {number}
 */
const VECTOR3_ELEMENT_COUNT = 3;

/**
 * Vector component index for X.
 *
 * @type {number}
 */
const VECTOR_INDEX_X = 0;

/**
 * Vector component index for Y.
 *
 * @type {number}
 */
const VECTOR_INDEX_Y = 1;

/**
 * Vector component index for Z.
 *
 * @type {number}
 */
const VECTOR_INDEX_Z = 2;

/**
 * NDC scale factor.
 *
 * @type {number}
 */
const NDC_SCALE = 2.0;

/**
 * NDC offset factor.
 *
 * @type {number}
 */
const NDC_OFFSET = -1.0;

/**
 * NDC Y axis flip factor.
 *
 * @type {number}
 */
const NDC_Y_FLIP = -1.0;

/**
 * Ray NDC depth for the near plane.
 *
 * @type {number}
 */
const RAY_NDC_NEAR = -1.0;

/**
 * Ray NDC depth for the far plane.
 *
 * @type {number}
 */
const RAY_NDC_FAR = 1.0;

/**
 * Ray clip-space W component.
 *
 * @type {number}
 */
const RAY_CLIP_W = 1.0;

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
 * World matrix index for X axis X component.
 *
 * @type {number}
 */
const WORLD_AXIS_X_INDEX_X = 0;

/**
 * World matrix index for X axis Y component.
 *
 * @type {number}
 */
const WORLD_AXIS_X_INDEX_Y = 1;

/**
 * World matrix index for X axis Z component.
 *
 * @type {number}
 */
const WORLD_AXIS_X_INDEX_Z = 2;

/**
 * World matrix index for Y axis X component.
 *
 * @type {number}
 */
const WORLD_AXIS_Y_INDEX_X = 4;

/**
 * World matrix index for Y axis Y component.
 *
 * @type {number}
 */
const WORLD_AXIS_Y_INDEX_Y = 5;

/**
 * World matrix index for Y axis Z component.
 *
 * @type {number}
 */
const WORLD_AXIS_Y_INDEX_Z = 6;

/**
 * World matrix index for Z axis X component.
 *
 * @type {number}
 */
const WORLD_AXIS_Z_INDEX_X = 8;

/**
 * World matrix index for Z axis Y component.
 *
 * @type {number}
 */
const WORLD_AXIS_Z_INDEX_Y = 9;

/**
 * World matrix index for Z axis Z component.
 *
 * @type {number}
 */
const WORLD_AXIS_Z_INDEX_Z = 10;

/**
 * Epsilon used for ray/axis computations.
 *
 * @type {number}
 */
const RAY_AXIS_EPSILON = 1e-6;

/**
 * Minimum squared length allowed for light direction updates.
 *
 * @type {number}
 */
const LIGHT_DIRECTION_MIN_LENGTH_SQUARED = 1e-6;

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
     * Lighting toggle checkbox.
     *
     * @type {HTMLInputElement}
     * @private
     */
    #lightingToggle;

    /**
     * Directional light toggle checkbox.
     *
     * @type {HTMLInputElement}
     * @private
     */
    #directionalLightToggle;

    /**
     * Ambient light toggle checkbox.
     *
     * @type {HTMLInputElement}
     * @private
     */
    #ambientLightToggle;

    /**
     * Directional strength range input.
     *
     * @type {HTMLInputElement}
     * @private
     */
    #directionalStrengthInput;

    /**
     * Directional strength label element.
     *
     * @type {HTMLElement}
     * @private
     */
    #directionalStrengthLabel;

    /**
     * Directional strength value label element.
     *
     * @type {HTMLElement}
     * @private
     */
    #directionalStrengthValueLabel;

    /**
     * Ambient strength range input.
     *
     * @type {HTMLInputElement}
     * @private
     */
    #ambientStrengthInput;

    /**
     * Ambient strength label element.
     *
     * @type {HTMLElement}
     * @private
     */
    #ambientStrengthLabel;

    /**
     * Ambient strength value label element.
     *
     * @type {HTMLElement}
     * @private
     */
    #ambientStrengthValueLabel;

    /**
     * Light gizmo toggle checkbox.
     *
     * @type {HTMLInputElement}
     * @private
     */
    #lightGizmoToggle;

    /**
     * Active lights label element.
     *
     * @type {HTMLElement}
     * @private
     */
    #activeLightsLabel;

    /**
     * Light position label element.
     *
     * @type {HTMLElement}
     * @private
     */
    #lightPositionLabel;

    /**
     * Light point label element.
     *
     * @type {HTMLElement}
     * @private
     */
    #lightPointLabel;

    /**
     * Drag axis label element.
     *
     * @type {HTMLElement}
     * @private
     */
    #dragAxisLabel;

    /**
     * Rotate light toggle checkbox.
     *
     * @type {HTMLInputElement}
     * @private
     */
    #rotateLightToggle;

    /**
     * Rotate light toggle label element.
     *
     * @type {HTMLElement}
     * @private
     */
    #rotateLightLabel;

    /**
     * Drag light toggle checkbox.
     *
     * @type {HTMLInputElement}
     * @private
     */
    #dragLightToggle;

    /**
     * Drag light toggle label element.
     *
     * @type {HTMLElement}
     * @private
     */
    #dragLightLabel;

    /**
     * Change light point toggle checkbox.
     *
     * @type {HTMLInputElement}
     * @private
     */
    #changeLightPointToggle;

    /**
     * Change light point toggle label element.
     *
     * @type {HTMLElement}
     * @private
     */
    #changeLightPointLabel;

    /**
     * Model auto-rotation toggle checkbox.
     *
     * @type {HTMLInputElement}
     * @private
     */
    #pauseCameraRotationToggle;

    /**
     * Model auto-rotation toggle label element.
     *
     * @type {HTMLElement}
     * @private
     */
    #pauseCameraRotationLabel;

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
     * Current lighting enabled state.
     *
     * @type {boolean}
     * @private
     */
    #lightingEnabled = DEFAULT_LIGHTING_ENABLED;

    /**
     * Current directional light enabled state.
     *
     * @type {boolean}
     * @private
     */
    #directionalLightEnabled = DEFAULT_DIRECTIONAL_LIGHT_ENABLED;

    /**
     * Current ambient light enabled state.
     *
     * @type {boolean}
     * @private
     */
    #ambientLightEnabled = DEFAULT_AMBIENT_LIGHT_ENABLED;

    /**
     * Current directional strength value.
     *
     * @type {number}
     * @private
     */
    #directionalStrength = DIRECTIONAL_STRENGTH_DEFAULT;

    /**
     * Current ambient strength value.
     *
     * @type {number}
     * @private
     */
    #ambientStrength = AMBIENT_STRENGTH_DEFAULT;

    /**
     * Current light gizmo visibility state.
     *
     * @type {boolean}
     * @private
     */
    #lightGizmoVisible = DEFAULT_LIGHT_GIZMO_VISIBLE;

    /**
     * Current rotate light enabled state.
     *
     * @type {boolean}
     * @private
     */
    #rotateLightEnabled = DEFAULT_ROTATE_LIGHT_ENABLED;

    /**
     * Current drag light enabled state.
     *
     * @type {boolean}
     * @private
     */
    #dragLightEnabled = DEFAULT_DRAG_LIGHT_ENABLED;

    /**
     * Current change light point enabled state.
     *
     * @type {boolean}
     * @private
     */
    #changeLightPointEnabled = DEFAULT_CHANGE_LIGHT_POINT_ENABLED;

    /**
     * Current camera rotation enabled state.
     *
     * @type {boolean}
     * @private
     */
    #cameraRotationEnabled = DEFAULT_CAMERA_ROTATION_ENABLED;

    /**
     * Current model auto-rotation enabled state.
     *
     * @type {boolean}
     * @private
     */
    #modelAutoRotateEnabled = DEFAULT_MODEL_ROTATION_ENABLED;

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
     * Directional light instance.
     *
     * @type {GeraWebGL.DirectionalLight}
     * @private
     */
    #directionalLight;

    /**
     * Ambient light instance.
     *
     * @type {GeraWebGL.AmbientLight}
     * @private
     */
    #ambientLight;

    /**
     * Light gizmo instance.
     *
     * @type {GeraWebGL.Debug.LightGizmo}
     * @private
     */
    #lightGizmo;

    /**
     * Transform gizmo instance.
     *
     * @type {GeraWebGL.Debug.TransformGizmo}
     * @private
     */
    #transformGizmo;

    /**
     * Light target object used as directional light focus.
     *
     * @type {GeraWebGL.Object3D}
     * @private
     */
    #lightTargetObject;

    /**
     * Light target marker mesh.
     *
     * @type {GeraWebGL.Mesh}
     * @private
     */
    #lightTargetMarker;

    /**
     * Light target transform gizmo instance.
     *
     * @type {GeraWebGL.Debug.TransformGizmo}
     * @private
     */
    #lightTargetGizmo;

    /**
     * Transform gizmo anchor for world-aligned dragging.
     *
     * @type {GeraWebGL.Object3D}
     * @private
     */
    #transformGizmoAnchor;

    /**
     * Raycaster instance for light dragging.
     *
     * @type {GeraWebGL.Raycaster}
     * @private
     */
    #raycaster;

    /**
     * Cached mouse coordinates in NDC space.
     *
     * @type {{x: number, y: number}}
     * @private
     */
    #mouseNdc;

    /**
     * Cached canvas bounds for drag computations.
     *
     * @type {{ left: number, top: number, width: number, height: number }}
     * @private
     */
    #canvasBounds;

    /**
     * Flag indicating cached canvas bounds are available.
     *
     * @type {boolean}
     * @private
     */
    #hasCachedBounds = false;

    /**
     * Cached view-projection matrix.
     *
     * @type {Float32Array}
     * @private
     */
    #viewProjectionMatrix;

    /**
     * Cached inverse view-projection matrix.
     *
     * @type {Float32Array}
     * @private
     */
    #inverseViewProjectionMatrix;

    /**
     * Cached ray origin.
     *
     * @type {GeraWebGL.Math.Vector3}
     * @private
     */
    #rayOrigin;

    /**
     * Cached ray direction.
     *
     * @type {GeraWebGL.Math.Vector3}
     * @private
     */
    #rayDirection;

    /**
     * Cached ray near point.
     *
     * @type {GeraWebGL.Math.Vector3}
     * @private
     */
    #rayNearPoint;

    /**
     * Cached ray far point.
     *
     * @type {GeraWebGL.Math.Vector3}
     * @private
     */
    #rayFarPoint;

    /**
     * Cached drag axis direction.
     *
     * @type {GeraWebGL.Math.Vector3}
     * @private
     */
    #dragAxisDirection;

    /**
     * Cached drag axis origin.
     *
     * @type {GeraWebGL.Math.Vector3}
     * @private
     */
    #dragAxisOrigin;

    /**
     * Cached drag start position.
     *
     * @type {GeraWebGL.Math.Vector3}
     * @private
     */
    #dragStartPosition;

    /**
     * Cached drag offset vector.
     *
     * @type {GeraWebGL.Math.Vector3}
     * @private
     */
    #dragOffsetVector;

    /**
     * Cached drag result position.
     *
     * @type {GeraWebGL.Math.Vector3}
     * @private
     */
    #dragResultPosition;

    /**
     * Cached light direction buffer.
     *
     * @type {Float32Array}
     * @private
     */
    #lightDirectionBuffer;

    /**
     * Current light rotation angle in radians.
     *
     * @type {number}
     * @private
     */
    #lightRotationAngle = ZERO;

    /**
     * Current light rotation radius.
     *
     * @type {number}
     * @private
     */
    #lightRotationRadius = LIGHT_ROTATION_RADIUS;

    /**
     * Current light rotation height offset.
     *
     * @type {number}
     * @private
     */
    #lightRotationHeight = LIGHT_ROTATION_HEIGHT;

    /**
     * Active drag axis identifier.
     *
     * @type {string | null}
     * @private
     */
    #dragAxis = null;

    /**
     * Hovered drag axis identifier.
     *
     * @type {string | null}
     * @private
     */
    #hoveredAxis = null;

    /**
     * Drag start axis parameter.
     *
     * @type {number}
     * @private
     */
    #dragStartAxisParam = ZERO;

    /**
     * Active target drag axis identifier.
     *
     * @type {string | null}
     * @private
     */
    #targetDragAxis = null;

    /**
     * Hovered target drag axis identifier.
     *
     * @type {string | null}
     * @private
     */
    #targetHoveredAxis = null;

    /**
     * Drag start axis parameter for target dragging.
     *
     * @type {number}
     * @private
     */
    #targetDragStartAxisParam = ZERO;

    /**
     * Drag active flag.
     *
     * @type {boolean}
     * @private
     */
    #isLightDragging = false;

    /**
     * Target drag active flag.
     *
     * @type {boolean}
     * @private
     */
    #isTargetDragging = false;

    /**
     * Drag pointer event handlers bound state.
     *
     * @type {boolean}
     * @private
     */
    #dragHandlersBound = false;

    /**
     * Flag to prevent programmatic UI updates from triggering handlers.
     *
     * @type {boolean}
     * @private
     */
    #isProgrammaticUiUpdate = false;

    /**
     * Stored light gizmo visibility before lighting was disabled.
     *
     * @type {boolean}
     * @private
     */
    #storedLightGizmoVisible = DEFAULT_LIGHT_GIZMO_VISIBLE;

    /**
     * Stored rotate light state before lighting was disabled.
     *
     * @type {boolean}
     * @private
     */
    #storedRotateLightEnabled = DEFAULT_ROTATE_LIGHT_ENABLED;

    /**
     * Stored drag light state before lighting was disabled.
     *
     * @type {boolean}
     * @private
     */
    #storedDragLightEnabled = DEFAULT_DRAG_LIGHT_ENABLED;

    /**
     * Stored change light point state before lighting was disabled.
     *
     * @type {boolean}
     * @private
     */
    #storedChangeLightPointEnabled = DEFAULT_CHANGE_LIGHT_POINT_ENABLED;

    /**
     * Pointer down handler reference.
     *
     * @type {(event: PointerEvent) => void}
     * @private
     */
    #onPointerDownHandler;

    /**
     * Pointer move handler reference.
     *
     * @type {(event: PointerEvent) => void}
     * @private
     */
    #onPointerMoveHandler;

    /**
     * Pointer up handler reference.
     *
     * @type {(event: PointerEvent) => void}
     * @private
     */
    #onPointerUpHandler;

    /**
     * Cached raycast options for axis picking.
     *
     * @type {{ recursive: boolean, filter: Function, sort: boolean }}
     * @private
     */
    #raycastOptions;

    /**
     * @param {HTMLCanvasElement} canvas                   - Canvas element.
     * @param {HTMLButtonElement} wireframeButton          - Wireframe toggle button.
     * @param {HTMLButtonElement} resetButton              - Reset view button.
     * @param {HTMLInputElement} lightingToggle            - Lighting toggle checkbox.
     * @param {HTMLInputElement} directionalLightToggle    - Directional light toggle checkbox.
     * @param {HTMLInputElement} ambientLightToggle        - Ambient light toggle checkbox.
     * @param {HTMLInputElement} directionalStrengthInput  - Directional strength range input.
     * @param {HTMLElement} directionalStrengthLabel       - Directional strength label element.
     * @param {HTMLElement} directionalStrengthValueLabel  - Directional strength value label element.
     * @param {HTMLInputElement} ambientStrengthInput      - Ambient strength range input.
     * @param {HTMLElement} ambientStrengthLabel           - Ambient strength label element.
     * @param {HTMLElement} ambientStrengthValueLabel      - Ambient strength value label element.
     * @param {HTMLInputElement} lightGizmoToggle          - Light gizmo toggle checkbox.
     * @param {HTMLElement} activeLightsLabel              - Active lights label element.
     * @param {HTMLElement} lightPositionLabel             - Light position label element.
     * @param {HTMLElement} lightPointLabel                - Light point label element.
     * @param {HTMLElement} dragAxisLabel                  - Drag axis label element.
     * @param {HTMLInputElement} rotateLightToggle         - Rotate light toggle checkbox.
     * @param {HTMLElement} rotateLightLabel               - Rotate light toggle label element.
     * @param {HTMLInputElement} dragLightToggle           - Drag light toggle checkbox.
     * @param {HTMLElement} dragLightLabel                 - Drag light toggle label element.
     * @param {HTMLInputElement} changeLightPointToggle    - Change light point toggle checkbox.
     * @param {HTMLElement} changeLightPointLabel          - Change light point toggle label element.
     * @param {HTMLInputElement} pauseCameraRotationToggle - Model auto-rotation toggle checkbox.
     * @param {HTMLElement} pauseCameraRotationLabel       - Model auto-rotation toggle label element.
     * @param {HTMLElement} statusLabel                    - Status label element.
     * @param {HTMLInputElement} localFolderInput          - Local folder input element.
     * @param {HTMLButtonElement} localLoadButton          - Local load button.
     * @param {HTMLElement} localStatusLabel               - Local status label.
     * @param {HTMLSelectElement} localObjSelect           - Local OBJ select element.
     * @param {HTMLElement} localObjSelectRow              - Local OBJ select row element.
     */
    constructor(
        canvas,
        wireframeButton,
        resetButton,
        lightingToggle,
        directionalLightToggle,
        ambientLightToggle,
        directionalStrengthInput,
        directionalStrengthLabel,
        directionalStrengthValueLabel,
        ambientStrengthInput,
        ambientStrengthLabel,
        ambientStrengthValueLabel,
        lightGizmoToggle,
        activeLightsLabel,
        lightPositionLabel,
        lightPointLabel,
        dragAxisLabel,
        rotateLightToggle,
        rotateLightLabel,
        dragLightToggle,
        dragLightLabel,
        changeLightPointToggle,
        changeLightPointLabel,
        pauseCameraRotationToggle,
        pauseCameraRotationLabel,
        statusLabel,
        localFolderInput,
        localLoadButton,
        localStatusLabel,
        localObjSelect,
        localObjSelectRow
    ) {
        this.#canvas                        = canvas;
        this.#wireframeButton               = wireframeButton;
        this.#resetButton                   = resetButton;
        this.#lightingToggle                = lightingToggle;
        this.#directionalLightToggle        = directionalLightToggle;
        this.#ambientLightToggle            = ambientLightToggle;
        this.#directionalStrengthInput      = directionalStrengthInput;
        this.#directionalStrengthLabel      = directionalStrengthLabel;
        this.#directionalStrengthValueLabel = directionalStrengthValueLabel;
        this.#ambientStrengthInput          = ambientStrengthInput;
        this.#ambientStrengthLabel          = ambientStrengthLabel;
        this.#ambientStrengthValueLabel     = ambientStrengthValueLabel;
        this.#lightGizmoToggle              = lightGizmoToggle;
        this.#activeLightsLabel             = activeLightsLabel;
        this.#lightPositionLabel            = lightPositionLabel;
        this.#lightPointLabel               = lightPointLabel;
        this.#dragAxisLabel                 = dragAxisLabel;
        this.#rotateLightToggle             = rotateLightToggle;
        this.#rotateLightLabel              = rotateLightLabel;
        this.#dragLightToggle               = dragLightToggle;
        this.#dragLightLabel                = dragLightLabel;
        this.#changeLightPointToggle        = changeLightPointToggle;
        this.#changeLightPointLabel         = changeLightPointLabel;
        this.#pauseCameraRotationToggle     = pauseCameraRotationToggle;
        this.#pauseCameraRotationLabel      = pauseCameraRotationLabel;
        this.#statusLabel                   = statusLabel;
        this.#localFolderInput              = localFolderInput;
        this.#localLoadButton               = localLoadButton;
        this.#localStatusLabel              = localStatusLabel;
        this.#localObjSelect                = localObjSelect;
        this.#localObjSelectRow             = localObjSelectRow;

        this.#updateStatus(this.#statusLabel, STATUS_LOADING);
        this.#updateLocalStatus(LOCAL_STATUS_IDLE);

        this.#engine        = GeraWebGL.createEngine(this.#canvas, { fitToWindow: true });
        this.#orbitControls = this.#createOrbitControls(this.#engine.camera, this.#canvas);
        this.#orbitControls.setRotationEnabled(this.#cameraRotationEnabled);

        this.#loader        = new GeraWebGL.Loaders.ObjMtlLoader(this.#engine.webglRenderingContext);
        this.#raycaster     = new GeraWebGL.Raycaster();
        this.#mouseNdc      = { x: ZERO, y: ZERO };
        this.#canvasBounds  = { left: ZERO, top: ZERO, width: ONE, height: ONE };

        this.#viewProjectionMatrix        = new Float32Array(MATRIX_4X4_ELEMENT_COUNT);
        this.#inverseViewProjectionMatrix = new Float32Array(MATRIX_4X4_ELEMENT_COUNT);

        this.#rayOrigin            = new GeraWebGL.Math.Vector3();
        this.#rayDirection         = new GeraWebGL.Math.Vector3();
        this.#rayNearPoint         = new GeraWebGL.Math.Vector3();
        this.#rayFarPoint          = new GeraWebGL.Math.Vector3();
        this.#dragAxisDirection    = new GeraWebGL.Math.Vector3();
        this.#dragAxisOrigin       = new GeraWebGL.Math.Vector3();
        this.#dragStartPosition    = new GeraWebGL.Math.Vector3();
        this.#dragOffsetVector     = new GeraWebGL.Math.Vector3();
        this.#dragResultPosition   = new GeraWebGL.Math.Vector3();
        this.#lightDirectionBuffer = new Float32Array(VECTOR3_ELEMENT_COUNT);

        this.#onPointerDownHandler = (event) => this.#onPointerDown(event);
        this.#onPointerMoveHandler = (event) => this.#onPointerMove(event);
        this.#onPointerUpHandler   = (event) => this.#onPointerUp(event);
        this.#raycastOptions = {
            recursive : true,
            sort      : true,
            filter    : (object) => this.#filterLightGizmoPick(object)
        };

        this.#createLights();
        this.#fpsCounter = new GeraWebGL.Debug.FpsCounter({
            updateIntervalMs : FPS_COUNTER_UPDATE_INTERVAL_MS,
            smoothingFactor  : FPS_COUNTER_SMOOTHING_FACTOR,
            goodFpsThreshold : FPS_COUNTER_GOOD_FPS_THRESHOLD,
            okFpsThreshold   : FPS_COUNTER_OK_FPS_THRESHOLD
        });

        document.body.appendChild(this.#fpsCounter.domElement);
        this.#updateWireframeLabel(this.#wireframeButton, this.#wireframeEnabled);
        this.#rotateLightLabel.textContent = MOVE_LIGHT_LABEL_TEXT;
        this.#dragLightLabel.textContent = DRAG_LIGHT_LABEL_TEXT;
        this.#changeLightPointLabel.textContent = CHANGE_LIGHT_POINT_LABEL_TEXT;
        this.#directionalStrengthLabel.textContent = DIRECTIONAL_STRENGTH_LABEL_TEXT;
        this.#ambientStrengthLabel.textContent = AMBIENT_STRENGTH_LABEL_TEXT;
        this.#directionalStrengthInput.min = DIRECTIONAL_STRENGTH_MIN.toString();
        this.#directionalStrengthInput.max = DIRECTIONAL_STRENGTH_MAX.toString();
        this.#directionalStrengthInput.step = DIRECTIONAL_STRENGTH_STEP.toString();
        this.#setRangeInputValue(this.#directionalStrengthInput, this.#directionalStrength);
        this.#ambientStrengthInput.min = AMBIENT_STRENGTH_MIN.toString();
        this.#ambientStrengthInput.max = AMBIENT_STRENGTH_MAX.toString();
        this.#ambientStrengthInput.step = AMBIENT_STRENGTH_STEP.toString();
        this.#setRangeInputValue(this.#ambientStrengthInput, this.#ambientStrength);
        this.#applyDirectionalStrength(this.#directionalStrength);
        this.#applyAmbientStrength(this.#ambientStrength);
        this.#pauseCameraRotationLabel.textContent = PAUSE_CAMERA_ROTATION_LABEL_TEXT;

        this.#setCheckboxState(this.#pauseCameraRotationToggle, DEFAULT_MODEL_ROTATION_ENABLED);
        this.#bindUI();

        this.#lightingEnabled         = this.#lightingToggle.checked;
        this.#directionalLightEnabled = this.#directionalLightToggle.checked;
        this.#ambientLightEnabled     = this.#ambientLightToggle.checked;
        this.#lightGizmoVisible       = this.#lightGizmoToggle.checked;
        this.#rotateLightEnabled      = this.#rotateLightToggle.checked;
        this.#dragLightEnabled        = this.#dragLightToggle.checked;
        this.#changeLightPointEnabled = this.#changeLightPointToggle.checked;
        this.#modelAutoRotateEnabled  = this.#pauseCameraRotationToggle.checked;

        this.#applyDirectionalLightToggle(this.#directionalLightEnabled);
        this.#applyAmbientLightToggle(this.#ambientLightEnabled);
        this.#applyLightGizmoToggle(this.#lightGizmoVisible);
        this.#applyLightRotationToggle(this.#rotateLightEnabled);
        this.#applyLightDragToggle(this.#dragLightEnabled);
        this.#applyChangeLightPointToggle(this.#changeLightPointEnabled);
        this.#applyPauseCameraRotationToggle(this.#pauseCameraRotationToggle.checked);
        this.#updateActiveLightsInfo();
        this.#updateLightPositionLabel();
        this.#updateLightPointLabel();
        this.#updateDragAxisLabel();
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
     * Creates the scene lights and the light gizmo.
     *
     * @returns {void}
     * @private
     */
    #createLights() {
        const directionalLight = new GeraWebGL.DirectionalLight();
        directionalLight.position.set(
            DIRECTIONAL_LIGHT_POSITION_X,
            DIRECTIONAL_LIGHT_POSITION_Y,
            DIRECTIONAL_LIGHT_POSITION_Z
        );

        directionalLight.setDirection(DIRECTIONAL_LIGHT_DIRECTION);
        directionalLight.setStrength(this.#directionalStrength);

        const ambientLight = new GeraWebGL.AmbientLight();
        ambientLight.setStrength(this.#ambientStrength);

        const lightTargetObject = new GeraWebGL.Object3D();
        lightTargetObject.position.set(
            LIGHT_ROTATION_CENTER_X,
            LIGHT_ROTATION_CENTER_Y,
            LIGHT_ROTATION_CENTER_Z
        );

        this.#engine.scene.add(lightTargetObject);

        const markerGeometry = new GeraWebGL.Geometries.SphereGeometry(this.#engine.webglRenderingContext, {
            width          : LIGHT_TARGET_MARKER_DIAMETER,
            height         : LIGHT_TARGET_MARKER_DIAMETER,
            depth          : LIGHT_TARGET_MARKER_DIAMETER,
            widthSegments  : LIGHT_TARGET_MARKER_WIDTH_SEGMENTS,
            heightSegments : LIGHT_TARGET_MARKER_HEIGHT_SEGMENTS
        });

        const markerMaterial = new GeraWebGL.Materials.SolidColorMaterial(
            this.#engine.webglRenderingContext,
            { color: LIGHT_TARGET_MARKER_COLOR }
        );

        markerMaterial.setOpacity(LIGHT_TARGET_MARKER_HIDDEN_OPACITY);

        const lightTargetMarker = new GeraWebGL.Mesh(markerGeometry, markerMaterial);
        lightTargetObject.add(lightTargetMarker);

        const lightGizmo = new GeraWebGL.Debug.LightGizmo(
            this.#engine.webglRenderingContext,
            directionalLight
        );

        directionalLight.add(lightGizmo);

        const transformGizmoAnchor = new GeraWebGL.Object3D();
        transformGizmoAnchor.position.copyFrom(directionalLight.position);
        this.#engine.scene.add(transformGizmoAnchor);

        const transformGizmo = new GeraWebGL.Debug.TransformGizmo(
            this.#engine.webglRenderingContext,
            transformGizmoAnchor
        );

        transformGizmo.setVisible(DEFAULT_DRAG_LIGHT_ENABLED);

        const lightTargetGizmo = new GeraWebGL.Debug.TransformGizmo(
            this.#engine.webglRenderingContext,
            lightTargetObject
        );

        lightTargetGizmo.setVisible(DEFAULT_CHANGE_LIGHT_POINT_ENABLED);
        this.#engine.scene.add(directionalLight);
        this.#engine.scene.add(ambientLight);
        this.#directionalLight     = directionalLight;
        this.#ambientLight         = ambientLight;
        this.#lightGizmo           = lightGizmo;
        this.#transformGizmo       = transformGizmo;
        this.#transformGizmoAnchor = transformGizmoAnchor;
        this.#lightTargetObject    = lightTargetObject;
        this.#lightTargetMarker    = lightTargetMarker;
        this.#lightTargetGizmo     = lightTargetGizmo;
        this.#updateDirectionalLightDirectionFromPosition();
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
     * Updates a checkbox state without retriggering UI handlers.
     *
     * @param {HTMLInputElement} checkbox - Checkbox to update.
     * @param {boolean} isChecked         - New checked state.
     * @returns {void}
     * @throws {TypeError} When inputs are invalid.
     * @private
     */
    #setCheckboxState(checkbox, isChecked) {
        if (!(checkbox instanceof HTMLInputElement) || typeof isChecked !== TYPE_BOOLEAN) {
            throw new TypeError(ERROR_CHECKBOX_INPUT_TYPE);
        }

        this.#isProgrammaticUiUpdate = true;
        checkbox.checked = isChecked;
        this.#isProgrammaticUiUpdate = false;
    }

    /**
     * Updates a range input value without re-triggering UI handlers.
     *
     * @param {HTMLInputElement} input - Range input to update.
     * @param {number} value           - New numeric value.
     * @returns {void}
     * @throws {TypeError} When inputs are invalid.
     * @private
     */
    #setRangeInputValue(input, value) {
        if (!(input instanceof HTMLInputElement) || typeof value !== TYPE_NUMBER || !Number.isFinite(value)) {
            throw new TypeError(ERROR_RANGE_INPUT_TYPE);
        }

        this.#isProgrammaticUiUpdate = true;
        input.value = value.toString();
        this.#isProgrammaticUiUpdate = false;
    }

    /**
     * Reads a numeric value from a range input.
     *
     * @param {HTMLInputElement} input - Range input to read.
     * @param {string} errorMessage    - Error message to use when validation fails.
     * @returns {number}
     * @throws {TypeError} When the input is invalid.
     * @private
     */
    #getRangeInputValue(input, errorMessage) {
        if (!(input instanceof HTMLInputElement) || typeof errorMessage !== TYPE_STRING) {
            throw new TypeError(ERROR_RANGE_INPUT_TYPE);
        }

        const value = Number.parseFloat(input.value);

        if (!Number.isFinite(value)) {
            throw new TypeError(errorMessage);
        }

        return value;
    }

    /**
     * Updates a strength value label.
     *
     * @param {HTMLElement} label - Label element.
     * @param {number} value      - Strength value.
     * @returns {void}
     * @private
     */
    #updateStrengthValueLabel(label, value) {
        if (!(label instanceof HTMLElement)) {
            return;
        }

        label.textContent = value.toFixed(STRENGTH_LABEL_DECIMALS);
    }

    /**
     * Binds the UI handlers.
     *
     * @private
     */
    #bindUI() {
        this.#wireframeButton.addEventListener(CLICK_EVENT, () => this.#toggleWireframe());
        this.#resetButton.addEventListener(CLICK_EVENT, () => this.#resetView());
        this.#lightingToggle.addEventListener(CHANGE_EVENT, () => {
            if (this.#isProgrammaticUiUpdate) {
                return;
            }

            this.#applyLightingToggle(this.#lightingToggle.checked);
        });

        this.#directionalLightToggle.addEventListener(CHANGE_EVENT, () => {
            if (this.#isProgrammaticUiUpdate) {
                return;
            }

            this.#applyDirectionalLightToggle(this.#directionalLightToggle.checked);
        });

        this.#ambientLightToggle.addEventListener(CHANGE_EVENT, () => {
            if (this.#isProgrammaticUiUpdate) {
                return;
            }

            this.#applyAmbientLightToggle(this.#ambientLightToggle.checked);
        });

        this.#directionalStrengthInput.addEventListener(INPUT_EVENT, () => {
            if (this.#isProgrammaticUiUpdate) {
                return;
            }

            const value = this.#getRangeInputValue(this.#directionalStrengthInput, ERROR_DIRECTIONAL_STRENGTH_TYPE);
            this.#applyDirectionalStrength(value);
        });

        this.#ambientStrengthInput.addEventListener(INPUT_EVENT, () => {
            if (this.#isProgrammaticUiUpdate) {
                return;
            }

            const value = this.#getRangeInputValue(this.#ambientStrengthInput, ERROR_AMBIENT_STRENGTH_TYPE);
            this.#applyAmbientStrength(value);
        });

        this.#lightGizmoToggle.addEventListener(CHANGE_EVENT, () => {
            if (this.#isProgrammaticUiUpdate) {
                return;
            }

            this.#applyLightGizmoToggle(this.#lightGizmoToggle.checked);
        });

        this.#rotateLightToggle.addEventListener(CHANGE_EVENT, () => {
            if (this.#isProgrammaticUiUpdate) {
                return;
            }

            this.#applyLightRotationToggle(this.#rotateLightToggle.checked);
        });

        this.#dragLightToggle.addEventListener(CHANGE_EVENT, () => {
            if (this.#isProgrammaticUiUpdate) {
                return;
            }

            this.#applyLightDragToggle(this.#dragLightToggle.checked);
        });

        this.#changeLightPointToggle.addEventListener(CHANGE_EVENT, () => {
            if (this.#isProgrammaticUiUpdate) {
                return;
            }

            this.#applyChangeLightPointToggle(this.#changeLightPointToggle.checked);
        });

        this.#pauseCameraRotationToggle.addEventListener(CHANGE_EVENT, () => {
            if (this.#isProgrammaticUiUpdate) {
                return;
            }

            this.#applyPauseCameraRotationToggle(this.#pauseCameraRotationToggle.checked);
        });

        this.#localFolderInput.addEventListener(CHANGE_EVENT, () => this.#handleLocalFolderChange());
        this.#localLoadButton.addEventListener(CLICK_EVENT, () => this.#loadLocalModel());
    }

    /**
     * Applies lighting enabled state to loaded meshes.
     *
     * @param {boolean} isEnabled - Whether lighting should be enabled.
     * @returns {void}
     * @throws {TypeError} When the value is invalid.
     * @private
     */
    #applyLightingToggle(isEnabled) {
        if (typeof isEnabled !== TYPE_BOOLEAN) {
            throw new TypeError(ERROR_LIGHTING_TOGGLE_TYPE);
        }

        const wasEnabled      = this.#lightingEnabled;
        this.#lightingEnabled = isEnabled;
        this.#applyEffectiveLightingState();

        if (!isEnabled && wasEnabled) {
            this.#storedLightGizmoVisible       = this.#lightGizmoToggle.checked;
            this.#storedRotateLightEnabled      = this.#rotateLightToggle.checked;
            this.#storedDragLightEnabled        = this.#dragLightToggle.checked;
            this.#storedChangeLightPointEnabled = this.#changeLightPointToggle.checked;

            this.#setCheckboxState(this.#lightGizmoToggle, false);
            this.#applyLightGizmoToggle(false);

            this.#setCheckboxState(this.#rotateLightToggle, false);
            this.#applyLightRotationToggle(false);

            this.#setCheckboxState(this.#dragLightToggle, false);
            this.#applyLightDragToggle(false);

            this.#setCheckboxState(this.#changeLightPointToggle, false);
            this.#applyChangeLightPointToggle(false);
        }

        if (isEnabled && !wasEnabled) {
            const restoreLightGizmo  = this.#storedLightGizmoVisible;
            const restoreChangePoint = this.#storedChangeLightPointEnabled;
            const restoreDrag        = this.#storedDragLightEnabled && !restoreChangePoint;
            const restoreRotate      = this.#storedRotateLightEnabled && !restoreDrag && !restoreChangePoint;

            this.#setCheckboxState(this.#lightGizmoToggle, restoreLightGizmo);
            this.#applyLightGizmoToggle(restoreLightGizmo);

            this.#setCheckboxState(this.#changeLightPointToggle, restoreChangePoint);
            this.#applyChangeLightPointToggle(restoreChangePoint);

            this.#setCheckboxState(this.#dragLightToggle, restoreDrag);
            this.#applyLightDragToggle(restoreDrag);

            this.#setCheckboxState(this.#rotateLightToggle, restoreRotate);
            this.#applyLightRotationToggle(restoreRotate);
        }

        this.#updateActiveLightsInfo();
    }

    /**
     * Applies directional light enabled state.
     *
     * @param {boolean} isEnabled - Whether directional lighting should be enabled.
     * @returns {void}
     * @throws {TypeError} When the value is invalid.
     * @private
     */
    #applyDirectionalLightToggle(isEnabled) {
        if (typeof isEnabled !== TYPE_BOOLEAN) {
            throw new TypeError(ERROR_DIRECTIONAL_LIGHT_TOGGLE_TYPE);
        }

        this.#directionalLightEnabled = isEnabled;

        if (this.#directionalLight) {
            this.#directionalLight.setEnabled(isEnabled);
        }

        this.#applyEffectiveLightingState();
        this.#updateActiveLightsInfo();
    }

    /**
     * Applies ambient light enabled state.
     *
     * @param {boolean} isEnabled - Whether ambient lighting should be enabled.
     * @returns {void}
     * @throws {TypeError} When the value is invalid.
     * @private
     */
    #applyAmbientLightToggle(isEnabled) {
        if (typeof isEnabled !== TYPE_BOOLEAN) {
            throw new TypeError(ERROR_AMBIENT_LIGHT_TOGGLE_TYPE);
        }

        this.#ambientLightEnabled = isEnabled;

        if (this.#ambientLight) {
            this.#ambientLight.setEnabled(isEnabled);
        }

        this.#applyEffectiveLightingState();
        this.#updateActiveLightsInfo();
    }

    /**
     * Applies directional strength value.
     *
     * @param {number} strength - Directional strength multiplier.
     * @returns {void}
     * @throws {TypeError}  When the value is invalid.
     * @throws {RangeError} When the value is out of range.
     * @private
     */
    #applyDirectionalStrength(strength) {
        if (typeof strength !== TYPE_NUMBER || !Number.isFinite(strength)) {
            throw new TypeError(ERROR_DIRECTIONAL_STRENGTH_TYPE);
        }

        if (strength < DIRECTIONAL_STRENGTH_MIN || strength > DIRECTIONAL_STRENGTH_MAX) {
            throw new RangeError(ERROR_DIRECTIONAL_STRENGTH_RANGE);
        }

        this.#directionalStrength = strength;

        if (this.#directionalLight) {
            this.#directionalLight.setStrength(strength);
        }

        this.#updateStrengthValueLabel(this.#directionalStrengthValueLabel, strength);
    }

    /**
     * Applies ambient strength value.
     *
     * @param {number} strength - Ambient strength multiplier.
     * @returns {void}
     * @throws {TypeError}  When the value is invalid.
     * @throws {RangeError} When the value is out of range.
     * @private
     */
    #applyAmbientStrength(strength) {
        if (typeof strength !== TYPE_NUMBER || !Number.isFinite(strength)) {
            throw new TypeError(ERROR_AMBIENT_STRENGTH_TYPE);
        }

        if (strength < AMBIENT_STRENGTH_MIN || strength > AMBIENT_STRENGTH_MAX) {
            throw new RangeError(ERROR_AMBIENT_STRENGTH_RANGE);
        }

        this.#ambientStrength = strength;

        if (this.#ambientLight) {
            this.#ambientLight.setStrength(strength);
        }

        this.#updateStrengthValueLabel(this.#ambientStrengthValueLabel, strength);
    }

    /**
     * Returns the effective lighting enabled state.
     *
     * @returns {boolean}
     * @private
     */
    #getEffectiveLightingEnabled() {
        return this.#lightingEnabled && (this.#directionalLightEnabled || this.#ambientLightEnabled);
    }

    /**
     * Applies the effective lighting enabled state to loaded meshes.
     *
     * @returns {void}
     * @private
     */
    #applyEffectiveLightingState() {
        const isEnabled = this.#getEffectiveLightingEnabled();

        for (const mesh of this.#loadedMeshes) {
            const material = mesh.material;

            if (material instanceof GeraWebGL.Materials.DirectionalLightMaterial) {
                material.setLightingEnabled(isEnabled);
            }
        }
    }

    /**
     * Applies light gizmo visibility state.
     *
     * @param {boolean} isEnabled - Whether the light gizmo should be visible.
     * @returns {void}
     * @throws {TypeError} When the value is invalid.
     * @private
     */
    #applyLightGizmoToggle(isEnabled) {
        if (typeof isEnabled !== TYPE_BOOLEAN) {
            throw new TypeError(ERROR_LIGHT_GIZMO_TOGGLE_TYPE);
        }

        if (!this.#lightingEnabled && isEnabled) {
            this.#setCheckboxState(this.#lightGizmoToggle, false);
            isEnabled = false;
        }

        this.#lightGizmoVisible = isEnabled;

        if (this.#lightGizmo) {
            this.#lightGizmo.setVisible(isEnabled && this.#lightingEnabled);
        }
    }

    /**
     * Applies rotate light toggle state.
     *
     * @param {boolean} isEnabled - Whether light rotation is enabled.
     * @returns {void}
     * @throws {TypeError} When the value is invalid.
     * @private
     */
    #applyLightRotationToggle(isEnabled) {
        if (typeof isEnabled !== TYPE_BOOLEAN) {
            throw new TypeError(ERROR_ROTATE_LIGHT_TOGGLE_TYPE);
        }

        if (!this.#lightingEnabled && isEnabled) {
            this.#setCheckboxState(this.#rotateLightToggle, false);
            isEnabled = false;
        }

        if (isEnabled && this.#dragLightEnabled) {
            this.#setCheckboxState(this.#dragLightToggle, false);
            this.#applyLightDragToggle(false);
        }

        if (isEnabled && this.#changeLightPointEnabled) {
            this.#setCheckboxState(this.#changeLightPointToggle, false);
            this.#applyChangeLightPointToggle(false);
        }

        this.#rotateLightEnabled = isEnabled;

        if (isEnabled) {
            this.#syncLightRotationFromCurrentPosition();
        }
    }

    /**
     * Applies drag light toggle state.
     *
     * @param {boolean} isEnabled - Whether light dragging is enabled.
     * @returns {void}
     * @throws {TypeError} When the value is invalid.
     * @private
     */
    #applyLightDragToggle(isEnabled) {
        if (typeof isEnabled !== TYPE_BOOLEAN) {
            throw new TypeError(ERROR_DRAG_LIGHT_TOGGLE_TYPE);
        }

        if (!this.#lightingEnabled && isEnabled) {
            this.#setCheckboxState(this.#dragLightToggle, false);
            isEnabled = false;
        }

        if (isEnabled && this.#rotateLightEnabled) {
            this.#setCheckboxState(this.#rotateLightToggle, false);
            this.#applyLightRotationToggle(false);
            this.#resetLightRotationState();
        }

        if (isEnabled && this.#changeLightPointEnabled) {
            this.#setCheckboxState(this.#changeLightPointToggle, false);
            this.#applyChangeLightPointToggle(false);
        }

        this.#dragLightEnabled = isEnabled;

        if (this.#transformGizmo) {
            this.#transformGizmo.setVisible(isEnabled && this.#lightingEnabled);
        }

        this.#updateDragHandlers();

        if (isEnabled && this.#transformGizmo) {
            this.#hoveredAxis = null;
            this.#transformGizmo.clearState();
        }

        if (!isEnabled) {
            this.#clearLightDragState();
        }
    }

    /**
     * Applies change light point toggle state.
     *
     * @param {boolean} isEnabled - Whether changing the light point is enabled.
     * @returns {void}
     * @throws {TypeError} When the value is invalid.
     * @private
     */
    #applyChangeLightPointToggle(isEnabled) {
        if (typeof isEnabled !== TYPE_BOOLEAN) {
            throw new TypeError(ERROR_CHANGE_LIGHT_POINT_TOGGLE_TYPE);
        }

        if (!this.#lightingEnabled && isEnabled) {
            this.#setCheckboxState(this.#changeLightPointToggle, false);
            isEnabled = false;
        }

        if (isEnabled && this.#rotateLightEnabled) {
            this.#setCheckboxState(this.#rotateLightToggle, false);
            this.#applyLightRotationToggle(false);
            this.#resetLightRotationState();
        }

        if (isEnabled && this.#dragLightEnabled) {
            this.#setCheckboxState(this.#dragLightToggle, false);
            this.#applyLightDragToggle(false);
        }

        this.#changeLightPointEnabled = isEnabled;

        if (this.#lightTargetGizmo) {
            this.#lightTargetGizmo.setVisible(isEnabled && this.#lightingEnabled);
        }

        this.#setLightTargetMarkerVisible(isEnabled && this.#lightingEnabled);
        this.#updateDragHandlers();

        if (isEnabled && this.#lightTargetGizmo) {
            this.#targetHoveredAxis = null;
            this.#lightTargetGizmo.clearState();
        }

        if (!isEnabled) {
            this.#clearTargetDragState();
        }
    }

    /**
     * Applies model auto-rotation toggle state.
     *
     * @param {boolean} isEnabled - Whether model auto-rotation should be enabled.
     * @returns {void}
     * @throws {TypeError} When the value is invalid.
     * @private
     */
    #applyPauseCameraRotationToggle(isEnabled) {
        if (typeof isEnabled !== TYPE_BOOLEAN) {
            throw new TypeError(ERROR_PAUSE_CAMERA_ROTATION_TOGGLE_TYPE);
        }

        this.#modelAutoRotateEnabled = isEnabled;
    }

    /**
     * Updates drag event handlers based on active drag toggles.
     *
     * @returns {void}
     * @private
     */
    #updateDragHandlers() {
        const shouldBind = this.#dragLightEnabled || this.#changeLightPointEnabled;

        if (shouldBind && !this.#dragHandlersBound) {
            this.#canvas.addEventListener(POINTER_DOWN_EVENT, this.#onPointerDownHandler, POINTER_CAPTURE_OPTIONS);
            window.addEventListener(POINTER_MOVE_EVENT, this.#onPointerMoveHandler, POINTER_CAPTURE_OPTIONS);
            window.addEventListener(POINTER_UP_EVENT, this.#onPointerUpHandler, POINTER_CAPTURE_OPTIONS);
            this.#dragHandlersBound = true;
        }

        if (!shouldBind && this.#dragHandlersBound) {
            this.#canvas.removeEventListener(POINTER_DOWN_EVENT, this.#onPointerDownHandler, POINTER_CAPTURE_OPTIONS);
            window.removeEventListener(POINTER_MOVE_EVENT, this.#onPointerMoveHandler, POINTER_CAPTURE_OPTIONS);
            window.removeEventListener(POINTER_UP_EVENT, this.#onPointerUpHandler, POINTER_CAPTURE_OPTIONS);
            this.#dragHandlersBound = false;
        }
    }

    /**
     * Sets light target marker visibility.
     *
     * @param {boolean} isVisible - Whether the light target marker is visible.
     * @returns {void}
     * @private
     */
    #setLightTargetMarkerVisible(isVisible) {
        if (this.#lightTargetMarker && this.#lightTargetMarker.material) {
            const opacity = isVisible ? LIGHT_TARGET_MARKER_OPACITY : LIGHT_TARGET_MARKER_HIDDEN_OPACITY;
            this.#lightTargetMarker.material.setOpacity(opacity);
        }
    }

    /**
     * Updates the active lights info label.
     *
     * @returns {void}
     * @private
     */
    #updateActiveLightsInfo() {
        const activeLabels   = [];
        const hasDirectional = this.#directionalLight && this.#directionalLightEnabled;
        const hasAmbient     = this.#ambientLight && this.#ambientLightEnabled;
        const hasLighting    = this.#getEffectiveLightingEnabled();

        if (hasLighting && hasDirectional) {
            activeLabels.push(ACTIVE_LIGHTS_LABEL_DIRECTIONAL);
        }

        if (hasLighting && hasAmbient) {
            activeLabels.push(ACTIVE_LIGHTS_LABEL_AMBIENT);
        }

        const lightsText = hasLighting
            ? activeLabels.join(ACTIVE_LIGHTS_LABEL_SEPARATOR)
            : ACTIVE_LIGHTS_LABEL_UNLIT;

        this.#activeLightsLabel.textContent = `${ACTIVE_LIGHTS_LABEL_PREFIX}${lightsText}`;
    }

    /**
     * Updates the light position label.
     *
     * @returns {void}
     * @private
     */
    #updateLightPositionLabel() {
        const position = this.#directionalLight.position;
        const x = position.x.toFixed(LIGHT_POSITION_DECIMALS);
        const y = position.y.toFixed(LIGHT_POSITION_DECIMALS);
        const z = position.z.toFixed(LIGHT_POSITION_DECIMALS);

        this.#lightPositionLabel.textContent = LIGHT_POSITION_LABEL_PREFIX
            + LIGHT_POSITION_LABEL_X_PREFIX + x
            + LIGHT_POSITION_LABEL_Y_PREFIX + y
            + LIGHT_POSITION_LABEL_Z_PREFIX + z;
    }

    /**
     * Updates the light point label.
     *
     * @returns {void}
     * @private
     */
    #updateLightPointLabel() {
        const position = this.#getLightTargetPosition();
        const x = position.x.toFixed(LIGHT_POSITION_DECIMALS);
        const y = position.y.toFixed(LIGHT_POSITION_DECIMALS);
        const z = position.z.toFixed(LIGHT_POSITION_DECIMALS);

        this.#lightPointLabel.textContent = LIGHT_POINT_LABEL_PREFIX
            + LIGHT_POSITION_LABEL_X_PREFIX + x
            + LIGHT_POSITION_LABEL_Y_PREFIX + y
            + LIGHT_POSITION_LABEL_Z_PREFIX + z;
    }

    /**
     * Updates the drag axis label.
     *
     * @returns {void}
     * @private
     */
    #updateDragAxisLabel() {
        const axis = this.#changeLightPointEnabled
            ? (this.#targetDragAxis ?? this.#targetHoveredAxis)
            : (this.#dragAxis ?? this.#hoveredAxis);

        let axisLabel = DRAG_AXIS_LABEL_NONE;

        if (axis === AXIS_X) {
            axisLabel = DRAG_AXIS_LABEL_X;
        } else if (axis === AXIS_Y) {
            axisLabel = DRAG_AXIS_LABEL_Y;
        } else if (axis === AXIS_Z) {
            axisLabel = DRAG_AXIS_LABEL_Z;
        }

        this.#dragAxisLabel.textContent = DRAG_AXIS_LABEL_PREFIX + axisLabel;
    }

    /**
     * Raycast filter for transform gizmo pick meshes.
     *
     * @param {GeraWebGL.Mesh} object - Mesh candidate.
     * @returns {boolean}
     * @private
     */
    #filterLightGizmoPick(object) {
        const gizmo = this.#getActiveTransformGizmo();

        if (!gizmo) {
            return false;
        }

        return gizmo.getAxisForMesh(object) !== null;
    }

    /**
     * Returns the active transform gizmo for dragging.
     *
     * @returns {GeraWebGL.Debug.TransformGizmo | null}
     * @private
     */
    #getActiveTransformGizmo() {
        if (this.#changeLightPointEnabled) {
            return this.#lightTargetGizmo ?? null;
        }

        return this.#transformGizmo ?? null;
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
        this.#applyLightingToggle(this.#lightingEnabled);
        this.#applyDirectionalLightToggle(this.#directionalLightEnabled);
        this.#applyAmbientLightToggle(this.#ambientLightEnabled);
        this.#engine.scene.add(this.#loadedRoot);
        this.#updateActiveLightsInfo();
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
        this.#orbitControls.setRotationEnabled(this.#cameraRotationEnabled);
    }

    /**
     * Per-frame update callback.
     *
     * @param {number} deltaTime - Time since last frame in seconds.
     * @private
     */
    #onFrame(deltaTime) {
        this.#fpsCounter.update(deltaTime);

        if (this.#loadedRoot && this.#modelAutoRotateEnabled) {
            this.#loadedRoot.rotation.y += deltaTime * MODEL_ROTATION_SPEED;
        }

        if (this.#rotateLightEnabled && !this.#isLightDragging) {
            this.#updateLightRotation(deltaTime);
        }

        this.#orbitControls.update();
        this.#updateLightPositionLabel();
        this.#updateLightPointLabel();
        this.#updateDragAxisLabel();
    }

    /**
     * Syncs cached light rotation parameters, based on the current light position.
     *
     * @returns {void}
     * @throws {Error} When the directional light is missing.
     * @private
     */
    #syncLightRotationFromCurrentPosition() {
        if (!this.#directionalLight) {
            throw new Error(ERROR_DIRECTIONAL_LIGHT_MISSING);
        }

        const position       = this.#directionalLight.position;
        const targetPosition = this.#getLightTargetPosition();
        const deltaX         = position.x - targetPosition.x;
        const deltaY         = position.y - targetPosition.y;
        const deltaZ         = position.z - targetPosition.z;
        const radiusSquared  = (deltaX * deltaX) + (deltaZ * deltaZ);
        this.#lightRotationRadius = Math.sqrt(radiusSquared);
        this.#lightRotationHeight = deltaY;
        this.#lightRotationAngle  = Math.atan2(deltaZ, deltaX);
    }

    /**
     * Updates the directional light rotation/position animation.
     *
     * @param {number} deltaTime - Time since last frame in seconds.
     * @returns {void}
     * @throws {TypeError} When the delta time is invalid.
     * @private
     */
    #updateLightRotation(deltaTime) {
        if (typeof deltaTime !== 'number' || !Number.isFinite(deltaTime)) {
            throw new TypeError(ERROR_DELTA_TIME_TYPE);
        }

        const targetPosition = this.#getLightTargetPosition();
        this.#lightRotationAngle += deltaTime * LIGHT_ROTATION_SPEED;

        const cosAngle  = Math.cos(this.#lightRotationAngle);
        const sinAngle  = Math.sin(this.#lightRotationAngle);
        const positionX = targetPosition.x + (cosAngle * this.#lightRotationRadius);
        const positionZ = targetPosition.z + (sinAngle * this.#lightRotationRadius);
        const positionY = targetPosition.y + this.#lightRotationHeight;

        this.#directionalLight.position.set(positionX, positionY, positionZ);
        this.#updateDirectionalLightDirectionFromPosition();
        this.#syncTransformGizmoAnchor();
    }

    /**
     * Resets the cached light rotation state.
     *
     * @returns {void}
     * @private
     */
    #resetLightRotationState() {
        this.#lightRotationAngle = ZERO;
    }

    /**
     * Updates the directional light direction based on its position.
     *
     * @returns {void}
     * @private
     */
    #updateDirectionalLightDirectionFromPosition() {
        const position       = this.#directionalLight.position;
        const targetPosition = this.#getLightTargetPosition();
        const deltaX         = position.x - targetPosition.x;
        const deltaY         = position.y - targetPosition.y;
        const deltaZ         = position.z - targetPosition.z;
        const lengthSquared  = (deltaX * deltaX) + (deltaY * deltaY) + (deltaZ * deltaZ);

        if (!Number.isFinite(lengthSquared) || lengthSquared <= LIGHT_DIRECTION_MIN_LENGTH_SQUARED) {
            return;
        }

        this.#lightDirectionBuffer[VECTOR_INDEX_X] = deltaX;
        this.#lightDirectionBuffer[VECTOR_INDEX_Y] = deltaY;
        this.#lightDirectionBuffer[VECTOR_INDEX_Z] = deltaZ;
        this.#directionalLight.setDirection(this.#lightDirectionBuffer);
    }

    /**
     * Returns the current light target position.
     *
     * @returns {GeraWebGL.Math.Vector3}
     * @throws {Error} When the light target object is missing.
     * @private
     */
    #getLightTargetPosition() {
        if (!this.#lightTargetObject) {
            throw new Error(ERROR_LIGHT_TARGET_OBJECT_MISSING);
        }

        return this.#lightTargetObject.position;
    }

    /**
     * Synchronizes the transform gizmo anchor with the directional light position.
     *
     * @returns {void}
     * @private
     */
    #syncTransformGizmoAnchor() {
        if (!this.#transformGizmoAnchor || !this.#directionalLight) {
            return;
        }

        this.#transformGizmoAnchor.position.copyFrom(this.#directionalLight.position);
    }

    /**
     * Handles pointer down events for light dragging.
     *
     * @param {PointerEvent} event - Pointer event.
     * @returns {void}
     * @throws {TypeError} When the event is invalid.
     * @private
     */
    #onPointerDown(event) {
        if (!(event instanceof PointerEvent)) {
            throw new TypeError(ERROR_POINTER_EVENT_TYPE);
        }

        if (this.#changeLightPointEnabled) {
            this.#handleTargetPointerDown(event);
            return;
        }

        if (!this.#dragLightEnabled) {
            return;
        }

        this.#handleLightPointerDown(event);
    }

    /**
     * Handles pointer move events for light dragging.
     *
     * @param {PointerEvent} event - Pointer event.
     * @returns {void}
     * @throws {TypeError} When the event is invalid.
     * @private
     */
    #onPointerMove(event) {
        if (!(event instanceof PointerEvent)) {
            throw new TypeError(ERROR_POINTER_EVENT_TYPE);
        }

        if (this.#changeLightPointEnabled) {
            this.#handleTargetPointerMove(event);
            return;
        }

        if (!this.#dragLightEnabled) {
            return;
        }

        this.#handleLightPointerMove(event);
    }

    /**
     * Handles pointer up events for light dragging.
     *
     * @param {PointerEvent} event - Pointer event.
     * @returns {void}
     * @throws {TypeError} When the event is invalid.
     * @private
     */
    #onPointerUp(event) {
        if (!(event instanceof PointerEvent)) {
            throw new TypeError(ERROR_POINTER_EVENT_TYPE);
        }

        if (this.#changeLightPointEnabled) {
            this.#handleTargetPointerUp(event);
            return;
        }

        if (!this.#dragLightEnabled) {
            return;
        }

        this.#handleLightPointerUp(event);
    }

    /**
     * Handles pointer down events for light dragging.
     *
     * @param {PointerEvent} event - Pointer event.
     * @returns {void}
     * @throws {TypeError} When the event is invalid.
     * @private
     */
    #handleLightPointerDown(event) {
        if (!(event instanceof PointerEvent)) {
            throw new TypeError(ERROR_POINTER_EVENT_TYPE);
        }

        if (!this.#transformGizmo) {
            return;
        }

        this.#updateMouseNdcFromEvent(event, this.#canvas, this.#mouseNdc);

        const intersections = this.#raycaster.raycast(
            this.#engine.scene,
            this.#engine.camera,
            this.#mouseNdc,
            this.#raycastOptions
        );

        const hit  = intersections.length > ZERO ? intersections[ZERO] : null;
        const axis = hit ? this.#transformGizmo.getAxisForMesh(hit.object) : null;

        if (!axis) {
            this.#isLightDragging = false;
            this.#dragAxis        = null;
            this.#hoveredAxis     = null;
            this.#transformGizmo.setActiveAxis(null);
            this.#transformGizmo.setHoveredAxis(null);
            return;
        }

        event.preventDefault();
        event.stopImmediatePropagation();
        this.#transformGizmo.setActiveAxis(axis);
        this.#dragAxis        = axis;
        this.#isLightDragging = true;
        this.#cacheCanvasBounds();

        this.#dragStartPosition.copyFrom(this.#directionalLight.position);
        this.#dragAxisOrigin.copyFrom(this.#dragStartPosition);

        this.#getAxisDirection(axis, this.#dragAxisDirection);
        this.#updateRayFromMouseNdc(this.#mouseNdc);
        this.#dragStartAxisParam = this.#computeAxisParameterFromRay(
            this.#rayOrigin,
            this.#rayDirection,
            this.#dragAxisOrigin,
            this.#dragAxisDirection
        );
    }

    /**
     * Handles pointer move events for light dragging.
     *
     * @param {PointerEvent} event - Pointer event.
     * @returns {void}
     * @throws {TypeError} When the event is invalid.
     * @private
     */
    #handleLightPointerMove(event) {
        if (!(event instanceof PointerEvent)) {
            throw new TypeError(ERROR_POINTER_EVENT_TYPE);
        }

        if (!this.#transformGizmo) {
            return;
        }

        if (!this.#isLightDragging) {
            this.#updateMouseNdcFromEvent(event, this.#canvas, this.#mouseNdc);

            const intersections = this.#raycaster.raycast(
                this.#engine.scene,
                this.#engine.camera,
                this.#mouseNdc,
                this.#raycastOptions
            );

            const hit  = intersections.length > ZERO ? intersections[ZERO] : null;
            const axis = hit ? this.#transformGizmo.getAxisForMesh(hit.object) : null;

            if (axis !== this.#hoveredAxis) {
                this.#hoveredAxis = axis;
                this.#transformGizmo.setHoveredAxis(axis);
            }

            return;
        }

        if (!this.#dragAxis) {
            return;
        }

        event.preventDefault();
        event.stopImmediatePropagation();
        this.#updateRayFromEvent(event);

        const axisParam = this.#computeAxisParameterFromRay(
            this.#rayOrigin,
            this.#rayDirection,
            this.#dragAxisOrigin,
            this.#dragAxisDirection
        );

        const delta = axisParam - this.#dragStartAxisParam;
        GeraWebGL.Math.Vector3Math.scale(this.#dragOffsetVector, this.#dragAxisDirection, delta);
        GeraWebGL.Math.Vector3Math.add(this.#dragResultPosition, this.#dragStartPosition, this.#dragOffsetVector);
        this.#directionalLight.position.copyFrom(this.#dragResultPosition);
        this.#updateDirectionalLightDirectionFromPosition();
        this.#syncTransformGizmoAnchor();
    }

    /**
     * Handles pointer up events for light dragging.
     *
     * @param {PointerEvent} event - Pointer event.
     * @returns {void}
     * @throws {TypeError} When the event is invalid.
     * @private
     */
    #handleLightPointerUp(event) {
        if (!(event instanceof PointerEvent)) {
            throw new TypeError(ERROR_POINTER_EVENT_TYPE);
        }

        if (!this.#isLightDragging) {
            return;
        }

        event.preventDefault();
        event.stopImmediatePropagation();
        this.#clearLightDragState();
    }

    /**
     * Handles pointer down events for light target dragging.
     *
     * @param {PointerEvent} event - Pointer event.
     * @returns {void}
     * @throws {TypeError} When the event is invalid.
     * @private
     */
    #handleTargetPointerDown(event) {
        if (!(event instanceof PointerEvent)) {
            throw new TypeError(ERROR_POINTER_EVENT_TYPE);
        }

        if (!this.#lightTargetGizmo || !this.#lightTargetObject) {
            return;
        }

        this.#updateMouseNdcFromEvent(event, this.#canvas, this.#mouseNdc);

        const intersections = this.#raycaster.raycast(
            this.#engine.scene,
            this.#engine.camera,
            this.#mouseNdc,
            this.#raycastOptions
        );

        const hit  = intersections.length > ZERO ? intersections[ZERO] : null;
        const axis = hit ? this.#lightTargetGizmo.getAxisForMesh(hit.object) : null;

        if (!axis) {
            this.#isTargetDragging = false;
            this.#targetDragAxis = null;
            this.#targetHoveredAxis = null;
            this.#lightTargetGizmo.setActiveAxis(null);
            this.#lightTargetGizmo.setHoveredAxis(null);
            return;
        }

        event.preventDefault();
        event.stopImmediatePropagation();
        this.#lightTargetGizmo.setActiveAxis(axis);
        this.#targetDragAxis = axis;
        this.#isTargetDragging = true;
        this.#cacheCanvasBounds();

        this.#dragStartPosition.copyFrom(this.#lightTargetObject.position);
        this.#dragAxisOrigin.copyFrom(this.#dragStartPosition);

        this.#getAxisDirection(axis, this.#dragAxisDirection);
        this.#updateRayFromMouseNdc(this.#mouseNdc);
        this.#targetDragStartAxisParam = this.#computeAxisParameterFromRay(
            this.#rayOrigin,
            this.#rayDirection,
            this.#dragAxisOrigin,
            this.#dragAxisDirection
        );
    }

    /**
     * Handles pointer move events for light target dragging.
     *
     * @param {PointerEvent} event - Pointer event.
     * @returns {void}
     * @throws {TypeError} When the event is invalid.
     * @private
     */
    #handleTargetPointerMove(event) {
        if (!(event instanceof PointerEvent)) {
            throw new TypeError(ERROR_POINTER_EVENT_TYPE);
        }

        if (!this.#lightTargetGizmo || !this.#lightTargetObject) {
            return;
        }

        if (!this.#isTargetDragging) {
            this.#updateMouseNdcFromEvent(event, this.#canvas, this.#mouseNdc);

            const intersections = this.#raycaster.raycast(
                this.#engine.scene,
                this.#engine.camera,
                this.#mouseNdc,
                this.#raycastOptions
            );

            const hit  = intersections.length > ZERO ? intersections[ZERO] : null;
            const axis = hit ? this.#lightTargetGizmo.getAxisForMesh(hit.object) : null;

            if (axis !== this.#targetHoveredAxis) {
                this.#targetHoveredAxis = axis;
                this.#lightTargetGizmo.setHoveredAxis(axis);
            }

            return;
        }

        if (!this.#targetDragAxis) {
            return;
        }

        event.preventDefault();
        event.stopImmediatePropagation();
        this.#updateRayFromEvent(event);

        const axisParam = this.#computeAxisParameterFromRay(
            this.#rayOrigin,
            this.#rayDirection,
            this.#dragAxisOrigin,
            this.#dragAxisDirection
        );

        const delta = axisParam - this.#targetDragStartAxisParam;
        GeraWebGL.Math.Vector3Math.scale(this.#dragOffsetVector, this.#dragAxisDirection, delta);
        GeraWebGL.Math.Vector3Math.add(this.#dragResultPosition, this.#dragStartPosition, this.#dragOffsetVector);
        this.#lightTargetObject.position.copyFrom(this.#dragResultPosition);
        this.#updateDirectionalLightDirectionFromPosition();
    }

    /**
     * Handles pointer up events for light target dragging.
     *
     * @param {PointerEvent} event - Pointer event.
     * @returns {void}
     * @throws {TypeError} When the event is invalid.
     * @private
     */
    #handleTargetPointerUp(event) {
        if (!(event instanceof PointerEvent)) {
            throw new TypeError(ERROR_POINTER_EVENT_TYPE);
        }

        if (!this.#isTargetDragging) {
            return;
        }

        event.preventDefault();
        event.stopImmediatePropagation();
        this.#clearTargetDragState();
    }

    /**
     * Clears the active light drag state.
     *
     * @returns {void}
     * @private
     */
    #clearLightDragState() {
        this.#isLightDragging    = false;
        this.#dragAxis           = null;
        this.#hoveredAxis        = null;
        this.#dragStartAxisParam = ZERO;
        this.#hasCachedBounds    = false;

        if (this.#transformGizmo) {
            this.#transformGizmo.clearState();
        }
    }

    /**
     * Clears the active light target drag state.
     *
     * @returns {void}
     * @private
     */
    #clearTargetDragState() {
        this.#isTargetDragging         = false;
        this.#targetDragAxis           = null;
        this.#targetHoveredAxis        = null;
        this.#targetDragStartAxisParam = ZERO;
        this.#hasCachedBounds          = false;

        if (this.#lightTargetGizmo) {
            this.#lightTargetGizmo.clearState();
        }
    }

    /**
     * Caches the current canvas bounds for drag computations.
     *
     * @returns {void}
     * @private
     */
    #cacheCanvasBounds() {
        const rect = this.#canvas.getBoundingClientRect();
        this.#canvasBounds.left   = rect.left;
        this.#canvasBounds.top    = rect.top;
        this.#canvasBounds.width  = rect.width;
        this.#canvasBounds.height = rect.height;
        this.#hasCachedBounds     = true;
    }

    /**
     * Updates the normalized device coordinates from a pointer event.
     *
     * @param {PointerEvent} event                 - Pointer event.
     * @param {HTMLCanvasElement} canvas           - Target canvas.
     * @param {{x: number, y: number}} outMouseNdc - Output object to mutate.
     * @returns {void}
     * @throws {TypeError} When inputs are invalid.
     * @private
     */
    #updateMouseNdcFromEvent(event, canvas, outMouseNdc) {
        if (!(event instanceof PointerEvent)) {
            throw new TypeError(ERROR_POINTER_EVENT_TYPE);
        }

        if (!(canvas instanceof HTMLCanvasElement)) {
            throw new TypeError(ERROR_POINTER_CANVAS_TYPE);
        }

        if (outMouseNdc === null || typeof outMouseNdc !== 'object' || Array.isArray(outMouseNdc)) {
            throw new TypeError(ERROR_POINTER_NDC_TYPE);
        }

        if (typeof outMouseNdc.x !== 'number' || typeof outMouseNdc.y !== 'number') {
            throw new TypeError(ERROR_POINTER_NDC_TYPE);
        }

        const bounds    = this.#hasCachedBounds ? this.#canvasBounds : canvas.getBoundingClientRect();
        const relativeX = (event.clientX - bounds.left) / bounds.width;
        const relativeY = (event.clientY - bounds.top) / bounds.height;
        outMouseNdc.x   = (relativeX * NDC_SCALE) + NDC_OFFSET;
        outMouseNdc.y   = ((relativeY * NDC_SCALE) + NDC_OFFSET) * NDC_Y_FLIP;
    }

    /**
     * Updates cached ray values from a pointer event.
     *
     * @param {PointerEvent} event - Pointer event.
     * @returns {void}
     * @throws {TypeError} When inputs are invalid.
     * @private
     */
    #updateRayFromEvent(event) {
        this.#updateMouseNdcFromEvent(event, this.#canvas, this.#mouseNdc);
        this.#updateRayFromMouseNdc(this.#mouseNdc);
    }

    /**
     * Updates cached ray values from NDC coordinates.
     *
     * @param {{x: number, y: number}} mouseNdc - Mouse NDC coordinates.
     * @returns {void}
     * @throws {TypeError} When inputs are invalid.
     * @private
     */
    #updateRayFromMouseNdc(mouseNdc) {
        if (mouseNdc === null || typeof mouseNdc !== 'object' || Array.isArray(mouseNdc)) {
            throw new TypeError(ERROR_POINTER_NDC_TYPE);
        }

        if (typeof mouseNdc.x !== 'number' || typeof mouseNdc.y !== 'number') {
            throw new TypeError(ERROR_POINTER_NDC_TYPE);
        }

        const camera           = this.#engine.camera;
        const viewMatrix       = camera.getViewMatrix();
        const projectionMatrix = camera.getProjectionMatrix();

        GeraWebGL.Math.Matrix4.multiplyTo(this.#viewProjectionMatrix, projectionMatrix, viewMatrix);
        GeraWebGL.Math.Matrix4.invertTo(this.#inverseViewProjectionMatrix, this.#viewProjectionMatrix);
        this.#unprojectToVector(this.#inverseViewProjectionMatrix, mouseNdc.x, mouseNdc.y, RAY_NDC_NEAR, this.#rayNearPoint);
        this.#unprojectToVector(this.#inverseViewProjectionMatrix, mouseNdc.x, mouseNdc.y, RAY_NDC_FAR, this.#rayFarPoint);

        GeraWebGL.Math.Vector3Math.sub(this.#rayDirection, this.#rayFarPoint, this.#rayNearPoint);
        GeraWebGL.Math.Vector3Math.normalize(this.#rayDirection, this.#rayDirection);
        this.#rayOrigin.copyFrom(this.#rayNearPoint);
    }

    /**
     * Unprojects NDC coordinates into world space.
     *
     * @param {Float32Array} matrix - Inverse view-projection matrix.
     * @param {number} ndcX         - NDC X coordinate.
     * @param {number} ndcY         - NDC Y coordinate.
     * @param {number} ndcZ         - NDC Z coordinate.
     * @param {GeraWebGL.Math.Vector3} outVector - Output vector.
     * @returns {void}
     * @throws {TypeError} When inputs are invalid.
     * @private
     */
    #unprojectToVector(matrix, ndcX, ndcY, ndcZ, outVector) {
        if (!(matrix instanceof Float32Array) || matrix.length !== MATRIX_4X4_ELEMENT_COUNT) {
            throw new TypeError(ERROR_UNPROJECT_MATRIX_TYPE);
        }

        if (!(outVector instanceof GeraWebGL.Math.Vector3)) {
            throw new TypeError(ERROR_VECTOR3_TYPE);
        }

        const clipX = ndcX;
        const clipY = ndcY;
        const clipZ = ndcZ;
        const clipW = RAY_CLIP_W;

        const worldX = (matrix[MATRIX_INDEX_00] * clipX)
            + (matrix[MATRIX_INDEX_10] * clipY)
            + (matrix[MATRIX_INDEX_20] * clipZ)
            + (matrix[MATRIX_INDEX_30] * clipW);

        const worldY = (matrix[MATRIX_INDEX_01] * clipX)
            + (matrix[MATRIX_INDEX_11] * clipY)
            + (matrix[MATRIX_INDEX_21] * clipZ)
            + (matrix[MATRIX_INDEX_31] * clipW);

        const worldZ = (matrix[MATRIX_INDEX_02] * clipX)
            + (matrix[MATRIX_INDEX_12] * clipY)
            + (matrix[MATRIX_INDEX_22] * clipZ)
            + (matrix[MATRIX_INDEX_32] * clipW);

        const worldW = (matrix[MATRIX_INDEX_03] * clipX)
            + (matrix[MATRIX_INDEX_13] * clipY)
            + (matrix[MATRIX_INDEX_23] * clipZ)
            + (matrix[MATRIX_INDEX_33] * clipW);

        if (worldW === ZERO) {
            throw new Error(ERROR_UNPROJECT_W_ZERO);
        }

        const inverseW = ONE / worldW;
        outVector.set(worldX * inverseW, worldY * inverseW, worldZ * inverseW);
    }

    /**
     * Gets the world-space axis direction for the current gizmo.
     *
     * @param {string} axis                - Axis identifier.
     * @param {GeraWebGL.Math.Vector3} out - Output vector.
     * @returns {void}
     * @throws {TypeError} When inputs are invalid.
     * @private
     */
    #getAxisDirection(axis, out) {
        if (axis !== AXIS_X && axis !== AXIS_Y && axis !== AXIS_Z) {
            throw new TypeError(ERROR_DRAG_AXIS_TYPE);
        }

        if (!(out instanceof GeraWebGL.Math.Vector3)) {
            throw new TypeError(ERROR_VECTOR3_TYPE);
        }

        const gizmo = this.#changeLightPointEnabled ? this.#lightTargetGizmo : this.#transformGizmo;

        if (!gizmo) {
            const errorMessage = this.#changeLightPointEnabled
                ? ERROR_LIGHT_TARGET_GIZMO_MISSING
                : ERROR_TRANSFORM_GIZMO_MISSING;

            throw new Error(errorMessage);
        }

        const worldMatrix = gizmo.worldMatrix;
        let axisX = ZERO;
        let axisY = ZERO;
        let axisZ = ZERO;

        if (axis === AXIS_X) {
            axisX = worldMatrix[WORLD_AXIS_X_INDEX_X];
            axisY = worldMatrix[WORLD_AXIS_X_INDEX_Y];
            axisZ = worldMatrix[WORLD_AXIS_X_INDEX_Z];

        } else if (axis === AXIS_Y) {
            axisX = worldMatrix[WORLD_AXIS_Y_INDEX_X];
            axisY = worldMatrix[WORLD_AXIS_Y_INDEX_Y];
            axisZ = worldMatrix[WORLD_AXIS_Y_INDEX_Z];

        } else {
            axisX = worldMatrix[WORLD_AXIS_Z_INDEX_X];
            axisY = worldMatrix[WORLD_AXIS_Z_INDEX_Y];
            axisZ = worldMatrix[WORLD_AXIS_Z_INDEX_Z];

        }

        out.set(axisX, axisY, axisZ);
        GeraWebGL.Math.Vector3Math.normalize(out, out);
    }

    /**
     * Computes the axis parameter for the closest point between a ray and axis line.
     *
     * @param {GeraWebGL.Math.Vector3} rayOrigin     - Ray origin.
     * @param {GeraWebGL.Math.Vector3} rayDirection  - Ray direction (normalized).
     * @param {GeraWebGL.Math.Vector3} axisOrigin    - Axis origin.
     * @param {GeraWebGL.Math.Vector3} axisDirection - Axis direction (normalized).
     * @returns {number}
     * @throws {TypeError} When inputs are invalid.
     * @private
     */
    #computeAxisParameterFromRay(rayOrigin, rayDirection, axisOrigin, axisDirection) {
        if (!(rayOrigin        instanceof GeraWebGL.Math.Vector3)
            || !(rayDirection  instanceof GeraWebGL.Math.Vector3)
            || !(axisOrigin    instanceof GeraWebGL.Math.Vector3)
            || !(axisDirection instanceof GeraWebGL.Math.Vector3)) {
            throw new TypeError(ERROR_VECTOR3_TYPE);
        }

        // Relative offset from axis origin to ray the origin:
        GeraWebGL.Math.Vector3Math.sub(this.#dragOffsetVector, rayOrigin, axisOrigin);

        // Precompute the dot products for the `2-line` closest points solution:
        const rayDirDotRayDir   = GeraWebGL.Math.Vector3Math.dot(rayDirection, rayDirection);
        const rayDirDotAxisDir  = GeraWebGL.Math.Vector3Math.dot(rayDirection, axisDirection);
        const axisDirDotAxisDir = GeraWebGL.Math.Vector3Math.dot(axisDirection, axisDirection);
        const rayDirDotOffset   = GeraWebGL.Math.Vector3Math.dot(rayDirection, this.#dragOffsetVector);
        const axisDirDotOffset  = GeraWebGL.Math.Vector3Math.dot(axisDirection, this.#dragOffsetVector);

        // Denominator of the linear system (near-zero means ray is nearly parallel to the axis):
        const denominator = (rayDirDotRayDir * axisDirDotAxisDir) - (rayDirDotAxisDir * rayDirDotAxisDir);

        // Handle the near-parallel case to avoid the division instability:
        if (Math.abs(denominator) <= RAY_AXIS_EPSILON) {
            return ZERO;
        }

        return ((rayDirDotRayDir * axisDirDotOffset) - (rayDirDotAxisDir * rayDirDotOffset)) / denominator;
    }

    /**
     * Runs the demo application from DOM.
     */
    static run() {
        const canvas = document.getElementById(CANVAS_ELEMENT_ID);

        if (!(canvas instanceof HTMLCanvasElement)) {
            throw new Error(ERROR_CANVAS_NOT_FOUND);
        }

        const wireframeButton               = document.getElementById(WIREFRAME_TOGGLE_BUTTON_ID);
        const resetButton                   = document.getElementById(RESET_VIEW_BUTTON_ID);
        const statusLabel                   = document.getElementById(STATUS_LABEL_ID);
        const lightingToggle                = document.getElementById(LIGHTING_TOGGLE_INPUT_ID);
        const directionalLightToggle        = document.getElementById(DIRECTIONAL_LIGHT_TOGGLE_INPUT_ID);
        const ambientLightToggle            = document.getElementById(AMBIENT_LIGHT_TOGGLE_INPUT_ID);
        const directionalStrengthInput      = document.getElementById(DIRECTIONAL_STRENGTH_INPUT_ID);
        const directionalStrengthLabel      = document.getElementById(DIRECTIONAL_STRENGTH_LABEL_ID);
        const directionalStrengthValueLabel = document.getElementById(DIRECTIONAL_STRENGTH_VALUE_ID);
        const ambientStrengthInput          = document.getElementById(AMBIENT_STRENGTH_INPUT_ID);
        const ambientStrengthLabel          = document.getElementById(AMBIENT_STRENGTH_LABEL_ID);
        const ambientStrengthValueLabel     = document.getElementById(AMBIENT_STRENGTH_VALUE_ID);
        const lightGizmoToggle              = document.getElementById(LIGHT_GIZMO_TOGGLE_INPUT_ID);
        const activeLightsLabel             = document.getElementById(ACTIVE_LIGHTS_LABEL_ID);
        const lightPositionLabel            = document.getElementById(LIGHT_POSITION_LABEL_ID);
        const lightPointLabel               = document.getElementById(LIGHT_POINT_LABEL_ID);
        const dragAxisLabel                 = document.getElementById(DRAG_AXIS_LABEL_ID);
        const rotateLightToggle             = document.getElementById(ROTATE_LIGHT_TOGGLE_INPUT_ID);
        const rotateLightLabel              = document.getElementById(ROTATE_LIGHT_TOGGLE_LABEL_ID);
        const dragLightToggle               = document.getElementById(DRAG_LIGHT_TOGGLE_INPUT_ID);
        const dragLightLabel                = document.getElementById(DRAG_LIGHT_TOGGLE_LABEL_ID);
        const changeLightPointToggle        = document.getElementById(CHANGE_LIGHT_POINT_TOGGLE_INPUT_ID);
        const changeLightPointLabel         = document.getElementById(CHANGE_LIGHT_POINT_TOGGLE_LABEL_ID);
        const pauseCameraRotationToggle     = document.getElementById(PAUSE_CAMERA_ROTATION_TOGGLE_INPUT_ID);
        const pauseCameraRotationLabel      = document.getElementById(PAUSE_CAMERA_ROTATION_TOGGLE_LABEL_ID);
        const localFolderInput              = document.getElementById(LOCAL_FOLDER_INPUT_ID);
        const localLoadButton               = document.getElementById(LOCAL_LOAD_BUTTON_ID);
        const localStatusLabel              = document.getElementById(LOCAL_STATUS_LABEL_ID);
        const localObjSelect                = document.getElementById(LOCAL_OBJ_SELECT_ID);
        const localObjSelectRow             = document.getElementById(LOCAL_OBJ_SELECT_ROW_ID);

        if (!(wireframeButton instanceof HTMLButtonElement)) {
            throw new Error(ERROR_WIREFRAME_BUTTON_NOT_FOUND);
        }

        if (!(resetButton instanceof HTMLButtonElement)) {
            throw new Error(ERROR_RESET_BUTTON_NOT_FOUND);
        }

        if (!(statusLabel instanceof HTMLElement)) {
            throw new Error(ERROR_STATUS_LABEL_NOT_FOUND);
        }

        if (!(lightingToggle instanceof HTMLInputElement)) {
            throw new Error(ERROR_LIGHTING_TOGGLE_NOT_FOUND);
        }

        if (!(directionalLightToggle instanceof HTMLInputElement)) {
            throw new Error(ERROR_DIRECTIONAL_LIGHT_TOGGLE_NOT_FOUND);
        }

        if (!(ambientLightToggle instanceof HTMLInputElement)) {
            throw new Error(ERROR_AMBIENT_LIGHT_TOGGLE_NOT_FOUND);
        }

        if (!(directionalStrengthInput instanceof HTMLInputElement)) {
            throw new Error(ERROR_DIRECTIONAL_STRENGTH_INPUT_NOT_FOUND);
        }

        if (!(directionalStrengthLabel instanceof HTMLElement)) {
            throw new Error(ERROR_DIRECTIONAL_STRENGTH_LABEL_NOT_FOUND);
        }

        if (!(directionalStrengthValueLabel instanceof HTMLElement)) {
            throw new Error(ERROR_DIRECTIONAL_STRENGTH_VALUE_NOT_FOUND);
        }

        if (!(ambientStrengthInput instanceof HTMLInputElement)) {
            throw new Error(ERROR_AMBIENT_STRENGTH_INPUT_NOT_FOUND);
        }

        if (!(ambientStrengthLabel instanceof HTMLElement)) {
            throw new Error(ERROR_AMBIENT_STRENGTH_LABEL_NOT_FOUND);
        }

        if (!(ambientStrengthValueLabel instanceof HTMLElement)) {
            throw new Error(ERROR_AMBIENT_STRENGTH_VALUE_NOT_FOUND);
        }

        if (!(lightGizmoToggle instanceof HTMLInputElement)) {
            throw new Error(ERROR_LIGHT_GIZMO_TOGGLE_NOT_FOUND);
        }

        if (!(activeLightsLabel instanceof HTMLElement)) {
            throw new Error(ERROR_ACTIVE_LIGHTS_LABEL_NOT_FOUND);
        }

        if (!(lightPositionLabel instanceof HTMLElement)) {
            throw new Error(ERROR_LIGHT_POSITION_LABEL_NOT_FOUND);
        }

        if (!(lightPointLabel instanceof HTMLElement)) {
            throw new Error(ERROR_LIGHT_POINT_LABEL_NOT_FOUND);
        }

        if (!(dragAxisLabel instanceof HTMLElement)) {
            throw new Error(ERROR_DRAG_AXIS_LABEL_NOT_FOUND);
        }

        if (!(rotateLightToggle instanceof HTMLInputElement)) {
            throw new Error(ERROR_ROTATE_LIGHT_TOGGLE_NOT_FOUND);
        }

        if (!(rotateLightLabel instanceof HTMLElement)) {
            throw new Error(ERROR_ROTATE_LIGHT_LABEL_NOT_FOUND);
        }

        if (!(dragLightToggle instanceof HTMLInputElement)) {
            throw new Error(ERROR_DRAG_LIGHT_TOGGLE_NOT_FOUND);
        }

        if (!(dragLightLabel instanceof HTMLElement)) {
            throw new Error(ERROR_DRAG_LIGHT_LABEL_NOT_FOUND);
        }

        if (!(changeLightPointToggle instanceof HTMLInputElement)) {
            throw new Error(ERROR_CHANGE_LIGHT_POINT_TOGGLE_NOT_FOUND);
        }

        if (!(changeLightPointLabel instanceof HTMLElement)) {
            throw new Error(ERROR_CHANGE_LIGHT_POINT_LABEL_NOT_FOUND);
        }

        if (!(pauseCameraRotationToggle instanceof HTMLInputElement)) {
            throw new Error(ERROR_PAUSE_CAMERA_ROTATION_TOGGLE_NOT_FOUND);
        }

        if (!(pauseCameraRotationLabel instanceof HTMLElement)) {
            throw new Error(ERROR_PAUSE_CAMERA_ROTATION_LABEL_NOT_FOUND);
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
            lightingToggle,
            directionalLightToggle,
            ambientLightToggle,
            directionalStrengthInput,
            directionalStrengthLabel,
            directionalStrengthValueLabel,
            ambientStrengthInput,
            ambientStrengthLabel,
            ambientStrengthValueLabel,
            lightGizmoToggle,
            activeLightsLabel,
            lightPositionLabel,
            lightPointLabel,
            dragAxisLabel,
            rotateLightToggle,
            rotateLightLabel,
            dragLightToggle,
            dragLightLabel,
            changeLightPointToggle,
            changeLightPointLabel,
            pauseCameraRotationToggle,
            pauseCameraRotationLabel,
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

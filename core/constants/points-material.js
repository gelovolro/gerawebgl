import { MATH_COMMON_VALUES }       from './math.js';
import * as SharedMaterialConstants from './material.js';

// Defaults used by 'PointsMaterial'
export const POINTS_MATERIAL_DEFAULTS = Object.freeze({
    POINT_SIZE        : 6.0,
    USE_VERTEX_COLORS : false
});

// Uniforms used by 'PointsMaterial'
export const POINTS_MATERIAL_UNIFORMS = Object.freeze({
    POINT_SIZE       : 'u_pointSize',
    USE_VERTEX_COLOR : 'u_useVertexColor'
});

// Values used by 'PointsMaterial'
export const POINTS_MATERIAL_VALUES = Object.freeze({
    POINT_COORD_CENTER : 0.5,
    POINT_COORD_RADIUS : 0.5
});

// GLSL sources
export const POINTS_MATERIAL_SHADERS = Object.freeze({

    VERTEX : `
#version 300 es
precision mediump float;
layout(location = ${SharedMaterialConstants.MATERIAL_ATTRIBUTES.POSITION}) in vec3 a_position;
layout(location = ${SharedMaterialConstants.MATERIAL_ATTRIBUTES.COLOR}) in vec3 a_color;
uniform mat4 ${SharedMaterialConstants.MATERIAL_UNIFORMS.MATRIX};
uniform vec3 ${SharedMaterialConstants.MATERIAL_UNIFORMS.COLOR};
uniform float ${POINTS_MATERIAL_UNIFORMS.POINT_SIZE};
uniform float ${POINTS_MATERIAL_UNIFORMS.USE_VERTEX_COLOR};
out vec3 v_color;

void main() {
    gl_Position  = ${SharedMaterialConstants.MATERIAL_UNIFORMS.MATRIX} * vec4(a_position, ${MATH_COMMON_VALUES.UNIT});
    gl_PointSize = ${POINTS_MATERIAL_UNIFORMS.POINT_SIZE};
    v_color      = mix(${SharedMaterialConstants.MATERIAL_UNIFORMS.COLOR}, a_color, ${POINTS_MATERIAL_UNIFORMS.USE_VERTEX_COLOR});
}
`,

    FRAGMENT : `
#version 300 es
precision mediump float;
in vec3 v_color;
uniform float ${SharedMaterialConstants.MATERIAL_UNIFORMS.OPACITY};
out vec4 outColor;

void main() {
    vec2 centered = gl_PointCoord - vec2(${POINTS_MATERIAL_VALUES.POINT_COORD_CENTER}, ${POINTS_MATERIAL_VALUES.POINT_COORD_CENTER});
    float dist    = length(centered);

    if (dist > ${POINTS_MATERIAL_VALUES.POINT_COORD_RADIUS}) {
        discard;
    }

    outColor = vec4(v_color, ${SharedMaterialConstants.MATERIAL_UNIFORMS.OPACITY});
}
`

});

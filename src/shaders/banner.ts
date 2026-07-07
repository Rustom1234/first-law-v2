import { windFunctionGLSL } from './wind';

/** Cloth wobble driven purely by gl_InstanceID (no extra per-instance attribute needed). */
export const bannerVertexShader = /* glsl */ `
attribute vec3 aColor;
uniform float uTime;
varying vec3 vColor;

${windFunctionGLSL}

void main() {
  vColor = aColor;
  float phase = float(gl_InstanceID) * 2.399963;
  float bendWeight = clamp(position.y, 0.0, 1.0);
  float sway = windSway(uTime, phase, 1.6, 0.16) * bendWeight;

  vec3 displaced = position + vec3(sway, 0.0, sway * 0.4);
  vec4 mvPosition = instanceMatrix * vec4(displaced, 1.0);
  gl_Position = projectionMatrix * modelViewMatrix * mvPosition;
}
`;

export const bannerFragmentShader = /* glsl */ `
varying vec3 vColor;
void main() {
  gl_FragColor = vec4(vColor, 1.0);
}
`;

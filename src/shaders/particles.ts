import { windFunctionGLSL } from './wind';

export const particlesVertexShader = /* glsl */ `
attribute float aSeed;
uniform float uTime;
uniform float uBoxSize;
uniform float uFallSpeed;
uniform float uPixelRatio;
uniform float uParticleSize;
varying float vSeed;

${windFunctionGLSL}

void main() {
  vSeed = aSeed;
  float halfBox = uBoxSize * 0.5;

  float fall = mod(position.y - uTime * uFallSpeed * (0.5 + aSeed * 0.5) + halfBox, uBoxSize) - halfBox;
  float sway = windSway(uTime, aSeed * 6.2831, 0.6 + aSeed * 0.4, 1.2);

  vec3 displaced = vec3(position.x + sway, fall, position.z);
  vec4 mvPosition = modelViewMatrix * vec4(displaced, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  gl_PointSize = uParticleSize * uPixelRatio * (60.0 / -mvPosition.z);
}
`;

export const particlesFragmentShader = /* glsl */ `
uniform vec3 uColor;
varying float vSeed;

void main() {
  vec2 centered = gl_PointCoord - 0.5;
  float dist = length(centered);
  float alpha = smoothstep(0.5, 0.0, dist) * (0.5 + vSeed * 0.5);
  gl_FragColor = vec4(uColor, alpha);
}
`;

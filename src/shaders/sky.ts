export const skyVertexShader = /* glsl */ `
varying vec3 vWorldPosition;
void main() {
  vec4 worldPosition = modelMatrix * vec4(position, 1.0);
  vWorldPosition = worldPosition.xyz;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const skyFragmentShader = /* glsl */ `
uniform vec3 uZenithColor;
uniform vec3 uHorizonColor;
uniform float uOffset;
uniform float uExponent;
varying vec3 vWorldPosition;

void main() {
  float h = normalize(vWorldPosition + vec3(0.0, uOffset, 0.0)).y;
  float t = pow(max(h, 0.0), uExponent);
  vec3 color = mix(uHorizonColor, uZenithColor, t);
  gl_FragColor = vec4(color, 1.0);
}
`;

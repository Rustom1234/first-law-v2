/** Shared GLSL snippet: a cheap wind sway offset, reused by particle drift and banner/cloth wobble. */
export const windFunctionGLSL = /* glsl */ `
float windSway(float time, float phase, float freq, float amp) {
  return sin(time * freq + phase) * amp;
}
`;

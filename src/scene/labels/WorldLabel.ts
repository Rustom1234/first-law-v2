import * as THREE from 'three';

function drawLabelCanvas(text: string): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.font = '600 46px Georgia, "Times New Roman", serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  ctx.shadowColor = 'rgba(0,0,0,0.85)';
  ctx.shadowBlur = 14;
  ctx.fillStyle = 'rgba(220,224,220,0.92)';
  ctx.fillText(text.toUpperCase(), canvas.width / 2, canvas.height / 2);

  return canvas;
}

/** A sparse, data-driven region nameplate: canvas-texture sprite, cheap and always faces the camera. */
export function createWorldLabel(text: string): THREE.Sprite {
  const canvas = drawLabelCanvas(text);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;

  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthWrite: false,
    fog: true,
  });

  const sprite = new THREE.Sprite(material);
  sprite.scale.set(14, 3.5, 1);
  return sprite;
}

import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { clamp, lerp } from '../lib/math';
import { makeRng } from '../lib/rng';

const SHELF_COLOR = new THREE.Color('#241a12');
const STONE_COLOR = new THREE.Color('#5e5851');
const BOOK_COLORS = ['#5c2e1f', '#4a3a1f', '#6b4a2a', '#7a3520', '#3a2a1a'];

/** One shelf wall: frame, boards, and its books merged into one geometry per book color,
 * so a wall of hundreds of books costs a handful of draw calls. */
function buildShelfWall(width: number, height: number, rows: number, rng: () => number): THREE.Group {
  const wall = new THREE.Group();

  const frameParts: THREE.BufferGeometry[] = [];
  const frame = new THREE.BoxGeometry(width, height, 1.1);
  frame.translate(0, height / 2, 0);
  frameParts.push(frame);
  const rowHeight = (height - 1.2) / rows;
  for (let row = 1; row <= rows; row++) {
    const board = new THREE.BoxGeometry(width - 0.3, 0.12, 1.0);
    board.translate(0, 0.6 + row * rowHeight, 0.1);
    frameParts.push(board);
  }
  const frameMaterial = new THREE.MeshStandardMaterial({ color: SHELF_COLOR, roughness: 0.95 });
  const frameMesh = new THREE.Mesh(mergeGeometries(frameParts, false), frameMaterial);
  frameMesh.castShadow = true;
  frameMesh.receiveShadow = true;
  wall.add(frameMesh);

  const byColor: THREE.BufferGeometry[][] = BOOK_COLORS.map(() => []);
  for (let row = 0; row < rows; row++) {
    let x = -width / 2 + 0.5;
    while (x < width / 2 - 0.5) {
      const book = new THREE.BoxGeometry(0.5, 0.8, 0.16);
      const scaleY = 0.8 + rng() * 0.35;
      book.scale(1, scaleY, 1);
      book.rotateZ((rng() - 0.5) * 0.07);
      book.translate(x, 0.72 + row * rowHeight + (0.8 * scaleY) / 2, 0.5);
      byColor[Math.floor(rng() * BOOK_COLORS.length)].push(book);
      x += 0.58 + rng() * 0.12;
    }
  }
  byColor.forEach((geometries, i) => {
    if (!geometries.length) return;
    const material = new THREE.MeshStandardMaterial({ color: BOOK_COLORS[i], roughness: 0.85 });
    wall.add(new THREE.Mesh(mergeGeometries(geometries, false), material));
  });

  return wall;
}

/** The Research chapter's landmark, grown into a true Great Library: a stone plinth carrying
 * a monumental central shelf wall flanked by two angled wings, framed by columns and a lintel,
 * with the old gag intact: one oversized book still tumbles free as the camera passes. */
export class Library {
  readonly group = new THREE.Group();
  private readonly fallingBook: THREE.Mesh;
  private readonly startPos: THREE.Vector3;
  private readonly endPos: THREE.Vector3;
  private readonly rangeStart: number;
  private readonly rangeEnd: number;

  constructor(range: [number, number]) {
    this.rangeStart = range[0];
    this.rangeEnd = range[1];

    const rng = makeRng(1204);
    const stoneMaterial = new THREE.MeshStandardMaterial({ color: STONE_COLOR, roughness: 1, flatShading: true });

    const plinth = new THREE.Mesh(new THREE.BoxGeometry(26, 1.0, 9), stoneMaterial);
    plinth.position.y = 0.3;
    plinth.receiveShadow = true;
    this.group.add(plinth);

    const deck = 0.8;

    const centerWall = buildShelfWall(9.5, 13, 7, rng);
    centerWall.position.set(0, deck, -1.2);
    this.group.add(centerWall);

    for (const side of [-1, 1]) {
      const wing = buildShelfWall(7, 10, 6, rng);
      wing.position.set(side * 8.6, deck, 0.4);
      wing.rotation.y = side * -0.38;
      this.group.add(wing);
    }

    for (const side of [-1, 1]) {
      const column = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.7, 14, 7), stoneMaterial);
      column.position.set(side * 5.6, deck + 7, 2.4);
      column.castShadow = true;
      this.group.add(column);
    }
    const lintel = new THREE.Mesh(new THREE.BoxGeometry(13.4, 1.3, 1.8), stoneMaterial);
    lintel.position.set(0, deck + 14.4, 2.4);
    lintel.castShadow = true;
    this.group.add(lintel);

    const fallingMaterial = new THREE.MeshStandardMaterial({ color: '#8f6a3a', roughness: 0.8 });
    this.fallingBook = new THREE.Mesh(new THREE.BoxGeometry(0.85, 1.1, 0.2), fallingMaterial);
    this.fallingBook.castShadow = true;
    this.startPos = new THREE.Vector3(2.8, 10.6, 0.4);
    this.endPos = new THREE.Vector3(5.2, 1.6, 5.2);
    this.fallingBook.position.copy(this.startPos);
    this.group.add(this.fallingBook);
  }

  placeAt(x: number, z: number, heightAt: (x: number, z: number) => number, facingY: number): void {
    this.group.position.set(x, heightAt(x, z), z);
    this.group.rotation.y = facingY;
  }

  update(progress: number): void {
    const t = clamp((progress - this.rangeStart) / (this.rangeEnd - this.rangeStart), 0, 1);
    this.fallingBook.position.lerpVectors(this.startPos, this.endPos, t);
    this.fallingBook.rotation.x = t * Math.PI * 2.5;
    this.fallingBook.rotation.z = t * Math.PI * 1.3;
    this.fallingBook.position.y = lerp(this.startPos.y, this.endPos.y, t) + Math.sin(t * Math.PI) * 0.4;
  }
}

import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { clamp, lerp } from '../lib/math';

const SHELF_COLOR = new THREE.Color('#241a12');
const BOOK_COLORS = ['#5c2e1f', '#2e3a1f', '#1f2a3a', '#4a2e4a', '#3a2a1a'];

/** A tall bookshelf silhouette, built from a frame + a scatter of book-shaped boxes. */
function buildShelfGeometry(): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [];

  const frame = new THREE.BoxGeometry(3.2, 4.2, 0.6);
  frame.translate(0, 2.1, 0);
  parts.push(frame);

  for (let row = 0; row < 4; row++) {
    const shelf = new THREE.BoxGeometry(3.0, 0.06, 0.55);
    shelf.translate(0, 0.7 + row * 1.0, 0);
    parts.push(shelf);
  }

  return mergeGeometries(parts, false);
}

function buildBookGeometry(): THREE.BufferGeometry {
  return new THREE.BoxGeometry(0.22, 0.32, 0.05);
}

/** The chronicler's "stumble upon a great library" moment: a bookshelf, a scatter of
 * shelved books, and one book that tumbles free as the camera passes, landing near your feet. */
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

    const shelfMaterial = new THREE.MeshStandardMaterial({ color: SHELF_COLOR, roughness: 0.95 });
    const shelf = new THREE.Mesh(buildShelfGeometry(), shelfMaterial);
    shelf.castShadow = true;
    shelf.receiveShadow = true;
    this.group.add(shelf);

    const bookGeometry = buildBookGeometry();
    for (let row = 0; row < 4; row++) {
      const count = 8 + Math.floor(Math.random() * 3);
      let x = -1.35;
      for (let i = 0; i < count && x < 1.35; i++) {
        const material = new THREE.MeshStandardMaterial({
          color: BOOK_COLORS[Math.floor(Math.random() * BOOK_COLORS.length)],
          roughness: 0.85,
        });
        const book = new THREE.Mesh(bookGeometry, material);
        book.position.set(x, 0.88 + row * 1.0, 0.02);
        book.rotation.z = (Math.random() - 0.5) * 0.08;
        book.scale.y = 0.85 + Math.random() * 0.3;
        this.group.add(book);
        x += 0.24 + Math.random() * 0.06;
      }
    }

    const fallingMaterial = new THREE.MeshStandardMaterial({ color: '#8f6a3a', roughness: 0.8 });
    this.fallingBook = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.45, 0.08), fallingMaterial);
    this.fallingBook.castShadow = true;
    this.startPos = new THREE.Vector3(0.9, 3.1, 0.4);
    this.endPos = new THREE.Vector3(1.4, 0.22, 1.6);
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

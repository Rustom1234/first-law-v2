import * as THREE from 'three';
import type { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { createRenderer, watchResize } from './core/Renderer';
import { Loop } from './core/Loop';
import { createPostFX } from './core/PostFX';
import { forTier, type QualitySettings } from './core/settings';
import type { QualityTier } from './core/capabilities';
import { World } from './scene/World';
import { CameraRig } from './camera/CameraRig';
import { buildCameraPath, type CameraPath } from './camera/path';
import { ScrollController } from './camera/ScrollController';
import { OverlayManager } from './ui/OverlayManager';
import { Progress } from './ui/Progress';
import { VoiceLine } from './ui/VoiceLine';
import { resume } from './content/resume';
import { SECTIONS } from './content/sections';

const SCROLL_LENGTH_VIEWPORTS = 9.5;

export interface AppDom {
  canvas: HTMLCanvasElement;
  scrollSpacer: HTMLElement;
  overlayRoot: HTMLElement;
  voiceRoot: HTMLElement;
  runeRoot: HTMLElement;
}

export class App {
  readonly world: World;
  readonly cameraPath: CameraPath;
  private readonly cameraRig: CameraRig;
  private readonly renderer: THREE.WebGLRenderer;
  private readonly composer: EffectComposer | null;
  private readonly scrollController: ScrollController;
  private readonly overlayManager: OverlayManager;
  private readonly voiceLine: VoiceLine;
  private readonly progressUI: Progress;
  private readonly loop: Loop;
  private readonly stopResize: () => void;

  constructor(dom: AppDom, tier: QualityTier, reducedMotion: boolean) {
    const settings: QualitySettings = forTier(tier);

    this.world = new World(settings, SECTIONS);

    const heightAt = (x: number, z: number) => this.world.terrain.heightAt(x, z);
    this.cameraPath = buildCameraPath(heightAt);
    this.cameraRig = new CameraRig(this.cameraPath, heightAt, window.innerWidth / window.innerHeight);

    this.renderer = createRenderer(dom.canvas, settings);
    this.composer =
      settings.postProcessing && !reducedMotion
        ? createPostFX(this.renderer, this.world.scene, this.cameraRig.camera)
        : null;

    this.stopResize = watchResize(this.renderer, this.cameraRig.camera, (w, h) => this.composer?.setSize(w, h));

    dom.scrollSpacer.style.height = `${window.innerHeight * SCROLL_LENGTH_VIEWPORTS}px`;

    this.scrollController = new ScrollController(document.documentElement, reducedMotion);

    this.overlayManager = new OverlayManager(dom.overlayRoot);
    this.overlayManager.build(resume, SECTIONS);

    this.voiceLine = new VoiceLine(dom.voiceRoot, SECTIONS);

    this.progressUI = new Progress(dom.runeRoot, SECTIONS);

    this.loop = new Loop((dt, elapsed) => this.tick(dt, elapsed));
  }

  private tick(dt: number, elapsed: number): void {
    const progress = this.scrollController.update(dt);
    this.cameraRig.update(progress, dt);
    const blend = this.world.update(progress, elapsed, this.cameraRig.camera.position);
    document.documentElement.style.setProperty('--region-accent', `#${blend.uiAccent.getHexString()}`);
    this.overlayManager.update(progress);
    this.voiceLine.update(progress);
    this.progressUI.update(progress);

    if (this.composer) {
      this.composer.render();
    } else {
      this.renderer.render(this.world.scene, this.cameraRig.camera);
    }
  }

  start(): void {
    this.loop.start();
  }

  dispose(): void {
    this.loop.dispose();
    this.stopResize();
  }
}

import './styles/main.css';
import './styles/overlay.css';
import { detectTier, prefersReducedMotion } from './core/capabilities';
import { App, type AppDom } from './App';
import { renderFallback } from './ui/Fallback';
import { resume } from './content/resume';

function requireEl<T extends HTMLElement>(id: string): T {
  const found = document.getElementById(id);
  if (!found) throw new Error(`missing #${id} in index.html`);
  return found as T;
}

function boot(): void {
  const tier = detectTier();
  const reducedMotion = prefersReducedMotion();

  if (tier === 'static') {
    const root = requireEl<HTMLDivElement>('app-root');
    document.getElementById('scene-canvas')?.remove();
    document.getElementById('scroll-spacer')?.remove();
    renderFallback(root, resume);
    return;
  }

  const dom: AppDom = {
    canvas: requireEl<HTMLCanvasElement>('scene-canvas'),
    scrollSpacer: requireEl<HTMLDivElement>('scroll-spacer'),
    overlayRoot: requireEl<HTMLDivElement>('overlay-root'),
    tocRoot: requireEl<HTMLDivElement>('toc-root'),
    runeRoot: requireEl<HTMLDivElement>('rune-root'),
    toastRoot: requireEl<HTMLDivElement>('toast-root'),
    audioRoot: requireEl<HTMLDivElement>('audio-root'),
    resumeScrollRoot: requireEl<HTMLDivElement>('resume-scroll-root'),
  };

  const app = new App(dom, tier, reducedMotion);
  app.start();

  if (import.meta.env.DEV) {
    import('./dev/debug').then(({ setupDebug }) => setupDebug(app.world, app.cameraPath));
  }
}

boot();

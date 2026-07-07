import { assetUrl } from '../lib/assetUrl';

/** Muted-by-default ambient loop toggle. Points at a placeholder asset path: drop a
 * wind/campfire loop at public/ambient.mp3 and this starts working with no code changes.
 * If the file doesn't exist yet, play() rejects quietly and the toggle just stays inert. */
export class AmbientAudio {
  private readonly button: HTMLButtonElement;
  private readonly audio: HTMLAudioElement;
  private playing = false;

  constructor(container: HTMLElement, src = assetUrl('ambient.mp3')) {
    container.classList.add('ambient-audio');

    this.audio = new Audio(src);
    this.audio.loop = true;
    this.audio.volume = 0.35;

    this.button = document.createElement('button');
    this.button.className = 'ambient-audio__button';
    this.button.type = 'button';
    this.button.setAttribute('aria-label', 'Toggle ambient sound');
    this.button.setAttribute('aria-pressed', 'false');
    this.button.textContent = '♪';
    this.button.addEventListener('click', () => this.toggle());
    container.appendChild(this.button);
  }

  private toggle(): void {
    this.playing = !this.playing;
    this.button.classList.toggle('ambient-audio__button--active', this.playing);
    this.button.setAttribute('aria-pressed', String(this.playing));

    if (this.playing) {
      this.audio.play().catch(() => {
        // Asset missing or autoplay blocked: leave the toggle visually off, no hard error.
        this.playing = false;
        this.button.classList.remove('ambient-audio__button--active');
        this.button.setAttribute('aria-pressed', 'false');
      });
    } else {
      this.audio.pause();
    }
  }
}

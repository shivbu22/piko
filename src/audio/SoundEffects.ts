// Nook — Synthesized Spatial Audio Effects & Authentic Mascot Sound Engine
// Integrates authentic WAV sound effects from dist/sounds with WebAudio synthesis fallback

class SoundEffectsEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private audioCache: Map<string, HTMLAudioElement> = new Map();
  private boopCounter: number = 0;

  constructor() {
    this.preloadSounds();
  }

  private preloadSounds() {
    if (typeof window === 'undefined') return;
    const soundFiles = [
      'blush.wav',
      'boop_1.wav',
      'boop_2.wav',
      'boop_3.wav',
      'boop_4.wav',
      'boop_5.wav',
      'dizzy.wav',
      'sleepy.wav',
      'sparkle.wav',
      'teleport.wav',
    ];

    const base = (typeof import.meta !== 'undefined' && import.meta.env?.BASE_URL) || './';
    const prefix = base.endsWith('/') ? base : `${base}/`;

    soundFiles.forEach((file) => {
      try {
        const audio = new Audio(`${prefix}sounds/${file}`);
        audio.preload = 'auto';
        this.audioCache.set(file, audio);
      } catch {
        // Preload fallback
      }
    });
  }

  private playSoundFile(filename: string, fallbackFn: () => void) {
    if (this.isMuted) return;
    try {
      // Clone audio element for rapid overlapping playback
      const cached = this.audioCache.get(filename);
      if (cached) {
        const audio = cached.cloneNode() as HTMLAudioElement;
        audio.volume = 0.65;
        audio.play().catch(() => fallbackFn());
      } else {
        const base = (typeof import.meta !== 'undefined' && import.meta.env?.BASE_URL) || './';
        const prefix = base.endsWith('/') ? base : `${base}/`;
        const audio = new Audio(`${prefix}sounds/${filename}`);
        audio.volume = 0.65;
        audio.play().catch(() => fallbackFn());
      }
    } catch {
      fallbackFn();
    }
  }

  private getContext(): AudioContext | null {
    if (this.isMuted) return null;
    try {
      if (!this.ctx) {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        this.ctx = new AudioCtx();
      }
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      return this.ctx;
    } catch {
      return null;
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  // Authentic Mascot Boop (Cycles boop_1.wav .. boop_5.wav)
  public playBoop(count?: number) {
    if (count !== undefined) {
      this.boopCounter = count;
    } else {
      this.boopCounter = (this.boopCounter + 1) % 5;
    }
    const boopIdx = (this.boopCounter % 5) + 1;
    this.playSoundFile(`boop_${boopIdx}.wav`, () => this.playChime());
  }

  // Mascot Blush Sound
  public playBlush() {
    this.playSoundFile('blush.wav', () => this.playPop());
  }

  // Mascot Sparkle Sound
  public playSparkle() {
    this.playSoundFile('sparkle.wav', () => this.playChime());
  }

  // Mascot Dizzy / Confused Sound
  public playDizzy() {
    this.playSoundFile('dizzy.wav', () => this.playPop());
  }

  // Mascot Sleepy / Focus Mode Sound
  public playSleepy() {
    this.playSoundFile('sleepy.wav', () => this.playRecordStop());
  }

  // State Morph / Teleport Sound
  public playTeleport() {
    this.playSoundFile('teleport.wav', () => this.playWakeWord());
  }

  // Soft tactile pop when notch expands or morphs
  public playPop() {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(140, ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch {
      // Audio fallback
    }
  }

  // Celebratory chime when checking off action items or booping Pip
  public playChime() {
    this.playSoundFile('sparkle.wav', () => {
      const ctx = this.getContext();
      if (!ctx) return;

      try {
        const now = ctx.currentTime;
        [587.33, 880].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + i * 0.07);

          gain.gain.setValueAtTime(0.08, now + i * 0.07);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.07 + 0.18);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now + i * 0.07);
          osc.stop(now + i * 0.07 + 0.18);
        });
      } catch {
        // Audio fallback
      }
    });
  }

  // Warm chime when recording starts
  public playRecordStart() {
    this.playSoundFile('teleport.wav', () => {
      const ctx = this.getContext();
      if (!ctx) return;

      try {
        const now = ctx.currentTime;
        [440, 659.25].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + i * 0.09);

          gain.gain.setValueAtTime(0.1, now + i * 0.09);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.09 + 0.16);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now + i * 0.09);
          osc.stop(now + i * 0.09 + 0.16);
        });
      } catch {
        // Audio fallback
      }
    });
  }

  // Soft low chime when recording stops
  public playRecordStop() {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      [659.25, 440].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.08);

        gain.gain.setValueAtTime(0.09, now + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.15);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + i * 0.08);
        osc.stop(now + i * 0.08 + 0.15);
      });
    } catch {
      // Audio fallback
    }
  }

  // Friendly sparkle when "Hey Pip" wake word triggers
  public playWakeWord() {
    this.playSoundFile('sparkle.wav', () => {
      const ctx = this.getContext();
      if (!ctx) return;

      try {
        const now = ctx.currentTime;
        [523.25, 659.25, 1046.5].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + i * 0.06);

          gain.gain.setValueAtTime(0.08, now + i * 0.06);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.22);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now + i * 0.06);
          osc.stop(now + i * 0.06 + 0.22);
        });
      } catch {
        // Audio fallback
      }
    });
  }
}

export const sounds = new SoundEffectsEngine();

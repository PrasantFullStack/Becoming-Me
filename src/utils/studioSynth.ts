// Web Audio API real-time studio backing arrangement synthesizer for "I'm Becoming Me"
// Plays warm D-Major piano chords (D - A - Bm7 - G), bass pulse, and vocal melody guide

class StudioAnthemEngine {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private stepIndex = 0;
  private timerId: number | null = null;
  private volume = 0.75;
  private bpm = 118;

  private ensureContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
  }

  public setBpm(bpm: number) {
    this.bpm = Math.max(80, Math.min(160, bpm));
    if (this.isPlaying) {
      this.stopScheduler();
      this.startScheduler();
    }
  }

  public start() {
    this.ensureContext();
    if (this.isPlaying) return;
    this.isPlaying = true;
    this.startScheduler();
  }

  public stop() {
    this.isPlaying = false;
    this.stopScheduler();
  }

  private stopScheduler() {
    if (this.timerId !== null && typeof window !== 'undefined') {
      window.clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  private startScheduler() {
    this.triggerBeat(this.stepIndex);
    const intervalMs = (60 / this.bpm) * 1000;
    if (typeof window !== 'undefined') {
      this.timerId = window.setInterval(() => {
        if (!this.isPlaying) return;
        this.stepIndex = (this.stepIndex + 1) % 16;
        this.triggerBeat(this.stepIndex);
      }, intervalMs);
    }
  }

  private triggerBeat(step: number) {
    if (!this.ctx || this.volume <= 0.01) return;
    const now = this.ctx.currentTime;

    // 4-bar chord progression in D Major: D -> A -> Bm7 -> G
    const chords = [
      [146.83, 293.66, 369.99, 440.0], // D
      [110.0, 277.18, 329.63, 440.0], // A
      [123.47, 246.94, 293.66, 369.99], // Bm7
      [98.0, 246.94, 293.66, 392.0], // G
    ];
    const melody = [
      587.33, 659.25, 739.99, 587.33,
      659.25, 739.99, 880.0, 739.99,
      739.99, 659.25, 587.33, 493.88,
      587.33, 659.25, 587.33, 587.33,
    ];

    const chordIdx = Math.floor(step / 4) % chords.length;
    const chord = chords[chordIdx];

    // Play chord warm pad on downbeats (step % 2 === 0)
    if (step % 2 === 0) {
      chord.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = idx === 0 ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(freq, now);

        const peakGain = (idx === 0 ? 0.08 : 0.045) * this.volume;
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(Math.max(0.001, peakGain), now + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.85);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.88);
      });
    }

    // Play uplifting lead melody guide
    const leadFreq = melody[step % melody.length];
    const leadOsc = this.ctx.createOscillator();
    const leadGain = this.ctx.createGain();
    leadOsc.type = 'sine';
    leadOsc.frequency.setValueAtTime(leadFreq, now);

    const leadPeak = 0.055 * this.volume;
    leadGain.gain.setValueAtTime(0.0001, now);
    leadGain.gain.exponentialRampToValueAtTime(Math.max(0.001, leadPeak), now + 0.02);
    leadGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.42);

    leadOsc.connect(leadGain);
    leadGain.connect(this.ctx.destination);
    leadOsc.start(now);
    leadOsc.stop(now + 0.45);
  }
}

export const studioAnthemEngine = new StudioAnthemEngine();

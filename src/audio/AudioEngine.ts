import { TranscriptSegment } from '../types';
import { classifySegment } from '../ai/SegmentClassifier';

export class AudioEngine {
  private audioCtx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private stream: MediaStream | null = null;
  private isRecording: boolean = false;
  private isPaused: boolean = false;
  private startTime: number = 0;
  private pausedDuration: number = 0;
  private pauseStartTime: number = 0;

  // Real-time live speech recognition & interim callbacks
  private onTranscriptCallback: ((segment: TranscriptSegment) => void) | null = null;
  private onInterimCallback: ((interimText: string) => void) | null = null;
  private onVolumeChangeCallback: ((volume: number) => void) | null = null;
  private recognition: any = null;
  private recognitionRestartTimeout: number | null = null;
  private activeInterimText: string = '';

  // Real Audio Recording (MediaRecorder)
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  private recordedAudioUrl: string | null = null;

  // Real Frequency buffer
  private dataArray: Uint8Array | null = null;

  constructor() {}

  public async startRecording(
    onTranscript: (segment: TranscriptSegment) => void,
    onVolume?: (volume: number) => void,
    onInterim?: (interimText: string) => void
  ): Promise<boolean> {
    // 0. Ensure any pre-existing resources are cleanly stopped first
    this.cleanUpResources();

    this.onTranscriptCallback = onTranscript;
    this.onVolumeChangeCallback = onVolume || null;
    this.onInterimCallback = onInterim || null;
    this.isRecording = true;
    this.isPaused = false;
    this.startTime = Date.now();
    this.pausedDuration = 0;
    this.activeInterimText = '';
    this.recordedChunks = [];
    if (this.recordedAudioUrl) {
      URL.revokeObjectURL(this.recordedAudioUrl);
      this.recordedAudioUrl = null;
    }

    try {
      // 1. Capture real user microphone with noise suppression
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      this.stream = stream;

      // 2. Set up Web Audio API Analyser for live volume & spectrum
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioCtx = new AudioContextClass();
      const source = this.audioCtx.createMediaStreamSource(stream);

      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = 64;
      this.analyser.smoothingTimeConstant = 0.8;
      source.connect(this.analyser);
      this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);

      // 3. Set up real MediaRecorder to capture actual audio
      if (typeof MediaRecorder !== 'undefined') {
        const mimeType = MediaRecorder.isTypeSupported('audio/webm')
          ? 'audio/webm'
          : MediaRecorder.isTypeSupported('audio/mp4')
          ? 'audio/mp4'
          : '';

        try {
          this.mediaRecorder = mimeType
            ? new MediaRecorder(stream, { mimeType })
            : new MediaRecorder(stream);

          this.mediaRecorder.ondataavailable = (event) => {
            if (event.data && event.data.size > 0) {
              this.recordedChunks.push(event.data);
            }
          };

          this.mediaRecorder.start(1000); // chunk every 1s
        } catch (e) {
          console.warn('MediaRecorder could not start with options:', e);
        }
      }
    } catch (err) {
      console.warn('Microphone permission denied or no audio input found:', err);
      this.analyser = null;
    }

    // 4. Start real continuous live SpeechRecognition (Web Speech API)
    this.startLiveSpeechRecognition();
    return true;
  }

  private cleanUpResources() {
    if (this.recognitionRestartTimeout) {
      window.clearTimeout(this.recognitionRestartTimeout);
      this.recognitionRestartTimeout = null;
    }

    if (this.recognition) {
      try {
        this.recognition.abort();
      } catch {}
      this.recognition = null;
    }

    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      try {
        this.mediaRecorder.stop();
      } catch {}
      this.mediaRecorder = null;
    }

    if (this.stream) {
      this.stream.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {}
      });
      this.stream = null;
    }

    if (this.audioCtx) {
      try {
        this.audioCtx.close().catch(() => {});
      } catch {}
      this.audioCtx = null;
    }
  }

  private startLiveSpeechRecognition() {
    try {
      const win = window as any;
      const SpeechRecognitionClass = win.SpeechRecognition || win.webkitSpeechRecognition;
      if (!SpeechRecognitionClass) {
        console.warn('Web Speech API is not natively supported in this browser.');
        return;
      }

      if (this.recognition) {
        try {
          this.recognition.abort();
        } catch {}
      }

      this.recognition = new SpeechRecognitionClass();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.maxAlternatives = 1;
      this.recognition.lang = navigator.language || 'en-US';

      this.recognition.onresult = (event: any) => {
        if (!this.isRecording || this.isPaused) return;

        let interim = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const result = event.results[i];
          const transcript = result[0]?.transcript?.trim();
          if (!transcript) continue;

          if (result.isFinal) {
            const elapsed = this.getDurationMs();
            const classification = classifySegment(transcript);
            const segment: TranscriptSegment = {
              id: `seg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
              meetingId: 'current',
              speaker: 'host',
              speakerName: 'You (Host)',
              startMs: Math.max(0, elapsed - 3000),
              endMs: elapsed,
              text: transcript,
              highlightType: classification.highlightType,
              highlightCategory: classification.highlightCategory,
            };

            this.activeInterimText = '';
            if (this.onInterimCallback) {
              this.onInterimCallback('');
            }

            if (this.onTranscriptCallback) {
              this.onTranscriptCallback(segment);
            }
          } else {
            interim += (interim ? ' ' : '') + transcript;
          }
        }

        if (interim) {
          this.activeInterimText = interim;
          if (this.onInterimCallback) {
            this.onInterimCallback(interim);
          }
        }
      };

      this.recognition.onerror = (err: any) => {
        // Ignore harmless abort/no-speech codes
        if (err.error === 'no-speech' || err.error === 'aborted') return;
        console.warn('SpeechRecognition status:', err.error);
      };

      this.recognition.onend = () => {
        // Automatically restart speech recognition while user is actively recording
        if (this.isRecording && !this.isPaused) {
          if (this.recognitionRestartTimeout) {
            window.clearTimeout(this.recognitionRestartTimeout);
          }
          this.recognitionRestartTimeout = window.setTimeout(() => {
            if (this.isRecording && !this.isPaused) {
              try {
                this.recognition?.start();
              } catch {}
            }
          }, 250);
        }
      };

      this.recognition.start();
    } catch (err) {
      console.warn('SpeechRecognition initialization error:', err);
    }
  }

  // Allows real live dictation or typed notes to immediately append to the meeting timeline
  public injectRealSegment(text: string, speakerName: string = 'You (Host)') {
    const trimmed = text.trim();
    if (!trimmed) return;

    const elapsed = this.getDurationMs();
    const classification = classifySegment(trimmed);
    const segment: TranscriptSegment = {
      id: `seg-live-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      meetingId: 'current',
      speaker: 'host',
      speakerName,
      startMs: Math.max(0, elapsed - 2000),
      endMs: elapsed,
      text: trimmed,
      highlightType: classification.highlightType,
      highlightCategory: classification.highlightCategory,
    };

    if (this.onTranscriptCallback) {
      this.onTranscriptCallback(segment);
    }
  }

  public pauseRecording() {
    this.isPaused = true;
    this.pauseStartTime = Date.now();
    try {
      this.recognition?.stop();
    } catch {}

    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      try {
        this.mediaRecorder.pause();
      } catch {}
    }
  }

  public resumeRecording() {
    if (this.isPaused) {
      this.pausedDuration += Date.now() - this.pauseStartTime;
      this.isPaused = false;
      try {
        if (this.recognition) {
          try {
            this.recognition.start();
          } catch (e: any) {
            // If already starting or ended, re-init cleanly
            if (e?.name === 'InvalidStateError') {
              this.startLiveSpeechRecognition();
            }
          }
        } else {
          this.startLiveSpeechRecognition();
        }
      } catch {}

      if (this.mediaRecorder && this.mediaRecorder.state === 'paused') {
        try {
          this.mediaRecorder.resume();
        } catch {}
      }
    }
  }

  public stopRecording(): { audioUrl: string | null; audioBlob: Blob | null } {
    this.isRecording = false;
    this.isPaused = false;
    this.activeInterimText = '';

    if (this.recognitionRestartTimeout) {
      window.clearTimeout(this.recognitionRestartTimeout);
      this.recognitionRestartTimeout = null;
    }

    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch {}
      this.recognition = null;
    }

    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      try {
        this.mediaRecorder.stop();
      } catch {}
    }

    if (this.stream) {
      this.stream.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {}
      });
      this.stream = null;
    }

    if (this.audioCtx) {
      try {
        this.audioCtx.close().catch(() => {});
      } catch {}
      this.audioCtx = null;
    }

    let audioBlob: Blob | null = null;
    if (this.recordedChunks.length > 0) {
      const type = this.recordedChunks[0].type || 'audio/webm';
      audioBlob = new Blob(this.recordedChunks, { type });
      this.recordedAudioUrl = URL.createObjectURL(audioBlob);
    }

    return {
      audioUrl: this.recordedAudioUrl,
      audioBlob,
    };
  }

  public getRecordedAudioUrl(): string | null {
    return this.recordedAudioUrl;
  }

  public getActiveInterimText(): string {
    return this.activeInterimText;
  }

  public getDurationSeconds(): number {
    if (!this.startTime) return 0;
    const now = this.isPaused ? this.pauseStartTime : Date.now();
    return Math.floor(Math.max(0, now - this.startTime - this.pausedDuration) / 1000);
  }

  public getDurationMs(): number {
    if (!this.startTime) return 0;
    const now = this.isPaused ? this.pauseStartTime : Date.now();
    return Math.max(0, now - this.startTime - this.pausedDuration);
  }

  // Returns array of 16 normalized energy heights [0.0 ... 1.0] for the notch waveform
  public getWaveformData(): number[] {
    const barsCount = 16;
    const values: number[] = new Array(barsCount).fill(0.1);

    if (!this.isRecording || this.isPaused) {
      return values.map(() => 0.08);
    }

    if (this.analyser && this.dataArray) {
      this.analyser.getByteFrequencyData(this.dataArray as unknown as Uint8Array<ArrayBuffer>);
      let sum = 0;
      for (let i = 0; i < barsCount; i++) {
        const binIndex = Math.min(i, this.dataArray.length - 1);
        const normalized = this.dataArray[binIndex] / 255;
        values[i] = Math.max(0.12, normalized);
        sum += normalized;
      }
      const avg = sum / barsCount;
      if (this.onVolumeChangeCallback) this.onVolumeChangeCallback(avg);
      return values;
    }

    // Default resting baseline when microphone is silent
    return values.map(() => 0.12);
  }
}

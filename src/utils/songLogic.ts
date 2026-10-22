import {
  SONG_METADATA,
  SONG_SECTIONS,
  SongSection,
  LyricLine,
  SmallStepEntry,
} from '../data/songData';

export interface ActiveSongPosition {
  section: SongSection;
  line: LyricLine;
  sectionIndex: number;
  lineIndex: number;
  sectionProgress: number; // 0 to 100
  overallProgress: number; // 0 to 100
}

export function formatTimestamp(seconds: number): string {
  const clamped = Math.max(0, Math.floor(seconds));
  const mins = Math.floor(clamped / 60);
  const secs = clamped % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function getActiveSongPosition(
  currentTime: number,
  sections: SongSection[] = SONG_SECTIONS,
  totalDuration: number = SONG_METADATA.totalDuration
): ActiveSongPosition {
  const clampedTime = Math.max(0, Math.min(currentTime, totalDuration - 0.01));

  let matchedSectionIndex = sections.findIndex(
    (s) => clampedTime >= s.startTime && clampedTime < s.endTime
  );
  if (matchedSectionIndex === -1) {
    matchedSectionIndex = sections.length - 1;
  }

  const section = sections[matchedSectionIndex];
  let matchedLineIndex = section.lines.findIndex(
    (l) => clampedTime >= l.startTime && clampedTime < l.endTime
  );
  if (matchedLineIndex === -1) {
    matchedLineIndex = section.lines.length - 1;
  }

  const line = section.lines[matchedLineIndex];
  const sectionSpan = Math.max(1, section.endTime - section.startTime);
  const sectionProgress = Math.min(
    100,
    Math.max(0, ((clampedTime - section.startTime) / sectionSpan) * 100)
  );
  const overallProgress = Math.min(
    100,
    Math.max(0, (clampedTime / Math.max(1, totalDuration)) * 100)
  );

  return {
    section,
    line,
    sectionIndex: matchedSectionIndex,
    lineIndex: matchedLineIndex,
    sectionProgress,
    overallProgress,
  };
}

export interface BuildLyriaPromptOptions {
  model: 'lyria-3-clip-preview' | 'lyria-3-pro-preview';
  sectionId: string; // 'full-song' or section.id
  arrangementDescription: string;
  customDirection?: string;
  useArtistImage: boolean;
}

export function buildLyriaPrompt(
  options: BuildLyriaPromptOptions,
  sections: SongSection[] = SONG_SECTIONS
): string {
  const isFullTrack =
    options.model === 'lyria-3-pro-preview' || options.sectionId === 'full-song';
  const targetSection = sections.find((s) => s.id === options.sectionId) || sections[2]; // default Chorus

  const durationPhrase =
    options.model === 'lyria-3-clip-preview'
      ? 'Generate a 30-second inspirational pop music clip'
      : 'Generate a full-length inspirational pop anthem track';

  const portraitPhrase = options.useArtistImage
    ? ' inspired by this artist portrait and the themes of quiet resilience, self-belief, and steady growth'
    : '';

  const lyricsSnippet = isFullTrack
    ? sections
        .map((s) => `[${s.title} - ${s.subtitle}]\n` + s.lines.map((l) => l.text).join('\n'))
        .join('\n\n')
    : `[${targetSection.title} — ${targetSection.subtitle}]\n` +
      targetSection.lines.map((l) => l.text).join('\n');

  const extra = options.customDirection?.trim()
    ? ` Additional production notes: ${options.customDirection.trim()}`
    : '';

  return (
    `${durationPhrase}${portraitPhrase} titled "${SONG_METADATA.title}". ` +
    `Genre: ${SONG_METADATA.genre}. Mood: ${SONG_METADATA.mood}. Key: ${SONG_METADATA.keySignature}, Tempo: ${SONG_METADATA.bpm} BPM. ` +
    `Arrangement: ${options.arrangementDescription}${extra}\n\nLyrics:\n${lyricsSnippet}`
  );
}

export function validateStepEntry(input: {
  stepText: string;
  linkedLine: string;
}): { valid: boolean; error?: string } {
  const trimmed = input.stepText.trim();
  if (!trimmed) {
    return {
      valid: false,
      error: 'Please describe the small step or vocal practice you completed today.',
    };
  }
  if (trimmed.length < 6) {
    return {
      valid: false,
      error: 'Please write at least 6 characters so your milestone is meaningful.',
    };
  }
  if (!input.linkedLine.trim()) {
    return {
      valid: false,
      error: 'Please select a guiding lyric line from the song.',
    };
  }
  return { valid: true };
}

export function calculatePracticeStats(entries: SmallStepEntry[]) {
  const totalSteps = entries.length;
  const mantraUses = entries.filter((e) =>
    e.linkedLine.toLowerCase().includes("i may be slow, but i won't stop")
  ).length;
  const uniqueDays = new Set(entries.map((e) => e.createdAt)).size;

  return {
    totalSteps,
    mantraUses,
    uniqueDays,
  };
}

/**
 * Generates a real playable WAV (24kHz mono 16-bit PCM) base64 string with an uplifting
 * D-Major chord progression (D - A - Bm - G) and lead melody notes so users can play
 * and download studio takes even when offline or without a paid Lyria API key.
 */
export function createProceduralAnthemWavBase64(
  durationSeconds = 12,
  style: 'anthemic-pop' | 'intimate-acoustic' | 'cinematic-orchestral' = 'anthemic-pop'
): string {
  const sampleRate = 24000;
  const numSamples = Math.max(1, Math.floor(sampleRate * durationSeconds));
  const buffer = new ArrayBuffer(44 + numSamples * 2);
  const view = new DataView(buffer);

  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + numSamples * 2, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true); // PCM chunk size
  view.setUint16(20, 1, true); // PCM format
  view.setUint16(22, 1, true); // Mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, numSamples * 2, true);

  // D Major progression: D (D4 F#4 A4), A (C#4 E4 A4), Bm (B3 D4 F#4), G (B3 D4 G4)
  const chords = [
    [146.83, 293.66, 369.99, 440.0], // D
    [110.0, 277.18, 329.63, 440.0], // A
    [123.47, 246.94, 293.66, 369.99], // Bm
    [98.0, 246.94, 293.66, 392.0], // G
  ];

  // Uplifting vocal-style melody notes in D major scale
  const melodyNotes = [
    587.33, // D5
    659.25, // E5
    739.99, // F#5
    587.33, // D5
    659.25, // E5
    739.99, // F#5
    880.0, // A5
    739.99, // F#5
  ];

  const beatDuration = 60 / 118; // ~0.508s per beat

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const beatIndex = Math.floor(t / beatDuration);
    const chordIndex = Math.floor(beatIndex / 4) % chords.length;
    const currentChord = chords[chordIndex];
    const noteInBeat = (t % beatDuration) / beatDuration;

    // Warm chord pad + piano decay
    const chordEnv = Math.exp(-noteInBeat * (style === 'intimate-acoustic' ? 3.2 : 1.6));
    let sample = 0;

    for (let c = 0; c < currentChord.length; c++) {
      const freq = currentChord[c];
      sample += Math.sin(2 * Math.PI * freq * t) * 0.14 * chordEnv;
      if (style === 'cinematic-orchestral') {
        sample += Math.sin(2 * Math.PI * (freq * 1.5) * t) * 0.04;
      }
    }

    // Lead melody line
    const melodyFreq = melodyNotes[beatIndex % melodyNotes.length];
    const melodyEnv = Math.sin(Math.min(1, noteInBeat) * Math.PI);
    sample +=
      (Math.sin(2 * Math.PI * melodyFreq * t) * 0.22 +
        Math.sin(2 * Math.PI * melodyFreq * 2 * t) * 0.06) *
      melodyEnv;

    // Gentle pulse kick on beats
    if (style === 'anthemic-pop' && noteInBeat < 0.18) {
      const kickFreq = 110 * Math.exp(-noteInBeat * 18) + 45;
      sample += Math.sin(2 * Math.PI * kickFreq * t) * 0.25 * (1 - noteInBeat / 0.18);
    }

    // Master fade in / fade out
    const fadeIn = Math.min(1, t / 0.25);
    const fadeOut = Math.min(1, (durationSeconds - t) / 0.6);
    const finalSample = Math.max(-0.95, Math.min(0.95, sample * fadeIn * fadeOut));

    view.setInt16(44 + i * 2, Math.floor(finalSample * 32767), true);
  }

  const bytes = new Uint8Array(buffer);
  let binary = '';
  const chunkSize = 8192;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const slice = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode(...slice);
  }
  if (typeof btoa === 'function') {
    return btoa(binary);
  }
  return Buffer.from(buffer).toString('base64');
}

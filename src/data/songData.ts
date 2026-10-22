export interface LyricLine {
  id: string;
  text: string;
  startTime: number; // in seconds
  endTime: number; // in seconds
  isMantra?: boolean;
}

export interface SongSection {
  id: string;
  order: string;
  title: string;
  subtitle: string;
  type: 'verse' | 'pre-chorus' | 'chorus' | 'bridge' | 'final-chorus';
  chords: string;
  vocalDynamic: string;
  energyLevel: number; // 1 to 10
  startTime: number;
  endTime: number;
  lines: LyricLine[];
}

export interface StudioTake {
  id: string;
  title: string;
  model: 'lyria-3-clip-preview' | 'lyria-3-pro-preview';
  sectionId: string;
  arrangementStyle: string;
  prompt: string;
  usedArtistPortrait: boolean;
  createdAt: string;
  durationLabel: string;
  audioUrl: string;
  sourceType: 'lyria-ai' | 'studio-synth';
  notes?: string;
}

export interface SmallStepEntry {
  id: string;
  stepText: string;
  linkedLine: string;
  feelingBefore: 'Nervous' | 'Lonely' | 'Discouraged' | 'Focused' | 'Hopeful';
  createdAt: string;
}

export const ARTIST_PORTRAIT_PATH =
  '/assets/aistudio/IMG_20260527_055206691_HDR_a7a84a98.jpg';

export const SONG_METADATA = {
  title: 'I’m Becoming Me',
  genre: 'Inspirational Pop',
  mood: 'Emotional, Hopeful, Powerful',
  keySignature: 'D Major',
  bpm: 118,
  totalDuration: 152, // 2m 32s studio arrangement
  mantraQuote: 'I may be slow, but I won’t stop. I’ll keep on climbing to the top.',
  brotherNote:
    'Sing it when you feel nervous, lonely, or discouraged. You don’t need to change your whole life in one day. Keep taking small steps, keep learning, and keep expressing the real you.',
};

export const SONG_SECTIONS: SongSection[] = [
  {
    id: 'verse-1',
    order: '01',
    title: 'Verse 1',
    subtitle: 'The Journey Begins',
    type: 'verse',
    chords: 'D  ·  A/C#  ·  Bm7  ·  G',
    vocalDynamic: 'Intimate, reflective chest voice over warm acoustic piano',
    energyLevel: 4,
    startTime: 0,
    endTime: 20,
    lines: [
      {
        id: 'v1-1',
        text: 'I walked alone beneath the sky, With so many dreams I kept inside.',
        startTime: 0,
        endTime: 5,
      },
      {
        id: 'v1-2',
        text: "A thousand questions in my mind, Searching for the strength I couldn't find.",
        startTime: 5,
        endTime: 10,
      },
      {
        id: 'v1-3',
        text: 'I made mistakes, I felt the pain, I saw the sunshine through the rain.',
        startTime: 10,
        endTime: 15,
      },
      {
        id: 'v1-4',
        text: 'And even when I lost my way, A little voice said, “Try again.”',
        startTime: 15,
        endTime: 20,
      },
    ],
  },
  {
    id: 'pre-chorus-1',
    order: '02',
    title: 'Pre-Chorus',
    subtitle: 'Rising Resolve',
    type: 'pre-chorus',
    chords: 'Em7  ·  D/F#  ·  G  ·  Asus4  A',
    vocalDynamic: 'Building momentum with steady pulse and rising strings',
    energyLevel: 6,
    startTime: 20,
    endTime: 32,
    lines: [
      {
        id: 'pc1-1',
        text: "I'm not afraid to start again, I'll turn my struggles into strength.",
        startTime: 20,
        endTime: 26,
      },
      {
        id: 'pc1-2',
        text: "One little step, one brand-new day, I'm finding courage along the way.",
        startTime: 26,
        endTime: 32,
      },
    ],
  },
  {
    id: 'chorus-1',
    order: '03',
    title: 'Chorus',
    subtitle: 'Sing with Power!',
    type: 'chorus',
    chords: 'D  ·  A  ·  Bm7  ·  G',
    vocalDynamic: 'Full anthemic belt, wide stereo drums, soaring synth brass',
    energyLevel: 9,
    startTime: 32,
    endTime: 56,
    lines: [
      {
        id: 'c1-1',
        text: "I'm becoming me, I'm breaking free, I'm learning who I'm meant to be.",
        startTime: 32,
        endTime: 37,
      },
      {
        id: 'c1-2',
        text: "No more hiding, no more fear, I'm standing strong, my path is clear.",
        startTime: 37,
        endTime: 42,
      },
      {
        id: 'c1-3',
        text: "I'll rise again, I'll touch the sky, I'll spread my wings and learn to fly.",
        startTime: 42,
        endTime: 47,
      },
      {
        id: 'c1-4',
        text: "Step by step, I'll make it through, I'm becoming strong, I'm becoming true!",
        startTime: 47,
        endTime: 52,
      },
      {
        id: 'c1-5',
        text: "Oh-oh-oh, I'm becoming me! Oh-oh-oh, I'm finally free!",
        startTime: 52,
        endTime: 56,
      },
    ],
  },
  {
    id: 'verse-2',
    order: '04',
    title: 'Verse 2',
    subtitle: 'The Power Within',
    type: 'verse',
    chords: 'D  ·  A/C#  ·  Bm7  ·  G',
    vocalDynamic: 'Warm, grounded groove with confident rhythmic articulation',
    energyLevel: 6,
    startTime: 56,
    endTime: 76,
    lines: [
      {
        id: 'v2-1',
        text: "I'll speak my truth, I'll raise my voice, I'll trust myself, I'll make my choice.",
        startTime: 56,
        endTime: 61,
      },
      {
        id: 'v2-2',
        text: 'With every word, my confidence grows, Like a little seed that becomes a rose.',
        startTime: 61,
        endTime: 66,
      },
      {
        id: 'v2-3',
        text: "I'll listen more, I'll learn each day, I'll meet the world in my own way.",
        startTime: 66,
        endTime: 71,
      },
      {
        id: 'v2-4',
        text: "I don't need to be someone new, I'll let the world see the real me, too.",
        startTime: 71,
        endTime: 76,
      },
    ],
  },
  {
    id: 'pre-chorus-2',
    order: '05',
    title: 'Pre-Chorus II',
    subtitle: 'Fearless Mind',
    type: 'pre-chorus',
    chords: 'Em7  ·  D/F#  ·  G  ·  Asus4  A',
    vocalDynamic: 'Open resonance, lifting into the upper register',
    energyLevel: 7,
    startTime: 76,
    endTime: 88,
    lines: [
      {
        id: 'pc2-1',
        text: "I don't need applause to shine, I'll build my future one day at a time.",
        startTime: 76,
        endTime: 82,
      },
      {
        id: 'pc2-2',
        text: "With an open heart and a fearless mind, I'll leave my old doubts behind.",
        startTime: 82,
        endTime: 88,
      },
    ],
  },
  {
    id: 'chorus-2',
    order: '06',
    title: 'Chorus II',
    subtitle: 'Sing Louder!',
    type: 'chorus',
    chords: 'D  ·  A  ·  Bm7  ·  G',
    vocalDynamic: 'High-energy pop anthem with layered backing harmonies',
    energyLevel: 9,
    startTime: 88,
    endTime: 108,
    lines: [
      {
        id: 'c2-1',
        text: "I'm becoming me, I'm breaking free, I'm learning who I'm meant to be.",
        startTime: 88,
        endTime: 93,
      },
      {
        id: 'c2-2',
        text: "No more hiding, no more fear, I'm standing strong, my path is clear.",
        startTime: 93,
        endTime: 98,
      },
      {
        id: 'c2-3',
        text: "I'll rise again, I'll touch the sky, I'll spread my wings and learn to fly.",
        startTime: 98,
        endTime: 103,
      },
      {
        id: 'c2-4',
        text: "Step by step, I'll make it through, I'm becoming strong, I'm becoming true!",
        startTime: 103,
        endTime: 108,
      },
    ],
  },
  {
    id: 'bridge',
    order: '07',
    title: 'Bridge',
    subtitle: 'The Emotional Moment',
    type: 'bridge',
    chords: 'Bm7  ·  Gmaj7  ·  D  ·  A',
    vocalDynamic: 'Stripped-back piano & cello swell, raw emotional conviction',
    energyLevel: 8,
    startTime: 108,
    endTime: 128,
    lines: [
      {
        id: 'b-1',
        text: "And if tomorrow brings the rain, I'll find the courage to try again.",
        startTime: 108,
        endTime: 113,
      },
      {
        id: 'b-2',
        text: "I may be slow, but I won't stop, I'll keep on climbing to the top.",
        startTime: 113,
        endTime: 118,
        isMantra: true,
      },
      {
        id: 'b-3',
        text: "I choose discipline, I choose to grow, There's so much more I want to know.",
        startTime: 118,
        endTime: 123,
      },
      {
        id: 'b-4',
        text: "I choose kindness, I choose to care, I'll face my future standing there.",
        startTime: 123,
        endTime: 128,
      },
    ],
  },
  {
    id: 'final-chorus',
    order: '08',
    title: 'Final Chorus',
    subtitle: 'A New Beginning',
    type: 'final-chorus',
    chords: 'D  ·  A  ·  Bm7  ·  G  ·  D',
    vocalDynamic: 'Triumphant full-ensemble climax, soaring ad-libs & sunrise outro',
    energyLevel: 10,
    startTime: 128,
    endTime: 152,
    lines: [
      {
        id: 'fc-1',
        text: "I'm becoming me, just wait and see, The strongest version of myself I'll be.",
        startTime: 128,
        endTime: 133,
      },
      {
        id: 'fc-2',
        text: "With every challenge, I'll find my way, I'll build a better me every day.",
        startTime: 133,
        endTime: 138,
      },
      {
        id: 'fc-3',
        text: "No perfect life, no perfect plan, Just a brave heart doing all it can.",
        startTime: 138,
        endTime: 143,
      },
      {
        id: 'fc-4',
        text: "My story's mine, my dreams are true, The best of me is breaking through!",
        startTime: 143,
        endTime: 148,
      },
      {
        id: 'fc-5',
        text: "Oh-oh-oh, I'm becoming me! Oh-oh-oh, I'm finally free! One more step, one more dream, I'm becoming who I'm meant to be!",
        startTime: 148,
        endTime: 152,
      },
    ],
  },
];

export const ARRANGEMENT_PRESETS = [
  {
    id: 'anthemic-pop',
    label: 'Anthemic Arena Pop',
    description: 'Grand piano, driving stadium drums, warm cello, and soaring synth brass in D Major at 118 BPM.',
  },
  {
    id: 'intimate-acoustic',
    label: 'Intimate Sunrise Acoustic',
    description: 'Fingerpicked acoustic guitar, close-mic warm vocal phrasing, and subtle string pad.',
  },
  {
    id: 'cinematic-orchestral',
    label: 'Cinematic Orchestral Rise',
    description: 'Emotional strings, French horns, timpani swells, and choir harmonies building to the Bridge mantra.',
  },
];

export const INITIAL_SMALL_STEPS: SmallStepEntry[] = [
  {
    id: 'step-seed-1',
    stepText: 'Practiced singing the Bridge mantra out loud three times before starting my morning study session.',
    linkedLine: "I may be slow, but I won't stop, I'll keep on climbing to the top.",
    feelingBefore: 'Nervous',
    createdAt: '2026-10-21',
  },
  {
    id: 'step-seed-2',
    stepText: 'Spoke up with my own perspective during a conversation instead of holding back my thoughts.',
    linkedLine: "I'll speak my truth, I'll raise my voice, I'll trust myself, I'll make my choice.",
    feelingBefore: 'Hopeful',
    createdAt: '2026-10-22',
  },
];

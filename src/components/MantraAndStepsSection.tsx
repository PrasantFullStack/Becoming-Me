import React, { useState } from 'react';
import { RotateCcw, Plus, CheckCircle2, Heart } from 'lucide-react';
import {
  SONG_METADATA,
  SONG_SECTIONS,
  SmallStepEntry,
} from '../data/songData';
import { calculatePracticeStats, validateStepEntry } from '../utils/songLogic';

interface MantraAndStepsSectionProps {
  isMantraLoop: boolean;
  onTriggerMantraPractice: () => void;
  steps: SmallStepEntry[];
  onAddStep: (entry: SmallStepEntry) => void;
}

type EmotionalMoment = 'Nervous' | 'Lonely' | 'Discouraged';

const EMOTIONAL_GUIDES: Record<
  EmotionalMoment,
  {
    headline: string;
    vocalApproach: string;
    breathingCue: string;
    affirmation: string;
  }
> = {
  Nervous: {
    headline: 'When You Feel Nervous',
    vocalApproach:
      'Start softly in your natural speaking register. Place one hand on your chest, slow the tempo down, and let every consonant land with steady calm.',
    breathingCue: 'Inhale for 4 counts · Hold for 2 counts · Sing the mantra on a warm exhale',
    affirmation:
      'You do not need applause to shine. One steady breath turns nervous energy into focused courage.',
  },
  Lonely: {
    headline: 'When You Feel Lonely',
    vocalApproach:
      'Sing with warm resonance as if speaking to your closest brother. Let the melody remind you that your voice and your story belong in this world.',
    breathingCue: 'Deep diaphragm breath · Open throat · Let the words "I won’t stop" ring out',
    affirmation:
      'Even when you walk alone beneath the sky, your voice carries the strength you were searching for.',
  },
  Discouraged: {
    headline: 'When You Feel Discouraged',
    vocalApproach:
      'Stand tall and lean into the rhythm on "I’ll keep on climbing to the top." Sing it twice: first as a quiet promise, second with full conviction.',
    breathingCue: 'Shoulders back · Grounded stance · Belt the second half with full chest voice',
    affirmation:
      'You don’t need to change your whole life in one day. Small disciplined steps build an unstoppable climb.',
  },
};

export const MantraAndStepsSection: React.FC<MantraAndStepsSectionProps> = ({
  isMantraLoop,
  onTriggerMantraPractice,
  steps,
  onAddStep,
}) => {
  const [selectedMoment, setSelectedMoment] =
    useState<EmotionalMoment>('Nervous');
  const [stepText, setStepText] = useState('');
  const [feelingBefore, setFeelingBefore] =
    useState<SmallStepEntry['feelingBefore']>('Nervous');
  const [linkedLine, setLinkedLine] = useState(SONG_METADATA.mantraQuote);
  const [formError, setFormError] = useState<string | null>(null);

  const allLyricLines = SONG_SECTIONS.flatMap((s) =>
    s.lines.map((l) => ({ id: l.id, sectionTitle: s.title, text: l.text }))
  );

  const guide = EMOTIONAL_GUIDES[selectedMoment];
  const stats = calculatePracticeStats(steps);

  const handleSubmitStep = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateStepEntry({ stepText, linkedLine });
    if (!validation.valid) {
      setFormError(validation.error || 'Please complete the reflection field.');
      return;
    }

    setFormError(null);
    const today = new Date().toISOString().slice(0, 10);
    const newEntry: SmallStepEntry = {
      id: `step-${Date.now()}`,
      stepText: stepText.trim(),
      linkedLine,
      feelingBefore,
      createdAt: today,
    };

    onAddStep(newEntry);
    setStepText('');
  };

  return (
    <section className="py-14">
      <div className="mx-auto max-w-[1200px] px-6">
        {/* Part 1: Brother's Mantra Practice Coach */}
        <div id="mantra-practice" className="scroll-mt-20 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 sm:p-8">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
            <div>
              <p className="text-xs font-medium text-amber-400">
                03. Brother’s Mantra &amp; Vocal Confidence Practice
              </p>
              <h2 className="mt-1 font-display text-3xl font-bold tracking-tight text-zinc-100">
                “{SONG_METADATA.mantraQuote}”
              </h2>
              <p className="mt-2 max-w-[68ch] text-sm leading-relaxed text-zinc-300">
                Sing it when you feel nervous, lonely, or discouraged. Select how you feel right
                now to tailor your vocal posture and loop the Bridge mantra.
              </p>
            </div>

            <button
              type="button"
              onClick={onTriggerMantraPractice}
              className={`inline-flex items-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                isMantraLoop
                  ? 'bg-amber-400 text-zinc-950'
                  : 'bg-amber-500 text-zinc-950 hover:bg-amber-400'
              }`}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              <span>
                {isMantraLoop
                  ? 'Practicing Bridge Mantra Loop (1:53)'
                  : 'Start Mantra Loop Practice'}
              </span>
            </button>
          </div>

          {/* Interactive Moment Selector */}
          <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-zinc-800 pt-6">
            <span className="mr-2 text-xs font-medium text-zinc-400">
              Select Current Moment:
            </span>
            {(['Nervous', 'Lonely', 'Discouraged'] as const).map((moment) => (
              <button
                key={moment}
                type="button"
                onClick={() => {
                  setSelectedMoment(moment);
                  setFeelingBefore(moment);
                }}
                className={`rounded-lg px-4 py-2 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  selectedMoment === moment
                    ? 'bg-amber-500 text-zinc-950'
                    : 'border border-zinc-800 bg-zinc-950 text-zinc-300 hover:border-zinc-700 hover:text-zinc-100'
                }`}
              >
                When I Feel {moment}
              </button>
            ))}
          </div>

          {/* Guided Vocal & Mindset Card */}
          <div className="mt-5 grid grid-cols-1 gap-6 rounded-xl border border-zinc-800 bg-zinc-950/90 p-5 md:grid-cols-3">
            <div>
              <p className="text-xs font-medium text-amber-400">Vocal Delivery</p>
              <h3 className="mt-1 font-display text-base font-semibold text-zinc-100">
                {guide.headline}
              </h3>
              <p className="mt-1.5 text-xs leading-relaxed text-zinc-300">
                {guide.vocalApproach}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium text-amber-400">Breathing Cadence</p>
              <p className="mt-1 font-mono-num text-xs font-semibold text-zinc-100">
                {guide.breathingCue}
              </p>
              <p className="mt-2 text-xs leading-relaxed text-zinc-400">
                Chords under this line: <span className="font-mono-num text-zinc-200">Bm7 · Gmaj7 · D · A</span>
              </p>
            </div>

            <div>
              <p className="text-xs font-medium text-amber-400">Brother’s Reminder</p>
              <p className="mt-1.5 font-lyric text-sm italic leading-relaxed text-zinc-200">
                “{guide.affirmation}”
              </p>
            </div>
          </div>
        </div>

        {/* Part 2: Daily Small Steps Log */}
        <div id="daily-steps" className="scroll-mt-20 mt-14 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start">
          {/* Form Column */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 lg:col-span-5">
            <p className="text-xs font-medium text-amber-400">
              04. One Little Step, One Brand-New Day
            </p>
            <h2 className="mt-1 font-display text-2xl font-bold text-zinc-100">
              Log Today’s Small Step
            </h2>
            <p className="mt-1.5 text-xs leading-relaxed text-zinc-400">
              You don’t need to change your whole life in one day. Record one small act of
              discipline, kindness, or vocal expression you took today.
            </p>

            <form onSubmit={handleSubmitStep} className="mt-5 space-y-4" noValidate>
              <div>
                <label
                  htmlFor="step-feeling-select"
                  className="block text-xs font-semibold text-zinc-300"
                >
                  How Were You Feeling Before?
                </label>
                <select
                  id="step-feeling-select"
                  value={feelingBefore}
                  onChange={(e) =>
                    setFeelingBefore(
                      e.target.value as SmallStepEntry['feelingBefore']
                    )
                  }
                  className="mt-1.5 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus:border-amber-500 focus:outline-none"
                >
                  <option value="Nervous">Nervous</option>
                  <option value="Lonely">Lonely</option>
                  <option value="Discouraged">Discouraged</option>
                  <option value="Focused">Focused</option>
                  <option value="Hopeful">Hopeful</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="step-lyric-select"
                  className="block text-xs font-semibold text-zinc-300"
                >
                  Anchor Lyric Line
                </label>
                <select
                  id="step-lyric-select"
                  value={linkedLine}
                  onChange={(e) => setLinkedLine(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-zinc-100 focus:border-amber-500 focus:outline-none"
                >
                  {allLyricLines.map((item) => (
                    <option key={item.id} value={item.text}>
                      [{item.sectionTitle}] {item.text}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="step-reflection-input"
                  className="block text-xs font-semibold text-zinc-300"
                >
                  Your Small Step Today
                </label>
                <textarea
                  id="step-reflection-input"
                  rows={3}
                  value={stepText}
                  onChange={(e) => {
                    setStepText(e.target.value);
                    if (formError) setFormError(null);
                  }}
                  placeholder="e.g., Sang the Bridge mantra aloud and finished 30 minutes of focused practice..."
                  className="mt-1.5 w-full rounded-lg border border-zinc-800 bg-zinc-950 p-3 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-amber-500 focus:outline-none"
                />
                {formError && (
                  <p role="alert" className="mt-1.5 text-xs text-rose-400">
                    {formError}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-semibold text-zinc-950 hover:bg-amber-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                <span>Save Milestone Step</span>
              </button>
            </form>
          </div>

          {/* Logged Milestones List */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 lg:col-span-7">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800 pb-4">
              <div>
                <h3 className="font-display text-xl font-bold text-zinc-100">
                  Climbing to the Top — Daily Steps Journal
                </h3>
                <div className="mt-1 flex items-center gap-2 text-xs text-zinc-400">
                  <span className="font-mono-num text-amber-400">
                    {stats.totalSteps} Total Steps
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono-num">
                    {stats.mantraUses} Mantra Check-ins
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono-num">
                    {stats.uniqueDays} Active {stats.uniqueDays === 1 ? 'Day' : 'Days'}
                  </span>
                </div>
              </div>
              <Heart className="h-5 w-5 text-amber-400" aria-hidden="true" />
            </div>

            <div className="mt-5 space-y-4">
              {steps.map((entry) => (
                <article
                  key={entry.id}
                  className="rounded-xl border border-zinc-800 bg-zinc-950/80 p-4"
                >
                  <div className="flex items-center justify-between gap-2 text-xs text-zinc-400">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-amber-400" aria-hidden="true" />
                      <span className="font-medium text-zinc-200">
                        Transformed {entry.feelingBefore} into Action
                      </span>
                    </div>
                    <span className="font-mono-num">{entry.createdAt}</span>
                  </div>

                  <p className="mt-2 text-sm leading-relaxed text-zinc-100">
                    {entry.stepText}
                  </p>

                  <p className="mt-2 font-lyric text-xs italic text-amber-300/90">
                    “{entry.linkedLine}”
                  </p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

import React, { useState } from 'react';
import { Play, Sparkles, Maximize2, Minimize2 } from 'lucide-react';
import { SONG_SECTIONS, SongSection } from '../data/songData';
import { ActiveSongPosition, formatTimestamp } from '../utils/songLogic';

interface SongbookSectionProps {
  activePosition: ActiveSongPosition;
  isPlaying: boolean;
  onSeekAndPlay: (seconds: number) => void;
  onSelectSectionForLyria: (sectionId: string) => void;
}

type SectionFilter = 'all' | 'chorus' | 'verse' | 'bridge';

export const SongbookSection: React.FC<SongbookSectionProps> = ({
  activePosition,
  isPlaying,
  onSeekAndPlay,
  onSelectSectionForLyria,
}) => {
  const [filter, setFilter] = useState<SectionFilter>('all');
  const [showChords, setShowChords] = useState(true);
  const [stageMode, setStageMode] = useState(false);

  const filteredSections = SONG_SECTIONS.filter((sec) => {
    if (filter === 'all') return true;
    if (filter === 'chorus') {
      return sec.type === 'chorus' || sec.type === 'final-chorus';
    }
    if (filter === 'verse') {
      return sec.type === 'verse' || sec.type === 'pre-chorus';
    }
    if (filter === 'bridge') {
      return sec.type === 'bridge';
    }
    return true;
  });

  const renderSectionCard = (section: SongSection) => {
    const isActiveSection = activePosition.section.id === section.id;

    return (
      <article
        key={section.id}
        className={`rounded-2xl border p-6 transition-colors ${
          isActiveSection
            ? 'border-amber-500/70 bg-zinc-900'
            : 'border-zinc-800/90 bg-zinc-900/40 hover:border-zinc-700'
        }`}
      >
        {/* Top unboxed metadata row */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400">
              <span className="font-mono-num font-semibold text-amber-400">
                {section.order}
              </span>
              <span aria-hidden="true">·</span>
              <span className="font-mono-num">
                {formatTimestamp(section.startTime)} – {formatTimestamp(section.endTime)}
              </span>
              <span aria-hidden="true">·</span>
              <span>Intensity {section.energyLevel}/10</span>
            </div>
            <h3 className="mt-1 font-display text-xl font-bold text-zinc-100">
              {section.title} — {section.subtitle}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onSeekAndPlay(section.startTime)}
              aria-label={`Play ${section.title} — ${section.subtitle}`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800/90 px-3 py-1.5 text-xs font-medium text-zinc-100 hover:bg-zinc-700 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Play className="h-3.5 w-3.5 fill-current text-amber-400" aria-hidden="true" />
              <span>{isActiveSection && isPlaying ? 'Playing' : 'Sing Section'}</span>
            </button>

            <button
              type="button"
              onClick={() => onSelectSectionForLyria(section.id)}
              aria-label={`Send ${section.title} to Lyria AI Studio`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:border-amber-500/50 hover:text-amber-300 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-400" aria-hidden="true" />
              <span>Compose in Lyria</span>
            </button>
          </div>
        </div>

        {/* Optional Chord Progression & Vocal Coaching Guide */}
        {showChords && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-400">
            <div>
              <span className="text-zinc-500">Chords: </span>
              <span className="font-mono-num font-medium text-amber-300">
                {section.chords}
              </span>
            </div>
            <div>
              <span className="text-zinc-500">Vocal Direction: </span>
              <span className="text-zinc-300">{section.vocalDynamic}</span>
            </div>
          </div>
        )}

        {/* Lyric Lines */}
        <div className="mt-5 space-y-2.5">
          {section.lines.map((line) => {
            const isActiveLine = activePosition.line.id === line.id;
            return (
              <button
                key={line.id}
                type="button"
                onClick={() => onSeekAndPlay(line.startTime)}
                className={`group flex w-full items-baseline justify-between gap-4 rounded-xl px-3.5 py-2.5 text-left transition-colors cursor-pointer ${
                  isActiveLine
                    ? 'bg-amber-500/15 text-amber-200'
                    : line.isMantra
                    ? 'bg-zinc-800/50 text-zinc-100 hover:bg-zinc-800'
                    : 'text-zinc-300 hover:bg-zinc-800/40 hover:text-zinc-100'
                }`}
              >
                <span
                  className={`font-lyric leading-relaxed ${
                    stageMode ? 'text-xl sm:text-2xl' : 'text-base sm:text-lg'
                  } ${isActiveLine ? 'font-semibold text-amber-200' : ''}`}
                >
                  {line.text}
                  {line.isMantra && (
                    <span className="ml-2 font-sans text-xs font-medium text-amber-400">
                      · Core Mantra
                    </span>
                  )}
                </span>
                <span className="font-mono-num text-xs text-zinc-500 group-hover:text-zinc-300 shrink-0">
                  {formatTimestamp(line.startTime)}
                </span>
              </button>
            );
          })}
        </div>
      </article>
    );
  };

  return (
    <section id="songbook" className="scroll-mt-20 border-b border-zinc-800/80 py-14">
      <div className="mx-auto max-w-[1200px] px-6">
        {/* Section Header & Interactive Controls */}
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-medium text-amber-400">
              01. Complete Lyric Sheet &amp; Vocal Teleprompter
            </p>
            <h2 className="mt-1 font-display text-3xl font-bold tracking-tight text-zinc-100">
              Interactive Anthem Songbook
            </h2>
            <p className="mt-2 max-w-[65ch] text-sm text-zinc-400">
              Click any lyric line to jump straight to that moment in the studio arrangement,
              or send any stanza to the Lyria AI Studio below.
            </p>
          </div>

          {/* Interactive Filter Controls & View Toggles */}
          <div className="flex flex-wrap items-center gap-3">
            <div
              role="group"
              aria-label="Filter song sections"
              className="flex items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-900 p-1"
            >
              {(
                [
                  { id: 'all', label: 'All Sections (8)' },
                  { id: 'chorus', label: 'Choruses' },
                  { id: 'verse', label: 'Verses' },
                  { id: 'bridge', label: 'Bridge Mantra' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setFilter(tab.id)}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    filter === tab.id
                      ? 'bg-amber-500 text-zinc-950 font-semibold'
                      : 'text-zinc-400 hover:text-zinc-100'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setShowChords((prev) => !prev)}
              className={`rounded-lg border px-3 py-2 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                showChords
                  ? 'border-amber-500/60 bg-amber-500/10 text-amber-300'
                  : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {showChords ? 'Hide Chords & Cues' : 'Show Chords & Cues'}
            </button>

            <button
              type="button"
              onClick={() => setStageMode((prev) => !prev)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs font-medium text-zinc-300 hover:border-zinc-700 hover:text-zinc-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              {stageMode ? (
                <>
                  <Minimize2 className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Standard Lyric Size</span>
                </>
              ) : (
                <>
                  <Maximize2 className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Stage Teleprompter Size</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Song Sections Grid */}
        <div
          className={`mt-8 grid gap-6 ${
            stageMode ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'
          }`}
        >
          {filteredSections.map(renderSectionCard)}
        </div>
      </div>
    </section>
  );
};

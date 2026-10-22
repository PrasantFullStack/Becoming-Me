import React, { useState } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Sparkles, Music } from 'lucide-react';
import {
  ARTIST_PORTRAIT_PATH,
  SONG_METADATA,
  SONG_SECTIONS,
} from '../data/songData';
import { ActiveSongPosition, formatTimestamp } from '../utils/songLogic';

interface HeroSectionProps {
  isPlaying: boolean;
  currentTime: number;
  activePosition: ActiveSongPosition;
  isMantraLoop: boolean;
  isMuted: boolean;
  onTogglePlay: () => void;
  onSeek: (seconds: number) => void;
  onToggleMantraLoop: () => void;
  onToggleMute: () => void;
  onJumpToLyria: () => void;
  totalTakesCount: number;
  totalStepsCount: number;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  isPlaying,
  currentTime,
  activePosition,
  isMantraLoop,
  isMuted,
  onTogglePlay,
  onSeek,
  onToggleMantraLoop,
  onToggleMute,
  onJumpToLyria,
  totalTakesCount,
  totalStepsCount,
}) => {
  const [imgError, setImgError] = useState(false);

  return (
    <section id="top" className="border-b border-zinc-800/80 py-12 lg:py-16">
      <div className="mx-auto max-w-[1200px] px-6">
        {/* Split-Screen Hero */}
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-stretch">
          {/* Left Column: Typographic Hierarchy & Brother's Mantra */}
          <div className="flex flex-col justify-between gap-6 lg:col-span-7">
            <div>
              {/* Unboxed quiet metadata kicker (Zero-Pill Discipline) */}
              <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-zinc-400">
                <span className="text-amber-400">{SONG_METADATA.genre}</span>
                <span aria-hidden="true">·</span>
                <span>{SONG_METADATA.mood}</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono-num">{SONG_METADATA.bpm} BPM</span>
                <span aria-hidden="true">·</span>
                <span>Key of {SONG_METADATA.keySignature}</span>
              </div>

              <h1
                className="mt-3 font-display text-4xl font-bold tracking-tight text-zinc-100 sm:text-5xl lg:text-[3.5rem] lg:leading-[1.08]"
                style={{ textWrap: 'balance' }}
              >
                “I’m Becoming Me”
              </h1>

              <p className="mt-3 max-w-[65ch] text-base leading-relaxed text-zinc-300">
                An original personal anthem of resilience, quiet discipline, and fearless self-expression.
                Follow the synchronized vocal teleprompter, practice the emotional bridge mantra, or compose
                custom arrangements with Google Lyria AI.
              </p>

              {/* Brother's Mantra Callout — Hairline all-around border, zero thick left border */}
              <div className="mt-5 rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
                <div className="flex items-center justify-between gap-4 text-xs text-zinc-400">
                  <span className="truncate">Brother’s Anchor Line · Section 07 Bridge</span>
                  <span className="font-mono-num text-amber-400 whitespace-nowrap shrink-0">
                    1:53 – 1:58
                  </span>
                </div>
                <blockquote className="mt-2 font-lyric text-xl italic text-zinc-100 sm:text-2xl">
                  “{SONG_METADATA.mantraQuote}”
                </blockquote>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                  {SONG_METADATA.brotherNote}
                </p>
              </div>
            </div>

            {/* Primary Actions & Live Teleprompter Mini-Bar */}
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={onTogglePlay}
                  className="inline-flex items-center gap-2.5 rounded-lg bg-amber-500 px-5 py-2.5 text-sm font-semibold text-zinc-950 hover:bg-amber-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="h-4 w-4 fill-current" aria-hidden="true" />
                      <span>Pause Studio Arrangement</span>
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 fill-current" aria-hidden="true" />
                      <span>Play Studio Arrangement</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={onToggleMantraLoop}
                  className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    isMantraLoop
                      ? 'border-amber-500/80 bg-amber-500/15 text-amber-300'
                      : 'border-zinc-800 bg-zinc-900 text-zinc-200 hover:border-zinc-700 hover:bg-zinc-800'
                  }`}
                >
                  <RotateCcw className="h-4 w-4" aria-hidden="true" />
                  <span>{isMantraLoop ? 'Looping Bridge Mantra' : 'Loop Mantra Line'}</span>
                </button>

                <button
                  type="button"
                  onClick={onJumpToLyria}
                  className="inline-flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-sm font-medium text-zinc-200 hover:border-zinc-700 hover:bg-zinc-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Sparkles className="h-4 w-4 text-amber-400" aria-hidden="true" />
                  <span>Open Lyria AI Studio</span>
                </button>
              </div>

              {/* Synchronized Scrubber Bar */}
              <div className="mt-5 rounded-xl border border-zinc-800 bg-zinc-900/80 p-4">
                <div className="flex items-center justify-between gap-4 text-xs text-zinc-400">
                  <div className="truncate">
                    <span className="font-semibold text-amber-400">
                      {activePosition.section.order}. {activePosition.section.title}
                    </span>
                    <span className="mx-1.5" aria-hidden="true">·</span>
                    <span className="text-zinc-300">{activePosition.section.subtitle}</span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      type="button"
                      onClick={onToggleMute}
                      aria-label={isMuted ? 'Unmute studio synth' : 'Mute studio synth'}
                      className="text-zinc-400 hover:text-zinc-100 transition-colors cursor-pointer"
                    >
                      {isMuted ? (
                        <VolumeX className="h-4 w-4" aria-hidden="true" />
                      ) : (
                        <Volume2 className="h-4 w-4" aria-hidden="true" />
                      )}
                    </button>
                    <span className="font-mono-num text-zinc-300 whitespace-nowrap">
                      {formatTimestamp(currentTime)} / {formatTimestamp(SONG_METADATA.totalDuration)}
                    </span>
                  </div>
                </div>

                <p className="mt-2 font-lyric text-base text-zinc-100 transition-opacity">
                  “{activePosition.line.text}”
                </p>

                <div className="mt-3 flex items-center gap-3">
                  <label htmlFor="hero-song-scrubber" className="sr-only">
                    Song playback position
                  </label>
                  <input
                    id="hero-song-scrubber"
                    type="range"
                    min={0}
                    max={SONG_METADATA.totalDuration}
                    step={0.5}
                    value={currentTime}
                    onChange={(e) => onSeek(Number(e.target.value))}
                    className="h-1.5 w-full accent-amber-500 cursor-pointer bg-zinc-800 rounded-lg"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Artist Cover Portrait & Vinyl Edition Framing */}
          <div className="lg:col-span-5">
            <div className="relative flex h-[460px] lg:h-full lg:min-h-[480px] lg:max-h-[560px] flex-col justify-between overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900">
              {!imgError ? (
                <img
                  src={ARTIST_PORTRAIT_PATH}
                  alt="Artist portrait for I’m Becoming Me in maroon collared shirt beneath green trees"
                  referrerPolicy="no-referrer"
                  onError={() => setImgError(true)}
                  className="absolute inset-0 h-full w-full object-cover object-center"
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-rose-950/60 via-zinc-900 to-zinc-950 p-8 text-center">
                  <Music className="h-12 w-12 text-amber-400" aria-hidden="true" />
                  <p className="mt-3 font-display text-lg font-semibold text-zinc-100">
                    I’m Becoming Me — Cover Edition
                  </p>
                </div>
              )}

              {/* Measured Scrim for Media Overlay (WCAG AA 4.5:1 contrast) */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-black/60" />

              {/* Top Cover Kicker */}
              <div className="relative z-10 flex items-center justify-between p-5">
                <span className="text-xs font-medium tracking-wide text-zinc-100 drop-shadow">
                  Original Artist Edition · 2026
                </span>
                <span className="font-mono-num text-xs font-medium text-amber-300 drop-shadow whitespace-nowrap">
                  D Major · 4/4
                </span>
              </div>

              {/* Bottom Album Title & Active Chords Overlay */}
              <div className="relative z-10 mt-auto p-6">
                <p className="text-xs font-medium text-amber-300">
                  Active Harmony · {activePosition.section.chords}
                </p>
                <h2 className="mt-1 font-display text-2xl font-bold text-white">
                  I’m Becoming Me
                </h2>
                <p className="mt-1 text-xs text-zinc-200">
                  {activePosition.section.vocalDynamic}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Full-Width 4-Column Metric & Song Structure Strip Below Hero Split */}
        <div className="mt-10 grid grid-cols-2 gap-6 border-t border-zinc-800/80 pt-8 sm:grid-cols-4">
          <div>
            <p className="text-xs text-zinc-400">Song Architecture</p>
            <p className="mt-1 font-display text-xl font-bold font-mono-num text-zinc-100 whitespace-nowrap">
              {SONG_SECTIONS.length} Sections · 31 Lines
            </p>
            <p className="mt-0.5 text-xs text-zinc-500">
              Verse 1 through Final Chorus
            </p>
          </div>

          <div>
            <p className="text-xs text-zinc-400">Harmonic Center</p>
            <p className="mt-1 font-display text-xl font-bold font-mono-num text-zinc-100 whitespace-nowrap">
              {SONG_METADATA.keySignature} · {SONG_METADATA.bpm} BPM
            </p>
            <p className="mt-0.5 text-xs text-zinc-500">
              D – A – Bm7 – G Progression
            </p>
          </div>

          <div>
            <p className="text-xs text-zinc-400">Lyria AI Studio Models</p>
            <p className="mt-1 font-display text-xl font-bold font-mono-num text-zinc-100 whitespace-nowrap">
              {totalTakesCount} Studio {totalTakesCount === 1 ? 'Take' : 'Takes'}
            </p>
            <p className="mt-0.5 text-xs text-zinc-500">
              Lyria Clip (30s) &amp; Lyria Pro (Full)
            </p>
          </div>

          <div>
            <p className="text-xs text-zinc-400">Daily Climb Milestones</p>
            <p className="mt-1 font-display text-xl font-bold font-mono-num text-zinc-100 whitespace-nowrap">
              {totalStepsCount} Logged {totalStepsCount === 1 ? 'Step' : 'Steps'}
            </p>
            <p className="mt-0.5 text-xs text-zinc-500">
              Small steps toward the real you
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

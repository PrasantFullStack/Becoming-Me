/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  INITIAL_SMALL_STEPS,
  SONG_METADATA,
  SmallStepEntry,
  StudioTake,
} from './data/songData';
import {
  createProceduralAnthemWavBase64,
  getActiveSongPosition,
} from './utils/songLogic';
import { studioAnthemEngine } from './utils/studioSynth';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { SongbookSection } from './components/SongbookSection';
import { LyriaStudioSection } from './components/LyriaStudioSection';
import { MantraAndStepsSection } from './components/MantraAndStepsSection';

const STORAGE_KEY_STEPS = 'becoming_me_small_steps_v1';

export default function App() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isMantraLoop, setIsMantraLoop] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [selectedLyriaSectionId, setSelectedLyriaSectionId] =
    useState<string>('chorus-1');

  const [steps, setSteps] = useState<SmallStepEntry[]>(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY_STEPS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // Fallback to seed steps
    }
    return INITIAL_SMALL_STEPS;
  });

  const [takes, setTakes] = useState<StudioTake[]>(() => {
    try {
      const wavBase64 = createProceduralAnthemWavBase64(12, 'anthemic-pop');
      const binary = atob(wavBase64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: 'audio/wav' });
      const url = URL.createObjectURL(blob);

      return [
        {
          id: 'take-initial-chorus',
          title: 'I’m Becoming Me — Chorus Demo (Anthemic Arena Pop)',
          model: 'lyria-3-clip-preview',
          sectionId: 'chorus-1',
          arrangementStyle: 'Anthemic Arena Pop',
          prompt:
            'Generate a 30-second inspirational pop music clip titled "I’m Becoming Me" in D Major at 118 BPM.',
          usedArtistPortrait: true,
          createdAt: 'Studio Reference',
          durationLabel: '12s Reference WAV',
          audioUrl: url,
          sourceType: 'studio-synth',
          notes:
            'Reference studio demo in D Major (D – A – Bm7 – G) ready for immediate playback or WAV download.',
        },
      ];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY_STEPS, JSON.stringify(steps));
    } catch {
      // Ignore storage quota errors
    }
  }, [steps]);

  useEffect(() => {
    studioAnthemEngine.setVolume(isMuted ? 0 : 0.75);
  }, [isMuted]);

  useEffect(() => {
    if (!isPlaying) {
      studioAnthemEngine.stop();
      return;
    }

    studioAnthemEngine.start();
    const interval = window.setInterval(() => {
      setCurrentTime((prev) => {
        const next = prev + 0.25;
        if (isMantraLoop) {
          // Bridge Mantra spans 113s to 118s
          if (next >= 118 || next < 113) {
            return 113;
          }
          return next;
        }
        if (next >= SONG_METADATA.totalDuration) {
          return 0;
        }
        return next;
      });
    }, 250);

    return () => {
      window.clearInterval(interval);
    };
  }, [isPlaying, isMantraLoop]);

  const handleTogglePlay = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  const handleSeek = useCallback((seconds: number) => {
    setCurrentTime(seconds);
    if (seconds < 113 || seconds >= 118) {
      setIsMantraLoop(false);
    }
  }, []);

  const handleSeekAndPlay = useCallback((seconds: number) => {
    setCurrentTime(seconds);
    if (seconds < 113 || seconds >= 118) {
      setIsMantraLoop(false);
    }
    setIsPlaying(true);
  }, []);

  const handleToggleMantraLoop = useCallback(() => {
    setIsMantraLoop((prev) => {
      const nextState = !prev;
      if (nextState) {
        setCurrentTime(113);
        setIsPlaying(true);
      }
      return nextState;
    });
  }, []);

  const handleTriggerMantraPractice = useCallback(() => {
    setIsMantraLoop(true);
    setCurrentTime(113);
    setIsPlaying(true);
  }, []);

  const handleSelectSectionForLyria = useCallback((sectionId: string) => {
    setSelectedLyriaSectionId(sectionId);
    const el = document.getElementById('lyria-studio');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  const handleJumpToLyria = useCallback(() => {
    const el = document.getElementById('lyria-studio');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  const handleAddTake = useCallback((newTake: StudioTake) => {
    setTakes((prev) => [newTake, ...prev]);
  }, []);

  const handleAddStep = useCallback((newStep: SmallStepEntry) => {
    setSteps((prev) => [newStep, ...prev]);
  }, []);

  const activePosition = getActiveSongPosition(currentTime);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      <Header isPlaying={isPlaying} onTogglePlay={handleTogglePlay} />

      <main className="flex-1">
        <HeroSection
          isPlaying={isPlaying}
          currentTime={currentTime}
          activePosition={activePosition}
          isMantraLoop={isMantraLoop}
          isMuted={isMuted}
          onTogglePlay={handleTogglePlay}
          onSeek={handleSeek}
          onToggleMantraLoop={handleToggleMantraLoop}
          onToggleMute={() => setIsMuted((m) => !m)}
          onJumpToLyria={handleJumpToLyria}
          totalTakesCount={takes.length}
          totalStepsCount={steps.length}
        />

        <SongbookSection
          activePosition={activePosition}
          isPlaying={isPlaying}
          onSeekAndPlay={handleSeekAndPlay}
          onSelectSectionForLyria={handleSelectSectionForLyria}
        />

        <LyriaStudioSection
          selectedSectionId={selectedLyriaSectionId}
          onSelectSectionId={setSelectedLyriaSectionId}
          takes={takes}
          onAddTake={handleAddTake}
          onPauseMainArrangement={() => setIsPlaying(false)}
        />

        <MantraAndStepsSection
          isMantraLoop={isMantraLoop}
          onTriggerMantraPractice={handleTriggerMantraPractice}
          steps={steps}
          onAddStep={handleAddStep}
        />
      </main>

      <footer className="border-t border-zinc-800/80 bg-zinc-950 py-8">
        <div className="mx-auto flex max-w-[1200px] flex-col items-center justify-between gap-4 px-6 text-xs text-zinc-400 sm:flex-row">
          <p className="font-lyric italic text-zinc-300">
            “I may be slow, but I won’t stop. I’ll keep on climbing to the top.”
          </p>
          <div className="flex items-center gap-4">
            <a href="#top" className="hover:text-zinc-100 transition-colors">
              Back to Top
            </a>
            <span aria-hidden="true">·</span>
            <a href="#songbook" className="hover:text-zinc-100 transition-colors">
              Songbook
            </a>
            <span aria-hidden="true">·</span>
            <a href="#lyria-studio" className="hover:text-zinc-100 transition-colors">
              Lyria Studio
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

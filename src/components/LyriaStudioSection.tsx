import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Music,
  Download,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Image as ImageIcon,
} from 'lucide-react';
import {
  ARRANGEMENT_PRESETS,
  ARTIST_PORTRAIT_PATH,
  SONG_SECTIONS,
  StudioTake,
} from '../data/songData';
import {
  buildLyriaPrompt,
  createProceduralAnthemWavBase64,
} from '../utils/songLogic';

interface LyriaStudioSectionProps {
  selectedSectionId: string;
  onSelectSectionId: (id: string) => void;
  takes: StudioTake[];
  onAddTake: (take: StudioTake) => void;
  onPauseMainArrangement: () => void;
}

export const LyriaStudioSection: React.FC<LyriaStudioSectionProps> = ({
  selectedSectionId,
  onSelectSectionId,
  takes,
  onAddTake,
  onPauseMainArrangement,
}) => {
  const [selectedModel, setSelectedModel] = useState<
    'lyria-3-clip-preview' | 'lyria-3-pro-preview'
  >('lyria-3-clip-preview');
  const [selectedPresetId, setSelectedPresetId] = useState<string>(
    ARRANGEMENT_PRESETS[0].id
  );
  const [useArtistImage, setUseArtistImage] = useState<boolean>(true);
  const [customDirection, setCustomDirection] = useState<string>('');
  const [promptText, setPromptText] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'info' | 'error' | 'success';
    text: string;
  } | null>(null);
  const [portraitThumbError, setPortraitThumbError] = useState(false);

  const activePreset =
    ARRANGEMENT_PRESETS.find((p) => p.id === selectedPresetId) ||
    ARRANGEMENT_PRESETS[0];

  // Keep prompt synchronized when controls change
  useEffect(() => {
    const built = buildLyriaPrompt({
      model: selectedModel,
      sectionId: selectedSectionId,
      arrangementDescription: activePreset.description,
      customDirection,
      useArtistImage,
    });
    setPromptText(built);
  }, [selectedModel, selectedSectionId, activePreset.description, customDirection, useArtistImage]);

  const handleSynthesizeStudioFallbackTake = (reasonNote?: string) => {
    const styleKey = (
      ['anthemic-pop', 'intimate-acoustic', 'cinematic-orchestral'].includes(
        selectedPresetId
      )
        ? selectedPresetId
        : 'anthemic-pop'
    ) as 'anthemic-pop' | 'intimate-acoustic' | 'cinematic-orchestral';

    const durationSec = selectedModel === 'lyria-3-pro-preview' ? 24 : 12;
    const wavBase64 = createProceduralAnthemWavBase64(durationSec, styleKey);
    const binary = atob(wavBase64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: 'audio/wav' });
    const audioUrl = URL.createObjectURL(blob);

    const targetLabel =
      selectedSectionId === 'full-song'
        ? 'Full Song Arrangement'
        : SONG_SECTIONS.find((s) => s.id === selectedSectionId)?.title ||
          'Chorus';

    const newTake: StudioTake = {
      id: `take-${Date.now()}`,
      title: `I’m Becoming Me — ${targetLabel} (${activePreset.label})`,
      model: selectedModel,
      sectionId: selectedSectionId,
      arrangementStyle: activePreset.label,
      prompt: promptText.trim(),
      usedArtistPortrait: useArtistImage,
      createdAt: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
      durationLabel: `${durationSec}s Studio WAV`,
      audioUrl,
      sourceType: 'studio-synth',
      notes:
        reasonNote ||
        'Synthesized in D Major (118 BPM) using the built-in Studio WAV Engine.',
    };

    onAddTake(newTake);
    setStatusMessage({
      type: 'success',
      text: `Created playable Studio WAV take "${newTake.title}". Ready to audition or download on the right.`,
    });
  };

  const handleGenerateLyria = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedPrompt = promptText.trim();
    if (!trimmedPrompt) {
      setStatusMessage({
        type: 'error',
        text: 'Please provide a musical prompt before generating a track.',
      });
      return;
    }

    setIsGenerating(true);
    setStatusMessage({
      type: 'info',
      text: `Calling Google Lyria (${selectedModel})${
        useArtistImage ? ' with Artist Portrait + Lyrics' : ''
      }...`,
    });

    try {
      const response = await fetch('/api/generate-music', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: selectedModel,
          prompt: trimmedPrompt,
          useArtistImage,
        }),
      });

      const data = await response.json();

      if (!response.ok || data.ok === false || !data.audioBase64) {
        const cleanNotice =
          data?.error && data.error.length < 180
            ? data.error
            : `Google Lyria (${selectedModel}) requires a paid Gemini API key in AI Studio Secrets.`;

        handleSynthesizeStudioFallbackTake(
          `Synthesized multi-layered D Major Studio WAV (${activePreset.label}) while cloud Lyria awaits a paid API key.`
        );
        setStatusMessage({
          type: 'info',
          text: `${cleanNotice} Synthesized a playable D-Major Studio WAV take into your Recorded Studio Takes deck so you can audition and download right away.`,
        });
        setIsGenerating(false);
        return;
      }

      // Decode base64 audio returned by Lyria into a playable Blob URL
      const binary = atob(data.audioBase64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      const mimeType = data.mimeType || 'audio/wav';
      const blob = new Blob([bytes], { type: mimeType });
      const audioUrl = URL.createObjectURL(blob);

      const targetLabel =
        selectedSectionId === 'full-song'
          ? 'Full Track'
          : SONG_SECTIONS.find((s) => s.id === selectedSectionId)?.title ||
            'Section';

      const newTake: StudioTake = {
        id: `lyria-${Date.now()}`,
        title: `I’m Becoming Me — ${targetLabel} (${
          selectedModel === 'lyria-3-pro-preview' ? 'Lyria Pro' : 'Lyria Clip'
        })`,
        model: selectedModel,
        sectionId: selectedSectionId,
        arrangementStyle: activePreset.label,
        prompt: trimmedPrompt,
        usedArtistPortrait: useArtistImage,
        createdAt: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
        durationLabel:
          selectedModel === 'lyria-3-pro-preview' ? 'Full Track' : '30s Clip',
        audioUrl,
        sourceType: 'lyria-ai',
        notes: data.generatedLyrics
          ? `Lyria Lyrics Metadata: ${data.generatedLyrics.slice(0, 140)}`
          : 'Generated via Google Lyria AI streaming audio model.',
      };

      onAddTake(newTake);
      setStatusMessage({
        type: 'success',
        text: `Successfully generated "${newTake.title}" with ${selectedModel}!`,
      });
    } catch {
      handleSynthesizeStudioFallbackTake(
        'Synthesized playable D Major Studio WAV take using built-in studio arrangement engine.'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <section id="lyria-studio" className="scroll-mt-20 border-b border-zinc-800/80 py-14">
      <div className="mx-auto max-w-[1200px] px-6">
        <div className="max-w-2xl">
          <p className="text-xs font-medium text-amber-400">
            02. AI Music Composition &amp; Multimodal Arrangement Studio
          </p>
          <h2 className="mt-1 font-display text-3xl font-bold tracking-tight text-zinc-100">
            Google Lyria Music Generator
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-zinc-400">
            Generate short 30-second previews with{' '}
            <code className="font-mono-num text-zinc-200">lyria-3-clip-preview</code> or
            full-length tracks with{' '}
            <code className="font-mono-num text-zinc-200">lyria-3-pro-preview</code>. Combine
            your lyrics with the uploaded artist portrait for multimodal musical inspiration.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start">
          {/* Left 7 Columns: Lyria Configuration Form */}
          <form
            onSubmit={handleGenerateLyria}
            className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 lg:col-span-7"
          >
            {/* 1. Model Selection */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300">
                Select Lyria Model
              </label>
              <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setSelectedModel('lyria-3-clip-preview')}
                  className={`flex flex-col items-start rounded-xl border p-4 text-left transition-colors cursor-pointer ${
                    selectedModel === 'lyria-3-clip-preview'
                      ? 'border-amber-500 bg-amber-500/10'
                      : 'border-zinc-800 bg-zinc-950/80 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex w-full items-center justify-between text-xs font-semibold text-zinc-100">
                    <span>Lyria 3 Clip Preview</span>
                    <span className="font-mono-num text-amber-400">Up to 30s</span>
                  </div>
                  <p className="mt-1 font-mono-num text-xs text-zinc-400">
                    lyria-3-clip-preview
                  </p>
                  <p className="mt-1.5 text-xs text-zinc-400">
                    Ideal for testing hooks, the Chorus belt, or the Bridge emotional mantra.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedModel('lyria-3-pro-preview')}
                  className={`flex flex-col items-start rounded-xl border p-4 text-left transition-colors cursor-pointer ${
                    selectedModel === 'lyria-3-pro-preview'
                      ? 'border-amber-500 bg-amber-500/10'
                      : 'border-zinc-800 bg-zinc-950/80 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex w-full items-center justify-between text-xs font-semibold text-zinc-100">
                    <span>Lyria 3 Pro Preview</span>
                    <span className="font-mono-num text-amber-400">Full Track</span>
                  </div>
                  <p className="mt-1 font-mono-num text-xs text-zinc-400">
                    lyria-3-pro-preview
                  </p>
                  <p className="mt-1.5 text-xs text-zinc-400">
                    Full-length arrangement spanning verses, pre-choruses, bridge, and finale.
                  </p>
                </button>
              </div>
            </div>

            {/* 2. Target Song Section & Arrangement Style */}
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="lyria-section-select"
                  className="block text-xs font-semibold text-zinc-300"
                >
                  Target Song Section
                </label>
                <select
                  id="lyria-section-select"
                  value={selectedSectionId}
                  onChange={(e) => onSelectSectionId(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-sm text-zinc-100 focus:border-amber-500 focus:outline-none"
                >
                  <option value="full-song">Full Song — All 8 Sections</option>
                  {SONG_SECTIONS.map((sec) => (
                    <option key={sec.id} value={sec.id}>
                      {sec.order}. {sec.title} — {sec.subtitle}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="lyria-preset-select"
                  className="block text-xs font-semibold text-zinc-300"
                >
                  Instrumentation Style
                </label>
                <select
                  id="lyria-preset-select"
                  value={selectedPresetId}
                  onChange={(e) => setSelectedPresetId(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-sm text-zinc-100 focus:border-amber-500 focus:outline-none"
                >
                  {ARRANGEMENT_PRESETS.map((preset) => (
                    <option key={preset.id} value={preset.id}>
                      {preset.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 3. Multimodal Image + Text Toggle */}
            <div className="mt-5 flex items-center justify-between gap-4 rounded-xl border border-zinc-800 bg-zinc-950/70 p-3.5">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 overflow-hidden rounded-lg border border-zinc-700 bg-zinc-900 shrink-0">
                  {!portraitThumbError ? (
                    <img
                      src={ARTIST_PORTRAIT_PATH}
                      alt="Uploaded artist portrait reference"
                      referrerPolicy="no-referrer"
                      onError={() => setPortraitThumbError(true)}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <ImageIcon className="h-5 w-5 text-amber-400" aria-hidden="true" />
                    </div>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="use-artist-portrait-checkbox"
                    className="text-xs font-semibold text-zinc-100 cursor-pointer"
                  >
                    Multimodal Image + Text Conditioning
                  </label>
                  <p className="text-xs text-zinc-400">
                    Pass your uploaded portrait alongside the lyrics to inspire Lyria’s musical tone.
                  </p>
                </div>
              </div>
              <input
                id="use-artist-portrait-checkbox"
                type="checkbox"
                checked={useArtistImage}
                onChange={(e) => setUseArtistImage(e.target.checked)}
                className="h-4 w-4 accent-amber-500 rounded cursor-pointer shrink-0"
              />
            </div>

            {/* 4. Optional Production Direction & Full Lyria Prompt */}
            <div className="mt-5">
              <label
                htmlFor="lyria-custom-direction"
                className="block text-xs font-semibold text-zinc-300"
              >
                Custom Vocal or Production Notes (Optional)
              </label>
              <input
                id="lyria-custom-direction"
                type="text"
                value={customDirection}
                onChange={(e) => setCustomDirection(e.target.value)}
                placeholder="e.g., Emphasize warm acoustic piano on the Bridge mantra, gospel choir on Final Chorus"
                className="mt-1.5 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3.5 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <label htmlFor="lyria-prompt-textarea" className="font-semibold text-zinc-300">
                  Lyria Generation Prompt &amp; Lyrics Payload
                </label>
                <span className="font-mono-num">{promptText.length} chars</span>
              </div>
              <textarea
                id="lyria-prompt-textarea"
                rows={5}
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-zinc-800 bg-zinc-950 p-3 font-mono text-xs leading-relaxed text-zinc-200 focus:border-amber-500 focus:outline-none"
              />
            </div>

            {/* Status Feedback Banner */}
            {statusMessage && (
              <div
                role="status"
                className={`mt-4 flex items-start gap-2.5 rounded-xl border p-3.5 text-xs leading-relaxed ${
                  statusMessage.type === 'error'
                    ? 'border-rose-500/40 bg-rose-950/30 text-rose-200'
                    : statusMessage.type === 'success'
                    ? 'border-emerald-500/40 bg-emerald-950/30 text-emerald-200'
                    : 'border-amber-500/40 bg-amber-950/25 text-amber-200'
                }`}
              >
                {statusMessage.type === 'error' ? (
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" aria-hidden="true" />
                ) : (
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" aria-hidden="true" />
                )}
                <span>{statusMessage.text}</span>
              </div>
            )}

            {/* Submit Actions */}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                type="submit"
                disabled={isGenerating}
                className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-5 py-2.5 text-sm font-semibold text-zinc-950 hover:bg-amber-400 disabled:opacity-60 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    <span>Generating with {selectedModel}...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" aria-hidden="true" />
                    <span>Generate with Lyria AI</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => handleSynthesizeStudioFallbackTake()}
                className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-800/80 px-4 py-2.5 text-xs font-medium text-zinc-200 hover:bg-zinc-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Music className="h-4 w-4 text-amber-400" aria-hidden="true" />
                <span>Synthesize Instant Studio WAV Take</span>
              </button>
            </div>
          </form>

          {/* Right 5 Columns: Studio Takes Library & Audio Player */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 lg:col-span-5">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div>
                <h3 className="font-display text-lg font-bold text-zinc-100">
                  Recorded Studio Takes
                </h3>
                <p className="text-xs text-zinc-400">
                  Audition and download your generated tracks (.wav)
                </p>
              </div>
              <span className="font-mono-num text-xs text-amber-400">
                {takes.length} {takes.length === 1 ? 'Take' : 'Takes'}
              </span>
            </div>

            <div className="mt-5 space-y-4">
              {takes.map((take) => (
                <div
                  key={take.id}
                  className="rounded-xl border border-zinc-800 bg-zinc-950/80 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-display text-sm font-semibold text-zinc-100">
                        {take.title}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-zinc-400">
                        <span className="font-mono-num text-amber-400">
                          {take.model}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>{take.durationLabel}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono-num">{take.createdAt}</span>
                      </div>
                    </div>

                    <a
                      href={take.audioUrl}
                      download={`${take.title.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.wav`}
                      aria-label={`Download ${take.title}`}
                      className="inline-flex items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-900 px-2.5 py-1.5 text-xs font-medium text-zinc-300 hover:border-zinc-700 hover:text-zinc-100 transition-colors whitespace-nowrap shrink-0"
                    >
                      <Download className="h-3.5 w-3.5 text-amber-400" aria-hidden="true" />
                      <span>WAV</span>
                    </a>
                  </div>

                  <audio
                    controls
                    src={take.audioUrl}
                    onPlay={onPauseMainArrangement}
                    className="mt-3 h-9 w-full"
                  />

                  {take.notes && (
                    <p className="mt-2 text-xs leading-relaxed text-zinc-400">
                      {take.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

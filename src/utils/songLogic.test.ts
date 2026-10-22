import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatTimestamp,
  getActiveSongPosition,
  buildLyriaPrompt,
  validateStepEntry,
  calculatePracticeStats,
  createProceduralAnthemWavBase64,
} from './songLogic';
import { INITIAL_SMALL_STEPS } from '../data/songData';

test('formatTimestamp formats seconds accurately into m:ss', () => {
  assert.equal(formatTimestamp(0), '0:00');
  assert.equal(formatTimestamp(5), '0:05');
  assert.equal(formatTimestamp(65), '1:05');
  assert.equal(formatTimestamp(152), '2:32');
});

test('getActiveSongPosition locates the Bridge mantra at 115s', () => {
  const pos = getActiveSongPosition(115);
  assert.equal(pos.section.id, 'bridge');
  assert.equal(pos.line.id, 'b-2');
  assert.equal(pos.line.isMantra, true);
  assert.ok(pos.line.text.includes("I may be slow, but I won't stop"));
});

test('buildLyriaPrompt includes model duration, artist portrait context, and lyrics', () => {
  const prompt = buildLyriaPrompt({
    model: 'lyria-3-clip-preview',
    sectionId: 'bridge',
    arrangementDescription: 'Warm piano and cello',
    useArtistImage: true,
    customDirection: 'Highlight vocal emotion',
  });

  assert.ok(prompt.includes('Generate a 30-second inspirational pop music clip'));
  assert.ok(prompt.includes('inspired by this artist portrait'));
  assert.ok(prompt.includes("I may be slow, but I won't stop"));
  assert.ok(prompt.includes('Highlight vocal emotion'));
});

test('validateStepEntry enforces non-empty step reflection and lyric selection', () => {
  assert.equal(validateStepEntry({ stepText: '', linkedLine: 'Line' }).valid, false);
  assert.equal(validateStepEntry({ stepText: 'Short', linkedLine: 'Line' }).valid, false);
  assert.equal(
    validateStepEntry({
      stepText: 'Practiced the chorus with full voice today',
      linkedLine: "I'm becoming me, I'm breaking free",
    }).valid,
    true
  );
});

test('calculatePracticeStats computes total steps and mantra counts', () => {
  const stats = calculatePracticeStats(INITIAL_SMALL_STEPS);
  assert.equal(stats.totalSteps, 2);
  assert.equal(stats.mantraUses, 1);
  assert.equal(stats.uniqueDays, 2);
});

test('createProceduralAnthemWavBase64 produces valid RIFF WAVE header', () => {
  const b64 = createProceduralAnthemWavBase64(1, 'anthemic-pop');
  const buf = Buffer.from(b64, 'base64');
  assert.equal(buf.subarray(0, 4).toString('ascii'), 'RIFF');
  assert.equal(buf.subarray(8, 12).toString('ascii'), 'WAVE');
  assert.ok(buf.length > 44);
});

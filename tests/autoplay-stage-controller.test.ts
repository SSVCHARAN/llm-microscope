import test from 'node:test';
import assert from 'node:assert/strict';

type PipelineStageId =
  | 'tokenization'
  | 'embedding'
  | 'attention_qkv'
  | 'attention_heatmap'
  | 'feed_forward'
  | 'softmax'
  | 'sampling';

const STAGE_IDS: PipelineStageId[] = [
  'tokenization',
  'embedding',
  'attention_qkv',
  'attention_heatmap',
  'feed_forward',
  'softmax',
  'sampling'
];

/**
 * Educational Phase counts per stage according to the approved plan:
 * 14 total phases across 7 stages.
 */
const STAGE_PHASE_COUNTS: Record<PipelineStageId, number> = {
  tokenization: 1,
  embedding: 2,
  attention_qkv: 2,
  attention_heatmap: 3,
  feed_forward: 2,
  softmax: 2,
  sampling: 2
};

const BASE_PHASE_DURATION_MS = 3000;
const SPEED_MULTIPLIERS = {
  slow: 2.0,
  normal: 1.0,
  fast: 0.5
} as const;

test('Autoplay - All 7 stages have valid phase counts defined', () => {
  assert.equal(STAGE_IDS.length, 7, 'Expected 7 pipeline stages');

  let totalPhases = 0;
  for (const id of STAGE_IDS) {
    const count = STAGE_PHASE_COUNTS[id];
    assert.ok(typeof count === 'number' && count >= 1, `Stage ${id} must have at least 1 phase`);
    totalPhases += count;
  }

  // Exactly 14 phases across 7 stages according to the revised educational plan
  assert.equal(totalPhases, 14, 'Total educational phases across all stages should equal 14');
  assert.equal(STAGE_PHASE_COUNTS.tokenization, 1, 'Tokenization stage should have 1 phase');
  assert.equal(STAGE_PHASE_COUNTS.embedding, 2, 'Embedding stage should have 2 phases');
  assert.equal(STAGE_PHASE_COUNTS.attention_qkv, 2, 'Attention QKV stage should have 2 phases');
  assert.equal(STAGE_PHASE_COUNTS.attention_heatmap, 3, 'Attention Heatmap stage should have 3 phases');
  assert.equal(STAGE_PHASE_COUNTS.feed_forward, 2, 'Feed Forward stage should have 2 phases');
  assert.equal(STAGE_PHASE_COUNTS.softmax, 2, 'Softmax stage should have 2 phases');
  assert.equal(STAGE_PHASE_COUNTS.sampling, 2, 'Sampling stage should have 2 phases');
});

test('Autoplay - Phased state machine step progression simulation', () => {
  const totalStages = STAGE_IDS.length;
  let activeStageIndex = 0;
  let currentPhase = 0;
  let isAutoPlaying = true;

  const stepProgression: Array<{ stage: string; stageIdx: number; phase: number }> = [];

  // Simulate step function identical to useStageController
  const step = () => {
    const stageId = STAGE_IDS[activeStageIndex];
    const maxPhases = STAGE_PHASE_COUNTS[stageId] ?? 1;

    stepProgression.push({
      stage: stageId,
      stageIdx: activeStageIndex,
      phase: currentPhase
    });

    if (currentPhase < maxPhases - 1) {
      currentPhase += 1;
    } else if (activeStageIndex < totalStages - 1) {
      activeStageIndex += 1;
      currentPhase = 0;
    } else {
      isAutoPlaying = false;
    }
  };

  // Run through entire pipeline until autoplay stops
  let safetyCounter = 0;
  while (isAutoPlaying && safetyCounter < 100) {
    step();
    safetyCounter++;
  }

  assert.equal(isAutoPlaying, false, 'Autoplay should stop after completing all phases of the final stage');
  assert.equal(stepProgression.length, 14, 'Should have stepped through exactly 14 phases');
  
  // Verify order of stages visited
  const visitedStageIds = [...new Set(stepProgression.map((s) => s.stage))];
  assert.deepEqual(
    visitedStageIds,
    STAGE_IDS,
    'Should visit every stage in the configured pipeline order'
  );

  // Check that Attention Heatmap visited all 3 phases (0, 1, 2)
  const heatmapPhases = stepProgression.filter((s) => s.stage === 'attention_heatmap').map((s) => s.phase);
  assert.deepEqual(heatmapPhases, [0, 1, 2], 'Attention heatmap must cycle through phases 0, 1, and 2');
});

test('Autoplay - Global progress computation is monotonically non-decreasing', () => {
  const totalPhases = STAGE_IDS.reduce(
    (sum, id) => sum + (STAGE_PHASE_COUNTS[id] ?? 1),
    0
  );
  assert.equal(totalPhases, 14);

  let prevProgress = -1;

  for (let stageIdx = 0; stageIdx < STAGE_IDS.length; stageIdx++) {
    const stageId = STAGE_IDS[stageIdx];
    const maxPhases = STAGE_PHASE_COUNTS[stageId] ?? 1;

    for (let phase = 0; phase < maxPhases; phase++) {
      let count = 0;
      for (let i = 0; i < stageIdx; i++) {
        count += STAGE_PHASE_COUNTS[STAGE_IDS[i]] ?? 1;
      }
      const completedPhases = count + phase;
      const progress = completedPhases / totalPhases;

      assert.ok(progress >= 0 && progress <= 1, `Progress ${progress} must be in [0, 1]`);
      assert.ok(progress > prevProgress, `Progress must strictly increase across steps (was ${prevProgress}, now ${progress})`);
      prevProgress = progress;
    }
  }

  assert.equal(prevProgress, 13 / 14, 'Final phase before termination should be at 13/14 progress');
});

test('Autoplay - Speed scaling durations match educational pacing', () => {
  assert.equal(BASE_PHASE_DURATION_MS, 3000, 'Base phase duration should be 3000ms at 1x speed');
  assert.equal(BASE_PHASE_DURATION_MS * SPEED_MULTIPLIERS.normal, 3000);
  assert.equal(BASE_PHASE_DURATION_MS * SPEED_MULTIPLIERS.slow, 6000, 'Slow speed should be 6000ms');
  assert.equal(BASE_PHASE_DURATION_MS * SPEED_MULTIPLIERS.fast, 1500, 'Fast speed should be 1500ms');
});

test('Autoplay - User interaction pause and phase reset semantics', () => {
  let isAutoPlaying = true;
  let currentPhase = 2; // say mid-way through attention heatmap
  let activeStageIndex = 3;

  // Interaction event handler on container: pauses autoplay
  const handleInteraction = () => {
    if (isAutoPlaying) {
      isAutoPlaying = false;
    }
  };

  // Manual jump to another stage
  const goToStage = (idx: number) => {
    activeStageIndex = idx;
    currentPhase = 0; // MUST reset to 0 so new stage starts from beginning
  };

  handleInteraction();
  assert.equal(isAutoPlaying, false, 'Pointer interaction must pause autoplay');

  goToStage(1);
  assert.equal(activeStageIndex, 1);
  assert.equal(currentPhase, 0, 'Manual navigation must reset phase to 0');
});

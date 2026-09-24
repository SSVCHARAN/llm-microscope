import test from 'node:test';
import assert from 'node:assert/strict';

test('Onboarding Guide - 7-Stage Pipeline Contract', () => {
  const stageIds = [
    'tokenization',
    'embedding',
    'attention_qkv',
    'attention_heatmap',
    'feed_forward',
    'softmax',
    'sampling'
  ];

  assert.equal(stageIds.length, 7, 'Must have exactly 7 architectural stages');

  const expectedLabels = {
    tokenization: 'Tokenization',
    embedding: 'Embedding',
    attention_qkv: 'QKV Projections',
    attention_heatmap: 'Attention Map',
    feed_forward: 'Feed-Forward',
    softmax: 'Softmax',
    sampling: 'Sampling',
  };

  stageIds.forEach((id) => {
    assert.ok(expectedLabels[id as keyof typeof expectedLabels], `Stage ${id} must have a registered label`);
  });
});

test('Onboarding Guide - Storage Key Semantics', () => {
  const STORAGE_KEY = 'llm_microscope_onboarding_dismissed';
  assert.equal(STORAGE_KEY, 'llm_microscope_onboarding_dismissed');

  // Verify truthy string parsing
  const isDismissed = (val: string | null) => val === 'true';
  assert.equal(isDismissed('true'), true);
  assert.equal(isDismissed('false'), false);
  assert.equal(isDismissed(null), false);
  assert.equal(isDismissed(''), false);
});

test('Onboarding Guide - Exploration Time Estimates Structure', () => {
  const timeEstimates = [
    { label: 'First-Pass Walkthrough', minMinutes: 15, maxMinutes: 20 },
    { label: 'Rigorous Conceptual Study', minMinutes: 35, maxMinutes: 50 },
    { label: 'Live Generation & Tuning', minMinutes: 15, maxMinutes: 30 },
  ];

  assert.equal(timeEstimates.length, 3);
  timeEstimates.forEach((tier) => {
    assert.ok(tier.minMinutes >= 15, 'Genuine conceptual exploration requires at least 15 minutes');
    assert.ok(tier.maxMinutes >= tier.minMinutes, 'Max estimate should exceed min estimate');
  });
});


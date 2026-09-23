import test from 'node:test';
import assert from 'node:assert/strict';

interface Candidate {
  token: string;
  logit: number;
  prob: number;
}

function applyTopK(candidates: Candidate[], k: number): { filtered: Candidate[]; truncatedOut: Candidate[] } {
  const sorted = [...candidates].sort((a, b) => b.prob - a.prob);
  const safeK = Math.min(Math.max(1, k), sorted.length);
  const kept = sorted.slice(0, safeK);
  const truncatedOut = sorted.slice(safeK);

  const sumKeptProb = kept.reduce((acc, c) => acc + c.prob, 0);
  const renormalized = kept.map((c) => ({
    ...c,
    prob: sumKeptProb > 0 ? c.prob / sumKeptProb : 1 / kept.length
  }));

  return { filtered: renormalized, truncatedOut };
}

function applyTopP(candidates: Candidate[], p: number): { filtered: Candidate[]; truncatedOut: Candidate[] } {
  const sorted = [...candidates].sort((a, b) => b.prob - a.prob);
  const safeP = Math.min(Math.max(0.01, p), 1.0);

  let cumulative = 0;
  const kept: Candidate[] = [];
  const truncatedOut: Candidate[] = [];

  for (const c of sorted) {
    if (kept.length === 0 || cumulative < safeP) {
      kept.push(c);
      cumulative += c.prob;
    } else {
      truncatedOut.push(c);
    }
  }

  const sumKeptProb = kept.reduce((acc, c) => acc + c.prob, 0);
  const renormalized = kept.map((c) => ({
    ...c,
    prob: sumKeptProb > 0 ? c.prob / sumKeptProb : 1 / kept.length
  }));

  return { filtered: renormalized, truncatedOut };
}

test('Top-K - Filters exactly K candidates and renormalizes probabilities to 1.0', () => {
  const candidates: Candidate[] = [
    { token: 'mat', logit: 3.5, prob: 0.50 },
    { token: 'rug', logit: 2.8, prob: 0.25 },
    { token: 'floor', logit: 2.2, prob: 0.15 },
    { token: 'couch', logit: 1.5, prob: 0.07 },
    { token: 'bed', logit: 0.8, prob: 0.03 }
  ];

  const { filtered, truncatedOut } = applyTopK(candidates, 3);

  assert.equal(filtered.length, 3);
  assert.equal(truncatedOut.length, 2);
  assert.deepEqual(filtered.map((c) => c.token), ['mat', 'rug', 'floor']);
  assert.deepEqual(truncatedOut.map((c) => c.token), ['couch', 'bed']);

  const sum = filtered.reduce((acc, c) => acc + c.prob, 0);
  assert.ok(Math.abs(sum - 1.0) < 1e-6, `Renormalized sum was ${sum}`);
  // mat was 0.50 out of 0.90 total kept => 0.50 / 0.90 ≈ 0.5555
  assert.ok(Math.abs(filtered[0].prob - 0.50 / 0.90) < 1e-4);
});

test('Top-K - K=1 behaves as pure Greedy (Argmax) sampling', () => {
  const candidates: Candidate[] = [
    { token: 'apple', logit: 1.0, prob: 0.2 },
    { token: 'banana', logit: 3.0, prob: 0.7 },
    { token: 'cherry', logit: 0.5, prob: 0.1 }
  ];

  const { filtered } = applyTopK(candidates, 1);
  assert.equal(filtered.length, 1);
  assert.equal(filtered[0].token, 'banana');
  assert.equal(filtered[0].prob, 1.0);
});

test('Top-P - Nucleus thresholding includes tokens up to cumulative sum P', () => {
  const candidates: Candidate[] = [
    { token: 'the', logit: 4.0, prob: 0.45 },
    { token: 'a', logit: 3.8, prob: 0.35 },
    { token: 'an', logit: 2.0, prob: 0.12 },
    { token: 'one', logit: 1.2, prob: 0.08 }
  ];

  // With p=0.80, top tokens 'the' (0.45) + 'a' (0.35) = 0.80.
  const { filtered, truncatedOut } = applyTopP(candidates, 0.80);
  assert.equal(filtered.length, 2);
  assert.deepEqual(filtered.map((c) => c.token), ['the', 'a']);
  assert.deepEqual(truncatedOut.map((c) => c.token), ['an', 'one']);

  const sum = filtered.reduce((acc, c) => acc + c.prob, 0);
  assert.ok(Math.abs(sum - 1.0) < 1e-6);
});

test('Top-P - P=1.0 keeps all candidates', () => {
  const candidates: Candidate[] = [
    { token: 'x', logit: 2.0, prob: 0.6 },
    { token: 'y', logit: 1.0, prob: 0.4 }
  ];

  const { filtered, truncatedOut } = applyTopP(candidates, 1.0);
  assert.equal(filtered.length, 2);
  assert.equal(truncatedOut.length, 0);
});

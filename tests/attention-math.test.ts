import test from 'node:test';
import assert from 'node:assert/strict';

function dotProduct(a: number[], b: number[]): number {
  return a.reduce((sum, val, idx) => sum + val * b[idx], 0);
}

function computeAttention(Q: number[][], K: number[][], V: number[][], isCausal = true): { scores: number[][]; weights: number[][]; output: number[][] } {
  const seqLen = Q.length;
  const d_k = Q[0].length;
  const sqrtDk = Math.sqrt(d_k);

  const rawScores: number[][] = [];
  const weights: number[][] = [];

  for (let i = 0; i < seqLen; i++) {
    const rowScores: number[] = [];
    for (let j = 0; j < seqLen; j++) {
      if (isCausal && j > i) {
        rowScores.push(-Infinity);
      } else {
        const dot = dotProduct(Q[i], K[j]);
        rowScores.push(dot / sqrtDk);
      }
    }
    rawScores.push(rowScores);

    // Softmax over valid keys for token i
    const validScores = rowScores.filter((s) => s !== -Infinity);
    const maxScore = Math.max(...validScores);
    const exps = rowScores.map((s) => (s === -Infinity ? 0 : Math.exp(s - maxScore)));
    const sumExps = exps.reduce((acc, curr) => acc + curr, 0);
    weights.push(exps.map((val) => (sumExps > 0 ? val / sumExps : 0)));
  }

  // Attention Output: Z = Weights * V
  const output: number[][] = [];
  for (let i = 0; i < seqLen; i++) {
    const d_v = V[0].length;
    const z_i = new Array(d_v).fill(0);
    for (let j = 0; j < seqLen; j++) {
      const w = weights[i][j];
      for (let dim = 0; dim < d_v; dim++) {
        z_i[dim] += w * V[j][dim];
      }
    }
    output.push(z_i);
  }

  return { scores: rawScores, weights, output };
}

test('Attention - Causal mask prevents attending to future tokens (upper triangle is zero)', () => {
  const Q = [
    [1, 0],
    [0, 1],
    [1, 1]
  ];
  const K = [
    [1, 0],
    [0, 1],
    [1, 1]
  ];
  const V = [
    [1, 2],
    [3, 4],
    [5, 6]
  ];

  const { weights } = computeAttention(Q, K, V, true);

  // Row 0 can only attend to index 0
  assert.equal(weights[0][0], 1.0);
  assert.equal(weights[0][1], 0.0);
  assert.equal(weights[0][2], 0.0);

  // Row 1 can attend to index 0 and 1, but NOT index 2
  assert.ok(weights[1][0] > 0);
  assert.ok(weights[1][1] > 0);
  assert.equal(weights[1][2], 0.0);

  // Row 2 can attend to all 3
  assert.ok(weights[2][0] > 0);
  assert.ok(weights[2][1] > 0);
  assert.ok(weights[2][2] > 0);

  // Every row's active weights sum to 1.0
  weights.forEach((row, rIdx) => {
    const rowSum = row.reduce((a, b) => a + b, 0);
    assert.ok(Math.abs(rowSum - 1.0) < 1e-6, `Row ${rIdx} sum was ${rowSum}`);
  });
});

test('Attention - Output vector matches weighted linear combination of Value vectors', () => {
  const Q = [[1, 0]];
  const K = [[1, 0]];
  const V = [[2.5, 4.0]];

  const { output } = computeAttention(Q, K, V, true);

  // Single token attends 100% to itself
  assert.equal(output.length, 1);
  assert.ok(Math.abs(output[0][0] - 2.5) < 1e-6);
  assert.ok(Math.abs(output[0][1] - 4.0) < 1e-6);
});

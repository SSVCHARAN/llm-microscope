import test from 'node:test';
import assert from 'node:assert/strict';

/**
 * Numerically stable Softmax function:
 * P(z_i) = exp((z_i - max(z)) / T) / sum_j exp((z_j - max(z)) / T)
 */
function stableSoftmax(logits: number[], temperature: number): number[] {
  const safeTemp = Math.max(0.01, temperature);
  const scaledLogits = logits.map((l) => l / safeTemp);
  const maxScaled = Math.max(...scaledLogits);
  const exps = scaledLogits.map((l) => Math.exp(l - maxScaled));
  const sumExps = exps.reduce((acc, curr) => acc + curr, 0);
  return exps.map((val) => val / sumExps);
}

test('Softmax - Standard temperature (T=1.0) sums to 1.0', () => {
  const logits = [2.5, 1.2, 0.1, -1.0, 3.8];
  const probs = stableSoftmax(logits, 1.0);

  const sum = probs.reduce((acc, p) => acc + p, 0);
  assert.ok(Math.abs(sum - 1.0) < 1e-6, `Sum was ${sum}, expected 1.0`);
  probs.forEach((p) => {
    assert.ok(p >= 0 && p <= 1, `Probability ${p} out of range [0, 1]`);
  });
  // Highest logit (3.8 at index 4) should have highest probability
  assert.equal(probs.indexOf(Math.max(...probs)), 4);
});

test('Softmax - Extreme low temperature (T=0.01) approaches argmax/one-hot without NaN or Infinity', () => {
  const logits = [2.0, 5.0, 1.0];
  const probs = stableSoftmax(logits, 0.01);

  assert.ok(!probs.some(isNaN), 'Should not contain NaN');
  assert.ok(!probs.some((p) => !isFinite(p)), 'Should not contain Infinity');

  // Argmax token (index 1) should capture virtually 100% of the distribution
  assert.ok(probs[1] > 0.9999, `Argmax probability was ${probs[1]}, expected > 0.9999`);
  assert.ok(probs[0] < 0.0001, `Non-argmax probability was ${probs[0]}, expected < 0.0001`);
  assert.ok(probs[2] < 0.0001, `Non-argmax probability was ${probs[2]}, expected < 0.0001`);
});

test('Softmax - Massive positive logits (overflow test: z > 1000) avoids Infinity overflow', () => {
  const hugeLogits = [1000.0, 1005.0, 995.0];
  const probs = stableSoftmax(hugeLogits, 1.0);

  assert.ok(!probs.some(isNaN), 'Huge logits should not produce NaN');
  assert.ok(!probs.some((p) => !isFinite(p)), 'Huge logits should not produce Infinity');

  const sum = probs.reduce((acc, p) => acc + p, 0);
  assert.ok(Math.abs(sum - 1.0) < 1e-6, `Sum was ${sum}, expected 1.0`);
  assert.equal(probs.indexOf(Math.max(...probs)), 1);
});

test('Softmax - Extreme high temperature (T=20.0) approaches uniform distribution', () => {
  const logits = [2.0, 3.0, 4.0, 5.0];
  const probs = stableSoftmax(logits, 20.0);

  const expectedUniform = 1 / logits.length;
  probs.forEach((p) => {
    // Should be close to 0.25
    assert.ok(Math.abs(p - expectedUniform) < 0.08, `Probability ${p} deviated from uniform ${expectedUniform}`);
  });
});

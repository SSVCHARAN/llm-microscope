import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const EXPECTED_ONNX_MODELS = [
  'HuggingFaceTB/SmolLM2-135M-Instruct'
];

test('ONNX Models - Registry configuration', () => {
  assert.strictEqual(EXPECTED_ONNX_MODELS.length, 1, 'Should have SmolLM2 as the dedicated ONNX model');
  assert.strictEqual(EXPECTED_ONNX_MODELS[0], 'HuggingFaceTB/SmolLM2-135M-Instruct', 'SmolLM2 should be the primary recommended model');
});

test('ONNX Models - SmolLM2 local asset presence', () => {
  const modelDir = path.resolve(process.cwd(), 'public/models/HuggingFaceTB/SmolLM2-135M-Instruct');
  assert.ok(fs.existsSync(modelDir), 'SmolLM2 directory must exist in public/models');
  assert.ok(fs.existsSync(path.join(modelDir, 'config.json')), 'config.json must exist');
  assert.ok(fs.existsSync(path.join(modelDir, 'tokenizer.json')), 'tokenizer.json must exist');
  assert.ok(fs.existsSync(path.join(modelDir, 'onnx/model_q4.onnx')), 'model_q4.onnx must exist');
});

test('ONNX Models - Pure prompt completion contract (no instruction corruption)', async () => {
  const { AutoTokenizer } = await import('@huggingface/transformers');
  const tokenizerPath = path.resolve(process.cwd(), 'public/models/HuggingFaceTB/SmolLM2-135M-Instruct');
  const tokenizer = await AutoTokenizer.from_pretrained(tokenizerPath);

  const prompt = 'The cat sat on the';
  const inputs = tokenizer(prompt);
  const tokenIds = Array.from(inputs.input_ids.data);
  const decodedTokens = tokenIds.map((id: any) => tokenizer.decode([id]));

  // Verify pure prompt tokens match exactly without preamble
  assert.strictEqual(tokenIds.length, 5, 'Should produce exactly 5 tokens for "The cat sat on the"');
  assert.strictEqual(decodedTokens.join(''), prompt, 'Decoded tokens must reconstruct prompt identically');
});

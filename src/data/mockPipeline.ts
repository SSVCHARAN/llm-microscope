import { MockPipelineData, StageDefinition } from '../types';

export const STAGES_CONFIG: StageDefinition[] = [
  {
    id: 'tokenization',
    stepNumber: 1,
    title: 'Tokenization (Byte-Pair Encoding)',
    tagline: 'Text is chopped into numerical IDs',
    summary:
      'Neural networks cannot read raw English words. The Byte-Pair Encoding (BPE) tokenizer chops text into subwords, whitespace-prefixed chunks, and punctuation, assigning each an integer ID in a fixed 50,257 vocabulary.',
    howItWorks: [
      '1. Spaces are encoded as specific prefix characters (e.g., Ġ or leading space in BPE).',
      '2. Common words become single tokens ("The", "cat"). Rare words are split into syllables or characters.',
      '3. Every unique token maps to an integer ID between 0 and 50,256.'
    ],
    keyInsight:
      'The model never sees letters or words. It receives a 1D sequence of integers: [464, 3797, 3332, 319, 262].'
  },
  {
    id: 'embedding',
    stepNumber: 2,
    title: 'Embedding Lookup + Positional Encoding',
    tagline: 'Integers become continuous geometry in high-dimensional space',
    summary:
      'Each token ID pulls a learned 768-dimensional coordinates vector from the Embedding Matrix (W_E). Because Transformers process all positions simultaneously with no innate sense of time or order, Positional Encodings (sinusoidal vectors) are added to tell the model where each token sits.',
    howItWorks: [
      '1. Token ID looks up a vector of weights: x_token = EmbeddingTable[ID].',
      '2. Positional encoding adds vector geometry based on index (pos = 0, 1, 2...).',
      '3. Combined Vector = Token Embedding + Positional Encoding.'
    ],
    keyInsight:
      'Semantic meaning becomes distance and angles in space: words with similar meanings point in similar directions.'
  },
  {
    id: 'attention_qkv',
    stepNumber: 3,
    title: 'Self-Attention: Q, K, V Projections',
    tagline: 'Queries ask questions, Keys provide matches, Values deliver content',
    summary:
      'Each token vector is multiplied by three learned projection matrices (W_Q, W_K, W_V) to produce three new vectors per token: Query ("What am I looking for?"), Key ("What info do I hold?"), and Value ("What content do I pass along?").',
    howItWorks: [
      '1. Query (Q) = Input × W_Q (the search query).',
      '2. Key (K) = Input × W_K (the matching index key).',
      '3. Value (V) = Input × W_V (the semantic payload to transmit).'
    ],
    keyInsight:
      'Q and K determine WHERE information flows. V determines WHAT information flows.'
  },
  {
    id: 'attention_heatmap',
    stepNumber: 4,
    title: 'Attention Heatmap & Causal Masking',
    tagline: 'Calculating relational weights: Who attends to whom?',
    summary:
      'Attention scores are computed via dot product: Score(i, j) = (Q_i · K_j) / sqrt(d_k). A Causal Mask forces future tokens to negative infinity so the model cannot cheat by looking ahead. Softmax turns scores into percentage weights that sum to 100% across the row.',
    howItWorks: [
      '1. Raw Attention Score = Dot product of Q_i and K_j scaled by 1/√d.',
      '2. Causal Mask: Set all future positions (j > i) to -∞.',
      '3. Softmax: Normalize each row to sum to 1.0 (probabilities of attention).'
    ],
    keyInsight:
      'Notice the strong link between "sat" and "cat": the verb retrieves context directly from the subject!'
  },
  {
    id: 'feed_forward',
    stepNumber: 5,
    title: 'Feed-Forward Network (MLP)',
    tagline: 'Non-linear reasoning and factual knowledge retrieval',
    summary:
      'After attention mixes tokens together, each token independently passes through a multi-layer perceptron: Linear Projection (4x expansion) → Non-Linear Activation (GELU / ReLU) → Down-Projection. This is where the model stores factual associations and abstract features.',
    howItWorks: [
      '1. Expands 768 dimensions to 3072 hidden dimensions (4× expansion).',
      '2. Applies non-linear activation (GELU) to allow complex decision boundaries.',
      '3. Compresses back to 768 dimensions and adds Residual Connection (x + FFN(x)).'
    ],
    keyInsight:
      'Attention routes information between tokens; the Feed-Forward layers process and compute upon that information.'
  },
  {
    id: 'softmax',
    stepNumber: 6,
    title: 'Unembedding, Logits & Softmax',
    tagline: 'Projecting hidden space back into 50,257 vocabulary probabilities',
    summary:
      'The final hidden vector for the last position is multiplied by the Unembedding Matrix (W_U). This produces a raw, unnormalized score ("logit") for every single word in the vocabulary (50,257 numbers). Softmax converts these logits into calibrated percentages.',
    howItWorks: [
      '1. Logits = Final_Vector × Unembedding_Matrix (yields 50,257 values).',
      '2. Softmax Formula: P(token_i) = exp(logit_i / T) / ∑ exp(logit_j / T).',
      '3. Every candidate gets a probability between 0% and 100%.'
    ],
    keyInsight:
      'Logits are arbitrary unbounded scores (e.g. +7.83, -2.10). Softmax is the mathematical bridge that turns raw activations into real-world probabilities.'
  },
  {
    id: 'sampling',
    stepNumber: 7,
    title: 'Sampling & Generation (Temperature / Top-K / Top-P)',
    tagline: 'The roll of the dice that chooses the next token',
    summary:
      'The model does not simply pick the highest probability token (that would cause repetitive loops). Instead, it applies Temperature (to flatten or sharpen the distribution), Top-K / Top-P filtering (to prune garbage tail words), and rolls a weighted random sample.',
    howItWorks: [
      '1. Temperature (T): High T = wild creativity; Low T = conservative determinism.',
      '2. Top-K Filter: Keep only the K highest probability tokens (e.g., K=40).',
      '3. Top-P (Nucleus): Keep smallest set whose cumulative probability reaches P (e.g., 0.90).',
      '4. Weighted Dice Roll: Randomly sample next token based on filtered distribution.'
    ],
    keyInsight:
      '"The cat sat on the" → The winner is " mat" (42.1%). The token is appended, and the whole cycle repeats!'
  }
];

export const MOCK_DATA: MockPipelineData = {
  prompt: 'The cat sat on the',
  outputToken: ' mat',
  resultingText: 'The cat sat on the mat',
  tokens: [
    { id: 464, text: 'The', display: 'The', color: 'indigo', index: 0 },
    { id: 3797, text: ' cat', display: '␣cat', color: 'emerald', index: 1 },
    { id: 3332, text: ' sat', display: '␣sat', color: 'cyan', index: 2 },
    { id: 319, text: ' on', display: '␣on', color: 'amber', index: 3 },
    { id: 262, text: ' the', display: '␣the', color: 'rose', index: 4 }
  ],
  embeddings: [
    {
      tokenId: 464,
      tokenText: 'The',
      position: 0,
      tokenVector: [0.34, -0.72, 0.51, 0.18, -0.64, 0.29, 0.88, -0.15],
      posVector: [0.00, 1.00, 0.00, 1.00, 0.00, 1.00, 0.00, 1.00],
      combinedVector: [0.34, 0.28, 0.51, 1.18, -0.64, 1.29, 0.88, 0.85]
    },
    {
      tokenId: 3797,
      tokenText: ' cat',
      position: 1,
      tokenVector: [0.85, 0.42, -0.61, 0.93, 0.12, -0.45, 0.74, 0.31],
      posVector: [0.84, 0.54, 0.84, 0.54, 0.84, 0.54, 0.84, 0.54],
      combinedVector: [1.69, 0.96, 0.23, 1.47, 0.96, 0.09, 1.58, 0.85]
    },
    {
      tokenId: 3332,
      tokenText: ' sat',
      position: 2,
      tokenVector: [-0.19, 0.63, 0.44, -0.32, 0.77, 0.52, -0.28, 0.66],
      posVector: [0.91, -0.42, 0.91, -0.42, 0.91, -0.42, 0.91, -0.42],
      combinedVector: [0.72, 0.21, 1.35, -0.74, 1.68, 0.10, 0.63, 0.24]
    },
    {
      tokenId: 319,
      tokenText: ' on',
      position: 3,
      tokenVector: [0.12, -0.38, 0.29, 0.45, -0.51, 0.18, 0.33, -0.41],
      posVector: [0.14, -0.99, 0.14, -0.99, 0.14, -0.99, 0.14, -0.99],
      combinedVector: [0.26, -1.37, 0.43, -0.54, -0.37, -0.81, 0.47, -1.40]
    },
    {
      tokenId: 262,
      tokenText: ' the',
      position: 4,
      tokenVector: [0.31, -0.68, 0.49, 0.15, -0.59, 0.26, 0.82, -0.19],
      posVector: [-0.76, -0.65, -0.76, -0.65, -0.76, -0.65, -0.76, -0.65],
      combinedVector: [-0.45, -1.33, -0.27, -0.50, -1.35, -0.39, 0.06, -0.84]
    }
  ],
  qkv: [
    {
      tokenId: 464,
      tokenText: 'The',
      q: [0.21, -0.14, 0.55, 0.32],
      k: [0.18, -0.09, 0.48, 0.29],
      v: [0.41, 0.33, -0.21, 0.82]
    },
    {
      tokenId: 3797,
      tokenText: ' cat',
      q: [0.89, 0.45, -0.12, 0.64],
      k: [0.81, 0.39, -0.18, 0.58],
      v: [0.73, -0.55, 0.62, 0.19]
    },
    {
      tokenId: 3332,
      tokenText: ' sat',
      q: [0.65, 0.72, 0.31, -0.28],
      k: [0.59, 0.68, 0.27, -0.22],
      v: [-0.15, 0.84, 0.47, 0.33]
    },
    {
      tokenId: 319,
      tokenText: ' on',
      q: [0.15, 0.22, 0.68, 0.11],
      k: [0.12, 0.19, 0.61, 0.09],
      v: [0.28, 0.12, -0.39, 0.51]
    },
    {
      tokenId: 262,
      tokenText: ' the',
      q: [0.42, 0.11, 0.77, 0.35],
      k: [0.38, 0.08, 0.72, 0.31],
      v: [0.55, 0.29, -0.14, 0.69]
    }
  ],
  qkvWeights: {
    wQ: [
      [0.42, 0.15, -0.28, 0.31],
      [-0.18, 0.54, 0.39, -0.12],
      [0.25, -0.32, 0.48, 0.22],
      [0.11, 0.29, -0.15, 0.63]
    ],
    wK: [
      [0.38, 0.12, -0.22, 0.28],
      [-0.14, 0.49, 0.35, -0.09],
      [0.21, -0.27, 0.42, 0.19],
      [0.08, 0.24, -0.11, 0.57]
    ],
    wV: [
      [0.55, -0.21, 0.44, 0.18],
      [0.31, 0.62, -0.19, 0.35],
      [-0.12, 0.45, 0.58, -0.27],
      [0.29, -0.15, 0.33, 0.48]
    ]
  },
  attentionHeads: [
    {
      headIndex: 0,
      name: 'Head 1: Syntactic & Sequential',
      description: 'Tracks grammar and previous-token dependencies.',
      rawScores: [
        [1.82, -Infinity, -Infinity, -Infinity, -Infinity],
        [0.64, 2.15, -Infinity, -Infinity, -Infinity],
        [0.31, 1.48, 2.30, -Infinity, -Infinity],
        [0.22, 0.55, 1.92, 1.74, -Infinity],
        [0.15, 0.42, 0.88, 2.45, 1.95]
      ],
      matrix: [
        [1.00, 0.00, 0.00, 0.00, 0.00],
        [0.18, 0.82, 0.00, 0.00, 0.00],
        [0.08, 0.28, 0.64, 0.00, 0.00],
        [0.06, 0.09, 0.48, 0.37, 0.00],
        [0.03, 0.06, 0.11, 0.52, 0.28]
      ]
    },
    {
      headIndex: 1,
      name: 'Head 2: Semantic Core (Subject-Verb-Prep)',
      description: 'Connects the physical action (sat) directly to the subject (cat).',
      rawScores: [
        [1.50, -Infinity, -Infinity, -Infinity, -Infinity],
        [0.45, 1.90, -Infinity, -Infinity, -Infinity],
        [0.10, 3.42, 1.85, -Infinity, -Infinity],
        [0.05, 1.65, 2.88, 1.40, -Infinity],
        [0.02, 2.80, 1.95, 1.15, 0.90]
      ],
      matrix: [
        [1.00, 0.00, 0.00, 0.00, 0.00],
        [0.19, 0.81, 0.00, 0.00, 0.00],
        [0.04, 0.74, 0.22, 0.00, 0.00],
        [0.02, 0.18, 0.62, 0.18, 0.00],
        [0.02, 0.54, 0.24, 0.12, 0.08]
      ]
    }
  ],
  ffnNodes: [
    // Input layer (4 nodes)
    { id: 'in_0', label: 'x₁', layer: 0, value: 0.72, postRelu: 0.72 },
    { id: 'in_1', label: 'x₂', layer: 0, value: -0.45, postRelu: -0.45 },
    { id: 'in_2', label: 'x₃', layer: 0, value: 1.14, postRelu: 1.14 },
    { id: 'in_3', label: 'x₄', layer: 0, value: -0.88, postRelu: -0.88 },
    // Hidden layer (8 expanded nodes, post-ReLU / GELU)
    { id: 'h_0', label: 'h₁', layer: 1, value: 1.85, postRelu: 1.85 },
    { id: 'h_1', label: 'h₂', layer: 1, value: -0.92, postRelu: 0.00 },
    { id: 'h_2', label: 'h₃', layer: 1, value: 2.41, postRelu: 2.41 },
    { id: 'h_3', label: 'h₄', layer: 1, value: -1.33, postRelu: 0.00 },
    { id: 'h_4', label: 'h₅', layer: 1, value: 0.65, postRelu: 0.65 },
    { id: 'h_5', label: 'h₆', layer: 1, value: 3.12, postRelu: 3.12 },
    { id: 'h_6', label: 'h₇', layer: 1, value: -0.41, postRelu: 0.00 },
    { id: 'h_7', label: 'h₈', layer: 1, value: 1.28, postRelu: 1.28 },
    // Output layer (4 nodes)
    { id: 'out_0', label: 'y₁', layer: 2, value: 1.44, postRelu: 1.44 },
    { id: 'out_1', label: 'y₂', layer: 2, value: 0.89, postRelu: 0.89 },
    { id: 'out_2', label: 'y₃', layer: 2, value: -0.12, postRelu: -0.12 },
    { id: 'out_3', label: 'y₄', layer: 2, value: 2.05, postRelu: 2.05 }
  ],
  ffnConnections: [
    { from: 'in_0', to: 'h_0', weight: 0.85 },
    { from: 'in_0', to: 'h_2', weight: 0.62 },
    { from: 'in_1', to: 'h_1', weight: -0.74 },
    { from: 'in_2', to: 'h_3', weight: -0.91 },
    { from: 'in_2', to: 'h_5', weight: 0.94 },
    { from: 'in_3', to: 'h_6', weight: -0.48 },
    { from: 'in_3', to: 'h_7', weight: 0.77 },
    { from: 'h_0', to: 'out_0', weight: 0.88 },
    { from: 'h_2', to: 'out_0', weight: 0.73 },
    { from: 'h_5', to: 'out_1', weight: 0.95 },
    { from: 'h_4', to: 'out_3', weight: 0.68 },
    { from: 'h_7', to: 'out_3', weight: 0.82 }
  ],
  logits: [
    { rank: 1, token: ' mat', display: '␣mat', logit: 7.83, probability: 0.421, logprob: -0.865, isWinner: true },
    { rank: 2, token: ' floor', display: '␣floor', logit: 6.42, probability: 0.103, logprob: -2.273 },
    { rank: 3, token: ' rug', display: '␣rug', logit: 6.15, probability: 0.079, logprob: -2.538 },
    { rank: 4, token: ' bed', display: '␣bed', logit: 5.88, probability: 0.060, logprob: -2.813 },
    { rank: 5, token: ' couch', display: '␣couch', logit: 5.61, probability: 0.046, logprob: -3.079 },
    { rank: 6, token: ' roof', display: '␣roof', logit: 5.34, probability: 0.035, logprob: -3.352 },
    { rank: 7, token: ' table', display: '␣table', logit: 5.12, probability: 0.028, logprob: -3.575 },
    { rank: 8, token: ' ground', display: '␣ground', logit: 4.88, probability: 0.022, logprob: -3.816 }
  ],
  samplingParams: {
    temperature: 0.7,
    topK: 40,
    topP: 0.90
  }
};

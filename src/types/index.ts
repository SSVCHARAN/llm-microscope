export interface TokenData {
  token: string;
  logprob: number;
  bytes: number[] | null;
}

export interface TokenChoice extends TokenData {
  top_logprobs: TokenData[];
}

export interface GenerationStep {
  index: number;
  tokenText: string;
  probability: number;
  logProbability: number;
  rank: number;
  alternatives: { token: string; probability: number; logProbability: number }[];
  timestamp: number;
  deltaLatency: number;
  cumulativeLatency: number;
  isWhitespace: boolean;
}

export interface GenerationMetrics {
  timeToFirstToken: number | null;
  totalTime: number | null;
  generatedTokens: number;
  promptTokens: number | null;
  tokensPerSecond: number | null;
  averageLatency: number | null;
  currentLatency: number | null;
}

export interface ApiEvent {
  id: string;
  type: string;
  data: any;
  timestamp: number;
}

// -------------------------------------------------------------
// Transformer Educational Pipeline Types
// -------------------------------------------------------------

export type PipelineStageId =
  | 'tokenization'
  | 'embedding'
  | 'attention_qkv'
  | 'attention_heatmap'
  | 'feed_forward'
  | 'softmax'
  | 'sampling';

export interface StageDefinition {
  id: PipelineStageId;
  stepNumber: number;
  title: string;
  tagline: string;
  summary: string;
  howItWorks: string[];
  keyInsight: string;
}

export interface TokenItem {
  id: number;
  text: string;
  display: string;
  color: string;
  index: number;
}

export interface EmbeddingVector {
  tokenId: number;
  tokenText: string;
  position: number;
  tokenVector: number[];
  posVector: number[];
  combinedVector: number[];
}

export interface QKVData {
  tokenId: number;
  tokenText: string;
  q: number[];
  k: number[];
  v: number[];
}

export interface AttentionHeadData {
  headIndex: number;
  name: string;
  description: string;
  matrix: number[][]; // N x N attention weights (0.0 to 1.0)
  rawScores: number[][]; // Q * K^T / sqrt(d)
}

export interface FFNCalculationStep {
  fromNode: string;
  inputValue: number;
  weight: number;
  product: number;
}

export interface FFNLayerNode {
  id: string;
  label: string;
  layer: number;
  value: number;
  postRelu: number;
  name?: string;
  role?: string;
  stageContext?: string;
  bias?: number;
  calculationSteps?: FFNCalculationStep[];
}

export interface AttentionOutputData {
  tokenText: string;
  position: number;
  originalVector: number[];
  attentionContextVector: number[];
  combinedInputVector: number[];
  breakdown: {
    sourceToken: string;
    weight: number;
    contribution: number[];
  }[];
}

export interface CandidateLogit {
  rank: number;
  token: string;
  display: string;
  logit: number;
  probability: number;
  logprob: number;
  isWinner?: boolean;
}

export interface QKVProjectionWeights {
  wQ: number[][];
  wK: number[][];
  wV: number[][];
}

export interface MockPipelineData {
  prompt: string;
  outputToken: string;
  resultingText: string;
  tokens: TokenItem[];
  embeddings: EmbeddingVector[];
  qkv: QKVData[];
  qkvWeights: QKVProjectionWeights;
  attentionHeads: AttentionHeadData[];
  attentionOutput: AttentionOutputData;
  ffnNodes: FFNLayerNode[];
  ffnConnections: { from: string; to: string; weight: number }[];
  logits: CandidateLogit[];
  samplingParams: {
    temperature: number;
    topK: number;
    topP: number;
  };
}

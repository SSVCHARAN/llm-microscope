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

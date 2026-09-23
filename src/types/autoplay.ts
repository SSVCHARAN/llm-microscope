import type { PipelineStageId } from './index';

/**
 * Phase Counts Per Stage
 *
 * Each number defines how many educational phases a stage contains.
 * Stage components and the stage controller use this to progressively reveal content.
 * Total phases: 14 across 7 stages.
 */
export const STAGE_PHASE_COUNTS: Record<PipelineStageId, number> = {
  tokenization: 1,
  embedding: 2,
  attention_qkv: 2,
  attention_heatmap: 3,
  feed_forward: 2,
  softmax: 2,
  sampling: 2,
};

export interface StagePhaseProps {
  /** Current educational micro-phase within the stage (0-indexed).
   * When undefined, all content is displayed immediately (manual navigation mode).
   */
  phase?: number;
}

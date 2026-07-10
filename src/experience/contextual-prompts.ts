import type { SemanticMessage } from '../accessibility/announcements'

export interface ContextualPromptCandidate {
  readonly id: string
  readonly titleKey: string
  readonly bodyKey: string
  readonly actionLabelKey?: string
  readonly announcementKey: string
  readonly priority: number
  readonly available: boolean
}

export interface ContextualPromptState {
  readonly enabled: boolean
  readonly dismissedIds: readonly string[]
}

export interface ContextualPromptSelection {
  readonly status: 'off' | 'empty' | 'ready'
  readonly prompt: ContextualPromptCandidate | null
}

function priority(candidate: ContextualPromptCandidate): number {
  return Number.isFinite(candidate.priority) ? candidate.priority : 0
}

function comparePrompts(left: ContextualPromptCandidate, right: ContextualPromptCandidate): number {
  const priorityDifference = priority(right) - priority(left)
  if (priorityDifference !== 0) return priorityDifference
  if (left.id < right.id) return -1
  if (left.id > right.id) return 1
  return 0
}

/** Selects at most one first-use prompt from explicit caller state. */
export function selectContextualPrompt(
  candidates: readonly ContextualPromptCandidate[],
  state: ContextualPromptState,
): ContextualPromptSelection {
  if (!state.enabled) return { status: 'off', prompt: null }
  const dismissed = new Set(state.dismissedIds)
  const prompt = candidates
    .filter((candidate) => candidate.available && candidate.id.length > 0 && !dismissed.has(candidate.id))
    .sort(comparePrompts)[0] ?? null
  return { status: prompt ? 'ready' : 'empty', prompt }
}

/** Dismissal is caller-owned and stable regardless of input order. */
export function dismissContextualPrompt(
  state: ContextualPromptState,
  promptId: string,
): ContextualPromptState {
  if (!promptId || state.dismissedIds.includes(promptId)) return state
  return {
    enabled: state.enabled,
    dismissedIds: [...state.dismissedIds, promptId].sort(),
  }
}

export function disableContextualPrompts(state: ContextualPromptState): ContextualPromptState {
  return state.enabled ? { enabled: false, dismissedIds: state.dismissedIds } : state
}

export function describeContextualPrompt(prompt: ContextualPromptCandidate): SemanticMessage {
  return {
    key: prompt.announcementKey,
    parameters: { promptId: prompt.id },
  }
}

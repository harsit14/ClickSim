import type { SemanticMessage } from './announcements'

export type FocusRegion =
  | 'heart'
  | 'goal-lens'
  | 'shop'
  | 'archive'
  | 'guide'
  | 'options'
  | 'reset-preview'
  | 'trial'
  | 'vessel'
  | 'crossing'
  | 'application'

export interface FocusTargetDescriptor {
  readonly region: FocusRegion
  /** Stable content/action ID, never a CSS selector or DOM node reference. */
  readonly entityId?: string
  readonly purpose: 'invoker' | 'heading' | 'primary-action' | 'context' | 'application-start'
}

export interface FocusReturnDescriptor {
  readonly reason: 'dialog-closed' | 'flow-cancelled' | 'flow-completed' | 'boundary-completed'
  readonly preferred: FocusTargetDescriptor
  readonly fallbacks: readonly FocusTargetDescriptor[]
  readonly preventScroll: boolean
  readonly announcement?: SemanticMessage
}

export interface FocusTargetAvailability {
  readonly target: FocusTargetDescriptor
  readonly available: boolean
  readonly disabled: boolean
}

export interface ResolvedFocusReturn {
  readonly target: FocusTargetDescriptor
  readonly usedFallback: boolean
  readonly announcement: SemanticMessage | null
  readonly preventScroll: boolean
}

function sameTarget(left: FocusTargetDescriptor, right: FocusTargetDescriptor): boolean {
  return left.region === right.region
    && left.entityId === right.entityId
    && left.purpose === right.purpose
}

/**
 * Resolves a semantic focus-return plan against caller-supplied availability.
 * The UI owns the final mapping from the returned descriptor to a focusable element.
 */
export function resolveFocusReturn(
  descriptor: FocusReturnDescriptor,
  availability: readonly FocusTargetAvailability[],
): ResolvedFocusReturn | null {
  const orderedTargets = [descriptor.preferred, ...descriptor.fallbacks]
  for (let index = 0; index < orderedTargets.length; index += 1) {
    const target = orderedTargets[index]
    const candidate = availability.find(({ target: availableTarget }) => sameTarget(target, availableTarget))
    if (candidate?.available && !candidate.disabled) {
      return {
        target,
        usedFallback: index > 0,
        announcement: descriptor.announcement ?? null,
        preventScroll: descriptor.preventScroll,
      }
    }
  }
  return null
}

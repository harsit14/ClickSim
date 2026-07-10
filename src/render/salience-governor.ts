import type {
  ObjectSalience,
  ScreenZone,
  UniverseVisualManifest,
  WorldObjectManifest,
} from '../content/universes/types'

export type RenderQuality = 'high' | 'balanced' | 'low'

export interface SalienceContext {
  readonly panelOpen: boolean
  readonly minimal: boolean
  readonly quality: RenderQuality
  readonly capacity: number
  readonly attentionBudget: UniverseVisualManifest['attentionBudget']
  readonly zoneInteractiveLimits: Readonly<Record<ScreenZone, number>>
}

export interface SalienceCandidate {
  readonly object: WorldObjectManifest
  readonly manifestIndex: number
}

export type SalienceRole = 'primary' | 'secondary' | 'ambient'

export interface VisibleSalienceDecision {
  readonly object: WorldObjectManifest
  readonly manifestIndex: number
  readonly role: SalienceRole
  readonly opacity: number
  readonly motionPaused: boolean
  readonly priority: number
}

export type SalienceHiddenReason =
  | 'panel-hidden'
  | 'minimal-mode'
  | 'zone-interactive-budget'
  | 'attention-budget'
  | 'quality-capacity'

export interface HiddenSalienceDecision {
  readonly objectId: string
  readonly reason: SalienceHiddenReason
}

export interface SaliencePlan {
  readonly visible: readonly VisibleSalienceDecision[]
  readonly hidden: readonly HiddenSalienceDecision[]
}

const SALIENCE_PRIORITY: Readonly<Record<ObjectSalience, number>> = {
  ambient: 0,
  supporting: 100,
  interactive: 200,
  milestone: 300,
}

const PANEL_PRIORITY = {
  hide: -1_000,
  dim: -20,
  hold: 0,
  normal: 0,
  emphasize: 50,
} as const

function isAttentionTarget(salience: ObjectSalience): boolean {
  return salience === 'interactive' || salience === 'milestone'
}

function opacityFor(candidate: SalienceCandidate, panelOpen: boolean): number {
  if (!panelOpen) return 1
  return candidate.object.priorityWhilePanelOpen === 'dim' ? 0.35 : 1
}

function shouldPause(candidate: SalienceCandidate, panelOpen: boolean): boolean {
  return panelOpen && candidate.object.priorityWhilePanelOpen === 'hold'
}

/**
 * Applies the frozen attention budget before layout. It consumes authored salience and
 * panel priority only; it never reads an economy definition or interprets an ID.
 */
export function governSalience(
  candidates: readonly SalienceCandidate[],
  context: SalienceContext,
): SaliencePlan {
  if (!Number.isInteger(context.capacity) || context.capacity < 0) {
    throw new RangeError('Salience capacity must be a nonnegative integer.')
  }

  const hidden: HiddenSalienceDecision[] = []
  const eligible = candidates.filter((candidate) => {
    if (context.panelOpen && candidate.object.priorityWhilePanelOpen === 'hide') {
      hidden.push({ objectId: candidate.object.id, reason: 'panel-hidden' })
      return false
    }
    if (
      context.minimal
      && candidate.object.salience !== 'interactive'
      && candidate.object.salience !== 'milestone'
    ) {
      hidden.push({ objectId: candidate.object.id, reason: 'minimal-mode' })
      return false
    }
    return true
  })

  const ranked = [...eligible].sort((left, right) => {
    const leftPriority = SALIENCE_PRIORITY[left.object.salience]
      + (context.panelOpen ? PANEL_PRIORITY[left.object.priorityWhilePanelOpen] : 0)
    const rightPriority = SALIENCE_PRIORITY[right.object.salience]
      + (context.panelOpen ? PANEL_PRIORITY[right.object.priorityWhilePanelOpen] : 0)
    return rightPriority - leftPriority || left.manifestIndex - right.manifestIndex
  })

  const visible: VisibleSalienceDecision[] = []
  const interactiveByZone = new Map<ScreenZone, number>()
  let primaryTargets = 0
  let secondaryTargets = 0

  for (const candidate of ranked) {
    const target = isAttentionTarget(candidate.object.salience)
    if (target) {
      const zoneCount = interactiveByZone.get(candidate.object.screenZone) ?? 0
      const zoneLimit = context.zoneInteractiveLimits[candidate.object.screenZone]
      if (zoneCount >= zoneLimit) {
        hidden.push({ objectId: candidate.object.id, reason: 'zone-interactive-budget' })
        continue
      }
    }

    let role: SalienceRole = 'ambient'
    if (target) {
      if (primaryTargets < context.attentionBudget.primaryTargets) {
        primaryTargets += 1
        role = 'primary'
      } else if (secondaryTargets < context.attentionBudget.secondaryInteractiveObjects) {
        secondaryTargets += 1
        role = 'secondary'
      } else {
        hidden.push({ objectId: candidate.object.id, reason: 'attention-budget' })
        continue
      }
    }

    if (visible.length >= context.capacity) {
      hidden.push({ objectId: candidate.object.id, reason: 'quality-capacity' })
      continue
    }

    if (target) {
      interactiveByZone.set(
        candidate.object.screenZone,
        (interactiveByZone.get(candidate.object.screenZone) ?? 0) + 1,
      )
    }
    visible.push({
      object: candidate.object,
      manifestIndex: candidate.manifestIndex,
      role,
      opacity: opacityFor(candidate, context.panelOpen),
      motionPaused: shouldPause(candidate, context.panelOpen),
      priority: SALIENCE_PRIORITY[candidate.object.salience]
        + (context.panelOpen ? PANEL_PRIORITY[candidate.object.priorityWhilePanelOpen] : 0),
    })
  }

  return { visible, hidden }
}

export function layoutCapacityFor(
  width: number,
  height: number,
  quality: RenderQuality,
  minimal: boolean,
): number {
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
    throw new RangeError('Viewport dimensions must be finite and positive.')
  }
  const mobile = Math.min(width, height) < 560
  const base = quality === 'high'
    ? (mobile ? 20 : 32)
    : quality === 'balanced'
      ? (mobile ? 14 : 24)
      : (mobile ? 8 : 14)
  return minimal ? Math.min(base, 6) : base
}

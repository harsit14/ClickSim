import type {
  HeartManifest,
  MotionGrammar,
  OwnershipThreshold,
  ScreenZone,
  UniverseVisualManifest,
  VisualState,
  WorldObjectManifest,
} from '../content/universes/types'
import {
  governSalience,
  layoutCapacityFor,
} from './salience-governor'
import type {
  HiddenSalienceDecision,
  RenderQuality,
  SalienceRole,
  VisibleSalienceDecision,
} from './salience-governor'
import {
  hudClearanceRect,
  rectsIntersect,
} from './hud-clearance'

export interface ManifestViewport {
  readonly width: number
  readonly height: number
}

export interface LayoutRect {
  readonly x: number
  readonly y: number
  readonly width: number
  readonly height: number
}

export interface ManifestRenderPreferences {
  readonly reducedMotion: boolean
  readonly quality: RenderQuality
  readonly minimal: boolean
  readonly panelOpen: boolean
}

export interface ManifestRenderState {
  /** Explicit visibility supplied by progression/content integration. */
  readonly visibleObjectIds: readonly string[]
  /** Counts are keyed by manifest sourceId and are never calculated by layout. */
  readonly ownershipBySourceId: Readonly<Record<string, number>>
  /** Optional authored/activity counts keyed by manifest object ID for density merging. */
  readonly objectCountsById?: Readonly<Record<string, number>>
}

export type VisualStateSource = 'base' | 'ownership' | 'reduced-motion' | 'low-quality'

export interface ResolvedManifestVisualState {
  readonly source: VisualStateSource
  readonly ownershipThreshold: OwnershipThreshold | null
  readonly label: string
  readonly silhouette: string
  readonly material: readonly string[]
  readonly motion: MotionGrammar
  readonly countPresentation: VisualState['countPresentation'] | null
}

export interface HeartRenderPlan {
  readonly rect: LayoutRect
  readonly centerX: number
  readonly centerY: number
  readonly radius: number
  readonly state: ResolvedManifestVisualState
  readonly focusLabel: string
}

export interface ManifestObjectRenderPlan {
  readonly objectId: string
  readonly sourceId: string
  readonly screenZone: ScreenZone
  readonly role: SalienceRole
  readonly rect: LayoutRect
  readonly opacity: number
  readonly motionPaused: boolean
  readonly state: ResolvedManifestVisualState
  readonly minimumHeartDistance: number
  readonly overlapGroup: string
  readonly canOverlapWith: readonly string[]
}

export type LayoutHiddenReason =
  | HiddenSalienceDecision['reason']
  | 'not-visible'
  | 'density-merged'
  | 'layout-overflow'

export interface HiddenManifestObject {
  readonly objectId: string
  readonly reason: LayoutHiddenReason
}

export type LayoutViolationCode =
  | 'viewport-overflow'
  | 'zone-overflow'
  | 'hud-obstruction'
  | 'heart-obstruction'
  | 'overlap-collision'
  | 'attention-budget-exceeded'

export interface LayoutViolation {
  readonly code: LayoutViolationCode
  readonly objectIds: readonly string[]
  readonly message: string
}

export interface ManifestRenderPlan {
  readonly viewport: ManifestViewport
  readonly zoneRects: Readonly<Record<ScreenZone, LayoutRect>>
  readonly hudClearance: LayoutRect
  readonly heart: HeartRenderPlan
  readonly objects: readonly ManifestObjectRenderPlan[]
  readonly hidden: readonly HiddenManifestObject[]
  readonly diagnostics: readonly LayoutViolation[]
}

export interface ManifestLayoutInput {
  readonly visual: UniverseVisualManifest
  readonly heart: HeartManifest
  readonly viewport: ManifestViewport
  readonly state: ManifestRenderState
  readonly preferences: ManifestRenderPreferences
}

const THRESHOLDS = [1, 10, 25, 50, 100] as const satisfies readonly OwnershipThreshold[]
const HEART_CLEARANCE_EPSILON = 1e-6

export function ownershipThresholdForCount(count: number): OwnershipThreshold | null {
  if (!Number.isFinite(count) || count < 1) return null
  let result: OwnershipThreshold = 1
  for (const threshold of THRESHOLDS) {
    if (count >= threshold) result = threshold
  }
  return result
}

function fromVisualState(
  state: VisualState,
  source: VisualStateSource,
  ownershipThreshold: OwnershipThreshold | null,
): ResolvedManifestVisualState {
  return {
    source,
    ownershipThreshold,
    label: state.label,
    silhouette: state.silhouette,
    material: state.material,
    motion: state.motion,
    countPresentation: state.countPresentation,
  }
}

export function resolveManifestVisualState(
  object: WorldObjectManifest,
  ownedCount: number,
  preferences: Pick<ManifestRenderPreferences, 'reducedMotion' | 'quality'>,
): ResolvedManifestVisualState {
  const threshold = ownershipThresholdForCount(ownedCount)
  if (preferences.reducedMotion) {
    return fromVisualState(object.reducedMotionState, 'reduced-motion', threshold)
  }
  if (preferences.quality === 'low') {
    return fromVisualState(object.lowQualityState, 'low-quality', threshold)
  }
  if (threshold !== null && object.ownershipStates) {
    return fromVisualState(object.ownershipStates[threshold], 'ownership', threshold)
  }
  return {
    source: 'base',
    ownershipThreshold: threshold,
    label: object.phenomenon,
    silhouette: object.silhouette,
    material: object.material,
    motion: object.motion,
    countPresentation: null,
  }
}

function resolveHeartVisualState(
  heart: HeartManifest,
  preferences: Pick<ManifestRenderPreferences, 'reducedMotion' | 'quality'>,
): ResolvedManifestVisualState {
  if (preferences.reducedMotion) {
    return fromVisualState(heart.reducedMotionState, 'reduced-motion', null)
  }
  if (preferences.quality === 'low') {
    return fromVisualState(heart.lowQualityState, 'low-quality', null)
  }
  return {
    source: 'base',
    ownershipThreshold: null,
    label: heart.localName,
    silhouette: heart.silhouette,
    material: heart.material,
    motion: heart.idleMotion,
    countPresentation: null,
  }
}

function zoneRects(viewport: ManifestViewport): Readonly<Record<ScreenZone, LayoutRect>> {
  const margin = Math.max(8, Math.min(16, Math.min(viewport.width, viewport.height) * 0.02))
  const innerWidth = viewport.width - margin * 2
  const innerHeight = viewport.height - margin * 2
  return {
    horizon: { x: margin, y: margin, width: innerWidth, height: innerHeight * 0.2 },
    far: { x: margin, y: margin + innerHeight * 0.2, width: innerWidth, height: innerHeight * 0.25 },
    heart: {
      x: margin + innerWidth * 0.16,
      y: margin + innerHeight * 0.35,
      width: innerWidth * 0.68,
      height: innerHeight * 0.35,
    },
    near: { x: margin, y: margin + innerHeight * 0.68, width: innerWidth, height: innerHeight * 0.32 },
  }
}

function heartPlan(
  heart: HeartManifest,
  viewport: ManifestViewport,
  preferences: ManifestRenderPreferences,
): HeartRenderPlan {
  const radius = Math.max(28, Math.min(72, Math.min(viewport.width, viewport.height) * (
    Math.min(viewport.width, viewport.height) < 560 ? 0.1 : 0.085
  )))
  const centerX = viewport.width / 2
  const centerY = viewport.height * 0.53
  return {
    centerX,
    centerY,
    radius,
    rect: {
      x: centerX - radius,
      y: centerY - radius,
      width: radius * 2,
      height: radius * 2,
    },
    state: resolveHeartVisualState(heart, preferences),
    focusLabel: heart.focusLabel,
  }
}

function applyDensityMerges(
  visual: UniverseVisualManifest,
  visibleIds: ReadonlySet<string>,
  counts: Readonly<Record<string, number>>,
): { readonly visible: ReadonlySet<string>; readonly merged: ReadonlySet<string> } {
  const visible = new Set(visibleIds)
  const merged = new Set<string>()
  for (const rule of visual.densityMerges) {
    const total = rule.sourceIds.reduce((sum, id) => {
      const count = counts[id] ?? 0
      return sum + (Number.isFinite(count) && count > 0 ? count : 0)
    }, 0)
    if (total < rule.threshold) continue
    for (const sourceId of rule.sourceIds) {
      if (visible.delete(sourceId)) merged.add(sourceId)
    }
    visible.add(rule.resultObjectId)
  }
  return { visible, merged }
}

function objectSize(
  decision: VisibleSalienceDecision,
  viewport: ManifestViewport,
): { readonly width: number; readonly height: number } {
  const mobile = Math.min(viewport.width, viewport.height) < 560
  const base = decision.object.salience === 'milestone'
    ? (mobile ? 54 : 68)
    : decision.object.salience === 'interactive'
      ? (mobile ? 44 : 54)
      : decision.object.salience === 'supporting'
        ? (mobile ? 34 : 44)
        : (mobile ? 26 : 32)
  return { width: base, height: base }
}

function centersFor(rect: LayoutRect, width: number, height: number): readonly [number, number][] {
  const gap = 8
  const columns = Math.max(1, Math.floor((rect.width + gap) / (width + gap)))
  const rows = Math.max(1, Math.floor((rect.height + gap) / (height + gap)))
  const points: [number, number][] = []
  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      points.push([
        rect.x + width / 2 + column * ((rect.width - width) / Math.max(1, columns - 1)),
        rect.y + height / 2 + row * ((rect.height - height) / Math.max(1, rows - 1)),
      ])
    }
  }
  const centerX = rect.x + rect.width / 2
  const centerY = rect.y + rect.height / 2
  return points.sort((left, right) => {
    const leftDistance = (left[0] - centerX) ** 2 + (left[1] - centerY) ** 2
    const rightDistance = (right[0] - centerX) ** 2 + (right[1] - centerY) ** 2
    return leftDistance - rightDistance || left[1] - right[1] || left[0] - right[0]
  })
}

function pointToRectDistance(x: number, y: number, rect: LayoutRect): number {
  const dx = Math.max(rect.x - x, 0, x - (rect.x + rect.width))
  const dy = Math.max(rect.y - y, 0, y - (rect.y + rect.height))
  return Math.hypot(dx, dy)
}

function overlapAllowed(
  left: Pick<ManifestObjectRenderPlan, 'overlapGroup' | 'canOverlapWith'>,
  right: Pick<ManifestObjectRenderPlan, 'overlapGroup' | 'canOverlapWith'>,
): boolean {
  return left.canOverlapWith.includes(right.overlapGroup)
    && right.canOverlapWith.includes(left.overlapGroup)
}

function contained(inner: LayoutRect, outer: LayoutRect): boolean {
  const epsilon = 1e-6
  return inner.x >= outer.x - epsilon
    && inner.y >= outer.y - epsilon
    && inner.x + inner.width <= outer.x + outer.width + epsilon
    && inner.y + inner.height <= outer.y + outer.height + epsilon
}

export function auditManifestRenderPlan(plan: ManifestRenderPlan): readonly LayoutViolation[] {
  const violations: LayoutViolation[] = []
  const viewportRect: LayoutRect = { x: 0, y: 0, ...plan.viewport }
  for (const object of plan.objects) {
    if (!contained(object.rect, viewportRect)) {
      violations.push({
        code: 'viewport-overflow',
        objectIds: [object.objectId],
        message: `${object.objectId} extends outside the viewport.`,
      })
    }
    if (!contained(object.rect, plan.zoneRects[object.screenZone])) {
      violations.push({
        code: 'zone-overflow',
        objectIds: [object.objectId],
        message: `${object.objectId} extends outside its ${object.screenZone} zone.`,
      })
    }
    if (rectsIntersect(object.rect, plan.hudClearance)) {
      violations.push({
        code: 'hud-obstruction',
        objectIds: [object.objectId],
        message: `${object.objectId} intrudes into the run-status clearance area.`,
      })
    }
    const requiredDistance = (1 + object.minimumHeartDistance) * plan.heart.radius
    if (
      pointToRectDistance(plan.heart.centerX, plan.heart.centerY, object.rect)
        + HEART_CLEARANCE_EPSILON < requiredDistance
    ) {
      violations.push({
        code: 'heart-obstruction',
        objectIds: [object.objectId],
        message: `${object.objectId} violates its ${object.minimumHeartDistance}-Heart-radius clearance.`,
      })
    }
  }

  for (let leftIndex = 0; leftIndex < plan.objects.length; leftIndex += 1) {
    for (let rightIndex = leftIndex + 1; rightIndex < plan.objects.length; rightIndex += 1) {
      const left = plan.objects[leftIndex]
      const right = plan.objects[rightIndex]
      if (rectsIntersect(left.rect, right.rect) && !overlapAllowed(left, right)) {
        violations.push({
          code: 'overlap-collision',
          objectIds: [left.objectId, right.objectId],
          message: `${left.objectId} and ${right.objectId} overlap without reciprocal group permission.`,
        })
      }
    }
  }

  const primary = plan.objects.filter((object) => object.role === 'primary').length
  const secondary = plan.objects.filter((object) => object.role === 'secondary').length
  if (primary > 1 || secondary > 3) {
    violations.push({
      code: 'attention-budget-exceeded',
      objectIds: plan.objects
        .filter((object) => object.role === 'primary' || object.role === 'secondary')
        .map((object) => object.objectId),
      message: `Plan contains ${primary} primary and ${secondary} secondary attention targets.`,
    })
  }
  return violations
}

/** Produces an abstract deterministic renderer plan without touching Canvas or economy. */
export function planManifestLayout(input: ManifestLayoutInput): ManifestRenderPlan {
  if (
    !Number.isFinite(input.viewport.width)
    || !Number.isFinite(input.viewport.height)
    || input.viewport.width < 240
    || input.viewport.height < 240
  ) {
    throw new RangeError('Manifest layout viewport must be at least 240 by 240 finite pixels.')
  }

  const zones = zoneRects(input.viewport)
  const hudClearance = hudClearanceRect(input.viewport)
  const heart = heartPlan(input.heart, input.viewport, input.preferences)
  const manifestIds = new Set(input.visual.objects.map((object) => object.id))
  const requestedVisible = new Set(input.state.visibleObjectIds.filter((id) => manifestIds.has(id)))
  const density = applyDensityMerges(
    input.visual,
    requestedVisible,
    input.state.objectCountsById ?? {},
  )
  const hidden: HiddenManifestObject[] = input.visual.objects
    .filter((object) => !density.visible.has(object.id))
    .map((object) => ({
      objectId: object.id,
      reason: density.merged.has(object.id) ? 'density-merged' : 'not-visible',
    }))

  const candidates = input.visual.objects.flatMap((object, manifestIndex) => (
    density.visible.has(object.id) ? [{ object, manifestIndex }] : []
  ))
  const salience = governSalience(candidates, {
    panelOpen: input.preferences.panelOpen,
    minimal: input.preferences.minimal,
    quality: input.preferences.quality,
    capacity: layoutCapacityFor(
      input.viewport.width,
      input.viewport.height,
      input.preferences.quality,
      input.preferences.minimal,
    ),
    attentionBudget: input.visual.attentionBudget,
    zoneInteractiveLimits: {
      heart: input.visual.zones.heart.maximumInteractiveObjects,
      near: input.visual.zones.near.maximumInteractiveObjects,
      far: input.visual.zones.far.maximumInteractiveObjects,
      horizon: input.visual.zones.horizon.maximumInteractiveObjects,
    },
  })
  hidden.push(...salience.hidden)

  const placed: ManifestObjectRenderPlan[] = []
  for (const decision of salience.visible) {
    const size = objectSize(decision, input.viewport)
    const centers = centersFor(zones[decision.object.screenZone], size.width, size.height)
    const owned = input.state.ownershipBySourceId[decision.object.sourceId] ?? 0
    const state = resolveManifestVisualState(decision.object, owned, input.preferences)
    let result: ManifestObjectRenderPlan | null = null

    for (const [centerX, centerY] of centers) {
      const rect: LayoutRect = {
        x: centerX - size.width / 2,
        y: centerY - size.height / 2,
        width: size.width,
        height: size.height,
      }
      const candidate: ManifestObjectRenderPlan = {
        objectId: decision.object.id,
        sourceId: decision.object.sourceId,
        screenZone: decision.object.screenZone,
        role: decision.role,
        rect,
        opacity: decision.opacity,
        motionPaused: decision.motionPaused,
        state,
        minimumHeartDistance: decision.object.minimumHeartDistance,
        overlapGroup: decision.object.overlapGroup,
        canOverlapWith: decision.object.canOverlapWith,
      }
      if (
        pointToRectDistance(heart.centerX, heart.centerY, rect)
          + HEART_CLEARANCE_EPSILON
          < (1 + decision.object.minimumHeartDistance) * heart.radius
      ) {
        continue
      }
      if (rectsIntersect(rect, hudClearance)) continue
      if (placed.some((other) => rectsIntersect(rect, other.rect) && !overlapAllowed(candidate, other))) {
        continue
      }
      result = candidate
      break
    }

    if (result) placed.push(result)
    else hidden.push({ objectId: decision.object.id, reason: 'layout-overflow' })
  }

  const incomplete: ManifestRenderPlan = {
    viewport: input.viewport,
    zoneRects: zones,
    hudClearance,
    heart,
    objects: placed,
    hidden,
    diagnostics: [],
  }
  return { ...incomplete, diagnostics: auditManifestRenderPlan(incomplete) }
}

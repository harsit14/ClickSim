import assert from 'node:assert/strict'
import test from 'node:test'
import type {
  ObjectSalience,
  ScreenZone,
  WorldObjectManifest,
} from '../src/content/universes/types'
import {
  governSalience,
  layoutCapacityFor,
} from '../src/render/salience-governor'

const state = (label: string) => ({
  label,
  silhouette: `${label} silhouette`,
  material: ['authored-material'],
  motion: {
    kind: 'still' as const,
    description: `${label} static timing pose`,
    preservesTimingInformation: true,
  },
  countPresentation: 'group' as const,
})

function object(
  id: string,
  salience: ObjectSalience,
  priority: WorldObjectManifest['priorityWhilePanelOpen'],
  zone: ScreenZone = 'near',
): WorldObjectManifest {
  return {
    id,
    sourceKind: 'story',
    sourceId: `${id}-source`,
    phenomenon: `${id} phenomenon`,
    purpose: `${id} authored purpose`,
    screenZone: zone,
    salience,
    material: ['authored-material'],
    silhouette: `${id} silhouette`,
    motion: {
      kind: 'authored',
      description: `${id} authored motion`,
      periodMs: 1_000,
      preservesTimingInformation: true,
    },
    reducedMotionState: state(`${id} reduced`),
    lowQualityState: state(`${id} low`),
    overlapGroup: `${id}-group`,
    canOverlapWith: [],
    minimumHeartDistance: 1,
    priorityWhilePanelOpen: priority,
  }
}

const context = {
  panelOpen: true,
  minimal: false,
  quality: 'high' as const,
  capacity: 10,
  attentionBudget: {
    primaryTargets: 1 as const,
    secondaryInteractiveObjects: 3 as const,
    temporaryRewardEffects: 2 as const,
    storySubtitles: 1 as const,
    majorPanels: 1 as const,
  },
  zoneInteractiveLimits: { heart: 4, near: 4, far: 4, horizon: 4 },
}

test('panel priority deterministically hides, dims, holds, and emphasizes', () => {
  const candidates = [
    object('hidden-object', 'interactive', 'hide'),
    object('dimmed-object', 'interactive', 'dim'),
    object('held-object', 'interactive', 'hold'),
    object('emphasized-object', 'milestone', 'emphasize'),
  ].map((entry, manifestIndex) => ({ object: entry, manifestIndex }))

  const plan = governSalience(candidates, context)
  assert.deepEqual(plan.hidden, [{ objectId: 'hidden-object', reason: 'panel-hidden' }])
  assert.equal(plan.visible[0].object.id, 'emphasized-object')
  assert.equal(plan.visible[0].role, 'primary')
  assert.equal(plan.visible.find((entry) => entry.object.id === 'dimmed-object')?.opacity, 0.35)
  assert.equal(plan.visible.find((entry) => entry.object.id === 'held-object')?.motionPaused, true)
})

test('minimal and low-quality capacity remove ambient demand before layout', () => {
  const candidates = [
    object('milestone-object', 'milestone', 'normal'),
    object('interactive-object', 'interactive', 'normal'),
    object('supporting-object', 'supporting', 'normal'),
    object('ambient-object', 'ambient', 'normal'),
  ].map((entry, manifestIndex) => ({ object: entry, manifestIndex }))

  const plan = governSalience(candidates, {
    ...context,
    panelOpen: false,
    minimal: true,
    quality: 'low',
    capacity: 2,
  })
  assert.deepEqual(plan.visible.map((entry) => entry.object.id), [
    'milestone-object',
    'interactive-object',
  ])
  assert.deepEqual(plan.hidden, [
    { objectId: 'supporting-object', reason: 'minimal-mode' },
    { objectId: 'ambient-object', reason: 'minimal-mode' },
  ])
})

test('global and per-zone attention budgets suppress excess interactive targets', () => {
  const candidates = Array.from({ length: 7 }, (_, index) => ({
    object: object(`target-${index}`, 'interactive', 'normal', index < 3 ? 'near' : 'far'),
    manifestIndex: index,
  }))
  const plan = governSalience(candidates, {
    ...context,
    panelOpen: false,
    zoneInteractiveLimits: { heart: 1, near: 2, far: 4, horizon: 1 },
  })

  assert.equal(plan.visible.filter((entry) => entry.role === 'primary').length, 1)
  assert.equal(plan.visible.filter((entry) => entry.role === 'secondary').length, 3)
  assert.ok(plan.hidden.some((entry) => entry.reason === 'zone-interactive-budget'))
  assert.ok(plan.hidden.some((entry) => entry.reason === 'attention-budget'))
})

test('layout capacity is deterministic across desktop, mobile, quality, and minimal modes', () => {
  assert.equal(layoutCapacityFor(1280, 720, 'high', false), 32)
  assert.equal(layoutCapacityFor(390, 844, 'high', false), 20)
  assert.equal(layoutCapacityFor(1280, 720, 'low', false), 14)
  assert.equal(layoutCapacityFor(390, 844, 'low', false), 8)
  assert.equal(layoutCapacityFor(1280, 720, 'high', true), 6)
})

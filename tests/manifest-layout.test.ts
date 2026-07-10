import assert from 'node:assert/strict'
import test from 'node:test'
import type {
  DensityMergeRule,
  HeartManifest,
  ObjectSalience,
  ScreenZone,
  UniverseVisualManifest,
  VisualState,
  WorldObjectManifest,
} from '../src/content/universes/types'
import {
  auditManifestRenderPlan,
  ownershipThresholdForCount,
  planManifestLayout,
  resolveManifestVisualState,
} from '../src/render/manifest-layout'
import type {
  ManifestLayoutInput,
  ManifestRenderPlan,
} from '../src/render/manifest-layout'

const motion = (description: string) => ({
  kind: 'authored' as const,
  description,
  periodMs: 1_000,
  preservesTimingInformation: true,
})

const state = (label: string): VisualState => ({
  label,
  silhouette: `${label} silhouette`,
  material: [`${label} material`],
  motion: motion(`${label} motion`),
  countPresentation: 'group',
})

function object(
  id: string,
  zone: ScreenZone,
  salience: ObjectSalience,
  sourceKind: WorldObjectManifest['sourceKind'] = 'story',
  priority: WorldObjectManifest['priorityWhilePanelOpen'] = 'normal',
): WorldObjectManifest {
  return {
    id,
    sourceKind,
    sourceId: `${id}-source`,
    phenomenon: `${id} phenomenon`,
    purpose: `${id} mechanical purpose`,
    screenZone: zone,
    salience,
    material: [`${id} base material`],
    silhouette: `${id} base silhouette`,
    motion: motion(`${id} base motion`),
    ...(sourceKind === 'generator'
      ? {
        ownershipStates: {
          1: state(`${id} ownership 1`),
          10: state(`${id} ownership 10`),
          25: state(`${id} ownership 25`),
          50: state(`${id} ownership 50`),
          100: state(`${id} ownership 100`),
        },
      }
      : {}),
    reducedMotionState: state(`${id} reduced`),
    lowQualityState: state(`${id} low quality`),
    overlapGroup: `${id}-group`,
    canOverlapWith: [],
    minimumHeartDistance: 1,
    priorityWhilePanelOpen: priority,
  }
}

const heart: HeartManifest = {
  id: 'test-heart',
  canonicalName: 'Heart',
  localName: 'Test Heart',
  phenomenon: 'A testable authored Heart',
  purpose: 'Central input target',
  material: ['heart material'],
  silhouette: 'heart silhouette',
  idleMotion: motion('heart idle'),
  touchMotion: motion('heart touch'),
  reducedMotionState: state('heart reduced'),
  lowQualityState: state('heart low quality'),
  touchCue: 'heart-touch-cue',
  focusLabel: 'Test Heart, Heart of the fixture world',
}

function visual(
  objects: readonly WorldObjectManifest[],
  densityMerges: readonly DensityMergeRule[] = [],
): UniverseVisualManifest {
  return {
    materials: ['fixture material'],
    primarySilhouettes: ['fixture silhouette'],
    motionGrammar: ['authored'],
    zones: {
      heart: { purpose: 'Heart-adjacent systems', maximumInteractiveObjects: 3, motionFrequency: 'high' },
      near: { purpose: 'Near systems', maximumInteractiveObjects: 3, motionFrequency: 'medium' },
      far: { purpose: 'Far systems', maximumInteractiveObjects: 3, motionFrequency: 'low' },
      horizon: { purpose: 'Future milestones', maximumInteractiveObjects: 3, motionFrequency: 'low' },
    },
    objects,
    densityMerges,
    attentionBudget: {
      primaryTargets: 1,
      secondaryInteractiveObjects: 3,
      temporaryRewardEffects: 2,
      storySubtitles: 1,
      majorPanels: 1,
    },
  }
}

function denseObjects(): readonly WorldObjectManifest[] {
  const zones: readonly ScreenZone[] = ['horizon', 'far', 'heart', 'near']
  return Array.from({ length: 32 }, (_, index) => object(
    `dense-object-${index}`,
    zones[index % zones.length],
    index < 4 ? 'interactive' : index < 18 ? 'supporting' : 'ambient',
  ))
}

function input(
  objects: readonly WorldObjectManifest[],
  viewport: { readonly width: number; readonly height: number },
  overrides: Partial<ManifestLayoutInput> = {},
): ManifestLayoutInput {
  return {
    visual: visual(objects),
    heart,
    viewport,
    state: {
      visibleObjectIds: objects.map((entry) => entry.id),
      ownershipBySourceId: {},
    },
    preferences: {
      reducedMotion: false,
      quality: 'high',
      minimal: false,
      panelOpen: false,
    },
    ...overrides,
  }
}

test('dense desktop and mobile fixtures stay deterministic, bounded, and Heart-clear', () => {
  const objects = denseObjects()
  for (const viewport of [{ width: 1280, height: 720 }, { width: 390, height: 844 }]) {
    const first = planManifestLayout(input(objects, viewport))
    const second = planManifestLayout(input(objects, viewport))
    assert.deepEqual(first, second)
    assert.deepEqual(first.diagnostics, [])
    assert.deepEqual(auditManifestRenderPlan(first), [])
    assert.ok(first.objects.length > 0)
    assert.equal(first.objects.filter((entry) => entry.role === 'primary').length, 1)
    assert.ok(first.objects.filter((entry) => entry.role === 'secondary').length <= 3)
  }
})

test('dense-pack layout properties hold across counts, viewports, and quality profiles', () => {
  const viewports = [
    { width: 1280, height: 720 },
    { width: 768, height: 1024 },
    { width: 390, height: 844 },
  ]
  const profiles = [
    { reducedMotion: false, quality: 'high' as const, minimal: false, panelOpen: false },
    { reducedMotion: true, quality: 'balanced' as const, minimal: false, panelOpen: true },
    { reducedMotion: false, quality: 'low' as const, minimal: true, panelOpen: false },
  ]

  for (let count = 1; count <= 48; count += 1) {
    const objects = denseObjects().concat(denseObjects().slice(0, 16).map((entry, index) => ({
      ...entry,
      id: `extra-${index}`,
      sourceId: `extra-${index}-source`,
      overlapGroup: `extra-${index}-group`,
    }))).slice(0, count)
    for (const viewport of viewports) {
      for (const preferences of profiles) {
        const plan = planManifestLayout({
          ...input(objects, viewport),
          preferences,
        })
        assert.deepEqual(auditManifestRenderPlan(plan), [])
        const decisions = [...plan.objects.map((entry) => entry.objectId), ...plan.hidden.map((entry) => entry.objectId)]
        assert.equal(new Set(decisions).size, objects.length)
      }
    }
  }
})

test('layout audit detects Heart obstruction and viewport overflow in machine fixtures', () => {
  const plan = planManifestLayout(input(denseObjects().slice(0, 8), { width: 1280, height: 720 }))
  assert.ok(plan.objects.length >= 2)
  const corrupted: ManifestRenderPlan = {
    ...plan,
    objects: [
      {
        ...plan.objects[0],
        rect: {
          x: plan.heart.centerX - 10,
          y: plan.heart.centerY - 10,
          width: 20,
          height: 20,
        },
      },
      {
        ...plan.objects[1],
        rect: { ...plan.objects[1].rect, x: -100 },
      },
      ...plan.objects.slice(2),
    ],
    diagnostics: [],
  }

  const codes = new Set(auditManifestRenderPlan(corrupted).map((entry) => entry.code))
  assert.ok(codes.has('heart-obstruction'))
  assert.ok(codes.has('viewport-overflow'))
})

test('ownership transitions resolve all five frozen thresholds and both fallbacks', () => {
  const generator = object('generator-object', 'near', 'supporting', 'generator')
  const cases = [
    [0, null],
    [1, 1],
    [9, 1],
    [10, 10],
    [24, 10],
    [25, 25],
    [49, 25],
    [50, 50],
    [99, 50],
    [100, 100],
    [1_000, 100],
  ] as const
  for (const [count, threshold] of cases) {
    assert.equal(ownershipThresholdForCount(count), threshold)
    assert.equal(
      resolveManifestVisualState(generator, count, { reducedMotion: false, quality: 'high' })
        .ownershipThreshold,
      threshold,
    )
  }
  assert.equal(
    resolveManifestVisualState(generator, 100, { reducedMotion: true, quality: 'low' }).source,
    'reduced-motion',
  )
  assert.equal(
    resolveManifestVisualState(generator, 100, { reducedMotion: false, quality: 'low' }).source,
    'low-quality',
  )
})

test('density merges replace repeated objects without inferring meaning from IDs', () => {
  const first = object('repeated-a', 'far', 'supporting')
  const second = object('repeated-b', 'far', 'supporting')
  const merged = object('merged-landmark', 'far', 'milestone')
  const objects = [first, second, merged]
  const densityMerges: readonly DensityMergeRule[] = [{
    sourceIds: [first.id, second.id],
    threshold: 10,
    resultObjectId: merged.id,
    description: 'Repeated authored objects become one authored landmark.',
  }]
  const plan = planManifestLayout({
    ...input(objects, { width: 1280, height: 720 }),
    visual: visual(objects, densityMerges),
    state: {
      visibleObjectIds: [first.id, second.id],
      ownershipBySourceId: {},
      objectCountsById: { [first.id]: 6, [second.id]: 4 },
    },
  })

  assert.deepEqual(plan.objects.map((entry) => entry.objectId), ['merged-landmark'])
  assert.deepEqual(plan.hidden.filter((entry) => entry.reason === 'density-merged'), [
    { objectId: 'repeated-a', reason: 'density-merged' },
    { objectId: 'repeated-b', reason: 'density-merged' },
  ])
})

test('panel and minimal low-quality plans apply authored states without collisions', () => {
  const held = object('held-object', 'near', 'interactive', 'story', 'hold')
  const hidden = object('hidden-object', 'far', 'supporting', 'story', 'hide')
  const ambient = object('ambient-object', 'horizon', 'ambient')
  const objects = [held, hidden, ambient]
  const plan = planManifestLayout({
    ...input(objects, { width: 390, height: 844 }),
    preferences: {
      reducedMotion: false,
      quality: 'low',
      minimal: true,
      panelOpen: true,
    },
  })

  assert.deepEqual(plan.objects.map((entry) => entry.objectId), ['held-object'])
  assert.equal(plan.objects[0].motionPaused, true)
  assert.equal(plan.objects[0].state.source, 'low-quality')
  assert.ok(plan.hidden.some((entry) => (
    entry.objectId === 'hidden-object' && entry.reason === 'panel-hidden'
  )))
  assert.ok(plan.hidden.some((entry) => (
    entry.objectId === 'ambient-object' && entry.reason === 'minimal-mode'
  )))
  assert.deepEqual(plan.diagnostics, [])
})

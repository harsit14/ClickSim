import assert from 'node:assert/strict'
import test from 'node:test'
import {
  assertValidUniversePackV2,
  validateUniversePackV2,
  validateWorldObjectManifest,
} from '../src/render/manifest-validator'
import type {
  MotionGrammar,
  UniversePackV2,
  VisualState,
  WorldObjectManifest,
  WorldObjectSourceKind,
} from '../src/content/universes/types'

const motion = (kind: MotionGrammar['kind'] = 'orbital'): MotionGrammar => ({
  kind,
  description: `${kind} motion with an authored physical purpose`,
  periodMs: kind === 'still' ? undefined : 1_000,
  preservesTimingInformation: true,
})

const state = (label: string): VisualState => ({
  label,
  silhouette: `${label} silhouette`,
  material: ['plasma'],
  motion: motion('still'),
  countPresentation: 'group',
})

const ownershipStates = () => ({
  1: state('single specimen'),
  10: state('organized group'),
  25: state('connected system'),
  50: state('world influence'),
  100: state('named infrastructure'),
})

const object = (
  id: string,
  sourceKind: WorldObjectSourceKind,
  sourceId: string,
): WorldObjectManifest => ({
  id,
  sourceKind,
  sourceId,
  phenomenon: `${sourceId} physical phenomenon`,
  purpose: `${sourceId} communicates mechanical state`,
  screenZone: sourceKind === 'beacon' ? 'horizon' : 'near',
  salience: sourceKind === 'beacon' ? 'milestone' : 'supporting',
  material: ['plasma'],
  silhouette: `${sourceId} authored silhouette`,
  motion: motion(),
  ...(sourceKind === 'generator' ? { ownershipStates: ownershipStates() } : {}),
  reducedMotionState: state(`${sourceId} reduced motion`),
  lowQualityState: state(`${sourceId} low quality`),
  overlapGroup: `${sourceKind}-objects`,
  canOverlapWith: [],
  minimumHeartDistance: 1.25,
  priorityWhilePanelOpen: 'dim',
  ...(sourceKind === 'archive' ? { loreRecord: sourceId } : {}),
})

function validPack(): UniversePackV2 {
  const currency = {
    id: 'light',
    canonicalName: 'World currency',
    localName: 'Light',
    singular: 'Light',
    plural: 'Light',
    glyph: '*',
    material: 'plasma',
    scope: 'world' as const,
  }
  const epochCurrency = {
    ...currency,
    id: 'stardust',
    canonicalName: 'Epoch Matter',
    localName: 'Stardust',
    singular: 'Stardust',
    plural: 'Stardust',
    scope: 'epoch' as const,
  }
  const generators = Array.from({ length: 18 }, (_, index) => ({
    id: `kindling-${String(index + 1).padStart(2, '0')}`,
    name: `Kindling ${index + 1}`,
    flavor: `Authored purpose for Kindling ${index + 1}`,
    baseCost: 10 ** Math.min(index, 12),
    baseRate: index + 1,
    costMult: 1.15,
    tier: index + 1,
    hue: index * 10,
  }))
  const generatorObjects = generators.map((generator) => (
    object(`object-${generator.id}`, 'generator', generator.id)
  ))
  const omenObjects = Array.from({ length: 4 }, (_, index) => (
    object(`object-omen-${index + 1}`, 'omen', `omen-${index + 1}`)
  ))
  const omens = omenObjects.map((omenObject, index) => ({
    id: `omen-${index + 1}`,
    name: `Omen ${index + 1}`,
    description: `Authored Omen ${index + 1}`,
    spawn: {
      mode: 'scheduled' as const,
      scheduleMs: 10_000,
      oddsVisibleAfterDiscovery: true,
    },
    rewards: [{
      id: `omen-reward-${index + 1}`,
      description: 'A bounded acceleration reward',
      exclusivePermanentPower: false as const,
      effects: [],
    }],
    object: omenObject,
    accessibilityLabel: `Omen ${index + 1} timing target`,
  })) as UniversePackV2['omens']
  const archiveObjects = Array.from({ length: 12 }, (_, index) => (
    object(`object-archive-${index + 1}`, 'archive', `archive-${index + 1}`)
  ))
  const records = archiveObjects.map((archiveObject, index) => ({
    id: `archive-${index + 1}`,
    name: `Archive ${index + 1}`,
    observation: `Observation ${index + 1}`,
    implication: `Implication ${index + 1}`,
    effectDescription: `Mechanical effect ${index + 1}`,
    object: archiveObject,
  })) as unknown as UniversePackV2['archive']['records']
  const beaconObject = object('object-world-beacon', 'beacon', 'world-beacon')
  const allObjects = [...generatorObjects, ...omenObjects, ...archiveObjects, beaconObject]

  return {
    id: 'emberlight',
    identity: {
      name: 'Emberlight',
      shortName: 'Ember',
      epithet: 'The Known Sky',
      premise: 'Rebuild a universe from light.',
      primaryVerb: 'kindle',
      civilizationQuestion: 'What does creation owe its successors?',
    },
    economy: {
      currency,
      generators: generators as unknown as UniversePackV2['economy']['generators'],
      upgrades: [],
      doctrines: Array.from({ length: 4 }, (_, index) => ({
        id: `doctrine-${index + 1}`,
        name: `Doctrine ${index + 1}`,
        description: `Doctrine ${index + 1} strategy`,
        favoredMotivations: ['restorer' as const],
        effects: [],
        visualSignature: `Doctrine ${index + 1} visible signature`,
      })) as unknown as UniversePackV2['economy']['doctrines'],
      localPrestige: {
        id: 'supernova',
        canonicalName: 'Epoch Turn',
        localName: 'Supernova',
        rewardCurrency: epochCurrency,
        gainFormulaId: 'supernova-gain',
        loses: ['world-currency', 'kindlings'],
        retains: ['epoch-matter', 'archive', 'story'],
        ceremonyFeedbackId: 'supernova-feedback',
      },
    },
    heart: {
      id: 'last-ember',
      canonicalName: 'Heart',
      localName: 'Last Ember',
      phenomenon: 'A stable incandescent material source',
      purpose: 'Central focusable input and source of Light',
      material: ['plasma'],
      silhouette: 'Layered stellar ember',
      idleMotion: motion(),
      touchMotion: motion('authored'),
      reducedMotionState: state('Heart reduced motion'),
      lowQualityState: state('Heart low quality'),
      touchCue: 'touch-cue',
      focusLabel: 'Last Ember, Heart of Emberlight',
    },
    physics: { randomAllowed: true },
    omens,
    archive: {
      id: 'astral-cabinet',
      canonicalName: 'Field Archive',
      localName: 'Astral Cabinet',
      records,
      shelves: [
        {
          id: 'shelf-one',
          name: 'First shelf',
          recordIds: ['archive-1', 'archive-2', 'archive-3', 'archive-4'],
          rewardDescription: 'First shelf resonance',
        },
        {
          id: 'shelf-two',
          name: 'Second shelf',
          recordIds: ['archive-5', 'archive-6', 'archive-7', 'archive-8'],
          rewardDescription: 'Second shelf resonance',
        },
        {
          id: 'shelf-three',
          name: 'Third shelf',
          recordIds: ['archive-9', 'archive-10', 'archive-11', 'archive-12'],
          rewardDescription: 'Third shelf resonance',
        },
      ],
    },
    trials: [],
    story: {
      civilizationQuestion: 'What does creation owe its successors?',
      lumen: [],
      echoes: [],
      scenes: [{ id: 'arrival-scene', kind: 'arrival', skippableAfterFirstView: true, replayable: true }],
    },
    audio: {
      tempoBpm: 72,
      meter: '4/4',
      buses: [],
      cues: [{
        id: 'touch-cue',
        bus: 'touch',
        family: 'plasma-touch',
        synthesisKey: 'plasma-touch',
        targetPeakDb: -12,
        maximumPeakDb: -6,
        minimumIntervalMs: 80,
        maximumConcurrentInstances: 2,
        priority: 'normal',
        muteGroup: 'touches',
        mutedFallback: 'none',
      }],
      clickMaterialCue: 'touch-cue',
      purchaseIntervalCue: 'touch-cue',
      criticalAccentCue: 'touch-cue',
      omenCallCue: 'touch-cue',
      prestigeCadenceCue: 'touch-cue',
      stems: [] as unknown as UniversePackV2['audio']['stems'],
      silenceState: 'Authored quiet harmonic state',
      fatiguePolicy: 'Bound pitch and attenuate repetition',
    },
    visual: {
      materials: ['plasma'],
      primarySilhouettes: ['starburst'],
      motionGrammar: ['orbital'],
      zones: {
        heart: { purpose: 'Central input', maximumInteractiveObjects: 1, motionFrequency: 'high' },
        near: { purpose: 'Active systems', maximumInteractiveObjects: 3, motionFrequency: 'low' },
        far: { purpose: 'Civilization scale', maximumInteractiveObjects: 1, motionFrequency: 'medium' },
        horizon: { purpose: 'Milestones', maximumInteractiveObjects: 1, motionFrequency: 'low' },
      },
      objects: allObjects,
      densityMerges: [],
      attentionBudget: {
        primaryTargets: 1,
        secondaryInteractiveObjects: 3,
        temporaryRewardEffects: 2,
        storySubtitles: 1,
        majorPanels: 1,
      },
    },
    beacon: {
      id: 'world-beacon',
      canonicalName: 'Beacon',
      localName: 'Known Sky Beacon',
      requirement: {
        sourceKind: 'generator',
        sourceId: 'kindling-18',
        target: 1,
        description: 'Own the final Kindling',
      },
      darkBetweenReward: 1,
      object: beaconObject,
      mapSilhouette: 'Stellar beacon column',
    },
    accessibility: {
      heartLabel: 'Last Ember, Heart of Emberlight',
      currencyLabel: 'Light',
      screenReaderOrder: [],
      announcements: [],
      nonColorSignals: [],
      timing: {
        visualCue: 'pulse',
        audioCue: 'touch',
        shapeCue: 'ring',
        averagedModeAvailable: true,
        averagedRewardRatio: [0.85, 0.9],
      },
      muted: { fullGameplayEquivalent: true, captions: [] },
      reducedMotion: {
        fullGameplayEquivalent: true,
        replacementStrategy: 'static-pose',
        timingInformationPreserved: true,
      },
      lowQuality: {
        fullGameplayEquivalent: true,
        preservesHitTargets: true,
        preservesStateLabels: true,
      },
    },
  }
}

test('accepts a complete pack with exact content cardinalities and references', () => {
  const result = validateUniversePackV2(validPack())
  assert.deepEqual(result.issues, [])
  assert.equal(result.valid, true)
  assert.doesNotThrow(() => assertValidUniversePackV2(validPack()))
})

test('reports exact pack cardinality and source reference paths', () => {
  const pack = validPack() as unknown as Record<string, any>
  pack.economy.generators = pack.economy.generators.slice(0, 17)

  const result = validateUniversePackV2(pack)
  assert.equal(result.valid, false)
  assert.ok(result.issues.some((entry) => (
    entry.path === 'economy.generators' && entry.code === 'cardinality.exact'
  )))
  assert.ok(result.issues.some((entry) => (
    entry.path === 'visual.objects[17].sourceId' && entry.code === 'source.reference-missing'
  )))
})

test('generator objects require meaning, five ownership states, fallbacks, and Heart clearance', () => {
  const invalid = {
    ...object('object-kindling-01', 'generator', 'kindling-01'),
    purpose: '   ',
    minimumHeartDistance: 0.5,
    ownershipStates: {
      ...ownershipStates(),
      100: undefined,
    },
    reducedMotionState: {
      ...state('reduced'),
      motion: { ...motion('still'), preservesTimingInformation: false },
    },
    lowQualityState: undefined,
  }

  const result = validateWorldObjectManifest(invalid, { path: 'visual.objects[0]' })
  const paths = new Set(result.issues.map((entry) => entry.path))
  assert.equal(result.valid, false)
  assert.ok(paths.has('visual.objects[0].purpose'))
  assert.ok(paths.has('visual.objects[0].ownershipStates.100'))
  assert.ok(paths.has('visual.objects[0].reducedMotionState.motion.preservesTimingInformation'))
  assert.ok(paths.has('visual.objects[0].lowQualityState'))
  assert.ok(paths.has('visual.objects[0].minimumHeartDistance'))
})

test('rejects divergent inline objects and unknown shelf references actionably', () => {
  const pack = validPack() as unknown as Record<string, any>
  pack.omens[0].object = { ...pack.omens[0].object, purpose: 'A conflicting inline meaning' }
  pack.archive.shelves[0].recordIds[0] = 'missing-record'

  const result = validateUniversePackV2(pack)
  assert.ok(result.issues.some((entry) => (
    entry.path === 'omens[0].object' && entry.code === 'visual.object-definition-mismatch'
  )))
  assert.ok(result.issues.some((entry) => (
    entry.path === 'archive.shelves[0].recordIds[0]'
      && entry.code === 'archive.record-reference-missing'
  )))
  assert.throws(
    () => assertValidUniversePackV2(pack),
    /omens\[0\]\.object: Object "object-omen-1" differs/,
  )
})

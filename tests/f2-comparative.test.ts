import assert from 'node:assert/strict'
import test from 'node:test'
import { EMBERLIGHT_V2 } from '../src/content/universes/emberlight-v2'
import type {
  UniversePackV2,
  VisualState,
  WorldObjectManifest,
} from '../src/content/universes/types'
import { validateUniversePackV2 } from '../src/render/manifest-validator'
import {
  F2ComparativeInputError,
  auditUniversePair,
  universeFingerprints,
  type ComparativeHarnessInput,
  type F2Condition,
  type IdentificationSubject,
  type ObservationSurface,
} from '../src/qa/f2'

const surfaces: readonly ObservationSurface[] = ['world', 'shop', 'archive', 'guide']
const conditions: readonly F2Condition[] = [
  'blind-visual',
  'audio-only',
  'muted',
  'high-contrast',
  'reduced-motion',
  'low-quality',
]
const requiredSubjects: Readonly<Record<F2Condition, readonly IdentificationSubject[]>> = {
  'blind-visual': ['world', 'heart', 'interactive-object', 'state'],
  'audio-only': ['world'],
  muted: ['world', 'heart', 'interactive-object', 'state'],
  'high-contrast': ['world', 'state'],
  'reduced-motion': ['world', 'heart', 'interactive-object', 'state'],
  'low-quality': ['world', 'heart', 'interactive-object', 'state'],
}

function tidalState(state: VisualState, index: number): VisualState {
  return {
    ...state,
    label: `synthetic state ${index}`,
    silhouette: `broad bowl silhouette with ${index + 2} descending fins`,
    material: [`layered water glass ${index}`, 'white foam edge'],
    motion: {
      kind: index % 2 === 0 ? 'tidal' : 'waveform',
      description: `a measured lateral surge in phase ${index}`,
      periodMs: 4_000 + index * 100,
      preservesTimingInformation: true,
    },
    countPresentation: index % 2 === 0 ? 'infrastructure' : 'group',
  }
}

function tidalObject(object: WorldObjectManifest, index: number): WorldObjectManifest {
  return {
    ...object,
    phenomenon: `synthetic current phenomenon ${index}`,
    purpose: `synthetic current purpose ${index}`,
    material: [`pressure glass ${index}`, 'foam seam'],
    silhouette: `horizontal current shelf with ${index + 1} downward vanes`,
    motion: {
      kind: index % 2 === 0 ? 'tidal' : 'waveform',
      description: `current ${index} advances laterally and returns as a flat band`,
      periodMs: 5_000 + index * 120,
      preservesTimingInformation: true,
    },
    reducedMotionState: tidalState(object.reducedMotionState, index),
    lowQualityState: tidalState(object.lowQualityState, index + 30),
  }
}

function syntheticTidefall(distinct: boolean): UniversePackV2 {
  const base: UniversePackV2 = {
    ...EMBERLIGHT_V2,
    id: 'tidefall',
    identity: {
      ...EMBERLIGHT_V2.identity,
      name: 'Synthetic Tidefall',
      shortName: 'Synthetic Tidefall',
      epithet: 'Synthetic comparison fixture',
    },
  }
  if (!distinct) return base
  const transformedObjects = base.visual.objects.map(tidalObject)
  const transformedObjectById = new Map(transformedObjects.map((object) => [object.id, object]))

  return {
    ...base,
    economy: {
      ...base.economy,
      currency: {
        ...base.economy.currency,
        localName: 'Synthetic Glow',
        glyph: '≋',
        material: 'pressure-lit seawater',
      },
      localPrestige: {
        ...base.economy.localPrestige,
        localName: 'Synthetic Undertow',
        rewardCurrency: {
          ...base.economy.localPrestige.rewardCurrency,
          localName: 'Synthetic Moon Salt',
          glyph: '◌',
          material: 'compressed salt pearl',
        },
      },
    },
    heart: {
      ...base.heart,
      localName: 'Synthetic Tideheart',
      phenomenon: 'A cold pressure basin holding a standing wave',
      purpose: 'A broad lateral input surface with a returning wake',
      material: ['pressure glass', 'white foam rim', 'black water core'],
      silhouette: 'a wide crescent basin with three descending fins',
      idleMotion: { kind: 'tidal', description: 'A horizontal waterline rises and falls across the basin', periodMs: 5_400, preservesTimingInformation: true },
      touchMotion: { kind: 'waveform', description: 'A flat compression ring travels outward and returns once', periodMs: 420, preservesTimingInformation: true },
      reducedMotionState: tidalState(base.heart.reducedMotionState, 80),
      lowQualityState: tidalState(base.heart.lowQualityState, 90),
    },
    physics: {
      ...base.physics,
      clickMultiplier: (_state, context) => context.rhythmAccuracy === null ? 1 : 1.1,
    },
    omens: base.omens.map((omen, index) => ({
      ...omen,
      spawn: {
        mode: 'scheduled' as const,
        scheduleMs: 30_000 + index * 5_000,
        oddsVisibleAfterDiscovery: true,
      },
      object: transformedObjectById.get(omen.object.id)!,
    })) as unknown as UniversePackV2['omens'],
    archive: {
      ...base.archive,
      localName: 'Synthetic Pelagic Archive',
      records: base.archive.records.map((record, index) => ({
        ...record,
        name: `Synthetic pelagic record ${index}`,
        object: transformedObjectById.get(record.object.id)!,
      })) as unknown as UniversePackV2['archive']['records'],
    },
    audio: {
      ...base.audio,
      tempoBpm: 96,
      meter: '6/8',
      cues: base.audio.cues.map((cue, index) => ({
        ...cue,
        family: `submerged-pressure-${index}`,
        synthesisKey: `filtered-current-${index}`,
      })),
      stems: base.audio.stems.map((stem, index) => ({
        ...stem,
        kindlingFamily: `tide-family-${index}`,
        description: `Submerged pulse layer ${index}`,
      })) as unknown as UniversePackV2['audio']['stems'],
      silenceState: 'A visible pressure meter and foam pulse replace every sound.',
    },
    visual: {
      ...base.visual,
      materials: ['pressure glass', 'black water', 'white foam', 'salt pearl'],
      primarySilhouettes: ['wide crescent basin', 'horizontal current shelf', 'descending pressure fins'],
      motionGrammar: ['tidal', 'waveform'],
      objects: transformedObjects,
    },
    beacon: {
      ...base.beacon,
      object: transformedObjectById.get(base.beacon.object.id)!,
    },
    accessibility: {
      ...base.accessibility,
      nonColorSignals: base.accessibility.nonColorSignals.map((signal, index) => ({
        ...signal,
        text: `synthetic state ${index}`,
        shape: `descending fin count ${index + 1}`,
        pattern: index % 2 === 0 ? 'wide-spaced horizontal bars' : 'paired chevrons',
        highContrastTreatment: `white band ${index + 1} on a black basin`,
      })),
      reducedMotion: {
        ...base.accessibility.reducedMotion,
        replacementStrategy: 'crossfade',
      },
    },
  }
}

function completeInput(left: UniversePackV2, right: UniversePackV2): ComparativeHarnessInput {
  const surfaceObservations = [left, right].flatMap((pack) => {
    const generator = pack.economy.generators[0]
    return surfaces.map((surface) => ({
      universeId: pack.id,
      surface,
      entityKind: 'generator' as const,
      entityId: generator.id,
      displayedName: generator.name,
      colorToken: `hue:${generator.hue}`,
      artifactId: `${pack.id}-${surface}-desktop`,
      sourcePath: `${surface}.generator.${generator.id}`,
    }))
  })
  const identificationTrials = conditions.flatMap((condition, index) => [left, right].flatMap((pack) =>
    requiredSubjects[condition].map((subject) => ({
      condition,
      expectedUniverseId: pack.id,
      identifiedUniverseId: pack.id,
      subject,
      testerId: `tester-${index + 1}`,
      artifactId: `${pack.id}-${condition}-${subject}-desktop`,
      cuesReported: [`synthetic cue ${index}`],
    }))))
  return { surfaceObservations, identificationTrials }
}

test('synthetic distinct packs pass every structural, condition, and consistency gate', () => {
  const right = syntheticTidefall(true)
  assert.deepEqual(validateUniversePackV2(EMBERLIGHT_V2), { valid: true, issues: [] })
  assert.deepEqual(validateUniversePackV2(right), { valid: true, issues: [] })
  const input = completeInput(EMBERLIGHT_V2, right)
  const report = auditUniversePair(EMBERLIGHT_V2, right, input)
  assert.equal(report.gatePassed, true)
  assert.deepEqual(report.defects, [])
  assert.ok(report.dimensionAudits.every((audit) => audit.distinguishable))
  assert.ok(report.conditionAudits.every((audit) => audit.passed && audit.accuracy === 1))
  assert.ok(report.consistencyAudits.every((audit) => audit.passed))
  assert.deepEqual(auditUniversePair(EMBERLIGHT_V2, right, input), report)
})

test('synthetic cloned presentation fails with actionable defects for both content owners', () => {
  const right = syntheticTidefall(false)
  const report = auditUniversePair(EMBERLIGHT_V2, right, completeInput(EMBERLIGHT_V2, right))
  assert.equal(report.gatePassed, false)
  assert.ok(report.dimensionAudits.some((audit) => !audit.distinguishable))
  assert.ok(report.defects.some((defect) => defect.owner === 'agent-01-emberlight'))
  assert.ok(report.defects.some((defect) => defect.owner === 'agent-02-tidefall'))
  for (const defect of report.defects.filter((entry) => entry.severity === 'gate')) {
    assert.ok(defect.path.length > 0)
    assert.ok(defect.reproduction.length >= 2)
    assert.ok(defect.evidence.leftSignature || defect.evidence.artifactIds.length > 0)
  }
})

test('misidentification and name/color drift preserve artifact evidence and exact ownership', () => {
  const right = syntheticTidefall(true)
  const baseline = completeInput(EMBERLIGHT_V2, right)
  const target = baseline.surfaceObservations.find((entry) => entry.universeId === 'tidefall' && entry.surface === 'guide')!
  const input: ComparativeHarnessInput = {
    surfaceObservations: baseline.surfaceObservations.map((entry) => entry === target ? {
      ...entry,
      displayedName: 'Wrong synthetic name',
      colorToken: 'hue:999',
    } : entry),
    identificationTrials: baseline.identificationTrials.map((trial, index) => index === 0 ? {
      ...trial,
      identifiedUniverseId: 'unclear',
      cuesReported: ['shape could not be distinguished'],
    } : trial),
  }
  const report = auditUniversePair(EMBERLIGHT_V2, right, input)
  assert.equal(report.gatePassed, false)
  const guideDefect = report.defects.find((defect) => defect.path === target.sourcePath)
  assert.ok(guideDefect)
  assert.equal(guideDefect.owner, 'agent-02-tidefall')
  assert.deepEqual(guideDefect.evidence.artifactIds, [target.artifactId])
  const identification = report.defects.find((defect) => defect.dimension === 'blind-visual' && defect.evidence.actual === 'unclear')
  assert.ok(identification)
  assert.deepEqual(identification.evidence.cues, ['shape could not be distinguished'])
})

test('invalid or same-id inputs fail closed before comparative claims are produced', () => {
  const right = syntheticTidefall(true)
  assert.throws(
    () => auditUniversePair({ ...EMBERLIGHT_V2, visual: { ...EMBERLIGHT_V2.visual, objects: [] } } as UniversePackV2, right, completeInput(EMBERLIGHT_V2, right)),
    F2ComparativeInputError,
  )
  assert.throws(
    () => auditUniversePair(EMBERLIGHT_V2, EMBERLIGHT_V2, completeInput(EMBERLIGHT_V2, right)),
    /different universe IDs/,
  )
})

test('missing real artifacts remain coverage defects and cannot produce an F2 pass claim', () => {
  const right = syntheticTidefall(true)
  const report = auditUniversePair(EMBERLIGHT_V2, right, {
    surfaceObservations: [],
    identificationTrials: [],
  })
  assert.equal(report.gatePassed, false)
  assert.ok(report.defects.some((defect) => defect.owner === 'team-q1' && defect.severity === 'coverage'))
  assert.ok(report.conditionAudits.every((audit) => audit.completedTrials === 0 && !audit.passed))
  assert.ok(report.consistencyAudits.every((audit) => !audit.passed))
})

test('label-free fingerprints are invariant to manifest, Omen, Archive, cue, and signal ordering', () => {
  const reordered: UniversePackV2 = {
    ...EMBERLIGHT_V2,
    omens: [...EMBERLIGHT_V2.omens].reverse() as unknown as UniversePackV2['omens'],
    archive: {
      ...EMBERLIGHT_V2.archive,
      records: [...EMBERLIGHT_V2.archive.records].reverse() as unknown as UniversePackV2['archive']['records'],
      shelves: [...EMBERLIGHT_V2.archive.shelves].reverse() as unknown as UniversePackV2['archive']['shelves'],
    },
    audio: {
      ...EMBERLIGHT_V2.audio,
      cues: [...EMBERLIGHT_V2.audio.cues].reverse(),
      stems: [...EMBERLIGHT_V2.audio.stems].reverse() as unknown as UniversePackV2['audio']['stems'],
    },
    visual: {
      ...EMBERLIGHT_V2.visual,
      objects: [...EMBERLIGHT_V2.visual.objects].reverse(),
      primarySilhouettes: [...EMBERLIGHT_V2.visual.primarySilhouettes].reverse(),
      materials: [...EMBERLIGHT_V2.visual.materials].reverse(),
      motionGrammar: [...EMBERLIGHT_V2.visual.motionGrammar].reverse(),
    },
    accessibility: {
      ...EMBERLIGHT_V2.accessibility,
      nonColorSignals: [...EMBERLIGHT_V2.accessibility.nonColorSignals].reverse(),
    },
  }
  assert.deepEqual(validateUniversePackV2(reordered), { valid: true, issues: [] })
  assert.deepEqual(universeFingerprints(reordered), universeFingerprints(EMBERLIGHT_V2))
})

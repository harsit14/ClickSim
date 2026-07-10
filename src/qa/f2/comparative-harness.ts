import type { UniverseId, UniversePackV2 } from '../../content/universes/types'
import { validateUniversePackV2, type ManifestValidationIssue } from '../../render/manifest-validator'
import {
  F2_COMPARATIVE_CONTRACT,
  type ComparativeAuditReport,
  type ComparativeDefect,
  type ComparativeHarnessInput,
  type ConditionAudit,
  type ConsistencyAudit,
  type F2Condition,
  type F2Dimension,
  type F2Owner,
  type IdentificationSubject,
  type IdentificationTrial,
  type ObservationSurface,
  type SurfaceObservation,
} from './comparative-types'
import {
  fingerprintSimilarity,
  universeFingerprints,
} from './fingerprints'

const DIMENSIONS: readonly F2Dimension[] = [
  'heart',
  'world-silhouette',
  'interactive-objects',
  'materials',
  'motion',
  'click-response',
  'omen-behavior',
  'archive',
  'local-prestige',
  'audio-families',
  'state-signals',
]

const CONDITIONS: readonly F2Condition[] = [
  'blind-visual',
  'audio-only',
  'muted',
  'high-contrast',
  'reduced-motion',
  'low-quality',
]

const SURFACES: readonly ObservationSurface[] = ['world', 'shop', 'archive', 'guide']

const REQUIRED_SUBJECTS: Readonly<Record<F2Condition, readonly IdentificationSubject[]>> = {
  'blind-visual': ['world', 'heart', 'interactive-object', 'state'],
  'audio-only': ['world'],
  muted: ['world', 'heart', 'interactive-object', 'state'],
  'high-contrast': ['world', 'state'],
  'reduced-motion': ['world', 'heart', 'interactive-object', 'state'],
  'low-quality': ['world', 'heart', 'interactive-object', 'state'],
}

const DIMENSION_THRESHOLDS: Readonly<Record<F2Dimension, number>> = {
  heart: 0.7,
  'world-silhouette': 0.7,
  'interactive-objects': 0.7,
  materials: 0.75,
  motion: 0.75,
  'click-response': 0.75,
  'omen-behavior': 0.7,
  archive: 0.75,
  'local-prestige': 0.8,
  'audio-families': 0.7,
  'state-signals': 0.75,
}

const CONDITION_THRESHOLDS: Readonly<Record<F2Condition, number>> = {
  'blind-visual': 0.72,
  'audio-only': 0.7,
  muted: 0.72,
  'high-contrast': 0.75,
  'reduced-motion': 0.72,
  'low-quality': 0.72,
}

const DIMENSION_PATHS: Readonly<Record<F2Dimension, string>> = {
  heart: 'heart',
  'world-silhouette': 'visual.primarySilhouettes',
  'interactive-objects': 'visual.objects',
  materials: 'visual.materials',
  motion: 'visual.motionGrammar',
  'click-response': 'heart.touchMotion',
  'omen-behavior': 'omens',
  archive: 'archive.records',
  'local-prestige': 'economy.localPrestige',
  'audio-families': 'audio',
  'state-signals': 'accessibility.nonColorSignals',
}

const CONDITION_PATHS: Readonly<Record<F2Condition, string>> = {
  'blind-visual': 'visual',
  'audio-only': 'audio',
  muted: 'accessibility.muted',
  'high-contrast': 'accessibility.nonColorSignals',
  'reduced-motion': 'accessibility.reducedMotion',
  'low-quality': 'accessibility.lowQuality',
}

export class F2ComparativeInputError extends TypeError {
  constructor(
    readonly side: 'left' | 'right',
    readonly issues: readonly ManifestValidationIssue[],
  ) {
    super(`F2 comparative ${side} pack failed validation: ${issues.map((issue) => `${issue.path}: ${issue.message}`).join('; ')}`)
    this.name = 'F2ComparativeInputError'
  }
}

function ownerFor(universeId: UniverseId): F2Owner {
  if (universeId === 'emberlight') return 'agent-01-emberlight'
  if (universeId === 'tidefall') return 'agent-02-tidefall'
  return 'team-q1'
}

function defectId(parts: readonly string[]): string {
  return parts.join('.').replace(/[^a-z0-9.-]/gi, '-').toLowerCase()
}

function expectedName(pack: UniversePackV2, observation: SurfaceObservation): string | null {
  switch (observation.entityKind) {
    case 'heart': return pack.heart.localName
    case 'currency': return pack.economy.currency.localName
    case 'generator': return pack.economy.generators.find((entry) => entry.id === observation.entityId)?.name ?? null
    case 'omen': return pack.omens.find((entry) => entry.id === observation.entityId)?.name ?? null
    case 'archive': return pack.archive.localName
    case 'archive-record': return pack.archive.records.find((entry) => entry.id === observation.entityId)?.name ?? null
    case 'local-prestige': return pack.economy.localPrestige.localName
  }
}

function dimensionCollisionDefects(
  packs: readonly [UniversePackV2, UniversePackV2],
  dimension: F2Dimension,
  similarity: number,
  leftSignature: string,
  rightSignature: string,
): ComparativeDefect[] {
  const reproduction = [
    `Generate ${dimension} fingerprints with labels and pack IDs removed.`,
    `Compare ${packs[0].id} with ${packs[1].id} using contract ${F2_COMPARATIVE_CONTRACT}.`,
    `Confirm similarity ${similarity.toFixed(3)} is at or above ${DIMENSION_THRESHOLDS[dimension].toFixed(3)}.`,
  ]
  return packs.map((pack) => ({
    id: defectId(['f2', dimension, pack.id, 'collision']),
    severity: 'gate' as const,
    owner: ownerFor(pack.id),
    universeId: pack.id,
    dimension,
    path: DIMENSION_PATHS[dimension],
    summary: `${pack.identity.shortName} is not structurally distinct enough from ${packs.find((entry) => entry !== pack)!.identity.shortName} in ${dimension}.`,
    reproduction,
    evidence: { artifactIds: [], leftSignature, rightSignature, similarity },
  }))
}

function consistencyAudits(
  packs: readonly [UniversePackV2, UniversePackV2],
  observations: readonly SurfaceObservation[],
  defects: ComparativeDefect[],
): ConsistencyAudit[] {
  return packs.map((pack) => {
    const local = observations.filter((observation) => observation.universeId === pack.id)
    const covered = SURFACES.filter((surface) => local.some((observation) => observation.surface === surface))
    for (const surface of SURFACES) {
      if (covered.includes(surface)) continue
      defects.push({
        id: defectId(['f2', 'coverage', pack.id, surface]),
        severity: 'coverage',
        owner: 'team-q1',
        universeId: pack.id,
        dimension: 'input-coverage',
        path: `surfaceObservations.${pack.id}.${surface}`,
        summary: `No ${surface} observation was supplied for ${pack.identity.shortName}.`,
        reproduction: [
          `Capture the desktop ${surface} view for ${pack.identity.shortName}.`,
          'Record at least one entity name and canonical color token.',
          'Rerun the comparative harness with the new observation.',
        ],
        evidence: { artifactIds: [] },
      })
    }

    for (const observation of local) {
      const expected = expectedName(pack, observation)
      if (expected === null) {
        defects.push({
          id: defectId(['f2', 'unknown-observation', pack.id, observation.surface, observation.entityId]),
          severity: 'coverage', owner: 'team-q1', universeId: pack.id, dimension: 'input-coverage',
          path: observation.sourcePath,
          summary: `${observation.entityId} is not a known ${observation.entityKind} in ${pack.identity.shortName}.`,
          reproduction: ['Inspect the observation input.', 'Replace the entity ID with a stable ID from the validated pack.'],
          evidence: { artifactIds: [observation.artifactId], actual: observation.entityId },
        })
        continue
      }
      if (observation.displayedName === expected) continue
      defects.push({
        id: defectId(['f2', 'name', pack.id, observation.surface, observation.entityId]),
        severity: 'major',
        owner: ownerFor(pack.id),
        universeId: pack.id,
        dimension: 'consistency',
        path: observation.sourcePath,
        summary: `${observation.surface} uses a noncanonical name for ${observation.entityId}.`,
        reproduction: [
          `Open the ${observation.surface} desktop view from artifact ${observation.artifactId}.`,
          `Locate ${observation.entityId}.`,
          `Compare its displayed name with ${expected}.`,
        ],
        evidence: { artifactIds: [observation.artifactId], expected, actual: observation.displayedName },
      })
    }

    const groups = new Map<string, SurfaceObservation[]>()
    for (const observation of local) {
      const key = `${observation.entityKind}:${observation.entityId}`
      groups.set(key, [...(groups.get(key) ?? []), observation])
    }
    for (const [key, group] of groups) {
      if (group.length < 2) continue
      const canonicalName = group[0].displayedName
      const canonicalColor = group[0].colorToken
      for (const observation of group.slice(1)) {
        if (observation.displayedName !== canonicalName) {
          defects.push({
            id: defectId(['f2', 'cross-surface-name', pack.id, observation.surface, key]),
            severity: 'major', owner: ownerFor(pack.id), universeId: pack.id, dimension: 'consistency',
            path: observation.sourcePath,
            summary: `${key} changes name between desktop surfaces.`,
            reproduction: group.map((entry) => `Compare ${entry.surface} artifact ${entry.artifactId}: ${entry.displayedName}.`),
            evidence: { artifactIds: group.map((entry) => entry.artifactId), expected: canonicalName, actual: observation.displayedName },
          })
        }
        if (observation.colorToken !== canonicalColor) {
          defects.push({
            id: defectId(['f2', 'cross-surface-color', pack.id, observation.surface, key]),
            severity: 'major', owner: ownerFor(pack.id), universeId: pack.id, dimension: 'consistency',
            path: observation.sourcePath,
            summary: `${key} changes color token between desktop surfaces.`,
            reproduction: group.map((entry) => `Compare ${entry.surface} artifact ${entry.artifactId}: ${entry.colorToken}.`),
            evidence: { artifactIds: group.map((entry) => entry.artifactId), expected: canonicalColor, actual: observation.colorToken },
          })
        }
      }
    }

    return {
      universeId: pack.id,
      surfacesCovered: covered,
      observationCount: local.length,
      passed: covered.length === SURFACES.length && !defects.some((defect) =>
        defect.universeId === pack.id && (defect.dimension === 'consistency' || defect.dimension === 'input-coverage')),
    }
  })
}

function trialDefect(pack: UniversePackV2, trial: IdentificationTrial): ComparativeDefect {
  return {
    id: defectId(['f2', 'identification', trial.condition, pack.id, trial.artifactId, trial.testerId]),
    severity: 'gate',
    owner: ownerFor(pack.id),
    universeId: pack.id,
    dimension: trial.condition,
    path: CONDITION_PATHS[trial.condition],
    summary: `${pack.identity.shortName} was not identifiable in the ${trial.condition} ${trial.subject} trial.`,
    reproduction: [
      `Open artifact ${trial.artifactId} under ${trial.condition}.`,
      `Hide labels and pack-identifying metadata required by the protocol.`,
      `Ask tester ${trial.testerId} to identify the ${trial.subject}.`,
    ],
    evidence: {
      artifactIds: [trial.artifactId],
      expected: pack.id,
      actual: trial.identifiedUniverseId,
      cues: trial.cuesReported,
    },
  }
}

/** Pure deterministic comparison. It never reads the DOM, audio, storage, clocks, or random state. */
export function auditUniversePair(
  left: UniversePackV2,
  right: UniversePackV2,
  input: ComparativeHarnessInput,
): ComparativeAuditReport {
  const leftValidation = validateUniversePackV2(left)
  if (!leftValidation.valid) throw new F2ComparativeInputError('left', leftValidation.issues)
  const rightValidation = validateUniversePackV2(right)
  if (!rightValidation.valid) throw new F2ComparativeInputError('right', rightValidation.issues)
  if (left.id === right.id) throw new RangeError('F2 comparative harness requires two different universe IDs')

  const packs = [left, right] as const
  const packIds = new Set<UniverseId>(packs.map((pack) => pack.id))
  const fingerprints = packs.map(universeFingerprints) as ReturnType<typeof universeFingerprints>[]
  const defects: ComparativeDefect[] = []

  const dimensionAudits = DIMENSIONS.map((dimension) => {
    const leftFingerprint = fingerprints[0].dimensions[dimension]
    const rightFingerprint = fingerprints[1].dimensions[dimension]
    const similarity = fingerprintSimilarity(leftFingerprint, rightFingerprint)
    const distinguishable = similarity < DIMENSION_THRESHOLDS[dimension]
    if (!distinguishable) {
      defects.push(...dimensionCollisionDefects(
        packs,
        dimension,
        similarity,
        leftFingerprint.signature,
        rightFingerprint.signature,
      ))
    }
    return {
      dimension,
      left: leftFingerprint,
      right: rightFingerprint,
      similarity,
      maximumAllowedSimilarity: DIMENSION_THRESHOLDS[dimension],
      distinguishable,
    }
  })

  const validTrials = input.identificationTrials.filter((trial) => packIds.has(trial.expectedUniverseId))
  for (const trial of input.identificationTrials) {
    if (packIds.has(trial.expectedUniverseId)) continue
    defects.push({
      id: defectId(['f2', 'trial-input', trial.condition, trial.artifactId]),
      severity: 'coverage', owner: 'team-q1', universeId: null, dimension: 'input-coverage',
      path: `identificationTrials.${trial.artifactId}`,
      summary: `Identification trial expects ${trial.expectedUniverseId}, which is outside this pair.`,
      reproduction: ['Inspect the trial input.', `Replace expectedUniverseId with ${left.id} or ${right.id}.`],
      evidence: { artifactIds: [trial.artifactId], expected: `${left.id}|${right.id}`, actual: trial.expectedUniverseId },
    })
  }

  const conditionAudits: ConditionAudit[] = CONDITIONS.map((condition) => {
    const leftFingerprint = fingerprints[0].conditions[condition]
    const rightFingerprint = fingerprints[1].conditions[condition]
    const similarity = fingerprintSimilarity(leftFingerprint, rightFingerprint)
    const structurallyDistinct = similarity < CONDITION_THRESHOLDS[condition]
    if (!structurallyDistinct) {
      for (const pack of packs) {
        defects.push({
          id: defectId(['f2', condition, pack.id, 'structural-collision']),
          severity: 'gate', owner: ownerFor(pack.id), universeId: pack.id, dimension: condition,
          path: CONDITION_PATHS[condition],
          summary: `${pack.identity.shortName} lacks a distinct ${condition} fingerprint.`,
          reproduction: [
            `Generate label-free ${condition} fingerprints for ${left.id} and ${right.id}.`,
            `Confirm similarity ${similarity.toFixed(3)} is at or above ${CONDITION_THRESHOLDS[condition].toFixed(3)}.`,
          ],
          evidence: {
            artifactIds: [],
            leftSignature: leftFingerprint.signature,
            rightSignature: rightFingerprint.signature,
            similarity,
          },
        })
      }
    }
    const trials = validTrials.filter((trial) => trial.condition === condition)
    const correctTrials = trials.filter((trial) => trial.identifiedUniverseId === trial.expectedUniverseId)
    for (const pack of packs) {
      if (trials.some((trial) => trial.expectedUniverseId === pack.id)) continue
      defects.push({
        id: defectId(['f2', 'trial-coverage', condition, pack.id]),
        severity: 'coverage', owner: 'team-q1', universeId: pack.id, dimension: 'input-coverage',
        path: `identificationTrials.${condition}.${pack.id}`,
        summary: `No ${condition} identification trial was supplied for ${pack.identity.shortName}.`,
        reproduction: [
          `Capture a desktop ${condition} artifact for ${pack.identity.shortName}.`,
          'Run a blind identification trial and record the tester response and cues.',
        ],
        evidence: { artifactIds: [] },
      })
    }
    let hasRequiredSubjectCoverage = true
    for (const pack of packs) {
      for (const subject of REQUIRED_SUBJECTS[condition]) {
        if (trials.some((trial) => trial.expectedUniverseId === pack.id && trial.subject === subject)) continue
        hasRequiredSubjectCoverage = false
        defects.push({
          id: defectId(['f2', 'subject-coverage', condition, pack.id, subject]),
          severity: 'coverage', owner: 'team-q1', universeId: pack.id, dimension: 'input-coverage',
          path: `identificationTrials.${condition}.${pack.id}.${subject}`,
          summary: `No ${condition} ${subject} identification trial was supplied for ${pack.identity.shortName}.`,
          reproduction: [
            `Capture the desktop ${subject} under ${condition} for ${pack.identity.shortName}.`,
            'Run blind identification and record the response and cues.',
          ],
          evidence: { artifactIds: [] },
        })
      }
    }
    for (const trial of trials) {
      if (trial.identifiedUniverseId === trial.expectedUniverseId) continue
      const pack = packs.find((entry) => entry.id === trial.expectedUniverseId)!
      defects.push(trialDefect(pack, trial))
    }
    const hasPairCoverage = packs.every((pack) => trials.some((trial) => trial.expectedUniverseId === pack.id))
    const accuracy = trials.length > 0 ? correctTrials.length / trials.length : null
    return {
      condition,
      predictedSimilarity: similarity,
      maximumAllowedSimilarity: CONDITION_THRESHOLDS[condition],
      structurallyDistinct,
      completedTrials: trials.length,
      correctTrials: correctTrials.length,
      accuracy,
      passed: structurallyDistinct && hasPairCoverage && hasRequiredSubjectCoverage && accuracy === 1,
    }
  })

  const relevantObservations = input.surfaceObservations.filter((observation) => packIds.has(observation.universeId))
  const consistency = consistencyAudits(packs, relevantObservations, defects)
  for (const observation of input.surfaceObservations) {
    if (packIds.has(observation.universeId)) continue
    defects.push({
      id: defectId(['f2', 'observation-input', observation.artifactId]),
      severity: 'coverage', owner: 'team-q1', universeId: null, dimension: 'input-coverage',
      path: observation.sourcePath,
      summary: `Surface observation belongs to ${observation.universeId}, outside the compared pair.`,
      reproduction: ['Inspect the observation input.', `Use only ${left.id} and ${right.id} observations.`],
      evidence: { artifactIds: [observation.artifactId], expected: `${left.id}|${right.id}`, actual: observation.universeId },
    })
  }

  return {
    contractVersion: F2_COMPARATIVE_CONTRACT,
    packIds: [left.id, right.id],
    dimensionAudits,
    conditionAudits,
    consistencyAudits: consistency,
    defects,
    gatePassed: defects.length === 0
      && dimensionAudits.every((audit) => audit.distinguishable)
      && conditionAudits.every((audit) => audit.passed)
      && consistency.every((audit) => audit.passed),
  }
}

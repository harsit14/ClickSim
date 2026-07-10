import type {
  AudioCueDef,
  UniversePackV2,
  VisualState,
  WorldObjectManifest,
} from '../../content/universes/types'
import type {
  F2Condition,
  F2Dimension,
  FeatureFingerprint,
  UniverseFingerprints,
} from './comparative-types'

const clean = (value: string): string => value.trim().toLowerCase().replace(/\s+/g, ' ')

function stableHash(features: readonly string[]): string {
  let hash = 0x811c9dc5
  for (const char of features.join('\u001f')) {
    hash ^= char.charCodeAt(0)
    hash = Math.imul(hash, 0x01000193) >>> 0
  }
  return hash.toString(16).padStart(8, '0')
}

export function fingerprint(features: readonly string[]): FeatureFingerprint {
  const normalized = [...new Set(features.map(clean).filter(Boolean))].sort()
  return { signature: stableHash(normalized), features: normalized }
}

function stateFeatures(prefix: string, state: VisualState): string[] {
  return [
    `${prefix}:silhouette:${state.silhouette}`,
    ...state.material.map((material) => `${prefix}:material:${material}`),
    `${prefix}:motion:${state.motion.kind}:${state.motion.description}`,
    `${prefix}:count:${state.countPresentation}`,
  ]
}

function objectFeatures(prefix: string, object: WorldObjectManifest): string[] {
  return [
    `${prefix}:zone:${object.screenZone}`,
    `${prefix}:salience:${object.salience}`,
    `${prefix}:silhouette:${object.silhouette}`,
    ...object.material.map((material) => `${prefix}:material:${material}`),
    `${prefix}:motion:${object.motion.kind}:${object.motion.description}`,
  ]
}

function cue(pack: UniversePackV2, cueId: string): AudioCueDef | undefined {
  return pack.audio.cues.find((entry) => entry.id === cueId)
}

function audioRoleFeatures(pack: UniversePackV2): string[] {
  const roles = [
    ['touch', pack.audio.clickMaterialCue],
    ['purchase', pack.audio.purchaseIntervalCue],
    ['critical', pack.audio.criticalAccentCue],
    ['omen', pack.audio.omenCallCue],
    ['prestige', pack.audio.prestigeCadenceCue],
  ] as const
  return [
    `tempo:${pack.audio.tempoBpm}`,
    `meter:${pack.audio.meter}`,
    ...roles.flatMap(([role, id]) => {
      const entry = cue(pack, id)
      return entry ? [`${role}:family:${entry.family}`, `${role}:synthesis:${entry.synthesisKey}`] : []
    }),
    ...pack.audio.stems.map((stem) => `stem:description:${stem.description}`),
    `silence:${pack.audio.silenceState}`,
  ]
}

function dimensionFeatures(pack: UniversePackV2): Readonly<Record<F2Dimension, string[]>> {
  const interactive = pack.visual.objects.filter((object) =>
    object.salience === 'interactive' || object.salience === 'milestone')
  const touchCue = cue(pack, pack.heart.touchCue)
  return {
    heart: [
      `silhouette:${pack.heart.silhouette}`,
      ...pack.heart.material.map((material) => `material:${material}`),
      `idle:${pack.heart.idleMotion.kind}:${pack.heart.idleMotion.description}`,
      `touch:${pack.heart.touchMotion.kind}:${pack.heart.touchMotion.description}`,
    ],
    'world-silhouette': [
      ...pack.visual.primarySilhouettes.map((silhouette) => `primary:${silhouette}`),
      ...pack.visual.objects.flatMap((object) => objectFeatures(`object:${object.sourceKind}:${object.screenZone}:${object.salience}`, object)),
    ],
    'interactive-objects': interactive.flatMap((object) => objectFeatures(`interactive:${object.sourceKind}:${object.screenZone}:${object.salience}`, object)),
    materials: [
      ...pack.visual.materials.map((material) => `world:${material}`),
      ...pack.heart.material.map((material) => `heart:${material}`),
      ...pack.visual.objects.flatMap((object) => object.material.map((material) => `object:${material}`)),
    ],
    motion: [
      ...pack.visual.motionGrammar.map((motion) => `grammar:${motion}`),
      `heart-idle:${pack.heart.idleMotion.kind}:${pack.heart.idleMotion.description}`,
      `heart-touch:${pack.heart.touchMotion.kind}:${pack.heart.touchMotion.description}`,
      ...pack.visual.objects.map((object) => `object:${object.motion.kind}:${object.motion.description}`),
    ],
    'click-response': [
      `touch-motion:${pack.heart.touchMotion.kind}:${pack.heart.touchMotion.description}`,
      `click-law:${pack.physics.clickMultiplier ? 'explicit' : 'identity'}`,
      ...(touchCue ? [`audio-family:${touchCue.family}`, `audio-synthesis:${touchCue.synthesisKey}`] : []),
    ],
    'omen-behavior': pack.omens.flatMap((omen) => [
      `omen:spawn:${omen.spawn.mode}`,
      `omen:chance:${omen.spawn.baseChance ?? 'none'}`,
      `omen:pity:${omen.spawn.pityThreshold ?? 'none'}`,
      `omen:schedule:${omen.spawn.scheduleMs ?? 'none'}`,
      `omen:reward-count:${omen.rewards.length}`,
      ...omen.rewards.flatMap((reward) => reward.effects.map((effect) => `omen:effect:${effect.kind}`)),
      ...objectFeatures(`omen:object:${omen.object.screenZone}:${omen.object.salience}`, omen.object),
    ]),
    archive: [
      `record-count:${pack.archive.records.length}`,
      `shelf-count:${pack.archive.shelves.length}`,
      ...pack.archive.records.flatMap((record) => objectFeatures(`record:${record.object.screenZone}:${record.object.salience}`, record.object)),
    ],
    'local-prestige': [
      `reward-glyph:${pack.economy.localPrestige.rewardCurrency.glyph}`,
      `reward-material:${pack.economy.localPrestige.rewardCurrency.material}`,
      ...pack.economy.localPrestige.loses.map((scope) => `loses:${scope}`),
      ...pack.economy.localPrestige.retains.map((scope) => `retains:${scope}`),
      ...(() => {
        const cadence = cue(pack, pack.audio.prestigeCadenceCue)
        return cadence ? [`cadence-family:${cadence.family}`, `cadence-synthesis:${cadence.synthesisKey}`] : []
      })(),
    ],
    'audio-families': audioRoleFeatures(pack),
    'state-signals': pack.accessibility.nonColorSignals.flatMap((signal) => [
      `state:shape:${signal.shape}`,
      `state:pattern:${signal.pattern}`,
      `state:contrast:${signal.highContrastTreatment}`,
    ]),
  }
}

function conditionFeatures(
  pack: UniversePackV2,
  dimensions: Readonly<Record<F2Dimension, FeatureFingerprint>>,
): Readonly<Record<F2Condition, string[]>> {
  const blind = [
    ...dimensions.heart.features,
    ...dimensions['world-silhouette'].features,
    ...dimensions['interactive-objects'].features,
    ...dimensions.materials.features,
    ...dimensions.motion.features,
  ]
  return {
    'blind-visual': blind,
    'audio-only': [...dimensions['audio-families'].features],
    muted: [
      ...blind,
      `muted-equivalent:${pack.accessibility.muted.fullGameplayEquivalent}`,
      `caption-channels:${pack.accessibility.muted.captions.length}`,
    ],
    'high-contrast': [...dimensions['state-signals'].features],
    'reduced-motion': [
      ...stateFeatures('heart', pack.heart.reducedMotionState),
      ...pack.visual.objects.flatMap((object) => stateFeatures(`object:${object.sourceKind}:${object.screenZone}:${object.salience}`, object.reducedMotionState)),
      `replacement:${pack.accessibility.reducedMotion.replacementStrategy}`,
      `timing-preserved:${pack.accessibility.reducedMotion.timingInformationPreserved}`,
    ],
    'low-quality': [
      ...stateFeatures('heart', pack.heart.lowQualityState),
      ...pack.visual.objects.flatMap((object) => stateFeatures(`object:${object.sourceKind}:${object.screenZone}:${object.salience}`, object.lowQualityState)),
      `hit-targets:${pack.accessibility.lowQuality.preservesHitTargets}`,
      `state-labels:${pack.accessibility.lowQuality.preservesStateLabels}`,
    ],
  }
}

export function universeFingerprints(pack: UniversePackV2): UniverseFingerprints {
  const rawDimensions = dimensionFeatures(pack)
  const dimensions = Object.fromEntries(
    Object.entries(rawDimensions).map(([key, features]) => [key, fingerprint(features)]),
  ) as Readonly<Record<F2Dimension, FeatureFingerprint>>
  const rawConditions = conditionFeatures(pack, dimensions)
  const conditions = Object.fromEntries(
    Object.entries(rawConditions).map(([key, features]) => [key, fingerprint(features)]),
  ) as Readonly<Record<F2Condition, FeatureFingerprint>>
  return { dimensions, conditions }
}

export function fingerprintSimilarity(left: FeatureFingerprint, right: FeatureFingerprint): number {
  const leftSet = new Set(left.features)
  const rightSet = new Set(right.features)
  const union = new Set([...leftSet, ...rightSet])
  if (union.size === 0) return 1
  let intersection = 0
  for (const feature of leftSet) if (rightSet.has(feature)) intersection += 1
  return intersection / union.size
}

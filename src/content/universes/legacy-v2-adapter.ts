import { assertValidUniverseAudioDef } from '../../audio/semantic-contract'
import { assertValidUniversePackV2 } from '../../render/manifest-validator'
import type {
  EighteenTuple,
  GeneratorDefV2,
  UniversePack,
  UniversePackV2,
  UpgradeDefV2,
} from './types'

export type UniversePackV2Supplement = Omit<UniversePackV2, 'economy' | 'story'> & {
  readonly economy: Pick<
    UniversePackV2['economy'],
    'currency' | 'doctrines' | 'localPrestige'
  >
  readonly story: Pick<
    UniversePackV2['story'],
    'civilizationQuestion' | 'scenes'
  >
}

function requireText(value: unknown, path: string): asserts value is string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new TypeError(`Legacy V2 supplement is missing authored text at ${path}.`)
  }
}

function assertAccessibilitySupplement(
  accessibility: UniversePackV2['accessibility'],
): void {
  requireText(accessibility.heartLabel, 'accessibility.heartLabel')
  requireText(accessibility.currencyLabel, 'accessibility.currencyLabel')
  if (accessibility.screenReaderOrder.length === 0) {
    throw new TypeError('Legacy V2 supplement requires an authored screen-reader order.')
  }
  if (accessibility.nonColorSignals.length === 0) {
    throw new TypeError('Legacy V2 supplement requires authored non-color state signals.')
  }
  const [minimum, maximum] = accessibility.timing.averagedRewardRatio
  if (
    accessibility.timing.averagedModeAvailable !== true
    || !Number.isFinite(minimum)
    || !Number.isFinite(maximum)
    || minimum < 0.85
    || maximum > 0.9
    || minimum > maximum
  ) {
    throw new TypeError(
      'Legacy V2 supplement averaged rhythm must stay within the approved 85–90% range.',
    )
  }
  for (const [path, value] of [
    ['accessibility.timing.visualCue', accessibility.timing.visualCue],
    ['accessibility.timing.audioCue', accessibility.timing.audioCue],
    ['accessibility.timing.shapeCue', accessibility.timing.shapeCue],
  ] as const) {
    requireText(value, path)
  }
  if (
    accessibility.muted.fullGameplayEquivalent !== true
    || accessibility.reducedMotion.fullGameplayEquivalent !== true
    || accessibility.reducedMotion.timingInformationPreserved !== true
    || accessibility.lowQuality.fullGameplayEquivalent !== true
    || accessibility.lowQuality.preservesHitTargets !== true
    || accessibility.lowQuality.preservesStateLabels !== true
  ) {
    throw new TypeError('Legacy V2 supplement accessibility fallbacks must preserve full gameplay.')
  }
}

function assertSupplementMatchesLegacy(
  legacy: UniversePack,
  supplement: UniversePackV2Supplement,
): void {
  if (legacy.id !== supplement.id) {
    throw new TypeError(
      `Legacy pack ${legacy.id} cannot use V2 supplement ${supplement.id}.`,
    )
  }
  if (legacy.name !== supplement.identity.name) {
    throw new TypeError('Legacy and V2 universe names must match during the bridge.')
  }
  if (legacy.shortName !== supplement.identity.shortName) {
    throw new TypeError('Legacy and V2 short names must match during the bridge.')
  }
  if (supplement.story.civilizationQuestion !== supplement.identity.civilizationQuestion) {
    throw new TypeError('V2 identity and story civilization questions must match exactly.')
  }
  if (legacy.generators.length !== 18) {
    throw new TypeError(
      `Legacy V2 bridge requires exactly 18 Kindlings; received ${legacy.generators.length}.`,
    )
  }
  assertAccessibilitySupplement(supplement.accessibility)
}

/**
 * Temporary F1 bridge. It copies only the legacy fields approved by the F0 contract;
 * every semantic, visual, audio, physics, and accessibility field comes from the
 * explicit supplement and is validated before a consumer receives the pack.
 */
export function adaptLegacyUniversePack(
  legacy: UniversePack,
  supplement: UniversePackV2Supplement,
): UniversePackV2 {
  assertSupplementMatchesLegacy(legacy, supplement)
  const generators = [...legacy.generators] as unknown as EighteenTuple<GeneratorDefV2>
  const upgrades = [...legacy.upgrades] as unknown as readonly UpgradeDefV2[]
  const pack: UniversePackV2 = {
    ...supplement,
    economy: {
      ...supplement.economy,
      generators,
      upgrades,
    },
    story: {
      ...supplement.story,
      lumen: [...legacy.lumen],
      echoes: [...legacy.echoes],
    },
  }

  assertValidUniversePackV2(pack)
  assertValidUniverseAudioDef(pack.audio)
  return pack
}

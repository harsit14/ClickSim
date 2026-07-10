export interface TidefallOmenRuntimeSpec {
  readonly id: 'spring-tide' | 'undertow' | 'moon-pearl' | 'abyssal-bloom' | 'leviathan-passage'
  readonly durationSec: number
  readonly productionMultiplier?: number
  readonly clickMultiplier?: number
  readonly storedRateSeconds?: number
  readonly minimumAward?: number
  readonly surfacings?: number
  readonly archiveRecordId?: 'snail'
  readonly description: string
}

/**
 * Tidefall-only authored reward identity. The first four entries mirror the existing
 * save-stable power-up table exactly; Leviathan adds a nonexclusive Archive interaction.
 */
export const TIDEFALL_OMEN_RUNTIME_SPECS: readonly TidefallOmenRuntimeSpec[] = [
  {
    id: 'spring-tide',
    durationSec: 54,
    productionMultiplier: 9,
    clickMultiplier: 3,
    description: 'A broad crest empowers production while keeping touch relevant.',
  },
  {
    id: 'undertow',
    durationSec: 21,
    productionMultiplier: 2,
    clickMultiplier: 333,
    description: 'A short inward pull makes each deliberate touch carry the lower current.',
  },
  {
    id: 'moon-pearl',
    durationSec: 90,
    productionMultiplier: 2,
    storedRateSeconds: 1_200,
    minimumAward: 50,
    description: 'A compressed tide releases stored production and then a gentle current.',
  },
  {
    id: 'abyssal-bloom',
    durationSec: 12,
    productionMultiplier: 25,
    clickMultiplier: 25,
    description: 'The trench blooms upward in a short symmetric production and touch eruption.',
  },
  {
    id: 'leviathan-passage',
    durationSec: 36,
    surfacings: 3,
    archiveRecordId: 'snail',
    description: 'Following three forecast surfacings reveals a Century Leviathan Archive variant; missing it removes nothing.',
  },
]

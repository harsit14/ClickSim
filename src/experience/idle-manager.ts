import type { EconomyAmount, UniverseId } from '../content/universes/types'
import {
  brahmalokCommissionStatus,
  kailashFrontStatus,
  vishnulokStrainStatus,
} from '../content/universes/f4-runtime'

export interface IdleManagerRealmStatus {
  readonly bankedCount: number
  readonly liveDecision: boolean
  readonly attentionCount: number
  readonly controlLabel: string | null
}

type NumericLawState = Record<string, EconomyAmount>

export function idleManagerRealmStatus(
  universeId: UniverseId,
  state: NumericLawState,
  owned: Readonly<Record<string, number>>,
  archiveCount: number,
): IdleManagerRealmStatus {
  let bankedCount = 0
  let liveDecision = false
  let controlLabel: string | null = null

  if (universeId === 'verdance') {
    controlLabel = 'Growth Rings'
  } else if (universeId === 'brahmalok') {
    controlLabel = 'creation mandala'
    if ((owned['brahmalok-kindling-07'] ?? 0) > 0) {
      const status = brahmalokCommissionStatus(state, owned, archiveCount)
      bankedCount = status.bankedCount
      liveDecision = status.phase === 'active'
    }
  } else if (universeId === 'vishnulok') {
    controlLabel = 'Endless Circuit'
    if ((owned['vishnulok-kindling-08'] ?? 0) > 0) {
      const status = vishnulokStrainStatus(state)
      bankedCount = status.bankedCount
      liveDecision = status.phase === 'present'
    }
  } else if (universeId === 'kailash') {
    controlLabel = 'Still Point'
    if ((owned['kailash-kindling-09'] ?? 0) > 0) {
      const status = kailashFrontStatus(state, owned)
      bankedCount = status.bankedCount
      liveDecision = status.phase !== 'calm'
    }
  }

  return {
    bankedCount,
    liveDecision,
    attentionCount: bankedCount + (liveDecision ? 1 : 0),
    controlLabel,
  }
}

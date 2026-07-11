import { game } from '../engine/game.svelte'
import { beatPhaseSec, isPlaying } from '../audio/music'
import { perkBonus } from '../content/constellation'
import { chargeOmenAttraction } from './falling-stars.svelte'
import { pushToast } from './toasts.svelte'
import { universeById } from '../content/universes'
import {
  BASE_RHYTHM_WINDOW_MS,
  rhythmAttractionCheckpoint,
  rhythmMultiplierForStreak,
} from './rhythm-balance'

/** Click within this many seconds of a beat to keep the combo alive.
 *  The Conductor constellation node widens it. */
const BASE_WINDOW_SEC = BASE_RHYTHM_WINDOW_MS / 1_000
const windowSec = () =>
  BASE_WINDOW_SEC +
  perkBonus(game.constellation, 'comboWindow') +
  (game.curiosities.includes('metronome-heart')
    ? universeById(game.activeUniverse).cabinet.beatWindowBonus
    : 0)

export const combo = $state({ streak: 0, lastRewardAt: 0 })

export function comboMult(): number {
  return rhythmMultiplierForStreak(combo.streak)
}

function rhythmReward() {
  const checkpoint = rhythmAttractionCheckpoint(combo.streak)
  if (!checkpoint || checkpoint.rewardAt <= combo.lastRewardAt) return
  combo.lastRewardAt = checkpoint.rewardAt
  const universe = universeById(game.activeUniverse)
  if (universe.twist.randomnessAllowed && chargeOmenAttraction(checkpoint.charge)) {
    const events = universe.events
    pushToast(
      game.activeUniverse === 'tidefall'
        ? 'The current answers'
        : game.activeUniverse === 'verdance'
          ? 'The canopy answers'
          : 'The sky answers',
      `Your rhythm has drawn a ${events.noun} into reach.`,
      'beat streak',
    )
  }
}

/** true while The Silence trial holds the music (and the combo) hostage */
export function silenced(): boolean {
  return game.challenge === 'silence'
}

/** Call once per ember click. Returns the multiplier to apply to that click. */
export function registerClick(): number {
  if (silenced() || !isPlaying()) {
    combo.streak = 0
    combo.lastRewardAt = 0
    return 1
  }
  const phase = beatPhaseSec()
  if (phase !== null && Math.abs(phase) <= windowSec()) {
    combo.streak += 1
    if (combo.streak > game.bestCombo) game.bestCombo = combo.streak
    rhythmReward()
  } else {
    combo.streak = 0
    combo.lastRewardAt = 0
  }
  return comboMult()
}

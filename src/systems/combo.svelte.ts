import { game } from '../engine/game.svelte'
import { beatPhaseSec, isPlaying } from '../audio/music'
import { perkBonus } from '../content/constellation'
import { addBuff } from './buffs.svelte'
import { summonFallingStar } from './falling-stars.svelte'
import { pushToast } from './toasts.svelte'

/** Click within this many seconds of a beat to keep the combo alive.
 *  The Conductor constellation node widens it. */
const BASE_WINDOW_SEC = 0.13
const windowSec = () => BASE_WINDOW_SEC + perkBonus(game.constellation, 'comboWindow')

export const combo = $state({ streak: 0, lastRewardAt: 0 })

const REWARDS = [
  { at: 8, label: 'Rhythm ×1.5', prodMult: 1, clickMult: 1.5, duration: 10, star: false },
  { at: 16, label: 'Resonance ×2', prodMult: 1.25, clickMult: 2, duration: 18, star: true },
  { at: 32, label: 'Chorus ×3', prodMult: 1.5, clickMult: 3, duration: 25, star: true },
  { at: 64, label: 'Skyfall ×5', prodMult: 2, clickMult: 5, duration: 35, star: true },
]

export function comboMult(): number {
  const s = combo.streak
  if (s >= 64) return 20
  if (s >= 32) return 15
  if (s >= 16) return 10
  if (s >= 8) return 5
  if (s >= 4) return 2
  return 1
}

function rhythmReward() {
  const reward = [...REWARDS].reverse().find((r) => combo.streak >= r.at)
  if (!reward) return
  const rewardAt = reward.at === 64 && combo.streak > 64 ? Math.floor(combo.streak / 32) * 32 : reward.at
  if (rewardAt <= combo.lastRewardAt) return
  if (reward.at === 64 && combo.streak > 64 && combo.streak % 32 !== 0) return

  combo.lastRewardAt = rewardAt
  addBuff(
    { id: 'rhythm', label: reward.label, prodMult: reward.prodMult, clickMult: reward.clickMult },
    reward.duration,
  )

  if (reward.star && summonFallingStar()) {
    pushToast('The sky answers', 'Your rhythm pulls a falling star into reach.', 'beat streak')
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

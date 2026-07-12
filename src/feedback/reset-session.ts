import { clearBuffs } from '../systems/buffs.svelte'
import { combo } from '../systems/combo.svelte'
import { resetFallingStars } from '../systems/falling-stars.svelte'
import { clearToasts } from '../systems/toasts.svelte'
import { resetLiveFeedbackRuntime } from './live-runtime.svelte'

/** Clears session-only feedback without changing progression or saved preferences. */
export function resetSessionFeedback(): void {
  clearBuffs()
  clearToasts()
  resetFallingStars()
  resetLiveFeedbackRuntime()
  combo.streak = 0
  combo.lastRewardAt = 0
}

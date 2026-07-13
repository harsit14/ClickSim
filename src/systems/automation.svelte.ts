import {
  availableUpgrades,
} from '../engine/compute'
import {
  game,
  buyUpgrade,
  performSupernova,
  supernovaGain,
} from '../engine/game.svelte'
import { clearBuffs } from './buffs.svelte'
import { combo } from './combo.svelte'
import { pushToast } from './toasts.svelte'
import { save } from '../core/save'
import { gamePaused } from '../core/pause.svelte'
import {
  gteAmount,
  isZeroAmount,
  subtractAmounts,
  toAmount,
} from '../core/numeric/amount'
import { format } from '../core/format'
import { selectAutoKindlerPurchase } from './auto-kindler'

const TICK_MS = 2_000

function autoKindle() {
  const purchase = selectAutoKindlerPurchase(game, {
    families: game.autoKindlerFamilies,
    priority: game.autoKindlerPriority,
  })
  if (!purchase) return
  game.light = subtractAmounts(game.light, purchase.cost)
  game.owned[purchase.generator.id] = purchase.owned + 1
}

function autoStoke() {
  const next = availableUpgrades(game).find((u) => gteAmount(game.light, toAmount(u.cost)))
  if (next) buyUpgrade(next.id)
}

function autoNova() {
  const gain = performSupernova()
  if (isZeroAmount(gain)) return
  clearBuffs()
  combo.streak = 0
  combo.lastRewardAt = 0
  save()
  pushToast('The Nova Engine turns', `✧ ${format(gain)} stardust, harvested without ceremony.`, 'automation')
}

export function startAutomation() {
  setInterval(() => {
    if (gamePaused() || game.challenge) return // story scenes pause; trials are taken bare-handed
    if (game.singUpgrades.includes('auto-kindler') && game.autoKindler) autoKindle()
    if (game.singUpgrades.includes('auto-stoker') && game.autoStoker) autoStoke()
    if (
      game.singUpgrades.includes('nova-engine') &&
      game.autoNova &&
      gteAmount(supernovaGain(), game.autoNovaThreshold)
    ) {
      autoNova()
    }
  }, TICK_MS)
}

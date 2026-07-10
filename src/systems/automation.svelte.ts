import { universeById } from '../content/universes'
import {
  availableUpgrades,
  costOf,
  costMultOf,
  costScaleOf,
  genDisabled,
  globalMult,
  unitRate,
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
import type { EconomyAmount } from '../content/universes/types'
import {
  amountLog10,
  gteAmount,
  isZeroAmount,
  multiplyAmounts,
  subtractAmounts,
  toAmount,
} from '../core/numeric/amount'
import { format } from '../core/format'

const TICK_MS = 2_000

function autoKindle() {
  let bestPayback = Infinity
  let bestId: string | null = null
  let bestCost: EconomyAmount | null = null
  const scale = costScaleOf(game)
  for (const g of universeById(game.activeUniverse).generators) {
    if (genDisabled(game, g)) continue
    const owned = game.owned[g.id] ?? 0
    const cost = costOf(g, owned, costMultOf(game, g), scale)
    if (!gteAmount(game.light, cost)) continue
    const delta = multiplyAmounts(unitRate(game, g), globalMult(game))
    if (isZeroAmount(delta)) continue
    const paybackLog = amountLog10(cost) - amountLog10(delta)
    const payback = paybackLog > 308 ? Number.MAX_VALUE : paybackLog < -324 ? 0 : 10 ** paybackLog
    if (payback < bestPayback) {
      bestPayback = payback
      bestId = g.id
      bestCost = cost
    }
  }
  if (!bestId || !bestCost) return
  game.light = subtractAmounts(game.light, bestCost)
  game.owned[bestId] = (game.owned[bestId] ?? 0) + 1
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

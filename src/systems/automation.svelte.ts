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

const TICK_MS = 2_000

function autoKindle() {
  let bestPayback = Infinity
  let bestId: string | null = null
  let bestCost = 0
  const scale = costScaleOf(game)
  for (const g of universeById(game.activeUniverse).generators) {
    if (genDisabled(game, g)) continue
    const owned = game.owned[g.id] ?? 0
    const cost = costOf(g, owned, costMultOf(game, g), scale)
    if (cost > game.light) continue
    const delta = unitRate(game, g) * globalMult(game)
    const payback = cost / Math.max(delta, 1e-12)
    if (payback < bestPayback) {
      bestPayback = payback
      bestId = g.id
      bestCost = cost
    }
  }
  if (!bestId) return
  game.light -= bestCost
  game.owned[bestId] = (game.owned[bestId] ?? 0) + 1
}

function autoStoke() {
  const next = availableUpgrades(game).find((u) => u.cost <= game.light)
  if (next) buyUpgrade(next.id)
}

function autoNova() {
  const gain = performSupernova()
  if (gain <= 0) return
  clearBuffs()
  combo.streak = 0
  combo.lastRewardAt = 0
  save()
  pushToast('The Nova Engine turns', `✧ ${gain} stardust, harvested without ceremony.`, 'automation')
}

export function startAutomation() {
  setInterval(() => {
    if (game.challenge) return // trials are taken bare-handed
    if (game.singUpgrades.includes('auto-kindler') && game.autoKindler) autoKindle()
    if (game.singUpgrades.includes('auto-stoker') && game.autoStoker) autoStoke()
    if (
      game.singUpgrades.includes('nova-engine') &&
      game.autoNova &&
      supernovaGain() >= Math.max(1, game.autoNovaThreshold)
    ) {
      autoNova()
    }
  }, TICK_MS)
}

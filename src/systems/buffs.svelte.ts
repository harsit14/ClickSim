import { gameTime } from '../core/pause.svelte'

export interface Buff {
  id: string
  label: string
  prodMult: number
  clickMult: number
  until: number // pause-aware game clock ms
}

export const buffState = $state<{ list: Buff[] }>({ list: [] })

export function addBuff(b: Omit<Buff, 'until'>, durationSec: number) {
  const until = gameTime() + durationSec * 1000
  const existing = buffState.list.find((x) => x.id === b.id)
  if (existing) {
    const stronger = b.prodMult * b.clickMult >= existing.prodMult * existing.clickMult
    if (stronger) existing.label = b.label
    existing.prodMult = Math.max(existing.prodMult, b.prodMult)
    existing.clickMult = Math.max(existing.clickMult, b.clickMult)
    existing.until = Math.max(existing.until, until)
  }
  else buffState.list.push({ ...b, until })
}

/** Pure read — safe inside $derived. Pruning happens in tickBuffs(). */
export function productionBuffMult(now = gameTime()): number {
  let m = 1
  for (const b of buffState.list) if (b.until > now) m *= b.prodMult
  return m
}

export function clickBuffMult(now = gameTime()): number {
  let m = 1
  for (const b of buffState.list) if (b.until > now) m *= b.clickMult
  return m
}

/** The supernova takes the blessings too. */
export function clearBuffs() {
  buffState.list = []
}

/** Called from the game loop: drop expired buffs. */
export function tickBuffs() {
  const now = gameTime()
  if (buffState.list.some((b) => b.until <= now)) {
    buffState.list = buffState.list.filter((b) => b.until > now)
  }
}

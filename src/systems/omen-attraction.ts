export const OMEN_ATTRACTION_CAP = 100

export interface OmenAttractionAdvance {
  readonly charge: number
  readonly ready: boolean
  readonly overflow: number
}

export function advanceOmenAttraction(current: number, added: number): OmenAttractionAdvance {
  if (!Number.isFinite(current) || current < 0 || !Number.isFinite(added) || added <= 0) {
    return { charge: 0, ready: false, overflow: 0 }
  }
  const total = Math.min(OMEN_ATTRACTION_CAP * 2, current + added)
  return {
    charge: Math.min(OMEN_ATTRACTION_CAP, total),
    ready: total >= OMEN_ATTRACTION_CAP,
    overflow: Math.max(0, total - OMEN_ATTRACTION_CAP),
  }
}

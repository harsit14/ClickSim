export type ParticleRecipeKind = 'click' | 'on-beat' | 'critical' | 'purchase' | 'achievement' | 'omen'

export interface ParticleRecipe {
  readonly kind: ParticleRecipeKind
  readonly count: readonly [number, number]
  readonly lifeMs: readonly [number, number]
  readonly gravity: number
  readonly gravityAfterMs?: number
  readonly gravityAfter?: number
  readonly tailLength: number
  readonly blend: 'additive' | 'normal'
  readonly behavior: string
}

export const PARTICLE_RECIPES: Readonly<Record<ParticleRecipeKind, ParticleRecipe>> = {
  click: {
    kind: 'click', count: [5, 9], lifeMs: [650, 760], gravity: -120, gravityAfterMs: 300,
    gravityAfter: 60, tailLength: 6, blend: 'additive', behavior: 'up-biased seventy-degree cone; leap, hang, settle',
  },
  'on-beat': {
    kind: 'on-beat', count: [5, 9], lifeMs: [650, 760], gravity: -120, gravityAfterMs: 300,
    gravityAfter: 60, tailLength: 12, blend: 'additive', behavior: 'organized click sparks with one rhythm ring and optional braid',
  },
  critical: {
    kind: 'critical', count: [4, 4], lifeMs: [150, 720], gravity: 0, gravityAfterMs: 160,
    gravityAfter: 180, tailLength: 24, blend: 'additive', behavior: 'three clean struck-flint lines and one deep bouncing spark',
  },
  purchase: {
    kind: 'purchase', count: [1, 1], lifeMs: [400, 400], gravity: 0,
    tailLength: 9, blend: 'additive', behavior: 'price mote travels to the purchased world address',
  },
  achievement: {
    kind: 'achievement', count: [1, 1], lifeMs: [700, 700], gravity: 0,
    tailLength: 18, blend: 'additive', behavior: 'one light line travels from the cause to the Kindled Sky',
  },
  omen: {
    kind: 'omen', count: [12, 16], lifeMs: [1_100, 1_800], gravity: 240,
    tailLength: 5, blend: 'additive', behavior: 'glints fall with real gravity and inhabit the ground',
  },
}

export function particleRecipe(kind: ParticleRecipeKind): ParticleRecipe {
  return PARTICLE_RECIPES[kind]
}

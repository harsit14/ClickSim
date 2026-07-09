import type { GameState } from '../engine/game.svelte'

/** Vestments — cosmetic accent themes, earned by playing. Pure expression, zero power. */
export interface ThemeDef {
  id: string
  name: string
  flavor: string
  unlockText: string
  unlocked: (g: GameState) => boolean
  /** CSS custom properties applied to :root; every theme sets the full accent set */
  vars: Record<string, string>
}

export const THEMES: ThemeDef[] = [
  {
    id: 'ember',
    name: 'Emberlight',
    flavor: 'The first warmth. The default of the universe.',
    unlockText: 'always yours',
    unlocked: () => true,
    vars: {
      '--amber': '#ffb35c',
      '--gold': '#ffd98a',
      '--panel': 'rgba(20, 18, 32, 0.78)',
    },
  },
  {
    id: 'vellum',
    name: 'Vellum',
    flavor: 'The color of Lumen’s favorite pages.',
    unlockText: 'recover 5 echoes',
    unlocked: (g) => g.echoes.length >= 5,
    vars: {
      '--amber': '#e6c887',
      '--gold': '#f4e6c0',
      '--panel': 'rgba(30, 26, 19, 0.80)',
    },
  },
  {
    id: 'voidglass',
    name: 'Voidglass',
    flavor: 'What the dark looks like when it decides to be beautiful.',
    unlockText: 'collapse into the Deep once',
    unlocked: (g) => g.collapses >= 1,
    vars: {
      '--amber': '#a99cf0',
      '--gold': '#d8d2ff',
      '--panel': 'rgba(17, 15, 34, 0.80)',
    },
  },
  {
    id: 'dawnforge',
    name: 'Dawnforge',
    flavor: 'Anvil-sparks and stubborn mornings.',
    unlockText: 'complete 3 trials',
    unlocked: (g) => g.challengesDone.length >= 3,
    vars: {
      '--amber': '#ff8f63',
      '--gold': '#ffc79a',
      '--panel': 'rgba(33, 17, 14, 0.80)',
    },
  },
]

export const THEME_BY_ID = new Map(THEMES.map((t) => [t.id, t]))

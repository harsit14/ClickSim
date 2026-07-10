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
  /** World-specific tailoring keeps a vestment visible without erasing universe identity. */
  universeVars?: Record<string, Record<string, string>>
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
    universeVars: {
      tidefall: {
        '--amber': '#58ded8',
        '--gold': '#b9fff2',
        '--panel': 'rgba(7, 24, 34, 0.82)',
      },
      verdance: {
        '--amber': '#75c989',
        '--gold': '#d5ef9b',
        '--panel': 'rgba(10, 28, 18, 0.82)',
      },
      clockwork: {
        '--amber': '#d8a84e',
        '--gold': '#ffe1a3',
        '--panel': 'rgba(18, 21, 25, 0.88)',
      },
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
    universeVars: {
      tidefall: {
        '--amber': '#9ccfbf',
        '--gold': '#e4e0bd',
        '--panel': 'rgba(17, 31, 31, 0.84)',
      },
      verdance: {
        '--amber': '#9dbd78',
        '--gold': '#edf0c1',
        '--panel': 'rgba(22, 34, 21, 0.84)',
      },
      clockwork: {
        '--amber': '#c7a568',
        '--gold': '#f3e2bb',
        '--panel': 'rgba(31, 29, 25, 0.86)',
      },
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
    universeVars: {
      tidefall: {
        '--amber': '#8f9cf2',
        '--gold': '#c9d5ff',
        '--panel': 'rgba(10, 18, 42, 0.84)',
      },
      verdance: {
        '--amber': '#7fae9f',
        '--gold': '#c9e5d5',
        '--panel': 'rgba(12, 29, 27, 0.86)',
      },
      clockwork: {
        '--amber': '#7f9db0',
        '--gold': '#d4e3e8',
        '--panel': 'rgba(17, 24, 30, 0.88)',
      },
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
    universeVars: {
      tidefall: {
        '--amber': '#f08f7b',
        '--gold': '#ffd0aa',
        '--panel': 'rgba(33, 20, 27, 0.84)',
      },
      verdance: {
        '--amber': '#c77a52',
        '--gold': '#efd197',
        '--panel': 'rgba(36, 23, 17, 0.86)',
      },
      clockwork: {
        '--amber': '#c77b4a',
        '--gold': '#f3c793',
        '--panel': 'rgba(34, 22, 18, 0.88)',
      },
    },
  },
]

export const THEME_BY_ID = new Map(THEMES.map((t) => [t.id, t]))

export function themeVarsForUniverse(theme: ThemeDef, universeId: string): Record<string, string> {
  return { ...theme.vars, ...(theme.universeVars?.[universeId] ?? {}) }
}

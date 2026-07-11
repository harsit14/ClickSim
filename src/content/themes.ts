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
      prismata: { '--amber': '#d7a34c', '--gold': '#fff0c7', '--panel': 'rgba(22, 16, 24, 0.9)' },
      tempest: { '--amber': '#5577c8', '--gold': '#f5e5ae', '--panel': 'rgba(8, 14, 35, 0.9)' },
      canticle: { '--amber': '#d89bc7', '--gold': '#fff0f7', '--panel': 'rgba(27, 12, 28, 0.88)' },
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
      prismata: { '--amber': '#c8a66b', '--gold': '#f5e6c2', '--panel': 'rgba(29, 24, 27, 0.88)' },
      tempest: { '--amber': '#8196b8', '--gold': '#eee2c2', '--panel': 'rgba(18, 24, 42, 0.88)' },
      canticle: { '--amber': '#c1a0b0', '--gold': '#f2e3e8', '--panel': 'rgba(34, 25, 32, 0.86)' },
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
      prismata: { '--amber': '#889fc5', '--gold': '#e1e6f4', '--panel': 'rgba(18, 18, 35, 0.9)' },
      tempest: { '--amber': '#6881c5', '--gold': '#e0dcce', '--panel': 'rgba(10, 17, 46, 0.9)' },
      canticle: { '--amber': '#a186c8', '--gold': '#e2d4f2', '--panel': 'rgba(26, 17, 39, 0.88)' },
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
      prismata: { '--amber': '#d58b58', '--gold': '#f7cf9f', '--panel': 'rgba(38, 22, 24, 0.9)' },
      tempest: { '--amber': '#b88667', '--gold': '#efd6ae', '--panel': 'rgba(34, 23, 35, 0.89)' },
      canticle: { '--amber': '#cc7f91', '--gold': '#f5cad0', '--panel': 'rgba(39, 21, 31, 0.88)' },
    },
  },
  {
    id: 'aurora-archive',
    name: 'Aurora Archive',
    flavor: 'A cool page-edge moving like weather over old glass.',
    unlockText: 'purchase from the Lumen Vault',
    unlocked: (g) => g.lumenPurchases?.includes('skin-aurora-archive') ?? false,
    vars: {
      '--amber': '#58e0bd',
      '--gold': '#d4fff1',
      '--panel': 'rgba(8, 30, 31, 0.84)',
    },
    universeVars: {
      tidefall: { '--amber': '#51d6cf', '--gold': '#d2fffa', '--panel': 'rgba(6, 28, 38, 0.86)' },
      verdance: { '--amber': '#69d48a', '--gold': '#dcffc5', '--panel': 'rgba(8, 32, 20, 0.86)' },
      clockwork: { '--amber': '#73c8ae', '--gold': '#ddfff2', '--panel': 'rgba(10, 29, 28, 0.88)' },
      prismata: { '--amber': '#6ebfc2', '--gold': '#ddf6e8', '--panel': 'rgba(10, 27, 32, 0.9)' },
      tempest: { '--amber': '#5c9ea0', '--gold': '#e1ecd6', '--panel': 'rgba(7, 26, 39, 0.9)' },
      canticle: { '--amber': '#70d4b8', '--gold': '#e2fff6', '--panel': 'rgba(11, 27, 30, 0.88)' },
    },
  },
  {
    id: 'eclipse-gold',
    name: 'Eclipse Gold',
    flavor: 'The bright edge of something choosing not to consume the Sun.',
    unlockText: 'purchase from the Lumen Vault',
    unlocked: (g) => g.lumenPurchases?.includes('skin-eclipse-gold') ?? false,
    vars: {
      '--amber': '#d69b38',
      '--gold': '#fff0ad',
      '--panel': 'rgba(18, 15, 12, 0.88)',
    },
    universeVars: {
      tidefall: { '--amber': '#cfad4c', '--gold': '#fff2b8', '--panel': 'rgba(19, 20, 20, 0.89)' },
      verdance: { '--amber': '#c99d42', '--gold': '#f6e7a3', '--panel': 'rgba(21, 21, 14, 0.89)' },
      clockwork: { '--amber': '#dda349', '--gold': '#ffedb0', '--panel': 'rgba(22, 18, 14, 0.9)' },
      prismata: { '--amber': '#d2a044', '--gold': '#fff0b8', '--panel': 'rgba(24, 18, 20, 0.92)' },
      tempest: { '--amber': '#c29a4f', '--gold': '#f8e9b8', '--panel': 'rgba(16, 19, 31, 0.91)' },
      canticle: { '--amber': '#cf9460', '--gold': '#ffe4bd', '--panel': 'rgba(24, 17, 21, 0.9)' },
    },
  },
  {
    id: 'chorusglass',
    name: 'Chorusglass',
    flavor: 'Several voices remain visible in one polished surface.',
    unlockText: 'purchase from the Lumen Vault',
    unlocked: (g) => g.lumenPurchases?.includes('skin-chorusglass') ?? false,
    vars: {
      '--amber': '#e291c5',
      '--gold': '#f7e6ff',
      '--panel': 'rgba(28, 16, 35, 0.86)',
    },
    universeVars: {
      tidefall: { '--amber': '#bd8dd8', '--gold': '#efe4ff', '--panel': 'rgba(21, 17, 38, 0.88)' },
      verdance: { '--amber': '#c589bd', '--gold': '#f5e1f2', '--panel': 'rgba(28, 18, 32, 0.88)' },
      clockwork: { '--amber': '#c896b0', '--gold': '#f7e5ec', '--panel': 'rgba(30, 20, 30, 0.89)' },
      prismata: { '--amber': '#c78cad', '--gold': '#f7e2df', '--panel': 'rgba(30, 18, 34, 0.91)' },
      tempest: { '--amber': '#9b88ba', '--gold': '#e9dfd4', '--panel': 'rgba(19, 17, 42, 0.9)' },
      canticle: { '--amber': '#e09abe', '--gold': '#ffe7f3', '--panel': 'rgba(33, 18, 34, 0.89)' },
    },
  },
]

export const THEME_BY_ID = new Map(THEMES.map((t) => [t.id, t]))

export function themeVarsForUniverse(theme: ThemeDef, universeId: string): Record<string, string> {
  return { ...theme.vars, ...(theme.universeVars?.[universeId] ?? {}) }
}

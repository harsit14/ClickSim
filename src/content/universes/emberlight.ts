import { ECHOES } from '../echoes'
import { GENERATORS, GENERATOR_BY_ID } from '../generators'
import { LUMEN_LINES } from '../lumen'
import { UPGRADES } from '../upgrades'
import type { UniversePack } from './types'

export const EMBERLIGHT: UniversePack = {
  id: 'emberlight',
  name: 'The Emberlight',
  shortName: 'Emberlight',
  currency: 'Light',
  currencyGlyph: '✦',
  description: 'The first warm universe, rebuilt from one ember.',
  generators: GENERATORS,
  generatorById: GENERATOR_BY_ID,
  upgrades: UPGRADES,
  upgradeById: new Map(UPGRADES.map((u) => [u.id, u])),
  lumen: LUMEN_LINES,
  echoes: ECHOES,
  palette: { theme: 'ember', accentHue: 42, vars: { '--bg': '#07070d' } },
  musicMode: 'emberlight',
  twist: {
    id: 'baseline',
    name: 'Baseline',
    randomnessAllowed: true,
    description: 'Light rises at a steady rate. This is the physics you remember.',
  },
  route: {
    glyph: '✦',
    epithet: 'the first warmth',
    arrival: 'a familiar ember waits where you left it',
    unlockText: 'your first and oldest route',
  },
  beacon: {
    generatorId: 'ember2',
    count: 1,
    reward: 3,
    description: 'The Second Ember answers the dark between worlds.',
  },
}

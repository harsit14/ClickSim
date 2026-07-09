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
  description: 'The first warm universe, rebuilt from one ember.',
  generators: GENERATORS,
  generatorById: GENERATOR_BY_ID,
  upgrades: UPGRADES,
  upgradeById: new Map(UPGRADES.map((u) => [u.id, u])),
  lumen: LUMEN_LINES,
  echoes: ECHOES,
  palette: { theme: 'ember', accentHue: 42 },
  musicMode: 'emberlight',
  twist: {
    id: 'baseline',
    name: 'Baseline',
    randomnessAllowed: true,
  },
}

import { ECHOES } from '../echoes'
import { GENERATORS, GENERATOR_BY_ID } from '../generators'
import { LUMEN_LINES } from '../lumen'
import { UPGRADES } from '../upgrades'
import { EMBERLIGHT_CABINET } from '../curiosities'
import type { UniversePack } from './types'

export const EMBERLIGHT: UniversePack = {
  id: 'emberlight',
  name: 'The Emberlight',
  shortName: 'Emberlight',
  currency: 'Light',
  currencyGlyph: '✦',
  centralObject: 'Ember',
  description: 'The first warm universe, rebuilt from one ember.',
  generators: GENERATORS,
  generatorById: GENERATOR_BY_ID,
  upgrades: UPGRADES,
  upgradeById: new Map(UPGRADES.map((u) => [u.id, u])),
  lumen: LUMEN_LINES,
  echoes: ECHOES,
  palette: { theme: 'ember', accentHue: 42, vars: { '--bg': '#07070d' } },
  audio: { music: 'emberlight', click: 'emberlight', event: 'emberlight' },
  events: {
    noun: 'falling star',
    motion: 'meteor',
    powerUps: [
      { id: 'frenzy', label: 'Frenzy', glyph: '×7', hue: 38, weight: 45, prodMult: 7, clickMult: 7, durationSec: 77, toast: 'The sky ignites. All {currency} and clicks surge together.' },
      { id: 'gift', label: 'Gift', glyph: '+15m', hue: 52, weight: 45, rateSeconds: 900, minAward: 25, toast: 'Fifteen minutes of {currency}, gathered at once.' },
      { id: 'fury', label: 'Fury', glyph: '×777', hue: 5, weight: 10, clickMult: 777, durationSec: 13, toast: 'The ember answers with impossible force.' },
    ],
  },
  cabinet: EMBERLIGHT_CABINET,
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

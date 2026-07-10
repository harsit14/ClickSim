import type { EchoDef } from '../echoes'
import type { GeneratorDef } from '../generators'
import type { LumenLine } from '../lumen'
import type { UpgradeDef } from '../upgrades'
import type { CuriosityCabinetDef } from '../curiosities'

export interface UniverseAudioIdentity {
  music: 'emberlight' | 'tidefall'
  click: 'emberlight' | 'tidefall'
  event: 'emberlight' | 'tidefall'
}

export interface UniversePowerUp {
  id: string
  label: string
  glyph: string
  hue: number
  weight: number
  prodMult?: number
  clickMult?: number
  durationSec?: number
  /** instant award as this many seconds of passive production */
  rateSeconds?: number
  minAward?: number
  toast: string
}

export interface UniverseEventIdentity {
  noun: string
  motion: 'meteor' | 'bubble'
  powerUps: UniversePowerUp[]
}

export interface UniverseTwist {
  id: string
  name: string
  randomnessAllowed: boolean
  description: string
  /** Multiplies production at a wall-clock moment. Average should remain near 1. */
  rateMultiplier?: (timeMs: number) => number
}

export interface UniversePalette {
  theme: string
  accentHue: number
  vars: Record<string, string>
}

export interface UniverseRoute {
  glyph: string
  epithet: string
  arrival: string
  unlockText: string
}

export interface UniverseBeacon {
  generatorId: string
  count: number
  reward: number
  description: string
}

export interface UniversePack {
  id: string
  name: string
  shortName: string
  currency: string
  currencyGlyph: string
  centralObject: string
  /** The +1% production power awarded by each achievement in this world. */
  achievementPower: string
  description: string
  generators: GeneratorDef[]
  generatorById: Map<string, GeneratorDef>
  upgrades: UpgradeDef[]
  upgradeById: Map<string, UpgradeDef>
  lumen: LumenLine[]
  echoes: EchoDef[]
  palette: UniversePalette
  audio: UniverseAudioIdentity
  events: UniverseEventIdentity
  cabinet: CuriosityCabinetDef
  twist: UniverseTwist
  route: UniverseRoute
  beacon: UniverseBeacon
}

import type { EchoDef } from '../echoes'
import type { GeneratorDef } from '../generators'
import type { LumenLine } from '../lumen'
import type { UpgradeDef } from '../upgrades'

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
  description: string
  generators: GeneratorDef[]
  generatorById: Map<string, GeneratorDef>
  upgrades: UpgradeDef[]
  upgradeById: Map<string, UpgradeDef>
  lumen: LumenLine[]
  echoes: EchoDef[]
  palette: UniversePalette
  musicMode: string
  twist: UniverseTwist
  route: UniverseRoute
  beacon: UniverseBeacon
}

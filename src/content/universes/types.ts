import type { EchoDef } from '../echoes'
import type { GeneratorDef } from '../generators'
import type { LumenLine } from '../lumen'
import type { UpgradeDef } from '../upgrades'

export interface UniverseTwist {
  id: string
  name: string
  randomnessAllowed: boolean
}

export interface UniversePalette {
  theme: string
  accentHue: number
}

export interface UniversePack {
  id: string
  name: string
  shortName: string
  currency: string
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
}

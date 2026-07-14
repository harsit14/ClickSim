import type { EconomyAmount } from '../../content/universes/types'
import { DEFAULT_UNIVERSE_ID } from '../../content/universes'
import {
  AUTO_KINDLER_FAMILIES,
  type AutoKindlerFamily,
  type AutoKindlerPriority,
} from '../../core/automation-preferences'
import type { BeatVisual, MotionPreference, TextScale, VisualQuality } from '../../core/preferences'
import { ONE_AMOUNT, ZERO_AMOUNT } from '../../core/numeric/amount'
import { emptyEndgameState, type ActiveAtlasRoute, type EndgameState, type LawLoadout } from '../../endgame/types'
import type { EcoState } from '../compute'

export type BuyAmount = 1 | 10 | 100 | 'max'

export interface RunSnapshot {
  light: EconomyAmount
  totalEarned: EconomyAmount
  owned: Record<string, number>
  upgrades: string[]
  buyAmount: BuyAmount
  numericLawState: Record<string, EconomyAmount>
}

/** The progression that stays anchored to one universe when the Vessel leaves. */
export interface UniverseRunState {
  light: EconomyAmount
  totalEarned: EconomyAmount
  clicks: number
  owned: Record<string, number>
  upgrades: string[]
  buyAmount: BuyAmount
  seen: string[]
  stardust: EconomyAmount
  stardustTotal: EconomyAmount
  supernovae: number
  constellation: string[]
  stardustWorks: Record<string, number>
  echoes: string[]
  eraEarned: EconomyAmount
  singularities: EconomyAmount
  singTotal: EconomyAmount
  collapses: number
  singUpgrades: string[]
  deepWorks: Record<string, number>
  challenge: string | null
  challengeReturn: RunSnapshot | null
  challengesDone: string[]
  autoKindler: boolean
  autoStoker: boolean
  autoNova: boolean
  autoNovaThreshold: EconomyAmount
  ending: 'warden' | 'hunger' | 'companion' | null
  curiosities: string[]
  keeperFedUntil: number
  snailLastGiftAt: number
  crits: number
  bestCrit: EconomyAmount
  numericLawState: Record<string, EconomyAmount>
  /** Save-stable lifetime loka traces; survives local Epoch and Deep resets. */
  lokaProgress: Record<string, number>
}

export interface ClickResult {
  amount: EconomyAmount
  crit: boolean
  critMult: number
}

export interface GameState extends EcoState, Omit<EndgameState,
  'activeAtlasRoute' | 'lawLoadouts' | 'activeLawLoadoutId' | 'successionRelays' | 'lumenPurchases'
> {
  successionRelays: Record<string, number>
  lumenPurchases: string[]
  activeAtlasRoute: ActiveAtlasRoute | null
  lawLoadouts: LawLoadout[]
  activeLawLoadoutId: string | null
  ui: string[]
  seen: string[]
  playtime: number
  sfxVolume: number
  musicVolume: number
  audioFocusMode: boolean
  motionPreference: MotionPreference
  visualQuality: VisualQuality
  beatVisual: BeatVisual
  textScale: TextScale
  highContrast: boolean
  showAchievementPopups: boolean
  showRoutineToasts: boolean
  showWorldScenery: boolean
  showInteractionEffects: boolean
  buyAmount: BuyAmount
  starsCaught: number
  bestCombo: number
  /** Light earned across all rebirths; never resets. */
  allTimeEarned: EconomyAmount
  /** Light earned in this Deep era; drives Epoch Matter and resets at Deep Collapse. */
  eraEarned: EconomyAmount
  stardust: EconomyAmount
  supernovae: number
  echoes: string[]
  singularities: EconomyAmount
  singTotal: EconomyAmount
  collapses: number
  autoKindler: boolean
  autoKindlerFamilies: AutoKindlerFamily[]
  autoKindlerPriority: AutoKindlerPriority
  autoStoker: boolean
  autoNova: boolean
  autoNovaThreshold: EconomyAmount
  challengeReturn: RunSnapshot | null
  theme: string
  pastEndings: Array<'warden' | 'hunger' | 'companion'>
  curiosities: string[]
  keeperFedUntil: number
  snailLastGiftAt: number
  crits: number
  bestCrit: EconomyAmount
  beacons: string[]
  darkBetween: EconomyAmount
  wayfinder: string[]
  vesselParts: string[]
  vesselPartsByUniverse: Record<string, string[]>
  universeRuns: Record<string, UniverseRunState>
  numericLawState: Record<string, EconomyAmount>
  lokaProgress: Record<string, number>
}

/** Reactive state only. Mutations belong in scoped action modules or the compatibility facade. */
export const game: GameState = $state({
  activeUniverse: DEFAULT_UNIVERSE_ID,
  light: ZERO_AMOUNT,
  totalEarned: ZERO_AMOUNT,
  clicks: 0,
  owned: {},
  upgrades: [],
  achievements: [],
  stardustTotal: ZERO_AMOUNT,
  constellation: [],
  stardustWorks: {},
  singUpgrades: [],
  deepWorks: {},
  challenge: null,
  challengesDone: [],
  ui: [],
  seen: [],
  playtime: 0,
  sfxVolume: 0.5,
  musicVolume: 0.6,
  audioFocusMode: false,
  motionPreference: 'system',
  visualQuality: 'auto',
  beatVisual: 'heart',
  textScale: 'normal',
  highContrast: false,
  showAchievementPopups: true,
  showRoutineToasts: true,
  showWorldScenery: true,
  showInteractionEffects: true,
  buyAmount: 1,
  starsCaught: 0,
  bestCombo: 0,
  allTimeEarned: ZERO_AMOUNT,
  eraEarned: ZERO_AMOUNT,
  stardust: ZERO_AMOUNT,
  supernovae: 0,
  echoes: [],
  singularities: ZERO_AMOUNT,
  singTotal: ZERO_AMOUNT,
  collapses: 0,
  autoKindler: true,
  autoKindlerFamilies: [...AUTO_KINDLER_FAMILIES],
  autoKindlerPriority: 'efficiency',
  autoStoker: true,
  autoNova: false,
  autoNovaThreshold: ONE_AMOUNT,
  challengeReturn: null,
  ending: null,
  theme: 'ember',
  remembrances: 0,
  pastEndings: [],
  curiosities: [],
  keeperFedUntil: 0,
  snailLastGiftAt: 0,
  crits: 0,
  bestCrit: ZERO_AMOUNT,
  beacons: [],
  darkBetween: ZERO_AMOUNT,
  wayfinder: [],
  vesselParts: [],
  vesselPartsByUniverse: {},
  universeRuns: {},
  numericLawState: {},
  lokaProgress: {},
  ...emptyEndgameState(),
})

import type { EchoDef } from '../echoes'
import type { GeneratorDef } from '../generators'
import type { LumenLine } from '../lumen'
import type { Effect, UpgradeDef } from '../upgrades'
import type { CuriosityCabinetDef } from '../curiosities'

export type UniverseId =
  | 'emberlight'
  | 'tidefall'
  | 'verdance'
  | 'clockwork'
  | 'brahmalok'
  | 'vishnulok'
  | 'kailash'

export type StableContentId = string
export type SerializedEconomyAmount = '0' | `${number}e${number}`
export type ContentAmount = number | SerializedEconomyAmount

/** Runtime shape reserved for the F1 numeric abstraction. F0 does not instantiate it. */
export interface EconomyAmount {
  readonly mantissa: number
  readonly exponent: number
}

export interface GeneratorDefV2 extends Omit<GeneratorDef, 'baseCost' | 'baseRate'> {
  readonly baseCost: ContentAmount
  readonly baseRate: ContentAmount
}

export interface UpgradeDefV2 extends Omit<UpgradeDef, 'cost'> {
  readonly cost: ContentAmount
}

export type EighteenTuple<T> = readonly [
  T, T, T, T, T, T, T, T, T,
  T, T, T, T, T, T, T, T, T,
]

export type TwelveTuple<T> = readonly [T, T, T, T, T, T, T, T, T, T, T, T]
export type FourTuple<T> = readonly [T, T, T, T]
export type ThreeTuple<T> = readonly [T, T, T]
export type AtLeastFour<T> = readonly [T, T, T, T, ...T[]]

export type CurrencyScope = 'world' | 'epoch' | 'deep' | 'between'

export interface CurrencyPresentation {
  readonly id: StableContentId
  readonly canonicalName: string
  readonly localName: string
  readonly singular: string
  readonly plural: string
  readonly glyph: string
  readonly material: string
  readonly scope: CurrencyScope
}

export interface DoctrineDef {
  readonly id: StableContentId
  readonly name: string
  readonly description: string
  readonly favoredMotivations: readonly (
    | 'restorer'
    | 'optimizer'
    | 'performer'
    | 'archivist'
    | 'wayfinder'
  )[]
  readonly effects: readonly Effect[]
  readonly visualSignature: string
}

export type ResetStateKey =
  | 'world-currency'
  | 'run-earnings'
  | 'kindlings'
  | 'ordinary-upgrades'
  | 'buy-mode'
  | 'epoch-matter'
  | 'epoch-doctrines'
  | 'epoch-works'
  | 'era-earnings'
  | 'deep-currency'
  | 'deep-laws'
  | 'deep-works'
  | 'trials'
  | 'archive'
  | 'story'
  | 'beacons'
  | 'between-currency'
  | 'wayfinder'

export interface LocalPrestigeDef {
  readonly id: StableContentId
  readonly canonicalName: 'Epoch Turn'
  readonly localName: string
  readonly rewardCurrency: CurrencyPresentation
  readonly gainFormulaId: StableContentId
  readonly loses: readonly ResetStateKey[]
  readonly retains: readonly ResetStateKey[]
  readonly ceremonyFeedbackId: StableContentId
}

export type WorldObjectSourceKind = 'generator' | 'archive' | 'omen' | 'story' | 'beacon'
export type ScreenZone = 'heart' | 'near' | 'far' | 'horizon'
export type ObjectSalience = 'ambient' | 'supporting' | 'interactive' | 'milestone'
export type OwnershipThreshold = 1 | 10 | 25 | 50 | 100

export type MotionKind =
  | 'still'
  | 'orbital'
  | 'tidal'
  | 'growth'
  | 'mechanical'
  | 'optical'
  | 'atmospheric'
  | 'waveform'
  | 'authored'

export interface MotionGrammar {
  readonly kind: MotionKind
  readonly description: string
  readonly periodMs?: number
  readonly preservesTimingInformation: boolean
}

export interface VisualState {
  readonly label: string
  readonly silhouette: string
  readonly material: readonly string[]
  readonly motion: MotionGrammar
  readonly countPresentation: 'single' | 'group' | 'infrastructure' | 'hidden'
}

export interface WorldObjectManifest {
  readonly id: StableContentId
  readonly sourceKind: WorldObjectSourceKind
  readonly sourceId: StableContentId
  readonly phenomenon: string
  readonly purpose: string
  readonly screenZone: ScreenZone
  readonly salience: ObjectSalience
  readonly material: readonly string[]
  readonly silhouette: string
  readonly motion: MotionGrammar
  readonly ownershipStates?: Readonly<Record<OwnershipThreshold, VisualState>>
  readonly reducedMotionState: VisualState
  readonly lowQualityState: VisualState
  readonly overlapGroup: string
  readonly canOverlapWith: readonly string[]
  /** Minimum clearance measured in Heart radii, not device pixels. */
  readonly minimumHeartDistance: number
  readonly priorityWhilePanelOpen: 'hide' | 'dim' | 'hold' | 'normal' | 'emphasize'
  readonly audioCue?: AudioCueId
  readonly loreRecord?: StableContentId
}

export interface HeartManifest {
  readonly id: StableContentId
  readonly canonicalName: 'Heart'
  readonly localName: string
  readonly phenomenon: string
  readonly purpose: string
  readonly material: readonly string[]
  readonly silhouette: string
  readonly idleMotion: MotionGrammar
  readonly touchMotion: MotionGrammar
  readonly reducedMotionState: VisualState
  readonly lowQualityState: VisualState
  readonly touchCue: AudioCueId
  readonly focusLabel: string
}

export type PureLawValue =
  | string
  | number
  | boolean
  | null
  | readonly PureLawValue[]
  | { readonly [key: string]: PureLawValue }

export interface UniverseLawState {
  readonly universeId: UniverseId
  readonly worldBalance: EconomyAmount
  readonly runEarned: EconomyAmount
  readonly eraEarned: EconomyAmount
  readonly owned: Readonly<Record<StableContentId, number>>
  readonly upgrades: readonly StableContentId[]
  readonly archive: readonly StableContentId[]
  readonly epochMatter: EconomyAmount
  readonly deepMatter: EconomyAmount
  readonly lawState: Readonly<Record<string, PureLawValue>>
}

export interface ClickContext {
  readonly input: 'pointer' | 'keyboard' | 'assistive' | 'automation'
  readonly rhythmAccuracy: number | null
  readonly randomSample?: number
}

export interface Purchase {
  readonly sourceKind: 'generator' | 'upgrade' | 'doctrine' | 'archive'
  readonly sourceId: StableContentId
  readonly quantity: number
  readonly cost: EconomyAmount
}

export interface PurchaseResult {
  readonly accepted: boolean
  readonly purchase: Purchase
  readonly lawStatePatch: Readonly<Record<string, PureLawValue>>
  readonly feedback: readonly SemanticFeedbackEvent[]
}

export interface OfflineResult {
  readonly elapsedMs: number
  readonly creditedMs: number
  readonly production: EconomyAmount
  readonly lawStatePatch: Readonly<Record<string, PureLawValue>>
}

export interface RoutingRules {
  readonly edgeKinds: readonly ('power' | 'cadence' | 'efficiency')[]
  readonly cyclesAllowed: boolean
  readonly rewiringCost: ContentAmount
  readonly scheduleIsDeterministic: true
}

export interface CohortStage {
  readonly id: StableContentId
  readonly minimumAgeMs: number
  readonly multiplier: number
}

export interface CohortRules {
  readonly stages: readonly [CohortStage, ...CohortStage[]]
  readonly mergeByStage: true
  readonly witheringAllowed: false
}

export interface SequenceRules {
  readonly minimumSlots: number
  readonly maximumSlots: number
  readonly roles: readonly ('pulse' | 'sustain' | 'multiplier' | 'syncopation' | 'echo' | 'emergence' | 'shelter' | 'release' | 'veil' | 'grace' | 'rest')[]
  readonly silentModeEquivalent: true
}

export interface ChargeRules {
  readonly minimumPathLength: number
  readonly maximumPathLength: number
  readonly overflowBehavior: 'hold' | 'auto-discharge'
  readonly automationUsesSavedPaths: true
}

export interface SpectrumRules {
  readonly bandIds: readonly StableContentId[]
  readonly recipeIds: readonly StableContentId[]
  readonly freeReconfiguration: true
  readonly nonColorLabelsRequired: true
}

/** Hooks are pure: callers supply state, time and random samples; hooks return data only. */
export interface UniverseLawHooks {
  readonly randomAllowed: boolean
  readonly rateMultiplier?: (state: UniverseLawState, nowMs: number) => number
  readonly clickMultiplier?: (state: UniverseLawState, context: ClickContext) => number
  readonly purchaseTransform?: (state: UniverseLawState, purchase: Purchase) => PurchaseResult
  readonly offlineTransform?: (state: UniverseLawState, elapsedMs: number) => OfflineResult
  readonly routing?: RoutingRules
  readonly cohorts?: CohortRules
  readonly sequence?: SequenceRules
  readonly charge?: ChargeRules
  readonly spectrum?: SpectrumRules
}

export interface OmenSpawnRule {
  readonly mode: 'random' | 'scheduled' | 'state-triggered'
  readonly baseChance?: number
  readonly pityThreshold?: number
  readonly scheduleMs?: number
  readonly oddsVisibleAfterDiscovery: boolean
}

export interface OmenRewardDef {
  readonly id: StableContentId
  readonly description: string
  readonly exclusivePermanentPower: false
  readonly effects: readonly Effect[]
}

export interface OmenDef {
  readonly id: StableContentId
  readonly name: string
  readonly description: string
  readonly spawn: OmenSpawnRule
  readonly rewards: readonly [OmenRewardDef, ...OmenRewardDef[]]
  readonly object: WorldObjectManifest
  readonly accessibilityLabel: string
}

export interface ArchiveRecordDef {
  readonly id: StableContentId
  readonly name: string
  readonly observation: string
  readonly implication: string
  readonly effectDescription: string
  readonly object: WorldObjectManifest
}

export interface ArchiveShelfDef {
  readonly id: StableContentId
  readonly name: string
  readonly recordIds: FourTuple<StableContentId>
  readonly rewardDescription: string
}

export interface ArchiveDef {
  readonly id: StableContentId
  readonly canonicalName: 'Field Archive'
  readonly localName: string
  readonly records: TwelveTuple<ArchiveRecordDef>
  readonly shelves: ThreeTuple<ArchiveShelfDef>
}

export interface TrialGoalDef {
  readonly metricId: StableContentId
  readonly target: ContentAmount
  readonly description: string
}

export interface TrialDef {
  readonly id: StableContentId
  readonly name: string
  readonly historicalFailure: string
  readonly rules: Readonly<Record<string, PureLawValue>>
  readonly goal: TrialGoalDef
  readonly rewardEffects: readonly Effect[]
  readonly accessibilityDescription: string
}

export interface StorySceneDef {
  readonly id: StableContentId
  readonly kind: 'arrival' | 'epoch' | 'deep' | 'beacon' | 'transmission'
  readonly skippableAfterFirstView: boolean
  readonly replayable: true
}

export interface UniverseStoryDef {
  readonly civilizationQuestion: string
  readonly lumen: readonly LumenLine[]
  readonly echoes: readonly EchoDef[]
  readonly scenes: readonly StorySceneDef[]
}

export interface BeaconRequirement {
  readonly sourceKind: 'generator' | 'archive' | 'trial' | 'story' | 'composite'
  readonly sourceId: StableContentId
  readonly target: number
  readonly description: string
}

export interface BeaconDef {
  readonly id: StableContentId
  readonly canonicalName: 'Beacon'
  readonly localName: string
  readonly requirement: BeaconRequirement
  readonly darkBetweenReward: number
  readonly object: WorldObjectManifest
  readonly mapSilhouette: string
}

export type FeedbackTier = 0 | 1 | 2 | 3 | 4 | 5
export type FeedbackSourceKind =
  | WorldObjectSourceKind
  | 'heart'
  | 'upgrade'
  | 'doctrine'
  | 'trial'
  | 'epoch'
  | 'deep'
  | 'system'

export interface FeedbackSource {
  readonly universeId: UniverseId
  readonly kind: FeedbackSourceKind
  readonly id: StableContentId
}

export interface FeedbackAggregation {
  readonly key: string
  readonly count: number
  readonly windowMs: number
}

interface BaseFeedbackEvent {
  readonly id: StableContentId
  readonly occurredAtMs: number
  readonly tier: FeedbackTier
  readonly source: FeedbackSource
  readonly aggregation?: FeedbackAggregation
  readonly audioCue?: AudioCueId
  readonly announcement?: AnnouncementSpec
}

export interface PassiveFeedbackEvent extends BaseFeedbackEvent {
  readonly kind: 'passive'
  readonly amount: EconomyAmount
}

export interface TouchFeedbackEvent extends BaseFeedbackEvent {
  readonly kind: 'touch'
  readonly amount: EconomyAmount
  readonly critical: boolean
  readonly rhythmBand: 'miss' | 'near' | 'on-beat' | null
}

export interface PurchaseFeedbackEvent extends BaseFeedbackEvent {
  readonly kind: 'purchase'
  readonly quantity: number
  readonly cost: EconomyAmount
  readonly rateDelta: EconomyAmount
}

export interface SkillFeedbackEvent extends BaseFeedbackEvent {
  readonly kind: 'skill'
  readonly skillId: StableContentId
  readonly result: 'success' | 'near' | 'miss'
}

export interface DiscoveryFeedbackEvent extends BaseFeedbackEvent {
  readonly kind: 'discovery'
  readonly discoveryKind: 'kindling' | 'omen' | 'archive' | 'echo' | 'system'
  readonly discoveredId: StableContentId
}

export interface MasteryFeedbackEvent extends BaseFeedbackEvent {
  readonly kind: 'mastery'
  readonly masteryKind: 'trial' | 'doctrine' | 'vessel' | 'beacon'
  readonly masteredId: StableContentId
}

export interface EpochFeedbackEvent extends BaseFeedbackEvent {
  readonly kind: 'epoch'
  readonly boundary: 'epoch-turn' | 'deep-collapse' | 'remembrance' | 'crossing'
  readonly gained: EconomyAmount
}

export type SemanticFeedbackEvent =
  | PassiveFeedbackEvent
  | TouchFeedbackEvent
  | PurchaseFeedbackEvent
  | SkillFeedbackEvent
  | DiscoveryFeedbackEvent
  | MasteryFeedbackEvent
  | EpochFeedbackEvent

export type AudioCueId = StableContentId
export type AudioBusId =
  | 'master'
  | 'music'
  | 'ambient'
  | 'interface'
  | 'touch'
  | 'purchase'
  | 'omen'
  | 'story'
  | 'ceremony'

export interface AudioBusDef {
  readonly id: AudioBusId
  readonly parent: AudioBusId | null
  readonly defaultGain: number
  readonly userControllable: boolean
  readonly muteBehavior: 'suppress-audio-only'
}

export interface AudioCueDef {
  readonly id: AudioCueId
  readonly bus: AudioBusId
  readonly family: string
  readonly synthesisKey: string
  readonly targetPeakDb: number
  readonly maximumPeakDb: number
  readonly minimumIntervalMs: number
  readonly maximumConcurrentInstances: number
  readonly priority: 'ambient' | 'normal' | 'important' | 'ceremony'
  readonly muteGroup: string
  readonly mutedFallback: 'none' | 'visual' | 'caption' | 'visual-and-caption'
}

export interface MusicStemDef {
  readonly id: StableContentId
  readonly kindlingFamily: StableContentId
  readonly bus: 'music'
  readonly description: string
}

export interface UniverseAudioDef {
  readonly tempoBpm: number
  readonly meter: string
  readonly buses: readonly AudioBusDef[]
  readonly cues: readonly AudioCueDef[]
  readonly clickMaterialCue: AudioCueId
  readonly purchaseIntervalCue: AudioCueId
  readonly criticalAccentCue: AudioCueId
  readonly omenCallCue: AudioCueId
  readonly prestigeCadenceCue: AudioCueId
  readonly stems: FourTuple<MusicStemDef>
  readonly silenceState: string
  readonly fatiguePolicy: string
}

export interface DensityMergeRule {
  readonly sourceIds: readonly StableContentId[]
  readonly threshold: number
  readonly resultObjectId: StableContentId
  readonly description: string
}

export interface ScreenZoneDef {
  readonly purpose: string
  readonly maximumInteractiveObjects: number
  readonly motionFrequency: 'low' | 'medium' | 'high'
}

export interface UniverseVisualManifest {
  readonly materials: readonly string[]
  readonly primarySilhouettes: readonly string[]
  readonly motionGrammar: readonly MotionKind[]
  readonly zones: Readonly<Record<ScreenZone, ScreenZoneDef>>
  readonly objects: readonly WorldObjectManifest[]
  readonly densityMerges: readonly DensityMergeRule[]
  readonly attentionBudget: {
    readonly primaryTargets: 1
    readonly secondaryInteractiveObjects: 3
    readonly temporaryRewardEffects: 2
    readonly storySubtitles: 1
    readonly majorPanels: 1
  }
}

export interface AnnouncementSpec {
  readonly messageKey: string
  readonly politeness: 'off' | 'polite' | 'assertive'
  readonly dedupeKey: string
  readonly minimumIntervalMs: number
}

export interface NonColorSignalDef {
  readonly stateId: StableContentId
  readonly text: string
  readonly shape: string
  readonly pattern: string
  readonly highContrastTreatment: string
}

export interface UniverseAccessibilityDef {
  readonly heartLabel: string
  readonly currencyLabel: string
  readonly screenReaderOrder: readonly StableContentId[]
  readonly announcements: readonly AnnouncementSpec[]
  readonly nonColorSignals: readonly NonColorSignalDef[]
  readonly timing: {
    readonly visualCue: string
    readonly audioCue: string
    readonly shapeCue: string
    readonly averagedModeAvailable: boolean
    readonly averagedRewardRatio: readonly [number, number]
  }
  readonly muted: {
    readonly fullGameplayEquivalent: true
    readonly captions: readonly string[]
  }
  readonly reducedMotion: {
    readonly fullGameplayEquivalent: true
    readonly replacementStrategy: 'static-pose' | 'crossfade' | 'local-pulse'
    readonly timingInformationPreserved: true
  }
  readonly lowQuality: {
    readonly fullGameplayEquivalent: true
    readonly preservesHitTargets: true
    readonly preservesStateLabels: true
  }
}

export interface UniversePackV2 {
  readonly id: UniverseId
  readonly identity: {
    readonly name: string
    readonly shortName: string
    readonly epithet: string
    readonly premise: string
    readonly primaryVerb: string
    readonly civilizationQuestion: string
  }
  readonly economy: {
    readonly currency: CurrencyPresentation
    readonly generators: EighteenTuple<GeneratorDefV2>
    readonly upgrades: readonly UpgradeDefV2[]
    readonly doctrines: FourTuple<DoctrineDef>
    readonly localPrestige: LocalPrestigeDef
  }
  readonly heart: HeartManifest
  readonly physics: UniverseLawHooks
  readonly omens: AtLeastFour<OmenDef>
  readonly archive: ArchiveDef
  readonly trials: readonly TrialDef[]
  readonly story: UniverseStoryDef
  readonly audio: UniverseAudioDef
  readonly visual: UniverseVisualManifest
  readonly beacon: BeaconDef
  readonly accessibility: UniverseAccessibilityDef
}

export interface UniverseAudioIdentity {
  music: UniverseId
  click: UniverseId
  event: UniverseId
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

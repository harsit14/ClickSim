import { amountFromNumber, gteAmount } from '../../core/numeric/amount'
import { CABINET_RESONANCE_PER_ITEM } from '../curiosities'
import type { CuriosityCabinetDef, CuriosityDef, CuriosityShelfDef } from '../curiosities'
import type { EchoDef } from '../echoes'
import type { GeneratorDef } from '../generators'
import type { LumenLine } from '../lumen'
import type { Effect, UpgradeDef } from '../upgrades'
import { adaptLegacyUniversePack, type UniversePackV2Supplement } from './legacy-v2-adapter'
import type {
  ArchiveDef,
  AtLeastFour,
  AudioBusDef,
  AudioBusId,
  AudioCueDef,
  DoctrineDef,
  FourTuple,
  MotionGrammar,
  OmenDef,
  StorySceneDef,
  TrialDef,
  TwelveTuple,
  UniverseAudioDef,
  UniverseId,
  UniverseLawHooks,
  UniversePack,
  UniversePackV2,
  VisualState,
  WorldObjectManifest,
} from './types'

export interface FutureKindlingSeed {
  readonly name: string
  readonly flavor: string
  readonly silhouette: string
}

export interface FutureArchiveSeed {
  readonly name: string
  readonly glyph: string
  readonly observation: string
  readonly implication: string
  readonly effect: string
  readonly silhouette: string
}

export interface FutureOmenSeed {
  readonly name: string
  readonly description: string
  readonly silhouette: string
  readonly motion: MotionGrammar['kind']
  readonly effects: readonly Effect[]
}

export interface FutureDoctrineSeed {
  readonly name: string
  readonly description: string
  readonly visualSignature: string
  readonly favoredMotivations: DoctrineDef['favoredMotivations']
  readonly effects: readonly Effect[]
}

export interface FutureLumenSeed {
  readonly awake: string
  readonly first: string
  readonly law: string
  readonly civil: string
  readonly archive: string
  readonly omen: string
  readonly epoch: string
  readonly cosmic: string
  readonly question: string
  readonly beacon: string
}

export interface FutureStorySeed {
  readonly title: string
  readonly provenance: string
  readonly text: string
}

export interface FutureUniverseSpec {
  readonly id: Extract<UniverseId, 'brahmalok' | 'vishnulok' | 'kailash'>
  readonly prefix: 'brahmalok' | 'vishnulok' | 'kailash'
  readonly name: string
  readonly shortName: string
  readonly epithet: string
  readonly premise: string
  readonly primaryVerb: string
  readonly question: string
  readonly currency: string
  readonly currencyGlyph: string
  readonly currencyMaterial: string
  readonly heartName: string
  readonly heartPhenomenon: string
  readonly heartSilhouette: string
  readonly heartVerb: string
  readonly achievementPower: string
  readonly epochName: string
  readonly epochMatter: string
  readonly epochMatterSingular: string
  readonly epochGlyph: string
  readonly epochMaterial: string
  readonly archiveName: string
  readonly archiveGlyph: string
  readonly archiveRecord: string
  readonly palette: {
    readonly accentHue: number
    readonly bg: string
    readonly accent: string
    readonly gold: string
    readonly panel: string
  }
  readonly visualMaterials: readonly string[]
  readonly primarySilhouettes: readonly string[]
  readonly economy: {
    readonly baseCosts: readonly number[]
    readonly baseRates: readonly number[]
    readonly costMultiplier: number
  }
  readonly signatureUpgrades: (generators: readonly GeneratorDef[]) => readonly UpgradeDef[]
  readonly kindlings: readonly FutureKindlingSeed[]
  readonly archives: readonly FutureArchiveSeed[]
  readonly shelfNames: readonly [string, string, string]
  readonly shelfRewards: readonly [string, string, string]
  readonly omens: readonly FutureOmenSeed[]
  readonly doctrines: readonly FutureDoctrineSeed[]
  readonly lumen: FutureLumenSeed
  readonly story: readonly FutureStorySeed[]
  readonly physics: UniverseLawHooks
  readonly trials: readonly {
    readonly name: string
    readonly failure: string
    readonly rule: string
    readonly accessibility: string
    readonly rewardEffects: readonly Effect[]
  }[]
  readonly tempo: number
  readonly meter: string
  readonly audioFamilies: readonly [string, string, string, string, string]
  readonly silenceState: string
  readonly fatiguePolicy: string
  readonly routeGlyph: string
  readonly routeArrival: string
  readonly unlockText: string
  readonly beaconName: string
  readonly beaconSilhouette: string
  readonly beaconReward: number
  readonly nonColorSignals: readonly {
    readonly id: string
    readonly text: string
    readonly shape: string
    readonly pattern: string
  }[]
}

const ARCHIVE_COSTS = [1e6, 5e6, 25e6, 1e8, 5e8, 2e9, 1e10, 1e11, 1e12, 1e13, 1e14, 1e15] as const
const OWNERSHIP_THRESHOLDS = [1, 10, 25, 50, 100] as const
const OWNERSHIP_LABELS = ['single specimen', 'organized array', 'interacting network', 'world-shaping system', 'named infrastructure'] as const

function motion(kind: MotionGrammar['kind'], description: string, periodMs?: number): MotionGrammar {
  return { kind, description, ...(periodMs ? { periodMs } : {}), preservesTimingInformation: true }
}

function visualState(
  label: string,
  silhouette: string,
  material: readonly string[],
  stateMotion: MotionGrammar,
  countPresentation: VisualState['countPresentation'],
): VisualState {
  return { label, silhouette, material, motion: stateMotion, countPresentation }
}

function makeGenerator(spec: FutureUniverseSpec, seed: FutureKindlingSeed, index: number): GeneratorDef {
  return {
    id: `${spec.prefix}-kindling-${String(index + 1).padStart(2, '0')}`,
    name: seed.name,
    flavor: seed.flavor,
    baseCost: spec.economy.baseCosts[index],
    baseRate: spec.economy.baseRates[index],
    costMult: spec.economy.costMultiplier,
    tier: index + 1,
    hue: (spec.palette.accentHue + index * 13) % 360,
  }
}

function makeUpgrades(spec: FutureUniverseSpec, generators: readonly GeneratorDef[]): UpgradeDef[] {
  const upgrades: UpgradeDef[] = []
  const refinements = [
    { at: 10, scale: 15, glyph: 'I', adjective: spec.id === 'brahmalok' ? 'Rooted' : spec.id === 'vishnulok' ? 'Sustained' : 'Sheltered' },
    { at: 25, scale: 75, glyph: 'II', adjective: spec.id === 'brahmalok' ? 'Revised' : spec.id === 'vishnulok' ? 'Restored' : 'Carried' },
    { at: 50, scale: 750, glyph: 'III', adjective: spec.id === 'brahmalok' ? 'Unfolded' : spec.id === 'vishnulok' ? 'Returned' : 'Released' },
  ] as const
  for (const generator of generators) {
    for (const refinement of refinements) {
      const repeatedPrefix = generator.name.toLocaleLowerCase().startsWith(`${refinement.adjective.toLocaleLowerCase()} `)
      const adjective = repeatedPrefix
        ? refinement.at === 25 ? 'Braided' : refinement.at === 50 ? 'Sustained' : 'Articulated'
        : refinement.adjective
      upgrades.push({
        id: `${generator.id}-${refinement.at}`,
        name: `${adjective} ${generator.name}`,
        flavor: `${generator.name} adopts a visible ${spec.primaryVerb} discipline without losing its identity.`,
        cost: Math.round(generator.baseCost * refinement.scale),
        glyph: refinement.glyph,
        hue: generator.hue,
        unlock: { gen: generator.id, count: refinement.at },
        effects: [{ kind: 'genMult', gen: generator.id, value: 2 }],
      })
    }
  }
  const law = (
    suffix: string,
    name: string,
    flavor: string,
    cost: number,
    unlock: UpgradeDef['unlock'],
    effects: Effect[],
    glyph: string,
  ) => upgrades.push({ id: `${spec.prefix}-${suffix}`, name, flavor, cost, unlock, effects, glyph, hue: spec.palette.accentHue })
  law('heart-attunement', `${spec.heartName} Attunement`, `The Heart answers more clearly when asked to ${spec.primaryVerb}.`, 60, { clicks: 10 }, [{ kind: 'clickMult', value: 2 }], spec.currencyGlyph)
  law('shared-field', 'Shared Field', `Every ${spec.kindlings[0].name} now participates in the world law.`, 10_000, { totalEarned: 5_000 }, [{ kind: 'globalMult', value: 2 }], '◇')
  law('first-resonance', 'First Relationship', 'The first two Kindlings strengthen one another instead of standing alone.', 25_000, { gen: generators[2].id, count: 10 }, [{ kind: 'synergy', gen: generators[2].id, per: generators[0].id, value: 0.02 }], '∞')
  law('civil-resonance', 'Civil Relationship', 'Foundational and civic systems exchange useful structure.', 3e9, { gen: generators[7].id, count: 10 }, [{ kind: 'synergy', gen: generators[7].id, per: generators[5].id, value: 0.012 }], '∞')
  law('cosmic-resonance', 'Cosmic Relationship', 'The far system returns its solved law to the world below.', 8e15, { gen: generators[13].id, count: 10 }, [{ kind: 'synergy', gen: generators[13].id, per: generators[10].id, value: 0.008 }], '∞')
  law('active-discipline', 'Active Discipline', `A deliberate ${spec.primaryVerb} action carries a share of passive production.`, 8_000, { clicks: 180 }, [{ kind: 'clickMult', value: 2 }, { kind: 'clickShare', value: 0.01 }], '⌁')
  law('archive-accord', `${spec.archiveName} Accord`, 'Recorded phenomena become mechanical evidence rather than decoration.', 2e12, { totalEarned: 1e11 }, [{ kind: 'globalMult', value: 1.25 }], spec.archiveGlyph)
  law('beacon-accord', `${spec.beaconName} Accord`, 'The final Kindling teaches every smaller system how to continue.', 1e20, { gen: generators[16].id, count: 1 }, [{ kind: 'globalMult', value: 2 }], spec.routeGlyph)
  upgrades.push(...spec.signatureUpgrades(generators))
  return upgrades
}

function makeStory(spec: FutureUniverseSpec, generators: readonly GeneratorDef[]): {
  lumen: LumenLine[]
  echoes: EchoDef[]
  scenes: readonly StorySceneDef[]
} {
  const owns = (owned: Readonly<Record<string, number>>, id: string, count = 1) => (owned[id] ?? 0) >= count
  const lumen: LumenLine[] = [
    { id: `${spec.prefix}-lumen-awake`, text: spec.lumen.awake, when: (game) => game.clicks >= 1 },
    { id: `${spec.prefix}-lumen-first`, text: spec.lumen.first, when: (game) => owns(game.owned, generators[0].id) },
    { id: `${spec.prefix}-lumen-law`, text: spec.lumen.law, when: (game) => owns(game.owned, generators[3].id) },
    { id: `${spec.prefix}-lumen-civil`, text: spec.lumen.civil, when: (game) => owns(game.owned, generators[7].id) },
    { id: `${spec.prefix}-lumen-archive`, text: spec.lumen.archive, when: (game) => game.curiosities.length >= 1 },
    { id: `${spec.prefix}-lumen-omen`, text: spec.lumen.omen, when: (game) => game.starsCaught >= 1 },
    { id: `${spec.prefix}-lumen-epoch`, text: spec.lumen.epoch, when: (game) => game.supernovae >= 1 },
    { id: `${spec.prefix}-lumen-cosmic`, text: spec.lumen.cosmic, when: (game) => owns(game.owned, generators[13].id) },
    { id: `${spec.prefix}-lumen-question`, text: spec.lumen.question, when: (game) => gteAmount(game.allTimeEarned, amountFromNumber(1e15)) },
    { id: `${spec.prefix}-lumen-beacon`, text: spec.lumen.beacon, when: (game) => owns(game.owned, generators[17].id) },
  ]
  const echoes: EchoDef[] = spec.story.map((entry, index) => ({
    id: `${spec.prefix}-echo-${String(index + 1).padStart(2, '0')}`,
    title: entry.title,
    provenance: entry.provenance,
    text: entry.text,
    when: (game) => index < 6
      ? owns(game.owned, generators[Math.min(17, index * 3)].id)
      : index < 8
        ? game.supernovae >= index - 5
        : gteAmount(game.allTimeEarned, amountFromNumber(index === 8 ? 1e12 : 1e18)),
  }))
  const scenes: readonly StorySceneDef[] = [
    { id: `${spec.prefix}-scene-arrival`, kind: 'arrival', skippableAfterFirstView: true, replayable: true },
    { id: `${spec.prefix}-scene-epoch`, kind: 'epoch', skippableAfterFirstView: true, replayable: true },
    { id: `${spec.prefix}-scene-deep`, kind: 'deep', skippableAfterFirstView: true, replayable: true },
    { id: `${spec.prefix}-scene-beacon`, kind: 'beacon', skippableAfterFirstView: true, replayable: true },
    { id: `${spec.prefix}-scene-transmission`, kind: 'transmission', skippableAfterFirstView: true, replayable: true },
  ]
  return { lumen, echoes, scenes }
}

function generatorObject(spec: FutureUniverseSpec, generator: GeneratorDef, seed: FutureKindlingSeed, index: number): WorldObjectManifest {
  const materials = spec.visualMaterials.slice(index % 3, index % 3 + 3)
  const ownershipStates = Object.fromEntries(OWNERSHIP_THRESHOLDS.map((threshold, stateIndex) => [
    threshold,
    visualState(
      `${generator.name}: ${OWNERSHIP_LABELS[stateIndex]}`,
      `${seed.silhouette}; ${OWNERSHIP_LABELS[stateIndex]}`,
      materials,
      motion(spec.physics.spectrum ? 'optical' : spec.physics.charge ? 'atmospheric' : 'waveform', `${generator.name} develops into ${OWNERSHIP_LABELS[stateIndex]} while preserving its authored state label.`, 4_200 + index * 170),
      threshold < 10 ? 'single' : threshold < 50 ? 'group' : 'infrastructure',
    ),
  ])) as Record<1 | 10 | 25 | 50 | 100, VisualState>
  return {
    id: `${spec.prefix}-object-kindling-${String(index + 1).padStart(2, '0')}`,
    sourceKind: 'generator',
    sourceId: generator.id,
    phenomenon: `${generator.name} participating in ${spec.epithet}`,
    purpose: `Shows ${generator.name} ownership and its role in the ${spec.primaryVerb} law.`,
    screenZone: index < 6 ? 'near' : index < 14 ? 'far' : 'horizon',
    salience: index === 17 ? 'milestone' : index < 6 ? 'supporting' : 'ambient',
    material: materials,
    silhouette: seed.silhouette,
    motion: motion(spec.physics.spectrum ? 'optical' : spec.physics.charge ? 'atmospheric' : 'waveform', `${seed.silhouette} changes only according to the world law.`, 5_000 + index * 180),
    ownershipStates,
    reducedMotionState: visualState(`${generator.name} fixed state`, `${seed.silhouette} with five labeled state marks`, materials, motion('still', 'A fixed labeled state preserves all timing and ownership information.'), 'infrastructure'),
    lowQualityState: visualState(`${generator.name} simplified state`, `high-contrast ${seed.silhouette}`, materials.slice(0, 2), motion('still', 'One stable contour and text preserve identity.'), 'single'),
    overlapGroup: `${spec.id}-${index < 6 ? 'foundation' : index < 14 ? 'civil' : 'horizon'}`,
    canOverlapWith: [],
    minimumHeartDistance: 1.55,
    priorityWhilePanelOpen: index === 17 ? 'hold' : 'dim',
    audioCue: `${spec.prefix}-purchase`,
  }
}

function archiveObject(spec: FutureUniverseSpec, item: CuriosityDef, seed: FutureArchiveSeed, index: number): WorldObjectManifest {
  const materials = spec.visualMaterials.slice((index + 1) % 3, (index + 1) % 3 + 3)
  return {
    id: `${spec.prefix}-object-archive-${String(index + 1).padStart(2, '0')}`,
    sourceKind: 'archive',
    sourceId: item.id,
    phenomenon: `${item.name}, an authored record in ${spec.archiveName}`,
    purpose: `Makes the ${item.name} observation, implication, and effect visible.`,
    screenZone: index % 3 === 0 ? 'near' : 'far',
    salience: 'interactive',
    material: materials,
    silhouette: seed.silhouette,
    motion: motion(spec.physics.spectrum ? 'optical' : spec.physics.charge ? 'atmospheric' : 'waveform', `${item.name} follows the physical grammar of ${spec.epithet}.`, 5_500 + index * 220),
    reducedMotionState: visualState(`${item.name} fixed record`, `${seed.silhouette} beside a numbered effect mark`, materials, motion('still', 'A fixed state and caption preserve the record.'), 'single'),
    lowQualityState: visualState(`${item.name} simplified record`, `high-contrast ${seed.silhouette}`, materials.slice(0, 2), motion('still', 'One stable contour and caption preserve the record.'), 'single'),
    overlapGroup: `${spec.id}-archive`,
    canOverlapWith: [],
    minimumHeartDistance: 1.75,
    priorityWhilePanelOpen: 'hide',
    audioCue: `${spec.prefix}-archive`,
    loreRecord: item.id,
  }
}

function omenObject(spec: FutureUniverseSpec, omen: FutureOmenSeed, index: number): WorldObjectManifest {
  return {
    id: `${spec.prefix}-object-omen-${String(index + 1).padStart(2, '0')}`,
    sourceKind: 'omen',
    sourceId: `${spec.prefix}-omen-${String(index + 1).padStart(2, '0')}`,
    phenomenon: `${omen.name} traversing ${spec.epithet}`,
    purpose: omen.description,
    screenZone: index < 2 ? 'near' : 'far',
    salience: 'interactive',
    material: spec.visualMaterials.slice(0, 3),
    silhouette: omen.silhouette,
    motion: motion(omen.motion, `${omen.name} follows one authored, mechanically meaningful route.`, 4_000 + index * 650),
    reducedMotionState: visualState(`${omen.name} fixed route`, `${omen.silhouette} beside numbered route stations`, spec.visualMaterials.slice(0, 3), motion('still', 'Numbered stations and countdown preserve the opportunity.'), 'single'),
    lowQualityState: visualState(`${omen.name} simplified route`, `high-contrast ${omen.silhouette}`, spec.visualMaterials.slice(0, 2), motion('still', 'One target and countdown preserve full interaction.'), 'single'),
    overlapGroup: `${spec.id}-omen`,
    canOverlapWith: [],
    minimumHeartDistance: 1.65,
    priorityWhilePanelOpen: 'hide',
    audioCue: `${spec.prefix}-omen-call`,
  }
}

function makeCabinet(spec: FutureUniverseSpec): { cabinet: CuriosityCabinetDef; items: CuriosityDef[] } {
  const items: CuriosityDef[] = spec.archives.map((seed, index) => ({
    id: `${spec.prefix}-archive-${String(index + 1).padStart(2, '0')}`,
    name: seed.name,
    glyph: seed.glyph,
    classification: `${spec.shortName.toLowerCase()} record · ${Math.floor(index / 4) + 1}.${(index % 4) + 1}`,
    flavor: seed.observation,
    record: seed.implication,
    desc: seed.effect,
    cost: ARCHIVE_COSTS[index],
    hue: (spec.palette.accentHue + index * 17) % 360,
    ...(index === 2 ? { kind: 'hearthkeeper' as const } : {}),
  }))
  const shelves: CuriosityShelfDef[] = spec.shelfNames.map((name, index) => ({
    id: (['hearthside', 'pilgrims', 'portents'] as const)[index],
    index: ['I', 'II', 'III'][index],
    name,
    lore: `Four records concerning ${name.toLowerCase()} in ${spec.epithet}.`,
    ids: items.slice(index * 4, index * 4 + 4).map(({ id }) => id),
    rewardKind: (['production', 'clicks', 'production'] as const)[index],
    rewardName: `${name} Accord`,
    reward: spec.shelfRewards[index],
    rewardValue: index === 0 ? 1.1 : index === 1 ? 1.25 : 1.18,
  }))
  return {
    items,
    cabinet: {
      id: spec.id,
      title: spec.archiveName,
      surveyLabel: `${spec.shortName} field survey`,
      dockTitle: spec.archiveName,
      dockGlyph: spec.archiveGlyph,
      items,
      itemById: new Map(items.map((item) => [item.id, item])),
      shelves,
      resonancePerItem: CABINET_RESONANCE_PER_ITEM,
      fuelHours: 3,
      fuelProductionMult: 1.08,
      returnCycleSec: 75 * 60,
      returnRateSeconds: 35 * 60,
      starItemRateBonus: 0.06,
      beatWindowBonus: 0.025,
      lines: {
        empty: `Three shelves wait for ${spec.shortName} to make its first observation.`,
        first: `One record gives ${spec.epithet} a history as well as a law.`,
        chapter: `Four records now form the ${spec.shelfNames[0]} argument.`,
        cosmology: `${spec.archiveName} is becoming a map of why this civilization failed.`,
        complete: `Every shelf is complete. Together they describe ${spec.beaconName}.`,
      },
      archiveRecord: spec.archiveRecord,
    },
  }
}

const bus = (id: AudioBusId, parent: AudioBusId | null, defaultGain: number): AudioBusDef => ({ id, parent, defaultGain, userControllable: true, muteBehavior: 'suppress-audio-only' })

function makeAudio(spec: FutureUniverseSpec): UniverseAudioDef {
  const cue = (suffix: string, cueBus: AudioBusId, family: string, priority: AudioCueDef['priority'], mutedFallback: AudioCueDef['mutedFallback'], minimumIntervalMs = 100): AudioCueDef => ({
    id: `${spec.prefix}-${suffix}`,
    bus: cueBus,
    family,
    synthesisKey: `${spec.prefix}-${suffix}-synthesis`,
    targetPeakDb: priority === 'ceremony' ? -9 : -15,
    maximumPeakDb: -7,
    minimumIntervalMs,
    maximumConcurrentInstances: priority === 'normal' ? 2 : 1,
    priority,
    muteGroup: `${spec.id}-${cueBus}`,
    mutedFallback,
  })
  return {
    tempoBpm: spec.tempo,
    meter: spec.meter,
    buses: [bus('master', null, 0.8), bus('music', 'master', 0.56), bus('ambient', 'master', 0.4), bus('interface', 'master', 0.62), bus('touch', 'master', 0.65), bus('purchase', 'interface', 0.62), bus('omen', 'master', 0.68), bus('story', 'master', 0.52), bus('ceremony', 'master', 0.72)],
    cues: [
      cue('click', 'touch', spec.audioFamilies[0], 'normal', 'none', 80),
      cue('purchase', 'purchase', spec.audioFamilies[1], 'normal', 'visual', 120),
      cue('critical', 'touch', spec.audioFamilies[2], 'important', 'visual', 180),
      cue('omen-call', 'omen', spec.audioFamilies[3], 'important', 'visual-and-caption', 500),
      cue('prestige', 'ceremony', spec.audioFamilies[4], 'ceremony', 'visual-and-caption', 2_500),
      cue('archive', 'story', `${spec.id}-archive-reveal`, 'important', 'caption', 500),
      cue('beacon', 'ceremony', `${spec.id}-beacon`, 'ceremony', 'visual-and-caption', 2_500),
    ],
    clickMaterialCue: `${spec.prefix}-click`,
    purchaseIntervalCue: `${spec.prefix}-purchase`,
    criticalAccentCue: `${spec.prefix}-critical`,
    omenCallCue: `${spec.prefix}-omen-call`,
    prestigeCadenceCue: `${spec.prefix}-prestige`,
    stems: [0, 5, 10, 15].map((index, stem) => ({
      id: `${spec.prefix}-stem-${stem + 1}`,
      kindlingFamily: `${spec.prefix}-kindling-${String(index + 1).padStart(2, '0')}`,
      bus: 'music' as const,
      description: `${spec.kindlings[index].name} contributes an authored ${spec.primaryVerb} layer.`,
    })) as unknown as UniverseAudioDef['stems'],
    silenceState: spec.silenceState,
    fatiguePolicy: spec.fatiguePolicy,
  }
}

function makeTrials(spec: FutureUniverseSpec): readonly TrialDef[] {
  return spec.trials.map((trial, index) => ({
    id: `${spec.prefix}-trial-${String(index + 1).padStart(2, '0')}`,
    name: trial.name,
    historicalFailure: trial.failure,
    rules: { constraint: trial.rule, localLawRequired: true },
    goal: { metricId: 'world-currency-earned', target: `${1 + index}e${7 + index}` as `${number}e${number}`, description: `Earn the declared ${spec.currency} target while respecting ${trial.name}.` },
    rewardEffects: trial.rewardEffects,
    accessibilityDescription: trial.accessibility,
  }))
}

function makeV2Supplement(
  spec: FutureUniverseSpec,
  generators: readonly GeneratorDef[],
  archiveItems: readonly CuriosityDef[],
  story: ReturnType<typeof makeStory>,
): UniversePackV2Supplement {
  const generatorObjects = generators.map((generator, index) => generatorObject(spec, generator, spec.kindlings[index], index))
  const archiveObjects = archiveItems.map((item, index) => archiveObject(spec, item, spec.archives[index], index))
  const omenObjects = spec.omens.map((omen, index) => omenObject(spec, omen, index))
  const omens = spec.omens.map((omen, index) => ({
    id: `${spec.prefix}-omen-${String(index + 1).padStart(2, '0')}`,
    name: omen.name,
    description: omen.description,
    spawn: { mode: index === 3 ? 'state-triggered' as const : 'random' as const, baseChance: index === 3 ? undefined : 0.035 - index * 0.005, pityThreshold: 18 + index * 4, oddsVisibleAfterDiscovery: true },
    rewards: [{ id: `${spec.prefix}-omen-reward-${index + 1}`, description: omen.description, exclusivePermanentPower: false as const, effects: omen.effects }],
    object: omenObjects[index],
    accessibilityLabel: `${omen.name} available. ${omen.description}`,
  })) as unknown as AtLeastFour<OmenDef>
  const archive: ArchiveDef = {
    id: `${spec.prefix}-archive`,
    canonicalName: 'Field Archive',
    localName: spec.archiveName,
    records: archiveItems.map((item, index) => ({
      id: item.id,
      name: item.name,
      observation: item.flavor,
      implication: item.record,
      effectDescription: item.desc,
      object: archiveObjects[index],
    })) as unknown as TwelveTuple<ArchiveDef['records'][number]>,
    shelves: spec.shelfNames.map((name, index) => ({
      id: `${spec.prefix}-shelf-${index + 1}`,
      name,
      recordIds: archiveItems.slice(index * 4, index * 4 + 4).map(({ id }) => id) as unknown as FourTuple<string>,
      rewardDescription: spec.shelfRewards[index],
    })) as unknown as ArchiveDef['shelves'],
  }
  const beaconObject: WorldObjectManifest = {
    id: `${spec.prefix}-object-beacon`,
    sourceKind: 'beacon',
    sourceId: `${spec.prefix}-beacon`,
    phenomenon: `${spec.beaconName} proving ${spec.shortName} can continue without central control`,
    purpose: `Marks completion of ${spec.epithet} and opens its route to neighboring worlds.`,
    screenZone: 'horizon',
    salience: 'milestone',
    material: spec.visualMaterials.slice(-3),
    silhouette: spec.beaconSilhouette,
    motion: motion(spec.physics.spectrum ? 'optical' : spec.physics.charge ? 'atmospheric' : 'waveform', `${spec.beaconName} repeats one slow authored signal.`, 12_000),
    reducedMotionState: visualState(`${spec.beaconName} fixed answer`, `${spec.beaconSilhouette} with seven numbered route marks`, spec.visualMaterials.slice(-3), motion('still', 'A fixed silhouette and labels preserve the answer.'), 'infrastructure'),
    lowQualityState: visualState(`${spec.beaconName} simplified answer`, `high-contrast ${spec.beaconSilhouette}`, spec.visualMaterials.slice(-2), motion('still', 'One stable contour and label preserve completion.'), 'infrastructure'),
    overlapGroup: `${spec.id}-beacon`,
    canOverlapWith: [],
    minimumHeartDistance: 2,
    priorityWhilePanelOpen: 'hold',
    audioCue: `${spec.prefix}-beacon`,
    loreRecord: `${spec.prefix}-echo-10`,
  }
  const heartMotion = spec.physics.spectrum ? 'optical' : spec.physics.charge ? 'atmospheric' : 'waveform'
  return {
    id: spec.id,
    identity: {
      name: spec.name,
      shortName: spec.shortName,
      epithet: spec.epithet,
      premise: spec.premise,
      primaryVerb: spec.primaryVerb,
      civilizationQuestion: spec.question,
    },
    economy: {
      currency: { id: `${spec.prefix}-currency`, canonicalName: 'World Currency', localName: spec.currency, singular: spec.currency, plural: spec.currency, glyph: spec.currencyGlyph, material: spec.currencyMaterial, scope: 'world' },
      doctrines: spec.doctrines.map((doctrine, index) => ({ id: `${spec.prefix}-doctrine-${index + 1}`, ...doctrine })) as unknown as FourTuple<DoctrineDef>,
      localPrestige: {
        id: `${spec.prefix}-epoch`,
        canonicalName: 'Epoch Turn',
        localName: spec.epochName,
        rewardCurrency: { id: `${spec.prefix}-epoch-matter`, canonicalName: 'Epoch Matter', localName: spec.epochMatter, singular: spec.epochMatterSingular, plural: spec.epochMatter, glyph: spec.epochGlyph, material: spec.epochMaterial, scope: 'epoch' },
        gainFormulaId: `${spec.prefix}-epoch-gain`,
        loses: ['world-currency', 'run-earnings', 'kindlings', 'ordinary-upgrades', 'buy-mode'],
        retains: ['epoch-matter', 'epoch-doctrines', 'epoch-works', 'era-earnings', 'deep-currency', 'deep-laws', 'deep-works', 'trials', 'archive', 'story', 'beacons', 'between-currency', 'wayfinder'],
        ceremonyFeedbackId: `${spec.prefix}-prestige`,
      },
    },
    heart: {
      id: `${spec.prefix}-heart`,
      canonicalName: 'Heart',
      localName: spec.heartName,
      phenomenon: spec.heartPhenomenon,
      purpose: `Primary focusable input and the ${spec.primaryVerb} center of ${spec.shortName}.`,
      material: spec.visualMaterials.slice(0, 4),
      silhouette: spec.heartSilhouette,
      idleMotion: motion(heartMotion, `${spec.heartName} displays the current world-law state without hiding its hit target.`, 4_800),
      touchMotion: motion(heartMotion, `Touching the Heart visibly ${spec.heartVerb}.`, 420),
      reducedMotionState: visualState(`${spec.heartName} fixed state`, `${spec.heartSilhouette} with labeled law-state marks`, spec.visualMaterials.slice(0, 3), motion('still', 'A local contrast change preserves touch and timing.'), 'single'),
      lowQualityState: visualState(`${spec.heartName} simplified state`, `high-contrast ${spec.heartSilhouette}`, spec.visualMaterials.slice(0, 2), motion('still', 'One stable contour preserves the Heart target.'), 'single'),
      touchCue: `${spec.prefix}-click`,
      focusLabel: `${spec.heartName}, Heart of ${spec.shortName}; ${spec.primaryVerb} ${spec.currency}`,
    },
    physics: spec.physics,
    omens,
    archive,
    trials: makeTrials(spec),
    story: { civilizationQuestion: spec.question, scenes: story.scenes },
    audio: makeAudio(spec),
    visual: {
      materials: spec.visualMaterials,
      primarySilhouettes: spec.primarySilhouettes,
      motionGrammar: [heartMotion, 'still'],
      zones: {
        heart: { purpose: `Keeps ${spec.heartName} as the sole primary target.`, maximumInteractiveObjects: 1, motionFrequency: 'high' },
        near: { purpose: `Shows foundational ${spec.primaryVerb} systems and at most three interactions.`, maximumInteractiveObjects: 3, motionFrequency: 'medium' },
        far: { purpose: 'Shows civil infrastructure and archive relationships.', maximumInteractiveObjects: 2, motionFrequency: 'low' },
        horizon: { purpose: `Holds ${spec.beaconName} and the long-term world answer.`, maximumInteractiveObjects: 1, motionFrequency: 'low' },
      },
      objects: [...generatorObjects, ...archiveObjects, ...omenObjects, beaconObject],
      densityMerges: [
        { sourceIds: generatorObjects.slice(0, 6).map(({ id }) => id), threshold: 25, resultObjectId: generatorObjects[5].id, description: `Foundational ${spec.shortName} Kindlings become one legible ${spec.primarySilhouettes[0]}.` },
        { sourceIds: generatorObjects.slice(6, 14).map(({ id }) => id), threshold: 50, resultObjectId: generatorObjects[13].id, description: `Civil systems merge into ${spec.primarySilhouettes[1]}.` },
        { sourceIds: generatorObjects.slice(14).map(({ id }) => id), threshold: 100, resultObjectId: generatorObjects[17].id, description: `Cosmic systems resolve into ${spec.beaconSilhouette}.` },
      ],
      attentionBudget: { primaryTargets: 1, secondaryInteractiveObjects: 3, temporaryRewardEffects: 2, storySubtitles: 1, majorPanels: 1 },
    },
    beacon: {
      id: `${spec.prefix}-beacon`,
      canonicalName: 'Beacon',
      localName: spec.beaconName,
      requirement: { sourceKind: 'generator', sourceId: generators[17].id, target: 1, description: `Establish one ${generators[17].name}.` },
      darkBetweenReward: spec.beaconReward,
      object: beaconObject,
      mapSilhouette: spec.beaconSilhouette,
    },
    accessibility: {
      heartLabel: `${spec.heartName}, Heart of ${spec.shortName}; ${spec.primaryVerb} ${spec.currency}`,
      currencyLabel: `${spec.currency}, World Currency`,
      screenReaderOrder: [`${spec.prefix}-heart`, `${spec.prefix}-law-panel`, ...generatorObjects.slice(0, 6).map(({ id }) => id), `${spec.prefix}-archive`, `${spec.prefix}-beacon`],
      announcements: [
        { messageKey: `${spec.id}.announcement.purchase`, politeness: 'polite', dedupeKey: `${spec.id}-purchase`, minimumIntervalMs: 500 },
        { messageKey: `${spec.id}.announcement.law`, politeness: 'polite', dedupeKey: `${spec.id}-law`, minimumIntervalMs: 800 },
        { messageKey: `${spec.id}.announcement.omen`, politeness: 'assertive', dedupeKey: `${spec.id}-omen`, minimumIntervalMs: 1_000 },
        { messageKey: `${spec.id}.announcement.epoch`, politeness: 'polite', dedupeKey: `${spec.id}-epoch`, minimumIntervalMs: 3_000 },
        ...(spec.id === 'brahmalok' ? [
          { messageKey: 'brahmalok.announcement.commission', politeness: 'polite' as const, dedupeKey: 'brahmalok-commission', minimumIntervalMs: 1_000 },
          { messageKey: 'brahmalok.announcement.commission-answer', politeness: 'polite' as const, dedupeKey: 'brahmalok-commission-answer', minimumIntervalMs: 1_000 },
        ] : spec.id === 'vishnulok' ? [
          { messageKey: 'vishnulok.announcement.strain', politeness: 'polite' as const, dedupeKey: 'vishnulok-strain', minimumIntervalMs: 1_000 },
          { messageKey: 'vishnulok.announcement.strain-restored', politeness: 'polite' as const, dedupeKey: 'vishnulok-strain-restored', minimumIntervalMs: 1_000 },
          { messageKey: 'vishnulok.announcement.confluence', politeness: 'polite' as const, dedupeKey: 'vishnulok-confluence', minimumIntervalMs: 1_000 },
        ] : spec.id === 'kailash' ? [
          { messageKey: 'kailash.announcement.front-approach', politeness: 'polite' as const, dedupeKey: 'kailash-front-approach', minimumIntervalMs: 1_000 },
          { messageKey: 'kailash.announcement.front-active', politeness: 'polite' as const, dedupeKey: 'kailash-front-active', minimumIntervalMs: 1_000 },
          { messageKey: 'kailash.announcement.front-answered', politeness: 'polite' as const, dedupeKey: 'kailash-front-answered', minimumIntervalMs: 1_000 },
          { messageKey: 'kailash.announcement.long-rest', politeness: 'polite' as const, dedupeKey: 'kailash-long-rest', minimumIntervalMs: 1_000 },
        ] : []),
      ],
      nonColorSignals: spec.nonColorSignals.map((signal) => ({ stateId: signal.id, text: signal.text, shape: signal.shape, pattern: signal.pattern, highContrastTreatment: `Bold ${signal.shape} with text “${signal.text}”.` })),
      timing: { visualCue: `${spec.heartName} and law panel expose state with labeled shapes.`, audioCue: `${spec.audioFamilies[0]} marks input without carrying exclusive information.`, shapeCue: spec.nonColorSignals.map(({ shape }) => shape).join(', '), averagedModeAvailable: true, averagedRewardRatio: [0.85, 0.9] },
      muted: { fullGameplayEquivalent: true, captions: [spec.silenceState, `${spec.epochName} and every Omen have text-and-shape equivalents.`] },
      reducedMotion: { fullGameplayEquivalent: true, replacementStrategy: 'local-pulse', timingInformationPreserved: true },
      lowQuality: { fullGameplayEquivalent: true, preservesHitTargets: true, preservesStateLabels: true },
    },
  }
}

export function createFutureUniversePack(spec: FutureUniverseSpec): {
  readonly legacy: UniversePack
  readonly v2: UniversePackV2
} {
  if (spec.kindlings.length !== 18) throw new TypeError(`${spec.id} requires exactly 18 Kindlings.`)
  if (spec.archives.length !== 12) throw new TypeError(`${spec.id} requires exactly 12 Archive records.`)
  if (spec.omens.length < 4) throw new TypeError(`${spec.id} requires at least four Omens.`)
  if (spec.doctrines.length !== 4) throw new TypeError(`${spec.id} requires exactly four doctrines.`)
  if (spec.story.length !== 10) throw new TypeError(`${spec.id} requires exactly ten core Echoes.`)
  if (spec.economy.baseCosts.length !== 18 || spec.economy.baseRates.length !== 18) {
    throw new TypeError(`${spec.id} requires eighteen authored cost and rate values.`)
  }
  if (spec.economy.baseCosts.some((value) => !Number.isFinite(value) || value <= 0)
    || spec.economy.baseRates.some((value) => !Number.isFinite(value) || value <= 0)) {
    throw new TypeError(`${spec.id} requires finite positive authored costs and rates.`)
  }
  if (!Number.isFinite(spec.economy.costMultiplier) || spec.economy.costMultiplier <= 1) {
    throw new TypeError(`${spec.id} requires a finite generator cost multiplier above one.`)
  }
  const generators = spec.kindlings.map((seed, index) => makeGenerator(spec, seed, index))
  const upgrades = makeUpgrades(spec, generators)
  const { cabinet, items } = makeCabinet(spec)
  const story = makeStory(spec, generators)
  const legacy: UniversePack = {
    id: spec.id,
    name: spec.name,
    shortName: spec.shortName,
    currency: spec.currency,
    currencyGlyph: spec.currencyGlyph,
    centralObject: spec.heartName,
    achievementPower: spec.achievementPower,
    description: spec.premise,
    generators,
    generatorById: new Map(generators.map((generator) => [generator.id, generator])),
    upgrades,
    upgradeById: new Map(upgrades.map((upgrade) => [upgrade.id, upgrade])),
    lumen: story.lumen,
    echoes: story.echoes,
    palette: { theme: spec.id, accentHue: spec.palette.accentHue, vars: { '--bg': spec.palette.bg, '--amber': spec.palette.accent, '--gold': spec.palette.gold, '--panel': spec.palette.panel } },
    audio: { music: spec.id, click: spec.id, event: spec.id },
    events: {
      noun: spec.id === 'brahmalok' ? 'Creative Opening' : spec.id === 'vishnulok' ? 'Sustaining Opening' : 'Passing Snow',
      motion: 'bubble',
      powerUps: spec.omens.map((omen, index) => ({ id: `${spec.prefix}-power-${index + 1}`, label: omen.name, glyph: spec.id === 'brahmalok' ? '✤' : spec.id === 'vishnulok' ? '≈' : '△', hue: (spec.palette.accentHue + index * 29) % 360, weight: 25, prodMult: 2 + index * 0.5, durationSec: 24 + index * 6, toast: omen.description })),
    },
    cabinet,
    twist: { id: `${spec.prefix}-world-law`, name: spec.physics.spectrum ? 'The Lotus of Becoming' : spec.physics.charge ? 'The Endless Circuit' : 'The Still Point', randomnessAllowed: spec.physics.randomAllowed, description: spec.physics.spectrum ? 'Route Kindlings through seed, measure, name, and form; the selected creation relationship changes production.' : spec.physics.charge ? 'Gather continuity, declare a correction circuit, and complete its return through visible refuges.' : 'Arrange emergence, shelter, release, veil, grace, and deliberate rests into a responsible cycle.' },
    route: { glyph: spec.routeGlyph, epithet: spec.epithet.toLowerCase(), arrival: spec.routeArrival, unlockText: spec.unlockText },
    beacon: { generatorId: generators[17].id, count: 1, reward: spec.beaconReward, description: `${spec.beaconName} continues the world law without the player.` },
  }
  return { legacy, v2: adaptLegacyUniversePack(legacy, makeV2Supplement(spec, generators, items, story)) }
}

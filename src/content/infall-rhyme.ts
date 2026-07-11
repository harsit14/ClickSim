export type InfallRhymeBeatId = 'settlement' | 'suns' | 'constellations' | 'instruments'

export interface InfallRhymeBeat {
  readonly id: InfallRhymeBeatId
  readonly supernovaPhaseId: string
  readonly startMs: number
  readonly durationMs: number
  readonly visual: string
  readonly shapeCue: string
  readonly caption: string
  readonly reducedMotion: string
  readonly questionLine: string
  readonly echoSentence: string
}

/**
 * The confession shared by the Epoch Turn and Act III. Every consumer uses these
 * same ordered beats so the Devourer's feeding cannot drift into a generic list.
 */
export const INFALL_RHYME_BEATS: readonly InfallRhymeBeat[] = [
  {
    id: 'settlement',
    supernovaPhaseId: 'infall-settlement',
    startMs: 6_000,
    durationMs: 1_500,
    visual: 'The settlement unravels bottom-up into warm material ribbons.',
    shapeCue: 'ground silhouettes narrow into three converging paths',
    caption: 'The kept fire returns first.',
    reducedMotion: 'Settlement silhouettes step locally from solid to outline to absent.',
    questionLine: 'First, the settlement went dark house by house, bottom-up. Its hearths narrowed into warm ribbons and returned to the Heart.',
    echoSentence: 'The settled hearths went dark house by house, bottom-up, and their walls narrowed into warm ribbons aimed at the final Heart.',
  },
  {
    id: 'suns',
    supernovaPhaseId: 'infall-suns',
    startMs: 7_500,
    durationMs: 1_500,
    visual: 'Suns leave their assigned ecliptic seats and stream inward.',
    shapeCue: 'stellar disks become gold radial strokes',
    caption: 'The ecliptic empties.',
    reducedMotion: 'Each occupied seat changes to one stationary hollow ring, then black.',
    questionLine: 'Then the suns left their assigned ecliptic seats. Each disk became a gold radial stroke, and the sky kept the hollow rings.',
    echoSentence: 'Then the suns left their assigned ecliptic seats, each disk lengthening into a gold radial stroke while a hollow ring kept its place.',
  },
  {
    id: 'constellations',
    supernovaPhaseId: 'infall-constellations',
    startMs: 9_000,
    durationMs: 1_500,
    visual: 'Constellation routes snap free at their joints and whip inward.',
    shapeCue: 'line figures shorten from their outermost joints',
    caption: 'The remembered figures come apart.',
    reducedMotion: 'Joints extinguish in route order while the lines remain stationary.',
    questionLine: 'Then the constellation routes snapped free at their outer joints and whipped inward. The remembered figures came apart in route order.',
    echoSentence: 'Then constellation routes snapped free at their outer joints and whipped inward, their remembered figures shortening in route order.',
  },
  {
    id: 'instruments',
    supernovaPhaseId: 'infall-hud',
    startMs: 10_500,
    durationMs: 1_500,
    visual: 'Galaxies unwind, then HUD, shop, upgrades, and dock detach and fall inward.',
    shapeCue: 'world and instrument panels become one narrowing perspective stack',
    caption: 'Even the instruments were made of light.',
    reducedMotion: 'World bands and UI regions switch off in labeled acquisition order.',
    questionLine: 'Last, the galaxies unwound. Even their instruments detached from the edges, tilted into the scene, and fell into the same narrowing point.',
    echoSentence: 'Last, galaxies unwound like thread; counters, ledgers, and controls detached from the edges, tilted into the world, and fell into the same narrowing point.',
  },
]

export const QUESTION_INFALL_START_INDEX = 3

export function questionInfallBeat(lineIndex: number): InfallRhymeBeat | null {
  if (!Number.isInteger(lineIndex)) return null
  return INFALL_RHYME_BEATS[lineIndex - QUESTION_INFALL_START_INDEX] ?? null
}

export function infallRhymeBeatForPhase(phaseId: string): InfallRhymeBeat | null {
  return INFALL_RHYME_BEATS.find((beat) => beat.supernovaPhaseId === phaseId) ?? null
}

export const DEVOURER_INFALL_ACCOUNT = INFALL_RHYME_BEATS.map(({ echoSentence }) => echoSentence).join(' ')

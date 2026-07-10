import { UNIVERSES, type UniverseId } from '../content/universes'
import type { GardenEnding } from './types'

export interface GardenNode {
  readonly universeId: UniverseId
  readonly name: string
  readonly offering: string
  readonly question: string
}

export interface GardenLink {
  readonly id: string
  readonly from: UniverseId
  readonly to: UniverseId
  readonly name: string
  readonly result: string
}

export interface GardenClosure {
  readonly id: GardenEnding
  readonly name: string
  readonly consequence: string
  readonly finalLine: string
  readonly requiresAllAnswers: boolean
}

export const GARDEN_NODES: readonly GardenNode[] = [
  { universeId: 'emberlight', name: 'Hearth of Beginnings', offering: 'warmth with a remembered cost', question: 'Who decides what may be kindled?' },
  { universeId: 'tidefall', name: 'Pool of Returns', offering: 'grief that can move without vanishing', question: 'What can be released without being erased?' },
  { universeId: 'verdance', name: 'Canopy of Consent', offering: 'growth that leaves room for endings', question: 'What must change so another life can begin?' },
  { universeId: 'clockwork', name: 'Open Escapement', offering: 'prediction with one deliberate uncertainty', question: 'Can a forecast advise without ruling?' },
  { universeId: 'prismata', name: 'Labeled White', offering: 'unity whose differences remain inspectable', question: 'Can a shared sky keep every wavelength’s name?' },
  { universeId: 'tempest', name: 'Grounded Path', offering: 'power released through a chosen boundary', question: 'When does restraint become another kind of violence?' },
  { universeId: 'canticle', name: 'Place for an Answer', offering: 'harmony with a positive rest', question: 'Can belonging preserve an unscripted voice?' },
]

export const GARDEN_LINKS: readonly GardenLink[] = [
  { id: 'shared-sky', from: 'emberlight', to: 'prismata', name: 'The Shared Sky', result: 'warmth passes through labeled lenses without becoming the only color' },
  { id: 'rain-treaty', from: 'tidefall', to: 'verdance', name: 'The Rain Treaty', result: 'returning water ages a forest without forcing its season' },
  { id: 'weather-clock', from: 'clockwork', to: 'tempest', name: 'The Weather Clock', result: 'a forecast declares the threshold but never chooses the lightning path' },
  { id: 'choir-storms', from: 'tempest', to: 'canticle', name: 'The Choir of Storms', result: 'discharge becomes percussion and leaves a rest after every branch' },
  { id: 'garden-map', from: 'verdance', to: 'canticle', name: 'The Garden Map', result: 'living relationships become routes the Atlas can revisit' },
  { id: 'open-future', from: 'clockwork', to: 'prismata', name: 'The Open Future', result: 'cause and color remain visible without becoming destiny' },
  { id: 'first-water', from: 'emberlight', to: 'tidefall', name: 'First Water', result: 'the first warmth learns that tending is not possession' },
]

export const GARDEN_CLOSURES: readonly GardenClosure[] = [
  {
    id: 'warden', name: 'Return the boundaries', requiresAllAnswers: false,
    consequence: 'Worlds govern their own crossings. The Heart remains distant, visible, and unable to consume without invitation.',
    finalLine: 'You keep the gate by refusing to become it.',
  },
  {
    id: 'hunger', name: 'Transform the hunger', requiresAllAnswers: false,
    consequence: 'Endings become compost under explicit limits. Every consumed form names what its matter may support next.',
    finalLine: 'Appetite learns the grammar of consent.',
  },
  {
    id: 'companion', name: 'Join the network', requiresAllAnswers: false,
    consequence: 'The player gives up central control. The Heart becomes one node among seven worlds and their possible successors.',
    finalLine: 'The answer arrives in a voice that is not yours.',
  },
  {
    id: 'continue', name: 'Continue', requiresAllAnswers: true,
    consequence: 'No doctrine is declared false. Their tensions become compatible Atlas laws, preserved for routes still unimagined.',
    finalLine: 'The story ends. The map remains open.',
  },
]

export function gardenUnlocked(beacons: readonly string[]): boolean {
  return UNIVERSES.every((universe) => beacons.includes(universe.id))
}

export function livedAnswers(
  pastEndings: readonly string[],
  currentEnding: string | null,
): readonly GardenEnding[] {
  const accepted = new Set<GardenEnding>()
  for (const ending of [...pastEndings, currentEnding]) {
    if (ending === 'warden' || ending === 'hunger' || ending === 'companion') accepted.add(ending)
  }
  return [...accepted]
}

export function availableGardenClosures(
  beacons: readonly string[],
  pastEndings: readonly string[],
  currentEnding: string | null,
): readonly GardenClosure[] {
  if (!gardenUnlocked(beacons)) return []
  const answers = livedAnswers(pastEndings, currentEnding)
  return GARDEN_CLOSURES.filter((closure) => !closure.requiresAllAnswers || answers.length === 3)
}

export function gardenCredits(ending: GardenEnding): readonly string[] {
  const closure = GARDEN_CLOSURES.find((entry) => entry.id === ending)
  if (!closure) return []
  return [
    'SEVEN WORLDS, RESTORED WITHOUT BECOMING ONE',
    ...GARDEN_NODES.map((node) => `${node.name} — ${node.offering}`),
    closure.finalLine,
    'The Atlas of Possible Worlds is now a permanent continuation, not an unfinished ending.',
  ]
}

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
  { universeId: 'brahmalok', name: 'Open Lotus', offering: 'possibility with no single ordained form', question: 'Can creation leave room for what it did not imagine?' },
  { universeId: 'vishnulok', name: 'Returning Harbor', offering: 'continuity that changes in order to care', question: 'What must preservation allow to return differently?' },
  { universeId: 'kailash', name: 'Open Summit', offering: 'release with shelter still below', question: 'Can an ending clear a path without abandoning the living?' },
]

export const GARDEN_LINKS: readonly GardenLink[] = [
  { id: 'shared-sky', from: 'emberlight', to: 'brahmalok', name: 'The First Margin', result: 'first warmth opens possibility without authoring every form' },
  { id: 'rain-treaty', from: 'tidefall', to: 'verdance', name: 'The Rain Treaty', result: 'returning water ages a forest without forcing its season' },
  { id: 'weather-clock', from: 'clockwork', to: 'vishnulok', name: 'The Unscheduled Current', result: 'a forecast yields when responsive refuge requires another course' },
  { id: 'choir-storms', from: 'vishnulok', to: 'kailash', name: 'The Returning Ascent', result: 'completed return approaches release with every shelter still open' },
  { id: 'garden-map', from: 'verdance', to: 'kailash', name: 'The Renewal Path', result: 'living change becomes a route through responsible release and return' },
  { id: 'open-future', from: 'clockwork', to: 'brahmalok', name: 'The Open Future', result: 'cause and creation remain legible without becoming destiny' },
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
    consequence: 'The player gives up central control. The Heart becomes one relation among four restored worlds, three lokas, and their possible successors.',
    finalLine: 'The answer arrives through a relation you did not author.',
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
    'FOUR RESTORED WORLDS · THREE LOKAS · ONE OPEN GARDEN',
    ...GARDEN_NODES.map((node) => `${node.name} — ${node.offering}`),
    closure.finalLine,
    'The Atlas of Possible Worlds is now a permanent continuation, not an unfinished ending.',
  ]
}

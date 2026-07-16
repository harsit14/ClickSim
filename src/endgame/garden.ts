import { UNIVERSES, type UniverseId } from '../content/universes'
import {
  REALM_CONCLUSIONS,
  latestRealmAnswer,
  type RealmAnswerHistory,
  type RealmAnswerId,
} from '../content/endings'
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

export interface GardenAnswerEcho {
  readonly universeId: UniverseId
  readonly realmName: string
  readonly question: string
  readonly answerId: RealmAnswerId
  readonly answerLabel: string
  readonly lawName: string
  readonly offering: string
}

export interface GardenSynthesis {
  readonly complete: boolean
  readonly title: string
  readonly opening: string
  readonly pattern: string
  readonly tension: string
  readonly echoes: readonly GardenAnswerEcho[]
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
    id: 'warden', name: 'Boundary', requiresAllAnswers: false,
    consequence: 'Worlds govern their own crossings. The Heart remains distant, visible, and unable to consume without invitation.',
    finalLine: 'You keep the gate by refusing to become it.',
  },
  {
    id: 'hunger', name: 'Renewal', requiresAllAnswers: false,
    consequence: 'Only what has already fallen becomes soil, within a stated limit. Every transformation names its witnesses, its cost, and what remains untouched.',
    finalLine: 'Let change feed a future it cannot command.',
  },
  {
    id: 'companion', name: 'Relation', requiresAllAnswers: false,
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

export function gardenAnswerEchoes(history: Readonly<RealmAnswerHistory>): readonly GardenAnswerEcho[] {
  return UNIVERSES.flatMap((universe) => {
    const universeId = universe.id as UniverseId
    const conclusion = REALM_CONCLUSIONS[universeId]
    const answer = latestRealmAnswer(history, universeId)
    if (!answer) return []
    return [{
      universeId,
      realmName: universe.shortName,
      question: conclusion.question,
      answerId: answer.id,
      answerLabel: answer.label,
      lawName: answer.lawName,
      offering: answer.gardenEcho,
    } satisfies GardenAnswerEcho]
  })
}

export function gardenNodesForAnswers(history: Readonly<RealmAnswerHistory>): readonly GardenNode[] {
  const echoes = new Map(gardenAnswerEchoes(history).map((echo) => [echo.universeId, echo]))
  return GARDEN_NODES.map((node) => ({
    ...node,
    question: REALM_CONCLUSIONS[node.universeId].question,
    offering: echoes.get(node.universeId)?.offering ?? node.offering,
  }))
}

export function gardenSynthesis(history: Readonly<RealmAnswerHistory>): GardenSynthesis {
  const echoes = gardenAnswerEchoes(history)
  const byUniverse = new Map(echoes.map((echo) => [echo.universeId, echo]))
  const emberlight = byUniverse.get('emberlight')
  const tidefall = byUniverse.get('tidefall')
  const verdance = byUniverse.get('verdance')
  const clockwork = byUniverse.get('clockwork')
  const brahmalok = byUniverse.get('brahmalok')
  const vishnulok = byUniverse.get('vishnulok')
  const kailash = byUniverse.get('kailash')
  return {
    complete: echoes.length === UNIVERSES.length,
    title: echoes.length === UNIVERSES.length ? 'Seven answers · one open Garden' : `${echoes.length} answers carried`,
    opening: emberlight && tidefall
      ? `${emberlight.answerLabel} made a beginning in Emberlight; ${tidefall.answerLabel} decided what crossed from it. ${emberlight.offering} now meets ${tidefall.offering}.`
      : 'Emberlight and Tidefall will meet here when both of their answers have been lived.',
    pattern: verdance && clockwork
      ? `${verdance.answerLabel} shaped inheritance in Verdance; ${clockwork.answerLabel} set the terms under which that inheritance could be refused. ${verdance.offering} now meets ${clockwork.offering}.`
      : 'Verdance and Clockwork will keep growth and refusal answerable to one another when both answers arrive.',
    tension: brahmalok && vishnulok && kailash
      ? `${brahmalok.answerLabel} left creation revisable, ${vishnulok.answerLabel} defined return, and ${kailash.answerLabel} decided what the cycle leaves open. ${brahmalok.offering}, ${vishnulok.offering}, and ${kailash.offering} remain answerable to one another.`
      : 'Every answered realm remains present here without being reduced to a score; the unfinished relations stay visible.',
    echoes,
  }
}

export function gardenCredits(
  ending: GardenEnding,
  realmAnswers: Readonly<RealmAnswerHistory> = {},
): readonly string[] {
  const closure = GARDEN_CLOSURES.find((entry) => entry.id === ending)
  if (!closure) return []
  const synthesis = gardenSynthesis(realmAnswers)
  const nodes = gardenNodesForAnswers(realmAnswers)
  return [
    'FOUR RESTORED WORLDS · THREE LOKAS · ONE OPEN GARDEN',
    ...(synthesis.complete ? [synthesis.opening, synthesis.pattern, synthesis.tension] : []),
    ...nodes.map((node) => `${node.name} — ${node.offering}`),
    closure.finalLine,
    'The Atlas of Possible Worlds is now a permanent continuation, not an unfinished ending.',
  ]
}

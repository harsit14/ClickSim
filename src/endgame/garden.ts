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
  readonly character: GardenLinkCharacter
  readonly characterLabel: string
  readonly characterGlyph: string
  readonly sourceAnswerId: RealmAnswerId | null
  readonly targetAnswerId: RealmAnswerId | null
}

export type GardenLinkCharacter =
  | 'latent'
  | 'held'
  | 'spillway'
  | 'handoff'
  | 'tempered'
  | 'open'
  | 'branching'
  | 'answered'
  | 'responsive'
  | 'reciprocal'

export interface GardenLinkVariant {
  readonly linkId: string
  readonly sourceAnswerId: RealmAnswerId
  readonly targetAnswerId: RealmAnswerId
  readonly result: string
  readonly character: Exclude<GardenLinkCharacter, 'latent'>
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
  readonly relations: readonly GardenLink[]
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

export const GARDEN_LINK_CHARACTERS: Readonly<Record<GardenLinkCharacter, {
  readonly label: string
  readonly glyph: string
}>> = {
  latent: { label: 'relation awaiting both answers', glyph: '···' },
  held: { label: 'kept threshold', glyph: '|·|' },
  spillway: { label: 'permeable threshold', glyph: '|≈' },
  handoff: { label: 'witnessed handoff', glyph: '|→' },
  tempered: { label: 'bounded current', glyph: '≈|' },
  open: { label: 'open current', glyph: '≈≈' },
  branching: { label: 'branching current', glyph: '≈↗' },
  answered: { label: 'answerable braid', glyph: '✦|' },
  responsive: { label: 'responsive braid', glyph: '✦≈' },
  reciprocal: { label: 'reciprocal braid', glyph: '✦✦' },
}

type GardenVariantSeed = Pick<GardenLinkVariant, 'result' | 'character'>
type GardenVariantMatrix = readonly [
  readonly [GardenVariantSeed, GardenVariantSeed, GardenVariantSeed],
  readonly [GardenVariantSeed, GardenVariantSeed, GardenVariantSeed],
  readonly [GardenVariantSeed, GardenVariantSeed, GardenVariantSeed],
]

interface GardenLinkDefinition {
  readonly id: string
  readonly from: UniverseId
  readonly to: UniverseId
  readonly name: string
  readonly fallback: string
  readonly variants: readonly GardenLinkVariant[]
}

const RELATION_CHARACTERS = [
  ['held', 'spillway', 'handoff'],
  ['tempered', 'open', 'branching'],
  ['answered', 'responsive', 'reciprocal'],
] as const

function pairVariants(
  linkId: string,
  from: UniverseId,
  to: UniverseId,
  results: GardenVariantMatrix,
): readonly GardenLinkVariant[] {
  const sourceChoices = REALM_CONCLUSIONS[from].choices
  const targetChoices = REALM_CONCLUSIONS[to].choices
  return sourceChoices.flatMap((source, sourceIndex) => targetChoices.map((target, targetIndex) => ({
    linkId,
    sourceAnswerId: source.id,
    targetAnswerId: target.id,
    result: results[sourceIndex][targetIndex].result,
    character: results[sourceIndex][targetIndex].character,
  })))
}

const cell = (result: string, sourceIndex: 0 | 1 | 2, targetIndex: 0 | 1 | 2): GardenVariantSeed => ({
  result,
  character: RELATION_CHARACTERS[sourceIndex][targetIndex],
})

const GARDEN_LINK_DEFINITIONS: readonly GardenLinkDefinition[] = [
  {
    id: 'shared-sky', from: 'emberlight', to: 'brahmalok', name: 'The First Margin',
    fallback: 'first warmth opens possibility without authoring every form',
    variants: pairVariants('shared-sky', 'emberlight', 'brahmalok', [
      [
        cell('The banked flame and the open folio keep different margins: one around fuel, one around authorship.', 0, 0),
        cell('A reserve remains unspent after the maker’s claim is released; future hands inherit possibility without instruction.', 0, 1),
        cell('The guarded coal opens through shared revision, becoming a trust rather than a locked inheritance.', 0, 2),
      ],
      [
        cell('Inhabited warmth reaches the folio’s ruled edge, where urgency must leave room for lives it did not design.', 1, 0),
        cell('The ember is spent and the maker’s claim released; those warmed inherit both the work and its visible cost.', 1, 1),
        cell('The open hearth’s debt passes among many revisers, none permitted to hide what their warmth consumes.', 1, 2),
      ],
      [
        cell('The gifted spark reaches a margin its first keeper cannot close, protecting the recipient’s right to revise.', 2, 0),
        cell('Spark and work both leave their first hands; responsibility survives as repair offered without ownership.', 2, 1),
        cell('Many bearers revise the given spark together, and no first hand keeps the final signature.', 2, 2),
      ],
    ]),
  },
  {
    id: 'rain-treaty', from: 'tidefall', to: 'verdance', name: 'The Rain Treaty',
    fallback: 'returning water ages a forest without forcing its season',
    variants: pairVariants('rain-treaty', 'tidefall', 'verdance', [
      [
        cell('Named losses are read before each witnessed cut; remembrance does not veto the light needed below.', 0, 0),
        cell('The names remain legible while wind takes the canopy beyond the archive’s plan.', 0, 1),
        cell('Carried names join altered rootstock, letting descendants remember without reproducing the lost shore.', 0, 2),
      ],
      [
        cell('Living memory feeds the soil while witnesses name which branches are deliberately ended.', 1, 0),
        cell('Current and canopy move beyond central arrangement; what survives does so without calling the change fair.', 1, 1),
        cell('Memory becomes weather around grafted lineages, feeding revisions no archive can certify as original.', 1, 2),
      ],
      [
        cell('Those who chose what crossed the flood also witness what must be cut, keeping both decisions answerable to affected lives.', 2, 0),
        cell('Many carried archives enter an unarranged canopy, where no single testimony controls succession.', 2, 1),
        cell('Self-chosen memories meet negotiated inheritance; each graft keeps more than one account of belonging.', 2, 2),
      ],
    ]),
  },
  {
    id: 'weather-clock', from: 'clockwork', to: 'vishnulok', name: 'The Unscheduled Current',
    fallback: 'a forecast yields when responsive refuge requires another course',
    variants: pairVariants('weather-clock', 'clockwork', 'vishnulok', [
      [
        cell('Advisory forecasts mark danger while dependable routes remain recognizable and refusals stay open.', 0, 0),
        cell('The warning yields when refuge must change course, and its appeal records who bore the correction.', 0, 1),
        cell('Forecasts remain counsel; those who return decide whether the advised route still names their continuity.', 0, 2),
      ],
      [
        cell('The broken schedule leaves one recognizable harbor standing: shelter without restored command.', 1, 0),
        cell('Certainty is interrupted so care can answer present need, with each changed route recorded as a choice.', 1, 1),
        cell('The schedule releases its claim before the returned name themselves, leaving risk and identity in living hands.', 1, 2),
      ],
      [
        cell('One unmeasured hour rests inside a dependable harbor, protecting refusal without making home unreadable.', 2, 0),
        cell('Protected uncertainty lets the promise of refuge revise its route before the timetable can close it.', 2, 1),
        cell('The blank interval belongs to the returned; neither clock nor archive supplies the final name.', 2, 2),
      ],
    ]),
  },
  {
    id: 'choir-storms', from: 'vishnulok', to: 'kailash', name: 'The Returning Ascent',
    fallback: 'completed return approaches release with every shelter still open',
    variants: pairVariants('choir-storms', 'vishnulok', 'kailash', [
      [
        cell('A recognizable harbor sends one bounded seed down the open path, preserving shelter without prescribing the next garden.', 0, 0),
        cell('The harbor keeps its route long enough for refuge, then lets the route itself dissolve without making a claim on Kailash.', 0, 1),
        cell('A familiar route remains visible beside the open descent, available without becoming compulsory.', 0, 2),
      ],
      [
        cell('The promise of refuge carries one limited seed, but its care must answer to whoever tends the next beginning.', 1, 0),
        cell('Care releases its former shape after shelter is secured, keeping the obligation visible beyond the form.', 1, 1),
        cell('Responsive refuge leaves the descent open, so return remains possible without being required.', 1, 2),
      ],
      [
        cell('Those returned choose how the single seed is named and whether its provenance belongs in the next cycle.', 2, 0),
        cell('Self-named continuity can release its forms without surrendering the testimony of those who lived them.', 2, 1),
        cell('Many returned names remain beside the open path; none becomes the authorized meaning of the descent.', 2, 2),
      ],
    ]),
  },
  {
    id: 'garden-map', from: 'verdance', to: 'kailash', name: 'The Renewal Path',
    fallback: 'living change becomes a route through responsible release and return',
    variants: pairVariants('garden-map', 'verdance', 'kailash', [
      [
        cell('A witnessed branch becomes one bounded seed, its provenance carried down without calling one lineage the whole forest.', 0, 0),
        cell('The named cut is completed without converting loss into a mandate for what must grow next.', 0, 1),
        cell('Witnesses leave both the cut record and the downward path open, so descendants may revisit either.', 0, 2),
      ],
      [
        cell('Wind selects no official heir; one limited seed travels downward as possibility rather than command.', 1, 0),
        cell('Wild succession meets complete release, clearing room while leaving every living presence outside the taking.', 1, 1),
        cell('The unarranged canopy opens onto an unfinished path, allowing return without a keeper deciding its season.', 1, 2),
      ],
      [
        cell('A seed of revised lineage carries two inheritances down, bounded in scale but not in future meaning.', 2, 0),
        cell('The graft releases its claim to purity before its forms dissolve, while relation survives as testimony.', 2, 1),
        cell('Negotiated inheritance continues along an open descent, available for successors to alter again.', 2, 2),
      ],
    ]),
  },
  {
    id: 'open-future', from: 'clockwork', to: 'brahmalok', name: 'The Open Future',
    fallback: 'cause and creation remain legible without becoming destiny',
    variants: pairVariants('open-future', 'clockwork', 'brahmalok', [
      [
        cell('The forecast is kept beside an open margin: legible advice that cannot close what creation may become.', 0, 0),
        cell('The warning remains public after the work is released, preserving accountability without restoring ownership.', 0, 1),
        cell('Many revisers can challenge the forecast, and every appeal stays visible in the shared folio.', 0, 2),
      ],
      [
        cell('The broken schedule enters a margin no replacement plan is allowed to fill.', 1, 0),
        cell('Schedule and authorial claim are both released; their known harms remain recorded without becoming destiny.', 1, 1),
        cell('Many hands revise after the interruption, unable to call the break either pure freedom or final design.', 1, 2),
      ],
      [
        cell('The protected blank hour meets the unclosed page, making uncertainty an explicit part of the record.', 2, 0),
        cell('One unscheduled interval survives the released work so future use need not repeat the maker’s timing.', 2, 1),
        cell('The blank interval passes among many hands, each able to revise without owning the silence.', 2, 2),
      ],
    ]),
  },
  {
    id: 'first-water', from: 'emberlight', to: 'tidefall', name: 'First Water',
    fallback: 'the first warmth learns that tending is not possession',
    variants: pairVariants('first-water', 'emberlight', 'tidefall', [
      [
        cell('The unspent dark shelters the carried names, reserving room for lives the archive cannot yet name.', 0, 0),
        cell('A guarded ember warms the bank while memory enters the current; reserve and release answer different needs.', 0, 1),
        cell('The reserve is opened by those carrying the loss, so no keeper decides alone what their next shore may spend.', 0, 2),
      ],
      [
        cell('Inhabited warmth pays its debt by carrying the names of what the flood took, without rebuilding their cages.', 1, 0),
        cell('The spent ember warms a living current; abundance and erasure remain visible in the same water.', 1, 1),
        cell('Those warmed by the first spending receive the archive keys and decide which costs cross with them.', 1, 2),
      ],
      [
        cell('The spark passes beside the names, giving its bearers agency without asking them to forget where the gift began.', 2, 0),
        cell('The delegated spark enters changing water, and its next use cannot be certified by first keeper or archive.', 2, 1),
        cell('Spark and memory travel in many hands; each boat chooses what to kindle and what to leave unspent.', 2, 2),
      ],
    ]),
  },
]

export const GARDEN_LINK_VARIANTS: readonly GardenLinkVariant[] = GARDEN_LINK_DEFINITIONS.flatMap(({ variants }) => variants)

function unresolvedLink(definition: GardenLinkDefinition): GardenLink {
  const presentation = GARDEN_LINK_CHARACTERS.latent
  return {
    id: definition.id,
    from: definition.from,
    to: definition.to,
    name: definition.name,
    result: definition.fallback,
    character: 'latent',
    characterLabel: presentation.label,
    characterGlyph: presentation.glyph,
    sourceAnswerId: null,
    targetAnswerId: null,
  }
}

export const GARDEN_LINKS: readonly GardenLink[] = GARDEN_LINK_DEFINITIONS.map(unresolvedLink)

export function gardenLinksForAnswers(history: Readonly<RealmAnswerHistory>): readonly GardenLink[] {
  return GARDEN_LINK_DEFINITIONS.map((definition) => {
    const source = latestRealmAnswer(history, definition.from)
    const target = latestRealmAnswer(history, definition.to)
    if (!source || !target) return unresolvedLink(definition)
    const variant = definition.variants.find((candidate) => (
      candidate.sourceAnswerId === source.id && candidate.targetAnswerId === target.id
    ))
    if (!variant) return unresolvedLink(definition)
    const presentation = GARDEN_LINK_CHARACTERS[variant.character]
    return {
      id: definition.id,
      from: definition.from,
      to: definition.to,
      name: definition.name,
      result: variant.result,
      character: variant.character,
      characterLabel: presentation.label,
      characterGlyph: presentation.glyph,
      sourceAnswerId: variant.sourceAnswerId,
      targetAnswerId: variant.targetAnswerId,
    }
  })
}

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
  const relations = gardenLinksForAnswers(history)
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
    relations,
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
    ...(synthesis.complete ? synthesis.relations.map((link) => `${link.name} — ${link.result}`) : []),
    closure.finalLine,
    'The Atlas of Possible Worlds is now a permanent continuation, not an unfinished ending.',
  ]
}

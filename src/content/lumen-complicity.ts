import type { UniverseId } from './universes'
import type { GameState } from '../engine/game.svelte'

export interface LumenComplicityLine {
  readonly id: string
  readonly universeIds: readonly UniverseId[]
  readonly act: 'III' | 'VII'
  readonly text: string
  readonly when: (game: GameState) => boolean
}

const saw = (game: GameState, id: string): boolean => game.seen.includes(id)

/**
 * A small meta-arc layered over, rather than added to, each world's ten core
 * Lumen lines. Selection is local because `seen` belongs to the parked run.
 */
export const LUMEN_COMPLICITY_LINES: readonly LumenComplicityLine[] = [
  {
    id: 'act3-lumen-kept-column',
    universeIds: ['emberlight'],
    act: 'III',
    text: 'That retained column was mine. I decided archive, law, Heart; I decided the rest could be called loss. Counting was not innocence.',
    when: (game) => game.collapses >= 1 && game.echoes.includes('inventory'),
  },
  {
    id: 'act3-lumen-unwoken',
    universeIds: ['emberlight'],
    act: 'III',
    text: 'I told you one ember remained. That was true in the way an archivist can make truth narrow. I had evidence that other sleeping worlds remained. I chose not to wake them.',
    when: (game) => saw(game, 'act3-lumen-kept-column')
      && game.echoes.includes('shape-in-dark')
      && (game.owned.ember2 ?? 0) >= 1,
  },
  {
    id: 'act3-lumen-selected-witness',
    universeIds: ['emberlight'],
    act: 'III',
    text: 'I arranged the Echoes, the trials, and the order of this confession. I called it evidence. It was also a test I did not ask your consent to enter.',
    when: (game) => saw(game, 'act3-lumen-unwoken') && saw(game, 'act3-hook'),
  },
  {
    id: 'act3-lumen-answer-debt',
    universeIds: ['emberlight'],
    act: 'III',
    text: 'You answered what you are. I have not. I am the one who selected which dead could become sleeping, and which sleeping world would hear your hand.',
    when: (game) => saw(game, 'act3-lumen-selected-witness') && game.ending !== null,
  },
  {
    id: 'act7-lumen-inevitable',
    universeIds: ['vishnulok'],
    act: 'VII',
    text: 'I called preservation neutral after I had already chosen what counted as order, which losses could be corrected, and whose refuge remained outside my route.',
    when: (game) => game.ending !== null && game.supernovae >= 1,
  },
  {
    id: 'act7-lumen-storm-beacon',
    universeIds: ['vishnulok'],
    act: 'VII',
    text: 'Vishnulok continues without us. I kept the traces by which we found it because I believed preservation could be made into a system. I left other refuges unentered. Belief is not permission.',
    when: (game) => saw(game, 'act7-lumen-inevitable') && game.beacons.includes('vishnulok'),
  },
  {
    id: 'act7-lumen-curation-rest',
    universeIds: ['kailash'],
    act: 'VII',
    text: 'At the Still Point, I called my record of an ending complete because I had chosen what the record would carry through it. I kept the summit and ignored the path down.',
    when: (game) => game.ending !== null && game.supernovae >= 1,
  },
  {
    id: 'act7-lumen-seven',
    universeIds: ['kailash'],
    act: 'VII',
    text: 'Four restored worlds and three lokas. I discovered the loka traces in strata older than my archive, then chose the order in which I showed them to you and called that sequence inevitable. The Garden must include that curatorial debt without pretending I authored the places the traces revealed.',
    when: (game) => saw(game, 'act7-lumen-curation-rest') && game.beacons.includes('kailash'),
  },
]

export function lumenComplicityLinesFor(universeId: UniverseId): readonly LumenComplicityLine[] {
  return LUMEN_COMPLICITY_LINES.filter(({ universeIds }) => universeIds.includes(universeId))
}

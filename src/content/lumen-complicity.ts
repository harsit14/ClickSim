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
    text: 'I told you one ember remained. That was true in the way an archivist can make truth narrow. I had other worlds. I chose not to wake them.',
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
    universeIds: ['tempest'],
    act: 'VII',
    text: 'That path was chosen. So were you. I wrote “inevitable” over awakenings I had already selected, because weather sounded kinder than agency.',
    when: (game) => game.ending !== null && game.supernovae >= 1,
  },
  {
    id: 'act7-lumen-storm-beacon',
    universeIds: ['tempest'],
    act: 'VII',
    text: 'Tempest can now continue without us. I kept its archive because I believed release could be taught. I left other storms uncalled. Belief is not permission.',
    when: (game) => saw(game, 'act7-lumen-inevitable') && game.beacons.includes('tempest'),
  },
  {
    id: 'act7-lumen-curation-rest',
    universeIds: ['canticle'],
    act: 'VII',
    text: 'Listen to the rest. I used to call the silence between archived worlds empty. It was full of voices I had decided not to hear.',
    when: (game) => game.ending !== null && game.supernovae >= 1,
  },
  {
    id: 'act7-lumen-seven',
    universeIds: ['canticle'],
    act: 'VII',
    text: 'Seven Beacons. Seven choices I made before you woke. I did not save the worthy; I selected the questions I wanted answered. The Garden must include that debt.',
    when: (game) => saw(game, 'act7-lumen-curation-rest') && game.beacons.includes('canticle'),
  },
]

export function lumenComplicityLinesFor(universeId: UniverseId): readonly LumenComplicityLine[] {
  return LUMEN_COMPLICITY_LINES.filter(({ universeIds }) => universeIds.includes(universeId))
}

import { UNIVERSES, universeById, type UniverseId } from '../content/universes'
import type { GameState, UniverseRunState } from '../engine/state/game-state.svelte'

export interface QuietGoalProgress {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly current: number
  readonly target: number
  readonly complete: boolean
}

type QuietGoalState = Pick<GameState,
  | 'activeUniverse'
  | 'curiosities'
  | 'challengesDone'
  | 'universeRuns'
  | 'beacons'
  | 'beaconNames'
  | 'atlasCompletions'
>

function localRun(state: QuietGoalState, universeId: UniverseId): Pick<UniverseRunState, 'curiosities' | 'challengesDone'> {
  if (state.activeUniverse === universeId) {
    return { curiosities: state.curiosities, challengesDone: state.challengesDone }
  }
  return state.universeRuns[universeId] ?? { curiosities: [], challengesDone: [] }
}

function goal(
  id: string,
  name: string,
  description: string,
  current: number,
  target: number,
): QuietGoalProgress {
  const bounded = Math.max(0, Math.min(target, Math.floor(current)))
  return { id, name, description, current: bounded, target, complete: bounded >= target }
}

/** Derived completion notes only: they grant no power and gate no story. */
export function quietGoalProgress(state: QuietGoalState): readonly QuietGoalProgress[] {
  const activePack = universeById(state.activeUniverse)
  const completedCabinets = UNIVERSES.filter((universe) => {
    const run = localRun(state, universe.id as UniverseId)
    return universe.cabinet.items.every((item) => run.curiosities.includes(item.id))
  }).length
  const completedTrialLedgers = UNIVERSES.filter((universe) => (
    localRun(state, universe.id as UniverseId).challengesDone.length >= 12
  )).length
  const routedRealms = new Set(state.atlasCompletions.map((completion) => completion.universeId)).size
  const namedBeacons = UNIVERSES.filter((universe) => (
    state.beacons.includes(universe.id) && (state.beaconNames[universe.id]?.trim().length ?? 0) > 0
  )).length

  return [
    goal(
      'current-cabinet',
      `${activePack.cabinet.title} complete`,
      'Catalogue every record in the realm you are inhabiting.',
      activePack.cabinet.items.filter((item) => state.curiosities.includes(item.id)).length,
      activePack.cabinet.items.length,
    ),
    goal(
      'current-trials',
      'Complete trial ledger',
      'Endure every local Deep trial without changing the story gate.',
      state.challengesDone.length,
      12,
    ),
    goal(
      'all-cabinets',
      'Seven complete Cabinets',
      'Finish each realm’s archive as a record, not a requirement.',
      completedCabinets,
      UNIVERSES.length,
    ),
    goal(
      'all-trials',
      'Seven complete trial ledgers',
      'Carry every realm-specific trial language to completion.',
      completedTrialLedgers,
      UNIVERSES.length,
    ),
    goal(
      'atlas-every-realm',
      'Atlas of seven voices',
      'Archive at least one optional route from every realm.',
      routedRealms,
      UNIVERSES.length,
    ),
    goal(
      'named-beacons',
      'Name every Beacon',
      'Give each restored world a name in the permanent Chronicle.',
      namedBeacons,
      UNIVERSES.length,
    ),
  ]
}

import { emberlightOwnershipThreshold, type EmberlightOwnershipThreshold } from './flagship-scene'

export interface EmberlightRemnantDef {
  readonly id: string
  readonly name: string
  readonly sourceIds: readonly [string, string]
  readonly x: number
  readonly y: number
  readonly path: string
}

export interface EmberlightRemnantPlan extends EmberlightRemnantDef {
  readonly count: number
  readonly threshold: EmberlightOwnershipThreshold
  readonly reveal: number
  readonly complete: boolean
}

export const EMBERLIGHT_REMNANTS: readonly EmberlightRemnantDef[] = [
  { id: 'doorframe', name: 'The Buried Doorframe', sourceIds: ['hearth', 'kiln'], x: 12, y: 82, path: 'M20 92 L20 28 L80 28 L80 92 M35 92 L35 45 L65 45 L65 92 M58 67 L62 67' },
  { id: 'half-bridge', name: 'The Half Bridge', sourceIds: ['forge', 'beacon'], x: 31, y: 86, path: 'M5 82 L24 55 L43 72 L61 42 L78 61 L96 31 M5 82 L5 94 M24 55 L24 94 M43 72 L43 94 M61 42 L61 94' },
  { id: 'child-orrery', name: "A Child's Orrery", sourceIds: ['starseed', 'protostar'], x: 58, y: 84, path: 'M50 18 L50 92 M20 70 C30 45 70 45 84 67 M10 78 C30 58 76 58 94 76 M72 48 A8 8 0 1 0 72 49' },
  { id: 'broken-lens', name: 'The Broken Lens', sourceIds: ['sun', 'binary'], x: 72, y: 88, path: 'M12 72 C25 30 73 20 91 51 C72 40 49 47 43 66 C57 58 75 60 87 75 M43 66 L29 91' },
  { id: 'star-tablet', name: 'The Star Tablet', sourceIds: ['constellation', 'galaxy'], x: 84, y: 81, path: 'M14 90 L20 22 L82 14 L90 84 Z M30 68 L46 38 L59 60 L73 31 M46 38 L70 76' },
  { id: 'empty-rib', name: 'The Empty Rib', sourceIds: ['loom', 'ember2'], x: 94, y: 86, path: 'M18 94 C22 42 43 17 76 10 M34 94 C37 54 52 31 78 25 M51 94 C54 68 64 49 83 42' },
] as const

const REVEAL_BY_THRESHOLD: Readonly<Record<EmberlightOwnershipThreshold, number>> = {
  1: 0.22,
  10: 0.42,
  25: 0.62,
  50: 0.82,
  100: 1,
}

export function planEmberlightRemnants(owned: Readonly<Record<string, number>>): readonly EmberlightRemnantPlan[] {
  return EMBERLIGHT_REMNANTS.flatMap((remnant) => {
    const count = Math.max(...remnant.sourceIds.map((id) => owned[id] ?? 0))
    const threshold = emberlightOwnershipThreshold(count)
    return threshold === null ? [] : [{
      ...remnant,
      count,
      threshold,
      reveal: REVEAL_BY_THRESHOLD[threshold],
      complete: threshold === 100,
    }]
  })
}

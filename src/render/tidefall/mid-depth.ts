export type TidefallMigrationKind = 'shoal' | 'lantern' | 'ray' | 'driftleaf'

export interface TidefallMigration {
  id: string
  kind: TidefallMigrationKind
  form: 1 | 2 | 3 | 4 | 5
  y: number
  restingX: number
  durationSec: number
  delaySec: number
  direction: 1 | -1
}

const MIGRATION_SOURCES = [
  { id: 'wisp', kind: 'shoal', y: 43, restingX: 17, direction: 1 },
  { id: 'forge', kind: 'lantern', y: 49, restingX: 78, direction: -1 },
  { id: 'titan', kind: 'driftleaf', y: 55, restingX: 31, direction: 1 },
  { id: 'constellation', kind: 'ray', y: 59, restingX: 68, direction: -1 },
] as const

export function tidefallMigrationForm(owned: number): 0 | 1 | 2 | 3 | 4 | 5 {
  if (owned >= 100) return 5
  if (owned >= 50) return 4
  if (owned >= 25) return 3
  if (owned >= 10) return 2
  if (owned >= 1) return 1
  return 0
}

/** Keeps the authored middle band sparse and the trench below 62% empty. */
export function planTidefallMidDepth(
  owned: Readonly<Record<string, number>>,
  quality: 'low' | 'balanced' | 'high' = 'high',
): TidefallMigration[] {
  const budget = quality === 'low' ? 2 : 4
  return MIGRATION_SOURCES
    .map((source, index): TidefallMigration | null => {
      const form = tidefallMigrationForm(owned[source.id] ?? 0)
      if (form === 0) return null
      return {
        id: source.id,
        kind: source.kind,
        form,
        y: source.y,
        restingX: source.restingX,
        durationSec: 34 + index * 7,
        delaySec: -(index * 9 + 3),
        direction: source.direction,
      }
    })
    .filter((migration): migration is TidefallMigration => migration !== null)
    .slice(0, budget)
}

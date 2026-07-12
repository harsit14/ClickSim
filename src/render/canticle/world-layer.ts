import type { WorldObjectManifest } from '../../content/universes/types'

export type KailashOwnershipThreshold = 0 | 1 | 10 | 25 | 50 | 100
export type KailashFormationKind = 'snowfield' | 'river' | 'ash-grove' | 'open-pass' | 'cairn' | 'horizon'

export interface KailashFormationPlan {
  readonly id: string
  readonly kind: KailashFormationKind
  readonly sourceIds: readonly string[]
  readonly threshold: KailashOwnershipThreshold
  readonly owned: number
  readonly xPercent: number
  readonly bottomPercent: number
  readonly scale: number
  readonly basePath: string
  readonly detailPath: string
  readonly routePath: string
}

const FORMATION_SEATS = [
  {
    index: 0, kind: 'snowfield', xPercent: 11, bottomPercent: 17, scale: 0.88,
    basePath: 'M2 42L12 31L19 34L31 12L39 26L47 20L58 42Z',
    detailPath: 'M12 31L19 34L31 12L39 26M25 22L31 12L35 20',
    routePath: 'M31 20C28 27 34 30 29 39',
  },
  {
    index: 3, kind: 'river', xPercent: 27, bottomPercent: 8, scale: 1.02,
    basePath: 'M1 43L10 32L18 35L28 16L36 29L45 24L59 43Z',
    detailPath: 'M10 32L18 35L28 16L36 29L45 24',
    routePath: 'M29 19C21 25 36 29 27 34C21 38 31 40 26 45',
  },
  {
    index: 6, kind: 'ash-grove', xPercent: 39, bottomPercent: 19, scale: 0.82,
    basePath: 'M2 43L2 37L13 31L22 34L33 26L42 31L58 24L58 43Z',
    detailPath: 'M4 37L14 32L22 35L33 27L42 32L56 25',
    routePath: 'M17 39V29M13 33L17 29L21 33M39 40V31M35 35L39 31L43 35',
  },
  {
    index: 9, kind: 'open-pass', xPercent: 62, bottomPercent: 15, scale: 0.98,
    basePath: 'M1 43L17 14L25 34L31 34L42 11L59 43H39L31 37L23 37L17 43Z',
    detailPath: 'M1 43L17 14L25 34M31 34L42 11L59 43',
    routePath: 'M27 43C27 39 31 39 31 34',
  },
  {
    index: 12, kind: 'cairn', xPercent: 77, bottomPercent: 20, scale: 0.8,
    basePath: 'M4 43L12 37L19 39L26 31L34 34L42 24L51 30L58 43Z',
    detailPath: 'M20 39L25 34H35L39 39M25 34L28 28H34L35 34M28 28L31 23L34 28',
    routePath: 'M8 40C20 35 43 42 55 35',
  },
  {
    index: 15, kind: 'horizon', xPercent: 90, bottomPercent: 9, scale: 1.06,
    basePath: 'M1 43L9 34L17 37L27 24L36 33L46 21L59 43Z',
    detailPath: 'M4 36C15 29 23 34 31 28C39 22 48 27 56 20',
    routePath: 'M5 39C16 34 25 40 35 34C44 29 50 32 57 28',
  },
] as const satisfies readonly {
  index: number
  kind: KailashFormationKind
  xPercent: number
  bottomPercent: number
  scale: number
  basePath: string
  detailPath: string
  routePath: string
}[]

export function kailashOwnershipThreshold(count: number): KailashOwnershipThreshold {
  if (count >= 100) return 100
  if (count >= 50) return 50
  if (count >= 25) return 25
  if (count >= 10) return 10
  return count >= 1 ? 1 : 0
}

/**
 * Six landform seats represent the eighteen stable Kindlings in ordered bands.
 * Ownership changes each landform's structure; it never increases object count.
 */
export function planKailashFormations(
  objects: readonly WorldObjectManifest[],
  owned: Readonly<Record<string, number>>,
  quality: 'low' | 'balanced' | 'high' = 'high',
): readonly KailashFormationPlan[] {
  const generators = objects.filter(({ sourceKind }) => sourceKind === 'generator')
  const planned = FORMATION_SEATS.flatMap((seat): KailashFormationPlan[] => {
    const band = generators.slice(seat.index, seat.index + 3)
    if (band.length === 0) return []
    const count = Math.max(...band.map(({ sourceId }) => Math.max(0, Math.floor(owned[sourceId] ?? 0))))
    const threshold = kailashOwnershipThreshold(count)
    if (threshold === 0) return []
    return [{
      id: `kailash-formation-${seat.kind}`,
      kind: seat.kind,
      sourceIds: band.map(({ sourceId }) => sourceId),
      threshold,
      owned: count,
      xPercent: seat.xPercent,
      bottomPercent: seat.bottomPercent,
      scale: seat.scale,
      basePath: seat.basePath,
      detailPath: seat.detailPath,
      routePath: seat.routePath,
    }]
  })
  return quality === 'low'
    ? planned.filter(({ kind }) => kind === 'snowfield' || kind === 'river' || kind === 'open-pass' || kind === 'horizon')
    : planned
}

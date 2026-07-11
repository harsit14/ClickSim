export const EMBERLIGHT_OWNERSHIP_THRESHOLDS = [1, 10, 25, 50, 100] as const

export type EmberlightOwnershipThreshold = (typeof EMBERLIGHT_OWNERSHIP_THRESHOLDS)[number]

export interface FlagshipSeat {
  readonly x: number
  readonly y: number
  readonly scale: number
  readonly tilt: number
}

export interface ConstellationFigure {
  readonly id: string
  readonly name: string
  readonly path: string
  readonly nodes: readonly (readonly [number, number])[]
  readonly x: number
  readonly y: number
  readonly width: number
  readonly rotation: number
}

export interface EmberlightFlagshipScene {
  readonly hearthThreshold: EmberlightOwnershipThreshold | null
  readonly hearthSeats: readonly FlagshipSeat[]
  readonly mergedHearthLight: boolean
  readonly settlementGlow: boolean
  readonly terraces: boolean
  readonly sunThreshold: EmberlightOwnershipThreshold | null
  readonly sunSeats: readonly FlagshipSeat[]
  readonly eclipticVisible: boolean
  readonly eclipticLandmark: boolean
  readonly constellationFigures: readonly ConstellationFigure[]
  readonly constellationAtlas: boolean
}

const HEARTH_SEATS: readonly FlagshipSeat[] = [
  { x: 19, y: 75, scale: 0.84, tilt: -4 },
  { x: 25, y: 72, scale: 1, tilt: 2 },
  { x: 32, y: 74, scale: 0.78, tilt: -2 },
  { x: 39, y: 71, scale: 0.9, tilt: 3 },
  { x: 45, y: 75, scale: 0.7, tilt: -3 },
] as const

const SUN_SEATS: readonly FlagshipSeat[] = [
  { x: 27, y: 35, scale: 0.74, tilt: -7 },
  { x: 37, y: 29, scale: 0.92, tilt: 4 },
  { x: 49, y: 26, scale: 1.08, tilt: -3 },
  { x: 61, y: 28, scale: 0.86, tilt: 6 },
  { x: 72, y: 34, scale: 0.7, tilt: -5 },
  { x: 81, y: 42, scale: 0.58, tilt: 3 },
  { x: 18, y: 43, scale: 0.6, tilt: -2 },
  { x: 55, y: 38, scale: 0.56, tilt: 5 },
] as const

/** Twelve authored figures. They are routes with names, not a random star scatter. */
export const EMBERLIGHT_CONSTELLATIONS: readonly ConstellationFigure[] = [
  { id: 'keeper', name: 'The Keeper', path: 'M8 76 L28 26 L49 49 L67 15 L91 35 M49 49 L76 82', nodes: [[8, 76], [28, 26], [49, 49], [67, 15], [91, 35], [76, 82]], x: 27, y: 18, width: 13, rotation: -4 },
  { id: 'vessel', name: 'The Vessel', path: 'M10 34 L30 78 L71 78 L91 34 M30 78 L51 18 L71 78 M21 54 L81 54', nodes: [[10, 34], [30, 78], [71, 78], [91, 34], [51, 18], [21, 54], [81, 54]], x: 38, y: 17, width: 12, rotation: 3 },
  { id: 'moth', name: 'The Moth', path: 'M50 25 L50 77 M50 43 L18 18 L29 62 L50 51 L71 62 L82 18 L50 43', nodes: [[50, 25], [50, 77], [18, 18], [29, 62], [71, 62], [82, 18]], x: 26, y: 36, width: 12, rotation: -2 },
  { id: 'bellows', name: 'The Bellows', path: 'M12 29 L38 18 L82 35 L67 74 L31 82 L12 29 M38 18 L31 82 M82 35 L31 52', nodes: [[12, 29], [38, 18], [82, 35], [67, 74], [31, 82], [31, 52]], x: 39, y: 35, width: 12, rotation: 5 },
  { id: 'pilgrim', name: 'The Pilgrim', path: 'M18 17 L45 37 L30 64 L58 84 L82 57 M45 37 L72 24', nodes: [[18, 17], [45, 37], [30, 64], [58, 84], [82, 57], [72, 24]], x: 6, y: 51, width: 11, rotation: 2 },
  { id: 'anvil', name: 'The Anvil', path: 'M10 35 L67 27 L91 42 L65 52 L60 79 L38 79 L35 53 L10 35', nodes: [[10, 35], [67, 27], [91, 42], [65, 52], [60, 79], [38, 79], [35, 53]], x: 20, y: 50, width: 12, rotation: -5 },
  { id: 'open-hand', name: 'The Open Hand', path: 'M49 84 L39 54 L16 27 M39 54 L34 15 M43 54 L50 11 M47 56 L66 18 M50 61 L85 39', nodes: [[49, 84], [39, 54], [16, 27], [34, 15], [50, 11], [66, 18], [85, 39]], x: 65, y: 20, width: 11, rotation: 4 },
  { id: 'door', name: 'The Door', path: 'M24 85 L24 18 L76 18 L76 85 M38 85 L38 37 L63 37 L63 85 M58 61 L61 61', nodes: [[24, 85], [24, 18], [76, 18], [76, 85], [38, 85], [38, 37], [63, 37], [63, 85], [61, 61]], x: 66, y: 35, width: 10, rotation: -2 },
  { id: 'snail', name: 'The Snail', path: 'M15 72 C22 36 66 31 70 57 C73 79 38 82 35 61 C33 47 54 43 57 57 M70 67 L90 72', nodes: [[15, 72], [70, 57], [35, 61], [57, 57], [90, 72]], x: 65, y: 49, width: 11, rotation: -3 },
  { id: 'lantern', name: 'The Lantern', path: 'M34 20 L67 20 L79 77 L21 77 L34 20 M38 77 L38 90 M63 77 L63 90 M42 34 L59 34 L67 65 L34 65 Z', nodes: [[34, 20], [67, 20], [79, 77], [21, 77], [38, 90], [63, 90], [42, 34], [59, 34], [67, 65], [34, 65]], x: 32, y: 29, width: 10, rotation: 2 },
  { id: 'bridge', name: 'The Bridge', path: 'M8 73 L24 38 L40 65 L59 32 L76 64 L93 25 M24 38 L59 32 M40 65 L76 64', nodes: [[8, 73], [24, 38], [40, 65], [59, 32], [76, 64], [93, 25]], x: 44, y: 27, width: 11, rotation: -4 },
  { id: 'answer', name: 'The Answer', path: 'M13 51 L34 25 L51 47 L70 20 L88 45 L65 78 L43 68 L13 51 M51 47 L43 68', nodes: [[13, 51], [34, 25], [51, 47], [70, 20], [88, 45], [65, 78], [43, 68]], x: 54, y: 31, width: 10, rotation: 4 },
] as const

export function emberlightOwnershipThreshold(count: number): EmberlightOwnershipThreshold | null {
  if (!Number.isFinite(count) || count < 1) return null
  let threshold: EmberlightOwnershipThreshold = 1
  for (const candidate of EMBERLIGHT_OWNERSHIP_THRESHOLDS) {
    if (count >= candidate) threshold = candidate
  }
  return threshold
}

function structuralSeatCount(threshold: EmberlightOwnershipThreshold | null): number {
  if (threshold === null) return 0
  if (threshold === 1) return 1
  if (threshold === 10) return 3
  if (threshold === 25) return 5
  if (threshold === 50) return 5
  return 1
}

function constellationFigureCount(count: number): number {
  if (!Number.isFinite(count) || count < 1) return 0
  return Math.min(EMBERLIGHT_CONSTELLATIONS.length, Math.max(1, Math.floor(count)))
}

export function buildEmberlightFlagshipScene(
  owned: Readonly<Record<string, number>>,
): EmberlightFlagshipScene {
  const hearthThreshold = emberlightOwnershipThreshold(owned.hearth ?? 0)
  const sunThreshold = emberlightOwnershipThreshold(owned.sun ?? 0)
  return {
    hearthThreshold,
    hearthSeats: HEARTH_SEATS.slice(0, structuralSeatCount(hearthThreshold)),
    mergedHearthLight: (owned.hearth ?? 0) >= 25,
    settlementGlow: (owned.hearth ?? 0) >= 50,
    terraces: (owned.hearth ?? 0) >= 100,
    sunThreshold,
    sunSeats: SUN_SEATS.slice(0, structuralSeatCount(sunThreshold)),
    eclipticVisible: (owned.sun ?? 0) >= 50,
    eclipticLandmark: (owned.sun ?? 0) >= 100,
    constellationFigures: EMBERLIGHT_CONSTELLATIONS.slice(0, constellationFigureCount(owned.constellation ?? 0)),
    constellationAtlas: (owned.constellation ?? 0) >= 25,
  }
}

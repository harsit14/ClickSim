import type { SetPieceEntrance, SetPiecePathLayer, SetPieceStage } from '../emberlight/set-piece-registry'

export interface TidefallSetPiece {
  readonly id: string
  readonly name: string
  readonly stages: readonly [SetPieceStage, SetPieceStage]
}

const layer = (id: string, role: SetPiecePathLayer['role'], d: string, fillRule?: SetPiecePathLayer['fillRule']): SetPiecePathLayer => ({
  id, role, d, ...(fillRule ? { fillRule } : {}),
})

const stage = (
  objectId: string,
  sourceId: string,
  name: string,
  entrance: SetPieceEntrance,
  ...paths: readonly [SetPiecePathLayer, ...SetPiecePathLayer[]]
): SetPieceStage => ({ objectId, sourceId, name, entrance, paths })

/** Nine paired pelagic silhouettes using the same lifecycle skeleton as Emberlight. */
export const TIDEFALL_SET_PIECES: readonly TidefallSetPiece[] = [
  { id: 'first-current', name: 'The First Current', stages: [
    stage('tide-kindling-droplet', 'spark', 'Droplet', 'kindle',
      layer('drop-body', 'body', 'M50 5 C63 28 76 43 76 61 C76 80 65 94 50 94 C34 94 23 80 23 61 C23 43 38 27 50 5 Z'),
      layer('drop-glint', 'light', 'M43 31 C36 44 34 55 38 65 C40 70 44 72 47 68 C42 57 43 45 50 34 Z')),
    stage('tide-kindling-ripple', 'wisp', 'Ripple', 'draw',
      layer('ripple-rings', 'line', 'M9 54 C20 29 80 29 91 54 C77 78 24 78 9 54 M24 54 C34 41 66 41 77 54 C66 67 35 67 24 54 M41 54 C46 49 55 49 60 54 C55 60 46 60 41 54')),
  ]},
  { id: 'memory-littoral', name: 'The Memory Littoral', stages: [
    stage('tide-kindling-tidepool', 'hearth', 'Tidepool', 'build',
      layer('pool-basin', 'body', 'M7 56 C18 83 78 91 94 54 C75 67 29 67 7 56 Z'),
      layer('pool-water', 'light', 'M16 57 C33 45 69 45 87 56 C67 64 35 64 16 57 Z')),
    stage('tide-kindling-current', 'kiln', 'Current', 'draw',
      layer('current-ribbon', 'body', 'M4 66 C20 32 38 30 50 50 C62 70 81 69 97 31 C89 80 64 92 47 67 C30 42 17 48 4 66 Z'),
      layer('current-direction', 'line', 'M22 52 L34 57 L25 64 M67 65 L79 57 L69 51')),
  ]},
  { id: 'reef-causeway', name: 'The Reef Causeway', stages: [
    stage('tide-kindling-reef-light', 'forge', 'Reef Light', 'build',
      layer('reef-branches', 'body', 'M44 94 L44 55 L24 36 L31 27 L45 42 L51 8 L61 11 L58 45 L82 27 L89 38 L59 58 L59 94 Z'),
      layer('reef-polyps', 'light', 'M17 31 C17 22 27 17 34 24 C40 31 34 40 25 40 C20 40 17 36 17 31 Z M77 25 C77 16 87 11 94 18 C100 25 94 34 85 34 C80 34 77 30 77 25 Z')),
    stage('tide-kindling-moonwake', 'beacon', 'Moonwake', 'draw',
      layer('wake-road', 'line', 'M7 78 C26 71 35 52 47 43 C61 32 75 33 94 16 M17 88 C38 78 43 59 55 51 C68 42 82 42 98 29'),
      layer('wake-crescent', 'light', 'M16 75 C29 63 35 49 32 36 C43 49 40 68 25 79 Z')),
  ]},
  { id: 'nacre-cathedral', name: 'The Nacre Cathedral', stages: [
    stage('tide-kindling-kelp-cathedral', 'titan', 'Kelp Cathedral', 'build',
      layer('kelp-vaults', 'body', 'M10 95 C17 62 23 29 37 9 C31 42 34 68 46 94 Z M43 94 C49 58 56 28 68 8 C61 43 66 70 80 94 Z M71 94 C79 65 83 43 94 27 C90 57 91 78 96 94 Z')),
    stage('tide-kindling-pearl-seed', 'starseed', 'Pearl Seed', 'condense',
      layer('pearl-shell', 'body', 'M50 7 C78 7 94 29 89 55 C85 82 67 96 45 92 C19 88 6 63 14 38 C20 19 33 7 50 7 Z'),
      layer('pearl-layer', 'line', 'M27 72 C17 51 28 26 51 23 C73 20 88 43 79 64 C72 82 49 88 34 76 M39 65 C31 52 39 37 53 37 C68 37 76 53 68 65 C61 76 46 76 39 65'),
      layer('pearl-core', 'light', 'M48 49 C55 44 64 50 62 58 C60 66 50 68 45 62 C41 57 43 52 48 49 Z')),
  ]},
  { id: 'keeper-meridian', name: 'The Keeper Meridian', stages: [
    stage('tide-kindling-bioluminance', 'protostar', 'Bioluminance', 'kindle',
      layer('lantern-colony', 'body', 'M15 65 C10 47 23 34 39 40 C43 20 64 14 74 29 C93 29 99 49 88 64 C72 85 28 87 15 65 Z'),
      layer('lantern-organs', 'light', 'M28 57 C35 47 45 51 45 61 C45 70 33 73 27 65 Z M58 42 C65 32 76 36 77 46 C78 55 66 59 59 51 Z')),
    stage('tide-kindling-drowned-beacon', 'sun', 'Drowned Beacon', 'build',
      layer('beacon-tower', 'body', 'M37 94 L41 35 L59 35 L64 94 Z M30 35 L38 17 L62 17 L71 35 Z'),
      layer('beacon-lens', 'light', 'M43 26 L50 20 L58 26 L50 33 Z'),
      layer('beacon-beam', 'line', 'M59 26 L97 10 M60 31 L98 27')),
  ]},
  { id: 'pelagic-census', name: 'The Pelagic Census', stages: [
    stage('tide-kindling-twin-tides', 'binary', 'Twin Tides', 'condense',
      layer('twin-crescents', 'body', 'M38 12 C17 24 10 48 21 68 C32 88 57 91 75 77 C52 83 32 69 32 49 C32 31 46 18 62 14 C53 9 45 8 38 12 Z M66 32 C79 41 83 56 77 69 C72 81 60 86 49 83 C64 76 69 63 64 52 C60 43 53 38 45 36 C53 29 60 28 66 32 Z'),
      layer('shared-midpoint', 'light', 'M47 47 L54 54 L47 62 L40 54 Z')),
    stage('tide-kindling-shoal-constellation', 'constellation', 'Shoal Constellation', 'draw',
      layer('shoal-route', 'line', 'M8 67 L27 32 L48 52 L67 18 L91 38 M48 52 L73 77'),
      layer('shoal-fish', 'body', 'M3 67 L10 62 L18 67 L10 72 Z M21 32 L28 27 L36 32 L28 37 Z M42 52 L49 47 L57 52 L49 57 Z M61 18 L68 13 L76 18 L68 23 Z M85 38 L92 33 L100 38 L92 43 Z M67 77 L74 72 L82 77 L74 82 Z')),
  ]},
  { id: 'living-trench', name: 'The Living Trench', stages: [
    stage('tide-kindling-abyssal-garden', 'nebula', 'Abyssal Garden', 'build',
      layer('vent-bed', 'shadow', 'M4 94 L15 72 L31 79 L48 61 L64 76 L82 65 L96 94 Z'),
      layer('vent-flowers', 'body', 'M28 72 L28 35 M28 44 C12 37 10 23 24 17 C29 25 32 33 28 44 Z M28 44 C44 37 46 23 33 17 C28 26 25 34 28 44 Z M66 75 L66 42 M66 51 C51 43 50 31 62 25 C67 32 69 41 66 51 Z M66 51 C81 44 82 31 71 25 C66 33 63 42 66 51 Z'),
      layer('vent-glow', 'light', 'M23 18 C28 9 36 15 34 23 C32 31 21 30 20 23 Z M61 25 C66 16 74 21 73 29 C71 37 60 36 58 30 Z')),
    stage('tide-kindling-living-sea', 'galaxy', 'The Living Sea', 'condense',
      layer('sea-layers', 'body', 'M3 68 C18 52 34 50 49 60 C64 70 78 69 97 49 L97 83 C80 94 62 91 47 81 C32 71 19 75 3 88 Z'),
      layer('sea-memory', 'line', 'M8 61 C27 41 43 42 57 53 C72 65 84 61 96 45 M14 78 C29 66 42 68 55 77 C68 87 81 82 94 72')),
  ]},
  { id: 'world-circulation', name: 'The World Circulation', stages: [
    stage('tide-kindling-ocean-of-moons', 'supercluster', 'Ocean of Moons', 'condense',
      layer('moon-lenses', 'line', 'M8 71 C19 38 52 20 88 31 C63 31 43 43 37 59 C54 48 76 49 94 63 M29 82 C39 61 60 54 80 62'),
      layer('moon-pressure', 'light', 'M47 48 C58 44 67 52 65 62 C62 74 47 78 39 68 C31 58 36 51 47 48 Z')),
    stage('tide-kindling-world-current', 'web', 'World Current', 'draw',
      layer('world-route', 'line', 'M4 79 C16 43 38 28 52 47 C67 66 76 37 97 17 M12 91 C31 64 45 69 58 81 C71 92 87 77 97 59'),
      layer('tributaries', 'line', 'M21 42 L31 60 M48 43 L40 18 M72 48 L85 67')),
  ]},
  { id: 'answering-depth', name: 'The Answering Depth', stages: [
    stage('tide-kindling-deep-trench', 'loom', 'The Deep Trench', 'build',
      layer('trench-mouth', 'shadow', 'M3 47 C22 33 39 39 50 55 C62 38 80 31 98 47 L87 94 L14 94 Z'),
      layer('depth-contours', 'line', 'M14 50 C29 43 42 49 50 64 C59 49 72 42 87 50 M22 62 C35 57 44 64 50 77 C57 64 66 57 79 62 M32 75 C41 72 47 79 50 88 C54 79 60 72 69 75')),
    stage('tide-kindling-second-wave', 'ember2', 'The Second Wave', 'condense',
      layer('second-wave', 'body', 'M3 83 C18 78 22 58 34 48 C47 37 57 48 61 61 C68 42 84 34 98 42 C83 47 78 61 82 82 Z'),
      layer('wave-foam', 'light', 'M8 79 C22 73 24 55 36 47 C48 39 58 51 61 63 C68 48 81 40 93 42 C81 49 77 61 79 76 C63 69 48 71 37 81 Z')),
  ]},
] as const

const STAGES = new Map(TIDEFALL_SET_PIECES.flatMap((piece) => piece.stages.map((item) => [item.objectId, item] as const)))
const STAGES_BY_SOURCE = new Map(TIDEFALL_SET_PIECES.flatMap((piece) => piece.stages.map((item) => [item.sourceId, item] as const)))

export function tidefallSetPieceStage(objectId: string): SetPieceStage | null {
  return STAGES.get(objectId) ?? null
}

export function tidefallSetPieceStageForSource(sourceId: string): SetPieceStage | null {
  return STAGES_BY_SOURCE.get(sourceId) ?? null
}

export type TidefallOwnershipThreshold = 1 | 10 | 25 | 50 | 100

export function tidefallOwnershipThreshold(count: number): TidefallOwnershipThreshold | null {
  if (!Number.isFinite(count) || count < 1) return null
  if (count >= 100) return 100
  if (count >= 50) return 50
  if (count >= 25) return 25
  if (count >= 10) return 10
  return 1
}

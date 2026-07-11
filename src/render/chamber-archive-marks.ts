import type { UniverseId } from '../content/universes/types'

export type ChamberArchiveUniverse = Extract<UniverseId, 'verdance' | 'prismata' | 'tempest' | 'canticle'>

export interface ChamberArchiveMark {
  readonly id: string
  readonly universeId: ChamberArchiveUniverse
  readonly family: string
  readonly label: string
  readonly framePath: string
  readonly diagramPath: string
  readonly accentPath: string
}

const FRAMES: Readonly<Record<ChamberArchiveUniverse, string>> = {
  verdance: 'M20 4C29 4 35 10 35 19C35 29 29 36 20 36C11 36 5 29 5 20C5 11 11 4 20 4Z',
  prismata: 'M20 4C29 8 35 14 35 22C35 30 29 35 20 36C11 35 5 30 5 22C5 14 11 8 20 4ZM20 7V34',
  tempest: 'M6 8C13 4 27 4 34 8V30C27 36 13 36 6 30ZM9 12H31M9 28H31',
  canticle: 'M20 4A16 16 0 1 1 20 36A16 16 0 1 1 20 4ZM20 8V32M8 20H32',
}

function marks(
  universeId: ChamberArchiveUniverse,
  families: readonly string[],
  entries: readonly (readonly [label: string, diagramPath: string, accentPath: string])[],
): readonly ChamberArchiveMark[] {
  return entries.map(([label, diagramPath, accentPath], index) => ({
    id: `${universeId === 'verdance' ? 'u3' : universeId === 'prismata' ? 'u5' : universeId === 'tempest' ? 'u6' : 'u7'}-archive-${String(index + 1).padStart(2, '0')}`,
    universeId,
    family: families[Math.floor(index / 4)],
    label,
    framePath: FRAMES[universeId],
    diagramPath,
    accentPath,
  }))
}

export const VERDANCE_ARCHIVE_MARKS = marks('verdance', ['survival', 'communication', 'inheritance'], [
  ['folded resurrection fern', 'M20 31V9M20 13C15 9 11 10 9 13C13 15 17 15 20 17M20 18C25 14 29 15 31 18C27 20 24 20 20 22M20 23C15 20 12 21 10 24C14 26 17 26 20 27', 'M16 8C18 6 22 6 24 8'],
  ['moon-facing orchid', 'M20 26V33M20 26C12 26 10 20 14 17C14 10 20 9 20 16C20 9 26 10 26 17C30 20 28 26 20 26ZM20 20A2 2 0 1 1 20 24A2 2 0 1 1 20 20', 'M29 8A5 5 0 0 0 29 17'],
  ['walking mangrove', 'M10 19C13 12 27 12 30 19M12 19H28M16 19L11 31M19 19L17 31M22 19L25 31M25 19L31 29', 'M9 31H14M23 31H28'],
  ['glass lichen colony', 'M10 26L14 17L20 20L23 11L30 15L28 25L21 30ZM14 17L10 12M23 11L20 7M30 15L34 12', 'M11 26L8 30M28 25L32 29'],
  ['memory amber', 'M20 7C25 14 30 19 29 25C28 32 12 32 11 25C10 19 15 14 20 7ZM16 24C18 20 22 20 24 24M20 17V27', 'M14 14L17 17M26 14L23 17'],
  ['choir fungus', 'M9 19C10 12 20 12 21 19ZM14 19V28M20 23C21 17 29 17 31 23ZM25 23V31M12 30C18 26 23 32 29 28', 'M8 32C15 28 24 35 33 29'],
  ['compass vine', 'M9 31C12 25 8 19 14 16C20 13 17 8 24 8C31 8 33 15 28 19C23 23 18 18 21 15M14 16L10 11', 'M26 26L32 20M32 20L31 25M32 20L27 21'],
  ['lightning oak', 'M20 10V31M20 13L13 17M20 17L27 13M20 22L11 27M20 24L29 29M17 31H23', 'M22 8L18 15H22L18 23'],
  ['star pollen', 'M20 9L22 16L29 13L25 20L32 23L24 24L26 32L20 27L14 32L16 24L8 23L15 20L11 13L18 16Z', 'M8 10H10M31 9H33M8 31H10M31 31H33'],
  ['ocean seed', 'M20 7C28 12 31 20 27 27C24 33 16 33 13 27C9 20 12 12 20 7ZM14 22C17 18 22 26 27 21', 'M15 17C18 14 22 20 25 16'],
  ['root fossil', 'M20 8V19C20 25 15 27 11 31M20 20C26 22 28 27 30 31M20 24L20 32M20 13C15 11 12 13 11 17M20 16C25 13 29 14 30 18', 'M8 8C14 5 26 5 32 8'],
  ['garden gate cutting', 'M10 32V17C10 8 30 8 30 17V32M14 32V18C14 13 26 13 26 18V32M20 31V20', 'M20 21C15 18 13 22 16 25M20 24C25 20 28 24 24 27'],
])

export const PRISMATA_ARCHIVE_MARKS = marks('prismata', ['first-thought', 'given-form', 'open-future'], [
  ['unwritten palm leaf', 'M9 12H31V29H9ZM12 16H28M12 20H28M12 24H24', 'M29 9V32'],
  ['seed without species', 'M20 10C27 15 28 23 20 30C12 23 13 15 20 10ZM20 13V31', 'M12 30C15 27 17 29 20 31C23 28 26 28 29 31'],
  ['compass of four questions', 'M20 8V32M8 20H32M12 12L28 28M28 12L12 28', 'M20 17A3 3 0 1 1 20 23A3 3 0 1 1 20 17'],
  ['river-ink vessel', 'M13 15H27L29 29H11ZM13 20C18 17 22 24 28 20M9 32C15 28 25 35 32 29', 'M16 11H24'],
  ['clay alphabet', 'M9 10H31V30H9ZM13 14H18V19H13ZM22 14H27V19H22ZM13 23H18V27H13ZM22 23H27V27H22Z', 'M11 32H29'],
  ['lotus shadow map', 'M20 20C12 20 9 14 13 11C17 9 20 14 20 20C20 12 26 9 29 13C31 17 26 20 20 20C28 20 31 26 27 29C23 31 20 26 20 20C20 28 14 31 11 27C9 23 14 20 20 20Z', 'M20 20L33 33'],
  ['breath between verses', 'M9 14H31M9 26H31M12 20C16 17 24 23 28 20', 'M7 20H10M30 20H33'],
  ['library of blank margins', 'M9 10H19V30H9ZM21 10H31V30H21ZM12 14H17M23 14H28M12 18H16M23 18H27', 'M19 8V32M21 8V32'],
  ['broken completion seal', 'M11 10H29V24M29 28V30H11V10M15 14H25V26H15Z', 'M28 24L32 28M32 24L28 28'],
  ['measure without edge', 'M7 15H33M7 25H33M11 12V18M16 12V18M21 12V18M27 12V18M13 22V28M19 22V28M25 22V28M31 22V28', 'M5 20H35'],
  ['loom of possible bodies', 'M10 9V31M15 9V31M25 9V31M30 9V31M8 14H32M8 20H32M8 26H32M15 14L25 26M25 14L15 26', 'M8 33H32'],
  ['the unclosed folio', 'M9 11H19V30H9ZM21 11H31V30H21ZM12 15H17M23 15H28M12 19H17M23 19H28', 'M17 25H23V31'],
])

export const TEMPEST_ARCHIVE_MARKS = marks('tempest', ['refuge', 'correction', 'return'], [
  ['saltless pearl', 'M20 11A9 9 0 1 1 20 29A9 9 0 1 1 20 11M12 20C16 16 24 24 28 19', 'M10 31C16 27 25 34 31 29'],
  ['returning tide map', 'M8 17C14 10 24 11 31 17M31 17L27 13M31 17L27 20M32 25C25 31 15 30 9 24M9 24L13 21M9 24L13 28', 'M11 20H29'],
  ['refuge threshold', 'M9 31V19C9 10 31 10 31 19V31M14 31V20C14 15 26 15 26 20V31', 'M7 33H33'],
  ['unbroken reed boat', 'M8 21C13 31 27 31 32 21M11 20L14 12M29 20L26 12M14 12H26M16 16H24', 'M10 32C16 29 24 35 30 31'],
  ['twin current chart', 'M7 15C13 9 20 20 26 14C29 11 31 12 33 11M33 26C27 32 20 21 14 27C11 30 9 28 7 30', 'M10 20H30'],
  ['night watch lamp', 'M14 26H26M16 24V15C16 10 24 10 24 15V24M18 29H22M20 8V11', 'M10 32C16 28 24 35 30 30'],
  ['seasonal ledger', 'M10 9H30V31H10ZM14 13H26M14 18H24M14 23H27M14 28H22', 'M20 7V33'],
  ['coral repair stone', 'M10 11H30V30H10ZM20 11L17 18L22 22L18 30M17 18L12 21M22 22L29 18', 'M18 30C21 26 25 31 28 26'],
  ['horizon knot', 'M9 20C9 11 20 11 20 20C20 29 31 29 31 20C31 11 20 11 20 20C20 29 9 29 9 20Z', 'M7 33H33'],
  ['four-shore agreement', 'M10 10H30V30H10ZM10 20H30M20 10V30', 'M7 20C12 15 28 25 33 20'],
  ['still ocean sounding', 'M20 7V33M15 12H25M16 18H24M17 24H23M18 30H22', 'M8 33C14 29 26 35 32 31'],
  ['the map that comes home', 'M8 20C8 9 20 9 20 20C20 31 32 31 32 20C32 9 20 9 20 20C20 31 8 31 8 20', 'M10 34H30'],
])

export const CANTICLE_ARCHIVE_MARKS = marks('canticle', ['voice', 'memory', 'relationship'], [
  ['first drum skin', 'M20 9A11 11 0 1 1 20 31A11 11 0 1 1 20 9M16 22C13 17 17 13 20 17C23 12 27 16 24 22C22 27 18 27 16 22Z', 'M9 20H13M27 20H31'],
  ['bell without metal', 'M12 27H28M15 25C17 22 17 16 17 14C17 10 23 10 23 14C23 16 23 22 25 25ZM18 29A2 2 0 1 0 22 29', 'M11 13L7 10M29 13L33 10'],
  ['fossilized chord', 'M9 10H31V30H9ZM12 18C15 12 18 26 21 18C24 11 27 25 29 18M12 23C16 19 20 27 24 22C26 20 28 21 29 23', 'M13 14H27'],
  ['silent tuning fork', 'M14 9V17C14 25 26 25 26 17V9M20 24V32M16 32H24', 'M10 14H13M27 14H30M10 24H14M26 24H30'],
  ['whale-song cylinder', 'M12 10H28V30H12ZM12 14C16 10 24 18 28 14M12 20C16 16 24 24 28 20M12 26C16 22 24 30 28 26', 'M9 10V30M31 10V30'],
  ['seismic hymn', 'M8 27L13 23L17 26L21 18L25 22L32 13M8 31H32', 'M10 16C15 12 20 20 25 14C28 11 30 13 32 12'],
  ['glass harmonica moon', 'M26 8C17 10 12 17 14 25C16 32 24 34 31 28C23 28 19 23 19 18C19 13 22 10 26 8ZM17 13A10 10 0 0 0 26 31', 'M14 18H20M15 23H21'],
  ['echo of lumen', 'M9 15C13 10 20 10 24 15C27 19 25 24 20 26L16 31V26C11 25 8 20 9 15ZM15 18C18 15 21 17 23 20', 'M27 14C32 17 32 23 27 26'],
  ['broken conductor baton', 'M10 29L18 20M22 18L31 9M15 22L18 25M22 13L25 16', 'M8 19H13M27 20H33'],
  ['chladni star map', 'M9 9H31V31H9ZM12 20C15 11 20 17 20 20C20 23 25 29 28 20C25 11 20 17 20 20C20 23 15 29 12 20Z', 'M20 9V14M20 26V31M9 20H14M26 20H31'],
  ['rest between universes', 'M10 12H14V28H10M30 12H26V28H30M15 20H25', 'M17 16H23M17 24H23'],
  ['instrument for second voice', 'M9 20A8 10 0 0 1 20 11V29A8 10 0 0 1 9 20ZM31 20A8 10 0 0 0 20 11V29A8 10 0 0 0 31 20Z', 'M17 20H23'],
])

export const CHAMBER_ARCHIVE_MARKS: readonly ChamberArchiveMark[] = [
  ...VERDANCE_ARCHIVE_MARKS,
  ...PRISMATA_ARCHIVE_MARKS,
  ...TEMPEST_ARCHIVE_MARKS,
  ...CANTICLE_ARCHIVE_MARKS,
]

export const CHAMBER_ARCHIVE_MARK_BY_ID = new Map(CHAMBER_ARCHIVE_MARKS.map((mark) => [mark.id, mark]))

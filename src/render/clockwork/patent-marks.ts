export type ClockworkPatentFamily = 'transmission' | 'prediction' | 'exception'

export interface ClockworkPatentMark {
  readonly id: string
  readonly family: ClockworkPatentFamily
  readonly label: string
  readonly diagramPath: string
  readonly accentPath: string
}

/**
 * Tiny authored patent drawings shared by the Ledger cards and world landmarks.
 * They deliberately use mechanisms, drafting marks, and broken plans instead of
 * the celestial core-and-orbit grammar used by Emberlight's Astral Cabinet.
 */
export const CLOCKWORK_PATENT_MARKS: readonly ClockworkPatentMark[] = [
  {
    id: 'clockwork-patent-one-tooth-prototype', family: 'transmission', label: 'one tooth on a drive shaft',
    diagramPath: 'M8 25H32M14 29H28M18 25V14H24V25M16 14H26',
    accentPath: 'M9 20H15M12 17L15 20L12 23',
  },
  {
    id: 'clockwork-patent-self-oiling-bearing', family: 'transmission', label: 'sealed bearing and oil drop',
    diagramPath: 'M20 10A10 10 0 1 1 20 30A10 10 0 1 1 20 10M20 15A5 5 0 1 1 20 25A5 5 0 1 1 20 15',
    accentPath: 'M30 8C27 12 27 14 30 16C33 14 33 12 30 8Z',
  },
  {
    id: 'clockwork-patent-impossible-escapement', family: 'transmission', label: 'escapement with a missing input',
    diagramPath: 'M10 11L17 18L13 27M30 11L23 18L27 27M17 18H23M20 18V31M16 31H24',
    accentPath: 'M16 9H24M18 6L16 9L18 12M22 6L24 9L22 12',
  },
  {
    id: 'clockwork-patent-moonless-orrery', family: 'transmission', label: 'orrery turning around an empty axle',
    diagramPath: 'M20 11A9 9 0 1 1 11 20M8 20A12 6 0 1 0 32 20M20 17V23M17 20H23',
    accentPath: 'M28 13A3 3 0 1 1 28 19A3 3 0 1 1 28 13M19 19H21V21H19Z',
  },
  {
    id: 'clockwork-patent-memory-cam', family: 'prediction', label: 'eccentric memory cam and follower',
    diagramPath: 'M12 24C11 16 15 10 22 11C30 12 32 20 27 25C23 29 16 29 12 24ZM21 17A3 3 0 1 1 21 23A3 3 0 1 1 21 17',
    accentPath: 'M30 8V14L26 18M27 8H33',
  },
  {
    id: 'clockwork-patent-compassion-governor', family: 'prediction', label: 'governor arms held below overload',
    diagramPath: 'M20 9V31M14 31H26M20 14L12 22M20 14L28 22M9 22A3 3 0 1 1 15 22A3 3 0 1 1 9 22M25 22A3 3 0 1 1 31 22A3 3 0 1 1 25 22',
    accentPath: 'M11 28H29M14 26V30M26 26V30',
  },
  {
    id: 'clockwork-patent-punched-prophecy', family: 'prediction', label: 'punched forecast tape',
    diagramPath: 'M8 11H32V29H8ZM13 15A1.5 1.5 0 1 1 13 18A1.5 1.5 0 1 1 13 15M20 21A1.5 1.5 0 1 1 20 24A1.5 1.5 0 1 1 20 21M27 15A1.5 1.5 0 1 1 27 18A1.5 1.5 0 1 1 27 15',
    accentPath: 'M8 20H15M24 20H32',
  },
  {
    id: 'clockwork-patent-perpetual-warranty', family: 'prediction', label: 'perpetual warranty seal',
    diagramPath: 'M10 20C13 12 18 12 20 20C22 28 27 28 30 20C27 12 22 12 20 20C18 28 13 28 10 20Z',
    accentPath: 'M16 29L14 34L20 31L26 34L24 29M20 7V11',
  },
  {
    id: 'clockwork-patent-broken-hourglass', family: 'exception', label: 'hourglass with one uncounted grain',
    diagramPath: 'M12 9H28M12 31H28M14 10C14 16 18 17 20 20C22 23 26 24 26 30M26 10C26 16 22 17 20 20C18 23 16 24 15 27',
    accentPath: 'M29 27L32 30M29 30L32 27M13 28L11 31',
  },
  {
    id: 'clockwork-patent-clockmakers-hand', family: 'exception', label: 'articulated clockmaker hand',
    diagramPath: 'M12 29V19C12 17 15 17 15 19V12C15 10 18 10 18 12V18V9C18 7 21 7 21 9V18V11C21 9 24 9 24 11V20V14C24 12 27 12 27 14V24C27 29 23 32 18 32C15 32 13 31 12 29Z',
    accentPath: 'M8 18L12 22M8 22L12 18',
  },
  {
    id: 'clockwork-patent-city-shift-bell', family: 'exception', label: 'civic bell outside the machine schedule',
    diagramPath: 'M11 28H29M14 26C16 23 16 18 16 16C16 11 24 11 24 16C24 18 24 23 26 26ZM18 30A2 2 0 1 0 22 30',
    accentPath: 'M10 13L6 10M30 13L34 10M20 8V4',
  },
  {
    id: 'clockwork-patent-blueprint-tomorrow', family: 'exception', label: 'blueprint with one route left blank',
    diagramPath: 'M9 11H31V30H9ZM13 25V16H20V21H27M13 16H16M20 21V25',
    accentPath: 'M27 21V16M24 16H30M25 13L27 16L29 13',
  },
] as const

export const CLOCKWORK_PATENT_MARK_BY_ID = new Map(
  CLOCKWORK_PATENT_MARKS.map((mark) => [mark.id, mark]),
)

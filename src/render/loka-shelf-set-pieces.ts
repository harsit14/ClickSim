export const LOKA_SHELF_MOMENT_DURATION_MS = 12_000

export interface LokaShelfSetPieceDef {
  readonly id: string
  readonly universeId: 'brahmalok' | 'vishnulok' | 'kailash'
  readonly shelfIndex: 1 | 2 | 3
  readonly title: string
  readonly moment: string
  readonly staticEquivalent: string
  readonly shape: string
  readonly pattern: string
  readonly xPercent: number
  readonly yPercent: number
}

export const LOKA_SHELF_SET_PIECES: readonly LokaShelfSetPieceDef[] = [
  { id: 'brahmalok-shelf-1', universeId: 'brahmalok', shelfIndex: 1, title: 'Seed Court Illuminates', moment: 'A low light travels through the seed beds and stops before the open center.', staticEquivalent: 'Seed Court held in a labeled illuminated outline.', shape: 'stepped garden beds', pattern: 'dot and rising contour', xPercent: 24, yPercent: 64 },
  { id: 'brahmalok-shelf-2', universeId: 'brahmalok', shelfIndex: 2, title: 'Measure Court Illuminates', moment: 'Ruled colonnades become legible one span at a time.', staticEquivalent: 'Measure Court held with four bold ruled spans.', shape: 'open colonnade', pattern: 'parallel ruled lines', xPercent: 37, yPercent: 78 },
  { id: 'brahmalok-shelf-3', universeId: 'brahmalok', shelfIndex: 3, title: 'The Margin Remains Open', moment: 'Name and Form courts answer across the page while the central square stays blank.', staticEquivalent: 'Four labeled courts lit around one empty square.', shape: 'four courts around open square', pattern: 'four distinct material patterns', xPercent: 73, yPercent: 66 },
  { id: 'vishnulok-shelf-1', universeId: 'vishnulok', shelfIndex: 1, title: 'Refuge Harbor Lights', moment: 'Harbor lamps light outward from the open refuge.', staticEquivalent: 'Three numbered harbor lamps held in a bright open arch.', shape: 'open harbor arch', pattern: 'three numbered lamp marks', xPercent: 22, yPercent: 61 },
  { id: 'vishnulok-shelf-2', universeId: 'vishnulok', shelfIndex: 2, title: 'Correction Route Draws', moment: 'One gold route draws shelter by shelter and returns to its first mark.', staticEquivalent: 'Complete static numbered return path.', shape: 'returning route line', pattern: 'numbered shelter sequence', xPercent: 76, yPercent: 63 },
  { id: 'vishnulok-shelf-3', universeId: 'vishnulok', shelfIndex: 3, title: 'Return Horizon Settles', moment: 'The route reaches the horizon and comes home beneath it.', staticEquivalent: 'Still horizon with one complete line returning below.', shape: 'open horizon circuit', pattern: 'paired departure and return', xPercent: 72, yPercent: 43 },
  { id: 'kailash-shelf-1', universeId: 'kailash', shelfIndex: 1, title: 'Change Shelter Opens', moment: 'A small roof opens below the ash and snow bands.', staticEquivalent: 'Open labeled shelter beneath four fixed slope bands.', shape: 'low open roof', pattern: 'snow, ash, soil, shoot', xPercent: 67, yPercent: 70 },
  { id: 'kailash-shelf-2', universeId: 'kailash', shelfIndex: 2, title: 'Refuge Lamp Faces Down', moment: 'A valley lamp turns toward the path down and holds.', staticEquivalent: 'One steady lamp labeled REFUGE beside the descending path.', shape: 'shielded lamp', pattern: 'one lit mark below the summit', xPercent: 35, yPercent: 75 },
  { id: 'kailash-shelf-3', universeId: 'kailash', shelfIndex: 3, title: 'Return Way-Shelter Opens', moment: 'The lowest way-shelter opens and leaves the summit untouched.', staticEquivalent: 'Lowest shelter held open under an empty summit.', shape: 'way-shelter threshold', pattern: 'open doorway and downward line', xPercent: 61, yPercent: 80 },
]

export interface LokaShelfSetPiecePlan extends LokaShelfSetPieceDef {
  readonly completed: boolean
  readonly active: boolean
  readonly reducedMotion: boolean
  readonly progressFraction: number
  readonly progressKey: string
}

export function planLokaShelfSetPieces(
  universeId: string,
  archiveIds: readonly string[],
  progress: Readonly<Record<string, number>>,
  nowMs: number,
  reducedMotion: boolean,
): readonly LokaShelfSetPiecePlan[] {
  const prefix = universeId === 'brahmalok' ? 'brahmalok' : universeId === 'vishnulok' ? 'vishnulok' : universeId === 'kailash' ? 'kailash' : null
  if (!prefix) return []
  const held = new Set(archiveIds)
  return LOKA_SHELF_SET_PIECES.filter((entry) => entry.universeId === universeId).map((entry) => {
    const archivePrefix = `${prefix}-archive-`
    const start = (entry.shelfIndex - 1) * 4 + 1
    const completed = Array.from({ length: 4 }, (_, index) => `${archivePrefix}${String(start + index).padStart(2, '0')}`).every((id) => held.has(id))
    const progressKey = `${entry.id}-at`
    const startedAt = progress[progressKey] ?? 0
    const elapsed = startedAt > 1 && Number.isFinite(nowMs) ? Math.max(0, nowMs - startedAt) : LOKA_SHELF_MOMENT_DURATION_MS
    return {
      ...entry,
      completed,
      active: completed && startedAt > 1 && elapsed < LOKA_SHELF_MOMENT_DURATION_MS,
      reducedMotion,
      progressFraction: Math.min(1, elapsed / LOKA_SHELF_MOMENT_DURATION_MS),
      progressKey,
    }
  })
}

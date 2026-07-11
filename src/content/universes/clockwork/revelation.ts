import { DIVINE_REALMS, type DivineRealmId } from '../../divine-realms'

export type ClockworkRevelationBeatId =
  | 'schedule-fault'
  | 'city-holds'
  | 'blank-date'
  | 'witness-arrives'
  | 'forecasts-reclassified'
  | 'three-loka-seals'
  | 'passage-remains'

export interface ClockworkRevelationBeat {
  readonly id: ClockworkRevelationBeatId
  readonly startsAtMs: number
  readonly durationMs: number
  readonly prose: string
  readonly visualIntent: string
  readonly reducedMotionIntent: string
  readonly audioIntent: string
  readonly accessibleDescription: string
  readonly revealsRealms: readonly DivineRealmId[]
}

export const CLOCKWORK_REVELATION_TRIGGER = {
  sceneId: 'u4-scene-unscheduled-interval',
  requiredBeaconUniverseId: 'clockwork',
  requiredGeneratorId: 'u4-great-regulator',
  requiredEchoId: 'u4-echo-vulnerable-again',
  seenId: 'u4-scene-unscheduled-interval',
  replayable: true,
  skippableAfterFirstView: true,
} as const

export interface ClockworkRevelationPlan {
  readonly sceneId: typeof CLOCKWORK_REVELATION_TRIGGER.sceneId
  readonly startedAtMs: number
  readonly endsAtMs: number
  readonly presentation: 'full' | 'reduced'
  readonly audio: 'authored' | 'muted-equivalent'
  readonly beats: readonly ClockworkRevelationBeat[]
}

export const CLOCKWORK_REVELATION_BEATS: readonly ClockworkRevelationBeat[] = [
  {
    id: 'schedule-fault', startsAtMs: 0, durationMs: 5_000,
    prose: 'UNSCHEDULED INTERVAL — NO CAUSAL SOURCE',
    visualIntent: 'A fifth line embosses itself beneath the four printed Maintenance Signals without shifting their declared schedule.',
    reducedMotionIntent: 'The fifth line appears as one static high-contrast docket entry.',
    audioIntent: 'The clock pulse completes, then leaves one measured interval unstruck.',
    accessibleDescription: 'The Clockwork schedule gains a fifth entry labeled Unscheduled Interval with no causal source.',
    revealsRealms: [],
  },
  {
    id: 'city-holds', startsAtMs: 5_000, durationMs: 6_000,
    prose: 'Every mechanism stops. Time does not.',
    visualIntent: 'Power, cadence, and efficiency linkages hold their exact positions while the run clock continues counting.',
    reducedMotionIntent: 'A static inspection plate contrasts stopped mechanisms with a continuing text timer.',
    audioIntent: 'Machine stems withdraw in route order; the semantic timer remains captioned.',
    accessibleDescription: 'All Clockwork mechanisms are stopped, but the displayed interval continues to advance.',
    revealsRealms: [],
  },
  {
    id: 'blank-date', startsAtMs: 11_000, durationMs: 6_000,
    prose: 'The blank date was not uncertainty. It was an opening.',
    visualIntent: 'The protected square from the Last Calendar widens into an unnumbered aperture.',
    reducedMotionIntent: 'The blank square changes once into a larger outlined aperture.',
    audioIntent: 'Paper, pallet, and one low breath; no impact or revelation sting.',
    accessibleDescription: 'The protected blank date in the Last Calendar becomes an opening outside the numbered schedule.',
    revealsRealms: [],
  },
  {
    id: 'witness-arrives', startsAtMs: 17_000, durationMs: 9_000,
    prose: 'A witness stands where prediction has no address.',
    visualIntent: 'An original, non-iconographic presence is defined by the absence of Clockwork registration marks around it.',
    reducedMotionIntent: 'The witness is shown as one stable silhouette with the label WITNESS OUTSIDE THE CALENDAR.',
    audioIntent: 'No divine leitmotif is invented; the witness receives a neutral voiced caption and room tone.',
    accessibleDescription: 'An unidentified witness appears beyond the machine. The figure is original game fiction and is not presented as a deity.',
    revealsRealms: [],
  },
  {
    id: 'forecasts-reclassified', startsAtMs: 26_000, durationMs: 9_000,
    prose: 'Divided light. Directed force. Ordered sound. Your machine found shadows and called them worlds.',
    visualIntent: 'Prismata, Tempest, and Canticle forecast plates fold into three archived Clockwork chamber diagrams.',
    reducedMotionIntent: 'Three labeled forecast plates change status from DESTINATION to INCOMPLETE MODEL.',
    audioIntent: 'Glass, thunder, and waveform memories play once as quiet archival references, not realm themes.',
    accessibleDescription: 'The three former projected destinations are reclassified as incomplete Clockwork forecast models.',
    revealsRealms: [],
  },
  {
    id: 'three-loka-seals', startsAtMs: 35_000, durationMs: 12_000,
    prose: 'Beyond the calendar: bringing forth, sustaining, releasing.',
    visualIntent: 'Lotus, endless circuit, and mountain-still-point seals appear separately with equal visual weight and no deity portrait.',
    reducedMotionIntent: 'Three static labeled seals appear in route order with distinct shape and text.',
    audioIntent: 'Three restrained material signatures are separated by silence; none quotes or imitates sacred music.',
    accessibleDescription: 'Three routes are revealed in order: Brahmalok, Vishnulok, and Kailash.',
    revealsRealms: DIVINE_REALMS.map(({ id }) => id),
  },
  {
    id: 'passage-remains', startsAtMs: 47_000, durationMs: 7_000,
    prose: 'Clockwork was the last world you could rebuild. The next places were never waiting to be owned.',
    visualIntent: 'The three seals remain beyond the stopped city while the Escapement Heart resumes one local, ordinary tick.',
    reducedMotionIntent: 'The three route labels remain fixed; one text tick confirms Clockwork continues behind them.',
    audioIntent: 'One quiet escapement release returns local time without resolving the three new signatures.',
    accessibleDescription: 'Clockwork resumes as the final restored universe. The three lokas remain available as places to approach, not own.',
    revealsRealms: DIVINE_REALMS.map(({ id }) => id),
  },
] as const

export const CLOCKWORK_REVELATION_DURATION_MS = Math.max(
  ...CLOCKWORK_REVELATION_BEATS.map(({ startsAtMs, durationMs }) => startsAtMs + durationMs),
)

export function clockworkRevelationBeatAt(elapsedMs: number): ClockworkRevelationBeat {
  if (!Number.isFinite(elapsedMs) || elapsedMs < 0) {
    throw new RangeError('Clockwork revelation elapsed time must be finite and nonnegative.')
  }
  const clamped = Math.min(elapsedMs, CLOCKWORK_REVELATION_DURATION_MS)
  return [...CLOCKWORK_REVELATION_BEATS]
    .reverse()
    .find(({ startsAtMs }) => clamped >= startsAtMs) ?? CLOCKWORK_REVELATION_BEATS[0]
}

export function clockworkRevelationAvailable(state: {
  readonly beacons: readonly string[]
  readonly owned: Readonly<Record<string, number>>
  readonly echoes: readonly string[]
}): boolean {
  return state.beacons.includes(CLOCKWORK_REVELATION_TRIGGER.requiredBeaconUniverseId)
    && (state.owned[CLOCKWORK_REVELATION_TRIGGER.requiredGeneratorId] ?? 0) >= 1
    && state.echoes.includes(CLOCKWORK_REVELATION_TRIGGER.requiredEchoId)
}

export function planClockworkRevelation(
  startedAtMs: number,
  preferences: { readonly reducedMotion: boolean; readonly muted: boolean },
): ClockworkRevelationPlan {
  if (!Number.isFinite(startedAtMs) || startedAtMs < 0) {
    throw new RangeError('Clockwork revelation start must be finite and nonnegative.')
  }
  return {
    sceneId: CLOCKWORK_REVELATION_TRIGGER.sceneId,
    startedAtMs,
    endsAtMs: startedAtMs + CLOCKWORK_REVELATION_DURATION_MS,
    presentation: preferences.reducedMotion ? 'reduced' : 'full',
    audio: preferences.muted ? 'muted-equivalent' : 'authored',
    beats: CLOCKWORK_REVELATION_BEATS,
  }
}

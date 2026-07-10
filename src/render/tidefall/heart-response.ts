export interface TidefallHeartResponsePhase {
  readonly kind: 'pressure-compression' | 'nacre-ring' | 'current-rebound'
  readonly startsAtMs: number
  readonly endsAtMs: number
  readonly intensity: number
  readonly materialResponse: string
  readonly shapeCue: string
}

export interface TidefallHeartResponsePlan {
  readonly startsAtMs: number
  readonly endsAtMs: number
  readonly audioCue: 'tide-click-pressure' | 'tide-critical-crest'
  readonly phases: readonly TidefallHeartResponsePhase[]
  readonly caption: string | null
}

export interface TidefallHeartResponseInput {
  readonly startsAtMs: number
  readonly semanticIntensity: number
  readonly critical: boolean
  readonly reducedMotion: boolean
}

export function planTidefallHeartResponse(
  input: TidefallHeartResponseInput,
): TidefallHeartResponsePlan {
  if (!Number.isFinite(input.startsAtMs) || input.startsAtMs < 0) {
    throw new RangeError('Tideheart response start must be finite and nonnegative.')
  }
  if (!Number.isFinite(input.semanticIntensity) || input.semanticIntensity < 0 || input.semanticIntensity > 1) {
    throw new RangeError('Tideheart semantic intensity must be between zero and one.')
  }
  const durations = input.reducedMotion ? [40, 90, 110] : [70, 110, 150]
  const definitions = [
    {
      kind: 'pressure-compression',
      materialResponse: input.reducedMotion
        ? 'Tideheart outline thickens locally without scale travel.'
        : 'Nacre surface compresses toward the contact point.',
      shapeCue: 'inward basin contour',
    },
    {
      kind: 'nacre-ring',
      materialResponse: input.reducedMotion
        ? 'A stationary pressure ring gains contrast.'
        : 'One pearl-bright pressure ring releases from the surface.',
      shapeCue: 'single expanding ring',
    },
    {
      kind: 'current-rebound',
      materialResponse: input.reducedMotion
        ? 'Nearby current marks brighten in place.'
        : 'The nearest authored current bends toward the Tideheart and settles.',
      shapeCue: 'outward current fork',
    },
  ] as const
  let cursor = input.startsAtMs
  const phases: TidefallHeartResponsePhase[] = definitions.map((definition, index) => {
    const phase: TidefallHeartResponsePhase = {
      ...definition,
      startsAtMs: cursor,
      endsAtMs: cursor + durations[index],
      intensity: Math.min(1, input.semanticIntensity * (index === 1 && input.critical ? 1.25 : 1)),
    }
    cursor = phase.endsAtMs
    return phase
  })
  return {
    startsAtMs: input.startsAtMs,
    endsAtMs: cursor,
    audioCue: input.critical ? 'tide-critical-crest' : 'tide-click-pressure',
    phases,
    caption: input.critical ? 'Critical crest' : null,
  }
}

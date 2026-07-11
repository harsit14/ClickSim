export type MotionPreference = 'system' | 'reduced'
export type VisualQuality = 'auto' | 'high' | 'balanced' | 'low'
export type RenderQuality = Exclude<VisualQuality, 'auto'>
export type BeatVisual = 'subtle' | 'strong' | 'off'
export type TextScale = 'normal' | 'large'

export interface RenderEnvironment {
  width: number
  devicePixelRatio: number
  hardwareConcurrency: number
}

export interface RenderProfile {
  id: RenderQuality
  fps: 30 | 60
  dprCap: number
  maxParticles: number
  maxGlimmersPerTier: number
  moteScale: number
}

export const RENDER_PROFILES: Record<RenderQuality, RenderProfile> = {
  high: {
    id: 'high',
    fps: 60,
    dprCap: 2,
    maxParticles: 600,
    maxGlimmersPerTier: 36,
    moteScale: 1,
  },
  balanced: {
    id: 'balanced',
    fps: 60,
    dprCap: 1.5,
    maxParticles: 360,
    maxGlimmersPerTier: 24,
    moteScale: 0.68,
  },
  low: {
    id: 'low',
    fps: 30,
    dprCap: 1,
    maxParticles: 160,
    maxGlimmersPerTier: 12,
    moteScale: 0.36,
  },
}

export function resolveVisualQuality(
  preference: VisualQuality,
  environment: RenderEnvironment,
): RenderQuality {
  if (preference !== 'auto') return preference
  if (environment.hardwareConcurrency <= 4) return 'low'
  if (
    environment.hardwareConcurrency <= 6 ||
    environment.devicePixelRatio > 2.25 ||
    environment.width <= 1100
  ) return 'balanced'
  return 'high'
}

const QUALITY_ORDER: readonly RenderQuality[] = ['low', 'balanced', 'high']

/** Keeps DOM scenery on the same or a cheaper tier than the adaptive canvas. */
export function resolveEffectiveVisualQuality(
  preference: VisualQuality,
  environment: RenderEnvironment,
  runtimeQuality?: RenderQuality,
): RenderQuality {
  const base = resolveVisualQuality(preference, environment)
  if (preference !== 'auto' || runtimeQuality === undefined) return base
  return QUALITY_ORDER.indexOf(runtimeQuality) < QUALITY_ORDER.indexOf(base) ? runtimeQuality : base
}

export function renderProfile(
  preference: VisualQuality,
  environment: RenderEnvironment,
): RenderProfile {
  return RENDER_PROFILES[resolveVisualQuality(preference, environment)]
}

export function motionReduced(preference: MotionPreference, systemReduced: boolean): boolean {
  return preference === 'reduced' || systemReduced
}

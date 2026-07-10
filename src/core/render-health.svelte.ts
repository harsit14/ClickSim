import type { RenderQuality } from './preferences'

export interface RenderHealth {
  fps: number
  frameTimeMs: number
  profile: RenderQuality
  automatic: boolean
  degraded: boolean
  lastSampleAt: number
}

export const renderHealth = $state<RenderHealth>({
  fps: 0,
  frameTimeMs: 0,
  profile: 'high',
  automatic: true,
  degraded: false,
  lastSampleAt: 0,
})

export function reportRenderHealth(sample: Omit<RenderHealth, 'lastSampleAt'>) {
  Object.assign(renderHealth, sample, { lastSampleAt: Date.now() })
}

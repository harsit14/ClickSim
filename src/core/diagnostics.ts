import { GAME_VERSION } from '../content/credits'
import { universeById } from '../content/universes'
import { vesselPartIdsFor } from '../content/vessel'
import { game, passiveRatePerSec } from '../engine/game.svelte'
import { CURRENT_SAVE_VERSION } from './save-data'
import { renderHealth } from './render-health.svelte'

export function createDiagnosticReport(now = Date.now()) {
  const pack = universeById(game.activeUniverse)
  return {
    game: 'EMBER',
    gameVersion: GAME_VERSION,
    saveVersion: CURRENT_SAVE_VERSION,
    generatedAt: new Date(now).toISOString(),
    environment: {
      viewport: typeof window === 'undefined' ? null : `${window.innerWidth}x${window.innerHeight}`,
      devicePixelRatio: typeof window === 'undefined' ? null : window.devicePixelRatio,
      hardwareConcurrency: typeof navigator === 'undefined' ? null : navigator.hardwareConcurrency,
      reducedMotionSystem: typeof window === 'undefined' ? null : window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    },
    rendering: {
      profile: renderHealth.profile,
      fps: Number(renderHealth.fps.toFixed(1)),
      frameTimeMs: Number(renderHealth.frameTimeMs.toFixed(1)),
      automatic: renderHealth.automatic,
      automaticallyDegraded: renderHealth.degraded,
    },
    settings: {
      motion: game.motionPreference,
      visualQuality: game.visualQuality,
      visualBeat: game.beatVisual,
      textScale: game.textScale,
      highContrast: game.highContrast,
      sfxVolume: game.sfxVolume,
      musicVolume: game.musicVolume,
    },
    progression: {
      universe: pack.id,
      playtimeSeconds: Math.floor(game.playtime),
      totalEarnedHere: game.totalEarned,
      passiveRate: passiveRatePerSec(now),
      generatorsOwned: Object.values(game.owned).reduce((sum, count) => sum + count, 0),
      upgrades: game.upgrades.length,
      curiosities: game.curiosities.length,
      achievements: game.achievements.length,
      supernovae: game.supernovae,
      deepCollapses: game.collapses,
      trials: game.challengesDone.length,
      vesselParts: vesselPartIdsFor(game).length,
      completedLocalVessels: Object.values(game.vesselPartsByUniverse).filter((parts) => parts.length >= 5).length,
      beacons: game.beacons.length,
    },
  }
}

export function diagnosticReportText(now = Date.now()): string {
  return JSON.stringify(createDiagnosticReport(now), null, 2)
}

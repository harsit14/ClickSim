import { game, ratePerSec } from '../engine/game.svelte'
import { universeById, universeV2ById } from '../content/universes'
import { currentBeatIndex } from '../audio/music'
import {
  motionReduced,
  RENDER_PROFILES,
  resolveVisualQuality,
  type RenderProfile,
  type RenderQuality,
  type VisualQuality,
} from '../core/preferences'
import { reportRenderHealth } from '../core/render-health.svelte'
import {
  circleIntersectsHudClearance,
  rectIntersectsHudClearance,
} from './hud-clearance'
import {
  HEART_GROWTH_RADIUS_CAP,
  HEART_VERTICAL_POSITION,
  heartBaseRadius,
  pointInsideHeartTarget,
  heartTargetCenter,
} from './heart-target'
import {
  ONE_AMOUNT,
  addAmounts,
  amountFromNumber,
  amountLog10,
  amountToBoundedNumber,
  gteAmount,
  isZeroAmount,
} from '../core/numeric/amount'
import { particleRecipe, type ParticleRecipeKind } from './particle-recipes'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  size: number
  hue: number
  light: number
  gravity?: number
  gravityAfterLife?: number
  gravityAfter?: number
  tail?: number
  additive?: boolean
  bounce?: boolean
}

interface FloatText {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  text: string
}

interface QuasarTap {
  x: number
  y: number
  born: number
  crit: boolean
}

interface Glimmer {
  x: number // 0..1 of width
  y: number // 0..1 of height
  size: number
  hue: number
  phase: number
}

const GROUND_COLORS = {
  emberlight: '#221A24',
  tidefall: '#0A2432',
  verdance: '#1C2415',
  clockwork: '#262019',
  prismata: '#191627',
  tempest: '#1C2633',
  canticle: '#241826',
} as const

const PARALLAX_BY_TIER = {
  ground: 1,
  nearSky: 0.6,
  deepSky: 0.35,
  horizon: 0.15,
} as const

const MAX_POINTER_DRIFT_PX = 6

const GROUND_ANCHOR_BY_TIER: Readonly<Record<number, readonly [number, number]>> = {
  1: [0.1, 0.765],
  2: [0.9, 0.77],
  3: [0.22, 0.735],
  4: [0.78, 0.745],
  5: [0.33, 0.7],
  6: [0.67, 0.7],
}

function mulberry32(seed: number) {
  return function () {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const QUALITY_ORDER: RenderQuality[] = ['low', 'balanced', 'high']

export class World {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private bloomCanvas = document.createElement('canvas')
  private bloomCtx = this.bloomCanvas.getContext('2d')!
  private particles: Particle[] = []
  private floats: FloatText[] = []
  private quasarTaps: QuasarTap[] = []
  private glimmers = new Map<string, Glimmer[]>()
  private pulse = 0
  private driftAcc = 0
  private lastBeat = -1
  private rings: number[] = [] // birth timestamps (ms)
  private collapseStart = 0
  private collapseDurationMs = 2_800
  private supernovaAfterglowStart = 0
  private reducedMotionQuery = window.matchMedia?.('(prefers-reduced-motion: reduce)')
  private profileId = ''
  private selectedQuality: VisualQuality = game.visualQuality
  private runtimeQuality: RenderQuality | null = null
  private sampleStartedAt = 0
  private sampledFrames = 0
  private slowSamples = 0
  private healthySamples = 0
  private raf = 0
  private width = 0
  private height = 0
  private dpr = 1
  private pointerDriftX = 0
  private pointerDriftY = 0
  private targetPointerDriftX = 0
  private targetPointerDriftY = 0
  private clickAxisX = 0
  private clickAxisY = -1
  private idleMoteAcc = 0

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')!
    this.resize()
    if (import.meta.env.DEV && new URLSearchParams(window.location.search).get('scenario') === 'ember-postnova') {
      this.supernovaAfterglowStart = performance.now()
    }
  }

  resize() {
    this.width = window.innerWidth
    this.height = window.innerHeight
    const profile = this.currentRenderProfile()
    this.profileId = profile.id
    this.dpr = Math.min(window.devicePixelRatio || 1, profile.dprCap)
    this.canvas.width = this.width * this.dpr
    this.canvas.height = this.height * this.dpr
    this.canvas.style.width = this.width + 'px'
    this.canvas.style.height = this.height + 'px'
    const bloomScale = profile.id === 'high' ? 0.34 : profile.id === 'balanced' ? 0.25 : 0.18
    this.bloomCanvas.width = Math.max(1, Math.ceil(this.width * bloomScale))
    this.bloomCanvas.height = Math.max(1, Math.ceil(this.height * bloomScale))
  }

  get center() {
    return heartTargetCenter({ width: this.width, height: this.height })
  }

  private currentRenderProfile(): RenderProfile {
    if (this.selectedQuality !== game.visualQuality) {
      this.selectedQuality = game.visualQuality
      this.runtimeQuality = null
      this.slowSamples = 0
      this.healthySamples = 0
    }
    const base = this.baseRenderQuality()
    if (game.visualQuality !== 'auto') return RENDER_PROFILES[base]
    if (!this.runtimeQuality) this.runtimeQuality = base
    const resolved = QUALITY_ORDER.indexOf(this.runtimeQuality) < QUALITY_ORDER.indexOf(base)
      ? this.runtimeQuality
      : base
    return RENDER_PROFILES[resolved]
  }

  private baseRenderQuality(): RenderQuality {
    return resolveVisualQuality(game.visualQuality, {
      width: window.innerWidth,
      devicePixelRatio: window.devicePixelRatio || 1,
      hardwareConcurrency: navigator.hardwareConcurrency || 8,
    })
  }

  private samplePerformance(now: number, profile: RenderProfile) {
    if (document.visibilityState !== 'visible') {
      this.sampleStartedAt = now
      this.sampledFrames = 0
      return
    }
    if (this.sampleStartedAt === 0) this.sampleStartedAt = now
    this.sampledFrames += 1
    const elapsed = now - this.sampleStartedAt
    if (elapsed < 2_000) return

    const fps = (this.sampledFrames * 1000) / elapsed
    if (game.visualQuality === 'auto') {
      if (fps < profile.fps * 0.72) {
        this.slowSamples += 1
        this.healthySamples = 0
      } else if (fps >= profile.fps * 0.9) {
        this.healthySamples += 1
        this.slowSamples = 0
      } else {
        this.slowSamples = 0
        this.healthySamples = 0
      }

      const currentIndex = QUALITY_ORDER.indexOf(profile.id)
      const baseIndex = QUALITY_ORDER.indexOf(this.baseRenderQuality())
      if (this.slowSamples >= 2 && currentIndex > 0) {
        this.runtimeQuality = QUALITY_ORDER[currentIndex - 1]
        this.slowSamples = 0
      } else if (this.healthySamples >= 10 && currentIndex < baseIndex) {
        this.runtimeQuality = QUALITY_ORDER[currentIndex + 1]
        this.healthySamples = 0
      }
    }

    const current = this.currentRenderProfile()
    reportRenderHealth({
      fps,
      frameTimeMs: fps > 0 ? 1000 / fps : 0,
      profile: current.id,
      automatic: game.visualQuality === 'auto',
      degraded: game.visualQuality === 'auto' && QUALITY_ORDER.indexOf(current.id) < QUALITY_ORDER.indexOf(this.baseRenderQuality()),
    })
    this.sampleStartedAt = now
    this.sampledFrames = 0
  }

  private motionScale(): number {
    return motionReduced(game.motionPreference, this.reducedMotionQuery?.matches ?? false) ? 0.25 : 1
  }

  /** Current visual radius of the ember core; grows with everything ever earned. */
  emberRadius(now: number): number {
    const growth = Math.pow(amountLog10(addAmounts(ONE_AMOUNT, game.totalEarned)), 1.2) * 6
    // Start large enough to read as the primary action, then preserve a bounded
    // progression swell without letting late-game Hearts consume the stage.
    const baseRadius = heartBaseRadius(this.width, this.height)
    const base = baseRadius + Math.min(growth, baseRadius * 0.4, HEART_GROWTH_RADIUS_CAP)
    const motion = this.motionScale()
    const breath = 1 + 0.028 * Math.sin((now / 4_000) * Math.PI * 2) * motion
    const swell = 1 + this.collapseProgress(now) * 1.4
    return base * breath * swell
  }

  isOnEmber(x: number, y: number, now: number): boolean {
    return pointInsideHeartTarget(
      { x, y },
      this.center,
      this.emberRadius(now),
    )
  }

  clickPulse(x = this.center.x, y = this.center.y - 1) {
    const dx = x - this.center.x
    const dy = y - this.center.y
    const length = Math.hypot(dx, dy)
    this.clickAxisX = length > 0.01 ? dx / length : 0
    this.clickAxisY = length > 0.01 ? dy / length : -1
    this.pulse = 1
  }

  setPointerPosition(x: number, y: number) {
    this.targetPointerDriftX = ((x / Math.max(1, this.width)) * 2 - 1) * MAX_POINTER_DRIFT_PX
    this.targetPointerDriftY = ((y / Math.max(1, this.height)) * 2 - 1) * MAX_POINTER_DRIFT_PX
  }

  quasarTap(text: string, crit = false, now = performance.now()) {
    const c = this.center
    const r = this.emberRadius(now)
    const angle = now / 1450
    const x = c.x + Math.cos(angle) * r * 0.95
    const y = c.y + Math.sin(angle * 1.12) * r * 0.55
    this.quasarTaps.push({ x, y, born: now, crit })
    if (this.quasarTaps.length > 10) this.quasarTaps.shift()
    this.pulse = Math.max(this.pulse, crit ? 0.55 : 0.28)
    this.addFloat(text, x, y - 8)

    const count = Math.max(2, Math.round((crit ? 8 : 5) * this.motionScale()))
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2
      const speed = 22 + Math.random() * 70
      this.addParticle({
        x,
        y,
        vx: Math.cos(a) * speed,
        vy: Math.sin(a) * speed - 18,
        life: 0,
        maxLife: 0.45 + Math.random() * 0.45,
        size: 0.7 + Math.random() * 1.3,
        hue: crit ? 42 + Math.random() * 18 : 188 + Math.random() * 24,
        light: crit ? 70 + Math.random() * 20 : 64 + Math.random() * 18,
      })
    }
  }

  /** Supernova cutscene: everything falls into the ember. */
  beginCollapse(delayMs = 0, durationMs = 2_800) {
    this.collapseStart = performance.now() + Math.max(0, delayMs)
    this.collapseDurationMs = Math.max(1, durationMs)
  }

  endCollapse() {
    this.collapseStart = 0
    if (game.activeUniverse === 'emberlight' && game.supernovae > 0) {
      this.supernovaAfterglowStart = performance.now()
    }
    this.particles = []
    this.glimmers.clear()
    this.rings = []
    this.quasarTaps = []
  }

  /** A Crossing must not carry short-lived canvas artifacts into the next world. */
  resetForUniverse() {
    this.collapseStart = 0
    this.collapseDurationMs = 2_800
    this.supernovaAfterglowStart = 0
    this.particles = []
    this.floats = []
    this.quasarTaps = []
    this.glimmers.clear()
    this.rings = []
    this.pulse = 0
    this.driftAcc = 0
    this.lastBeat = -1
    this.pointerDriftX = 0
    this.pointerDriftY = 0
    this.targetPointerDriftX = 0
    this.targetPointerDriftY = 0
    this.clickAxisX = 0
    this.clickAxisY = -1
    this.idleMoteAcc = 0
  }

  private collapseProgress(now: number): number {
    if (this.collapseStart === 0 || now < this.collapseStart) return 0
    return Math.min(1, (now - this.collapseStart) / this.collapseDurationMs)
  }

  /** The ember wears its answer: gold for the warden, red for the hunger,
   *  silver-blue for the one who stayed. */
  private palette() {
    if (game.activeUniverse === 'tidefall') {
      return { c0: '235, 255, 252', c1: '158, 244, 232', c2: '67, 190, 199', c3: '36, 91, 139', halo: '76, 220, 215', mid: '54, 145, 185' }
    }
    if (game.activeUniverse === 'verdance') {
      return { c0: '246, 255, 216', c1: '191, 235, 145', c2: '91, 184, 112', c3: '35, 102, 61', halo: '117, 201, 137', mid: '76, 154, 96' }
    }
    if (game.activeUniverse === 'clockwork') {
      return { c0: '255, 244, 210', c1: '239, 199, 116', c2: '194, 135, 62', c3: '105, 72, 42', halo: '216, 168, 78', mid: '118, 143, 158' }
    }
    if (game.activeUniverse === 'prismata') {
      return { c0: '255, 252, 255', c1: '215, 198, 255', c2: '156, 116, 239', c3: '66, 45, 126', halo: '166, 140, 255', mid: '96, 197, 230' }
    }
    if (game.activeUniverse === 'tempest') {
      return { c0: '235, 252, 255', c1: '151, 221, 246', c2: '71, 155, 213', c3: '35, 73, 126', halo: '112, 201, 238', mid: '103, 121, 222' }
    }
    if (game.activeUniverse === 'canticle') {
      return { c0: '255, 245, 251', c1: '230, 189, 218', c2: '185, 118, 170', c3: '85, 49, 96', halo: '216, 155, 199', mid: '120, 161, 198' }
    }
    switch (game.ending) {
      case 'warden':
        return { c0: '255, 252, 240', c1: '255, 238, 185', c2: '255, 205, 110', c3: '255, 175, 80', halo: '255, 215, 130', mid: '255, 190, 100' }
      case 'hunger':
        return { c0: '255, 236, 224', c1: '255, 160, 110', c2: '242, 92, 48', c3: '190, 55, 28', halo: '255, 115, 65', mid: '225, 85, 45' }
      case 'companion':
        return { c0: '244, 247, 255', c1: '205, 214, 255', c2: '155, 165, 250', c3: '115, 125, 235', halo: '180, 190, 255', mid: '150, 160, 245' }
      default:
        return { c0: '255, 245, 220', c1: '255, 205, 120', c2: '255, 145, 60', c3: '255, 110, 40', halo: '255, 176, 84', mid: '255, 140, 60' }
    }
  }

  burst(x: number, y: number, feedback: { readonly onBeat?: boolean; readonly crit?: boolean; readonly comboStreak?: number } = {}) {
    this.emitParticleRecipe(feedback.onBeat ? 'on-beat' : 'click', x, y, feedback.comboStreak ?? 0)
    if (feedback.crit) this.emitParticleRecipe('critical', x, y)
    if (feedback.onBeat) this.rings.push(performance.now())
  }

  emitParticleRecipe(kind: ParticleRecipeKind, x = this.center.x, y = this.center.y, comboStreak = 0) {
    const accent = universeById(game.activeUniverse).palette.accentHue
    const recipe = particleRecipe(kind)
    const [minimum, maximum] = recipe.count
    const rawCount = minimum + Math.floor(Math.random() * (maximum - minimum + 1))
    const count = Math.max(1, Math.round(rawCount * this.motionScale()))
    for (let i = 0; i < count; i++) {
      let angle = -Math.PI / 2 + (Math.random() - 0.5) * (70 * Math.PI / 180)
      let speed = 150 + Math.random() * 110
      let startX = x
      let startY = y
      let gravity = recipe.gravity
      let bounce = false

      if (kind === 'critical') {
        angle = i < 3 ? -Math.PI / 2 + (i * Math.PI * 2) / 3 : Math.PI * (0.35 + Math.random() * 0.3)
        speed = i < 3 ? 180 : 130
        bounce = i === 3
      } else if (kind === 'achievement') {
        angle = Math.atan2(this.height * 0.16 - y, this.width * 0.18 - x)
        speed = Math.hypot(this.width * 0.18 - x, this.height * 0.16 - y) / 0.7
      } else if (kind === 'omen') {
        angle = Math.random() * Math.PI * 2
        speed = 70 + Math.random() * 150
        gravity = recipe.gravity
        bounce = true
      } else if (kind === 'purchase') {
        angle = Math.atan2(y - startY, x - startX)
        speed = 0
      } else if (kind === 'on-beat' && comboStreak >= 8) {
        const braidIndex = i - (count - 1) / 2
        angle = -Math.PI / 2 + braidIndex * 0.09
        speed = 190 + Math.abs(braidIndex) * 7
      }

      const lifeMs = recipe.lifeMs[0] + Math.random() * (recipe.lifeMs[1] - recipe.lifeMs[0])
      this.addParticle({
        x: startX,
        y: startY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0,
        maxLife: lifeMs / 1_000,
        size: kind === 'critical' && i < 3 ? 1.25 : 0.8 + Math.random() * 1.4,
        hue: kind === 'omen' ? accent - 24 + Math.random() * 48 : accent - 12 + Math.random() * 24,
        light: 64 + Math.random() * 30,
        gravity,
        gravityAfterLife: recipe.gravityAfterMs === undefined ? undefined : recipe.gravityAfterMs / 1_000,
        gravityAfter: recipe.gravityAfter,
        tail: recipe.tailLength,
        additive: recipe.blend === 'additive',
        bounce,
      })
    }
  }

  emitPurchaseMote(sourceId: string, rateDeltaText?: string) {
    const generator = universeById(game.activeUniverse).generators.find(({ id }) => id === sourceId)
    if (!generator) return
    const destination = this.worldAddressForTier(generator.tier)
    const startX = this.width * 0.82
    const startY = this.height * 0.5
    const duration = 0.4
    const recipe = particleRecipe('purchase')
    this.addParticle({
      x: startX,
      y: startY,
      vx: (destination.x - startX) / duration,
      vy: (destination.y - startY) / duration,
      life: 0,
      maxLife: recipe.lifeMs[0] / 1_000,
      size: 2.4,
      hue: universeById(game.activeUniverse).palette.accentHue,
      light: 82,
      gravity: 0,
      tail: recipe.tailLength,
      additive: true,
    })
    if (rateDeltaText) this.addFloat(rateDeltaText, destination.x, destination.y)
  }

  private worldAddressForTier(tier: number): { readonly x: number; readonly y: number } {
    const ground = GROUND_ANCHOR_BY_TIER[tier]
    if (ground) return { x: this.width * ground[0], y: this.height * ground[1] }
    if (tier <= 12) return { x: this.width * (0.18 + ((tier - 7) / 5) * 0.64), y: this.height * 0.45 }
    if (tier <= 15) return { x: this.width * (0.24 + ((tier - 13) / 2) * 0.52), y: this.height * 0.25 }
    return { x: this.width * (0.18 + ((tier - 16) / 2) * 0.66), y: this.height * 0.1 }
  }

  addFloat(text: string, x: number, y: number) {
    const c = this.center
    let dx = x - c.x
    let dy = y - c.y
    let len = Math.hypot(dx, dy)
    if (len < 1) {
      dx = (Math.random() - 0.5) * 0.35
      dy = -1
      len = Math.hypot(dx, dy)
    }
    const nx = dx / len
    const ny = dy / len
    const startRadius = this.emberRadius(performance.now()) * 1.55 + 16
    const motion = this.motionScale()
    this.floats.push({
      x: c.x + nx * startRadius + (Math.random() - 0.5) * 14,
      y: c.y + ny * startRadius - 8,
      vx: (nx * 16 + (Math.random() - 0.5) * 12) * motion,
      vy: (-76 - Math.random() * 18) * motion,
      life: 0,
      maxLife: 1.75,
      text,
    })
    const floatLimit = this.currentRenderProfile().id === 'low' ? 24 : 40
    if (this.floats.length > floatLimit) this.floats.shift()
  }

  private addParticle(p: Particle) {
    const limit = this.currentRenderProfile().maxParticles
    if (this.particles.length >= limit) this.particles.shift()
    this.particles.push(p)
  }

  private glimmersFor(id: string, owned: number, hue: number, tier: number): Glimmer[] {
    // Generator ids are intentionally shared between universe packs. Cache by
    // universe and hue so a Crossing cannot leave Emberlight colors attached
    // to Tidefall's kindlings (or vice versa).
    const cacheKey = `${game.activeUniverse}:${id}:${hue}`
    let list = this.glimmers.get(cacheKey)
    if (!list) {
      list = []
      this.glimmers.set(cacheKey, list)
    }
    const want = Math.min(owned, this.currentRenderProfile().maxGlimmersPerTier)
    if (list.length < want) {
      let hash = 0
      for (const ch of cacheKey) hash = (hash * 31 + ch.charCodeAt(0)) | 0
      const rand = mulberry32(hash + list.length * 7919)
      // Kindlings 1-6 have concrete addresses on the dune. Later tiers occupy
      // increasingly distant sky bands rather than one undifferentiated field.
      const groundAnchor = GROUND_ANCHOR_BY_TIER[tier]
      const [xMin, xMax, yMin, yMax] = groundAnchor
        ? [groundAnchor[0] - 0.055, groundAnchor[0] + 0.055, groundAnchor[1] - 0.024, groundAnchor[1] + 0.018]
        : tier <= 12
          ? [0.08, 0.92, 0.28, 0.56]
          : tier <= 15
            ? [0.06, 0.94, 0.1, 0.32]
            : [0.05, 0.95, 0.035, 0.18]
      while (list.length < want) {
        const glimmer = {
          x: xMin + rand() * (xMax - xMin),
          y: yMin + rand() * (yMax - yMin),
          size: 1 + rand() * 2 + tier * 0.12,
          hue,
          phase: rand() * Math.PI * 2,
        }
        if (circleIntersectsHudClearance(
          glimmer.x * this.width,
          glimmer.y * this.height,
          glimmer.size + 4,
          { width: this.width, height: this.height },
        )) continue
        list.push(glimmer)
      }
    }
    return list.slice(0, want)
  }

  private hasCuriosity(id: string): boolean {
    return game.curiosities.includes(id)
  }

  private drawTidefallCuriosities(now: number, fade: number) {
    const { ctx, width, height } = this
    const scale = Math.max(0.72, Math.min(1.05, width / 1360))
    ctx.save()
    ctx.globalAlpha = fade
    ctx.lineCap = 'round'

    // Surface omens: a reflected moon, pressure rings, pearl nursery, and kelp-light.
    if (this.hasCuriosity('moth')) {
      const x = width * 0.11
      const y = height * 0.16
      ctx.strokeStyle = 'rgba(189, 247, 255, 0.34)'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(x, y, 10, 0.55, Math.PI * 1.45)
      ctx.stroke()
      for (let i = 0; i < 3; i++) {
        ctx.strokeStyle = `rgba(104, 219, 232, ${0.12 - i * 0.025})`
        ctx.beginPath()
        ctx.ellipse(x, y + 13 + i * 6, 13 + i * 6, 2 + i, 0, 0, Math.PI * 2)
        ctx.stroke()
      }
    }
    if (this.hasCuriosity('chimes')) {
      const x = width * 0.2
      const y = height * 0.43
      const pulse = (now / 1500) % 1
      for (let i = 0; i < 3; i++) {
        const phase = (pulse + i / 3) % 1
        ctx.strokeStyle = `rgba(109, 235, 229, ${(1 - phase) * 0.2})`
        ctx.beginPath()
        ctx.ellipse(x, y, 8 + phase * 44, 3 + phase * 14, -0.08, 0, Math.PI * 2)
        ctx.stroke()
      }
    }
    if (this.hasCuriosity('hearthkeeper')) {
      const x = width * 0.16
      const y = height * 0.72
      const fueled = game.keeperFedUntil > Date.now()
      for (let i = 0; i < 5; i++) {
        const angle = (i / 5) * Math.PI * 2 + now / 9000
        const px = x + Math.cos(angle) * 17
        const py = y + Math.sin(angle) * 7
        ctx.fillStyle = fueled ? 'rgba(198, 255, 238, 0.75)' : 'rgba(112, 196, 190, 0.42)'
        ctx.beginPath()
        ctx.arc(px, py, (2.5 + (i % 2)) * scale, 0, Math.PI * 2)
        ctx.fill()
      }
    }
    if (this.hasCuriosity('glass-garden')) {
      const baseX = width * 0.3
      const baseY = height * 0.9
      for (let i = 0; i < 6; i++) {
        const sway = Math.sin(now / 1800 + i) * 8
        ctx.strokeStyle = `hsla(${155 + i * 8}, 80%, 66%, ${0.1 + (i % 2) * 0.035})`
        ctx.lineWidth = 1.4 + (i % 3) * 0.5
        ctx.beginPath()
        ctx.moveTo(baseX + i * 7, baseY)
        ctx.bezierCurveTo(baseX + i * 4 - 12, baseY - 28, baseX + i * 8 + sway, baseY - 52, baseX + i * 8 + sway * 0.6, baseY - 76 - i * 3)
        ctx.stroke()
      }
    }

    // Pelagic signals: a sounding beam, migrating silhouette, bloom, and black mouth.
    if (this.hasCuriosity('second-cursor')) {
      const x = width * 0.83
      const y = height * 0.2
      const ping = 0.45 + 0.35 * Math.sin(now / 210) ** 2
      const beam = ctx.createLinearGradient(x, y, x - 18, height * 0.72)
      beam.addColorStop(0, `rgba(188, 250, 255, ${ping})`)
      beam.addColorStop(1, 'rgba(73, 172, 209, 0)')
      ctx.strokeStyle = beam
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(x - 18, height * 0.72)
      ctx.stroke()
      ctx.strokeStyle = `rgba(119, 231, 239, ${ping * 0.45})`
      ctx.beginPath()
      ctx.ellipse(x - 18, height * 0.72, 18 + ping * 8, 5 + ping * 2, 0, 0, Math.PI * 2)
      ctx.stroke()
    }
    if (this.hasCuriosity('snail')) {
      const cycleMs = universeById(game.activeUniverse).cabinet.returnCycleSec * 1000
      const progress = game.snailLastGiftAt > 0 ? Math.min(1, (Date.now() - game.snailLastGiftAt) / cycleMs) : 0
      const x = width * (0.37 + progress * 0.25)
      const y = height * 0.79 + Math.sin(now / 2600) * 5
      ctx.strokeStyle = 'rgba(127, 230, 214, 0.22)'
      ctx.lineWidth = 3 * scale
      ctx.beginPath()
      ctx.moveTo(x - 35, y + 4)
      ctx.bezierCurveTo(x - 15, y - 14, x + 18, y - 12, x + 38, y + 2)
      ctx.stroke()
      ctx.fillStyle = 'rgba(177, 255, 238, 0.32)'
      ctx.beginPath()
      ctx.arc(x + 37, y + 1, 3.2 * scale, 0, Math.PI * 2)
      ctx.fill()
    }
    if (this.hasCuriosity('aurora')) {
      const x = width * 0.7
      const baseY = height * 0.88
      for (let i = 0; i < 4; i++) {
        ctx.strokeStyle = `hsla(${172 + i * 24}, 84%, 68%, ${0.11 - i * 0.014})`
        ctx.lineWidth = 5 - i * 0.8
        ctx.beginPath()
        ctx.moveTo(x - 40 - i * 5, baseY)
        ctx.bezierCurveTo(x - 30, baseY - 28 - i * 8, x + 22, baseY - 42 + i * 3, x + 36 + i * 7, baseY - 82 - i * 6)
        ctx.stroke()
      }
    }
    if (this.hasCuriosity('door')) {
      const x = width * 0.82
      const y = height * 0.68
      ctx.save()
      ctx.translate(x, y)
      ctx.rotate(now / 16000)
      for (let i = 0; i < 4; i++) {
        ctx.strokeStyle = `rgba(${80 + i * 14}, ${190 + i * 10}, 235, ${0.2 - i * 0.03})`
        ctx.beginPath()
        ctx.ellipse(0, 0, 10 + i * 8, 3 + i * 2.2, i * 0.14, 0, Math.PI * 2)
        ctx.stroke()
      }
      ctx.fillStyle = 'rgba(1, 8, 18, 0.96)'
      ctx.beginPath()
      ctx.arc(0, 0, 7, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()
    }

    // Abyssal relics share a low arc, so the screen reads as one ecosystem.
    const abyssY = height * 0.58
    if (this.hasCuriosity('star-jar')) {
      const x = width * 0.58
      ctx.fillStyle = 'rgba(218, 255, 251, 0.82)'
      ctx.beginPath()
      ctx.arc(x, abyssY, 3.4, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = 'rgba(107, 221, 231, 0.2)'
      ctx.beginPath()
      ctx.ellipse(x, abyssY, 13, 4, 0, 0, Math.PI * 2)
      ctx.stroke()
    }
    if (this.hasCuriosity('metronome-heart')) {
      const x = width * 0.66
      const pulse = 5 + 4 * Math.sin(now / 250) ** 2
      ctx.strokeStyle = 'rgba(117, 237, 226, 0.24)'
      ctx.beginPath()
      ctx.arc(x, abyssY + 4, 10 + pulse, 0, Math.PI * 2)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(x - 25, abyssY + 4)
      ctx.lineTo(x + 25, abyssY + 4)
      ctx.stroke()
    }
    if (this.hasCuriosity('letter')) {
      const x = width * 0.75
      const glow = ctx.createRadialGradient(x, abyssY, 0, x, abyssY, 18)
      glow.addColorStop(0, 'rgba(255, 228, 202, 0.8)')
      glow.addColorStop(0.35, 'rgba(241, 72, 83, 0.42)')
      glow.addColorStop(1, 'rgba(127, 25, 71, 0)')
      ctx.fillStyle = glow
      ctx.beginPath()
      ctx.arc(x, abyssY, 18, 0, Math.PI * 2)
      ctx.fill()
    }
    if (this.hasCuriosity('orrery')) {
      const x = width * 0.9
      const y = height * 0.82
      ctx.strokeStyle = 'rgba(117, 226, 242, 0.24)'
      for (let i = 0; i < 3; i++) {
        ctx.beginPath()
        ctx.ellipse(x, y, 16 + i * 9, 5 + i * 3, -0.25 + i * 0.16, 0, Math.PI * 2)
        ctx.stroke()
      }
      ctx.fillStyle = 'rgba(1, 10, 20, 0.96)'
      ctx.beginPath()
      ctx.arc(x, y, 8, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.restore()
  }

  private drawCuriosities(now: number, fade: number) {
    if (game.activeUniverse === 'tidefall') {
      this.drawTidefallCuriosities(now, fade)
      return
    }
    const { ctx, width, height } = this
    const c = this.center
    const scale = Math.max(0.76, Math.min(1.08, width / 1360))

    if (this.hasCuriosity('aurora')) {
      const x = width * 0.76
      const y = height * 0.15
      const breathe = 1 + 0.08 * Math.sin(now / 2100)
      ctx.save()
      ctx.translate(x, y)
      ctx.rotate(-0.18)
      ctx.globalAlpha = fade
      for (let i = 0; i < 4; i++) {
        ctx.strokeStyle = `hsla(${165 + i * 27}, 86%, 72%, ${0.075 - i * 0.009})`
        ctx.lineWidth = 5 - i * 0.75
        ctx.beginPath()
        ctx.ellipse(0, 0, (27 + i * 9) * breathe, (12 + i * 5) * breathe, i * 0.24, -2.6, 1.05)
        ctx.stroke()
      }
      ctx.restore()
    }

    if (this.hasCuriosity('hearthkeeper')) {
      const x = width * 0.13
      const y = height * 0.25
      const fueled = game.keeperFedUntil > Date.now()
      const pulse = 1 + 0.08 * Math.sin(now / 760)
      ctx.save()
      ctx.globalAlpha = fade
      const nursery = ctx.createRadialGradient(x, y, 0, x, y, 28 * pulse)
      nursery.addColorStop(0, fueled ? 'rgba(255, 246, 196, 0.72)' : 'rgba(255, 219, 170, 0.46)')
      nursery.addColorStop(0.22, fueled ? 'rgba(255, 153, 72, 0.32)' : 'rgba(176, 91, 79, 0.18)')
      nursery.addColorStop(0.64, 'rgba(131, 74, 178, 0.09)')
      nursery.addColorStop(1, 'rgba(100, 60, 160, 0)')
      ctx.fillStyle = nursery
      ctx.beginPath()
      ctx.arc(x, y, 28 * pulse, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = fueled ? 'rgba(255, 201, 126, 0.22)' : 'rgba(196, 139, 137, 0.12)'
      ctx.setLineDash([2, 6])
      ctx.beginPath()
      ctx.ellipse(x, y, 31, 12, now / 12000, 0, Math.PI * 2)
      ctx.stroke()
      ctx.setLineDash([])
      ctx.restore()
    }

    const shelfHas = ['chimes', 'door', 'star-jar', 'letter'].some((id) => this.hasCuriosity(id))
    if (shelfHas) {
      const x = width * 0.2
      const y = height * 0.68
      ctx.save()
      ctx.translate(x, y)
      ctx.scale(scale, scale)
      ctx.lineCap = 'round'
      ctx.globalAlpha = fade

      ctx.strokeStyle = 'rgba(190, 210, 255, 0.065)'
      ctx.lineWidth = 1
      ctx.setLineDash([2, 7])
      ctx.beginPath()
      ctx.ellipse(4, 8, 126, 72, -0.12, 0.18, 2.75)
      ctx.stroke()
      ctx.setLineDash([])

      if (this.hasCuriosity('chimes')) {
        const pulse = 0.72 + 0.28 * Math.sin(now / 440)
        ctx.strokeStyle = `rgba(175, 238, 255, ${0.2 * pulse})`
        ctx.beginPath()
        ctx.arc(-58, -38, 14 + pulse * 3, 0, Math.PI * 2)
        ctx.stroke()
        ctx.setLineDash([2, 5])
        ctx.beginPath()
        ctx.arc(-58, -38, 22 + pulse * 4, 0, Math.PI * 2)
        ctx.stroke()
        ctx.setLineDash([])
        ctx.save()
        ctx.translate(-58, -38)
        ctx.rotate(now / 2300)
        ctx.beginPath()
        ctx.moveTo(-34, 0)
        ctx.lineTo(34, 0)
        ctx.stroke()
        ctx.restore()
        ctx.fillStyle = 'rgba(225, 250, 255, 0.7)'
        ctx.beginPath()
        ctx.arc(-58, -38, 3.2, 0, Math.PI * 2)
        ctx.fill()
      }

      if (this.hasCuriosity('star-jar')) {
        const tw = 0.7 + 0.3 * Math.sin(now / 540)
        ctx.strokeStyle = 'rgba(190, 229, 255, 0.24)'
        ctx.beginPath()
        ctx.arc(-74, 37, 10 + tw * 2, 0, Math.PI * 2)
        ctx.stroke()
        ctx.fillStyle = `rgba(235, 249, 255, ${0.72 * tw})`
        ctx.beginPath()
        ctx.arc(-74, 37, 2.5 + tw * 0.8, 0, Math.PI * 2)
        ctx.fill()
      }

      if (this.hasCuriosity('letter')) {
        const x = 20
        const y = 48
        const giant = ctx.createRadialGradient(x - 4, y - 5, 0, x, y, 18)
        giant.addColorStop(0, 'rgba(255, 239, 186, 0.78)')
        giant.addColorStop(0.4, 'rgba(242, 116, 67, 0.52)')
        giant.addColorStop(1, 'rgba(155, 42, 39, 0)')
        ctx.fillStyle = giant
        ctx.beginPath()
        ctx.arc(x, y, 18, 0, Math.PI * 2)
        ctx.fill()
      }

      if (this.hasCuriosity('door')) {
        const readable = gteAmount(game.allTimeEarned, amountFromNumber(1e30))
        ctx.save()
        ctx.translate(92, 14)
        ctx.rotate(-0.18 + Math.sin(now / 2800) * 0.04)
        ctx.strokeStyle = readable ? 'rgba(255, 214, 143, 0.42)' : 'rgba(255, 167, 96, 0.25)'
        ctx.lineWidth = readable ? 2 : 1.2
        ctx.beginPath()
        ctx.ellipse(0, 0, 20, 6, 0, 0, Math.PI * 2)
        ctx.stroke()
        ctx.fillStyle = 'rgba(1, 2, 6, 0.96)'
        ctx.beginPath()
        ctx.arc(0, 0, 8.5, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      }

      ctx.restore()
    }

    if (this.hasCuriosity('second-cursor')) {
      const x = width * 0.88
      const y = height * 0.28
      const angle = -0.42 + Math.sin(now / 2600) * 0.05
      const beam = 0.35 + 0.2 * (0.5 + 0.5 * Math.sin(now / 210))
      ctx.save()
      ctx.translate(x, y)
      ctx.rotate(angle)
      ctx.globalAlpha = fade
      const jet = ctx.createLinearGradient(-58, 0, 58, 0)
      jet.addColorStop(0, 'rgba(120, 225, 255, 0)')
      jet.addColorStop(0.48, `rgba(166, 240, 255, ${beam})`)
      jet.addColorStop(0.52, `rgba(255, 247, 220, ${beam + 0.18})`)
      jet.addColorStop(1, 'rgba(120, 225, 255, 0)')
      ctx.strokeStyle = jet
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(-58, 0)
      ctx.lineTo(58, 0)
      ctx.stroke()
      ctx.strokeStyle = 'rgba(145, 225, 255, 0.2)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.ellipse(0, 0, 13, 4, 0, 0, Math.PI * 2)
      ctx.stroke()
      ctx.fillStyle = 'rgba(235, 253, 255, 0.8)'
      ctx.beginPath()
      ctx.arc(0, 0, 3, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()
    }

    const groundHas = ['glass-garden', 'snail', 'metronome-heart'].some((id) => this.hasCuriosity(id))
    if (groundHas) {
      const baseY = height * 0.84
      ctx.save()
      ctx.globalAlpha = fade
      ctx.lineCap = 'round'

      if (this.hasCuriosity('glass-garden')) {
        const x = width * 0.18
        for (let i = 0; i < 7; i++) {
          const a = (i / 7) * Math.PI * 2 + now / 26000
          const px = x + Math.cos(a) * (18 + (i % 3) * 6)
          const py = baseY - 28 + Math.sin(a * 1.4) * (10 + (i % 2) * 7)
          const r = (9 + (i % 3) * 4) * scale
          const cloud = ctx.createRadialGradient(px, py, 0, px, py, r)
          cloud.addColorStop(0, `hsla(${188 + i * 18}, 88%, 72%, 0.14)`)
          cloud.addColorStop(1, `hsla(${225 + i * 13}, 82%, 56%, 0)`)
          ctx.fillStyle = cloud
          ctx.beginPath()
          ctx.arc(px, py, r, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      if (this.hasCuriosity('snail')) {
        const progress =
          game.snailLastGiftAt > 0 ? Math.min(1, (Date.now() - game.snailLastGiftAt) / (90 * 60 * 1000)) : 0
        const angle = Math.PI * (0.86 + progress * 1.28)
        const orbitX = Math.min(width * 0.37, 430)
        const orbitY = Math.min(height * 0.31, 245)
        const x = c.x + Math.cos(angle) * orbitX
        const y = c.y + Math.sin(angle) * orbitY
        const tailAngle = angle + Math.PI * 0.5
        const tail = ctx.createLinearGradient(x, y, x + Math.cos(tailAngle) * 34, y + Math.sin(tailAngle) * 34)
        tail.addColorStop(0, 'rgba(229, 255, 194, 0.46)')
        tail.addColorStop(1, 'rgba(130, 218, 255, 0)')
        ctx.strokeStyle = tail
        ctx.lineWidth = 4 * scale
        ctx.beginPath()
        ctx.moveTo(x, y)
        ctx.lineTo(x + Math.cos(tailAngle) * 34, y + Math.sin(tailAngle) * 34)
        ctx.stroke()
        ctx.fillStyle = 'rgba(232, 255, 202, 0.72)'
        ctx.beginPath()
        ctx.arc(x, y, 3.5 * scale, 0, Math.PI * 2)
        ctx.fill()
      }

      if (this.hasCuriosity('metronome-heart')) {
        const x = width * 0.82
        const y = baseY - 28
        const beat = 0.55 + 0.45 * Math.sin(now / 180) ** 2
        ctx.save()
        ctx.translate(x, y)
        ctx.rotate(now / 1650)
        ctx.strokeStyle = `rgba(255, 154, 216, ${0.13 + beat * 0.12})`
        ctx.lineWidth = 1.2
        ctx.beginPath()
        ctx.moveTo(-35, 0)
        ctx.lineTo(35, 0)
        ctx.stroke()
        ctx.restore()
        ctx.strokeStyle = `rgba(255, 174, 222, ${0.16 + beat * 0.09})`
        ctx.beginPath()
        ctx.arc(x, y, 10 + beat * 4, 0, Math.PI * 2)
        ctx.stroke()
        ctx.fillStyle = 'rgba(255, 225, 245, 0.72)'
        ctx.beginPath()
        ctx.arc(x, y, 2.5 + beat, 0, Math.PI * 2)
        ctx.fill()
      }

      ctx.restore()
    }

    if (this.hasCuriosity('orrery')) {
      const x = width * 0.84
      const y = height * 0.76
      const turn = now / 12000
      ctx.save()
      ctx.translate(x, y)
      ctx.rotate(-0.24 + Math.sin(turn) * 0.06)
      ctx.strokeStyle = `rgba(255, 199, 119, ${0.3 * fade})`
      ctx.lineWidth = 1.4
      for (let i = 0; i < 3; i++) {
        ctx.beginPath()
        ctx.ellipse(0, 0, 18 + i * 9, 5 + i * 2.5, i * 0.12, 0, Math.PI * 2)
        ctx.stroke()
      }
      ctx.fillStyle = `rgba(1, 2, 6, ${0.96 * fade})`
      ctx.beginPath()
      ctx.arc(0, 0, 10, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = `rgba(198, 224, 255, ${0.08 * fade})`
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.arc(0, 0, 26 + Math.sin(now / 1800) * 2, 0.25, Math.PI * 1.55)
      ctx.stroke()
      ctx.restore()
    }

    if (this.hasCuriosity('moth')) {
      // Keep the White Dwarf in the distant sky. It must never cross the
      // rhythm target or inherit the ember's click-pulse radius.
      const x = width * 0.085 + Math.sin(now / 6200) * 3
      const y = height * 0.13 + Math.cos(now / 7100) * 2
      ctx.fillStyle = `rgba(238, 249, 255, ${0.84 * fade})`
      ctx.beginPath()
      ctx.arc(x, y, 3.4, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = `rgba(155, 207, 255, ${0.24 * fade})`
      ctx.beginPath()
      ctx.arc(x, y, 8 + Math.sin(now / 760), 0, Math.PI * 2)
      ctx.stroke()
    }
  }

  private drawQuasarTaps(now: number, fade: number) {
    if (!this.hasCuriosity('second-cursor')) return
    const { ctx } = this
    for (const tap of this.quasarTaps) {
      const age = (now - tap.born) / 720
      if (age < 0 || age > 1) continue
      const alpha = (1 - age) * fade
      ctx.save()
      ctx.strokeStyle = tap.crit ? `rgba(255, 218, 135, ${0.55 * alpha})` : `rgba(185, 230, 255, ${0.48 * alpha})`
      ctx.lineWidth = tap.crit ? 2.1 : 1.5
      ctx.beginPath()
      ctx.arc(tap.x, tap.y, 8 + age * 32, 0, Math.PI * 2)
      ctx.stroke()
      ctx.restore()
    }
  }

  start() {
    let last = performance.now()
    const frame = (now: number) => {
      const profile = this.currentRenderProfile()
      if (profile.id !== this.profileId) this.resize()
      const frameBudget = 1000 / profile.fps
      if (now - last < frameBudget * 0.82) {
        this.raf = requestAnimationFrame(frame)
        return
      }
      const dt = Math.min((now - last) / 1000, 0.1)
      last = now
      this.update(dt, now)
      this.draw(now)
      this.samplePerformance(now, profile)
      this.raf = requestAnimationFrame(frame)
    }
    this.raf = requestAnimationFrame(frame)
  }

  stop() {
    cancelAnimationFrame(this.raf)
  }

  private update(dt: number, now: number) {
    const particlesPaused = document.documentElement.dataset.lumenImportance === 'important'
    this.pulse = Math.max(0, this.pulse - dt * 6)
    const parallaxEase = 1 - Math.exp(-dt * 5)
    this.pointerDriftX += (this.targetPointerDriftX - this.pointerDriftX) * parallaxEase
    this.pointerDriftY += (this.targetPointerDriftY - this.pointerDriftY) * parallaxEase

    const sparkCount = game.owned.spark ?? 0
    if (!particlesPaused && game.activeUniverse === 'emberlight' && sparkCount > 0 && this.motionScale() >= 1) {
      // Sparks are a rate, not a landmark: more ownership means the Coal exhales
      // more frequently, while still respecting the global particle budget.
      const moteInterval = Math.max(0.16, 2 / (1 + Math.log2(sparkCount + 1) * 0.75))
      this.idleMoteAcc += dt
      if (this.idleMoteAcc >= moteInterval) {
        this.idleMoteAcc %= moteInterval
        const c = this.center
        const r = this.emberRadius(now)
        this.addParticle({
          x: c.x + r * 0.16,
          y: c.y - r * 0.58,
          vx: 4 + Math.random() * 7,
          vy: -18 - Math.random() * 8,
          life: 0,
          maxLife: 1.8 + Math.random() * 0.4,
          size: 0.8 + Math.random() * 0.7,
          hue: 34 + Math.random() * 12,
          light: 70 + Math.random() * 15,
        })
      }
    } else {
      this.idleMoteAcc = 0
    }

    // during collapse, everything streams into the ember
    const collapse = this.collapseProgress(now)
    if (collapse > 0) {
      const c = this.center
      for (const p of this.particles) {
        const dx = c.x - p.x
        const dy = c.y - p.y
        const dist = Math.max(20, Math.hypot(dx, dy))
        p.vx += (dx / dist) * 900 * collapse * dt
        p.vy += (dy / dist) * 900 * collapse * dt
      }
      // pull glimmers in as infall streaks
      for (let i = 0; i < 3; i++) {
        const angle = Math.random() * Math.PI * 2
        const rad = Math.max(this.width, this.height) * (0.25 + Math.random() * 0.4)
        this.addParticle({
          x: c.x + Math.cos(angle) * rad,
          y: c.y + Math.sin(angle) * rad,
          vx: -Math.cos(angle) * 350 * (0.7 + collapse),
          vy: -Math.sin(angle) * 350 * (0.7 + collapse),
          life: 0,
          maxLife: 1.4,
          size: 1 + Math.random() * 2.2,
          hue: 30 + Math.random() * 220,
          light: 60 + Math.random() * 30,
        })
      }
    }

    // beat rings while the music plays
    const beat = game.beatVisual === 'off' ? null : currentBeatIndex()
    if (beat !== null && beat !== this.lastBeat) {
      this.lastBeat = beat
      this.rings.push(now)
    }
    if (game.beatVisual === 'off') this.rings = []
    this.rings = this.rings.filter((born) => now - born < 650)
    this.quasarTaps = this.quasarTaps.filter((tap) => now - tap.born < 760)

    // gentle motes rising from the ember while generators work
    const rate = ratePerSec()
    if (!particlesPaused && !isZeroAmount(rate)) {
      const profile = this.currentRenderProfile()
      this.driftAcc += dt * Math.min(5, 0.6 + Math.sqrt(amountToBoundedNumber(rate)) * 0.35) * this.motionScale() * profile.moteScale
      while (this.driftAcc >= 1) {
        this.driftAcc -= 1
        const c = this.center
        const r = this.emberRadius(now)
        const angle = Math.random() * Math.PI * 2
        const accent = universeById(game.activeUniverse).palette.accentHue
        this.addParticle({
          x: c.x + Math.cos(angle) * r * 0.9,
          y: c.y + Math.sin(angle) * r * 0.9,
          vx: (Math.random() - 0.5) * 14,
          vy: -20 - Math.random() * 25,
          life: 0,
          maxLife: 2.5 + Math.random() * 2.5,
          size: 0.8 + Math.random() * 1.6,
          hue: accent - 10 + Math.random() * 20,
          light: 60 + Math.random() * 30,
        })
      }
    }

    if (!particlesPaused) {
      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i]
        p.life += dt
        if (p.life >= p.maxLife) {
          this.particles.splice(i, 1)
          continue
        }
        p.x += p.vx * dt
        p.y += p.vy * dt
        p.vx *= 1 - dt * 1.2
        const gravity = p.gravityAfterLife !== undefined && p.life >= p.gravityAfterLife
          ? p.gravityAfter ?? p.gravity ?? 20
          : p.gravity ?? 20
        p.vy += gravity * dt
        if (p.bounce && p.y >= this.height * 0.78 && p.vy > 0) {
          p.y = this.height * 0.78
          p.vy *= -0.34
          p.vx *= 0.7
          p.bounce = false
        }
      }
    }

    for (let i = this.floats.length - 1; i >= 0; i--) {
      const f = this.floats[i]
      f.life += dt
      if (f.life >= f.maxLife) this.floats.splice(i, 1)
      else {
        f.x += f.vx * dt
        f.y += f.vy * dt
        f.vx *= 1 - dt * 1.6
        f.vy *= 1 - dt * 0.12
      }
    }
  }

  private parallaxForTier(tier: number): number {
    if (tier <= 6) return PARALLAX_BY_TIER.ground
    if (tier <= 12) return PARALLAX_BY_TIER.nearSky
    if (tier <= 15) return PARALLAX_BY_TIER.deepSky
    return PARALLAX_BY_TIER.horizon
  }

  private drawGround() {
    const { ctx, width, height } = this
    const offsetX = this.pointerDriftX * PARALLAX_BY_TIER.ground
    const offsetY = this.pointerDriftY * PARALLAX_BY_TIER.ground * 0.25
    const edgeY = height * 0.79 + offsetY
    const seamY = height * (HEART_VERTICAL_POSITION + 0.085) + offsetY
    ctx.save()
    ctx.fillStyle = GROUND_COLORS[game.activeUniverse as keyof typeof GROUND_COLORS]
      ?? GROUND_COLORS.emberlight
    ctx.beginPath()
    ctx.moveTo(-24 + offsetX, edgeY)
    ctx.bezierCurveTo(
      width * 0.17 + offsetX,
      height * 0.75 + offsetY,
      width * 0.34 + offsetX,
      seamY + height * 0.018,
      width * 0.5 + offsetX,
      seamY,
    )
    ctx.bezierCurveTo(
      width * 0.67 + offsetX,
      seamY + height * 0.012,
      width * 0.83 + offsetX,
      height * 0.76 + offsetY,
      width + 24 + offsetX,
      height * 0.8 + offsetY,
    )
    ctx.lineTo(width + 24, height + 24)
    ctx.lineTo(-24, height + 24)
    ctx.closePath()
    ctx.fill()
    ctx.restore()
  }

  private applyScreenBloom(profile: RenderProfile) {
    const { ctx, width, height, dpr } = this
    const bloomWidth = this.bloomCanvas.width
    const bloomHeight = this.bloomCanvas.height
    this.bloomCtx.setTransform(1, 0, 0, 1, 0, 0)
    this.bloomCtx.clearRect(0, 0, bloomWidth, bloomHeight)
    this.bloomCtx.filter = profile.id === 'low'
      ? 'brightness(1.12) contrast(1.18)'
      : 'brightness(1.22) contrast(1.28) saturate(1.08)'
    this.bloomCtx.drawImage(
      this.canvas,
      0,
      0,
      this.canvas.width,
      this.canvas.height,
      0,
      0,
      bloomWidth,
      bloomHeight,
    )
    this.bloomCtx.filter = 'none'

    ctx.save()
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.globalCompositeOperation = 'lighter'
    ctx.globalAlpha = profile.id === 'high' ? 0.24 : profile.id === 'balanced' ? 0.19 : 0.13
    ctx.filter = `blur(${profile.id === 'high' ? 12 : profile.id === 'balanced' ? 9 : 6}px)`
    const bleed = profile.id === 'high' ? 16 : profile.id === 'balanced' ? 12 : 8
    ctx.drawImage(this.bloomCanvas, -bleed, -bleed, width + bleed * 2, height + bleed * 2)
    ctx.restore()
  }

  private emberlightCoalStage(): number {
    if (game.ending !== null) return 5
    let deepestTier = 0
    for (const generator of universeById('emberlight').generators) {
      if ((game.owned[generator.id] ?? 0) > 0) deepestTier = Math.max(deepestTier, generator.tier)
    }
    if (deepestTier >= 14) return 4
    if (deepestTier >= 10) return 3
    if (deepestTier >= 7) return 2
    if (deepestTier >= 3) return 1
    if (game.supernovae > 0) return 1
    return 0
  }

  private drawSupernovaAfterglow(now: number) {
    if (game.activeUniverse !== 'emberlight' || this.supernovaAfterglowStart <= 0) return
    const age = now - this.supernovaAfterglowStart
    if (age >= 60_000) {
      this.supernovaAfterglowStart = 0
      return
    }
    const { ctx, width, height } = this
    const fade = 1 - age / 60_000
    ctx.save()

    // Fresh Stardust remains caught in the ash for the first minute.
    for (let index = 0; index < 42; index += 1) {
      const x = ((index * 83 + 17) % 997) / 997 * width
      const y = height * (0.755 + (((index * 47 + 11) % 100) / 100) * 0.19)
      const twinkle = 0.35 + 0.65 * Math.sin(now / 420 + index * 2.13) ** 2
      ctx.fillStyle = `rgba(215, 205, 255, ${fade * twinkle * 0.34})`
      ctx.beginPath()
      ctx.arc(x, y, 0.7 + (index % 3) * 0.45, 0, Math.PI * 2)
      ctx.fill()
    }

    // Scorch-ghosts remember the largest lost structures without repopulating the sky.
    ctx.strokeStyle = `rgba(177, 145, 214, ${fade * 0.075})`
    ctx.lineWidth = 1
    ctx.setLineDash([3, 8])
    ctx.beginPath()
    ctx.moveTo(width * 0.16, height * 0.72)
    ctx.lineTo(width * 0.28, height * 0.63)
    ctx.lineTo(width * 0.39, height * 0.71)
    ctx.moveTo(width * 0.67, height * 0.28)
    ctx.arc(width * 0.67, height * 0.28, Math.min(width, height) * 0.046, 0, Math.PI * 2)
    ctx.moveTo(width * 0.14, height * 0.17)
    ctx.lineTo(width * 0.28, height * 0.09)
    ctx.lineTo(width * 0.39, height * 0.2)
    ctx.lineTo(width * 0.51, height * 0.11)
    ctx.stroke()
    ctx.setLineDash([])
    ctx.restore()
  }

  private drawEmberlightCoal(now: number, radius: number, reduced: boolean) {
    const { ctx } = this
    const c = this.center
    const stage = this.emberlightCoalStage()
    const pal = this.palette()
    const clickAngle = Math.atan2(this.clickAxisY, this.clickAxisX)

    ctx.save()
    ctx.translate(c.x, c.y)

    if (stage >= 4) {
      ctx.strokeStyle = `rgba(${pal.c1}, 0.28)`
      ctx.lineWidth = 1.2
      for (const offset of [-0.58, -0.18, 0.24, 0.61]) {
        ctx.beginPath()
        ctx.moveTo(offset * radius, -radius * 0.48)
        ctx.bezierCurveTo(offset * radius * 1.3, -radius * 1.25, offset * radius * 0.7, -radius * 2.1, offset * radius * 1.8, -radius * 2.8)
        ctx.stroke()
      }
    }

    if (stage >= 3) {
      ctx.strokeStyle = `rgba(${pal.c1}, 0.44)`
      ctx.lineWidth = Math.max(1.2, radius * 0.035)
      ctx.beginPath()
      ctx.ellipse(radius * 0.12, -radius * 0.08, radius * 1.18, radius * 0.78, -0.48, 3.62, 5.92)
      ctx.stroke()
    }

    if (stage >= 1) {
      for (let index = 0; index < 7; index += 1) {
        const angle = Math.PI * (0.05 + index * 0.15)
        const x = Math.cos(angle) * radius * 1.05
        const y = Math.sin(angle) * radius * 0.48 + radius * 0.68
        ctx.fillStyle = index % 2 === 0 ? '#2f2528' : '#3a2d2b'
        ctx.beginPath()
        ctx.ellipse(x, y, radius * 0.24, radius * 0.13, angle - Math.PI / 2, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    if (stage >= 2) {
      for (let index = 0; index < 2; index += 1) {
        const angle = now / 800 + index * Math.PI * 0.88
        ctx.fillStyle = `rgba(${pal.c1}, ${0.34 + index * 0.12})`
        ctx.beginPath()
        ctx.arc(Math.cos(angle) * radius * 1.1, Math.sin(angle) * radius * 0.42, radius * 0.055, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    ctx.scale(1.1, 0.96)
    ctx.rotate(clickAngle)
    ctx.scale(1 - this.pulse * 0.06 * this.motionScale(), 1 + this.pulse * 0.02 * this.motionScale())
    ctx.rotate(-clickAngle)

    const core = ctx.createRadialGradient(-radius * 0.18, -radius * 0.22, 0, 0, 0, radius)
    core.addColorStop(0, `rgba(${pal.c0}, 1)`)
    core.addColorStop(0.34, `rgba(${pal.c1}, 0.98)`)
    core.addColorStop(0.78, `rgba(${pal.c2}, 0.92)`)
    core.addColorStop(1, `rgba(${pal.c3}, 0.84)`)
    ctx.fillStyle = core
    ctx.beginPath()
    ctx.moveTo(-radius * 0.94, radius * 0.12)
    ctx.bezierCurveTo(-radius * 1.02, -radius * 0.42, -radius * 0.58, -radius * 0.88, -radius * 0.1, -radius * 0.82)
    ctx.bezierCurveTo(radius * 0.24, -radius * 1.02, radius * 0.82, -radius * 0.62, radius * 0.86, -radius * 0.12)
    ctx.bezierCurveTo(radius * 1.02, radius * 0.34, radius * 0.55, radius * 0.88, radius * 0.08, radius * 0.82)
    ctx.bezierCurveTo(-radius * 0.38, radius * 0.97, -radius * 0.88, radius * 0.65, -radius * 0.94, radius * 0.12)
    ctx.closePath()
    ctx.fill()

    ctx.fillStyle = 'rgba(24, 16, 19, 0.82)'
    ctx.beginPath()
    ctx.moveTo(-radius * 0.88, radius * 0.08)
    ctx.bezierCurveTo(-radius * 0.88, -radius * 0.46, -radius * 0.55, -radius * 0.78, -radius * 0.12, -radius * 0.75)
    ctx.lineTo(-radius * 0.3, -radius * 0.18)
    ctx.lineTo(-radius * 0.06, radius * 0.06)
    ctx.lineTo(-radius * 0.28, radius * 0.72)
    ctx.bezierCurveTo(-radius * 0.68, radius * 0.66, -radius * 0.92, radius * 0.42, -radius * 0.88, radius * 0.08)
    ctx.fill()
    ctx.beginPath()
    ctx.moveTo(radius * 0.02, -radius * 0.78)
    ctx.bezierCurveTo(radius * 0.52, -radius * 0.82, radius * 0.86, -radius * 0.5, radius * 0.84, -radius * 0.12)
    ctx.lineTo(radius * 0.3, -radius * 0.02)
    ctx.lineTo(radius * 0.08, -radius * 0.24)
    ctx.closePath()
    ctx.fill()
    ctx.beginPath()
    ctx.moveTo(radius * 0.15, radius * 0.08)
    ctx.lineTo(radius * 0.82, radius * 0.02)
    ctx.bezierCurveTo(radius * 0.88, radius * 0.45, radius * 0.5, radius * 0.82, radius * 0.08, radius * 0.8)
    ctx.lineTo(-radius * 0.1, radius * 0.2)
    ctx.closePath()
    ctx.fill()

    const crackAlpha = reduced ? 0.78 : Math.min(1, 0.7 + this.pulse * 0.7)
    ctx.strokeStyle = `rgba(${this.pulse > 0.55 ? '255, 250, 231' : pal.c1}, ${crackAlpha})`
    ctx.lineWidth = Math.max(1.4, radius * (0.035 + this.pulse * 0.018))
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.beginPath()
    ctx.moveTo(-radius * 0.22, -radius * 0.72)
    ctx.lineTo(-radius * 0.3, -radius * 0.2)
    ctx.lineTo(-radius * 0.06, radius * 0.05)
    ctx.lineTo(-radius * 0.16, radius * 0.36)
    ctx.lineTo(-radius * 0.06, radius * 0.74)
    ctx.moveTo(-radius * 0.06, radius * 0.05)
    ctx.lineTo(radius * 0.18, -radius * 0.2)
    ctx.lineTo(radius * 0.48, -radius * 0.08)
    ctx.moveTo(-radius * 0.16, radius * 0.36)
    ctx.lineTo(radius * 0.14, radius * 0.2)
    ctx.lineTo(radius * 0.38, radius * 0.48)
    ctx.stroke()

    if (stage >= 5) {
      ctx.fillStyle = `rgba(${pal.c0}, 0.92)`
      ctx.beginPath()
      ctx.ellipse(0, radius * 0.04, radius * 0.18, radius * 0.13, -0.2, 0, Math.PI * 2)
      ctx.fill()
    }

    ctx.restore()
  }

  private drawEmberlightWisps(now: number, radius: number, reduced: boolean) {
    const owned = game.owned.wisp ?? 0
    if (owned <= 0) return
    const { ctx } = this
    const c = this.center
    const count = owned >= 50 ? 3 : owned >= 10 ? 2 : 1
    ctx.save()
    ctx.globalCompositeOperation = 'screen'
    for (let index = 0; index < count; index += 1) {
      const phase = index * 2.1
      const turn = reduced ? phase : now / (2_800 + index * 310) + phase
      const x = c.x + Math.cos(turn) * radius * (1.45 + index * 0.42)
      const y = c.y - radius * (0.25 + index * 0.18) + Math.sin(turn * 1.37) * radius * 0.38
      const alpha = 0.26 + Math.min(0.24, Math.log10(owned + 1) * 0.1)
      ctx.save()
      ctx.translate(x, y)
      ctx.rotate(-0.36 + Math.sin(turn) * 0.24)
      const glow = ctx.createRadialGradient(0, -radius * 0.08, 0, 0, 0, radius * 0.44)
      glow.addColorStop(0, `rgba(216, 252, 255, ${alpha * 0.9})`)
      glow.addColorStop(0.42, `rgba(93, 222, 242, ${alpha})`)
      glow.addColorStop(1, 'rgba(67, 177, 221, 0)')
      ctx.fillStyle = glow
      ctx.beginPath()
      ctx.moveTo(0, -radius * 0.42)
      ctx.bezierCurveTo(radius * 0.3, -radius * 0.12, radius * 0.2, radius * 0.2, 0, radius * 0.36)
      ctx.bezierCurveTo(-radius * 0.2, radius * 0.12, -radius * 0.22, -radius * 0.12, 0, -radius * 0.42)
      ctx.fill()
      ctx.strokeStyle = `rgba(180, 244, 255, ${alpha * 0.72})`
      ctx.lineWidth = Math.max(0.8, radius * 0.018)
      ctx.beginPath()
      ctx.moveTo(0, radius * 0.16)
      ctx.bezierCurveTo(-radius * 0.18, radius * 0.48, radius * 0.12, radius * 0.65, -radius * 0.07, radius * 0.88)
      ctx.stroke()
      ctx.restore()
    }
    ctx.restore()
  }

  private draw(now: number) {
    const { ctx, width, height, dpr } = this
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, width, height)

    // vignette breathing very faintly so the void never feels frozen
    const vg = ctx.createRadialGradient(
      width / 2,
      height / 2,
      Math.min(width, height) * 0.2,
      width / 2,
      height / 2,
      Math.max(width, height) * 0.75,
    )
    vg.addColorStop(0, 'rgba(13,12,24,0.0)')
    vg.addColorStop(1, 'rgba(2,2,6,0.55)')
    ctx.fillStyle = vg
    ctx.fillRect(0, 0, width, height)

    this.drawGround()
    this.drawSupernovaAfterglow(now)

    // The ambient field gives progression a shared sense of depth. V2 worlds
    // add a composed universe atmosphere in ManifestWorldLayer instead of
    // replacing this field with a grid of contract primitives.
    const collapseFade = 1 - this.collapseProgress(now)
    const reduced = this.motionScale() < 1
    const authoredManifestWorld = universeV2ById(game.activeUniverse) !== null
    for (const g of universeById(game.activeUniverse).generators) {
      const owned = game.owned[g.id] ?? 0
      if (owned <= 0) continue
      const ownedScale = 1 + Math.min(0.7, Math.log10(owned + 1) * 0.2)
      const tierScale = 1 + Math.min(0.25, g.tier * 0.012)
      const parallax = this.parallaxForTier(g.tier)
      for (const gl of this.glimmersFor(g.id, owned, g.hue, g.tier)) {
        const tw = reduced ? 0.72 : 0.45 + 0.55 * (0.5 + 0.5 * Math.sin(now / 700 + gl.phase))
        const size = gl.size * ownedScale * tierScale
        if (circleIntersectsHudClearance(
          gl.x * width + this.pointerDriftX * parallax,
          gl.y * height + this.pointerDriftY * parallax,
          size + 2,
          { width, height },
        )) continue
        ctx.beginPath()
        ctx.fillStyle = `hsla(${gl.hue}, 90%, 70%, ${0.22 * tw * collapseFade})`
        ctx.arc(
          gl.x * width + this.pointerDriftX * parallax,
          gl.y * height + this.pointerDriftY * parallax,
          size * tw + 0.4,
          0,
          Math.PI * 2,
        )
        ctx.fill()
      }
    }

    // Vessel construction belongs to its dedicated panel; the playfield stays
    // focused on the central rhythm target.
    if (!authoredManifestWorld) this.drawCuriosities(reduced ? 0 : now, collapseFade)

    const c = this.center
    const r = this.emberRadius(now)

    const pal = this.palette()
    // core
    const flick = reduced ? 0.98 : 0.94 + 0.06 * Math.sin(now / 61) * Math.sin(now / 137)
    const core = ctx.createRadialGradient(c.x, c.y - r * 0.15, 0, c.x, c.y, r)
    core.addColorStop(0, `rgba(${pal.c0}, ${0.98 * flick})`)
    core.addColorStop(0.35, `rgba(${pal.c1}, ${0.95 * flick})`)
    core.addColorStop(0.8, `rgba(${pal.c2}, ${0.75 * flick})`)
    core.addColorStop(1, `rgba(${pal.c3}, 0)`)
    ctx.fillStyle = core
    ctx.beginPath()
    if (game.activeUniverse === 'emberlight') {
      // Wisps wander in the Coal's plane and are occluded by it.
      this.drawEmberlightWisps(now, r, reduced)
      this.drawEmberlightCoal(now, r, reduced)
    } else if (game.activeUniverse === 'verdance') {
      ctx.save()
      ctx.translate(c.x, c.y)
      ctx.rotate(-0.16)
      ctx.ellipse(0, 0, r * 0.78, r * 1.08, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = `rgba(${pal.mid}, 0.42)`
      ctx.lineWidth = 1.2
      ctx.beginPath()
      ctx.moveTo(0, -r * 0.72)
      ctx.bezierCurveTo(-r * 0.16, -r * 0.18, r * 0.14, r * 0.22, 0, r * 0.74)
      ctx.stroke()
      ctx.restore()
    } else {
      ctx.arc(c.x, c.y, r, 0, Math.PI * 2)
      ctx.fill()
      if (game.activeUniverse === 'clockwork') {
        ctx.save()
        ctx.translate(c.x, c.y)
        ctx.strokeStyle = `rgba(${pal.c0}, 0.56)`
        ctx.lineWidth = 1.15
        for (let tooth = 0; tooth < 15; tooth++) {
          const angle = (tooth / 15) * Math.PI * 2 - Math.PI / 2
          ctx.beginPath()
          ctx.moveTo(Math.cos(angle) * r * 0.72, Math.sin(angle) * r * 0.72)
          ctx.lineTo(Math.cos(angle) * r * 0.94, Math.sin(angle) * r * 0.94)
          ctx.stroke()
        }
        ctx.restore()
      } else if (game.activeUniverse === 'prismata') {
        ctx.save()
        ctx.translate(c.x, c.y)
        ctx.strokeStyle = `rgba(${pal.c0}, 0.7)`
        ctx.lineWidth = 1.3
        ctx.beginPath()
        ctx.ellipse(0, 0, r * 0.7, r * 1.04, -0.18, 0, Math.PI * 2)
        ctx.stroke()
        ctx.beginPath()
        ctx.ellipse(0, 0, r * 0.7, r * 1.04, 0.18, 0, Math.PI * 2)
        ctx.stroke()
        for (let band = -2; band <= 2; band++) {
          ctx.beginPath()
          ctx.moveTo(r * 0.55, band * r * 0.16)
          ctx.lineTo(r * 1.2, band * r * 0.28)
          ctx.stroke()
        }
        ctx.restore()
      } else if (game.activeUniverse === 'tempest') {
        ctx.save()
        ctx.strokeStyle = `rgba(${pal.c0}, 0.64)`
        ctx.lineWidth = 1.25
        for (let turn = 0; turn < 3; turn++) {
          ctx.beginPath()
          ctx.arc(c.x, c.y, r * (0.34 + turn * 0.22), -0.7 + turn * 0.4, 4.2 + turn * 0.3)
          ctx.stroke()
        }
        ctx.beginPath()
        ctx.moveTo(c.x, c.y + r * 0.25)
        ctx.lineTo(c.x - r * 0.18, c.y + r * 0.62)
        ctx.lineTo(c.x + r * 0.06, c.y + r * 0.52)
        ctx.lineTo(c.x - r * 0.08, c.y + r * 0.92)
        ctx.stroke()
        ctx.restore()
      } else if (game.activeUniverse === 'canticle') {
        ctx.save()
        ctx.translate(c.x, c.y)
        ctx.strokeStyle = `rgba(${pal.c0}, 0.65)`
        ctx.lineWidth = 1.15
        ctx.beginPath()
        for (let node = 0; node < 6; node++) {
          const angle = (node / 6) * Math.PI * 2 - Math.PI / 2
          const x = Math.cos(angle) * r * 0.72
          const y = Math.sin(angle) * r * 0.72
          if (node === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
          ctx.moveTo(x + 2, y)
          ctx.arc(x, y, 2, 0, Math.PI * 2)
        }
        ctx.closePath()
        ctx.stroke()
        ctx.beginPath()
        ctx.ellipse(0, 0, r * 0.78, r * 0.34, 0, 0, Math.PI * 2)
        ctx.stroke()
        ctx.restore()
      }
    }

    // beat rings — the click window made visible
    for (const born of this.rings) {
      const age = (now - born) / 650
      const accent = universeById(game.activeUniverse).palette.accentHue
      const strong = game.beatVisual === 'strong'
      ctx.beginPath()
      ctx.strokeStyle = `hsla(${accent}, ${strong ? 100 : 88}%, ${strong ? 82 : 72}%, ${(1 - age) * (strong ? 0.68 : 0.3)})`
      ctx.lineWidth = strong ? 3 : 1.5
      ctx.arc(c.x, c.y, r * (1.18 + age * (strong ? 1.25 : 1.5)), 0, Math.PI * 2)
      ctx.stroke()
    }
    this.drawQuasarTaps(now, collapseFade)

    // sparks
    for (const p of this.particles) {
      const fade = 1 - p.life / p.maxLife
      if (circleIntersectsHudClearance(p.x, p.y, p.size + 2, { width, height })) continue
      ctx.save()
      if (p.additive) ctx.globalCompositeOperation = 'lighter'
      if ((p.tail ?? 0) > 0) {
        const speed = Math.max(1, Math.hypot(p.vx, p.vy))
        const tail = (p.tail ?? 0) * fade
        ctx.strokeStyle = `hsla(${p.hue}, 100%, ${p.light}%, ${fade * 0.62})`
        ctx.lineWidth = Math.max(0.6, p.size * fade)
        ctx.lineCap = 'round'
        ctx.beginPath()
        ctx.moveTo(p.x, p.y)
        ctx.lineTo(p.x - (p.vx / speed) * tail, p.y - (p.vy / speed) * tail)
        ctx.stroke()
      }
      ctx.beginPath()
      ctx.fillStyle = `hsla(${p.hue}, 100%, ${p.light}%, ${fade})`
      ctx.arc(p.x, p.y, p.size * fade + 0.3, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()
    }

    this.applyScreenBloom(this.currentRenderProfile())

    // floating +N
    ctx.textAlign = 'center'
    ctx.font = '750 17px ui-sans-serif, system-ui, sans-serif'
    ctx.lineJoin = 'round'
    for (const f of this.floats) {
      const age = f.life / f.maxLife
      const fade = age < 0.62 ? 1 : 1 - (age - 0.62) / 0.38
      if (rectIntersectsHudClearance({
        x: f.x - 4.5 * f.text.length,
        y: f.y - 20,
        width: Math.max(28, 9 * f.text.length),
        height: 26,
      }, { width, height })) continue
      ctx.lineWidth = 4
      ctx.strokeStyle = `rgba(4, 5, 12, ${fade * 0.85})`
      ctx.strokeText(f.text, f.x, f.y)
      ctx.shadowBlur = 12
      ctx.shadowColor = `rgba(105, 235, 255, ${fade * 0.65})`
      ctx.fillStyle = `rgba(177, 245, 255, ${fade * 0.96})`
      ctx.fillText(f.text, f.x, f.y)
      ctx.shadowBlur = 0
    }
  }
}

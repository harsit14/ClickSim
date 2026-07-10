import { game, ratePerSec } from '../engine/game.svelte'
import { universeById } from '../content/universes'
import { currentBeatIndex } from '../audio/music'

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

const MAX_PARTICLES = 600

function mulberry32(seed: number) {
  return function () {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export class World {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private particles: Particle[] = []
  private floats: FloatText[] = []
  private quasarTaps: QuasarTap[] = []
  private glimmers = new Map<string, Glimmer[]>()
  private pulse = 0
  private driftAcc = 0
  private lastBeat = -1
  private rings: number[] = [] // birth timestamps (ms)
  private collapseStart = 0
  /** particle intensity scale — honors prefers-reduced-motion */
  private motion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 0.35 : 1
  private raf = 0
  private width = 0
  private height = 0
  private dpr = 1

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')!
    this.resize()
  }

  resize() {
    this.dpr = Math.min(window.devicePixelRatio || 1, 2)
    this.width = window.innerWidth
    this.height = window.innerHeight
    this.canvas.width = this.width * this.dpr
    this.canvas.height = this.height * this.dpr
    this.canvas.style.width = this.width + 'px'
    this.canvas.style.height = this.height + 'px'
  }

  get center() {
    return { x: this.width / 2, y: this.height * 0.48 }
  }

  /** Current visual radius of the ember core; grows with everything ever earned. */
  emberRadius(now: number): number {
    const growth = Math.pow(Math.log10(1 + game.totalEarned), 1.2) * 6
    const base = 24 + Math.min(growth, 70)
    const breath = 1 + 0.028 * Math.sin(now / 900) + 0.012 * Math.sin(now / 233)
    const squash = 1 + this.pulse * 0.16
    const swell = 1 + this.collapseProgress(now) * 1.4
    return base * breath * squash * swell
  }

  isOnEmber(x: number, y: number, now: number): boolean {
    const c = this.center
    const r = this.emberRadius(now) * 1.6
    return (x - c.x) ** 2 + (y - c.y) ** 2 <= r * r
  }

  clickPulse() {
    this.pulse = 1
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

    const count = Math.max(2, Math.round((crit ? 8 : 5) * this.motion))
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
  beginCollapse() {
    this.collapseStart = performance.now()
  }

  endCollapse() {
    this.collapseStart = 0
    this.particles = []
    this.glimmers.clear()
    this.rings = []
    this.quasarTaps = []
  }

  private collapseProgress(now: number): number {
    if (this.collapseStart === 0) return 0
    return Math.min(1, (now - this.collapseStart) / 2800)
  }

  /** The ember wears its answer: gold for the warden, red for the hunger,
   *  silver-blue for the one who stayed. */
  private palette() {
    if (game.activeUniverse === 'tidefall') {
      return { c0: '235, 255, 252', c1: '158, 244, 232', c2: '67, 190, 199', c3: '36, 91, 139', halo: '76, 220, 215', mid: '54, 145, 185' }
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

  burst(x: number, y: number) {
    const c = this.center
    const accent = universeById(game.activeUniverse).palette.accentHue
    const count = Math.max(3, Math.round((9 + Math.floor(Math.random() * 6)) * this.motion))
    for (let i = 0; i < count; i++) {
      const angle = Math.atan2(y - c.y, x - c.x) + (Math.random() - 0.5) * 2.4
      const speed = 60 + Math.random() * 160
      this.addParticle({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 40,
        life: 0,
        maxLife: 0.5 + Math.random() * 0.7,
        size: 1 + Math.random() * 2.4,
        hue: accent - 12 + Math.random() * 24,
        light: 55 + Math.random() * 40,
      })
    }
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
    this.floats.push({
      x: c.x + nx * startRadius + (Math.random() - 0.5) * 14,
      y: c.y + ny * startRadius - 8,
      vx: nx * 16 + (Math.random() - 0.5) * 12,
      vy: -76 - Math.random() * 18,
      life: 0,
      maxLife: 1.75,
      text,
    })
    if (this.floats.length > 40) this.floats.shift()
  }

  private addParticle(p: Particle) {
    if (this.particles.length >= MAX_PARTICLES) this.particles.shift()
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
    const want = Math.min(owned, 36)
    if (list.length < want) {
      let hash = 0
      for (const ch of cacheKey) hash = (hash * 31 + ch.charCodeAt(0)) | 0
      const rand = mulberry32(hash + list.length * 7919)
      // low tiers settle near the ground, middle tiers hang mid-void, stars fill the sky
      const [yMin, yMax] = tier <= 6 ? [0.62, 0.95] : tier <= 12 ? [0.3, 0.58] : [0.04, 0.26]
      while (list.length < want) {
        list.push({
          x: 0.05 + rand() * 0.9,
          y: yMin + rand() * (yMax - yMin),
          size: 1 + rand() * 2 + tier * 0.12,
          hue,
          phase: rand() * Math.PI * 2,
        })
      }
    }
    return list.slice(0, want)
  }

  private hasCuriosity(id: string): boolean {
    return game.curiosities.includes(id)
  }

  private drawCuriosities(now: number, fade: number) {
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
        const readable = game.allTimeEarned >= 1e30
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
      const dt = Math.min((now - last) / 1000, 0.1)
      last = now
      this.update(dt, now)
      this.draw(now)
      this.raf = requestAnimationFrame(frame)
    }
    this.raf = requestAnimationFrame(frame)
  }

  stop() {
    cancelAnimationFrame(this.raf)
  }

  private update(dt: number, now: number) {
    this.pulse = Math.max(0, this.pulse - dt * 6)

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
    const beat = currentBeatIndex()
    if (beat !== null && beat !== this.lastBeat) {
      this.lastBeat = beat
      this.rings.push(now)
    }
    this.rings = this.rings.filter((born) => now - born < 650)
    this.quasarTaps = this.quasarTaps.filter((tap) => now - tap.born < 760)

    // gentle motes rising from the ember while generators work
    const rate = ratePerSec()
    if (rate > 0) {
      this.driftAcc += dt * Math.min(5, 0.6 + Math.sqrt(rate) * 0.35) * this.motion
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
      p.vy += 20 * dt // faint gravity; rising motes still rise
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

    // your empire, glimmering in the dark (fading as it falls inward)
    const collapseFade = 1 - this.collapseProgress(now)
    for (const g of universeById(game.activeUniverse).generators) {
      const owned = game.owned[g.id] ?? 0
      if (owned <= 0) continue
      const ownedScale = 1 + Math.min(0.7, Math.log10(owned + 1) * 0.2)
      const tierScale = 1 + Math.min(0.25, g.tier * 0.012)
      for (const gl of this.glimmersFor(g.id, owned, g.hue, g.tier)) {
        const tw = 0.45 + 0.55 * (0.5 + 0.5 * Math.sin(now / 700 + gl.phase))
        const size = gl.size * ownedScale * tierScale
        ctx.beginPath()
        ctx.fillStyle = `hsla(${gl.hue}, 90%, 70%, ${0.31 * tw * collapseFade})`
        ctx.arc(gl.x * width, gl.y * height, size * tw + 0.4, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    // Vessel construction belongs to its dedicated panel; the playfield stays
    // focused on the central rhythm target.
    this.drawCuriosities(now, collapseFade)

    const c = this.center
    const r = this.emberRadius(now)

    // halo
    const pal = this.palette()
    const halo = ctx.createRadialGradient(c.x, c.y, r * 0.2, c.x, c.y, r * 4.2)
    halo.addColorStop(0, `rgba(${pal.halo}, 0.28)`)
    halo.addColorStop(0.5, `rgba(${pal.mid}, 0.07)`)
    halo.addColorStop(1, `rgba(${pal.mid}, 0)`)
    ctx.fillStyle = halo
    ctx.beginPath()
    ctx.arc(c.x, c.y, r * 4.2, 0, Math.PI * 2)
    ctx.fill()

    // core
    const flick = 0.94 + 0.06 * Math.sin(now / 61) * Math.sin(now / 137)
    const core = ctx.createRadialGradient(c.x, c.y - r * 0.15, 0, c.x, c.y, r)
    core.addColorStop(0, `rgba(${pal.c0}, ${0.98 * flick})`)
    core.addColorStop(0.35, `rgba(${pal.c1}, ${0.95 * flick})`)
    core.addColorStop(0.8, `rgba(${pal.c2}, ${0.75 * flick})`)
    core.addColorStop(1, `rgba(${pal.c3}, 0)`)
    ctx.fillStyle = core
    ctx.beginPath()
    ctx.arc(c.x, c.y, r, 0, Math.PI * 2)
    ctx.fill()

    // beat rings — the click window made visible
    for (const born of this.rings) {
      const age = (now - born) / 650
      const accent = universeById(game.activeUniverse).palette.accentHue
      ctx.beginPath()
      ctx.strokeStyle = `hsla(${accent}, 88%, 72%, ${(1 - age) * 0.3})`
      ctx.lineWidth = 1.5
      ctx.arc(c.x, c.y, r * (1.18 + age * 1.5), 0, Math.PI * 2)
      ctx.stroke()
    }
    this.drawQuasarTaps(now, collapseFade)

    // sparks
    for (const p of this.particles) {
      const fade = 1 - p.life / p.maxLife
      ctx.beginPath()
      ctx.fillStyle = `hsla(${p.hue}, 100%, ${p.light}%, ${fade})`
      ctx.arc(p.x, p.y, p.size * fade + 0.3, 0, Math.PI * 2)
      ctx.fill()
    }

    // floating +N
    ctx.textAlign = 'center'
    ctx.font = '750 17px ui-sans-serif, system-ui, sans-serif'
    ctx.lineJoin = 'round'
    for (const f of this.floats) {
      const age = f.life / f.maxLife
      const fade = age < 0.62 ? 1 : 1 - (age - 0.62) / 0.38
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

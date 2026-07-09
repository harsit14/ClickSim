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

  /** Supernova cutscene: everything falls into the ember. */
  beginCollapse() {
    this.collapseStart = performance.now()
  }

  endCollapse() {
    this.collapseStart = 0
    this.particles = []
    this.glimmers.clear()
    this.rings = []
  }

  private collapseProgress(now: number): number {
    if (this.collapseStart === 0) return 0
    return Math.min(1, (now - this.collapseStart) / 2800)
  }

  /** The ember wears its answer: gold for the warden, red for the hunger,
   *  silver-blue for the one who stayed. */
  private palette() {
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
        hue: 30 + Math.random() * 26,
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
    let list = this.glimmers.get(id)
    if (!list) {
      list = []
      this.glimmers.set(id, list)
    }
    const want = Math.min(owned, 36)
    if (list.length < want) {
      let hash = 0
      for (const ch of id) hash = (hash * 31 + ch.charCodeAt(0)) | 0
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

    if (this.hasCuriosity('aurora')) {
      const y = height * 0.15
      const drift = Math.sin(now / 3200) * 18
      const grad = ctx.createLinearGradient(0, y, width, y + 80)
      grad.addColorStop(0, 'rgba(65, 255, 210, 0)')
      grad.addColorStop(0.35, `rgba(85, 255, 210, ${0.12 * fade})`)
      grad.addColorStop(0.7, `rgba(170, 110, 255, ${0.12 * fade})`)
      grad.addColorStop(1, 'rgba(85, 170, 255, 0)')
      ctx.strokeStyle = grad
      ctx.lineWidth = 18
      ctx.beginPath()
      ctx.moveTo(width * -0.05, y + drift)
      ctx.bezierCurveTo(width * 0.25, y - 60, width * 0.55, y + 90, width * 1.05, y + 15 - drift)
      ctx.stroke()
    }

    if (this.hasCuriosity('glass-garden')) {
      const baseY = height * 0.91
      for (let i = 0; i < 9; i++) {
        const x = width * (0.28 + i * 0.055)
        const h = 18 + ((i * 17) % 29)
        const tw = 0.65 + 0.35 * Math.sin(now / 900 + i)
        ctx.fillStyle = `hsla(${250 + i * 7}, 90%, 76%, ${0.18 * tw * fade})`
        ctx.beginPath()
        ctx.moveTo(x, baseY)
        ctx.lineTo(x + 8, baseY - h)
        ctx.lineTo(x + 16, baseY)
        ctx.closePath()
        ctx.fill()
      }
    }

    if (this.hasCuriosity('chimes')) {
      const x = width * 0.18
      const y = height * 0.2
      ctx.strokeStyle = `rgba(210, 245, 255, ${0.22 * fade})`
      ctx.lineWidth = 1
      for (let i = 0; i < 4; i++) {
        const sway = Math.sin(now / 1200 + i) * 4
        ctx.beginPath()
        ctx.moveTo(x + i * 9, y)
        ctx.lineTo(x + i * 9 + sway, y + 32 + i * 3)
        ctx.stroke()
      }
    }

    if (this.hasCuriosity('door')) {
      const x = width * 0.76
      const y = height * 0.66
      const open = game.allTimeEarned >= 1e30
      ctx.fillStyle = open ? `rgba(255, 220, 130, ${0.11 * fade})` : `rgba(255, 210, 120, ${0.04 * fade})`
      ctx.strokeStyle = `rgba(255, 210, 120, ${0.28 * fade})`
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.roundRect(x, y, 34, 54, 5)
      ctx.fill()
      ctx.stroke()
      ctx.beginPath()
      ctx.arc(x + 25, y + 29, 2, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(255, 235, 170, ${0.7 * fade})`
      ctx.fill()
    }

    if (this.hasCuriosity('star-jar')) {
      const x = width * 0.2
      const y = height * 0.73
      const tw = 0.7 + 0.3 * Math.sin(now / 500)
      ctx.strokeStyle = `rgba(255, 235, 160, ${0.26 * fade})`
      ctx.fillStyle = `rgba(255, 235, 160, ${0.06 * fade})`
      ctx.beginPath()
      ctx.roundRect(x, y, 26, 36, 7)
      ctx.fill()
      ctx.stroke()
      ctx.fillStyle = `rgba(255, 240, 170, ${0.78 * tw * fade})`
      ctx.beginPath()
      ctx.arc(x + 13, y + 18, 3.5 + tw, 0, Math.PI * 2)
      ctx.fill()
    }

    if (this.hasCuriosity('letter')) {
      const x = width * 0.28
      const y = height * 0.68
      ctx.strokeStyle = `rgba(255, 226, 190, ${0.22 * fade})`
      ctx.fillStyle = `rgba(255, 226, 190, ${0.05 * fade})`
      ctx.beginPath()
      ctx.rect(x, y, 38, 24)
      ctx.fill()
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(x + 19, y + 13)
      ctx.lineTo(x + 38, y)
      ctx.stroke()
    }

    if (this.hasCuriosity('snail')) {
      const progress =
        game.snailLastGiftAt > 0 ? Math.min(1, (Date.now() - game.snailLastGiftAt) / (90 * 60 * 1000)) : 0
      const x = width * (0.09 + progress * 0.82)
      const y = height * 0.88
      ctx.fillStyle = `rgba(190, 255, 150, ${0.35 * fade})`
      ctx.beginPath()
      ctx.arc(x, y, 7, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = `rgba(255, 240, 150, ${0.45 * fade})`
      ctx.beginPath()
      ctx.arc(x + 8, y - 3, 3, 0, Math.PI * 2)
      ctx.fill()
    }

    if (this.hasCuriosity('orrery')) {
      const x = width * 0.84
      const y = height * 0.22
      ctx.strokeStyle = `rgba(255, 215, 130, ${0.2 * fade})`
      ctx.lineWidth = 1
      for (let i = 0; i < 3; i++) {
        ctx.beginPath()
        ctx.ellipse(x, y, 14 + i * 9, 5 + i * 4, now / 5000 + i, 0, Math.PI * 2)
        ctx.stroke()
      }
      ctx.fillStyle = `rgba(255, 230, 150, ${0.5 * fade})`
      ctx.beginPath()
      ctx.arc(x, y, 3, 0, Math.PI * 2)
      ctx.fill()
    }

    if (this.hasCuriosity('metronome-heart')) {
      const beat = 1 + 0.12 * Math.sin(now / 180)
      ctx.fillStyle = `rgba(255, 110, 180, ${0.26 * fade})`
      ctx.beginPath()
      ctx.arc(width * 0.72, height * 0.84, 5 * beat, 0, Math.PI * 2)
      ctx.arc(width * 0.735, height * 0.84, 5 * beat, 0, Math.PI * 2)
      ctx.fill()
    }

    if (this.hasCuriosity('moth')) {
      const orbit = this.emberRadius(now) * 2.1
      const angle = now / 2300
      const x = c.x + Math.cos(angle) * orbit
      const y = c.y + Math.sin(angle * 1.2) * orbit * 0.55
      ctx.fillStyle = `rgba(255, 230, 150, ${0.72 * fade})`
      ctx.beginPath()
      ctx.ellipse(x - 3, y, 4, 2, -0.6, 0, Math.PI * 2)
      ctx.ellipse(x + 3, y, 4, 2, 0.6, 0, Math.PI * 2)
      ctx.fill()
    }

    if (this.hasCuriosity('second-cursor')) {
      const orbit = this.emberRadius(now) * 1.85
      const tap = 0.5 + 0.5 * Math.sin(now / 420)
      const x = c.x + Math.cos(now / 1700) * orbit * 0.7
      const y = c.y + Math.sin(now / 1700) * orbit * 0.45 + tap * 6
      ctx.strokeStyle = `rgba(185, 230, 255, ${0.35 * fade})`
      ctx.lineWidth = 1.4
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(x + 15, y + 22)
      ctx.lineTo(x + 3, y + 18)
      ctx.lineTo(x - 3, y + 31)
      ctx.stroke()
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

    // gentle motes rising from the ember while generators work
    const rate = ratePerSec()
    if (rate > 0) {
      this.driftAcc += dt * Math.min(5, 0.6 + Math.sqrt(rate) * 0.35) * this.motion
      while (this.driftAcc >= 1) {
        this.driftAcc -= 1
        const c = this.center
        const r = this.emberRadius(now)
        const angle = Math.random() * Math.PI * 2
        this.addParticle({
          x: c.x + Math.cos(angle) * r * 0.9,
          y: c.y + Math.sin(angle) * r * 0.9,
          vx: (Math.random() - 0.5) * 14,
          vy: -20 - Math.random() * 25,
          life: 0,
          maxLife: 2.5 + Math.random() * 2.5,
          size: 0.8 + Math.random() * 1.6,
          hue: 32 + Math.random() * 24,
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
      ctx.beginPath()
      ctx.strokeStyle = `rgba(255, 190, 110, ${(1 - age) * 0.3})`
      ctx.lineWidth = 1.5
      ctx.arc(c.x, c.y, r * (1.18 + age * 1.5), 0, Math.PI * 2)
      ctx.stroke()
    }

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

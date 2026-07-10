let ctx: AudioContext | null = null
let master: GainNode | null = null
let volume = 0.5

export function setMasterVolume(v: number) {
  volume = Math.max(0, Math.min(1, v))
  if (master) master.gain.value = volume
}

/** Shared context for other audio modules (music engine). */
export function getAudio(): { ctx: AudioContext; master: GainNode } | null {
  return audio()
}

function audio(): { ctx: AudioContext; master: GainNode } | null {
  try {
    if (!ctx) {
      ctx = new AudioContext()
      master = ctx.createGain()
      master.gain.value = volume
      master.connect(ctx.destination)
    }
    if (ctx.state === 'suspended') void ctx.resume()
    return { ctx, master: master! }
  } catch {
    return null
  }
}

/** Warm, woody thump — pitch-randomized so rapid clicking never grates. */
export function playClick(mode: 'emberlight' | 'tidefall' = 'emberlight') {
  if (mode === 'tidefall') {
    playTidefallClick()
    return
  }
  const a = audio()
  if (!a) return
  const t = a.ctx.currentTime
  const base = 165 * (0.97 + Math.random() * 0.06)

  const osc = a.ctx.createOscillator()
  const gain = a.ctx.createGain()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(base * 2.2, t)
  osc.frequency.exponentialRampToValueAtTime(base, t + 0.055)
  gain.gain.setValueAtTime(0.5, t)
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1)
  osc.connect(gain).connect(a.master)
  osc.start(t)
  osc.stop(t + 0.12)

  // a whisper of crackle on top
  const len = Math.floor(a.ctx.sampleRate * 0.03)
  const buf = a.ctx.createBuffer(1, len, a.ctx.sampleRate)
  const ch = buf.getChannelData(0)
  for (let i = 0; i < len; i++) ch[i] = (Math.random() * 2 - 1) * (1 - i / len)
  const noise = a.ctx.createBufferSource()
  noise.buffer = buf
  const nGain = a.ctx.createGain()
  nGain.gain.setValueAtTime(0.06, t)
  const filter = a.ctx.createBiquadFilter()
  filter.type = 'highpass'
  filter.frequency.value = 3000
  noise.connect(filter).connect(nGain).connect(a.master)
  noise.start(t)
}

/** A rounded droplet with a soft underwater pressure tail. */
function playTidefallClick() {
  const a = audio()
  if (!a) return
  const t = a.ctx.currentTime
  const base = 210 * (0.96 + Math.random() * 0.08)

  const drop = a.ctx.createOscillator()
  const dropGain = a.ctx.createGain()
  drop.type = 'sine'
  drop.frequency.setValueAtTime(base * 3.1, t)
  drop.frequency.exponentialRampToValueAtTime(base, t + 0.11)
  dropGain.gain.setValueAtTime(0.0001, t)
  dropGain.gain.exponentialRampToValueAtTime(0.38, t + 0.008)
  dropGain.gain.exponentialRampToValueAtTime(0.001, t + 0.19)
  drop.connect(dropGain).connect(a.master)
  drop.start(t)
  drop.stop(t + 0.21)

  const pressure = a.ctx.createOscillator()
  const pressureGain = a.ctx.createGain()
  pressure.type = 'triangle'
  pressure.frequency.setValueAtTime(base * 0.72, t)
  pressure.frequency.exponentialRampToValueAtTime(48, t + 0.2)
  pressureGain.gain.setValueAtTime(0.12, t)
  pressureGain.gain.exponentialRampToValueAtTime(0.001, t + 0.24)
  const filter = a.ctx.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.value = 520
  pressure.connect(filter).connect(pressureGain).connect(a.master)
  pressure.start(t)
  pressure.stop(t + 0.26)
}

/** Soft two-note purchase chime. */
export function playBuy() {
  const a = audio()
  if (!a) return
  const t = a.ctx.currentTime
  const notes = [523.25, 783.99]
  notes.forEach((freq, i) => {
    const osc = a.ctx.createOscillator()
    const gain = a.ctx.createGain()
    osc.type = 'triangle'
    osc.frequency.value = freq
    const start = t + i * 0.07
    gain.gain.setValueAtTime(0.0001, start)
    gain.gain.exponentialRampToValueAtTime(0.18, start + 0.015)
    gain.gain.exponentialRampToValueAtTime(0.001, start + 0.35)
    osc.connect(gain).connect(a.master)
    osc.start(start)
    osc.stop(start + 0.4)
  })
}

/** The supernova: a deep boom, then a long shimmering bloom. */
export function playSupernova() {
  const a = audio()
  if (!a) return
  const t = a.ctx.currentTime
  // sub boom
  const boom = a.ctx.createOscillator()
  const boomGain = a.ctx.createGain()
  boom.type = 'sine'
  boom.frequency.setValueAtTime(110, t)
  boom.frequency.exponentialRampToValueAtTime(28, t + 1.6)
  boomGain.gain.setValueAtTime(0.5, t)
  boomGain.gain.exponentialRampToValueAtTime(0.001, t + 2.2)
  boom.connect(boomGain).connect(a.master)
  boom.start(t)
  boom.stop(t + 2.3)
  // shimmer chord blooming out of the blast
  const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5]
  notes.forEach((freq, i) => {
    const osc = a.ctx.createOscillator()
    const gain = a.ctx.createGain()
    osc.type = 'sine'
    osc.frequency.value = freq
    const start = t + 0.5 + i * 0.16
    gain.gain.setValueAtTime(0.0001, start)
    gain.gain.exponentialRampToValueAtTime(0.09, start + 0.3)
    gain.gain.exponentialRampToValueAtTime(0.001, start + 2.6)
    osc.connect(gain).connect(a.master)
    osc.start(start)
    osc.stop(start + 2.8)
  })
}

/** Sparkling ascent for catching a falling star. */
export function playStarCatch(mode: 'emberlight' | 'tidefall' = 'emberlight') {
  if (mode === 'tidefall') {
    playTidefallCatch()
    return
  }
  const a = audio()
  if (!a) return
  const t = a.ctx.currentTime
  const notes = [659.25, 830.61, 987.77, 1318.5]
  notes.forEach((freq, i) => {
    const osc = a.ctx.createOscillator()
    const gain = a.ctx.createGain()
    osc.type = 'triangle'
    osc.frequency.value = freq
    const start = t + i * 0.05
    gain.gain.setValueAtTime(0.0001, start)
    gain.gain.exponentialRampToValueAtTime(0.14, start + 0.012)
    gain.gain.exponentialRampToValueAtTime(0.001, start + 0.5)
    osc.connect(gain).connect(a.master)
    osc.start(start)
    osc.stop(start + 0.55)
  })
}

/** Bubble-pop cascade for Tidefall's wandering blessings. */
function playTidefallCatch() {
  const a = audio()
  if (!a) return
  const t = a.ctx.currentTime
  const notes = [392, 329.63, 261.63, 196]
  notes.forEach((freq, index) => {
    const osc = a.ctx.createOscillator()
    const gain = a.ctx.createGain()
    osc.type = 'sine'
    const start = t + index * 0.055
    osc.frequency.setValueAtTime(freq * 1.8, start)
    osc.frequency.exponentialRampToValueAtTime(freq, start + 0.18)
    gain.gain.setValueAtTime(0.0001, start)
    gain.gain.exponentialRampToValueAtTime(0.13, start + 0.008)
    gain.gain.exponentialRampToValueAtTime(0.001, start + 0.48)
    osc.connect(gain).connect(a.master)
    osc.start(start)
    osc.stop(start + 0.52)
  })
}

/** Two-bell shimmer for an achievement. */
export function playAchievement() {
  const a = audio()
  if (!a) return
  const t = a.ctx.currentTime
  const notes = [1046.5, 1568.0]
  notes.forEach((freq, i) => {
    for (const det of [0, 7]) {
      const osc = a.ctx.createOscillator()
      const gain = a.ctx.createGain()
      osc.type = 'sine'
      osc.frequency.value = freq
      osc.detune.value = det
      const start = t + i * 0.12
      gain.gain.setValueAtTime(0.0001, start)
      gain.gain.exponentialRampToValueAtTime(0.1, start + 0.01)
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.9)
      osc.connect(gain).connect(a.master)
      osc.start(start)
      osc.stop(start + 1)
    }
  })
}

/** Rising bloom for assembling a new piece of the interface. */
export function playBloom() {
  const a = audio()
  if (!a) return
  const t = a.ctx.currentTime
  const notes = [392.0, 493.88, 587.33, 783.99]
  notes.forEach((freq, i) => {
    const osc = a.ctx.createOscillator()
    const gain = a.ctx.createGain()
    osc.type = 'sine'
    osc.frequency.value = freq
    const start = t + i * 0.09
    gain.gain.setValueAtTime(0.0001, start)
    gain.gain.exponentialRampToValueAtTime(0.16, start + 0.04)
    gain.gain.exponentialRampToValueAtTime(0.001, start + 1.1)
    osc.connect(gain).connect(a.master)
    osc.start(start)
    osc.stop(start + 1.2)
  })
}

/** Low, warm swell for the welcome-back collect. */
export function playCollect() {
  const a = audio()
  if (!a) return
  const t = a.ctx.currentTime
  const notes = [261.63, 329.63, 392.0]
  notes.forEach((freq, i) => {
    const osc = a.ctx.createOscillator()
    const gain = a.ctx.createGain()
    osc.type = 'sine'
    osc.frequency.value = freq
    const start = t + i * 0.05
    gain.gain.setValueAtTime(0.0001, start)
    gain.gain.exponentialRampToValueAtTime(0.14, start + 0.05)
    gain.gain.exponentialRampToValueAtTime(0.001, start + 0.9)
    osc.connect(gain).connect(a.master)
    osc.start(start)
    osc.stop(start + 1)
  })
}

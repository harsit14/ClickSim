<script lang="ts">
  import { onMount } from 'svelte'
  import { game, hasUi, earn, passiveRatePerSec } from '../engine/game.svelte'
  import { addBuff } from '../systems/buffs.svelte'
  import { fallingStarState, summonFallingStar } from '../systems/falling-stars.svelte'
  import { pushToast } from '../systems/toasts.svelte'
  import { perkBonus } from '../content/constellation'
  import { CHALLENGE_BY_ID } from '../content/challenges'
  import { playStarCatch } from '../audio/sfx'
  import { format } from '../core/format'
  import { gamePaused } from '../core/pause.svelte'
  import { curiosityStarRateBonus } from '../content/curiosities'
  import { universeById } from '../content/universes'
  import type { UniversePowerUp } from '../content/universes'
  import type { EconomyAmount } from '../content/universes/types'
  import {
    ZERO_AMOUNT,
    amountFromNumber,
    isZeroAmount,
    maxAmount,
    multiplyAmountByNumber,
  } from '../core/numeric/amount'

  const LIFETIME_MS = 18_000
  // sky constellation perks: more frequent stars, longer blessings, star pairs
  // (plus the permanent Drought-trial reward)
  const rateScale = () =>
    1 /
    (1 +
      perkBonus(game.constellation, 'starRate') +
      (game.challengesDone.includes('drought') ? 0.2 : 0) +
      (game.curiosities.includes('star-jar') ? universeById(game.activeUniverse).cabinet.starItemRateBonus : 0) +
      curiosityStarRateBonus(game.curiosities, universeById(game.activeUniverse).cabinet))
  const durScale = () => 1 + perkBonus(game.constellation, 'starDuration')
  const starsForbidden = () => {
    const c = game.challenge ? CHALLENGE_BY_ID.get(game.challenge) : null
    return !!(c?.mods.noStars || c?.mods.silence || !universeById(game.activeUniverse).twist.randomnessAllowed)
  }
  const FIRST_DELAY = () => (20_000 + Math.random() * 25_000) * rateScale()
  const NEXT_DELAY = () => (90_000 + Math.random() * 150_000) * rateScale()

  interface Star {
    universeId: string
    power: UniversePowerUp
    motion: 'meteor' | 'bubble'
    eventNoun: string
    audioMode: 'emberlight' | 'tidefall'
    x: number
    y: number
    vx: number
    vy: number
    born: number
  }

  let star = $state<Star | null>(null)
  let pos = $state({ x: 0, y: 0 })
  let spawnTimer: ReturnType<typeof setTimeout>
  let raf = 0
  let handledSummons = $state(0)
  let queuedSummon = $state(false)
  let forcedPowerId = import.meta.env.DEV ? new URLSearchParams(window.location.search).get('event') : null

  function pickPower(fromRhythm = false): UniversePowerUp {
    const powers = universeById(game.activeUniverse).events.powerUps
    if (forcedPowerId) {
      const forced = powers.find((power) => power.id === forcedPowerId)
      forcedPowerId = null
      if (forced) return forced
    }
    const pool = powers.map((power) => ({
      power,
      weight: power.weight * (fromRhythm && power.weight <= 10 ? 2.5 : 1),
    }))
    const total = pool.reduce((sum, entry) => sum + entry.weight, 0)
    let roll = Math.random() * total
    for (const entry of pool) {
      roll -= entry.weight
      if (roll <= 0) return entry.power
    }
    return powers[0]
  }

  function spawn(fromRhythm = false) {
    if (!hasUi('shop') || document.hidden || starsForbidden() || gamePaused()) {
      queuedSummon ||= fromRhythm
      spawnTimer = setTimeout(spawn, gamePaused() ? 1_000 : 30_000)
      return
    }
    const pack = universeById(game.activeUniverse)
    const fromLeft = Math.random() < 0.5
    const bubble = pack.events.motion === 'bubble'
    const next = {
      power: pickPower(fromRhythm),
      universeId: pack.id,
      motion: pack.events.motion,
      eventNoun: pack.events.noun,
      audioMode: pack.audio.event,
      x: bubble ? window.innerWidth * (0.18 + Math.random() * 0.64) : fromLeft ? -30 : window.innerWidth + 30,
      y: bubble ? window.innerHeight + 30 : 40 + Math.random() * window.innerHeight * 0.3,
      vx: bubble ? (fromLeft ? 1 : -1) * (5 + Math.random() * 8) : (fromLeft ? 1 : -1) * (45 + Math.random() * 35),
      vy: bubble ? -(36 + Math.random() * 18) : 18 + Math.random() * 18,
      born: performance.now(),
    }
    star = next
    pos = { x: next.x, y: next.y }
    animate()
  }

  function scheduleNext() {
    if (queuedSummon) {
      queuedSummon = false
      spawnTimer = setTimeout(() => spawn(true), 1_200)
    } else {
      spawnTimer = setTimeout(spawn, NEXT_DELAY())
    }
  }

  function animate() {
    cancelAnimationFrame(raf)
    let last = performance.now()
    const frame = (now: number) => {
      if (!star) return
      if (star.universeId !== game.activeUniverse) {
        star = null
        scheduleNext()
        return
      }
      const elapsed = now - last
      last = now
      if (gamePaused()) {
        star.born += elapsed
        raf = requestAnimationFrame(frame)
        return
      }
      const dt = elapsed / 1000
      star.x += star.vx * dt
      star.y += star.vy * dt
      pos = { x: star.x, y: star.y }
      const leftWorld = star.motion === 'bubble' ? star.y < -50 : star.y > window.innerHeight + 40
      if (now - star.born > LIFETIME_MS || leftWorld) {
        star = null
        scheduleNext()
        return
      }
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
  }

  function catchStar(event?: Event) {
    event?.preventDefault()
    event?.stopPropagation()
    if (!star || gamePaused()) return
    const caught = star
    const power = caught.power
    star = null
    cancelAnimationFrame(raf)
    game.starsCaught += 1
    playStarCatch(caught.audioMode)
    const pack = universeById(caught.universeId)
    const duration = power.durationSec ? Math.round(power.durationSec * durScale()) : 0
    if (duration > 0) {
      addBuff(
        {
          id: `${pack.id}-${power.id}`,
          label: `${power.label} ${power.glyph}`,
          prodMult: power.prodMult ?? 1,
          clickMult: power.clickMult ?? 1,
        },
        duration,
      )
    }
    let amount: EconomyAmount = ZERO_AMOUNT
    if (power.rateSeconds) {
      amount = maxAmount(
        amountFromNumber(power.minAward ?? 0),
        multiplyAmountByNumber(passiveRatePerSec(), power.rateSeconds),
      )
      earn(amount)
    }
    let message = power.toast.replaceAll('{currency}', pack.currency.toLowerCase())
    if (!isZeroAmount(amount)) message += ` ${pack.currencyGlyph} ${format(amount)} gathered.`
    if (duration > 0) message += ` ${duration} seconds.`
    pushToast(power.label, message, caught.eventNoun)
    if (Math.random() < perkBonus(game.constellation, 'starPair') && summonFallingStar()) {
      pushToast('A paired omen', `Another ${caught.eventNoun} follows the first.`, 'constellation')
    }
    scheduleNext()
  }

  $effect(() => {
    if (fallingStarState.pendingSummons <= handledSummons) return
    handledSummons = fallingStarState.pendingSummons
    if (star) {
      queuedSummon = true
      return
    }
    clearTimeout(spawnTimer)
    spawn(true)
  })

  onMount(() => {
    spawnTimer = setTimeout(spawn, forcedPowerId ? 650 : FIRST_DELAY())
    return () => {
      clearTimeout(spawnTimer)
      cancelAnimationFrame(raf)
    }
  })
</script>

{#if star}
  {@const power = star.power}
  <button
    class="falling-star"
    class:bubble={star.motion === 'bubble'}
    style:left={pos.x + 'px'}
    style:top={pos.y + 'px'}
    style:--hue={power.hue}
    onpointerdown={catchStar}
    onclick={catchStar}
    aria-label={`catch ${power.label} power-up`}
    title={power.label}
  >
    <span class="core">
      <span class="glyph">{power.glyph}</span>
      <span class="label">{power.label}</span>
    </span>
  </button>
{/if}

<style>
  .falling-star {
    position: fixed;
    width: 6.6rem;
    height: 3.8rem;
    margin: -1.9rem -3.3rem;
    display: grid;
    place-items: center;
    padding: 0;
    font-size: 1.05rem;
    color: #fff6dd;
    background: transparent;
    border: none;
    border-radius: 999px;
    cursor: pointer;
    z-index: 8;
    font: inherit;
  }
  .falling-star::before {
    content: '';
    position: absolute;
    right: 50%;
    width: 4.8rem;
    height: 0.28rem;
    border-radius: 999px;
    background: linear-gradient(90deg, transparent, hsla(var(--hue), 95%, 72%, 0.62));
    filter: blur(1px);
    pointer-events: none;
  }
  .falling-star.bubble::before {
    right: auto;
    width: 3.1rem;
    height: 3.1rem;
    border: 1px solid hsla(var(--hue), 88%, 76%, 0.34);
    border-radius: 50%;
    background: radial-gradient(circle at 35% 30%, rgba(255,255,255,0.18), transparent 24%), radial-gradient(circle, hsla(var(--hue), 78%, 56%, 0.08), transparent 68%);
    filter: none;
    animation: bubble-ring 2.2s ease-in-out infinite;
  }
  .falling-star.bubble .core {
    background:
      radial-gradient(circle at 34% 25%, rgba(255,255,255,0.55), transparent 17%),
      radial-gradient(circle at 50% 60%, hsla(var(--hue), 86%, 68%, 0.23), rgba(5,30,48,0.2) 64%);
    border-color: hsla(var(--hue), 86%, 78%, 0.62);
    box-shadow: inset 0 0 12px rgba(255,255,255,0.12), 0 0 22px hsla(var(--hue), 84%, 62%, 0.38);
    animation: bubble-float 1.8s ease-in-out infinite alternate;
  }
  .core {
    position: relative;
    width: 2.6rem;
    height: 2.6rem;
    display: grid;
    place-items: center;
    grid-template-rows: 1fr auto;
    gap: 0;
    padding: 0.3rem 0.15rem 0.22rem;
    background:
      radial-gradient(circle at 50% 42%, rgba(255, 255, 255, 0.38), transparent 35%),
      radial-gradient(circle, hsla(var(--hue), 95%, 68%, 0.34), transparent 72%);
    border: 1px solid hsla(var(--hue), 95%, 72%, 0.5);
    border-radius: 50%;
    pointer-events: none;
    text-shadow:
      0 0 10px rgba(255, 230, 160, 0.95),
      0 0 30px hsla(var(--hue), 90%, 62%, 0.7);
    box-shadow:
      0 0 18px hsla(var(--hue), 95%, 68%, 0.55),
      0 0 38px hsla(var(--hue), 95%, 58%, 0.25);
    animation: twinkle 0.8s ease-in-out infinite alternate;
  }
  .glyph {
    align-self: end;
    font-size: 0.86rem;
    font-weight: 800;
    line-height: 1;
    color: #fff9e8;
    font-variant-numeric: tabular-nums;
  }
  .label {
    align-self: start;
    max-width: 2.2rem;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 0.47rem;
    font-weight: 700;
    line-height: 1;
    color: rgba(255, 246, 221, 0.88);
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }
  @keyframes twinkle {
    from { transform: scale(0.85) rotate(-8deg); }
    to { transform: scale(1.15) rotate(8deg); }
  }
  @keyframes bubble-ring {
    0%, 100% { transform: scale(0.82); opacity: 0.42; }
    50% { transform: scale(1.18); opacity: 0.82; }
  }
  @keyframes bubble-float {
    from { transform: translateY(2px) scale(0.92); }
    to { transform: translateY(-3px) scale(1.07); }
  }
</style>

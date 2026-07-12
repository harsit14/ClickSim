<script lang="ts">
  import { onMount } from 'svelte'
  import { game, hasUi, earn, passiveRatePerSec } from '../engine/game.svelte'
  import { addBuff } from '../systems/buffs.svelte'
  import { fallingStarState, resetOmenAttraction, summonFallingStar } from '../systems/falling-stars.svelte'
  import { pushToast } from '../systems/toasts.svelte'
  import { perkBonus } from '../content/constellation'
  import { CHALLENGE_BY_ID } from '../content/challenges'
  import { playOmenApproach, playStarCatch } from '../audio/sfx'
  import { format } from '../core/format'
  import { gamePaused } from '../core/pause.svelte'
  import { curiosityStarRateBonus } from '../content/curiosities'
  import {
    planPowerUpSpawn,
    type PowerUpEntryEdge,
    type PowerUpSpawnPlan,
  } from '../systems/power-up-spawn'
  import {
    OMEN_ANNOUNCEMENT_MS,
    OMEN_MISS_BANK_RATIO,
    OMEN_MIN_HIT_SIZE_PX,
    planOmenReward,
    positionOnOmenArc,
  } from '../systems/omen-v2'
  import { universeById } from '../content/universes'
  import type { UniversePowerUp } from '../content/universes'
  import type { EconomyAmount, UniverseId } from '../content/universes/types'
  import {
    hudClearanceRect,
    rectIntersectsHudClearance,
  } from '../render/hud-clearance'
  import {
    heartMaximumHitRadius,
    heartTargetCenter,
    rectIntersectsHeartTarget,
  } from '../render/heart-target'
  import {
    ZERO_AMOUNT,
    amountFromNumber,
    isZeroAmount,
    maxAmount,
    multiplyAmountByNumber,
  } from '../core/numeric/amount'
  import { worldRef } from '../render/world-ref'

  let { reserveShop = false, resetToken = 0 }: { reserveShop?: boolean; resetToken?: number } = $props()

  const EVENT_HALF_WIDTH = 3.3 * 16
  const EVENT_HALF_HEIGHT = 1.9 * 16
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
    phase: 'announcing' | 'active'
    universeId: string
    power: UniversePowerUp
    motion: 'meteor' | 'bubble'
    eventNoun: string
    audioMode: UniverseId
    entryEdge: PowerUpEntryEdge
    route: PowerUpSpawnPlan
    x: number
    y: number
    travelAngleRad: number
    announcedAt: number
    born: number
  }

  interface BankedEmbers {
    x: number
    y: number
    hue: number
    label: string
  }

  let star = $state<Star | null>(null)
  let pos = $state({ x: 0, y: 0 })
  let spawnTimer: ReturnType<typeof setTimeout>
  let raf = 0
  let handledSummons = $state(0)
  let queuedSummon = $state(false)
  let announcementRemaining = $state(5)
  let bankedEmbers = $state<BankedEmbers | null>(null)
  let bankedEmberTimer: ReturnType<typeof setTimeout>
  let forcedPowerId = import.meta.env.DEV ? new URLSearchParams(window.location.search).get('event') : null
  let forcedEntry = import.meta.env.DEV ? new URLSearchParams(window.location.search).get('entry') : null
  let attractionUniverse = $state(game.activeUniverse)
  let handledResetToken = $state(0)

  function availableRightEdge(viewportWidth = window.innerWidth): number {
    if (!reserveShop) return viewportWidth
    const shop = document.querySelector<HTMLElement>('[aria-label="Kindling shop"]')
    if (!shop) return viewportWidth
    const rect = shop.getBoundingClientRect()
    return rect.left < viewportWidth
      ? Math.max(0, rect.left - 24)
      : viewportWidth
  }

  $effect(() => {
    if (attractionUniverse === game.activeUniverse) return
    attractionUniverse = game.activeUniverse
    resetOmenAttraction()
  })

  $effect(() => {
    if (resetToken === handledResetToken) return
    handledResetToken = resetToken
    clearTimeout(spawnTimer)
    clearTimeout(bankedEmberTimer)
    cancelAnimationFrame(raf)
    star = null
    bankedEmbers = null
    queuedSummon = false
    handledSummons = fallingStarState.pendingSummons
    delete document.documentElement.dataset.omenArrival
    spawnTimer = setTimeout(spawn, FIRST_DELAY())
  })

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
    const viewport = { width: window.innerWidth, height: window.innerHeight }
    const clearance = hudClearanceRect(viewport)
    const heartCenter = heartTargetCenter(viewport)
    const heartClearance = heartMaximumHitRadius(viewport)
    const protectedLeft = Math.min(clearance.x, heartCenter.x - heartClearance)
    const protectedRight = Math.max(clearance.x + clearance.width, heartCenter.x + heartClearance)
    const forcedEdgeRoll = forcedEntry === 'top' ? 0.1
      : forcedEntry === 'bottom' ? 0.55
        : forcedEntry === 'left' ? 0.78
          : forcedEntry === 'right' ? 0.92
            : Math.random()
    forcedEntry = null
    const entry = planPowerUpSpawn({
      viewportWidth: viewport.width,
      viewportHeight: viewport.height,
      eventHalfWidth: EVENT_HALF_WIDTH,
      eventHalfHeight: EVENT_HALF_HEIGHT,
      protectedLeft,
      protectedRight,
      protectedTop: clearance.y + clearance.height,
      protectedHeartTop: heartCenter.y - heartClearance,
      reservedRight: availableRightEdge(viewport.width),
      edgeRoll: forcedEdgeRoll,
      laneRoll: Math.random(),
      positionRoll: Math.random(),
      speedRoll: Math.random(),
      driftRoll: Math.random(),
    })
    const next = {
      phase: 'announcing' as const,
      power: pickPower(fromRhythm),
      universeId: pack.id,
      motion: pack.events.motion,
      eventNoun: pack.events.noun,
      audioMode: pack.audio.event,
      entryEdge: entry.edge,
      route: entry,
      x: entry.x,
      y: entry.y,
      travelAngleRad: entry.travelAngleRad,
      announcedAt: performance.now(),
      born: 0,
    }
    star = next
    pos = { x: next.x, y: next.y }
    announcementRemaining = OMEN_ANNOUNCEMENT_MS / 1_000
    document.documentElement.dataset.omenArrival = pack.id
    playOmenApproach(pack.audio.event)
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
        delete document.documentElement.dataset.omenArrival
        star = null
        scheduleNext()
        return
      }
      const elapsed = now - last
      last = now
      if (gamePaused()) {
        if (star.phase === 'announcing') star.announcedAt += elapsed
        else star.born += elapsed
        raf = requestAnimationFrame(frame)
        return
      }
      if (star.phase === 'announcing') {
        const remainingMs = Math.max(0, OMEN_ANNOUNCEMENT_MS - (now - star.announcedAt))
        announcementRemaining = Math.max(1, Math.ceil(remainingMs / 1_000))
        if (remainingMs > 0) {
          raf = requestAnimationFrame(frame)
          return
        }
        star.phase = 'active'
        star.born = now
        delete document.documentElement.dataset.omenArrival
      }
      const routeProgress = (now - star.born) / star.route.durationMs
      const point = positionOnOmenArc(star.route, routeProgress)
      star.x = point.x
      star.y = point.y
      const rightEdge = availableRightEdge()
      if (star.x + EVENT_HALF_WIDTH > rightEdge) {
        star.x = rightEdge - EVENT_HALF_WIDTH
      }
      const eventRect = {
        x: star.x - EVENT_HALF_WIDTH,
        y: star.y - EVENT_HALF_HEIGHT,
        width: EVENT_HALF_WIDTH * 2,
        height: EVENT_HALF_HEIGHT * 2,
      }
      const viewport = { width: window.innerWidth, height: window.innerHeight }
      if (
        rectIntersectsHudClearance(eventRect, viewport)
        || rectIntersectsHeartTarget(eventRect, viewport)
      ) {
        missStar()
        return
      }
      pos = { x: star.x, y: star.y }
      if (point.progress >= 1) {
        missStar()
        return
      }
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
  }

  function applyReward(caught: Star, rewardRatio: number, missed = false) {
    const power = caught.power
    const pack = universeById(caught.universeId)
    const reward = planOmenReward(power, durScale(), rewardRatio)
    if (reward.durationSeconds > 0) {
      addBuff(
        {
          id: `${pack.id}-${power.id}${missed ? '-banked' : ''}`,
          label: `${missed ? 'Banked ' : ''}${power.label} ${power.glyph}`,
          prodMult: power.prodMult ?? 1,
          clickMult: power.clickMult ?? 1,
        },
        reward.durationSeconds,
      )
    }
    let amount: EconomyAmount = ZERO_AMOUNT
    if (reward.rateSeconds > 0) {
      amount = maxAmount(
        amountFromNumber((power.minAward ?? 0) * reward.rewardRatio),
        multiplyAmountByNumber(passiveRatePerSec(), reward.rateSeconds),
      )
      earn(amount)
    }
    if (missed) {
      let message = `The ${caught.eventNoun} passed. A quarter of its reward remains along the route.`
      if (!isZeroAmount(amount)) message += ` ${pack.currencyGlyph} ${format(amount)} banked.`
      if (reward.durationSeconds > 0) message += ` ${reward.durationSeconds} seconds banked.`
      pushToast('Omen banked', message, caught.eventNoun)
      return reward
    }
    let message = power.toast.replaceAll('{currency}', pack.currency.toLowerCase())
    if (!isZeroAmount(amount)) message += ` ${pack.currencyGlyph} ${format(amount)} gathered.`
    if (reward.durationSeconds > 0) message += ` ${reward.durationSeconds} seconds.`
    pushToast(power.label, message, caught.eventNoun)
    return reward
  }

  function missStar() {
    if (!star || star.phase !== 'active') return
    const missed = star
    star = null
    cancelAnimationFrame(raf)
    const groundX = Math.max(OMEN_MIN_HIT_SIZE_PX, Math.min(availableRightEdge() - OMEN_MIN_HIT_SIZE_PX, missed.x))
    const groundY = window.innerHeight - 38
    worldRef()?.emitParticleRecipe('omen', groundX, groundY)
    const reward = applyReward(missed, OMEN_MISS_BANK_RATIO, true)
    bankedEmbers = { x: groundX, y: groundY, hue: missed.power.hue, label: missed.power.label }
    clearTimeout(bankedEmberTimer)
    bankedEmberTimer = setTimeout(() => { bankedEmbers = null }, Math.max(8_000, reward.durationSeconds * 1_000))
    scheduleNext()
  }

  function catchStar(event?: Event) {
    event?.preventDefault()
    event?.stopPropagation()
    if (!star || star.phase !== 'active' || gamePaused()) return
    const caught = star
    star = null
    cancelAnimationFrame(raf)
    game.starsCaught += 1
    playStarCatch(caught.audioMode)
    worldRef()?.emitParticleRecipe('omen', caught.x, caught.y)
    applyReward(caught, 1)
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
      clearTimeout(bankedEmberTimer)
      cancelAnimationFrame(raf)
      delete document.documentElement.dataset.omenArrival
    }
  })
</script>

{#if star?.phase === 'announcing'}
  <div
    class="omen-announcement"
    class:bubble={star.motion === 'bubble'}
    data-universe={star.universeId}
    data-entry-edge={star.entryEdge}
    style:left={pos.x + 'px'}
    style:top={pos.y + 'px'}
    style:--hue={star.power.hue}
    role="status"
    aria-live="polite"
  >
    <span class="arrival-mark" aria-hidden="true"></span>
    <span class="arrival-copy"><strong>{star.power.label}</strong> approaches · {announcementRemaining}</span>
  </div>
{:else if star}
  {@const power = star.power}
  <button
    class="falling-star"
    class:bubble={star.motion === 'bubble'}
    data-entry-edge={star.entryEdge}
    style:left={pos.x + 'px'}
    style:top={pos.y + 'px'}
    style:--hue={power.hue}
    style:--travel-angle={star.travelAngleRad + 'rad'}
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

{#if bankedEmbers}
  <div
    class="banked-embers"
    style:left={bankedEmbers.x + 'px'}
    style:top={bankedEmbers.y + 'px'}
    style:--hue={bankedEmbers.hue}
    aria-label={`A quarter of ${bankedEmbers.label} is banked on the ground`}
  ><span></span><span></span><span></span></div>
{/if}

<style>
  .omen-announcement {
    position: fixed;
    width: 6.6rem;
    height: 3.8rem;
    margin: -1.9rem -3.3rem;
    display: grid;
    place-items: center;
    z-index: 7;
    pointer-events: none;
    color: hsla(var(--hue), 92%, 82%, 0.9);
  }
  .arrival-mark {
    width: 2.9rem;
    height: 2.9rem;
    border: 1px solid hsla(var(--hue), 88%, 72%, 0.48);
    border-radius: 50%;
    box-shadow: 0 0 24px hsla(var(--hue), 88%, 60%, 0.2);
    animation: arrival-breathe 1s ease-in-out infinite;
  }
  .omen-announcement:not(.bubble) .arrival-mark::before,
  .omen-announcement:not(.bubble) .arrival-mark::after {
    content: '';
    position: absolute;
    inset: 50% auto auto 50%;
    width: 0.3rem;
    height: 0.3rem;
    border-radius: 50%;
    background: currentColor;
    box-shadow: 0 -1.1rem currentColor, 0 1.1rem currentColor, -1.1rem 0 currentColor, 1.1rem 0 currentColor;
    transform: translate(-50%, -50%);
  }
  .omen-announcement:not(.bubble) .arrival-mark::after {
    transform: translate(-50%, -50%) rotate(45deg) scale(0.72);
    opacity: 0.58;
  }
  .omen-announcement.bubble .arrival-mark {
    border-style: double;
    box-shadow: inset 0 0 18px hsla(var(--hue), 80%, 64%, 0.12), 0 0 24px hsla(var(--hue), 80%, 64%, 0.22);
  }
  .arrival-copy {
    position: absolute;
    top: calc(100% + 0.2rem);
    left: 50%;
    width: max-content;
    max-width: min(15rem, 42vw);
    transform: translateX(-50%);
    padding: 0.28rem 0.5rem;
    border-radius: 999px;
    background: rgba(8, 7, 17, 0.72);
    box-shadow: 0 0 18px rgba(8, 7, 17, 0.8);
    font: 600 0.64rem/1.2 Inter, sans-serif;
    letter-spacing: 0.06em;
    text-align: center;
    text-transform: uppercase;
  }
  .arrival-copy strong { color: #fff6dd; }
  .omen-announcement[data-entry-edge='bottom'] .arrival-copy {
    top: auto;
    bottom: calc(100% + 0.2rem);
  }
  .banked-embers {
    position: fixed;
    width: 3rem;
    height: 1.2rem;
    margin: -0.6rem -1.5rem;
    display: flex;
    align-items: end;
    justify-content: center;
    gap: 0.22rem;
    z-index: 5;
    pointer-events: none;
    filter: drop-shadow(0 0 8px hsla(var(--hue), 92%, 62%, 0.75));
  }
  .banked-embers span {
    width: 0.34rem;
    height: 0.24rem;
    border-radius: 50% 50% 45% 55%;
    background: hsla(var(--hue), 90%, 70%, 0.88);
    animation: ember-bank 2.4s ease-in-out infinite alternate;
  }
  .banked-embers span:nth-child(2) { width: 0.48rem; height: 0.31rem; animation-delay: -0.8s; }
  .banked-embers span:nth-child(3) { animation-delay: -1.6s; }
  .falling-star {
    position: fixed;
    width: 6.6rem;
    height: 3.8rem;
    min-width: 44px;
    min-height: 44px;
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
  .falling-star:not(.bubble)::before { transform: rotate(var(--travel-angle)); transform-origin: right center; }
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
  @keyframes arrival-breathe {
    0%, 100% { transform: scale(0.82); opacity: 0.38; }
    50% { transform: scale(1.08); opacity: 0.92; }
  }
  @keyframes ember-bank {
    from { opacity: 0.46; transform: translateY(1px) scale(0.82); }
    to { opacity: 1; transform: translateY(-2px) scale(1.08); }
  }
  @keyframes bubble-ring {
    0%, 100% { transform: scale(0.82); opacity: 0.42; }
    50% { transform: scale(1.18); opacity: 0.82; }
  }
  @keyframes bubble-float {
    from { transform: translateY(2px) scale(0.92); }
    to { transform: translateY(-3px) scale(1.07); }
  }
  @media (prefers-reduced-motion: reduce) {
    .arrival-mark,
    .banked-embers span,
    .core,
    .falling-star.bubble .core,
    .falling-star.bubble::before { animation: none; }
  }
</style>

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

  const LIFETIME_MS = 18_000
  // sky constellation perks: more frequent stars, longer blessings, star pairs
  // (plus the permanent Drought-trial reward)
  const rateScale = () =>
    1 /
    (1 +
      perkBonus(game.constellation, 'starRate') +
      (game.challengesDone.includes('drought') ? 0.2 : 0) +
      (game.curiosities.includes('star-jar') ? 0.05 : 0))
  const durScale = () => 1 + perkBonus(game.constellation, 'starDuration')
  const starsForbidden = () => {
    const c = game.challenge ? CHALLENGE_BY_ID.get(game.challenge) : null
    return !!(c?.mods.noStars || c?.mods.silence)
  }
  const FIRST_DELAY = () => (20_000 + Math.random() * 25_000) * rateScale()
  const NEXT_DELAY = () => (90_000 + Math.random() * 150_000) * rateScale()

  type PowerUpKind = 'frenzy' | 'gift' | 'fury'

  const POWER_UPS: Record<PowerUpKind, { label: string; glyph: string; hue: number; weight: number }> = {
    frenzy: { label: 'Frenzy', glyph: '×7', hue: 38, weight: 45 },
    gift: { label: 'Gift', glyph: '+15m', hue: 52, weight: 45 },
    fury: { label: 'Fury', glyph: '×777', hue: 5, weight: 10 },
  }
  const POWER_UP_POOL = Object.entries(POWER_UPS) as Array<[PowerUpKind, (typeof POWER_UPS)[PowerUpKind]]>

  interface Star {
    kind: PowerUpKind
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

  function pickKind(fromRhythm = false): PowerUpKind {
    const pool = fromRhythm
      ? POWER_UP_POOL.map(([kind, power]) => [
          kind,
          { ...power, weight: kind === 'fury' ? power.weight * 2.5 : power.weight },
        ] as [PowerUpKind, (typeof POWER_UPS)[PowerUpKind]])
      : POWER_UP_POOL
    const total = pool.reduce((sum, [, p]) => sum + p.weight, 0)
    let roll = Math.random() * total
    for (const [kind, power] of pool) {
      roll -= power.weight
      if (roll <= 0) return kind
    }
    return 'gift'
  }

  function spawn(fromRhythm = false) {
    if (!hasUi('shop') || document.hidden || starsForbidden()) {
      queuedSummon ||= fromRhythm
      spawnTimer = setTimeout(spawn, 30_000)
      return
    }
    const fromLeft = Math.random() < 0.5
    const next = {
      kind: pickKind(fromRhythm),
      x: fromLeft ? -30 : window.innerWidth + 30,
      y: 40 + Math.random() * window.innerHeight * 0.3,
      vx: (fromLeft ? 1 : -1) * (45 + Math.random() * 35),
      vy: 18 + Math.random() * 18,
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
      const dt = (now - last) / 1000
      last = now
      star.x += star.vx * dt
      star.y += star.vy * dt
      pos = { x: star.x, y: star.y }
      if (now - star.born > LIFETIME_MS || star.y > window.innerHeight + 40) {
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
    if (!star) return
    const kind = star.kind
    star = null
    cancelAnimationFrame(raf)
    game.starsCaught += 1
    playStarCatch()
    if (kind === 'frenzy') {
      addBuff({ id: 'frenzy', label: 'Frenzy ×7', prodMult: 7, clickMult: 7 }, 77 * durScale())
      pushToast('Frenzy!', `All light ×7 for ${Math.round(77 * durScale())} seconds.`, 'falling star')
    } else if (kind === 'fury') {
      addBuff({ id: 'fury', label: 'Fury ×777', prodMult: 1, clickMult: 777 }, 13 * durScale())
      pushToast('Fury!', `Clicks ×777 for ${Math.round(13 * durScale())} seconds. Go.`, 'falling star')
    } else {
      const amount = Math.max(25, passiveRatePerSec() * 900)
      earn(amount)
      pushToast('A Gift', `✦ ${format(amount)} — fifteen minutes of light, at once.`, 'falling star')
    }
    if (Math.random() < perkBonus(game.constellation, 'starPair') && summonFallingStar()) {
      pushToast('Meteor Season', 'Another one follows the first.', 'constellation')
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
    spawnTimer = setTimeout(spawn, FIRST_DELAY())
    return () => {
      clearTimeout(spawnTimer)
      cancelAnimationFrame(raf)
    }
  })
</script>

{#if star}
  {@const power = POWER_UPS[star.kind]}
  <button
    class="falling-star"
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
</style>

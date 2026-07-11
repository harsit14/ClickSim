<script lang="ts">
  import { onMount } from 'svelte'
  import { worldRef } from '../render/world-ref'
  import { stopMusic } from '../audio/music'
  import {
    playBuy,
    playStardustMote,
    playSupernova,
    playSupernovaHeartbeat,
  } from '../audio/sfx'
  import { game } from '../engine/game.svelte'
  import { progressionIdentity } from '../content/universe-progression'
  import { universeV2ById } from '../content/universes'
  import type { EconomyAmount } from '../content/universes/types'
  import { ZERO_AMOUNT } from '../core/numeric/amount'
  import { format } from '../core/format'
  import {
    EMBERLIGHT_SUPERNOVA_SENSORY_SPEC,
    type EmberlightSupernovaPhaseId,
  } from '../render/emberlight/supernova'

  let {
    doReset,
    onfinished,
    timeScale = 1,
  }: {
    doReset: () => EconomyAmount
    onfinished: () => void
    timeScale?: number
  } = $props()

  const universeId = game.activeUniverse
  const canSkip = game.supernovae > 0
  const uiPurchaseOrder = [...game.ui]
  const scale = $derived(Math.max(0.02, Math.min(1, timeScale)))
  const phaseSpec = (id: EmberlightSupernovaPhaseId) => (
    EMBERLIGHT_SUPERNOVA_SENSORY_SPEC.phases.find((phase) => phase.id === id)!
  )
  const scaled = (milliseconds: number) => milliseconds * scale
  const uiStepDuration = 8_000 / Math.max(1, uiPurchaseOrder.length)
  const ritualName = progressionIdentity(universeId).observatory.collapseName
  const localPrestige = universeV2ById(universeId)?.economy.localPrestige
  const rewardGlyph = localPrestige?.rewardCurrency.glyph ?? '✧'
  const rewardName = localPrestige?.rewardCurrency.localName ?? 'Stardust'
  const phaseOrder = EMBERLIGHT_SUPERNOVA_SENSORY_SPEC.phases
  const rain = Array.from({ length: 48 }, (_, index) => ({
    key: index,
    left: 3 + ((index * 37) % 94),
    delay: ((index * 17) % 100) / 100 * 5.6,
    duration: 2.2 + ((index * 13) % 19) / 10,
    size: 0.45 + ((index * 7) % 11) / 12,
  }))
  const uiGlyph: Readonly<Record<string, string>> = {
    counter: '✦',
    shop: '⌂',
    upgrades: '◆',
    stats: '▤',
    options: '⚙',
    music: '♫',
    bulk: '×',
  }

  let phase = $state<EmberlightSupernovaPhaseId>('listen-choir')
  let gained = $state<EconomyAmount>(ZERO_AMOUNT)
  let landedMotes = $state(0)
  let resetDone = false
  let scene: HTMLDivElement
  let againButton = $state<HTMLButtonElement>()

  const currentPhase = $derived(phaseSpec(phase))
  const phaseIndex = $derived(phaseOrder.findIndex(({ id }) => id === phase))
  const rebuilding = $derived(phase === 'rebuild')
  const returning = $derived(phase === 'return')

  function commitReset() {
    if (resetDone) return
    gained = doReset()
    resetDone = true
    worldRef()?.endCollapse()
  }

  function finish() {
    commitReset()
    delete document.documentElement.dataset.supernovaPhase
    onfinished()
  }

  $effect(() => {
    document.documentElement.dataset.supernovaPhase = phase
    if (phase !== 'return') return
    queueMicrotask(() => againButton?.focus())
  })

  onMount(() => {
    queueMicrotask(() => scene?.focus())
    stopMusic()
    worldRef()?.beginCollapse(scaled(6_000), scaled(6_000))
    const timers: ReturnType<typeof setTimeout>[] = []
    for (const next of phaseOrder.slice(1)) {
      timers.push(setTimeout(() => {
        phase = next.id
        if (next.id === 'blast') {
          commitReset()
          playSupernova(universeId as Parameters<typeof playSupernova>[0])
        }
      }, scaled(next.startMs)))
    }
    timers.push(setTimeout(() => playSupernovaHeartbeat(), scaled(12_600)))
    for (let index = 0; index < 16; index += 1) {
      timers.push(setTimeout(() => {
        landedMotes = index + 1
        playStardustMote(index)
      }, scaled(14_250 + index * 460)))
    }
    uiPurchaseOrder.forEach((_, index) => {
      timers.push(setTimeout(
        () => playBuy(0.42, universeId as Parameters<typeof playBuy>[1]),
        scaled(22_000 + index * uiStepDuration),
      ))
    })
    timers.push(setTimeout(finish, scaled(EMBERLIGHT_SUPERNOVA_SENSORY_SPEC.totalDurationMs)))
    return () => {
      timers.forEach(clearTimeout)
      delete document.documentElement.dataset.supernovaPhase
    }
  })
</script>

<div
  bind:this={scene}
  class="supernova-scene"
  class:rebuilding
  class:returning
  data-phase={phase}
  data-phase-index={phaseIndex}
  data-universe={universeId}
  data-time-scale={scale}
  style={`--ceremony-scale:${scale}`}
  role="dialog"
  aria-modal="true"
  aria-label={ritualName}
  tabindex="-1"
>
  <div class="dark"></div>
  <div class="listen-notches" aria-hidden="true"><i></i><i></i><i></i><i></i></div>

  <div class="material-ribbons" aria-hidden="true">
    {#each Array.from({ length: 9 }) as _, index}
      <i style={`--ribbon:${index};--ribbon-row:${index % 3};--ribbon-hue:${24 + index * 19}`}></i>
    {/each}
  </div>

  <div class="black-heartbeat" aria-hidden="true"><i></i></div>
  <div class="blast" aria-hidden="true"><i class="palette-ring"></i><i class="developing-wave"></i></div>

  {#if phase === 'stardust-rain' || rebuilding || returning}
    <div class="stardust-field" aria-hidden="true">
      {#each rain as drop (drop.key)}
        <span
          class="mote"
          style={`--left:${drop.left}%;--delay:${drop.delay}s;--duration:${drop.duration}s;--size:${drop.size}rem`}
        >{rewardGlyph}</span>
      {/each}
    </div>
  {/if}

  {#if rebuilding}
    <div class="ui-rebuild" aria-label="Interface rebuilding in original acquisition order">
      {#each uiPurchaseOrder as uiId, index (uiId)}
        <span
          class="ui-piece"
          style={`--piece-index:${index};--piece-count:${Math.max(1, uiPurchaseOrder.length)};--piece-delay:${index * uiStepDuration / 1_000}s;--piece-x:${(index - uiPurchaseOrder.length / 2) * 4}rem`}
        >
          <i aria-hidden="true">{uiGlyph[uiId] ?? '◇'}</i>{uiId}
        </span>
      {/each}
    </div>
  {/if}

  <div class="phase-caption" role="status" aria-live="polite">
    <span>{String(phaseIndex + 1).padStart(2, '0')} / {phaseOrder.length}</span>
    <p>{currentPhase.caption}</p>
  </div>

  {#if phase === 'stardust-rain'}
    <div class="landing-count" aria-live="polite">
      <small>Stardust returning</small>
      <strong>{rewardGlyph} +{landedMotes}</strong>
    </div>
  {/if}

  {#if returning}
    <div class="result">
      <p class="dust">{rewardGlyph} {format(gained)} {rewardName}</p>
      <button bind:this={againButton} class="again" onclick={finish}>begin again</button>
    </div>
  {:else if canSkip}
    <button class="skip" onclick={finish}>Skip remembered Supernova</button>
  {/if}
</div>

<style>
  .supernova-scene {
    position: fixed;
    inset: 0;
    z-index: 20;
    overflow: hidden;
    color: #fff6e8;
    pointer-events: auto;
  }
  .dark {
    position: absolute;
    inset: 0;
    background: #000;
    opacity: 0.08;
    transition: opacity calc(900ms * var(--ceremony-scale, 1)) linear;
  }
  [data-phase='listen-strings'] .dark { opacity: 0.16; }
  [data-phase='listen-bass'] .dark { opacity: 0.24; }
  [data-phase='listen-mallets'] .dark { opacity: 0.32; }
  [data-phase^='infall-'] .dark { opacity: 0.48; }
  [data-phase='void'] .dark { opacity: 1; }
  [data-phase='blast'] .dark { opacity: 0.96; }
  [data-phase='stardust-rain'] .dark { opacity: 0.58; }
  [data-phase='rebuild'] .dark { opacity: 0.42; }
  [data-phase='return'] .dark { opacity: 0.2; }

  .listen-notches {
    position: absolute;
    left: 50%; top: 7%;
    display: flex; gap: 0.42rem;
    transform: translateX(-50%);
  }
  .listen-notches i { width: 1.6rem; height: 2px; background: rgba(255, 222, 155, 0.18); }
  [data-phase-index='1'] .listen-notches i:nth-child(-n + 1),
  [data-phase-index='2'] .listen-notches i:nth-child(-n + 2),
  [data-phase-index='3'] .listen-notches i:nth-child(-n + 3),
  [data-phase-index='4'] .listen-notches i { background: #ffd991; box-shadow: 0 0 0.8rem #ffad52; }

  .material-ribbons { position: absolute; inset: 0; opacity: 0; pointer-events: none; }
  [data-phase^='infall-'] .material-ribbons { opacity: 1; }
  .material-ribbons i {
    position: absolute;
    left: calc(7% + var(--ribbon) * 10.7%);
    top: calc(18% + var(--ribbon-row) * 19%);
    width: 18vw;
    height: 2px;
    border-radius: 50%;
    background: linear-gradient(90deg, hsla(var(--ribbon-hue), 86%, 70%, 0), hsla(var(--ribbon-hue), 92%, 72%, 0.86), #fff6e8);
    transform-origin: right center;
    animation: ribbon-infall 1.5s cubic-bezier(0.55, 0.05, 0.9, 0.45) both;
    animation-delay: calc(var(--ribbon-row) * 90ms);
    filter: drop-shadow(0 0 0.35rem hsla(var(--ribbon-hue), 90%, 66%, 0.55));
  }
  @keyframes ribbon-infall {
    from { transform: rotate(calc((var(--ribbon) - 4) * 7deg)) scaleX(1); opacity: 0; }
    20% { opacity: 1; }
    to { left: 49%; top: 54%; transform: rotate(0) scaleX(0.08); opacity: 0.1; }
  }

  .black-heartbeat { position: absolute; inset: 0; display: grid; place-items: center; opacity: 0; }
  [data-phase='void'] .black-heartbeat { opacity: 1; }
  .black-heartbeat i { width: 0.5rem; aspect-ratio: 1; border-radius: 50%; background: #fff6e8; animation: heartbeat 320ms ease 600ms both; }
  @keyframes heartbeat { 0%, 100% { transform: scale(0); } 35% { transform: scale(1.8); } 62% { transform: scale(0.55); } 78% { transform: scale(1.1); } }

  .blast { position: absolute; inset: 0; pointer-events: none; opacity: 0; }
  [data-phase='blast'] .blast,
  [data-phase='stardust-rain'] .blast { opacity: 1; }
  .palette-ring,
  .developing-wave {
    position: absolute; left: 50%; top: 54%; aspect-ratio: 1; border-radius: 50%; transform: translate(-50%, -50%);
  }
  .palette-ring { width: 1rem; border: 1.5px solid #ffad52; box-shadow: 0 0 1.5rem #ffd991; animation: palette-blast 800ms linear both; }
  .developing-wave { width: 1rem; border: 1px solid rgba(255, 217, 145, 0.38); box-shadow: 0 0 3rem rgba(185, 125, 255, 0.18); animation: developing-reveal 2.4s ease-out both; }
  @keyframes palette-blast { to { width: 180vmax; opacity: 0; } }
  @keyframes developing-reveal { to { width: 140vmax; opacity: 0; } }

  .stardust-field { position: absolute; inset: 0; overflow: hidden; }
  .mote {
    position: absolute; left: var(--left); top: -2rem; font-size: var(--size);
    color: #d8d2ff; text-shadow: 0 0 0.8rem rgba(170, 150, 255, 0.9);
    animation: stardust-fall var(--duration) linear var(--delay) both;
  }
  @keyframes stardust-fall {
    from { transform: translateY(0) rotate(0deg); opacity: 0; }
    12% { opacity: 0.9; }
    to { transform: translateY(88vh) rotate(150deg); opacity: 0.16; }
  }

  .phase-caption {
    position: absolute; left: 50%; bottom: 7%; width: min(38rem, 80vw); text-align: center;
    transform: translateX(-50%); text-shadow: 0 2px 1rem #000;
  }
  .phase-caption span { color: rgba(255, 217, 145, 0.58); font-size: 0.58rem; letter-spacing: 0.18em; }
  .phase-caption p { margin: 0.25rem 0 0; color: rgba(239, 230, 216, 0.84); font: italic 1rem/1.45 Georgia, serif; }
  [data-phase='void'] .phase-caption,
  [data-phase='blast'] .phase-caption { opacity: 0; }

  .landing-count { position: absolute; left: 50%; top: 38%; display: grid; text-align: center; transform: translate(-50%, -50%); }
  .landing-count small { color: rgba(216, 210, 255, 0.68); letter-spacing: 0.13em; text-transform: uppercase; }
  .landing-count strong { font-size: 2.4rem; color: #e6e1ff; text-shadow: 0 0 2rem rgba(170, 150, 255, 0.8); }

  .ui-rebuild { position: absolute; inset: 0; pointer-events: none; }
  .ui-piece {
    position: absolute; left: 50%; top: 54%; display: grid; place-items: center; gap: 0.2rem;
    color: rgba(255, 238, 204, 0.82); font-size: 0.58rem; letter-spacing: 0.12em; text-transform: uppercase;
    animation: rebuild-piece 900ms cubic-bezier(0.16, 0.82, 0.28, 1.12) both;
    animation-delay: var(--piece-delay);
  }
  .ui-piece i { width: 2.2rem; aspect-ratio: 1; display: grid; place-items: center; border: 1px solid rgba(255, 217, 145, 0.38); border-radius: 0.45rem; font-style: normal; font-size: 1rem; box-shadow: 0 0 1rem rgba(255, 173, 82, 0.18); }
  @keyframes rebuild-piece {
    from { transform: translate(-50%, -50%) scale(0.2); opacity: 0; }
    55% { opacity: 1; }
    to { transform: translate(calc(-50% + var(--piece-x)), -10rem) scale(1); opacity: 0; }
  }

  .result { position: absolute; left: 50%; top: 40%; text-align: center; transform: translate(-50%, -50%); animation: result-in 1.4s ease both; }
  @keyframes result-in { from { opacity: 0; transform: translate(-50%, -46%); } }
  .dust { margin: 0.45rem 0 1.4rem; color: #e6e1ff; font-size: 2.6rem; font-weight: 700; font-variant-numeric: tabular-nums; text-shadow: 0 0 2rem rgba(170, 150, 255, 0.72); }
  .again,
  .skip { min-height: 2.5rem; padding: 0.55rem 1.3rem; color: #14102a; background: linear-gradient(180deg, #efeaff, #b6aaf5); border: 0; border-radius: 999px; font: inherit; font-weight: 650; cursor: pointer; }
  .skip { position: absolute; right: 1rem; bottom: 1rem; min-height: 2rem; padding: 0.4rem 0.75rem; color: rgba(239, 230, 216, 0.68); background: rgba(8, 7, 14, 0.72); border: 1px solid rgba(255, 217, 145, 0.18); font-size: 0.67rem; }

  :global(html[data-supernova-phase^='listen-'] .lifecycle-landmark),
  :global(html[data-supernova-phase^='listen-'] .settlement),
  :global(html[data-supernova-phase^='listen-'] .ecliptic),
  :global(html[data-supernova-phase^='listen-'] .drawn-sky) {
    transform: rotate(2deg);
    transform-origin: 50% 54%;
    transition: transform 1.5s ease, filter 1.5s ease;
    filter: brightness(0.76);
  }
  :global(html[data-supernova-phase='infall-settlement'] .settlement),
  :global(html[data-supernova-phase='infall-suns'] .ecliptic),
  :global(html[data-supernova-phase='infall-constellations'] .drawn-sky),
  :global(html[data-supernova-phase='infall-hud'] .lifecycle-landmarks) {
    opacity: 0;
    filter: blur(3px);
    transform: scale(0.18);
    transform-origin: 50% 54%;
    transition: opacity 1.4s ease, transform 1.4s ease, filter 1.4s ease;
  }
  :global(html[data-supernova-phase='infall-hud'] .hud),
  :global(html[data-supernova-phase='infall-hud'] .shop),
  :global(html[data-supernova-phase='infall-hud'] .upgrade-stack),
  :global(html[data-supernova-phase='infall-hud'] .dock),
  :global(html[data-supernova-phase='infall-hud'] .chip) {
    animation: hud-infall 1.5s cubic-bezier(0.5, 0, 0.9, 0.4) both;
  }
  @keyframes hud-infall { to { transform: perspective(700px) translate3d(0, 36vh, -500px) rotateX(38deg) rotateZ(3deg); opacity: 0; filter: blur(3px); } }
  :global(html[data-supernova-phase='void'] .hud),
  :global(html[data-supernova-phase='void'] .shop),
  :global(html[data-supernova-phase='void'] .upgrade-stack),
  :global(html[data-supernova-phase='void'] .dock),
  :global(html[data-supernova-phase='void'] .chip),
  :global(html[data-supernova-phase='blast'] .hud),
  :global(html[data-supernova-phase='blast'] .shop),
  :global(html[data-supernova-phase='blast'] .upgrade-stack),
  :global(html[data-supernova-phase='blast'] .dock),
  :global(html[data-supernova-phase='blast'] .chip),
  :global(html[data-supernova-phase='stardust-rain'] .hud),
  :global(html[data-supernova-phase='stardust-rain'] .shop),
  :global(html[data-supernova-phase='stardust-rain'] .upgrade-stack),
  :global(html[data-supernova-phase='stardust-rain'] .dock),
  :global(html[data-supernova-phase='stardust-rain'] .chip) { opacity: 0; }
  :global(html[data-supernova-phase='rebuild'] .hud) { animation: ui-return 650ms ease 0s both; }
  :global(html[data-supernova-phase='rebuild'] .upgrade-stack) { animation: ui-return 650ms ease 1.6s both; }
  :global(html[data-supernova-phase='rebuild'] .shop) { animation: ui-return 650ms ease 3.2s both; }
  :global(html[data-supernova-phase='rebuild'] .chip) { animation: ui-return 650ms ease 4.8s both; }
  :global(html[data-supernova-phase='rebuild'] .dock) { animation: ui-return 650ms ease 6.4s both; }
  @keyframes ui-return { from { opacity: 0; filter: blur(4px); transform: scale(0.82); } to { opacity: 1; filter: none; transform: none; } }

  :global(html[data-motion='reduced'][data-supernova-phase] .material-ribbons),
  :global(html[data-motion='reduced'][data-supernova-phase] .blast),
  :global(html[data-motion='reduced'][data-supernova-phase] .stardust-field) { display: none; }
  :global(html[data-motion='reduced'][data-supernova-phase] .game-shell *) { animation: none !important; transform: none !important; }
  @media (prefers-reduced-motion: reduce) {
    .material-ribbons,
    .blast,
    .stardust-field { display: none; }
    .supernova-scene,
    .supernova-scene * { animation: none !important; transition: none !important; }
  }
</style>

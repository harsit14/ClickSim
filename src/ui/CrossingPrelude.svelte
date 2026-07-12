<script lang="ts">
  import { onMount } from 'svelte'
  import { game } from '../engine/game.svelte'
  import { isPlaying, startMusic, stopMusic } from '../audio/music'
  import { playCollect } from '../audio/sfx'
  import { universeById, universeV2ById } from '../content/universes'
  import {
    crossingCeremonyDuration,
    crossingCeremonyLine,
    crossingCeremonyPhaseAt,
    crossingCeremonyPhases,
  } from '../experience/crossing-arrival'
  import { crossingArrivalState } from '../experience/crossing-arrival.svelte'

  let { destination, onfinished }: { destination: string; onfinished: (universeId: string) => void } = $props()

  const source = $derived(universeById(game.activeUniverse))
  const target = $derived(universeById(destination))
  const sourceV2 = $derived(universeV2ById(source.id))
  const targetV2 = $derived(universeV2ById(target.id))
  const firstArrival = $derived(crossingArrivalState.active?.destinationId === destination
    ? crossingArrivalState.active.firstArrival
    : game.universeRuns[destination] === undefined)
  const phases = $derived(crossingCeremonyPhases(firstArrival))
  const durationMs = $derived(crossingCeremonyDuration(firstArrival))
  const phase = $derived(crossingCeremonyPhaseAt(elapsedMs, firstArrival))
  const phaseIndex = $derived(phases.findIndex(({ id }) => id === phase.id))
  const line = $derived(crossingCeremonyLine(phase.id, {
    sourceName: source.shortName,
    targetName: target.name,
    targetArrival: target.route.arrival,
    sourceVerb: sourceV2?.identity.primaryVerb ?? 'kindle',
    targetVerb: targetV2?.identity.primaryVerb ?? 'kindle',
  }))

  let elapsedMs = $state(0)
  let ready = $state(false)
  let resumeMusic = false
  let crossing: HTMLDivElement
  let returnButton = $state<HTMLButtonElement>()
  let ceremonyTimer: ReturnType<typeof setInterval> | undefined
  let arrivalCuePlayed = false
  const timeScale = import.meta.env.DEV
    ? Math.max(0.02, Math.min(1, Number(new URLSearchParams(window.location.search).get('crossing-speed')) || 1))
    : 1

  $effect(() => {
    if (!ready) return
    queueMicrotask(() => returnButton?.focus())
  })

  function finish() {
    onfinished(destination)
    if (resumeMusic && game.ui.includes('music')) startMusic()
  }

  onMount(() => {
    queueMicrotask(() => crossing?.focus())
    resumeMusic = isPlaying()
    stopMusic()
    const startedAt = performance.now()
    const tick = () => {
      elapsedMs = Math.min(durationMs, (performance.now() - startedAt) / timeScale)
      if (!arrivalCuePlayed && crossingCeremonyPhaseAt(elapsedMs, firstArrival).id === 'arrival') {
        arrivalCuePlayed = true
        try { playCollect() } catch { /* muted arrival retains its visual and line */ }
      }
      if (elapsedMs >= durationMs) {
        ready = true
        clearInterval(ceremonyTimer)
        return
      }
    }
    tick()
    ceremonyTimer = window.setInterval(tick, 50)
    return () => clearInterval(ceremonyTimer)
  })
</script>

<div
  bind:this={crossing}
  class="crossing"
  class:reduced={game.motionPreference === 'reduced'}
  role="dialog"
  aria-modal="true"
  aria-label="The Crossing"
  tabindex="-1"
  data-crossing-phase={phase.id}
  data-first-arrival={firstArrival}
  data-duration-ms={durationMs}
  data-destination={target.id}
  style={`--cross-hue:${target.palette.accentHue};--cross-progress:${Math.min(1, elapsedMs / durationMs)}`}
>
  <div class="between-field" aria-hidden="true"><i></i><i></i><i></i></div>

  <header class="route-name">
    <span>{source.route.glyph} {source.shortName}</span>
    <i aria-hidden="true"></i>
    <span>{target.route.glyph} {target.shortName}</span>
  </header>

  <ol class="phase-rail" aria-label="Crossing progress">
    {#each phases as item, index (item.id)}
      <li class:active={index === phaseIndex} class:complete={index < phaseIndex}>
        <span>{String(index + 1).padStart(2, '0')}</span>
        <small>{item.label}</small>
      </li>
    {/each}
  </ol>

  <div class="crossing-stage" aria-hidden="true">
    <div class="source-law"><span>{source.route.glyph}</span></div>
    <div class="vessel-mark">
      <span class="mast"></span>
      <span class="sail left"></span>
      <span class="sail right"></span>
      <span class="hull"></span>
      <span class="heart"></span>
    </div>
    <div class="destination-law">
      <span>{target.route.glyph}</span><i></i><i></i><i></i><i></i><i></i>
    </div>
    <div class="wrong-foot-mark"><span>{sourceV2?.identity.primaryVerb ?? 'kindle'}</span><b>{targetV2?.identity.primaryVerb ?? 'kindle'}</b></div>
  </div>

  {#key phase.id}
    <p class="crossing-line story-type" role="status" aria-live="polite">{line}</p>
  {/key}

  <div class="progress-track" aria-hidden="true"><i></i></div>

  {#if ready}
    <button bind:this={returnButton} onclick={finish}>enter {target.shortName}</button>
  {/if}
</div>

<style>
  .crossing {
    position: fixed; inset: 0; z-index: 32; display: grid; place-items: center; overflow: hidden;
    color: rgba(214, 230, 255, 0.78);
    background:
      radial-gradient(circle at 50% 54%, hsla(var(--cross-hue), 65%, 48%, 0.2), transparent 24%),
      radial-gradient(circle at 50% 50%, #050510, #000 74%);
    animation: crossing-arrive 0.8s ease both;
  }
  .between-field { position: absolute; inset: 0; overflow: hidden; }
  .between-field::before,
  .between-field::after { content: ''; position: absolute; inset: -20%; background: linear-gradient(115deg, transparent 0 42%, rgba(150, 220, 255, 0.08) 47%, transparent 52%); animation: between-drift 9s ease-in-out infinite alternate; }
  .between-field::after { background: linear-gradient(65deg, transparent 0 43%, hsla(var(--cross-hue), 78%, 72%, 0.07) 48%, transparent 54%); animation-direction: alternate-reverse; }
  .between-field i { position: absolute; left: 50%; top: 50%; width: 1px; height: 76vh; transform-origin: center; background: linear-gradient(transparent, hsla(var(--cross-hue), 82%, 78%, 0.22), transparent); }
  .between-field i:nth-child(1) { transform: translate(-50%, -50%) rotate(63deg); }
  .between-field i:nth-child(2) { transform: translate(-50%, -50%) rotate(-63deg); }
  .between-field i:nth-child(3) { transform: translate(-50%, -50%) rotate(90deg); opacity: 0.45; }
  .route-name {
    position: absolute; top: 9%; left: 50%; width: min(31rem, 78vw); display: grid; grid-template-columns: auto 1fr auto; align-items: center; gap: 0.8rem;
    transform: translateX(-50%); font: 700 0.6875rem/1.2 var(--font-interface, ui-sans-serif, system-ui); letter-spacing: 0.12em; text-transform: uppercase; color: rgba(211, 239, 248, 0.82);
  }
  .route-name > i { height: 1px; background: linear-gradient(90deg, rgba(255,255,255,0.08), hsla(var(--cross-hue), 80%, 70%, 0.52), rgba(255,255,255,0.08)); }
  .phase-rail { position: absolute; left: 50%; top: 15%; width: min(42rem, 88vw); display: grid; grid-template-columns: repeat(6, 1fr); gap: 0.28rem; margin: 0; padding: 0; transform: translateX(-50%); list-style: none; }
  .phase-rail li { min-width: 0; padding-top: 0.35rem; border-top: 1px dashed rgba(225,235,245,.48); color: rgba(225,235,245,.72); }
  .phase-rail li.complete { border-style: double; border-color: hsla(var(--cross-hue),78%,82%,.82); color: rgba(225,242,246,.88); }
  .phase-rail li.active { border-style: solid; border-width: 2px; border-color: hsla(var(--cross-hue),88%,86%,1); color: rgb(238,251,255); }
  .phase-rail span { display: block; font: 720 0.6875rem/1 ui-monospace, monospace; }
  .phase-rail small { display: block; margin-top: 0.22rem; font: 630 0.6875rem/1.25 var(--font-interface, ui-sans-serif, system-ui); letter-spacing: 0.02em; white-space: normal; }
  .crossing-stage { position: absolute; left: 50%; top: 43%; width: min(34rem, 86vw); height: 13rem; transform: translate(-50%, -50%); }
  .source-law,
  .destination-law { position: absolute; top: 50%; width: 7rem; aspect-ratio: 1; display: grid; place-items: center; transform: translateY(-50%); border: 1px solid rgba(255,255,255,.08); clip-path: polygon(50% 0, 88% 18%, 100% 56%, 76% 91%, 35% 100%, 5% 72%, 4% 31%); }
  .source-law { left: 0; color: rgba(255, 216, 138, 0.54); transition: opacity 1.2s, transform 1.2s; }
  .destination-law { right: 0; color: hsla(var(--cross-hue), 82%, 78%, 0.72); opacity: 0.12; transition: opacity 1.2s, transform 1.2s; }
  .source-law span,
  .destination-law span { font: 740 1.35rem/1 ui-monospace, monospace; }
  .destination-law i { position: absolute; left: 50%; top: 50%; width: 70%; height: 1px; background: currentColor; transform-origin: center; }
  .destination-law i:nth-of-type(2) { transform: rotate(36deg); } .destination-law i:nth-of-type(3) { transform: rotate(72deg); } .destination-law i:nth-of-type(4) { transform: rotate(108deg); } .destination-law i:nth-of-type(5) { transform: rotate(144deg); }
  .vessel-mark { position: absolute; left: 50%; top: 50%; width: 12rem; height: 7rem; transform: translate(-50%, -50%); opacity: 0.48; filter: drop-shadow(0 0 22px rgba(135, 220, 255, 0.28)); }
  .vessel-mark span { position: absolute; display: block; }
  .mast { left: 50%; bottom: 22%; width: 2px; height: 5.6rem; background: rgba(210, 240, 255, 0.7); }
  .sail { bottom: 36%; width: 5rem; height: 4.5rem; border: 1px solid rgba(210, 240, 255, 0.55); background: rgba(160, 220, 255, 0.08); }
  .sail.left { right: 52%; clip-path: polygon(100% 0, 100% 100%, 0 84%); }
  .sail.right { left: 52%; clip-path: polygon(0 12%, 0 100%, 100% 86%); }
  .hull { left: 14%; right: 10%; bottom: 18%; height: 2.7rem; border-bottom: 3px solid rgba(255, 217, 138, 0.7); border-radius: 0 0 70% 70%; }
  .heart { left: calc(50% - 0.32rem); bottom: 29%; width: 0.64rem; height: 0.64rem; border-radius: 50%; background: rgba(255, 226, 140, 0.9); box-shadow: 0 0 24px rgba(255, 210, 100, 0.55); }
  .wrong-foot-mark { position: absolute; left: 50%; top: 84%; display: flex; align-items: center; gap: 0.65rem; transform: translateX(-50%); opacity: 0; font: 700 0.6875rem/1.2 var(--font-interface, ui-sans-serif, system-ui); letter-spacing: 0.08em; text-transform: uppercase; }
  .wrong-foot-mark span { color: rgba(255, 191, 126, 0.74); text-decoration: line-through; }
  .wrong-foot-mark b { color: hsla(var(--cross-hue), 88%, 78%, 0.9); }
  [data-crossing-phase='between'] .vessel-mark { animation: vessel-uncounted 3.2s steps(6, end) infinite; }
  [data-crossing-phase='wrong-foot'] .wrong-foot-mark { opacity: 1; animation: wrong-foot 620ms steps(2, end) both; }
  [data-crossing-phase='wrong-foot'] .source-law { transform: translateY(-50%) translateX(1.2rem); opacity: 0.8; }
  [data-crossing-phase='translation'] .source-law,
  [data-crossing-phase='arrival'] .source-law,
  [data-crossing-phase='ready'] .source-law { opacity: 0.08; transform: translateY(-50%) translateX(-2rem); }
  [data-crossing-phase='translation'] .destination-law { opacity: 0.52; transform: translateY(-50%) translateX(-1rem); }
  [data-crossing-phase='arrival'] .destination-law,
  [data-crossing-phase='ready'] .destination-law { opacity: 0.94; transform: translateY(-50%) translateX(-1.8rem); filter: drop-shadow(0 0 1.2rem hsla(var(--cross-hue), 86%, 68%, 0.28)); }
  [data-crossing-phase='translation'] .vessel-mark,
  [data-crossing-phase='arrival'] .vessel-mark,
  [data-crossing-phase='ready'] .vessel-mark { color: hsla(var(--cross-hue), 84%, 76%, 0.8); filter: drop-shadow(0 0 25px hsla(var(--cross-hue), 82%, 68%, 0.38)); }
  .crossing-line { position: relative; max-width: min(80vw, 38rem); margin: 15rem 0 0; padding: 0.45rem 1rem; font-size: 1.08rem; font-style: italic; line-height: 1.5; text-align: center; color: rgba(214, 230, 255, 0.78); background: radial-gradient(ellipse, rgba(3, 4, 12, 0.72), transparent 72%); animation: line-in 0.8s ease both; }
  .progress-track { position: absolute; left: 50%; bottom: 9%; width: min(34rem, 76vw); height: 1px; transform: translateX(-50%); background: rgba(255,255,255,.08); }
  .progress-track i { display: block; width: calc(var(--cross-progress) * 100%); height: 100%; background: hsla(var(--cross-hue), 82%, 72%, 0.72); box-shadow: 0 0 0.7rem hsla(var(--cross-hue), 82%, 62%, 0.42); }
  button { position: absolute; left: 50%; bottom: 13%; transform: translateX(-50%); padding: 0.55rem 1.5rem; color: #071018; background: linear-gradient(180deg, #d7f3ff, hsla(var(--cross-hue), 82%, 70%, 1)); border: none; border-radius: 999px; cursor: pointer; font: 700 0.82rem/1 var(--font-interface, ui-sans-serif, system-ui); animation: line-in 0.8s ease both; }
  @keyframes crossing-arrive { from { opacity: 0; } to { opacity: 1; } }
  @keyframes between-drift { from { transform: translateX(-3vw) scale(1.03); opacity: 0.55; } to { transform: translateX(3vw) scale(1.08); opacity: 0.9; } }
  @keyframes vessel-uncounted { 50% { transform: translate(-50%, -50%) translateY(-0.4rem); opacity: 0.32; } }
  @keyframes wrong-foot { from { transform: translateX(-50%) translateX(-0.8rem); } to { transform: translateX(-50%) translateX(0); } }
  @keyframes line-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
  .reduced *,
  :global(html[data-motion='reduced']) .crossing * { animation: none !important; transition: none !important; }
  @media (max-width: 760px) {
    .route-name { top: 7%; }
    .phase-rail { top: 13%; grid-template-columns: repeat(3, 1fr); row-gap: 0.5rem; }
    .crossing-stage { top: 45%; transform: translate(-50%, -50%) scale(0.78); }
    .source-law { left: -1rem; } .destination-law { right: -1rem; }
    .crossing-line { margin-top: 14rem; font-size: 0.94rem; }
    .progress-track { bottom: 7%; }
  }
  @media (prefers-reduced-motion: reduce) { .crossing * { animation: none !important; transition: none !important; } }
</style>

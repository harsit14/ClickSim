<script lang="ts">
  import { onMount } from 'svelte'
  import { game } from '../engine/game.svelte'
  import { isPlaying, startMusic, stopMusic } from '../audio/music'
  import { playCollect } from '../audio/sfx'
  import { universeById } from '../content/universes'

  let { destination, onfinished }: { destination: string; onfinished: (universeId: string) => void } = $props()

  const source = $derived(universeById(game.activeUniverse))
  const target = $derived(universeById(destination))

  let line = $state('the vessel loosens itself from the known')
  let ready = $state(false)
  let resumeMusic = false
  let crossing: HTMLDivElement
  let returnButton = $state<HTMLButtonElement>()

  $effect(() => {
    if (!ready) return
    queueMicrotask(() => returnButton?.focus())
  })

  function finish() {
    onfinished(destination)
    if (resumeMusic && game.ui.includes('music')) startMusic()
  }

  onMount(() => {
    const lines = [
      `the vessel leaves ${source.shortName} without extinguishing it`,
      'between universes, no number rises; no clock is willing to count',
      target.route.arrival,
      `the Wayfinder answers: ${target.name}`,
    ]
    line = lines[0]
    queueMicrotask(() => crossing?.focus())
    resumeMusic = isPlaying()
    stopMusic()
    const timers = [
      setTimeout(() => (line = lines[1]), 1_800),
      setTimeout(() => (line = lines[2]), 3_600),
      setTimeout(() => {
        try { playCollect() } catch { /* silence is allowed here */ }
        line = lines[3]
      }, 5_400),
      setTimeout(() => (ready = true), 6_800),
    ]
    return () => timers.forEach(clearTimeout)
  })
</script>

<div
  bind:this={crossing}
  class="crossing"
  role="dialog"
  aria-modal="true"
  aria-label="The Crossing"
  tabindex="-1"
  style:--cross-hue={target.palette.accentHue}
>
  <div class="wake"></div>
  <div class="route-name" aria-hidden="true">
    <span>{source.route.glyph} {source.shortName}</span><i></i><span>{target.route.glyph} {target.shortName}</span>
  </div>
  <div class="vessel-mark" aria-hidden="true">
    <span class="mast"></span>
    <span class="sail left"></span>
    <span class="sail right"></span>
    <span class="hull"></span>
    <span class="heart"></span>
  </div>

  {#key line}
    <p>{line}</p>
  {/key}

  {#if ready}
    <button bind:this={returnButton} onclick={finish}>enter {target.shortName}</button>
  {/if}
</div>

<style>
  .crossing {
    position: fixed;
    inset: 0;
    z-index: 32;
    display: grid;
    place-items: center;
    overflow: hidden;
    background:
      radial-gradient(circle at 50% 54%, hsla(var(--cross-hue), 65%, 48%, 0.2), transparent 24%),
      radial-gradient(circle at 50% 50%, #050510, #000 74%);
    animation: arrive 0.8s ease both;
  }
  @keyframes arrive {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  .wake {
    position: absolute;
    inset: 0;
    background:
      linear-gradient(115deg, transparent 0 40%, rgba(150, 220, 255, 0.08) 46%, transparent 52%),
      linear-gradient(65deg, transparent 0 42%, rgba(255, 217, 138, 0.05) 48%, transparent 54%);
    animation: wake 5.8s ease-in-out infinite alternate;
  }
  .route-name {
    position: absolute;
    top: 13%;
    left: 50%;
    width: min(24rem, 74vw);
    display: grid;
    grid-template-columns: auto 1fr auto;
    align-items: center;
    gap: 0.8rem;
    transform: translateX(-50%);
    font-size: 0.58rem;
    font-weight: 700;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: rgba(185, 226, 239, 0.62);
  }
  .route-name i { height: 1px; background: linear-gradient(90deg, rgba(255,255,255,0.08), hsla(var(--cross-hue), 80%, 70%, 0.52), rgba(255,255,255,0.08)); }
  @keyframes wake {
    from { transform: translateX(-3vw) scale(1.03); opacity: 0.55; }
    to { transform: translateX(3vw) scale(1.08); opacity: 0.9; }
  }
  .vessel-mark {
    position: absolute;
    top: 35%;
    left: 50%;
    width: 12rem;
    height: 7rem;
    transform: translate(-50%, -50%);
    opacity: 0.42;
    filter: drop-shadow(0 0 22px rgba(135, 220, 255, 0.28));
  }
  .vessel-mark span {
    position: absolute;
    display: block;
  }
  .mast {
    left: 50%;
    bottom: 22%;
    width: 2px;
    height: 5.6rem;
    background: rgba(210, 240, 255, 0.7);
  }
  .sail {
    bottom: 36%;
    width: 5rem;
    height: 4.5rem;
    border: 1px solid rgba(210, 240, 255, 0.55);
    background: rgba(160, 220, 255, 0.08);
  }
  .sail.left {
    right: 52%;
    clip-path: polygon(100% 0, 100% 100%, 0 84%);
  }
  .sail.right {
    left: 52%;
    clip-path: polygon(0 12%, 0 100%, 100% 86%);
  }
  .hull {
    left: 14%;
    right: 10%;
    bottom: 18%;
    height: 2.7rem;
    border-bottom: 3px solid rgba(255, 217, 138, 0.7);
    border-radius: 0 0 70% 70%;
  }
  .heart {
    left: calc(50% - 0.32rem);
    bottom: 29%;
    width: 0.64rem;
    height: 0.64rem;
    border-radius: 50%;
    background: rgba(255, 226, 140, 0.9);
    box-shadow: 0 0 24px rgba(255, 210, 100, 0.55);
  }
  p {
    position: relative;
    max-width: min(80vw, 34rem);
    margin: 10rem 0 0;
    font-family: Georgia, 'Times New Roman', serif;
    font-style: italic;
    font-size: 1.08rem;
    line-height: 1.5;
    text-align: center;
    color: rgba(214, 230, 255, 0.78);
    animation: line-in 1s ease both;
  }
  @keyframes line-in {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }
  button {
    position: absolute;
    left: 50%;
    bottom: 16%;
    transform: translateX(-50%);
    padding: 0.55rem 1.5rem;
    font: inherit;
    font-weight: 700;
    color: #071018;
    background: linear-gradient(180deg, #d7f3ff, #72d8ff);
    border: none;
    border-radius: 999px;
    cursor: pointer;
    animation: line-in 0.8s ease both;
  }
</style>

<script lang="ts">
  import { onMount } from 'svelte'
  import { worldRef } from '../render/world-ref'
  import { stopMusic } from '../audio/music'
  import { playSupernova } from '../audio/sfx'

  let {
    doReset,
    onfinished,
  }: { doReset: () => number; onfinished: () => void } = $props()

  type Phase = 'collapse' | 'void' | 'flash' | 'after'
  let phase = $state<Phase>('collapse')
  let gained = $state(0)
  let scene: HTMLDivElement
  let againButton = $state<HTMLButtonElement>()

  $effect(() => {
    if (phase !== 'after') return
    queueMicrotask(() => againButton?.focus())
  })

  const rain = Array.from({ length: 36 }, (_, i) => ({
    key: i,
    left: Math.random() * 100,
    delay: Math.random() * 1.8,
    duration: 2.6 + Math.random() * 2.4,
    size: 0.6 + Math.random() * 0.9,
  }))

  onMount(() => {
    queueMicrotask(() => scene?.focus())
    stopMusic()
    worldRef()?.beginCollapse()
    const timers = [
      setTimeout(() => (phase = 'void'), 3_000),
      setTimeout(() => playSupernova(), 3_400),
      setTimeout(() => {
        gained = doReset()
        worldRef()?.endCollapse()
        phase = 'flash'
      }, 3_700),
      setTimeout(() => (phase = 'after'), 4_300),
    ]
    return () => timers.forEach(clearTimeout)
  })
</script>

<div
  bind:this={scene}
  class="scene {phase}"
  role="dialog"
  aria-modal="true"
  aria-label="Supernova"
  tabindex="-1"
>
  <div class="dark"></div>
  <div class="flash"></div>

  {#if phase === 'after'}
    <div class="aftermath">
      {#each rain as drop (drop.key)}
        <span
          class="mote"
          style:left={drop.left + '%'}
          style:animation-delay={drop.delay + 's'}
          style:animation-duration={drop.duration + 's'}
          style:font-size={drop.size + 'rem'}
        >✧</span>
      {/each}
      <div class="result">
        <p class="whisper">the dark kept nothing</p>
        <p class="dust">✧ {gained} stardust</p>
        <button bind:this={againButton} class="again" onclick={onfinished}>begin again</button>
      </div>
    </div>
  {/if}
</div>

<style>
  .scene {
    position: fixed;
    inset: 0;
    z-index: 20;
  }
  .dark {
    position: absolute;
    inset: 0;
    background: #000;
    opacity: 0;
    transition: opacity 2.9s ease-in;
  }
  .scene.collapse .dark { opacity: 0.88; }
  .scene.void .dark { opacity: 1; transition-duration: 0.5s; }
  .scene.flash .dark, .scene.after .dark { opacity: 0.55; transition-duration: 2.2s; }

  .flash {
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at 50% 48%, #fff8e8, #ffe1ad 35%, rgba(255, 190, 120, 0.6) 60%, transparent 85%);
    opacity: 0;
    pointer-events: none;
  }
  .scene.flash .flash {
    opacity: 1;
    transition: opacity 0.12s ease-out;
  }
  .scene.after .flash {
    opacity: 0;
    transition: opacity 2.4s ease-in;
  }

  .aftermath {
    position: absolute;
    inset: 0;
    overflow: hidden;
  }
  .mote {
    position: absolute;
    top: -2rem;
    color: #d8d2ff;
    text-shadow: 0 0 12px rgba(170, 150, 255, 0.9);
    animation: fall linear both;
  }
  @keyframes fall {
    from { transform: translateY(0) rotate(0deg); opacity: 1; }
    to { transform: translateY(110vh) rotate(160deg); opacity: 0.2; }
  }
  .result {
    position: absolute;
    top: 40%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
    animation: result-in 1.4s ease 0.6s both;
  }
  @keyframes result-in {
    from { opacity: 0; transform: translate(-50%, -46%); }
    to { opacity: 1; transform: translate(-50%, -50%); }
  }
  .whisper {
    margin: 0;
    font-family: Georgia, serif;
    font-style: italic;
    color: rgba(216, 210, 255, 0.75);
  }
  .dust {
    margin: 0.5rem 0 1.4rem;
    font-size: 2.6rem;
    font-weight: 700;
    color: #e6e1ff;
    text-shadow: 0 0 34px rgba(170, 150, 255, 0.8);
    font-variant-numeric: tabular-nums;
  }
  .again {
    padding: 0.55rem 1.8rem;
    font: inherit;
    font-weight: 600;
    color: #14102a;
    background: linear-gradient(180deg, #efeaff, #b6aaf5);
    border: none;
    border-radius: 999px;
    cursor: pointer;
    transition: transform 0.08s;
  }
  .again:hover { transform: scale(1.05); }
</style>

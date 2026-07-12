<script lang="ts">
  import { onDestroy, onMount } from 'svelte'
  import type { EconomyAmount } from '../content/universes/types'
  import { game } from '../engine/game.svelte'
  import { format } from '../core/format'
  import { isPlaying, startMusic, stopMusic } from '../audio/music'
  import { playSupernova } from '../audio/sfx'
  import { worldRef } from '../render/world-ref'
  import { ZERO_AMOUNT } from '../core/numeric/amount'

  let {
    doReset,
    onfinished,
    timeScale = 1,
  }: {
    doReset: () => EconomyAmount
    onfinished: () => void
    timeScale?: number
  } = $props()

  type Beat = 'consequence' | 'crossing' | 'result'
  let beat = $state<Beat>('consequence')
  let gain = $state<EconomyAmount>(ZERO_AMOUNT)
  let ready = $state(false)
  let continueButton = $state<HTMLButtonElement>()
  let scene: HTMLDivElement
  let resumeMusic = false
  let finished = false
  const timers: ReturnType<typeof setTimeout>[] = []
  const reduced = game.motionPreference === 'reduced'
  const scaled = (milliseconds: number) => Math.max(20, milliseconds * timeScale * (reduced ? 0.38 : 1))

  const copy = $derived(
    beat === 'consequence'
      ? { eyebrow: 'Consequence', line: 'The whole era reaches the boundary below its last light.' }
      : beat === 'crossing'
        ? { eyebrow: 'Crossing', line: 'World and Epoch fold inward. The permanent record holds.' }
        : { eyebrow: 'Result', line: 'A Singularity remains, and the first Heart is possible again.' },
  )

  function finish() {
    if (finished) return
    finished = true
    worldRef()?.endCollapse()
    if (resumeMusic && game.ui.includes('music')) startMusic()
    onfinished()
  }

  onMount(() => {
    queueMicrotask(() => scene?.focus({ preventScroll: true }))
    resumeMusic = isPlaying()
    stopMusic()
    worldRef()?.beginCollapse(scaled(450), scaled(1_700))
    timers.push(
      setTimeout(() => (beat = 'crossing'), scaled(900)),
      setTimeout(() => {
        gain = doReset()
        try { playSupernova() } catch { /* the ceremony remains complete in silence */ }
        beat = 'result'
      }, scaled(2_000)),
      setTimeout(() => {
        ready = true
        queueMicrotask(() => continueButton?.focus({ preventScroll: true }))
      }, scaled(3_300)),
    )
  })

  onDestroy(() => {
    timers.forEach(clearTimeout)
    if (!finished) worldRef()?.endCollapse()
  })
</script>

<div
  bind:this={scene}
  class="deep-ceremony"
  class:reduced
  data-beat={beat}
  role="dialog"
  aria-modal="true"
  aria-labelledby="deep-ceremony-title"
  aria-describedby="deep-ceremony-line"
  tabindex="-1"
>
  <div class="horizon" aria-hidden="true"><i></i><i></i><i></i></div>
  <section class="ceremony-copy" aria-live="polite">
    <span>{copy.eyebrow} · Deep Collapse</span>
    <h2 id="deep-ceremony-title">{beat === 'result' ? `◉ +${format(gain)}` : 'Descend beyond the era'}</h2>
    <p id="deep-ceremony-line">{copy.line}</p>
  </section>
  <ol aria-label="Deep Collapse progress">
    <li class:active={beat === 'consequence'} class:complete={beat !== 'consequence'}>Consequence</li>
    <li class:active={beat === 'crossing'} class:complete={beat === 'result'}>Crossing</li>
    <li class:active={beat === 'result'}>Result</li>
  </ol>
  {#if ready}
    <button bind:this={continueButton} onclick={finish}>Return to the first Heart</button>
  {/if}
</div>

<style>
  .deep-ceremony { position:fixed;inset:0;z-index:34;display:grid;place-items:center;overflow:hidden;color:#d8edf6;background:radial-gradient(ellipse at 50% 54%,rgba(48,121,150,.13),transparent 31%),#010207;isolation:isolate; }
  .horizon { position:absolute;inset:0;display:grid;place-items:center;opacity:.62; }
  .horizon i { position:absolute;width:min(72vw,58rem);aspect-ratio:2.2;border:1px solid rgba(121,205,234,.17);border-radius:50%;animation:deep-fold 2.2s ease-in-out infinite alternate; }
  .horizon i:nth-child(2) { width:min(50vw,40rem);animation-delay:-.7s; }
  .horizon i:nth-child(3) { width:min(28vw,22rem);animation-delay:-1.4s; }
  [data-beat='crossing'] .horizon { transform:scale(.35);opacity:.22;transition:transform 1.2s ease,opacity 1.2s ease; }
  [data-beat='result'] .horizon { transform:scale(1.1);opacity:.78;transition:transform 1.1s ease,opacity 1.1s ease; }
  .ceremony-copy { position:relative;width:min(42rem,84vw);text-align:center; }
  .ceremony-copy span { color:rgba(177,222,240,.82);font:700 .6875rem/1.2 system-ui,sans-serif;letter-spacing:.16em;text-transform:uppercase; }
  h2 { margin:.65rem 0 .5rem;color:#eefaff;font:500 clamp(1.7rem,4vw,3.2rem)/1.1 Georgia,serif;text-shadow:0 0 2.2rem rgba(121,205,234,.28); }
  p { margin:0;color:rgba(216,237,246,.82);font:italic clamp(1rem,1.8vw,1.2rem)/1.5 Georgia,serif; }
  ol { position:absolute;left:50%;bottom:10%;width:min(34rem,76vw);display:grid;grid-template-columns:repeat(3,1fr);gap:.4rem;margin:0;padding:0;transform:translateX(-50%);list-style:none; }
  li { padding-top:.45rem;color:rgba(183,205,215,.68);border-top:1px dashed currentColor;font:700 .6875rem/1.2 system-ui,sans-serif;letter-spacing:.08em;text-align:center;text-transform:uppercase; }
  li.complete { color:rgba(147,220,238,.76);border-style:double; }
  li.active { color:#eefaff;border-top:2px solid #9cdef2; }
  button { position:absolute;left:50%;bottom:3.5%;min-height:2.5rem;padding:.65rem 1.3rem;transform:translateX(-50%);color:#061017;background:#bceaf7;border:1px solid #e8fbff;border-radius:999px;font:700 .75rem/1 system-ui,sans-serif;cursor:pointer; }
  button:focus-visible { outline:3px solid white;outline-offset:.2rem; }
  @keyframes deep-fold { from { transform:scale(.88); } to { transform:scale(1.04); } }
  .reduced *,
  :global(html[data-motion='reduced']) .deep-ceremony * { animation:none!important;transition:none!important; }
</style>

<script lang="ts">
  import { onDestroy, onMount } from 'svelte'
  import { game } from '../engine/game.svelte'
  import { universeById } from '../content/universes'
  import { gamePaused } from '../core/pause.svelte'
  import {
    consumeCrossingHabitBreak,
    consumeCrossingLumenStumble,
  } from '../experience/crossing-arrival.svelte'
  import { lumenComplicityLinesFor } from '../content/lumen-complicity'

  type LumenImportance = 'ambient' | 'reflective' | 'important'
  type LumenTemperature = 'ember' | 'afterglow' | 'deep'

  let { onactivitychange = () => {}, resetToken = 0 }: { onactivitychange?: (active: boolean) => void; resetToken?: number } = $props()

  interface HistoryLine {
    readonly id: string
    readonly text: string
    readonly importance: LumenImportance
  }

  let current = $state<HistoryLine | null>(null)
  let currentUniverse = $state(game.activeUniverse)
  let history = $state<HistoryLine[]>([])
  let historyOpen = $state(false)
  let timer: ReturnType<typeof setTimeout> | undefined
  let wallNow = $state(Date.now())
  let handledResetToken = $state(0)

  const words = $derived(current?.text.trim().split(/\s+/) ?? [])
  const temperature = $derived<LumenTemperature>(
    game.seen.includes('act3-hook') || game.collapses > 0
      ? 'deep'
      : game.supernovae > 0
        ? 'afterglow'
        : 'ember',
  )

  function importanceFor(id: string): LumenImportance {
    if (/act[237]|question|loom|ending|epi-|nova-1|first-epoch|remnant-.*-whole/.test(id)) return 'important'
    if (/remnant-|curiosity|first-|vessel|echo|crossing|cross-habit/.test(id)) return 'reflective'
    return 'ambient'
  }

  function present(entry: { readonly id: string; readonly text: string }) {
    const line: HistoryLine = { ...entry, importance: importanceFor(entry.id) }
    history = [line, ...history.filter(({ id }) => id !== line.id)].slice(0, 5)
    current = line
    clearTimeout(timer)
    timer = setTimeout(() => (current = null), line.importance === 'important' ? 8_600 : 7_000)
  }

  function clearImportance() {
    if (document.documentElement.dataset.lumenImportance) {
      delete document.documentElement.dataset.lumenImportance
    }
  }

  $effect(() => {
    const importance = current?.importance
    if (importance === 'important') document.documentElement.dataset.lumenImportance = importance
    else clearImportance()
    return clearImportance
  })

  $effect(() => {
    if (resetToken === handledResetToken) return
    handledResetToken = resetToken
    clearTimeout(timer)
    current = null
    history = []
    historyOpen = false
    clearImportance()
    delete document.documentElement.dataset.lumenHistory
    onactivitychange(false)
  })

  $effect(() => {
    onactivitychange(current !== null || historyOpen)
    return () => onactivitychange(false)
  })

  $effect(() => {
    if (historyOpen) document.documentElement.dataset.lumenHistory = 'open'
    else delete document.documentElement.dataset.lumenHistory
    return () => delete document.documentElement.dataset.lumenHistory
  })

  $effect(() => {
    const universeId = game.activeUniverse
    if (currentUniverse !== universeId) {
      currentUniverse = universeId
      current = null
      history = []
      historyOpen = false
      clearTimeout(timer)
    }
    if (gamePaused() || current) return
    const crossingLine = consumeCrossingLumenStumble(universeId)
      ?? consumeCrossingHabitBreak(universeId, wallNow)
    if (crossingLine) {
      present(crossingLine)
      return
    }
    const universeLines = universeById(universeId).lumen
    const storyGate = universeLines
      .find((candidate) => candidate.id === 'act3-hook' && !game.seen.includes(candidate.id) && candidate.when(game))
    const metaLine = lumenComplicityLinesFor(universeId)
      .find((candidate) => !game.seen.includes(candidate.id) && candidate.when(game))
    const line = storyGate
      ?? metaLine
      ?? universeLines.find((candidate) => !game.seen.includes(candidate.id) && candidate.when(game))
    if (!line) return
    game.seen.push(line.id)
    present(line)
  })

  onMount(() => {
    const clock = window.setInterval(() => (wallNow = Date.now()), 1_000)
    return () => window.clearInterval(clock)
  })

  onDestroy(() => {
    clearTimeout(timer)
    clearImportance()
    delete document.documentElement.dataset.lumenHistory
  })
</script>

{#if current || history.length > 0}
  <aside class="lumen-shell" class:history-open={historyOpen} data-temperature={temperature} aria-label="Lumen commentary">
    {#if current}
      <div class="lumen-vignette" class:important={current.importance === 'important'} aria-hidden="true"></div>
      {#key current.id}
        <p class="lumen story-type" class:important={current.importance === 'important'} role="status" aria-live="polite" aria-label={current.text}>
          {#each words as word, index}
            <span aria-hidden="true" style={`--word:${index}`}>{word}</span>{' '}
          {/each}
        </p>
      {/key}
    {/if}

    <button
      type="button"
      class="history-quill instrument-panel"
      class:active={historyOpen}
      aria-label={historyOpen ? 'Close recent Lumen lines' : 'Read recent Lumen lines'}
      aria-expanded={historyOpen}
      onclick={() => (historyOpen = !historyOpen)}
    ><i aria-hidden="true"></i></button>

    {#if historyOpen}
      <section class="lumen-history instrument-panel" aria-label="Five most recent Lumen lines">
        <header><span>Lumen’s margin</span><strong>{history.length}/5</strong></header>
        <ol>
          {#each history as line (line.id)}
            <li class:important={line.importance === 'important'}>{line.text}</li>
          {/each}
        </ol>
      </section>
    {/if}
  </aside>
{/if}

<style>
  .lumen-shell {
    --lumen-ink: rgba(239, 222, 205, 0.82);
    position: fixed;
    left: 50%;
    bottom: 5.8vh;
    width: min(92vw, 42rem);
    transform: translateX(-50%);
    display: grid;
    justify-items: center;
    pointer-events: none;
    z-index: 5;
  }
  .lumen-shell[data-temperature='afterglow'] { --lumen-ink: rgba(218, 210, 244, 0.84); }
  .lumen-shell[data-temperature='deep'] { --lumen-ink: rgba(185, 216, 230, 0.8); }
  .lumen-vignette {
    position: fixed;
    inset: 0;
    z-index: -1;
    background: radial-gradient(ellipse at 50% 67%, rgba(4, 3, 10, 0.01) 0 14%, rgba(4, 3, 10, 0.11) 48%, rgba(4, 3, 10, 0.28) 100%);
    animation: vignette-in 700ms ease both;
  }
  .lumen-vignette.important {
    background: radial-gradient(ellipse at 50% 66%, rgba(4, 3, 10, 0.04) 0 13%, rgba(4, 3, 10, 0.17) 50%, rgba(4, 3, 10, 0.32) 100%);
  }
  .lumen {
    max-width: min(82vw, 38rem);
    margin: 0;
    padding: 0.45rem 1.4rem 0.7rem;
    color: var(--lumen-ink);
    font-size: clamp(0.98rem, 1.5vw, 1.12rem);
    font-weight: 360;
    font-style: italic;
    line-height: 1.48;
    text-align: center;
    text-shadow: 0 0 1.1rem color-mix(in srgb, var(--lumen-ink) 22%, transparent);
  }
  .lumen.important { font-size: clamp(1.05rem, 1.7vw, 1.24rem); color: color-mix(in srgb, var(--lumen-ink) 88%, white); }
  .lumen span {
    display: inline-block;
    opacity: 0;
    transform: translateY(0.24em);
    animation: word-arrive 420ms ease forwards;
    animation-delay: calc(var(--word) * 38ms + 120ms);
  }
  .history-quill {
    position: absolute;
    right: 0;
    bottom: 0.05rem;
    width: 1.8rem;
    height: 1.8rem;
    display: grid;
    place-items: center;
    padding: 0;
    color: color-mix(in srgb, var(--lumen-ink) 72%, transparent);
    cursor: pointer;
    pointer-events: auto;
    opacity: 0.56;
    transition: opacity 140ms ease, color 140ms ease;
  }
  .history-quill:hover,
  .history-quill:focus-visible,
  .history-quill.active { opacity: 1; color: var(--lumen-ink); }
  .history-quill i {
    width: 0.74rem;
    height: 0.18rem;
    transform: rotate(-48deg);
    border-radius: 100% 0 100% 0;
    background: currentColor;
    box-shadow: -0.12rem 0.16rem 0 -0.04rem currentColor;
  }
  .lumen-history {
    position: absolute;
    right: 0;
    bottom: 2.35rem;
    width: min(24rem, calc(100vw - 1.5rem));
    padding: 0.72rem 0.82rem 0.8rem;
    color: var(--lumen-ink);
    pointer-events: auto;
    animation: history-in 180ms ease both;
  }
  .lumen-history header { display: flex; justify-content: space-between; align-items: baseline; padding: 0 0.1rem 0.48rem; border-bottom: 1px solid color-mix(in srgb, var(--lumen-ink) 12%, transparent); }
  .lumen-history header span { font: 650 0.64rem/1 var(--font-interface); letter-spacing: var(--label-tracking); text-transform: uppercase; opacity: 0.62; }
  .lumen-history header strong { font: 600 0.62rem/1 var(--font-interface); font-variant-numeric: tabular-nums; opacity: 0.46; }
  .lumen-history ol { display: grid; gap: 0.42rem; margin: 0.62rem 0 0; padding: 0; list-style: none; }
  .lumen-history li { font: 360 italic 0.78rem/1.36 var(--font-story); opacity: 0.56; }
  .lumen-history li:first-child { opacity: 0.9; }
  .lumen-history li.important { color: color-mix(in srgb, var(--lumen-ink) 86%, white); }
  @keyframes word-arrive { to { opacity: 1; transform: translateY(0); } }
  @keyframes vignette-in { from { opacity: 0; } to { opacity: 1; } }
  @keyframes history-in { from { opacity: 0; transform: translateY(0.35rem); } to { opacity: 1; transform: translateY(0); } }
  @media (max-width: 800px) {
    .lumen-shell { bottom: var(--mobile-transient-bottom, 41vh); width: calc(100vw - 1rem); transition: bottom 0.32s ease; }
    .lumen { max-width: calc(100vw - 3rem); padding-inline: 0.4rem; font-size: 0.92rem; }
    .history-quill { right: 0.1rem; }
    .lumen-history {
      position: fixed;
      left: max(0.5rem, env(safe-area-inset-left, 0px));
      right: max(0.5rem, env(safe-area-inset-right, 0px));
      top: max(11.5rem, calc(env(safe-area-inset-top, 0px) + 10.75rem));
      bottom: var(--mobile-history-bottom, calc(var(--mobile-dock-height, 4.35rem) + 0.5rem));
      width: auto;
      overflow-y: auto;
    }
  }
  @media (max-width: 380px) {
    .lumen-history { top: 11.25rem; }
  }
  @media (prefers-reduced-motion: reduce) {
    .lumen span, .lumen-vignette, .lumen-history { animation: none; opacity: 1; transform: none; }
  }
</style>

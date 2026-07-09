<script lang="ts">
  import { ECHOES } from '../content/echoes'
  import { ENDING_CHOICES } from '../content/endings'
  import { game } from '../engine/game.svelte'

  let { onclose, onremember }: { onclose: () => void; onremember: () => void } = $props()
  let openId = $state<string | null>(null)
  let rememberArmed = $state(false)

  const reading = $derived(ECHOES.find((e) => e.id === openId) ?? null)
  const found = $derived(game.echoes.length)
  const answer = $derived(ENDING_CHOICES.find((c) => c.id === game.ending) ?? null)
  const readingAnswer = $derived(openId === 'the-answer' && answer !== null)
</script>

<section class="codex">
  <header>
    <h2>Codex of Echoes</h2>
    <span class="count">{found} / {ECHOES.length} recovered</span>
    <button class="close" onclick={onclose}>✕</button>
  </header>

  {#if readingAnswer && answer}
    <article class="page">
      <button class="back" onclick={() => (openId = null)}>‹ echoes</button>
      <h3>The Answer — {answer.label}</h3>
      <p class="prov">the last entry in the old archive. written by you.</p>
      <p class="body">“{answer.line}”

{answer.epilogue.join('\n\n')}</p>
      <div class="remembrance">
        {#if !rememberArmed}
          <p class="rem-pitch">
            Lumen can fold all of this into memory — every sun, every trial, every grain of stardust —
            and wake you at the first pixel, twice as bright. The echoes stay. The record stays.
            The question may be answered again.
          </p>
          <button class="rem-btn" onclick={() => (rememberArmed = true)}>Remember it all again</button>
        {:else}
          <p class="rem-pitch warn">
            Everything returns to the dark — light, kindlings, stardust, the Deep. Only memory survives.
          </p>
          <div class="rem-confirm">
            <button class="rem-btn go" onclick={() => { rememberArmed = false; onremember() }}>Close the archive</button>
            <button class="rem-btn stay" onclick={() => (rememberArmed = false)}>Not yet</button>
          </div>
        {/if}
      </div>
    </article>
  {:else if reading}
    <article class="page">
      <button class="back" onclick={() => (openId = null)}>‹ echoes</button>
      <h3>{reading.title}</h3>
      <p class="prov">{reading.provenance}</p>
      <p class="body">{reading.text}</p>
    </article>
  {:else}
    <ul>
      {#if answer}
        <li>
          <button class="entry answer" onclick={() => (openId = 'the-answer')}>
            <span class="mark">✧</span>The Answer — {answer.label}
          </button>
        </li>
      {/if}
      {#each ECHOES as echo (echo.id)}
        {@const owned = game.echoes.includes(echo.id)}
        {#if owned}
          <li>
            <button class="entry" onclick={() => (openId = echo.id)}>
              <span class="mark">❖</span>{echo.title}
            </button>
          </li>
        {:else}
          <li class="missing"><span class="mark">·</span>???</li>
        {/if}
      {/each}
    </ul>
  {/if}
</section>

<style>
  .codex {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: min(26rem, 92vw);
    max-height: 76vh;
    overflow-y: auto;
    padding: 1.1rem 1.3rem;
    background: rgba(12, 10, 20, 0.95);
    border: 1px solid rgba(255, 217, 138, 0.18);
    border-radius: 16px;
    backdrop-filter: blur(14px);
    z-index: 9;
    animation: codex-in 0.45s ease both;
    scrollbar-width: thin;
  }
  @keyframes codex-in {
    from { opacity: 0; transform: translate(-50%, -48%); }
    to { opacity: 1; transform: translate(-50%, -50%); }
  }
  header {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    margin-bottom: 0.8rem;
  }
  h2 {
    margin: 0;
    flex: 1;
    font-size: 0.72rem;
    font-weight: 600;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: var(--dim);
  }
  .count {
    font-size: 0.75rem;
    color: var(--dim);
    font-variant-numeric: tabular-nums;
  }
  .close {
    background: none;
    border: none;
    color: var(--dim);
    font-size: 0.95rem;
    cursor: pointer;
  }
  ul {
    list-style: none;
    margin: 0;
    padding: 0;
  }
  li { margin-bottom: 0.25rem; }
  .entry {
    display: flex;
    align-items: center;
    gap: 0.55rem;
    width: 100%;
    padding: 0.45rem 0.6rem;
    font: inherit;
    font-size: 0.92rem;
    color: var(--gold);
    background: rgba(255, 217, 138, 0.05);
    border: 1px solid rgba(255, 217, 138, 0.12);
    border-radius: 9px;
    text-align: left;
    cursor: pointer;
    transition: background 0.15s;
  }
  .entry:hover { background: rgba(255, 217, 138, 0.12); }
  .entry.answer {
    color: #d8d2ff;
    border-color: rgba(180, 170, 255, 0.3);
    background: rgba(180, 170, 255, 0.06);
  }
  .entry.answer:hover { background: rgba(180, 170, 255, 0.14); }
  .missing {
    display: flex;
    align-items: center;
    gap: 0.55rem;
    padding: 0.45rem 0.6rem;
    font-size: 0.92rem;
    color: #4a4660;
  }
  .mark { width: 1rem; text-align: center; }

  .page .back {
    margin-bottom: 0.6rem;
    padding: 0;
    font: inherit;
    font-size: 0.8rem;
    color: var(--dim);
    background: none;
    border: none;
    cursor: pointer;
  }
  .page h3 {
    margin: 0;
    font-family: Georgia, serif;
    font-weight: 600;
    font-size: 1.2rem;
    color: var(--gold);
  }
  .prov {
    margin: 0.2rem 0 0.9rem;
    font-size: 0.74rem;
    font-style: italic;
    color: var(--dim);
  }
  .body {
    margin: 0;
    font-family: Georgia, serif;
    font-size: 0.95rem;
    line-height: 1.65;
    color: rgba(230, 226, 245, 0.92);
    white-space: pre-line;
  }
  .remembrance {
    margin-top: 1.1rem;
    padding-top: 0.9rem;
    border-top: 1px solid rgba(180, 170, 255, 0.15);
  }
  .rem-pitch {
    margin: 0 0 0.6rem;
    font-family: Georgia, serif;
    font-style: italic;
    font-size: 0.82rem;
    line-height: 1.55;
    color: rgba(200, 195, 230, 0.8);
  }
  .rem-pitch.warn { color: #ffcf9e; }
  .rem-confirm { display: flex; gap: 0.5rem; }
  .rem-btn {
    padding: 0.4rem 1.1rem;
    font: inherit;
    font-size: 0.85rem;
    font-weight: 650;
    color: #14102a;
    background: linear-gradient(180deg, #efeaff, #b6aaf5);
    border: none;
    border-radius: 999px;
    cursor: pointer;
    transition: transform 0.08s;
  }
  .rem-btn:hover { transform: scale(1.04); }
  .rem-btn.stay {
    background: none;
    color: var(--dim);
    border: 1px solid rgba(255, 255, 255, 0.15);
  }
</style>

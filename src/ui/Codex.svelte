<script lang="ts">
  import { onMount } from 'svelte'
  import { ENDING_CHOICES } from '../content/endings'
  import { UNIVERSES, universeById } from '../content/universes'
  import { game } from '../engine/game.svelte'
  import { buildStoryTranscript } from '../experience/story-archive'
  import { CLOCKWORK_REVELATION_TRIGGER } from '../content/universes/clockwork/revelation'

  let {
    onclose,
    onremember,
    onreplayclockwork = () => {},
  }: {
    onclose: () => void
    onremember: () => void
    onreplayclockwork?: () => void
  } = $props()
  let closeButton: HTMLButtonElement
  let activeTab = $state<'journal' | 'echoes'>('journal')
  let openId = $state<string | null>(null)

  const echoes = $derived(universeById(game.activeUniverse).echoes)
  const reading = $derived(echoes.find((e) => e.id === openId) ?? null)
  const found = $derived(game.echoes.length)
  const answer = $derived(ENDING_CHOICES.find((c) => c.id === game.ending) ?? null)
  const readingAnswer = $derived(openId === 'the-answer' && answer !== null)
  const transcript = $derived(buildStoryTranscript(
    UNIVERSES,
    game.activeUniverse,
    game.seen,
    game.universeRuns,
  ))
  const clockworkRevelationRemembered = $derived(
    game.activeUniverse === 'clockwork'
    && game.seen.includes(CLOCKWORK_REVELATION_TRIGGER.seenId),
  )

  onMount(() => closeButton.focus())

  function selectTab(tab: 'journal' | 'echoes') {
    activeTab = tab
    openId = null
  }
</script>

<section class="codex instrument-panel">
  <header class="codex-header">
    <h2>Story Archive</h2>
    <span class="count">{activeTab === 'journal' ? `${transcript.count} lines remembered` : `${found} / ${echoes.length} recovered`}</span>
    <button bind:this={closeButton} class="close" aria-label="close the Story Archive" onclick={onclose}>✕</button>
  </header>

  <div class="tabs" role="tablist" aria-label="Story archive sections">
    <button
      id="journal-tab"
      type="button"
      role="tab"
      aria-selected={activeTab === 'journal'}
      aria-controls="journal-panel"
      class:active={activeTab === 'journal'}
      onclick={() => selectTab('journal')}
    >Lumen Journal <span>{transcript.count}</span></button>
    <button
      id="echoes-tab"
      type="button"
      role="tab"
      aria-selected={activeTab === 'echoes'}
      aria-controls="echoes-panel"
      class:active={activeTab === 'echoes'}
      onclick={() => selectTab('echoes')}
    >Recovered Echoes <span>{found}</span></button>
  </div>

  {#if activeTab === 'journal'}
    <div id="journal-panel" class="journal" role="tabpanel" aria-labelledby="journal-tab">
      {#if transcript.latest}
        <article class="latest-line">
          <small>latest · {transcript.latest.universeName}</small>
          <p>“{transcript.latest.text}”</p>
        </article>
      {/if}

      {#if clockworkRevelationRemembered}
        <article class="revelation-memory">
          <div>
            <small>Clockwork finale · replayable</small>
            <strong>The Unscheduled Interval</strong>
            <p>The schedule’s blank date still opens beyond the restored city.</p>
          </div>
          <button onclick={onreplayclockwork}>Replay interval</button>
        </article>
      {/if}

      {#if transcript.groups.length > 0}
        <div class="transcript-intro">
          <strong>Everything Lumen has said so far</strong>
          <span>Lines remain in the order you encountered them.</span>
        </div>
        <div class="transcript-groups">
          {#each transcript.groups as group (group.universeId)}
            <section class="transcript-world" class:current={group.current} aria-label={`${group.universeName} Lumen transcript`}>
              <div class="world-heading">
                <div><span>{group.current ? 'current universe' : 'visited universe'}</span><strong>{group.universeName}</strong></div>
                <small>{group.entries.length} {group.entries.length === 1 ? 'line' : 'lines'}</small>
              </div>
              <ol>
                {#each group.entries as entry, index (entry.id)}
                  <li>
                    <span class="sequence" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                    <p>{entry.text}</p>
                  </li>
                {/each}
              </ol>
            </section>
          {/each}
        </div>
      {:else}
        <p class="empty-journal">Lumen has not spoken yet. The first remembered line will appear here.</p>
      {/if}
    </div>
  {:else if readingAnswer && answer}
    <div id="echoes-panel" class="page" role="tabpanel" aria-labelledby="echoes-tab">
      <button class="back" onclick={() => (openId = null)}>‹ echoes</button>
      <h3>The Answer — {answer.label}</h3>
      <p class="prov">the last entry in the old archive. written by you.</p>
      <p class="body">“{answer.line}”

{answer.epilogue.join('\n\n')}</p>
      <div class="remembrance">
        <p class="rem-pitch">
          Lumen can fold this active universe into memory and wake you at its first pixel, twice as bright.
          Other universes, the Archive, the Between, settings, and the permanent record remain.
        </p>
        <button class="rem-btn" onclick={onremember}>Review Remembrance</button>
      </div>
    </div>
  {:else if reading}
    <div id="echoes-panel" class="page" role="tabpanel" aria-labelledby="echoes-tab">
      <button class="back" onclick={() => (openId = null)}>‹ echoes</button>
      <h3>{reading.title}</h3>
      <p class="prov">{reading.provenance}</p>
      <p class="body">{reading.text}</p>
    </div>
  {:else}
    <div id="echoes-panel" role="tabpanel" aria-labelledby="echoes-tab">
      <ul class="echo-list">
        {#if answer}
          <li>
            <button class="entry answer" onclick={() => (openId = 'the-answer')}>
              <span class="mark">✧</span>The Answer — {answer.label}
            </button>
          </li>
        {/if}
        {#each echoes as echo (echo.id)}
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
    </div>
  {/if}
</section>

<style>
  .codex {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: min(42rem, 92vw);
    max-height: 76vh;
    overflow-y: auto;
    padding: 1.1rem 1.3rem;
    background: rgba(12, 10, 20, 0.95);
    border: 1px solid rgba(255, 217, 138, 0.18);
    border-radius: 16px;
    backdrop-filter: blur(14px);
    z-index: 9;
    animation: codex-in 0.24s ease both;
    scrollbar-width: thin;
  }
  @keyframes codex-in {
    from { opacity: 0; transform: translate(-50%, -48%); }
    to { opacity: 1; transform: translate(-50%, -50%); }
  }
  .codex-header {
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
  .tabs {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.32rem;
    margin-bottom: 0.72rem;
    padding: 0.25rem;
    background: rgba(255, 255, 255, 0.025);
    border: 1px solid rgba(255, 255, 255, 0.055);
    border-radius: 11px;
  }
  .tabs button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.45rem;
    padding: 0.48rem 0.6rem;
    color: var(--dim);
    font: inherit;
    font-size: 0.7rem;
    background: transparent;
    border: 1px solid transparent;
    border-radius: 8px;
    cursor: pointer;
  }
  .tabs button span {
    min-width: 1.25rem;
    padding: 0.08rem 0.3rem;
    color: rgba(220, 214, 242, 0.72);
    font-size: 0.58rem;
    text-align: center;
    background: rgba(255, 255, 255, 0.055);
    border-radius: 999px;
  }
  .tabs button.active {
    color: var(--gold);
    background: rgba(255, 217, 138, 0.055);
    border-color: rgba(255, 217, 138, 0.16);
  }

  .journal { min-width: 0; }
  .latest-line {
    padding: 0.85rem 1rem;
    background:
      radial-gradient(ellipse at 0 50%, rgba(180, 170, 255, 0.1), transparent 48%),
      rgba(180, 170, 255, 0.035);
    border: 1px solid rgba(180, 170, 255, 0.16);
    border-left: 2px solid rgba(216, 210, 255, 0.6);
    border-radius: 4px 12px 12px 4px;
  }
  .latest-line small {
    color: rgba(184, 177, 218, 0.72);
    font-size: 0.56rem;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }
  .latest-line p {
    margin: 0.28rem 0 0;
    color: rgba(235, 231, 249, 0.94);
    font: italic 0.98rem/1.55 Georgia, serif;
  }
  .revelation-memory {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    margin-top: .62rem;
    padding: .72rem .82rem;
    background:
      linear-gradient(110deg, rgba(225, 185, 108, .08), transparent 55%),
      rgba(143, 217, 240, .025);
    border: 1px solid rgba(225, 185, 108, .2);
    border-radius: 5px 12px 12px 5px;
  }
  .revelation-memory small { display: block; color: rgba(143, 217, 240, .62); font-size: .5rem; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; }
  .revelation-memory strong { display: block; margin-top: .18rem; color: #e2d8c5; font: 500 .94rem/1.2 Georgia, serif; }
  .revelation-memory p { margin: .18rem 0 0; color: var(--dim); font: italic .7rem/1.35 Georgia, serif; }
  .revelation-memory button { flex: 0 0 auto; padding: .46rem .66rem; color: #e7d7b6; background: rgba(225,185,108,.07); border: 1px solid rgba(225,185,108,.26); border-radius: 999px; font: 700 .58rem/1 system-ui, sans-serif; cursor: pointer; }
  .revelation-memory button:hover { background: rgba(225,185,108,.14); }
  .transcript-intro {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 1rem;
    margin: 0.92rem 0 0.48rem;
    padding: 0 0.18rem;
  }
  .transcript-intro strong { color: rgba(226, 221, 244, 0.82); font-size: 0.68rem; }
  .transcript-intro span { color: var(--dim); font-size: 0.58rem; }
  .transcript-groups { display: grid; gap: 0.55rem; }
  .transcript-world {
    padding: 0.65rem 0.72rem;
    background: rgba(255, 255, 255, 0.018);
    border: 1px solid rgba(255, 255, 255, 0.055);
    border-radius: 11px;
  }
  .transcript-world.current { border-color: color-mix(in srgb, var(--gold) 18%, transparent); }
  .world-heading {
    display: flex;
    align-items: end;
    justify-content: space-between;
    gap: 1rem;
    padding-bottom: 0.48rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  }
  .world-heading div > span {
    display: block;
    color: var(--dim);
    font-size: 0.49rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }
  .world-heading strong { display: block; margin-top: 0.08rem; color: var(--gold); font: 500 0.88rem/1.2 Georgia, serif; }
  .world-heading > small { color: var(--dim); font-size: 0.56rem; }
  .transcript-world ol { list-style: none; margin: 0; padding: 0; }
  .transcript-world li {
    display: grid;
    grid-template-columns: 1.6rem minmax(0, 1fr);
    gap: 0.5rem;
    margin: 0;
    padding: 0.55rem 0.15rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.045);
  }
  .transcript-world li:last-child { border-bottom: 0; }
  .sequence {
    padding-top: 0.12rem;
    color: rgba(180, 170, 255, 0.45);
    font-size: 0.52rem;
    font-variant-numeric: tabular-nums;
    letter-spacing: 0.06em;
  }
  .transcript-world li p {
    margin: 0;
    color: rgba(220, 216, 237, 0.86);
    font: italic 0.8rem/1.48 Georgia, serif;
  }
  .empty-journal { margin: 1.2rem 0; color: var(--dim); font: italic 0.86rem/1.5 Georgia, serif; text-align: center; }

  .echo-list {
    list-style: none;
    margin: 0;
    padding: 0;
  }
  .echo-list li { margin-bottom: 0.25rem; }
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

  .page { max-width: 34rem; margin: 0 auto; }
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
</style>

<script lang="ts">
  import { game, wipe, hasUi } from '../engine/game.svelte'
  import { THEMES } from '../content/themes'
  import { exportSave, importSave, hardReset, save } from '../core/save'
  import { setMasterVolume } from '../audio/sfx'
  import { setMusicVolume } from '../audio/music'

  let { onclose }: { onclose: () => void } = $props()

  let exportCode = $state('')
  let importCode = $state('')
  let message = $state('')

  function onVolume(e: Event) {
    const v = Number((e.target as HTMLInputElement).value)
    game.sfxVolume = v
    setMasterVolume(v)
  }

  function onMusicVolume(e: Event) {
    const v = Number((e.target as HTMLInputElement).value)
    game.musicVolume = v
    setMusicVolume(v)
  }

  async function doExport() {
    exportCode = exportSave()
    try {
      await navigator.clipboard.writeText(exportCode)
      message = 'Copied to clipboard.'
    } catch {
      message = 'Copy the code below.'
    }
  }

  function doImport() {
    if (!importCode.trim()) return
    if (importSave(importCode)) {
      message = 'The light remembers.'
      importCode = ''
    } else {
      message = 'That code isn’t light. Check it and try again.'
    }
  }

  function doReset() {
    if (!confirm('Let the ember go out? All light will be lost.')) return
    hardReset()
    wipe()
    save()
    onclose()
  }
</script>

<section class="panel">
  <header>
    <h2>A Way to Choose</h2>
    <button class="close" onclick={onclose}>✕</button>
  </header>

  <label class="field">
    <span>sound</span>
    <input type="range" min="0" max="1" step="0.05" value={game.sfxVolume} oninput={onVolume} />
  </label>

  {#if hasUi('music')}
    <label class="field">
      <span>music</span>
      <input type="range" min="0" max="1" step="0.05" value={game.musicVolume} oninput={onMusicVolume} />
    </label>
  {/if}

  <div class="vestments">
    <span class="vlabel">vestment</span>
    <div class="swatches">
      {#each THEMES as t (t.id)}
        {@const open = t.unlocked(game)}
        <button
          class="swatch"
          class:active={game.theme === t.id}
          class:locked={!open}
          style:--sw={t.vars['--amber']}
          title={open ? `${t.name} — ${t.flavor}` : `${t.name} — ${t.unlockText}`}
          onclick={() => open && (game.theme = t.id)}
        >
          <span class="dot"></span>
          <span class="sname">{open ? t.name : '???'}</span>
        </button>
      {/each}
    </div>
  </div>

  <div class="group">
    <button class="action" onclick={doExport}>Export save</button>
    {#if exportCode}
      <textarea readonly rows="3" value={exportCode} onclick={(e) => (e.target as HTMLTextAreaElement).select()}></textarea>
    {/if}
  </div>

  <div class="group">
    <button class="action" onclick={doImport}>Import save</button>
    <textarea rows="3" bind:value={importCode} placeholder="paste a save code..."></textarea>
  </div>

  {#if message}
    <p class="message">{message}</p>
  {/if}

  <button class="danger" onclick={doReset}>Let the ember go out</button>
</section>

<style>
  .panel {
    position: fixed;
    top: 50%;
    left: 1.25rem;
    transform: translateY(-50%);
    width: 19rem;
    max-height: 80vh;
    overflow-y: auto;
    padding: 1rem 1.1rem;
    background: var(--panel);
    border: 1px solid rgba(255, 179, 92, 0.14);
    border-radius: 14px;
    backdrop-filter: blur(10px);
    z-index: 6;
    animation: panel-in 0.5s ease both;
    scrollbar-width: thin;
  }
  @keyframes panel-in {
    from { opacity: 0; transform: translateY(-50%) translateX(-14px); }
    to { opacity: 1; transform: translateY(-50%) translateX(0); }
  }
  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.9rem;
  }
  h2 {
    margin: 0;
    font-size: 0.72rem;
    font-weight: 600;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: var(--dim);
  }
  .close {
    background: none;
    border: none;
    color: var(--dim);
    font-size: 0.9rem;
    cursor: pointer;
  }
  .field {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    font-size: 0.85rem;
    color: var(--dim);
    margin-bottom: 1rem;
  }
  input[type='range'] {
    flex: 1;
    accent-color: var(--amber);
  }
  .vestments {
    margin-bottom: 1rem;
  }
  .vlabel {
    display: block;
    margin-bottom: 0.4rem;
    font-size: 0.85rem;
    color: var(--dim);
  }
  .swatches {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.35rem;
  }
  .swatch {
    display: flex;
    align-items: center;
    gap: 0.45rem;
    padding: 0.4rem 0.55rem;
    font: inherit;
    font-size: 0.78rem;
    color: var(--text);
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 8px;
    cursor: pointer;
    text-align: left;
    transition: border-color 0.15s;
  }
  .swatch .dot {
    flex: none;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: var(--sw);
    box-shadow: 0 0 8px var(--sw);
  }
  .swatch.active {
    border-color: var(--sw);
  }
  .swatch.locked {
    opacity: 0.4;
    cursor: default;
  }
  .swatch.locked .dot {
    background: #3a374d;
    box-shadow: none;
  }
  .sname {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .group {
    margin-bottom: 0.9rem;
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }
  .action {
    align-self: flex-start;
    padding: 0.35rem 0.9rem;
    font: inherit;
    font-size: 0.82rem;
    font-weight: 600;
    color: var(--gold);
    background: rgba(255, 179, 92, 0.08);
    border: 1px solid rgba(255, 179, 92, 0.3);
    border-radius: 8px;
    cursor: pointer;
  }
  .action:hover {
    background: rgba(255, 179, 92, 0.16);
  }
  textarea {
    width: 100%;
    resize: vertical;
    font-size: 0.7rem;
    font-family: ui-monospace, monospace;
    color: var(--text);
    background: rgba(0, 0, 0, 0.35);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    padding: 0.4rem;
  }
  .message {
    font-size: 0.8rem;
    font-family: Georgia, serif;
    font-style: italic;
    color: var(--dim);
  }
  .danger {
    margin-top: 0.4rem;
    padding: 0.35rem 0.9rem;
    font: inherit;
    font-size: 0.82rem;
    color: #ff9d9d;
    background: rgba(255, 80, 80, 0.06);
    border: 1px solid rgba(255, 100, 100, 0.25);
    border-radius: 8px;
    cursor: pointer;
  }
  .danger:hover {
    background: rgba(255, 80, 80, 0.14);
  }
  @media (max-width: 720px) {
    .panel {
      left: 0.6rem;
      right: 0.6rem;
      width: auto;
      top: 3.6rem;
      transform: none;
      max-height: 50vh;
    }
  }
</style>

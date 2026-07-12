<script lang="ts">
  import { onMount } from 'svelte'
  import { game, wipe, hasUi } from '../engine/game.svelte'
  import { THEMES, themeVarsForUniverse } from '../content/themes'
  import { universeById } from '../content/universes'
  import {
    exportSave,
    exportV12Rollback,
    importSave,
    hardReset,
    listSaveBackups,
    restoreSaveBackup,
    save,
    saveRecoveryMessage,
    type SaveBackupId,
    type SaveBackupSummary,
  } from '../core/save'
  import { setMasterVolume } from '../audio/sfx'
  import { setMusicVolume } from '../audio/music'
  import { resolveVisualQuality, type BeatVisual, type MotionPreference, type TextScale, type VisualQuality } from '../core/preferences'
  import { CREDIT_LINES, FEEDBACK_URL, GAME_VERSION, SOURCE_URL } from '../content/credits'
  import { renderHealth } from '../core/render-health.svelte'
  import { diagnosticReportText } from '../core/diagnostics'

  interface Props {
    onclose: () => void
    accessOnly?: boolean
    averagedRhythm?: boolean
    goalLensEnabled?: boolean
    promptsEnabled?: boolean
    onaveragedrhythmchange?: (enabled: boolean) => void
    ongoallenschange?: (enabled: boolean) => void
    onpromptschange?: (enabled: boolean) => void
  }

  let {
    onclose,
    accessOnly = false,
    averagedRhythm = false,
    goalLensEnabled = false,
    promptsEnabled = false,
    onaveragedrhythmchange,
    ongoallenschange,
    onpromptschange,
  }: Props = $props()
  let closeButton: HTMLButtonElement

  let exportCode = $state('')
  let importCode = $state('')
  let message = $state('')
  let backups = $state<SaveBackupSummary[]>([])
  let diagnosticCode = $state('')
  const activeUniverseId = $derived(universeById(game.activeUniverse).id)

  const effectiveQuality = $derived(resolveVisualQuality(game.visualQuality, {
    width: window.innerWidth,
    devicePixelRatio: window.devicePixelRatio || 1,
    hardwareConcurrency: navigator.hardwareConcurrency || 8,
  }))

  onMount(() => {
    closeButton.focus()
    backups = listSaveBackups()
    message = saveRecoveryMessage()
  })

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

  function setMotion(value: MotionPreference) {
    game.motionPreference = value
    save()
  }

  function setQuality(value: VisualQuality) {
    game.visualQuality = value
    save()
  }

  function setBeatVisual(value: BeatVisual) {
    game.beatVisual = value
    save()
  }

  function setTextScale(value: TextScale) {
    game.textScale = value
    save()
  }

  function toggleContrast() {
    game.highContrast = !game.highContrast
    save()
  }

  function chooseTheme(id: string) {
    game.theme = id
    save()
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

  async function doRollbackExport() {
    const rollback = exportV12Rollback()
    if (!rollback) {
      message = 'No pre-v13 rollback snapshot is available.'
      return
    }
    exportCode = rollback
    try {
      await navigator.clipboard.writeText(rollback)
      message = 'Original v12 rollback copied. It does not include progress made after migration.'
    } catch {
      message = 'Copy the original v12 rollback code below. It does not include later progress.'
    }
  }

  function doDownload() {
    const blob = new Blob([exportSave()], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `ember-save-${new Date().toISOString().slice(0, 10)}.txt`
    anchor.click()
    URL.revokeObjectURL(url)
    message = 'Save file prepared.'
  }

  async function copyDiagnostics() {
    diagnosticCode = diagnosticReportText()
    try {
      await navigator.clipboard.writeText(diagnosticCode)
      message = 'Playtest report copied. It contains settings and progression totals, never your save code.'
    } catch {
      message = 'Copy the playtest report below.'
    }
  }

  function doImport() {
    if (!importCode.trim()) return
    if (importSave(importCode)) {
      message = 'The light remembers.'
      importCode = ''
      // Imported saves replace nearly every reactive branch. Reloading after the
      // validated snapshot is committed guarantees one coherent mounted world.
      window.location.reload()
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

  function restoreBackup(id: SaveBackupId) {
    if (!confirm('Restore this backup? Your current state will be kept as a rolling backup.')) return
    if (!restoreSaveBackup(id)) {
      message = 'That backup could not be restored.'
      backups = listSaveBackups()
      return
    }
    window.location.reload()
  }

  function backupLabel(backup: SaveBackupSummary): string {
    const date = new Date(backup.savedAt)
    return `${backup.kind === 'daily' ? 'Daily' : 'Rolling'} · ${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
  }
</script>

<section class="panel instrument-panel" class:access-only={accessOnly} aria-labelledby="options-title">
  <header>
    <div>
      <span>{accessOnly ? 'always available · outside the fiction' : 'settings · accessibility · recovery'}</span>
      <h2 id="options-title">{accessOnly ? 'Access & Recovery' : 'A Way to Choose'}</h2>
    </div>
    <button bind:this={closeButton} class="close" aria-label="close settings" onclick={onclose}>✕</button>
  </header>

  <section class="settings-section">
    <div class="section-title"><span>01</span><div><h3>Sound</h3><p>Independent, persistent levels.</p></div></div>
    <label class="field">
      <span>effects <b>{Math.round(game.sfxVolume * 100)}%</b></span>
      <input aria-label="sound effects volume" type="range" min="0" max="1" step="0.05" value={game.sfxVolume} oninput={onVolume} onchange={() => save()} />
    </label>
    {#if hasUi('music')}
      <label class="field">
        <span>music <b>{Math.round(game.musicVolume * 100)}%</b></span>
        <input aria-label="music volume" type="range" min="0" max="1" step="0.05" value={game.musicVolume} oninput={onMusicVolume} onchange={() => save()} />
      </label>
    {/if}
  </section>

  <section class="settings-section">
    <div class="section-title"><span>02</span><div><h3>Accessibility</h3><p>Make the universe easier to read and inhabit.</p></div></div>

    <div class="choice-field">
      <span>motion</span>
      <div class="segments" role="group" aria-label="motion preference">
        <button class:active={game.motionPreference === 'system'} aria-pressed={game.motionPreference === 'system'} onclick={() => setMotion('system')}>system</button>
        <button class:active={game.motionPreference === 'reduced'} aria-pressed={game.motionPreference === 'reduced'} onclick={() => setMotion('reduced')}>reduced</button>
      </div>
    </div>

    <div class="choice-field">
      <span>visual beat guide</span>
      <div class="segments three" role="group" aria-label="visual beat guide">
        <button class:active={game.beatVisual === 'subtle'} aria-pressed={game.beatVisual === 'subtle'} onclick={() => setBeatVisual('subtle')}>subtle</button>
        <button class:active={game.beatVisual === 'strong'} aria-pressed={game.beatVisual === 'strong'} onclick={() => setBeatVisual('strong')}>strong</button>
        <button class:active={game.beatVisual === 'off'} aria-pressed={game.beatVisual === 'off'} onclick={() => setBeatVisual('off')}>off</button>
      </div>
    </div>

    <div class="choice-field">
      <span>interface text</span>
      <div class="segments" role="group" aria-label="interface text size">
        <button class:active={game.textScale === 'normal'} aria-pressed={game.textScale === 'normal'} onclick={() => setTextScale('normal')}>standard</button>
        <button class:active={game.textScale === 'large'} aria-pressed={game.textScale === 'large'} onclick={() => setTextScale('large')}>large</button>
      </div>
    </div>

    <button class="toggle-card" class:active={game.highContrast} aria-pressed={game.highContrast} onclick={toggleContrast}>
      <span><i></i><strong>High contrast</strong></span>
      <small>Brightens secondary text and control boundaries.</small>
    </button>

    {#if !accessOnly}
    <button
      class="toggle-card"
      class:active={averagedRhythm}
      aria-pressed={averagedRhythm}
      onclick={() => onaveragedrhythmchange?.(!averagedRhythm)}
    >
      <span><i></i><strong>Averaged rhythm</strong></span>
      <small>Uses a consistent non-timed reward at 87.5% of competent rhythm play for this session.</small>
    </button>

    <button
      class="toggle-card"
      class:active={goalLensEnabled}
      aria-pressed={goalLensEnabled}
      onclick={() => ongoallenschange?.(!goalLensEnabled)}
    >
      <span><i></i><strong>Goal Lens</strong></span>
      <small>Opt in to next-useful, next-discovery, and pinned recommendations.</small>
    </button>

    <button
      class="toggle-card"
      class:active={promptsEnabled}
      aria-pressed={promptsEnabled}
      onclick={() => onpromptschange?.(!promptsEnabled)}
    >
      <span><i></i><strong>Contextual prompts</strong></span>
      <small>Opt in to dismissible first-use explanations. These never appear automatically.</small>
    </button>
    {/if}
  </section>

  {#if accessOnly}
    <section class="settings-section first-light">
      <div class="section-title"><span>03</span><div><h3>First light</h3><p>The opening remains yours to discover.</p></div></div>
      <p>Activate the Heart with a pointer, <kbd>Space</kbd>, or <kbd>Enter</kbd>. New in-world interface pieces appear only when the universe can support them.</p>
      <p><kbd>F1</kbd> reopens this access menu. <kbd>Esc</kbd> closes it. No accessibility choice changes rewards or reveals a locked system.</p>
    </section>
  {:else}
  <section class="settings-section">
    <div class="section-title"><span>03</span><div><h3>Performance</h3><p>Auto currently resolves to <strong>{effectiveQuality}</strong>.</p></div></div>
    <div class="quality-grid" role="group" aria-label="visual quality">
      {#each [
        ['auto', 'Auto', 'Adapts to screen and CPU'],
        ['high', 'High', '60 FPS · full density'],
        ['balanced', 'Balanced', '60 FPS · lighter canvas'],
        ['low', 'Low', '30 FPS · minimum effects'],
      ] as option (option[0])}
        <button class:active={game.visualQuality === option[0]} aria-pressed={game.visualQuality === option[0]} onclick={() => setQuality(option[0] as VisualQuality)}>
          <strong>{option[1]}</strong><small>{option[2]}</small>
        </button>
      {/each}
    </div>
  </section>

  <section class="settings-section vestments">
    <div class="section-title"><span>04</span><div><h3>Vestment</h3><p>Cosmetic only. Universe identity remains intact.</p></div></div>
    <div class="swatches">
      {#each THEMES as t (t.id)}
        {@const open = t.unlocked(game)}
        <button
          class="swatch"
          class:active={game.theme === t.id}
          class:locked={!open}
          style:--sw={themeVarsForUniverse(t, activeUniverseId)['--amber']}
          title={open ? `${t.name} — ${t.flavor}` : `${t.name} — ${t.unlockText}`}
          aria-pressed={game.theme === t.id}
          onclick={() => open && chooseTheme(t.id)}
        >
          <span class="dot"></span>
          <span class="sname">{open ? t.name : '???'}</span>
        </button>
      {/each}
    </div>
  </section>
  {/if}

  <section class="settings-section save-section">
    <div class="section-title"><span>{accessOnly ? '04' : '05'}</span><div><h3>Save safety</h3><p>Autosaves include three rolling checkpoints and one daily backup.</p></div></div>
    <div class="action-row">
      <button class="action" onclick={doExport}>Copy export</button>
      <button class="action" onclick={doDownload}>Download file</button>
      <button class="action" onclick={doRollbackExport}>Copy pre-v13 rollback</button>
    </div>
    {#if exportCode}
      <textarea aria-label="exported save code" readonly rows="3" value={exportCode} onclick={(e) => (e.target as HTMLTextAreaElement).select()}></textarea>
    {/if}

    <div class="import-row">
      <textarea aria-label="save code to import" rows="3" bind:value={importCode} placeholder="paste a save code…"></textarea>
      <button class="action" onclick={doImport} disabled={!importCode.trim()}>Import</button>
    </div>

    <details class="backups">
      <summary>Recovery checkpoints <span>{backups.length}</span></summary>
      {#if backups.length === 0}
        <p>Rolling backups appear after five minutes of play.</p>
      {:else}
        <div class="backup-list">
          {#each backups as backup (backup.id)}
            <div><span>{backupLabel(backup)}</span><button onclick={() => restoreBackup(backup.id)}>restore</button></div>
          {/each}
        </div>
      {/if}
    </details>
  </section>

  {#if !accessOnly}
  <section class="settings-section playtest-section">
    <div class="section-title"><span>06</span><div><h3>Playtest report</h3><p>{renderHealth.fps > 0 ? `${renderHealth.fps.toFixed(0)} FPS · ${renderHealth.profile}${renderHealth.degraded ? ' · auto-protected' : ''}` : 'Measuring render performance…'}</p></div></div>
    <p class="privacy-note">Copies a compact diagnostic snapshot of settings, rendering, and progression totals. It never includes the save code.</p>
    <button class="action" onclick={copyDiagnostics}>Copy playtest report</button>
    {#if diagnosticCode}
      <textarea aria-label="playtest diagnostic report" readonly rows="5" value={diagnosticCode} onclick={(e) => (e.target as HTMLTextAreaElement).select()}></textarea>
    {/if}
  </section>
  {/if}

  {#if message}
    <p class="message" role="status" aria-live="polite">{message}</p>
  {/if}

  {#if !accessOnly}
  <details class="credits">
    <summary>Credits, version, and feedback</summary>
    <strong>EMBER · {GAME_VERSION}</strong>
    {#each CREDIT_LINES as line (line)}<p>{line}</p>{/each}
    <div><a href={SOURCE_URL} target="_blank" rel="noreferrer">source code</a><a href={FEEDBACK_URL} target="_blank" rel="noreferrer">report a bug or idea</a></div>
  </details>

  <details class="danger-zone">
    <summary>Danger zone</summary>
    <p>This removes the primary save and every automatic recovery checkpoint.</p>
    <button class="danger" onclick={doReset}>Let the ember go out</button>
  </details>
  {/if}
</section>

<style>
  .panel { position: fixed; top: 50%; left: 1.25rem; transform: translateY(-50%); width: min(25rem, calc(100vw - 2.5rem)); min-width: 0; max-height: 88vh; overflow-x: hidden; overflow-y: auto; padding: 0.9rem; color: var(--text); background: linear-gradient(155deg, color-mix(in srgb, var(--panel) 94%, #11131f), rgba(7,8,16,0.96)); border: 1px solid rgba(255,217,138,0.17); border-radius: 16px; box-shadow: 0 24px 70px rgba(0,0,0,0.42); backdrop-filter: blur(14px); z-index: 6; animation: panel-in 0.24s ease both; scrollbar-width: thin; }
  .panel.access-only { width: min(28rem, calc(100vw - 2.5rem)); }
  @keyframes panel-in { from { opacity: 0; transform: translateY(-50%) translateX(-12px); } to { opacity: 1; transform: translateY(-50%) translateX(0); } }
  header { position: sticky; top: -0.9rem; z-index: 2; display: flex; justify-content: space-between; align-items: center; min-width: 0; margin: -0.9rem -0.9rem 0.65rem; padding: 0.85rem 0.9rem 0.72rem; background: rgba(10,10,19,0.94); border-bottom: 1px solid rgba(255,255,255,0.06); backdrop-filter: blur(12px); }
  header > div { min-width: 0; }
  header span { display: block; overflow: hidden; margin-bottom: 0.12rem; font-size: 0.46rem; font-weight: 750; letter-spacing: 0.14em; text-transform: uppercase; text-overflow: ellipsis; white-space: nowrap; color: var(--amber); }
  h2, h3, p { margin: 0; }
  h2 { font-family: Georgia,serif; font-size: 1.05rem; font-weight: 500; }
  .close { width: 2rem; height: 2rem; padding: 0; color: var(--dim); background: rgba(255,255,255,0.025); border: 1px solid rgba(255,255,255,0.08); border-radius: 50%; cursor: pointer; }
  .settings-section { min-width: 0; padding: 0.78rem 0.1rem; border-bottom: 1px solid rgba(255,255,255,0.06); }
  .section-title { display: grid; grid-template-columns: 1.25rem minmax(0,1fr); gap: 0.42rem; margin-bottom: 0.65rem; }
  .section-title > span { padding-top: 0.13rem; font-size: 0.5rem; color: var(--amber); }
  .section-title h3 { font-family: Georgia,serif; font-size: 0.88rem; font-weight: 500; }
  .section-title p { margin-top: 0.08rem; font-size: 0.57rem; line-height: 1.4; color: var(--dim); }
  .section-title p strong { color: var(--gold); }
  .field { display: grid; grid-template-columns: 6.2rem minmax(0,1fr); align-items: center; gap: 0.6rem; margin: 0.42rem 0; font-size: 0.68rem; color: var(--dim); }
  .field span { display: flex; justify-content: space-between; gap: 0.25rem; }
  .field b { color: var(--text); font-size: 0.6rem; font-variant-numeric: tabular-nums; }
  input[type='range'] { min-width: 0; width: 100%; accent-color: var(--amber); }
  .choice-field { display: grid; grid-template-columns: 7.5rem minmax(0,1fr); align-items: center; gap: 0.55rem; margin: 0.42rem 0; }
  .choice-field > span { font-size: 0.63rem; color: var(--dim); }
  .segments { min-width: 0; display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); padding: 0.16rem; background: rgba(0,0,0,0.24); border: 1px solid rgba(255,255,255,0.065); border-radius: 8px; }
  .segments.three { grid-template-columns: repeat(3,minmax(0,1fr)); }
  .segments button { min-width: 0; padding: 0.3rem 0.15rem; overflow: hidden; font: inherit; font-size: 0.57rem; color: var(--dim); background: transparent; border: 0; border-radius: 6px; cursor: pointer; text-overflow: ellipsis; }
  .segments button.active { color: #181209; background: var(--gold); box-shadow: 0 2px 10px rgba(0,0,0,0.2); }
  .toggle-card { width: 100%; display: flex; justify-content: space-between; align-items: center; gap: 0.8rem; margin-top: 0.55rem; padding: 0.52rem 0.6rem; font: inherit; color: var(--text); background: rgba(255,255,255,0.025); border: 1px solid rgba(255,255,255,0.075); border-radius: 9px; cursor: pointer; text-align: left; }
  .toggle-card > span { display: flex; align-items: center; gap: 0.45rem; font-size: 0.65rem; }
  .toggle-card i { width: 0.55rem; height: 0.55rem; border: 1px solid var(--dim); border-radius: 50%; }
  .toggle-card small { font-size: 0.52rem; color: var(--dim); }
  .toggle-card.active { border-color: rgba(255,217,138,0.35); }
  .toggle-card.active i { background: var(--gold); border-color: var(--gold); box-shadow: 0 0 8px var(--gold); }
  .quality-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.35rem; }
  .quality-grid button { display: flex; flex-direction: column; align-items: start; padding: 0.48rem 0.55rem; font: inherit; color: var(--text); background: rgba(255,255,255,0.025); border: 1px solid rgba(255,255,255,0.07); border-radius: 8px; cursor: pointer; text-align: left; }
  .quality-grid button.active { border-color: rgba(255,217,138,0.38); background: rgba(255,179,92,0.07); }
  .quality-grid strong { font-size: 0.64rem; }
  .quality-grid small { margin-top: 0.09rem; font-size: 0.5rem; color: var(--dim); }
  .swatches { display: grid; grid-template-columns: 1fr 1fr; gap: 0.35rem; }
  .swatch { display: flex; align-items: center; gap: 0.45rem; padding: 0.4rem 0.55rem; font: inherit; font-size: 0.65rem; color: var(--text); background: rgba(255,255,255,0.025); border: 1px solid rgba(255,255,255,0.07); border-radius: 8px; cursor: pointer; text-align: left; }
  .swatch .dot { flex: none; width: 0.65rem; height: 0.65rem; border-radius: 50%; background: var(--sw); box-shadow: 0 0 8px var(--sw); }
  .swatch.active { border-color: var(--sw); }
  .swatch.locked { opacity: 0.42; cursor: default; }
  .swatch.locked .dot { background: #3a374d; box-shadow: none; }
  .sname { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .action-row { display: flex; gap: 0.4rem; }
  .action { padding: 0.36rem 0.65rem; font: inherit; font-size: 0.61rem; font-weight: 700; color: var(--gold); background: rgba(255,179,92,0.07); border: 1px solid rgba(255,179,92,0.26); border-radius: 7px; cursor: pointer; }
  .action:hover { background: rgba(255,179,92,0.14); }
  .action:disabled { opacity: 0.35; cursor: default; }
  textarea { width: 100%; margin-top: 0.45rem; resize: vertical; padding: 0.45rem; font: 0.57rem/1.4 ui-monospace,monospace; color: var(--text); background: rgba(0,0,0,0.32); border: 1px solid rgba(255,255,255,0.09); border-radius: 8px; user-select: text; -webkit-user-select: text; }
  .import-row { display: grid; grid-template-columns: minmax(0,1fr) auto; align-items: end; gap: 0.4rem; }
  .backups { margin-top: 0.55rem; padding: 0.5rem 0.55rem; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.065); border-radius: 8px; }
  .backups summary, .credits summary, .danger-zone summary { font-size: 0.62rem; color: var(--dim); cursor: pointer; }
  .backups summary span { float: right; color: var(--gold); }
  .backups > p { margin-top: 0.4rem; font: 0.6rem/1.4 Georgia,serif; color: var(--dim); }
  .backup-list { display: grid; gap: 0.28rem; margin-top: 0.45rem; }
  .backup-list > div { display: flex; justify-content: space-between; align-items: center; gap: 0.5rem; padding-top: 0.3rem; border-top: 1px solid rgba(255,255,255,0.05); }
  .backup-list span { font-size: 0.53rem; color: var(--dim); }
  .backup-list button { padding: 0; font: inherit; font-size: 0.55rem; font-weight: 700; color: var(--gold); background: none; border: 0; cursor: pointer; }
  .message { margin: 0.55rem 0; padding: 0.48rem 0.55rem; font: italic 0.65rem/1.45 Georgia,serif; color: var(--gold); background: rgba(255,179,92,0.045); border-left: 2px solid var(--amber); }
  .privacy-note { margin: -0.15rem 0 0.55rem; font: 0.56rem/1.45 Georgia,serif; color: var(--dim); }
  .first-light > p { margin: 0.42rem 0; color: var(--dim); font: 0.6875rem/1.5 system-ui, sans-serif; }
  kbd { padding: 0.08rem 0.28rem; color: var(--gold); background: color-mix(in srgb, var(--panel) 82%, black); border: 1px solid color-mix(in srgb, var(--gold) 24%, transparent); border-radius: 0.25rem; font: 650 0.6875rem/1.2 ui-monospace, monospace; }
  .credits, .danger-zone { margin-top: 0.55rem; padding: 0.58rem 0.65rem; border: 1px solid rgba(255,255,255,0.065); border-radius: 9px; background: rgba(0,0,0,0.16); }
  .credits > strong { display: block; margin-top: 0.55rem; font: 0.72rem Georgia,serif; color: var(--gold); }
  .credits p, .danger-zone p { margin-top: 0.28rem; font-size: 0.54rem; line-height: 1.4; color: var(--dim); }
  .credits > div { display: flex; gap: 0.75rem; margin-top: 0.55rem; }
  .credits a { font-size: 0.58rem; color: var(--gold); }
  .danger-zone { border-color: rgba(255,100,100,0.12); }
  .danger { margin-top: 0.5rem; padding: 0.35rem 0.65rem; font: inherit; font-size: 0.6rem; color: #ffabab; background: rgba(255,80,80,0.055); border: 1px solid rgba(255,100,100,0.24); border-radius: 7px; cursor: pointer; }
  @media (max-width: 720px) { .panel { left: 0.55rem; right: 0.55rem; top: 7rem; bottom: 0.55rem; width: auto; max-width: calc(100vw - 1.1rem); max-height: none; transform: none; z-index: 10; } @keyframes panel-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } } }
  @media (max-width: 420px) { .choice-field, .field { grid-template-columns: 1fr; gap: 0.28rem; } .toggle-card { align-items: start; flex-direction: column; } .quality-grid { grid-template-columns: 1fr; } .action-row { flex-wrap: wrap; } }
</style>

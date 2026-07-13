<script lang="ts">
  import type { DevScenario } from '../core/dev-scenarios'
  import { applyDevCheat, DEV_CHEATS, type DevCheatId } from '../core/dev-playtest'
  import { format } from '../core/format'
  import { save } from '../core/save'
  import { universeById, universeV2ById } from '../content/universes'
  import { game } from '../engine/game.svelte'
  import { pushAchievementToast, pushToast } from '../systems/toasts.svelte'

  const worldPresets = [
    { id: 'opening', label: 'Fresh Opening' },
    { id: 'endgame', label: 'Emberlight' },
    { id: 'tidefall', label: 'Tidefall' },
    { id: 'verdance', label: 'Verdance' },
    { id: 'clockwork', label: 'Clockwork' },
    { id: 'brahmalok', label: 'Brahmalok' },
    { id: 'vishnulok', label: 'Vishnulok' },
    { id: 'kailash', label: 'Kailash' },
  ] as const satisfies readonly { id: DevScenario; label: string }[]

  const milestonePresets = [
    { id: 'ember-camp', label: 'Phase 2 · Camp' },
    { id: 'midgame', label: 'First 5 Minutes' },
    { id: 'ember-cosmic', label: 'Phase 2 · Cosmic' },
    { id: 'ember-postnova', label: 'Phase 2 · Post-Nova' },
    { id: 'pruning', label: 'Pruning Ready' },
    { id: 'markets', label: 'Repeatable Markets' },
    { id: 'question', label: 'The Question' },
    { id: 'crossing', label: 'First Crossing' },
    { id: 'garden', label: 'The Garden' },
  ] as const satisfies readonly { id: DevScenario; label: string }[]

  const cheatGroups = [
    {
      label: 'Currencies',
      ids: ['fund-world', 'fund-epoch', 'fund-deep', 'fund-between', 'fund-lumen', 'fund-all'],
    },
    {
      label: 'Live unlocks',
      ids: ['show-all-controls', 'complete-economy', 'unlock-story', 'complete-epoch-deep', 'complete-vessel'],
    },
    {
      label: 'Prepare real milestones',
      ids: ['ready-epoch', 'ready-deep', 'ready-beacon', 'question-ready'],
    },
    {
      label: 'Completion',
      ids: ['complete-world', 'unlock-multiverse', 'unlock-everything'],
    },
    {
      label: 'Presentation QA',
      ids: ['notification-storm', 'prime-loka-depth'],
    },
  ] as const satisfies readonly { label: string; ids: readonly DevCheatId[] }[]

  const cheatById = new Map(DEV_CHEATS.map((cheat) => [cheat.id, cheat]))
  const currentScenario = new URLSearchParams(window.location.search).get('scenario')
  let open = $state(true)
  let notice = $state('Choose a preset or apply live cheats, then close the console and use the normal game controls.')
  const activePack = $derived(universeById(game.activeUniverse))
  const activeV2 = $derived(universeV2ById(game.activeUniverse))
  const epochName = $derived(activeV2?.economy.localPrestige.rewardCurrency.localName ?? 'Stardust')

  function loadScenario(id: DevScenario) {
    const url = new URL(window.location.href)
    url.searchParams.set('playtest', '1')
    url.searchParams.set('scenario', id)
    window.location.assign(url.toString())
  }

  function apply(id: DevCheatId) {
    try {
      notice = applyDevCheat(game, id)
      if (id === 'notification-storm') {
        pushAchievementToast('Lane check: achievement', 'The reserved notification lane remains clear of the active instrument.', 'achievement')
        pushToast('Lane check: Echo', 'A recovered fragment waits without covering controls.', 'echo')
        pushToast('Lane check: shorthand', 'Number notation stays inside the same reserved lane.', 'number shorthand')
        pushToast('Lane check: return', 'Continuity is returning through the declared shelters.', 'return')
        pushToast('Lane check: queue', 'Five messages were fired together and remain ordered.', 'qa')
      }
      save()
    } catch (error) {
      notice = error instanceof Error ? error.message : String(error)
    }
  }

  function onKeydown(event: KeyboardEvent) {
    if (event.key !== 'F10' || event.metaKey || event.ctrlKey || event.altKey) return
    event.preventDefault()
    open = !open
  }
</script>

<svelte:window onkeydown={onKeydown} />

{#if !open}
  <button
    type="button"
    class="dev-launch"
    onclick={() => (open = true)}
    aria-label="Open playtest console"
    aria-keyshortcuts="F10"
  >DEV</button>
{:else}
  <aside class="dev-console" aria-label="Development playtest console">
    <header>
      <div>
        <span>development build · F10</span>
        <h2>Playtest Console</h2>
      </div>
      <button type="button" class="dev-close" onclick={() => (open = false)} aria-label="Close playtest console">×</button>
    </header>

    <div class="active-state">
      <div><small>active universe</small><strong>{activePack.name}</strong></div>
      <div><small>{activePack.currency}</small><strong>{format(game.light)}</strong></div>
      <div><small>{epochName}</small><strong>{format(game.stardust)}</strong></div>
      <div><small>Singularities</small><strong>{format(game.singularities)}</strong></div>
      <div><small>Lumen Shards</small><strong>{game.lumenShards}</strong></div>
    </div>

    <p class="dev-note">Presets reload a deterministic save. Live cheats mutate this local development save immediately.</p>

    <section>
      <div class="section-title"><h3>Universe presets</h3><span>reload</span></div>
      <div class="button-grid worlds">
        {#each worldPresets as preset (preset.id)}
          <button
            type="button"
            class:active={currentScenario === preset.id}
            onclick={() => loadScenario(preset.id)}
          >{preset.label}</button>
        {/each}
      </div>
    </section>

    <section>
      <div class="section-title"><h3>Story & progression presets</h3><span>reload</span></div>
      <div class="button-grid">
        {#each milestonePresets as preset (preset.id)}
          <button
            type="button"
            class:active={currentScenario === preset.id}
            onclick={() => loadScenario(preset.id)}
          >{preset.label}</button>
        {/each}
      </div>
    </section>

    {#each cheatGroups as group (group.label)}
      <section>
        <div class="section-title"><h3>{group.label}</h3><span>live</span></div>
        <div class="button-grid">
          {#each group.ids as id (id)}
            {@const cheat = cheatById.get(id)!}
            <button type="button" title={cheat.description} onclick={() => apply(id)}>{cheat.label}</button>
          {/each}
        </div>
      </section>
    {/each}

    <footer>
      <p role="status" aria-live="polite">{notice}</p>
      <small>Tip: “Ready” actions leave the actual reset, Beacon, or Question interaction for you to trigger through the normal game UI.</small>
    </footer>
  </aside>
{/if}

<style>
  .dev-launch {
    position: fixed;
    top: 0.7rem;
    right: 0.7rem;
    z-index: 50;
    padding: 0.42rem 0.62rem;
    color: #171008;
    background: #ffc46b;
    border: 1px solid #ffe2a8;
    border-radius: 0.45rem;
    box-shadow: 0 0 1.2rem rgba(255, 174, 76, 0.3);
    font: 800 0.66rem/1 system-ui, sans-serif;
    letter-spacing: 0.12em;
    cursor: pointer;
  }
  .dev-console {
    position: fixed;
    z-index: 50;
    top: 0.55rem;
    right: 0.55rem;
    width: min(25rem, calc(100vw - 1.1rem));
    max-height: calc(100vh - 1.1rem);
    overflow-y: auto;
    padding: 0.82rem;
    color: #eee7dc;
    background:
      linear-gradient(135deg, rgba(255, 183, 86, 0.055), transparent 42%),
      rgba(10, 10, 14, 0.97);
    border: 1px solid rgba(255, 196, 107, 0.42);
    border-radius: 0.85rem;
    box-shadow: 0 1.2rem 4rem rgba(0, 0, 0, 0.72), inset 3px 0 #ffc46b;
    scrollbar-width: thin;
  }
  header {
    position: sticky;
    top: -0.82rem;
    z-index: 2;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    margin: -0.82rem -0.82rem 0;
    padding: 0.8rem 0.82rem 0.7rem 1rem;
    background: rgba(10, 10, 14, 0.96);
    border-bottom: 1px solid rgba(255, 196, 107, 0.17);
    backdrop-filter: blur(10px);
  }
  header span,
  .section-title span {
    color: #d79c4d;
    font: 750 0.48rem/1 system-ui, sans-serif;
    letter-spacing: 0.14em;
    text-transform: uppercase;
  }
  h2 { margin: 0.14rem 0 0; color: #fff3df; font: 650 1rem/1.1 system-ui, sans-serif; }
  .dev-close {
    width: 2rem;
    height: 2rem;
    color: #e9c99a;
    background: transparent;
    border: 1px solid rgba(255, 196, 107, 0.2);
    border-radius: 0.45rem;
    font-size: 1.2rem;
    cursor: pointer;
  }
  .active-state {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1px;
    margin-top: 0.7rem;
    overflow: hidden;
    border: 1px solid rgba(255, 196, 107, 0.12);
    border-radius: 0.6rem;
    background: rgba(255, 196, 107, 0.1);
  }
  .active-state > div { min-width: 0; padding: 0.5rem 0.58rem; background: rgba(4, 4, 8, 0.78); }
  .active-state small { display: block; color: #a9a2a0; font-size: 0.5rem; text-transform: uppercase; letter-spacing: 0.08em; }
  .active-state strong { display: block; margin-top: 0.1rem; overflow: hidden; color: #f7d9a7; font-size: 0.68rem; text-overflow: ellipsis; white-space: nowrap; }
  .dev-note { margin: 0.62rem 0 0; color: #aaa4ad; font-size: 0.6rem; line-height: 1.4; }
  section { margin-top: 0.78rem; }
  .section-title { display: flex; align-items: baseline; justify-content: space-between; gap: 0.5rem; margin-bottom: 0.34rem; }
  h3 { margin: 0; color: #ddd7d1; font: 720 0.62rem/1.2 system-ui, sans-serif; letter-spacing: 0.04em; }
  .button-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.3rem; }
  .button-grid.worlds { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .button-grid button {
    min-width: 0;
    padding: 0.48rem 0.54rem;
    color: #d7d2d5;
    background: rgba(255, 255, 255, 0.035);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 0.46rem;
    font: 620 0.58rem/1.18 system-ui, sans-serif;
    text-align: left;
    cursor: pointer;
  }
  .button-grid button:hover,
  .button-grid button:focus-visible,
  .button-grid button.active {
    color: #fff2dc;
    border-color: rgba(255, 196, 107, 0.48);
    background: rgba(255, 174, 76, 0.1);
    outline: none;
  }
  .button-grid button.active { box-shadow: inset 2px 0 #ffc46b; }
  footer { margin-top: 0.82rem; padding: 0.64rem; background: rgba(255, 174, 76, 0.055); border: 1px solid rgba(255, 196, 107, 0.14); border-radius: 0.55rem; }
  footer p { margin: 0; color: #f3d4a3; font-size: 0.6rem; line-height: 1.35; }
  footer small { display: block; margin-top: 0.34rem; color: #928d96; font-size: 0.52rem; line-height: 1.38; }
</style>

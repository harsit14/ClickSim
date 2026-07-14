<script lang="ts">
  import { onMount } from 'svelte'
  import { save } from '../core/save'
  import { THEMES } from '../content/themes'
  import { UNIVERSES, universeV2ById, type UniverseId } from '../content/universes'
  import { WAYFINDER_NODES } from '../content/wayfinder'
  import { format } from '../core/format'
  import {
    abandonAtlasRoute,
    activateLawLoadout,
    atlasRouteReady,
    beginAtlasRoute,
    chooseGardenEnding,
    completeAtlasRoute,
    game,
    markGardenSceneSeen,
    saveLawLoadout,
    setBeaconName,
  } from '../engine/game.svelte'
  import {
    ATLAS_FRAGMENTS,
    ATLAS_LAWS,
    ATLAS_MASTERIES,
    CONVERGENCES,
    dailyAtlasRoute,
    decodeAtlasRoute,
    generateAtlasRoute,
  } from '../endgame/atlas'
  import {
    decodeLawLoadout,
    encodeLawLoadout,
    lawLoadoutOwnershipIssues,
  } from '../endgame/chronicle'
  import {
    availableGardenClosures,
    gardenCredits,
    gardenUnlocked,
    GARDEN_LINKS,
    GARDEN_NODES,
    livedAnswers,
  } from '../endgame/garden'
  import type { AutomationProfile, LawLoadout } from '../endgame/types'
  import { gardenKeepsake, gardenKeepsakeFilename, gardenKeepsakeSvg } from '../endgame/garden-keepsake'
  import { quietGoalProgress } from '../endgame/quiet-goals'
  import GardenScene from './GardenScene.svelte'
  import { containModalKeydown } from '../accessibility/modal-focus'

  let { onclose }: { onclose: () => void } = $props()

  type Tab = 'chronicle' | 'loadouts' | 'atlas' | 'garden'
  let tab = $state<Tab>(game.activeAtlasRoute ? 'atlas' : game.beacons.length >= 7 ? 'garden' : game.beacons.length >= 3 ? 'atlas' : 'chronicle')
  let seed = $state(7129)
  let loadoutName = $state('New law set')
  let doctrineIndex = $state(0)
  let shelfIndex = $state(0)
  let vestmentIndex = $state(0)
  let automation = $state<AutomationProfile>('balanced')
  let selectedWayfinder = $state<string[]>([])
  let importCode = $state('')
  let loadoutMessage = $state('')
  let beaconDrafts = $state<Record<string, string>>({ ...game.beaconNames })
  let gardenFrozen = $state(false)
  let keepsakeMessage = $state('')
  const openedAt = Date.now()
  let dialog: HTMLDivElement

  onMount(() => queueMicrotask(() => dialog?.focus()))

  const activePack = $derived(universeV2ById(game.activeUniverse as UniverseId))
  const unlockedThemes = $derived(THEMES.filter((theme) => theme.unlocked(game)))
  const safeSeed = $derived(Math.max(0, Math.min(0x7fffffff, Math.floor(Number(seed) || 0))))
  const route = $derived(generateAtlasRoute(safeSeed, game.activeUniverse as UniverseId))
  const routeLaws = $derived([
    ATLAS_LAWS.find((law) => law.id === route.environmentLawId),
    ATLAS_LAWS.find((law) => law.id === route.economyLawId),
    ATLAS_LAWS.find((law) => law.id === route.interactionLawId),
  ].filter((law) => Boolean(law)))
  const routeFragment = $derived(ATLAS_FRAGMENTS.find((fragment) => fragment.id === route.fragmentId))
  const routeMastery = $derived(ATLAS_MASTERIES.find((mastery) => mastery.id === route.masteryId))
  const closures = $derived(availableGardenClosures(game.beacons, game.pastEndings, game.ending))
  const credits = $derived(game.gardenEnding ? gardenCredits(game.gardenEnding) : [])
  const answers = $derived(livedAnswers(game.pastEndings, game.ending))
  const daily = $derived(dailyAtlasRoute(openedAt, game.activeUniverse as UniverseId))
  const dailyComplete = $derived(game.atlasCompletions.some((completion) => completion.routeCode === daily.route.code))
  const quietGoals = $derived(quietGoalProgress(game))

  function selectTab(next: Tab) {
    tab = next
    if (next !== 'garden') gardenFrozen = false
  }

  function commitBeaconName(universeId: string) {
    if (setBeaconName(universeId, beaconDrafts[universeId] ?? '')) save()
  }

  function realmName(universeId: string): string {
    return UNIVERSES.find((realm) => realm.id === universeId)?.shortName ?? 'Unknown realm'
  }

  function toggleWayfinder(id: string) {
    selectedWayfinder = selectedWayfinder.includes(id)
      ? selectedWayfinder.filter((entry) => entry !== id)
      : selectedWayfinder.length < 3 ? [...selectedWayfinder, id] : selectedWayfinder
  }

  function currentDraft(): LawLoadout | null {
    if (!activePack) return null
    const doctrine = activePack.economy.doctrines[doctrineIndex]
    const shelf = activePack.archive.shelves[shelfIndex]
    const vestment = unlockedThemes[vestmentIndex]
    if (!doctrine || !shelf || !vestment) return null
    return {
      id: `loadout-${Date.now().toString(36)}`,
      name: loadoutName,
      universeId: activePack.id,
      doctrineId: doctrine.id,
      wayfinderLawIds: selectedWayfinder,
      archiveShelfId: shelf.id,
      vestmentId: vestment.id,
      anomalyResponseIds: [],
      automation,
    }
  }

  function storeLoadout() {
    const draft = currentDraft()
    if (!draft || !saveLawLoadout(draft)) {
      loadoutMessage = 'That loadout is incomplete.'
      return
    }
    loadoutMessage = `Saved · ${encodeLawLoadout(draft)}`
    save()
  }

  function importLoadout() {
    const decoded = decodeLawLoadout(importCode, 'Imported law set')
    if (!decoded) {
      loadoutMessage = 'The code is invalid or damaged.'
      return
    }
    const issues = lawLoadoutOwnershipIssues(decoded, game.wayfinder, unlockedThemes.map((theme) => theme.id))
    if (issues.length > 0) {
      loadoutMessage = `Code read safely; not activated: ${issues[0]}. No progression was imported.`
      return
    }
    saveLawLoadout(decoded)
    loadoutMessage = 'Imported the build only. Progression and currencies were unchanged.'
    save()
  }

  function activate(loadout: LawLoadout) {
    if (!activateLawLoadout(loadout.id)) {
      loadoutMessage = 'This world or one of the saved laws is not currently available.'
      return
    }
    loadoutMessage = `${loadout.name} is active.`
    save()
  }

  function beginRoute() {
    if (!beginAtlasRoute(route)) return
    save()
    onclose()
  }

  function previewDailyRoute() {
    seed = daily.route.seed
  }

  function finishRoute() {
    if (!completeAtlasRoute()) return
    save()
  }

  function abandonRoute() {
    if (!abandonAtlasRoute()) return
    save()
  }

  function chooseClosure(id: Parameters<typeof chooseGardenEnding>[0]) {
    if (!chooseGardenEnding(id)) return
    markGardenSceneSeen()
    save()
  }

  function exportGardenKeepsake() {
    if (!game.gardenEnding) return
    const svg = gardenKeepsakeSvg(gardenKeepsake(game.gardenEnding, game.beaconNames))
    const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }))
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = gardenKeepsakeFilename(game.gardenEnding)
    anchor.click()
    URL.revokeObjectURL(url)
    keepsakeMessage = 'Garden keepsake prepared.'
  }

  function formatDuration(milliseconds: number): string {
    const seconds = Math.max(0, Math.round(milliseconds / 1000))
    if (seconds < 60) return `${seconds}s`
    const minutes = Math.floor(seconds / 60)
    return `${minutes}m ${seconds % 60}s`
  }
</script>

<div bind:this={dialog} class="endgame instrument-panel" class:garden-open={tab === 'garden'} role="dialog" aria-modal="true" aria-labelledby={tab === 'garden' ? 'garden-title' : 'legacy-title'} tabindex="-1" onkeydown={(event) => containModalKeydown(event, dialog, onclose)}>
  {#if tab !== 'garden'}
  <header>
    <div>
      <span>seven worlds · one record · possible futures</span>
      <h2 id="legacy-title">The Legacy of Light</h2>
    </div>
    <button class="close" aria-label="close the Legacy of Light" onclick={onclose}>✕</button>
  </header>

  <nav class="tabs" aria-label="Legacy sections">
    <button class:active={tab === 'chronicle'} onclick={() => selectTab('chronicle')}>Chronicle</button>
    <button class:active={tab === 'loadouts'} onclick={() => selectTab('loadouts')}>Law loadouts</button>
    <button class:active={tab === 'atlas'} disabled={game.beacons.length < 3} onclick={() => selectTab('atlas')}>Atlas</button>
    <button class:active={tab === 'garden'} disabled={!gardenUnlocked(game.beacons)} onclick={() => selectTab('garden')}>Garden</button>
  </nav>
  {/if}

  <div class="body" class:garden-body={tab === 'garden'}>
    {#if tab === 'chronicle'}
      <section class="page chronicle" aria-labelledby="chronicle-title">
        <div class="section-head">
          <div><span>permanent record</span><h3 id="chronicle-title">The Chronicle</h3></div>
          <strong>{game.chronicleEvents.length} dated events</strong>
        </div>

        <div class="world-records">
          {#each UNIVERSES as universe (universe.id)}
            {@const events = game.chronicleEvents.filter((event) => event.universeId === universe.id)}
            <article class:lit={game.beacons.includes(universe.id)}>
              <i>{universe.currencyGlyph}</i>
              <div>
                <span>{universe.name}</span>
                <strong>{events.length > 0 ? events.map((event) => event.milestone).join(' · ') : game.beacons.includes(universe.id) ? 'legacy Beacon record' : 'not yet awakened'}</strong>
              </div>
              {#if game.beacons.includes(universe.id)}
                <label>
                  <span>Beacon name</span>
                  <input
                    value={beaconDrafts[universe.id] ?? game.beaconNames[universe.id] ?? universe.beacon.name}
                    maxlength="32"
                    oninput={(event) => (beaconDrafts[universe.id] = event.currentTarget.value)}
                    onblur={() => commitBeaconName(universe.id)}
                  />
                </label>
              {/if}
            </article>
          {/each}
        </div>

        <ol class="timeline" aria-label="Chronicle timeline">
          {#each [...game.chronicleEvents].sort((a, b) => b.at - a.at).slice(0, 18) as event (event.id)}
            <li>
              <span>{event.milestone.replace('-', ' ')}</span>
              <strong>{UNIVERSES.find((universe) => universe.id === event.universeId)?.name}</strong>
              <p>{event.detail}</p>
              <time datetime={new Date(event.at).toISOString()}>{new Date(event.at).toLocaleString()}</time>
            </li>
          {:else}
            <li class="empty"><p>The old milestones remain intact. New dates begin when the next world action is recorded.</p></li>
          {/each}
        </ol>

        {#if game.chronicleBests.length > 0}
          <section class="bests">
            <h4>Personal route records</h4>
            {#each game.chronicleBests.slice(0, 8) as best (best.routeCode)}
              <div><code>{best.routeCode}</code><strong>{formatDuration(best.durationMs)}</strong></div>
            {/each}
          </section>
        {/if}

        <section class="quiet-goals" aria-labelledby="quiet-goals-title">
          <div class="quiet-goals-heading">
            <div>
              <span>optional · permanent · no story gates</span>
              <h4 id="quiet-goals-title">Quiet goals</h4>
            </div>
            <strong>{quietGoals.filter((goal) => goal.complete).length}/{quietGoals.length} noted</strong>
          </div>
          <p>Completion notes for archivists. They grant no power, expire never, and do not hold the story closed.</p>
          <div class="quiet-goal-grid">
            {#each quietGoals as goal (goal.id)}
              <article class:complete={goal.complete}>
                <span>{goal.complete ? 'noted in the margin' : `${goal.current} / ${goal.target}`}</span>
                <h5>{goal.name}</h5>
                <p>{goal.description}</p>
                <progress value={goal.current} max={goal.target} aria-label={`${goal.name}: ${goal.current} of ${goal.target}`}></progress>
              </article>
            {/each}
          </div>
        </section>
      </section>

    {:else if tab === 'loadouts'}
      <section class="page loadouts" aria-labelledby="loadout-title">
        <div class="section-head">
          <div><span>buildcraft without imported power</span><h3 id="loadout-title">Law loadouts</h3></div>
          <strong>{activePack?.identity.name}</strong>
        </div>

        {#if activePack}
          <div class="builder">
            <label>Name<input bind:value={loadoutName} maxlength="32" /></label>
            <label>Local doctrine
              <select bind:value={doctrineIndex}>
                {#each activePack.economy.doctrines as doctrine, index}
                  <option value={index}>{doctrine.name}</option>
                {/each}
              </select>
            </label>
            <label>Archive resonance
              <select bind:value={shelfIndex}>
                {#each activePack.archive.shelves as shelf, index}
                  <option value={index}>{shelf.name}</option>
                {/each}
              </select>
            </label>
            <label>Heart vestment
              <select bind:value={vestmentIndex}>
                {#each unlockedThemes as theme, index}
                  <option value={index}>{theme.name}</option>
                {/each}
              </select>
            </label>
            <label>Automation
              <select bind:value={automation}>
                <option value="manual">Manual</option>
                <option value="balanced">Balanced</option>
                <option value="idle">Idle</option>
              </select>
            </label>
            <fieldset>
              <legend>Wayfinder laws · up to three</legend>
              {#each WAYFINDER_NODES as law (law.id)}
                <button
                  class:selected={selectedWayfinder.includes(law.id)}
                  disabled={!game.wayfinder.includes(law.id)}
                  aria-pressed={selectedWayfinder.includes(law.id)}
                  onclick={() => toggleWayfinder(law.id)}
                >{law.glyph} {law.name}</button>
              {/each}
            </fieldset>
            <button class="primary" onclick={storeLoadout}>Save and create build code</button>
          </div>
        {/if}

        <div class="importer">
          <label>Import build code<input bind:value={importCode} placeholder="L1-…" /></label>
          <button onclick={importLoadout}>Read code</button>
        </div>
        {#if loadoutMessage}<p class="message" role="status">{loadoutMessage}</p>{/if}

        <div class="saved-loadouts">
          {#each game.lawLoadouts as loadout (loadout.id)}
            <article class:active={game.activeLawLoadoutId === loadout.id}>
              <div><span>{realmName(loadout.universeId)}</span><h4>{loadout.name}</h4></div>
              <code>{encodeLawLoadout(loadout)}</code>
              <button disabled={loadout.universeId !== game.activeUniverse} onclick={() => activate(loadout)}>
                {game.activeLawLoadoutId === loadout.id ? 'Active' : 'Activate'}
              </button>
            </article>
          {:else}
            <p class="empty-copy">No saved law sets yet. A build code contains configuration only—never currencies, Beacons, or unlocks.</p>
          {/each}
        </div>
      </section>

    {:else if tab === 'atlas'}
      <section class="page atlas" aria-labelledby="atlas-title">
        <div class="section-head">
          <div><span>seeded · authored · permanent</span><h3 id="atlas-title">Atlas of Possible Worlds</h3></div>
          <strong>{game.atlasCompletions.length} routes archived</strong>
        </div>

        {#if game.activeAtlasRoute}
          {@const activeRoute = decodeAtlasRoute(game.activeAtlasRoute.routeCode)}
          <article class="active-route">
            <span>route in progress</span>
            <h4>{activeRoute?.title}</h4>
            <code>{game.activeAtlasRoute.routeCode}</code>
            <p>The source realm is parked intact. This temporary run alone is at stake.</p>
            <div>
              <button class="primary" disabled={!atlasRouteReady()} onclick={finishRoute}>Archive completed route</button>
              <button onclick={abandonRoute}>Abandon and restore source run</button>
            </div>
          </article>
        {:else}
          <article class="daily-route" class:complete={dailyComplete}>
            <div>
              <span>optional shared route · {daily.utcDay} UTC</span>
              <h4>{daily.route.title}</h4>
              <p>{dailyComplete ? 'Already archived today. Its code remains replayable.' : 'One common point of departure, with no streak and no expiry penalty.'}</p>
            </div>
            <div>
              <code>{daily.route.code}</code>
              <button onclick={previewDailyRoute}>{dailyComplete ? 'Preview again' : 'Preview route'}</button>
            </div>
          </article>
          <div class="seed-control">
            <label>Route seed<input type="number" min="0" max="2147483647" bind:value={seed} /></label>
            <button onclick={() => (seed = (seed + 7919) % 2147483647)}>Next seeded route</button>
          </div>
          <article class="route-card">
            <span>{realmName(route.universeId)} · deterministic route</span>
            <h4>{route.title}</h4>
            <code>{route.code}</code>
            <div class="route-laws">
              {#each routeLaws as law (law?.id)}
                <div><span>{law?.kind}</span><strong>{law?.name}</strong><p>{law?.description}</p></div>
              {/each}
            </div>
            {#if routeFragment}<blockquote><strong>{routeFragment.title}</strong>{routeFragment.text}</blockquote>{/if}
            <p class="mastery">{routeMastery?.label ?? 'No optional mastery constraint on this route.'}</p>
            <button class="primary" onclick={beginRoute}>Begin temporary route</button>
          </article>
        {/if}

        <section class="convergences" aria-labelledby="convergences-title">
          <h4 id="convergences-title">Permanent Convergence archive</h4>
          {#each CONVERGENCES as convergence (convergence.id)}
            <article class:unlocked={game.unlockedConvergences.includes(convergence.id)}>
              <span>{game.unlockedConvergences.includes(convergence.id) ? 'archived permanently' : `${convergence.requiredBeacons} Beacons required`}</span>
              <h5>{convergence.name}</h5>
              <p>{convergence.description}</p>
              <small>{convergence.objects.join(' · ')} · {convergence.echoes.join(' · ')}</small>
            </article>
          {/each}
        </section>
      </section>

    {:else}
      <span class="garden-status" aria-live="polite">{game.gardenEnding ? 'The Garden has received your answer.' : ''}</span>
      <GardenScene
        nodes={GARDEN_NODES}
        links={GARDEN_LINKS}
        {closures}
        {answers}
        ending={game.gardenEnding}
        {credits}
        reducedMotion={game.motionPreference === 'reduced'}
        frozen={gardenFrozen}
        exportMessage={keepsakeMessage}
        {onclose}
        onreturn={() => selectTab('chronicle')}
        onchoose={chooseClosure}
        oncontinueatlas={() => selectTab('atlas')}
        onfreeze={() => (gardenFrozen = !gardenFrozen)}
        onexport={exportGardenKeepsake}
      />
    {/if}
  </div>
</div>

<style>
  .endgame { position: fixed; inset: 3.5rem 5vw 3.2rem; z-index: 14; display: grid; grid-template-rows: auto auto 1fr; color: var(--gold); background: color-mix(in srgb, var(--panel) 94%, #02050b); border: 1px solid color-mix(in srgb, var(--amber) 28%, transparent); border-radius: 1.2rem; box-shadow: 0 2rem 8rem rgba(0,0,0,.72), inset 0 1px rgba(255,255,255,.04); overflow: hidden; }
  .endgame.garden-open { inset: 0; display: block; border: 0; border-radius: 0; background: #05070b; box-shadow: none; }
  header { display: flex; align-items: center; justify-content: space-between; padding: 1rem 1.25rem .75rem; border-bottom: 1px solid color-mix(in srgb, var(--amber) 16%, transparent); }
  header span, .section-head span, article > span { display: block; color: var(--dim); font-size: .62rem; letter-spacing: .16em; text-transform: uppercase; }
  h2, h3, h4, h5, p { margin: 0; } h2 { margin-top: .12rem; font: italic 1.3rem Georgia, serif; } h3 { font: italic 1.5rem Georgia, serif; }
  button, input, select { font: inherit; } button { color: inherit; background: rgba(255,255,255,.035); border: 1px solid color-mix(in srgb, var(--amber) 22%, transparent); border-radius: .55rem; padding: .48rem .7rem; cursor: pointer; } button:hover:not(:disabled), button:focus-visible { border-color: var(--amber); background: color-mix(in srgb, var(--amber) 11%, transparent); } button:disabled { opacity: .38; cursor: not-allowed; }
  .close { width: 2.1rem; height: 2.1rem; padding: 0; }
  .tabs { display: flex; gap: .3rem; padding: .55rem 1.1rem; background: rgba(0,0,0,.16); border-bottom: 1px solid rgba(255,255,255,.05); } .tabs button { border-color: transparent; color: var(--dim); } .tabs button.active { color: var(--gold); border-color: color-mix(in srgb, var(--amber) 48%, transparent); background: color-mix(in srgb, var(--amber) 10%, transparent); }
  .body { overflow: auto; } .page { max-width: 76rem; margin: 0 auto; padding: 1.3rem 1.5rem 3rem; }
  .body.garden-body { width: 100%; height: 100%; overflow: hidden; }
  .garden-status { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0; }
  .section-head { display: flex; justify-content: space-between; align-items: end; gap: 1rem; margin-bottom: 1rem; } .section-head strong { color: color-mix(in srgb, var(--amber) 76%, white); font-size: .75rem; }
  .world-records { display: grid; grid-template-columns: repeat(7, minmax(8rem,1fr)); gap: .45rem; } .world-records article { min-height: 8.3rem; padding: .7rem; background: rgba(0,0,0,.18); border: 1px solid rgba(255,255,255,.06); border-radius: .8rem; } .world-records article.lit { border-color: color-mix(in srgb, var(--amber) 30%, transparent); } .world-records i { font-size: 1.2rem; font-style: normal; } .world-records strong { display: block; min-height: 2.5rem; margin-top: .28rem; color: var(--dim); font-size: .64rem; font-weight: 500; line-height: 1.35; } .world-records label { display: block; margin-top: .55rem; } label span, label { color: var(--dim); font-size: .68rem; } input, select { width: 100%; box-sizing: border-box; margin-top: .25rem; padding: .5rem; color: var(--gold); background: rgba(0,0,0,.28); border: 1px solid rgba(255,255,255,.09); border-radius: .45rem; }
  .timeline { display: grid; grid-template-columns: repeat(3, 1fr); gap: .5rem; padding: 0; margin: 1rem 0 0; list-style: none; } .timeline li { padding: .75rem; background: rgba(255,255,255,.025); border-left: 2px solid color-mix(in srgb, var(--amber) 42%, transparent); } .timeline li > span { color: var(--amber); font-size: .6rem; text-transform: uppercase; letter-spacing: .12em; } .timeline p { margin: .25rem 0; color: var(--dim); font: italic .78rem Georgia,serif; } time { color: color-mix(in srgb, var(--dim) 68%, transparent); font-size: .58rem; }
  .bests, .convergences { margin-top: 1.2rem; } .bests > div { display: flex; justify-content: space-between; padding: .45rem; border-bottom: 1px solid rgba(255,255,255,.05); } code { color: color-mix(in srgb, var(--amber) 78%, white); font-size: .7rem; }
  .quiet-goals { margin-top: 1.25rem; padding-top: 1rem; border-top: 1px solid rgba(255,255,255,.07); }
  .quiet-goals-heading { display: flex; align-items: end; justify-content: space-between; gap: 1rem; }
  .quiet-goals-heading > div > span { display: block; color: var(--dim); font-size: .6rem; letter-spacing: .14em; text-transform: uppercase; }
  .quiet-goals-heading > strong { color: var(--dim); font-size: .68rem; }
  .quiet-goals > p { margin-top: .35rem; color: var(--dim); font: italic .75rem/1.45 Georgia, serif; }
  .quiet-goal-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: .55rem; margin-top: .8rem; }
  .quiet-goal-grid article { padding: .75rem; background: rgba(255,255,255,.022); border: 1px solid rgba(255,255,255,.065); border-radius: .7rem; }
  .quiet-goal-grid article.complete { border-color: color-mix(in srgb, var(--amber) 30%, transparent); background: color-mix(in srgb, var(--amber) 5%, transparent); }
  .quiet-goal-grid article > span { color: var(--dim); font-size: .58rem; letter-spacing: .1em; text-transform: uppercase; }
  .quiet-goal-grid h5 { margin-top: .25rem; }
  .quiet-goal-grid p { min-height: 2.1rem; margin-top: .25rem; color: var(--dim); font-size: .68rem; line-height: 1.4; }
  .quiet-goal-grid progress { width: 100%; height: .2rem; margin-top: .55rem; accent-color: var(--amber); }
  .builder { display: grid; grid-template-columns: repeat(5, 1fr); gap: .7rem; align-items: end; padding: 1rem; background: rgba(0,0,0,.2); border: 1px solid rgba(255,255,255,.06); border-radius: .8rem; } fieldset { grid-column: 1 / -1; display: flex; gap: .45rem; padding: .75rem; border: 1px solid rgba(255,255,255,.07); border-radius: .6rem; } legend { color: var(--dim); font-size: .65rem; } fieldset button.selected { color: var(--gold); border-color: var(--amber); } .primary { color: #080711; background: linear-gradient(110deg, color-mix(in srgb,var(--amber) 75%,white), color-mix(in srgb,var(--gold) 80%,white)); border-color: transparent; font-weight: 750; }
  .importer { display: grid; grid-template-columns: 1fr auto; gap: .6rem; align-items: end; margin-top: .8rem; } .message { margin-top: .55rem; color: var(--amber); font-size: .75rem; }
  .saved-loadouts { display: grid; grid-template-columns: repeat(3,1fr); gap: .55rem; margin-top: 1rem; } .saved-loadouts article { display: grid; gap: .5rem; padding: .75rem; border: 1px solid rgba(255,255,255,.07); border-radius: .7rem; } .saved-loadouts article.active { border-color: var(--amber); box-shadow: inset 3px 0 var(--amber); } .empty-copy { color: var(--dim); font: italic .85rem Georgia,serif; }
  .daily-route { display: flex; align-items: end; justify-content: space-between; gap: 1rem; margin-bottom: .85rem; padding: .8rem; background: color-mix(in srgb, var(--amber) 4%, transparent); border: 1px solid color-mix(in srgb, var(--amber) 18%, transparent); border-radius: .75rem; }
  .daily-route.complete { border-style: dotted; }
  .daily-route h4 { margin: .2rem 0; font: italic 1rem Georgia, serif; }
  .daily-route p { color: var(--dim); font-size: .7rem; }
  .daily-route > div:last-child { display: flex; align-items: center; gap: .5rem; }
  .seed-control { display: flex; align-items: end; gap: .6rem; } .seed-control label { width: 16rem; } .route-card, .active-route { margin-top: .8rem; padding: 1.1rem; background: radial-gradient(circle at 50% 0%, color-mix(in srgb,var(--amber) 10%,transparent), transparent 45%), rgba(0,0,0,.2); border: 1px solid color-mix(in srgb,var(--amber) 25%,transparent); border-radius: 1rem; } .route-card h4, .active-route h4 { margin: .3rem 0; font: italic 1.25rem Georgia,serif; } .route-laws { display: grid; grid-template-columns: repeat(3,1fr); gap: .55rem; margin: 1rem 0; } .route-laws div { padding: .7rem; background: rgba(255,255,255,.025); border-top: 2px solid color-mix(in srgb,var(--amber) 36%,transparent); } .route-laws div > span { display: block; margin-bottom: .18rem; } .route-laws div > strong { display: block; } .route-laws p, blockquote, .mastery, .active-route p { margin: .3rem 0; color: var(--dim); font-size: .75rem; line-height: 1.45; } blockquote { padding: .8rem; border-left: 2px solid var(--amber); } blockquote strong { display: block; color: var(--gold); }
  .route-laws div { display: grid; align-content: start; gap: .2rem; min-width: 0; }
  .route-laws div > span { margin: 0; line-height: 1.2; overflow-wrap: anywhere; }
  .route-laws div > strong { line-height: 1.25; overflow-wrap: anywhere; }
  .convergences { display: grid; grid-template-columns: repeat(3,1fr); gap: .55rem; } .convergences > h4 { grid-column: 1/-1; } .convergences article { padding: .8rem; opacity: .52; border: 1px solid rgba(255,255,255,.06); border-radius: .7rem; } .convergences article.unlocked { opacity: 1; border-color: color-mix(in srgb,var(--amber) 28%,transparent); } .convergences p, .convergences small { display: block; margin-top: .35rem; color: var(--dim); font-size: .7rem; line-height: 1.4; }

  @media (max-width: 850px) {
    .endgame:not(.garden-open) { inset: .5rem; }
    .world-records, .quiet-goal-grid, .saved-loadouts, .convergences, .route-laws { grid-template-columns: 1fr; }
    .builder { grid-template-columns: 1fr; }
    .timeline { grid-template-columns: 1fr; }
    .daily-route { align-items: stretch; flex-direction: column; }
    .daily-route > div:last-child { justify-content: space-between; }
  }
</style>

<script lang="ts">
  import { onMount } from 'svelte'
  import { save } from '../core/save'
  import { THEMES } from '../content/themes'
  import { UNIVERSES, universeV2ById, type UniverseId } from '../content/universes'
  import { WAYFINDER_NODES } from '../content/wayfinder'
  import {
    LUMEN_SHARD_GLYPH,
    LUMEN_SHARD_NAME,
    LUMEN_VAULT_ITEMS,
    MAX_LUMEN_DISTILLATIONS_PER_UNIVERSE,
    SUCCESSION_RELAYS,
    lumenDistillationCost,
    successionRelayCost,
    successionRelayMultiplier,
    successionRelayRank,
  } from '../content/legacy-exchange'
  import { format } from '../core/format'
  import { gteAmount } from '../core/numeric/amount'
  import {
    abandonAtlasRoute,
    activateLawLoadout,
    atlasRouteReady,
    beginAtlasRoute,
    buyLumenVaultItem,
    buySuccessionRelay,
    chooseGardenEnding,
    completeAtlasRoute,
    distillLumenShard,
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

  let { onclose }: { onclose: () => void } = $props()

  type Tab = 'chronicle' | 'exchange' | 'loadouts' | 'atlas' | 'garden'
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
  let exchangeMessage = $state('')
  let beaconDrafts = $state<Record<string, string>>({ ...game.beaconNames })
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
  const activeDistillations = $derived(Math.max(0, Math.floor(game.lumenDistillations[game.activeUniverse] ?? 0)))
  const activeDistillationCost = $derived(lumenDistillationCost(activeDistillations))

  function selectTab(next: Tab) {
    tab = next
  }

  function commitBeaconName(universeId: string) {
    if (setBeaconName(universeId, beaconDrafts[universeId] ?? '')) save()
  }

  function investInRelay(id: string) {
    if (!buySuccessionRelay(id)) {
      exchangeMessage = 'That relay can only be fed while standing in its completed source universe.'
      return
    }
    exchangeMessage = 'The next universe grows stronger. The source world keeps the relay permanently.'
    save()
  }

  function distillShard() {
    if (!distillLumenShard()) {
      exchangeMessage = 'This world cannot distill another shard yet.'
      return
    }
    exchangeMessage = `One ${LUMEN_SHARD_NAME} joined the shared Vault.`
    save()
  }

  function purchaseVaultItem(id: string) {
    const item = LUMEN_VAULT_ITEMS.find((entry) => entry.id === id)
    if (!item || !buyLumenVaultItem(id)) {
      exchangeMessage = 'That archive piece is already owned or needs more Lumen Shards.'
      return
    }
    exchangeMessage = item.kind === 'skin'
      ? `${item.name} unlocked and equipped. It remains selectable in Options.`
      : `${item.name} is now part of the permanent archive.`
    save()
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

  function formatDuration(milliseconds: number): string {
    const seconds = Math.max(0, Math.round(milliseconds / 1000))
    if (seconds < 60) return `${seconds}s`
    const minutes = Math.floor(seconds / 60)
    return `${minutes}m ${seconds % 60}s`
  }
</script>

<div bind:this={dialog} class="endgame" role="dialog" aria-modal="true" aria-labelledby="legacy-title" tabindex="-1">
  <header>
    <div>
      <span>seven worlds · one record · possible futures</span>
      <h2 id="legacy-title">The Legacy of Light</h2>
    </div>
    <button class="close" aria-label="close the Legacy of Light" onclick={onclose}>✕</button>
  </header>

  <nav class="tabs" aria-label="Legacy sections">
    <button class:active={tab === 'chronicle'} onclick={() => selectTab('chronicle')}>Chronicle</button>
    <button class:active={tab === 'exchange'} disabled={game.beacons.length < 1} onclick={() => selectTab('exchange')}>Concordance</button>
    <button class:active={tab === 'loadouts'} onclick={() => selectTab('loadouts')}>Law loadouts</button>
    <button class:active={tab === 'atlas'} disabled={game.beacons.length < 3} onclick={() => selectTab('atlas')}>Atlas</button>
    <button class:active={tab === 'garden'} disabled={!gardenUnlocked(game.beacons)} onclick={() => selectTab('garden')}>Garden</button>
  </nav>

  <div class="body">
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
      </section>

    {:else if tab === 'exchange'}
      <section class="page exchange" aria-labelledby="exchange-title">
        <div class="section-head exchange-head">
          <div><span>completed worlds nourish what follows</span><h3 id="exchange-title">The Concordance</h3></div>
          <div class="shard-balance" aria-label={`${game.lumenShards} Lumen Shards`}>
            <i>{LUMEN_SHARD_GLYPH}</i><strong>{game.lumenShards}</strong><span>Lumen Shards</span>
          </div>
        </div>

        <section class="relay-system" aria-labelledby="relay-title">
          <div class="exchange-intro">
            <div><span>succession relays</span><h4 id="relay-title">One world reaches only its immediate successor.</h4></div>
            <p>After a Beacon is lit, spend that completed world's local Singularities here. Relays persist across pruning and crossing, but never skip a universe.</p>
          </div>
          <div class="relay-chain" aria-label="Universe succession chain">
            {#each UNIVERSES as universe, index (universe.id)}
              <span class:current={universe.id === game.activeUniverse} class:complete={game.beacons.includes(universe.id)}>{universe.currencyGlyph}<small>{universe.name}</small></span>
              {#if index < UNIVERSES.length - 1}<b aria-hidden="true">→</b>{/if}
            {/each}
          </div>
          <div class="relay-grid">
            {#each SUCCESSION_RELAYS as relay (relay.id)}
              {@const source = UNIVERSES.find((world) => world.id === relay.sourceUniverseId)}
              {@const target = UNIVERSES.find((world) => world.id === relay.targetUniverseId)}
              {@const rank = successionRelayRank(game.successionRelays, relay.id)}
              {@const cost = successionRelayCost(rank)}
              {@const canFeed = game.activeAtlasRoute === null && relay.sourceUniverseId === game.activeUniverse && game.beacons.includes(relay.sourceUniverseId) && cost !== null && gteAmount(game.singularities, cost)}
              <article class="relay-card" class:current-source={relay.sourceUniverseId === game.activeUniverse}>
                <div class="relay-route"><i>{source?.currencyGlyph}</i><span>feeds</span><i>{target?.currencyGlyph}</i></div>
                <span>{source?.name} → {target?.name}</span>
                <h5>{relay.name}</h5>
                <p>{relay.description}</p>
                <div class="relay-yield"><strong>rank {rank}</strong><em>×{successionRelayMultiplier(relay.targetUniverseId, game.successionRelays, game.lumenPurchases).toFixed(2)} {target?.name} production</em></div>
                <button disabled={!canFeed} onclick={() => investInRelay(relay.id)}>
                  {cost === null ? 'Relay mastered' : game.activeAtlasRoute ? 'Unavailable on an Atlas route' : relay.sourceUniverseId !== game.activeUniverse ? `Visit ${source?.name}` : !game.beacons.includes(relay.sourceUniverseId) ? 'Light its Beacon first' : `Feed relay · ◉ ${format(cost)}`}
                </button>
              </article>
            {/each}
          </div>
        </section>

        <section class="distillery" aria-labelledby="distillery-title">
          <div class="distill-sigil" aria-hidden="true"><span>◉</span><b>→</b><i>{LUMEN_SHARD_GLYPH}</i></div>
          <div><span>rare conversion · {UNIVERSES.find((world) => world.id === game.activeUniverse)?.name}</span><h4 id="distillery-title">Lumen Distillery</h4><p>Each completed universe can compress its own Deep surplus into at most {MAX_LUMEN_DISTILLATIONS_PER_UNIVERSE} shared shards. Costs rise tenfold.</p></div>
          <div class="distill-action"><strong>{activeDistillations}/{MAX_LUMEN_DISTILLATIONS_PER_UNIVERSE} distilled here</strong><button disabled={game.activeAtlasRoute !== null || !game.beacons.includes(game.activeUniverse) || activeDistillationCost === null || !gteAmount(game.singularities, activeDistillationCost)} onclick={distillShard}>{activeDistillationCost === null ? 'World exhausted' : game.activeAtlasRoute ? 'Unavailable on an Atlas route' : `Distill · ◉ ${format(activeDistillationCost)}`}</button></div>
        </section>

        <section class="vault" aria-labelledby="vault-title">
          <div class="vault-door">
            <span>persists between every universe</span>
            <h4 id="vault-title">The Lumen Vault</h4>
            <p>First-time Beacons and first Atlas completions also leave one shard. Nothing purchased here is pruned or left behind.</p>
          </div>
          <div class="vault-grid">
            {#each LUMEN_VAULT_ITEMS as item (item.id)}
              {@const owned = game.lumenPurchases.includes(item.id)}
              <article class:owned class={`kind-${item.kind}`}>
                <div><i>{item.glyph}</i><span>{item.kind}</span></div>
                <h5>{item.name}</h5>
                <p>{item.description}</p>
                {#if owned && item.lore}<blockquote>{item.lore}</blockquote>{/if}
                <button disabled={owned || game.lumenShards < item.cost} onclick={() => purchaseVaultItem(item.id)}>{owned ? 'Archived' : `${LUMEN_SHARD_GLYPH} ${item.cost} · unlock`}</button>
              </article>
            {/each}
          </div>
        </section>
        {#if exchangeMessage}<p class="exchange-message" role="status">{exchangeMessage}</p>{/if}
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
              <div><span>{loadout.universeId}</span><h4>{loadout.name}</h4></div>
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
            <p>The source universe is parked intact. This temporary run alone is at stake.</p>
            <div>
              <button class="primary" disabled={!atlasRouteReady()} onclick={finishRoute}>Archive completed route</button>
              <button onclick={abandonRoute}>Abandon and restore source run</button>
            </div>
          </article>
        {:else}
          <div class="seed-control">
            <label>Route seed<input type="number" min="0" max="2147483647" bind:value={seed} /></label>
            <button onclick={() => (seed = (seed + 7919) % 2147483647)}>Next seeded route</button>
          </div>
          <article class="route-card">
            <span>{route.universeId} · deterministic route</span>
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
      <section class="page garden" aria-labelledby="garden-title">
        <div class="section-head">
          <div><span>authored closure · no eighth economy</span><h3 id="garden-title">The Garden</h3></div>
          <strong>seven Beacons in relation</strong>
        </div>

        <div class="garden-map" role="img" aria-label="Seven restored universes connected through the Garden">
          {#each GARDEN_NODES as node (node.universeId)}
            <article class={node.universeId}>
              <span>{UNIVERSES.find((universe) => universe.id === node.universeId)?.currencyGlyph}</span>
              <h4>{node.name}</h4>
              <p>{node.offering}</p>
              <small>{node.question}</small>
            </article>
          {/each}
        </div>
        <div class="garden-links">
          {#each GARDEN_LINKS as link (link.id)}
            <div><strong>{link.name}</strong><span>{link.from} ↔ {link.to}</span><p>{link.result}</p></div>
          {/each}
        </div>

        {#if game.gardenEnding}
          <section class="credits" aria-live="polite">
            {#each credits as line, index}
              {#if index === 0}<h4>{line}</h4>{:else}<p>{line}</p>{/if}
            {/each}
            <button class="primary" onclick={() => selectTab('atlas')}>Continue into the Atlas</button>
          </section>
        {:else}
          <section class="closures">
            <div><span>answers lived</span><strong>{answers.join(' · ') || 'none recorded'}</strong></div>
            {#each closures as closure (closure.id)}
              <article>
                <h4>{closure.name}</h4>
                <p>{closure.consequence}</p>
                <em>{closure.finalLine}</em>
                <button onclick={() => chooseClosure(closure.id)}>Choose this closure</button>
              </article>
            {/each}
            {#if answers.length < 3}
              <p class="continue-hint">“Continue” appears after Warden, Hunger, and Companion have each been lived across Remembrances.</p>
            {/if}
          </section>
        {/if}
      </section>
    {/if}
  </div>
</div>

<style>
  .endgame { position: fixed; inset: 3.5rem 5vw 3.2rem; z-index: 14; display: grid; grid-template-rows: auto auto 1fr; color: var(--gold); background: color-mix(in srgb, var(--panel) 94%, #02050b); border: 1px solid color-mix(in srgb, var(--amber) 28%, transparent); border-radius: 1.2rem; box-shadow: 0 2rem 8rem rgba(0,0,0,.72), inset 0 1px rgba(255,255,255,.04); overflow: hidden; }
  header { display: flex; align-items: center; justify-content: space-between; padding: 1rem 1.25rem .75rem; border-bottom: 1px solid color-mix(in srgb, var(--amber) 16%, transparent); }
  header span, .section-head span, article > span, .closures > div span { display: block; color: var(--dim); font-size: .62rem; letter-spacing: .16em; text-transform: uppercase; }
  h2, h3, h4, h5, p { margin: 0; } h2 { margin-top: .12rem; font: italic 1.3rem Georgia, serif; } h3 { font: italic 1.5rem Georgia, serif; }
  button, input, select { font: inherit; } button { color: inherit; background: rgba(255,255,255,.035); border: 1px solid color-mix(in srgb, var(--amber) 22%, transparent); border-radius: .55rem; padding: .48rem .7rem; cursor: pointer; } button:hover:not(:disabled), button:focus-visible { border-color: var(--amber); background: color-mix(in srgb, var(--amber) 11%, transparent); } button:disabled { opacity: .38; cursor: not-allowed; }
  .close { width: 2.1rem; height: 2.1rem; padding: 0; }
  .tabs { display: flex; gap: .3rem; padding: .55rem 1.1rem; background: rgba(0,0,0,.16); border-bottom: 1px solid rgba(255,255,255,.05); } .tabs button { border-color: transparent; color: var(--dim); } .tabs button.active { color: var(--gold); border-color: color-mix(in srgb, var(--amber) 48%, transparent); background: color-mix(in srgb, var(--amber) 10%, transparent); }
  .body { overflow: auto; } .page { max-width: 76rem; margin: 0 auto; padding: 1.3rem 1.5rem 3rem; }
  .section-head { display: flex; justify-content: space-between; align-items: end; gap: 1rem; margin-bottom: 1rem; } .section-head strong { color: color-mix(in srgb, var(--amber) 76%, white); font-size: .75rem; }
  .world-records { display: grid; grid-template-columns: repeat(7, minmax(8rem,1fr)); gap: .45rem; } .world-records article { min-height: 8.3rem; padding: .7rem; background: rgba(0,0,0,.18); border: 1px solid rgba(255,255,255,.06); border-radius: .8rem; } .world-records article.lit { border-color: color-mix(in srgb, var(--amber) 30%, transparent); } .world-records i { font-size: 1.2rem; font-style: normal; } .world-records strong { display: block; min-height: 2.5rem; margin-top: .28rem; color: var(--dim); font-size: .64rem; font-weight: 500; line-height: 1.35; } .world-records label { display: block; margin-top: .55rem; } label span, label { color: var(--dim); font-size: .68rem; } input, select { width: 100%; box-sizing: border-box; margin-top: .25rem; padding: .5rem; color: var(--gold); background: rgba(0,0,0,.28); border: 1px solid rgba(255,255,255,.09); border-radius: .45rem; }
  .timeline { display: grid; grid-template-columns: repeat(3, 1fr); gap: .5rem; padding: 0; margin: 1rem 0 0; list-style: none; } .timeline li { padding: .75rem; background: rgba(255,255,255,.025); border-left: 2px solid color-mix(in srgb, var(--amber) 42%, transparent); } .timeline li > span { color: var(--amber); font-size: .6rem; text-transform: uppercase; letter-spacing: .12em; } .timeline p { margin: .25rem 0; color: var(--dim); font: italic .78rem Georgia,serif; } time { color: color-mix(in srgb, var(--dim) 68%, transparent); font-size: .58rem; }
  .bests, .convergences { margin-top: 1.2rem; } .bests > div { display: flex; justify-content: space-between; padding: .45rem; border-bottom: 1px solid rgba(255,255,255,.05); } code { color: color-mix(in srgb, var(--amber) 78%, white); font-size: .7rem; }
  .builder { display: grid; grid-template-columns: repeat(5, 1fr); gap: .7rem; align-items: end; padding: 1rem; background: rgba(0,0,0,.2); border: 1px solid rgba(255,255,255,.06); border-radius: .8rem; } fieldset { grid-column: 1 / -1; display: flex; gap: .45rem; padding: .75rem; border: 1px solid rgba(255,255,255,.07); border-radius: .6rem; } legend { color: var(--dim); font-size: .65rem; } fieldset button.selected { color: var(--gold); border-color: var(--amber); } .primary { color: #080711; background: linear-gradient(110deg, color-mix(in srgb,var(--amber) 75%,white), color-mix(in srgb,var(--gold) 80%,white)); border-color: transparent; font-weight: 750; }
  .importer { display: grid; grid-template-columns: 1fr auto; gap: .6rem; align-items: end; margin-top: .8rem; } .message { margin-top: .55rem; color: var(--amber); font-size: .75rem; }
  .saved-loadouts { display: grid; grid-template-columns: repeat(3,1fr); gap: .55rem; margin-top: 1rem; } .saved-loadouts article { display: grid; gap: .5rem; padding: .75rem; border: 1px solid rgba(255,255,255,.07); border-radius: .7rem; } .saved-loadouts article.active { border-color: var(--amber); box-shadow: inset 3px 0 var(--amber); } .empty-copy { color: var(--dim); font: italic .85rem Georgia,serif; }
  .seed-control { display: flex; align-items: end; gap: .6rem; } .seed-control label { width: 16rem; } .route-card, .active-route { margin-top: .8rem; padding: 1.1rem; background: radial-gradient(circle at 50% 0%, color-mix(in srgb,var(--amber) 10%,transparent), transparent 45%), rgba(0,0,0,.2); border: 1px solid color-mix(in srgb,var(--amber) 25%,transparent); border-radius: 1rem; } .route-card h4, .active-route h4 { margin: .3rem 0; font: italic 1.25rem Georgia,serif; } .route-laws { display: grid; grid-template-columns: repeat(3,1fr); gap: .55rem; margin: 1rem 0; } .route-laws div { padding: .7rem; background: rgba(255,255,255,.025); border-top: 2px solid color-mix(in srgb,var(--amber) 36%,transparent); } .route-laws div > span { display: block; margin-bottom: .18rem; } .route-laws div > strong { display: block; } .route-laws p, blockquote, .mastery, .active-route p { margin: .3rem 0; color: var(--dim); font-size: .75rem; line-height: 1.45; } blockquote { padding: .8rem; border-left: 2px solid var(--amber); } blockquote strong { display: block; color: var(--gold); }
  .convergences { display: grid; grid-template-columns: repeat(3,1fr); gap: .55rem; } .convergences > h4 { grid-column: 1/-1; } .convergences article { padding: .8rem; opacity: .52; border: 1px solid rgba(255,255,255,.06); border-radius: .7rem; } .convergences article.unlocked { opacity: 1; border-color: color-mix(in srgb,var(--amber) 28%,transparent); } .convergences p, .convergences small { display: block; margin-top: .35rem; color: var(--dim); font-size: .7rem; line-height: 1.4; }
  .garden-map { display: grid; grid-template-columns: repeat(4,1fr); gap: .55rem; } .garden-map article { min-height: 7rem; padding: .85rem; background: radial-gradient(circle at 15% 15%, color-mix(in srgb,var(--amber) 10%,transparent), transparent 42%), rgba(0,0,0,.2); border: 1px solid rgba(255,255,255,.07); border-radius: 50% 50% .8rem .8rem / 1rem 1rem .8rem .8rem; } .garden-map article:last-child { grid-column: 2 / 4; } .garden-map article > span { font-size: 1.1rem; } .garden-map p, .garden-map small { display: block; margin-top: .35rem; color: var(--dim); font-size: .68rem; line-height: 1.35; }
  .garden-links { display: grid; grid-template-columns: repeat(4,1fr); gap: .4rem; margin-top: .7rem; } .garden-links div { padding: .6rem; border-left: 2px solid color-mix(in srgb,var(--amber) 36%,transparent); background: rgba(255,255,255,.02); } .garden-links span, .garden-links p { display: block; margin-top: .2rem; color: var(--dim); font-size: .64rem; }
  .closures { display: grid; grid-template-columns: repeat(4,1fr); gap: .55rem; margin-top: 1rem; } .closures > div, .continue-hint { grid-column: 1/-1; } .closures article { display: flex; flex-direction: column; gap: .55rem; padding: .85rem; border: 1px solid color-mix(in srgb,var(--amber) 20%,transparent); border-radius: .8rem; } .closures article p { color: var(--dim); font-size: .72rem; line-height: 1.45; } .closures article em { flex: 1; font: italic .78rem Georgia,serif; } .continue-hint { color: var(--dim); font: italic .8rem Georgia,serif; }
  .credits { max-width: 46rem; margin: 1.2rem auto; padding: 1.4rem; text-align: center; background: radial-gradient(circle, color-mix(in srgb,var(--amber) 10%,transparent), transparent 65%); border-block: 1px solid color-mix(in srgb,var(--amber) 20%,transparent); } .credits p { margin: .65rem 0; color: var(--dim); font: italic .85rem Georgia,serif; }
  .exchange { --vault-line: color-mix(in srgb, var(--amber) 28%, transparent); }
  .exchange-head { align-items: center; }
  .shard-balance { display: grid; grid-template-columns: auto auto; column-gap: .55rem; align-items: center; min-width: 9.5rem; padding: .65rem .9rem; background: radial-gradient(circle at 18% 50%, color-mix(in srgb,var(--amber) 20%,transparent), transparent 46%), rgba(0,0,0,.22); border: 1px solid var(--vault-line); border-radius: 4rem; }
  .shard-balance i { grid-row: 1 / 3; font-size: 1.75rem; font-style: normal; text-shadow: 0 0 1.2rem var(--amber); } .shard-balance strong { font-size: 1.15rem; line-height: 1; } .shard-balance span { font-size: .55rem; color: var(--dim); letter-spacing: .1em; text-transform: uppercase; }
  .relay-system { padding: 1rem; background: linear-gradient(145deg, color-mix(in srgb,var(--amber) 7%,transparent), transparent 38%), rgba(0,0,0,.18); border: 1px solid var(--vault-line); border-radius: 1rem; }
  .exchange-intro { display: flex; align-items: end; justify-content: space-between; gap: 2rem; } .exchange-intro h4, .distillery h4, .vault-door h4 { margin-top: .18rem; font: italic 1.08rem Georgia,serif; } .exchange-intro p { max-width: 38rem; color: var(--dim); font-size: .72rem; line-height: 1.5; }
  .relay-chain { display: grid; grid-template-columns: repeat(13,auto); align-items: center; justify-content: center; gap: .34rem; margin: 1rem 0; padding: .7rem; background: rgba(0,0,0,.24); border-block: 1px solid rgba(255,255,255,.05); }
  .relay-chain > span { display: grid; place-items: center; width: 3.35rem; height: 3.35rem; color: var(--dim); border: 1px solid rgba(255,255,255,.08); border-radius: 50%; font-size: 1rem; } .relay-chain > span small { max-width: 4rem; font-size: .45rem; letter-spacing: .04em; white-space: nowrap; } .relay-chain > span.complete { color: var(--gold); border-color: var(--vault-line); box-shadow: 0 0 1rem color-mix(in srgb,var(--amber) 9%,transparent); } .relay-chain > span.current { outline: 1px solid var(--amber); outline-offset: 3px; } .relay-chain b { color: color-mix(in srgb,var(--amber) 52%,transparent); font-weight: 400; }
  .relay-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: .55rem; }
  .relay-card { display: flex; flex-direction: column; min-height: 13rem; padding: .8rem; background: rgba(1,4,9,.34); border: 1px solid rgba(255,255,255,.065); border-radius: .75rem; } .relay-card.current-source { border-color: color-mix(in srgb,var(--amber) 48%,transparent); box-shadow: inset 0 2px color-mix(in srgb,var(--amber) 45%,transparent); } .relay-card h5 { margin: .18rem 0 .32rem; font: 700 .92rem Georgia,serif; } .relay-card p { flex: 1; color: var(--dim); font-size: .68rem; line-height: 1.45; }
  .relay-route { display: flex; align-items: center; gap: .4rem; align-self: flex-end; } .relay-route i { display: grid; place-items: center; width: 1.45rem; height: 1.45rem; color: var(--amber); background: color-mix(in srgb,var(--amber) 8%,transparent); border: 1px solid var(--vault-line); border-radius: 50%; font-style: normal; } .relay-route span { color: var(--dim); font-size: .5rem; letter-spacing: .1em; text-transform: uppercase; }
  .relay-yield { display: flex; justify-content: space-between; gap: .4rem; margin: .7rem 0 .45rem; padding-top: .5rem; border-top: 1px solid rgba(255,255,255,.05); } .relay-yield strong { color: var(--amber); font-size: .65rem; text-transform: uppercase; } .relay-yield em { color: var(--gold); font-size: .64rem; font-style: normal; }
  .relay-card button, .vault-grid button, .distill-action button { width: 100%; font-size: .68rem; }
  .distillery { display: grid; grid-template-columns: auto 1fr 13rem; align-items: center; gap: 1rem; margin-top: .75rem; padding: 1rem; background: radial-gradient(circle at 10% 50%, color-mix(in srgb,var(--amber) 13%,transparent), transparent 22%), rgba(0,0,0,.2); border: 1px solid var(--vault-line); border-radius: 1rem; } .distillery p, .vault-door p { margin-top: .28rem; color: var(--dim); font-size: .7rem; line-height: 1.45; } .distill-sigil { display: flex; align-items: center; gap: .45rem; font-size: 1.2rem; } .distill-sigil i { color: var(--gold); font-size: 1.7rem; font-style: normal; text-shadow: 0 0 1rem var(--amber); } .distill-sigil b { color: var(--dim); font-size: .8rem; } .distill-action strong { display: block; margin-bottom: .45rem; color: var(--dim); font-size: .62rem; text-align: center; text-transform: uppercase; letter-spacing: .08em; }
  .vault { margin-top: .75rem; padding: 1rem; background: radial-gradient(ellipse at 50% 0%, color-mix(in srgb,var(--amber) 11%,transparent), transparent 35%), rgba(0,0,0,.25); border: 1px solid var(--vault-line); border-radius: 1rem; }
  .vault-door { max-width: 42rem; margin: 0 auto 1rem; text-align: center; } .vault-door > span { color: var(--dim); font-size: .58rem; letter-spacing: .16em; text-transform: uppercase; }
  .vault-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: .55rem; } .vault-grid article { display: flex; flex-direction: column; min-height: 10.5rem; padding: .85rem; background: linear-gradient(145deg, rgba(255,255,255,.025), transparent 45%); border: 1px solid rgba(255,255,255,.07); border-radius: .75rem; } .vault-grid article.owned { border-color: var(--vault-line); } .vault-grid article > div { display: flex; justify-content: space-between; align-items: center; } .vault-grid article i { font-size: 1.4rem; font-style: normal; text-shadow: 0 0 1rem color-mix(in srgb,var(--amber) 55%,transparent); } .vault-grid article h5 { margin: .35rem 0; font: 700 .9rem Georgia,serif; } .vault-grid article p { flex: 1; color: var(--dim); font-size: .68rem; line-height: 1.45; } .vault-grid article blockquote { margin: .55rem 0; padding: .55rem; color: var(--gold); background: color-mix(in srgb,var(--amber) 5%,transparent); font: italic .67rem/1.45 Georgia,serif; } .vault-grid .kind-lore { box-shadow: inset 3px 0 color-mix(in srgb,var(--amber) 28%,transparent); } .vault-grid .kind-skin { box-shadow: inset 3px 0 color-mix(in srgb,#d9a7ff 34%,transparent); } .vault-grid .kind-utility { box-shadow: inset 3px 0 color-mix(in srgb,#88efff 32%,transparent); }
  .exchange-message { position: sticky; bottom: .5rem; margin: .8rem auto 0; width: fit-content; padding: .6rem 1rem; color: var(--gold); background: color-mix(in srgb,var(--panel) 96%,black); border: 1px solid var(--amber); border-radius: 2rem; box-shadow: 0 .5rem 2rem rgba(0,0,0,.6); font-size: .72rem; }
  @media (max-width: 980px) { .relay-grid, .vault-grid { grid-template-columns: repeat(2,1fr); } .relay-chain { overflow-x: auto; justify-content: start; } .distillery { grid-template-columns: auto 1fr; } .distill-action { grid-column: 1 / -1; } }
</style>

<script lang="ts">
  import { onMount } from 'svelte'
  import {
    activeRatePerSec,
    game,
    activateUniverseLaw,
    configurePrismataRoute,
    configureVerdanceGrafting,
    configureTempestPath,
    configureUniverseLaw,
    editCanticleSlot,
    severVerdanceGrafting,
  } from '../engine/game.svelte'
  import { universeById, universeV2ById } from '../content/universes'
  import { verdanceGraftingStatus } from '../content/universes/verdance'
  import {
    CANTICLE_ROLES,
    CANTICLE_MEASURES,
    PRISMATA_BANDS,
    PRISMATA_RECIPES,
    TEMPEST_PATHS,
    TEMPEST_RISKS,
    canticleStatus,
    prismataStatus,
    tempestStatus,
  } from '../content/universes/f4-runtime'
  import { save } from '../core/save'
  import { format } from '../core/format'
  import { isZeroAmount } from '../core/numeric/amount'
  import BuffBar from './BuffBar.svelte'

  let now = $state(Date.now())
  let selectedPrismataKindling = $state(0)
  let primerMounted = $state(false)
  let primerOpen = $state(false)
  const prismataKindlings = universeById('prismata').generators
  const verdanceKindlings = universeById('verdance').generators
  const verdanceGraft = $derived(game.activeUniverse === 'verdance'
    ? verdanceGraftingStatus(verdanceKindlings.map(({ id }) => id), game.owned, game.numericLawState)
    : null)
  const prismata = $derived(game.activeUniverse === 'prismata' ? prismataStatus(game.numericLawState, game.owned) : null)
  const tempest = $derived(game.activeUniverse === 'tempest' ? tempestStatus(game.numericLawState) : null)
  const canticle = $derived(game.activeUniverse === 'canticle' ? canticleStatus(game.numericLawState, game.owned, now) : null)
  const pack = $derived(universeById(game.activeUniverse))
  const rate = $derived(activeRatePerSec(now))
  const epochMatter = $derived(universeV2ById(game.activeUniverse)?.economy.localPrestige.rewardCurrency)
  const instrumentPrimers = {
    prismata: {
      title: 'Reading the chamber',
      steps: ['Choose a lens recipe', 'Choose a Kindling source and route its wavelength', 'Watch band coverage and balance change the multiplier'],
      note: 'Routing and lens changes are free.',
    },
    tempest: {
      title: 'Reading the storm',
      steps: ['Choose a discharge path', 'Set leader length and ground condition', 'Let charge reach the threshold, then Discharge'],
      note: 'Longer, riskier paths ask for more charge and return more power.',
    },
    canticle: {
      title: 'Reading the score',
      steps: ['Choose a measure preset', 'Select any numbered beat to cycle its role', 'Use rests and distinct roles to shape the multiplier'],
      note: 'Editing the score is free and immediately reversible.',
    },
  } as const
  const instrumentPrimer = $derived(
    game.activeUniverse === 'prismata' || game.activeUniverse === 'tempest' || game.activeUniverse === 'canticle'
      ? instrumentPrimers[game.activeUniverse]
      : null,
  )

  function configure(index: number) {
    if (configureUniverseLaw(index)) save()
  }

  function discharge() {
    if (activateUniverseLaw()) save()
  }

  function routePrismata(bandIndex: number) {
    if (configurePrismataRoute(selectedPrismataKindling, bandIndex)) save()
  }

  function configureStorm(length: number, riskIndex: number) {
    if (configureTempestPath(length, riskIndex)) save()
  }

  function chooseGraftRootstock(index: number) {
    if (!verdanceGraft) return
    const scionIndex = index === verdanceGraft.scionIndex ? verdanceGraft.rootstockIndex : verdanceGraft.scionIndex
    if (configureVerdanceGrafting(index, scionIndex)) save()
  }

  function chooseGraftScion(index: number) {
    if (!verdanceGraft) return
    const rootstockIndex = index === verdanceGraft.rootstockIndex ? verdanceGraft.scionIndex : verdanceGraft.rootstockIndex
    if (configureVerdanceGrafting(rootstockIndex, index)) save()
  }

  function severGraft() {
    if (severVerdanceGrafting()) save()
  }

  function editSlot(index: number) {
    if (editCanticleSlot(index)) save()
  }

  function roleGlyph(role: (typeof CANTICLE_ROLES)[number]): string {
    return role === 'rest' ? '○' : role === 'pulse' ? '●' : role === 'sustain' ? '━' : role === 'echo' ? '))' : role === 'syncopation' ? '◆' : '×'
  }

  function primerStorageKey(universeId: string): string {
    return `ember:instrument-primer:v1:${universeId}`
  }

  function openFirstPrimer(universeId: string) {
    if (universeId !== 'prismata' && universeId !== 'tempest' && universeId !== 'canticle') return
    try {
      primerOpen = localStorage.getItem(primerStorageKey(universeId)) !== 'seen'
    } catch {
      primerOpen = true
    }
  }

  function dismissPrimer() {
    try {
      localStorage.setItem(primerStorageKey(game.activeUniverse), 'seen')
    } catch {
      // The primer still dismisses for this session when storage is unavailable.
    }
    primerOpen = false
  }

  function togglePrimer() {
    primerOpen = !primerOpen
  }

  onMount(() => {
    primerMounted = true
    openFirstPrimer(game.activeUniverse)
    const timer = setInterval(() => (now = Date.now()), 150)
    return () => clearInterval(timer)
  })

  $effect(() => {
    const universeId = game.activeUniverse
    if (primerMounted) openFirstPrimer(universeId)
  })

</script>

{#snippet integratedHeader(eyebrow: string, title: string, state: string, detail: string, multiplier: number)}
  <div class="integrated-heading">
    <div class="run-score">
      <strong><i>{pack.currencyGlyph}</i>{format(game.light)}</strong>
      <div>
        {#if !isZeroAmount(rate)}<span>{format(rate)} {pack.currency.toLowerCase()}/s</span>{/if}
        {#if !isZeroAmount(game.stardustTotal) || !isZeroAmount(game.singTotal)}
          <em aria-label={`${format(game.stardust)} ${epochMatter?.localName ?? 'Stardust'} and ${format(game.singularities)} Singularities`}>
            {epochMatter?.glyph ?? '✧'} {format(game.stardust)}{#if !isZeroAmount(game.singTotal)} · ◉ {format(game.singularities)}{/if}
          </em>
        {/if}
      </div>
    </div>
    <div class="effect-slot"><span>ACTIVE EFFECT</span><BuffBar integrated reserve /></div>
    <div class="instrument-title"><span>{eyebrow}</span><strong>{title}</strong></div>
    <div class="instrument-reading"><small>{state}</small><b>×{multiplier.toFixed(2)}</b><em>{detail}</em></div>
    <button type="button" class="primer-toggle" aria-label="Explain this universe instrument" aria-expanded={primerOpen} onclick={togglePrimer}>?</button>
  </div>
{/snippet}

{#snippet primerStrip()}
  {#if primerOpen && instrumentPrimer}
    <aside class="instrument-primer" aria-label={`${instrumentPrimer.title}. First-arrival instructions.`}>
      <div><span>FIRST ARRIVAL</span><strong>{instrumentPrimer.title}</strong></div>
      <ol>
        {#each instrumentPrimer.steps as step, index}
          <li><i>{index + 1}</i>{step}</li>
        {/each}
      </ol>
      <p>{instrumentPrimer.note}</p>
      <button type="button" onclick={dismissPrimer}>Got it</button>
    </aside>
  {/if}
{/snippet}

{#if verdanceGraft}
  <section class="law-panel verdance-grafting" class:active={verdanceGraft.active} aria-label="Verdance grafting bench">
    <header>
      <div><span>GRAFTING BENCH</span><strong>Let an old life shelter a young one.</strong></div>
      <b>{verdanceGraft.active ? `×${verdanceGraft.scionGraftedMultiplier.toFixed(2)} scion maturity` : verdanceGraft.configured ? 'graft resting' : 'no graft bound'}</b>
    </header>
    <div class="graft-route">
      <label>
        <span>ROOTSTOCK · DONOR</span>
        <select value={verdanceGraft.rootstockIndex} onchange={(event) => chooseGraftRootstock(Number(event.currentTarget.value))} aria-label="Graft rootstock Kindling">
          {#each verdanceKindlings as kindling, index (kindling.id)}
            <option value={index}>{kindling.name}</option>
          {/each}
        </select>
        <small>{verdanceGraft.rootstockStageLabel} · ×{verdanceGraft.rootstockCohortMultiplier.toFixed(2)} maturity</small>
      </label>
      <div class="graft-union" aria-hidden="true"><i></i><span>❧</span><i></i></div>
      <label>
        <span>SCION · RECEIVER</span>
        <select value={verdanceGraft.scionIndex} onchange={(event) => chooseGraftScion(Number(event.currentTarget.value))} aria-label="Graft scion Kindling">
          {#each verdanceKindlings as kindling, index (kindling.id)}
            <option value={index}>{kindling.name}</option>
          {/each}
        </select>
        <small>{verdanceGraft.scionStageLabel} · ×{verdanceGraft.scionCohortMultiplier.toFixed(2)} → ×{verdanceGraft.scionGraftedMultiplier.toFixed(2)}</small>
      </label>
      <button type="button" class="sever" disabled={!verdanceGraft.configured} onclick={severGraft}>sever</button>
    </div>
    <p>{verdanceGraft.explanation}</p>
  </section>
{:else if prismata}
  <section class="law-panel prismata-chamber" aria-label="Prismata refraction chamber">
    {@render integratedHeader('REFRACTION CHAMBER', 'Split. Name. Recombine.', `${prismata.activeBands}/6 BANDS`, prismata.recipe.name, prismata.multiplier)}
    {@render primerStrip()}

    <div class="optics-stage" aria-label={`${prismata.activeBands} of 6 wavelength families active; ${prismata.explanation}`}>
      <div class="white-source"><i></i><span>WHITE<br />INPUT</span></div>
      <div class="incident-beam"></div>
      <div class="prism-core" aria-hidden="true"><span>{prismata.recipe.glyph}</span></div>
      <div class="spectral-rays">
        {#each PRISMATA_BANDS as band, index (band.id)}
          {@const quantity = prismata.bands[index]}
          <i class:active={quantity > 0} data-band={band.id} style={`--ray-index:${index}`}>
            <span>{band.glyph}</span><b>{quantity}</b>
          </i>
        {/each}
      </div>
      <div class="spectrum-detector"><span>DETECTOR</span><b>{prismata.recipe.name}</b><small>{Math.round(prismata.balance * 100)}% balance</small></div>
    </div>

    <p class="law-explanation">{prismata.explanation}</p>

    <div class="optics-controls">
      <div class="lens-modes" role="group" aria-label="free lens recipe selection">
        {#each PRISMATA_RECIPES as recipe, index}
          <button type="button" aria-pressed={prismata.recipeIndex === index} onclick={() => configure(index)} title={recipe.description}>
            <span>{recipe.glyph}</span><b>{recipe.name}</b><small>{recipe.description}</small>
          </button>
        {/each}
      </div>
      <div class="ray-router">
        <label>
          <span>ROUTE SOURCE</span>
          <select bind:value={selectedPrismataKindling} aria-label="Kindling family to route">
            {#each prismataKindlings as kindling, index (kindling.id)}
              <option value={index}>{kindling.name}</option>
            {/each}
          </select>
        </label>
        <div class="band-routes" role="group" aria-label={`Route ${prismataKindlings[selectedPrismataKindling].name} to wavelength band`}>
          {#each PRISMATA_BANDS as band, index (band.id)}
            <button type="button" data-band={band.id} aria-pressed={prismata.routes[selectedPrismataKindling] === index} onclick={() => routePrismata(index)} title={band.name}>
              <span>{band.glyph}</span>{band.name}
            </button>
          {/each}
        </div>
      </div>
    </div>
  </section>
{:else if tempest}
  <section class="law-panel tempest-field" aria-label="Tempest storm field">
    {@render integratedHeader('LIVE STORM FIELD', `${tempest.path.name} cell`, tempest.boostRemainingSec > 0 ? 'DISCHARGING' : tempest.ready ? 'BREAKDOWN READY' : 'CHARGING', `${Math.round(tempest.charge)}% charge`, tempest.multiplier)}
    {@render primerStrip()}

    <div class="storm-layout">
      <div class="charge-column" aria-label={`${Math.round(tempest.charge)} percent atmospheric charge`}>
        <span>+</span>
        <div><i style={`height:${tempest.charge}%`}></i><b>{Math.round(tempest.charge)}%</b></div>
        <span>−</span>
      </div>

      <div class="storm-map" data-risk={tempest.risk.id}>
        <div class="anvil-cloud"><i></i><i></i><i></i></div>
        <div class="charge-layer positive"><span>+ + +</span></div>
        <div class="charge-layer negative"><span>− − −</span></div>
        <div class="bolt-network" aria-hidden="true">
          {#each Array(8) as _, index}
            <i class:lit={index < tempest.length} style={`--branch-index:${index}`}></i>
          {/each}
        </div>
        <div class="ground-plane"><span>{tempest.risk.glyph} {tempest.risk.name}</span></div>
        <div class="storm-threshold" style={`--threshold:${tempest.threshold}%`}><span>{tempest.threshold}% threshold</span></div>
      </div>

      <div class="discharge-stack">
        <small>EXPECTED RETURN</small>
        <strong>×{tempest.boost.toFixed(2)}</strong>
        <span>{tempest.length} cells · {tempest.durationSec}s</span>
        <button type="button" disabled={!tempest.ready || tempest.boostRemainingSec > 0} onclick={discharge}>
          <b>{tempest.boostRemainingSec > 0 ? `${Math.ceil(tempest.boostRemainingSec)}s` : 'ϟ DISCHARGE'}</b>
          <small>{tempest.ready ? 'break the field' : `${Math.ceil(tempest.threshold - tempest.charge)}% to breakdown`}</small>
        </button>
      </div>
    </div>

    <p class="law-explanation">{tempest.explanation}</p>

    <div class="storm-controls">
      <div class="path-cards" role="group" aria-label="discharge path selection">
        {#each TEMPEST_PATHS as path, index}
          <button type="button" aria-pressed={tempest.pathIndex === index} onclick={() => configure(index)} title={path.description}>
            <span>{path.glyph}</span><b>{path.name}</b><small>{path.threshold}% base</small>
          </button>
        {/each}
      </div>
      <div class="storm-route">
        <div class="route-scale">
          <span>LEADER LENGTH</span>
          <div role="group" aria-label="storm path length">
            {#each Array(8) as _, index}
              <button type="button" aria-pressed={tempest.length === index + 1} onclick={() => configureStorm(index + 1, tempest.riskIndex)}>{index + 1}</button>
            {/each}
          </div>
        </div>
        <div class="risk-scale">
          <span>GROUND CONDITION</span>
          <div role="group" aria-label="storm path risk">
            {#each TEMPEST_RISKS as risk, index (risk.id)}
              <button type="button" aria-pressed={tempest.riskIndex === index} onclick={() => configureStorm(tempest.length, index)} title={risk.description}>
                {risk.glyph} {risk.name}
              </button>
            {/each}
          </div>
        </div>
      </div>
    </div>
  </section>
{:else if canticle}
  <section class="law-panel canticle-score" aria-label="Canticle resonance score">
    {@render integratedHeader('RESONANCE SCORE', canticle.measure.name, `BEAT ${canticle.slotIndex + 1}/16`, canticle.role, canticle.multiplier)}
    {@render primerStrip()}

    <div class="score-layout">
      <div class="orbital-measure" aria-label={canticle.explanation}>
        <div class="nodal-figure" aria-hidden="true"><i></i><i></i><i></i></div>
        <div class="measure-center">
          <span>{canticle.measure.glyph}</span>
          <strong>{roleGlyph(canticle.role)}</strong>
          <small>{Math.ceil(canticle.nextSlotInMs)}ms</small>
        </div>
        {#each canticle.slots as role, index}
          <button
            type="button"
            class:active={canticle.slotIndex === index}
            data-role={role}
            style={`--slot-index:${index}`}
            onclick={() => editSlot(index)}
            title={`Edit beat ${index + 1}: ${role}`}
            aria-label={`Beat ${index + 1}, ${role}; activate to choose next role`}
          >
            <span>{roleGlyph(role)}</span><small>{index + 1}</small>
          </button>
        {/each}
      </div>

      <div class="score-console">
        <p class="law-explanation">{canticle.explanation}</p>
        <div class="measure-presets" role="group" aria-label="free measure preset selection">
          {#each CANTICLE_MEASURES as measure, index}
            <button type="button" aria-pressed={canticle.measureIndex === index} onclick={() => configure(index)} title={measure.description}>
              <span>{measure.glyph}</span><div><b>{measure.name}</b><small>{measure.description}</small></div>
            </button>
          {/each}
        </div>
        <div class="role-legend" aria-label={`${canticle.restCount} rests and ${canticle.distinctRoles} distinct roles`}>
          {#each CANTICLE_ROLES as role}
            <span data-role={role}><i>{roleGlyph(role)}</i>{role}</span>
          {/each}
        </div>
      </div>
    </div>
  </section>
{/if}

<style>
  .law-panel {
    box-sizing: border-box;
    max-width: 100%;
    pointer-events: auto;
    color: var(--gold);
    background: color-mix(in srgb, var(--panel) 90%, transparent);
    border: 1px solid color-mix(in srgb, var(--amber) 28%, transparent);
    box-shadow: 0 0.8rem 2.8rem color-mix(in srgb, var(--bg) 82%, transparent);
    backdrop-filter: blur(12px);
  }
  button, select { font: inherit; }
  button { cursor: pointer; }
  button:focus-visible { outline: 2px solid white; outline-offset: 2px; }
  button:disabled { cursor: default; opacity: 0.42; }
  .law-explanation { margin: 0; color: var(--dim); font: italic 0.6rem/1.3 Georgia, serif; text-align: center; }
  .verdance-grafting { width: min(34rem, calc(100vw - 1rem)); padding: 0.48rem 0.58rem; border-color: color-mix(in srgb, #a9db79 28%, transparent); border-radius: 0.55rem 0.18rem 0.55rem 0.18rem; background: linear-gradient(110deg, color-mix(in srgb, #172514 88%, transparent), color-mix(in srgb, var(--panel) 92%, transparent)); }
  .verdance-grafting > header { display: flex; align-items: end; justify-content: space-between; gap: 0.75rem; padding-bottom: 0.34rem; border-bottom: 1px solid color-mix(in srgb, #b9e38d 15%, transparent); }
  .verdance-grafting > header div span { display: block; color: #a9d873; font: 740 0.39rem/1 system-ui, sans-serif; letter-spacing: 0.15em; }
  .verdance-grafting > header div strong { display: block; margin-top: 0.12rem; color: color-mix(in srgb, var(--gold) 78%, white); font: 540 0.66rem/1.1 Georgia, serif; }
  .verdance-grafting > header > b { color: color-mix(in srgb, #c9efa2 72%, var(--dim)); font: 690 0.47rem/1 system-ui, sans-serif; letter-spacing: 0.06em; text-transform: uppercase; }
  .graft-route { display: grid; grid-template-columns: minmax(0, 1fr) 2.7rem minmax(0, 1fr) auto; align-items: center; gap: 0.38rem; margin-top: 0.38rem; }
  .graft-route label { min-width: 0; display: grid; grid-template-columns: auto 1fr; gap: 0.12rem 0.32rem; align-items: center; }
  .graft-route label > span { color: #91bd68; font: 720 0.36rem/1 system-ui, sans-serif; letter-spacing: 0.09em; }
  .graft-route select { min-width: 0; padding: 0.2rem 1.2rem 0.2rem 0.3rem; color: var(--gold); background: color-mix(in srgb, var(--bg) 72%, transparent); border: 1px solid color-mix(in srgb, #b8e887 19%, transparent); border-radius: 0.28rem; font-size: 0.48rem; }
  .graft-route label small { grid-column: 1 / -1; color: var(--dim); font-size: 0.39rem; }
  .graft-union { display: flex; align-items: center; color: #c9efa2; }
  .graft-union i { flex: 1; height: 1px; background: #6e9b52; }
  .graft-union span { width: 1.18rem; height: 1.18rem; display: grid; place-items: center; border: 1px solid #7eab5f; border-radius: 48% 52% 42% 58%; background: #14200f; box-shadow: 0 0 0.7rem color-mix(in srgb, #a9db79 18%, transparent); }
  .sever { padding: 0.28rem 0.38rem; color: var(--dim); background: transparent; border: 1px solid color-mix(in srgb, #b8e887 18%, transparent); border-radius: 0.3rem; font-size: 0.4rem; text-transform: uppercase; }
  .verdance-grafting > p { margin: 0.3rem 0 0; color: var(--dim); font: italic 0.46rem/1.2 Georgia, serif; text-align: center; }
  .verdance-grafting.active .graft-union span { color: #efffd9; border-color: #c9efa2; animation: graft-pulse 2.8s ease-in-out infinite alternate; }
  :global(html[data-motion='reduced']) .verdance-grafting.active .graft-union span { animation: none; }
  @keyframes graft-pulse { from { transform: scale(0.94); } to { transform: scale(1.06); } }
  .integrated-heading { display: grid; grid-template-columns: minmax(9rem, 1.08fr) minmax(7rem, 0.78fr) minmax(8rem, 0.92fr) auto 1.5rem; align-items: center; gap: 0.55rem; min-height: 2.5rem; padding-bottom: 0.38rem; border-bottom: 1px solid color-mix(in srgb, var(--gold) 11%, transparent); }
  .run-score { min-width: 0; display: flex; align-items: center; gap: 0.55rem; }
  .run-score > strong { color: color-mix(in srgb, var(--gold) 80%, white); font: 680 1.42rem/1 ui-sans-serif, system-ui; font-variant-numeric: tabular-nums; text-shadow: 0 0 1.1rem color-mix(in srgb, var(--amber) 22%, transparent); white-space: nowrap; }
  .run-score > strong i { margin-right: 0.3rem; color: var(--amber); font-size: 0.86rem; font-style: normal; vertical-align: 0.12rem; }
  .run-score > div { min-width: 0; display: grid; gap: 0.16rem; color: var(--dim); font: 560 0.48rem/1.1 system-ui, sans-serif; white-space: nowrap; }
  .run-score em { color: color-mix(in srgb, var(--gold) 58%, var(--dim)); font-style: normal; }
  .effect-slot { min-width: 0; display: grid; gap: 0.14rem; padding-left: 0.55rem; border-left: 1px solid color-mix(in srgb, var(--gold) 12%, transparent); }
  .effect-slot > span { color: var(--dim); font: 720 0.36rem/1 system-ui, sans-serif; letter-spacing: 0.12em; }
  .instrument-title { min-width: 0; padding-left: 0.75rem; border-left: 1px solid color-mix(in srgb, var(--gold) 12%, transparent); }
  .instrument-title span { display: block; color: var(--dim); font: 750 0.43rem/1 system-ui, sans-serif; letter-spacing: 0.17em; }
  .instrument-title strong { display: block; margin-top: 0.16rem; overflow: hidden; color: color-mix(in srgb, var(--gold) 74%, white); font: 560 0.72rem/1.1 Georgia, serif; text-overflow: ellipsis; white-space: nowrap; }
  .instrument-reading { display: grid; grid-template-columns: auto auto; align-items: center; gap: 0.08rem 0.38rem; text-align: right; }
  .instrument-reading small { color: var(--dim); font: 700 0.42rem/1 system-ui, sans-serif; letter-spacing: 0.08em; }
  .instrument-reading b { grid-row: 1 / 3; grid-column: 2; color: white; font: 760 0.82rem/1 ui-monospace, monospace; }
  .instrument-reading em { color: var(--amber); font: 560 0.43rem/1 system-ui, sans-serif; font-style: normal; text-transform: uppercase; }
  .primer-toggle { width: 1.4rem; height: 1.4rem; display: grid; place-items: center; padding: 0; color: var(--dim); background: transparent; border: 1px solid color-mix(in srgb, var(--gold) 18%, transparent); border-radius: 50%; font: 730 0.56rem/1 system-ui, sans-serif; }
  .primer-toggle:hover, .primer-toggle[aria-expanded='true'] { color: white; border-color: var(--amber); background: color-mix(in srgb, var(--amber) 9%, transparent); }
  .instrument-primer { display: grid; grid-template-columns: 7.2rem minmax(0,1fr) 8.5rem auto; align-items: center; gap: 0.55rem; margin: 0.28rem 0 0.12rem; padding: 0.38rem 0.48rem; color: var(--gold); background: linear-gradient(90deg, color-mix(in srgb,var(--amber) 8%,transparent), transparent 58%); border: 1px solid color-mix(in srgb,var(--amber) 20%,transparent); border-radius: 0.45rem; }
  .instrument-primer > div span { display: block; color: var(--amber); font: 740 0.38rem/1 system-ui,sans-serif; letter-spacing: 0.13em; }
  .instrument-primer > div strong { display: block; margin-top: 0.14rem; font: 600 0.57rem/1.1 Georgia,serif; }
  .instrument-primer ol { display: grid; grid-template-columns: repeat(3,1fr); gap: 0.35rem; margin: 0; padding: 0; list-style: none; }
  .instrument-primer li { display: flex; align-items: center; gap: 0.24rem; color: color-mix(in srgb,var(--gold) 70%,var(--dim)); font: 570 0.4rem/1.22 system-ui,sans-serif; }
  .instrument-primer li i { flex: 0 0 auto; display: grid; place-items: center; width: 0.9rem; height: 0.9rem; color: var(--amber); border: 1px solid color-mix(in srgb,var(--amber) 30%,transparent); border-radius: 50%; font-style: normal; }
  .instrument-primer p { color: var(--dim); font: italic 0.4rem/1.25 Georgia,serif; text-align: left; }
  .instrument-primer > button { padding: 0.28rem 0.4rem; color: var(--gold); background: color-mix(in srgb,var(--amber) 10%,transparent); border: 1px solid color-mix(in srgb,var(--amber) 28%,transparent); border-radius: 0.35rem; font: 650 0.43rem/1 system-ui,sans-serif; white-space: nowrap; }

  /* Prismata — a darkroom instrument built around one spatial act of refraction. */
  .prismata-chamber {
    width: min(45rem, calc(100vw - 29rem));
    margin: 0.32rem auto 0;
    padding: 0.42rem 0.62rem 0.5rem;
    clip-path: polygon(0.8rem 0, calc(100% - 0.8rem) 0, 100% 0.8rem, 100% calc(100% - 0.8rem), calc(100% - 0.8rem) 100%, 0.8rem 100%, 0 calc(100% - 0.8rem), 0 0.8rem);
    background:
      linear-gradient(115deg, color-mix(in srgb, var(--amber) 8%, transparent), transparent 28%),
      color-mix(in srgb, var(--panel) 92%, #05030d);
  }
  .optics-stage { position: relative; height: 3.75rem; margin: 0.28rem 0 0.2rem; overflow: hidden; border-bottom: 1px solid color-mix(in srgb, var(--gold) 10%, transparent); background: radial-gradient(ellipse at 45% 50%, color-mix(in srgb, var(--amber) 7%, transparent), transparent 22%); }
  .white-source { position: absolute; left: 0.3rem; top: 50%; width: 4rem; display: flex; align-items: center; gap: 0.4rem; transform: translateY(-50%); color: white; }
  .white-source i { width: 1.15rem; aspect-ratio: 1; border-radius: 50%; background: white; box-shadow: 0 0 1.1rem white; }
  .white-source span, .spectrum-detector span { font: 750 0.46rem/1.25 system-ui, sans-serif; letter-spacing: 0.1em; }
  .incident-beam { position: absolute; left: 4.2rem; right: 55%; top: 50%; height: 2px; background: linear-gradient(90deg, white, color-mix(in srgb, white 28%, transparent)); box-shadow: 0 0 0.55rem white; }
  .prism-core { position: absolute; left: 45%; top: 50%; width: 3.35rem; height: 3rem; display: grid; place-items: center; transform: translate(-50%, -50%); clip-path: polygon(50% 0, 100% 100%, 0 100%); background: linear-gradient(135deg, color-mix(in srgb, white 12%, transparent), color-mix(in srgb, var(--amber) 22%, transparent)); filter: drop-shadow(0 0 0.65rem color-mix(in srgb, var(--amber) 28%, transparent)); }
  .prism-core::after { content: ''; position: absolute; inset: 2px; clip-path: inherit; background: color-mix(in srgb, var(--panel) 80%, transparent); }
  .prism-core span { z-index: 1; margin-top: 1rem; color: white; font-size: 1rem; }
  .spectral-rays { position: absolute; inset: 0; }
  .spectral-rays i { position: absolute; left: 49%; top: 50%; width: 42%; height: 1px; transform: rotate(calc((var(--ray-index) - 2.5) * 4.6deg)); transform-origin: left center; background: var(--ray-color); opacity: 0.18; box-shadow: 0 0 0.35rem var(--ray-color); }
  .spectral-rays i.active { opacity: 0.88; }
  .spectral-rays span, .spectral-rays b { position: absolute; right: 0; color: var(--ray-color); font: 700 0.46rem/1 ui-monospace, monospace; }
  .spectral-rays span { transform: translate(0.1rem, -0.8rem); }
  .spectral-rays b { transform: translate(1.2rem, -0.25rem); }
  [data-band='red'] { --ray-color: #ff6f72; }
  [data-band='amber'] { --ray-color: #ffb95f; }
  [data-band='green'] { --ray-color: #7ce5a2; }
  [data-band='blue'] { --ray-color: #62c9ff; }
  [data-band='violet'] { --ray-color: #ba91ff; }
  [data-band='invisible'] { --ray-color: #f4eaff; }
  .spectrum-detector { position: absolute; right: 0.25rem; top: 50%; width: 5.3rem; display: grid; gap: 0.13rem; padding: 0.35rem 0.42rem; transform: translateY(-50%); color: var(--dim); background: color-mix(in srgb, var(--bg) 72%, transparent); border-left: 2px solid white; }
  .spectrum-detector b { color: white; font-size: 0.58rem; }
  .spectrum-detector small { font-size: 0.46rem; }
  .optics-controls { display: grid; grid-template-columns: 1fr 1.08fr; gap: 0.45rem; margin-top: 0.3rem; }
  .lens-modes { display: grid; grid-template-columns: 1fr 1fr; gap: 0.24rem; }
  .lens-modes button { min-width: 0; display: grid; grid-template-columns: auto 1fr; gap: 0.06rem 0.26rem; padding: 0.23rem 0.34rem; color: var(--dim); text-align: left; background: color-mix(in srgb, var(--bg) 62%, transparent); border: 1px solid color-mix(in srgb, var(--gold) 12%, transparent); }
  .lens-modes button > span { grid-row: 1 / 3; align-self: center; color: var(--amber); font-size: 0.88rem; }
  .lens-modes b { color: color-mix(in srgb, var(--gold) 66%, white); font-size: 0.54rem; }
  .lens-modes small { overflow: hidden; font-size: 0.42rem; line-height: 1.15; text-overflow: ellipsis; white-space: nowrap; }
  .lens-modes button[aria-pressed='true'] { border-color: white; box-shadow: inset 2px 0 var(--amber), inset 0 0 1rem color-mix(in srgb, var(--amber) 10%, transparent); }
  .ray-router { min-width: 0; display: grid; gap: 0.28rem; align-content: center; padding-left: 0.55rem; border-left: 1px solid color-mix(in srgb, var(--gold) 12%, transparent); }
  .ray-router label { display: flex; align-items: center; gap: 0.4rem; }
  .ray-router label > span { color: var(--dim); font: 720 0.46rem/1 system-ui, sans-serif; letter-spacing: 0.1em; }
  .ray-router select { min-width: 0; flex: 1; padding: 0.28rem 0.35rem; color: var(--gold); background: var(--bg); border: 1px solid color-mix(in srgb, var(--gold) 20%, transparent); }
  .band-routes { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.22rem; }
  .band-routes button { min-width: 0; padding: 0.26rem; color: var(--dim); background: color-mix(in srgb, var(--bg) 62%, transparent); border: 1px solid color-mix(in srgb, var(--ray-color) 30%, transparent); font: 650 0.47rem/1 system-ui, sans-serif; }
  .band-routes button span { margin-right: 0.2rem; color: var(--ray-color); }
  .band-routes button[aria-pressed='true'] { color: white; border-color: var(--ray-color); box-shadow: inset 0 0 0.8rem color-mix(in srgb, var(--ray-color) 12%, transparent); }

  /* Tempest — an atmospheric cross-section, not a recolored optical control panel. */
  .tempest-field { width: min(45rem, calc(100vw - 29rem)); margin: 0.12rem auto 0; padding: 0.42rem 0.62rem 0.5rem; border-radius: 1.2rem 0.18rem 1.2rem 0.18rem; background: linear-gradient(180deg, color-mix(in srgb, var(--panel) 86%, #071526), color-mix(in srgb, var(--panel) 94%, #03070d)); }
  .storm-layout { display: grid; grid-template-columns: 2rem minmax(14rem, 1fr) 7rem; align-items: stretch; gap: 0.4rem; height: 4.6rem; margin-top: 0.28rem; }
  .charge-column { display: grid; grid-template-rows: auto 1fr auto; place-items: center; color: var(--dim); font: 800 0.56rem/1 ui-monospace, monospace; }
  .charge-column > div { position: relative; width: 1.05rem; height: 3.45rem; overflow: hidden; border: 1px solid color-mix(in srgb, var(--gold) 28%, transparent); border-radius: 999px; background: color-mix(in srgb, var(--bg) 62%, transparent); }
  .charge-column i { position: absolute; left: 0; right: 0; bottom: 0; background: linear-gradient(0deg, var(--amber), var(--gold)); box-shadow: 0 0 0.8rem color-mix(in srgb, var(--amber) 48%, transparent); }
  .charge-column b { position: absolute; left: 50%; top: 50%; color: white; font-size: 0.45rem; transform: translate(-50%, -50%) rotate(-90deg); }
  .storm-map { position: relative; overflow: hidden; border-top: 1px solid color-mix(in srgb, var(--gold) 12%, transparent); border-bottom: 1px solid color-mix(in srgb, var(--gold) 20%, transparent); background: radial-gradient(ellipse at 50% 22%, color-mix(in srgb, var(--amber) 10%, transparent), transparent 56%); }
  .anvil-cloud { position: absolute; left: 10%; right: 10%; top: 0.1rem; height: 1.55rem; border-bottom: 1px solid color-mix(in srgb, var(--gold) 36%, transparent); border-radius: 55% 58% 30% 26%; background: radial-gradient(ellipse at 50% 100%, color-mix(in srgb, var(--gold) 13%, transparent), transparent 68%); }
  .anvil-cloud i { position: absolute; bottom: -0.4rem; width: 2.4rem; aspect-ratio: 1.8; border: 1px solid color-mix(in srgb, var(--gold) 24%, transparent); border-radius: 50%; background: color-mix(in srgb, var(--panel) 84%, transparent); }
  .anvil-cloud i:nth-child(1) { left: 12%; } .anvil-cloud i:nth-child(2) { left: 42%; width: 3.2rem; } .anvil-cloud i:nth-child(3) { right: 8%; }
  .charge-layer { position: absolute; left: 17%; right: 17%; height: 1rem; display: grid; place-items: center; border-radius: 50%; font: 780 0.5rem/1 ui-monospace, monospace; }
  .charge-layer.positive { top: 0.28rem; color: color-mix(in srgb, var(--gold) 74%, white); }
  .charge-layer.negative { top: 1.45rem; color: var(--amber); }
  .bolt-network { position: absolute; left: 50%; top: 1.8rem; bottom: 0.65rem; width: 10rem; transform: translateX(-50%); }
  .bolt-network i { position: absolute; left: 50%; top: calc(var(--branch-index) * 10%); width: calc(0.8rem + var(--branch-index) * 0.55rem); height: 1px; transform: rotate(calc(-56deg + var(--branch-index) * 16deg)); transform-origin: left center; background: color-mix(in srgb, var(--gold) 10%, transparent); }
  .bolt-network i::after { content: ''; position: absolute; right: 0; width: 0.32rem; height: 0.32rem; border-right: 1px solid currentColor; border-bottom: 1px solid currentColor; transform: rotate(45deg) translateY(-0.12rem); }
  .bolt-network i.lit { color: white; background: white; box-shadow: 0 0 0.45rem var(--gold); }
  .ground-plane { position: absolute; left: 0; right: 0; bottom: 0; height: 0.85rem; display: grid; place-items: center; border-top: 1px solid color-mix(in srgb, var(--gold) 34%, transparent); background: repeating-linear-gradient(135deg, color-mix(in srgb, var(--gold) 8%, transparent) 0 3px, transparent 3px 8px); }
  .ground-plane span { padding: 0 0.3rem; color: var(--dim); background: var(--panel); font: 720 0.43rem/1 system-ui, sans-serif; text-transform: uppercase; }
  .storm-threshold { position: absolute; left: 0.25rem; top: calc(100% - var(--threshold)); color: var(--dim); border-top: 1px dashed color-mix(in srgb, var(--amber) 42%, transparent); }
  .storm-threshold span { display: block; transform: translateY(-0.55rem); font: 650 0.4rem/1 ui-monospace, monospace; }
  .discharge-stack { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 0.4rem; text-align: center; border: 1px solid color-mix(in srgb, var(--gold) 12%, transparent); border-radius: 0.2rem 0.8rem 0.2rem 0.8rem; background: color-mix(in srgb, var(--bg) 52%, transparent); }
  .discharge-stack > small { color: var(--dim); font: 720 0.43rem/1 system-ui, sans-serif; letter-spacing: 0.08em; }
  .discharge-stack > strong { margin-top: 0.18rem; color: white; font: 800 1.05rem/1 ui-monospace, monospace; }
  .discharge-stack > span { margin-top: 0.12rem; color: var(--dim); font-size: 0.45rem; }
  .discharge-stack button { width: 100%; margin-top: 0.45rem; padding: 0.4rem 0.2rem; color: var(--bg); background: linear-gradient(180deg, white, var(--gold)); border: 0; border-radius: 0.45rem; }
  .discharge-stack button b, .discharge-stack button small { display: block; }
  .discharge-stack button b { font-size: 0.56rem; }
  .discharge-stack button small { margin-top: 0.12rem; font-size: 0.4rem; }
  .storm-controls { display: grid; grid-template-columns: 1fr 1.25fr; gap: 0.45rem; margin-top: 0.3rem; }
  .path-cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.2rem; }
  .path-cards button { min-width: 0; display: grid; grid-template-columns: auto 1fr; gap: 0.08rem 0.18rem; place-items: center start; padding: 0.22rem 0.2rem; color: var(--dim); background: color-mix(in srgb, var(--bg) 62%, transparent); border: 1px solid color-mix(in srgb, var(--gold) 12%, transparent); }
  .path-cards button span { grid-row: 1 / 3; }
  .path-cards button span { color: var(--amber); font-size: 0.8rem; }
  .path-cards button b { font-size: 0.47rem; }
  .path-cards button small { font-size: 0.4rem; }
  .path-cards button[aria-pressed='true'] { color: white; border-color: var(--gold); box-shadow: inset 0 -2px var(--amber); }
  .storm-route { display: grid; align-content: center; gap: 0.32rem; padding-left: 0.5rem; border-left: 1px solid color-mix(in srgb, var(--gold) 12%, transparent); }
  .route-scale, .risk-scale { display: grid; grid-template-columns: 6rem 1fr; align-items: center; gap: 0.3rem; }
  .route-scale > span, .risk-scale > span { color: var(--dim); font: 720 0.43rem/1 system-ui, sans-serif; letter-spacing: 0.08em; }
  .route-scale > div, .risk-scale > div { display: flex; gap: 0.16rem; }
  .storm-route button { flex: 1; min-width: 0; padding: 0.22rem 0.18rem; color: var(--dim); background: color-mix(in srgb, var(--bg) 62%, transparent); border: 1px solid color-mix(in srgb, var(--gold) 12%, transparent); font: 650 0.44rem/1 system-ui, sans-serif; }
  .storm-route button[aria-pressed='true'] { color: white; border-color: var(--gold); background: color-mix(in srgb, var(--amber) 10%, transparent); }

  /* Canticle — a circular score whose silence is a visible part of the composition. */
  .canticle-score { width: min(42rem, calc(100vw - 29rem)); margin: 0.12rem auto 0; padding: 0.42rem 0.62rem 0.5rem; border-radius: 1.4rem 1.4rem 0.45rem 0.45rem; background: radial-gradient(ellipse at 25% 55%, color-mix(in srgb, var(--amber) 8%, transparent), transparent 32%), color-mix(in srgb, var(--panel) 92%, #0c0710); }
  .score-layout { display: grid; grid-template-columns: 8.3rem 1fr; gap: 0.55rem; align-items: center; margin-top: 0.24rem; }
  .orbital-measure { position: relative; width: 7.5rem; aspect-ratio: 1; margin: 0 auto; border: 1px solid color-mix(in srgb, var(--gold) 18%, transparent); border-radius: 50%; background: radial-gradient(circle, color-mix(in srgb, var(--amber) 7%, transparent), transparent 65%); }
  .orbital-measure::before, .orbital-measure::after { content: ''; position: absolute; inset: 18%; border: 1px solid color-mix(in srgb, var(--gold) 12%, transparent); border-radius: 50%; }
  .orbital-measure::after { inset: 34%; border-style: dashed; }
  .nodal-figure { position: absolute; inset: 12%; border-radius: 50%; background: repeating-conic-gradient(from 22.5deg, transparent 0 20deg, color-mix(in srgb, var(--gold) 7%, transparent) 21deg 22.5deg); -webkit-mask: radial-gradient(circle, transparent 0 34%, #000 35% 78%, transparent 79%); mask: radial-gradient(circle, transparent 0 34%, #000 35% 78%, transparent 79%); }
  .nodal-figure i { position: absolute; left: 50%; top: 50%; width: 70%; height: 42%; border: 1px solid color-mix(in srgb, var(--gold) 16%, transparent); border-radius: 50%; transform: translate(-50%, -50%) rotate(calc(var(--node-rotation, 0) * 1deg)); }
  .nodal-figure i:nth-child(2) { --node-rotation: 60; } .nodal-figure i:nth-child(3) { --node-rotation: 120; }
  .measure-center { position: absolute; left: 50%; top: 50%; z-index: 2; width: 2.35rem; aspect-ratio: 1; display: grid; place-items: center; align-content: center; gap: 0.04rem; transform: translate(-50%, -50%); color: white; border: 1px solid color-mix(in srgb, var(--gold) 28%, transparent); border-radius: 50%; background: color-mix(in srgb, var(--bg) 76%, transparent); box-shadow: 0 0 1rem color-mix(in srgb, var(--amber) 12%, transparent); }
  .measure-center > span { color: var(--dim); font-size: 0.5rem; }
  .measure-center strong { font: 760 0.8rem/1 ui-monospace, monospace; }
  .measure-center small { color: var(--dim); font-size: 0.38rem; }
  .orbital-measure > button { --slot-angle: calc(var(--slot-index) * 22.5deg); position: absolute; left: calc(50% - 0.62rem); top: calc(50% - 0.62rem); z-index: 3; width: 1.24rem; height: 1.24rem; display: grid; place-items: center; align-content: center; gap: 0.01rem; padding: 0; color: color-mix(in srgb, var(--gold) 58%, var(--dim)); background: color-mix(in srgb, var(--panel) 94%, var(--bg)); border: 1px solid color-mix(in srgb, var(--gold) 18%, transparent); border-radius: 50%; transform: rotate(var(--slot-angle)) translateY(-3.08rem) rotate(calc(-1 * var(--slot-angle))); }
  .orbital-measure > button span { font: 720 0.48rem/1 ui-monospace, monospace; }
  .orbital-measure > button small { color: var(--dim); font-size: 0.34rem; }
  .orbital-measure > button[data-role='rest'] { border-style: dashed; background: color-mix(in srgb, var(--bg) 90%, transparent); }
  .orbital-measure > button.active { color: white; border-color: white; box-shadow: 0 0 0 0.16rem color-mix(in srgb, var(--amber) 16%, transparent), 0 0 0.8rem var(--amber); }
  .score-console { min-width: 0; display: grid; gap: 0.42rem; }
  .measure-presets { display: grid; grid-template-columns: 1fr 1fr; gap: 0.24rem; }
  .measure-presets button { min-width: 0; display: flex; align-items: center; gap: 0.38rem; padding: 0.34rem 0.4rem; color: var(--dim); text-align: left; background: color-mix(in srgb, var(--bg) 62%, transparent); border: 1px solid color-mix(in srgb, var(--gold) 12%, transparent); border-radius: 0.55rem 0.2rem 0.55rem 0.2rem; }
  .measure-presets button > span { color: var(--amber); font-size: 0.9rem; }
  .measure-presets button div { min-width: 0; display: grid; gap: 0.08rem; }
  .measure-presets b { color: color-mix(in srgb, var(--gold) 70%, white); font-size: 0.5rem; }
  .measure-presets small { overflow: hidden; font-size: 0.4rem; text-overflow: ellipsis; white-space: nowrap; }
  .measure-presets button[aria-pressed='true'] { color: white; border-color: var(--gold); box-shadow: inset 2px 0 var(--amber); }
  .role-legend { display: flex; flex-wrap: wrap; justify-content: center; gap: 0.22rem 0.46rem; padding-top: 0.35rem; border-top: 1px solid color-mix(in srgb, var(--gold) 10%, transparent); }
  .role-legend span { color: var(--dim); font: 620 0.42rem/1 system-ui, sans-serif; }
  .role-legend i { margin-right: 0.18rem; color: var(--gold); font-style: normal; }
</style>

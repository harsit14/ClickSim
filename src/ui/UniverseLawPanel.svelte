<script lang="ts">
  import { onMount } from 'svelte'
  import {
    game,
    activateUniverseLaw,
    configurePrismataRoute,
    configureTempestPath,
    configureUniverseLaw,
    editCanticleSlot,
  } from '../engine/game.svelte'
  import { universeById } from '../content/universes'
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

  let now = $state(Date.now())
  let selectedPrismataKindling = $state(0)
  const prismataKindlings = universeById('prismata').generators
  const prismata = $derived(game.activeUniverse === 'prismata' ? prismataStatus(game.numericLawState, game.owned) : null)
  const tempest = $derived(game.activeUniverse === 'tempest' ? tempestStatus(game.numericLawState) : null)
  const canticle = $derived(game.activeUniverse === 'canticle' ? canticleStatus(game.numericLawState, game.owned, now) : null)

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

  function editSlot(index: number) {
    if (editCanticleSlot(index)) save()
  }

  function roleGlyph(role: (typeof CANTICLE_ROLES)[number]): string {
    return role === 'rest' ? '○' : role === 'pulse' ? '●' : role === 'sustain' ? '━' : role === 'echo' ? '))' : role === 'syncopation' ? '◆' : '×'
  }

  onMount(() => {
    const timer = setInterval(() => (now = Date.now()), 150)
    return () => clearInterval(timer)
  })
</script>

{#if prismata}
  <section class="law-panel prismata" aria-label="Prismata spectrum bench">
    <header>
      <span>SPECTRUM BENCH</span>
      <strong>{prismata.recipe.glyph} {prismata.recipe.name}</strong>
      <em>×{prismata.multiplier.toFixed(2)}</em>
    </header>
    <div class="spectrum" aria-label={`${prismata.activeBands} of 6 wavelength families active`}>
      {#each prismata.bands as quantity, index}
        <i class:active={quantity > 0} style={`--band:${index}`} title={`Band ${index + 1}: ${quantity}`}></i>
      {/each}
    </div>
    <p>{prismata.explanation}</p>
    <div class="choices" role="group" aria-label="free lens recipe selection">
      {#each PRISMATA_RECIPES as recipe, index}
        <button aria-pressed={prismata.recipeIndex === index} onclick={() => configure(index)} title={recipe.description}>
          <span>{recipe.glyph}</span>{recipe.name}
        </button>
      {/each}
    </div>
    <div class="route-editor prism-route">
      <label>
        <span>Route Kindling</span>
        <select bind:value={selectedPrismataKindling} aria-label="Kindling family to route">
          {#each prismataKindlings as kindling, index (kindling.id)}
            <option value={index}>{kindling.name}</option>
          {/each}
        </select>
      </label>
      <div class="band-routes" role="group" aria-label={`Route ${prismataKindlings[selectedPrismataKindling].name} to wavelength band`}>
        {#each PRISMATA_BANDS as band, index (band.id)}
          <button aria-pressed={prismata.routes[selectedPrismataKindling] === index} onclick={() => routePrismata(index)} title={band.name}>
            <span>{band.glyph}</span>{band.name}
          </button>
        {/each}
      </div>
    </div>
  </section>
{:else if tempest}
  <section class="law-panel tempest" aria-label="Tempest potential field">
    <header>
      <span>POTENTIAL FIELD</span>
      <strong>{tempest.path.glyph} {tempest.path.name}</strong>
      <em>×{tempest.multiplier.toFixed(2)}</em>
    </header>
    <div class="charge" aria-label={`${Math.round(tempest.charge)} percent charge; ${tempest.explanation}`}>
      {#each Array(10) as _, index}
        <i class:active={tempest.charge >= (index + 1) * 10}></i>
      {/each}
      <b>{Math.round(tempest.charge)}%</b>
    </div>
    <p>{tempest.explanation}</p>
    <div class="choices" role="group" aria-label="discharge path selection">
      {#each TEMPEST_PATHS as path, index}
        <button aria-pressed={tempest.pathIndex === index} onclick={() => configure(index)} title={path.description}>
          <span>{path.glyph}</span>{path.name}
        </button>
      {/each}
      <button class="activate" disabled={!tempest.ready || tempest.boostRemainingSec > 0} onclick={discharge}>
        {tempest.boostRemainingSec > 0 ? `${Math.ceil(tempest.boostRemainingSec)}s` : 'Discharge'}
      </button>
    </div>
    <div class="route-editor storm-route">
      <div class="route-scale">
        <span>Path length</span>
        <div role="group" aria-label="storm path length">
          {#each Array(8) as _, index}
            <button aria-pressed={tempest.length === index + 1} onclick={() => configureStorm(index + 1, tempest.riskIndex)}>{index + 1}</button>
          {/each}
        </div>
      </div>
      <div class="risk-scale">
        <span>Branch risk</span>
        <div role="group" aria-label="storm path risk">
          {#each TEMPEST_RISKS as risk, index (risk.id)}
            <button aria-pressed={tempest.riskIndex === index} onclick={() => configureStorm(tempest.length, index)} title={risk.description}>
              {risk.glyph} {risk.name}
            </button>
          {/each}
        </div>
      </div>
      <strong>{tempest.threshold}% → ×{tempest.boost.toFixed(2)}</strong>
    </div>
  </section>
{:else if canticle}
  <section class="law-panel canticle" aria-label="Canticle living measure">
    <header>
      <span>LIVING MEASURE</span>
      <strong>{canticle.measure.glyph} {canticle.measure.name}</strong>
      <em>×{canticle.multiplier.toFixed(2)}</em>
    </header>
    <div class="measure" aria-label={canticle.explanation}>
      {#each canticle.slots as role, index}
        <button class:active={canticle.slotIndex === index} data-role={role} onclick={() => editSlot(index)} title={`Edit slot ${index + 1}: ${role}`} aria-label={`Slot ${index + 1}, ${role}; activate to choose next role`}>
          {roleGlyph(role)}
        </button>
      {/each}
    </div>
    <p>{canticle.explanation}</p>
    <div class="choices" role="group" aria-label="free measure preset selection">
      {#each CANTICLE_MEASURES as measure, index}
        <button aria-pressed={canticle.measureIndex === index} onclick={() => configure(index)} title={measure.description}>
          <span>{measure.glyph}</span>{measure.name}
        </button>
      {/each}
    </div>
  </section>
{/if}

<style>
  .law-panel {
    width: min(42rem, calc(100vw - 30rem));
    margin: 0.35rem auto 0;
    padding: 0.5rem 0.7rem 0.58rem;
    color: var(--gold);
    background: color-mix(in srgb, var(--panel) 86%, transparent);
    border: 1px solid color-mix(in srgb, var(--amber) 26%, transparent);
    box-shadow: 0 0.7rem 2.5rem color-mix(in srgb, var(--bg) 78%, transparent);
    pointer-events: auto;
    backdrop-filter: blur(10px);
  }
  .prismata { clip-path: polygon(1.4% 0, 98.6% 0, 100% 50%, 98.6% 100%, 1.4% 100%, 0 50%); }
  .tempest { border-radius: 1.2rem 0.2rem 1.2rem 0.2rem; }
  .canticle { border-radius: 50% / 14%; }
  header { display: grid; grid-template-columns: 1fr auto auto; align-items: baseline; gap: 0.7rem; }
  header span { color: var(--dim); font: 700 0.58rem/1.1 ui-sans-serif, system-ui; letter-spacing: 0.18em; }
  header strong { font: 650 0.78rem/1.1 ui-sans-serif, system-ui; }
  header em { color: var(--amber); font: 750 0.7rem/1 ui-monospace, monospace; }
  p { min-height: 1em; margin: 0.28rem 0 0.35rem; text-align: center; color: var(--dim); font: italic 0.62rem/1.25 Georgia, serif; }
  .choices { display: flex; justify-content: center; gap: 0.28rem; }
  .choices button {
    min-width: 5.4rem;
    padding: 0.3rem 0.44rem;
    color: var(--dim);
    background: color-mix(in srgb, var(--bg) 65%, transparent);
    border: 1px solid color-mix(in srgb, var(--amber) 18%, transparent);
    border-radius: 0.35rem;
    font: 650 0.58rem/1 ui-sans-serif, system-ui;
  }
  .choices button span { margin-right: 0.25rem; color: var(--amber); }
  .choices button[aria-pressed='true'] { color: var(--gold); border-color: color-mix(in srgb, var(--gold) 60%, transparent); box-shadow: inset 0 0 1.1rem color-mix(in srgb, var(--amber) 12%, transparent); }
  .choices button:hover:not(:disabled), .choices button:focus-visible { color: white; border-color: var(--gold); }
  .choices button:disabled { opacity: 0.4; }
  .choices .activate { min-width: 6.4rem; color: var(--bg); background: var(--gold); border-color: var(--gold); }
  .route-editor { display: grid; gap: 0.35rem; margin-top: 0.5rem; padding-top: 0.45rem; border-top: 1px solid color-mix(in srgb, var(--gold) 14%, transparent); }
  .route-editor label, .route-scale, .risk-scale { display: flex; align-items: center; justify-content: center; gap: 0.45rem; color: var(--dim); font: 650 0.56rem/1 ui-sans-serif, system-ui; text-transform: uppercase; letter-spacing: 0.08em; }
  .route-editor select { min-width: 9rem; padding: 0.22rem 0.35rem; color: var(--gold); background: var(--bg); border: 1px solid color-mix(in srgb, var(--gold) 22%, transparent); border-radius: 0.3rem; font: 650 0.58rem/1 ui-sans-serif, system-ui; }
  .band-routes, .route-scale > div, .risk-scale > div { display: flex; justify-content: center; gap: 0.22rem; }
  .route-editor button { padding: 0.22rem 0.34rem; color: var(--dim); background: color-mix(in srgb, var(--bg) 68%, transparent); border: 1px solid color-mix(in srgb, var(--gold) 16%, transparent); border-radius: 0.3rem; font: 650 0.52rem/1 ui-sans-serif, system-ui; }
  .route-editor button[aria-pressed='true'] { color: var(--gold); border-color: var(--gold); }
  .route-editor strong { text-align: center; color: var(--amber); font: 700 0.58rem/1 ui-monospace, monospace; }
  .spectrum, .charge, .measure { display: flex; align-items: center; justify-content: center; gap: 0.25rem; margin-top: 0.35rem; }
  .spectrum i { width: 2.8rem; height: 0.28rem; opacity: 0.18; background: repeating-linear-gradient(calc(20deg + var(--band) * 15deg), var(--gold) 0 2px, transparent 2px 4px); border: 1px solid color-mix(in srgb, var(--gold) 24%, transparent); }
  .spectrum i.active { opacity: 0.82; box-shadow: 0 0 0.7rem color-mix(in srgb, var(--amber) 28%, transparent); }
  .charge i { width: 1.6rem; height: 0.25rem; transform: skewX(-18deg); background: color-mix(in srgb, var(--gold) 9%, transparent); border: 1px solid color-mix(in srgb, var(--gold) 16%, transparent); }
  .charge i.active { background: var(--amber); box-shadow: 0 0 0.6rem color-mix(in srgb, var(--amber) 42%, transparent); }
  .charge b { min-width: 2.6rem; margin-left: 0.35rem; font: 700 0.65rem/1 ui-monospace, monospace; }
  .measure button { display: grid; place-items: center; width: 1.7rem; height: 1.35rem; padding: 0; color: color-mix(in srgb, var(--gold) 48%, transparent); background: transparent; border: 0; border-bottom: 1px solid color-mix(in srgb, var(--gold) 18%, transparent); font: 650 0.58rem/1 ui-monospace, monospace; }
  .measure button[data-role='rest'] { border: 1px dashed color-mix(in srgb, var(--gold) 24%, transparent); border-radius: 50%; }
  .measure button.active { color: white; border-color: var(--gold); text-shadow: 0 0 0.7rem var(--amber); transform: translateY(-0.12rem); }
</style>

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
  <section class="law-panel prismata-chamber" aria-label="Prismata refraction chamber">
    <div class="optics-heading">
      <div><span>REFRACTION CHAMBER</span><strong>Split. Name. Recombine.</strong></div>
      <div class="optics-reading"><small>{prismata.activeBands}/6 bands</small><b>×{prismata.multiplier.toFixed(2)}</b></div>
    </div>

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
    <div class="storm-heading">
      <div><span>LIVE STORM FIELD</span><strong>{tempest.path.name} cell</strong></div>
      <div class="storm-multiplier"><small>{tempest.boostRemainingSec > 0 ? 'DISCHARGING' : tempest.ready ? 'BREAKDOWN READY' : 'CHARGING'}</small><b>×{tempest.multiplier.toFixed(2)}</b></div>
    </div>

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
    <div class="score-heading">
      <div><span>RESONANCE SCORE</span><strong>{canticle.measure.name}</strong></div>
      <div class="score-reading"><small>beat {canticle.slotIndex + 1}/16 · {canticle.role}</small><b>×{canticle.multiplier.toFixed(2)}</b></div>
    </div>

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

  /* Prismata — a darkroom instrument built around one spatial act of refraction. */
  .prismata-chamber {
    width: min(45rem, calc(100vw - 29rem));
    margin: 0.32rem auto 0;
    padding: 0.58rem 0.72rem 0.68rem;
    clip-path: polygon(0.8rem 0, calc(100% - 0.8rem) 0, 100% 0.8rem, 100% calc(100% - 0.8rem), calc(100% - 0.8rem) 100%, 0.8rem 100%, 0 calc(100% - 0.8rem), 0 0.8rem);
    background:
      linear-gradient(115deg, color-mix(in srgb, var(--amber) 8%, transparent), transparent 28%),
      color-mix(in srgb, var(--panel) 92%, #05030d);
  }
  .optics-heading, .storm-heading, .score-heading { display: flex; align-items: flex-end; justify-content: space-between; gap: 1rem; }
  .optics-heading span, .storm-heading span, .score-heading span { display: block; color: var(--dim); font: 750 0.5rem/1 system-ui, sans-serif; letter-spacing: 0.18em; }
  .optics-heading strong, .storm-heading strong, .score-heading strong { display: block; margin-top: 0.12rem; color: color-mix(in srgb, var(--gold) 74%, white); font: 560 0.78rem/1.1 Georgia, serif; }
  .optics-reading, .storm-multiplier, .score-reading { text-align: right; }
  .optics-reading small, .storm-multiplier small, .score-reading small { display: block; color: var(--dim); font: 650 0.49rem/1 system-ui, sans-serif; text-transform: uppercase; letter-spacing: 0.08em; }
  .optics-reading b, .storm-multiplier b, .score-reading b { display: block; margin-top: 0.12rem; color: white; font: 750 0.72rem/1 ui-monospace, monospace; }
  .optics-stage { position: relative; height: 5.6rem; margin: 0.45rem 0 0.28rem; overflow: hidden; border-top: 1px solid color-mix(in srgb, var(--gold) 10%, transparent); border-bottom: 1px solid color-mix(in srgb, var(--gold) 10%, transparent); background: radial-gradient(ellipse at 45% 50%, color-mix(in srgb, var(--amber) 7%, transparent), transparent 22%); }
  .white-source { position: absolute; left: 0.3rem; top: 50%; width: 4rem; display: flex; align-items: center; gap: 0.4rem; transform: translateY(-50%); color: white; }
  .white-source i { width: 1.15rem; aspect-ratio: 1; border-radius: 50%; background: white; box-shadow: 0 0 1.1rem white; }
  .white-source span, .spectrum-detector span { font: 750 0.46rem/1.25 system-ui, sans-serif; letter-spacing: 0.1em; }
  .incident-beam { position: absolute; left: 4.2rem; right: 55%; top: 50%; height: 2px; background: linear-gradient(90deg, white, color-mix(in srgb, white 28%, transparent)); box-shadow: 0 0 0.55rem white; }
  .prism-core { position: absolute; left: 45%; top: 50%; width: 4.35rem; height: 4rem; display: grid; place-items: center; transform: translate(-50%, -50%); clip-path: polygon(50% 0, 100% 100%, 0 100%); background: linear-gradient(135deg, color-mix(in srgb, white 12%, transparent), color-mix(in srgb, var(--amber) 22%, transparent)); filter: drop-shadow(0 0 0.65rem color-mix(in srgb, var(--amber) 28%, transparent)); }
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
  .optics-controls { display: grid; grid-template-columns: 1fr 1.08fr; gap: 0.55rem; margin-top: 0.48rem; }
  .lens-modes { display: grid; grid-template-columns: 1fr 1fr; gap: 0.24rem; }
  .lens-modes button { min-width: 0; display: grid; grid-template-columns: auto 1fr; gap: 0.08rem 0.3rem; padding: 0.32rem 0.4rem; color: var(--dim); text-align: left; background: color-mix(in srgb, var(--bg) 62%, transparent); border: 1px solid color-mix(in srgb, var(--gold) 12%, transparent); }
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
  .tempest-field { width: min(45rem, calc(100vw - 29rem)); margin: 0.32rem auto 0; padding: 0.6rem 0.72rem 0.68rem; border-radius: 1.2rem 0.18rem 1.2rem 0.18rem; background: linear-gradient(180deg, color-mix(in srgb, var(--panel) 86%, #071526), color-mix(in srgb, var(--panel) 94%, #03070d)); }
  .storm-layout { display: grid; grid-template-columns: 2.6rem minmax(14rem, 1fr) 7.4rem; align-items: stretch; gap: 0.45rem; height: 7rem; margin-top: 0.42rem; }
  .charge-column { display: grid; grid-template-rows: auto 1fr auto; place-items: center; color: var(--dim); font: 800 0.56rem/1 ui-monospace, monospace; }
  .charge-column > div { position: relative; width: 1.25rem; height: 5.3rem; overflow: hidden; border: 1px solid color-mix(in srgb, var(--gold) 28%, transparent); border-radius: 999px; background: color-mix(in srgb, var(--bg) 62%, transparent); }
  .charge-column i { position: absolute; left: 0; right: 0; bottom: 0; background: linear-gradient(0deg, var(--amber), var(--gold)); box-shadow: 0 0 0.8rem color-mix(in srgb, var(--amber) 48%, transparent); }
  .charge-column b { position: absolute; left: 50%; top: 50%; color: white; font-size: 0.45rem; transform: translate(-50%, -50%) rotate(-90deg); }
  .storm-map { position: relative; overflow: hidden; border-top: 1px solid color-mix(in srgb, var(--gold) 12%, transparent); border-bottom: 1px solid color-mix(in srgb, var(--gold) 20%, transparent); background: radial-gradient(ellipse at 50% 22%, color-mix(in srgb, var(--amber) 10%, transparent), transparent 56%); }
  .anvil-cloud { position: absolute; left: 10%; right: 10%; top: 0.35rem; height: 2.4rem; border-bottom: 1px solid color-mix(in srgb, var(--gold) 36%, transparent); border-radius: 55% 58% 30% 26%; background: radial-gradient(ellipse at 50% 100%, color-mix(in srgb, var(--gold) 13%, transparent), transparent 68%); }
  .anvil-cloud i { position: absolute; bottom: -0.4rem; width: 2.4rem; aspect-ratio: 1.8; border: 1px solid color-mix(in srgb, var(--gold) 24%, transparent); border-radius: 50%; background: color-mix(in srgb, var(--panel) 84%, transparent); }
  .anvil-cloud i:nth-child(1) { left: 12%; } .anvil-cloud i:nth-child(2) { left: 42%; width: 3.2rem; } .anvil-cloud i:nth-child(3) { right: 8%; }
  .charge-layer { position: absolute; left: 17%; right: 17%; height: 1rem; display: grid; place-items: center; border-radius: 50%; font: 780 0.5rem/1 ui-monospace, monospace; }
  .charge-layer.positive { top: 0.8rem; color: color-mix(in srgb, var(--gold) 74%, white); }
  .charge-layer.negative { top: 2.7rem; color: var(--amber); }
  .bolt-network { position: absolute; left: 50%; top: 3rem; bottom: 0.8rem; width: 10rem; transform: translateX(-50%); }
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
  .storm-controls { display: grid; grid-template-columns: 1fr 1.25fr; gap: 0.55rem; margin-top: 0.48rem; }
  .path-cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.2rem; }
  .path-cards button { min-width: 0; display: grid; gap: 0.12rem; place-items: center; padding: 0.3rem 0.16rem; color: var(--dim); background: color-mix(in srgb, var(--bg) 62%, transparent); border: 1px solid color-mix(in srgb, var(--gold) 12%, transparent); }
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
  .canticle-score { width: min(38rem, calc(100vw - 31rem)); margin: 0.32rem auto 0; padding: 0.6rem 0.7rem 0.68rem; border-radius: 1.4rem 1.4rem 0.45rem 0.45rem; background: radial-gradient(ellipse at 25% 55%, color-mix(in srgb, var(--amber) 8%, transparent), transparent 32%), color-mix(in srgb, var(--panel) 92%, #0c0710); }
  .score-layout { display: grid; grid-template-columns: 11.5rem 1fr; gap: 0.7rem; align-items: center; margin-top: 0.38rem; }
  .orbital-measure { position: relative; width: 10.8rem; aspect-ratio: 1; margin: 0 auto; border: 1px solid color-mix(in srgb, var(--gold) 18%, transparent); border-radius: 50%; background: radial-gradient(circle, color-mix(in srgb, var(--amber) 7%, transparent), transparent 65%); }
  .orbital-measure::before, .orbital-measure::after { content: ''; position: absolute; inset: 18%; border: 1px solid color-mix(in srgb, var(--gold) 12%, transparent); border-radius: 50%; }
  .orbital-measure::after { inset: 34%; border-style: dashed; }
  .nodal-figure { position: absolute; inset: 12%; border-radius: 50%; background: repeating-conic-gradient(from 22.5deg, transparent 0 20deg, color-mix(in srgb, var(--gold) 7%, transparent) 21deg 22.5deg); -webkit-mask: radial-gradient(circle, transparent 0 34%, #000 35% 78%, transparent 79%); mask: radial-gradient(circle, transparent 0 34%, #000 35% 78%, transparent 79%); }
  .nodal-figure i { position: absolute; left: 50%; top: 50%; width: 70%; height: 42%; border: 1px solid color-mix(in srgb, var(--gold) 16%, transparent); border-radius: 50%; transform: translate(-50%, -50%) rotate(calc(var(--node-rotation, 0) * 1deg)); }
  .nodal-figure i:nth-child(2) { --node-rotation: 60; } .nodal-figure i:nth-child(3) { --node-rotation: 120; }
  .measure-center { position: absolute; left: 50%; top: 50%; z-index: 2; width: 3.3rem; aspect-ratio: 1; display: grid; place-items: center; align-content: center; gap: 0.08rem; transform: translate(-50%, -50%); color: white; border: 1px solid color-mix(in srgb, var(--gold) 28%, transparent); border-radius: 50%; background: color-mix(in srgb, var(--bg) 76%, transparent); box-shadow: 0 0 1rem color-mix(in srgb, var(--amber) 12%, transparent); }
  .measure-center > span { color: var(--dim); font-size: 0.5rem; }
  .measure-center strong { font: 760 0.8rem/1 ui-monospace, monospace; }
  .measure-center small { color: var(--dim); font-size: 0.38rem; }
  .orbital-measure > button { --slot-angle: calc(var(--slot-index) * 22.5deg); position: absolute; left: calc(50% - 0.9rem); top: calc(50% - 0.9rem); z-index: 3; width: 1.8rem; height: 1.8rem; display: grid; place-items: center; align-content: center; gap: 0.02rem; padding: 0; color: color-mix(in srgb, var(--gold) 58%, var(--dim)); background: color-mix(in srgb, var(--panel) 94%, var(--bg)); border: 1px solid color-mix(in srgb, var(--gold) 18%, transparent); border-radius: 50%; transform: rotate(var(--slot-angle)) translateY(-5.18rem) rotate(calc(-1 * var(--slot-angle))); }
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

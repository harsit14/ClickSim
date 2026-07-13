<script lang="ts">
  import { onMount } from 'svelte'
  import {
    activeRatePerSec,
    beginKailashLongRest,
    endKailashLongRest,
    game,
    activateUniverseLaw,
    activateVishnulokConfluence,
    configureBrahmalokDirection,
    configureBrahmalokMargin,
    configureVerdanceGrafting,
    configureVishnulokPath,
    configureUniverseLaw,
    editKailashSlot,
    kailashLongRestUnlocked,
    reviewBankedBrahmalokCommission,
    reviewBankedKailashFront,
    severVerdanceGrafting,
  } from '../engine/game.svelte'
  import { universeById, universeV2ById } from '../content/universes'
  import { verdanceGraftingStatus } from '../content/universes/verdance'
  import {
    KAILASH_ACTS,
    KAILASH_CYCLES,
    BRAHMALOK_DIRECTIONS,
    BRAHMALOK_MODES,
    VISHNULOK_CIRCUITS,
    VISHNULOK_BURDENS,
    kailashStatus,
    kailashFrontStatus,
    kailashLongRestStatus,
    brahmalokStatus,
    brahmalokCommissionStatus,
    brahmalokMarginModeIndex,
    vishnulokCircuitStatus,
    f4RateMultiplier,
    vishnulokStrainStatus,
  } from '../content/universes/f4-runtime'
  import { save } from '../core/save'
  import { format } from '../core/format'
  import { isZeroAmount } from '../core/numeric/amount'
  import BuffBar from './BuffBar.svelte'

  let { onactivitychange = () => {} }: { onactivitychange?: (active: boolean) => void } = $props()

  let now = $state(Date.now())
  let selectedBrahmalokKindling = $state(0)
  let primerMounted = $state(false)
  let primerOpen = $state(false)
  let instrumentExpanded = $state(true)
  let instrumentExperienced = $state(false)
  let instrumentPreference = $state<'auto' | 'expanded' | 'compact'>('auto')
  const brahmalokKindlings = universeById('brahmalok').generators
  const verdanceKindlings = universeById('verdance').generators
  const verdanceGraft = $derived(game.activeUniverse === 'verdance'
    ? verdanceGraftingStatus(verdanceKindlings.map(({ id }) => id), game.owned, game.numericLawState)
    : null)
  const brahmalok = $derived(game.activeUniverse === 'brahmalok' ? brahmalokStatus(game.numericLawState, game.owned) : null)
  const brahmalokCommission = $derived(game.activeUniverse === 'brahmalok' && (game.owned['brahmalok-kindling-07'] ?? 0) > 0 ? brahmalokCommissionStatus(game.numericLawState, game.owned, game.curiosities.length) : null)
  const brahmalokMargin = $derived(game.activeUniverse === 'brahmalok' ? brahmalokMarginModeIndex(game.numericLawState) : null)
  const vishnulok = $derived(game.activeUniverse === 'vishnulok' ? vishnulokCircuitStatus(game.numericLawState) : null)
  const vishnulokStrain = $derived(game.activeUniverse === 'vishnulok' && (game.owned['vishnulok-kindling-08'] ?? 0) > 0 ? vishnulokStrainStatus(game.numericLawState) : null)
  const kailash = $derived(game.activeUniverse === 'kailash' ? kailashStatus(game.numericLawState, game.owned, now) : null)
  const kailashFront = $derived(game.activeUniverse === 'kailash' && (game.owned['kailash-kindling-09'] ?? 0) > 0 ? kailashFrontStatus(game.numericLawState, game.owned) : null)
  const kailashRest = $derived(game.activeUniverse === 'kailash' ? kailashLongRestStatus(game.numericLawState) : null)
  const pack = $derived(universeById(game.activeUniverse))
  const realmLawMultiplier = $derived(f4RateMultiplier(game.activeUniverse, game.numericLawState, game.owned, now))
  const rate = $derived(activeRatePerSec(now))
  const epochMatter = $derived(universeV2ById(game.activeUniverse)?.economy.localPrestige.rewardCurrency)
  const instrumentPrimers = {
    brahmalok: {
      title: 'Reading the creation mandala',
      steps: ['Choose how the lotus unfolds', 'Route a Kindling through seed, measure, name, or form', 'Watch direction coverage and balance change the multiplier'],
      note: 'Mandala changes are free and never consume a Kindling.',
    },
    vishnulok: {
      title: 'Reading the Endless Circuit',
      steps: ['Choose a correction circuit', 'Set its reach and the burden it carries', 'Let continuity reach the threshold, then Complete Return'],
      note: 'Longer, more burdened circuits ask for more continuity and return more sustaining power.',
    },
    kailash: {
      title: 'Reading the Still Point',
      steps: ['Choose a mountain cycle', 'Select any numbered position to change its act', 'Keep refuge, grace, and meaningful rests inside release'],
      note: 'The five acts are game-fiction labels. Editing is free and immediately reversible.',
    },
  } as const
  const instrumentPrimer = $derived(
    game.activeUniverse === 'brahmalok' || game.activeUniverse === 'vishnulok' || game.activeUniverse === 'kailash'
      ? instrumentPrimers[game.activeUniverse]
      : null,
  )

  $effect(() => {
    const active = Boolean(verdanceGraft || ((brahmalok || vishnulok || kailash) && instrumentExpanded))
    onactivitychange(active)
    return () => onactivitychange(false)
  })

  function configure(index: number) {
    if (!configureUniverseLaw(index)) return
    save()
    if (game.activeUniverse === 'kailash') markInstrumentExperienced()
  }

  function discharge() {
    if (!activateUniverseLaw()) return
    save()
    markInstrumentExperienced()
  }

  function dischargeSecond() {
    if (!activateVishnulokConfluence()) return
    save()
    markInstrumentExperienced()
  }

  function routeBrahmalok(directionIndex: number) {
    if (!configureBrahmalokDirection(selectedBrahmalokKindling, directionIndex)) return
    save()
    markInstrumentExperienced()
  }

  function setBrahmalokMargin(index: number | null) {
    if (!configureBrahmalokMargin(index)) return
    save()
    markInstrumentExperienced()
  }

  function reviewBrahmalokCommission() {
    if (!reviewBankedBrahmalokCommission()) return
    save()
    markInstrumentExperienced()
  }

  function configureStorm(length: number, burdenIndex: number) {
    if (configureVishnulokPath(length, burdenIndex)) save()
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
    if (!editKailashSlot(index)) return
    save()
    markInstrumentExperienced()
  }

  function toggleLongRest() {
    const changed = kailashRest?.resting ? endKailashLongRest() : beginKailashLongRest()
    if (!changed) return
    save()
    markInstrumentExperienced()
  }

  function reviewKailashFront() {
    if (!reviewBankedKailashFront()) return
    save()
    markInstrumentExperienced()
  }

  function roleGlyph(role: (typeof KAILASH_ACTS)[number]): string {
    return role === 'rest' ? '○' : role === 'emergence' ? '△' : role === 'shelter' ? '⌂' : role === 'release' ? '▽' : role === 'veil' ? '⌁' : '◇'
  }

  function primerStorageKey(universeId: string): string {
    return `ember:instrument-primer:v1:${universeId}`
  }

  function instrumentExperienceKey(universeId: string): string {
    return `ember:instrument-experience:v1:${universeId}`
  }

  function instrumentLayoutKey(universeId: string): string {
    return `ember:instrument-layout:v1:${universeId}`
  }

  function restoreInstrument(universeId: string) {
    if (universeId !== 'brahmalok' && universeId !== 'vishnulok' && universeId !== 'kailash') return
    try {
      const primerSeen = localStorage.getItem(primerStorageKey(universeId)) === 'seen'
      const experienced = localStorage.getItem(instrumentExperienceKey(universeId)) === 'complete' || primerSeen
      const storedLayout = localStorage.getItem(instrumentLayoutKey(universeId))
      const preference = storedLayout === 'expanded' || storedLayout === 'compact' ? storedLayout : 'auto'
      const returnInProgress = universeId === 'vishnulok'
        && vishnulokCircuitStatus(game.numericLawState).returnRemainingSec > 0
      const shouldOpenPrimer = !primerSeen && !returnInProgress
      instrumentExperienced = experienced || returnInProgress
      instrumentPreference = preference
      instrumentExpanded = preference === 'expanded'
        || (preference !== 'compact' && (shouldOpenPrimer || (!experienced && !returnInProgress)))
      primerOpen = shouldOpenPrimer
    } catch {
      instrumentExperienced = false
      instrumentPreference = 'auto'
      instrumentExpanded = true
      primerOpen = true
    }
  }

  function markInstrumentExperienced() {
    if (game.activeUniverse !== 'brahmalok' && game.activeUniverse !== 'vishnulok' && game.activeUniverse !== 'kailash') return
    instrumentExperienced = true
    try {
      localStorage.setItem(instrumentExperienceKey(game.activeUniverse), 'complete')
      if (instrumentPreference === 'auto') {
        instrumentPreference = 'compact'
        localStorage.setItem(instrumentLayoutKey(game.activeUniverse), 'compact')
      }
    } catch {
      if (instrumentPreference === 'auto') instrumentPreference = 'compact'
    }
    if (!primerOpen && instrumentPreference === 'compact') instrumentExpanded = false
  }

  function dismissPrimer() {
    try {
      localStorage.setItem(primerStorageKey(game.activeUniverse), 'seen')
    } catch {
      // The primer still dismisses for this session when storage is unavailable.
    }
    primerOpen = false
    if (instrumentExperienced && instrumentPreference === 'compact') instrumentExpanded = false
  }

  function togglePrimer() {
    primerOpen = !primerOpen
    if (primerOpen) instrumentExpanded = true
    else if (instrumentExperienced && instrumentPreference === 'compact') instrumentExpanded = false
  }

  function toggleInstrument() {
    instrumentExpanded = !instrumentExpanded
    instrumentPreference = instrumentExpanded ? 'expanded' : 'compact'
    if (!instrumentExpanded) primerOpen = false
    try {
      localStorage.setItem(instrumentLayoutKey(game.activeUniverse), instrumentPreference)
    } catch {
      // Layout preference still applies for this session when storage is unavailable.
    }
  }

  onMount(() => {
    primerMounted = true
    restoreInstrument(game.activeUniverse)
    const timer = setInterval(() => (now = Date.now()), 150)
    return () => clearInterval(timer)
  })

  $effect(() => {
    const universeId = game.activeUniverse
    if (primerMounted) restoreInstrument(universeId)
  })

</script>

{#snippet integratedHeader(eyebrow: string, title: string, state: string, multiplierLabel: string, multiplier: number)}
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
    <div class="instrument-reading"><small>{state}</small><b>×{multiplier.toFixed(2)}</b><em>{multiplierLabel}</em></div>
    <button type="button" class="instrument-toggle" aria-label={instrumentExpanded ? 'Collapse universe instrument' : 'Open universe instrument'} aria-expanded={instrumentExpanded} onclick={toggleInstrument}>{instrumentExpanded ? '⌃' : '⌄'}</button>
    <button type="button" class="primer-toggle" aria-label="Explain this universe instrument" aria-expanded={primerOpen} onclick={togglePrimer}>?</button>
  </div>
{/snippet}

{#snippet settledHeader(summary: string, meterLabel: string, meterValue: number)}
  <div class="settled-heading">
    <div class="run-score">
      <strong><i>{pack.currencyGlyph}</i>{format(game.light)}</strong>
      <div>{#if !isZeroAmount(rate)}<span>{format(rate)} {pack.currency.toLowerCase()}/s</span>{/if}</div>
    </div>
    <p>{summary}</p>
    <div class="settled-meter" aria-label={meterLabel}>
      <i style={`width:${Math.max(0, Math.min(100, meterValue))}%`}></i>
      <span>{meterLabel}</span>
    </div>
    <button type="button" class="configure-toggle" aria-label="Configure universe instrument" aria-expanded="false" onclick={toggleInstrument}>configure</button>
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
{:else if brahmalok}
  <section class="law-panel brahmalok-mandala" class:instrument-compact={!instrumentExpanded} aria-label="Brahmalok creation mandala">
    {#if !instrumentExpanded}
      {@render settledHeader(`${brahmalok.mode.name} · ${brahmalok.activeDirections}/4 directions · ${Math.round(brahmalok.balance * 100)}% balance · ×${realmLawMultiplier.toFixed(2)}`, brahmalokCommission?.phase === 'active' ? `${brahmalokCommission.commission.direction} Commission · ${brahmalokCommission.answered ? 'answer holding' : 'revision requested'}` : brahmalokMargin !== null ? `${BRAHMALOK_MODES[brahmalokMargin].name} in the margin` : `${Math.round(brahmalok.balance * 100)}% balance`, brahmalok.balance * 100)}
    {:else}
      {@render integratedHeader('LOTUS OF BECOMING', 'Four Directions', `${brahmalok.activeDirections}/4 DIRECTIONS · ${Math.round(brahmalok.balance * 100)}% BALANCE`, 'CONTINUOUS CREATION', realmLawMultiplier)}
      {@render primerStrip()}

      <div class="creation-stage" aria-label={`${brahmalok.activeDirections} of 4 creation directions active; ${brahmalok.explanation}`}>
      <div class="lotus-center" aria-hidden="true"><span>{brahmalok.mode.glyph}</span><i></i></div>
      <div class="creation-directions">
        {#each BRAHMALOK_DIRECTIONS as direction, index (direction.id)}
          {@const quantity = brahmalok.directions[index]}
          <article class:active={quantity > 0} data-direction={direction.id} style={`--direction-index:${index}`}>
            <span>{direction.glyph}</span><strong>{direction.name}</strong><b>{quantity}</b>
          </article>
        {/each}
      </div>
      </div>

      <div class="mandala-reading"><span>OPEN CENTER</span><b>{brahmalok.mode.name}</b><small>{Math.round(brahmalok.balance * 100)}% balance</small></div>

      <p class="law-explanation">{brahmalok.explanation}</p>

      <div class="mandala-controls">
      <div class="creation-modes" role="group" aria-label="free creation mode selection">
        {#each BRAHMALOK_MODES as mode, index}
          <button type="button" aria-pressed={brahmalok.modeIndex === index} onclick={() => configure(index)} title={mode.description}>
            <span>{mode.glyph}</span><b>{mode.name}</b><small>{mode.description}</small>
          </button>
        {/each}
      </div>
      {#if game.curiosities.length >= 12}
        <div class="margin-modes" role="group" aria-label="secondary margin mode at forty percent strength">
          <button type="button" aria-pressed={brahmalokMargin === null} onclick={() => setBrahmalokMargin(null)}>Open margin</button>
          {#each BRAHMALOK_MODES as mode, index}
            <button type="button" disabled={brahmalok.modeIndex === index} aria-pressed={brahmalokMargin === index} onclick={() => setBrahmalokMargin(index)} title={`${mode.name} at 40% strength`}>{mode.glyph} {mode.name}</button>
          {/each}
        </div>
      {/if}
      <div class="creation-router">
        <label>
          <span>KINDLING TO UNFOLD</span>
          <select bind:value={selectedBrahmalokKindling} aria-label="Brahmalok Kindling to route">
            {#each brahmalokKindlings as kindling, index (kindling.id)}
              <option value={index}>{kindling.name}</option>
            {/each}
          </select>
        </label>
        <div class="direction-routes" role="group" aria-label={`Route ${brahmalokKindlings[selectedBrahmalokKindling].name} through a creation direction`}>
          {#each BRAHMALOK_DIRECTIONS as direction, index (direction.id)}
            <button type="button" data-direction={direction.id} aria-pressed={brahmalok.routes[selectedBrahmalokKindling] === index} onclick={() => routeBrahmalok(index)} title={direction.name}>
              <span>{direction.glyph}</span>{direction.name}
            </button>
          {/each}
        </div>
      </div>
      </div>
      {#if brahmalokCommission}
        <section class="law-prompt brahmalok-commission" data-phase={brahmalokCommission.phase} aria-live="polite" aria-atomic="true">
          <span aria-hidden="true">{brahmalokCommission.commission.glyph}</span>
          <div><small>{brahmalokCommission.phase === 'active' ? brahmalokCommission.answered ? 'ANSWER HELD IN REVISION' : `${brahmalokCommission.commission.direction.toUpperCase()} COMMISSION` : 'QUIET MARGINS'}</small><strong>{brahmalokCommission.commission.question}</strong><p>{brahmalokCommission.explanation}</p></div>
          <div class="prompt-meta">
            <b>{brahmalokCommission.phase === 'active' && brahmalokCommission.answered ? `${Math.floor(brahmalokCommission.heldSeconds)}/${60}s` : `${Math.ceil(brahmalokCommission.secondsRemaining)}s`}</b>
            <small>{brahmalokCommission.bankedCount}/{3} saved</small>
            {#if brahmalokCommission.phase === 'waiting' && brahmalokCommission.bankedCount > 0}
              <button type="button" onclick={reviewBrahmalokCommission}>Review saved</button>
            {/if}
          </div>
        </section>
      {/if}
    {/if}
  </section>
{:else if vishnulok}
  <section class="law-panel vishnulok-circuit" class:instrument-compact={!instrumentExpanded} aria-label="Vishnulok Endless Circuit">
    {#if !instrumentExpanded}
      {@render settledHeader(`${vishnulok.circuit.name} · ${vishnulok.length} shelters · ×${realmLawMultiplier.toFixed(2)} · ${vishnulok.confluenceActive ? 'CONFLUENCE' : vishnulok.returnRemainingSec > 0 || vishnulok.secondReturnRemainingSec > 0 ? `returns in ${Math.ceil(Math.max(vishnulok.returnRemainingSec, vishnulok.secondReturnRemainingSec))}s` : vishnulok.ready ? 'return ready' : `ready in ${Math.ceil(vishnulok.threshold - vishnulok.continuity)}%`}`, vishnulokStrain?.phase === 'present' ? `${vishnulokStrain.strain.name} · ${vishnulokStrain.answered ? 'matching route' : 'waiting'}` : `${Math.round(vishnulok.continuity)}% of ${vishnulok.threshold}% threshold`, vishnulok.threshold > 0 ? (vishnulok.continuity / vishnulok.threshold) * 100 : 0)}
    {:else}
      {@render integratedHeader('THE ENDLESS CIRCUIT', vishnulok.circuit.name, `${vishnulok.returnRemainingSec > 0 || vishnulok.secondReturnRemainingSec > 0 ? 'RETURNING' : vishnulok.ready ? 'CORRECTION READY' : 'GATHERING'} · ${Math.round(vishnulok.continuity)}% CONTINUITY`, vishnulok.returnRemainingSec > 0 || vishnulok.secondReturnRemainingSec > 0 ? 'TEMPORARY RETURN' : 'GATHERING BASELINE', realmLawMultiplier)}
      {@render primerStrip()}

      <div class="ocean-layout">
      <div class="continuity-column" aria-label={`${Math.round(vishnulok.continuity)} percent continuity reserve`}>
        <span>FULL</span>
        <div><i style={`height:${vishnulok.continuity}%`}></i><b>{Math.round(vishnulok.continuity)}%</b></div>
        <span>OPEN</span>
      </div>

      <div class="circuit-map" data-burden={vishnulok.burden.id} aria-label={`${vishnulok.circuit.name}, ${vishnulok.length} shelters, ${vishnulok.burden.name} burden`}>
        <div class="circuit-microgrid">
          <span>{vishnulok.threshold}% threshold</span>
          <span>OPEN REFUGE</span>
          <span>{vishnulok.burden.name} burden</span>
        </div>
        <div class="circuit-art" aria-hidden="true">
          <div class="ocean-horizon"></div>
          <div class="refuge-center"><b>{vishnulok.burden.glyph}</b></div>
          <div class="current-network">
            {#each Array(8) as _, index}
              <i class:lit={index < vishnulok.length} style={`--current-index:${index}`}></i>
            {/each}
          </div>
        </div>
      </div>

      <div class="return-stack">
        <small>TEMPORARY RETURN</small>
        <strong>×{vishnulok.boost.toFixed(2)}</strong>
        <span>{vishnulok.length} shelters · {vishnulok.durationSec}s</span>
        <button type="button" disabled={!vishnulok.ready || vishnulok.returnRemainingSec > 0} onclick={discharge}>
          <b>{vishnulok.returnRemainingSec > 0 ? `${Math.ceil(vishnulok.returnRemainingSec)}s` : '↶ COMPLETE RETURN'}</b>
          <small>{vishnulok.returnRemainingSec > 0 ? 'continuity rests during return' : vishnulok.ready ? 'close without enclosing' : `${Math.ceil(vishnulok.threshold - vishnulok.continuity)}% continuity needed`}</small>
        </button>
        {#if game.upgrades.includes('vishnulok-auroral-return')}
          <button type="button" class="second-return" disabled={!vishnulok.secondReady || vishnulok.secondReturnRemainingSec > 0} onclick={dischargeSecond}>
            <b>{vishnulok.secondReturnRemainingSec > 0 ? `${Math.ceil(vishnulok.secondReturnRemainingSec)}s` : '↶ SECOND RETURN'}</b>
            <small>{vishnulok.secondReturnRemainingSec > 0 ? 'second current returning' : vishnulok.secondReady ? 'stagger for confluence' : `${Math.ceil(vishnulok.threshold - vishnulok.secondContinuity)}% second continuity needed`}</small>
          </button>
        {/if}
      </div>
      </div>

      <p class="law-explanation">{vishnulok.explanation}</p>

      <div class="circuit-controls">
      <div class="circuit-cards" role="group" aria-label="correction circuit selection">
        {#each VISHNULOK_CIRCUITS as path, index}
          <button type="button" aria-pressed={vishnulok.circuitIndex === index} onclick={() => configure(index)} title={path.description}>
            <span>{path.glyph}</span><b>{path.name}</b><small>{path.threshold}% base</small>
          </button>
        {/each}
      </div>
      <div class="circuit-route">
        <div class="reach-scale">
          <span>CIRCUIT REACH</span>
          <div role="group" aria-label="correction circuit reach">
            {#each Array(8) as _, index}
              <button type="button" aria-pressed={vishnulok.length === index + 1} onclick={() => configureStorm(index + 1, vishnulok.burdenIndex)}>{index + 1}</button>
            {/each}
          </div>
        </div>
        <div class="burden-scale">
          <span>BURDEN CARRIED</span>
          <div role="group" aria-label="correction circuit burden">
            {#each VISHNULOK_BURDENS as risk, index (risk.id)}
              <button type="button" aria-pressed={vishnulok.burdenIndex === index} onclick={() => configureStorm(vishnulok.length, index)} title={risk.description}>
                {risk.glyph} {risk.name}
              </button>
            {/each}
          </div>
        </div>
      </div>
      </div>
      {#if vishnulokStrain}
        <section class="law-prompt vishnulok-strain" data-phase={vishnulokStrain.phase} aria-live="polite" aria-atomic="true">
          <span aria-hidden="true">{vishnulokStrain.strain.glyph}</span>
          <div><small>{vishnulokStrain.phase === 'present' ? vishnulokStrain.answered ? 'MATCHING CORRECTION READY' : 'OCEAN STRAIN' : 'LIVING WATER'}</small><strong>{vishnulokStrain.strain.name}</strong><p>{vishnulokStrain.explanation}</p></div>
          <div class="prompt-meta">
            <b>{vishnulokStrain.phase === 'present' ? `${vishnulokStrain.genericReturns}/2` : `${Math.ceil(vishnulokStrain.secondsUntilPresent)}s`}</b>
            <small>{vishnulokStrain.bankedCount}/{3} saved</small>
          </div>
        </section>
      {/if}
    {/if}
  </section>
{:else if kailash}
  <section class="law-panel kailash-stillpoint" class:instrument-compact={!instrumentExpanded} aria-label="Kailash Still Point cycle">
    {#if !instrumentExpanded}
      {@render settledHeader(`${kailash.cycle.name} · position ${kailash.slotIndex + 1}/16 · ${kailash.role} · ×${realmLawMultiplier.toFixed(2)}`, kailashRest?.resting ? `LONG REST · ${Math.round((kailashRest?.reserveFraction ?? 0) * 100)}% reserve` : kailashFront && kailashFront.phase !== 'calm' ? `${kailashFront.front.name} · ${kailashFront.phase}` : `${kailash.distinctRoles} acts · ${kailash.restCount} rests`, (kailash.distinctRoles / 6) * 100)}
    {:else}
      {@render integratedHeader('THE STILL POINT', kailash.cycle.name, `POSITION ${kailash.slotIndex + 1}/16 · ${kailash.role.toUpperCase()}`, 'CONTINUOUS CYCLE', realmLawMultiplier)}
      {@render primerStrip()}

      <div class="kailash-layout">
      <div class="mountain-cycle" aria-label={kailash.explanation}>
        <div class="summit-moon" aria-hidden="true"></div>
        <div class="summit-ridge ridge-back" aria-hidden="true"></div>
        <div class="summit-ridge ridge-front" aria-hidden="true"></div>
        <div class="river-thread" aria-hidden="true"></div>
        <div class="late-ring" class:complete={kailash.distinctRoles === 6 && kailash.restCount >= 3} aria-hidden="true"></div>
        <div class="still-center">
          <span>{kailash.cycle.glyph}</span>
          <strong>{roleGlyph(kailash.role)}</strong>
          <small>{Math.ceil(kailash.nextSlotInMs)}ms</small>
        </div>
      </div>

      <div class="cycle-console">
        <p class="law-explanation">{kailash.explanation}</p>
        <div class="cycle-sequence" role="group" aria-label="editable five-act release sequence">
          {#each kailash.slots as role, index}
            <button type="button" class:active={kailash.slotIndex === index} data-role={role} onclick={() => editSlot(index)} title={`Edit position ${index + 1}: ${role}`} aria-label={`Position ${index + 1}, ${role}; activate to choose next act`}>
              <span>{roleGlyph(role)}</span><small>{index + 1}</small>
            </button>
          {/each}
        </div>
        <div class="cycle-presets" role="group" aria-label="mountain cycle preset selection">
          {#each KAILASH_CYCLES as measure, index}
            <button type="button" aria-pressed={kailash.cycleIndex === index} onclick={() => configure(index)} title={measure.description}>
              <span>{measure.glyph}</span><div><b>{measure.name}</b><small>{measure.description}</small></div>
            </button>
          {/each}
        </div>
        <div class="act-legend" aria-label={`${kailash.restCount} rests and ${kailash.distinctRoles} distinct acts`}>
          {#each KAILASH_ACTS as role}
            <span data-role={role}><i>{roleGlyph(role)}</i>{role}</span>
          {/each}
        </div>
      </div>
      </div>
      {#if kailashFront}
        <section class="law-prompt kailash-front" data-phase={kailashFront.phase} aria-live="polite" aria-atomic="true">
          <span aria-hidden="true">{kailashFront.front.glyph}</span>
          <div><small>{kailashFront.phase === 'calm' ? 'RIDGE WEATHER' : kailashFront.phase === 'approaching' ? 'FRONT APPROACHING' : kailashFront.answered ? 'FRONT ANSWERED' : 'FRONT ON THE RIDGE'}</small><strong>{kailashFront.front.name}</strong><p>{kailashFront.explanation}</p></div>
          <div class="prompt-meta">
            <b>{kailashFront.phaseSecondsRemaining > 0 ? `${Math.ceil(kailashFront.phaseSecondsRemaining)}s` : '—'}</b>
            <small>{kailashFront.bankedCount}/{3} saved</small>
            {#if kailashFront.phase === 'calm' && kailashFront.bankedCount > 0 && !kailashRest?.resting}
              <button type="button" onclick={reviewKailashFront}>Recall front</button>
            {/if}
          </div>
        </section>
      {/if}
      {#if kailashRest && kailashLongRestUnlocked()}
        <div class="long-rest-control" aria-live="polite">
          <div><small>THE LONG REST</small><strong>{kailashRest.resting ? `${Math.round(kailashRest.reserveFraction * 100)}% grace reserve` : kailashRest.bonusSecondsRemaining > 0 ? `${Math.ceil(kailashRest.bonusSecondsRemaining)}s grace carried` : 'The lowest lamp is ready'}</strong><p>{kailashRest.explanation}</p></div>
          <button type="button" onclick={toggleLongRest}>{kailashRest.resting ? 'Leave the Long Rest' : 'Enter the Long Rest'}</button>
        </div>
      {/if}
    {/if}
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
  .law-prompt,.long-rest-control { display:grid;grid-template-columns:auto minmax(0,1fr) auto;align-items:center;gap:.55rem;margin-top:.42rem;padding:.42rem .55rem;border:1px solid color-mix(in srgb,var(--gold) 20%,transparent);background:color-mix(in srgb,var(--bg) 74%,transparent); }
  .law-prompt > span { width:1.6rem;height:1.6rem;display:grid;place-items:center;border:1px solid currentColor;border-radius:50%;font-size:.85rem; }
  .law-prompt small,.long-rest-control small { display:block;color:var(--dim);font:750 .38rem/1 system-ui,sans-serif;letter-spacing:.14em; }
  .law-prompt strong,.long-rest-control strong { display:block;margin-top:.12rem;font:650 .62rem/1.1 Georgia,serif; }
  .law-prompt p,.long-rest-control p { margin:.14rem 0 0;color:var(--dim);font:.47rem/1.25 Georgia,serif; }
  .prompt-meta { display:grid;justify-items:end;gap:.2rem;min-width:4.2rem;text-align:right; }
  .prompt-meta > b { font:.58rem/1 system-ui,sans-serif;font-variant-numeric:tabular-nums; }
  .prompt-meta > small { letter-spacing:.04em;white-space:nowrap; }
  .prompt-meta > button { padding:.25rem .34rem;color:var(--gold);background:color-mix(in srgb,var(--gold) 7%,transparent);border:1px solid color-mix(in srgb,var(--gold) 28%,transparent);border-radius:.25rem;font-size:.4rem;white-space:nowrap; }
  .law-prompt[data-phase='active'] { border-style:dashed; }
  .long-rest-control { grid-template-columns:minmax(0,1fr) auto;border-color:color-mix(in srgb,#9bcbd7 28%,transparent); }
  .long-rest-control button { padding:.42rem .58rem;color:var(--gold);background:#14222c;border:1px solid #6e929d;border-radius:.3rem;font-size:.48rem; }
  .margin-modes { grid-column:1 / -1;display:flex;flex-wrap:wrap;gap:.2rem;margin-top:.25rem;padding-top:.25rem;border-top:1px dashed color-mix(in srgb,var(--gold) 18%,transparent); }
  .margin-modes button { padding:.24rem .34rem;color:var(--dim);background:transparent;border:1px solid color-mix(in srgb,var(--gold) 16%,transparent);border-radius:.2rem;font-size:.4rem; }
  .margin-modes button[aria-pressed='true'] { color:var(--gold);border-color:color-mix(in srgb,var(--gold) 52%,transparent);background:color-mix(in srgb,var(--gold) 8%,transparent); }
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
  .integrated-heading { display: grid; grid-template-columns: minmax(6.5rem, 1.08fr) minmax(4.8rem, 0.72fr) minmax(6rem, 0.9fr) auto 1.5rem 1.5rem; align-items: center; gap: 0.4rem; min-height: 2.5rem; padding-bottom: 0.38rem; border-bottom: 1px solid color-mix(in srgb, var(--gold) 11%, transparent); }
  .run-score { min-width: 0; display: flex; align-items: center; gap: 0.55rem; }
  .run-score > strong { color: color-mix(in srgb, var(--gold) 80%, white); font: 680 1.42rem/1 ui-sans-serif, system-ui; font-variant-numeric: tabular-nums; text-shadow: 0 0 1.1rem color-mix(in srgb, var(--amber) 22%, transparent); white-space: nowrap; }
  .run-score > strong i { margin-right: 0.3rem; color: var(--amber); font-size: 0.86rem; font-style: normal; vertical-align: 0.12rem; }
  .run-score > div { min-width: 0; display: grid; gap: 0.16rem; color: var(--dim); font: 560 0.48rem/1.1 system-ui, sans-serif; white-space: nowrap; }
  .run-score em { color: color-mix(in srgb, var(--gold) 58%, var(--dim)); font-style: normal; }
  .effect-slot { min-width: 0; display: grid; gap: 0.14rem; padding-left: 0.55rem; border-left: 1px solid color-mix(in srgb, var(--gold) 12%, transparent); }
  .effect-slot > span { color: var(--dim); font: 720 0.36rem/1 system-ui, sans-serif; letter-spacing: 0.12em; }
  .instrument-title { min-width: 0; padding-left: 0.48rem; border-left: 1px solid color-mix(in srgb, var(--gold) 12%, transparent); }
  .instrument-title span { display: block; color: var(--dim); font: 750 0.43rem/1 system-ui, sans-serif; letter-spacing: 0.17em; }
  .instrument-title strong { display: block; margin-top: 0.16rem; overflow: hidden; color: color-mix(in srgb, var(--gold) 74%, white); font: 560 0.72rem/1.1 Georgia, serif; text-overflow: ellipsis; white-space: nowrap; }
  .instrument-reading { display: grid; grid-template-columns: auto auto; align-items: center; gap: 0.08rem 0.38rem; text-align: right; }
  .instrument-reading small { color: var(--dim); font: 700 0.42rem/1 system-ui, sans-serif; letter-spacing: 0.08em; }
  .instrument-reading b { grid-row: 1 / 3; grid-column: 2; color: white; font: 760 0.82rem/1 ui-monospace, monospace; }
  .instrument-reading em { color: var(--amber); font: 560 0.43rem/1 system-ui, sans-serif; font-style: normal; text-transform: uppercase; }
  .primer-toggle, .instrument-toggle { width: 1.4rem; height: 1.4rem; display: grid; place-items: center; padding: 0; color: var(--dim); background: transparent; border: 1px solid color-mix(in srgb, var(--gold) 18%, transparent); border-radius: 50%; font: 730 0.56rem/1 system-ui, sans-serif; }
  .primer-toggle:hover, .primer-toggle[aria-expanded='true'], .instrument-toggle:hover { color: white; border-color: var(--amber); background: color-mix(in srgb, var(--amber) 9%, transparent); }
  .instrument-compact { width: min(38rem, calc(100vw - 29rem)); padding: 0.28rem 0.55rem; border-radius: 999px; background: color-mix(in srgb, var(--panel) 78%, transparent); box-shadow: 0 0.45rem 1.8rem color-mix(in srgb, var(--bg) 68%, transparent); }
  .instrument-compact .integrated-heading { min-height: 2.05rem; padding-bottom: 0; border-bottom: 0; }
  .settled-heading { min-width: 0; display: grid; grid-template-columns: minmax(8rem, auto) minmax(12rem, 1fr) minmax(8rem, 0.7fr) auto; align-items: center; gap: 0.65rem; }
  .settled-heading > p { min-width: 0; margin: 0; color: color-mix(in srgb, var(--gold) 72%, white); font: 650 0.72rem/1.25 system-ui, sans-serif; }
  .settled-meter { position: relative; min-width: 0; height: 1.2rem; overflow: hidden; background: color-mix(in srgb, var(--bg) 64%, transparent); border: 1px solid color-mix(in srgb, var(--gold) 18%, transparent); border-radius: 999px; }
  .settled-meter i { position: absolute; inset: 0 auto 0 0; background: linear-gradient(90deg, color-mix(in srgb, var(--amber) 38%, transparent), color-mix(in srgb, var(--gold) 48%, transparent)); }
  .settled-meter span { position: relative; z-index: 1; display: grid; place-items: center; height: 100%; padding: 0 0.35rem; color: white; font: 700 0.58rem/1 system-ui, sans-serif; white-space: nowrap; }
  .configure-toggle { min-height: 1.7rem; padding: 0.25rem 0.5rem; color: var(--gold); background: color-mix(in srgb, var(--bg) 62%, transparent); border: 1px solid color-mix(in srgb, var(--gold) 24%, transparent); border-radius: 0.45rem; font: 720 0.58rem/1 system-ui, sans-serif; text-transform: uppercase; letter-spacing: 0.05em; }
  .instrument-primer { display: grid; grid-template-columns: 5.5rem minmax(0,1fr) 6.4rem auto; align-items: center; gap: 0.42rem; margin: 0.28rem 0 0.12rem; padding: 0.38rem 0.48rem; color: var(--gold); background: linear-gradient(90deg, color-mix(in srgb,var(--amber) 8%,transparent), transparent 58%); border: 1px solid color-mix(in srgb,var(--amber) 20%,transparent); border-radius: 0.45rem; }
  .instrument-primer > div span { display: block; color: var(--amber); font: 740 0.38rem/1 system-ui,sans-serif; letter-spacing: 0.13em; }
  .instrument-primer > div strong { display: block; margin-top: 0.14rem; font: 600 0.57rem/1.1 Georgia,serif; }
  .instrument-primer ol { display: grid; grid-template-columns: repeat(3,1fr); gap: 0.35rem; margin: 0; padding: 0; list-style: none; }
  .instrument-primer li { display: flex; align-items: center; gap: 0.24rem; color: color-mix(in srgb,var(--gold) 70%,var(--dim)); font: 570 0.4rem/1.22 system-ui,sans-serif; }
  .instrument-primer li i { flex: 0 0 auto; display: grid; place-items: center; width: 0.9rem; height: 0.9rem; color: var(--amber); border: 1px solid color-mix(in srgb,var(--amber) 30%,transparent); border-radius: 50%; font-style: normal; }
  .instrument-primer p { color: var(--dim); font: italic 0.4rem/1.25 Georgia,serif; text-align: left; }
  .instrument-primer > button { padding: 0.28rem 0.4rem; color: var(--gold); background: color-mix(in srgb,var(--amber) 10%,transparent); border: 1px solid color-mix(in srgb,var(--amber) 28%,transparent); border-radius: 0.35rem; font: 650 0.43rem/1 system-ui,sans-serif; white-space: nowrap; }

  /* Brahmalok — a four-direction writing court around an intentionally open center. */
  .brahmalok-mandala {
    width: min(45rem, calc(100vw - 29rem));
    margin: 0.32rem auto 0;
    padding: 0.42rem 0.62rem 0.5rem;
    border-radius: 1.1rem 1.1rem 0.3rem 0.3rem;
    background:
      radial-gradient(circle at 50% 42%, color-mix(in srgb, var(--amber) 10%, transparent), transparent 28%),
      linear-gradient(120deg, color-mix(in srgb, #5f7e9d 7%, transparent), transparent 36%),
      color-mix(in srgb, var(--panel) 93%, #08060c);
  }
  .creation-stage { position: relative; height: 5rem; margin: 0.25rem 0 0.18rem; overflow: hidden; border-top: 1px solid color-mix(in srgb, var(--gold) 8%, transparent); border-bottom: 1px solid color-mix(in srgb, var(--gold) 10%, transparent); background: radial-gradient(circle at 50% 50%, color-mix(in srgb, var(--amber) 10%, transparent), transparent 33%); }
  .creation-stage::before,
  .creation-stage::after { content: ''; position: absolute; left: 50%; top: 50%; width: 68%; height: 1px; background: linear-gradient(90deg, transparent, color-mix(in srgb, var(--gold) 18%, transparent), transparent); }
  .creation-stage::before { transform: translate(-50%, -50%); }
  .creation-stage::after { transform: translate(-50%, -50%) rotate(90deg); }
  .lotus-center { position: absolute; left: 50%; top: 50%; z-index: 2; width: 3rem; aspect-ratio: 1; display: grid; place-items: center; transform: translate(-50%, -50%) rotate(45deg); color: var(--gold); border: 1px solid color-mix(in srgb, var(--amber) 52%, transparent); background: color-mix(in srgb, var(--bg) 82%, transparent); box-shadow: 0 0 1.4rem color-mix(in srgb, var(--amber) 17%, transparent); }
  .lotus-center::before,
  .lotus-center::after { content: ''; position: absolute; width: 1.2rem; height: 2.3rem; border: 1px solid color-mix(in srgb, var(--gold) 34%, transparent); border-radius: 70% 20% 70% 20%; }
  .lotus-center::before { transform: rotate(45deg); }
  .lotus-center::after { transform: rotate(135deg); }
  .lotus-center span { z-index: 2; transform: rotate(-45deg); font-size: 0.8rem; }
  .lotus-center i { position: absolute; inset: 31%; z-index: 1; border: 1px dashed color-mix(in srgb, #8ecbe0 52%, transparent); background: var(--bg); }
  .creation-directions { position: absolute; inset: 0; }
  .creation-directions article { --direction-angle: calc(var(--direction-index) * 90deg - 90deg); position: absolute; left: calc(50% - 2.5rem); top: calc(50% - 0.75rem); width: 5rem; display: grid; grid-template-columns: auto 1fr auto; align-items: center; gap: 0.22rem; padding: 0.25rem 0.32rem; transform: rotate(var(--direction-angle)) translateY(-2rem) rotate(calc(-1 * var(--direction-angle))); color: var(--dim); border: 1px solid color-mix(in srgb, var(--gold) 10%, transparent); background: color-mix(in srgb, var(--bg) 74%, transparent); }
  .creation-directions article.active { color: var(--gold); border-color: color-mix(in srgb, var(--amber) 40%, transparent); box-shadow: inset 2px 0 color-mix(in srgb, var(--amber) 70%, transparent); }
  .creation-directions span { color: var(--amber); font-size: 0.68rem; }
  .creation-directions strong { font-size: 0.48rem; letter-spacing: 0.06em; text-transform: uppercase; }
  .creation-directions b { font: 700 0.5rem/1 ui-monospace, monospace; }
  .mandala-reading { display: grid; grid-template-columns: auto 1fr auto; align-items: baseline; gap: 0.45rem; margin-top: 0.24rem; padding: 0.28rem 0.4rem; text-align: left; background: color-mix(in srgb, var(--bg) 78%, transparent); border-left: 2px solid color-mix(in srgb, var(--amber) 62%, transparent); }
  .mandala-reading span { color: var(--dim); font: 730 0.38rem/1 system-ui, sans-serif; letter-spacing: 0.1em; }
  .mandala-reading b { color: var(--gold); font-size: 0.52rem; }
  .mandala-reading small { color: var(--dim); font-size: 0.42rem; }
  .mandala-controls { display: grid; grid-template-columns: 1fr 1.08fr; gap: 0.45rem; margin-top: 0.3rem; }
  .creation-modes { display: grid; grid-template-columns: 1fr 1fr; gap: 0.24rem; }
  .creation-modes button { min-width: 0; display: grid; grid-template-columns: auto 1fr; gap: 0.06rem 0.26rem; padding: 0.23rem 0.34rem; color: var(--dim); text-align: left; background: color-mix(in srgb, var(--bg) 62%, transparent); border: 1px solid color-mix(in srgb, var(--gold) 12%, transparent); border-radius: 0.7rem 0.2rem 0.7rem 0.2rem; }
  .creation-modes button > span { grid-row: 1 / 3; align-self: center; color: var(--amber); font-size: 0.88rem; }
  .creation-modes b { color: color-mix(in srgb, var(--gold) 66%, white); font-size: 0.54rem; }
  .creation-modes small { overflow: hidden; font-size: 0.42rem; line-height: 1.15; text-overflow: ellipsis; white-space: nowrap; }
  .creation-modes button[aria-pressed='true'] { border-color: var(--gold); box-shadow: inset 2px 0 var(--amber), inset 0 0 1rem color-mix(in srgb, var(--amber) 10%, transparent); }
  .creation-router { min-width: 0; display: grid; gap: 0.28rem; align-content: center; padding-left: 0.55rem; border-left: 1px solid color-mix(in srgb, var(--gold) 12%, transparent); }
  .creation-router label { display: flex; align-items: center; gap: 0.4rem; }
  .creation-router label > span { color: var(--dim); font: 720 0.43rem/1 system-ui, sans-serif; letter-spacing: 0.09em; }
  .creation-router select { min-width: 0; flex: 1; padding: 0.28rem 0.35rem; color: var(--gold); background: var(--bg); border: 1px solid color-mix(in srgb, var(--gold) 20%, transparent); }
  .direction-routes { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.22rem; }
  .direction-routes button { min-width: 0; padding: 0.26rem 0.18rem; color: var(--dim); background: color-mix(in srgb, var(--bg) 62%, transparent); border: 1px solid color-mix(in srgb, var(--gold) 16%, transparent); font: 650 0.44rem/1 system-ui, sans-serif; }
  .direction-routes button span { margin-right: 0.18rem; color: var(--amber); }
  .direction-routes button[aria-pressed='true'] { color: white; border-color: var(--gold); box-shadow: inset 0 -2px color-mix(in srgb, var(--amber) 72%, transparent); }

  /* Vishnulok — a responsive ocean circuit, with refuge at its open center. */
  .vishnulok-circuit { width:min(45rem,calc(100vw - 29rem));margin:.12rem auto 0;padding:.42rem .62rem .5rem;border-radius:1.1rem;background:radial-gradient(ellipse at 50% 80%,color-mix(in srgb,#49739c 12%,transparent),transparent 48%),linear-gradient(180deg,color-mix(in srgb,var(--panel) 88%,#08102a),color-mix(in srgb,var(--panel) 95%,#030711)); }
  .ocean-layout { display: grid; grid-template-columns: 2.2rem minmax(14rem, 1fr) 7.4rem; align-items: stretch; gap: .4rem; min-height: 4.6rem; margin-top: .28rem; }
  .continuity-column { display: grid; grid-template-rows: auto 1fr auto; place-items: center; color: var(--dim); font: 720 .34rem/1 system-ui,sans-serif; letter-spacing: .08em; }
  .continuity-column > div { position: relative; width: 1.15rem; height: 3.4rem; overflow: hidden; border: 1px solid color-mix(in srgb,var(--gold) 24%,transparent); border-radius: 999px; background: color-mix(in srgb,var(--bg) 66%,transparent); }
  .continuity-column i { position: absolute; inset: auto 0 0; background: linear-gradient(0deg,#315a92,var(--gold)); box-shadow: 0 0 .8rem color-mix(in srgb,var(--amber) 36%,transparent); }
  .continuity-column b { position:absolute;left:50%;top:50%;color:white;font-size:.42rem;transform:translate(-50%,-50%) rotate(-90deg); }
  .circuit-map { min-width:0;display:grid;grid-template-rows:auto 1fr;overflow:hidden;border-top:1px solid color-mix(in srgb,var(--gold) 13%,transparent);border-bottom:1px solid color-mix(in srgb,var(--gold) 17%,transparent);background:radial-gradient(ellipse at 50% 58%,color-mix(in srgb,var(--gold) 7%,transparent),transparent 54%); }
  .circuit-microgrid { position:relative;z-index:3;display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:.35rem;padding:.28rem .35rem;color:var(--dim);background:color-mix(in srgb,var(--bg) 76%,transparent);font:720 .52rem/1.15 system-ui,sans-serif;letter-spacing:.05em;text-transform:uppercase; }
  .circuit-microgrid span:nth-child(2) { color:var(--gold);text-align:center; }
  .circuit-microgrid span:last-child { text-align:right; }
  .circuit-art { position:relative;min-height:2.6rem;overflow:hidden; }
  .ocean-horizon { position:absolute;inset:48% -5% auto;height:42%;border-top:1px solid color-mix(in srgb,var(--gold) 30%,transparent);border-radius:50%;background:repeating-radial-gradient(ellipse at 50% 0,transparent 0 .7rem,color-mix(in srgb,#6a94c8 7%,transparent) .72rem .76rem); }
  .refuge-center { position:absolute;left:50%;top:48%;z-index:2;width:3.8rem;aspect-ratio:1.45;display:grid;place-items:center;align-content:center;gap:.12rem;transform:translate(-50%,-50%);color:var(--gold);border:1px solid color-mix(in srgb,var(--gold) 28%,transparent);border-radius:55% 55% 18% 18%;background:color-mix(in srgb,var(--bg) 82%,transparent); }
  .refuge-center b { color:var(--amber);font-size:.72rem; }
  .current-network { position:absolute;inset:0; }.current-network i { --angle:calc(var(--current-index) * 22deg - 78deg);position:absolute;left:50%;top:50%;width:calc(3rem + var(--current-index) * .45rem);height:calc(1.25rem + var(--current-index) * .08rem);transform:translate(-50%,-50%) rotate(var(--angle));border-top:1px solid color-mix(in srgb,var(--gold) 12%,transparent);border-radius:50%; }
  .current-network i::after { content:'';position:absolute;right:0;top:-.13rem;width:.28rem;height:.28rem;border-right:1px solid currentColor;border-top:1px solid currentColor;transform:rotate(45deg); }.current-network i.lit { color:var(--gold);border-color:color-mix(in srgb,var(--amber) 58%,transparent);filter:drop-shadow(0 0 .3rem color-mix(in srgb,var(--amber) 28%,transparent)); }
  .return-stack { display:flex;flex-direction:column;align-items:center;justify-content:center;padding:.35rem;text-align:center;border:1px solid color-mix(in srgb,var(--gold) 14%,transparent);border-radius:.8rem .8rem .2rem .2rem;background:color-mix(in srgb,var(--bg) 56%,transparent); }
  .return-stack > small { color:var(--dim);font:720 .4rem/1 system-ui,sans-serif;letter-spacing:.07em; }.return-stack > strong { margin-top:.16rem;color:white;font:780 1rem/1 ui-monospace,monospace; }.return-stack > span { margin-top:.1rem;color:var(--dim);font-size:.42rem; }
  .return-stack button { width:100%;margin-top:.38rem;padding:.32rem .16rem;color:var(--bg);background:linear-gradient(180deg,var(--gold),var(--amber));border:0;border-radius:.5rem; }.return-stack button b,.return-stack button small { display:block; }.return-stack button b { font-size:.5rem; }.return-stack button small { margin-top:.1rem;font-size:.34rem; }
  .circuit-controls { display:grid;grid-template-columns:1fr;gap:.35rem;margin-top:.3rem; }.circuit-cards { display:grid;grid-template-columns:repeat(4,1fr);gap:.2rem; }
  .circuit-cards button { min-width:0;display:grid;grid-template-columns:auto 1fr;gap:.08rem .18rem;place-items:center start;padding:.22rem .2rem;color:var(--dim);text-align:left;background:color-mix(in srgb,var(--bg) 62%,transparent);border:1px solid color-mix(in srgb,var(--gold) 12%,transparent);border-radius:.65rem .2rem .65rem .2rem; }.circuit-cards button span { grid-row:1 / 3;color:var(--amber);font-size:.78rem; }.circuit-cards button b { font-size:.45rem; }.circuit-cards button small { font-size:.38rem; }.circuit-cards button[aria-pressed='true'] { color:white;border-color:var(--gold);box-shadow:inset 0 -2px var(--amber); }
  .circuit-route { display:grid;align-content:center;gap:.32rem;padding-top:.35rem;border-top:1px solid color-mix(in srgb,var(--gold) 12%,transparent); }.reach-scale,.burden-scale { display:grid;grid-template-columns:6rem 1fr;align-items:center;gap:.3rem; }.reach-scale > span,.burden-scale > span { color:var(--dim);font:720 .4rem/1 system-ui,sans-serif;letter-spacing:.07em; }.reach-scale > div,.burden-scale > div { display:flex;gap:.16rem; }
  .circuit-route button { flex:1;min-width:0;padding:.22rem .16rem;color:var(--dim);background:color-mix(in srgb,var(--bg) 62%,transparent);border:1px solid color-mix(in srgb,var(--gold) 12%,transparent);font:650 .4rem/1 system-ui,sans-serif; }.circuit-route button[aria-pressed='true'] { color:white;border-color:var(--gold);background:color-mix(in srgb,var(--amber) 9%,transparent); }

  /* Kailash — mountain stillness first; the copper ring arrives only after the cycle is responsible. */
  .kailash-stillpoint { width:min(45rem,calc(100vw - 29rem));margin:.12rem auto 0;padding:.42rem .62rem .5rem;border-radius:1.5rem 1.5rem .35rem .35rem;background:radial-gradient(ellipse at 23% 62%,color-mix(in srgb,#4f728a 12%,transparent),transparent 34%),linear-gradient(180deg,color-mix(in srgb,var(--panel) 91%,#080d18),color-mix(in srgb,var(--panel) 96%,#03060b)); }
  .kailash-layout { display:grid;grid-template-columns:10rem minmax(0,1fr);gap:.55rem;align-items:center;margin-top:.25rem; }
  .mountain-cycle { position:relative;height:7.2rem;overflow:hidden;border-bottom:1px solid color-mix(in srgb,var(--gold) 14%,transparent);background:radial-gradient(circle at 70% 20%,color-mix(in srgb,var(--gold) 8%,transparent),transparent 17%); }
  .summit-moon { position:absolute;right:13%;top:7%;width:1.25rem;aspect-ratio:1;border:1px solid color-mix(in srgb,var(--gold) 45%,transparent);border-radius:50%;box-shadow:0 0 1.3rem color-mix(in srgb,var(--gold) 15%,transparent); }
  .summit-moon::after { content:'';position:absolute;inset:-.12rem -.25rem .15rem .25rem;border-radius:50%;background:var(--panel); }
  .summit-ridge { position:absolute;left:50%;bottom:.1rem;transform:translateX(-50%);clip-path:polygon(0 100%,24% 58%,37% 68%,55% 9%,69% 62%,80% 48%,100% 100%); }
  .ridge-back { width:100%;height:76%;background:color-mix(in srgb,#345269 24%,transparent); }
  .ridge-front { width:84%;height:66%;background:linear-gradient(145deg,color-mix(in srgb,var(--gold) 18%,#17293d),#0a1322 54%,#050a12);box-shadow:0 0 1.2rem color-mix(in srgb,var(--gold) 8%,transparent); }
  .river-thread { position:absolute;z-index:2;left:53%;top:35%;width:2px;height:65%;background:linear-gradient(var(--gold),#6eacbd 62%,transparent);transform:rotate(7deg);box-shadow:0 0 .55rem color-mix(in srgb,var(--gold) 34%,transparent); }
  .late-ring { position:absolute;z-index:1;left:50%;top:52%;width:6.3rem;aspect-ratio:1;transform:translate(-50%,-50%);border:1px solid transparent;border-radius:50%;opacity:.15;transition:opacity .5s ease,border-color .5s ease; }
  .late-ring.complete { border-color:color-mix(in srgb,#c88452 50%,transparent);border-left-color:transparent;opacity:.75;box-shadow:0 0 1.2rem color-mix(in srgb,#c88452 15%,transparent); }
  .still-center { position:absolute;z-index:3;left:53%;top:42%;width:2.15rem;aspect-ratio:1;display:grid;place-items:center;align-content:center;gap:.03rem;transform:translate(-50%,-50%);color:white;border:1px solid color-mix(in srgb,var(--gold) 32%,transparent);border-radius:50%;background:color-mix(in srgb,var(--bg) 86%,transparent);box-shadow:0 0 1.2rem color-mix(in srgb,#79b0c1 18%,transparent); }
  .still-center > span { color:#c88452;font-size:.48rem; }.still-center strong { font:.76rem/1 ui-monospace,monospace; }.still-center small { color:var(--dim);font-size:.34rem; }
  .cycle-console { min-width:0;display:grid;gap:.3rem; }
  .cycle-sequence { display:grid;grid-template-columns:repeat(8,1fr);gap:.15rem; }
  .cycle-sequence button { min-width:0;display:grid;place-items:center;gap:.03rem;padding:.18rem .08rem;color:var(--dim);background:color-mix(in srgb,var(--bg) 64%,transparent);border:1px solid color-mix(in srgb,var(--gold) 12%,transparent);border-radius:.18rem; }
  .cycle-sequence button span { font:.48rem/1 ui-monospace,monospace; }.cycle-sequence button small { font-size:.3rem; }.cycle-sequence button[data-role='rest'] { border-style:dashed; }.cycle-sequence button.active { color:white;border-color:#c88452;box-shadow:0 0 .6rem color-mix(in srgb,#c88452 24%,transparent); }
  .cycle-presets { display:grid;grid-template-columns:1fr 1fr;gap:.2rem; }
  .cycle-presets button { min-width:0;display:flex;align-items:center;gap:.3rem;padding:.28rem .34rem;color:var(--dim);text-align:left;background:color-mix(in srgb,var(--bg) 62%,transparent);border:1px solid color-mix(in srgb,var(--gold) 12%,transparent);border-radius:.65rem .65rem .18rem .18rem; }
  .cycle-presets button > span { color:#c88452;font-size:.76rem; }.cycle-presets button div { min-width:0;display:grid;gap:.06rem; }.cycle-presets b { color:color-mix(in srgb,var(--gold) 72%,white);font-size:.46rem; }.cycle-presets small { overflow:hidden;font-size:.36rem;text-overflow:ellipsis;white-space:nowrap; }.cycle-presets button[aria-pressed='true'] { color:white;border-color:var(--gold);box-shadow:inset 0 -2px #c88452; }
  .act-legend { display:flex;flex-wrap:wrap;justify-content:center;gap:.2rem .42rem;padding-top:.25rem;border-top:1px solid color-mix(in srgb,var(--gold) 10%,transparent); }.act-legend span { color:var(--dim);font:620 .38rem/1 system-ui,sans-serif; }.act-legend i { margin-right:.16rem;color:var(--gold);font-style:normal; }

  /* Desktop instruments carry essential state, not decorative microcopy. */
  @media (min-width: 801px) {
    .integrated-heading {
      grid-template-columns: minmax(12rem, 1.3fr) minmax(6rem, .7fr) minmax(8rem, .9fr) auto 1.5rem 1.5rem;
    }
    .run-score { gap: 0.35rem; }
    .run-score > div { white-space: normal; }
    .law-explanation,
    .verdance-grafting > header div span,
    .verdance-grafting > header > b,
    .graft-route label > span,
    .graft-route label small,
    .verdance-grafting > p,
    .run-score > div,
    .effect-slot > span,
    .instrument-title span,
    .instrument-reading small,
    .instrument-reading em,
    .instrument-primer > div span,
    .instrument-primer li,
    .instrument-primer p,
    .mandala-reading span,
    .mandala-reading small,
    .creation-modes b,
    .creation-modes small,
    .creation-router label > span,
    .direction-routes button,
    .continuity-column,
    .continuity-column b,
    .circuit-microgrid,
    .return-stack > small,
    .return-stack > span,
    .return-stack button b,
    .return-stack button small,
    .circuit-cards button b,
    .circuit-cards button small,
    .reach-scale > span,
    .burden-scale > span,
    .circuit-route button,
    .still-center > span,
    .still-center small,
    .cycle-sequence button span,
    .cycle-sequence button small,
    .cycle-presets b,
    .cycle-presets small,
    .act-legend span {
      font-size: 0.6875rem;
      line-height: 1.25;
    }
    .verdance-grafting > header div strong,
    .instrument-title strong,
    .instrument-primer > div strong { font-size: 0.75rem; }
    .graft-route select,
    .creation-router select,
    .sever,
    .instrument-primer > button,
    .creation-directions strong,
    .creation-directions b,
    .mandala-reading b { font-size: 0.6875rem; }
    .law-panel button,
    .law-panel select { min-height: 1.5rem; }
    .primer-toggle,
    .instrument-toggle { width: 1.5rem; height: 1.5rem; }
    .instrument-primer li i { width: 1.1rem; height: 1.1rem; }
    .creation-modes small,
    .cycle-presets small { overflow: visible; text-overflow: clip; white-space: normal; }
    :global(html[data-text-scale='large']) .effect-slot { display: none; }
    :global(html[data-text-scale='large']) .integrated-heading { grid-template-columns: minmax(10rem, 1fr) minmax(8rem, 1fr) minmax(8rem, .9fr) 1.5rem 1.5rem; }
    :global(html[data-text-scale='large']) .instrument-title strong,
    :global(html[data-text-scale='large']) .instrument-title span,
    :global(html[data-text-scale='large']) .instrument-reading em { overflow: visible; white-space: normal; overflow-wrap: anywhere; }
    :global(html[data-text-scale='large']) .ocean-layout { height: auto; min-height: 5.8rem; }
    :global(html[data-text-scale='large']) .circuit-controls { grid-template-columns: 1fr; }
    :global(html[data-text-scale='large']) .circuit-route { padding: .35rem 0 0; border-top: 1px solid color-mix(in srgb,var(--gold) 12%,transparent); border-left: 0; }
    :global(html[data-text-scale='large']) .circuit-cards button { align-content: start; }
  }

  @media (max-width: 800px) {
    .brahmalok-mandala,
    .vishnulok-circuit,
    .kailash-stillpoint { width: 100%; margin-top: 0; }
    .integrated-heading {
      grid-template-columns: minmax(0, 1fr) auto 1.25rem 1.25rem;
      grid-template-rows: auto auto;
      gap: 0.18rem 0.35rem;
      min-height: 2.35rem;
    }
    .run-score { grid-column: 1; grid-row: 1; }
    .run-score > strong { font-size: 1.08rem; }
    .run-score > div { font-size: 0.4rem; }
    .effect-slot { display: none; }
    .instrument-title { grid-column: 1; grid-row: 2; padding-left: 0; border-left: 0; }
    .instrument-title span { font-size: 0.34rem; }
    .instrument-title strong { margin-top: 0.08rem; font-size: 0.52rem; }
    .instrument-reading { grid-column: 2; grid-row: 1 / 3; }
    .instrument-reading small { font-size: 0.34rem; }
    .instrument-reading b { font-size: 0.68rem; }
    .instrument-reading em { max-width: 5.6rem; overflow: hidden; font-size: 0.34rem; text-overflow: ellipsis; white-space: nowrap; }
    .instrument-toggle { grid-column: 3; grid-row: 1 / 3; width: 1.2rem; height: 1.2rem; }
    .primer-toggle { grid-column: 4; grid-row: 1 / 3; width: 1.2rem; height: 1.2rem; }
    .instrument-compact { width: min(100%, 34rem); padding: 0.26rem 0.45rem; }
    .settled-heading { grid-template-columns: minmax(0, 1fr) auto; gap: .3rem .45rem; }
    .settled-heading .run-score { display: none; }
    .settled-heading > p { font-size: .64rem; }
    .settled-meter { grid-column: 1; grid-row: 2; }
    .configure-toggle { grid-column: 2; grid-row: 1 / 3; }
    .instrument-primer {
      grid-template-columns: minmax(0, 1fr) auto;
      gap: 0.26rem 0.4rem;
      padding: 0.3rem 0.4rem;
    }
    .instrument-primer ol { grid-column: 1 / -1; gap: 0.18rem; }
    .instrument-primer li { align-items: flex-start; font-size: 0.34rem; }
    .instrument-primer li i { width: 0.7rem; height: 0.7rem; }
    .instrument-primer p { display: none; }
    .instrument-primer > button { grid-column: 2; grid-row: 1; }
    .creation-stage { height: 4.35rem; }
    .mandala-controls { grid-template-columns: 1fr; gap: 0.28rem; }
    .creation-modes { grid-template-columns: repeat(4, 1fr); }
    .creation-modes button { grid-template-columns: auto 1fr; padding: 0.2rem; }
    .creation-modes button > span { grid-row: auto; font-size: 0.65rem; }
    .creation-modes small { display: none; }
    .creation-modes b { font-size: 0.4rem; }
    .creation-router { gap: 0.2rem; padding-left: 0; padding-top: 0.25rem; border-top: 1px solid color-mix(in srgb, var(--gold) 12%, transparent); border-left: 0; }
    .creation-router label > span { font-size: 0.36rem; }
    .creation-router select { padding: 0.2rem 0.3rem; font-size: 0.44rem; }
    .direction-routes button { font-size: 0.38rem; }
    .ocean-layout { grid-template-columns: 1.65rem minmax(0, 1fr) 5.2rem; gap: 0.24rem; height: 4.15rem; }
    .continuity-column { font-size: 0.27rem; letter-spacing: 0.04em; }
    .continuity-column > div { width: 0.9rem; height: 2.9rem; }
    .continuity-column b { font-size: 0.34rem; }
    .refuge-center { width: 3.1rem; }
    .circuit-microgrid { gap: .18rem; padding: .22rem; font-size: .42rem; }
    .return-stack { padding: 0.2rem; }
    .return-stack > small { font-size: 0.31rem; }
    .return-stack > strong { font-size: 0.68rem; }
    .return-stack > span { display: none; }
    .return-stack button { margin-top: 0.25rem; padding: 0.25rem 0.1rem; }
    .return-stack button b { font-size: 0.39rem; }
    .return-stack button small { display: none; }
    .circuit-controls { grid-template-columns: 1fr; gap: 0.25rem; }
    .circuit-cards button { grid-template-columns: auto 1fr; padding: 0.18rem; }
    .circuit-cards button span { grid-row: auto; font-size: 0.62rem; }
    .circuit-cards button b { font-size: 0.36rem; }
    .circuit-cards button small { display: none; }
    .circuit-route { gap: 0.2rem; padding-left: 0; padding-top: 0.24rem; border-top: 1px solid color-mix(in srgb, var(--gold) 12%, transparent); border-left: 0; }
    .reach-scale,
    .burden-scale { grid-template-columns: 4.35rem 1fr; gap: 0.2rem; }
    .reach-scale > span,
    .burden-scale > span { font-size: 0.34rem; }
    .circuit-route button { padding: 0.19rem 0.1rem; font-size: 0.34rem; }
    .kailash-layout { grid-template-columns: 7.2rem minmax(0,1fr); gap: 0.28rem; }
    .mountain-cycle { height: 5.8rem; }
    .late-ring { width: 4.8rem; }
    .still-center { width: 1.7rem; }
    .cycle-sequence { gap: 0.1rem; }
    .cycle-sequence button { padding: 0.12rem 0.04rem; }
    .cycle-sequence button span { font-size: 0.4rem; }
    .cycle-sequence button small { font-size: 0.25rem; }
    .cycle-presets button { padding: 0.2rem; }
    .cycle-presets button > span { font-size: 0.58rem; }
    .cycle-presets b { font-size: 0.36rem; }
    .cycle-presets small { display: none; }
    .act-legend { gap: 0.14rem 0.28rem; }
    .act-legend span { font-size: 0.31rem; }
  }
</style>

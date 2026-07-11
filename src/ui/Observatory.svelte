<script lang="ts">
  import { onMount } from 'svelte'
  import { CONSTELLATION, nodeAvailable, type StarNode } from '../content/constellation'
  import { describeEffect } from '../content/upgrades'
  import { game, supernovaGain, buyNode, stardustTargetFor } from '../engine/game.svelte'
  import { buyStardustWork, stardustMarketComplete } from '../engine/game.svelte'
  import { format } from '../core/format'
  import { playBuy } from '../audio/sfx'
  import { universeById, universeV2ById } from '../content/universes'
  import {
    STARDUST_WORKS,
    stardustProductionMult,
    stardustYieldMult,
    workCost,
    workRank,
    type StardustWorkId,
  } from '../content/repeatables'
  import { save } from '../core/save'
  import {
    constellationNodeCopy,
    constellationNodePosition,
    progressionIdentity,
    stardustWorkCopy,
  } from '../content/universe-progression'
  import { universeRateMult } from '../engine/compute'
  import {
    VERDANCE_COHORT_LABELS,
    verdanceCohortRuntimeSummary,
    type VerdanceCohortStageId,
  } from '../content/universes/verdance'
  import {
    ONE_AMOUNT,
    addAmounts,
    amountFromNumber,
    gteAmount,
    isZeroAmount,
  } from '../core/numeric/amount'
  import LumenVaultShelf from './LumenVaultShelf.svelte'

  let {
    onclose,
    onsupernova,
  }: { onclose: () => void; onsupernova: () => void } = $props()

  let selectedId = $state<string | null>(null)
  let armed = $state(false)
  let now = $state(Date.now())
  let closeButton: HTMLButtonElement

  onMount(() => {
    closeButton.focus()
    const timer = setInterval(() => (now = Date.now()), 500)
    return () => clearInterval(timer)
  })

  const gain = $derived(supernovaGain())
  const selected = $derived(CONSTELLATION.find((n) => n.id === selectedId) ?? null)
  const pack = $derived(universeById(game.activeUniverse))
  const identity = $derived(progressionIdentity(pack.id).observatory)
  const tidefall = $derived(pack.id === 'tidefall')
  const verdance = $derived(pack.id === 'verdance')
  const epochMatter = $derived(universeV2ById(pack.id)?.economy.localPrestige.rewardCurrency)
  const epochMatterGlyph = $derived(epochMatter?.glyph ?? (tidefall ? '◇' : '✧'))
  const epochMatterName = $derived(epochMatter?.localName ?? (tidefall ? 'Moon Salt' : 'Stardust'))
  const marketComplete = $derived(stardustMarketComplete())
  const tideRate = $derived(universeRateMult(game, now))
  const tideNext = $derived(universeRateMult(game, now + 500))
  const tidePosition = $derived(Math.max(0, Math.min(100, ((tideRate - 0.6) / 0.8) * 100)))
  const tideLabel = $derived(tideRate >= 1.22 ? 'crest' : tideRate <= 0.78 ? 'ebb' : tideNext > tideRate ? 'rising' : 'falling')
  const growthStageIds: readonly VerdanceCohortStageId[] = ['u3-cohort-new', 'u3-cohort-rooted', 'u3-cohort-mature', 'u3-cohort-ancient']
  const growth = $derived(verdanceCohortRuntimeSummary(
    pack.generators.map(({ id }) => id),
    game.owned,
    game.numericLawState,
  ))
  const verdanceBranches = [
    { id: 'forge', glyph: '⌇', name: 'Rootwork', note: 'production carried upward through living structure' },
    { id: 'hand', glyph: '❧', name: 'Tending', note: 'care translated into deliberate touch' },
    { id: 'sky', glyph: '✾', name: 'Canopy', note: 'light, seasons, and pollination' },
    { id: 'root', glyph: '◇', name: 'Seed Memory', note: 'rest and inheritance across Prunings' },
  ] as const
  const tidefallBranches = [
    { id: 'forge', glyph: '≋', name: 'Reefwork', note: 'production carried upward through living reefs' },
    { id: 'hand', glyph: '≈', name: 'Undertow', note: 'touch and rhythm moving below the surface' },
    { id: 'sky', glyph: '◌', name: 'Surface Drift', note: 'blessings and omens riding the open current' },
    { id: 'root', glyph: '◉', name: 'Deepwater Memory', note: 'patience and return beneath every tide' },
  ] as const
  const chartBranches = $derived(tidefall ? tidefallBranches : verdanceBranches)

  const worldText = (text: string) => text.replaceAll('{currency}', pack.currency.toLowerCase())

  function nodeState(n: StarNode): 'owned' | 'ready' | 'reachable' | 'locked' {
    if (game.constellation.includes(n.id)) return 'owned'
    if (!nodeAvailable(game.constellation, n)) return 'locked'
    return gteAmount(game.stardust, amountFromNumber(n.cost)) ? 'ready' : 'reachable'
  }

  function tryBuy(n: StarNode) {
    if (buyNode(n.id)) playBuy()
  }

  function tryBuyWork(id: StardustWorkId) {
    if (!buyStardustWork(id)) return
    playBuy()
    save()
  }

  function workStatus(id: StardustWorkId): string {
    const ranks = game.stardustWorks
    if (id === 'continuing-corona') return `current ×${stardustProductionMult(ranks).toFixed(2)} · next ×${(stardustProductionMult(ranks) * 1.3).toFixed(2)}`
    return `current +${Math.round((stardustYieldMult(ranks) - 1) * 100)}% · next +${Math.round((stardustYieldMult(ranks) - 0.85) * 100)}%`
  }

  function lineTargets(n: StarNode): StarNode[] {
    return n.requires
      .map((id) => CONSTELLATION.find((m) => m.id === id))
      .filter((m): m is StarNode => !!m)
  }

  function requiredNames(n: StarNode): string {
    return n.requires.map((id) => {
      const required = CONSTELLATION.find((node) => node.id === id)
      return required ? constellationNodeCopy(required, pack.id).name : id
    }).join(' + ')
  }

  function chartNodeStatus(n: StarNode): string {
    const state = nodeState(n)
    if (state === 'owned') return tidefall ? 'charted' : 'grown'
    if (state === 'ready') return `${epochMatterGlyph}${n.cost} · ready`
    if (state === 'reachable') return `${epochMatterGlyph}${n.cost}`
    return tidefall ? 'awaiting prior current' : 'awaiting prior ring'
  }

  function describe(n: StarNode): string[] {
    const localizePerk = (text: string) => text
      .replaceAll('falling stars', `${pack.events.noun}s`)
      .replaceAll('star blessings', `${pack.events.noun} blessings`)
      .replaceAll('caught stars', `caught ${pack.events.noun}s`)
      .replaceAll('Sparks', pack.generators[0].name)
      .replaceAll('light', pack.currency.toLowerCase())
    return [
      ...n.effects.map((effect) => describeEffect(effect, pack.generatorById, pack.currency.toLowerCase())),
      ...n.perks.map((perk) => localizePerk(perk.desc)),
    ]
  }
</script>

<section class="observatory instrument-panel" class:tidefall class:verdance={pack.id === 'verdance'} class:clockwork={pack.id === 'clockwork'} class:prismata={pack.id === 'prismata'} class:tempest={pack.id === 'tempest'} class:canticle={pack.id === 'canticle'}>
  <header>
    <div class="title-block">
      <span>{identity.overline}</span>
      <h2>{identity.title}</h2>
    </div>
    <span class="balance">{epochMatterGlyph} {format(game.stardust)} <em>{epochMatterName}</em></span>
    <button bind:this={closeButton} class="close" aria-label={`close ${identity.title}`} onclick={onclose}>✕</button>
  </header>

  {#if tidefall}
    <div class="tide-reading" aria-label={`moonless pull ${tideLabel}, production ×${tideRate.toFixed(2)}`}>
      <div><span>moonless pull</span><strong>{tideLabel}</strong></div>
      <span class="current-track"><i style:left={`${tidePosition}%`}></i></span>
      <b>×{tideRate.toFixed(2)}</b>
    </div>
  {:else if verdance}
    <div
      class="growth-reading"
      aria-label={`${growth.dominantStageLabel} growth. Cohort production ×${growth.multiplier.toFixed(2)}. Pruning adds ${growth.memorySeedBonus} Memory Seeds from mature growth.`}
    >
      <div><span>living cohorts</span><strong>{growth.dominantStageLabel}</strong></div>
      <span class="ring-stages">
        {#each growthStageIds as stageId}
          <i class:awake={growth.stageQuantities[stageId] > 0}>
            <small>{VERDANCE_COHORT_LABELS[stageId]}</small>
            <b>{growth.stageQuantities[stageId]}</b>
          </i>
        {/each}
      </span>
      <div class="growth-yield"><b>×{growth.multiplier.toFixed(2)}</b><small>+{growth.memorySeedBonus} {epochMatterGlyph} on Pruning</small></div>
    </div>
  {/if}

  <div class="nova" class:ready={!isZeroAmount(gain)} class:armed data-universe={pack.id}>
    {#if game.challenge}
      <p class="nova-text">{identity.trialWait}</p>
    {:else if game.supernovae === 0 && isZeroAmount(gain)}
      <p class="nova-text">
        {worldText(identity.firstText)} <em>first {epochMatterGlyph} at {format(stardustTargetFor(1))} {pack.currency.toLowerCase()} this era ({format(game.eraEarned)} so far)</em>
      </p>
    {:else if isZeroAmount(gain)}
      <p class="nova-text">
        {worldText(identity.needsText)} <em>{epochMatterGlyph}{format(addAmounts(game.stardustTotal, ONE_AMOUNT))} at
        {format(stardustTargetFor(addAmounts(game.stardustTotal, ONE_AMOUNT)))} {pack.currency.toLowerCase()} this era ({format(game.eraEarned)} so far)</em>
      </p>
    {:else if !armed}
      <p class="nova-text">{identity.readyText}</p>
      <button class="nova-btn" onclick={() => (armed = true)}>{identity.collapseName} &nbsp;·&nbsp; gain {epochMatterGlyph}{format(gain)}</button>
    {:else}
      <p class="nova-text warn">{worldText(identity.warningText)}</p>
      <div class="confirm">
        <button class="nova-btn go" onclick={() => { armed = false; onsupernova() }}>{identity.goText}</button>
        <button class="nova-btn stay" onclick={() => (armed = false)}>Not yet</button>
      </div>
    {/if}
  </div>

  {#if verdance || tidefall}
    {@const crown = CONSTELLATION.find(({ branch }) => branch === 'crown')!}
    {@const crownCopy = constellationNodeCopy(crown, pack.id)}
    {@const crownState = nodeState(crown)}
    <section class="growth-map" class:tide-chart={tidefall} aria-label={identity.mapTitle}>
      <div class="growth-map-head">
        <div>
          <span>{tidefall ? 'the current chart' : 'the living canopy'}</span>
          <strong>{tidefall ? 'Four currents, one crown' : 'Four paths, one crown'}</strong>
        </div>
        <div class="growth-key" aria-label={tidefall ? 'Current Chart states' : 'Growth-ring states'}>
          <span class="grown">{tidefall ? 'charted' : 'grown'}</span><span class="available">available</span><span class="waiting">{tidefall ? 'submerged' : 'waiting'}</span>
        </div>
      </div>
      <button
        type="button"
        class="growth-node crown {crownState}"
        class:selected={selectedId === crown.id}
        onclick={() => (selectedId = crown.id)}
      >
        <span class="ring-mark" aria-hidden="true"><i></i></span>
        <span class="growth-node-copy"><small>{tidefall ? 'chart capstone' : 'canopy capstone'}</small><strong>{crownCopy.name}</strong><em>{crownCopy.flavor}</em></span>
        <span class="growth-node-state">{chartNodeStatus(crown)}</span>
      </button>

      <div class="growth-paths">
        {#each chartBranches as branch (branch.id)}
          <section class="growth-path" data-branch={branch.id}>
            <header>
              <span aria-hidden="true">{branch.glyph}</span>
              <div><strong>{branch.name}</strong><small>{branch.note}</small></div>
            </header>
            <div class="growth-path-nodes">
              {#each CONSTELLATION.filter((node) => node.branch === branch.id) as n (n.id)}
                {@const copy = constellationNodeCopy(n, pack.id)}
                {@const state = nodeState(n)}
                <button
                  type="button"
                  class="growth-node {state}"
                  class:selected={selectedId === n.id}
                  onclick={() => (selectedId = n.id)}
                >
                  <span class="ring-mark" aria-hidden="true"><i></i></span>
                  <span class="growth-node-copy"><strong>{copy.name}</strong><em>{copy.flavor}</em></span>
                  <span class="growth-node-state">{chartNodeStatus(n)}</span>
                </button>
              {/each}
            </div>
          </section>
        {/each}
      </div>
    </section>
  {:else}
    <svg viewBox="0 0 100 74" class="map" class:complete={marketComplete} aria-label={identity.mapTitle}>
      <title>{identity.mapTitle}</title>
      {#each CONSTELLATION as n (n.id)}
        {#each lineTargets(n) as target (target.id)}
          {@const from = constellationNodePosition(n, pack.id)}
          {@const to = constellationNodePosition(target, pack.id)}
          <line
            x1={from.x} y1={from.y} x2={to.x} y2={to.y}
            class="edge"
            class:lit={game.constellation.includes(n.id) && game.constellation.includes(target.id)}
          />
        {/each}
      {/each}
      {#each CONSTELLATION as n (n.id)}
        {@const copy = constellationNodeCopy(n, pack.id)}
        {@const position = constellationNodePosition(n, pack.id)}
        {@const state = nodeState(n)}
        <g
          class="node {state}"
          class:selected={selectedId === n.id}
          onclick={() => (selectedId = n.id)}
          onkeydown={(e) => e.key === 'Enter' && (selectedId = n.id)}
          role="button"
          tabindex="0"
        >
          <circle cx={position.x} cy={position.y} r="4.5" class="halo" />
          <circle cx={position.x} cy={position.y} r="1.9" class="core" />
          <text x={position.x} y={position.y + 6.4}>{copy.name}</text>
        </g>
      {/each}
    </svg>
  {/if}

  {#if selected}
    {@const copy = constellationNodeCopy(selected, pack.id)}
    {@const state = nodeState(selected)}
    <div class="detail">
      <strong>{copy.name}</strong>
      <em>{copy.flavor}</em>
      <ul>
        {#each describe(selected) as line, i (i)}
          <li>{line}</li>
        {/each}
      </ul>
      {#if state === 'owned'}
        <span class="owned-tag">{identity.ownedText}</span>
      {:else if state === 'locked'}
        <span class="locked-tag">requires {requiredNames(selected)}</span>
      {:else}
        <button class="buy" class:unaffordable={state !== 'ready'} disabled={state !== 'ready'} onclick={() => tryBuy(selected)}>
          {epochMatterGlyph} {selected.cost}
        </button>
      {/if}
    </div>
  {/if}

  <section class="eternal" class:locked={!marketComplete} aria-label={`Repeatable ${epochMatterName} works`}>
    <div class="eternal-head">
      <div>
        <span>{identity.eternalEyebrow}</span>
        <h3>{identity.eternalTitle}</h3>
      </div>
      {#if marketComplete}<strong>{epochMatterGlyph} repeats forever</strong>{/if}
    </div>
    {#if marketComplete}
      <p>{identity.eternalIntro}</p>
      <div class="work-grid">
        {#each STARDUST_WORKS as work (work.id)}
          {@const copy = stardustWorkCopy(work, pack.id)}
          {@const rank = workRank(game.stardustWorks, work.id)}
          {@const cost = workCost(work, rank)}
          {@const affordable = cost !== null && gteAmount(game.stardust, cost)}
          <article class="work" class:affordable class:unaffordable={cost !== null && !affordable}>
            <span class="work-glyph">{work.glyph}</span>
            <div class="work-copy">
              <small>rank {rank}</small>
              <strong>{copy.name}</strong>
              <em>{copy.flavor}</em>
              <span>{copy.effect ?? work.effect}</span>
              <b>{workStatus(work.id)}</b>
            </div>
            <button class:unaffordable={cost !== null && !affordable} disabled={cost === null || !affordable} onclick={() => tryBuyWork(work.id)}>
              {cost === null ? 'mastered' : `${identity.workVerb} · ${epochMatterGlyph} ${format(cost)}`}
            </button>
          </article>
        {/each}
      </div>
    {:else}
      <p>{identity.eternalEmpty}</p>
    {/if}
  </section>

  <LumenVaultShelf home="observatory" />
</section>

<style>
  .observatory {
    position: fixed;
    inset: 3.2rem 0 0 0;
    margin: 0 auto;
    width: min(46rem, 96vw);
    max-height: calc(100vh - 4rem);
    overflow-y: auto;
    padding: 1.1rem 1.4rem 1.4rem;
    background: rgba(9, 8, 18, 0.94);
    border: 1px solid rgba(180, 170, 255, 0.16);
    border-radius: 16px;
    backdrop-filter: blur(14px);
    z-index: 9;
    animation: obs-in 0.5s ease both;
    scrollbar-width: thin;
  }
  @keyframes obs-in {
    from { opacity: 0; transform: translateY(12px); }
    to { opacity: 1; transform: translateY(0); }
  }
  header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 0.8rem;
  }
  .title-block { flex: 1; min-width: 0; }
  .title-block > span {
    display: block;
    margin-bottom: 0.16rem;
    font-size: 0.52rem;
    font-weight: 700;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: #77708f;
  }
  h2 {
    margin: 0;
    flex: 1;
    font-size: 0.72rem;
    font-weight: 600;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: #b9b3e0;
  }
  .balance {
    font-size: 1.05rem;
    font-weight: 650;
    color: #d8d2ff;
    text-shadow: 0 0 16px rgba(170, 150, 255, 0.5);
    font-variant-numeric: tabular-nums;
  }
  .balance em {
    font-style: normal;
    font-size: 0.7rem;
    color: var(--dim);
  }
  .close {
    background: none;
    border: none;
    color: var(--dim);
    font-size: 0.95rem;
    cursor: pointer;
  }

  .tide-reading {
    display: grid;
    grid-template-columns: auto minmax(7rem, 1fr) auto;
    align-items: center;
    gap: 0.8rem;
    margin: -0.2rem 0 0.7rem;
    padding: 0.48rem 0.7rem;
    border: 1px solid rgba(88, 222, 216, 0.16);
    border-radius: 10px;
    background: rgba(32, 128, 145, 0.055);
  }
  .tide-reading > div { display: flex; flex-direction: column; }
  .tide-reading span,
  .tide-reading b { font-size: 0.58rem; text-transform: uppercase; letter-spacing: 0.1em; color: rgba(163, 230, 230, 0.72); }
  .tide-reading strong { font-family: Georgia, serif; font-size: 0.82rem; font-weight: 500; color: #d8fffb; }
  .current-track { position: relative; height: 2px; background: linear-gradient(90deg, #244d71, #4cd7d2, #d2fff8); border-radius: 999px; }
  .current-track i { position: absolute; top: 50%; width: 0.5rem; height: 0.5rem; transform: translate(-50%, -50%); border: 1px solid #d7fffa; border-radius: 50%; background: #58ded8; box-shadow: 0 0 12px rgba(88, 222, 216, 0.8); }

  .growth-reading {
    display: grid;
    grid-template-columns: auto minmax(13rem, 1fr) auto;
    align-items: center;
    gap: 0.8rem;
    margin: -0.2rem 0 0.7rem;
    padding: 0.52rem 0.7rem;
    border-top: 1px solid color-mix(in srgb, var(--gold) 20%, transparent);
    border-bottom: 1px solid color-mix(in srgb, var(--gold) 12%, transparent);
    background: linear-gradient(90deg, transparent, color-mix(in srgb, var(--amber) 6%, transparent), transparent);
  }
  .growth-reading > div { display: flex; flex-direction: column; }
  .growth-reading span,
  .growth-reading small { color: color-mix(in srgb, var(--gold) 62%, var(--dim)); font-size: 0.56rem; letter-spacing: 0.08em; text-transform: uppercase; }
  .growth-reading strong { color: var(--gold); font-family: Georgia, serif; font-size: 0.84rem; font-weight: 500; }
  .ring-stages { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.28rem; }
  .ring-stages i {
    min-width: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.28rem;
    padding: 0.3rem 0.38rem;
    border: 1px solid color-mix(in srgb, var(--gold) 10%, transparent);
    border-radius: 65% 35% 65% 35%;
    opacity: 0.42;
  }
  .ring-stages i.awake { border-color: color-mix(in srgb, var(--gold) 34%, transparent); background: color-mix(in srgb, var(--amber) 8%, transparent); opacity: 1; }
  .ring-stages b { color: color-mix(in srgb, var(--gold) 82%, white); font-size: 0.64rem; font-style: normal; }
  .growth-yield { align-items: flex-end; }
  .growth-yield > b { color: var(--gold); font-size: 0.76rem; }
  .growth-yield small { white-space: nowrap; }

  .nova {
    position: relative;
    padding: 0.72rem 1rem;
    margin-bottom: 0.6rem;
    border-top: 1px solid color-mix(in srgb, var(--gold) 16%, transparent);
    border-bottom: 1px solid color-mix(in srgb, var(--gold) 10%, transparent);
    background: linear-gradient(90deg, transparent, color-mix(in srgb, var(--amber) 4%, transparent) 18% 82%, transparent);
    text-align: center;
  }
  .nova.ready {
    border-top-color: color-mix(in srgb, var(--gold) 34%, transparent);
    background: linear-gradient(90deg, transparent, color-mix(in srgb, var(--amber) 7%, transparent) 18% 82%, transparent);
  }
  .nova.armed {
    isolation: isolate;
    min-height: 4.4rem;
    display: grid;
    grid-template-columns: 2.55rem minmax(0, 1fr) auto;
    align-items: center;
    gap: 0.75rem;
    padding: 0.68rem 0.2rem;
    text-align: left;
  }
  .nova.armed::after {
    content: '';
    position: absolute;
    inset: 0;
    z-index: -1;
    pointer-events: none;
  }
  .nova.armed[data-universe='emberlight']::after {
    background:
      radial-gradient(circle at 1.15rem 50%, color-mix(in srgb, var(--amber) 16%, transparent), transparent 3.4rem),
      linear-gradient(90deg, color-mix(in srgb, var(--amber) 4%, transparent), transparent 62%);
  }
  .nova.armed[data-universe='tidefall']::after {
    background:
      radial-gradient(ellipse at 8% 115%, color-mix(in srgb, var(--amber) 13%, transparent), transparent 34%),
      linear-gradient(90deg, color-mix(in srgb, var(--amber) 4%, transparent), transparent 70%);
    border-bottom: 1px solid color-mix(in srgb, var(--gold) 14%, transparent);
    border-radius: 50%;
  }
  .nova.armed[data-universe='verdance']::after {
    background:
      repeating-radial-gradient(ellipse at 6% 50%, transparent 0 0.8rem, color-mix(in srgb, var(--amber) 10%, transparent) 0.84rem 0.9rem, transparent 0.94rem 1.45rem);
    -webkit-mask: linear-gradient(90deg, #000, transparent 42%);
    mask: linear-gradient(90deg, #000, transparent 42%);
  }
  .nova.armed[data-universe='clockwork']::after {
    background: repeating-linear-gradient(90deg, color-mix(in srgb, var(--gold) 7%, transparent) 0 1px, transparent 1px 2.8rem);
    -webkit-mask: linear-gradient(90deg, #000, transparent 68%);
    mask: linear-gradient(90deg, #000, transparent 68%);
  }
  .nova.armed[data-universe='prismata']::after {
    background:
      radial-gradient(circle at 12% 50%, color-mix(in srgb, var(--amber) 14%, transparent), transparent 24%),
      repeating-linear-gradient(0deg, transparent 0 17%, color-mix(in srgb, var(--gold) 7%, transparent) 17.4% 18%, transparent 18.4% 34%);
    clip-path: polygon(0 10%, 92% 10%, 100% 22%, 100% 90%, 8% 90%, 0 78%);
  }
  .nova.armed[data-universe='tempest']::after {
    background:
      linear-gradient(112deg, transparent 0 42%, color-mix(in srgb, var(--gold) 18%, transparent) 42.5% 43.2%, transparent 44%),
      radial-gradient(ellipse at 50% 50%, color-mix(in srgb, var(--amber) 13%, transparent), transparent 65%);
    clip-path: polygon(0 12%, 43% 20%, 49% 0, 56% 39%, 100% 24%, 100% 84%, 58% 75%, 50% 100%, 43% 63%, 0 80%);
  }
  .nova.armed[data-universe='canticle']::after {
    background: repeating-radial-gradient(ellipse at center, transparent 0 10%, color-mix(in srgb, var(--amber) 11%, transparent) 10.4% 11%, transparent 11.4% 21%);
    clip-path: ellipse(50% 44% at 50% 50%);
  }
  .nova.armed::before {
    content: '✦';
    width: 2.25rem;
    aspect-ratio: 1;
    display: grid;
    place-items: center;
    color: var(--gold);
    border: 1px solid color-mix(in srgb, var(--gold) 34%, transparent);
    border-radius: 50%;
    box-shadow: 0 0 1.2rem color-mix(in srgb, var(--amber) 14%, transparent);
  }
  .nova.armed[data-universe='tidefall']::before { content: '≈'; border-radius: 58% 42% 58% 42%; }
  .nova.armed[data-universe='verdance']::before { content: '❧'; border-radius: 60% 40% 60% 40%; }
  .nova.armed[data-universe='clockwork']::before { content: '⌁'; outline: 1px dashed color-mix(in srgb, var(--gold) 20%, transparent); outline-offset: 0.16rem; }
  .nova.armed[data-universe='prismata']::before { content: '✤'; border-radius: 54% 46% 54% 46%; outline: 1px dashed color-mix(in srgb, #8ecbe0 26%, transparent); outline-offset: .16rem; }
  .nova.armed[data-universe='tempest']::before { content: 'ϟ'; border-radius: 50% 50% 58% 42%; }
  .nova.armed[data-universe='canticle']::before { content: '◌'; border-style: dashed; border-radius: 50%; }
  .nova.armed .nova-text {
    margin: 0;
  }
  .nova-text {
    margin: 0 0 0.4rem;
    font-family: Georgia, serif;
    font-style: italic;
    font-size: 0.9rem;
    color: color-mix(in srgb, var(--gold) 68%, var(--text));
  }
  .nova-text em {
    display: block;
    margin-top: 0.2rem;
    font-size: 0.74rem;
    color: var(--dim);
  }
  .nova-text.warn {
    color: color-mix(in srgb, var(--gold) 76%, var(--text));
  }
  .confirm {
    display: flex;
    gap: 0.5rem;
    justify-content: flex-end;
  }
  .nova-btn {
    padding: 0.45rem 1.3rem;
    font: inherit;
    font-weight: 700;
    color: var(--bg);
    background: linear-gradient(180deg, var(--gold), var(--amber));
    border: none;
    border-radius: 999px;
    cursor: pointer;
    box-shadow: 0 0 24px color-mix(in srgb, var(--amber) 35%, transparent);
    transition: transform 0.08s;
  }
  .nova-btn:hover { transform: scale(1.04); }
  .nova-btn.stay {
    background: none;
    color: var(--dim);
    border: 1px solid rgba(255, 255, 255, 0.15);
    box-shadow: none;
  }

  .growth-map {
    margin: 0.2rem 0;
    padding: 0.82rem;
    overflow: hidden;
    border: 1px solid color-mix(in srgb, var(--gold) 16%, transparent);
    border-radius: 1.1rem;
    background:
      radial-gradient(ellipse at 50% 0%, color-mix(in srgb, var(--amber) 10%, transparent), transparent 32%),
      linear-gradient(180deg, color-mix(in srgb, var(--bg) 48%, transparent), color-mix(in srgb, var(--panel) 62%, transparent));
  }
  .growth-map-head {
    display: flex;
    align-items: end;
    justify-content: space-between;
    gap: 1rem;
    padding: 0 0.18rem 0.65rem;
  }
  .growth-map-head > div:first-child > span {
    display: block;
    color: color-mix(in srgb, var(--amber) 76%, var(--dim));
    font-size: 0.5rem;
    font-weight: 750;
    letter-spacing: 0.15em;
    text-transform: uppercase;
  }
  .growth-map-head > div:first-child > strong {
    display: block;
    margin-top: 0.12rem;
    color: color-mix(in srgb, var(--gold) 88%, white);
    font: 500 0.92rem/1.2 Georgia, serif;
  }
  .growth-key { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 0.52rem; }
  .growth-key span {
    color: color-mix(in srgb, var(--gold) 55%, var(--dim));
    font-size: 0.5rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }
  .growth-key span::before {
    content: '';
    width: 0.42rem;
    aspect-ratio: 1;
    display: inline-block;
    margin-right: 0.22rem;
    vertical-align: -0.04rem;
    border: 1px solid color-mix(in srgb, var(--gold) 22%, transparent);
    border-radius: 50%;
  }
  .growth-key .grown::before { background: var(--gold); box-shadow: 0 0 0.45rem color-mix(in srgb, var(--amber) 60%, transparent); }
  .growth-key .available::before { border-color: var(--amber); background: color-mix(in srgb, var(--amber) 34%, transparent); }
  .growth-key .waiting::before { opacity: 0.38; }

  .growth-node {
    position: relative;
    z-index: 1;
    width: 100%;
    min-width: 0;
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    align-items: center;
    gap: 0.55rem;
    padding: 0.55rem 0.62rem;
    color: var(--text);
    font: inherit;
    text-align: left;
    background: color-mix(in srgb, var(--amber) 3%, rgba(0, 0, 0, 0.2));
    border: 1px solid color-mix(in srgb, var(--gold) 10%, transparent);
    border-radius: 0.72rem 0.42rem 0.72rem 0.42rem;
    cursor: pointer;
    transition: border-color 140ms ease, background 140ms ease, transform 140ms ease;
  }
  .growth-node:hover { border-color: color-mix(in srgb, var(--gold) 34%, transparent); background: color-mix(in srgb, var(--amber) 7%, rgba(0, 0, 0, 0.2)); }
  .growth-node:focus-visible { outline: 2px solid var(--gold); outline-offset: 2px; }
  .growth-node.selected { border-color: color-mix(in srgb, var(--gold) 62%, transparent); background: color-mix(in srgb, var(--amber) 10%, rgba(0, 0, 0, 0.2)); }
  .ring-mark {
    width: 1.75rem;
    aspect-ratio: 1;
    display: grid;
    place-items: center;
    border: 1px solid color-mix(in srgb, var(--gold) 18%, transparent);
    border-radius: 58% 42% 58% 42%;
    background: color-mix(in srgb, var(--bg) 80%, transparent);
    box-shadow: 0 0 0 0.22rem color-mix(in srgb, var(--amber) 3%, transparent);
  }
  .ring-mark i {
    width: 0.46rem;
    aspect-ratio: 1;
    display: block;
    border-radius: 50%;
    background: color-mix(in srgb, var(--gold) 28%, var(--bg));
  }
  .growth-node-copy { min-width: 0; display: block; }
  .growth-node-copy small {
    display: block;
    margin-bottom: 0.08rem;
    color: color-mix(in srgb, var(--amber) 70%, var(--dim));
    font-size: 0.46rem;
    font-weight: 750;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }
  .growth-node-copy strong {
    display: block;
    color: color-mix(in srgb, var(--gold) 76%, white);
    font-size: 0.68rem;
    line-height: 1.2;
    overflow-wrap: anywhere;
  }
  .growth-node-copy em {
    display: block;
    margin-top: 0.1rem;
    color: color-mix(in srgb, var(--gold) 42%, var(--dim));
    font: italic 0.55rem/1.28 Georgia, serif;
  }
  .growth-node-state {
    max-width: 5.6rem;
    color: color-mix(in srgb, var(--gold) 58%, var(--dim));
    font-size: 0.5rem;
    font-weight: 650;
    line-height: 1.25;
    text-align: right;
    text-transform: uppercase;
  }
  .growth-node.owned { border-color: color-mix(in srgb, var(--gold) 28%, transparent); }
  .growth-node.owned .ring-mark { border-color: color-mix(in srgb, var(--gold) 58%, transparent); }
  .growth-node.owned .ring-mark i { background: var(--gold); box-shadow: 0 0 0.55rem color-mix(in srgb, var(--amber) 78%, transparent); }
  .growth-node.owned .growth-node-state { color: var(--gold); }
  .growth-node.ready { border-color: color-mix(in srgb, var(--amber) 46%, transparent); }
  .growth-node.ready .ring-mark { border-color: var(--amber); box-shadow: 0 0 0.7rem color-mix(in srgb, var(--amber) 22%, transparent); }
  .growth-node.ready .ring-mark i { background: var(--amber); }
  .growth-node.ready .growth-node-state { color: color-mix(in srgb, var(--gold) 88%, white); }
  .growth-node.locked { opacity: 0.58; }

  .growth-node.crown {
    width: min(31rem, 100%);
    margin: 0 auto 0.78rem;
    padding: 0.72rem 0.78rem;
    border-radius: 50% / 1rem;
    background:
      radial-gradient(ellipse at 50% 0%, color-mix(in srgb, var(--amber) 13%, transparent), transparent 62%),
      color-mix(in srgb, var(--amber) 4%, rgba(0, 0, 0, 0.22));
  }
  .growth-node.crown .ring-mark { width: 2.15rem; box-shadow: 0 0 0 0.3rem color-mix(in srgb, var(--amber) 4%, transparent); }
  .growth-node.crown .growth-node-copy strong { font-size: 0.78rem; }

  .growth-paths { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(17rem, 100%), 1fr)); gap: 0.64rem; }
  .growth-path {
    min-width: 0;
    padding: 0.62rem;
    border: 1px solid color-mix(in srgb, var(--gold) 9%, transparent);
    border-radius: 0.8rem;
    background: color-mix(in srgb, var(--bg) 46%, transparent);
  }
  .growth-path > header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin: 0 0 0.48rem;
  }
  .growth-path > header > span {
    width: 1.55rem;
    aspect-ratio: 1;
    display: grid;
    place-items: center;
    flex: 0 0 auto;
    color: var(--gold);
    border: 1px solid color-mix(in srgb, var(--gold) 18%, transparent);
    border-radius: 60% 40% 60% 40%;
  }
  .growth-path > header div { min-width: 0; }
  .growth-path > header strong { display: block; color: color-mix(in srgb, var(--gold) 76%, white); font-size: 0.64rem; }
  .growth-path > header small { display: block; margin-top: 0.06rem; color: color-mix(in srgb, var(--gold) 40%, var(--dim)); font-size: 0.49rem; line-height: 1.2; }
  .growth-path-nodes { position: relative; display: grid; gap: 0.38rem; }
  .growth-path-nodes::before {
    content: '';
    position: absolute;
    z-index: 0;
    top: 1rem;
    bottom: 1rem;
    left: 1.47rem;
    width: 1px;
    background: linear-gradient(color-mix(in srgb, var(--amber) 8%, transparent), color-mix(in srgb, var(--gold) 22%, transparent), color-mix(in srgb, var(--amber) 8%, transparent));
  }

  .growth-map.tide-chart {
    border-color: rgba(88, 222, 216, 0.2);
    border-radius: 0.95rem;
    background:
      repeating-radial-gradient(ellipse at 50% 112%, transparent 0 3.35rem, rgba(88, 222, 216, 0.028) 3.4rem 3.46rem, transparent 3.51rem 6.7rem),
      radial-gradient(ellipse at 50% 100%, rgba(38, 130, 143, 0.12), transparent 62%),
      rgba(0, 8, 16, 0.64);
  }
  .tide-chart .growth-map-head > div:first-child > span { color: rgba(88, 222, 216, 0.72); }
  .tide-chart .growth-map-head > div:first-child > strong,
  .tide-chart .growth-node-copy strong,
  .tide-chart .growth-path > header strong { color: #d4fff8; }
  .tide-chart .growth-key span,
  .tide-chart .growth-node-state,
  .tide-chart .growth-node-copy em,
  .tide-chart .growth-path > header small { color: rgba(158, 223, 221, 0.62); }
  .tide-chart .growth-key span::before { border-color: rgba(88, 222, 216, 0.3); }
  .tide-chart .growth-key .grown::before { background: #9ff8ed; box-shadow: 0 0 0.45rem rgba(88, 222, 216, 0.68); }
  .tide-chart .growth-key .available::before { border-color: #58ded8; background: rgba(88, 222, 216, 0.28); }
  .tide-chart .growth-node {
    border-color: rgba(88, 222, 216, 0.11);
    border-radius: 0.72rem;
    background: linear-gradient(90deg, rgba(42, 160, 163, 0.045), rgba(0, 8, 16, 0.3));
  }
  .tide-chart .growth-node:hover,
  .tide-chart .growth-node.selected { border-color: rgba(112, 239, 228, 0.45); background: rgba(42, 160, 163, 0.1); }
  .tide-chart .ring-mark {
    border-color: rgba(88, 222, 216, 0.24);
    border-radius: 50%;
    background: rgba(0, 17, 28, 0.78);
    box-shadow: 0 0 0 0.22rem rgba(88, 222, 216, 0.025), inset 0 0 0.65rem rgba(88, 222, 216, 0.07);
  }
  .tide-chart .ring-mark i { background: #286b7b; }
  .tide-chart .growth-node.owned { border-color: rgba(133, 242, 229, 0.3); }
  .tide-chart .growth-node.owned .ring-mark { border-color: rgba(170, 255, 244, 0.72); }
  .tide-chart .growth-node.owned .ring-mark i { background: #cffff8; box-shadow: 0 0 0.6rem rgba(88, 222, 216, 0.9); }
  .tide-chart .growth-node.owned .growth-node-state { color: #9ff8ed; }
  .tide-chart .growth-node.ready { border-color: rgba(88, 222, 216, 0.52); }
  .tide-chart .growth-node.ready .ring-mark { border-color: #58ded8; box-shadow: 0 0 0.7rem rgba(88, 222, 216, 0.2); }
  .tide-chart .growth-node.ready .ring-mark i { background: #58ded8; }
  .tide-chart .growth-node.ready .growth-node-state { color: #b9fff2; }
  .tide-chart .growth-node.crown {
    border-radius: 50% / 0.9rem;
    background:
      radial-gradient(ellipse at 50% 0%, rgba(88, 222, 216, 0.13), transparent 62%),
      rgba(0, 15, 26, 0.48);
  }
  .tide-chart .growth-path {
    border-color: rgba(88, 222, 216, 0.1);
    border-radius: 0.72rem;
    background: rgba(0, 8, 16, 0.38);
  }
  .tide-chart .growth-path > header > span {
    color: #9ff8ed;
    border-color: rgba(88, 222, 216, 0.24);
    border-radius: 50%;
    background: rgba(38, 130, 143, 0.08);
  }
  .tide-chart .growth-path-nodes::before {
    background: linear-gradient(rgba(88, 222, 216, 0.05), rgba(88, 222, 216, 0.32), rgba(88, 222, 216, 0.05));
  }

  .map {
    width: 100%;
    display: block;
  }
  .map.complete {
    height: 13rem;
  }
  .edge {
    stroke: rgba(180, 170, 255, 0.12);
    stroke-width: 0.25;
  }
  .edge.lit {
    stroke: rgba(216, 210, 255, 0.65);
    stroke-width: 0.4;
    filter: drop-shadow(0 0 1.5px rgba(180, 160, 255, 0.8));
  }
  .node { cursor: pointer; outline: none; }
  .node .halo {
    fill: rgba(180, 170, 255, 0.05);
    transition: fill 0.2s;
  }
  .node .core {
    fill: #4a4468;
    transition: fill 0.2s;
  }
  .node text {
    font-size: 2.1px;
    fill: rgba(200, 195, 230, 0.4);
    text-anchor: middle;
    pointer-events: none;
  }
  .node.owned .core {
    fill: #ffe9b8;
    filter: drop-shadow(0 0 2px rgba(255, 220, 150, 0.9));
  }
  .node.owned text { fill: rgba(255, 233, 184, 0.8); }
  .node.ready .core {
    fill: #a99cf0;
    filter: drop-shadow(0 0 2px rgba(170, 150, 255, 0.9));
    animation: node-pulse 1.6s ease-in-out infinite;
  }
  .node.ready text { fill: rgba(200, 190, 255, 0.85); }
  .node.reachable .core { fill: #6c6494; }
  .node.locked { opacity: 0.45; }
  .node.selected .halo, .node:hover .halo { fill: rgba(200, 190, 255, 0.14); }
  @keyframes node-pulse {
    0%, 100% { r: 1.9; }
    50% { r: 2.4; }
  }

  .detail {
    margin-top: 0.4rem;
    padding: 0.75rem 0.9rem;
    border: 1px solid rgba(180, 170, 255, 0.18);
    border-radius: 12px;
    background: rgba(180, 170, 255, 0.05);
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }
  .detail strong { color: #e6e1ff; }
  .detail em {
    font-family: Georgia, serif;
    font-size: 0.82rem;
    color: var(--dim);
  }
  .detail ul {
    margin: 0.2rem 0 0;
    padding-left: 1.1rem;
    font-size: 0.82rem;
    color: #cfc8f5;
  }
  .buy {
    align-self: flex-start;
    margin-top: 0.35rem;
    padding: 0.35rem 1.1rem;
    font: inherit;
    font-weight: 700;
    color: #14102a;
    background: linear-gradient(180deg, #d8d2ff, #a99cf0);
    border: none;
    border-radius: 999px;
    cursor: pointer;
  }
  .buy:disabled,
  .buy.unaffordable {
    opacity: 1;
    color: color-mix(in srgb, var(--text) 45%, var(--bg));
    background: linear-gradient(132deg, transparent 0 47%, color-mix(in srgb, var(--dim) 10%, transparent) 48% 50%, transparent 51%) 0 0 / 1.4rem 1.4rem, color-mix(in srgb, var(--bg) 86%, var(--panel));
    box-shadow: inset 0 0 0.85rem rgba(0, 0, 0, 0.3);
    cursor: default;
  }
  .owned-tag, .locked-tag {
    font-size: 0.75rem;
    color: var(--dim);
    font-style: italic;
  }
  .owned-tag { color: rgba(255, 233, 184, 0.7); }
  .eternal {
    margin-top: 0.8rem;
    padding: 0.85rem;
    border: 1px solid rgba(190, 175, 255, 0.22);
    border-radius: 13px;
    background: linear-gradient(145deg, rgba(115, 95, 190, 0.09), rgba(255, 194, 113, 0.035));
  }
  .eternal.locked { opacity: 0.6; }
  .eternal-head { display: flex; align-items: flex-end; justify-content: space-between; gap: 1rem; }
  .eternal-head span { display: block; margin-bottom: 0.16rem; font-size: 0.54rem; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #a99cf0; }
  .eternal h3 { margin: 0; font-family: Georgia, serif; font-size: 1rem; font-weight: 500; color: #e6e1ff; }
  .eternal-head > strong { font-size: 0.62rem; color: #ffe2a8; }
  .eternal > p { margin: 0.45rem 0 0; font-family: Georgia, serif; font-size: 0.74rem; font-style: italic; color: var(--dim); }
  .work-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; margin-top: 0.7rem; }
  .work { display: grid; grid-template-columns: auto minmax(0, 1fr); gap: 0.55rem; padding: 0.7rem; border: 1px solid rgba(190, 175, 255, 0.15); border-radius: 10px; background: rgba(3, 3, 10, 0.28); }
  .work.affordable { border-color: color-mix(in srgb, var(--amber) 26%, transparent); box-shadow: inset 0 0 1.15rem color-mix(in srgb, var(--amber) 12%, transparent); }
  .work.unaffordable { color: color-mix(in srgb, var(--text) 45%, var(--bg)); background: linear-gradient(132deg, transparent 0 48%, color-mix(in srgb, var(--dim) 8%, transparent) 49% 50%, transparent 51%) 0 0 / 2.6rem 2.6rem, color-mix(in srgb, var(--bg) 88%, var(--panel)); border-color: color-mix(in srgb, var(--dim) 9%, transparent); }
  .work-glyph { width: 1.9rem; height: 1.9rem; display: grid; place-items: center; color: #ffe4ad; border: 1px solid rgba(255, 220, 160, 0.2); border-radius: 50%; box-shadow: 0 0 14px rgba(255, 196, 110, 0.08); }
  .work-copy { min-width: 0; display: flex; flex-direction: column; gap: 0.1rem; }
  .work-copy small { font-size: 0.52rem; letter-spacing: 0.1em; text-transform: uppercase; color: #a99cf0; }
  .work-copy strong { font-size: 0.78rem; color: #eeeaff; }
  .work-copy em { font-family: Georgia, serif; font-size: 0.66rem; line-height: 1.3; color: var(--dim); }
  .work-copy span { font-size: 0.62rem; color: #cfc8f5; }
  .work-copy b { margin-top: 0.1rem; font-size: 0.58rem; font-weight: 650; color: #ffe0a3; }
  .work button { grid-column: 1 / -1; justify-self: start; padding: 0.3rem 0.72rem; font: inherit; font-size: 0.64rem; font-weight: 750; color: #171127; background: linear-gradient(180deg, #e5ddff, #aa9bf0); border: 0; border-radius: 999px; cursor: pointer; }
  .work button:disabled,
  .work button.unaffordable { opacity: 1; color: color-mix(in srgb, var(--text) 45%, var(--bg)); background: color-mix(in srgb, var(--bg) 86%, var(--panel)); box-shadow: inset 0 0 0.8rem rgba(0,0,0,0.32); cursor: default; }
  .observatory.tidefall {
    background:
      radial-gradient(ellipse at 50% -8%, rgba(61, 181, 190, 0.16), transparent 38%),
      radial-gradient(ellipse at 18% 52%, rgba(42, 84, 142, 0.11), transparent 42%),
      linear-gradient(180deg, rgba(4, 24, 34, 0.97), rgba(2, 11, 22, 0.975));
    border-color: rgba(88, 222, 216, 0.24);
    box-shadow: 0 24px 80px rgba(0, 7, 16, 0.6), inset 0 1px rgba(185, 255, 242, 0.04);
  }
  .tidefall .title-block > span { color: rgba(88, 222, 216, 0.64); }
  .tidefall h2 { color: #c9fff7; }
  .tidefall .balance { color: #b9fff2; text-shadow: 0 0 16px rgba(88, 222, 216, 0.44); }
  .tidefall .nova { border-color: rgba(73, 190, 195, 0.2); background: linear-gradient(90deg, rgba(27, 91, 119, 0.07), rgba(58, 176, 161, 0.055), rgba(27, 91, 119, 0.07)); }
  .tidefall .nova.ready { border-color: rgba(110, 234, 222, 0.42); box-shadow: inset 0 0 32px rgba(50, 190, 184, 0.1); }
  .tidefall .map {
    margin: 0.2rem 0;
    border: 1px solid rgba(88, 222, 216, 0.1);
    border-radius: 48% 52% 44% 56% / 12% 15% 85% 88%;
    background:
      radial-gradient(ellipse at 50% 53%, transparent 0 10%, rgba(81, 216, 208, 0.035) 10.5% 11%, transparent 11.5% 24%, rgba(70, 174, 199, 0.035) 24.5% 25%, transparent 25.5% 39%, rgba(62, 126, 184, 0.035) 39.5% 40%, transparent 40.5%),
      linear-gradient(180deg, rgba(18, 69, 91, 0.05), rgba(0, 9, 20, 0.18));
  }
  .tidefall .edge { stroke: rgba(98, 213, 216, 0.18); stroke-dasharray: 1.2 1.6; animation: current-drift 7s linear infinite; }
  .tidefall .edge.lit { stroke: rgba(158, 247, 232, 0.76); filter: drop-shadow(0 0 1.5px rgba(88, 222, 216, 0.8)); }
  @keyframes current-drift { to { stroke-dashoffset: -18; } }
  .tidefall .node .halo { fill: rgba(74, 205, 207, 0.065); }
  .tidefall .node .core { fill: #255a72; }
  .tidefall .node text { fill: rgba(151, 219, 220, 0.5); }
  .tidefall .node.owned .core { fill: #d4fff8; filter: drop-shadow(0 0 2px rgba(88, 222, 216, 0.95)); }
  .tidefall .node.owned text { fill: rgba(205, 255, 246, 0.9); }
  .tidefall .node.ready .core { fill: #58ded8; filter: drop-shadow(0 0 2px rgba(88, 222, 216, 0.95)); }
  .tidefall .node.ready text { fill: #b9fff2; }
  .tidefall .node.reachable .core { fill: #367b91; }
  .tidefall .node.selected .halo,
  .tidefall .node:hover .halo { fill: rgba(88, 222, 216, 0.18); }
  .tidefall .detail { border-color: rgba(88, 222, 216, 0.2); background: linear-gradient(110deg, rgba(38, 130, 143, 0.08), rgba(42, 57, 113, 0.06)); }
  .tidefall .detail strong { color: #d8fffb; }
  .tidefall .detail ul { color: #aee6e2; }
  .tidefall .owned-tag { color: rgba(185, 255, 242, 0.76); }
  .tidefall .buy,
  .tidefall .work button { color: #03161b; background: linear-gradient(180deg, #d1fff7, #58ded8); }
  .tidefall .eternal { border-color: rgba(88, 222, 216, 0.22); background: linear-gradient(145deg, rgba(36, 142, 151, 0.09), rgba(40, 61, 132, 0.055)); }
  .tidefall .eternal-head span,
  .tidefall .work-copy small { color: #58ded8; }
  .tidefall .eternal h3,
  .tidefall .work-copy strong { color: #d8fffb; }
  .tidefall .work-glyph { color: #b9fff2; border-color: rgba(88, 222, 216, 0.25); box-shadow: 0 0 14px rgba(88, 222, 216, 0.12); }
  .tidefall .work-copy span { color: #a8ddd9; }
  .tidefall .work-copy b,
  .tidefall .eternal-head > strong { color: #b9fff2; }
  .observatory.verdance,
  .observatory.clockwork,
  .observatory.prismata,
  .observatory.tempest,
  .observatory.canticle {
    border-color: color-mix(in srgb, var(--gold) 22%, transparent);
    box-shadow: 0 24px 80px rgba(0, 0, 0, 0.56), inset 0 1px color-mix(in srgb, var(--gold) 4%, transparent);
  }
  .observatory.verdance {
    background:
      radial-gradient(ellipse at 50% -8%, color-mix(in srgb, var(--amber) 15%, transparent), transparent 38%),
      linear-gradient(180deg, color-mix(in srgb, var(--panel) 96%, #06100a), color-mix(in srgb, var(--panel) 92%, #030905));
  }
  .observatory.clockwork {
    background:
      repeating-linear-gradient(90deg, transparent 0 4.9rem, color-mix(in srgb, var(--gold) 3%, transparent) 4.92rem 4.98rem),
      linear-gradient(180deg, color-mix(in srgb, var(--panel) 97%, #0b0d10), color-mix(in srgb, var(--panel) 92%, #05070a));
  }
  :is(.verdance, .clockwork, .prismata, .tempest, .canticle) .title-block > span,
  :is(.verdance, .clockwork, .prismata, .tempest, .canticle) .eternal-head span,
  :is(.verdance, .clockwork, .prismata, .tempest, .canticle) .work-copy small { color: color-mix(in srgb, var(--amber) 78%, var(--dim)); }
  :is(.verdance, .clockwork, .prismata, .tempest, .canticle) h2,
  :is(.verdance, .clockwork, .prismata, .tempest, .canticle) .balance,
  :is(.verdance, .clockwork, .prismata, .tempest, .canticle) .eternal h3,
  :is(.verdance, .clockwork, .prismata, .tempest, .canticle) .work-copy strong,
  :is(.verdance, .clockwork, .prismata, .tempest, .canticle) .detail strong { color: color-mix(in srgb, var(--gold) 82%, white); }
  :is(.verdance, .clockwork, .prismata, .tempest, .canticle) .balance { text-shadow: 0 0 16px color-mix(in srgb, var(--amber) 42%, transparent); }
  :is(.verdance, .clockwork, .prismata, .tempest, .canticle) .map {
    margin: 0.2rem 0;
    border: 1px solid color-mix(in srgb, var(--gold) 10%, transparent);
    background: radial-gradient(ellipse at center, color-mix(in srgb, var(--amber) 5%, transparent), transparent 56%);
  }
  .verdance .map { border-radius: 52% 48% 58% 42% / 12% 16% 84% 88%; }
  .clockwork .map {
    border-radius: 0.2rem;
    background:
      linear-gradient(90deg, transparent 49.9%, color-mix(in srgb, var(--gold) 8%, transparent) 50%, transparent 50.1%),
      radial-gradient(circle at center, color-mix(in srgb, var(--amber) 6%, transparent), transparent 58%);
  }
  :is(.verdance, .clockwork, .prismata, .tempest, .canticle) .edge { stroke: color-mix(in srgb, var(--amber) 18%, transparent); }
  :is(.verdance, .clockwork, .prismata, .tempest, .canticle) .edge.lit { stroke: color-mix(in srgb, var(--gold) 72%, transparent); filter: drop-shadow(0 0 1.5px color-mix(in srgb, var(--amber) 75%, transparent)); }
  :is(.verdance, .clockwork, .prismata, .tempest, .canticle) .node .halo { fill: color-mix(in srgb, var(--amber) 6%, transparent); }
  :is(.verdance, .clockwork, .prismata, .tempest, .canticle) .node .core { fill: color-mix(in srgb, var(--amber) 32%, var(--bg)); }
  :is(.verdance, .clockwork, .prismata, .tempest, .canticle) .node text { fill: color-mix(in srgb, var(--gold) 46%, transparent); }
  :is(.verdance, .clockwork, .prismata, .tempest, .canticle) .node.owned .core { fill: color-mix(in srgb, var(--gold) 88%, white); filter: drop-shadow(0 0 2px color-mix(in srgb, var(--amber) 88%, transparent)); }
  :is(.verdance, .clockwork, .prismata, .tempest, .canticle) .node.owned text,
  :is(.verdance, .clockwork, .prismata, .tempest, .canticle) .node.ready text { fill: color-mix(in srgb, var(--gold) 88%, white); }
  :is(.verdance, .clockwork, .prismata, .tempest, .canticle) .node.ready .core { fill: var(--amber); filter: drop-shadow(0 0 2px color-mix(in srgb, var(--amber) 92%, transparent)); }
  :is(.verdance, .clockwork, .prismata, .tempest, .canticle) .detail,
  :is(.verdance, .clockwork, .prismata, .tempest, .canticle) .eternal,
  :is(.verdance, .clockwork, .prismata, .tempest, .canticle) .work { border-color: color-mix(in srgb, var(--gold) 18%, transparent); background: color-mix(in srgb, var(--amber) 5%, transparent); }
  :is(.verdance, .clockwork, .prismata, .tempest, .canticle) .detail ul,
  :is(.verdance, .clockwork, .prismata, .tempest, .canticle) .work-copy span { color: color-mix(in srgb, var(--gold) 68%, var(--dim)); }
  :is(.verdance, .clockwork, .prismata, .tempest, .canticle) .work-glyph { color: var(--gold); border-color: color-mix(in srgb, var(--gold) 24%, transparent); }
  :is(.verdance, .clockwork, .prismata, .tempest, .canticle) .work-copy b,
  :is(.verdance, .clockwork, .prismata, .tempest, .canticle) .eternal-head > strong { color: var(--gold); }
  :is(.verdance, .clockwork, .prismata, .tempest, .canticle) .buy,
  :is(.verdance, .clockwork, .prismata, .tempest, .canticle) .work button { color: var(--bg); background: linear-gradient(180deg, color-mix(in srgb, var(--gold) 88%, white), var(--amber)); }
  @media (max-width: 620px) { .work-grid { grid-template-columns: 1fr; } }
</style>

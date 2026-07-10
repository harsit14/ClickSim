<script lang="ts">
  import { onMount } from 'svelte'
  import { CONSTELLATION, nodeAvailable, type StarNode } from '../content/constellation'
  import { describeEffect } from '../content/upgrades'
  import { game, supernovaGain, buyNode, stardustTargetFor } from '../engine/game.svelte'
  import { buyStardustWork, stardustMarketComplete } from '../engine/game.svelte'
  import { format } from '../core/format'
  import { playBuy } from '../audio/sfx'
  import { universeById } from '../content/universes'
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
  const marketComplete = $derived(stardustMarketComplete())
  const tideRate = $derived(universeRateMult(game, now))
  const tideNext = $derived(universeRateMult(game, now + 500))
  const tidePosition = $derived(Math.max(0, Math.min(100, ((tideRate - 0.6) / 0.8) * 100)))
  const tideLabel = $derived(tideRate >= 1.22 ? 'crest' : tideRate <= 0.78 ? 'ebb' : tideNext > tideRate ? 'rising' : 'falling')

  const worldText = (text: string) => text.replaceAll('{currency}', pack.currency.toLowerCase())

  function nodeState(n: StarNode): 'owned' | 'ready' | 'reachable' | 'locked' {
    if (game.constellation.includes(n.id)) return 'owned'
    if (!nodeAvailable(game.constellation, n)) return 'locked'
    return game.stardust >= n.cost ? 'ready' : 'reachable'
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

<section class="observatory" class:tidefall>
  <header>
    <div class="title-block">
      <span>{identity.overline}</span>
      <h2>{identity.title}</h2>
    </div>
    <span class="balance">✧ {game.stardust} <em>stardust</em></span>
    <button bind:this={closeButton} class="close" aria-label={`close ${identity.title}`} onclick={onclose}>✕</button>
  </header>

  {#if tidefall}
    <div class="tide-reading" aria-label={`moonless pull ${tideLabel}, production ×${tideRate.toFixed(2)}`}>
      <div><span>moonless pull</span><strong>{tideLabel}</strong></div>
      <span class="current-track"><i style:left={`${tidePosition}%`}></i></span>
      <b>×{tideRate.toFixed(2)}</b>
    </div>
  {/if}

  <div class="nova" class:ready={gain >= 1}>
    {#if game.challenge}
      <p class="nova-text">{identity.trialWait}</p>
    {:else if game.supernovae === 0 && gain < 1}
      <p class="nova-text">
        {worldText(identity.firstText)} <em>first ✧ at {format(stardustTargetFor(1))} {pack.currency.toLowerCase()} this era ({format(game.eraEarned)} so far)</em>
      </p>
    {:else if gain < 1}
      <p class="nova-text">
        {worldText(identity.needsText)} <em>✧{game.stardustTotal + 1} at
        {format(stardustTargetFor(game.stardustTotal + 1))} {pack.currency.toLowerCase()} this era ({format(game.eraEarned)} so far)</em>
      </p>
    {:else if !armed}
      <p class="nova-text">{identity.readyText}</p>
      <button class="nova-btn" onclick={() => (armed = true)}>{identity.collapseName} &nbsp;·&nbsp; gain ✧{format(gain)}</button>
    {:else}
      <p class="nova-text warn">{worldText(identity.warningText)}</p>
      <div class="confirm">
        <button class="nova-btn go" onclick={() => { armed = false; onsupernova() }}>{identity.goText}</button>
        <button class="nova-btn stay" onclick={() => (armed = false)}>Not yet</button>
      </div>
    {/if}
  </div>

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
        <button class="buy" disabled={state !== 'ready'} onclick={() => tryBuy(selected)}>
          ✧ {selected.cost}
        </button>
      {/if}
    </div>
  {/if}

  <section class="eternal" class:locked={!marketComplete} aria-label="Repeatable Stardust works">
    <div class="eternal-head">
      <div>
        <span>{identity.eternalEyebrow}</span>
        <h3>{identity.eternalTitle}</h3>
      </div>
      {#if marketComplete}<strong>✧ repeats forever</strong>{/if}
    </div>
    {#if marketComplete}
      <p>{identity.eternalIntro}</p>
      <div class="work-grid">
        {#each STARDUST_WORKS as work (work.id)}
          {@const copy = stardustWorkCopy(work, pack.id)}
          {@const rank = workRank(game.stardustWorks, work.id)}
          {@const cost = workCost(work, rank)}
          <article class="work">
            <span class="work-glyph">{work.glyph}</span>
            <div class="work-copy">
              <small>rank {rank}</small>
              <strong>{copy.name}</strong>
              <em>{copy.flavor}</em>
              <span>{copy.effect ?? work.effect}</span>
              <b>{workStatus(work.id)}</b>
            </div>
            <button disabled={!Number.isFinite(cost) || game.stardust < cost} onclick={() => tryBuyWork(work.id)}>
              {Number.isFinite(cost) ? `${identity.workVerb} · ✧ ${cost}` : 'mastered'}
            </button>
          </article>
        {/each}
      </div>
    {:else}
      <p>{identity.eternalEmpty}</p>
    {/if}
  </section>
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

  .nova {
    padding: 0.7rem 0.9rem;
    margin-bottom: 0.6rem;
    border: 1px solid rgba(255, 179, 92, 0.16);
    border-radius: 12px;
    background: rgba(255, 179, 92, 0.04);
    text-align: center;
  }
  .nova.ready {
    border-color: rgba(255, 200, 110, 0.45);
    box-shadow: 0 0 28px rgba(255, 179, 92, 0.12) inset;
  }
  .nova-text {
    margin: 0 0 0.4rem;
    font-family: Georgia, serif;
    font-style: italic;
    font-size: 0.9rem;
    color: rgba(220, 214, 240, 0.85);
  }
  .nova-text em {
    display: block;
    margin-top: 0.2rem;
    font-size: 0.74rem;
    color: var(--dim);
  }
  .nova-text.warn {
    color: #ffcf9e;
  }
  .confirm {
    display: flex;
    gap: 0.5rem;
    justify-content: center;
  }
  .nova-btn {
    padding: 0.45rem 1.3rem;
    font: inherit;
    font-weight: 700;
    color: #1a1206;
    background: linear-gradient(180deg, var(--gold), var(--amber));
    border: none;
    border-radius: 999px;
    cursor: pointer;
    box-shadow: 0 0 24px rgba(255, 179, 92, 0.35);
    transition: transform 0.08s;
  }
  .nova-btn:hover { transform: scale(1.04); }
  .nova-btn.stay {
    background: none;
    color: var(--dim);
    border: 1px solid rgba(255, 255, 255, 0.15);
    box-shadow: none;
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
  .buy:disabled {
    opacity: 0.4;
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
  .work-glyph { width: 1.9rem; height: 1.9rem; display: grid; place-items: center; color: #ffe4ad; border: 1px solid rgba(255, 220, 160, 0.2); border-radius: 50%; box-shadow: 0 0 14px rgba(255, 196, 110, 0.08); }
  .work-copy { min-width: 0; display: flex; flex-direction: column; gap: 0.1rem; }
  .work-copy small { font-size: 0.52rem; letter-spacing: 0.1em; text-transform: uppercase; color: #a99cf0; }
  .work-copy strong { font-size: 0.78rem; color: #eeeaff; }
  .work-copy em { font-family: Georgia, serif; font-size: 0.66rem; line-height: 1.3; color: var(--dim); }
  .work-copy span { font-size: 0.62rem; color: #cfc8f5; }
  .work-copy b { margin-top: 0.1rem; font-size: 0.58rem; font-weight: 650; color: #ffe0a3; }
  .work button { grid-column: 1 / -1; justify-self: start; padding: 0.3rem 0.72rem; font: inherit; font-size: 0.64rem; font-weight: 750; color: #171127; background: linear-gradient(180deg, #e5ddff, #aa9bf0); border: 0; border-radius: 999px; cursor: pointer; }
  .work button:disabled { opacity: 0.38; cursor: default; }
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
  @media (max-width: 620px) { .work-grid { grid-template-columns: 1fr; } }
</style>

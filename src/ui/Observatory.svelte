<script lang="ts">
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

  let {
    onclose,
    onsupernova,
  }: { onclose: () => void; onsupernova: () => void } = $props()

  let selectedId = $state<string | null>(null)
  let armed = $state(false)

  const gain = $derived(supernovaGain())
  const selected = $derived(CONSTELLATION.find((n) => n.id === selectedId) ?? null)
  const pack = $derived(universeById(game.activeUniverse))
  const marketComplete = $derived(stardustMarketComplete())

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

  function describe(n: StarNode): string[] {
    return [...n.effects.map((effect) => describeEffect(effect, pack.generatorById)), ...n.perks.map((p) => p.desc)]
  }
</script>

<section class="observatory">
  <header>
    <h2>The Observatory</h2>
    <span class="balance">✧ {game.stardust} <em>stardust</em></span>
    <button class="close" onclick={onclose}>✕</button>
  </header>

  <div class="nova" class:ready={gain >= 1}>
    {#if game.challenge}
      <p class="nova-text">A trial is underway — the sky waits until it ends.</p>
    {:else if game.supernovae === 0 && gain < 1}
      <p class="nova-text">
        When your {pack.currency.toLowerCase()} has been vast enough, you may let this universe collapse — and keep the
        stardust. <em>first ✧ at {format(stardustTargetFor(1))} {pack.currency.toLowerCase()} this era ({format(game.eraEarned)} so far)</em>
      </p>
    {:else if gain < 1}
      <p class="nova-text">
        The next collapse needs more {pack.currency.toLowerCase()}. <em>✧{game.stardustTotal + 1} at
        {format(stardustTargetFor(game.stardustTotal + 1))} {pack.currency.toLowerCase()} this era ({format(game.eraEarned)} so far)</em>
      </p>
    {:else if !armed}
      <p class="nova-text">Collapse everything. Begin again, brighter.</p>
      <button class="nova-btn" onclick={() => (armed = true)}>Supernova &nbsp;·&nbsp; gain ✧{format(gain)}</button>
    {:else}
      <p class="nova-text warn">All {pack.currency.toLowerCase()}, generators, and upgrades return to the dark. Stardust is forever.</p>
      <div class="confirm">
        <button class="nova-btn go" onclick={() => { armed = false; onsupernova() }}>Let go</button>
        <button class="nova-btn stay" onclick={() => (armed = false)}>Not yet</button>
      </div>
    {/if}
  </div>

  <svg viewBox="0 0 100 74" class="map" class:complete={marketComplete}>
    {#each CONSTELLATION as n (n.id)}
      {#each lineTargets(n) as target (target.id)}
        <line
          x1={n.x} y1={n.y} x2={target.x} y2={target.y}
          class="edge"
          class:lit={game.constellation.includes(n.id) && game.constellation.includes(target.id)}
        />
      {/each}
    {/each}
    {#each CONSTELLATION as n (n.id)}
      {@const state = nodeState(n)}
      <g
        class="node {state}"
        class:selected={selectedId === n.id}
        onclick={() => (selectedId = n.id)}
        onkeydown={(e) => e.key === 'Enter' && (selectedId = n.id)}
        role="button"
        tabindex="0"
      >
        <circle cx={n.x} cy={n.y} r="4.5" class="halo" />
        <circle cx={n.x} cy={n.y} r="1.9" class="core" />
        <text x={n.x} y={n.y + 6.4}>{n.name}</text>
      </g>
    {/each}
  </svg>

  {#if selected}
    {@const state = nodeState(selected)}
    <div class="detail">
      <strong>{selected.name}</strong>
      <em>{selected.flavor}</em>
      <ul>
        {#each describe(selected) as line, i (i)}
          <li>{line}</li>
        {/each}
      </ul>
      {#if state === 'owned'}
        <span class="owned-tag">drawn into your sky</span>
      {:else if state === 'locked'}
        <span class="locked-tag">requires {selected.requires.map((r) => CONSTELLATION.find((m) => m.id === r)?.name).join(' + ')}</span>
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
        <span>after the final constellation</span>
        <h3>The Eternal Observatory</h3>
      </div>
      {#if marketComplete}<strong>✧ repeats forever</strong>{/if}
    </div>
    {#if marketComplete}
      <p>These works consume unspent Stardust. Their ranks survive Supernovas and fold away only during a Deep Collapse.</p>
      <div class="work-grid">
        {#each STARDUST_WORKS as work (work.id)}
          {@const rank = workRank(game.stardustWorks, work.id)}
          {@const cost = workCost(work, rank)}
          <article class="work">
            <span class="work-glyph">{work.glyph}</span>
            <div class="work-copy">
              <small>rank {rank}</small>
              <strong>{work.name}</strong>
              <em>{work.flavor}</em>
              <span>{work.effect}</span>
              <b>{workStatus(work.id)}</b>
            </div>
            <button disabled={!Number.isFinite(cost) || game.stardust < cost} onclick={() => tryBuyWork(work.id)}>
              {Number.isFinite(cost) ? `draw · ✧ ${cost}` : 'mastered'}
            </button>
          </article>
        {/each}
      </div>
    {:else}
      <p>Complete every constellation node. When the sky has no empty place left, Stardust can be drawn into repeatable works.</p>
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
  @media (max-width: 620px) { .work-grid { grid-template-columns: 1fr; } }
</style>

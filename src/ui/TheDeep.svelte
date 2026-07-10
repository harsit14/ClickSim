<script lang="ts">
  import { DEEP_UPGRADES, SINGULARITY_COST } from '../content/deep'
  import { CHALLENGES } from '../content/challenges'
  import {
    game,
    deepCollapseGain,
    performDeepCollapse,
    buyDeepUpgrade,
    buyDeepWork,
    deepMarketComplete,
    startChallenge,
  } from '../engine/game.svelte'
  import { clearBuffs } from '../systems/buffs.svelte'
  import { combo } from '../systems/combo.svelte'
  import { pushToast } from '../systems/toasts.svelte'
  import { save } from '../core/save'
  import { stopMusic } from '../audio/music'
  import { playBuy, playSupernova } from '../audio/sfx'
  import { universeById } from '../content/universes'
  import { format } from '../core/format'
  import {
    DEEP_WORKS,
    deepProductionMult,
    singularityYieldMult,
    workCost,
    workRank,
    type DeepWorkId,
  } from '../content/repeatables'

  let { onclose }: { onclose: () => void } = $props()
  let armed = $state(false)

  const gain = $derived(deepCollapseGain())
  const pack = $derived(universeById(game.activeUniverse))
  const marketComplete = $derived(deepMarketComplete())
  const localize = (text: string) => text
    .replaceAll('✦', pack.currencyGlyph)
    .replaceAll('light', pack.currency.toLowerCase())

  function collapse() {
    armed = false
    const gained = performDeepCollapse()
    if (gained <= 0) return
    clearBuffs()
    combo.streak = 0
    combo.lastRewardAt = 0
    playSupernova()
    save()
    pushToast('The Deep opens', `◉ ${gained} — an era, folded into your hand.`, 'collapse')
  }

  function tryBuy(id: string) {
    if (buyDeepUpgrade(id)) playBuy()
  }

  function tryBuyWork(id: DeepWorkId) {
    if (!buyDeepWork(id)) return
    playBuy()
    save()
  }

  function workStatus(id: DeepWorkId): string {
    const ranks = game.deepWorks
    if (id === 'worldseed-compression') return `current ×${deepProductionMult(ranks).toFixed(0)} · next ×${(deepProductionMult(ranks) * 2).toFixed(0)}`
    return `current +${Math.round((singularityYieldMult(ranks) - 1) * 100)}% · next +${Math.round((singularityYieldMult(ranks) - 0.75) * 100)}%`
  }

  function beginTrial(id: string) {
    if (!startChallenge(id)) return
    clearBuffs()
    combo.streak = 0
    combo.lastRewardAt = 0
    stopMusic()
    save()
    onclose()
  }
</script>

<section class="deep">
  <header>
    <h2>The Deep</h2>
    <span class="balance">◉ {game.singularities} <em>singularit{game.singularities === 1 ? 'y' : 'ies'}</em></span>
    <button class="close" onclick={onclose}>✕</button>
  </header>

  <div class="fold" class:ready={gain >= 1}>
    {#if game.challenge}
      <p class="fold-text">A trial is underway. The deep waits.</p>
    {:else if gain < 1}
      <p class="fold-text">
        Gather stardust; the deep takes eras whole.
        <em>◉1 per ✧{SINGULARITY_COST} gathered this era — ✧{game.stardustTotal} so far</em>
      </p>
    {:else if !armed}
      <p class="fold-text">Fold the era. Stardust, constellation, everything — for ◉.</p>
      <button class="fold-btn" onclick={() => (armed = true)}>Deep Collapse &nbsp;·&nbsp; gain ◉{format(gain)}</button>
    {:else}
      <p class="fold-text warn">
        Your ✧{game.stardustTotal} stardust, every constellation star, and the era's {pack.currency.toLowerCase()} are all taken.
        Singularities — and everything they buy — are forever.
      </p>
      <div class="confirm">
        <button class="fold-btn go" onclick={collapse}>Fold it all</button>
        <button class="fold-btn stay" onclick={() => (armed = false)}>Not yet</button>
      </div>
    {/if}
  </div>

  <h3>Singularity works</h3>
  <div class="shop">
    {#each DEEP_UPGRADES as u (u.id)}
      {@const owned = game.singUpgrades.includes(u.id)}
      <div class="item" class:owned>
        <div class="item-head">
          <strong>{u.name}</strong>
          {#if owned}
            {#if u.id === 'auto-kindler'}
              <label class="toggle"><input type="checkbox" bind:checked={game.autoKindler} /> on</label>
            {:else if u.id === 'auto-stoker'}
              <label class="toggle"><input type="checkbox" bind:checked={game.autoStoker} /> on</label>
            {:else if u.id === 'nova-engine'}
              <label class="toggle">
                <input type="checkbox" bind:checked={game.autoNova} /> at ✧
                <input class="threshold" type="number" min="1" bind:value={game.autoNovaThreshold} />
              </label>
            {:else}
              <span class="held">held</span>
            {/if}
          {:else}
            <button class="buy" disabled={game.singularities < u.cost} onclick={() => tryBuy(u.id)}>
              ◉ {u.cost}
            </button>
          {/if}
        </div>
        <em>{u.flavor}</em>
        <span class="desc">{u.desc}</span>
      </div>
    {/each}
  </div>

  <section class="recursive" class:locked={!marketComplete} aria-label="Repeatable Singularity works">
    <div class="recursive-head">
      <div>
        <span>beyond the finished market</span>
        <h3>The Recursive Works</h3>
      </div>
      {#if marketComplete}<strong>◉ survives collapse</strong>{/if}
    </div>
    {#if marketComplete}
      <p>Singularities can be compressed repeatedly. These ranks survive every Deep Collapse and end only with Remembrance.</p>
      <div class="recursive-grid">
        {#each DEEP_WORKS as work (work.id)}
          {@const rank = workRank(game.deepWorks, work.id)}
          {@const cost = workCost(work, rank)}
          <article class="recursive-work">
            <span class="work-glyph">{work.glyph}</span>
            <div class="work-copy">
              <small>rank {rank}</small>
              <strong>{work.name}</strong>
              <em>{work.flavor}</em>
              <span>{work.effect}</span>
              <b>{workStatus(work.id)}</b>
            </div>
            <button disabled={!Number.isFinite(cost) || game.singularities < cost} onclick={() => tryBuyWork(work.id)}>
              {Number.isFinite(cost) ? `compress · ◉ ${cost}` : 'mastered'}
            </button>
          </article>
        {/each}
      </div>
    {:else}
      <p>Acquire every Singularity work first. Once the market is complete, the Deep begins offering ranks instead of endings.</p>
    {/if}
  </section>

  <h3>Trials</h3>
  <div class="trials">
    {#each CHALLENGES as c (c.id)}
      {@const done = game.challengesDone.includes(c.id)}
      {@const active = game.challenge === c.id}
      <div class="trial" class:done class:active>
        <div class="trial-head">
          <strong>{c.name}</strong>
          {#if done}
            <span class="held">endured</span>
          {:else if active}
            <span class="held">underway</span>
          {:else}
            <button class="buy" disabled={!!game.challenge} onclick={() => beginTrial(c.id)}>begin</button>
          {/if}
        </div>
        <em>{c.flavor}</em>
        <span class="desc">{localize(c.rules)} · goal: {localize(c.goalText)}</span>
        <span class="reward">reward: {localize(c.rewardDesc)}</span>
      </div>
    {/each}
  </div>
</section>

<style>
  .deep {
    position: fixed;
    inset: 3.2rem 0 0 0;
    margin: 0 auto;
    width: min(44rem, 96vw);
    max-height: calc(100vh - 4rem);
    overflow-y: auto;
    padding: 1.1rem 1.4rem 1.4rem;
    background: rgba(6, 5, 12, 0.96);
    border: 1px solid rgba(140, 220, 255, 0.14);
    border-radius: 16px;
    backdrop-filter: blur(14px);
    z-index: 9;
    animation: deep-in 0.5s ease both;
    scrollbar-width: thin;
  }
  @keyframes deep-in {
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
    color: #9fd8ef;
  }
  h3 {
    margin: 1.1rem 0 0.5rem;
    font-size: 0.68rem;
    font-weight: 600;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--dim);
  }
  .balance {
    font-size: 1.05rem;
    font-weight: 650;
    color: #bfeaff;
    text-shadow: 0 0 16px rgba(120, 210, 255, 0.5);
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

  .fold {
    padding: 0.7rem 0.9rem;
    border: 1px solid rgba(140, 220, 255, 0.14);
    border-radius: 12px;
    background: rgba(140, 220, 255, 0.04);
    text-align: center;
  }
  .fold.ready {
    border-color: rgba(140, 220, 255, 0.4);
    box-shadow: 0 0 28px rgba(120, 210, 255, 0.1) inset;
  }
  .fold-text {
    margin: 0 0 0.4rem;
    font-family: Georgia, serif;
    font-style: italic;
    font-size: 0.9rem;
    color: rgba(214, 236, 248, 0.85);
  }
  .fold-text em {
    display: block;
    margin-top: 0.2rem;
    font-size: 0.74rem;
    color: var(--dim);
  }
  .fold-text.warn { color: #ffd7a8; }
  .confirm {
    display: flex;
    gap: 0.5rem;
    justify-content: center;
  }
  .fold-btn {
    padding: 0.45rem 1.3rem;
    font: inherit;
    font-weight: 700;
    color: #06131c;
    background: linear-gradient(180deg, #cfeeff, #7fc8ec);
    border: none;
    border-radius: 999px;
    cursor: pointer;
    box-shadow: 0 0 24px rgba(120, 210, 255, 0.3);
    transition: transform 0.08s;
  }
  .fold-btn:hover { transform: scale(1.04); }
  .fold-btn.stay {
    background: none;
    color: var(--dim);
    border: 1px solid rgba(255, 255, 255, 0.15);
    box-shadow: none;
  }

  .shop, .trials {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.5rem;
  }
  .item, .trial {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
    padding: 0.6rem 0.75rem;
    border: 1px solid rgba(255, 255, 255, 0.07);
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.025);
  }
  .item.owned { border-color: rgba(140, 220, 255, 0.3); }
  .trial.done { border-color: rgba(255, 217, 138, 0.35); }
  .trial.active {
    border-color: rgba(255, 140, 90, 0.5);
    box-shadow: 0 0 18px rgba(255, 120, 70, 0.12);
  }
  .item-head, .trial-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
  }
  .item strong, .trial strong { font-size: 0.9rem; color: var(--text); }
  .item em, .trial em {
    font-family: Georgia, serif;
    font-size: 0.75rem;
    color: var(--dim);
  }
  .desc { font-size: 0.74rem; color: #a9c9d8; }
  .reward { font-size: 0.74rem; color: var(--gold); }
  .buy {
    padding: 0.2rem 0.7rem;
    font: inherit;
    font-size: 0.78rem;
    font-weight: 700;
    color: #06131c;
    background: linear-gradient(180deg, #cfeeff, #7fc8ec);
    border: none;
    border-radius: 999px;
    cursor: pointer;
  }
  .buy:disabled { opacity: 0.35; cursor: default; }
  .held {
    font-size: 0.72rem;
    font-style: italic;
    color: rgba(140, 220, 255, 0.75);
  }
  .toggle {
    display: flex;
    align-items: center;
    gap: 0.3rem;
    font-size: 0.74rem;
    color: #a9c9d8;
  }
  .toggle input[type='checkbox'] { accent-color: #7fc8ec; }
  .threshold {
    width: 3.2rem;
    padding: 0.1rem 0.3rem;
    font: inherit;
    font-size: 0.74rem;
    color: var(--text);
    background: rgba(0, 0, 0, 0.4);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 6px;
  }
  .recursive {
    margin-top: 0.75rem;
    padding: 0.85rem;
    border: 1px solid rgba(140, 220, 255, 0.2);
    border-radius: 13px;
    background: linear-gradient(145deg, rgba(75, 177, 218, 0.075), rgba(68, 55, 125, 0.07));
  }
  .recursive.locked { opacity: 0.58; }
  .recursive-head { display: flex; align-items: flex-end; justify-content: space-between; gap: 1rem; }
  .recursive-head span { display: block; margin-bottom: 0.16rem; font-size: 0.54rem; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #80c9eb; }
  .recursive h3 { margin: 0; font-family: Georgia, serif; font-size: 1rem; font-weight: 500; letter-spacing: 0; text-transform: none; color: #d9f2ff; }
  .recursive-head > strong { font-size: 0.62rem; color: #9fdcf4; }
  .recursive > p { margin: 0.45rem 0 0; font-family: Georgia, serif; font-size: 0.74rem; font-style: italic; color: var(--dim); }
  .recursive-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; margin-top: 0.7rem; }
  .recursive-work { display: grid; grid-template-columns: auto minmax(0, 1fr); gap: 0.55rem; padding: 0.7rem; border: 1px solid rgba(140, 220, 255, 0.14); border-radius: 10px; background: rgba(2, 8, 13, 0.34); }
  .work-glyph { width: 1.9rem; height: 1.9rem; display: grid; place-items: center; color: #c5efff; border: 1px solid rgba(140, 220, 255, 0.2); border-radius: 50%; box-shadow: 0 0 14px rgba(105, 210, 255, 0.08); }
  .work-copy { min-width: 0; display: flex; flex-direction: column; gap: 0.1rem; }
  .work-copy small { font-size: 0.52rem; letter-spacing: 0.1em; text-transform: uppercase; color: #80c9eb; }
  .work-copy strong { font-size: 0.78rem; color: #e5f6ff; }
  .work-copy em { font-family: Georgia, serif; font-size: 0.66rem; line-height: 1.3; color: var(--dim); }
  .work-copy span { font-size: 0.62rem; color: #a9d2e4; }
  .work-copy b { margin-top: 0.1rem; font-size: 0.58rem; font-weight: 650; color: #9fe3ff; }
  .recursive-work button { grid-column: 1 / -1; justify-self: start; padding: 0.3rem 0.72rem; font: inherit; font-size: 0.64rem; font-weight: 750; color: #06131c; background: linear-gradient(180deg, #d6f3ff, #80c9eb); border: 0; border-radius: 999px; cursor: pointer; }
  .recursive-work button:disabled { opacity: 0.38; cursor: default; }
  @media (max-width: 720px) {
    .shop, .trials, .recursive-grid { grid-template-columns: 1fr; }
  }
</style>

<script lang="ts">
  import { ACHIEVEMENTS } from '../content/achievements'
  import { universeById } from '../content/universes'
  import { genRate } from '../engine/compute'
  import {
    game,
    ratePerSec,
    passiveRatePerSec,
    activeRatePerSec,
    recentClickRatePerSec,
    clickPower,
    critChance,
    critMult,
  } from '../engine/game.svelte'
  import { format } from '../core/format'
  import {
    deepProductionMult,
    singularityYieldMult,
    stardustProductionMult,
    stardustYieldMult,
    workRank,
  } from '../content/repeatables'

  let { onclose }: { onclose: () => void } = $props()
  let view = $state<'stats' | 'achievements'>('stats')

  const pack = $derived(universeById(game.activeUniverse))
  const rate = $derived(ratePerSec())
  const passiveRate = $derived(passiveRatePerSec())
  const activeRate = $derived(activeRatePerSec())
  const clickRate = $derived(recentClickRatePerSec())
  const unlocked = $derived(new Set(game.achievements))
  const achievementRows = $derived(
    ACHIEVEMENTS.map((a) => ({
      ...a,
      unlocked: unlocked.has(a.id),
      concealed: a.hidden && !unlocked.has(a.id),
    })),
  )
  const stardustRanks = $derived(Object.values(game.stardustWorks).reduce((sum, rank) => sum + rank, 0))
  const deepRanks = $derived(Object.values(game.deepWorks).reduce((sum, rank) => sum + rank, 0))
  const rows = $derived(
    pack.generators.filter((g) => (game.owned[g.id] ?? 0) > 0).map((g) => ({
      g,
      owned: game.owned[g.id] ?? 0,
      rate: genRate(game, g),
    })),
  )

  function fmtTime(sec: number): string {
    const h = Math.floor(sec / 3600)
    const m = Math.floor((sec % 3600) / 60)
    const s = Math.floor(sec % 60)
    return h > 0 ? `${h}h ${m}m` : m > 0 ? `${m}m ${s}s` : `${s}s`
  }
</script>

<section class="panel">
  <header>
    <h2>A Way to Remember</h2>
    <button class="close" onclick={onclose}>✕</button>
  </header>

  <div class="tabs" role="tablist" aria-label="memory view">
    <button class:active={view === 'stats'} role="tab" aria-selected={view === 'stats'} onclick={() => (view = 'stats')}>
      Stats
    </button>
    <button
      class:active={view === 'achievements'}
      role="tab"
      aria-selected={view === 'achievements'}
      onclick={() => (view = 'achievements')}
    >
      Achievements
    </button>
  </div>

  {#if view === 'stats'}
    <dl>
      <dt>universe</dt><dd>{pack.shortName}</dd>
      <dt>{pack.currency.toLowerCase()}</dt><dd>{pack.currencyGlyph} {format(game.light)}</dd>
      <dt>ever earned here</dt><dd>{pack.currencyGlyph} {format(game.totalEarned)}</dd>
      <dt>active {pack.currency.toLowerCase()} / second</dt><dd>{format(activeRate)}</dd>
      <dt>passive {pack.currency.toLowerCase()} / second</dt><dd>{format(passiveRate)}</dd>
      {#if clickRate > 0}
        <dt>recent clicks / second</dt><dd>{format(clickRate)}</dd>
      {/if}
      <dt>per click</dt><dd>{format(clickPower())}</dd>
      <dt>critical clicks</dt><dd>{game.crits}</dd>
      <dt>crit chance</dt><dd>{Math.round(critChance() * 100)}% ×{critMult()}</dd>
      <dt>clicks</dt><dd>{format(game.clicks)}</dd>
      <dt>upgrades found</dt><dd>{game.upgrades.length}</dd>
      <dt>objects catalogued</dt><dd>{game.curiosities.length}</dd>
      <dt>radiance</dt><dd>+{game.achievements.length}%</dd>
      <dt>stars caught</dt><dd>{game.starsCaught}</dd>
      <dt>best combo</dt><dd>{game.bestCombo}</dd>
      <dt>time kindling</dt><dd>{fmtTime(game.playtime)}</dd>
      {#if game.remembrances > 0}
        <dt>remembrances</dt><dd>{game.remembrances}</dd>
        <dt>memory glow</dt><dd>×{Math.pow(2, game.remembrances)}</dd>
      {/if}
      {#if game.vesselParts.length > 0}
        <dt>vessel parts</dt><dd>{game.vesselParts.length} / 5</dd>
      {/if}
      {#if game.beacons.length > 0}
        <dt>beacons lit</dt><dd>{game.beacons.length}</dd>
        <dt>Dark Between</dt><dd>◆ {game.darkBetween}</dd>
        <dt>Wayfinder laws</dt><dd>{game.wayfinder.length}</dd>
      {/if}
      {#if game.supernovae > 0}
        <dt>supernovae</dt><dd>{game.supernovae}</dd>
        <dt>stardust glow</dt><dd>+{game.stardustTotal * 2}%</dd>
        <dt>{pack.currency.toLowerCase()}, all lifetimes</dt><dd>{pack.currencyGlyph} {format(game.allTimeEarned)}</dd>
      {/if}
      {#if stardustRanks > 0}
        <dt>continuing corona</dt><dd>rank {workRank(game.stardustWorks, 'continuing-corona')} · ×{format(stardustProductionMult(game.stardustWorks))}</dd>
        <dt>parallax engine</dt><dd>rank {workRank(game.stardustWorks, 'parallax-engine')} · +{Math.round((stardustYieldMult(game.stardustWorks) - 1) * 100)}%</dd>
      {/if}
      {#if game.collapses > 0}
        <dt>deep collapses</dt><dd>{game.collapses}</dd>
        <dt>singularities</dt><dd>◉ {game.singTotal}</dd>
      {/if}
      {#if deepRanks > 0}
        <dt>worldseed compression</dt><dd>rank {workRank(game.deepWorks, 'worldseed-compression')} · ×{format(deepProductionMult(game.deepWorks))}</dd>
        <dt>recursive abyss</dt><dd>rank {workRank(game.deepWorks, 'recursive-abyss')} · +{Math.round((singularityYieldMult(game.deepWorks) - 1) * 100)}%</dd>
      {/if}
      {#if game.challengesDone.length > 0}
        <dt>trials endured</dt><dd>{game.challengesDone.length} / 6</dd>
      {/if}
    </dl>

    {#if rows.length > 0}
      <h3>{pack.currency} sources</h3>
      <table>
        <tbody>
          {#each rows as r (r.g.id)}
            <tr>
              <td class="gname"><span class="dot" style:--hue={r.g.hue}></span>{r.g.name}</td>
              <td class="num">{r.owned}</td>
              <td class="num">{format(r.rate)}/s</td>
              <td class="num dim">{rate > 0 ? ((r.rate / rate) * 100).toFixed(0) + '%' : '—'}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    {/if}
  {:else}
    <div class="achievement-summary">
      <strong>{game.achievements.length} / {ACHIEVEMENTS.length}</strong>
      <span>Radiance +{game.achievements.length}%</span>
    </div>
    <div class="achievement-list">
      {#each achievementRows as a (a.id)}
        <article class="achievement" class:unlocked={a.unlocked} class:locked={!a.unlocked}>
          <span class="mark">{a.unlocked ? '✦' : '·'}</span>
          <span class="achievement-text">
            <strong>{a.concealed ? 'Hidden achievement' : a.name}</strong>
            <em>{a.concealed ? 'The dark is keeping this one.' : a.flavor}</em>
          </span>
          <span class="reward">+1%</span>
        </article>
      {/each}
    </div>
  {/if}
</section>

<style>
  .panel {
    position: fixed;
    top: 50%;
    left: 1.25rem;
    transform: translateY(-50%);
    width: 19rem;
    max-height: 80vh;
    overflow-y: auto;
    padding: 1rem 1.1rem;
    background: var(--panel);
    border: 1px solid rgba(255, 179, 92, 0.14);
    border-radius: 14px;
    backdrop-filter: blur(10px);
    z-index: 6;
    animation: panel-in 0.5s ease both;
    scrollbar-width: thin;
  }
  @keyframes panel-in {
    from { opacity: 0; transform: translateY(-50%) translateX(-14px); }
    to { opacity: 1; transform: translateY(-50%) translateX(0); }
  }
  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.8rem;
  }
  .tabs {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.3rem;
    margin-bottom: 0.85rem;
    padding: 0.18rem;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.07);
    border-radius: 8px;
  }
  .tabs button {
    padding: 0.34rem 0.2rem;
    font: inherit;
    font-size: 0.76rem;
    font-weight: 650;
    color: var(--dim);
    background: transparent;
    border: none;
    border-radius: 6px;
    cursor: pointer;
  }
  .tabs button.active {
    color: #1a1206;
    background: var(--amber);
  }
  h2, h3 {
    margin: 0;
    font-size: 0.72rem;
    font-weight: 600;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: var(--dim);
  }
  h3 {
    margin: 1rem 0 0.5rem;
  }
  .close {
    background: none;
    border: none;
    color: var(--dim);
    font-size: 0.9rem;
    cursor: pointer;
  }
  dl {
    display: grid;
    grid-template-columns: auto auto;
    gap: 0.3rem 1rem;
    margin: 0;
    font-size: 0.85rem;
  }
  dt {
    color: var(--dim);
  }
  dd {
    margin: 0;
    text-align: right;
    font-variant-numeric: tabular-nums;
    color: var(--gold);
  }
  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.82rem;
  }
  td {
    padding: 0.22rem 0;
  }
  .gname {
    display: flex;
    align-items: center;
    gap: 0.45rem;
  }
  .dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: hsl(var(--hue), 90%, 65%);
    box-shadow: 0 0 6px hsla(var(--hue), 90%, 65%, 0.7);
  }
  .num {
    text-align: right;
    font-variant-numeric: tabular-nums;
  }
  .dim {
    color: var(--dim);
  }
  .achievement-summary {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 0.8rem;
    margin-bottom: 0.65rem;
    font-size: 0.82rem;
  }
  .achievement-summary strong {
    color: var(--gold);
    font-variant-numeric: tabular-nums;
  }
  .achievement-summary span {
    color: var(--dim);
    font-variant-numeric: tabular-nums;
  }
  .achievement-list {
    display: flex;
    flex-direction: column;
    gap: 0.42rem;
  }
  .achievement {
    display: grid;
    grid-template-columns: 1rem minmax(0, 1fr) auto;
    gap: 0.55rem;
    align-items: start;
    padding: 0.55rem 0.6rem;
    background: rgba(255, 255, 255, 0.035);
    border: 1px solid rgba(255, 255, 255, 0.065);
    border-radius: 8px;
  }
  .achievement.unlocked {
    background: rgba(255, 179, 92, 0.08);
    border-color: rgba(255, 179, 92, 0.22);
  }
  .achievement.locked {
    opacity: 0.62;
  }
  .mark {
    color: var(--amber);
    font-size: 0.95rem;
    line-height: 1.1rem;
    text-align: center;
  }
  .achievement-text {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
  }
  .achievement-text strong {
    font-size: 0.82rem;
    color: var(--text);
  }
  .achievement-text em {
    font-family: Georgia, serif;
    font-size: 0.74rem;
    line-height: 1.25;
    color: var(--dim);
  }
  .reward {
    color: var(--gold);
    font-size: 0.76rem;
    font-weight: 650;
    font-variant-numeric: tabular-nums;
  }
  @media (max-width: 720px) {
    .panel {
      left: 0.6rem;
      right: 0.6rem;
      width: auto;
      top: 8.2rem;
      bottom: 0.6rem;
      transform: none;
      max-height: none;
      z-index: 10;
    }
  }
</style>

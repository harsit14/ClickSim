<script lang="ts">
  import { onMount } from 'svelte'
  import { ACHIEVEMENTS, achievementDisplay } from '../content/achievements'
  import { universeById } from '../content/universes'
  import { vesselBlueprint, vesselPartIdsFor } from '../content/vessel'
  import { clickFormula, genRate, rateFormula } from '../engine/compute'
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
  import { renderHealth } from '../core/render-health.svelte'
  import { clickBuffMult, productionBuffMult } from '../systems/buffs.svelte'
  import { criticalCadenceForChance } from '../systems/critical-click'
  import {
    LIFETIME_SINGULARITY_PRODUCTION_BONUS,
    LIFETIME_SINGULARITY_STARDUST_BONUS,
    STARDUST_PRODUCTION_BONUS_PER_POINT,
    achievementPowerPercent,
  } from '../content/economy-balance'
  import FormulaInspector from './FormulaInspector.svelte'
  import {
    ONE_AMOUNT,
    addAmounts,
    amountToNumber,
    divideAmounts,
    isZeroAmount,
    multiplyAmountByNumber,
  } from '../core/numeric/amount'

  let { onclose }: { onclose: () => void } = $props()
  let closeButton: HTMLButtonElement
  let view = $state<'stats' | 'achievements'>('stats')
  let inspectedAt = $state(Date.now())

  onMount(() => {
    closeButton.focus()
    const timer = setInterval(() => (inspectedAt = Date.now()), 500)
    return () => clearInterval(timer)
  })

  const pack = $derived(universeById(game.activeUniverse))
  const currentCritChance = $derived(critChance())
  const criticalCadence = $derived(criticalCadenceForChance(currentCritChance))
  const localVessel = $derived(vesselBlueprint(game.activeUniverse))
  const localVesselParts = $derived(vesselPartIdsFor(game))
  const rate = $derived(ratePerSec(inspectedAt))
  const passiveRate = $derived(passiveRatePerSec(inspectedAt))
  const activeRate = $derived(activeRatePerSec(inspectedAt))
  const clickRate = $derived(recentClickRatePerSec())
  const passiveBreakdown = $derived(rateFormula(game, inspectedAt, productionBuffMult()))
  const clickBreakdown = $derived(clickFormula(game, productionBuffMult(), inspectedAt, clickBuffMult()))
  const unlocked = $derived(new Set(game.achievements))
  const achievementRows = $derived(
    ACHIEVEMENTS.map((a) => ({
      ...a,
      ...achievementDisplay(a, pack.id),
      unlocked: unlocked.has(a.id),
      concealed: a.hidden && !unlocked.has(a.id),
    })),
  )
  const stardustRanks = $derived(Object.values(game.stardustWorks).reduce((sum, rank) => sum + rank, 0))
  const deepRanks = $derived(Object.values(game.deepWorks).reduce((sum, rank) => sum + rank, 0))
  const achievementPercent = $derived(achievementPowerPercent(game.achievements.length))
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

<section class="panel instrument-panel" aria-labelledby="stats-title">
  <header>
    <h2 id="stats-title">A Way to Remember</h2>
    <button bind:this={closeButton} class="close" aria-label="close stats" onclick={onclose}>✕</button>
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
      <dt>realm</dt><dd>{pack.shortName}</dd>
      <dt>{pack.currency.toLowerCase()}</dt><dd>{pack.currencyGlyph} {format(game.light)}</dd>
      <dt>ever earned here</dt><dd>{pack.currencyGlyph} {format(game.totalEarned)}</dd>
      <dt>active {pack.currency.toLowerCase()} / second</dt><dd>{format(activeRate)}</dd>
      <dt>passive {pack.currency.toLowerCase()} / second</dt><dd>{format(passiveRate)}</dd>
      {#if !isZeroAmount(clickRate)}
        <dt>recent clicks / second</dt><dd>{format(clickRate)}</dd>
      {/if}
      <dt>per click</dt><dd>{format(clickPower())}</dd>
      <dt>critical clicks</dt><dd>{game.crits}</dd>
      {#if pack.twist.randomnessAllowed}
        <dt>crit chance</dt><dd>{Math.round(currentCritChance * 100)}% ×{critMult()}</dd>
      {:else}
        <dt>crit cadence</dt><dd>1 in {criticalCadence ?? '—'} clicks ×{critMult()}</dd>
      {/if}
      <dt>clicks</dt><dd>{format(game.clicks)}</dd>
      <dt>upgrades found</dt><dd>{game.upgrades.length}</dd>
      <dt>objects catalogued</dt><dd>{game.curiosities.length}</dd>
      <dt>{pack.achievementPower.toLowerCase()}</dt><dd>+{achievementPercent}%</dd>
      <dt>stars caught</dt><dd>{game.starsCaught}</dd>
      <dt>best combo</dt><dd>{game.bestCombo}</dd>
      <dt>time kindling</dt><dd>{fmtTime(game.playtime)}</dd>
      <dt>render profile</dt><dd>{renderHealth.profile}{renderHealth.degraded ? ' · auto-protected' : ''}</dd>
      {#if renderHealth.fps > 0}
        <dt>recent canvas FPS</dt><dd>{renderHealth.fps.toFixed(0)}</dd>
      {/if}
      {#if game.remembrances > 0}
        <dt>remembrances</dt><dd>{game.remembrances}</dd>
        <dt>memory glow</dt><dd>×{Math.pow(2, game.remembrances)}</dd>
      {/if}
      {#if localVesselParts.length > 0 || game.beacons.length > 0}
        <dt>{localVessel.name.toLowerCase()}</dt><dd>{localVesselParts.length} / 5 local parts</dd>
      {/if}
      {#if game.beacons.length > 0}
        <dt>beacons lit</dt><dd>{game.beacons.length}</dd>
        <dt>Dark Between</dt><dd>◆ {format(game.darkBetween)}</dd>
        <dt>Wayfinder laws</dt><dd>{game.wayfinder.length}</dd>
      {/if}
      {#if game.supernovae > 0}
        <dt>supernovae</dt><dd>{game.supernovae}</dd>
        <dt>stardust glow</dt><dd>+{format(multiplyAmountByNumber(game.stardustTotal, STARDUST_PRODUCTION_BONUS_PER_POINT * 100))}%</dd>
        <dt>{pack.currency.toLowerCase()}, all lifetimes</dt><dd>{pack.currencyGlyph} {format(game.allTimeEarned)}</dd>
      {/if}
      {#if stardustRanks > 0}
        <dt>continuing corona</dt><dd>rank {workRank(game.stardustWorks, 'continuing-corona')} · ×{format(stardustProductionMult(game.stardustWorks))}</dd>
        <dt>parallax engine</dt><dd>rank {workRank(game.stardustWorks, 'parallax-engine')} · +{Math.round((stardustYieldMult(game.stardustWorks) - 1) * 100)}%</dd>
      {/if}
      {#if game.collapses > 0}
        <dt>deep collapses</dt><dd>{game.collapses}</dd>
        <dt>singularities</dt><dd>◉ {format(game.singTotal)}</dd>
        <dt>singularity afterglow</dt><dd>×{format(addAmounts(ONE_AMOUNT, multiplyAmountByNumber(game.singTotal, LIFETIME_SINGULARITY_PRODUCTION_BONUS)))}</dd>
        <dt>stardust depth scale</dt><dd>×{format(addAmounts(ONE_AMOUNT, multiplyAmountByNumber(game.singTotal, LIFETIME_SINGULARITY_STARDUST_BONUS)))}</dd>
      {/if}
      {#if deepRanks > 0}
        <dt>worldseed compression</dt><dd>rank {workRank(game.deepWorks, 'worldseed-compression')} · ×{format(deepProductionMult(game.deepWorks))}</dd>
        <dt>recursive abyss</dt><dd>rank {workRank(game.deepWorks, 'recursive-abyss')} · +{Math.round((singularityYieldMult(game.deepWorks) - 1) * 100)}%</dd>
      {/if}
      {#if game.challengesDone.length > 0}
        <dt>trials endured</dt><dd>{game.challengesDone.length} / 12</dd>
      {/if}
    </dl>

    <FormulaInspector breakdowns={[passiveBreakdown, clickBreakdown]} />

    {#if rows.length > 0}
      <h3>{pack.currency} sources</h3>
      <table>
        <tbody>
          {#each rows as r (r.g.id)}
            <tr>
              <td class="gname"><span class="dot" style:--hue={r.g.hue}></span>{r.g.name}</td>
              <td class="num">{r.owned}</td>
              <td class="num">{format(r.rate)}/s</td>
              <td class="num dim">{!isZeroAmount(rate) ? (amountToNumber(divideAmounts(r.rate, rate)) * 100).toFixed(0) + '%' : '—'}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    {/if}
  {:else}
    <div class="achievement-summary">
      <strong>{game.achievements.length} / {ACHIEVEMENTS.length}</strong>
      <span>{pack.achievementPower} +{achievementPercent}%</span>
    </div>
    <div class="achievement-list">
      {#each achievementRows as a (a.id)}
        <article class="achievement" class:unlocked={a.unlocked} class:locked={!a.unlocked}>
          <span class="mark">{a.unlocked ? '✦' : '·'}</span>
          <span class="achievement-text">
            <strong>{a.concealed ? 'Hidden achievement' : a.name}</strong>
            <em>{a.concealed ? 'The dark is keeping this one.' : a.flavor}</em>
          </span>
          <span class="reward">world power point</span>
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
    animation: panel-in 0.24s ease both;
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
  @media (max-width: 800px) {
    .panel {
      left: 0.6rem;
      right: 0.6rem;
      width: auto;
      top: max(5.5rem, env(safe-area-inset-top, 0px));
      bottom: calc(var(--mobile-dock-height, 4.35rem) + 0.5rem);
      transform: none;
      max-height: none;
      z-index: 10;
      /* The shared panel-in keyframes hold translateY(-50%) for the desktop
         centered position; on mobile that would shove the panel (and its
         header/close) off the top of the screen. Use a plain fade instead. */
      animation: panel-in-mobile 0.2s ease both;
    }
    @keyframes panel-in-mobile {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  }
</style>

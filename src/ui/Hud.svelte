<script lang="ts">
  import { onMount } from 'svelte'
  import { game, activeRatePerSec, hasUi, recentClickRatePerSec } from '../engine/game.svelte'
  import { universeRateMult } from '../engine/compute'
  import { universeById, universeV2ById } from '../content/universes'
  import {
    VERDANCE_COHORT_LABELS,
    verdanceCohortRuntimeSummary,
    type VerdanceCohortStageId,
  } from '../content/universes/verdance'
  import { format } from '../core/format'
  import { isZeroAmount } from '../core/numeric/amount'

  let now = $state(Date.now())
  const pack = $derived(universeById(game.activeUniverse))
  const epochMatter = $derived(universeV2ById(game.activeUniverse)?.economy.localPrestige.rewardCurrency)
  const epochMatterGlyph = $derived(epochMatter?.glyph ?? '✧')
  const epochMatterName = $derived(epochMatter?.localName ?? 'Stardust')
  const rate = $derived(activeRatePerSec(now))
  const clickRate = $derived(recentClickRatePerSec())
  const tidefall = $derived(pack.id === 'tidefall')
  const verdance = $derived(pack.id === 'verdance')
  const tide = $derived(universeRateMult(game, now))
  const tideNext = $derived(universeRateMult(game, now + 500))
  const tideLabel = $derived(
    tide >= 1.25 ? 'high tide' : tide <= 0.75 ? 'low tide' : tideNext > tide ? 'tide rising' : 'tide falling',
  )
  const tidePosition = $derived(Math.max(0, Math.min(100, ((tide - 0.6) / 0.8) * 100)))
  const growthStages: readonly VerdanceCohortStageId[] = [
    'u3-cohort-new',
    'u3-cohort-rooted',
    'u3-cohort-mature',
    'u3-cohort-ancient',
  ]
  const growth = $derived(verdanceCohortRuntimeSummary(
    pack.generators.map(({ id }) => id),
    game.owned,
    game.numericLawState,
  ))
  const growthDescription = $derived(growthStages.map((stageId) => (
    `${VERDANCE_COHORT_LABELS[stageId]} ${growth.stageQuantities[stageId]}`
  )).join(', '))

  onMount(() => {
    const timer = setInterval(() => (now = Date.now()), 250)
    return () => clearInterval(timer)
  })
</script>

{#if hasUi('counter')}
  <div class="hud">
    <div class="light"><span class="star">{pack.currencyGlyph}</span>{format(game.light)}</div>
    {#if !isZeroAmount(rate)}
      <div class="rate" class:active={!isZeroAmount(clickRate)}>{format(rate)} {pack.currency.toLowerCase()} /s</div>
    {/if}
    {#if tidefall}
      <div class="tide" aria-label={`${tideLabel}, production ×${tide.toFixed(2)}`}>
        <span>{tideLabel}</span>
        <span class="tide-track" aria-hidden="true"><i style:left={`${tidePosition}%`}></i></span>
        <strong>×{tide.toFixed(2)}</strong>
      </div>
    {:else if verdance && growth.totalQuantity > 0}
      <div class="growth" aria-label={`${growth.dominantStageLabel} growth. ${growthDescription}. Cohort production ×${growth.multiplier.toFixed(2)}`}>
        <span>{growth.dominantStageLabel} growth</span>
        <span class="growth-track" aria-hidden="true">
          {#each growthStages as stageId}
            {@const quantity = growth.stageQuantities[stageId]}
            <i
              class:present={quantity > 0}
              style={`--share:${growth.totalQuantity > 0 ? quantity / growth.totalQuantity : 0}`}
              title={`${VERDANCE_COHORT_LABELS[stageId]} · ${quantity}`}
            ></i>
          {/each}
        </span>
        <strong>×{growth.multiplier.toFixed(2)}</strong>
      </div>
    {/if}
    {#if !isZeroAmount(game.stardustTotal) || !isZeroAmount(game.singTotal)}
      <div class="dust" aria-label={`${format(game.stardust)} ${epochMatterName}`}>
        {epochMatterGlyph} {format(game.stardust)}{#if !isZeroAmount(game.singTotal)}&nbsp;&nbsp;<span class="sing">◉ {format(game.singularities)}</span>{/if}
      </div>
    {/if}
  </div>
{/if}

<style>
  .hud {
    text-align: center;
    animation: fade-in 1.6s ease both;
    pointer-events: none;
  }
  .light {
    font-size: 2.1rem;
    font-weight: 650;
    letter-spacing: 0;
    font-variant-numeric: tabular-nums;
    color: var(--gold);
    text-shadow: 0 0 24px rgba(255, 179, 92, 0.35);
  }
  .star {
    font-size: 1.3rem;
    margin-right: 0.4rem;
    vertical-align: 0.2rem;
    color: var(--amber);
  }
  .rate {
    margin-top: 0.15rem;
    font-size: 0.85rem;
    color: var(--dim);
    font-variant-numeric: tabular-nums;
    animation: fade-in-plain 1s ease both;
  }
  .rate.active {
    color: #b1f5ff;
    text-shadow: 0 0 16px rgba(105, 235, 255, 0.25);
  }
  .dust {
    margin-top: 0.15rem;
    font-size: 0.8rem;
    color: #c9c1f2;
    text-shadow: 0 0 12px rgba(170, 150, 255, 0.35);
    font-variant-numeric: tabular-nums;
    animation: fade-in-plain 1s ease both;
  }
  .tide {
    width: 13rem;
    display: grid;
    grid-template-columns: 4.2rem 1fr 2.6rem;
    align-items: center;
    gap: 0.45rem;
    margin: 0.35rem auto 0;
    font-size: 0.58rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: rgba(160, 224, 228, 0.76);
  }
  .tide > span:first-child { text-align: right; }
  .tide strong { text-align: left; font-size: 0.62rem; color: #b9fff2; font-variant-numeric: tabular-nums; }
  .tide-track {
    position: relative;
    height: 2px;
    background: linear-gradient(90deg, rgba(85, 121, 164, 0.35), rgba(91, 230, 220, 0.7), rgba(203, 245, 255, 0.8));
    border-radius: 999px;
  }
  .tide-track i {
    position: absolute;
    top: 50%;
    width: 0.42rem;
    height: 0.42rem;
    transform: translate(-50%, -50%);
    background: #d8fffb;
    border-radius: 50%;
    box-shadow: 0 0 10px rgba(91, 230, 220, 0.8);
  }
  .growth {
    width: 13rem;
    display: grid;
    grid-template-columns: 4.8rem 1fr 2.6rem;
    align-items: center;
    gap: 0.45rem;
    margin: 0.35rem auto 0;
    color: color-mix(in srgb, var(--gold) 72%, var(--dim));
    font-size: 0.58rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
  .growth > span:first-child { text-align: right; }
  .growth strong { color: var(--gold); font-size: 0.62rem; text-align: left; font-variant-numeric: tabular-nums; }
  .growth-track {
    height: 0.54rem;
    display: flex;
    align-items: center;
    gap: 0.12rem;
  }
  .growth-track i {
    width: calc(0.22rem + var(--share) * 2.4rem);
    min-width: 0.22rem;
    height: 0.22rem;
    border: 1px solid color-mix(in srgb, var(--gold) 20%, transparent);
    border-radius: 65% 35% 65% 35%;
    opacity: 0.28;
    transform: rotate(-16deg);
  }
  .growth-track i.present {
    height: 0.48rem;
    background: linear-gradient(135deg, color-mix(in srgb, var(--amber) 82%, transparent), color-mix(in srgb, var(--gold) 60%, transparent));
    border-color: color-mix(in srgb, var(--gold) 56%, transparent);
    box-shadow: 0 0 0.6rem color-mix(in srgb, var(--amber) 38%, transparent);
    opacity: 1;
  }
  .sing {
    color: #9fd8ef;
    text-shadow: 0 0 12px rgba(120, 210, 255, 0.35);
  }
  @keyframes fade-in {
    from { opacity: 0; transform: translateY(-6px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes fade-in-plain {
    from { opacity: 0; }
    to { opacity: 1; }
  }
</style>

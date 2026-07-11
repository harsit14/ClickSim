<script lang="ts">
  import { CHALLENGE_BY_ID } from '../content/challenges'
  import { game, endChallenge } from '../engine/game.svelte'
  import { format } from '../core/format'
  import { save } from '../core/save'
  import {
    amountToNumber,
    divideAmounts,
    minAmount,
    toAmount,
  } from '../core/numeric/amount'

  const trial = $derived(game.challenge ? CHALLENGE_BY_ID.get(game.challenge) : null)
  const progress = $derived(trial ? trial.progress(game) : null)
  const progressCurrent = $derived(progress ? toAmount(progress.current) : null)
  const progressTarget = $derived(progress ? toAmount(progress.target) : null)
  const progressShown = $derived(progressCurrent && progressTarget ? minAmount(progressCurrent, progressTarget) : null)
  const progressPercent = $derived(
    progressShown && progressTarget
      ? Math.min(100, amountToNumber(divideAmounts(progressShown, progressTarget)) * 100)
      : 0,
  )

  function abandon() {
    if (!confirm('Abandon the trial? Your previous run returns, and no reward is earned.')) return
    endChallenge(false)
    save()
  }
</script>

{#if trial && progress && progressShown && progressTarget}
  <div class="banner instrument-panel">
    <span class="name">{trial.name}</span>
    <span class="goal">
      {format(progressShown)} / {format(progressTarget)}
    </span>
    <span class="bar"><span class="fill" style:width={progressPercent + '%'}></span></span>
    <button class="abandon" onclick={abandon} title="Abandon the trial">✕</button>
  </div>
{/if}

<style>
  .banner {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    padding: 0.35rem 0.5rem 0.35rem 0.9rem;
    background: rgba(30, 12, 8, 0.85);
    border: 1px solid rgba(255, 140, 90, 0.4);
    border-radius: 999px;
    box-shadow: 0 0 22px rgba(255, 120, 70, 0.18);
    animation: banner-in 0.5s ease both;
    pointer-events: auto;
  }
  @keyframes banner-in {
    from { opacity: 0; transform: translateY(-8px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .name {
    font-size: 0.82rem;
    font-weight: 700;
    color: #ffbfa0;
  }
  .goal {
    font-size: 0.76rem;
    color: var(--dim);
    font-variant-numeric: tabular-nums;
  }
  .bar {
    width: 6rem;
    height: 0.35rem;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.08);
    overflow: hidden;
  }
  .fill {
    display: block;
    height: 100%;
    background: linear-gradient(90deg, #ff9c6b, #ffd98a);
    transition: width 0.3s ease;
  }
  .abandon {
    width: 1.5rem;
    height: 1.5rem;
    display: grid;
    place-items: center;
    font-size: 0.75rem;
    color: var(--dim);
    background: none;
    border: none;
    cursor: pointer;
  }
  .abandon:hover { color: #ffbfa0; }
  @media (max-width: 720px) {
    .banner {
      max-width: calc(100vw - 1rem);
      gap: 0.45rem;
      padding-left: 0.7rem;
    }
    .bar {
      width: min(5rem, 22vw);
    }
  }
</style>

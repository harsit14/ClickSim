<script lang="ts">
  import { CHALLENGE_BY_ID } from '../content/challenges'
  import { universeById } from '../content/universes'
  import { challengeCopy } from '../content/universe-progression'
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
  const copy = $derived(trial ? challengeCopy(trial, universeById(game.activeUniverse)) : null)
  const progress = $derived(trial ? trial.progress(game) : null)
  const progressCurrent = $derived(progress ? toAmount(progress.current) : null)
  const progressTarget = $derived(progress ? toAmount(progress.target) : null)
  const progressShown = $derived(progressCurrent && progressTarget ? minAmount(progressCurrent, progressTarget) : null)
  const progressPercent = $derived(
    progressShown && progressTarget
      ? Math.min(100, amountToNumber(divideAmounts(progressShown, progressTarget)) * 100)
      : 0,
  )
  const nextAction = $derived.by(() => {
    if (!trial) return ''
    if (trial.mods.gensDisabled) return 'First: use the Heart. Production sources are inactive here.'
    if (trial.mods.noUpgrades) return 'First: use the Heart, then buy the first affordable production source.'
    if (trial.mods.clickScale !== undefined && trial.mods.clickScale < 0.1) return 'First: buy a production source; the Heart is greatly weakened here.'
    return 'First: use the Heart, then buy the first affordable production source.'
  })

  function abandon() {
    if (!confirm('Abandon the trial? Your previous run returns, and no reward is earned.')) return
    endChallenge(false)
    save()
  }
</script>

{#if trial && progress && progressShown && progressTarget}
  <div class="banner instrument-panel" aria-label={`Active trial: ${copy?.name ?? trial.name}`}>
    <div class="summary">
      <span class="name">{copy?.name ?? trial.name}</span>
      <span class="goal"><b>Goal:</b> {copy?.goalText ?? trial.goalText} · {format(progressShown)} / {format(progressTarget)}</span>
      <span class="bar" role="progressbar" aria-label={`${copy?.goalText ?? trial.goalText} progress`} aria-valuemin="0" aria-valuemax="100" aria-valuenow={Math.round(progressPercent)}><span class="fill" style:width={progressPercent + '%'}></span></span>
    </div>
    <p><strong>Rule:</strong> {copy?.rules ?? trial.rules} <em>{nextAction}</em></p>
    <button class="abandon" onclick={abandon} title="Abandon the trial" aria-label={`Abandon ${copy?.name ?? trial.name} and restore the previous run`}>✕</button>
  </div>
{/if}

<style>
  .banner {
    position: relative;
    width: min(34rem, calc(100vw - 2rem));
    box-sizing: border-box;
    display: grid;
    gap: 0.28rem;
    padding: 0.48rem 2.4rem 0.48rem 0.75rem;
    background: rgba(30, 12, 8, 0.85);
    border: 1px solid rgba(255, 140, 90, 0.4);
    border-radius: 0.75rem;
    box-shadow: 0 0 22px rgba(255, 120, 70, 0.18);
    animation: banner-in 0.24s ease both;
    pointer-events: auto;
  }
  .summary { display: grid; grid-template-columns: auto 1fr 6rem; align-items: center; gap: 0.55rem; }
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
  .goal b { color: #ffbfa0; }
  p { margin: 0; color: color-mix(in srgb, var(--gold) 78%, white); font-size: 0.6875rem; line-height: 1.35; }
  p strong { color: #ffbfa0; }
  p em { margin-left: 0.3rem; color: var(--dim); font-style: normal; }
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
    position: absolute;
    right: 0.55rem;
    top: 50%;
    transform: translateY(-50%);
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
      padding-left: 0.7rem;
    }
    .summary { grid-template-columns: auto 1fr; }
    .bar { grid-column: 1 / -1; width: 100%; }
  }
</style>

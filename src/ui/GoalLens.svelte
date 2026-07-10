<script lang="ts">
  import {
    buildGoalLensUiModel,
    nextGoalPin,
    type GoalLensPresentationMode,
  } from '../experience/goal-lens-ui'
  import type { GoalLensInput, GoalRecommendation } from '../experience/goals'
  import type { DurationFormatter, UiTextResolver } from '../experience/ui-text'

  interface Props {
    id: string
    goals: GoalLensInput
    presentationMode: GoalLensPresentationMode
    resolveText: UiTextResolver
    formatDuration: DurationFormatter
    onpinchange: (goalId: string | null) => void
    ondisable: () => void
  }

  let {
    id,
    goals,
    presentationMode,
    resolveText,
    formatDuration,
    onpinchange,
    ondisable,
  }: Props = $props()

  const model = $derived(buildGoalLensUiModel({ goals, presentationMode }))
  const titleId = $derived(`${id}-title`)

  function goalLabel(recommendation: GoalRecommendation): string {
    return recommendation.labelKey
      ? resolveText(recommendation.labelKey)
      : resolveText('goal-lens.goal-unavailable', { id: recommendation.goalId })
  }

  function choosePin(goalId: string) {
    onpinchange(nextGoalPin(goals.pinnedGoalId ?? null, goalId))
  }
</script>

{#if model.visibility === 'collapsed'}
  <aside
    class="goal-lens collapsed reduced-motion-safe"
    aria-label={resolveText('goal-lens.title')}
    data-state="active-rhythm-collapsed"
  >
    <strong>{resolveText('goal-lens.title')}</strong>
    <span>{resolveText('goal-lens.collapsed-active-rhythm')}</span>
  </aside>
{:else if model.visibility === 'expanded'}
  <section
    class="goal-lens expanded reduced-motion-safe"
    aria-labelledby={titleId}
    data-state={model.result.status}
  >
    <header>
      <h2 id={titleId}>{resolveText('goal-lens.title')}</h2>
      <button
        type="button"
        class="off"
        aria-label={resolveText('goal-lens.turn-off-label')}
        onclick={ondisable}
      >{resolveText('goal-lens.turn-off')}</button>
    </header>

    {#if model.result.status === 'empty'}
      <p class="empty" role="status">{resolveText('goal-lens.no-recommendation')}</p>
    {:else}
      <div class="slots">
        {#each model.slots as slot (slot.id)}
          <article class="slot" data-slot={slot.id}>
            <h3>{resolveText(slot.labelKey)}</h3>
            {#if slot.recommendation}
              {@const recommendation = slot.recommendation}
              {@const label = goalLabel(recommendation)}
              <p class="goal-name">{label}</p>
              <p class="reason">
                {resolveText(
                  recommendation.candidateReasonKey ?? `goal-lens.reason.${recommendation.reason}`,
                  recommendation.reasonParameters,
                )}
              </p>
              {#if recommendation.estimate?.estimatedSeconds !== null && recommendation.estimate?.estimatedSeconds !== undefined}
                <p class="estimate">
                  <span>{formatDuration(recommendation.estimate.estimatedSeconds * 1_000)}</span>
                  <span>{resolveText(recommendation.estimate.detailKey)}</span>
                </p>
              {:else}
                <p class="estimate">{resolveText('goal-lens.estimate-unavailable')}</p>
              {/if}
              <button
                type="button"
                class="pin"
                aria-pressed={goals.pinnedGoalId === recommendation.goalId}
                aria-label={resolveText(
                  goals.pinnedGoalId === recommendation.goalId
                    ? 'goal-lens.unpin-label'
                    : 'goal-lens.pin-label',
                  { goal: label },
                )}
                onclick={() => choosePin(recommendation.goalId)}
              >
                {resolveText(
                  goals.pinnedGoalId === recommendation.goalId
                    ? 'goal-lens.unpin'
                    : 'goal-lens.pin',
                )}
              </button>
            {:else}
              <p class="empty-slot">{resolveText('goal-lens.slot-empty')}</p>
            {/if}
          </article>
        {/each}
      </div>
    {/if}
  </section>
{/if}

<style>
  .goal-lens {
    color: var(--text, #f6efe3);
    background: rgba(11, 12, 22, 0.92);
    border: 1px solid currentColor;
    border-radius: 0.75rem;
  }
  .collapsed {
    display: flex;
    align-items: baseline;
    gap: 0.65rem;
    padding: 0.45rem 0.7rem;
    font-size: 0.8rem;
  }
  .collapsed span,
  .reason,
  .estimate,
  .empty-slot,
  .empty {
    color: var(--dim, #c4bdaf);
  }
  .expanded { padding: 0.75rem; }
  header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
  }
  h2, h3, p { margin: 0; }
  h2 { font-size: 0.9rem; }
  h3 {
    font-size: 0.68rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
  .slots {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0.5rem;
    margin-top: 0.65rem;
  }
  .slot {
    min-width: 0;
    padding: 0.65rem;
    border: 1px solid rgba(255, 255, 255, 0.28);
    border-radius: 0.55rem;
  }
  .goal-name {
    margin-top: 0.35rem;
    font-weight: 700;
  }
  .reason,
  .estimate,
  .empty-slot {
    margin-top: 0.3rem;
    font-size: 0.75rem;
  }
  .estimate {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem 0.5rem;
  }
  button {
    min-height: 2.25rem;
    padding: 0.35rem 0.6rem;
    font: inherit;
    color: inherit;
    background: transparent;
    border: 1px solid currentColor;
    border-radius: 0.4rem;
    cursor: pointer;
  }
  button:focus-visible { outline: 3px solid currentColor; outline-offset: 2px; }
  .off { font-size: 0.72rem; }
  .pin { margin-top: 0.55rem; width: 100%; }
  .pin[aria-pressed='true']::before { content: '✓ '; }
  .empty { padding: 0.75rem 0 0.25rem; }
  @media (max-width: 720px) {
    .slots { grid-template-columns: 1fr; }
  }
  @media (prefers-reduced-motion: reduce) {
    .reduced-motion-safe, .reduced-motion-safe * {
      animation: none !important;
      transition: none !important;
    }
  }
</style>

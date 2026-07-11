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
    universeId: string
    goals: GoalLensInput
    presentationMode: GoalLensPresentationMode
    resolveText: UiTextResolver
    formatDuration: DurationFormatter
    onpinchange: (goalId: string | null) => void
    ondisable: () => void
  }

  let {
    id,
    universeId,
    goals,
    presentationMode,
    resolveText,
    formatDuration,
    onpinchange,
    ondisable,
  }: Props = $props()
  let disclosed = $state(false)

  const model = $derived(buildGoalLensUiModel({ goals, presentationMode }))
  const titleId = $derived(`${id}-title`)
  const chartId = $derived(`${id}-chart`)
  const primaryRecommendation = $derived(model.result.now ?? model.result.soon ?? model.result.pinned)
  const stoppingRecommendation = $derived(model.result.soon ?? model.result.now)
  const lensGlyph = $derived(
    universeId === 'tidefall' ? '≈'
      : universeId === 'verdance' ? '❧'
        : universeId === 'clockwork' ? '⌁'
          : universeId === 'prismata' ? '✤'
            : universeId === 'tempest' ? '≈'
              : universeId === 'canticle' ? '◌'
                : '✦',
  )

  function goalLabel(recommendation: GoalRecommendation): string {
    return recommendation.labelKey
      ? resolveText(recommendation.labelKey)
      : resolveText('goal-lens.goal-unavailable', { id: recommendation.goalId })
  }

  function estimateLabel(recommendation: GoalRecommendation): string {
    const seconds = recommendation.estimate?.estimatedSeconds
    return seconds === null || seconds === undefined
      ? resolveText('goal-lens.estimate-unavailable')
      : formatDuration(seconds * 1_000)
  }

  function choosePin(goalId: string) {
    onpinchange(nextGoalPin(goals.pinnedGoalId ?? null, goalId))
  }
</script>

{#if model.visibility === 'collapsed'}
  <aside
    class="goal-lens instrument-panel rhythm-state reduced-motion-safe"
    data-universe={universeId}
    aria-label={resolveText('goal-lens.title')}
    data-state="active-rhythm-collapsed"
  >
    <span class="sigil" aria-hidden="true">{lensGlyph}</span>
    <span class="rhythm-copy">
      <strong>{resolveText('goal-lens.title')}</strong>
      <small>{resolveText('goal-lens.collapsed-active-rhythm')}</small>
    </span>
  </aside>
{:else if model.visibility === 'expanded'}
  <section
    class="goal-lens instrument-panel reduced-motion-safe"
    class:disclosed
    aria-labelledby={titleId}
    data-universe={universeId}
    data-state={model.result.status}
  >
    <button
      type="button"
      class="summary"
      aria-expanded={disclosed}
      aria-controls={chartId}
      aria-label={resolveText(disclosed ? 'goal-lens.close-label' : 'goal-lens.open-label')}
      onclick={() => (disclosed = !disclosed)}
    >
      <span class="sigil" aria-hidden="true">{lensGlyph}</span>
      <span class="summary-copy">
        <span class="eyebrow" id={titleId}>{resolveText('goal-lens.title')}</span>
        {#if primaryRecommendation}
          <strong>{goalLabel(primaryRecommendation)}</strong>
          <small>{estimateLabel(primaryRecommendation)}</small>
        {:else}
          <strong>{resolveText('goal-lens.no-recommendation')}</strong>
        {/if}
      </span>
      <span class="disclosure-mark" aria-hidden="true">{disclosed ? '−' : '+'}</span>
    </button>

    {#if disclosed}
      <div class="chart" id={chartId}>
        <header>
          <span>{resolveText('goal-lens.chart-label')}</span>
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
                  <div class="slot-copy">
                    <p class="goal-name">{label}</p>
                    <p class="reason">
                      {resolveText(
                        recommendation.candidateReasonKey ?? `goal-lens.reason.${recommendation.reason}`,
                        recommendation.reasonParameters,
                      )}
                    </p>
                  </div>
                  <p class="estimate">
                    <strong>{estimateLabel(recommendation)}</strong>
                    {#if recommendation.estimate}
                      <span>{resolveText(recommendation.estimate.detailKey)}</span>
                    {/if}
                  </p>
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
                    <span aria-hidden="true">{goals.pinnedGoalId === recommendation.goalId ? '◆' : '◇'}</span>
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

        <p class="stopping-point">
          <span aria-hidden="true">◇</span>
          {stoppingRecommendation
            ? resolveText('goal-lens.stopping-point', { goal: goalLabel(stoppingRecommendation) })
            : resolveText('goal-lens.stopping-point-now')}
        </p>
      </div>
    {/if}
  </section>
{/if}

<style>
  .goal-lens {
    --lens-accent: var(--gold, #ffd98a);
    --lens-warm: var(--amber, #ffb35c);
    position: relative;
    width: min(22rem, calc(100vw - 2rem));
    color: var(--text, #f6efe3);
    background:
      radial-gradient(circle at 1.65rem 50%, color-mix(in srgb, var(--lens-warm) 11%, transparent), transparent 28%),
      linear-gradient(105deg, color-mix(in srgb, var(--panel) 78%, #06070d), color-mix(in srgb, var(--panel) 91%, transparent));
    border: 1px solid color-mix(in srgb, var(--lens-accent) 22%, transparent);
    border-radius: 0.25rem 1rem 1rem 0.25rem;
    box-shadow: 0 0.8rem 2.8rem rgba(0, 0, 0, 0.2), inset 2px 0 var(--lens-warm);
    backdrop-filter: blur(16px);
    overflow: hidden;
  }
  .goal-lens[data-universe='tidefall'] {
    border-radius: 1.1rem 0.35rem 1.1rem 0.35rem;
    background:
      radial-gradient(ellipse at 12% 50%, color-mix(in srgb, var(--lens-warm) 14%, transparent), transparent 34%),
      linear-gradient(105deg, color-mix(in srgb, var(--panel) 72%, #031018), color-mix(in srgb, var(--panel) 92%, transparent));
  }
  .goal-lens[data-universe='verdance'] {
    border-radius: 1.15rem 0.35rem 1.3rem 0.4rem;
    background:
      radial-gradient(ellipse at 8% 50%, color-mix(in srgb, var(--lens-warm) 15%, transparent), transparent 32%),
      linear-gradient(105deg, color-mix(in srgb, var(--panel) 80%, #07150c), color-mix(in srgb, var(--panel) 92%, transparent));
    box-shadow: 0 0.8rem 2.8rem rgba(0, 0, 0, 0.2), inset 2px 0 color-mix(in srgb, var(--lens-warm) 78%, transparent);
  }
  .goal-lens[data-universe='clockwork'] {
    border-radius: 0.2rem 0.8rem 0.2rem 0.8rem;
    background:
      repeating-linear-gradient(90deg, transparent 0 2.8rem, color-mix(in srgb, var(--lens-accent) 4%, transparent) 2.82rem 2.88rem),
      linear-gradient(105deg, color-mix(in srgb, var(--panel) 84%, #0c0d10), color-mix(in srgb, var(--panel) 94%, transparent));
  }
  .goal-lens[data-universe='prismata'] { border-radius: 0.15rem; clip-path: polygon(1.5% 0, 98.5% 0, 100% 50%, 98.5% 100%, 1.5% 100%, 0 50%); }
  .goal-lens[data-universe='tempest'] { border-radius: 1.2rem; background: repeating-radial-gradient(ellipse at 8% 50%, transparent 0 0.8rem, color-mix(in srgb, var(--lens-warm) 4%, transparent) 0.84rem 0.88rem, transparent 0.92rem 1.5rem), linear-gradient(105deg, color-mix(in srgb, var(--panel) 84%, #07102d), color-mix(in srgb, var(--panel) 93%, transparent)); }
  .goal-lens[data-universe='canticle'] { border-radius: 50% / 18%; background: repeating-radial-gradient(ellipse at 8% 50%, transparent 0 0.8rem, color-mix(in srgb, var(--lens-warm) 5%, transparent) 0.84rem 0.9rem, transparent 0.96rem 1.5rem), linear-gradient(105deg, color-mix(in srgb, var(--panel) 84%, #120713), color-mix(in srgb, var(--panel) 94%, transparent)); }
  .goal-lens::after {
    content: '';
    position: absolute;
    left: 3.25rem;
    right: 1rem;
    bottom: 0;
    height: 1px;
    background: linear-gradient(90deg, var(--lens-warm), transparent);
    opacity: 0.34;
    pointer-events: none;
  }
  .goal-lens[data-universe='tidefall']::after {
    height: 0.35rem;
    border-top: 1px solid color-mix(in srgb, var(--lens-accent) 36%, transparent);
    border-radius: 50%;
    background: transparent;
  }
  .goal-lens[data-universe='verdance']::after {
    height: 0.5rem;
    border-top: 1px solid color-mix(in srgb, var(--lens-accent) 34%, transparent);
    border-radius: 50%;
    background: transparent;
  }
  .goal-lens[data-universe='clockwork']::after {
    left: 3.6rem;
    height: 1px;
    background: repeating-linear-gradient(90deg, var(--lens-warm) 0 0.25rem, transparent 0.25rem 0.48rem);
  }
  .summary {
    width: 100%;
    min-height: 4.15rem;
    display: grid;
    grid-template-columns: 2.35rem minmax(0, 1fr) 1.5rem;
    align-items: center;
    gap: 0.7rem;
    padding: 0.62rem 0.75rem 0.62rem 0.7rem;
    color: inherit;
    background: transparent;
    border: 0;
    text-align: left;
    cursor: pointer;
  }
  .sigil {
    position: relative;
    width: 2.2rem;
    aspect-ratio: 1;
    display: grid;
    place-items: center;
    color: var(--lens-accent);
    border: 1px solid color-mix(in srgb, var(--lens-accent) 44%, transparent);
    border-radius: 50%;
    box-shadow: 0 0 1rem color-mix(in srgb, var(--lens-warm) 20%, transparent);
    font-size: 1rem;
  }
  [data-universe='tidefall'] .sigil {
    border-radius: 55% 45% 55% 45%;
    transform: rotate(-8deg);
  }
  [data-universe='verdance'] .sigil {
    border-radius: 60% 40% 60% 40%;
    transform: rotate(-8deg);
  }
  [data-universe='verdance'] .sigil::after {
    content: '';
    position: absolute;
    width: 1px;
    height: 1.25rem;
    background: color-mix(in srgb, var(--lens-accent) 42%, transparent);
    transform: rotate(38deg);
  }
  [data-universe='clockwork'] .sigil {
    border-radius: 50%;
    outline: 1px dashed color-mix(in srgb, var(--lens-accent) 22%, transparent);
    outline-offset: 0.18rem;
  }
  [data-universe='prismata'] .sigil { border-radius: 0; transform: rotate(45deg); }
  [data-universe='tempest'] .sigil { border-radius: 50%; border-left-style: dashed; border-right-style: dashed; }
  [data-universe='canticle'] .sigil { border-style: dashed; transform: scaleX(1.16); }
  .summary-copy,
  .rhythm-copy {
    min-width: 0;
    display: grid;
    gap: 0.12rem;
  }
  .eyebrow,
  h3,
  header > span {
    color: color-mix(in srgb, var(--lens-accent) 72%, var(--dim));
    font-size: 0.59rem;
    font-weight: 720;
    letter-spacing: 0.15em;
    text-transform: uppercase;
  }
  .summary-copy strong {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 0.83rem;
    font-weight: 660;
  }
  .summary-copy small,
  .rhythm-copy small {
    color: var(--dim, #c4bdaf);
    font-size: 0.68rem;
  }
  .disclosure-mark {
    color: var(--lens-accent);
    font-size: 1.1rem;
    opacity: 0.72;
  }
  .stopping-point {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 0.45rem;
    align-items: start;
    margin: 0.7rem 0 0;
    padding-top: 0.62rem;
    color: var(--dim, #c4bdaf);
    border-top: 1px solid color-mix(in srgb, var(--lens-accent) 16%, transparent);
    font: 420 0.68rem/1.4 var(--font-interface, system-ui, sans-serif);
  }
  .stopping-point span { color: var(--lens-accent); }
  .chart {
    padding: 0.15rem 0.75rem 0.75rem 3.75rem;
    animation: chart-reveal 160ms ease-out both;
  }
  header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.8rem;
    padding: 0.25rem 0 0.45rem;
  }
  h3, p { margin: 0; }
  .slots { display: grid; }
  .slot {
    min-width: 0;
    display: grid;
    grid-template-columns: 5.8rem minmax(0, 1fr) auto;
    gap: 0.25rem 0.65rem;
    align-items: center;
    padding: 0.58rem 0;
    border-top: 1px solid color-mix(in srgb, var(--lens-accent) 13%, transparent);
  }
  .slot h3 { grid-column: 1; }
  .slot-copy { grid-column: 2; min-width: 0; }
  .goal-name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 0.76rem;
    font-weight: 680;
  }
  .reason,
  .estimate span,
  .empty-slot,
  .empty {
    color: var(--dim, #c4bdaf);
    font-size: 0.65rem;
  }
  .reason { margin-top: 0.1rem; line-height: 1.28; }
  .estimate {
    grid-column: 1 / 3;
    display: flex;
    flex-wrap: wrap;
    gap: 0.15rem 0.45rem;
    padding-left: 6.45rem;
    color: color-mix(in srgb, var(--lens-accent) 72%, white);
    font-size: 0.65rem;
  }
  .estimate strong { font-weight: 650; }
  button { font: inherit; }
  button:focus-visible { outline: 2px solid var(--lens-accent); outline-offset: -3px; }
  .off,
  .pin {
    color: color-mix(in srgb, var(--lens-accent) 76%, var(--text));
    background: transparent;
    border: 1px solid color-mix(in srgb, var(--lens-accent) 24%, transparent);
    border-radius: 999px;
    cursor: pointer;
  }
  .off { padding: 0.22rem 0.48rem; font-size: 0.61rem; }
  .pin {
    grid-column: 3;
    grid-row: 1 / span 2;
    display: inline-flex;
    align-items: center;
    gap: 0.28rem;
    padding: 0.3rem 0.48rem;
    font-size: 0.61rem;
  }
  .pin[aria-pressed='true'] {
    color: #080b12;
    background: color-mix(in srgb, var(--lens-accent) 78%, white);
  }
  .empty,
  .empty-slot { padding: 0.55rem 0; }
  .rhythm-state {
    width: max-content;
    max-width: min(20rem, calc(100vw - 2rem));
    display: flex;
    align-items: center;
    gap: 0.62rem;
    padding: 0.48rem 0.68rem;
  }
  .rhythm-state .sigil { width: 1.75rem; }
  .rhythm-copy strong { font-size: 0.72rem; }
  @keyframes chart-reveal {
    from { opacity: 0; transform: translateY(-0.35rem); }
    to { opacity: 1; transform: translateY(0); }
  }
  @media (prefers-reduced-motion: reduce) {
    .reduced-motion-safe,
    .reduced-motion-safe * { animation: none !important; transition: none !important; }
  }
</style>

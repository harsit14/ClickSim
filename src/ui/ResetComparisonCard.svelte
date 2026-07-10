<script lang="ts">
  import { onMount } from 'svelte'
  import {
    buildResetComparisonCardModel,
    describeResetCardDecision,
    type ResetCardDecision,
  } from '../experience/reset-comparison-ui'
  import type { ResetComparison } from '../experience/reset-comparison'
  import type { FocusReturnDescriptor } from '../accessibility/focus'
  import type { DurationFormatter, UiTextResolver } from '../experience/ui-text'

  interface Props {
    id: string
    comparison: ResetComparison
    confirmFocusReturn: FocusReturnDescriptor
    cancelFocusReturn: FocusReturnDescriptor
    resolveText: UiTextResolver
    formatDuration: DurationFormatter
    ondecision: (decision: ResetCardDecision) => void
  }

  let {
    id,
    comparison,
    confirmFocusReturn,
    cancelFocusReturn,
    resolveText,
    formatDuration,
    ondecision,
  }: Props = $props()

  let cancelButton: HTMLButtonElement
  let confirmButton: HTMLButtonElement
  const model = $derived(buildResetComparisonCardModel(comparison))
  const titleId = $derived(`${id}-title`)
  const descriptionId = $derived(`${id}-description`)

  onMount(() => cancelButton.focus({ preventScroll: true }))

  function decide(action: 'confirm' | 'cancel') {
    ondecision(describeResetCardDecision(
      comparison,
      action,
      action === 'confirm' ? confirmFocusReturn : cancelFocusReturn,
    ))
  }

  function onDialogKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      event.preventDefault()
      event.stopPropagation()
      decide('cancel')
      return
    }
    if (event.key !== 'Tab') return
    if (event.shiftKey && event.target === cancelButton) {
      event.preventDefault()
      confirmButton.focus({ preventScroll: true })
    } else if (!event.shiftKey && event.target === confirmButton) {
      event.preventDefault()
      cancelButton.focus({ preventScroll: true })
    }
  }
</script>

<div class="scrim reduced-motion-safe">
  <div
    class="reset-card"
    class:destructive={comparison.kind === 'destructive'}
    role="dialog"
    tabindex="-1"
    aria-modal="true"
    aria-labelledby={titleId}
    aria-describedby={descriptionId}
    onkeydown={onDialogKeydown}
  >
    <header>
      <span>{resolveText('reset-comparison.eyebrow')}</span>
      <h2 id={titleId}>{resolveText(model.actionLabelKey)}</h2>
      <p id={descriptionId}>{resolveText(model.resultKey)}</p>
    </header>

    <div class="comparison-grid">
      {#each model.sections as section (section.id)}
        {#if section.items.length > 0}
          <section class="impact" data-impact={section.id} aria-labelledby={`${id}-${section.id}`}>
            <h3 id={`${id}-${section.id}`}>{resolveText(section.labelKey)}</h3>
            <ul>
              {#each section.items as item (item.id)}
                <li>
                  <span class="state-word">{resolveText(`reset.state.${section.id}`)}</span>
                  <span>{resolveText(item.labelKey)}</span>
                </li>
              {/each}
            </ul>
          </section>
        {/if}
      {/each}
    </div>

    <section class="recovery" aria-labelledby={`${id}-recovery`}>
      <h3 id={`${id}-recovery`}>{resolveText('reset.recovery.title')}</h3>
      {#if model.recovery.status === 'estimated' && model.recovery.inputs}
        <dl>
          <div><dt>{resolveText('reset.recovery.current-rate')}</dt><dd>{model.recovery.inputs.currentFrontierRate}</dd></div>
          <div><dt>{resolveText('reset.recovery.starting-rate')}</dt><dd>{model.recovery.inputs.postBoundaryStartingRate}</dd></div>
          <div><dt>{resolveText('reset.recovery.recovered-rate')}</dt><dd>{model.recovery.inputs.projectedRecoveredRate}</dd></div>
          <div>
            <dt>{resolveText('reset.recovery.estimated-time')}</dt>
            <dd>{formatDuration(model.recovery.inputs.estimatedRecoveryMs ?? 0)}</dd>
          </div>
          <div>
            <dt>{resolveText('reset.recovery.basis')}</dt>
            <dd>{resolveText(`reset.recovery.basis.${model.recovery.inputs.basis}`)}</dd>
          </div>
        </dl>
        <p>{resolveText(model.recovery.inputs.detailKey)}</p>
      {:else}
        <p>{resolveText(`reset.recovery.${model.recovery.status}`, { reason: model.recovery.reason })}</p>
      {/if}
    </section>

    {#if model.requiresExplicitConfirmation}
      <p class="confirmation-note">{resolveText('reset.confirmation.explicit-required')}</p>
    {/if}
    <footer>
      <button bind:this={cancelButton} type="button" class="cancel" onclick={() => decide('cancel')}>
        {resolveText('reset.action.cancel')}
      </button>
      <button bind:this={confirmButton} type="button" class="confirm" onclick={() => decide('confirm')}>
        {resolveText('reset.action.confirm', { action: resolveText(model.actionLabelKey) })}
      </button>
    </footer>
  </div>
</div>

<style>
  .scrim {
    position: fixed;
    inset: 0;
    z-index: 20;
    display: grid;
    place-items: center;
    padding: 1rem;
    background: rgba(2, 3, 8, 0.78);
  }
  .reset-card {
    width: min(54rem, 100%);
    max-height: calc(100vh - 2rem);
    overflow: auto;
    padding: 1rem;
    color: var(--text, #f6efe3);
    background: var(--panel, #11131f);
    border: 2px solid currentColor;
    border-radius: 0.85rem;
  }
  .reset-card.destructive { border-style: double; border-width: 4px; }
  header span {
    font-size: 0.7rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
  h2, h3, p { margin: 0; }
  h2 { margin-top: 0.2rem; }
  header p, .recovery p { margin-top: 0.4rem; color: var(--dim, #c4bdaf); }
  .comparison-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.65rem;
    margin-top: 1rem;
  }
  .impact, .recovery {
    padding: 0.75rem;
    border: 1px solid rgba(255, 255, 255, 0.32);
    border-radius: 0.55rem;
  }
  .impact h3, .recovery h3 { font-size: 0.82rem; }
  ul { margin: 0.55rem 0 0; padding: 0; list-style: none; }
  li { display: flex; gap: 0.45rem; margin-top: 0.3rem; }
  .state-word {
    flex: none;
    font-size: 0.65rem;
    font-weight: 800;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }
  .recovery { margin-top: 0.65rem; }
  dl { margin: 0.5rem 0 0; }
  dl div {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    padding: 0.25rem 0;
  }
  dt { color: var(--dim, #c4bdaf); }
  dd { margin: 0; font-variant-numeric: tabular-nums; }
  .confirmation-note { margin-top: 0.75rem; font-weight: 700; }
  footer {
    display: flex;
    justify-content: flex-end;
    gap: 0.6rem;
    margin-top: 1rem;
  }
  button {
    min-height: 2.75rem;
    padding: 0.5rem 1rem;
    font: inherit;
    color: inherit;
    background: transparent;
    border: 2px solid currentColor;
    border-radius: 0.45rem;
    cursor: pointer;
  }
  button:focus-visible { outline: 3px solid currentColor; outline-offset: 3px; }
  .confirm { font-weight: 800; }
  @media (max-width: 720px) {
    .comparison-grid { grid-template-columns: 1fr; }
    footer { flex-direction: column-reverse; }
    button { width: 100%; }
  }
  @media (prefers-reduced-motion: reduce) {
    .reduced-motion-safe, .reduced-motion-safe * {
      animation: none !important;
      transition: none !important;
      scroll-behavior: auto !important;
    }
  }
</style>

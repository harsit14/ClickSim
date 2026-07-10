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
    universeId: string
    comparison: ResetComparison
    confirmFocusReturn: FocusReturnDescriptor
    cancelFocusReturn: FocusReturnDescriptor
    resolveText: UiTextResolver
    formatDuration: DurationFormatter
    ondecision: (decision: ResetCardDecision) => void
  }

  let {
    id,
    universeId,
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
  const turnGlyph = $derived(
    universeId === 'tidefall' ? '≈'
      : universeId === 'verdance' ? '❧'
        : universeId === 'clockwork' ? '⌁'
          : universeId === 'prismata' ? '◇'
            : universeId === 'tempest' ? 'ϟ'
              : universeId === 'canticle' ? '◌'
                : '✦',
  )

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

<div class="scrim reduced-motion-safe" data-universe={universeId}>
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
    <header class="turn-header">
      <div class="turn-mark" aria-hidden="true">
        <span class="turn-orbit"></span>
        <strong>{turnGlyph}</strong>
      </div>
      <div class="turn-copy">
        <span class="eyebrow">{resolveText('reset-comparison.eyebrow')}</span>
        <h2 id={titleId}>{resolveText(model.actionLabelKey)}</h2>
        <p id={descriptionId}>{resolveText(model.resultKey)}</p>
      </div>
    </header>

    <div class="comparison-grid">
      {#each model.sections as section (section.id)}
        {#if section.items.length > 0}
          <section class="impact" data-impact={section.id} aria-labelledby={`${id}-${section.id}`}>
            <h3 id={`${id}-${section.id}`}>{resolveText(section.labelKey)}</h3>
            <ul>
              {#each section.items as item (item.id)}
                <li>
                  <span class="state-mark" aria-hidden="true">{section.id === 'lost' ? '↺' : section.id === 'retained' ? '◆' : '◇'}</span>
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
      <div class="recovery-heading">
        <span aria-hidden="true">⌁</span>
        <h3 id={`${id}-recovery`}>{resolveText('reset.recovery.title')}</h3>
      </div>
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
      <p class="confirmation-note"><span aria-hidden="true">◇</span>{resolveText('reset.confirmation.explicit-required')}</p>
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
    --turn-accent: var(--gold, #ffd98a);
    --turn-warm: var(--amber, #ffb35c);
    position: fixed;
    inset: 0;
    z-index: 20;
    display: grid;
    place-items: center;
    padding: 1rem;
    background:
      radial-gradient(ellipse at 50% 44%, color-mix(in srgb, var(--turn-warm) 7%, transparent), transparent 44%),
      rgba(2, 3, 8, 0.84);
    backdrop-filter: blur(12px);
  }
  .scrim[data-universe='tidefall'] {
    background:
      radial-gradient(ellipse at 50% 58%, color-mix(in srgb, var(--turn-warm) 9%, transparent), transparent 50%),
      linear-gradient(180deg, rgba(1, 6, 12, 0.84), rgba(2, 12, 18, 0.9));
  }
  .scrim[data-universe='verdance'] {
    --turn-accent: #d5ef9b;
    --turn-warm: #75c989;
    background:
      radial-gradient(ellipse at 50% 78%, color-mix(in srgb, var(--turn-warm) 11%, transparent), transparent 52%),
      rgba(2, 8, 5, 0.88);
  }
  .scrim[data-universe='clockwork'] {
    --turn-accent: #f0cc83;
    --turn-warm: #b78948;
    background:
      repeating-linear-gradient(90deg, transparent 0 5.8rem, rgba(240, 204, 131, 0.018) 5.85rem 5.9rem),
      radial-gradient(circle at 50% 46%, rgba(183, 137, 72, 0.09), transparent 48%),
      rgba(4, 5, 7, 0.9);
  }
  .scrim[data-universe='prismata'] {
    --turn-accent: #f4edff;
    --turn-warm: #a68cff;
    background: repeating-linear-gradient(166deg, transparent 0 8%, rgba(166, 140, 255, 0.022) 8.2% 8.5%, transparent 8.7% 16%), rgba(4, 4, 12, 0.9);
  }
  .scrim[data-universe='tempest'] {
    --turn-accent: #e3f7ff;
    --turn-warm: #70c9ee;
    background: radial-gradient(ellipse at 50% 45%, rgba(112, 201, 238, 0.12), transparent 48%), linear-gradient(180deg, rgba(3, 8, 14, 0.88), rgba(5, 15, 24, 0.94));
  }
  .scrim[data-universe='canticle'] {
    --turn-accent: #fff0f7;
    --turn-warm: #d89bc7;
    background: repeating-radial-gradient(ellipse at 50% 48%, transparent 0 5rem, rgba(216, 155, 199, 0.018) 5.05rem 5.12rem, transparent 5.18rem 8rem), rgba(9, 4, 11, 0.91);
  }
  .reset-card {
    position: relative;
    width: min(49rem, 100%);
    max-height: calc(100vh - 2rem);
    overflow: auto;
    padding: 1.1rem 1.15rem 1rem;
    color: var(--text, #f6efe3);
    background:
      linear-gradient(118deg, color-mix(in srgb, var(--panel) 90%, #05070d), color-mix(in srgb, var(--panel) 76%, transparent));
    border: 1px solid color-mix(in srgb, var(--turn-accent) 25%, transparent);
    border-radius: 0.35rem 1.3rem 1.3rem 0.35rem;
    box-shadow: 0 1.8rem 6rem rgba(0, 0, 0, 0.5), inset 3px 0 var(--turn-warm);
    scrollbar-width: thin;
  }
  [data-universe='tidefall'] .reset-card {
    border-radius: 1.5rem 0.4rem 1.5rem 0.4rem;
    background:
      radial-gradient(ellipse at 8% 18%, color-mix(in srgb, var(--turn-warm) 10%, transparent), transparent 28%),
      linear-gradient(118deg, color-mix(in srgb, var(--panel) 88%, #031018), color-mix(in srgb, var(--panel) 78%, transparent));
  }
  [data-universe='emberlight'] .reset-card {
    background:
      radial-gradient(circle at 1.7rem 1.8rem, color-mix(in srgb, var(--turn-warm) 12%, transparent), transparent 7rem),
      linear-gradient(118deg, color-mix(in srgb, var(--panel) 91%, #07070d), color-mix(in srgb, var(--panel) 78%, transparent));
  }
  [data-universe='verdance'] .reset-card {
    border-radius: 1.4rem 0.4rem 1.6rem 0.45rem;
    background:
      repeating-radial-gradient(ellipse at 4% 8%, transparent 0 2.1rem, color-mix(in srgb, var(--turn-warm) 5%, transparent) 2.14rem 2.18rem, transparent 2.22rem 3.2rem),
      linear-gradient(118deg, color-mix(in srgb, var(--panel) 93%, #07120b), color-mix(in srgb, var(--panel) 80%, transparent));
    box-shadow: 0 1.8rem 6rem rgba(0, 0, 0, 0.5), inset 3px 0 color-mix(in srgb, var(--turn-warm) 82%, transparent);
  }
  [data-universe='clockwork'] .reset-card {
    border-radius: 0.2rem 1rem 0.2rem 1rem;
    background:
      repeating-linear-gradient(90deg, transparent 0 4.8rem, color-mix(in srgb, var(--turn-accent) 3%, transparent) 4.84rem 4.9rem),
      linear-gradient(118deg, color-mix(in srgb, var(--panel) 94%, #0c0d10), color-mix(in srgb, var(--panel) 82%, transparent));
  }
  [data-universe='prismata'] .reset-card {
    border-radius: 0.2rem;
    clip-path: polygon(1.2% 0, 98.8% 0, 100% 3%, 100% 97%, 98.8% 100%, 1.2% 100%, 0 97%, 0 3%);
    background: repeating-linear-gradient(166deg, transparent 0 7rem, color-mix(in srgb, var(--turn-warm) 4%, transparent) 7.05rem 7.12rem), linear-gradient(118deg, color-mix(in srgb, var(--panel) 94%, #080814), color-mix(in srgb, var(--panel) 82%, transparent));
  }
  [data-universe='tempest'] .reset-card {
    border-radius: 1.8rem 0.3rem 1.5rem 0.3rem;
    background: radial-gradient(ellipse at 8% 10%, color-mix(in srgb, var(--turn-warm) 11%, transparent), transparent 26%), linear-gradient(128deg, color-mix(in srgb, var(--panel) 94%, #06101a), color-mix(in srgb, var(--panel) 80%, transparent));
  }
  [data-universe='canticle'] .reset-card {
    border-radius: 2.2rem 2.2rem 0.5rem 0.5rem;
    background: repeating-radial-gradient(ellipse at 4% 9%, transparent 0 2.5rem, color-mix(in srgb, var(--turn-warm) 4%, transparent) 2.55rem 2.62rem, transparent 2.7rem 4.2rem), linear-gradient(118deg, color-mix(in srgb, var(--panel) 94%, #120713), color-mix(in srgb, var(--panel) 82%, transparent));
  }
  .reset-card.destructive { border-color: color-mix(in srgb, var(--turn-accent) 34%, transparent); }
  .turn-header {
    display: grid;
    grid-template-columns: 4.4rem minmax(0, 1fr);
    align-items: center;
    gap: 0.9rem;
    padding: 0.15rem 0 0.9rem;
    border-bottom: 1px solid color-mix(in srgb, var(--turn-accent) 16%, transparent);
  }
  .turn-mark {
    position: relative;
    width: 3.8rem;
    aspect-ratio: 1;
    display: grid;
    place-items: center;
    color: var(--turn-accent);
    border: 1px solid color-mix(in srgb, var(--turn-accent) 38%, transparent);
    border-radius: 50%;
    box-shadow: 0 0 1.6rem color-mix(in srgb, var(--turn-warm) 20%, transparent);
  }
  .turn-mark strong { font-size: 1.25rem; font-weight: 520; }
  .turn-orbit {
    position: absolute;
    inset: -0.35rem 0.25rem;
    border-top: 1px solid color-mix(in srgb, var(--turn-accent) 52%, transparent);
    border-bottom: 1px solid color-mix(in srgb, var(--turn-accent) 18%, transparent);
    border-radius: 50%;
    transform: rotate(-14deg);
  }
  [data-universe='tidefall'] .turn-mark { border-radius: 54% 46% 58% 42%; }
  [data-universe='tidefall'] .turn-orbit { inset: 0.45rem -0.45rem; transform: none; }
  [data-universe='verdance'] .turn-mark { border-radius: 66% 34% 66% 34%; transform: rotate(-8deg); }
  [data-universe='verdance'] .turn-mark strong { transform: rotate(8deg); }
  [data-universe='verdance'] .turn-orbit { inset: -0.3rem; border-right: 1px solid color-mix(in srgb, var(--turn-accent) 28%, transparent); transform: rotate(38deg); }
  [data-universe='clockwork'] .turn-mark { outline: 1px dashed color-mix(in srgb, var(--turn-accent) 24%, transparent); outline-offset: 0.28rem; }
  [data-universe='clockwork'] .turn-orbit { inset: 0.3rem; border: 1px dashed color-mix(in srgb, var(--turn-accent) 35%, transparent); transform: rotate(8deg); }
  [data-universe='prismata'] .turn-mark { border-radius: 0; clip-path: polygon(50% 0, 100% 50%, 50% 100%, 0 50%); }
  [data-universe='prismata'] .turn-orbit { inset: 0.15rem -0.4rem; border-radius: 0; transform: rotate(45deg); }
  [data-universe='tempest'] .turn-mark { border-radius: 52% 48% 64% 36%; }
  [data-universe='tempest'] .turn-orbit { inset: -0.2rem; border-left-style: dashed; transform: rotate(-38deg); }
  [data-universe='canticle'] .turn-mark { border-style: dashed; }
  [data-universe='canticle'] .turn-orbit { inset: 0.45rem -0.35rem; transform: scaleX(1.28); }
  .eyebrow {
    color: color-mix(in srgb, var(--turn-accent) 72%, var(--dim));
    font-size: 0.62rem;
    font-weight: 720;
    letter-spacing: 0.17em;
    text-transform: uppercase;
  }
  h2, h3, p { margin: 0; }
  h2 { margin-top: 0.15rem; font-size: 1.45rem; font-weight: 590; letter-spacing: -0.025em; }
  .turn-copy p,
  .recovery p { margin-top: 0.28rem; color: var(--dim, #c4bdaf); font-size: 0.76rem; line-height: 1.42; }
  .comparison-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0 1.25rem;
    margin-top: 0.72rem;
  }
  .impact { min-width: 0; padding: 0.2rem 0 0.55rem; }
  .impact h3,
  .recovery h3 {
    color: color-mix(in srgb, var(--turn-accent) 74%, var(--dim));
    font-size: 0.64rem;
    letter-spacing: 0.13em;
    text-transform: uppercase;
  }
  ul { margin: 0.35rem 0 0; padding: 0; list-style: none; }
  li {
    display: grid;
    grid-template-columns: 1rem 4.1rem minmax(0, 1fr);
    gap: 0.35rem;
    align-items: baseline;
    padding: 0.28rem 0;
    border-top: 1px solid color-mix(in srgb, var(--turn-accent) 9%, transparent);
    font-size: 0.72rem;
  }
  .state-mark { color: var(--turn-accent); }
  .state-word {
    color: var(--dim);
    font-size: 0.57rem;
    font-weight: 760;
    letter-spacing: 0.07em;
    text-transform: uppercase;
  }
  .recovery {
    margin-top: 0.25rem;
    padding: 0.72rem 0.85rem;
    background: color-mix(in srgb, var(--turn-warm) 5%, transparent);
    border: 1px solid color-mix(in srgb, var(--turn-accent) 15%, transparent);
    border-radius: 0.25rem 0.8rem 0.8rem 0.25rem;
  }
  .recovery-heading { display: flex; align-items: center; gap: 0.45rem; }
  .recovery-heading > span { color: var(--turn-accent); }
  dl { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 0.4rem; margin: 0.52rem 0 0; }
  dl div { min-width: 0; padding-right: 0.4rem; border-right: 1px solid color-mix(in srgb, var(--turn-accent) 12%, transparent); }
  dl div:last-child { border-right: 0; }
  dt { color: var(--dim, #c4bdaf); font-size: 0.6rem; line-height: 1.25; }
  dd { margin: 0.18rem 0 0; color: color-mix(in srgb, var(--turn-accent) 70%, white); font-size: 0.72rem; font-variant-numeric: tabular-nums; }
  .confirmation-note {
    display: flex;
    gap: 0.45rem;
    align-items: center;
    margin-top: 0.65rem;
    color: var(--dim);
    font-size: 0.68rem;
  }
  .confirmation-note span { color: var(--turn-accent); }
  footer { display: flex; justify-content: flex-end; gap: 0.55rem; margin-top: 0.8rem; }
  button {
    min-height: 2.35rem;
    padding: 0.42rem 0.82rem;
    font: inherit;
    color: color-mix(in srgb, var(--turn-accent) 72%, var(--text));
    background: transparent;
    border: 1px solid color-mix(in srgb, var(--turn-accent) 28%, transparent);
    border-radius: 999px;
    cursor: pointer;
  }
  button:focus-visible { outline: 2px solid var(--turn-accent); outline-offset: 3px; }
  .confirm {
    color: #070a0f;
    background: color-mix(in srgb, var(--turn-accent) 80%, white);
    border-color: transparent;
    font-weight: 760;
  }
  @media (max-width: 720px) {
    .comparison-grid { grid-template-columns: 1fr; }
    dl { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    dl div { border-right: 0; }
    footer { flex-direction: column-reverse; }
    button { width: 100%; }
  }
  @media (prefers-reduced-motion: reduce) {
    .reduced-motion-safe,
    .reduced-motion-safe * { animation: none !important; transition: none !important; scroll-behavior: auto !important; }
  }
</style>

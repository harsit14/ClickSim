<script lang="ts">
  import { onMount } from 'svelte'
  import {
    buildResetComparisonCardModel,
    describeResetCardDecision,
    type ResetCardDecision,
    type ResetComparisonScopeGroup,
    type ResetComparisonSection,
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
          : universeId === 'prismata' ? '✤'
            : universeId === 'tempest' ? '↶'
              : universeId === 'canticle' ? '▽'
                : '✦',
  )

  onMount(() => {
    cancelButton.focus({ preventScroll: true })
  })

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

  function sectionGlyph(sectionId: ResetComparisonSection['id']): string {
    if (sectionId === 'lost') return '↺'
    if (sectionId === 'retained') return '◆'
    if (sectionId === 'parked') return '◇'
    return '◌'
  }

  function scopeGlyph(scope: ResetComparisonScopeGroup['scope']): string {
    if (scope === 'world') return '●'
    if (scope === 'epoch') return '✦'
    if (scope === 'deep-history') return '◉'
    if (scope === 'between') return '⌘'
    return '□'
  }

  function showDirectItems(section: ResetComparisonSection): boolean {
    return section.id !== 'retained' && section.items.length <= 8
  }

  function groupStartsOpen(section: ResetComparisonSection, group: ResetComparisonScopeGroup): boolean {
    return comparison.boundary === 'epoch-turn'
      && section.id === 'retained'
      && group.scope === 'epoch'
  }
</script>

<div
  class="scrim reduced-motion-safe"
  data-universe={universeId}
>
  <div
    class="reset-card instrument-panel"
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
      {#if model.reward}
        <dl class="reward-preview" aria-label={`${model.reward.localName} reward preview`}>
          <div><dt>now</dt><dd>{model.reward.glyph}{model.reward.current}</dd></div>
          <div class="reward-gain"><dt>this turn</dt><dd>+{model.reward.glyph}{model.reward.gain}</dd></div>
          <div><dt>after</dt><dd>{model.reward.glyph}{model.reward.after}</dd></div>
          <span>{model.reward.localName} · {model.reward.canonicalName}</span>
        </dl>
      {/if}
    </header>

    <div class="card-body">
      <div class="comparison-grid">
        {#each model.sections as section (section.id)}
          {#if section.items.length > 0}
            <section class="impact" data-impact={section.id} aria-labelledby={`${id}-${section.id}`}>
              <header class="impact-heading">
                <span class="impact-sigil" aria-hidden="true">{sectionGlyph(section.id)}</span>
                <div>
                  <h3 id={`${id}-${section.id}`}>{resolveText(section.labelKey)}</h3>
                  <p>{resolveText(`reset.section.${section.id}.description`)}</p>
                </div>
                <strong>{resolveText('reset.summary.system-count', { count: section.items.length })}</strong>
              </header>

              {#if showDirectItems(section)}
                <ul class="impact-tiles">
                  {#each section.items as item (item.id)}
                    <li>
                      <span class="state-mark" aria-hidden="true">{sectionGlyph(section.id)}</span>
                      <span>{resolveText(item.labelKey)}</span>
                    </li>
                  {/each}
                </ul>
              {:else}
                <div class="scope-groups">
                  {#each section.groups as group (group.scope)}
                    <details class="scope-group" open={groupStartsOpen(section, group)}>
                      <summary>
                        <span class="scope-sigil" aria-hidden="true">{scopeGlyph(group.scope)}</span>
                        <span class="scope-copy">
                          <strong>{resolveText(group.labelKey)}</strong>
                          <small>{resolveText('reset.summary.system-count', { count: group.items.length })}</small>
                        </span>
                        <span class="scope-action">{resolveText('reset.scope.details')}</span>
                        <span class="chevron" aria-hidden="true">⌄</span>
                      </summary>
                      <ul class="detail-list">
                        {#each group.items as item (item.id)}
                          <li><span aria-hidden="true">◆</span>{resolveText(item.labelKey)}</li>
                        {/each}
                      </ul>
                    </details>
                  {/each}
                </div>
              {/if}
            </section>
          {/if}
        {/each}
      </div>

      <section class="recovery" class:available={model.recovery.status === 'estimated'} aria-labelledby={`${id}-recovery`}>
        <div class="recovery-heading">
          <span class="recovery-sigil" aria-hidden="true">⌁</span>
          <div>
            <h3 id={`${id}-recovery`}>{resolveText('reset.recovery.title')}</h3>
            {#if model.recovery.status !== 'estimated'}
              <p>{resolveText(`reset.recovery.${model.recovery.status}`, { reason: model.recovery.reason })}</p>
            {/if}
          </div>
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
        {/if}
      </section>
    </div>

    <footer>
      {#if model.requiresExplicitConfirmation}
        <p class="confirmation-note"><span aria-hidden="true">◇</span>{resolveText('reset.confirmation.explicit-required')}</p>
      {/if}
      <div class="actions">
        <button bind:this={cancelButton} type="button" class="cancel" onclick={() => decide('cancel')}>
          {resolveText('reset.action.cancel')}
        </button>
        <button
          bind:this={confirmButton}
          type="button"
          class="confirm"
          onclick={() => decide('confirm')}
        >
          {resolveText('reset.action.confirm', { action: resolveText(model.actionLabelKey) })}
        </button>
      </div>
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
  .reset-card { z-index: 1; }
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
    --turn-accent: #fff0c7;
    --turn-warm: #d7a34c;
    background: repeating-linear-gradient(0deg, transparent 0 4.2rem, rgba(255, 240, 199, 0.02) 4.25rem 4.3rem), radial-gradient(circle at 50% 46%, rgba(215, 163, 76, .08), transparent 42%), rgba(6, 5, 11, 0.91);
  }
  .scrim[data-universe='tempest'] {
    --turn-accent: #f1d58b;
    --turn-warm: #658f78;
    background: repeating-radial-gradient(ellipse at 50% 58%, transparent 0 4rem, rgba(241, 213, 139, 0.018) 4.05rem 4.1rem, transparent 4.15rem 7rem), linear-gradient(180deg, rgba(5, 8, 28, 0.9), rgba(8, 16, 38, 0.96));
  }
  .scrim[data-universe='canticle'] {
    --turn-accent: #e8edf2;
    --turn-warm: #c47d4f;
    background:linear-gradient(145deg,transparent 0 29%,rgba(99,169,191,.022) 29.2% 29.5%,transparent 29.8% 48%),radial-gradient(circle at 68% 20%,rgba(232,237,242,.09),transparent 22%),rgba(4,8,14,.93);
  }
  .reset-card {
    position: relative;
    width: min(61rem, 100%);
    max-height: calc(100vh - 2rem);
    display: grid;
    grid-template-rows: auto minmax(0, 1fr) auto;
    overflow: hidden;
    color: var(--text, #f6efe3);
    background:
      linear-gradient(118deg, color-mix(in srgb, var(--panel) 90%, #05070d), color-mix(in srgb, var(--panel) 76%, transparent));
    border: 1px solid color-mix(in srgb, var(--turn-accent) 25%, transparent);
    border-radius: 0.35rem 1.3rem 1.3rem 0.35rem;
    box-shadow: 0 1.8rem 6rem rgba(0, 0, 0, 0.5), inset 3px 0 var(--turn-warm);
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
    border-radius: 1.4rem 1.4rem .35rem .35rem;
    background: repeating-linear-gradient(0deg, transparent 0 4.5rem, color-mix(in srgb, var(--turn-warm) 4%, transparent) 4.55rem 4.62rem), radial-gradient(circle at 8% 12%, color-mix(in srgb, var(--turn-warm) 9%, transparent), transparent 23%), linear-gradient(118deg, color-mix(in srgb, var(--panel) 94%, #0c0810), color-mix(in srgb, var(--panel) 82%, transparent));
  }
  [data-universe='tempest'] .reset-card {
    border-radius: 1.8rem 1.8rem 0.45rem 0.45rem;
    background: repeating-radial-gradient(ellipse at 7% 14%, transparent 0 1.7rem, color-mix(in srgb, var(--turn-accent) 4%, transparent) 1.74rem 1.78rem, transparent 1.82rem 2.8rem), radial-gradient(ellipse at 8% 10%, color-mix(in srgb, var(--turn-warm) 10%, transparent), transparent 26%), linear-gradient(128deg, color-mix(in srgb, var(--panel) 94%, #07102d), color-mix(in srgb, var(--panel) 82%, transparent));
  }
  [data-universe='canticle'] .reset-card {
    border-radius:2.2rem 2.2rem .4rem .4rem;
    background:linear-gradient(145deg,transparent 0 17%,color-mix(in srgb,var(--turn-accent) 4%,transparent) 17.3% 17.8%,transparent 18.1% 31%),radial-gradient(circle at 8% 10%,color-mix(in srgb,var(--turn-warm) 8%,transparent),transparent 23%),linear-gradient(118deg,color-mix(in srgb,var(--panel) 94%,#08111c),color-mix(in srgb,var(--panel) 82%,transparent));
  }
  .reset-card.destructive { border-color: color-mix(in srgb, var(--turn-accent) 34%, transparent); }
  .turn-header {
    display: grid;
    grid-template-columns: 4.8rem minmax(0, 1fr) auto;
    align-items: center;
    gap: 1rem;
    padding: 1.05rem 1.25rem 1rem;
    background:
      radial-gradient(circle at 4.4rem 50%, color-mix(in srgb, var(--turn-warm) 12%, transparent), transparent 9rem),
      linear-gradient(90deg, color-mix(in srgb, var(--turn-warm) 4%, transparent), transparent 72%);
    border-bottom: 1px solid color-mix(in srgb, var(--turn-accent) 16%, transparent);
  }
  .turn-mark {
    position: relative;
    width: 4rem;
    aspect-ratio: 1;
    display: grid;
    place-items: center;
    color: var(--turn-accent);
    border: 1px solid color-mix(in srgb, var(--turn-accent) 38%, transparent);
    border-radius: 50%;
    box-shadow: 0 0 1.6rem color-mix(in srgb, var(--turn-warm) 20%, transparent);
  }
  .turn-mark strong { font-size: 1.35rem; font-weight: 520; }
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
  [data-universe='prismata'] .turn-mark { border-radius: 54% 46% 54% 46%; outline: 1px dashed color-mix(in srgb, #8ecbe0 24%, transparent); outline-offset: .25rem; }
  [data-universe='prismata'] .turn-orbit { inset: .2rem; border-radius: 50%; transform: rotate(45deg); }
  [data-universe='tempest'] .turn-mark { border-radius: 50%; }
  [data-universe='tempest'] .turn-orbit { inset: 0.35rem -0.3rem; border-right: 1px solid color-mix(in srgb, var(--turn-accent) 26%, transparent); transform: rotate(-10deg); }
  [data-universe='canticle'] .turn-mark { border-radius:50% 50% 18% 18%;border-bottom-style:dashed; }
  [data-universe='canticle'] .turn-orbit { inset:-.2rem;border-left-color:transparent;transform:rotate(-12deg); }
  .eyebrow {
    color: color-mix(in srgb, var(--turn-accent) 72%, var(--dim));
    font-size: 0.62rem;
    font-weight: 720;
    letter-spacing: 0.17em;
    text-transform: uppercase;
  }
  h2, h3, p { margin: 0; }
  h2 { margin-top: 0.12rem; font-size: 1.7rem; font-weight: 610; letter-spacing: -0.035em; }
  .turn-copy p,
  .recovery p { margin-top: 0.24rem; color: var(--dim, #c4bdaf); font-size: 0.76rem; line-height: 1.42; }
  .card-body {
    min-height: 0;
    overflow: auto;
    padding: 0.9rem 1.05rem 1rem;
    scrollbar-width: thin;
  }
  .reward-preview {
    min-width: 18rem;
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0;
    margin: 0;
    padding: 0.55rem 0.65rem 0.42rem;
    background: color-mix(in srgb, var(--turn-warm) 7%, rgba(0, 0, 0, 0.22));
    border: 1px solid color-mix(in srgb, var(--turn-accent) 24%, transparent);
    border-radius: 0.5rem 1rem 1rem 0.5rem;
    box-shadow: inset 2px 0 color-mix(in srgb, var(--turn-warm) 54%, transparent);
  }
  .reward-preview div { padding: 0 0.55rem; border-right: 1px solid color-mix(in srgb, var(--turn-accent) 13%, transparent); }
  .reward-preview div:last-of-type { border-right: 0; }
  .reward-preview dt { color: var(--dim); font-size: 0.62rem; text-transform: uppercase; letter-spacing: 0.08em; }
  .reward-preview dd { margin-top: 0.16rem; color: color-mix(in srgb, var(--turn-accent) 76%, white); font-size: 0.82rem; font-weight: 720; white-space: nowrap; }
  .reward-preview .reward-gain dd { color: var(--turn-accent); }
  .reward-preview > span { grid-column: 1 / -1; margin: 0.38rem 0.55rem 0; color: var(--dim); font-size: 0.62rem; }
  .comparison-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.8rem;
  }
  .impact {
    min-width: 0;
    padding: 0.8rem;
    background:
      linear-gradient(145deg, color-mix(in srgb, var(--turn-warm) 5%, transparent), rgba(0, 0, 0, 0.14));
    border: 1px solid color-mix(in srgb, var(--turn-accent) 13%, transparent);
    border-radius: 0.55rem 1rem 1rem 0.55rem;
    box-shadow: inset 2px 0 color-mix(in srgb, var(--turn-warm) 38%, transparent);
  }
  .impact[data-impact='retained'] {
    background:
      radial-gradient(circle at 100% 0, color-mix(in srgb, var(--turn-accent) 7%, transparent), transparent 46%),
      rgba(0, 0, 0, 0.12);
    box-shadow: inset 2px 0 color-mix(in srgb, var(--turn-accent) 54%, transparent);
  }
  .impact-heading {
    display: grid;
    grid-template-columns: 2.15rem minmax(0, 1fr) auto;
    align-items: center;
    gap: 0.6rem;
    min-height: 2.4rem;
    padding-bottom: 0.65rem;
    border-bottom: 1px solid color-mix(in srgb, var(--turn-accent) 10%, transparent);
  }
  .impact-sigil {
    width: 2rem;
    aspect-ratio: 1;
    display: grid;
    place-items: center;
    color: var(--turn-accent);
    background: color-mix(in srgb, var(--turn-warm) 8%, transparent);
    border: 1px solid color-mix(in srgb, var(--turn-accent) 24%, transparent);
    border-radius: 50%;
    box-shadow: 0 0 1rem color-mix(in srgb, var(--turn-warm) 10%, transparent);
  }
  .impact h3,
  .recovery h3 {
    color: color-mix(in srgb, var(--turn-accent) 74%, var(--dim));
    font-size: 0.64rem;
    letter-spacing: 0.13em;
    text-transform: uppercase;
  }
  .impact-heading p {
    margin-top: 0.08rem;
    color: var(--dim);
    font-size: 0.63rem;
  }
  .impact-heading > strong {
    padding: 0.25rem 0.48rem;
    color: color-mix(in srgb, var(--turn-accent) 74%, white);
    background: color-mix(in srgb, var(--turn-accent) 7%, transparent);
    border: 1px solid color-mix(in srgb, var(--turn-accent) 14%, transparent);
    border-radius: 999px;
    font-size: 0.58rem;
    font-weight: 680;
    white-space: nowrap;
  }
  ul { margin: 0; padding: 0; list-style: none; }
  .impact-tiles {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.38rem;
    margin-top: 0.65rem;
  }
  .impact-tiles li {
    min-width: 0;
    min-height: 2.35rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.48rem 0.55rem;
    background: color-mix(in srgb, var(--turn-warm) 4%, rgba(0, 0, 0, 0.2));
    border: 1px solid color-mix(in srgb, var(--turn-accent) 9%, transparent);
    border-radius: 0.5rem;
    font-size: 0.7rem;
    line-height: 1.3;
  }
  .state-mark { color: var(--turn-accent); }
  .scope-groups {
    display: grid;
    gap: 0.42rem;
    margin-top: 0.65rem;
  }
  .scope-group {
    overflow: hidden;
    background: rgba(0, 0, 0, 0.17);
    border: 1px solid color-mix(in srgb, var(--turn-accent) 10%, transparent);
    border-radius: 0.58rem;
  }
  .scope-group[open] {
    border-color: color-mix(in srgb, var(--turn-accent) 22%, transparent);
    background: color-mix(in srgb, var(--turn-accent) 4%, rgba(0, 0, 0, 0.2));
  }
  summary {
    display: grid;
    grid-template-columns: 1.9rem minmax(0, 1fr) auto 1rem;
    align-items: center;
    gap: 0.55rem;
    min-height: 3rem;
    padding: 0.46rem 0.58rem;
    cursor: pointer;
    list-style: none;
  }
  summary::-webkit-details-marker { display: none; }
  summary:focus-visible { outline: 2px solid var(--turn-accent); outline-offset: -2px; }
  .scope-sigil {
    width: 1.75rem;
    aspect-ratio: 1;
    display: grid;
    place-items: center;
    color: var(--turn-accent);
    border: 1px solid color-mix(in srgb, var(--turn-accent) 18%, transparent);
    border-radius: 50%;
    font-size: 0.68rem;
  }
  .scope-copy { min-width: 0; display: grid; gap: 0.08rem; }
  .scope-copy strong { font-size: 0.73rem; font-weight: 650; }
  .scope-copy small,
  .scope-action { color: var(--dim); font-size: 0.57rem; }
  .scope-action { opacity: 0.7; }
  .chevron { color: var(--turn-accent); transition: transform 150ms ease; }
  details[open] .chevron { transform: rotate(180deg); }
  .detail-list {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.16rem 0.7rem;
    padding: 0.12rem 0.72rem 0.62rem 2.9rem;
  }
  .detail-list li {
    min-width: 0;
    display: flex;
    gap: 0.38rem;
    padding: 0.24rem 0;
    color: color-mix(in srgb, var(--text) 84%, var(--dim));
    border-top: 1px solid color-mix(in srgb, var(--turn-accent) 7%, transparent);
    font-size: 0.64rem;
    line-height: 1.28;
  }
  .detail-list li span { color: var(--turn-accent); font-size: 0.48rem; }
  .recovery {
    margin-top: 0.75rem;
    padding: 0.68rem 0.8rem;
    background:
      linear-gradient(90deg, color-mix(in srgb, var(--turn-warm) 5%, transparent), rgba(0, 0, 0, 0.14));
    border: 1px solid color-mix(in srgb, var(--turn-accent) 13%, transparent);
    border-radius: 0.55rem 0.9rem 0.9rem 0.55rem;
  }
  .recovery.available {
    box-shadow: inset 2px 0 color-mix(in srgb, var(--turn-accent) 42%, transparent);
  }
  .recovery-heading { display: flex; align-items: center; gap: 0.62rem; }
  .recovery-sigil {
    width: 2rem;
    aspect-ratio: 1;
    flex: 0 0 auto;
    display: grid;
    place-items: center;
    color: var(--turn-accent);
    background: color-mix(in srgb, var(--turn-accent) 6%, transparent);
    border: 1px solid color-mix(in srgb, var(--turn-accent) 18%, transparent);
    border-radius: 50%;
  }
  .recovery-heading p { margin-top: 0.1rem; font-size: 0.66rem; }
  dl { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 0.4rem; margin: 0.52rem 0 0; }
  dl div { min-width: 0; padding-right: 0.4rem; border-right: 1px solid color-mix(in srgb, var(--turn-accent) 12%, transparent); }
  dl div:last-child { border-right: 0; }
  dt { color: var(--dim, #c4bdaf); font-size: 0.6rem; line-height: 1.25; }
  dd { margin: 0.18rem 0 0; color: color-mix(in srgb, var(--turn-accent) 70%, white); font-size: 0.72rem; font-variant-numeric: tabular-nums; }
  footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 0.78rem 1.05rem;
    background: color-mix(in srgb, var(--panel) 88%, rgba(0, 0, 0, 0.28));
    border-top: 1px solid color-mix(in srgb, var(--turn-accent) 13%, transparent);
  }
  .confirmation-note {
    display: flex;
    gap: 0.45rem;
    align-items: center;
    max-width: 33rem;
    color: var(--dim);
    font-size: 0.63rem;
    line-height: 1.35;
  }
  .confirmation-note span { color: var(--turn-accent); }
  .actions { display: flex; flex: 0 0 auto; gap: 0.55rem; }
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
    .impact-tiles,
    .detail-list { grid-template-columns: 1fr; }
    .scope-action { display: none; }
    summary { grid-template-columns: 1.9rem minmax(0, 1fr) 1rem; }
    dl { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    dl div { border-right: 0; }
    footer { flex-direction: column-reverse; }
    .actions { width: 100%; }
    button { flex: 1; }
  }
  @media (max-width: 1000px) {
    .turn-header { grid-template-columns: 4.8rem minmax(0, 1fr); }
    .reward-preview { grid-column: 1 / -1; width: 100%; min-width: 0; box-sizing: border-box; }
  }
  @media (prefers-reduced-motion: reduce) {
    .reduced-motion-safe,
    .reduced-motion-safe * { animation: none !important; transition: none !important; scroll-behavior: auto !important; }
  }
</style>

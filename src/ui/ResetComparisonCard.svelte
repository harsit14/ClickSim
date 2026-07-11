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
  import {
    EMBERLIGHT_SUPERNOVA_HOLD_BEAT_MS,
    EMBERLIGHT_SUPERNOVA_HOLD_MS,
  } from '../render/emberlight/supernova'

  interface Props {
    id: string
    universeId: string
    comparison: ResetComparison
    confirmFocusReturn: FocusReturnDescriptor
    cancelFocusReturn: FocusReturnDescriptor
    resolveText: UiTextResolver
    formatDuration: DurationFormatter
    ondecision: (decision: ResetCardDecision) => void
    onholdbeat?: (beat: number) => void
    onholdcancel?: () => void
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
    onholdbeat = () => {},
    onholdcancel = () => {},
  }: Props = $props()

  let cancelButton: HTMLButtonElement
  let confirmButton: HTMLButtonElement
  let holdTimer: ReturnType<typeof setInterval> | undefined
  let holdStartedAt = 0
  let holdActive = $state(false)
  let holdProgress = $state(0)
  let holdBeat = $state(0)
  const model = $derived(buildResetComparisonCardModel(comparison))
  const requiresHold = $derived(universeId === 'emberlight' && comparison.boundary === 'epoch-turn')
  const ceremonyPreview = import.meta.env.DEV
    && new URLSearchParams(window.location.search).get('supernova-preview') === '1'
  const titleId = $derived(`${id}-title`)
  const descriptionId = $derived(`${id}-description`)
  const turnGlyph = $derived(
    universeId === 'tidefall' ? '≈'
      : universeId === 'verdance' ? '❧'
        : universeId === 'clockwork' ? '⌁'
          : universeId === 'prismata' ? '✤'
            : universeId === 'tempest' ? 'ϟ'
              : universeId === 'canticle' ? '◌'
                : '✦',
  )

  onMount(() => {
    cancelButton.focus({ preventScroll: true })
    return () => clearInterval(holdTimer)
  })

  function decide(action: 'confirm' | 'cancel') {
    ondecision(describeResetCardDecision(
      comparison,
      action,
      action === 'confirm' ? confirmFocusReturn : cancelFocusReturn,
    ))
  }

  function resetHold(notify = false) {
    clearInterval(holdTimer)
    holdTimer = undefined
    const wasActive = holdActive
    holdActive = false
    holdProgress = 0
    holdBeat = 0
    if (notify && wasActive) onholdcancel()
  }

  function advanceHold() {
    if (!holdActive) return
    const elapsed = Math.max(0, performance.now() - holdStartedAt)
    holdProgress = Math.min(1, elapsed / EMBERLIGHT_SUPERNOVA_HOLD_MS)
    const nextBeat = Math.min(3, Math.floor(elapsed / EMBERLIGHT_SUPERNOVA_HOLD_BEAT_MS))
    if (nextBeat !== holdBeat) {
      holdBeat = nextBeat
      onholdbeat(holdBeat)
    }
    if (elapsed < EMBERLIGHT_SUPERNOVA_HOLD_MS) return
    clearInterval(holdTimer)
    holdTimer = undefined
    holdActive = false
    holdProgress = 1
    holdBeat = 3
    decide('confirm')
  }

  function beginHold(event: PointerEvent | KeyboardEvent) {
    if (!requiresHold || holdActive) return
    event.preventDefault()
    if (event instanceof KeyboardEvent && event.repeat) return
    holdActive = true
    holdStartedAt = performance.now()
    holdProgress = 0
    holdBeat = 0
    holdTimer = setInterval(advanceHold, 32)
  }

  function releaseHold(event: PointerEvent | KeyboardEvent) {
    if (!requiresHold) return
    event.preventDefault()
    resetHold(true)
  }

  function confirmClick(event: MouseEvent) {
    if (requiresHold) {
      event.preventDefault()
      return
    }
    decide('confirm')
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
  class:holding={holdActive}
  data-universe={universeId}
  data-hold-beat={holdBeat}
  style={`--hold-dim:${holdBeat * 0.1}`}
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
        {#if ceremonyPreview && requiresHold}
          <button type="button" class="preview" onclick={() => decide('confirm')}>Preview ceremony</button>
        {/if}
        <button
          bind:this={confirmButton}
          type="button"
          class="confirm"
          class:hold-confirm={requiresHold}
          class:holding={holdActive}
          style={`--hold-progress:${holdProgress}`}
          aria-label={requiresHold ? `Hold for three beats to ${resolveText(model.actionLabelKey)}` : undefined}
          onpointerdown={beginHold}
          onpointerup={releaseHold}
          onpointercancel={releaseHold}
          onkeydown={(event) => (event.key === ' ' || event.key === 'Enter') && beginHold(event)}
          onkeyup={(event) => (event.key === ' ' || event.key === 'Enter') && releaseHold(event)}
          onclick={confirmClick}
        >
          {#if requiresHold}
            Hold {holdBeat}/3 beats · {resolveText(model.actionLabelKey)}
          {:else}
            {resolveText('reset.action.confirm', { action: resolveText(model.actionLabelKey) })}
          {/if}
        </button>
      </div>
      {#if requiresHold}
        <p class="hold-status" aria-live="polite">
          {holdActive ? `Beat ${holdBeat} of 3. Keep holding.` : 'Press and hold for three beats. Release to cancel.'}
        </p>
      {/if}
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
  .scrim::after {
    content: '';
    position: absolute;
    inset: 0;
    z-index: 0;
    pointer-events: none;
    background: #000;
    opacity: var(--hold-dim, 0);
    transition: opacity 180ms ease;
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
    grid-template-columns: 4.8rem minmax(0, 1fr);
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
  h2 { margin-top: 0.12rem; font-size: 1.7rem; font-weight: 610; letter-spacing: -0.035em; }
  .turn-copy p,
  .recovery p { margin-top: 0.24rem; color: var(--dim, #c4bdaf); font-size: 0.76rem; line-height: 1.42; }
  .card-body {
    min-height: 0;
    overflow: auto;
    padding: 0.9rem 1.05rem 1rem;
    scrollbar-width: thin;
  }
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
  .hold-confirm {
    min-width: 18rem;
    color: color-mix(in srgb, var(--turn-accent) 82%, white);
    background:
      linear-gradient(90deg,
        color-mix(in srgb, var(--turn-warm) 74%, white) 0 calc(var(--hold-progress) * 100%),
        color-mix(in srgb, var(--panel) 86%, #070a0f) calc(var(--hold-progress) * 100%) 100%);
    border-color: color-mix(in srgb, var(--turn-accent) 42%, transparent);
    user-select: none;
    touch-action: none;
  }
  .hold-confirm.holding { box-shadow: 0 0 1.3rem color-mix(in srgb, var(--turn-warm) 22%, transparent); }
  .hold-status {
    position: absolute;
    width: 1px;
    height: 1px;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
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
  @media (prefers-reduced-motion: reduce) {
    .reduced-motion-safe,
    .reduced-motion-safe * { animation: none !important; transition: none !important; scroll-behavior: auto !important; }
  }
</style>

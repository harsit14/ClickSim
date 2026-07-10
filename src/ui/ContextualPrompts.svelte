<script lang="ts">
  import {
    disableContextualPrompts,
    dismissContextualPrompt,
    selectContextualPrompt,
    type ContextualPromptCandidate,
    type ContextualPromptState,
  } from '../experience/contextual-prompts'
  import type { UiTextResolver } from '../experience/ui-text'

  interface Props {
    id: string
    candidates: readonly ContextualPromptCandidate[]
    state: ContextualPromptState
    resolveText: UiTextResolver
    onstatechange: (state: ContextualPromptState) => void
    onaction?: (promptId: string) => void
  }

  let {
    id,
    candidates,
    state,
    resolveText,
    onstatechange,
    onaction,
  }: Props = $props()

  const selection = $derived(selectContextualPrompt(candidates, state))
  const titleId = $derived(`${id}-title`)

  function dismiss(promptId: string) {
    onstatechange(dismissContextualPrompt(state, promptId))
  }

  function act(promptId: string) {
    onaction?.(promptId)
    dismiss(promptId)
  }
</script>

{#if selection.prompt}
  {@const prompt = selection.prompt}
  <aside
    class="contextual-prompt reduced-motion-safe"
    aria-labelledby={titleId}
    data-prompt-id={prompt.id}
  >
    <div class="copy">
      <span class="eyebrow">{resolveText('contextual-prompt.first-use')}</span>
      <h2 id={titleId}>{resolveText(prompt.titleKey)}</h2>
      <p>{resolveText(prompt.bodyKey)}</p>
    </div>
    <div class="actions">
      {#if prompt.actionLabelKey && onaction}
        <button type="button" class="primary" onclick={() => act(prompt.id)}>
          {resolveText(prompt.actionLabelKey)}
        </button>
      {/if}
      <button
        type="button"
        aria-label={resolveText('contextual-prompt.dismiss-label', { prompt: resolveText(prompt.titleKey) })}
        onclick={() => dismiss(prompt.id)}
      >{resolveText('contextual-prompt.dismiss')}</button>
      <button
        type="button"
        aria-label={resolveText('contextual-prompt.turn-off-label')}
        onclick={() => onstatechange(disableContextualPrompts(state))}
      >{resolveText('contextual-prompt.turn-off')}</button>
    </div>
  </aside>
{/if}

<style>
  .contextual-prompt {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 1rem;
    padding: 0.8rem;
    color: var(--text, #f6efe3);
    background: rgba(11, 12, 22, 0.94);
    border: 1px solid currentColor;
    border-radius: 0.75rem;
  }
  h2, p { margin: 0; }
  h2 { margin-top: 0.2rem; font-size: 0.95rem; }
  p { margin-top: 0.35rem; color: var(--dim, #c4bdaf); font-size: 0.82rem; }
  .eyebrow {
    font-size: 0.68rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
  .actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: flex-end;
    gap: 0.4rem;
  }
  button {
    min-height: 2.4rem;
    padding: 0.4rem 0.7rem;
    font: inherit;
    color: inherit;
    background: transparent;
    border: 1px solid currentColor;
    border-radius: 0.4rem;
    cursor: pointer;
  }
  button:focus-visible { outline: 3px solid currentColor; outline-offset: 2px; }
  .primary { font-weight: 700; }
  @media (max-width: 720px) {
    .contextual-prompt { grid-template-columns: 1fr; }
    .actions { justify-content: flex-start; }
  }
  @media (prefers-reduced-motion: reduce) {
    .reduced-motion-safe, .reduced-motion-safe * {
      animation: none !important;
      transition: none !important;
    }
  }
</style>

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
    universeId: string
    candidates: readonly ContextualPromptCandidate[]
    state: ContextualPromptState
    resolveText: UiTextResolver
    onstatechange: (state: ContextualPromptState) => void
    onaction?: (promptId: string) => void
  }

  let {
    id,
    universeId,
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
    data-universe={universeId}
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
    --prompt-accent: var(--gold, #ffd98a);
    --prompt-warm: var(--amber, #ffb35c);
    position: relative;
    display: block;
    width: min(22rem, calc(100vw - 2rem));
    padding: 0.68rem 0.75rem 0.72rem 1rem;
    color: var(--text, #f6efe3);
    background:
      radial-gradient(circle at 0 50%, color-mix(in srgb, var(--prompt-warm) 10%, transparent), transparent 42%),
      linear-gradient(105deg, color-mix(in srgb, var(--panel) 76%, #06070d), color-mix(in srgb, var(--panel) 92%, transparent));
    border: 1px solid color-mix(in srgb, var(--prompt-accent) 18%, transparent);
    border-left: 2px solid color-mix(in srgb, var(--prompt-warm) 64%, transparent);
    border-radius: 0.25rem 0.9rem 0.9rem 0.25rem;
    box-shadow: 0 0.7rem 2.2rem rgba(0, 0, 0, 0.16);
    backdrop-filter: blur(14px);
  }
  .contextual-prompt[data-universe='tidefall'] {
    border-left-width: 1px;
    border-radius: 0.9rem 0.25rem 0.9rem 0.25rem;
  }
  .contextual-prompt::before {
    content: '';
    position: absolute;
    left: 0.68rem;
    top: 1rem;
    width: 0.25rem;
    aspect-ratio: 1;
    border-radius: 50%;
    background: var(--prompt-accent);
    box-shadow: 0 0 0.7rem var(--prompt-warm);
  }
  h2, p { margin: 0; }
  h2 { margin-top: 0.12rem; font-size: 0.79rem; font-weight: 680; }
  p { margin-top: 0.24rem; color: var(--dim, #c4bdaf); font-size: 0.68rem; line-height: 1.38; }
  .eyebrow {
    color: color-mix(in srgb, var(--prompt-accent) 72%, var(--dim));
    font-size: 0.55rem;
    font-weight: 720;
    letter-spacing: 0.14em;
    text-transform: uppercase;
  }
  .actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.32rem;
    margin-top: 0.55rem;
  }
  button {
    min-height: 1.8rem;
    padding: 0.28rem 0.52rem;
    font: inherit;
    color: color-mix(in srgb, var(--prompt-accent) 74%, var(--text));
    background: transparent;
    border: 1px solid color-mix(in srgb, var(--prompt-accent) 22%, transparent);
    border-radius: 999px;
    font-size: 0.61rem;
    cursor: pointer;
  }
  button:focus-visible { outline: 2px solid var(--prompt-accent); outline-offset: 2px; }
  .primary {
    color: #080b12;
    background: color-mix(in srgb, var(--prompt-accent) 78%, white);
    border-color: transparent;
    font-weight: 720;
  }
  @media (prefers-reduced-motion: reduce) {
    .reduced-motion-safe, .reduced-motion-safe * {
      animation: none !important;
      transition: none !important;
    }
  }
</style>

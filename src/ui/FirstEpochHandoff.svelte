<script lang="ts">
  import { onMount } from 'svelte'
  import { containModalKeydown } from '../accessibility/modal-focus'

  interface Props {
    rewardGlyph: string
    rewardName: string
    rewardGain: string
    recommendationName: string
    recommendationEffect: string
    onopen: () => void
    ondismiss: () => void
  }

  let {
    rewardGlyph,
    rewardName,
    rewardGain,
    recommendationName,
    recommendationEffect,
    onopen,
    ondismiss,
  }: Props = $props()
  let dialog: HTMLElement
  let primaryButton: HTMLButtonElement

  onMount(() => primaryButton.focus({ preventScroll: true }))
</script>

<div class="handoff-scrim reduced-motion-safe">
  <div
    bind:this={dialog}
    class="handoff-card instrument-panel"
    role="dialog"
    aria-modal="true"
    aria-labelledby="first-epoch-handoff-title"
    aria-describedby="first-epoch-handoff-summary"
    tabindex="-1"
    onkeydown={(event) => containModalKeydown(event, dialog, ondismiss)}
  >
    <header>
      <span aria-hidden="true">✦</span>
      <div>
        <small>first Epoch complete</small>
        <h2 id="first-epoch-handoff-title">The sky ended. Your progress did not.</h2>
      </div>
    </header>

    <p id="first-epoch-handoff-summary">Here is the new shape of your run before you begin again.</p>

    <dl>
      <div>
        <dt><span aria-hidden="true">◇</span> What grew</dt>
        <dd><strong>+{rewardGlyph}{rewardGain} {rewardName}</strong> now survives every Supernova. Each point permanently strengthens all production.</dd>
      </div>
      <div>
        <dt><span aria-hidden="true">◆</span> What stayed</dt>
        <dd>Your achievements, Archive discoveries, unlocked interface, story, and permanent record remain intact.</dd>
      </div>
      <div class="recommendation">
        <dt><span aria-hidden="true">✧</span> Buy first</dt>
        <dd><strong>{recommendationName}</strong> — {recommendationEffect}. It is the broadest start for a faster second sky.</dd>
      </div>
    </dl>

    <footer>
      <button bind:this={primaryButton} type="button" class="primary" onclick={onopen}>Open the Constellation</button>
      <button type="button" class="secondary" onclick={ondismiss}>Keep rebuilding</button>
    </footer>
  </div>
</div>

<style>
  .handoff-scrim {
    position: fixed;
    inset: 0;
    z-index: 32;
    display: grid;
    place-items: center;
    padding: 1rem;
    background: radial-gradient(circle at 50% 42%, rgba(186, 167, 255, 0.11), transparent 34%), rgba(2, 3, 8, 0.86);
    backdrop-filter: blur(12px);
    animation: handoff-in 420ms ease both;
  }
  .handoff-card {
    width: min(37rem, calc(100vw - 2rem));
    max-height: calc(100vh - 2rem);
    overflow-y: auto;
    padding: clamp(1.2rem, 3vw, 1.8rem);
    color: var(--text);
    background: linear-gradient(145deg, color-mix(in srgb, var(--panel) 94%, #100c22), color-mix(in srgb, var(--panel) 98%, #05050a));
    border: 1px solid rgba(198, 184, 255, 0.28);
    border-radius: 1.1rem;
    box-shadow: 0 1.5rem 5rem rgba(0, 0, 0, 0.52), inset 0 1px rgba(255, 255, 255, 0.04);
  }
  header { display: flex; align-items: center; gap: 0.82rem; }
  header > span { width: 2.65rem; aspect-ratio: 1; display: grid; place-items: center; color: #e4ddff; border: 1px solid rgba(198, 184, 255, 0.32); border-radius: 50%; box-shadow: 0 0 1.6rem rgba(198, 184, 255, 0.2); }
  header small { color: rgba(198, 184, 255, 0.72); font-size: 0.58rem; font-weight: 760; letter-spacing: 0.15em; text-transform: uppercase; }
  h2 { margin: 0.18rem 0 0; font: 560 clamp(1.08rem, 2.6vw, 1.45rem)/1.2 var(--font-story); }
  #first-epoch-handoff-summary { margin: 0.9rem 0 0; color: var(--dim); font: italic 0.82rem/1.45 var(--font-story); }
  dl { display: grid; gap: 0.55rem; margin: 1rem 0 0; }
  dl > div { display: grid; grid-template-columns: minmax(7.2rem, 0.34fr) minmax(0, 1fr); gap: 0.75rem; padding: 0.72rem 0.78rem; border: 1px solid rgba(198, 184, 255, 0.1); border-radius: 0.72rem; background: rgba(198, 184, 255, 0.025); }
  dl > div.recommendation { border-color: rgba(255, 217, 145, 0.2); background: rgba(255, 217, 145, 0.04); }
  dt { color: rgba(228, 221, 255, 0.72); font-size: 0.62rem; font-weight: 740; letter-spacing: 0.08em; text-transform: uppercase; }
  dt span { margin-right: 0.28rem; }
  dd { margin: 0; color: var(--dim); font-size: 0.72rem; line-height: 1.45; }
  dd strong { color: var(--text); font-weight: 680; }
  footer { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 0.5rem; margin-top: 1.1rem; }
  button { min-height: 2.55rem; padding: 0.6rem 1rem; border-radius: 999px; font: 680 0.7rem/1 var(--font-interface); cursor: pointer; }
  button:focus-visible { outline: 2px solid white; outline-offset: 2px; }
  .primary { color: #100d20; background: linear-gradient(180deg, #eeeaff, #bdb0f4); border: 0; }
  .secondary { color: rgba(228, 221, 255, 0.82); background: transparent; border: 1px solid rgba(198, 184, 255, 0.24); }
  @keyframes handoff-in { from { opacity: 0; } }
  @media (max-width: 560px) {
    dl > div { grid-template-columns: 1fr; gap: 0.3rem; }
    footer { display: grid; }
  }
  :global(html[data-motion='reduced']) .reduced-motion-safe,
  :global(html[data-motion='reduced']) .reduced-motion-safe * { animation: none !important; transition: none !important; }
  @media (prefers-reduced-motion: reduce) {
    .reduced-motion-safe, .reduced-motion-safe * { animation: none !important; transition: none !important; }
  }
</style>

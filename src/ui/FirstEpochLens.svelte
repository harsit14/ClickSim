<script lang="ts">
  import type { FirstEpochCeremonyModel } from '../experience/first-epoch'

  interface Props {
    model: FirstEpochCeremonyModel
    current: string
    target: string
    onaction: () => void
  }

  let { model, current, target, onaction }: Props = $props()
  const progressPercent = $derived(Math.round(model.progressRatio * 100))
</script>

{#if model.visible}
  <aside class="first-epoch-lens instrument-panel reduced-motion-safe" aria-labelledby="first-epoch-lens-title">
    <header>
      <span class="pin" aria-hidden="true">◆</span>
      <div>
        <span>first Epoch · pinned ceremony</span>
        <h2 id="first-epoch-lens-title">Ending is not failure</h2>
      </div>
    </header>

    <ol aria-label="First Epoch ceremony steps">
      {#each model.steps as step, index (step.id)}
        <li data-status={step.status} aria-current={step.status === 'current' ? 'step' : undefined}>
          <span aria-hidden="true">{step.status === 'complete' ? '✓' : index + 1}</span>
          <strong>{step.label}</strong>
        </li>
      {/each}
    </ol>

    <div class="progress-copy">
      <span>Epoch readiness</span>
      <strong>{current} / {target}</strong>
    </div>
    <progress max="1" value={model.progressRatio} aria-label={`First Epoch ${progressPercent}% ready`}></progress>

    {#if model.actionLabel}
      <button type="button" onclick={onaction}>{model.actionLabel}</button>
    {/if}
  </aside>
{/if}

<style>
  .first-epoch-lens {
    --ceremony-accent: #e4ddff;
    position: relative;
    width: min(22rem, calc(100vw - 2rem));
    padding: 0.82rem 0.9rem 0.9rem;
    color: var(--text, #f6efe3);
    background:
      radial-gradient(circle at 8% 0, rgba(198, 184, 255, 0.12), transparent 38%),
      linear-gradient(120deg, color-mix(in srgb, var(--panel) 88%, #080612), color-mix(in srgb, var(--panel) 96%, transparent));
    border: 1px solid rgba(198, 184, 255, 0.3);
    border-radius: 0.35rem 1rem 1rem 0.35rem;
    box-shadow: 0 0.9rem 2.8rem rgba(0, 0, 0, 0.24), inset 2px 0 rgba(228, 221, 255, 0.74);
    backdrop-filter: blur(16px);
  }
  header { display: flex; align-items: center; gap: 0.62rem; }
  header div { min-width: 0; }
  .pin { color: var(--ceremony-accent); filter: drop-shadow(0 0 0.5rem rgba(198, 184, 255, 0.68)); }
  header span:not(.pin) { display: block; color: rgba(198, 184, 255, 0.72); font-size: 0.54rem; font-weight: 760; letter-spacing: 0.13em; text-transform: uppercase; }
  h2 { margin: 0.12rem 0 0; font: 540 0.88rem/1.25 var(--font-story); }
  ol { display: grid; gap: 0.32rem; margin: 0.72rem 0 0.68rem; padding: 0; list-style: none; }
  li { display: grid; grid-template-columns: 1.35rem minmax(0, 1fr); align-items: center; gap: 0.42rem; color: var(--dim); opacity: 0.52; }
  li span { width: 1.25rem; aspect-ratio: 1; display: grid; place-items: center; border: 1px solid rgba(198, 184, 255, 0.2); border-radius: 50%; font-size: 0.56rem; }
  li strong { font-size: 0.65rem; font-weight: 590; }
  li[data-status='complete'] { color: rgba(205, 238, 206, 0.82); opacity: 0.76; }
  li[data-status='current'] { color: var(--ceremony-accent); opacity: 1; }
  li[data-status='current'] span { background: rgba(198, 184, 255, 0.14); border-color: rgba(228, 221, 255, 0.58); box-shadow: 0 0 0.8rem rgba(198, 184, 255, 0.14); }
  .progress-copy { display: flex; justify-content: space-between; gap: 0.7rem; color: var(--dim); font-size: 0.56rem; }
  .progress-copy strong { color: rgba(228, 221, 255, 0.78); font-variant-numeric: tabular-nums; }
  progress { width: 100%; height: 0.28rem; display: block; margin-top: 0.3rem; accent-color: #c6b8ff; }
  button {
    width: 100%;
    min-height: 2.25rem;
    margin-top: 0.72rem;
    color: #100d20;
    background: linear-gradient(180deg, #eeeaff, #bdb0f4);
    border: 0;
    border-radius: 999px;
    font: 720 0.66rem/1 var(--font-interface);
    cursor: pointer;
  }
  button:hover { filter: brightness(1.06); }
  button:focus-visible { outline: 2px solid white; outline-offset: 2px; }
  @media (prefers-reduced-motion: reduce) {
    .reduced-motion-safe, .reduced-motion-safe * { animation: none !important; transition: none !important; }
  }
</style>

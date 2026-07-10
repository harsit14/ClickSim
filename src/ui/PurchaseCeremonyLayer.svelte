<script lang="ts">
  import { format } from '../core/format'
  import { liveFeedback } from '../feedback/live-runtime.svelte'

  const now = () => performance.now()
</script>

<div
  class="ceremony-layer"
  class:fallback={liveFeedback.visualFallbackEventId !== null}
  aria-hidden="true"
  data-active-ceremonies={liveFeedback.ceremonies.length}
>
  {#each liveFeedback.ceremonies as ceremony (ceremony.ceremonyId)}
    {@const delay = Math.max(0, ceremony.startsAtMs - now())}
    {@const duration = ceremony.endsAtMs - ceremony.startsAtMs}
    <div
      class="purchase-ceremony"
      class:reduced={ceremony.phases[0]?.presentation !== 'authored-motion'}
      data-ceremony-id={ceremony.ceremonyId}
      data-destination={ceremony.destination.kind === 'world-object' ? ceremony.destination.id : 'none'}
      style={`--delay:${delay}ms;--duration:${duration}ms;--intensity:${ceremony.intensity}`}
    >
      <span class="price">−{format(ceremony.exactCost)}</span>
      <span class="path"></span>
      <span class="delta">+{format(ceremony.exactRateDelta)}/s</span>
    </div>
  {/each}
</div>

<p class="sr-live" role="status" aria-live="polite" aria-atomic="true">
  {liveFeedback.announcement}
</p>

<style>
  .ceremony-layer {
    position: fixed;
    inset: 0;
    z-index: 7;
    pointer-events: none;
  }
  .purchase-ceremony {
    position: absolute;
    top: 52%;
    left: 50%;
    width: clamp(8rem, 22vw, 14rem);
    height: 4rem;
    color: var(--gold);
    opacity: 0;
    transform: translate(-50%, -50%);
    animation: purchase-answer var(--duration) cubic-bezier(.2,.7,.25,1) var(--delay) both;
  }
  .price,
  .delta {
    position: absolute;
    padding: 0.2rem 0.42rem;
    background: color-mix(in srgb, var(--panel) 82%, transparent);
    border: 1px solid color-mix(in srgb, currentColor 34%, transparent);
    border-radius: 999px;
    font-size: 0.72rem;
    font-weight: 750;
    font-variant-numeric: tabular-nums;
  }
  .price { top: 0; right: 0; }
  .delta { bottom: 0; left: 0; color: var(--text); }
  .path {
    position: absolute;
    inset: 1.4rem 20% 1.4rem 20%;
    border-top: 2px solid currentColor;
    transform: rotate(-16deg) scaleX(calc(0.65 + var(--intensity) * 0.35));
    transform-origin: center;
    filter: drop-shadow(0 0 7px currentColor);
  }
  .path::after {
    content: '';
    position: absolute;
    right: -0.15rem;
    top: -0.33rem;
    width: 0.55rem;
    height: 0.55rem;
    background: currentColor;
    clip-path: polygon(0 0, 100% 50%, 0 100%, 28% 50%);
  }
  .fallback::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 7rem;
    aspect-ratio: 1;
    border: 3px double var(--gold);
    border-radius: 50%;
    opacity: 0;
    transform: translate(-50%, -50%);
    animation: fallback-pulse 650ms ease-out;
  }
  .reduced { animation-name: purchase-crossfade; }
  .sr-live {
    position: fixed;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
  @keyframes purchase-answer {
    0% { opacity: 0; transform: translate(-38%, -42%) scale(0.84); }
    16% { opacity: 1; }
    62% { opacity: 1; transform: translate(-50%, -54%) scale(1); }
    100% { opacity: 0; transform: translate(-56%, -62%) scale(1.02); }
  }
  @keyframes purchase-crossfade {
    0%, 100% { opacity: 0; }
    22%, 72% { opacity: 1; }
  }
  @keyframes fallback-pulse {
    0% { opacity: 0.9; transform: translate(-50%, -50%) scale(0.7); }
    100% { opacity: 0; transform: translate(-50%, -50%) scale(1.15); }
  }
  @media (prefers-reduced-motion: reduce) {
    .purchase-ceremony { animation-name: purchase-crossfade; }
    .path { transform: rotate(-16deg); }
  }
</style>

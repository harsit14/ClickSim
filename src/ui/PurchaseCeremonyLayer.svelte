<script lang="ts">
  import { liveFeedback } from '../feedback/live-runtime.svelte'
</script>

<div
  class="feedback-layer"
  class:fallback={liveFeedback.visualFallbackEventId !== null}
  aria-hidden="true"
></div>

<p class="sr-live" role="status" aria-live="polite" aria-atomic="true">
  {liveFeedback.announcement}
</p>

<style>
  .feedback-layer {
    position: fixed;
    inset: 0;
    z-index: 7;
    pointer-events: none;
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
  @keyframes fallback-pulse {
    0% { opacity: 0.9; transform: translate(-50%, -50%) scale(0.7); }
    100% { opacity: 0; transform: translate(-50%, -50%) scale(1.15); }
  }
</style>

<script lang="ts">
  import { combo, comboMult } from '../systems/combo.svelte'

  const mult = $derived(comboMult())
  const next = $derived(
    combo.streak < 4
      ? 4
      : combo.streak < 8
        ? 8
        : combo.streak < 16
          ? 16
          : combo.streak < 32
            ? 32
            : combo.streak < 64
              ? 64
              : null,
  )
</script>

{#if combo.streak >= 4}
  <div class="combo" class:hot={mult >= 10} class:blazing={mult >= 20}>
    ♪ ×{mult} <em>{combo.streak} on beat{#if next} · next {next}{/if}</em>
  </div>
{/if}

<style>
  .combo {
    position: fixed;
    top: 62%;
    left: 50%;
    transform: translateX(-50%);
    font-size: 1rem;
    font-weight: 700;
    color: var(--gold);
    text-shadow: 0 0 16px rgba(255, 179, 92, 0.5);
    pointer-events: none;
    animation: combo-in 0.25s ease both;
  }
  .combo.hot {
    color: #fff1d0;
    text-shadow: 0 0 22px rgba(255, 210, 130, 0.9);
  }
  .combo.blazing {
    color: #ffffff;
    text-shadow:
      0 0 18px rgba(255, 241, 208, 0.95),
      0 0 34px rgba(105, 235, 255, 0.55);
  }
  .combo em {
    font-style: normal;
    font-size: 0.75rem;
    font-weight: 500;
    color: var(--dim);
    margin-left: 0.4rem;
  }
  @keyframes combo-in {
    from { opacity: 0; transform: translateX(-50%) scale(0.85); }
    to { opacity: 1; transform: translateX(-50%) scale(1); }
  }
</style>

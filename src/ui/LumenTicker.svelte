<script lang="ts">
  import { game } from '../engine/game.svelte'
  import { universeById } from '../content/universes'
  import { gamePaused } from '../core/pause.svelte'

  let current = $state<string | null>(null)
  let currentUniverse = $state(game.activeUniverse)
  let timer: ReturnType<typeof setTimeout> | undefined

  $effect(() => {
    const universeId = game.activeUniverse
    if (currentUniverse !== universeId) {
      currentUniverse = universeId
      current = null
      clearTimeout(timer)
    }
    if (gamePaused()) return
    if (current) return
    const line = universeById(universeId).lumen.find((l) => !game.seen.includes(l.id) && l.when(game))
    if (!line) return
    game.seen.push(line.id)
    current = line.text
    clearTimeout(timer)
    timer = setTimeout(() => (current = null), 7000)
  })
</script>

{#if current}
  {#key current}
    <p class="lumen">{current}</p>
  {/key}
{/if}

<style>
  .lumen {
    position: fixed;
    bottom: 6vh;
    left: 50%;
    transform: translateX(-50%);
    max-width: min(80vw, 34rem);
    margin: 0;
    font-family: Georgia, 'Times New Roman', serif;
    font-style: italic;
    font-size: 1.02rem;
    text-align: center;
    color: rgba(210, 205, 235, 0.75);
    text-shadow: 0 0 18px rgba(120, 110, 200, 0.25);
    animation: lumen-in 1.2s ease both;
    pointer-events: none;
  }
  @keyframes lumen-in {
    from { opacity: 0; transform: translateX(-50%) translateY(8px); }
    to { opacity: 1; transform: translateX(-50%) translateY(0); }
  }
  @media (max-width: 720px) {
    .lumen {
      bottom: 42vh;
    }
  }
</style>

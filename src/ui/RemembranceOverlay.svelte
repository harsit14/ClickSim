<script lang="ts">
  import { onMount } from 'svelte'
  import { game, performRemembrance } from '../engine/game.svelte'
  import { save } from '../core/save'
  import { clearBuffs } from '../systems/buffs.svelte'
  import { combo } from '../systems/combo.svelte'
  import { isPlaying, startMusic, stopMusic } from '../audio/music'
  import { playCollect } from '../audio/sfx'
  import { worldRef } from '../render/world-ref'

  let { onfinished }: { onfinished: () => void } = $props()

  let text = $state('the archive closes its eyes')
  let resumeMusic = false
  let veil: HTMLDivElement

  function finish() {
    if (resumeMusic && game.ui.includes('music')) startMusic()
    onfinished()
  }

  onMount(() => {
    queueMicrotask(() => veil?.focus())
    resumeMusic = isPlaying()
    stopMusic()
    const timers = [
      setTimeout(() => {
        performRemembrance()
        clearBuffs()
        combo.streak = 0
        combo.lastRewardAt = 0
        worldRef()?.endCollapse()
        save()
        playCollect()
        text = 'and remembers everything'
      }, 2_200),
      setTimeout(finish, 4_600),
    ]
    return () => timers.forEach(clearTimeout)
  })
</script>

<div
  bind:this={veil}
  class="veil"
  role="dialog"
  aria-modal="true"
  aria-label="Remembrance"
  tabindex="-1"
>
  {#key text}
    <p>{text}</p>
  {/key}
</div>

<style>
  .veil {
    position: fixed;
    inset: 0;
    z-index: 30;
    display: grid;
    place-items: center;
    background: #000;
    animation: veil 4.6s ease both;
  }
  @keyframes veil {
    from { opacity: 0; }
    12% { opacity: 1; }
    82% { opacity: 1; }
    to { opacity: 0; }
  }
  p {
    margin: 0;
    font-family: Georgia, 'Times New Roman', serif;
    font-style: italic;
    font-size: 1.1rem;
    color: rgba(200, 195, 230, 0.75);
    animation: text-in 1.2s ease both;
  }
  @keyframes text-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }
</style>

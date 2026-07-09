<script lang="ts">
  import { QUESTION_LINES, ENDING_CHOICES, ENDING_BONUS, type Ending } from '../content/endings'
  import { ECHOES } from '../content/echoes'
  import { game, chooseEnding } from '../engine/game.svelte'
  import { save } from '../core/save'
  import { stopMusic, startMusic } from '../audio/music'
  import { playSupernova, playBloom, playCollect } from '../audio/sfx'
  import { onMount } from 'svelte'

  let { onclose }: { onclose: () => void } = $props()

  type Stage = 'lines' | 'choice' | 'epilogue'
  let stage = $state<Stage>('lines')
  let lineIdx = $state(0)
  let epilogue = $state<string[]>([])
  let epilogueIdx = $state(0)

  const allEchoes = $derived(game.echoes.length >= ECHOES.length)
  const isFinal = $derived(lineIdx === QUESTION_LINES.length - 1)

  function advance() {
    if (stage === 'lines') {
      if (isFinal) stage = 'choice'
      else lineIdx += 1
    } else if (stage === 'epilogue') {
      if (epilogueIdx < epilogue.length - 1) epilogueIdx += 1
      else finish()
    }
  }

  function choose(id: Ending) {
    const choice = ENDING_CHOICES.find((c) => c.id === id)!
    chooseEnding(id)
    save()
    if (id === 'warden') playBloom()
    else if (id === 'hunger') playSupernova()
    else playCollect()
    epilogue = choice.epilogue
    epilogueIdx = 0
    stage = 'epilogue'
  }

  function finish() {
    onclose()
    if (game.ui.includes('music')) startMusic()
  }

  onMount(() => {
    stopMusic()
  })
</script>

<div
  class="question"
  onclick={advance}
  onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && advance()}
  role="button"
  tabindex="0"
>
  <div class="bar top"></div>
  <div class="bar bottom"></div>

  {#if stage === 'lines'}
    {#key lineIdx}
      <p class="line" class:final={isFinal}>{QUESTION_LINES[lineIdx]}</p>
    {/key}
    <span class="hint">{isFinal ? 'answer' : 'continue'} ›</span>
  {:else if stage === 'choice'}
    <div class="choices" role="group">
      {#each ENDING_CHOICES as c (c.id)}
        {#if !c.secret || allEchoes}
          <button class="choice {c.id}" onclick={(e) => { e.stopPropagation(); choose(c.id) }}>
            <strong>{c.label}</strong>
            <em>“{c.line}”</em>
            <span class="bonus">{ENDING_BONUS[c.id]}</span>
          </button>
        {/if}
      {/each}
      {#if !allEchoes}
        <p class="locked">a third answer sleeps in the unrecovered echoes</p>
      {/if}
    </div>
  {:else}
    {#key epilogueIdx}
      <p class="line epilogue-line">{epilogue[epilogueIdx]}</p>
    {/key}
    <span class="hint">{epilogueIdx < epilogue.length - 1 ? 'continue' : 'return to the light'} ›</span>
  {/if}
</div>

<style>
  .question {
    position: fixed;
    inset: 0;
    z-index: 25;
    background: rgba(2, 2, 6, 0.96);
    display: grid;
    place-items: center;
    cursor: pointer;
    animation: q-in 1.2s ease both;
    outline: none;
  }
  @keyframes q-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  .bar {
    position: absolute;
    left: 0;
    right: 0;
    height: 9vh;
    background: #000;
  }
  .bar.top { top: 0; }
  .bar.bottom { bottom: 0; }

  .line {
    max-width: min(80vw, 38rem);
    margin: 0;
    font-family: Georgia, 'Times New Roman', serif;
    font-style: italic;
    font-size: 1.25rem;
    line-height: 1.7;
    text-align: center;
    color: rgba(222, 216, 245, 0.92);
    animation: line-in 1s ease both;
  }
  .line.final {
    font-size: 2rem;
    font-style: normal;
    font-weight: 600;
    color: #fff;
    text-shadow: 0 0 30px rgba(200, 190, 255, 0.5);
  }
  @keyframes line-in {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .hint {
    position: absolute;
    bottom: 12vh;
    left: 50%;
    transform: translateX(-50%);
    font-size: 0.78rem;
    color: rgba(140, 135, 160, 0.7);
    animation: hint-in 1s ease 1.2s both;
  }
  @keyframes hint-in {
    from { opacity: 0; }
    to { opacity: 0.9; }
  }

  .choices {
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
    width: min(88vw, 26rem);
    cursor: default;
  }
  .choice {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    padding: 0.9rem 1.1rem;
    font: inherit;
    text-align: left;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 14px;
    color: var(--text);
    cursor: pointer;
    transition: border-color 0.2s, box-shadow 0.2s, transform 0.08s;
    animation: line-in 0.8s ease both;
  }
  .choice:hover { transform: translateY(-2px); }
  .choice.warden:hover {
    border-color: rgba(255, 217, 138, 0.6);
    box-shadow: 0 0 26px rgba(255, 200, 110, 0.18);
  }
  .choice.hunger:hover {
    border-color: rgba(255, 110, 65, 0.6);
    box-shadow: 0 0 26px rgba(255, 90, 45, 0.18);
  }
  .choice.companion:hover {
    border-color: rgba(180, 190, 255, 0.65);
    box-shadow: 0 0 26px rgba(160, 170, 255, 0.2);
  }
  .choice strong { font-size: 1.05rem; }
  .choice.warden strong { color: var(--gold); }
  .choice.hunger strong { color: #ff9d78; }
  .choice.companion strong { color: #c3cbff; }
  .choice em {
    font-family: Georgia, serif;
    font-size: 0.88rem;
    color: var(--dim);
  }
  .bonus {
    font-size: 0.72rem;
    color: rgba(160, 200, 220, 0.75);
  }
  .locked {
    margin: 0.2rem 0 0;
    font-family: Georgia, serif;
    font-style: italic;
    font-size: 0.78rem;
    text-align: center;
    color: rgba(120, 116, 145, 0.7);
  }
  .epilogue-line { color: rgba(235, 230, 250, 0.95); }
</style>

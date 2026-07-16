<script lang="ts">
  import {
    ENDING_BONUS,
    conclusionLinesFor,
    realmAnswerChoice,
    realmConclusion,
    type RealmAnswerId,
  } from '../content/endings'
  import { universeById, type UniverseId } from '../content/universes'
  import { game, chooseRealmAnswer, recordRevisedRealmConclusion } from '../engine/game.svelte'
  import { format } from '../core/format'
  import { save } from '../core/save'
  import { isPlaying, stopMusic, startMusic } from '../audio/music'
  import { playSupernova, playBloom, playCollect } from '../audio/sfx'
  import { onMount } from 'svelte'
  import { questionInfallBeat } from '../content/infall-rhyme'
  import QuestionInfallRhyme from './QuestionInfallRhyme.svelte'

  let {
    onclose,
    universeId = game.activeUniverse as UniverseId,
    reviewAnswerId = null,
    recordOnly = false,
  }: {
    onclose: () => void
    universeId?: UniverseId
    reviewAnswerId?: RealmAnswerId | null
    recordOnly?: boolean
  } = $props()

  type Stage = 'lines' | 'choice' | 'epilogue' | 'ending'
  let stage = $state<Stage>('lines')
  let lineIdx = $state(0)
  let chosenId = $state<RealmAnswerId | null>(null)
  let epilogue = $state<string[]>([])
  let epilogueIdx = $state(0)
  let resumeMusic = false
  let dialog: HTMLDivElement

  const review = $derived(reviewAnswerId !== null)
  const archivedMode = $derived(review || recordOnly)
  const universe = $derived(universeById(universeId))
  const conclusion = $derived(realmConclusion(universeId))
  // A replay is a historical record. Do not rewrite it with a callback chosen
  // during a later Remembrance; only a newly reached Question gets live echoes.
  const storyLines = $derived(archivedMode
    ? conclusion.lines
    : conclusionLinesFor(universeId, game.realmAnswers))
  const run = $derived(universeId === game.activeUniverse ? game : game.universeRuns[universeId] ?? null)
  const runEchoes = $derived(run?.echoes ?? [])
  const allEchoes = $derived(recordOnly || runEchoes.length >= universe.echoes.length)
  const isFinal = $derived(lineIdx === storyLines.length - 1)
  const chosen = $derived(realmAnswerChoice(chosenId))
  const infallBeat = $derived(
    stage === 'lines' && universeId === 'emberlight' ? questionInfallBeat(lineIdx) : null,
  )

  $effect(() => {
    if (reviewAnswerId !== null && chosenId === null) chosenId = reviewAnswerId
  })

  $effect(() => {
    stage
    lineIdx
    epilogueIdx
    queueMicrotask(() => dialog?.querySelector<HTMLElement>('[data-story-focus]')?.focus())
  })

  function advance() {
    if (stage === 'lines') {
      if (isFinal && review && chosen) beginEpilogue(chosen.id)
      else if (isFinal) stage = 'choice'
      else lineIdx += 1
    } else if (stage === 'epilogue') {
      if (epilogueIdx < epilogue.length - 1) epilogueIdx += 1
      else stage = 'ending'
    }
  }

  function beginEpilogue(id: RealmAnswerId) {
    const answer = realmAnswerChoice(id)
    if (!answer) return
    epilogue = [answer.acknowledgment, ...answer.epilogue]
    epilogueIdx = 0
    stage = 'epilogue'
  }

  function choose(id: RealmAnswerId) {
    if (stage !== 'choice' || chosenId !== null) return
    const answer = realmAnswerChoice(id)
    if (!answer) return
    const recorded = recordOnly
      ? recordRevisedRealmConclusion(universeId, id)
      : chooseRealmAnswer(id)
    if (!recorded) return
    chosenId = id
    save()
    beginEpilogue(id)
    // Audio is ornament, never authority: a suspended/unsupported context must
    // not strand the player after their answer has already been saved.
    try {
      if (answer.doctrine === 'warden') playBloom()
      else if (answer.doctrine === 'hunger' && universeId === 'emberlight') playSupernova()
      else if (answer.doctrine === 'hunger') playCollect()
      else playCollect()
    } catch {
      // the visual ending continues in silence
    }
  }

  function finish() {
    onclose()
    if (resumeMusic && game.ui.includes('music')) startMusic()
  }

  function cancel() {
    if (stage === 'epilogue' && !review) return
    finish()
  }

  function onDialogKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      event.preventDefault()
      cancel()
      return
    }
    if (event.key !== 'Tab') return
    const controls = Array.from(dialog.querySelectorAll<HTMLButtonElement>('button:not(:disabled)'))
    if (controls.length === 0) return
    const first = controls[0]
    const last = controls[controls.length - 1]
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }

  onMount(() => {
    resumeMusic = isPlaying()
    stopMusic()
  })
</script>

<svelte:window onkeydown={onDialogKeydown} />

<div
  bind:this={dialog}
  class="question"
  class:warden={chosen?.doctrine === 'warden'}
  class:hunger={chosen?.doctrine === 'hunger'}
  class:companion={chosen?.doctrine === 'companion'}
  role="dialog"
  aria-modal="true"
  aria-label={`The Question of ${universe.shortName}`}
  tabindex="-1"
  data-universe={universeId}
  data-review={archivedMode}
  style={`--realm-hue:${universe.palette.accentHue}`}
>
  <div class="scene-glow" aria-hidden="true"></div>
  <div class="realm-watermark" aria-hidden="true">{universe.route.glyph}</div>
  <div class="bar top" aria-hidden="true"></div>
  <div class="bar bottom" aria-hidden="true"></div>

  {#if infallBeat}
    {#key infallBeat.id}
      <QuestionInfallRhyme beat={infallBeat} />
    {/key}
  {/if}

  {#if stage === 'lines' || stage === 'choice'}
    <button class="leave" aria-label={`Leave the Question of ${universe.shortName}`} onclick={(event) => { event.stopPropagation(); cancel() }}>×</button>
  {/if}

  {#if stage === 'lines'}
    <button class="story-step" onclick={advance} data-story-focus>
      <span class="sequence">act {conclusion.act} · {conclusion.archiveTitle.toLowerCase()} · {lineIdx + 1}/{storyLines.length}</span>
      <span class="sequence-track" aria-hidden="true"><i style:width={`${((lineIdx + 1) / storyLines.length) * 100}%`}></i></span>
      {#key lineIdx}
        <span class="line" class:final={isFinal} aria-live="polite">{storyLines[lineIdx]}</span>
      {/key}
      <span class="hint">{isFinal ? 'answer' : 'continue'} <b>›</b></span>
    </button>
  {:else if stage === 'choice'}
    <section class="choice-stage" aria-labelledby="question-title">
      <span class="eyebrow">{universe.shortName} · {conclusion.title} · {recordOnly ? 'the revised answer enters the archive' : 'the answer becomes law'}</span>
      <h2 id="question-title">{conclusion.question}</h2>
      <p class="choice-intro">{recordOnly
        ? 'This choice repairs a missing story record. It joins the saga without overwriting the law your current run carries.'
        : 'Each answer protects something real and accepts a different debt. The Vessel, Lumen, and the Garden will remember it.'}</p>

      <div class="choices" role="group" aria-label={`Choose an answer to: ${conclusion.question}`}>
        {#each conclusion.choices as choice, index (choice.id)}
          {@const locked = !!choice.secret && !allEchoes}
          <button
            class="choice {choice.doctrine}"
            class:locked
            disabled={locked}
            aria-label={locked ? `A third ${universe.shortName} answer is locked until every Echo is recovered` : `${choice.label}. ${choice.stance} Benefit: ${choice.benefit} Cost: ${choice.cost}`}
            data-story-focus={index === 0 ? '' : undefined}
            onclick={() => choose(choice.id)}
          >
            <span class="choice-glyph" aria-hidden="true">{locked ? '◇' : choice.glyph}</span>
            <span class="choice-doctrine">{locked ? 'an answer in the margins' : choice.stance}</span>
            <strong>{locked ? 'A Third Answer' : choice.label}</strong>
            <em>{locked ? 'The archive is incomplete. Lumen is still holding a page open.' : `“${choice.line}”`}</em>
            {#if !locked}
              <span class="tradeoff"><small>protects</small>{choice.benefit}</span>
              <span class="tradeoff cost"><small>accepts</small>{choice.cost}</span>
            {/if}
            <span class="choice-law">
              <small>{locked ? 'echoes recovered' : recordOnly ? 'revised archive record' : choice.lawName}</small>
              {locked ? `${runEchoes.length}/${universe.echoes.length}` : recordOnly ? 'current run remains unchanged' : ENDING_BONUS[choice.doctrine]}
            </span>
          </button>
        {/each}
      </div>
    </section>
  {:else if stage === 'epilogue' && chosen}
    <button class="story-step epilogue" onclick={advance} data-story-focus>
      <span class="ending-mark" aria-hidden="true">{chosen.glyph}</span>
      <span class="sequence">{chosen.label} · final entry {epilogueIdx + 1}/{epilogue.length}</span>
      <span class="sequence-track" aria-hidden="true"><i style:width={`${((epilogueIdx + 1) / epilogue.length) * 100}%`}></i></span>
      {#key epilogueIdx}
        <span class="line epilogue-line" aria-live="polite">{epilogue[epilogueIdx]}</span>
      {/key}
      <span class="hint">{epilogueIdx < epilogue.length - 1 ? 'continue' : review ? 'return to the record' : 'record the answer'} <b>›</b></span>
    </button>
  {:else if stage === 'ending' && chosen}
    <section class="ending-tableau" aria-labelledby="ending-title">
      <div class="orbit one" aria-hidden="true"></div>
      <div class="orbit two" aria-hidden="true"></div>
      <span class="eyebrow">{review ? 'revisited entry' : recordOnly ? 'revised entry recorded' : 'answer recorded'} · {universe.shortName}</span>
      <div class="final-glyph" aria-hidden="true">{chosen.glyph}<small>{universe.route.glyph}</small></div>
      <h2 id="ending-title">{chosen.label}</h2>
      <p class="doctrine">{conclusion.tableau}</p>
      <blockquote>{chosen.coda}</blockquote>

      <div class="permanent-law">
        <span>{recordOnly ? 'revised Archive record · no current run overwritten' : `${chosen.lawName} · the law this Vessel carries`}</span>
        <strong>{recordOnly ? 'carried into the saga' : ENDING_BONUS[chosen.doctrine]}</strong>
      </div>

      <dl class="journey" aria-label="Your journey">
        <div><dt>{universe.currency.toLowerCase()} remembered</dt><dd>{universe.currencyGlyph} {format(run?.totalEarned ?? 0)}</dd></div>
        <div><dt>epoch turns completed</dt><dd>{run?.supernovae ?? 0}</dd></div>
        <div><dt>deep boundaries crossed</dt><dd>{run?.collapses ?? 0}</dd></div>
        <div><dt>trials endured</dt><dd>{run?.challengesDone.length ?? 0}/12</dd></div>
        <div><dt>echoes recovered</dt><dd>{runEchoes.length}/{universe.echoes.length}</dd></div>
        <div><dt>archive records held</dt><dd>{run?.curiosities.length ?? 0}</dd></div>
      </dl>

      <p class="afterword">{conclusion.afterword}</p>
      <button class="return" onclick={finish} data-story-focus>{review ? 'Close the revisited entry' : recordOnly ? 'Return to the Story Archive' : `Return to the ${universe.currency.toLowerCase()}`}</button>
    </section>
  {/if}
</div>

<style>
  .question {
    position: fixed;
    inset: 0;
    z-index: 25;
    overflow: hidden;
    display: grid;
    place-items: center;
    color: #ece9f5;
    background:
      radial-gradient(circle at 50% 48%, hsla(var(--realm-hue), 62%, 42%, 0.16), transparent 38%),
      rgba(2, 2, 7, 0.985);
    animation: q-in 1.1s ease both;
    outline: none;
  }
  .scene-glow {
    position: absolute;
    inset: 9vh 0;
    opacity: 0;
    background: radial-gradient(circle at 50% 48%, hsla(var(--realm-hue), 74%, 68%, 0.14), transparent 36%);
    transition: opacity 1.8s ease, background 1.8s ease;
  }
  .realm-watermark {
    position: absolute;
    z-index: 0;
    font: 400 min(46vw, 34rem)/1 Georgia, serif;
    color: hsla(var(--realm-hue), 76%, 72%, 0.035);
    transform: rotate(-8deg);
    pointer-events: none;
    user-select: none;
  }
  .question[data-universe='tidefall'] .realm-watermark,
  .question[data-universe='vishnulok'] .realm-watermark { transform: rotate(7deg) scaleX(1.2); }
  .question[data-universe='verdance'] .realm-watermark,
  .question[data-universe='brahmalok'] .realm-watermark { transform: rotate(-14deg) scale(1.08); }
  .question[data-universe='clockwork'] .realm-watermark { transform: rotate(24deg) scale(0.92); }
  .question[data-universe='kailash'] .realm-watermark { transform: translateY(-2vh) scale(1.14); }
  .question.warden .scene-glow { opacity: 1; background: radial-gradient(circle at 50% 48%, rgba(255, 216, 140, 0.18), transparent 39%); }
  .question.hunger .scene-glow { opacity: 1; background: radial-gradient(circle at 50% 48%, rgba(255, 76, 35, 0.2), transparent 42%); }
  .question.companion .scene-glow { opacity: 1; background: radial-gradient(circle at 50% 48%, rgba(160, 178, 255, 0.2), transparent 42%); }
  @keyframes q-in { from { opacity: 0; } to { opacity: 1; } }

  .bar {
    position: absolute;
    left: 0;
    right: 0;
    z-index: 4;
    height: 9vh;
    background: #000;
    pointer-events: none;
  }
  .bar.top { top: 0; border-bottom: 1px solid rgba(255, 255, 255, 0.025); }
  .bar.bottom { bottom: 0; border-top: 1px solid rgba(255, 255, 255, 0.025); }
  .leave {
    position: absolute;
    top: calc(9vh + 0.9rem);
    right: 1.15rem;
    z-index: 6;
    width: 2.25rem;
    height: 2.25rem;
    padding: 0;
    font: inherit;
    font-size: 1.3rem;
    color: rgba(190, 184, 210, 0.68);
    background: rgba(255, 255, 255, 0.025);
    border: 1px solid rgba(255, 255, 255, 0.09);
    border-radius: 999px;
    cursor: pointer;
  }
  .leave:hover,
  .leave:focus-visible { color: #fff; border-color: rgba(200, 190, 255, 0.42); outline: none; }

  .story-step {
    position: absolute;
    inset: 9vh 0;
    z-index: 2;
    display: grid;
    place-items: center;
    padding: 0;
    font: inherit;
    color: inherit;
    background: transparent;
    border: 0;
    cursor: pointer;
    outline: none;
  }
  .story-step:focus-visible { box-shadow: inset 0 0 0 1px rgba(200, 190, 255, 0.24); }
  .sequence {
    position: absolute;
    top: 2.1rem;
    left: 50%;
    transform: translateX(-50%);
    font-size: 0.6875rem;
    font-weight: 700;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: color-mix(in srgb, var(--dim) 88%, white);
    white-space: nowrap;
  }
  .sequence-track {
    position: absolute;
    top: 3.65rem;
    left: 50%;
    width: min(18rem, 54vw);
    height: 1px;
    overflow: hidden;
    transform: translateX(-50%);
    background: rgba(255, 255, 255, 0.07);
  }
  .sequence-track i { display: block; height: 100%; background: rgba(210, 198, 242, 0.7); transition: width 0.6s ease; }
  .line {
    display: block;
    max-width: min(80vw, 42rem);
    font-family: Georgia, 'Times New Roman', serif;
    font-size: clamp(1.08rem, 2.2vw, 1.32rem);
    font-style: italic;
    line-height: 1.75;
    text-align: center;
    color: rgba(225, 219, 242, 0.92);
    animation: line-in 0.85s ease both;
  }
  .line.final {
    font-size: clamp(2rem, 5vw, 3.2rem);
    font-style: normal;
    font-weight: 500;
    letter-spacing: -0.03em;
    color: #fff;
    text-shadow: 0 0 38px rgba(200, 190, 255, 0.48);
  }
  @keyframes line-in { from { opacity: 0; transform: translateY(9px); } to { opacity: 1; transform: translateY(0); } }
  .hint {
    position: absolute;
    bottom: 2.3rem;
    left: 50%;
    transform: translateX(-50%);
    font-size: 0.68rem;
    letter-spacing: 0.08em;
    color: rgba(140, 135, 160, 0.72);
    animation: hint-in 0.8s ease 0.75s both;
  }
  .hint b { margin-left: 0.3rem; font-size: 1rem; font-weight: 400; }
  @keyframes hint-in { from { opacity: 0; } to { opacity: 1; } }
  .ending-mark {
    position: absolute;
    top: 22%;
    font-size: 2.4rem;
    color: rgba(255, 217, 138, 0.52);
    text-shadow: 0 0 30px currentColor;
  }
  .hunger .ending-mark { color: rgba(255, 106, 67, 0.58); }
  .companion .ending-mark { color: rgba(178, 190, 255, 0.62); }

  .choice-stage {
    position: relative;
    z-index: 3;
    width: min(68rem, 92vw);
    max-height: 76vh;
    overflow-y: auto;
    padding: 1.4rem 0.7rem 1.7rem;
    text-align: center;
    scrollbar-width: thin;
  }
  .eyebrow {
    display: block;
    font-size: 0.6rem;
    font-weight: 700;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: rgba(174, 165, 205, 0.74);
  }
  .choice-stage h2,
  .ending-tableau h2 {
    margin: 0.35rem 0 0;
    font-family: Georgia, 'Times New Roman', serif;
    font-size: clamp(2rem, 5vw, 3.35rem);
    font-weight: 500;
    letter-spacing: -0.04em;
  }
  .choice-intro {
    max-width: 35rem;
    margin: 0.45rem auto 1.5rem;
    font-family: Georgia, serif;
    font-size: 0.86rem;
    font-style: italic;
    color: var(--dim);
  }
  .choices { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 0.8rem; }
  .choice {
    min-height: 25rem;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding: 1.15rem;
    font: inherit;
    text-align: left;
    color: var(--text);
    background: linear-gradient(160deg, rgba(255, 255, 255, 0.045), rgba(255, 255, 255, 0.012));
    border: 1px solid rgba(255, 255, 255, 0.11);
    border-radius: 18px;
    cursor: pointer;
    transition: transform 0.18s ease, border-color 0.25s ease, box-shadow 0.25s ease;
    animation: choice-in 0.7s ease both;
  }
  .choice:nth-child(2) { animation-delay: 0.08s; }
  .choice:nth-child(3) { animation-delay: 0.16s; }
  @keyframes choice-in { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
  .choice:hover:not(:disabled),
  .choice:focus-visible:not(:disabled) { transform: translateY(-4px); outline: none; }
  .choice.warden:hover,
  .choice.warden:focus-visible { border-color: rgba(255, 217, 138, 0.58); box-shadow: 0 16px 44px rgba(255, 193, 92, 0.12); }
  .choice.hunger:hover,
  .choice.hunger:focus-visible { border-color: rgba(255, 101, 58, 0.62); box-shadow: 0 16px 44px rgba(255, 73, 35, 0.14); }
  .choice.companion:hover,
  .choice.companion:focus-visible { border-color: rgba(177, 188, 255, 0.62); box-shadow: 0 16px 44px rgba(136, 153, 255, 0.15); }
  .choice.locked { opacity: 0.42; cursor: default; }
  .choice-glyph { font-size: 2rem; line-height: 1; color: var(--gold); text-shadow: 0 0 24px currentColor; }
  .choice.hunger .choice-glyph { color: #ff8059; }
  .choice.companion .choice-glyph { color: #bdc7ff; }
  .choice-doctrine { min-height: 2.2rem; margin-top: 1.1rem; font-family: Georgia, serif; font-size: 0.72rem; line-height: 1.4; color: var(--dim); }
  .choice strong { margin-top: 0.35rem; font-family: Georgia, serif; font-size: 1.25rem; }
  .choice em { margin-top: 0.65rem; font-family: Georgia, serif; font-size: 0.8rem; line-height: 1.48; color: rgba(199, 194, 216, 0.78); }
  .tradeoff {
    display: block;
    margin-top: 0.7rem;
    font-size: 0.66rem;
    line-height: 1.42;
    color: rgba(210, 205, 225, 0.78);
  }
  .tradeoff.cost { margin-top: 0.42rem; color: rgba(188, 181, 205, 0.72); }
  .tradeoff small {
    display: block;
    margin-bottom: 0.12rem;
    color: color-mix(in srgb, hsl(var(--realm-hue), 72%, 72%) 72%, white);
    font-size: 0.5rem;
    font-weight: 750;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }
  .choice-law {
    width: 100%;
    margin-top: auto;
    padding-top: 0.9rem;
    font-size: 0.72rem;
    font-weight: 700;
    color: rgba(231, 222, 249, 0.9);
    border-top: 1px solid rgba(255, 255, 255, 0.08);
  }
  .choice-law small { display: block; margin-bottom: 0.2rem; font-size: 0.54rem; letter-spacing: 0.15em; text-transform: uppercase; color: var(--dim); }

  .ending-tableau {
    position: relative;
    z-index: 3;
    width: min(47rem, 92vw);
    max-height: 76vh;
    overflow-y: auto;
    padding: 1rem 1.2rem 1.4rem;
    text-align: center;
    scrollbar-width: thin;
    animation: tableau-in 1.2s ease both;
  }
  @keyframes tableau-in { from { opacity: 0; transform: scale(0.97); } to { opacity: 1; transform: scale(1); } }
  .orbit {
    position: absolute;
    top: 4.6rem;
    left: 50%;
    width: 8.5rem;
    height: 8.5rem;
    border: 1px solid rgba(255, 255, 255, 0.09);
    border-radius: 50%;
    transform: translateX(-50%) rotate(18deg) scaleY(0.38);
    pointer-events: none;
  }
  .orbit.two { transform: translateX(-50%) rotate(-28deg) scaleY(0.5); opacity: 0.55; }
  .final-glyph {
    position: relative;
    width: 5rem;
    height: 5rem;
    display: grid;
    place-items: center;
    margin: 0.8rem auto 0;
    font-size: 2.3rem;
    color: var(--gold);
    background: radial-gradient(circle, rgba(255, 217, 138, 0.17), transparent 66%);
    border: 1px solid rgba(255, 217, 138, 0.18);
    border-radius: 50%;
    box-shadow: 0 0 44px rgba(255, 196, 99, 0.14);
  }
  .final-glyph small {
    position: absolute;
    right: -0.2rem;
    bottom: -0.1rem;
    width: 1.55rem;
    height: 1.55rem;
    display: grid;
    place-items: center;
    color: hsla(var(--realm-hue), 82%, 78%, 0.94);
    font: 700 0.72rem/1 system-ui, sans-serif;
    background: rgba(5, 5, 11, 0.94);
    border: 1px solid hsla(var(--realm-hue), 62%, 68%, 0.34);
    border-radius: 50%;
  }
  .hunger .final-glyph { color: #ff7952; background: radial-gradient(circle, rgba(255, 72, 34, 0.19), transparent 66%); border-color: rgba(255, 94, 54, 0.2); box-shadow: 0 0 48px rgba(255, 65, 27, 0.16); }
  .companion .final-glyph { color: #bdc7ff; background: radial-gradient(circle, rgba(150, 170, 255, 0.2), transparent 66%); border-color: rgba(176, 188, 255, 0.2); box-shadow: 0 0 48px rgba(128, 148, 255, 0.18); }
  .doctrine { margin: 0.28rem 0 0; font-family: Georgia, serif; font-size: 0.78rem; font-style: italic; color: var(--dim); }
  blockquote { max-width: 33rem; margin: 1rem auto 0; font-family: Georgia, serif; font-size: clamp(1rem, 2.4vw, 1.25rem); line-height: 1.55; color: rgba(234, 229, 246, 0.92); }
  .permanent-law {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    max-width: 34rem;
    margin: 1.2rem auto 0;
    padding: 0.72rem 0.85rem;
    text-align: left;
    background: rgba(255, 255, 255, 0.025);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 11px;
  }
  .permanent-law span { font-size: 0.58rem; letter-spacing: 0.12em; text-transform: uppercase; color: var(--dim); }
  .permanent-law strong { font-size: 0.8rem; color: var(--gold); }
  .hunger .permanent-law strong { color: #ff9271; }
  .companion .permanent-law strong { color: #c5ceff; }
  .journey {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 1px;
    max-width: 42rem;
    margin: 1rem auto 0;
    overflow: hidden;
    background: rgba(255, 255, 255, 0.07);
    border: 1px solid rgba(255, 255, 255, 0.07);
    border-radius: 11px;
  }
  .journey div { min-width: 0; padding: 0.65rem 0.4rem; background: rgba(5, 5, 11, 0.9); }
  .journey dt { font-size: 0.5rem; letter-spacing: 0.09em; text-transform: uppercase; color: var(--dim); }
  .journey dd { margin: 0.2rem 0 0; overflow: hidden; font-size: 0.7rem; font-weight: 700; text-overflow: ellipsis; color: rgba(232, 227, 244, 0.9); font-variant-numeric: tabular-nums; }
  .afterword { max-width: 36rem; margin: 0.9rem auto 0; font-family: Georgia, serif; font-size: 0.68rem; font-style: italic; line-height: 1.45; color: rgba(145, 140, 163, 0.82); }
  .return {
    margin-top: 1rem;
    padding: 0.62rem 1.4rem;
    font: inherit;
    font-size: 0.72rem;
    font-weight: 750;
    color: #211609;
    background: linear-gradient(180deg, var(--gold), var(--amber));
    border: 0;
    border-radius: 999px;
    cursor: pointer;
    box-shadow: 0 0 28px rgba(255, 190, 90, 0.16);
  }
  .return:hover,
  .return:focus-visible { transform: translateY(-1px); outline: 2px solid rgba(255, 235, 198, 0.45); outline-offset: 3px; }

  @media (max-width: 760px) {
    .bar { height: 6vh; }
    .story-step { inset: 6vh 0; }
    .leave { top: calc(6vh + 0.65rem); right: 0.65rem; }
    .sequence { top: 2.6rem; }
    .sequence-track { top: 4rem; }
    .line { max-width: 84vw; font-size: 1rem; }
    .line.final { font-size: 2.15rem; }
    .hint { bottom: 2.6rem; }
    .choice-stage,
    .ending-tableau { max-height: 84vh; padding-inline: 0.35rem; }
    .choice-stage { padding-top: 2.6rem; }
    .choices { grid-template-columns: 1fr; }
    .choice { min-height: 0; padding: 0.9rem; }
    .choice-doctrine { min-height: 0; margin-top: 0.6rem; }
    .choice-law { margin-top: 0.8rem; }
    .ending-tableau { padding-top: 2rem; }
    .journey { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .permanent-law { align-items: flex-start; flex-direction: column; gap: 0.3rem; }
  }

  @media (prefers-reduced-motion: reduce) {
    .question,
    .line,
    .hint,
    .choice,
    .ending-tableau { animation: none; }
    .scene-glow,
    .sequence-track i,
    .choice { transition: none; }
  }
</style>

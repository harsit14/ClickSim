<script lang="ts">
  import type { InfallRhymeBeat } from '../content/infall-rhyme'

  let { beat }: { beat: InfallRhymeBeat } = $props()
  const ribbons = Array.from({ length: 8 }, (_, index) => index)
</script>

<div class="infall-rhyme" data-infall-beat={beat.id} aria-hidden="true">
  <div class="old-world settlement">
    <i></i><i></i><i></i><i></i><i></i>
  </div>

  <div class="old-world suns">
    <i></i><i></i><i></i><i></i>
  </div>

  <svg class="old-world constellations" viewBox="0 0 100 60" preserveAspectRatio="none">
    <path d="M8 14 L24 8 L31 21 L46 15 L58 30 L74 20 L91 29" />
    <path d="M13 48 L27 37 L40 49 L54 38 L68 52 L86 43" />
    <g><circle cx="8" cy="14" r="1"/><circle cx="24" cy="8" r="1"/><circle cx="31" cy="21" r="1"/><circle cx="46" cy="15" r="1"/><circle cx="58" cy="30" r="1"/><circle cx="74" cy="20" r="1"/><circle cx="91" cy="29" r="1"/></g>
  </svg>

  <div class="old-world instruments">
    <i class="panel counter"></i>
    <i class="panel ledger"></i>
    <i class="panel controls"></i>
    <b class="galaxy one"></b>
    <b class="galaxy two"></b>
  </div>

  <div class="rhyme-ribbons">
    {#each ribbons as ribbon}
      <i style={`--ribbon:${ribbon};--ribbon-row:${ribbon % 3}`}></i>
    {/each}
  </div>

  <div class="devourer-heart"><i></i></div>
  <span class="shape-cue">{beat.shapeCue}</span>
</div>

<style>
  .infall-rhyme {
    --rhyme-hue: 36;
    position: absolute;
    inset: 9vh 0;
    z-index: 1;
    overflow: hidden;
    pointer-events: none;
    background: radial-gradient(circle at 50% 54%, rgba(255, 204, 132, .06), transparent 25%);
  }
  [data-infall-beat='suns'] { --rhyme-hue: 46; }
  [data-infall-beat='constellations'] { --rhyme-hue: 218; }
  [data-infall-beat='instruments'] { --rhyme-hue: 264; }
  .old-world { position: absolute; opacity: .09; }

  .settlement { left: 8%; right: 8%; bottom: 12%; height: 16%; display: flex; align-items: end; justify-content: space-around; border-bottom: 1px solid rgba(255,198,122,.2); }
  .settlement i { width: 6%; height: 45%; background: linear-gradient(135deg, rgba(255,190,105,.24), rgba(44,30,22,.08)); clip-path: polygon(0 30%, 50% 0, 100% 30%, 100% 100%, 0 100%); }
  .settlement i:nth-child(2), .settlement i:nth-child(4) { height: 76%; }
  [data-infall-beat='settlement'] .settlement { opacity: .62; animation: settlement-infall 1500ms cubic-bezier(0.55, 0.05, 0.9, 0.45) both; }
  @keyframes settlement-infall { to { transform: translateY(-25%) scale(.18); transform-origin: 50% -85%; opacity: 0; filter: blur(3px); } }

  .suns { inset: 17% 10% 30%; border: 1px solid rgba(255,210,123,.12); border-radius: 50%; transform: scaleY(.46) rotate(-5deg); }
  .suns i { position: absolute; width: 1.25rem; aspect-ratio: 1; border: 1px solid rgba(255,218,143,.38); border-radius: 50%; box-shadow: inset 0 0 .7rem rgba(255,180,82,.18); }
  .suns i:nth-child(1) { left: 4%; top: 50%; }
  .suns i:nth-child(2) { left: 29%; top: -4%; }
  .suns i:nth-child(3) { right: 28%; top: 4%; }
  .suns i:nth-child(4) { right: 3%; top: 55%; }
  [data-infall-beat='suns'] .suns { opacity: .68; animation: suns-infall 1500ms cubic-bezier(0.55, 0.05, 0.9, 0.45) both; }
  @keyframes suns-infall { to { transform: translateY(8%) scale(.08); opacity: 0; filter: blur(3px); } }

  .constellations { inset: 18% 7% 24%; width: 86%; height: 58%; }
  .constellations path { fill: none; stroke: rgba(187,207,255,.28); stroke-width: .3; vector-effect: non-scaling-stroke; }
  .constellations circle { fill: rgba(220,230,255,.52); }
  [data-infall-beat='constellations'] .constellations { opacity: .72; animation: constellation-infall 1500ms cubic-bezier(0.55, 0.05, 0.9, 0.45) both; }
  @keyframes constellation-infall { to { transform: scale(.08); opacity: 0; filter: blur(3px); } }

  .instruments { inset: 0; }
  .panel { position: absolute; width: 14%; height: 12%; border: 1px solid rgba(202,190,235,.25); background: linear-gradient(145deg, rgba(182,161,229,.1), transparent); }
  .panel.counter { top: 9%; left: 3%; }
  .panel.ledger { top: 24%; right: 2%; height: 40%; }
  .panel.controls { left: 20%; bottom: 7%; width: 48%; height: 6%; }
  .galaxy { position: absolute; width: 9rem; aspect-ratio: 1.8; border: 1px solid rgba(173,151,229,.18); border-radius: 50%; transform: rotate(22deg); }
  .galaxy.one { top: 18%; left: 22%; }
  .galaxy.two { right: 20%; bottom: 18%; transform: rotate(-28deg); }
  [data-infall-beat='instruments'] .instruments { opacity: .7; }
  [data-infall-beat='instruments'] .panel { animation: instrument-infall 1500ms cubic-bezier(0.5, 0, 0.9, 0.4) both; }
  [data-infall-beat='instruments'] .galaxy { animation: galaxy-unwind 1500ms cubic-bezier(0.55, 0.05, 0.9, 0.45) both; }
  @keyframes instrument-infall { to { transform: perspective(700px) translate3d(0, 36vh, -500px) rotateX(38deg) rotateZ(3deg); opacity: 0; filter: blur(3px); } }
  @keyframes galaxy-unwind { to { border-radius: 0; transform: translate(12vw, 18vh) scaleX(.08) rotate(0); opacity: 0; } }

  .rhyme-ribbons { position: absolute; inset: 0; }
  .rhyme-ribbons i {
    position: absolute;
    left: calc(7% + var(--ribbon) * 10.7%);
    top: calc(18% + var(--ribbon-row) * 19%);
    width: 18vw;
    height: 2px;
    border-radius: 50%;
    background: linear-gradient(90deg, hsla(var(--rhyme-hue),86%,70%,0), hsla(var(--rhyme-hue),92%,72%,.7), #fff6e8);
    transform-origin: right center;
    animation: question-ribbon-infall 1500ms cubic-bezier(0.55, 0.05, 0.9, 0.45) both;
    animation-delay: calc(var(--ribbon-row) * 90ms);
    filter: drop-shadow(0 0 .35rem hsla(var(--rhyme-hue),90%,66%,.4));
  }
  @keyframes question-ribbon-infall {
    from { transform: rotate(calc((var(--ribbon) - 4) * 7deg)) scaleX(1); opacity: 0; }
    20% { opacity: 1; }
    to { left: 49%; top: 54%; transform: rotate(0) scaleX(.08); opacity: .1; }
  }
  .devourer-heart { position: absolute; left: 49%; top: 54%; width: 3.5rem; aspect-ratio: 1; transform: translate(-50%,-50%); border-radius: 50%; background: radial-gradient(circle at 42% 40%, #fff6e8, #e79a48 12%, #291916 42%, #030305 70%); box-shadow: 0 0 2.4rem rgba(230,133,70,.22); }
  .devourer-heart i { position: absolute; inset: 38%; border-radius: 50%; background: #fff6e8; box-shadow: 0 0 1rem rgba(255,246,232,.8); }
  .shape-cue { position: absolute; left: 50%; bottom: 10%; color: rgba(190,183,207,.22); font-size: .48rem; letter-spacing: .12em; transform: translateX(-50%); text-transform: uppercase; white-space: nowrap; }

  @media (max-width: 760px) { .infall-rhyme { inset: 6vh 0; } .shape-cue { display: none; } }
  @media (prefers-reduced-motion: reduce) {
    .old-world, .rhyme-ribbons i, .panel, .galaxy { animation: none !important; }
    .old-world { opacity: .22; }
    .rhyme-ribbons i { left: 49%; top: 54%; width: 11vw; opacity: .24; transform: rotate(0) scaleX(.3); }
  }
</style>

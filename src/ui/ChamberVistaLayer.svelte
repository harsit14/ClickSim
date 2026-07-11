<script lang="ts">
  import type { EconomyAmount } from '../content/universes/types'
  import { planChamberVista } from '../render/chamber-vistas'

  interface Props {
    universeId: string
    generatorIds: readonly string[]
    owned: Readonly<Record<string, number>>
    numericLawState?: Readonly<Record<string, EconomyAmount>>
    reducedMotion?: boolean
    quality?: 'low' | 'medium' | 'high'
  }

  let {
    universeId,
    generatorIds,
    owned,
    numericLawState,
    reducedMotion = false,
    quality = 'high',
  }: Props = $props()

  const vista = $derived(planChamberVista({ universeId, generatorIds, owned, numericLawState }))
</script>

{#if vista}
  <div
    class="chamber-vista {vista.id}"
    class:motion-paused={reducedMotion}
    data-chamber-vista={vista.id}
    data-vista-quality={quality}
    role="img"
    aria-label={vista.label}
    style={`--vista-intensity:${vista.intensity};--vista-detail:${vista.detail}`}
  >
    {#if vista.id === 'canopy-dawn'}
      <div class="dawn-halo"></div>
      <div class="dawn-sun"></div>
      <div class="dawn-rays"><i></i><i></i><i></i><i></i><i></i></div>
      <div class="crown crown-left"><i></i><i></i><i></i></div>
      <div class="crown crown-right"><i></i><i></i><i></i></div>
      <div class="graft-thread"></div>
    {:else if vista.id === 'lotus-unfolding'}
      <div class="unfolding-dawn"></div>
      <div class="unfolding-courts"><i></i><i></i><i></i><i></i></div>
      <div class="unfolding-lotus">
        {#each Array.from({ length: 4 }) as _, index}<i style={`--petal:${index}`}></i>{/each}
      </div>
      <div class="unfolding-center"></div>
    {:else if vista.id === 'circuit-return'}
      <div class="return-calm"></div>
      <div class="return-circuit"><i></i><i></i><i></i></div>
      <div class="return-refuges"><i></i><i></i><i></i><i></i></div>
      <div class="return-home"></div>
    {:else}
      <div class="cathedral-nave"></div>
      <div class="cathedral-arch arch-a"></div>
      <div class="cathedral-arch arch-b"></div>
      <div class="cathedral-arch arch-c"></div>
      <div class="cathedral-wave wave-a"></div>
      <div class="cathedral-wave wave-b"></div>
      <div class="cathedral-nodes"><i></i><i></i><i></i><i></i><i></i><i></i></div>
      <div class="cathedral-rest"></div>
    {/if}
  </div>
{/if}

<style>
  .chamber-vista {
    position: absolute;
    inset: 0;
    z-index: 2;
    overflow: hidden;
    pointer-events: none;
    opacity: calc(0.74 + var(--vista-intensity) * 0.2);
  }
  .chamber-vista div,
  .chamber-vista i { position: absolute; }

  /* Verdance — the canopy parts once, and dawn travels through living crowns. */
  .canopy-dawn .dawn-halo {
    left: 50%; top: 20%; width: min(58vw, 52rem); aspect-ratio: 2.8;
    transform: translateX(-50%);
    border-bottom: 1px solid color-mix(in srgb, var(--gold) 52%, transparent);
    border-radius: 0 0 50% 50%;
    background: radial-gradient(ellipse at 50% 100%, color-mix(in srgb, var(--amber) 20%, transparent), transparent 68%);
    filter: drop-shadow(0 0 2.6rem color-mix(in srgb, var(--amber) 18%, transparent));
    animation: dawn-open 7s ease-in-out infinite alternate;
  }
  .canopy-dawn .dawn-sun {
    left: 50%; top: 38%; width: 4.4rem; aspect-ratio: 1;
    transform: translate(-50%, -50%); border-radius: 50%;
    background: radial-gradient(circle, #fffbd6 0 10%, var(--gold) 28%, color-mix(in srgb, var(--amber) 16%, transparent) 62%, transparent 72%);
    box-shadow: 0 0 3.4rem color-mix(in srgb, var(--gold) 34%, transparent);
  }
  .dawn-rays { inset: 0; transform-origin: 50% 38%; animation: dawn-turn 32s linear infinite; }
  .dawn-rays i { left: 50%; top: 38%; width: min(45vw, 42rem); height: 1px; transform-origin: left; background: linear-gradient(90deg, color-mix(in srgb, var(--gold) 42%, transparent), transparent); }
  .dawn-rays i:nth-child(1) { transform: rotate(9deg); }
  .dawn-rays i:nth-child(2) { transform: rotate(31deg); }
  .dawn-rays i:nth-child(3) { transform: rotate(149deg); }
  .dawn-rays i:nth-child(4) { transform: rotate(171deg); }
  .dawn-rays i:nth-child(5) { transform: rotate(90deg); opacity: 0.45; }
  .crown { top: 9%; width: 40%; height: 33%; border-bottom: 2px solid color-mix(in srgb, var(--gold) 26%, transparent); border-radius: 0 0 62% 62%; }
  .crown-left { left: -2%; transform: rotate(5deg); }
  .crown-right { right: -2%; transform: rotate(-5deg); }
  .crown i { bottom: -0.35rem; width: 4.8rem; height: 1.5rem; border: 1px solid color-mix(in srgb, var(--amber) 28%, transparent); border-radius: 100% 0 100% 0; background: color-mix(in srgb, var(--gold) 3%, transparent); }
  .crown i:nth-child(1) { left: 18%; transform: rotate(-14deg); }
  .crown i:nth-child(2) { left: 46%; transform: rotate(12deg) scale(1.2); }
  .crown i:nth-child(3) { right: 4%; transform: rotate(-4deg) scale(0.8); }
  .graft-thread { left: 50%; top: 38%; width: 1px; height: 42%; background: linear-gradient(var(--gold), color-mix(in srgb, var(--amber) 12%, transparent)); box-shadow: 0 0 1rem color-mix(in srgb, var(--gold) 36%, transparent); }

  /* Brahmalok — all four creation directions open a lotus without occupying its center. */
  .lotus-unfolding .unfolding-dawn { inset: 0; background: radial-gradient(ellipse at 50% 56%, color-mix(in srgb, var(--amber) 20%, transparent), transparent 46%); }
  .unfolding-courts { inset: 0; }
  .unfolding-courts i { left: calc(50% - 3rem); top: calc(50% - 1.5rem); width: 6rem; height: 3rem; border: 1px solid color-mix(in srgb, var(--gold) 24%, transparent); transform: rotate(calc(var(--court, 0) * 90deg)) translateY(-8rem); transform-origin: 50% 1.5rem; background: repeating-linear-gradient(90deg, color-mix(in srgb, var(--gold) 5%, transparent) 0 1px, transparent 1px 22%); }
  .unfolding-courts i:nth-child(1) { --court: 0; } .unfolding-courts i:nth-child(2) { --court: 1; } .unfolding-courts i:nth-child(3) { --court: 2; } .unfolding-courts i:nth-child(4) { --court: 3; }
  .unfolding-lotus { left: 50%; top: 56%; width: min(33vw, 27rem); aspect-ratio: 1; transform: translate(-50%, -50%); animation: lotus-breathe 5.6s ease-in-out infinite alternate; }
  .unfolding-lotus i { left: 50%; top: 50%; width: 24%; height: 47%; transform-origin: 0 0; transform: rotate(calc(var(--petal) * 90deg)) translate(-50%, -91%); border: 1px solid color-mix(in srgb, var(--gold) 36%, transparent); border-radius: 78% 18% 78% 18%; background: linear-gradient(180deg, color-mix(in srgb, var(--amber) 10%, transparent), transparent 74%); }
  .unfolding-center { left: 50%; top: 56%; width: 7.2rem; aspect-ratio: 1; transform: translate(-50%, -50%) rotate(45deg); border: 1px dashed color-mix(in srgb, #8ecbe0 38%, transparent); background: transparent; box-shadow: inset 0 0 2rem color-mix(in srgb, var(--bg) 42%, transparent); }

  /* Vishnulok — the completed correction comes home without enclosing the ocean. */
  .circuit-return .return-calm { inset:0;background:radial-gradient(ellipse at 50% 58%,color-mix(in srgb,var(--gold) 13%,transparent),transparent 48%);animation:return-calm 6s ease-in-out infinite alternate; }
  .return-circuit { left:50%;top:56%;width:min(58vw,52rem);aspect-ratio:2.8;transform:translate(-50%,-50%);border:2px solid color-mix(in srgb,var(--amber) 42%,transparent);border-left-color:transparent;border-radius:50%;filter:drop-shadow(0 0 1.4rem color-mix(in srgb,var(--amber) 18%,transparent)); }
  .return-circuit::after { content:'';position:absolute;right:-.25rem;top:47%;width:1rem;height:1rem;border-top:2px solid var(--gold);border-right:2px solid var(--gold);transform:rotate(45deg); }
  .return-circuit i { inset:calc(10% + var(--return-ring,0) * 9%);border-top:1px solid color-mix(in srgb,var(--gold) 22%,transparent);border-radius:50%; }.return-circuit i:nth-child(1){--return-ring:0}.return-circuit i:nth-child(2){--return-ring:1}.return-circuit i:nth-child(3){--return-ring:2}
  .return-refuges { inset:0; }.return-refuges i { top:52%;width:5rem;height:2.4rem;border:1px solid color-mix(in srgb,var(--gold) 24%,transparent);border-bottom:0;border-radius:55% 55% 0 0;background:color-mix(in srgb,var(--bg) 42%,transparent); }.return-refuges i:nth-child(1){left:17%}.return-refuges i:nth-child(2){left:34%;top:68%;transform:scale(.78)}.return-refuges i:nth-child(3){right:34%;top:68%;transform:scale(.78)}.return-refuges i:nth-child(4){right:17%}
  .return-home { left:50%;top:56%;width:5rem;aspect-ratio:1.45;transform:translate(-50%,-50%);border:1px dashed color-mix(in srgb,var(--gold) 46%,transparent);border-radius:55% 55% 20% 20%;background:color-mix(in srgb,var(--bg) 76%,transparent);box-shadow:0 0 2rem color-mix(in srgb,var(--bg) 58%,transparent); }

  /* Canticle — nodes, rests, and antinodes hold an inhabitable acoustic form. */
  .standing-wave-cathedral .cathedral-nave { left: 50%; top: 20%; bottom: 13%; width: min(54vw, 48rem); transform: translateX(-50%); background: radial-gradient(ellipse at 50% 90%, color-mix(in srgb, var(--gold) 12%, transparent), transparent 65%); border-bottom: 1px solid color-mix(in srgb, var(--gold) 40%, transparent); perspective: 40rem; }
  .cathedral-arch { left: 50%; bottom: 16%; transform: translateX(-50%); border: 1px solid color-mix(in srgb, var(--gold) 34%, transparent); border-bottom: 0; border-radius: 50% 50% 0 0; box-shadow: inset 0 0 2rem color-mix(in srgb, var(--amber) 4%, transparent); }
  .arch-a { width: min(50vw, 44rem); height: 58%; }
  .arch-b { width: min(36vw, 32rem); height: 42%; opacity: 0.78; }
  .arch-c { width: min(22vw, 19rem); height: 26%; opacity: 0.58; }
  .cathedral-wave { left: 12%; right: 12%; top: 53%; height: 4.2rem; border-top: 2px solid color-mix(in srgb, var(--gold) 42%, transparent); border-radius: 50%; filter: drop-shadow(0 0 0.5rem color-mix(in srgb, var(--gold) 24%, transparent)); animation: cathedral-breathe 3.6s ease-in-out infinite alternate; }
  .wave-b { transform: scaleY(-1) translateY(-2rem); opacity: 0.58; animation-delay: -1.8s; }
  .cathedral-nodes { inset: 0; }
  .cathedral-nodes i { left: calc(20% + var(--node) * 12%); top: 53%; width: 0.72rem; aspect-ratio: 1; transform: translate(-50%, -50%); border: 1px solid color-mix(in srgb, white 60%, transparent); border-radius: 50%; background: var(--bg); box-shadow: 0 0 1rem color-mix(in srgb, var(--gold) 44%, transparent); }
  .cathedral-nodes i:nth-child(1) { --node: 0; } .cathedral-nodes i:nth-child(2) { --node: 1; } .cathedral-nodes i:nth-child(3) { --node: 2; } .cathedral-nodes i:nth-child(4) { --node: 3; } .cathedral-nodes i:nth-child(5) { --node: 4; } .cathedral-nodes i:nth-child(6) { --node: 5; }
  .cathedral-rest { left: 50%; top: 53%; width: 5.4rem; aspect-ratio: 1; transform: translate(-50%, -50%); border: 1px dashed color-mix(in srgb, white 46%, transparent); border-radius: 50%; background: color-mix(in srgb, var(--bg) 82%, transparent); box-shadow: 0 0 2.8rem var(--bg); }

  [data-vista-quality='low'] .dawn-rays i:nth-child(n+4),
  [data-vista-quality='low'] .unfolding-courts,
  [data-vista-quality='low'] .arch-b { display: none; }
  .motion-paused,
  .motion-paused * { animation: none !important; }

  @keyframes dawn-open { to { opacity: 0.72; transform: translateX(-50%) scaleX(1.04); } }
  @keyframes dawn-turn { to { transform: rotate(360deg); } }
  @keyframes lotus-breathe { to { transform: translate(-50%, -50%) scale(1.045); opacity: .78; } }
  @keyframes return-calm { to { opacity:.72;transform:scaleX(1.03); } }
  @keyframes cathedral-breathe { to { transform: scaleY(1.18); opacity: 0.66; } }

  @media (max-width: 680px) {
    .crown { width: 48%; }
    .unfolding-lotus { width: 58vw; }
    .arch-a { width: 84vw; }
    .arch-b { width: 61vw; }
    .arch-c { width: 37vw; }
    .cathedral-nodes i { left: calc(14% + var(--node) * 14.4%); }
  }
</style>

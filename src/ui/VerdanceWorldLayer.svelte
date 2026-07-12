<script lang="ts">
  import type { EconomyAmount, WorldObjectManifest } from '../content/universes/types'
  import { planVerdanceGroves } from '../render/verdance/world-layer'

  let {
    objects,
    owned,
    numericLawState,
    reducedMotion = false,
    quality = 'high',
  }: {
    objects: readonly WorldObjectManifest[]
    owned: Readonly<Record<string, number>>
    numericLawState?: Readonly<Record<string, EconomyAmount>>
    reducedMotion?: boolean
    quality?: 'low' | 'medium' | 'high'
  } = $props()

  const groves = $derived(planVerdanceGroves(objects, owned, numericLawState))
</script>

<div class="verdance-world-layer" class:motion-paused={reducedMotion} class:low-quality={quality === 'low'} aria-hidden="true">
  <svg class="canopy-network" viewBox="0 0 1440 360" preserveAspectRatio="none">
    <path class="canopy-mass left" d="M0 0H620C590 42 547 72 490 84C424 98 378 73 318 91C244 113 166 104 96 72C57 54 24 32 0 0Z"></path>
    <path class="canopy-mass right" d="M1440 0H820C850 42 893 72 950 84C1016 98 1062 73 1122 91C1196 113 1274 104 1344 72C1383 54 1416 32 1440 0Z"></path>
    <path class="canopy-branch" d="M0 38C174 40 240 92 356 104C452 114 507 80 620 43M1440 38C1266 40 1200 92 1084 104C988 114 933 80 820 43"></path>
    <path class="canopy-branch fine" d="M98 70C180 32 250 37 318 91M334 93C390 52 450 47 518 77M1342 70C1260 32 1190 37 1122 91M1106 93C1050 52 990 47 922 77"></path>
  </svg>

  <div class="ground-line"></div>

  <svg class="root-network" viewBox="0 0 1440 430" preserveAspectRatio="none">
    <path class="root primary" d="M40 142C230 96 318 155 453 179C555 197 620 167 700 132M1400 142C1210 96 1122 155 987 179C885 197 820 167 740 132"></path>
    <path class="root primary" d="M120 220C286 168 406 218 534 251C600 268 651 240 700 195M1320 220C1154 168 1034 218 906 251C840 268 789 240 740 195"></path>
    <path class="root secondary" d="M220 120C250 208 330 265 452 332M374 160C418 238 495 288 610 377M1220 120C1190 208 1110 265 988 332M1066 160C1022 238 945 288 830 377"></path>
    <path class="root hair" d="M68 170C158 185 204 256 236 397M1372 170C1282 185 1236 256 1204 397M472 200C452 270 428 326 382 422M968 200C988 270 1012 326 1058 422"></path>
  </svg>

  <div class="grove-field">
    {#each groves as grove (grove.objectId)}
      <figure
        class="cohort-grove"
        class:left={grove.side === 'left'}
        class:right={grove.side === 'right'}
        data-source-id={grove.sourceId}
        data-cohort-stage={grove.stageId}
        data-ownership-threshold={grove.threshold}
        style={`--grove-x:${grove.xPercent}%;--grove-ground:${grove.groundPercent}%`}
      >
        <span class="plant">
          <i class="trunk"></i>
          <i class="branch branch-a"></i>
          <i class="branch branch-b"></i>
          <i class="crown crown-a"></i>
          <i class="crown crown-b"></i>
          <i class="crown crown-c"></i>
          <i class="root-flare"></i>
          <i class="age-rings"></i>
        </span>
        <span class="companion companion-a"></span>
        <span class="companion companion-b"></span>
      </figure>
    {/each}
  </div>
</div>

<style>
  .verdance-world-layer { position:absolute;inset:0;z-index:2;overflow:hidden;pointer-events:none;--forest:#153e25;--leaf:#315d2d;--growth:#a8d96f;--amber-growth:#e0ae54;background:linear-gradient(180deg,color-mix(in srgb,#dce8c8 28%,transparent),transparent 42%,color-mix(in srgb,var(--forest) 22%,transparent) 58%,color-mix(in srgb,#07150d 44%,transparent)); }
  .canopy-network { position:absolute;inset:0 0 auto;width:100%;height:40%;filter:drop-shadow(0 .8rem 1.8rem color-mix(in srgb,var(--bg) 38%,transparent)); }
  .canopy-mass { fill:color-mix(in srgb,var(--forest) 88%,var(--bg));opacity:.94; }
  .canopy-branch { fill:none;stroke:color-mix(in srgb,var(--gold) 28%,var(--forest));stroke-width:7;stroke-linecap:round;opacity:.8; }
  .canopy-branch.fine { stroke-width:3;opacity:.6; }
  .ground-line { position:absolute;left:-4%;right:-4%;top:57%;height:22%;border-top:2px solid color-mix(in srgb,var(--gold) 28%,var(--forest));border-radius:50% 50% 0 0;background:linear-gradient(180deg,color-mix(in srgb,var(--forest) 26%,transparent),color-mix(in srgb,var(--bg) 8%,transparent));box-shadow:0 -1rem 2.8rem color-mix(in srgb,var(--growth) 8%,transparent); }
  .root-network { position:absolute;left:0;right:0;top:55%;width:100%;height:45%; }
  .root { fill:none;stroke:color-mix(in srgb,var(--amber) 28%,#5b482b);stroke-linecap:round;filter:drop-shadow(0 0 .2rem color-mix(in srgb,var(--amber) 12%,transparent)); }
  .root.primary { stroke-width:5.2;opacity:.7; }
  .root.secondary { stroke-width:2.8;opacity:.58; }
  .root.hair { stroke-width:1.35;opacity:.38;stroke-dasharray:2 9; }
  .grove-field { position:absolute;inset:0; }
  .cohort-grove { position:absolute;left:var(--grove-x);top:var(--grove-ground);z-index:2;width:7rem;height:9rem;margin:0;transform:translate(-50%,-100%);transform-origin:50% 100%;filter:drop-shadow(0 .4rem .7rem color-mix(in srgb,var(--bg) 54%,transparent)); }
  .plant,.plant i,.companion { position:absolute;display:block; }
  .plant { inset:auto 50% 0;width:5rem;height:8rem;transform:translateX(-50%); }
  .trunk { left:50%;bottom:0;width:.48rem;height:2.3rem;transform:translateX(-50%);background:linear-gradient(90deg,#1b2b17,var(--growth) 45%,#172715);clip-path:polygon(28% 0,76% 0,100% 100%,0 100%); }
  .branch { left:50%;bottom:1.55rem;width:2.7rem;height:.38rem;background:var(--forest);transform-origin:0 50%;clip-path:polygon(0 30%,100% 0,100% 70%,0 100%); }
  .branch-a { transform:rotate(-28deg); }
  .branch-b { transform:scaleX(-1) rotate(-28deg); }
  .crown { width:2.35rem;height:1.35rem;background:linear-gradient(145deg,color-mix(in srgb,var(--growth) 38%,var(--leaf)),var(--forest));clip-path:polygon(0 62%,20% 18%,53% 0,86% 20%,100% 66%,72% 100%,30% 92%);border-radius:54% 46% 58% 42%; }
  .crown-a { left:.15rem;top:2.05rem;transform:rotate(-13deg); }
  .crown-b { right:.15rem;top:2.05rem;transform:rotate(13deg); }
  .crown-c { left:50%;top:.8rem;transform:translateX(-50%) scale(1.12); }
  .root-flare { left:50%;bottom:-.2rem;width:3.4rem;height:1.7rem;transform:translateX(-50%);border-bottom:4px solid color-mix(in srgb,var(--amber) 48%,#6b4e28);border-radius:50%;clip-path:polygon(0 64%,36% 42%,49% 0,62% 42%,100% 64%,100% 100%,0 100%); }
  .age-rings { left:50%;bottom:.28rem;width:2.8rem;height:.8rem;transform:translateX(-50%);border-top:1px solid var(--amber-growth);border-radius:50%;opacity:.65; }
  .companion { bottom:.2rem;width:1.5rem;height:2rem;background:var(--forest);clip-path:polygon(44% 100%,45% 48%,5% 38%,42% 31%,48% 0,55% 31%,94% 38%,57% 49%,58% 100%);opacity:0; }
  .companion-a { left:.2rem; }.companion-b { right:.2rem;transform:scale(.72); }

  [data-cohort-stage='u3-cohort-new'] .plant { height:2.5rem; }
  [data-cohort-stage='u3-cohort-new'] .trunk { height:.75rem;width:.32rem; }
  [data-cohort-stage='u3-cohort-new'] .branch,[data-cohort-stage='u3-cohort-new'] .crown-a,[data-cohort-stage='u3-cohort-new'] .crown-b { display:none; }
  [data-cohort-stage='u3-cohort-new'] .crown-c { top:1rem;width:1.1rem;height:.75rem; }
  [data-cohort-stage='u3-cohort-new'] .root-flare { width:1.2rem;height:.55rem;border-width:2px; }
  [data-cohort-stage='u3-cohort-new'] .age-rings { width:.8rem; }
  [data-cohort-stage='u3-cohort-rooted'] .plant { height:4.2rem; }
  [data-cohort-stage='u3-cohort-rooted'] .trunk { height:1.55rem; }
  [data-cohort-stage='u3-cohort-rooted'] .crown-a,[data-cohort-stage='u3-cohort-rooted'] .crown-b { top:1.8rem;width:1.65rem;height:1rem; }
  [data-cohort-stage='u3-cohort-rooted'] .crown-c { top:.95rem;width:1.7rem;height:1.05rem; }
  [data-cohort-stage='u3-cohort-rooted'] .age-rings { width:1.5rem;box-shadow:0 .22rem 0 color-mix(in srgb,var(--amber-growth) 50%,transparent); }
  [data-cohort-stage='u3-cohort-mature'] .plant { transform:translateX(-50%) scale(1.04); }
  [data-cohort-stage='u3-cohort-mature'] .age-rings { box-shadow:0 .22rem 0 color-mix(in srgb,var(--amber-growth) 60%,transparent),0 .44rem 0 color-mix(in srgb,var(--amber-growth) 34%,transparent); }
  [data-cohort-stage='u3-cohort-ancient'] .plant { transform:translateX(-50%) scale(1.22);filter:drop-shadow(0 0 1.1rem color-mix(in srgb,var(--amber-growth) 22%,transparent)); }
  [data-cohort-stage='u3-cohort-ancient'] .trunk { width:.7rem;height:2.7rem;background:linear-gradient(90deg,#172215,var(--amber-growth) 48%,#102016); }
  [data-cohort-stage='u3-cohort-ancient'] .crown { background:linear-gradient(145deg,color-mix(in srgb,var(--amber-growth) 34%,var(--leaf)),var(--forest)); }
  [data-cohort-stage='u3-cohort-ancient'] .age-rings { box-shadow:0 .2rem 0 var(--amber-growth),0 .4rem 0 color-mix(in srgb,var(--amber-growth) 72%,transparent),0 .6rem 0 color-mix(in srgb,var(--amber-growth) 42%,transparent); }
  [data-ownership-threshold='10'] .companion-a,[data-ownership-threshold='25'] .companion-a,[data-ownership-threshold='50'] .companion-a,[data-ownership-threshold='100'] .companion { opacity:.78; }
  [data-ownership-threshold='25']::after,[data-ownership-threshold='50']::after,[data-ownership-threshold='100']::after { content:'';position:absolute;left:-1.5rem;right:-1.5rem;bottom:-.1rem;height:.65rem;border-top:2px solid color-mix(in srgb,var(--amber-growth) 46%,transparent);border-radius:50%; }
  [data-ownership-threshold='50'] .plant,[data-ownership-threshold='100'] .plant { filter:drop-shadow(0 0 1.25rem color-mix(in srgb,var(--growth) 30%,transparent)); }
  [data-ownership-threshold='100'] { transform:translate(-50%,-100%) scale(1.16); }
  .motion-paused .plant,.motion-paused .canopy-network { animation:none; }
  .low-quality .root.secondary,.low-quality .root.hair,.low-quality .companion-b,.low-quality .crown-b { display:none; }
  :global(html[data-contrast='high']) .canopy-mass { fill:#102d18;stroke:white;stroke-width:1; }
  :global(html[data-contrast='high']) .root { stroke:#f5d486; }
  :global(html[data-contrast='high']) .crown { outline:1px solid white; }
</style>

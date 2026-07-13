# Player-scale pacing targets

Recorded 2026-07-12 from the current engine audit using the casual one-click-per-second profile. These targets govern balance changes; the five-year `1e309` projection remains a numeric stress test, not a completion goal.

## Return sessions

| Return | Target | Current |
| --- | ---: | ---: |
| 1 hour away | 0.5 hours passive production | 0.5 hours |
| 8 hours away, no perk | at least 3 hours passive production | 3 hours |
| 8 hours away, both Constellation perks | at least 6 hours passive production | 6 hours |

The base counted-time cap is six hours at 50% efficiency. The Constellation path raises this to a twelve-hour cap at 75% efficiency. Offline simulation does not auto-buy, so returns remain a deliberate spending session.

## Realm completion

| Realm | First Epoch target | Beacon target | Recorded Epoch | Recorded Beacon |
| --- | ---: | ---: | ---: | ---: |
| Emberlight | 1.5–5h | 8–20h | 1.92h | 9.90h |
| Tidefall | 1.5–5h | 8–20h | 3.42h | 16.75h |
| Verdance | 1.5–5h | 4–8h | 3.70h | 4.58h |
| Clockwork | 1.5–5h | 8–20h | 3.53h | 17.40h |
| Brahmalok | 1.5–5h | 4–8h | 2.57h | 4.07h |
| Vishnulok | 1.5–5h | 4–8h | 4.05h | 5.70h |
| Kailash | 1.5–5h | 4–8h | 3.73h | 5.82h |

Long-form restored worlds reserve at least four hours after the first Epoch. Verdance reserves at least thirty minutes for Pruning, and each Loka reserves at least one hour for its signature mechanic. No pre-Epoch purchase gap may exceed ten minutes.

## Tuning decision

Realm timings already meet their bands, so this pass does not change generator costs, rates, Epoch thresholds, or Beacon requirements. The only economy change is the offline cap increase from two to six hours, correcting the weak overnight return without inflating active progression or optimizing toward the synthetic number horizon.

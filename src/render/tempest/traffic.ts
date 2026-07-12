export type VishnulokTrafficKind = 'school' | 'shelter'

export interface VishnulokTraveller {
  id: string
  kind: VishnulokTrafficKind
  form: 1 | 2 | 3 | 4 | 5
  route: 0 | 1 | 2
  durationSec: number
  phaseSec: number
  restingX: number
  restingY: number
}

export interface VishnulokTrafficPlan {
  schoolForm: number
  shelterForm: number
  travellers: VishnulokTraveller[]
}

/** Ownership changes a traveller's form at the shared 1/10/25/50/100 thresholds. */
export function vishnulokTrafficForm(owned: number): 0 | 1 | 2 | 3 | 4 | 5 {
  if (owned >= 100) return 5
  if (owned >= 50) return 4
  if (owned >= 25) return 3
  if (owned >= 10) return 2
  if (owned >= 1) return 1
  return 0
}

export function planVishnulokTraffic(
  returningSchoolOwned: number,
  shelterReefOwned: number,
  quality: 'low' | 'balanced' | 'high',
): VishnulokTrafficPlan {
  const schoolForm = vishnulokTrafficForm(returningSchoolOwned)
  const shelterForm = vishnulokTrafficForm(shelterReefOwned)
  const budget = quality === 'low' ? 3 : 5
  const requestedSchools = schoolForm === 0 ? 0 : schoolForm >= 4 ? 3 : schoolForm >= 2 ? 2 : 1
  const requestedShelters = shelterForm === 0 ? 0 : shelterForm >= 3 ? 2 : 1
  const travellers: VishnulokTraveller[] = []

  for (let index = 0; index < requestedSchools && travellers.length < budget; index += 1) {
    travellers.push({
      id: `school-${index}`,
      kind: 'school',
      form: schoolForm || 1,
      route: (index % 3) as 0 | 1 | 2,
      durationSec: 22 + index * 5,
      phaseSec: -(index * 7 + 2),
      restingX: [185, 510, 785][index] ?? 510,
      restingY: [318, 445, 326][index] ?? 360,
    })
  }

  for (let index = 0; index < requestedShelters && travellers.length < budget; index += 1) {
    travellers.push({
      id: `shelter-${index}`,
      kind: 'shelter',
      form: shelterForm || 1,
      route: ((index + 1) % 3) as 0 | 1 | 2,
      durationSec: 31 + index * 6,
      phaseSec: -(index * 11 + 8),
      restingX: [315, 700][index] ?? 500,
      restingY: [385, 390][index] ?? 390,
    })
  }

  return { schoolForm, shelterForm, travellers }
}

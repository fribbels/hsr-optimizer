import { addSetEff, AllSetEffs, checkSet2, SetEff } from './set'

import { BuildCandidate } from './build'

export function getSetEffects2({
  head: { set: head },
  hand: { set: hand },
  body: { set: body },
  feet: { set: feet },
  sphere: { set: sphere },
  rope: { set: rope },
}: BuildCandidate, all: AllSetEffs): SetEff {
  const eff: SetEff = {
    early: [],
    late: [],
  }
  checkSet2(eff, all, sphere, rope)

  const map: { [K: string]: number } = {
    [hand]: 0,
    [body]: 0,
    [feet]: 0,
    [head]: 1,
  }
  map[hand] += 1
  map[body] += 1
  map[feet] += 1

  for (const set in map) {
    const count = map[set]
    if (count < 2) continue
    addSetEff(eff, all[set].set2)
    if (count === 4) {
      addSetEff(eff, all[set].set4 as SetEff)
    }
  }

  return eff
}

import { RelicContext, RelicSetEffect } from '../../stats/relic'
import { BuildCandidate } from './build'

export type SetEff = RelicSetEffect['set2']

export type AllSetEffs = RelicContext['sets']

export function addSetEff(des: SetEff, other: SetEff) {
  des.early.push(...other.early)
  des.late.push(...other.late)
  return des
}

export function getSetEffects({
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

  if (head === hand) {
    addSetEff(eff, all[head].set2)
    checkSet4(eff, all, head, body, feet)
  } else if (head === body) {
    // It's no longer possible for a set4, and we know that head != hand. If head
    // = body then it's either 2-0 or 2-2.
    addSetEff(eff, all[head].set2)
    checkSet2(eff, all, hand, feet)
  } else if (head === feet) {
    addSetEff(eff, all[head].set2)
    checkSet2(eff, all, body, feet)
  } else {
    // At this point head is different from hand, body and feet
    checkSet2From3(eff, all, hand, feet, body)
  }
  return eff
}

function checkSet4(eff: SetEff, all: AllSetEffs, set: string, set1: string, set2: string) {
  // We are in here after hand = hand, so if body != feet then at most it's 3-1,
  // which means a 2-0
  if (set1 !== set2) {
    return
  }
  // so set1 = set2, 2 cases: set1=set2=set (set4) or set1= set2 != set (set 2-2)
  if (set1 === set) {
    // hopefully the set is configured correctly
    addSetEff(eff, all[set].set4 as SetEff)
  } else {
    addSetEff(eff, all[set1].set2)
  }
}

export function checkSet2(eff: SetEff, all: AllSetEffs, set1: string, set2: string) {
  if (set1 === set2) {
    addSetEff(eff, all[set1].set2)
  }
}

// These functions will be in a very hot loop, this is an optimized version to
// check set 2 from 3 relics
function checkSet2From3(eff: SetEff, all: AllSetEffs, set1: string, set2: string, set3: string) {
  if (set2 === set3) {
    addSetEff(eff, all[set2].set2)
    return
  }
  if (set1 === set2 || set1 === set3) {
    addSetEff(eff, all[set1].set2)
  }
}

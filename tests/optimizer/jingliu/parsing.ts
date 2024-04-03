import { HsrElement } from 'lib/optimizer/new/stats/context'
import { GeneralSubStats, SpherePiece } from 'lib/optimizer/new/stats/relic'

/**
 * DON'T COPY THE RELIC PARSING OF THIS FILE, IT'S NOT THE BEST WAY
 */

export type Relic = {
  part: string
  set: string
  main: {
    stat: string
    value: number
  }
  substats: {
    stat: string
    value: number
  }[]
}

export function parseRelic<T>(relic: Relic): T {
  return parseSubStats({ set: relic.set }, relic.substats.concat(relic.main)) as T
}

export function parseSubStats<T extends GeneralSubStats>(
  obj: T,
  subs: { stat: string; value: number }[],
) {
  subs.forEach((sub) => parseSub(obj, sub))
  return obj
}

export function parseSub<T extends GeneralSubStats>(
  obj: T,
  sub: { stat: string; value: number },
) {
  if (sub.stat === 'CRIT Rate') {
    safeAssign(obj, sub.value / 100, 'crit', 'critRate')
  } else if (sub.stat === 'CRIT DMG') {
    safeAssign(obj, sub.value / 100, 'crit', 'critDmg')
  } else if (sub.stat === 'Effect RES') {
    safeAssign(obj, sub.value, 'effectRes')
  } else if (sub.stat === 'Effect Hit Rate') {
    safeAssign(obj, sub.value, 'effectHitRate')
  } else if (sub.stat === 'HP%') {
    safeAssign(obj, sub.value / 100, 'basic', 'percent', 'hp')
  } else if (sub.stat === 'ATK%') {
    safeAssign(obj, sub.value / 100, 'basic', 'percent', 'atk')
  } else if (sub.stat === 'DEF%') {
    safeAssign(obj, sub.value / 100, 'basic', 'percent', 'def')
  } else if (sub.stat === 'SPD') {
    safeAssign(obj, sub.value, 'basic', 'flat', 'speed')
  } else if (sub.stat === 'HP') {
    safeAssign(obj, sub.value, 'basic', 'flat', 'hp')
  } else if (sub.stat === 'ATK') {
    safeAssign(obj, sub.value, 'basic', 'flat', 'atk')
  } else if (sub.stat === 'DEF') {
    safeAssign(obj, sub.value, 'basic', 'flat', 'def')
  } else if (sub.stat === 'Energy Regeneration Rate') {
    obj['energyRegenerationRate'] = sub.value / 100
  } else if (sub.stat === 'Break Effect') {
    safeAssign(obj, sub.value / 100, 'breakEffect')
  } else if (sub.stat === 'Outgoing Healing Boost') {
    obj['outgoingHealing'] = sub.value / 100
  } else if (sub.stat.includes('DMG Boost')) {
    ;(obj as SpherePiece).__dmgBoost = {
      ele: HsrElement[sub.stat.split(' ')[0].toUpperCase()],
      value: sub.value / 100,
    }
  }
  return obj
}

function safeAssign(obj: object, val: number, ...keys: string[]) {
  let o = obj
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i]
    if (!o[key]) {
      o[key] = {}
    }
    o = o[key]
  }
  const last = keys[keys.length - 1]
  if (o[last]) {
    o[last] += val
  } else {
    o[last] = val
  }
}

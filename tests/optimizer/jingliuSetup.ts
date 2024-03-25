import * as json from 'data/sample-save.json'

import { OptimizationRequest } from 'lib/optimizer/new/optimizationRequest'
import {
  EarlyConditional,
  LateConditional,
  FixedStat,
} from 'lib/optimizer/new/stats/conditional'
import {
  HsrElement,
  Trait,
  SupportedContextStat,
} from 'lib/optimizer/new/stats/context'
import {
  matchByElement,
  alwaysMatch,
  matchAll,
  matchByTraits,
  matchByStat,
  SupportedMatchType,
} from 'lib/optimizer/new/stats/matcher'
import {
  HeadPiece,
  HandPiece,
  BodyPiece,
  FeetPiece,
  SpherePiece,
  RopePiece,
  RelicSetEffect,
} from 'lib/optimizer/new/stats/relic'
import { StepBuilder } from 'lib/optimizer/new/step/builder'
import { Formula } from 'lib/optimizer/new/step/formula'

/**
 * DON'T COPY THE RELIC PARSING OF THIS FILE, IT FUCKING SUCKS
 */
const heads = json.relics
  .filter((rl) => rl.part === 'Head' && rl.set === 'Hunter of Glacial Forest')
  .map<HeadPiece>((rl) =>
    parseSubStats<HeadPiece>(
      {
        set: rl.set,
        basic: {
          flat: {
            hp: rl.main.value,
          },
        },
      },
      rl.substats,
    ),
  )
const hands = json.relics
  .filter((rl) => rl.part === 'Hands' && rl.set === 'Hunter of Glacial Forest')
  .map<HandPiece>((rl) =>
    parseSubStats<HandPiece>(
      {
        set: rl.set,
        basic: {
          flat: {
            atk: rl.main.value,
          },
        },
      },
      rl.substats,
    ),
  )
const bodys = json.relics
  .filter((rl) => rl.part === 'Body' && rl.set === 'Hunter of Glacial Forest')
  .map<BodyPiece>((rl) =>
    parseSubStats<BodyPiece>(
      parseSub(
        {
          set: rl.set,
        },
        rl.main,
      ),
      rl.substats,
    ),
  )
const feets = json.relics
  .filter((rl) => rl.part === 'Feet' && rl.set === 'Hunter of Glacial Forest')
  .map<FeetPiece>((rl) =>
    parseSubStats<FeetPiece>(
      parseSub(
        {
          set: rl.set,
        },
        rl.main,
      ),
      rl.substats,
    ),
  )
const spheres = json.relics
  .filter((rl) => rl.part === 'PlanarSphere' && rl.set === 'Rutilant Arena')
  .map<SpherePiece>((rl) =>
    parseSubStats<SpherePiece>(
      parseSub(
        {
          set: rl.set,
        },
        rl.main,
      ),
      rl.substats,
    ),
  )
const ropes = json.relics
  .filter((rl) => rl.part === 'LinkRope' && rl.set === 'Rutilant Arena')
  .map<RopePiece>((rl) =>
    parseSubStats<RopePiece>(
      parseSub(
        {
          set: rl.set,
        },
        rl.main,
      ),
      rl.substats,
    ),
  )
const hunterOfGlacialForest: RelicSetEffect = {
  set2: {
    early: [
      new EarlyConditional(matchByElement(HsrElement.ICE), {
        dmgBoost: 0.1,
      }),
    ],
    late: [],
  },
  set4: {
    early: [new EarlyConditional(alwaysMatch(), { crit: { critDmg: 0.25 } })],
    late: [],
  },
}
const rutilantArena: RelicSetEffect = {
  set2: {
    early: [new EarlyConditional(alwaysMatch(), { crit: { critRate: 0.08 } })],
    late: [
      new LateConditional(
        matchAll(
          matchByTraits(Trait.SKILL, Trait.NORMAL),
          matchByStat(
            SupportedContextStat.CRIT_RATE,
            SupportedMatchType.GREATER_THAN_OR_EQUAL,
            0.7,
          ),
        ),
        new FixedStat({
          dmgBoost: 0.2,
        }),
      ),
    ],
  },
}
const sets: { [K: string]: RelicSetEffect } = {
  'Hunter of Glacial Forest': hunterOfGlacialForest,
  'Rutilant Arena': rutilantArena,
}
const unconditional = [
  {
    dmgBoost: 0.42,
    crit: { critRate: 0.5, critDmg: 0.2 },
    basic: { percent: { atk: 1.8 } },
    targetDef: { percent: -0.12 },
  },
  {
    crit: { critDmg: 0.373 },
  },
  {
    crit: {
      critRate: 0.05,
      critDmg: 0.5,
    },
  },
]
const request: OptimizationRequest = {
  relics: {
    pieces: {
      head: heads,
      hand: hands,
      body: bodys,
      feet: feets,
      sphere: spheres,
      rope: ropes,
    },
    sets: sets,
  },
  formula: Formula.create(
    [
      StepBuilder.damage(HsrElement.ICE, [Trait.SKILL], 2.5, 'atk')
        .averageCrit()
        .build(),
    ],
    {
      baseMods: {
        unconditional: unconditional,
        early: [],
        late: [],
      },
      basic: {
        base: {
          atk: 1262,
          hp: 99999,
          def: 99999,
          speed: 96,
        },
        lv: 80,
      },
      maxEnergy: 99999,
      targetBaseDef: 200 + 10 * 95,
    },
  ),
}
export { request }
function parseSub<T extends object>(
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
    obj['__dmgBoost'] = {
      ele: HsrElement[sub.stat.split(' ')[0].toUpperCase()],
      value: sub.value / 100,
    }
  }
  return obj
}

function parseSubStats<T extends object>(
  obj: T,
  subs: { stat: string; value: number }[],
) {
  subs.forEach((sub) => parseSub(obj, sub))
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

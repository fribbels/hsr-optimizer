import sample from 'data/sample-save.json'
import { EarlyConditional, FixedStat, LateConditional } from 'lib/optimizer/new/stats/conditional'
import { HsrElement, SupportedContextStat, Trait } from 'lib/optimizer/new/stats/context'
import {
  alwaysMatch,
  matchAll,
  matchByElement,
  matchByStat,
  matchByTraits,
  SupportedMatchType,
} from 'lib/optimizer/new/stats/matcher'
import {
  BodyPiece,
  FeetPiece,
  HandPiece,
  HeadPiece,
  RelicSetEffect,
  RopePiece,
  SpherePiece,
} from 'lib/optimizer/new/stats/relic'
import { parseRelic, Relic } from './parsing'

const unparsedRelics: Relic[] = sample.relics

const HUNTER_OF_GLACIAL_FOREST = 'Hunter of Glacial Forest'
const hunterOfGlacialForest: RelicSetEffect = {
  set2: {
    // 10% Ice DMG Bonus
    early: [new EarlyConditional(matchByElement(HsrElement.ICE), { dmgBoost: 0.1 })],
    late: [],
  },
  set4: {
    // 25% Crit DMG
    early: [new EarlyConditional(alwaysMatch(), { crit: { critDmg: 0.25 } })],
    late: [],
  },
}

const RUTILANT_ARENA = 'Rutilant Arena'
const rutilantArena = {
  set2: {
    early: [new EarlyConditional(alwaysMatch(), { crit: { critRate: 0.08 } })],
    late: [
      new LateConditional(
        // Normal ATK and Skill DMG Boost if Crit Rate >= 0.7
        matchAll(
          matchByTraits(Trait.SKILL, Trait.NORMAL),
          matchByStat(SupportedContextStat.CRIT_RATE, SupportedMatchType.GREATER_THAN_OR_EQUAL, 0.7),
        ),
        new FixedStat({ dmgBoost: 0.2 }),
      ),
    ],
  },
}

const GENIUS_OF_BRILLIANT_STARS = 'Genius of Brilliant Stars'
const geniusOfBrilliantStars = {
  set2: {
    // 10% Quantum DMG Bonus
    early: [new EarlyConditional(matchByElement(HsrElement.QUANTUM), { dmgBoost: 0.1 })],
    late: [],
  },
  set4: {
    // 20% DEF PEN
    early: [new EarlyConditional(alwaysMatch(), { targetDef: { percent: -0.2 } })],
    late: [],
  },
}

const ALL_CONSIDERED_SETS = [HUNTER_OF_GLACIAL_FOREST, RUTILANT_ARENA, GENIUS_OF_BRILLIANT_STARS]
const LIMITED_SETS = [HUNTER_OF_GLACIAL_FOREST, RUTILANT_ARENA]

type RelicMap = {
  head: HeadPiece[]
  hand: HandPiece[]
  body: BodyPiece[]
  feet: FeetPiece[]
  sphere: SpherePiece[]
  rope: RopePiece[]
}

function reducerFor(sets: string[]) {
  return (map: RelicMap, relic: Relic) => {
    if (!sets.includes(relic.set)) {
      return map
    }
    switch (relic.part) {
      case 'Head':
        map.head.push(parseRelic(relic))
        break
      case 'Hands':
        map.hand.push(parseRelic(relic))
        break
      case 'Body':
        map.body.push(parseRelic(relic))
        break
      case 'Feet':
        map.feet.push(parseRelic(relic))
        break
      case 'PlanarSphere':
        map.sphere.push(parseRelic(relic))
        break
      case 'LinkRope':
        map.rope.push(parseRelic(relic))
        break
      default:
        throw new Error(`Unknown relic part ${relic.part}`)
    }
    return map
  }
}

const map = unparsedRelics.reduce<RelicMap>(reducerFor(ALL_CONSIDERED_SETS), {
  head: [],
  hand: [],
  body: [],
  feet: [],
  sphere: [],
  rope: [],
})

export const extendedRelics: RelicMap = map

export const allSetEffects: { [K: string]: RelicSetEffect } = {
  [HUNTER_OF_GLACIAL_FOREST]: hunterOfGlacialForest,
  [RUTILANT_ARENA]: rutilantArena,
  [GENIUS_OF_BRILLIANT_STARS]: geniusOfBrilliantStars,
}

export const limitedRelics = unparsedRelics.reduce(reducerFor(LIMITED_SETS), {
  head: [],
  hand: [],
  body: [],
  feet: [],
  sphere: [],
  rope: [],
})

export const limitedSetEffects = {
  [HUNTER_OF_GLACIAL_FOREST]: hunterOfGlacialForest,
  [RUTILANT_ARENA]: rutilantArena,
}

import { Stats } from 'lib/constants'
import { AbilityEidolon, calculateAshblazingSet, precisionRound } from 'lib/conditionals/utils'
import {
  ASHBLAZING_ATK_STACK,
  baseComputedStatsObject,
  ComputedStatsObject
} from 'lib/conditionals/conditionalConstants.ts'

import { Eidolon } from 'types/Character'
import { CharacterConditional, PrecomputedCharacterConditional } from 'types/CharacterConditional'
import { ContentItem } from 'types/Conditionals'
import { Form } from 'types/Form'

const DrRatio = (e: Eidolon): CharacterConditional => {
  const { basic, skill, ult, talent } = AbilityEidolon.ULT_BASIC_3_SKILL_TALENT_5

  const debuffStacksMax = 5
  const summationStacksMax = (e >= 1) ? 10 : 6

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 1.50, 1.65)
  const ultScaling = ult(e, 2.40, 2.592)
  const fuaScaling = talent(e, 2.70, 2.97)

  function e2FuaRatio(procs, fua = true) {
    return fua
      ? fuaScaling / (fuaScaling + 0.20 * procs) // for fua dmg
      : 0.20 / (fuaScaling + 0.20 * procs) // for each e2 proc
  }

  const baseHitMulti = ASHBLAZING_ATK_STACK * (1 * 1 / 1)
  const fuaMultiByDebuffs = {
    0: ASHBLAZING_ATK_STACK * (1 * 1 / 1), // 0
    1: ASHBLAZING_ATK_STACK * (1 * e2FuaRatio(1, true) + 2 * e2FuaRatio(1, false)), // 2
    2: ASHBLAZING_ATK_STACK * (1 * e2FuaRatio(2, true) + 5 * e2FuaRatio(2, false)), // 2 + 3
    3: ASHBLAZING_ATK_STACK * (1 * e2FuaRatio(3, true) + 9 * e2FuaRatio(3, false)), // 2 + 3 + 4
    4: ASHBLAZING_ATK_STACK * (1 * e2FuaRatio(4, true) + 14 * e2FuaRatio(4, false)), // 2 + 3 + 4 + 5
  }

  // TODO: Make consistent with the other code
  const getContentWithTalentLevel = () => {
    const base = [
      'When using his Skill, Dr. Ratio has a 40% fixed chance of launching a follow-up attack against his target for 1 time,',
      "dealing Imaginary DMG equal to {0}% of Dr. Ratio's ATK.",
      'For each debuff the target enemy has, the fixed chance of launching follow-up attack increases by 20%.',
      'If the target enemy is defeated before the follow-up attack triggers, the follow-up attack will be directed at a single random enemy instead.',
      '::BR::When dealing DMG to a target that has 3 or more debuff(s), for each debuff the target has, the DMG dealt by Dr. Ratio to this target increases by 10%, up to a maximum increase of 50%.',
      "::BR::E2: When his Talent's follow-up attack hits a target, for every debuff the target has, additionally deals Imaginary Additional DMG equal to 20% of Dr. Ratio's ATK. This effect can be triggered for a maximum of 4 times during each follow-up attack.",
    ].join(' ')

    // assume max talent level
    return base.replace('{0}', (e >= 5) ? '297' : '270')
  }

  const content: ContentItem[] = [{
    id: 'summationStacks',
    name: 'summationStacks',
    formItem: 'slider',
    text: 'Summation stacks',
    title: 'Summation stacks',
    content: `When Dr. Ratio uses his Skill, for every debuff on the target, his CRIT Rate increases by 2.5% and CRIT DMG by 5%. This effect can stack up to ${precisionRound(summationStacksMax)} time(s).`,
    min: 0,
    max: summationStacksMax,
  }, {
    id: 'enemyDebuffStacks',
    name: 'enemyDebuffStacks',
    formItem: 'slider',
    text: 'Enemy debuff stacks',
    title: 'Talent: Cogito, Ergo Sum',
    content: getContentWithTalentLevel(),
    min: 0,
    max: debuffStacksMax,
  }]

  return {
    content: () => content,
    teammateContent: () => [],
    defaults: () => ({
      enemyDebuffStacks: debuffStacksMax,
      summationStacks: summationStacksMax,
    }),
    teammateDefaults: () => ({
    }),
    precomputeEffects: (request) => {
      const r = request.characterConditionals
      const x = Object.assign({}, baseComputedStatsObject)

      // Stats
      x[Stats.CR] += r.summationStacks * 0.025
      x[Stats.CD] += r.summationStacks * 0.05

      // Scaling
      x.BASIC_SCALING += basicScaling
      x.SKILL_SCALING += skillScaling
      x.ULT_SCALING += ultScaling
      x.FUA_SCALING += fuaScaling

      // Boost
      x.ELEMENTAL_DMG += (r.enemyDebuffStacks >= 3) ? Math.min(0.50, r.enemyDebuffStacks * 0.10) : 0
      x.FUA_BOOST += (e >= 6) ? 0.50 : 0

      x.BASIC_TOUGHNESS_DMG += 30
      x.SKILL_TOUGHNESS_DMG += 60
      x.ULT_TOUGHNESS_DMG += 90
      x.FUA_TOUGHNESS_DMG += 30

      return x
    },
    precomputeMutualEffects: (_x: ComputedStatsObject, _request: Form) => {
    },
    calculateBaseMultis: (c: PrecomputedCharacterConditional, request: Form) => {
      const r = request.characterConditionals
      const x = c.x

      x.BASIC_DMG += x.BASIC_SCALING * x[Stats.ATK]
      x.SKILL_DMG += x.SKILL_SCALING * x[Stats.ATK]
      x.ULT_DMG += x.ULT_SCALING * x[Stats.ATK]
      if (e >= 2) {
        const hitMulti = fuaMultiByDebuffs[Math.min(4, r.enemyDebuffStacks)]
        const { ashblazingMulti, ashblazingAtk } = calculateAshblazingSet(c, request, hitMulti)
        x.FUA_DMG += x.FUA_SCALING * (x[Stats.ATK] - ashblazingAtk + ashblazingMulti)
      } else {
        const { ashblazingMulti, ashblazingAtk } = calculateAshblazingSet(c, request, baseHitMulti)
        x.FUA_DMG += x.FUA_SCALING * (x[Stats.ATK] - ashblazingAtk + ashblazingMulti)
      }
    },
  }
}

export default DrRatio

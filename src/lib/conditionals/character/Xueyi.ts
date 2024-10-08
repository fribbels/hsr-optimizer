import { Stats } from 'lib/constants'
import { AbilityEidolon, gpuStandardFuaAtkFinalizer, precisionRound, standardFuaAtkFinalizer } from 'lib/conditionals/conditionalUtils'
import { ASHBLAZING_ATK_STACK, ComputedStatsObject, FUA_TYPE, ULT_TYPE } from 'lib/conditionals/conditionalConstants'

import { ContentItem } from 'types/Conditionals'
import { CharacterConditional } from 'types/CharacterConditional'
import { Form } from 'types/Form'

import { Eidolon } from 'types/Character'
import { buffAbilityDmg } from 'lib/optimizer/calculateBuffs'
import { XueyiConversionConditional } from 'lib/gpu/conditionals/dynamicConditionals'
import { NumberToNumberMap } from 'types/Common'

export default (e: Eidolon): CharacterConditional => {
  const { basic, skill, ult, talent } = AbilityEidolon.SKILL_BASIC_3_ULT_TALENT_5

  const ultBoostMax = ult(e, 0.60, 0.648)
  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 1.40, 1.54)
  const ultScaling = ult(e, 2.50, 2.70)
  const fuaScaling = talent(e, 0.90, 0.99)

  const hitMultiByFuaHits: NumberToNumberMap = {
    0: 0,
    1: ASHBLAZING_ATK_STACK * (1 * 1 / 1), // 0.06
    2: ASHBLAZING_ATK_STACK * (1 * 1 / 2 + 2 * 1 / 2), // 0.09
    3: ASHBLAZING_ATK_STACK * (1 * 1 / 3 + 2 * 1 / 3 + 3 * 1 / 3), // 0.12
  }

  const content: ContentItem[] = [
    {
      id: 'beToDmgBoost',
      name: 'beToDmgBoost',
      text: 'BE to DMG boost',
      formItem: 'switch',
      title: 'Clairvoyant Loom',
      content: 'Increases DMG dealt by this unit by an amount equal to 100% of Break Effect, up to a maximum DMG increase of 240%.',
    },
    {
      id: 'enemyToughness50',
      name: 'enemyToughness50',
      text: 'Intrepid Rollerbearings',
      formItem: 'switch',
      title: 'Intrepid Rollerbearings',
      content: "If the enemy target's Toughness is equal to or higher than 50% of their Max Toughness, deals 10% more DMG when using Ultimate.",
    },
    {
      id: 'toughnessReductionDmgBoost',
      name: 'toughnessReductionDmgBoost',
      text: 'Ultimate DMG boost',
      formItem: 'slider',
      title: 'Ultimate: Divine Castigation',
      content: `When using Ultimate, the more Toughness is reduced, the higher the DMG will be dealt, up to a max of ${precisionRound(ultBoostMax * 100)}% increase.`,
      min: 0,
      max: ultBoostMax,
      percent: true,
    },
    {
      id: 'fuaHits',
      name: 'fuaHits',
      text: 'FUA hits',
      formItem: 'slider',
      title: 'Talent: Karmic Perpetuation',
      content: `When Karma reaches the max number of stacks, consumes all current Karma stacks and immediately launches a follow-up attack against an enemy target, 
      dealing DMG for 3 times, with each time dealing Quantum DMG equal to ${precisionRound(fuaScaling * 100)}% of Xueyi's ATK to a single random enemy.`,
      min: 0,
      max: 3,
    },
    {
      id: 'e4BeBuff',
      name: 'e4BeBuff',
      text: 'E4 BE buff',
      formItem: 'switch',
      title: 'E4 break effect buff',
      content: 'E4: When using Ultimate, increases Break Effect by 40% for 2 turn(s).',
      disabled: (e < 4),
    },
  ]

  return {
    content: () => content,
    teammateContent: () => [],
    defaults: () => ({
      beToDmgBoost: true,
      enemyToughness50: true,
      toughnessReductionDmgBoost: ultBoostMax,
      fuaHits: 3,
      e4BeBuff: true,
    }),
    teammateDefaults: () => ({}),
    precomputeEffects: (x: ComputedStatsObject, request: Form) => {
      const r = request.characterConditionals

      // Stats
      x[Stats.BE] += (e >= 4 && r.e4BeBuff) ? 0.40 : 0

      // Scaling
      x.BASIC_SCALING += basicScaling
      x.SKILL_SCALING += skillScaling
      x.ULT_SCALING += ultScaling
      x.FUA_SCALING += fuaScaling * (r.fuaHits)

      // Boost
      buffAbilityDmg(x, ULT_TYPE, r.toughnessReductionDmgBoost)
      buffAbilityDmg(x, ULT_TYPE, 0.10, (r.enemyToughness50))
      buffAbilityDmg(x, FUA_TYPE, 0.40, (e >= 1))

      x.BASIC_TOUGHNESS_DMG += 30
      x.SKILL_TOUGHNESS_DMG += 60
      x.ULT_TOUGHNESS_DMG += 120
      x.FUA_TOUGHNESS_DMG += 15 * (r.fuaHits)

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsObject, request: Form) => {
    },
    finalizeCalculations: (x: ComputedStatsObject, request: Form) => {
      standardFuaAtkFinalizer(x, request, hitMultiByFuaHits[request.characterConditionals.fuaHits])
    },
    gpuFinalizeCalculations: (request: Form) => {
      return gpuStandardFuaAtkFinalizer(hitMultiByFuaHits[request.characterConditionals.fuaHits])
    },
    dynamicConditionals: [XueyiConversionConditional],
  }
}

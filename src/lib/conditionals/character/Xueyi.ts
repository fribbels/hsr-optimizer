import { Stats } from 'lib/constants'
import { AbilityEidolon, gpuStandardFuaAtkFinalizer, standardFuaAtkFinalizer } from 'lib/conditionals/conditionalUtils'
import { ASHBLAZING_ATK_STACK, ComputedStatsObject, FUA_TYPE, ULT_TYPE } from 'lib/conditionals/conditionalConstants'

import { ContentItem } from 'types/Conditionals'
import { CharacterConditional } from 'types/CharacterConditional'
import { Form } from 'types/Form'

import { Eidolon } from 'types/Character'
import { buffAbilityDmg } from 'lib/optimizer/calculateBuffs'
import { XueyiConversionConditional } from 'lib/gpu/conditionals/dynamicConditionals'
import { NumberToNumberMap } from 'types/Common'
import i18next from 'i18next'
import { TsUtils } from 'lib/TsUtils'

export default (e: Eidolon, withoutContent: boolean): CharacterConditional => {
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

  const content: ContentItem[] = (() => {
    if (withoutContent) return []
    const t = i18next.getFixedT(null, 'conditionals', 'Characters.Xueyi.Content')
    return [
      {
        id: 'beToDmgBoost',
        name: 'beToDmgBoost',
        formItem: 'switch',
        text: t('beToDmgBoost.text'),
        title: t('beToDmgBoost.title'),
        content: t('beToDmgBoost.content'),
      },
      {
        id: 'enemyToughness50',
        name: 'enemyToughness50',
        formItem: 'switch',
        text: t('enemyToughness50.text'),
        title: t('enemyToughness50.title'),
        content: t('enemyToughness50.content'),
      },
      {
        id: 'toughnessReductionDmgBoost',
        name: 'toughnessReductionDmgBoost',
        formItem: 'slider',
        text: t('toughnessReductionDmgBoost.text'),
        title: t('toughnessReductionDmgBoost.title'),
        content: t('toughnessReductionDmgBoost.content', { ultBoostMax: TsUtils.precisionRound(100 * ultBoostMax) }),
        min: 0,
        max: ultBoostMax,
        percent: true,
      },
      {
        id: 'fuaHits',
        name: 'fuaHits',
        formItem: 'slider',
        text: t('fuaHits.text'),
        title: t('fuaHits.title'),
        content: t('fuaHits.content', { fuaScaling: TsUtils.precisionRound(100 * fuaScaling) }),
        min: 0,
        max: 3,
      },
      {
        id: 'e4BeBuff',
        name: 'e4BeBuff',
        formItem: 'switch',
        text: t('e4BeBuff.text'),
        title: t('e4BeBuff.title'),
        content: t('e4BeBuff.content'),
        disabled: (e < 4),
      },
    ]
  })()

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

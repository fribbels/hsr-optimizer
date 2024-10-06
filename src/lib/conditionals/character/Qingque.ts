import { Stats } from 'lib/constants'
import { ASHBLAZING_ATK_STACK, ComputedStatsObject, ULT_TYPE } from 'lib/conditionals/conditionalConstants'
import { AbilityEidolon, gpuStandardFuaAtkFinalizer, standardFuaAtkFinalizer } from 'lib/conditionals/conditionalUtils'

import { Eidolon } from 'types/Character'
import { CharacterConditional } from 'types/CharacterConditional'
import { Form } from 'types/Form'
import { ContentItem } from 'types/Conditionals'
import { buffAbilityDmg } from 'lib/optimizer/calculateBuffs'
import { NumberToNumberMap } from 'types/Common'
import i18next from 'i18next'
import { TsUtils } from 'lib/TsUtils'

export default (e: Eidolon): CharacterConditional => {
  const t = i18next.getFixedT(null, 'conditionals', 'Characters.Qingque')
  const { basic, skill, ult, talent } = AbilityEidolon.ULT_TALENT_3_SKILL_BASIC_5

  const skillStackDmg = skill(e, 0.38, 0.408)
  const talentAtkBuff = talent(e, 0.72, 0.792)

  const basicScaling = basic(e, 1.00, 1.10)
  const basicEnhancedScaling = basic(e, 2.40, 2.64)
  const skillScaling = skill(e, 0, 0)
  const ultScaling = ult(e, 2.00, 2.16)

  const hitMultiByTargetsBlast: NumberToNumberMap = {
    1: ASHBLAZING_ATK_STACK * (1 * 1 / 1), // 0.06
    3: ASHBLAZING_ATK_STACK * (2 * 1 / 1), // 0.12
    5: ASHBLAZING_ATK_STACK * (2 * 1 / 1), // 0.12
  }

  const hitMultiSingle = ASHBLAZING_ATK_STACK * (1 * 1 / 1)

  function getHitMulti(request: Form) {
    const r = request.characterConditionals
    return r.basicEnhanced
      ? hitMultiByTargetsBlast[request.enemyCount]
      : hitMultiSingle
  }

  const content: ContentItem[] = [{
    formItem: 'switch',
    id: 'basicEnhanced',
    name: 'basicEnhanced',
    text: t('Content.basicEnhanced.text'),
    title: t('Content.basicEnhanced.title'),
    content: t('Content.basicEnhanced.content', { talentAtkBuff: TsUtils.precisionRound(100 * talentAtkBuff) }),
  }, {
    formItem: 'switch',
    id: 'basicEnhancedSpdBuff',
    name: 'basicEnhancedSpdBuff',
    text: t('Content.basicEnhancedSpdBuff.text'),
    title: t('Content.basicEnhancedSpdBuff.title'),
    content: t('Content.basicEnhancedSpdBuff.content'),
  }, {
    formItem: 'slider',
    id: 'skillDmgIncreaseStacks',
    name: 'skillDmgIncreaseStacks',
    text: t('Content.skillDmgIncreaseStacks.text'),
    title: t('Content.skillDmgIncreaseStacks.title'),
    content: t('Content.skillDmgIncreaseStacks.content', { skillStackDmg: TsUtils.precisionRound(100 * skillStackDmg) }),
    min: 0,
    max: 4,
  }]

  return {
    content: () => content,
    teammateContent: () => [],
    defaults: () => ({
      basicEnhanced: true,
      basicEnhancedSpdBuff: false,
      skillDmgIncreaseStacks: 4,
    }),
    teammateDefaults: () => ({}),
    precomputeEffects: (x: ComputedStatsObject, request: Form) => {
      const r = request.characterConditionals

      // Stats
      x[Stats.ATK_P] += (r.basicEnhanced) ? talentAtkBuff : 0
      x[Stats.SPD_P] += (r.basicEnhancedSpdBuff) ? 0.10 : 0

      // Scaling
      x.BASIC_SCALING += (r.basicEnhanced) ? basicEnhancedScaling : basicScaling
      x.SKILL_SCALING += skillScaling
      x.ULT_SCALING += ultScaling
      x.FUA_SCALING += (e >= 4) ? x.BASIC_SCALING : 0

      // Boost
      x.ELEMENTAL_DMG += r.skillDmgIncreaseStacks * skillStackDmg
      buffAbilityDmg(x, ULT_TYPE, 0.10, (e >= 1))

      x.BASIC_TOUGHNESS_DMG += (r.basicEnhanced) ? 60 : 30
      x.ULT_TOUGHNESS_DMG += 60
      x.FUA_TOUGHNESS_DMG += (r.basicEnhanced) ? 60 : 30

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsObject, request: Form) => {
    },
    finalizeCalculations: (x: ComputedStatsObject, request: Form) => {
      standardFuaAtkFinalizer(x, request, getHitMulti(request))
    },
    gpuFinalizeCalculations: (request: Form) => {
      return gpuStandardFuaAtkFinalizer(getHitMulti(request))
    },
  }
}

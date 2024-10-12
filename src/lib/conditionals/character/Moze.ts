import { ASHBLAZING_ATK_STACK, ComputedStatsObject, FUA_TYPE, ULT_TYPE } from 'lib/conditionals/conditionalConstants'
import { AbilityEidolon, findContentId, gpuStandardFuaAtkFinalizer, standardFuaAtkFinalizer } from 'lib/conditionals/conditionalUtils'

import { Eidolon } from 'types/Character'
import { CharacterConditional } from 'types/CharacterConditional'
import { ContentItem } from 'types/Conditionals'
import { Stats } from 'lib/constants'
import { buffAbilityVulnerability } from 'lib/optimizer/calculateBuffs'
import { TsUtils } from 'lib/TsUtils'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (e: Eidolon, withContent: boolean): CharacterConditional => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Moze')
  const { basic, skill, ult, talent } = AbilityEidolon.ULT_TALENT_3_SKILL_BASIC_5

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 1.50, 1.65)
  const ultScaling = ult(e, 2.70, 2.916)

  const fuaScaling = talent(e, 1.60, 1.76)
  const additionalDmgScaling = talent(e, 0.30, 0.33)

  const fuaHitCountMulti = ASHBLAZING_ATK_STACK * (1 * 0.08 + 2 * 0.08 + 3 * 0.08 + 4 * 0.08 + 5 * 0.08 + 6 * 0.6)

  const content: ContentItem[] = [
    {
      formItem: 'switch',
      id: 'preyMark',
      name: 'preyMark',
      text: t('Content.preyMark.text'),
      title: t('Content.preyMark.title'),
      content: t('Content.preyMark.content', { PreyAdditionalMultiplier: TsUtils.precisionRound(100 * additionalDmgScaling), FuaScaling: TsUtils.precisionRound(100 * fuaScaling) }),
    },
    {
      formItem: 'switch',
      id: 'e2CdBoost',
      name: 'e2CdBoost',
      text: t('Content.e2CdBoost.text'),
      title: t('Content.e2CdBoost.title'),
      content: t('Content.e2CdBoost.content'),
      disabled: e < 2,
    },
    {
      formItem: 'switch',
      id: 'e4DmgBuff',
      name: 'e4DmgBuff',
      text: t('Content.e4DmgBuff.text'),
      title: t('Content.e4DmgBuff.title'),
      content: t('Content.e4DmgBuff.content'),
      disabled: e < 4,
    },
    {
      formItem: 'switch',
      id: 'e6MultiplierIncrease',
      name: 'e6MultiplierIncrease',
      text: t('Content.e6MultiplierIncrease.text'),
      title: t('Content.e6MultiplierIncrease.title'),
      content: t('Content.e6MultiplierIncrease.content'),
      disabled: e < 6,
    },
  ]

  const teammateContent: ContentItem[] = [
    findContentId(content, 'preyMark'),
    findContentId(content, 'e2CdBoost'),
  ]

  const defaults = {
    preyMark: true,
    e2CdBoost: true,
    e4DmgBuff: true,
    e6MultiplierIncrease: true,
  }

  const teammateDefaults = {
    preyMark: true,
    e2CdBoost: true,
  }

  return {
    content: () => content,
    teammateContent: () => teammateContent,
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    initializeConfigurations: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      x.ULT_DMG_TYPE = ULT_TYPE | FUA_TYPE
    },
    precomputeEffects: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals

      x.ELEMENTAL_DMG += (e >= 4 && r.e4DmgBuff) ? 0.30 : 0

      x.BASIC_SCALING += basicScaling + ((r.preyMark) ? additionalDmgScaling : 0)
      x.SKILL_SCALING += skillScaling + ((r.preyMark) ? additionalDmgScaling : 0)
      x.FUA_SCALING += fuaScaling + ((r.preyMark) ? additionalDmgScaling : 0)
      x.FUA_SCALING += (e >= 6 && r.e6MultiplierIncrease) ? 0.25 : 0
      x.ULT_SCALING += ultScaling + ((r.preyMark) ? additionalDmgScaling : 0)

      x.BASIC_TOUGHNESS_DMG += 30
      x.SKILL_TOUGHNESS_DMG += 60
      x.ULT_TOUGHNESS_DMG += 90
      x.FUA_TOUGHNESS_DMG += 30

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals

      buffAbilityVulnerability(x, FUA_TYPE, 0.25, (m.preyMark))

      x[Stats.CD] += (e >= 2 && m.preyMark && m.e2CdBoost) ? 0.40 : 0
    },
    finalizeCalculations: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      standardFuaAtkFinalizer(x, action, context, fuaHitCountMulti)
    },
    gpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => {
      return gpuStandardFuaAtkFinalizer(fuaHitCountMulti)
    },
  }
}

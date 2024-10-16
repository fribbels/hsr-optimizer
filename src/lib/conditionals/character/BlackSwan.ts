import { ComputedStatsObject, DOT_TYPE } from 'lib/conditionals/conditionalConstants'
import { AbilityEidolon, findContentId, gpuStandardAtkFinalizer, standardAtkFinalizer } from 'lib/conditionals/conditionalUtils'

import { Eidolon } from 'types/Character'
import { CharacterConditional } from 'types/CharacterConditional'
import { ContentItem } from 'types/Conditionals'
import { buffAbilityDefPen, buffAbilityVulnerability } from 'lib/optimizer/calculateBuffs'
import { BlackSwanConversionConditional } from 'lib/gpu/conditionals/dynamicConditionals'
import { TsUtils } from 'lib/TsUtils'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (e: Eidolon, withContent: boolean): CharacterConditional => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.BlackSwan')
  const { basic, skill, ult, talent } = AbilityEidolon.SKILL_TALENT_3_ULT_BASIC_5

  const arcanaStackMultiplier = talent(e, 0.12, 0.132)
  const epiphanyDmgTakenBoost = ult(e, 0.25, 0.27)
  const defShredValue = skill(e, 0.208, 0.22)

  const basicScaling = basic(e, 0.60, 0.66)
  const skillScaling = skill(e, 0.90, 0.99)
  const ultScaling = ult(e, 1.20, 1.30)
  const dotScaling = talent(e, 2.40, 2.64)

  const dotChance = talent(e, 0.65, 0.68)

  // e6 100%
  // skill 100%

  const content: ContentItem[] = [
    {
      formItem: 'switch',
      id: 'ehrToDmgBoost',
      name: 'ehrToDmgBoost',
      text: t('Content.ehrToDmgBoost.text'),
      title: t('Content.ehrToDmgBoost.title'),
      content: t('Content.ehrToDmgBoost.content'),
    },
    {
      formItem: 'switch',
      id: 'epiphanyDebuff',
      name: 'epiphanyDebuff',
      text: t('Content.epiphanyDebuff.text'),
      title: t('Content.epiphanyDebuff.title'),
      content: t('Content.epiphanyDebuff.content', { epiphanyDmgTakenBoost: TsUtils.precisionRound(100 * epiphanyDmgTakenBoost) }),
    },
    {
      formItem: 'switch',
      id: 'defDecreaseDebuff',
      name: 'defDecreaseDebuff',
      text: t('Content.defDecreaseDebuff.text'),
      title: t('Content.defDecreaseDebuff.title'),
      content: t('Content.defDecreaseDebuff.content', { defShredValue: TsUtils.precisionRound(100 * defShredValue) }),
    },
    {
      formItem: 'slider',
      id: 'arcanaStacks',
      name: 'arcanaStacks',
      text: t('Content.arcanaStacks.text'),
      title: t('Content.arcanaStacks.title'),
      content: t('Content.arcanaStacks.content', { dotScaling: TsUtils.precisionRound(100 * dotScaling), arcanaStackMultiplier: TsUtils.precisionRound(100 * arcanaStackMultiplier) }),
      min: 1,
      max: 50,
    },
    {
      formItem: 'switch',
      id: 'e1ResReduction',
      name: 'e1ResReduction',
      text: t('Content.e1ResReduction.text'),
      title: t('Content.e1ResReduction.title'),
      content: t('Content.e1ResReduction.content'),
      disabled: e < 1,
    },
  ]

  const teammateContent: ContentItem[] = [
    findContentId(content, 'epiphanyDebuff'),
    findContentId(content, 'defDecreaseDebuff'),
    findContentId(content, 'e1ResReduction'),
  ]

  return {
    content: () => content,
    teammateContent: () => teammateContent,
    defaults: () => ({
      ehrToDmgBoost: true,
      epiphanyDebuff: true,
      defDecreaseDebuff: true,
      arcanaStacks: 7,
      e1ResReduction: true,
    }),
    teammateDefaults: () => ({
      epiphanyDebuff: true,
      defDecreaseDebuff: true,
      e1ResReduction: true,
    }),
    precomputeEffects: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals

      x.BASIC_SCALING += basicScaling
      x.SKILL_SCALING += skillScaling
      x.ULT_SCALING += ultScaling
      x.DOT_SCALING += dotScaling + arcanaStackMultiplier * r.arcanaStacks

      buffAbilityDefPen(x, DOT_TYPE, 0.20, (r.arcanaStacks >= 7))

      x.BASIC_TOUGHNESS_DMG += 30
      x.SKILL_TOUGHNESS_DMG += 60
      x.ULT_TOUGHNESS_DMG += 60

      x.DOT_CHANCE = dotChance
      x.DOT_SPLIT = 0.05
      x.DOT_STACKS = r.arcanaStacks

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals

      // TODO: Technically this isnt a DoT vulnerability but rather vulnerability to damage on the enemy's turn which includes ults/etc.
      buffAbilityVulnerability(x, DOT_TYPE, epiphanyDmgTakenBoost, (m.epiphanyDebuff))

      x.DEF_PEN += (m.defDecreaseDebuff) ? defShredValue : 0
      x.WIND_RES_PEN += (e >= 1 && m.e1ResReduction) ? 0.25 : 0
      x.FIRE_RES_PEN += (e >= 1 && m.e1ResReduction) ? 0.25 : 0
      x.PHYSICAL_RES_PEN += (e >= 1 && m.e1ResReduction) ? 0.25 : 0
      x.LIGHTNING_RES_PEN += (e >= 1 && m.e1ResReduction) ? 0.25 : 0
    },
    finalizeCalculations: (x: ComputedStatsObject) => standardAtkFinalizer(x),
    gpuFinalizeCalculations: () => gpuStandardAtkFinalizer(),
    dynamicConditionals: [BlackSwanConversionConditional],
  }
}

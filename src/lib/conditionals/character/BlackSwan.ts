import { DOT_TYPE } from 'lib/conditionals/conditionalConstants'
import { AbilityEidolon, Conditionals, ContentDefinition, gpuStandardAtkFinalizer, standardAtkFinalizer } from 'lib/conditionals/conditionalUtils'
import { BlackSwanConversionConditional } from 'lib/gpu/conditionals/dynamicConditionals'
import { buffAbilityDefPen, buffAbilityVulnerability } from 'lib/optimizer/calculateBuffs'
import { ComputedStatsArray, Source } from 'lib/optimizer/computedStatsArray'
import { TsUtils } from 'lib/TsUtils'

import { Eidolon } from 'types/Character'
import { CharacterConditional } from 'types/CharacterConditional'
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

  const defaults = {
    ehrToDmgBoost: true,
    epiphanyDebuff: true,
    defDecreaseDebuff: true,
    arcanaStacks: 7,
    e1ResReduction: true,
  }
  const teammateDefaults = {
    epiphanyDebuff: true,
    defDecreaseDebuff: true,
    e1ResReduction: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    ehrToDmgBoost: {
      id: 'ehrToDmgBoost',
      formItem: 'switch',
      text: t('Content.ehrToDmgBoost.text'),
      content: t('Content.ehrToDmgBoost.content'),
    },
    epiphanyDebuff: {
      id: 'epiphanyDebuff',
      formItem: 'switch',
      text: t('Content.epiphanyDebuff.text'),
      content: t('Content.epiphanyDebuff.content', { epiphanyDmgTakenBoost: TsUtils.precisionRound(100 * epiphanyDmgTakenBoost) }),
    },
    defDecreaseDebuff: {
      id: 'defDecreaseDebuff',
      formItem: 'switch',
      text: t('Content.defDecreaseDebuff.text'),
      content: t('Content.defDecreaseDebuff.content', { defShredValue: TsUtils.precisionRound(100 * defShredValue) }),
    },
    arcanaStacks: {
      id: 'arcanaStacks',
      formItem: 'slider',
      text: t('Content.arcanaStacks.text'),
      content: t('Content.arcanaStacks.content', {
        dotScaling: TsUtils.precisionRound(100 * dotScaling),
        arcanaStackMultiplier: TsUtils.precisionRound(100 * arcanaStackMultiplier),
      }),
      min: 1,
      max: 50,
    },
    e1ResReduction: {
      id: 'e1ResReduction',
      formItem: 'switch',
      text: t('Content.e1ResReduction.text'),
      content: t('Content.e1ResReduction.content'),
      disabled: e < 1,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    epiphanyDebuff: content.epiphanyDebuff,
    defDecreaseDebuff: content.defDecreaseDebuff,
    e1ResReduction: content.e1ResReduction,
  }

  return {
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r: Conditionals<typeof content> = action.characterConditionals

      x.BASIC_SCALING.buff(basicScaling, Source.NONE)
      x.SKILL_SCALING.buff(skillScaling, Source.NONE)
      x.ULT_SCALING.buff(ultScaling, Source.NONE)
      x.DOT_SCALING.buff(dotScaling + arcanaStackMultiplier * r.arcanaStacks, Source.NONE)

      buffAbilityDefPen(x, DOT_TYPE, (r.arcanaStacks >= 7) ? 0.20 : 0, Source.NONE)

      x.BASIC_TOUGHNESS_DMG.buff(30, Source.NONE)
      x.SKILL_TOUGHNESS_DMG.buff(60, Source.NONE)
      x.ULT_TOUGHNESS_DMG.buff(60, Source.NONE)

      x.DOT_CHANCE.set(dotChance, Source.NONE)
      x.DOT_SPLIT.set(0.05, Source.NONE)
      x.DOT_STACKS.set(r.arcanaStacks, Source.NONE)
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const m: Conditionals<typeof teammateContent> = action.characterConditionals

      // TODO: Technically this isnt a DoT vulnerability but rather vulnerability to damage on the enemy's turn which includes ults/etc.
      buffAbilityVulnerability(x, DOT_TYPE, (m.epiphanyDebuff) ? epiphanyDmgTakenBoost : 0, Source.NONE)

      x.DEF_PEN.buff((m.defDecreaseDebuff) ? defShredValue : 0, Source.NONE)
      x.WIND_RES_PEN.buff((e >= 1 && m.e1ResReduction) ? 0.25 : 0, Source.NONE)
      x.FIRE_RES_PEN.buff((e >= 1 && m.e1ResReduction) ? 0.25 : 0, Source.NONE)
      x.PHYSICAL_RES_PEN.buff((e >= 1 && m.e1ResReduction) ? 0.25 : 0, Source.NONE)
      x.LIGHTNING_RES_PEN.buff((e >= 1 && m.e1ResReduction) ? 0.25 : 0, Source.NONE)
    },
    finalizeCalculations: (x: ComputedStatsArray) => standardAtkFinalizer(x),
    gpuFinalizeCalculations: () => gpuStandardAtkFinalizer(),
    dynamicConditionals: [BlackSwanConversionConditional],
  }
}

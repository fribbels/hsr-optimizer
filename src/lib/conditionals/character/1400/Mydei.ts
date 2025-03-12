import { AbilityType } from 'lib/conditionals/conditionalConstants'
import { AbilityEidolon, Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { dynamicStatConversion, gpuDynamicStatConversion } from 'lib/conditionals/evaluation/statConversion'
import { ConditionalActivation, ConditionalType, Stats } from 'lib/constants/constants'
import { wgslTrue } from 'lib/gpu/injection/wgslUtils'
import { Source } from 'lib/optimization/buffSource'
import { ComputedStatsArray, Key } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'

import { Eidolon } from 'types/character'
import { CharacterConditionalsController } from 'types/conditionals'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Mydei.Content')
  const { basic, skill, ult, talent } = AbilityEidolon.SKILL_BASIC_3_ULT_TALENT_5
  const {
    SOURCE_BASIC,
    SOURCE_SKILL,
    SOURCE_ULT,
    SOURCE_TALENT,
    SOURCE_TECHNIQUE,
    SOURCE_TRACE,
    SOURCE_MEMO,
    SOURCE_E1,
    SOURCE_E2,
    SOURCE_E4,
    SOURCE_E6,
  } = Source.character('1404')

  const basicScaling = basic(e, 0.50, 0.55)

  const skillScaling = skill(e, 0.90, 0.99)
  const skillEnhanced1Scaling = skill(e, 1.10, 1.21)
  const skillEnhanced2Scaling = skill(e, 2.80, 3.08)

  const ultScaling = ult(e, 1.60, 1.728)

  const defaults = {
    skillEnhances: 2,
    vendettaState: true,
    hpToCrConversion: true,
    e1EnhancedSkillBuff: true,
    e2DefPen: true,
    e4CdBuff: true,
  }

  const teammateDefaults = {}

  const content: ContentDefinition<typeof defaults> = {
    skillEnhances: {
      id: 'skillEnhances',
      formItem: 'slider',
      text: t('skillEnhances.text'),
      content: t('skillEnhances.content', {
        SkillPrimaryScaling: TsUtils.precisionRound(skillScaling * 100),
        SkillAdjacentScaling: TsUtils.precisionRound(skill(e, 50, 55)),
        EnhancedSkillPrimaryScaling: TsUtils.precisionRound(skillEnhanced1Scaling * 100),
        EnhancedSkillAdjacentScaling: TsUtils.precisionRound(skill(e, 66, 72.6)),
        EnhancedSkill2PrimaryScaling: TsUtils.precisionRound(skillEnhanced2Scaling * 100),
        EnhancedSkill2AdjacentScaling: TsUtils.precisionRound(skill(e, 168, 184.8)),
      }),
      min: 0,
      max: 2,
    },
    vendettaState: {
      id: 'vendettaState',
      formItem: 'switch',
      text: t('vendettaState.text'),
      content: t('vendettaState.content', { HpRestoration: TsUtils.precisionRound(talent(e, 25, 27)) }),
    },
    hpToCrConversion: {
      id: 'hpToCrConversion',
      formItem: 'switch',
      text: t('hpToCrConversion.text'),
      content: t('hpToCrConversion.content'),
    },
    e1EnhancedSkillBuff: {
      id: 'e1EnhancedSkillBuff',
      formItem: 'switch',
      text: t('e1EnhancedSkillBuff.text'),
      content: t('e1EnhancedSkillBuff.content'),
      disabled: e < 1,
    },
    e2DefPen: {
      id: 'e2DefPen',
      formItem: 'switch',
      text: t('e2DefPen.text'),
      content: t('e2DefPen.content'),
      disabled: e < 2,
    },
    e4CdBuff: {
      id: 'e4CdBuff',
      formItem: 'switch',
      text: t('e4CdBuff.text'),
      content: t('e4CdBuff.content'),
      disabled: e < 4,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {}

  return {
    activeAbilities: [AbilityType.BASIC, AbilityType.SKILL, AbilityType.ULT],
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      x.BASIC_HP_SCALING.buff(basicScaling, SOURCE_BASIC)

      x.SKILL_HP_SCALING.buff((r.skillEnhances == 0) ? skillScaling : 0, SOURCE_SKILL)
      x.SKILL_HP_SCALING.buff((r.skillEnhances == 1) ? skillEnhanced1Scaling : 0, SOURCE_SKILL)
      x.SKILL_HP_SCALING.buff((r.skillEnhances == 2) ? skillEnhanced2Scaling : 0, SOURCE_SKILL)
      x.SKILL_HP_SCALING.buff((e >= 1 && r.e1EnhancedSkillBuff && r.skillEnhances == 2) ? 0.30 : 0, SOURCE_E1)

      x.ULT_HP_SCALING.buff(ultScaling, SOURCE_ULT)

      x.DEF_PEN.buff((e >= 2 && r.e2DefPen && r.vendettaState) ? 0.15 : 0, SOURCE_E2)
      x.CD.buff((e >= 4 && r.e4CdBuff) ? 0.30 : 0, SOURCE_E4)

      x.BASIC_TOUGHNESS_DMG.buff(10, SOURCE_BASIC)
      x.SKILL_TOUGHNESS_DMG.buff((r.skillEnhances > 1) ? 30 : 20, SOURCE_SKILL)
      x.ULT_TOUGHNESS_DMG.buff(20, SOURCE_ULT)
    },
    calculateBasicEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      x.CR.buff((r.hpToCrConversion) ? Math.max(0, Math.min(0.48, 0.016 * Math.floor((x.c.a[Key.HP] - 5000) / 100))) : 0, SOURCE_TRACE)
    },
    gpuCalculateBasicEffects: (action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      return `
if (${wgslTrue(r.hpToCrConversion)}) {
  let buffValue: f32 = max(0, min(0.48, 0.016 * floor((c.HP - 5000) / 100)));
  x.CR += buffValue;
}
`
    },
    finalizeCalculations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      if (r.vendettaState) {
        x.DEF.set(0, SOURCE_TALENT)
      }
    },
    gpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      return `
if (${wgslTrue(r.vendettaState)}) {
  x.DEF = 0;
}
`
    },
    dynamicConditionals: [
      {
        id: 'MydeiHpConditional',
        type: ConditionalType.ABILITY,
        activation: ConditionalActivation.CONTINUOUS,
        dependsOn: [Stats.HP],
        chainsTo: [Stats.HP],
        condition: function (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals as Conditionals<typeof content>

          return r.vendettaState
        },
        effect: function (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals as Conditionals<typeof content>

          dynamicStatConversion(Stats.HP, Stats.HP, this, x, action, context,
            (convertibleValue) => convertibleValue * 0.50,
          )
        },
        gpu: function (action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals as Conditionals<typeof content>

          return gpuDynamicStatConversion(Stats.HP, Stats.HP, this, action, context,
            `0.50 * convertibleValue`,
            `${wgslTrue(r.vendettaState)}`,
          )
        },
      },
    ],
  }
}

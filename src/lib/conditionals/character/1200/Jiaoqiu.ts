import { AbilityType, ULT_DMG_TYPE } from 'lib/conditionals/conditionalConstants'
import { AbilityEidolon, Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { dynamicStatConversion, gpuDynamicStatConversion } from 'lib/conditionals/evaluation/statConversion'
import { ConditionalActivation, ConditionalType, Stats } from 'lib/constants/constants'
import { wgslTrue } from 'lib/gpu/injection/wgslUtils'
import { Source } from 'lib/optimization/buffSource'
import { buffAbilityVulnerability, Target } from 'lib/optimization/calculateBuffs'
import { ComputedStatsArray, Key } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'

import { Eidolon } from 'types/character'

import { CharacterConditionalsController } from 'types/conditionals'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Jiaoqiu')
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
  } = Source.character('1218')

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 1.50, 1.65)
  const ultScaling = ult(e, 1.00, 1.08)

  const ultVulnerabilityScaling = ult(e, 0.15, 0.162)

  const talentVulnerabilityBase = talent(e, 0.15, 0.165)
  const talentVulnerabilityScaling = talent(e, 0.05, 0.055)

  const talentDotScaling = talent(e, 1.80, 1.98)

  const maxAshenRoastStacks = e >= 6 ? 9 : 5

  const defaults = {
    ashenRoastStacks: maxAshenRoastStacks,
    ultFieldActive: true,
    ehrToAtkBoost: true,
    e1DmgBoost: true,
    e2Dot: true,
    e6ResShred: true,
  }

  const teammateDefaults = {
    ashenRoastStacks: maxAshenRoastStacks,
    ultFieldActive: true,
    e1DmgBoost: true,
    e6ResShred: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    ashenRoastStacks: {
      id: 'ashenRoastStacks',
      formItem: 'slider',
      text: t('Content.ashenRoastStacks.text'),
      content: t('Content.ashenRoastStacks.content', {
        AshenRoastInitialVulnerability: TsUtils.precisionRound(100 * talentVulnerabilityBase),
        AshenRoastAdditionalVulnerability: TsUtils.precisionRound(100 * talentVulnerabilityScaling),
        AshenRoastDotMultiplier: TsUtils.precisionRound(100 * talentDotScaling),
      }),
      min: 0,
      max: maxAshenRoastStacks,
    },
    ultFieldActive: {
      id: 'ultFieldActive',
      formItem: 'switch',
      text: t('Content.ultFieldActive.text'),
      content: t('Content.ultFieldActive.content', {
        UltScaling: TsUtils.precisionRound(100 * ultScaling),
        UltVulnerability: TsUtils.precisionRound(100 * ultVulnerabilityScaling),
        ZoneDebuffChance: TsUtils.precisionRound(100 * ult(e, 0.6, 0.62)),
      }),
    },
    ehrToAtkBoost: {
      id: 'ehrToAtkBoost',
      formItem: 'switch',
      text: t('Content.ehrToAtkBoost.text'),
      content: t('Content.ehrToAtkBoost.content'),
    },
    e1DmgBoost: {
      id: 'e1DmgBoost',
      formItem: 'switch',
      text: t('Content.e1DmgBoost.text'),
      content: t('Content.e1DmgBoost.content'),
      disabled: e < 1,
    },
    e2Dot: {
      id: 'e2Dot',
      formItem: 'switch',
      text: t('Content.e2Dot.text'),
      content: t('Content.e2Dot.content'),
      disabled: e < 2,
    },
    e6ResShred: {
      id: 'e6ResShred',
      formItem: 'switch',
      text: t('Content.e6ResShred.text'),
      content: t('Content.e6ResShred.content'),
      disabled: e < 6,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    ashenRoastStacks: content.ashenRoastStacks,
    ultFieldActive: content.ultFieldActive,
    e1DmgBoost: content.e1DmgBoost,
    e6ResShred: content.e6ResShred,
  }

  return {
    activeAbilities: [AbilityType.BASIC, AbilityType.SKILL, AbilityType.ULT, AbilityType.DOT],
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      x.BASIC_ATK_SCALING.buff(basicScaling, SOURCE_BASIC)
      x.SKILL_ATK_SCALING.buff(skillScaling, SOURCE_SKILL)
      x.ULT_ATK_SCALING.buff(ultScaling, SOURCE_ULT)
      x.DOT_ATK_SCALING.buff((r.ashenRoastStacks > 0) ? talentDotScaling : 0, SOURCE_TALENT)
      x.DOT_ATK_SCALING.buff((e >= 2 && r.e2Dot && r.ashenRoastStacks > 0) ? 3.00 : 0, SOURCE_E2)
      x.DOT_CHANCE.set(100, SOURCE_TALENT)

      x.BASIC_TOUGHNESS_DMG.buff(10, SOURCE_BASIC)
      x.SKILL_TOUGHNESS_DMG.buff(20, SOURCE_SKILL)
      x.ULT_TOUGHNESS_DMG.buff(20, SOURCE_ULT)

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      buffAbilityVulnerability(x, ULT_DMG_TYPE, (m.ultFieldActive) ? ultVulnerabilityScaling : 0, SOURCE_ULT, Target.TEAM)

      x.VULNERABILITY.buffTeam((m.ashenRoastStacks > 0) ? talentVulnerabilityBase : 0, SOURCE_TALENT)
      x.VULNERABILITY.buffTeam(Math.max(0, m.ashenRoastStacks - 1) * talentVulnerabilityScaling, SOURCE_TALENT)

      x.ELEMENTAL_DMG.buffTeam((e >= 1 && m.e1DmgBoost && m.ashenRoastStacks > 0) ? 0.40 : 0, SOURCE_E1)

      x.RES_PEN.buffTeam((e >= 6 && m.e6ResShred) ? m.ashenRoastStacks * 0.03 : 0, SOURCE_E6)
    },
    finalizeCalculations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {},
    gpuFinalizeCalculations: () => '',
    dynamicConditionals: [
      {
        id: 'JiaoqiuConversionConditional',
        type: ConditionalType.ABILITY,
        activation: ConditionalActivation.CONTINUOUS,
        dependsOn: [Stats.EHR],
        chainsTo: [Stats.ATK],
        condition: function (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals as Conditionals<typeof content>
          return r.ehrToAtkBoost && x.a[Key.EHR] > 0.80
        },
        effect: function (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
          dynamicStatConversion(Stats.EHR, Stats.ATK, this, x, action, context,
            (convertibleValue) => Math.min(2.40, 0.60 * Math.floor((convertibleValue - 0.80) / 0.15)) * context.baseATK,
          )
        },
        gpu: function (action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals as Conditionals<typeof content>

          return gpuDynamicStatConversion(Stats.EHR, Stats.ATK, this, action, context,
            `min(2.40, 0.60 * floor((convertibleValue - 0.80) / 0.15)) * baseATK`,
            `${wgslTrue(r.ehrToAtkBoost)} && x.EHR > 0.80`,
          )
        },
      },
    ],
  }
}

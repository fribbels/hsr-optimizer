import { AbilityType } from 'lib/conditionals/conditionalConstants'
import {
  AbilityEidolon,
  Conditionals,
  ContentDefinition,
  createEnum,
} from 'lib/conditionals/conditionalUtils'
import {
  dynamicStatConversionContainer,
  gpuDynamicStatConversion,
} from 'lib/conditionals/evaluation/statConversion'
import { HitDefinitionBuilder } from 'lib/conditionals/hitDefinitionBuilder'
import {
  ConditionalActivation,
  ConditionalType,
  Stats,
} from 'lib/constants/constants'
import { wgslTrue } from 'lib/gpu/injection/wgslUtils'
import { Source } from 'lib/optimization/buffSource'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import { StatKey } from 'lib/optimization/engine/config/keys'
import { ElementTag, TargetTag } from 'lib/optimization/engine/config/tag'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { TsUtils } from 'lib/utils/TsUtils'

import { Eidolon } from 'types/character'

import { CharacterConditionalsController } from 'types/conditionals'
import {
  OptimizerAction,
  OptimizerContext,
} from 'types/optimizer'

export const FuXuanEntities = createEnum('FuXuan')
export const FuXuanAbilities = createEnum('BASIC', 'ULT', 'TALENT_HEAL', 'BREAK')

export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.FuXuan')
  const { basic, skill, ult, talent } = AbilityEidolon.SKILL_TALENT_3_ULT_BASIC_5
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
  } = Source.character('1208')

  const skillCrBuffValue = skill(e, 0.12, 0.132)
  const skillHpBuffValue = skill(e, 0.06, 0.066)
  const talentDmgReductionValue = talent(e, 0.18, 0.196)

  const basicScaling = basic(e, 0.50, 0.55)
  const ultScaling = ult(e, 1.00, 1.08)

  const ultHealScaling = 0.05
  const ultHealFlat = 133

  const defaults = {
    skillActive: true,
    talentActive: true,
    e6TeamHpLostPercent: 1.2,
  }

  const teammateDefaults = {
    skillActive: true,
    talentActive: true,
    teammateHPValue: 8000,
  }

  const content: ContentDefinition<typeof defaults> = {
    talentActive: {
      id: 'talentActive',
      formItem: 'switch',
      text: t('Content.talentActive.text'),
      content: t('Content.talentActive.content', { talentDmgReductionValue: TsUtils.precisionRound(100 * talentDmgReductionValue) }),
    },
    skillActive: {
      id: 'skillActive',
      formItem: 'switch',
      text: t('Content.skillActive.text'),
      content: t('Content.skillActive.content', {
        skillHpBuffValue: TsUtils.precisionRound(100 * skillHpBuffValue),
        skillCrBuffValue: TsUtils.precisionRound(100 * skillCrBuffValue),
      }),
    },
    e6TeamHpLostPercent: {
      id: 'e6TeamHpLostPercent',
      formItem: 'slider',
      text: t('Content.e6TeamHpLostPercent.text'),
      content: t('Content.e6TeamHpLostPercent.content'),
      min: 0,
      max: 1.2,
      percent: true,
      disabled: e < 6,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    talentActive: content.talentActive,
    skillActive: content.skillActive,
    teammateHPValue: {
      id: 'teammateHPValue',
      formItem: 'slider',
      text: t('TeammateContent.teammateHPValue.text'),
      content: t('TeammateContent.teammateHPValue.content', { skillHpBuffValue: TsUtils.precisionRound(100 * skillHpBuffValue) }),
      min: 0,
      max: 10000,
    },
  }

  return {
    activeAbilities: [AbilityType.BASIC, AbilityType.ULT],
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,

    entityDeclaration: () => Object.values(FuXuanEntities),
    entityDefinition: (action: OptimizerAction, context: OptimizerContext) => ({
      [FuXuanEntities.FuXuan]: {
        primary: true,
        summon: false,
        memosprite: false,
      },
    }),

    actionDeclaration: () => Object.values(FuXuanAbilities),
    actionDefinition: (action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // E6: Bonus HP scaling based on team HP lost
      const e6UltBonus = (e >= 6) ? 2.00 * r.e6TeamHpLostPercent : 0

      return {
        [FuXuanAbilities.BASIC]: {
          hits: [
            HitDefinitionBuilder.standardBasic()
              .damageElement(ElementTag.Quantum)
              .hpScaling(basicScaling)
              .toughnessDmg(10)
              .build(),
          ],
        },
        [FuXuanAbilities.ULT]: {
          hits: [
            HitDefinitionBuilder.standardUlt()
              .damageElement(ElementTag.Quantum)
              .hpScaling(ultScaling + e6UltBonus)
              .toughnessDmg(20)
              .build(),
          ],
        },
        [FuXuanAbilities.TALENT_HEAL]: {
          hits: [
            HitDefinitionBuilder.talentHeal()
              .hpScaling(ultHealScaling)
              .flatHeal(ultHealFlat)
              .build(),
          ],
        },
        [FuXuanAbilities.BREAK]: {
          hits: [
            HitDefinitionBuilder.standardBreak(ElementTag.Quantum).build(),
          ],
        },
      }
    },
    actionModifiers: () => [],

    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
    },

    precomputeMutualEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      // Skill: Team CR buff
      x.buff(StatKey.CR, (m.skillActive) ? skillCrBuffValue : 0, x.targets(TargetTag.FullTeam).source(SOURCE_SKILL))

      // E1: Team CD buff when skill active
      x.buff(StatKey.CD, (e >= 1 && m.skillActive) ? 0.30 : 0, x.targets(TargetTag.FullTeam).source(SOURCE_E1))

      // Talent: Team damage reduction (shared)
      x.multiplicativeComplement(StatKey.DMG_RED, (m.talentActive) ? talentDmgReductionValue : 0, x.targets(TargetTag.FullTeam).source(SOURCE_TALENT))
    },

    precomputeTeammateEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const t = action.characterConditionals as Conditionals<typeof teammateContent>

      // Skill: HP buff for teammates (based on Fu Xuan's HP)
      const hpBuff = (t.skillActive) ? skillHpBuffValue * t.teammateHPValue : 0
      x.buff(StatKey.HP, hpBuff, x.targets(TargetTag.FullTeam).source(SOURCE_SKILL))
      x.buff(StatKey.UNCONVERTIBLE_HP_BUFF, hpBuff, x.targets(TargetTag.FullTeam).source(SOURCE_SKILL))

      // Skill: Additional damage reduction for teammates only (65%)
      x.multiplicativeComplement(StatKey.DMG_RED, (t.skillActive) ? 0.65 : 0, x.targets(TargetTag.FullTeam).source(SOURCE_SKILL))
    },

    finalizeCalculations: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
    },
    newGpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => '',

    dynamicConditionals: [
      {
        id: 'FuXuanHpConditional',
        type: ConditionalType.ABILITY,
        activation: ConditionalActivation.CONTINUOUS,
        dependsOn: [Stats.HP],
        chainsTo: [Stats.HP],
        condition: function(x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals as Conditionals<typeof content>
          return r.skillActive
        },
        effect: function(x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) {
          dynamicStatConversionContainer(
            Stats.HP,
            Stats.HP,
            this,
            x,
            action,
            context,
            SOURCE_SKILL,
            (convertibleValue) => convertibleValue * skillHpBuffValue,
          )
        },
        gpu: function(action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals as Conditionals<typeof content>

          return gpuDynamicStatConversion(
            Stats.HP,
            Stats.HP,
            this,
            action,
            context,
            `${skillHpBuffValue} * convertibleValue`,
            `${wgslTrue(r.skillActive)}`,
          )
        },
      },
    ],
  }
}

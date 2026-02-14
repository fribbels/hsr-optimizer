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
import { DamageTag, ElementTag, TargetTag } from 'lib/optimization/engine/config/tag'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { TsUtils } from 'lib/utils/TsUtils'

import { Eidolon } from 'types/character'

import { CharacterConditionalsController } from 'types/conditionals'
import {
  OptimizerAction,
  OptimizerContext,
} from 'types/optimizer'

export const HanyaEntities = createEnum('Hanya')
export const HanyaAbilities = createEnum('BASIC', 'SKILL', 'BREAK')

export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Hanya')
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
  } = Source.character('1215')

  const ultSpdBuffValue = ult(e, 0.20, 0.21)
  const ultAtkBuffValue = ult(e, 0.60, 0.648)
  let talentDmgBoostValue = talent(e, 0.30, 0.33)

  talentDmgBoostValue += (e >= 6) ? 0.10 : 0

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 2.40, 2.64)

  const defaults = {
    ultBuff: true,
    targetBurdenActive: true,
    burdenAtkBuff: true,
    e2SkillSpdBuff: false,
  }

  const teammateDefaults = {
    ultBuff: true,
    targetBurdenActive: true,
    burdenAtkBuff: true,
    teammateSPDValue: 160,
  }

  const content: ContentDefinition<typeof defaults> = {
    ultBuff: {
      id: 'ultBuff',
      formItem: 'switch',
      text: t('Content.ultBuff.text'),
      content: t('Content.ultBuff.content', {
        ultSpdBuffValue: TsUtils.precisionRound(100 * ultSpdBuffValue),
        ultAtkBuffValue: TsUtils.precisionRound(100 * ultAtkBuffValue),
      }),
    },
    targetBurdenActive: {
      id: 'targetBurdenActive',
      formItem: 'switch',
      text: t('Content.targetBurdenActive.text'),
      content: t('Content.targetBurdenActive.content', { talentDmgBoostValue: TsUtils.precisionRound(100 * talentDmgBoostValue) }),
    },
    burdenAtkBuff: {
      id: 'burdenAtkBuff',
      formItem: 'switch',
      text: t('Content.burdenAtkBuff.text'),
      content: t('Content.burdenAtkBuff.content'),
    },
    e2SkillSpdBuff: {
      id: 'e2SkillSpdBuff',
      formItem: 'switch',
      text: t('Content.e2SkillSpdBuff.text'),
      content: t('Content.e2SkillSpdBuff.content'),
      disabled: e < 2,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    ultBuff: content.ultBuff,
    teammateSPDValue: {
      id: 'teammateSPDValue',
      formItem: 'slider',
      text: t('TeammateContent.teammateSPDValue.text'),
      content: t('TeammateContent.teammateSPDValue.content', {
        ultSpdBuffValue: TsUtils.precisionRound(100 * ultSpdBuffValue),
        ultAtkBuffValue: TsUtils.precisionRound(100 * ultAtkBuffValue),
      }),
      min: 0,
      max: 300,
    },
    targetBurdenActive: content.targetBurdenActive,
    burdenAtkBuff: content.burdenAtkBuff,
  }

  return {
    activeAbilities: [AbilityType.BASIC, AbilityType.SKILL],
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,

    entityDeclaration: () => Object.values(HanyaEntities),
    entityDefinition: (action: OptimizerAction, context: OptimizerContext) => ({
      [HanyaEntities.Hanya]: {
        primary: true,
        summon: false,
        memosprite: false,
      },
    }),

    actionDeclaration: () => Object.values(HanyaAbilities),
    actionDefinition: (action: OptimizerAction, context: OptimizerContext) => {
      return {
        [HanyaAbilities.BASIC]: {
          hits: [
            HitDefinitionBuilder.standardBasic()
              .damageElement(ElementTag.Physical)
              .atkScaling(basicScaling)
              .toughnessDmg(10)
              .build(),
          ],
        },
        [HanyaAbilities.SKILL]: {
          hits: [
            HitDefinitionBuilder.standardSkill()
              .damageElement(ElementTag.Physical)
              .atkScaling(skillScaling)
              .toughnessDmg(20)
              .build(),
          ],
        },
        [HanyaAbilities.BREAK]: {
          hits: [
            HitDefinitionBuilder.standardBreak(ElementTag.Physical).build(),
          ],
        },
      }
    },
    actionModifiers: () => [],

    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // E2 - SPD buff after using skill
      x.buff(StatKey.SPD_P, (e >= 2 && r.e2SkillSpdBuff) ? 0.20 : 0, x.source(SOURCE_E2))
    },

    precomputeMutualEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      // Trace - ATK buff when attacking Burdened enemy
      x.buff(StatKey.ATK_P, (m.burdenAtkBuff) ? 0.10 : 0, x.targets(TargetTag.FullTeam).source(SOURCE_TRACE))

      // Talent - DMG boost for Basic/Skill/Ult against Burdened enemy
      x.buff(StatKey.DMG_BOOST, (m.targetBurdenActive) ? talentDmgBoostValue : 0,
        x.damageType(DamageTag.BASIC | DamageTag.SKILL | DamageTag.ULT).targets(TargetTag.FullTeam).source(SOURCE_TALENT))
    },

    precomputeTeammateEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const t = action.characterConditionals as Conditionals<typeof teammateContent>

      // Ult - SPD and ATK buff to single ally
      const spdBuff = (t.ultBuff) ? ultSpdBuffValue * t.teammateSPDValue : 0
      x.buff(StatKey.SPD, spdBuff, x.targets(TargetTag.SingleTarget).source(SOURCE_ULT))
      x.buff(StatKey.UNCONVERTIBLE_SPD_BUFF, spdBuff, x.targets(TargetTag.SingleTarget).source(SOURCE_ULT))
      x.buff(StatKey.ATK_P, (t.ultBuff) ? ultAtkBuffValue : 0, x.targets(TargetTag.SingleTarget).source(SOURCE_ULT))
    },

    finalizeCalculations: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
    },
    newGpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => '',

    dynamicConditionals: [{
      id: 'HanyaSpdConditional',
      type: ConditionalType.ABILITY,
      activation: ConditionalActivation.CONTINUOUS,
      dependsOn: [Stats.SPD],
      chainsTo: [Stats.SPD],
      condition: function (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) {
        const r = action.characterConditionals as Conditionals<typeof content>
        return r.ultBuff
      },
      effect: function (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) {
        dynamicStatConversionContainer(Stats.SPD, Stats.SPD, this, x, action, context, SOURCE_ULT, (convertibleValue) => convertibleValue * ultSpdBuffValue)
      },
      gpu: function (action: OptimizerAction, context: OptimizerContext) {
        const r = action.characterConditionals as Conditionals<typeof content>

        return gpuDynamicStatConversion(Stats.SPD, Stats.SPD, this, action, context, `${ultSpdBuffValue} * convertibleValue`, `${wgslTrue(r.ultBuff)}`)
      },
    }],
  }
}

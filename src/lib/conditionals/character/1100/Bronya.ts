import {
  AbilityType,
  ASHBLAZING_ATK_STACK,
} from 'lib/conditionals/conditionalConstants'
import {
  boostAshblazingAtkContainer,
  gpuBoostAshblazingAtkContainer,
} from 'lib/conditionals/conditionalFinalizers'
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
import { StatKey } from 'lib/optimization/engine/config/keys'
import {
  DamageTag,
  ElementTag,
  TargetTag,
} from 'lib/optimization/engine/config/tag'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { TsUtils } from 'lib/utils/TsUtils'

import { Eidolon } from 'types/character'

import { CharacterConditionalsController } from 'types/conditionals'
import { AbilityDefinition } from 'types/hitConditionalTypes'
import {
  OptimizerAction,
  OptimizerContext,
} from 'types/optimizer'

export const BronyaEntities = createEnum('Bronya')
export const BronyaAbilities = createEnum('BASIC', 'FUA', 'BREAK')

export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Bronya')
  const { basic, skill, ult } = AbilityEidolon.ULT_TALENT_3_SKILL_BASIC_5
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
  } = Source.character('1101')

  const skillDmgBoostValue = skill(e, 0.66, 0.726)
  const ultAtkBoostValue = ult(e, 0.55, 0.594)
  const ultCdBoostValue = ult(e, 0.16, 0.168)
  const ultCdBoostBaseValue = ult(e, 0.20, 0.216)

  const basicScaling = basic(e, 1.0, 1.1)
  const fuaScaling = basicScaling * 0.80

  const hitMulti = ASHBLAZING_ATK_STACK * (1 * 1 / 1)

  const defaults = {
    teamDmgBuff: true,
    skillBuff: true,
    ultBuff: true,
    battleStartDefBuff: false,
    techniqueBuff: false,
    e2SkillSpdBuff: false,
  }

  const teammateDefaults = {
    ...defaults,
    e2SkillSpdBuff: true,
    teammateCDValue: 2.50,
  }

  const content: ContentDefinition<typeof defaults> = {
    teamDmgBuff: {
      id: 'teamDmgBuff',
      formItem: 'switch',
      text: t('Content.teamDmgBuff.text'),
      content: t('Content.teamDmgBuff.content'),
    },
    skillBuff: {
      id: 'skillBuff',
      formItem: 'switch',
      text: t('Content.skillBuff.text'),
      content: t('Content.skillBuff.content', { skillDmgBoostValue: TsUtils.precisionRound(100 * skillDmgBoostValue) }),
    },
    ultBuff: {
      id: 'ultBuff',
      formItem: 'switch',
      text: t('Content.ultBuff.text'),
      content: t('Content.ultBuff.content', {
        ultAtkBoostValue: TsUtils.precisionRound(100 * ultAtkBoostValue),
        ultCdBoostValue: TsUtils.precisionRound(100 * ultCdBoostValue),
        ultCdBoostBaseValue: TsUtils.precisionRound(100 * ultCdBoostBaseValue),
      }),
    },
    battleStartDefBuff: {
      id: 'battleStartDefBuff',
      formItem: 'switch',
      text: t('Content.battleStartDefBuff.text'),
      content: t('Content.battleStartDefBuff.content'),
    },
    techniqueBuff: {
      id: 'techniqueBuff',
      formItem: 'switch',
      text: t('Content.techniqueBuff.text'),
      content: t('Content.techniqueBuff.content'),
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
    teamDmgBuff: content.teamDmgBuff,
    skillBuff: content.skillBuff,
    ultBuff: content.ultBuff,
    battleStartDefBuff: content.battleStartDefBuff,
    techniqueBuff: content.techniqueBuff,
    teammateCDValue: {
      id: 'teammateCDValue',
      formItem: 'slider',
      text: t('TeammateContent.teammateCDValue.text'),
      content: t('TeammateContent.teammateCDValue.content', {
        ultAtkBoostValue: TsUtils.precisionRound(100 * ultAtkBoostValue),
        ultCdBoostValue: TsUtils.precisionRound(100 * ultCdBoostValue),
        ultCdBoostBaseValue: TsUtils.precisionRound(100 * ultCdBoostBaseValue),
      }),
      min: 0,
      max: 4.00,
      percent: true,
    },
    e2SkillSpdBuff: content.e2SkillSpdBuff,
  }

  return {
    activeAbilities: [AbilityType.BASIC, AbilityType.FUA],
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,

    entityDeclaration: () => Object.values(BronyaEntities),
    entityDefinition: (action: OptimizerAction, context: OptimizerContext) => ({
      [BronyaEntities.Bronya]: {
        primary: true,
        summon: false,
        memosprite: false,
      },
    }),

    actionDeclaration: () => Object.values(BronyaAbilities),
    actionDefinition: (action: OptimizerAction, context: OptimizerContext) => ({
      [BronyaAbilities.BASIC]: {
        hits: [
          HitDefinitionBuilder.standardBasic()
            .damageElement(ElementTag.Wind)
            .atkScaling(basicScaling)
            .toughnessDmg(10)
            .build(),
        ],
      },
      [BronyaAbilities.FUA]: {
        hits: (e >= 4)
          ? [
            HitDefinitionBuilder.standardFua()
              .damageElement(ElementTag.Wind)
              .atkScaling(fuaScaling)
              .toughnessDmg(10)
              .build(),
          ]
          : [],
      },
      [BronyaAbilities.BREAK]: {
        hits: [
          HitDefinitionBuilder.standardBreak(ElementTag.Wind).build(),
        ],
      },
    }),
    actionModifiers: () => [],

    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // Trace: BASIC CR +100%
      x.buff(StatKey.CR, 1.00, x.damageType(DamageTag.BASIC).source(SOURCE_TRACE))

      // Ult CD boost (base portion - the scaling portion is handled in dynamicConditionals)
      if (r.ultBuff) {
        x.buff(StatKey.CD, ultCdBoostBaseValue, x.source(SOURCE_ULT))
        x.buff(StatKey.UNCONVERTIBLE_CD_BUFF, ultCdBoostBaseValue, x.source(SOURCE_ULT))
      }
    },

    precomputeMutualEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      // Team buffs
      x.buff(StatKey.DEF_P, (m.battleStartDefBuff) ? 0.20 : 0, x.targets(TargetTag.FullTeam).source(SOURCE_TRACE))
      x.buff(StatKey.ATK_P, (m.techniqueBuff) ? 0.15 : 0, x.targets(TargetTag.FullTeam).source(SOURCE_TECHNIQUE))
      x.buff(StatKey.ATK_P, (m.ultBuff) ? ultAtkBoostValue : 0, x.targets(TargetTag.FullTeam).source(SOURCE_ULT))
      x.buff(StatKey.DMG_BOOST, (m.teamDmgBuff) ? 0.10 : 0, x.targets(TargetTag.FullTeam).source(SOURCE_TRACE))

      // Single target buffs
      x.buff(StatKey.SPD_P, (e >= 2 && m.e2SkillSpdBuff) ? 0.30 : 0, x.targets(TargetTag.SingleTarget).source(SOURCE_E2))
      x.buff(StatKey.DMG_BOOST, (m.skillBuff) ? skillDmgBoostValue : 0, x.targets(TargetTag.SingleTarget).source(SOURCE_SKILL))
    },

    precomputeTeammateEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const t = action.characterConditionals as Conditionals<typeof teammateContent>

      const cdBuff = (t.ultBuff) ? ultCdBoostValue * t.teammateCDValue + ultCdBoostBaseValue : 0
      x.buff(StatKey.CD, cdBuff, x.targets(TargetTag.FullTeam).source(SOURCE_ULT))
      x.buff(StatKey.UNCONVERTIBLE_CD_BUFF, cdBuff, x.targets(TargetTag.FullTeam).source(SOURCE_ULT))
    },

    finalizeCalculations: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      boostAshblazingAtkContainer(x, action, hitMulti)
    },
    newGpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => {
      return gpuBoostAshblazingAtkContainer(hitMulti, action)
    },
    dynamicConditionals: [
      {
        id: 'BronyaCdConditional',
        type: ConditionalType.ABILITY,
        activation: ConditionalActivation.CONTINUOUS,
        dependsOn: [Stats.CD],
        chainsTo: [Stats.CD],
        condition: function(x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals as Conditionals<typeof content>
          return r.ultBuff
        },
        effect: function(x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) {
          dynamicStatConversionContainer(Stats.CD, Stats.CD, this, x, action, context, SOURCE_ULT, (convertibleValue) => convertibleValue * ultCdBoostValue)
        },
        gpu: function(action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals as Conditionals<typeof content>
          return gpuDynamicStatConversion(Stats.CD, Stats.CD, this, action, context, `${ultCdBoostValue} * convertibleValue`, `${wgslTrue(r.ultBuff)}`)
        },
      },
    ],
  }
}

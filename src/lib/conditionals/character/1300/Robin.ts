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
import {
  DamageTag,
  ElementTag,
  TargetTag,
} from 'lib/optimization/engine/config/tag'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { TsUtils } from 'lib/utils/TsUtils'

import { Eidolon } from 'types/character'

import { CharacterConditionalsController } from 'types/conditionals'
import {
  OptimizerAction,
  OptimizerContext,
} from 'types/optimizer'

export const RobinEntities = createEnum('Robin')
export const RobinAbilities = createEnum('BASIC', 'BREAK')

export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Robin')
  const { basic, skill, ult, talent } = AbilityEidolon.SKILL_ULT_3_BASIC_TALENT_5
  const {
    SOURCE_BASIC,
    SOURCE_SKILL,
    SOURCE_ULT,
    SOURCE_TALENT,
    SOURCE_TRACE,
    SOURCE_E1,
    SOURCE_E2,
    SOURCE_E4,
    SOURCE_E6,
  } = Source.character('1309')

  const skillDmgBuffValue = skill(e, 0.50, 0.55)
  const talentCdBuffValue = talent(e, 0.20, 0.23)
  const ultAtkBuffScalingValue = ult(e, 0.228, 0.2432)
  const ultAtkBuffFlatValue = ult(e, 200, 230)

  const basicScaling = basic(e, 1.00, 1.10)
  const ultScaling = ult(e, 1.20, 1.296)

  const defaults = {
    concertoActive: true,
    skillDmgBuff: true,
    talentCdBuff: true,
    e1UltResPen: true,
    e2UltSpdBuff: false,
    e4TeamResBuff: false,
    e6UltCDBoost: true,
  }

  const teammateDefaults = {
    concertoActive: true,
    skillDmgBuff: true,
    talentCdBuff: true,
    teammateATKValue: 4500,
    traceFuaCdBoost: true,
    e1UltResPen: true,
    e2UltSpdBuff: true,
    e4TeamResBuff: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    concertoActive: {
      id: 'concertoActive',
      formItem: 'switch',
      text: t('Content.concertoActive.text'),
      content: t('Content.concertoActive.content', {
        ultAtkBuffScalingValue: TsUtils.precisionRound(100 * ultAtkBuffScalingValue),
        ultAtkBuffFlatValue: ultAtkBuffFlatValue,
        ultScaling: TsUtils.precisionRound(100 * ultScaling),
      }),
    },
    skillDmgBuff: {
      id: 'skillDmgBuff',
      formItem: 'switch',
      text: t('Content.skillDmgBuff.text'),
      content: t('Content.skillDmgBuff.content', { skillDmgBuffValue: TsUtils.precisionRound(100 * skillDmgBuffValue) }),
    },
    talentCdBuff: {
      id: 'talentCdBuff',
      formItem: 'switch',
      text: t('Content.talentCdBuff.text'),
      content: t('Content.talentCdBuff.content', { talentCdBuffValue: TsUtils.precisionRound(100 * talentCdBuffValue) }),
    },
    e1UltResPen: {
      id: 'e1UltResPen',
      formItem: 'switch',
      text: t('Content.e1UltResPen.text'),
      content: t('Content.e1UltResPen.content'),
      disabled: e < 1,
    },
    e2UltSpdBuff: {
      id: 'e2UltSpdBuff',
      formItem: 'switch',
      text: t('TeammateContent.e2UltSpdBuff.text'),
      content: t('TeammateContent.e2UltSpdBuff.content'),
      disabled: e < 2,
    },
    e4TeamResBuff: {
      id: 'e4TeamResBuff',
      formItem: 'switch',
      text: t('Content.e4TeamResBuff.text'),
      content: t('Content.e4TeamResBuff.content'),
      disabled: e < 4,
    },
    e6UltCDBoost: {
      id: 'e6UltCDBoost',
      formItem: 'switch',
      text: t('Content.e6UltCDBoost.text'),
      content: t('Content.e6UltCDBoost.content'),
      disabled: e < 6,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    concertoActive: content.concertoActive,
    skillDmgBuff: content.skillDmgBuff,
    teammateATKValue: {
      id: 'teammateATKValue',
      formItem: 'slider',
      text: t('TeammateContent.teammateATKValue.text'),
      content: t('TeammateContent.teammateATKValue.content', {
        ultAtkBuffFlatValue: TsUtils.precisionRound(ultAtkBuffFlatValue),
        ultAtkBuffScalingValue: TsUtils.precisionRound(100 * ultAtkBuffScalingValue),
      }),
      min: 0,
      max: 10000,
    },
    talentCdBuff: content.talentCdBuff,
    traceFuaCdBoost: {
      id: 'traceFuaCdBoost',
      formItem: 'switch',
      text: t('TeammateContent.traceFuaCdBoost.text'),
      content: t('TeammateContent.traceFuaCdBoost.content'),
    },
    e1UltResPen: content.e1UltResPen,
    e2UltSpdBuff: content.e2UltSpdBuff,
    e4TeamResBuff: content.e4TeamResBuff,
  }

  return {
    activeAbilities: [AbilityType.BASIC, AbilityType.ULT],
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,

    entityDeclaration: () => Object.values(RobinEntities),
    entityDefinition: (action: OptimizerAction, context: OptimizerContext) => ({
      [RobinEntities.Robin]: {
        primary: true,
        summon: false,
        memosprite: false,
      },
    }),

    actionDeclaration: () => Object.values(RobinAbilities),
    actionDefinition: (action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // CD override: 1.50 normally, 6.00 with E6 + e6UltCDBoost
      const ultAdditionalCdOverride = (e >= 6 && r.concertoActive && r.e6UltCDBoost) ? 6.00 : 1.50

      return {
        [RobinAbilities.BASIC]: {
          hits: [
            HitDefinitionBuilder.standardBasic()
              .damageElement(ElementTag.Physical)
              .atkScaling(basicScaling)
              .toughnessDmg(10)
              .build(),
            // Additional damage hit when concerto active (guaranteed crit with custom CD)
            ...(
              (r.concertoActive)
                ? [
                  HitDefinitionBuilder.standardAdditional()
                    .damageElement(ElementTag.Physical)
                    .atkScaling(ultScaling)
                    .crOverride(1.00)
                    .cdOverride(ultAdditionalCdOverride)
                    .build(),
                ]
                : []
            ),
          ],
        },
        [RobinAbilities.BREAK]: {
          hits: [
            HitDefinitionBuilder.standardBreak(ElementTag.Physical).build(),
          ],
        },
      }
    },
    actionModifiers: () => [],

    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // Flat ATK buff when concerto active
      if (r.concertoActive) {
        x.buff(StatKey.UNCONVERTIBLE_ATK_BUFF, ultAtkBuffFlatValue, x.source(SOURCE_ULT))
        x.buff(StatKey.ATK, ultAtkBuffFlatValue, x.source(SOURCE_ULT))
      }
    },

    precomputeMutualEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      // Talent CD buff to team
      x.buff(StatKey.CD, m.talentCdBuff ? talentCdBuffValue : 0, x.targets(TargetTag.FullTeam).source(SOURCE_TALENT))

      // E4: RES buff to team when concerto active
      x.buff(StatKey.RES, (e >= 4 && m.concertoActive && m.e4TeamResBuff) ? 0.50 : 0, x.targets(TargetTag.FullTeam).source(SOURCE_E4))

      // E2: SPD buff to team when concerto active
      x.buff(StatKey.SPD_P, (e >= 2 && m.concertoActive && m.e2UltSpdBuff) ? 0.16 : 0, x.targets(TargetTag.FullTeam).source(SOURCE_E2))

      // Skill DMG buff to team
      x.buff(StatKey.DMG_BOOST, m.skillDmgBuff ? skillDmgBuffValue : 0, x.targets(TargetTag.FullTeam).source(SOURCE_SKILL))

      // E1: RES PEN to team when concerto active
      x.buff(StatKey.RES_PEN, (e >= 1 && m.concertoActive && m.e1UltResPen) ? 0.24 : 0, x.targets(TargetTag.FullTeam).source(SOURCE_E1))
    },

    precomputeTeammateEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const t = action.characterConditionals as Conditionals<typeof teammateContent>

      // ATK buff based on teammate's ATK value when concerto active
      const atkBuff = t.concertoActive ? t.teammateATKValue * ultAtkBuffScalingValue + ultAtkBuffFlatValue : 0
      x.buff(StatKey.UNCONVERTIBLE_ATK_BUFF, atkBuff, x.targets(TargetTag.FullTeam).source(SOURCE_ULT))
      x.buff(StatKey.ATK, atkBuff, x.targets(TargetTag.FullTeam).source(SOURCE_ULT))

      // Trace: FUA CD boost when concerto active
      x.buff(StatKey.CD, t.traceFuaCdBoost && t.concertoActive ? 0.25 : 0, x.damageType(DamageTag.FUA).targets(TargetTag.FullTeam).source(SOURCE_TRACE))
    },

    finalizeCalculations: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
    },
    newGpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => '',

    dynamicConditionals: [
      {
        id: 'RobinAtkConversionConditional',
        type: ConditionalType.ABILITY,
        activation: ConditionalActivation.CONTINUOUS,
        dependsOn: [Stats.ATK],
        chainsTo: [Stats.ATK],
        condition: function(x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals as Conditionals<typeof content>
          return r.concertoActive
        },
        effect: function(x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) {
          dynamicStatConversionContainer(
            Stats.ATK,
            Stats.ATK,
            this,
            x,
            action,
            context,
            SOURCE_ULT,
            (convertibleValue) => convertibleValue * ultAtkBuffScalingValue,
          )
        },
        gpu: function(action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals as Conditionals<typeof content>

          return gpuDynamicStatConversion(
            Stats.ATK,
            Stats.ATK,
            this,
            action,
            context,
            `convertibleValue * ${ultAtkBuffScalingValue}`,
            `${wgslTrue(r.concertoActive)}`,
          )
        },
      },
    ],
  }
}

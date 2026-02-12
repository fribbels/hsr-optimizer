import { AbilityType } from 'lib/conditionals/conditionalConstants'
import {
  AbilityEidolon,
  Conditionals,
  ContentDefinition,
  createEnum,
  cyreneActionExists,
  cyreneSpecialEffectEidolonUpgraded,
} from 'lib/conditionals/conditionalUtils'
import {
  dynamicStatConversion,
  dynamicStatConversionContainer,
  gpuDynamicStatConversion,
} from 'lib/conditionals/evaluation/statConversion'
import { HitDefinitionBuilder } from 'lib/conditionals/hitDefinitionBuilder'
import {
  ConditionalActivation,
  ConditionalType,
  Stats,
} from 'lib/constants/constants'
import { containerActionVal } from 'lib/gpu/injection/injectUtils'
import { wgslTrue } from 'lib/gpu/injection/wgslUtils'
import { Source } from 'lib/optimization/buffSource'
import {
  ComputedStatsArray,
  Key,
} from 'lib/optimization/computedStatsArray'
import { StatKey } from 'lib/optimization/engine/config/keys'
import {
  DamageTag,
  ElementTag,
  SELF_ENTITY_INDEX,
  TargetTag,
} from 'lib/optimization/engine/config/tag'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { CERYDRA } from 'lib/simulations/tests/testMetadataConstants'
import { TsUtils } from 'lib/utils/TsUtils'
import { Eidolon } from 'types/character'
import { CharacterConditionalsController } from 'types/conditionals'
import {
  OptimizerAction,
  OptimizerContext,
} from 'types/optimizer'

export const CerydraEntities = createEnum('Cerydra')
export const CerydraAbilities = createEnum('BASIC', 'ULT', 'BREAK')

export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Cerydra')
  const { basic, skill, ult, talent } = AbilityEidolon.SKILL_BASIC_3_ULT_TALENT_5
  const {
    SOURCE_BASIC,
    SOURCE_SKILL,
    SOURCE_TALENT,
    SOURCE_TRACE,
    SOURCE_ULT,
    SOURCE_E1,
    SOURCE_E2,
    SOURCE_E4,
    SOURCE_E6,
    SOURCE_MEMO,
  } = Source.character(CERYDRA)

  const basicScaling = basic(e, 1.00, 1.10)
  const skillCdScaling = skill(e, 0.72, 0.792)
  const skillResPenScaling = skill(e, 0.10, 0.104)
  const ultScaling = ult(e, 2.40, 2.592)
  const talentAtkScaling = talent(e, 0.24, 0.252)

  const defaults = {
    spdBuff: true,
    crBuff: true,
    atkToCd: true,
    e2DmgBoost: true,
    e4UltDmg: true,
    e6Buffs: true,
  }

  const teammateDefaults = {
    militaryMerit: true,
    peerage: true,
    teammateATKValue: 4000,
    spdBuff: true,
    cyreneSpecialEffect: true,
    e1DefPen: true,
    e2DmgBoost: true,
    e6Buffs: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    spdBuff: {
      id: 'spdBuff',
      formItem: 'switch',
      text: t('Content.spdBuff.text'),
      content: t('Content.spdBuff.content'),
    },
    crBuff: {
      id: 'crBuff',
      formItem: 'switch',
      text: t('Content.crBuff.text'),
      content: t('Content.crBuff.content'),
    },
    atkToCd: {
      id: 'atkToCd',
      formItem: 'switch',
      text: t('Content.atkToCd.text'),
      content: t('Content.atkToCd.content'),
    },
    e2DmgBoost: {
      id: 'e2DmgBoost',
      formItem: 'switch',
      text: t('Content.e2DmgBoost.text'),
      content: t('Content.e2DmgBoost.content'),
      disabled: e < 2,
    },
    e4UltDmg: {
      id: 'e4UltDmg',
      formItem: 'switch',
      text: t('Content.e4UltDmg.text'),
      content: t('Content.e4UltDmg.content'),
      disabled: e < 4,
    },
    e6Buffs: {
      id: 'e6Buffs',
      formItem: 'switch',
      text: t('Content.e6Buffs.text'),
      content: t('Content.e6Buffs.content'),
      disabled: e < 6,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    militaryMerit: {
      id: 'militaryMerit',
      formItem: 'switch',
      text: t('TeammateContent.militaryMerit.text'),
      content: t('TeammateContent.militaryMerit.content', { TalentAtkConversion: TsUtils.precisionRound(talentAtkScaling * 100) }),
    },
    cyreneSpecialEffect: {
      id: 'cyreneSpecialEffect',
      formItem: 'switch',
      text: t('TeammateContent.cyreneSpecialEffect.text'),
      content: t('TeammateContent.cyreneSpecialEffect.content'),
    },
    peerage: {
      id: 'peerage',
      formItem: 'switch',
      text: t('TeammateContent.peerage.text'),
      content: t('TeammateContent.peerage.content', {
        SkillCdBuff: TsUtils.precisionRound(100 * skillCdScaling),
        SkillResPenBuff: TsUtils.precisionRound(100 * skillResPenScaling),
      }),
    },
    teammateATKValue: {
      id: 'teammateATKValue',
      formItem: 'slider',
      text: t('TeammateContent.teammateATKValue.text'),
      content: t('TeammateContent.teammateATKValue.content', { TalentAtkConversion: TsUtils.precisionRound(talentAtkScaling * 100) }),
      min: 0,
      max: 10000,
    },
    spdBuff: content.spdBuff,
    e1DefPen: {
      id: 'e1DefPen',
      formItem: 'switch',
      text: t('TeammateContent.e1DefPen.text'),
      content: t('TeammateContent.e1DefPen.content'),
      disabled: e < 1,
    },
    e2DmgBoost: content.e2DmgBoost,
    e6Buffs: content.e6Buffs,
  }

  return {
    activeAbilities: [AbilityType.BASIC, AbilityType.SKILL, AbilityType.ULT, AbilityType.DOT],
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,

    entityDeclaration: () => Object.values(CerydraEntities),
    entityDefinition: (action: OptimizerAction, context: OptimizerContext) => ({
      [CerydraEntities.Cerydra]: {
        primary: true,
        summon: false,
        memosprite: false,
      },
    }),

    actionDeclaration: () => Object.values(CerydraAbilities),
    actionDefinition: (action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      const e4UltScaling = (e >= 4 && r.e4UltDmg) ? 2.40 : 0

      return {
        [CerydraAbilities.BASIC]: {
          hits: [
            HitDefinitionBuilder.standardBasic()
              .damageElement(ElementTag.Wind)
              .atkScaling(basicScaling)
              .toughnessDmg(10)
              .build(),
          ],
        },
        [CerydraAbilities.ULT]: {
          hits: [
            HitDefinitionBuilder.standardUlt()
              .damageElement(ElementTag.Wind)
              .atkScaling(ultScaling + e4UltScaling)
              .toughnessDmg(20)
              .build(),
          ],
        },
        [CerydraAbilities.BREAK]: {
          hits: [
            HitDefinitionBuilder.standardBreak(ElementTag.Wind).build(),
          ],
        },
      }
    },
    actionModifiers: () => [],

    initializeConfigurationsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
    },

    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // Trace: CR buff
      x.buff(StatKey.CR, r.crBuff ? 1.00 : 0, x.source(SOURCE_TRACE))

      // Trace: SPD buff
      x.buff(StatKey.SPD, r.spdBuff ? 20 : 0, x.source(SOURCE_TRACE))

      // E2: DMG boost
      x.buff(StatKey.DMG_BOOST, (e >= 2 && r.e2DmgBoost) ? 1.60 : 0, x.source(SOURCE_E2))

      // E6: RES PEN
      x.buff(StatKey.RES_PEN, (e >= 6 && r.e6Buffs) ? 0.20 : 0, x.source(SOURCE_E6))
    },

    precomputeMutualEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
    },

    precomputeTeammateEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext, originalCharacterAction?: OptimizerAction) => {
      const t = action.characterConditionals as Conditionals<typeof teammateContent>

      // Trace: SPD buff (requires militaryMerit)
      x.buff(StatKey.SPD, (t.spdBuff && t.militaryMerit) ? 20 : 0, x.targets(TargetTag.SingleTarget).source(SOURCE_TRACE))

      // Skill: CD boost (requires militaryMerit and peerage)
      x.buff(StatKey.CD, (t.militaryMerit && t.peerage) ? skillCdScaling : 0, x.damageType(DamageTag.SKILL).targets(TargetTag.SingleTarget).source(SOURCE_SKILL))

      // Skill: RES PEN (requires militaryMerit and peerage)
      x.buff(StatKey.RES_PEN, (t.militaryMerit && t.peerage) ? skillResPenScaling : 0, x.damageType(DamageTag.SKILL).targets(TargetTag.SingleTarget).source(SOURCE_SKILL))

      // Talent: ATK buff from Cerydra's ATK (requires militaryMerit)
      const atkBuff = talentAtkScaling * t.teammateATKValue
      x.buff(StatKey.ATK, t.militaryMerit ? atkBuff : 0, x.targets(TargetTag.SingleTarget).source(SOURCE_TALENT))
      x.buff(StatKey.UNCONVERTIBLE_ATK_BUFF, t.militaryMerit ? atkBuff : 0, x.targets(TargetTag.SingleTarget).source(SOURCE_TALENT))

      // E1: DEF PEN (requires militaryMerit)
      x.buff(StatKey.DEF_PEN, (e >= 1 && t.e1DefPen && t.militaryMerit) ? 0.16 : 0, x.targets(TargetTag.SingleTarget).source(SOURCE_E1))

      // E1: Skill DEF PEN (requires peerage)
      x.buff(StatKey.DEF_PEN, (e >= 1 && t.e1DefPen && t.peerage) ? 0.20 : 0, x.damageType(DamageTag.SKILL).targets(TargetTag.SingleTarget).source(SOURCE_E1))

      // E2: DMG boost (requires militaryMerit)
      x.buff(StatKey.DMG_BOOST, (e >= 2 && t.e2DmgBoost && t.militaryMerit) ? 0.40 : 0, x.targets(TargetTag.SingleTarget).source(SOURCE_E2))

      // E6: RES PEN (requires militaryMerit)
      x.buff(StatKey.RES_PEN, (e >= 6 && t.e6Buffs && t.militaryMerit) ? 0.20 : 0, x.targets(TargetTag.SingleTarget).source(SOURCE_E6))

      // Cyrene special effect: CD buff
      if (cyreneActionExists(originalCharacterAction!)) {
        const cdBuff = cyreneSpecialEffectEidolonUpgraded(originalCharacterAction!) ? 0.33 : 0.30
        x.buff(StatKey.CD, t.cyreneSpecialEffect ? cdBuff : 0, x.targets(TargetTag.SingleTarget).source(Source.odeTo(CERYDRA)))
      }
    },

    finalizeCalculations: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
    },
    newGpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => '',

    dynamicConditionals: [
      {
        id: 'CerydraConversionConditional',
        type: ConditionalType.ABILITY,
        activation: ConditionalActivation.CONTINUOUS,
        dependsOn: [Stats.ATK],
        chainsTo: [Stats.CD],
        condition: function(x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals as Conditionals<typeof content>

          return r.atkToCd && x.getActionValue(StatKey.ATK, CerydraEntities.Cerydra) > 2000
        },
        effect: function(x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) {
          dynamicStatConversionContainer(
            Stats.ATK,
            Stats.CD,
            this,
            x,
            action,
            context,
            SOURCE_TRACE,
            (convertibleValue) => Math.min(3.60, 0.18 * Math.floor((convertibleValue - 2000) / 100)),
          )
        },
        gpu: function(action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals as Conditionals<typeof content>
          const config = action.config


          return gpuDynamicStatConversion(
            Stats.ATK,
            Stats.CD,
            this,
            action,
            context,
            `min(3.60, 0.18 * floor((convertibleValue - 2000) / 100))`,
            `${wgslTrue(r.atkToCd)} && ${containerActionVal(SELF_ENTITY_INDEX, StatKey.ATK, config)} > 2000`,
          )
        },
      },
    ],
  }
}
import i18next from 'i18next'
import { AbilityType } from 'lib/conditionals/conditionalConstants'
import {
  AbilityEidolon,
  Conditionals,
  ContentDefinition,
  cyreneSpecialEffectEidolonUpgraded,
  cyreneTeammateSpecialEffectActive,
} from 'lib/conditionals/conditionalUtils'
import {
  dynamicStatConversion,
  gpuDynamicStatConversion,
} from 'lib/conditionals/evaluation/statConversion'
import {
  ConditionalActivation,
  ConditionalType,
  CURRENT_DATA_VERSION,
  Stats,
} from 'lib/constants/constants'
import { wgslTrue } from 'lib/gpu/injection/wgslUtils'
import { Source } from 'lib/optimization/buffSource'
import {
  ComputedStatsArray,
  Key,
} from 'lib/optimization/computedStatsArray'
import { CERYDRA } from 'lib/simulations/tests/testMetadataConstants'
import { TsUtils } from 'lib/utils/TsUtils'
import { Eidolon } from 'types/character'
import { CharacterConditionalsController } from 'types/conditionals'
import {
  OptimizerAction,
  OptimizerContext,
} from 'types/optimizer'

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
    initializeConfigurations: (x: ComputedStatsArray) => {
    },
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      x.CR.buff((r.crBuff) ? 1.00 : 0, SOURCE_TRACE)
      x.SPD.buff(r.spdBuff ? 20 : 0, SOURCE_TRACE)

      x.ELEMENTAL_DMG.buff((e >= 2 && r.e2DmgBoost) ? 1.60 : 0, SOURCE_E2)
      x.RES_PEN.buff((e >= 6 && r.e6Buffs) ? 0.20 : 0, SOURCE_E6)

      x.BASIC_ATK_SCALING.buff(basicScaling, SOURCE_BASIC)
      x.ULT_ATK_SCALING.buff(ultScaling, SOURCE_ULT)
      x.ULT_ATK_SCALING.buff((e >= 4 && r.e4UltDmg) ? 2.40 : 0, SOURCE_E4)

      x.BASIC_TOUGHNESS_DMG.buff(10, SOURCE_BASIC)
      x.ULT_TOUGHNESS_DMG.buff(20, SOURCE_ULT)
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>
    },
    precomputeTeammateEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext, originalCharacterAction?: OptimizerAction) => {
      const t = action.characterConditionals as Conditionals<typeof teammateContent>

      x.SPD.buffSingle(t.spdBuff && t.militaryMerit ? 20 : 0, SOURCE_TRACE)

      x.SKILL_CD_BOOST.buffSingle((t.militaryMerit && t.peerage) ? skillCdScaling : 0, SOURCE_SKILL)

      x.SKILL_RES_PEN.buffSingle((t.militaryMerit && t.peerage) ? skillResPenScaling : 0, SOURCE_SKILL)

      const atkBuff = talentAtkScaling * t.teammateATKValue

      x.ATK.buffSingle((t.militaryMerit) ? atkBuff : 0, SOURCE_TALENT)
      x.UNCONVERTIBLE_ATK_BUFF.buffSingle((t.militaryMerit) ? atkBuff : 0, SOURCE_TALENT)

      x.DEF_PEN.buffSingle((e >= 1 && t.e1DefPen && t.militaryMerit) ? 0.16 : 0, SOURCE_E1)
      x.SKILL_DEF_PEN.buffSingle((e >= 1 && t.e1DefPen && t.peerage) ? 0.20 : 0, SOURCE_E1)

      x.ELEMENTAL_DMG.buffSingle((e >= 2 && t.e2DmgBoost && t.militaryMerit) ? 0.40 : 0, SOURCE_E2)
      x.RES_PEN.buffSingle((e >= 6 && t.e6Buffs && t.militaryMerit) ? 0.20 : 0, SOURCE_E6)

      if (cyreneTeammateSpecialEffectActive(originalCharacterAction!)) {
        const cdBuff = cyreneSpecialEffectEidolonUpgraded(originalCharacterAction!) ? 0.33 : 0.30
        x.CD.buffSingle(cdBuff, SOURCE_MEMO)
      }
    },
    finalizeCalculations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
    },
    gpuFinalizeCalculations: () => '',
    dynamicConditionals: [
      {
        id: 'CerydraConversionConditional',
        type: ConditionalType.ABILITY,
        activation: ConditionalActivation.CONTINUOUS,
        dependsOn: [Stats.ATK],
        chainsTo: [Stats.CD],
        condition: function(x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals as Conditionals<typeof content>

          return r.atkToCd && x.a[Key.ATK] > 2000
        },
        effect: function(x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) {
          dynamicStatConversion(
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

          return gpuDynamicStatConversion(
            Stats.ATK,
            Stats.CD,
            this,
            action,
            context,
            `min(3.60, 0.18 * floor((convertibleValue - 2000) / 100))`,
            `${wgslTrue(r.atkToCd)} && x.ATK > 2000`,
          )
        },
      },
    ],
  }
}

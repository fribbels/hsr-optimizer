import i18next from 'i18next'
import {
  AbilityType,
  FUA_DMG_TYPE,
  SKILL_DMG_TYPE,
} from 'lib/conditionals/conditionalConstants'
import {
  AbilityEidolon,
  Conditionals,
  ContentDefinition,
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
import {
  CERYDRA,
  PHAINON,
} from 'lib/simulations/tests/testMetadataConstants'
import { TsUtils } from 'lib/utils/TsUtils'
import { Eidolon } from 'types/character'
import { CharacterConditionalsController } from 'types/conditionals'
import {
  OptimizerAction,
  OptimizerContext,
} from 'types/optimizer'

export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  // const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Cerydra.Content')
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
  } = Source.character(CERYDRA)

  const basicScaling = basic(e, 1.00, 1.10)
  const skillCdScaling = skill(e, 0.72, 0.792)
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
    nobility: true,
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
      text: 'SPD buff',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
    },
    crBuff: {
      id: 'crBuff',
      formItem: 'switch',
      text: 'CR buff',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
    },
    atkToCd: {
      id: 'atkToCd',
      formItem: 'switch',
      text: 'ATK to CD',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
    },
    e2DmgBoost: {
      id: 'e2DmgBoost',
      formItem: 'switch',
      text: 'E2 DMG boost',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
      disabled: e < 2,
    },
    e4UltDmg: {
      id: 'e4UltDmg',
      formItem: 'switch',
      text: 'E4 Ult DMG',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
      disabled: e < 4,
    },
    e6Buffs: {
      id: 'e6Buffs',
      formItem: 'switch',
      text: 'E6 buffs',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
      disabled: e < 6,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    militaryMerit: {
      id: 'militaryMerit',
      formItem: 'switch',
      text: 'Military Merit',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
    },
    nobility: {
      id: 'nobility',
      formItem: 'switch',
      text: 'Nobility',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
    },
    teammateATKValue: {
      id: 'teammateATKValue',
      formItem: 'slider',
      text: `Cerydra's combat ATK`,
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
      min: 0,
      max: 10000,
    },
    spdBuff: content.spdBuff,
    e1DefPen: {
      id: 'e1DefPen',
      formItem: 'switch',
      text: 'E1 DEF PEN',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
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
    precomputeTeammateEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const t = action.characterConditionals as Conditionals<typeof teammateContent>

      x.SPD.buffSingle(t.spdBuff && t.militaryMerit ? 20 : 0, SOURCE_TRACE)

      x.SKILL_CD_BOOST.buffSingle((t.militaryMerit && t.nobility) ? skillCdScaling : 0, SOURCE_SKILL)

      x.SKILL_RES_PEN.buffSingle((t.militaryMerit && t.nobility && context.characterId == PHAINON) ? 0.10 : 0, SOURCE_SKILL)

      const atkBuff = talentAtkScaling * t.teammateATKValue

      x.ATK.buffSingle((t.militaryMerit) ? atkBuff : 0, SOURCE_TALENT)
      x.UNCONVERTIBLE_ATK_BUFF.buffSingle((t.militaryMerit) ? atkBuff : 0, SOURCE_TALENT)

      x.DEF_PEN.buffSingle((e >= 1 && t.e1DefPen && t.militaryMerit) ? 0.16 : 0, SOURCE_E1)
      x.SKILL_DEF_PEN.buffSingle((e >= 1 && t.e1DefPen && t.nobility) ? 0.20 : 0, SOURCE_E1)

      x.ELEMENTAL_DMG.buffSingle((e >= 2 && t.e2DmgBoost && t.militaryMerit) ? 0.40 : 0, SOURCE_E2)
      x.RES_PEN.buffSingle((e >= 6 && t.e6Buffs && t.militaryMerit) ? 0.20 : 0, SOURCE_E6)
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

import i18next from 'i18next'
import {
  AbilityType,
  ASHBLAZING_ATK_STACK,
  NONE_TYPE,
  SKILL_DMG_TYPE,
  ULT_DMG_TYPE,
} from 'lib/conditionals/conditionalConstants'
import {
  AbilityEidolon,
  Conditionals,
  ContentDefinition,
} from 'lib/conditionals/conditionalUtils'
import { CURRENT_DATA_VERSION } from 'lib/constants/constants'
import { Source } from 'lib/optimization/buffSource'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'

import {
  boostAshblazingAtkP,
  gpuBoostAshblazingAtkP,
  gpuStandardAtkShieldFinalizer,
  standardAtkShieldFinalizer,
} from 'lib/conditionals/conditionalFinalizers'
import { TsUtils } from 'lib/utils/TsUtils'
import { Eidolon } from 'types/character'
import { NumberToNumberMap } from 'types/common'
import { CharacterConditionalsController } from 'types/conditionals'
import {
  OptimizerAction,
  OptimizerContext,
} from 'types/optimizer'

export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  // const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.PermansorTerrae.Content')
  // const tBuff = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Common.BuffPriority')
  const tShield = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Common.ShieldAbility')
  const { basic, skill, ult, talent } = AbilityEidolon.ULT_BASIC_3_SKILL_TALENT_5
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
  } = Source.character('1414')

  const basicScaling = basic(e, 1.00, 1.10)

  const ultScaling = ult(e, 3.00, 3.30)

  const fuaScaling = ult(e, 0.80, 0.88)

  const talentShieldScaling = talent(e, 0.10, 0.106)
  const talentShieldFlat = talent(e, 160, 178)

  const defaults = {
    shieldAbility: ULT_DMG_TYPE,
  }

  const teammateDefaults = {
    bondmate: true,
    sourceAtk: 3000,
    e1ResPen: true,
    e4DmgReduction: true,
    e6Buffs: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    shieldAbility: {
      id: 'shieldAbility',
      formItem: 'select',
      text: tShield('Text'),
      content: tShield('Content'),
      options: [
        { display: tShield('Skill'), value: SKILL_DMG_TYPE, label: tShield('Skill') },
        { display: tShield('Ult'), value: ULT_DMG_TYPE, label: tShield('Ult') },
        { display: tShield('Trace'), value: NONE_TYPE, label: tShield('Trace') },
      ],
      fullWidth: true,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    bondmate: {
      id: 'bondmate',
      formItem: 'switch',
      text: 'Bondmate',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
    },
    sourceAtk: {
      id: 'sourceAtk',
      formItem: 'slider',
      text: `Dan Heng's combat ATK`,
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
      min: 0,
      max: 10000,
    },
    e1ResPen: {
      id: 'e1ResPen',
      formItem: 'switch',
      text: 'E1 RES PEN',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
      disabled: e < 1,
    },
    e4DmgReduction: {
      id: 'e4DmgReduction',
      formItem: 'switch',
      text: 'E4 DMG reduction',
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

  const hitMultiByTargets: NumberToNumberMap = {
    1: ASHBLAZING_ATK_STACK * (1 * 0.25 + 2 * 0.25 + 3 * 0.25 + 4 * 0.25),
    3: ASHBLAZING_ATK_STACK * (2 * 0.25 + 5 * 0.25 + 8 * 0.25 + 8 * 0.25),
    5: ASHBLAZING_ATK_STACK * (3 * 0.25 + 8 * 0.25 + 8 * 0.25 + 8 * 0.25),
  }

  return {
    activeAbilities: [AbilityType.BASIC, AbilityType.ULT, AbilityType.FUA],
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    initializeConfigurations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      x.SUMMONS.set(1, SOURCE_TALENT)
    },
    initializeTeammateConfigurations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const t = action.characterConditionals as Conditionals<typeof teammateContent>

      x.SUMMONS.buff((t.bondmate) ? 1 : 0, SOURCE_SKILL)
    },
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      x.BASIC_ATK_SCALING.buff(basicScaling, SOURCE_BASIC)
      x.ULT_ATK_SCALING.buff(ultScaling, SOURCE_ULT)
      x.FUA_ATK_SCALING.buff(fuaScaling, SOURCE_ULT)

      if (r.shieldAbility == ULT_DMG_TYPE) {
        x.SHIELD_SCALING.buff(talentShieldScaling * 2, SOURCE_ULT)
        x.SHIELD_FLAT.buff(talentShieldFlat * 2, SOURCE_ULT)
      }
      if (r.shieldAbility == SKILL_DMG_TYPE) {
        x.SHIELD_SCALING.buff(talentShieldScaling * 2, SOURCE_SKILL)
        x.SHIELD_FLAT.buff(talentShieldFlat * 2, SOURCE_SKILL)
      }
      if (r.shieldAbility == NONE_TYPE) {
        x.SHIELD_SCALING.buff(talentShieldScaling, SOURCE_TALENT)
        x.SHIELD_FLAT.buff(talentShieldFlat, SOURCE_TALENT)
      }

      x.BASIC_TOUGHNESS_DMG.buff(10, SOURCE_BASIC)
      x.ULT_TOUGHNESS_DMG.buff(20, SOURCE_ULT)
    },
    precomputeTeammateEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const t = action.characterConditionals as Conditionals<typeof teammateContent>

      const atkBuff = t.sourceAtk * 0.15
      x.ATK.buff((t.bondmate) ? atkBuff : 0, SOURCE_TRACE)
      x.UNCONVERTIBLE_ATK_BUFF.buff((t.bondmate) ? atkBuff : 0, SOURCE_TRACE)

      x.RES_PEN.buff((e >= 1 && t.bondmate && t.e1ResPen) ? 0.18 : 0, SOURCE_E1)
      x.DMG_RED_MULTI.multiply((e >= 4 && t.bondmate && t.e4DmgReduction) ? 1 - 0.20 : 0, SOURCE_E4)
      x.VULNERABILITY.buff((e >= 6 && t.e6Buffs) ? 0.20 : 0, SOURCE_E6)
      x.DEF_PEN.buff((e >= 6 && t.e6Buffs) ? 0.12 : 0, SOURCE_E6)
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>
    },
    finalizeCalculations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      boostAshblazingAtkP(x, action, context, hitMultiByTargets[context.enemyCount])
      standardAtkShieldFinalizer(x)
    },
    gpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) =>
      gpuBoostAshblazingAtkP(hitMultiByTargets[context.enemyCount]) + gpuStandardAtkShieldFinalizer(),
  }
}

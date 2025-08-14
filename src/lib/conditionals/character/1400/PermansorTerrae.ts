import i18next from 'i18next'
import {
  AbilityType,
} from 'lib/conditionals/conditionalConstants'
import {
  AbilityEidolon,
  Conditionals,
  ContentDefinition,
} from 'lib/conditionals/conditionalUtils'
import { CURRENT_DATA_VERSION } from 'lib/constants/constants'
import { Source } from 'lib/optimization/buffSource'
import {
  ComputedStatsArray,
} from 'lib/optimization/computedStatsArray'

import {
  gpuBoostAshblazingAtkP,
  gpuStandardAtkShieldFinalizer,
  gpuStandardDefShieldFinalizer,
  standardAtkShieldFinalizer,
  standardDefShieldFinalizer,
} from 'lib/conditionals/conditionalFinalizers'
import { Eidolon } from 'types/character'
import { CharacterConditionalsController } from 'types/conditionals'
import {
  OptimizerAction,
  OptimizerContext,
} from 'types/optimizer'

export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  // const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.PermansorTerrae.Content')
  // const tBuff = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Common.BuffPriority')
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

  const skillShieldScaling = skill(e, 0.30, 0.32)
  const skillShieldFlat = skill(e, 400, 445)

  const ultScaling = ult(e, 3.00, 3.30)
  const ultEnhancedScaling = ult(e, 0.80, 0.88)

  const talentShieldScaling = talent(e, 0.15, 0.16)
  const talentShieldFlat = talent(e, 200, 223)

  const defaults = {}

  const teammateDefaults = {
    bondmate: true,
    sourceAtk: 3000,
    e1ResPen: true,
    e4DefPen: true,
    e6Vulnerability: true,
  }

  const content: ContentDefinition<typeof defaults> = {}

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
    e4DefPen: {
      id: 'e4DefPen',
      formItem: 'switch',
      text: 'E4 DEF PEN',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
      disabled: e < 4,
    },
    e6Vulnerability: {
      id: 'e6Vulnerability',
      formItem: 'switch',
      text: 'E6 Vulnerability',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
      disabled: e < 6,
    },
  }

  return {
    activeAbilities: [AbilityType.BASIC, AbilityType.ULT],
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    initializeConfigurations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      x.SUMMONS.set(1, SOURCE_TALENT)
    },
    initializeTeammateConfigurations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const t = action.characterConditionals as Conditionals<typeof content>

      x.SUMMONS.buff((t.bondmate) ? 1 : 0, SOURCE_SKILL)
    },
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      x.BASIC_ATK_SCALING.buff(basicScaling, SOURCE_BASIC)
      x.ULT_ATK_SCALING.buff(ultScaling, SOURCE_ULT)

      x.SHIELD_SCALING.buff(talentShieldScaling, SOURCE_TALENT)
      x.SHIELD_FLAT.buff(talentShieldFlat, SOURCE_TALENT)

      x.BASIC_TOUGHNESS_DMG.buff(10, SOURCE_BASIC)
      x.ULT_TOUGHNESS_DMG.buff(20, SOURCE_ULT)
    },
    precomputeTeammateEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const t = action.characterConditionals as Conditionals<typeof teammateContent>

      const atkBuff = t.sourceAtk * 0.15
      x.ATK.buff((t.bondmate) ? atkBuff : 0, SOURCE_TRACE)
      x.UNCONVERTIBLE_ATK_BUFF.buff((t.bondmate) ? atkBuff : 0, SOURCE_TRACE)

      x.RES_PEN.buff((e >= 1 && t.bondmate && t.e1ResPen) ? 0.15 : 0, SOURCE_E1)
      x.DEF_PEN.buff((e >= 4 && t.bondmate && t.e4DefPen) ? 0.12 : 0, SOURCE_E4)
      x.VULNERABILITY.buff((e >= 6 && t.e6Vulnerability) ? 0.20 : 0, SOURCE_E6)
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>
    },
    finalizeCalculations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      standardAtkShieldFinalizer(x)
    },
    gpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => gpuStandardAtkShieldFinalizer(),
  }
}

import i18next from 'i18next'
import { AbilityType } from 'lib/conditionals/conditionalConstants'
import { AbilityEidolon, Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { CURRENT_DATA_VERSION } from 'lib/constants/constants'
import { Source } from 'lib/optimization/buffSource'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import { Eidolon } from 'types/character'
import { CharacterConditionalsController } from 'types/conditionals'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

export default (e: Eidolon): CharacterConditionalsController => {
  // const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Phainon.Content')
  const { basic, skill, talent, ult } = AbilityEidolon.ULT_BASIC_3_SKILL_TALENT_5
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
  } = Source.character('1014')

  const basicScaling = basic(e, 1.00, 1.10)
  const basicEnhancedScaling = basic(e, 1.50, 1.65)
  const basicEnhancedExtraScaling = basic(e, 2.20, 2.42)

  const skillScaling = skill(e, 1.50, 1.65)
  const skillStackScaling = skill(e, 0.14, 0.154)

  const ultScaling = ult(e, 2.80, 3.08)
  const ultBounceScaling = ult(e, 1.10, 1.21)

  const talentDmgBuffScaling = talent(e, 0.60, 0.66)

  const defaults = {
    enhancedBasic: true,
    enhancedSkill: true,
    coreResonanceCdBuff: true,
    coreResonanceStacks: 12,
    talentDmgBuff: true,
    crBuff: true,
    cdBuff: true,
    e1DmgBuff: true,
    e2Buffs: true,
    e4ResPen: true,
    e6ResPen: true,
  }

  const teammateDefaults = {
  }

  const content: ContentDefinition<typeof defaults> = {
    enhancedBasic: {
      id: 'enhancedBasic',
      formItem: 'switch',
      text: 'Enhanced Basic',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
    },
    enhancedSkill: {
      id: 'enhancedSkill',
      formItem: 'switch',
      text: 'Enhanced Skill',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
    },
    talentDmgBuff: {
      id: 'talentDmgBuff',
      formItem: 'switch',
      text: 'Talent DMG buff',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
    },
    coreResonanceCdBuff: {
      id: 'coreResonanceCdBuff',
      formItem: 'switch',
      text: 'Core Resonance CD buff',
      content: i18next.t('BetaMessage', {ns: 'conditionals', Version: CURRENT_DATA_VERSION}),
    },
    coreResonanceStacks: {
      id: 'coreResonanceStacks',
      formItem: 'slider',
      text: 'Core Resonance stacks',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
      min: 0,
      max: 45,
    },
    crBuff: {
      id: 'crBuff',
      formItem: 'switch',
      text: 'CR buff',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
    },
    cdBuff: {
      id: 'cdBuff',
      formItem: 'switch',
      text: 'CD buff',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
    },
    e1DmgBuff: {
      id: 'e1DmgBuff',
      formItem: 'switch',
      text: 'E1 DMG buff',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
      disabled: e < 1,
    },
    e2Buffs: {
      id: 'e2Buffs',
      formItem: 'switch',
      text: 'E2 buffs',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
      disabled: e < 2,
    },
    e4ResPen: {
      id: 'e4ResPen',
      formItem: 'switch',
      text: 'E2 RES PEN',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
      disabled: e < 4,
    },
    e6ResPen: {
      id: 'e6ResPen',
      formItem: 'switch',
      text: 'E6 RES PEN',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
      disabled: e < 6,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
  }

  return {
    activeAbilities: [AbilityType.BASIC, AbilityType.SKILL, AbilityType.ULT],
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    initializeConfigurations: () => {
      // x.FUA_DMG_TYPE.set(SKILL_DMG_TYPE | FUA_DMG_TYPE, SOURCE_SKILL)
    },
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      x.CD.buff(r.cdBuff ? 0.50 : 0, SOURCE_TRACE)
      x.CR.buff(r.crBuff ? 0.20 : 0, SOURCE_TRACE)
      x.CD.buff(r.coreResonanceCdBuff ? 0.04 * 8 : 0, SOURCE_TRACE)
      x.ELEMENTAL_DMG.buff(r.talentDmgBuff ? talentDmgBuffScaling : 0, SOURCE_TALENT)

      x.ELEMENTAL_DMG.buff((e >= 1 && r.e1DmgBuff) ? 0.60 : 0, SOURCE_E1)

      x.DEF_PEN.buff((e >= 2 && r.e2Buffs) ? 0.01 * 15 : 0, SOURCE_E2)
      x.SKILL_ATK_SCALING.buff((e >= 2 && r.e2Buffs) ? 0.07 * r.coreResonanceStacks : 0, SOURCE_E2)

      x.WIND_RES_PEN.buff((e >= 4 && r.e4ResPen) ? 0.08 + 0.04 * 3 : 0, SOURCE_E4)

      x.ULT_RES_PEN.buff((e >= 6 && r.e6ResPen) ? 0.20 : 0, SOURCE_E6)

      x.BASIC_ATK_SCALING.buff(r.enhancedBasic ? basicEnhancedScaling : basicScaling, SOURCE_BASIC)
      if (context.enemyCount == 1) {
        x.BASIC_ATK_SCALING.buff(r.enhancedBasic ? basicEnhancedExtraScaling : 0, SOURCE_BASIC)
      }

      x.SKILL_ATK_SCALING.buff(skillScaling, SOURCE_SKILL)
      x.SKILL_ATK_SCALING.buff(r.enhancedSkill ? r.coreResonanceStacks * skillStackScaling : 0, SOURCE_SKILL)

      x.ULT_ATK_SCALING.buff(ultScaling, SOURCE_ULT)
      x.ULT_ATK_SCALING.buff(ultBounceScaling * 10 / context.enemyCount, SOURCE_ULT)

      x.BASIC_TOUGHNESS_DMG.buff(r.enhancedBasic ? 20 : 10, SOURCE_BASIC)
      x.SKILL_TOUGHNESS_DMG.buff(20, SOURCE_SKILL)
      x.ULT_TOUGHNESS_DMG.buff(40, SOURCE_ULT)
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction) => {
    },
    finalizeCalculations: () => {
    },
    gpuFinalizeCalculations: () => '',
  }
}

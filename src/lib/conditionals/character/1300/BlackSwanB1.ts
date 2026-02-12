import i18next from 'i18next'
import {
  AbilityType,
  DOT_DMG_TYPE,
} from 'lib/conditionals/conditionalConstants'
import {
  AbilityEidolon,
  Conditionals,
  ContentDefinition,
} from 'lib/conditionals/conditionalUtils'
import { wgslTrue } from 'lib/gpu/injection/wgslUtils'
import { Source } from 'lib/optimization/buffSource'
import { buffAbilityDefPen } from 'lib/optimization/calculateBuffs'
import {
  ComputedStatsArray,
  Key,
} from 'lib/optimization/computedStatsArray'

import { Eidolon } from 'types/character'

import { CURRENT_DATA_VERSION } from 'lib/constants/constants'

import { CharacterConditionalsController } from 'types/conditionals'
import {
  OptimizerAction,
  OptimizerContext,
} from 'types/optimizer'

export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  // const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.BlackSwan')
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
  } = Source.character('1307b1')

  const arcanaStackMultiplier = talent(e, 0.12, 0.132)
  const epiphanyDmgTakenBoost = ult(e, 0.25, 0.27)
  const skillDefShredValue = skill(e, 0.208, 0.22)

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 0.90, 0.99)
  const ultScaling = ult(e, 1.20, 1.296)
  const dotScaling = talent(e, 2.40, 2.64)

  const dotChance = talent(e, 0.65, 0.68)

  const defaults = {
    skillDefShred: true,
    epiphanyDebuff: true,
    arcanaStacks: e >= 6 ? 80 : 50,
    ehrToDmgBoost: true,
    e1ResReduction: true,
    e4Vulnerability: true,
  }
  const teammateDefaults = {
    skillDefShred: true,
    epiphanyDebuff: true,
    ehrToDmgBoost: true,
    combatEhr: 120,
    e1ResReduction: true,
    e4Vulnerability: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    skillDefShred: {
      id: 'skillDefShred',
      formItem: 'switch',
      text: 'Skill def shred',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
    },
    epiphanyDebuff: {
      id: 'epiphanyDebuff',
      formItem: 'switch',
      text: 'Epiphany Debuff',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
    },
    arcanaStacks: {
      id: 'arcanaStacks',
      formItem: 'slider',
      text: 'Arcana stacks',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
      min: 1,
      max: 100,
    },
    ehrToDmgBoost: {
      id: 'ehrToDmgBoost',
      formItem: 'switch',
      text: 'EHR to DMG Boost',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
    },
    e1ResReduction: {
      id: 'e1ResReduction',
      formItem: 'switch',
      text: 'E1 Res reduction',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
      disabled: e < 1,
    },
    e4Vulnerability: {
      id: 'e4Vulnerability',
      formItem: 'switch',
      text: 'E4 Vulnerability',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
      disabled: e < 4,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    skillDefShred: content.skillDefShred,
    epiphanyDebuff: content.epiphanyDebuff,
    ehrToDmgBoost: content.ehrToDmgBoost,
    combatEhr: {
      id: 'combatEhr',
      formItem: 'slider',
      text: 'Black Swan\'s combat EHR',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
      min: 0,
      max: 120,
    },
    e1ResReduction: content.e1ResReduction,
    e4Vulnerability: content.e4Vulnerability,
  }

  return {
    activeAbilities: [AbilityType.BASIC, AbilityType.SKILL, AbilityType.ULT, AbilityType.DOT],
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      x.BASIC_ATK_SCALING.buff(basicScaling, SOURCE_BASIC)
      x.SKILL_ATK_SCALING.buff(skillScaling, SOURCE_SKILL)
      x.ULT_ATK_SCALING.buff(ultScaling, SOURCE_ULT)
      x.DOT_ATK_SCALING.buff(dotScaling + arcanaStackMultiplier * r.arcanaStacks, SOURCE_TALENT)

      buffAbilityDefPen(x, DOT_DMG_TYPE, 0.20, SOURCE_TALENT)

      x.BASIC_TOUGHNESS_DMG.buff(10, SOURCE_BASIC)
      x.SKILL_TOUGHNESS_DMG.buff(20, SOURCE_SKILL)
      x.ULT_TOUGHNESS_DMG.buff(20, SOURCE_ULT)

      x.DOT_CHANCE.set(dotChance, SOURCE_TALENT)
      x.DOT_SPLIT.set(0.05, SOURCE_TALENT)
      x.DOT_STACKS.set(r.arcanaStacks, SOURCE_TALENT)
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      x.DEF_PEN.buffTeam((m.skillDefShred) ? skillDefShredValue : 0, SOURCE_SKILL)
      x.WIND_RES_PEN.buffTeam((e >= 1 && m.e1ResReduction) ? 0.25 : 0, SOURCE_E1)
      x.FIRE_RES_PEN.buffTeam((e >= 1 && m.e1ResReduction) ? 0.25 : 0, SOURCE_E1)
      x.PHYSICAL_RES_PEN.buffTeam((e >= 1 && m.e1ResReduction) ? 0.25 : 0, SOURCE_E1)
      x.LIGHTNING_RES_PEN.buffTeam((e >= 1 && m.e1ResReduction) ? 0.25 : 0, SOURCE_E1)

      x.VULNERABILITY.buffTeam((m.epiphanyDebuff) ? epiphanyDmgTakenBoost : 0, SOURCE_ULT)

      x.VULNERABILITY.buffTeam((e >= 4 && m.epiphanyDebuff && m.e4Vulnerability) ? 0.20 : 0, SOURCE_E4)
    },
    precomputeTeammateEffects: (x, action, context) => {
      const t = action.characterConditionals as Conditionals<typeof teammateContent>

      x.ELEMENTAL_DMG.buff(t.ehrToDmgBoost ? Math.min(0.72, 0.60 * t.combatEhr) : 0, SOURCE_TRACE)
    },
    finalizeCalculations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      x.ELEMENTAL_DMG.buff((r.ehrToDmgBoost) ? Math.min(0.72, 0.60 * x.a[Key.EHR]) : 0, SOURCE_TRACE)
    },
    gpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      return `
if (${wgslTrue(r.ehrToDmgBoost)}) {
  x.ELEMENTAL_DMG += min(0.72, 0.60 * x.EHR);
}
`
    },
  }
}

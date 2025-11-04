import {
  AbilityType,
  ASHBLAZING_ATK_STACK,
  BREAK_DMG_TYPE,
  FUA_DMG_TYPE,
} from 'lib/conditionals/conditionalConstants'
import {
  AbilityEidolon,
  Conditionals,
  ContentDefinition,
} from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import {
  buffAbilityCd,
  buffAbilityDmg,
  Target,
} from 'lib/optimization/calculateBuffs'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'

import i18next from 'i18next'
import {
  boostAshblazingAtkP,
  gpuBoostAshblazingAtkP,
  gpuStandardAdditionalDmgAtkFinalizer,
  standardAdditionalDmgAtkFinalizer,
} from 'lib/conditionals/conditionalFinalizers'
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
import { THE_DAHLIA } from 'lib/simulations/tests/testMetadataConstants'
import { Eidolon } from 'types/character'
import { CharacterConditionalsController } from 'types/conditionals'
import {
  OptimizerAction,
  OptimizerContext,
} from 'types/optimizer'

export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  // const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.TheDahlia')
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
  } = Source.character(THE_DAHLIA)

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 1.60, 1.76)
  const ultScaling = ult(e, 3.00, 3.24)

  const fuaScaling = talent(e, 0.30, 0.33)
  const fuaSuperBreakScaling = talent(e, 2.00, 2.20)

  const ultDefPenValue = ult(e, 0.18, 0.20)

  const superBreakScaling = talent(e, 0.60, 0.66)

  const defaults = {
    zoneActive: true,
    ultDefPen: true,
    dancePartner: false,
    spdBuff: true,
    e1Buffs: true,
    e2ResPen: true,
    e4Vuln: true,
    e6BeBuff: true,
  }

  const teammateDefaults = {
    zoneActive: true,
    ultDefPen: true,
    dancePartner: true,
    beConversion: true,
    teammateBeValue: 3.00,
    spdBuff: true,
    e1Buffs: true,
    e2ResPen: true,
    e4Vuln: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    zoneActive: {
      id: 'zoneActive',
      formItem: 'switch',
      text: 'Zone active',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
    },
    ultDefPen: {
      id: 'ultDefPen',
      formItem: 'switch',
      text: 'Ult DEF PEN',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
    },
    dancePartner: {
      id: 'dancePartner',
      formItem: 'switch',
      text: 'Dance Partner',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
    },
    spdBuff: {
      id: 'spdBuff',
      formItem: 'switch',
      text: 'SPD buff',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
    },
    e1Buffs: {
      id: 'e1Buffs',
      formItem: 'switch',
      text: 'E1 buffs',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
      disabled: e < 6,
    },
    e2ResPen: {
      id: 'e2ResPen',
      formItem: 'switch',
      text: 'E2 RES PEN',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
      disabled: e < 2,
    },
    e4Vuln: {
      id: 'e4Vuln',
      formItem: 'switch',
      text: 'E4 Vulnerability',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
      disabled: e < 4,
    },
    e6BeBuff: {
      id: 'e6BeBuff',
      formItem: 'switch',
      text: 'E6 BE buff',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
      disabled: e < 6,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    zoneActive: content.zoneActive,
    ultDefPen: content.ultDefPen,
    dancePartner: content.dancePartner,
    beConversion: {
      id: 'beConversion',
      formItem: 'switch',
      text: 'Break Effect conversion',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
    },
    teammateBeValue: {
      id: 'teammateBeValue',
      formItem: 'slider',
      text: `The Dahlia's Combat BE`,
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
      min: 0,
      max: 7.50,
    },
    spdBuff: content.spdBuff,
    e1Buffs: content.e1Buffs,
    e2ResPen: content.e2ResPen,
    e4Vuln: content.e4Vuln,
  }

  const fuaHits = e >= 4 ? 10 : 5

  const hitMulti = ASHBLAZING_ATK_STACK
    * (1 * 1)

  return {
    activeAbilities: [AbilityType.BASIC, AbilityType.ULT],
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    initializeConfigurations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // if (r.superBreakDmg) {
      //   x.ENEMY_WEAKNESS_BROKEN.config(1, SOURCE_TALENT)
      // }
    },
    initializeTeammateConfigurations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>
      // if (r.superBreakDmg) {
      //   x.ENEMY_WEAKNESS_BROKEN.config(1, SOURCE_TALENT)
      // }
    },
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      x.BASIC_ATK_SCALING.buff(basicScaling, SOURCE_BASIC)
      x.SKILL_ATK_SCALING.buff(skillScaling, SOURCE_SKILL)
      x.ULT_ATK_SCALING.buff(ultScaling, SOURCE_ULT)
      x.FUA_ATK_SCALING.buff(fuaScaling * fuaHits / context.enemyCount, SOURCE_TALENT)

      // If broken
      x.FUA_SUPER_BREAK_MODIFIER.buff(fuaSuperBreakScaling, SOURCE_TALENT)

      x.BE.buff((e >= 6 && r.e6BeBuff) ? 1.50 : 0, SOURCE_E6)

      //  Toughness Reduction taken by enemy targets while notWeakness Broken can be converted into Super Break DMG.

      x.BASIC_TOUGHNESS_DMG.buff(10, SOURCE_BASIC)
      x.SKILL_TOUGHNESS_DMG.buff(10, SOURCE_SKILL)
      x.ULT_TOUGHNESS_DMG.buff(30, SOURCE_ULT)
      x.FUA_TOUGHNESS_DMG.buff(3 * fuaHits / context.enemyCount, SOURCE_TALENT)
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      x.BREAK_EFFICIENCY_BOOST.buffTeam((m.zoneActive) ? 0.50 : 0, SOURCE_ULT)
      x.DEF_PEN.buffTeam((m.ultDefPen) ? ultDefPenValue : 0, SOURCE_ULT)

      if (e >= 1 && m.e1Buffs) {
        x.SUPER_BREAK_MODIFIER.buffTeam(superBreakScaling, SOURCE_TALENT)
        x.SUPER_BREAK_MODIFIER.buff((m.dancePartner) ? 0.40 : 0, SOURCE_E1)
      } else {
        x.SUPER_BREAK_MODIFIER.buff((m.dancePartner) ? superBreakScaling : 0, SOURCE_TALENT)
      }

      // After "Dance Partner" uses an attack, deals an additional fixed amount of Toughness Reduction equal to 25% of the enemy target's Max Toughness (minimum of 10 points, up to 300 points).

      x.SPD_P.buff((m.spdBuff) ? 0.30 : 0, SOURCE_TALENT)

      x.RES_PEN.buffTeam((e >= 2 && m.e2ResPen) ? 0.18 : 0, SOURCE_E2)
      x.VULNERABILITY.buffTeam((e >= 4 && m.e4Vuln) ? 0.12 * fuaHits : 0, SOURCE_E4)
    },
    precomputeTeammateEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const t = action.characterConditionals as Conditionals<typeof teammateContent>

      const beBuff = (t.beConversion) ? t.teammateBeValue * 0.24 + 0.50 : 0
      x.BE.buffTeam(beBuff, SOURCE_TALENT)
      x.UNCONVERTIBLE_BE_BUFF.buffTeam(beBuff, SOURCE_TALENT)
    },
    finalizeCalculations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      boostAshblazingAtkP(x, action, context, hitMulti)
    },
    gpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => {
      return gpuBoostAshblazingAtkP(hitMulti)
    },
  }
}

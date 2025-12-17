import {
  AbilityType,
  ASHBLAZING_ATK_STACK,
} from 'lib/conditionals/conditionalConstants'
import {
  AbilityEidolon,
  Conditionals,
  ContentDefinition,
} from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import {
  ComputedStatsArray,
  Key,
} from 'lib/optimization/computedStatsArray'

import {
  boostAshblazingAtkP,
  gpuBoostAshblazingAtkP,
} from 'lib/conditionals/conditionalFinalizers'
import {
  ANAXA,
  BOOTHILL,
  FIREFLY,
  PHAINON,
  SILVER_WOLF,
  THE_DAHLIA,
} from 'lib/simulations/tests/testMetadataConstants'
import { TsUtils } from 'lib/utils/TsUtils'
import { Eidolon } from 'types/character'
import { NumberToNumberMap } from 'types/common'
import { CharacterConditionalsController } from 'types/conditionals'
import {
  OptimizerAction,
  OptimizerContext,
} from 'types/optimizer'

export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.TheDahlia')
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
    dancePartner: true,
    superBreakDmg: true,
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
    superBreakDmg: true,
    beConversion: true,
    teammateBeValue: 3.00,
    spdBuff: true,
    e1Buffs: true,
    e2ResPen: true,
    e4Vuln: true,
    e6BeBuff: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    zoneActive: {
      id: 'zoneActive',
      formItem: 'switch',
      text: t('Content.zoneActive.text'),
      content: t('Content.zoneActive.content'),
    },
    ultDefPen: {
      id: 'ultDefPen',
      formItem: 'switch',
      text: t('Content.ultDefPen.text'),
      content: t('Content.ultDefPen.content', { DefShred: TsUtils.precisionRound(100 * ultDefPenValue) }),
    },
    dancePartner: {
      id: 'dancePartner',
      formItem: 'switch',
      text: t('Content.dancePartner.text'),
      content: t('Content.dancePartner.content', { SBScaling: TsUtils.precisionRound(100 * superBreakScaling) }),
    },
    superBreakDmg: {
      id: 'superBreakDmg',
      formItem: 'switch',
      text: t('Content.superBreakDmg.text'),
      content: t('Content.superBreakDmg.content'),
    },
    spdBuff: {
      id: 'spdBuff',
      formItem: 'switch',
      text: t('Content.spdBuff.text'),
      content: t('Content.spdBuff.content'),
    },
    e1Buffs: {
      id: 'e1Buffs',
      formItem: 'switch',
      text: t('Content.e1Buffs.text'),
      content: t('Content.e1Buffs.content'),
      disabled: e < 1,
    },
    e2ResPen: {
      id: 'e2ResPen',
      formItem: 'switch',
      text: t('Content.e2ResPen.text'),
      content: t('Content.e2ResPen.content'),
      disabled: e < 2,
    },
    e4Vuln: {
      id: 'e4Vuln',
      formItem: 'switch',
      text: t('Content.e4Vuln.text'),
      content: t('Content.e4Vuln.content'),
      disabled: e < 4,
    },
    e6BeBuff: {
      id: 'e6BeBuff',
      formItem: 'switch',
      text: t('Content.e6BeBuff.text'),
      content: t('Content.e6BeBuff.content'),
      disabled: e < 6,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    zoneActive: content.zoneActive,
    ultDefPen: content.ultDefPen,
    dancePartner: content.dancePartner,
    superBreakDmg: content.superBreakDmg,
    beConversion: {
      id: 'beConversion',
      formItem: 'switch',
      text: t('TeammateContent.beConversion.text'),
      content: t('TeammateContent.beConversion.content'),
    },
    teammateBeValue: {
      id: 'teammateBeValue',
      formItem: 'slider',
      text: t('TeammateContent.teammateBeValue.text'),
      content: t('TeammateContent.teammateBeValue.content'),
      min: 0,
      max: 7.50,
      percent: true,
    },
    spdBuff: content.spdBuff,
    e1Buffs: content.e1Buffs,
    e2ResPen: content.e2ResPen,
    e4Vuln: content.e4Vuln,
    e6BeBuff: content.e6BeBuff,
  }

  const fuaHits = (e >= 4) ? 10 : 5

  const hitMultiByTargets: NumberToNumberMap = (e >= 4)
    ? {
      1: ASHBLAZING_ATK_STACK * (1 * 0.10 + 2 * 0.10 + 3 * 0.10 + 4 * 0.10 + 5 * 0.10 + 6 * 0.10 + 7 * 0.10 + 8 * 0.10 + 9 * 0.10 + 10 * 0.10),
      3: ASHBLAZING_ATK_STACK * (2 * (1 / 3) + 5 * (1 / 3) + 8 * (1 / 3)),
      5: ASHBLAZING_ATK_STACK * (3 * 0.50 + 8 * 0.50),
    }
    : {
      1: ASHBLAZING_ATK_STACK * (1 * 0.20 + 2 * 0.20 + 3 * 0.20 + 4 * 0.20 + 5 * 0.20),
      3: ASHBLAZING_ATK_STACK * (2 * 0.50 + 5 * 0.50),
      5: ASHBLAZING_ATK_STACK * (3 * 1.00),
    }

  return {
    activeAbilities: [AbilityType.BASIC, AbilityType.SKILL, AbilityType.ULT, AbilityType.FUA],
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    initializeConfigurations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      if (r.superBreakDmg) {
        x.ENEMY_WEAKNESS_BROKEN.config(1, SOURCE_TALENT)

        x.FUA_SUPER_BREAK_MODIFIER.buff(fuaSuperBreakScaling, SOURCE_TALENT)
      }
    },
    initializeTeammateConfigurations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      if (r.superBreakDmg) {
        x.ENEMY_WEAKNESS_BROKEN.config(1, SOURCE_TALENT)
      }
    },
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      x.BASIC_ATK_SCALING.buff(basicScaling, SOURCE_BASIC)
      x.SKILL_ATK_SCALING.buff(skillScaling, SOURCE_SKILL)
      x.ULT_ATK_SCALING.buff(ultScaling, SOURCE_ULT)
      x.FUA_ATK_SCALING.buff(fuaScaling * fuaHits / context.enemyCount, SOURCE_TALENT)

      x.SPD_P.buff((r.spdBuff) ? 0.30 : 0, SOURCE_TRACE)

      x.BASIC_TOUGHNESS_DMG.buff(10, SOURCE_BASIC)
      x.SKILL_TOUGHNESS_DMG.buff(10, SOURCE_SKILL)
      x.ULT_TOUGHNESS_DMG.buff(30, SOURCE_ULT)
      x.FUA_TOUGHNESS_DMG.buff(3 * fuaHits / context.enemyCount, SOURCE_TALENT)

      x.ULT_FIXED_TOUGHNESS_DMG.buff(20, SOURCE_TRACE)
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      x.BREAK_EFFICIENCY_BOOST.buffTeam((m.zoneActive) ? 0.50 : 0, SOURCE_SKILL)
      x.DEF_PEN.buffTeam((m.ultDefPen) ? ultDefPenValue : 0, SOURCE_ULT)

      if (m.superBreakDmg) {
        if (e >= 1 && m.e1Buffs) {
          x.SUPER_BREAK_MODIFIER.buffTeam(superBreakScaling, SOURCE_TALENT)
          x.SUPER_BREAK_MODIFIER.buff((m.dancePartner) ? 0.40 : 0, SOURCE_E1)
        } else {
          x.SUPER_BREAK_MODIFIER.buff((m.dancePartner) ? superBreakScaling : 0, SOURCE_TALENT)
        }
      }

      x.RES_PEN.buffTeam((e >= 2 && m.e2ResPen) ? 0.20 : 0, SOURCE_E2)
      x.VULNERABILITY.buffTeam((e >= 4 && m.e4Vuln) ? 0.12 : 0, SOURCE_E4)
      x.BE.buff((e >= 6 && m.e6BeBuff && m.dancePartner) ? 1.50 : 0, SOURCE_E6)

      if (e >= 1 && m.e1Buffs && m.dancePartner) {
        const e1ToughnessDmg = Math.max(10, Math.min(300, context.enemyMaxToughness / 30 * 0.25))
        if (x.a[Key.BASIC_TOUGHNESS_DMG] > 0) x.BASIC_FIXED_TOUGHNESS_DMG.buff(e1ToughnessDmg, SOURCE_E1)
        if (x.a[Key.SKILL_TOUGHNESS_DMG] > 0) x.SKILL_FIXED_TOUGHNESS_DMG.buff(e1ToughnessDmg, SOURCE_E1)
        if (x.a[Key.ULT_TOUGHNESS_DMG] > 0) x.ULT_FIXED_TOUGHNESS_DMG.buff(e1ToughnessDmg, SOURCE_E1)
        if (x.a[Key.FUA_TOUGHNESS_DMG] > 0) x.FUA_FIXED_TOUGHNESS_DMG.buff(e1ToughnessDmg, SOURCE_E1)
        if (x.a[Key.MEMO_SKILL_TOUGHNESS_DMG] > 0) x.MEMO_SKILL_FIXED_TOUGHNESS_DMG.buff(e1ToughnessDmg, SOURCE_E1)
        if (x.a[Key.MEMO_TALENT_TOUGHNESS_DMG] > 0) x.MEMO_TALENT_FIXED_TOUGHNESS_DMG.buff(e1ToughnessDmg, SOURCE_E1)
      }
    },
    precomputeTeammateEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const t = action.characterConditionals as Conditionals<typeof teammateContent>

      const IMPLANT_CHARACTERS = [
        FIREFLY,
        BOOTHILL,
        PHAINON,
        ANAXA,
        SILVER_WOLF,
      ]
      if (IMPLANT_CHARACTERS.includes(context.characterId)) {
        x.SPD_P.buff((t.spdBuff) ? 0.30 : 0, SOURCE_TRACE)
      }

      const beBuff = (t.beConversion) ? t.teammateBeValue * 0.24 + 0.50 : 0
      x.BE.buffTeam(beBuff, SOURCE_TRACE)
      x.UNCONVERTIBLE_BE_BUFF.buffTeam(beBuff, SOURCE_TRACE)
    },
    finalizeCalculations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      boostAshblazingAtkP(x, action, context, hitMultiByTargets[context.enemyCount])
    },
    gpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => {
      return gpuBoostAshblazingAtkP(hitMultiByTargets[context.enemyCount])
    },
  }
}

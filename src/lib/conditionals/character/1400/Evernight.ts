import {
  AbilityType,
  BUFF_PRIORITY_MEMO,
  BUFF_PRIORITY_SELF,
} from 'lib/conditionals/conditionalConstants'
import {
  AbilityEidolon,
  Conditionals,
  ContentDefinition,
  countTeamPath,
} from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import {
  ComputedStatsArray,
} from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'

import i18next from 'i18next'
import {
  CURRENT_DATA_VERSION,
  PathNames,
} from 'lib/constants/constants'
import { Eidolon } from 'types/character'
import { CharacterConditionalsController } from 'types/conditionals'
import {
  OptimizerAction,
  OptimizerContext,
} from 'types/optimizer'

export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  // const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Evernight.Content')
  const tBuff = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Common.BuffPriority')
  const { basic, skill, ult, talent, memoSkill, memoTalent } = AbilityEidolon.SKILL_BASIC_MEMO_TALENT_3_ULT_TALENT_MEMO_SKILL_5
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
  } = Source.character('1413')

  const basicScaling = basic(e, 0.50, 0.55)

  const skillCdScaling = skill(e, 0.40, 0.44)

  const ultMemoScaling = ult(e, 1.20, 1.32)
  const ultVulnScaling = ult(e, 0.20, 0.22)
  const ultDmgBoostScaling = ult(e, 1.00, 1.10)

  const talentCdScaling = talent(e, 0.60, 0.66)

  const memoSkillScaling = memoSkill(e, 0.20, 0.22)
  const memoSkillAdditionalScaling = memoSkill(e, 0.04, 0.044)
  const memoSkillEnhancedScaling = memoSkill(e, 0.05, 0.055)

  const memoTalentDmgBoost = memoTalent(e, 0.50, 0.55)

  const defaults = {
    buffPriority: BUFF_PRIORITY_MEMO,
    memospriteActive: true,
    crBuff: true,
    memoCdBuff: true,
    memoriaStacks: 16,
    enhancedState: true,
    e1FinalDmg: true,
    e4Buffs: true,
    e6ResPen: true,
  }

  const teammateDefaults = {
    memospriteActive: true,
    enhancedState: true,
    e1FinalDmg: true,
    e4Buffs: true,
    e6ResPen: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    buffPriority: {
      id: 'buffPriority',
      formItem: 'select',
      text: tBuff('Text'),
      content: tBuff('Content'),
      options: [
        { display: tBuff('Self'), value: BUFF_PRIORITY_SELF, label: tBuff('Self') },
        { display: tBuff('Memo'), value: BUFF_PRIORITY_MEMO, label: tBuff('Memo') },
      ],
      fullWidth: true,
    },
    memospriteActive: {
      id: 'memospriteActive',
      formItem: 'switch',
      text: 'Memosprite active',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
    },
    crBuff: {
      id: 'crBuff',
      formItem: 'switch',
      text: 'CR buff',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
    },
    memoCdBuff: {
      id: 'memoCdBuff',
      formItem: 'switch',
      text: 'Memos CD buff',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
    },
    memoriaStacks: {
      id: 'memoriaStacks',
      formItem: 'slider',
      text: 'Memoria stacks',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
      min: 0,
      max: 16,
    },
    enhancedState: {
      id: 'enhancedState',
      formItem: 'switch',
      text: 'Enhanced state',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
    },
    e1FinalDmg: {
      id: 'e1FinalDmg',
      formItem: 'switch',
      text: 'E1 Final DMG',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
      disabled: e < 1,
    },
    e4Buffs: {
      id: 'e4Buffs',
      formItem: 'switch',
      text: 'E4 buffs',
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
    memospriteActive: content.memospriteActive,
    enhancedState: content.enhancedState,
    e1FinalDmg: content.e1FinalDmg,
    e4Buffs: content.e4Buffs,
    e6ResPen: content.e6ResPen,
  }

  const e1FinalDmgMap: Record<number, number> = {
    5: 1.20,
    4: 1.20,
    3: 1.25,
    2: 1.30,
    1: 1.50,
  }

  return {
    activeAbilities: [AbilityType.BASIC, AbilityType.ULT, AbilityType.MEMO_SKILL],
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    initializeConfigurations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      x.SUMMONS.set(1, SOURCE_TALENT)
      x.MEMOSPRITE.set(1, SOURCE_TALENT)
      x.MEMO_BUFF_PRIORITY.set(r.buffPriority == BUFF_PRIORITY_SELF ? BUFF_PRIORITY_SELF : BUFF_PRIORITY_MEMO, SOURCE_TALENT)
    },
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      x.BASIC_HP_SCALING.buff(basicScaling, SOURCE_BASIC)
      x.m.ULT_HP_SCALING.buff(ultMemoScaling, SOURCE_MEMO)

      x.CR.buffDual((r.crBuff) ? 0.30 : 0, SOURCE_TRACE)
      x.CD.buffDual((r.memoCdBuff) ? talentCdScaling : 0, SOURCE_TALENT)
      x.ELEMENTAL_DMG.buffDual((r.memospriteActive && r.enhancedState) ? ultDmgBoostScaling : 0, SOURCE_ULT)
      x.ELEMENTAL_DMG.buffDual((r.memospriteActive) ? memoTalentDmgBoost : 0, SOURCE_MEMO)

      x.MEMO_BASE_SPD_FLAT.buff(160, SOURCE_MEMO)
      x.MEMO_BASE_HP_SCALING.buff(1.00, SOURCE_MEMO)

      x.m.BREAK_EFFICIENCY_BOOST.buff((e >= 4 && r.e4Buffs) ? 0.25 : 0, SOURCE_E4)

      if (r.memoriaStacks >= 16) {
        x.m.MEMO_SKILL_HP_SCALING.buff(memoSkillEnhancedScaling * r.memoriaStacks, SOURCE_MEMO)
      } else {
        x.m.MEMO_SKILL_HP_SCALING.buff(memoSkillScaling + Math.floor(TsUtils.precisionRound(r.memoriaStacks / 4)) * memoSkillAdditionalScaling, SOURCE_MEMO)
      }

      // x.SKILL_HP_SCALING.buff((r.memospriteActive) ? skillEnhancedScaling1 : skillScaling, SOURCE_SKILL)
      // x.m.SKILL_SPECIAL_SCALING.buff((r.memospriteActive) ? skillEnhancedScaling2 : 0, SOURCE_SKILL)

      // x.ELEMENTAL_DMG.buffBaseDual(talentDmgBoost * r.talentDmgStacks, SOURCE_TALENT)
      // if (e >= 1) {
      //   x.m.FINAL_DMG_BOOST.buff((r.e1EnemyHp50) ? 0.40 : 0.20, SOURCE_E1)
      // }

      // x.QUANTUM_RES_PEN.buffBaseDual((e >= 6 && r.e6Buffs) ? 0.20 : 0, SOURCE_E6)

      // x.MEMO_BASE_SPD_FLAT.buff(165, SOURCE_MEMO)
      // x.MEMO_BASE_HP_FLAT.buff(34000, SOURCE_MEMO)

      // x.m.MEMO_SKILL_SPECIAL_SCALING.buff((r.memoSkillEnhances) == 1 ? memoSkillScaling1 : 0, SOURCE_MEMO)
      // x.m.MEMO_SKILL_SPECIAL_SCALING.buff((r.memoSkillEnhances) == 2 ? memoSkillScaling2 : 0, SOURCE_MEMO)
      // x.m.MEMO_SKILL_SPECIAL_SCALING.buff((r.memoSkillEnhances) == 3 ? memoSkillScaling3 : 0, SOURCE_MEMO)
      // x.m.MEMO_TALENT_SPECIAL_SCALING.buff(r.memoTalentHits * memoTalentScaling, SOURCE_MEMO)

      // x.m.ELEMENTAL_DMG.buff(0.30 * r.memoDmgStacks, SOURCE_TRACE)

      // x.BASIC_TOUGHNESS_DMG.buff(10, SOURCE_BASIC)
      // x.SKILL_TOUGHNESS_DMG.buff(20, SOURCE_BASIC)
      // x.m.MEMO_SKILL_TOUGHNESS_DMG.buff(10, SOURCE_MEMO)
      // x.m.MEMO_TALENT_TOUGHNESS_DMG.buff(5 * (r.memoTalentHits), SOURCE_MEMO)
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      x.VULNERABILITY.buffTeam((m.memospriteActive && m.enhancedState) ? ultVulnScaling : 0, SOURCE_ULT)
      x.m.CD.buffTeam(skillCdScaling, SOURCE_SKILL)
      x.m.FINAL_DMG_BOOST.buffTeam((e >= 1 && m.e1FinalDmg) ? e1FinalDmgMap[context.enemyCount] : 0, SOURCE_E1)
      x.m.BREAK_EFFICIENCY_BOOST.buffTeam((e >= 4 && m.e4Buffs) ? 0.25 : 0, SOURCE_E4)

      const memosprites = countTeamPath(context, PathNames.Remembrance)
      if (memosprites == 1) x.m.CD.buffTeam(0.05, SOURCE_TRACE)
      if (memosprites == 2) x.m.CD.buffTeam(0.15, SOURCE_TRACE)
      if (memosprites == 3) x.m.CD.buffTeam(0.40, SOURCE_TRACE)
      if (memosprites == 4) x.m.CD.buffTeam(0.50, SOURCE_TRACE)

      x.RES_PEN.buffTeam((e >= 6 && m.e6ResPen) ? 0.20 : 0, SOURCE_E6)

      // x.RES_PEN.buffTeam((m.memospriteActive) ? ultTerritoryResPen : 0, SOURCE_ULT)
      // x.ELEMENTAL_DMG.buffTeam((m.teamDmgBoost) ? 0.10 : 0, SOURCE_MEMO)
    },
    finalizeCalculations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      // Scales off of Castorice's HP not the memo
      // x.m.ULT_DMG.buff(x.m.a[Key.SKILL_SPECIAL_SCALING] * x.a[Key.HP], Source.NONE)
      // x.m.MEMO_SKILL_DMG.buff(x.m.a[Key.MEMO_SKILL_SPECIAL_SCALING] * x.a[Key.HP], Source.NONE)
      // x.m.MEMO_TALENT_DMG.buff(x.m.a[Key.MEMO_TALENT_SPECIAL_SCALING] * x.a[Key.HP], Source.NONE)
    },
    gpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => {
      return ``
    },
  }
}

import i18next from 'i18next'
import { AbilityType, BUFF_PRIORITY_MEMO, BUFF_PRIORITY_SELF } from 'lib/conditionals/conditionalConstants'
import { AbilityEidolon, Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { CURRENT_DATA_VERSION } from 'lib/constants/constants'
import { Source } from 'lib/optimization/buffSource'
import { ComputedStatsArray, Key } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'

import { Eidolon } from 'types/character'
import { CharacterConditionalsController } from 'types/conditionals'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Aglaea')
  const tBuff = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Common.BuffPriority')
  const { basic, skill, ult, talent, memoSkill, memoTalent } = AbilityEidolon.ULT_BASIC_MEMO_TALENT_3_SKILL_TALENT_MEMO_SKILL_5
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
  } = Source.character('1407')

  const basicScaling = basic(e, 0.50, 0.55)

  const skillScaling = skill(e, 0.50, 0.55)
  const skillEnhancedScaling1 = skill(e, 0.24, 0.264)
  const skillEnhancedScaling2 = skill(e, 0.42, 0.462)

  const talentDmgBoost = talent(e, 0.20, 0.22)
  const ultTerritoryResPen = ult(e, 0.20, 0.22)

  const memoSkillScaling1 = memoSkill(e, 0.24, 0.288)
  const memoSkillScaling2 = memoSkill(e, 0.28, 0.336)
  const memoSkillScaling3 = memoSkill(e, 0.34, 0.408)

  const memoTalentScaling = memoTalent(e, 0.40, 0.44)

  const defaults = {
    buffPriority: BUFF_PRIORITY_MEMO,
    memospriteActive: true,
    // spdBuff: false,
    talentDmgStacks: 3,
    lostNetherland: true,
    memoSkillEnhances: 3,
    memoTalentHits: e >= 6 ? 9 : 6,
    enemyHpDmgBoost: 0.40,
    teamDmgBoost: true,
    e1DmgStacks: 3,
    e6Buffs: true,
  }

  const teammateDefaults = {
    lostNetherland: true,
    teamDmgBoost: true,
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
    // spdBuff: {
    //   id: 'spdBuff',
    //   formItem: 'switch',
    //   text: 'SPD buff',
    //   content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
    // },
    talentDmgStacks: {
      id: 'talentDmgStacks',
      formItem: 'slider',
      text: 'Talent DMG stacks',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
      min: 0,
      max: 3,
    },
    memoSkillEnhances: {
      id: 'memoSkillEnhances',
      formItem: 'slider',
      text: 'Memo Skill enhances',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
      min: 1,
      max: 3,
    },
    enemyHpDmgBoost: {
      id: 'enemyHpDmgBoost',
      formItem: 'slider',
      text: 'Enemy HP DMG boost',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
      min: 0,
      max: 0.40,
      percent: true,
    },
    lostNetherland: {
      id: 'lostNetherland',
      formItem: 'switch',
      text: 'Lost Netherland',
      content: 'TODO',
    },
    memoTalentHits: {
      id: 'memoTalentHits',
      formItem: 'slider',
      text: 'Memo Talent hits',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
      min: 0,
      max: e >= 6 ? 9 : 6,
    },
    teamDmgBoost: {
      id: 'teamDmgBoost',
      formItem: 'switch',
      text: 'Team DMG boost',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
    },
    e1DmgStacks: {
      id: 'e1DmgStacks',
      formItem: 'slider',
      text: 'E1 DMG stacks',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
      min: 1,
      max: 6,
      disabled: e < 1,
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
    lostNetherland: content.lostNetherland,
    teamDmgBoost: content.teamDmgBoost,
  }

  return {
    activeAbilities: [AbilityType.BASIC, AbilityType.SKILL, AbilityType.MEMO_SKILL, AbilityType.MEMO_TALENT],
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
      x.SKILL_HP_SCALING.buff((r.memospriteActive) ? skillEnhancedScaling1 + skillEnhancedScaling2 : skillScaling, SOURCE_SKILL)

      x.ELEMENTAL_DMG.buffBaseDual(talentDmgBoost * r.talentDmgStacks, SOURCE_TALENT)
      x.ELEMENTAL_DMG.buffMemo(r.enemyHpDmgBoost, SOURCE_TRACE)

      x.QUANTUM_RES_PEN.buffBaseDual((e >= 6 && r.e6Buffs) ? 0.20 : 0, SOURCE_E6)

      x.MEMO_BASE_SPD_FLAT.buff(165, SOURCE_MEMO)
      x.MEMO_BASE_HP_FLAT.buff(32000, SOURCE_MEMO)

      x.m.MEMO_SKILL_SPECIAL_SCALING.buff((r.memoSkillEnhances) == 1 ? memoSkillScaling1 : 0, SOURCE_MEMO)
      x.m.MEMO_SKILL_SPECIAL_SCALING.buff((r.memoSkillEnhances) == 2 ? memoSkillScaling2 : 0, SOURCE_MEMO)
      x.m.MEMO_SKILL_SPECIAL_SCALING.buff((r.memoSkillEnhances) == 3 ? memoSkillScaling3 : 0, SOURCE_MEMO)
      x.m.MEMO_TALENT_SPECIAL_SCALING.buff(r.memoTalentHits * memoTalentScaling, SOURCE_MEMO)

      x.m.MEMO_SKILL_DMG_BOOST.buff((e >= 1) ? 0.20 * r.e1DmgStacks : 0, SOURCE_E1)

      x.BASIC_TOUGHNESS_DMG.buff(10, SOURCE_BASIC)
      x.SKILL_TOUGHNESS_DMG.buff(20, SOURCE_BASIC)
      x.m.MEMO_SKILL_TOUGHNESS_DMG.buff(10, SOURCE_MEMO)
      x.m.MEMO_TALENT_TOUGHNESS_DMG.buff(5 * (r.memoTalentHits), SOURCE_MEMO)
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      x.RES_PEN.buffTeam((m.lostNetherland) ? ultTerritoryResPen : 0, SOURCE_ULT)
      x.ELEMENTAL_DMG.buffTeam((m.teamDmgBoost) ? 0.10 : 0, SOURCE_MEMO)
    },
    finalizeCalculations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      // Scales off of Castorice's HP not the memo
      x.m.MEMO_SKILL_DMG.buff(x.m.a[Key.MEMO_SKILL_SPECIAL_SCALING] * x.a[Key.HP], Source.NONE)
      x.m.MEMO_TALENT_DMG.buff(x.m.a[Key.MEMO_TALENT_SPECIAL_SCALING] * x.a[Key.HP], Source.NONE)
    },
    gpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => {
      return ` 
m.MEMO_SKILL_DMG += m.MEMO_SKILL_SPECIAL_SCALING * x.HP;
m.MEMO_TALENT_DMG += m.MEMO_TALENT_SPECIAL_SCALING * x.HP;
`
    },
  }
}

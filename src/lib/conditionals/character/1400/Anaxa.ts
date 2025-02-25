import i18next from 'i18next'
import { gpuStandardAtkFinalizer, standardAtkFinalizer } from 'lib/conditionals/conditionalFinalizers'
import { AbilityEidolon, Conditionals, ContentDefinition, countTeamPath } from 'lib/conditionals/conditionalUtils'
import { CURRENT_DATA_VERSION, PathNames } from 'lib/constants/constants'
import { Source } from 'lib/optimization/buffSource'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'

import { Eidolon } from 'types/character'
import { CharacterConditionalsController } from 'types/conditionals'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  // const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Anaxa')
  const tBuff = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Common.BuffPriority')
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
  } = Source.character('1405')

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 0.75, 0.75)
  const ultScaling = ult(e, 1.80, 1.80)
  const talentDmgScaling = talent(e, 0.96, 0.96)

  const defaults = {
    skillHits: 4,
    exposedNature: true,
    eruditionTeammateBuffs: true,
    enemyWeaknessTypes: 7,
    e1DefPen: true,
    e2SpdBuff: true,
    e2UltHits: 3,
    e4AtkBuffStacks: 3,
    e6FinalDmgStacks: 5,
  }

  const teammateDefaults = {
    e1DefPen: true,
    eruditionTeammateBuffs: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    skillHits: {
      id: 'skillHits',
      formItem: 'slider',
      text: 'Skill additional hits',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
      min: 0,
      max: 4,
    },
    exposedNature: {
      id: 'exposedNature',
      formItem: 'switch',
      text: 'Exposed Nature',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
    },
    eruditionTeammateBuffs: {
      id: 'eruditionTeammateBuffs',
      formItem: 'switch',
      text: 'Erudition teammate buffs',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
    },
    enemyWeaknessTypes: {
      id: 'enemyWeaknessTypes',
      formItem: 'slider',
      text: 'Enemy weakness types',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
      min: 0,
      max: 7,
    },
    e1DefPen: {
      id: 'e1DefPen',
      formItem: 'switch',
      text: 'E1 DEF PEN',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
      disabled: e < 1,
    },
    e2SpdBuff: {
      id: 'e2SpdBuff',
      formItem: 'switch',
      text: 'E2 SPD buff',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
      disabled: e < 2,
    },
    e2UltHits: {
      id: 'e2UltHits',
      formItem: 'slider',
      text: 'E2 Ult hits',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
      min: 0,
      max: 3,
      disabled: e < 2,
    },
    e4AtkBuffStacks: {
      id: 'e4AtkBuffStacks',
      formItem: 'slider',
      text: 'E4 ATK buff stacks',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
      min: 0,
      max: 3,
      disabled: e < 4,
    },
    e6FinalDmgStacks: {
      id: 'e6FinalDmgStacks',
      formItem: 'slider',
      text: 'E6 Final DMG stacks',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
      min: 0,
      max: 5,
      disabled: e < 6,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    e1DefPen: content.e1DefPen,
    eruditionTeammateBuffs: content.eruditionTeammateBuffs,
  }

  return {
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    initializeConfigurations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>
    },
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      x.BASIC_SCALING.buff(basicScaling, SOURCE_BASIC)
      x.BASIC_SCALING.buff((r.exposedNature) ? basicScaling : 0, SOURCE_TALENT)
      x.SKILL_SCALING.buff(skillScaling * (1 + r.skillHits), SOURCE_SKILL)
      x.SKILL_SCALING.buff((r.exposedNature) ? skillScaling * (1 + r.skillHits) : 0, SOURCE_SKILL)
      x.ULT_SCALING.buff(ultScaling, SOURCE_ULT)
      x.ULT_SCALING.buff((e >= 2) ? r.e2UltHits * 0.50 : 0, SOURCE_E2)

      x.DEF_PEN.buff(r.enemyWeaknessTypes * 0.03, SOURCE_TRACE)
      x.ELEMENTAL_DMG.buff((r.exposedNature) ? talentDmgScaling : 0, SOURCE_TALENT)

      x.ATK_P.buff((e >= 4) ? r.e4AtkBuffStacks * 0.40 : 0, SOURCE_E4)
      x.FINAL_DMG_BOOST.buff((e >= 6) ? r.e6FinalDmgStacks * 0.03 : 0, SOURCE_E6)

      const eruditionMembers = countTeamPath(context, PathNames.Erudition)
      x.CD.buff((r.eruditionTeammateBuffs && eruditionMembers == 1) ? 1.40 : 0, SOURCE_TRACE)

      x.BASIC_TOUGHNESS_DMG.buff(0, SOURCE_BASIC)
      x.SKILL_TOUGHNESS_DMG.buff(0, SOURCE_SKILL)
      x.ULT_TOUGHNESS_DMG.buff(0, SOURCE_ULT)
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      const eruditionMembers = countTeamPath(context, PathNames.Erudition)
      x.ELEMENTAL_DMG.buff((m.eruditionTeammateBuffs && eruditionMembers >= 2) ? 0.30 : 0, SOURCE_TRACE)

      x.DEF_PEN.buff((e >= 1 && m.e1DefPen) ? 0.16 : 0, SOURCE_E1)
    },
    finalizeCalculations: (x: ComputedStatsArray) => standardAtkFinalizer(x),
    gpuFinalizeCalculations: () => gpuStandardAtkFinalizer(),
  }
}

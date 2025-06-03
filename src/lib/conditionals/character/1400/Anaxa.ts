import { AbilityType } from 'lib/conditionals/conditionalConstants'
import {
  AbilityEidolon,
  Conditionals,
  ContentDefinition,
  countTeamPath,
} from 'lib/conditionals/conditionalUtils'
import { PathNames } from 'lib/constants/constants'
import { Source } from 'lib/optimization/buffSource'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'
import { Eidolon } from 'types/character'
import { CharacterConditionalsController } from 'types/conditionals'
import {
  OptimizerAction,
  OptimizerContext,
} from 'types/optimizer'

export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Anaxa.Content')
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
  const skillScaling = skill(e, 0.70, 0.77)
  const ultScaling = ult(e, 1.60, 1.76)
  const talentDmgScaling = talent(e, 0.30, 0.324)

  const defaults = {
    skillHits: 4,
    exposedNature: true,
    eruditionTeammateBuffs: true,
    enemyWeaknessTypes: 7,
    e1DefPen: true,
    e2ResPen: true,
    e4AtkBuffStacks: 2,
    e6Buffs: true,
  }

  const teammateDefaults = {
    eruditionTeammateBuffs: true,
    e1DefPen: true,
    e2ResPen: true,
    e6Buffs: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    skillHits: {
      id: 'skillHits',
      formItem: 'slider',
      text: t('skillHits.text'),
      content: t('skillHits.content'),
      min: 0,
      max: 4,
    },
    exposedNature: {
      id: 'exposedNature',
      formItem: 'switch',
      text: t('exposedNature.text'),
      content: t('exposedNature.content', { DmgBuff: TsUtils.precisionRound(100 * talentDmgScaling) }),
    },
    eruditionTeammateBuffs: {
      id: 'eruditionTeammateBuffs',
      formItem: 'switch',
      text: t('eruditionTeammateBuffs.text'),
      content: t('eruditionTeammateBuffs.content'),
    },
    enemyWeaknessTypes: {
      id: 'enemyWeaknessTypes',
      formItem: 'slider',
      text: t('enemyWeaknessTypes.text'),
      content: t('enemyWeaknessTypes.content'),
      min: 0,
      max: 7,
    },
    e1DefPen: {
      id: 'e1DefPen',
      formItem: 'switch',
      text: t('e1DefPen.text'),
      content: t('e1DefPen.content'),
      disabled: e < 1,
    },
    e2ResPen: {
      id: 'e2ResPen',
      formItem: 'switch',
      text: t('e2ResPen.text'),
      content: t('e2ResPen.content'),
      disabled: e < 2,
    },
    e4AtkBuffStacks: {
      id: 'e4AtkBuffStacks',
      formItem: 'slider',
      text: t('e4AtkBuffStacks.text'),
      content: t('e4AtkBuffStacks.content'),
      min: 0,
      max: 2,
      disabled: e < 4,
    },
    e6Buffs: {
      id: 'e6Buffs',
      formItem: 'switch',
      text: t('e6Buffs.text'),
      content: t('e6Buffs.content'),
      disabled: e < 6,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    eruditionTeammateBuffs: content.eruditionTeammateBuffs,
    e1DefPen: content.e1DefPen,
    e2ResPen: content.e2ResPen,
    e6Buffs: content.e6Buffs,
  }

  return {
    activeAbilities: [AbilityType.BASIC, AbilityType.SKILL, AbilityType.ULT],
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    initializeConfigurations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>
    },
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      x.BASIC_ATK_SCALING.buff(basicScaling, SOURCE_BASIC)
      x.SKILL_ATK_SCALING.buff(skillScaling * (1 + r.skillHits), SOURCE_SKILL)
      x.ULT_ATK_SCALING.buff(ultScaling, SOURCE_ULT)

      x.SKILL_DMG_BOOST.buff(context.enemyCount * 0.20, SOURCE_SKILL)

      x.DEF_PEN.buff(r.enemyWeaknessTypes * 0.04, SOURCE_TRACE)
      x.ELEMENTAL_DMG.buff((r.exposedNature) ? talentDmgScaling : 0, SOURCE_TALENT)

      x.ATK_P.buff((e >= 4) ? r.e4AtkBuffStacks * 0.30 : 0, SOURCE_E4)
      x.FINAL_DMG_BOOST.buff((e >= 6 && r.e6Buffs) ? 0.30 : 0, SOURCE_E6)

      const eruditionMembers = countTeamPath(context, PathNames.Erudition)
      x.CD.buff((r.eruditionTeammateBuffs && eruditionMembers == 1 || e >= 6 && r.e6Buffs) ? 1.40 : 0, SOURCE_TRACE)

      x.BASIC_TOUGHNESS_DMG.buff(10, SOURCE_BASIC)
      x.SKILL_TOUGHNESS_DMG.buff(10 + (r.skillHits) * 10, SOURCE_SKILL)
      x.ULT_TOUGHNESS_DMG.buff(20, SOURCE_ULT)
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      const eruditionMembers = countTeamPath(context, PathNames.Erudition)
      x.ELEMENTAL_DMG.buff((m.eruditionTeammateBuffs && eruditionMembers >= 2 || e >= 6 && m.e6Buffs) ? 0.50 : 0, SOURCE_TRACE)

      x.DEF_PEN.buff((e >= 1 && m.e1DefPen) ? 0.16 : 0, SOURCE_E1)
      x.RES_PEN.buffTeam((e >= 2 && m.e2ResPen) ? 0.20 : 0, SOURCE_E2)
    },
    finalizeCalculations: (x: ComputedStatsArray) => {},
    gpuFinalizeCalculations: () => '',
  }
}

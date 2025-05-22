import i18next from "i18next"
import { AbilityType, FUA_DMG_TYPE, SKILL_DMG_TYPE } from 'lib/conditionals/conditionalConstants'
import { AbilityEidolon, Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { CURRENT_DATA_VERSION } from 'lib/constants/constants'
import { Source } from 'lib/optimization/buffSource'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import { Eidolon } from 'types/character'
import { CharacterConditionalsController } from 'types/conditionals'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

export enum PhainonEnhancedSkillType {
  FOUNDATION = 0,
  CALAMITY = 0,
}

export default (e: Eidolon): CharacterConditionalsController => {
  // const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Phainon.Content')
  const { basic, skill, talent } = AbilityEidolon.ULT_BASIC_3_SKILL_TALENT_5
  const {
    SOURCE_BASIC,
    SOURCE_SKILL,
    SOURCE_TALENT,
    SOURCE_TRACE,
    SOURCE_ULT,
  } = Source.character('1408')

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 3.00, 3.30)

  const enhancedBasicScaling = basic(e, 2.50, 2.75)
  const enhancedSkillFoundationSingleHitScaling = skill(e, 0.45, 0.495) // Skill is 4 * 4 + 10 hits of 45% = 1170

  const fuaDmgScaling = skill(e, 0.40, 0.44)
  const fuaDmgExtraScaling = skill(e, 0.30, 0.33)


  const talentAtkBuffScaling = talent(e, 0.80, 0.88)
  const talentHpBuffScaling = talent(e, 2.40, 2.64)
  const talentCdBuffScaling = talent(e, 0.30, 0.33)


  const defaults = {
    transformedState: true,
    enhancedSkillType: PhainonEnhancedSkillType.FOUNDATION,
    bruiseStacks: 4,
    atkBuffStacks: 2,
    cdBuff: true,
    sustainDmgBuff: true,
    spdBuff: true,
    // eruditionTeammateBuffs: true,
    // enemyWeaknessTypes: 7,
    // e1DefPen: true,
    // e2ResPen: true,
    // e4AtkBuffStacks: 2,
    // e6Buffs: true,
  }

  const teammateDefaults = {
    spdBuff: false,
    // eruditionTeammateBuffs: true,
    // e1DefPen: true,
    // e2ResPen: true,
    // e6Buffs: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    // skillHits: {
    //     id: 'skillHits',
    //     formItem: 'slider',
    //     text: t('skillHits.text'),
    //     content: t('skillHits.content'),
    //     min: 0,
    //     max: 4,
    // },
    transformedState: {
      id: 'transformedState',
      formItem: 'switch',
      text: 'Transformation active',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
    },
    bruiseStacks: {
      id: 'bruiseStacks',
      formItem: 'slider',
      text: 'Bruise stacks',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
      min: 0,
      max: 6,
    },
    enhancedSkillType: {
      id: 'enhancedSkillType',
      formItem: 'select',
      text: 'Enhanced Skill type',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
      options: [
        { display: 'Calamity', value: PhainonEnhancedSkillType.CALAMITY, label: 'Calamity' },
        { display: 'Foundation', value: PhainonEnhancedSkillType.FOUNDATION, label: 'Foundation' },
      ],
      fullWidth: true,
    },
    atkBuffStacks: {
      id: 'atkBuffStacks',
      formItem: 'slider',
      text: 'ATK buff stacks',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
      min: 1,
      max: 2,
    },
    cdBuff: {
      id: 'cdBuff',
      formItem: 'switch',
      text: 'CD buff',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
    },
    sustainDmgBuff: {
      id: 'sustainDmgBuff',
      formItem: 'switch',
      text: 'sustainDmgBuff',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
    },
    spdBuff: {
      id: 'spdBuff',
      formItem: 'switch',
      text: 'Team SPD buff',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
    },

    // enemyWeaknessTypes: {
    //     id: 'enemyWeaknessTypes',
    //     formItem: 'slider',
    //     text: t('enemyWeaknessTypes.text'),
    //     content: t('enemyWeaknessTypes.content'),
    //     min: 0,
    //     max: 7,
    // },
    // e1DefPen: {
    //     id: 'e1DefPen',
    //     formItem: 'switch',
    //     text: t('e1DefPen.text'),
    //     content: t('e1DefPen.content'),
    //     disabled: e < 1,
    // },
    // e2ResPen: {
    //     id: 'e2ResPen',
    //     formItem: 'switch',
    //     text: t('e2ResPen.text'),
    //     content: t('e2ResPen.content'),
    //     disabled: e < 2,
    // },
    // e4AtkBuffStacks: {
    //     id: 'e4AtkBuffStacks',
    //     formItem: 'slider',
    //     text: t('e4AtkBuffStacks.text'),
    //     content: t('e4AtkBuffStacks.content'),
    //     min: 0,
    //     max: 2,
    //     disabled: e < 4,
    // },
    // e6Buffs: {
    //     id: 'e6Buffs',
    //     formItem: 'switch',
    //     text: t('e6Buffs.text'),
    //     content: t('e6Buffs.content'),
    //     disabled: e < 6,
    // },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    spdBuff: content.spdBuff,
    // e1DefPen: content.e1DefPen,
    // e2ResPen: content.e2ResPen,
    // e6Buffs: content.e6Buffs,
  }

  return {
    activeAbilities: [AbilityType.BASIC, AbilityType.SKILL, AbilityType.ULT],
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    initializeConfigurations: (x: ComputedStatsArray) => {
      x.FUA_DMG_TYPE.set(SKILL_DMG_TYPE | FUA_DMG_TYPE, SOURCE_SKILL)
    },
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      x.CD.buff(r.cdBuff ? talentCdBuffScaling : 0, SOURCE_TALENT)
      x.ATK_P.buff(r.atkBuffStacks * 0.50, SOURCE_TRACE)
      x.ELEMENTAL_DMG.buff(r.sustainDmgBuff ? 0.40 : 0, SOURCE_TRACE)

      if (r.transformedState) {
        x.ATK_P.buff(talentAtkBuffScaling, SOURCE_TALENT)
        x.HP_P.buff(talentHpBuffScaling, SOURCE_TALENT)

        x.BASIC_ATK_SCALING.buff(enhancedBasicScaling, SOURCE_BASIC)

        if (r.enhancedSkillType == PhainonEnhancedSkillType.CALAMITY) {
          x.DMG_RED_MULTI.multiply(1 - 0.75, SOURCE_SKILL)
        }
        if (r.enhancedSkillType == PhainonEnhancedSkillType.FOUNDATION) {
          x.SKILL_ATK_SCALING.buff(26 * enhancedSkillFoundationSingleHitScaling / context.enemyCount, SOURCE_SKILL)
        }

        // Second ult

        x.FUA_ATK_SCALING.buff(fuaDmgScaling + 4 * fuaDmgExtraScaling, SOURCE_SKILL)
      } else {
        x.BASIC_ATK_SCALING.buff(basicScaling, SOURCE_BASIC)
        x.SKILL_ATK_SCALING.buff(skillScaling, SOURCE_SKILL)
      }

      // x.BASIC_TOUGHNESS_DMG.buff(10, SOURCE_BASIC)
      // x.SKILL_TOUGHNESS_DMG.buff(10 + (r.skillHits) * 10, SOURCE_SKILL)
      // x.ULT_TOUGHNESS_DMG.buff(20, SOURCE_ULT)
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      x.SPD_P.buff(m.spdBuff ? 0.15 : 0, SOURCE_TALENT)
      // const eruditionMembers = countTeamPath(context, PathNames.Erudition)
      // x.ELEMENTAL_DMG.buff((m.eruditionTeammateBuffs && eruditionMembers >= 2 || e >= 6 && m.e6Buffs) ? 0.50 : 0, SOURCE_TRACE)
      //
      // x.DEF_PEN.buff((e >= 1 && m.e1DefPen) ? 0.16 : 0, SOURCE_E1)
      // x.RES_PEN.buffTeam((e >= 2 && m.e2ResPen) ? 0.20 : 0, SOURCE_E2)
    },
    finalizeCalculations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>
      if (r.transformedState) {
        x.SPD.set(0.60 * context.baseSPD, SOURCE_ULT)
        // TODO: Same for gpu
      }
    },
    gpuFinalizeCalculations: () => '',
  }
}

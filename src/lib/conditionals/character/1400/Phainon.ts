import {
  AbilityType,
  FUA_DMG_TYPE,
  SKILL_DMG_TYPE,
} from 'lib/conditionals/conditionalConstants'
import {
  AbilityEidolon,
  Conditionals,
  ContentDefinition,
} from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import { PHAINON } from 'lib/simulations/tests/testMetadataConstants'
import { TsUtils } from 'lib/utils/TsUtils'
import { Eidolon } from 'types/character'
import { CharacterConditionalsController } from 'types/conditionals'
import {
  OptimizerAction,
  OptimizerContext,
} from 'types/optimizer'

export enum PhainonEnhancedSkillType {
  FOUNDATION = 0,
  CALAMITY = 1,
}

export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Phainon.Content')
  const { basic, skill, ult, talent } = AbilityEidolon.ULT_BASIC_3_SKILL_TALENT_5
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
  } = Source.character(PHAINON)

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 3.00, 3.30)

  const enhancedBasicScaling = basic(e, 2.50, 2.75)
  const enhancedSkillFoundationSingleHitScaling = skill(e, 0.45, 0.495) // Skill is 4 * 4 + 10 hits of 45% = 1170

  const fuaDmgScaling = skill(e, 0.40, 0.44)
  const fuaDmgExtraScaling = skill(e, 0.30, 0.33)

  const talentAtkBuffScaling = talent(e, 0.80, 0.88)
  const talentHpBuffScaling = talent(e, 2.70, 2.97)
  const talentCdBuffScaling = talent(e, 0.30, 0.33)

  const ultScaling = ult(e, 9.60, 10.56)

  const defaults = {
    transformedState: true,
    enhancedSkillType: PhainonEnhancedSkillType.FOUNDATION,
    atkBuffStacks: 2,
    cdBuff: true,
    sustainDmgBuff: true,
    spdBuff: false,
    e1Buffs: true,
    e2ResPen: true,
    e6TrueDmg: true,
  }

  const teammateDefaults = {
    spdBuff: false,
  }

  const content: ContentDefinition<typeof defaults> = {
    transformedState: {
      id: 'transformedState',
      formItem: 'switch',
      text: t('transformedState.text'),
      content: t('transformedState.content', {
        UltAtkBuff: TsUtils.precisionRound(100 * talentAtkBuffScaling),
        UltCdBuff: TsUtils.precisionRound(100 * talentCdBuffScaling),
        UltHPBuff: TsUtils.precisionRound(100 * talentHpBuffScaling),
      }),
    },
    enhancedSkillType: {
      id: 'enhancedSkillType',
      formItem: 'select',
      text: t('enhancedSkillType.text'),
      content: t('enhancedSkillType.content'),
      options: [
        {
          display: t('enhancedSkillType.options.Calamity.display'),
          value: PhainonEnhancedSkillType.CALAMITY,
          label: t('enhancedSkillType.options.Calamity.label'),
        },
        {
          display: t('enhancedSkillType.options.Foundation.display'),
          value: PhainonEnhancedSkillType.FOUNDATION,
          label: t('enhancedSkillType.options.Foundation.label'),
        },
      ],
      fullWidth: true,
    },
    atkBuffStacks: {
      id: 'atkBuffStacks',
      formItem: 'slider',
      text: t('atkBuffStacks.text'),
      content: t('atkBuffStacks.content'),
      min: 1,
      max: 2,
    },
    cdBuff: {
      id: 'cdBuff',
      formItem: 'switch',
      text: t('cdBuff.text'),
      content: t('cdBuff.content', { TalentCdBuff: TsUtils.precisionRound(100 * talentCdBuffScaling) }),
    },
    sustainDmgBuff: {
      id: 'sustainDmgBuff',
      formItem: 'switch',
      text: t('sustainDmgBuff.text'),
      content: t('sustainDmgBuff.content'),
    },
    spdBuff: {
      id: 'spdBuff',
      formItem: 'switch',
      text: t('spdBuff.text'),
      content: t('spdBuff.content'),
    },
    e1Buffs: {
      id: 'e1Buffs',
      formItem: 'switch',
      text: t('e1Buffs.text'),
      content: t('e1Buffs.content'),
      disabled: e < 1,
    },
    e2ResPen: {
      id: 'e2ResPen',
      formItem: 'switch',
      text: t('e2ResPen.text'),
      content: t('e2ResPen.content'),
      disabled: e < 2,
    },
    e6TrueDmg: {
      id: 'e6TrueDmg',
      formItem: 'switch',
      text: t('e6TrueDmg.text'),
      content: t('e6TrueDmg.content'),
      disabled: e < 6,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    spdBuff: content.spdBuff,
  }

  return {
    activeAbilities: [AbilityType.BASIC, AbilityType.SKILL, AbilityType.ULT, AbilityType.FUA],
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
      x.ELEMENTAL_DMG.buff(r.sustainDmgBuff ? 0.45 : 0, SOURCE_TRACE)

      x.CD.buff(e >= 1 && r.e1Buffs ? 0.50 : 0, SOURCE_E1)

      if (r.transformedState) {
        x.ATK_P.buff(talentAtkBuffScaling, SOURCE_TALENT)
        x.HP_P.buff(talentHpBuffScaling, SOURCE_TALENT)

        x.PHYSICAL_RES_PEN.buff(e >= 2 && r.e2ResPen ? 0.20 : 0, SOURCE_E2)

        x.BASIC_ATK_SCALING.buff(enhancedBasicScaling, SOURCE_BASIC)

        if (r.enhancedSkillType == PhainonEnhancedSkillType.CALAMITY) {
          x.DMG_RED_MULTI.multiply(1 - 0.75, SOURCE_SKILL)
        }
        if (r.enhancedSkillType == PhainonEnhancedSkillType.FOUNDATION) {
          x.SKILL_ATK_SCALING.buff(26 * enhancedSkillFoundationSingleHitScaling / context.enemyCount, SOURCE_SKILL)
          x.SKILL_TOUGHNESS_DMG.buff(16 * 3.33333 / context.enemyCount + 20, SOURCE_SKILL)

          x.SKILL_TRUE_DMG_MODIFIER.buff(e >= 6 && r.e6TrueDmg ? 0.36 : 0, SOURCE_E6)
        }

        x.FUA_ATK_SCALING.buff(fuaDmgScaling + 4 * fuaDmgExtraScaling, SOURCE_SKILL)
        x.ULT_ATK_SCALING.buff(ultScaling, SOURCE_ULT)

        x.BASIC_TOUGHNESS_DMG.buff(30, SOURCE_BASIC)
        x.SKILL_TOUGHNESS_DMG.buff(0, SOURCE_SKILL)
        x.FUA_TOUGHNESS_DMG.buff(15, SOURCE_SKILL)
        x.ULT_TOUGHNESS_DMG.buff(20, SOURCE_ULT)
      } else {
        x.BASIC_ATK_SCALING.buff(basicScaling, SOURCE_BASIC)
        x.SKILL_ATK_SCALING.buff(skillScaling, SOURCE_SKILL)
        x.ULT_ATK_SCALING.buff(0, SOURCE_ULT)

        x.BASIC_TOUGHNESS_DMG.buff(10, SOURCE_BASIC)
        x.SKILL_TOUGHNESS_DMG.buff(20, SOURCE_SKILL)
        x.FUA_TOUGHNESS_DMG.buff(0, SOURCE_SKILL)
        x.ULT_TOUGHNESS_DMG.buff(0, SOURCE_ULT)
      }
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      x.SPD_P.buffTeam(m.spdBuff ? 0.15 : 0, SOURCE_TALENT)
    },
    finalizeCalculations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
    },
    gpuFinalizeCalculations: () => '',
  }
}

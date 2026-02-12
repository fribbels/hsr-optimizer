import { AbilityType } from 'lib/conditionals/conditionalConstants'
import {
  AbilityEidolon,
  Conditionals,
  ContentDefinition,
  countTeamPath,
  createEnum,
  cyreneActionExists,
  cyreneSpecialEffectEidolonUpgraded,
  teammateMatchesId,
} from 'lib/conditionals/conditionalUtils'
import { HitDefinitionBuilder } from 'lib/conditionals/hitDefinitionBuilder'
import { PathNames } from 'lib/constants/constants'
import { Source } from 'lib/optimization/buffSource'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import { StatKey } from 'lib/optimization/engine/config/keys'
import {
  DamageTag,
  ElementTag,
  TargetTag,
} from 'lib/optimization/engine/config/tag'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import {
  HYACINE,
  PHAINON,
} from 'lib/simulations/tests/testMetadataConstants'
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

export const PhainonEntities = createEnum('Phainon')
export const PhainonAbilities = createEnum('BASIC', 'SKILL', 'ULT', 'FUA', 'BREAK')

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
    SOURCE_MEMO,
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
    cyreneSpecialEffect: true,
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
    cyreneSpecialEffect: {
      id: 'cyreneSpecialEffect',
      formItem: 'switch',
      text: t('cyreneSpecialEffect.text'),
      content: t('cyreneSpecialEffect.content'),
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

    entityDeclaration: () => Object.values(PhainonEntities),
    entityDefinition: (action: OptimizerAction, context: OptimizerContext) => ({
      [PhainonEntities.Phainon]: {
        primary: true,
        summon: false,
        memosprite: false,
      },
    }),

    actionDeclaration: () => Object.values(PhainonAbilities),
    actionDefinition: (action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // Cyrene additional damage scaling
      const cyreneAdditionalScaling = cyreneActionExists(action) && r.cyreneSpecialEffect
        ? (cyreneSpecialEffectEidolonUpgraded(action) ? 0.11 : 0.10) * 5 / context.enemyCount
        : 0

      // Helper to create additional damage hit when Cyrene is active
      const createCyreneAdditionalHit = () =>
        HitDefinitionBuilder.standardAdditional()
          .damageElement(ElementTag.Physical)
          .atkScaling(cyreneAdditionalScaling)
          .build()

      // Compute skill scaling for Foundation type (depends on enemy count)
      const foundationSkillScaling = 26 * enhancedSkillFoundationSingleHitScaling / context.enemyCount
      const foundationSkillToughness = 16 * 3.33333 / context.enemyCount + 20

      // FUA scaling (transformed)
      const fuaScaling = fuaDmgScaling + 4 * fuaDmgExtraScaling

      if (r.transformedState) {
        // Transformed state abilities
        return {
          [PhainonAbilities.BASIC]: {
            hits: [
              HitDefinitionBuilder.standardBasic()
                .damageElement(ElementTag.Physical)
                .atkScaling(enhancedBasicScaling)
                .toughnessDmg(30)
                .build(),
              ...(cyreneAdditionalScaling > 0 ? [createCyreneAdditionalHit()] : []),
            ],
          },
          [PhainonAbilities.SKILL]: {
            hits: r.enhancedSkillType === PhainonEnhancedSkillType.FOUNDATION
              ? [
                  HitDefinitionBuilder.standardSkill()
                    .damageElement(ElementTag.Physical)
                    .atkScaling(foundationSkillScaling)
                    .toughnessDmg(foundationSkillToughness)
                    .trueDmgModifier(e >= 6 && r.e6TrueDmg ? 0.36 : 0)
                    .build(),
                  ...(cyreneAdditionalScaling > 0 ? [createCyreneAdditionalHit()] : []),
                ]
              : [], // Calamity mode has no skill damage
          },
          [PhainonAbilities.ULT]: {
            hits: [
              HitDefinitionBuilder.standardUlt()
                .damageElement(ElementTag.Physical)
                .atkScaling(ultScaling)
                .toughnessDmg(20)
                .build(),
              ...(cyreneAdditionalScaling > 0 ? [createCyreneAdditionalHit()] : []),
            ],
          },
          [PhainonAbilities.FUA]: {
            hits: [
              HitDefinitionBuilder.standardFua()
                .damageType(DamageTag.SKILL | DamageTag.FUA)
                .damageElement(ElementTag.Physical)
                .atkScaling(fuaScaling)
                .toughnessDmg(15)
                .build(),
              ...(cyreneAdditionalScaling > 0 ? [createCyreneAdditionalHit()] : []),
            ],
          },
          [PhainonAbilities.BREAK]: {
            hits: [
              HitDefinitionBuilder.standardBreak(ElementTag.Physical).build(),
            ],
          },
        }
      } else {
        // Non-transformed state abilities
        return {
          [PhainonAbilities.BASIC]: {
            hits: [
              HitDefinitionBuilder.standardBasic()
                .damageElement(ElementTag.Physical)
                .atkScaling(basicScaling)
                .toughnessDmg(10)
                .build(),
              ...(cyreneAdditionalScaling > 0 ? [createCyreneAdditionalHit()] : []),
            ],
          },
          [PhainonAbilities.SKILL]: {
            hits: [
              HitDefinitionBuilder.standardSkill()
                .damageElement(ElementTag.Physical)
                .atkScaling(skillScaling)
                .toughnessDmg(20)
                .build(),
              ...(cyreneAdditionalScaling > 0 ? [createCyreneAdditionalHit()] : []),
            ],
          },
          [PhainonAbilities.ULT]: {
            hits: [
              // Non-transformed ULT has no damage
              ...(cyreneAdditionalScaling > 0 ? [createCyreneAdditionalHit()] : []),
            ],
          },
          [PhainonAbilities.FUA]: {
            hits: [
              // Non-transformed FUA has no damage
            ],
          },
          [PhainonAbilities.BREAK]: {
            hits: [
              HitDefinitionBuilder.standardBreak(ElementTag.Physical).build(),
            ],
          },
        }
      }
    },
    actionModifiers: () => [],

    initializeConfigurationsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
    },

    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // Cyrene CD buff
      const cyreneCdBuff = cyreneActionExists(action) && r.cyreneSpecialEffect
        ? (cyreneSpecialEffectEidolonUpgraded(action) ? 0.132 : 0.12) * (e >= 6 ? 6 : 3)
        : 0
      x.buff(StatKey.CD, cyreneCdBuff, x.source(SOURCE_MEMO))

      // Talent CD buff
      x.buff(StatKey.CD, r.cdBuff ? talentCdBuffScaling : 0, x.source(SOURCE_TALENT))

      // ATK% stacks trace
      x.buff(StatKey.ATK_P, r.atkBuffStacks * 0.50, x.source(SOURCE_TRACE))

      // Sustain DMG boost
      const hasSustain = teammateMatchesId(context, HYACINE)
        + countTeamPath(context, PathNames.Abundance)
        + countTeamPath(context, PathNames.Preservation)
      x.buff(StatKey.DMG_BOOST, (r.sustainDmgBuff && hasSustain) ? 0.45 : 0, x.source(SOURCE_TRACE))

      // E1 CD buff
      x.buff(StatKey.CD, e >= 1 && r.e1Buffs ? 0.50 : 0, x.source(SOURCE_E1))

      if (r.transformedState) {
        // Transformed state buffs
        x.buff(StatKey.ATK_P, talentAtkBuffScaling, x.source(SOURCE_TALENT))
        x.buff(StatKey.HP_P, talentHpBuffScaling, x.source(SOURCE_TALENT))

        // E2 Physical RES PEN
        x.buff(StatKey.RES_PEN, e >= 2 && r.e2ResPen ? 0.20 : 0, x.elements(ElementTag.Physical).source(SOURCE_E2))

        // Calamity damage reduction
        if (r.enhancedSkillType === PhainonEnhancedSkillType.CALAMITY) {
          x.multiplicativeComplement(StatKey.DMG_RED, 0.75, x.source(SOURCE_SKILL))
        }

        // Cyrene CR buff (transformed only)
        const cyreneCrBuff = cyreneActionExists(action)
          ? (cyreneSpecialEffectEidolonUpgraded(action) ? 0.176 : 0.16)
          : 0
        x.buff(StatKey.CR, r.cyreneSpecialEffect ? cyreneCrBuff : 0, x.source(Source.odeTo(PHAINON)))
      }
    },


    precomputeMutualEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      x.buff(StatKey.SPD_P, m.spdBuff ? 0.15 : 0, x.targets(TargetTag.FullTeam).source(SOURCE_TALENT))
    },


    finalizeCalculations: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
    },
    newGpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => '',
  }
}

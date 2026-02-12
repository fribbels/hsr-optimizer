import { AbilityType } from 'lib/conditionals/conditionalConstants'
import {
  AbilityEidolon,
  Conditionals,
  ContentDefinition,
  countTeamPath,
  createEnum,
  cyreneActionExists,
  cyreneSpecialEffectEidolonUpgraded,
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
import { ANAXA } from 'lib/simulations/tests/testMetadataConstants'
import { TsUtils } from 'lib/utils/TsUtils'
import { Eidolon } from 'types/character'
import { CharacterConditionalsController } from 'types/conditionals'
import {
  OptimizerAction,
  OptimizerContext,
} from 'types/optimizer'

export const AnaxaEntities = createEnum('Anaxa')
export const AnaxaAbilities = createEnum('BASIC', 'SKILL', 'ULT', 'BREAK')

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
    // if cyreneSpecialEffect is changed to default to true then skillHits should be set to default at 7
    skillHits: 4,
    exposedNature: true,
    eruditionTeammateBuffs: true,
    enemyWeaknessTypes: 7,
    cyreneSpecialEffect: false,
    e1DefPen: true,
    e2ResPen: true,
    e4AtkBuffStacks: 2,
    e6Buffs: true,
  }

  const teammateDefaults = {
    eruditionTeammateBuffs: true,
    cyreneSpecialEffect: false,
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
      max: 7,
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
    cyreneSpecialEffect: {
      id: 'cyreneSpecialEffect',
      formItem: 'switch',
      text: t('cyreneSpecialEffect.text'),
      content: t('cyreneSpecialEffect.content'),
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
    cyreneSpecialEffect: content.cyreneSpecialEffect,
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

    entityDeclaration: () => Object.values(AnaxaEntities),
    entityDefinition: (action: OptimizerAction, context: OptimizerContext) => ({
      [AnaxaEntities.Anaxa]: {
        primary: true,
        summon: false,
        memosprite: false,
      },
    }),

    actionDeclaration: () => Object.values(AnaxaAbilities),
    actionDefinition: (action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // Skill scaling includes base hit + additional hits
      const totalSkillScaling = skillScaling * (1 + r.skillHits)

      // Toughness damage: base 10 + 5 per additional hit (capped at 4 unless cyrene active)
      let addedSkillHits = r.skillHits
      if (r.skillHits > 4 && !r.cyreneSpecialEffect) addedSkillHits = 4
      const skillToughness = 10 + addedSkillHits * 5

      return {
        [AnaxaAbilities.BASIC]: {
          hits: [
            HitDefinitionBuilder.standardBasic()
              .damageElement(ElementTag.Wind)
              .atkScaling(basicScaling)
              .toughnessDmg(10)
              .build(),
          ],
        },
        [AnaxaAbilities.SKILL]: {
          hits: [
            HitDefinitionBuilder.standardSkill()
              .damageElement(ElementTag.Wind)
              .atkScaling(totalSkillScaling)
              .toughnessDmg(skillToughness)
              .build(),
          ],
        },
        [AnaxaAbilities.ULT]: {
          hits: [
            HitDefinitionBuilder.standardUlt()
              .damageElement(ElementTag.Wind)
              .atkScaling(ultScaling)
              .toughnessDmg(20)
              .build(),
          ],
        },
        [AnaxaAbilities.BREAK]: {
          hits: [
            HitDefinitionBuilder.standardBreak(ElementTag.Wind).build(),
          ],
        },
      }
    },
    actionModifiers: () => [],

    initializeConfigurationsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
    },

    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // Skill DMG boost based on enemy count
      x.buff(StatKey.DMG_BOOST, context.enemyCount * 0.20, x.damageType(DamageTag.SKILL).source(SOURCE_SKILL))

      // Trace: DEF PEN based on enemy weakness types
      x.buff(StatKey.DEF_PEN, r.enemyWeaknessTypes * 0.04, x.source(SOURCE_TRACE))

      // Talent: DMG boost when Exposed Nature active
      x.buff(StatKey.DMG_BOOST, r.exposedNature ? talentDmgScaling : 0, x.source(SOURCE_TALENT))

      // E4: ATK% buff stacks
      x.buff(StatKey.ATK_P, (e >= 4) ? r.e4AtkBuffStacks * 0.30 : 0, x.source(SOURCE_E4))

      // E6: Final DMG boost
      x.buff(StatKey.FINAL_DMG_BOOST, (e >= 6 && r.e6Buffs) ? 0.30 : 0, x.source(SOURCE_E6))

      // Trace: CD buff when solo Erudition or E6 active
      const eruditionMembers = countTeamPath(context, PathNames.Erudition)
      x.buff(StatKey.CD, (r.eruditionTeammateBuffs && eruditionMembers == 1 || e >= 6 && r.e6Buffs) ? 1.40 : 0, x.source(SOURCE_TRACE))
    },

    precomputeMutualEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext, originalCharacterAction?: OptimizerAction) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      // Trace: DMG boost when 2+ Erudition members or E6 active
      const eruditionMembers = countTeamPath(context, PathNames.Erudition)
      x.buff(StatKey.DMG_BOOST, (m.eruditionTeammateBuffs && eruditionMembers >= 2 || e >= 6 && m.e6Buffs) ? 0.50 : 0, x.source(SOURCE_TRACE))

      // E1: DEF PEN
      x.buff(StatKey.DEF_PEN, (e >= 1 && m.e1DefPen) ? 0.16 : 0, x.source(SOURCE_E1))

      // E2: RES PEN (full team)
      x.buff(StatKey.RES_PEN, (e >= 2 && m.e2ResPen) ? 0.20 : 0, x.targets(TargetTag.FullTeam).source(SOURCE_E2))

      // Cyrene special effect (for Erudition characters only)
      // Uptime handled in AnaxaCyreneEffectPreprocessor
      const cyreneBuffActive = m.cyreneSpecialEffect && context.path === PathNames.Erudition
      const cyreneSkillDmgBuff = cyreneActionExists(action)
        ? (cyreneSpecialEffectEidolonUpgraded(action) ? 0.44 : 0.40)
        : 0
      x.buff(StatKey.DMG_BOOST, cyreneBuffActive ? cyreneSkillDmgBuff : 0, x.damageType(DamageTag.SKILL).source(Source.odeTo(ANAXA)))

      const cyreneAtkBuff = cyreneActionExists(originalCharacterAction!)
        ? (cyreneSpecialEffectEidolonUpgraded(originalCharacterAction!) ? 0.66 : 0.60)
        : 0
      x.buff(StatKey.ATK_P, cyreneBuffActive ? cyreneAtkBuff : 0, x.source(Source.odeTo(ANAXA)))
    },

    precomputeTeammateEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
    },

    finalizeCalculations: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
    },
    newGpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => '',
  }
}

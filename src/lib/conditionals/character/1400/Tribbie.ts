import { AbilityType } from 'lib/conditionals/conditionalConstants'
import {
  AbilityEidolon,
  Conditionals,
  ContentDefinition,
  createEnum,
  cyreneActionExists,
  cyreneSpecialEffectEidolonUpgraded,
} from 'lib/conditionals/conditionalUtils'
import { HitDefinitionBuilder } from 'lib/conditionals/hitDefinitionBuilder'
import { Source } from 'lib/optimization/buffSource'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import { StatKey } from 'lib/optimization/engine/config/keys'
import {
  DamageTag,
  DirectnessTag,
  ElementTag,
  TargetTag,
} from 'lib/optimization/engine/config/tag'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { TRIBBIE } from 'lib/simulations/tests/testMetadataConstants'
import { TsUtils } from 'lib/utils/TsUtils'

import { CURRENT_DATA_VERSION } from 'lib/constants/constants'
import { Eidolon } from 'types/character'
import { CharacterConditionalsController } from 'types/conditionals'
import {
  OptimizerAction,
  OptimizerContext,
} from 'types/optimizer'

export const TribbieEntities = createEnum('Tribbie')
export const TribbieAbilities = createEnum('BASIC', 'ULT', 'FUA', 'BREAK')

export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Tribbie.Content')
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
  } = Source.character('1403')

  const basicScaling = basic(e, 0.30, 0.33)

  const skillResPen = skill(e, 0.24, 0.264)

  const ultScaling = ult(e, 0.30, 0.33)
  const ultVulnerability = ult(e, 0.30, 0.33)
  const ultAdditionalDmgScaling = ult(e, 0.12, 0.132)

  const talentScaling = talent(e, 0.18, 0.198)

  const defaults = {
    numinosity: true,
    ultZone: true,
    alliesMaxHp: 25000,
    talentFuaStacks: 3,
    cyreneSpecialEffect: true,
    e1TrueDmg: true,
    e2AdditionalDmg: true,
    e4DefPen: true,
    e6FuaScaling: true,
  }

  const teammateDefaults = {
    numinosity: true,
    ultZone: true,
    e1TrueDmg: true,
    e4DefPen: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    numinosity: {
      id: 'numinosity',
      formItem: 'switch',
      text: t('numinosity.text'),
      content: t('numinosity.content', { ResPen: TsUtils.precisionRound(skillResPen * 100) }),
    },
    ultZone: {
      id: 'ultZone',
      formItem: 'switch',
      text: t('ultZone.text'),
      content: t('ultZone.content', {
        UltScaling: TsUtils.precisionRound(100 * ultScaling),
        ZoneVulnerability: TsUtils.precisionRound(100 * ultVulnerability),
        AdditionalDmgScaling: TsUtils.precisionRound(100 * ultAdditionalDmgScaling),
      }),
    },
    alliesMaxHp: {
      id: 'alliesMaxHp',
      formItem: 'slider',
      text: t('alliesMaxHp.text'),
      content: t('alliesMaxHp.content'),
      min: 0,
      max: 50000,
    },
    talentFuaStacks: {
      id: 'talentFuaStacks',
      formItem: 'slider',
      text: t('talentFuaStacks.text'),
      content: t('talentFuaStacks.content'),
      min: 0,
      max: 3,
    },
    cyreneSpecialEffect: {
      id: 'cyreneSpecialEffect',
      formItem: 'switch',
      text: t('cyreneSpecialEffect.text'),
      content: t('cyreneSpecialEffect.content'),
    },
    e1TrueDmg: {
      id: 'e1TrueDmg',
      formItem: 'switch',
      text: t('e1TrueDmg.text'),
      content: t('e1TrueDmg.content'),
      disabled: e < 1,
    },
    e2AdditionalDmg: {
      id: 'e2AdditionalDmg',
      formItem: 'switch',
      text: t('e2AdditionalDmg.text'),
      content: t('e2AdditionalDmg.content'),
      disabled: e < 2,
    },
    e4DefPen: {
      id: 'e4DefPen',
      formItem: 'switch',
      text: t('e4DefPen.text'),
      content: t('e4DefPen.content'),
      disabled: e < 4,
    },
    e6FuaScaling: {
      id: 'e6FuaScaling',
      formItem: 'switch',
      text: t('e6FuaScaling.text'),
      content: t('e6FuaScaling.content'),
      disabled: e < 6,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    numinosity: content.numinosity,
    ultZone: content.ultZone,
    e1TrueDmg: content.e1TrueDmg,
    e4DefPen: content.e4DefPen,
  }

  return {
    activeAbilities: [AbilityType.BASIC, AbilityType.ULT, AbilityType.FUA],
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,

    entityDeclaration: () => Object.values(TribbieEntities),
    entityDefinition: (action: OptimizerAction, context: OptimizerContext) => ({
      [TribbieEntities.Tribbie]: {
        primary: true,
        summon: false,
        memosprite: false,
      },
    }),

    actionDeclaration: () => Object.values(TribbieAbilities),
    actionDefinition: (action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // Calculate additional damage scaling from ultZone
      const additionalScaling = (r.ultZone ? ultAdditionalDmgScaling : 0)
        * ((e >= 2 && r.e2AdditionalDmg) ? 1.20 * 2 : 1)

      // Add Cyrene special effect additional scaling
      const cyreneAdditionalScaling = (cyreneActionExists(action) && r.cyreneSpecialEffect)
        ? additionalScaling
        : 0

      const totalAdditionalScaling = additionalScaling + cyreneAdditionalScaling

      return {
        [TribbieAbilities.BASIC]: {
          hits: [
            HitDefinitionBuilder.standardBasic()
              .damageElement(ElementTag.Quantum)
              .hpScaling(basicScaling)
              .toughnessDmg(10)
              .build(),
            // Additional damage from ultZone (HP-based)
            ...(
              (totalAdditionalScaling > 0)
                ? [
                  HitDefinitionBuilder.standardAdditional()
                    .damageElement(ElementTag.Quantum)
                    .hpScaling(totalAdditionalScaling)
                    .build(),
                ]
                : []
            ),
          ],
        },
        [TribbieAbilities.ULT]: {
          hits: [
            HitDefinitionBuilder.standardUlt()
              .damageElement(ElementTag.Quantum)
              .hpScaling(ultScaling)
              .toughnessDmg(20)
              .build(),
            // Additional damage from ultZone (HP-based)
            ...(
              (totalAdditionalScaling > 0)
                ? [
                  HitDefinitionBuilder.standardAdditional()
                    .damageElement(ElementTag.Quantum)
                    .hpScaling(totalAdditionalScaling)
                    .build(),
                ]
                : []
            ),
          ],
        },
        [TribbieAbilities.FUA]: {
          hits: [
            HitDefinitionBuilder.standardFua()
              .damageElement(ElementTag.Quantum)
              .hpScaling(talentScaling)
              .toughnessDmg(5)
              .build(),
            // Additional damage from ultZone (HP-based)
            ...(
              (totalAdditionalScaling > 0)
                ? [
                  HitDefinitionBuilder.standardAdditional()
                    .damageElement(ElementTag.Quantum)
                    .hpScaling(totalAdditionalScaling)
                    .build(),
                ]
                : []
            ),
          ],
        },
        [TribbieAbilities.BREAK]: {
          hits: [
            HitDefinitionBuilder.standardBreak(ElementTag.Quantum).build(),
          ],
        },
      }
    },
    actionModifiers: () => [],

    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // Elemental DMG boost from talent stacks
      x.buff(StatKey.DMG_BOOST, r.talentFuaStacks * 0.72, x.source(SOURCE_TRACE))

      // E6 FUA DMG boost
      x.buff(StatKey.DMG_BOOST, (e >= 6 && r.e6FuaScaling) ? 7.29 : 0, x.damageType(DamageTag.FUA).source(SOURCE_E6))

      // HP buff from ultZone based on allies' max HP
      x.buff(StatKey.HP, (r.ultZone) ? 0.09 * r.alliesMaxHp : 0, x.source(SOURCE_TRACE))

      // Cyrene special effect DEF PEN
      if (cyreneActionExists(action) && r.cyreneSpecialEffect) {
        const cyreneDefPenBuff = cyreneSpecialEffectEidolonUpgraded(action) ? 0.132 : 0.12
        x.buff(StatKey.DEF_PEN, cyreneDefPenBuff, x.source(Source.odeTo(TRIBBIE)))
      }
    },

    precomputeMutualEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      // Team RES PEN from numinosity (skill)
      x.buff(StatKey.RES_PEN, m.numinosity ? skillResPen : 0, x.targets(TargetTag.FullTeam).source(SOURCE_SKILL))

      // Team VULNERABILITY from ultZone
      x.buff(StatKey.VULNERABILITY, m.ultZone ? ultVulnerability : 0, x.targets(TargetTag.FullTeam).source(SOURCE_ULT))

      // E1 TRUE_DMG_MODIFIER for team (direct actions only - excludes DOT/Break)
      x.buff(
        StatKey.TRUE_DMG_MODIFIER,
        e >= 1 && m.ultZone && m.e1TrueDmg ? 0.24 : 0,
        x.directness(DirectnessTag.Direct).targets(TargetTag.FullTeam).source(SOURCE_E1),
      )

      // E4 DEF PEN for team when numinosity active
      x.buff(StatKey.DEF_PEN, (e >= 4 && m.numinosity && m.e4DefPen) ? 0.18 : 0, x.targets(TargetTag.FullTeam).source(SOURCE_E4))
    },


    finalizeCalculations: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
    },
    newGpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => '',
  }
}

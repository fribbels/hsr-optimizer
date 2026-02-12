import {
  AbilityType,
  ASHBLAZING_ATK_STACK,
  NONE_TYPE,
  SKILL_DMG_TYPE,
  ULT_DMG_TYPE,
} from 'lib/conditionals/conditionalConstants'
import {
  boostAshblazingAtkContainer,
  gpuBoostAshblazingAtkContainer,
} from 'lib/conditionals/conditionalFinalizers'
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
  ElementTag,
  TargetTag,
} from 'lib/optimization/engine/config/tag'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { PERMANSOR_TERRAE } from 'lib/simulations/tests/testMetadataConstants'
import { TsUtils } from 'lib/utils/TsUtils'
import { Eidolon } from 'types/character'
import { NumberToNumberMap } from 'types/common'
import { CharacterConditionalsController } from 'types/conditionals'
import {
  OptimizerAction,
  OptimizerContext,
} from 'types/optimizer'

export const PermansorTerraeEntities = createEnum('PermansorTerrae', 'Souldragon')
export const PermansorTerraeAbilities = createEnum('BASIC', 'ULT', 'FUA', 'SKILL_SHIELD', 'BREAK')

export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.PermansorTerrae.TeammateContent')
  const tShield = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Common.ShieldAbility')
  const { basic, skill, ult, talent } = AbilityEidolon.ULT_BASIC_3_SKILL_TALENT_5
  const {
    SOURCE_BASIC,
    SOURCE_SKILL,
    SOURCE_ULT,
    SOURCE_TALENT,
    SOURCE_TRACE,
    SOURCE_E1,
    SOURCE_E4,
    SOURCE_E6,
  } = Source.character('1414')

  const basicScaling = basic(e, 1.00, 1.10)

  const ultScaling = ult(e, 3.00, 3.30)

  const fuaScaling = ult(e, 0.80, 0.88)

  const talentShieldScaling = talent(e, 0.10, 0.106)
  const talentShieldFlat = talent(e, 200, 222.5)

  const defaults = {
    shieldAbility: ULT_DMG_TYPE,
  }

  const teammateDefaults = {
    bondmate: true,
    sourceAtk: 3000,
    cyreneSpecialEffect: true,
    e1ResPen: true,
    e4DmgReduction: true,
    e6Buffs: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    shieldAbility: {
      id: 'shieldAbility',
      formItem: 'select',
      text: tShield('Text'),
      content: tShield('Content'),
      options: [
        { display: tShield('Skill'), value: SKILL_DMG_TYPE, label: tShield('Skill') },
        { display: tShield('Ult'), value: ULT_DMG_TYPE, label: tShield('Ult') },
        { display: tShield('Trace'), value: NONE_TYPE, label: tShield('Trace') },
      ],
      fullWidth: true,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    bondmate: {
      id: 'bondmate',
      formItem: 'switch',
      text: t('bondmate.text'),
      content: t('bondmate.content'),
    },
    sourceAtk: {
      id: 'sourceAtk',
      formItem: 'slider',
      text: t('sourceAtk.text'),
      content: t('sourceAtk.content'),
      min: 0,
      max: 10000,
    },
    cyreneSpecialEffect: {
      id: 'cyreneSpecialEffect',
      formItem: 'switch',
      text: t('cyreneSpecialEffect.text'),
      content: t('cyreneSpecialEffect.content'),
    },
    e1ResPen: {
      id: 'e1ResPen',
      formItem: 'switch',
      text: t('e1ResPen.text'),
      content: t('e1ResPen.content'),
      disabled: e < 1,
    },
    e4DmgReduction: {
      id: 'e4DmgReduction',
      formItem: 'switch',
      text: t('e4DmgReduction.text'),
      content: t('e4DmgReduction.content'),
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

  const hitMultiByTargets: NumberToNumberMap = {
    1: ASHBLAZING_ATK_STACK * (1 * 0.25 + 2 * 0.25 + 3 * 0.25 + 4 * 0.25),
    3: ASHBLAZING_ATK_STACK * (2 * 0.25 + 5 * 0.25 + 8 * 0.25 + 8 * 0.25),
    5: ASHBLAZING_ATK_STACK * (3 * 0.25 + 8 * 0.25 + 8 * 0.25 + 8 * 0.25),
  }

  return {
    activeAbilities: [AbilityType.BASIC, AbilityType.ULT, AbilityType.FUA],
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,

    entityDeclaration: () => Object.values(PermansorTerraeEntities),
    entityDefinition: (action: OptimizerAction, context: OptimizerContext) => ({
      [PermansorTerraeEntities.PermansorTerrae]: {
        primary: true,
        summon: false,
        memosprite: false,
        pet: false,
      },
      [PermansorTerraeEntities.Souldragon]: {
        primary: false,
        summon: true,
        memosprite: false,
        pet: true,
      },
    }),

    actionDeclaration: () => Object.values(PermansorTerraeAbilities),
    actionDefinition: (action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // Shield scaling based on selected ability
      let shieldScaling = talentShieldScaling
      let shieldFlat = talentShieldFlat
      if (r.shieldAbility == ULT_DMG_TYPE || r.shieldAbility == SKILL_DMG_TYPE) {
        shieldScaling = talentShieldScaling * 2
        shieldFlat = talentShieldFlat * 2
      }

      return {
        [PermansorTerraeAbilities.BASIC]: {
          hits: [
            HitDefinitionBuilder.standardBasic()
              .damageElement(ElementTag.Physical)
              .atkScaling(basicScaling)
              .toughnessDmg(10)
              .build(),
          ],
        },
        [PermansorTerraeAbilities.ULT]: {
          hits: [
            HitDefinitionBuilder.standardUlt()
              .damageElement(ElementTag.Physical)
              .atkScaling(ultScaling)
              .toughnessDmg(20)
              .build(),
            HitDefinitionBuilder.ultShield()
              .atkScaling(talentShieldScaling * 2)
              .flatShield(talentShieldFlat * 2)
              .build(),
          ],
        },
        [PermansorTerraeAbilities.FUA]: {
          hits: [
            HitDefinitionBuilder.standardFua()
              .damageElement(ElementTag.Physical)
              .atkScaling(fuaScaling)
              .toughnessDmg(10)
              .build(),
            HitDefinitionBuilder.fuaShield()
              .atkScaling(talentShieldScaling)
              .flatShield(talentShieldFlat)
              .build(),
          ],
        },
        [PermansorTerraeAbilities.SKILL_SHIELD]: {
          hits: [
            HitDefinitionBuilder.skillShield()
              .atkScaling(talentShieldScaling * 2)
              .flatShield(talentShieldFlat * 2)
              .build(),
          ],
        },
        [PermansorTerraeAbilities.BREAK]: {
          hits: [
            HitDefinitionBuilder.standardBreak(ElementTag.Physical).build(),
          ],
        },
      }
    },
    actionModifiers: () => [],

    initializeConfigurationsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      x.set(StatKey.SUMMONS, 1, x.source(SOURCE_TALENT))
    },
    initializeTeammateConfigurationsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const t = action.characterConditionals as Conditionals<typeof teammateContent>

      x.buff(StatKey.SUMMONS, (t.bondmate) ? 1 : 0, x.source(SOURCE_SKILL))
    },

    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      // No self-buffs to apply - scaling is handled in actionDefinition
    },

    precomputeTeammateEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext, originalCharacterAction?: OptimizerAction) => {
      const t = action.characterConditionals as Conditionals<typeof teammateContent>

      const atkBuff = t.sourceAtk * 0.15
      x.buff(StatKey.ATK, (t.bondmate) ? atkBuff : 0, x.targets(TargetTag.SingleTarget).source(SOURCE_TRACE))
      x.buff(StatKey.UNCONVERTIBLE_ATK_BUFF, (t.bondmate) ? atkBuff : 0, x.targets(TargetTag.SingleTarget).source(SOURCE_TRACE))

      x.buff(StatKey.RES_PEN, (e >= 1 && t.bondmate && t.e1ResPen) ? 0.18 : 0, x.targets(TargetTag.SingleTarget).source(SOURCE_E1))
      x.multiplicativeComplement(StatKey.DMG_RED, (e >= 4 && t.bondmate && t.e4DmgReduction) ? 0.20 : 0, x.targets(TargetTag.SingleTarget).source(SOURCE_E4))
      x.buff(StatKey.VULNERABILITY, (e >= 6 && t.e6Buffs) ? 0.20 : 0, x.targets(TargetTag.FullTeam).source(SOURCE_E6))
      x.buff(StatKey.DEF_PEN, (e >= 6 && t.e6Buffs) ? 0.12 : 0, x.targets(TargetTag.SingleTarget).source(SOURCE_E6))

      // Cyrene
      const cyreneDmgBoost = cyreneActionExists(originalCharacterAction!)
        ? cyreneSpecialEffectEidolonUpgraded(originalCharacterAction!) ? 0.264 : 0.24
        : 0
      x.buff(StatKey.DMG_BOOST, (t.cyreneSpecialEffect) ? cyreneDmgBoost : 0, x.source(Source.odeTo(PERMANSOR_TERRAE)))
    },

    precomputeMutualEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
    },

    finalizeCalculations: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      boostAshblazingAtkContainer(x, action, hitMultiByTargets[context.enemyCount])
    },
    newGpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => {
      return gpuBoostAshblazingAtkContainer(hitMultiByTargets[context.enemyCount], action)
    },
  }
}

import {
  cyreneActionExists,
  cyreneSpecialEffectEidolonUpgraded,
} from 'lib/conditionals/character/1400/Cyrene'
import {
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
  type Conditionals,
  type ContentDefinition,
  createEnum,
} from 'lib/conditionals/conditionalUtils'
import { HitDefinitionBuilder } from 'lib/conditionals/hitDefinitionBuilder'
import {
  Parts,
  Stats,
} from 'lib/constants/constants'
import { Source } from 'lib/optimization/buffSource'
import { StatKey } from 'lib/optimization/engine/config/keys'
import {
  ElementTag,
  TargetTag,
} from 'lib/optimization/engine/config/tag'
import { type ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { AbilityKind } from 'lib/optimization/rotation/turnAbilityConfig'
import { SortOption } from 'lib/optimization/sortOptions'
import { PresetEffects } from 'lib/scoring/presetEffects'
import { wrappedFixedT } from 'lib/utils/i18nUtils'
import { type Eidolon } from 'types/character'
import { type CharacterConfig } from 'types/characterConfig'
import { type NumberToNumberMap } from 'types/common'
import { type CharacterConditionalsController } from 'types/conditionals'
import { type ScoringMetadata } from 'types/metadata'
import {
  type OptimizerAction,
  type OptimizerContext,
} from 'types/optimizer'

export const PermansorTerraeEntities = createEnum('PermansorTerrae', 'Souldragon')
export const PermansorTerraeAbilities: AbilityKind[] = [
  AbilityKind.BASIC,
  AbilityKind.ULT,
  AbilityKind.FUA,
  AbilityKind.SKILL_SHIELD,
  AbilityKind.BREAK,
]

const conditionals = (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.PermansorTerrae.TeammateContent')
  const tShield = wrappedFixedT(withContent).get(null, 'conditionals', 'Common.ShieldAbility')
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

    actionDeclaration: () => [...PermansorTerraeAbilities],
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
        [AbilityKind.BASIC]: {
          hits: [
            HitDefinitionBuilder.standardBasic()
              .damageElement(ElementTag.Physical)
              .atkScaling(basicScaling)
              .toughnessDmg(10)
              .build(),
          ],
        },
        [AbilityKind.ULT]: {
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
        [AbilityKind.FUA]: {
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
        [AbilityKind.SKILL_SHIELD]: {
          hits: [
            HitDefinitionBuilder.skillShield()
              .atkScaling(talentShieldScaling * 2)
              .flatShield(talentShieldFlat * 2)
              .build(),
          ],
        },
        [AbilityKind.BREAK]: {
          hits: [
            HitDefinitionBuilder.standardBreak(ElementTag.Physical).build(),
          ],
        },
      }
    },
    actionModifiers: () => [],

    initializeConfigurationsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
    },
    initializeTeammateConfigurationsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const t = action.characterConditionals as Conditionals<typeof teammateContent>

      if (t.bondmate) {
        action.config.hasSummons = true
      }
    },

    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      // No self-buffs to apply - scaling is handled in actionDefinition
    },

    precomputeTeammateEffectsContainer: (
      x: ComputedStatsContainer,
      action: OptimizerAction,
      context: OptimizerContext,
      originalCharacterAction?: OptimizerAction,
    ) => {
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
      x.buff(StatKey.DMG_BOOST, (t.cyreneSpecialEffect) ? cyreneDmgBoost : 0, x.targets(TargetTag.SingleTarget).source(Source.odeTo(PermansorTerrae.id)))
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

const scoring = (): ScoringMetadata => ({
  stats: {
    [Stats.ATK]: 1,
    [Stats.ATK_P]: 1,
    [Stats.DEF]: 0.25,
    [Stats.DEF_P]: 0.25,
    [Stats.HP]: 0.25,
    [Stats.HP_P]: 0.25,
    [Stats.SPD]: 1,
    [Stats.CR]: 0,
    [Stats.CD]: 0,
    [Stats.EHR]: 0,
    [Stats.RES]: 0.25,
    [Stats.BE]: 0,
  },
  parts: {
    [Parts.Body]: [
      Stats.ATK_P,
      Stats.EHR,
    ],
    [Parts.Feet]: [
      Stats.SPD,
      Stats.ATK_P,
    ],
    [Parts.PlanarSphere]: [
      Stats.ATK_P,
    ],
    [Parts.LinkRope]: [
      Stats.ERR,
      Stats.ATK_P,
    ],
  },
  presets: [
    PresetEffects.BANANA_SET,
    PresetEffects.fnAshblazingSet(8),
    PresetEffects.VALOROUS_SET,
  ],
  sortOption: SortOption.ATK,
  addedColumns: [],
  hiddenColumns: [SortOption.DOT, SortOption.SKILL],
})

const display = {
  imageCenter: {
    x: 996,
    y: 1042,
    z: 1.1,
  },
  showcaseColor: '#93ccca',
}

export const PermansorTerrae: CharacterConfig = {
  id: '1414',
  display,
  conditionals,
  get scoring() {
    return scoring()
  },
}

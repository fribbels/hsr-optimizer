import { SparkleB1 } from 'lib/conditionals/character/1300/SparkleB1'
import { Cipher } from 'lib/conditionals/character/1400/Cipher'
import { PermansorTerrae } from 'lib/conditionals/character/1400/PermansorTerrae'
import {
  AbilityEidolon,
  type Conditionals,
  type ContentDefinition,
  createEnum,
} from 'lib/conditionals/conditionalUtils'
import { HitDefinitionBuilder } from 'lib/conditionals/hitDefinitionBuilder'
import { AGroundedAscent } from 'lib/conditionals/lightcone/5star/AGroundedAscent'
import { LiesAflutterInTheWind } from 'lib/conditionals/lightcone/5star/LiesAflutterInTheWind'
import { ThoughWorldsApart } from 'lib/conditionals/lightcone/5star/ThoughWorldsApart'
import {
  Parts,
  Sets,
  Stats,
} from 'lib/constants/constants'
import { Source } from 'lib/optimization/buffSource'
import { StatKey } from 'lib/optimization/engine/config/keys'
import {
  DamageTag,
  ElementTag,
} from 'lib/optimization/engine/config/tag'
import { type ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import {
  AbilityKind,
  END_BASIC,
  NULL_TURN_ABILITY_NAME,
  START_ULT,
  WHOLE_BASIC,
} from 'lib/optimization/rotation/turnAbilityConfig'
import { SortOption } from 'lib/optimization/sortOptions'
import { PresetEffects } from 'lib/scoring/presetEffects'
import {
  SPREAD_ORNAMENTS_2P_GENERAL_CONDITIONALS,
  SPREAD_RELICS_4P_GENERAL_CONDITIONALS,
} from 'lib/scoring/scoringConstants'
import { wrappedFixedT } from 'lib/utils/i18nUtils'

import { type Eidolon } from 'types/character'
import { type CharacterConfig } from 'types/characterConfig'
import {
  type ScoringMetadata,
  type SimulationMetadata,
} from 'types/metadata'

import { type CharacterConditionalsController } from 'types/conditionals'
import {
  type OptimizerAction,
  type OptimizerContext,
} from 'types/optimizer'
import { precisionRound } from 'lib/utils/mathUtils'

export const ImbibitorLunaeEntities = createEnum('ImbibitorLunae')
export const ImbibitorLunaeAbilities: AbilityKind[] = [
  AbilityKind.BASIC,
  AbilityKind.ULT,
  AbilityKind.BREAK,
]

const conditionals = (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.ImbibitorLunae')
  const { basic, skill, ult, talent } = AbilityEidolon.SKILL_BASIC_3_ULT_TALENT_5
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
  } = Source.character('1213')

  const righteousHeartStackMax = (e >= 1) ? 10 : 6
  const outroarStackCdValue = skill(e, 0.12, 0.132)
  const righteousHeartDmgValue = talent(e, 0.10, 0.11)

  const basicScaling = basic(e, 1.00, 1.10)
  const basicEnhanced1Scaling = basic(e, 2.60, 2.86)
  const basicEnhanced2Scaling = basic(e, 3.80, 4.18)
  const basicEnhanced3Scaling = basic(e, 5.00, 5.50)
  const ultScaling = ult(e, 3.00, 3.24)

  const defaults = {
    basicEnhanced: 3,
    skillOutroarStacks: 4,
    talentRighteousHeartStacks: righteousHeartStackMax,
    e6ResPenStacks: 3,
  }

  const content: ContentDefinition<typeof defaults> = {
    basicEnhanced: {
      id: 'basicEnhanced',
      formItem: 'slider',
      text: t('Content.basicEnhanced.text'),
      content: t('Content.basicEnhanced.content', {
        basicScaling: precisionRound(100 * basicScaling),
        basicEnhanced1Scaling: precisionRound(100 * basicEnhanced1Scaling),
        basicEnhanced2Scaling: precisionRound(100 * basicEnhanced2Scaling),
        basicEnhanced3Scaling: precisionRound(100 * basicEnhanced3Scaling),
      }),
      min: 0,
      max: 3,
    },
    skillOutroarStacks: {
      id: 'skillOutroarStacks',
      formItem: 'slider',
      text: t('Content.skillOutroarStacks.text'),
      content: t('Content.skillOutroarStacks.content', { outroarStackCdValue: precisionRound(100 * outroarStackCdValue) }),
      min: 0,
      max: 4,
    },
    talentRighteousHeartStacks: {
      id: 'talentRighteousHeartStacks',
      formItem: 'slider',
      text: t('Content.talentRighteousHeartStacks.text'),
      content: t('Content.talentRighteousHeartStacks.content', { righteousHeartDmgValue: precisionRound(100 * righteousHeartDmgValue) }),
      min: 0,
      max: righteousHeartStackMax,
    },
    e6ResPenStacks: {
      id: 'e6ResPenStacks',
      formItem: 'slider',
      text: t('Content.e6ResPenStacks.text'),
      content: t('Content.e6ResPenStacks.content'),
      min: 0,
      max: 3,
      disabled: e < 6,
    },
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,

    entityDeclaration: () => Object.values(ImbibitorLunaeEntities),
    entityDefinition: (action: OptimizerAction, context: OptimizerContext) => ({
      [ImbibitorLunaeEntities.ImbibitorLunae]: {
        primary: true,
        summon: false,
        memosprite: false,
      },
    }),

    actionDeclaration: () => [...ImbibitorLunaeAbilities],
    actionDefinition: (action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // Calculate basic scaling based on enhancement level
      const basicScalingValue = {
        0: basicScaling,
        1: basicEnhanced1Scaling,
        2: basicEnhanced2Scaling,
        3: basicEnhanced3Scaling,
      }[r.basicEnhanced] ?? basicScaling

      // Toughness damage scales with enhancement level
      const basicToughnessDmg = 10 + 10 * r.basicEnhanced

      return {
        [AbilityKind.BASIC]: {
          hits: [
            HitDefinitionBuilder.standardBasic()
              .damageElement(ElementTag.Imaginary)
              .atkScaling(basicScalingValue)
              .toughnessDmg(basicToughnessDmg)
              .skillPointsUsed(r.basicEnhanced)
              .build(),
          ],
        },
        [AbilityKind.ULT]: {
          hits: [
            HitDefinitionBuilder.standardUlt()
              .damageElement(ElementTag.Imaginary)
              .atkScaling(ultScaling)
              .toughnessDmg(20)
              .build(),
          ],
        },
        [AbilityKind.BREAK]: {
          hits: [
            HitDefinitionBuilder.standardBreak(ElementTag.Imaginary).build(),
          ],
        },
      }
    },
    actionModifiers: () => [],

    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // Traces - CD when enemy is elemental weak
      x.buff(StatKey.CD, (context.enemyElementalWeak) ? 0.24 : 0, x.source(SOURCE_TRACE))

      // Skill - Outroar CD stacks
      x.buff(StatKey.CD, r.skillOutroarStacks * outroarStackCdValue, x.source(SOURCE_SKILL))

      // Talent - Righteous Heart DMG boost
      x.buff(StatKey.DMG_BOOST, r.talentRighteousHeartStacks * righteousHeartDmgValue, x.source(SOURCE_TALENT))

      // E6 - RES PEN for enhanced basic 3
      x.buff(StatKey.RES_PEN, (e >= 6 && r.basicEnhanced == 3) ? 0.20 * r.e6ResPenStacks : 0, x.damageType(DamageTag.BASIC).source(SOURCE_E6))
    },

    finalizeCalculations: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
    },
    newGpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => '',
  }
}

const simulation = (): SimulationMetadata => ({
  parts: {
    [Parts.Body]: [
      Stats.CR,
      Stats.CD,
    ],
    [Parts.Feet]: [
      Stats.ATK_P,
      Stats.SPD,
    ],
    [Parts.PlanarSphere]: [
      Stats.ATK_P,
      Stats.Imaginary_DMG,
    ],
    [Parts.LinkRope]: [
      Stats.ATK_P,
    ],
  },
  substats: [
    Stats.CD,
    Stats.CR,
    Stats.ATK_P,
    Stats.ATK,
  ],
  comboTurnAbilities: [
    NULL_TURN_ABILITY_NAME,
    START_ULT,
    END_BASIC,
    WHOLE_BASIC,
    WHOLE_BASIC,
  ],
  relicSets: [
    [Sets.MusketeerOfWildWheat, Sets.MusketeerOfWildWheat],
    [Sets.WastelanderOfBanditryDesert, Sets.WastelanderOfBanditryDesert],
    ...SPREAD_RELICS_4P_GENERAL_CONDITIONALS,
  ],
  ornamentSets: [
    Sets.RutilantArena,
    Sets.TengokuLivestream,
    ...SPREAD_ORNAMENTS_2P_GENERAL_CONDITIONALS,
  ],
  teammates: [
    {
      characterId: SparkleB1.id,
      lightCone: AGroundedAscent.id,
      characterEidolon: 0,
      lightConeSuperimposition: 1,
    },
    {
      characterId: Cipher.id,
      lightCone: LiesAflutterInTheWind.id,
      characterEidolon: 0,
      lightConeSuperimposition: 1,
    },
    {
      characterId: PermansorTerrae.id,
      lightCone: ThoughWorldsApart.id,
      characterEidolon: 0,
      lightConeSuperimposition: 1,
    },
  ],
})

const scoring = (): ScoringMetadata => ({
  stats: {
    [Stats.ATK]: 0.75,
    [Stats.ATK_P]: 0.75,
    [Stats.DEF]: 0,
    [Stats.DEF_P]: 0,
    [Stats.HP]: 0,
    [Stats.HP_P]: 0,
    [Stats.SPD]: 1,
    [Stats.CR]: 1,
    [Stats.CD]: 1,
    [Stats.EHR]: 0,
    [Stats.RES]: 0,
    [Stats.BE]: 0,
  },
  parts: {
    [Parts.Body]: [
      Stats.CR,
      Stats.CD,
      Stats.EHR,
    ],
    [Parts.Feet]: [
      Stats.ATK_P,
      Stats.SPD,
    ],
    [Parts.PlanarSphere]: [
      Stats.ATK_P,
      Stats.Imaginary_DMG,
    ],
    [Parts.LinkRope]: [
      Stats.ATK_P,
    ],
  },
  presets: [
    PresetEffects.WASTELANDER_SET,
    PresetEffects.TENGOKU_SET,
  ],
  sortOption: SortOption.BASIC,
  hiddenColumns: [
    SortOption.SKILL,
    SortOption.FUA,
    SortOption.DOT,
  ],
  simulation: simulation(),
})

const display = {
  imageCenter: {
    x: 1087,
    y: 979,
    z: 1.05,
  },
  showcaseColor: '#00b6d2',
}

export const ImbibitorLunae: CharacterConfig = {
  id: '1213',
  display,
  conditionals,
  get scoring() {
    return scoring()
  },
}

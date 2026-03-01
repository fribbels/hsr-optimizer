import { AbilityEidolon, Conditionals, ContentDefinition, createEnum, } from 'lib/conditionals/conditionalUtils'
import { HitDefinitionBuilder } from 'lib/conditionals/hitDefinitionBuilder'
import { Parts, Sets, Stats } from 'lib/constants/constants'
import { Source } from 'lib/optimization/buffSource'
import { StatKey } from 'lib/optimization/engine/config/keys'
import { DamageTag, ElementTag, TargetTag, } from 'lib/optimization/engine/config/tag'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { SortOption } from 'lib/optimization/sortOptions'
import {
  NULL_TURN_ABILITY_NAME,
  START_ULT,
  START_SKILL,
  DEFAULT_SKILL,
  END_SKILL,
  DEFAULT_FUA,
} from 'lib/optimization/rotation/turnAbilityConfig'
import {
  SPREAD_RELICS_2P_ATK_CRIT_WEIGHTS,
  SPREAD_RELICS_4P_GENERAL_CONDITIONALS,
  SPREAD_ORNAMENTS_2P_GENERAL_CONDITIONALS,
  T2_WEIGHT,
} from 'lib/scoring/scoringConstants'
import { PresetEffects } from 'lib/scoring/presetEffects'
import {
  SPARKLE_B1,
  EARTHLY_ESCAPADE,
  CIPHER,
  LIES_DANCE_ON_THE_BREEZE,
  PERMANSOR_TERRAE,
  THOUGH_WORLDS_APART,
} from 'lib/simulations/tests/testMetadataConstants'
import { TsUtils } from 'lib/utils/TsUtils'
import { Eidolon } from 'types/character'
import { CharacterConfig } from 'types/characterConfig'
import { CharacterConditionalsController } from 'types/conditionals'
import { SimulationMetadata, ScoringMetadata } from 'types/metadata'
import { OptimizerAction, OptimizerContext, } from 'types/optimizer'

export const ArcherEntities = createEnum('Archer')
export const ArcherAbilities = createEnum('BASIC', 'SKILL', 'ULT', 'FUA', 'BREAK')

const conditionals = (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Archer.Content')
  const { basic, skill, talent } = AbilityEidolon.SKILL_BASIC_3_ULT_TALENT_5
  const {
    SOURCE_BASIC,
    SOURCE_SKILL,
    SOURCE_TALENT,
    SOURCE_TRACE,
    SOURCE_ULT,
    SOURCE_E2,
    SOURCE_E4,
    SOURCE_E6,
  } = Source.character('1015')

  const basicScaling = basic(e, 1.00, 1.10)

  const skillScaling = skill(e, 3.60, 3.96)
  const skillEnhancedExtraScaling = skill(e, 1.00, 1.08)

  const ultScaling = skill(e, 10.00, 10.80)

  const fuaScaling = talent(e, 2.00, 2.20)

  const defaults = {
    cdBuff: true,
    skillEnhances: e >= 6 ? 3 : 2,
    e2QuantumResPen: true,
    e4UltDmg: true,
    e6Buffs: true,
  }

  const teammateDefaults = {
    e2QuantumResPen: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    cdBuff: {
      id: 'cdBuff',
      formItem: 'switch',
      text: t('cdBuff.text'),
      content: t('cdBuff.content'),
    },
    skillEnhances: {
      id: 'skillEnhances',
      formItem: 'slider',
      text: t('skillEnhances.text'),
      content: t('skillEnhances.content', { SkillDmgBuff: TsUtils.precisionRound(100 * skillEnhancedExtraScaling) }),
      min: 0,
      max: e >= 6 ? 3 : 2,
    },
    e2QuantumResPen: {
      id: 'e2QuantumResPen',
      formItem: 'switch',
      text: t('e2QuantumResPen.text'),
      content: t('e2QuantumResPen.content'),
      disabled: e < 2,
    },
    e4UltDmg: {
      id: 'e4UltDmg',
      formItem: 'switch',
      text: t('e4UltDmg.text'),
      content: t('e4UltDmg.content'),
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
    e2QuantumResPen: content.e2QuantumResPen,
  }

  return {
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,

    entityDeclaration: () => Object.values(ArcherEntities),
    entityDefinition: (action: OptimizerAction, context: OptimizerContext) => ({
      [ArcherEntities.Archer]: {
        primary: true,
        summon: false,
        memosprite: false,
      },
    }),

    actionDeclaration: () => Object.values(ArcherAbilities),
    actionDefinition: (action: OptimizerAction, context: OptimizerContext) => {
      return {
        [ArcherAbilities.BASIC]: {
          hits: [
            HitDefinitionBuilder.standardBasic()
              .damageElement(ElementTag.Quantum)
              .atkScaling(basicScaling)
              .toughnessDmg(10)
              .build(),
          ],
        },
        [ArcherAbilities.SKILL]: {
          hits: [
            HitDefinitionBuilder.standardSkill()
              .damageElement(ElementTag.Quantum)
              .atkScaling(skillScaling)
              .toughnessDmg(20)
              .build(),
          ],
        },
        [ArcherAbilities.ULT]: {
          hits: [
            HitDefinitionBuilder.standardUlt()
              .damageElement(ElementTag.Quantum)
              .atkScaling(ultScaling)
              .toughnessDmg(30)
              .build(),
          ],
        },
        [ArcherAbilities.FUA]: {
          hits: [
            HitDefinitionBuilder.standardFua()
              .damageElement(ElementTag.Quantum)
              .atkScaling(fuaScaling)
              .toughnessDmg(10)
              .build(),
          ],
        },
        [ArcherAbilities.BREAK]: {
          hits: [
            HitDefinitionBuilder.standardBreak(ElementTag.Quantum).build(),
          ],
        },
      }
    },
    actionModifiers: () => [],

    initializeConfigurationsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
    },
    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      x.buff(StatKey.CD, r.cdBuff ? 1.20 : 0, x.source(SOURCE_TRACE))

      x.buff(StatKey.DMG_BOOST, (e >= 4 && r.e4UltDmg) ? 1.50 : 0, x.damageType(DamageTag.ULT).source(SOURCE_E4))
      x.buff(StatKey.DEF_PEN, (e >= 6 && r.e6Buffs) ? 0.20 : 0, x.damageType(DamageTag.SKILL).source(SOURCE_E6))

      x.buff(StatKey.DMG_BOOST, r.skillEnhances * skillEnhancedExtraScaling, x.damageType(DamageTag.SKILL).source(SOURCE_SKILL))
    },
    precomputeMutualEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      x.buff(StatKey.RES_PEN, (e >= 2 && m.e2QuantumResPen) ? 0.20 : 0, x.elements(ElementTag.Quantum).targets(TargetTag.FullTeam).source(SOURCE_E2))
    },

    finalizeCalculations: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
    },
  }
}


const simulation: SimulationMetadata = {
  parts: {
    [Parts.Body]: [
      Stats.CR,
      Stats.CD,
      Stats.ATK_P,
    ],
    [Parts.Feet]: [
      Stats.ATK_P,
      Stats.SPD,
    ],
    [Parts.PlanarSphere]: [
      Stats.ATK_P,
      Stats.Quantum_DMG,
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
    DEFAULT_SKILL,
    DEFAULT_SKILL,
    END_SKILL,
    DEFAULT_FUA,
    START_SKILL,
    DEFAULT_SKILL,
    END_SKILL,
    DEFAULT_FUA,
  ],
  comboDot: 0,
  errRopeEidolon: 0,
  relicSets: [
    [Sets.WavestriderCaptain, Sets.WavestriderCaptain],
    [Sets.GeniusOfBrilliantStars, Sets.GeniusOfBrilliantStars],
    ...SPREAD_RELICS_4P_GENERAL_CONDITIONALS,
  ],
  ornamentSets: [
    Sets.RutilantArena,
    Sets.TengokuLivestream,
    ...SPREAD_ORNAMENTS_2P_GENERAL_CONDITIONALS,
  ],
  teammates: [
    {
      characterId: SPARKLE_B1,
      lightCone: EARTHLY_ESCAPADE,
      characterEidolon: 0,
      lightConeSuperimposition: 1,
    },
    {
      characterId: CIPHER,
      lightCone: LIES_DANCE_ON_THE_BREEZE,
      characterEidolon: 0,
      lightConeSuperimposition: 1,
    },
    {
      characterId: PERMANSOR_TERRAE,
      lightCone: THOUGH_WORLDS_APART,
      characterEidolon: 0,
      lightConeSuperimposition: 1,
    },
  ],
}

const scoring: ScoringMetadata = {
  stats: {
    [Stats.ATK]: 0.75,
    [Stats.ATK_P]: 0.75,
    [Stats.DEF]: 0,
    [Stats.DEF_P]: 0,
    [Stats.HP]: 0,
    [Stats.HP_P]: 0,
    [Stats.SPD]: 0,
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
      Stats.ATK_P,
      Stats.EHR,
    ],
    [Parts.Feet]: [
      Stats.ATK_P,
      Stats.SPD,
    ],
    [Parts.PlanarSphere]: [
      Stats.ATK_P,
      Stats.Quantum_DMG,
    ],
    [Parts.LinkRope]: [
      Stats.ATK_P,
      Stats.ERR,
    ],
  },
  sets: {
    ...SPREAD_RELICS_2P_ATK_CRIT_WEIGHTS,
    [Sets.GeniusOfBrilliantStars]: 1,
    [Sets.ScholarLostInErudition]: 1,

    [Sets.RutilantArena]: 1,
    [Sets.InertSalsotto]: 1,
    [Sets.SpaceSealingStation]: T2_WEIGHT,
  },
  presets: [
    PresetEffects.fnPioneerSet(4),
    PresetEffects.TENGOKU_SET,
  ],
  sortOption: SortOption.SKILL,
  hiddenColumns: [
    SortOption.DOT,
  ],
  simulation,
}

const display = {
  imageCenter: {
    x: 1100,
    y: 1050,
    z: 1,
  },
  showcaseColor: '#ff999a',
}

export const Archer: CharacterConfig = {
  id: '1015',
  info: {},
  conditionals,
  scoring,
  display,
}

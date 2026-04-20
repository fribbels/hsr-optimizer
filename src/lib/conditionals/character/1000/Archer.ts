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
import { EarthlyEscapade } from 'lib/conditionals/lightcone/5star/EarthlyEscapade'
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
  TargetTag,
} from 'lib/optimization/engine/config/tag'
import { type ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import {
  AbilityKind,
  DEFAULT_FUA,
  DEFAULT_SKILL,
  END_SKILL,
  NULL_TURN_ABILITY_NAME,
  START_SKILL,
  START_ULT,
} from 'lib/optimization/rotation/turnAbilityConfig'
import { SortOption } from 'lib/optimization/sortOptions'
import { PresetEffects } from 'lib/scoring/presetEffects'
import {
  SPREAD_ORNAMENTS_2P_GENERAL_CONDITIONALS,
  SPREAD_RELICS_4P_GENERAL_CONDITIONALS,
} from 'lib/scoring/scoringConstants'
import { wrappedFixedT } from 'lib/utils/i18nUtils'
import { precisionRound } from 'lib/utils/mathUtils'
import { type Eidolon } from 'types/character'
import { type CharacterConfig } from 'types/characterConfig'
import { type CharacterConditionalsController } from 'types/conditionals'
import {
  type ScoringMetadata,
  type SimulationMetadata,
} from 'types/metadata'
import {
  type OptimizerAction,
  type OptimizerContext,
} from 'types/optimizer'

export const ArcherEntities = createEnum('Archer')
export const ArcherAbilities: AbilityKind[] = [
  AbilityKind.BASIC,
  AbilityKind.SKILL,
  AbilityKind.ULT,
  AbilityKind.FUA,
  AbilityKind.BREAK,
]

const conditionals = (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Archer.Content')
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
  } = Source.character(Archer.id)

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
      content: t('skillEnhances.content', { SkillDmgBuff: precisionRound(100 * skillEnhancedExtraScaling) }),
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

    actionDeclaration: () => [...ArcherAbilities],
    actionDefinition: (action: OptimizerAction, context: OptimizerContext) => {
      return {
        [AbilityKind.BASIC]: {
          hits: [
            HitDefinitionBuilder.standardBasic()
              .damageElement(ElementTag.Quantum)
              .atkScaling(basicScaling)
              .toughnessDmg(10)
              .build(),
          ],
        },
        [AbilityKind.SKILL]: {
          hits: [
            HitDefinitionBuilder.standardSkill()
              .damageElement(ElementTag.Quantum)
              .atkScaling(skillScaling)
              .toughnessDmg(20)
              .skillPointsUsed(2)
              .build(),
          ],
        },
        [AbilityKind.ULT]: {
          hits: [
            HitDefinitionBuilder.standardUlt()
              .damageElement(ElementTag.Quantum)
              .atkScaling(ultScaling)
              .toughnessDmg(30)
              .build(),
          ],
        },
        [AbilityKind.FUA]: {
          hits: [
            HitDefinitionBuilder.standardFua()
              .damageElement(ElementTag.Quantum)
              .atkScaling(fuaScaling)
              .toughnessDmg(10)
              .build(),
          ],
        },
        [AbilityKind.BREAK]: {
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

const simulation = (): SimulationMetadata => ({
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
      characterId: SparkleB1.id,
      lightCone: EarthlyEscapade.id,
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
  presets: [
    PresetEffects.fnPioneerSet(4),
    PresetEffects.TENGOKU_SET,
  ],
  sortOption: SortOption.SKILL,
  hiddenColumns: [
    SortOption.DOT,
  ],
  simulation: simulation(),
})

const display = {
  imageCenter: {
    x: 1131,
    y: 1027,
    z: 1.15,
  },
  showcaseColor: '#a8231d',
}

export const Archer: CharacterConfig = {
  id: '1015',
  display,
  conditionals,
  get scoring() {
    return scoring()
  },
}

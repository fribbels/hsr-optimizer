import { Castorice } from 'lib/conditionals/character/1400/Castorice'
import { Cipher } from 'lib/conditionals/character/1400/Cipher'
import { Tribbie } from 'lib/conditionals/character/1400/Tribbie'
import {
  AbilityEidolon,
  type ContentDefinition,
  createEnum,
} from 'lib/conditionals/conditionalUtils'
import { HitDefinitionBuilder } from 'lib/conditionals/hitDefinitionBuilder'
import { IfTimeWereAFlower } from 'lib/conditionals/lightcone/5star/IfTimeWereAFlower'
import { LiesAflutterInTheWind } from 'lib/conditionals/lightcone/5star/LiesAflutterInTheWind'
import { MakeFarewellsMoreBeautiful } from 'lib/conditionals/lightcone/5star/MakeFarewellsMoreBeautiful'
import {
  Parts,
  Sets,
  Stats,
} from 'lib/constants/constants'
import { Source } from 'lib/optimization/buffSource'
import { StatKey } from 'lib/optimization/engine/config/keys'
import { ElementTag } from 'lib/optimization/engine/config/tag'
import { type ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import {
  AbilityKind,
  DEFAULT_SKILL_HEAL,
  DEFAULT_ULT_HEAL,
  NULL_TURN_ABILITY_NAME,
} from 'lib/optimization/rotation/turnAbilityConfig'
import { SortOption } from 'lib/optimization/sortOptions'
import { PresetEffects } from 'lib/scoring/presetEffects'
import { SPREAD_ORNAMENTS_2P_SUPPORT } from 'lib/scoring/scoringConstants'
import { wrappedFixedT } from 'lib/utils/i18nUtils'
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

export const NatashaEntities = createEnum('Natasha')
export const NatashaAbilities: AbilityKind[] = [
  AbilityKind.BASIC,
  AbilityKind.SKILL_HEAL,
  AbilityKind.ULT_HEAL,
  AbilityKind.BREAK,
]

const conditionals = (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  // const t = wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Natasha')
  const tHeal = wrappedFixedT(withContent).get(null, 'conditionals', 'Common.HealAbility')
  const { basic, skill, ult } = AbilityEidolon.SKILL_BASIC_3_ULT_TALENT_5
  const {
    SOURCE_TRACE,
  } = Source.character(Natasha.id)

  const basicScaling = basic(e, 1.00, 1.10)

  const ultHealScaling = ult(e, 0.138, 0.1472)
  const ultHealFlat = ult(e, 368, 409.4)

  const skillHealScaling = skill(e, 0.105, 0.112)
  const skillHealFlat = skill(e, 280, 311.5)

  // E6: Basic attack gains HP scaling
  const e6BasicHpScaling = e >= 6 ? 0.40 : 0

  const defaults = {}

  const content: ContentDefinition<typeof defaults> = {}

  return {
    content: () => Object.values(content),
    defaults: () => defaults,

    entityDeclaration: () => Object.values(NatashaEntities),
    entityDefinition: (action: OptimizerAction, context: OptimizerContext) => ({
      [NatashaEntities.Natasha]: {
        primary: true,
        summon: false,
        memosprite: false,
      },
    }),

    actionDeclaration: () => [...NatashaAbilities],
    actionDefinition: (action: OptimizerAction, context: OptimizerContext) => {
      return {
        [AbilityKind.BASIC]: {
          hits: [
            HitDefinitionBuilder.standardBasic()
              .damageElement(ElementTag.Physical)
              .atkScaling(basicScaling)
              .hpScaling(e6BasicHpScaling)
              .toughnessDmg(10)
              .build(),
          ],
        },
        [AbilityKind.SKILL_HEAL]: {
          hits: [
            HitDefinitionBuilder.skillHeal()
              .hpScaling(skillHealScaling)
              .flatHeal(skillHealFlat)
              .build(),
          ],
        },
        [AbilityKind.ULT_HEAL]: {
          hits: [
            HitDefinitionBuilder.ultHeal()
              .hpScaling(ultHealScaling)
              .flatHeal(ultHealFlat)
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

    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      x.buff(StatKey.OHB, 0.10, x.source(SOURCE_TRACE))
    },

    finalizeCalculations: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {},
    newGpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => '',
  }
}

const healSimulation = (): SimulationMetadata => ({
  parts: {
    [Parts.Body]: [Stats.OHB],
    [Parts.Feet]: [Stats.SPD, Stats.HP_P],
    [Parts.PlanarSphere]: [Stats.HP_P],
    [Parts.LinkRope]: [Stats.ERR],
  },
  substats: [
    Stats.HP_P,
    Stats.HP,
    Stats.SPD,
    Stats.RES,
    Stats.DEF_P,
  ],
  errRopeEidolon: 0,
  comboTurnAbilities: [
    NULL_TURN_ABILITY_NAME,
    DEFAULT_SKILL_HEAL,
    DEFAULT_ULT_HEAL,
  ],
  relicSets: [
    [Sets.WarriorGoddessOfSunAndThunder, Sets.WarriorGoddessOfSunAndThunder],
  ],
  ornamentSets: [
    Sets.LushakaTheSunkenSeas,
    ...SPREAD_ORNAMENTS_2P_SUPPORT,
  ],
  teammates: [
    {
      characterId: Castorice.id,
      lightCone: MakeFarewellsMoreBeautiful.id,
      characterEidolon: 0,
      lightConeSuperimposition: 1,
    },
    {
      characterId: Tribbie.id,
      lightCone: IfTimeWereAFlower.id,
      characterEidolon: 0,
      lightConeSuperimposition: 1,
    },
    {
      characterId: Cipher.id,
      lightCone: LiesAflutterInTheWind.id,
      characterEidolon: 0,
      lightConeSuperimposition: 1,
    },
  ],
  deprioritizeBuffs: true,
})

const scoring = (): ScoringMetadata => ({
  stats: {
    [Stats.ATK]: 0,
    [Stats.ATK_P]: 0,
    [Stats.DEF]: 0.25,
    [Stats.DEF_P]: 0.25,
    [Stats.HP]: 1,
    [Stats.HP_P]: 1,
    [Stats.SPD]: 1,
    [Stats.CR]: 0,
    [Stats.CD]: 0,
    [Stats.EHR]: 0,
    [Stats.RES]: 0.50,
    [Stats.BE]: 0,
  },
  parts: {
    [Parts.Body]: [
      Stats.HP_P,
      Stats.OHB,
    ],
    [Parts.Feet]: [
      Stats.HP_P,
      Stats.SPD,
    ],
    [Parts.PlanarSphere]: [
      Stats.HP_P,
    ],
    [Parts.LinkRope]: [
      Stats.HP_P,
      Stats.ERR,
    ],
  },
  presets: [
    PresetEffects.WARRIOR_SET,
  ],
  sortOption: SortOption.ULT_HEAL,
  addedColumns: [
    SortOption.OHB,
  ],
  hiddenColumns: [
    SortOption.SKILL,
    SortOption.ULT,
    SortOption.FUA,
    SortOption.DOT,
  ],
  healSimulation: healSimulation(),
})

const display = {
  imageCenter: {
    x: 1040,
    y: 1024,
    z: 1,
  },
  disableSpine: true,
  showcaseColor: '#7499fb',
}

export const Natasha: CharacterConfig = {
  id: '1105',
  display,
  conditionals,
  get scoring() {
    return scoring()
  },
}

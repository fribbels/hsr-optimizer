import { Sunday } from 'lib/conditionals/character/1300/Sunday'
import { Cerydra } from 'lib/conditionals/character/1400/Cerydra'
import { Phainon } from 'lib/conditionals/character/1400/Phainon'
import {
  AbilityEidolon,
  type Conditionals,
  type ContentDefinition,
  createEnum,
} from 'lib/conditionals/conditionalUtils'
import {
  dynamicStatConversionContainer,
  gpuDynamicStatConversion,
} from 'lib/conditionals/evaluation/statConversion'
import { HitDefinitionBuilder } from 'lib/conditionals/hitDefinitionBuilder'
import { AGroundedAscent } from 'lib/conditionals/lightcone/5star/AGroundedAscent'
import { MomentOfVictory } from 'lib/conditionals/lightcone/5star/MomentOfVictory'
import { EpochEtchedInGoldenBlood } from 'lib/conditionals/lightcone/5star/EpochEtchedInGoldenBlood'
import { ThusBurnsTheDawn } from 'lib/conditionals/lightcone/5star/ThusBurnsTheDawn'
import {
  ConditionalActivation,
  ConditionalType,
  Parts,
  Sets,
  Stats,
} from 'lib/constants/constants'
import { Source } from 'lib/optimization/buffSource'
import { StatKey } from 'lib/optimization/engine/config/keys'
import {
  ElementTag,
  TargetTag,
} from 'lib/optimization/engine/config/tag'
import { type ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import {
  AbilityKind,
  DEFAULT_ULT_SHIELD,
  NULL_TURN_ABILITY_NAME,
} from 'lib/optimization/rotation/turnAbilityConfig'
import { SortOption } from 'lib/optimization/sortOptions'
import {
  SPREAD_ORNAMENTS_2P_SUPPORT,
  SPREAD_RELICS_4P_SHIELD,
} from 'lib/scoring/scoringConstants'
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

export const GepardEntities = createEnum('Gepard')
export const GepardAbilities: AbilityKind[] = [
  AbilityKind.BASIC,
  AbilityKind.SKILL,
  AbilityKind.ULT_SHIELD,
  AbilityKind.BREAK,
]

const conditionals = (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Gepard')
  const { basic, skill, ult } = AbilityEidolon.ULT_TALENT_3_SKILL_BASIC_5
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
  } = Source.character(Gepard.id)

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 2.00, 2.20)

  const ultShieldScaling = ult(e, 0.45, 0.48)
  const ultShieldFlat = ult(e, 600, 667.5)

  const defaults = {
    e4TeamResBuff: true,
  }

  const teammateDefaults = {
    e4TeamResBuff: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    e4TeamResBuff: {
      id: 'e4TeamResBuff',
      formItem: 'switch',
      text: t('Content.e4TeamResBuff.text'),
      content: t('Content.e4TeamResBuff.content'),
      disabled: e < 4,
    },
  }
  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    e4TeamResBuff: content.e4TeamResBuff,
  }

  return {
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,

    entityDeclaration: () => Object.values(GepardEntities),
    entityDefinition: (action: OptimizerAction, context: OptimizerContext) => ({
      [GepardEntities.Gepard]: {
        primary: true,
        summon: false,
        memosprite: false,
      },
    }),

    actionDeclaration: () => [...GepardAbilities],
    actionDefinition: (action: OptimizerAction, context: OptimizerContext) => ({
      [AbilityKind.BASIC]: {
        hits: [
          HitDefinitionBuilder.standardBasic()
            .damageElement(ElementTag.Ice)
            .atkScaling(basicScaling)
            .toughnessDmg(10)
            .build(),
        ],
      },
      [AbilityKind.SKILL]: {
        hits: [
          HitDefinitionBuilder.standardSkill()
            .damageElement(ElementTag.Ice)
            .atkScaling(skillScaling)
            .toughnessDmg(20)
            .build(),
        ],
      },
      [AbilityKind.ULT_SHIELD]: {
        hits: [
          HitDefinitionBuilder.ultShield()
            .defScaling(ultShieldScaling)
            .flatShield(ultShieldFlat)
            .build(),
        ],
      },
      [AbilityKind.BREAK]: {
        hits: [
          HitDefinitionBuilder.standardBreak(ElementTag.Ice).build(),
        ],
      },
    }),
    actionModifiers: () => [],

    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
    },

    precomputeMutualEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      x.buff(StatKey.RES, (e >= 4 && m.e4TeamResBuff) ? 0.20 : 0, x.targets(TargetTag.FullTeam).source(SOURCE_E4))
    },

    finalizeCalculations: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
    },
    newGpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => '',

    dynamicConditionals: [
      {
        id: 'GepardConversionConditional',
        type: ConditionalType.ABILITY,
        activation: ConditionalActivation.CONTINUOUS,
        dependsOn: [Stats.DEF],
        chainsTo: [Stats.ATK],
        condition: function(x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) {
          return true
        },
        effect: function(x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) {
          dynamicStatConversionContainer(Stats.DEF, Stats.ATK, this, x, action, context, SOURCE_TRACE, (convertibleValue) => convertibleValue * 0.35)
        },
        gpu: function(action: OptimizerAction, context: OptimizerContext) {
          return gpuDynamicStatConversion(Stats.DEF, Stats.ATK, this, action, context, `0.35 * convertibleValue`, `true`)
        },
      },
    ],
  }
}

const shieldSimulation = (): SimulationMetadata => ({
  parts: {
    [Parts.Body]: [Stats.DEF_P],
    [Parts.Feet]: [Stats.DEF_P, Stats.SPD],
    [Parts.PlanarSphere]: [Stats.DEF_P],
    [Parts.LinkRope]: [Stats.DEF_P],
  },
  substats: [
    Stats.DEF_P,
    Stats.DEF,
    Stats.SPD,
    Stats.RES,
    Stats.HP_P,
  ],
  errRopeEidolon: 0,
  comboTurnAbilities: [
    NULL_TURN_ABILITY_NAME,
    DEFAULT_ULT_SHIELD,
  ],
  relicSets: [
    [Sets.SelfEnshroudedRecluse, Sets.SelfEnshroudedRecluse],
    ...SPREAD_RELICS_4P_SHIELD,
  ],
  ornamentSets: [
    Sets.LushakaTheSunkenSeas,
    ...SPREAD_ORNAMENTS_2P_SUPPORT,
  ],
  teammates: [
    {
      characterId: Phainon.id,
      lightCone: ThusBurnsTheDawn.id,
      characterEidolon: 0,
      lightConeSuperimposition: 1,
    },
    {
      characterId: Cerydra.id,
      lightCone: EpochEtchedInGoldenBlood.id,
      characterEidolon: 0,
      lightConeSuperimposition: 1,
    },
    {
      characterId: Sunday.id,
      lightCone: AGroundedAscent.id,
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
    [Stats.DEF]: 1,
    [Stats.DEF_P]: 1,
    [Stats.HP]: 0.25,
    [Stats.HP_P]: 0.25,
    [Stats.SPD]: 1,
    [Stats.CR]: 0,
    [Stats.CD]: 0,
    [Stats.EHR]: 0.75,
    [Stats.RES]: 0.50,
    [Stats.BE]: 0,
  },
  parts: {
    [Parts.Body]: [
      Stats.DEF_P,
    ],
    [Parts.Feet]: [
      Stats.DEF_P,
      Stats.SPD,
    ],
    [Parts.PlanarSphere]: [
      Stats.DEF_P,
    ],
    [Parts.LinkRope]: [
      Stats.DEF_P,
      Stats.ERR,
    ],
  },
  presets: [],
  sortOption: SortOption.ULT_SHIELD,
  addedColumns: [],
  hiddenColumns: [
    SortOption.ULT,
    SortOption.FUA,
    SortOption.DOT,
  ],
  shieldSimulation: shieldSimulation(),
})

const display = {
  imageCenter: {
    x: 1150,
    y: 1110,
    z: 1,
  },
  disableSpine: true,
  showcaseColor: '#5375e6',
}

export const Gepard: CharacterConfig = {
  id: '1104',
  defaultLightCone: MomentOfVictory.id,
  display,
  conditionals,
  get scoring() {
    return scoring()
  },
}

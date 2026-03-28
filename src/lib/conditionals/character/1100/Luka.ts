import { Fugue } from 'lib/conditionals/character/1200/Fugue'
import { Lingsha } from 'lib/conditionals/character/1200/Lingsha'
import { RuanMei } from 'lib/conditionals/character/1300/RuanMei'
import {
  AbilityEidolon,
  type Conditionals,
  type ContentDefinition,
  createEnum,
} from 'lib/conditionals/conditionalUtils'
import { HitDefinitionBuilder } from 'lib/conditionals/hitDefinitionBuilder'
import { LongRoadLeadsHome } from 'lib/conditionals/lightcone/5star/LongRoadLeadsHome'
import { PastSelfInTheMirror } from 'lib/conditionals/lightcone/5star/PastSelfInTheMirror'
import { ScentAloneStaysTrue } from 'lib/conditionals/lightcone/5star/ScentAloneStaysTrue'
import {
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
  DEFAULT_DOT,
  DEFAULT_SKILL,
  END_BREAK,
  END_DOT,
  NULL_TURN_ABILITY_NAME,
  START_BASIC,
  START_ULT,
} from 'lib/optimization/rotation/turnAbilityConfig'
import { SortOption } from 'lib/optimization/sortOptions'
import { PresetEffects } from 'lib/scoring/presetEffects'
import {
  RELICS_2P_BREAK_EFFECT_SPEED,
  SPREAD_RELICS_4P_GENERAL_CONDITIONALS,
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
import { precisionRound } from 'lib/utils/mathUtils'

export const LukaEntities = createEnum('Luka')
export const LukaAbilities: AbilityKind[] = [
  AbilityKind.BASIC,
  AbilityKind.SKILL,
  AbilityKind.ULT,
  AbilityKind.DOT,
  AbilityKind.BREAK,
]

const conditionals = (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Luka')
  const tDot = wrappedFixedT(withContent).get(null, 'conditionals', 'Common.DotTickCoefficient')
  const { basic, skill, ult } = AbilityEidolon.SKILL_TALENT_3_ULT_BASIC_5
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
  } = Source.character(Luka.id)

  const basicEnhancedHitValue = basic(e, 0.20, 0.22)
  const targetUltDebuffDmgTakenValue = ult(e, 0.20, 0.216)

  const basicScaling = basic(e, 1.00, 1.10)
  const basicEnhancedScaling = basic(e, 0.20 * 3 + 0.80, 0.22 * 3 + 0.88)
  const skillScaling = skill(e, 1.20, 1.32)
  const ultScaling = ult(e, 3.30, 3.564)
  const dotScaling = skill(e, 3.38, 3.718)

  const defaults = {
    dotTickCoefficient: 1,
    basicEnhanced: true,
    targetUltDebuffed: true,
    e1TargetBleeding: true,
    basicEnhancedExtraHits: 3,
    e4TalentStacks: 4,
  }

  const teammateDefaults = {
    targetUltDebuffed: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    basicEnhanced: {
      id: 'basicEnhanced',
      formItem: 'switch',
      text: t('Content.basicEnhanced.text'),
      content: t('Content.basicEnhanced.content'),
    },
    targetUltDebuffed: {
      id: 'targetUltDebuffed',
      formItem: 'switch',
      text: t('Content.targetUltDebuffed.text'),
      content: t('Content.targetUltDebuffed.content', { targetUltDebuffDmgTakenValue: precisionRound(100 * targetUltDebuffDmgTakenValue) }),
    },
    basicEnhancedExtraHits: {
      id: 'basicEnhancedExtraHits',
      formItem: 'slider',
      text: t('Content.basicEnhancedExtraHits.text'),
      content: t('Content.basicEnhancedExtraHits.content'),
      min: 0,
      max: 3,
    },
    dotTickCoefficient: {
      id: 'dotTickCoefficient',
      formItem: 'slider',
      text: tDot('Text'),
      content: tDot('Content'),
      min: 0,
      max: 5,
      percent: true,
    },
    e1TargetBleeding: {
      id: 'e1TargetBleeding',
      formItem: 'switch',
      text: t('Content.e1TargetBleeding.text'),
      content: t('Content.e1TargetBleeding.content'),
      disabled: e < 1,
    },
    e4TalentStacks: {
      id: 'e4TalentStacks',
      formItem: 'slider',
      text: t('Content.e4TalentStacks.text'),
      content: t('Content.e4TalentStacks.content'),
      min: 0,
      max: 4,
      disabled: e < 4,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    targetUltDebuffed: content.targetUltDebuffed,
  }

  return {
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,

    entityDeclaration: () => Object.values(LukaEntities),
    entityDefinition: (action: OptimizerAction, context: OptimizerContext) => ({
      [LukaEntities.Luka]: {
        primary: true,
        summon: false,
        memosprite: false,
      },
    }),

    actionDeclaration: () => [...LukaAbilities],
    actionDefinition: (action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      const basicAtkScaling = (r.basicEnhanced)
        ? basicEnhancedScaling + r.basicEnhancedExtraHits * basicEnhancedHitValue
        : basicScaling

      return {
        [AbilityKind.BASIC]: {
          hits: [
            HitDefinitionBuilder.standardBasic()
              .damageElement(ElementTag.Physical)
              .atkScaling(basicAtkScaling)
              .toughnessDmg((r.basicEnhanced) ? 20 : 10)
              .build(),
          ],
        },
        [AbilityKind.SKILL]: {
          hits: [
            HitDefinitionBuilder.standardSkill()
              .damageElement(ElementTag.Physical)
              .atkScaling(skillScaling)
              .toughnessDmg(20)
              .build(),
          ],
        },
        [AbilityKind.ULT]: {
          hits: [
            HitDefinitionBuilder.standardUlt()
              .damageElement(ElementTag.Physical)
              .atkScaling(ultScaling)
              .toughnessDmg(30)
              .build(),
          ],
        },
        [AbilityKind.DOT]: {
          hits: [
            HitDefinitionBuilder.standardDot()
              .damageElement(ElementTag.Physical)
              .atkScaling(dotScaling)
              .dotBaseChance(1.00)
              .dotTickCoefficient(r.dotTickCoefficient)
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
      const r = action.characterConditionals as Conditionals<typeof content>

      x.buff(StatKey.ATK_P, (e >= 4) ? r.e4TalentStacks * 0.05 : 0, x.source(SOURCE_E4))
      x.buff(StatKey.DMG_BOOST, (e >= 1 && r.e1TargetBleeding) ? 0.15 : 0, x.source(SOURCE_E1))
    },

    precomputeMutualEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      x.buff(StatKey.VULNERABILITY, (m.targetUltDebuffed) ? targetUltDebuffDmgTakenValue : 0, x.targets(TargetTag.FullTeam).source(SOURCE_ULT))
    },

    finalizeCalculations: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
    },
    newGpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => '',
  }
}

const simulation = (): SimulationMetadata => ({
  parts: {
    [Parts.Body]: [
      Stats.ATK_P,
    ],
    [Parts.Feet]: [
      Stats.ATK_P,
      Stats.SPD,
    ],
    [Parts.PlanarSphere]: [
      Stats.ATK_P,
      Stats.Physical_DMG,
    ],
    [Parts.LinkRope]: [
      Stats.ATK_P,
      Stats.BE,
    ],
  },
  substats: [
    Stats.BE,
    Stats.ATK_P,
    Stats.ATK,
    Stats.EHR,
    Stats.CR,
  ],
  comboTurnAbilities: [
    NULL_TURN_ABILITY_NAME,
    START_ULT,
    DEFAULT_SKILL,
    END_BREAK,
    DEFAULT_DOT,
    START_BASIC,
    END_DOT,
    DEFAULT_DOT,
    START_BASIC,
    END_DOT,
    DEFAULT_DOT,
  ],
  relicSets: [
    [Sets.PrisonerInDeepConfinement, Sets.PrisonerInDeepConfinement],
    ...SPREAD_RELICS_4P_GENERAL_CONDITIONALS,
    RELICS_2P_BREAK_EFFECT_SPEED,
  ],
  ornamentSets: [
    Sets.TaliaKingdomOfBanditry,
    Sets.FirmamentFrontlineGlamoth,
    Sets.RevelryByTheSea,
  ],
  teammates: [
    {
      characterId: Fugue.id,
      lightCone: LongRoadLeadsHome.id,
      characterEidolon: 0,
      lightConeSuperimposition: 1,
    },
    {
      characterId: RuanMei.id,
      lightCone: PastSelfInTheMirror.id,
      characterEidolon: 0,
      lightConeSuperimposition: 1,
    },
    {
      characterId: Lingsha.id,
      lightCone: ScentAloneStaysTrue.id,
      characterEidolon: 0,
      lightConeSuperimposition: 1,
    },
  ],
})

const scoring = (): ScoringMetadata => ({
  stats: {
    [Stats.ATK]: 1,
    [Stats.ATK_P]: 1,
    [Stats.DEF]: 0,
    [Stats.DEF_P]: 0,
    [Stats.HP]: 0,
    [Stats.HP_P]: 0,
    [Stats.SPD]: 1,
    [Stats.CR]: 0,
    [Stats.CD]: 0,
    [Stats.EHR]: 1,
    [Stats.RES]: 0,
    [Stats.BE]: 1,
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
      Stats.Physical_DMG,
    ],
    [Parts.LinkRope]: [
      Stats.ATK_P,
      Stats.BE,
    ],
  },
  presets: [
    PresetEffects.PRISONER_SET,
  ],
  sortOption: SortOption.DOT,
  hiddenColumns: [
    SortOption.FUA,
  ],
  simulation: simulation(),
})

const display = {
  imageCenter: {
    x: 930,
    y: 1000,
    z: 1,
  },
  spineCenter: {
    x: 1016,
    y: 1027,
    z: 1.08,
  },
  showcaseColor: '#bc81e3',
}

export const Luka: CharacterConfig = {
  id: '1111',
  display,
  conditionals,
  get scoring() {
    return scoring()
  },
}

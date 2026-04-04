import { Lingsha } from 'lib/conditionals/character/1200/Lingsha'
import { Firefly } from 'lib/conditionals/character/1300/Firefly'
import { TheDahlia } from 'lib/conditionals/character/1300/TheDahlia'
import {
  AbilityEidolon,
  addSuperBreakHits,
  type Conditionals,
  type ContentDefinition,
  createEnum,
} from 'lib/conditionals/conditionalUtils'
import { HitDefinitionBuilder } from 'lib/conditionals/hitDefinitionBuilder'
import { NeverForgetHerFlame } from 'lib/conditionals/lightcone/5star/NeverForgetHerFlame'
import { ScentAloneStaysTrue } from 'lib/conditionals/lightcone/5star/ScentAloneStaysTrue'
import { WhereaboutsShouldDreamsRest } from 'lib/conditionals/lightcone/5star/WhereaboutsShouldDreamsRest'
import {
  Parts,
  Sets,
  Stats,
} from 'lib/constants/constants'
import { Source } from 'lib/optimization/buffSource'
import { type ModifierContext } from 'lib/optimization/context/calculateActions'
import { StatKey } from 'lib/optimization/engine/config/keys'
import {
  DamageTag,
  ElementTag,
  TargetTag,
} from 'lib/optimization/engine/config/tag'
import { type ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import {
  AbilityKind,
  DEFAULT_BASIC,
  END_BREAK,
  NULL_TURN_ABILITY_NAME,
  START_BASIC,
  START_ULT,
} from 'lib/optimization/rotation/turnAbilityConfig'
import { SortOption } from 'lib/optimization/sortOptions'
import {
  SPREAD_ORNAMENTS_2P_ENERGY_REGEN,
  SPREAD_ORNAMENTS_2P_SUPPORT,
  SPREAD_RELICS_4P_GENERAL_CONDITIONALS,
} from 'lib/scoring/scoringConstants'
import { relics2pByStats } from 'lib/sets/setConfigRegistry'
import { wrappedFixedT } from 'lib/utils/i18nUtils'

import { type Eidolon } from 'types/character'
import { type CharacterConfig } from 'types/characterConfig'
import { type CharacterConditionalsController } from 'types/conditionals'
import { HitDefinition } from 'types/hitConditionalTypes'
import {
  type ScoringMetadata,
  type SimulationMetadata,
} from 'types/metadata'
import {
  type OptimizerAction,
  type OptimizerContext,
} from 'types/optimizer'
import { precisionRound } from 'lib/utils/mathUtils'

export const FugueEntities = createEnum('Fugue')
export const FugueAbilities: AbilityKind[] = [
  AbilityKind.BASIC,
  AbilityKind.ULT,
  AbilityKind.BREAK,
]

const conditionals = (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Fugue')
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
  } = Source.character('1225')

  const skillBeValue = skill(e, 0.30, 0.33)
  const skillDefPenValue = skill(e, 0.18, 0.20)

  const basicScaling = basic(e, 1.00, 1.10)
  const ultScaling = ult(e, 2.00, 2.20)
  const superBreakScaling = talent(e, 1.00, 1.10)

  const defaults = {
    torridScorch: true,
    foxianPrayer: false,
    defReduction: true,
    superBreakDmg: true,
    e4BreakDmg: true,
    e6BreakEfficiency: true,
  }

  const teammateDefaults = {
    foxianPrayer: true,
    be220Buff: true,
    weaknessBreakBeStacks: 2,
    defReduction: true,
    superBreakDmg: true,
    e4BreakDmg: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    torridScorch: {
      id: 'torridScorch',
      formItem: 'switch',
      text: t('Content.torridScorch.text'),
      content: t('Content.torridScorch.content'),
    },
    foxianPrayer: {
      id: 'foxianPrayer',
      formItem: 'switch',
      text: t('Content.foxianPrayer.text'),
      content: t('Content.foxianPrayer.content', { BreakBuff: precisionRound(100 * skillBeValue) }),
    },
    defReduction: {
      id: 'defReduction',
      formItem: 'switch',
      text: t('Content.defReduction.text'),
      content: t('Content.defReduction.content', { DefShred: precisionRound(100 * skillDefPenValue) }),
    },
    superBreakDmg: {
      id: 'superBreakDmg',
      formItem: 'switch',
      text: t('Content.superBreakDmg.text'),
      content: t('Content.superBreakDmg.content', { SuperBreakMultiplier: precisionRound(100 * superBreakScaling) }),
    },
    e4BreakDmg: {
      id: 'e4BreakDmg',
      formItem: 'switch',
      text: t('Content.e4BreakDmg.text'),
      content: t('Content.e4BreakDmg.content'),
      disabled: e < 4,
    },
    e6BreakEfficiency: {
      id: 'e6BreakEfficiency',
      formItem: 'switch',
      text: t('Content.e6BreakEfficiency.text'),
      content: t('Content.e6BreakEfficiency.content'),
      disabled: e < 6,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    foxianPrayer: content.foxianPrayer,
    be220Buff: {
      id: 'be220Buff',
      formItem: 'switch',
      text: t('TeammateContent.be220Buff.text'),
      content: t('TeammateContent.be220Buff.content'),
    },
    weaknessBreakBeStacks: {
      id: 'weaknessBreakBeStacks',
      formItem: 'slider',
      text: t('TeammateContent.weaknessBreakBeStacks.text'),
      content: t('TeammateContent.weaknessBreakBeStacks.content'),
      min: 0,
      max: 2,
    },
    defReduction: content.defReduction,
    superBreakDmg: content.superBreakDmg,
    e4BreakDmg: content.e4BreakDmg,
  }

  return {
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,

    entityDeclaration: () => Object.values(FugueEntities),
    entityDefinition: (action: OptimizerAction, context: OptimizerContext) => ({
      [FugueEntities.Fugue]: {
        primary: true,
        summon: false,
        memosprite: false,
      },
    }),

    actionDeclaration: () => [...FugueAbilities],
    actionDefinition: (action: OptimizerAction, context: OptimizerContext) => ({
      [AbilityKind.BASIC]: {
        hits: [
          HitDefinitionBuilder.standardBasic()
            .damageElement(ElementTag.Fire)
            .atkScaling(basicScaling)
            .build(),
        ],
      },
      [AbilityKind.ULT]: {
        hits: [
          HitDefinitionBuilder.standardUlt()
            .damageElement(ElementTag.Fire)
            .atkScaling(ultScaling)
            .build(),
        ],
      },
      [AbilityKind.BREAK]: {
        hits: [
          HitDefinitionBuilder.standardBreak(ElementTag.Fire).build(),
        ],
      },
    }),
    actionModifiers() {
      return [
        {
          modify: (action: OptimizerAction, context: OptimizerContext, _self: ModifierContext) => {
            addSuperBreakHits(action.hits!)
          },
        },
      ]
    },

    initializeConfigurationsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>
      if (r.superBreakDmg) {
        action.config.enemyWeaknessBroken = true
      }
    },

    initializeTeammateConfigurationsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>
      if (r.superBreakDmg) {
        action.config.enemyWeaknessBroken = true
      }
    },

    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      x.buff(StatKey.BE, 0.30, x.source(SOURCE_TRACE))
      x.buff(StatKey.BREAK_EFFICIENCY_BOOST, (e >= 6 && r.e6BreakEfficiency) ? 0.50 : 0, x.source(SOURCE_E6))
    },

    precomputeMutualEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      x.buff(StatKey.BE, (m.foxianPrayer) ? skillBeValue : 0, x.targets(TargetTag.SingleTarget).source(SOURCE_SKILL))
      x.buff(StatKey.BREAK_EFFICIENCY_BOOST, (e >= 1 && m.foxianPrayer) ? 0.50 : 0, x.targets(TargetTag.SingleTarget).source(SOURCE_E1))

      x.buff(StatKey.SUPER_BREAK_MODIFIER, (m.superBreakDmg) ? superBreakScaling : 0, x.targets(TargetTag.FullTeam).source(SOURCE_TALENT))
      x.buff(StatKey.DEF_PEN, (m.defReduction) ? skillDefPenValue : 0, x.targets(TargetTag.FullTeam).source(SOURCE_SKILL))
      x.buff(
        StatKey.DMG_BOOST,
        (e >= 4 && m.foxianPrayer && m.e4BreakDmg) ? 0.20 : 0,
        x.damageType(DamageTag.BREAK).targets(TargetTag.SingleTarget).source(SOURCE_E4),
      )
    },

    precomputeTeammateEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const t = action.characterConditionals as Conditionals<typeof teammateContent>

      x.buff(StatKey.BE, t.weaknessBreakBeStacks * (0.06 + (t.be220Buff ? 0.12 : 0)), x.targets(TargetTag.FullTeam).source(SOURCE_TRACE))
    },

    finalizeCalculations: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {},
  }
}

const simulation = (): SimulationMetadata => ({
  parts: {
    [Parts.Body]: [
      Stats.CR,
      Stats.ATK_P,
      Stats.EHR,
    ],
    [Parts.Feet]: [
      Stats.SPD,
      Stats.ATK_P,
    ],
    [Parts.PlanarSphere]: [
      Stats.ATK_P,
      Stats.Fire_DMG,
    ],
    [Parts.LinkRope]: [
      Stats.BE,
    ],
  },
  substats: [
    Stats.BE,
    Stats.ATK_P,
    Stats.CR,
    Stats.CD,
    Stats.EHR,
  ],
  errRopeEidolon: 0,
  breakpoints: {
    [Stats.EHR]: 0.67,
  },
  comboTurnAbilities: [
    NULL_TURN_ABILITY_NAME,
    START_ULT,
    DEFAULT_BASIC,
    END_BREAK,
    START_BASIC,
    END_BREAK,
    START_BASIC,
    END_BREAK,
  ],
  deprioritizeBuffs: true,
  relicSets: [
    [Sets.ThiefOfShootingMeteor, Sets.ThiefOfShootingMeteor],
    [Sets.EagleOfTwilightLine, Sets.EagleOfTwilightLine],
    relics2pByStats(Stats.BE, Stats.SPD_P),
    ...SPREAD_RELICS_4P_GENERAL_CONDITIONALS,
  ],
  ornamentSets: [
    Sets.ForgeOfTheKalpagniLantern,
    Sets.TaliaKingdomOfBanditry,
    ...SPREAD_ORNAMENTS_2P_ENERGY_REGEN,
    ...SPREAD_ORNAMENTS_2P_SUPPORT,
  ],
  teammates: [
    {
      characterId: Firefly.id,
      lightCone: WhereaboutsShouldDreamsRest.id,
      characterEidolon: 0,
      lightConeSuperimposition: 1,
    },
    {
      characterId: TheDahlia.id,
      lightCone: NeverForgetHerFlame.id,
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
    [Stats.ATK]: 0,
    [Stats.ATK_P]: 0,
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
    [Parts.Body]: [],
    [Parts.Feet]: [
      Stats.SPD,
    ],
    [Parts.PlanarSphere]: [],
    [Parts.LinkRope]: [
      Stats.ERR,
      Stats.BE,
    ],
  },
  presets: [],
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
    x: 875,
    y: 1125,
    z: 1.15,
  },
  showcaseColor: '#eb7289',
}

export const Fugue: CharacterConfig = {
  id: '1225',
  display,
  conditionals,
  get scoring() {
    return scoring()
  },
}

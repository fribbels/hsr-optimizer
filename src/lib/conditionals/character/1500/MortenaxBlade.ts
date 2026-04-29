import i18next from 'i18next'
import { Hyacine } from 'lib/conditionals/character/1400/Hyacine'
import { Tribbie } from 'lib/conditionals/character/1400/Tribbie'
import { Ashveil } from 'lib/conditionals/character/1500/Ashveil'
import {
  AbilityEidolon,
  type Conditionals,
  type ContentDefinition,
  countTeamPath,
  createEnum,
} from 'lib/conditionals/conditionalUtils'
import { HitDefinitionBuilder } from 'lib/conditionals/hitDefinitionBuilder'
import { IfTimeWereAFlower } from 'lib/conditionals/lightcone/5star/IfTimeWereAFlower'
import { MayRainbowsRemainInTheSky } from 'lib/conditionals/lightcone/5star/MayRainbowsRemainInTheSky'
import { TheFinaleOfALie } from 'lib/conditionals/lightcone/5star/TheFinaleOfALie'
import {
  Parts,
  PathNames,
  Sets,
  Stats,
} from 'lib/constants/constants'
import { CURRENT_DATA_VERSION } from 'lib/constants/constants'
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
  DEFAULT_FUA,
  DEFAULT_SKILL,
  DEFAULT_ULT,
  END_SKILL,
  NULL_TURN_ABILITY_NAME,
  START_ULT,
  WHOLE_SKILL,
} from 'lib/optimization/rotation/turnAbilityConfig'
import { SortOption } from 'lib/optimization/sortOptions'
import { PresetEffects } from 'lib/scoring/presetEffects'
import {
  SPREAD_ORNAMENTS_2P_FUA,
  SPREAD_ORNAMENTS_2P_GENERAL_CONDITIONALS,
  SPREAD_RELICS_4P_GENERAL_CONDITIONALS,
} from 'lib/scoring/scoringConstants'
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

export const MortenaxBladeEntities = createEnum('MortenaxBlade')
export const MortenaxBladeAbilities: AbilityKind[] = [
  AbilityKind.BASIC,
  AbilityKind.SKILL,
  AbilityKind.ULT,
  AbilityKind.FUA,
  AbilityKind.BREAK,
]

const conditionals = (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const betaContent = i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION })
  const { basic, skill, ult, talent } = AbilityEidolon.ULT_TALENT_3_SKILL_BASIC_5
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
  } = Source.character('1507')

  const basicScaling = basic(e, 0.50, 0.55)
  const enhancedBasicScaling = basic(e, 1.00, 1.10)

  const skillAoeScaling = skill(e, 0.72, 0.792)
  const skillBounceScaling = skill(e, 0.24, 0.264)
  const skillBounceCount = 4

  const enhancedUltScaling = ult(e, 3.00, 3.24)
  const ultDefReductionValue = ult(e, 0.30, 0.32)
  const ultVulnerabilityValue = ult(e, 0.50, 0.54)
  const ultCrBuffValue = 0.20
  const ultCdBuffValue = ult(e, 0.60, 0.66)

  const traceAllyDmgBoostValue = 0.50
  const traceNihilityUltDmgBoostValue = 0.50
  const traceNonNihilityFuaDmgBoostValue = 0.50

  const e2FuaDmgBoost = (e >= 2) ? 0.50 : 0
  const e4AllyDmgBoost = (e >= 4) ? 0.50 : 0

  const defaults = {
    infiniteFuryActive: true,
    ultZone: true,
    e1ResPen: true,
    e2FuaDmgBoost: true,
    e4DmgBoost: true,
    e6EnhancedUlt: true,
  }

  const teammateDefaults = {
    ultZone: true,
    e1ResPen: true,
    e2FuaDmgBoost: true,
    e4DmgBoost: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    infiniteFuryActive: {
      id: 'infiniteFuryActive',
      formItem: 'switch',
      text: 'Infinite Fury state',
      content: betaContent,
    },
    ultZone: {
      id: 'ultZone',
      formItem: 'switch',
      text: 'Zone active',
      content: betaContent,
    },
    e1ResPen: {
      id: 'e1ResPen',
      formItem: 'switch',
      text: 'E1 RES PEN',
      content: betaContent,
      disabled: e < 1,
    },
    e2FuaDmgBoost: {
      id: 'e2FuaDmgBoost',
      formItem: 'switch',
      text: 'E2 buffs',
      content: betaContent,
      disabled: e < 2,
    },
    e4DmgBoost: {
      id: 'e4DmgBoost',
      formItem: 'switch',
      text: 'E4 DMG boost',
      content: betaContent,
      disabled: e < 4,
    },
    e6EnhancedUlt: {
      id: 'e6EnhancedUlt',
      formItem: 'switch',
      text: 'E6 Ult Final DMG',
      content: betaContent,
      disabled: e < 6,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    ultZone: content.ultZone,
    e1ResPen: content.e1ResPen,
    e2FuaDmgBoost: content.e2FuaDmgBoost,
    e4DmgBoost: content.e4DmgBoost,
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    teammateContent: () => Object.values(teammateContent),
    teammateDefaults: () => teammateDefaults,

    entityDeclaration: () => Object.values(MortenaxBladeEntities),
    entityDefinition: (action: OptimizerAction, context: OptimizerContext) => ({
      [MortenaxBladeEntities.MortenaxBlade]: {
        primary: true,
        summon: false,
        memosprite: false,
      },
    }),

    actionDeclaration: () => [...MortenaxBladeAbilities],
    actionDefinition: (action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      const currentBasicScaling = r.infiniteFuryActive ? enhancedBasicScaling : basicScaling

      const skillTotalHpScaling = skillAoeScaling + skillBounceScaling * skillBounceCount / context.enemyCount
      const skillToughness = 10 + 5 * skillBounceCount / context.enemyCount

      const enhancedUltTotalScaling = enhancedUltScaling * ((e >= 6 && r.e6EnhancedUlt) ? 1.50 : 1)

      const fuaTotalHpScaling = skillAoeScaling + skillBounceScaling * skillBounceCount / context.enemyCount
      const fuaToughness = 10 + 5 * skillBounceCount / context.enemyCount

      return {
        [AbilityKind.BASIC]: {
          hits: [
            HitDefinitionBuilder.standardBasic()
              .damageElement(ElementTag.Fire)
              .hpScaling(currentBasicScaling)
              .toughnessDmg(10)
              .build(),
          ],
        },
        [AbilityKind.SKILL]: {
          hits: [
            HitDefinitionBuilder.standardSkill()
              .damageElement(ElementTag.Fire)
              .hpScaling(skillTotalHpScaling)
              .toughnessDmg(skillToughness)
              .build(),
          ],
        },
        [AbilityKind.ULT]: {
          hits: [
            HitDefinitionBuilder.standardUlt()
              .damageElement(ElementTag.Fire)
              .hpScaling(r.infiniteFuryActive ? enhancedUltTotalScaling : 0)
              .toughnessDmg(r.infiniteFuryActive ? 20 : 0)
              .build(),
          ],
        },
        [AbilityKind.FUA]: {
          hits: [
            // Dual-typed SKILL|FUA from Talent triggering Skill as Follow-Up ATK
            HitDefinitionBuilder.standardFua()
              .damageElement(ElementTag.Fire)
              .damageType(DamageTag.SKILL | DamageTag.FUA)
              .hpScaling(fuaTotalHpScaling)
              .toughnessDmg(fuaToughness)
              .build(),
          ],
        },
        [AbilityKind.BREAK]: {
          hits: [
            HitDefinitionBuilder.standardBreak(ElementTag.Fire).build(),
          ],
        },
      }
    },

    // E2: Ally Ults gain FUA typing
    actionModifiers() {
      if (e < 2) return []
      return [{
        modify: (action: OptimizerAction, context: OptimizerContext, self: ModifierContext) => {
          if (action.actionType !== AbilityKind.ULT) return
          const m = self.ownConditionals as Conditionals<typeof teammateContent>
          if (!m.ultZone || !m.e2FuaDmgBoost) return
          for (const hit of action.hits!) {
            hit.damageType |= DamageTag.FUA
          }
        },
      }]
    },

    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      x.buff(StatKey.CR, r.infiniteFuryActive ? ultCrBuffValue : 0, x.source(SOURCE_ULT))
      x.buff(StatKey.CD, r.infiniteFuryActive ? ultCdBuffValue : 0, x.source(SOURCE_ULT))
      x.buff(StatKey.DMG_BOOST, (e >= 2 && r.e2FuaDmgBoost) ? e2FuaDmgBoost : 0, x.damageType(DamageTag.FUA).source(SOURCE_E2))
    },

    precomputeMutualEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      x.buff(StatKey.DEF_PEN, m.ultZone ? ultDefReductionValue : 0, x.targets(TargetTag.FullTeam).source(SOURCE_ULT))
      x.buff(StatKey.VULNERABILITY, m.ultZone ? ultVulnerabilityValue : 0, x.targets(TargetTag.FullTeam).source(SOURCE_ULT))

      x.buff(StatKey.DMG_BOOST, m.ultZone ? traceAllyDmgBoostValue : 0, x.targets(TargetTag.FullTeam).source(SOURCE_TRACE))
      x.buff(StatKey.DMG_BOOST, (e >= 4 && m.ultZone && m.e4DmgBoost) ? e4AllyDmgBoost : 0, x.targets(TargetTag.FullTeam).source(SOURCE_E4))

      // A3 branch: Nihility teammates present → ULT DMG +50%, otherwise → FUA DMG +50%
      const nihilityCount = countTeamPath(context, PathNames.Nihility)
      const hasOtherNihility = nihilityCount >= 2
      if (m.ultZone && hasOtherNihility) {
        x.buff(StatKey.DMG_BOOST, traceNihilityUltDmgBoostValue, x.damageType(DamageTag.ULT).targets(TargetTag.FullTeam).source(SOURCE_TRACE))
      }
      if (m.ultZone && !hasOtherNihility) {
        x.buff(StatKey.DMG_BOOST, traceNonNihilityFuaDmgBoostValue, x.damageType(DamageTag.FUA).targets(TargetTag.FullTeam).source(SOURCE_TRACE))
      }

      x.buff(StatKey.RES_PEN, (e >= 1 && m.ultZone && m.e1ResPen) ? 0.20 : 0, x.targets(TargetTag.FullTeam).source(SOURCE_E1))
    },

    precomputeTeammateEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
    },

    finalizeCalculations: () => {},
    newGpuFinalizeCalculations: () => '',

    dynamicConditionals: [],
  }
}

const simulation = (): SimulationMetadata => ({
  parts: {
    [Parts.Body]: [
      Stats.CD,
      Stats.CR,
    ],
    [Parts.Feet]: [
      Stats.HP_P,
      Stats.SPD,
    ],
    [Parts.PlanarSphere]: [
      Stats.HP_P,
      Stats.Fire_DMG,
    ],
    [Parts.LinkRope]: [
      Stats.HP_P,
    ],
  },
  substats: [
    Stats.CD,
    Stats.CR,
    Stats.HP_P,
    Stats.HP,
    Stats.SPD,
  ],
  comboTurnAbilities: [
    NULL_TURN_ABILITY_NAME,
    START_ULT,
    END_SKILL,
    DEFAULT_FUA,
    DEFAULT_FUA,
    WHOLE_SKILL,
  ],
  deprioritizeBuffs: true,
  relicSets: [
    [Sets.DivineQueryingMasterSmith, Sets.DivineQueryingMasterSmith],
    ...SPREAD_RELICS_4P_GENERAL_CONDITIONALS,
  ],
  ornamentSets: [
    Sets.BoneCollectionsSereneDemesne,
    ...SPREAD_ORNAMENTS_2P_FUA,
    ...SPREAD_ORNAMENTS_2P_GENERAL_CONDITIONALS,
  ],
  teammates: [
    {
      characterId: Ashveil.id,
      lightCone: TheFinaleOfALie.id,
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
      characterId: Hyacine.id,
      lightCone: MayRainbowsRemainInTheSky.id,
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
    [Stats.HP]: 1,
    [Stats.HP_P]: 1,
    [Stats.SPD]: 1,
    [Stats.CR]: 1,
    [Stats.CD]: 1,
    [Stats.EHR]: 0,
    [Stats.RES]: 0,
    [Stats.BE]: 0,
  },
  parts: {
    [Parts.Body]: [
      Stats.CD,
      Stats.CR,
    ],
    [Parts.Feet]: [
      Stats.SPD,
      Stats.HP_P,
    ],
    [Parts.PlanarSphere]: [
      Stats.Fire_DMG,
      Stats.HP_P,
    ],
    [Parts.LinkRope]: [
      Stats.HP_P,
    ],
  },
  presets: [
    PresetEffects.fnPioneerSet(4),
    PresetEffects.VALOROUS_SET,
  ],
  sortOption: SortOption.FUA,
  hiddenColumns: [
    SortOption.DOT,
  ],
  simulation: simulation(),
})

const display = {
  imageCenter: { x: 1040, y: 1002, z: 1.15 },
  backgroundCenterOffset: { x: -66, y: 52, z: 0.17 },
  showcaseColor: '#d4c5a1',
}

export const MortenaxBlade: CharacterConfig = {
  id: '1507',
  display,
  conditionals,
  get scoring() {
    return scoring()
  },
}

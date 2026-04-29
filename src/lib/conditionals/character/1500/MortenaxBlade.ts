import {
  AbilityEidolon,
  type Conditionals,
  type ContentDefinition,
  countTeamPath,
  createEnum,
} from 'lib/conditionals/conditionalUtils'
import { HitDefinitionBuilder } from 'lib/conditionals/hitDefinitionBuilder'
import {
  Parts,
  PathNames,
  Sets,
  Stats,
} from 'lib/constants/constants'
import { type ModifierContext } from 'lib/optimization/context/calculateActions'
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
  DEFAULT_ULT,
  END_SKILL,
  NULL_TURN_ABILITY_NAME,
  START_ULT,
} from 'lib/optimization/rotation/turnAbilityConfig'
import { SortOption } from 'lib/optimization/sortOptions'
import { PresetEffects } from 'lib/scoring/presetEffects'
import {
  SPREAD_ORNAMENTS_2P_FUA,
  SPREAD_ORNAMENTS_2P_GENERAL_CONDITIONALS,
  SPREAD_RELICS_4P_GENERAL_CONDITIONALS,
} from 'lib/scoring/scoringConstants'
import { CURRENT_DATA_VERSION } from 'lib/constants/constants'
import i18next from 'i18next'
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

  // Basic ATK scaling (normal)
  const basicScaling = basic(e, 0.50, 0.55)
  // Basic ATK scaling (enhanced -- "A Tempered Blade Severs Souls" in Infinite Fury)
  const enhancedBasicScaling = basic(e, 1.00, 1.10)

  // Skill: AoE portion (col A at Lv.10=0.72, Lv.12=0.792)
  const skillAoeScaling = skill(e, 0.72, 0.792)
  // Skill: Per-bounce portion (col C at Lv.10=0.24, Lv.12=0.264), 4 bounces
  const skillBounceScaling = skill(e, 0.24, 0.264)
  const skillBounceCount = 4

  // Enhanced Ultimate "Tenax Per Ignem" (col A at Lv.10=3.00, Lv.12=3.24)
  const enhancedUltScaling = ult(e, 3.00, 3.24)

  // Ult: Balefire Bind DEF reduction (col G at Lv.10=0.30, Lv.12=0.32)
  const ultDefReductionValue = ult(e, 0.30, 0.32)
  // Ult: Balefire Bind VULNERABILITY "DMG received increased" (col D at Lv.10=0.50, Lv.12=0.54)
  const ultVulnerabilityValue = ult(e, 0.50, 0.54)
  // Ult: Infinite Fury CRIT Rate (col B, constant 0.20 across all levels)
  const ultCrBuffValue = 0.20
  // Ult: Infinite Fury CRIT DMG (col C at Lv.10=0.60, Lv.12=0.66)
  const ultCdBuffValue = ult(e, 0.60, 0.66)

  // Talent: Energy regen (col B at Lv.10=25, Lv.12=27) -- informational only
  // const talentEnergyRegen = talent(e, 25, 27)

  // A3 trace: "DMG dealt by ally targets increases by 50%"
  const traceAllyDmgBoostValue = 0.50
  // A3 trace Nihility branch: "Ultimate DMG dealt by ally targets increases by 50%"
  const traceNihilityUltDmgBoostValue = 0.50
  // A3 trace non-Nihility branch: "Follow-Up ATK DMG dealt by ally targets increases by 50%"
  const traceNonNihilityFuaDmgBoostValue = 0.50

  // E2: extra Skill from Talent DMG +50%
  const e2FuaDmgBoost = (e >= 2) ? 0.50 : 0
  // E4: A3 additionally +50% DMG
  const e4AllyDmgBoost = (e >= 4) ? 0.50 : 0

  const defaults = {
    infiniteFuryActive: true,
    ultZone: true,
    e1ResPen: true,
    e2FuaDmgBoost: true,
    e6EnhancedUlt: true,
  }

  const teammateDefaults = {
    ultZone: true,
    e1ResPen: true,
    e2FuaDmgBoost: true,
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
      text: 'Zone / Balefire Bind active',
      content: betaContent,
    },
    e1ResPen: {
      id: 'e1ResPen',
      formItem: 'switch',
      text: 'E1 All-Type RES PEN',
      content: betaContent,
      disabled: e < 1,
    },
    e2FuaDmgBoost: {
      id: 'e2FuaDmgBoost',
      formItem: 'switch',
      text: 'E2 FUA DMG boost / Ult as FUA',
      content: betaContent,
      disabled: e < 2,
    },
    e6EnhancedUlt: {
      id: 'e6EnhancedUlt',
      formItem: 'switch',
      text: 'E6 Enhanced Ult multiplier',
      content: betaContent,
      disabled: e < 6,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    ultZone: content.ultZone,
    e1ResPen: content.e1ResPen,
    e2FuaDmgBoost: content.e2FuaDmgBoost,
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

      // Basic: normal vs enhanced based on Infinite Fury state
      const currentBasicScaling = r.infiniteFuryActive ? enhancedBasicScaling : basicScaling

      // Skill: AoE + 4 random bounces (hybrid pattern per averaging.md)
      // AoE portion is full scaling; bounce portion divides by enemyCount
      const skillTotalHpScaling = skillAoeScaling + skillBounceScaling * skillBounceCount / context.enemyCount
      const skillToughness = 10 + 5 * skillBounceCount / context.enemyCount

      // Enhanced Ult "Tenax Per Ignem": E6 multiplier increases to 150% of original
      const enhancedUltTotalScaling = enhancedUltScaling * ((e >= 6 && r.e6EnhancedUlt) ? 1.50 : 1)

      // FUA: Talent triggers Skill as Follow-Up ATK (same Skill scaling, dual-typed SKILL|FUA)
      // FUA does not consume HP per Talent description
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
            // Enhanced ultimate "Tenax Per Ignem" -- deals damage only during Infinite Fury
            // The normal ult (zone deploy) does no damage
            HitDefinitionBuilder.standardUlt()
              .damageElement(ElementTag.Fire)
              .hpScaling(r.infiniteFuryActive ? enhancedUltTotalScaling : 0)
              .toughnessDmg(r.infiniteFuryActive ? 20 : 0)
              .build(),
          ],
        },
        [AbilityKind.FUA]: {
          hits: [
            // Talent-triggered Skill usage as Follow-Up ATK
            // Kit: "uses his Skill 1 extra time... considered as a Follow-Up ATK"
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

      // Infinite Fury self buffs: CRIT Rate +20%, CRIT DMG +X%
      x.buff(StatKey.CR, r.infiniteFuryActive ? ultCrBuffValue : 0, x.source(SOURCE_ULT))
      x.buff(StatKey.CD, r.infiniteFuryActive ? ultCdBuffValue : 0, x.source(SOURCE_ULT))

      // E2: Increases DMG dealt by the extra Skill from Talent (FUA) by 50%
      x.buff(StatKey.DMG_BOOST, (e >= 2 && r.e2FuaDmgBoost) ? e2FuaDmgBoost : 0, x.damageType(DamageTag.FUA).source(SOURCE_E2))
    },

    precomputeMutualEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      // Balefire Bind: DEF reduction (enemy debuff, team-wide)
      x.buff(StatKey.DEF_PEN, m.ultZone ? ultDefReductionValue : 0, x.targets(TargetTag.FullTeam).source(SOURCE_ULT))

      // Balefire Bind: VULNERABILITY "DMG received increased" (enemy debuff, team-wide)
      x.buff(StatKey.VULNERABILITY, m.ultZone ? ultVulnerabilityValue : 0, x.targets(TargetTag.FullTeam).source(SOURCE_ULT))

      // A3 trace "Heart, Refined ad Infinitum": While the Zone is active, DMG dealt by ally targets +50%
      // E4 additionally increases by 50%
      const totalAllyDmgBoost = traceAllyDmgBoostValue + e4AllyDmgBoost
      x.buff(StatKey.DMG_BOOST, m.ultZone ? totalAllyDmgBoost : 0, x.targets(TargetTag.FullTeam).source(SOURCE_TRACE))

      // A3 branching: if other Nihility characters present -> ULT DMG +50%, else -> FUA DMG +50%
      // countTeamPath includes self, so >= 2 means at least one other Nihility ally
      const nihilityCount = countTeamPath(context, PathNames.Nihility)
      const hasOtherNihility = nihilityCount >= 2
      if (m.ultZone && hasOtherNihility) {
        x.buff(StatKey.DMG_BOOST, traceNihilityUltDmgBoostValue, x.damageType(DamageTag.ULT).targets(TargetTag.FullTeam).source(SOURCE_TRACE))
      }
      if (m.ultZone && !hasOtherNihility) {
        x.buff(StatKey.DMG_BOOST, traceNonNihilityFuaDmgBoostValue, x.damageType(DamageTag.FUA).targets(TargetTag.FullTeam).source(SOURCE_TRACE))
      }

      // E1: While the Zone is active, decreases all enemies' All-Type RES by 20%
      x.buff(StatKey.RES_PEN, (e >= 1 && m.ultZone && m.e1ResPen) ? 0.20 : 0, x.targets(TargetTag.FullTeam).source(SOURCE_E1))
    },

    precomputeTeammateEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      // No teammate-stat-slider-based effects; all team-wide buffs are toggle-gated in mutual
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
    DEFAULT_SKILL,
    DEFAULT_SKILL,
    END_SKILL,
    DEFAULT_FUA,
    DEFAULT_ULT,
    // TODO(HUMAN): verify rotation length vs ult cost (80 energy, 30 from skill, 20 from basic, 25 from talent)
  ],
  relicSets: [
    [Sets.LongevousDisciple, Sets.LongevousDisciple],
    ...SPREAD_RELICS_4P_GENERAL_CONDITIONALS,
  ],
  ornamentSets: [
    Sets.BoneCollectionsSereneDemesne,
    Sets.InertSalsotto,
    ...SPREAD_ORNAMENTS_2P_FUA,
    ...SPREAD_ORNAMENTS_2P_GENERAL_CONDITIONALS,
  ],
  teammates: [
    // TODO(HUMAN): swap to canonical meta teammates
    { characterId: '1403', lightCone: '23039', characterEidolon: 0, lightConeSuperimposition: 1 }, // Tribbie placeholder
    { characterId: '1303', lightCone: '23023', characterEidolon: 0, lightConeSuperimposition: 1 }, // Sunday placeholder
    { characterId: '1409', lightCone: '23038', characterEidolon: 0, lightConeSuperimposition: 1 }, // Hyacine placeholder
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
    PresetEffects.VALOROUS_SET,
    PresetEffects.fnSacerdosSet(1),
  ],
  sortOption: SortOption.SKILL,
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

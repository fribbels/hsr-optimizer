import i18next from 'i18next'
import { SparkleB1 } from 'lib/conditionals/character/1300/SparkleB1'
import { Hyacine } from 'lib/conditionals/character/1400/Hyacine'
import { Ashveil } from 'lib/conditionals/character/1500/Ashveil'
import { MortenaxBlade } from 'lib/conditionals/character/1500/MortenaxBlade'
import {
  getYaoguangAhaPunchlineValue,
  Yaoguang,
} from 'lib/conditionals/character/1500/Yaoguang'
import {
  AbilityEidolon,
  type Conditionals,
  type ContentDefinition,
  countTeamPath,
  createEnum,
} from 'lib/conditionals/conditionalUtils'
import {
  dynamicStatConversionContainer,
  gpuDynamicStatConversion,
} from 'lib/conditionals/evaluation/statConversion'
import { HitDefinitionBuilder } from 'lib/conditionals/hitDefinitionBuilder'
import { DanceDanceDance } from 'lib/conditionals/lightcone/4star/DanceDanceDance'
import { ButTheBattleIsntOver } from 'lib/conditionals/lightcone/5star/ButTheBattleIsntOver'
import { EarthlyEscapade } from 'lib/conditionals/lightcone/5star/EarthlyEscapade'
import { MayRainbowsRemainInTheSky } from 'lib/conditionals/lightcone/5star/MayRainbowsRemainInTheSky'
import { ReforgedInHellfire } from 'lib/conditionals/lightcone/5star/ReforgedInHellfire'
import { SummerRidesTheSurf } from 'lib/conditionals/lightcone/5star/SummerRidesTheSurf'
import { TheFinaleOfALie } from 'lib/conditionals/lightcone/5star/TheFinaleOfALie'
import {
  ConditionalActivation,
  ConditionalType,
  CURRENT_DATA_VERSION,
  Parts,
  PathNames,
  Sets,
  Stats,
} from 'lib/constants/constants'
import { wgslTrue } from 'lib/gpu/injection/wgslUtils'
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
  END_SKILL,
  END_ULT,
  NULL_TURN_ABILITY_NAME,
  START_SKILL,
  START_ULT,
  WHOLE_ELATION_SKILL,
  WHOLE_SKILL,
  WHOLE_UNIQUE,
} from 'lib/optimization/rotation/turnAbilityConfig'
import { SortOption } from 'lib/optimization/sortOptions'
import { PresetEffects } from 'lib/scoring/presetEffects'
import {
  SPREAD_ORNAMENTS_2P_GENERAL_CONDITIONALS,
  SPREAD_RELICS_4P_GENERAL_CONDITIONALS,
} from 'lib/scoring/scoringConstants'
import { type Eidolon } from 'types/character'
import { type CharacterConfig } from 'types/characterConfig'
import { type CharacterConditionalsController } from 'types/conditionals'
import { type HitDefinition } from 'types/hitConditionalTypes'
import {
  type ScoringMetadata,
  type SimulationMetadata,
} from 'types/metadata'
import {
  type OptimizerAction,
  type OptimizerContext,
} from 'types/optimizer'

export const AventurineWaveflairEntities = createEnum('AventurineWaveflair')
export const AventurineWaveflairAbilities: AbilityKind[] = [
  AbilityKind.BASIC,
  AbilityKind.SKILL,
  AbilityKind.ULT,
  AbilityKind.ELATION_SKILL,
  AbilityKind.UNIQUE,
  AbilityKind.BREAK,
]

const conditionals = (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const betaContent = i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION })
  const { basic, skill, ult, talent, elationSkill } = AbilityEidolon.SKILL_TALENT_ELATION_SKILL_3_ULT_BASIC_ELATION_SKILL_5
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
    SOURCE_ELATION_SKILL,
  } = Source.character(AventurineWaveflair.id)

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 2.40, 2.64)
  const ultScaling = ult(e, 4.00, 4.32)
  const ultSpdBuff = ult(e, 0.25, 0.28)

  const talentSkillElationScaling = talent(e, 0.40, 0.44)
  const talentUltElationScaling = talent(e, 0.72, 0.792)

  const elationSkillAoeScaling = elationSkill(e, 0.60, 0.63, 0.66)
  const elationSkillBounceCount = 10
  const elationSkillBounceScaling = elationSkill(e, 0.15, 0.1575, 0.165)

  const fervorMax = (e >= 2) ? 50 : 30

  const defaults = {
    ultSpdBuff: true,
    certifiedBanger: true,
    certifiedBangerStacks: 60,
    punchlineStacks: 30,
    enhancedElationSkill: true,
    fervorStacks: 15,
    spdElationConversion: true,
    cdStacks: 4,
    e1ResPen: true,
    e4DefPen: true,
    e6Merrymaking: true,
  }

  const teammateDefaults = {}

  const content: ContentDefinition<typeof defaults> = {
    ultSpdBuff: {
      id: 'ultSpdBuff',
      formItem: 'switch',
      text: 'Ult SPD buff',
      content: betaContent,
    },
    certifiedBanger: {
      id: 'certifiedBanger',
      formItem: 'switch',
      text: 'Certified Banger',
      content: betaContent,
    },
    certifiedBangerStacks: {
      id: 'certifiedBangerStacks',
      formItem: 'slider',
      text: 'Certified Banger stacks',
      content: betaContent,
      min: 0,
      max: 200,
    },
    punchlineStacks: {
      id: 'punchlineStacks',
      formItem: 'slider',
      text: 'Punchline stacks',
      content: betaContent,
      min: 0,
      max: 100,
    },
    enhancedElationSkill: {
      id: 'enhancedElationSkill',
      formItem: 'switch',
      text: 'Enhanced Elation Skill (All in)',
      content: betaContent,
    },
    fervorStacks: {
      id: 'fervorStacks',
      formItem: 'slider',
      text: 'Fervor stacks',
      content: betaContent,
      min: 0,
      max: fervorMax,
    },
    spdElationConversion: {
      id: 'spdElationConversion',
      formItem: 'switch',
      text: 'SPD to Elation conversion',
      content: betaContent,
    },
    cdStacks: {
      id: 'cdStacks',
      formItem: 'slider',
      text: 'CD stacks',
      content: betaContent,
      min: 0,
      max: 6,
    },
    e1ResPen: {
      id: 'e1ResPen',
      formItem: 'switch',
      text: 'E1 All-Type RES PEN',
      content: betaContent,
      disabled: e < 1,
    },
    e4DefPen: {
      id: 'e4DefPen',
      formItem: 'switch',
      text: 'E4 DEF ignore',
      content: betaContent,
      disabled: e < 4,
    },
    e6Merrymaking: {
      id: 'e6Merrymaking',
      formItem: 'switch',
      text: 'E6 Merrymaking',
      content: betaContent,
      disabled: e < 6,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {}

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    teammateContent: () => Object.values(teammateContent),
    teammateDefaults: () => teammateDefaults,

    entityDeclaration: () => Object.values(AventurineWaveflairEntities),
    entityDefinition: (action: OptimizerAction, context: OptimizerContext) => ({
      [AventurineWaveflairEntities.AventurineWaveflair]: {
        primary: true,
        summon: false,
        memosprite: false,
      },
    }),

    actionDeclaration: () => [...AventurineWaveflairAbilities],
    actionDefinition: (action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      const punchlineStacks = getYaoguangAhaPunchlineValue(action, context) ?? r.punchlineStacks
      const certifiedBangerStacks = r.certifiedBangerStacks
      const fervorStacks = r.fervorStacks

      // ============== BASIC ==============

      const basicHit = HitDefinitionBuilder.standardBasic()
        .damageElement(ElementTag.Quantum)
        .atkScaling(basicScaling)
        .toughnessDmg(10)
        .build()

      const basicHits: HitDefinition[] = [basicHit]

      // ============== SKILL ==============

      const skillHit = HitDefinitionBuilder.standardSkill()
        .damageElement(ElementTag.Quantum)
        .atkScaling(skillScaling)
        .toughnessDmg(10)
        .build()

      const skillHits: HitDefinition[] = [skillHit]

      // Certified Banger: Skill additionally deals Quantum Elation DMG
      if (r.certifiedBanger) {
        skillHits.push(
          HitDefinitionBuilder.elation()
            .damageType(DamageTag.ELATION)
            .damageElement(ElementTag.Quantum)
            .elationScaling(talentSkillElationScaling)
            .punchlineStacks(certifiedBangerStacks)
            .toughnessDmg(0)
            .build(),
        )
      }

      // ============== ULT ==============

      const ultHit = HitDefinitionBuilder.standardUlt()
        .damageElement(ElementTag.Quantum)
        .atkScaling(ultScaling)
        .toughnessDmg(20)
        .build()

      const ultHits: HitDefinition[] = [ultHit]

      // Certified Banger: Ult additionally deals Quantum Elation DMG
      if (r.certifiedBanger) {
        ultHits.push(
          HitDefinitionBuilder.elation()
            .damageType(DamageTag.ELATION)
            .damageElement(ElementTag.Quantum)
            .elationScaling(talentUltElationScaling)
            .punchlineStacks(certifiedBangerStacks)
            .toughnessDmg(0)
            .build(),
        )
      }

      // ============== ELATION SKILL ==============

      // Base: AoE 60% + 10 bounces × 15% averaged per enemy
      // Enhanced "All in": same base + fervorStacks × 15% additional bounces averaged per enemy
      const bonusFervorBounces = r.enhancedElationSkill ? fervorStacks : 0
      const totalBounceCount = elationSkillBounceCount + bonusFervorBounces

      const elationSkillHit = HitDefinitionBuilder.elation()
        .damageType(DamageTag.ELATION)
        .damageElement(ElementTag.Quantum)
        .elationScaling(elationSkillAoeScaling + totalBounceCount * elationSkillBounceScaling / context.enemyCount)
        .punchlineStacks(punchlineStacks)
        .toughnessDmg(
          r.enhancedElationSkill
            ? 20 + 5 * totalBounceCount / context.enemyCount
            : 10 + 3.33 * elationSkillBounceCount / context.enemyCount,
        )
        .build()

      // ============== UNIQUE (Talent-triggered Cheers! with fixed 20 Punchline) ==============

      const talentCheersHit = HitDefinitionBuilder.elation()
        .damageType(DamageTag.ELATION)
        .damageElement(ElementTag.Quantum)
        .elationScaling(elationSkillAoeScaling + elationSkillBounceCount * elationSkillBounceScaling / context.enemyCount)
        .punchlineStacks(20)
        .toughnessDmg(10 + 3.33 * elationSkillBounceCount / context.enemyCount)
        .build()

      // ============== BREAK ==============

      const breakHit = HitDefinitionBuilder.standardBreak(ElementTag.Quantum).build()

      return {
        [AbilityKind.BASIC]: { hits: basicHits },
        [AbilityKind.SKILL]: { hits: skillHits },
        [AbilityKind.ULT]: { hits: ultHits },
        [AbilityKind.ELATION_SKILL]: { hits: [elationSkillHit] },
        [AbilityKind.UNIQUE]: { hits: [talentCheersHit] },
        [AbilityKind.BREAK]: { hits: [breakHit] },
      }
    },
    actionModifiers: () => [],

    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // Ult: SPD buff
      x.buff(StatKey.SPD_P, r.ultSpdBuff ? ultSpdBuff : 0, x.source(SOURCE_ULT))

      // Trace A2: +100% Elation if other Elation characters in team (auto-detected)
      const otherElationCount = countTeamPath(context, PathNames.Elation) - 1
      x.buff(StatKey.ELATION, otherElationCount > 0 ? 1.00 : 0, x.source(SOURCE_TRACE))

      // Trace A4: +48% base CD + up to 6 stacks of 48% CD
      x.buff(StatKey.CD, 0.48, x.source(SOURCE_TRACE))
      x.buff(StatKey.CD, r.cdStacks * 0.48, x.source(SOURCE_TRACE))

      // E1: +24% All-Type RES PEN
      x.buff(StatKey.RES_PEN, (e >= 1 && r.e1ResPen) ? 0.24 : 0, x.source(SOURCE_E1))

      // E4: Ignores 18% DEF
      x.buff(StatKey.DEF_PEN, (e >= 4 && r.e4DefPen) ? 0.18 : 0, x.source(SOURCE_E4))

      // E6: Elation DMG merrymakes by 25%
      x.buff(StatKey.MERRYMAKING, (e >= 6 && r.e6Merrymaking) ? 0.25 : 0, x.source(SOURCE_E6))
    },

    precomputeMutualEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
    },

    precomputeTeammateEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
    },

    finalizeCalculations: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {},
    newGpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => '',
    dynamicConditionals: [
      {
        id: 'AventurineWaveflairSpdElationConditional',
        type: ConditionalType.ABILITY,
        activation: ConditionalActivation.CONTINUOUS,
        dependsOn: [Stats.SPD],
        chainsTo: [Stats.Elation],
        condition: function(x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals as Conditionals<typeof content>
          return r.spdElationConversion
        },
        effect: function(x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) {
          dynamicStatConversionContainer(
            Stats.SPD,
            Stats.Elation,
            this,
            x,
            action,
            context,
            SOURCE_TRACE,
            (convertibleValue) => {
              if (convertibleValue < 160) return 0
              return 0.30 + Math.min(200, convertibleValue - 160) * 0.01
            },
            TargetTag.SelfAndPet,
            true,
          )
        },
        gpu: function(action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals as Conditionals<typeof content>

          return gpuDynamicStatConversion(
            Stats.SPD,
            Stats.Elation,
            this,
            action,
            context,
            `0.30 + min(200.0, convertibleValue - 160.0) * 0.01`,
            `${wgslTrue(r.spdElationConversion)}`,
            `convertibleValue >= 160.0`,
            TargetTag.SelfAndPet,
            true,
          )
        },
      },
    ],
  }
}

const simulation = (): SimulationMetadata => ({
  leaderboardEnabled: false,
  parts: {
    [Parts.Body]: [
      Stats.CR,
      Stats.CD,
      Stats.ATK_P,
    ],
    [Parts.Feet]: [
      Stats.SPD,
      Stats.ATK_P,
    ],
    [Parts.PlanarSphere]: [
      Stats.Quantum_DMG,
      Stats.ATK_P,
    ],
    [Parts.LinkRope]: [
      Stats.ERR,
      Stats.ATK_P,
    ],
  },
  substats: [
    Stats.CD,
    Stats.CR,
    Stats.SPD,
    Stats.ATK_P,
    Stats.ATK,
  ],
  comboTurnAbilities: [
    NULL_TURN_ABILITY_NAME,
    START_ULT,
    END_SKILL,
    WHOLE_ELATION_SKILL,
    WHOLE_SKILL,
    WHOLE_ELATION_SKILL,
    WHOLE_UNIQUE,
  ],
  errRopeEidolon: 0,
  hardBreakpoints: [
    { stat: Stats.SPD, threshold: 160 },
  ],
  relicSets: [
    [Sets.EverGloriousMagicalGirl, Sets.EverGloriousMagicalGirl],
    ...SPREAD_RELICS_4P_GENERAL_CONDITIONALS,
  ],
  ornamentSets: [
    Sets.PunklordeStageZero,
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
      characterId: MortenaxBlade.id,
      lightCone: ReforgedInHellfire.id,
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
  leaderboardTeams: [],
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
      Stats.ERR,
    ],
  },
  presets: [],
  defaultDamageType: DamageTag.ELATION,
  sortOption: SortOption.ELATION_SKILL,
  hiddenColumns: [SortOption.FUA, SortOption.DOT],
  simulation: simulation(),
  eidolonImage: 4,
})

const display = {
  imageCenter: {
    x: 979,
    y: 1011,
    z: 1.02,
  },
  showcaseColor: '#bfc7ff',
}

export const AventurineWaveflair: CharacterConfig = {
  id: '1513',
  defaultLightCone: SummerRidesTheSurf.id,
  display,
  conditionals,
  get scoring() {
    return scoring()
  },
}

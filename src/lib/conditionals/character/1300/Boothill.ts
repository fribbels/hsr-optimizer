import {
  AbilityEidolon,
  Conditionals,
  ContentDefinition,
  createEnum,
} from 'lib/conditionals/conditionalUtils'
import { HitDefinitionBuilder } from 'lib/conditionals/hitDefinitionBuilder'
import {
  ConditionalActivation,
  ConditionalType,
  Parts,
  Sets,
  Stats,
} from 'lib/constants/constants'
import {
  newConditionalWgslWrapper,
} from 'lib/gpu/conditionals/dynamicConditionals'
import {
  containerActionVal,
  p_containerActionVal,
} from 'lib/gpu/injection/injectUtils'
import { wgslFalse } from 'lib/gpu/injection/wgslUtils'
import { Source } from 'lib/optimization/buffSource'
import { StatKey } from 'lib/optimization/engine/config/keys'
import {
  DamageTag,
  ElementTag,
  SELF_ENTITY_INDEX,
} from 'lib/optimization/engine/config/tag'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { SortOption } from 'lib/optimization/sortOptions'
import {
  NULL_TURN_ABILITY_NAME,
  START_SKILL,
  DEFAULT_ULT,
  DEFAULT_BASIC,
  END_BREAK,
  WHOLE_BASIC,
  START_BASIC,
} from 'lib/optimization/rotation/turnAbilityConfig'
import {
  SPREAD_RELICS_2P_SPEED_WEIGHTS,
  SPREAD_RELICS_2P_BREAK_WEIGHTS,
  RELICS_2P_BREAK_EFFECT_SPEED,
  SPREAD_RELICS_4P_GENERAL_CONDITIONALS,
} from 'lib/scoring/scoringConstants'
import {
  FUGUE,
  LONG_ROAD_LEADS_HOME,
  THE_DAHLIA,
  NEVER_FORGET_HER_FLAME,
  LINGSHA,
  SCENT_ALONE_STAYS_TRUE,
} from 'lib/simulations/tests/testMetadataConstants'
import { TsUtils } from 'lib/utils/TsUtils'

import { DamageFunctionType } from 'lib/optimization/engine/damage/damageCalculator'
import { Eidolon } from 'types/character'
import { CharacterConfig } from 'types/characterConfig'
import { NumberToNumberMap } from 'types/common'
import { CharacterConditionalsController } from 'types/conditionals'
import { HitDefinition } from 'types/hitConditionalTypes'
import { SimulationMetadata, ScoringMetadata } from 'types/metadata'
import {
  OptimizerAction,
  OptimizerContext,
} from 'types/optimizer'

export const BoothillEntities = createEnum('Boothill')
export const BoothillAbilities = createEnum('BASIC', 'ULT', 'BREAK')

const conditionals = (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Boothill')
  const { basic, skill, ult, talent } = AbilityEidolon.ULT_BASIC_3_SKILL_TALENT_5
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
  } = Source.character('1315')

  const standoffVulnerabilityBoost = skill(e, 0.30, 0.33)

  const basicScaling = basic(e, 1.00, 1.10)
  const basicEnhancedScaling = basic(e, 2.20, 2.42)
  const ultScaling = ult(e, 4.00, 4.32)

  const pocketTrickshotsToTalentBreakDmg: NumberToNumberMap = {
    0: 0,
    1: talent(e, 0.70, 0.77),
    2: talent(e, 1.20, 1.32),
    3: talent(e, 1.70, 1.87),
  }

  const defaults = {
    standoffActive: true,
    pocketTrickshotStacks: 3,
    beToCritBoost: true,
    talentBreakDmgScaling: true,
    e1DefShred: true,
    e2BeBuff: true,
    e4TargetStandoffVulnerability: true,
    e6AdditionalBreakDmg: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    standoffActive: {
      id: 'standoffActive',
      formItem: 'switch',
      text: t('Content.standoffActive.text'),
      content: t('Content.standoffActive.content', { standoffVulnerabilityBoost: TsUtils.precisionRound(100 * standoffVulnerabilityBoost) }),
    },
    pocketTrickshotStacks: {
      id: 'pocketTrickshotStacks',
      formItem: 'slider',
      text: t('Content.pocketTrickshotStacks.text'),
      content: t('Content.pocketTrickshotStacks.content'),
      min: 0,
      max: 3,
    },
    beToCritBoost: {
      id: 'beToCritBoost',
      formItem: 'switch',
      text: t('Content.beToCritBoost.text'),
      content: t('Content.beToCritBoost.content'),
    },
    talentBreakDmgScaling: {
      id: 'talentBreakDmgScaling',
      formItem: 'switch',
      text: t('Content.talentBreakDmgScaling.text'),
      content: t('Content.talentBreakDmgScaling.content'),
    },
    e1DefShred: {
      id: 'e1DefShred',
      formItem: 'switch',
      text: t('Content.e1DefShred.text'),
      content: t('Content.e1DefShred.content'),
      disabled: e < 1,
    },
    e2BeBuff: {
      id: 'e2BeBuff',
      formItem: 'switch',
      text: t('Content.e2BeBuff.text'),
      content: t('Content.e2BeBuff.content'),
      disabled: e < 2,
    },
    e4TargetStandoffVulnerability: {
      id: 'e4TargetStandoffVulnerability',
      formItem: 'switch',
      text: t('Content.e4TargetStandoffVulnerability.text'),
      content: t('Content.e4TargetStandoffVulnerability.content'),
      disabled: e < 4,
    },
    e6AdditionalBreakDmg: {
      id: 'e6AdditionalBreakDmg',
      formItem: 'switch',
      text: t('Content.e6AdditionalBreakDmg.text'),
      content: t('Content.e6AdditionalBreakDmg.content'),
      disabled: e < 6,
    },
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,

    entityDeclaration: () => Object.values(BoothillEntities),
    entityDefinition: (action: OptimizerAction, context: OptimizerContext) => ({
      [BoothillEntities.Boothill]: {
        primary: true,
        summon: false,
        memosprite: false,
      },
    }),

    actionDeclaration: () => Object.values(BoothillAbilities),
    actionDefinition: (action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      const normalBasic = {
        hits: [
          HitDefinitionBuilder.standardBasic()
            .damageElement(ElementTag.Physical)
            .atkScaling(basicScaling)
            .toughnessDmg(10)
            .build(),
        ],
      }

      const enhancedBasicHits: HitDefinition[] = [
        HitDefinitionBuilder.standardBasic()
          .damageElement(ElementTag.Physical)
          .atkScaling(basicEnhancedScaling)
          .toughnessDmg(20)
          .build(),
      ]

      // Add talent break DMG hit if enabled
      if (r.talentBreakDmgScaling) {
        // Calculate toughness-capped scaling
        const newMaxToughness = Math.min(16.00 * 30, context.enemyMaxToughness)
        const inverseBreakToughnessMultiplier = 1 / (0.5 + context.enemyMaxToughness / 120)
        const newBreakToughnessMultiplier = 0.5 + newMaxToughness / 120

        let talentBreakDmgScaling = pocketTrickshotsToTalentBreakDmg[r.pocketTrickshotStacks]
        talentBreakDmgScaling += (e >= 6 && r.e6AdditionalBreakDmg) ? 0.40 : 0

        const totalScaling = inverseBreakToughnessMultiplier
          * newBreakToughnessMultiplier
          * talentBreakDmgScaling

        // Use specialScaling to encode the modified break scaling
        enhancedBasicHits.push(
          HitDefinitionBuilder.standardBreak(ElementTag.Physical)
            .specialScaling(totalScaling)
            .build(),
        )
      }

      const enhancedBasic = {
        hits: enhancedBasicHits,
      }

      return {
        [BoothillAbilities.BASIC]: r.standoffActive ? enhancedBasic : normalBasic,
        [BoothillAbilities.ULT]: {
          hits: [
            HitDefinitionBuilder.standardUlt()
              .damageElement(ElementTag.Physical)
              .atkScaling(ultScaling)
              .toughnessDmg(30)
              .build(),
          ],
        },
        [BoothillAbilities.BREAK]: {
          hits: [
            HitDefinitionBuilder.standardBreak(ElementTag.Physical).build(),
          ],
        },
      }
    },
    actionModifiers: () => [],

    initializeConfigurationsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      if (r.talentBreakDmgScaling) {
        action.config.enemyWeaknessBroken = true
      }
    },

    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // E2 BE buff
      x.buff(StatKey.BE, (e >= 2 && r.e2BeBuff) ? 0.30 : 0, x.source(SOURCE_E2))

      // Standoff vulnerability
      x.buff(StatKey.VULNERABILITY, (r.standoffActive) ? standoffVulnerabilityBoost : 0, x.source(SOURCE_SKILL))

      // E1 DEF shred
      x.buff(StatKey.DEF_PEN, (e >= 1 && r.e1DefShred) ? 0.16 : 0, x.source(SOURCE_E1))

      // E4 additional vulnerability
      x.buff(StatKey.VULNERABILITY, (e >= 4 && r.standoffActive && r.e4TargetStandoffVulnerability) ? 0.12 : 0, x.source(SOURCE_E4))

      // Enhanced Basic break efficiency
      x.buff(
        StatKey.BREAK_EFFICIENCY_BOOST,
        (r.standoffActive) ? r.pocketTrickshotStacks * 0.50 : 0,
        x.damageType(DamageTag.BASIC).source(SOURCE_TALENT),
      )
    },

    finalizeCalculations: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {},
    dynamicConditionals: [{
      id: 'BoothillConversionConditional',
      type: ConditionalType.ABILITY,
      activation: ConditionalActivation.CONTINUOUS,
      dependsOn: [Stats.BE],
      chainsTo: [Stats.CR, Stats.CD],
      condition: function(x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) {
        const r = action.characterConditionals as Conditionals<typeof content>

        return r.beToCritBoost
      },
      effect: function(x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) {
        const r = action.characterConditionals as Conditionals<typeof content>
        if (!r.beToCritBoost) return

        const stateValue = action.conditionalState[this.id] || 0

        const stateCrBuffValue = Math.min(0.30, 0.10 * stateValue)
        const stateCdBuffValue = Math.min(1.50, 0.50 * stateValue)

        const beValue = x.getActionValueByIndex(StatKey.BE, SELF_ENTITY_INDEX)
        const crBuffValue = Math.min(0.30, 0.10 * beValue)
        const cdBuffValue = Math.min(1.50, 0.50 * beValue)

        action.conditionalState[this.id] = beValue

        x.buffDynamic(StatKey.CR, crBuffValue - stateCrBuffValue, action, context, x.source(SOURCE_TRACE))
        x.buffDynamic(StatKey.UNCONVERTIBLE_CR_BUFF, crBuffValue - stateCrBuffValue, action, context, x.source(SOURCE_TRACE))
        x.buffDynamic(StatKey.CD, cdBuffValue - stateCdBuffValue, action, context, x.source(SOURCE_TRACE))
        x.buffDynamic(StatKey.UNCONVERTIBLE_CD_BUFF, cdBuffValue - stateCdBuffValue, action, context, x.source(SOURCE_TRACE))
      },
      gpu: function(action: OptimizerAction, context: OptimizerContext) {
        const r = action.characterConditionals as Conditionals<typeof content>

        return newConditionalWgslWrapper(
          this,
          action,
          context,
          `
if (${wgslFalse(r.beToCritBoost)}) {
  return;
}

let be = ${containerActionVal(SELF_ENTITY_INDEX, StatKey.BE, action.config)};
let stateValue: f32 = (*p_state).BoothillConversionConditional${action.actionIdentifier};

let stateCrBuffValue = min(0.30, 0.10 * stateValue);
let stateCdBuffValue = min(1.50, 0.50 * stateValue);

let crBuffValue = min(0.30, 0.10 * be);
let cdBuffValue = min(1.50, 0.50 * be);

(*p_state).BoothillConversionConditional${action.actionIdentifier} = be;

${p_containerActionVal(SELF_ENTITY_INDEX, StatKey.CR, action.config)} += crBuffValue - stateCrBuffValue;
${p_containerActionVal(SELF_ENTITY_INDEX, StatKey.UNCONVERTIBLE_CR_BUFF, action.config)} += crBuffValue - stateCrBuffValue;
${p_containerActionVal(SELF_ENTITY_INDEX, StatKey.CD, action.config)} += cdBuffValue - stateCdBuffValue;
${p_containerActionVal(SELF_ENTITY_INDEX, StatKey.UNCONVERTIBLE_CD_BUFF, action.config)} += cdBuffValue - stateCdBuffValue;
`,
        )
      },
    }],
  }
}


const simulation: SimulationMetadata = {
  parts: {
    [Parts.Body]: [
      Stats.CR,
      Stats.CD,
    ],
    [Parts.Feet]: [
      Stats.SPD,
    ],
    [Parts.PlanarSphere]: [
      Stats.Physical_DMG,
      Stats.ATK_P,
    ],
    [Parts.LinkRope]: [
      Stats.BE,
    ],
  },
  substats: [
    Stats.BE,
    Stats.CD,
    Stats.CR,
    Stats.ATK_P,
    Stats.ATK,
  ],
  comboTurnAbilities: [
    NULL_TURN_ABILITY_NAME,
    START_SKILL,
    DEFAULT_ULT,
    DEFAULT_BASIC,
    END_BREAK,
    WHOLE_BASIC,
    START_BASIC,
    END_BREAK,
  ],
  comboDot: 0,
  relicSets: [
    [Sets.ThiefOfShootingMeteor, Sets.WatchmakerMasterOfDreamMachinations],
    [Sets.IronCavalryAgainstTheScourge, Sets.IronCavalryAgainstTheScourge],
    RELICS_2P_BREAK_EFFECT_SPEED,
    ...SPREAD_RELICS_4P_GENERAL_CONDITIONALS,
  ],
  ornamentSets: [
    Sets.TaliaKingdomOfBanditry,
  ],
  teammates: [
    {
      characterId: FUGUE,
      lightCone: LONG_ROAD_LEADS_HOME,
      characterEidolon: 0,
      lightConeSuperimposition: 1,
    },
    {
      characterId: THE_DAHLIA,
      lightCone: NEVER_FORGET_HER_FLAME,
      characterEidolon: 0,
      lightConeSuperimposition: 1,
    },
    {
      characterId: LINGSHA,
      lightCone: SCENT_ALONE_STAYS_TRUE,
      characterEidolon: 0,
      lightConeSuperimposition: 1,
    },
  ],
}

const scoring: ScoringMetadata = {
  stats: {
    [Stats.ATK]: 0.25,
    [Stats.ATK_P]: 0.25,
    [Stats.DEF]: 0,
    [Stats.DEF_P]: 0,
    [Stats.HP]: 0,
    [Stats.HP_P]: 0,
    [Stats.SPD]: 1,
    [Stats.CR]: 0.25,
    [Stats.CD]: 0.25,
    [Stats.EHR]: 0,
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
      Stats.BE,
    ],
  },
  sets: {
    ...SPREAD_RELICS_2P_SPEED_WEIGHTS,
    ...SPREAD_RELICS_2P_BREAK_WEIGHTS,
    [Sets.IronCavalryAgainstTheScourge]: 1,
    [Sets.ThiefOfShootingMeteor]: 1,
    [Sets.EagleOfTwilightLine]: 1,

    [Sets.TaliaKingdomOfBanditry]: 1,
    [Sets.ForgeOfTheKalpagniLantern]: 1,
  },
  presets: [],
  sortOption: SortOption.BASIC,
  hiddenColumns: [
    SortOption.SKILL,
    SortOption.FUA,
    SortOption.DOT,
  ],
  simulation,
}

const display = {
  imageCenter: {
    x: 1000,
    y: 1100,
    z: 1,
  },
  showcaseColor: '#a49ed2',
}

export const Boothill: CharacterConfig = {
  id: '1315',
  info: {},
  conditionals,
  scoring,
  display,
}

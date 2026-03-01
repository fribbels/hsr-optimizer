import {
  AbilityEidolon,
  Conditionals,
  ContentDefinition,
  createEnum,
} from 'lib/conditionals/conditionalUtils'
import { HitDefinitionBuilder } from 'lib/conditionals/hitDefinitionBuilder'
import { Parts, Sets, Stats } from 'lib/constants/constants'
import { containerActionVal } from 'lib/gpu/injection/injectUtils'
import { wgsl, wgslTrue } from 'lib/gpu/injection/wgslUtils'
import { Source } from 'lib/optimization/buffSource'
import { SortOption } from 'lib/optimization/sortOptions'
import { AKey, HKey, StatKey } from 'lib/optimization/engine/config/keys'
import {
  DamageTag,
  ElementTag,
  SELF_ENTITY_INDEX,
  TargetTag,
} from 'lib/optimization/engine/config/tag'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { buff } from 'lib/optimization/engine/container/gpuBuffBuilder'
import {
  NULL_TURN_ABILITY_NAME,
  START_ULT,
  END_BASIC,
  WHOLE_BASIC,
  START_BASIC,
  END_BREAK,
  WHOLE_SKILL,
} from 'lib/optimization/rotation/turnAbilityConfig'
import {
  SPREAD_RELICS_4P_GENERAL_CONDITIONALS,
} from 'lib/scoring/scoringConstants'
import { PresetEffects } from 'lib/scoring/presetEffects'
import {
  FUGUE,
  LONG_ROAD_LEADS_HOME,
  RUAN_MEI,
  PAST_SELF_IN_MIRROR,
  LINGSHA,
  SCENT_ALONE_STAYS_TRUE,
} from 'lib/simulations/tests/testMetadataConstants'
import { TsUtils } from 'lib/utils/TsUtils'

import { Eidolon } from 'types/character'
import { CharacterConfig } from 'types/characterConfig'
import { CharacterConditionalsController } from 'types/conditionals'
import { Hit } from 'types/hitConditionalTypes'
import { SimulationMetadata, ScoringMetadata } from 'types/metadata'
import {
  OptimizerAction,
  OptimizerContext,
} from 'types/optimizer'

export const RappaEntities = createEnum('Rappa')
export const RappaAbilities = createEnum('BASIC', 'SKILL', 'BREAK')

const conditionals = (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Rappa')
  const { basic, skill, ult, talent } = AbilityEidolon.SKILL_TALENT_3_ULT_BASIC_5
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
  } = Source.character('1317')

  const basicScaling = basic(e, 1.00, 1.10)
  const basicEnhancedScaling = basic(e, 2.00, 2.32)

  const skillScaling = skill(e, 1.20, 1.32)

  const ultBeBuff = ult(e, 0.30, 0.34)

  const talentBreakDmgModifier = talent(e, 0.60, 0.66)
  const talentChargeMultiplier = talent(e, 0.50, 0.55)

  const maxChargeStacks = e >= 6 ? 15 : 10

  const teammateDefaults = {
    teammateBreakVulnerability: 0.10,
    e4SpdBuff: true,
  }

  const defaults = {
    sealformActive: true,
    atkToBreakVulnerability: true,
    chargeStacks: e >= 6 ? 10 : 5,
    e1DefPen: true,
    e2Buffs: true,
    e4SpdBuff: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    sealformActive: {
      id: 'sealformActive',
      formItem: 'switch',
      text: t('Content.sealformActive.text'),
      content: t('Content.sealformActive.content', { ultBeBuff: TsUtils.precisionRound(100 * ultBeBuff) }),
    },
    atkToBreakVulnerability: {
      id: 'atkToBreakVulnerability',
      formItem: 'switch',
      text: t('Content.atkToBreakVulnerability.text'),
      content: t('Content.atkToBreakVulnerability.content'),
    },
    chargeStacks: {
      id: 'chargeStacks',
      formItem: 'slider',
      text: t('Content.chargeStacks.text'),
      content: t('Content.chargeStacks.content', { talentChargeMultiplier: TsUtils.precisionRound(100 * talentChargeMultiplier) }),
      min: 0,
      max: maxChargeStacks,
    },
    e1DefPen: {
      id: 'e1DefPen',
      formItem: 'switch',
      text: t('Content.e1DefPen.text'),
      content: t('Content.e1DefPen.content'),
      disabled: e < 1,
    },
    e2Buffs: {
      id: 'e2Buffs',
      formItem: 'switch',
      text: t('Content.e2Buffs.text'),
      content: t('Content.e2Buffs.content'),
      disabled: e < 2,
    },
    e4SpdBuff: {
      id: 'e4SpdBuff',
      formItem: 'switch',
      text: t('Content.e4SpdBuff.text'),
      content: t('Content.e4SpdBuff.content'),
      disabled: e < 4,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    teammateBreakVulnerability: {
      id: 'teammateBreakVulnerability',
      formItem: 'slider',
      text: t('TeammateContent.teammateBreakVulnerability.text'),
      content: t('TeammateContent.teammateBreakVulnerability.content'),
      min: 0,
      max: 0.10,
      percent: true,
    },
    e4SpdBuff: {
      id: 'e4SpdBuff',
      formItem: 'switch',
      text: t('TeammateContent.e4SpdBuff.text'),
      content: t('TeammateContent.e4SpdBuff.content'),
      disabled: e < 4,
    },
  }
  return {
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,

    // Entity declarations
    entityDeclaration: () => Object.values(RappaEntities),
    entityDefinition: (action: OptimizerAction, context: OptimizerContext) => ({
      [RappaEntities.Rappa]: {
        primary: true,
        summon: false,
        memosprite: false,
      },
    }),

    // Action declarations
    actionDeclaration: () => Object.values(RappaAbilities),
    actionDefinition: (action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // Calculate break damage scaling from talent + charge stacks
      const breakDmgScaling = talentBreakDmgModifier + r.chargeStacks * talentChargeMultiplier

      // Enhanced basic toughness damage: 25 + (2 + chargeStacks)
      const enhancedToughnessDmg = 25 + 2 + r.chargeStacks

      const normalBasic = {
        hits: [
          HitDefinitionBuilder.standardBasic()
            .damageElement(ElementTag.Imaginary)
            .atkScaling(basicScaling)
            .toughnessDmg(10)
            .build(),
        ],
      }

      // Enhanced basic main hit (needed as reference for super break)
      const enhancedBasicMainHit = HitDefinitionBuilder.standardBasic()
        .damageElement(ElementTag.Imaginary)
        .atkScaling(basicEnhancedScaling)
        .toughnessDmg(enhancedToughnessDmg)
        .build()

      // Enhanced basic only used when sealformActive - includes super break
      const enhancedBasic = {
        hits: [
          enhancedBasicMainHit,
          HitDefinitionBuilder.standardBreak(ElementTag.Imaginary)
            .specialScaling(breakDmgScaling)
            .build(),
          HitDefinitionBuilder.standardSuperBreak(ElementTag.Imaginary)
            .referenceHit(enhancedBasicMainHit as Hit)
            .build(),
        ],
      }

      return {
        // Super break only happens in sealform (enhancedBasic)
        [RappaAbilities.BASIC]: r.sealformActive ? enhancedBasic : normalBasic,
        [RappaAbilities.SKILL]: {
          hits: [
            HitDefinitionBuilder.standardSkill()
              .damageElement(ElementTag.Imaginary)
              .atkScaling(skillScaling)
              .toughnessDmg(10)
              .build(),
          ],
        },
        [RappaAbilities.BREAK]: {
          hits: [
            HitDefinitionBuilder.standardBreak(ElementTag.Imaginary).build(),
          ],
        },
      }
    },
    actionModifiers: () => [],

    initializeConfigurationsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      if (r.sealformActive) {
        action.config.enemyWeaknessBroken = true
      }
    },

    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // BE buff from ult (sealform)
      x.buff(StatKey.BE, (r.sealformActive) ? ultBeBuff : 0, x.source(SOURCE_ULT))

      // Break efficiency boost (sealform)
      x.buff(StatKey.BREAK_EFFICIENCY_BOOST, (r.sealformActive) ? 0.50 : 0, x.source(SOURCE_ULT))

      // E1 DEF PEN (sealform)
      x.buff(StatKey.DEF_PEN, (e >= 1 && r.sealformActive && r.e1DefPen) ? 0.15 : 0, x.source(SOURCE_E1))

      // E4 SPD buff (sealform)
      x.buff(StatKey.SPD_P, (e >= 4 && r.sealformActive && r.e4SpdBuff) ? 0.12 : 0, x.source(SOURCE_E4))

      // Super break modifier (sealform) - enables super break damage
      x.buff(StatKey.SUPER_BREAK_MODIFIER, (r.sealformActive) ? 0.60 : 0, x.source(SOURCE_TRACE))
    },

    precomputeMutualEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
    },

    precomputeTeammateEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const t = action.characterConditionals as Conditionals<typeof teammateContent>

      // Break vulnerability for team
      x.buff(
        StatKey.VULNERABILITY,
        t.teammateBreakVulnerability,
        x.damageType(DamageTag.BREAK).targets(TargetTag.FullTeam).source(SOURCE_TRACE),
      )

      // E4 SPD buff for team
      x.buff(StatKey.SPD_P, (e >= 4 && t.e4SpdBuff) ? 0.12 : 0, x.targets(TargetTag.FullTeam).source(SOURCE_E4))
    },

    finalizeCalculations: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      if (r.atkToBreakVulnerability) {
        const atk = x.getActionValue(StatKey.ATK, RappaEntities.Rappa)
        const atkOverStacks = Math.floor(TsUtils.precisionRound((atk - 2400) / 100))
        const buffValue = Math.min(0.08, Math.max(0, atkOverStacks) * 0.01) + 0.02

        x.buff(StatKey.VULNERABILITY, buffValue, x.damageType(DamageTag.BREAK).source(SOURCE_TRACE))
      }
    },

    newGpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      return wgsl`
if (${wgslTrue(r.atkToBreakVulnerability)}) {
  let atkOverStacks = floor((${containerActionVal(SELF_ENTITY_INDEX, StatKey.ATK, action.config)} - 2400.0) / 100.0);
  let breakVulnBuff = min(0.08, max(0.0, atkOverStacks) * 0.01) + 0.02;
  ${buff.hit(HKey.VULNERABILITY, 'breakVulnBuff').damageType(DamageTag.BREAK).wgsl(action)}
}
      `
    },
  }
}


const simulation: SimulationMetadata = {
  parts: {
    [Parts.Body]: [
      Stats.ATK_P,
    ],
    [Parts.Feet]: [
      Stats.SPD,
    ],
    [Parts.PlanarSphere]: [
      Stats.Imaginary_DMG,
      Stats.ATK_P,
    ],
    [Parts.LinkRope]: [
      Stats.BE,
    ],
  },
  substats: [
    Stats.BE,
    Stats.ATK_P,
    Stats.ATK,
    Stats.CD,
    Stats.CR,
  ],
  breakpoints: {
    [Stats.ATK]: 3200,
  },
  comboTurnAbilities: [
    NULL_TURN_ABILITY_NAME,
    START_ULT,
    END_BASIC,
    WHOLE_BASIC,
    START_BASIC,
    END_BREAK,
    WHOLE_SKILL,
  ],
  comboDot: 0,
  relicSets: [
    [Sets.IronCavalryAgainstTheScourge, Sets.IronCavalryAgainstTheScourge],
    [Sets.EagleOfTwilightLine, Sets.EagleOfTwilightLine],
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
      characterId: RUAN_MEI,
      lightCone: PAST_SELF_IN_MIRROR,
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
    [Stats.ATK]: 0.5,
    [Stats.ATK_P]: 0.5,
    [Stats.DEF]: 0,
    [Stats.DEF_P]: 0,
    [Stats.HP]: 0,
    [Stats.HP_P]: 0,
    [Stats.SPD]: 1,
    [Stats.CR]: 0,
    [Stats.CD]: 0,
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
    [Sets.IronCavalryAgainstTheScourge]: 1,
    [Sets.ThiefOfShootingMeteor]: 1,
    [Sets.EagleOfTwilightLine]: 1,

    [Sets.TaliaKingdomOfBanditry]: 1,
    [Sets.ForgeOfTheKalpagniLantern]: 1,
  },
  presets: [
    PresetEffects.WASTELANDER_SET,
  ],
  sortOption: SortOption.BASIC,
  hiddenColumns: [
    SortOption.ULT,
    SortOption.FUA,
    SortOption.DOT,
  ],
  simulation,
}

const display = {
  imageCenter: {
    x: 1125,
    y: 1175,
    z: 1,
  },
  showcaseColor: '#7789e2',
}

export const Rappa: CharacterConfig = {
  id: '1317',
  info: {},
  conditionals,
  scoring,
  display,
}

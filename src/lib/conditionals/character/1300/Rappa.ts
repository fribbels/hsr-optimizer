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
import { containerActionVal } from 'lib/gpu/injection/injectUtils'
import {
  wgsl,
  wgslTrue,
} from 'lib/gpu/injection/wgslUtils'
import { Source } from 'lib/optimization/buffSource'
import {
  HKey,
  StatKey,
} from 'lib/optimization/engine/config/keys'
import {
  DamageTag,
  ElementTag,
  SELF_ENTITY_INDEX,
  TargetTag,
} from 'lib/optimization/engine/config/tag'
import { type ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { buff } from 'lib/optimization/engine/container/gpuBuffBuilder'
import {
  AbilityKind,
  END_BASIC,
  END_BREAK,
  NULL_TURN_ABILITY_NAME,
  START_BASIC,
  START_ULT,
  WHOLE_BASIC,
  WHOLE_SKILL,
} from 'lib/optimization/rotation/turnAbilityConfig'
import { SortOption } from 'lib/optimization/sortOptions'
import { PresetEffects } from 'lib/scoring/presetEffects'
import {
  SPREAD_RELICS_4P_GENERAL_CONDITIONALS,
} from 'lib/scoring/scoringConstants'
import { wrappedFixedT } from 'lib/utils/i18nUtils'

import {
  floorSafe,
  precisionRound,
} from 'lib/utils/mathUtils'
import { type Eidolon } from 'types/character'
import { type CharacterConfig } from 'types/characterConfig'
import { type CharacterConditionalsController } from 'types/conditionals'
import { type Hit } from 'types/hitConditionalTypes'
import {
  type ScoringMetadata,
  type SimulationMetadata,
} from 'types/metadata'
import {
  type OptimizerAction,
  type OptimizerContext,
} from 'types/optimizer'

export const RappaEntities = createEnum('Rappa')
export const RappaAbilities: AbilityKind[] = [
  AbilityKind.BASIC,
  AbilityKind.SKILL,
  AbilityKind.BREAK,
]

const conditionals = (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Rappa')
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
  } = Source.character(Rappa.id)

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
      content: t('Content.sealformActive.content', { ultBeBuff: precisionRound(100 * ultBeBuff) }),
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
      content: t('Content.chargeStacks.content', { talentChargeMultiplier: precisionRound(100 * talentChargeMultiplier) }),
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
    actionDeclaration: () => [...RappaAbilities],
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
        [AbilityKind.BASIC]: r.sealformActive ? enhancedBasic : normalBasic,
        [AbilityKind.SKILL]: {
          hits: [
            HitDefinitionBuilder.standardSkill()
              .damageElement(ElementTag.Imaginary)
              .atkScaling(skillScaling)
              .toughnessDmg(10)
              .build(),
          ],
        },
        [AbilityKind.BREAK]: {
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
        const atkOverStacks = floorSafe((atk - 2400) / 100)
        const buffValue = Math.min(0.08, Math.max(0, atkOverStacks) * 0.01) + 0.02

        x.buff(StatKey.VULNERABILITY, buffValue, x.damageType(DamageTag.BREAK).source(SOURCE_TRACE))
      }
    },

    newGpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      return wgsl`
if (${wgslTrue(r.atkToBreakVulnerability)}) {
  let atkOverStacks = floorSafe((${containerActionVal(SELF_ENTITY_INDEX, StatKey.ATK, action.config)} - 2400.0) / 100.0);
  let breakVulnBuff = min(0.08, max(0.0, atkOverStacks) * 0.01) + 0.02;
  ${buff.hit(HKey.VULNERABILITY, 'breakVulnBuff').damageType(DamageTag.BREAK).wgsl(action)}
}
      `
    },
  }
}

const simulation = (): SimulationMetadata => ({
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
  presets: [
    PresetEffects.WASTELANDER_SET,
  ],
  sortOption: SortOption.BASIC,
  hiddenColumns: [
    SortOption.ULT,
    SortOption.FUA,
    SortOption.DOT,
  ],
  simulation: simulation(),
})

const display = {
  imageCenter: {
    x: 1163,
    y: 1198,
    z: 1.15,
  },
  spineCenter: {
    x: 857,
    y: 1228,
    z: 1.95,
  },
  showcaseColor: '#9190f8',
}

export const Rappa: CharacterConfig = {
  id: '1317',
  display,
  conditionals,
  get scoring() {
    return scoring()
  },
}

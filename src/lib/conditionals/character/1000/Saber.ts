import { AbilityEidolon, Conditionals, ContentDefinition, createEnum, } from 'lib/conditionals/conditionalUtils'
import { HitDefinitionBuilder } from 'lib/conditionals/hitDefinitionBuilder'
import { Parts, Sets, Stats } from 'lib/constants/constants'
import { Source } from 'lib/optimization/buffSource'
import { StatKey } from 'lib/optimization/engine/config/keys'
import { DamageTag, ElementTag, } from 'lib/optimization/engine/config/tag'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { SortOption } from 'lib/optimization/sortOptions'
import {
  NULL_TURN_ABILITY_NAME,
  START_ULT,
  END_BASIC,
  WHOLE_SKILL,
} from 'lib/optimization/rotation/turnAbilityConfig'
import {
  SPREAD_RELICS_2P_ATK_CRIT_WEIGHTS,
  SPREAD_RELICS_4P_GENERAL_CONDITIONALS,
  SPREAD_ORNAMENTS_2P_GENERAL_CONDITIONALS,
  T2_WEIGHT,
} from 'lib/scoring/scoringConstants'
import {
  SUNDAY,
  A_GROUNDED_ASCENT,
  TINGYUN,
  DANCE_DANCE_DANCE,
  HUOHUO,
  NIGHT_OF_FRIGHT,
} from 'lib/simulations/tests/testMetadataConstants'
import { TsUtils } from 'lib/utils/TsUtils'
import { Eidolon } from 'types/character'
import { CharacterConfig } from 'types/characterConfig'
import { CharacterConditionalsController } from 'types/conditionals'
import { SimulationMetadata, ScoringMetadata } from 'types/metadata'
import { OptimizerAction, OptimizerContext, } from 'types/optimizer'

export const SaberEntities = createEnum('Saber')
export const SaberAbilities = createEnum('BASIC', 'SKILL', 'ULT', 'BREAK')

const conditionals = (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Saber.Content')
  const { basic, skill, talent, ult } = AbilityEidolon.ULT_BASIC_3_SKILL_TALENT_5
  const {
    SOURCE_BASIC,
    SOURCE_SKILL,
    SOURCE_TALENT,
    SOURCE_TRACE,
    SOURCE_ULT,
    SOURCE_E1,
    SOURCE_E2,
    SOURCE_E4,
    SOURCE_E6,
  } = Source.character('1014')

  const basicScaling = basic(e, 1.00, 1.10)
  const basicEnhancedScaling = basic(e, 1.50, 1.65)
  const basicEnhancedExtraScaling = basic(e, 2.20, 2.42)

  const skillScaling = skill(e, 1.50, 1.65)
  const skillStackScaling = skill(e, 0.14, 0.154)

  const ultScaling = ult(e, 2.80, 3.08)
  const ultBounceScaling = ult(e, 1.10, 1.21)

  const talentDmgBuffScaling = talent(e, 0.60, 0.66)

  const defaults = {
    enhancedBasic: true,
    enhancedSkill: true,
    coreResonanceCdBuff: true,
    coreResonanceStacks: 12,
    talentDmgBuff: true,
    crBuff: true,
    cdBuff: true,
    e1DmgBuff: true,
    e2Buffs: true,
    e4ResPen: true,
    e6ResPen: true,
  }

  const teammateDefaults = {}

  const content: ContentDefinition<typeof defaults> = {
    enhancedBasic: {
      id: 'enhancedBasic',
      formItem: 'switch',
      text: t('enhancedBasic.text'),
      content: t('enhancedBasic.content'),
    },
    enhancedSkill: {
      id: 'enhancedSkill',
      formItem: 'switch',
      text: t('enhancedSkill.text'),
      content: t('enhancedSkill.content', { CoreResonanceExtraScaling: TsUtils.precisionRound(100 * skillStackScaling) }),
    },
    talentDmgBuff: {
      id: 'talentDmgBuff',
      formItem: 'switch',
      text: t('talentDmgBuff.text'),
      content: t('talentDmgBuff.content', { TalentDmgBuff: TsUtils.precisionRound(100 * talentDmgBuffScaling) }),
    },
    coreResonanceCdBuff: {
      id: 'coreResonanceCdBuff',
      formItem: 'switch',
      text: t('coreResonanceCdBuff.text'),
      content: t('coreResonanceCdBuff.content'),
    },
    coreResonanceStacks: {
      id: 'coreResonanceStacks',
      formItem: 'slider',
      text: t('coreResonanceStacks.text'),
      content: t('coreResonanceStacks.content', { CoreResonanceExtraScaling: TsUtils.precisionRound(100 * skillStackScaling) }),
      min: 0,
      max: 45,
    },
    crBuff: {
      id: 'crBuff',
      formItem: 'switch',
      text: t('crBuff.text'),
      content: t('crBuff.content'),
    },
    cdBuff: {
      id: 'cdBuff',
      formItem: 'switch',
      text: t('cdBuff.text'),
      content: t('cdBuff.content'),
    },
    e1DmgBuff: {
      id: 'e1DmgBuff',
      formItem: 'switch',
      text: t('e1DmgBuff.text'),
      content: t('e1DmgBuff.content'),
      disabled: e < 1,
    },
    e2Buffs: {
      id: 'e2Buffs',
      formItem: 'switch',
      text: t('e2Buffs.text'),
      content: t('e2Buffs.content'),
      disabled: e < 2,
    },
    e4ResPen: {
      id: 'e4ResPen',
      formItem: 'switch',
      text: t('e4ResPen.text'),
      content: t('e4ResPen.content'),
      disabled: e < 4,
    },
    e6ResPen: {
      id: 'e6ResPen',
      formItem: 'switch',
      text: t('e6ResPen.text'),
      content: t('e6ResPen.content'),
      disabled: e < 6,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {}

  return {
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,

    entityDeclaration: () => Object.values(SaberEntities),
    entityDefinition: (action: OptimizerAction, context: OptimizerContext) => ({
      [SaberEntities.Saber]: {
        primary: true,
        summon: false,
        memosprite: false,
      },
    }),

    actionDeclaration: () => Object.values(SaberAbilities),
    actionDefinition: (action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // Basic scaling: normal or enhanced (+ extra hit on single target)
      const basicTotalScaling = r.enhancedBasic
        ? basicEnhancedScaling + (context.enemyCount == 1 ? basicEnhancedExtraScaling : 0)
        : basicScaling
      const basicToughness = r.enhancedBasic ? 20 : 10

      // Skill scaling: base + enhanced stacks + E2 bonus
      const skillTotalScaling = skillScaling
        + (r.enhancedSkill ? r.coreResonanceStacks * skillStackScaling : 0)
        + (e >= 2 && r.e2Buffs ? 0.07 * r.coreResonanceStacks : 0)

      // ULT scaling: base + bounces divided by enemy count
      const ultTotalScaling = ultScaling + ultBounceScaling * 10 / context.enemyCount
      const ultToughness = 40 + 20 / context.enemyCount

      return {
        [SaberAbilities.BASIC]: {
          hits: [
            HitDefinitionBuilder.standardBasic()
              .damageElement(ElementTag.Wind)
              .atkScaling(basicTotalScaling)
              .toughnessDmg(basicToughness)
              .build(),
          ],
        },
        [SaberAbilities.SKILL]: {
          hits: [
            HitDefinitionBuilder.standardSkill()
              .damageElement(ElementTag.Wind)
              .atkScaling(skillTotalScaling)
              .toughnessDmg(20)
              .build(),
          ],
        },
        [SaberAbilities.ULT]: {
          hits: [
            HitDefinitionBuilder.standardUlt()
              .damageElement(ElementTag.Wind)
              .atkScaling(ultTotalScaling)
              .toughnessDmg(ultToughness)
              .build(),
          ],
        },
        [SaberAbilities.BREAK]: {
          hits: [
            HitDefinitionBuilder.standardBreak(ElementTag.Wind).build(),
          ],
        },
      }
    },
    actionModifiers: () => [],

    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // Trace buffs
      x.buff(StatKey.CD, r.cdBuff ? 0.50 : 0, x.source(SOURCE_TRACE))
      x.buff(StatKey.CR, r.crBuff ? 0.20 : 0, x.source(SOURCE_TRACE))
      x.buff(StatKey.CD, r.coreResonanceCdBuff ? 0.04 * 8 : 0, x.source(SOURCE_TRACE))

      // Talent DMG buff
      x.buff(StatKey.DMG_BOOST, r.talentDmgBuff ? talentDmgBuffScaling : 0, x.source(SOURCE_TALENT))

      // E1: DMG boost
      x.buff(StatKey.DMG_BOOST, (e >= 1 && r.e1DmgBuff) ? 0.60 : 0, x.source(SOURCE_E1))

      // E2: DEF PEN (skill scaling handled in actionDefinition)
      x.buff(StatKey.DEF_PEN, (e >= 2 && r.e2Buffs) ? 0.01 * 15 : 0, x.source(SOURCE_E2))

      // E4: Wind RES PEN
      x.buff(StatKey.RES_PEN, (e >= 4 && r.e4ResPen) ? 0.08 + 0.04 * 3 : 0, x.elements(ElementTag.Wind).source(SOURCE_E4))

      // E6: ULT RES PEN
      x.buff(StatKey.RES_PEN, (e >= 6 && r.e6ResPen) ? 0.20 : 0, x.damageType(DamageTag.ULT).source(SOURCE_E6))
    },

    precomputeMutualEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
    },

    finalizeCalculations: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
    },
    newGpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => '',
  }
}


const simulation: SimulationMetadata = {
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
      Stats.Wind_DMG,
    ],
    [Parts.LinkRope]: [
      Stats.ATK_P,
    ],
  },
  substats: [
    Stats.CD,
    Stats.CR,
    Stats.ATK_P,
    Stats.ATK,
  ],
  comboTurnAbilities: [
    NULL_TURN_ABILITY_NAME,
    START_ULT,
    END_BASIC,
    WHOLE_SKILL,
    WHOLE_SKILL,
  ],
  comboDot: 0,
  errRopeEidolon: 0,
  relicSets: [
    [Sets.WavestriderCaptain, Sets.WavestriderCaptain],
    [Sets.ScholarLostInErudition, Sets.ScholarLostInErudition],
    ...SPREAD_RELICS_4P_GENERAL_CONDITIONALS,
  ],
  ornamentSets: [
    Sets.InertSalsotto,
    Sets.FirmamentFrontlineGlamoth,
    ...SPREAD_ORNAMENTS_2P_GENERAL_CONDITIONALS,
  ],
  teammates: [
    {
      characterId: SUNDAY,
      lightCone: A_GROUNDED_ASCENT,
      characterEidolon: 0,
      lightConeSuperimposition: 1,
    },
    {
      characterId: TINGYUN,
      lightCone: DANCE_DANCE_DANCE,
      characterEidolon: 6,
      lightConeSuperimposition: 5,
    },
    {
      characterId: HUOHUO,
      lightCone: NIGHT_OF_FRIGHT,
      characterEidolon: 0,
      lightConeSuperimposition: 1,
    },
  ],
}

const scoring: ScoringMetadata = {
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
      Stats.EHR,
    ],
    [Parts.Feet]: [
      Stats.ATK_P,
      Stats.SPD,
    ],
    [Parts.PlanarSphere]: [
      Stats.ATK_P,
      Stats.Wind_DMG,
    ],
    [Parts.LinkRope]: [
      Stats.ATK_P,
      Stats.ERR,
    ],
  },
  sets: {
    ...SPREAD_RELICS_2P_ATK_CRIT_WEIGHTS,
    [Sets.WavestriderCaptain]: 1,
    [Sets.ScholarLostInErudition]: 1,

    [Sets.InertSalsotto]: 1,
    [Sets.RutilantArena]: 1,
    [Sets.SpaceSealingStation]: T2_WEIGHT,
  },
  presets: [],
  sortOption: SortOption.ULT,
  hiddenColumns: [
    SortOption.DOT,
  ],
  simulation,
}

const display = {
  imageCenter: {
    x: 900,
    y: 950,
    z: 1.05,
  },
  showcaseColor: '#3e65f2',
}

export const Saber: CharacterConfig = {
  id: '1014',
  info: {},
  conditionals,
  scoring,
  display,
}

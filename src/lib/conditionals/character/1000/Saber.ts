import { HuohuoB1 } from 'lib/conditionals/character/1200/HuohuoB1'
import { Tingyun } from 'lib/conditionals/character/1200/Tingyun'
import { Sunday } from 'lib/conditionals/character/1300/Sunday'
import {
  AbilityEidolon,
  type Conditionals,
  type ContentDefinition,
  createEnum,
} from 'lib/conditionals/conditionalUtils'
import { HitDefinitionBuilder } from 'lib/conditionals/hitDefinitionBuilder'
import { DanceDanceDance } from 'lib/conditionals/lightcone/4star/DanceDanceDance'
import { AGroundedAscent } from 'lib/conditionals/lightcone/5star/AGroundedAscent'
import { NightOfFright } from 'lib/conditionals/lightcone/5star/NightOfFright'
import {
  Parts,
  Sets,
  Stats,
} from 'lib/constants/constants'
import { Source } from 'lib/optimization/buffSource'
import { StatKey } from 'lib/optimization/engine/config/keys'
import {
  DamageTag,
  ElementTag,
} from 'lib/optimization/engine/config/tag'
import { type ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import {
  AbilityKind,
  END_BASIC,
  NULL_TURN_ABILITY_NAME,
  START_ULT,
  WHOLE_SKILL,
} from 'lib/optimization/rotation/turnAbilityConfig'
import { SortOption } from 'lib/optimization/sortOptions'
import {
  SPREAD_ORNAMENTS_2P_GENERAL_CONDITIONALS,
  SPREAD_RELICS_4P_GENERAL_CONDITIONALS,
} from 'lib/scoring/scoringConstants'
import { wrappedFixedT } from 'lib/utils/i18nUtils'
import { precisionRound } from 'lib/utils/mathUtils'
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

export const SaberEntities = createEnum('Saber')
export const SaberAbilities: AbilityKind[] = [
  AbilityKind.BASIC,
  AbilityKind.SKILL,
  AbilityKind.ULT,
  AbilityKind.BREAK,
]

const conditionals = (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Saber.Content')
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
  } = Source.character(Saber.id)

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
      content: t('enhancedSkill.content', { CoreResonanceExtraScaling: precisionRound(100 * skillStackScaling) }),
    },
    talentDmgBuff: {
      id: 'talentDmgBuff',
      formItem: 'switch',
      text: t('talentDmgBuff.text'),
      content: t('talentDmgBuff.content', { TalentDmgBuff: precisionRound(100 * talentDmgBuffScaling) }),
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
      content: t('coreResonanceStacks.content', { CoreResonanceExtraScaling: precisionRound(100 * skillStackScaling) }),
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

    actionDeclaration: () => [...SaberAbilities],
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
        [AbilityKind.BASIC]: {
          hits: [
            HitDefinitionBuilder.standardBasic()
              .damageElement(ElementTag.Wind)
              .atkScaling(basicTotalScaling)
              .toughnessDmg(basicToughness)
              .build(),
          ],
        },
        [AbilityKind.SKILL]: {
          hits: [
            HitDefinitionBuilder.standardSkill()
              .damageElement(ElementTag.Wind)
              .atkScaling(skillTotalScaling)
              .toughnessDmg(20)
              .build(),
          ],
        },
        [AbilityKind.ULT]: {
          hits: [
            HitDefinitionBuilder.standardUlt()
              .damageElement(ElementTag.Wind)
              .atkScaling(ultTotalScaling)
              .toughnessDmg(ultToughness)
              .build(),
          ],
        },
        [AbilityKind.BREAK]: {
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

const simulation = (): SimulationMetadata => ({
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
      characterId: Sunday.id,
      lightCone: AGroundedAscent.id,
      characterEidolon: 0,
      lightConeSuperimposition: 1,
    },
    {
      characterId: Tingyun.id,
      lightCone: DanceDanceDance.id,
      characterEidolon: 6,
      lightConeSuperimposition: 5,
    },
    {
      characterId: HuohuoB1.id,
      lightCone: NightOfFright.id,
      characterEidolon: 0,
      lightConeSuperimposition: 1,
    },
  ],
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
  presets: [],
  sortOption: SortOption.ULT,
  hiddenColumns: [
    SortOption.DOT,
  ],
  simulation: simulation(),
})

const display = {
  imageCenter: {
    x: 924,
    y: 944,
    z: 1.15,
  },
  backgroundCenterOffset: {
    x: 277,
    y: 213,
    z: 0.5,
  },
  showcaseColor: '#8395fb',
}

export const Saber: CharacterConfig = {
  id: '1014',
  display,
  conditionals,
  get scoring() {
    return scoring()
  },
}

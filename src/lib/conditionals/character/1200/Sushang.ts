import { AbilityEidolon, Conditionals, ContentDefinition, createEnum, } from 'lib/conditionals/conditionalUtils'
import { HitDefinitionBuilder } from 'lib/conditionals/hitDefinitionBuilder'
import { Parts, Sets, Stats } from 'lib/constants/constants'
import { SortOption } from 'lib/optimization/sortOptions'
import { Source } from 'lib/optimization/buffSource'
import { StatKey } from 'lib/optimization/engine/config/keys'
import { DamageTag, ElementTag, } from 'lib/optimization/engine/config/tag'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import {
  MATCH_2P_WEIGHT,
  SPREAD_ORNAMENTS_2P_GENERAL_CONDITIONALS,
  SPREAD_RELICS_2P_ATK_WEIGHTS,
  SPREAD_RELICS_4P_GENERAL_CONDITIONALS,
} from 'lib/scoring/scoringConstants'
import { TsUtils } from 'lib/utils/TsUtils'

import { Eidolon } from 'types/character'
import { CharacterConfig } from 'types/characterConfig'
import { ScoringMetadata, SimulationMetadata } from 'types/metadata'

import { CharacterConditionalsController } from 'types/conditionals'
import { OptimizerAction, OptimizerContext, } from 'types/optimizer'
import {
  DEFAULT_ULT,
  END_BREAK,
  NULL_TURN_ABILITY_NAME,
  START_SKILL,
  WHOLE_SKILL,
} from 'lib/optimization/rotation/turnAbilityConfig'
import {
  FUGUE,
  LINGSHA,
  THE_DAHLIA,
  LONG_ROAD_LEADS_HOME,
  NEVER_FORGET_HER_FLAME,
  SCENT_ALONE_STAYS_TRUE,
} from 'lib/simulations/tests/testMetadataConstants'

export const SushangEntities = createEnum('Sushang')
export const SushangAbilities = createEnum('BASIC', 'SKILL', 'ULT', 'BREAK')

const conditionals = (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Sushang')
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
  } = Source.character('1206')

  const talentSpdBuffValue = talent(e, 0.20, 0.21)
  const ultBuffedAtk = ult(e, 0.30, 0.324)
  const talentSpdBuffStacksMax = (e >= 6) ? 2 : 1

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 2.10, 2.31)
  const skillExtraHitScaling = skill(e, 1.00, 1.10)
  const ultScaling = ult(e, 3.20, 3.456)

  const defaults = {
    ultBuffedState: true,
    e2DmgReductionBuff: true,
    skillExtraHits: 3,
    skillTriggerStacks: 10,
    talentSpdBuffStacks: talentSpdBuffStacksMax,
  }

  const content: ContentDefinition<typeof defaults> = {
    ultBuffedState: {
      id: 'ultBuffedState',
      formItem: 'switch',
      text: t('Content.ultBuffedState.text'),
      content: t('Content.ultBuffedState.content', { ultBuffedAtk: TsUtils.precisionRound(100 * ultBuffedAtk) }),
    },
    skillExtraHits: {
      id: 'skillExtraHits',
      formItem: 'slider',
      text: t('Content.skillExtraHits.text'),
      content: t('Content.skillExtraHits.content'),
      min: 0,
      max: 3,
    },
    skillTriggerStacks: {
      id: 'skillTriggerStacks',
      formItem: 'slider',
      text: t('Content.skillTriggerStacks.text'),
      content: t('Content.skillTriggerStacks.content'),
      min: 0,
      max: 10,
    },
    talentSpdBuffStacks: {
      id: 'talentSpdBuffStacks',
      formItem: 'slider',
      text: t('Content.talentSpdBuffStacks.text'),
      content: t('Content.talentSpdBuffStacks.content', { talentSpdBuffValue: TsUtils.precisionRound(100 * talentSpdBuffValue) }),
      min: 0,
      max: talentSpdBuffStacksMax,
    },
    e2DmgReductionBuff: {
      id: 'e2DmgReductionBuff',
      formItem: 'switch',
      text: t('Content.e2DmgReductionBuff.text'),
      content: t('Content.e2DmgReductionBuff.content'),
      disabled: e < 2,
    },
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,

    entityDeclaration: () => Object.values(SushangEntities),
    entityDefinition: (action: OptimizerAction, context: OptimizerContext) => ({
      [SushangEntities.Sushang]: {
        primary: true,
        summon: false,
        memosprite: false,
      },
    }),

    actionDeclaration: () => Object.values(SushangAbilities),
    actionDefinition: (action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      let stanceSkillScaling = 0
      stanceSkillScaling += (r.skillExtraHits >= 1) ? skillExtraHitScaling : 0
      stanceSkillScaling += (r.ultBuffedState && r.skillExtraHits >= 2) ? skillExtraHitScaling * 0.5 : 0
      stanceSkillScaling += (r.ultBuffedState && r.skillExtraHits >= 3) ? skillExtraHitScaling * 0.5 : 0

      return {
        [SushangAbilities.BASIC]: {
          hits: [
            HitDefinitionBuilder.standardBasic()
              .damageElement(ElementTag.Physical)
              .atkScaling(basicScaling)
              .toughnessDmg(10)
              .build(),
          ],
        },
        [SushangAbilities.SKILL]: {
          hits: [
            HitDefinitionBuilder.standardSkill()
              .damageElement(ElementTag.Physical)
              .atkScaling(skillScaling)
              .toughnessDmg(20)
              .build(),
            ...(
              (stanceSkillScaling > 0)
                ? [
                  HitDefinitionBuilder.standardAdditional()
                    .damageElement(ElementTag.Physical)
                    .atkScaling(stanceSkillScaling)
                    .build(),
                ]
                : []
            ),
          ],
        },
        [SushangAbilities.ULT]: {
          hits: [
            HitDefinitionBuilder.standardUlt()
              .damageElement(ElementTag.Physical)
              .atkScaling(ultScaling)
              .toughnessDmg(30)
              .build(),
          ],
        },
        [SushangAbilities.BREAK]: {
          hits: [
            HitDefinitionBuilder.standardBreak(ElementTag.Physical).build(),
          ],
        },
      }
    },
    actionModifiers: () => [],

    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // E4: BE buff
      x.buff(StatKey.BE, (e >= 4) ? 0.40 : 0, x.source(SOURCE_E4))

      // ULT: ATK% buff
      x.buff(StatKey.ATK_P, (r.ultBuffedState) ? ultBuffedAtk : 0, x.source(SOURCE_ULT))

      // Talent: SPD% buff per stack
      x.buff(StatKey.SPD_P, r.talentSpdBuffStacks * talentSpdBuffValue, x.source(SOURCE_TALENT))

      // Trace: Additional DMG boost based on skill trigger stacks
      x.buff(StatKey.DMG_BOOST, r.skillTriggerStacks * 0.025, x.damageType(DamageTag.ADDITIONAL).source(SOURCE_SKILL))

      // E2: DMG reduction
      x.multiplicativeComplement(StatKey.DMG_RED, (e >= 2 && r.e2DmgReductionBuff) ? 0.20 : 0, x.source(SOURCE_E2))
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
    Stats.CR,
    Stats.CD,
    Stats.ATK_P,
    Stats.BE,
  ],
  comboTurnAbilities: [
    NULL_TURN_ABILITY_NAME,
    START_SKILL,
    DEFAULT_ULT,
    END_BREAK,
    WHOLE_SKILL,
    WHOLE_SKILL,
    WHOLE_SKILL,
  ],
  comboDot: 0,
  relicSets: [
    [Sets.ScholarLostInErudition, Sets.ScholarLostInErudition],
    [Sets.ChampionOfStreetwiseBoxing, Sets.ChampionOfStreetwiseBoxing],
    [Sets.IronCavalryAgainstTheScourge, Sets.IronCavalryAgainstTheScourge],
    ...SPREAD_RELICS_4P_GENERAL_CONDITIONALS,
  ],
  ornamentSets: [
    Sets.FirmamentFrontlineGlamoth,
    Sets.TaliaKingdomOfBanditry,
    ...SPREAD_ORNAMENTS_2P_GENERAL_CONDITIONALS,
    Sets.RutilantArena,
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
    [Stats.BE]: 0.5,
  },
  parts: {
    [Parts.Body]: [
      Stats.CR,
      Stats.CD,
      Stats.EHR,
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
  sets: {
    ...SPREAD_RELICS_2P_ATK_WEIGHTS,
    [Sets.WatchmakerMasterOfDreamMachinations]: MATCH_2P_WEIGHT,
    [Sets.ChampionOfStreetwiseBoxing]: 1,
    [Sets.ThiefOfShootingMeteor]: 1,

    [Sets.TaliaKingdomOfBanditry]: 1,
    [Sets.FirmamentFrontlineGlamoth]: 1,
    [Sets.SpaceSealingStation]: 1,
  },
  presets: [],
  sortOption: SortOption.SKILL,
  hiddenColumns: [SortOption.FUA, SortOption.DOT],
  simulation,
}

const display = {
  imageCenter: {
    x: 1075,
    y: 1015,
    z: 1.2,
  },
  showcaseColor: '#81adf1',
}

export const Sushang: CharacterConfig = {
  id: '1206',
  info: {},
  conditionals,
  scoring,
  display,
}

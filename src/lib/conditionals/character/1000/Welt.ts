import { Jiaoqiu } from 'lib/conditionals/character/1200/Jiaoqiu'
import { Acheron } from 'lib/conditionals/character/1300/Acheron'
import { PermansorTerrae } from 'lib/conditionals/character/1400/PermansorTerrae'
import {
  AbilityEidolon,
  type Conditionals,
  type ContentDefinition,
  createEnum,
} from 'lib/conditionals/conditionalUtils'
import { HitDefinitionBuilder } from 'lib/conditionals/hitDefinitionBuilder'
import { AlongThePassingShore } from 'lib/conditionals/lightcone/5star/AlongThePassingShore'
import { ThoseManySprings } from 'lib/conditionals/lightcone/5star/ThoseManySprings'
import { ThoughWorldsApart } from 'lib/conditionals/lightcone/5star/ThoughWorldsApart'
import {
  Parts,
  Sets,
  Stats,
} from 'lib/constants/constants'
import { Source } from 'lib/optimization/buffSource'
import { StatKey } from 'lib/optimization/engine/config/keys'
import {
  ElementTag,
  TargetTag,
} from 'lib/optimization/engine/config/tag'
import { type ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import {
  AbilityKind,
  END_SKILL,
  NULL_TURN_ABILITY_NAME,
  START_ULT,
  WHOLE_SKILL,
} from 'lib/optimization/rotation/turnAbilityConfig'
import { SortOption } from 'lib/optimization/sortOptions'
import { PresetEffects } from 'lib/scoring/presetEffects'
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

export const WeltEntities = createEnum('Welt')
export const WeltAbilities: AbilityKind[] = [
  AbilityKind.BASIC,
  AbilityKind.SKILL,
  AbilityKind.ULT,
  AbilityKind.BREAK,
]

const conditionals = (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Welt')
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
  } = Source.character(Welt.id)

  const skillExtraHitsMax = (e >= 6) ? 3 : 2

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 0.72, 0.792)
  const ultScaling = ult(e, 1.50, 1.62)
  const talentScaling = talent(e, 0.60, 0.66)

  const content: ContentDefinition<typeof defaults> = {
    enemyDmgTakenDebuff: {
      id: 'enemyDmgTakenDebuff',
      formItem: 'switch',
      text: t('Content.enemyDmgTakenDebuff.text'),
      content: t('Content.enemyDmgTakenDebuff.content'),
    },
    enemySlowed: {
      id: 'enemySlowed',
      formItem: 'switch',
      text: t('Content.enemySlowed.text'),
      content: t('Content.enemySlowed.content', { talentScaling: precisionRound(100 * talentScaling) }),
    },
    skillExtraHits: {
      id: 'skillExtraHits',
      formItem: 'slider',
      text: t('Content.skillExtraHits.text'),
      content: t('Content.skillExtraHits.content', { skillScaling: precisionRound(100 * skillScaling) }),
      min: 0,
      max: skillExtraHitsMax,
    },
    e1EnhancedState: {
      id: 'e1EnhancedState',
      formItem: 'switch',
      text: t('Content.e1EnhancedState.text'),
      content: t('Content.e1EnhancedState.content'),
      disabled: (e < 1),
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    enemyDmgTakenDebuff: content.enemyDmgTakenDebuff,
  }

  const defaults = {
    enemySlowed: true,
    enemyDmgTakenDebuff: true,
    skillExtraHits: skillExtraHitsMax,
    e1EnhancedState: true,
  }

  const teammateDefaults = {
    enemyDmgTakenDebuff: true,
  }

  return {
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,

    entityDeclaration: () => Object.values(WeltEntities),
    entityDefinition: (action: OptimizerAction, context: OptimizerContext) => ({
      [WeltEntities.Welt]: {
        primary: true,
        summon: false,
        memosprite: false,
      },
    }),

    actionDeclaration: () => [...WeltAbilities],
    actionDefinition: (action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // Calculate additional damage scaling for talent + E1
      const basicAdditionalScaling = r.enemySlowed
        ? talentScaling + (e >= 1 && r.e1EnhancedState ? 0.50 * basicScaling : 0)
        : 0
      const skillAdditionalScaling = r.enemySlowed
        ? talentScaling + (e >= 1 && r.e1EnhancedState ? 0.80 * skillScaling : 0)
        : 0
      const ultAdditionalScaling = r.enemySlowed ? talentScaling : 0

      // Skill total scaling includes base hit + extra bounces
      const skillTotalScaling = skillScaling * (1 + r.skillExtraHits)
      const skillToughness = 10 + 10 * r.skillExtraHits
      const skillAdditionalTotalScaling = skillAdditionalScaling * (1 + r.skillExtraHits)

      return {
        [AbilityKind.BASIC]: {
          hits: [
            HitDefinitionBuilder.standardBasic()
              .damageElement(ElementTag.Imaginary)
              .atkScaling(basicScaling)
              .toughnessDmg(10)
              .build(),
            ...(basicAdditionalScaling > 0
              ? [
                HitDefinitionBuilder.standardAdditional()
                  .damageElement(ElementTag.Imaginary)
                  .atkScaling(basicAdditionalScaling)
                  .build(),
              ]
              : []),
          ],
        },
        [AbilityKind.SKILL]: {
          hits: [
            HitDefinitionBuilder.standardSkill()
              .damageElement(ElementTag.Imaginary)
              .atkScaling(skillTotalScaling)
              .toughnessDmg(skillToughness)
              .build(),
            ...(skillAdditionalScaling > 0
              ? [
                HitDefinitionBuilder.standardAdditional()
                  .damageElement(ElementTag.Imaginary)
                  .atkScaling(skillAdditionalTotalScaling)
                  .build(),
              ]
              : []),
          ],
        },
        [AbilityKind.ULT]: {
          hits: [
            HitDefinitionBuilder.standardUlt()
              .damageElement(ElementTag.Imaginary)
              .atkScaling(ultScaling)
              .toughnessDmg(20)
              .build(),
            ...(ultAdditionalScaling > 0
              ? [
                HitDefinitionBuilder.standardAdditional()
                  .damageElement(ElementTag.Imaginary)
                  // Ult has 2 hits (10%/90%) so the talent procs twice
                  .atkScaling(ultAdditionalScaling * 2)
                  .build(),
              ]
              : []),
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

    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      // Trace: +20% Elemental DMG when enemy weakness broken
      const isWeaknessBroken = action.config.enemyWeaknessBroken
      x.buff(StatKey.DMG_BOOST, isWeaknessBroken ? 0.20 : 0, x.source(SOURCE_TRACE))
    },

    precomputeMutualEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      x.buff(StatKey.VULNERABILITY, (m.enemyDmgTakenDebuff) ? 0.12 : 0, x.targets(TargetTag.FullTeam).source(SOURCE_TRACE))
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
    ],
    [Parts.Feet]: [
      Stats.ATK_P,
      Stats.SPD,
    ],
    [Parts.PlanarSphere]: [
      Stats.ATK_P,
      Stats.Imaginary_DMG,
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
    END_SKILL,
    WHOLE_SKILL,
    WHOLE_SKILL,
  ],
  errRopeEidolon: 0,
  relicSets: [
    [Sets.PioneerDiverOfDeadWaters, Sets.PioneerDiverOfDeadWaters],
    [Sets.ScholarLostInErudition, Sets.ScholarLostInErudition],
    ...SPREAD_RELICS_4P_GENERAL_CONDITIONALS,
  ],
  ornamentSets: [
    Sets.RutilantArena,
    Sets.FirmamentFrontlineGlamoth,
    Sets.IzumoGenseiAndTakamaDivineRealm,
    ...SPREAD_ORNAMENTS_2P_GENERAL_CONDITIONALS,
  ],
  teammates: [
    {
      characterId: Acheron.id,
      lightCone: AlongThePassingShore.id,
      characterEidolon: 0,
      lightConeSuperimposition: 1,
    },
    {
      characterId: Jiaoqiu.id,
      lightCone: ThoseManySprings.id,
      characterEidolon: 0,
      lightConeSuperimposition: 1,
    },
    {
      characterId: PermansorTerrae.id,
      lightCone: ThoughWorldsApart.id,
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
    [Stats.EHR]: 1,
    [Stats.RES]: 0,
    [Stats.BE]: 0,
  },
  parts: {
    [Parts.Body]: [
      Stats.CD,
      Stats.CR,
      Stats.EHR,
    ],
    [Parts.Feet]: [
      Stats.ATK_P,
      Stats.SPD,
    ],
    [Parts.PlanarSphere]: [
      Stats.ATK_P,
      Stats.Imaginary_DMG,
    ],
    [Parts.LinkRope]: [
      Stats.ATK_P,
      Stats.ERR,
    ],
  },
  presets: [
    PresetEffects.WASTELANDER_SET,
    PresetEffects.fnPioneerSet(4),
  ],
  sortOption: SortOption.SKILL,
  hiddenColumns: [
    SortOption.FUA,
    SortOption.DOT,
  ],
  simulation: simulation(),
})

const display = {
  imageCenter: {
    x: 885,
    y: 950,
    z: 1,
  },
  disableSpine: true,
  showcaseColor: '#7877b9',
}

export const Welt: CharacterConfig = {
  id: '1004',
  display,
  conditionals,
  get scoring() {
    return scoring()
  },
}

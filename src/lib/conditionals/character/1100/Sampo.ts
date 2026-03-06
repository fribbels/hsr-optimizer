import {
  AbilityEidolon,
  Conditionals,
  ContentDefinition,
  createEnum,
} from 'lib/conditionals/conditionalUtils'
import { HitDefinitionBuilder } from 'lib/conditionals/hitDefinitionBuilder'
import { Parts, Sets, Stats } from 'lib/constants/constants'
import { Source } from 'lib/optimization/buffSource'
import { StatKey } from 'lib/optimization/engine/config/keys'
import {
  DamageTag,
  ElementTag,
  TargetTag,
} from 'lib/optimization/engine/config/tag'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { SortOption } from 'lib/optimization/sortOptions'
import {
  AbilityKind,
  NULL_TURN_ABILITY_NAME,
  DEFAULT_DOT,
  END_SKILL,
  START_ULT,
  WHOLE_SKILL,
} from 'lib/optimization/rotation/turnAbilityConfig'
import {
  SPREAD_RELICS_4P_GENERAL_CONDITIONALS,
} from 'lib/scoring/scoringConstants'
import { PresetEffects } from 'lib/scoring/presetEffects'
import { KafkaB1 } from 'lib/conditionals/character/1000/KafkaB1'
import { Hysilens } from 'lib/conditionals/character/1400/Hysilens'
import { PermansorTerrae } from 'lib/conditionals/character/1400/PermansorTerrae'
import { PatienceIsAllYouNeed } from 'lib/conditionals/lightcone/5star/PatienceIsAllYouNeed'
import { ThoughWorldsApart } from 'lib/conditionals/lightcone/5star/ThoughWorldsApart'
import { WhyDoesTheOceanSing } from 'lib/conditionals/lightcone/5star/WhyDoesTheOceanSing'
import { TsUtils } from 'lib/utils/TsUtils'

import { Eidolon } from 'types/character'
import { CharacterConfig } from 'types/characterConfig'

import { CharacterConditionalsController } from 'types/conditionals'
import { SimulationMetadata, ScoringMetadata } from 'types/metadata'
import {
  OptimizerAction,
  OptimizerContext,
} from 'types/optimizer'

export const SampoEntities = createEnum('Sampo')
export const SampoAbilities: AbilityKind[] = [
  AbilityKind.BASIC,
  AbilityKind.SKILL,
  AbilityKind.ULT,
  AbilityKind.DOT,
  AbilityKind.BREAK,
]

const conditionals = (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Sampo')
  const { basic, skill, ult, talent } = AbilityEidolon.SKILL_BASIC_3_ULT_TALENT_5
  const {
    SOURCE_ULT,
    SOURCE_TRACE,
  } = Source.character(Sampo.id)

  const dotVulnerabilityValue = ult(e, 0.30, 0.32)

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 0.56, 0.616)
  const ultScaling = ult(e, 1.60, 1.728)
  const dotScaling = talent(e, 0.52, 0.572)

  const maxExtraHits = e < 1 ? 4 : 5
  const defaults = {
    targetDotTakenDebuff: true,
    skillExtraHits: maxExtraHits,
    targetWindShear: true,
  }

  const teammateDefaults = {
    targetDotTakenDebuff: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    targetDotTakenDebuff: {
      id: 'targetDotTakenDebuff',
      formItem: 'switch',
      text: t('Content.targetDotTakenDebuff.text'),
      content: t('Content.targetDotTakenDebuff.content', { dotVulnerabilityValue: TsUtils.precisionRound(100 * dotVulnerabilityValue) }),
    },
    skillExtraHits: {
      id: 'skillExtraHits',
      formItem: 'slider',
      text: t('Content.skillExtraHits.text'),
      content: t('Content.skillExtraHits.content'),
      min: 1,
      max: maxExtraHits,
    },
    targetWindShear: {
      id: 'targetWindShear',
      formItem: 'switch',
      text: t('Content.targetWindShear.text'),
      content: t('Content.targetWindShear.content'),
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    targetDotTakenDebuff: content.targetDotTakenDebuff,
  }

  return {
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,

    entityDeclaration: () => Object.values(SampoEntities),
    entityDefinition: (action: OptimizerAction, context: OptimizerContext) => ({
      [SampoEntities.Sampo]: {
        primary: true,
        summon: false,
        memosprite: false,
      },
    }),

    actionDeclaration: () => [...SampoAbilities],
    actionDefinition: (action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // E6: DoT scaling +0.15
      const totalDotScaling = dotScaling + (e >= 6 ? 0.15 : 0)

      // Skill hits: 1 base + extra hits
      const totalSkillScaling = skillScaling * (1 + r.skillExtraHits)
      const skillToughness = 10 + 5 * r.skillExtraHits

      return {
        [AbilityKind.BASIC]: {
          hits: [
            HitDefinitionBuilder.standardBasic()
              .damageElement(ElementTag.Wind)
              .atkScaling(basicScaling)
              .toughnessDmg(10)
              .build(),
          ],
        },
        [AbilityKind.SKILL]: {
          hits: [
            HitDefinitionBuilder.standardSkill()
              .damageElement(ElementTag.Wind)
              .atkScaling(totalSkillScaling)
              .toughnessDmg(skillToughness)
              .build(),
          ],
        },
        [AbilityKind.ULT]: {
          hits: [
            HitDefinitionBuilder.standardUlt()
              .damageElement(ElementTag.Wind)
              .atkScaling(ultScaling)
              .toughnessDmg(20)
              .build(),
          ],
        },
        [AbilityKind.DOT]: {
          hits: [
            HitDefinitionBuilder.standardDot()
              .damageElement(ElementTag.Wind)
              .atkScaling(totalDotScaling)
              .dotBaseChance(0.65)
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

      x.multiplicativeComplement(StatKey.DMG_RED, (r.targetWindShear) ? 0.15 : 0, x.source(SOURCE_TRACE))
    },

    precomputeMutualEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      x.buff(
        StatKey.VULNERABILITY,
        (m.targetDotTakenDebuff) ? dotVulnerabilityValue : 0,
        x.damageType(DamageTag.DOT).targets(TargetTag.FullTeam).source(SOURCE_ULT),
      )
    },

    finalizeCalculations: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {},
    newGpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => '',
  }
}


const simulation = (): SimulationMetadata => ({
  parts: {
    [Parts.Body]: [
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
    Stats.ATK_P,
    Stats.EHR,
    Stats.ATK,
    Stats.CR,
    Stats.CD,
  ],
  comboTurnAbilities: [
    NULL_TURN_ABILITY_NAME,
    START_ULT,
    END_SKILL,
    DEFAULT_DOT,
    WHOLE_SKILL,
    DEFAULT_DOT,
    WHOLE_SKILL,
    DEFAULT_DOT,
  ],
  comboDot: 60,
  relicSets: [
    [Sets.PrisonerInDeepConfinement, Sets.PrisonerInDeepConfinement],
    ...SPREAD_RELICS_4P_GENERAL_CONDITIONALS,
  ],
  ornamentSets: [
    Sets.RevelryByTheSea,
    Sets.FirmamentFrontlineGlamoth,
  ],
  teammates: [
    {
      characterId: KafkaB1.id,
      lightCone: PatienceIsAllYouNeed.id,
      characterEidolon: 0,
      lightConeSuperimposition: 1,
    },
    {
      characterId: Hysilens.id,
      lightCone: WhyDoesTheOceanSing.id,
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
    [Stats.ATK]: 1,
    [Stats.ATK_P]: 1,
    [Stats.DEF]: 0,
    [Stats.DEF_P]: 0,
    [Stats.HP]: 0,
    [Stats.HP_P]: 0,
    [Stats.SPD]: 1,
    [Stats.CR]: 0,
    [Stats.CD]: 0,
    [Stats.EHR]: 1,
    [Stats.RES]: 0,
    [Stats.BE]: 0,
  },
  parts: {
    [Parts.Body]: [
      Stats.ATK_P,
      Stats.EHR,
    ],
    [Parts.Feet]: [
      Stats.SPD,
      Stats.ATK_P,
    ],
    [Parts.PlanarSphere]: [
      Stats.ATK_P,
      Stats.Wind_DMG,
    ],
    [Parts.LinkRope]: [
      Stats.ERR,
      Stats.ATK_P,
      Stats.BE,
    ],
  },
  presets: [
    PresetEffects.PRISONER_SET,
  ],
  sortOption: SortOption.DOT,
  hiddenColumns: [
    SortOption.FUA,
  ],
  simulation: simulation(),
})

const display = {
  imageCenter: {
    x: 1000,
    y: 950,
    z: 1,
  },
  showcaseColor: '#7777c9',
}

export const Sampo: CharacterConfig = {
  id: '1108',
  info: {},
  display,
  conditionals,
  get scoring() { return scoring() },
}

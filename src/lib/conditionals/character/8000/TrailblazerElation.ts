import { Huohuo } from 'lib/conditionals/character/1200/Huohuo'
import { SilverWolfLv999 } from 'lib/conditionals/character/1500/SilverWolfLv999'
import { Sparxie } from 'lib/conditionals/character/1500/Sparxie'
import { getYaoguangAhaPunchlineValue } from 'lib/conditionals/character/1500/Yaoguang'
import {
  AbilityEidolon,
  type Conditionals,
  type ContentDefinition,
  createEnum,
} from 'lib/conditionals/conditionalUtils'
import {
  dynamicStatConversionContainer,
  gpuDynamicStatConversion,
} from 'lib/conditionals/evaluation/statConversion'
import { HitDefinitionBuilder } from 'lib/conditionals/hitDefinitionBuilder'
import { DazzledByAFloweryWorld } from 'lib/conditionals/lightcone/5star/DazzledByAFloweryWorld'
import { NightOfFright } from 'lib/conditionals/lightcone/5star/NightOfFright'
import { WelcomeToTheCosmicCity } from 'lib/conditionals/lightcone/5star/WelcomeToTheCosmicCity'
import {
  ConditionalActivation,
  ConditionalType,
  Parts,
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
import type { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import {
  AbilityKind,
  NULL_TURN_ABILITY_NAME,
  START_ULT,
  WHOLE_ELATION_SKILL,
  WHOLE_SKILL,
} from 'lib/optimization/rotation/turnAbilityConfig'
import { SortOption } from 'lib/optimization/sortOptions'
import {
  SPREAD_ORNAMENTS_2P_ENERGY_REGEN,
  SPREAD_ORNAMENTS_2P_GENERAL_CONDITIONALS,
  SPREAD_ORNAMENTS_2P_SUPPORT,
  SPREAD_RELICS_4P_GENERAL_CONDITIONALS,
  SPREAD_RELICS_4P_SUPPORT,
} from 'lib/scoring/scoringConstants'
import { wrappedFixedT } from 'lib/utils/i18nUtils'
import {
  floorSafe,
  precisionRound,
} from 'lib/utils/mathUtils'

import type { Eidolon } from 'types/character'
import type { CharacterConfig } from 'types/characterConfig'
import type { CharacterConditionalsController } from 'types/conditionals'
import type { HitDefinition } from 'types/hitConditionalTypes'
import type {
  ScoringMetadata,
  SimulationMetadata,
} from 'types/metadata'
import type {
  OptimizerAction,
  OptimizerContext,
} from 'types/optimizer'

export const TrailblazerElationEntities = createEnum('TrailblazerElation')
export const TrailblazerElationAbilities: AbilityKind[] = [
  AbilityKind.BASIC,
  AbilityKind.SKILL,
  AbilityKind.ELATION_SKILL,
  AbilityKind.BREAK,
]

const conditionals = (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.TrailblazerElation.Content')
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
  } = Source.character(TrailblazerElationStelle.id)

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 0.60, 0.66)
  const ultCdBuffValue = ult(e, 0.50, 0.54)
  const talentSkillElationScaling = talent(e, 0.30, 0.33)

  const elationSkillBounceCount = 8
  const elationSkillBounceScaling = elationSkill(e, 0.20, 0.21, 0.22)
  const elationSkillAoeScaling = elationSkill(e, 0.60, 0.63, 0.66)

  const defaults = {
    certifiedBanger: true,
    punchlineStacks: 30,
    certifiedBangerStacks: 60,
    ultCdBuff: false,
    atkToElation: true,
    e2UltElation: true,
    e4Vulnerability: true,
    e6CritDmg: true,
  }

  const teammateDefaults = {
    ultCdBuff: true,
    e2UltElation: true,
    e4Vulnerability: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    punchlineStacks: {
      id: 'punchlineStacks',
      formItem: 'slider',
      text: t('punchlineStacks.text'),
      content: t('punchlineStacks.content'),
      min: 0,
      max: 100,
    },
    certifiedBanger: {
      id: 'certifiedBanger',
      formItem: 'switch',
      text: t('certifiedBanger.text'),
      content: t('certifiedBanger.content', {
        skillAdditionalElationScaling: precisionRound(100 * talentSkillElationScaling),
      }),
    },
    certifiedBangerStacks: {
      id: 'certifiedBangerStacks',
      formItem: 'slider',
      text: t('certifiedBangerStacks.text'),
      content: t('certifiedBangerStacks.content', {
        skillAdditionalElationScaling: precisionRound(100 * talentSkillElationScaling),
      }),
      min: 0,
      max: 200,
    },
    ultCdBuff: {
      id: 'ultCdBuff',
      formItem: 'switch',
      text: t('ultCdBuff.text'),
      content: t('ultCdBuff.content'),
    },
    atkToElation: {
      id: 'atkToElation',
      formItem: 'switch',
      text: t('atkToElation.text'),
      content: t('atkToElation.content'),
    },
    e2UltElation: {
      id: 'e2UltElation',
      formItem: 'switch',
      text: t('e2UltElation.text'),
      content: t('e2UltElation.content'),
      disabled: e < 2,
    },
    e4Vulnerability: {
      id: 'e4Vulnerability',
      formItem: 'switch',
      text: t('e4Vulnerability.text'),
      content: t('e4Vulnerability.content'),
      disabled: e < 4,
    },
    e6CritDmg: {
      id: 'e6CritDmg',
      formItem: 'switch',
      text: t('e6CritDmg.text'),
      content: t('e6CritDmg.content'),
      disabled: e < 6,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    ultCdBuff: content.ultCdBuff,
    e2UltElation: content.e2UltElation,
    e4Vulnerability: content.e4Vulnerability,
  }

  return {
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,

    entityDeclaration: () => Object.values(TrailblazerElationEntities),
    entityDefinition: (action: OptimizerAction, context: OptimizerContext) => ({
      [TrailblazerElationEntities.TrailblazerElation]: {
        primary: true,
        summon: false,
        memosprite: false,
      },
    }),

    actionDeclaration: () => [...TrailblazerElationAbilities],
    actionDefinition: (action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      const punchlineStacks = getYaoguangAhaPunchlineValue(action, context) ?? r.punchlineStacks
      const certifiedBangerStacks = r.certifiedBangerStacks

      const basicHit = HitDefinitionBuilder.standardBasic()
        .damageElement(ElementTag.Lightning)
        .atkScaling(basicScaling)
        .toughnessDmg(10)
        .build()

      const skillHit = HitDefinitionBuilder.standardSkill()
        .damageElement(ElementTag.Lightning)
        .atkScaling(skillScaling)
        .toughnessDmg(20)
        .build()

      const skillHits: HitDefinition[] = [skillHit]

      // Talent: Skill elation hit using highest CB among allies
      if (r.certifiedBanger) {
        skillHits.push(
          HitDefinitionBuilder.elation()
            .damageType(DamageTag.ELATION)
            .damageElement(ElementTag.Lightning)
            .elationScaling(talentSkillElationScaling)
            .punchlineStacks(certifiedBangerStacks)
            .toughnessDmg(0)
            .build(),
        )
      }

      // Elation Skill: bounces averaged per enemy + AoE split
      const elationSkillHit = HitDefinitionBuilder.elation()
        .damageType(DamageTag.ELATION)
        .damageElement(ElementTag.Lightning)
        .elationScaling(
          elationSkillBounceScaling * elationSkillBounceCount / context.enemyCount
            + elationSkillAoeScaling / context.enemyCount,
        )
        .punchlineStacks(punchlineStacks)
        .toughnessDmg(20)
        .build()

      return {
        [AbilityKind.BASIC]: { hits: [basicHit] },
        [AbilityKind.SKILL]: { hits: skillHits },
        [AbilityKind.ELATION_SKILL]: { hits: [elationSkillHit] },
        [AbilityKind.BREAK]: {
          hits: [
            HitDefinitionBuilder.standardBreak(ElementTag.Lightning).build(),
          ],
        },
      }
    },
    actionModifiers: () => [],

    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      x.buff(StatKey.CR, 0.15, x.source(SOURCE_TRACE))
      x.buff(StatKey.CD, (e >= 6 && r.e6CritDmg) ? 1.00 : 0, x.source(SOURCE_E6))
    },

    precomputeMutualEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      x.buff(StatKey.CD, (m.ultCdBuff) ? ultCdBuffValue : 0, x.targets(TargetTag.SingleTarget).source(SOURCE_ULT))
      x.buff(StatKey.ELATION, (e >= 2 && m.e2UltElation) ? 0.12 : 0, x.targets(TargetTag.FullTeam).source(SOURCE_E2))
      x.buff(StatKey.VULNERABILITY, (e >= 4 && m.e4Vulnerability) ? 0.10 : 0, x.targets(TargetTag.FullTeam).source(SOURCE_E4))
    },

    finalizeCalculations: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
    },
    newGpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => '',

    // Trace: ATK to Elation conversion
    dynamicConditionals: [{
      id: 'TrailblazerElationAtkElationConditional',
      type: ConditionalType.ABILITY,
      activation: ConditionalActivation.CONTINUOUS,
      dependsOn: [Stats.ATK],
      chainsTo: [Stats.Elation],
      condition: function(x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) {
        const r = action.characterConditionals as Conditionals<typeof content>
        return r.atkToElation
      },
      effect: function(x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) {
        dynamicStatConversionContainer(
          Stats.ATK,
          Stats.Elation,
          this,
          x,
          action,
          context,
          SOURCE_TRACE,
          (convertibleValue) => {
            if (convertibleValue < 1000) return 0
            return Math.min(0.60, floorSafe((convertibleValue - 1000) / 200) * 0.10)
          },
        )
      },
      gpu: function(action: OptimizerAction, context: OptimizerContext) {
        const r = action.characterConditionals as Conditionals<typeof content>

        return gpuDynamicStatConversion(
          Stats.ATK,
          Stats.Elation,
          this,
          action,
          context,
          `min(0.60, floorSafe((convertibleValue - 1000.0) / 200.0) * 0.10)`,
          `${wgslTrue(r.atkToElation)}`,
          `convertibleValue >= 1000.0`,
        )
      },
    }],
  }
}

const simulation = (): SimulationMetadata => ({
  parts: {
    [Parts.Body]: [
      Stats.CR,
      Stats.CD,
    ],
    [Parts.Feet]: [
      Stats.SPD,
      Stats.ATK_P,
    ],
    [Parts.PlanarSphere]: [
      Stats.Lightning_DMG,
      Stats.ATK_P,
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
    WHOLE_SKILL,
    WHOLE_SKILL,
    WHOLE_ELATION_SKILL,
    WHOLE_ELATION_SKILL,
  ],
  comboDot: 0,
  errRopeEidolon: 0,
  relicSets: [
    [Sets.EverGloriousMagicalGirl, Sets.EverGloriousMagicalGirl],
    [Sets.DivinerOfDistantReach, Sets.DivinerOfDistantReach],
    ...SPREAD_RELICS_4P_GENERAL_CONDITIONALS,
    ...SPREAD_RELICS_4P_SUPPORT,
  ],
  ornamentSets: [
    Sets.PunklordeStageZero,
    ...SPREAD_ORNAMENTS_2P_GENERAL_CONDITIONALS,
    ...SPREAD_ORNAMENTS_2P_ENERGY_REGEN,
    ...SPREAD_ORNAMENTS_2P_SUPPORT,
  ],
  teammates: [
    {
      characterId: SilverWolfLv999.id,
      lightCone: WelcomeToTheCosmicCity.id,
      characterEidolon: 0,
      lightConeSuperimposition: 1,
    },
    {
      characterId: Sparxie.id,
      lightCone: DazzledByAFloweryWorld.id,
      characterEidolon: 0,
      lightConeSuperimposition: 1,
    },
    {
      characterId: Huohuo.id,
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
    ],
    [Parts.Feet]: [
      Stats.SPD,
      Stats.ATK_P,
    ],
    [Parts.PlanarSphere]: [
      Stats.Lightning_DMG,
      Stats.ATK_P,
    ],
    [Parts.LinkRope]: [
      Stats.ERR,
      Stats.ATK_P,
    ],
  },
  presets: [],
  sortOption: SortOption.ELATION_SKILL,
  hiddenColumns: [SortOption.ULT, SortOption.FUA, SortOption.DOT],
  simulation: simulation(),
})

const display = {
  imageCenter: {
    x: 1035,
    y: 1014,
    z: 1,
  },
  showcaseColor: '#976be3',
}

export const TrailblazerElationCaelus: CharacterConfig = {
  id: '8009',
  display,
  conditionals,
  get scoring() {
    return scoring()
  },
}

export const TrailblazerElationStelle: CharacterConfig = {
  id: '8010',
  display,
  conditionals,
  get scoring() {
    return scoring()
  },
}

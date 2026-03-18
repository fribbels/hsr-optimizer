import i18next from 'i18next'
import { Huohuo } from 'lib/conditionals/character/1200/Huohuo'
import { Sparxie } from 'lib/conditionals/character/1500/Sparxie'

import { getYaoguangAhaPunchlineValue } from 'lib/conditionals/character/1500/Yaoguang'
import { TrailblazerElationStelle } from 'lib/conditionals/character/8000/TrailblazerElation'
import {
  AbilityEidolon,
  Conditionals,
  ContentDefinition,
  createEnum,
} from 'lib/conditionals/conditionalUtils'
import {
  dynamicStatConversionContainer,
  gpuDynamicStatConversion,
} from 'lib/conditionals/evaluation/statConversion'
import { HitDefinitionBuilder } from 'lib/conditionals/hitDefinitionBuilder'
import { TomorrowWithUsAll } from 'lib/conditionals/lightcone/4star/TomorrowWithUsAll'
import { DazzledByAFloweryWorld } from 'lib/conditionals/lightcone/5star/DazzledByAFloweryWorld'
import { NightOfFright } from 'lib/conditionals/lightcone/5star/NightOfFright'
import {
  ConditionalActivation,
  ConditionalType,
  CURRENT_DATA_VERSION,
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
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import {
  AbilityKind,
  END_BASIC,
  NULL_TURN_ABILITY_NAME,
  START_ULT,
  WHOLE_BASIC,
  WHOLE_ELATION_SKILL,
  WHOLE_UNIQUE,
} from 'lib/optimization/rotation/turnAbilityConfig'
import { SortOption } from 'lib/optimization/sortOptions'
import {
  SPREAD_ORNAMENTS_2P_GENERAL_CONDITIONALS,
  SPREAD_RELICS_4P_GENERAL_CONDITIONALS,
} from 'lib/scoring/scoringConstants'
import { Eidolon } from 'types/character'
import { CharacterConfig } from 'types/characterConfig'
import { CharacterConditionalsController } from 'types/conditionals'
import { HitDefinition } from 'types/hitConditionalTypes'
import {
  ScoringMetadata,
  SimulationMetadata,
} from 'types/metadata'
import {
  OptimizerAction,
  OptimizerContext,
} from 'types/optimizer'

export const SilverWolfLv999Entities = createEnum('SilverWolfLv999')
export const SilverWolfLv999Abilities: AbilityKind[] = [
  AbilityKind.BASIC,
  AbilityKind.SKILL,
  AbilityKind.ELATION_SKILL,
  AbilityKind.UNIQUE,
  AbilityKind.BREAK,
]

const conditionals = (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const betaContent = i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION })
  const { basic, skill, ult, talent, elationSkill } = AbilityEidolon.SKILL_BASIC_ELATION_SKILL_3_ULT_TALENT_ELATION_SKILL_5
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
    SOURCE_UNIQUE,
  } = Source.character(SilverWolfLv999.id)

  const basicScaling = basic(e, 1.00, 1.10)
  const enhancedBasicBounceScaling = basic(e, 1.60, 1.76)
  const enhancedBasicFinalHitScaling = basic(e, 0.60, 0.66)
  const hiddenRankingDmgBonus = 0.003

  const skillScaling = skill(e, 1.60, 1.76)

  const mysteryBoxElationScaling = ult(e, 0.34, 0.374)

  const talentCBElationScaling = talent(e, 0.40, 0.44)
  const talentCdBuff = talent(e, 0.30, 0.33)

  const elationSkillEnhancedScaling = elationSkill(e, 2.00, 2.10, 2.20)

  const defaults = {
    invinciblePlayer: true,
    certifiedBanger: true,
    punchlineStacks: 30,
    certifiedBangerStacks: 60,
    hiddenRanking: 80,
    atkToElation: true,
    e1MysteryBoxElation: true,
    e2ResPen: true,
    e4PunchlineBoost: true,
    e6Merrymake: true,
  }

  const teammateDefaults = {
    e2ResPen: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    invinciblePlayer: {
      id: 'invinciblePlayer',
      formItem: 'switch',
      text: 'Invincible Player state',
      content: betaContent,
    },
    punchlineStacks: {
      id: 'punchlineStacks',
      formItem: 'slider',
      text: 'Punchline stacks',
      content: betaContent,
      min: 0,
      max: 100,
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
    hiddenRanking: {
      id: 'hiddenRanking',
      formItem: 'slider',
      text: 'Hidden Ranking stacks',
      content: betaContent,
      min: 0,
      max: 160,
    },
    atkToElation: {
      id: 'atkToElation',
      formItem: 'switch',
      text: 'ATK to Elation conversion',
      content: betaContent,
    },
    e1MysteryBoxElation: {
      id: 'e1MysteryBoxElation',
      formItem: 'switch',
      text: 'E1 Mystery Box Elation',
      content: betaContent,
      disabled: e < 1,
    },
    e2ResPen: {
      id: 'e2ResPen',
      formItem: 'switch',
      text: 'E2 RES PEN',
      content: betaContent,
      disabled: e < 2,
    },
    e4PunchlineBoost: {
      id: 'e4PunchlineBoost',
      formItem: 'switch',
      text: 'E4 Punchline boost',
      content: betaContent,
      disabled: e < 4,
    },
    e6Merrymake: {
      id: 'e6Merrymake',
      formItem: 'switch',
      text: 'E6 Merrymake',
      content: betaContent,
      disabled: e < 6,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    e2ResPen: content.e2ResPen,
  }

  return {
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,

    entityDeclaration: () => Object.values(SilverWolfLv999Entities),
    entityDefinition: (action: OptimizerAction, context: OptimizerContext) => ({
      [SilverWolfLv999Entities.SilverWolfLv999]: {
        primary: true,
        summon: false,
        memosprite: false,
      },
    }),

    actionDeclaration: () => [...SilverWolfLv999Abilities],
    actionDefinition: (action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      const punchlineStacks = getYaoguangAhaPunchlineValue(action, context) ?? r.punchlineStacks
      const certifiedBangerStacks = r.certifiedBangerStacks

      // E4: Elation Skill +999 Punchline
      const elationSkillPunchline = punchlineStacks + ((e >= 4 && r.e4PunchlineBoost) ? 999 : 0)
      const hrMultiplier = 1 + hiddenRankingDmgBonus * r.hiddenRanking
      // E1: Mystery Box +200% Elation floor
      const e1ElationBoost = (e >= 1 && r.e1MysteryBoxElation) ? 2.00 : 0

      const basicHits: HitDefinition[] = []

      if (r.invinciblePlayer) {
        // Enhanced Basic: bounces + final hit averaged per enemy, converted to Elation
        const enhancedBasicElationScaling = (
          (enhancedBasicBounceScaling + enhancedBasicFinalHitScaling) / context.enemyCount
        ) * hrMultiplier

        basicHits.push(
          HitDefinitionBuilder.elation()
            .damageType(DamageTag.ELATION)
            .damageElement(ElementTag.Imaginary)
            .elationScaling(enhancedBasicElationScaling)
            .punchlineStacks(certifiedBangerStacks)
            .toughnessDmg(10 / context.enemyCount + 10)
            .build(),
        )
      } else {
        basicHits.push(
          HitDefinitionBuilder.standardBasic()
            .damageElement(ElementTag.Imaginary)
            .atkScaling(basicScaling)
            .toughnessDmg(10)
            .build(),
        )
      }

      // Talent: CB elation hit on Basic
      if (r.certifiedBanger) {
        basicHits.push(
          HitDefinitionBuilder.elation()
            .damageType(DamageTag.ELATION)
            .damageElement(ElementTag.Imaginary)
            .elationScaling(talentCBElationScaling)
            .punchlineStacks(certifiedBangerStacks)
            .toughnessDmg(0)
            .build(),
        )
      }

      const skillHit = HitDefinitionBuilder.standardSkill()
        .damageElement(ElementTag.Imaginary)
        .atkScaling(skillScaling)
        .toughnessDmg(10)
        .build()

      const skillHits: HitDefinition[] = [skillHit]

      // Talent: CB elation hit on Skill
      if (r.certifiedBanger) {
        skillHits.push(
          HitDefinitionBuilder.elation()
            .damageType(DamageTag.ELATION)
            .damageElement(ElementTag.Imaginary)
            .elationScaling(talentCBElationScaling)
            .punchlineStacks(certifiedBangerStacks)
            .toughnessDmg(0)
            .build(),
        )
      }

      const elationSkillHits: HitDefinition[] = []

      if (r.invinciblePlayer) {
        // Enhanced Elation Skill
        elationSkillHits.push(
          HitDefinitionBuilder.elation()
            .damageType(DamageTag.ELATION)
            .damageElement(ElementTag.Imaginary)
            .elationScaling(elationSkillEnhancedScaling)
            .punchlineStacks(elationSkillPunchline)
            .toughnessDmg(20)
            .build(),
        )
      }
      // Premium Supply Mystery Box
      const uniqueHit = HitDefinitionBuilder.elation()
        .damageType(DamageTag.ELATION)
        .damageElement(ElementTag.Imaginary)
        .elationScaling(mysteryBoxElationScaling)
        .punchlineStacks(certifiedBangerStacks)
        .minElationOverride(e1ElationBoost)
        .toughnessDmg(5)
        .build()

      return {
        [AbilityKind.BASIC]: { hits: basicHits },
        [AbilityKind.SKILL]: { hits: skillHits },
        [AbilityKind.ELATION_SKILL]: { hits: elationSkillHits },
        [AbilityKind.UNIQUE]: { hits: [uniqueHit] },
        [AbilityKind.BREAK]: {
          hits: [
            HitDefinitionBuilder.standardBreak(ElementTag.Imaginary).build(),
          ],
        },
      }
    },
    actionModifiers: () => [],

    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      x.buff(StatKey.CD, (r.invinciblePlayer) ? talentCdBuff : 0, x.source(SOURCE_TALENT))
      x.buff(StatKey.MERRYMAKING, (e >= 6 && r.e6Merrymake) ? 0.25 : 0, x.source(SOURCE_E6))
    },

    precomputeMutualEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      x.buff(StatKey.RES_PEN, (e >= 2 && m.e2ResPen) ? 0.20 : 0, x.targets(TargetTag.FullTeam).source(SOURCE_E2))
    },

    finalizeCalculations: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
    },
    newGpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => '',

    // Trace: ATK to Elation conversion
    dynamicConditionals: [{
      id: 'SilverWolfLv999AtkElationConditional',
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
            if (convertibleValue < 2000) return 0
            return Math.min(1.20, Math.floor((convertibleValue - 2000) / 100) * 0.05)
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
          `min(1.20, floor((convertibleValue - 2000.0) / 100.0) * 0.05)`,
          `${wgslTrue(r.atkToElation)}`,
          `convertibleValue >= 2000.0`,
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
      Stats.Imaginary_DMG,
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
    END_BASIC,
    WHOLE_UNIQUE,
    WHOLE_UNIQUE,
    WHOLE_ELATION_SKILL,
    WHOLE_BASIC,
    WHOLE_UNIQUE,
    WHOLE_UNIQUE,
    WHOLE_BASIC,
    WHOLE_UNIQUE,
    WHOLE_UNIQUE,
    WHOLE_ELATION_SKILL,
  ],
  comboDot: 0,
  errRopeEidolon: 0,
  relicSets: [
    [Sets.EverGloriousMagicalGirl, Sets.EverGloriousMagicalGirl],
    ...SPREAD_RELICS_4P_GENERAL_CONDITIONALS,
  ],
  ornamentSets: [
    Sets.PunklordeStageZero,
    Sets.TengokuLivestream,
    Sets.RutilantArena,
    ...SPREAD_ORNAMENTS_2P_GENERAL_CONDITIONALS,
  ],
  teammates: [
    {
      characterId: Sparxie.id,
      lightCone: DazzledByAFloweryWorld.id,
      characterEidolon: 0,
      lightConeSuperimposition: 1,
    },
    {
      characterId: TrailblazerElationStelle.id,
      lightCone: TomorrowWithUsAll.id,
      characterEidolon: 6,
      lightConeSuperimposition: 5,
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
      Stats.Imaginary_DMG,
      Stats.ATK_P,
    ],
    [Parts.LinkRope]: [
      Stats.ATK_P,
      Stats.ERR,
    ],
  },
  presets: [],
  sortOption: SortOption.BASIC,
  hiddenColumns: [SortOption.ULT, SortOption.FUA, SortOption.DOT],
  simulation: simulation(),
})

const display = {
  imageCenter: {
    x: 1015,
    y: 900,
    z: 1.10,
  },
  showcaseColor: '#5671dc',
}

export const SilverWolfLv999: CharacterConfig = {
  id: '1506',
  display,
  conditionals,
  get scoring() {
    return scoring()
  },
}

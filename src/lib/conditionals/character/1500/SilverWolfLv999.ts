import {
  getYaoguangAhaPunchlineValue,
  Yaoguang,
} from 'lib/conditionals/character/1500/Yaoguang'
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
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import {
  AbilityKind,
  DEFAULT_BASIC,
  DEFAULT_SKILL,
  NULL_TURN_ABILITY_NAME,
  START_ULT,
  WHOLE_BASIC,
  WHOLE_ELATION_SKILL,
} from 'lib/optimization/rotation/turnAbilityConfig'
import { SortOption } from 'lib/optimization/sortOptions'
import {
  SPREAD_ORNAMENTS_2P_GENERAL_CONDITIONALS,
  SPREAD_RELICS_4P_GENERAL_CONDITIONALS,
} from 'lib/scoring/scoringConstants'
import { TsUtils } from 'lib/utils/TsUtils'

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
  AbilityKind.BREAK,
  // TODO: Add AbilityKind.UNIQUE when implemented (Premium Supply Mystery Box)
]

const conditionals = (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.SilverWolfLv999')
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
  } = Source.character(SilverWolfLv999.id)

  // Basic ATK (lv6 / lv7 with E3+1)
  const basicScaling = basic(e, 1.00, 1.10)

  // Enhanced Basic ATK - Bounce (lv6 / lv7 with E3+1)
  // 100 bounces totaling bounceScaling, converted to Elation DMG by talent
  const enhancedBasicBounceScaling = basic(e, 1.60, 1.76)
  // Final Hit: split evenly among all enemies
  const enhancedBasicFinalHitScaling = basic(e, 0.60, 0.66)
  // Hidden Ranking DMG bonus: +0.3% per point
  const hiddenRankingDmgBonus = 0.003
  // Bounce count
  const enhancedBasicBounceCount = 100

  // Skill (lv10 / lv12 with E3+2)
  const skillScaling = skill(e, 1.60, 1.76)

  // Ult - Mystery Box elation scaling (lv10 / lv12 with E5+2)
  const mysteryBoxElationScaling = ult(e, 0.34, 0.374)

  // Talent (lv10 / lv12 with E5+2)
  const talentCBElationScaling = talent(e, 0.40, 0.44)
  const talentCdBuff = talent(e, 0.30, 0.33)

  // Enhanced Elation Skill: "Honkai-Level DPS Showcase" (lv10 / lv11 E3 / lv12 E5)
  const elationSkillEnhancedScaling = elationSkill(e, 2.00, 2.10, 2.20)

  const defaults = {
    invinciblePlayer: true,
    certifiedBanger: true,
    punchlineStacks: 30,
    certifiedBangerStacks: 60,
    hiddenRanking: 80,
    // TODO: Uncomment when AbilityKind.UNIQUE is implemented
    // mysteryBoxTriggers: 4,
    atkToElation: true,
    // TODO: Uncomment when AbilityKind.UNIQUE is implemented
    // e1MysteryBoxElation: true,
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
      content: t('Content.invinciblePlayer.content'),
    },
    certifiedBanger: {
      id: 'certifiedBanger',
      formItem: 'switch',
      text: 'Certified Banger',
      content: t('Content.certifiedBanger.content'),
    },
    punchlineStacks: {
      id: 'punchlineStacks',
      formItem: 'slider',
      text: 'Punchline stacks',
      content: t('Content.punchlineStacks.content'),
      min: 0,
      max: 100,
    },
    certifiedBangerStacks: {
      id: 'certifiedBangerStacks',
      formItem: 'slider',
      text: 'Certified Banger stacks',
      content: t('Content.certifiedBangerStacks.content'),
      min: 0,
      max: 200,
    },
    hiddenRanking: {
      id: 'hiddenRanking',
      formItem: 'slider',
      text: 'Hidden Ranking stacks',
      content: t('Content.hiddenRanking.content'),
      min: 0,
      max: 160,
    },
    // TODO: Uncomment when AbilityKind.UNIQUE is implemented
    // mysteryBoxTriggers: {
    //   id: 'mysteryBoxTriggers',
    //   formItem: 'slider',
    //   text: 'Mystery Box triggers',
    //   content: t('Content.mysteryBoxTriggers.content'),
    //   min: 0,
    //   max: 4,
    // },
    atkToElation: {
      id: 'atkToElation',
      formItem: 'switch',
      text: 'ATK to Elation conversion',
      content: t('Content.atkToElation.content'),
    },
    // TODO: Uncomment when AbilityKind.UNIQUE is implemented
    // E1: Mystery Box +2 Punchline, +200% Elation on Mystery Box DMG
    // e1MysteryBoxElation: {
    //   id: 'e1MysteryBoxElation',
    //   formItem: 'switch',
    //   text: 'E1 Mystery Box Elation',
    //   content: t('Content.e1MysteryBoxElation.content'),
    //   disabled: e < 1,
    // },
    e2ResPen: {
      id: 'e2ResPen',
      formItem: 'switch',
      text: 'E2 RES PEN',
      content: t('Content.e2ResPen.content'),
      disabled: e < 2,
    },
    e4PunchlineBoost: {
      id: 'e4PunchlineBoost',
      formItem: 'switch',
      text: 'E4 Punchline boost',
      content: t('Content.e4PunchlineBoost.content'),
      disabled: e < 4,
    },
    e6Merrymake: {
      id: 'e6Merrymake',
      formItem: 'switch',
      text: 'E6 Merrymake',
      content: t('Content.e6Merrymake.content'),
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

      // E4: Enhanced Elation Skill additionally takes into account +999 Punchline
      const elationSkillPunchline = punchlineStacks + ((e >= 4 && r.e4PunchlineBoost) ? 999 : 0)

      // Hidden Ranking DMG multiplier for Enhanced Basic ATK
      const hrMultiplier = 1 + hiddenRankingDmgBonus * r.hiddenRanking

      // Mystery Box triggers during Enhanced Basic: 2 base + 1 at HR>=40 + 1 at HR>=80
      // const mysteryBoxTriggersFromHR = 2 + (r.hiddenRanking >= 40 ? 1 : 0) + (r.hiddenRanking >= 80 ? 1 : 0)

      // ============== BASIC ==============

      const basicHits: HitDefinition[] = []

      if (r.invinciblePlayer) {
        // Enhanced Basic ATK: 100 bounces + Final Hit, converted to Elation DMG by talent
        // Bounces averaged per enemy + Final Hit split among all enemies
        const enhancedBasicElationScaling = (
          enhancedBasicBounceScaling * enhancedBasicBounceCount / context.enemyCount / enhancedBasicBounceCount
          + enhancedBasicFinalHitScaling / context.enemyCount
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
        // Normal Basic ATK: standard ATK damage
        basicHits.push(
          HitDefinitionBuilder.standardBasic()
            .damageElement(ElementTag.Imaginary)
            .atkScaling(basicScaling)
            .toughnessDmg(10)
            .build(),
        )
      }

      // Talent: CB elation hit on Basic ATK (normal or enhanced)
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

      // ============== SKILL ==============

      // Skill: AoE Imaginary DMG
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

      // ============== ELATION SKILL ==============

      const elationSkillHits: HitDefinition[] = []

      if (r.invinciblePlayer) {
        // Enhanced Elation Skill: "Honkai-Level DPS Showcase" — 200% Elation DMG AoE
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
      // Normal Elation Skill: "Hall-of-Fame Rewind" — gains 20 HR, no damage

      // ============== UNIQUE (Premium Supply Mystery Box) ==============
      // TODO: Uncomment when AbilityKind.UNIQUE is implemented
      // Mystery Box triggers during Enhanced Basic: 2 base + 1 at HR>=40 + 1 at HR>=80
      // Zone Mystery Box: triggered when ally spends SP in Zone (probabilistic)
      // E1: +200% Elation on Mystery Box DMG, +2 Punchline
      //
      // const mysteryBoxTriggers = r.mysteryBoxTriggers
      // const e1ElationBoost = (e >= 1 && r.e1MysteryBoxElation) ? 2.00 : 0
      //
      // const uniqueHits: HitDefinition[] = []
      // if (mysteryBoxTriggers > 0) {
      //   uniqueHits.push(
      //     HitDefinitionBuilder.elation()
      //       .damageType(DamageTag.ELATION)
      //       .damageElement(ElementTag.Imaginary)
      //       .elationScaling(mysteryBoxElationScaling * mysteryBoxTriggers)
      //       .punchlineStacks(certifiedBangerStacks)
      //       .minElationOverride(e1ElationBoost)
      //       .toughnessDmg(5 * mysteryBoxTriggers)
      //       .build(),
      //   )
      // }

      return {
        [AbilityKind.BASIC]: { hits: basicHits },
        [AbilityKind.SKILL]: { hits: skillHits },
        [AbilityKind.ELATION_SKILL]: { hits: elationSkillHits },
        [AbilityKind.BREAK]: {
          hits: [
            HitDefinitionBuilder.standardBreak(ElementTag.Imaginary).build(),
          ],
        },
        // TODO: Uncomment when AbilityKind.UNIQUE is implemented
        // [AbilityKind.UNIQUE]: { hits: uniqueHits },
      }
    },
    actionModifiers: () => [],

    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // Talent: CD +30% in Invincible Player state
      x.buff(StatKey.CD, (r.invinciblePlayer) ? talentCdBuff : 0, x.source(SOURCE_TALENT))

      // E6: Merrymake +25%
      x.buff(StatKey.MERRYMAKING, (e >= 6 && r.e6Merrymake) ? 0.25 : 0, x.source(SOURCE_E6))
    },

    precomputeMutualEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      // E2: Zone enemies All-Type RES reduced by 20%
      x.buff(StatKey.RES_PEN, (e >= 2 && m.e2ResPen) ? 0.20 : 0, x.targets(TargetTag.FullTeam).source(SOURCE_E2))
    },

    finalizeCalculations: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
    },
    newGpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => '',

    // Trace: False End Speedrun — ATK > 2000 → +5% Elation per 100 ATK, max 120%
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
      Stats.ERR,
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
    DEFAULT_BASIC,
    WHOLE_BASIC,
    WHOLE_BASIC,
    DEFAULT_SKILL,
    WHOLE_ELATION_SKILL,
  ],
  comboDot: 0,
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
      characterId: Yaoguang.id,
      lightCone: '23038', // TODO: verify lightcone
      characterEidolon: 0,
      lightConeSuperimposition: 1,
    },
    {
      characterId: Yaoguang.id, // TODO: placeholder teammate
      lightCone: '23038',
      characterEidolon: 0,
      lightConeSuperimposition: 1,
    },
    {
      characterId: Yaoguang.id, // TODO: placeholder teammate
      lightCone: '23038',
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
    x: 1024,
    y: 1024,
    z: 1,
  },
  showcaseColor: '#ffffff', // TODO: set showcase color
}

export const SilverWolfLv999: CharacterConfig = {
  id: '1506',
  display,
  conditionals,
  get scoring() {
    return scoring()
  },
}

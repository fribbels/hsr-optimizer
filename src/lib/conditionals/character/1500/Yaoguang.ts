import i18next from 'i18next'
import { AbilityEidolon, Conditionals, ContentDefinition, createEnum, } from 'lib/conditionals/conditionalUtils'
import { HitDefinitionBuilder } from 'lib/conditionals/hitDefinitionBuilder'
import { ConditionalActivation, ConditionalType, CURRENT_DATA_VERSION, Parts, Sets, Stats, } from 'lib/constants/constants'
import { dynamicStatConversionContainer, gpuDynamicStatConversion, } from 'lib/conditionals/evaluation/statConversion'
import { wgslTrue } from 'lib/gpu/injection/wgslUtils'
import { Source } from 'lib/optimization/buffSource'
import { ModifierContext } from 'lib/optimization/context/calculateActions'
import { StatKey } from 'lib/optimization/engine/config/keys'
import { DamageTag, ElementTag, TargetTag, } from 'lib/optimization/engine/config/tag'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { SortOption } from 'lib/optimization/sortOptions'
import {
  RELICS_2P_SPEED,
  SPREAD_ORNAMENTS_2P_ENERGY_REGEN,
  SPREAD_ORNAMENTS_2P_GENERAL_CONDITIONALS,
  SPREAD_ORNAMENTS_2P_SUPPORT,
  SPREAD_ORNAMENTS_2P_SUPPORT_WEIGHTS,
  SPREAD_RELICS_2P_SPEED_WEIGHTS,
  SPREAD_RELICS_4P_GENERAL_CONDITIONALS,
} from 'lib/scoring/scoringConstants'
import {
  BUT_THE_BATTLE_ISNT_OVER,
  DAZZLED_BY_A_FLOWERY_WORLD,
  HUOHUO,
  NIGHT_OF_FRIGHT,
  SPARXIE,
  SPARKLE_B1,
  YAO_GUANG,
} from 'lib/simulations/tests/testMetadataConstants'
import {
  END_ULT,
  NULL_TURN_ABILITY_NAME,
  START_SKILL,
  WHOLE_BASIC,
  WHOLE_ELATION_SKILL,
} from 'lib/optimization/rotation/turnAbilityConfig'
import { CharacterConfig } from 'types/characterConfig'
import { SimulationMetadata, ScoringMetadata } from 'types/metadata'
import { Eidolon } from 'types/character'
import { CharacterConditionalsController } from 'types/conditionals'
import { ElationHit } from 'types/hitConditionalTypes'
import { OptimizerAction, OptimizerContext, } from 'types/optimizer'

export const YaoguangEntities = createEnum('Yaoguang')
export const YaoguangAbilities = createEnum('BASIC', 'ELATION_SKILL', 'BREAK')

const conditionals = (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
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
  } = Source.character(YAO_GUANG)

  const betaContent = i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION })

  const basicScaling = basic(e, 0.90, 0.99)
  const skillElationBuff = skill(e, 0.20, 0.22)
  const ultResPenValue = ult(e, 0.20, 0.22)
  const talentElationScaling = talent(e, 0.20, 0.22)

  const elationSkillAoeScaling = elationSkill(e, 1.00, 1.05, 1.10)
  const elationSkillBounceCount = 5
  const elationSkillBounceScaling = elationSkill(e, 0.20, 0.21, 0.22)
  const elationSkillVulnerability = 0.16

  const ahaPunchlineValue = (e >= 1) ? 40 : 20

  const defaults = {
    punchlineStacks: 50,
    skillZoneActive: true,
    ultResPenBuff: true,
    certifiedBanger: true,
    ahaMoment: false,
    woesWhisperVulnerability: true,
    traceSpdElation: true,
    e1DefPen: true,
    e2ZoneSpdBuff: true,
    e6Merrymaking: true,
  }

  const teammateDefaults = {
    certifiedBanger: true,
    consumesSkillPoints: true,
    teammatePunchlineStacks: 50,
    skillZoneActive: true,
    teammateElationValue: 2.00,
    ultResPenBuff: true,
    woesWhisperVulnerability: true,
    e1DefPen: true,
    e2ZoneSpdBuff: true,
    e6Merrymaking: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    punchlineStacks: {
      id: 'punchlineStacks',
      formItem: 'slider',
      text: 'Punchline stacks',
      content: betaContent,
      min: 0,
      max: 200,
    },
    skillZoneActive: {
      id: 'skillZoneActive',
      formItem: 'switch',
      text: 'Skill Zone active',
      content: betaContent,
    },
    ultResPenBuff: {
      id: 'ultResPenBuff',
      formItem: 'switch',
      text: 'Ult RES PEN buff',
      content: betaContent,
    },
    certifiedBanger: {
      id: 'certifiedBanger',
      formItem: 'switch',
      text: 'Certified Banger',
      content: betaContent,
    },
    ahaMoment: {
      id: 'ahaMoment',
      formItem: 'switch',
      text: 'Aha Moment',
      content: betaContent,
    },
    woesWhisperVulnerability: {
      id: 'woesWhisperVulnerability',
      formItem: 'switch',
      text: 'Woe\'s Whisper vulnerability',
      content: betaContent,
    },
    traceSpdElation: {
      id: 'traceSpdElation',
      formItem: 'switch',
      text: 'SPD Elation buff',
      content: betaContent,
    },
    e1DefPen: {
      id: 'e1DefPen',
      formItem: 'switch',
      text: 'E1 Elation DEF PEN',
      content: betaContent,
      disabled: e < 1,
    },
    e2ZoneSpdBuff: {
      id: 'e2ZoneSpdBuff',
      formItem: 'switch',
      text: 'E2 Zone SPD buff',
      content: betaContent,
      disabled: e < 2,
    },
    e6Merrymaking: {
      id: 'e6Merrymaking',
      formItem: 'switch',
      text: 'E6 Merrymaking',
      content: betaContent,
      disabled: e < 6,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    certifiedBanger: content.certifiedBanger,
    consumesSkillPoints: {
      id: 'consumesSkillPoints',
      formItem: 'switch',
      text: 'Consumes skill points',
      content: betaContent,
    },
    teammatePunchlineStacks: {
      id: 'teammatePunchlineStacks',
      formItem: 'slider',
      text: `Yao Guang's Punchline stacks`,
      content: betaContent,
      min: 0,
      max: 200,
    },
    skillZoneActive: content.skillZoneActive,
    teammateElationValue: {
      id: 'teammateElationValue',
      formItem: 'slider',
      text: `Yao Guang's Elation`,
      content: betaContent,
      min: 0,
      max: 2.00,
      percent: true,
    },
    ultResPenBuff: content.ultResPenBuff,
    woesWhisperVulnerability: content.woesWhisperVulnerability,
    e1DefPen: content.e1DefPen,
    e2ZoneSpdBuff: content.e2ZoneSpdBuff,
    e6Merrymaking: content.e6Merrymaking,
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    teammateContent: () => Object.values(teammateContent),
    teammateDefaults: () => teammateDefaults,

    entityDeclaration: () => Object.values(YaoguangEntities),
    entityDefinition: (action: OptimizerAction, context: OptimizerContext) => ({
      [YaoguangEntities.Yaoguang]: {
        primary: true,
        summon: false,
        memosprite: false,
      },
    }),

    actionDeclaration: () => Object.values(YaoguangAbilities),
    actionDefinition: (action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>
      const punchline = (r.ahaMoment) ? ahaPunchlineValue : r.punchlineStacks

      // Combined Elation Skill scaling: AoE base + bounce hits averaged per enemy
      const baseElationScaling = elationSkillAoeScaling + elationSkillBounceCount * elationSkillBounceScaling / context.enemyCount
      const e6ElationMultiplier = (e >= 6 && r.e6Merrymaking) ? 2 : 1
      const combinedElationScaling = baseElationScaling * e6ElationMultiplier
      const combinedToughness = 20 + 5 * elationSkillBounceCount / context.enemyCount

      return {
        [YaoguangAbilities.BASIC]: {
          hits: [
            HitDefinitionBuilder.standardBasic()
              .damageElement(ElementTag.Physical)
              .atkScaling(basicScaling)
              .toughnessDmg(10)
              .build(),
          ],
        },
        [YaoguangAbilities.ELATION_SKILL]: {
          hits: [
            HitDefinitionBuilder.elation()
              .damageType(DamageTag.ELATION)
              .damageElement(ElementTag.Physical)
              .elationScaling(combinedElationScaling)
              .punchlineStacks(punchline)
              .toughnessDmg(combinedToughness)
              .build(),
          ],
        },
        [YaoguangAbilities.BREAK]: {
          hits: [
            HitDefinitionBuilder.standardBreak(ElementTag.Physical).build(),
          ],
        },
      }
    },
    actionModifiers: () => [{
      modify: (action: OptimizerAction, context: OptimizerContext, self: ModifierContext) => {
        if (!self.ownConditionals.certifiedBanger) return

        const hasDirectHit = action.hits?.some((hit) => hit.directHit)
        if (!hasDirectHit) return

        const punchline = (self.isTeammate)
          ? self.ownConditionals.teammatePunchlineStacks as number
          : ((self.ownConditionals.ahaMoment) ? ahaPunchlineValue : self.ownConditionals.punchlineStacks as number)

        // If attacker's Elation < Yaoguang's, use Yaoguang's Elation for Great Boon calculation
        const minElation = (self.isTeammate)
          ? self.ownConditionals.teammateElationValue as number
          : 0

        // Great Boon deals Elation DMG "of the corresponding Type" - match the attacker's element
        const attackElement = action.hits?.find((hit) => hit.directHit && hit.damageElement !== ElementTag.None)?.damageElement ?? ElementTag.None

        // Great Boon triggers 1 time, or 2 times if the attack consumes Skill Points
        const greatBoonCount = (self.isTeammate && self.ownConditionals.consumesSkillPoints) ? 2 : 1

        for (let i = 0; i < greatBoonCount; i++) {
          const greatBoonHit = HitDefinitionBuilder.elation()
            .damageType(DamageTag.ELATION)
            .damageElement(attackElement)
            .elationScaling(talentElationScaling)
            .punchlineStacks(punchline)
            .toughnessDmg(0)
            .build() as ElationHit
          greatBoonHit.minElationOverride = minElation

          action.hits!.push(greatBoonHit)
        }
      },
    }],

    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      x.buff(StatKey.CD, 0.60, x.source(SOURCE_TRACE))
    },

    precomputeMutualEffectsContainer: (
      x: ComputedStatsContainer,
      action: OptimizerAction,
      context: OptimizerContext,
      originalCharacterAction?: OptimizerAction,
    ) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      x.buff(StatKey.RES_PEN, (m.ultResPenBuff) ? ultResPenValue : 0, x.targets(TargetTag.FullTeam).source(SOURCE_ULT))

      x.buff(StatKey.VULNERABILITY, (m.woesWhisperVulnerability) ? elationSkillVulnerability : 0, x.targets(TargetTag.FullTeam).source(SOURCE_ELATION_SKILL))

      x.buff(StatKey.DEF_PEN, (e >= 1 && m.e1DefPen) ? 0.20 : 0, x.damageType(DamageTag.ELATION).targets(TargetTag.FullTeam).source(SOURCE_E1))

      x.buff(StatKey.SPD_P, (e >= 2 && m.skillZoneActive && m.e2ZoneSpdBuff) ? 0.12 : 0, x.targets(TargetTag.FullTeam).source(SOURCE_E2))

      x.buff(StatKey.ELATION, (e >= 2 && m.skillZoneActive && m.e2ZoneSpdBuff) ? 0.16 : 0, x.targets(TargetTag.FullTeam).source(SOURCE_E2))

      x.buff(StatKey.MERRYMAKING, (e >= 6 && m.e6Merrymaking) ? 0.25 : 0, x.targets(TargetTag.FullTeam).source(SOURCE_E6))

      const primaryAhaMoment = originalCharacterAction!.characterConditionals.ahaMoment
      x.buff(StatKey.FINAL_DMG_BOOST, (e >= 4 && primaryAhaMoment) ? 0.50 : 0, x.damageType(DamageTag.ELATION).targets(TargetTag.FullTeam).source(SOURCE_E4))
    },

    precomputeTeammateEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const t = action.characterConditionals as Conditionals<typeof teammateContent>

      const sharedElation = (t.skillZoneActive) ? t.teammateElationValue * skillElationBuff : 0
      x.buff(StatKey.UNCONVERTIBLE_ELATION_BUFF, sharedElation, x.targets(TargetTag.FullTeam).source(SOURCE_SKILL))
      x.buff(StatKey.ELATION, sharedElation, x.targets(TargetTag.FullTeam).source(SOURCE_SKILL))
    },
    finalizeCalculations: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {},
    newGpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => '',
    dynamicConditionals: [
      {
        id: 'YaoguangSpdElationConditional',
        type: ConditionalType.ABILITY,
        activation: ConditionalActivation.CONTINUOUS,
        dependsOn: [Stats.SPD],
        chainsTo: [Stats.Elation],
        condition: function(x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals as Conditionals<typeof content>
          return r.traceSpdElation
        },
        effect: function(x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) {
          dynamicStatConversionContainer(
            Stats.SPD,
            Stats.Elation,
            this,
            x,
            action,
            context,
            SOURCE_TRACE,
            (convertibleValue) => {
              if (convertibleValue < 120) return 0
              return 0.30 + Math.min(200, convertibleValue - 120) * 0.01
            },
          )
        },
        gpu: function(action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals as Conditionals<typeof content>

          return gpuDynamicStatConversion(
            Stats.SPD,
            Stats.Elation,
            this,
            action,
            context,
            `0.30 + min(200.0, convertibleValue - 120.0) * 0.01`,
            `${wgslTrue(r.traceSpdElation)}`,
            `convertibleValue >= 120.0`,
          )
        },
      },
      {
        id: 'YaoguangElationShareConditional',
        type: ConditionalType.ABILITY,
        activation: ConditionalActivation.CONTINUOUS,
        dependsOn: [Stats.Elation],
        chainsTo: [Stats.Elation],
        condition: function(x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals as Conditionals<typeof content>
          return r.skillZoneActive
        },
        effect: function(x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) {
          dynamicStatConversionContainer(
            Stats.Elation,
            Stats.Elation,
            this,
            x,
            action,
            context,
            SOURCE_SKILL,
            (convertibleValue) => convertibleValue * skillElationBuff,
          )
        },
        gpu: function(action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals as Conditionals<typeof content>

          return gpuDynamicStatConversion(
            Stats.Elation,
            Stats.Elation,
            this,
            action,
            context,
            `convertibleValue * ${skillElationBuff}`,
            `${wgslTrue(r.skillZoneActive)}`,
          )
        },
      },
    ],
  }
}


const simulation: SimulationMetadata = {
  parts: {
    [Parts.Body]: [
      Stats.CR,
      Stats.CD,
    ],
    [Parts.Feet]: [
      Stats.SPD,
    ],
    [Parts.PlanarSphere]: [
      Stats.ATK_P,
      Stats.Physical_DMG,
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
    Stats.SPD,
  ],
  comboTurnAbilities: [
    NULL_TURN_ABILITY_NAME,
    START_SKILL,
    END_ULT,
    WHOLE_ELATION_SKILL,
    WHOLE_BASIC,
    WHOLE_ELATION_SKILL,
    WHOLE_BASIC,
    WHOLE_ELATION_SKILL,
  ],
  comboDot: 0,
  errRopeEidolon: 0,
  deprioritizeBuffs: true,
  breakpoints: {
    [Stats.SPD]: 120,
  },
  relicSets: [
    [Sets.EverGloriousMagicalGirl, Sets.EverGloriousMagicalGirl],
    [Sets.DivinerOfDistantReach, Sets.DivinerOfDistantReach],
    RELICS_2P_SPEED,
    ...SPREAD_RELICS_4P_GENERAL_CONDITIONALS,
  ],
  ornamentSets: [
    Sets.TengokuLivestream,
    ...SPREAD_ORNAMENTS_2P_GENERAL_CONDITIONALS,
    ...SPREAD_ORNAMENTS_2P_ENERGY_REGEN,
    ...SPREAD_ORNAMENTS_2P_SUPPORT,
  ],
  teammates: [
    {
      characterId: SPARXIE,
      lightCone: DAZZLED_BY_A_FLOWERY_WORLD,
      characterEidolon: 0,
      lightConeSuperimposition: 1,
    },
    {
      characterId: SPARKLE_B1,
      lightCone: BUT_THE_BATTLE_ISNT_OVER,
      characterEidolon: 0,
      lightConeSuperimposition: 1,
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
    [Stats.ATK]: 0,
    [Stats.ATK_P]: 0,
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
    ],
    [Parts.PlanarSphere]: [],
    [Parts.LinkRope]: [
      Stats.ERR,
    ],
  },
  sets: {
    ...SPREAD_RELICS_2P_SPEED_WEIGHTS,
    [Sets.MessengerTraversingHackerspace]: 1,
    [Sets.SacerdosRelivedOrdeal]: 1,
    [Sets.EverGloriousMagicalGirl]: 1,

    [Sets.DivinerOfDistantReach]: 1,
    ...SPREAD_ORNAMENTS_2P_SUPPORT_WEIGHTS,
  },
  presets: [],
  sortOption: SortOption.ELATION_SKILL,
  hiddenColumns: [SortOption.ULT, SortOption.FUA, SortOption.DOT],
  simulation,
}

const display = {
  imageCenter: {
    x: 875,
    y: 1060,
    z: 1.15,
  },
  showcaseColor: '#c3d7d8',
}

export const Yaoguang: CharacterConfig = {
  id: '1502',
  info: {},
  conditionals,
  scoring,
  display,
}

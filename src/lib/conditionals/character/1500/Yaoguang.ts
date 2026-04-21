import { HuohuoB1 } from 'lib/conditionals/character/1200/HuohuoB1'
import { SparkleB1 } from 'lib/conditionals/character/1300/SparkleB1'
import { Sparxie } from 'lib/conditionals/character/1500/Sparxie'
import {
  AbilityEidolon,
  type Conditionals,
  type ContentDefinition,
  createEnum,
  findTeamAction,
  findTeamMeta,
} from 'lib/conditionals/conditionalUtils'
import {
  dynamicStatConversionContainer,
  gpuDynamicStatConversion,
} from 'lib/conditionals/evaluation/statConversion'
import { HitDefinitionBuilder } from 'lib/conditionals/hitDefinitionBuilder'
import { ButTheBattleIsntOver } from 'lib/conditionals/lightcone/5star/ButTheBattleIsntOver'
import { DazzledByAFloweryWorld } from 'lib/conditionals/lightcone/5star/DazzledByAFloweryWorld'
import { NightOfFright } from 'lib/conditionals/lightcone/5star/NightOfFright'
import {
  ConditionalActivation,
  ConditionalType,
  Parts,
  Sets,
  Stats,
} from 'lib/constants/constants'
import { wgslTrue } from 'lib/gpu/injection/wgslUtils'
import { Source } from 'lib/optimization/buffSource'
import { type ModifierContext } from 'lib/optimization/context/calculateActions'
import { StatKey } from 'lib/optimization/engine/config/keys'
import {
  DamageTag,
  ElementTag,
  TargetTag,
} from 'lib/optimization/engine/config/tag'
import { type ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { DamageFunctionType } from 'lib/optimization/engine/damage/damageCalculator'
import {
  AbilityKind,
  END_ULT,
  NULL_TURN_ABILITY_NAME,
  START_SKILL,
  WHOLE_BASIC,
  WHOLE_ELATION_SKILL,
} from 'lib/optimization/rotation/turnAbilityConfig'
import { SortOption } from 'lib/optimization/sortOptions'
import {
  SPREAD_ORNAMENTS_2P_ENERGY_REGEN,
  SPREAD_ORNAMENTS_2P_GENERAL_CONDITIONALS,
  SPREAD_ORNAMENTS_2P_SUPPORT,
  SPREAD_RELICS_4P_GENERAL_CONDITIONALS,
} from 'lib/scoring/scoringConstants'
import { relics2pByStats } from 'lib/sets/setConfigRegistry'
import { wrappedFixedT } from 'lib/utils/i18nUtils'
import { precisionRound } from 'lib/utils/mathUtils'
import {
  type CharacterConditionalFunction,
  type CharacterConfig,
} from 'types/characterConfig'
import { type ElationHit } from 'types/hitConditionalTypes'
import {
  type ScoringMetadata,
  type SimulationMetadata,
} from 'types/metadata'
import {
  type OptimizerAction,
  type OptimizerContext,
} from 'types/optimizer'

export const YaoguangEntities = createEnum('Yaoguang')
export const YaoguangAbilities: AbilityKind[] = [
  AbilityKind.BASIC,
  AbilityKind.ELATION_SKILL,
  AbilityKind.BREAK,
]

const conditionals: CharacterConditionalFunction = (e, withContent) => {
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
  } = Source.character(Yaoguang.id)

  const t = wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Yaoguang')

  const basicScaling = basic(e, 0.90, 0.99)
  const skillElationBuff = skill(e, 0.20, 0.22)
  const ultResPenValue = ult(e, 0.20, 0.22)
  const talentElationScaling = talent(e, 0.20, 0.22)

  const elationSkillAoeScaling = elationSkill(e, 1.00, 1.05, 1.10)
  const elationSkillBounceCount = 5
  const elationSkillBounceScaling = elationSkill(e, 0.20, 0.21, 0.22)
  const elationSkillVulnerability = 0.16

  const defaults = {
    punchlineStacks: 30,
    certifiedBangerStacks: 90,
    skillZoneActive: true,
    ultResPenBuff: true,
    certifiedBanger: true,
    yaoguangAhaInstant: false,
    woesWhisperVulnerability: true,
    traceSpdElation: true,
    e1DefPen: true,
    e2ZoneSpdBuff: true,
    e6Merrymaking: true,
  }

  const teammateDefaults = {
    certifiedBanger: true,
    consumesSkillPoints: true,
    yaoguangAhaInstant: false,
    teammateCertifiedBangerStacks: 90,
    skillZoneActive: true,
    teammateElationValue: 1.00,
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
      text: t('Content.punchlineStacks.text'),
      content: t('Content.punchlineStacks.content'),
      min: 0,
      max: 100,
    },
    certifiedBangerStacks: {
      id: 'certifiedBangerStacks',
      formItem: 'slider',
      text: t('Content.certifiedBangerStacks.text'),
      content: t('Content.certifiedBangerStacks.content'),
      min: 0,
      max: 200,
    },
    skillZoneActive: {
      id: 'skillZoneActive',
      formItem: 'switch',
      text: t('Content.skillZoneActive.text'),
      content: t('Content.skillZoneActive.content', { elationConversion: precisionRound(100 * skillElationBuff) }),
    },
    ultResPenBuff: {
      id: 'ultResPenBuff',
      formItem: 'switch',
      text: t('Content.ultResPenBuff.text'),
      content: t('Content.ultResPenBuff.content', { resPen: precisionRound(100 * ultResPenValue) }),
    },
    certifiedBanger: {
      id: 'certifiedBanger',
      formItem: 'switch',
      text: t('Content.certifiedBanger.text'),
      content: t('Content.certifiedBanger.content', { greatBoonScaling: precisionRound(100 * talentElationScaling) }),
    },
    yaoguangAhaInstant: {
      id: 'yaoguangAhaInstant',
      formItem: 'switch',
      text: t('Content.yaoguangAhaInstant.text'),
      content: t('Content.yaoguangAhaInstant.content', { punchlineCount: e >= 1 ? 40 : 20 }),
    },
    woesWhisperVulnerability: {
      id: 'woesWhisperVulnerability',
      formItem: 'switch',
      text: t('Content.woesWhisperVulnerability.text'),
      content: t('Content.woesWhisperVulnerability.content', { woeWhisperVulnerability: precisionRound(100 * elationSkillVulnerability) }),
    },
    traceSpdElation: {
      id: 'traceSpdElation',
      formItem: 'switch',
      text: t('Content.traceSpdElation.text'),
      content: t('Content.traceSpdElation.content'),
    },
    e1DefPen: {
      id: 'e1DefPen',
      formItem: 'switch',
      text: t('Content.e1DefPen.text'),
      content: t('Content.e1DefPen.content'),
      disabled: e < 1,
    },
    e2ZoneSpdBuff: {
      id: 'e2ZoneSpdBuff',
      formItem: 'switch',
      text: t('Content.e2ZoneSpdBuff.text'),
      content: t('Content.e2ZoneSpdBuff.content'),
      disabled: e < 2,
    },
    e6Merrymaking: {
      id: 'e6Merrymaking',
      formItem: 'switch',
      text: t('Content.e6Merrymaking.text'),
      content: t('Content.e6Merrymaking.content'),
      disabled: e < 6,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    certifiedBanger: content.certifiedBanger,
    consumesSkillPoints: {
      id: 'consumesSkillPoints',
      formItem: 'switch',
      text: t('TeammateContent.consumesSkillPoints.text'),
      content: t('TeammateContent.consumesSkillPoints.content', { greatBoonScaling: precisionRound(100 * talentElationScaling) }),
    },
    yaoguangAhaInstant: content.yaoguangAhaInstant,
    teammateCertifiedBangerStacks: {
      id: 'teammateCertifiedBangerStacks',
      formItem: 'slider',
      text: t('TeammateContent.teammateCertifiedBangerStacks.text'),
      content: t('TeammateContent.teammateCertifiedBangerStacks.content'),
      min: 0,
      max: 200,
    },
    skillZoneActive: content.skillZoneActive,
    teammateElationValue: {
      id: 'teammateElationValue',
      formItem: 'slider',
      text: t('TeammateContent.teammateElationValue.text'),
      content: t('TeammateContent.teammateElationValue.content'),
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

    actionDeclaration: () => [...YaoguangAbilities],
    actionDefinition: (action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>
      const punchlineStacks = getYaoguangAhaPunchlineValue(action, context) ?? r.punchlineStacks

      // Combined Elation Skill scaling: AoE base + bounce hits averaged per enemy
      const baseElationScaling = elationSkillAoeScaling + elationSkillBounceCount * elationSkillBounceScaling / context.enemyCount
      const e6ElationMultiplier = (e >= 6 && r.e6Merrymaking) ? 2 : 1
      const combinedElationScaling = baseElationScaling * e6ElationMultiplier
      const combinedToughness = 20 + 5 * elationSkillBounceCount / context.enemyCount

      return {
        [AbilityKind.BASIC]: {
          hits: [
            HitDefinitionBuilder.standardBasic()
              .damageElement(ElementTag.Physical)
              .atkScaling(basicScaling)
              .toughnessDmg(10)
              .build(),
          ],
        },
        [AbilityKind.ELATION_SKILL]: {
          hits: [
            HitDefinitionBuilder.elation()
              .damageType(DamageTag.ELATION)
              .damageElement(ElementTag.Physical)
              .elationScaling(combinedElationScaling)
              .punchlineStacks(punchlineStacks)
              .toughnessDmg(combinedToughness)
              .build(),
          ],
        },
        [AbilityKind.BREAK]: {
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

        const certifiedBangerStacks = (self.isTeammate)
          ? self.ownConditionals.teammateCertifiedBangerStacks as number
          : self.ownConditionals.certifiedBangerStacks as number

        // If attacker's Elation < Yaoguang's, use Yaoguang's Elation for Great Boon calculation
        const minElation = (self.isTeammate)
          ? self.ownConditionals.teammateElationValue as number
          : 0

        // Great Boon deals Elation DMG "of the corresponding Type" - match the attacker's element
        const attackElement = action.hits?.find((hit) => hit.directHit && hit.damageElement !== ElementTag.None)?.damageElement ?? ElementTag.None

        // Great Boon triggers 1 time, or 2 times if the attack consumes Skill Points
        // When proccing twice, double the elation scaling value instead of adding a second hit
        const firstHit = action.hits?.at(0)
        const spUsed = firstHit?.damageFunctionType === DamageFunctionType.Crit ? firstHit.skillPointsUsed : 0
        const isDoubleProc = self.isTeammate
          && self.ownConditionals.consumesSkillPoints
          && spUsed > 0
        const greatBoonCount = isDoubleProc ? 2 : 1

        const greatBoonHit = HitDefinitionBuilder.elation()
          .damageType(DamageTag.ELATION)
          .damageElement(attackElement)
          .elationScaling(talentElationScaling * greatBoonCount)
          .punchlineStacks(certifiedBangerStacks)
          .toughnessDmg(0)
          .build() as ElationHit
        greatBoonHit.minElationOverride = minElation

        action.hits!.push(greatBoonHit)
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

      x.multiplicativeBoost(
        StatKey.FINAL_DMG_BOOST,
        (e >= 4 && m.yaoguangAhaInstant) ? 0.50 : 0,
        x.damageType(DamageTag.ELATION).targets(TargetTag.FullTeam).actionKind(AbilityKind.ELATION_SKILL).source(SOURCE_E4),
      )
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

const simulation = (): SimulationMetadata => ({
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
  errRopeEidolon: 0,
  deprioritizeBuffs: true,
  breakpoints: {
    [Stats.SPD]: 120,
  },
  relicSets: [
    [Sets.EverGloriousMagicalGirl, Sets.EverGloriousMagicalGirl],
    [Sets.DivinerOfDistantReach, Sets.DivinerOfDistantReach],
    relics2pByStats(Stats.SPD_P),
    ...SPREAD_RELICS_4P_GENERAL_CONDITIONALS,
  ],
  ornamentSets: [
    Sets.TengokuLivestream,
    Sets.PunklordeStageZero,
    ...SPREAD_ORNAMENTS_2P_GENERAL_CONDITIONALS,
    ...SPREAD_ORNAMENTS_2P_ENERGY_REGEN,
    ...SPREAD_ORNAMENTS_2P_SUPPORT,
  ],
  teammates: [
    {
      characterId: Sparxie.id,
      lightCone: DazzledByAFloweryWorld.id,
      characterEidolon: 0,
      lightConeSuperimposition: 1,
    },
    {
      characterId: SparkleB1.id,
      lightCone: ButTheBattleIsntOver.id,
      characterEidolon: 0,
      lightConeSuperimposition: 1,
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
  presets: [],
  sortOption: SortOption.ELATION_SKILL,
  hiddenColumns: [SortOption.ULT, SortOption.FUA, SortOption.DOT],
  simulation: simulation(),
})

const display = {
  imageCenter: {
    x: 877,
    y: 1086,
    z: 1.2,
  },
  showcaseColor: '#37a6f4',
}

export function getYaoguangAhaPunchlineValue(action: OptimizerAction, context: OptimizerContext): number | undefined {
  const yaoguangAction = findTeamAction(action, Yaoguang.id)
  if (!yaoguangAction?.characterConditionals.yaoguangAhaInstant) return undefined

  const yaoguangEidolon = findTeamMeta(context, Yaoguang.id)?.characterEidolon ?? 0
  return (yaoguangEidolon >= 1) ? 40 : 20
}

export const Yaoguang: CharacterConfig = {
  id: '1502',
  display,
  conditionals,
  get scoring() {
    return scoring()
  },
}

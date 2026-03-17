import { Huohuo } from 'lib/conditionals/character/1200/Huohuo'
import {
  getYaoguangAhaPunchlineValue,
  Yaoguang,
} from 'lib/conditionals/character/1500/Yaoguang'
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
import { NightOfFright } from 'lib/conditionals/lightcone/5star/NightOfFright'
import { WhenSheDecidedToSee } from 'lib/conditionals/lightcone/5star/WhenSheDecidedToSee'
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
  DEFAULT_SKILL,
  NULL_TURN_ABILITY_NAME,
  START_ULT,
  WHOLE_ELATION_SKILL,
  WHOLE_SKILL,
  WHOLE_UNIQUE,
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

export const EvanesciaEntities = createEnum('Evanescia', 'FoxTeacher')
export const EvanesciaAbilities: AbilityKind[] = [
  AbilityKind.BASIC,
  AbilityKind.SKILL,
  AbilityKind.ULT,
  AbilityKind.ELATION_SKILL,
  AbilityKind.UNIQUE,
  AbilityKind.BREAK,
]

const conditionals = (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Evanescia')
  const { basic, skill, ult, talent, elationSkill } = AbilityEidolon.ULT_BASIC_ELATION_SKILL_3_SKILL_TALENT_ELATION_SKILL_5
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
  } = Source.character(Evanescia.id)

  const basicScaling = basic(e, 1.00, 1.10)
  const skillMainScaling = skill(e, 4.80, 5.28)
  const ultAoeScaling = ult(e, 2.40, 2.592)
  const ultBounceScaling = ult(e, 1.60, 1.728)

  const cdToElationRatio = talent(e, 0.25, 0.275)
  const talentSkillElationScaling = talent(e, 0.16, 0.176)
  const talentUltAoeElationScaling = talent(e, 0.22, 0.242)
  const talentUltBounceElationScaling = talent(e, 0.25, 0.276)
  const foxTeacherElationScaling = 0.25 // Fixed, not affected by talent level

  const elationSkillScaling = elationSkill(e, 1.00, 1.05, 1.10)

  const foxTeacherVulnStacksMax = e >= 2 ? 2 : 1

  const defaults = {
    certifiedBanger: true,
    punchlineStacks: 30,
    certifiedBangerStacks: 60,
    cdToElation: true,
    foxTeacherVulnStacks: foxTeacherVulnStacksMax,
    e1ResPen: true,
    e2Elation: true,
    e4DefPen: true,
    e6Merrymake: true,
  }

  const teammateDefaults = {
    foxTeacherVulnStacks: foxTeacherVulnStacksMax,
  }

  const content: ContentDefinition<typeof defaults> = {
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
    cdToElation: {
      id: 'cdToElation',
      formItem: 'switch',
      text: 'CD to Elation conversion',
      content: t('Content.cdToElation.content'),
    },
    foxTeacherVulnStacks: {
      id: 'foxTeacherVulnStacks',
      formItem: 'slider',
      text: 'Vulnerability stacks',
      content: t('Content.foxTeacherVulnStacks.content'),
      min: 0,
      max: foxTeacherVulnStacksMax,
    },
    e1ResPen: {
      id: 'e1ResPen',
      formItem: 'switch',
      text: 'E1 RES PEN',
      content: t('Content.e1ResPen.content'),
      disabled: e < 1,
    },
    e2Elation: {
      id: 'e2Elation',
      formItem: 'switch',
      text: 'E2 Elation boost',
      content: t('Content.e2Elation.content'),
      disabled: e < 2,
    },
    e4DefPen: {
      id: 'e4DefPen',
      formItem: 'switch',
      text: 'E4 DEF PEN',
      content: t('Content.e4DefPen.content'),
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
    foxTeacherVulnStacks: content.foxTeacherVulnStacks,
  }

  return {
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,

    entityDeclaration: () => Object.values(EvanesciaEntities),
    entityDefinition: (action: OptimizerAction, context: OptimizerContext) => ({
      [EvanesciaEntities.Evanescia]: {
        primary: true,
        summon: false,
        memosprite: false,
        pet: false,
      },
      [EvanesciaEntities.FoxTeacher]: {
        primary: false,
        summon: true,
        memosprite: false,
        pet: true,
      },
    }),

    actionDeclaration: () => [...EvanesciaAbilities],
    actionDefinition: (action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      const punchlineStacks = getYaoguangAhaPunchlineValue(action, context) ?? r.punchlineStacks
      const certifiedBangerStacks = r.certifiedBangerStacks

      // Ult: CB treated as at least 240 for elation hits
      const ultCertifiedBangerStacks = Math.max(240, certifiedBangerStacks)

      // Trace: Shared Exultation — Ult bounce bonus based on enemy count
      const traceBouncebonus = context.enemyCount >= 3 ? 1 : context.enemyCount === 2 ? 2 : 4
      const totalBounceCount = 5 + traceBouncebonus

      // E1: Fox Teacher triggers extra Elation Skill
      const e1ElationSkillMultiplier = (e >= 1 && r.e1ResPen) ? 2 : 1

      // ============== BASIC ==============

      const basicHit = HitDefinitionBuilder.standardBasic()
        .damageElement(ElementTag.Physical)
        .atkScaling(basicScaling)
        .toughnessDmg(10)
        .build()

      // ============== SKILL ==============

      const skillHit = HitDefinitionBuilder.standardSkill()
        .damageElement(ElementTag.Physical)
        .atkScaling(skillMainScaling)
        .toughnessDmg(20)
        .build()

      const skillHits: HitDefinition[] = [skillHit]

      // Talent: Skill elation hit (16% to target)
      if (r.certifiedBanger) {
        skillHits.push(
          HitDefinitionBuilder.elation()
            .damageType(DamageTag.ELATION)
            .damageElement(ElementTag.Physical)
            .elationScaling(talentSkillElationScaling)
            .punchlineStacks(certifiedBangerStacks)
            .toughnessDmg(0)
            .build(),
        )
      }

      // ============== ULT ==============

      // AoE hit + bounces averaged per enemy
      const ultHit = HitDefinitionBuilder.standardUlt()
        .damageElement(ElementTag.Physical)
        .atkScaling(ultAoeScaling + ultBounceScaling * totalBounceCount / context.enemyCount)
        .toughnessDmg(10 + 10 * totalBounceCount / context.enemyCount)
        .build()

      const ultHits: HitDefinition[] = [ultHit]

      // Talent: Ult AoE elation hit (22% to all enemies) + bounce elation hit (25% to random)
      if (r.certifiedBanger) {
        ultHits.push(
          HitDefinitionBuilder.elation()
            .damageType(DamageTag.ELATION)
            .damageElement(ElementTag.Physical)
            .elationScaling(talentUltAoeElationScaling + talentUltBounceElationScaling / context.enemyCount)
            .punchlineStacks(ultCertifiedBangerStacks)
            .toughnessDmg(0)
            .build(),
        )
      }

      // ============== ELATION SKILL ==============

      // Elation Skill: 100% Elation DMG to all enemies (E1: triggers twice)
      const elationSkillHit = HitDefinitionBuilder.elation()
        .sourceEntity(EvanesciaEntities.FoxTeacher)
        .damageType(DamageTag.ELATION)
        .damageElement(ElementTag.Physical)
        .elationScaling(elationSkillScaling * e1ElationSkillMultiplier)
        .punchlineStacks(punchlineStacks)
        .toughnessDmg(20)
        .build()

      // ============== UNIQUE: Fox Teacher 240-energy passive ==============

      // Talent: When energy accumulated to 240, Fox Teacher deals 25% Physical Elation DMG to all enemies
      const foxTeacherHits: HitDefinition[] = []
      if (r.certifiedBanger) {
        foxTeacherHits.push(
          HitDefinitionBuilder.elation()
            .sourceEntity(EvanesciaEntities.FoxTeacher)
            .damageType(DamageTag.ELATION)
            .damageElement(ElementTag.Physical)
            .elationScaling(foxTeacherElationScaling)
            .punchlineStacks(certifiedBangerStacks)
            .toughnessDmg(0)
            .build(),
        )
      }

      return {
        [AbilityKind.BASIC]: { hits: [basicHit] },
        [AbilityKind.SKILL]: { hits: skillHits },
        [AbilityKind.ULT]: { hits: ultHits },
        [AbilityKind.ELATION_SKILL]: { hits: [elationSkillHit] },
        [AbilityKind.UNIQUE]: { hits: foxTeacherHits },
        [AbilityKind.BREAK]: {
          hits: [
            HitDefinitionBuilder.standardBreak(ElementTag.Physical).build(),
          ],
        },
      }
    },
    actionModifiers: () => [],

    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // Trace: Shared Exultation — CR +30%
      x.buff(StatKey.CR, 0.30, x.source(SOURCE_TRACE))

      // E1: All-Type RES PEN +20%
      x.buff(StatKey.RES_PEN, (e >= 1 && r.e1ResPen) ? 0.20 : 0, x.source(SOURCE_E1))

      // E2: Elation +25%
      x.buff(StatKey.ELATION, (e >= 2 && r.e2Elation) ? 0.25 : 0, x.source(SOURCE_E2))

      // E4: DEF PEN +15%
      x.buff(StatKey.DEF_PEN, (e >= 4 && r.e4DefPen) ? 0.15 : 0, x.source(SOURCE_E4))

      // E6: Merrymake +25%
      x.buff(StatKey.MERRYMAKING, (e >= 6 && r.e6Merrymake) ? 0.25 : 0, x.source(SOURCE_E6))
    },

    precomputeMutualEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      // Trace: Fulfilled Adjudication — Fox Teacher Vulnerability (12% per stack, E2: up to 2 stacks)
      x.buff(StatKey.VULNERABILITY, m.foxTeacherVulnStacks * 0.12, x.targets(TargetTag.FullTeam).source(SOURCE_TRACE))
    },

    finalizeCalculations: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
    },
    newGpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => '',

    // Talent: CD → Elation conversion (25% of CD)
    dynamicConditionals: [{
      id: 'EvanesciaCdElationConditional',
      type: ConditionalType.ABILITY,
      activation: ConditionalActivation.CONTINUOUS,
      dependsOn: [Stats.CD],
      chainsTo: [Stats.Elation],
      condition: function(x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) {
        const r = action.characterConditionals as Conditionals<typeof content>
        return r.cdToElation
      },
      effect: function(x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) {
        dynamicStatConversionContainer(
          Stats.CD,
          Stats.Elation,
          this,
          x,
          action,
          context,
          SOURCE_TALENT,
          (convertibleValue) => cdToElationRatio * convertibleValue,
        )
      },
      gpu: function(action: OptimizerAction, context: OptimizerContext) {
        const r = action.characterConditionals as Conditionals<typeof content>

        return gpuDynamicStatConversion(
          Stats.CD,
          Stats.Elation,
          this,
          action,
          context,
          `${cdToElationRatio} * convertibleValue`,
          `${wgslTrue(r.cdToElation)}`,
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
      Stats.Physical_DMG,
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
    DEFAULT_SKILL,
    WHOLE_SKILL,
    WHOLE_ELATION_SKILL,
    WHOLE_UNIQUE,
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
      characterId: Yaoguang.id,
      lightCone: WhenSheDecidedToSee,
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
      Stats.Physical_DMG,
      Stats.ATK_P,
    ],
    [Parts.LinkRope]: [
      Stats.ATK_P,
      Stats.ERR,
    ],
  },
  presets: [],
  sortOption: SortOption.ULT,
  hiddenColumns: [SortOption.FUA, SortOption.DOT],
  simulation: simulation(),
})

const display = {
  imageCenter: {
    x: 1050,
    y: 950,
    z: 1.10,
  },
  showcaseColor: '#e6aadc',
}

export const Evanescia: CharacterConfig = {
  id: '1505',
  display,
  conditionals,
  get scoring() {
    return scoring()
  },
}

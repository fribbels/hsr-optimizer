import { Huohuo } from 'lib/conditionals/character/1200/Huohuo'
import {
  getYaoguangAhaPunchlineValue,
  Yaoguang,
} from 'lib/conditionals/character/1500/Yaoguang'
import { TrailblazerElationStelle } from 'lib/conditionals/character/8000/TrailblazerElation'
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
import { MushyShroomysAdventures } from 'lib/conditionals/lightcone/4star/MushyShroomysAdventures'
import { ElationBrimmingWithBlessings } from 'lib/conditionals/lightcone/5star/ElationBrimmingWithBlessings'
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
import { StatKey } from 'lib/optimization/engine/config/keys'
import {
  DamageTag,
  ElementTag,
  TargetTag,
} from 'lib/optimization/engine/config/tag'
import type { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import {
  AbilityKind,
  DEFAULT_ELATION_SKILL,
  DEFAULT_ULT,
  DEFAULT_UNIQUE,
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

export const EvanesciaEntities = createEnum('Evanescia')
export const EvanesciaAbilities: AbilityKind[] = [
  AbilityKind.BASIC,
  AbilityKind.SKILL,
  AbilityKind.ULT,
  AbilityKind.ELATION_SKILL,
  AbilityKind.UNIQUE,
  AbilityKind.BREAK,
]

const conditionals = (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Evanescia.Content')
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
  const skillMainScaling = skill(e, 3.00, 3.30)
  const ultAoeScaling = ult(e, 1.60, 1.76)
  const ultBounceScaling = ult(e, 1.20, 1.296)

  const cdToElationRatio = 0.20
  const talentSkillElationScaling = talent(e, 0.16, 0.176)
  const talentUltAoeElationScaling = talent(e, 0.24, 0.264)
  const talentUltBounceElationScaling = talent(e, 0.28, 0.308)
  const foxTeacherAtkScaling = talent(e, 1.00, 1.10)
  const foxTeacherElationScaling = talent(e, 0.25, 0.275)

  const elationSkillScaling = elationSkill(e, 1.10, 1.155, 1.21)

  const defaults = {
    certifiedBanger: true,
    punchlineStacks: 30,
    certifiedBangerStacks: 600,
    cdToElation: true,
    masterFoxVuln: true,
    e1ResPen: true,
    e2CritDmg: true,
    e4DefPen: true,
    e6Merrymake: true,
  }

  const teammateDefaults = {
    masterFoxVuln: true,
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
        skillElationScaling: precisionRound(100 * talentSkillElationScaling),
        ultElationScaling: precisionRound(100 * talentUltAoeElationScaling),
        ultBounceElationScaling: precisionRound(100 * talentUltBounceElationScaling),
        foxElationScaling: precisionRound(100 * foxTeacherElationScaling),
      }),
    },
    certifiedBangerStacks: {
      id: 'certifiedBangerStacks',
      formItem: 'slider',
      text: t('certifiedBangerStacks.text'),
      content: t('certifiedBangerStacks.content', {
        skillElationScaling: precisionRound(100 * talentSkillElationScaling),
        ultElationScaling: precisionRound(100 * talentUltAoeElationScaling),
        ultBounceElationScaling: precisionRound(100 * talentUltBounceElationScaling),
        foxElationScaling: precisionRound(100 * foxTeacherElationScaling),
      }),
      min: 0,
      max: 1200,
    },
    cdToElation: {
      id: 'cdToElation',
      formItem: 'switch',
      text: t('cdToElation.text'),
      content: t('cdToElation.content'),
    },
    masterFoxVuln: {
      id: 'masterFoxVuln',
      formItem: 'switch',
      text: t('masterFoxVuln.text'),
      content: t('masterFoxVuln.content'),
    },
    e1ResPen: {
      id: 'e1ResPen',
      formItem: 'switch',
      text: t('e1ResPen.text'),
      content: t('e1ResPen.content'),
      disabled: e < 1,
    },
    e2CritDmg: {
      id: 'e2CritDmg',
      formItem: 'switch',
      text: t('e2CritDmg.text'),
      content: t('e2CritDmg.content'),
      disabled: e < 2,
    },
    e4DefPen: {
      id: 'e4DefPen',
      formItem: 'switch',
      text: t('e4DefPen.text'),
      content: t('e4DefPen.content'),
      disabled: e < 4,
    },
    e6Merrymake: {
      id: 'e6Merrymake',
      formItem: 'switch',
      text: t('e6Merrymake.text'),
      content: t('e6Merrymake.content'),
      disabled: e < 6,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    masterFoxVuln: content.masterFoxVuln,
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
    }),

    actionDeclaration: () => [...EvanesciaAbilities],
    actionDefinition: (action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      const punchlineStacks = getYaoguangAhaPunchlineValue(action, context) ?? r.punchlineStacks
      const certifiedBangerStacks = r.certifiedBangerStacks

      // Ult CB floor = max energy
      const ultCertifiedBangerStacks = Math.max(context.baseEnergy, certifiedBangerStacks)

      // Trace: Ult bounce bonus by enemy count
      const traceBounceBonus = context.enemyCount >= 3 ? 1 : (context.enemyCount === 2 ? 2 : 4)
      const totalBounceCount = 5 + traceBounceBonus

      // E1: extra Elation Skill trigger
      const e1ElationSkillMultiplier = (e >= 1 && r.e1ResPen) ? 2 : 1

      const basicHit = HitDefinitionBuilder.standardBasic()
        .damageElement(ElementTag.Physical)
        .atkScaling(basicScaling)
        .toughnessDmg(10)
        .build()

      const skillHit = HitDefinitionBuilder.standardSkill()
        .damageElement(ElementTag.Physical)
        .atkScaling(skillMainScaling)
        .toughnessDmg(20)
        .build()

      const skillHits: HitDefinition[] = [skillHit]

      // Talent: Skill elation hit
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

      // Ult: AoE + bounces averaged per enemy
      const ultHit = HitDefinitionBuilder.standardUlt()
        .damageElement(ElementTag.Physical)
        .atkScaling(ultAoeScaling + ultBounceScaling * totalBounceCount / context.enemyCount)
        .toughnessDmg(20 + 5 * totalBounceCount / context.enemyCount)
        .build()

      const ultHits: HitDefinition[] = [ultHit]

      // Talent: Ult elation hits
      if (r.certifiedBanger) {
        ultHits.push(
          HitDefinitionBuilder.elation()
            .damageType(DamageTag.ELATION)
            .damageElement(ElementTag.Physical)
            .elationScaling(talentUltAoeElationScaling + talentUltBounceElationScaling * totalBounceCount / context.enemyCount)
            .punchlineStacks(ultCertifiedBangerStacks)
            .toughnessDmg(0)
            .build(),
        )
      }

      // Elation Skill (E1: triggers twice)
      const elationSkillHit = HitDefinitionBuilder.elation()
        .sourceEntity(EvanesciaEntities.Evanescia)
        .damageType(DamageTag.ELATION)
        .damageElement(ElementTag.Physical)
        .elationScaling(elationSkillScaling * e1ElationSkillMultiplier)
        .punchlineStacks(punchlineStacks)
        .toughnessDmg(20 * e1ElationSkillMultiplier)
        .build()

      // Master Fox FUA 240-energy passive
      const foxTeacherHits: HitDefinition[] = [
        HitDefinitionBuilder.standardFua()
          .sourceEntity(EvanesciaEntities.Evanescia)
          .damageElement(ElementTag.Physical)
          .atkScaling(foxTeacherAtkScaling)
          .toughnessDmg(10)
          .build(),
      ]
      if (r.certifiedBanger) {
        foxTeacherHits.push(
          HitDefinitionBuilder.elation()
            .sourceEntity(EvanesciaEntities.Evanescia)
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

      x.buff(StatKey.CR, 0.30, x.source(SOURCE_TRACE))
      x.buff(StatKey.RES_PEN, (e >= 1 && r.e1ResPen) ? 0.20 : 0, x.source(SOURCE_E1))
      x.buff(StatKey.CD, (e >= 2 && r.e2CritDmg) ? 0.36 : 0, x.source(SOURCE_E2))
      x.buff(StatKey.DEF_PEN, (e >= 4 && r.e4DefPen) ? 0.15 : 0, x.source(SOURCE_E4))

      const e6MerrymakeValue = 0.15 + Math.min(r.certifiedBangerStacks, 1000) / 100 * 0.02
      x.buff(StatKey.MERRYMAKING, (e >= 6 && r.e6Merrymake) ? e6MerrymakeValue : 0, x.source(SOURCE_E6))
    },

    precomputeMutualEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      x.buff(StatKey.VULNERABILITY, m.masterFoxVuln ? 0.12 : 0, x.targets(TargetTag.FullTeam).source(SOURCE_TRACE))
    },

    finalizeCalculations: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
    },
    newGpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => '',

    // Talent: CD to Elation conversion
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
    DEFAULT_UNIQUE,
    END_SKILL,
    DEFAULT_ELATION_SKILL,
    DEFAULT_UNIQUE,
    DEFAULT_ULT,
    DEFAULT_ELATION_SKILL,
    WHOLE_SKILL,
    DEFAULT_UNIQUE,
    DEFAULT_ULT,
    DEFAULT_ELATION_SKILL,
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
      lightCone: MushyShroomysAdventures.id,
      characterEidolon: 0,
      lightConeSuperimposition: 5,
    },
    {
      characterId: TrailblazerElationStelle.id,
      lightCone: ElationBrimmingWithBlessings.id,
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
    [Stats.ATK]: 0.25,
    [Stats.ATK_P]: 0.25,
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
    [Parts.Feet]: [],
    [Parts.PlanarSphere]: [],
    [Parts.LinkRope]: [
      Stats.ATK_P,
      Stats.ERR,
    ],
  },
  presets: [
    PresetEffects.fnPioneerSet(4),
  ],
  sortOption: SortOption.ELATION_SKILL,
  hiddenColumns: [SortOption.FUA, SortOption.DOT],
  simulation: simulation(),
})

const display = {
  imageCenter: {
    x: 1050,
    y: 950,
    z: 1.10,
  },
  showcaseColor: '#b78fc4',
}

export const Evanescia: CharacterConfig = {
  id: '1505',
  display,
  conditionals,
  get scoring() {
    return scoring()
  },
}

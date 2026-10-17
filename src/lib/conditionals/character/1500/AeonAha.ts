import i18next from 'i18next'
import { Pearl } from 'lib/conditionals/character/1500/Pearl'
import { SilverWolfLv999 } from 'lib/conditionals/character/1500/SilverWolfLv999'
import {
  getYaoguangAhaPunchlineValue,
  Yaoguang,
} from 'lib/conditionals/character/1500/Yaoguang'
import {
  AbilityEidolon,
  type Conditionals,
  type ContentDefinition,
  createEnum,
} from 'lib/conditionals/conditionalUtils'
import { HitDefinitionBuilder } from 'lib/conditionals/hitDefinitionBuilder'
import { MushyShroomysAdventures } from 'lib/conditionals/lightcone/4star/MushyShroomysAdventures'
import { UponTheFirstEchoOfAha } from 'lib/conditionals/lightcone/5star/UponTheFirstEchoOfAha'
import {
  ConditionalActivation,
  ConditionalType,
  CURRENT_DATA_VERSION,
  Parts,
  Sets,
  Stats,
} from 'lib/constants/constants'
import { newConditionalWgslWrapper } from 'lib/gpu/conditionals/dynamicConditionals'
import { containerActionVal } from 'lib/gpu/injection/injectUtils'
import { wgslTrue } from 'lib/gpu/injection/wgslUtils'
import { Source } from 'lib/optimization/buffSource'
import { StatKey } from 'lib/optimization/engine/config/keys'
import {
  DamageTag,
  ElementTag,
  SELF_ENTITY_INDEX,
  TargetTag,
} from 'lib/optimization/engine/config/tag'
import { type ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import {
  AbilityKind,
  END_SKILL,
  NULL_TURN_ABILITY_NAME,
  START_ULT,
  WHOLE_BASIC,
  WHOLE_ELATION_SKILL,
  WHOLE_SKILL,
} from 'lib/optimization/rotation/turnAbilityConfig'
import { SortOption } from 'lib/optimization/sortOptions'
import {
  SPREAD_ORNAMENTS_2P_GENERAL_CONDITIONALS,
  SPREAD_ORNAMENTS_2P_SUPPORT,
  SPREAD_RELICS_4P_GENERAL_CONDITIONALS,
} from 'lib/scoring/scoringConstants'
import { ScoringType } from 'lib/scoring/scoringTypes'
import { relics2pByStats } from 'lib/sets/setConfigRegistry'
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

export const AeonAhaEntities = createEnum('AeonAha')
export const AeonAhaAbilities: AbilityKind[] = [
  AbilityKind.BASIC,
  AbilityKind.SKILL,
  AbilityKind.ULT,
  AbilityKind.ELATION_SKILL,
  AbilityKind.BREAK,
]

const conditionals = (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const betaContent = i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION })

  const { basic, skill, ult, talent, elationSkill } = AbilityEidolon.ULT_BASIC_ELATION_SKILL_3_SKILL_TALENT_ELATION_SKILL_5
  const {
    SOURCE_SKILL,
    SOURCE_ULT,
    SOURCE_TALENT,
    SOURCE_TRACE,
    SOURCE_E1,
    SOURCE_ELATION_SKILL,
  } = Source.character(AeonAha.id)

  const basicScaling = basic(e, 0.50, 0.55)
  const skillEmanatorElationBuff = skill(e, 0.20, 0.22)
  const skillFuaScaling = skill(e, 0.50, 0.55)
  const ultAoeScaling = ult(e, 2.00, 2.16)
  const ultBounceScaling = ult(e, 0.60, 0.648)
  const talentCdBuffValue = talent(e, 0.40, 0.44)
  const elationSkillScaling = elationSkill(e, 0.60, 0.63, 0.66)

  // Not modeled: Wishpower economy, Bliss refund, SP recovery, Technique, Aha Instant base SPD,
  // Ult/A6/E6 action advances (rotation timing), E6 first-Ult Punchline; Elation Debt requires enemy Max HP occupation.
  // Faces of Elation ascension and its E2 upgrade are consumed by ally Innate Traces through getAhaAscension().
  // Bonus Ability 1's corresponding element is approximated as Quantum rather than the Emanator ally's element.

  const defaults = {
    punchlineStacks: 30,
    certifiedBangerStacks: 60,
    talentCdBuff: true,
    facesOfElation: true,
    traceFuaElationDmg: true,
    traceSpdElation: true,
    e1Merrymake: true,
    e4TeammateCertifiedBangerStacks: 120,
  }

  const teammateDefaults = {
    emanatorElationBuff: true,
    talentCdBuff: true,
    facesOfElation: true,
    elationSkillTrueDmg: true,
    e1Merrymake: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    punchlineStacks: {
      id: 'punchlineStacks',
      formItem: 'slider',
      text: 'Punchline stacks',
      content: betaContent,
      min: 0,
      max: 100,
    },
    certifiedBangerStacks: {
      id: 'certifiedBangerStacks',
      formItem: 'slider',
      text: 'Certified Banger stacks',
      content: betaContent,
      min: 0,
      max: 200,
    },
    talentCdBuff: {
      id: 'talentCdBuff',
      formItem: 'switch',
      text: 'Talent CD buff',
      content: betaContent,
    },
    facesOfElation: {
      id: 'facesOfElation',
      formItem: 'switch',
      text: 'Faces of Elation',
      content: betaContent,
    },
    traceFuaElationDmg: {
      id: 'traceFuaElationDmg',
      formItem: 'switch',
      text: 'Trace FUA Elation DMG',
      content: betaContent,
    },
    traceSpdElation: {
      id: 'traceSpdElation',
      formItem: 'switch',
      text: 'SPD to Elation',
      content: betaContent,
    },
    e1Merrymake: {
      id: 'e1Merrymake',
      formItem: 'switch',
      text: 'E1 Merrymake',
      content: betaContent,
      disabled: e < 1,
    },
    e4TeammateCertifiedBangerStacks: {
      id: 'e4TeammateCertifiedBangerStacks',
      formItem: 'slider',
      text: 'E4 teammate CB stacks',
      content: betaContent,
      min: 0,
      max: 600,
      disabled: e < 4,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    emanatorElationBuff: {
      id: 'emanatorElationBuff',
      formItem: 'switch',
      text: 'Emanator of Elation',
      content: betaContent,
    },
    talentCdBuff: content.talentCdBuff,
    facesOfElation: content.facesOfElation,
    elationSkillTrueDmg: {
      id: 'elationSkillTrueDmg',
      formItem: 'switch',
      text: 'Aha Instant True DMG',
      content: betaContent,
    },
    e1Merrymake: content.e1Merrymake,
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    teammateContent: () => Object.values(teammateContent),
    teammateDefaults: () => teammateDefaults,

    entityDeclaration: () => Object.values(AeonAhaEntities),
    entityDefinition: (action: OptimizerAction, context: OptimizerContext) => ({
      [AeonAhaEntities.AeonAha]: {
        primary: true,
        summon: false,
        memosprite: false,
      },
    }),

    actionDeclaration: () => [...AeonAhaAbilities],
    actionDefinition: (action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // E4: teammates' cumulative Certified Banger is added to every Aha Elation hit's Punchline count
      const e4TeammateStacks = (e >= 4) ? r.e4TeammateCertifiedBangerStacks : 0
      const punchlineStacks = (getYaoguangAhaPunchlineValue(action, context) ?? r.punchlineStacks)
        + e4TeammateStacks

      const certifiedBangerStacks = r.certifiedBangerStacks + e4TeammateStacks

      const basicHit = HitDefinitionBuilder.elation()
        .damageType(DamageTag.ELATION)
        .damageElement(ElementTag.Quantum)
        .elationScaling(basicScaling)
        .punchlineStacks(certifiedBangerStacks)
        .toughnessDmg(10)
        .build()

      const skillFuaHit = HitDefinitionBuilder.elation()
        .damageType(DamageTag.ELATION)
        .damageElement(ElementTag.Quantum)
        .elationScaling(skillFuaScaling + (r.traceFuaElationDmg ? 0.20 : 0))
        .punchlineStacks(certifiedBangerStacks)
        .toughnessDmg(10)
        .build()

      // Ult: AoE 200% + 5 bounces x 60% averaged per enemy
      const ultBounceCount = 5
      const ultHit = HitDefinitionBuilder.elation()
        .damageType(DamageTag.ELATION)
        .damageElement(ElementTag.Quantum)
        .elationScaling(ultAoeScaling + ultBounceCount * ultBounceScaling / context.enemyCount)
        .punchlineStacks(certifiedBangerStacks)
        .toughnessDmg(20 + 5 * ultBounceCount / context.enemyCount)
        .build()

      const elationSkillHit = HitDefinitionBuilder.elation()
        .damageType(DamageTag.ELATION)
        .damageElement(ElementTag.Quantum)
        .elationScaling(elationSkillScaling)
        .punchlineStacks(punchlineStacks)
        // Aha's own hit contributes to the Instant tally; the ally buff below excludes this actor.
        .trueDmgModifier(e >= 4 ? 0.25 : 0.20)
        .toughnessDmg(10)
        .build()

      return {
        [AbilityKind.BASIC]: { hits: [basicHit] },
        [AbilityKind.SKILL]: { hits: [skillFuaHit] },
        [AbilityKind.ULT]: { hits: [ultHit] },
        [AbilityKind.ELATION_SKILL]: { hits: [elationSkillHit] },
        [AbilityKind.BREAK]: { hits: [HitDefinitionBuilder.standardBreak(ElementTag.Quantum).build()] },
      }
    },
    actionModifiers: () => [],

    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // Faces of Elation: self CRIT Rate and DEF ignore increase at E2.
      x.buff(StatKey.CR, r.facesOfElation ? ((e >= 2) ? 0.20 : 0.12) : 0, x.source(SOURCE_ULT))
      x.buff(StatKey.DEF_PEN, r.facesOfElation ? ((e >= 2) ? 0.60 : 0.30) : 0, x.source(SOURCE_ULT))
    },

    precomputeMutualEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      x.buff(StatKey.CD, m.talentCdBuff ? talentCdBuffValue : 0, x.targets(TargetTag.FullTeam).source(SOURCE_TALENT))

      // Approximation: credit each other actor's Elation Skill hit; the full Instant tally is not tracked.
      x.buff(
        StatKey.TRUE_DMG_MODIFIER,
        (action.actorId !== context.characterId && m.elationSkillTrueDmg) ? ((e >= 4) ? 0.25 : 0.20) : 0,
        x.damageType(DamageTag.ELATION).targets(TargetTag.FullTeam).actionKind(AbilityKind.ELATION_SKILL).source(SOURCE_ELATION_SKILL),
      )

      x.buff(StatKey.MERRYMAKING, (e >= 1 && m.e1Merrymake) ? 0.15 : 0, x.targets(TargetTag.FullTeam).source(SOURCE_E1))
    },

    precomputeTeammateEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const t = action.characterConditionals as Conditionals<typeof teammateContent>
      x.buff(
        StatKey.ELATION,
        t.emanatorElationBuff ? skillEmanatorElationBuff : 0,
        x.targets(TargetTag.SingleTarget).source(SOURCE_SKILL),
      )
    },

    finalizeCalculations: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {},
    newGpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => '',

    dynamicConditionals: [
      {
        // Bonus Ability 3: total SPD >= 125 -> +120% Elation; >= 150 adds a further +30% (150% total)
        id: 'AeonAhaSpdElation125',
        type: ConditionalType.ABILITY,
        activation: ConditionalActivation.SINGLE,
        dependsOn: [Stats.SPD],
        chainsTo: [Stats.Elation],
        condition: function(x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals as Conditionals<typeof content>
          return r.traceSpdElation && x.getActionValue(StatKey.SPD, AeonAhaEntities.AeonAha) >= 125
        },
        effect: function(x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals as Conditionals<typeof content>
          const spd = x.getActionValue(StatKey.SPD, AeonAhaEntities.AeonAha)

          x.buffDynamic(StatKey.ELATION, (r.traceSpdElation && spd >= 125) ? 1.20 : 0, action, context, x.source(SOURCE_TRACE))
        },
        gpu: function(action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals as Conditionals<typeof content>

          return newConditionalWgslWrapper(
            this,
            action,
            context,
            `
if (
  (*p_state).${this.id}${action.actionIdentifier} == 0.0 &&
  ${containerActionVal(SELF_ENTITY_INDEX, StatKey.SPD, action.config)} >= 125.0 &&
  ${wgslTrue(r.traceSpdElation)}
) {
  (*p_state).${this.id}${action.actionIdentifier} = 1.0;
  ${containerActionVal(SELF_ENTITY_INDEX, StatKey.ELATION, action.config)} += 1.20;
}
          `,
          )
        },
      },
      {
        id: 'AeonAhaSpdElation150',
        type: ConditionalType.ABILITY,
        activation: ConditionalActivation.SINGLE,
        dependsOn: [Stats.SPD],
        chainsTo: [Stats.Elation],
        condition: function(x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals as Conditionals<typeof content>
          return r.traceSpdElation && x.getActionValue(StatKey.SPD, AeonAhaEntities.AeonAha) >= 150
        },
        effect: function(x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals as Conditionals<typeof content>
          const spd = x.getActionValue(StatKey.SPD, AeonAhaEntities.AeonAha)

          x.buffDynamic(StatKey.ELATION, (r.traceSpdElation && spd >= 150) ? 0.30 : 0, action, context, x.source(SOURCE_TRACE))
        },
        gpu: function(action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals as Conditionals<typeof content>

          return newConditionalWgslWrapper(
            this,
            action,
            context,
            `
if (
  (*p_state).${this.id}${action.actionIdentifier} == 0.0 &&
  ${containerActionVal(SELF_ENTITY_INDEX, StatKey.SPD, action.config)} >= 150.0 &&
  ${wgslTrue(r.traceSpdElation)}
) {
  (*p_state).${this.id}${action.actionIdentifier} = 1.0;
  ${containerActionVal(SELF_ENTITY_INDEX, StatKey.ELATION, action.config)} += 0.30;
}
          `,
          )
        },
      },
    ],
  }
}

const simulation = (): SimulationMetadata => ({
  leaderboardEnabled: false,
  parts: {
    [Parts.Body]: [
      Stats.CR,
      Stats.CD,
    ],
    [Parts.Feet]: [
      Stats.SPD,
    ],
    [Parts.PlanarSphere]: [
      Stats.HP_P,
      Stats.DEF_P,
    ],
    [Parts.LinkRope]: [
      Stats.DEF_P,
      Stats.HP_P,
    ],
  },
  substats: [
    Stats.CD,
    Stats.CR,
    Stats.SPD,
    Stats.HP_P,
    Stats.DEF_P,
    Stats.HP,
  ],
  comboTurnAbilities: [
    NULL_TURN_ABILITY_NAME,
    START_ULT,
    END_SKILL,
    WHOLE_ELATION_SKILL,
    WHOLE_BASIC,
    WHOLE_ELATION_SKILL,
    WHOLE_SKILL,
    WHOLE_ELATION_SKILL,
  ],
  deprioritizeBuffs: true,
  hardBreakpoints: [
    { stat: Stats.SPD, threshold: 150 },
  ],
  relicSets: [
    [Sets.EverGloriousMagicalGirl, Sets.EverGloriousMagicalGirl],
    [Sets.DreamlitActor, Sets.DreamlitActor],
    [Sets.DivinerOfDistantReach, Sets.DivinerOfDistantReach],
    [Sets.SacerdosRelivedOrdeal, Sets.SacerdosRelivedOrdeal],
    relics2pByStats(Stats.SPD_P),
    ...SPREAD_RELICS_4P_GENERAL_CONDITIONALS,
  ],
  ornamentSets: [
    Sets.GodsMomentOfJoy,
    ...SPREAD_ORNAMENTS_2P_GENERAL_CONDITIONALS,
    ...SPREAD_ORNAMENTS_2P_SUPPORT,
  ],
  teammates: [
    {
      characterId: SilverWolfLv999.id,
      lightCone: SilverWolfLv999.defaultLightCone,
      characterEidolon: 0,
      lightConeSuperimposition: 1,
    },
    {
      characterId: Yaoguang.id,
      lightCone: MushyShroomysAdventures.id,
      characterEidolon: 0,
      lightConeSuperimposition: 5,
    },
    {
      characterId: Pearl.id,
      lightCone: Pearl.defaultLightCone,
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
    [Parts.LinkRope]: [],
  },
  presets: [],
  defaultDamageType: DamageTag.ELATION,
  sortOption: SortOption.ELATION_SKILL,
  hiddenColumns: [SortOption.FUA, SortOption.DOT],
  simulation: simulation(),
})

const display = {
  imageCenter: {
    x: 817,
    y: 1033,
    z: 1.28,
  },
  showcaseColor: '#b9b3ff',
  showcaseScoringOrder: [
    ScoringType.SUBSTAT_SCORE,
    ScoringType.DPS_SCORE,
    ScoringType.NONE,
  ],
}

export const AeonAha: CharacterConfig = {
  id: '1511',
  defaultLightCone: UponTheFirstEchoOfAha.id,
  display,
  conditionals,
  get scoring() {
    return scoring()
  },
}

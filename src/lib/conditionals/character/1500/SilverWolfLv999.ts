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
import {
  newConditionalWgslWrapper,
} from 'lib/gpu/conditionals/dynamicConditionals'
import {
  containerActionVal,
  p_containerActionVal,
} from 'lib/gpu/injection/injectUtils'
import { wgslTrue } from 'lib/gpu/injection/wgslUtils'
import { Source } from 'lib/optimization/buffSource'
import { StatKey } from 'lib/optimization/engine/config/keys'
import {
  DamageTag,
  ElementTag,
  SELF_ENTITY_INDEX,
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
  const enhancedBasicBounceScaling = basic(e, 2.20, 2.42)
  const enhancedBasicFinalHitScaling = basic(e, 0.90, 0.99)

  const skillScaling = skill(e, 1.60, 1.76)

  const mysteryBoxElationScaling = ult(e, 0.90, 0.99)

  const talentCBElationScaling = talent(e, 0.40, 0.44)
  const mmrCrPerPoint = talent(e, 0.003, 0.0033)
  const mmrCdPerPoint = talent(e, 0.006, 0.0066)

  const elationSkillBounceScaling = elationSkill(e, 0.90, 0.945, 0.99)
  const elationSkillBounceCount = 6

  const defaults = {
    godmodePlayer: true,
    certifiedBanger: true,
    punchlineStacks: 30,
    certifiedBangerStacks: 60,
    hiddenMmr: 300,
    spdToElation: true,
    e1Vulnerability: true,
    e4PunchlineBoost: true,
    e6Merrymake: true,
    e6ResPen: true,
  }

  const teammateDefaults = {
    e6ResPen: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    godmodePlayer: {
      id: 'godmodePlayer',
      formItem: 'switch',
      text: 'Godmode Player state',
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
    hiddenMmr: {
      id: 'hiddenMmr',
      formItem: 'slider',
      text: 'Hidden MMR',
      content: betaContent,
      min: 0,
      max: 300,
    },
    spdToElation: {
      id: 'spdToElation',
      formItem: 'switch',
      text: 'SPD to Elation conversion',
      content: betaContent,
    },
    e1Vulnerability: {
      id: 'e1Vulnerability',
      formItem: 'switch',
      text: 'E1 Vulnerability',
      content: betaContent,
      disabled: e < 1,
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
    e6ResPen: {
      id: 'e6ResPen',
      formItem: 'switch',
      text: 'E6 RES PEN',
      content: betaContent,
      disabled: e < 6,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    e6ResPen: content.e6ResPen,
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
      const mmrDmgMultiplier = 1 + 0.15 * Math.min(Math.floor(r.hiddenMmr / 60), 2)

      const basicHits: HitDefinition[] = []

      if (r.godmodePlayer) {
        // Enhanced Basic: bounces + final hit averaged per enemy, converted to Elation
        const enhancedBasicElationScaling = (
          (enhancedBasicBounceScaling + enhancedBasicFinalHitScaling) / context.enemyCount
        ) * mmrDmgMultiplier

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

      if (r.godmodePlayer) {
        // Enhanced Elation Skill: 6 bounces averaged per enemy
        elationSkillHits.push(
          HitDefinitionBuilder.elation()
            .damageType(DamageTag.ELATION)
            .damageElement(ElementTag.Imaginary)
            .elationScaling(elationSkillBounceScaling * elationSkillBounceCount / context.enemyCount)
            .punchlineStacks(elationSkillPunchline)
            .toughnessDmg(elationSkillBounceCount * 5 / context.enemyCount)
            .build(),
        )
      }
      // Top Loot Box: split evenly among all enemies
      const uniqueHit = HitDefinitionBuilder.elation()
        .damageType(DamageTag.ELATION)
        .damageElement(ElementTag.Imaginary)
        .elationScaling(mysteryBoxElationScaling / context.enemyCount)
        .punchlineStacks(certifiedBangerStacks)
        .toughnessDmg(10)
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

      x.buff(StatKey.VULNERABILITY, (e >= 1 && r.e1Vulnerability && r.godmodePlayer) ? 0.20 : 0, x.actionKind(AbilityKind.BASIC).source(SOURCE_E1))
      x.buff(StatKey.MERRYMAKING, (e >= 6 && r.e6Merrymake) ? 0.40 : 0, x.actionKind(AbilityKind.UNIQUE).source(SOURCE_E6))
    },

    precomputeMutualEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      x.buff(StatKey.RES_PEN, (e >= 6 && m.e6ResPen) ? (context.enemyDamageResistance || 0.20) : 0, x.targets(TargetTag.FullTeam).source(SOURCE_E6))
    },

    finalizeCalculations: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
    },
    newGpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => '',

    // Trace: SPD to Elation conversion
    dynamicConditionals: [
      {
        id: 'SilverWolfLv999SpdElationConditional',
        type: ConditionalType.ABILITY,
        activation: ConditionalActivation.CONTINUOUS,
        dependsOn: [Stats.SPD],
        chainsTo: [Stats.Elation],
        condition: function(x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals as Conditionals<typeof content>
          return r.spdToElation && x.getActionValueByIndex(StatKey.SPD, SELF_ENTITY_INDEX) >= 150
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
              if (convertibleValue < 150) return 0
              return 0.30 + Math.min(convertibleValue - 150, 100) * 0.02
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
            `0.30 + min(convertibleValue - 150.0, 100.0) * 0.02`,
            `${wgslTrue(r.spdToElation)}`,
            `convertibleValue >= 150.0`,
          )
        },
      },
      // Talent: Hidden MMR → CR, overflow → CD
      {
        id: 'SilverWolfLv999HiddenMmrConditional',
        type: ConditionalType.ABILITY,
        activation: ConditionalActivation.CONTINUOUS,
        dependsOn: [Stats.CR],
        chainsTo: [Stats.CR, Stats.CD],
        condition: function(x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals as Conditionals<typeof content>
          return r.hiddenMmr > 0
        },
        effect: function(x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals as Conditionals<typeof content>
          const mmrPoints = r.hiddenMmr
          if (mmrPoints <= 0) return

          const prevCrBuff = action.conditionalState[this.id] || 0
          const prevCrPoints = prevCrBuff / mmrCrPerPoint
          const prevCdBuff = Math.max(0, mmrPoints - prevCrPoints) * mmrCdPerPoint

          const totalCr = x.getActionValueByIndex(StatKey.CR, SELF_ENTITY_INDEX)
          const baseCr = totalCr - prevCrBuff
          const crSpace = Math.max(0, 1.00 - baseCr)
          const newCrBuff = Math.min(mmrPoints * mmrCrPerPoint, crSpace)
          const newCrPoints = newCrBuff / mmrCrPerPoint
          const newCdBuff = Math.max(0, mmrPoints - newCrPoints) * mmrCdPerPoint

          action.conditionalState[this.id] = newCrBuff

          x.buffDynamic(StatKey.CR, newCrBuff - prevCrBuff, action, context, x.source(SOURCE_TALENT))
          x.buffDynamic(StatKey.CD, newCdBuff - prevCdBuff, action, context, x.source(SOURCE_TALENT))
        },
        gpu: function(action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals as Conditionals<typeof content>
          const config = action.config

          return newConditionalWgslWrapper(this, action, context, `
if (${r.hiddenMmr} <= 0) {
  return;
}
let mmrPoints: f32 = ${r.hiddenMmr}.0;
let prevCrBuff: f32 = (*p_state).SilverWolfLv999HiddenMmrConditional${action.actionIdentifier};
let prevCrPoints = prevCrBuff / ${mmrCrPerPoint};
let prevCdBuff = max(0.0, mmrPoints - prevCrPoints) * ${mmrCdPerPoint};

let totalCr = ${containerActionVal(SELF_ENTITY_INDEX, StatKey.CR, config)};
let baseCr = totalCr - prevCrBuff;
let crSpace = max(0.0, 1.0 - baseCr);
let newCrBuff = min(mmrPoints * ${mmrCrPerPoint}, crSpace);
let newCrPoints = newCrBuff / ${mmrCrPerPoint};
let newCdBuff = max(0.0, mmrPoints - newCrPoints) * ${mmrCdPerPoint};

(*p_state).SilverWolfLv999HiddenMmrConditional${action.actionIdentifier} = newCrBuff;

${p_containerActionVal(SELF_ENTITY_INDEX, StatKey.CR, config)} += newCrBuff - prevCrBuff;
${p_containerActionVal(SELF_ENTITY_INDEX, StatKey.CD, config)} += newCdBuff - prevCdBuff;
`)
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

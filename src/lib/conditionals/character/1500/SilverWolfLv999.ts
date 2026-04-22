import { HuohuoB1 } from 'lib/conditionals/character/1200/HuohuoB1'
import { Sparxie } from 'lib/conditionals/character/1500/Sparxie'

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
import {
  dynamicStatConversionContainer,
  gpuDynamicStatConversion,
} from 'lib/conditionals/evaluation/statConversion'
import { HitDefinitionBuilder } from 'lib/conditionals/hitDefinitionBuilder'
import { MushyShroomysAdventures } from 'lib/conditionals/lightcone/4star/MushyShroomysAdventures'
import { DazzledByAFloweryWorld } from 'lib/conditionals/lightcone/5star/DazzledByAFloweryWorld'
import { NightOfFright } from 'lib/conditionals/lightcone/5star/NightOfFright'
import {
  ConditionalActivation,
  ConditionalType,
  Parts,
  Sets,
  Stats,
} from 'lib/constants/constants'
import { newConditionalWgslWrapper } from 'lib/gpu/conditionals/dynamicConditionals'
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
import type { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
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
} from 'lib/scoring/scoringConstants'
import { wrappedFixedT } from 'lib/utils/i18nUtils'
import {
  ceilSafe,
  precisionRound,
} from 'lib/utils/mathUtils'
import { type Eidolon } from 'types/character'
import { type CharacterConfig } from 'types/characterConfig'
import { type CharacterConditionalsController } from 'types/conditionals'
import { type HitDefinition } from 'types/hitConditionalTypes'
import {
  type ScoringMetadata,
  type SimulationMetadata,
} from 'types/metadata'
import {
  type OptimizerAction,
  type OptimizerContext,
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
  const t = wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.SilverWolfLv999.Content')
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
  const enhancedBasicBounceScaling = basic(e, 2.40, 2.64)
  const enhancedBasicFinalHitScaling = basic(e, 1.00, 1.10)

  const skillScaling = skill(e, 1.60, 1.76)

  const mysteryBoxElationScaling = ult(e, 0.90, 0.99)

  const talentCBElationScaling = talent(e, 0.40, 0.44)
  const mmrCrPerPoint = talent(e, 0.004, 0.0044)
  const mmrCdPerPoint = talent(e, 0.008, 0.0088)

  const elationSkillBounceScaling = elationSkill(e, 0.90, 0.945, 0.99)
  const elationSkillBounceCount = 6

  const defaults = {
    godmodePlayer: true,
    certifiedBanger: true,
    punchlineStacks: 30,
    certifiedBangerStacks: 60,
    hiddenMmr: 120,
    spdToElation: true,
    e1Vulnerability: true,
    e4PunchlineBoost: true,
    e6Merrymake: true,
    e6ResPen: true,
  }

  const teammateDefaults = {
    e1Vulnerability: true,
    e6ResPen: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    godmodePlayer: {
      id: 'godmodePlayer',
      formItem: 'switch',
      text: t('godmodePlayer.text'),
      content: t('godmodePlayer.content', { lootboxScaling: precisionRound(100 * mysteryBoxElationScaling) }),
    },
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
        lootboxScaling: precisionRound(100 * mysteryBoxElationScaling),
        talentCBScaling: precisionRound(100 * talentCBElationScaling),
      }),
    },
    certifiedBangerStacks: {
      id: 'certifiedBangerStacks',
      formItem: 'slider',
      text: t('certifiedBangerStacks.text'),
      content: t('certifiedBangerStacks.content', {
        lootboxScaling: precisionRound(100 * mysteryBoxElationScaling),
        talentCBScaling: precisionRound(100 * talentCBElationScaling),
      }),
      min: 0,
      max: 200,
    },
    hiddenMmr: {
      id: 'hiddenMmr',
      formItem: 'slider',
      text: t('hiddenMmr.text'),
      content: t('hiddenMmr.content', {
        hiddenMmrCrStep: precisionRound(100 * mmrCrPerPoint),
        hiddenMmrCdStep: precisionRound(100 * mmrCdPerPoint),
      }),
      min: 0,
      max: 300,
    },
    spdToElation: {
      id: 'spdToElation',
      formItem: 'switch',
      text: t('spdToElation.text'),
      content: t('spdToElation.content'),
    },
    e1Vulnerability: {
      id: 'e1Vulnerability',
      formItem: 'switch',
      text: t('e1Vulnerability.text'),
      content: t('e1Vulnerability.content'),
      disabled: e < 1,
    },
    e4PunchlineBoost: {
      id: 'e4PunchlineBoost',
      formItem: 'switch',
      text: t('e4PunchlineBoost.text'),
      content: t('e4PunchlineBoost.content'),
      disabled: e < 4,
    },
    e6Merrymake: {
      id: 'e6Merrymake',
      formItem: 'switch',
      text: t('e6Merrymake.text'),
      content: t('e6Merrymake.content'),
      disabled: e < 6,
    },
    e6ResPen: {
      id: 'e6ResPen',
      formItem: 'switch',
      text: t('e6ResPen.text'),
      content: t('e6ResPen.content'),
      disabled: e < 6,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    e1Vulnerability: content.e1Vulnerability,
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

      // E4: Elation Skill Punchline x5
      const elationSkillPunchline = punchlineStacks + ((e >= 4 && r.e4PunchlineBoost) ? punchlineStacks * 5 : 0)
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
            .toughnessDmg(elationSkillBounceCount * 10 / context.enemyCount)
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

      x.buff(StatKey.MERRYMAKING, (e >= 6 && r.e6Merrymake) ? 0.50 : 0, x.actionKind(AbilityKind.BASIC).source(SOURCE_E6))
    },

    precomputeMutualEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      x.buff(StatKey.VULNERABILITY, (e >= 1 && m.e1Vulnerability) ? 0.20 : 0, x.targets(TargetTag.FullTeam).source(SOURCE_E1))
      x.buff(StatKey.RES_PEN, (e >= 6 && m.e6ResPen) ? (context.enemyDamageResistance || 0.20) : 0, x.targets(TargetTag.FullTeam).source(SOURCE_E6))
    },

    finalizeCalculations: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>
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
          return r.spdToElation && x.getActionValueByIndex(StatKey.SPD, SELF_ENTITY_INDEX) >= 160
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
              if (convertibleValue < 160) return 0
              return 0.50 + Math.min(convertibleValue - 160, 100) * 0.02
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
            `0.50 + min(convertibleValue - 160.0, 100.0) * 0.02`,
            `${wgslTrue(r.spdToElation)}`,
            `convertibleValue >= 160.0`,
          )
        },
      },
      // Talent: Hidden MMR -> CR (capped at 100%), overflow -> CD
      // Stores crPoints and cdPoints separately (mirroring GPU) so that reset-to-0 correctly means "no previous buff"
      {
        id: 'SilverWolfLv999HiddenMmrConditional',
        type: ConditionalType.ABILITY,
        activation: ConditionalActivation.CONTINUOUS,
        dependsOn: [Stats.CR],
        chainsTo: [Stats.CR, Stats.CD],
        supplementalState: ['SilverWolfLv999HiddenMmrCrPoints'],
        condition: function(x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals as Conditionals<typeof content>
          return r.hiddenMmr > 0
        },
        effect: function(x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals as Conditionals<typeof content>
          const mmrPoints = r.hiddenMmr
          if (mmrPoints <= 0) return

          const prevCrPoints = action.conditionalState['SilverWolfLv999HiddenMmrCrPoints'] ?? 0
          const prevCdPoints = action.conditionalState[this.id] ?? 0

          const prevCrBuff = prevCrPoints * mmrCrPerPoint
          const prevCdBuff = prevCdPoints * mmrCdPerPoint

          const totalCr = x.getActionValueByIndex(StatKey.CR, SELF_ENTITY_INDEX)
          const baseCr = totalCr - prevCrBuff

          const newCrPoints = Math.min(mmrPoints, ceilSafe(Math.max(0, 1.00 - baseCr) / mmrCrPerPoint))
          const newCdPoints = mmrPoints - newCrPoints

          const newCrBuff = newCrPoints * mmrCrPerPoint
          const newCdBuff = newCdPoints * mmrCdPerPoint

          const crDelta = newCrBuff - prevCrBuff
          const cdDelta = newCdBuff - prevCdBuff

          action.conditionalState['SilverWolfLv999HiddenMmrCrPoints'] = newCrPoints
          action.conditionalState[this.id] = newCdPoints

          if (crDelta) {
            x.buffDynamic(StatKey.CR, crDelta, action, context, x.source(SOURCE_TALENT))
          }
          if (cdDelta) {
            x.buffDynamic(StatKey.CD, cdDelta, action, context, x.source(SOURCE_TALENT))
          }
        },
        gpu: function(action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals as Conditionals<typeof content>
          const config = action.config

          return newConditionalWgslWrapper(
            this,
            action,
            context,
            `
if (${r.hiddenMmr} <= 0) {
  return;
}
let mmrPoints: f32 = f32(${r.hiddenMmr});

let prevCrPoints: f32 = (*p_state).SilverWolfLv999HiddenMmrCrPoints${action.actionIdentifier};
let prevCdPoints: f32 = (*p_state).SilverWolfLv999HiddenMmrConditional${action.actionIdentifier};

let prevCrBuff = prevCrPoints * ${mmrCrPerPoint};
let prevCdBuff = prevCdPoints * ${mmrCdPerPoint};

let totalCr = ${containerActionVal(SELF_ENTITY_INDEX, StatKey.CR, config)};
let baseCr = totalCr - prevCrBuff;

let newCrPoints = min(mmrPoints, ceilSafe(max(0.0, 1.0 - baseCr) / ${mmrCrPerPoint}));
let newCdPoints = mmrPoints - newCrPoints;

let newCrBuff = newCrPoints * ${mmrCrPerPoint};
let newCdBuff = newCdPoints * ${mmrCdPerPoint};

let crDelta = newCrBuff - prevCrBuff;
let cdDelta = newCdBuff - prevCdBuff;

(*p_state).SilverWolfLv999HiddenMmrCrPoints${action.actionIdentifier} = newCrPoints;
(*p_state).SilverWolfLv999HiddenMmrConditional${action.actionIdentifier} = newCdPoints;

${p_containerActionVal(SELF_ENTITY_INDEX, StatKey.CR, config)} += crDelta;
${p_containerActionVal(SELF_ENTITY_INDEX, StatKey.CD, config)} += cdDelta;
`,
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
      Stats.HP_P,
    ],
    [Parts.LinkRope]: [
      Stats.HP_P,
    ],
  },
  substats: [
    Stats.CD,
    Stats.CR,
    Stats.SPD,
    Stats.DEF_P,
    Stats.HP_P,
  ],
  breakpoints: { [Stats.SPD]: 160 },
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
  relicSets: [
    [Sets.EverGloriousMagicalGirl, Sets.EverGloriousMagicalGirl],
    [Sets.GeniusOfBrilliantStars, Sets.GeniusOfBrilliantStars],
  ],
  ornamentSets: [
    Sets.PunklordeStageZero,
    Sets.TengokuLivestream,
    Sets.IzumoGenseiAndTakamaDivineRealm,
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
      characterId: Yaoguang.id,
      lightCone: MushyShroomysAdventures.id,
      characterEidolon: 0,
      lightConeSuperimposition: 5,
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
    [Parts.LinkRope]: [],
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
  spineCenter: {
    x: 1179,
    y: 936,
    z: 1.28,
  },
  showcaseColor: '#0d1075',
}

export const SilverWolfLv999: CharacterConfig = {
  id: '1506',
  display,
  conditionals,
  get scoring() {
    return scoring()
  },
}

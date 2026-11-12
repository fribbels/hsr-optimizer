import i18next from 'i18next'
import { HuohuoB1 } from 'lib/conditionals/character/1200/HuohuoB1'
import { Ellen } from 'lib/conditionals/character/1500/Ellen'
import { RobinSummeretto } from 'lib/conditionals/character/1500/RobinSummeretto'
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
import { NightOfFright } from 'lib/conditionals/lightcone/5star/NightOfFright'
import { NoShiftsOnRainyDays } from 'lib/conditionals/lightcone/5star/NoShiftsOnRainyDays'
import { RiseAndSing } from 'lib/conditionals/lightcone/5star/RiseAndSing'
import { ShineBrightLikeHer } from 'lib/conditionals/lightcone/5star/ShineBrightLikeHer'
import {
  ConditionalActivation,
  ConditionalType,
  CURRENT_DATA_VERSION,
  Parts,
  Sets,
  Stats,
} from 'lib/constants/constants'
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
  DEFAULT_BASIC,
  DEFAULT_UNIQUE,
  END_BASIC,
  NULL_TURN_ABILITY_NAME,
  START_ULT,
  WHOLE_BASIC,
} from 'lib/optimization/rotation/turnAbilityConfig'
import { SortOption } from 'lib/optimization/sortOptions'
import {
  SPREAD_ORNAMENTS_2P_GENERAL_CONDITIONALS,
  SPREAD_ORNAMENTS_2P_SUPPORT,
  SPREAD_RELICS_4P_GENERAL_CONDITIONALS,
  SPREAD_RELICS_4P_SUPPORT,
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

export const AstraYaoEntities = createEnum('AstraYao')
export const AstraYaoAbilities: AbilityKind[] = [
  AbilityKind.BASIC,
  AbilityKind.UNIQUE,
  AbilityKind.ULT,
  AbilityKind.BREAK,
  AbilityKind.BUFF,
]

const conditionals = (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const betaContent = i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION })
  const { basic, skill, ult, talent } = AbilityEidolon.SKILL_TALENT_3_ULT_BASIC_5
  const { SOURCE_SKILL, SOURCE_ULT, SOURCE_TALENT, SOURCE_TRACE, SOURCE_E1, SOURCE_E2, SOURCE_E6 } = Source.character(AstraYao.id)

  const basicScaling = basic(e, 1.00, 1.10)
  const enhancedBasicScaling = basic(e, 1.60, 1.76)
  const minuetScaling = basic(e, 1.80, 1.98)
  const skillAtkScaling = skill(e, 0.24, 0.264)
  const skillAtkFlat = skill(e, 300, 330)
  const ultScaling = ult(e, 3.20, 3.52)
  const ultVulnerability = ult(e, 0.32, 0.352)
  const ultAdditionalScaling = ult(e, 0.40, 0.44)
  const talentDmgPerStack = talent(e, 0.05, 0.055)

  // Extra damage from teammates' Basics is not included.

  const defaults = {
    enhancedBasic: true,
    skillAtkBuff: true,
    ultZone: true,
    syncopationStacks: 10,
    crBuff: true,
    atkToCdConversion: true,
    teamDmgBuff: true,
    e1Buffs: true,
    e2AtkBuff: true,
    e2AdditionalDmg: true,
    e4Buffs: true,
    e6ResPen: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    enhancedBasic: {
      id: 'enhancedBasic',
      formItem: 'switch',
      text: 'Enhanced Basic',
      content: betaContent,
    },
    skillAtkBuff: {
      id: 'skillAtkBuff',
      formItem: 'switch',
      text: 'Skill ATK buff',
      content: betaContent,
    },
    ultZone: {
      id: 'ultZone',
      formItem: 'switch',
      text: 'Ult Zone',
      content: betaContent,
    },
    syncopationStacks: {
      id: 'syncopationStacks',
      formItem: 'slider',
      text: 'Team DMG buff stacks',
      content: betaContent,
      min: 0,
      max: 10,
    },
    crBuff: {
      id: 'crBuff',
      formItem: 'switch',
      text: 'CR buff',
      content: betaContent,
    },
    atkToCdConversion: {
      id: 'atkToCdConversion',
      formItem: 'switch',
      text: 'ATK to CD conversion',
      content: betaContent,
    },
    teamDmgBuff: {
      id: 'teamDmgBuff',
      formItem: 'switch',
      text: 'Team DMG buff',
      content: betaContent,
    },
    e1Buffs: {
      id: 'e1Buffs',
      formItem: 'switch',
      text: 'E1 Buffs',
      content: betaContent,
      disabled: e < 1,
    },
    e2AtkBuff: {
      id: 'e2AtkBuff',
      formItem: 'switch',
      text: 'E2 ATK buff',
      content: betaContent,
      disabled: e < 2,
    },
    e2AdditionalDmg: {
      id: 'e2AdditionalDmg',
      formItem: 'switch',
      text: 'E2 Additional DMG buff',
      content: betaContent,
      disabled: e < 2,
    },
    e4Buffs: {
      id: 'e4Buffs',
      formItem: 'switch',
      text: 'E4 buffs',
      content: betaContent,
      disabled: e < 4,
    },
    e6ResPen: {
      id: 'e6ResPen',
      formItem: 'switch',
      text: 'E6 RES PEN',
      content: betaContent,
      disabled: e < 6,
    },
  }

  const teammateDefaults = {
    skillAtkBuff: true,
    teammateATKValue: 4500,
    ultZone: true,
    syncopationStacks: 10,
    teamDmgBuff: true,
    e1Buffs: true,
    e2AtkBuff: true,
    e6ResPen: true,
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    skillAtkBuff: content.skillAtkBuff,
    teammateATKValue: {
      id: 'teammateATKValue',
      formItem: 'slider',
      text: 'Astra\'s combat ATK',
      content: betaContent,
      min: 0,
      max: 10000,
    },
    ultZone: content.ultZone,
    syncopationStacks: content.syncopationStacks,
    teamDmgBuff: content.teamDmgBuff,
    e1Buffs: content.e1Buffs,
    e2AtkBuff: content.e2AtkBuff,
    e6ResPen: content.e6ResPen,
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    teammateContent: () => Object.values(teammateContent),
    teammateDefaults: () => teammateDefaults,
    entityDeclaration: () => Object.values(AstraYaoEntities),
    entityDefinition: () => ({
      [AstraYaoEntities.AstraYao]: {
        primary: true,
        summon: false,
        memosprite: false,
        pet: false,
      },
    }),
    actionDeclaration: () => [...AstraYaoAbilities],
    actionDefinition: (action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // E4 enhanced Basic and Ult multipliers
      const e4Active = e >= 4 && r.e4Buffs

      return {
        [AbilityKind.BASIC]: {
          hits: [
            HitDefinitionBuilder.standardBasic()
              .damageElement(ElementTag.Quantum)
              .atkScaling(r.enhancedBasic ? enhancedBasicScaling * (e4Active ? 1.60 : 1) : basicScaling)
              .toughnessDmg(r.enhancedBasic ? 20 : 10)
              .build(),
            HitDefinitionBuilder.standardAdditional()
              .damageElement(ElementTag.Quantum)
              .atkScaling(r.ultZone ? ultAdditionalScaling : 0)
              .build(),
          ],
        },
        [AbilityKind.UNIQUE]: {
          hits: [
            HitDefinitionBuilder.standardBasic()
              .damageElement(ElementTag.Quantum)
              .atkScaling(minuetScaling)
              .toughnessDmg(20)
              .build(),
            HitDefinitionBuilder.standardAdditional()
              .damageElement(ElementTag.Quantum)
              .atkScaling(r.ultZone ? ultAdditionalScaling : 0)
              .build(),
          ],
        },
        [AbilityKind.ULT]: {
          hits: [
            HitDefinitionBuilder.standardUlt()
              .damageElement(ElementTag.Quantum)
              .atkScaling(ultScaling * (e4Active ? 2.00 : 1))
              .toughnessDmg(20)
              .build(),
          ],
        },
        [AbilityKind.BREAK]: {
          hits: [HitDefinitionBuilder.standardBreak(ElementTag.Quantum).build()],
        },
        [AbilityKind.BUFF]: {
          hits: [
            HitDefinitionBuilder.linearBuff()
              .buffStat(StatKey.ATK)
              .sourceStat(StatKey.ATK)
              .scaling(r.skillAtkBuff ? skillAtkScaling + ((e >= 2 && r.e2AtkBuff) ? 0.12 : 0) : 0)
              .flat(r.skillAtkBuff ? skillAtkFlat : 0)
              .build(),
          ],
        },
      }
    },
    actionModifiers: () => [],
    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // Skill flat ATK buff
      const flatAtk = r.skillAtkBuff ? skillAtkFlat : 0
      x.buff(StatKey.ATK, flatAtk, x.source(SOURCE_SKILL))
      x.buff(StatKey.UNCONVERTIBLE_ATK_BUFF, flatAtk, x.source(SOURCE_SKILL))

      // Trace CR buff (+50%)
      x.buff(StatKey.CR, r.crBuff ? 0.50 : 0, x.source(SOURCE_TRACE))

      // E2 Additional DMG boost (+80%)
      if (action.actionType === AbilityKind.BASIC || action.actionType === AbilityKind.UNIQUE) {
        x.buff(
          StatKey.BOOST,
          (e >= 2 && r.e2AdditionalDmg && r.ultZone) ? 0.80 : 0,
          x.target(AstraYaoEntities.AstraYao).damageType(DamageTag.ADDITIONAL).source(SOURCE_E2),
        )
      }
    },
    precomputeMutualEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>
      const syncopationBoost = talentDmgPerStack * m.syncopationStacks

      // Ult vulnerability
      x.buff(StatKey.VULNERABILITY, m.ultZone ? ultVulnerability : 0, x.targets(TargetTag.FullTeam).source(SOURCE_ULT))

      // Talent Basic DMG boost; E1 + Zone applies to all damage
      if (e >= 1 && m.e1Buffs && m.ultZone) {
        x.buff(
          StatKey.BOOST,
          syncopationBoost,
          x.targets(TargetTag.FullTeam).source(SOURCE_TALENT),
        )
      } else {
        x.buff(
          StatKey.BOOST,
          syncopationBoost,
          x.targets(TargetTag.FullTeam).damageType(DamageTag.BASIC).source(SOURCE_TALENT),
        )
      }

      // Trace team DMG boost (+40%)
      x.buff(
        StatKey.BOOST,
        (m.teamDmgBuff && m.syncopationStacks > 0) ? 0.40 : 0,
        x.targets(TargetTag.FullTeam).source(SOURCE_TRACE),
      )

      // E1 team DEF PEN per stack (+1.5%)
      x.buff(
        StatKey.DEF_PEN,
        (e >= 1 && m.e1Buffs) ? m.syncopationStacks * 0.015 : 0,
        x.targets(TargetTag.FullTeam).source(SOURCE_E1),
      )

      // E6 team RES PEN (+20%)
      x.buff(
        StatKey.RES_PEN,
        (e >= 6 && m.e6ResPen && m.ultZone) ? 0.20 : 0,
        x.targets(TargetTag.FullTeam).source(SOURCE_E6),
      )
    },
    precomputeTeammateEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const t = action.characterConditionals as Conditionals<typeof teammateContent>
      const derivedAtk = t.skillAtkBuff ? t.teammateATKValue * (skillAtkScaling + ((e >= 2 && t.e2AtkBuff) ? 0.12 : 0)) : 0
      const flatAtk = t.skillAtkBuff ? skillAtkFlat : 0

      // Skill team ATK buff
      x.buff(StatKey.ATK, derivedAtk + flatAtk, x.targets(TargetTag.FullTeam).source(SOURCE_SKILL))
      x.buff(StatKey.UNCONVERTIBLE_ATK_BUFF, derivedAtk + flatAtk, x.targets(TargetTag.FullTeam).source(SOURCE_SKILL))
    },
    finalizeCalculations: () => {},
    newGpuFinalizeCalculations: () => '',
    dynamicConditionals: [
      // Skill ATK conversion
      {
        id: 'AstraYaoSkillAtkShare',
        type: ConditionalType.ABILITY,
        activation: ConditionalActivation.CONTINUOUS,
        dependsOn: [Stats.ATK],
        chainsTo: [Stats.ATK],
        condition: function(x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals as Conditionals<typeof content>

          return r.skillAtkBuff
        },
        effect: function(x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals as Conditionals<typeof content>
          const ratio = skillAtkScaling + ((e >= 2 && r.e2AtkBuff) ? 0.12 : 0)

          dynamicStatConversionContainer(Stats.ATK, Stats.ATK, this, x, action, context, SOURCE_SKILL, (convertibleValue) => convertibleValue * ratio)
        },
        gpu: function(action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals as Conditionals<typeof content>
          const ratio = skillAtkScaling + ((e >= 2 && r.e2AtkBuff) ? 0.12 : 0)

          return gpuDynamicStatConversion(Stats.ATK, Stats.ATK, this, action, context, `convertibleValue * ${ratio}`, wgslTrue(r.skillAtkBuff))
        },
      },
      // Trace ATK to CD conversion
      {
        id: 'AstraYaoFantasiaScale',
        type: ConditionalType.ABILITY,
        activation: ConditionalActivation.CONTINUOUS,
        dependsOn: [Stats.ATK],
        chainsTo: [Stats.CD],
        condition: function(x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals as Conditionals<typeof content>
          return r.atkToCdConversion
        },
        effect: function(x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) {
          // Includes ATK from her Skill
          const totalAtk = x.getActionValueByIndex(StatKey.ATK, SELF_ENTITY_INDEX)
          dynamicStatConversionContainer(
            Stats.ATK,
            Stats.CD,
            this,
            x,
            action,
            context,
            SOURCE_TRACE,
            () => Math.min(2.00, 0.20 * Math.floor(Math.max(0, totalAtk - 2000) / 200)),
          )
        },
        gpu: function(action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals as Conditionals<typeof content>
          const totalAtk = containerActionVal(SELF_ENTITY_INDEX, StatKey.ATK, action.config)
          return gpuDynamicStatConversion(
            Stats.ATK,
            Stats.CD,
            this,
            action,
            context,
            `min(2.00, 0.20 * floor(max(0.0, ${totalAtk} - 2000.0) / 200.0))`,
            wgslTrue(r.atkToCdConversion),
          )
        },
      },
    ],
  }
}

const simulation = (): SimulationMetadata => ({
  leaderboardEnabled: true,
  parts: {
    [Parts.Body]: [Stats.ATK_P, Stats.CR, Stats.CD],
    [Parts.Feet]: [Stats.ATK_P, Stats.SPD],
    [Parts.PlanarSphere]: [Stats.ATK_P, Stats.Quantum_DMG],
    [Parts.LinkRope]: [Stats.ATK_P, Stats.ERR],
  },
  substats: [Stats.ATK_P, Stats.ATK, Stats.CR, Stats.CD, Stats.HP_P],
  errRopeEidolon: 0,
  // Trace CD conversion caps at 4000 ATK
  softBreakpoints: [
    { stat: Stats.ATK, threshold: 4000 },
  ],
  comboTurnAbilities: [
    NULL_TURN_ABILITY_NAME,
    START_ULT,
    DEFAULT_BASIC,
    DEFAULT_UNIQUE,
    END_BASIC,
    WHOLE_BASIC,
    WHOLE_BASIC,
  ],
  relicSets: [
    [Sets.TheEdaciousHeretic, Sets.TheEdaciousHeretic],
    relics2pByStats(Stats.ATK_P, Stats.SPD_P),
    ...SPREAD_RELICS_4P_SUPPORT,
    ...SPREAD_RELICS_4P_GENERAL_CONDITIONALS,
  ],
  ornamentSets: [
    Sets.RutilantArena,
    ...SPREAD_ORNAMENTS_2P_GENERAL_CONDITIONALS,
    ...SPREAD_ORNAMENTS_2P_SUPPORT,
  ],
  deprioritizeBuffs: true,
  teammates: [
    {
      characterId: Ellen.id,
      lightCone: NoShiftsOnRainyDays.id,
      characterEidolon: 0,
      lightConeSuperimposition: 1,
    },
    {
      characterId: RobinSummeretto.id,
      lightCone: RiseAndSing.id,
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

const supportSimulation = (): SimulationMetadata => ({
  leaderboardEnabled: true,
  parts: {
    [Parts.Body]: [Stats.ATK_P],
    [Parts.Feet]: [Stats.ATK_P, Stats.SPD],
    [Parts.PlanarSphere]: [Stats.ATK_P],
    [Parts.LinkRope]: [Stats.ATK_P],
  },
  substats: [
    Stats.ATK_P,
    Stats.ATK,
    Stats.SPD,
    Stats.RES,
    Stats.HP_P,
  ],
  buffStat: StatKey.ATK,
  errRopeEidolon: 0,
  comboTurnAbilities: [
    NULL_TURN_ABILITY_NAME,
  ],
  relicSets: [
    [Sets.PrisonerInDeepConfinement, Sets.TheWindSoaringValorous],
    [Sets.TheEdaciousHeretic, Sets.TheEdaciousHeretic],
    ...SPREAD_RELICS_4P_SUPPORT,
  ],
  ornamentSets: [
    Sets.LushakaTheSunkenSeas,
    ...SPREAD_ORNAMENTS_2P_SUPPORT,
  ],
  teammates: [
    {
      characterId: Ellen.id,
      lightCone: NoShiftsOnRainyDays.id,
      characterEidolon: 0,
      lightConeSuperimposition: 1,
    },
    {
      characterId: RobinSummeretto.id,
      lightCone: RiseAndSing.id,
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
  deprioritizeBuffs: true,
})

const scoring = (): ScoringMetadata => ({
  stats: {
    [Stats.ATK]: 1,
    [Stats.ATK_P]: 1,
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
    [Parts.Body]: [Stats.ATK_P, Stats.CR, Stats.CD],
    [Parts.Feet]: [Stats.ATK_P, Stats.SPD],
    [Parts.PlanarSphere]: [Stats.ATK_P, Stats.Quantum_DMG],
    [Parts.LinkRope]: [Stats.ATK_P, Stats.ERR],
  },
  presets: [],
  defaultDamageType: DamageTag.BASIC,
  sortOption: SortOption.BASIC,
  hiddenColumns: [SortOption.SKILL, SortOption.FUA, SortOption.DOT],
  addedColumns: [SortOption.UNIQUE],
  simulation: simulation(),
  supportSimulation: supportSimulation(),
})

const display = {
  imageCenter: {
    x: 1129,
    y: 746,
    z: 1.23,
  },
  showcaseColor: '#f6987d',
  showcaseScoringOrder: [
    ScoringType.DPS_SCORE,
    ScoringType.BUFFER_SCORE,
    ScoringType.SUBSTAT_SCORE,
    ScoringType.NONE,
  ],
}

export const AstraYao: CharacterConfig = {
  id: '1515',
  defaultLightCone: ShineBrightLikeHer.id,
  display,
  conditionals,
  get scoring() {
    return scoring()
  },
}

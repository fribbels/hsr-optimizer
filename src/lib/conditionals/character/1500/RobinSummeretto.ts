import i18next from 'i18next'
import { Aglaea } from 'lib/conditionals/character/1400/Aglaea'
import { Cyrene } from 'lib/conditionals/character/1400/Cyrene'
import { Hyacine } from 'lib/conditionals/character/1400/Hyacine'
import {
  BuffPriority,
} from 'lib/conditionals/conditionalConstants'
import {
  AbilityEidolon,
  type Conditionals,
  type ContentDefinition,
  createEnum,
} from 'lib/conditionals/conditionalUtils'
import { HitDefinitionBuilder } from 'lib/conditionals/hitDefinitionBuilder'
import { MayRainbowsRemainInTheSky } from 'lib/conditionals/lightcone/5star/MayRainbowsRemainInTheSky'
import { RiseAndSing } from 'lib/conditionals/lightcone/5star/RiseAndSing'
import { ThisLoveForever } from 'lib/conditionals/lightcone/5star/ThisLoveForever'
import { TimeWovenIntoGold } from 'lib/conditionals/lightcone/5star/TimeWovenIntoGold'
import { ToEvernightsStars } from 'lib/conditionals/lightcone/5star/ToEvernightsStars'
import {
  CURRENT_DATA_VERSION,
  Parts,
  Sets,
  Stats,
} from 'lib/constants/constants'
import { Source } from 'lib/optimization/buffSource'
import { StatKey } from 'lib/optimization/engine/config/keys'
import {
  DamageTag,
  ElementTag,
  TargetTag,
} from 'lib/optimization/engine/config/tag'
import { type ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import {
  AbilityKind,
  DEFAULT_MEMO_SKILL,
  END_BASIC,
  END_SKILL,
  NULL_TURN_ABILITY_NAME,
  START_ULT,
  WHOLE_BASIC,
} from 'lib/optimization/rotation/turnAbilityConfig'
import { SortOption } from 'lib/optimization/sortOptions'
import { PresetEffects } from 'lib/scoring/presetEffects'
import {
  SPREAD_ORNAMENTS_2P_GENERAL_CONDITIONALS,
  SPREAD_ORNAMENTS_2P_SUPPORT,
  SPREAD_RELICS_4P_GENERAL_CONDITIONALS,
  SPREAD_RELICS_4P_SUPPORT,
} from 'lib/scoring/scoringConstants'
import { ScoringType } from 'lib/scoring/scoringTypes'
import { wrappedFixedT } from 'lib/utils/i18nUtils'
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

export const RobinSummerettoEntities = createEnum(
  'RobinSummeretto',
  'SummerSongbirds',
)

export const RobinSummerettoAbilities: AbilityKind[] = [
  AbilityKind.BASIC,
  AbilityKind.MEMO_SKILL,
  AbilityKind.BREAK,
  AbilityKind.BUFF,
]

// Deviated Chord's ATK branch needs the ally to out-ATK Robin, which is driven by how much ATK the
// build invests in rather than by base ATK. The ATK scoring weight stands in for that investment.
// Weights land on 0, 0.25, 0.5, 0.75 and 1, so this cuts between incidental and stacked ATK.
const ATK_BRANCH_WEIGHT_THRESHOLD = 0.333

enum DeviatedChordBranch {
  WEIGHT_BASED = 0,
  ATK = 1,
  CD = 2,
}

const conditionals = (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const tBuff = wrappedFixedT(withContent).get(null, 'conditionals', 'Common.BuffPriority')
  const betaContent = i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION })
  const { basic, skill, ult, talent, memoSkill, memoTalent } = AbilityEidolon.SKILL_TALENT_MEMO_TALENT_3_ULT_BASIC_MEMO_SKILL_5
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
  } = Source.character(RobinSummeretto.id)

  const basicScaling = basic(e, 0.50, 0.55)

  const memoSkillScaling = memoSkill(e, 1.50, 1.65)

  const maxVibes = (e >= 2) ? 70 : 50

  // Multiples of 10 so the vibe scaled buffs come out as round numbers
  const defaultVibes = (e >= 2) ? 60 : 30

  const talentZoneDefPen = talent(e, 0.15, 0.16)

  const memoTalentDmgBoost = memoTalent(e, 0.60, 0.66)
  const memoTalentDmgBoostPerVibe = memoTalent(e, 0.02, 0.022)

  const memoTalentVulnerabilityByCount: Record<number, number> = {
    1: memoTalent(e, 0.08, 0.088),
    2: memoTalent(e, 0.12, 0.132),
    3: memoTalent(e, 0.16, 0.176),
  }

  const traceCdBuff = 0.40
  const traceCdBuffPerVibe = 0.015

  const traceAtkBuff = 0.16
  const traceAtkBuffPerVibe = 0.004

  const defaults = {
    buffPriority: BuffPriority.MEMO,
    feverState: true,
    vibes: defaultVibes,
    songbirdCount: 3,
    deviatedChordCdBuff: true,
    e2ResPen: true,
    e4MemoSpdBuff: true,
    e6MemoSkillBuff: true,
  }

  const teammateDefaults = {
    feverState: true,
    vibes: defaultVibes,
    songbirdCount: 3,
    teammateHPValue: 8000,
    deviatedChordBranch: DeviatedChordBranch.WEIGHT_BASED,
    e2ResPen: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    buffPriority: {
      id: 'buffPriority',
      formItem: 'select',
      text: tBuff('Text'),
      content: tBuff('Content'),
      options: [
        { display: tBuff('Self'), value: BuffPriority.SELF, label: tBuff('Self') },
        { display: tBuff('Memo'), value: BuffPriority.MEMO, label: tBuff('Memo') },
      ],
      fullWidth: true,
    },
    feverState: {
      id: 'feverState',
      formItem: 'switch',
      text: 'Fever state',
      content: betaContent,
    },
    vibes: {
      id: 'vibes',
      formItem: 'slider',
      text: 'Vibes',
      content: betaContent,
      min: 0,
      max: maxVibes,
    },
    songbirdCount: {
      id: 'songbirdCount',
      formItem: 'slider',
      text: 'Summer Songbirds',
      content: betaContent,
      min: 0,
      max: 3,
    },
    deviatedChordCdBuff: {
      id: 'deviatedChordCdBuff',
      formItem: 'switch',
      text: 'Deviated Chord: CRIT DMG',
      content: betaContent,
    },
    e2ResPen: {
      id: 'e2ResPen',
      formItem: 'switch',
      text: 'E2 RES PEN',
      content: betaContent,
      disabled: e < 2,
    },
    e4MemoSpdBuff: {
      id: 'e4MemoSpdBuff',
      formItem: 'switch',
      text: 'E4 SPD buff',
      content: betaContent,
      disabled: e < 4,
    },
    e6MemoSkillBuff: {
      id: 'e6MemoSkillBuff',
      formItem: 'switch',
      text: 'E6 Memosprite Skill DMG',
      content: betaContent,
      disabled: e < 6,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    feverState: content.feverState,
    vibes: content.vibes,
    songbirdCount: content.songbirdCount,
    teammateHPValue: {
      id: 'teammateHPValue',
      formItem: 'slider',
      text: `Robin's combat HP`,
      content: betaContent,
      min: 0,
      max: 20000,
    },
    deviatedChordBranch: {
      id: 'deviatedChordBranch',
      formItem: 'select',
      text: 'Deviated Chord buff',
      content: betaContent,
      options: [
        { display: 'Weight based', value: DeviatedChordBranch.WEIGHT_BASED, label: 'Weight based' },
        { display: 'ATK', value: DeviatedChordBranch.ATK, label: 'ATK buff' },
        { display: 'CD', value: DeviatedChordBranch.CD, label: 'CRIT DMG buff' },
      ],
      fullWidth: true,
    },
    e2ResPen: content.e2ResPen,
  }

  return {
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    entityDeclaration: () => Object.values(RobinSummerettoEntities),
    actionDeclaration: () => [...RobinSummerettoAbilities],

    entityDefinition: (action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>
      return {
        [RobinSummerettoEntities.RobinSummeretto]: {
          primary: true,
          summon: false,
          memosprite: false,
          memoBuffPriority: r.buffPriority !== BuffPriority.SELF,
        },
        [RobinSummerettoEntities.SummerSongbirds]: {
          primary: false,
          summon: true,
          memosprite: true,
          memoBaseAtkScaling: 1.00,
          memoBaseDefScaling: 1.00,
          memoBaseHpScaling: 0.70,
          memoBaseSpdScaling: 1.80,
        },
      }
    },

    actionDefinition: (action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // E6: Memosprite Skill multiplier +100% of original
      const memoSkillTotalScaling = memoSkillScaling * ((e >= 6 && r.e6MemoSkillBuff) ? 2 : 1)

      return {
        [AbilityKind.BASIC]: {
          hits: [
            HitDefinitionBuilder.standardBasic()
              .damageElement(ElementTag.Wind)
              .hpScaling(basicScaling)
              .toughnessDmg(10)
              .build(),
          ],
        },
        [AbilityKind.MEMO_SKILL]: {
          hits: [
            HitDefinitionBuilder.crit()
              .sourceEntity(RobinSummerettoEntities.SummerSongbirds)
              .damageType(DamageTag.MEMO)
              .damageElement(ElementTag.Wind)
              .hpScaling(memoSkillTotalScaling)
              .toughnessDmg(10)
              .directHit(true)
              .build(),
          ],
        },
        [AbilityKind.BREAK]: {
          hits: [
            HitDefinitionBuilder.standardBreak(ElementTag.Wind).build(),
          ],
        },
        // Deviated Chord's ATK branch, scaling off Robin's own HP. The support benchmark always
        // reports the ATK value and ignores the CRIT DMG branch that lower-ATK allies would take.
        [AbilityKind.BUFF]: {
          hits: [
            HitDefinitionBuilder.linearBuff()
              .buffStat(StatKey.ATK)
              .sourceStat(StatKey.HP)
              .scaling(traceAtkBuff + r.vibes * traceAtkBuffPerVibe)
              .build(),
          ],
        },
      }
    },

    actionModifiers() {
      return []
    },

    initializeConfigurationsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
    },

    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // Trace: +50% CR
      x.buff(StatKey.CR, 0.50, x.targets(TargetTag.SelfAndMemosprite).source(SOURCE_TRACE))

      // Memo Talent: Fever DMG boost, 60% + Vibes x 2%
      x.buff(
        StatKey.BOOST,
        (r.feverState) ? memoTalentDmgBoost + r.vibes * memoTalentDmgBoostPerVibe : 0,
        x.targets(TargetTag.SelfAndMemosprite).source(SOURCE_MEMO),
      )

      // Deviated Chord: Robin's own ATK can never exceed itself, so she always takes the CD branch
      x.buff(
        StatKey.CD,
        (r.deviatedChordCdBuff) ? traceCdBuff + r.vibes * traceCdBuffPerVibe : 0,
        x.targets(TargetTag.SelfAndMemosprite).source(SOURCE_TRACE),
      )

      // E4: Songbirds SPD +20% + Vibes x 0.5%
      x.buff(
        StatKey.SPD_P,
        (e >= 4 && r.e4MemoSpdBuff && r.feverState) ? 0.20 + r.vibes * 0.005 : 0,
        x.target(RobinSummerettoEntities.SummerSongbirds).source(SOURCE_E4),
      )
    },

    precomputeMutualEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      // Talent: Zone ignores 15% + Vibes x 0.5% of enemy DEF
      x.buff(
        StatKey.DEF_PEN,
        (m.feverState) ? talentZoneDefPen + m.vibes * 0.005 : 0,
        x.targets(TargetTag.FullTeam).source(SOURCE_TALENT),
      )

      // Memo Talent: enemy DMG taken, based on Songbirds
      x.buff(
        StatKey.VULNERABILITY,
        memoTalentVulnerabilityByCount[m.songbirdCount] ?? 0,
        x.targets(TargetTag.FullTeam).source(SOURCE_MEMO),
      )

      // E2: +18% All-Type RES PEN
      x.buff(
        StatKey.RES_PEN,
        (e >= 2 && m.e2ResPen) ? 0.18 : 0,
        x.targets(TargetTag.FullTeam).source(SOURCE_E2),
      )
    },

    precomputeTeammateEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const t = action.characterConditionals as Conditionals<typeof teammateContent>

      // Comparing live ATK against an assumed value for Robin made the branch flip mid-search, so
      // the weight based default resolves it once per build and the other options force a branch.
      const atkBranch = (t.deviatedChordBranch === DeviatedChordBranch.WEIGHT_BASED)
        ? context.atkStatWeight > ATK_BRANCH_WEIGHT_THRESHOLD
        : t.deviatedChordBranch === DeviatedChordBranch.ATK

      if (atkBranch) {
        const atkBuff = (traceAtkBuff + t.vibes * traceAtkBuffPerVibe) * t.teammateHPValue
        x.buff(StatKey.UNCONVERTIBLE_ATK_BUFF, atkBuff, x.targets(TargetTag.FullTeam).source(SOURCE_TRACE))
        x.buff(StatKey.ATK, atkBuff, x.targets(TargetTag.FullTeam).source(SOURCE_TRACE))
      } else {
        const cdBuff = traceCdBuff + t.vibes * traceCdBuffPerVibe
        x.buff(StatKey.UNCONVERTIBLE_CD_BUFF, cdBuff, x.targets(TargetTag.FullTeam).source(SOURCE_TRACE))
        x.buff(StatKey.CD, cdBuff, x.targets(TargetTag.FullTeam).source(SOURCE_TRACE))
      }
    },

    finalizeCalculations: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {},
    newGpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => '',

    dynamicConditionals: [],

    teammateDynamicConditionals: [],
  }
}

const simulation = (): SimulationMetadata => ({
  leaderboardEnabled: true,
  parts: {
    [Parts.Body]: [
      Stats.CR,
      Stats.CD,
      Stats.HP_P,
    ],
    [Parts.Feet]: [
      Stats.SPD,
      Stats.HP_P,
    ],
    [Parts.PlanarSphere]: [
      Stats.HP_P,
      Stats.Wind_DMG,
    ],
    [Parts.LinkRope]: [
      Stats.HP_P,
    ],
  },
  substats: [
    Stats.CD,
    Stats.CR,
    Stats.HP_P,
    Stats.HP,
    Stats.SPD,
  ],
  comboTurnAbilities: [
    NULL_TURN_ABILITY_NAME,
    START_ULT,
    END_SKILL,
    DEFAULT_MEMO_SKILL,
    DEFAULT_MEMO_SKILL,
    WHOLE_BASIC,
    DEFAULT_MEMO_SKILL,
    DEFAULT_MEMO_SKILL,
  ],
  errRopeEidolon: 0,
  relicSets: [
    [Sets.WorldRemakingDeliverer, Sets.WorldRemakingDeliverer],
    ...SPREAD_RELICS_4P_GENERAL_CONDITIONALS,
    ...SPREAD_RELICS_4P_SUPPORT,
  ],
  ornamentSets: [
    Sets.AmphoreusTheEternalLand,
    ...SPREAD_ORNAMENTS_2P_GENERAL_CONDITIONALS,
    ...SPREAD_ORNAMENTS_2P_SUPPORT,
  ],
  deprioritizeBuffs: true,
  teammates: [
    {
      characterId: Aglaea.id,
      lightCone: TimeWovenIntoGold.id,
      characterEidolon: 0,
      lightConeSuperimposition: 1,
    },
    {
      characterId: Cyrene.id,
      lightCone: ThisLoveForever.id,
      characterEidolon: 0,
      lightConeSuperimposition: 1,
    },
    {
      characterId: Hyacine.id,
      lightCone: MayRainbowsRemainInTheSky.id,
      characterEidolon: 0,
      lightConeSuperimposition: 1,
    },
  ],
})

const supportSimulation = (): SimulationMetadata => ({
  leaderboardEnabled: true,
  parts: {
    [Parts.Body]: [
      Stats.HP_P,
    ],
    [Parts.Feet]: [
      Stats.SPD,
      Stats.HP_P,
    ],
    [Parts.PlanarSphere]: [
      Stats.HP_P,
    ],
    [Parts.LinkRope]: [
      Stats.HP_P,
    ],
  },
  substats: [
    Stats.HP_P,
    Stats.HP,
    Stats.SPD,
    Stats.RES,
    Stats.DEF_P,
  ],
  buffStat: StatKey.ATK,
  errRopeEidolon: 0,
  comboTurnAbilities: [
    NULL_TURN_ABILITY_NAME,
  ],
  relicSets: [
    [Sets.WorldRemakingDeliverer, Sets.WorldRemakingDeliverer],
    ...SPREAD_RELICS_4P_GENERAL_CONDITIONALS,
    ...SPREAD_RELICS_4P_SUPPORT,
  ],
  ornamentSets: [
    Sets.LushakaTheSunkenSeas,
    Sets.AmphoreusTheEternalLand,
    ...SPREAD_ORNAMENTS_2P_GENERAL_CONDITIONALS,
    ...SPREAD_ORNAMENTS_2P_SUPPORT,
  ],
  teammates: [
    {
      characterId: Aglaea.id,
      lightCone: TimeWovenIntoGold.id,
      characterEidolon: 0,
      lightConeSuperimposition: 1,
    },
    {
      characterId: Cyrene.id,
      lightCone: ThisLoveForever.id,
      characterEidolon: 0,
      lightConeSuperimposition: 1,
    },
    {
      characterId: Hyacine.id,
      lightCone: MayRainbowsRemainInTheSky.id,
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
    [Stats.HP]: 1,
    [Stats.HP_P]: 1,
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
      Stats.HP_P,
    ],
    [Parts.Feet]: [
      Stats.SPD,
      Stats.HP_P,
    ],
    [Parts.PlanarSphere]: [
      Stats.HP_P,
      Stats.Wind_DMG,
    ],
    [Parts.LinkRope]: [
      Stats.HP_P,
      Stats.ERR,
    ],
  },
  presets: [
    PresetEffects.fnSacerdosSet(1),
    PresetEffects.BANANA_SET,
    PresetEffects.WARRIOR_SET,
  ],
  defaultDamageType: DamageTag.MEMO,
  sortOption: SortOption.MEMO_SKILL,
  hiddenColumns: [SortOption.SKILL, SortOption.ULT, SortOption.FUA, SortOption.DOT],
  addedColumns: [SortOption.MEMO_SKILL],
  simulation: simulation(),
  supportSimulation: supportSimulation(),
})

const display = {
  imageCenter: {
    x: 946,
    y: 902,
    z: 1.12,
  },
  spineCenter: {
    x: 952,
    y: 933,
    z: 1.12,
  },
  showcaseColor: '#86aef4',
  showcaseScoringOrder: [
    ScoringType.BUFFER_SCORE,
    ScoringType.DPS_SCORE,
    ScoringType.SUBSTAT_SCORE,
    ScoringType.NONE,
  ],
}

export const RobinSummeretto: CharacterConfig = {
  id: '1512',
  defaultLightCone: RiseAndSing.id,
  display,
  conditionals,
  get scoring() {
    return scoring()
  },
}

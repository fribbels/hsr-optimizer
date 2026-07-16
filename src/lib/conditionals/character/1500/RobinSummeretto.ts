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
import {
  dynamicStatConversionContainer,
  gpuDynamicStatConversion,
} from 'lib/conditionals/evaluation/statConversion'
import { HitDefinitionBuilder } from 'lib/conditionals/hitDefinitionBuilder'
import { MayRainbowsRemainInTheSky } from 'lib/conditionals/lightcone/5star/MayRainbowsRemainInTheSky'
import { RiseAndSing } from 'lib/conditionals/lightcone/5star/RiseAndSing'
import { ThisLoveForever } from 'lib/conditionals/lightcone/5star/ThisLoveForever'
import { TimeWovenIntoGold } from 'lib/conditionals/lightcone/5star/TimeWovenIntoGold'
import { ToEvernightsStars } from 'lib/conditionals/lightcone/5star/ToEvernightsStars'
import {
  ConditionalActivation,
  ConditionalType,
  CURRENT_DATA_VERSION,
  Parts,
  Sets,
  Stats,
} from 'lib/constants/constants'
import { containerActionVal } from 'lib/gpu/injection/injectUtils'
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
  SPREAD_ORNAMENTS_2P_SUPPORT,
  SPREAD_RELICS_4P_GENERAL_CONDITIONALS,
} from 'lib/scoring/scoringConstants'
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
]

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

  const maxVibes = (e >= 1) ? 70 : 50

  const talentZoneDefPen = talent(e, 0.15, 0.16)

  const memoTalentDmgBoost = memoTalent(e, 0.60, 0.66)
  const memoTalentDmgBoostPerVibe = memoTalent(e, 0.02, 0.022)

  const memoTalentVulnerabilityByCount: Record<number, number> = {
    1: memoTalent(e, 0.10, 0.11),
    2: memoTalent(e, 0.15, 0.165),
    3: memoTalent(e, 0.20, 0.22),
  }

  const traceCdBuff = 0.40
  const traceCdBuffPerVibe = 0.01

  const defaults = {
    buffPriority: BuffPriority.MEMO,
    feverState: true,
    vibes: maxVibes / 2,
    songbirdCount: 3,
    deviatedChordCdBuff: true,
    e4MemoSpdBuff: true,
    e6Buffs: true,
  }

  const teammateDefaults = {
    feverState: true,
    vibes: maxVibes / 2,
    songbirdCount: 3,
    teammateHPValue: 8000,
    teammateATKValue: 1750,
    e6Buffs: true,
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
    e4MemoSpdBuff: {
      id: 'e4MemoSpdBuff',
      formItem: 'switch',
      text: 'E4 SPD buff',
      content: betaContent,
      disabled: e < 4,
    },
    e6Buffs: {
      id: 'e6Buffs',
      formItem: 'switch',
      text: 'E6 buffs',
      content: betaContent,
      disabled: e < 6,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    feverState: content.feverState,
    vibes: content.vibes,
    songbirdCount: content.songbirdCount,
    // Deviated Chord's branch is derived from the ally's ATK vs Robin's, so both sliders feed the
    // comparison in teammateDynamicConditionals instead of exposing the branch as a toggle.
    teammateHPValue: {
      id: 'teammateHPValue',
      formItem: 'slider',
      text: `Robin's combat HP`,
      content: betaContent,
      min: 0,
      max: 20000,
    },
    teammateATKValue: {
      id: 'teammateATKValue',
      formItem: 'slider',
      text: `Robin's combat ATK`,
      content: betaContent,
      min: 0,
      max: 5000,
    },
    e6Buffs: content.e6Buffs,
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
      const memoSkillTotalScaling = memoSkillScaling * ((e >= 6 && r.e6Buffs) ? 2 : 1)

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

      // E6: +200% CD on entering Fever
      x.buff(
        StatKey.CD,
        (e >= 6 && r.e6Buffs && r.feverState) ? 2.00 : 0,
        x.targets(TargetTag.SelfAndMemosprite).source(SOURCE_E6),
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

      // E6: +20% All-Type RES PEN
      x.buff(
        StatKey.RES_PEN,
        (e >= 6 && m.e6Buffs) ? 0.20 : 0,
        x.targets(TargetTag.FullTeam).source(SOURCE_E6),
      )
    },

    precomputeTeammateEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
    },

    finalizeCalculations: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {},
    newGpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => '',

    dynamicConditionals: [],

    // Deviated Chord: ATK branch when the ally's ATK exceeds Robin's, else CRIT DMG.
    // The branch lives in the buff value, not `condition`, so the losing branch retracts via its delta.
    teammateDynamicConditionals: [
      {
        id: 'RobinSummerettoDeviatedChordAtk',
        type: ConditionalType.ABILITY,
        activation: ConditionalActivation.CONTINUOUS,
        dependsOn: [Stats.ATK],
        chainsTo: [Stats.ATK],
        condition: function() {
          return true
        },
        effect: function(x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) {
          const t = action.teammateCharacterConditionals as Conditionals<typeof teammateContent>
          const atkBuff = (0.16 + t.vibes * 0.004) * t.teammateHPValue

          dynamicStatConversionContainer(
            Stats.ATK,
            Stats.ATK,
            this,
            x,
            action,
            context,
            SOURCE_TRACE,
            () => (x.getActionValueByIndex(StatKey.ATK, SELF_ENTITY_INDEX) > t.teammateATKValue) ? atkBuff : 0,
            TargetTag.FullTeam,
          )
        },
        gpu: function(action: OptimizerAction, context: OptimizerContext) {
          const t = action.teammateCharacterConditionals as Conditionals<typeof teammateContent>
          const atkBuff = (0.16 + t.vibes * 0.004) * t.teammateHPValue

          return gpuDynamicStatConversion(
            Stats.ATK,
            Stats.ATK,
            this,
            action,
            context,
            `select(0.0, ${atkBuff.toFixed(4)}, ${containerActionVal(SELF_ENTITY_INDEX, StatKey.ATK, action.config)} > ${t.teammateATKValue.toFixed(4)})`,
            'true',
            'true',
            TargetTag.FullTeam,
          )
        },
      },
      {
        id: 'RobinSummerettoDeviatedChordCd',
        type: ConditionalType.ABILITY,
        activation: ConditionalActivation.CONTINUOUS,
        dependsOn: [Stats.ATK],
        chainsTo: [Stats.CD],
        condition: function() {
          return true
        },
        effect: function(x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) {
          const t = action.teammateCharacterConditionals as Conditionals<typeof teammateContent>
          const cdBuff = traceCdBuff + t.vibes * traceCdBuffPerVibe

          dynamicStatConversionContainer(
            Stats.ATK,
            Stats.CD,
            this,
            x,
            action,
            context,
            SOURCE_TRACE,
            () => (x.getActionValueByIndex(StatKey.ATK, SELF_ENTITY_INDEX) > t.teammateATKValue) ? 0 : cdBuff,
            TargetTag.FullTeam,
          )
        },
        gpu: function(action: OptimizerAction, context: OptimizerContext) {
          const t = action.teammateCharacterConditionals as Conditionals<typeof teammateContent>
          const cdBuff = traceCdBuff + t.vibes * traceCdBuffPerVibe

          return gpuDynamicStatConversion(
            Stats.ATK,
            Stats.CD,
            this,
            action,
            context,
            `select(${cdBuff.toFixed(4)}, 0.0, ${containerActionVal(SELF_ENTITY_INDEX, StatKey.ATK, action.config)} > ${t.teammateATKValue.toFixed(4)})`,
            'true',
            'true',
            TargetTag.FullTeam,
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
  ],
  ornamentSets: [
    Sets.AmphoreusTheEternalLand,
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
})

const display = {
  imageCenter: {
    x: 946,
    y: 902,
    z: 1.12,
  },
  showcaseColor: '#86aef4',
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

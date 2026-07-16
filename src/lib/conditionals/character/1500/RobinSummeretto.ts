import { Sunday } from 'lib/conditionals/character/1300/Sunday'
import { Cyrene } from 'lib/conditionals/character/1400/Cyrene'
import { PermansorTerrae } from 'lib/conditionals/character/1400/PermansorTerrae'
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
import { AGroundedAscent } from 'lib/conditionals/lightcone/5star/AGroundedAscent'
import { ThisLoveForever } from 'lib/conditionals/lightcone/5star/ThisLoveForever'
import { ThoughWorldsApart } from 'lib/conditionals/lightcone/5star/ThoughWorldsApart'
import { ToEvernightsStars } from 'lib/conditionals/lightcone/5star/ToEvernightsStars'
import {
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
  NULL_TURN_ABILITY_NAME,
  WHOLE_BASIC,
} from 'lib/optimization/rotation/turnAbilityConfig'
import { SortOption } from 'lib/optimization/sortOptions'
import { PresetEffects } from 'lib/scoring/presetEffects'
import {
  SPREAD_ORNAMENTS_2P_SUPPORT,
  SPREAD_RELICS_4P_GENERAL_CONDITIONALS,
} from 'lib/scoring/scoringConstants'
import { wrappedFixedT } from 'lib/utils/i18nUtils'
import { precisionRound } from 'lib/utils/mathUtils'
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
  const t = wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.RobinSummeretto.Content')
  const tBuff = wrappedFixedT(withContent).get(null, 'conditionals', 'Common.BuffPriority')
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
  } = Source.character('1512')

  // Basic col A @ Lv.6/Lv.7 - 50% of Robin's Max HP
  const basicScaling = basic(e, 0.50, 0.55)

  // Memo Skill col B @ Lv.6/Lv.7 - 150% of Summer Songbirds' Max HP (col A is 0 at every level)
  const memoSkillScaling = memoSkill(e, 1.50, 1.65)

  // Talent cols A/B - memosprite base stat derivation, constant across levels
  const memoBaseHpScaling = 0.70
  const memoBaseSpdScaling = 1.80

  // Talent col E (50 Vibes cap), raised by E1
  const maxVibes = (e >= 1) ? 70 : 50

  // Talent cols H/I - Zone DEF ignore, 15% + Vibes x 0.5%
  const talentZoneDefPen = talent(e, 0.15, 0.16)
  const talentZoneDefPenPerVibe = 0.005

  // Memo Talent cols A/B - Fever DMG boost, 60% + Vibes x 2%
  const memoTalentDmgBoost = memoTalent(e, 0.60, 0.66)
  const memoTalentDmgBoostPerVibe = memoTalent(e, 0.02, 0.022)

  // Memo Talent cols C/D/E - enemy DMG taken by number of Songbirds on field
  const memoTalentVulnerabilityByCount: Record<number, number> = {
    1: memoTalent(e, 0.10, 0.11),
    2: memoTalent(e, 0.15, 0.165),
    3: memoTalent(e, 0.20, 0.22),
  }

  // Technique col B
  const techniqueDmgBoost = 0.30

  // Bonus Ability 1 (Deviated Chord) - trace values are literals
  const traceAtkBuffHpScaling = 0.16
  const traceAtkBuffHpScalingPerVibe = 0.004
  const traceCdBuff = 0.40
  const traceCdBuffPerVibe = 0.01

  // Bonus Ability 3 (Reconstructed Harmony)
  const traceCrBuff = 0.50

  const e4MemoSpdBuff = 0.20
  const e4MemoSpdBuffPerVibe = 0.005
  const e6ResPenValue = 0.20
  const e6CdBuffValue = 2.00
  const e6MemoSkillMultiplier = 2

  // Mechanics intentionally not modeled, with reasons:
  //
  // - Skill "restores its HP by 100% of Summer Songbirds' Max HP": heals the memosprite itself.
  //   The optimizer tracks no memosprite current HP and this grants no ally healing, so it has
  //   no effect on damage or on the heal columns.
  // - Ultimate (100% action advance, Energy equal to 20% of the ally's Max Energy, "Special
  //   Guest"): action advance and energy regen are rotation mechanics the damage sim does not
  //   model. The Vibes that "Special Guest" generates are covered by the vibes slider.
  // - Talent Fever clauses (Crowd Control dispel/immunity, Robin not taking turns during Fever):
  //   defensive and turn-order only.
  // - Memo Talent "Nestle in the Heartbeat of the Sea" (20 Energy on summon) and Bonus Ability 2
  //   "Improvised Blues" (Groove stacks -> 3 Energy): energy regen is not sim-modeled.
  // - Memo Talent "Ride the Summer Night Breeze" (50% action advance when the Songbirds leave)
  //   and the countdown's 140 SPD / 50%-Vibes deduction: turn-order bookkeeping. The sustained
  //   Vibes level it produces is what the vibes slider represents.
  // - E1 "+2 Vibes on the first ally Skill each turn" and E4 "immediately gains 12 Vibes":
  //   Vibes generation rate, represented by the vibes slider. E1's Max Vibes increase to 70 and
  //   E4's Songbirds SPD buff ARE modeled above.
  // - E2 (Songbirds record 100% of non-True DMG dealt by allies, then the Memosprite Skill deals
  //   True DMG equal to 11% + Vibes x 0.1% of that recorded total): the optimizer evaluates a
  //   single character's rotation and does not track cumulative team damage dealt across turns.
  //   No hit factory can express a flat damage amount either - every hit scales off ATK/HP/DEF,
  //   and StatKey.TRUE_DMG_MODIFIER is a multiplier on a hit's own damage, not on an external
  //   accumulator. Modeling it would require inventing a team-damage-total slider whose value
  //   the user cannot reasonably estimate.

  const defaults = {
    buffPriority: BuffPriority.MEMO,
    feverState: true,
    vibes: 30,
    songbirdCount: 3,
    deviatedChordCdBuff: true,
    techniqueBuff: false,
    e4MemoSpdBuff: true,
    e6Buffs: true,
  }

  const teammateDefaults = {
    feverState: true,
    vibes: 30,
    songbirdCount: 3,
    deviatedChordAtkBuff: true,
    deviatedChordCdBuff: false,
    teammateHPValue: 8000,
    techniqueBuff: false,
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
      text: t('feverState.text'),
      content: t('feverState.content', {
        DmgBoost: precisionRound(100 * memoTalentDmgBoost),
        DmgBoostPerVibe: precisionRound(100 * memoTalentDmgBoostPerVibe),
        ZoneDefPen: precisionRound(100 * talentZoneDefPen),
        ZoneDefPenPerVibe: precisionRound(100 * talentZoneDefPenPerVibe),
      }),
    },
    vibes: {
      id: 'vibes',
      formItem: 'slider',
      text: t('vibes.text'),
      content: t('vibes.content', { MaxVibes: maxVibes }),
      min: 0,
      max: maxVibes,
    },
    songbirdCount: {
      id: 'songbirdCount',
      formItem: 'slider',
      text: t('songbirdCount.text'),
      content: t('songbirdCount.content', {
        Vulnerability1: precisionRound(100 * memoTalentVulnerabilityByCount[1]),
        Vulnerability2: precisionRound(100 * memoTalentVulnerabilityByCount[2]),
        Vulnerability3: precisionRound(100 * memoTalentVulnerabilityByCount[3]),
      }),
      // 0 is reachable: the Songbirds disappear when Vibes hit 0, and none are on the
      // field before the Skill summons Bessie. memoTalentVulnerabilityByCount has no 0 key,
      // so the `?? 0` at the buff site yields no vulnerability.
      min: 0,
      max: 3,
    },
    deviatedChordCdBuff: {
      id: 'deviatedChordCdBuff',
      formItem: 'switch',
      text: t('deviatedChordCdBuff.text'),
      content: t('deviatedChordCdBuff.content', {
        CdBuff: precisionRound(100 * traceCdBuff),
        CdBuffPerVibe: precisionRound(100 * traceCdBuffPerVibe),
      }),
    },
    techniqueBuff: {
      id: 'techniqueBuff',
      formItem: 'switch',
      text: t('techniqueBuff.text'),
      content: t('techniqueBuff.content', { TechniqueDmgBoost: precisionRound(100 * techniqueDmgBoost) }),
    },
    e4MemoSpdBuff: {
      id: 'e4MemoSpdBuff',
      formItem: 'switch',
      text: t('e4MemoSpdBuff.text'),
      content: t('e4MemoSpdBuff.content', {
        SpdBuff: precisionRound(100 * e4MemoSpdBuff),
        SpdBuffPerVibe: precisionRound(100 * e4MemoSpdBuffPerVibe),
      }),
      disabled: e < 4,
    },
    e6Buffs: {
      id: 'e6Buffs',
      formItem: 'switch',
      text: t('e6Buffs.text'),
      content: t('e6Buffs.content', {
        ResPen: precisionRound(100 * e6ResPenValue),
        CdBuff: precisionRound(100 * e6CdBuffValue),
      }),
      disabled: e < 6,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    feverState: content.feverState,
    vibes: content.vibes,
    songbirdCount: content.songbirdCount,
    // Deviated Chord branches on whether the ally's ATK exceeds Robin's. The two
    // branches are mutually exclusive in game - enable the one matching the ally.
    deviatedChordAtkBuff: {
      id: 'deviatedChordAtkBuff',
      formItem: 'switch',
      text: t('deviatedChordAtkBuff.text'),
      content: t('deviatedChordAtkBuff.content', {
        AtkBuff: precisionRound(100 * traceAtkBuffHpScaling),
        AtkBuffPerVibe: precisionRound(100 * traceAtkBuffHpScalingPerVibe),
      }),
    },
    deviatedChordCdBuff: content.deviatedChordCdBuff,
    teammateHPValue: {
      id: 'teammateHPValue',
      formItem: 'slider',
      text: t('teammateHPValue.text'),
      content: t('teammateHPValue.content'),
      min: 0,
      max: 10000,
    },
    techniqueBuff: content.techniqueBuff,
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
          memoBaseHpScaling,
          memoBaseHpFlat: 0,
          memoBaseSpdScaling,
          memoBaseSpdFlat: 0,
        },
      }
    },

    actionDefinition: (action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // E6: "The Memosprite Skill's DMG multiplier increases by 100% of the original multiplier"
      const memoSkillTotalScaling = memoSkillScaling * ((e >= 6 && r.e6Buffs) ? e6MemoSkillMultiplier : 1)

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
          // AoE "to all enemies" - no enemyCount division
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

      // Bonus Ability 3: CRIT Rate for Robin and the Summer Songbirds
      x.buff(StatKey.CR, traceCrBuff, x.targets(TargetTag.SelfAndMemosprite).source(SOURCE_TRACE))

      // Memo Talent: Fever DMG boost for Robin and the Summer Songbirds
      x.buff(
        StatKey.BOOST,
        (r.feverState) ? memoTalentDmgBoost + r.vibes * memoTalentDmgBoostPerVibe : 0,
        x.targets(TargetTag.SelfAndMemosprite).source(SOURCE_MEMO),
      )

      // Bonus Ability 1: Robin's own attacks trigger Vibes gain, and her ATK can never exceed
      // her own, so she always takes the CRIT DMG branch.
      x.buff(
        StatKey.CD,
        (r.deviatedChordCdBuff) ? traceCdBuff + r.vibes * traceCdBuffPerVibe : 0,
        x.targets(TargetTag.SelfAndMemosprite).source(SOURCE_TRACE),
      )

      // E4: Summer Songbirds SPD on entering Fever
      x.buff(
        StatKey.SPD_P,
        (e >= 4 && r.e4MemoSpdBuff && r.feverState) ? e4MemoSpdBuff + r.vibes * e4MemoSpdBuffPerVibe : 0,
        x.target(RobinSummerettoEntities.SummerSongbirds).source(SOURCE_E4),
      )

      // E6: CRIT DMG for Robin and the Summer Songbirds on entering Fever
      x.buff(
        StatKey.CD,
        (e >= 6 && r.e6Buffs && r.feverState) ? e6CdBuffValue : 0,
        x.targets(TargetTag.SelfAndMemosprite).source(SOURCE_E6),
      )
    },

    precomputeMutualEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      // Talent: Zone DEF ignore for all ally targets inside the Zone
      x.buff(
        StatKey.DEF_PEN,
        (m.feverState) ? talentZoneDefPen + m.vibes * talentZoneDefPenPerVibe : 0,
        x.targets(TargetTag.FullTeam).source(SOURCE_TALENT),
      )

      // Memo Talent: enemies take more DMG based on the number of Songbirds on the field
      x.buff(
        StatKey.VULNERABILITY,
        memoTalentVulnerabilityByCount[m.songbirdCount] ?? 0,
        x.targets(TargetTag.FullTeam).source(SOURCE_MEMO),
      )

      // Technique: all allies gain a DMG boost for 2 turns at battle start
      x.buff(
        StatKey.BOOST,
        (m.techniqueBuff) ? techniqueDmgBoost : 0,
        x.targets(TargetTag.FullTeam).source(SOURCE_TECHNIQUE),
      )

      // E6: ally targets gain All-Type RES PEN (no element scope)
      x.buff(
        StatKey.RES_PEN,
        (e >= 6 && m.e6Buffs) ? e6ResPenValue : 0,
        x.targets(TargetTag.FullTeam).source(SOURCE_E6),
      )
    },

    precomputeTeammateEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const t = action.characterConditionals as Conditionals<typeof teammateContent>

      // Bonus Ability 1 (ATK branch): ally ATK is higher than Robin's, so they gain flat ATK
      // equal to a percentage of Robin's Max HP.
      const atkBuff = (t.deviatedChordAtkBuff)
        ? (traceAtkBuffHpScaling + t.vibes * traceAtkBuffHpScalingPerVibe) * t.teammateHPValue
        : 0
      x.buff(StatKey.ATK, atkBuff, x.targets(TargetTag.FullTeam).source(SOURCE_TRACE))
      x.buff(StatKey.UNCONVERTIBLE_ATK_BUFF, atkBuff, x.targets(TargetTag.FullTeam).source(SOURCE_TRACE))

      // Bonus Ability 1 (CRIT DMG branch): ally ATK is not higher than Robin's
      const cdBuff = (t.deviatedChordCdBuff) ? traceCdBuff + t.vibes * traceCdBuffPerVibe : 0
      x.buff(StatKey.CD, cdBuff, x.targets(TargetTag.FullTeam).source(SOURCE_TRACE))
      x.buff(StatKey.UNCONVERTIBLE_CD_BUFF, cdBuff, x.targets(TargetTag.FullTeam).source(SOURCE_TRACE))
    },

    finalizeCalculations: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {},
    newGpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => '',

    // No dynamic conditionals: the memosprite's HP/SPD derive from Robin via memoBase*Scaling
    // entity fields, and Deviated Chord's HP-scaled ATK buff only ever applies to teammates,
    // where Robin's own Max HP is supplied by the teammateHPValue slider.
    dynamicConditionals: [],
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
    WHOLE_BASIC,
    DEFAULT_MEMO_SKILL,
    DEFAULT_MEMO_SKILL,
    WHOLE_BASIC,
    DEFAULT_MEMO_SKILL,
    DEFAULT_MEMO_SKILL,
    // TODO(HUMAN): verify rotation length vs ult cost
  ],
  errRopeEidolon: 0,
  relicSets: [
    [Sets.WorldRemakingDeliverer, Sets.WorldRemakingDeliverer],
    [Sets.SacerdosRelivedOrdeal, Sets.SacerdosRelivedOrdeal],
    [Sets.MessengerTraversingHackerspace, Sets.MessengerTraversingHackerspace],
    ...SPREAD_RELICS_4P_GENERAL_CONDITIONALS,
  ],
  ornamentSets: [
    Sets.AmphoreusTheEternalLand,
    Sets.SprightlyVonwacq,
    Sets.LushakaTheSunkenSeas,
    ...SPREAD_ORNAMENTS_2P_SUPPORT,
  ],
  // TODO(HUMAN): verify deprioritizeBuffs flag - she is a support but the memosprite carries real damage
  teammates: [
    {
      characterId: Sunday.id,
      lightCone: AGroundedAscent.id,
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
      characterId: PermansorTerrae.id,
      lightCone: ThoughWorldsApart.id,
      characterEidolon: 0,
      lightConeSuperimposition: 1,
    },
    // TODO(HUMAN): pick 3 canonical teammates
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
    PresetEffects.fnSacerdosSet(2),
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
    x: 0,
    y: 0,
    z: 1,
  }, // TODO(HUMAN): set imageCenter/showcaseColor post-generation
  showcaseColor: '#888888', // TODO(HUMAN): set imageCenter/showcaseColor post-generation
}

export const RobinSummeretto: CharacterConfig = {
  id: '1512',
  // TODO(HUMAN): swap to RiseAndSing (23063) once that lightcone conditional exists
  defaultLightCone: ToEvernightsStars.id,
  display,
  conditionals,
  get scoring() {
    return scoring()
  },
}

import { KafkaB1 } from 'lib/conditionals/character/1000/KafkaB1'
import { BlackSwanB1 } from 'lib/conditionals/character/1300/BlackSwanB1'
import {
  cyreneActionExists,
  cyreneSpecialEffectEidolonUpgraded,
} from 'lib/conditionals/character/1400/Cyrene'
import { PermansorTerrae } from 'lib/conditionals/character/1400/PermansorTerrae'
import {
  AbilityEidolon,
  type Conditionals,
  type ContentDefinition,
  createEnum,
} from 'lib/conditionals/conditionalUtils'
import { HitDefinitionBuilder } from 'lib/conditionals/hitDefinitionBuilder'
import { PatienceIsAllYouNeed } from 'lib/conditionals/lightcone/5star/PatienceIsAllYouNeed'
import { ReforgedRemembrance } from 'lib/conditionals/lightcone/5star/ReforgedRemembrance'
import { ThoughWorldsApart } from 'lib/conditionals/lightcone/5star/ThoughWorldsApart'
import {
  Parts,
  Sets,
  Stats,
} from 'lib/constants/constants'
import { containerActionVal } from 'lib/gpu/injection/injectUtils'
import { wgslTrue } from 'lib/gpu/injection/wgslUtils'
import { Source } from 'lib/optimization/buffSource'
import {
  AKey,
  StatKey,
} from 'lib/optimization/engine/config/keys'
import {
  DamageTag,
  ElementTag,
  SELF_ENTITY_INDEX,
  TargetTag,
} from 'lib/optimization/engine/config/tag'
import { type ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { buff } from 'lib/optimization/engine/container/gpuBuffBuilder'
import {
  AbilityKind,
  DEFAULT_DOT,
  END_SKILL,
  NULL_TURN_ABILITY_NAME,
  START_ULT,
  WHOLE_BASIC,
  WHOLE_SKILL,
} from 'lib/optimization/rotation/turnAbilityConfig'
import { SortOption } from 'lib/optimization/sortOptions'
import { PresetEffects } from 'lib/scoring/presetEffects'
import { SPREAD_RELICS_4P_GENERAL_CONDITIONALS } from 'lib/scoring/scoringConstants'
import { wrappedFixedT } from 'lib/utils/i18nUtils'
import { floorSafe } from 'lib/utils/mathUtils'
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

export const HysilensAbilities: AbilityKind[] = [
  AbilityKind.BASIC,
  AbilityKind.SKILL,
  AbilityKind.ULT,
  AbilityKind.DOT,
  AbilityKind.BREAK,
]

export const HysilensEntities = createEnum('Hysilens')

const conditionals = (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Hysilens')
  const tDot = wrappedFixedT(withContent).get(null, 'conditionals', 'Common.DotTickCoefficient')
  const { basic, skill, ult, talent } = AbilityEidolon.ULT_BASIC_3_SKILL_TALENT_5
  const {
    SOURCE_BASIC,
    SOURCE_SKILL,
    SOURCE_TALENT,
    SOURCE_TRACE,
    SOURCE_ULT,
    SOURCE_MEMO,
    SOURCE_E1,
    SOURCE_E2,
    SOURCE_E4,
    SOURCE_E6,
  } = Source.character(Hysilens.id)

  const basicScaling = basic(e, 1.00, 1.10)

  const skillScaling = skill(e, 1.40, 1.54)
  const skillVulnScaling = skill(e, 0.20, 0.22)

  const ultScaling = ult(e, 2.00, 2.16)
  const ultDefPenScaling = ult(e, 0.25, 0.27)
  const ultDotScaling = ult(e, 0.80, 0.88)

  const talentDotScaling = talent(e, 0.25, 0.275)
  const talentDotAtkLimitScaling = talent(e, 0.25, 0.275)

  const maxUltDotInstances = e >= 6 ? 12 : 8

  const defaults = {
    dotTickCoefficient: 1.25,
    skillVulnerability: true,
    ultZone: true,
    ultDotStacks: maxUltDotInstances,
    ehrToDmg: true,
    dotDetonation: false,
    cyreneSpecialEffect: true,
    e1Buffs: true,
    e4ResPen: true,
    e6Buffs: true,
  }

  const teammateDefaults = {
    skillVulnerability: true,
    ultZone: true,
    e1Buffs: true,
    e2TeammateEhr: 1.20,
    e4ResPen: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    skillVulnerability: {
      id: 'skillVulnerability',
      formItem: 'switch',
      text: t('Content.skillVulnerability.text'),
      content: t('Content.skillVulnerability.content', { SkillVuln: precisionRound(100 * skillVulnScaling) }),
    },
    ultZone: {
      id: 'ultZone',
      formItem: 'switch',
      text: t('Content.ultZone.text'),
      content: t('Content.ultZone.content', { ZoneDefShred: precisionRound(100 * ultDefPenScaling) }),
    },
    ultDotStacks: {
      id: 'ultDotStacks',
      formItem: 'slider',
      text: t('Content.ultDotStacks.text'),
      content: t('Content.ultDotStacks.content', {}),
      min: 0,
      max: maxUltDotInstances,
    },
    ehrToDmg: {
      id: 'ehrToDmg',
      formItem: 'switch',
      text: t('Content.ehrToDmg.text'),
      content: t('Content.ehrToDmg.content', {}),
    },
    dotDetonation: {
      id: 'dotDetonation',
      formItem: 'switch',
      text: t('Content.dotDetonation.text'),
      content: t('Content.dotDetonation.content', {}),
      disabled: true,
    },
    cyreneSpecialEffect: {
      id: 'cyreneSpecialEffect',
      formItem: 'switch',
      text: t('Content.cyreneSpecialEffect.text'),
      content: t('Content.cyreneSpecialEffect.content'),
    },
    dotTickCoefficient: {
      id: 'dotTickCoefficient',
      formItem: 'slider',
      text: tDot('Text'),
      content: tDot('Content'),
      min: 0,
      max: 5,
      percent: true,
    },
    e1Buffs: {
      id: 'e1Buffs',
      formItem: 'switch',
      text: t('Content.e1Buffs.text'),
      content: t('Content.e1Buffs.content', {}),
      disabled: e < 1,
    },
    e4ResPen: {
      id: 'e4ResPen',
      formItem: 'switch',
      text: t('Content.e4ResPen.text'),
      content: t('Content.e4ResPen.content', {}),
      disabled: e < 4,
    },
    e6Buffs: {
      id: 'e6Buffs',
      formItem: 'switch',
      text: t('Content.e6Buffs.text'),
      content: t('Content.e6Buffs.content', {}),
      disabled: e < 6,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    skillVulnerability: content.skillVulnerability,
    ultZone: content.ultZone,
    e1Buffs: content.e1Buffs,
    e2TeammateEhr: {
      id: 'e2TeammateEhr',
      formItem: 'slider',
      text: t('TeammateContent.e2TeammateEhr.text'),
      content: t('TeammateContent.e2TeammateEhr.content'),
      disabled: e < 2,
      min: 0,
      max: 1.20,
      percent: true,
    },
    e4ResPen: content.e4ResPen,
  }

  return {
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,

    entityDeclaration: () => Object.values(HysilensEntities),
    actionDeclaration: () => [...HysilensAbilities],
    entityDefinition: (action: OptimizerAction, context: OptimizerContext) => {
      return {
        [HysilensEntities.Hysilens]: {
          primary: true,
          summon: false,
          memosprite: false,
        },
      }
    },
    actionDefinition: (action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      const talentDot = talentDotScaling
      const updatedUltDotScaling = (e >= 6 && r.e6Buffs) ? ultDotScaling + 0.20 : ultDotScaling
      const ultDot = r.ultDotStacks * updatedUltDotScaling

      let actualUltDot = 0
      let actualTalentDot = 0
      if (r.dotDetonation) {
        // Triggers ult proc
        actualUltDot += ultDot
        // Detonates at 1.5x
        actualTalentDot = talentDot * 1.5
        // E1 doubles the talent and also detonates at 1.5x
        actualTalentDot += (e >= 1 && r.e1Buffs) ? talentDot * 1.5 : 0
      } else {
        actualUltDot += ultDot
        actualTalentDot += talentDot
        actualTalentDot += (e >= 1 && r.e1Buffs) ? talentDot : 0
      }

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
        [AbilityKind.SKILL]: {
          hits: [
            HitDefinitionBuilder.standardSkill()
              .damageElement(ElementTag.Physical)
              .atkScaling(skillScaling)
              .toughnessDmg(10)
              .build(),
          ],
        },
        [AbilityKind.ULT]: {
          hits: [
            HitDefinitionBuilder.standardUlt()
              .damageElement(ElementTag.Physical)
              .atkScaling(ultScaling)
              .toughnessDmg(20)
              .build(),
          ],
        },
        [AbilityKind.DOT]: {
          hits: [
            HitDefinitionBuilder.standardDot()
              .dotBaseChance(1.0)
              .damageElement(ElementTag.Fire)
              .atkScaling(actualTalentDot)
              .dotTickCoefficient(r.dotTickCoefficient)
              .build(),
            HitDefinitionBuilder.standardDot()
              .dotBaseChance(1.0)
              .damageElement(ElementTag.Wind)
              .atkScaling(actualTalentDot)
              .dotTickCoefficient(r.dotTickCoefficient)
              .build(),
            HitDefinitionBuilder.standardDot()
              .dotBaseChance(1.0)
              .damageElement(ElementTag.Lightning)
              .atkScaling(actualTalentDot)
              .dotTickCoefficient(r.dotTickCoefficient)
              .build(),
            HitDefinitionBuilder.standardDot()
              .dotBaseChance(1.0)
              .damageElement(ElementTag.Physical)
              .atkScaling(actualTalentDot)
              .dotTickCoefficient(r.dotTickCoefficient)
              .build(),
            HitDefinitionBuilder.standardDot()
              .dotBaseChance(1.0)
              .damageElement(ElementTag.Physical)
              .atkScaling(actualUltDot)
              .dotTickCoefficient(r.dotTickCoefficient)
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
    actionModifiers() {
      return []
    },
    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // Cyrene
      const cyreneDmgBuff = cyreneActionExists(action)
        ? (cyreneSpecialEffectEidolonUpgraded(action) ? 1.32 : 1.20)
        : 0
      x.buff(StatKey.DMG_BOOST, (r.cyreneSpecialEffect) ? cyreneDmgBuff : 0, x.source(Source.odeTo(Hysilens.id)))
    },
    precomputeTeammateEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const t = action.characterConditionals as Conditionals<typeof teammateContent>

      x.buff(
        StatKey.DMG_BOOST,
        (e >= 2)
          ? Math.max(0, Math.min(0.90, 0.15 * Math.floor(precisionRound((t.e2TeammateEhr - 0.60) / 0.10))))
          : 0,
        x.targets(TargetTag.FullTeam).source(SOURCE_E2),
      )
    },
    precomputeMutualEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof content>

      x.multiplicativeBoost(
        StatKey.FINAL_DMG_BOOST,
        (e >= 1 && m.e1Buffs) ? 0.16 : 0,
        x.targets(TargetTag.FullTeam).damageType(DamageTag.DOT).source(SOURCE_E1),
      )
      x.buff(StatKey.VULNERABILITY, (m.skillVulnerability) ? skillVulnScaling : 0, x.targets(TargetTag.FullTeam).source(SOURCE_SKILL))
      x.buff(StatKey.DEF_PEN, (m.ultZone) ? ultDefPenScaling : 0, x.targets(TargetTag.FullTeam).source(SOURCE_ULT))
      x.buff(StatKey.RES_PEN, (e >= 4 && m.e4ResPen) ? 0.20 : 0, x.targets(TargetTag.FullTeam).source(SOURCE_E4))
    },
    finalizeCalculations: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      const ehrValue = x.getActionValue(StatKey.EHR, HysilensEntities.Hysilens)
      const ehrBoost = (r.ehrToDmg) ? Math.max(0, Math.min(0.90, 0.15 * floorSafe((ehrValue - 0.60) / 0.10))) : 0

      x.buff(StatKey.DMG_BOOST, ehrBoost, x.source(SOURCE_TRACE))
    },
    newGpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      return `
if (${wgslTrue(r.ehrToDmg)}) {
  let dmgBuff = min(0.90, 0.15 * floorSafe((${containerActionVal(SELF_ENTITY_INDEX, StatKey.EHR, action.config)} - 0.60) / 0.10));
  ${buff.action(AKey.DMG_BOOST, 'dmgBuff').wgsl(action)}
}
`
    },
  }
}

const simulation = (): SimulationMetadata => ({
  parts: {
    [Parts.Body]: [
      Stats.EHR,
      Stats.ATK_P,
    ],
    [Parts.Feet]: [
      Stats.ATK_P,
      Stats.SPD,
    ],
    [Parts.PlanarSphere]: [
      Stats.ATK_P,
      Stats.Physical_DMG,
    ],
    [Parts.LinkRope]: [
      Stats.ATK_P,
    ],
  },
  substats: [
    Stats.ATK_P,
    Stats.EHR,
    Stats.ATK,
    Stats.CR,
    Stats.CD,
  ],
  breakpoints: {
    [Stats.EHR]: 1.20,
  },
  comboTurnAbilities: [
    NULL_TURN_ABILITY_NAME,
    START_ULT,
    DEFAULT_DOT,
    END_SKILL,
    DEFAULT_DOT,
    WHOLE_SKILL,
    DEFAULT_DOT,
    WHOLE_BASIC,
    DEFAULT_DOT,
  ],
  errRopeEidolon: 0,
  relicSets: [
    [Sets.PrisonerInDeepConfinement, Sets.PrisonerInDeepConfinement],
    ...SPREAD_RELICS_4P_GENERAL_CONDITIONALS,
  ],
  ornamentSets: [
    Sets.RevelryByTheSea,
    Sets.PanCosmicCommercialEnterprise,
  ],
  teammates: [
    {
      characterId: KafkaB1.id,
      lightCone: PatienceIsAllYouNeed.id,
      characterEidolon: 0,
      lightConeSuperimposition: 1,
    },
    {
      characterId: BlackSwanB1.id,
      lightCone: ReforgedRemembrance.id,
      characterEidolon: 0,
      lightConeSuperimposition: 1,
    },
    {
      characterId: PermansorTerrae.id,
      lightCone: ThoughWorldsApart.id,
      characterEidolon: 0,
      lightConeSuperimposition: 1,
    },
  ],
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
    [Stats.CR]: 0,
    [Stats.CD]: 0,
    [Stats.EHR]: 1,
    [Stats.RES]: 0,
    [Stats.BE]: 0,
  },
  parts: {
    [Parts.Body]: [
      Stats.ATK_P,
      Stats.EHR,
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
  presets: [
    PresetEffects.PRISONER_SET,
    PresetEffects.fnPioneerSet(4),
  ],
  sortOption: SortOption.DOT,
  hiddenColumns: [SortOption.FUA],
  simulation: simulation(),
})

const display = {
  imageCenter: {
    x: 794,
    y: 878,
    z: 1.2,
  },
  showcaseColor: '#a08bf4',
}

export const Hysilens: CharacterConfig = {
  id: '1410',
  display,
  conditionals,
  get scoring() {
    return scoring()
  },
}

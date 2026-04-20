import { KafkaB1 } from 'lib/conditionals/character/1000/KafkaB1'
import { Hysilens } from 'lib/conditionals/character/1400/Hysilens'
import { PermansorTerrae } from 'lib/conditionals/character/1400/PermansorTerrae'
import {
  AbilityEidolon,
  type Conditionals,
  type ContentDefinition,
  createEnum,
} from 'lib/conditionals/conditionalUtils'
import { HitDefinitionBuilder } from 'lib/conditionals/hitDefinitionBuilder'
import { PatienceIsAllYouNeed } from 'lib/conditionals/lightcone/5star/PatienceIsAllYouNeed'
import { ThoughWorldsApart } from 'lib/conditionals/lightcone/5star/ThoughWorldsApart'
import { WhyDoesTheOceanSing } from 'lib/conditionals/lightcone/5star/WhyDoesTheOceanSing'
import {
  Parts,
  Sets,
  Stats,
} from 'lib/constants/constants'
import { containerActionVal } from 'lib/gpu/injection/injectUtils'
import {
  wgsl,
  wgslTrue,
} from 'lib/gpu/injection/wgslUtils'
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
import {
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

export const BlackSwanB1Entities = createEnum('BlackSwanB1')
export const BlackSwanB1Abilities: AbilityKind[] = [
  AbilityKind.BASIC,
  AbilityKind.SKILL,
  AbilityKind.ULT,
  AbilityKind.DOT,
  AbilityKind.BREAK,
]

const conditionals = (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.BlackSwanB1')
  const tDot = wrappedFixedT(withContent).get(null, 'conditionals', 'Common.DotTickCoefficient')
  const { basic, skill, ult, talent } = AbilityEidolon.SKILL_TALENT_3_ULT_BASIC_5
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
  } = Source.character(BlackSwanB1.id)

  const arcanaStackMultiplier = talent(e, 0.12, 0.132)
  const epiphanyDmgTakenBoost = ult(e, 0.25, 0.27)
  const skillDefShredValue = skill(e, 0.208, 0.22)

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 0.90, 0.99)
  const ultScaling = ult(e, 1.20, 1.296)
  const dotScaling = talent(e, 2.40, 2.64)

  const dotChance = talent(e, 0.65, 0.68)

  const arcanaStackLimit = e >= 6 ? 80 : 50

  const defaults = {
    dotTickCoefficient: 2,
    skillDefShred: true,
    epiphanyDebuff: true,
    arcanaStacks: arcanaStackLimit,
    ehrToDmgBoost: true,
    e1ResReduction: true,
    e4Vulnerability: true,
  }
  const teammateDefaults = {
    skillDefShred: true,
    epiphanyDebuff: true,
    ehrToDmgBoost: true,
    combatEhr: 1.20,
    e1ResReduction: true,
    e4Vulnerability: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    skillDefShred: {
      id: 'skillDefShred',
      formItem: 'switch',
      text: t('Content.skillDefShred.text'),
      content: t('Content.skillDefShred.content', { skillDefShredScaling: precisionRound(100 * skillDefShredValue) }),
    },
    epiphanyDebuff: {
      id: 'epiphanyDebuff',
      formItem: 'switch',
      text: t('Content.epiphanyDebuff.text'),
      content: t('Content.epiphanyDebuff.content', { epiphanyVulnerability: precisionRound(100 * epiphanyDmgTakenBoost) }),
    },
    arcanaStacks: {
      id: 'arcanaStacks',
      formItem: 'slider',
      text: t('Content.arcanaStacks.text'),
      content: t('Content.arcanaStacks.content', {
        dotBaseScaling: precisionRound(100 * dotScaling),
        arcanaAdditionalScaling: precisionRound(100 * arcanaStackMultiplier),
        arcanaStackLimit,
      }),
      min: 1,
      max: 100,
    },
    ehrToDmgBoost: {
      id: 'ehrToDmgBoost',
      formItem: 'switch',
      text: t('Content.ehrToDmgBoost.text'),
      content: t('Content.ehrToDmgBoost.content', {}),
    },
    dotTickCoefficient: {
      id: 'dotTickCoefficient',
      formItem: 'slider',
      text: tDot('Text'),
      content: tDot('Content'),
      min: 0,
      max: 10,
      percent: true,
    },
    e1ResReduction: {
      id: 'e1ResReduction',
      formItem: 'switch',
      text: t('Content.e1ResReduction.text'),
      content: t('Content.e1ResReduction.content', {}),
      disabled: e < 1,
    },
    e4Vulnerability: {
      id: 'e4Vulnerability',
      formItem: 'switch',
      text: t('Content.e4Vulnerability.text'),
      content: t('Content.e4Vulnerability.content', {}),
      disabled: e < 4,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    skillDefShred: content.skillDefShred,
    epiphanyDebuff: content.epiphanyDebuff,
    ehrToDmgBoost: content.ehrToDmgBoost,
    combatEhr: {
      id: 'combatEhr',
      formItem: 'slider',
      text: t('TeammateContent.combatEhr.text'),
      content: t('TeammateContent.combatEhr.content'),
      min: 0,
      max: 1.20,
      percent: true,
    },
    e1ResReduction: content.e1ResReduction,
    e4Vulnerability: content.e4Vulnerability,
  }

  return {
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,

    entityDeclaration: () => Object.values(BlackSwanB1Entities),
    entityDefinition: (action: OptimizerAction, context: OptimizerContext) => ({
      [BlackSwanB1Entities.BlackSwanB1]: {
        primary: true,
        summon: false,
        memosprite: false,
      },
    }),

    actionDeclaration: () => [...BlackSwanB1Abilities],
    actionDefinition: (action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      return {
        [AbilityKind.BASIC]: {
          hits: [
            HitDefinitionBuilder.standardBasic()
              .damageElement(ElementTag.Wind)
              .atkScaling(basicScaling)
              .toughnessDmg(10)
              .build(),
          ],
        },
        [AbilityKind.SKILL]: {
          hits: [
            HitDefinitionBuilder.standardSkill()
              .damageElement(ElementTag.Wind)
              .atkScaling(skillScaling)
              .toughnessDmg(20)
              .build(),
          ],
        },
        [AbilityKind.ULT]: {
          hits: [
            HitDefinitionBuilder.standardUlt()
              .damageElement(ElementTag.Wind)
              .atkScaling(ultScaling)
              .toughnessDmg(20)
              .build(),
          ],
        },
        [AbilityKind.DOT]: {
          hits: [
            HitDefinitionBuilder.standardDot()
              .dotBaseChance(dotChance)
              .dotSplit(0.05)
              .dotStacks(r.arcanaStacks)
              .damageElement(ElementTag.Wind)
              .damageType(DamageTag.DOT)
              .atkScaling(dotScaling + arcanaStackMultiplier * r.arcanaStacks)
              .dotTickCoefficient(r.dotTickCoefficient)
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
    actionModifiers: () => [],

    initializeConfigurationsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {},
    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      // B1: DOT DEF_PEN is unconditional (not gated on arcana >= 7 like migrated BlackSwan)
      x.buff(StatKey.DEF_PEN, 0.20, x.damageType(DamageTag.DOT).source(SOURCE_TALENT))
    },
    precomputeMutualEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      x.buff(StatKey.DEF_PEN, (m.skillDefShred) ? skillDefShredValue : 0, x.targets(TargetTag.FullTeam).source(SOURCE_SKILL))
      x.buff(
        StatKey.RES_PEN,
        (e >= 1 && m.e1ResReduction) ? 0.25 : 0,
        x.elements(ElementTag.Wind | ElementTag.Fire | ElementTag.Physical | ElementTag.Lightning).targets(TargetTag.FullTeam).source(SOURCE_E1),
      )

      // B1: Generic vulnerability (not DOT-filtered like migrated BlackSwan)
      x.buff(StatKey.VULNERABILITY, (m.epiphanyDebuff) ? epiphanyDmgTakenBoost : 0, x.targets(TargetTag.FullTeam).source(SOURCE_ULT))

      x.buff(StatKey.VULNERABILITY, (e >= 4 && m.epiphanyDebuff && m.e4Vulnerability) ? 0.20 : 0, x.targets(TargetTag.FullTeam).source(SOURCE_E4))
    },
    precomputeTeammateEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const t = action.characterConditionals as Conditionals<typeof teammateContent>

      x.buff(StatKey.DMG_BOOST, t.ehrToDmgBoost ? Math.min(0.72, 0.60 * t.combatEhr) : 0, x.targets(TargetTag.FullTeam).source(SOURCE_TRACE))
    },

    finalizeCalculations: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      const ehrValue = x.getActionValueByIndex(StatKey.EHR, SELF_ENTITY_INDEX)
      x.buff(StatKey.DMG_BOOST, (r.ehrToDmgBoost) ? Math.min(0.72, 0.60 * ehrValue) : 0, x.source(SOURCE_TRACE))
    },
    newGpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      return wgsl`
if (${wgslTrue(r.ehrToDmgBoost)}) {
  let dmgBuff = min(0.72, 0.60 * ${containerActionVal(SELF_ENTITY_INDEX, StatKey.EHR, action.config)});
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
      Stats.Wind_DMG,
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
    END_SKILL,
    DEFAULT_DOT,
    WHOLE_BASIC,
    DEFAULT_DOT,
    WHOLE_SKILL,
    DEFAULT_DOT,
    WHOLE_BASIC,
    DEFAULT_DOT,
  ],
  relicSets: [
    [Sets.PrisonerInDeepConfinement, Sets.PrisonerInDeepConfinement],
    ...SPREAD_RELICS_4P_GENERAL_CONDITIONALS,
  ],
  ornamentSets: [
    Sets.RevelryByTheSea,
    Sets.FirmamentFrontlineGlamoth,
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
      characterId: Hysilens.id,
      lightCone: WhyDoesTheOceanSing.id,
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
      Stats.Wind_DMG,
      Stats.ATK_P,
    ],
    [Parts.LinkRope]: [
      Stats.ATK_P,
    ],
  },
  presets: [
    PresetEffects.PRISONER_SET,
  ],
  sortOption: SortOption.DOT,
  hiddenColumns: [
    SortOption.FUA,
  ],
  simulation: simulation(),
})

const display = {
  imageCenter: {
    x: 964,
    y: 934,
    z: 1.3,
  },
  showcaseColor: '#b2a2de',
}

export const BlackSwanB1: CharacterConfig = {
  id: '1307b1',
  display,
  conditionals,
  get scoring() {
    return scoring()
  },
}

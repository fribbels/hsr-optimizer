import {
  AbilityEidolon,
  addSuperBreakHits,
  type Conditionals,
  type ContentDefinition,
  createEnum,
} from 'lib/conditionals/conditionalUtils'
import { HitDefinitionBuilder } from 'lib/conditionals/hitDefinitionBuilder'
import {
  Parts,
  Stats,
} from 'lib/constants/constants'
import { Source } from 'lib/optimization/buffSource'
import { type ModifierContext } from 'lib/optimization/context/calculateActions'
import { StatKey } from 'lib/optimization/engine/config/keys'
import {
  ElementTag,
  TargetTag,
} from 'lib/optimization/engine/config/tag'
import { type ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { SortOption } from 'lib/optimization/sortOptions'
import { wrappedFixedT } from 'lib/utils/i18nUtils'
import { type CharacterConfig } from 'types/characterConfig'
import { type ScoringMetadata } from 'types/metadata'

import { type Eidolon } from 'types/character'

import { AbilityKind } from 'lib/optimization/rotation/turnAbilityConfig'
import { type CharacterConditionalsController } from 'types/conditionals'
import {
  type OptimizerAction,
  type OptimizerContext,
} from 'types/optimizer'
import { precisionRound } from 'lib/utils/mathUtils'

export const TrailblazerHarmonyEntities = createEnum('TrailblazerHarmony')
export const TrailblazerHarmonyAbilities: AbilityKind[] = [
  AbilityKind.BASIC,
  AbilityKind.SKILL,
  AbilityKind.BREAK,
]

const conditionals = (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.TrailblazerHarmony')
  const { basic, skill, ult } = AbilityEidolon.SKILL_TALENT_3_ULT_BASIC_5
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
  } = Source.character(TrailblazerHarmonyStelle.id)

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 0.50, 0.55)
  const ultBeScaling = ult(e, 0.30, 0.33)
  const skillMaxHits = e >= 6 ? 6 : 4

  const targetsToSuperBreakMulti: Record<number, number> = {
    1: 1.60,
    3: 1.40,
    5: 1.20,
  }

  const defaults = {
    skillHitsOnTarget: skillMaxHits,
    backupDancer: true,
    superBreakDmg: true,
    e2EnergyRegenBuff: false,
  }

  const teammateDefaults = {
    backupDancer: true,
    superBreakDmg: true,
    teammateBeValue: 2.00,
  }

  const content: ContentDefinition<typeof defaults> = {
    backupDancer: {
      id: 'backupDancer',
      formItem: 'switch',
      text: t('Content.backupDancer.text'),
      content: t('Content.backupDancer.content', { ultBeScaling: precisionRound(100 * ultBeScaling) }),
    },
    superBreakDmg: {
      id: 'superBreakDmg',
      formItem: 'switch',
      text: t('Content.superBreakDmg.text'),
      content: t('Content.superBreakDmg.content'),
    },
    skillHitsOnTarget: {
      id: 'skillHitsOnTarget',
      formItem: 'slider',
      text: t('Content.skillHitsOnTarget.text'),
      content: t('Content.skillHitsOnTarget.content'),
      min: 0,
      max: skillMaxHits,
    },
    e2EnergyRegenBuff: {
      id: 'e2EnergyRegenBuff',
      formItem: 'switch',
      text: t('Content.e2EnergyRegenBuff.text'),
      content: t('Content.e2EnergyRegenBuff.content'),
      disabled: e < 2,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    backupDancer: content.backupDancer,
    superBreakDmg: content.superBreakDmg,
    teammateBeValue: {
      id: 'teammateBeValue',
      formItem: 'slider',
      text: t('TeammateContent.teammateBeValue.text'),
      content: t('TeammateContent.teammateBeValue.content'),
      min: 0,
      max: 4.00,
      percent: true,
      disabled: e < 4,
    },
  }

  return {
    entityDeclaration: () => Object.values(TrailblazerHarmonyEntities),
    entityDefinition: (action: OptimizerAction, context: OptimizerContext) => ({
      [TrailblazerHarmonyEntities.TrailblazerHarmony]: {
        primary: true,
        summon: false,
        memosprite: false,
      },
    }),
    actionDeclaration: () => [...TrailblazerHarmonyAbilities],
    actionDefinition: (action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      return {
        [AbilityKind.BASIC]: {
          hits: [
            HitDefinitionBuilder.standardBasic()
              .damageElement(ElementTag.Imaginary)
              .atkScaling(basicScaling)
              .toughnessDmg(10)
              .build(),
          ],
        },
        [AbilityKind.SKILL]: {
          hits: [
            HitDefinitionBuilder.standardSkill()
              .damageElement(ElementTag.Imaginary)
              .atkScaling(skillScaling + r.skillHitsOnTarget * skillScaling)
              .toughnessDmg(10 * r.skillHitsOnTarget)
              .build(),
          ],
        },
        [AbilityKind.BREAK]: {
          hits: [
            HitDefinitionBuilder.standardBreak(ElementTag.Imaginary).build(),
          ],
        },
      }
    },
    actionModifiers() {
      return [
        {
          modify: (action: OptimizerAction, context: OptimizerContext, _self: ModifierContext) => {
            addSuperBreakHits(action.hits!)
          },
        },
      ]
    },
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    finalizeCalculations: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
    },
    newGpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => '',

    // New container methods
    initializeConfigurationsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>
      if (r.superBreakDmg) {
        action.config.enemyWeaknessBroken = true
      }
    },
    initializeTeammateConfigurationsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>
      if (r.superBreakDmg) {
        action.config.enemyWeaknessBroken = true
      }
    },
    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // Stats
      x.buff(StatKey.ERR, (e >= 2 && r.e2EnergyRegenBuff) ? 0.25 : 0, x.source(SOURCE_E2))
    },
    precomputeMutualEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      x.buff(StatKey.BE, (m.backupDancer) ? ultBeScaling : 0, x.targets(TargetTag.FullTeam).source(SOURCE_ULT))
      x.buff(
        StatKey.SUPER_BREAK_MODIFIER,
        (m.superBreakDmg)
          ? targetsToSuperBreakMulti[context.enemyCount]
          : 0,
        x.targets(TargetTag.FullTeam).source(SOURCE_ULT),
      )
    },
    precomputeTeammateEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const t = action.characterConditionals as Conditionals<typeof teammateContent>

      const beBuff = (e >= 4) ? 0.15 * t.teammateBeValue : 0
      x.buff(StatKey.BE, beBuff, x.targets(TargetTag.FullTeam).source(SOURCE_E4))
      x.buff(StatKey.UNCONVERTIBLE_BE_BUFF, beBuff, x.targets(TargetTag.FullTeam).source(SOURCE_E4))
    },
  }
}

const scoring = (): ScoringMetadata => ({
  stats: {
    [Stats.ATK]: 0,
    [Stats.ATK_P]: 0,
    [Stats.DEF]: 0.25,
    [Stats.DEF_P]: 0.25,
    [Stats.HP]: 0.25,
    [Stats.HP_P]: 0.25,
    [Stats.SPD]: 1,
    [Stats.CR]: 0,
    [Stats.CD]: 0,
    [Stats.EHR]: 0,
    [Stats.RES]: 0.25,
    [Stats.BE]: 1,
  },
  parts: {
    [Parts.Body]: [],
    [Parts.Feet]: [
      Stats.SPD,
    ],
    [Parts.PlanarSphere]: [],
    [Parts.LinkRope]: [
      Stats.BE,
      Stats.ERR,
    ],
  },
  presets: [],
  sortOption: SortOption.BE,
  hiddenColumns: [SortOption.ULT, SortOption.FUA, SortOption.DOT],
})

const display = {
  imageCenter: {
    x: 1040,
    y: 1000,
    z: 1.1,
  },
  disableSpine: true,
  showcaseColor: '#bc81e3',
}

export const TrailblazerHarmonyCaelus: CharacterConfig = {
  id: '8005',
  display,
  conditionals,
  get scoring() {
    return scoring()
  },
}

export const TrailblazerHarmonyStelle: CharacterConfig = {
  id: '8006',
  display,
  conditionals,
  get scoring() {
    return scoring()
  },
}

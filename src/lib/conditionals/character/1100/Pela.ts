import {
  AbilityEidolon,
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
import { StatKey } from 'lib/optimization/engine/config/keys'
import {
  DamageTag,
  ElementTag,
  TargetTag,
} from 'lib/optimization/engine/config/tag'
import { type ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { AbilityKind } from 'lib/optimization/rotation/turnAbilityConfig'
import { SortOption } from 'lib/optimization/sortOptions'
import { PresetEffects } from 'lib/scoring/presetEffects'
import { wrappedFixedT } from 'lib/utils/i18nUtils'

import { type Eidolon } from 'types/character'
import { type CharacterConfig } from 'types/characterConfig'

import { type CharacterConditionalsController } from 'types/conditionals'
import { type ScoringMetadata } from 'types/metadata'
import {
  type OptimizerAction,
  type OptimizerContext,
} from 'types/optimizer'
import { precisionRound } from 'lib/utils/mathUtils'

export const PelaEntities = createEnum('Pela')
export const PelaAbilities: AbilityKind[] = [
  AbilityKind.BASIC,
  AbilityKind.SKILL,
  AbilityKind.ULT,
  AbilityKind.BREAK,
]

const conditionals = (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Pela')
  const { basic, skill, ult } = AbilityEidolon.SKILL_BASIC_3_ULT_TALENT_5
  const {
    SOURCE_ULT,
    SOURCE_TRACE,
    SOURCE_E2,
    SOURCE_E4,
  } = Source.character(Pela.id)

  const ultDefPenValue = ult(e, 0.40, 0.42)

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 2.10, 2.31)
  const ultScaling = ult(e, 1.00, 1.08)

  // E6: Additional damage scaling
  const e6AdditionalDmgScaling = 0.40

  const defaults = {
    teamEhrBuff: true,
    enemyDebuffed: true,
    skillRemovedBuff: false,
    ultDefPenDebuff: true,
    e4SkillResShred: true,
  }

  const teammateDefaults = {
    teamEhrBuff: true,
    ultDefPenDebuff: true,
    e4SkillResShred: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    teamEhrBuff: {
      id: 'teamEhrBuff',
      formItem: 'switch',
      text: t('Content.teamEhrBuff.text'),
      content: t('Content.teamEhrBuff.content'),
    },
    enemyDebuffed: {
      id: 'enemyDebuffed',
      formItem: 'switch',
      text: t('Content.enemyDebuffed.text'),
      content: t('Content.enemyDebuffed.content'),
    },
    skillRemovedBuff: {
      id: 'skillRemovedBuff',
      formItem: 'switch',
      text: t('Content.skillRemovedBuff.text'),
      content: t('Content.skillRemovedBuff.content'),
    },
    ultDefPenDebuff: {
      id: 'ultDefPenDebuff',
      formItem: 'switch',
      text: t('Content.ultDefPenDebuff.text'),
      content: t('Content.ultDefPenDebuff.content', { ultDefPenValue: precisionRound(100 * ultDefPenValue) }),
    },
    e4SkillResShred: {
      id: 'e4SkillResShred',
      formItem: 'switch',
      text: t('Content.e4SkillResShred.text'),
      content: t('Content.e4SkillResShred.content'),
      disabled: e < 4,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    teamEhrBuff: content.teamEhrBuff,
    ultDefPenDebuff: content.ultDefPenDebuff,
    e4SkillResShred: content.e4SkillResShred,
  }

  return {
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,

    entityDeclaration: () => Object.values(PelaEntities),
    entityDefinition: (action: OptimizerAction, context: OptimizerContext) => ({
      [PelaEntities.Pela]: {
        primary: true,
        summon: false,
        memosprite: false,
      },
    }),

    actionDeclaration: () => [...PelaAbilities],
    actionDefinition: (action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      const e6Active = e >= 6 && r.enemyDebuffed

      return {
        [AbilityKind.BASIC]: {
          hits: [
            HitDefinitionBuilder.standardBasic()
              .damageElement(ElementTag.Ice)
              .atkScaling(basicScaling)
              .toughnessDmg(10)
              .build(),
            ...(e6Active
              ? [
                HitDefinitionBuilder.standardAdditional()
                  .damageElement(ElementTag.Ice)
                  .atkScaling(e6AdditionalDmgScaling)
                  .build(),
              ]
              : []),
          ],
        },
        [AbilityKind.SKILL]: {
          hits: [
            HitDefinitionBuilder.standardSkill()
              .damageElement(ElementTag.Ice)
              .atkScaling(skillScaling)
              .toughnessDmg(20)
              .build(),
            ...(e6Active
              ? [
                HitDefinitionBuilder.standardAdditional()
                  .damageElement(ElementTag.Ice)
                  .atkScaling(e6AdditionalDmgScaling)
                  .build(),
              ]
              : []),
          ],
        },
        [AbilityKind.ULT]: {
          hits: [
            HitDefinitionBuilder.standardUlt()
              .damageElement(ElementTag.Ice)
              .atkScaling(ultScaling)
              .toughnessDmg(20)
              .build(),
            ...(e6Active
              ? [
                HitDefinitionBuilder.standardAdditional()
                  .damageElement(ElementTag.Ice)
                  .atkScaling(e6AdditionalDmgScaling)
                  .build(),
              ]
              : []),
          ],
        },
        [AbilityKind.BREAK]: {
          hits: [
            HitDefinitionBuilder.standardBreak(ElementTag.Ice).build(),
          ],
        },
      }
    },
    actionModifiers: () => [],

    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      x.buff(StatKey.SPD_P, (e >= 2 && r.skillRemovedBuff) ? 0.10 : 0, x.source(SOURCE_E2))

      // DMG boost for Basic/Skill/Ult when buff removed
      x.buff(StatKey.DMG_BOOST, (r.skillRemovedBuff) ? 0.20 : 0, x.damageType(DamageTag.BASIC | DamageTag.SKILL | DamageTag.ULT).source(SOURCE_TRACE))

      // DMG boost when enemy debuffed
      x.buff(StatKey.DMG_BOOST, (r.enemyDebuffed) ? 0.20 : 0, x.source(SOURCE_TRACE))
    },

    precomputeMutualEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      x.buff(StatKey.EHR, (m.teamEhrBuff) ? 0.10 : 0, x.targets(TargetTag.FullTeam).source(SOURCE_TRACE))

      x.buff(StatKey.DEF_PEN, (m.ultDefPenDebuff) ? ultDefPenValue : 0, x.targets(TargetTag.FullTeam).source(SOURCE_ULT))
      x.buff(StatKey.RES_PEN, (e >= 4 && m.e4SkillResShred) ? 0.12 : 0, x.elements(ElementTag.Ice).targets(TargetTag.FullTeam).source(SOURCE_E4))
    },

    finalizeCalculations: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {},
    newGpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => '',
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
    [Stats.EHR]: 1,
    [Stats.RES]: 0.25,
    [Stats.BE]: 0,
  },
  parts: {
    [Parts.Body]: [
      Stats.EHR,
      Stats.HP_P,
      Stats.DEF_P,
    ],
    [Parts.Feet]: [
      Stats.SPD,
    ],
    [Parts.PlanarSphere]: [
      Stats.HP_P,
      Stats.DEF_P,
      Stats.Ice_DMG,
    ],
    [Parts.LinkRope]: [
      Stats.ERR,
    ],
  },
  presets: [
    PresetEffects.fnPioneerSet(4),
  ],
  sortOption: SortOption.SPD,
  hiddenColumns: [
    SortOption.FUA,
    SortOption.DOT,
  ],
})

const display = {
  imageCenter: {
    x: 780,
    y: 1100,
    z: 1,
  },
  disableSpine: true,
  showcaseColor: '#609efa',
}

export const Pela: CharacterConfig = {
  id: '1106',
  display,
  conditionals,
  get scoring() {
    return scoring()
  },
}

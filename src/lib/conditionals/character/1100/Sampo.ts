import { AbilityType } from 'lib/conditionals/conditionalConstants'
import {
  AbilityEidolon,
  Conditionals,
  ContentDefinition,
  createEnum,
} from 'lib/conditionals/conditionalUtils'
import { HitDefinitionBuilder } from 'lib/conditionals/hitDefinitionBuilder'
import { Source } from 'lib/optimization/buffSource'
import { StatKey } from 'lib/optimization/engine/config/keys'
import {
  DamageTag,
  ElementTag,
  TargetTag,
} from 'lib/optimization/engine/config/tag'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { TsUtils } from 'lib/utils/TsUtils'

import { Eidolon } from 'types/character'

import { CharacterConditionalsController } from 'types/conditionals'
import {
  OptimizerAction,
  OptimizerContext,
} from 'types/optimizer'

export const SampoEntities = createEnum('Sampo')
export const SampoAbilities = createEnum('BASIC', 'SKILL', 'ULT', 'DOT', 'BREAK')

export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Sampo')
  const { basic, skill, ult, talent } = AbilityEidolon.SKILL_BASIC_3_ULT_TALENT_5
  const {
    SOURCE_ULT,
    SOURCE_TRACE,
  } = Source.character('1108')

  const dotVulnerabilityValue = ult(e, 0.30, 0.32)

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 0.56, 0.616)
  const ultScaling = ult(e, 1.60, 1.728)
  const dotScaling = talent(e, 0.52, 0.572)

  const maxExtraHits = e < 1 ? 4 : 5
  const defaults = {
    targetDotTakenDebuff: true,
    skillExtraHits: maxExtraHits,
    targetWindShear: true,
  }

  const teammateDefaults = {
    targetDotTakenDebuff: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    targetDotTakenDebuff: {
      id: 'targetDotTakenDebuff',
      formItem: 'switch',
      text: t('Content.targetDotTakenDebuff.text'),
      content: t('Content.targetDotTakenDebuff.content', { dotVulnerabilityValue: TsUtils.precisionRound(100 * dotVulnerabilityValue) }),
    },
    skillExtraHits: {
      id: 'skillExtraHits',
      formItem: 'slider',
      text: t('Content.skillExtraHits.text'),
      content: t('Content.skillExtraHits.content'),
      min: 1,
      max: maxExtraHits,
    },
    targetWindShear: {
      id: 'targetWindShear',
      formItem: 'switch',
      text: t('Content.targetWindShear.text'),
      content: t('Content.targetWindShear.content'),
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    targetDotTakenDebuff: content.targetDotTakenDebuff,
  }

  return {
    activeAbilities: [AbilityType.BASIC, AbilityType.SKILL, AbilityType.ULT, AbilityType.DOT],
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,

    entityDeclaration: () => Object.values(SampoEntities),
    entityDefinition: (action: OptimizerAction, context: OptimizerContext) => ({
      [SampoEntities.Sampo]: {
        primary: true,
        summon: false,
        memosprite: false,
      },
    }),

    actionDeclaration: () => Object.values(SampoAbilities),
    actionDefinition: (action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // E6: DoT scaling +0.15
      const totalDotScaling = dotScaling + (e >= 6 ? 0.15 : 0)

      // Skill hits: 1 base + extra hits
      const totalSkillScaling = skillScaling * (1 + r.skillExtraHits)
      const skillToughness = 10 + 5 * r.skillExtraHits

      return {
        [SampoAbilities.BASIC]: {
          hits: [
            HitDefinitionBuilder.standardBasic()
              .damageElement(ElementTag.Wind)
              .atkScaling(basicScaling)
              .toughnessDmg(10)
              .build(),
          ],
        },
        [SampoAbilities.SKILL]: {
          hits: [
            HitDefinitionBuilder.standardSkill()
              .damageElement(ElementTag.Wind)
              .atkScaling(totalSkillScaling)
              .toughnessDmg(skillToughness)
              .build(),
          ],
        },
        [SampoAbilities.ULT]: {
          hits: [
            HitDefinitionBuilder.standardUlt()
              .damageElement(ElementTag.Wind)
              .atkScaling(ultScaling)
              .toughnessDmg(20)
              .build(),
          ],
        },
        [SampoAbilities.DOT]: {
          hits: [
            HitDefinitionBuilder.standardDot()
              .damageElement(ElementTag.Wind)
              .atkScaling(totalDotScaling)
              .dotBaseChance(0.65)
              .build(),
          ],
        },
        [SampoAbilities.BREAK]: {
          hits: [
            HitDefinitionBuilder.standardBreak(ElementTag.Wind).build(),
          ],
        },
      }
    },
    actionModifiers: () => [],

    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      x.multiplicativeComplement(StatKey.DMG_RED, (r.targetWindShear) ? 0.15 : 0, x.source(SOURCE_TRACE))
    },

    precomputeMutualEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      x.buff(
        StatKey.VULNERABILITY,
        (m.targetDotTakenDebuff) ? dotVulnerabilityValue : 0,
        x.damageType(DamageTag.DOT).targets(TargetTag.FullTeam).source(SOURCE_ULT),
      )
    },

    finalizeCalculations: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {},
    newGpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => '',
  }
}

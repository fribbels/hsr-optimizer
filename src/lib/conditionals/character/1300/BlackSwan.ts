import { AbilityType } from 'lib/conditionals/conditionalConstants'
import {
  AbilityEidolon,
  Conditionals,
  ContentDefinition,
  createEnum,
} from 'lib/conditionals/conditionalUtils'
import { HitDefinitionBuilder } from 'lib/conditionals/hitDefinitionBuilder'
import { containerActionVal } from 'lib/gpu/injection/injectUtils'
import {
  wgsl,
  wgslTrue,
} from 'lib/gpu/injection/wgslUtils'
import { Source } from 'lib/optimization/buffSource'
import {
  ComputedStatsArray,
  Key,
} from 'lib/optimization/computedStatsArray'
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
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { buff } from 'lib/optimization/engine/container/gpuBuffBuilder'
import { TsUtils } from 'lib/utils/TsUtils'

import { Eidolon } from 'types/character'
import { CharacterConditionalsController } from 'types/conditionals'
import {
  OptimizerAction,
  OptimizerContext,
} from 'types/optimizer'

export const BlackSwanEntities = createEnum('BlackSwan')
export const BlackSwanAbilities = createEnum('BASIC', 'SKILL', 'ULT', 'DOT', 'BREAK')

export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.BlackSwan')
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
  } = Source.character('1307')

  const arcanaStackMultiplier = talent(e, 0.12, 0.132)
  const epiphanyDmgTakenBoost = ult(e, 0.25, 0.27)
  const defShredValue = skill(e, 0.208, 0.22)

  const basicScaling = basic(e, 0.60, 0.66)
  const skillScaling = skill(e, 0.90, 0.99)
  const ultScaling = ult(e, 1.20, 1.296)
  const dotScaling = talent(e, 2.40, 2.64)

  const dotChance = talent(e, 0.65, 0.68)

  const defaults = {
    ehrToDmgBoost: true,
    epiphanyDebuff: true,
    defDecreaseDebuff: true,
    arcanaStacks: 7,
    e1ResReduction: true,
    e4EffResPen: true,
  }
  const teammateDefaults = {
    epiphanyDebuff: true,
    defDecreaseDebuff: true,
    e1ResReduction: true,
    e4EffResPen: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    ehrToDmgBoost: {
      id: 'ehrToDmgBoost',
      formItem: 'switch',
      text: t('Content.ehrToDmgBoost.text'),
      content: t('Content.ehrToDmgBoost.content'),
    },
    epiphanyDebuff: {
      id: 'epiphanyDebuff',
      formItem: 'switch',
      text: t('Content.epiphanyDebuff.text'),
      content: t('Content.epiphanyDebuff.content', { epiphanyDmgTakenBoost: TsUtils.precisionRound(100 * epiphanyDmgTakenBoost) }),
    },
    defDecreaseDebuff: {
      id: 'defDecreaseDebuff',
      formItem: 'switch',
      text: t('Content.defDecreaseDebuff.text'),
      content: t('Content.defDecreaseDebuff.content', { defShredValue: TsUtils.precisionRound(100 * defShredValue) }),
    },
    arcanaStacks: {
      id: 'arcanaStacks',
      formItem: 'slider',
      text: t('Content.arcanaStacks.text'),
      content: t('Content.arcanaStacks.content', {
        dotScaling: TsUtils.precisionRound(100 * dotScaling),
        arcanaStackMultiplier: TsUtils.precisionRound(100 * arcanaStackMultiplier),
      }),
      min: 1,
      max: 50,
    },
    e1ResReduction: {
      id: 'e1ResReduction',
      formItem: 'switch',
      text: t('Content.e1ResReduction.text'),
      content: t('Content.e1ResReduction.content'),
      disabled: e < 1,
    },
    e4EffResPen: {
      id: 'e4EffResPen',
      formItem: 'switch',
      text: t('Content.e4EffResPen.text'),
      content: t('Content.e4EffResPen.content'),
      disabled: e < 4,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    epiphanyDebuff: content.epiphanyDebuff,
    defDecreaseDebuff: content.defDecreaseDebuff,
    e1ResReduction: content.e1ResReduction,
    e4EffResPen: content.e4EffResPen,
  }

  return {
    activeAbilities: [AbilityType.BASIC, AbilityType.SKILL, AbilityType.ULT, AbilityType.DOT],
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,

    entityDeclaration: () => Object.values(BlackSwanEntities),
    entityDefinition: (action: OptimizerAction, context: OptimizerContext) => ({
      [BlackSwanEntities.BlackSwan]: {
        primary: true,
        summon: false,
        memosprite: false,
      },
    }),

    actionDeclaration: () => Object.values(BlackSwanAbilities),
    actionDefinition: (action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      return {
        [BlackSwanAbilities.BASIC]: {
          hits: [
            HitDefinitionBuilder.standardBasic()
              .damageElement(ElementTag.Wind)
              .atkScaling(basicScaling)
              .toughnessDmg(10)
              .build(),
          ],
        },
        [BlackSwanAbilities.SKILL]: {
          hits: [
            HitDefinitionBuilder.standardSkill()
              .damageElement(ElementTag.Wind)
              .atkScaling(skillScaling)
              .toughnessDmg(20)
              .build(),
          ],
        },
        [BlackSwanAbilities.ULT]: {
          hits: [
            HitDefinitionBuilder.standardUlt()
              .damageElement(ElementTag.Wind)
              .atkScaling(ultScaling)
              .toughnessDmg(20)
              .build(),
          ],
        },
        [BlackSwanAbilities.DOT]: {
          hits: [
            HitDefinitionBuilder.standardDot()
              .dotBaseChance(dotChance)
              .dotSplit(0.05)
              .dotStacks(r.arcanaStacks)
              .damageElement(ElementTag.Wind)
              .damageType(DamageTag.DOT)
              .atkScaling(dotScaling + arcanaStackMultiplier * r.arcanaStacks)
              .build(),
          ],
        },
        [BlackSwanAbilities.BREAK]: {
          hits: [
            HitDefinitionBuilder.standardBreak(ElementTag.Wind).build(),
          ],
        },
      }
    },
    actionModifiers: () => [],

    initializeConfigurationsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {},
    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      x.buff(StatKey.DEF_PEN, (r.arcanaStacks >= 7) ? 0.20 : 0, x.damageType(DamageTag.DOT).source(SOURCE_TALENT))
    },
    precomputeMutualEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      // TODO: Technically this isnt a DoT vulnerability but rather vulnerability to damage on the enemy's turn which includes ults/etc.
      x.buff(StatKey.VULNERABILITY, (m.epiphanyDebuff) ? epiphanyDmgTakenBoost : 0, x.damageType(DamageTag.DOT).targets(TargetTag.FullTeam).source(SOURCE_ULT))
      x.buff(StatKey.DEF_PEN, (m.defDecreaseDebuff) ? defShredValue : 0, x.targets(TargetTag.FullTeam).source(SOURCE_SKILL))
      x.buff(
        StatKey.RES_PEN,
        (e >= 1 && m.e1ResReduction) ? 0.25 : 0,
        x.elements(ElementTag.Wind | ElementTag.Fire | ElementTag.Physical | ElementTag.Lightning).targets(TargetTag.FullTeam).source(SOURCE_E1),
      )
      x.buff(StatKey.EFFECT_RES_PEN, (e >= 4 && m.epiphanyDebuff && m.e4EffResPen) ? 0.10 : 0, x.targets(TargetTag.FullTeam).source(SOURCE_E4))
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

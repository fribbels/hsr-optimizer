import i18next from 'i18next'
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
import { CURRENT_DATA_VERSION } from 'lib/constants/constants'
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

import { Eidolon } from 'types/character'
import { CharacterConditionalsController } from 'types/conditionals'
import {
  OptimizerAction,
  OptimizerContext,
} from 'types/optimizer'

export const BlackSwanB1Entities = createEnum('BlackSwanB1')
export const BlackSwanB1Abilities = createEnum('BASIC', 'SKILL', 'ULT', 'DOT', 'BREAK')

export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  // const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.BlackSwan')
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
  } = Source.character('1307b1')

  const arcanaStackMultiplier = talent(e, 0.12, 0.132)
  const epiphanyDmgTakenBoost = ult(e, 0.25, 0.27)
  const skillDefShredValue = skill(e, 0.208, 0.22)

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 0.90, 0.99)
  const ultScaling = ult(e, 1.20, 1.296)
  const dotScaling = talent(e, 2.40, 2.64)

  const dotChance = talent(e, 0.65, 0.68)

  const defaults = {
    skillDefShred: true,
    epiphanyDebuff: true,
    arcanaStacks: e >= 6 ? 80 : 50,
    ehrToDmgBoost: true,
    e1ResReduction: true,
    e4Vulnerability: true,
  }
  const teammateDefaults = {
    skillDefShred: true,
    epiphanyDebuff: true,
    ehrToDmgBoost: true,
    combatEhr: 120,
    e1ResReduction: true,
    e4Vulnerability: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    skillDefShred: {
      id: 'skillDefShred',
      formItem: 'switch',
      text: 'Skill def shred',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
    },
    epiphanyDebuff: {
      id: 'epiphanyDebuff',
      formItem: 'switch',
      text: 'Epiphany Debuff',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
    },
    arcanaStacks: {
      id: 'arcanaStacks',
      formItem: 'slider',
      text: 'Arcana stacks',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
      min: 1,
      max: 100,
    },
    ehrToDmgBoost: {
      id: 'ehrToDmgBoost',
      formItem: 'switch',
      text: 'EHR to DMG Boost',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
    },
    e1ResReduction: {
      id: 'e1ResReduction',
      formItem: 'switch',
      text: 'E1 Res reduction',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
      disabled: e < 1,
    },
    e4Vulnerability: {
      id: 'e4Vulnerability',
      formItem: 'switch',
      text: 'E4 Vulnerability',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
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
      text: 'Black Swan\'s combat EHR',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
      min: 0,
      max: 120,
    },
    e1ResReduction: content.e1ResReduction,
    e4Vulnerability: content.e4Vulnerability,
  }

  return {
    activeAbilities: [AbilityType.BASIC, AbilityType.SKILL, AbilityType.ULT, AbilityType.DOT],
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

    actionDeclaration: () => Object.values(BlackSwanB1Abilities),
    actionDefinition: (action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      return {
        [BlackSwanB1Abilities.BASIC]: {
          hits: [
            HitDefinitionBuilder.standardBasic()
              .damageElement(ElementTag.Wind)
              .atkScaling(basicScaling)
              .toughnessDmg(10)
              .build(),
          ],
        },
        [BlackSwanB1Abilities.SKILL]: {
          hits: [
            HitDefinitionBuilder.standardSkill()
              .damageElement(ElementTag.Wind)
              .atkScaling(skillScaling)
              .toughnessDmg(20)
              .build(),
          ],
        },
        [BlackSwanB1Abilities.ULT]: {
          hits: [
            HitDefinitionBuilder.standardUlt()
              .damageElement(ElementTag.Wind)
              .atkScaling(ultScaling)
              .toughnessDmg(20)
              .build(),
          ],
        },
        [BlackSwanB1Abilities.DOT]: {
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
        [BlackSwanB1Abilities.BREAK]: {
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

      x.buff(StatKey.DMG_BOOST, t.ehrToDmgBoost ? Math.min(0.72, 0.60 * t.combatEhr) : 0, x.source(SOURCE_TRACE))
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

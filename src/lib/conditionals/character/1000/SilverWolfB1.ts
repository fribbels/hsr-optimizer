import { AbilityType } from 'lib/conditionals/conditionalConstants'
import {
  AbilityEidolon,
  Conditionals,
  ContentDefinition,
  createEnum,
} from 'lib/conditionals/conditionalUtils'
import {
  dynamicStatConversionContainer,
  gpuDynamicStatConversion,
} from 'lib/conditionals/evaluation/statConversion'
import { HitDefinitionBuilder } from 'lib/conditionals/hitDefinitionBuilder'
import {
  ConditionalActivation,
  ConditionalType,
  Stats,
} from 'lib/constants/constants'
import { wgslTrue } from 'lib/gpu/injection/wgslUtils'
import { Source } from 'lib/optimization/buffSource'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import { StatKey } from 'lib/optimization/engine/config/keys'
import { ElementTag, TargetTag } from 'lib/optimization/engine/config/tag'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { TsUtils } from 'lib/utils/TsUtils'

import { Eidolon } from 'types/character'

import { CharacterConditionalsController } from 'types/conditionals'
import {
  OptimizerAction,
  OptimizerContext,
} from 'types/optimizer'

export const SilverWolfB1Entities = createEnum('SilverWolfB1')
export const SilverWolfB1Abilities = createEnum('BASIC', 'SKILL', 'ULT', 'BREAK')

export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.SilverWolfB1.Content')
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
  } = Source.character('1006b1')

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 1.96, 2.156)
  const ultScaling = ult(e, 3.80, 4.104)

  const skillResShredValue = skill(e, 0.13, 0.135)
  const talentDefShredDebuffValue = talent(e, 0.12, 0.132)
  const ultDefShredValue = ult(e, 0.45, 0.468)

  const bugBaseChance = talent(e, 1.00, 1.08)
  const ultBaseChance = ult(e, 1.20, 1.28)

  const defaults = {
    ehrToAtkConversion: true,
    skillWeaknessResShredDebuff: false,
    skillResShredDebuff: true,
    talentDefShredDebuff: true,
    ultDefShredDebuff: true,
    targetDebuffs: 5,
    e2Vulnerability: true,
  }

  const teammateDefaults = {
    skillWeaknessResShredDebuff: false,
    skillResShredDebuff: true,
    talentDefShredDebuff: true,
    ultDefShredDebuff: true,
    targetDebuffs: 5,
    e2Vulnerability: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    ehrToAtkConversion: {
      id: 'ehrToAtkConversion',
      formItem: 'switch',
      text: t('ehrToAtkConversion.text'),
      content: t('ehrToAtkConversion.content'),
    },
    skillResShredDebuff: {
      id: 'skillResShredDebuff',
      formItem: 'switch',
      text: t('skillResShredDebuff.text'),
      content: t('skillResShredDebuff.content', { SkillResShred: TsUtils.precisionRound(100 * skillResShredValue) }),
    },
    skillWeaknessResShredDebuff: {
      id: 'skillWeaknessResShredDebuff',
      formItem: 'switch',
      text: t('skillWeaknessResShredDebuff.text'),
      content: t('skillWeaknessResShredDebuff.content', { ImplantBaseChance: TsUtils.precisionRound(skill(e, 120, 128)) }),
    },
    talentDefShredDebuff: {
      id: 'talentDefShredDebuff',
      formItem: 'switch',
      text: t('talentDefShredDebuff.text'),
      content: t('talentDefShredDebuff.content', {
        BugBaseChance: TsUtils.precisionRound(100 * bugBaseChance),
        BugAtkDown: talent(e, 10, 11),
        BugDefDown: talent(e, 12, 13.2),
        BugSpdDown: talent(e, 6, 6.6),
      }),
    },
    ultDefShredDebuff: {
      id: 'ultDefShredDebuff',
      formItem: 'switch',
      text: t('ultDefShredDebuff.text'),
      content: t('ultDefShredDebuff.content', {
        UltDefShred: TsUtils.precisionRound(100 * ultDefShredValue),
        UltBaseChance: TsUtils.precisionRound(100 * ultBaseChance),
      }),
    },
    targetDebuffs: {
      id: 'targetDebuffs',
      formItem: 'slider',
      text: t('targetDebuffs.text'),
      content: t('targetDebuffs.content', { BugBaseChance: TsUtils.precisionRound(100 * bugBaseChance) }),
      min: 0,
      max: 5,
    },
    e2Vulnerability: {
      id: 'e2Vulnerability',
      formItem: 'switch',
      text: t('e2Vulnerability.text'),
      content: t('e2Vulnerability.content'),
      disabled: e < 2,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    skillResShredDebuff: content.skillResShredDebuff,
    skillWeaknessResShredDebuff: content.skillWeaknessResShredDebuff,
    talentDefShredDebuff: content.talentDefShredDebuff,
    ultDefShredDebuff: content.ultDefShredDebuff,
    targetDebuffs: content.targetDebuffs,
    e2Vulnerability: content.e2Vulnerability,
  }

  return {
    activeAbilities: [AbilityType.BASIC, AbilityType.SKILL, AbilityType.ULT],
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,

    entityDeclaration: () => Object.values(SilverWolfB1Entities),
    entityDefinition: (action: OptimizerAction, context: OptimizerContext) => ({
      [SilverWolfB1Entities.SilverWolfB1]: {
        primary: true,
        summon: false,
        memosprite: false,
      },
    }),

    actionDeclaration: () => Object.values(SilverWolfB1Abilities),
    actionDefinition: (action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // E4: ULT additional damage scaling (0.20 per debuff)
      const ultAdditionalScaling = (e >= 4) ? r.targetDebuffs * 0.20 : 0

      return {
        [SilverWolfB1Abilities.BASIC]: {
          hits: [
            HitDefinitionBuilder.standardBasic()
              .damageElement(ElementTag.Quantum)
              .atkScaling(basicScaling)
              .toughnessDmg(10)
              .build(),
          ],
        },
        [SilverWolfB1Abilities.SKILL]: {
          hits: [
            HitDefinitionBuilder.standardSkill()
              .damageElement(ElementTag.Quantum)
              .atkScaling(skillScaling)
              .toughnessDmg(20)
              .build(),
          ],
        },
        [SilverWolfB1Abilities.ULT]: {
          hits: [
            HitDefinitionBuilder.standardUlt()
              .damageElement(ElementTag.Quantum)
              .atkScaling(ultScaling)
              .toughnessDmg(20)
              .build(),
            ...(ultAdditionalScaling > 0
              ? [
                HitDefinitionBuilder.standardAdditional()
                  .damageElement(ElementTag.Quantum)
                  .atkScaling(ultAdditionalScaling)
                  .build(),
              ]
              : []
            ),
          ],
        },
        [SilverWolfB1Abilities.BREAK]: {
          hits: [
            HitDefinitionBuilder.standardBreak(ElementTag.Quantum).build(),
          ],
        },
      }
    },
    actionModifiers: () => [],

    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // E6: Elemental DMG boost (0.20 per debuff)
      x.buff(StatKey.DMG_BOOST, (e >= 6) ? r.targetDebuffs * 0.20 : 0, x.source(SOURCE_E6))
    },

    precomputeMutualEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      x.buff(StatKey.RES_PEN, (m.skillWeaknessResShredDebuff) ? 0.20 : 0, x.targets(TargetTag.FullTeam).source(SOURCE_SKILL))
      x.buff(StatKey.RES_PEN, (m.skillResShredDebuff) ? skillResShredValue : 0, x.targets(TargetTag.FullTeam).source(SOURCE_SKILL))

      x.buff(StatKey.DEF_PEN, (m.ultDefShredDebuff) ? ultDefShredValue : 0, x.targets(TargetTag.FullTeam).source(SOURCE_ULT))
      x.buff(StatKey.DEF_PEN, (m.talentDefShredDebuff) ? talentDefShredDebuffValue : 0, x.targets(TargetTag.FullTeam).source(SOURCE_TALENT))

      x.buff(StatKey.VULNERABILITY, (e >= 2 && m.e2Vulnerability) ? 0.20 : 0, x.targets(TargetTag.FullTeam).source(SOURCE_E2))
    },

    finalizeCalculations: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
    },
    newGpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => '',

    dynamicConditionals: [
      {
        id: 'SilverWolfConversionConditional',
        type: ConditionalType.ABILITY,
        activation: ConditionalActivation.CONTINUOUS,
        dependsOn: [Stats.EHR],
        chainsTo: [Stats.ATK],
        condition: function (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals as Conditionals<typeof content>
          return r.ehrToAtkConversion
        },
        effect: function (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) {
          dynamicStatConversionContainer(
            Stats.EHR,
            Stats.ATK,
            this,
            x,
            action,
            context,
            SOURCE_TRACE,
            (convertibleValue) => Math.min(0.50, 0.10 * Math.floor(convertibleValue / 0.10)) * context.baseATK,
          )
        },
        gpu: function (action: OptimizerAction, context: OptimizerContext) {
          const r = action.characterConditionals as Conditionals<typeof content>

          return gpuDynamicStatConversion(
            Stats.EHR,
            Stats.ATK,
            this,
            action,
            context,
            `min(0.50, 0.10 * floor(convertibleValue / 0.10)) * baseATK`,
            `${wgslTrue(r.ehrToAtkConversion)}`,
          )
        },
      },
    ],
  }
}

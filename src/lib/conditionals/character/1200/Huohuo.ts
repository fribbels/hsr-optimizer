import { AbilityType } from 'lib/conditionals/conditionalConstants'
import {
  AbilityEidolon,
  Conditionals,
  ContentDefinition,
  createEnum,
} from 'lib/conditionals/conditionalUtils'
import { HitDefinitionBuilder } from 'lib/conditionals/hitDefinitionBuilder'
import { Source } from 'lib/optimization/buffSource'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import { StatKey } from 'lib/optimization/engine/config/keys'
import {
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

export const HuohuoEntities = createEnum('Huohuo')
export const HuohuoAbilities = createEnum('BASIC', 'BREAK', 'SKILL_HEAL', 'TALENT_HEAL')

export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Huohuo')
  const { basic, ult, skill, talent } = AbilityEidolon.ULT_TALENT_3_SKILL_BASIC_5
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
  } = Source.character('1217')

  const ultBuffValue = ult(e, 0.40, 0.432)
  const basicScaling = basic(e, 0.50, 0.55)

  const skillHealScaling = talent(e, 0.21, 0.224)
  const skillHealFlat = talent(e, 560, 623)

  const talentHealScaling = skill(e, 0.045, 0.048)
  const talentHealFlat = skill(e, 120, 133.5)

  const defaults = {
    ultBuff: true,
    skillBuff: true,
    e6DmgBuff: true,
  }

  const teammateDefaults = {
    ultBuff: true,
    skillBuff: true,
    e6DmgBuff: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    ultBuff: {
      id: 'ultBuff',
      formItem: 'switch',
      text: t('Content.ultBuff.text'),
      content: t('Content.ultBuff.content', { ultBuffValue: TsUtils.precisionRound(100 * ultBuffValue) }),
    },
    skillBuff: {
      id: 'skillBuff',
      formItem: 'switch',
      text: t('Content.skillBuff.text'),
      content: t('Content.skillBuff.content'),
      disabled: e < 1,
    },
    e6DmgBuff: {
      id: 'e6DmgBuff',
      formItem: 'switch',
      text: t('Content.e6DmgBuff.text'),
      content: t('Content.e6DmgBuff.content'),
      disabled: e < 6,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    ultBuff: content.ultBuff,
    skillBuff: content.skillBuff,
    e6DmgBuff: content.e6DmgBuff,
  }

  return {
    activeAbilities: [AbilityType.BASIC],
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,

    entityDeclaration: () => Object.values(HuohuoEntities),
    entityDefinition: (action: OptimizerAction, context: OptimizerContext) => ({
      [HuohuoEntities.Huohuo]: {
        primary: true,
        summon: false,
        memosprite: false,
      },
    }),

    actionDeclaration: () => Object.values(HuohuoAbilities),
    actionDefinition: (action: OptimizerAction, context: OptimizerContext) => ({
      [HuohuoAbilities.BASIC]: {
        hits: [
          HitDefinitionBuilder.standardBasic()
            .damageElement(ElementTag.Wind)
            .hpScaling(basicScaling)
            .toughnessDmg(10)
            .build(),
        ],
      },
      [HuohuoAbilities.BREAK]: {
        hits: [
          HitDefinitionBuilder.standardBreak(ElementTag.Wind).build(),
        ],
      },
      [HuohuoAbilities.SKILL_HEAL]: {
        hits: [
          HitDefinitionBuilder.skillHeal()
            .hpScaling(skillHealScaling)
            .flatHeal(skillHealFlat)
            .build(),
        ],
      },
      [HuohuoAbilities.TALENT_HEAL]: {
        hits: [
          HitDefinitionBuilder.talentHeal()
            .hpScaling(talentHealScaling)
            .flatHeal(talentHealFlat)
            .build(),
        ],
      },
    }),
    actionModifiers: () => [],

    initializeConfigurationsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {},

    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
    },

    precomputeMutualEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      x.buff(StatKey.ATK_P, (m.ultBuff) ? ultBuffValue : 0, x.targets(TargetTag.FullTeam).source(SOURCE_ULT))
      x.buff(StatKey.SPD_P, (e >= 1 && m.skillBuff) ? 0.12 : 0, x.targets(TargetTag.FullTeam).source(SOURCE_E1))
      x.buff(StatKey.DMG_BOOST, (e >= 6 && m.e6DmgBuff) ? 0.50 : 0, x.targets(TargetTag.FullTeam).source(SOURCE_E6))
    },

    finalizeCalculations: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
    },
    newGpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => '',
  }
}

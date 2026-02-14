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

export const YukongEntities = createEnum('Yukong')
export const YukongAbilities = createEnum('BASIC', 'ULT', 'BREAK')

export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Yukong')
  const { basic, skill, ult, talent } = AbilityEidolon.SKILL_BASIC_3_ULT_TALENT_5
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
  } = Source.character('1207')

  const skillAtkBuffValue = skill(e, 0.80, 0.88)
  const ultCdBuffValue = skill(e, 0.65, 0.702)
  const ultCrBuffValue = skill(e, 0.28, 0.294)
  const talentAtkScaling = talent(e, 0.80, 0.88)

  const basicScaling = basic(e, 1.00, 1.10)
  const ultScaling = ult(e, 3.80, 4.104)

  const defaults = {
    teamImaginaryDmgBoost: true,
    roaringBowstringsActive: true,
    ultBuff: true,
    initialSpeedBuff: true,
  }

  const teammateDefaults = {
    teamImaginaryDmgBoost: true,
    roaringBowstringsActive: true,
    ultBuff: true,
    initialSpeedBuff: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    teamImaginaryDmgBoost: {
      id: 'teamImaginaryDmgBoost',
      formItem: 'switch',
      text: t('Content.teamImaginaryDmgBoost.text'),
      content: t('Content.teamImaginaryDmgBoost.content'),
    },
    roaringBowstringsActive: {
      id: 'roaringBowstringsActive',
      formItem: 'switch',
      text: t('Content.roaringBowstringsActive.text'),
      content: t('Content.roaringBowstringsActive.content', { skillAtkBuffValue: TsUtils.precisionRound(100 * skillAtkBuffValue) }),
    },
    ultBuff: {
      id: 'ultBuff',
      formItem: 'switch',
      text: t('Content.ultBuff.text'),
      content: t('Content.ultBuff.content', {
        ultCrBuffValue: TsUtils.precisionRound(100 * ultCrBuffValue),
        ultCdBuffValue: TsUtils.precisionRound(100 * ultCdBuffValue),
        ultScaling: TsUtils.precisionRound(100 * ultScaling),
      }),
    },
    initialSpeedBuff: {
      id: 'initialSpeedBuff',
      formItem: 'switch',
      text: t('Content.initialSpeedBuff.text'),
      content: t('Content.initialSpeedBuff.content'),
      disabled: e < 1,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    teamImaginaryDmgBoost: content.teamImaginaryDmgBoost,
    roaringBowstringsActive: content.roaringBowstringsActive,
    ultBuff: content.ultBuff,
    initialSpeedBuff: content.initialSpeedBuff,
  }

  return {
    activeAbilities: [AbilityType.BASIC, AbilityType.ULT],
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,

    entityDeclaration: () => Object.values(YukongEntities),
    entityDefinition: (action: OptimizerAction, context: OptimizerContext) => ({
      [YukongEntities.Yukong]: {
        primary: true,
        summon: false,
        memosprite: false,
      },
    }),

    actionDeclaration: () => Object.values(YukongAbilities),
    actionDefinition: (action: OptimizerAction, context: OptimizerContext) => {
      return {
        [YukongAbilities.BASIC]: {
          hits: [
            HitDefinitionBuilder.standardBasic()
              .damageElement(ElementTag.Imaginary)
              .atkScaling(basicScaling + talentAtkScaling)
              .toughnessDmg(10)
              .build(),
          ],
        },
        [YukongAbilities.ULT]: {
          hits: [
            HitDefinitionBuilder.standardUlt()
              .damageElement(ElementTag.Imaginary)
              .atkScaling(ultScaling)
              .toughnessDmg(30)
              .build(),
          ],
        },
        [YukongAbilities.BREAK]: {
          hits: [
            HitDefinitionBuilder.standardBreak(ElementTag.Imaginary).build(),
          ],
        },
      }
    },
    actionModifiers: () => [],

    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // E4: Elemental DMG boost when roaring bowstrings active
      x.buff(StatKey.DMG_BOOST, (e >= 4 && r.roaringBowstringsActive) ? 0.30 : 0, x.source(SOURCE_E4))
    },

    precomputeMutualEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals as Conditionals<typeof teammateContent>

      // Skill: ATK% buff for team
      x.buff(StatKey.ATK_P, (m.roaringBowstringsActive) ? skillAtkBuffValue : 0, x.targets(TargetTag.FullTeam).source(SOURCE_SKILL))

      // ULT: CR and CD buff for team (requires roaring bowstrings)
      x.buff(StatKey.CR, (m.ultBuff && m.roaringBowstringsActive) ? ultCrBuffValue : 0, x.targets(TargetTag.FullTeam).source(SOURCE_ULT))
      x.buff(StatKey.CD, (m.ultBuff && m.roaringBowstringsActive) ? ultCdBuffValue : 0, x.targets(TargetTag.FullTeam).source(SOURCE_ULT))

      // E1: SPD% buff for team
      x.buff(StatKey.SPD_P, (e >= 1 && m.initialSpeedBuff) ? 0.10 : 0, x.targets(TargetTag.FullTeam).source(SOURCE_E1))

      // Trace: Imaginary DMG boost for team
      x.buff(StatKey.IMAGINARY_DMG_BOOST, (m.teamImaginaryDmgBoost) ? 0.12 : 0, x.targets(TargetTag.FullTeam).source(SOURCE_TRACE))
    },

    finalizeCalculations: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
    },

    newGpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => '',
  }
}
import {
  AbilityType,
  ASHBLAZING_ATK_STACK,
} from 'lib/conditionals/conditionalConstants'
import {
  boostAshblazingAtkContainer,
  gpuBoostAshblazingAtkContainer,
} from 'lib/conditionals/conditionalFinalizers'
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
} from 'lib/optimization/engine/config/tag'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { TsUtils } from 'lib/utils/TsUtils'

import { Eidolon } from 'types/character'
import { NumberToNumberMap } from 'types/common'
import { CharacterConditionalsController } from 'types/conditionals'
import {
  OptimizerAction,
  OptimizerContext,
} from 'types/optimizer'

export const ClaraEntities = createEnum('Clara')
export const ClaraAbilities = createEnum('BASIC', 'SKILL', 'FUA', 'BREAK')

export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Clara')
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
  } = Source.character('1107')

  const ultDmgReductionValue = ult(e, 0.25, 0.27)
  const ultFuaExtraScaling = ult(e, 1.60, 1.728)

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 1.20, 1.32)
  const fuaScaling = talent(e, 1.60, 1.76)

  // Ashblazing set hit multipliers (kept for reference)
  const hitMultiByTargetsBlast: NumberToNumberMap = {
    1: ASHBLAZING_ATK_STACK * (1 * 1 / 1),
    3: ASHBLAZING_ATK_STACK * (2 * 1 / 1),
    5: ASHBLAZING_ATK_STACK * (2 * 1 / 1), // Clara is 1 hit blast when enhanced
  }

  const hitMultiSingle = ASHBLAZING_ATK_STACK * (1 * 1 / 1)

  const defaults = {
    ultBuff: true,
    talentEnemyMarked: true,
    e2UltAtkBuff: true,
    e4DmgReductionBuff: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    ultBuff: {
      id: 'ultBuff',
      formItem: 'switch',
      text: t('Content.ultBuff.text'),
      content: t('Content.ultBuff.content', {
        ultFuaExtraScaling: TsUtils.precisionRound(100 * ultFuaExtraScaling),
        ultDmgReductionValue: TsUtils.precisionRound(100 * ultDmgReductionValue),
      }),
    },
    talentEnemyMarked: {
      id: 'talentEnemyMarked',
      formItem: 'switch',
      text: t('Content.talentEnemyMarked.text'),
      content: t('Content.talentEnemyMarked.content', { skillScaling: TsUtils.precisionRound(100 * skillScaling) }),
    },
    e2UltAtkBuff: {
      id: 'e2UltAtkBuff',
      formItem: 'switch',
      text: t('Content.e2UltAtkBuff.text'),
      content: t('Content.e2UltAtkBuff.content'),
      disabled: e < 2,
    },
    e4DmgReductionBuff: {
      id: 'e4DmgReductionBuff',
      formItem: 'switch',
      text: t('Content.e4DmgReductionBuff.text'),
      content: t('Content.e4DmgReductionBuff.content'),
      disabled: e < 4,
    },
  }

  return {
    activeAbilities: [AbilityType.BASIC, AbilityType.SKILL, AbilityType.FUA],
    content: () => Object.values(content),
    defaults: () => defaults,

    entityDeclaration: () => Object.values(ClaraEntities),
    entityDefinition: (action: OptimizerAction, context: OptimizerContext) => ({
      [ClaraEntities.Clara]: {
        primary: true,
        summon: false,
        memosprite: false,
      },
    }),

    actionDeclaration: () => Object.values(ClaraAbilities),
    actionDefinition: (action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      const skillAtkScaling = r.talentEnemyMarked ? skillScaling * 2 : skillScaling
      const fuaAtkScaling = r.ultBuff ? fuaScaling + ultFuaExtraScaling : fuaScaling

      return {
        [ClaraAbilities.BASIC]: {
          hits: [
            HitDefinitionBuilder.standardBasic()
              .damageElement(ElementTag.Physical)
              .atkScaling(basicScaling)
              .toughnessDmg(10)
              .build(),
          ],
        },
        [ClaraAbilities.SKILL]: {
          hits: [
            HitDefinitionBuilder.standardSkill()
              .damageElement(ElementTag.Physical)
              .atkScaling(skillAtkScaling)
              .toughnessDmg(10)
              .build(),
          ],
        },
        [ClaraAbilities.FUA]: {
          hits: [
            HitDefinitionBuilder.standardFua()
              .damageElement(ElementTag.Physical)
              .atkScaling(fuaAtkScaling)
              .toughnessDmg(10)
              .build(),
          ],
        },
        [ClaraAbilities.BREAK]: {
          hits: [
            HitDefinitionBuilder.standardBreak(ElementTag.Physical).build(),
          ],
        },
      }
    },
    actionModifiers: () => [],

    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      x.buff(StatKey.ATK_P, (e >= 2 && r.e2UltAtkBuff) ? 0.30 : 0, x.source(SOURCE_E2))

      x.multiplicativeComplement(StatKey.DMG_RED, 0.10, x.source(SOURCE_TALENT))
      x.multiplicativeComplement(StatKey.DMG_RED, (r.ultBuff) ? ultDmgReductionValue : 0, x.source(SOURCE_ULT))
      x.multiplicativeComplement(StatKey.DMG_RED, (e >= 4 && r.e4DmgReductionBuff) ? 0.30 : 0, x.source(SOURCE_E4))

      x.buff(StatKey.DMG_BOOST, 0.30, x.damageType(DamageTag.FUA).source(SOURCE_TRACE))
    },

    finalizeCalculations: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      boostAshblazingAtkContainer(x, action, hitMultiSingle)
    },
    newGpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => {
      return gpuBoostAshblazingAtkContainer(hitMultiSingle, action)
    },
  }
}

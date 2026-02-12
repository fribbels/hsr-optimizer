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
  DamageTag,
  ElementTag,
} from 'lib/optimization/engine/config/tag'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { TsUtils } from 'lib/utils/TsUtils'

import { Eidolon } from 'types/character'

import { CharacterConditionalsController } from 'types/conditionals'
import {
  OptimizerAction,
  OptimizerContext,
} from 'types/optimizer'

export const SushangEntities = createEnum('Sushang')
export const SushangAbilities = createEnum('BASIC', 'SKILL', 'ULT', 'BREAK')

export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Sushang')
  const { basic, skill, ult, talent } = AbilityEidolon.ULT_TALENT_3_SKILL_BASIC_5
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
  } = Source.character('1206')

  const talentSpdBuffValue = talent(e, 0.20, 0.21)
  const ultBuffedAtk = ult(e, 0.30, 0.324)
  const talentSpdBuffStacksMax = (e >= 6) ? 2 : 1

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 2.10, 2.31)
  const skillExtraHitScaling = skill(e, 1.00, 1.10)
  const ultScaling = ult(e, 3.20, 3.456)

  const defaults = {
    ultBuffedState: true,
    e2DmgReductionBuff: true,
    skillExtraHits: 3,
    skillTriggerStacks: 10,
    talentSpdBuffStacks: talentSpdBuffStacksMax,
  }

  const content: ContentDefinition<typeof defaults> = {
    ultBuffedState: {
      id: 'ultBuffedState',
      formItem: 'switch',
      text: t('Content.ultBuffedState.text'),
      content: t('Content.ultBuffedState.content', { ultBuffedAtk: TsUtils.precisionRound(100 * ultBuffedAtk) }),
    },
    skillExtraHits: {
      id: 'skillExtraHits',
      formItem: 'slider',
      text: t('Content.skillExtraHits.text'),
      content: t('Content.skillExtraHits.content'),
      min: 0,
      max: 3,
    },
    skillTriggerStacks: {
      id: 'skillTriggerStacks',
      formItem: 'slider',
      text: t('Content.skillTriggerStacks.text'),
      content: t('Content.skillTriggerStacks.content'),
      min: 0,
      max: 10,
    },
    talentSpdBuffStacks: {
      id: 'talentSpdBuffStacks',
      formItem: 'slider',
      text: t('Content.talentSpdBuffStacks.text'),
      content: t('Content.talentSpdBuffStacks.content', { talentSpdBuffValue: TsUtils.precisionRound(100 * talentSpdBuffValue) }),
      min: 0,
      max: talentSpdBuffStacksMax,
    },
    e2DmgReductionBuff: {
      id: 'e2DmgReductionBuff',
      formItem: 'switch',
      text: t('Content.e2DmgReductionBuff.text'),
      content: t('Content.e2DmgReductionBuff.content'),
      disabled: e < 2,
    },
  }

  return {
    activeAbilities: [AbilityType.BASIC, AbilityType.SKILL, AbilityType.ULT],
    content: () => Object.values(content),
    defaults: () => defaults,

    entityDeclaration: () => Object.values(SushangEntities),
    entityDefinition: (action: OptimizerAction, context: OptimizerContext) => ({
      [SushangEntities.Sushang]: {
        primary: true,
        summon: false,
        memosprite: false,
      },
    }),

    actionDeclaration: () => Object.values(SushangAbilities),
    actionDefinition: (action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      let stanceSkillScaling = 0
      stanceSkillScaling += (r.skillExtraHits >= 1) ? skillExtraHitScaling : 0
      stanceSkillScaling += (r.ultBuffedState && r.skillExtraHits >= 2) ? skillExtraHitScaling * 0.5 : 0
      stanceSkillScaling += (r.ultBuffedState && r.skillExtraHits >= 3) ? skillExtraHitScaling * 0.5 : 0

      return {
        [SushangAbilities.BASIC]: {
          hits: [
            HitDefinitionBuilder.standardBasic()
              .damageElement(ElementTag.Physical)
              .atkScaling(basicScaling)
              .toughnessDmg(10)
              .build(),
          ],
        },
        [SushangAbilities.SKILL]: {
          hits: [
            HitDefinitionBuilder.standardSkill()
              .damageElement(ElementTag.Physical)
              .atkScaling(skillScaling)
              .toughnessDmg(20)
              .build(),
            ...(
              (stanceSkillScaling > 0)
                ? [
                  HitDefinitionBuilder.standardAdditional()
                    .damageElement(ElementTag.Physical)
                    .atkScaling(stanceSkillScaling)
                    .build(),
                ]
                : []
            ),
          ],
        },
        [SushangAbilities.ULT]: {
          hits: [
            HitDefinitionBuilder.standardUlt()
              .damageElement(ElementTag.Physical)
              .atkScaling(ultScaling)
              .toughnessDmg(30)
              .build(),
          ],
        },
        [SushangAbilities.BREAK]: {
          hits: [
            HitDefinitionBuilder.standardBreak(ElementTag.Physical).build(),
          ],
        },
      }
    },
    actionModifiers: () => [],

    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // E4: BE buff
      x.buff(StatKey.BE, (e >= 4) ? 0.40 : 0, x.source(SOURCE_E4))

      // ULT: ATK% buff
      x.buff(StatKey.ATK_P, (r.ultBuffedState) ? ultBuffedAtk : 0, x.source(SOURCE_ULT))

      // Talent: SPD% buff per stack
      x.buff(StatKey.SPD_P, r.talentSpdBuffStacks * talentSpdBuffValue, x.source(SOURCE_TALENT))

      // Trace: Additional DMG boost based on skill trigger stacks
      x.buff(StatKey.DMG_BOOST, r.skillTriggerStacks * 0.025, x.damageType(DamageTag.ADDITIONAL).source(SOURCE_SKILL))

      // E2: DMG reduction
      x.multiplicativeComplement(StatKey.DMG_RED, (e >= 2 && r.e2DmgReductionBuff) ? 0.20 : 0, x.source(SOURCE_E2))
    },

    finalizeCalculations: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
    },

    newGpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => '',
  }
}

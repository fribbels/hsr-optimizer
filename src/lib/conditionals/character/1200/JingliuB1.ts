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

export const JingliuB1Entities = createEnum('JingliuB1')
export const JingliuB1Abilities = createEnum('BASIC', 'SKILL', 'ULT', 'BREAK')

export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.JingliuB1.Content')
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
  } = Source.character('1212b1')

  const talentCrBuff = talent(e, 0.50, 0.52)

  const basicScaling = basic(e, 0.50, 0.55)
  const skillScaling = skill(e, 1.50, 1.65)
  const ultScaling = ult(e, 1.80, 1.98)

  const talentCdScaling = talent(e, 0.44, 0.484)

  const defaults = {
    talentEnhancedState: true,
    maxSyzygyDefPen: true,
    moonlightStacks: 5,
    e1Buffs: true,
    e2SkillDmgBuff: true,
    e4MoonlightCdBuff: true,
    e6ResPen: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    talentEnhancedState: {
      id: 'talentEnhancedState',
      formItem: 'switch',
      text: t('talentEnhancedState.text'),
      content: t('talentEnhancedState.content', { UltCRBuff: TsUtils.precisionRound(100 * talentCrBuff) }),
    },
    maxSyzygyDefPen: {
      id: 'maxSyzygyDefPen',
      formItem: 'switch',
      text: t('maxSyzygyDefPen.text'),
      content: t('maxSyzygyDefPen.content', {}),
    },
    moonlightStacks: {
      id: 'moonlightStacks',
      formItem: 'slider',
      text: t('moonlightStacks.text'),
      content: t('moonlightStacks.content', { MoonlightCDBuff: TsUtils.precisionRound(100 * talentCdScaling) }),
      min: 0,
      max: 5,
    },
    e1Buffs: {
      id: 'e1Buffs',
      formItem: 'switch',
      text: t('e1Buffs.text'),
      content: t('e1Buffs.content', {}),
      disabled: e < 1,
    },
    e2SkillDmgBuff: {
      id: 'e2SkillDmgBuff',
      formItem: 'switch',
      text: t('e2SkillDmgBuff.text'),
      content: t('e2SkillDmgBuff.content', {}),
      disabled: e < 2,
    },
    e4MoonlightCdBuff: {
      id: 'e4MoonlightCdBuff',
      formItem: 'switch',
      text: t('e4MoonlightCdBuff.text'),
      content: t('e4MoonlightCdBuff.content', {}),
      disabled: e < 4,
    },
    e6ResPen: {
      id: 'e6ResPen',
      formItem: 'switch',
      text: t('e6ResPen.text'),
      content: t('e6ResPen.content', {}),
      disabled: e < 6,
    },
  }

  return {
    activeAbilities: [AbilityType.BASIC, AbilityType.SKILL, AbilityType.ULT],
    content: () => Object.values(content),
    defaults: () => defaults,

    entityDeclaration: () => Object.values(JingliuB1Entities),
    entityDefinition: (action: OptimizerAction, context: OptimizerContext) => ({
      [JingliuB1Entities.JingliuB1]: {
        primary: true,
        summon: false,
        memosprite: false,
      },
    }),

    actionDeclaration: () => Object.values(JingliuB1Abilities),
    actionDefinition: (action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // E1 adds extra HP scaling to skill (in enhanced state) and ult
      const e1SkillBonus = (e >= 1 && r.e1Buffs && r.talentEnhancedState) ? 0.80 : 0
      const e1UltBonus = (e >= 1 && r.e1Buffs) ? 0.80 : 0

      return {
        [JingliuB1Abilities.BASIC]: {
          hits: [
            HitDefinitionBuilder.standardBasic()
              .damageElement(ElementTag.Ice)
              .hpScaling(basicScaling)
              .toughnessDmg(10)
              .build(),
          ],
        },
        [JingliuB1Abilities.SKILL]: {
          hits: [
            HitDefinitionBuilder.standardSkill()
              .damageElement(ElementTag.Ice)
              .hpScaling(skillScaling + e1SkillBonus)
              .toughnessDmg(20)
              .build(),
          ],
        },
        [JingliuB1Abilities.ULT]: {
          hits: [
            HitDefinitionBuilder.standardUlt()
              .damageElement(ElementTag.Ice)
              .hpScaling(ultScaling + e1UltBonus)
              .toughnessDmg(20)
              .build(),
          ],
        },
        [JingliuB1Abilities.BREAK]: {
          hits: [
            HitDefinitionBuilder.standardBreak(ElementTag.Ice).build(),
          ],
        },
      }
    },
    actionModifiers: () => [],

    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // Talent CR buff in enhanced state
      x.buff(StatKey.CR, (r.talentEnhancedState) ? talentCrBuff : 0, x.source(SOURCE_TALENT))

      // Moonlight stacks CD buff
      x.buff(StatKey.CD, r.moonlightStacks * talentCdScaling, x.source(SOURCE_TALENT))

      // E4: Extra CD per moonlight stack
      x.buff(StatKey.CD, (e >= 4 && r.e4MoonlightCdBuff) ? r.moonlightStacks * 0.20 : 0, x.source(SOURCE_E4))

      // Trace: RES buff in enhanced state
      x.buff(StatKey.RES, (r.talentEnhancedState) ? 0.35 : 0, x.source(SOURCE_TRACE))

      // Trace: DEF PEN at max syzygy
      x.buff(StatKey.DEF_PEN, (r.maxSyzygyDefPen) ? 0.25 : 0, x.source(SOURCE_TRACE))

      // Trace: ULT DMG boost in enhanced state
      x.buff(StatKey.DMG_BOOST, (r.talentEnhancedState) ? 0.20 : 0, x.damageType(DamageTag.ULT).source(SOURCE_TRACE))

      // E1: CD buff
      x.buff(StatKey.CD, (e >= 1 && r.e1Buffs) ? 0.36 : 0, x.source(SOURCE_E1))

      // E2: Skill DMG boost in enhanced state
      x.buff(StatKey.DMG_BOOST, (e >= 2 && r.talentEnhancedState && r.e2SkillDmgBuff) ? 0.80 : 0, x.damageType(DamageTag.SKILL).source(SOURCE_E2))

      // E6: Ice RES PEN
      x.buff(StatKey.RES_PEN, (e >= 6 && r.e6ResPen) ? 0.30 : 0, x.elements(ElementTag.Ice).source(SOURCE_E6))
    },

    finalizeCalculations: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
    },
    newGpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => '',
  }
}

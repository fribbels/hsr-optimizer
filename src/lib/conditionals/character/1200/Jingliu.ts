import { SKILL_DMG_TYPE, ULT_DMG_TYPE } from 'lib/conditionals/conditionalConstants'
import { gpuStandardAtkFinalizer, standardAtkFinalizer } from 'lib/conditionals/conditionalFinalizers'
import { AbilityEidolon, Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { buffAbilityDmg } from 'lib/optimization/calculateBuffs'
import { ComputedStatsArray, Source } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'
import { Eidolon } from 'types/character'

import { CharacterConditionalsController } from 'types/conditionals'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Jingliu')
  const { SOURCE_SKILL, SOURCE_ULT } = Source.character('Jingliu')
  const { basic, skill, ult, talent } = AbilityEidolon.ULT_TALENT_3_SKILL_BASIC_5

  const talentCrBuff = talent(e, 0.50, 0.52)
  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 2.00, 2.20)
  const skillEnhancedScaling = skill(e, 2.50, 2.75)
  const ultScaling = ult(e, 3.00, 3.24)

  let talentHpDrainAtkBuffMax = talent(e, 1.80, 1.98)
  talentHpDrainAtkBuffMax += (e >= 4) ? 0.30 : 0

  const defaults = {
    talentEnhancedState: true,
    talentHpDrainAtkBuff: talentHpDrainAtkBuffMax,
    e1CdBuff: true,
    e2SkillDmgBuff: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    talentEnhancedState: {
      id: 'talentEnhancedState',
      formItem: 'switch',
      text: t('Content.talentEnhancedState.text'),
      content: t('Content.talentEnhancedState.content', { talentCrBuff: TsUtils.precisionRound(100 * talentCrBuff) }),
    },
    talentHpDrainAtkBuff: {
      id: 'talentHpDrainAtkBuff',
      formItem: 'slider',
      text: t('Content.talentHpDrainAtkBuff.text'),
      content: t('Content.talentHpDrainAtkBuff.content', { talentHpDrainAtkBuffMax: TsUtils.precisionRound(100 * talentHpDrainAtkBuffMax) }),
      min: 0,
      max: talentHpDrainAtkBuffMax,
      percent: true,
    },
    e1CdBuff: {
      id: 'e1CdBuff',
      formItem: 'switch',
      text: t('Content.e1CdBuff.text'),
      content: t('Content.e1CdBuff.content'),
      disabled: e < 1,
    },
    e2SkillDmgBuff: {
      id: 'e2SkillDmgBuff',
      formItem: 'switch',
      text: t('Content.e2SkillDmgBuff.text'),
      content: t('Content.e2SkillDmgBuff.content'),
      disabled: e < 2,
    },
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // Skills
      x.CR.buff((r.talentEnhancedState) ? talentCrBuff : 0, Source.NONE)
      x.ATK_P.buff((r.talentEnhancedState) ? r.talentHpDrainAtkBuff : 0, Source.NONE)

      // Traces
      x.RES.buff((r.talentEnhancedState) ? 0.35 : 0, Source.NONE)

      r.talentEnhancedState && buffAbilityDmg(x, ULT_DMG_TYPE, 0.20, Source.NONE)

      // Eidolons
      x.CD.buff((e >= 1 && r.e1CdBuff) ? 0.24 : 0, Source.NONE)
      x.CD.buff((e >= 6 && r.talentEnhancedState) ? 0.50 : 0, Source.NONE)

      // Scaling
      x.BASIC_SCALING.buff(basicScaling, Source.NONE)

      x.SKILL_SCALING.buff((r.talentEnhancedState) ? skillEnhancedScaling : skillScaling, Source.NONE)
      x.SKILL_SCALING.buff((e >= 1 && r.talentEnhancedState && (context.enemyCount ?? context.enemyCount) == 1) ? 1 : 0, Source.NONE)

      x.ULT_SCALING.buff(ultScaling, Source.NONE)
      x.ULT_SCALING.buff((e >= 1 && (context.enemyCount ?? context.enemyCount) == 1) ? 1 : 0, Source.NONE)

      x.FUA_SCALING.buff(0, Source.NONE)

      // BOOST
      buffAbilityDmg(x, SKILL_DMG_TYPE, (e >= 2 && r.talentEnhancedState && r.e2SkillDmgBuff) ? 0.80 : 0, Source.NONE)

      x.BASIC_TOUGHNESS_DMG.buff(30, Source.NONE)
      x.SKILL_TOUGHNESS_DMG.buff(60, Source.NONE)
      x.ULT_TOUGHNESS_DMG.buff(60, Source.NONE)

      return x
    },
    finalizeCalculations: (x: ComputedStatsArray) => standardAtkFinalizer(x),
    gpuFinalizeCalculations: () => gpuStandardAtkFinalizer(),
  }
}

import { Stats } from 'lib/constants'
import { AbilityEidolon, gpuStandardAtkFinalizer, standardAtkFinalizer } from 'lib/conditionals/conditionalUtils'
import { ComputedStatsObject, SKILL_TYPE, ULT_TYPE } from 'lib/conditionals/conditionalConstants'
import { Eidolon } from 'types/Character'
import { ContentItem } from 'types/Conditionals'
import { CharacterConditional, CharacterConditionalMap } from 'types/CharacterConditional'
import { Form } from 'types/Form'
import { buffAbilityDmg } from 'lib/optimizer/calculateBuffs'
import i18next from 'i18next'
import { TsUtils } from 'lib/TsUtils'

export default (e: Eidolon, withoutContent: boolean): CharacterConditional => {
  const { basic, skill, ult, talent } = AbilityEidolon.ULT_TALENT_3_SKILL_BASIC_5

  const talentCrBuff = talent(e, 0.50, 0.52)
  let talentHpDrainAtkBuffMax = talent(e, 1.80, 1.98)
  talentHpDrainAtkBuffMax += (e >= 4) ? 0.30 : 0
  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 2.00, 2.20)
  const skillEnhancedScaling = skill(e, 2.50, 2.75)
  const ultScaling = ult(e, 3.00, 3.24)

  const content: ContentItem[] = (() => {
    if (withoutContent) return []
    const t = i18next.getFixedT(null, 'conditionals', 'Characters.Jingliu.Content')
    return [
      {
        name: 'talentEnhancedState',
        id: 'talentEnhancedState',
        formItem: 'switch',
        text: t('talentEnhancedState.text'),
        title: t('talentEnhancedState.title'),
        content: t('talentEnhancedState.content', { talentCrBuff: TsUtils.precisionRound(100 * talentCrBuff) }),
      },
      {
        name: 'talentHpDrainAtkBuff',
        id: 'talentHpDrainAtkBuff',
        formItem: 'slider',
        text: t('talentHpDrainAtkBuff.text'),
        title: t('talentHpDrainAtkBuff.title'),
        content: t('talentHpDrainAtkBuff.content', { talentHpDrainAtkBuffMax: TsUtils.precisionRound(100 * talentHpDrainAtkBuffMax) }),
        min: 0,
        max: talentHpDrainAtkBuffMax,
        percent: true,
      },
      {
        id: 'e1CdBuff',
        name: 'e1CdBuff',
        formItem: 'switch',
        text: t('e1CdBuff.text'),
        title: t('e1CdBuff.title'),
        content: t('e1CdBuff.content'),
        disabled: e < 1,
      },
      {
        id: 'e2SkillDmgBuff',
        name: 'e2SkillDmgBuff',
        formItem: 'switch',
        text: t('e2SkillDmgBuff.text'),
        title: t('e2SkillDmgBuff.title'),
        content: t('e2SkillDmgBuff.content'),
        disabled: e < 2,
      },
    ]
  })()

  return {
    content: () => content,
    teammateContent: () => [],
    defaults: () => ({
      talentEnhancedState: true,
      talentHpDrainAtkBuff: talentHpDrainAtkBuffMax,
      e1CdBuff: true,
      e2SkillDmgBuff: true,
    }),
    teammateDefaults: () => ({}),
    precomputeEffects: (x: ComputedStatsObject, request: Form) => {
      const r: CharacterConditionalMap = request.characterConditionals

      // Skills
      x[Stats.CR] += (r.talentEnhancedState) ? talentCrBuff : 0
      x[Stats.ATK_P] += ((r.talentEnhancedState) ? r.talentHpDrainAtkBuff : 0)

      // Traces
      x[Stats.RES] += (r.talentEnhancedState) ? 0.35 : 0
      buffAbilityDmg(x, ULT_TYPE, 0.20, (r.talentEnhancedState))

      // Eidolons
      x[Stats.CD] += (e >= 1 && r.e1CdBuff) ? 0.24 : 0
      x[Stats.CD] += (e >= 6 && r.talentEnhancedState) ? 0.50 : 0

      // Scaling
      x.BASIC_SCALING += basicScaling

      x.SKILL_SCALING += (r.talentEnhancedState) ? skillEnhancedScaling : skillScaling
      x.SKILL_SCALING += (e >= 1 && r.talentEnhancedState && request.enemyCount == 1) ? 1 : 0

      x.ULT_SCALING += ultScaling
      x.ULT_SCALING += (e >= 1 && request.enemyCount == 1) ? 1 : 0

      x.FUA_SCALING += 0

      // BOOST
      buffAbilityDmg(x, SKILL_TYPE, 0.80, (e >= 2 && r.talentEnhancedState && r.e2SkillDmgBuff))

      x.BASIC_TOUGHNESS_DMG += 30
      x.SKILL_TOUGHNESS_DMG += 60
      x.ULT_TOUGHNESS_DMG += 60

      return x
    },
    precomputeMutualEffects: (_x: ComputedStatsObject, _request: Form) => {
    },
    finalizeCalculations: (x: ComputedStatsObject) => standardAtkFinalizer(x),
    gpuFinalizeCalculations: () => gpuStandardAtkFinalizer(),
  }
}

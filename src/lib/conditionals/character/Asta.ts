import { Stats } from 'lib/constants'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import { AbilityEidolon, findContentId, gpuStandardAtkFinalizer, standardAtkFinalizer } from 'lib/conditionals/conditionalUtils'

import { Eidolon } from 'types/Character'
import { CharacterConditional } from 'types/CharacterConditional'
import { ContentItem } from 'types/Conditionals'
import { TsUtils } from 'lib/TsUtils'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (e: Eidolon, withContent: boolean): CharacterConditional => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Asta')
  const { basic, skill, ult, talent } = AbilityEidolon.SKILL_TALENT_3_ULT_BASIC_5

  const ultSpdBuffValue = ult(e, 50, 52.8)
  const talentStacksAtkBuff = talent(e, 0.14, 0.154)
  const talentStacksDefBuff = 0.06
  const skillExtraDmgHitsMax = (e >= 1) ? 5 : 4

  const basicScaling = basic(e, 1.0, 1.1)
  const skillScaling = skill(e, 0.50, 0.55)
  const ultScaling = ult(e, 0, 0)
  const dotScaling = basic(e, 0.50, 0.55)

  const content: ContentItem[] = [
    {
      formItem: 'slider',
      id: 'skillExtraDmgHits',
      name: 'skillExtraDmgHits',
      text: t('Content.skillExtraDmgHits.text'),
      title: t('Content.skillExtraDmgHits.title'),
      content: t('Content.skillExtraDmgHits.content', { skillExtraDmgHitsMax }),
      min: 0,
      max: skillExtraDmgHitsMax,
    },
    {
      formItem: 'slider',
      id: 'talentBuffStacks',
      name: 'talentBuffStacks',
      text: t('Content.talentBuffStacks.text'),
      title: t('Content.talentBuffStacks.title'),
      content: t('Content.talentBuffStacks.content', { talentStacksAtkBuff: TsUtils.precisionRound(100 * talentStacksAtkBuff) }),
      min: 0,
      max: 5,
    },
    {
      formItem: 'switch',
      id: 'ultSpdBuff',
      name: 'ultSpdBuff',
      text: t('Content.ultSpdBuff.text'),
      title: t('Content.ultSpdBuff.title'),
      content: t('Content.ultSpdBuff.content', { ultSpdBuffValue }),
    },
    {
      formItem: 'switch',
      id: 'fireDmgBoost',
      name: 'fireDmgBoost',
      text: t('Content.fireDmgBoost.text'),
      title: t('Content.fireDmgBoost.title'),
      content: t('Content.fireDmgBoost.content'),
    },
  ]

  const teammateContent: ContentItem[] = [
    findContentId(content, 'talentBuffStacks'),
    findContentId(content, 'ultSpdBuff'),
    findContentId(content, 'fireDmgBoost'),
  ]

  return {
    content: () => content,
    teammateContent: () => teammateContent,
    defaults: () => ({
      talentBuffStacks: 5,
      skillExtraDmgHits: skillExtraDmgHitsMax,
      ultSpdBuff: true,
      fireDmgBoost: true,
    }),
    teammateDefaults: () => ({
      talentBuffStacks: 5,
      ultSpdBuff: true,
      fireDmgBoost: true,
    }),
    precomputeEffects: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals

      // Stats
      x[Stats.DEF_P] += (r.talentBuffStacks) * talentStacksDefBuff
      x[Stats.ERR] += (e >= 4 && r.talentBuffStacks >= 2) ? 0.15 : 0

      // Scaling
      x.BASIC_SCALING += basicScaling
      x.SKILL_SCALING += skillScaling + r.skillExtraDmgHits * skillScaling
      x.ULT_SCALING += ultScaling
      x.DOT_SCALING += dotScaling

      x.BASIC_TOUGHNESS_DMG += 30
      x.SKILL_TOUGHNESS_DMG += 30 + 15 * r.skillExtraDmgHits

      x.DOT_CHANCE = 0.8

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals

      x[Stats.SPD] += (m.ultSpdBuff) ? ultSpdBuffValue : 0
      x[Stats.ATK_P] += (m.talentBuffStacks) * talentStacksAtkBuff

      x[Stats.Fire_DMG] += (m.fireDmgBoost) ? 0.18 : 0
    },
    finalizeCalculations: (x: ComputedStatsObject) => standardAtkFinalizer(x),
    gpuFinalizeCalculations: () => gpuStandardAtkFinalizer(),
  }
}

import { Stats } from 'lib/constants'
import { BASIC_TYPE, ComputedStatsObject, SKILL_TYPE, ULT_TYPE } from 'lib/conditionals/conditionalConstants'
import { AbilityEidolon, findContentId } from 'lib/conditionals/conditionalUtils'

import { Eidolon } from 'types/Character'
import { CharacterConditional } from 'types/CharacterConditional'
import { ContentItem } from 'types/Conditionals'
import { buffAbilityDmg } from 'lib/optimizer/calculateBuffs'
import { wgslTrue } from 'lib/gpu/injection/wgslUtils'
import { TsUtils } from 'lib/TsUtils'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (e: Eidolon, withContent: boolean): CharacterConditional => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Pela')
  const { basic, skill, ult } = AbilityEidolon.SKILL_BASIC_3_ULT_TALENT_5

  const ultDefPenValue = ult(e, 0.40, 0.42)

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 2.10, 2.31)
  const ultScaling = ult(e, 1.00, 1.08)

  const content: ContentItem[] = [{
    formItem: 'switch',
    id: 'teamEhrBuff',
    name: 'teamEhrBuff',
    text: t('Content.teamEhrBuff.text'),
    title: t('Content.teamEhrBuff.title'),
    content: t('Content.teamEhrBuff.content'),
  }, {
    formItem: 'switch',
    id: 'enemyDebuffed',
    name: 'enemyDebuffed',
    text: t('Content.enemyDebuffed.text'),
    title: t('Content.enemyDebuffed.title'),
    content: t('Content.enemyDebuffed.content'),
  }, {
    formItem: 'switch',
    id: 'skillRemovedBuff',
    name: 'skillRemovedBuff',
    text: t('Content.skillRemovedBuff.text'),
    title: t('Content.skillRemovedBuff.title'),
    content: t('Content.skillRemovedBuff.content'),
  }, {
    formItem: 'switch',
    id: 'ultDefPenDebuff',
    name: 'ultDefPenDebuff',
    text: t('Content.ultDefPenDebuff.text'),
    title: t('Content.ultDefPenDebuff.title'),
    content: t('Content.ultDefPenDebuff.content', { ultDefPenValue: TsUtils.precisionRound(100 * ultDefPenValue) }),
  }, {
    formItem: 'switch',
    id: 'e4SkillResShred',
    name: 'e4SkillResShred',
    text: t('Content.e4SkillResShred.text'),
    title: t('Content.e4SkillResShred.title'),
    content: t('Content.e4SkillResShred.content'),
    disabled: e < 4,
  }]

  const teammateContent: ContentItem[] = [
    findContentId(content, 'teamEhrBuff'),
    findContentId(content, 'ultDefPenDebuff'),
    findContentId(content, 'e4SkillResShred'),
  ]

  return {
    content: () => content,
    teammateContent: () => teammateContent,
    defaults: () => ({
      teamEhrBuff: true,
      enemyDebuffed: true,
      skillRemovedBuff: false,
      ultDefPenDebuff: true,
      e4SkillResShred: true,
    }),
    teammateDefaults: () => ({
      teamEhrBuff: true,
      ultDefPenDebuff: true,
      e4SkillResShred: true,
    }),
    precomputeEffects: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals

      // Stats
      x[Stats.SPD_P] += (e >= 2 && r.skillRemovedBuff) ? 0.10 : 0

      // Scaling
      x.BASIC_SCALING += basicScaling
      x.SKILL_SCALING += skillScaling
      x.ULT_SCALING += ultScaling

      buffAbilityDmg(x, BASIC_TYPE | SKILL_TYPE | ULT_TYPE, 0.20, (r.skillRemovedBuff))
      x.ELEMENTAL_DMG += (r.enemyDebuffed) ? 0.20 : 0

      x.BASIC_TOUGHNESS_DMG += 30
      x.SKILL_TOUGHNESS_DMG += 60
      x.ULT_TOUGHNESS_DMG += 60

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.characterConditionals

      x[Stats.EHR] += (m.teamEhrBuff) ? 0.10 : 0

      x.DEF_PEN += (m.ultDefPenDebuff) ? ultDefPenValue : 0
      x.ICE_RES_PEN += (e >= 4 && m.e4SkillResShred) ? 0.12 : 0
    },
    finalizeCalculations: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      x.BASIC_DMG += x.BASIC_SCALING * x[Stats.ATK]
      x.SKILL_DMG += x.SKILL_SCALING * x[Stats.ATK]
      x.ULT_DMG += x.ULT_SCALING * x[Stats.ATK]

      x.BASIC_DMG += (e >= 6) ? 0.40 * x[Stats.ATK] : 0
      x.SKILL_DMG += (e >= 6) ? 0.40 * x[Stats.ATK] : 0
      x.ULT_DMG += (e >= 6) ? 0.40 * x[Stats.ATK] : 0
    },
    gpuFinalizeCalculations: () => {
      return `
x.BASIC_DMG += x.BASIC_SCALING * x.ATK;
x.SKILL_DMG += x.SKILL_SCALING * x.ATK;
x.ULT_DMG += x.ULT_SCALING * x.ATK;

if (${wgslTrue(e >= 6)}) {
  x.BASIC_DMG += 0.40 * x.ATK;
  x.SKILL_DMG += 0.40 * x.ATK;
  x.ULT_DMG += 0.40 * x.ATK;
}
    `
    },
  }
}

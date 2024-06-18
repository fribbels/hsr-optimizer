import { baseComputedStatsObject, ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import { AbilityEidolon } from 'lib/conditionals/utils'

import { Eidolon } from 'types/Character'
import { CharacterConditional, PrecomputedCharacterConditional } from 'types/CharacterConditional'
import { Form } from 'types/Form'
import { ContentItem } from 'types/Conditionals'
import { BETA_UPDATE, Stats } from 'lib/constants'

export default (e: Eidolon): CharacterConditional => {
  const { basic, skill, ult, talent } = AbilityEidolon.SKILL_BASIC_3_ULT_TALENT_5

  const basicScaling = basic(e, 1.00, 1.10)
  const basicEnhancedScaling = basic(e, 1.00, 1.10)
  const ultScaling = ult(e, 2.40, 2.592)
  const talentDmgBuff = talent(e, 0.80, 0.88)
  const skillSpdScaling = skill(e, 0.10, 0.108)

  const toughnessReductionPaths = {
    Harmony: true,
    Nihility: true,
    Preservation: true,
    Abundance: true,
  }

  const content: ContentItem[] = [
    {
      formItem: 'switch',
      id: 'enhancedBasic',
      name: 'enhancedBasic',
      text: 'Enhanced basic',
      title: 'Enhanced basic',
      content: BETA_UPDATE,
    },
    {
      formItem: 'slider',
      id: 'basicAttackHits',
      name: 'basicAttackHits',
      text: `Enhanced basic hits`,
      title: 'Enhanced basic hits',
      content: BETA_UPDATE,
      min: 3,
      max: 6,
    },
    {
      formItem: 'switch',
      id: 'talentDmgBuff',
      name: 'talentDmgBuff',
      text: 'Talent DMG buff',
      title: 'Talent DMG buff',
      content: BETA_UPDATE,
    },
    {
      formItem: 'switch',
      id: 'selfSpdBuff',
      name: 'selfSpdBuff',
      text: 'Self SPD buff',
      title: 'Self SPD buff',
      content: BETA_UPDATE,
    },
    {
      formItem: 'switch',
      id: 'e1EnhancedBasicCdBuff',
      name: 'e1EnhancedBasicCdBuff',
      text: 'E1 basic CD buff',
      title: 'E1 basic CD buff',
      content: BETA_UPDATE,
      disabled: e < 1,
    },
  ]

  const teammateContent: ContentItem[] = [
    {
      formItem: 'switch',
      id: 'masterBuff',
      name: 'masterBuff',
      text: 'Master buff',
      title: 'Master buff',
      content: BETA_UPDATE,
    },
    {
      formItem: 'switch',
      id: 'e6MasterBuffs',
      name: 'e6MasterBuffs',
      text: 'E6 master buffs',
      title: 'E6 master buffs',
      content: BETA_UPDATE,
      disabled: e < 6,
    },
  ]

  const defaults = {
    enhancedBasic: true,
    talentDmgBuff: true,
    selfSpdBuff: true,
    basicAttackHits: 6,
    e1EnhancedBasicCdBuff: true,
  }

  const teammateDefaults = {
    masterBuff: true,
    e6MasterBuff: true,
  }

  return {
    content: () => content,
    teammateContent: () => teammateContent,
    defaults: () => (defaults),
    teammateDefaults: () => (teammateDefaults),
    precomputeEffects: (request: Form) => {
      const r = request.characterConditionals
      const x = Object.assign({}, baseComputedStatsObject)

      x[Stats.SPD_P] += (r.selfSpdBuff) ? 0.10 : 0
      x.BASIC_BOOST += (r.talentDmgBuff) ? talentDmgBuff : 0

      x.BASIC_CD_BOOST += (e >= 1 && r.e1EnhancedBasicCdBuff && r.enhancedBasic) ? 0.36 : 0

      x.BASIC_SCALING += (r.enhancedBasic) ? basicEnhancedScaling * r.basicAttackHits : basicScaling
      x.ULT_SCALING += ultScaling
      x.FUA_SCALING += (e >= 2) ? 0.60 : 0

      x.BASIC_TOUGHNESS_DMG += (r.enhancedBasic) ? 15 * r.basicAttackHits : 30
      x.ULT_TOUGHNESS_DMG += 90

      return x
    },
    precomputeMutualEffects: (_x: ComputedStatsObject, _request: Form) => {
    },
    precomputeTeammateEffects: (x: ComputedStatsObject, request: Form) => {
      const t = request.characterConditionals

      x[Stats.SPD_P] += (t.masterBuff) ? skillSpdScaling : 0
      x.ULT_TOUGHNESS_DMG += (toughnessReductionPaths[request.path ?? '']) ? 1.00 : 0

      x[Stats.CD] += (e >= 6 && t.masterBuff && t.e6MasterBuffs) ? 0.60 : 0
      x[Stats.BE] += (e >= 6 && t.masterBuff && t.e6MasterBuffs) ? 0.36 : 0
    },
    calculateBaseMultis: (c: PrecomputedCharacterConditional, request: Form) => {
      const r = request.characterConditionals
      const x: ComputedStatsObject = c.x

      x.BASIC_DMG += x.BASIC_SCALING * x[Stats.ATK]
      x.SKILL_DMG += x.SKILL_SCALING * x[Stats.ATK]
      x.ULT_DMG += x.ULT_SCALING * x[Stats.ATK]
      x.FUA_DMG += x.FUA_SCALING * x[Stats.ATK]
    },
  }
}

import { Stats } from 'lib/constants'
import { baseComputedStatsObject, ComputedStatsObject } from 'lib/conditionals/conditionalConstants.ts'
import { AbilityEidolon, findContentId, precisionRound } from 'lib/conditionals/utils'

import { Eidolon } from 'types/Character'
import { CharacterConditional, PrecomputedCharacterConditional } from 'types/CharacterConditional'
import { Form } from 'types/Form'
import { ContentItem } from 'types/Conditionals'

export default (e: Eidolon): CharacterConditional => {
  const { basic, skill, ult, talent } = AbilityEidolon.SKILL_BASIC_3_ULT_TALENT_5

  const dotVulnerabilityValue = ult(e, 0.30, 0.32)

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 0.56, 0.616)
  const ultScaling = ult(e, 1.60, 1.728)
  const dotScaling = talent(e, 0.52, 0.572)

  const maxExtraHits = e < 1 ? 4 : 5

  const content: ContentItem[] = [{
    formItem: 'switch',
    id: 'targetDotTakenDebuff',
    name: 'targetDotTakenDebuff',
    text: 'Ult DoT taken debuff',
    title: 'Ult Dot taken debuff',
    content: `When debuffed by Sampo's Ultimate, increase the targets' DoT taken by ${precisionRound(dotVulnerabilityValue * 100)}% for 2 turn(s).`,
  }, {
    formItem: 'slider',
    id: 'skillExtraHits',
    name: 'skillExtraHits',
    text: 'Skill extra hits',
    title: 'Skill extra hits',
    content: `Number of extra hits from Skill.`,
    min: 1,
    max: maxExtraHits,
  }, {
    formItem: 'switch',
    id: 'targetWindShear',
    name: 'targetWindShear',
    text: 'Target has wind shear',
    title: 'Target has wind shear',
    content: `Enemies with Wind Shear effect deal 15% less damage to Sampo.`,
  }]

  const teammateContent: ContentItem[] = [
    findContentId(content, 'targetDotTakenDebuff'),
  ]

  return {
    content: () => content,
    teammateContent: () => teammateContent,
    defaults: () => ({
      targetDotTakenDebuff: true,
      skillExtraHits: maxExtraHits,
      targetWindShear: true,
    }),
    teammateDefaults: () => ({
      targetDotTakenDebuff: true,
    }),
    precomputeEffects: (request: Form) => {
      const r = request.characterConditionals
      const x = Object.assign({}, baseComputedStatsObject)

      // Stats

      // Scaling
      x.BASIC_SCALING += basicScaling
      x.SKILL_SCALING += skillScaling
      x.SKILL_SCALING += (r.skillExtraHits) * skillScaling
      x.ULT_SCALING += ultScaling
      x.DOT_SCALING += dotScaling
      x.DOT_SCALING += (e >= 6) ? 0.15 : 0

      // Boost
      x.DMG_RED_MULTI *= (r.targetWindShear) ? (1 - 0.15) : 1

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsObject, request: Form) => {
      const m = request.characterConditionals

      x.DOT_VULNERABILITY += (m.targetDotTakenDebuff) ? dotVulnerabilityValue : 0
    },
    calculateBaseMultis: (c: PrecomputedCharacterConditional) => {
      const x = c.x

      x.BASIC_DMG += x.BASIC_SCALING * x[Stats.ATK]
      x.SKILL_DMG += x.SKILL_SCALING * x[Stats.ATK]
      x.ULT_DMG += x.ULT_SCALING * x[Stats.ATK]
      x.DOT_DMG += x.DOT_SCALING * x[Stats.ATK]
    },
  }
}

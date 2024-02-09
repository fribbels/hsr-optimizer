import { Stats } from 'lib/constants'
import { baseComputedStatsObject } from 'lib/conditionals/constants'
import { basic, precisionRound, skill, talent, ult } from 'lib/conditionals/utils'

import { Eidolon } from 'types/Character'
import { CharacterConditional, PrecomputedCharacterConditional } from 'types/CharacterConditional'
import { Form } from 'types/Form'
import { ContentItem } from 'types/Conditionals'

export default (e: Eidolon): CharacterConditional => {
  const arcanaStackMultiplier = talent(e, 0.12, 0.132)
  const epiphanyDmgTakenBoost = ult(e, 0.25, 0.27)
  const defShredValue = skill(e, 0.208, 0.22)

  const basicScaling = basic(e, 0.60, 0.66)
  const skillScaling = skill(e, 0.90, 0.99)
  const ultScaling = ult(e, 1.20, 1.30)
  const dotScaling = talent(e, 2.40, 2.64)

  const content: ContentItem[] = [{
    formItem: 'switch',
    id: 'epiphanyDebuff',
    name: 'epiphanyDebuff',
    text: 'Epiphany debuff',
    title: 'Epiphany debuff',
    content: `Enemies affected by Epiphany take ${precisionRound(epiphanyDmgTakenBoost * 100)}% more DMG in their turn.`,
  }, {
    formItem: 'switch',
    id: 'defDecreaseDebuff',
    name: 'defDecreaseDebuff',
    text: 'Def decrease debuff',
    title: 'Skill def decrease debuff',
    content: `Enemies DEF is decreased by ${precisionRound(defShredValue * 100)}%.`,
  }, {
    formItem: 'slider',
    id: 'arcanaStacks',
    name: 'arcanaStacks',
    text: 'Arcana stacks',
    title: 'Arcana stacks',
    content: `While afflicted with Arcana, enemy targets receive Wind DoT equal to ${precisionRound(dotScaling * 100)}% of Black Swan's ATK at the start of each turn. Each stack of Arcana increases this DoT DMG multiplier by ${precisionRound(arcanaStackMultiplier * 100)}%. Arcana can stack up to 50 times. 
    ::BR::
When there are 3 or more Arcana stacks, deals Wind DoT to adjacent targets. When there are 7 or more Arcana stacks, enables the current DoT dealt this time to ignore 20% of the target's and adjacent targets' DEF.`,
    min: 0,
    max: 50,
  }, {
    formItem: 'switch',
    id: 'e1ResReduction',
    name: 'e1ResReduction',
    text: 'E1 RES reduction',
    title: 'E1 RES reduction',
    content: `E1: While Black Swan is active in battle, enemies afflicted with Wind Shear, Bleed, Burn, or Shock will have their corresponding Wind, Physical, Fire, or Lightning RES respectively reduced by 25%.`,
    disabled: e < 1,
  }]

  return {
    content: () => content,
    defaults: () => ({
      epiphanyDebuff: true,
      defDecreaseDebuff: true,
      arcanaStacks: 7,
      e1ResReduction: true,
    }),
    precomputeEffects: (request: Form) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const r = request.characterConditionals
      const x = Object.assign({}, baseComputedStatsObject)

      x.BASIC_SCALING += basicScaling
      x.SKILL_SCALING += skillScaling
      x.ULT_SCALING += ultScaling
      x.DOT_SCALING += dotScaling + arcanaStackMultiplier * r.arcanaStacks

      x.DOT_DEF_PEN += (r.arcanaStacks >= 7) ? 0.20 : 0
      x.DEF_SHRED += (r.defDecreaseDebuff) ? defShredValue : 0
      x.DOT_VULNERABILITY += (r.epiphanyDebuff) ? epiphanyDmgTakenBoost : 0

      x.RES_PEN += (e >= 1 && r.e1ResReduction) ? 0.25 : 0

      return x
    },
    calculateBaseMultis: (c: PrecomputedCharacterConditional) => {
      const x = c['x']

      x.ELEMENTAL_DMG += Math.min(0.72, 0.60 * x[Stats.EHR])

      x.BASIC_DMG += x.BASIC_SCALING * x[Stats.ATK]
      x.SKILL_DMG += x.SKILL_SCALING * x[Stats.ATK]
      x.ULT_DMG += x.ULT_SCALING * x[Stats.ATK]
      x.DOT_DMG += x.DOT_SCALING * x[Stats.ATK]
    },
  }
}

import { Stats } from 'lib/constants'
import { baseComputedStatsObject } from 'lib/conditionals/constants'
import { basicRev, precisionRound, skillRev, ultRev } from 'lib/conditionals/utils'

import { Eidolon } from 'types/Character'
import { ContentItem } from 'types/Conditionals'
import { CharacterConditional } from 'types/CharacterConditional'

export default (e: Eidolon): CharacterConditional => {
  const basicEnhancedHitValue = basicRev(e, 0.20, 0.22)
  const targetUltDebuffDmgTakenValue = ultRev(e, 0.20, 0.216)

  const basicScaling = basicRev(e, 1.00, 1.10)
  const basicEnhancedScaling = basicRev(e, 0.20 * 3 + 0.80, 0.22 * 3 + 0.88)
  const skillScaling = skillRev(e, 1.20, 1.32)
  const ultScaling = ultRev(e, 3.30, 3.564)
  const dotScaling = skillRev(e, 3.38, 3.718)

  const content: ContentItem[] = [{
    formItem: 'switch',
    id: 'basicEnhanced',
    name: 'basicEnhanced',
    text: 'Basic enhanced',
    title: 'Basic enhanced: Sky-Shatter Fist',
    content: `Enhances Basic ATK to deal additional damage, and has a chance to trigger extra hits.`,
  }, {
    formItem: 'switch',
    id: 'targetUltDebuffed',
    name: 'targetUltDebuffed',
    text: 'Target ult debuffed',
    title: 'Target ult debuffed',
    content: `Increase the target's DMG received by ${precisionRound(targetUltDebuffDmgTakenValue * 100)}% for 3 turn(s)`,
  }, {
    formItem: 'slider',
    id: 'basicEnhancedExtraHits',
    name: 'basicEnhancedExtraHits',
    text: 'Enhanced basic extra hits',
    title: 'Enhanced basic extra hits',
    content: `Increases the number of hits of Basic Enhanced.`,
    min: 0,
    max: 3,
  }, {
    formItem: 'switch',
    id: 'e1TargetBleeding',
    name: 'e1TargetBleeding',
    text: 'E1 target bleeding',
    title: 'E1 target bleeding',
    content: `E1: When Luka takes action, if the target enemy is Bleeding, increases DMG dealt by Luka by 15% for 2 turn(s).`,
    disabled: e < 1,
  }, {
    formItem: 'slider',
    id: 'e4TalentStacks',
    name: 'e4TalentStacks',
    text: 'E4 talent stacks',
    title: 'E4 talent stacks',
    content: `E4: For every stack of Fighting Will obtained, increases ATK by 5%, stacking up to 4 time(s).`,
    min: 0,
    max: 4,
    disabled: e < 4,
  }]

  return {
    content: () => content,
    defaults: () => ({
      basicEnhanced: true,
      targetUltDebuffed: true,
      e1TargetBleeding: true,
      basicEnhancedExtraHits: 3,
      e4TalentStacks: 4,
    }),
    precomputeEffects: (request) => {
      const r = request.characterConditionals
      const x = Object.assign({}, baseComputedStatsObject)

      // Stats
      x[Stats.ATK_P] += (e >= 4) ? r.e4TalentStacks * 0.05 : 0

      // Scaling
      x.BASIC_SCALING += (r.basicEnhanced) ? basicEnhancedScaling : basicScaling
      x.BASIC_SCALING += (r.basicEnhanced && r.basicEnhancedExtraHits) * basicEnhancedHitValue
      x.SKILL_SCALING += skillScaling
      x.ULT_SCALING += ultScaling
      x.DOT_SCALING += dotScaling

      // Boost
      x.DMG_TAKEN_MULTI += (r.targetUltDebuffed) ? targetUltDebuffDmgTakenValue : 0
      x.ELEMENTAL_DMG += (e >= 1 && r.e1TargetBleeding) ? 0.15 : 0

      return x
    },
    calculateBaseMultis: (c) => {
      const x = c.x

      x.BASIC_DMG += x.BASIC_SCALING * x[Stats.ATK]
      x.SKILL_DMG += x.SKILL_SCALING * x[Stats.ATK]
      x.ULT_DMG += x.ULT_SCALING * x[Stats.ATK]
      x.DOT_DMG += x.DOT_SCALING * x[Stats.ATK]
      // x.FUA_DMG += 0
    },
  }
}

import { Stats } from 'lib/constants'
import { baseComputedStatsObject } from 'lib/conditionals/constants'
import { basicRev, precisionRound, skillRev, ultRev } from 'lib/conditionals/utils'
import { ContentItem } from 'types/Conditionals'
import { Eidolon } from 'types/Character'
import { CharacterConditional } from 'types/CharacterConditional'

// TODO: Missing E1 dmg
export default (e: Eidolon): CharacterConditional => {
  const skillDamageReductionValue = skillRev(e, 0.50, 0.52)

  const basicAtkScaling = basicRev(e, 1.00, 1.10)
  const basicDefScaling = (e >= 1) ? 0.25 : 0
  const basicEnhancedAtkScaling = basicRev(e, 1.35, 1.463)
  const basicEnhancedDefScaling = (e >= 1) ? 0.50 : 0
  const skillScaling = skillRev(e, 0, 0)
  const ultAtkScaling = ultRev(e, 1.00, 1.10)
  const ultDefScaling = ultRev(e, 1.50, 1.65)

  const content: ContentItem[] = [{
    formItem: 'switch',
    id: 'enhancedBasic',
    name: 'enhancedBasic',
    text: 'Enhanced basic',
    title: `Enhanced basic`,
    content: `Enhanced basic ATK deals Fire DMG equal to ${precisionRound(basicEnhancedAtkScaling * 100)}% of the Trailblazer's ATK to a single enemy, and reduced damage to adjacent enemies.`,
  }, {
    formItem: 'switch',
    id: 'skillActive',
    name: 'skillActive',
    text: 'Skill active',
    title: `Skill active`,
    content: `When the Skill is used, reduces DMG taken by ${precisionRound(skillDamageReductionValue * 100)}%. Also reduces DMG taken by all allies by 15% for 1 turn.`,
  }, {
    formItem: 'switch',
    id: 'shieldActive',
    name: 'shieldActive',
    text: 'Shield active',
    title: 'Shield active',
    content: `When the shield is active, increases ATK by 15%.`,
  }, {
    formItem: 'slider',
    id: 'e6DefStacks',
    name: 'e6DefStacks',
    text: 'E6 def stacks',
    title: 'E6 def stacks: Increases DEF by 10%',
    content: `E6: Increases DEF by 10% per stack.`,
    min: 0,
    max: 3,
    disabled: e < 6,
  }]

  return {
    content: () => content,
    defaults: () => ({
      enhancedBasic: true,
      skillActive: true,
      shieldActive: true,
      e6DefStacks: 3,
    }),
    precomputeEffects: (request) => {
      const r = request.characterConditionals
      const x = Object.assign({}, baseComputedStatsObject)

      // Stats
      x[Stats.DEF_P] += (e >= 6) ? r.e6DefStacks * 0.10 : 0
      x[Stats.ATK_P] += (r.shieldActive) ? 0.15 : 0

      // Scaling
      x.SKILL_SCALING += skillScaling

      // Boost
      x.DMG_RED_MULTI *= (r.skillActive) ? (1 - skillDamageReductionValue) : 1
      x.DMG_RED_MULTI *= (r.skillActive) ? (1 - 0.15) : 1

      return x
    },
    calculateBaseMultis: (c, request) => {
      const r = request.characterConditionals
      const x = c.x

      if (r.enhancedBasic) {
        x.BASIC_DMG += basicEnhancedAtkScaling * x[Stats.ATK]
        x.BASIC_DMG += basicEnhancedDefScaling * x[Stats.DEF]
      } else {
        x.BASIC_DMG += basicAtkScaling * x[Stats.ATK]
        x.BASIC_DMG += basicDefScaling * x[Stats.DEF]
      }

      x.SKILL_DMG += x.SKILL_SCALING * x[Stats.ATK]
      x.ULT_DMG += ultAtkScaling * x[Stats.ATK]
      x.ULT_DMG += ultDefScaling * x[Stats.DEF]
    },
  }
}

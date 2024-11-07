import { SKILL_TYPE, ULT_TYPE } from 'lib/conditionals/conditionalConstants'
import { AbilityEidolon, Conditionals, ContentDefinition, standardHpHealFinalizer } from 'lib/conditionals/conditionalUtils'
import { wgslTrue } from 'lib/gpu/injection/wgslUtils'
import { ComputedStatsArray, Key, Source } from 'lib/optimizer/computedStatsArray'
import { TsUtils } from 'lib/TsUtils'
import { Eidolon } from 'types/Character'
import { CharacterConditional } from 'types/CharacterConditional'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (e: Eidolon, withContent: boolean): CharacterConditional => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Natasha')
  const tHeal = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Common.HealAbility')
  const { basic, skill, ult } = AbilityEidolon.SKILL_BASIC_3_ULT_TALENT_5

  const basicScaling = basic(e, 1.00, 1.10)

  const ultHealScaling = ult(e, 0.138, 0.1472)
  const ultHealFlat = ult(e, 368, 409.4)

  const skillHealScaling = skill(e, 0.105, 0.112)
  const skillHealFlat = skill(e, 280, 311.5)

  const content: ContentDefinition<typeof defaults> = {
    healAbility: {
      id: 'healAbility',
      formItem: 'select',
      text: tHeal('Text'),
      content: tHeal('Content'),
      options: [
        { display: tHeal('Skill'), value: SKILL_TYPE, label: tHeal('Skill') },
        { display: tHeal('Ult'), value: ULT_TYPE, label: tHeal('Ult') },
      ],
      fullWidth: true,
    },
  }

  const defaults = {
    healAbility: ULT_TYPE,
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r: Conditionals<typeof content> = action.characterConditionals

      x.OHB.buff(0.10, Source.NONE)

      x.BASIC_SCALING.buff(basicScaling, Source.NONE)

      x.BASIC_TOUGHNESS_DMG.buff(30, Source.NONE)

      if (r.healAbility == SKILL_TYPE) {
        x.HEAL_TYPE.set(SKILL_TYPE, Source.NONE)
        x.HEAL_SCALING.buff(skillHealScaling, Source.NONE)
        x.HEAL_FLAT.buff(skillHealFlat, Source.NONE)
      }
      if (r.healAbility == ULT_TYPE) {
        x.HEAL_TYPE.set(ULT_TYPE, Source.NONE)
        x.HEAL_SCALING.buff(ultHealScaling, Source.NONE)
        x.HEAL_FLAT.buff(ultHealFlat, Source.NONE)
      }

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
    },
    finalizeCalculations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      x.BASIC_DMG.buff(x.a[Key.BASIC_SCALING] * x.a[Key.ATK], Source.NONE)
      x.BASIC_DMG.buff((e >= 6) ? 0.40 * x.a[Key.HP] : 0, Source.NONE)

      standardHpHealFinalizer(x)
    },
    gpuFinalizeCalculations: () => {
      return `
x.BASIC_DMG += x.BASIC_SCALING * x.ATK;
x.HEAL_VALUE += x.HEAL_SCALING * x.HP + x.HEAL_FLAT;
if (${wgslTrue(e >= 6)}) {
  x.BASIC_DMG += 0.40 * x.HP;
}
`
    },
  }
}

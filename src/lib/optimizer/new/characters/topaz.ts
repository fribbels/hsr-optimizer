import { EarlyConditional } from '../stats/conditional'
import { HsrElement, Trait } from '../stats/context'
import { matchByTraits } from '../stats/matcher'
import { Modifiers } from '../stats/modifier'
import { PartialModifiableStats } from '../stats/stat'
import { StepBuilder } from '../step/builder'
import { StepScope } from '../step/formula'
import { Character, CharacterPreset, CharacterSteps, Eidolon } from './character'

type Metadata = {
  enemyProofOfDebtDebuff: boolean
  numbyEnhancedState: boolean
  e1DebtorStacks: 0 | 1 | 2
  fireWeakness: boolean
}

const DEFAULT: Metadata = {
  enemyProofOfDebtDebuff: true,
  numbyEnhancedState: true,
  e1DebtorStacks: 2,
  fireWeakness: true,
}

const proofOfDebtDebuff = new EarlyConditional(matchByTraits(Trait.FOLLOW_UP), {
  vulnerability: 0.5,
})

const NUMBY = 'Topaz-Numby-Enhanced State'
const numbyEnhancedStateBuff: PartialModifiableStats = {
  crit: {
    critDmg: 0.25,
  },
}

const numbyEnhancedStateBuffE6: PartialModifiableStats = {
  crit: {
    critDmg: 0.25,
  },
  res: -0.1,
}

export class Topaz extends Character<Metadata> {
  constructor(eid: Eidolon, metadata: Metadata = DEFAULT) {
    super(eid, metadata)

    if (metadata.enemyProofOfDebtDebuff) {
      this.modifiers.early.push(proofOfDebtDebuff)
      if (eid >= 1) {
        this.modifiers.early.push(this.e1DebtorDebuff())
      }
    }

    if (metadata.fireWeakness) {
      this.modifiers.unconditional.push({ dmgBoost: 0.15 })
    }
  }

  private modifiers: Modifiers = {
    early: [proofOfDebtDebuff],
    late: [],
    unconditional: [],
  }

  asTeammate: Modifiers = this.modifiers

  asOptiTarget: CharacterSteps[] = [{
    type: 'numby fua',
    modifiers: this.modifiers,
    steps: [this.numbyFuaStep()],
  }, {
    type: 'skill',
    modifiers: this.modifiers,
    steps: [this.skillFuaStep()],
  }]

  presets: CharacterPreset[] = []

  private e1DebtorDebuff() {
    return new EarlyConditional(matchByTraits(Trait.FOLLOW_UP), {
      crit: { critDmg: 0.25 * this.metadata.e1DebtorStacks },
    })
  }

  // It's possible to not duplicate it, but whatever
  private numbyFuaStep(): StepBuilder {
    const retVal = StepBuilder.damage(
      HsrElement.FIRE,
      [Trait.FOLLOW_UP],
      this.metadata.numbyEnhancedState ? 3 : 1.5,
      'atk',
    )
    // Numby buff is unique. It doesn't buff just any attack, it only buffs
    // Numby. For example, in a step of "Topaz NA, Numby FuA, Topaz E, TingYun
    // additional damage" (all in enhanced state), only Numby FuA and Topaz E is
    // buffed.
    if (this.metadata.numbyEnhancedState) {
      retVal.with((bd) => (bd.unconditional(NUMBY, {
        scope: StepScope.SINGLE_STEP,
        newStep: () => this.eidolon === 6 ? numbyEnhancedStateBuffE6 : numbyEnhancedStateBuff,
      })))
    }

    return retVal
  }

  private skillFuaStep(): StepBuilder {
    const retVal = StepBuilder.damage(
      HsrElement.FIRE,
      [Trait.FOLLOW_UP, Trait.SKILL],
      this.metadata.numbyEnhancedState ? 3 : 1.5,
      'atk',
    )
    // Numby buff is unique. It doesn't buff just any attack, it only buffs
    // Numby. For example, in a step of "Topaz NA, Numby FuA, Topaz E, TingYun
    // additional damage" (all in enhanced state), only Numby FuA and Topaz E is
    // buffed.
    if (this.metadata.numbyEnhancedState) {
      retVal.with((bd) => (bd.unconditional(NUMBY, {
        scope: StepScope.SINGLE_STEP,
        newStep: () => this.eidolon === 6 ? numbyEnhancedStateBuffE6 : numbyEnhancedStateBuff,
      })))
    }

    return retVal
  }
}

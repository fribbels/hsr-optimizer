import { EarlyConditional, LateConditional, ToStat, TransformingStat } from '../stats/conditional'
import { HsrElement, SupportedContextStat as FromStat, Trait } from '../stats/context'
import { matchAll, matchAnyEarly, matchByElement } from '../stats/matcher'
import { Modifiers } from '../stats/modifier'
import { PartialModifiableStats } from '../stats/stat'
import { StepBuilder } from '../step/builder'
import { Character, CharacterPreset, CharacterSteps, Eidolon } from './character'

type BlackSwanMetadata = {
  ultimateDebuff: boolean
  skillDefDown: boolean
  arcanaStacks: number
  e1ResReduction: boolean
}

const DEFAULT: BlackSwanMetadata = {
  ultimateDebuff: true,
  skillDefDown: true,
  arcanaStacks: 7,
  e1ResReduction: true,
}

// I could refactor this into something better, but here's just a proof
// of concept how it works.
export class BlackSwan extends Character<BlackSwanMetadata> {
  private dotDefPen: PartialModifiableStats = { targetDef: { percent: -0.2 } }

  private ultimateDebuff: PartialModifiableStats = { vulnerability: 0.25 }

  private skillDefDown: PartialModifiableStats = { targetDef: { percent: -0.208 } }

  private e1ResReduction: EarlyConditional = new EarlyConditional(
    matchAnyEarly(
      matchByElement(HsrElement.FIRE),
      matchByElement(HsrElement.LIGHTING),
      matchByElement(HsrElement.PHYSICAL),
      matchByElement(HsrElement.WIND),
    ),
    { res: -0.2 },
  )

  private traceDmgBonus: LateConditional = new LateConditional(
    matchAll(),
    new TransformingStat(FromStat.BREAK_EFFECT, ToStat.DMG_BONUS, 0.6, 0.72),
  )

  constructor(eid: Eidolon, metadata: BlackSwanMetadata = DEFAULT) {
    super(eid, metadata)
    if (eid >= 1) {
      this.mods.early.push(this.e1ResReduction)
    }
    if (metadata.skillDefDown) {
      this.mods.unconditional.push(this.skillDefDown)
    }
    if (metadata.ultimateDebuff) {
      this.mods.unconditional.push(this.ultimateDebuff)
    }
  }

  private mods: Modifiers = {
    unconditional: [],
    early: [],
    late: [],
  }

  asTeammate: Modifiers = this.mods

  asOptiTarget: CharacterSteps[] = [{
    type: 'talent-dot',
    modifiers: {
      // This is my programming war crime
      unconditional: this.metadata.arcanaStacks >= 7
        ? [this.dotDefPen, ...this.mods.unconditional]
        : this.mods.unconditional,
      early: [],
      late: [this.traceDmgBonus],
    },
    // I haven't written a builder for dot damage, but it is just no crit normal
    // damage, eh, whatever
    steps: [
      StepBuilder.damage(
        HsrElement.WIND,
        [Trait.DOT, Trait.DOT_WIND_SHEAR],
        this.calculateMultiplier(),
        'atk',
      ).neverCrit(),
    ],
  }]

  presets: CharacterPreset[] = [/** TODO */]

  private calculateMultiplier() {
    return 2.4 + this.metadata.arcanaStacks * 0.12
  }
}

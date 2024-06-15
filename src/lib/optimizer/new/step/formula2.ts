/* eslint-disable @typescript-eslint/no-unused-vars */
import { BasicStats } from '../stats/basicStat'
import { SimpleStatBuilder, StatBuilder } from '../stats/builder'
import { ModifiersLike } from '../stats/builder2'
import { EarlyConditional, LateConditional } from '../stats/conditional'
import { Modifiers } from '../stats/modifier'
import { PartialModifiableStats } from '../stats/stat'
import { checkLimit } from './limit'
import { StatLimit, Step } from './step'

type __ModifierLike =
  | EarlyConditional
  | LateConditional
  | PartialModifiableStats

type FormulaCreationOptions = {
  baseMods: Modifiers
  basic: { lv: number; base: BasicStats }
  maxEnergy: number
  targetBaseDef: number
}

type Formula2<T extends ModifiersLike = Modifiers> = {
  calculate(modifiers: T): number
}

class NoncombatCapable {
  constructor(private stepStatBuilders: StatBuilder[]) {}
}

/**
 * Formula contains all the metadata that makes up the computation of an
 * {@link OptimizationTarget}. In particular, each formula provides information
 * about:
 * - How many calculation steps are there?
 * - How is each step computed?
 * - What is each step requirement?
 *
 * There is 2 part in answering the question: How is this damage instance
 * computed?
 * - First, we need to know which stats contributed to said instance of damage,
 *   or in other word, calculate which stat will be applied.
 * - Now, with the final stat, devise a formula to get the number.
 *
 * These 2 parts are isolated from each other, and it is the main principal
 * behind the design of {@link Formula} and {@link Step}.
 *
 * Previously, {@link Formula} also accomodates the actual stat aggregation,
 * which make the non combat stat building process less clear, as non combat
 * stat may use a whole different schema.
 */
export class Formula {
  /**
   * Static method to create a {@link Formula}.
   * @param steps all {@link Step} that makes up this calculation
   */
  static create(
    steps: Step[],
    {
      baseMods,
      basic,
      maxEnergy,
      targetBaseDef,
    }: FormulaCreationOptions,
  ): Formula {
    const stepStatBuilders: SimpleStatBuilder[] = []
    // TODO: lazy initialize
    const uncModMap = new Map<string, PartialModifiableStats>()
    const earlyModMap = new Map<string, EarlyConditional>()
    const lateModMap = new Map<string, LateConditional>()

    for (const step of steps) {
      // Iteratively build the all the buffs that applies to each step
      if (step.mods.unconditional) {
        applyMod(step.mods.unconditional, uncModMap)
      }
      if (step.mods.early) {
        applyMod(step.mods.early, earlyModMap)
      }
      if (step.mods.late) {
        applyMod(step.mods.late, lateModMap)
      }
      // At this point we know all the modifiers that will apply to the current
      // step, which is base mods + step0 mods + step1 mods + ... + this step
      // mods. The 4 xxModMap is step0 mods + ... + stepn mods.
      const ctx = {
        element: step.element,
        traits: step.traits,
        basic: basic,
        maxEnergy: maxEnergy,
        targetBaseDef: targetBaseDef,
      }
      stepStatBuilders.push(
        new SimpleStatBuilder(
          ctx,
          {
            unconditional: baseMods.unconditional.concat(...uncModMap.values()),
            early: baseMods.early.concat(...earlyModMap.values()),
            late: baseMods.late.concat(...lateModMap.values()),
          },
        ),
      )
      // Some steps wants to be removed
      if (step.mods.unconditional) {
        removeMods(step.mods.unconditional, uncModMap)
      }
      if (step.mods.early) {
        removeMods(step.mods.early, earlyModMap)
      }
      if (step.mods.late) {
        removeMods(step.mods.late, lateModMap)
      }
    }
    return new Formula(
      steps,
      stepStatBuilders,
    )
  }

  /**
   * This is used exclusively for deserialization. If you don't know what it is,
   * don't use this constructor. Use {@link Formula.create() the static builder}
   * instead.
   */
  constructor(
    private steps: Step[],
    private stepStatBuilders: SimpleStatBuilder[] = [],
    private nonCombatBuilder?: SimpleStatBuilder,
    private nonCombatLimit?: StatLimit,
  ) {}

  /**
   * Check if the passed relic stats is good with the passed non combat stat
   * limit.
   *
   * I agree the current API is dogshit, as you can see this step is better done
   * in the {@link calculate} loop or in a higher order step, but whatever, I
   * will refactor this later. IMPORTANT TODO
   *
   * Note that it is not trivial to loop it in {@link calculate}, as relic set
   * 2/4 may also contains combat/non-combat conditionals used to check. This is
   * driving me crazy.
   * @returns boolean indicating whether the check pass. Note that if the
   * formula has no non combat information then it always pass (return true).
   */
  checkNonCombatStat(
    modifier: Modifiers,
  ) {
    if (!this.nonCombatBuilder || !this.nonCombatLimit) {
      return true
    }
    return checkLimit(
      this.nonCombatBuilder.getFinalStats(modifier),
      this.nonCombatLimit,
    )
  }

  /**
   * Calculate an instance of damage/healing/chance... based on provided stat.
   * @param unconditional most likely relic data
   * @param late additional conditional relic data, possibly set 2/4 effects
   * @returns the final output, or -1 if the calculated stat is off limit
   */
  calculate(
    unconditional: PartialModifiableStats[],
    early: EarlyConditional[],
    late: LateConditional[],
  ): number {
    let result = 0
    for (let i = 0; i < this.steps.length; i++) {
      const finalStat = this.stepStatBuilders[i].getFinalStats(
        { unconditional, early, late },
      )
      const step = this.steps[i]
      if (step.limit && !checkLimit(finalStat, step.limit)) {
        return -1
      }
      result += step.calculate(finalStat)
    }
    return result
  }
}

/**
 * How long (which steps) this modifier is going to be active.
 */
export enum StepScope {
  /**
   * The modifier will be removed after this step.
   */
  SINGLE_STEP,
  /**
   * The modifier will not be removed automatically after this step, but can
   * still be removed explicitly by another step (that is aware of this
   * modifier, typically by using the same key).
   */
  MANUAL,
}
export type StepAwareModifier<T> = {
  scope: StepScope
  /**
   * @param prev the modifier with the same key used in the last step.
   * @returns the modifier that will be used in this step.
   */
  newStep: (prev: T | undefined) => T | undefined
}

/**
 * Helpers to synchronize previous step mods
 * @param stepMods the current step extra mods
 */
function applyMod<T extends __ModifierLike>(
  stepMods: Map<string, StepAwareModifier<T>>,
  modMaps: Map<string, T>,
) {
  for (const [key, stepModifier] of stepMods) {
    const oldVal = modMaps.get(key)
    const newVal = stepModifier.newStep(oldVal)
    if (newVal === undefined) {
      modMaps.delete(key)
    } else {
      modMaps.set(key, newVal)
    }
  }
}

function removeMods<T extends __ModifierLike>(
  stepMods: Map<string, StepAwareModifier<T>>,
  modMaps: Map<string, T>,
) {
  for (const [key, stepModifier] of stepMods) {
    switch (stepModifier.scope) {
      case StepScope.SINGLE_STEP:
        modMaps.delete(key)
        break
      case StepScope.MANUAL:
        break
      default:
        throw new Error(
          'Unknown StepScope: ' + JSON.stringify(stepModifier.scope),
        )
    }
  }
}

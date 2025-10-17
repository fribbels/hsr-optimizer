import { AbilityType } from 'lib/conditionals/conditionalConstants'
import { DynamicConditional } from 'lib/gpu/conditionals/dynamicConditionals'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import { FormSelectWithPopoverProps } from 'lib/tabs/tabOptimizer/conditionals/FormSelect'
import { FormSliderWithPopoverProps } from 'lib/tabs/tabOptimizer/conditionals/FormSlider'
import { FormSwitchWithPopoverProps } from 'lib/tabs/tabOptimizer/conditionals/FormSwitch'
import {
  ComponentProps,
  ComponentType,
} from 'react'
import {
  OptimizerAction,
  OptimizerContext,
} from 'types/optimizer'

// Interface to an instance of a Character or Light Cone conditional controller
export interface ConditionalsController {
  // Visual elements for conditionals
  // Content defines the form UI components and their related conditional variables
  content: () => ContentItem[]
  teammateContent?: () => ContentItem[]
  defaults: () => ConditionalValueMap
  teammateDefaults?: () => ConditionalValueMap

  // Configuration changes to the character & combat environment executed before the precompute steps
  // This can include things like ability damage type switches, weakness break overrides, etc
  initializeConfigurations?: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => void
  initializeTeammateConfigurations?: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => void

  // Individual effects that apply only for the primary character
  // e.g. Self buffs
  precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => void

  // Shared effects that apply both as a teammate and as the primary character
  // e.g. AOE team buff
  precomputeMutualEffects?: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext, originalCharacterAction?: OptimizerAction) => void

  // Effects that only apply as a teammate, onto the primary character
  // e.g. Targeted teammate buff
  precomputeTeammateEffects?: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext, originalCharacterAction?: OptimizerAction) => void

  calculateBasicEffects?: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => void
  gpuCalculateBasicEffects?: (action: OptimizerAction, context: OptimizerContext) => string

  // Multipliers that can be evaluated after all stat modifications are complete
  // No changes to stats should occur at this stage
  finalizeCalculations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => void

  // WGSL implementation of finalizeCalculations to run on GPU
  gpuFinalizeCalculations?: (action: OptimizerAction, context: OptimizerContext) => string

  // Dynamic conditionals are ones that cannot be precomputed, and can trigger at any point in the compute pipeline
  // These are dependent on other stats, usually in the form of 'when x.stat >= value, then buff x.other' and will
  // evaluate each time that dependent stat changes. These are executed after the precomputes, but before finalizing.
  dynamicConditionals?: DynamicConditional[]

  teammateDynamicConditionals?: DynamicConditional[]
}

export interface LightConeConditionalsController extends ConditionalsController {
}

export interface CharacterConditionalsController extends ConditionalsController {
  activeAbilities: AbilityType[]
}

export type ConditionalValueMap = Record<string, number | boolean>

export type ContentComponentMap = {
  switch: ComponentType<FormSwitchWithPopoverProps>,
  slider: ComponentType<FormSliderWithPopoverProps>,
  select: ComponentType<FormSelectWithPopoverProps>,
}

// Extracted content to apply to <DisplayFormControl />
export type ContentItem = {
  [K in keyof ContentComponentMap]:
    & {
      formItem: K,
      id: string,
      content: string,
      teammateIndex?: number,
    }
    & Omit<ComponentProps<ContentComponentMap[K]>, 'content' | 'title'>
}[keyof ContentComponentMap]

import type { UseFormReturnType } from '@mantine/form'
import { getAllCharacterConfigs, getCharacterConfig } from 'lib/conditionals/resolver/characterConfigRegistry'
import {
  DEFAULT_WARP_TARGET,
  EidolonLevel,
  SuperimpositionLevel,
  type WarpRequest,
  type WarpTarget,
} from 'lib/tabs/tabWarp/warpCalculatorTypes'
import type { LightConeId } from 'types/lightCone'

let fallbackIdSeq = 0

function newTargetId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `target-${Date.now()}-${fallbackIdSeq++}`
}

function makeTarget(patch: Partial<WarpTarget>): WarpTarget {
  return { ...DEFAULT_WARP_TARGET, id: newTargetId(), ...patch }
}

export function findCharacterByLightCone(lightConeId: LightConeId): WarpTarget['characterId'] {
  for (const [characterId, config] of getAllCharacterConfigs()) {
    if (config.defaultLightCone === lightConeId) return characterId
  }
  return null
}

// --- Single gateway: every mutation goes through here ---

function setTargets(form: UseFormReturnType<WarpRequest>, targets: WarpTarget[]) {
  reflowTargetChains(targets)
  form.setFieldValue('targets', targets)
}

// --- Mutations ---

export function updateTarget(form: UseFormReturnType<WarpRequest>, index: number, patch: Partial<WarpTarget>) {
  const targets = form.getValues().targets.map((target, targetIndex) => {
    if (targetIndex !== index) return target
    return { ...target, ...patch }
  })
  setTargets(form, targets)
}

// Sets the owned ("from") level for the whole same-target chain. The owned level is a property of the
// character / light cone, not of a single row, so every goal in the chain starts from it. The reflow
// then re-derives each row's FROM and pops any goal the new owned level would make redundant: raising
// it shifts goals up, lowering it stretches the bottom row down — the upgrade count stays the same.
export function updateTargetFrom(form: UseFormReturnType<WarpRequest>, index: number, isCharacter: boolean, newFrom: number) {
  const targets = form.getValues().targets
  const target = targets[index]
  const next = targets.map((other) => {
    if (isCharacter) {
      if (other.characterId === target.characterId && other.targetEidolonLevel !== EidolonLevel.NONE) {
        return { ...other, currentEidolonLevel: newFrom as EidolonLevel }
      }
    } else {
      if (other.lightConeId === target.lightConeId && other.targetSuperimpositionLevel !== SuperimpositionLevel.NONE) {
        return { ...other, currentSuperimpositionLevel: newFrom as SuperimpositionLevel }
      }
    }
    return other
  })
  setTargets(form, next)
}

// Sets a target's "to" (goal) level for whichever dimension the card represents.
export function updateTargetTo(form: UseFormReturnType<WarpRequest>, index: number, isCharacter: boolean, newTo: number) {
  if (isCharacter) updateTarget(form, index, { targetEidolonLevel: newTo as EidolonLevel })
  else updateTarget(form, index, { targetSuperimpositionLevel: newTo as SuperimpositionLevel })
}

export function removeTarget(form: UseFormReturnType<WarpRequest>, index: number) {
  const before = form.getValues().targets
  const removed = before[index]
  const targets = before.filter((_, targetIndex) => targetIndex !== index)
  if (targets.length === 0) return

  // Removing a goal must not change the owned level. If the removed row carried its chain's base
  // (it was the lowest goal), stamp that base onto the surviving lowest goal so the reflow keeps it.
  if (removed.targetEidolonLevel !== EidolonLevel.NONE) preserveOwnedLevel(before, targets, CHARACTER_CHAIN, removed)
  if (removed.targetSuperimpositionLevel !== SuperimpositionLevel.NONE) preserveOwnedLevel(before, targets, LIGHT_CONE_CHAIN, removed)

  setTargets(form, targets)
}

export function moveTarget(form: UseFormReturnType<WarpRequest>, activeId: string, overId: string) {
  const targets = [...form.getValues().targets]
  const fromIndex = targets.findIndex((target) => target.id === activeId)
  const toIndex = targets.findIndex((target) => target.id === overId)

  if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) return

  const [target] = targets.splice(fromIndex, 1)
  targets.splice(toIndex, 0, target)
  setTargets(form, targets)
}

export function addCharGoal(form: UseFormReturnType<WarpRequest>, characterId: NonNullable<WarpTarget['characterId']>) {
  const existing = form.getValues().targets
  const floor = getCharacterEidolonFloor(existing, characterId, existing.length)
  const target = makeTarget({
    characterId,
    lightConeId: null,
    currentEidolonLevel: floor,
    targetEidolonLevel: Math.min(floor + 1, EidolonLevel.E6) as EidolonLevel,
    targetSuperimpositionLevel: SuperimpositionLevel.NONE,
  })
  setTargets(form, [...existing, target])
}

export function addLcGoal(form: UseFormReturnType<WarpRequest>, lightConeId: LightConeId) {
  const existing = form.getValues().targets
  const floor = getLightConeSuperimpositionFloor(existing, lightConeId, existing.length)
  const target = makeTarget({
    characterId: findCharacterByLightCone(lightConeId),
    lightConeId,
    targetEidolonLevel: EidolonLevel.NONE,
    currentSuperimpositionLevel: floor,
    targetSuperimpositionLevel: Math.min(floor + 1, SuperimpositionLevel.S5) as SuperimpositionLevel,
  })
  setTargets(form, [...existing, target])
}

export function addCharAndSignatureGoal(form: UseFormReturnType<WarpRequest>, characterId: NonNullable<WarpTarget['characterId']>) {
  const existing = form.getValues().targets
  const signatureLcId = getCharacterConfig(characterId)?.defaultLightCone ?? null
  const eidolonFloor = getCharacterEidolonFloor(existing, characterId, existing.length)
  const lcFloor = getLightConeSuperimpositionFloor(existing, signatureLcId, existing.length)
  const charTarget = makeTarget({
    characterId,
    lightConeId: null,
    currentEidolonLevel: eidolonFloor,
    targetEidolonLevel: Math.min(eidolonFloor + 1, EidolonLevel.E6) as EidolonLevel,
    targetSuperimpositionLevel: SuperimpositionLevel.NONE,
  })
  const lcTarget = makeTarget({
    characterId,
    lightConeId: signatureLcId,
    targetEidolonLevel: EidolonLevel.NONE,
    currentSuperimpositionLevel: lcFloor,
    targetSuperimpositionLevel: Math.min(lcFloor + 1, SuperimpositionLevel.S5) as SuperimpositionLevel,
  })
  setTargets(form, [...existing, charTarget, lcTarget])
}

// --- Reflow: enforce FROM/TO invariants across target chains ---

export function getCharacterEidolonFloor(targets: WarpTarget[], characterId: string | null, beforeIndex: number): EidolonLevel {
  if (!characterId) return EidolonLevel.NONE
  let max = EidolonLevel.NONE
  for (let i = 0; i < beforeIndex; i++) {
    if (targets[i].characterId === characterId && targets[i].targetEidolonLevel > max) {
      max = targets[i].targetEidolonLevel
    }
  }
  return max
}

export function getLightConeSuperimpositionFloor(targets: WarpTarget[], lightConeId: string | null, beforeIndex: number): SuperimpositionLevel {
  if (!lightConeId) return SuperimpositionLevel.NONE
  let max = SuperimpositionLevel.NONE
  for (let i = 0; i < beforeIndex; i++) {
    if (targets[i].lightConeId === lightConeId && targets[i].targetSuperimpositionLevel > max) {
      max = targets[i].targetSuperimpositionLevel
    }
  }
  return max
}

// Describes one dimension of a warp target (eidolons for characters, superimpositions for light cones)
// so the reflow can treat both chains with a single algorithm via dot-access getters/setters.
type WarpChain = {
  none: number,
  cap: number,
  getId: (target: WarpTarget) => string | null,
  getCurrent: (target: WarpTarget) => number,
  getGoal: (target: WarpTarget) => number,
  withLevels: (target: WarpTarget, current: number, goal: number) => WarpTarget,
}

const CHARACTER_CHAIN: WarpChain = {
  none: EidolonLevel.NONE,
  cap: EidolonLevel.E6,
  getId: (target) => target.characterId,
  getCurrent: (target) => target.currentEidolonLevel,
  getGoal: (target) => target.targetEidolonLevel,
  withLevels: (target, current, goal) => ({ ...target, currentEidolonLevel: current as EidolonLevel, targetEidolonLevel: goal as EidolonLevel }),
}

const LIGHT_CONE_CHAIN: WarpChain = {
  none: SuperimpositionLevel.NONE,
  cap: SuperimpositionLevel.S5,
  getId: (target) => target.lightConeId,
  getCurrent: (target) => target.currentSuperimpositionLevel,
  getGoal: (target) => target.targetSuperimpositionLevel,
  withLevels: (target, current, goal) => ({ ...target, currentSuperimpositionLevel: current as SuperimpositionLevel, targetSuperimpositionLevel: goal as SuperimpositionLevel }),
}

function reflowTargetChains(targets: WarpTarget[]) {
  reflowChain(targets, CHARACTER_CHAIN)
  reflowChain(targets, LIGHT_CONE_CHAIN)
}

// For each id-group (a character / light cone with one or more goals): the owned level (base) is the
// lowest stored FROM. Sort the goals ascending and derive each FROM from the previous goal, popping a
// goal up only when it would land at/below its FROM (a collision from an edit, or the E6/S5 cap). Rows
// are written back into the array positions the group occupied, so other groups — and the cross-group
// order that drives pity sequencing — stay put. Reordering never changes the goal set, so a reorder
// can never pop: the journey (endpoint and upgrade count) is invariant under drag.
function reflowChain(targets: WarpTarget[], chain: WarpChain) {
  const positionsById = new Map<string, number[]>()
  for (let i = 0; i < targets.length; i++) {
    const id = chain.getId(targets[i])
    if (!id || chain.getGoal(targets[i]) === chain.none) continue
    const positions = positionsById.get(id) ?? []
    positions.push(i)
    positionsById.set(id, positions)
  }

  for (const positions of positionsById.values()) {
    let base = chain.getCurrent(targets[positions[0]])
    for (const position of positions) {
      base = Math.min(base, chain.getCurrent(targets[position]))
    }

    const sorted = positions
      .map((position) => targets[position])
      .sort((a, b) => chain.getGoal(a) - chain.getGoal(b))

    let previousGoal = base
    const reflowed = sorted.map((target) => {
      const from = previousGoal
      const goal = chain.getGoal(target) <= from ? Math.min(from + 1, chain.cap) : chain.getGoal(target)
      previousGoal = goal
      return chain.withLevels(target, from, goal)
    })

    positions.forEach((position, i) => {
      targets[position] = reflowed[i]
    })
  }
}

// Carries a chain's owned level (base) across a removal. If the removed row was the lowest goal it was
// holding the base, so stamp that base onto the surviving lowest goal; the reflow derives the rest.
function preserveOwnedLevel(before: WarpTarget[], after: WarpTarget[], chain: WarpChain, removed: WarpTarget) {
  const id = chain.getId(removed)
  if (!id) return

  let base: number | null = null
  for (const target of before) {
    if (chain.getId(target) === id && chain.getGoal(target) !== chain.none) {
      base = base === null ? chain.getCurrent(target) : Math.min(base, chain.getCurrent(target))
    }
  }
  if (base === null) return

  let lowestIndex = -1
  for (let i = 0; i < after.length; i++) {
    if (chain.getId(after[i]) !== id || chain.getGoal(after[i]) === chain.none) continue
    if (lowestIndex === -1 || chain.getGoal(after[i]) < chain.getGoal(after[lowestIndex])) {
      lowestIndex = i
    }
  }
  if (lowestIndex === -1) return

  after[lowestIndex] = chain.withLevels(after[lowestIndex], base, chain.getGoal(after[lowestIndex]))
}

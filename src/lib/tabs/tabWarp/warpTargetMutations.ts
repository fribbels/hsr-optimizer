import type { UseFormReturnType } from '@mantine/form'
import {
  getAllCharacterConfigs,
  getCharacterConfig,
} from 'lib/conditionals/resolver/characterConfigRegistry'
import { getCharacterById } from 'lib/stores/character/characterStore'
import {
  DEFAULT_WARP_TARGET,
  EidolonLevel,
  SuperimpositionLevel,
  type WarpRequest,
  type WarpTarget,
  WarpType,
} from 'lib/tabs/tabWarp/warpCalculatorTypes'
import {
  WARP_DIMENSIONS,
  type WarpDimension,
} from 'lib/tabs/tabWarp/warpDimensions'
import { uuid } from 'lib/utils/miscUtils'
import type { CharacterId } from 'types/character'
import type { LightConeId } from 'types/lightCone'

function makeTarget(patch: Partial<WarpTarget>): WarpTarget {
  return { ...DEFAULT_WARP_TARGET, id: uuid(), ...patch }
}

export function findCharacterByLightCone(lightConeId: LightConeId): CharacterId | null {
  for (const [characterId, config] of getAllCharacterConfigs()) {
    if (config.defaultLightCone === lightConeId) return characterId
  }
  return null
}

// --- Owned-level lookups: pre-fill new goals from the player's save ---

// The eidolon already owned for this character, or NONE if the character isn't in the save.
function getOwnedEidolon(characterId: CharacterId | null): EidolonLevel {
  if (!characterId) return EidolonLevel.NONE
  const form = getCharacterById(characterId)?.form
  if (!form) return EidolonLevel.NONE
  return form.characterEidolon as EidolonLevel
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

// Sets the owned ("from") level for the whole same-target dimension. The owned level is a property of the
// character / light cone, not of a single row, so every goal in the chain starts from it. The reflow
// then re-derives each row's FROM and pops any goal the new owned level would make redundant: raising
// it shifts goals up, lowering it stretches the bottom row down — the upgrade count stays the same.
export function updateTargetFrom(form: UseFormReturnType<WarpRequest>, index: number, warpType: WarpType, newFrom: number) {
  const dimension = WARP_DIMENSIONS[warpType]
  const targets = form.getValues().targets
  const chainId = dimension.getId(targets[index])
  if (chainId === null) return
  const next = targets.map((other) =>
    dimension.getId(other) === chainId && dimension.getGoal(other) !== dimension.none
      ? dimension.withLevels(other, newFrom, dimension.getGoal(other))
      : other
  )
  setTargets(form, next)
}

// Sets a target's "to" (goal) level for whichever dimension the card represents.
export function updateTargetTo(form: UseFormReturnType<WarpRequest>, index: number, warpType: WarpType, newTo: number) {
  const dimension = WARP_DIMENSIONS[warpType]
  const target = form.getValues().targets[index]
  updateTarget(form, index, dimension.withLevels(target, dimension.getCurrent(target), newTo))
}

export function removeTarget(form: UseFormReturnType<WarpRequest>, index: number) {
  const before = form.getValues().targets
  const removed = before[index]
  const targets = before.filter((_, targetIndex) => targetIndex !== index)

  if (targets.length > 0) {
    if (removed.targetEidolonLevel !== EidolonLevel.NONE) preserveOwnedLevel(before, targets, WARP_DIMENSIONS[WarpType.CHARACTER], removed)
    if (removed.targetSuperimpositionLevel !== SuperimpositionLevel.NONE) preserveOwnedLevel(before, targets, WARP_DIMENSIONS[WarpType.LIGHTCONE], removed)
  }

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

export function addCharGoal(form: UseFormReturnType<WarpRequest>, characterId: CharacterId) {
  const existing = form.getValues().targets
  const floor = getCharacterEidolonFloor(existing, characterId, existing.length)
  const from = Math.max(floor, getOwnedEidolon(characterId))
  const target = makeTarget({
    characterId,
    lightConeId: null,
    currentEidolonLevel: from as EidolonLevel,
    targetEidolonLevel: Math.min(from + 1, EidolonLevel.E6) as EidolonLevel,
    targetSuperimpositionLevel: SuperimpositionLevel.NONE,
  })
  setTargets(form, [...existing, target])
}

// A standalone light cone has no character context, so its owned superimposition isn't read from the save
// (unlike addCharGoal / addCharAndSignatureGoal); the new goal simply starts at the chain floor.
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

export function addCharAndSignatureGoal(form: UseFormReturnType<WarpRequest>, characterId: CharacterId) {
  const existing = form.getValues().targets
  const signatureLcId = getCharacterConfig(characterId)?.defaultLightCone ?? null
  const eidolonFloor = getCharacterEidolonFloor(existing, characterId, existing.length)
  const lcFloor = getLightConeSuperimpositionFloor(existing, signatureLcId, existing.length)
  const eidolonFrom = Math.max(eidolonFloor, getOwnedEidolon(characterId))
  const superimpositionFrom = lcFloor
  const charTarget = makeTarget({
    characterId,
    lightConeId: null,
    currentEidolonLevel: eidolonFrom as EidolonLevel,
    targetEidolonLevel: Math.min(eidolonFrom + 1, EidolonLevel.E6) as EidolonLevel,
    targetSuperimpositionLevel: SuperimpositionLevel.NONE,
  })
  const lcTarget = makeTarget({
    characterId,
    lightConeId: signatureLcId,
    targetEidolonLevel: EidolonLevel.NONE,
    currentSuperimpositionLevel: superimpositionFrom as SuperimpositionLevel,
    targetSuperimpositionLevel: Math.min(superimpositionFrom + 1, SuperimpositionLevel.S5) as SuperimpositionLevel,
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

function reflowTargetChains(targets: WarpTarget[]) {
  reflowChain(targets, WARP_DIMENSIONS[WarpType.CHARACTER])
  reflowChain(targets, WARP_DIMENSIONS[WarpType.LIGHTCONE])
}

// For each id-group (a character / light cone with one or more goals): the owned level (base) is the
// lowest stored FROM. Sort the goals ascending and derive each FROM from the previous goal, popping a
// goal up only when it would land at/below its FROM (a collision from an edit, or the E6/S5 cap). Rows
// are written back into the array positions the group occupied, so other groups — and the cross-group
// order that drives pity sequencing — stay put. Reordering never changes the goal set, so a reorder
// can never pop: the journey (endpoint and upgrade count) is invariant under drag.
function reflowChain(targets: WarpTarget[], dimension: WarpDimension) {
  const positionsById = new Map<string, number[]>()
  for (let i = 0; i < targets.length; i++) {
    const id = dimension.getId(targets[i])
    if (!id || dimension.getGoal(targets[i]) === dimension.none) continue
    const positions = positionsById.get(id) ?? []
    positions.push(i)
    positionsById.set(id, positions)
  }

  for (const positions of positionsById.values()) {
    let base = dimension.getCurrent(targets[positions[0]])
    for (const position of positions) {
      base = Math.min(base, dimension.getCurrent(targets[position]))
    }

    const sorted = positions
      .map((position) => targets[position])
      .sort((a, b) => dimension.getGoal(a) - dimension.getGoal(b))

    let previousGoal = base
    const reflowed = sorted.map((target) => {
      const from = previousGoal
      const goal = dimension.getGoal(target) <= from ? Math.min(from + 1, dimension.cap) : dimension.getGoal(target)
      previousGoal = goal
      return dimension.withLevels(target, from, goal)
    })

    positions.forEach((position, i) => {
      targets[position] = reflowed[i]
    })
  }
}

// Carries a chain's owned level (base) across a removal. If the removed row was the lowest goal it was
// holding the base, so stamp that base onto the surviving lowest goal; the reflow derives the rest.
function preserveOwnedLevel(before: WarpTarget[], after: WarpTarget[], dimension: WarpDimension, removed: WarpTarget) {
  const id = dimension.getId(removed)
  if (!id) return

  let base: number | null = null
  for (const target of before) {
    if (dimension.getId(target) === id && dimension.getGoal(target) !== dimension.none) {
      base = base === null ? dimension.getCurrent(target) : Math.min(base, dimension.getCurrent(target))
    }
  }
  if (base === null) return

  let lowestIndex = -1
  for (let i = 0; i < after.length; i++) {
    if (dimension.getId(after[i]) !== id || dimension.getGoal(after[i]) === dimension.none) continue
    if (lowestIndex === -1 || dimension.getGoal(after[i]) < dimension.getGoal(after[lowestIndex])) {
      lowestIndex = i
    }
  }
  if (lowestIndex === -1) return

  after[lowestIndex] = dimension.withLevels(after[lowestIndex], base, dimension.getGoal(after[lowestIndex]))
}

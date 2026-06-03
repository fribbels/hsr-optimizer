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

// Sets a target's "from" (current) level. Keeps the goal strictly above the new start by bumping it
// up when the user drags the start at or past it.
export function updateTargetFrom(form: UseFormReturnType<WarpRequest>, index: number, isCharacter: boolean, newFrom: number) {
  const target = form.getValues().targets[index]
  if (isCharacter) {
    const patch: Partial<WarpTarget> = { currentEidolonLevel: newFrom as EidolonLevel }
    if (newFrom >= target.targetEidolonLevel) {
      patch.targetEidolonLevel = Math.min(newFrom + 1, EidolonLevel.E6) as EidolonLevel
    }
    updateTarget(form, index, patch)
  } else {
    const patch: Partial<WarpTarget> = { currentSuperimpositionLevel: newFrom as SuperimpositionLevel }
    if (newFrom >= target.targetSuperimpositionLevel) {
      patch.targetSuperimpositionLevel = Math.min(newFrom + 1, SuperimpositionLevel.S5) as SuperimpositionLevel
    }
    updateTarget(form, index, patch)
  }
}

// Sets a target's "to" (goal) level for whichever dimension the card represents.
export function updateTargetTo(form: UseFormReturnType<WarpRequest>, index: number, isCharacter: boolean, newTo: number) {
  if (isCharacter) updateTarget(form, index, { targetEidolonLevel: newTo as EidolonLevel })
  else updateTarget(form, index, { targetSuperimpositionLevel: newTo as SuperimpositionLevel })
}

export function removeTarget(form: UseFormReturnType<WarpRequest>, index: number) {
  const targets = form.getValues().targets.filter((_, targetIndex) => targetIndex !== index)
  if (targets.length > 0) {
    setTargets(form, targets)
  }
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
    targetEidolonLevel: Math.min(eidolonFloor + 1, EidolonLevel.E6) as EidolonLevel,
    targetSuperimpositionLevel: SuperimpositionLevel.NONE,
  })
  const lcTarget = makeTarget({
    characterId,
    lightConeId: signatureLcId,
    targetEidolonLevel: EidolonLevel.NONE,
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

function reflowTargetChains(targets: WarpTarget[]) {
  reflowChain(targets, 'character')
  reflowChain(targets, 'lightcone')
}

function reflowChain(targets: WarpTarget[], kind: 'character' | 'lightcone') {
  const isChar = kind === 'character'
  const none = isChar ? EidolonLevel.NONE : SuperimpositionLevel.NONE
  const max = isChar ? EidolonLevel.E6 : SuperimpositionLevel.S5
  const currentKey = isChar ? 'currentEidolonLevel' : 'currentSuperimpositionLevel' as const
  const targetKey = isChar ? 'targetEidolonLevel' : 'targetSuperimpositionLevel' as const
  const idKey = isChar ? 'characterId' : 'lightConeId' as const

  const level = new Map<string, number>()

  for (let i = 0; i < targets.length; i++) {
    const t = targets[i]
    const id = t[idKey]
    if (!id || t[targetKey] === none) continue

    const floor = level.get(id)
    const from = floor !== undefined ? floor : t[currentKey]
    let to = t[targetKey]
    if (to <= from) to = Math.min(from + 1, max)

    if (t[currentKey] !== from || t[targetKey] !== to) {
      targets[i] = { ...t, [currentKey]: from, [targetKey]: to }
    }

    level.set(id, Math.max(from, to))
  }
}

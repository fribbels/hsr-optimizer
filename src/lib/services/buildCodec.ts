import type { LightConeId } from 'types/lightCone'

export function resolveFlexibleLC(
  savedLC: LightConeId,
  savedSI: number,
  currentLC: LightConeId,
  currentSI: number,
): { lightCone: LightConeId; lightConeSuperimposition: number } {
  if (savedLC === currentLC) {
    return { lightCone: savedLC, lightConeSuperimposition: Math.max(savedSI, currentSI) }
  }
  return { lightCone: savedLC, lightConeSuperimposition: savedSI }
}

export function resolveEidolon(savedEidolon: number, currentEidolon: number): number {
  return Math.max(savedEidolon, currentEidolon)
}

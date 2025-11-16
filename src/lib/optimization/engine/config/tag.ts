export enum DamageTag {
  BASIC = 1 << 0,
  SKILL = 1 << 1,
  ULTIMATE = 1 << 2,
  TALENT = 1 << 3,
}

export enum ElementTag {
  Physical = 1 << 0,
  Fire = 1 << 1,
  Ice = 1 << 2,
  Lightning = 1 << 3,
  Wind = 1 << 4,
  Quantum = 1 << 5,
  Imaginary = 1 << 6,
}

export type Tag = ElementTag | DamageTag

export const ALL_TAGS = ~0

export const SELF_ENTITY = 0

export const ALL_DAMAGE_TAGS = Object.values(DamageTag)
  .filter((v): v is number => typeof v === 'number')
  .reduce((acc, val) => acc | val, 0)

export const ALL_ELEMENT_TAGS = Object.values(ElementTag)
  .filter((v): v is number => typeof v === 'number')
  .reduce((acc, val) => acc | val, 0)

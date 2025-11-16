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

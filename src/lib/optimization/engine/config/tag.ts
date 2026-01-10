export enum DamageTag {
  None = 0,
  BASIC = 1,
  SKILL = 2,
  ULT = 4,
  FUA = 8,
  DOT = 16,
  BREAK = 32,
  SUPER_BREAK = 32 | 64, // SuperBreak is a subtype of Break - includes BREAK bit so Break buffs automatically affect it
  MEMO = 128,
  ADDITIONAL = 256,
}

export enum ElementTag {
  None = 0,
  Physical = 1,
  Fire = 2,
  Ice = 4,
  Lightning = 8,
  Wind = 16,
  Quantum = 32,
  Imaginary = 64,
}

export enum TargetTag {
  None = 0,
  Self = 1,
  SelfAndPet = 2,
  FullTeam = 4,
  TargetAndMemosprite = 8,
  SelfAndMemosprite = 16,
  SummonsOnly = 32,
  SelfAndSummon = 64,
  MemospritesOnly = 128,
  SingleTarget = 256,
}

export type Tag = ElementTag | DamageTag

export const SELF_ENTITY_INDEX = 0

export const ALL_DAMAGE_TAGS = Object.values(DamageTag)
  .filter((v): v is number => typeof v === 'number')
  .reduce((acc, val) => acc | val, 0)

export const ALL_ELEMENT_TAGS = Object.values(ElementTag)
  .filter((v): v is number => typeof v === 'number')
  .reduce((acc, val) => acc | val, 0)

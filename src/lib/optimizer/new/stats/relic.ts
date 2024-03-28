import { EarlyConditional, LateConditional } from './conditional'
import { HsrElement } from './context'

export type RelicContext = {
  pieces: {
    head: HeadPiece[]
    hand: HandPiece[]
    body: BodyPiece[]
    feet: FeetPiece[]
    sphere: SpherePiece[]
    rope: RopePiece[]
  }
  sets: {
    [K: string]: RelicSetEffect
  }
}

export type RelicSetEffect = {
  set2: {
    early: EarlyConditional[]
    late: LateConditional[]
  }
  set4?: {
    early: EarlyConditional[]
    late: LateConditional[]
  }
}

export type GeneralSubStats = {
  set: string
  basic?: {
    percent?: {
      atk?: number
      def?: number
      hp?: number
    }
    flat?: {
      atk?: number
      def?: number
      hp?: number
      speed?: number
    }
  }
  breakEffect?: number
  outgoingHealing?: number
  crit?: {
    critRate?: number
    critDmg?: number
  }
  effectHitRate?: number
  effectRes?: number
}

export type HeadPiece = GeneralSubStats & {
  basic: {
    flat: {
      hp: number
    }
  }
}

export type HandPiece = GeneralSubStats & {
  basic: {
    flat: {
      atk: number
    }
  }
}

export type BodyPiece = GeneralSubStats & {
  outgoingHealingBoost?: number
}

export type FeetPiece = GeneralSubStats

export type SpherePiece = GeneralSubStats & {
  __dmgBoost?: {
    ele: HsrElement
    value: number
  }
}

export type RopePiece = GeneralSubStats & {
  energyRegenerationRate?: number
}

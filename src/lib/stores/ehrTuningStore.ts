import { create } from 'zustand'

export interface EhrTuningForm {
  effectRes: number
  debuffRes: number
  baseChance: number
  attempts: number
  effectHitRate: number
  desiredHitRate: number
}

export const useEhrTuningStore = create<EhrTuningForm>()(() => ({
  effectRes: 40,
  debuffRes: 0,
  baseChance: 100,
  attempts: 1,
  effectHitRate: 50,
  desiredHitRate: 100,
}))

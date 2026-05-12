import { create } from 'zustand'

export interface AhaForm {
  teammate0: number | ''
  teammate1: number | ''
  teammate2: number | ''
  teammate3: number | ''
  desiredAha: number | ''
}

export const useAhaTuningStore = create<AhaForm>()(() => ({
  teammate0: 180,
  teammate1: 135,
  teammate2: '',
  teammate3: '',
  desiredAha: 135,
}))

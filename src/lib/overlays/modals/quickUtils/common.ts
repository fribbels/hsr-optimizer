import type { TFunction } from 'i18next'

export interface SharedProps {
  t: TFunction<'modals', 'QuickUtils'>
}

export const utilOptions = ['Aha', 'EHR'] as const
export type UtilOptions = typeof utilOptions[number]

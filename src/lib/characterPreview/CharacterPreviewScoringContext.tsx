import type { InjectedScoringInput } from 'lib/characterPreview/characterPreviewTypes'
import {
  createContext,
  type PropsWithChildren,
  useContext,
} from 'react'

const CharacterPreviewScoringContext = createContext<InjectedScoringInput | undefined>(undefined)

export function CharacterPreviewScoringProvider({
  value,
  children,
}: PropsWithChildren<{ value: InjectedScoringInput }>) {
  return (
    <CharacterPreviewScoringContext value={value}>
      {children}
    </CharacterPreviewScoringContext>
  )
}

export function useInjectedScoringInput(): InjectedScoringInput | undefined {
  return useContext(CharacterPreviewScoringContext)
}

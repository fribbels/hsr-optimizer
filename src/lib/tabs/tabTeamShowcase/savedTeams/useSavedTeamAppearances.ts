import { getCustomPortraitObjectPosition } from 'lib/characterPreview/customPortraitUtils'
import { Assets } from 'lib/rendering/assets'
import { useCharacterStore } from 'lib/stores/character/characterStore'
import type { TeamSlots } from 'lib/tabs/tabTeamShowcase/teamShowcaseTypes'
import { useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'

interface SavedTeamAppearance {
  usesCustomPortrait: boolean
  artUrl: string
  artObjectPosition: string | undefined
}

const CUSTOM_PORTRAIT_FOCUS_Y = 0.25

export function useSavedTeamAppearances(slots: TeamSlots): (SavedTeamAppearance | null)[] {
  const portraits = useCharacterStore(useShallow((state) =>
    slots.map((id) => id ? state.charactersById[id]?.portrait : undefined)
  ))

  return useMemo(() => {
    return slots.map((id, index) => {
      if (!id) return null
      const customPortrait = portraits[index]

      return {
        usesCustomPortrait: customPortrait != null,
        artUrl: customPortrait?.imageUrl ?? Assets.getCharacterPreviewById(id),
        artObjectPosition: customPortrait
          ? getCustomPortraitObjectPosition(customPortrait, CUSTOM_PORTRAIT_FOCUS_Y)
          : undefined,
      }
    })
  }, [slots, portraits])
}

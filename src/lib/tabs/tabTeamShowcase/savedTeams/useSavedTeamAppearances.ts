import { Assets } from 'lib/rendering/assets'
import { useCharacterStore } from 'lib/stores/character/characterStore'
import type { TeamSlots } from 'lib/tabs/tabTeamShowcase/teamShowcaseTypes'
import { useMemo } from 'react'
import type { CustomImageConfig } from 'types/customImage'
import { useShallow } from 'zustand/react/shallow'

interface SavedTeamAppearance {
  customPortrait: CustomImageConfig | undefined
  artUrl: string
  artObjectPosition: string | undefined
}

const CUSTOM_PORTRAIT_FOCUS_Y = 0.25
const PERCENT = 100

function customPortraitFocus(portrait: CustomImageConfig): string | undefined {
  const crop = portrait.customImageParams.croppedAreaPixels
  const { width, height } = portrait.originalDimensions
  if (width <= 0 || height <= 0) return undefined
  const x = (crop.x + crop.width / 2) / width * PERCENT
  const y = (crop.y + crop.height * CUSTOM_PORTRAIT_FOCUS_Y) / height * PERCENT
  return `${x}% ${y}%`
}

export function useSavedTeamAppearances(slots: TeamSlots): (SavedTeamAppearance | null)[] {
  const portraits = useCharacterStore(useShallow((state) => slots.map((id) => id ? state.charactersById[id]?.portrait : undefined)))

  return useMemo(() =>
    slots.map((id, index) => {
      if (!id) return null
      const customPortrait = portraits[index]
      return {
        customPortrait,
        artUrl: customPortrait?.imageUrl ?? Assets.getCharacterPreviewById(id),
        artObjectPosition: customPortrait ? customPortraitFocus(customPortrait) : undefined,
      }
    }), [slots, portraits])
}

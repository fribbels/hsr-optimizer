import { Assets } from 'lib/rendering/assets'
import { useCharacterStore } from 'lib/stores/character/characterStore'
import type { TeamSlots } from 'lib/tabs/tabTeamShowcase/useTeamShowcase'
import { useMemo } from 'react'
import type { CustomImageConfig } from 'types/customImage'

/** How a filled slot looks on its showcase card, for layouts that echo the card in their own UI */
export interface SlotAppearance {
  /** The user's custom portrait, which the card shows instead of the default art */
  customPortrait: CustomImageConfig | undefined
  /** The image the card actually shows: the custom portrait when set, otherwise the preview bust */
  artUrl: string
  /** `object-position` focus for `artUrl`; undefined for the preview bust, where the layout picks its own */
  artObjectPosition: string | undefined
}

/** Custom portraits are cropped tall for the card; focus the top quarter of that crop, where the face usually is */
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

/** Per-slot card appearance, null for empty slots. */
export function useSlotAppearances(slots: TeamSlots): (SlotAppearance | null)[] {
  const charactersById = useCharacterStore((s) => s.charactersById)

  return useMemo(() =>
    slots.map((id) => {
      if (!id) return null
      const customPortrait = charactersById[id]?.portrait
      return {
        customPortrait,
        artUrl: customPortrait?.imageUrl ?? Assets.getCharacterPreviewById(id),
        artObjectPosition: customPortrait ? customPortraitFocus(customPortrait) : undefined,
      }
    }), [slots, charactersById])
}

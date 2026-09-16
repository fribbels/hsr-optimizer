import { resolveShowcaseColor } from 'lib/characterPreview/color/showcaseColorService'
import { ShowcaseColorMode } from 'lib/constants/constants'
import { SavedSessionKeys } from 'lib/constants/constantsSession'
import { Assets } from 'lib/rendering/assets'
import { useGlobalStore } from 'lib/stores/app/appStore'
import { useCharacterStore } from 'lib/stores/character/characterStore'
import { useShowcaseTabStore } from 'lib/tabs/tabShowcase/useShowcaseTabStore'
import type { TeamSlots } from 'lib/tabs/tabTeamShowcase/useTeamShowcase'
import { useMemo } from 'react'
import type { CustomImageConfig } from 'types/customImage'
import { useShallow } from 'zustand/react/shallow'

/** How a filled slot looks on its showcase card, for layouts that echo the card in their own UI */
export interface SlotAppearance {
  /** The user's custom portrait, which the card shows instead of the default art */
  customPortrait: CustomImageConfig | undefined
  /** The image the card actually shows: the custom portrait when set, otherwise the preview bust */
  artUrl: string
  /** `object-position` focus for `artUrl`; undefined for the preview bust, where the layout picks its own */
  artObjectPosition: string | undefined
  /** The exact seed colour the card resolves for its theme */
  seedColor: string
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

/** Per-slot card appearance, null for empty slots. Mirrors the colour resolution in CharacterPreview. */
export function useSlotAppearances(slots: TeamSlots): (SlotAppearance | null)[] {
  const globalColorMode = useGlobalStore((s) =>
    s.savedSession[SavedSessionKeys.showcaseStandardMode] ? ShowcaseColorMode.STANDARD : ShowcaseColorMode.AUTO
  )
  const { showcasePreferences, portraitColors } = useShowcaseTabStore(useShallow((s) => ({
    showcasePreferences: s.showcasePreferences,
    portraitColors: s.portraitColorByCharacterId,
  })))
  const charactersById = useCharacterStore((s) => s.charactersById)

  return useMemo(() =>
    slots.map((id) => {
      if (!id) return null
      const customPortrait = charactersById[id]?.portrait
      const previewUrl = Assets.getCharacterPreviewById(id)
      const { seedColor } = resolveShowcaseColor(
        id,
        globalColorMode,
        showcasePreferences[id],
        portraitColors[id],
        !!customPortrait?.imageUrl,
      )
      return {
        customPortrait,
        artUrl: customPortrait?.imageUrl ?? previewUrl,
        artObjectPosition: customPortrait ? customPortraitFocus(customPortrait) : undefined,
        seedColor,
      }
    }), [slots, charactersById, globalColorMode, showcasePreferences, portraitColors])
}

import { ShowcaseSource } from 'lib/characterPreview/CharacterPreviewComponents'
import { getPreviewRelics, getShowcaseMetadata, getShowcaseStats } from 'lib/characterPreview/characterPreviewController'
import { DEFAULT_SHOWCASE_COLOR } from 'lib/characterPreview/showcaseCustomizationController'
import { ShowcaseCustomizationSidebarRef } from 'lib/characterPreview/ShowcaseCustomizationSidebar'
import { Parts, ShowcaseColorMode } from 'lib/constants/constants'
import { SavedSessionKeys } from 'lib/constants/constantsSession'
import { useScoringMetadata } from 'lib/hooks/useScoringMetadata'
import { showcaseOnAddOk, showcaseOnEditOk } from 'lib/characterPreview/characterPreviewController'
import { useRelicModalStore } from 'lib/overlays/modals/relicModalStore'
import { useMemo, useRef, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { Character, SavedBuild } from 'types/character'
import { CustomImageConfig } from 'types/customImage'
import { Relic } from 'types/relic'
import { useGlobalStore } from 'lib/stores/appStore'
import { useRelicStore } from 'lib/stores/relicStore'
import { useShowcaseTabStore } from 'lib/tabs/tabShowcase/useShowcaseTabStore'

export function useCharacterPreviewState(
  source: ShowcaseSource,
  character: Character | null,
  savedBuildOverride?: SavedBuild | null,
) {
  const [selectedRelic, setSelectedRelic] = useState<Relic | null>(null)
  const setEditModalOpen = (_open: boolean, relic?: Relic) => {
    if (relic) {
      useRelicModalStore.getState().openOverlay({
        selectedRelic: relic,
        defaultWearer: character?.id,
        onOk: (editedRelic: Relic) => {
          const currentConfig = useRelicModalStore.getState().config
          if (currentConfig?.selectedRelic) {
            showcaseOnEditOk(editedRelic, currentConfig.selectedRelic, setSelectedRelic)
          } else {
            showcaseOnAddOk(editedRelic, setSelectedRelic)
          }
        },
      })
    }
  }
  const setAddModalOpen = (_open: boolean, part: Parts, relic?: Relic) => {
    useRelicModalStore.getState().openOverlay({
      selectedRelic: relic ?? null,
      selectedPart: part,
      defaultWearer: character?.id,
      onOk: (editedRelic: Relic) => {
        showcaseOnAddOk(editedRelic, setSelectedRelic)
      },
    })
  }
  const [editPortraitModalOpen, setEditPortraitModalOpen] = useState(false)
  const [customPortrait, setCustomPortrait] = useState<CustomImageConfig>()

  const {
    teamSelectionByCharacter,
    globalShowcasePreferences,
    showcaseTemporaryOptionsByCharacter,
  } = useShowcaseTabStore(
    useShallow((s) => ({
      teamSelectionByCharacter: s.showcaseTeamPreferenceById,
      globalShowcasePreferences: s.showcasePreferences,
      showcaseTemporaryOptionsByCharacter: s.showcaseTemporaryOptionsByCharacter,
    })),
  )

  // Task 2.7: Scope relicsById subscription to only the 6 equipped relic IDs
  const relicsById = useRelicStore(useShallow((s) => {
    if (!character) return null
    const equipped = savedBuildOverride?.equipped ?? character.equipped
    const ids = [equipped?.Head, equipped?.Hands, equipped?.Body, equipped?.Feet, equipped?.PlanarSphere, equipped?.LinkRope].filter((id): id is string => !!id)
    return Object.fromEntries(ids.map((id) => [id, s.relicsById[id]])) as Partial<Record<string, Relic>>
  }))

  const [storedScoringType, setScoringType] = useState(useGlobalStore.getState().savedSession.scoringType)
  const prevCharId = useRef<string | undefined>(undefined)
  const prevSeedColor = useRef<string>(DEFAULT_SHOWCASE_COLOR)
  const sidebarRef = useRef<ShowcaseCustomizationSidebarRef>(null)
  // Re-render trigger: value is not read directly, but setSeedColor is called from the sidebar's
  // onPortraitLoad to force a re-render that picks up urlToColorCache mutations (module-level mutable).
  const [seedColor, setSeedColor] = useState<string>(DEFAULT_SHOWCASE_COLOR)
  const [colorMode, setColorMode] = useState<ShowcaseColorMode>(
    useGlobalStore.getState().savedSession[SavedSessionKeys.showcaseStandardMode] ? ShowcaseColorMode.STANDARD : ShowcaseColorMode.AUTO,
  )
  const darkMode = useGlobalStore((s) => s.savedSession.showcaseDarkMode)

  // Re-render trigger: value is not read directly, but the subscription to useScoringStore causes
  // re-renders when scoring metadata overrides change, allowing computeShowcaseVisualData to pick
  // up the latest getScoringMetadata() values.
  const scoringMetadata = useScoringMetadata(character?.id)

  // Hooks must be called unconditionally before early return to satisfy Rules of Hooks
  const previewRelics = useMemo(() => {
    if (!character || !relicsById) return null
    return getPreviewRelics(source, character, relicsById, savedBuildOverride)
  }, [source, character, relicsById, savedBuildOverride])

  const finalStats = useMemo(() => {
    if (!character || !previewRelics) return undefined
    const metadata = getShowcaseMetadata(character)
    return getShowcaseStats(character, previewRelics.displayRelics, metadata)
  }, [character, previewRelics])

  return {
    selectedRelic,
    setSelectedRelic,
    setEditModalOpen,
    setAddModalOpen,
    editPortraitModalOpen,
    setEditPortraitModalOpen,
    customPortrait,
    setCustomPortrait,
    teamSelectionByCharacter,
    globalShowcasePreferences,
    showcaseTemporaryOptionsByCharacter,
    relicsById,
    storedScoringType,
    setScoringType,
    prevCharId,
    prevSeedColor,
    sidebarRef,
    seedColor,
    setSeedColor,
    colorMode,
    setColorMode,
    darkMode,
    scoringMetadata,
    previewRelics,
    finalStats,
  }
}

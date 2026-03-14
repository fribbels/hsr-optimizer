import { ShowcaseSource } from 'lib/characterPreview/CharacterPreviewComponents'
import { getPreviewRelics, getShowcaseMetadata, getShowcaseStats } from 'lib/characterPreview/characterPreviewController'
import { ShowcaseColorMode } from 'lib/constants/constants'
import { SavedSessionKeys } from 'lib/constants/constantsSession'
import { useScoringMetadata } from 'lib/hooks/useScoringMetadata'
import { showcaseOnAddOk, showcaseOnEditOk } from 'lib/characterPreview/characterPreviewController'
import { useRelicModalStore } from 'lib/overlays/modals/relicModalStore'
import { useMemo, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { Character, SavedBuild } from 'types/character'
import { CustomImageConfig } from 'types/customImage'
import { Relic } from 'types/relic'
import { useGlobalStore } from 'lib/stores/appStore'
import { useRelicStore } from 'lib/stores/relicStore'
import { useShowcaseTabStore } from 'lib/tabs/tabShowcase/useShowcaseTabStore'
import { Parts } from 'lib/constants/constants'

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
    portraitColorByCharacterId,
    portraitSwatchesByCharacterId,
  } = useShowcaseTabStore(
    useShallow((s) => ({
      teamSelectionByCharacter: s.showcaseTeamPreferenceById,
      globalShowcasePreferences: s.showcasePreferences,
      showcaseTemporaryOptionsByCharacter: s.showcaseTemporaryOptionsByCharacter,
      portraitColorByCharacterId: s.portraitColorByCharacterId,
      portraitSwatchesByCharacterId: s.portraitSwatchesByCharacterId,
    })),
  )

  const globalColorMode = useGlobalStore((s) =>
    s.savedSession[SavedSessionKeys.showcaseStandardMode] ? ShowcaseColorMode.STANDARD : ShowcaseColorMode.AUTO,
  )

  // Source-aware relicsById: showcase characters have relics embedded, not in the store
  const relicsById = useRelicStore(useShallow((s) => {
    if (!character || source === ShowcaseSource.SHOWCASE_TAB) return {} as Partial<Record<string, Relic>>
    const equipped = savedBuildOverride?.equipped ?? character.equipped
    const ids = [equipped?.Head, equipped?.Hands, equipped?.Body, equipped?.Feet, equipped?.PlanarSphere, equipped?.LinkRope]
      .filter((id): id is string => !!id)
    return Object.fromEntries(ids.map((id) => [id, s.relicsById[id]])) as Partial<Record<string, Relic>>
  }))

  const [storedScoringType, setScoringType] = useState(useGlobalStore.getState().savedSession.scoringType)
  const darkMode = useGlobalStore((s) => s.savedSession.showcaseDarkMode)

  // Cache-buster for layout useMemo: when scoring metadata overrides change (SPD weight,
  // deprioritize buffs), the reference changes, busting the layout memo so
  // resolveShowcaseLayout re-reads the latest values via resolveDpsScoreSimulationMetadata.
  const scoringMetadata = useScoringMetadata(character?.id)

  // Hooks must be called unconditionally before early return to satisfy Rules of Hooks
  const previewRelics = useMemo(() => {
    if (!character) return null
    if (source !== ShowcaseSource.SHOWCASE_TAB && Object.keys(relicsById).length === 0) return null
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
    portraitColorByCharacterId,
    portraitSwatchesByCharacterId,
    globalColorMode,
    relicsById,
    storedScoringType,
    setScoringType,
    darkMode,
    scoringMetadata,
    previewRelics,
    finalStats,
  }
}

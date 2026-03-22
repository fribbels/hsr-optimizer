import { ShowcaseSource } from 'lib/characterPreview/CharacterPreviewComponents'
import { getPreviewRelics, getShowcaseMetadata, getShowcaseStats } from 'lib/characterPreview/characterPreviewController'
import { ShowcaseColorMode } from 'lib/constants/constants'
import { SavedSessionKeys } from 'lib/constants/constantsSession'
import { useScoringMetadata } from 'lib/hooks/useScoringMetadata'
import { showcaseOnAddOk, showcaseOnEditOk } from 'lib/characterPreview/characterPreviewController'
import { useRelicModalStore } from 'lib/overlays/modals/relicModal/relicModalStore'
import { useCallback, useMemo, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import type { Character, CharacterId, SavedBuild } from 'types/character'
import type { CustomImageConfig } from 'types/customImage'
import type { Relic } from 'types/relic'
import { useGlobalStore } from 'lib/stores/appStore'
import { useRelicStore } from 'lib/stores/relicStore'
import { useShowcaseTabStore } from 'lib/tabs/tabShowcase/useShowcaseTabStore'
import type { ShowcaseTabCharacter } from 'lib/tabs/tabShowcase/showcaseTabTypes'
import type { Parts } from 'lib/constants/constants'

export function useCharacterPreviewState(
  source: ShowcaseSource,
  character: Character | ShowcaseTabCharacter | null,
  savedBuildOverride?: SavedBuild | null,
) {
  const [selectedRelic, setSelectedRelic] = useState<Relic | null>(null)
  const setEditModalOpen = useCallback((_open: boolean, relic?: Relic) => {
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
  }, [character?.id, setSelectedRelic])
  const setAddModalOpen = useCallback((_open: boolean, part: Parts, relic?: Relic) => {
    useRelicModalStore.getState().openOverlay({
      selectedRelic: relic ?? null,
      selectedPart: part,
      defaultWearer: character?.id,
      onOk: (editedRelic: Relic) => {
        showcaseOnAddOk(editedRelic, setSelectedRelic)
      },
    })
  }, [character?.id, setSelectedRelic])
  const [editPortraitModalOpen, setEditPortraitModalOpen] = useState(false)
  const [customPortrait, setCustomPortrait] = useState<CustomImageConfig>()

  // Safe narrowing: fallback to empty string for selector key when no character
  const charId = (character?.id ?? '') as CharacterId
  const {
    teamSelection,
    showcasePreferences,
    showcaseTemporaryOptions,
    portraitColor,
    portraitSwatches,
  } = useShowcaseTabStore(
    useShallow((s) => ({
      teamSelection: s.showcaseTeamPreferenceById[charId],
      showcasePreferences: s.showcasePreferences[charId],
      showcaseTemporaryOptions: s.showcaseTemporaryOptionsByCharacter[charId],
      portraitColor: s.portraitColorByCharacterId[charId],
      portraitSwatches: s.portraitSwatchesByCharacterId[charId],
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

  // Cache-buster: when scoring metadata overrides change (SPD weight, deprioritize buffs),
  // the reference changes, busting both the layout memo (for combat score via
  // resolveDpsScoreSimulationMetadata) and previewRelics memo (for substat score via
  // RelicScorer.scoreCharacterWithRelics).
  const scoringMetadata = useScoringMetadata(character?.id)

  // Safe narrowing: downstream functions expect Character, but handle ShowcaseTabCharacter
  // correctly via the source parameter (source === SHOWCASE_TAB uses embedded relics, not IDs)
  const narrowedCharacter = character as Character | null

  const previewRelics = useMemo(() => {
    if (!narrowedCharacter) return null
    return getPreviewRelics(source, narrowedCharacter, relicsById, savedBuildOverride)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [source, narrowedCharacter, relicsById, savedBuildOverride, scoringMetadata])

  const finalStats = useMemo(() => {
    if (!narrowedCharacter || !previewRelics) return undefined
    const metadata = getShowcaseMetadata(narrowedCharacter)
    return getShowcaseStats(narrowedCharacter, previewRelics.displayRelics, metadata)
  }, [narrowedCharacter, previewRelics])

  return {
    selectedRelic,
    setSelectedRelic,
    setEditModalOpen,
    setAddModalOpen,
    editPortraitModalOpen,
    setEditPortraitModalOpen,
    customPortrait,
    setCustomPortrait,
    teamSelection,
    showcasePreferences,
    showcaseTemporaryOptions,
    portraitColor,
    portraitSwatches,
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

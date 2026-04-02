import { ShowcaseSource } from 'lib/characterPreview/CharacterPreviewComponents'
import { getPreviewRelics, getShowcaseStats, showcaseOnAddOk, showcaseOnEditOk } from 'lib/characterPreview/characterPreviewController'
import { ShowcaseColorMode } from 'lib/constants/constants'
import { SavedSessionKeys } from 'lib/constants/constantsSession'
import { useScoringMetadata } from 'lib/hooks/useScoringMetadata'
import { useRelicModalStore } from 'lib/overlays/modals/relicModal/relicModalStore'
import { useCallback, useMemo, useRef, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import type { Character, CharacterId, SavedBuild } from 'types/character'
import type { CustomImageConfig } from 'types/customImage'
import type { Relic } from 'types/relic'
import { useGlobalStore } from 'lib/stores/app/appStore'
import { useRelicStore } from 'lib/stores/relic/relicStore'
import { useShowcaseTabStore } from 'lib/tabs/tabShowcase/useShowcaseTabStore'
import type { ShowcaseTabCharacter } from 'lib/tabs/tabShowcase/showcaseTabTypes'
import type { Parts } from 'lib/constants/constants'

const EMPTY_RELICS: Partial<Record<string, Relic>> = {}

export function useCharacterPreviewState(
  source: ShowcaseSource,
  character: Character | ShowcaseTabCharacter | null,
  savedBuildOverride?: SavedBuild | null,
) {
  const [selectedRelic, setSelectedRelic] = useState<Relic | null>(null)

  // Ref so callbacks always see the current character ID without stale closure issues
  const charIdRef = useRef(character?.id)
  charIdRef.current = character?.id

  const setEditModalOpen = useCallback((_open: boolean, relic?: Relic) => {
    if (relic) {
      useRelicModalStore.getState().openOverlay({
        selectedRelic: relic,
        defaultWearer: charIdRef.current,
        onOk: (editedRelic: Relic) => showcaseOnEditOk(editedRelic, relic, setSelectedRelic),
      })
    }
  }, [setSelectedRelic])
  const setAddModalOpen = useCallback((_open: boolean, part: Parts, relic?: Relic) => {
    useRelicModalStore.getState().openOverlay({
      selectedRelic: relic ?? null,
      selectedPart: part,
      defaultWearer: charIdRef.current,
      onOk: (editedRelic: Relic) => {
        showcaseOnAddOk(editedRelic, setSelectedRelic)
      },
    })
  }, [setSelectedRelic])
  const [editPortraitModalOpen, setEditPortraitModalOpen] = useState(false)
  const [, setCustomPortrait] = useState<CustomImageConfig | undefined>()

  // Fallback to '' when no character so store selectors have a stable key type
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

  const { globalColorMode, storedScoringType, darkMode } = useGlobalStore(
    useShallow((s) => ({
      // STANDARD mode overrides per-character color preferences when active
      globalColorMode: s.savedSession[SavedSessionKeys.showcaseStandardMode]
        ? ShowcaseColorMode.STANDARD
        : ShowcaseColorMode.AUTO,
      storedScoringType: s.savedSession.scoringType,
      darkMode: s.savedSession.showcaseDarkMode,
    })),
  )

  // Source-aware relicsById: showcase characters have relics embedded, not in the store
  const relicsById = useRelicStore(useShallow((s) => {
    if (!character || source === ShowcaseSource.SHOWCASE_TAB) return EMPTY_RELICS
    const equipped = savedBuildOverride?.equipped ?? character.equipped
    const ids = [equipped?.Head, equipped?.Hands, equipped?.Body, equipped?.Feet, equipped?.PlanarSphere, equipped?.LinkRope]
      .filter((id): id is string => !!id)
    return Object.fromEntries(ids.map((id) => [id, s.relicsById[id]])) as Partial<Record<string, Relic>>
  }))

  // Reference changes when scoring overrides change (SPD weight, deprioritize buffs) — busts the memos below
  const scoringMetadata = useScoringMetadata(character?.id)

  // ShowcaseTabCharacter is handled correctly downstream via the source param — cast is safe
  const narrowedCharacter = character as Character | null

  const previewRelics = useMemo(() => {
    if (!narrowedCharacter) return null
    return getPreviewRelics(source, narrowedCharacter, relicsById, savedBuildOverride)
  // eslint-disable-next-line react-hooks/exhaustive-deps -- scoringMetadata is an intentional cache-buster, not used inside the callback
  }, [source, narrowedCharacter, relicsById, savedBuildOverride, scoringMetadata])

  const finalStats = useMemo(() => {
    if (!narrowedCharacter || !previewRelics) return undefined
    return getShowcaseStats(narrowedCharacter, previewRelics.displayRelics)
  }, [narrowedCharacter, previewRelics])

  return {
    selectedRelic,
    setSelectedRelic,
    setEditModalOpen,
    setAddModalOpen,
    editPortraitModalOpen,
    setEditPortraitModalOpen,
    setCustomPortrait,
    teamSelection,
    showcasePreferences,
    showcaseTemporaryOptions,
    portraitColor,
    portraitSwatches,
    globalColorMode,
    relicsById,
    storedScoringType,
    darkMode,
    scoringMetadata,
    previewRelics,
    finalStats,
  }
}

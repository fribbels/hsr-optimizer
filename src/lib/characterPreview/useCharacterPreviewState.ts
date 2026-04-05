import { ShowcaseSource } from 'lib/characterPreview/CharacterPreviewComponents'
import {
  getPreviewRelics,
  getShowcaseStats,
  showcaseOnAddOk,
  showcaseOnEditOk,
} from 'lib/characterPreview/characterPreviewController'
import { ShowcaseColorMode } from 'lib/constants/constants'
import type { Parts } from 'lib/constants/constants'
import { SavedSessionKeys } from 'lib/constants/constantsSession'
import { useScoringMetadata } from 'lib/hooks/useScoringMetadata'
import { useRelicModalStore } from 'lib/overlays/modals/relicModal/relicModalStore'
import { useGlobalStore } from 'lib/stores/app/appStore'
import { useRelicStore } from 'lib/stores/relic/relicStore'
import type { ShowcaseTabCharacter } from 'lib/tabs/tabShowcase/showcaseTabTypes'
import { useShowcaseTabStore } from 'lib/tabs/tabShowcase/useShowcaseTabStore'
import {
  useCallback,
  useMemo,
  useRef,
  useState,
} from 'react'
import type {
  Character,
  SavedBuild,
} from 'types/character'
import type { CustomImageConfig } from 'types/customImage'
import type { Relic } from 'types/relic'
import { useShallow } from 'zustand/react/shallow'

const EMPTY_RELICS: Partial<Record<string, Relic>> = {}

export function useCharacterPreviewState(
  source: ShowcaseSource,
  character: Character | ShowcaseTabCharacter,
  savedBuildOverride?: SavedBuild | null,
) {
  const [selectedRelic, setSelectedRelic] = useState<Relic | null>(null)

  // Ref so callbacks always see the current character ID without stale closure issues
  const charIdRef = useRef(character.id)
  charIdRef.current = character.id

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

  const charId = character.id
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
    if (source === ShowcaseSource.SHOWCASE_TAB) return EMPTY_RELICS
    const equipped = savedBuildOverride?.equipped ?? character.equipped
    const ids = [equipped?.Head, equipped?.Hands, equipped?.Body, equipped?.Feet, equipped?.PlanarSphere, equipped?.LinkRope]
      .filter((id): id is string => !!id)
    return Object.fromEntries(ids.map((id) => [id, s.relicsById[id]])) as Partial<Record<string, Relic>>
  }))

  // Reference changes when scoring overrides change (SPD weight, deprioritize buffs) — busts the memos below
  const scoringMetadata = useScoringMetadata(character.id)

  // ShowcaseTabCharacter is handled correctly downstream via the source param — cast is safe
  const narrowedCharacter = character as Character

  const previewRelics = useMemo(() => {
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

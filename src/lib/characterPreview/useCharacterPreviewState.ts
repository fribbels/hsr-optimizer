import { ShowcaseSource } from 'lib/characterPreview/CharacterPreviewComponents'
import {
  getPreviewRelics,
  getShowcaseStats,
  showcaseOnAddOk,
  showcaseOnEditOk,
} from 'lib/characterPreview/characterPreviewController'
import { ShowcaseColorMode } from 'lib/constants/constants'
import type { Parts, TeamSelection } from 'lib/constants/constants'
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
import type { ScoringConfigType } from 'types/metadata'
import type { Relic } from 'types/relic'
import { useShallow } from 'zustand/react/shallow'

const EMPTY_RELICS: Partial<Record<string, Relic>> = {}
const EMPTY_TEAM_SELECTIONS: Partial<Record<ScoringConfigType, TeamSelection>> = {}

export function useCharacterPreviewState(
  source: ShowcaseSource,
  character: Character | ShowcaseTabCharacter,
  savedBuildOverride?: SavedBuild | null,
) {
  const [selectedRelic, setSelectedRelic] = useState<Relic | null>(null)

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
    teamSelections,
    showcasePreferences,
    showcaseTemporaryOptions,
    portraitColor,
    portraitSwatches,
  } = useShowcaseTabStore(
    useShallow((s) => ({
      teamSelections: s.showcaseTeamPreferenceByConfig[charId],
      showcasePreferences: s.showcasePreferences[charId],
      showcaseTemporaryOptions: s.showcaseTemporaryOptionsByCharacter[charId],
      portraitColor: s.portraitColorByCharacterId[charId],
      portraitSwatches: s.portraitSwatchesByCharacterId[charId],
    })),
  )

  const { globalColorMode, storedScoringType, darkMode } = useGlobalStore(
    useShallow((s) => ({
      globalColorMode: s.savedSession[SavedSessionKeys.showcaseStandardMode]
        ? ShowcaseColorMode.STANDARD
        : ShowcaseColorMode.AUTO,
      storedScoringType: s.savedSession.scoringType,
      darkMode: s.savedSession.showcaseDarkMode,
    })),
  )

  const relicsById = useRelicStore(useShallow((s) => {
    if (source === ShowcaseSource.SHOWCASE_TAB) return EMPTY_RELICS
    const equipped = savedBuildOverride?.equipped ?? character.equipped
    const ids = [equipped?.Head, equipped?.Hands, equipped?.Body, equipped?.Feet, equipped?.PlanarSphere, equipped?.LinkRope]
      .filter((id): id is string => !!id)
    return Object.fromEntries(ids.map((id) => [id, s.relicsById[id]])) as Partial<Record<string, Relic>>
  }))

  const scoringMetadata = useScoringMetadata(character.id)

  const { previewRelics, finalStats } = useMemo(() => {
    const previewRelics = getPreviewRelics(source, character as Character, relicsById, savedBuildOverride)
    const finalStats = (character && previewRelics)
      ? getShowcaseStats(character as Character, previewRelics.displayRelics, savedBuildOverride)
      : undefined
    return { previewRelics, finalStats }
    // scoringMetadata is an intentional cache-buster, not used inside the callback
  }, [source, character, relicsById, savedBuildOverride, scoringMetadata])

  return {
    selectedRelic,
    setSelectedRelic,
    setEditModalOpen,
    setAddModalOpen,
    editPortraitModalOpen,
    setEditPortraitModalOpen,
    setCustomPortrait,
    teamSelections: teamSelections ?? EMPTY_TEAM_SELECTIONS,
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

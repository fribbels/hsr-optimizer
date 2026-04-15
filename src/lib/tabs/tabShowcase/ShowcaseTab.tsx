import {
  Button,
  Flex,
  Loader,
  Menu,
  TextInput,
} from '@mantine/core'
import {
  IconChevronDown,
  IconSearch,
} from '@tabler/icons-react'
import { CharacterPreview } from 'lib/characterPreview/CharacterPreview'
import { ShowcaseSource } from 'lib/characterPreview/CharacterPreviewComponents'
import { DPSScoreDisclaimer } from 'lib/characterPreview/DPSScoreDisclaimer'
import { AppPages } from 'lib/constants/appPages'
import {
  DOWNTIME_VERSION,
  SHOWCASE_DOWNTIME,
} from 'lib/constants/constants'
import { TabVisibilityContext } from 'lib/hooks/useTabVisibility'
import { Hint } from 'lib/interactions/hint'
import { useCharacterModalStore } from 'lib/overlays/modals/characterModalStore'
import { SaveState } from 'lib/state/saveState'
import { useGlobalStore } from 'lib/stores/app/appStore'
import { submitForm } from 'lib/tabs/tabShowcase/showcaseApi'
import { ShowcasePortraitRow } from 'lib/tabs/tabShowcase/ShowcasePortraitRow'
import {
  handleCharacterModalOk,
  importShowcaseCharacters,
  initializeShowcaseOnMount,
  parseShowcaseUrlId,
  type Preset,
  syncShowcaseUrl,
} from 'lib/tabs/tabShowcase/showcaseTabController'
import { ShowcaseScreen } from 'lib/tabs/tabShowcase/showcaseTabTypes'
import { SimulationSidebar } from 'lib/tabs/tabShowcase/SimulationSidebar'
import {
  getSelectedCharacter,
  useShowcaseTabStore,
} from 'lib/tabs/tabShowcase/useShowcaseTabStore'
import { useDeferReveal } from 'lib/ui/DeferredRender'
import { TooltipImage } from 'lib/ui/TooltipImage'
import {
  startTransition,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'
import { useTranslation } from 'react-i18next'
import type { Character } from 'types/character'
import { useShallow } from 'zustand/react/shallow'
import styles from './ShowcaseTab.module.css'

const PRERENDER_HIDDEN: React.CSSProperties = {
  visibility: 'hidden',
  position: 'absolute',
  pointerEvents: 'none',
}

export function ShowcaseTab() {
  const screen = useShowcaseTabStore((s) => s.screen)
  const hasData = useShowcaseTabStore((s) => !!s.availableCharacters?.length)

  const { isActiveRef, addActivationListener } = useContext(TabVisibilityContext)

  useEffect(() => {
    if (isActiveRef.current) {
      // Tab is active on mount — initialize immediately
      initializeShowcaseOnMount()
    } else {
      // Tab mounted in background — defer until first activation
      let initialized = false
      return addActivationListener(() => {
        if (!initialized) {
          initialized = true
          initializeShowcaseOnMount()
        }
      })
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => addActivationListener(() => syncShowcaseUrl()), [addActivationListener])

  const { t } = useTranslation('relicScorerTab')

  return (
    <Flex direction='column' align='center' style={{ flex: 1 }}>
      {SHOWCASE_DOWNTIME && (
        <h3 className={styles.downtimeWarning}>
          {t('Header.DowntimeWarning', { game_version: DOWNTIME_VERSION })}
        </h3>
      )}

      {screen === ShowcaseScreen.Landing && <RedirectToHome />}
      {screen === ShowcaseScreen.Loading && <ShowcaseLoading />}

      {/* Mount ShowcaseLoaded when data exists or screen is Loaded (e.g. after fetch failure) */}
      {(hasData || screen === ShowcaseScreen.Loaded) && (
        <div style={screen !== ShowcaseScreen.Loaded ? PRERENDER_HIDDEN : undefined}>
          <ShowcaseLoaded />
        </div>
      )}
    </Flex>
  )
}

function RedirectToHome() {
  const savedScorerId = useShowcaseTabStore((s) => s.savedSession.scorerId)

  useEffect(() => {
    // Don't redirect if there's a UID in the URL or a saved session —
    // initializeShowcaseOnMount will handle transitioning to Loading
    const urlId = parseShowcaseUrlId()
    if (urlId || savedScorerId) return

    useGlobalStore.getState().setActiveKey(AppPages.HOME)
  }, [savedScorerId])
  return null
}

function ShowcaseLoading() {
  const scorerId = useShowcaseTabStore((s) => s.savedSession.scorerId)
  const { t } = useTranslation('relicScorerTab')

  return (
    <div className={styles.loadingContainer}>
      <Loader size='lg' />
      <div className={styles.loadingText}>
        {t('Loading.FetchingShowcase', { scorerId: scorerId ?? '' })}
      </div>
    </div>
  )
}

function ShowcaseLoaded() {
  const containerRef = useDeferReveal()
  const selectedCharacter = useShowcaseTabStore((s) => s.availableCharacters?.[s.selectedIndex] ?? null)

  const { availableCharacters, selectedIndex, loading, sidebarOpen } = useShowcaseTabStore(
    useShallow((s) => ({
      availableCharacters: s.availableCharacters,
      selectedIndex: s.selectedIndex,
      loading: s.loading,
      sidebarOpen: s.savedSession.sidebarOpen,
    })),
  )

  const setScoringAlgorithmFocusCharacter = useGlobalStore((s) => s.setScoringAlgorithmFocusCharacter)

  const { t } = useTranslation(['relicScorerTab', 'common'])

  // Controlled UID input, synced from store
  const scorerId = useShowcaseTabStore((s) => s.savedSession.scorerId)
  const [uid, setUid] = useState(scorerId ?? '')
  useEffect(() => {
    if (scorerId != null) {
      setUid(scorerId)
    }
  }, [scorerId])

  // Sync scoring focus character
  useEffect(() => {
    setScoringAlgorithmFocusCharacter(selectedCharacter?.id)
  }, [selectedCharacter?.id, setScoringAlgorithmFocusCharacter])

  // Stable callbacks
  const setOriginalCharacterModalInitialCharacter = useCallback((character: Character | null) => {
    useCharacterModalStore.getState().openOverlay({
      initialCharacter: character,
      onOk: handleCharacterModalOk,
      showSetSelection: true,
    })
  }, [])

  const setOriginalCharacterModalOpen = useCallback((open: boolean) => {
    if (!open) useCharacterModalStore.getState().closeOverlay()
  }, [])

  const onSelect = useCallback((index: number) => {
    startTransition(() => useShowcaseTabStore.getState().selectCharacter(index))
  }, [])

  const presetClicked = useCallback((preset: Preset) => {
    if (preset.custom) {
      useCharacterModalStore.getState().openOverlay({
        initialCharacter: getSelectedCharacter(),
        onOk: handleCharacterModalOk,
        showSetSelection: true,
      })
      return
    }

    handleCharacterModalOk({
      characterId: preset.characterId,
      lightCone: preset.lightConeId,
      characterEidolon: preset.characterEidolon ?? 0,
      lightConeSuperimposition: preset.lightConeSuperimposition ?? 1,
    })
  }, [])

  const onSidebarToggle = useCallback(() => {
    const current = useShowcaseTabStore.getState().savedSession.sidebarOpen
    useShowcaseTabStore.getState().setSidebarOpen(!current)
    SaveState.delayedSave()
  }, [])

  const handleSubmit = () => {
    if (uid.trim()) {
      submitForm({ scorerId: uid.trim() })
    }
  }

  const importMenuItems = [
    {
      label: t('ImportLabels.Relics'),
      key: 'relics' as const,
    },
    {
      label: t('ImportLabels.SingleCharacter'),
      key: 'singleCharacter' as const,
    },
    {
      label: t('ImportLabels.AllCharacters'),
      key: 'multiCharacter' as const,
    },
  ]

  return (
    <Flex ref={containerRef} className={styles.outerWrapper} justify='space-around'>
      <Flex direction='column' align='center' gap={8} className={styles.loadedContainer}>
        {/* UID input row */}
        <Flex className={styles.formRow} justify='center' align='center' gap={10}>
          <TextInput
            className={styles.uidInput}
            placeholder={t('SubmissionBar.Placeholder')}
            value={uid}
            onChange={(e) => setUid(e.currentTarget.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSubmit()
            }}
          />
          <Button
            loading={loading}
            className={styles.submitButton}
            leftSection={<IconSearch size={16} />}
            onClick={handleSubmit}
          >
            {t('common:Submit')}
          </Button>
          {availableCharacters && availableCharacters.length > 0 && (
            <Menu>
              <Menu.Target>
                <Button
                  rightSection={<IconChevronDown size={14} />}
                  variant='default'
                >
                  {t('relicScorerTab:Buttons.Import')}
                </Button>
              </Menu.Target>
              <Menu.Dropdown>
                {importMenuItems.map((item, i) => (
                  <Menu.Item key={i} onClick={() => importShowcaseCharacters(item.key)}>
                    {item.label}
                  </Menu.Item>
                ))}
              </Menu.Dropdown>
            </Menu>
          )}
          <TooltipImage type={Hint.showcaseUid()} />
        </Flex>

        {/* DPS Score Disclaimer */}
        <DPSScoreDisclaimer />

        {/* Portrait row */}
        {availableCharacters && availableCharacters.length > 0 && (
          <ShowcasePortraitRow
            characters={availableCharacters}
            selectedIndex={selectedIndex}
            onSelect={onSelect}
          />
        )}

        {/* Card area with simulation sidebar */}
        <div className={styles.cardArea}>
          <SimulationSidebar
            open={sidebarOpen}
            onToggle={onSidebarToggle}
            onPresetClick={presetClicked}
          />
          <CharacterPreview
            character={selectedCharacter}
            source={ShowcaseSource.SHOWCASE_TAB}
            id='relicScorerPreview'
            setOriginalCharacterModalOpen={setOriginalCharacterModalOpen}
            setOriginalCharacterModalInitialCharacter={setOriginalCharacterModalInitialCharacter}
          />
        </div>
      </Flex>
    </Flex>
  )
}

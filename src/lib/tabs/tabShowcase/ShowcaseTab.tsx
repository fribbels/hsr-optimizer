import {
  IconCamera,
  IconChevronDown,
  IconDownload,
  IconFileImport,
} from '@tabler/icons-react'
import { Button, Flex, Loader, Menu, TextInput } from '@mantine/core'
import { CharacterPreview } from 'lib/characterPreview/CharacterPreview'
import { ShowcaseSource } from 'lib/characterPreview/CharacterPreviewComponents'
import { DPSScoreDisclaimer } from 'lib/characterPreview/DPSScoreDisclaimer'
import {
  CURRENT_DATA_VERSION,
  DOWNTIME_VERSION,
  officialOnly,
  SHOWCASE_DOWNTIME,
} from 'lib/constants/constants'
import { useScreenshotAction } from 'lib/hooks/useScreenshotAction'
import { TabVisibilityContext } from 'lib/hooks/useTabVisibility'
import { useCharacterModalStore } from 'lib/overlays/modals/characterModalStore'
import { SaveState } from 'lib/state/saveState'
import { useGlobalStore } from 'lib/stores/appStore'
import {
  handleCharacterModalOk,
  importShowcaseCharacters,
  initializeShowcaseOnMount,
  type Preset,
  syncShowcaseUrl,
} from 'lib/tabs/tabShowcase/showcaseTabController'
import { ShowcaseScreen } from 'lib/tabs/tabShowcase/showcaseTabTypes'
import { ShowcasePortraitRow } from 'lib/tabs/tabShowcase/ShowcasePortraitRow'
import { SimulationSidebar } from 'lib/tabs/tabShowcase/SimulationSidebar'
import { submitForm } from 'lib/tabs/tabShowcase/showcaseApi'
import { getSelectedCharacter, useShowcaseTabStore } from 'lib/tabs/tabShowcase/useShowcaseTabStore'
import {
  startTransition,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'
import { useTranslation } from 'react-i18next'
import { useShallow } from 'zustand/react/shallow'
import type { Character } from 'types/character'
import styles from './ShowcaseTab.module.css'

const PRERENDER_HIDDEN: React.CSSProperties = {
  visibility: 'hidden',
  position: 'absolute',
  pointerEvents: 'none',
}

export function ShowcaseTab() {
  const screen = useShowcaseTabStore((s) => s.screen)
  const hasData = useShowcaseTabStore((s) => !!s.availableCharacters?.length)

  useEffect(() => initializeShowcaseOnMount(), [])

  const { addActivationListener } = useContext(TabVisibilityContext)
  useEffect(() => addActivationListener(() => syncShowcaseUrl()), [addActivationListener])

  const { t } = useTranslation('relicScorerTab')

  return (
    <Flex direction="column" align="center" style={{ flex: 1 }}>
      {SHOWCASE_DOWNTIME && (
        <h3 className={styles.downtimeWarning}>
          {t('Header.DowntimeWarning', { game_version: DOWNTIME_VERSION })}
        </h3>
      )}

      {screen === ShowcaseScreen.Landing && <ShowcaseLanding />}
      {screen === ShowcaseScreen.Loading && <ShowcaseLoading />}

      {/* Mount ShowcaseLoaded when data exists — hidden during Loading for pre-render */}
      {hasData && (
        <div style={screen !== ShowcaseScreen.Loaded ? PRERENDER_HIDDEN : undefined}>
          <ShowcaseLoaded />
        </div>
      )}
    </Flex>
  )
}

function ShowcaseLanding() {
  const savedScorerId = useShowcaseTabStore((s) => s.savedSession.scorerId)
  const [uid, setUid] = useState(savedScorerId ?? '')
  const { t } = useTranslation(['relicScorerTab', 'common'])

  const handleSubmit = () => {
    if (uid.trim()) {
      submitForm({ scorerId: uid.trim() })
    }
  }

  return (
    <div className={styles.landingContainer}>
      <div className={styles.landingTitle}>Showcase</div>
      <div className={styles.landingSubtitle}>
        {officialOnly
          ? t('Header.WithoutVersion')
          : t('Header.WithVersion', { beta_version: CURRENT_DATA_VERSION })}
      </div>
      <Flex align="center" gap={10}>
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
          className={styles.submitButton}
          onClick={handleSubmit}
        >
          {t('common:Submit')}
        </Button>
      </Flex>
    </div>
  )
}

function ShowcaseLoading() {
  const scorerId = useShowcaseTabStore((s) => s.savedSession.scorerId)

  return (
    <div className={styles.loadingContainer}>
      <Loader size="lg" />
      <div className={styles.loadingText}>
        Fetching showcase for {scorerId}
      </div>
    </div>
  )
}

function ShowcaseLoaded() {
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
  const { t: tCharacter } = useTranslation('gameData', { keyPrefix: 'Characters' })

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

  // Screenshot hooks
  const { loading: screenshotLoading, trigger: screenshotTrigger } = useScreenshotAction('relicScorerPreview')
  const { loading: downloadLoading, trigger: downloadTrigger } = useScreenshotAction('relicScorerPreview')

  // Stable callbacks
  const setOriginalCharacterModalInitialCharacter = useCallback((character: Character | null) => {
    useCharacterModalStore.getState().openOverlay({
      initialCharacter: character,
      onOk: handleCharacterModalOk,
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
      })
      return
    }

    handleCharacterModalOk({
      characterId: preset.characterId,
      lightCone: preset.lightConeId,
      characterEidolon: 0,
      lightConeSuperimposition: 1,
    })
  }, [])

  const clipboardClicked = useCallback(() => {
    screenshotTrigger('clipboard')
  }, [screenshotTrigger])

  const downloadClicked = useCallback(() => {
    const char = getSelectedCharacter()
    const name = char ? tCharacter(`${char.id}.Name`) : null
    downloadTrigger('download', name)
  }, [downloadTrigger, tCharacter])


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
      label: t('ImportLabels.AllCharacters'),
      key: 'multiCharacter' as const,
    },
    {
      label: t('ImportLabels.SingleCharacter'),
      key: 'singleCharacter' as const,
    },
  ]

  return (
    <Flex className={styles.outerWrapper} justify="space-around">
      <Flex direction="column" align="center" gap={8} className={styles.loadedContainer}>
        {/* UID input row */}
        <Flex className={styles.formRow} justify="center" align="center" gap={10}>
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
            onClick={handleSubmit}
          >
            {t('common:Submit')}
          </Button>
        </Flex>

        {/* Action buttons row */}
        <Flex className={styles.actionRow} justify="space-between">
          <Button
            className={styles.flexOne}
            onClick={clipboardClicked}
            leftSection={<IconCamera size={16} />}
            loading={screenshotLoading}
          >
            {t('CopyScreenshot')}
          </Button>
          <Button
            className={styles.downloadButton}
            leftSection={<IconDownload size={16} />}
            onClick={downloadClicked}
            loading={downloadLoading}
            variant="default"
          />
          <Menu>
            <Flex className={styles.flexOne}>
              <Button
                className={styles.importButton}
                onClick={() => importShowcaseCharacters('singleCharacter')}
                leftSection={<IconFileImport size={16} />}
              >
                {t('ImportLabels.Relics')}
              </Button>
              <Menu.Target>
                <Button className={styles.chevronButton}>
                  <IconChevronDown size={16} />
                </Button>
              </Menu.Target>
            </Flex>
            <Menu.Dropdown>
              {importMenuItems.map((item) => (
                <Menu.Item key={item.key} onClick={() => importShowcaseCharacters(item.key)}>
                  <Flex gap={10}>
                    <IconFileImport />
                    {item.label}
                  </Flex>
                </Menu.Item>
              ))}
            </Menu.Dropdown>
          </Menu>
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
            character={selectedCharacter as Character | null}
            source={ShowcaseSource.SHOWCASE_TAB}
            id="relicScorerPreview"
            setOriginalCharacterModalOpen={setOriginalCharacterModalOpen}
            setOriginalCharacterModalInitialCharacter={setOriginalCharacterModalInitialCharacter}
          />
        </div>
      </Flex>
    </Flex>
  )
}

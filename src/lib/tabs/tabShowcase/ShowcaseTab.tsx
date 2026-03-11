import {
  IconCamera,
  IconChevronDown,
  IconDownload,
  IconEdit,
  IconEyeOff,
  IconFileImport,
  IconFlask,
  IconSettings,
} from '@tabler/icons-react'
import { useForm } from '@mantine/form'
import { Accordion, Button, Flex, Menu, Popover, SegmentedControl, Text, TextInput } from '@mantine/core'
import { CharacterPreview } from 'lib/characterPreview/CharacterPreview'
import { ShowcaseSource } from 'lib/characterPreview/CharacterPreviewComponents'
import {
  CURRENT_DATA_VERSION,
  DOWNTIME_VERSION,
  officialOnly,
  SHOWCASE_DOWNTIME,
} from 'lib/constants/constants'
import {
  OpenCloseIDs,
  setOpen,
} from 'lib/hooks/useOpenClose'
import CharacterModal from 'lib/overlays/modals/CharacterModal'
import { Assets } from 'lib/rendering/assets'
import { useGlobalStore, AppPages } from 'lib/state/db'
import { SaveState } from 'lib/state/saveState'
import {
  CharacterPreset,
  importClicked,
  initialiseShowcaseTab,
  onCharacterModalOk,
  Preset,
  presetCharacters,
  ShowcaseTabForm,
  submitForm,
} from 'lib/tabs/tabShowcase/showcaseTabController'
import { useShowcaseTabStore } from 'lib/tabs/tabShowcase/useShowcaseTabStore'
import { Utils } from 'lib/utils/utils'
import {
  Dispatch,
  SetStateAction,
  useEffect,
  useMemo,
  useState,
} from 'react'
import {
  Trans,
  useTranslation,
} from 'react-i18next'
import { Character } from 'types/character'
import { SettingOptions } from '../../overlays/drawers/SettingsDrawer'
import styles from './ShowcaseTab.module.css'

const RERUN_PRESET_SIZE = 45
const PRESET_SIZE = 95

export default function ShowcaseTab() {
  const loading = useShowcaseTabStore((s) => s.loading)
  const scorerId = useShowcaseTabStore((s) => s.savedSession.scorerId)
  const availableCharacters = useShowcaseTabStore((s) => s.availableCharacters)

  const showcaseForm = useForm<ShowcaseTabForm>({ initialValues: { scorerId: scorerId ?? '' } })
  window.showcaseTabForm = showcaseForm

  const activeKey = useGlobalStore((s) => s.activeKey)
  const { t } = useTranslation(['relicScorerTab', 'common'])

  useEffect(() => initialiseShowcaseTab(activeKey), [activeKey])

  if (activeKey != AppPages.SHOWCASE && !availableCharacters?.length) {
    return <></>
  }
  return (
    <div>
      <Flex direction="column" gap={0} align='center'>
        {SHOWCASE_DOWNTIME && (
          <Flex gap={10} direction="column" align='center'>
            <Text>
              <h3 className={styles.downtimeWarning}>{t('Header.DowntimeWarning', { game_version: DOWNTIME_VERSION })}</h3>
            </Text>
          </Flex>
        )}

        <Flex gap={10} direction="column" align='center'>
          <Text>
            {officialOnly
              ? t('Header.WithoutVersion')
              : t('Header.WithVersion', { beta_version: CURRENT_DATA_VERSION })}
            {
              // "WithoutVersion": "Enter your account UID to score your profile character at level 80 & maxed traces. Log out to refresh instantly."
              // "WithVersion": "Enter your account UID to score your profile character at level 80 & maxed traces. Log out to refresh instantly. (Current version {{beta_version}} )",
            }
          </Text>
        </Flex>
        <form onSubmit={showcaseForm.onSubmit(submitForm)}>
          <Flex className={styles.formRow} justify='center' align='center' gap={10}>
            <TextInput
              className={styles.uidInput}
              placeholder={t('SubmissionBar.Placeholder') /* Account UID */}
              {...showcaseForm.getInputProps('scorerId')}
            />
            <Button
              type='submit'
              loading={loading}
              className={styles.submitButton}
            >
              {t('common:Submit') /* Submit */}
            </Button>
            <Button
              className={styles.scoringButton}
              onClick={() => setOpen(OpenCloseIDs.SCORING_MODAL)}
              leftSection={<IconSettings size={16} />}
              variant="default"
            >
              {t('SubmissionBar.AlgorithmButton') /* Scoring algorithm */}
            </Button>
          </Flex>
        </form>
        <CharacterPreviewSelection />
      </Flex>
    </div>
  )
}

function CharacterPreviewSelection() {
  const setScoringAlgorithmFocusCharacter = useGlobalStore((s) => s.setScoringAlgorithmFocusCharacter)

  const selectedCharacter = useShowcaseTabStore((s) => s.selectedCharacter)
  const availableCharacters = useShowcaseTabStore((s) => s.availableCharacters)

  const [isCharacterModalOpen, setCharacterModalOpen] = useState(false)
  const [characterModalInitialCharacter, setCharacterModalInitialCharacter] = useState(selectedCharacter)
  const [screenshotLoading, setScreenshotLoading] = useState(false)
  const [downloadLoading, setDownloadLoading] = useState(false)

  const { t } = useTranslation('relicScorerTab')
  const { t: tCharacter } = useTranslation('gameData', { keyPrefix: 'Characters' })

  useEffect(() => {
    setScoringAlgorithmFocusCharacter(selectedCharacter?.id)
  }, [selectedCharacter?.id, setScoringAlgorithmFocusCharacter])

  function simulateClicked() {
    console.log('Simulate', selectedCharacter)
    setCharacterModalOpen(true)
    setCharacterModalInitialCharacter(selectedCharacter)
  }

  function clipboardClicked() {
    setScreenshotLoading(true)
    // Use a small timeout here so the spinner doesn't lag while the image is being generated
    setTimeout(() => {
      void Utils.screenshotElementById('relicScorerPreview', 'clipboard').finally(() => {
        setScreenshotLoading(false)
      })
    }, 100)
  }

  function downloadClicked() {
    setDownloadLoading(true)
    // Use a small timeout here so the spinner doesn't lag while the image is being generated
    setTimeout(() => {
      const name = selectedCharacter ? tCharacter(`${selectedCharacter.id}.Name`) : null
      void Utils.screenshotElementById('relicScorerPreview', 'download', name).finally(() => {
        setDownloadLoading(false)
      })
    }, 100)
  }

  function presetClicked(e: Preset) {
    if (e.custom) {
      return simulateClicked()
    }

    onCharacterModalOk({
      characterId: e.characterId,
      lightCone: e.lightConeId,
      characterEidolon: 0,
      lightConeSuperimposition: 1,
    })
  }

  const items = [
    {
      label: (
        <Flex gap={10}>
          <IconFileImport />
          {t('ImportLabels.AllCharacters') /* Import all characters & all relics into optimizer */}
        </Flex>
      ),
      key: 'multiCharacter',
    },
    {
      label: (
        <Flex gap={10}>
          <IconFileImport />
          {t('ImportLabels.SingleCharacter') /* Import selected character & all relics into optimizer */}
        </Flex>
      ),
      key: 'singleCharacter',
    },
  ]

  const handleMenuClicked = (e: { key: string }) => {
    importClicked(e.key as 'multiCharacter' | 'singleCharacter')
  }

  const menuProps = {
    items,
    onClick: handleMenuClicked,
  }

  const options = []
  for (let i = 0; i < (availableCharacters?.length ?? 0); i++) {
    const availableCharacter = availableCharacters![i]
    options.push({
      label: (
        <Flex align='center' justify='space-around'>
          <img
            className={styles.avatarImage}
            src={Assets.getCharacterAvatarById(availableCharacter.id)}
          />
        </Flex>
      ),
      value: availableCharacter.id,
      key: i,
    })
  }

  return (
    <Flex className={styles.outerWrapper} justify='space-around'>
      <Flex direction="column" align='center' gap={8} className={styles.innerColumn}>
        <Flex
          direction="column"
          style={{
            display: (availableCharacters?.length && availableCharacters.length > 0) ? 'flex' : 'none',
            width: '100%',
          }}
        >
          <Sidebar presetClicked={presetClicked} />

          <Flex
            style={{
              display: (availableCharacters?.length && availableCharacters.length > 0) ? 'flex' : 'none',
            }}
            justify='space-between'
            gap={10}
          >
            <Button
              className={styles.flexOne}
              onClick={clipboardClicked}
              leftSection={<IconCamera size={16} />}
              loading={screenshotLoading}
            >
              {t('CopyScreenshot') /* Copy screenshot */}
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
                  onClick={() => importClicked('singleCharacter')}
                  leftSection={<IconFileImport size={16} />}
                >
                  {t('ImportLabels.Relics') /* Import relics into optimizer */}
                </Button>
                <Menu.Target>
                  <Button className={styles.chevronButton}>
                    <IconChevronDown size={16} />
                  </Button>
                </Menu.Target>
              </Flex>
              <Menu.Dropdown>
                {items.map((item) => (
                  <Menu.Item key={item.key} onClick={() => handleMenuClicked({ key: item.key })}>
                    {item.label}
                  </Menu.Item>
                ))}
              </Menu.Dropdown>
            </Menu>
            <Button
              className={styles.flexOne}
              leftSection={<IconFlask size={16} />}
              onClick={simulateClicked}
              variant="default"
            >
              {t('SimulateRelics') /* Simulate relics on another character */}
            </Button>
          </Flex>
        </Flex>

        {(availableCharacters?.length != undefined && availableCharacters.length > 0)
          && <DPSScoreDisclaimer />}

        <SegmentedControl
          className={styles.segmentedControl}
          data={options}
          fullWidth
          onChange={(value) => useShowcaseTabStore.getState().onSelectionChanged(value as any)}
          value={selectedCharacter?.id}
        />

        <div id='previewWrapper' className={styles.previewWrapper}>
          <CharacterPreview
            character={selectedCharacter as Character | null}
            source={ShowcaseSource.SHOWCASE_TAB}
            id='relicScorerPreview'
            setOriginalCharacterModalOpen={setCharacterModalOpen}
            setOriginalCharacterModalInitialCharacter={setCharacterModalInitialCharacter as Dispatch<SetStateAction<Character | null>>}
          />
        </div>

        <CharacterModal
          onOk={onCharacterModalOk}
          open={isCharacterModalOpen}
          setOpen={setCharacterModalOpen}
          initialCharacter={characterModalInitialCharacter as Character | null}
        />
      </Flex>
    </Flex>
  )
}

function Sidebar(props: { presetClicked: (preset: Preset) => void }) {
  const [open, setOpen] = useState(useShowcaseTabStore.getState().savedSession.sidebarOpen)
  const activeKey = useGlobalStore((s) => s.activeKey)

  useEffect(() => {
    useShowcaseTabStore.getState().setSidebarOpen(open)
    SaveState.delayedSave()
  }, [open])

  const dropdownDisplay = useMemo(() => {
    let key = 0
    return (
      <Flex
        direction="column"
        gap={3}
        justify='center'
        className={styles.sidebarDropdown}
      >
        {presetCharacters().map((preset) => {
          const icon = preset.custom ? <IconEdit className={styles.editIcon} /> : <PresetButton preset={preset} />
          return (
            <Button
              key={key++}
              variant='transparent'
              style={{
                width: preset.rerun ? RERUN_PRESET_SIZE + 2 : PRESET_SIZE + 8,
                height: preset.rerun ? RERUN_PRESET_SIZE + 2 : PRESET_SIZE + 8,
                paddingTop: 2,
                display: activeKey === AppPages.SHOWCASE ? 'flex' : 'none',
              }}
              onClick={() => props.presetClicked(preset)}
            >
              {icon}
            </Button>
          )
        })}
      </Flex>
    )
  }, [props, activeKey])

  return (
    <Flex
      direction="column"
      className={styles.sidebarContainer}
    >
      <Popover opened={open} position='right-start' withArrow={false} shadow='md'>
        <Popover.Target>
          <a
            onClick={(e) => {
              e.preventDefault()
              setOpen(!open)
            }}
          >
            <Button
              className={styles.toggleButton}
            >
              <IconFlask className={styles.flaskIcon} />
            </Button>
          </a>
        </Popover.Target>
        <Popover.Dropdown className={styles.popoverDropdown}>
          {dropdownDisplay}
        </Popover.Dropdown>
      </Popover>
    </Flex>
  )
}

function PresetButton(props: { preset: CharacterPreset }) {
  const { preset } = props
  if (preset.rerun) {
    return (
      <img
        src={Assets.getCharacterAvatarById(preset.characterId)}
        className={styles.rerunPresetImage}
      />
    )
  }

  return (
    <img
      src={Assets.getCharacterAvatarById(preset.characterId)}
      className={styles.presetImage}
    />
  )
}

export function DPSScoreDisclaimer() {
  const showComboDmgWarning = useGlobalStore((s) => s.settings.ShowComboDmgWarning)

  const { t } = useTranslation('relicScorerTab')
  const { t: tSettings } = useTranslation('settings')

  if (showComboDmgWarning != SettingOptions.ShowComboDmgWarning.Show) return null

  return (
    <Accordion className={styles.accordion} styles={{ control: { backgroundColor: '#8a1717' } }}>
      <Accordion.Item value="1">
        <Accordion.Control>
          <div className={styles.disclaimerText}>
            <Trans t={t} i18nKey='Disclaimer'>
              Note: Combo DMG is meant to compare different relics relative to the selected team, and should <u>NOT</u>{' '}
              be used to compare different teams / LCs / eidolons!
            </Trans>
          </div>
        </Accordion.Control>
        <Accordion.Panel>
          <Flex direction="column" className={styles.disclaimerPanel} gap={10}>
            <Trans t={t} i18nKey='DisclaimerDescription'>
              Combo DMG is a tool to measure the damage of a single ability rotation within the context of a specific team.

              Changing the team / eidolons / light cones will change the duration of the rotation, how much energy is generated, uptime of buffs, etc.

              This means Combo DMG can NOT be used to determine which team is better, or which light cone is better, or measure the damage increase between
              eidolons. Combo DMG is only meant to compare different relics within a defined team and speed target.
            </Trans>

            <Button
              size='lg'
              fullWidth
              leftSection={<IconEyeOff size={16} />}
              onClick={() => {
                useGlobalStore.getState().setSettings({
                  ...useGlobalStore.getState().settings,
                  ShowComboDmgWarning: SettingOptions.ShowComboDmgWarning.Hide,
                })
                SaveState.delayedSave()
              }}
            >
              {tSettings('ShowComboDmgWarning.Hide')}
            </Button>
          </Flex>
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  )
}

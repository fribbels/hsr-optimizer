import {
  CameraOutlined,
  DownloadOutlined,
  EditOutlined,
  ExperimentOutlined,
  EyeInvisibleOutlined,
  ImportOutlined,
  SettingOutlined,
} from '@ant-design/icons'
import {
  Button,
  Collapse,
  ConfigProvider,
  Dropdown,
  Flex,
  Form,
  Input,
  Segmented,
  Typography,
} from 'antd'
import { CharacterPreview } from 'lib/characterPreview/CharacterPreview'
import { ShowcaseSource } from 'lib/characterPreview/CharacterPreviewComponents'
import {
  CURRENT_DATA_VERSION,
  officialOnly,
} from 'lib/constants/constants'
import {
  OpenCloseIDs,
  setOpen,
} from 'lib/hooks/useOpenClose'
import CharacterModal from 'lib/overlays/modals/CharacterModal'
import { Assets } from 'lib/rendering/assets'
import { AppPages } from 'lib/state/db'
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

const RERUN_PRESET_SIZE = 45
const PRESET_SIZE = 95

const { Text } = Typography

export default function ShowcaseTab() {
  const [showcaseForm] = Form.useForm<ShowcaseTabForm>()
  window.showcaseTabForm = showcaseForm

  const loading = useShowcaseTabStore((s) => s.loading)
  const scorerId = useShowcaseTabStore((s) => s.savedSession.scorerId)
  const availableCharacters = useShowcaseTabStore((s) => s.availableCharacters)

  const activeKey = window.store((s) => s.activeKey)
  const { t } = useTranslation(['relicScorerTab', 'common'])

  useEffect(() => initialiseShowcaseTab(activeKey), [activeKey])

  if (activeKey != AppPages.SHOWCASE && !availableCharacters?.length) {
    return <></>
  }
  console.log('======================================================================= RENDER RelicScorerTab')

  return (
    <div>
      <Flex vertical gap={0} align='center'>
        {/*<Flex gap={10} vertical align='center'>*/}
        {/*  <Text>*/}
        {/*    <h3 style={{ color: '#ffaa4f' }}>{t('Header.DowntimeWarning', { game_version: 3.7 })}</h3>*/}
        {/*  </Text>*/}
        {/*</Flex>*/}

        <Flex gap={10} vertical align='center'>
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
        <Form
          form={showcaseForm}
          onFinish={submitForm}
          initialValues={{ scorerId: scorerId }}
        >
          <Flex style={{ margin: 10, width: 1100 }} justify='center' align='center' gap={10}>
            <Form.Item name='scorerId'>
              <Input style={{ width: 150 }} placeholder={t('SubmissionBar.Placeholder') /* Account UID */} />
            </Form.Item>
            <Button
              type='primary'
              htmlType='submit'
              loading={loading}
              style={{ width: 150 }}
            >
              {t('common:Submit') /* Submit */}
            </Button>
            <Button
              style={{ width: 'fit-content', minWidth: 175 }}
              onClick={() => setOpen(OpenCloseIDs.SCORING_MODAL)}
              icon={<SettingOutlined />}
            >
              {t('SubmissionBar.AlgorithmButton') /* Scoring algorithm */}
            </Button>
          </Flex>
        </Form>
        <CharacterPreviewSelection />
      </Flex>
    </div>
  )
}

function CharacterPreviewSelection() {
  const setScoringAlgorithmFocusCharacter = window.store((s) => s.setScoringAlgorithmFocusCharacter)

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
      Utils.screenshotElementById('relicScorerPreview', 'clipboard').finally(() => {
        setScreenshotLoading(false)
      })
    }, 100)
  }

  function downloadClicked() {
    setDownloadLoading(true)
    // Use a small timeout here so the spinner doesn't lag while the image is being generated
    setTimeout(() => {
      const name = selectedCharacter ? tCharacter(`${selectedCharacter.id}.Name`) : null
      Utils.screenshotElementById('relicScorerPreview', 'download', name).finally(() => {
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
          <ImportOutlined />
          {t('ImportLabels.AllCharacters') /* Import all characters & all relics into optimizer */}
        </Flex>
      ),
      key: 'multiCharacter',
    },
    {
      label: (
        <Flex gap={10}>
          <ImportOutlined />
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
            style={{
              width: 100,
              height: 100,
              objectFit: 'contain',
              borderRadius: 50,
              border: '1px solid rgba(255, 255, 255, 0.2)',
              background: 'rgba(255, 255, 255, 0.05)',
            }}
            src={Assets.getCharacterAvatarById(availableCharacter.id)}
          />
        </Flex>
      ),
      value: availableCharacter.id,
      key: i,
    })
  }

  return (
    <Flex style={{ width: 1375 }} justify='space-around'>
      <Flex vertical align='center' gap={8} style={{ marginBottom: 100, width: 1068 }}>
        <Flex
          vertical
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
              style={{ flex: 1 }}
              onClick={clipboardClicked}
              icon={<CameraOutlined />}
              loading={screenshotLoading}
              type='primary'
            >
              {t('CopyScreenshot') /* Copy screenshot */}
            </Button>
            <Button
              style={{ width: 50 }}
              icon={<DownloadOutlined />}
              onClick={downloadClicked}
              loading={downloadLoading}
            />
            <Dropdown.Button
              style={{ flex: 1 }}
              className='dropdownButton'
              onClick={() => importClicked('singleCharacter')}
              menu={menuProps}
            >
              <ImportOutlined />
              {t('ImportLabels.Relics') /* Import relics into optimizer */}
            </Dropdown.Button>
            <Button
              style={{ flex: 1 }}
              icon={<ExperimentOutlined />}
              onClick={simulateClicked}
            >
              {t('SimulateRelics') /* Simulate relics on another character */}
            </Button>
          </Flex>
        </Flex>

        {(availableCharacters?.length != undefined && availableCharacters.length > 0)
          && <DPSScoreDisclaimer />}

        <Segmented
          style={{ width: '100%', overflow: 'hidden' }}
          options={options}
          block
          onChange={useShowcaseTabStore.getState().onSelectionChanged}
          value={selectedCharacter?.id}
        />

        <div id='previewWrapper' style={{ padding: '0 5 5 5' }}>
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
  const activeKey = window.store((s) => s.activeKey)

  useEffect(() => {
    useShowcaseTabStore.getState().setSidebarOpen(open)
    SaveState.delayedSave()
  }, [open])

  const dropdownDisplay = useMemo(() => {
    let key = 0
    return (
      <Flex
        vertical
        gap={3}
        justify='center'
        style={{
          marginLeft: -8,
          width: 110,
          flexDirection: 'row',
          flexWrap: 'wrap',
        }}
      >
        {presetCharacters().map((preset) => {
          const icon = preset.custom ? <EditOutlined style={{ fontSize: 85 }} /> : <PresetButton preset={preset} />
          return (
            <Button
              key={key++}
              type='text'
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
      vertical
      style={{
        position: 'relative',
        left: -120,
        // top: 40,
        top: 95, // With announcement banner
        width: 0,
        height: 0,
      }}
    >
      <Dropdown
        dropdownRender={() => dropdownDisplay}
        open={open}
      >
        <a
          onClick={(e) => {
            e.preventDefault()
            setOpen(!open)
          }}
        >
          <Button
            type='primary'
            shape='round'
            style={{ height: PRESET_SIZE, width: PRESET_SIZE, borderRadius: PRESET_SIZE, marginBottom: 2 }}
          >
            <ExperimentOutlined style={{ fontSize: 55 }} />
          </Button>
        </a>
      </Dropdown>
    </Flex>
  )
}

function PresetButton(props: { preset: CharacterPreset }) {
  const { preset } = props
  if (preset.rerun) {
    return (
      <img
        src={Assets.getCharacterAvatarById(preset.characterId)}
        style={{
          height: RERUN_PRESET_SIZE,
          width: RERUN_PRESET_SIZE,
          borderRadius: RERUN_PRESET_SIZE,
          outline: '1px solid rgba(255, 255, 255, 0.2)',
          background: 'rgba(255, 255, 255, 0.05)',
        }}
      />
    )
  }

  return (
    <img
      src={Assets.getCharacterAvatarById(preset.characterId)}
      style={{
        height: PRESET_SIZE,
        width: PRESET_SIZE,
        borderRadius: PRESET_SIZE,
        outline: '1px solid rgba(255, 255, 255, 0.2)',
        background: 'rgba(255, 255, 255, 0.05)',
      }}
    />
  )
}

export function DPSScoreDisclaimer() {
  const showComboDmgWarning = window.store((s) => s.settings.ShowComboDmgWarning)

  const { t } = useTranslation('relicScorerTab')
  const { t: tSettings } = useTranslation('settings')

  if (showComboDmgWarning != SettingOptions.ShowComboDmgWarning.Show) return null

  return (
    <ConfigProvider
      theme={{
        components: {
          Collapse: {
            headerBg: '#8a1717',
          },
        },
      }}
    >
      <Collapse
        style={{ width: '100%' }}
        items={[
          {
            key: '1',
            label: (
              <div style={{ fontSize: 14 }}>
                <Trans t={t} i18nKey='Disclaimer'>
                  Note: Combo DMG is meant to compare different relics relative to the selected team, and should <u>NOT</u>{' '}
                  be used to compare different teams / LCs / eidolons!
                </Trans>
              </div>
            ),
            children: (
              <Flex vertical style={{ padding: 12 }} gap={10}>
                <Trans t={t} i18nKey='DisclaimerDescription'>
                  Combo DMG is a tool to measure the damage of a single ability rotation within the context of a specific team.

                  Changing the team / eidolons / light cones will change the duration of the rotation, how much energy is generated, uptime of buffs, etc.

                  This means Combo DMG can NOT be used to determine which team is better, or which light cone is better, or measure the damage increase between
                  eidolons. Combo DMG is only meant to compare different relics within a defined team and speed target.
                </Trans>

                <Button
                  type='primary'
                  size='large'
                  block
                  icon={<EyeInvisibleOutlined />}
                  onClick={() => {
                    window.store.getState().setSettings({
                      ...window.store.getState().settings,
                      ShowComboDmgWarning: SettingOptions.ShowComboDmgWarning.Hide,
                    })
                    SaveState.delayedSave()
                  }}
                >
                  {tSettings('ShowComboDmgWarning.Hide')}
                </Button>
              </Flex>
            ),
          },
        ]}
      />
    </ConfigProvider>
  )
}

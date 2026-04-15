import {
  Accordion,
  Alert,
  Button,
  Checkbox,
  Divider,
  Flex,
  Switch,
  TextInput,
  Timeline,
  Tooltip,
} from '@mantine/core'
import { modals } from '@mantine/modals'
import {
  IconRefresh,
  IconUpload,
} from '@tabler/icons-react'
import { AppPages } from 'lib/constants/appPages'
import {
  type HoyolabData,
  hoyolabParser,
} from 'lib/importer/hoyoLabFormatParser'
import {
  KelzScannerConfig,
  ReliquaryArchiverConfig,
  ScannerSourceToParser,
  ValidScannerSources,
} from 'lib/importer/importConfig'
import { type ScannerParserJson } from 'lib/importer/kelzFormatParser'
import { Message } from 'lib/interactions/message'
import * as persistenceService from 'lib/services/persistenceService'
import { SaveState } from 'lib/state/saveState'
import { useGlobalStore } from 'lib/stores/app/appStore'
import {
  getCharacterById,
  getCharacters,
} from 'lib/stores/character/characterStore'
import {
  importerTabButtonWidth,
  importerTabSpinnerMs,
} from 'lib/tabs/tabImport/importerTabUiConstants'
import { ReliquaryDescription } from 'lib/tabs/tabImport/ReliquaryDescription'
import { ColorizedLinkWithIcon } from 'lib/ui/ColorizedLink'
import {
  useRef,
  useState,
} from 'react'
import { useTranslation } from 'react-i18next'
import type { CharacterId } from 'types/character'
import type { Form } from 'types/form'
import type { Relic } from 'types/relic'
import { useShallow } from 'zustand/react/shallow'
import classes from './ScannerImportSubmenu.module.css'
import {
  DEFAULT_WEBSOCKET_URL,
  useScannerState,
} from './ScannerWebsocketClient'

type ParsedCharacter = {
  characterId: CharacterId,
  characterLevel: number,
  lightConeLevel: number,
}

enum Stages {
  LOAD_FILE = 0,
  CONFIRM_DATA = 1,
  FINISHED = 2,
}

export function ScannerImportSubmenu() {
  const { t } = useTranslation(['importSaveTab', 'common'])
  const [currentStage, setCurrentStage] = useState<Stages>(Stages.LOAD_FILE)
  const [currentRelics, setCurrentRelics] = useState<Relic[] | undefined>([])
  const [currentCharacters, setCurrentCharacters] = useState<ParsedCharacter[] | undefined>([])
  const [loading1, setLoading1] = useState(false)
  const [loading2, setLoading2] = useState(false)
  const [onlyImportExisting, setOnlyImportExisting] = useState(false)
  const {
    connected,
    ingest,
    setIngest,
    ingestCharacters,
    setIngestCharacters,
    ingestWarpResources,
    setIngestWarpResources,
    websocketUrl,
    setWebsocketUrl,
  } = useScannerState(useShallow((s) => ({
    connected: s.connected,
    ingest: s.ingest,
    setIngest: s.setIngest,
    ingestCharacters: s.ingestCharacters,
    setIngestCharacters: s.setIngestCharacters,
    ingestWarpResources: s.ingestWarpResources,
    setIngestWarpResources: s.setIngestWarpResources,
    websocketUrl: s.websocketUrl,
    setWebsocketUrl: s.setWebsocketUrl,
  })))
  const fileInputRef = useRef<HTMLInputElement>(null)
  const isLiveImporting = connected && ingest

  function beforeUpload(file: Blob) {
    const reader = new FileReader()
    reader.readAsText(file)
    reader.onload = () => {
      const fileUploadText = String(reader.result)
      void uploadedText(fileUploadText)
    }
  }

  function uploadedText(text: string) {
    try {
      const json = JSON.parse(text) as (ScannerParserJson & { data: never }) | (HoyolabData & { source: never })

      setLoading1(true)

      if (!json) {
        throw new Error(t('Import.ErrorMsg.InvalidJson') /* Invalid JSON */)
      }

      if (json.data) {
        // Hoyolab import
        const out = hoyolabParser(json)
        const relics = out.relics as Relic[]
        let characters = out.characters
        // We sort by the characters ingame level before setting their level to 80 for the optimizer, so the default char order is more natural
        characters = characters.sort((a, b) => b.characterLevel - a.characterLevel)
        characters.forEach((c) => {
          c.characterLevel = 80
          c.lightConeLevel = 80
        })
        setTimeout(() => {
          setCurrentCharacters(characters)
          setCurrentRelics(relics)
          setCurrentStage(Stages.CONFIRM_DATA)
          setLoading1(false)
        }, importerTabSpinnerMs)

        return
      }

      if (!ValidScannerSources.includes(json.source)) {
        throw new Error(t('Import.ErrorMsg.InvalidFile') /* Invalid scanner file */)
      }

      const parser = ScannerSourceToParser[json.source]
      const output = parser.parse(json as ScannerParserJson)
      let characters: ParsedCharacter[] = output.characters
      const relics: Relic[] = output.relics

      // We sort by the characters ingame level before setting their level to 80 for the optimizer, so the default char order is more natural
      characters = characters.sort((a, b) => b.characterLevel - a.characterLevel)
      characters.forEach((c) => {
        c.characterLevel = 80
        c.lightConeLevel = 80
      })

      setTimeout(() => {
        setLoading1(false)
        setCurrentRelics(relics)
        setCurrentCharacters(characters)
        setCurrentStage(Stages.CONFIRM_DATA)
        setOnlyImportExisting(false)
      }, importerTabSpinnerMs)
    } catch (e) {
      let message: string = t('Import.ErrorMsg.Unknown' /* Unknown Error */)
      if (e instanceof Error) message = e.message

      console.error(e)
      Message.error(t('Import.ErrorMsg.Fragment' /* Error occurred while importing file: */) + message, 10)

      setTimeout(() => {
        setLoading1(false)
        setCurrentRelics(undefined)
        setCurrentCharacters(undefined)
        setCurrentStage(Stages.CONFIRM_DATA)
      }, importerTabSpinnerMs)
    }
  }

  function mergeRelicsConfirmed() {
    setLoading2(true)
    setTimeout(() => {
      persistenceService.mergeRelics(currentRelics ?? [], [])
      SaveState.delayedSave()

      setTimeout(() => {
        setLoading2(false)
        setCurrentStage(Stages.FINISHED)
      }, 100)
    }, importerTabSpinnerMs)
  }

  function mergeCharactersConfirmed() {
    setLoading2(true)
    setTimeout(() => {
      const charactersToImport = onlyImportExisting
        ? currentCharacters?.filter((char) => getCharacterById(char.characterId))
        : currentCharacters

      persistenceService.mergeRelics(currentRelics ?? [], (charactersToImport ?? []) as Form[])
      SaveState.delayedSave()

      setTimeout(() => {
        setLoading2(false)
        setCurrentStage(Stages.FINISHED)
      }, 100)
    }, importerTabSpinnerMs)
  }

  function uploadScannerFile() {
    return (
      <Flex className={classes.uploadStage} gap={30}>
        <Flex direction='column' gap={10}>
          <div>
            {t('Import.Stage1.Header')}
          </div>
          <div>
            <ul>
              <ReliquaryDescription />
              <li>
                {t('Import.Stage1.KelzDesc.Title')} (
                <ColorizedLinkWithIcon
                  text={t('Import.Stage1.KelzDesc.Link')}
                  url={KelzScannerConfig.releases}
                  linkIcon={true}
                />
                )
                <ul>
                  <li>{t('Import.Stage1.KelzDesc.l1')}</li>
                  <li>{t('Import.Stage1.KelzDesc.l2')}</li>
                </ul>
              </li>
              <li>
                {t('Import.Stage1.ScorerDesc.Title')} (
                <ColorizedLinkWithIcon
                  text={t('Import.Stage1.ScorerDesc.Link')}
                  linkIcon={true}
                  onClick={() => useGlobalStore.getState().setActiveKey(AppPages.SHOWCASE)}
                />
                )
                <ul>
                  <li>{t('Import.Stage1.ScorerDesc.l1')}</li>
                  <li>{t('Import.Stage1.ScorerDesc.l2')}</li>
                </ul>
              </li>
              <li>
                {t('Import.Stage1.HoyolabDesc.Title')} (
                <ColorizedLinkWithIcon
                  text={t('Import.Stage1.HoyolabDesc.Link')}
                  url='https://github.com/fribbels/hsr-optimizer/discussions/403'
                  linkIcon={true}
                />
                )
                <ul>
                  <li>{t('Import.Stage1.HoyolabDesc.l1')}</li>
                  <li>{t('Import.Stage1.HoyolabDesc.l2')}</li>
                </ul>
              </li>
            </ul>
          </div>
          <Flex direction='column' align='flex-start'>
            <Flex gap={10} align='center'>
              <input
                type='file'
                accept='.json'
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    beforeUpload(file)
                  }
                  e.target.value = ''
                }}
              />
              <Button
                disabled={isLiveImporting}
                style={{ width: importerTabButtonWidth }}
                leftSection={<IconUpload size={16} />}
                loading={loading1}
                onClick={() => {
                  setCurrentStage(Stages.LOAD_FILE)
                  fileInputRef.current?.click()
                }}
                variant='default'
              >
                {t('Import.Stage1.ButtonText')}
              </Button>

              {t('Import.Stage1.Or')}

              <TextInput
                style={{ width: importerTabButtonWidth }}
                className='centered-placeholder'
                placeholder={t('Import.Stage1.Placeholder')}
                value=''
                disabled={loading1 || isLiveImporting}
                onChange={(e) => {
                  const text = e.target.value
                  try {
                    JSON.parse(text)
                    uploadedText(text)
                  } catch {
                    // Not valid json, ignore
                  }
                }}
              />
            </Flex>
            <Divider w='100%' my={20} label={t('Import.LiveImport.Title') /* Live Import Controls */} labelPosition='center' />
            <Flex direction='column' gap={10}>
              <div>
                {
                  t(
                    'Import.LiveImport.Description.l1',
                  ) /* When using the Reliquary Archiver, you can enable the "Live Import" mode to import your inventory in real time. */
                }
                <br />
                {t('Import.LiveImport.Description.l2') /* This includes new relics, enhanced relics, warp/gacha results, and more. */} (
                <ColorizedLinkWithIcon
                  text={t('Import.Stage1.ReliquaryDesc.Link')}
                  url={'https://github.com/fribbels/hsr-optimizer/blob/main/docs/guides/en/live-import.md'}
                  linkIcon={true}
                />
                )
              </div>

              <Alert
                title='New version notice'
                color='blue'
                className={classes.alertNotice}
              >
                <div>
                  If your live import fails to connect, download the new version of{' '}
                  <ColorizedLinkWithIcon
                    text={'Reliquary Archiver'}
                    url={ReliquaryArchiverConfig.releases}
                    linkIcon={true}
                  />
                  {websocketUrl !== DEFAULT_WEBSOCKET_URL && (() => {
                    try {
                      return new URL(websocketUrl).port === '53313' && (
                        <>
                          <br />
                          If you have a custom ws url set, the default port has changed from 53313 to 23313.
                        </>
                      )
                    } catch {
                      return null
                    }
                  })()}
                </div>
              </Alert>

              <Flex gap={10} align='center' flex='1 0'>
                <Switch
                  checked={ingest}
                  onChange={(event) => setIngest(event.currentTarget.checked)}
                />

                <div>{t('Import.LiveImport.Enable') /* Enable Live Import (Recommended) */}</div>

                <Divider variant='dashed' className={classes.dividerLine} />

                <Tooltip
                  position='top-end'
                  opened={ingest && !connected ? undefined : false} // Only show tooltip if ingest is enabled but we are haven't been able to connect
                  label={t('Import.LiveImport.DisconnectedHint') /* Unable to connect to the scanner. Please check that it is running. */}
                >
                  <Flex gap={10} align='center'>
                    <div>{connected ? t('Import.LiveImport.Connected') /* Connected */ : t('Import.LiveImport.Disconnected') /* Disconnected */}</div>

                    <div
                      className={classes.connectionDot}
                      style={{ backgroundColor: connected ? '#52c41a' : '#ff4d4f' }}
                    />
                  </Flex>
                </Tooltip>
              </Flex>

              <Flex gap={10} align='center'>
                <Switch
                  checked={ingestCharacters}
                  onChange={(event) => setIngestCharacters(event.currentTarget.checked)}
                />

                <div>{t('Import.LiveImport.UpdateCharacters') /* Enable updating characters' equipped relics and lightcones */}</div>
              </Flex>

              <Flex gap={10} align='center'>
                <Switch
                  checked={ingestWarpResources}
                  onChange={(event) => setIngestWarpResources(event.currentTarget.checked)}
                />

                <div>{t('Import.LiveImport.UpdateWarpResources') /* Enable importing Warp resources (jades, passes, pity) */}</div>
              </Flex>

              <Accordion>
                <Accordion.Item value='1'>
                  <Accordion.Control>{t('Import.LiveImport.AdvancedSettings.Title') /* Advanced Settings */}</Accordion.Control>
                  <Accordion.Panel>
                    <Flex direction='column' gap={10}>
                      <Flex direction='column'>
                        <div>{t('Import.LiveImport.AdvancedSettings.WebsocketUrl') /* Websocket URL */}</div>
                        <Flex gap={10}>
                          <TextInput
                            id='websocket-url'
                            value={websocketUrl}
                            onChange={(e) => setWebsocketUrl(e.target.value)}
                          />
                          <Tooltip label={t('Import.LiveImport.AdvancedSettings.WebsocketUrlReset') /* Reset to default */}>
                            <Button onClick={() => setWebsocketUrl(DEFAULT_WEBSOCKET_URL)} variant='default'>
                              <IconRefresh size={16} />
                            </Button>
                          </Tooltip>
                        </Flex>
                      </Flex>
                    </Flex>
                  </Accordion.Panel>
                </Accordion.Item>
              </Accordion>
            </Flex>
          </Flex>
        </Flex>
      </Flex>
    )
  }

  function confirmDataMerge() {
    if (!currentRelics) {
      return (
        <Flex className={classes.stageContainer}>
          <Flex direction='column' gap={10} style={{ display: currentStage >= 1 ? 'flex' : 'none' }}>
            {t('Import.Stage2.NoRelics')}
          </Flex>
        </Flex>
      )
    }

    return (
      <Flex className={classes.confirmStage}>
        <Flex direction='column' gap={10} style={{ display: currentStage >= 1 ? 'flex' : 'none' }}>
          <div>
            {t('Import.Stage2.FileInfo', {
              relicCount: currentRelics.length ?? 0,
              characterCount: currentCharacters?.length ?? 0,
            })}
          </div>

          <div>
            {t('Import.Stage2.RelicsImport.Label', { relicCount: currentRelics.length ?? 0 })}
          </div>

          <Button
            style={{ width: importerTabButtonWidth }}
            onClick={mergeRelicsConfirmed}
            loading={loading2}
          >
            {t('Import.Stage2.RelicsImport.ButtonText', { relicCount: currentRelics.length ?? 0 })}
          </Button>

          <Divider label={<span className={classes.dividerText}>{t('Import.Stage2.Or')}</span>} labelPosition='center' />
          <div>
            {t('Import.Stage2.CharactersImport.Label', {
              relicCount: currentRelics.length ?? 0,
              characterCount: currentCharacters?.length ?? 0,
            })}
          </div>

          <Checkbox
            checked={onlyImportExisting}
            disabled={loading2 || !getCharacters().length}
            onChange={(e) => setOnlyImportExisting(e.currentTarget.checked)}
            label={t('Import.Stage2.CharactersImport.OnlyImportExisting') /* Only import existing characters */}
          />

          <Button
            style={{ width: importerTabButtonWidth }}
            loading={loading2}
            onClick={() =>
              modals.openConfirmModal({
                title: t('Import.Stage2.CharactersImport.WarningTitle'),
                children: t('Import.Stage2.CharactersImport.WarningDescription'),
                labels: { confirm: t('common:Yes'), cancel: t('common:Cancel') },
                centered: true,
                onConfirm: mergeCharactersConfirmed,
              })}
          >
            {t('Import.Stage2.CharactersImport.ButtonText', {
              relicCount: currentRelics.length ?? 0,
              characterCount: currentCharacters?.length ?? 0,
            })}
          </Button>
        </Flex>
      </Flex>
    )
  }

  function mergeCompleted() {
    return (
      <Flex className={classes.stageContainer}>
        <Flex direction='column' gap={10} style={{ display: currentStage >= 2 ? 'flex' : 'none' }}>
          <div>
            {t('Import.Stage3.SuccessMessage')}
          </div>
        </Flex>
      </Flex>
    )
  }

  return (
    <Flex gap={5}>
      <Timeline active={currentStage} bulletSize={24} lineWidth={2}>
        <Timeline.Item>{uploadScannerFile()}</Timeline.Item>
        <Timeline.Item>{confirmDataMerge()}</Timeline.Item>
        <Timeline.Item>{mergeCompleted()}</Timeline.Item>
      </Timeline>
    </Flex>
  )
}

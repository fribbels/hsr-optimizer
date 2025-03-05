import { UploadOutlined } from '@ant-design/icons'
import { Button, Checkbox, Divider, Flex, Input, Popconfirm, Steps, Typography, Upload } from 'antd'
import { hoyolabParser } from 'lib/importer/hoyoLabFormatParser'
import { KelzScannerConfig, ScannerSourceToParser, ValidScannerSources } from 'lib/importer/importConfig'
import { Message } from 'lib/interactions/message'
import DB, { AppPages } from 'lib/state/db'
import { SaveState } from 'lib/state/saveState'
import { importerTabButtonWidth, importerTabSpinnerMs } from 'lib/tabs/tabImport/importerTabUiConstants'
import { ReliquaryDescription } from 'lib/tabs/tabImport/ReliquaryDescription'
import { ColorizedLinkWithIcon } from 'lib/ui/ColorizedLink'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Relic } from 'types/relic'

// FIXME MED

const { Text } = Typography

type ParsedCharacter = {
  characterId: string
  characterLevel: number
  lightConeLevel: number
  characterId: string
}

enum Stages {
  LOAD_FILE = 0,
  CONFIRM_DATA = 1,
  FINISHED = 2,
}

export function ScannerImportSubmenu() {
  const [currentStage, setCurrentStage] = useState<Stages>(Stages.LOAD_FILE)
  const [currentRelics, setCurrentRelics] = useState<Relic[] | undefined>([])
  const [currentCharacters, setCurrentCharacters] = useState<ParsedCharacter[] | undefined>([])
  const [loading1, setLoading1] = useState(false)
  const [loading2, setLoading2] = useState(false)
  const [onlyImportExisting, setOnlyImportExisting] = useState(false)
  const { t } = useTranslation(['importSaveTab', 'common'])

  function beforeUpload(file): Promise<any> {
    return new Promise(() => {
      const reader = new FileReader()
      reader.readAsText(file)
      reader.onload = () => {
        const fileUploadText = String(reader.result)
        uploadedText(fileUploadText)
      }
      return false
    })
  }

  function uploadedText(text): Promise<any> {
    try {
      const json = JSON.parse(text)
      console.log('JSON', json)

      setLoading1(true)

      if (!json) {
        throw new Error(t('Import.ErrorMsg.InvalidJson')/* Invalid JSON */)
      }

      if (json.data) {
        // Hoyolab import
        const out = hoyolabParser(json)
        const relics: Relic[] = out.relics
        let characters = out.characters
        // We sort by the characters ingame level before setting their level to 80 for the optimizer, so the default char order is more natural
        characters = characters.sort((a, b) => b.characterLevel - a.characterLevel)
        characters.map((c) => {
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
        throw new Error(t('Import.ErrorMsg.InvalidFile')/* Invalid scanner file */)
      }

      const parser = ScannerSourceToParser[json.source]
      const output = parser.parse(json)
      let characters: ParsedCharacter[] = output.characters
      const relics: Relic[] = output.relics

      // We sort by the characters ingame level before setting their level to 80 for the optimizer, so the default char order is more natural
      characters = characters.sort((a, b) => b.characterLevel - a.characterLevel)
      characters.map((c) => {
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
      let message: string = t('Import.ErrorMsg.Unknown'/* Unknown Error */)
      if (e instanceof Error) message = e.message

      console.error(e)
      Message.error(t('Import.ErrorMsg.Fragment'/* Error occurred while importing file: */) + message, 10)

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
      DB.mergeRelicsWithState(currentRelics)
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
        ? currentCharacters?.filter((char) => DB.getCharacterById(char.characterId))
        : currentCharacters

      DB.mergeRelicsWithState(currentRelics, charactersToImport)
      SaveState.delayedSave()

      setTimeout(() => {
        setLoading2(false)
        setCurrentStage(Stages.FINISHED)
      }, 100)
    }, importerTabSpinnerMs)
  }

  function uploadScannerFile() {
    return (
      <Flex style={{ minHeight: 100, marginBottom: 30 }} gap={30}>
        <Flex vertical gap={10}>
          <Text>
            {t('Import.Stage1.Header')}
          </Text>
          <Text>
            <ul>
              <ReliquaryDescription/>
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
                  onClick={() => window.store.getState().setActiveKey(AppPages.SHOWCASE)}
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
          </Text>
          <Flex vertical align='flex-start'>
            <Flex gap={10} align='center'>
              <Upload
                accept='.json'
                name='file'
                beforeUpload={beforeUpload}
              >
                <Button
                  style={{ width: importerTabButtonWidth }}
                  icon={<UploadOutlined/>}
                  loading={loading1}
                  onClick={() => setCurrentStage(Stages.LOAD_FILE)}
                >
                  {t('Import.Stage1.ButtonText')}
                </Button>
              </Upload>

              {t('Import.Stage1.Or')}

              <Input
                style={{ width: importerTabButtonWidth }}
                className='centered-placeholder'
                placeholder={t('Import.Stage1.Placeholder')}
                value=''
                disabled={loading1}
                onChange={(e) => {
                  const text = e.target.value
                  try {
                    const json = JSON.parse(text)
                    uploadedText(text)
                  } catch (e) {
                    // Not valid json, ignore
                  }
                }}
              />
            </Flex>
          </Flex>
        </Flex>
      </Flex>
    )
  }

  function confirmDataMerge() {
    if (!currentRelics) {
      return (
        <Flex style={{ minHeight: 100 }}>
          <Flex vertical gap={10} style={{ display: currentStage >= 1 ? 'flex' : 'none' }}>
            {t('Import.Stage2.NoRelics')}
          </Flex>
        </Flex>
      )
    }

    return (
      <Flex style={{ minHeight: 250 }}>
        <Flex vertical gap={10} style={{ display: currentStage >= 1 ? 'flex' : 'none' }}>
          <Text>
            {t('Import.Stage2.FileInfo', {
              relicCount: currentRelics.length ?? 0,
              characterCount: currentCharacters?.length ?? 0,
            })}
          </Text>

          <Text>
            {t('Import.Stage2.RelicsImport.Label', { relicCount: currentRelics.length ?? 0 })}
          </Text>

          <Button
            style={{ width: importerTabButtonWidth }}
            type='primary'
            onClick={mergeRelicsConfirmed}
            loading={loading2}
          >
            {t('Import.Stage2.RelicsImport.ButtonText', { relicCount: currentRelics.length ?? 0 })}
          </Button>

          <Divider><Text style={{ fontSize: 12 }}>{t('Import.Stage2.Or')}</Text></Divider>
          <Text>
            {t('Import.Stage2.CharactersImport.Label', {
              relicCount: currentRelics.length ?? 0,
              characterCount: currentCharacters?.length ?? 0,
            })}
          </Text>

          <Checkbox
            checked={onlyImportExisting}
            disabled={loading2}
            onChange={(e) => setOnlyImportExisting(e.target.checked)}
          >
            {t('Import.Stage2.CharactersImport.OnlyImportExisting') /* Only import existing characters */}
          </Checkbox>

          <Popconfirm
            title={t('Import.Stage2.CharactersImport.WarningTitle')}
            description={t('Import.Stage2.CharactersImport.WarningDescription')}
            onConfirm={mergeCharactersConfirmed}
            placement='bottom'
            okText={t('common:Yes')}
            cancelText={t('common:Cancel')}
          >
            <Button style={{ width: importerTabButtonWidth }} type='primary' loading={loading2}>
              {t('Import.Stage2.CharactersImport.ButtonText', {
                relicCount: currentRelics.length ?? 0,
                characterCount: currentCharacters?.length ?? 0,
              })}
            </Button>
          </Popconfirm>
        </Flex>
      </Flex>
    )
  }

  function mergeCompleted() {
    return (
      <Flex style={{ minHeight: 100 }}>
        <Flex vertical gap={10} style={{ display: currentStage >= 2 ? 'flex' : 'none' }}>
          <Text>
            {t('Import.Stage3.SuccessMessage')}
          </Text>
        </Flex>
      </Flex>
    )
  }

  return (
    <Flex gap={5}>
      <Steps
        direction='vertical'
        current={currentStage}
        items={[
          {
            title: '',
            description: uploadScannerFile(),
          },
          {
            title: '',
            description: confirmDataMerge(),
          },
          {
            title: '',
            description: mergeCompleted(),
          },
        ]}
      />
    </Flex>
  )
}

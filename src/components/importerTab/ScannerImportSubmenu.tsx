import { useState } from 'react'
import { KelzScannerConfig, ScannerSourceToParser, ValidScannerSources } from 'lib/importer/importConfig.js'
import { SaveState } from 'lib/saveState.js'
import { Button, Divider, Flex, Form, Input, Popconfirm, Steps, Typography, Upload } from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import DB, { AppPages } from 'lib/db.js'
import { importerTabButtonWidth, importerTabSpinnerMs } from 'components/importerTab/importerTabUiConstants.ts'
import { Relic } from 'types/Relic'
import { ColorizedLink } from 'components/common/ColorizedLink.tsx'
import { ReliquaryDescription } from 'components/importerTab/ReliquaryDescription.tsx'
import { hoyolabParser } from 'lib/importer/hoyoLabFormatParser'
import { Message } from 'lib/message'
import { useTranslation } from 'react-i18next'
import i18next from 'i18next'

const { Text } = Typography

type ParsedCharacter = {
  characterLevel: number
  lightConeLevel: number
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
  const { t } = useTranslation(['importSaveTab', 'common'], { keyPrefix: 'import' })

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
        throw new Error(t('errormsg.invalidjson'))
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
        throw new Error(t('errormsg.invalidfile'))
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
      }, importerTabSpinnerMs)
    } catch (e) {
      let message: string = t('errormsg.unknown')
      if (e instanceof Error) message = e.message

      console.error(e)
      Message.error(t('errormsg.fragment') + message, 10)

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
      SaveState.save()

      setTimeout(() => {
        setLoading2(false)
        setCurrentStage(Stages.FINISHED)
      }, 100)
    }, importerTabSpinnerMs)
  }

  function mergeCharactersConfirmed() {
    setLoading2(true)
    setTimeout(() => {
      DB.mergeRelicsWithState(currentRelics, currentCharacters)
      SaveState.save()

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
            {t('stage1.header')}
          </Text>
          <Text>
            <ul>
              <ReliquaryDescription/>
              <li>
                {t('stage1.kelzdesc.title')} (
                <ColorizedLink text={t('stage1.kelzdesc.link')} url={KelzScannerConfig.releases}/>
                )
                <ul>
                  <li>{t('stage1.kelzdesc.l1')}</li>
                  <li>{t('stage1.kelzdesc.l2')}</li>
                </ul>
              </li>
              <li>
                {t('stage1.scorerdesc.title')} (
                <span onClick={() => window.store.getState().setActiveKey(AppPages.RELIC_SCORER)}>
                  <ColorizedLink text={t('stage1.scorerdesc.link')}/>
                </span>
                )
                <ul>
                  <li>{t('stage1.scorerdesc.l1')}</li>
                  <li>{t('stage1.scorerdesc.l2')}</li>
                </ul>
              </li>
              <li>{t('stage1.hoyolabdesc.title')} (
                <ColorizedLink text={t('stage1.hoyolabdesc.link')} url='https://github.com/fribbels/hsr-optimizer/discussions/403'/>
                )
                <ul>
                  <li>{t('stage1.hoyolabdesc.l1')}</li>
                  <li>{t('stage1.hoyolabdesc.l2')}</li>
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
                  {t('stage1.buttontext')}
                </Button>
              </Upload>

              {t('stage1.or')}

              <Input
                style={{ width: importerTabButtonWidth }}
                className='centered-placeholder'
                placeholder='Paste json file contents'
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
            {t('stage2.norelics')}
          </Flex>
        </Flex>
      )
    }

    return (
      <Flex style={{ minHeight: 250 }}>
        <Flex vertical gap={10} style={{ display: currentStage >= 1 ? 'flex' : 'none' }}>
          <Text>
            {t('stage2.fileinfo', { reliccount: currentRelics.length || 0, charactercount: currentCharacters?.length || 0 })}
          </Text>

          <Text>
            {t('stage2.relicsimport.label')}
          </Text>

          <Button style={{ width: importerTabButtonWidth }} type='primary' onClick={mergeRelicsConfirmed} loading={loading2}>
            {t('stage2.relicsimport.buttontext')}
          </Button>

          <Divider><Text style={{ fontSize: 12 }}>{t('stage2.or')}</Text></Divider>
          <Text>
            {t('stage2.charactersimport.label')}
          </Text>

          <Popconfirm
            title={t('stage2.charactersimport.warningtitle')}
            description={t('stage2.charactersimport.warningdescription')}
            onConfirm={mergeCharactersConfirmed}
            placement='bottom'
            okText={i18next.t('common:yes', { length: 1 })}
            cancelText={i18next.t('common:cancel', { length: 1 })}
          >
            <Button style={{ width: importerTabButtonWidth }} type='primary' loading={loading2}>
              {t('stage2.charactersimport.buttontext')}
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
            {t('stage3.successmessage')}
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

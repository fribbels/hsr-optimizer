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
  const [form] = Form.useForm()

  const hoyolabSubmit = () => {
    const json = form.getFieldValue('json input')
    const out = hoyolabParser(json)
    const relics: Relic[] = out.relics
    let characters = out.characters
    // We sort by the characters ingame level before setting their level to 80 for the optimizer, so the default char order is more natural
    characters = characters.sort((a, b) => b.characterLevel - a.characterLevel)
    characters.map((c) => {
      c.characterLevel = 80
      c.lightConeLevel = 80
    })
    setCurrentCharacters(characters)
    setCurrentRelics(relics)
    setCurrentStage(Stages.CONFIRM_DATA)
  }

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
        throw new Error('Invalid JSON')
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
        throw new Error('Invalid scanner file')
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
      let message = 'Unknown Error'
      if (e instanceof Error) message = e.message

      console.error(e)
      Message.error('Error occurred while importing file: ' + message, 10)

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
      setLoading2(false)
      DB.mergeRelicsWithState(currentRelics)
      SaveState.save()
      setCurrentStage(Stages.FINISHED)
    }, importerTabSpinnerMs)
  }

  function mergeCharactersConfirmed() {
    setLoading2(true)
    setTimeout(() => {
      setLoading2(false)
      DB.mergeRelicsWithState(currentRelics, currentCharacters)
      SaveState.save()
      setCurrentStage(Stages.FINISHED)
    }, importerTabSpinnerMs)
  }

  function uploadScannerFile() {
    return (
      <Flex style={{ minHeight: 100, marginBottom: 30 }} gap={30}>
        <Flex vertical gap={10}>
          <Text>
            Install and run one of the relic scanner options:
          </Text>
          <Text>
            <ul>
              <ReliquaryDescription />
              <li>
                Kel-Z HSR Scanner (
                <ColorizedLink text="Github" url={KelzScannerConfig.releases} />
                )
                <ul>
                  <li>Inaccurate speed decimals, 5-10 minutes OCR scan</li>
                  <li>Imports full inventory and character roster</li>
                </ul>
              </li>
              <li>
                Relic Scorer Import (
                <span onClick={() => window.store.getState().setActiveKey(AppPages.RELIC_SCORER)}>
                  <ColorizedLink text="Relic scorer" />
                </span>
                )
                <ul>
                  <li>Accurate speed decimals, instant scan</li>
                  <li>No download needed, but limited to relics from the 8 characters on profile showcase</li>
                </ul>
              </li>
              <li>HoyoLab Import (
                <ColorizedLink text="Instructions" url="https://github.com/fribbels/hsr-optimizer/discussions/403" />
                )
                <ul>
                  <li>Inaccurate speed decimals, instant scan</li>
                  <li>No download needed, but limited to ingame characters' equipped relics</li>
                </ul>
              </li>
            </ul>
          </Text>
          <Flex vertical align="flex-start">
            <Flex gap={10} align="center">
              <Upload
                accept=".json"
                name="file"
                beforeUpload={beforeUpload}
              >
                <Button
                  style={{ width: importerTabButtonWidth }}
                  icon={<UploadOutlined />}
                  loading={loading1}
                  onClick={() => setCurrentStage(Stages.LOAD_FILE)}
                >
                  Upload scanner json file
                </Button>
              </Upload>

              or

              <Input
                style={{ width: importerTabButtonWidth }}
                className="centered-placeholder"
                placeholder="Paste json file contents"
                value=""
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
            Invalid scanner file, please try a different file
          </Flex>
        </Flex>
      )
    }

    return (
      <Flex style={{ minHeight: 250 }}>
        <Flex vertical gap={10} style={{ display: currentStage >= 1 ? 'flex' : 'none' }}>
          <Text>
            {`File contains ${currentRelics.length || 0} relics and ${currentCharacters?.length || 0} characters.`}
          </Text>

          <Text>
            Import relics only. Updates the optimizer with the new dataset of relics and doesn't overwrite builds.
          </Text>

          <Button style={{ width: importerTabButtonWidth }} type="primary" onClick={mergeRelicsConfirmed} loading={loading2}>
            Import relics
          </Button>

          <Divider><Text style={{ fontSize: 12 }}>OR</Text></Divider>
          <Text>
            Import relics and characters. Replaces the optimizer builds with ingame builds.
          </Text>

          <Popconfirm
            title="Overwrite optimizer builds"
            description="Are you sure you want to overwrite your optimizer builds with ingame builds?"
            onConfirm={mergeCharactersConfirmed}
            placement="bottom"
            okText="Yes"
            cancelText="Cancel"
          >
            <Button style={{ width: importerTabButtonWidth }} type="primary" loading={loading2}>
              Import relics & characters
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
            Done!
          </Text>
        </Flex>
      </Flex>
    )
  }

  return (
    <Flex gap={5}>
      <Steps
        direction="vertical"
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

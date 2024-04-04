import { useState } from 'react'
import { KelzScannerConfig, ReliquaryArchiverConfig, ScannerSourceToParser, ValidScannerSources } from 'lib/importer/importConfig.js'
import { Message } from 'lib/message.js'
import { SaveState } from 'lib/saveState.js'
import { Button, Divider, Flex, Popconfirm, Steps, Typography, Upload } from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import DB, { AppPages } from 'lib/db.js'
import { importerTabButtonWidth, importerTabSpinnerMs } from 'components/importerTab/importerTabUiConstants.ts'
import { Relic } from 'types/Relic'
import { ColorizedLink } from 'components/common/ColorizedLink.tsx'

const { Text } = Typography

type ParsedCharacter = {
  characterLevel: number
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

  function beforeUpload(file): Promise<any> {
    return new Promise(() => {
      const reader = new FileReader()
      reader.readAsText(file)
      reader.onload = () => {
        try {
          const fileUploadText = String(reader.result)

          const json = JSON.parse(fileUploadText)
          console.log('JSON', json)

          setLoading1(true)

          if (!json) {
            throw new Error('Invalid JSON')
          }

          if (!ValidScannerSources.includes(json.source)) {
            throw new Error('Invalid scanner file')
          }

          const parser = ScannerSourceToParser[json.source]
          const output = parser.parse(json)
          let characters: ParsedCharacter[] = output.characters
          const relics: Relic[] = output.relics

          characters = characters.sort((a, b) => b.characterLevel - a.characterLevel)

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
      return false
    })
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
      <Flex style={{ minHeight: 100, marginBottom: 30 }}>
        <Flex vertical gap={10}>
          <Text>
            Install and run one of the relic scanner options:
          </Text>
          <Text>
            <ul>
              <li>
                Kel-Z HSR Scanner (
                <ColorizedLink text="Github" url={KelzScannerConfig.releases} />
                )
                <ul>
                  <li>OCR scanner</li>
                  <li>Supports all 16:9 screen resolutions</li>
                </ul>
              </li>
              {true && (
                <li>
                  IceDynamix Reliquary Archiver (
                  <ColorizedLink text="Github" url={ReliquaryArchiverConfig.releases} />
                  )
                  <ul>
                    <li>Network scanner</li>
                    <li>Imports accurate speed decimals for the entire inventory</li>
                    <li>Beta release (run as admin) - might not work for all machines, please report bugs to the discord server</li>
                  </ul>
                </li>
              )}
              <li>
                Relic Scorer Import (
                <span onClick={() => window.store.getState().setActiveKey(AppPages.RELIC_SCORER)}>
                  <ColorizedLink text="Relic scorer" />
                </span>
                )
                <ul>
                  <li>No download needed, but limited to relics from the 8 characters on profile showcase</li>
                  <li>Imports accurate speed decimals</li>
                </ul>
              </li>
            </ul>
          </Text>
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

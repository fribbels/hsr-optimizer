import { useState } from 'react'
import { Button, Flex, Steps, Typography, Upload } from 'antd'
import { ImportOutlined, UploadOutlined } from '@ant-design/icons'
import { importerTabButtonWidth, importerTabSpinnerMs } from './importerTabUiConstants.ts'
import DB from 'lib/db.js'

const { Text } = Typography

enum Stages {
  LOAD_FILE = 0,
  CONFIRM_DATA = 1,
  FINISHED = 2,
}

type LoadSaveState = {
  characters: []
  relics: []
}

export function LoadDataSubmenu() {
  const [currentStage, setCurrentStage] = useState<Stages>(Stages.LOAD_FILE)
  const [currentSave, setCurrentSave] = useState<LoadSaveState | undefined>(undefined)
  const [loading1, setLoading1] = useState(false)
  const [loading2, setLoading2] = useState(false)

  function beforeUpload(file): Promise<boolean> {
    return new Promise(() => {
      const reader = new FileReader()
      reader.readAsText(file)
      reader.onload = () => {
        const fileUploadText = String(reader.result)
        console.log('Uploaded file', fileUploadText)

        const json = JSON.parse(fileUploadText)
        console.log('Parsed json', json)

        if (json.fileType || json.source) {
          setLoading1(true)

          setTimeout(() => {
            setLoading1(false)
            setCurrentSave(undefined)
            setCurrentStage(Stages.CONFIRM_DATA)
          }, importerTabSpinnerMs)
          return
        }

        setLoading1(true)

        setTimeout(() => {
          setLoading1(false)
          setCurrentSave(json)
          setCurrentStage(Stages.CONFIRM_DATA)
        }, importerTabSpinnerMs)
      }
      return false
    })
  }

  function loadConfirmed() {
    setLoading2(true)
    setTimeout(() => {
      setLoading2(false)
      DB.setStore(currentSave)
      window.refreshRelicsScore()
      setCurrentStage(Stages.FINISHED)
    }, importerTabSpinnerMs)
  }

  function LoadDataContentUploadFile() {
    return (
      <Flex style={{ minHeight: 100 }}>
        <Flex vertical gap={10}>
          <Text>
            Load your optimizer data from a file.
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
              Load save data
            </Button>
          </Upload>
        </Flex>
      </Flex>
    )
  }

  function ConfirmLoadData() {
    if (!currentSave || !currentSave.relics || !currentSave.characters) {
      return (
        <Flex style={{ minHeight: 100 }}>
          <Flex vertical gap={10} style={{ display: currentStage >= 1 ? 'flex' : 'none' }}>
            Invalid save file, please try a different file. Did you mean to use Relic Importer tab?
          </Flex>
        </Flex>
      )
    }
    return (
      <Flex style={{ minHeight: 100 }}>
        <Flex vertical gap={10} style={{ display: currentStage >= 1 ? 'flex' : 'none' }}>
          <Text>
            {`File contains ${currentSave.relics.length} relics and ${currentSave.characters.length} characters. Replace your current data with the uploaded data?`}
          </Text>
          <Button style={{ width: importerTabButtonWidth }} icon={<ImportOutlined />} type="primary" onClick={loadConfirmed} loading={loading2}>
            Use uploaded data
          </Button>
        </Flex>
      </Flex>
    )
  }

  function LoadCompleted() {
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
            description: LoadDataContentUploadFile(),
          },
          {
            title: '',
            description: ConfirmLoadData(),
          },
          {
            title: '',
            description: LoadCompleted(),
          },
        ]}
      />
    </Flex>
  )
}

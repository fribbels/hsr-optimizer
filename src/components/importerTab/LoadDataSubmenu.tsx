import React, { useState } from 'react'
import { Button, Flex, Steps, Typography, Upload } from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import { importerTabSpinnerMs } from './importerTabUiConstants.ts';

const { Text } = Typography

enum Steps {
  LOAD_DATA
  CONFIRM_DATA
  FINISHED
}

export function LoadDataSubmenu() {
  const [currentStep, setCurrentStep] = useState(Steps.LOAD_DATA)
  const [currentSave, setCurrentSave] = useState([])
  const [loading1, setLoading1] = useState(false)
  const [loading2, setLoading2] = useState(false)

  const onStepChange = (value: Steps) => {
    setCurrentStep(value)
  }

  function

  function beforeUpload(file) {
    return new Promise(() => {
      const reader = new FileReader()
      reader.readAsText(file)
      reader.onload = () => {
        const fileUploadText = reader.result
        console.log('Uploaded file', fileUploadText)

        const json = JSON.parse(fileUploadText)
        console.log('Parsed json', json)

        if (json.fileType || json.source) {
          setLoading1(true)

          setTimeout(() => {
            setLoading1(false)
            setCurrentSave(undefined)
            onStepChange(1)
          }, importerTabSpinnerMs)
          return
        }

        setLoading1(true)

        setTimeout(() => {
          setLoading1(false)
          setCurrentSave(json)
          onStepChange(1)
        }, importerTabSpinnerMs)
      }
      return false
    })
  }

  function onUploadClick() {
    onStepChange(0)
  }

  function loadConfirmed() {
    setLoading2(true)
    setTimeout(() => {
      setLoading2(false)
      DB.setStore(currentSave)
      onStepChange(2)
    }, spinnerMs)
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
            onClick={onUploadClick}
            beforeUpload={beforeUpload}
          >
            <Button style={{ width: buttonWidth }} icon={<UploadOutlined />} loading={loading1}>
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
          <Flex vertical gap={10} style={{ display: current >= 1 ? 'flex' : 'none' }}>
            Invalid save file, please try a different file. Did you mean to use Relic Importer tab?
          </Flex>
        </Flex>
      )
    }
    return (
      <Flex style={{ minHeight: 100 }}>
        <Flex vertical gap={10} style={{ display: current >= 1 ? 'flex' : 'none' }}>
          <Text>
            {`File contains ${currentSave.relics.length} relics and ${currentSave.characters.length} characters. Replace your current data with the uploaded data?`}
          </Text>
          <Button style={{ width: buttonWidth }} type="primary" onClick={loadConfirmed} loading={loading2}>
            Use uploaded data
          </Button>
        </Flex>
      </Flex>
    )
  }

  function LoadCompleted() {
    return (
      <Flex style={{ minHeight: 100 }}>
        <Flex vertical gap={10} style={{ display: current >= 2 ? 'flex' : 'none' }}>
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
        current={current}
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

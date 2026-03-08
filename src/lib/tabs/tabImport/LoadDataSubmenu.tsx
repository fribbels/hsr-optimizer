import {
  IconFileImport,
  IconUpload,
} from '@tabler/icons-react'
import { Upload } from 'antd'
import { Button, Flex, Stepper, Text } from '@mantine/core'
import DB from 'lib/state/db'
import { SaveState } from 'lib/state/saveState'
import {
  importerTabButtonWidth,
  importerTabSpinnerMs,
} from 'lib/tabs/tabImport/importerTabUiConstants'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { HsrOptimizerSaveFormat } from 'types/store'

enum Stages {
  LOAD_FILE = 0,
  CONFIRM_DATA = 1,
  FINISHED = 2,
}

export function LoadDataSubmenu() {
  const [currentStage, setCurrentStage] = useState<Stages>(Stages.LOAD_FILE)
  const [currentSave, setCurrentSave] = useState<HsrOptimizerSaveFormat | undefined>(undefined)
  const [loading1, setLoading1] = useState(false)
  const [loading2, setLoading2] = useState(false)
  const { t } = useTranslation('importSaveTab', { keyPrefix: 'LoadData' })

  function beforeUpload(file: File): Promise<boolean> {
    return new Promise(() => {
      const reader = new FileReader()
      reader.readAsText(file)
      reader.onload = () => {
        const fileUploadText = String(reader.result)
        const json = JSON.parse(fileUploadText)

        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        if (json.fileType || json.source) {
          // Invalid save file
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
          setCurrentSave(json as HsrOptimizerSaveFormat)
          setCurrentStage(Stages.CONFIRM_DATA)
        }, importerTabSpinnerMs)
      }
      return false
    })
  }

  function loadConfirmed() {
    setLoading2(true)
    setTimeout(() => {
      DB.setStore(currentSave!, false)

      setTimeout(() => {
        setCurrentStage(Stages.FINISHED)
        setLoading2(false)
        SaveState.save()
      }, importerTabSpinnerMs)
    }, importerTabSpinnerMs)
  }

  function LoadDataContentUploadFile() {
    return (
      <Flex style={{ minHeight: 100 }}>
        <Flex direction="column" gap={10}>
          <Text>
            {t('Stage1.Label') /* Load your optimizer data from a file. */}
          </Text>
          <Upload
            accept='.json'
            name='file'
            beforeUpload={beforeUpload}
          >
            <Button
              style={{ width: importerTabButtonWidth }}
              leftSection={<IconUpload size={16} />}
              loading={loading1}
              onClick={() => setCurrentStage(Stages.LOAD_FILE)}
              variant="default"
            >
              {t('Stage1.ButtonText') /* Load save data */}
            </Button>
          </Upload>
        </Flex>
      </Flex>
    )
  }

  function ConfirmLoadData() {
    if (!currentSave?.relics || !currentSave.characters) {
      return (
        <Flex style={{ minHeight: 100 }}>
          <Flex direction="column" gap={10} style={{ display: currentStage >= Stages.CONFIRM_DATA ? 'flex' : 'none' }}>
            {
              /* Invalid save file, please try a different file. Did you mean to use the Relic scanner import tab? */
              t('Stage2.ErrorMsg')
            }
          </Flex>
        </Flex>
      )
    }
    return (
      <Flex style={{ minHeight: 100 }}>
        <Flex direction="column" gap={10} style={{ display: currentStage >= Stages.CONFIRM_DATA ? 'flex' : 'none' }}>
          <Text>
            {
              /* File contains {n relics} and {m characters}. Replace your current data with the uploaded data? */
              t('Stage2.Label', { relicCount: currentSave.relics.length, characterCount: currentSave.characters.length })
            }
          </Text>
          <Button style={{ width: importerTabButtonWidth }} leftSection={<IconFileImport size={16} />} onClick={loadConfirmed} loading={loading2}>
            {t('Stage2.ButtonText') /* Use uploaded data */}
          </Button>
        </Flex>
      </Flex>
    )
  }

  function LoadCompleted() {
    return (
      <Flex style={{ minHeight: 100 }}>
        <Flex direction="column" gap={10} style={{ display: currentStage >= Stages.FINISHED ? 'flex' : 'none' }}>
          <Text>
            {t('Stage3.SuccessMessage') /* Done! */}
          </Text>
        </Flex>
      </Flex>
    )
  }

  return (
    <Flex gap={5}>
      <Stepper
        orientation="vertical"
        active={currentStage}
      >
        <Stepper.Step label="" description={LoadDataContentUploadFile()} />
        <Stepper.Step label="" description={ConfirmLoadData()} />
        <Stepper.Step label="" description={LoadCompleted()} />
      </Stepper>
    </Flex>
  )
}

import {
  IconFileImport,
  IconUpload,
} from '@tabler/icons-react'
import { Button, Flex, Timeline } from '@mantine/core'
import * as persistenceService from 'lib/services/persistenceService'
import { SaveState } from 'lib/state/saveState'
import {
  importerTabButtonWidth,
  importerTabSpinnerMs,
} from 'lib/tabs/tabImport/importerTabUiConstants'
import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { TFunction } from 'i18next'
import type { RefObject } from 'react'
import type { HsrOptimizerSaveFormat } from 'types/store'
import classes from './LoadDataSubmenu.module.css'

enum Stages {
  LOAD_FILE = 0,
  CONFIRM_DATA = 1,
  FINISHED = 2,
}

type LoadDataTranslate = TFunction<'importSaveTab', 'LoadData'>

function UploadFileStage(props: {
  loading: boolean
  fileInputRef: RefObject<HTMLInputElement | null>
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onUploadClick: () => void
  t: LoadDataTranslate
}) {
  return (
    <Flex className={classes.stageContainer}>
      <Flex direction='column' gap={10}>
        <div>
          {props.t('Stage1.Label') /* Load your optimizer data from a file. */}
        </div>
        <input
          type='file'
          accept='.json'
          ref={props.fileInputRef}
          style={{ display: 'none' }}
          onChange={props.onFileChange}
        />
        <Button
          w={importerTabButtonWidth}
          leftSection={<IconUpload size={16} />}
          loading={props.loading}
          onClick={props.onUploadClick}
          variant='default'
        >
          {props.t('Stage1.ButtonText') /* Load save data */}
        </Button>
      </Flex>
    </Flex>
  )
}

function ConfirmDataStage(props: {
  currentSave: HsrOptimizerSaveFormat | undefined
  currentStage: Stages
  loading: boolean
  onConfirm: () => void
  t: LoadDataTranslate
}) {
  const isVisible = props.currentStage >= Stages.CONFIRM_DATA
  const displayStyle = { display: isVisible ? 'flex' : 'none' }

  if (!props.currentSave?.relics || !props.currentSave.characters) {
    return (
      <Flex className={classes.stageContainer}>
        <Flex direction='column' gap={10} style={displayStyle}>
          {
            /* Invalid save file, please try a different file. Did you mean to use the Relic scanner import tab? */
            props.t('Stage2.ErrorMsg')
          }
        </Flex>
      </Flex>
    )
  }

  return (
    <Flex className={classes.stageContainer}>
      <Flex direction='column' gap={10} style={displayStyle}>
        <div>
          {
            /* File contains {n relics} and {m characters}. Replace your current data with the uploaded data? */
            props.t('Stage2.Label', { relicCount: props.currentSave.relics.length, characterCount: props.currentSave.characters.length })
          }
        </div>
        <Button w={importerTabButtonWidth} leftSection={<IconFileImport size={16} />} onClick={props.onConfirm} loading={props.loading}>
          {props.t('Stage2.ButtonText') /* Use uploaded data */}
        </Button>
      </Flex>
    </Flex>
  )
}

function CompletedStage(props: { currentStage: Stages; t: LoadDataTranslate }) {
  return (
    <Flex className={classes.stageContainer}>
      <Flex direction='column' gap={10} style={{ display: props.currentStage >= Stages.FINISHED ? 'flex' : 'none' }}>
        <div>
          {props.t('Stage3.SuccessMessage') /* Done! */}
        </div>
      </Flex>
    </Flex>
  )
}

export function LoadDataSubmenu() {
  const [currentStage, setCurrentStage] = useState<Stages>(Stages.LOAD_FILE)
  const [currentSave, setCurrentSave] = useState<HsrOptimizerSaveFormat | undefined>(undefined)
  const [loading1, setLoading1] = useState(false)
  const [loading2, setLoading2] = useState(false)
  const { t } = useTranslation('importSaveTab', { keyPrefix: 'LoadData' })
  const fileInputRef = useRef<HTMLInputElement>(null)

  function beforeUpload(file: File) {
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
  }

  function loadConfirmed() {
    setLoading2(true)
    setTimeout(() => {
      persistenceService.loadSaveData(currentSave!, false)

      setTimeout(() => {
        setCurrentStage(Stages.FINISHED)
        setLoading2(false)
        SaveState.save()
      }, importerTabSpinnerMs)
    }, importerTabSpinnerMs)
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      beforeUpload(file)
    }
    e.target.value = ''
  }

  function handleUploadClick() {
    setCurrentStage(Stages.LOAD_FILE)
    fileInputRef.current?.click()
  }

  return (
    <Flex gap={5}>
      <Timeline active={currentStage} bulletSize={24} lineWidth={2}>
        <Timeline.Item>
          <UploadFileStage
            loading={loading1}
            fileInputRef={fileInputRef}
            onFileChange={handleFileChange}
            onUploadClick={handleUploadClick}
            t={t}
          />
        </Timeline.Item>
        <Timeline.Item>
          <ConfirmDataStage
            currentSave={currentSave}
            currentStage={currentStage}
            loading={loading2}
            onConfirm={loadConfirmed}
            t={t}
          />
        </Timeline.Item>
        <Timeline.Item>
          <CompletedStage currentStage={currentStage} t={t} />
        </Timeline.Item>
      </Timeline>
    </Flex>
  )
}

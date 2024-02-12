import React, { useState } from 'react'
import { DownloadOutlined, UploadOutlined } from '@ant-design/icons'
import { Button, Divider, Flex, Popconfirm, Steps, Tabs, Typography, Upload } from 'antd'
import { OcrParserFribbels1 } from 'lib/ocrParserFribbels1'
import { OcrParserKelz3 } from 'lib/ocrParserKelz3'
import { Message } from 'lib/message'
import { DB } from 'lib/db'
import { SaveState } from 'lib/saveState'
import PropTypes from 'prop-types'

const { Text } = Typography

const spinnerMs = 500

// https://web.dev/patterns/files/save-a-file
const saveFile = async (blob, suggestedName) => {
  /*
   * Feature detection. The API needs to be supported
   * and the app not run in an iframe.
   */
  const supportsFileSystemAccess
    = 'showSaveFilePicker' in window
    && (() => {
      try {
        return window.self === window.top
      } catch {
        return false
      }
    })()
  // If the File System Access API is supported…
  if (supportsFileSystemAccess) {
    try {
      // Show the file save dialog.
      const handle = await window.showSaveFilePicker({
        suggestedName,
        types: [{
          description: 'JSON',
          accept: { 'text/json': ['.json'] },
        }],
      })
      // Write the blob to the file.
      const writable = await handle.createWritable()
      await writable.write(blob)
      await writable.close()
    } catch (err) {
      console.warn(err.name, err.message)
    }
  } else {
    /*
     * Fallback if the File System Access API is not supported…
     * Create the blob URL.
     */
    const blobURL = URL.createObjectURL(blob)
    // Create the `<a download>` element and append it invisibly.
    const a = document.createElement('a')
    a.href = blobURL
    a.download = suggestedName
    a.style.display = 'none'
    document.body.append(a)
    // Programmatically click the element.
    a.click()
    // Revoke the blob URL and remove the element.
    setTimeout(() => {
      URL.revokeObjectURL(blobURL)
      a.remove()
    }, 1000)
  }
}

function SaveDataTab() {
  async function saveClicked() {
    try {
      let stateString = SaveState.save()

      const blob = new Blob(
        [stateString],
        { type: 'text/json;charset=utf-8' },
      )

      await saveFile(blob, 'fribbels-optimizer-save.json')

      Message.success('Saved data')
    } catch (e) {
      console.warn(e)
    }
  }

  return (
    <Flex vertical gap={5}>
      <Text>
        Save your optimizer data to a file.
      </Text>
      <Button type="primary" onClick={saveClicked} icon={<DownloadOutlined />} style={{ width: 200 }}>
        Save data
      </Button>
    </Flex>
  )
}

function ClearDataTab() {
  const [loading, setLoading] = useState(false)

  function clearDataClicked() {
    console.log('Clear data')
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      DB.resetStore()

      Message.success('Cleared data')
    }, spinnerMs)
  }

  return (
    <Flex vertical gap={5}>
      <Text>
        Clear all optimizer data.
      </Text>
      <Popconfirm
        title="Erase all data"
        description="Are you sure you want to clear all relics and characters?"
        onConfirm={clearDataClicked}
        placement="bottom"
        okText="Yes"
        cancelText="Cancel"
      >
        <Button type="primary" loading={loading} style={{ width: 200 }}>
          Clear data
        </Button>
      </Popconfirm>
    </Flex>
  )
}

function LoadDataTab() {
  const [current, setCurrent] = useState(0)
  const [currentSave, setCurrentSave] = useState([])
  const [loading1, setLoading1] = useState(false)
  const [loading2, setLoading2] = useState(false)

  const onStepChange = (value) => {
    console.log('onStepChange:', value)
    setCurrent(value)
  }

  function beforeUpload(file) {
    return new Promise(() => {
      const reader = new FileReader()
      reader.readAsText(file)
      reader.onload = () => {
        let fileUploadText = reader.result
        console.log('Uploaded file', fileUploadText)

        let json = JSON.parse(fileUploadText)
        console.log('Parsed json', json)

        if (json.fileType || json.source) {
          setLoading1(true)

          setTimeout(() => {
            setLoading1(false)
            setCurrentSave(undefined)
            onStepChange(1)
          }, spinnerMs)
          return
        }

        setLoading1(true)

        setTimeout(() => {
          setLoading1(false)
          setCurrentSave(json)
          onStepChange(1)
        }, spinnerMs)
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
            <Button style={{ width: 200 }} icon={<UploadOutlined />} loading={loading1}>
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
            File contains
            {' '}
            {currentSave.relics.length}
            {' '}
            relics and
            {' '}
            {currentSave.characters.length}
            {' '}
            characters. Replace your current data with the uploaded data?
          </Text>
          <Button style={{ width: 200 }} type="primary" onClick={loadConfirmed} loading={loading2}>
            Use Uploaded Data
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

function KelZImporterTab() {
  const [current, setCurrent] = useState(0)
  const [currentRelics, setCurrentRelics] = useState([])
  const [currentCharacters, setCurrentCharacters] = useState([])
  const [loading1, setLoading1] = useState(false)
  const [loading2, setLoading2] = useState(false)

  const onStepChange = (value) => {
    console.log('onStepChange:', value)
    setCurrent(value)
  }

  function beforeUpload(file) {
    return new Promise(() => {
      const reader = new FileReader()
      reader.readAsText(file)
      reader.onload = () => {
        try {
          let fileUploadText = reader.result

          let json = JSON.parse(fileUploadText)
          console.log('JSON', json)

          setLoading1(true)

          if (!json) {
            setTimeout(() => {
              setLoading1(false)
              setCurrentRelics(undefined)
              setCurrentCharacters(undefined)
              onStepChange(1)
            }, spinnerMs)
            return
          }

          let relics = [], characters = []
          if (json.source == 'HSR-Scanner' && json.version == 3) {
            relics = OcrParserKelz3.parse(json)
            characters = OcrParserKelz3.parseCharacters(json)
            characters = characters.sort((a, b) => b.characterLevel - a.characterLevel)
          } else {
            setTimeout(() => {
              setLoading1(false)
              setCurrentRelics(undefined)
              setCurrentCharacters(undefined)
              onStepChange(1)
            }, spinnerMs)
            return
          }

          setTimeout(() => {
            setLoading1(false)
            setCurrentRelics(relics)
            setCurrentCharacters(characters)
            onStepChange(1)
          }, spinnerMs)
        } catch (e) {
          Message.error(e.message, 10)
          Message.error('Error occurred while importing file, try running the scanner again with a dark background to improve scan accuracy', 10)
        }
      }
      return false
    })
  }

  function onUploadClick() {
    onStepChange(0)
  }

  function mergeRelicsConfirmed() {
    setLoading2(true)
    setTimeout(() => {
      setLoading2(false)
      DB.mergeRelicsWithState(currentRelics)
      SaveState.save()
      onStepChange(2)
    }, spinnerMs)
  }

  function mergeCharactersConfirmed() {
    setLoading2(true)
    setTimeout(() => {
      setLoading2(false)
      DB.mergeRelicsWithState(currentRelics, currentCharacters)
      SaveState.save()
      onStepChange(2)
    }, spinnerMs)
  }

  function kelZImporterContentUploadFile() {
    return (
      <Flex style={{ minHeight: 100, marginBottom: 30 }}>
        <Flex vertical gap={10}>
          <Text>
            Install and run Kel-Z HSR Scanner (
            <Typography.Link target="_blank" href="https://github.com/kel-z/HSR-Scanner/releases/latest">Github</Typography.Link>
            ).
          </Text>
          <Text>
            It supports character and light cones imports and all 16:9 resolutions.
          </Text>
          <Text>
            Upload the json file generated by Kel-Z HSR Scanner:
          </Text>
          <Upload
            accept=".json"
            name="file"
            onClick={onUploadClick}
            beforeUpload={beforeUpload}
          >
            <Button style={{ width: 210 }} icon={<UploadOutlined />} loading={loading1}>
              Upload HSRScanData File
            </Button>
          </Upload>
        </Flex>
      </Flex>
    )
  }

  function confirmRelicMerge() {
    if (!currentRelics || !currentRelics.length) {
      return (
        <Flex style={{ minHeight: 100 }}>
          <Flex vertical gap={10} style={{ display: current >= 1 ? 'flex' : 'none' }}>
            Invalid HSRScanData file, please try a different file
          </Flex>
        </Flex>
      )
    }

    return (
      <Flex style={{ minHeight: 250 }}>
        <Flex vertical gap={10} style={{ display: current >= 1 ? 'flex' : 'none' }}>
          <Text>
            File contains
            {' '}
            {currentRelics.length}
            {' '}
            relics and
            {' '}
            {currentCharacters?.length || 0}
            {' '}
            characters.
          </Text>

          <Text>Import relics only. Updates the optimizer with newly obtained relics.</Text>

          <Button style={{ width: 200 }} type="primary" onClick={mergeRelicsConfirmed} loading={loading2}>
            Import relics
          </Button>

          <Divider />
          <Text>
            Import relics and characters.
          </Text>

          <Popconfirm
            title="Overwrite optimizer builds"
            description="Are you sure you want to overwrite your optimizer builds with ingame builds?"
            onConfirm={mergeCharactersConfirmed}
            placement="bottom"
            okText="Yes"
            cancelText="Cancel"
          >
            <Button style={{ width: 200 }} type="primary" loading={loading2}>
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
        <Flex vertical gap={10} style={{ display: current >= 2 ? 'flex' : 'none' }}>
          <Text>
            Done!
          </Text>
          <Text>
            The Relic scorer can be used to import accurate speed substats
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
            description: kelZImporterContentUploadFile(),
          },
          {
            title: '',
            description: confirmRelicMerge(),
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

function FribbelsImporterTab() {
  const [current, setCurrent] = useState(0)
  const [currentRelics, setCurrentRelics] = useState([])
  const [currentCharacters, setCurrentCharacters] = useState([])
  const [loading1, setLoading1] = useState(false)
  const [loading2, setLoading2] = useState(false)

  const onStepChange = (value) => {
    console.log('onStepChange:', value)
    setCurrent(value)
  }

  function beforeUpload(file) {
    return new Promise(() => {
      const reader = new FileReader()
      reader.readAsText(file)
      reader.onload = () => {
        try {
          let fileUploadText = reader.result
          // console.log('Uploaded text relicImporterTab', fileUploadText);

          let json = JSON.parse(fileUploadText)
          console.log('JSON', json)

          setLoading1(true)

          if (!json) {
            setTimeout(() => {
              setLoading1(false)
              setCurrentRelics(undefined)
              setCurrentCharacters(undefined)
              onStepChange(1)
            }, spinnerMs)
            return
          }

          let relics = [], characters = []
          if (json.fileType == 'Fribbels HSR Scanner' && json.fileVersion == 'v1.0.0') {
            relics = OcrParserFribbels1.parse(json)
          } else {
            setTimeout(() => {
              setLoading1(false)
              setCurrentRelics(undefined)
              setCurrentCharacters(undefined)
              onStepChange(1)
            }, spinnerMs)
            return
          }

          setTimeout(() => {
            setLoading1(false)
            setCurrentRelics(relics)
            setCurrentCharacters(characters)
            onStepChange(1)
          }, spinnerMs)
        } catch (e) {
          Message.error(e.message, 10)
          Message.error('Error occurred while importing file, try running the scanner again with a dark background to improve scan accuracy', 10)
        }
      }
      return false
    })
  }

  function onUploadClick() {
    onStepChange(0)
  }

  function mergeRelicsConfirmed() {
    setLoading2(true)
    setTimeout(() => {
      setLoading2(false)
      DB.mergeRelicsWithState(currentRelics)
      SaveState.save()
      onStepChange(2)
    }, spinnerMs)
  }

  function fribbelsImporterContentUploadFile() {
    return (
      <Flex style={{ minHeight: 100, marginBottom: 30 }}>
        <Flex vertical gap={10}>
          <Text>
            Install and run Fribbels HSR Scanner (
            <Typography.Link target="_blank" href="https://github.com/fribbels/Fribbels-Honkai-Star-Rail-Scanner/releases/latest">Github</Typography.Link>
            ).
          </Text>
          <Text>
            The Kel-Z importer is recommended for scanning speed & character imports. This importer can be used as a backup if that doesn't work.
          </Text>
          <Text>
            Upload the json file generated by the scanner:
          </Text>
          <Upload
            accept=".json"
            name="file"
            onClick={onUploadClick}
            beforeUpload={beforeUpload}
          >
            <Button style={{ width: 200 }} icon={<UploadOutlined />} loading={loading1}>
              Upload relics file
            </Button>
          </Upload>
        </Flex>
      </Flex>
    )
  }

  function confirmRelicMerge() {
    if (!currentRelics || !currentRelics.length) {
      return (
        <Flex style={{ minHeight: 100 }}>
          <Flex vertical gap={10} style={{ display: current >= 1 ? 'flex' : 'none' }}>
            Invalid relics file, please try a different file
          </Flex>
        </Flex>
      )
    }

    return (
      <Flex style={{ minHeight: 250 }}>
        <Flex vertical gap={10} style={{ display: current >= 1 ? 'flex' : 'none' }}>
          <Text>
            File contains
            {' '}
            {currentRelics.length}
            {' '}
            relics and
            {' '}
            {currentCharacters?.length || 0}
            {' '}
            characters.
          </Text>

          <Text>Import relics only. Updates the optimizer with newly obtained relics.</Text>

          <Button style={{ width: 200 }} type="primary" onClick={mergeRelicsConfirmed} loading={loading2}>
            Import relics
          </Button>
        </Flex>
      </Flex>
    )
  }

  function mergeCompleted() {
    return (
      <Flex style={{ minHeight: 100 }}>
        <Flex vertical gap={10} style={{ display: current >= 2 ? 'flex' : 'none' }}>
          <Text>
            Done!
          </Text>
          <Text>
            The Relic scorer can be used to import accurate speed substats
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
            description: fribbelsImporterContentUploadFile(),
          },
          {
            title: '',
            description: confirmRelicMerge(),
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

export default function ImportTab() {
  // Test
  let tabSize = 'large'

  return (
    <div>
      <Flex vertical gap={5} style={{ marginLeft: 20, width: 1200 }}>
        <Tabs
          defaultActiveKey="1"
          size={tabSize}
          style={{
            marginBottom: 32,
          }}
          items={[
            {
              label: 'Kel-Z scanner importer (Recommended)',
              key: 0,
              children: KelZImporterTab(),
            },
            {
              label: 'Fribbels scanner importer',
              key: 1,
              children: FribbelsImporterTab(),
            },
            {
              label: 'Save optimizer data',
              key: 2,
              children: SaveDataTab(),
            },
            {
              label: 'Load optimizer data',
              key: 3,
              children: LoadDataTab(),
            },
            {
              label: 'Clear optimizer data',
              key: 4,
              children: ClearDataTab(),
            },
          ]}
        />
      </Flex>
    </div>
  )
}
ImportTab.propTypes = {
  active: PropTypes.bool,
}

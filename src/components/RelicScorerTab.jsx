import React, { useEffect, useState } from 'react'
import { Button, Flex, Form, Input, Segmented, Typography } from 'antd'
import { CharacterPreview } from 'components/CharacterPreview'
import { SaveState } from 'lib/saveState'
import { CharacterConverter } from 'lib/characterConverter'
import { Assets } from 'lib/assets'
import PropTypes from 'prop-types'
import DB from 'lib/db'
import { useSubscribe } from 'hooks/useSubscribe'
import { Utils } from 'lib/utils'
import { CameraOutlined, DownloadOutlined } from '@ant-design/icons'
import { Message } from 'lib/message'

const { Text } = Typography
export default function RelicScorerTab() {
  console.log('RelicScorerTab')

  const [loading, setLoading] = useState(false)
  const [availableCharacters, setAvailableCharacters] = useState([])
  const [selectedCharacter, setSelectedCharacter] = useState()

  let scorerId = window.store((s) => s.scorerId)
  let setScorerId = window.store((s) => s.setScorerId)

  const [scorerForm] = Form.useForm()
  window.scorerForm = scorerForm

  function buttonClick() {
    setLoading(true)
  }

  function onFinish(x) {
    console.log('finish', x)

    const options = {
      method: 'POST',
      body: x.scorerId,
    }

    setScorerId(x.scorerId)
    SaveState.save()

    // fetch('http://127.0.0.1:5000/getAccount', options) // Local testing
    fetch('https://08hm0krwt2.execute-api.us-west-2.amazonaws.com/dev/getAccount', options)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`)
        }
        return response.json()
      })
      .then((data) => {
        console.log(data)
        if (!data.status || data.status != 'SUCCESS') {
          setLoading(false)
          Message.error('Error loading ID')
          return 'ERROR'
        }
        // Backup
        // data = Utils.recursiveToCamel(data.data)
        // let characters = [
        //   data.detailInfo.assistAvatars[0],
        //   data.detailInfo.assistAvatars[1],
        //   data.detailInfo.assistAvatars[2],
        //   data.detailInfo.avatarDetailList[0],
        //   data.detailInfo.avatarDetailList[1],
        //   data.detailInfo.avatarDetailList[2],
        //   data.detailInfo.avatarDetailList[3],
        //   data.detailInfo.avatarDetailList[4],
        // ]

        data = data.data
        let characters = [
          data.detailInfo.avatarDetailList[4],
          data.detailInfo.avatarDetailList[0],
          data.detailInfo.avatarDetailList[7],
          data.detailInfo.avatarDetailList[5],
          data.detailInfo.avatarDetailList[1],
          data.detailInfo.avatarDetailList[2],
          data.detailInfo.avatarDetailList[3],
          data.detailInfo.avatarDetailList[6],
        ]
          .filter((x) => !!x)
          .sort((a, b) => {
            if (b._assist && a._assist) return (a.pos || 0) - (b.pos || 0)
            if (b._assist) return 1
            if (a._assist) return -1
            return 0
          })
          .filter((item, index, array) => {
            return array.findIndex((i) => i.avatarId === item.avatarId) === index
          })

        console.log('characters', characters)

        let converted = characters.map((x) => CharacterConverter.convert(x))
        setAvailableCharacters(converted)
        if (converted.length) {
          setSelectedCharacter(converted[0])
        }
        setLoading(false)
        console.log(converted)
      })
      .catch((error) => {
        console.error('Fetch error:', error)
        setLoading(false)
      })
  }

  function scoringClicked() {
    window.setIsScoringModalOpen(true)
  }

  let initialId = undefined
  let savedId = scorerId
  if (savedId) {
    try {
      let parsed = parseInt(savedId)
      initialId = isNaN(parsed) ? undefined : parsed
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div>
      <Flex vertical gap={0} align="center">
        {/* <Flex gap={10} vertical align='center'> */}
        {/*  <Text><h2>The relic scorer is down for maintenance after the 2.0 patch - stay tuned!</h2></Text> */}
        {/* </Flex> */}
        <Flex gap={10} vertical align="center">
          <Text>Input your account ID to score your support characters. The scorer will display the character's stats at level 80 with maxed traces</Text>
        </Flex>
        <Form
          form={scorerForm}
          onFinish={onFinish}
          initialValues={{ scorerId: initialId }}
        >
          <Flex style={{ margin: 20, width: 1000 }} justify="center" align="center" gap={10}>
            <Form.Item size="default" name="scorerId">
              <Input style={{ width: 150 }} placeholder="Account ID" />
            </Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} onClick={buttonClick}>
              Submit
            </Button>
            <Button
              style={{ width: 150 }}
              onClick={scoringClicked}
            >
              Scoring algorithm
            </Button>
          </Flex>
        </Form>
        <CharacterPreviewSelection
          availableCharacters={availableCharacters}
          setSelectedCharacter={setSelectedCharacter}
          selectedCharacter={selectedCharacter}
        />
      </Flex>
    </div>
  )
}
RelicScorerTab.propTypes = {
  active: PropTypes.bool,
}

function CharacterPreviewSelection(props) {
  let setScoringAlgorithmFocusCharacter = window.store((s) => s.setScoringAlgorithmFocusCharacter)

  const [screenshotLoading, setScreenshotLoading] = useState(false)
  const [downloadLoading, setDownloadLoading] = useState(false)

  // TODO: Revisit if force updates are necessary
  const [, forceUpdate] = React.useReducer((o) => !o, true)
  window.forceRelicScorerTabUpdate = () => {
    console.log('RelicScorerTab ::::: forceRelicScorerTabUpdate')
    forceUpdate()
  }

  useSubscribe('refreshRelicsScore', () => {
    // TODO: understand why setTimeout is needed and refactor
    setTimeout(() => {
      forceUpdate()
    }, 100)
  })

  console.log('CharacterPreviewSelection', props)

  useEffect(() => {
    setScoringAlgorithmFocusCharacter(props.selectedCharacter?.id)
  }, [props.selectedCharacter?.id, setScoringAlgorithmFocusCharacter])

  let options = []
  for (let i = 0; i < props.availableCharacters.length; i++) {
    let availableCharacter = props.availableCharacters[i]
    options.push({
      label: (
        <Flex align="center">
          <img style={{ width: 100, height: 100, objectFit: 'contain' }} src={Assets.getCharacterAvatarById(availableCharacter.id)}></img>
        </Flex>
      ),
      value: availableCharacter.id,
    })
  }

  function selectionChange(selected) {
    console.log('selectionChange', selected)
    props.setSelectedCharacter(props.availableCharacters.find((x) => x.id == selected))
    setScoringAlgorithmFocusCharacter(selected)
  }

  async function importClicked() {
    let newRelics = props.availableCharacters
      .flatMap((x) => Object.values(x.equipped))
      .filter((x) => !!x)

    console.log('importClicked', props.availableCharacters, newRelics)
    DB.mergeVerifiedRelicsWithState(newRelics)
    SaveState.save()
  }

  async function clipboardClicked() {
    setScreenshotLoading(true)
    // Use a small timeout here so the spinner doesn't lag while the image is being generated
    setTimeout(() => {
      Utils.screenshotElementById('relicScorerPreview', 'clipboard').finally(() => {
        setScreenshotLoading(false)
      })
    }, 50)
  }

  async function downloadClicked() {
    setDownloadLoading(true)
    // Use a small timeout here so the spinner doesn't lag while the image is being generated
    setTimeout(() => {
      const name = props.selectedCharacter ? DB.getMetadata().characters[props.selectedCharacter.id].displayName : null
      Utils.screenshotElementById('relicScorerPreview', 'download', name).finally(() => {
        setDownloadLoading(false)
      })
    }, 50)
  }

  return (
    <Flex vertical align="center" gap={5} style={{ marginBottom: 100 }}>
      <Flex gap={10} style={{ display: (props.availableCharacters.length > 0) ? 'flex' : 'none' }}>
        <Button onClick={importClicked} style={{ width: 200 }}>
          Import relics into optimizer
        </Button>
        <Button onClick={clipboardClicked} style={{ width: 200 }} icon={<CameraOutlined />} loading={screenshotLoading}>
          Copy screenshot
        </Button>
        <Button style={{ width: 40 }} icon={<DownloadOutlined />} onClick={downloadClicked} loading={downloadLoading} />
      </Flex>

      <Flex vertical align="center">
        <Segmented options={options} onChange={selectionChange} value={props.selectedCharacter?.id} />
      </Flex>
      <div id="previewWrapper" style={{ padding: '5px', backgroundColor: '#182239' }}>
        <CharacterPreview class="relicScorerCharacterPreview" character={props.selectedCharacter} source="scorer" id="relicScorerPreview" />
      </div>
    </Flex>
  )
}
CharacterPreviewSelection.propTypes = {
  availableCharacters: PropTypes.array,
  selectedCharacter: PropTypes.object,
  setSelectedCharacter: PropTypes.func,
}

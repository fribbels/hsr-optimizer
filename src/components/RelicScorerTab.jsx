import React, { useEffect, useMemo, useState } from 'react'
import { Button, Dropdown, Flex, Form, Input, Segmented, Typography } from 'antd'
import { CharacterPreview } from 'components/CharacterPreview'
import { SaveState } from 'lib/saveState'
import { CharacterConverter } from 'lib/characterConverter'
import { Assets } from 'lib/assets'
import PropTypes from 'prop-types'
import DB from 'lib/db'
import { useSubscribe } from 'hooks/useSubscribe'
import { Utils } from 'lib/utils'
import Icon, { CameraOutlined, DownloadOutlined, ExperimentOutlined, ImportOutlined, PlusCircleFilled } from '@ant-design/icons'
import { Message } from 'lib/message'
import CharacterModal from 'components/CharacterModal'

// NOTE: These strings are replaced by github actions for beta deployment, don't change
// BETA: https://9di5b7zvtb.execute-api.us-west-2.amazonaws.com/prod
export const API_ENDPOINT = 'https://o4b6dqwu5a.execute-api.us-east-1.amazonaws.com/prod'

function presetCharacters() {
  const char = (name) => Object.values(DB.getMetadata().characters).find((x) => x.displayName == name).id
  const lc = (name) => Object.values(DB.getMetadata().lightCones).find((x) => x.displayName == name).id
  return [
    { characterId: char('Robin'), lightConeId: lc('Flowing Nightglow') },
    { characterId: char('Boothill'), lightConeId: lc('Sailing Towards A Second Life') },
    { characterId: char('Stelle (Harmony)'), lightConeId: lc('Memories of the Past') },
    { characterId: char('Acheron'), lightConeId: lc('Along the Passing Shore') },
    { characterId: char('Aventurine'), lightConeId: lc('Inherently Unjust Destiny') },
    { characterId: char('Gallagher'), lightConeId: lc('Concert for Two') },
    { custom: true },
  ]
}

const { Text } = Typography
export default function RelicScorerTab() {
  console.log('RelicScorerTab')

  const [loading, setLoading] = useState(false)
  const [availableCharacters, setAvailableCharacters] = useState([])
  const [selectedCharacter, setSelectedCharacter] = useState()
  const [, forceUpdate] = React.useReducer((o) => !o)

  const scorerId = window.store((s) => s.scorerId)
  const setScorerId = window.store((s) => s.setScorerId)

  const [scorerForm] = Form.useForm()
  window.scorerForm = scorerForm

  function buttonClick() {
    setLoading(true)
  }

  function onFinish(x) {
    console.log('finish', x)

    const id = x?.scorerId?.toString().trim() || ''

    if (!id || id.length != 9) {
      setLoading(false)
      Message.error('Invalid ID')
      return
    }

    const options = {
      method: 'GET',
    }

    setScorerId(id)
    SaveState.save()

    fetch(`${API_ENDPOINT}/profile/${id}`, options)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`)
        }
        return response.json()
      })
      .then((data) => {
        console.log(data)
        if (!data.detailInfo) {
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

        const characters = data.detailInfo.avatarDetailList
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

        const converted = characters.map((x) => CharacterConverter.convert(x))
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
  const savedId = scorerId
  if (savedId) {
    try {
      const parsed = parseInt(savedId)
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
          <Text>Enter your account UID to score your profile characters at level 80 with maxed traces. Log out of the game to refresh instantly.</Text>
        </Flex>
        <Form
          form={scorerForm}
          onFinish={onFinish}
          initialValues={{ scorerId: initialId }}
        >
          <Flex style={{ margin: 10, width: 1100 }} justify="center" align="center" gap={10}>
            <Form.Item size="default" name="scorerId">
              <Input style={{ width: 150 }} placeholder="Account UID" />
            </Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} onClick={buttonClick} style={{ width: 100 }}>
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
          forceUpdate={forceUpdate}
        />
      </Flex>
    </div>
  )
}
RelicScorerTab.propTypes = {
  active: PropTypes.bool,
}

function CharacterPreviewSelection(props) {
  const setScoringAlgorithmFocusCharacter = window.store((s) => s.setScoringAlgorithmFocusCharacter)

  const [isCharacterModalOpen, setCharacterModalOpen] = useState(false)

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

  const options = []
  for (let i = 0; i < props.availableCharacters.length; i++) {
    const availableCharacter = props.availableCharacters[i]
    options.push({
      label: (
        <Flex align="center" justify="space-around">
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

  async function simulateClicked() {
    console.log('Simulate', props.selectedCharacter)
    setCharacterModalOpen(true)
  }

  function onCharacterModalOk(form) {
    if (!form.characterId) {
      return Message.error('No selected character')
    }
    if (props.availableCharacters.find((x) => x.id == form.characterId) && props.selectedCharacter.id != form.characterId) {
      return Message.error('Selected character already exists')
    }

    // Change the character metadata and set the equipped icons
    props.selectedCharacter.form = form
    props.selectedCharacter.id = form.characterId
    Object.values(props.selectedCharacter.equipped)
      .filter((x) => !!x)
      .map((x) => x.equippedBy = form.characterId)
    console.log('Modified character', props.selectedCharacter)
  }

  async function importClicked() {
    const newRelics = props.availableCharacters
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

  function sidebarClick(e) {
    if (e.custom) {
      return simulateClicked()
    }

    onCharacterModalOk({
      characterId: e.characterId,
      lightCone: e.lightConeId,
      characterLevel: 80,
      lightConeLevel: 80,
      characterEidolon: 0,
      lightConeSuperimposition: 1,
    })
    props.forceUpdate()
  }

  function Sidebar() {
    const dropdownDisplay = useMemo(() => {
      let key = 0
      return (
        <Flex vertical gap={0}>
          {
            presetCharacters().map((preset) => {
              const icon = !preset.custom
                ? (
                  <img
                    src={Assets.getCharacterAvatarById(preset.characterId)}
                    style={{ height: 100, width: 100 }}
                  />
                )
                : <Icon component={PlusCircleFilled} style={{ fontSize: 90 }} />
              return (
                <Button
                  key={key++}
                  type="text"
                  style={{ width: 110, height: 110, padding: 5, paddingTop: 4, marginLeft: -5 }}
                  onClick={() => sidebarClick(preset)}
                >
                  {icon}
                </Button>
              )
            })
          }
        </Flex>
      )
    }, [])
    return (
      <Flex
        vertical
        style={{
          position: 'relative',
          left: -245,
          top: 150,
          width: 0,
          height: 0,
        }}
        gap={20}
      >

        <Dropdown
          dropdownRender={() => (dropdownDisplay)}
        >
          <a onClick={(e) => e.preventDefault()}>
            <Button
              type="default"
              shape="round"
              style={{ height: 100, width: 100, borderRadius: 50, marginBottom: 5 }}
            >
              <Icon component={ExperimentOutlined} style={{ fontSize: 65 }} />
            </Button>
          </a>
        </Dropdown>
      </Flex>
    )
  }

  return (
    <Flex style={{ width: 1300 }} justify="space-around">
      <Flex vertical align="center" gap={5} style={{ marginBottom: 100, width: 1068 }}>
        <Flex vertical style={{ display: (props.availableCharacters.length > 0) ? 'flex' : 'none' }}>
          <Sidebar />
          <Flex gap={10} style={{ display: (props.availableCharacters.length > 0) ? 'flex' : 'none' }}>
            <Button onClick={clipboardClicked} style={{ width: 230 }} icon={<CameraOutlined />} loading={screenshotLoading}>
              Copy screenshot
            </Button>
            <Button style={{ width: 40 }} icon={<DownloadOutlined />} onClick={downloadClicked} loading={downloadLoading} />
            <Button icon={<ImportOutlined />} onClick={importClicked} style={{ width: 230 }}>
              Import relics into optimizer
            </Button>
            <Button icon={<ExperimentOutlined />} onClick={simulateClicked} style={{ width: 280 }}>
              Simulate relics on another character
            </Button>
          </Flex>
        </Flex>

        <Segmented style={{ width: '100%', overflow: 'hidden' }} options={options} block onChange={selectionChange} value={props.selectedCharacter?.id} />
        <Flex id="previewWrapper" style={{ padding: '5px', backgroundColor: '#182239' }}>
          <CharacterPreview
            class="relicScorerCharacterPreview"
            character={props.selectedCharacter}
            source="scorer"
            id="relicScorerPreview"
          />
        </Flex>

        <CharacterModal
          onOk={onCharacterModalOk}
          open={isCharacterModalOpen}
          setOpen={setCharacterModalOpen}
        />
      </Flex>
    </Flex>
  )
}
CharacterPreviewSelection.propTypes = {
  availableCharacters: PropTypes.array,
  selectedCharacter: PropTypes.object,
  setSelectedCharacter: PropTypes.func,
  forceUpdate: PropTypes.func,
}

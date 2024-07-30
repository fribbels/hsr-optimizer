import React, { useEffect, useMemo, useState } from 'react'
import { Button, Dropdown, Flex, Form, Input, Segmented, theme, Typography } from 'antd'
import { CharacterPreview } from 'components/CharacterPreview'
import { SaveState } from 'lib/saveState'
import { CharacterConverter } from 'lib/characterConverter'
import { Assets } from 'lib/assets'
import PropTypes from 'prop-types'
import DB, { AppPages } from 'lib/db'
import { Utils } from 'lib/utils'
import Icon, {
  CameraOutlined,
  DownloadOutlined,
  ExperimentOutlined,
  ImportOutlined,
  LineChartOutlined,
  PlusCircleFilled
} from '@ant-design/icons'
import { Message } from 'lib/message'
import CharacterModal from 'components/CharacterModal'
import { SavedSessionKeys } from 'lib/constantsSession'
import { applySpdPreset } from 'components/optimizerTab/optimizerForm/RecommendedPresetsButton'
import { calculateBuild } from 'lib/optimizer/calculateBuild'
import { OptimizerTabController } from 'lib/optimizerTabController'
import { Constants } from 'lib/constants'

const { useToken } = theme
// NOTE: These strings are replaced by github actions for beta deployment, don't change
// BETA: https://9di5b7zvtb.execute-api.us-west-2.amazonaws.com/prod
export const API_ENDPOINT = 'https://9di5b7zvtb.execute-api.us-west-2.amazonaws.com/prod'

function presetCharacters() {
  const char = (name) => Object.values(DB.getMetadata().characters).find((x) => x.displayName == name)?.id || null
  const lc = (name) => Object.values(DB.getMetadata().lightCones).find((x) => x.displayName == name)?.id || null
  return [
    { characterId: char('Yunli'), lightConeId: lc('Dance at Sunset') },
    { characterId: char('Jiaoqiu'), lightConeId: lc('Those Many Springs') },
    { characterId: char('March 7th (Hunt)'), lightConeId: lc('Cruising in the Stellar Sea'), lightConeSuperimposition: 5 },
    { characterId: char('Feixiao'), lightConeId: lc('I Venture Forth to Hunt') },
    { characterId: char('Lingsha'), lightConeId: lc('Scent Alone Stays True') },
    { characterId: char('Moze'), lightConeId: lc('Shadowed by Night') },
    { custom: true },
  ].filter((x) => x.characterId != null || x.custom) // Unreleased characters
}

const { Text } = Typography

export default function RelicScorerTab() {
  console.log('RelicScorerTab')

  const [loading, setLoading] = useState(false)
  const [availableCharacters, setAvailableCharacters] = useState([])
  const [selectedCharacter, setSelectedCharacter] = useState()

  const scorerId = window.store((s) => s.scorerId)
  const setScorerId = window.store((s) => s.setScorerId)

  const [scorerForm] = Form.useForm()
  window.scorerForm = scorerForm

  function onFinish(x) {
    console.log('finish', x)

    const id = x?.scorerId?.toString().trim() || ''

    if (!id || id.length != 9) {
      setLoading(false)
      Message.error('Invalid ID')
      return
    }

    setScorerId(id)
    SaveState.save()

    fetch(`${API_ENDPOINT}/profile/${id}`, { method: 'GET' })
      .then((response) => {
        if (!response.ok && !response.source) {
          throw new Error(`HTTP error! Status: ${response.status}`)
        }
        return response.json()
      })
      .then((data) => {
        console.log(data)

        let characters
        if (data.source == 'mana') {
          // Backup
          data = Utils.recursiveToCamel(data)
          characters = [
            data.detailInfo.assistAvatars[0],
            data.detailInfo.assistAvatars[1],
            data.detailInfo.assistAvatars[2],
            data.detailInfo.avatarDetailList[0],
            data.detailInfo.avatarDetailList[1],
            data.detailInfo.avatarDetailList[2],
            data.detailInfo.avatarDetailList[3],
            data.detailInfo.avatarDetailList[4],
          ]
        } else {
          if (!data.detailInfo) {
            setLoading(false)
            Message.error('Error loading ID')
            return 'ERROR'
          }

          characters = [...(data.detailInfo.assistAvatarList || []), ...(data.detailInfo.avatarDetailList || [])]
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
        }

        console.log('characters', characters)

        const converted = characters.map((x) => CharacterConverter.convert(x))
        for (let i = 0; i < converted.length; i++) {
          converted[i].index = i
        }
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

  let initialId = undefined
  if (scorerId) {
    try {
      const parsed = parseInt(scorerId)
      initialId = isNaN(parsed) ? undefined : parsed
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div>
      <Flex vertical gap={0} align="center">
        {/* <Flex gap={10} vertical align="center"> */}
        {/*  <Text><h2>The relic scorer may be slow today, try refreshing the page</h2></Text> */}
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
            <Button type="primary" htmlType="submit" loading={loading} onClick={() => setLoading(true)} style={{ width: 100 }}>
              Submit
            </Button>
            <Button
              style={{ width: 150 }}
              onClick={() => window.setIsScoringModalOpen(true)}
            >
              Scoring algorithm
            </Button>
          </Flex>
        </Form>
        <CharacterPreviewSelection
          availableCharacters={availableCharacters}
          setAvailableCharacters={setAvailableCharacters}
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
  const activeKey = window.store((s) => s.activeKey)
  const { token } = useToken()

  const setScoringAlgorithmFocusCharacter = window.store((s) => s.setScoringAlgorithmFocusCharacter)

  const [isCharacterModalOpen, setCharacterModalOpen] = useState(false)
  const [screenshotLoading, setScreenshotLoading] = useState(false)
  const [downloadLoading, setDownloadLoading] = useState(false)

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
      key: i,
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

    // Updates the selected segmented option
    const availableCharacter = props.availableCharacters[props.selectedCharacter.index]
    availableCharacter.form = form
    availableCharacter.id = form.characterId

    // Change the character metadata and set the equipped icons
    props.selectedCharacter.form = form
    props.selectedCharacter.id = form.characterId
    Object.values(props.selectedCharacter.equipped)
      .filter((x) => !!x)
      .map((x) => x.equippedBy = form.characterId)

    // Refresh the options by forcing new objects
    props.setAvailableCharacters(JSON.parse(JSON.stringify(props.availableCharacters)))
    props.setSelectedCharacter(JSON.parse(JSON.stringify(props.selectedCharacter)))
    console.log('Modified character', props.selectedCharacter)
  }

  function importClicked() {
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

  function presetClicked(e) {
    if (e.custom) {
      return simulateClicked()
    }

    onCharacterModalOk({
      characterId: e.characterId,
      lightCone: e.lightConeId,
      characterLevel: 80,
      lightConeLevel: 80,
      characterEidolon: 0,
      lightConeSuperimposition: e.lightConeSuperimposition || 1,
    })
  }

  // This is kinda janky and could use a refactor
  function optimizeClicked() {
    const form = props.selectedCharacter.form
    const characterId = form.characterId

    // Add relics and character
    importClicked()
    DB.addFromForm(form)

    // Open optimizer
    window.store.getState().setActiveKey(AppPages.OPTIMIZER)
    window.store.getState().setOptimizerTabFocusCharacter(characterId)

    // Timeout to allow the optimize page to load before applying presets
    setTimeout(() => {
      const equippedRelics = Utils.clone(props.selectedCharacter.equipped)
      const cleanedForm = OptimizerTabController.getDisplayFormValues(form)

      // Do some relic transformations to get it ready for optimization
      const relicsByPart = {}
      for (const part of Object.values(Constants.Parts)) {
        relicsByPart[part] = [equippedRelics[part]]
      }
      RelicFilters.condenseRelicSubstatsForOptimizer(relicsByPart)

      // Calculate the build's speed value to use as a preset
      const c = calculateBuild(cleanedForm, equippedRelics)
      applySpdPreset(Utils.precisionRound(c.SPD, 3), characterId)

      // Timeout to allow the form to populate before optimizing
      setTimeout(() => {
        window.optimizerStartClicked()
      }, 500)
    }, 1000)
  }

  return (
    <Flex style={{ width: 1300, marginLeft: 25 }} justify="space-around">
      <Flex vertical align="center" gap={5} style={{ marginBottom: 100, width: 1068 }}>
        <Flex vertical style={{ display: (props.availableCharacters.length > 0) ? 'flex' : 'none' }}>
          <Sidebar presetClicked={presetClicked} optimizeClicked={optimizeClicked} activeKey={activeKey} />
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
            <Button icon={<LineChartOutlined />} onClick={optimizeClicked} style={{ width: 248 }}>
              Optimize character stats
            </Button>
          </Flex>
        </Flex>

        <Segmented style={{ width: '100%', overflow: 'hidden' }} options={options} block onChange={selectionChange} value={props.selectedCharacter?.id} />
        <Flex id="previewWrapper" style={{ padding: '5px', backgroundColor: token.colorBgBase }}>
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
  setAvailableCharacters: PropTypes.func,
  selectedCharacter: PropTypes.object,
  setSelectedCharacter: PropTypes.func,
}

function Sidebar(props) {
  // Save the state of the sidebar so that new users can have it open while experiences users can close the sidebar
  const [open, setOpen] = useState(window.store.getState().savedSession[SavedSessionKeys.relicScorerSidebarOpen])

  useEffect(() => {
    window.store.getState().setSavedSessionKey(SavedSessionKeys.relicScorerSidebarOpen, open)
    setTimeout(() => SaveState.save(), 1000)
  }, [open])

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
              : <Icon component={PlusCircleFilled} style={{ fontSize: 100 }} />
            return (
              <Button
                key={key++}
                type="text"
                style={{
                  width: 107,
                  height: 107,
                  padding: 5,
                  paddingTop: 2,
                  marginLeft: -5,
                  display: props.activeKey == AppPages.RELIC_SCORER ? 'flex' : 'none',
                }}
                onClick={() => props.presetClicked(preset)}
              >
                {icon}
              </Button>
            )
          })
        }
      </Flex>
    )
  }, [props])

  return (
    <Flex
      vertical
      style={{
        position: 'relative',
        left: -125,
        top: 38,
        width: 0,
        height: 0,
      }}
      gap={5}
    >

      <Button
        type="primary"
        shape="round"
        style={{ minHeight: 100, width: 100, borderRadius: 50, marginBottom: 5 }}
        onClick={props.optimizeClicked}
      >
        <Icon component={LineChartOutlined} style={{ fontSize: 65 }} />
      </Button>

      <Dropdown
        dropdownRender={() => (dropdownDisplay)}
        open={open}
      >
        <a
          onClick={(e) => {
            e.preventDefault()
            setOpen(!open)
          }}
        >
          <Button
            type="primary"
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

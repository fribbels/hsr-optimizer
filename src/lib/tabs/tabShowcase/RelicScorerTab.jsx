import Icon, { CameraOutlined, DownloadOutlined, EditOutlined, ExperimentOutlined, ImportOutlined, SettingOutlined } from '@ant-design/icons'
import { Alert, Button, Dropdown, Flex, Form, Input, Segmented, theme, Typography } from 'antd'
import { CharacterPreview } from 'lib/characterPreview/CharacterPreview'
import { ShowcaseSource } from 'lib/characterPreview/CharacterPreviewComponents'
import { CURRENT_DATA_VERSION, officialOnly } from 'lib/constants/constants'
import { SavedSessionKeys } from 'lib/constants/constantsSession'
import { CharacterConverter } from 'lib/importer/characterConverter'
import { Message } from 'lib/interactions/message'
import CharacterModal from 'lib/overlays/modals/CharacterModal'
import { Assets } from 'lib/rendering/assets'
import DB, { AppPages, PageToRoute } from 'lib/state/db'
import { SaveState } from 'lib/state/saveState'
import { Utils } from 'lib/utils/utils'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

const { useToken } = theme
// NOTE: These strings are replaced by github actions for beta deployment, don't change
// BETA: https://9di5b7zvtb.execute-api.us-west-2.amazonaws.com/prod
export const API_ENDPOINT = 'https://9di5b7zvtb.execute-api.us-west-2.amazonaws.com/prod'

function presetCharacters() {
  const char = (name) => Object.values(DB.getMetadata().characters).find((x) => x.id == name)?.id || null
  const lc = (name) => Object.values(DB.getMetadata().lightCones).find((x) => x.id == name)?.id || null
  return [
    { characterId: char(1406), lightConeId: lc(23043) },
    { characterId: char(1409), lightConeId: lc(23042) },
    { characterId: char(1405), lightConeId: lc(23041) },
    { characterId: char(1407), lightConeId: lc(23040) },

    { characterId: char(1308), lightConeId: lc(23024), rerun: true },
    { characterId: char(1225), lightConeId: lc(23035), rerun: true },
    { characterId: char(1218), lightConeId: lc(23029), rerun: true },
    { characterId: char(1305), lightConeId: lc(23020), rerun: true },

    { custom: true },
  ].filter((x) => x.characterId != null || x.custom) // Unreleased characters
}

const { Text } = Typography

const throttleSeconds = 10

export default function RelicScorerTab() {
  const [loading, setLoading] = useState(false)
  const [availableCharacters, setAvailableCharacters] = useState([])
  const [selectedCharacter, setSelectedCharacter] = useState()
  const latestRefreshDate = useRef(null)

  const scorerId = window.store((s) => s.scorerId)
  const setScorerId = window.store((s) => s.setScorerId)

  const [scorerForm] = Form.useForm()
  window.scorerForm = scorerForm

  const { t } = useTranslation(['relicScorerTab', 'common'])

  const activeKey = window.store((s) => s.activeKey)

  useEffect(() => {
    if (activeKey != AppPages.SHOWCASE) return

    const params = window.location.href.split('?')[1]
    if (params) {
      const id = params.split('id=')[1].split('&')[0]
      onFinish({ scorerId: id })
    }
  }, [activeKey])

  useEffect(() => {
    if (availableCharacters.length && scorerId && activeKey == AppPages.SHOWCASE) {
      window.history.replaceState({ id: scorerId }, `profile: ${scorerId}`, PageToRoute[AppPages.SHOWCASE] + `?id=${scorerId}`)
    }
  }, [activeKey])

  if (activeKey != AppPages.SHOWCASE && availableCharacters.length == 0) {
    return <></>
  }
  console.log('======================================================================= RENDER RelicScorerTab')

  function onFinish(x) {
    console.log('finish', x)

    const id = x?.scorerId?.toString().trim() || ''

    if (!id || id.length != 9) {
      setLoading(false)
      Message.error(t('Messages.InvalidIdWarning')/* Invalid ID */)
      return
    }

    if (latestRefreshDate.current) {
      Message.warning(t('Messages.ThrottleWarning'/* Please wait {{seconds}} seconds before retrying */, { seconds: Math.max(1, Math.ceil(throttleSeconds - (new Date() - latestRefreshDate.current) / 1000)) }))
      if (loading) {
        setLoading(false)
      }
      return
    } else {
      setLoading(true)
      latestRefreshDate.current = new Date()
      setTimeout(() => {
        latestRefreshDate.current = null
      }, throttleSeconds * 1000)
    }

    setScorerId(id)
    SaveState.delayedSave()

    window.history.replaceState({ id: id }, `profile: ${id}`, PageToRoute[AppPages.SHOWCASE] + `?id=${id}`)

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
          ].filter((x) => !!x)
        } else if (data.source == 'mihomo') {
          characters = data.characters.filter((x) => !!x)
          for (const character of characters) {
            character.relicList = character.relics || []
            character.equipment = character.light_cone
            character.avatarId = character.id

            if (character.equipment) {
              character.equipment.tid = character.equipment.id
            }

            for (const relic of character.relicList) {
              relic.tid = relic.id
              relic.subAffixList = relic.sub_affix
            }
          }
        } else {
          if (!data.detailInfo) {
            setLoading(false)
            Message.error(t('Messages.IdLoadError')/* Error loading ID */)
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

        // Filter by unique id
        const converted = characters.map((x) => CharacterConverter.convert(x)).filter((value, index, self) => self.map((x) => x.id).indexOf(value.id) == index)
        for (let i = 0; i < converted.length; i++) {
          converted[i].index = i
        }
        setAvailableCharacters(converted)
        if (converted.length) {
          setSelectedCharacter(converted[0])
        }
        setLoading(false)
        Message.success(t('Messages.SuccessMsg')/* Successfully loaded profile */)
        scorerForm.setFieldValue('scorerId', id)
      })
      .catch((error) => {
        setTimeout(() => {
          Message.warning(t('Messages.LookupError')/* Error during lookup, please try again in a bit */)
          console.error('Fetch error:', error)
          setLoading(false)
        }, Math.max(0, throttleSeconds * 1000 - (new Date() - latestRefreshDate.current)))
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
      <Flex vertical gap={0} align='center'>
        {/* <Flex gap={10} vertical align='center'> */}
        {/*  <Text><h3 style={{ color: '#ffaa4f' }}>{t('Header.DowntimeWarning', { game_version: 3.2 })}</h3></Text> */}
        {/* </Flex> */}

        <Flex gap={10} vertical align='center'>
          <Text>
            {officialOnly
              ? t('Header.WithoutVersion')
              : t('Header.WithVersion', { beta_version: CURRENT_DATA_VERSION })}
            {
              /*
               "WithVersion": "Enter your account UID to score your profile character at level 80 & maxed traces. Log out to refresh instantly. (Current version {{beta_version}} )",
               "WithoutVersion": "Enter your account UID to score your profile character at level 80 & maxed traces. Log out to refresh instantly."
               */
            }
          </Text>
        </Flex>
        <Form
          form={scorerForm}
          onFinish={onFinish}
          initialValues={{ scorerId: initialId }}
        >
          <Flex style={{ margin: 10, width: 1100 }} justify='center' align='center' gap={10}>
            <Form.Item size='default' name='scorerId'>
              <Input style={{ width: 150 }} placeholder={t('SubmissionBar.Placeholder')/* Account UID */}/>
            </Form.Item>
            <Button
              type='primary'
              htmlType='submit'
              loading={loading}
              style={{ width: 150 }}
            >
              {t('common:Submit')/* Submit */}
            </Button>
            <Button
              style={{ width: 'fit-content', minWidth: 175 }}
              onClick={() => window.store.getState().setScoringModalOpen(true)}
              icon={<SettingOutlined/>}
            >
              {t('SubmissionBar.AlgorithmButton')/* Scoring algorithm */}
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
// RelicScorerTab.propTypes = {
//   active: PropTypes.bool,
// }

function CharacterPreviewSelection(props) {
  const activeKey = window.store((s) => s.activeKey)
  const { token } = useToken()

  const setScoringAlgorithmFocusCharacter = window.store((s) => s.setScoringAlgorithmFocusCharacter)

  const [isCharacterModalOpen, setCharacterModalOpen] = useState(false)
  const [characterModalInitialCharacter, setCharacterModalInitialCharacter] = useState(props.selectedCharacter)
  const [screenshotLoading, setScreenshotLoading] = useState(false)
  const [downloadLoading, setDownloadLoading] = useState(false)

  const { t } = useTranslation(['relicScorerTab', 'gameData'])

  const items = [
    {
      label: (
        <Flex gap={10}><ImportOutlined/>{t('ImportLabels.AllCharacters')/* Import all characters & all relics into optimizer */}
        </Flex>
      ),
      key: 'import characters',
    },
    {
      label: (
        <Flex gap={10}><ImportOutlined/>{t('ImportLabels.SingleCharacter')/* Import selected character & all relics into optimizer */}
        </Flex>
      ),
      key: 'import single character',
    },
  ]

  const handleMenuClicked = (e) => {
    switch (e.key) {
      case 'import characters':
        console.log('importing with characters')
        importCharactersClicked()
        break
      case 'import single character':
        console.log('importing single character')
        importCharacterClicked()
        break
      default:
        Message.error(t('Messages.UnknownButtonClicked')/* 'Unknown button clicked' */)
        break
    }
  }

  const menuProps = {
    items,
    onClick: handleMenuClicked,
  }

  // console.log('CharacterPreviewSelection', props)

  useEffect(() => {
    setScoringAlgorithmFocusCharacter(props.selectedCharacter?.id)
  }, [props.selectedCharacter?.id, setScoringAlgorithmFocusCharacter])

  const options = []
  for (let i = 0; i < props.availableCharacters.length; i++) {
    const availableCharacter = props.availableCharacters[i]
    options.push({
      label: (
        <Flex align='center' justify='space-around'>
          <img
            style={{
              width: 100,
              height: 100,
              objectFit: 'contain',
              borderRadius: 50,
              border: '1px solid rgba(255, 255, 255, 0.2)',
              background: 'rgba(255, 255, 255, 0.05)',
            }}
            src={Assets.getCharacterAvatarById(availableCharacter.id)}
          />
        </Flex>
      ),
      value: availableCharacter.id,
      key: i,
    })
  }

  function selectionChange(selected) {
    console.log('selectionChange', selected)
    props.setSelectedCharacter(props.availableCharacters.find((x) => x.id == selected))
  }

  async function simulateClicked() {
    console.log('Simulate', props.selectedCharacter)
    setCharacterModalOpen(true)
    setCharacterModalInitialCharacter(props.selectedCharacter)
  }

  function onCharacterModalOk(form) {
    if (!form.characterId) {
      return Message.error(t('Messages.NoCharacterSelected')/* No selected character */)
    }
    if (props.availableCharacters.find((x) => x.id == form.characterId) && props.selectedCharacter.id != form.characterId) {
      return Message.error(t('Messages.CharacterAlreadyExists')/* Selected character already exists */)
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
    DB.mergePartialRelicsWithState(newRelics)
    SaveState.delayedSave()
  }

  function importCharactersClicked() {
    for (const character of props.availableCharacters) {
      DB.addFromForm(character.form, false)
    }

    const newRelics = props.availableCharacters
      .flatMap((x) => Object.values(x.equipped))
      .filter((x) => !!x)

    console.log('importCharactersClicked', props.availableCharacters, newRelics)
    DB.mergePartialRelicsWithState(newRelics, props.availableCharacters)
    SaveState.delayedSave()
  }

  function importCharacterClicked() {
    DB.addFromForm(props.selectedCharacter.form, false)

    const newRelics = props.availableCharacters
      .flatMap((x) => Object.values(x.equipped))
      .filter((x) => !!x)
    console.log('importCharacterClicked', props.selectedCharacter, newRelics)
    DB.mergePartialRelicsWithState(newRelics, [props.selectedCharacter])
    SaveState.delayedSave()
  }

  async function clipboardClicked() {
    setScreenshotLoading(true)
    // Use a small timeout here so the spinner doesn't lag while the image is being generated
    setTimeout(() => {
      Utils.screenshotElementById('relicScorerPreview', 'clipboard').finally(() => {
        setScreenshotLoading(false)
      })
    }, 100)
  }

  async function downloadClicked() {
    setDownloadLoading(true)
    // Use a small timeout here so the spinner doesn't lag while the image is being generated
    setTimeout(() => {
      const name = props.selectedCharacter ? t(`gameData:Characters.${props.selectedCharacter.id}.Name`) : null
      Utils.screenshotElementById('relicScorerPreview', 'download', name).finally(() => {
        setDownloadLoading(false)
      })
    }, 100)
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

  return (
    <Flex style={{ width: 1375 }} justify='space-around'>
      <Flex vertical align='center' gap={5} style={{ marginBottom: 100, width: 1068 }}>
        <Flex vertical style={{ display: (props.availableCharacters.length > 0) ? 'flex' : 'none', width: '100%' }}>
          <Sidebar presetClicked={presetClicked} activeKey={activeKey}/>

          <Flex
            style={{ display: (props.availableCharacters.length > 0) ? 'flex' : 'none', marginBottom: 5 }}
            justify='space-between'
            gap={10}
          >
            <Button
              style={{ flex: 1 }}
              onClick={clipboardClicked}
              icon={<CameraOutlined/>}
              loading={screenshotLoading}
              type='primary'
            >
              {t('CopyScreenshot')/* Copy screenshot */}
            </Button>
            <Button
              style={{ width: 50 }}
              icon={<DownloadOutlined/>}
              onClick={downloadClicked}
              loading={downloadLoading}
            />
            <Dropdown.Button
              style={{ flex: 1 }}
              className='dropdownButton'
              onClick={importClicked}
              menu={menuProps}
            >
              <ImportOutlined/>
              {t('ImportLabels.Relics')/* Import relics into optimizer */}
            </Dropdown.Button>
            <Button
              style={{ flex: 1 }}
              icon={<ExperimentOutlined/>}
              onClick={simulateClicked}
            >
              {t('SimulateRelics')/* Simulate relics on another character */}
            </Button>
          </Flex>
        </Flex>


        {props?.availableCharacters?.length > 0 && (
          <Alert
            message={<>Note: Combo DMG is used to compare different relics within the context of the selected team, and should <u>NOT</u> be used to compare different teams!</>}
            type='info'
            showIcon
            style={{ marginBottom: 5, width: '100%' }}
          />
        )}

        <Segmented
          style={{ width: '100%', overflow: 'hidden' }}
          options={options}
          block
          onChange={selectionChange}
          value={props.selectedCharacter?.id}
        />

        <div id='previewWrapper' style={{ padding: '5px' }}>
          <CharacterPreview
            class='relicScorerCharacterPreview'
            character={props.selectedCharacter}
            source={ShowcaseSource.SHOWCASE_TAB}
            id='relicScorerPreview'
            setOriginalCharacterModalOpen={setCharacterModalOpen}
            setOriginalCharacterModalInitialCharacter={setCharacterModalInitialCharacter}
          />
        </div>

        <CharacterModal
          onOk={onCharacterModalOk}
          open={isCharacterModalOpen}
          setOpen={setCharacterModalOpen}
          initialCharacter={characterModalInitialCharacter}
        />
      </Flex>
    </Flex>
  )
}

// CharacterPreviewSelection.propTypes = {
//   availableCharacters: PropTypes.array,
//   setAvailableCharacters: PropTypes.func,
//   selectedCharacter: PropTypes.object,
//   setSelectedCharacter: PropTypes.func,
// }

function PresetButton(props) {
  const { preset } = props

  if (preset.rerun) {
    return (
      <img
        src={Assets.getCharacterAvatarById(preset.characterId)}
        style={{
          height: RERUN_PRESET_SIZE,
          width: RERUN_PRESET_SIZE,
          borderRadius: RERUN_PRESET_SIZE,
          outline: '1px solid rgba(255, 255, 255, 0.2)',
          background: 'rgba(255, 255, 255, 0.05)',
        }}
      />
    )
  }

  return (
    <img
      src={Assets.getCharacterAvatarById(preset.characterId)}
      style={{
        height: PRESET_SIZE,
        width: PRESET_SIZE,
        borderRadius: PRESET_SIZE,
        outline: '1px solid rgba(255, 255, 255, 0.2)',
        background: 'rgba(255, 255, 255, 0.05)',
      }}
    />
  )
}

const RERUN_PRESET_SIZE = 45
const PRESET_SIZE = 95

function Sidebar(props) {
  // Save the state of the sidebar so that new users can have it open while experiences users can close the sidebar
  const [open, setOpen] = useState(window.store.getState().savedSession[SavedSessionKeys.relicScorerSidebarOpen])

  useEffect(() => {
    window.store.getState().setSavedSessionKey(SavedSessionKeys.relicScorerSidebarOpen, open)
    SaveState.delayedSave()
  }, [open])

  const dropdownDisplay = useMemo(() => {
    let key = 0
    return (
      <Flex
        vertical
        gap={3}
        justify='center'
        style={{
          marginLeft: -8,
          width: 110,
          flexDirection: 'row',
          flexWrap: 'wrap',
        }}
      >
        {
          presetCharacters().map((preset) => {
            const icon = !preset.custom
              ? <PresetButton preset={preset}/>
              : <Icon component={EditOutlined} style={{ fontSize: 85 }}/>
            return (
              <Button
                key={key++}
                type='text'
                style={{
                  width: preset.rerun ? RERUN_PRESET_SIZE + 2 : PRESET_SIZE + 8,
                  height: preset.rerun ? RERUN_PRESET_SIZE + 2 : PRESET_SIZE + 8,
                  paddingTop: 2,
                  display: props.activeKey == AppPages.SHOWCASE ? 'flex' : 'none',
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
        left: -120,
        // top: 40,
        top: 95, // With announcement banner
        width: 0,
        height: 0,
      }}
    >
      <Dropdown
        zIndexPopup={10}
        dropdownRender={() => (dropdownDisplay)}
        open={open}
        style={{}}
      >
        <a
          onClick={(e) => {
            e.preventDefault()
            setOpen(!open)
          }}
        >
          <Button
            type='primary'
            shape='round'
            style={{ height: PRESET_SIZE, width: PRESET_SIZE, borderRadius: PRESET_SIZE, marginBottom: 2 }}
          >
            <Icon component={ExperimentOutlined} style={{ fontSize: 55 }}/>
          </Button>
        </a>
      </Dropdown>
    </Flex>
  )
}

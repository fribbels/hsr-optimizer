import React, { useCallback, useMemo, useRef, useState } from 'react'

import { Button, Dropdown, Flex, Image, Modal, theme, Typography } from 'antd'
import { AgGridReact } from 'ag-grid-react'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-balham.css'
import DB, { AppPages } from 'lib/db'
import { RelicScorer } from 'lib/relicScorer'
import { CharacterPreview } from './CharacterPreview'
import { Assets } from 'lib/assets'
import { SaveState } from 'lib/saveState'
import { Message } from 'lib/message'
import PropTypes from 'prop-types'
import { useSubscribe } from 'hooks/useSubscribe'
import { CameraOutlined, DownloadOutlined, DownOutlined, ExclamationCircleOutlined, UserOutlined } from '@ant-design/icons'
import CharacterModal from './CharacterModal'
import { Utils } from 'lib/utils'
import NameBuild from 'components/SaveBuildModal'
import BuildsModal from './BuildsModal'
import { arrowKeyGridNavigation } from 'lib/arrowKeyGridNavigation'
import { OptimizerTabController } from 'lib/optimizerTabController'
import SwitchRelicsModal from './SwitchRelicsModal'
import { getGridTheme } from 'lib/theme'

const { useToken } = theme
const { Text } = Typography

function cellImageRenderer(params) {
  const data = params.data
  const characterIconSrc = Assets.getCharacterAvatarById(data.id)

  return (
    <Image
      preview={false}
      width={50}
      src={characterIconSrc}
      style={{ flex: '0 0 auto', maxWidth: '100%', minWidth: 50 }}
    />
  )
}

function cellRankRenderer(params) {
  const data = params.data
  const character = DB.getCharacters().find((x) => x.id == data.id)

  return (
    <Text style={{ height: '100%' }}>
      {character.rank + 1}
    </Text>
  )
}

function cellNameRenderer(params) {
  const data = params.data
  const characterMetadata = DB.getMetadata().characters[data.id]
  const characterName = characterMetadata.displayName

  const equippedNumber = data.equipped ? Object.values(data.equipped).filter((x) => x != undefined).length : 0
  // console.log('CellRenderer', equippedNumber, data, characterMetadata)
  let color = '#81d47e'
  if (equippedNumber < 6) color = 'rgb(229, 135, 66)'
  if (equippedNumber < 1) color = '#d72f2f'

  return (
    <Flex align="center" justify="flex-start" style={{ height: '100%', width: '100%' }}>
      <Text style={{
        margin: 'auto',
        padding: '0px 5px',
        textAlign: 'center',
        overflow: 'hidden',
        whiteSpace: 'break-spaces',
        textWrap: 'wrap',
        fontSize: 14,
        width: '100%',
        lineHeight: '18px',
      }}
      >
        {characterName}
      </Text>
      <Flex style={{ display: 'block', width: 3, height: '100%', backgroundColor: color, zIndex: 2 }}>

      </Flex>
    </Flex>
  )
}

const items = [
  {
    key: 'character group',
    type: 'group',
    label: 'Character',
    children: [
      {
        label: 'Add new character',
        key: 'add',
      },
      {
        label: 'Edit character',
        key: 'edit',
      },
      {
        label: 'Switch relics with',
        key: 'switchRelics',
      },
      {
        label: 'Unequip character',
        key: 'unequip',
      },
      {
        label: 'Delete character',
        key: 'delete',
      },
    ],
  },
  {
    key: 'builds group',
    type: 'group',
    label: 'Builds',
    children: [
      {
        label: 'Save build',
        key: 'saveBuild',
      },
      {
        label: 'View saved builds',
        key: 'viewBuilds',
      },
    ],
  },
  {
    key: 'scoring group',
    type: 'group',
    label: 'Scoring',
    children: [
      {
        label: 'Scoring algorithm',
        key: 'scoring',
      },
    ],
  },
  {
    key: 'priority group',
    type: 'group',
    label: 'Priority',
    children: [
      {
        label: 'Sort all characters by score',
        key: 'sortByScore',
      },
      {
        label: 'Move character to top',
        key: 'moveToTop',
      },
    ],
  },
]

export default function CharacterTab() {
  const { token } = useToken()

  const [confirmationModal, contextHolder] = Modal.useModal()
  const [screenshotLoading, setScreenshotLoading] = useState(false)
  const [downloadLoading, setDownloadLoading] = useState(false)

  const [isCharacterModalOpen, setCharacterModalOpen] = useState(false)
  const [isSwitchRelicsModalOpen, setSwitchRelicsModalOpen] = useState(false)
  const [isSaveBuildModalOpen, setIsSaveBuildModalOpen] = useState(false)
  const [isBuildsModalOpen, setIsBuildsModalOpen] = useState(false)
  const [characterModalInitialCharacter, setCharacterModalInitialCharacter] = useState()

  console.log('CharacterTab')

  useSubscribe('refreshRelicsScore', () => {
    // TODO: understand why setTimeout is needed and refactor
    setTimeout(() => {
      window.forceCharacterTabUpdate()
    }, 100)
  })

  const characterGrid = useRef() // Optional - for accessing Grid's API
  window.characterGrid = characterGrid

  const [characterRows, setCharacterRows] = React.useState(DB.getCharacters())
  window.setCharacterRows = setCharacterRows

  const characterTabFocusCharacter = window.store((s) => s.characterTabFocusCharacter)
  const setCharacterTabFocusCharacter = window.store((s) => s.setCharacterTabFocusCharacter)
  const setScoringAlgorithmFocusCharacter = window.store((s) => s.setScoringAlgorithmFocusCharacter)
  const charactersById = window.store((s) => s.charactersById)
  const selectedCharacter = charactersById[characterTabFocusCharacter]

  const [, forceUpdate] = React.useReducer((o) => !o)
  window.forceCharacterTabUpdate = () => {
    console.log('__________ CharacterTab forceCharacterTabUpdate')
    forceUpdate()

    // no charGrid in scorer tab
    if (characterGrid?.current?.api?.redrawRows) {
      characterGrid.current.api.redrawRows()
    } else {
      console.log('@forceCharacterTabUpdate: No characterGrid.current.api')
    }
  }

  const columnDefs = useMemo(() => [
    { field: '', headerName: 'Icon', cellRenderer: cellImageRenderer, width: 52 },
    { field: '', headerName: 'Priority', cellRenderer: cellRankRenderer, width: 50, rowDrag: true },
    { field: '', headerName: 'Character', flex: 1, cellRenderer: cellNameRenderer },
  ], [])

  const gridOptions = useMemo(() => ({
    rowHeight: 50,
    rowSelection: 'single',
    rowDragManaged: true,
    animateRows: true,
    suppressDragLeaveHidesColumns: true,
    suppressScrollOnNewData: true,
  }), [])

  const defaultColDef = useMemo(() => ({
    sortable: false,
    cellStyle: { display: 'flex' },
  }), [])

  const cellClickedListener = useCallback((event) => {
    const data = event.data

    // Only blur if different character
    setCharacterTabFocusCharacter(data.id)
    console.log(`@CharacterTab::setCharacterTabFocusCharacter - [${data.id}]`, event.data)
  }, [setCharacterTabFocusCharacter])

  // TODO: implement routing to handle this
  const setActiveKey = window.store((s) => s.setActiveKey)

  const cellDoubleClickedListener = useCallback((e) => {
    setActiveKey(AppPages.OPTIMIZER)
    OptimizerTabController.setCharacter(e.data.id)
    console.log(`@CharacterTab.cellDoubleClickedListener::setOptimizerTabFocusCharacter - focus [${e.data.id}]`, e.data)
  }, [])

  const navigateToNextCell = useCallback((params) => {
    return arrowKeyGridNavigation(params, characterGrid, (selectedNode) => cellClickedListener(selectedNode))
  }, [])

  function drag(event, index) {
    const dragged = event.node.data
    DB.insertCharacter(dragged.id, index)
    SaveState.save()
    characterGrid.current.api.redrawRows()
  }

  const onRowDragEnd = useCallback((event) => {
    drag(event, event.overIndex)
  }, [])

  // The grid can do weird things when you drag rows beyond its bounds, cap the behavior
  const onRowDragLeave = useCallback((event) => {
    if (event.overIndex == 0) {
      drag(event, 0)
    } else if (event.overIndex == -1 && event.vDirection == 'down') {
      drag(event, DB.getCharacters().length)
    } else if (event.overIndex == -1 && event.vDirection == 'up') {
      drag(event, 0)
    } else {
      drag(event, event.overIndex)
    }
  }, [])

  function removeClicked() {
    const selectedNodes = characterGrid.current.api.getSelectedNodes()
    if (!selectedNodes || selectedNodes.length == 0) {
      return
    }

    const row = selectedNodes[0].data
    const id = row.id

    DB.removeCharacter(id)
    setCharacterRows(DB.getCharacters())
    setCharacterTabFocusCharacter(undefined)
    if (window.relicsGrid?.current?.api) {
      window.relicsGrid.current.api.redrawRows()
    }

    SaveState.save()

    Message.success('Successfully removed character')
  }

  function unequipClicked() {
    console.log('unequipClicked', DB.getCharacterById(characterTabFocusCharacter))

    const selectedNodes = characterGrid.current.api.getSelectedNodes()
    if (!selectedNodes || selectedNodes.length == 0) {
      return
    }
    const row = selectedNodes[0].data
    const id = row.id

    DB.unequipCharacter(id)

    characterGrid.current.api.redrawRows()
    window.forceCharacterTabUpdate()
    Message.success('Successfully unequipped character')
    window.relicsGrid.current.api.redrawRows()

    SaveState.save()
  }

  // Reuse the same modal for both edit/add and scroll to the selected character
  function onCharacterModalOk(form) {
    if (!form.characterId) {
      return Message.error('No selected character')
    }

    const character = DB.addFromForm(form)
    window.characterGrid.current.api.ensureIndexVisible(character.rank)
  }

  function onSwitchRelicsModalOk(switchToCharacter) {
    if (!switchToCharacter) {
      return Message.error('No selected character')
    }

    DB.switchRelics(selectedCharacter.id, switchToCharacter.value)
    SaveState.save()

    characterGrid.current.api.redrawRows()
    window.forceCharacterTabUpdate()
    Message.success(`Successfully switched relics to ${switchToCharacter.title}`)
    window.relicsGrid.current.api.redrawRows()
  }

  function scoringAlgorithmClicked() {
    setScoringAlgorithmFocusCharacter(characterTabFocusCharacter)
    window.setIsScoringModalOpen(true)
  }

  function moveToTopClicked() {
    DB.insertCharacter(characterTabFocusCharacter, 0)
    DB.refreshCharacters()
    SaveState.save()
  }

  async function sortByScoreClicked() {
    if (!await confirm(<>
      Are you sure you want to sort all characters? <br />
      You will lose any custom rankings you have set.
    </>)) {
      return
    }

    const characterList = DB.getCharacters()

    const scoredCharacters = characterList
      .map((x) => ({ score: RelicScorer.scoreCharacter(x), character: x }))
      .sort((a, b) => b.score.totalScore - a.score.totalScore)
      .map((x) => x.character)

    DB.setCharacters(scoredCharacters)
    DB.refreshCharacters()
    SaveState.save()
  }

  function clipboardClicked() {
    setScreenshotLoading(true)
    // Use a small timeout here so the spinner doesn't lag while the image is being generated
    setTimeout(() => {
      Utils.screenshotElementById('characterTabPreview', 'clipboard').finally(() => {
        setScreenshotLoading(false)
      })
    }, 50)
  }

  function downloadClicked() {
    setDownloadLoading(true)
    // Use a small timeout here so the spinner doesn't lag while the image is being generated
    setTimeout(() => {
      const name = selectedCharacter ? DB.getMetadata().characters[selectedCharacter.id].displayName : null
      Utils.screenshotElementById('characterTabPreview', 'download', name).finally(() => {
        setDownloadLoading(false)
      })
    }, 50)
  }

  function confirmSaveBuild(name) {
    const score = RelicScorer.scoreCharacter(selectedCharacter)
    const res = DB.saveCharacterBuild(name, selectedCharacter.id, {
      score: score.totalScore.toFixed(0),
      rating: score.totalRating,
    })
    if (res) {
      Message.error(res.error)
      return
    }
    Message.success('Successfully saved build: ' + name)
    SaveState.save()
    setIsSaveBuildModalOpen(false)
  }

  const handleActionsMenuClick = async (e) => {
    if (!selectedCharacter && e.key != 'add' && e.key != 'scoring' && e.key != 'sortByScore') {
      Message.error('No selected character')
      return
    }

    switch (e.key) {
      case 'add':
        setCharacterModalInitialCharacter(null)
        setCharacterModalOpen(true)
        break
      case 'edit':
        setCharacterModalInitialCharacter(selectedCharacter)
        setCharacterModalOpen(true)
        break
      case 'switchRelics':
        setSwitchRelicsModalOpen(true)
        break
      case 'unequip':
        if (!await confirm(`Are you sure you want to unequip ${Utils.getCharacterNameById(selectedCharacter.id)}?`)) return
        unequipClicked()
        break
      case 'delete':
        if (!await confirm(`Are you sure you want to delete ${Utils.getCharacterNameById(selectedCharacter.id)}?`)) return
        removeClicked()
        break
      case 'saveBuild':
        setIsSaveBuildModalOpen(true)
        break
      case 'viewBuilds':
        setIsBuildsModalOpen(true)
        break
      case 'scoring':
        scoringAlgorithmClicked()
        break
      case 'moveToTop':
        moveToTopClicked()
        break
      case 'sortByScore':
        sortByScoreClicked()
        break
      default:
        console.error(`Unknown key ${e.key} in handleActionsMenuClick`)
    }
  }

  const actionsMenuProps = {
    items,
    onClick: handleActionsMenuClick,
  }

  async function confirm(content) {
    return confirmationModal.confirm({
      title: 'Confirm',
      icon: <ExclamationCircleOutlined />,
      content: content,
      okText: 'Confirm',
      cancelText: 'Cancel',
      centered: true,
    })
  }

  const defaultGap = 8
  const parentH = 280 * 3 + defaultGap * 2

  return (
    <Flex
      vertical
      style={{
        height: '100%',
        marginBottom: 200,
      }}
    >
      <Flex style={{ height: '100%' }}>
        <Flex vertical gap={8} style={{ marginRight: 8 }}>
          <div
            id="characterGrid" className="ag-theme-balham-dark" style={{
              ...{ display: 'block', width: 230, height: parentH - 76 },
              ...getGridTheme(token),
            }}
          >
            <AgGridReact
              ref={characterGrid}

              rowData={characterRows}
              gridOptions={gridOptions}
              getRowNodeId={(data) => data.id}

              columnDefs={columnDefs}
              defaultColDef={defaultColDef}
              deltaRowDataMode={true}

              headerHeight={24}

              onCellClicked={cellClickedListener}
              onCellDoubleClicked={cellDoubleClickedListener}
              onRowDragEnd={onRowDragEnd}
              onRowDragLeave={onRowDragLeave}
              navigateToNextCell={navigateToNextCell}
            />
          </div>
          <Flex vertical gap={8}>
            <Flex justify="space-between" gap={8}>
              <Dropdown
                placement="topLeft"
                menu={actionsMenuProps}
                trigger={['hover']}
              >
                <Button style={{ width: '100%' }} icon={<UserOutlined />}>
                  Character actions
                  <DownOutlined />
                </Button>
              </Dropdown>
            </Flex>
            <Flex gap={8}>
              <Button
                style={{ flex: 'auto' }} icon={<CameraOutlined />} onClick={clipboardClicked}
                type="primary"
                loading={screenshotLoading}
              >
                Copy screenshot
              </Button>
              <Button
                style={{ width: 40 }} type="primary" icon={<DownloadOutlined />}
                onClick={downloadClicked}
                loading={downloadLoading}
              />
            </Flex>
          </Flex>
        </Flex>
        <Flex vertical>
          <CharacterPreview
            id="characterTabPreview"
            character={selectedCharacter}
            setOriginalCharacterModalOpen={setCharacterModalOpen}
            setOriginalCharacterModalInitialCharacter={setCharacterModalInitialCharacter}
          />
        </Flex>

        {/* <CharacterTabDebugPanel selectedCharacter={selectedCharacter} /> */}
      </Flex>
      <CharacterModal
        onOk={onCharacterModalOk} open={isCharacterModalOpen} setOpen={setCharacterModalOpen}
        initialCharacter={characterModalInitialCharacter}
      />
      <SwitchRelicsModal
        onOk={onSwitchRelicsModalOk}
        open={isSwitchRelicsModalOpen}
        setOpen={setSwitchRelicsModalOpen}
        currentCharacter={selectedCharacter}
      />
      <NameBuild open={isSaveBuildModalOpen} setOpen={setIsSaveBuildModalOpen} onOk={confirmSaveBuild} />
      <BuildsModal
        open={isBuildsModalOpen} setOpen={setIsBuildsModalOpen} selectedCharacter={selectedCharacter}
        imgRenderer={cellImageRenderer}
      />
      {contextHolder}
    </Flex>
  )
}
CharacterTab.propTypes = {
  active: PropTypes.bool,
}

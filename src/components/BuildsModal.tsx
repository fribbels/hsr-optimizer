import * as React from 'react'
import { useEffect, useMemo } from 'react'
import { Button, Card, Flex, Modal } from 'antd'
import StatText from './characterPreview/StatText'
import { HeaderText } from './HeaderText'
import { DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons'
import DB from '../lib/db'
import { SaveState } from 'lib/saveState'
import { Message } from 'lib/message'
import { Character, SavedBuild } from 'types/Character'
import { CharacterPreview } from 'components/CharacterPreview.jsx'
import { RelicScorer } from 'lib/relicScorerPotential'
import { useTranslation } from 'react-i18next'

interface BuildsModalProps {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  selectedCharacter?: Character
}

const BuildsModal: React.FC<BuildsModalProps> = ({
                                                   open,
                                                   setOpen,
                                                   selectedCharacter,
                                                 }) => {
  const { t } = useTranslation(['modals', 'gameData'])
  const [confirmationModal, contextHolder] = Modal.useModal()
  const [selectedBuild, setSelectedBuild] = React.useState<null | number>(null)
  const characterName = t(`gameData:Characters.${selectedCharacter?.id}.Name`)

  // When opening, pick the first build if there are any + update build scores
  useEffect(() => {
    if (open && selectedCharacter?.builds?.length) {
      setSelectedBuild(0)
      updateBuildsScoringAlgo(selectedCharacter.builds)
    }
  }, [open, selectedCharacter])

  // Reuse the character preview for the saved build
  const statDisplay = useMemo(() => {
    if (selectedBuild != null && selectedCharacter?.builds?.[selectedBuild].build) {
      const relicsById = window.store.getState().relicsById
      const relics = Object.values(selectedCharacter.builds[selectedBuild].build).map((x) => relicsById[x])

      const relicObject = {}
      relics.filter((x) => !!x).map((relic) => relicObject[relic.part] = relic)

      const previewCharacter = JSON.parse(JSON.stringify(selectedCharacter))
      previewCharacter.equipped = relicObject

      console.log('Previewing builds character:', previewCharacter)
      return <CharacterPreview character={previewCharacter} source='builds' id='relicScorerPreview'/>
    }

    return <div style={{ width: 656, height: 856, border: '1px solid #354b7d' }}></div>
  }, [selectedBuild, selectedCharacter])

  if (!selectedCharacter?.builds?.length) {
    return (
      <Modal
        open={open}
        width={300}
        destroyOnClose
        onOk={() => setOpen(false)}
        onCancel={() => setOpen(false)}
        centered
        okText={t('Builds.NoBuilds.Ok')/* Ok */}
        cancelText={t('Builds.NoBuilds.Cancel')/* Cancel */}
      >
        {t('Builds.NoBuilds.NoneSaved')/* No saved builds */}
        {contextHolder}
      </Modal>
    )
  }

  async function confirm(content) {
    return confirmationModal.confirm({
      title: t('Builds.ConfirmModal.Title')/* Confirm */,
      icon: <ExclamationCircleOutlined/>,
      content: content,
      okText: t('Builds.ConfirmModal.ConfirmButton')/* Confirm */,
      cancelText: t('Builds.ConfirmModal.CancelButton')/* Cancel */,
      centered: true,
    })
  }

  // Updates all saved builds with the latest scoring algorithm
  function updateBuildsScoringAlgo(builds: SavedBuild[]) {
    for (const b of builds) {
      const relicsById = window.store.getState().relicsById
      const relics = Object.values(b.build).map((x) => relicsById[x])
      const score = RelicScorer.scoreCharacterWithRelics(selectedCharacter, relics)
      b.score = { score: Math.round(score.totalScore ?? 0), rating: score.totalRating ?? 'N/A' }
    }
  }

  function onModalOk() {
    setOpen(false)
  }

  const handleCancel = () => {
    setSelectedBuild(null)
    setOpen(false)
  }

  const handleDeleteAllBuilds = async () => {
    const result = await confirm(t('Builds.ConfirmDelete.DeleteAll')/* Are you sure you want to delete all builds? */)
    if (result) {
      setSelectedBuild(null)
      DB.clearCharacterBuilds(selectedCharacter?.id)
      window.forceCharacterTabUpdate()
      SaveState.delayedSave()
      Message.success(t('Builds.ConfirmDelete.SuccessMessageAll', { characterName: characterName })/* Successfully deleted all builds for {{characterName}} */)
      setOpen(false)
    }
  }

  const handleDeleteSingleBuild = async (name: string) => {
    const result = await confirm(t('Builds.ConfirmDelete.DeleteSingle', { name: name })/* Are you sure you want to delete {{name}}? */)
    if (result) {
      setSelectedBuild(null)
      DB.deleteCharacterBuild(selectedCharacter?.id, name)
      window.forceCharacterTabUpdate()
      SaveState.delayedSave()
      Message.success(t('Builds.ConfirmDelete.SuccessMessageSingle', { name: name })/* Successfully deleted build: {{name}} */)

      if (selectedCharacter?.Builds.length == 0) {
        setOpen(false)
      }
    }
  }

  const handleEquip = async (build: SavedBuild) => {
    const result = await confirm(t('Builds.ConfirmEquip.Content')/* Equipping this will unequip characters that use the relics in this build */)
    if (result) {
      DB.equipRelicIdsToCharacter(
        Object.values(build.build),
        selectedCharacter?.id,
      )
      window.forceCharacterTabUpdate()
      SaveState.delayedSave()
      Message.success(t('Builds.ConfirmEquip.SuccessMessage', { buildName: build.name })/* Successfully equipped build: {{buildName}} */)
      handleCancel()
    }
  }

  return (
    <Modal
      open={open}
      width={1115}
      destroyOnClose
      centered
      onOk={onModalOk}
      onCancel={handleCancel}
      footer={[
        <Button key='delete' onClick={() => handleDeleteAllBuilds()}>
          {t('Builds.DeleteAll')/* Delete All */}
        </Button>,
        <Button key='back' onClick={handleCancel}>
          {t('Builds.Cancel')/* Cancel */}
        </Button>,
      ]}
    >
      <Flex gap={10}>
        {selectedCharacter && (
          <>
            <Flex
              vertical
              style={{
                overflowY: 'auto',
                marginBottom: 20,
                minWidth: 400,
                maxWidth: 400,
                height: 840,
              }}
              gap={8}
            >
              {selectedCharacter.builds?.map((build, index) => (
                <Card
                  style={{
                    backgroundColor: selectedBuild === index ? '#001529' : undefined,
                    cursor: 'pointer',
                  }}
                  onClick={(e) => {
                    const isButtonClicked = (e.target as HTMLElement).closest('button') !== null
                    if (!isButtonClicked) {
                      setSelectedBuild(index)
                    }
                  }}
                  key={index}
                  hoverable
                >

                  <Flex justify='space-between' gap={8} align='center'>
                    <Flex vertical align='flex-start'>
                      <HeaderText style={{ flex: 1, fontSize: 16, fontWeight: 600 }}>{build.name}</HeaderText>
                      <StatText
                        style={{
                          fontSize: 14,
                          fontWeight: 400,
                          textAlign: 'center',
                        }}
                      >
                        {`${t('Builds.Score')/* Score */}: ${build.score.score} ${build.score.score == 0
                          ? ''
                          : '(' + build.score.rating + ')'
                        }`}
                      </StatText>
                    </Flex>
                    <Flex gap={5}>
                      <Button
                        onClick={() => {
                          handleEquip(build)
                        }}
                      >
                        {t('Builds.Equip')/* Equip */}
                      </Button>
                      <Button
                        style={{ width: 35 }}
                        type='primary'
                        icon={<DeleteOutlined/>}
                        onClick={() => {
                          handleDeleteSingleBuild(build.name)
                        }}
                      />
                    </Flex>
                  </Flex>
                </Card>
              ))}
            </Flex>
          </>
        )}

        {contextHolder}
        {statDisplay}
      </Flex>
    </Modal>
  )
}

export default BuildsModal

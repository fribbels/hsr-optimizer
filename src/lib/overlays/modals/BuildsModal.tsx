import {
  DeleteOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons'
import {
  Button,
  Card,
  Flex,
  Modal,
} from 'antd'
import { CharacterPreview } from 'lib/characterPreview/CharacterPreview'
import { ShowcaseSource } from 'lib/characterPreview/CharacterPreviewComponents'
import { Parts } from 'lib/constants/constants'
import {
  OpenCloseIDs,
  useOpenClose,
} from 'lib/hooks/useOpenClose'
import { Message } from 'lib/interactions/message'
import { RelicScorer } from 'lib/relics/relicScorerPotential'
import DB from 'lib/state/db'
import { SaveState } from 'lib/state/saveState'
import { useCharacterTabStore } from 'lib/tabs/tabCharacters/useCharacterTabStore'
import { HeaderText } from 'lib/ui/HeaderText'
import { ArrayFilters } from 'lib/utils/arrayUtils'
import { TsUtils } from 'lib/utils/TsUtils'
import {
  ReactNode,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { useTranslation } from 'react-i18next'
import { SavedBuild } from 'types/character'
import { Relic } from 'types/relic'

// FIXME LOW

export function BuildsModal() {
  const { t } = useTranslation(['modals', 'gameData', 'common'])
  const [confirmationModal, contextHolder] = Modal.useModal()
  const [selectedBuild, setSelectedBuild] = useState<null | number>(null)
  const { isOpen, close } = useOpenClose(OpenCloseIDs.BUILDS_MODAL)

  const selectedCharacter = useCharacterTabStore((s) => s.selectedCharacter)

  // When opening, pick the first build if there are any + update build scores
  useEffect(() => {
    if (isOpen && selectedCharacter?.builds?.length) {
      setSelectedBuild(0)
      updateBuildsScoringAlgo(selectedCharacter.builds)
    }
  }, [isOpen, selectedCharacter])

  // Reuse the character preview for the saved build
  const statDisplay = useMemo(() => {
    if (selectedBuild != null && selectedCharacter?.builds?.[selectedBuild].build) {
      const relicsById = window.store.getState().relicsById
      const relics = Object.values(selectedCharacter.builds[selectedBuild].build).map((x) => relicsById[x])

      const relicObject = relics
        .filter((x) => !!x)
        .reduce((acc, cur) => {
          acc[cur.part] = cur.id
          return acc
        }, {} as Record<Parts, Relic['id']>)

      const previewCharacter = TsUtils.clone(selectedCharacter)
      previewCharacter.equipped = relicObject

      console.log('Previewing builds character:', previewCharacter)
      // @ts-expect-error we don't need the character modal to be accessible from here
      return <CharacterPreview character={previewCharacter} source={ShowcaseSource.BUILDS_MODAL} id='relicScorerPreview' />
    }

    return <div style={{ width: 656, height: 856, border: '1px solid #354b7d' }}></div>
  }, [selectedBuild, selectedCharacter])

  if (!selectedCharacter?.builds?.length) {
    return (
      <Modal
        open={isOpen}
        width={300}
        destroyOnClose
        onOk={close}
        onCancel={close}
        centered
        okText={t('common:Ok') /* Ok */}
        cancelText={t('common:Cancel') /* Cancel */}
      >
        {t('Builds.NoBuilds.NoneSaved') /* No saved builds */}
        {contextHolder}
      </Modal>
    )
  }

  async function confirm(content: ReactNode) {
    return confirmationModal.confirm({
      title: t('common:Confirm'), /* Confirm */
      icon: <ExclamationCircleOutlined />,
      content: content,
      okText: t('common:Confirm'), /* Confirm */
      cancelText: t('common:Cancel'), /* Cancel */
      centered: true,
    })
  }

  // Updates all saved builds with the latest scoring algorithm
  function updateBuildsScoringAlgo(builds: SavedBuild[]) {
    for (const b of builds) {
      const relics = Object.values(b.build).map(DB.getRelicById)
      const score = RelicScorer.scoreCharacterWithRelics(selectedCharacter!, relics)
      b.score = { score: Math.round(score.totalScore ?? 0).toString(), rating: score.totalRating ?? 'N/A' }
    }
  }

  function onModalOk() {
    close()
  }

  const handleCancel = () => {
    setSelectedBuild(null)
    close()
  }

  const handleDeleteAllBuilds = async () => {
    const characterName = t(`gameData:Characters.${selectedCharacter.id}.Name`)
    const result = await confirm(t('Builds.ConfirmDelete.DeleteAll') /* Are you sure you want to delete all builds? */)
    if (result) {
      setSelectedBuild(null)
      DB.clearCharacterBuilds(selectedCharacter?.id)
      SaveState.delayedSave()
      Message.success(t('Builds.ConfirmDelete.SuccessMessageAll', { characterName: characterName }) /* Successfully deleted all builds for {{characterName}} */)
      close()
    }
  }

  const handleDeleteSingleBuild = async (name: string) => {
    const result = await confirm(t('Builds.ConfirmDelete.DeleteSingle', { name: name }) /* Are you sure you want to delete {{name}}? */)
    if (result) {
      setSelectedBuild(null)
      DB.deleteCharacterBuild(selectedCharacter?.id, name)
      SaveState.delayedSave()
      Message.success(t('Builds.ConfirmDelete.SuccessMessageSingle', { name: name }) /* Successfully deleted build: {{name}} */)

      if (selectedCharacter?.builds.length == 0) {
        close()
      }
    }
  }

  const handleEquip = async (build: SavedBuild) => {
    const result = await confirm(t('Builds.ConfirmEquip.Content') /* Equipping this will unequip characters that use the relics in this build */)
    if (result) {
      DB.equipRelicIdsToCharacter(
        Object.values(build.build),
        selectedCharacter?.id,
      )
      SaveState.delayedSave()
      Message.success(t('Builds.ConfirmEquip.SuccessMessage', { buildName: build.name }) /* Successfully equipped build: {{buildName}} */)
      handleCancel()
    }
  }

  return (
    <Modal
      open={isOpen}
      width={1115}
      destroyOnClose
      centered
      onOk={onModalOk}
      onCancel={handleCancel}
      footer={[
        <Button key='delete' onClick={() => handleDeleteAllBuilds()}>
          {t('Builds.DeleteAll') /* Delete All */}
        </Button>,
        <Button key='back' onClick={handleCancel}>
          {t('common:Cancel') /* Cancel */}
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
                    </Flex>
                    <Flex gap={5}>
                      <Button
                        onClick={() => {
                          void handleEquip(build)
                        }}
                      >
                        {t('Builds.Equip') /* Equip */}
                      </Button>
                      <Button
                        style={{ width: 35 }}
                        type='primary'
                        icon={<DeleteOutlined />}
                        onClick={() => {
                          void handleDeleteSingleBuild(build.name)
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

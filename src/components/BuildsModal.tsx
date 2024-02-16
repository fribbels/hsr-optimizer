import * as React from 'react'
import { Button, Card, Flex, Modal } from 'antd'
import StatText from './characterPreview/StatText'
import { HeaderText } from './HeaderText'
import { DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons'
import DB from '../lib/db'
import { SaveState } from 'lib/saveState'
import { Message } from '../lib/message'
import { Character, oldBuild } from 'types/Character'
import RelicPreview from './RelicPreview'
import { defaultGap } from 'lib/constantsUi'
import { RelicScorer } from 'lib/relicScorer'

interface BuildsModalProps {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  selectedCharacter?: Character
  imgRenderer: (x: { data: Character }) => JSX.Element
}

const BuildsModal: React.FC<BuildsModalProps> = ({
  open,
  setOpen,
  imgRenderer,
  selectedCharacter,
}) => {
  const [confirmationModal, contextHolder] = Modal.useModal()
  const [selectedBuildIndex, setSelectedBuildIndex] = React.useState<null | number>(null)
  const [selectedBuild, setSelectedBuild] = React.useState<null | number>(null)
  const characterMetadata
    = DB.getMetadata().characters[selectedCharacter?.id || 0]
  const characterName = characterMetadata?.displayName

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

  function onModalOk() {
    setOpen(false)
  }

  const handleCancel = () => {
    setSelectedBuild(null)
    setSelectedBuildIndex(null)
    setOpen(false)
  }

  const handleDeleteAllBuilds = async () => {
    const result = await confirm('Are you sure you want to delete all builds?')
    if (result) {
      DB.clearCharacterBuilds(selectedCharacter?.id)
      window.forceCharacterTabUpdate()
      SaveState.save()
      Message.success(`Successfully deleted all builds for ${characterName}`)
      setOpen(false)
    }
  }

  const handleDeleteSingleBuild = async (name: string) => {
    const result = await confirm(`Are you sure you want to delete ${name}?`)
    if (result) {
      DB.deleteCharacterBuild(selectedCharacter?.id, name)
      window.forceCharacterTabUpdate()
      SaveState.save()
      Message.success(`Successfully deleted build: ${name}`)
    }
  }

  const handleEquip = async (build: oldBuild) => {
    const result = await confirm(
      `Equipping this will unequip characters that use the relics in this build`,
    )
    if (result) {
      DB.equipRelicIdsToCharacter(
        Object.values(build.build),
        selectedCharacter?.id,
      )
      window.forceCharacterTabUpdate()
      SaveState.save()
      Message.success(`Successfully equipped build: ${build.name}`)
      handleCancel()
    }
  }

  const renderRelicPreviews = () => {
    if (selectedBuild == null) return null
    const relics = selectedCharacter?.builds?.[selectedBuild]?.build || []
    const relicGroups: React.ReactElement[] = []
    for (let i = 0; i < relics.length; i += 2) {
      const group = relics
        .slice(i, i + 2)
        .map((relicId) => {
          const relic = DB.getRelicById(relicId)
          return (
            <RelicPreview
              key={relicId}
              score={RelicScorer.score(relic, selectedCharacter?.id)}
              relic={relic}
              characterId={selectedCharacter?.id}
              source="builds"
            />
          )
        })
      relicGroups.push(
        <Flex key={i} gap={defaultGap}>
          {group}
        </Flex>,
      )
    }
    return (
      <Flex vertical>
        {relicGroups}
      </Flex>
    )
  }

  return (
    <Modal
      open={open}
      width={1000}
      destroyOnClose
      centered
      onOk={onModalOk}
      onCancel={handleCancel}
      footer={[
        <Button key="delete" onClick={() => handleDeleteAllBuilds()}>
          Delete all
        </Button>,
        <Button key="back" onClick={handleCancel}>
          Cancel
        </Button>,
      ]}
    >
      <Flex>
        {selectedCharacter && (
          <>
            <Flex gap={8} align="center">
              {imgRenderer && imgRenderer({ data: selectedCharacter })}
              <HeaderText>
                {' '}
                {characterName}
                {' '}
                builds
              </HeaderText>
            </Flex>
            <Flex
              vertical
              style={{
                marginTop: 20,
                overflowY: 'auto',
                height: 300,
                marginBottom: 20,
              }}
              gap={8}
            >
              {selectedCharacter.builds?.map((build, index) => (
                <Card
                  style={{
                    backgroundColor:
                    selectedBuildIndex === index || selectedBuild === index
                      ? '#001529'
                      : undefined,
                    cursor: 'pointer',
                  }}
                  onClick={(e) => {
                    const isButtonClicked
                    = (e.target as HTMLElement).closest('button') !== null
                    if (!isButtonClicked) {
                      setSelectedBuild(index)
                    }
                  }}
                  onMouseEnter={() => setSelectedBuildIndex(index)}
                  onMouseLeave={() => setSelectedBuildIndex(null)}
                  key={index}
                >

                  <Flex justify="space-between" gap={8} align="center">
                    <HeaderText style={{ flex: 1 }}>{build.name}</HeaderText>
                    <StatText
                      style={{
                        fontSize: 17,
                        fontWeight: 600,
                        textAlign: 'center',
                        color: '#e1a564',
                      }}
                    >
                      {`score: ${build.score.score} ${
                        build.score.score == 0
                          ? ''
                          : '(' + build.score.rating + ')'
                      }`}
                    </StatText>
                    <Button
                      onClick={() => {
                        handleEquip(build)
                      }}
                    >
                      Equip
                    </Button>
                    <Button
                      style={{ width: 30 }}
                      type="primary"
                      icon={<DeleteOutlined />}
                      onClick={() => {
                        handleDeleteSingleBuild(build.name)
                      }}
                    />
                  </Flex>
                </Card>
              ))}
            </Flex>
          </>
        )}

        {contextHolder}
        {renderRelicPreviews()}
      </Flex>
    </Modal>
  )
}

export default BuildsModal

import * as React from 'react'
import { Button, Flex, Modal, Card } from 'antd'
import StatText from './characterPreview/StatText'
import { HeaderText } from './HeaderText'
import { DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons'
import DB from '../lib/db'
import { SaveState } from 'lib/saveState'
import { Message } from '../lib/message'
import { Character, oldBuild } from 'types/Character'
import RelicPreview from './RelicPreview'
import { defaultGap } from 'lib/constantsUi'

interface BuildsModalProps {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  selectedCharacter?: Character
  imgRenderer: (x: { data: Character }) => JSX.Element
  nameRenderer: (x: { data: Character }) => JSX.Element
}

const BuildsModal: React.FC<BuildsModalProps> = ({
  open,
  setOpen,
  imgRenderer,
  selectedCharacter,
}) => {
  const [confirmationModal, contextHolder] = Modal.useModal()
  const [selectedBuildIndex, setSelectedBuildIndex] = React.useState<
    null | number
  >(null)
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

  const handleDelete = async () => {
    const result = await confirm('Are you sure you want to delete all builds?')
    if (result) {
      DB.clearCharacterBuilds(selectedCharacter?.id)
      window['forceCharacterTabUpdate']?.()
      SaveState.save()
      Message.success(`Successfully deleted all builds for ${characterName}`)
      setOpen(false)
    }
  }

  const deleteOne = async (name: string) => {
    const result = await confirm(`Are you sure you want to delete ${name}?`)
    if (result) {
      DB.deleteCharacterBuild(selectedCharacter?.id, name)
      window['forceCharacterTabUpdate']?.()
      SaveState.save()
      Message.success(`Successfully deleted ${name}`)
    }
  }
  console.log(selectedBuild)

  const handleEquip = async (build: oldBuild) => {
    const result = await confirm(
      `Equipping this will unequip characters that use the relics in this build`,
    )
    if (result) {
      DB.equipRelicIdsToCharacter(
        Object.values(build.build),
        selectedCharacter?.id,
      )
      window['forceCharacterTabUpdate']?.()
      SaveState.save()
      Message.success(`Successfully equipped ${build.name}`)
      handleCancel()
    }
  }

  const renderRelicPreviews = () => {
    if (selectedBuild == null) return null
    const relics = selectedCharacter?.builds?.[selectedBuild]?.build || []
    const relicGroups: React.ReactElement[] = []
    for (let i = 0; i < relics.length; i += 3) {
      const group = relics
        .slice(i, i + 3)
        .map((relicId) => (
          <RelicPreview
            key={relicId}
            relic={DB.getRelicById(relicId)}
            characterId={selectedCharacter?.id}
          />
        ))
      relicGroups.push(
        <Flex key={i} gap={defaultGap}>
          {group}
        </Flex>,
      )
    }
    return relicGroups
  }

  return (
    <Modal
      open={open}
      width={650}
      destroyOnClose
      centered
      onOk={onModalOk}
      onCancel={handleCancel}
      footer={[
        <Button key="delete" onClick={() => handleDelete()}>
          Delete all
        </Button>,
        <Button key="back" onClick={handleCancel}>
          Cancel
        </Button>,
      ]}
    >
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
                onClick={() => {
                  // handleEquip(build);
                  setSelectedBuild(index) // Set selectedBuildIndex on click
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
                      deleteOne(build.name)
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
    </Modal>
  )
}

export default BuildsModal

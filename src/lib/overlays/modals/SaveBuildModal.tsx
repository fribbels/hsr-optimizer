import { IconAlertCircle } from '@tabler/icons-react'
import {
  Form,
  Modal as AntdModal,
} from 'antd'
import { Button, Divider, Flex, Modal, TextInput, Tooltip } from '@mantine/core'
import i18next from 'i18next'
import { Message } from 'lib/interactions/message'
import {
  BuildList,
  BuildPreview,
} from 'lib/overlays/modals/BuildsModal'
import { useScrollLock } from 'lib/rendering/scrollController'
import DB, {
  AppPages,
  SavedBuildSource,
} from 'lib/state/db'
import { useOptimizerFormStore } from 'lib/stores/optimizerForm/useOptimizerFormStore'
import { SaveState } from 'lib/state/saveState'
import { CharacterTabController } from 'lib/tabs/tabCharacters/characterTabController'
import {
  ReactNode,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { useTranslation } from 'react-i18next'
import {
  Character,
  SavedBuild,
} from 'types/character'
import { Teammate } from 'types/form'

type CharacterForm = {
  name: string,
}

const buttonStyle = { margin: '4px 0px 4px 0px', height: '5.5%' }

export function SaveBuildModal(props: {
  source: AppPages.CHARACTERS | AppPages.OPTIMIZER,
  character: Character | null,
  isOpen: boolean,
  close: () => void,
}) {
  const {
    source,
    character,
    isOpen,
    close,
  } = props
  const [characterForm] = Form.useForm<CharacterForm>()
  const [confirmationModal, contextHolder] = AntdModal.useModal()

  const [selectedBuild, setSelectedBuild] = useState<number | null>(null)
  const [inputName, setInputName] = useState<string>('')

  useScrollLock(isOpen)

  const setSelectedBuildWrapped = (idx: number | null) => {
    setSelectedBuild(idx)
    if (idx !== null && character) {
      const buildName = character.builds?.[idx]?.name ?? ''
      characterForm.setFieldValue('name', buildName)
      setInputName(buildName)
    } else {
      characterForm.setFieldValue('name', '')
      setInputName('')
    }
  }

  const { t } = useTranslation('modals', { keyPrefix: 'SaveBuild' })
  const { t: tCommon } = useTranslation('common')

  async function confirm(content: ReactNode) {
    return confirmationModal.confirm({
      title: tCommon('Confirm'), /* Confirm */
      icon: <IconAlertCircle />,
      content: content,
      okText: tCommon('Confirm'), /* Confirm */
      cancelText: tCommon('Cancel'), /* Cancel */
      centered: true,
    })
  }

  function handleInput(mode: 'overwrite' | 'save') {
    switch (source) {
      case AppPages.CHARACTERS:
        if (mode === 'save') {
          CharacterTabController.confirmSaveBuild(inputName)
        } else {
          CharacterTabController.confirmOverwriteBuild(inputName)
        }
        break
      case AppPages.OPTIMIZER:
        const overwrite = mode === 'overwrite'
        const selectedCharacter = window.store.getState().optimizerTabFocusCharacter
        if (!selectedCharacter) {
          console.warn('no selected character')
          break
        }
        const res = DB.saveCharacterBuild(inputName, selectedCharacter, SavedBuildSource.OPTIMIZER, overwrite)
        if (res) {
          Message.error(res.error)
          break
        }
        if (overwrite) {
          Message.success(i18next.t('modals:SaveBuild.ConfirmOverwrite.SuccessMessage', { name: inputName }))
        } else {
          Message.success(i18next.t('charactersTab:Messages.SaveSuccess', { name: inputName }))
        }
    }
    SaveState.delayedSave()
    close()
  }

  function onModalOk() {
    handleInput('save')
  }

  const handleOverwrite = async () => {
    const res = await confirm(t('ConfirmOverwrite.Content'))
    if (res) {
      handleInput('overwrite')
    }
  }

  const handleCancel = () => {
    close()
  }

  const nameTaken = character?.builds?.reduce((acc, cur) => acc || cur.name == inputName, false)
  const saveDisabled = nameTaken || inputName == ''
  const overwriteDisabled = !nameTaken || inputName == ''

  const build: SavedBuild | null = useMemo(() => {
    // if build is null then the preview will show the character's currently equipped build as seen in the character tab
    if (selectedBuild !== null && selectedBuild !== -1) {
      return character?.builds?.[selectedBuild] ?? null
    }
    switch (source) {
      case AppPages.CHARACTERS:
        return null
      case AppPages.OPTIMIZER:
        const storeState = useOptimizerFormStore.getState()
        return {
          name: '',
          optimizerMetadata: null,
          deprioritizeBuffs: storeState.deprioritizeBuffs,
          characterId: storeState.characterId!,
          eidolon: storeState.characterEidolon,
          lightConeId: storeState.lightCone!,
          superimposition: storeState.lightConeSuperimposition,
          team: storeState.teammates.map((t) => ({
            characterId: t.characterId!,
            eidolon: t.characterEidolon,
            lightConeId: t.lightCone!,
            superimposition: t.lightConeSuperimposition,
            relicSet: t.teamRelicSet,
            ornamentSet: t.teamOrnamentSet,
          })),
          equipped: window.store.getState().optimizerBuild ?? {},
        }
    }
  }, [selectedBuild, source, character])

  return (
    <Modal
      opened={isOpen}
      size={1550}
      centered
      onClose={handleCancel}
    >
      {contextHolder}
      <Flex gap={10} style={{ height: 856 }}>
        <Flex direction="column" style={{ width: 400 }}>
          <Form
            form={characterForm}
            preserve={false}
            layout='vertical'
            onValuesChange={(changed, _) => {
              setInputName(changed.name)
              setSelectedBuild(character?.builds?.findIndex((b) => b.name === changed.name) ?? null)
            }}
          >
            <Form.Item
              name='name'
              label={t('Label') /* Build name */}
              rules={[{ required: true, message: t('Rule') /* Please input a name */ }]}
            >
              <TextInput />
            </Form.Item>
          </Form>
          <Divider style={{ margin: '6px 0px 6px 0px' }} />
          <Button variant="default" onClick={handleCancel} style={buttonStyle}>
            {tCommon('Cancel') /* Cancel */}
          </Button>
          <Tooltip
            label={saveDisabled
              ? nameTaken ? t('Tooltip.SaveDisabled.NameTaken') : t('Tooltip.SaveDisabled.NoName')
              : ''}
            position='right'
          >
            <Button onClick={onModalOk} style={buttonStyle} disabled={saveDisabled}>
              {tCommon('Save') /* Save */}
            </Button>
          </Tooltip>
          <Tooltip label={overwriteDisabled ? t('Tooltip.OverwriteDisabled') : ''} position='right'>
            <Button onClick={handleOverwrite} style={buttonStyle} disabled={overwriteDisabled}>
              {t('Overwrite')}
            </Button>
          </Tooltip>
          <Divider style={{ margin: '6px 0px 6px 0px' }} />
          <BuildList
            preview
            character={character}
            selectedBuild={selectedBuild}
            setSelectedBuild={setSelectedBuildWrapped}
            style={{ height: '100%' }}
          />
        </Flex>
        <BuildPreview character={character} build={build} />
      </Flex>
    </Modal>
  )
}

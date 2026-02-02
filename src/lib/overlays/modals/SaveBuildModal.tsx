import { ExclamationCircleOutlined } from '@ant-design/icons'
import {
  Button,
  Divider,
  Flex,
  Form,
  Input,
  Modal,
  Tooltip,
} from 'antd'
import {
  OpenCloseIDs,
  useOpenClose,
} from 'lib/hooks/useOpenClose'
import { Message } from 'lib/interactions/message'
import {
  BuildList,
  BuildPreview,
} from 'lib/overlays/modals/BuildsModal'
import {
  lockScroll,
  unlockScroll,
} from 'lib/rendering/scrollController'
import {
  AppPages,
} from 'lib/state/db'
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
}) {
  const {
    source,
    character,
  } = props
  const [characterForm] = Form.useForm<CharacterForm>()
  const [confirmationModal] = Modal.useModal()

  const { isOpen, close } = useOpenClose(OpenCloseIDs.SAVE_BUILDS_MODAL)

  const [selectedBuild, setSelectedBuild] = useState<number | null>(null)
  const [inputName, setInputName] = useState<string>('')

  useEffect(() => {
    setInputName('')
    setSelectedBuild(null)
    if (isOpen) {
      lockScroll()
    } else {
      unlockScroll()
    }
  }, [isOpen, character])

  const setSelectedBuildWrapped = (idx: number | null) => {
    setSelectedBuild(idx)
    if (idx !== null && character) {
      const buildName = character.builds![idx].name
      characterForm.setFieldValue('name', buildName)
      setInputName(buildName)
    }
  }

  const { t } = useTranslation('modals', { keyPrefix: 'SaveBuild' })
  const { t: tCommon } = useTranslation('common')

  async function confirm(content: ReactNode) {
    return confirmationModal.confirm({
      title: tCommon('Confirm'), /* Confirm */
      icon: <ExclamationCircleOutlined />,
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
        // TODO:
        break
      default:
        break
    }
    SaveState.delayedSave()
    close()
  }

  function onModalOk() {
    handleInput('save')
  }

  const handleCancel = () => {
    close()
  }

  const nameTaken = character?.builds?.reduce((acc, cur) => acc || cur.name == inputName, false)
  const saveDisabled = nameTaken || inputName == ''
  const overwriteDisabled = !nameTaken || inputName == ''

  const build: SavedBuild | null = (() => {
    // if build is null then the preview will show the character's currently equipped build as seen in the character tab
    if (selectedBuild !== null) {
      return character?.builds![selectedBuild] ?? null
    }
    switch (source) {
      case AppPages.CHARACTERS:
        return null
      case AppPages.OPTIMIZER:
        const form = window.optimizerForm
        return {
          name: '',
          optimizerMetadata: null,
          deprioritizeBuffs: form.getFieldValue('deprioritizeBuffs'),
          characterId: form.getFieldValue('characterId'),
          eidolon: form.getFieldValue('characterEidolon'),
          lightConeId: form.getFieldValue('lightCone'),
          superimposition: form.getFieldValue('lightConeSuperimposition'),
          team: ([form.getFieldValue('teammate0'), form.getFieldValue('teammate1'), form.getFieldValue('teammate2')] as Array<Teammate>)
            .map((t) => ({
              characterId: t.characterId,
              eidolon: t.characterEidolon,
              lightConeId: t.lightCone,
              superimposition: t.lightConeSuperimposition,
              relicSet: t.teamRelicSet,
              ornamentSet: t.teamOrnamentSet,
            })),
          equipped: window.store.getState().optimizerBuild ?? {},
        }
    }
  })()

  const handleOverwrite = async () => {
    const res = await confirm(t('ConfirmOverwrite.Content'))
    if (res) {
      handleInput('overwrite')
    }
  }

  return (
    <Modal
      open={isOpen}
      width={1550}
      destroyOnClose
      centered
      onOk={onModalOk}
      onCancel={handleCancel}
      footer={[]}
    >
      <Flex gap={10} style={{ height: 856 }}>
        <Flex vertical>
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
              <Input />
            </Form.Item>
          </Form>
          <Divider style={{ margin: '6px 0px 6px 0px' }} />
          <Button onClick={handleCancel} style={buttonStyle}>
            {tCommon('Cancel') /* Cancel */}
          </Button>
          <Tooltip
            title={saveDisabled
              ? nameTaken ? t('Tooltip.SaveDisabled.NameTaken') : t('Tooltip.SaveDisabled.NoName')
              : ''}
            placement='right'
          >
            <Button type='primary' onClick={onModalOk} style={buttonStyle} disabled={saveDisabled}>
              {tCommon('Save') /* Save */}
            </Button>
          </Tooltip>
          <Tooltip title={overwriteDisabled ? t('Tooltip.OverwriteDisabled') : ''} placement='right'>
            <Button type='primary' onClick={handleOverwrite} style={buttonStyle} disabled={overwriteDisabled}>
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

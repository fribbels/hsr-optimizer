import {
  Button,
  Flex,
  Form as AntDForm,
  Modal,
  Select,
} from 'antd'
import { defaultGap } from 'lib/constants/constantsUi'
import {
  OpenCloseIDs,
  useOpenClose,
} from 'lib/hooks/useOpenClose'
import { generateCharacterList } from 'lib/rendering/displayUtils'
import { CharacterTabController } from 'lib/tabs/tabCharacters/characterTabController'
import { useCharacterTabStore } from 'lib/tabs/tabCharacters/useCharacterTabStore'
import { HeaderText } from 'lib/ui/HeaderText'
import { Utils } from 'lib/utils/utils'
import {
  useEffect,
  useMemo,
} from 'react'
import { useTranslation } from 'react-i18next'
import { CharacterId } from 'types/character'
import { ReactElement } from 'types/components'

export type SwitchRelicsFormSelectedCharacter = {
  key: string,
  label: ReactElement,
  title: string,
  value: CharacterId,
}

export type SwitchRelicsForm = {
  selectedCharacter: SwitchRelicsFormSelectedCharacter,
}

export function SwitchRelicsModal() {
  const currentCharacter = useCharacterTabStore((s) => s.selectedCharacter)
  const [characterForm] = AntDForm.useForm()
  const characters = useCharacterTabStore((s) => s.characters)
  const { isOpen, close } = useOpenClose(OpenCloseIDs.SWITCH_RELICS_MODAL)

  const { t } = useTranslation('modals', { keyPrefix: 'SwitchRelics' })
  const { t: tCommon } = useTranslation('common')
  const { t: tCharacters } = useTranslation('gameData', { keyPrefix: 'Characters' })

  const characterOptions = useMemo(() =>
    generateCharacterList(
      {
        currentCharacters: characters,
        excludeCharacters: currentCharacter ? [currentCharacter] : [],
        withNobodyOption: false,
        longNameLabel: true,
        longNameTitle: true,
      },
      tCharacters,
    ), [characters, currentCharacter, tCharacters])

  useEffect(() => {
    if (!isOpen) return

    characterForm.setFieldsValue({
      characterId: null,
    })
  }, [characterForm, isOpen])

  function onModalOk() {
    const { selectedCharacter } = characterForm.getFieldsValue() as SwitchRelicsForm
    console.log('Switch relics modal submitted with:', selectedCharacter)
    CharacterTabController.onSwitchRelicsOk(selectedCharacter)
    close()
  }

  const handleCancel = () => {
    close()
  }

  const panelWidth = 325 - 47

  return (
    <Modal
      open={isOpen}
      width={panelWidth + 47}
      destroyOnClose
      centered
      onOk={onModalOk}
      onCancel={handleCancel}
      footer={[
        <Button key='back' onClick={handleCancel}>
          {tCommon('Cancel') /* Cancel */}
        </Button>,
        <Button key='submit' type='primary' onClick={onModalOk}>
          {tCommon('Save') /* Save */}
        </Button>,
      ]}
    >
      <AntDForm
        form={characterForm}
        preserve={false}
        layout='vertical'
      >
        <Flex justify='space-between' align='center'>
          <HeaderText>{t('Title') /* Switch relics with character */}</HeaderText>
        </Flex>

        <Flex vertical gap={defaultGap}>
          <Flex gap={defaultGap}>
            <AntDForm.Item name='selectedCharacter'>
              <Select
                labelInValue
                showSearch
                filterOption={Utils.titleFilterOption}
                style={{ width: panelWidth }}
                options={characterOptions}
              />
            </AntDForm.Item>
          </Flex>
        </Flex>
      </AntDForm>
    </Modal>
  )
}

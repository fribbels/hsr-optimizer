import {
  Form as AntDForm,
} from 'antd'
import { Button, Flex, Modal, Select } from '@mantine/core'
import { defaultGap } from 'lib/constants/constantsUi'
import {
  OpenCloseIDs,
  useOpenClose,
} from 'lib/hooks/useOpenClose'
import { generateCharacterList } from 'lib/rendering/displayUtils'
import { CharacterTabController } from 'lib/tabs/tabCharacters/characterTabController'
import { useCharacterTabStore } from 'lib/tabs/tabCharacters/useCharacterTabStore'
import { HeaderText } from 'lib/ui/HeaderText'
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
    const { selectedCharacter } = characterForm.getFieldsValue() as { selectedCharacter: string }
    console.log('Switch relics modal submitted with:', selectedCharacter)
    CharacterTabController.onSwitchRelicsOk({ value: selectedCharacter as CharacterId } as SwitchRelicsFormSelectedCharacter)
    close()
  }

  const handleCancel = () => {
    close()
  }

  const panelWidth = 325 - 47

  return (
    <Modal
      opened={isOpen}
      size={panelWidth + 47}
      centered
      onClose={handleCancel}
    >
      <AntDForm
        form={characterForm}
        preserve={false}
        layout='vertical'
      >
        <Flex justify='space-between' align='center'>
          <HeaderText>{t('Title') /* Switch relics with character */}</HeaderText>
        </Flex>

        <Flex direction="column" gap={defaultGap}>
          <Flex gap={defaultGap}>
            <AntDForm.Item name='selectedCharacter'>
              <Select
                searchable
                style={{ width: panelWidth }}
                data={characterOptions.map((opt) => ({ value: opt.value, label: opt.title ?? opt.value }))}
                renderOption={({ option }) => {
                  const match = characterOptions.find((o) => o.value === option.value)
                  return match?.label ?? option.label
                }}
              />
            </AntDForm.Item>
          </Flex>
        </Flex>
      </AntDForm>
      <Flex justify='flex-end' gap={8} style={{ marginTop: 16 }}>
        <Button key='back' variant="default" onClick={handleCancel}>
          {tCommon('Cancel') /* Cancel */}
        </Button>
        <Button key='submit' onClick={onModalOk}>
          {tCommon('Save') /* Save */}
        </Button>
      </Flex>
    </Modal>
  )
}

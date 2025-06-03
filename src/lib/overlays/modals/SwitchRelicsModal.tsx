import {
  Button,
  Flex,
  Form as AntDForm,
  Modal,
  Select,
} from 'antd'
import { defaultGap } from 'lib/constants/constantsUi'
import { generateCharacterList } from 'lib/rendering/displayUtils'
import { HeaderText } from 'lib/ui/HeaderText'
import { Utils } from 'lib/utils/utils'
import React, {
  useEffect,
  useMemo,
} from 'react'
import { useTranslation } from 'react-i18next'
import { Character } from 'types/character'
import { ReactElement } from 'types/components'

export type SwitchRelicsFormSelectedCharacter = {
  key: string,
  label: ReactElement,
  title: string,
  value: string,
}

export type SwitchRelicsForm = {
  selectedCharacter: SwitchRelicsFormSelectedCharacter,
}

export default function SwitchRelicsModal(props: {
  onOk: (selectedCharacter: SwitchRelicsFormSelectedCharacter) => void,
  open: boolean,
  setOpen: (value: boolean) => void,
  currentCharacter: Character,
}) {
  const { onOk, open, setOpen, currentCharacter } = props
  const [characterForm] = AntDForm.useForm()
  const characters = window.store((s) => s.characters)

  const { t } = useTranslation('modals', { keyPrefix: 'SwitchRelics' })
  const { t: tCommon } = useTranslation('common')

  const characterOptions = useMemo(() =>
    generateCharacterList({
      currentCharacters: characters,
      excludeCharacters: [currentCharacter],
      withNobodyOption: false,
      longNameLabel: true,
      longNameTitle: true,
    }), [characters, currentCharacter, t])

  useEffect(() => {
    if (!open) return

    characterForm.setFieldsValue({
      characterId: null,
    })
  }, [characterForm, open])

  function onModalOk() {
    const { selectedCharacter } = characterForm.getFieldsValue() as SwitchRelicsForm
    console.log('Switch relics modal submitted with:', selectedCharacter)
    onOk(selectedCharacter)
    setOpen(false)
  }

  const handleCancel = () => {
    setOpen(false)
  }

  const panelWidth = 325 - 47

  return (
    <Modal
      open={open}
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

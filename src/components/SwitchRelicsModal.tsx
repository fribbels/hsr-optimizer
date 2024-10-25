import React, { useEffect, useMemo } from 'react'
import { Button, Flex, Form as AntDForm, Modal, Select } from 'antd'
import { HeaderText } from 'components/HeaderText'
import { defaultGap } from 'lib/constantsUi'
import { Utils } from 'lib/utils'
import { generateCharacterList } from 'lib/displayUtils'
import { useTranslation } from 'react-i18next'
import { Character } from 'types/Character'
import { ReactElement } from 'types/Components'

export type SwitchRelicsFormSelectedCharacter = {
  key: string
  label: ReactElement
  title: string
  value: string
}

export type SwitchRelicsForm = {
  selectedCharacter: SwitchRelicsFormSelectedCharacter
}

export default function SwitchRelicsModal(props: {
  onOk: (selectedCharacter: SwitchRelicsFormSelectedCharacter) => void
  open: boolean
  setOpen: (value: boolean) => void
  currentCharacter: Character
}) {
  const { onOk, open, setOpen, currentCharacter } = props
  const [characterForm] = AntDForm.useForm()
  const characters = window.store((s) => s.characters)

  const { t } = useTranslation('modals', { keyPrefix: 'SwitchRelics' })

  const characterOptions = useMemo(() => generateCharacterList({
    currentCharacters: characters,
    excludeCharacters: [currentCharacter],
    withNobodyOption: false,
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

  const panelWidth = 300 - 47

  return (
    <Modal
      open={open}
      width={300}
      destroyOnClose
      centered
      onOk={onModalOk}
      onCancel={handleCancel}
      footer={[
        <Button key='back' onClick={handleCancel}>
          {t('Cancel')/* Cancel */}
        </Button>,
        <Button key='submit' type='primary' onClick={onModalOk}>
          {t('Save')/* Save */}
        </Button>,
      ]}
    >
      <AntDForm
        form={characterForm}
        preserve={false}
        layout='vertical'
      >
        <Flex justify='space-between' align='center'>
          <HeaderText>{t('Title')/* Switch relics with character */}</HeaderText>
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

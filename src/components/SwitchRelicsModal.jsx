import React, { useEffect, useMemo } from 'react'
import { Button, Flex, Form, Modal, Select } from 'antd'
import { HeaderText } from './HeaderText'
import { defaultGap } from 'lib/constantsUi'
import { Utils } from 'lib/utils'
import PropTypes from 'prop-types'

export default function SwitchRelicsModal({ onOk, open, setOpen, currentCharacter }) {
  const [characterForm] = Form.useForm()
  window.characterForm = characterForm
  const characters = window.store((s) => s.characters)

  const characterOptions = useMemo(() => Utils.generateCurrentCharacterOptions(
    characters, [currentCharacter], false,
  ), [characters, currentCharacter])

  useEffect(() => {
    if (!open) return

    characterForm.setFieldsValue({
      characterId: null,
    })
  }, [characterForm, open])

  function onModalOk() {
    const { selectedCharacter } = characterForm.getFieldsValue()
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
        <Button key="back" onClick={handleCancel}>
          Cancel
        </Button>,
        <Button key="submit" type="primary" onClick={onModalOk}>
          Save
        </Button>,
      ]}
    >
      <Form
        form={characterForm}
        preserve={false}
        layout="vertical"
      >
        <Flex justify="space-between" align="center">
          <HeaderText>Switch Relics with Character</HeaderText>
        </Flex>

        <Flex vertical gap={defaultGap}>
          <Flex gap={defaultGap}>
            <Form.Item size="default" name="selectedCharacter">
              <Select
                labelInValue
                showSearch
                filterOption={Utils.labelFilterOption}
                style={{ width: panelWidth }}
                options={characterOptions}
              />
            </Form.Item>
          </Flex>
        </Flex>
      </Form>
    </Modal>
  )
}
SwitchRelicsModal.propTypes = {
  onOk: PropTypes.func,
  open: PropTypes.bool,
  setOpen: PropTypes.func,
  currentCharacter: PropTypes.object,
}

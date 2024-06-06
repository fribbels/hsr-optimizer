import React, { useEffect, useState } from 'react'
import { Button, Flex, Form, Modal, Select } from 'antd'
import { HeaderText } from './HeaderText'
import { eidolonOptions, superimpositionOptions } from 'lib/constants'
import { defaultGap } from 'lib/constantsUi'
import PropTypes from 'prop-types'
import LightConeSelect from 'components/optimizerTab/optimizerForm/LightConeSelect'
import CharacterSelect from 'components/optimizerTab/optimizerForm/CharacterSelect'

// Keep new characters/lcs at the top of the list for convenience. More popular should be at the bottom
// TODO: These no longer work because we changed the character selector
// const pinnedValues = [
//   'Black Swan',
//   'Sparkle',
//   'Gallagher',
//   'Aventurine',
//   'Acheron',
//
//   'Reforged Remembrance',
//   'Earthly Escapade',
//   'Concert for Two',
//   'Inherently Unjust Destiny',
//   'Along the Passing Shore',
// ]
// function generatePinnedList(list) {
//   if (!list || !list.length) return []
//
//   list.sort((a, b) => {
//     const indexA = pinnedValues.indexOf(a.label)
//     const indexB = pinnedValues.indexOf(b.label)
//     if (indexB > indexA) {
//       return 1
//     } else if (indexA > indexB) {
//       return -1
//     }
//
//     return a.label.localeCompare(b.label)
//   })
//
//   list.map((option) => pinnedValues.indexOf(option.label) > -1 ? option.label = '(New!) ' + option.label : null)
//
//   return list
// }

export default function CharacterModal(props) {
  const [characterForm] = Form.useForm()
  window.characterForm = characterForm

  const [characterId, setCharacterId] = useState('')

  useEffect(() => {
    if (!props.open) return

    const defaultValues = {
      characterId: props.initialCharacter?.form.characterId,
      characterLevel: 80,
      characterEidolon: props.initialCharacter?.form.characterEidolon || 0,
      lightCone: props.initialCharacter?.form.lightCone,
      lightConeLevel: 80,
      lightConeSuperimposition: props.initialCharacter?.form.lightConeSuperimposition || 1,
    }

    characterForm.setFieldsValue(defaultValues)
  }, [characterForm, props.initialCharacter, props.open])

  function onModalOk() {
    const formValues = characterForm.getFieldsValue()
    console.log('Character modal submitted with form:', formValues)
    props.onOk(formValues)
    props.setOpen(false)
  }

  const handleCancel = () => {
    props.setOpen(false)
  }

  const panelWidth = 300 - 47

  return (
    <Modal
      open={props.open}
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
          <HeaderText>Character</HeaderText>
        </Flex>

        <Flex vertical gap={defaultGap} style={{ marginBottom: 10 }}>
          <Flex gap={defaultGap} justify="space-between">
            <Form.Item size="default" name="characterId">
              <CharacterSelect
                value=""
                selectStyle={{ width: panelWidth - 60 - defaultGap }}
                onChange={setCharacterId}
                withIcon={true}
              />
            </Form.Item>
            <Form.Item size="default" name="characterEidolon">
              <Select
                showSearch
                style={{ width: 60 }}
                options={eidolonOptions}
              />
            </Form.Item>
          </Flex>
        </Flex>

        <Flex justify="space-between" align="center">
          <HeaderText>Light cone</HeaderText>
        </Flex>
        <Flex vertical gap={defaultGap}>
          <Flex gap={defaultGap}>
            <Form.Item size="default" name="lightCone">
              <LightConeSelect
                value=""
                selectStyle={{ width: panelWidth - 60 - defaultGap }}
                characterId={characterId}
              />
            </Form.Item>
            <Form.Item size="default" name="lightConeSuperimposition">
              <Select
                showSearch
                style={{ width: 60 }}
                options={superimpositionOptions}
              />
            </Form.Item>
          </Flex>
        </Flex>
      </Form>
    </Modal>
  )
}
CharacterModal.propTypes = {
  open: PropTypes.bool,
  onOk: PropTypes.func,
  setOpen: PropTypes.func,
  initialCharacter: PropTypes.object,
}

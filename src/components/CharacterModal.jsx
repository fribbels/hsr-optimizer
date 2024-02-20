import React, { useEffect, useMemo } from 'react'
import { Button, Flex, Form, Modal, Select } from 'antd'
import { HeaderText } from './HeaderText'
import { eidolonOptions, levelOptions, superimpositionOptions } from 'lib/constants'
import { defaultGap } from 'lib/constantsUi'
import { Utils } from 'lib/utils'
import PropTypes from 'prop-types'

// Keep new characters/lcs at the top of the list for convenience. More popular should be at the bottom
const pinnedValues = [
  'Black Swan',
  'Sparkle',
  'Gallagher',
  'Aventurine',
  'Acheron',

  'Reforged Remembrance',
  'Earthly Escapade',
  'Concert for Two',
  'Inherently Unjust Destiny',
  'Along the Passing Shore',
]
function generatePinnedList(list) {
  if (!list || !list.length) return []

  list.sort((a, b) => {
    const indexA = pinnedValues.indexOf(a.label)
    const indexB = pinnedValues.indexOf(b.label)
    if (indexB > indexA) {
      return 1
    } else if (indexA > indexB) {
      return -1
    }

    return a.label.localeCompare(b.label)
  })

  list.map((option) => pinnedValues.indexOf(option.label) > -1 ? option.label = '(New!) ' + option.label : null)

  return list
}

export default function CharacterModal(props) {
  const [characterForm] = Form.useForm()
  window.characterForm = characterForm

  const characterOptions = useMemo(() => generatePinnedList(Utils.generateCharacterOptions()), [])
  const lightConeOptions = useMemo(() => generatePinnedList(Utils.generateLightConeOptions()), [])

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

  const panelWidth = 203

  return (
    <Modal
      open={props.open}
      width={250}
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

        <Flex vertical gap={defaultGap}>
          <Flex gap={defaultGap}>
            <Form.Item size="default" name="characterId">
              <Select
                showSearch
                filterOption={Utils.labelFilterOption}
                style={{ width: panelWidth }}
                options={characterOptions}
              />
            </Form.Item>
          </Flex>
          <Flex gap={defaultGap} justify="space-between">
            <Form.Item size="default" name="characterLevel">
              <Select
                showSearch
                style={{ width: (panelWidth - defaultGap) / 2 }}
                options={levelOptions}
              />
            </Form.Item>
            <Form.Item size="default" name="characterEidolon">
              <Select
                showSearch
                style={{ width: (panelWidth - defaultGap) / 2 }}
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
              <Select
                showSearch
                filterOption={Utils.labelFilterOption}
                style={{ width: panelWidth }}
                options={lightConeOptions}
              />
            </Form.Item>
          </Flex>
          <Flex gap={defaultGap} justify="space-between">
            <Form.Item size="default" name="lightConeLevel">
              <Select
                showSearch
                style={{ width: (panelWidth - defaultGap) / 2 }}
                options={levelOptions}
              />
            </Form.Item>
            <Form.Item size="default" name="lightConeSuperimposition">
              <Select
                showSearch
                style={{ width: (panelWidth - defaultGap) / 2 }}
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

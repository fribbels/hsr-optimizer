import React, { useEffect, useMemo, useState } from 'react'
import { Button, Flex, Form, Modal, Radio, Select } from 'antd'
import { HeaderText } from './HeaderText'
import { eidolonOptions, superimpositionOptions } from 'lib/constants'
import { defaultGap } from 'lib/constantsUi'
import PropTypes from 'prop-types'
import LightConeSelect from 'components/optimizerTab/optimizerForm/LightConeSelect'
import CharacterSelect from 'components/optimizerTab/optimizerForm/CharacterSelect'
import DB from 'lib/db'

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

  const [eidolon, setEidolon] = useState(props.initialCharacter?.form.characterEidolon || 0)

  const [superimposition, setSuperimposition] = useState(props.initialCharacter?.form.lightConeSuperimposition || 1)

  const characterMetadata = useMemo(() => DB.getMetadata().characters, [])

  const initialPath = !props.addCharacter && props.initialCharacter ? characterMetadata[props.initialCharacter.form.characterId].path : undefined

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

  const panelWidth = 400 - 47

  return (
    <Modal
      open={props.open}
      width={400}
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
          <Form.Item size="default" name="characterId">
            <CharacterSelect
              value=""
              selectStyle={{ width: panelWidth - 60 - defaultGap + 38 }}
              onChange={setCharacterId}
              withIcon={true}
            />
          </Form.Item>
          <Form.Item size="default" name="characterEidolon">
            <Radio.Group value={eidolon} onChange={(e) => setEidolon(e.target.value)}>
              <Radio.Button value={0}>E0</Radio.Button>
              <Radio.Button value={1}>E1</Radio.Button>
              <Radio.Button value={2}>E2</Radio.Button>
              <Radio.Button value={3}>E3</Radio.Button>
              <Radio.Button value={4}>E4</Radio.Button>
              <Radio.Button value={5}>E5</Radio.Button>
              <Radio.Button value={6}>E6</Radio.Button>
            </Radio.Group>
          </Form.Item>
        </Flex>

        <Flex justify="space-between" align="center">
          <HeaderText>Light cone</HeaderText>
        </Flex>
        <Flex vertical gap={defaultGap}>
          <Form.Item size="default" name="lightCone">
            <LightConeSelect
              value=""
              selectStyle={{ width: panelWidth - 60 - defaultGap + 38 }}
              characterId={characterId}
              initialPath={initialPath}
            />
          </Form.Item>
          <Flex style={{ marginLeft: 0/* 46 */ }}>
            <Form.Item size="default" name="lightConeSuperimposition">
              <Radio.Group value={superimposition} onChange={(e) => setSuperimposition(e.target.value)}>
                <Radio.Button value={1}>S1</Radio.Button>
                <Radio.Button value={2}>S2</Radio.Button>
                <Radio.Button value={3}>S3</Radio.Button>
                <Radio.Button value={4}>S4</Radio.Button>
                <Radio.Button value={5}>S5</Radio.Button>
              </Radio.Group>
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
  addCharacter: PropTypes.bool,
}

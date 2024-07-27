import React, { useEffect, useMemo, useState } from 'react'
import { Button, Flex, Form, Modal, Radio } from 'antd'
import { HeaderText } from './HeaderText'
import PropTypes from 'prop-types'
import LightConeSelect from 'components/optimizerTab/optimizerForm/LightConeSelect'
import CharacterSelect from 'components/optimizerTab/optimizerForm/CharacterSelect'
import DB from 'lib/db'

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
        <Flex vertical gap={10}>
          <Flex vertical gap={5}>
            <HeaderText>Character</HeaderText>
            <Form.Item size="default" name="characterId">
              <CharacterSelect
                value=""
                onChange={setCharacterId}
                withIcon={true}
              />
            </Form.Item>
            <Form.Item size="default" name="characterEidolon">
              <Radio.Group
                value={eidolon}
                onChange={(e) => setEidolon(e.target.value)}
                buttonStyle='solid'
                style={{width: '100%', display: 'flex'}}
              >
                <RadioButton text='E0' value={0}/>
                <RadioButton text='E1' value={1}/>
                <RadioButton text='E2' value={2}/>
                <RadioButton text='E3' value={3}/>
                <RadioButton text='E4' value={4}/>
                <RadioButton text='E5' value={5}/>
                <RadioButton text='E6' value={6}/>
              </Radio.Group>
            </Form.Item>
          </Flex>

          <Flex vertical gap={5}>
            <HeaderText>Light cone</HeaderText>
            <Form.Item size="default" name="lightCone">
              <LightConeSelect
                value=""
                characterId={characterId}
                initialPath={initialPath}
              />
            </Form.Item>
            <Form.Item size="default" name="lightConeSuperimposition">
              <Radio.Group
                value={superimposition}
                onChange={(e) => setSuperimposition(e.target.value)}
                buttonStyle='solid'
                style={{width: '100%', display: 'flex'}}
              >
                <RadioButton text='S1' value={1}/>
                <RadioButton text='S2' value={2}/>
                <RadioButton text='S3' value={3}/>
                <RadioButton text='S4' value={4}/>
                <RadioButton text='S5' value={5}/>
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

// Full width radio buttons
function RadioButton(props) {
  return (
    <Radio.Button value={props.value} style={{flex: 1, textAlign: 'center'}}>{props.text}</Radio.Button>
  )
}
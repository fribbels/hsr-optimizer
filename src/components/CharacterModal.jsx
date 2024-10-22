import React, { useEffect, useState } from 'react'
import { Button, Flex, Form, Modal, Radio } from 'antd'
import { HeaderText } from 'components/HeaderText'
import PropTypes from 'prop-types'
import LightConeSelect from 'components/optimizerTab/optimizerForm/LightConeSelect'
import CharacterSelect from 'components/optimizerTab/optimizerForm/CharacterSelect'
import DB from 'lib/db'
import { useTranslation } from 'react-i18next'

export default function CharacterModal(props) {
  const [characterForm] = Form.useForm()
  window.characterForm = characterForm

  const { t } = useTranslation('modals', { keyPrefix: 'EditCharacter' })

  const [characterId, setCharacterId] = useState(props.initialCharacter?.form.characterId || '')
  const [eidolon, setEidolon] = useState(props.initialCharacter?.form.characterEidolon || 0)
  const [superimposition, setSuperimposition] = useState(props.initialCharacter?.form.lightConeSuperimposition || 1)

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

    setCharacterId(props.initialCharacter?.form.characterId)

    characterForm.setFieldsValue(defaultValues)
  }, [props.open])

  function onModalOk() {
    const formValues = characterForm.getFieldsValue()
    console.log('Character modal submitted with form:', formValues)
    props.onOk(formValues)
    props.setOpen(false)
  }

  const handleCancel = () => {
    props.setOpen(false)
  }

  return (
    <Modal
      open={props.open}
      width={400}
      destroyOnClose
      centered
      onOk={onModalOk}
      onCancel={handleCancel}
      footer={[
        <Button key='back' onClick={handleCancel}>
          {t('Cancel')}
        </Button>,
        <Button key='submit' type='primary' onClick={onModalOk}>
          {t('Save')}
        </Button>,
      ]}
    >
      <Form
        form={characterForm}
        preserve={false}
        layout='vertical'
      >
        <Flex vertical gap={10}>
          <Flex vertical gap={5}>
            <HeaderText>{t('Character')}</HeaderText>
            <Form.Item size='default' name='characterId'>
              <CharacterSelect
                value=''
                withIcon={true}
                onChange={(x) => {
                  setCharacterId(x)
                  const eidolonPreselect = DB.getCharacterById(x)?.form?.characterEidolon || 0
                  characterForm.setFieldValue('characterEidolon', eidolonPreselect)
                }}
              />
            </Form.Item>
            <Form.Item size='default' name='characterEidolon'>
              <Radio.Group
                value={eidolon}
                buttonStyle='solid'
                style={{ width: '100%', display: 'flex' }}
              >
                <RadioButton text={t('EidolonButton', { eidolon: 0 })} value={0}/>
                <RadioButton text={t('EidolonButton', { eidolon: 1 })} value={1}/>
                <RadioButton text={t('EidolonButton', { eidolon: 2 })} value={2}/>
                <RadioButton text={t('EidolonButton', { eidolon: 3 })} value={3}/>
                <RadioButton text={t('EidolonButton', { eidolon: 4 })} value={4}/>
                <RadioButton text={t('EidolonButton', { eidolon: 5 })} value={5}/>
                <RadioButton text={t('EidolonButton', { eidolon: 6 })} value={6}/>
              </Radio.Group>
            </Form.Item>
          </Flex>

          <Flex vertical gap={5}>
            <HeaderText>{t('Lightcone')}</HeaderText>
            <Form.Item size='default' name='lightCone'>
              <LightConeSelect
                value=''
                withIcon={true}
                characterId={characterId}
                onChange={() => {
                  characterForm.setFieldValue('lightConeSuperimposition', 1)
                }}
              />
            </Form.Item>
            <Form.Item size='default' name='lightConeSuperimposition'>
              <Radio.Group
                value={superimposition}
                onChange={(e) => setSuperimposition(e.target.value)}
                buttonStyle='solid'
                style={{ width: '100%', display: 'flex' }}
              >
                <RadioButton text={t('SuperimpositionButton', { superimposition: 1 })} value={1}/>
                <RadioButton text={t('SuperimpositionButton', { superimposition: 2 })} value={2}/>
                <RadioButton text={t('SuperimpositionButton', { superimposition: 3 })} value={3}/>
                <RadioButton text={t('SuperimpositionButton', { superimposition: 4 })} value={4}/>
                <RadioButton text={t('SuperimpositionButton', { superimposition: 5 })} value={5}/>
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
    <Radio.Button value={props.value} style={{ flex: 1, textAlign: 'center' }}>{props.text}</Radio.Button>
  )
}

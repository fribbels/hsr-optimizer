import React, { useEffect, useState } from 'react'
import { Button, Flex, Form as AntDForm, Modal, Radio } from 'antd'
import { HeaderText } from 'components/HeaderText'
import LightConeSelect from 'components/optimizerTab/optimizerForm/LightConeSelect'
import CharacterSelect from 'components/optimizerTab/optimizerForm/CharacterSelect'
import DB from 'lib/db'
import { useTranslation } from 'react-i18next'
import { Character } from 'types/Character'
import { Form } from 'types/Form'

export default function CharacterModal(props: {
  open: boolean
  onOk: (form: Form) => void
  setOpen: (open: boolean) => void
  initialCharacter: Character
  addCharacter: boolean
}) {
  const [characterForm] = AntDForm.useForm()

  const { t } = useTranslation('modals', { keyPrefix: 'EditCharacter' })

  const [characterId, setCharacterId] = useState(props.initialCharacter?.form.characterId || '')
  const [eidolon] = useState(props.initialCharacter?.form.characterEidolon || 0)
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
    const formValues = characterForm.getFieldsValue() as Form
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
      <AntDForm
        form={characterForm}
        preserve={false}
        layout='vertical'
      >
        <Flex vertical gap={10}>
          <Flex vertical gap={5}>
            <HeaderText>{t('Character')}</HeaderText>
            <AntDForm.Item name='characterId'>
              <CharacterSelect
                value=''
                withIcon={true}
                onChange={(characterId: string) => {
                  setCharacterId(characterId)
                  const eidolonPreselect = DB.getCharacterById(characterId)?.form?.characterEidolon || 0
                  characterForm.setFieldValue('characterEidolon', eidolonPreselect)
                }}
              />
            </AntDForm.Item>
            <AntDForm.Item name='characterEidolon'>
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
            </AntDForm.Item>
          </Flex>

          <Flex vertical gap={5}>
            <HeaderText>{t('Lightcone')}</HeaderText>
            <AntDForm.Item name='lightCone'>
              <LightConeSelect
                value=''
                withIcon={true}
                characterId={characterId}
                onChange={() => {
                  characterForm.setFieldValue('lightConeSuperimposition', 1)
                }}
              />
            </AntDForm.Item>
            <AntDForm.Item name='lightConeSuperimposition'>
              <Radio.Group
                value={superimposition}
                onChange={(e) => setSuperimposition(e.target.value as number)}
                buttonStyle='solid'
                style={{ width: '100%', display: 'flex' }}
              >
                <RadioButton text={t('SuperimpositionButton', { superimposition: 1 })} value={1}/>
                <RadioButton text={t('SuperimpositionButton', { superimposition: 2 })} value={2}/>
                <RadioButton text={t('SuperimpositionButton', { superimposition: 3 })} value={3}/>
                <RadioButton text={t('SuperimpositionButton', { superimposition: 4 })} value={4}/>
                <RadioButton text={t('SuperimpositionButton', { superimposition: 5 })} value={5}/>
              </Radio.Group>
            </AntDForm.Item>
          </Flex>
        </Flex>
      </AntDForm>
    </Modal>
  )
}

// Full width radio buttons
function RadioButton(props: { text: string; value: number }) {
  return (
    <Radio.Button value={props.value} style={{ flex: 1, textAlign: 'center' }}>{props.text}</Radio.Button>
  )
}

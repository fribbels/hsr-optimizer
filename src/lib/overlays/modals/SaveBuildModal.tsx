import { Button, Form, Input, Modal } from 'antd'
import * as React from 'react'
import { useTranslation } from 'react-i18next'

type CharacterForm = {
  name: string
}

interface NameBuildProps {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  onOk: (characterName: string) => void
}

const NameBuild: React.FC<NameBuildProps> = ({ open, setOpen, onOk }) => {
  const [characterForm] = Form.useForm()

  const { t } = useTranslation('modals', { keyPrefix: 'SaveBuild' })
  const { t: tCommon } = useTranslation('common')

  function onModalOk() {
    const formValues = characterForm.getFieldsValue() as CharacterForm
    onOk(formValues.name)
  }

  const handleCancel = () => {
    setOpen(false)
  }

  const panelWidth = 300

  return (
    <Modal
      open={open}
      width={350}
      destroyOnClose
      centered
      onOk={onModalOk}
      onCancel={handleCancel}
      footer={[
        <Button key='back' onClick={handleCancel}>
          {tCommon('Cancel')/* Cancel */}
        </Button>,
        <Button key='submit' type='primary' onClick={onModalOk}>
          {tCommon('Save')/* Save */}
        </Button>,
      ]}
    >
      <Form form={characterForm} preserve={false} layout='vertical'>
        <Form.Item
          name='name'
          label={t('Label')/* Build name */}
          rules={[{ required: true, message: t('Rule')/* Please input a name */ }]}
          style={{ width: panelWidth }}
        >
          <Input/>
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default NameBuild

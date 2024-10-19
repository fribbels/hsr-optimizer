import * as React from 'react'
import { Button, Form, FormInstance, Input, Modal } from 'antd'
import { useTranslation } from 'react-i18next'

interface NameBuildProps {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  onOk: (x: FormInstance) => void
}

const NameBuild: React.FC<NameBuildProps> = ({ open, setOpen, onOk }) => {
  const [characterForm] = Form.useForm()
  window.characterForm = characterForm

  const { t } = useTranslation('modals', { keyPrefix: 'SaveBuild' })

  function onModalOk() {
    const formValues = characterForm.getFieldsValue()
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
          {t('Cancel')/* Cancel */}
        </Button>,
        <Button key='submit' type='primary' onClick={onModalOk}>
          {t('Save')/* Save */}
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

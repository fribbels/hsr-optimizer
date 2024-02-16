import * as React from 'react'
import { Button, Form, FormInstance, Input, Modal } from 'antd'

interface NameBuildProps {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  onOk: (x: FormInstance) => void
}

const NameBuild: React.FC<NameBuildProps> = ({ open, setOpen, onOk }) => {
  const [characterForm] = Form.useForm()
  window['characterForm'] = characterForm

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
        <Button key="back" onClick={handleCancel}>
          Cancel
        </Button>,
        <Button key="submit" type="primary" onClick={onModalOk}>
          Save
        </Button>,
      ]}
    >
      <Form form={characterForm} preserve={false} layout="vertical">
        <Form.Item
          name="name"
          label="Build name"
          rules={[{ required: true, message: 'Please input a name' }]}
          style={{ width: panelWidth }}
        >
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default NameBuild

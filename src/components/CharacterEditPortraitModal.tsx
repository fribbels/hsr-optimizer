import * as React from 'react'
import { Button, Form, FormInstance, Input, Modal, Steps } from 'antd'

interface CharacterEditPortraitModalProps {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  onOk: (x: FormInstance) => void
}

const CharacterEditPortraitModal: React.FC<CharacterEditPortraitModalProps> = ({
  open,
  setOpen,
  onOk,
}) => {
  const [current, setCurrent] = React.useState(0)
  const [characterPortraitForm] = Form.useForm()

  const handleOk = () => {
    characterPortraitForm.validateFields()
      .then((values) => {
        onOk(values.imageUrl)
        setOpen(false)
        setCurrent(0)
      })
      .catch((e) => {
        console.error('Error:', e)
      })
  }

  const handleCancel = () => {
    setOpen(false)
  }

  const next = () => {
    // TODO: asynchronous logic to determine if the URL leads to an image; doesn't need to be imgur
    const imageUrl = characterPortraitForm.getFieldValue('imageUrl')
    if (imageUrl.includes('imgur.com'))
      setCurrent(current + 1)
    else
      characterPortraitForm.setFields([
        {
          name: 'imageUrl',
          errors: ['Link must be from imgur.com'],
        },
      ])
  }

  const prev = () => {
    setCurrent(current - 1)
  }

  const steps = [
    {
      title: 'URL',
      content: (
        <Form.Item
          name="imageUrl"
          label="Imgur URL"
          rules={[{ required: true, message: 'Please input an Imgur URL' }]}
        >
          <Input />
        </Form.Item>
      ),
    },
    {
      title: 'Crop',
      content: 'Second-content',
    },
    {
      title: 'Confirm',
      content: 'Last-content',
    },
  ]

  return (
    <Modal
      open={open}
      width={350}
      destroyOnClose
      centered
      onOk={handleOk}
      onCancel={handleCancel}
      footer={null}
      title="Edit portrait"
    >
      <Steps current={current} style={{ marginBottom: 12 }}>
        {steps.map((item) => (
          <Steps.Step key={item.title} title={item.title} />
        ))}
      </Steps>
      <Form form={characterPortraitForm} layout="vertical">
        {steps.map((step, index) => (
          <div key={step.title} style={{ display: current === index ? 'block' : 'none' }}>
            {step.content}
          </div>
        ))}
      </Form>
      <div style={{ marginTop: 16 }}>
        {current > 0 && (
          <Button style={{ marginRight: '8px' }} onClick={prev}>
            Previous
          </Button>
        )}
        {current < steps.length - 1 && (
          <Button type="primary" onClick={next}>
            Next
          </Button>
        )}
        {current === steps.length - 1 && (
          <Button type="primary" onClick={handleOk}>
            Submit
          </Button>
        )}
      </div>
    </Modal>
  )
}

export default CharacterEditPortraitModal

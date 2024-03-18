import * as React from 'react'
import { Button, Form, Input, Modal, Steps } from 'antd'
import Cropper from 'react-easy-crop'
import { CroppedArea, CustomImage, CustomImageParams, ImageDimensions, PortraitConfig } from 'types/CharacterCustomImage'
import { DragOutlined, ZoomInOutlined } from '@ant-design/icons'

interface CharacterEditPortraitModalProps {
  currentPortrait: CustomImage | null
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  onOk: (x: PortraitConfig) => void
}

const DEFAULT_IMAGE_DIMENSIONS = { width: 0, height: 0 }
const DEFAULT_CROP = { x: 0, y: 0 }
const DEFAULT_ZOOM = 1
const DEFAULT_CUSTOM_IMAGE_PARAMS = {
  croppedArea: { x: 0, y: 0, width: 0, height: 0 },
  croppedAreaPixels: { x: 0, y: 0, width: 0, height: 0 },
}

const CharacterEditPortraitModal: React.FC<CharacterEditPortraitModalProps> = ({
  currentPortrait,
  open,
  setOpen,
  onOk,
}) => {
  const [current, setCurrent] = React.useState(0)
  const [characterPortraitForm] = Form.useForm()

  const [isVerificationLoading, setIsVerificationLoading] = React.useState(false)
  const [verifiedImageUrl, setVerifiedImageUrl] = React.useState('')
  const [originalDimensions, setOriginalDimensions] = React.useState<ImageDimensions>(currentPortrait ? currentPortrait.originalDimensions : DEFAULT_IMAGE_DIMENSIONS)

  // This library can do rotation too, but it's not implemented for now
  const [crop, setCrop] = React.useState(currentPortrait ? currentPortrait.cropper.crop : DEFAULT_CROP)
  const [zoom, setZoom] = React.useState(currentPortrait ? currentPortrait.cropper.zoom : DEFAULT_ZOOM)
  const [customImageParams, setCustomImageParams] = React.useState<CustomImageParams>(DEFAULT_CUSTOM_IMAGE_PARAMS)

  // Handle initialization depending on if currentPortrait exists:
  // - Reset on close for new character
  // - upon open, load portrait data if it exists
  React.useEffect(() => {
    if (!open) {
      characterPortraitForm.resetFields()
      setCurrent(0)
      setIsVerificationLoading(false)
      setVerifiedImageUrl('')
      setOriginalDimensions(DEFAULT_IMAGE_DIMENSIONS)
      setCrop(DEFAULT_CROP)
      setZoom(DEFAULT_ZOOM)
      setCustomImageParams(DEFAULT_CUSTOM_IMAGE_PARAMS)
    } else if (currentPortrait) {
      characterPortraitForm.setFieldsValue({ imageUrl: currentPortrait.imageUrl })
      setOriginalDimensions(currentPortrait.originalDimensions)
      setCrop(currentPortrait.cropper.crop)
      setZoom(currentPortrait.cropper.zoom)
    }
  }, [open, currentPortrait, characterPortraitForm])

  const onCropComplete = (croppedArea: CroppedArea, croppedAreaPixels: CroppedArea) => {
    // Only allow image parameters to change when in cropping stage
    if (current == 1) {
      setCustomImageParams({ croppedArea, croppedAreaPixels })
    }
  }

  const handleOk = () => {
    console.log(originalDimensions, typeof originalDimensions)
    characterPortraitForm.validateFields()
      .then((values) => {
        onOk({
          type: 'add',
          imageUrl: values.imageUrl,
          originalDimensions,
          customImageParams,
          cropper: {
            zoom,
            crop,
          },
        })
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

  // Verifies that the URL actually links to an image
  async function isValidImageUrl(url: string) {
    setIsVerificationLoading(true)
    // Be careful not to import Image from antd, it'll conflict with this
    const img = new Image()
    img.src = url

    return new Promise((resolve) => {
      setIsVerificationLoading(false)
      img.onerror = () => {
        resolve(false)
      }
      img.onload = async () => {
        const imageBitmap: ImageBitmap = await createImageBitmap(img) // Blob
        setOriginalDimensions({
          width: imageBitmap.width,
          height: imageBitmap.height,
        })
        resolve(true)
      }
    })
  }

  const next = async () => {
    const imageUrl = characterPortraitForm.getFieldValue('imageUrl')
    switch (current) {
      case 0:
        if (await isValidImageUrl(imageUrl)) {
          setVerifiedImageUrl(imageUrl)
          setCurrent(current + 1)
        } else {
          characterPortraitForm.setFields([
            {
              name: 'imageUrl',
              errors: ['Link does not lead to an image'],
            },
          ])
        }
        break
      default:
        console.error(`Stage #${current} not implemented!`)
    }
  }

  const prev = () => {
    setCurrent(current - 1)
  }

  const revert = () => {
    onOk({
      type: 'delete',
    })
  }

  const steps = [
    {
      title: 'URL',
      content: (
        <Form.Item
          name="imageUrl"
          label="Image URL"
          rules={[{ required: true, message: 'Please input a valid image URL' }]}
        >
          <Input autoComplete="off" />
        </Form.Item>
      ),
    },
    {
      title: 'Crop',
      content: (
        <>
          <div style={{ height: '300px', position: 'relative' }}>
            <Cropper
              image={verifiedImageUrl}
              crop={crop}
              zoom={zoom}
              aspect={179 / 428} // portrait container aspect ratio
              onCropChange={setCrop}
              onCropComplete={onCropComplete}
              onZoomChange={setZoom}
            />
          </div>
          <div style={{ marginTop: 8 }}>
            <ZoomInOutlined style={{ marginRight: 8 }} />
            Pinch or scroll to zoom
          </div>
          <div>
            <DragOutlined style={{ marginRight: 8 }} />
            Drag to move
          </div>
        </>
      ),
    },
  ]

  return (
    <Modal
      open={open}
      width={400}
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
          <Button type="primary" onClick={next} disabled={isVerificationLoading}>
            Next
          </Button>
        )}
        {current === steps.length - 1 && (
          <Button type="primary" onClick={handleOk}>
            Submit
          </Button>
        )}
      </div>
      {currentPortrait && (
        <div style={{ marginTop: 16 }}>
          {current === 0 && (
            <Button style={{ marginRight: '8px' }} onClick={revert} danger>
              Revert to default portrait
            </Button>
          )}
        </div>
      )}
    </Modal>
  )
}

export default CharacterEditPortraitModal

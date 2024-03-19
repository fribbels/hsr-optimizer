import * as React from 'react'
import { Button, Form, Input, Modal, Steps } from 'antd'
import Cropper from 'react-easy-crop'
import { CroppedArea, CustomImageConfig, CustomImageParams, ImageDimensions, CustomImageModalConfig } from 'types/CustomImage'
import { DragOutlined, ZoomInOutlined } from '@ant-design/icons'

interface EditImageModalProps {
  currentImage: CustomImageConfig | null // currently existing custom image
  aspectRatio: number // width / height
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  onOk: (_x: CustomImageModalConfig) => void
  title?: string
  width?: number
}

const DEFAULT_IMAGE_DIMENSIONS = { width: 0, height: 0 }
const DEFAULT_CROP = { x: 0, y: 0 }
const DEFAULT_ZOOM = 1
const DEFAULT_CUSTOM_IMAGE_PARAMS = {
  croppedArea: { x: 0, y: 0, width: 0, height: 0 },
  croppedAreaPixels: { x: 0, y: 0, width: 0, height: 0 },
}

const EditImageModal: React.FC<EditImageModalProps> = ({
  currentImage,
  aspectRatio,
  open,
  setOpen,
  onOk,
  title = 'Edit image',
  width = 400,
}) => {
  const [current, setCurrent] = React.useState(0)
  const [customImageForm] = Form.useForm()

  const [isVerificationLoading, setIsVerificationLoading] = React.useState(false)
  const [verifiedImageUrl, setVerifiedImageUrl] = React.useState('')
  const [originalDimensions, setOriginalDimensions] = React.useState<ImageDimensions>(currentImage ? currentImage.originalDimensions : DEFAULT_IMAGE_DIMENSIONS)

  // This library can do rotation too, but it's not implemented for now
  const [crop, setCrop] = React.useState(currentImage ? currentImage.cropper.crop : DEFAULT_CROP)
  const [zoom, setZoom] = React.useState(currentImage ? currentImage.cropper.zoom : DEFAULT_ZOOM)
  const [customImageParams, setCustomImageParams] = React.useState<CustomImageParams>(DEFAULT_CUSTOM_IMAGE_PARAMS)

  // Handle initialization depending on if currentImage exists:
  // - Reset on close for new character
  // - upon open, load custom image data if it exists
  React.useEffect(() => {
    if (!open) {
      customImageForm.resetFields()
      setCurrent(0)
      setIsVerificationLoading(false)
      setVerifiedImageUrl('')
      setOriginalDimensions(DEFAULT_IMAGE_DIMENSIONS)
      setCrop(DEFAULT_CROP)
      setZoom(DEFAULT_ZOOM)
      setCustomImageParams(DEFAULT_CUSTOM_IMAGE_PARAMS)
    } else if (currentImage) {
      customImageForm.setFieldsValue({ imageUrl: currentImage.imageUrl })
      setOriginalDimensions(currentImage.originalDimensions)
      setCrop(currentImage.cropper.crop)
      setZoom(currentImage.cropper.zoom)
    }
  }, [open, currentImage, customImageForm])

  const onCropComplete = (croppedArea: CroppedArea, croppedAreaPixels: CroppedArea) => {
    // Only allow image parameters to change when in cropping stage
    if (current == 1) {
      setCustomImageParams({ croppedArea, croppedAreaPixels })
    }
  }

  const handleOk = () => {
    customImageForm.validateFields()
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
    const imageUrl = customImageForm.getFieldValue('imageUrl')
    switch (current) {
      case 0:
        if (!imageUrl) {
          customImageForm.setFields([
            {
              name: 'imageUrl',
              errors: ['An image URL is required'],
            },
          ])
        } else {
          if (await isValidImageUrl(imageUrl)) {
            setVerifiedImageUrl(imageUrl)
            setCurrent(current + 1)
          } else {
            customImageForm.setFields([
              {
                name: 'imageUrl',
                errors: ['URL does not lead to an image'],
              },
            ])
          }
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
      title: 'Enter URL',
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
      title: 'Crop Image',
      content: (
        <>
          <div style={{ height: '300px', position: 'relative' }}>
            <Cropper
              image={verifiedImageUrl}
              crop={crop}
              zoom={zoom}
              aspect={aspectRatio}
              onCropChange={setCrop}
              onCropComplete={onCropComplete}
              onZoomChange={(newZoom) => {
                const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
                if (!isMobile) {
                  if (newZoom < zoom) {
                    setZoom(Math.max(1, zoom * 0.95))
                  }
                  if (newZoom > zoom) {
                    setZoom(Math.min(3, zoom * 1.05))
                  }
                } else {
                  setZoom(newZoom)
                }
              }}
              zoomSpeed={0.0001}
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
      width={width}
      destroyOnClose
      centered
      onOk={handleOk}
      onCancel={handleCancel}
      footer={null}
      title={title}
    >
      <Steps current={current} style={{ marginBottom: 12 }}>
        {steps.map((item) => (
          <Steps.Step key={item.title} title={item.title} />
        ))}
      </Steps>
      <Form form={customImageForm} layout="vertical">
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
      {currentImage && current === 0 && (
        <div style={{ marginTop: 16 }}>
          <Button style={{ marginRight: '8px' }} onClick={revert} danger>
            Revert to default image
          </Button>
        </div>
      )}
    </Modal>
  )
}

export default EditImageModal

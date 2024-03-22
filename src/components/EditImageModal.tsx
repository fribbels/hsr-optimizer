import * as React from 'react'
import { Button, Flex, Form, Input, Modal, Radio, RadioChangeEvent, Steps, UploadFile, UploadProps } from 'antd'
import Cropper from 'react-easy-crop'
import { CroppedArea, CustomImageConfig, CustomImageParams, ImageDimensions } from 'types/CustomImage'
import { DragOutlined, InboxOutlined, ZoomInOutlined } from '@ant-design/icons'
import Dragger from 'antd/es/upload/Dragger'
import { Message } from 'lib/message'

interface EditImageModalProps {
  currentImage: CustomImageConfig | null // currently existing custom image
  aspectRatio: number // width / height
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  onOk: (_x: CustomImageConfig) => void
  title?: string
  width?: number
  defaultImageUrl?: string // default image, passed in to this component to edit its config
}

const IMGUR_API_ENDPOINT = 'https://api.imgur.com/3/image'
const CLIENT_ID = '0e6801babd5cc0e'

const DEFAULT_IMAGE_DIMENSIONS = { width: 0, height: 0 }
const DEFAULT_CROP = { x: 0, y: 0 }
const DEFAULT_ZOOM = 1
const DEFAULT_CUSTOM_IMAGE_PARAMS = {
  croppedArea: { x: 0, y: 0, width: 0, height: 0 },
  croppedAreaPixels: { x: 0, y: 0, width: 0, height: 0 },
}
const MIN_ZOOM = 1
const MAX_ZOOM = 5

const EditImageModal: React.FC<EditImageModalProps> = ({
  currentImage,
  aspectRatio,
  open,
  setOpen,
  onOk,
  title = 'Edit image',
  width = 400,
  defaultImageUrl,
}) => {
  const [current, setCurrent] = React.useState(0)
  const [customImageForm] = Form.useForm()

  const [isVerificationLoading, setIsVerificationLoading] = React.useState(false)
  const [verifiedImageUrl, setVerifiedImageUrl] = React.useState('')
  const [originalDimensions, setOriginalDimensions] = React.useState<ImageDimensions>(currentImage ? currentImage.originalDimensions : DEFAULT_IMAGE_DIMENSIONS)

  // This library can do rotation too, but it's not implemented for now
  const [crop, setCrop] = React.useState(currentImage ? currentImage.cropper.crop : DEFAULT_CROP)
  const [zoom, setZoom] = React.useState(currentImage ? currentImage.cropper.zoom : DEFAULT_ZOOM)
  const [customImageParams, setCustomImageParams] = React.useState<CustomImageParams>(currentImage ? currentImage.customImageParams : DEFAULT_CUSTOM_IMAGE_PARAMS)

  const [radio, setRadio] = React.useState<'upload' | 'url' | 'default'>('upload')

  const [uploadedFile, setUploadedFile] = React.useState<UploadFile>()

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
      setRadio('url') // If there's a currentImage, then there will always be a url
      setCurrent(1)
      setVerifiedImageUrl(currentImage.imageUrl)
      setOriginalDimensions(currentImage.originalDimensions)
    }
  }, [defaultImageUrl, open, currentImage, customImageForm])

  const onCropComplete = (croppedArea: CroppedArea, croppedAreaPixels: CroppedArea) => {
    // Only allow image parameters to change when in cropping stage
    if (current == 1) {
      setCustomImageParams({ croppedArea, croppedAreaPixels })
    }
  }

  const handleOk = () => {
    switch (radio) {
      case 'upload':
        break
      case 'url':
        customImageForm.validateFields()
          .then((values) => {
            onOk({
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
        break
      case 'default':
        if (!defaultImageUrl) {
          console.warn('defaultImageUrl does not exist, but default image was chosen. This should not happen.')
        }
        onOk({
          imageUrl: defaultImageUrl ?? '',
          originalDimensions,
          customImageParams,
          cropper: {
            zoom,
            crop,
          },
        })
        setOpen(false)
        setCurrent(0)
    }
  }

  const handleCancel = () => {
    setOpen(false)
  }

  // Verifies that the URL actually links to an image
  async function isValidImageUrl(url: string) {
    // Sometimes copying an image address that isn't full loaded will copy the base64
    // We don't want that, so checking here to make sure this is actually a URL
    if (!url.includes('http')) {
      return false
    }

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

  // Checks if CORS policy allows fetching the image
  // Screenshot functionality wont work if CORS blocks the fetch
  async function isCORSallowedImageUrl(url: string) {
    try {
      const response = await fetch(url, {
        method: 'HEAD',
        mode: 'cors',
      })
      return response.ok
    } catch (error) {
      console.warn('CORS policy blocked the fetch, attempting to upload to imgur')
      return false
    }
  }

  /************************************************
  IMPORTANT:
    When testing this on localhost, you WILL run into a 429 / 403 issue.
    This is because Imgur API hates localhost for some reason.
    https://stackoverflow.com/questions/66195106/imgur-api-responding-with-code-403-with-server-error-429
  WORKAROUND:
    1) start vite using `HOST=0.0.0.0 npm run start` instead of `npm run start`
    2) Use http://127.0.0.1:3000/hsr-optimizer instead of http://localhost:3000/hsr-optimizer
  HOWEVER:
    You will not be able to access i.imgur.com/... links using 127.0.0.1,
    So the immediate next step of cropping will not work as expected.
    https://stackoverflow.com/questions/43895390/imgur-images-returning-403
  SUMMARY:
    These Imgur restrictions are incredibly annoying to test with in development,
    however it should have no impact in production.
  *************************************************/
  const uploadToImgurByUrl = async (imageUrl: string) => {
    const formData = new FormData()
    formData.append('image', imageUrl)

    try {
      setIsVerificationLoading(true)
      const response = await fetch(IMGUR_API_ENDPOINT, {
        method: 'POST',
        headers: {
          Authorization: `Client-ID ${CLIENT_ID}`,
        },
        body: formData,
      })
      if (!response.ok) {
        const errorData = await response.json()
        setIsVerificationLoading(false)
        throw new Error(`Imgur API error: ${errorData.data.error}`)
      }
      const data = await response.json()
      if (data.success) {
        const imgurLink = data.data.link
        setVerifiedImageUrl(imgurLink)
        setCurrent(current + 1)
        setIsVerificationLoading(false)
      } else {
        setIsVerificationLoading(false)
        throw new Error('Image upload to Imgur failed but did not return a typical error response')
      }
    } catch (error) {
      setIsVerificationLoading(false)
      console.error('There was an error uploading the image to Imgur:', error)
      return null
    }
  }

  const validateInputImageUrl = async (imageUrl: string) => {
    if (!imageUrl) {
      customImageForm.setFields([
        {
          name: 'imageUrl',
          errors: ['An image URL is required'],
        },
      ])
    } else {
      setIsVerificationLoading(true)
      if (await isValidImageUrl(imageUrl)) {
        if (await isCORSallowedImageUrl(imageUrl)) {
          // When CORS is allowed, image URLs can just be saved
          setVerifiedImageUrl(imageUrl)
          setCurrent(current + 1)
        } else {
          // When CORS is blocked, upload image to Imgur
          const imgurUrl = await uploadToImgurByUrl(imageUrl)
          if (imgurUrl) {
            setVerifiedImageUrl(imgurUrl)
            setCurrent(current + 1)
          } else {
            customImageForm.setFields([
              {
                name: 'imageUrl',
                errors: ['Failed to process image, upload image instead.'],
              },
            ])
          }
        }
      } else {
        customImageForm.setFields([
          {
            name: 'imageUrl',
            errors: ['URL does not lead to an image'],
          },
        ])
      }
      setIsVerificationLoading(false)
    }
  }

  const validateInputImageFile = async (imageFile: any) => {
    // TODO: Handle file upload
    // TODO: check if file is actually an image
    customImageForm.setFieldValue('imageFile', imageFile)
  }

  const next = async () => {
    switch (current) {
      case 0:
        switch (radio) {
          case 'upload':
            // validateInputImageFile(imageFile)
            break
          case 'url':
            validateInputImageUrl(customImageForm.getFieldValue('imageUrl'))
            break
          case 'default':
            if (defaultImageUrl) {
              if (await isValidImageUrl(defaultImageUrl)) {
                setVerifiedImageUrl(defaultImageUrl)
                setCurrent(current + 1)
              }
            } else {
              console.warn('defaultImageUrl does not exist, but default image was chosen. This should not happen.')
            }
            break
          case null:
          default:
            console.warn("Radio select must be either 'upload' or 'url'")
        }
        break
      default:
        console.error(`Stage #${current} not implemented!`)
    }
  }

  const prev = () => {
    setCurrent(current - 1)
  }

  const onRadioChange = (e: RadioChangeEvent) => {
    setRadio(e.target.value)
  }

  const uploadProps: UploadProps = {
    name: 'file',
    multiple: false,
    accept: 'image/png, image/jpeg, image/jpg',
    // TODO: Imgur upload link here
    // action: 'https://run.mocky.io/v3/435e224c-44fb-4773-9faf-380c5e6a2188',
    // action: (file) => Promise<string>,
    onChange(info) {
      const { status } = info.file
      console.log('info', info)
      if (status !== 'uploading') {
        console.log(info.file, info.fileList)
      }
      if (status === 'done') {
        Message.success(`${info.file.name} file uploaded successfully.`)
      } else if (status === 'error') {
        Message.error(`${info.file.name} file upload failed.`)
      }
    },
    onDrop(e) {
      console.log('Dropped files', e.dataTransfer.files)
    },
  }

  const steps = [
    {
      title: 'Provide image',
      content: (
        <>
          <Flex justify="center" style={{ marginBottom: 16 }}>
            <Radio.Group onChange={onRadioChange} value={radio} buttonStyle="solid">
              <Radio.Button value="upload">Upload image file</Radio.Button>
              <Radio.Button value="url">Enter image URL</Radio.Button>
              {defaultImageUrl && <Radio.Button value="default">Use default image</Radio.Button>}
            </Radio.Group>
          </Flex>
          {radio === 'upload' && (
            <Dragger {...uploadProps}>
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">Click or drag file to this area to upload</p>
              <p className="ant-upload-hint">
                Accepts .jpg .jpeg .png (Max: 20MB)
              </p>
            </Dragger>
          )}
          {radio === 'url' && (
            <Form.Item
              name="imageUrl"
              label="Image URL"
              rules={[{ required: true, message: 'Please input a valid image URL' }]}
            >
              <Input autoComplete="off" />
            </Form.Item>
          )}
          {radio === 'default' && (
            <Flex justify="center" style={{ height: '400px' }}>
              <img src={defaultImageUrl} />
            </Flex>
          )}
        </>
      ),
    },
    {
      title: 'Crop image',
      content: (
        <>
          <div style={{ height: '400px', position: 'relative' }}>

            <Cropper
              image={verifiedImageUrl}
              crop={crop}
              zoom={zoom}
              objectFit="cover"
              aspect={aspectRatio}
              onCropChange={setCrop}
              onCropComplete={onCropComplete}
              // Use this to set initial cropper values
              onMediaLoaded={() => {
                if (currentImage) {
                  setCrop(currentImage.cropper.crop)
                  setZoom(currentImage.cropper.zoom)
                  // setRotation(currentImage.cropper.rotation)
                }
              }}
              onZoomChange={(newZoom) => {
                const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
                if (!isMobile) {
                  if (newZoom < zoom) {
                    setZoom(Math.max(MIN_ZOOM, zoom * 0.95))
                  }
                  if (newZoom > zoom) {
                    setZoom(Math.min(MAX_ZOOM, zoom * 1.05))
                  }
                } else {
                  setZoom(newZoom)
                }
              }}
              zoomSpeed={0.0001}
              minZoom={MIN_ZOOM}
              maxZoom={MAX_ZOOM}
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
      footer={[
        <Flex key={1} justify="flex-end">
          <div style={{ marginTop: 16 }}>
            {(current > 0 && !currentImage) && (
              <Button style={{ marginRight: '8px' }} onClick={prev}>
                Previous
              </Button>
            )}
            {current < steps.length - 1 && (
              <Button type="primary" onClick={next} loading={isVerificationLoading}>
                Next
              </Button>
            )}
            {current === steps.length - 1 && (
              <Button type="primary" onClick={handleOk}>
                Submit
              </Button>
            )}
          </div>

        </Flex>,
      ]}
      title={title}
    >
      <div style={{ height: currentImage ? '400px' : '460px', position: 'relative' }}>
        {!currentImage
        && (
          <Steps current={current} style={{ marginBottom: 12 }}>
            {steps.map((item) => (
              <Steps.Step key={item.title} title={item.title} />
            ))}
          </Steps>
        )}
        <Form form={customImageForm} layout="vertical">
          {steps.map((step, index) => (
            <div key={step.title} style={{ display: current === index ? 'block' : 'none' }}>
              {step.content}
            </div>
          ))}
        </Form>
      </div>
    </Modal>
  )
}

export default EditImageModal

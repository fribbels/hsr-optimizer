import { DragOutlined, InboxOutlined, ZoomInOutlined } from '@ant-design/icons'
import { Button, Flex, Form, Input, Modal, Radio, RadioChangeEvent, Slider, Spin, Steps, Typography } from 'antd'
import { RcFile } from 'antd/es/upload'
import Dragger from 'antd/es/upload/Dragger'
import i18next from 'i18next'
import { Message } from 'lib/interactions/message'
import * as React from 'react'
import Cropper from 'react-easy-crop'
import { useTranslation } from 'react-i18next'
import { CroppedArea, CustomImageConfig, CustomImageParams, CustomImagePayload, ImageDimensions } from 'types/customImage'

const { Text } = Typography

interface EditImageModalProps {
  existingConfig: CustomImageConfig | undefined // currently existing custom image
  aspectRatio: number // width / height
  open: boolean
  setOpen: (b: boolean) => void
  onOk: (_x: CustomImagePayload) => void
  title?: string
  width?: number
  defaultImageUrl?: string // default image, passed in to this component to edit its config
}

const IMGUR_API_ENDPOINT = 'https://api.imgur.com/3/image'
// https://api.imgur.com/oauth2/addclient
const CLIENT_ID = 'ab10eb1e9600924'

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
  existingConfig,
  aspectRatio,
  open,
  setOpen,
  onOk,
  title = i18next.t('modals:EditImage.DefaultTitle')/* Edit image */,
  width = 400,
  defaultImageUrl,
}) => {
  const [current, setCurrent] = React.useState(0)
  const [customImageForm] = Form.useForm()

  const { t } = useTranslation('modals', { keyPrefix: 'EditImage' })
  const { t: tCommon } = useTranslation('common')

  const [isVerificationLoading, setIsVerificationLoading] = React.useState(false)
  const [verifiedImageUrl, setVerifiedImageUrl] = React.useState('')
  const [originalDimensions, setOriginalDimensions] = React.useState<ImageDimensions>(existingConfig ? existingConfig.originalDimensions : DEFAULT_IMAGE_DIMENSIONS)

  const [crop, setCrop] = React.useState(existingConfig ? existingConfig.cropper.crop : DEFAULT_CROP)
  const [zoom, setZoom] = React.useState(existingConfig ? existingConfig.cropper.zoom : DEFAULT_ZOOM)
  const [customImageParams, setCustomImageParams] = React.useState<CustomImageParams>(existingConfig ? existingConfig.customImageParams : DEFAULT_CUSTOM_IMAGE_PARAMS)

  const [radio, setRadio] = React.useState<'upload' | 'url' | 'default'>('url')

  const resetConfig = React.useCallback(() => {
    customImageForm.resetFields()
    setCurrent(0)
    setIsVerificationLoading(false)
    setVerifiedImageUrl('')
    setOriginalDimensions(DEFAULT_IMAGE_DIMENSIONS)
    setCrop(DEFAULT_CROP)
    setZoom(DEFAULT_ZOOM)
    setCustomImageParams(DEFAULT_CUSTOM_IMAGE_PARAMS)
  }, [customImageForm])

  // Handle initialization depending on if existingConfig exists:
  // - Reset on close for new character
  // - upon open, load custom image config if it exists
  React.useEffect(() => {
    if (!open) {
      resetConfig()
    } else if (existingConfig) {
      customImageForm.setFieldsValue({ imageUrl: existingConfig.imageUrl, artistName: existingConfig.artistName })
      setRadio('url')
      setCurrent(1)
      setVerifiedImageUrl(existingConfig.imageUrl)
      setOriginalDimensions(existingConfig.originalDimensions)
    }
  }, [defaultImageUrl, open, existingConfig, customImageForm, resetConfig])

  const onCropComplete = (croppedArea: CroppedArea, croppedAreaPixels: CroppedArea) => {
    if (current == 1) {
      setCustomImageParams({ croppedArea, croppedAreaPixels })
    }
  }

  const handleOk = () => {
    const artistName: string = customImageForm.getFieldValue('artistName') as string
    const baseConfig = {
      originalDimensions,
      customImageParams,
      cropper: {
        zoom,
        crop,
      },
    }
    switch (radio) {
      case 'upload':
        onOk({
          type: 'add',
          config: {
            ...baseConfig,
            artistName: artistName,
            imageUrl: verifiedImageUrl,
          } as CustomImageConfig,
        })
        setCurrent(0)
        break
      case 'url':
        customImageForm.validateFields()
          .then((values) => {
            onOk({
              type: 'add',
              config: {
                ...baseConfig,
                imageUrl: values.imageUrl,
                artistName: artistName,
              } as CustomImageConfig,
            })
          })
          .catch((e) => {
            console.error('Error:', e)
          })
          .finally(() => {
            setCurrent(0)
          })
        break
      case 'default':
        if (!defaultImageUrl) {
          console.error('defaultImageUrl does not exist, but default image was chosen.')
        }
        onOk({
          type: 'delete',
          config: {} as CustomImageConfig,
        })
        setOpen(false)
        setCurrent(0)
        break
      default:
        console.warn(`Unexpected radio value: ${radio}`)
        setOpen(false)
        setCurrent(0)
    }
  }

  // Verifies that the URL actually links to an image
  async function isValidImageUrl(url: string) {
    // Sometimes copying an image address that isn't fully loaded will copy the base64
    // We don't want that, so checking here to make sure this is actually a URL
    if (!url.includes('http')) {
      return false
    }

    setIsVerificationLoading(true)
    const img = new Image() // Be careful not to import Image from antd, it'll conflict with this
    img.src = url

    return new Promise((resolve) => {
      setIsVerificationLoading(false)
      img.onerror = () => resolve(false)
      img.onload = async () => {
        const imageBitmap: ImageBitmap = await createImageBitmap(img)
        setOriginalDimensions({
          width: imageBitmap.width,
          height: imageBitmap.height,
        })
        resolve(true)
      }
    })
  }

  // Verifies that the uploaded file is actually an image
  async function isValidImageFile(file: RcFile): Promise<boolean> {
    setIsVerificationLoading(true)

    return new Promise((resolve) => {
      const fileReader = new FileReader()
      fileReader.onerror = () => {
        setIsVerificationLoading(false)
        resolve(false)
      }
      fileReader.onload = (e) => {
        const img = new Image()
        img.src = e.target?.result as string
        img.onload = async () => {
          setOriginalDimensions({
            width: img.width,
            height: img.height,
          })
          setIsVerificationLoading(false)
          resolve(true)
        }
        img.onerror = () => {
          setIsVerificationLoading(false)
          resolve(false)
        }
      }
      fileReader.readAsDataURL(file)
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
      console.log('CORS blocked image fetch, uploading to imgur:', url)
      return false
    }
  }

  /************************************************
   IMPORTANT:
   When testing this on localhost, you WILL run into a 429 / 403 issue.
   This is because Imgur API hates localhost for some reason.
   https://stackoverflow.com/questions/66195106/imgur-api-responding-with-code-403-with-server-error-429
   WORKAROUND:
   In vite.config.ts:
   server: {
     open: true,
     host: '127.0.0.1',
     port: 3000,
     allowedHosts: ['testlocalhost.com'],
   },
   Add `127.0.0.1 testlocalhost.com` to windows hosts file, then use testlocalhost.com:3000
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
      if (data.data.width && data.data.height) {
        setOriginalDimensions({ width: data.data.width, height: data.data.height })
      }
      if (data.success) {
        const imgurLink = data.data.link
        setVerifiedImageUrl(imgurLink)
        setCurrent(current + 1)
        setIsVerificationLoading(false)
      } else {
        setIsVerificationLoading(false)
        throw new Error('Image url upload to Imgur failed but did not return a typical error response')
      }
    } catch (error) {
      setIsVerificationLoading(false)
      console.error('There was an error uploading the image to Imgur:', error)
      return null
    }
  }

  const uploadToImgurByFile = async (file: RcFile): Promise<string | null> => {
    const formData = new FormData()
    formData.append('image', file)

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
      if (data.data.width && data.data.height) {
        setOriginalDimensions({ width: data.data.width, height: data.data.height })
      }
      if (data.success) {
        const imgurLink = data.data.link
        setIsVerificationLoading(false)
        return imgurLink
      } else {
        setIsVerificationLoading(false)
        throw new Error('Image file upload to Imgur failed but did not return a typical error response')
      }
    } catch (error) {
      console.error('There was an error uploading the image to Imgur:', error)
      setIsVerificationLoading(false)
      return null
    }
  }

  const handleBeforeUpload = async (file: RcFile) => {
    // Check if the file is not a valid image file
    if (!(await isValidImageFile(file))) {
      console.error('File is not a valid image file')
      return false
    }

    // Attempt to upload the file to Imgur
    const imgurLink = await uploadToImgurByFile(file)
    if (!(imgurLink)) {
      Message.error('Image upload failed')
      return false
    }

    // If everything goes well, set the verified image URL and go to next step
    setVerifiedImageUrl(imgurLink)
    setCurrent(current + 1)
    return false // Prevent the default upload behavior
  }

  const validateInputImageUrl = async (imageUrl: string) => {
    // Check if imageUrl is provided
    if (!imageUrl) {
      customImageForm.setFields([
        {
          name: 'imageUrl',
          errors: ['An image URL is required'],
        },
      ])
      return
    }

    setIsVerificationLoading(true)

    // Check if the imageUrl is not valid and return early
    if (!(await isValidImageUrl(imageUrl))) {
      customImageForm.setFields([
        {
          name: 'imageUrl',
          errors: ['URL does not lead to an image'],
        },
      ])
      setIsVerificationLoading(false)
      return
    }

    if (await isCORSallowedImageUrl(imageUrl)) {
      // When CORS is allowed, image URLs can just be saved
      setVerifiedImageUrl(imageUrl)
      setCurrent(current + 1)
    } else {
      // Attempt to upload image to Imgur when CORS is blocked
      const imgurUrl = await uploadToImgurByUrl(imageUrl)
      if (imgurUrl) {
        // Upload successful -> set the verified image URL and go to next step
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
    setIsVerificationLoading(false)
  }

  const next = async () => {
    if (current !== 0) {
      console.error(`Stage #${current} not implemented!`)
      return
    }
    switch (radio) {
      // case 'upload':
      // This isn't handled because uploading a file will go to next step
      case 'url':
        await validateInputImageUrl(customImageForm.getFieldValue('imageUrl'))
        break
      case 'default':
        onOk({
          type: 'delete',
          config: {} as CustomImageConfig,
        })
        setOpen(false)
        break
      case null:
      default:
        console.warn('Radio select must be either \'upload\' or \'url\'')
        break
    }
  }

  const prev = () => setCurrent(current - 1)
  const onRadioChange = (e: RadioChangeEvent) => setRadio(e.target.value)

  const steps = [
    {
      title: 'Provide image', // translation of this happens later on
      content: (
        <>
          <Flex justify='center' style={{ marginBottom: 16 }}>
            <Radio.Group onChange={onRadioChange} value={radio} buttonStyle='solid'>
              <Radio.Button value='upload'>{t('Upload.Radio.Upload')/* Upload image */}</Radio.Button>
              <Radio.Button value='url'>{t('Upload.Radio.Url')/* Enter image URL */}</Radio.Button>
              {defaultImageUrl && <Radio.Button value='default'>{t('Upload.Radio.Default')/* Use default image */}</Radio.Button>}
            </Radio.Group>
          </Flex>

          {radio === 'upload' && (
            <>
              <Dragger
                name='file'
                multiple={false}
                accept='image/png, image/jpeg, image/jpg, image/gif'
                beforeUpload={handleBeforeUpload}
                disabled={isVerificationLoading}
                showUploadList={false}
              >
                {isVerificationLoading
                  ? (
                    <Flex style={{ height: '300px' }} justify='center' align='center'>
                      <Spin size='large'/>
                    </Flex>
                  )
                  : (
                    <Flex style={{ height: '300px' }} justify='center' align='center' vertical>
                      <p className='ant-upload-drag-icon'>
                        <InboxOutlined/>
                      </p>
                      <p className='ant-upload-text'>{t('Upload.Upload.Method')/* Click or drag image file to this area to upload */}</p>
                      <p className='ant-upload-hint'>{t('Upload.Upload.Limit')/* Accepts .jpg .jpeg .png .gif (Max: 20MB) */}</p>
                    </Flex>
                  )}
              </Dragger>
            </>
          )}

          {radio === 'url' && (
            <Form.Item
              name='imageUrl'
              label={t('Upload.Url.Label')/* Image */}
              style={{ margin: '0 20px' }}
              rules={[{ required: true, message: t('Upload.Url.Rule')/* Please input a valid image URL */ }]}
            >
              <Input autoComplete='off'/>
            </Form.Item>
          )}

          {radio === 'default' && (
            <Flex justify='center' style={{ height: '400px' }}>
              <img src={defaultImageUrl}/>
            </Flex>
          )}
        </>
      ),
    },
    {
      title: 'Crop image', // translated later on
      content: (
        <>
          <div style={{ height: '380px', position: 'relative' }}>
            <Cropper
              image={verifiedImageUrl}
              crop={crop}
              zoom={zoom}
              // objectFit="cover"
              aspect={aspectRatio}
              onCropChange={setCrop}
              onCropComplete={onCropComplete}
              // Use this to set initial cropper values
              onMediaLoaded={() => {
                if (existingConfig) {
                  setCrop(existingConfig.cropper.crop)
                  setZoom(existingConfig.cropper.zoom)
                }
              }}
              onZoomChange={(newZoom) => {
                if (navigator.maxTouchPoints === 0) {
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
              zoomSpeed={navigator.maxTouchPoints === 0 ? 0.0001 : 1}
              minZoom={MIN_ZOOM}
              maxZoom={MAX_ZOOM}
            />
          </div>
          <Flex style={{ width: '100%', marginTop: 4 }} gap={8} align='center'>
            <label style={{ whiteSpace: 'nowrap' }}>
              {t('Edit.Zoom')/* Zoom */}
            </label>
            <Slider
              style={{ width: '100%' }}
              min={MIN_ZOOM}
              max={MAX_ZOOM}
              step={0.1}
              tooltip={{
                formatter: null,
              }}
              onChange={setZoom}
              value={zoom}
            />
          </Flex>
          <Flex style={{ marginTop: 0 }}>
            <Flex vertical style={{ flex: 1 }}>
              <div>
                <DragOutlined style={{ marginRight: 8 }}/>
                {t('Edit.Drag')/* Drag to move */}
              </div>
              <div style={{ flex: 1, marginTop: 8 }}>
                <ZoomInOutlined style={{ marginRight: 8 }}/>
                {t('Edit.Pinch')/* Pinch or scroll to zoom */}
              </div>
            </Flex>
            <Flex vertical style={{ flex: 1 }}>
              <Text style={{ flex: 1, marginLeft: 3 }}>
                {t('Edit.ArtBy')/* (Optional) Art by: */}
              </Text>
              <Form.Item
                name='artistName'
              >
                <Input
                  style={{ flex: 1, marginTop: 3 }}
                  placeholder={t('Edit.CreditPlaceholder')/* Credit the artist if possible */}
                  autoComplete='off'
                />
              </Form.Item>
            </Flex>
          </Flex>
        </>
      ),
    },
  ]

  return (
    <Form form={customImageForm} layout='vertical'>
      <Modal
        open={open}
        width={width}
        destroyOnClose
        centered
        // It's easy to overshoot the zoom slider and accidentally close modal
        maskClosable={false}
        onOk={handleOk}
        onCancel={() => setOpen(false)}
        transitionName=''
        footer={[
          <Flex key={1} justify='flex-end'>
            <Flex style={{ marginTop: 16 }} justify='center' align='center' gap={8}>
              {isVerificationLoading && radio !== 'upload' && <Spin style={{ textAlign: 'center' }} size='large'/>}
              <Button onClick={() => setOpen(false)}>
                {tCommon('Cancel')/* Cancel */}
              </Button>
              {(current > 0 && existingConfig) && (
                <Button onClick={prev} danger>
                  {t('Footer.Change')/* Change image */}
                </Button>
              )}
              {(current > 0 && !existingConfig) && (
                <Button onClick={prev}>
                  {t('Footer.Previous')/* Previous */}
                </Button>
              )}
              {current < steps.length - 1 && (
                <Button type='primary' onClick={next} disabled={radio === 'upload'}>
                  {t('Footer.Next')/* Next */}
                </Button>
              )}
              {current === steps.length - 1 && (
                <Button type='primary' onClick={handleOk}>
                  {tCommon('Submit')/* Submit */}
                </Button>
              )}
            </Flex>
          </Flex>,
        ]}
        title={title}
      >
        <div style={{ height: '505px', position: 'relative' }}>
          {!existingConfig
          && (
            <Steps current={current} style={{ marginBottom: 12 }}>
              {steps.map((item) => (// make this cleaner if ever adding more steps
                <Steps.Step key={item.title} title={item.title == 'Provide image' ? t('Upload.Title')/* Provide image */ : t('Edit.Title')/* Crop image */}/>
              ))}
            </Steps>
          )}
          {steps.map((step, index) => (
            <div key={step.title} style={{ display: current === index ? 'block' : 'none' }}>
              {step.content}
            </div>
          ))}
        </div>
      </Modal>
    </Form>
  )
}

export default EditImageModal

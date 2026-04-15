import {
  Button,
  Flex,
  Loader,
  Modal,
  SegmentedControl,
  Slider,
  Stepper,
  TextInput,
} from '@mantine/core'
import {
  Dropzone,
  IMAGE_MIME_TYPE,
} from '@mantine/dropzone'
import { useForm } from '@mantine/form'
import {
  IconGripVertical,
  IconInbox,
  IconZoomIn,
} from '@tabler/icons-react'
import i18next from 'i18next'
import { Message } from 'lib/interactions/message'
import styles from 'lib/overlays/modals/EditImageModal.module.css'
import {
  DEFAULT_CROP,
  DEFAULT_CUSTOM_IMAGE_PARAMS,
  DEFAULT_IMAGE_DIMENSIONS,
  DEFAULT_ZOOM,
  isCORSallowedImageUrl,
  isValidImageFile,
  isValidImageUrl,
  MAX_ZOOM,
  MIN_ZOOM,
  uploadToImgur,
  validateFileSize,
  validateUrlFileSize,
} from 'lib/overlays/modals/editImageUtils'
import * as React from 'react'
import Cropper from 'react-easy-crop'
import { useTranslation } from 'react-i18next'
import type {
  CroppedArea,
  CustomImageConfig,
  CustomImageParams,
  CustomImagePayload,
  ImageDimensions,
} from 'types/customImage'

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

export const EditImageModal: React.FC<EditImageModalProps> = ({
  existingConfig,
  aspectRatio,
  open,
  setOpen,
  onOk,
  title = i18next.t('modals:EditImage.DefaultTitle'), /* Edit image */
  width = 400,
  defaultImageUrl,
}) => {
  const [current, setCurrent] = React.useState(0)
  const customImageForm = useForm({
    initialValues: {
      imageUrl: '',
      artistName: '',
    },
  })

  const { t } = useTranslation('modals', { keyPrefix: 'EditImage' })
  const { t: tCommon } = useTranslation('common')

  const [isVerificationLoading, setIsVerificationLoading] = React.useState(false)
  const [verifiedImageUrl, setVerifiedImageUrl] = React.useState('')
  const [originalDimensions, setOriginalDimensions] = React.useState<ImageDimensions>(
    existingConfig ? existingConfig.originalDimensions : DEFAULT_IMAGE_DIMENSIONS,
  )

  const [crop, setCrop] = React.useState(existingConfig ? existingConfig.cropper.crop : DEFAULT_CROP)
  const [zoom, setZoom] = React.useState(existingConfig ? existingConfig.cropper.zoom : DEFAULT_ZOOM)
  const [customImageParams, setCustomImageParams] = React.useState<CustomImageParams>(
    existingConfig ? existingConfig.customImageParams : DEFAULT_CUSTOM_IMAGE_PARAMS,
  )

  const [radio, setRadio] = React.useState<'upload' | 'url' | 'default'>('url')

  const resetConfig = React.useCallback(() => {
    customImageForm.reset()
    setCurrent(0)
    setIsVerificationLoading(false)
    setVerifiedImageUrl('')
    setOriginalDimensions(DEFAULT_IMAGE_DIMENSIONS)
    setCrop(DEFAULT_CROP)
    setZoom(DEFAULT_ZOOM)
    setCustomImageParams(DEFAULT_CUSTOM_IMAGE_PARAMS)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Handle initialization depending on if existingConfig exists:
  // - Reset on close for new character
  // - upon open, load custom image config if it exists
  React.useEffect(() => {
    if (!open) {
      resetConfig()
    } else if (existingConfig) {
      customImageForm.setValues({ imageUrl: existingConfig.imageUrl, artistName: existingConfig.artistName })
      setRadio('url')
      setCurrent(1)
      setVerifiedImageUrl(existingConfig.imageUrl)
      setOriginalDimensions(existingConfig.originalDimensions)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultImageUrl, open, existingConfig])

  const onCropComplete = (croppedArea: CroppedArea, croppedAreaPixels: CroppedArea) => {
    if (current === 1) {
      setCustomImageParams({ croppedArea, croppedAreaPixels })
    }
  }

  const handleOk = () => {
    const artistName: string = customImageForm.getValues().artistName
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
      case 'url': {
        const validation = customImageForm.validate()
        if (!validation.hasErrors) {
          onOk({
            type: 'add',
            config: {
              ...baseConfig,
              imageUrl: verifiedImageUrl,
              artistName: artistName,
            } as CustomImageConfig,
          })
        }
        setCurrent(0)
        break
      }
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

  const handleBeforeUpload = async (file: File) => {
    const t = i18next.getFixedT(null, 'charactersTab', 'Messages')

    // Check file size first
    const sizeValidation = validateFileSize(file)
    if (!sizeValidation.valid) {
      Message.error(sizeValidation.error!)
      return false
    }

    // Check if the file is not a valid image file
    setIsVerificationLoading(true)
    const imageResult = await isValidImageFile(file)
    if (!imageResult.valid) {
      setIsVerificationLoading(false)
      console.error('File is not a valid image file')
      Message.error(t('InvalidFile'))
      return false
    }
    if (imageResult.dimensions) {
      setOriginalDimensions(imageResult.dimensions)
    }

    // Attempt to upload the file to Imgur
    const imgurResult = await uploadToImgur(file)
    setIsVerificationLoading(false)
    if (!imgurResult) {
      Message.error(t('ImageUploadFailed'))
      return false
    }
    if (imgurResult.dimensions) {
      setOriginalDimensions(imgurResult.dimensions)
    }

    // If everything goes well, set the verified image URL and go to next step
    setVerifiedImageUrl(imgurResult.link)
    setCurrent(current + 1)
    return false // Prevent the default upload behavior
  }

  const validateInputImageUrl = async (imageUrl: string) => {
    // Check if imageUrl is provided
    if (!imageUrl) {
      customImageForm.setFieldError('imageUrl', 'An image URL is required')
      return
    }

    setIsVerificationLoading(true)

    // Check if the imageUrl is not valid and return early
    const imageResult = await isValidImageUrl(imageUrl)
    if (!imageResult.valid) {
      customImageForm.setFieldError('imageUrl', 'URL does not lead to an image')
      setIsVerificationLoading(false)
      return
    }
    if (imageResult.dimensions) {
      setOriginalDimensions(imageResult.dimensions)
    }

    if (await isCORSallowedImageUrl(imageUrl)) {
      // When CORS is allowed, image URLs can just be saved
      setVerifiedImageUrl(imageUrl)
      setCurrent(current + 1)
    } else {
      // Validate file size before uploading to imgur
      const sizeValidation = await validateUrlFileSize(imageUrl)
      if (!sizeValidation.valid) {
        customImageForm.setFieldError('imageUrl', sizeValidation.error!)
        setIsVerificationLoading(false)
        return
      }

      // Attempt to upload image to Imgur when CORS is blocked
      const imgurResult = await uploadToImgur(imageUrl)
      if (imgurResult) {
        // Upload successful -> set the verified image URL and go to next step
        setVerifiedImageUrl(imgurResult.link)
        if (imgurResult.dimensions) {
          setOriginalDimensions(imgurResult.dimensions)
        }
        setCurrent(current + 1)
      } else {
        customImageForm.setFieldError('imageUrl', 'Failed to process image, upload image instead.')
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
        await validateInputImageUrl(customImageForm.getValues().imageUrl)
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
  const onRadioChange = (value: string) => setRadio(value as 'upload' | 'url' | 'default')

  const steps = [
    {
      title: 'Provide image', // translation of this happens later on
      content: (
        <>
          <div className={styles.segmentedControlWrapper}>
            <SegmentedControl
              fullWidth
              onChange={onRadioChange}
              value={radio}
              data={[
                { label: t('Upload.Radio.Upload'), /* Upload image */ value: 'upload' },
                { label: t('Upload.Radio.Url'), /* Enter image URL */ value: 'url' },
                ...(defaultImageUrl ? [{ label: t('Upload.Radio.Default'), /* Use default image */ value: 'default' }] : []),
              ]}
            />
          </div>

          {radio === 'upload' && (
            <>
              <Dropzone
                className={styles.dropzone}
                accept={IMAGE_MIME_TYPE}
                onDrop={(files) => void handleBeforeUpload(files[0])}
                disabled={isVerificationLoading}
                multiple={false}
              >
                {isVerificationLoading
                  ? (
                    <Flex className={styles.dropzoneArea} justify='center' align='center'>
                      <Loader size='lg' />
                    </Flex>
                  )
                  : (
                    <Flex className={styles.dropzoneArea} justify='center' align='center' direction='column'>
                      <p>
                        <IconInbox />
                      </p>
                      <p>{t('Upload.Upload.Method') /* Click or drag image file to this area to upload */}</p>
                      <p className={styles.dimmedText}>{t('Upload.Upload.Limit') /* Accepts .jpg .jpeg .png .gif .webp (Max: 20MB) */}</p>
                    </Flex>
                  )}
              </Dropzone>
            </>
          )}

          {radio === 'url' && (
            <div className={styles.urlInputWrapper}>
              <TextInput
                label={t('Upload.Url.Label') /* Image */}
                autoComplete='off'
                {...customImageForm.getInputProps('imageUrl')}
              />
            </div>
          )}

          {radio === 'default' && (
            <Flex justify='center' className={styles.defaultImagePreview}>
              <img src={defaultImageUrl} />
            </Flex>
          )}
        </>
      ),
    },
    {
      title: 'Crop image', // translated later on
      content: (
        <>
          <div className={styles.cropperContainer}>
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
          <Flex className={styles.zoomRow} gap={8} align='center'>
            <label className={styles.zoomLabel}>
              {t('Edit.Zoom') /* Zoom */}
            </label>
            <Slider
              className={styles.zoomSlider}
              min={MIN_ZOOM}
              max={MAX_ZOOM}
              step={0.1}
              label={null}
              onChange={setZoom}
              value={zoom}
            />
          </Flex>
          <div className={styles.editInfoRow}>
            <div className={styles.hintGroup}>
              <div className={styles.hintRow}>
                <IconGripVertical size={18} />
                {t('Edit.Drag') /* Drag to move */}
              </div>
              <div className={styles.hintRow}>
                <IconZoomIn size={18} />
                {t('Edit.Pinch') /* Pinch or scroll to zoom */}
              </div>
            </div>
            <div className={styles.artistGroup}>
              <div className={styles.artistLabel}>
                {t('Edit.ArtBy') /* (Optional) Art by: */}
              </div>
              <TextInput
                placeholder={t('Edit.CreditPlaceholder') /* Credit the artist if possible */}
                autoComplete='off'
                {...customImageForm.getInputProps('artistName')}
              />
            </div>
          </div>
        </>
      ),
    },
  ]

  return (
    <div>
      <Modal
        opened={open}
        size={width}
        centered
        // It's easy to overshoot the zoom slider and accidentally close modal
        closeOnClickOutside={false}
        onClose={() => setOpen(false)}
        title={title}
      >
        <div className={styles.modalContent}>
          {!existingConfig
            && (
              <Stepper active={current} className={styles.stepper}>
                {steps.map((item) => ( // make this cleaner if ever adding more steps
                  <Stepper.Step
                    key={item.title}
                    label={item.title == 'Provide image' ? t('Upload.Title') /* Provide image */ : t('Edit.Title') /* Crop image */}
                  />
                ))}
              </Stepper>
            )}
          {steps.map((step, index) => (
            <div key={step.title} style={{ display: current === index ? 'block' : 'none' }}>
              {step.content}
            </div>
          ))}
        </div>
        <Flex key={1} justify='flex-end'>
          <Flex className={styles.footerActions} justify='center' align='center' gap={8}>
            <Button onClick={() => setOpen(false)}>
              {tCommon('Cancel') /* Cancel */}
            </Button>
            {(current > 0 && existingConfig) && (
              <Button onClick={prev} color='red'>
                {t('Footer.Change') /* Change image */}
              </Button>
            )}
            {(current > 0 && !existingConfig) && (
              <Button onClick={prev}>
                {t('Footer.Previous') /* Previous */}
              </Button>
            )}
            {current < steps.length - 1 && (
              <Button onClick={next} loading={isVerificationLoading && radio !== 'upload'} disabled={radio === 'upload'}>
                {t('Footer.Next') /* Next */}
              </Button>
            )}
            {current === steps.length - 1 && (
              <Button onClick={handleOk}>
                {tCommon('Submit') /* Submit */}
              </Button>
            )}
          </Flex>
        </Flex>
      </Modal>
    </div>
  )
}

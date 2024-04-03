export type CroppedArea = {
  x: number // x displacement from top left, changes on crop
  y: number // y displacement from top left, changes on crop
  width: number // cropped area width, changes on zoom
  height: number // cropped area height, changes on zoom
}

export type CustomImageParams = {
  croppedArea: CroppedArea
  croppedAreaPixels: CroppedArea
}

export type ImageDimensions = {
  width: number
  height: number
}

export type CustomImageConfig = {
  imageUrl: string
  originalDimensions: ImageDimensions
  customImageParams: CustomImageParams
  cropper: {
    zoom: number
    crop: {
      x: number
      y: number
    }
  }
  artistName: string
}

export type CustomImagePayload = ({
  type: 'add'
} & CustomImageConfig) | { type: 'delete' }

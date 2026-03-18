import { Badge } from '@mantine/core'
import { Constants } from 'lib/constants/constants'
import { Assets } from 'lib/rendering/assets'
import iconClasses from 'style/icons.module.css'
import type { ReactNode } from 'react'
import type { ReactElement } from 'types/components'
import classes from './OrnamentSetTagRenderer.module.css'

// NOTE: Be careful hot-reloading with this file, can cause Db to wipe. Unsure why yet
export function OrnamentSetTagRenderer(props: {
  value: string,
  label: ReactNode,
  closable: boolean,
  onClose: () => void,
}): ReactElement {
  const { value, label, closable, onClose } = props

  const processedLabel = typeof label === 'string' ? label.replace(/[^0-9+]/g, '') : null

  if (!value) {
    return (
      <Badge>
        {processedLabel}
      </Badge>
    )
  }

  return (
    <Badge className={classes.badge}>
      <img title={value} src={Assets.getSetImage(value, Constants.Parts.PlanarSphere)} className={iconClasses.icon24} />
    </Badge>
  )
}

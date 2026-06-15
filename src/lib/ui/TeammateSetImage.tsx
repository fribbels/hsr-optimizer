import { Tooltip } from '@mantine/core'
import { iconSize } from 'lib/constants/constantsUi'
import { Assets } from 'lib/rendering/assets'
import {
  getTeammateOption,
  isRelicOption,
} from 'lib/sets/setConfigRegistry'
import { useTranslation } from 'react-i18next'

export function TeammateSetImageWithTooltip({ value, removed }: { value: string, removed?: boolean }) {
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'TeammateCard' })
  const height = iconSize
  const width = iconSize
  const option = getTeammateOption(value)
  if (!option) return null
  const desc = option.desc(t)
  return (
    <Tooltip label={desc}>
      <div style={{ display: 'flex', gap: 3, opacity: removed ? 0.5 : undefined }}>
        <img src={Assets.getSetImage(value)} style={{ width, height }} />
        {isRelicOption(value) && <img src={Assets.getSetImage(value)} style={{ width, height }} />}
      </div>
    </Tooltip>
  )
}

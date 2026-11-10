import {
  Badge,
  Button,
} from '@mantine/core'
import { Assets } from 'lib/rendering/assets'
import classes from 'lib/tabs/tabWarp/SkinBannerButton.module.css'
import tableClasses from 'lib/tabs/tabWarp/WarpCalculatorTab.module.css'
import type { SkinBanner } from 'lib/tabs/tabWarp/warpSkinBanners'

export function SkinBannerButton({ banner, onClick, disabled }: {
  banner: SkinBanner,
  onClick: () => void,
  disabled?: boolean,
}) {
  return (
    <Button
      variant='outline'
      size='xs'
      classNames={{ root: classes.root, inner: classes.inner, label: classes.label }}
      style={{
        backgroundImage: `linear-gradient(to right, transparent 25%, rgba(0, 0, 0, 0.75)), url("${Assets.getSkinBanner(banner.image)}")`,
      }}
      disabled={disabled}
      onClick={onClick}
    >
      <Badge color='#000000aa' className={`${tableClasses.goalBadge} ${classes.badge}`}>
        Add {banner.label} skin
      </Badge>
    </Button>
  )
}

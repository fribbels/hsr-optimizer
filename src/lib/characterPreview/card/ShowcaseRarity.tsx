import { Assets } from 'lib/rendering/assets'
import iconClasses from 'style/icons.module.css'

export function ShowcaseRarity({ rarity = 0 }: { rarity?: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {Array.from({ length: rarity }, (_, i) => <img src={Assets.getStar()} key={i} className={iconClasses.icon20} />)}
    </div>
  )
}

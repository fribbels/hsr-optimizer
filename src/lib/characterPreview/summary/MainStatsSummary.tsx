import { type MainStats, Parts } from 'lib/constants/constants'
import { Assets } from 'lib/rendering/assets'
import { useTranslation } from 'react-i18next'
import classes from './MainStatsSummary.module.css'

type MainStatEntry = {
  part: string
  stat: string
}

export function MainStatsSummary({ simBody, simFeet, simPlanarSphere, simLinkRope }: {
  simBody: string
  simFeet: string
  simPlanarSphere: string
  simLinkRope: string
}) {
  const { t } = useTranslation('common')

  const entries: MainStatEntry[] = [
    { part: Parts.Body, stat: simBody ? t(`ReadableStats.${simBody as MainStats}`) : '' },
    { part: Parts.Feet, stat: simFeet ? t(`ReadableStats.${simFeet as MainStats}`) : '' },
    { part: Parts.PlanarSphere, stat: simPlanarSphere ? t(`ReadableStats.${simPlanarSphere as MainStats}`) : '' },
    { part: Parts.LinkRope, stat: simLinkRope ? t(`ReadableStats.${simLinkRope as MainStats}`) : '' },
  ]

  return (
    <div className={classes.container}>
      <div className={classes.list}>
        {entries.map((e) => (
          <div key={e.part} className={classes.row}>
            <img src={Assets.getPart(e.part)} className={classes.partImage} />
            <span className={classes.statName}>{e.stat?.replace('Boost', '') || ''}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

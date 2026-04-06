import { type MainStats, Parts } from 'lib/constants/constants'
import { Assets } from 'lib/rendering/assets'
import { useTranslation } from 'react-i18next'
import classes from './MainStatsSummary.module.css'

const mainStatParts = [Parts.Body, Parts.Feet, Parts.PlanarSphere, Parts.LinkRope] as const

export function MainStatsSummary({ simBody, simFeet, simPlanarSphere, simLinkRope }: {
  simBody: string
  simFeet: string
  simPlanarSphere: string
  simLinkRope: string
}) {
  const { t } = useTranslation('common')
  const statByPart = [simBody, simFeet, simPlanarSphere, simLinkRope]

  return (
    <div className={classes.container}>
      <div className={classes.list}>
        {mainStatParts.map((part, i) => {
          const stat = statByPart[i]
          const display = stat ? t(`ReadableStats.${stat as MainStats}`).replace('Boost', '') : ''
          return (
            <div key={part} className={classes.row}>
              <img src={Assets.getPart(part)} className={classes.partImage} />
              <span className={classes.statName}>{display}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

import { ReactElement } from 'react'
import { ReliquaryArchiverConfig } from 'lib/importer/importConfig'
import { ColorizedLink } from '../common/ColorizedLink'
import { useTranslation } from 'react-i18next'

export function ReliquaryDescription(): ReactElement {
  const { t } = useTranslation('importSaveTab', { keyPrefix: 'import.stage1.reliquarydesc' })
  return (
    <>
      {true && (
        <li>
          <b>{t('title')}</b> (
          <ColorizedLink text={t('link')} url={ReliquaryArchiverConfig.releases}/>
          )
          <ul>
            <li><b style={{ color: '#ffaa4f' }}>{t('offlinemsg', { version: 2.5 })}</b></li>
            {/* <li><b style={{ color: '#82e192' }}>{t('onlinemsg', { version: 2.5 })}</b></li> */}
            <li>{t('l1')}</li>
            <li>{t('l2')}</li>
          </ul>
        </li>
      )}
    </>
  )
}

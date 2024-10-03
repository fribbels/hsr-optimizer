import { ReactElement } from 'react'
import { ReliquaryArchiverConfig } from 'lib/importer/importConfig'
import { ColorizedLink } from '../common/ColorizedLink'
import { useTranslation } from 'react-i18next'

export function ReliquaryDescription(): ReactElement {
  const { t } = useTranslation('importSaveTab', { keyPrefix: 'Import.Stage1.ReliquaryDesc' })
  return (
    <>
      {true && (
        <li>
          <b>{t('Title')/* (Recommended) IceDynamix Reliquary Archiver */}</b> (
          <ColorizedLink text={t('Link')/* Github */} url={ReliquaryArchiverConfig.releases}/>
          )
          <ul>
            {/* <li><b style={{ color: '#ffaa4f' }}>{t('OfflineMsg', { version: 2.5 })}</b></li> */}
            <li><b style={{ color: '#82e192' }}>{t('OnlineMsg', { version: 2.5 })}</b></li>
            <li>{t('l1')/* Inaccurate speed decimals, 5-10 minutes OCR scan */}</li>
            <li>{t('l2')/* Imports full inventory and character roster */}</li>
          </ul>
        </li>
      )}
    </>
  )
}

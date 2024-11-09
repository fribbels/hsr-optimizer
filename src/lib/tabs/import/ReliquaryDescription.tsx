import { ReactElement } from 'react'
import { ReliquaryArchiverConfig } from 'lib/importer/importConfig'
import { useTranslation } from 'react-i18next'
import { ColorizedLinkWithIcon } from 'components/common/ColorizedLink'

export function ReliquaryDescription(): ReactElement {
  const { t } = useTranslation('importSaveTab', { keyPrefix: 'Import.Stage1.ReliquaryDesc' })
  return (
    <>
      <li>
        <b>{t('Title')/* (Recommended) IceDynamix Reliquary Archiver */}</b> (
        <ColorizedLinkWithIcon text={t('Link')/* Github */} url={ReliquaryArchiverConfig.releases} linkIcon={true}/>
        )
        <ul>
          {/* <li><b style={{ color: '#ffaa4f' }}>{t('OfflineMsg', { version: 2.6 })}</b></li> */}
          <li><b style={{ color: '#82e192' }}>{t('OnlineMsg', { version: 2.6 })}</b></li>
          <li>{t('l1')/* Inaccurate speed decimals, 5-10 minutes OCR scan */}</li>
          <li>{t('l2')/* Imports full inventory and character roster */}</li>
        </ul>
      </li>
    </>
  )
}

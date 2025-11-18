import { ReliquaryArchiverConfig } from 'lib/importer/importConfig'
import { ColorizedLinkWithIcon } from 'lib/ui/ColorizedLink'
import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'

export function ReliquaryDescription(): ReactElement {
  const { t } = useTranslation('importSaveTab', { keyPrefix: 'Import.Stage1.ReliquaryDesc' })
  return (
    <>
      <li>
        <b>{t('Title') /* (Recommended) IceDynamix Reliquary Archiver */}</b>{' '}
        (<ColorizedLinkWithIcon text={t('Link') /* Github */} url={ReliquaryArchiverConfig.releases} linkIcon={true} />)
        <ul>
          {/*<li>*/}
          {/*  <b style={{ color: '#ffaa4f' }}>{t('OfflineMsg', { version: 3.7 })}</b>*/}
          {/*</li>*/}
          <li>
            <b style={{ color: '#82e192' }}>{t('OnlineMsg', { version: '3.7' })}</b>
          </li>
          <li>{t('l1') /* Inaccurate speed decimals, 5-10 minutes OCR scan */}</li>
          <li>{t('l2') /* Imports full inventory and character roster */}</li>
          <li>{t('l3') /* Supports live importing (new/enhanced relics are imported in real time) */}</li>
        </ul>
      </li>
    </>
  )
}

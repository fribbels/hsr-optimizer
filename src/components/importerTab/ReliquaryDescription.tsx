import { ReactElement } from 'react'
import { ReliquaryArchiverConfig } from 'lib/importer/importConfig'
import { ColorizedLink } from '../common/ColorizedLink'

export function ReliquaryDescription(): ReactElement {
  return (
    <>
      {true && (
        <li>
          <b>(Recommended) IceDynamix Reliquary Archiver</b> (
          <ColorizedLink text="Github" url={ReliquaryArchiverConfig.releases} />
          )
          <ul>
            <li>Accurate speed decimals, instant scan</li>
            <li>Imports full inventory and character roster</li>
          </ul>
        </li>
      )}
    </>
  )
}

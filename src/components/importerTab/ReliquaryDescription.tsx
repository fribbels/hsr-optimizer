import { ReactElement } from 'react'
import { ReliquaryArchiverConfig } from 'lib/importer/importConfig'
import { ColorizedLink } from '../common/ColorizedLink'

export function ReliquaryDescription(): ReactElement {
  return (
    <>
      {!window.officialOnly && (
        <li>
          IceDynamix Reliquary Archiver (
          <ColorizedLink text="Github" url={ReliquaryArchiverConfig.releases} />
          )
          <ul>
            <li>Network scanner</li>
            <li>Imports accurate speed decimals for the entire inventory</li>
            <li>Beta release (run as admin) - might not work for all machines, please report bugs to the discord server</li>
          </ul>
        </li>
      )}
    </>
  )
}

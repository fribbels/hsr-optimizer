import { ReactElement } from 'react'
import { ReliquaryArchiverConfig } from 'lib/importer/importConfig'
import { ColorizedLink } from '../common/ColorizedLink'

export function ReliquaryDescription(): ReactElement {
  return (
    <>
      {true && (
        <li>
          {'(Recommended) IceDynamix Reliquary Archiver'} (
          <ColorizedLink text="Github" url={ReliquaryArchiverConfig.releases}/>
          )
          <ul>
            <li>Network scanner</li>
            <li>Imports accurate speed decimals for the entire inventory</li>
            <li>Beta release - run from command line if exe doesn't work, please report bugs to the Discord server</li>
          </ul>
        </li>
      )}
    </>
  )
}

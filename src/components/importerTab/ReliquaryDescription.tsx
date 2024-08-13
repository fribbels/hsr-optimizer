import { ReactElement } from 'react'
import { ReliquaryArchiverConfig } from 'lib/importer/importConfig'
import { ColorizedLink } from '../common/ColorizedLink'

export function ReliquaryDescription(): ReactElement {
  return (
    <>
      {true && (
        <li>
          <b>(Recommended) IceDynamix Reliquary Archiver</b> (
          <ColorizedLink text="Github" url={ReliquaryArchiverConfig.releases}/>
          )
          <ul>
            {/*<li><b style={{ color: '#ffaa4f' }}>***** Status: Down for maintenance after 2.4 patch *****</b></li>*/}
            <li><b style={{ color: '#82e192' }}>Status: Updated for patch 2.4, new download required</b></li>
            <li><b style={{ color: '#ffaa4f' }}>Note: March and Trailblazer imports do not work currently, new version with fix coming soon</b></li>
            <li>Accurate speed decimals, instant scan</li>
            <li>Imports full inventory and character roster</li>
          </ul>
        </li>
      )}
    </>
  )
}

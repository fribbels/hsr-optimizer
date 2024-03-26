import React from 'react'
import { Button, Divider, Flex, Popconfirm, Typography } from 'antd'
import { Message } from 'lib/message'

import sampleSave from '../data/sample-save.json'
import DB, { AppPages } from '../lib/db'
import PropTypes from 'prop-types'
import { Assets } from 'lib/assets'
import { KelzScannerConfig, ReliquaryArchiverConfig } from 'lib/importer/importConfig'
import { ImportOutlined } from '@ant-design/icons'
import { ColorizedLink } from 'components/common/ColorizedLink'

const { Text } = Typography

export default function GettingStartedTab() {
  console.log('GettingStartedTab ')

  function tryItOutClicked() {
    DB.setStore(JSON.parse(JSON.stringify(sampleSave)))

    Message.success('Successfully loaded data')
  }

  let screenshotStyle = { border: '2px solid #243356' }
  let dividerStyle = { marginTop: 40 }
  let titleStyle = { textDecoration: 'underline' }
  return (
    <div>
      <Text>
        <Flex vertical gap={5} style={{ marginLeft: 20, marginBottom: 50, width: 1000 }}>
          <h2>
            Try it out!
          </h2>

          <p>
            If you would like to give the optimizer a try before doing any relic importing, use this to load a sample save file and check out the features.
          </p>

          <Popconfirm
            title="Confirm"
            description="Load a sample save file?"
            onConfirm={tryItOutClicked}
            placement="bottom"
            okText="Yes"
            cancelText="Cancel"
          >
            <Button type="primary" icon={<ImportOutlined />} style={{ width: 200 }}>
              Try it out!
            </Button>
          </Popconfirm>

          <Divider style={dividerStyle}></Divider>

          {/* ======================================================================================================================= */}

          <h2>
            Importing
          </h2>

          <p>
            The optimizer needs a database of relics to run against. Install and run one of the relic scanner options:
          </p>

          <ul>
            <li>
              Kel-Z HSR Scanner (
              <ColorizedLink text="Github" url={KelzScannerConfig.releases} />
              )
              <ul>
                <li>OCR scanner</li>
                <li>Supports all 16:9 screen resolutions</li>
              </ul>
            </li>
            {false && (
              <li>
                IceDynamix Reliquary Archiver (
                <ColorizedLink text="Github" url={ReliquaryArchiverConfig.releases} />
                )
                <ul>
                  <li>Network scanner</li>
                  <li>Imports accurate speed decimals</li>
                  <li>Beta release - might not work for all machines, please report bugs to the discord server</li>
                </ul>
              </li>
            )}
            <li>
              Relic Scorer Import (
              <span onClick={() => window.store.getState().setActiveKey(AppPages.RELIC_SCORER)}>
                <ColorizedLink text="Relic scorer" />
              </span>
              )
              <ul>
                <li>No download needed, but limited to relics from the 8 characters on profile showcase</li>
                <li>Imports accurate speed decimals</li>
              </ul>
            </li>
          </ul>

          <Divider style={dividerStyle}></Divider>
          {/* ======================================================================================================================= */}

          <h2>
            Optimizer tab
          </h2>

          <img src={Assets.getGuideImage('filters')} style={screenshotStyle}></img>

          <h4 style={titleStyle}>
            Character / Light cone
          </h4>
          <p>
            This section is where the character and light cone options are selected.
            Both of the level options affect the base stats for the optimization search.
            Character eidolon effects are selectable from the Character passives section.
          </p>

          <h4 style={titleStyle}>
            Main Stats
          </h4>

          <p>
            The main stat filters restrict the input for the optimizer to the preferred body, feet, planar sphere, and link rope stats. Multiple options can be chosen for each slot.
            In most cases, these main stats should be filled in to find best results and exclude unwanted builds.
          </p>

          <h4 style={titleStyle}>
            Set filters
          </h4>

          <img src={Assets.getGuideImage('sets')} style={screenshotStyle}></img>

          <p>
            The relic set filter allows for a combination of 2-piece sets, 4-piece sets, or can be left empty.
            When multiple options are chosen, the search results will only show builds with least one of the selected filters active.
            Conditional set effects can be customized from the menu.
          </p>

          <h4 style={titleStyle}>
            Stat filters
          </h4>

          <p>
            This section defines the minimum / maximum stats to filter the results by.
            Left side is minimum and right side is maximum, both inclusive. In this above example, only results with &ge; 134 speed AND &ge; 35% Crit Rate  are shown.
            Stat abbreviations are ATK / HP / DEF / SPD / Crit Rate / Crit Damage / Effect Hit Rate / Effect RES / Break Effect.
          </p>

          <p>
            Important note: relics typed in manually or imported with the OCR tool may be affected by hidden decimal points for speed that aren't shown by ingame stats.
            For example, 5 star relics can have speed substats of values between 2.0 - 2.6, which would all show ingame as 2.
            This means that speed results should be treated as minimum values, as the real value may be slightly higher ingame.
            This also means that maximum filters on speed should be used carefully since they may be too restrictive.
          </p>

          <h4 style={titleStyle}>
            Combat buffs
          </h4>

          <p>
            This section defines buffs to the character to be used in the optimization calculations.
            These buffs can come from teammate abilities/light cones etc.
            Only team buffs should be entered here since the selected character's own passives should already be accounted for.
          </p>

          <h4 style={titleStyle}>
            Optimizer options
          </h4>

          <p>
            This section defines some general additional options for the optimizer and control actions.
          </p>

          <ul>
            <li>Rank filter - Rank characters by dragging them on the character page, and when enabled, characters may only take relics from lower ranked characters. This is useful for cases where multiple characters use the same set, but one character should be prioritized over the other.</li>
            <li>Maxed main stat - Assume the main stat for relics are maxed for their respective grades</li>
            <li>Keep current relics - The character must keep its currently equipped relics, and the optimizer will try to fill in empty slots</li>
            <li>
              Enhance / grade - Select the minimum enhance to search for and minimum stars for relics to include. If using non +15 relics, the 'Maxed main stat' filter might be good to enable to show maxed potential stats.
              Be careful selecting +0 relics because this increases search time if you imported all relics.
            </li>
          </ul>

          <Divider style={dividerStyle}></Divider>
          {/* ======================================================================================================================= */}

          <h2>
            Results
          </h2>

          <img src={Assets.getGuideImage('results')} style={screenshotStyle}></img>

          <h4 style={titleStyle}>
            Result rows
          </h4>

          <p>
            This section displays all the results found that match the filters.
            Every row represents one build that was found.
            The pinned top row shows the character's currently equipped build.
            Clicking on each row will show the relics used in the selected build.
            There may be multiple pages of results, so clicking a column header to sort the results by a stat or rating can make it easier to find desired builds.
          </p>

          <h4 style={titleStyle}>
            Permutations
          </h4>

          <p>
            This section shows the number of permutations the optimizer has to search and details on the number of matching relics per slot.
            If any of the numbers are zero, that indicates that no relics were found that would satisfy the constraints.
          </p>

          <ul>
            <li>Perms - Number of permutations that need to be searched. Stricter filters will reduce permutations and search time</li>
            <li>Searched - Number of permutations completed in an in-progress search</li>
            <li>Results - Number of displayed results that satisfy the stat filters</li>
          </ul>

          <h4 style={titleStyle}>
            Selected build
          </h4>
          <p>
            This section displays the selected build from the grid, and which relics are used & who they are currently equipped on.
            Pressing the 'Equip' button will assign the relics to the selected character in the optimizer, though the ingame character build is not affected.
          </p>

          <Divider style={dividerStyle}></Divider>
          {/* ======================================================================================================================= */}

          <h2>
            Character tab
          </h2>

          <img src={Assets.getGuideImage('characterTab')} style={screenshotStyle}></img>

          <h4 style={titleStyle}>
            Character ranking
          </h4>

          <p>
            This section displays all the optimized characters and their ranking order.
            Characters are added to this list from the Optimizer tab, when their filters are applied and 'Start' is pressed.
          </p>

          <p>
            The ranking is important when used with the 'Rank filter' on the Optimizer tab.
            When enabled, characters may only take relics from lower ranked characters.
            For example, the rank 2 character may take relics from rank 3, but cannot take from rank 2. Rank 1 can take from any other character.
            Rows can be dragged to re-order characters.
          </p>

          <p>
            The colored highlight on the right of the grid shows the equipped item status of the character.
            In the above example, Jingliu's green indicator means she has all 6 relics equipped, Bronya's yellow indicator means she is missing at least one relic from her build, and Natasha's red indicator means she has no relics equipped.
          </p>

          <h4 style={titleStyle}>
            Stats summary
          </h4>

          <p>
            This section displays the character's stats with their base stats / light cone / maxed traces / and relics equipped in the optimizer.
            Note that similar to the optimizer results, the actual values ingame may be slightly higher than displayed here due to hidden decimal values on relic stats.
          </p>

          <Divider style={dividerStyle}></Divider>
          {/* ======================================================================================================================= */}

          <h2>
            Relics tab
          </h2>

          <img src={Assets.getGuideImage('relicsTab')} style={screenshotStyle}></img>

          <h4 style={titleStyle}>
            Relics grid
          </h4>

          <p>
            This section displays all the relics that were added / imported into the optimizer.
            Relics should be updated occasionally with the importer to add in newly acquired relics.
            Clicking columns will sort the relics grid.
          </p>
        </Flex>
      </Text>
    </div>
  )
}
GettingStartedTab.propTypes = {
  active: PropTypes.bool,
}

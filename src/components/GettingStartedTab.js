import React, { useState } from 'react';
import { UploadOutlined, DownloadOutlined, AppstoreOutlined, MailOutlined, SettingOutlined } from '@ant-design/icons';
import { Button, Popconfirm, message, Flex, Upload, Radio, Tabs, Typography, Steps, theme, Divider } from 'antd';
import { OcrParserFribbels1 } from '../lib/ocrParserFribbels1';
import { Message } from '../lib/message';

import sampleSave from '../data/sample-save.json';

const { Text } = Typography;

export default function GettingStartedTab({style}) {
  console.log('GettingStartedTab ')

  function tryItOutClicked() {
    DB.setStore(JSON.parse(JSON.stringify(sampleSave)))

    Message.success('Successfully loaded data')
  }

  let screenshotStyle = {border: '2px solid #243356'};
  let dividerStyle = {marginTop: 40};
  let titleStyle = {textDecoration: 'underline'}
  return (
    <div style={style}>
    <Text>
      <Flex vertical gap={5} style={{marginLeft: 20, marginBottom: 50, width: 1000}}>
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
            <Button type="primary" style={{width: 200}}>
              Try it out!
            </Button>
          </Popconfirm>


          <Divider style={dividerStyle}></Divider>
          {/* ======================================================================================================================= */}

          <h2>
            Importing
          </h2>

          <p>
            The optimizer needs a dataset of relics to run against.
            Currently there are 2 supported OCR relic scanners:
          </p>

          <ul>
            <li>
              Recommended: Kel-Z HSR Scanner (<Typography.Link target="_blank" href='https://github.com/kel-z/HSR-Scanner/releases/latest'>Github</Typography.Link>)
              <ul>
                <li>Supports all 16:9 resolutions</li>
              </ul>
            </li>
            <li>
              Fribbels HSR Scanner (<Typography.Link target="_blank" href='https://github.com/fribbels/Fribbels-Honkai-Star-Rail-Scanner/releases/latest'>Github</Typography.Link>)
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
            The character eidolon option does not currently affect optimization results, but the light cone superimposition will impact final stats based on the unconditional stat increases on the light cone.
            For example the Amber light cone at S5 gives 32% DEF unconditionally but an additional conditional 32% def at under 50% hp, so only the first 32% is applied to character's final stats.
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
            Unconditional stats from sets bonuses will affect the final stats of the character.
            For instance, the Hunter of Glacial Forest set unconditionally boosts Ice DMG by 10%, but conditionally increases Crit DMG by 25%, so only the unconditional Ice DMG boost is applied to the character's final stats.
            Conditional set bonuses can be added to the 'Combat buffs' fields.
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
            Important note: relics typed in manually or imported with the OCR tool may be affected by hidden decimal points that aren't shown by ingame stats.
            For example, 5 star relics can have speed substats of values between 2.0 - 2.6, which would all show ingame as 2. 
            This means that results should be treated as minimum values, as the real value may be slightly higher ingame.
            This also means that maximum filters should be used carefully since they may be too restrictive.
          </p>

          <h4 style={titleStyle}>
            Rating filters
          </h4>

          <p>
            This section defines filters for calculated ratings for optimization results. 
            These are calculated values which don't show ingame, but are useful for comparing multiple builds. 
            Note that the actual values may be multiplied by a power of 10 scaling factor to visually fit the numbers in the columns.
          </p>

          <ul>
            <li>CV - Crit Value, measuring the value of crit stats on the build. Calculated using <code>CD + CR * 2</code></li>
            <li>Dmg - Average crit damage for ATK scaling characters based on crit rate. Calculated using <code>ATK * CD * CR</code></li>
            <li>Mcd - Stands for Max Crit Damage, representing ATK scaling damage assuming 100% crit rate. Calculated using <code>ATK * CD</code></li>
            <li>Ehp - Effective HP, measuring how tanky a max level character is against a same level opponent. Calculated using <code>HP / (1 - DEF/(DEF + 1000))</code></li>
          </ul>
          
          <p>
            These rating calculations are experimental and I'm open to feedback and ideas for better ways to measure builds. 
            Currently these damage ratings are mostly focused on ATK / Crit based characters, so DOT / HP scaling characters may not find Dmg / Mcd as useful.
            More ratings are being working on for future updates.
          </p>

          <h4 style={titleStyle}>
            Combat buffs
          </h4>
          
          <p>
            This section defines buffs to the character to be used in the optimization calculations.
            These buffs can come from light cones/sets/teammate abilities/etc. 
            Only conditional buffs should be applied here because unconditional stats are already added directly to the character's stats.
            These options will affect the rating calculations but not the result stat rows - the result rows should reflect the ingame character's stat preview.
          </p>

          <ul>
            <li>ATK - Flat attack buff, e.g. Tingyun's skill which buffs ATK capped by her own ATK</li>
            <li>ATK % - Percent attack buff, e.g. Bronya's ultimate</li>
            <li>Crit Rate % - Crit rate buff, e.g. Jingliu would want 50% here from her own passive</li>
            <li>Crit Dmg % - Crit damage buff, e.g. The Hunter of Glacial Forest set which has a 25% Crit DMG buff</li>
          </ul>

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
            <li>Enhance / grade - Select the minimum enhance to search for and minimum stars for relics to include. If using non +15 relics, the 'Maxed main stat' filter might be good to enable to show maxed potential stats.
            Be careful selecting +0 relics because this increases search time.</li>
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

          <h4 style={titleStyle}>
            Scores
          </h4>

          <p>
            This section displays ratings for each relic, based on their substats. 
            O/S/D score stands for Offense / Support / DOT score. These are experimental measures of stat values for rating relic substats.
            The multipliers are based off substat : main stat value ratio.
          </p>

          <ul>
            <li>Offense score = <code>(CD * 1) + (ATK% * 1.5) + (CR * 2) + (SPD * 2.6)</code></li>
            <li>Support score = <code>(DEF% * 1.2) + (HP% * 1.5) + (RES * 1.5) + (SPD * 2.6)</code></li>
            <li>DOT score = <code>(ATK% * 1.5) + (EHR * 1.5) + (BE * 1) + (SPD * 2.6)</code></li>
          </ul>

          <p>
            These rating calculations are experimental and I'm open to feedback and ideas for better ways to measure relic quality. 
          </p>
        </Flex>
      </Text>
    </div>
  );
}

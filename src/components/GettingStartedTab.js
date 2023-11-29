import React, { useState } from 'react';
import { UploadOutlined, DownloadOutlined, AppstoreOutlined, MailOutlined, SettingOutlined } from '@ant-design/icons';
import { Button, Popconfirm, message, Flex, Upload, Radio, Tabs, Typography, Steps, theme, Divider } from 'antd';
import { OcrParser } from '../lib/ocrParser';
import { Message } from '../lib/message';

import sampleSave from '../data/sample-save.json';

const { Text } = Typography;

export default function GettingStartedTab({style}) {
  console.log('GettingStartedTab ')

  function tryItOutClicked() {
    DB.setState(JSON.parse(JSON.stringify(sampleSave)))
    SaveState.save()

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

          The optimizer needs a dataset of relics to run against. 
          As of launch, I've built an OCR importer for Windows which automatically scans the relic inventory and reads stats from screenshots. 
          This is the easiest way for now but if it doesn't work then relics can be inputted manually on the Relics tab as well.
          
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
            The character eidolon option does not currently affect optimization results, but the light cone superimposition will impact final stats based on the unconditional stat increases. 
            For example the Amber light cone at S5 gives 32% DEF unconditionally but an additional conditional 32% def at under 50% hp, so only the first 32% is applied to the final stats.
          </p>

          <h4 style={titleStyle}>
            Main Stats
          </h4>

          <p>
            Main stat filters limit the body/feet/planar sphere/link rope stats respectively, and multiple options can be selected per slot. 
            These options should be selected almost all characters to narrow down the desired relics to include.
          </p>

          <h4 style={titleStyle}>
            Set filters
          </h4>

          <img src={Assets.getGuideImage('sets')} style={screenshotStyle}></img>

          <p>
            The relic set filter can have a combination 2 piece sets, 4 piece sets, or be left empty. 
            When multiple options are selected, results that match at least one of the filters are shown.
            Unconditional stats from sets will affect the final stats of the character. 
            For example the Hunter of Glacial Forest set increases Ice DMG by 10% unconditionally, but 25% Crit DMG conditionally, so only the Ice DMG is applied.
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
            Imporant note: relics typed in manually or imported with the OCR tool may be affected by hidden decimal points that aren't shown by ingame stats. 
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
            <li>Dmg - Average crit damage for ATK scaling characters based on crit rate. Calculated using <code>ATK * CD * CR</code></li>
            <li>Mcd - Stands for Max Crit Damage, representing ATK scaling damage assuming 100% crit rate. Calculated using <code>ATK * CD</code></li>
            <li>Ehp - Effective HP, measuring how tanky a max level character is against a same level opponent. Calculated using <code>HP / (1 - DEF/(DEF + 1000))</code></li>
          </ul>
          
          <p>
            These rating calculations are experimental and I'm open to feedback and ideas for better ways to measure builds. 
            Currently these damage ratings are mostly focused on ATK / Crit based characters, so DOT / HP scaling characters may not find Dmg / Mcd as useful.
          </p>

          <h4 style={titleStyle}>
            Damage buffs
          </h4>
          
          <p>
            This section defines buffs to be used in the optimization request. 
            These buffs can come from light cones/sets/teammate abilities/etc. 
            Only the conditional light cone buffs should be applied here because unconditional stats are already added to the character.
            These options will affect the rating calculations but NOT the result stat rows. 
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
            <li>Rank filter - Rank characters by dragging them on the character page, and when enabled, characters may only take relics from lower ranked characters</li>
            <li>Maxed main stat - Assume the main stat for relics are maxed for their respective grades</li>
            <li>Keep current relics - The character must use its currently equipped items, and the optimizer will try to fill in empty slots</li>
            <li>Enhance / grade - Select the minimum enhance to search for and minimum stars for relics to include. If using non +15 relics, the 'Maxed main stat' filter might be good to enable to show maxed potential stats</li>
          </ul>


          <Divider style={dividerStyle}></Divider>
          {/* ======================================================================================================================= */}

          <h2>
            Results
          </h2>

          <img src={Assets.getGuideImage('results')} style={screenshotStyle}></img>

          <h4 style={titleStyle}>
            Permutations
          </h4>

          <p>
            This section shows the number of permutations the optimizer has to search and details on the number of matching relics per slot. 
            If any of the numbers are zero, that indicates that no relics were found that would satisfy the constraints.
          </p>

          <ul>
            <li>Perms - Number of permutations that need to be searched. Stricter filters will reduce permutations and search time</li>
            <li>Searched - Number of permutations completeed in an in-progress search</li>
            <li>Results - Number of displayed results that satisfy the stat filters</li>
          </ul>
          
          <h4 style={titleStyle}>
            Result rows
          </h4>
          
          <p>
            This section displays all the results found that match the filters. 
            The pinned top row shows the character's currently equipped build. 
            Clicking on each row will show the relics used in the selected build. 
            There may be multiple pages of results, so clicking a column header to sort the results by a stat or rating can make it easier to find desired builds.
          </p>

          <h4 style={titleStyle}>
            Selected build
          </h4>
          <p>
            This section displays the selected build from the grid, and which relics are used & who they are currently equipped on. 
            Pressing the 'Equip' button will assign the relics to the selected character in the optimizer, but doesn't actually affect the ingame account.
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

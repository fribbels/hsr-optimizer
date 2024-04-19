import React, { ReactElement } from 'react'
import { Flex, List, theme, Typography } from 'antd'
import { AppPages } from 'lib/db.js'
import { Assets } from 'lib/assets'
import { ColorizedLink } from './common/ColorizedLink'

const { useToken } = theme
const { Text } = Typography

type ChangelogContent = { title: string; date: string; content: string[] }

export default function ChangelogTab(): React.JSX.Element {
  const { token } = useToken()

  const activeKey = window.store((s) => s.activeKey)

  if (activeKey != AppPages.CHANGELOG) {
    // Don't load images unless we're on the changelog tab
    return (<></>)
  }

  function listToDisplay(content: string[], contentUpdate: ChangelogContent) {
    const display: ReactElement[] = []
    let i = 0
    for (const entry of content) {
      if (entry.endsWith('.webp')) {
        display.push(
          <img
            key={i++}
            src={Assets.getChangelog(`${contentUpdate.date}/${entry}`)}
            loading="lazy"
            style={{
              border: `2px solid ${token.colorBgContainer}`,
              margin: 5,
            }}
          />,
        )
      } else if (entry.startsWith('https')) {
        display.push(
          <li key={i++}>
            <ColorizedLink
              text={entry}
              url={entry}
              key={i++}
            />
          </li>,
        )
      } else {
        display.push(
          <li key={i++}>
            <Text style={{ fontSize: 16 }}>{entry}</Text>
          </li>,
        )
      }
    }

    return (
      <Flex vertical>
        <Typography.Title style={{ marginLeft: 20 }}>
          <u>
            {`Update ${contentUpdate.date}`}
          </u>
        </Typography.Title>
        <ul>
          {display}
        </ul>
      </Flex>
    )
  }

  return (
    <List
      itemLayout="vertical"
      size="large"
      pagination={{
        onChange: (page) => {
          console.log(page)
        },
        position: 'bottom',
        align: 'start',
        pageSize: 4,
      }}
      dataSource={changelog}
      renderItem={(item) => (
        <List.Item
          key={item.title}
        >
          {listToDisplay(item.content, item)}
        </List.Item>
      )}
    />
  )
}

function leaks(str: string) {
  return window.officialOnly ? '' : str
}

/*
NOTES:

 */
const changelog: ChangelogContent[] = [
  {
    title: '',
    date: '04-18-2024',
    content: [
      'Launched a new leak-free version of the optimizer which has no leaks and only contains officially released content',
      'https://starrailoptimizer.github.io',
      'noLeaks.webp',
      'Added a one-click-optimize button to the Relic Scorer page, accessed by clicking the graph icon or the Optimize Character Stats button',
      'This automatically imports the scored profile relics, adds the character and light cone, applies recommended filters and conditionals, and starts an optimizer search',
      'This is meant to be an easy way for new users to get started using the optimizer',
      'oneClick.webp',
      'Updated the Get Started tab with up to date instructions and a step-by-step guide to using the optimizer for the first time',
      'getStarted.webp',
      'Added new Average potential view as an option alongside Max potential on Relics tab',
      'potentialUpdates.webp',
      'Relic potential ratings menu now has a Custom characters view enabled by default, where only a subset of characters are considered for the potential calculations',
      'relicRatings.webp',
      'All characters are included initially, then specific characters can be selected to excluded from the relic potential view',
      'customCharacters.webp',
      'Clicking empty relic slots now brings up the Add New Relic menu',
      'clickEmpty.webp',
      'Added icons to sidebar menu tabs',
      'Added a button to hide the menu sidebar for easier viewing on smaller screens',
      'hideSidebar.webp',
      'Updated the Recommended Presets speed breakpoints to 1000ths precision',
      'breakpoints.webp',
      'Ambiguous speed values near specific breakpoints (such as 133.333..) are now displayed to 1000ths precision for checking if the breakpoint is met',
      'spdValues.webp',
      'Added a Reset All Characters button to the scoring algorithm menu',
      'resetAll.webp',
      'Rephrased pioneer conditional to specify between basic and combat stat buffs',
      'The last optimized character will now be open by default on the next session',
      'The Simulate Relics On Another Character menu is now open by default on the Relic Scorer tab',
      leaks('Updated Boothill damage calcs'),
      leaks('Updated Robin damage calcs'),
      'Added crit vulnerability to damage calcs',
      'Fix: Aventurine ult now applies correctly a crit vulnerability',
      'Fix: Baptism of Pure Thought now correctly applies a crit vulnerability',
      'Fix: Worrisome, Blissful now correctly applies a crit vulnerability',
      'Fix: Herta now correctly defaults to FUA sort',
      'Fix: Removed leftover unused character level selectors, all characters now default to level 80',
      'Fix: Black Swan E1 now correctly only applies res shred on DOT elements',
      'Fix: Scores for saved builds will now update with scoring changes',
      'Fix: Creating new relics with an owner now equips the relic',
    ],
  },
  {
    title: '',
    date: '04-04-2024',
    content: [
      'Added Break DMG calculations for all characters and a sortable BREAK column in the optimizer grid',
      'breakDmg.webp',
      leaks('Updated Boothill\'s Enhanced basic attack calculation to include his Talent\'s additional break damage'),
      leaks('Updated Boothill\'s conditional toggle to be "Talent break DMG (forces weakness break)" which overrides the weakness break option when enabled'),
      leaks('Updated Boothill\'s default sort option to Basic DMG'),
      leaks('boothill.webp'),
      leaks('Updated Boothill\'s scoring algorithm to prioritize SPD and Break Effect'),
      leaks('boothillScore.webp'),
      'Added a display for the artist\'s name on custom character portraits',
      leaks('artist.webp'),
      'The artist name can be updated along with the image on the crop menu',
      'Enabled gif uploads for custom character portraits',
      leaks('artistInput.webp'),
      leaks('Updated Reliquary Archiver import for 2.1 patch, which imports accurate speed decimals for the entire inventory'),
      leaks('archiver.webp'),
      'Added new character action menu entry to "Sort by score" which rearranges the character priority by their character scores',
      'sortByScore.webp',
      'Updated conditional set effects for Pioneer Diver of Dead Waters set with a 0x debuffs option which disables the 2p effect',
      'pioneer.webp',
      'Removed the Enemy HP% selector from the enemy options panel, and replaced it with Enemy Toughness, which affects the Break DMG calculations in the optimizer',
      'tough.webp',
      'Since the Enemy HP% selector was removed, updated character conditionals that depended on it to have their own toggle',
      'Dan Heng now has an enemy HP% threshold toggle',
      'Himeko now has an enemy HP% threshold toggle',
      'Herta now has an enemy HP% threshold toggle',
      'Argenti now has an enemy HP% threshold toggle',
      'Reduced the filesize of assets for faster image loading',
      'Optimizer search speed improvements for unfiltered searches',
      'Added warning popup for optimizer searches with mismatching character and light cone paths',
      'Ruan Mei\'s teammate buff renamed to "Overtone buff" and now also applies her weakness break efficiency buff',
      'Gallagher\'s Besotted buff added with Break DMG vulnerability',
      'Fix: Argenti A6 trace now correctly applies to all his abilities instead of just ult DMG',
      'Fix: Updated tooltips for 2.1 light cones',
      'Fix: Updated Along the Passing Shore light cone\'s passive effect to Mirage Fizzle',
      'Fix: Planetary Rendezvous now shows correctly on the teammate buffs panel',
      'Fix: Bug with unselectable main stats being available in the Edit Relic view in certain cases',
      'Fix: Stat filters are now saved to 1000ths precision',
    ],
  },
  {
    title: '',
    date: '03-26-2024',
    content: [
      'Added custom character portrait images, through the "Edit portrait" menu button on the character preview/relic scorer',
      'sparkle.webp',
      'Portrait images can be selected by url or uploaded from file',
      'crop.webp',
      'Added substat roll count indicators to relics, showing the number of additional rolls per stat',
      'rollQuality.webp',
      'Added new relic rating tools to the Relics tab: for evaluating relic potential for the selected character or all characters',
      'When selecting a character on the Relics grid, all selected relics will show their score according to the selected character\'s weights',
      'relicsGrid.webp',
      'Added new Relic Insights: Buckets graphs to display the potential of a relic and which characters are the best fit for the stats',
      'relicBuckets.webp',
      'The Relic Insights: Top 10 view shows the min/max range of potential for the top 10 best fit characters',
      'relicTop10.webp',
      'Added new 2.1 sets: Sigonia, the Unclaimed Desolation & Izumo Gensei and Takama Divine Realm',
      '21sets.webp',
      'Added new importer option for the Reliquary Archiver (beta) which can import accurate speed decimals for the entire inventory',
      'importer.webp',
      'Added new Optimization Target options to the optimizer page.',
      'optimimationTarget.webp',
      'This removes the 2 million results hard cap from before.',
      'resultsLimit.webp',
      'Choose the desired optimization goal for damage/stats/rating, and select a results limit, to find the top search results sorted by the target',
      'sortBy.webp',
      'Stat decimals are now shown to 1000ths precision on the Character preview when hovered',
      'spdHover.webp',
      'Added new Character action to switch relics with another character',
      'switchRelics.webp',
      'Added new 2.2 characters: Robin / Boothill / Harmony Trailblazer',
      'Added new 2.2 light cones: Boundless Choreo / For Tomorrow\'s Journey / Flowing Nightglow / Sailing Towards A Second Life',
      '22chars.webp',
      'Adjusted character optimal main stats, allowing more lenient options such as ATK% spheres for DPS and any sphere stats for Bronya/Sparkle',
      'Removed level selectors on Optimizer tab - all optimizations now assume level 80 character and light cone',
      'Made the sidebar menu always stay on screen when scrolling',
      'Fix: Relic imports from scanning newly rolled relics before logout no longer causes duplicate relics',
      'Fix: Download screenshot button on mobile devices and Safari browsers now generates the image correctly',
      'Fix: Pela E2 skill conditional SPD buff is now off by default',
      'Fix: Bronya technique conditional ATK buff is now off by default',
      'Fix: Silver Wolf skill conditional weakness implanted RES shred is now off by default',
      'Fix: Sparkle talent conditional Quantum allies ATK buff now only applies to Quantum elemental main characters',
      'Fix: Acheron trace Stygian Resurge now has its own slider instead of assuming all hits on target',
      'Fix: Seele E1 conditional CR buff now has its own toggle instead of being linked to the enemy HP selector',
    ],
  },
  {
    title: '',
    date: '03-12-2024',
    content: [
      'Added a new visual character selector menu with search and filters',
      'charSelect.webp',
      'Light cone selectors are also updated and now default to the selected character\'s path',
      'lcSelect.webp',
      'Added a new menu that automatically shows suggestions to fix common misconfigurations in setting up optimizer searches that result in 0 permutations',
      'zeroPerm.webp',
      'Presets speed breakpoints are now defined to 100ths precision',
      'presets.webp',
      'Added def values to enemy level selector',
      'enemyDef.webp',
      'Updated calculations with the latest beta character abilities',
      'Reorganized some stat orderings for consistency',
      'Fix: Light cone "Today is Another Peaceful Day" now defaults to the character\'s max energy',
      'Fix: E2/E5 eidolon calculations for some characters',
      'Fix: EHP filter works again',
      'Fix: Linking to #scorer and other pages works again',
      'Fix: Permutations now refresh when navigating to Optimizer tab',
      'Fix: Alerts can now be closed when clicking on them',
    ],
  },
  {
    title: '',
    date: '02-28-2024',
    content: [
      'Enabled up/down arrow key navigation for grids',
      'Updated the selected row overlay to be more visible',
      'gridRow.webp',
      'Added new priority and exclusion selectors in optimizer options',
      'Priority can now be changed from the optimizer tab now instead of dragging. Exclude will additionally filter out specific characters relics',
      'priorityExclude.webp',
      'Added a notice to update when the scanner version is out of date',
      'outOfDate.webp',
      'Relic scorer Simulate button has been move to a sidebar, and now has preset characters for current/upcoming banners',
      'simulate.webp',
      'Added a sortable CV column for crit value to the Relics tab',
      'cvColumn.webp',
      'Added a "Move to top" action button to the Characters tab',
      'moveToTop.webp',
      'Started adding more icons to selectors for readability, more to come',
      'icons.webp',
      'Removed CV column & filter from optimizer tab - damage calculations are a better option to sort by now',
      'Stats display is set to "Combat Stats" by default now, also the setting now saves correctly per character',
      'Changed relic scorer API in preparation for upcoming leaderboards update',
    ],
  },
  {
    title: '',
    date: '02-20-2024',
    content: [
      'Added: Acheron / Aventurine / Gallagher',
      'newChars.webp',
      'Added: "Simulate relics on another character" button on the Relic scorer.',
      'Now the profile characters\' builds can be simulated as unowned or unreleased characters & light cones to preview their gear with accurate base stats',
      'simulate.webp',
      'Added: Teammates menu for the optimizer. This automatically adds the teammate\'s character passives/eidolons/light cone/relic sets to the calculations for more accurate results',
      'teammates.webp',
      'Added: Character builds can now be saved as loadouts, keeping a history of saved builds that can be easily swapped between',
      'savedBuilds.webp',
      'Added: Changelog page to track new optimizer changes',
      'changelog.webp',
      'Moved stat display to the sidebar for easier access',
      'statDisplay.webp',
      'Clicking "Start optimizing" now scrolls the page down to the results grid',
      'Deprecated the Fribbels scanner option in favor of the Kel-Z scanner',
      'Energy Regeneration Rate column can be filtered on now',
      'Imports now work with scanner files that only contain characters/light cones without relics',
      'Minor scoring changes for: Sushang, Luka, Physical Trailblazer, Blade, Silver Wolf, Kafka, and Preservation characters',
    ],
  },
  {
    title: '',
    date: '02-05-2024',
    content: [
      'Added \'Recommended Presets\' button to fill out the optimizer with some suggested values',
      'presets.webp',
      'Added the new Pioneer & Watchmaker relic sets',
      'newSets.webp',
      'Added support for 8 relic scorer slots',
      'scorer8Characters.webp',
      'All character and light cone passives now have descriptions on hover',
      'skillDescriptions.webp',
      'Reorganized Character tab buttons with new Add / Edit character actions',
      'characterActions.webp',
      'Added a Screenshot button for copying the character preview to clipboard / downloads',
      'screenshot.webp',
      'Added a progress bar for the search',
      'progress.webp',
      'Updated damage calcs with all 2.0 light cones',
      'Relic set filters now have a 2 piece + Any option',
      'Improved optimizer search performance, should run 3-6x faster now',
    ],
  },
  {
    title: '',
    date: '01-22-2024',
    content: [
      'Black Swan / Sparkle / Misha added with dmg calcs and their signature light cones',
      'newChars.webp',
      'New \'Use equipped relics\' optimizer filter toggle',
      'useEquipped.webp',
      'Optimizer grid now shows speed decimals',
      'spd.webp',
      'QOLs for relic editing for autofilled main stats',
      'Double clicking on the characters list now will navigate to the optimizer',
    ],
  },
  {
    title: '',
    date: '01-13-2024',
    content: [
      'Big update to the relics tab, including filters and a relic recommendation tool',
      'The recommendation tool scores each relic by its potential at +15 to help with picking which unenhanced relics to roll while building characters',
      'relicsTab.webp',
      'Also updated the Relic Scorer with an import option - now you can import relics directly from your ingame profile characters, with accurate speed values',
      'import.webp',
    ],
  },
  {
    title: '',
    date: '01-06-2024',
    content: [
      'Accurate damage calculations for every character, and new optimization columns for average Basic / Skill / Ult / Follow-up / DoT damage',
      'calcs.webp',
      'Character abilities + Light cone passive selectors to customize the damage simulation',
      'passives.webp',
      'Relic set effects menu for customizing which sets to activate',
      'setEffects.webp',
      'New filtering tools including the substat weight filter to reduce permutations & improve search time',
      'weightFilter.webp',
      'Enemy count / DEF / RES / HP / and weakness selectors for optimizing specific combat scenarios',
      'enemyOptions.webp',
      'Integrated with the Kel-Z HSR Scanner for faster & more accurate scans',
      'importer.webp',
      'Expanded combat buffs options for adding more team effects like SPD / DMG% / DEF & RES shred / etc',
      'Relic stat editor and better handling for hidden decimals',
      'New character importer option - Import all your character builds and light cones directly from the game',
    ],
  },
]
// Filter out leaks from changelog
changelog.map(x => x.content = x.content.filter(x => x.length > 0))

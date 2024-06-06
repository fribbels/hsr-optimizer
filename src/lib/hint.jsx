import React from 'react'
import { Flex } from 'antd'

export const Hint = {
  ratingFilters: () => {
    return {
      title: 'Rating filters',
      content: (
        <Flex vertical gap={10}>
          <p>Weight - Sum of substat weights of all 6 relics, from the Substat weight filter</p>
          <p>Ehp - Effective HP, measuring how tanky a max level character is. Calculated using HP & DEF & damage reduction passives</p>
          <p>Basic / Skill / Ult / Fua (Follow-up attack) / Dot (Damage over time) - Skill damage calculations, based on the environmental factors in character passives / light cone passives / enemy options.</p>
        </Flex>
      ),
    }
  },

  combatBuffs: () => {
    return {
      title: 'Combat buffs',
      content: (
        <Flex vertical gap={10}>
          <p>Additional team buffs to apply to the calculations. Note that buffs from character / light cone self-buffs and passives and traces are already included in calculations.</p>
        </Flex>
      ),
    }
  },

  statFilters: () => {
    return {
      title: 'Stat filters',
      content: (
        <Flex vertical gap={10}>
          <p>Min (left) / Max (right) filters for character stats, inclusive. The optimizer will only show results within these ranges </p>
          <p>Stat abbreviations are ATK / HP / DEF / SPD / Crit Rate / Crit Damage / Effect Hit Rate / Effect RES / Break Effect</p>
          <p>NOTE: Ingame speed decimals are truncated so you may see speed values ingame higher than shown here. This is because the OCR importer can't detect the hidden decimals.</p>
        </Flex>
      ),
    }
  },

  mainStats: () => {
    return {
      title: 'Main stats',
      content: (
        <Flex vertical gap={10}>
          <p>Select main stats to use for optimization search. Multiple values can be selected for more options</p>
        </Flex>
      ),
    }
  },

  sets: () => {
    return {
      title: 'Sets',
      content: (
        <Flex vertical gap={10}>
          <p>Select the relic and ornament sets to filter results by. Multiple sets can be selected for more options</p>

          <p>Set effects will be accounted for in calculations, use the Conditional set effects menu to customize which effects are active.</p>
        </Flex>
      ),
    }
  },

  character: () => {
    return {
      title: 'Character',
      content: (
        <Flex vertical gap={10}>
          <p>Select the character and eidolon. Character is assumed to be level 80 with maxed traces in optimization calcs.</p>
        </Flex>
      ),
    }
  },

  characterPassives: () => {
    return {
      title: 'Character passives',
      content: (
        <Flex vertical gap={10}>
          <p>Select the conditional effects to apply to the character.</p>
          <p>Effects that rely on combat stats or environment state will be applied by default, so only the options that require user input are listed here.</p>
        </Flex>
      ),
    }
  },

  lightConePassives: () => {
    return {
      title: 'Light cone passives',
      content: (
        <Flex vertical gap={10}>
          <p>Select the conditional effects to apply to the light cone.</p>
          <p>Effects that rely on combat stats or environment state will be applied by default, so only the options that require user input are listed here.</p>
        </Flex>
      ),
    }
  },

  lightCone: () => {
    return {
      title: 'Light cone',
      content: (
        <Flex vertical gap={10}>
          <p>Select the light cone and superimposition. Light cone is assumed to be level 80 in optimization calcs.</p>
          <p>Superimposition and passive effects are applied under the Light cone passives panel.</p>
        </Flex>
      ),
    }
  },

  actions: () => {
    return {
      title: 'Actions',
      content: (
        <Flex vertical gap={10}>
          <p>Equip - Equip the selected relics from the grid onto the character</p>
          <p>Filter - Re-apply the search filters to existing results. Use this to narrow filters without restarting a search</p>
        </Flex>
      ),
    }
  },

  optimizerOptions: () => {
    return {
      title: 'Optimizer options',
      content: (
        <Flex vertical gap={10}>
          <p>
            <strong>Character priority filter</strong>
            {' '}
            - When this option is enabled, the character may only steal relics from lower priority characters. The optimizer will ignore relics equipped by higher priority characters on the list. Change character ranks from the priority selector or by dragging them on the Characters page.
          </p>
          <p>
            <strong>Maxed main stat</strong>
            {' '}
            - Assume the main stat for relics are maxed
          </p>
          <p>
            <strong>Keep current relics</strong>
            {' '}
            - The character must use its currently equipped items, and the optimizer will try to fill in empty slots
          </p>
          <p>
            <strong>Include equipped relics</strong>
            {' '}
            - When enabled, the optimizer will allow using currently equipped by a character for the search. Otherwise equipped relics are excluded
          </p>
          <p>
            <strong>Priority</strong>
            {' '}
            - See: Character priority filter. Changing this setting will change the character's priority
          </p>
          <p>
            <strong>Exclude</strong>
            {' '}
            - Select specific characters' equipped relics to exclude for the search. This setting overrides the priority filter
          </p>
          <p>
            <strong>Enhance / grade</strong>
            {' '}
            - Select the minimum enhance to search for and minimum stars for relics to include
          </p>
        </Flex>
      ),
    }
  },

  relics: () => {
    return {
      title: 'Relics',
      content: (
        <Flex vertical gap={10}>
          <p>Note - Potential is a percent rating which compares a relic to the best possible +15 relic for the current character in the slot. This rating is based off the scoring algorithm weights. This means unrolled relics at +0 sometimes have a higher potential than existing +15 relics, because their possible rolls can go into the character's desired stats. </p>
          <p>Selected character: Score - The relic's current weight as defined by the scoring algorithm for the currently selected character</p>
          <p>Selected character: Average potential - The relic's potential weight if rolls went into the average weight of the relic's substats</p>
          <p>Selected character: Max potential - The relic's maximum potential weight if all future rolls went into the character's desired stats</p>
          <p>All characters: Max potential - The highest possible potential value of the relic, out of all characters in the game. </p>
        </Flex>
      ),
    }
  },

  optimizationDetails: () => {
    return {
      title: 'Optimization details',
      content: (
        <Flex vertical gap={10}>
          <p>Shows how many relics are being used in the optimization search, after all filters are applied</p>
          <p>Perms - Number of permutations that need to be searched. Narrow your filters to reduce permutations & search time</p>
          <p>Searched - Number of permutations already searched</p>
          <p>Results - Number of displayed results that satisfy the stat filters</p>
        </Flex>
      ),
    }
  },

  enemyOptions: () => {
    return {
      title: 'Enemy options',
      content: (
        <Flex vertical gap={10}>
          <p>Level - Enemy level, affects enemy DEF calculations</p>
          <p>Targets - Number of targets in the battle. The target enemy is always assumed to be in the center, and damage calculations are only for the single primary target.</p>
          <p>RES - Enemy elemental RES. RES is set to 0 when the enemy's elemental weakness is enabled.</p>
          <p>Max toughness - Enemy's maximum toughness bar value. Affects calculations related to break damage.</p>
          <p>Elemental weakness - Whether the enemy is weak to the character's type. Enabling this sets enemy elemental RES % to 0.</p>
          <p>Weakness broken - Whether the enemy's toughness bar is broken. Affects damage calculations and certain character passives.</p>
        </Flex>
      ),
    }
  },

  substatWeightFilter: () => {
    return {
      title: 'Substat weight filter',
      content: (
        <Flex vertical gap={10}>
          <p>This filter is used to reduce the number of permutations the optimizer has to process.</p>
          <p>It works by first scoring each relic per slot by the weights defined, then filtering by the number of weighted min rolls the relic has.</p>
          <p>Only relics that have more than the specified number of weighted rolls will be used for the optimization search.</p>
          <p>Note that setting the minimum rolls too low may result in some builds not being displayed, if the filter ends up excludes a key relic. Use this filter with caution, but on large searches it makes a large impact on reducing search time.</p>
        </Flex>
      ),
    }
  },

  statDisplay: () => {
    return {
      title: 'Stat and filter view',
      content: (
        <Flex vertical gap={10}>
          <p>This allows for switching between viewing results as Base stats vs Combat stats. Stat filters will also be applied to the selected view.</p>
          <p>Base stats - The stats as shown on the character's screen ingame, with no in-combat buffs applied.</p>
          <p>Combat stats - The character's stats with all stat modifiers in combat included: ability buffs, character & light cone passives, teammates, conditional set effects, etc.</p>
        </Flex>
      ),
    }
  },

  valueColumns: () => {
    return {
      title: 'Value Columns',
      content: (
        <Flex vertical gap={10}>
          <p>You can optionally display a number of columns that assess the relative 'value' of a relic.</p>
          <p><b>Weight</b></p>
          <p>Weight columns assess the contribution of a particular relic to the overall letter grading of the selected recommendation character (if any).</p>
          <p>Weight can show the current value of a relic, the possible best case upgraded weight, or an 'average' weight that you're more likely to see</p>
          <p>Weight is useful to focus on a single character and see which relics might give them a higher letter grading.</p>
          <p><b>Potential</b></p>
          <p>Potential is a character-specific percentage of how good the relic could be (or 'is', if fully upgraded), compared against the stats on a fully upgraded 'perfect' relic in that slot.</p>
          <p>Potential can look at all characters or just owned. It then takes the maximum percentage for any character.</p>
          <p>Potential is useful for finding relics that aren't good on any character, or hidden gems that could be great when upgraded.</p>
          <p>Note ordering by potential can be mismatched against weights, due to weight calculations preferring lower weight ideal mainstats.</p>
        </Flex>
      ),
    }
  },

  relicInsight: () => {
    return {
      title: 'Relic Insight',
      content: (
        <Flex vertical gap={10}>
          <p>When a relic is selected in the table above, you can choose an analysis to view a plot of.</p>
          <p>'Buckets' looks at how perfect this relic could be (with the best possible upgrade rolls) for each character, and buckets them into percentages.<br />
            If you hover over a character portrait you'll see the new stats and/or rolls necessary to reach the max potential of this relic.<br />
            ⚠️ Relics with missing substats may have misleadlingly high buckets, as best-case upgrade analysis assumes the best new substat per character.
          </p>
          <p>'Top 10' takes the top 10 characters that this relic could be best for, and shows the range of '% perfection' upgrading this relic could result in.</p>
        </Flex>
      ),
    }
  },
}

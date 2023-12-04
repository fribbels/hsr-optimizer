import { Flex } from "antd"

export const Hint = {
  ratingFilters: () => {
    return {
      title: 'Rating Filters',
      content: (
        <div>
          <p>CV - Crit Value, measuring the value of crit stats on the build. Calculated using CD + CR * 2</p>
          <p>Dmg - Average crit damage for ATK scaling characters based on crit rate. Calculated with ATK x CD x CR</p>
          <p>Mcd - Stands for Max Crit Damage, representing ATK scaling damage assuming 100% crit rate. Calculated with ATK x CD</p>
          <p>Ehp - Effective HP, measuring how tanky a max level character is. Calculated with HP / (1 - DEF/(DEF + 1000)) </p>
        </div>
      )
    }
  },

  combatBuffs: () => {
    return {
      title: 'Combat Buffs',
      content: (
        <div>
          <p>ATK - Flat attack buff</p>
          <p>ATK % - Percent attack buff, e.g. Tingyun skill</p>
          <p>Crit Rate % - Crit rate buff, e.g. Jingliu would want 50% here</p>
          <p>Crit Dmg % - Crit damage buff, e.g. Yukong ultimate</p>
        </div>
      )
    }
  },

  statFilters: () => {
    return {
      title: 'Stat Filters',
      content: (
        <div>
          <p>Min / Max filters for character stats, inclusive. The optimizer will only show results within these ranges </p>
          <p>Stat abbreviations are ATK / HP / DEF / SPD / Crit Rate / Crit Damage / Effect Hit Rate / Effect RES / Break Effect</p>
          <br/>
          <p>NOTE: The stats ingame may vary slightly from the stats calculated by the optimizer</p>
          <p>This is due to ingame stats having hidden decimal points that the OCR scanner can't detect</p>
          <p>Most notably, speed decimals are truncated so you may see speed values ingame higher than shown here</p>
        </div>
      )
    }
  },

  mainStats: () => {
    return {
      title: 'Main Stats',
      content: (
        <div>
          <p>Select main stats to use for optimization search. Multiple values can be selected for more options</p>
        </div>
      )
    }
  },

  sets: () => {
    return {
      title: 'Sets',
      content: (
        <div>
          <p>Select the relic and ornament sets to filter results by. Multiple sets can be selected for more options</p>

          <p>Set effects will be accounted for in calculations, but only unconditional effects</p>
        </div>
      )
    }
  },

  character: () => {
    return {
      title: 'Character',
      content: (
        <div>
          <p>Select the character and level / eidolon</p>
          <p>Levels will affect base stats used in the calculation. Eidolon effects are still WIP</p>
        </div>
      )
    }
  },

  lightCone: () => {
    return {
      title: 'Light Cone',
      content: (
        <div>
          <p>Select the light cone and level / superimposition</p>
          <p>Levels will affect base stats used in the calculation and superimposition scale the unconditional stat effects</p>
        </div>
      )
    }
  },
  
  actions: () => {
    return {
      title: 'Actions',
      content: (
        <div>
          <p>Start - Begin optimization search with the selected filters</p>
          <p>Filter - Re-apply the search filters to existing results. Use this to narrow filters without restarting a search</p>
          <p>Cancel - Cancel an in progress search and display results</p>
          <p>Reset - Clear all filters</p>
        </div>
      )
    }
  },
  
  optimizerOptions: () => {
    return {
      title: 'Optimizer Options',
      content: (
        <div>
          <p>Rank filter - Rank characters by dragging them on the character page, and when enabled, characters may only take relics from lower ranked characters</p>
          <p>Maxed main stat - Assume the main stat for relics are maxed</p>
          <p>Keep current relics - The character must use its currently equipped items, and the optimizer will try to fill in empty slots</p>
          <p>Enhance / grade - Select the minimum enhance to search for and minimum stars for relics to include</p>
        </div>
      )
    }
  },
  
  relics: () => {
    return {
      title: 'Relics',
      content: (
        <div>
          <p>O/S/D score stands for Offense / Support / DOT score. These are experimental measures of stat values for rating relic substats</p>
          <p>The multipliers are based off substat : main stat value ratio</p>
          <p>Offense score = (CD x 1) + (ATK% x 1.5) + (CR x 2) + (SPD x 2.6)</p>
          <p>Support score = (DEF% x 1.2) + (HP% x 1.5) + (RES x 1.5) + (SPD x 2.6)</p>
          <p>DOT score = (ATK% x 1.5) + (EHR x 1.5) + (BE x 1) + (SPD x 2.6)</p>
        </div>
      )
    }
  },
  
  optimizationDetails: () => {
    return {
      title: 'Optimization Details',
      content: (
        <div>
          <p>Shows how many relics are being used in the optimization search, after all filters are applied</p>
          <p>Perms - Number of permutations that need to be searched. Narrow your filters to reduce permutations & search time</p>
          <p>Searched - Number of permutations already searched</p>
          <p>Results - Number of displayed results that satisfy the stat filters</p>
        </div>
      )
    }
  },
}
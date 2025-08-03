import { Flex } from 'antd'
import i18next from 'i18next'
import {
  Trans,
  useTranslation,
} from 'react-i18next'
import { ReactElement } from 'types/components'

export type HintContent = {
  title: string,
  content: ReactElement,
}

export const Hint = {
  ratingFilters: (): HintContent => {
    return {
      title: i18next.t('hint:RatingFilter.Title'),
      content: (
        <Flex vertical gap={10}>
          <p>{i18next.t('hint:RatingFilter.p1')}</p>
          <p>{i18next.t('hint:RatingFilter.p2')}</p>
          <p>{i18next.t('hint:RatingFilter.p3')}</p>
        </Flex>
        /*
         Title: Rating filters,
         p1: Ehp - Effective HP, measuring how tanky a max level character is. Calculated using HP & DEF & damage reduction passives,
         p2: Basic / Skill / Ult / Fua (Follow-up attack) / Dot (Damage over time) - Skill damage calculations, based on the environmental factors in character passives / light cone passives / enemy options.
         p3: Heal / Shield - Other ability calculations, based on the environmental factors in character passives / light cone passives / enemy options.
         */
      ),
    }
  },

  comboFilters: (): HintContent => {
    return {
      title: i18next.t('hint:ComboFilters.Title'),
      content: (
        <Flex vertical gap={10}>
          <p>{i18next.t('hint:ComboFilters.p1')}</p>
        </Flex>
        /*
         Title: Combo rotation,
         p1: Define the ability rotation to measure Combo DMG. Rotations are defined with [ as the start of a turn, and ] as the end of a turn. See the Advanced Rotation menu and user guide for more details.
         */
      ),
    }
  },

  combatBuffs: (): HintContent => {
    return {
      title: i18next.t('hint:CombatBuffs.Title'),
      content: (
        <Flex vertical gap={10}>
          <p>{i18next.t('hint:CombatBuffs.p1')}</p>
        </Flex>
        /*
         "Title": "Combat buffs",
         "p1": "Additional team buffs to apply to the calculations. Note that buffs from character / light cone self-buffs and passives and traces are already included in calculations."
         */
      ),
    }
  },

  statFilters: (): HintContent => {
    return {
      title: i18next.t('hint:StatFilters.Title'),
      content: (
        <Flex vertical gap={10}>
          <p>{i18next.t('hint:StatFilters.p1')}</p>
          <p>{i18next.t('hint:StatFilters.p2')}</p>
          <p>{i18next.t('hint:StatFilters.p3')}</p>
        </Flex>
        /*
         "Title": "Stat filters",
         "p1": "Min (left) / Max (right) filters for character stats, inclusive. The optimizer will only show results within these ranges",
         "p2": "Stat abbreviations are ATK / HP / DEF / SPD / Crit Rate / Crit Damage / Effect Hit Rate / Effect RES / Break Effect",
         "p3": "NOTE: Ingame speed decimals are truncated so you may see speed values ingame higher than shown here. This is because the OCR importer can't detect the hidden decimals."
         */
      ),
    }
  },

  mainStats: (): HintContent => {
    return {
      title: i18next.t('hint:Mainstats.Title'),
      content: (
        <Flex vertical gap={10}>
          <p>{i18next.t('hint:Mainstats.p1')}</p>
        </Flex>
        /*
         "Title": "Main stats",
         "p1": "Select main stats to use for optimization search. Multiple values can be selected for more options"
         */
      ),
    }
  },

  sets: (): HintContent => {
    return {
      title: i18next.t('hint:Sets.Title'),
      content: (
        <Flex vertical gap={10}>
          <p>{i18next.t('hint:Sets.p1')}</p>
          <p>{i18next.t('hint:Sets.p2')}</p>
        </Flex>
        /*
         "Title": "Sets",
         "p1": "Select the relic and ornament sets to filter results by. Multiple sets can be selected for more options",
         "p2": "Set effects will be accounted for in calculations, use the Conditional set effects menu to customize which effects are active."
         */
      ),
    }
  },

  character: (): HintContent => {
    return {
      title: i18next.t('hint:Character.Title'),
      content: (
        <Flex vertical gap={10}>
          <p>{i18next.t('hint:Character.p1')}</p>
        </Flex>
        /*
         "Title": "Character",
         "p1": "Select the character and eidolon. Character is assumed to be level 80 with maxed traces in optimization calcs."
         */
      ),
    }
  },

  characterPassives: (): HintContent => {
    return {
      title: i18next.t('hint:CharacterPassives.Title'),
      content: (
        <Flex vertical gap={10}>
          <p>{i18next.t('hint:CharacterPassives.p1')}</p>
          <p>{i18next.t('hint:CharacterPassives.p2')}</p>
        </Flex>
        /*
         "Title": "Character passives",
         "p1": "Select the conditional effects to apply to the character.",
         "p2": "Effects that rely on combat stats or environment state will be applied by default, so only the options that require user input are listed here."
         */
      ),
    }
  },

  lightConePassives: (): HintContent => {
    return {
      title: i18next.t('hint:LightconePassives.Title'),
      content: (
        <Flex vertical gap={10}>
          <p>{i18next.t('hint:LightconePassives.p1')}</p>
          <p>{i18next.t('hint:LightconePassives.p2')}</p>
        </Flex>
        /*
         "Title": "Light cone passives",
         "p1": "Select the conditional effects to apply to the light cone.",
         "p2": "Effects that rely on combat stats or environment state will be applied by default, so only the options that require user input are listed here."
         */
      ),
    }
  },

  lightCone: (): HintContent => {
    return {
      title: i18next.t('hint:Lightcone.Title'),
      content: (
        <Flex vertical gap={10}>
          <p>{i18next.t('hint:Lightcone.p1')}</p>
          <p>{i18next.t('hint:Lightcone.p2')}</p>
        </Flex>
        /*
         "Title": "Light cone",
         "p1": "Select the light cone and superimposition. Light cone is assumed to be level 80 in optimization calcs.",
         "p2": "Superimposition and passive effects are applied under the Light cone passives panel."
         */
      ),
    }
  },

  actions: (): HintContent => {
    return {
      title: i18next.t('hint:Actions.Title'),
      content: (
        <Flex vertical gap={10}>
          <p>{i18next.t('hint:Actions.p1')}</p>
          <p>{i18next.t('hint:Actions.p2')}</p>
          <p>{i18next.t('hint:Actions.p3')}</p>
          <p>{i18next.t('hint:Actions.p4')}</p>
        </Flex>
        /*
         "Title": "Actions",
         "p1": "Equip - Equip the selected relics from the grid onto the character",
         "p2": "Filter - Re-apply the search filters to existing results. Use this to narrow filters without restarting a search",
         "p3": "Pin build - Pin the currently selected row to the top of the grid. Use this to compare multiple builds more easily",
         "p4": "Clear pins - Clear all the builds that you pinned to the top of the grid"
         */
      ),
    }
  },

  optimizerOptions: (): HintContent => {
    return {
      title: i18next.t('hint:OptimizerOptions.Title'), /* Optimizer options */
      content: (() => {
        const { t } = useTranslation('hint', { keyPrefix: 'OptimizerOptions' })
        return (
          <Flex vertical gap={10}>
            <p>
              <Trans t={t} i18nKey='AllowEquipped'>
                <strong>Allow equipped relics</strong>
                - When enabled, the optimizer will allow using currently equipped by a character for the search. Otherwise equipped relics are excluded
              </Trans>
            </p>
            <p>
              <Trans t={t} i18nKey='PriorityFilter'>
                <strong>Character priority filter</strong>
                - When this option is enabled, the character may only steal relics from lower priority characters. The optimizer will ignore relics equipped by
                higher priority characters on the list. Change character ranks from the priority selector or by dragging them on the Characters page.
              </Trans>
            </p>
            <p>
              <Trans t={t} i18nKey='KeepCurrent'>
                <strong>Keep current relics</strong>
                - The character must use its currently equipped items, and the optimizer will try to fill in empty slots
              </Trans>
            </p>
            <p>
              <Trans t={t} i18nKey='Priority'>
                <strong>Priority</strong>
                - See: Character priority filter. Changing this setting will change the character's priority
              </Trans>
            </p>
            <p>
              <Trans t={t} i18nKey='Exclude'>
                <strong>Exclude</strong>
                - Select specific characters' equipped relics to exclude for the search. This setting overrides the priority filter
              </Trans>
            </p>
            <p>
              <Trans t={t} i18nKey='Enhance'>
                <strong>Enhance / rarity</strong>
                - Select the minimum enhance to search for and minimum stars for relics to include
              </Trans>
            </p>
            <p>
              <Trans t={t} i18nKey='BoostMain'>
                <strong>Boost main stat</strong>
                - Calculates relic mains stats as if they were this level (or their max if they can't reach this level) if they are currently below it. Substats
                are not changed accordingly, so builds with lower level relics may be stronger once you level them.
              </Trans>
            </p>
            <p>
              <Trans t={t} i18nKey='DPSMode'>
                <strong>DPS mode</strong>
                - Select whether the character should be the primary target for supportive buffs (Main DPS) or not (Sub DPS) for optimizer stat calculations
              </Trans>
            </p>
          </Flex>
        )
      })(),
    }
  },

  relics: (): HintContent => {
    return {
      title: i18next.t('hint:Relics.Title'),
      content: (
        <Flex vertical gap={10}>
          <p>{i18next.t('hint:Relics.p1')}</p>
          <p>{i18next.t('hint:Relics.p2')}</p>
          <p>{i18next.t('hint:Relics.p3')}</p>
          <p>{i18next.t('hint:Relics.p4')}</p>
          <p>{i18next.t('hint:Relics.p5')}</p>
        </Flex>
        /*
         "Title": "Relics",
         "p1": "Note - Potential is a percent rating which compares a relic to the best possible +15 relic for the current character in the slot. This rating is based off the scoring algorithm weights. This means unrolled relics at +0 sometimes have a higher potential than existing +15 relics, because their possible rolls can go into the character's desired stats.",
         "p2": "Selected character: Score - The relic's current weight as defined by the scoring algorithm for the currently selected character",
         "p3": "Selected character: Average potential - The relic's potential weight if rolls went into the average weight of the relic's substats",
         "p4": "Selected character: Max potential - The relic's maximum potential weight if all future rolls went into the character's desired stats",
         "p5": "All characters: Max potential - The highest possible potential value of the relic, out of all characters in the game."
         */
      ),
    }
  },

  optimizationDetails: (): HintContent => {
    return {
      title: i18next.t('hint:OptimizationDetails.Title'),
      content: (
        <Flex vertical gap={10}>
          <p>{i18next.t('hint:OptimizationDetails.p1')}</p>
          <p>{i18next.t('hint:OptimizationDetails.p2')}</p>
          <p>{i18next.t('hint:OptimizationDetails.p3')}</p>
          <p>{i18next.t('hint:OptimizationDetails.p4')}</p>
        </Flex>
        /*
         "Title": "Optimization details",
         "p1": "Shows how many relics are being used in the optimization search, after all filters are applied",
         "p2": "Perms - Number of permutations that need to be searched. Narrow your filters to reduce permutations & search time",
         "p3": "Searched - Number of permutations already searched",
         "p4": "Results - Number of displayed results that satisfy the stat filters"
         */
      ),
    }
  },

  enemyOptions: (): HintContent => {
    return {
      title: i18next.t('hint:EnemyOptions.Title'),
      content: (
        <Flex vertical gap={10}>
          <p>{i18next.t('hint:EnemyOptions.p1')}</p>
          <p>{i18next.t('hint:EnemyOptions.p2')}</p>
          <p>{i18next.t('hint:EnemyOptions.p3')}</p>
          <p>{i18next.t('hint:EnemyOptions.p4')}</p>
          <p>{i18next.t('hint:EnemyOptions.p5')}</p>
          <p>{i18next.t('hint:EnemyOptions.p6')}</p>
          <p>{i18next.t('hint:EnemyOptions.p7')}</p>
        </Flex>
        /* Title: Enemy options
      p1: Level - Enemy level, affects enemy DEF calculations
      p2: Effect RES - Enemy effect RES. Effect res is used for calculations relating to DOT damage
      p3: Damage RES - Enemy elemental RES. RES is set to 0 when the enemy's elemental weakness is enabled.
      p4: Max toughness - Enemy's maximum toughness bar value. Affects calculations related to break damage.
      p5: Targets - Number of targets in the battle. The target enemy is always assumed to be in the center, and damage calculations are only for the single primary target.
      p6: Elemental weakness - Whether the enemy is weak to the character's type. Enabling this sets enemy elemental RES % to 0.
      p7: Weakness broken - Whether the enemy's toughness bar is broken. Affects damage calculations and certain character passives. */
      ),
    }
  },

  substatWeightFilter: (): HintContent => {
    return {
      title: i18next.t('hint:SubstatWeightFilter.Title'),
      content: (
        <Flex vertical gap={10}>
          <p>{i18next.t('hint:SubstatWeightFilter.p1')}</p>
          <p>{i18next.t('hint:SubstatWeightFilter.p2')}</p>
          <p>{i18next.t('hint:SubstatWeightFilter.p3')}</p>
          <p>{i18next.t('hint:SubstatWeightFilter.p4')}</p>
        </Flex>
        /*
         "Title": "Substat weight filter",
         "p1": "This filter is used to reduce the number of permutations the optimizer has to process.",
         "p2": "It works by first scoring each relic per slot by the weights defined, then filtering by the number of weighted min rolls the relic has.",
         "p3": "Only relics that have more than the specified number of weighted rolls will be used for the optimization search.",
         "p4": "Note that setting the minimum rolls too low may result in some builds not being displayed, if the filter ends up excludes a key relic. Use this filter with caution, but on large searches it makes a large impact on reducing search time."
         */
      ),
    }
  },

  statDisplay: (): HintContent => {
    return {
      title: i18next.t('hint:StatDisplay.Title'),
      content: (
        <Flex vertical gap={10}>
          <p>{i18next.t('hint:StatDisplay.p1')}</p>
          <p>{i18next.t('hint:StatDisplay.p2')}</p>
          <p>{i18next.t('hint:StatDisplay.p3')}</p>
        </Flex>
        /*
         "Title": "Stat and filter view",
         "p1": "This allows for switching between viewing results as Base stats vs Combat stats. Stat filters will also be applied to the selected view.",
         "p2": "Base stats - The stats as shown on the character's screen ingame, with no in-combat buffs applied.",
         "p3": "Combat stats - The character's stats with all stat modifiers in combat included: ability buffs, character & light cone passives, teammates, conditional set effects, etc."
         */
      ),
    }
  },

  valueColumns: (): HintContent => {
    return {
      title: i18next.t('hint:ValueColumns.Title'),
      content: (
        <Flex vertical gap={10}>
          <p>{i18next.t('hint:ValueColumns.p1')}</p>
          <p>
            <b>{i18next.t('hint:ValueColumns.p2')}</b>
          </p>
          <p>{i18next.t('hint:ValueColumns.p3')}</p>
          <p>{i18next.t('hint:ValueColumns.p4')}</p>
          <p>{i18next.t('hint:ValueColumns.p5')}</p>
          <p>{i18next.t('hint:ValueColumns.p6')}</p>
        </Flex>
        /*
         "Title": "Value Columns",
         "p1": "You can optionally display a number of columns that assess the relative 'value' of a relic.",
         "p2": "Weight",
         "p3": "Weight columns assess the contribution of a particular relic to the overall letter grading of the selected recommendation character (if any).",
         "p4": "Weight can show the current value of a relic, the possible best case upgraded weight, or an 'average' weight that you're more likely to see",
         "p5": "Weight is useful to focus on a single character and see which relics might give them a higher letter grading.",
         "p6": "Potential",
         "p7": "Potential is a character-specific percentage of how good the relic could be (or 'is', if fully upgraded), compared against the stats on a fully upgraded 'perfect' relic in that slot.",
         "p8": "Potential can look at all characters or just owned. It then takes the maximum percentage for any character.",
         "p9": "Potential is useful for finding relics that aren't good on any character, or hidden gems that could be great when upgraded.",
         "p10": "Note: ordering by potential can be mismatched against weights, due to weight calculations preferring lower weight ideal mainstats."
         */
      ),
    }
  },

  relicInsight: (): HintContent => {
    return {
      title: i18next.t('hint:RelicInsights.Title'), /* Relic Insight */
      content: (() => {
        const { t } = useTranslation('hint', { keyPrefix: 'RelicInsights' })
        return (
          <Flex vertical gap={10}>
            <p>{t('p1') /* When a relic is selected in the table above, you can choose an analysis to view a plot of. */}</p>
            <p>
              <Trans t={t} i18nKey='p2'>
                'Buckets' looks at how perfect this relic could be (with the best possible upgrade rolls) for each character, and buckets them into percentages.
                <br />
                If you hover over a character portrait you'll see the new stats and/or rolls necessary to reach the max potential of this relic.
                <br />
                ⚠️ Relics with missing substats may have misleadingly high buckets, as best-case upgrade analysis assumes the best new substat per character.
              </Trans>
            </p>
            <p>
              {
                t(
                  'p3',
                ) /* 'Top 10' takes the top 10 characters that this relic could be best for, and shows the range of '% perfection' upgrading this relic could result in. */
              }
            </p>
          </Flex>
        )
      })(),
    }
  },

  relicLocation: (): HintContent => {
    return {
      title: i18next.t('hint:RelicLocation.Title'), /* Relic Location */
      content: (
        <Flex vertical gap={10}>
          <p>{i18next.t('hint:RelicLocation.p1') /* When a relic is selected in the grid, its position in the ingame inventory is displayed here. */}</p>
          <p>
            {
              i18next.t('hint:RelicLocation.p2')
              /* If the set / part filters are active, apply those same filters ingame, then sort by Date Obtained (newest first) to find the relic. */
            }
          </p>

          <Flex vertical>
            <div>{i18next.t('hint:RelicLocation.p3') /* ⚠️Usage notes⚠️ */}</div>
            <ul>
              <li>{i18next.t('hint:RelicLocation.p4') /* This is only supported with Reliquary Archiver import */}</li>
              <li>
                {i18next.t('hint:RelicLocation.p5') /* If new relics were deleted or obtained since the last import, they must be re-scanned and imported */}
              </li>
              <li>
                {
                  i18next.t('hint:RelicLocation.p6')
                  /* Select the appropriate Inventory width setting to get accurate locations. The width depends on the ingame screen and menu width */
                }
              </li>
            </ul>
          </Flex>
        </Flex>
      ),
    }
  },

  locatorParams: (): HintContent => {
    return {
      title: i18next.t('hint:LocatorParams.Title'), /* Relic Locator Options */
      content: (() => {
        const { t } = useTranslation('hint', { keyPrefix: 'LocatorParams' })
        return (
          <Flex vertical gap={8}>
            <p>
              <Trans t={t} i18nKey='p1'>
                <strong>Inventory Width</strong>
                - Select the number of columns the inventory has ingame so that the relic locator can find your relic accurately
              </Trans>
            </p>
            <p>
              <Trans t={t} i18nKey='p2'>
                <strong>Auto Filter rows</strong>
                - Maximum number of rows before the relic locator applies a part/set filter to try and bring the searched relic closer to the top of your
                inventory
              </Trans>
            </p>
          </Flex>
        )
      })(),
    }
  },
}

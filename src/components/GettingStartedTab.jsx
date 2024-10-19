import { useEffect, useMemo, useState } from 'react'
import { Button, Divider, Flex, Popconfirm, theme, Typography } from 'antd'
import { Message } from 'lib/message'

import sampleSave from '../data/sample-save.json'
import DB, { AppPages } from '../lib/db'
import PropTypes from 'prop-types'
import { Assets } from 'lib/assets'
import { KelzScannerConfig } from 'lib/importer/importConfig'
import { ImportOutlined } from '@ant-design/icons'
import { ColorizedLinkWithIcon } from 'components/common/ColorizedLink'
import { ReliquaryDescription } from './importerTab/ReliquaryDescription'
import { Trans, useTranslation } from 'react-i18next'
import { SaveState } from 'lib/saveState'

const { useToken } = theme
const { Text } = Typography

export default function GettingStartedTab() {
  const { t, i18n } = useTranslation('getStartedTab')
  const { token } = useToken()
  const assetURLs = useMemo(() => {
    return {
      quickstart: Assets.getLocaleGuideImage('quickstart', i18n.resolvedLanguage),
      characterOptions: Assets.getLocaleGuideImage('characterOptions', i18n.resolvedLanguage),
      relicFilters: Assets.getLocaleGuideImage('relicFilters', i18n.resolvedLanguage),
      sets: Assets.getLocaleGuideImage('sets', i18n.resolvedLanguage),
      teammateOptions: Assets.getLocaleGuideImage('teammateOptions', i18n.resolvedLanguage),
      resultsGrid: Assets.getLocaleGuideImage('resultsGrid', i18n.resolvedLanguage),
      characterTab: Assets.getLocaleGuideImage('characterTab', i18n.resolvedLanguage),
      relicsGrid: Assets.getLocaleGuideImage('relicsGrid', i18n.resolvedLanguage),
    }
  }, [i18n.resolvedLanguage])
  console.log('======================================================================= RENDER GettingStartedTab')

  function tryItOutClicked() {
    DB.setStore(JSON.parse(JSON.stringify(sampleSave)), false)
    SaveState.save()

    Message.success(t('TryOut.SuccessMessage'))// 'Successfully loaded data'
  }

  const [imageLoadFailed, setImageLoadFailed] = useState(false)

  useEffect(() => {
    setImageLoadFailed(false)
  }, [i18n.resolvedLanguage])

  const screenshotStyle = { border: `2px solid ${token.colorBgContainer}` }
  const dividerStyle = { marginTop: 40 }
  const titleStyle = { textDecoration: 'underline' }
  return (
    <div>
      <Text>
        <Flex vertical gap={5} style={{ marginLeft: 20, marginBottom: 50, width: 1000 }}>
          <h1>
            <u>{t('TryOut.Header')/* Try it out! */}</u>
          </h1>

          <Trans t={t} i18nKey='TryOut.Option 1'>
            <h3>
              Option 1: Load a sample save
            </h3>
            <p>
              If you would like to give the optimizer a try before doing any relic importing, use this to load a sample
              save file and check out the features.
            </p>
          </Trans>

          <Popconfirm
            title={t('TryOut.title')}// Try it out!
            description={t('TryOut.description')}// 'Load a sample save file?'
            onConfirm={tryItOutClicked}
            placement='bottom'
            okText={t('TryOut.okText')}// 'Yes'
            cancelText={t('TryOut.cancelText')}// 'Cancel'
          >
            <Button type='primary' icon={<ImportOutlined/>} style={{ width: 200 }}>
              {t('TryOut.ButtonText')/* Try it out! */}
            </Button>
          </Popconfirm>

          <Trans t={t} i18nKey='TryOut.Option 2'>
            <h3>
              Option 2: One-click-optimize from the Relic Scorer
            </h3>

            <img
              src={assetURLs.quickstart}
              style={screenshotStyle}
              onError={(e) => {
                setImageLoadFailed(true)
                e.target.src = Assets.getGuideImage('quickstart')
              }}
              onLoad={(e) => {
                if (e.target.src == assetURLs.quickstart || imageLoadFailed) return
                e.target.src = assetURLs.quickstart
              }}
            />

            <p>
              From the <span onClick={() => window.store.getState().setActiveKey(AppPages.RELIC_SCORER)}><ColorizedLinkWithIcon linkIcon={true}/></span> tab, clicking on the Optimize Character Stats button will automatically import and run the
              optimizer on your selected character. This option will only be able to use the relics from your profile's
              showcase characters, so it is still recommended to use a scanner to import your full inventory of relics,
              but this allows for a quick calculation of character stats in combat.
            </p>
          </Trans>

          <Divider style={dividerStyle}></Divider>
          {/* ======================================================================================================================= */}

          <h1>
            <u>{t('HowTo.Header')/* How do I use the optimizer? */}</u>
          </h1>

          <Trans t={t} i18nKey='HowTo.Step 1'>
            <h2>
              Step 1: Import relics
            </h2>

            <p>
              The optimizer needs a database of relics to run against. Install and run one of the relic scanner options:
            </p>

            <ul>
              <ReliquaryDescription/>

              <li>
                Kel-Z HSR Scanner (
                <ColorizedLinkWithIcon linkIcon={true} url={KelzScannerConfig.releases}/>
                )
                <ul>
                  <li>OCR scanner</li>
                  <li>Supports all 16:9 screen resolutions</li>
                </ul>
              </li>

              <li>
                Relic Scorer Import (
                <span onClick={() => window.store.getState().setActiveKey(AppPages.RELIC_SCORER)}>
                  <ColorizedLinkWithIcon linkIcon={true}/>
                </span>
                )
                <ul>
                  <li>No download needed, but limited to relics from the 8 characters on profile showcase</li>
                  <li>Imports accurate speed decimals</li>
                </ul>
              </li>
            </ul>
          </Trans>
          <Trans t={t} i18nKey='HowTo.Step 2'>
            <h2>
              Step 2: Select a character
            </h2>

            <img
              src={assetURLs.characterOptions}
              style={screenshotStyle}
              onError={(e) => {
                setImageLoadFailed(true)
                e.target.src = Assets.getGuideImage('characterOptions')
              }}
              onLoad={(e) => {
                if (e.target.src == assetURLs.characterOptions || imageLoadFailed) return
                e.target.src = assetURLs.characterOptions
              }}
            />

            <p>
              Select a character and light cone from the Character Options menu. Next, use the Recommended Presets
              button to select a preset speed target to optimize for. For most characters, the 133 speed breakpoint
              is recommended, and this will set a minimum speed for your optimization resukts. This preset will also
              automatically fill out the ideal main stats and relic set conditionals for the optimizer.
            </p>

            <p>
              Once a character is chosen, their ability passives and light cone passives can be customized. These
              selectors will affect the final combat stats and damage calculations for the character. For the first run
              these can be left as default.
            </p>

            <p>
              Most of the Enemy Options and Optimizer Options can be left as default to get started. One important
              option is the Character Priority filter setting, which defines which relics the character may steal from
              other characters. Characters can only take relics from lower priority characters, so for the first run
              set this priority to #1, but later on your characters list should be ordered by which characters have the
              highest priority for taking gear.
            </p>
          </Trans>
          <Trans t={t} i18nKey='HowTo.Step 3'>
            <h2>
              Step 3: Apply filters
            </h2>

            <img
              src={assetURLs.relicFilters}
              style={screenshotStyle}
              onError={(e) => {
                setImageLoadFailed(true)
                e.target.src = Assets.getGuideImage('relicFilters')
              }}
              onLoad={(e) => {
                if (e.target.src == assetURLs.relicFilters || imageLoadFailed) return
                e.target.src = assetURLs.relicFilters
              }}
            />

            <h4 style={titleStyle}>
              Main Stats
            </h4>

            <p>
              The main stat filters limits optimizer to using preferred body, feet, planar sphere, and
              link rope main stats. Multiple options can be chosen for each slot. The Recommended Presets button will
              fill these out with each character's ideal stats, but these can be customized for other builds.
            </p>

            <h4 style={titleStyle}>
              Set filters
            </h4>

            <img
              src={assetURLs.sets}
              style={screenshotStyle}
              onError={(e) => {
                setImageLoadFailed(true)
                e.target.src = Assets.getGuideImage('sets')
              }}
              onLoad={(e) => {
                if (e.target.src == assetURLs.sets || imageLoadFailed) return
                e.target.src = assetURLs.sets
              }}
            />

            <p>
              The relic set filter allows for a combination of 2-piece sets, 4-piece sets, or can be left empty.
              When multiple options are chosen, the search results will only show builds with least one of the selected
              filters active.
              Conditional set effects can be customized from the menu.
            </p>

            <h4 style={titleStyle}>
              Stat min / max filters
            </h4>

            <p>
              This section defines the minimum / maximum stats to filter the results by.
              Left side is minimum and right side is maximum, both inclusive. In this above example, only results
              with &ge; 134 speed AND &ge; 35% Crit Rate are shown.
              Stat abbreviations are ATK / HP / DEF / SPD / Crit Rate / Crit Damage / Effect Hit Rate / Effect RES /
              Break Effect.
            </p>

            <p>
              Important note: relics typed in manually or imported with the OCR tool may be affected by hidden decimal
              points for speed that aren't shown by ingame stats.
              For example, 5 star relics can have speed substats of values between 2.0 - 2.6, which would all show
              ingame as 2.
              This means that speed results should be treated as minimum values, as the real value may be slightly
              higher ingame.
              This also means that maximum filters on speed should be used carefully since they may be too restrictive.
            </p>
          </Trans>
          <Trans t={t} i18nKey='HowTo.Step 4'>
            <h2>
              Step 4: Select teammates
            </h2>

            <img
              src={assetURLs.teammateOptions}
              style={screenshotStyle}
              onError={(e) => {
                setImageLoadFailed(true)
                e.target.src = Assets.getGuideImage('teammateOptions')
              }}
              onLoad={(e) => {
                if (e.target.src == assetURLs.teammateOptions || imageLoadFailed) return
                e.target.src = assetURLs.teammateOptions
              }}
            />

            <p>
              In this menu, select the 3 teammates that you're using with the main character. These teammates will apply
              their buffs and passive effects to the calculations. The relic/ornament sets and conditionals can be
              customized to fit the combat scenario.
            </p>
          </Trans>

          <Trans t={t} i18nKey='HowTo.Step 5'>
            <h2>
              Step 5: Save results
            </h2>

            <img
              src={assetURLs.resultsGrid}
              style={screenshotStyle}
              onError={(e) => {
                setImageLoadFailed(true)
                e.target.src = Assets.getGuideImage('resultsGrid')
              }}
              onLoad={(e) => {
                if (e.target.src == assetURLs.resultsGrid || imageLoadFailed) return
                e.target.src = assetURLs.resultsGrid
              }}
            />

            <h4 style={titleStyle}>
              Result rows
            </h4>

            <p>
              This section displays all the results found that match the filters.
              Every row represents one build that was found.
              The pinned top row shows the character's currently equipped build.
              Clicking on each row will show the relics used in the selected build.
              There may be multiple pages of results, so clicking a column header to sort the results by a stat or
              rating can make it easier to find desired builds.
            </p>

            <h4 style={titleStyle}>
              Permutations
            </h4>

            <p>
              This section shows the number of permutations the optimizer has to search and details on the number of
              matching relics per slot.
              If any of the numbers are zero, that indicates that no relics were found that would satisfy the
              constraints.
            </p>

            <ul>
              <li>Perms - Number of permutations that need to be searched. Stricter filters will reduce permutations and
                search time
              </li>
              <li>Searched - Number of permutations completed in an in-progress search</li>
              <li>Results - Number of displayed results that satisfy the stat filters</li>
            </ul>

            <h4 style={titleStyle}>
              Selected build
            </h4>
            <p>
              This section displays the selected build from the grid, and which relics are used & who they are currently
              equipped on.
              Pressing the 'Equip' button will assign the relics to the selected character in the optimizer, though the
              ingame character build is not affected.
            </p>
          </Trans>

          <Divider style={dividerStyle}></Divider>
          {/* ======================================================================================================================= */}

          <Trans t={t} i18nKey='CharacterTab'>
            <h2>
              Character tab
            </h2>

            <img
              src={assetURLs.characterTab}
              style={screenshotStyle}
              onError={(e) => {
                setImageLoadFailed(true)
                e.target.src = Assets.getGuideImage('characterTab')
              }}
              onLoad={(e) => {
                if (e.target.src == assetURLs.characterTab || imageLoadFailed) return
                e.target.src = assetURLs.characterTab
              }}
            />

            <h4 style={titleStyle}>
              Character priority
            </h4>

            <p>
              This section displays all the optimized characters and their priority order.
              Characters are added to this list from the Optimizer tab, when their filters are applied and 'Start' is
              pressed.
            </p>

            <p>
              The ranking is important when used with the 'Priority filter' on the Optimizer tab.
              When enabled, characters may only take relics from lower priority characters.
              For example, the priority #2 character may take relics from priority #3, but cannot take from priority #2.
              Priority #1 can take from any other character.
              Rows can be dragged to re-order characters.
            </p>

            <p>
              The colored highlight on the right of the grid shows the equipped item status of the character.
              In the above example, Jingliu's green indicator means she has all 6 relics equipped, Bronya's yellow
              indicator means she is missing at least one relic from her build, and Natasha's red indicator means she
              has no relics equipped.
            </p>

            <h4 style={titleStyle}>
              Stats summary
            </h4>

            <p>
              This section displays the character's stats with their base stats / light cone / maxed traces / and relics
              equipped in the optimizer.
              Note that similar to the optimizer results, the actual values ingame may be slightly higher than displayed
              here due to hidden decimal values on relic stats.
            </p>
          </Trans>

          <Divider style={dividerStyle}></Divider>
          {/* ======================================================================================================================= */}
          <Trans t={t} i18nKey='RelicsTab'>
            <h2>
              Relics tab
            </h2>

            <img
              src={assetURLs.relicsGrid}
              style={screenshotStyle}
              onError={(e) => {
                setImageLoadFailed(true)
                e.target.src = Assets.getGuideImage('relicsGrid')
              }}
              onLoad={(e) => {
                if (e.target.src == assetURLs.relicsGrid || imageLoadFailed) return
                e.target.src = assetURLs.relicsGrid
              }}
            />
            <h4 style={titleStyle}>
              Relics table
            </h4>

            <p>
              This section displays all the relics that were added / imported into the optimizer.
              Relics should be updated occasionally with the importer to add in newly acquired relics.
              Clicking columns will sort the relics table.
            </p>
          </Trans>
        </Flex>
      </Text>
    </div>
  )
}
GettingStartedTab.propTypes = {
  active: PropTypes.bool,
}

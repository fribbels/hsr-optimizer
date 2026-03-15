import { IconSettings } from '@tabler/icons-react'
import { Button, Flex } from '@mantine/core'
import {
  Constants,
  Parts,
} from 'lib/constants/constants'
import {
  OpenCloseIDs,
  setOpen,
} from 'lib/hooks/useOpenClose'
import { Hint } from 'lib/interactions/hint'
import { Assets } from 'lib/rendering/assets'
import { MainStatPart } from 'lib/stores/optimizerForm/optimizerFormTypes'
import { useOptimizerRequestStore } from 'lib/stores/optimizerForm/useOptimizerRequestStore'
import { useOrnamentsOptions } from 'lib/tabs/tabOptimizer/optimizerForm/components/OrnamentsOptions'
import { RelicSetTagRenderer } from 'lib/tabs/tabOptimizer/optimizerForm/components/RelicSetTagRenderer'
import {
  decodeRelicSetValue,
  encodeRelicSetValue,
  GenerateSetsGroupedOptions,
} from 'lib/tabs/tabOptimizer/optimizerForm/components/SetsOptions'
import { recalculatePermutations } from 'lib/tabs/tabOptimizer/optimizerForm/optimizerFormActions'
import {
  optimizerTabDefaultGap,
  panelWidth,
} from 'lib/tabs/tabOptimizer/optimizerForm/grid/optimizerGridColumns'
import { HeaderText } from 'lib/ui/HeaderText'
import { MultiSelectPills } from 'lib/ui/MultiSelectPills'
import { TooltipImage } from 'lib/ui/TooltipImage'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import classes from './RelicMainSetFilters.module.css'

function handleMainStatChange(field: MainStatPart, val: string[]) {
  useOptimizerRequestStore.getState().setMainStats(field, val)
  recalculatePermutations()
}

const mainStatStyle = { width: panelWidth }

function MainStatBody() {
  const { t } = useTranslation('common')
  const value = useOptimizerRequestStore((s) => s.mainBody)
  return (
    <MultiSelectPills
      clearable
      size="xs"
      style={mainStatStyle}
      placeholder={t('Parts.Body')}
      rightSection={<img className={classes.partIcon} src={Assets.getPart(Parts.Body)} />}
      value={value}
      onChange={(val) => handleMainStatChange('mainBody', val)}
      data={[
        { value: Constants.Stats.HP_P, label: t('ShortStats.HP%') },
        { value: Constants.Stats.ATK_P, label: t('ShortStats.ATK%') },
        { value: Constants.Stats.DEF_P, label: t('ShortStats.DEF%') },
        { value: Constants.Stats.CR, label: t('ShortStats.CRIT Rate') },
        { value: Constants.Stats.CD, label: t('ShortStats.CRIT DMG') },
        { value: Constants.Stats.EHR, label: t('ShortStats.Effect Hit Rate') },
        { value: Constants.Stats.OHB, label: t('ShortStats.Outgoing Healing Boost') },
      ]}
    />
  )
}

function MainStatFeet() {
  const { t } = useTranslation('common')
  const value = useOptimizerRequestStore((s) => s.mainFeet)
  return (
    <MultiSelectPills
      clearable
      size="xs"
      style={mainStatStyle}
      placeholder={t('Parts.Feet')}
      rightSection={<img className={classes.partIcon} src={Assets.getPart(Parts.Feet)} />}
      value={value}
      onChange={(val) => handleMainStatChange('mainFeet', val)}
      data={[
        { value: Constants.Stats.HP_P, label: t('ShortStats.HP%') },
        { value: Constants.Stats.ATK_P, label: t('ShortStats.ATK%') },
        { value: Constants.Stats.DEF_P, label: t('ShortStats.DEF%') },
        { value: Constants.Stats.SPD, label: t('ShortStats.SPD') },
      ]}
    />
  )
}

function MainStatPlanarSphere() {
  const { t } = useTranslation('common')
  const value = useOptimizerRequestStore((s) => s.mainPlanarSphere)
  return (
    <MultiSelectPills
      clearable
      size="xs"
      style={mainStatStyle}
      placeholder={t('Parts.PlanarSphere')}
      maxDropdownHeight={400}
      rightSection={<img className={classes.partIcon} src={Assets.getPart(Parts.PlanarSphere)} />}
      value={value}
      onChange={(val) => handleMainStatChange('mainPlanarSphere', val)}
      data={[
        { value: Constants.Stats.HP_P, label: t('ShortStats.HP%') },
        { value: Constants.Stats.ATK_P, label: t('ShortStats.ATK%') },
        { value: Constants.Stats.DEF_P, label: t('ShortStats.DEF%') },
        { value: Constants.Stats.Physical_DMG, label: t('ShortStats.Physical DMG Boost') },
        { value: Constants.Stats.Fire_DMG, label: t('ShortStats.Fire DMG Boost') },
        { value: Constants.Stats.Ice_DMG, label: t('ShortStats.Ice DMG Boost') },
        { value: Constants.Stats.Lightning_DMG, label: t('ShortStats.Lightning DMG Boost') },
        { value: Constants.Stats.Wind_DMG, label: t('ShortStats.Wind DMG Boost') },
        { value: Constants.Stats.Quantum_DMG, label: t('ShortStats.Quantum DMG Boost') },
        { value: Constants.Stats.Imaginary_DMG, label: t('ShortStats.Imaginary DMG Boost') },
      ]}
    />
  )
}

function MainStatLinkRope() {
  const { t } = useTranslation('common')
  const value = useOptimizerRequestStore((s) => s.mainLinkRope)
  return (
    <MultiSelectPills
      clearable
      size="xs"
      style={mainStatStyle}
      placeholder={t('Parts.LinkRope')}
      rightSection={<img className={classes.partIcon} src={Assets.getPart(Parts.LinkRope)} />}
      value={value}
      onChange={(val) => handleMainStatChange('mainLinkRope', val)}
      data={[
        { value: Constants.Stats.HP_P, label: t('ShortStats.HP%') },
        { value: Constants.Stats.ATK_P, label: t('ShortStats.ATK%') },
        { value: Constants.Stats.DEF_P, label: t('ShortStats.DEF%') },
        { value: Constants.Stats.BE, label: t('ShortStats.Break Effect') },
        { value: Constants.Stats.ERR, label: t('ShortStats.Energy Regeneration Rate') },
      ]}
    />
  )
}

function RelicSetSelector() {
  const { t } = useTranslation('optimizerTab')
  const relicSets = useOptimizerRequestStore((s) => s.relicSets)
  const relicSetsValue = useMemo(
    () => (relicSets ?? []).map((tuple) => encodeRelicSetValue(tuple)),
    [relicSets],
  )
  const setsGroupedOptions = useMemo(() => GenerateSetsGroupedOptions(), [t])

  return (
    <MultiSelectPills
      placeholder={t('RelicSetSelector.Placeholder')}
      data={setsGroupedOptions}
      maxDropdownHeight={400}
      maxDisplayedValues={1}
      searchable
      clearable
      value={relicSetsValue}
      onChange={(val) => {
        const decoded = val.map((v) => decodeRelicSetValue(v)) as typeof relicSets
        useOptimizerRequestStore.getState().setRelicSets(decoded)
        recalculatePermutations()
      }}
      renderOption={(option) => RelicSetTagRenderer(option.value)}
    />
  )
}

function OrnamentSetSelector() {
  const { t } = useTranslation('optimizerTab')
  const ornamentSets = useOptimizerRequestStore((s) => s.ornamentSets)
  const ornamentOptions = useOrnamentsOptions()

  return (
    <MultiSelectPills
      dropdownWidth={250}
      maxDropdownHeight={800}
      maxDisplayedValues={1}
      clearable
      style={mainStatStyle}
      data={ornamentOptions.map((opt) => ({ value: opt.value, label: opt.value }))}
      placeholder={t('OrnamentSetSelector.Placeholder')}
      value={ornamentSets}
      onChange={(val) => {
        useOptimizerRequestStore.getState().setOrnamentSets(val as typeof ornamentSets)
        recalculatePermutations()
      }}
    />
  )
}

export function RelicMainSetFilters() {
  const { t } = useTranslation('optimizerTab')

  return (
    <Flex direction="column" gap={optimizerTabDefaultGap}>
      <Flex justify='space-between' align='center'>
        <HeaderText>{t('MainStats') /* Main stats */}</HeaderText>
        <TooltipImage type={Hint.mainStats()} />
      </Flex>
      <Flex direction="column" gap={7}>
        <MainStatBody />
        <MainStatFeet />
        <MainStatPlanarSphere />
        <MainStatLinkRope />
      </Flex>

      <Flex justify='space-between' align='center' className={classes.setsHeader}>
        <HeaderText>{t('Sets') /* Sets */}</HeaderText>
        <TooltipImage type={Hint.sets()} />
      </Flex>

      <Flex direction="column" gap={7}>
        <RelicSetSelector />
        <OrnamentSetSelector />
        <Button
          variant="default"
          onClick={() => setOpen(OpenCloseIDs.OPTIMIZER_SETS_DRAWER)}
          leftSection={<IconSettings size={16} />}
        >
          {t('SetConditionals.Title') /* Conditional set effects */}
        </Button>
      </Flex>
    </Flex>
  )
}

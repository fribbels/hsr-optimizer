import { Drawer, Flex, Form, Popover, Select, Switch, Typography } from 'antd'
import { Constants, setToId } from 'lib/constants/constants'
import { Assets } from 'lib/rendering/assets'
import ColorizeNumbers from 'lib/ui/ColorizeNumbers'
import { VerticalDivider } from 'lib/ui/Dividers'
import { HeaderText } from 'lib/ui/HeaderText'
import PropTypes from 'prop-types'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

const { Text } = Typography

const setConditionalsIconWidth = 40
const setConditionalsNameWidth = 200
const setConditionalsWidth = 80
const defaultGap = 5

export function FormSetConditionals() {
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'SetConditionals' })
  const conditionalSetEffectsDrawerOpen = window.store((s) => s.conditionalSetEffectsDrawerOpen)
  const setConditionalSetEffectsDrawerOpen = window.store((s) => s.setConditionalSetEffectsDrawerOpen)

  const setChampionOfStreetwiseBoxingOptions = useMemo(() => {
    const options = []
    for (let i = 0; i <= 5; i++) {
      options.push({
        display: t('SelectOptions.Streetwise.Display', { stackCount: i }), // i + 'x',
        value: i,
        label: t('SelectOptions.Streetwise.Label', { stackCount: i, buffValue: 5 * i }), // `${i} stacks (+${i * 5}% ATK)`,
      })
    }

    return options
  }, [t])
  const setWastelanderOfBanditryDesert = useMemo(() => {
    return [
      {
        display: t('SelectOptions.Wastelander.Off.Display'), // 'Off',
        value: 0,
        label: t('SelectOptions.Wastelander.Off.Label'), // 'Off',
      },
      {
        display: t('SelectOptions.Wastelander.Debuffed.Display'), // 'CR',
        value: 1,
        label: t('SelectOptions.Wastelander.Debuffed.Label'), // 'Debuffed (+10% CR)',
      },
      {
        display: t('SelectOptions.Wastelander.Imprisoned.Display'), // 'CR+CD',
        value: 2,
        label: t('SelectOptions.Wastelander.Imprisoned.Label'), // 'Imprisoned (+10% CR | +20% CD)',
      },
    ]
  }, [t])
  const setSacerdosRelivedOrdealOptions = useMemo(() => {
    const options = []
    for (let i = 0; i <= 2; i++) {
      options.push({
        display: t('SelectOptions.Sacerdos.Display', { stackCount: i }), // i + 'x',
        value: i,
        label: t('SelectOptions.Sacerdos.Label', { stackCount: i, buffValue: 18 * i }), // `${i} stacks (+${i * 8}% CD)`,
      })
    }

    return options
  }, [t])
  const setLongevousDiscipleOptions = useMemo(() => {
    const options = []
    for (let i = 0; i <= 2; i++) {
      options.push({
        display: t('SelectOptions.Longevous.Display', { stackCount: i }), // i + 'x',
        value: i,
        label: t('SelectOptions.Longevous.Label', { stackCount: i, buffValue: 8 * i }), // `${i} stacks (+${i * 8}% CR)`,
      })
    }

    return options
  }, [t])
  const setTheAshblazingGrandDukeOptions = useMemo(() => {
    const options = []
    for (let i = 0; i <= 8; i++) {
      options.push({
        display: t('SelectOptions.Ashblazing.Display', { stackCount: i }), // i + 'x',
        value: i,
        label: t('SelectOptions.Ashblazing.Label', { stackCount: i, buffValue: 6 * i }), // `${i} stacks (+${6 * i}% ATK)`,
      })
    }

    return options
  }, [t])
  const setPrisonerInDeepConfinementOptions = useMemo(() => {
    const options = []
    for (let i = 0; i <= 3; i++) {
      options.push({
        display: t('SelectOptions.Prisoner.Display', { stackCount: i }), // i + 'x',
        value: i,
        label: t('SelectOptions.Prisoner.Label', { stackCount: i, buffValue: 6 * i }), // `${i} stacks (+${6 * i}% DEF ignore)`,
      })
    }

    return options
  }, [t])
  const setPioneerDiverOfDeadWaters = useMemo(() => {
    return [
      {
        display: t('SelectOptions.Diver.Off.Display'), // '0x',
        value: -1,
        label: t('SelectOptions.Diver.Off.Label'), // '0 debuffs (+4% base CR)',
      },
      {
        display: t('SelectOptions.Diver.1Debuff.Display'), // '1x',
        value: 0,
        label: t('SelectOptions.Diver.1Debuff.Label'), // '1 debuff (+12% DMG | +4% base CR)',
      },
      {
        display: t('SelectOptions.Diver.2Debuff.Display'), // '2x',
        value: 1,
        label: t('SelectOptions.Diver.2Debuff.Label'), // '2 debuffs (+12% DMG | +4% base CR | +8% CD)',
      },
      {
        display: t('SelectOptions.Diver.3Debuff.Display'), // '3x',
        value: 2,
        label: t('SelectOptions.Diver.3Debuff.Label'), // '3 debuffs (+12% DMG | +4% base CR | +12% CD)',
      },
      {
        display: t('SelectOptions.Diver.2+Debuff.Display'), // '2x +',
        value: 3,
        label: t('SelectOptions.Diver.2+Debuff.Label'), // '2 debuffs, enhanced (+12% DMG | +4% base CR | +4% combat CR | +16% CD)',
      },
      {
        display: t('SelectOptions.Diver.3+Debuff.Display'), // '3x +',
        value: 4,
        label: t('SelectOptions.Diver.3+Debuff.Label'), // '3 debuffs, enhanced (+12% DMG | +4% base CR | +4% combat CR | +24% CD)',
      },
    ]
  }, [t])
  const setSigoniaTheUnclaimedDesolation = useMemo(() => {
    const options = []
    for (let i = 0; i <= 10; i++) {
      options.push({
        display: t('SelectOptions.Sigonia.Display', { stackCount: i }), // i + 'x',
        value: i,
        label: t('SelectOptions.Sigonia.Label', { stackCount: i, buffValue: 4 * i }), // `${i} stacks (+${4 * i}% CD)`,
      })
    }

    return options
  }, [t])
  const setDuranDynastyOfRunningWolves = useMemo(() => {
    const options = []
    for (let i = 0; i <= 5; i++) {
      options.push({
        display: t('SelectOptions.Duran.Display', { stackCount: i }), // i + 'x',
        value: i,
        label: t('SelectOptions.Duran.Label', { stackCount: i, buffValue: 5 * i }), // `${i} stacks (+${5 * i}% FUA DMG)`,
      })
    }

    options[5].label = t('SelectOptions.Duran.Label5') // `${5} stacks (+${5 * 5}% FUA DMG + 25% CD)`

    return options
  }, [t])

  // defaultMessage = 'Enabled by default - effects will apply to combat calculations.'

  return (
    <Drawer
      title={t('Title')}// 'Conditional set effects'
      placement='right'
      onClose={() => setConditionalSetEffectsDrawerOpen(false)}
      open={conditionalSetEffectsDrawerOpen}
      width={750}
      forceRender
    >
      <Flex justify='center'>
        <Flex vertical gap={defaultGap}>
          <Flex gap={defaultGap} align='center' justify='flex-start'>
            <Text style={{ width: setConditionalsIconWidth }}></Text>
            <Text style={{ width: setConditionalsNameWidth }}></Text>
          </Flex>

          <ConditionalSetOption
            set={Constants.Sets.PasserbyOfWanderingCloud}
            description={t('RelicDescription', { id: 101 })}
            conditional={t('Conditionals.DefaultMessage')}
            p4Checked
          />
          <ConditionalSetOption
            set={Constants.Sets.MusketeerOfWildWheat}
            description={t('RelicDescription', { id: 102 })}
            conditional={t('Conditionals.DefaultMessage')}
            p4Checked
          />
          <ConditionalSetOption
            set={Constants.Sets.KnightOfPurityPalace}
            description={t('RelicDescription', { id: 103 })}
            conditional={t('Conditionals.DefaultMessage')}
            p4Checked
          />
          <ConditionalSetOption
            set={Constants.Sets.HunterOfGlacialForest}
            description={t('RelicDescription', { id: 104 })}
            conditional={t('Conditionals.Hunter')} // 'When enabled, CRIT DMG buff is applied to Combat stat calculations.'
          />
          <ConditionalSetOption
            set={Constants.Sets.ChampionOfStreetwiseBoxing}
            selectOptions={setChampionOfStreetwiseBoxingOptions}
            description={t('RelicDescription', { id: 105 })}
            conditional={t('Conditionals.Streetwise')} // 'The selected ATK% buff is applied to Combat stat calculations based on the number of stacks.'
          />
          <ConditionalSetOption
            set={Constants.Sets.GuardOfWutheringSnow}
            description={t('RelicDescription', { id: 106 })}
            conditional={t('Conditionals.DefaultMessage')}
            p4Checked
          />
          <ConditionalSetOption
            set={Constants.Sets.FiresmithOfLavaForging}
            description={t('RelicDescription', { id: 107 })}
            conditional={t('Conditionals.Firesmith')} // 'The Skill DMG increase is always active by default. When enabled, the Fire DMG buff is applied to Combat stat calculations.'
          />
          <ConditionalSetOption
            set={Constants.Sets.GeniusOfBrilliantStars}
            description={t('RelicDescription', { id: 108 })}
            conditional={t('Conditionals.Genius')} // 'The 10% DEF pen increase is always active by default. When enabled, treats the enemy as having Quantum Weakness and penetrates 10% more DEF.'
          />
          <ConditionalSetOption
            set={Constants.Sets.BandOfSizzlingThunder}
            description={t('RelicDescription', { id: 109 })}
            conditional={t('Conditionals.Thunder')} // 'When enabled, ATK% buff is applied to Combat stat calculations.'
          />
          <ConditionalSetOption
            set={Constants.Sets.EagleOfTwilightLine}
            description={t('RelicDescription', { id: 110 })}
            conditional={t('Conditionals.DefaultMessage')}
            p4Checked
          />
          <ConditionalSetOption
            set={Constants.Sets.ThiefOfShootingMeteor}
            description={t('RelicDescription', { id: 111 })}
            conditional={t('Conditionals.DefaultMessage')}
            p4Checked
          />
          <ConditionalSetOption
            set={Constants.Sets.WastelanderOfBanditryDesert}
            selectOptions={setWastelanderOfBanditryDesert}
            description={t('RelicDescription', { id: 112 })}
            conditional={t('Conditionals.Wastelander')} // 'Applies the selected buffs to Combat stat calculations.'
          />
          <ConditionalSetOption
            set={Constants.Sets.LongevousDisciple}
            selectOptions={setLongevousDiscipleOptions}
            description={t('RelicDescription', { id: 113 })}
            conditional={t('Conditionals.Longevous')} // 'The selected CR buff is applied to Combat stat calculations based on the number of stacks.'
          />
          <ConditionalSetOption
            set={Constants.Sets.MessengerTraversingHackerspace}
            description={t('RelicDescription', { id: 114 })}
            conditional={t('Conditionals.Messenger')} // 'When enabled, SPD% buff is applied to Combat stat calculations.'
          />
          <ConditionalSetOption
            set={Constants.Sets.TheAshblazingGrandDuke}
            selectOptions={setTheAshblazingGrandDukeOptions}
            description={t('RelicDescription', { id: 115 })}
            conditional={t('Conditionals.Ashblazing')} // 'The selected ATK% buff is applied to all calculations except for Follow-up attacks. Follow-up attack calculations instead will start at 0% ATK buff and stack up based on the number of hits performed by the attack. Hits will increase based on the enemy count and assumes the target is positioned in the center for blast / aoe attacks.'
          />
          <ConditionalSetOption
            set={Constants.Sets.PrisonerInDeepConfinement}
            selectOptions={setPrisonerInDeepConfinementOptions}
            description={t('RelicDescription', { id: 116 })}
            conditional={t('Conditionals.Prisoner')} // 'The selected DEF% pen buff is applied to damage calculations based on the number of stacks.'
          />
          <ConditionalSetOption
            set={Constants.Sets.PioneerDiverOfDeadWaters}
            selectOptions={setPioneerDiverOfDeadWaters}
            description={t('RelicDescription', { id: 117 })}
            conditional={t('Conditionals.Diver')} // 'The 2 piece effect can be disabled by selecting the 0x option. For 4 piece, different CRIT buffs are applied to Combat stat calculations depending on the selected option.'
          />
          <ConditionalSetOption
            set={Constants.Sets.WatchmakerMasterOfDreamMachinations}
            description={t('RelicDescription', { id: 118 })}
            conditional={t('Conditionals.Watchmaker')} // 'When enabled, the Break Effect buff is applied to Combat stat calculations.'
          />
          <ConditionalSetOption
            set={Constants.Sets.IronCavalryAgainstTheScourge}
            description={t('RelicDescription', { id: 119 })}
            conditional={t('Conditionals.DefaultMessage')}
            p4Checked
          />
          <ConditionalSetOption
            set={Constants.Sets.TheWindSoaringValorous}
            description={t('RelicDescription', { id: 120 })}
            conditional={t('Conditionals.Valorous')} // 'The CRIT Rate buff is always on by default. The selected buff is applied to damage calculations based on the number of stacks.'
          />
          <ConditionalSetOption
            set={Constants.Sets.SacerdosRelivedOrdeal}
            selectOptions={setSacerdosRelivedOrdealOptions}
            description={t('RelicDescription', { id: 121 })}
            conditional={t('Conditionals.Sacerdos')}
          />
          <ConditionalSetOption
            set={Constants.Sets.ScholarLostInErudition}
            description={t('RelicDescription', { id: 122 })}
            conditional={t('Conditionals.DefaultMessage')}
          />
          <ConditionalSetOption
            set={Constants.Sets.HeroOfTriumphantSong}
            description={t('RelicDescription', { id: 123 })}
            conditional={t('Conditionals.DefaultMessage')}
          />
          <ConditionalSetOption
            set={Constants.Sets.PoetOfMourningCollapse}
            description={t('RelicDescription', { id: 124 })}
            conditional={t('Conditionals.DefaultMessage')}
            p4Checked
          />
        </Flex>

        <VerticalDivider/>

        <Flex vertical gap={defaultGap} style={{ marginLeft: 5 }}>
          <Flex gap={defaultGap} align='center' justify='flex-start'>
            <Text style={{ width: setConditionalsIconWidth }}></Text>
            <Text style={{ width: setConditionalsNameWidth }}></Text>
          </Flex>
          <ConditionalSetOption
            set={Constants.Sets.SpaceSealingStation}
            description={t('PlanarDescription', { id: 301 })}
            conditional={t('Conditionals.DefaultMessage')}
            p2Checked
          />
          <ConditionalSetOption
            set={Constants.Sets.FleetOfTheAgeless}
            description={t('PlanarDescription', { id: 302 })}
            conditional={t('Conditionals.DefaultMessage')}
            p2Checked
          />
          <ConditionalSetOption
            set={Constants.Sets.PanCosmicCommercialEnterprise}
            description={t('PlanarDescription', { id: 303 })}
            conditional={t('Conditionals.DefaultMessage')}
            p2Checked
          />
          <ConditionalSetOption
            set={Constants.Sets.BelobogOfTheArchitects}
            description={t('PlanarDescription', { id: 304 })}
            conditional={t('Conditionals.DefaultMessage')}
            p2Checked
          />
          <ConditionalSetOption
            set={Constants.Sets.CelestialDifferentiator}
            description={t('PlanarDescription', { id: 305 })}
            conditional={t('Conditionals.Differentiator')} // 'When enabled, the CRIT Rate buff is applied to Combat stat calculations.'
          />
          <ConditionalSetOption
            set={Constants.Sets.InertSalsotto}
            description={t('PlanarDescription', { id: 306 })}
            conditional={t('Conditionals.DefaultMessage')}
            p2Checked
          />
          <ConditionalSetOption
            set={Constants.Sets.TaliaKingdomOfBanditry}
            description={t('PlanarDescription', { id: 307 })}
            conditional={t('Conditionals.DefaultMessage')}
            p2Checked
          />
          <ConditionalSetOption
            set={Constants.Sets.SprightlyVonwacq}
            description={t('PlanarDescription', { id: 308 })}
            conditional={t('Conditionals.DefaultMessage')}
            p2Checked
          />
          <ConditionalSetOption
            set={Constants.Sets.RutilantArena}
            description={t('PlanarDescription', { id: 309 })}
            conditional={t('Conditionals.DefaultMessage')}
            p2Checked
          />
          <ConditionalSetOption
            set={Constants.Sets.BrokenKeel}
            description={t('PlanarDescription', { id: 310 })}
            conditional={t('Conditionals.DefaultMessage')}
            p2Checked
          />
          <ConditionalSetOption
            set={Constants.Sets.FirmamentFrontlineGlamoth}
            description={t('PlanarDescription', { id: 311 })}
            conditional={t('Conditionals.DefaultMessage')}
            p2Checked
          />
          <ConditionalSetOption
            set={Constants.Sets.PenaconyLandOfTheDreams}
            description={t('PlanarDescription', { id: 312 })}
            conditional={t('Conditionals.DefaultMessage')}
            p2Checked
          />
          <ConditionalSetOption
            set={Constants.Sets.SigoniaTheUnclaimedDesolation}
            selectOptions={setSigoniaTheUnclaimedDesolation}
            description={t('PlanarDescription', { id: 313 })}
            conditional={t('Conditionals.Sigonia')} // 'The selected CRIT DMG buff is applied to Combat stat calculations, assuming the character has defeated that number of enemies.'
          />
          <ConditionalSetOption
            set={Constants.Sets.IzumoGenseiAndTakamaDivineRealm}
            description={t('PlanarDescription', { id: 314 })}
            conditional={t('Conditionals.Izumo')} // 'When enabled, assumes there is another ally with the same path, and applies the 12% CRIT Rate buff to Combat stat calculations.'
          />
          <ConditionalSetOption
            set={Constants.Sets.DuranDynastyOfRunningWolves}
            selectOptions={setDuranDynastyOfRunningWolves}
            description={t('PlanarDescription', { id: 315 })}
            conditional={t('Conditionals.Duran')} // 'The selected buff is applied to damage calculations based on the number of stacks.'
          />
          <ConditionalSetOption
            set={Constants.Sets.ForgeOfTheKalpagniLantern}
            description={t('PlanarDescription', { id: 316 })}
            conditional={t('Conditionals.Kalpagni')} // 'When enabled, applies the Break Effect buff to combat stat calculations.'
          />
          <ConditionalSetOption
            set={Constants.Sets.LushakaTheSunkenSeas}
            description={t('PlanarDescription', { id: 317 })}
            conditional={t('Conditionals.Lushaka')} // 'The selected buff is applied to damage calculations.'
            p2Checked
          />
          <ConditionalSetOption
            set={Constants.Sets.TheWondrousBananAmusementPark}
            description={t('PlanarDescription', { id: 318 })}
            conditional={t('Conditionals.Banana')} // 'The selected buff is applied to damage calculations.'
          />
          <ConditionalSetOption
            set={Constants.Sets.BoneCollectionsSereneDemesne}
            description={t('PlanarDescription', { id: 319 })}
            conditional={t('Conditionals.DefaultMessage')} // 'The selected buff is applied to damage calculations.'
            p2Checked
          />
          <ConditionalSetOption
            set={Constants.Sets.GiantTreeOfRaptBrooding}
            description={t('PlanarDescription', { id: 320 })}
            conditional={t('Conditionals.DefaultMessage')} // 'The selected buff is applied to damage calculations.'
            p2Checked
          />
        </Flex>
      </Flex>
    </Drawer>
  )
}

function ConditionalSetOption(props) {
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'SetConditionals' })
  const content = (
    <Flex vertical gap={10}>
      <Flex vertical>
        <HeaderText>
          <p>{t('DescriptionHeader')/* Set description */}</p>
        </HeaderText>
        <p>{ColorizeNumbers(props.description)}</p>
      </Flex>

      <Flex vertical>
        <HeaderText>
          <p>{t('EffectHeader')/* Enabled effect */}</p>
        </HeaderText>
        <p>{props.conditional}</p>
      </Flex>
    </Flex>
  )

  if (Constants.SetsRelicsNames.includes(props.set)) {
    // Relics
    let inputType = (<Switch disabled={props.p4Checked}/>)
    if (props.selectOptions) {
      inputType = (
        <Select
          optionLabelProp='display'
          listHeight={500}
          size='small'
          style={{ width: setConditionalsWidth }}
          dropdownStyle={{ width: 'fit-content' }}
          options={props.selectOptions}
        />
      )
    }

    return (
      <Popover
        content={content}
        title={t('SetName', { id: setToId[props.set] })}
        mouseEnterDelay={0.5}
        overlayStyle={{
          width: 600,
        }}
      >
        <Flex gap={defaultGap} align='center' justify='flex-start'>
          <Flex style={{ width: setConditionalsIconWidth }}>
            <img
              src={Assets.getSetImage(props.set, Constants.Parts.PlanarSphere)}
              style={{ width: 36, height: 36 }}
            >
            </img>
          </Flex>
          <Text
            style={{
              width: setConditionalsNameWidth,
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
            }}
          >{t('SetName', { id: setToId[props.set] })}
          </Text>
          <Flex style={{ width: setConditionalsWidth }} justify='flex-end'>
            <Form.Item
              name={['setConditionals', props.set, 1]}
              valuePropName={props.selectOptions ? 'value' : 'checked'}
            >
              {inputType}
            </Form.Item>
          </Flex>
        </Flex>
      </Popover>
    )
  } else {
    // Ornaments
    let inputType = (<Switch disabled={props.p2Checked}/>)
    if (props.selectOptions) {
      inputType = (
        <Select
          optionLabelProp='display'
          listHeight={500}
          size='small'
          style={{ width: setConditionalsWidth }}
          dropdownStyle={{ width: 'fit-content' }}
          options={props.selectOptions}
        />
      )
    }
    return (
      <Popover
        content={content}
        title={t('SetName', { id: setToId[props.set] })}
        mouseEnterDelay={0.5}
        overlayStyle={{
          width: 600,
        }}
      >
        <Flex gap={defaultGap} align='center' justify='flex-start'>
          <Flex style={{ width: setConditionalsIconWidth }}>
            <img
              src={Assets.getSetImage(props.set, Constants.Parts.PlanarSphere)}
              style={{ width: 36, height: 36 }}
            >
            </img>
          </Flex>
          <Text
            style={{
              width: setConditionalsNameWidth,
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
            }}
          >{t('SetName', { id: setToId[props.set] })}
          </Text>
          <Flex style={{ width: setConditionalsWidth }} justify='flex-end'>
            <Form.Item
              name={['setConditionals', props.set, 1]}
              valuePropName={props.selectOptions ? 'value' : 'checked'}
            >
              {inputType}
            </Form.Item>
          </Flex>
        </Flex>
      </Popover>
    )
  }
}

ConditionalSetOption.propTypes = {
  description: PropTypes.string,
  p2Checked: PropTypes.bool,
  p4Checked: PropTypes.bool,
  set: PropTypes.string,
  conditional: PropTypes.string,
  selectOptions: PropTypes.array,
}

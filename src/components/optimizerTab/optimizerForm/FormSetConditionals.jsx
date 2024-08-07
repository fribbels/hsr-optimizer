import { Drawer, Flex, Form, Popover, Select, Switch, Typography } from 'antd'
import { Constants } from 'lib/constants'
import React, { useMemo } from 'react'
import { HeaderText } from 'components/HeaderText'
import PropTypes from 'prop-types'
import { Assets } from 'lib/assets'
import { VerticalDivider } from 'components/Dividers'
import { UnreleasedSets } from 'lib/dataParser'

const { Text } = Typography

const setConditionalsIconWidth = 40
const setConditionalsNameWidth = 200
const setConditionalsWidth = 80
const defaultGap = 5

export const FormSetConditionals = () => {
  const conditionalSetEffectsDrawerOpen = window.store((s) => s.conditionalSetEffectsDrawerOpen)
  const setConditionalSetEffectsDrawerOpen = window.store((s) => s.setConditionalSetEffectsDrawerOpen)

  const setChampionOfStreetwiseBoxingOptions = useMemo(() => {
    const options = []
    for (let i = 0; i <= 5; i++) {
      options.push({
        display: i + 'x',
        value: i,
        label: `${i} stacks (+${i * 5}% ATK)`,
      })
    }

    return options
  }, [])
  const setWastelanderOfBanditryDesert = useMemo(() => {
    return [
      {
        display: 'Off',
        value: 0,
        label: 'Off',
      },
      {
        display: 'CR',
        value: 1,
        label: 'Debuffed (+10% CR)',
      },
      {
        display: 'CR+CD',
        value: 2,
        label: 'Imprisoned (+10% CR | +20% CD)',
      },
    ]
  }, [])
  const setLongevousDiscipleOptions = useMemo(() => {
    const options = []
    for (let i = 0; i <= 2; i++) {
      options.push({
        display: i + 'x',
        value: i,
        label: `${i} stacks (+${i * 8}% CR)`,
      })
    }

    return options
  }, [])
  const setTheAshblazingGrandDukeOptions = useMemo(() => {
    const options = []
    for (let i = 0; i <= 8; i++) {
      options.push({
        display: i + 'x',
        value: i,
        label: `${i} stacks (+${6 * i}% ATK)`,
      })
    }

    return options
  }, [])
  const setPrisonerInDeepConfinementOptions = useMemo(() => {
    const options = []
    for (let i = 0; i <= 3; i++) {
      options.push({
        display: i + 'x',
        value: i,
        label: `${i} stacks (+${6 * i}% DEF ignore)`,
      })
    }

    return options
  }, [])
  const setPioneerDiverOfDeadWaters = useMemo(() => {
    return [
      {
        display: '0x',
        value: -1,
        label: '0 debuffs (+4% base CR)',
      },
      {
        display: '1x',
        value: 0,
        label: '1 debuff (+12% DMG | +4% base CR)',
      },
      {
        display: '2x',
        value: 1,
        label: '2 debuffs (+12% DMG | +4% base CR | +8% CD)',
      },
      {
        display: '3x',
        value: 2,
        label: '3 debuffs (+12% DMG | +4% base CR | +12% CD)',
      },
      {
        display: '2x +',
        value: 3,
        label: '2 debuffs, enhanced (+12% DMG | +4% base CR | +4% combat CR | +16% CD)',
      },
      {
        display: '3x +',
        value: 4,
        label: '3 debuffs, enhanced (+12% DMG | +4% base CR | +4% combat CR | +24% CD)',
      },
    ]
  }, [])
  const setSigoniaTheUnclaimedDesolation = useMemo(() => {
    const options = []
    for (let i = 0; i <= 10; i++) {
      options.push({
        display: i + 'x',
        value: i,
        label: `${i} stacks (+${4 * i}% CD)`,
      })
    }

    return options
  }, [])
  const setDuranDynastyOfRunningWolves = useMemo(() => {
    const options = []
    for (let i = 0; i <= 5; i++) {
      options.push({
        display: i + 'x',
        value: i,
        label: `${i} stacks (+${5 * i}% FUA DMG)`,
      })
    }

    options[5].label = `${5} stacks (+${5 * 5}% FUA DMG + 25% CD)`

    return options
  }, [])

  const defaultMessage = 'Enabled by default - effects will apply to combat calculations.'

  return (
    <Drawer
      title="Conditional set effects"
      placement="right"
      onClose={() => setConditionalSetEffectsDrawerOpen(false)}
      open={conditionalSetEffectsDrawerOpen}
      width={750}
      forceRender
    >
      <Flex justify="center">
        <Flex vertical gap={defaultGap}>
          <Flex gap={defaultGap} align="center" justify="flex-start">
            <Text style={{ width: setConditionalsIconWidth }}></Text>
            <Text style={{ width: setConditionalsNameWidth }}></Text>
          </Flex>

          <ConditionalSetOption
            set={Constants.Sets.PasserbyOfWanderingCloud}
            description="At the beginning of the battle, immediately regenerates 1 Skill Point."
            conditional={defaultMessage}
            p4Checked
          />
          <ConditionalSetOption
            set={Constants.Sets.MusketeerOfWildWheat}
            description="The wearer's SPD increases by 6% and Basic ATK DMG increases by 10%."
            conditional={defaultMessage}
            p4Checked
          />
          <ConditionalSetOption
            set={Constants.Sets.KnightOfPurityPalace}
            description="Increases the max DMG that can be absorbed by the Shield created by the wearer by 20%."
            conditional={defaultMessage}
            p4Checked
          />
          <ConditionalSetOption
            set={Constants.Sets.HunterOfGlacialForest}
            description="After the wearer uses their Ultimate, their CRIT DMG increases by 25% for 2 turn(s)."
            conditional="When enabled, CRIT DMG buff is applied to Combat stat calculations."
          />
          <ConditionalSetOption
            set={Constants.Sets.ChampionOfStreetwiseBoxing}
            selectOptions={setChampionOfStreetwiseBoxingOptions}
            description="After the wearer attacks or is hit, their ATK increases by 5% for the rest of the battle. This effect can stack up to 5 time(s)."
            conditional="The selected ATK% buff is applied to Combat stat calculations based on the number of stacks."
          />
          <ConditionalSetOption
            set={Constants.Sets.GuardOfWutheringSnow}
            description="At the beginning of the turn, if the wearer's HP is equal to or less than 50%, restores HP equal to 8% of their Max HP and regenerates 5 Energy."
            conditional={defaultMessage}
            p4Checked
          />
          <ConditionalSetOption
            set={Constants.Sets.FiresmithOfLavaForging}
            description="Increases the wearer's Skill DMG by 12%. After unleashing Ultimate, increases the wearer's Fire DMG by 12% for the next attack."
            conditional="The Skill DMG increase is always active by default. When enabled, the Fire DMG buff is applied to Combat stat calculations."
          />
          <ConditionalSetOption
            set={Constants.Sets.GeniusOfBrilliantStars}
            description="When the wearer deals DMG to the target enemy, ignores 10% DEF. If the target enemy has Quantum Weakness, the wearer additionally ignores 10% DEF."
            conditional="The 10% DEF pen increase is always active by default. When enabled, treats the enemy as having Quantum Weakness and penetrates 10% more DEF."
          />
          <ConditionalSetOption
            set={Constants.Sets.BandOfSizzlingThunder}
            description="When the wearer uses their Skill, increases the wearer's ATK by 20% for 1 turn(s)."
            conditional="When enabled, ATK% buff is applied to Combat stat calculations."
          />
          <ConditionalSetOption
            set={Constants.Sets.EagleOfTwilightLine}
            description="After the wearer uses their Ultimate, their action is Advanced Forward by 25%."
            conditional={defaultMessage}
            p4Checked
          />
          <ConditionalSetOption
            set={Constants.Sets.ThiefOfShootingMeteor}
            description="Increases the wearer's Break Effect by 16%. When the wearer inflicts Weakness Break on an enemy, regenerates 3 Energy."
            conditional={defaultMessage}
            p4Checked
          />
          <ConditionalSetOption
            set={Constants.Sets.WastelanderOfBanditryDesert}
            selectOptions={setWastelanderOfBanditryDesert}
            description="When attacking debuffed enemies, the wearer's CRIT Rate increases by 10%, and their CRIT DMG increases by 20% against Imprisoned enemies."
            conditional="Applies the selected buffs to Combat stat calculations."
          />
          <ConditionalSetOption
            set={Constants.Sets.LongevousDisciple}
            selectOptions={setLongevousDiscipleOptions}
            description="When the wearer is hit or has their HP consumed by an ally or themselves, their CRIT Rate increases by 8% for 2 turn(s) and up to 2 stacks."
            conditional="The selected CR buff is applied to Combat stat calculations based on the number of stacks."
          />
          <ConditionalSetOption
            set={Constants.Sets.MessengerTraversingHackerspace}
            description="When the wearer uses their Ultimate on an ally, SPD for all allies increases by 12% for 1 turn(s). This effect cannot be stacked."
            conditional="When enabled, SPD% buff is applied to Combat stat calculations."
          />
          <ConditionalSetOption
            set={Constants.Sets.TheAshblazingGrandDuke}
            selectOptions={setTheAshblazingGrandDukeOptions}
            description="When the wearer uses follow-up attacks, increases the wearer's ATK by 6% every time the follow-up attack deals DMG. This effect can stack up to 8 time(s) and lasts for 3 turn(s). This effect is removed the next time the wearer uses a follow-up attack."
            conditional="The selected ATK% buff is applied to all calculations except for Follow-up attacks. Follow-up attack calculations instead will start at 0% ATK buff and stack up based on the number of hits performed by the attack. Hits will increase based on the enemy count and assumes the target is positioned in the center for blast / aoe attacks."
          />
          <ConditionalSetOption
            set={Constants.Sets.PrisonerInDeepConfinement}
            selectOptions={setPrisonerInDeepConfinementOptions}
            description="For every DoT the target enemy is afflicted with, the wearer will ignore 6% of its DEF when dealing DMG to it. This effect is valid for a max of 3 DoTs."
            conditional="The selected DEF% pen buff is applied to damage calculations based on the number of stacks."
          />
          <ConditionalSetOption
            set={Constants.Sets.PioneerDiverOfDeadWaters}
            selectOptions={setPioneerDiverOfDeadWaters}
            description="Increases CRIT Rate by 4%. The wearer deals 8%/12% increased CRIT DMG to enemies with at least 2/3 debuffs. After the wearer inflicts a debuff on enemy targets, the aforementioned effects increase by 100%, lasting for 1 turn(s)."
            conditional="The 2 piece effect can be disabled by selecting the 0x option. For 4 piece, different CRIT buffs are applied to Combat stat calculations depending on the selected option."
          />
          <ConditionalSetOption
            set={Constants.Sets.WatchmakerMasterOfDreamMachinations}
            description="When the wearer uses their Ultimate on an ally, Break Effect for all allies increases by 30% for 2 turn(s). This effect cannot be stacked."
            conditional="When enabled, the Break Effect buff is applied to Combat stat calculations."
          />
          {!UnreleasedSets[Constants.SetsRelics.IronCavalryAgainstTheScourge] && (
            <ConditionalSetOption
              set={Constants.Sets.IronCavalryAgainstTheScourge}
              description="If the wearer's Break Effect is 150% or higher, ignores 10% of the enemy target's DEF when dealing Break DMG to them. When the wearer's Break Effect is 250% or higher, the Super Break DMG they deal to enemy targets additionally ignores 15% of the targets' DEF."
              conditional={defaultMessage}
              p4Checked
            />
          )}
          {!UnreleasedSets[Constants.SetsRelics.TheWindSoaringValorous] && (
            <ConditionalSetOption
              set={Constants.Sets.TheWindSoaringValorous}
              description="Increases the wearer's CRIT Rate by 6%. After the wearer uses a follow-up attack, increases the DMG dealt by their Ultimate by 36%, lasting for 1 turn(s)."
              conditional="The CRIT Rate buff is always on by default. The selected buff is applied to damage calculations based on the number of stacks."
            />
          )}
        </Flex>

        <VerticalDivider />

        <Flex vertical gap={defaultGap} style={{ marginLeft: 5 }}>
          <Flex gap={defaultGap} align="center" justify="flex-start">
            <Text style={{ width: setConditionalsIconWidth }}></Text>
            <Text style={{ width: setConditionalsNameWidth }}></Text>
          </Flex>
          <ConditionalSetOption
            set={Constants.Sets.SpaceSealingStation}
            description=""
            conditional={defaultMessage}
            p2Checked
          />
          <ConditionalSetOption
            set={Constants.Sets.FleetOfTheAgeless}
            description="Increases the wearer's ATK by 12%. When the wearer's SPD reaches 120 or higher, the wearer's ATK increases by an extra 12%."
            conditional={defaultMessage}
            p2Checked
          />
          <ConditionalSetOption
            set={Constants.Sets.PanCosmicCommercialEnterprise}
            description="Increases the wearer's Effect Hit Rate by 10%. Meanwhile, the wearer's ATK increases by an amount that is equal to 25% of the current Effect Hit Rate, up to a maximum of 25%."
            conditional={defaultMessage}
            p2Checked
          />
          <ConditionalSetOption
            set={Constants.Sets.BelobogOfTheArchitects}
            description="Increases the wearer's DEF by 15%. When the wearer's Effect Hit Rate is 50% or higher, the wearer gains an extra 15% DEF."
            conditional={defaultMessage}
            p2Checked
          />
          <ConditionalSetOption
            set={Constants.Sets.CelestialDifferentiator}
            description="Increases the wearer's CRIT DMG by 16%. When the wearer's current CRIT DMG reaches 120% or higher, after entering battle, the wearer's CRIT Rate increases by 60% until the end of their first attack."
            conditional="When enabled, the CRIT Rate buff is applied to Combat stat calculations."
          />
          <ConditionalSetOption
            set={Constants.Sets.InertSalsotto}
            description="Increases the wearer's CRIT Rate by 8%. When the wearer's current CRIT Rate reaches 50% or higher, the wearer's Ultimate and follow-up attack DMG increases by 15%."
            conditional={defaultMessage}
            p2Checked
          />
          <ConditionalSetOption
            set={Constants.Sets.TaliaKingdomOfBanditry}
            description="Increases the wearer's Break Effect by 16%. When the wearer's SPD reaches 145 or higher, the wearer's Break Effect increases by an extra 20%."
            conditional={defaultMessage}
            p2Checked
          />
          <ConditionalSetOption
            set={Constants.Sets.SprightlyVonwacq}
            description="Increases the wearer's Energy Regeneration Rate by 5%. When the wearer's SPD reaches 120 or higher, the wearer's action is Advanced Forward by 40% immediately upon entering battle."
            conditional={defaultMessage}
            p2Checked
          />
          <ConditionalSetOption
            set={Constants.Sets.RutilantArena}
            description="Increases the wearer's CRIT Rate by 8%. When the wearer's current CRIT Rate reaches 70% or higher, the wearer's Basic ATK and Skill DMG increase by 20%."
            conditional={defaultMessage}
            p2Checked
          />
          <ConditionalSetOption
            set={Constants.Sets.BrokenKeel}
            description="Increases the wearer's Effect RES by 10%. When the wearer's Effect RES is at 30% or higher, all allies' CRIT DMG increases by 10%."
            conditional={defaultMessage}
            p2Checked
          />
          <ConditionalSetOption
            set={Constants.Sets.FirmamentFrontlineGlamoth}
            description="Increases the wearer's ATK by 12%. When the wearer's SPD is equal to or higher than 135/160, the wearer deals 12%/18% more DMG."
            conditional={defaultMessage}
            p2Checked
          />
          <ConditionalSetOption
            set={Constants.Sets.PenaconyLandOfTheDreams}
            description="Increases wearer's Energy Regeneration Rate by 5%. Increases DMG by 10% for all other allies that are of the same Type as the wearer."
            conditional={defaultMessage}
            p2Checked
          />
          <ConditionalSetOption
            set={Constants.Sets.SigoniaTheUnclaimedDesolation}
            selectOptions={setSigoniaTheUnclaimedDesolation}
            description="Increases the wearer's CRIT Rate by 4%. When enemies are defeated, the wearer's CRIT DMG increases by 4%, up to 10 stack(s)."
            conditional="The selected CRIT DMG buff is applied to Combat stat calculations, assuming the character has defeated that number of enemies."
          />
          <ConditionalSetOption
            set={Constants.Sets.IzumoGenseiAndTakamaDivineRealm}
            description="Increases the wearer's ATK by 12%. When entering battle, if at least one other ally follows the same Path as the wearer, then the wearer's CRIT Rate increases by 12%."
            conditional="When enabled, assumes there is another ally with the same path, and applies the 12% CRIT Rate buff to Combat stat calculations."
          />
          <ConditionalSetOption
            set={Constants.Sets.DuranDynastyOfRunningWolves}
            selectOptions={setDuranDynastyOfRunningWolves}
            description="When allies use follow-up attacks, the wearer receives 1 stack of Merit, stacking up to 5 times. Every stack of Merit increases the DMG dealt by the wearer's follow-up attacks by 5%. When there are 5 stacks, additionally increases the wearer's CRIT DMG by 25%."
            conditional="The selected buff is applied to damage calculations based on the number of stacks."
          />
          <ConditionalSetOption
            set={Constants.Sets.ForgeOfTheKalpagniLantern}
            description="Increases the wearer's SPD by 6%. When the wearer hits an enemy with Fire Weakness, Break Effect increases by 40%, lasting for 1 turn(s)."
            conditional="When enabled, applies the Break Effect buff to combat stat calculations."
          />
          <ConditionalSetOption
            set={Constants.Sets.LushakaTheSunkenSeas}
            description="Increases the wearer's Effect RES by 10%. If the wearer is not the first character in the team lineup, then increase the ATK of the first character in the team lineup by 16%."
            conditional="The selected buff is applied to damage calculations."
            p2Checked
          />
          <ConditionalSetOption
            set={Constants.Sets.TheWondrousBananAmusementPark}
            description="Increases the wearer's CRIT DMG by 16%. When a target summoned by the wearer is on the field, CRIT DMG additionally increases by 28%."
            conditional="The selected buff is applied to damage calculations."
          />
        </Flex>
      </Flex>
    </Drawer>
  )
}

function ConditionalSetOption(props) {
  const content = (
    <Flex vertical gap={10}>
      <Flex vertical>
        <HeaderText>
          <p>Set description</p>
        </HeaderText>
        <p>{props.description}</p>
      </Flex>

      <Flex vertical>
        <HeaderText>
          <p>Enabled effect</p>
        </HeaderText>
        <p>{props.conditional}</p>
      </Flex>
    </Flex>
  )

  if (Constants.SetsRelicsNames.includes(props.set)) {
    // Relics
    let inputType = (<Switch disabled={props.p4Checked} />)
    if (props.selectOptions) {
      inputType = (
        <Select
          optionLabelProp="display"
          listHeight={500}
          size="small"
          style={{ width: setConditionalsWidth }}
          dropdownStyle={{ width: 'fit-content' }}
          options={props.selectOptions}
        />
      )
    }

    return (
      <Popover
        content={content}
        title={props.set}
        mouseEnterDelay={0.5}
        overlayStyle={{
          width: 600,
        }}
      >
        <Flex gap={defaultGap} align="center" justify="flex-start">
          <Flex style={{ width: setConditionalsIconWidth }}>
            <img src={Assets.getSetImage(props.set, Constants.Parts.PlanarSphere)} style={{ width: 36, height: 36 }}></img>
          </Flex>
          <Text style={{ width: setConditionalsNameWidth, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{props.set}</Text>
          <Flex style={{ width: setConditionalsWidth }} justify="flex-end">
            <Form.Item name={['setConditionals', props.set, 1]} valuePropName={props.selectOptions ? 'value' : 'checked'}>
              {inputType}
            </Form.Item>
          </Flex>
        </Flex>
      </Popover>
    )
  } else {
    // Ornaments
    let inputType = (<Switch disabled={props.p2Checked} />)
    if (props.selectOptions) {
      inputType = (
        <Select
          optionLabelProp="display"
          listHeight={500}
          size="small"
          style={{ width: setConditionalsWidth }}
          dropdownStyle={{ width: 'fit-content' }}
          options={props.selectOptions}
        />
      )
    }
    return (
      <Popover
        content={content}
        title={props.set}
        mouseEnterDelay={0.5}
        overlayStyle={{
          width: 600,
        }}
      >
        <Flex gap={defaultGap} align="center" justify="flex-start">
          <Flex style={{ width: setConditionalsIconWidth }}>
            <img src={Assets.getSetImage(props.set, Constants.Parts.PlanarSphere)} style={{ width: 36, height: 36 }}></img>
          </Flex>
          <Text style={{ width: setConditionalsNameWidth, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{props.set}</Text>
          <Flex style={{ width: setConditionalsWidth }} justify="flex-end">
            <Form.Item name={['setConditionals', props.set, 1]} valuePropName={props.selectOptions ? 'value' : 'checked'}>
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

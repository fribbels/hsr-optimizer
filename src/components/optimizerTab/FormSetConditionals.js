import {ConfigProvider, Drawer, Flex, Form, Popover, Select, Switch, Tooltip, Typography} from "antd";
import {Constants} from "../../lib/constants";
import VerticalDivider from "../VerticalDivider";
import React, {useMemo} from "react";
import {HeaderText} from "../HeaderText";
const { Text } = Typography;

const setConditionalsIconWidth = 40
const setConditionalsNameWidth = 200
const setConditionalsWidth = 80
const defaultGap = 5

export const FormSetConditionals = (props) => {
  let conditionalSetEffectsDrawerOpen = store(s => s.conditionalSetEffectsDrawerOpen);
  let setConditionalSetEffectsDrawerOpen = store(s => s.setConditionalSetEffectsDrawerOpen);

  const setChampionOfStreetwiseBoxingOptions = useMemo(() => {
    let options = []
    for (let i = 0; i <= 5; i++) {
      options.push({
        display: i + 'x',
        value: i,
        label: `${i} stacks (+${i * 5}% ATK)`
      })
    }

    return options
  }, []);
  const setWastelanderOfBanditryDesert = useMemo(() => {
    return [
      {
        display: 'Off',
        value: 0,
        label: 'Off'
      },
      {
        display: 'CR',
        value: 1,
        label: 'Debuffed (+10% CR)'
      },
      {
        display: 'CR+CD',
        value: 2,
        label: 'Imprisoned (+10% CR + 20% CD)'
      }
    ]
  }, []);
  const setLongevousDiscipleOptions = useMemo(() => {
    let options = []
    for (let i = 0; i <= 2; i++) {
      options.push({
        display: i + 'x',
        value: i,
        label: `${i} stacks (+${i * 8}% CR)`
      })
    }

    return options
  }, []);
  const setTheAshblazingGrandDukeOptions = useMemo(() => {
    let options = []
    for (let i = 0; i <= 8; i++) {
      options.push({
        display: i + 'x',
        value: i,
        label: `${i} stacks (+${6 * i}% ATK)`
      })
    }

    return options
  }, []);
  const setPrisonerInDeepConfinementOptions = useMemo(() => {
    let options = []
    for (let i = 0; i <= 3; i++) {
      options.push({
        display: i + 'x',
        value: i,
        label: `${i} stacks (+${6 * i}% DEF ignore)`
      })
    }

    return options
  }, []);

  let defaultMessage = 'Enabled by default - effects will apply to calculations.'

  return (
    <ConfigProvider
      theme={{
        token: {
          opacityLoading: 0.15
        }
      }}
    >
      <Drawer
        title="Conditional set effects"
        placement="right"
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
              <Text style={{ marginLeft: 'auto' }}>4 Piece</Text>
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
              conditional={'When enabled, CRIT DMG buff is applied to all calculations.'}
            />
            <ConditionalSetOption
              set={Constants.Sets.ChampionOfStreetwiseBoxing}
              selectOptions={setChampionOfStreetwiseBoxingOptions}
              description="After the wearer attacks or is hit, their ATK increases by 5% for the rest of the battle. This effect can stack up to 5 time(s)."
              conditional={'The selected ATK% buff is applied to all calculations based on the number of stacks.'}
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
              conditional={'The Skill DMG increase is always active by default. When enabled, the Fire DMG buff is applied to all calculations.'}
            />
            <ConditionalSetOption
              set={Constants.Sets.GeniusOfBrilliantStars}
              description="When the wearer deals DMG to the target enemy, ignores 10% DEF. If the target enemy has Quantum Weakness, the wearer additionally ignores 10% DEF."
              conditional={'The 10% DEF pen increase is always active by default. When enabled, treats the enemy as having Quantum Weakness and penetrates 10% more DEF.'}
            />
            <ConditionalSetOption
              set={Constants.Sets.BandOfSizzlingThunder}
              description="When the wearer uses their Skill, increases the wearer's ATK by 20% for 1 turn(s)."
              conditional={'When enabled, ATK% buff is applied to all calculations.'}
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
              conditional={'Applies the selected buffs to all calculations.'}
            />
            <ConditionalSetOption
              set={Constants.Sets.LongevousDisciple}
              selectOptions={setLongevousDiscipleOptions}
              description="When the wearer is hit or has their HP consumed by an ally or themselves, their CRIT Rate increases by 8% for 2 turn(s) and up to 2 stacks."
              conditional={'The selected CR buff is applied to all calculations based on the number of stacks.'}
            />
            <ConditionalSetOption
              set={Constants.Sets.MessengerTraversingHackerspace}
              description="When the wearer uses their Ultimate on an ally, SPD for all allies increases by 12% for 1 turn(s). This effect cannot be stacked."
              conditional={'When enabled, SPD% buff is applied to all calculations.'}
            />
            <ConditionalSetOption
              set={Constants.Sets.TheAshblazingGrandDuke}
              selectOptions={setTheAshblazingGrandDukeOptions}
              description="When the wearer uses follow-up attacks, increases the wearer's ATK by 6% every time the follow-up attack deals DMG. This effect can stack up to 8 time(s) and lasts for 3 turn(s). This effect is removed the next time the wearer uses a follow-up attack."
              conditional={'The selected ATK% buff is applied to all calculations except for Follow-up attacks. Follow-up attack calculations instead will start at 0% ATK buff and stack up based on the number of hits performed by the attack. Hits will increase based on the enemy count and assumes the target is positioned in the center for blast / aoe attacks.'}
            />
            <ConditionalSetOption
              set={Constants.Sets.PrisonerInDeepConfinement}
              selectOptions={setPrisonerInDeepConfinementOptions}
              description="For every DoT the target enemy is afflicted with, the wearer will ignore 6% of its DEF when dealing DMG to it. This effect is valid for a max of 3 DoTs."
              conditional={'The selected DEF% pen buff is applied to all calculations based on the number of stacks.'}
            />
          </Flex>

          <VerticalDivider />

          <Flex vertical gap={defaultGap} style={{ marginLeft: 5 }}>
            <Flex gap={defaultGap} align='center' justify='flex-start'>
              <Text style={{ width: setConditionalsIconWidth }}></Text>
              <Text style={{ width: setConditionalsNameWidth }}></Text>
              <Text style={{ marginLeft: 'auto' }}>2 Piece</Text>
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
              conditional={'When enabled, CRIT Rate buff is applied to all calculations.'}
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
          </Flex>
        </Flex>
      </Drawer>
    </ConfigProvider>
  )
}

function ConditionalSetOption(props) {
  const content = (
    <Flex vertical gap={10}>
      <Flex vertical>
        <HeaderText>
          <p>{'Set description'}</p>
        </HeaderText>
        <p>{props.description}</p>
      </Flex>

      <Flex vertical>
        <HeaderText>
          <p>{'Enabled effect'}</p>
        </HeaderText>
        <p>{props.conditional}</p>
      </Flex>
    </Flex>
  );

  if (Constants.SetsRelicsNames.includes(props.set)) {
    // Relics
    let inputType = (<Switch disabled={props.p4Checked} />)
    if (props.selectOptions) {
      inputType = (
        <Select
          optionLabelProp="display"
          listHeight={500}
          size='small'
          style={{ width: setConditionalsWidth }}
          dropdownStyle={{ width: 250 }}
          options={props.selectOptions}
        />
      )
    }

    return (
      <Popover
        content={content}
        title={props.set}
        overlayStyle={{
          width: 600
        }}
      >
        <Flex gap={defaultGap} align='center' justify='flex-start'>
          <Flex style={{ width: setConditionalsIconWidth }}>
            <img src={Assets.getSetImage(props.set, Constants.Parts.PlanarSphere)} style={{ width: 36, height: 36 }}></img>
          </Flex>
          <Text style={{ width: setConditionalsNameWidth, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{props.set}</Text>
          <Flex style={{ width: setConditionalsWidth }} justify='flex-end'>
            <Form.Item name={['setConditionals', props.set, 1]} valuePropName={props.selectOptions ? 'value' : 'checked'}>
              {inputType}
            </Form.Item>
          </Flex>
        </Flex>
      </Popover>
    )
  } else {
    // Ornaments
    return (
      <Popover
        content={content}
        title={props.set}
        overlayStyle={{
          width: 600
        }}
      >
        <Flex gap={defaultGap} align='center' justify='flex-start'>
          <Flex style={{ width: setConditionalsIconWidth }}>
            <img src={Assets.getSetImage(props.set, Constants.Parts.PlanarSphere)} style={{ width: 36, height: 36 }}></img>
          </Flex>
          <Text style={{ width: setConditionalsNameWidth, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{props.set}</Text>
          <Flex style={{ width: setConditionalsWidth }} justify='flex-end'>
            <Form.Item name={['setConditionals', props.set, 1]} valuePropName='checked'>
              <Switch disabled={props.p2Checked} />
            </Form.Item>
          </Flex>
        </Flex>
      </Popover>
    )
  }
}
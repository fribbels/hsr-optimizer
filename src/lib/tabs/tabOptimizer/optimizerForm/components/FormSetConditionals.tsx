import {
  Drawer,
  Flex,
  Form,
  Popover,
  Select,
  Switch,
  Typography,
} from 'antd'
import {
  Constants,
  Sets,
  SetsOrnaments,
  SetsRelics,
  setToId,
} from 'lib/constants/constants'
import {
  OpenCloseIDs,
  useOpenClose,
} from 'lib/hooks/useOpenClose'
import {
  ConditionalSetMetadata,
  SelectOptionContent,
  SetMetadata,
} from 'lib/optimization/rotation/setConditionalContent'
import { Assets } from 'lib/rendering/assets'
import ColorizeNumbers from 'lib/ui/ColorizeNumbers'
import { VerticalDivider } from 'lib/ui/Dividers'
import { HeaderText } from 'lib/ui/HeaderText'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

const { Text } = Typography

const setConditionalsIconWidth = 40
const setConditionalsNameWidth = 200
const setConditionalsWidth = 80
const defaultGap = 5

interface BaseConditionalSetOptionProps {
  description: string
  conditional: string
  selectOptions?: Array<SelectOptionContent>
}
interface RelicConditionalSetOptionProps extends BaseConditionalSetOptionProps {
  set: SetsRelics
  p4Checked?: boolean
}
interface OrnamentConditionalSetOptionProps extends BaseConditionalSetOptionProps {
  set: SetsOrnaments
  p2Checked?: boolean
}
type ConditionalSetOptionsProps = OrnamentConditionalSetOptionProps | RelicConditionalSetOptionProps

function ConditionalSetOption(props: ConditionalSetOptionsProps) {
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'SetConditionals' })
  const content = (
    <Flex vertical gap={10}>
      <Flex vertical>
        <HeaderText>
          <p>{t('DescriptionHeader') /* Set description */}</p>
        </HeaderText>
        <p>{ColorizeNumbers(props.description)}</p>
      </Flex>

      <Flex vertical>
        <HeaderText>
          <p>{t('EffectHeader') /* Enabled effect */}</p>
        </HeaderText>
        <p>{props.conditional}</p>
      </Flex>
    </Flex>
  )

  if (isRelicProps(props)) {
    // Relics
    let inputType = <Switch disabled={props.p4Checked} />
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
            />
          </Flex>
          <Text
            style={{
              width: setConditionalsNameWidth,
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
            }}
          >
            {t('SetName', { id: setToId[props.set] })}
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
    let inputType = <Switch disabled={props.p2Checked} />
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
            />
          </Flex>
          <Text
            style={{
              width: setConditionalsNameWidth,
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
            }}
          >
            {t('SetName', { id: setToId[props.set] })}
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

function isRelicProps(props: ConditionalSetOptionsProps): props is RelicConditionalSetOptionProps {
  return isRelicSet(props.set)
}

function isRelicSet(set: Sets): set is SetsRelics {
  return (Constants.SetsRelicsNames as Array<Sets>).includes(set)
}

export function FormSetConditionals({ id }: { id: OpenCloseIDs }) {
  const { close, isOpen } = useOpenClose(id)
  const { t } = useTranslation('optimizerTab', { keyPrefix: 'SetConditionals' })
  const { t: tSelectOptions } = useTranslation('optimizerTab', { keyPrefix: 'SetConditionals.SelectOptions' })

  const { relicOptions, ornamentOptions } = useMemo(() => {
    const relicOptions: Array<JSX.Element> = []
    const ornamentOptions: Array<JSX.Element> = []
    ;(Object.entries(ConditionalSetMetadata) as Array<[Sets, SetMetadata]>).forEach(([set, meta]) => {
      if (isRelicSet(set)) {
        relicOptions.push(
          <ConditionalSetOption
            set={set}
            p4Checked={!meta.modifiable}
            description={t('RelicDescription', { id: setToId[set] })}
            conditional={t(setToConditionalKey(set))}
            selectOptions={meta.selectionOptions?.(tSelectOptions)}
          />,
        )
      } else {
        ornamentOptions.push(
          <ConditionalSetOption
            set={set}
            p2Checked={!meta.modifiable}
            description={t('PlanarDescription', { id: setToId[set] })}
            conditional={t(setToConditionalKey(set))}
            selectOptions={meta.selectionOptions?.(tSelectOptions)}
          />,
        )
      }
    })
    return { relicOptions, ornamentOptions }
  }, [tSelectOptions, t])

  return (
    <Drawer
      title={t('Title')} // 'Conditional set effects'
      placement='right'
      onClose={close}
      open={isOpen}
      width={750}
      forceRender
    >
      <Flex justify='center'>
        <Flex vertical gap={defaultGap}>
          <Flex gap={defaultGap} align='center' justify='flex-start'>
            <Text style={{ width: setConditionalsIconWidth }}></Text>
            <Text style={{ width: setConditionalsNameWidth }}></Text>
          </Flex>
          {relicOptions}
        </Flex>
        <VerticalDivider />
        <Flex vertical gap={defaultGap} style={{ marginLeft: 5 }}>
          <Flex gap={defaultGap} align='center' justify='flex-start'>
            <Text style={{ width: setConditionalsIconWidth }}></Text>
            <Text style={{ width: setConditionalsNameWidth }}></Text>
          </Flex>
          {ornamentOptions}
        </Flex>
      </Flex>
    </Drawer>
  )
}

export function setToConditionalKey(set: Sets) {
  switch (set) {
    case Sets.HunterOfGlacialForest:
      return 'Conditionals.Hunter'
    case Sets.ChampionOfStreetwiseBoxing:
      return 'Conditionals.Streetwise'
    case Sets.FiresmithOfLavaForging:
      return 'Conditionals.Firesmith'
    case Sets.GeniusOfBrilliantStars:
      return 'Conditionals.Genius'
    case Sets.BandOfSizzlingThunder:
      return 'Conditionals.Thunder'
    case Sets.WastelanderOfBanditryDesert:
      return 'Conditionals.Wastelander'
    case Sets.LongevousDisciple:
      return 'Conditionals.Longevous'
    case Sets.MessengerTraversingHackerspace:
      return 'Conditionals.Messenger'
    case Sets.TheAshblazingGrandDuke:
      return 'Conditionals.Ashblazing'
    case Sets.PrisonerInDeepConfinement:
      return 'Conditionals.Prisoner'
    case Sets.PioneerDiverOfDeadWaters:
      return 'Conditionals.Diver'
    case Sets.WatchmakerMasterOfDreamMachinations:
      return 'Conditionals.Watchmaker'
    case Sets.TheWindSoaringValorous:
      return 'Conditionals.Valorous'
    case Sets.SacerdosRelivedOrdeal:
      return 'Conditionals.Sacerdos'
    case Sets.ScholarLostInErudition:
      return 'Conditionals.Scholar'
    case Sets.HeroOfTriumphantSong:
      return 'Conditionals.Hero'
    case Sets.WarriorGoddessOfSunAndThunder:
      return 'Conditionals.WarriorGoddess'
    case Sets.WavestriderCaptain:
      return 'Conditionals.Wavestrider'
    case Sets.WorldRemakingDeliverer:
      return 'Conditionals.Deliverer'
    case Sets.SelfEnshroudedRecluse:
      return 'Conditionals.Recluse'
    case Sets.EverGloriousMagicalGirl:
      return 'Conditionals.MagicalGirl'
    case Sets.DivinerOfDistantReach:
      return 'Conditionals.Diviner'
    case Sets.CelestialDifferentiator:
      return 'Conditionals.Differentiator'
    case Sets.PenaconyLandOfTheDreams:
      return 'Conditionals.Penacony'
    case Sets.SigoniaTheUnclaimedDesolation:
      return 'Conditionals.Sigonia'
    case Sets.IzumoGenseiAndTakamaDivineRealm:
      return 'Conditionals.Izumo'
    case Sets.DuranDynastyOfRunningWolves:
      return 'Conditionals.Duran'
    case Sets.ForgeOfTheKalpagniLantern:
      return 'Conditionals.Kalpagni'
    case Sets.LushakaTheSunkenSeas:
      return 'Conditionals.Lushaka'
    case Sets.TheWondrousBananAmusementPark:
      return 'Conditionals.Banana'
    case Sets.ArcadiaOfWovenDreams:
      return 'Conditionals.Arcadia'
    case Sets.AmphoreusTheEternalLand:
      return 'Conditionals.Amphoreus'
    case Sets.TengokuLivestream:
      return 'Conditionals.Tengoku'
    default:
      return 'Conditionals.DefaultMessage'
  }
}

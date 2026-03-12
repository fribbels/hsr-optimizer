import {
  IconChevronRight,
  IconExternalLink,
  IconSearch,
} from '@tabler/icons-react'
import { Accordion, Button, Divider, Flex, Paper, TextInput } from '@mantine/core'
import i18next from 'i18next'
import { Message } from 'lib/interactions/message'
import { Assets } from 'lib/rendering/assets'
import { useGlobalStore } from 'lib/stores/appStore'
import { AppPages } from 'lib/constants/appPages'
import { useShowcaseTabStore } from 'lib/tabs/tabShowcase/useShowcaseTabStore'
import { ColorizedLinkWithIcon } from 'lib/ui/ColorizedLink'
import { Languages } from 'lib/utils/i18nUtils'
import { TsUtils } from 'lib/utils/TsUtils'
import { type CSSProperties, useRef, useState } from 'react'
import {
  Trans,
  useTranslation,
} from 'react-i18next'

const headerHeight = 900
const headerWidth = 1600

export default function HomeTab() {
  const activeKey = useGlobalStore((s) => s.activeKey)

  if (activeKey !== AppPages.HOME) {
    // Don't load unless tab active
    return <></>
  }

  return (
    <Flex
      direction="column"
      w='100%'
      mb={200}
      style={{ position: 'relative' }}
      align='center'
    >
      <HeaderImage />
      <Header />
      <ContentCollapse />
    </Flex>
  )
}

const collapseItems = [
  {
    value: '1',
    label: <CollapseLabel i18nkey='Explore' /* Explore the features */ />,
    children: <FeaturesCollapse />,
  },
  {
    value: '2',
    label: <CollapseLabel i18nkey='Join' /* Join the community */ />,
    children: <CommunityCollapse />,
  },
]

type CollapseLabelI18nKey = 'Explore' | 'Join'

function CollapseLabel(props: { i18nkey: CollapseLabelI18nKey }) {
  const { t } = useTranslation('hometab', { keyPrefix: 'CollapseLabels' })
  return (
    <div style={{ marginRight: 38, textAlign: 'center' }}>
      <Divider
        style={{ fontSize: 24, paddingInline: 30, marginBlock: 0 }}
        label={t(props.i18nkey)}
        labelPosition='center'
      />
    </div>
  )
}

function CommunityCollapse() {
  const { t } = useTranslation('hometab')
  return (
    <Flex px={25} py={0} gap={50}>
      <Flex direction="column" style={{ flex: 1, fontSize: 20 }} gap={20}>
        <Trans t={t} i18nKey='CommunityCollapse'>
          <span>
            A huge thanks to all our contributors, translators, users, and everyone who provided feedback, for supporting this project and helping to build it
            together!
          </span>

          <span>
            Come be a part of our Star Rail community! Join the <ColorizedLinkWithIcon url='https://discord.gg/rDmB4Un7qg' />
            {' server to hang out, or check out the '}
            <ColorizedLinkWithIcon url='https://github.com/fribbels/hsr-optimizer' /> repo if you'd like to contribute.
          </span>
        </Trans>
      </Flex>
      <Flex style={{ flex: 1 }} align='flex-start'>
        <a href='https://github.com/fribbels/hsr-optimizer/graphs/contributors' target='_blank' rel='noreferrer' style={{ width: '100%' }}>
          <img
            src='https://contrib.rocks/image?repo=fribbels/hsr-optimizer&columns=10&anon=1'
            style={{
              width: '100%',
              maxWidth: headerWidth / 2,
            }}
          />
        </a>
      </Flex>
    </Flex>
  )
}

function ContentCollapse() {
  return (
    <Accordion
      multiple
      variant='default'
      w='100%'
      maw={headerWidth}
      chevronPosition='left'
      defaultValue={collapseItems.map((x) => x.value)}
    >
      {collapseItems.map((item) => (
        <Accordion.Item key={item.value} value={item.value}>
          <Accordion.Control>{item.label}</Accordion.Control>
          <Accordion.Panel>{item.children}</Accordion.Panel>
        </Accordion.Item>
      ))}
    </Accordion>
  )
}

function HeaderImage() {
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        width: '100%',
        maxWidth: headerWidth,
        height: headerHeight,
        maxHeight: headerHeight,
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundImage: `
            linear-gradient(to top, rgba(24, 34, 57, 0) 99.5%, rgba(24, 34, 57, 1) 100%),
            linear-gradient(to bottom, rgba(24, 34, 57, 0) 99.5%, rgba(24, 34, 57, 1) 100%),
            linear-gradient(to left, rgba(24, 34, 57, 0) 98%, rgba(24, 34, 57, 1) 99.5%),
            linear-gradient(to right, rgba(24, 34, 57, 0) 98%, rgba(24, 34, 57, 1) 99.5%),
            url(${Assets.getHomeBackground('evernight')})
          `,
        backgroundSize: 'cover',
      }}
    />
  )
}

const cardGap = 20

function CardImage(props: { id: string }) {
  return (
    <div style={{ padding: '15px 15px 0px 15px' }}>
      <TranslatedImage
        src={Assets.getHomeFeature(props.id, i18next.resolvedLanguage as Languages)}
        fallbackSrc={Assets.getHomeFeature(props.id)}
        style={{
          width: '100%',
          height: 593,
          borderRadius: 8,
          outline: 'rgba(255, 255, 255, 0.15) solid 1px',
          boxShadow: 'rgb(0 0 0 / 50%) 2px 2px 3px',
          objectFit: 'cover',
        }}
      />
    </div>
  )
}

function FeatureCard({ title, id, content, url }: { title: string, id: string, content: string, url: string }) {
  const { t } = useTranslation('hometab', { keyPrefix: 'FeatureCards' })
  return (
    <Paper
      p="xs"
      withBorder
      style={{
        flex: 1,
        cursor: 'default',
        fontSize: 16,
        minWidth: 500,
      }}
    >
      <CardImage id={id} />
      <div style={{ padding: '12px 0 0 0' }}>
        <div style={{ fontSize: 20, fontWeight: 500, marginBottom: 8 }}>
          {title}
        </div>
        <Flex align='center' gap={10} justify='space-between'>
          <span>
            {content}
          </span>
          <Button
            size='lg'
            component='a'
            href={url}
            target='_blank'
            leftSection={<IconExternalLink size={16} />}
          >
            {t('LearnMore') /* Learn more */}
          </Button>
        </Flex>
      </div>
    </Paper>
  )
}

function FeaturesCollapse() {
  const { t } = useTranslation('hometab', { keyPrefix: 'FeatureCards' })

  return (
    <Flex maw={headerWidth} miw={1000} w='100%' py={0} px={20}>
      <Flex direction="column" w='100%' gap={cardGap}>
        <Flex gap={cardGap}>
          <FeatureCard
            title={t('Showcase.Title') /* Character Showcase */}
            id='showcase'
            content={
              t('Showcase.Content')
              // Showcase your character's stats or prebuild future characters. Simulate their combat damage with DPS score and measure it against the benchmarks.
            }
            url='https://github.com/fribbels/hsr-optimizer/blob/main/docs/guides/en/dps-score.md'
          />
          <FeatureCard
            title={t('Optimizer.Title') /* Relic Optimizer */}
            id='optimizer'
            content={
              t('Optimizer.Content')
              // Optimize your characters to search for the best combination of relics to reach their breakpoints and maximize their stats.
            }
            url='https://github.com/fribbels/hsr-optimizer/blob/main/docs/guides/en/optimizer.md'
          />
        </Flex>
        <Flex gap={cardGap} w='100%'>
          <FeatureCard
            title={t('Calculator.Title') /* Damage Calculator */}
            id='calculator'
            content={
              t('Calculator.Content')
              // Calculate damage accurately with fully customizable team setups, buff conditions, and ability rotations to maximize damage output.
            }
            url='https://github.com/fribbels/hsr-optimizer/blob/main/docs/guides/en/advanced-rotations.md'
          />
          <FeatureCard
            title={t('Organizer.Title') /* Inventory Organizer */}
            id='relics'
            content={
              t('Organizer.Content')
              // Organize your inventory by scoring and sorting relics based on their potential, and find the top relics to upgrade for each character.
            }
            url='https://github.com/fribbels/hsr-optimizer/blob/main/docs/guides/en/relics-tab.md'
          />
        </Flex>
      </Flex>
    </Flex>
  )
}

function Header() {
  const { t } = useTranslation('hometab')
  return (
    <Flex
      direction="column"
      w='100%'
      h={headerHeight}
      pb={40}
      style={{ zIndex: 1 }}
      align='center'
      justify='space-between'
    >
      <h1
        style={{
          marginTop: 50,
          fontSize: 50,
          color: 'white',
          textShadow: '#000000 2px 2px 20px',
          textAlign: 'center',
          fontFamily: 'Tahoma, Geneva, Verdana, sans-serif',
        }}
      >
        <Trans t={t} i18nKey='Welcome'>
          Welcome to the<br />Fribbels Star Rail Optimizer
        </Trans>
      </h1>
      <SearchBar />
    </Flex>
  )
}

function SearchBar() {
  const scorerId = useShowcaseTabStore((s) => s.savedSession.scorerId)
  const { t } = useTranslation('hometab', { keyPrefix: 'SearchBar' })
  const inputRef = useRef<HTMLInputElement>(null)

  function handleSearchSubmit() {
    const uuid = inputRef.current?.value
    if (!uuid) return

    const validated = TsUtils.validateUuid(uuid)
    if (!validated) {
      return Message.warning(t('Message') /* 'Invalid input - This should be your 9 digit ingame UUID' */)
    }

    window.history.pushState({}, '', `/hsr-optimizer#showcase?id=${uuid}`)
    useGlobalStore.getState().setActiveKey(AppPages.SHOWCASE)
  }

  return (
    <Flex
      direction="column"
      className='homeCard'
      w={700}
      h={115}
      p={20}
      align='center'
      justify='center'
      gap={5}
    >
      <Flex justify='space-between' w='100%'>
        <Flex
          justify='flex-start'
          pl={3}
          pb={5}
          fz={17}
          style={{ textShadow: 'rgb(0, 0, 0) 2px 2px 20px, rgb(0, 0, 0) 0px 0px 5px' }}
        >
          {t('Label') /* Enter your UUID to showcase characters: */}
        </Flex>

        <Flex fz={16} style={{ opacity: 0.8 }} mr={2}>
          <ColorizedLinkWithIcon text={t('Api') /* Uses Enka.Network */} noUnderline={true} url='https://enka.network/?hsr' />
        </Flex>
      </Flex>
      <Flex gap={0} w='100%'>
        <Button
          size='lg'
          leftSection={<IconSearch size={16} />}
          w={60}
          style={{ borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
          onClick={handleSearchSubmit}
        />
        <TextInput
          ref={inputRef}
          placeholder={t('Placeholder') /* 'UID' */}
          style={{
            flex: 1,
          }}
          styles={{ input: { borderTopLeftRadius: 0, borderBottomLeftRadius: 0 } }}
          size='lg'
          defaultValue={scorerId ?? ''}
          onKeyDown={(e) => { if (e.key === 'Enter') handleSearchSubmit() }}
        />
      </Flex>
    </Flex>
  )
}

function TranslatedImage(props: { src: string, fallbackSrc: string, style: CSSProperties }) {
  const [errored, setErrored] = useState(false)
  return (
    <img
      style={props.style}
      src={props.src}
      onError={(e) => {
        if (errored) { // this means the fallback image isn't loading either
          return
        }
        e.currentTarget.src = props.fallbackSrc
        setErrored(true)
      }}
    />
  )
}

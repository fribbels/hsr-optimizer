import { ExportOutlined, SearchOutlined } from '@ant-design/icons'
import { RightOutlined } from '@ant-design/icons/lib/icons'
import { Button, Card, Collapse, Divider, Flex, Input } from 'antd'
import i18next from 'i18next'
import { Message } from 'lib/interactions/message'
import { Assets } from 'lib/rendering/assets'
import { AppPages } from 'lib/state/db.js'
import { ColorizedLinkWithIcon } from 'lib/ui/ColorizedLink'
import { TsUtils } from 'lib/utils/TsUtils'
import React from 'react'
import { Trans, useTranslation } from 'react-i18next'

const headerHeight = 900
const headerWidth = 1600

export default function HomeTab(): React.JSX.Element {
  const activeKey = window.store((s) => s.activeKey)

  if (activeKey != AppPages.HOME) {
    // Don't load unless tab active
    return (<></>)
  }

  return (
    <Flex
      vertical
      style={{
        width: '100%',
        position: 'relative',
        marginBottom: 200,
      }}
      align='center'
    >
      <HeaderImage/>
      <Header/>
      <ContentCollapse/>
    </Flex>
  )
}

const collapseItems = [
  {
    key: '1',
    label: <CollapseLabel i18nkey='Explore'/* Explore the features *//>,
    children: <FeaturesCollapse/>,
  },
  {
    key: '2',
    label: <CollapseLabel i18nkey='Join'/* Join the community *//>,
    children: <CommunityCollapse/>,
  },
]

type CollapseLabelI18nKey = 'Explore' | 'Join'

function CollapseLabel(props: { i18nkey: CollapseLabelI18nKey }) {
  const { t } = useTranslation('hometab', { keyPrefix: 'CollapseLabels' })
  return (
    <div style={{ marginRight: 38, textAlign: 'center' }}>
      <Divider style={{ fontSize: 24, paddingInline: 30, marginBlock: 0 }}>
        {t(props.i18nkey)}
      </Divider>
    </div>
  )
}

function CommunityCollapse() {
  const { t } = useTranslation('hometab')
  return (
    <Flex style={{ padding: '0px 25px' }} gap={50}>
      <Flex vertical style={{ flex: 1, fontSize: 20 }} gap={20}>
        <Trans t={t} i18nKey='CommunityCollapse'>
          <span>
            A huge thanks to all our contributors, translators, users, and everyone who provided feedback, for supporting this project and helping to build it together!
          </span>

          <span>
            Come be a part of our Star Rail community! Join the <ColorizedLinkWithIcon url='https://discord.gg/rDmB4Un7qg'/> server to hang out,
            or check out the <ColorizedLinkWithIcon url='https://github.com/fribbels/hsr-optimizer'/> repo if you'd like to contribute.
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
    <Collapse
      ghost
      style={{
        width: '100%',
        maxWidth: headerWidth,
      }}
      expandIcon={({ isActive }) => <RightOutlined style={{ marginLeft: 10 }} rotate={isActive ? 90 : 0}/>}
      items={collapseItems}
      defaultActiveKey={collapseItems.map((x) => x.key)}
    />
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
            url(${Assets.getHomeBackground('nous')})
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
      <img
        style={{
          width: '100%',
          height: 593,
          borderRadius: 8,
          outline: 'rgba(255, 255, 255, 0.15) solid 1px',
          boxShadow: 'rgb(0 0 0 / 50%) 2px 2px 3px',
          objectFit: 'cover',
        }}
        src={Assets.getHomeFeature(props.id, i18next.resolvedLanguage)}
        onError={(e) => {
          // TODO: .src and .onerror don't actually exist on SyntheticEvent, revisit
          // @ts-ignore
          e.target.src = Assets.getHomeFeature(props.id)
          // @ts-ignore
          e.onerror = null // prevent infinite looping if for some reason the english image can't be loaded
        }}
      />
    </div>
  )
}

function FeatureCard(props: { title: string; id: string; content: string; url: string }) {
  const { t } = useTranslation('hometab', { keyPrefix: 'FeatureCards' })
  return (
    <Card
      title={(
        <span style={{ fontSize: 20 }}>
          {props.title}
        </span>
      )}
      style={{
        flex: 1,
        cursor: 'default',
        fontSize: 16,
        minWidth: 500,
      }}
      hoverable={true}
      cover={<CardImage id={props.id}/>}
    >
      <Flex align='center' gap={10} justify='space-between'>
        <span>
          {props.content}
        </span>
        <Button
          style={{ height: '100%' }}
          size='large'
          iconPosition='end'
          href={props.url}
          target='_blank'
          icon={<ExportOutlined/>}
        >
          {t('LearnMore')/* Learn more */}
        </Button>
      </Flex>
    </Card>
  )
}

function FeaturesCollapse() {
  const { t } = useTranslation('hometab', { keyPrefix: 'FeatureCards' })

  return (
    <Flex style={{ maxWidth: headerWidth, minWidth: 1000, width: '100%', padding: '0px 20px' }}>
      <Flex vertical style={{ width: '100%' }} gap={cardGap}>
        <Flex gap={cardGap}>
          <FeatureCard
            title={t('Showcase.Title')/* Character Showcase */}
            id='showcase'
            content={
              t('Showcase.Content')
              // Showcase your character’s stats or prebuild future characters. Simulate their combat damage with DPS score and measure it against the benchmarks.
            }
            url='https://github.com/fribbels/hsr-optimizer/blob/main/docs/guides/en/dps-score.md'
          />
          <FeatureCard
            title={t('Optimizer.Title')/* Relic Optimizer */}
            id='optimizer'
            content={
              t('Optimizer.Content')
              // Optimize your characters to search for the best combination of relics to reach their breakpoints and maximize their stats.
            }
            url='https://github.com/fribbels/hsr-optimizer/blob/main/docs/guides/en/optimizer.md'
          />
        </Flex>
        <Flex gap={cardGap} style={{ width: '100%' }}>
          <FeatureCard
            title={t('Calculator.Title')/* Damage Calculator */}
            id='calculator'
            content={
              t('Calculator.Content')
              // Calculate damage accurately with fully customizable team setups, buff conditions, and ability rotations to maximize damage output.
            }
            url='https://github.com/fribbels/hsr-optimizer/blob/main/docs/guides/en/advanced-rotations.md'
          />
          <FeatureCard
            title={t('Organizer.Title')/* Inventory Organizer */}
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
      vertical
      style={{
        width: '100%',
        zIndex: 1,
        height: headerHeight,
        paddingBottom: 30,
      }}
      align='center'
      justify='space-between'
    >
      <h1
        style={{
          marginTop: 50,
          fontSize: 50,
          color: 'white', // Ensure the text color is white
          textShadow: '#000000 2px 2px 20px', // Add a dark shadow for better contrast
          textAlign: 'center', // Center-align the text
          fontFamily: 'Tahoma, Geneva, Verdana, sans-serif',
        }}
      >
        <Trans t={t} i18nKey='Welcome'>
          Welcome to the<br/>Fribbels Star Rail Optimizer
        </Trans>
      </h1>
      <SearchBar/>
    </Flex>
  )
}

function SearchBar() {
  const scorerId = window.store((s) => s.scorerId)
  const { t } = useTranslation('hometab', { keyPrefix: 'SearchBar' })
  return (
    <Flex
      vertical
      className='homeCard'
      style={{ width: 700, height: 115, padding: 20 }}
      align='center'
      justify='center'
      gap={5}
    >
      <Flex justify='flex-start' style={{ width: '100%', paddingLeft: 3, paddingBottom: 5, fontSize: 18, textShadow: 'rgb(0, 0, 0) 2px 2px 20px, rgb(0, 0, 0) 0px 0px 5px' }}>
        {t('Label')/* Enter your UUID to showcase characters: */}
      </Flex>
      <Input.Search
        placeholder={t('Placeholder')/* 'UUID' */}
        enterButton={(
          <Flex gap={5} style={{ marginRight: 5 }}>
            <SearchOutlined style={{ marginRight: 10 }}/> {t('Search')/* Search */}
          </Flex>
        )}
        allowClear
        size='large'
        defaultValue={scorerId}
        onSearch={(uuid: string, event, info) => {
          if (info?.source == 'clear') return

          const validated = TsUtils.validateUuid(uuid)
          if (!validated) {
            return Message.warning(t('Message')/* 'Invalid input - This should be your 9 digit ingame UUID' */)
          }

          window.history.pushState({}, '', `/hsr-optimizer#showcase?id=${uuid}`)
          window.store.getState().setActiveKey(AppPages.SHOWCASE)
        }}
      />
    </Flex>
  )
}

import { ExportOutlined } from '@ant-design/icons'
import { RightOutlined } from '@ant-design/icons/lib/icons'
import { Button, Card, Collapse, Flex, Input } from 'antd'
import { ColorizedLinkWithIcon } from 'components/common/ColorizedLink'
import { AppPages } from 'lib/db.js'
import { Message } from 'lib/message'
import { TsUtils } from 'lib/TsUtils'
import React from 'react'

const headerHeight = 900
const headerWidth = 1600

export default function LandingTab(): React.JSX.Element {
  const activeKey = window.store((s) => s.activeKey)

  if (activeKey != AppPages.LANDING) {
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
    label: <CollapseLabel text='Explore the features'/>,
    children: <FeaturesCollapse/>,
  },
  {
    key: '2',
    label: <CollapseLabel text='Join the community'/>,
    children: <CommunityCollapse/>,
  },
]

function CollapseLabel(props: { text: string }) {
  return (
    <div style={{ fontSize: 24, paddingRight: 38, textAlign: 'center' }}>
      {props.text}
    </div>
  )
}

function CommunityCollapse() {
  return (
    <Flex style={{ padding: 30 }} gap={50}>
      <Flex vertical style={{ flex: 1, fontSize: 20 }} gap={20}>
        <span>
          A huge thanks to all our contributors, translators, users, and everyone who provided feedback, for supporting this project and helping to build it together!
        </span>

        <span>
          Come be part of our Star Rail community! Join the <ColorizedLinkWithIcon text='Discord server' url='https://discord.gg/rDmB4Un7qg'/> to hang out,
          or check out the <ColorizedLinkWithIcon text='GitHub repo' url='https://github.com/fribbels/hsr-optimizer'/> if you'd like to contribute.
        </span>
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
        backgroundRepeat: 'no-repeat', // Prevents repeating
        backgroundImage: `
            linear-gradient(to top, rgba(24, 34, 57, 0) 99%, rgba(24, 34, 57, 1) 100%),
            linear-gradient(to bottom, rgba(24, 34, 57, 0) 99%, rgba(24, 34, 57, 1) 100%),
            linear-gradient(to left, rgba(24, 34, 57, 0) 99%, rgba(24, 34, 57, 1) 100%),
            linear-gradient(to right, rgba(24, 34, 57, 0) 99%, rgba(24, 34, 57, 1) 100%),
            url(https://i.imgur.com/GfIaokt.jpeg)
          `,
        backgroundSize: 'cover',
      }}
    />
  )
}

const cardGap = 20
const cardToSrc: Record<string, string> = {
  test1: 'http://localhost:3000/hsr-optimizer/assets/misc/landing/test1.png',
  test2: 'http://localhost:3000/hsr-optimizer/assets/misc/landing/test2.png',
  test3: 'http://localhost:3000/hsr-optimizer/assets/misc/landing/test3.png',
  test4: 'http://localhost:3000/hsr-optimizer/assets/misc/landing/test4.png',
}

function CardImage(props: { id: string }) {
  return (
    <div style={{ padding: '15px 15px 0px 15px' }}>
      <img
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          borderRadius: 8,
          outline: 'rgba(255, 255, 255, 0.15) solid 1px',
          boxShadow: 'rgb(0 0 0 / 50%) 2px 2px 3px',
        }}
        src={cardToSrc[props.id]}
      />
    </div>
  )
}

function FeatureCard(props: { title: string; id: string; content: string; url: string }) {
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
      }}
      hoverable={true}
      cover={<CardImage id={props.id}/>}
    >
      <Flex align='center' gap={10}>
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
          Learn more
        </Button>
      </Flex>
    </Card>
  )
}

function FeaturesCollapse() {
  return (
    <Flex style={{ maxWidth: headerWidth, minWidth: 1000, width: '100%', padding: '0px 20px' }}>
      <Flex vertical style={{ width: '100%' }} gap={cardGap}>
        <Flex gap={cardGap}>
          <FeatureCard
            title='Character Showcase'
            id='test1'
            content='Showcase your character’s stats or prebuild future characters. Simulate their combat damage with DPS score and measure it against the benchmarks.'
            url='https://github.com/fribbels/hsr-optimizer'
          />
          <FeatureCard
            title='Relic Optimizer'
            id='test2'
            content='Optimize your characters to search for the best combination of relics to reach their breakpoints and maximize their stats.'
            url='https://github.com/fribbels/hsr-optimizer'
          />
        </Flex>
        <Flex gap={cardGap} style={{ width: '100%' }}>
          <FeatureCard
            title='Damage Calculator'
            id='test4'
            content='Calculate damage accurately with fully customizable team setups, buff conditions, and ability rotations to maximize damage output.'
            url='https://github.com/fribbels/hsr-optimizer'
          />
          <FeatureCard
            title='Inventory Organizer'
            id='test3'
            content='Organize your inventory by scoring and sorting relics based on their potential, and find the top relics to upgrade for each character.'
            url='https://github.com/fribbels/hsr-optimizer'
          />
        </Flex>
      </Flex>
    </Flex>
  )
}

function Header() {
  return (
    <Flex
      vertical
      style={{
        width: '100%',
        zIndex: 1,
        height: headerHeight,
      }}
      align='center'
    >
      <h1
        style={{
          marginTop: 40,
          fontSize: 50,
          color: 'white', // Ensure the text color is white
          textShadow: '#000000 2px 2px 20px', // Add a dark shadow for better contrast
          textAlign: 'center', // Center-align the text
          fontFamily: 'Tahoma, Geneva, Verdana, sans-serif',
        }}
      >
        Welcome to the<br/>Fribbels Star Rail Optimizer
      </h1>
      <div style={{ height: 500 }}/>
      <SearchBar/>
    </Flex>
  )
}

function SearchBar() {
  return (
    <Flex
      vertical
      className='landingCard'
      style={{ width: 700, height: 115, padding: 20 }}
      align='center'
      justify='center'
      gap={5}
    >
      <Flex justify='flex-start' style={{ width: '100%', marginLeft: 5, fontSize: 18, textShadow: 'rgb(0, 0, 0) 2px 2px 20px, rgb(0, 0, 0) 0px 0px 5px' }}>
        Enter your UUID to showcase characters:
      </Flex>
      <Input.Search
        placeholder='UUID'
        allowClear
        enterButton='Search'
        size='large'
        style={{}}
        onSearch={(uuid: string) => {
          const validated = TsUtils.validateUuid(uuid)
          if (!validated) {
            return Message.warning('Invalid input - This should be your 9 digit ingame UUID')
          }

          window.history.pushState({}, '', `/hsr-optimizer#showcase?id=${uuid}`)
          window.store.getState().setActiveKey(AppPages.SHOWCASE)
        }}
      />
    </Flex>
  )
}

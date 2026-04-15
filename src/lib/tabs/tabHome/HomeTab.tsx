import {
  Accordion,
  Button,
  Divider,
  Flex,
  Paper,
} from '@mantine/core'
import {
  IconChevronRight,
  IconExternalLink,
} from '@tabler/icons-react'
import i18next from 'i18next'
import { Assets } from 'lib/rendering/assets'
import { ColorizedLinkWithIcon } from 'lib/ui/ColorizedLink'
import { HeroHeader } from 'lib/ui/HeroHeader'
import { type Languages } from 'lib/utils/i18nUtils'
import { useState } from 'react'
import {
  Trans,
  useTranslation,
} from 'react-i18next'
import classes from './HomeTab.module.css'

const headerWidth = 1600

export function HomeTab() {
  return (
    <Flex
      direction='column'
      className={classes.rootContainer}
      align='center'
    >
      <HeroHeader />
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
        className={classes.collapseLabelDivider}
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
      <Flex direction='column' style={{ flex: 1, fontSize: 20 }} gap={20}>
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
      <Flex flex={1} align='flex-start'>
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
      className={classes.contentAccordion}
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

const cardGap = 20

function CardImage(props: { id: string }) {
  return (
    <div style={{ padding: '15px 15px 0px 15px' }}>
      <TranslatedImage
        src={Assets.getHomeFeature(props.id, i18next.resolvedLanguage as Languages)}
        fallbackSrc={Assets.getHomeFeature(props.id)}
        className={classes.cardImage}
      />
    </div>
  )
}

function FeatureCard({ title, id, content, url }: { title: string, id: string, content: string, url: string }) {
  const { t } = useTranslation('hometab', { keyPrefix: 'FeatureCards' })
  return (
    <Paper
      withBorder
      className={classes.featureCard}
      radius='md'
    >
      <div className={classes.featureCardHeader}>
        {title}
      </div>
      <CardImage id={id} />
      <Flex align='center' gap={10} justify='space-between' className={classes.featureCardBody}>
        <span>{content}</span>
        <Button
          component='a'
          href={url}
          target='_blank'
          variant='default'
          leftSection={<IconExternalLink size={16} />}
          style={{ flexShrink: 0 }}
        >
          {t('LearnMore') /* Learn more */}
        </Button>
      </Flex>
    </Paper>
  )
}

function FeaturesCollapse() {
  const { t } = useTranslation('hometab', { keyPrefix: 'FeatureCards' })

  return (
    <Flex className={classes.featuresContainer}>
      <Flex direction='column' w='100%' gap={cardGap}>
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

function TranslatedImage(props: { src: string, fallbackSrc: string, className?: string }) {
  const [errored, setErrored] = useState(false)
  return (
    <img
      className={props.className}
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

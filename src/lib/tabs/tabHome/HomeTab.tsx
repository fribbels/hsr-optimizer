import {
  Button,
  TextInput,
} from '@mantine/core'
import {
  IconBrandDiscord,
  IconBrandGithub,
  IconChevronDown,
  IconHistory,
  IconLayoutKanban,
  IconSearch,
} from '@tabler/icons-react'
import {
  AppPages,
  PageToRoute,
} from 'lib/constants/appPages'
import { Message } from 'lib/interactions/message'
import { Assets } from 'lib/rendering/assets'
import { useGlobalStore } from 'lib/stores/app/appStore'
import { ShowcaseScreen } from 'lib/tabs/tabShowcase/showcaseTabTypes'
import { useShowcaseTabStore } from 'lib/tabs/tabShowcase/useShowcaseTabStore'
import { validateUuid } from 'lib/utils/miscUtils'
import {
  useEffect,
  useRef,
  useState,
} from 'react'
import { useTranslation } from 'react-i18next'
import classes from './HomeTab.module.css'

export function HomeTab() {
  return (
    <div className={classes.root}>
      <div className={classes.heroContainer}>
        <HeroSection />
      </div>
      <div className={classes.container}>
        <FeatureCard
          title='Character Showcase'
          description="Showcase and share your character's stats or prebuild future characters. Simulate combat damage with DPS score and measure it against the benchmarks."
          features={[
            'Full stats display with DPS Score and stats analysis',
            'Configure teammate buffs for accurate scoring',
            'Simulate unreleased character stats on current relics',
          ]}
          background='blackswan'
          image='showcase'
          align='left'
        />
        <FeatureCard
          title='Optimization Engine'
          description='Optimize your characters to search for the best combination of relics to reach their breakpoints and maximize their stats.'
          features={[
            'Find best builds for stats, abilities, or rotation damage',
            'GPU-accelerated compute at billions of builds per second',
            'Set up teammate conditional buffs for damage calculations',
          ]}
          background='nous'
          image='optimizer'
          align='right'
        />
        <FeatureCard
          title='Warp Planner'
          description='Calculate exact success probabilities for character and light cone banner targets, with pity counters, starlight refunds, and predicted future resources.'
          features={[
            'Shows expected average warps needed for each target',
            'Per-patch income tracking for F2P and spending tiers',
            'Calculates starlight refund from duplicate trades',
          ]}
          background='ruanmeibloom'
          image='warp'
          align='left'
        />
        <FeatureCard
          title='Damage Calculator'
          description='Calculate damage accurately with fully customizable team setups, buff conditions, and ability rotations to maximize damage output.'
          features={[
            'Customize rotations, teammates, and relics',
            'See the buff breakdown by source and ability',
            'Easy-to-use presets to get started with',
          ]}
          background='sparkle'
          image='damage'
          align='right'
        />
        <FeatureCard
          title='Build Benchmarks'
          description='Determine which relic sets and main stats produce the highest damage for your character. Find the optimal substat distribution for each configuration.'
          features={[
            'Compare main stat and relic combinations head-to-head',
            'Two tiers: realistic benchmark and perfection builds',
            'Expandable rows show stats, rolls, and damage breakdown',
          ]}
          background='silverwolf'
          image='benchmark'
          align='left'
        />
        <FeatureCard
          title='Rarity Analysis'
          description='Evaluate relic quality using character-specific substat weights that rank each piece against its theoretical maximum.'
          features={[
            'Estimate days of farming needed to replace a relic',
            'Visualize high, mid, and low rolls across your substats',
            'See the reroll dice potential for each piece',
          ]}
          background='ciphergem'
          image='rarity'
          align='right'
        />
        <CommunitySection />
      </div>
    </div>
  )
}

function HeroSection() {
  const { t } = useTranslation('hometab')
  const inputRef = useRef<HTMLInputElement>(null)
  const scorerId = useShowcaseTabStore((s) => s.savedSession.scorerId)

  function handleSearchSubmit() {
    const uuid = inputRef.current?.value
    if (!uuid) return

    const validated = validateUuid(uuid)
    if (!validated) {
      return Message.warning(t('SearchBar.Message'))
    }

    window.history.pushState({}, '', `${PageToRoute[AppPages.SHOWCASE]}?id=${uuid}`)
    useShowcaseTabStore.getState().setScreen(ShowcaseScreen.Loading)
    useGlobalStore.getState().setActiveKey(AppPages.SHOWCASE)
  }

  return (
    <section className={classes.hero}>
      <div className={classes.heroBackgroundContainer}>
        <img
          src={Assets.getHomeBackground('evernight')}
          alt=''
          className={classes.heroBackground}
        />
        <div className={classes.heroOverlay} />
      </div>

      <div className={classes.heroContent}>
        <div>
          <p className={classes.heroWelcome}>{t('Hero.Welcome')}</p>
          <h1 className={classes.heroTitle}>{t('Hero.Title')}</h1>
        </div>

        <div className={classes.heroBottomSection}>
          <div className={classes.searchBarContainer}>
            <div className={classes.searchBarHeader}>
              <span className={classes.searchBarLabel}>
                {t('SearchBar.Label')}
              </span>
              <span className={classes.searchBarApi}>
                <a href='https://enka.network/?hsr' target='_blank' rel='noreferrer'>
                  {t('SearchBar.Api')}
                </a>
              </span>
            </div>
            <div className={classes.searchBarInputRow}>
              <Button
                size='md'
                aria-label={t('SearchBar.Search')}
                onClick={handleSearchSubmit}
                style={{
                  borderTopRightRadius: 0,
                  borderBottomRightRadius: 0,
                }}
              >
                <IconSearch size={20} />
              </Button>
              <TextInput
                ref={inputRef}
                placeholder={t('SearchBar.Placeholder')}
                size='md'
                style={{ flex: 1 }}
                styles={{
                  input: {
                    fontSize: 16,
                    borderTopLeftRadius: 0,
                    borderBottomLeftRadius: 0,
                  },
                }}
                defaultValue={scorerId ?? ''}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSearchSubmit()
                }}
              />
            </div>
          </div>

          <div className={classes.scrollIndicator}>
            <span>{t('ScrollToExplore')}</span>
            <IconChevronDown size={20} />
          </div>
        </div>
      </div>
    </section>
  )
}

interface FadeSectionProps {
  children: React.ReactNode
  className?: string
}

function FadeSection({ children, className = '' }: FadeSectionProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0 },
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={`${classes.fadeSection} ${isVisible ? classes.visible : ''} ${className}`}
    >
      {children}
    </div>
  )
}

interface FeatureCardProps {
  title: string
  description: string
  features: string[]
  background: string
  image: string
  align: 'left' | 'right'
}

function FeatureCard({ title, description, features, background, image, align }: FeatureCardProps) {
  const isLeft = align === 'left'

  const textBlock = (
    <div className={classes.textBlock}>
      <h2 className={classes.sectionTitle}>{title}</h2>
      <p className={classes.sectionDescription}>{description}</p>
      <FeatureList features={features} />
    </div>
  )

  const imageBlock = (
    <div className={`${classes.imageBlock} ${isLeft ? classes.imageBlockLeft : classes.imageBlockRight}`}>
      <img src={Assets.getHomeFeature(image)} alt={title} className={classes.sectionImage} loading='lazy' />
    </div>
  )

  return (
    <section className={classes.featureSection}>
      <FadeSection>
        <div className={classes.featureCard}>
          <div
            className={classes.cardBackground}
            style={{ backgroundImage: `url(${Assets.getHomeBackground(background)})` }}
          />
          <div className={isLeft ? classes.overlayLeftHeavy : classes.overlayRightHeavy} />
          <div className={classes.cardContent}>
            {isLeft ? textBlock : imageBlock}
            {isLeft ? imageBlock : textBlock}
          </div>
        </div>
      </FadeSection>
    </section>
  )
}

function FeatureList({ features }: { features: string[] }) {
  return (
    <div className={classes.featureBulletDividers}>
      {features.map((text) => (
        <div key={text} className={classes.featureBulletDividerItem}>
          <span className={classes.bullet}>•</span>
          <span>{text}</span>
        </div>
      ))}
    </div>
  )
}

function CommunitySection() {
  return (
    <section className={classes.communitySection}>
      <FadeSection>
        <div className={classes.communityGrid}>
          <CommunityCard
            icon={<IconBrandDiscord size={28} />}
            title='Discord'
            description='Join thousands of players sharing builds, strategies, and optimization tips.'
            href='https://discord.gg/rDmB4Un7qg'
            iconColor='#ffffff'
            iconBg='#5865F2'
          />
          <CommunityCard
            icon={<IconBrandGithub size={28} />}
            title='GitHub'
            description='Contribute to the project. Bug reports, features, and pull requests welcome.'
            href='https://github.com/fribbels/hsr-optimizer'
            iconColor='#ffffff'
            iconBg='#24292f'
          />
          <CommunityCard
            icon={<IconLayoutKanban size={28} />}
            title='Roadmap'
            description="See what's planned and in progress on the project board."
            href='https://github.com/users/fribbels/projects/2'
            iconColor='#ffffff'
            iconBg='#2d8a85'
          />
          <CommunityCard
            icon={<IconHistory size={28} />}
            title='Changelog'
            description='Check out recent updates, new features, and bug fixes.'
            href={PageToRoute[AppPages.CHANGELOG]}
            iconColor='#ffffff'
            iconBg='#b8863b'
            external={false}
          />
        </div>
      </FadeSection>

      <FadeSection>
        <ContributorsSection />
      </FadeSection>
    </section>
  )
}

function ContributorsSection() {
  const { t } = useTranslation('hometab')

  return (
    <div className={classes.contributorsSection}>
      <div className={classes.contributorsHeader}>
        <h3 className={classes.contributorsTitle}>{t('Contributors.Title')}</h3>
        <p className={classes.contributorsSubtitle}>{t('CommunityCollapse')}</p>
      </div>
      <a href='https://github.com/fribbels/hsr-optimizer/graphs/contributors' target='_blank' rel='noreferrer'>
        <img
          src='https://contrib.rocks/image?repo=fribbels/hsr-optimizer&columns=10&anon=1'
          alt={t('Contributors.Title')}
          className={classes.contributorsImage}
          loading='lazy'
        />
      </a>
    </div>
  )
}

interface CommunityCardProps {
  icon: React.ReactNode
  title: string
  description: string
  href: string
  iconColor?: string
  iconBg?: string
  external?: boolean
}

function CommunityCard({ icon, title, description, href, iconColor, iconBg, external = true }: CommunityCardProps) {
  const iconStyle = {
    '--icon-color': iconColor,
    '--icon-bg': iconBg,
  } as React.CSSProperties

  return (
    <a
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noreferrer' : undefined}
      className={classes.communityCard}
    >
      <div className={classes.communityCardHeader}>
        <div className={classes.communityCardIcon} style={iconStyle}>{icon}</div>
        <h4 className={classes.communityCardTitle}>{title}</h4>
      </div>
      <p className={classes.communityCardDescription}>{description}</p>
    </a>
  )
}

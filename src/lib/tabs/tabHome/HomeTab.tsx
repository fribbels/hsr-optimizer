import { useEffect, useRef, useState } from 'react'
import { Box, Button, TextInput } from '@mantine/core'
import {
  IconChevronDown,
  IconBrandDiscord,
  IconBrandGithub,
  IconLayoutKanban,
  IconHistory,
  IconSearch,
} from '@tabler/icons-react'
import { Assets } from 'lib/rendering/assets'
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
          title="Character Showcase"
          description="Showcase and share your character's stats or prebuild future characters with simulated gear and teammates."
          features={[
            'Full stats display with DPS Score and stats analysis',
            'Configure teammate buffs for accurate scoring',
            'Simulate unreleased character stats on current relics',
          ]}
          background="blackswan"
          image="showcase"
          align="left"
        />
        <FeatureCard
          title="Optimization Engine"
          description="Search billions of relic combinations using GPU acceleration to find your character's strongest builds."
          features={[
            'GPU-accelerated compute finds optimal builds in seconds',
            'Filter by stat thresholds, sets, and main stats',
            'Compare builds side-by-side with damage breakdowns',
          ]}
          background="nous"
          image="optimizer"
          align="right"
        />
        <FeatureCard
          title="Warp Planner"
          description="Plan your pulls and estimate stellar jade costs to guarantee your target characters and light cones."
          features={[
            'Track pity and estimate pulls needed for guarantees',
            'Plan ahead for upcoming banners and reruns',
            'Calculate jade income from events and dailies',
          ]}
          background="ruanmeibloom"
          image="warp"
          align="left"
        />
        <FeatureCard
          title="Damage Calculator"
          description="Break down damage formulas and see exactly how stats, buffs, and enemy defenses affect your output."
          features={[
            'Full damage formula breakdown with multipliers',
            'Real-time stat adjustments show damage impact',
            'Compare rotations and team buff combinations',
          ]}
          background="sparkle"
          image="damage"
          align="right"
        />
        <FeatureCard
          title="Build Benchmarks"
          description="See where your builds rank against community standards and get actionable upgrade recommendations."
          features={[
            'Compare your stats against optimized benchmarks',
            'Identify which relics to prioritize upgrading',
            'Track improvement progress over time',
          ]}
          background="silverwolf"
          image="benchmark"
          align="left"
        />
        <FeatureCard
          title="Rarity Analysis"
          description="Understand relic rarity and substat distribution to focus your farming on the highest value pieces."
          features={[
            'See substat roll quality and upgrade potential',
            'Identify rare stat combinations worth keeping',
            'Prioritize farming based on expected value',
          ]}
          background="ciphergem"
          image="rarity"
          align="right"
        />
        <CommunitySection />
      </div>
    </div>
  )
}

function HeroSection() {
  const { t } = useTranslation('hometab')

  return (
    <section className={classes.hero}>
      <div className={classes.heroBackgroundContainer}>
        <img
          src={Assets.getHomeBackground('evernight')}
          alt=""
          className={classes.heroBackground}
        />
        <div className={classes.heroOverlay} />
      </div>

      <div className={classes.heroContent}>
        <div className={classes.heroTitleSection}>
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
                <a href="https://enka.network/?hsr" target="_blank" rel="noreferrer">
                  {t('SearchBar.Api')}
                </a>
              </span>
            </div>
            <div className={classes.searchBarInputRow}>
              <Button
                size="md"
                aria-label={t('SearchBar.Search')}
                style={{
                  borderTopRightRadius: 0,
                  borderBottomRightRadius: 0,
                }}
              >
                <IconSearch size={20} />
              </Button>
              <TextInput
                placeholder={t('SearchBar.Placeholder')}
                size="md"
                style={{ flex: 1 }}
                styles={{
                  input: {
                    fontSize: 16,
                    borderTopLeftRadius: 0,
                    borderBottomLeftRadius: 0,
                  },
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
  background: 'evernight' | 'nous' | 'blackswan' | 'ruanmeibloom' | 'sparkle' | 'silverwolf' | 'ciphergem'
  backgroundOffsetX?: string
  image: 'showcase' | 'optimizer' | 'warp' | 'damage' | 'benchmark' | 'rarity'
  align: 'left' | 'right'
}

function FeatureCard({ title, description, features, background, backgroundOffsetX = '50%', image, align }: FeatureCardProps) {
  const isLeft = align === 'left'

  const textBlock = (
    <div className={classes.textBlock}>
      <h2 className={classes.sectionTitle}>{title}</h2>
      <p className={classes.sectionDescription}>{description}</p>
      <FeatureList features={features} />
    </div>
  )

  const imageBlock = (
    <div className={classes.imageBlock}>
      <img src={Assets.getHomeFeature(image)} alt={title} className={classes.sectionImage} />
    </div>
  )

  return (
    <section className={classes.featureSection}>
      <FadeSection>
        <div className={classes.featureCard}>
          <div
            className={classes.cardBackground}
            style={{
              backgroundImage: `url(${Assets.getHomeBackground(background)})`,
              backgroundPosition: `${backgroundOffsetX} top`,
            }}
          />
          <div className={isLeft ? classes.overlayLeftHeavy : classes.overlayRightHeavy} />
          <div className={isLeft ? classes.cardContent : `${classes.cardContent} ${classes.contentRight}`}>
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
      {features.map((text, i) => (
        <div key={i} className={classes.featureBulletDividerItem}>
          <span className={classes.bullet}>•</span>
          <span>{text}</span>
        </div>
      ))}
    </div>
  )
}

function CommunitySection() {
  return (
    <Box component="section" className={classes.communitySection}>
      <FadeSection>
        <div className={classes.communityGrid}>
          <CommunityCard
            icon={<IconBrandDiscord size={28} />}
            title="Discord"
            description="Join thousands of players sharing builds, strategies, and optimization tips."
            href="https://discord.gg/rDmB4Un7qg"
            iconColor="#ffffff"
            iconBg="#5865F2"
          />
          <CommunityCard
            icon={<IconBrandGithub size={28} />}
            title="GitHub"
            description="Contribute to the project. Bug reports, features, and pull requests welcome."
            href="https://github.com/fribbels/hsr-optimizer"
            iconColor="#ffffff"
            iconBg="#24292f"
          />
          <CommunityCard
            icon={<IconLayoutKanban size={28} />}
            title="Roadmap"
            description="See what's planned and in progress on the project board."
            href="https://github.com/users/fribbels/projects/2"
            iconColor="#ffffff"
            iconBg="#2d8a85"
          />
          <CommunityCard
            icon={<IconHistory size={28} />}
            title="Changelog"
            description="Check out recent updates, new features, and bug fixes."
            href="https://github.com/fribbels/hsr-optimizer/releases"
            iconColor="#ffffff"
            iconBg="#b8863b"
          />
        </div>
      </FadeSection>

      <FadeSection>
        <ContributorsSection />
      </FadeSection>
    </Box>
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
      <a href="https://github.com/fribbels/hsr-optimizer/graphs/contributors" target="_blank" rel="noreferrer">
        <img src="https://contrib.rocks/image?repo=fribbels/hsr-optimizer&columns=10&anon=1" alt={t('Contributors.Title')} className={classes.contributorsImage} />
      </a>
    </div>
  )
}

interface CommunityCardProps {
  icon: React.ReactNode
  title: string
  description: string
  href?: string
  iconColor?: string
  iconBg?: string
}

function CommunityCard({ icon, title, description, href, iconColor, iconBg }: CommunityCardProps) {
  const iconStyle = {
    '--icon-color': iconColor,
    '--icon-bg': iconBg,
  } as React.CSSProperties

  const content = (
    <>
      <div className={classes.communityCardHeader}>
        <div className={classes.communityCardIcon} style={iconStyle}>{icon}</div>
        <h4 className={classes.communityCardTitle}>{title}</h4>
      </div>
      <p className={classes.communityCardDescription}>{description}</p>
    </>
  )

  if (href) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={classes.communityCard}>
        {content}
      </a>
    )
  }

  return (
    <div className={classes.communityCard}>
      {content}
    </div>
  )
}

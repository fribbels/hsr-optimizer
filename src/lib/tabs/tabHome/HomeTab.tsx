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
        <CharacterShowcaseSection />
        <RelicOptimizerSection />
        <WarpPlannerSection />
        <DamageCalculatorSection />
        <BenchmarkGeneratorSection />
        <RarityAnalysisSection />
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
          src={Assets.getHomeBackground('blackswan')}
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

function CharacterShowcaseSection() {
  const features = [
    'Full stats display with DPS Score and stats analysis',
    'Configure teammate buffs for accurate scoring',
    'Simulate unreleased character stats on current relics',
  ]

  return (
    <section className={classes.featureSection}>
      <FadeSection>
        <div className={classes.featureCard}>
          <div
            className={classes.cardBackground}
            style={{ backgroundImage: `url(${Assets.getHomeBackground('evernight')})` }}
          />
          <div className={classes.overlayLeftHeavy} />
          <div className={classes.cardContent}>
            <div className={classes.textBlock}>
              <h2 className={classes.sectionTitle}>Character Showcase</h2>
              <p className={classes.sectionDescription}>
                Showcase and share your character's stats or prebuild future characters. Simulate combat damage with DPS score and measure it against the benchmarks.
              </p>
              <FeatureList features={features} />
            </div>
            <div className={classes.faceGap} />
            <div className={classes.imageBlock}>
              <img src={Assets.getHomeFeature('showcase')} alt="Character Showcase" className={classes.sectionImage} />
            </div>
          </div>
        </div>
      </FadeSection>
    </section>
  )
}

function RelicOptimizerSection() {
  const features = [
    'Find best builds for stats, ability damage, or rotation damage',
    'GPU accelerated compute at billions of permutations per second',
    'Configure teammate conditional buffs for damage calculations',
  ]

  return (
    <section className={classes.featureSection}>
      <FadeSection>
        <div className={classes.featureCard}>
          <div
            className={classes.cardBackground}
            style={{ backgroundImage: `url(${Assets.getHomeBackground('nous')})` }}
          />
          <div className={classes.overlayRightHeavy} />
          <div className={`${classes.cardContent} ${classes.contentRight}`}>
            <div className={classes.imageBlock}>
              <img src={Assets.getHomeFeature('optimizer')} alt="Optimization Engine" className={classes.sectionImage} />
            </div>
            <div className={classes.faceGap} />
            <div className={classes.textBlock}>
              <h2 className={classes.sectionTitle}>Optimization Engine</h2>
              <p className={classes.sectionDescription}>
                Optimize your characters to search for the best combination of relics to reach their breakpoints and maximize their stats.
              </p>
              <FeatureList features={features} />
            </div>
          </div>
        </div>
      </FadeSection>
    </section>
  )
}

function DamageCalculatorSection() {
  const features = [
    'Customize the rotation and teammates, and filter by any stat',
    'See the buff breakdown by source and ability',
    'Easy-to-use presets for quick setup',
  ]

  return (
    <section className={classes.featureSection}>
      <FadeSection>
        <div className={classes.featureCard}>
          <div
            className={classes.cardBackground}
            style={{ backgroundImage: `url(${Assets.getHomeBackground('nous')})` }}
          />
          <div className={classes.overlayRightHeavy} />
          <div className={`${classes.cardContent} ${classes.contentRight}`}>
            <div className={classes.imageBlock}>
              <img src={Assets.getHomeFeature('calculator')} alt="Damage Calculator" className={classes.sectionImage} />
            </div>
            <div className={classes.faceGap} />
            <div className={classes.textBlock}>
              <h2 className={classes.sectionTitle}>Damage Calculator</h2>
              <p className={classes.sectionDescription}>
                Calculate damage accurately with fully customizable team setups, buff conditions, and ability rotations to maximize damage output.
              </p>
              <FeatureList features={features} />
            </div>
          </div>
        </div>
      </FadeSection>
    </section>
  )
}

function WarpPlannerSection() {
  const features = [
    'Shows expected average warps needed for each target',
    'Per-patch income tracking for F2P and spending tiers',
    'Calculates starlight refund from duplicate trades',
  ]

  return (
    <section className={classes.featureSection}>
      <FadeSection>
        <div className={classes.featureCard}>
          <div
            className={classes.cardBackground}
            style={{ backgroundImage: `url(${Assets.getHomeBackground('evernight')})` }}
          />
          <div className={classes.overlayLeftHeavy} />
          <div className={classes.cardContent}>
            <div className={classes.textBlock}>
              <h2 className={classes.sectionTitle}>Warp Planner</h2>
              <p className={classes.sectionDescription}>
                Calculate exact success probabilities for character and light cone banner targets, accounting for pity progress, starlight refunds, and upcoming patch income.
              </p>
              <FeatureList features={features} />
            </div>
            <div className={classes.faceGap} />
            <div className={classes.imageBlock}>
              <img src={Assets.getHomeFeature('showcase')} alt="Warp Planner" className={classes.sectionImage} />
            </div>
          </div>
        </div>
      </FadeSection>
    </section>
  )
}

function BenchmarkGeneratorSection() {
  const features = [
    'Compare relic set and main stat combinations head-to-head',
    'Two tiers: realistic benchmark and perfection builds',
    'Expandable rows show stats, rolls, and damage breakdown',
  ]

  return (
    <section className={classes.featureSection}>
      <FadeSection>
        <div className={classes.featureCard}>
          <div
            className={classes.cardBackground}
            style={{ backgroundImage: `url(${Assets.getHomeBackground('evernight')})` }}
          />
          <div className={classes.overlayLeftHeavy} />
          <div className={classes.cardContent}>
            <div className={classes.textBlock}>
              <h2 className={classes.sectionTitle}>Build Benchmarks</h2>
              <p className={classes.sectionDescription}>
                Determine which relic sets and main stats produce the highest damage for your character. Find the optimal substat distribution for each configuration.
              </p>
              <FeatureList features={features} />
            </div>
            <div className={classes.faceGap} />
            <div className={classes.imageBlock}>
              <img src={Assets.getHomeFeature('showcase')} alt="Build Benchmarks" className={classes.sectionImage} />
            </div>
          </div>
        </div>
      </FadeSection>
    </section>
  )
}

function RarityAnalysisSection() {
  const features = [
    'Estimate days of farming needed to replace a relic',
    'Visualize high, mid, and low rolls across your substats',
    'See the reroll dice potential for each piece',
  ]

  return (
    <section className={classes.featureSection}>
      <FadeSection>
        <div className={classes.featureCard}>
          <div
            className={classes.cardBackground}
            style={{ backgroundImage: `url(${Assets.getHomeBackground('nous')})` }}
          />
          <div className={classes.overlayRightHeavy} />
          <div className={`${classes.cardContent} ${classes.contentRight}`}>
            <div className={classes.imageBlock}>
              <img src={Assets.getHomeFeature('optimizer')} alt="Rarity Analysis" className={classes.sectionImage} />
            </div>
            <div className={classes.faceGap} />
            <div className={classes.textBlock}>
              <h2 className={classes.sectionTitle}>Rarity Analysis</h2>
              <p className={classes.sectionDescription}>
                Evaluate relic quality using character-specific substat weights that rank each piece against its theoretical maximum.
              </p>
              <FeatureList features={features} />
            </div>
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

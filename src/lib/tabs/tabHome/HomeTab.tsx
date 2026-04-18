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
        <DamageCalculatorSection />
        <CommunitySection />
      </div>
    </div>
  )
}

function HeroSection() {
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
          <p className={classes.heroWelcome}>Welcome to the</p>
          <h1 className={classes.heroTitle}>
            Fribbels Star Rail Optimizer
          </h1>
        </div>

        <div className={classes.heroBottomSection}>
          <div className={classes.searchBarContainer}>
            <div className={classes.searchBarHeader}>
              <span className={classes.searchBarLabel}>
                Enter your UID to view your showcase characters
              </span>
              <span className={classes.searchBarApi}>
                <a href="https://enka.network/?hsr" target="_blank" rel="noreferrer">
                  Uses Enka.Network
                </a>
              </span>
            </div>
            <div className={classes.searchBarInputRow}>
              <Button
                size="md"
                aria-label="Search"
                style={{
                  borderTopRightRadius: 0,
                  borderBottomRightRadius: 0,
                }}
              >
                <IconSearch size={20} />
              </Button>
              <TextInput
                placeholder="UID"
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
            <span>Scroll to explore</span>
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
    'Real-time stat calculations and breakpoint tracking',
    'DPS scoring against community benchmarks',
    'Prebuild future characters before farming',
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
              <span className={classes.sectionLabel}>Character Showcase</span>
              <h2 className={classes.sectionTitle}>
                See your builds come to life
              </h2>
              <p className={classes.sectionDescription}>
                Visualize your character builds with detailed stat breakdowns,
                combat metrics, and beautiful preview cards you can share with
                the community.
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
    'WebGPU-powered parallel optimization',
    'Advanced stat and set filtering options',
    'Automatic breakpoint optimization',
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
              <img src={Assets.getHomeFeature('optimizer')} alt="Relic Optimizer" className={classes.sectionImage} />
            </div>
            <div className={classes.faceGap} />
            <div className={classes.textBlock}>
              <span className={classes.sectionLabel}>Relic Optimizer</span>
              <h2 className={classes.sectionTitle}>
                Find optimal combinations instantly
              </h2>
              <p className={classes.sectionDescription}>
                Search through millions of relic combinations in seconds using
                GPU-accelerated optimization to find the perfect build for any
                character.
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
    'Full team composition support with synergies',
    'Conditional buff and debuff management',
    'Custom rotation sequences for accurate DPS',
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
              <span className={classes.sectionLabel}>Damage Calculator</span>
              <h2 className={classes.sectionTitle}>
                Accurate simulations, real results
              </h2>
              <p className={classes.sectionDescription}>
                Calculate precise damage output with fully customizable team
                compositions, buff conditions, and ability rotations that match
                real combat scenarios.
              </p>
              <FeatureList features={features} />
            </div>
            <div className={classes.faceGap} />
            <div className={classes.imageBlock}>
              <img src={Assets.getHomeFeature('calculator')} alt="Damage Calculator" className={classes.sectionImage} />
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
            icon={<IconBrandDiscord size={22} />}
            title="Discord"
            description="Join thousands of players sharing builds, strategies, and optimization tips."
            href="https://discord.gg/rDmB4Un7qg"
          />
          <CommunityCard
            icon={<IconBrandGithub size={22} />}
            title="GitHub"
            description="Contribute to the project. Bug reports, features, and pull requests welcome."
            href="https://github.com/fribbels/hsr-optimizer"
          />
          <CommunityCard
            icon={<IconLayoutKanban size={22} />}
            title="Roadmap"
            description="See what's planned and in progress on the project board."
            href="https://github.com/users/fribbels/projects/2"
          />
          <CommunityCard
            icon={<IconHistory size={22} />}
            title="Changelog"
            description="Check out recent updates, new features, and bug fixes."
            href="https://github.com/fribbels/hsr-optimizer/releases"
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
  return (
    <div className={classes.contributorsSection}>
      <div className={classes.contributorsHeader}>
        <h3 className={classes.contributorsTitle}>Our Contributors</h3>
        <p className={classes.contributorsSubtitle}>A huge thank you to everyone who has helped build and improve this tool</p>
      </div>
      <a href="https://github.com/fribbels/hsr-optimizer/graphs/contributors" target="_blank" rel="noreferrer">
        <img src="https://contrib.rocks/image?repo=fribbels/hsr-optimizer&columns=10&anon=1" alt="Contributors" className={classes.contributorsImage} />
      </a>
    </div>
  )
}

interface CommunityCardProps {
  icon: React.ReactNode
  title: string
  description: string
  href?: string
}

function CommunityCard({ icon, title, description, href }: CommunityCardProps) {
  const content = (
    <>
      <div className={classes.communityCardHeader}>
        <div className={classes.communityCardIcon}>{icon}</div>
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

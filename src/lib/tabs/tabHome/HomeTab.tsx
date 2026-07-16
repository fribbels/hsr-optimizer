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
import { Message } from 'lib/interactions/message'
import { Assets } from 'lib/rendering/assets'
import { BASE_PATH } from 'lib/tabs/navigation/constants'
import {
  AppPages,
  PageToHash,
} from 'lib/tabs/navigation/constants'
import { navigateTo } from 'lib/tabs/navigation/utils'
import classes from 'lib/tabs/tabHome/HomeTab.module.css'
import { useShowcaseTabStore } from 'lib/tabs/tabShowcase/useShowcaseTabStore'
import { validateUuid } from 'lib/utils/miscUtils'
import {
  useEffect,
  useRef,
  useState,
} from 'react'
import { useTranslation } from 'react-i18next'
import type Resources from 'types/resources'

export function HomeTab() {
  return (
    <div className={classes.root}>
      <div className={classes.heroContainer}>
        <HeroSection />
      </div>
      <div className={classes.container}>
        <FeatureCard
          feature='Showcase'
          background='blackswan'
          image='showcase'
          align='left'
        />
        <FeatureCard
          feature='Optimizer'
          background='nous'
          image='optimizer'
          align='right'
        />
        <FeatureCard
          feature='Warp'
          background='ruanmeibloom'
          image='warp'
          align='left'
        />
        <FeatureCard
          feature='DamageCalculator'
          background='sparkle'
          image='damage'
          align='right'
        />
        <FeatureCard
          feature='Benchmarks'
          background='silverwolf'
          image='benchmark'
          align='left'
        />
        <FeatureCard
          feature='RarityAnalysis'
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

    navigateTo(AppPages.SHOWCASE, new URLSearchParams(`id=${uuid}`))
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
      { threshold: 0, rootMargin: '100px' },
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
  feature: keyof Resources['hometab']['FeatureCard']
  background: string
  image: string
  align: 'left' | 'right'
}

const EMPTY_FEATURES: string[] = []

function FeatureCard({ feature, background, image, align }: FeatureCardProps) {
  const { t } = useTranslation('hometab', { keyPrefix: `FeatureCard.${feature}`! })
  const isLeft = align === 'left'
  const translatedFeatures = t('Features', { returnObjects: true })
  const features = Array.isArray(translatedFeatures)
    ? translatedFeatures
    : EMPTY_FEATURES

  const textBlock = (
    <div className={classes.textBlock}>
      <h2 className={classes.sectionTitle}>{t('Title')}</h2>
      <p className={classes.sectionDescription}>{t('Description')}</p>
      <FeatureList features={features} />
    </div>
  )

  const imageBlock = (
    <div className={`${classes.imageBlock} ${isLeft ? classes.imageBlockLeft : classes.imageBlockRight}`}>
      <img src={Assets.getHomeFeature(image)} alt={feature} className={classes.sectionImage} loading='lazy' />
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
  const { t } = useTranslation('hometab', { keyPrefix: 'CommunityCard' })
  return (
    <section className={classes.communitySection}>
      <FadeSection>
        <div className={classes.communityGrid}>
          <CommunityCard
            icon={<IconBrandDiscord size={28} />}
            title={t('Discord.Title')}
            description={t('Discord.Description')}
            href='https://discord.gg/rDmB4Un7qg'
            iconColor='#ffffff'
            iconBg='#5865F2'
          />
          <CommunityCard
            icon={<IconBrandGithub size={28} />}
            title={t('Github.Title')}
            description={t('Github.Description')}
            href='https://github.com/fribbels/hsr-optimizer'
            iconColor='#ffffff'
            iconBg='#24292f'
          />
          <CommunityCard
            icon={<IconLayoutKanban size={28} />}
            title={t('Roadmap.Title')}
            description={t('Roadmap.Description')}
            href='https://github.com/users/fribbels/projects/2'
            iconColor='#ffffff'
            iconBg='#2d8a85'
          />
          <CommunityCard
            icon={<IconHistory size={28} />}
            title={t('Changelog.Title')}
            description={t('Changelog.Description')}
            href={BASE_PATH + PageToHash[AppPages.CHANGELOG]}
            iconColor='#ffffff'
            iconBg='#b8863b'
            external={false}
            appPage={AppPages.CHANGELOG}
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
      <a href='https://github.com/fribbels/hsr-optimizer/graphs/contributors' target='_blank' rel='noreferrer' className={classes.contributorsLink}>
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
  appPage?: AppPages
}

function CommunityCard({ icon, title, description, href, iconColor, iconBg, external = true, appPage }: CommunityCardProps) {
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
      onClick={!external && appPage != null
        ? (e) => {
          if (e.ctrlKey || e.metaKey || e.shiftKey) return
          e.preventDefault()
          navigateTo(appPage)
        }
        : undefined}
    >
      <div className={classes.communityCardHeader}>
        <div className={classes.communityCardIcon} style={iconStyle}>{icon}</div>
        <h4 className={classes.communityCardTitle}>{title}</h4>
      </div>
      <p className={classes.communityCardDescription}>{description}</p>
    </a>
  )
}

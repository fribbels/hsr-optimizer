import {
  Button,
  Flex,
  TextInput,
} from '@mantine/core'
import { IconSearch } from '@tabler/icons-react'
import {
  AppPages,
  PageToRoute,
} from 'lib/constants/appPages'
import { Message } from 'lib/interactions/message'
import { Assets } from 'lib/rendering/assets'
import { useGlobalStore } from 'lib/stores/app/appStore'
import { submitForm } from 'lib/tabs/tabShowcase/showcaseApi'
import { useShowcaseTabStore } from 'lib/tabs/tabShowcase/useShowcaseTabStore'
import { ColorizedLinkWithIcon } from 'lib/ui/ColorizedLink'
import { validateUuid } from 'lib/utils/miscUtils'
import { useRef } from 'react'
import {
  Trans,
  useTranslation,
} from 'react-i18next'
import classes from './HeroHeader.module.css'

export function HeroHeader() {
  const { t } = useTranslation('hometab')

  return (
    <div className={classes.container}>
      <div
        className={classes.headerImage}
        style={{
          '--home-bg-image': `url(${Assets.getHomeBackground('evernight')})`,
        } as React.CSSProperties}
      />
      <Flex
        direction='column'
        className={classes.headerSection}
        align='center'
        justify='space-between'
      >
        <h1 className={classes.headerTitle}>
          <Trans t={t} i18nKey='Welcome'>
            Welcome to the<br />Fribbels Star Rail Optimizer
          </Trans>
        </h1>
        <SearchBar />
      </Flex>
    </div>
  )
}

function SearchBar() {
  const scorerId = useShowcaseTabStore((s) => s.savedSession.scorerId)
  const { t } = useTranslation('hometab', { keyPrefix: 'SearchBar' })
  const inputRef = useRef<HTMLInputElement>(null)

  function handleSearchSubmit() {
    const uuid = inputRef.current?.value
    if (!uuid) return

    const validated = validateUuid(uuid)
    if (!validated) {
      return Message.warning(t('Message') /* 'Invalid input - This should be your 9 digit ingame UUID' */)
    }

    window.history.pushState({}, '', `${PageToRoute[AppPages.SHOWCASE]}?id=${uuid}`)
    useGlobalStore.getState().setActiveKey(AppPages.SHOWCASE)
    submitForm({ scorerId: uuid })
  }

  return (
    <Flex
      direction='column'
      className={classes.searchBarContainer}
      align='center'
      justify='center'
      gap={8}
    >
      <Flex justify='space-between' w='100%'>
        <Flex className={classes.searchBarLabel}>
          {t('Label') /* Enter your UUID to showcase characters: */}
        </Flex>
        <div className={classes.searchBarApi}>
          <ColorizedLinkWithIcon text={t('Api') /* Uses Enka.Network */} noUnderline={true} url='https://enka.network/?hsr' />
        </div>
      </Flex>
      <Flex w='100%' gap={0}>
        <Button
          size='md'
          onClick={handleSearchSubmit}
          aria-label='Search'
          style={{ borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
        >
          <IconSearch size={20} />
        </Button>
        <TextInput
          ref={inputRef}
          size='md'
          placeholder={t('Placeholder') /* 'UID' */}
          style={{ flex: 1 }}
          styles={{ input: { fontSize: 16, borderTopLeftRadius: 0, borderBottomLeftRadius: 0 } }}
          defaultValue={scorerId ?? ''}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSearchSubmit()
          }}
        />
      </Flex>
    </Flex>
  )
}

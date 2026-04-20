import { IconBrandDiscordFilled, IconBrandGithub, IconCoffee } from '@tabler/icons-react'
import classes from './changelogCta.module.css'

export function CtaCardsE() {
  return (
    <div className={classes.cardsRootE}>
      <a className={`${classes.cardE} ${classes.cardEDiscord}`} href='https://discord.gg/rDmB4Un7qg' target='_blank' rel='noreferrer'>
        <IconBrandDiscordFilled size={26} color='#7b8cf9' />
        <span className={classes.cardLabelE}>Join Discord</span>
      </a>
      <a className={`${classes.cardE} ${classes.cardEDefault}`} href='https://github.com/fribbels/hsr-optimizer' target='_blank' rel='noreferrer'>
        <IconBrandGithub size={26} color='#f0f0f0' />
        <span className={classes.cardLabelE}>Star on GitHub</span>
      </a>
      <a className={`${classes.cardE} ${classes.cardEKofi}`} href='https://ko-fi.com/fribbels' target='_blank' rel='noreferrer'>
        <IconCoffee size={26} color='#FF5E5B' />
        <span className={classes.cardLabelE}>Support on Ko-fi</span>
      </a>
    </div>
  )
}

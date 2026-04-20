import { IconBrandDiscordFilled, IconBrandGithub, IconCoffee } from '@tabler/icons-react'
import classes from './changelogCta.module.css'

export function CtaCards() {
  return (
    <div className={classes.cardsRoot}>
      <a className={`${classes.card} ${classes.cardDiscord}`} href='https://discord.gg/rDmB4Un7qg' target='_blank' rel='noreferrer'>
        <IconBrandDiscordFilled size={26} color='#7b8cf9' />
        <span className={classes.cardLabel}>Join Discord</span>
      </a>
      <a className={`${classes.card} ${classes.cardDefault}`} href='https://github.com/fribbels/hsr-optimizer' target='_blank' rel='noreferrer'>
        <IconBrandGithub size={26} color='#f0f0f0' />
        <span className={classes.cardLabel}>Star on GitHub</span>
      </a>
      <a className={`${classes.card} ${classes.cardKofi}`} href='https://ko-fi.com/fribbels' target='_blank' rel='noreferrer'>
        <IconCoffee size={26} color='#FF5E5B' />
        <span className={classes.cardLabel}>Support on Ko-fi</span>
      </a>
    </div>
  )
}

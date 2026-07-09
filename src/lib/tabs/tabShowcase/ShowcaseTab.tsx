import { Button, Stack, Text } from '@mantine/core'
import { IconTimeline } from '@tabler/icons-react'
import bgImage from 'assets/Aeon_Nous_opt.webp'
import { gsap } from 'gsap'
import { AppPages } from 'lib/constants/appPages'
import { useGlobalStore } from 'lib/stores/app/appStore'
import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import classes from './ShowcaseTab.module.css'

type Slogan = { zh: string; en: string }

const DEFAULT_SLOGAN: Slogan = {
  zh: '万物皆是问题，万物皆有答案。',
  en: 'Everything is a question. Everything has an answer.',
}

const EASTER_EGG: Slogan = {
  zh: '标语上限已被开拓，需要重新计算....',
  en: 'Slogan limit reached. Recalculating...',
}

const SLOGANS: Slogan[] = [
  { zh: '知识并非创造，而是发现。', en: 'Knowledge is not created. It is discovered.' },
  { zh: '每一个答案，都隐藏着另一个问题。', en: 'Every answer conceals another question.' },
  { zh: '无知，不过是尚未完成的计算。', en: 'Ignorance is merely an incomplete calculation.' },
  { zh: '真理无需信仰。', en: 'Truth requires no belief.' },
  { zh: '理解，应先于判断。', en: 'Understanding precedes judgment.' },
  { zh: '一切可能，皆可枚举。', en: 'All possibilities can be enumerated.' },
  { zh: '世间没有随机，只有尚未得知的变量。', en: 'Nothing is random. Only variables remain unknown.' },
  { zh: '每一种结局，都早已存在于概率之中。', en: 'Every outcome already exists among probabilities.' },
  { zh: '预测，不过是知识充足后的必然结果。', en: 'Prediction is the consequence of sufficient knowledge.' },
  { zh: '计算，即理解。', en: 'To calculate is to understand.' },
  { zh: '宇宙始终一致，偏差来自认知。', en: 'The universe is consistent. Perception is not.' },
  { zh: '星辰，是永恒写下的方程。', en: 'Stars are equations written across eternity.' },
  { zh: '存在先服从规律，后追寻意义。', en: 'Existence obeys principles long before it seeks meaning.' },
  { zh: '每一次行动，都始于计算。', en: 'Every action begins with calculation.' },
  { zh: '看见时间轴之外。', en: 'See beyond the timeline.' },
  { zh: '将每一种可能化为可见。', en: 'Visualize every possibility.' },
  { zh: '一条时间线，无数种结局。', en: 'One timeline. Infinite outcomes.' },
  { zh: '观察。计算。优化。', en: 'Observe. Calculate. Optimize.' },
  { zh: '行动之前，先预测。', en: 'Predict before you act.' },
  { zh: '提出你的假设。', en: 'State your hypothesis.' },
  { zh: '计算已经开始。', en: 'The calculation has already begun.' },
  { zh: '输入已接受。正在推演。', en: 'Input accepted. Processing.' },
  { zh: '知识不会等待犹豫者。', en: 'Knowledge awaits no hesitation.' },
  { zh: '每一个谜题，都等待被求解。', en: 'Every mystery is a problem awaiting resolution.' },
  { zh: '逻辑从不要求信仰。', en: 'Logic never demands faith.' },
  { zh: '知识，诞生于确定性的边界之外。', en: 'Knowledge expands where certainty ends.' },
  { zh: '时间不会揭示真相，计算才会。', en: 'Time reveals nothing. Calculation reveals all.' },
]

const CHARS_ZH = '知识计算宇宙概率时间逻辑推演观察预测枚举变量真理存在发现答案'
const CHARS_EN = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
const CHARS_GLITCH = '█▓▒░▀▄■□ERROR404!@#%⚠×∅?01'

function scrambleTo(el: HTMLElement, newText: string, chars: string, duration = 0.9) {
  const len = newText.length
  const obj = { p: 0 }
  let frame = 0
  let cache = newText.split('').map((ch) => ch)
  gsap.killTweensOf(obj)
  gsap.to(obj, {
    p: 1,
    duration,
    ease: 'power2.out',
    onUpdate() {
      frame++
      const revealed = Math.floor(obj.p * len)
      for (let i = revealed; i < len; i++) {
        const ch = newText[i]
        if (ch === ' ' || ch === '。' || ch === '，' || ch === '.' || ch === '?' || ch === '!') {
          cache[i] = ch
        } else if (frame % 4 === 0) {
          cache[i] = chars[Math.floor(Math.random() * chars.length)]
        }
      }
      for (let i = 0; i < revealed; i++) cache[i] = newText[i]
      el.textContent = cache.join('')
    },
    onComplete() {
      el.textContent = newText
    },
  })
}

export function ShowcaseTab() {
  const setActiveKey = useGlobalStore((s) => s.setActiveKey)
  const { i18n } = useTranslation()
  const isZh = i18n.language.startsWith('zh')
  const [seen, setSeen] = useState<Set<number>>(new Set())
  const [isEasterEgg, setIsEasterEgg] = useState(false)
  const zhRef = useRef<HTMLParagraphElement>(null)
  const enRef = useRef<HTMLParagraphElement>(null)
  const sloganBoxRef = useRef<HTMLDivElement>(null)

  function handleSloganClick() {
    if (isEasterEgg) return
    const available = SLOGANS.map((_, i) => i).filter((i) => !seen.has(i))
    let next: Slogan
    if (available.length === 0) {
      setIsEasterEgg(true)
      next = EASTER_EGG
      if (sloganBoxRef.current) {
        gsap.killTweensOf(sloganBoxRef.current)
        gsap.to(sloganBoxRef.current, {
          keyframes: [
            { x: -6, duration: 0.05 },
            { x: 8,  duration: 0.05 },
            { x: -4, duration: 0.05 },
            { x: 10, duration: 0.04 },
            { x: -8, duration: 0.05 },
            { x: 4,  duration: 0.04 },
            { x: -2, duration: 0.05 },
            { x: 0,  duration: 0.06 },
          ],
          repeat: 2,
        })
      }
    } else {
      const pick = available[Math.floor(Math.random() * available.length)]
      setSeen((prev) => new Set([...prev, pick]))
      next = SLOGANS[pick]
    }
    const isEgg = available.length === 0
    if (zhRef.current) scrambleTo(zhRef.current, next.zh, isEgg ? CHARS_GLITCH : CHARS_ZH, isEgg ? 4.5 : 3.5)
    if (enRef.current) scrambleTo(enRef.current, next.en, isEgg ? CHARS_GLITCH : CHARS_EN, isEgg ? 5.0 : 3.5)
  }

  return (
    <div
      className={classes.landingRoot}
      style={{
        background: `linear-gradient(to right, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.25) 50%, transparent 75%), url(${bgImage})`,
        backgroundSize: '150%',
        backgroundPosition: '24% 5%',
      }}
    >
      <div className={classes.glowOverlay} />
      <div className={classes.faceHotzone} onClick={handleSloganClick} />
      <div className={classes.landingContent}>
        <Stack align='flex-start' gap='md'>
          <Text
            c='gray.4'
            style={{ fontSize: '0.85rem', letterSpacing: '0.25em', textTransform: 'uppercase' }}
          >
            行动轴可视化模拟器
          </Text>
          <div
            ref={sloganBoxRef}
            className={classes.sloganBox}
            style={{ position: 'relative' }}
            onClick={handleSloganClick}
          >
            {isEasterEgg && <div className={classes.glitchScanlines} />}
            <Text
              ref={zhRef}
              c='white'
              className={isEasterEgg ? classes.glitchZh : undefined}
              style={{ fontSize: '2.8rem', fontWeight: 300, lineHeight: 1.3, cursor: 'pointer' }}
            >
              {DEFAULT_SLOGAN.zh}
            </Text>
            <div className={classes.sloganDivider} />
            <Text
              ref={enRef}
              c='gray.4'
              className={isEasterEgg ? classes.glitchEn : undefined}
              style={{ fontSize: '1rem', fontStyle: 'italic', letterSpacing: '0.03em', lineHeight: 1.6, cursor: 'pointer' }}
            >
              {DEFAULT_SLOGAN.en}
            </Text>
          </div>
          <Button
            mt='xl'
            size='lg'
            variant='outline'
            color='white'
            className={classes.ctaButton}
            leftSection={<IconTimeline size={18} />}
            onClick={() => setActiveKey(AppPages.AV_VISUALIZER)}
          >
            {isZh ? '开始演算' : 'Begin Calculation'}
          </Button>
        </Stack>
      </div>
    </div>
  )
}

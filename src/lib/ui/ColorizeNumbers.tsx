import i18next from 'i18next'
import { ReactElement } from 'react'

// Colorizes numbers in a string with JSX elements
const ColorizeNumbers = (text: string, color: string = '#ebb434') => {
  if (i18next.resolvedLanguage == 'aa_ER') return <>{text}</>
  const ret: ReactElement[] = []
  let key = 0

  if (text) {
    text.split('::BR::').forEach((item) => {
      let num = ''
      let isNum = false
      if (ret.length > 0) {
        ret.push(<br key={key++} />)
        ret.push(<br key={key++} />)
      }

      for (let i = 0; i < item.length; i++) {
        if (
          (item[i] >= '0' && item[i] <= '9')
          || item[i] === '%'
          || (item[i] === 'A' && item[i + 1] && /[2,4,6]/.test(item[i + 1]))
          || (item[i] === 'E' && item[i + 1] && /[0-6]/.test(item[i + 1]))
        ) {
          num += item[i]
          isNum = true
        } else {
          if (isNum) {
            ret.push(<span key={key++} style={{ color: color }}>{num}</span>)
            num = ''
            isNum = false
          }
          ret.push(<span key={key++}>{item[i]}</span>)
        }
      }

      if (isNum) {
        ret.push(<span key={key++} style={{ color: color }}>{num}</span>)
      }
    })
  }

  return <>{ret}</>
}

export default ColorizeNumbers

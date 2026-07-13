import type {
  defaultNS,
  fallbackNS,
} from 'lib/i18n/i18n'
import type Resources from 'types/resources'
declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: typeof defaultNS
    fallbackNS: typeof fallbackNS
    resources: Resources
    enableSelector: false
  }
}
// npx i18next-resources-for-ts interface -i ./public/locales/en -o ./src/types/resources.d.ts
// npm run update-resources is available as a shorthand

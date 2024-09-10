import Resources from './resources'
declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common'
    resources: Resources
  }
}
// npx i18next-resources-for-ts interface -i ./public/locales/en -o ./src/types/resources.d.ts

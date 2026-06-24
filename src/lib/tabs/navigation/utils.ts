import { useGlobalStore } from 'lib/stores/app/appStore'
import {
  type AppPages,
  BASE_PATH,
  type PageHash,
  PageToHash,
} from 'lib/tabs/navigation/constants'

export function navigateTo(page: AppPages, params?: URLSearchParams, stripPreviousParams = false) {
  const currentPage = useGlobalStore.getState().activeKey
  if (page === currentPage) return
  let route = BASE_PATH + PageToHash[page]
  if (params && !stripPreviousParams) route += '?' + params.toString()
  console.log('Navigating activekey to route', page, route)
  useGlobalStore.getState().setActiveKey(page)
  history.pushState({}, '', route)
}

export function updateHashParams(pairs: Array<[string, string]>, replaceState = true, stripPreviousParams = false) {
  const [hash, paramsString] = window.location.hash.split('?') as [PageHash, string | undefined]
  const route = BASE_PATH + hash
  const params = new URLSearchParams(stripPreviousParams ? '' : paramsString)
  pairs.forEach(([k, v]) => params.set(k, v))
  const path = route + '?' + params.toString()
  if (replaceState) {
    history.replaceState({}, '', path)
  } else {
    history.pushState({}, '', path)
  }
}

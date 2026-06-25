import { useGlobalStore } from 'lib/stores/app/appStore'
import {
  type AppPages,
  BASE_PATH,
  PageToHash,
} from 'lib/tabs/navigation/constants'
import { parseHash } from 'lib/tabs/navigation/parseHash'

export function navigateTo(page: AppPages, params?: URLSearchParams) {
  const currentPage = useGlobalStore.getState().activeKey
  if (page === currentPage) return
  let route = BASE_PATH + PageToHash[page]
  if (params) route += '?' + params.toString()
  console.log('Navigating activekey to route', page, route)
  useGlobalStore.getState().setActiveKey(page)
  history.pushState({}, '', route)
}

export function setHashParams(pairs: Array<[string, string]>, replaceState = true) {
  const { hash, params } = parseHash()
  const route = BASE_PATH + hash
  pairs.forEach(([k, v]) => params.set(k, v))
  const query = params.toString()
  const path = query ? route + '?' + query : route
  if (replaceState) {
    history.replaceState({}, '', path)
  } else {
    history.pushState({}, '', path)
  }
}

export function clearHashParams(replaceState = true) {
  const route = BASE_PATH + parseHash().hash
  if (replaceState) {
    history.replaceState({}, '', route)
  } else {
    history.pushState({}, '', route)
  }
}

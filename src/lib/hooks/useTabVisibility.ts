import { createContext } from 'react'

/**
 * Tracks whether the current tab is active (visible).
 * Defaults to true so components outside tabs (modals, app root) behave normally.
 */
export const TabVisibilityContext = createContext(true)

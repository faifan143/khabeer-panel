import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { getLocalizedStateName } from "./constants/oman-states"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, locale: string = 'en'): string {


  // Return number with appropriate currency symbol based on locale
  if (locale === 'ar') {
    return `${amount} ر.ع.`
  }

  // Default to OMR for English and other locales
  return `${amount} OMR`
}

// Helper function to get currency symbol from i18n
export function getCurrencySymbol(locale: string = 'en'): string {
  if (locale === 'ar') {
    return 'ر.ع.'
  }
  return 'OMR'
}

// Helper function to get localized state name
export function getLocalizedState(stateValue: string, language: 'en' | 'ar' = 'en'): string {
  return getLocalizedStateName(stateValue, language)
}

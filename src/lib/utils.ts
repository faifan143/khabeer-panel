import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, locale: string = 'en'): string {
  // Format the number without currency symbol
  const formattedNumber = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)

  // Return number with appropriate currency symbol based on locale
  if (locale === 'ar') {
    return `${formattedNumber} ر.ع.`
  }

  // Default to OMR for English and other locales
  return `${formattedNumber} OMR`
}

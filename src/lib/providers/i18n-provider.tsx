"use client"

import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import '../i18n'

interface I18nProviderProps {
    children: React.ReactNode
}

export function I18nProvider({ children }: I18nProviderProps) {
    const { i18n } = useTranslation()

    useEffect(() => {
        // Initialize i18n and set initial language
        const savedLanguage = localStorage.getItem('i18nextLng')
        if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'ar')) {
            i18n.changeLanguage(savedLanguage)
        } else {
            // Default to English if no saved language
            i18n.changeLanguage('en')
        }
    }, [i18n])

    return <>{children}</>
}

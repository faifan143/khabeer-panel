import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

export const useLanguage = () => {
    const { i18n } = useTranslation()

    useEffect(() => {
        // Set initial document direction and language
        const currentLang = i18n.language || 'en'
        if (currentLang === 'ar') {
            document.documentElement.dir = 'rtl'
            document.documentElement.lang = 'ar'
        } else {
            document.documentElement.dir = 'ltr'
            document.documentElement.lang = 'en'
        }
    }, [i18n.language])

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng)
    }

    const isRTL = i18n.language === 'ar'

    return {
        currentLanguage: i18n.language,
        changeLanguage,
        isRTL,
    }
}

"use client"

import { Button } from "@/components/ui/button"
import { useTranslation } from "react-i18next"

export function LanguageToggle() {
    const { i18n, t } = useTranslation()

    const toggleLanguage = () => {
        const newLanguage = i18n.language === 'ar' ? 'en' : 'ar'
        i18n.changeLanguage(newLanguage)

        // Update document direction for RTL support
        if (newLanguage === 'ar') {
            document.documentElement.dir = 'rtl'
            document.documentElement.lang = 'ar'
        } else {
            document.documentElement.dir = 'ltr'
            document.documentElement.lang = 'en'
        }
    }

    const currentLanguage = i18n.language

    return (
        <div className="relative">
            <button
                onClick={toggleLanguage}
                className="relative flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 border border-slate-200 dark:border-slate-600 hover:from-slate-100 hover:to-slate-200 dark:hover:from-slate-700 dark:hover:to-slate-600 transition-all duration-300 group shadow-sm hover:shadow-md"
            >
                {/* Current language indicator */}
                <div className="flex items-center gap-2">

                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                        {currentLanguage === 'ar' ? 'English' : 'العربية'}
                    </span>
                </div>

                {/* Arrow indicator */}
                <div className="flex items-center">
                    <svg
                        className="w-4 h-4 text-slate-500 dark:text-slate-400 transition-transform duration-200 group-hover:rotate-180"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                    </svg>
                </div>

                {/* Hover effect overlay */}
                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>

            {/* Tooltip */}
            <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-slate-900 dark:bg-slate-700 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                {currentLanguage === 'ar' ? 'Switch to Arabic' : 'التبديل إلى الإنجليزية'}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-900 dark:border-t-slate-700"></div>
            </div>

            <span className="sr-only">{t('language.switchLanguage')}</span>
        </div>
    )
}

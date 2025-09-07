"use client"

import * as React from "react"
import { useTranslation } from "react-i18next"
import { Languages } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

export function LanguageToggle() {
    const { i18n, t } = useTranslation()

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng)
        // Update document direction for RTL support
        if (lng === 'ar') {
            document.documentElement.dir = 'rtl'
            document.documentElement.lang = 'ar'
        } else {
            document.documentElement.dir = 'ltr'
            document.documentElement.lang = 'en'
        }
    }

    const currentLanguage = i18n.language

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-accent"
                >
                    <Languages className="h-4 w-4" />
                    <span className="sr-only">{t('language.switchLanguage')}</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align={currentLanguage === 'ar' ? 'start' : 'end'}
                className={`w-40 ${currentLanguage === 'ar' ? 'rtl' : 'ltr'}`}
            >
                <DropdownMenuItem
                    onClick={() => changeLanguage('en')}
                    className={cn(
                        "cursor-pointer",
                        currentLanguage === 'en' ? 'bg-accent' : ''
                    )}
                >
                    <span className={cn(currentLanguage === 'ar' ? 'ml-2' : 'mr-2')}>🇺🇸</span>
                    {t('language.english')}
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => changeLanguage('ar')}
                    className={cn(
                        "cursor-pointer",
                        currentLanguage === 'ar' ? 'bg-accent' : ''
                    )}
                >
                    <span className={cn(currentLanguage === 'ar' ? 'ml-2' : 'mr-2')}>🇸🇦</span>
                    {t('language.arabic')}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

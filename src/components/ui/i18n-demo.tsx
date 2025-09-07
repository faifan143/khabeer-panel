"use client"

import { useTranslation } from "react-i18next"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Globe,
    Languages,
    ArrowRight,
    ArrowLeft,
    ChevronRight,
    ChevronLeft
} from "lucide-react"

export function I18nDemo() {
    const { t, i18n } = useTranslation()
    const isRTL = i18n.language === 'ar'

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Globe className="h-5 w-5" />
                        {t('language.currentLanguage')}: {t(`language.${i18n.language}`)}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-2">
                        <Badge variant="outline">
                            {isRTL ? 'RTL' : 'LTR'}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                            Direction: {isRTL ? 'Right-to-Left' : 'Left-to-Right'}
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <h4 className="font-medium">English Text</h4>
                            <p className="text-sm text-muted-foreground">
                                This is how text appears in English
                            </p>
                        </div>

                        <div className="space-y-2">
                            <h4 className="font-medium">Arabic Text</h4>
                            <p className="text-sm text-muted-foreground" dir="rtl">
                                هذا هو كيف يظهر النص باللغة العربية
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Languages className="h-5 w-5" />
                        RTL Icon Examples
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center space-y-2">
                            <h4 className="font-medium">Regular Arrow</h4>
                            <ArrowRight className="h-8 w-8 mx-auto" />
                            <p className="text-xs text-muted-foreground">No RTL adjustment</p>
                        </div>

                        <div className="text-center space-y-2">
                            <h4 className="font-medium">Flipped Arrow</h4>
                            <ArrowRight className="h-8 w-8 mx-auto rtl-flip" />
                            <p className="text-xs text-muted-foreground">Uses rtl-flip class</p>
                        </div>

                        <div className="text-center space-y-2">
                            <h4 className="font-medium">Rotated Arrow</h4>
                            <ArrowRight className="h-8 w-8 mx-auto rtl-rotate" />
                            <p className="text-xs text-muted-foreground">Uses rtl-rotate class</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="text-center space-y-2">
                            <h4 className="font-medium">Chevron Right</h4>
                            <ChevronRight className="h-6 w-6 mx-auto" />
                            <p className="text-xs text-muted-foreground">Standard chevron</p>
                        </div>

                        <div className="text-center space-y-2">
                            <h4 className="font-medium">Chevron Left</h4>
                            <ChevronLeft className="h-6 w-6 mx-auto" />
                            <p className="text-xs text-muted-foreground">Standard chevron</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Translation Examples</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <h4 className="font-medium">Dashboard</h4>
                            <p className="text-sm">
                                <strong>Title:</strong> {t('dashboard.title')}
                            </p>
                            <p className="text-sm">
                                <strong>Subtitle:</strong> {t('dashboard.subtitle')}
                            </p>
                        </div>

                        <div className="space-y-2">
                            <h4 className="font-medium">Orders</h4>
                            <p className="text-sm">
                                <strong>Title:</strong> {t('orders.title')}
                            </p>
                            <p className="text-sm">
                                <strong>Subtitle:</strong> {t('orders.subtitle')}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <h4 className="font-medium">Users</h4>
                            <p className="text-sm">
                                <strong>Title:</strong> {t('users.title')}
                            </p>
                            <p className="text-sm">
                                <strong>Subtitle:</strong> {t('users.subtitle')}
                            </p>
                        </div>

                        <div className="space-y-2">
                            <h4 className="font-medium">Settings</h4>
                            <p className="text-sm">
                                <strong>Title:</strong> {t('settings.title')}
                            </p>
                            <p className="text-sm">
                                <strong>Subtitle:</strong> {t('settings.subtitle')}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

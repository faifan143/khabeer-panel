'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useTranslation } from 'react-i18next'
import { ServiceType } from '@/lib/api/types'
import { Store, Headphones } from 'lucide-react'
import { useLanguage } from '@/lib/hooks/useLanguage'

interface ServiceTypeSelectionDialogProps {
    children: React.ReactNode
    onServiceTypeSelect: (serviceType: ServiceType) => void
}

export function ServiceTypeSelectionDialog({
    children,
    onServiceTypeSelect
}: ServiceTypeSelectionDialogProps) {
    const { t } = useTranslation()
    const { isRTL } = useLanguage()
    const [isOpen, setIsOpen] = useState(false)

    const handleServiceTypeSelect = (serviceType: ServiceType) => {
        onServiceTypeSelect(serviceType)
        setIsOpen(false)
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent
                className="sm:max-w-[600px] dark:bg-card dark:border-border"
                dir={isRTL ? 'rtl' : 'ltr'}
            >
                <DialogHeader>
                    <DialogTitle className="text-center text-foreground dark:text-card-foreground text-xl font-semibold">
                        {t('categories.selectServiceType')}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 mt-6">
                    <p className="text-sm text-muted-foreground text-center leading-relaxed">
                        {t('categories.chooseServiceTypeDescription')}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Button
                            onClick={() => handleServiceTypeSelect('NORMAL')}
                            className="group flex flex-col items-center justify-center gap-4 p-6 h-auto min-h-[120px] hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent dark:hover:text-accent-foreground transition-all duration-200 border-2 hover:border-primary/20 hover:shadow-md"
                            variant="outline"
                        >
                            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                                <Store className="h-6 w-6 text-primary" />
                            </div>
                            <div className="text-center space-y-2">
                                <div className="font-semibold text-base">{t('categories.normalService')}</div>

                            </div>
                        </Button>
                        <Button
                            onClick={() => handleServiceTypeSelect('KHABEER')}
                            className="group flex flex-col items-center justify-center gap-4 p-6 h-auto min-h-[120px] hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent dark:hover:text-accent-foreground transition-all duration-200 border-2 hover:border-primary/20 hover:shadow-md"
                            variant="outline"
                        >
                            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                                <Headphones className="h-6 w-6 text-primary" />
                            </div>
                            <div className="text-center space-y-2">
                                <div className="font-semibold text-base">{t('categories.khabeerService')}</div>

                            </div>
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

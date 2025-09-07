'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useTranslation } from 'react-i18next'
import { ServiceType } from '@/lib/api/types'
import { Store, Headphones } from 'lucide-react'

interface ServiceTypeSelectionDialogProps {
    children: React.ReactNode
    onServiceTypeSelect: (serviceType: ServiceType) => void
}

export function ServiceTypeSelectionDialog({
    children,
    onServiceTypeSelect
}: ServiceTypeSelectionDialogProps) {
    const { t } = useTranslation()
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
            <DialogContent className="sm:max-w-[400px]" dir="rtl">
                <DialogHeader>
                    <DialogTitle className="text-center">اختر نوع الخدمة</DialogTitle>
                </DialogHeader>

                <div className="flex gap-3 mt-4">
                    <Button
                        onClick={() => handleServiceTypeSelect('NORMAL')}
                        className="flex-1 flex items-center gap-2"
                        variant="outline"
                    >
                        <Store className="h-4 w-4" />
                        عادي
                    </Button>
                    <Button
                        onClick={() => handleServiceTypeSelect('KHABEER')}
                        className="flex-1 flex items-center gap-2"
                        variant="outline"
                    >
                        <Headphones className="h-4 w-4" />
                        خبير
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}

"use client"

import * as React from "react"
import { useTranslation } from "react-i18next"
import { useLanguage } from "@/lib/hooks/useLanguage"
import {
    RTLDialog,
    RTLDialogContent,
    RTLDialogDescription,
    RTLDialogFooter,
    RTLDialogHeader,
    RTLDialogTitle,
    RTLDialogTrigger,
} from "./rtl-dialog"
import { Button } from "./button"
import { cn } from "@/lib/utils"

interface RTLConfirmationDialogProps {
    trigger: React.ReactNode
    title: string
    description: string
    confirmText: string
    cancelText?: string
    onConfirm: () => void
    onCancel?: () => void
    confirmVariant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
    confirmClassName?: string
    isLoading?: boolean
}

export function RTLConfirmationDialog({
    trigger,
    title,
    description,
    confirmText,
    cancelText,
    onConfirm,
    onCancel,
    confirmVariant = "default",
    confirmClassName,
    isLoading = false,
}: RTLConfirmationDialogProps) {
    const { t } = useTranslation()
    const { isRTL } = useLanguage()
    const [open, setOpen] = React.useState(false)

    const handleConfirm = () => {
        onConfirm()
        setOpen(false)
    }

    const handleCancel = () => {
        onCancel?.()
        setOpen(false)
    }

    return (
        <RTLDialog open={open} onOpenChange={setOpen}>
            <RTLDialogTrigger asChild>
                {trigger}
            </RTLDialogTrigger>
            <RTLDialogContent isRTL={isRTL} className="sm:max-w-md">
                <RTLDialogHeader isRTL={isRTL}>
                    <RTLDialogTitle>{title}</RTLDialogTitle>
                    <RTLDialogDescription>
                        {description}
                    </RTLDialogDescription>
                </RTLDialogHeader>
                <RTLDialogFooter >
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleCancel}
                        disabled={isLoading}
                    >
                        {cancelText || t('common.cancel')}
                    </Button>
                    <Button
                        type="button"
                        variant={confirmVariant}
                        onClick={handleConfirm}
                        disabled={isLoading}
                        className={cn(confirmClassName)}
                    >
                        {isLoading ? t('common.loading') : confirmText}
                    </Button>
                </RTLDialogFooter>
            </RTLDialogContent>
        </RTLDialog>
    )
}

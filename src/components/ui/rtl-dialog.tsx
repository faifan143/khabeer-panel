"use client"

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

interface RTLDialogProps {
    children: React.ReactNode
    isRTL?: boolean
}

const RTLDialog = DialogPrimitive.Root

const RTLDialogTrigger = DialogPrimitive.Trigger

const RTLDialogPortal = DialogPrimitive.Portal

const RTLDialogClose = DialogPrimitive.Close

const RTLDialogOverlay = React.forwardRef<
    React.ElementRef<typeof DialogPrimitive.Overlay>,
    React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay> & { isRTL?: boolean }
>(({ className, isRTL, ...props }, ref) => (
    <DialogPrimitive.Overlay
        ref={ref}
        className={cn(
            "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            className
        )}
        {...props}
    />
))
RTLDialogOverlay.displayName = DialogPrimitive.Overlay.displayName

const RTLDialogContent = React.forwardRef<
    React.ElementRef<typeof DialogPrimitive.Content>,
    React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & { isRTL?: boolean }
>(({ className, children, isRTL, ...props }, ref) => (
    <RTLDialogPortal>
        <RTLDialogOverlay isRTL={isRTL} />
        <DialogPrimitive.Content
            ref={ref}
            className={cn(
                "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
                isRTL && "rtl",
                className
            )}
            dir={isRTL ? "rtl" : "ltr"}
            {...props}
        >
            {children}
            <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
            </DialogPrimitive.Close>
        </DialogPrimitive.Content>
    </RTLDialogPortal>
))
RTLDialogContent.displayName = DialogPrimitive.Content.displayName

const RTLDialogHeader = ({
    className,
    isRTL,
    ...props
}: React.HTMLAttributes<HTMLDivElement> & { isRTL?: boolean }) => (
    <div
        className={cn(
            "flex flex-col space-y-1.5 text-center sm:text-left",
            isRTL && "sm:text-right",
            className
        )}
        {...props}
    />
)
RTLDialogHeader.displayName = "RTLDialogHeader"

const RTLDialogFooter = ({
    className,
    isRTL,
    ...props
}: React.HTMLAttributes<HTMLDivElement> & { isRTL?: boolean }) => (
    <div
        className={cn(
            "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
            isRTL && "sm:flex-row-reverse sm:space-x-reverse",
            className
        )}
        {...props}
    />
)
RTLDialogFooter.displayName = "RTLDialogFooter"

const RTLDialogTitle = React.forwardRef<
    React.ElementRef<typeof DialogPrimitive.Title>,
    React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
    <DialogPrimitive.Title
        ref={ref}
        className={cn(
            "text-lg font-semibold leading-none tracking-tight",
            className
        )}
        {...props}
    />
))
RTLDialogTitle.displayName = DialogPrimitive.Title.displayName

const RTLDialogDescription = React.forwardRef<
    React.ElementRef<typeof DialogPrimitive.Description>,
    React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
    <DialogPrimitive.Description
        ref={ref}
        className={cn("text-sm text-muted-foreground", className)}
        {...props}
    />
))
RTLDialogDescription.displayName = DialogPrimitive.Description.displayName

export {
    RTLDialog,
    RTLDialogTrigger,
    RTLDialogContent,
    RTLDialogHeader,
    RTLDialogFooter,
    RTLDialogTitle,
    RTLDialogDescription,
    RTLDialogClose,
}

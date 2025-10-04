"use client";

import * as React from "react";
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

interface RTLAlertDialogProps {
  children: React.ReactNode;
  isRTL?: boolean;
}

const RTLAlertDialog = AlertDialogPrimitive.Root;

const RTLAlertDialogTrigger = AlertDialogPrimitive.Trigger;

const RTLAlertDialogPortal = AlertDialogPrimitive.Portal;

const RTLAlertDialogOverlay = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Overlay> & {
    isRTL?: boolean;
  }
>(({ className, isRTL, ...props }, ref) => (
  <AlertDialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50",
      className
    )}
    {...props}
  />
));
RTLAlertDialogOverlay.displayName = AlertDialogPrimitive.Overlay.displayName;

const RTLAlertDialogContent = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Content> & {
    isRTL?: boolean;
  }
>(({ className, children, isRTL, ...props }, ref) => (
  <RTLAlertDialogPortal>
    <RTLAlertDialogOverlay isRTL={isRTL} />
    <AlertDialogPrimitive.Content
      ref={ref}
      className={cn(
        "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200 sm:max-w-lg",
        isRTL && "rtl",
        className
      )}
      dir={isRTL ? "rtl" : "ltr"}
      {...props}
    >
      {children}
    </AlertDialogPrimitive.Content>
  </RTLAlertDialogPortal>
));
RTLAlertDialogContent.displayName = AlertDialogPrimitive.Content.displayName;

const RTLAlertDialogHeader = ({
  className,
  isRTL,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { isRTL?: boolean }) => (
  <div
    className={cn(
      "flex flex-col gap-2 text-center sm:text-left",
      isRTL && "sm:text-right",
      className
    )}
    {...props}
  />
);
RTLAlertDialogHeader.displayName = "RTLAlertDialogHeader";

const RTLAlertDialogFooter = ({
  className,
  isRTL,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { isRTL?: boolean }) => (
  <div
    className={cn(
      "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
      isRTL && "sm:flex-row-reverse",
      className
    )}
    {...props}
  />
);
RTLAlertDialogFooter.displayName = "RTLAlertDialogFooter";

const RTLAlertDialogTitle = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Title
    ref={ref}
    className={cn("text-lg font-semibold", className)}
    {...props}
  />
));
RTLAlertDialogTitle.displayName = AlertDialogPrimitive.Title.displayName;

const RTLAlertDialogDescription = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Description
    ref={ref}
    className={cn("text-muted-foreground text-sm", className)}
    {...props}
  />
));
RTLAlertDialogDescription.displayName =
  AlertDialogPrimitive.Description.displayName;

const RTLAlertDialogAction = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Action>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Action>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Action
    ref={ref}
    className={cn(buttonVariants(), className)}
    {...props}
  />
));
RTLAlertDialogAction.displayName = AlertDialogPrimitive.Action.displayName;

const RTLAlertDialogCancel = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Cancel>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Cancel>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Cancel
    ref={ref}
    className={cn(buttonVariants({ variant: "outline" }), className)}
    {...props}
  />
));
RTLAlertDialogCancel.displayName = AlertDialogPrimitive.Cancel.displayName;

export {
  RTLAlertDialog,
  RTLAlertDialogTrigger,
  RTLAlertDialogContent,
  RTLAlertDialogHeader,
  RTLAlertDialogFooter,
  RTLAlertDialogTitle,
  RTLAlertDialogDescription,
  RTLAlertDialogAction,
  RTLAlertDialogCancel,
};

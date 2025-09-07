"use client"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useLanguage } from "@/lib/hooks/useLanguage"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@radix-ui/react-scroll-area"
import {
    Bell,
    Building2,
    CheckCircle,
    FileText,
    Home,
    Menu,
    Package,
    Settings,
    Star,
    Users
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import * as React from "react"
import { useTranslation } from "react-i18next"
import { MobileSidebar } from "./MobileSidebar"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
    isCollapsed?: boolean
    onCollapse?: (collapsed: boolean) => void
}

export function Sidebar({ isCollapsed, onCollapse, className }: SidebarProps) {
    const { t } = useTranslation()
    const { isRTL } = useLanguage()
    const navigationItems = [
        {
            title: t('navigation.dashboard'),
            href: "/dashboard",
            icon: Home,
            description: t('dashboard.subtitle')
        },
        {
            title: t('navigation.categoriesServices'),
            href: "/categories-services",
            icon: Building2,
            description: t('categories.subtitle')
        },
        {
            title: t('navigation.ordersManagement'),
            href: "/orders",
            icon: Package,
            description: t('orders.subtitle')
        },
        {
            title: t('navigation.providerVerification'),
            href: "/provider-verification",
            icon: CheckCircle,
            description: t('providers.subtitle')
        },
        {
            title: t('navigation.usersManagement'),
            href: "/users",
            icon: Users,
            description: t('users.subtitle')
        },
        {
            title: t('navigation.invoiceManagement'),
            href: "/invoices",
            icon: FileText,
            description: t('invoices.subtitle')
        },
        {
            title: t('navigation.ratingsReviews'),
            href: "/ratings",
            icon: Star,
            description: t('ratings.subtitle')
        },
        {
            title: t('navigation.notifications'),
            href: "/notifications",
            icon: Bell,
            description: t('notifications.subtitle')
        },
        {
            title: t('navigation.settings'),
            href: "/settings",
            icon: Settings,
            description: t('settings.subtitle')
        }
    ]

    const pathname = usePathname()
    const [isMobileOpen, setIsMobileOpen] = React.useState(false)

    return (
        <>
            {/* Mobile Sidebar */}
            <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
                <SheetTrigger asChild>
                    <Button
                        variant="ghost"
                        className="mx-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
                    >
                        <Menu className="h-6 w-6" />
                        <span className="sr-only">Toggle sidebar</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side={isRTL ? "right" : "left"}>
                    <MobileSidebar onLinkClick={() => setIsMobileOpen(false)} onLogoClick={() => setIsMobileOpen(false)} navigationItems={navigationItems} />
                </SheetContent>
            </Sheet>

            {/* Desktop Sidebar */}
            <div
                className={cn(
                    "hidden md:flex md:flex-col md:fixed md:inset-y-0 md:z-50",
                    isCollapsed ? "md:w-16" : "md:w-64",
                    className
                )}
            >
                <div className="flex flex-col flex-grow bg-gradient-to-b from-slate-800 to-slate-900 border-r border-slate-700">
                    {/* Header */}
                    <div className="flex items-center justify-between h-16 px-4 border-b border-slate-700">
                        {!isCollapsed && (
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => onCollapse?.(!isCollapsed)}
                                    className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center hover:bg-red-600 transition-colors cursor-pointer"
                                >
                                    <Image
                                        src="/khabir-logo.png"
                                        alt="Khabir Logo"
                                        width={20}
                                        height={20}
                                        className="w-5 h-5 brightness-0 invert"
                                    />
                                </button>
                                <span className="text-white font-semibold text-lg">{t("khabeer.name")}</span>
                            </div>
                        )}
                        {isCollapsed && (
                            <button
                                onClick={() => onCollapse?.(!isCollapsed)}
                                className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center mx-auto flex-shrink-0 hover:bg-red-600 transition-colors cursor-pointer"
                            >
                                <Image
                                    src="/khabir-logo.png"
                                    alt="Khabir Logo"
                                    width={20}
                                    height={20}
                                    className="w-5 h-5 brightness-0 invert"
                                />
                            </button>
                        )}
                    </div>

                    {/* Navigation */}
                    <ScrollArea className="flex-1 px-3 py-4 ">
                        <nav className="space-y-2">
                            {navigationItems.map((item) => {
                                const isActive = pathname === item.href
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={cn(
                                            "group flex rtl:flex-row-reverse items-center rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                                            isActive
                                                ? "bg-red-500 text-white shadow-lg"
                                                : "text-slate-300 hover:bg-slate-700 hover:text-white",
                                            isCollapsed && "justify-center"
                                        )}
                                    >
                                        <item.icon className={cn(
                                            "h-5 w-5 transition-colors",
                                            isActive ? "text-white" : "text-slate-400 group-hover:text-white",
                                            isCollapsed ? "mx-0" : "mx-3"
                                        )} />
                                        {!isCollapsed && (
                                            <span className="truncate">{item.title}</span>
                                        )}
                                        {isCollapsed && (
                                            <span className="sr-only">{item.title}</span>
                                        )}
                                    </Link>
                                )
                            })}
                        </nav>
                    </ScrollArea>

                    {/* Footer */}
                    {!isCollapsed && (
                        <div className="p-4 border-t border-slate-700">
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center">
                                    <span className="text-white text-sm font-medium">A</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-white truncate">{t('user.adminUser')}</p>
                                    <p className="text-xs text-slate-400 truncate">admin@khabeer.com</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}

"use client"

import * as React from "react"
import { Sidebar } from "./sidebar"
import { useAuthStore } from "@/lib/stores/auth.store"
import { useLogout } from "@/lib/api/hooks/useAuth"
import { ChevronDown, ChevronUp, LogOut } from "lucide-react"
import { usePathname } from "next/navigation"
import { useTranslation } from "react-i18next"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { LanguageToggle } from "@/components/ui/language-toggle"


interface AdminLayoutProps {
    children: React.ReactNode
}

export function AdminLayout({ children }: AdminLayoutProps) {
    const [isCollapsed, setIsCollapsed] = React.useState(false)
    const { user } = useAuthStore()
    const logoutMutation = useLogout()
    const pathname = usePathname()
    const { t, i18n } = useTranslation()
    const [isDropdownOpen, setIsDropdownOpen] = React.useState(false)
    // Force re-render when language changes
    React.useEffect(() => {
        console.log('Language changed to:', i18n.language)
        // This will trigger a re-render when i18n.language changes
    }, [i18n.language])


    const handleLogout = async () => {
        await logoutMutation.mutateAsync()
    }

    // Get user display name - backend only returns email, so use email prefix as name
    const getUserDisplayName = () => {
        if (!user?.email) return t('user.adminUser')
        return user.email.split('@')[0] || t('user.adminUser')
    }

    // Get user initials for avatar
    const getUserInitials = () => {
        if (!user?.email) return "A"
        const name = getUserDisplayName()
        return name.charAt(0).toUpperCase()
    }

    // Get page title and subtitle based on current path
    const getPageInfo = () => {
        const path = pathname.split('/').filter(Boolean)

        if (path.length === 0 || path[0] === 'dashboard') {
            return {
                title: t('dashboard.title'),
                subtitle: t('dashboard.subtitle')
            }
        }

        const pageMap: Record<string, { title: string; subtitle: string }> = {
            'orders': {
                title: t('orders.title'),
                subtitle: t('orders.subtitle')
            },
            'users': {
                title: t('users.title'),
                subtitle: t('users.subtitle')
            },
            'categories-services': {
                title: t('categories.title'),
                subtitle: t('categories.subtitle')
            },
            'provider-verification': {
                title: t('providers.title'),
                subtitle: t('providers.subtitle')
            },
            'income': {
                title: t('income.title'),
                subtitle: t('income.subtitle')
            },
            'invoices': {
                title: t('invoices.title'),
                subtitle: t('invoices.subtitle')
            },
            'ratings': {
                title: t('ratings.title'),
                subtitle: t('ratings.subtitle')
            },
            'notifications': {
                title: t('notifications.title'),
                subtitle: t('notifications.subtitle')
            },
            'settings': {
                title: t('settings.title'),
                subtitle: t('settings.subtitle')
            }
        }

        return pageMap[path[0]] || {
            title: t('dashboard.title'),
            subtitle: t('dashboard.subtitle')
        }
    }

    const pageInfo = getPageInfo()

    return (
        <div
            key={`layout-${i18n.language}`}
            className="min-h-screen bg-slate-50"
            dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}
        >
            <Sidebar isCollapsed={isCollapsed} onCollapse={setIsCollapsed} />

            {/* Main Content Area */}
            <div
                className={cn(
                    "transition-all duration-300 ease-in-out",
                    isCollapsed
                        ? (i18n.language === 'ar' ? "md:mr-16" : "md:ml-16")
                        : (i18n.language === 'ar' ? "md:mr-64" : "md:ml-64")
                )}
            >
                {/* Enhanced Functional Header */}
                <header
                    key={`header-${i18n.language}`}
                    className="sticky top-0 z-40 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 shadow-sm"
                >
                    <div
                        className={`flex h-16 items-center justify-between px-6 ${i18n.language === 'ar' ? 'rtl ' : 'ltr'}`}
                        style={{ direction: i18n.language === 'ar' ? 'rtl' : 'ltr' }}
                    >
                        {/* Page Info - Will be on right for RTL due to flex-row-reverse */}
                        <div className="flex items-center">
                            {/* Page Title and Subtitle */}
                            <div className={`flex flex-col ${i18n.language === 'ar' ? 'text-right' : 'text-left'}`}>
                                <h1 className="text-lg font-semibold text-foreground">{pageInfo.title}</h1>
                                <p className="text-sm text-muted-foreground">{pageInfo.subtitle}</p>
                            </div>
                        </div>

                        {/* User Menu - Will be on left for RTL due to flex-row-reverse */}
                        <div className={`flex items-center ${i18n.language === 'ar' ? ' space-x-3' : 'space-x-3'}`}>
                            {/* User Info */}
                            <div className={`hidden md:flex items-center ${i18n.language === 'ar' ? ' space-x-3' : 'space-x-3'}`}>
                                <div className={`${i18n.language === 'ar' ? 'text-right' : 'text-left'} ${i18n.language === 'ar' ? 'rtl' : 'ltr'}`}>
                                    <p className="text-sm font-semibold text-foreground">{getUserDisplayName()}</p>
                                    <p className="text-xs text-muted-foreground">{user?.email || "admin@khabeer.com"}</p>
                                </div>
                                <Separator orientation="vertical" className="h-6" />
                            </div>

                            {/* Enhanced User Dropdown */}
                            <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
                                <DropdownMenuTrigger asChild>
                                    <button className={`flex items-center rounded-full p-2 hover:bg-accent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${i18n.language === 'ar' ? ' ' : 'space-x-2'}`}>
                                        <Avatar className="h-8 w-8">
                                            <AvatarFallback className="bg-red-500 text-white font-semibold">
                                                {getUserInitials()}
                                            </AvatarFallback>
                                        </Avatar>
                                        {isDropdownOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    align={i18n.language === 'ar' ? 'start' : 'end'}
                                    className={`w-64 p-2 ${i18n.language === 'ar' ? 'rtl' : 'ltr'}`}
                                >
                                    <DropdownMenuLabel className="p-3">
                                        <div className={`flex flex-col space-y-1 ${i18n.language === 'ar' ? 'text-right' : 'text-left'}`}>
                                            <p className="text-sm font-semibold leading-none text-foreground">{getUserDisplayName()}</p>
                                            <p className="text-xs leading-none text-muted-foreground">{user?.email || "admin@khabeer.com"}</p>
                                            <Badge variant="outline" className={`w-fit mt-2 text-xs ${i18n.language === 'ar' ? 'self-end' : 'self-start'}`}>
                                                {t('users.admin')}
                                            </Badge>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />

                                    {/* Language Toggle */}
                                    <div className="p-3">
                                        <div className={`flex items-center justify-between ${i18n.language === 'ar' ? ' ' : ''}`}>
                                            <span className={`text-sm text-muted-foreground ${i18n.language === 'ar' ? 'text-right' : 'text-left'}`}>{t('language.language')}</span>
                                            <LanguageToggle />
                                        </div>
                                    </div>

                                    <DropdownMenuSeparator />
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="p-3 cursor-pointer hover:bg-accent">
                                                <div className={`flex items-center ${i18n.language === 'ar' ? ' ' : 'space-x-3'}`}>
                                                    <LogOut className="h-4 w-4" />
                                                    <div className={`flex flex-col ${i18n.language === 'ar' ? 'text-right' : 'text-left'}`}>
                                                        <span className="text-sm font-medium">{t('common.logout')}</span>
                                                        <span className="text-xs text-muted-foreground">{t('user.signOut')}</span>
                                                    </div>
                                                </div>
                                            </DropdownMenuItem>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>{t('user.confirmLogout')}</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    {t('user.logoutMessage')}
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                                                <AlertDialogAction
                                                    onClick={handleLogout}
                                                    className="bg-red-500 hover:bg-red-600 text-white"
                                                >
                                                    {t('common.logout')}
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </header >

                {/* Page Content */}
                < main className="flex-1" >
                    <div className="container mx-auto p-6">
                        {children}
                    </div>
                </ main >
            </div >
        </div >
    )
}

function cn(...classes: (string | undefined | null | false)[]): string {
    return classes.filter(Boolean).join(" ")
} 
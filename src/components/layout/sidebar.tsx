"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
    Home,
    Package,
    Calendar,
    CheckCircle,
    Users,
    DollarSign,
    Star,
    Bell,
    Settings,
    ChevronLeft,
    Menu,
    Building2,
    FileText
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ScrollArea } from "@radix-ui/react-scroll-area"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
    isCollapsed?: boolean
    onCollapse?: (collapsed: boolean) => void
}

const navigationItems = [
    {
        title: "Dashboard",
        href: "/dashboard",
        icon: Home,
        description: "Overview and analytics"
    },
    {
        title: "Categories & Services",
        href: "/categories-services",
        icon: Building2,
        description: "Manage services and categories"
    },
    {
        title: "Orders Management",
        href: "/orders",
        icon: Package,
        description: "All orders and tracking"
    },
    // {
    //     title: "Daily Orders",
    //     href: "/daily-orders",
    //     icon: Calendar,
    //     description: "Today's orders and real-time tracking"
    // },
    {
        title: "Provider Verification",
        href: "/provider-verification",
        icon: CheckCircle,
        description: "Verify and approve providers"
    },
    {
        title: "Users Management",
        href: "/users",
        icon: Users,
        description: "Manage user accounts"
    },
    {
        title: "Income & Finance",
        href: "/income",
        icon: DollarSign,
        description: "Revenue, commissions, and financial reports"
    },
    {
        title: "Ratings & Reviews",
        href: "/ratings",
        icon: Star,
        description: "Provider and service ratings"
    },
    {
        title: "Notifications",
        href: "/notifications",
        icon: Bell,
        description: "System notifications and alerts"
    },
    {
        title: "Settings",
        href: "/settings",
        icon: Settings,
        description: "Platform configuration"
    }
]

export function Sidebar({ className, isCollapsed = false, onCollapse }: SidebarProps) {
    const pathname = usePathname()
    const [isMobileOpen, setIsMobileOpen] = React.useState(false)

    return (
        <>
            {/* Mobile Sidebar */}
            <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
                <SheetTrigger asChild>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="mr-2 px-2 text-base hover:bg-accent focus-visible:bg-accent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
                    >
                        <Menu className="h-5 w-5" />
                        <span className="sr-only">Toggle sidebar</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-80 max-w-[85vw] border-r-0">
                    <div className="h-full overflow-y-auto">
                        <MobileSidebar onLinkClick={() => setIsMobileOpen(false)} onLogoClick={() => setIsMobileOpen(false)} />
                    </div>
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
                <div className="flex flex-col flex-grow bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-r border-slate-700/50 shadow-2xl">
                    {/* Enhanced Header */}
                    <div className="flex items-center justify-between h-16 px-4 border-b border-slate-700/50 bg-slate-800/50 backdrop-blur-sm">
                        {!isCollapsed && (
                            <div className="flex items-center space-x-3">
                                <button
                                    onClick={() => onCollapse?.(!isCollapsed)}
                                    className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center hover:shadow-lg transition-all duration-200 hover:scale-105 cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500/50"
                                >
                                    <span className="text-white font-bold text-lg">K</span>
                                </button>
                                <div className="flex flex-col">
                                    <span className="text-white font-bold text-lg leading-tight">Khabeer</span>
                                    <span className="text-slate-400 text-xs">Admin Panel</span>
                                </div>
                            </div>
                        )}
                        {isCollapsed && (
                            <button
                                onClick={() => onCollapse?.(!isCollapsed)}
                                className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center mx-auto flex-shrink-0 hover:shadow-lg transition-all duration-200 hover:scale-105 cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500/50"
                            >
                                <span className="text-white font-bold text-lg leading-none">K</span>
                            </button>
                        )}
                    </div>

                    {/* Enhanced Navigation */}
                    <ScrollArea className="flex-1 px-3 py-4">
                        <nav className="space-y-2">
                            {navigationItems.map((item) => {
                                const isActive = pathname === item.href
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={cn(
                                            "group flex items-center rounded-xl px-3 py-3 text-sm font-medium transition-all duration-300 relative overflow-hidden",
                                            isActive
                                                ? "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/25"
                                                : "text-slate-300 hover:bg-slate-700/50 hover:text-white hover:shadow-md",
                                            isCollapsed && "justify-center"
                                        )}
                                    >
                                        {/* Active indicator */}
                                        {isActive && (
                                            <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-red-600/20 rounded-xl" />
                                        )}

                                        <div className="relative z-10 flex items-center w-full">
                                            <div className={cn(
                                                "p-2 rounded-lg transition-all duration-200",
                                                isActive
                                                    ? "bg-white/20 text-white"
                                                    : "bg-slate-700/50 text-slate-400 group-hover:bg-slate-600/50 group-hover:text-white",
                                                isCollapsed ? "mr-0" : "mr-3"
                                            )}>
                                                <item.icon className="h-5 w-5" />
                                            </div>
                                            {!isCollapsed && (
                                                <div className="flex-1">
                                                    <span className="block font-semibold truncate">{item.title}</span>
                                                    <span className={cn(
                                                        "text-xs mt-0.5 block transition-colors truncate",
                                                        isActive
                                                            ? "text-white/80"
                                                            : "text-slate-400 group-hover:text-slate-300"
                                                    )}>
                                                        {item.description}
                                                    </span>
                                                </div>
                                            )}
                                            {isActive && !isCollapsed && (
                                                <div className="w-2 h-2 bg-white rounded-full ml-auto" />
                                            )}
                                        </div>
                                        {isCollapsed && (
                                            <span className="sr-only">{item.title}</span>
                                        )}
                                    </Link>
                                )
                            })}
                        </nav>
                    </ScrollArea>

                    {/* Enhanced Footer */}
                    {!isCollapsed && (
                        <div className="p-4 border-t border-slate-700/50 bg-slate-800/30 backdrop-blur-sm">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-slate-600 to-slate-700 rounded-xl flex items-center justify-center shadow-lg">
                                    <span className="text-white font-semibold text-sm">A</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-white truncate">Admin User</p>
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

function MobileSidebar({ onLinkClick, onLogoClick }: { onLinkClick: () => void, onLogoClick: () => void }) {
    const pathname = usePathname()

    return (
        <div className="flex flex-col min-h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-2xl">
            {/* Enhanced Mobile Header */}
            <div className="flex items-center justify-between h-16 px-6 border-b border-slate-700/50 bg-slate-800/50 backdrop-blur-sm flex-shrink-0">
                <div className="flex items-center space-x-3">
                    <button
                        onClick={onLogoClick}
                        className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center cursor-pointer shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-500/50"
                        title="Close sidebar"
                    >
                        <span className="text-white font-bold text-lg">K</span>
                    </button>
                    <div className="flex flex-col">
                        <span className="text-white font-bold text-lg leading-tight">Khabeer</span>
                        <span className="text-slate-400 text-xs">Admin Panel</span>
                    </div>
                </div>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            </div>

            {/* Enhanced Mobile Navigation */}
            <div className="flex-1 overflow-y-auto">
                <div className="px-4 py-6">
                    <nav className="space-y-3">
                        {navigationItems.map((item) => {
                            const isActive = pathname === item.href
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={onLinkClick}
                                    className={cn(
                                        "group flex items-center rounded-xl px-4 py-4 text-sm font-medium transition-all duration-300 relative overflow-hidden",
                                        isActive
                                            ? "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/25"
                                            : "text-slate-300 hover:bg-slate-700/50 hover:text-white hover:shadow-md"
                                    )}
                                >
                                    {/* Active indicator */}
                                    {isActive && (
                                        <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-red-600/20 rounded-xl" />
                                    )}

                                    <div className="relative z-10 flex items-center w-full">
                                        <div className={cn(
                                            "p-2 rounded-lg transition-all duration-200",
                                            isActive
                                                ? "bg-white/20 text-white"
                                                : "bg-slate-700/50 text-slate-400 group-hover:bg-slate-600/50 group-hover:text-white"
                                        )}>
                                            <item.icon className="h-5 w-5" />
                                        </div>
                                        <div className="flex-1 ml-4">
                                            <span className="block font-semibold">{item.title}</span>
                                            <span className={cn(
                                                "text-xs mt-0.5 block transition-colors",
                                                isActive
                                                    ? "text-white/80"
                                                    : "text-slate-400 group-hover:text-slate-300"
                                            )}>
                                                {item.description}
                                            </span>
                                        </div>
                                        {isActive && (
                                            <div className="w-2 h-2 bg-white rounded-full ml-auto" />
                                        )}
                                    </div>
                                </Link>
                            )
                        })}
                    </nav>
                </div>
            </div>

            {/* Enhanced Mobile Footer */}
            <div className="p-6 border-t border-slate-700/50 bg-slate-800/30 backdrop-blur-sm flex-shrink-0">
                <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-slate-600 to-slate-700 rounded-xl flex items-center justify-center shadow-lg">
                        <span className="text-white font-semibold text-sm">A</span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white truncate">Admin User</p>
                        <p className="text-xs text-slate-400 truncate">admin@khabeer.com</p>
                    </div>
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                </div>
            </div>
        </div>
    )
} 
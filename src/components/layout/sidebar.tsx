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
import { MobileSidebar } from "./MobileSidebar"

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
        title: "Invoice Management",
        href: "/invoices",
        icon: FileText,
        description: "Manage payments and invoices"
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
                        className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
                    >
                        <Menu className="h-6 w-6" />
                        <span className="sr-only">Toggle sidebar</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="left">
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
                                    <span className="text-white font-bold text-sm">K</span>
                                </button>
                                <span className="text-white font-semibold text-lg">Khabeer</span>
                            </div>
                        )}
                        {isCollapsed && (
                            <button
                                onClick={() => onCollapse?.(!isCollapsed)}
                                className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center mx-auto flex-shrink-0 hover:bg-red-600 transition-colors cursor-pointer"
                            >
                                <span className="text-white font-bold text-sm leading-none">K</span>
                            </button>
                        )}
                    </div>

                    {/* Navigation */}
                    <ScrollArea className="flex-1 px-3 py-4">
                        <nav className="space-y-2">
                            {navigationItems.map((item) => {
                                const isActive = pathname === item.href
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={cn(
                                            "group flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                                            isActive
                                                ? "bg-red-500 text-white shadow-lg"
                                                : "text-slate-300 hover:bg-slate-700 hover:text-white",
                                            isCollapsed && "justify-center"
                                        )}
                                    >
                                        <item.icon className={cn(
                                            "h-5 w-5 transition-colors",
                                            isActive ? "text-white" : "text-slate-400 group-hover:text-white",
                                            isCollapsed ? "mr-0" : "mr-3"
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
                                    <p className="text-sm font-medium text-white truncate">Admin User</p>
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

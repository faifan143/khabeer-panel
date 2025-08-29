"use client"

import * as React from "react"
import { Sidebar } from "./sidebar"
import { useAuthStore } from "@/lib/stores/auth.store"
import { useLogout } from "@/lib/api/hooks/useAuth"
import { LogOut, User, Settings } from "lucide-react"
import { usePathname } from "next/navigation"
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


interface AdminLayoutProps {
    children: React.ReactNode
}

export function AdminLayout({ children }: AdminLayoutProps) {
    const [isCollapsed, setIsCollapsed] = React.useState(false)
    const { user, logout } = useAuthStore()
    const logoutMutation = useLogout()
    const pathname = usePathname()


    const handleLogout = async () => {
        await logoutMutation.mutateAsync()
    }

    // Get user display name - backend only returns email, so use email prefix as name
    const getUserDisplayName = () => {
        if (!user?.email) return "Admin User"
        return user.email.split('@')[0] || "Admin User"
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
                title: "Dashboard",
                subtitle: "Platform overview and analytics"
            }
        }

        const pageMap: Record<string, { title: string; subtitle: string }> = {
            'orders': {
                title: "Orders Management",
                subtitle: "Monitor and manage all orders"
            },
            'users': {
                title: "Users Management",
                subtitle: "Manage user accounts and permissions"
            },
            'categories-services': {
                title: "Categories & Services",
                subtitle: "Manage service categories and offerings"
            },
            'provider-verification': {
                title: "Provider Verification",
                subtitle: "Review and approve provider applications"
            },
            'income': {
                title: "Income & Finance",
                subtitle: "Track revenue and financial metrics"
            },
            'invoices': {
                title: "Invoice Management",
                subtitle: "Manage payments and invoices for completed orders"
            },
            'ratings': {
                title: "Ratings & Reviews",
                subtitle: "Monitor customer feedback and ratings"
            },
            'notifications': {
                title: "Notifications",
                subtitle: "Manage system notifications and alerts"
            },
            'settings': {
                title: "Settings",
                subtitle: "Configure platform settings and preferences"
            }
        }

        return pageMap[path[0]] || {
            title: "Dashboard",
            subtitle: "Platform overview and analytics"
        }
    }

    const pageInfo = getPageInfo()

    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar isCollapsed={isCollapsed} onCollapse={setIsCollapsed} />

            {/* Main Content Area */}
            <div
                className={cn(
                    "transition-all duration-300 ease-in-out",
                    isCollapsed ? "md:ml-16" : "md:ml-64"
                )}
            >
                {/* Enhanced Functional Header */}
                <header className="sticky top-0 z-40 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 shadow-sm">
                    <div className="flex h-16 items-center justify-between px-6">
                        {/* Left side - Page Info Only */}
                        <div className="flex items-center">
                            {/* Page Title and Subtitle */}
                            <div className="flex flex-col">
                                <h1 className="text-lg font-semibold text-foreground">{pageInfo.title}</h1>
                                <p className="text-sm text-muted-foreground">{pageInfo.subtitle}</p>
                            </div>
                        </div>



                        {/* Right side - User Menu Only */}
                        <div className="flex items-center space-x-3">
                            {/* User Info */}
                            <div className="hidden md:flex items-center space-x-3">
                                <div className="text-right">
                                    <p className="text-sm font-semibold text-foreground">{getUserDisplayName()}</p>
                                    <p className="text-xs text-muted-foreground">{user?.email || "admin@khabeer.com"}</p>
                                </div>
                                <Separator orientation="vertical" className="h-6" />
                            </div>

                            {/* Enhanced User Dropdown */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="flex items-center space-x-2 rounded-full p-2 hover:bg-accent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                                        <Avatar className="h-8 w-8">
                                            <AvatarFallback className="bg-red-500 text-white font-semibold">
                                                {getUserInitials()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <svg
                                            className="h-4 w-4 text-muted-foreground transition-transform duration-200"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-64 p-2">
                                    <DropdownMenuLabel className="p-3">
                                        <div className="flex flex-col space-y-1">
                                            <p className="text-sm font-semibold leading-none text-foreground">{getUserDisplayName()}</p>
                                            <p className="text-xs leading-none text-muted-foreground">{user?.email || "admin@khabeer.com"}</p>
                                            <Badge variant="outline" className="w-fit mt-2 text-xs">
                                                Administrator
                                            </Badge>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    {/* <DropdownMenuItem className="p-3 cursor-pointer hover:bg-accent">
                                        <User className="mr-3 h-4 w-4" />
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium">Profile</span>
                                            <span className="text-xs text-muted-foreground">Manage your account</span>
                                        </div>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="p-3 cursor-pointer hover:bg-accent">
                                        <Settings className="mr-3 h-4 w-4" />
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium">Settings</span>
                                            <span className="text-xs text-muted-foreground">Configure preferences</span>
                                        </div>
                                    </DropdownMenuItem> 
                                    <DropdownMenuSeparator />
                                    */}
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="p-3 cursor-pointer hover:bg-accent">
                                                <LogOut className="mr-3 h-4 w-4" />
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium">Logout</span>
                                                    <span className="text-xs text-muted-foreground">Sign out of your account</span>
                                                </div>
                                            </DropdownMenuItem>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Confirm Logout</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Are you sure you want to logout? You will need to sign in again to access the admin panel.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction
                                                    onClick={handleLogout}
                                                    className="bg-red-500 hover:bg-red-600 text-white"
                                                >
                                                    Logout
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1">
                    <div className="container mx-auto p-6">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}

function cn(...classes: (string | undefined | null | false)[]): string {
    return classes.filter(Boolean).join(" ")
} 
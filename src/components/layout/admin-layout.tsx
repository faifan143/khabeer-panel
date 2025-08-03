"use client"

import * as React from "react"
import { Sidebar } from "./sidebar"

interface AdminLayoutProps {
    children: React.ReactNode
}

export function AdminLayout({ children }: AdminLayoutProps) {
    const [isCollapsed, setIsCollapsed] = React.useState(false)

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
                {/* Top Header */}
                <header className="sticky top-0 z-40 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
                    <div className="container flex h-16 items-center">
                        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
                            <div className="w-full flex-1 md:w-auto md:flex-none">
                                {/* You can add search, breadcrumbs, or other header content here */}
                            </div>
                            <nav className="flex items-center space-x-2">
                                {/* Add header actions like notifications, user menu, etc. */}
                            </nav>
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
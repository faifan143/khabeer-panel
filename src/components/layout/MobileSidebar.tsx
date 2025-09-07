import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { useTranslation } from "react-i18next"

export function MobileSidebar({ onLinkClick, onLogoClick, navigationItems }: { onLinkClick: () => void, onLogoClick: () => void, navigationItems: { href: string, title: string, description: string, icon: React.ElementType }[] }) {
    const pathname = usePathname()
    const { t } = useTranslation()
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
                        <span className="text-white font-bold text-lg">{t("khabeer.name")}</span>
                    </button>
                    <div className="flex flex-col">
                        <span className="text-white font-bold text-lg leading-tight">{t("khabeer.name")}</span>
                        <span className="text-slate-400 text-xs">Admin Panel</span>
                    </div>
                </div>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            </div>

            {/* Enhanced Mobile Navigation */}
            <div className="flex-1 overflow-y-auto no-scrollbar">
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
                                        <div className="flex-1 mx-4">
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
                                            <div className="w-2 h-2 bg-white rounded-full mx-auto" />
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
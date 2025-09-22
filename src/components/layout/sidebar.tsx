"use client";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useLanguage } from "@/lib/hooks/useLanguage";
import { usePermissions } from "@/lib/hooks/usePermissions";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@radix-ui/react-scroll-area";
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
  Users,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { MobileSidebar } from "./MobileSidebar";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  isCollapsed?: boolean;
  onCollapse?: (collapsed: boolean) => void;
}

export function Sidebar({ isCollapsed, onCollapse, className }: SidebarProps) {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const { getFilteredNavigationItems } = usePermissions();

  // Icon mapping for dynamic icon rendering
  const iconMap = {
    Home,
    Building2,
    Package,
    CheckCircle,
    Users,
    FileText,
    Star,
    Bell,
    Settings,
  };

  // Get filtered navigation items based on permissions
  const filteredNavigationItems = getFilteredNavigationItems();

  // Convert to the format expected by the component
  const navigationItems = filteredNavigationItems.map((item) => ({
    title: t(item.titleKey),
    href: item.href,
    icon: iconMap[item.icon as keyof typeof iconMap],
    description: t(item.descriptionKey),
  }));

  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);

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
          <MobileSidebar
            onLinkClick={() => setIsMobileOpen(false)}
            onLogoClick={() => setIsMobileOpen(false)}
            navigationItems={navigationItems}
          />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div
        className={cn(
          "hidden md:flex md:flex-col md:fixed md:inset-y-0 md:z-50",
          isCollapsed ? "md:w-16" : "md:w-64",
          isRTL ? "md:right-0" : "md:left-0",
          className
        )}
      >
        <div
          className={`flex flex-col flex-grow bg-gradient-to-b from-slate-800 to-slate-900 ${
            isRTL ? "border-l" : "border-r"
          } border-slate-700`}
        >
          {/* Header */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-slate-700">
            {!isCollapsed && (
              <div
                className={`flex items-center ${
                  isRTL ? " space-x-reverse" : "flex-row"
                } gap-2`}
              >
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
                <span className="text-white font-semibold text-lg">
                  {t("khabeer.name")}
                </span>
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
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "group flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                      isRTL ? "flex-row-reverse" : "flex-row",
                      isActive
                        ? "bg-red-500 text-white shadow-lg"
                        : "text-slate-300 hover:bg-slate-700 hover:text-white",
                      isCollapsed && "justify-center"
                    )}
                  >
                    <item.icon
                      className={cn(
                        "h-5 w-5 transition-colors",
                        isActive
                          ? "text-white"
                          : "text-slate-400 group-hover:text-white",
                        isCollapsed ? "mx-0" : isRTL ? "ml-3" : "mr-3"
                      )}
                    />
                    {!isCollapsed && (
                      <span className="truncate">{item.title}</span>
                    )}
                    {isCollapsed && (
                      <span className="sr-only">{item.title}</span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </ScrollArea>

          {/* Footer - Removed duplicate user info */}
        </div>
      </div>
    </>
  );
}

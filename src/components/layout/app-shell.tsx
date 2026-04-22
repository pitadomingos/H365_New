
"use client";

import * as React from "react";
import Link from "next/link"; // Still needed for H365 logo link
import { usePathname, useRouter } from "next/navigation"; // useRouter for programmatic navigation
import { Stethoscope, Menu } from "lucide-react";

import { cn } from "@/lib/utils";
import { NAV_ITEMS, BOTTOM_NAV_ITEMS, type NavItem } from "@/lib/constants";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  useSidebar, // Import useSidebar
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LocaleToggle } from "@/components/locale-toggle";
import { useLocale } from '@/context/locale-context';
import { getTranslator } from "@/lib/i18n";
import { motion, AnimatePresence } from "motion/react";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter(); // For navigation
  const { currentLocale } = useLocale();
  const t = getTranslator(currentLocale);
  const currentYear = new Date().getFullYear();

  const { open: sidebarOpen, toggleSidebar } = useSidebar(); // Get state and toggle from context

  return (
    <>
      <Sidebar>
        <SidebarHeader 
          className={cn(
            sidebarOpen ? "p-4" : "p-2 items-center h-[64px] flex-col justify-center"
          )}
        >
          <div className={cn(
            "flex items-center justify-between w-full",
            !sidebarOpen && "flex-col"
          )}>
            <Link
              href="/"
              className={cn(
                "flex items-center gap-2 overflow-hidden",
                !sidebarOpen && "justify-center"
              )}
            >
              <Stethoscope className="h-7 w-7 text-primary shrink-0" />
              <h1 className={cn(
                "text-xl font-semibold whitespace-nowrap",
                !sidebarOpen && "hidden" // Hide text when collapsed
              )}>H365</h1>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7" // Always visible
              onClick={toggleSidebar}
              aria-label="Toggle sidebar"
            >
              <Menu />
            </Button>
          </div>
        </SidebarHeader>
        <SidebarContent 
          className={cn(
            sidebarOpen ? "p-2" : "p-2 items-center"
          )}
        >
          <SidebarMenu>
            {NAV_ITEMS.map((item: NavItem) => (
              <SidebarMenuItem key={item.labelKey}>
                <SidebarMenuButton
                   isActive={pathname === item.href}
                   disabled={item.disabled}
                   className={cn(item.disabled && "cursor-not-allowed opacity-50")}
                   onClick={() => !item.disabled && router.push(item.href)} // Programmatic navigation
                   tooltip={t(item.labelKey)} // Tooltip for collapsed state
                >
                  <item.icon />
                  <span>{t(item.labelKey)}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter 
          className={cn(
            sidebarOpen ? "p-2" : "p-2 items-center"
          )}
        >
           <SidebarMenu>
            {BOTTOM_NAV_ITEMS.map((item: NavItem) => (
              <SidebarMenuItem key={item.labelKey}>
                <SidebarMenuButton
                   isActive={pathname === item.href}
                   disabled={item.disabled}
                   className={cn(item.disabled && "cursor-not-allowed opacity-50")}
                   onClick={() => !item.disabled && router.push(item.href)} // Programmatic navigation
                   tooltip={t(item.labelKey)}
                >
                  <item.icon />
                  <span>{t(item.labelKey)}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 sm:px-6">
          <div className="flex-1">
            {/* Optional: Page title or breadcrumbs */}
          </div>
          <div className="flex items-center gap-4">
            <LocaleToggle />
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="https://placehold.co/100x100.png" alt="User Avatar" data-ai-hint="user avatar" />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">John Doe</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      doctor@h365.example.com
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem disabled>Profile</DropdownMenuItem>
                <DropdownMenuItem disabled>Billing</DropdownMenuItem>
                <DropdownMenuItem disabled>Settings</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem disabled>Log out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4 sm:p-6 bg-muted/40 dark:bg-transparent">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
        <footer className="border-t bg-background p-4 text-center text-xs text-muted-foreground">
          <p>&copy; {currentYear} H365. All rights reserved.</p>
          <p>Version 0.1.0 (Prototype)</p>
        </footer>
      </SidebarInset>
    </>
  );
}

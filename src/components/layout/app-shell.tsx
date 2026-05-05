
"use client";

import * as React from "react";
import Link from "next/link"; // Still needed for H365 logo link
import { usePathname, useRouter } from "next/navigation"; // useRouter for programmatic navigation
import { Stethoscope, Menu } from "lucide-react";

import { cn } from "@/lib/utils";
import { NAV_GROUPS, BOTTOM_NAV_ITEMS, type NavItem } from "@/lib/constants";
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
import { useUser, MOCK_USERS, type UserRole } from '@/context/user-context';
import { getTranslator } from "@/lib/i18n";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle2, ShieldCheck, User as UserIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter(); // For navigation
  const { currentLocale } = useLocale();
  const { user, setUser } = useUser();
  const t = React.useMemo(() => getTranslator(currentLocale), [currentLocale]);
  const currentYear = new Date().getFullYear();

  const handleRoleSwitch = (role: UserRole) => {
    setUser(MOCK_USERS[role]);
  };

  const { open: sidebarOpen, toggleSidebar } = useSidebar(); // Get state and toggle from context
  const isPublicHealthDashboard = pathname === "/public-health-dashboard";

  if (isPublicHealthDashboard) {
    return (
      <main className="flex-1 overflow-auto min-h-svh bg-background">
        <div className="h-full p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    );
  }

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
            {NAV_GROUPS.map((group) => (
              <React.Fragment key={group.titleKey}>
                {sidebarOpen && (
                  <div className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mt-4 first:mt-0">
                    {t(group.titleKey)}
                  </div>
                )}
                {group.items.map((item: NavItem) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <SidebarMenuItem key={item.labelKey}>
                      <SidebarMenuButton
                         asChild
                         isActive={isActive}
                         tooltip={t(item.labelKey)}
                         className={cn(item.disabled && "cursor-not-allowed opacity-50")}
                      >
                        <Link 
                          href={item.disabled ? "#" : item.href} 
                          className="flex items-center w-full gap-2"
                          target={item.forceNewTab ? "_blank" : undefined}
                          rel={item.forceNewTab ? "noopener noreferrer" : undefined}
                        >
                          <Icon className={cn("shrink-0", isActive && "text-primary")} />
                          <span className={cn(!sidebarOpen && "hidden")}>{t(item.labelKey)}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </React.Fragment>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter 
          className={cn(
            sidebarOpen ? "p-2" : "p-2 items-center"
          )}
        >
           <SidebarMenu>
            {BOTTOM_NAV_ITEMS.map((item: NavItem) => {
               const isActive = pathname === item.href;
               const Icon = item.icon;
               return (
                  <SidebarMenuItem key={item.labelKey}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={t(item.labelKey)}
                      className={cn(item.disabled && "cursor-not-allowed opacity-50")}
                    >
                      <Link 
                        href={item.disabled ? "#" : item.href} 
                        className="flex items-center w-full gap-2"
                        target={item.forceNewTab ? "_blank" : undefined}
                        rel={item.forceNewTab ? "noopener noreferrer" : undefined}
                      >
                        <Icon className="shrink-0" />
                        <span className={cn(!sidebarOpen && "hidden")}>{t(item.labelKey)}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
               );
            })}
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
                <Button variant="ghost" className="relative h-10 w-fit px-2 gap-2 rounded-full border border-primary/20">
                  <Avatar className="h-7 w-7">
                    <AvatarImage src="https://placehold.co/100x100.png" alt="User Avatar" data-ai-hint="user avatar" />
                    <AvatarFallback>{user?.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <span className="text-xs font-medium hidden sm:inline-block max-w-[100px] truncate">{user?.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-2">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user?.name}</p>
                      <p className="text-xs leading-none text-muted-foreground mr-2">
                        {user?.email}
                      </p>
                    </div>
                    <Badge variant="secondary" className="w-fit text-[10px] uppercase">
                       <ShieldCheck className="h-3 w-3 mr-1" /> {user?.role.replace('_', ' ')}
                    </Badge>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-xs text-muted-foreground uppercase tracking-wider">Switch Perspective (Demo)</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => handleRoleSwitch('NATIONAL_ADMIN')} className="flex items-center justify-between">
                   <span>National Level</span>
                   {user?.role === 'NATIONAL_ADMIN' && <CheckCircle2 className="h-3 w-3 text-primary" />}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleRoleSwitch('PROVINCIAL_ADMIN')} className="flex items-center justify-between">
                   <span>Provincial Level</span>
                   {user?.role === 'PROVINCIAL_ADMIN' && <CheckCircle2 className="h-3 w-3 text-primary" />}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleRoleSwitch('DISTRICT_ADMIN')} className="flex items-center justify-between">
                   <span>District Level</span>
                   {user?.role === 'DISTRICT_ADMIN' && <CheckCircle2 className="h-3 w-3 text-primary" />}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleRoleSwitch('FACILITY_ADMIN')} className="flex items-center justify-between">
                   <span>Facility Level</span>
                   {user?.role === 'FACILITY_ADMIN' && <CheckCircle2 className="h-3 w-3 text-primary" />}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem disabled>{t('nav.settings')}</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem disabled>{t('nav.logout')}</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4 sm:p-6 bg-muted/40 dark:bg-transparent">
          <AnimatePresence>
            <motion.div
              key={pathname}
              initial={{ opacity: 0, x: 5 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -5 }}
              transition={{ duration: 0.15 }}
              className="h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
        <footer className="border-t bg-background p-4 text-center text-xs text-muted-foreground">
          <p>&copy; {currentYear} H365. {t('footer.rights')}</p>
          <p>{t('footer.version')} 0.1.0 ({t('footer.prototype')})</p>
        </footer>
      </SidebarInset>
    </>
  );
}
